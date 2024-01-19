class GaplessMP3 {
  constructor(mediaElement) {
    let player = this;
    const chunkSize = 524288;
    const bufferChunks = 10;
    let tracks = [];
    let currentTrack = 0;
    let mediaSource = new MediaSource();
    Object.defineProperty(player, "currentTrack", {get: function() {return currentTrack;}});
    Object.defineProperty(player, "onplay", {writable: true});
    Object.defineProperty(player, "onplaying", {writable: true});
    Object.defineProperty(player, "onpause", {writable: true});
    Object.defineProperty(player, "ontimeupdate", {writable: true});
    this.addTrack = function(url) {
      tracks.push(url);
      return tracks.length - 1;
    };
    player.play = function() {mediaElement.play();};
    player.pause = function() {mediaElement.pause();};
    mediaElement.addEventListener("play", function() {if (player.onplay) player.onplay();});
    mediaElement.addEventListener("playing", function() {if (player.onplaying) player.onplaying();});
    mediaElement.addEventListener("pause", function() {if (player.onpause) player.onpause();});
    mediaSource.onsourceopen = async function() {
      mediaSource.onsourceopen = null;
      let buffer = [];
      let bufferTrack = 0;
      let bufferByte = 0;
      let sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
      while (true) {
        if (buffer.length < bufferChunks && bufferTrack < tracks.length) {
          try {
            let f = await fetch(tracks[bufferTrack], {headers: {"Range": "bytes=" + bufferByte + "-" + (bufferByte + chunkSize - 1)}});
            let a = await f.arrayBuffer();
            buffer.push(a);
            if (a.byteLength == chunkSize) {
              bufferByte += chunkSize;
            } else {
              bufferByte = 0;
              bufferTrack++;
            }
          } catch {}
        }
        if (buffer.length > 0) {
          try {
            if (bufferTrack == tracks.length && buffer[0].byteLength < chunkSize) {
              sourceBuffer.onupdateend = function() {
                sourceBuffer.onupdateend = null;
                mediaSource.endOfStream();
              };
            } else {
              sourceBuffer.onupdateend = function() {
                sourceBuffer.onupdateend = null;
                mediaSource.duration = sourceBuffer.timestampOffset;
              };
            }
            sourceBuffer.appendBuffer(buffer[0]);
            buffer.shift();
          } catch {}
        }
        await new Promise(function(resolve) {setTimeout(resolve, 2000);});
      }
    };
    mediaElement.src = URL.createObjectURL(mediaSource);
  }
}
