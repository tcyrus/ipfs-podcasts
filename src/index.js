import APlayer from 'aplayer';
import Hls from 'hls';
import { HlsjsIPFSLoader } from 'hlsjs-ipfs-loader';

import getIpfs from 'window.ipfs-fallback';

document.addEventListener("DOMContentLoaded", async () => {
  let pHash = window.location.hash.substr(1);
  if (pHash === '') {
    pHash = 'QmQKZm97HYd5sRC3M67F2oVw3r7WpA1NgXUkEmHjgqGnZ5';
  }

  const ipfs = await getIpfs();
  window.ipfs = ipfs;

  Hls.DefaultConfig.loader = HlsjsIpfsLoader;
  Hls.DefaultConfig.debug = false;

  const index = await ipfs.cat(`${pHash}/index.json`)
                          .then(file => JSON.parse(file.toString('utf8')));

  Hls.DefaultConfig.loader = HlsjsIPFSLoader;
  Hls.DefaultConfig.debug = false;

  const hlsManifest = ipfs.ls(`${pHash}/master.m3u8`).then(() => true, () => false);

  const ap = new APlayer({
    container: document.getElementById('aplayer'),
    audio: [{
      name: index.title,
      artist: index.authors[0].name,
      url: 'master.m3u8',
      type: 'customHls'
    }],
    customAudioType: {
      async customHls(audioElement, audio, player) {
        if ((await hlsManifest) && Hls.isSupported()) {
          const hls = new Hls();
          hls.config.ipfs = ipfs;
          hls.config.ipfsHash = pHash;
          hls.loadSource(audio.url);
          hls.attachMedia(audioElement);
        } else {
          const file = ipfs.cat(`${pHash}/1.mp3`).then(({ buffer }) => new Blob([ buffer ]));
          audioElement.src = URL.createObjectURL(await file);
        }
      }
    }
  });
});
