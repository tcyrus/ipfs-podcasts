import APlayer from 'aplayer';
import getIpfs from 'window.ipfs-fallback';
import Hls from 'hls';
import HlsjsIPFSLoader from 'hlsjs-ipfs-loader';

document.addEventListener("DOMContentLoaded", async () => {
  let pHash = window.location.hash.substr(1);
  if (pHash === '') {
    pHash = 'QmSaeHyw62dejXcZU1HBvncCsCHuL6BnNKhbUhhtwkHbrL';
  }

  const ipfs = await getIpfs();

  const index = await ipfs.cat(`${pHash}/index.json`)
                          .then(file => JSON.parse(file.toString('utf8')));

  let lrcStr = Promise.resolve(undefined);
  if (index.hasOwnProperty('lrc')) {
    lrcStr = ipfs.cat(`${pHash}/${index.lrc}`)
                 .then(file => file.toString('utf8'));
  }

  const ap = new APlayer({
    container: document.getElementById('aplayer'),
    lrcType: 1,
    audio: [{
      name: index.name,
      artist: index.author,
      lrc: (await lrcStr),
      url: index.url,
      type: 'customHls'
    }],
    customAudioType: {
      async customHls(audioElement, audio, player) {
        Hls.DefaultConfig.loader = HlsjsIPFSLoader;
        Hls.DefaultConfig.debug = false;

        if (index.hasOwnProperty('hls') && Hls.isSupported()) {
          const hls = new Hls({ ipfs, ipfsHash: pHash });
          hls.loadSource(index.hls);
          hls.attachMedia(audioElement);
        } else {
          const file = ipfs.cat(`${pHash}/${index.url}`)
                           .then(({ buffer }) => new Blob([ buffer ]));
          audioElement.src = URL.createObjectURL(await file);
        }
      }
    }
  });

  if (index.hasOwnProperty('cover')) {
    const file = ipfs.cat(`${pHash}/${index.cover}`)
                     .then(({ buffer }) => new Blob([ buffer ]));
    ap.list.audios[0].cover = URL.createObjectURL(await file);
    ap.template.pic.style.backgroundImage = `url("${ap.list.audios[0].cover}")`;
  }

});
