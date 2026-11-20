// Shot plan for "The Miracle Was Just Plumbing" — Hero's automatic temple doors, Alexandria.
// Timed to voice.wav (42.32 s, 30 fps, 1270 frames). Phrase map (frames):
// 0:5-39 "Two thousand years ago," | 1:45-135 "an ancient Greek temple had automatic doors."
// 2:150-201 "In first-century Alexandria," | 3:208-289 "the inventor Hero designed a wild trick."
// 4:304-406 "Crowds grumbled outside that those massive doors wouldn't budge."
// 5:415-503 "Some joked it would take twenty oxen just to crack them open."
// 6:521-599 "Then a priest lit a small altar fire," | 7:614-670 "and the doors swung wide."
// 8:694-720 "Everyone gasped," | 9:727-771 "convinced the gods had answered."
// 10:789-822 "You see, it wasn't magic." | 11:831-900 "The fire heated trapped air underground,"
// 12:906-976 "pushing water like a kettle into a hanging bucket." | 13:990-1037 "That heavy bucket dropped,"
// 14:1042-1107 "yanking hidden ropes on the door posts." | 15:1122-1145 "When the flame died,"
// 16:1162-1188 "the doors swung shut. Turns out," | 17:1208-1260 "the miracle was just plumbing."
import { M, clamp, lerp, lerp3, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 1270, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 149, light: 'day' },
  { id: 'alexandria', a: 150, b: 289, light: 'day' },
  { id: 'grumble', a: 290, b: 406, light: 'day' },
  { id: 'oxen', a: 407, b: 520, light: 'golden' },
  { id: 'priest', a: 521, b: 613, light: 'golden' },
  { id: 'doorsOpen', a: 614, b: 693, light: 'golden' },
  { id: 'gasp', a: 694, b: 788, light: 'golden' },
  { id: 'notMagic', a: 789, b: 830, light: 'golden' },
  { id: 'underFire', a: 831, b: 905, light: 'tomb' },
  { id: 'bucketFill', a: 906, b: 989, light: 'tomb' },
  { id: 'drop', a: 990, b: 1041, light: 'tomb' },
  { id: 'ropes', a: 1042, b: 1121, light: 'tomb' },
  { id: 'flameDies', a: 1122, b: 1161, light: 'golden' },
  { id: 'doorsShut', a: 1162, b: 1207, light: 'golden' },
  { id: 'twist', a: 1208, b: 1269, light: 'golden' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const smooth = M.smooth;

// ---------- lights ----------
export const LIGHTS = {
  day: { az: 140, el: 46, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 70, fogFar: 900,
    skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.1, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.2, shadowExt: 20 },
  golden: { az: 8, el: 9, sky: '#9a90c8', ground: '#6a4c40', hemi: 1.0, sun: '#ffb46c', sunI: 2.9, fog: '#f0b88c', fogNear: 60, fogFar: 760,
    skyTop: '#6f6eb0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', waterDeep: '#3d5a86', waterShal: '#d99a6e',
    glint: '#ffe2a8', vig: 0.26, shadowExt: 20 },
  tomb: { az: 55, el: 30, sky: '#39435c', ground: '#191411', hemi: 0.62, sun: '#ffb46c', sunI: 1.35, fog: '#20202e', fogNear: 9, fogFar: 55,
    skyTop: '#101623', skyHor: '#272c3d', sat: 1.06, gain: '#ffe9d2', waterDeep: '#1d3038', waterShal: '#2c4a56', glint: '#9fc4d4', vig: 0.36, shadowExt: 9 },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'doorsOpen' || S.id === 'doorsShut') L.shadowExt = 15;
  if (S.id === 'priest' || S.id === 'flameDies') L.shadowExt = 8;
  return L;
};

// ---------- cameras ----------
// World layout: temple facade z=-3.2, podium top y=1, plaza y=0, crowd z 7-9, altar (2.6,0,4.6).
// Underground chamber at x 76-84: vessel (78.3,~1.5,-1), bucket (81.7, hang 2.45,-1), beam y 3.95.
const CAMS = {
  hook: [
    { f: 0, pos: [0.5, 3.6, 3.4], look: [0, 3.3, -3.2], fov: 35 },
    { f: 26, pos: [0.4, 3.6, 3.8], look: [0, 3.3, -3.2], fov: 34 },
    { f: 96, pos: [0, 4.4, 13.8], look: [0, 3.6, -3], fov: 45 },
    { f: 149, pos: [0, 4.5, 14.4], look: [0, 3.6, -3], fov: 44 },
  ],
  alexandria: [
    { f: 150, pos: [7.6, 3.4, 15.5], look: [0, 3.2, -2], fov: 44 },
    { f: 215, pos: [3.5, 3.0, 13.5], look: [-1.5, 2.6, 1], fov: 42 },
    { f: 289, pos: [-1.4, 2.6, 11.6], look: [-4.55, 1.8, 5.4], fov: 38 },
  ],
  grumble: [
    { f: 290, pos: [5.4, 2.2, 10.2], look: [-0.6, 1.8, 7.4], fov: 41 },
    { f: 406, pos: [5.0, 2.1, 10.6], look: [-0.6, 1.8, 7.4], fov: 39 },
  ],
  oxen: [
    { f: 407, pos: [4.0, 2.5, 9.2], look: [-0.4, 1.7, 0.6], fov: 43 },
    { f: 520, pos: [3.6, 2.4, 9.6], look: [-0.4, 1.7, 0.6], fov: 41 },
  ],
  priest: [
    { f: 521, pos: [4.7, 1.8, 9.8], look: [2.0, 1.1, 4.7], fov: 40 },
    { f: 613, pos: [4.3, 1.65, 9.2], look: [2.05, 1.15, 4.7], fov: 40 },
  ],
  doorsOpen: [
    { f: 614, pos: [0, 1.6, 11.2], look: [0, 3.1, -3.2], fov: 46 },
    { f: 693, pos: [0, 2.0, 8.4], look: [0, 3.1, -3.2], fov: 43 },
  ],
  gasp: [
    { f: 694, pos: [-1.1, 2.0, 11.4], look: [0.1, 1.8, 8.0], fov: 34 },
    { f: 788, pos: [-0.8, 2.0, 11.8], look: [0.3, 1.8, 8.0], fov: 33 },
  ],
  notMagic: [
    { f: 789, pos: [-2.7, 2.1, 8.8], look: [-4.55, 1.85, 5.4], fov: 36 },
    { f: 830, pos: [-3.0, 2.05, 8.3], look: [-4.55, 1.85, 5.4], fov: 34 },
  ],
  underFire: [
    { f: 831, pos: [79.6, 2.0, 3.6], look: [78.3, 1.5, -1.0], fov: 40 },
    { f: 905, pos: [79.1, 1.9, 2.7], look: [78.3, 1.5, -1.0], fov: 38 },
  ],
  bucketFill: [
    { f: 906, pos: [80.4, 2.3, 3.6], look: [81.2, 2.55, -1.0], fov: 41 },
    { f: 989, pos: [80.9, 2.15, 2.9], look: [81.55, 2.3, -1.0], fov: 39 },
  ],
  drop: [
    { f: 990, pos: [80.5, 2.0, 2.7], look: [81.65, 1.7, -1.0], fov: 38 },
    { f: 1041, pos: [80.7, 1.9, 2.5], look: [81.65, 1.6, -1.0], fov: 37 },
  ],
  ropes: [
    { f: 1042, pos: [78.6, 2.6, 5.2], look: [80.6, 2.9, -1.0], fov: 50 },
    { f: 1121, pos: [79.2, 2.8, 4.8], look: [80.9, 3.0, -1.0], fov: 50 },
  ],
  flameDies: [
    { f: 1122, pos: [4.9, 2.0, 10.4], look: [2.1, 1.3, 4.6], fov: 42 },
    { f: 1161, pos: [4.7, 1.95, 10.0], look: [2.1, 1.3, 4.6], fov: 41 },
  ],
  doorsShut: [
    { f: 1162, pos: [0.6, 2.7, 13.0], look: [0, 3.2, -3.2], fov: 44 },
    { f: 1207, pos: [0.4, 2.6, 12.2], look: [0, 3.2, -3.2], fov: 42 },
  ],
  twist: [
    { f: 1208, pos: [0.9, 2.1, 11.8], look: [0.9, 1.9, 6.6], fov: 38, roll: 0 },
    { f: 1269, pos: [0.9, 2.0, 10.0], look: [0.9, 1.9, 6.6], fov: 33, roll: 3.5 },
  ],
};
const KICKS = [{ f: 668, a: 0.04 }, { f: 1031, a: 0.05 }, { f: 1194, a: 0.05 }, { f: 1252, a: 0.02 }];
const SHADOW_AT = {
  hook: [0, 3, -3], alexandria: [0, 2, 2], grumble: [0, 1, 7], oxen: [0, 1, 1], priest: [2.4, 1, 4.6],
  doorsOpen: [0, 3, -3], gasp: [0, 1, 8], notMagic: [-4.5, 1, 5.4], underFire: [78.3, 1.5, -1],
  bucketFill: [81.6, 2, -1], drop: [81.6, 1.5, -1], ropes: [80, 3.5, -1], flameDies: [2.4, 1, 4.6],
  doorsShut: [0, 3, -3], twist: [0.9, 1, 6.6],
};
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(CAMS[S.id], f, { kicks: KICKS });
  c.flash = f >= 826 && f < 832 ? (1 - (f - 826) / 6) * 0.85 : f >= 1122 && f < 1126 ? (1 - (f - 1122) / 4) * 0.5 : 0;
  c.shadowAt = SHADOW_AT[S.id];
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  switch (S.id) {
    case 'hook': return { focus: dist(C.pos, [0, 3.3, -3.2]), cinf: lerp(13, 0, smooth(ramp(f, 26, 70))) };
    case 'alexandria': return { focus: dist(C.pos, [-4.55, 1.85, 5.4]), cinf: lerp(0, 8, smooth(ramp(f, 215, 289))) };
    case 'grumble': return { focus: dist(C.pos, [-0.6, 1.8, 7.6]), cinf: 7 };
    case 'oxen': return { focus: dist(C.pos, [0, 1.2, 1.9]), cinf: 5 };
    case 'priest': return { focus: dist(C.pos, [2.3, 1.3, 4.6]), cinf: 12 };
    case 'doorsOpen': return { focus: dist(C.pos, [0, 3.1, -3.2]), cinf: 0 };
    case 'gasp': { const t = smooth(ramp(f, 724, 740)); return { focus: lerp(dist(C.pos, [0.9, 1.85, 8.4]), dist(C.pos, [-1.3, 1.85, 7.8]), t), cinf: 13 }; }
    case 'notMagic': return { focus: dist(C.pos, [-4.55, 1.85, 5.4]), cinf: 13 };
    case 'underFire': return { focus: dist(C.pos, [78.3, 1.5, -1]), cinf: 9 };
    case 'bucketFill': return { focus: dist(C.pos, [81.6, 2.1, -1]), cinf: 9 };
    case 'drop': return { focus: dist(C.pos, [81.65, 1.6, -1]), cinf: 11 };
    case 'ropes': return { focus: dist(C.pos, [80.6, 3.6, -1]), cinf: 8 };
    case 'flameDies': return { focus: dist(C.pos, [2.4, 1.3, 4.6]), cinf: 10 };
    case 'doorsShut': return { focus: dist(C.pos, [0, 3.2, -3.2]), cinf: 0 };
    case 'twist': return { focus: dist(C.pos, [0.9, 1.9, 6.6]), cinf: 12 };
  }
  return { focus: 10, cinf: 0 };
};

// ---------- world state ----------
const pulse = (f, a, b) => { const t = ramp(f, a, b); return Math.sin(t * Math.PI); };
export const worldAt = (f) => {
  // doors: anticipation shudder 614-622, back-overshoot swing 622-668, shut 1166-1194 + rattle
  let door = 0;
  if (f >= 614 && f < 622) door = -0.035 * Math.sin(ramp(f, 614, 622) * Math.PI);
  else if (f >= 622 && f < 1166) door = M.back(ramp(f, 622, 668), 1.4);
  else if (f >= 1166) { door = 1 - smooth(ramp(f, 1166, 1194)); if (f >= 1194 && f < 1212) door += 0.028 * Math.sin((f - 1194) * 1.15) * Math.exp(-(f - 1194) / 5.5); }
  if (f >= 1166) door = Math.max(0, door);
  // altar flame: ignites 552-578, dies 1128-1150
  let altarFlame = 0;
  if (f >= 552 && f < 1128) altarFlame = smooth(ramp(f, 552, 578));
  else if (f >= 1128) altarFlame = 1 - smooth(ramp(f, 1128, 1150));
  // underground fire: ramps in after the cut, burns through the mechanism shots
  const fireU = f < 831 ? 0 : smooth(ramp(f, 838, 878));
  // water: stream 918-985, bucket fill follows
  const waterFlow = f < 918 ? 0 : f < 985 ? smooth(ramp(f, 918, 936)) * (1 - smooth(ramp(f, 972, 985))) : 0;
  const fill = smooth(ramp(f, 920, 985));
  // bucket: sag from fill, anticipation rise, drop, spring settle
  let drop = 0;
  if (f >= 995 && f < 1012) drop = -0.045 * Math.sin(ramp(f, 995, 1012) * Math.PI * 0.5);
  else if (f >= 1012 && f < 1032) drop = 1.15 * M.easeIn(ramp(f, 1012, 1032));
  else if (f >= 1032) drop = 1.15 - 0.05 * Math.exp(-(f - 1032) / 7) * Math.sin((f - 1032) * 0.9);
  const bucketY = -(0.12 * fill + drop);
  // rope yank: two tugs
  const yank = Math.max(pulse(f, 1050, 1076), 0.8 * pulse(f, 1085, 1103));
  return { door, altarFlame, fireU, waterFlow, fill, bucketY, yank, helmet: null };
};

// ---------- actors (2D cards) ----------
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const CROWD = {
  A: [-1.3, 0, 7.8], B: [0.9, 0, 8.4], C: [2.2, 0, 7.2], D: [-2.6, 0, 8.8],
};
const HERO_POS = [-4.6, 0, 5.4], PRIEST_POS = [1.5, 0, 5.0];
const withIdle = (f, seed, o = {}) => { const i = idle(f, seed); return { bob: q(i.bob + (o.bob || 0), 3), tilt: q(i.tilt + (o.tilt || 0), 1), headTilt: q(i.headTilt + (o.headTilt || 0), 1), blink: blinkAt(f, seed), ...o }; };
const laughBob = (f, s) => q(Math.abs(Math.sin((f + s) * 0.55)) * 0.025, 3);

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'golden' ? '#ffe2c8' : '#ffffff';
  const crowd = (who, seed, o, pos, extra = {}) => out.push(R(T, who, withIdle(f, seed, o), pos, { tint, ...extra }));
  switch (S.id) {
    case 'hook': break; // doors only; banners + world carry it
    case 'alexandria': {
      crowd('civA', 11, { expr: 'neutral', look: 0.3 }, CROWD.A);
      crowd('civB', 12, { expr: 'smile', look: -0.2 }, CROWD.B);
      crowd('civD', 13, { expr: 'neutral' }, CROWD.D);
      // Hero apart by the broken column, arms crossed, watching
      out.push(R(T, 'hero', withIdle(f, 5, { expr: f > 240 ? 'squint' : 'neutral', L: 'cross', R: 'cross', look: 0.5 }), HERO_POS, { tint }));
      break;
    }
    case 'grumble': {
      const shake = f >= 330 && f <= 360 ? q(6 * Math.sin((f - 330) / 30 * Math.PI * 3), 1) : 0;
      crowd('civA', 11, { expr: 'stubborn', L: 'cross', R: 'cross', look: 0.4, headTilt: shake }, CROWD.A);
      crowd('civC', 14, { expr: 'stern', L: 'hip', R: 'point', look: -0.3 }, CROWD.C);
      crowd('civD', 13, { expr: 'stern', L: 'hang', R: 'hip', look: 0.2 }, CROWD.D);
      crowd('civB', 12, { expr: 'nervous', look: 0 }, [1.7, 0, 9.3]);
      break;
    }
    case 'oxen': {
      // laughing crowd, right foreground
      out.push(R(T, 'civC', withIdle(f, 14, { expr: 'laugh', L: 'point', R: 'belly', bob: laughBob(f, 0), tilt: q(-4 + 3 * Math.sin(f * 0.5), 1) }), [2.9, 0, 5.6], { tint }));
      out.push(R(T, 'civB', withIdle(f, 12, { expr: 'laugh', L: 'belly', R: 'belly', bob: laughBob(f, 5), tilt: q(5 * Math.sin(f * 0.55 + 1), 1) }), [4.1, 0, 6.3], { tint }));
      break;
    }
    case 'priest': {
      const reach = smooth(ramp(f, 528, 552)), up = smooth(ramp(f, 585, 605));
      out.push(R(T, 'priest', withIdle(f, 7, { expr: f > 570 ? 'grin' : 'neutral', L: 'hang', R: up > 0.5 ? 'up' : reach > 0.4 ? 'reach' : 'hang', lift: q(reach, 2), look: 0.3 }), PRIEST_POS, { tint }));
      break;
    }
    case 'doorsOpen': {
      // crowd silhouettes at the frame edges
      out.push(R(T, 'civA', withIdle(f, 11, { expr: f > 640 ? 'shock' : 'neutral', L: 'cheek', R: 'cheek', blink: f > 640 ? 0 : blinkAt(f, 11) }), [-2.9, 0, 7.4], { tint }));
      out.push(R(T, 'civB', withIdle(f, 12, { expr: f > 640 ? 'shock' : 'smile', L: 'cheek', R: 'hang', blink: f > 640 ? 0 : blinkAt(f, 12) }), [3.0, 0, 7.6], { tint }));
      break;
    }
    case 'gasp': {
      out.push(R(T, 'civB', withIdle(f, 12, { expr: 'shock', L: 'cheek', R: 'cheek', blink: 0, look: 0.2 }), CROWD.B, { tint }));
      out.push(R(T, 'civA', withIdle(f, 11, { expr: 'shock', L: 'cheek', R: 'hang', blink: 0, look: -0.2 }), CROWD.A, { tint }));
      out.push(R(T, 'priest', withIdle(f, 7, { expr: 'shock', L: 'up', R: 'up', blink: 0 }), [2.9, 0, 9.6], { tint }));
      break;
    }
    case 'notMagic': {
      const shake = f >= 798 && f <= 818 ? q(7 * Math.sin((f - 798) / 20 * Math.PI * 2.5), 1) : 0;
      out.push(R(T, 'hero', withIdle(f, 5, { expr: f < 798 ? 'grin' : 'squint', L: 'cross', R: 'cross', look: 0.3, headTilt: shake }), HERO_POS, { tint }));
      break;
    }
    case 'flameDies': {
      out.push(R(T, 'priest', withIdle(f, 7, { expr: f > 1148 ? 'stern' : 'neutral', L: 'hang', R: 'hang', look: -0.4 }), PRIEST_POS, { tint }));
      break;
    }
    case 'doorsShut': {
      crowd('civA', 11, { expr: 'neutral', look: 0.3 }, [-2.2, 0, 8.6]);
      const w = ((f - 1162) % 46) / 46; // a bystander drifts off, unimpressed
      out.push(R(T, 'civD', withIdle(f, 13, { expr: 'stubborn', step: q(w), facing: 1 }), [3.4 + (f - 1162) * 0.02, 0, 9.4], { tint }));
      break;
    }
    case 'twist': {
      out.push(R(T, 'hero', withIdle(f, 5, { expr: 'grin', L: 'cross', R: f > 1226 ? 'thumb' : 'cross', look: 0 }), [0.9, 0, 6.6], { tint }));
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  // oxen (their own cards, drawn in roman.js) during the joke shot
  if (S.id === 'oxen') {
    const strain = q(0.5 + 0.5 * Math.sin(f * 0.22), 2), strain2 = q(0.5 + 0.5 * Math.sin(f * 0.22 + 2.1), 2);
    out.push({ key: 'oxA' + strain, draw: (p) => T.fxOx(p, { strain, blink: blinkAt(f, 21), col: '#7a5230' }), x: -1.15, y: 0, z: 1.9, s: 1.7, blob: true, shadow: true, order: 2 });
    out.push({ key: 'oxB' + strain2, draw: (p) => T.fxOx(p, { strain: strain2, blink: blinkAt(f, 22), col: '#5d5148' }), x: 1.15, y: 0, z: 1.9, s: 1.7, blob: true, shadow: true, order: 2 });
  }
  // dust at the door base when the doors land open / slam shut
  if (S.id === 'doorsOpen' && f >= 660 && f < 692) { const t = q((f - 660) / 32, 2); out.push(FX('ddust' + t, (p) => T.fxDust(p, t, '#e8d9b8'), [-1.2, 0.7, -2.4], 1.1)); out.push(FX('ddust2' + t, (p) => T.fxDust(p, t, '#e8d9b8'), [1.3, 0.7, -2.4], 1.1)); }
  if (S.id === 'doorsShut' && f >= 1192 && f < 1207) { const t = q((f - 1192) / 15, 2); out.push(FX('sdust' + t, (p) => T.fxDust(p, t, '#e8d9b8'), [0, 0.7, -2.4], 1.3)); }
  // smoke wisp above the altar flame
  if ((S.id === 'priest' && f > 585) || S.id === 'doorsOpen') { const t = q(((f - 585) / 40) % 1, 2); out.push(FX('wisp' + t, (p) => { p.g.translate(150, 700); T.fxPuff(p, t); }, [2.6, 1.5, 4.6], 0.5)); }
  // underground ambience: slow drips from the chamber ceiling
  if (S.light === 'tomb') for (let i = 0; i < 2; i++) { const t = ((f * 0.02 + i * 0.53) % 1); out.push(FX('udrip' + i, (p) => T.fxDrip(p), [77.6 + i * 5.2, 3.6 - t * 3.4, 0.6 + i * 0.5], 0.07)); }
  // bucket landing dust
  if (S.id === 'drop' && f >= 1030 && f < 1041) { const t = q((f - 1030) / 11, 2); out.push(FX('bdust' + t, (p) => T.fxDust(p, t, '#cbb894'), [81.7, 0.35, -0.4], 0.8)); }
  // rope creak marks at the beam during the tugs
  if (S.id === 'ropes') for (const [a, b] of [[1052, 1074], [1087, 1101]]) if (f >= a && f < b) { const t = q((f - a) / (b - a), 2); out.push(FX('creak' + a + t, (p) => { p.g.translate(150, 400); T.fxCreak(p, t); }, [80.2, 3.55, -0.3], 0.7)); }
  // the twist payoff: one drip from the door-post pipe joint, then a tiny splash
  if (S.id === 'twist' && f >= 1244 && f < 1262) out.push(FX('tdrip', (p) => T.fxDrip(p), [2.15, 3.3 - (f - 1244) * 0.09, -2.55], 0.09));
  if (S.id === 'twist' && f >= 1258) { const t = q((f - 1258) / 11, 2); out.push(FX('tsplash' + t, (p) => { p.g.translate(0, 130); p.g.scale(0.6, 0.6); T.fxSplash(p, t); }, [2.15, 0.95, -2.5], 0.9)); }
  return out;
};
