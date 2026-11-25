// "The Man Who Survived Two Atomic Bombs" — Tsutomu Yamaguchi, 1945.
// Timing REMAPPED 2026-11-25 to the FINAL voiceover (Casper, 60.05 s):
// timing.py silence-align on voice.mp3 -> 1801 frames @30fps. Voice never edited.
// Cast: Baron-level redesign (yamaguchi2 / yamaguchi2Hurt / boss2 / clerk2 / wife2 / yamaguchiOld).
// One street set serves both cities; worldAt toggles rubble/smoke for aftermath.
import { M, clamp, lerp, lerp3, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 1801, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 356, light: 'morningH' },
  { id: 'aftermath', a: 357, b: 660, light: 'ash' },
  { id: 'home', a: 661, b: 800, light: 'morningN' },
  { id: 'office', a: 801, b: 1060, light: 'office' },
  { id: 'flash2', a: 1061, b: 1220, light: 'white' },
  { id: 'aftermath2', a: 1221, b: 1360, light: 'ash2' },
  { id: 'payoff', a: 1361, b: 1800, light: 'golden' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

export const LIGHTS = {
  morningH: { az: 120, el: 34, sky: '#bcd8f4', ground: '#77755c', hemi: 1.15, sun: '#fff0d2', sunI: 2.5, fog: '#cfe0ee', fogNear: 70, fogFar: 950,
    skyTop: '#3a7cd2', skyHor: '#c2dcf4', sunDisc: '#fff3cf', sunSize: 0.0025, sat: 1.12, waterDeep: '#286e90', waterShal: '#5fb0c6', glint: '#f0faff', vig: 0.2, shadowExt: 20 },
  ash: { az: 170, el: 40, sky: '#a8a49c', ground: '#5c574e', hemi: 0.95, sun: '#e8e2d4', sunI: 1.2, fog: '#b0aa9e', fogNear: 34, fogFar: 520,
    skyTop: '#6a675f', skyHor: '#c4beb2', sat: 0.55, gain: '#e9e6df', waterDeep: '#3d4f57', waterShal: '#6d7f88', glint: '#d8dcd8', vig: 0.36, shadowExt: 14 },
  morningN: { az: 140, el: 38, sky: '#c2dcf2', ground: '#767a5e', hemi: 1.18, sun: '#fff3da', sunI: 2.6, fog: '#d2e4f0', fogNear: 75, fogFar: 1000,
    skyTop: '#3574cc', skyHor: '#c8e0f2', sunDisc: '#fff3cf', sunSize: 0.0025, sat: 1.13, waterDeep: '#286e90', waterShal: '#63b4c9', glint: '#f2fbff', vig: 0.19, shadowExt: 20 },
  office: { az: 152, el: 52, sky: '#bcd8f4', ground: '#7d7a5c', hemi: 1.22, sun: '#fff3da', sunI: 2.65, fog: '#cfe2f2', fogNear: 85, fogFar: 1050,
    skyTop: '#2f74d0', skyHor: '#bcd9f4', sat: 1.13, waterDeep: '#256b8c', waterShal: '#63b4c9', glint: '#f2fbff', vig: 0.18, shadowExt: 16 },
  white: { az: 160, el: 55, sky: '#f4f2ea', ground: '#a09a8e', hemi: 1.7, sun: '#ffffff', sunI: 3.4, fog: '#eeeae0', fogNear: 26, fogFar: 420,
    skyTop: '#cfd4d8', skyHor: '#f6f2e8', sunDisc: '#ffffff', sunSize: 0.01, sat: 0.5, gain: '#f8f6f0', waterDeep: '#5d6f78', waterShal: '#93a5ad', glint: '#ffffff', vig: 0.12, shadowExt: 12 },
  ash2: { az: 195, el: 26, sky: '#98948c', ground: '#504c46', hemi: 0.85, sun: '#ddd5c6', sunI: 1.0, fog: '#a39d92', fogNear: 30, fogFar: 460,
    skyTop: '#5b5850', skyHor: '#b8b1a2', sat: 0.5, gain: '#e2ded4', waterDeep: '#37474e', waterShal: '#62757e', glint: '#cfd4cf', vig: 0.4, shadowExt: 12 },
  golden: { az: 285, el: 11, sky: '#c9a06a', ground: '#6a5138', hemi: 0.92, sun: '#ffb45e', sunI: 2.5, fog: '#eebd83', fogNear: 48, fogFar: 720,
    skyTop: '#4d5f96', skyHor: '#ffc987', sunDisc: '#fff0bc', sunSize: 0.0035, sat: 1.14, gain: '#fff0da', waterDeep: '#2c506e', waterShal: '#d99a5e', glint: '#ffdf9e', vig: 0.3, shadowExt: 16 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

const CAMS = {
  hook: [
    { f: 0, pos: [-0.6, 2.6, 8.6], look: [-4, 1.6, 0.5], fov: 38 },
    { f: 356, pos: [-1.6, 2.3, 7.0], look: [-4.2, 1.6, 0.5], fov: 35 },
  ],
  aftermath: [
    { f: 357, pos: [-6.4, 2.2, 6.8], look: [-3, 1.3, 0.5], fov: 40 },
    { f: 660, pos: [-5.4, 2.0, 5.8], look: [-3, 1.3, 0.5], fov: 37 },
  ],
  home: [
    { f: 661, pos: [12.4, 2.7, 9.4], look: [8, 1.6, 1], fov: 42 },
    { f: 800, pos: [11.4, 2.5, 8.2], look: [8.2, 1.6, 1], fov: 40, path: [[12, 2.6, 8.9]] },
  ],
  office: [
    { f: 801, pos: [14.6, 2.5, 7.6], look: [14.5, 1.6, 0.4], fov: 39 },
    { f: 1060, pos: [14.4, 2.4, 6.4], look: [14.5, 1.6, 0.4], fov: 37 },
  ],
  flash2: [
    { f: 1061, pos: [14.3, 2.4, 6.4], look: [14.3, 1.6, 0.4], fov: 37 },
    { f: 1220, pos: [14.1, 2.3, 5.9], look: [14.3, 1.55, 0.4], fov: 36 },
  ],
  aftermath2: [
    { f: 1221, pos: [17.2, 2.1, 6.2], look: [14.8, 1.2, 0.4], fov: 39 },
    { f: 1360, pos: [16.6, 2.0, 5.5], look: [14.8, 1.2, 0.4], fov: 37 },
  ],
  payoff: [
    { f: 1361, pos: [3.4, 2.8, 8.8], look: [0, 1.5, -0.6], fov: 41 },
    { f: 1800, pos: [2.2, 2.4, 6.8], look: [0, 1.5, -0.6], fov: 37, path: [[2.9, 2.6, 7.9]] },
  ],
};
const SHADOW_AT = { hook: [-4, 1, 0], aftermath: [-3, 1, 0], home: [8, 1, 0], office: [14.5, 1, 0], flash2: [14.5, 1, 0], aftermath2: [14.8, 1, 0], payoff: [0, 1, -1] };
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(CAMS[S.id], f, {});
  // white flashes land on the spoken explosions (0-3 f before the word's peak)
  if (S.id === 'hook') c.flash = f < 316 ? 0 : Math.min(1, (f - 316) / 14);
  else if (S.id === 'flash2') c.flash = f < 1108 ? 0 : f < 1124 ? (f - 1108) / 16 : f < 1150 ? 1 : Math.max(0, 1 - (f - 1150) / 45);
  else c.flash = 0;
  c.shadowAt = SHADOW_AT[S.id];
  return c;
};

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  const tgt = { hook: [-4, 1.6, 0.5], aftermath: [-3, 1.4, 0.5], home: [8, 1.6, 1], office: [14.5, 1.6, 0.4], flash2: [14.5, 1.6, 0.4], aftermath2: [14.8, 1.3, 0.4], payoff: [0, 1.5, -0.6] }[S.id];
  return { focus: dist(C.pos, tgt), cinf: S.id === 'home' || S.id === 'payoff' ? 6 : 11 };
};

export const worldAt = (f) => {
  const S = shotAt(f);
  const rubble = (S.id === 'aftermath' || S.id === 'aftermath2') ? 1 : 0;
  return { rubble, smoke: rubble, lantern: 0 };
};

const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const withIdle = (f, seed, o = {}) => { const i = idle(f, seed); return { bob: q(i.bob + (o.bob || 0), 3), tilt: q(i.tilt + (o.tilt || 0), 1), headTilt: q(i.headTilt + (o.headTilt || 0), 1), blink: blinkAt(f, seed), ...o }; };
const walkOpts = (f, ph = 0) => ({ step: q(((f + ph) % 52) / 52, 2), bob: q(Math.abs(Math.sin((f + ph) * 0.16)) * 0.012, 3) });

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'ash' || S.light === 'ash2' ? '#d8d5cc' : S.light === 'white' ? '#f4f1e8' : S.light === 'golden' ? '#ffdcae' : '#ffffff';
  switch (S.id) {
    case 'hook': out.push(R(T, 'yamaguchi2', withIdle(f, 5, { expr: 'neutral', L: 'hang', R: 'hang', ...walkOpts(f) }), [-4, 0, 0.5], { tint })); break;
    case 'aftermath': out.push(R(T, 'yamaguchi2Hurt', withIdle(f, 5, { expr: 'pained', L: 'cheek', R: 'hang' }), [-3, 0, 0.5], { tint })); break;
    case 'home': {
      out.push(R(T, 'yamaguchi2', withIdle(f, 5, { expr: 'neutral', L: 'hang', R: 'hang', ...walkOpts(f, 20) }), [8, 0, 1], { tint }));
      out.push(R(T, 'wife2', withIdle(f, 11, { expr: 'smile', L: 'wave', R: 'hang', wv: q(Math.sin(f * 0.18) * 1.2, 2) }), [9.05, 0, -0.3], { tint }));
      break;
    }
    case 'office': case 'flash2': {
      const shock = S.id === 'flash2' && f > 1115;
      out.push(R(T, 'yamaguchi2', withIdle(f, 5, { expr: shock ? 'squint' : 'stubborn', L: 'hang', R: 'point' }), [13.85, 0, 0.5], { tint }));
      out.push(R(T, 'boss2', withIdle(f, 9, { expr: shock ? 'shock' : 'unimpressed', L: 'cross', R: 'cross' }), [15.15, 0, 0.2], { tint, s: 1.02 }));
      out.push(R(T, 'clerk2', withIdle(f, 14, { expr: shock ? 'shock' : 'neutral', L: 'hang', R: 'hang' }), [14.5, 0, -2.4], { tint, s: 0.92 }));
      break;
    }
    case 'aftermath2': out.push(R(T, 'yamaguchi2Hurt', withIdle(f, 5, { expr: 'weary', L: 'hang', R: 'hang' }), [14.8, 0, 0.4], { tint })); break;
    case 'payoff': out.push(R(T, 'yamaguchiOld', withIdle(f, 5, { expr: 'smile', L: 'hang', R: 'hang', tilt: 1.5, headTilt: 2 }), [0, 0, -0.6], { tint })); break;
  }
  return out;
};
export const fxAt = (f, T) => [];
