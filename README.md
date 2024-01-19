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
* **clearTracks()** - removes all loaded tracks.

### Events
* **onplay** - called when playback requeted.
* **onplaying** - called when playback starts.
* **onpause** - called when playback pauses.
* **ontimeupdate** - called when currentTime or currentTrack is updated.

### Properties
* **currentTime** - not implemented yet.
* **currentTrack** - not implemented yet.
