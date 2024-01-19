# gaplessmp3.js
Javascript gapless MP3 player.

This is for gapless MP3s encoded using Lame's ```--nogap``` option. See the **Hardware decoders** section of https://www.rockbox.org/wiki/GaplessHowTo.html and pay particular attention to the **What won't work** section. It is possible that it would work with certain other formats (maybe FLAC) but this is untested.

## Usage
Create a GaplessMP3 object, passing an ```<audio>``` element to the constructor.
``` javascript
<script src="gaplessmp3.js"></script>
<script>
  let player = new GaplessMP3(document.createElement("audio"));
</script>
```

### Functions
* **addTrack(url)** - adds a track to the playlist and returns the added track number.
* **play()** - begins playback.
* **pause()** - pauses playback.
* **clearTracks()** - clears the playlist.

### Events
* **oncanplay** - called when enough audio data is available to start playback.
* **onplay** - called when playback requested.
* **onplaying** - called when playback starts.
* **onwaiting** - called when playback stops to wait for data.
* **onpause** - called when playback pauses.
* **onended** - called when playback of the last track ends.
* **ontimeupdate** - called when currentTrack or currentTime changes.

### Properties
* **currentTrack** - the index of the currently playing track.
* **currentTime** - the position within the currently playing track (read-only).

## To do
* Add buffer size, download rate options.
* If user skips to next track and it's already downloaded, don't redownload it.
