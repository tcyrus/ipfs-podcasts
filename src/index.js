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

  Hls.DefaultConfig.loader = HlsjsIpfsLoader;
  Hls.DefaultConfig.debug = false;

  const index = await ipfs.cat(`${pHash}/index.json`)
                          .then(file => JSON.parse(file.toString('utf8')));

  Hls.DefaultConfig.loader = HlsjsIPFSLoader;
  Hls.DefaultConfig.debug = false;

  const hlsSupport = ipfs.ls(`${pHash}/file.m3u8`).then(() => true, () => false);

  const ap = new APlayer({
    container: document.getElementById('aplayer'),
    audio: [{
      name: index.title,
      artist: index.authors[0].name,
      url: 'file.m3u8',
      type: 'customHls'
    }],
    customAudioType: {
      async customHls(audioElement, audio, player) {
        if ((await hlsSupport) && Hls.isSupported()) {
          const hls = new Hls();
          hls.config.ipfs = node;
          hls.config.ipfsHash = pHash;
          hls.loadSource(audio.url);
          hls.attachMedia(audioElement);
        } else if (audioElement.canPlayType('application/x-mpegURL') || audioElement.canPlayType('application/vnd.apple.mpegURL')) {
          audioElement.src = audio.url;
        } else {
          audioElement.src = `https://ipfs.io/ipfs/${pHash}/1.mp3`;
        }
      }
    }
  });
});
