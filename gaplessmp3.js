class GaplessMP3 {
  constructor(mediaElement) {
    const chunkSize = 524288;
    const bufferChunks = 10;
    let tracks = [];
    let currentTrack = 0;
    Object.defineProperty(this, "currentTrack", {get: function() {return currentTrack;}});
    Object.defineProperty(this, "onplay", {writable: true});
    Object.defineProperty(this, "onpause", {writable: true});
    Object.defineProperty(this, "ontimeupdate", {writable: true});
    this.addTrack = function(url) {
      tracks.push(url);
      return tracks.length - 1;
    };
    let mediaSource = new MediaSource();
    mediaSource.onsourceopen = async function() {
      mediaSource.onsourceopen = null;
      let buffer = [];
      let bufferTrack = 0;
      let bufferByte = 0;
      let sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
      window.sourceBuffer = sourceBuffer;
      window.mediaSource = mediaSource;
      while (true) {
        if (buffer.length < bufferChunks && bufferTrack < tracks.length) {
          try {
            let mybuffer = buffer;
            let f = await fetch(tracks[bufferTrack], {headers: {"Range": "bytes=" + bufferByte + "-" + (bufferByte + chunkSize - 1)}});
            let a = await f.arrayBuffer();
            if (mybuffer === buffer) {
              buffer.push(a);
              if (a.byteLength == chunkSize) {
                bufferByte += chunkSize;
              } else {
                bufferByte = 0;
                bufferTrack++;
              }
            }
          } catch {}
        }
        try {
          if (bufferTrack == tracks.length && buffer[0].byteLength < chunkSize) {
            sourceBuffer.onupdateend = function() {
              sourceBuffer.onupdateend = null;
              mediaSource.endOfStream();
            };
          }
          sourceBuffer.appendBuffer(buffer[0]);
          buffer.shift();
        } catch {}
        await new Promise(function(resolve) {setTimeout(resolve, 2000);});
      }
    };
    mediaElement.src = URL.createObjectURL(mediaSource);
  }
}
