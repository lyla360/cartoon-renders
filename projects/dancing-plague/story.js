// Shot plan for "The Town That Couldn't Stop Dancing" — Strasbourg dancing plague, 1518.
// Timed to voice.wav (54.28 s, 30 fps, 1628 frames). Phrase map (frames, from timing.py):
// 0:11-79 "In July 1518," | 1:90-211 "a woman named Troffea stepped into a street in Strasbourg,"
// 2:220-252 "and started dancing." | 3:274-315 "She danced all day." | 4:339-373 "Then all night."
// 5:397-431 "Then for days." | 6:445-485 "She could not stop." | 7:510-529 "Within a week,"
// 8:537-573 "dozens had joined her." | 9:594-613 "Within a month," | 10:630-691 "four hundred people were dancing,"
// 11:708-736 "feet bleeding," | 12:745-780 "bodies shaking," | 13:800-861 "begging for a help nobody could give."
// 14:891-962 "The city's leaders had a brilliant idea." | 15:983-1022 "If people needed to dance,"
// 16:1031-1059 "let them dance it out." | 17:1080-1111 "They built a stage." | 18:1122-1159 "They hired musicians."
// 19:1182-1235 "It made everything worse." | 20:1257-1303 "Some dancers collapsed," | 21:1310-1332 "and never got up."
// 22:1359-1369 "Then," | 23:1380-1425 "as suddenly as it had begun," | 24:1446-1475 "the dancing stopped."
// 25:1496-1543 "Five hundred years later," | 26:1555-1619 "still nobody knows why it started."
// World layout: street runs along z; houses at x≈±6.8; Troffea dances at (0,0,2);
// crowd fills z -13..-1; leaders confer at (1.3,0,2.7); stage platform at z=-6 (top y=0.9).
import { M, clamp, lerp, lerp3, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';

export const FPS = 30, TOTAL = 1628, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 219, light: 'day' },
  { id: 'dayDance', a: 220, b: 338, light: 'day' },
  { id: 'nightDance', a: 339, b: 444, light: 'night' },
  { id: 'cantStop', a: 445, b: 593, light: 'dawn' },
  { id: 'crowdGrows', a: 594, b: 890, light: 'day' },
  { id: 'leaders', a: 891, b: 982, light: 'day' },
  { id: 'idea', a: 983, b: 1079, light: 'day' },
  { id: 'stage', a: 1080, b: 1121, light: 'day' },
  { id: 'musicians', a: 1122, b: 1256, light: 'day' },
  { id: 'collapse', a: 1257, b: 1445, light: 'dusk' },
  { id: 'stopped', a: 1446, b: 1495, light: 'dawn' },
  { id: 'mystery', a: 1496, b: 1627, light: 'dawn' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const smooth = M.smooth;

// ---------- lights ----------
export const LIGHTS = {
  day: { az: 140, el: 46, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 70, fogFar: 900,
    skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.1, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.2, shadowExt: 20 },
  night: { az: 205, el: 32, sky: '#33406b', ground: '#232a44', hemi: 0.55, sun: '#b9c8ff', sunI: 1.05, fog: '#2c3a5e', fogNear: 34, fogFar: 420,
    skyTop: '#101a36', skyHor: '#3a4a73', sunDisc: '#e6eeff', sunSize: 0.0016, sat: 1.0, gain: '#dfe6ff', waterDeep: '#16283a', waterShal: '#24384c', glint: '#cfe0ff', vig: 0.36, shadowExt: 14 },
  dawn: { az: 102, el: 9, sky: '#a8a4c4', ground: '#6a5a4a', hemi: 0.88, sun: '#ffb46c', sunI: 2.2, fog: '#eec39a', fogNear: 55, fogFar: 700,
    skyTop: '#6f7ab0', skyHor: '#f7c489', sunDisc: '#fff0c8', sunSize: 0.003, sat: 1.08, gain: '#fff2e2', waterDeep: '#33506e', waterShal: '#c98f66', glint: '#ffe2a8', vig: 0.27, shadowExt: 18 },
  dusk: { az: 352, el: 7, sky: '#8a7aa8', ground: '#54443c', hemi: 0.8, sun: '#ff9a50', sunI: 2.4, fog: '#cf8a5e', fogNear: 48, fogFar: 640,
    skyTop: '#463e6e', skyHor: '#ef9257', sunDisc: '#ffe9c0', sunSize: 0.0035, sat: 1.1, gain: '#ffe9d2', waterDeep: '#2c4460', waterShal: '#b87a52', glint: '#ffd9a0', vig: 0.31, shadowExt: 18 },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'hook' || S.id === 'cantStop' || S.id === 'leaders' || S.id === 'idea') L.shadowExt = 9;
  if (S.id === 'musicians') L.shadowExt = 13;
  return L;
};

// ---------- cameras ----------
const CAMS = {
  hook: [
    { f: 0, pos: [1.7, 1.75, 6.6], look: [-0.3, 1.3, 2.0], fov: 37 },
    { f: 90, pos: [1.8, 1.8, 7.0], look: [-0.25, 1.3, 2.0], fov: 37 },
    { f: 219, pos: [2.7, 2.3, 9.8], look: [0, 1.25, 1.2], fov: 41 },
  ],
  dayDance: [
    { f: 220, pos: [3.4, 2.6, 10.5], look: [0, 1.2, 0.5], fov: 44 },
    { f: 338, pos: [2.7, 2.4, 11.6], look: [0, 1.2, 0.8], fov: 42 },
  ],
  nightDance: [
    { f: 339, pos: [-3.3, 2.2, 9.2], look: [0, 1.3, 1.6], fov: 42 },
    { f: 444, pos: [-2.7, 2.0, 10.2], look: [0, 1.25, 1.8], fov: 40 },
  ],
  cantStop: [
    { f: 445, pos: [1.6, 1.85, 5.8], look: [0, 1.4, 2.0], fov: 36 },
    { f: 593, pos: [2.1, 2.0, 6.8], look: [0, 1.3, 1.6], fov: 38 },
  ],
  crowdGrows: [
    { f: 594, pos: [0, 7.6, 16.5], look: [0, 0.8, -4.5], fov: 50 },
    { f: 890, pos: [0, 6.7, 13.5], look: [0, 0.9, -3.5], fov: 47 },
  ],
  leaders: [
    { f: 891, pos: [4.1, 2.1, 8.8], look: [1.5, 1.5, 2.9], fov: 40 },
    { f: 982, pos: [3.8, 2.05, 8.3], look: [1.5, 1.5, 2.9], fov: 39 },
  ],
  idea: [
    { f: 983, pos: [3.6, 2.2, 9.2], look: [0.7, 1.4, 1.8], fov: 42 },
    { f: 1079, pos: [3.3, 2.1, 8.7], look: [0.7, 1.4, 1.8], fov: 40 },
  ],
  stage: [
    { f: 1080, pos: [4.6, 3.1, 4.5], look: [0, 1.0, -6.0], fov: 46 },
    { f: 1121, pos: [4.3, 2.9, 3.8], look: [0, 1.05, -6.0], fov: 44 },
  ],
  musicians: [
    { f: 1122, pos: [3.9, 2.9, 3.6], look: [0, 1.7, -6.0], fov: 42 },
    { f: 1256, pos: [3.2, 2.5, 1.8], look: [-0.2, 1.6, -6.0], fov: 40 },
  ],
  collapse: [
    { f: 1257, pos: [0, 4.6, 13.5], look: [0, 1.0, -2.5], fov: 46 },
    { f: 1445, pos: [0, 4.3, 12.2], look: [0, 1.0, -2.0], fov: 44 },
  ],
  stopped: [
    { f: 1446, pos: [0, 5.2, 15.0], look: [0, 0.8, -3.5], fov: 47 },
    { f: 1495, pos: [0, 4.9, 14.0], look: [0, 0.8, -3.0], fov: 45 },
  ],
  mystery: [
    { f: 1496, pos: [1.7, 1.35, 7.6], look: [0.8, 0.35, -1.8], fov: 36, roll: 0 },
    { f: 1627, pos: [1.35, 1.0, 5.0], look: [0.8, 0.3, -1.8], fov: 32, roll: 2.5 },
  ],
};
const KICKS = [{ f: 1258, a: 0.015 }, { f: 1446, a: 0.02 }];
const SHADOW_AT = {
  hook: [0, 1, 2], dayDance: [0, 1, 1], nightDance: [0, 1, 2], cantStop: [0, 1, 2], crowdGrows: [0, 1, -5],
  leaders: [1.3, 1, 2.8], idea: [0.8, 1, 1.5], stage: [0, 1, -6], musicians: [0, 1.5, -6], collapse: [0, 1, -3],
  stopped: [0, 0.5, -3], mystery: [0.8, 0.3, -1.8],
};
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(CAMS[S.id], f, { kicks: KICKS });
  // small white flash only for the night -> dawn time jump
  c.flash = f >= 445 && f < 449 ? (1 - (f - 445) / 4) * 0.45 : 0;
  c.shadowAt = SHADOW_AT[S.id];
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  switch (S.id) {
    case 'hook': return { focus: dist(C.pos, [0, 1.35, 2]), cinf: lerp(12, 5, smooth(ramp(f, 90, 219))) };
    case 'dayDance': return { focus: dist(C.pos, [0, 1.3, 2]), cinf: 6 };
    case 'nightDance': return { focus: dist(C.pos, [0, 1.35, 2]), cinf: 9 };
    case 'cantStop': return { focus: dist(C.pos, [0, 1.4, 2]), cinf: 12 };
    case 'crowdGrows': return { focus: dist(C.pos, [0, 1.2, -3]), cinf: 3 };
    case 'leaders': return { focus: dist(C.pos, [1.3, 1.6, 2.7]), cinf: 11 };
    case 'idea': return { focus: dist(C.pos, [1.2, 1.6, 2.5]), cinf: 8 };
    case 'stage': return { focus: dist(C.pos, [0, 1.2, -6]), cinf: 4 };
    case 'musicians': return { focus: dist(C.pos, [0, 1.9, -6]), cinf: 7 };
    case 'collapse': return { focus: dist(C.pos, [0, 1.2, -3]), cinf: 4 };
    case 'stopped': return { focus: dist(C.pos, [0, 0.6, -3]), cinf: 3 };
    case 'mystery': return { focus: dist(C.pos, [0.8, 0.25, -1.8]), cinf: 11 };
  }
  return { focus: 10, cinf: 0 };
};

// ---------- world state ----------
export const worldAt = (f) => {
  // stage platform rises into place while "They built a stage" is spoken
  const stage = smooth(ramp(f, 1084, 1118));
  // lanterns + warm windows: full at night, embers at dusk
  const lantern = (f >= 339 && f <= 444) ? 1 : (f >= 1257 && f <= 1445) ? 0.35 : 0;
  return { stage, lantern };
};

// ---------- actors (2D cards) ----------
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const withIdle = (f, seed, o = {}) => { const i = idle(f, seed); return { bob: q(i.bob + (o.bob || 0), 3), tilt: q(i.tilt + (o.tilt || 0), 1), headTilt: q(i.headTilt + (o.headTilt || 0), 1), blink: blinkAt(f, seed), ...o }; };
// a dancer's bounce: bob + sway; spin flags when the phase peaks (card yaw handled by caller)
const dance = (f, ph, amp = 1, rate = 1) => {
  const t = (f + ph) * 0.30 * rate;
  return {
    bob: q(Math.abs(Math.sin(t)) * 0.05 * amp, 3),
    tilt: q(Math.sin(t * 0.5) * 6 * amp, 1),
    headTilt: q(Math.sin(t * 0.5 + 1.2) * 5 * amp, 1),
    spin: Math.sin((f + ph) * 0.021 * rate) > 0.86,
  };
};
const TROFFEA = [0, 0, 2];
const CROWD = (() => {
  const offs = [[-2.9, -1.5], [-1.4, -2.5], [0.6, -3.0], [2.4, -2.0], [3.3, -4.0], [-3.3, -5.0], [-4.3, -5.5], [4.4, -6.0], [2.9, -7.5], [-2.2, -7.0], [0.2, -8.5], [-3.5, -9.5], [1.1, -10.0], [3.4, -10.5], [-1.7, -11.0], [-0.5, -12.0], [2.2, -12.5], [-3.0, -13.0], [0.9, -13.5], [3.0, -1.0], [-1.9, -3.8], [2.3, -4.0], [-4.2, -6.8], [2.6, -9.0], [-2.6, -10.8], [0.4, -4.2]];
  const keys = ['vilA', 'vilB', 'vilC', 'vilD', 'vilE', 'vilF', 'vilG', 'vilH', 'vilI', 'vilJ'];
  return offs.map(([x, z], i) => ({ who: keys[i % 10], seed: 20 + i * 3, x, z, ph: (i * 37) % 90, s: 0.96 + (i % 4) * 0.03 }));
})();
// crowd members who fall in the collapse shot, and the frame each fall starts
const FALLEN = [[2, 1256], [5, 1274], [9, 1298], [13, 1322], [17, 1354], [21, 1390]];
const fallenAt = (idx, f) => { const hit = FALLEN.find(([i]) => i === idx); return !!(hit && f >= hit[1]); };

const dancer = (T, f, c, o = {}) => {
  const d = dance(f, c.ph, o.amp ?? 1, o.rate ?? 1);
  const opts = withIdle(f, c.seed, {
    expr: o.expr || 'smile', L: o.L || 'up', R: o.R || 'up',
    bob: d.bob, tilt: d.tilt, headTilt: d.headTilt, blink: d.spin ? 0 : blinkAt(f, c.seed),
  });
  return R(T, c.who, opts, [c.x, 0, c.z], { s: c.s, yaw: d.spin ? q(((f + c.ph) % 56) / 56 * Math.PI * 2, 2) : 0 });
};

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'night' ? '#cdd8ff' : S.light === 'dusk' ? '#ffd9b8' : '#ffffff';
  const troffea = (o, x = TROFFEA[0]) => { const a = R(T, 'troffea', withIdle(f, 5, o), TROFFEA, { tint }); a.x = x; out.push(a); };
  switch (S.id) {
    case 'hook': {
      // she steps in from the left, then the first dance steps land ~f215 (just before the word)
      const stepIn = smooth(ramp(f, 70, 185));
      const x = lerp(-1.15, 0, stepIn), wk = f >= 70 && f < 185 ? ((f - 70) % 26) / 26 : 0;
      if (f < 215) troffea({ expr: f < 60 ? 'neutral' : 'smile', L: 'hang', R: 'hang', step: q(wk), facing: 1 }, x);
      else { const d = dance(f, 0, 0.7); troffea({ expr: 'smile', L: 'up', R: 'up', bob: d.bob, tilt: d.tilt, headTilt: d.headTilt }, x); }
      break;
    }
    case 'dayDance': {
      const d = dance(f, 0, 1);
      troffea({ expr: 'smile', L: 'up', R: 'wave', wv: q(f * 0.3, 1), bob: d.bob, tilt: d.tilt, headTilt: d.headTilt });
      out[out.length - 1].yaw = d.spin ? q((f % 56) / 56 * Math.PI * 2, 2) : 0;
      // stall keeper watching from the left stall
      out.push(R(T, 'vilI', withIdle(f, 31, { expr: 'neutral', L: 'belly', R: 'belly', look: 0.4 }), [-4.4, 0, -3], { tint }));
      break;
    }
    case 'nightDance': {
      const d = dance(f, 0, 0.62, 0.8); // slower, heavier — tired but cannot stop
      troffea({ expr: 'nervous', L: 'up', R: 'hang', bob: d.bob, tilt: d.tilt, headTilt: q(d.headTilt + 4 * Math.sin(f * 0.05), 1) });
      break;
    }
    case 'cantStop': {
      const d = dance(f, 0, 0.55, 0.9);
      troffea({ expr: 'nervous', L: 'up', R: 'up', bob: d.bob, tilt: d.tilt, headTilt: q(6 * Math.sin(f * 0.11), 1) });
      // two watchers by the stalls: still until ~f535, then the swaying catches them
      for (const [who, seed, pos] of [['vilB', 41, [-2.7, 0, 0.2]], ['vilG', 43, [2.8, 0, -0.6]]]) {
        if (f < 535) out.push(R(T, who, withIdle(f, seed, { expr: 'nervous', L: 'hang', R: 'hang', look: 0 }), pos, { tint }));
        else { const dd = dance(f, seed, 0.45); out.push(R(T, who, withIdle(f, seed, { expr: 'smile', L: 'up', R: 'hang', bob: dd.bob, tilt: dd.tilt, headTilt: dd.headTilt }), pos, { tint })); }
      }
      break;
    }
    case 'crowdGrows': {
      const begging = f >= 798; // phrase 13: front rows turn pleading (reach/cheek)
      for (const c of CROWD) out.push(dancer(T, f, c, begging
        ? { expr: c.z > -6 ? 'nervous' : 'smile', L: c.z > -6 ? 'reach' : 'up', R: c.z > -6 ? 'cheek' : 'up', amp: 0.8 }
        : { expr: c.seed % 3 ? 'smile' : 'grin' }));
      // Troffea front-centre, lost in the crowd she started
      const d = dance(f, 0, 1);
      troffea({ expr: begging ? 'nervous' : 'smile', L: 'up', R: 'up', bob: d.bob, tilt: d.tilt, headTilt: d.headTilt });
      break;
    }
    case 'leaders': {
      const grin = f >= 948; // "brilliant idea" lands
      out.push(R(T, 'leaderA', withIdle(f, 51, { expr: grin ? 'grin' : 'stern', L: 'hip', R: grin ? 'lift' : 'hip', look: -0.3 }), [1.5, 0, 2.6], { tint }));
      out.push(R(T, 'leaderB', withIdle(f, 53, { expr: 'stern', L: 'cross', R: 'cross', look: 0.4 }), [2.15, 0, 3.15], { tint }));
      out.push(R(T, 'leaderC', withIdle(f, 57, { expr: grin ? 'smile' : 'stubborn', L: 'belly', R: 'belly', look: -0.2 }), [0.85, 0, 3.15], { tint }));
      break;
    }
    case 'idea': {
      out.push(R(T, 'leaderA', withIdle(f, 51, { expr: 'grin', L: 'up', R: 'point', look: -0.2 }), [1.4, 0, 2.5], { tint }));
      out.push(R(T, 'leaderB', withIdle(f, 53, { expr: 'smile', L: 'hang', R: 'hang', look: 0.3 }), [2.2, 0, 3.1], { tint }));
      out.push(dancer(T, f, CROWD[1], { expr: 'smile' }));
      out.push(dancer(T, f, CROWD[3], { expr: 'grin' }));
      break;
    }
    case 'stage': {
      out.push(R(T, 'workA', withIdle(f, 61, { expr: 'neutral', L: 'lift', R: 'lift', bob: q(Math.abs(Math.sin(f * 0.5)) * 0.02, 3) }), [-3.4, 0, -5.2], { tint }));
      out.push(R(T, 'workB', withIdle(f, 63, { expr: 'stern', L: 'reach', R: 'reach', lift: q(0.4 + 0.3 * Math.sin(f * 0.3), 2) }), [3.4, 0, -5.4], { tint }));
      break;
    }
    case 'musicians': {
      const worse = f >= 1180; // "It made everything worse": the dancing turns frantic
      const beat = q(Math.abs(Math.sin(f * 0.3)) * 0.022, 3);
      out.push(R(T, 'musicA', withIdle(f, 71, { expr: 'grin', L: 'belly', R: 'belly', bob: beat }), [-1.6, 0.9, -6.0], { tint }));
      out.push(R(T, 'musicB', withIdle(f, 73, { expr: 'smile', L: 'up', R: 'up', bob: beat }), [0, 0.9, -6.3], { tint }));
      out.push(R(T, 'musicC', withIdle(f, 79, { expr: 'smile', L: 'belly', R: 'belly', bob: beat }), [1.6, 0.9, -6.0], { tint }));
      for (const i of [0, 1, 19, 20, 4, 25, 23, 24]) out.push(dancer(T, f, CROWD[i], { amp: worse ? 1.35 : 1.05, rate: worse ? 1.25 : 1 }));
      break;
    }
    case 'collapse': {
      for (let i = 0; i < CROWD.length; i++) {
        const c = CROWD[i];
        if (c.z < -9.5 || fallenAt(i, f)) continue; // far rows out of this frame; fallen are fx cards
        const fade = 1 - 0.75 * smooth(ramp(f, 1340, 1440)); // the rest slow to a shuffle
        out.push(dancer(T, f, c, { expr: f > 1300 ? 'nervous' : 'smile', amp: fade, rate: 0.9 }));
      }
      const d = dance(f, 0, 0.4 * (1 - 0.6 * smooth(ramp(f, 1380, 1445))), 0.8);
      troffea({ expr: 'nervous', L: 'up', R: 'hang', bob: d.bob, tilt: d.tilt, headTilt: d.headTilt });
      break;
    }
    case 'stopped': case 'mystery': break; // nobody left standing
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
const FALLEN_STYLE = { vilA: '#4f7fb8', vilB: '#c25a7a', vilC: '#5d8a3a', vilD: '#d9a441', vilE: '#7a4a8a', vilF: '#3f7a6a', vilG: '#b85c38', vilH: '#5a6fb8', vilI: '#8a5d3b', vilJ: '#96604a' };
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  // collapsed dancers (drawn lying down) once their fall frame passes
  if (S.id === 'collapse' || S.id === 'stopped') {
    for (const [i, ff] of FALLEN) {
      if (f < ff) continue;
      if (S.id === 'stopped' && ![2, 9, 17].includes(i)) continue;
      const c = CROWD[i];
      out.push({ key: 'fallen' + i, draw: (p) => T.fxFallen(p, { col: FALLEN_STYLE[c.who], hair: '#2b211c', skin: '#eec39a' }), x: c.x, y: 0, z: c.z, s: c.s, blob: true, shadow: true, order: 2 });
    }
  }
  // the abandoned shoe: the last two shots belong to it
  if (S.id === 'stopped' || S.id === 'mystery') out.push({ key: 'shoe', draw: (p) => T.fxShoe(p, { col: '#8e3324' }), x: 0.8, y: 0, z: -1.8, s: 0.55, blob: true, shadow: false, order: 2 });
  // dust puff as each dancer goes down
  if (S.id === 'collapse') for (const [i, ff] of FALLEN) if (f >= ff && f < ff + 12) { const c = CROWD[i], t = q((f - ff) / 12, 2); out.push(FX('fdust' + i + t, (p) => T.fxDust(p, t, '#d8c9a6'), [c.x, 0.15, c.z + 0.3], 0.7)); }
  // night: a moth circles the left lantern
  if (S.id === 'nightDance') { const a = f * 0.21; out.push(FX('moth', (p) => p.ell(300, 500, 16, 10, '#e8e2d4', 3), [-3.85 + Math.cos(a) * 0.35, 2.6 + Math.sin(a * 1.7) * 0.22, 3.4], 0.16)); }
  return out;
};
