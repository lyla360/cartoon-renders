# Project layout — what goes in `projects/<name>/`

Rio prepares each project **locally** first (timing, storyboard, look check on
stills, sound mix), then pushes only the files the cloud render needs.
One folder per video:

```
projects/<name>/
├── story.js       REQUIRED  the shot plan (timings, cameras, cast per shot)
├── mix_raw.wav    REQUIRED  the finished sound mix, encoded by finish.sh
├── script.txt     the narration script the voiceover was recorded from
├── audio.py       the music/SFX cue table that produced the mix (reference)
└── web/           OPTIONAL  customised web files, mirroring the project's web/
    ├── main.js        world building, if this story changed it
    ├── roman.js       cast drawing, if new characters/outfits were added
    ├── paint.js       extra painted textures, if any
    ├── motion.js      extra motion helpers, if any
    └── index.html     only if the page shell itself changed
```

## How the workflow uses these files

1. `kit/tools/setup.sh` assembles a fresh project from the kit (engine, tools,
   three.js, `web/toon.js` built from `kit/vendor/toon.ts` + default
   `web/roman.js`).
2. Everything under `web/` here is copied over the assembled `web/`.
3. `story.js` is copied to `web/story.js` (after the `web/` overlay).
4. `web/toon.js` is rebuilt (`cat web/toonbase.js web/roman.js > web/toon.js`)
   so a customised `roman.js` actually takes effect.
5. Render jobs draw frames from that assembled project; the finish job only
   needs `frames/` + `mix_raw.wav` + `kit/tools/finish.sh`.

## The sound rule

`mix_raw.wav` is mixed **locally** by Rio with the kit's `mix.py`: the user's
original voiceover, untouched and never re-timed, with the synthesized music
bed and SFX locked at **50% of the voice level (−6 dB)**.

## What NEVER goes in this repo

- ❌ The raw voiceover (`voice.wav` / `voice.mp3`) — it stays on Rio's machine.
  Only the finished mix (`mix_raw.wav`) is uploaded, because `finish.sh`
  needs it to encode the MP4.
- ❌ Rendered frames — they are workflow artifacts (kept 1 day), not commits.
- ❌ Anything personal: no names, accounts, or files unrelated to the videos.
