class GaplessMP3 {
  constructor(mediaElement) {
    let player = this;
    const chunkSize = 524288;
    const bufferChunks = 10;
    let tracks = [];
    let currentTrack = 0;
    let currentTime = 0;
    let trackTimestamps = [0];
    async function mediaSourceOpen(e) {
      e.target.onsourceopen = null;
      let buffer = [];
      let bufferTrack = currentTrack;
      let bufferByte = 0;
      let sourceBuffer = e.target.addSourceBuffer("audio/mpeg");
      let closed = false;
      e.target.onsourceclose = function() {closed = true;};
      while (!closed) {
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
            sourceBuffer.appendBuffer(buffer[0]);
            await new Promise(function(resolve) {sourceBuffer.onupdateend = resolve;});
            sourceBuffer.onupdateend = null;
            if (buffer[0].byteLength < chunkSize) {
              if (bufferTrack == tracks.length) {
                e.target.endOfStream();
              }
              trackTimestamps[bufferTrack] = sourceBuffer.timestampOffset;
            }
            buffer.shift();
          } catch {}
        }
        await new Promise(function(resolve) {setTimeout(resolve, 2000);});
      }
    };
    Object.defineProperty(player, "currentTrack", {get: function() {
      return currentTrack;
    }, set: function(v) {
      trackTimestamps = [0];
      currentTrack = Math.max(0, Math.min(v, tracks.length - 1));
      currentTime = 0;
      let mediaSource = new MediaSource();
      mediaSource.onsourceopen = mediaSourceOpen;
      mediaElement.src = URL.createObjectURL(mediaSource);
    }});
    Object.defineProperty(player, "currentTime", {get: function() {
      return currentTime;
    }});
    Object.defineProperty(player, "onplay", {writable: true});
    Object.defineProperty(player, "onplaying", {writable: true});
    Object.defineProperty(player, "onwaiting", {writable: true});
    Object.defineProperty(player, "onpause", {writable: true});
    Object.defineProperty(player, "ontimeupdate", {writable: true});
    player.addTrack = function(url) {
      tracks.push(url);
      return tracks.length - 1;
    };
    player.clearTracks = function() {
      tracks = [];
      trackTimestamps = [0];
      currentTrack = 0;
      currentTime = 0;
      let mediaSource = new MediaSource();
      mediaSource.onsourceopen = mediaSourceOpen;
      mediaElement.src = URL.createObjectURL(mediaSource);
    };
    player.play = function() {mediaElement.play();};
    player.pause = function() {mediaElement.pause();};
    mediaElement.addEventListener("play", function() {if (player.onplay) player.onplay();});
    mediaElement.addEventListener("playing", function() {if (player.onplaying) player.onplaying();});
    mediaElement.addEventListener("waiting", function() {if (player.onplaying) player.onwaiting();});
    mediaElement.addEventListener("pause", function() {if (player.onpause) player.onpause();});
    mediaElement.addEventListener("timeupdate", function() {
      for (let i = 0; i < tracks.length; i++) {
        if (trackTimestamps[i] != undefined && mediaElement.currentTime >= trackTimestamps[i]) {
          currentTrack = i;
        }
      }
      currentTime = mediaElement.currentTime - trackTimestamps[currentTrack];
      if (player.ontimeupdate) player.ontimeupdate();
    });
    player.clearTracks();
  }
}
