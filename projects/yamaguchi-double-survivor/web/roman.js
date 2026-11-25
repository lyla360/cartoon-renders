FACE.snore = { eye: ["dash", "dash"], brow: [0, -1], mouth: "o" };
FACE.stubborn = { eye: ["lid", "lid"], brow: [4, -3], mouth: "frown" };
FACE.squint = { eye: ["slit", "slit"], brow: [3, -2], mouth: "dash" };
FACE.unimpressed = { eye: ["lid", "lid"], brow: [2, -1], mouth: "dash" };
FACE.euphoric = { eye: ["dot", "dot"], brow: [-3, -2], mouth: "grin" };
FACE.weary = { eye: ["lid", "lid"], brow: [1, 2], mouth: "o" };

// ---------------- Roman-era cast (our own designs), built on the Pen / blob / face helpers above ----------------
const STEEL = "#aeb6bf", BRASS = "#d9a845", LEATHER = "#7a4a2a";
export const OUTFITS = {
  legion: { tunic: "#b8322f", cape: "#8f2228", skin: SKIN, helmet: true, armor: true, spear: true, shield: true },
  old: { tunic: "#9c4a3c", cape: "#6e3330", skin: "#f3d6bb", helmet: "old", armor: true, spear: true, shield: false, beard: "#f4f1ea", brows: "#f4f1ea" },
  toga: { tunic: "#f1ead8", skin: "#f5c9a0", toga: "#6b3c8f", hair: "#3b2a20", stout: true },
  civA: { tunic: "#4f7fb8", skin: "#f5c9a0", hair: "#5a3b2a" },
  civB: { tunic: "#d9a441", skin: SKIN, hair: "#2b211c", dress: "#c25a7a" },
  civC: { tunic: "#5d8a3a", skin: "#c99067", hair: "#1e1714", stout: true },
  workA: { tunic: "#8a5d3b", skin: "#f5c9a0", cap: "#c2733a", apron: "#d8c9a6" },
  workB: { tunic: "#3f6a6f", skin: "#ecd0b6", cap: "#5b4a8a", moustache: "#4a3020" },
  // ---- Strasbourg 1518 cast (dancing plague) ----
  troffea: { tunic: "#a03d2a", dress: "#8e3324", skin: "#f5c9a0", hair: "#4a2c1a" },
  vilA: { tunic: "#4f7fb8", skin: "#f5c9a0", hair: "#5a3b2a" },
  vilB: { tunic: "#d9a441", skin: SKIN, hair: "#2b211c", dress: "#c25a7a" },
  vilC: { tunic: "#5d8a3a", skin: "#c99067", hair: "#1e1714", stout: true },
  vilD: { tunic: "#b85c38", skin: "#eec39a", hair: "#3a2415", dress: "#d9a441" },
  vilE: { tunic: "#7a4a8a", skin: "#ecd0b6", hair: "#241a14" },
  vilF: { tunic: "#3f7a6a", skin: "#c99067", hair: "#14100d", dress: "#3f7a6a" },
  vilG: { tunic: "#b85c38", skin: "#f5c9a0", hair: "#6a4526" },
  vilH: { tunic: "#8a7a3a", skin: "#eec39a", hair: "#2b211c", dress: "#5a6fb8" },
  vilI: { tunic: "#8a5d3b", skin: "#f5c9a0", hair: "#4a3020", cap: "#c2733a", apron: "#d8c9a6" },
  vilJ: { tunic: "#96604a", skin: "#c99067", hair: "#1e1714", dress: "#96604a" },
  leaderA: { tunic: "#43304f", dress: "#43304f", skin: "#eec39a", hair: "#8a8578", beard: "#9a958a", chain: true },
  leaderB: { tunic: "#2e4038", dress: "#2e4038", skin: "#f3d6bb", hair: "#d8d2c4", beard: "#e8e2d4" },
  leaderC: { tunic: "#5a4632", skin: "#c99067", hair: "#3a2a1a", moustache: "#2e2015", stout: true },
  musicA: { tunic: "#6a4a7a", skin: "#f5c9a0", hair: "#2b211c", lute: true },
  musicB: { tunic: "#3f6a8a", skin: "#c99067", hair: "#1e1714", drum: true },
  musicC: { tunic: "#7a5a2a", skin: "#ecd0b6", hair: "#5a3b2a", pipe: true },
  friar: { tunic: "#6b4a2f", dress: "#654628", skin: "#f5c9a0", tonsure: "#77644e", rope: true, woodCross: true },
  baron: { tunic: "#d9a72e", skin: "#f8f4ec", bowler: "#26232a", waistcoat: true, watchChain: true, cane: true, sweat: true, legs: "#1b1a17", hem: "#2a2723", longLegs: 1.82, thinLegs: true },
  dancer: { tunic: "#a03d2a", dress: "#8e3324", skin: "#f8f4ec", hair: "#6a4026", longHair: true, scarf: "#f1ead8", braid: true, blush: true, lacing: true, panel: "#e8dcc0", dressBelt: true },
  // ---- Niagara 1859 cast (Blondin) ----
  blondin: { tunic: "#262133", skin: "#f5c9a0", hair: "#2b211c", bowtie: "#a02c30", pole: true, legs: "#1d1a26" },
  blondinSack: { tunic: "#262133", dress: "#96754a", skin: "#f5c9a0", hair: "#2b211c" },
  blondinStilt: { tunic: "#262133", skin: "#f5c9a0", hair: "#2b211c", bowtie: "#a02c30", stilts: true, longLegs: 2.05, legs: "#1d1a26" },
  yamaguchi: { tunic: "#3f4a5a", skin: "#f0c8a2", hair: "#1e1714", legs: "#2a2d33" },
  yamaguchiHurt: { tunic: "#3f4a5a", skin: "#f0c8a2", hair: "#1e1714", legs: "#2a2d33", sweat: true },
  // ---- Yamaguchi REDESIGN (Baron-level detail, 2026-11-21) — pale head, thin long legs, detailed 1945 suit ----
  yamaguchi2: { tunic: "#343a42", skin: "#f8f4ec", hair: "#1e1714", suit: true, tie: "#7a2430", watchChain: true, briefcase: true, legs: "#23252b", longLegs: 1.82, thinLegs: true },
  yamaguchi2Hurt: { tunic: "#343a42", skin: "#f8f4ec", hair: "#1e1714", suit: true, tie: "#7a2430", tieLoose: true, watchChain: true, bandage: true, soot: true, sweat: true, legs: "#23252b", longLegs: 1.82, thinLegs: true },
  boss: { tunic: "#5a4632", skin: "#eec39a", hair: "#3a2a1a", moustache: "#2e2015", stout: true },
  // ---- Yamaguchi REDESIGN supporting cast (Baron-level, 2026-11-25) ----
  boss2: { tunic: "#2e3440", skin: "#f8f4ec", hair: "#2b211c", suit: true, tie: "#3d2b18", watchChain: true, moustache: "#241a14", stout: true, legs: "#1f2229", longLegs: 1.55, thinLegs: true },
  clerk2: { tunic: "#46525e", skin: "#f8f4ec", hair: "#1e1714", suit: true, tie: "#2e4a6b", legs: "#262a31", longLegs: 1.7, thinLegs: true },
  wife2: { tunic: "#3e4a6b", dress: "#3e4a6b", skin: "#f8f4ec", hair: "#241a14", longHair: true, panel: "#e8dcc0", dressBelt: true },
  yamaguchiOld: { tunic: "#4a4238", skin: "#f8f4ec", hair: "#d8d2c4", suit: true, tie: "#5a4632", watchChain: true, cane: true, legs: "#2e2a26", longLegs: 1.7, thinLegs: true },
  manager: { tunic: "#5a4632", skin: "#eec39a", hair: "#4a3020", moustache: "#3a2415", cap: "#3a3230" },
};

/** galea: iron bowl, brass brow band, cheek guards, transverse red crest */
const galea = (p, H, cx, hc, light, thick, ow, old, u) => {
  const crest = old ? "#8d4b3f" : "#d2372f", bowl = old ? "#8f8a7e" : STEEL;
  // crest (behind the bowl top)
  const cy0 = hc - H.b * 0.98;
  const cr = ellPts(cx, cy0, 0.66 * 2 * H.a, 0.42 * 2 * H.b, 180, 360, 0, 40);
  cr.push([cx + 0.66 * 2 * H.a * 0.98, cy0 + 4 * u], [cx - 0.66 * 2 * H.a * 0.98, cy0 + 4 * u]);
  const crP = [...ellPts(cx, cy0 + 2 * u, 0.62 * 2 * H.a, 0.36 * 2 * H.b, 180, 360, 0, 40)];
  p.shadedFill(crP, crest, mul(crest, [0.7, 0.62, 0.7]), light, 0.62 * 2 * H.a, 0.3);
  p.clip(crP, () => { for (let i = -9; i <= 9; i++) p.stroke([[cx + i * 7.4 * u, cy0], [cx + i * 9.4 * u, cy0 - 0.62 * H.b * Math.cos(i / 11)]], 1.4 * u, mul(crest, [0.62, 0.55, 0.62])); });
  if (old) p.clip(crP, () => { for (let i = 0; i < 6; i++) p.ell(cx + (i - 3) * 22 * u, cy0 - 18 * u - (i % 2) * 10 * u, 9 * u, 5 * u, "#6f6a5e", 0); });
  p.inkRing(crP, ow * 0.85, thick);
  p.poly(rrect(cx - 10 * u, cy0 - 6 * u, cx + 10 * u, cy0 + 6 * u, 3 * u), BRASS, 2 * u);
  // bowl: upper head cap
  const bandY = hc - H.b * 0.42;
  const bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  p.shadedFill(bp, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => {
    p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 4 * u, "#ffffff55");
    if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (3 + (i % 3) * 2) * u, (2 + (i % 2)) * u, "#8a4b22", 0);
  });
  p.inkRing(bp, ow * 0.9, thick);
  p.band([[cx - H.a * 1.04, bandY], [cx + H.a * 1.04, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
  for (const s of [-1, 1]) p.dot(cx + s * 0.55 * H.a, bandY, 2.2 * u, "#fff3c4");
};
const cheeks = (p, H, cx, hc, light, ow, old, u) => {
  const bowl = old ? "#8f8a7e" : STEEL;
  for (const s of [-1, 1]) {
    const x0 = cx + s * 0.78 * H.a, x1 = cx + s * 1.07 * H.a, y0 = hc - H.b * 0.42, y1 = hc + H.b * 0.48;
    const pts = [[x0, y0], [x1, y0], [x1 - s * 0.04 * H.a, y1 - 0.1 * H.b], [x0 + s * 0.06 * H.a, y1], [x0 - s * 0.05 * H.a, (y0 + y1) / 2]];
    p.shadedFill(pts, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, 0.2 * H.a, 0.3);
    p.poly(pts, null, ow * 0.8);
    p.dot((x0 + x1) / 2, (y0 + y1) / 2 - 0.05 * H.b, 2.2 * u, BRASS);
  }
};
/** tonsure: bald crown with a ring of hair hugging the sides of the head (Franciscan friar) */
const tonsureOn = (p, H, cx, hc, col, u, ow, thick, light) => {
  for (const s of [-1, 1]) {
    const a0 = s < 0 ? 128 : -52, a1 = s < 0 ? 232 : 52;
    const band = [...ellPts(cx, hc, H.a * 1.03, H.b * 1.04, a0, a1, 0, 28), ...ellPts(cx, hc, H.a * 0.76, H.b * 0.80, a1, a0, 0, 28)];
    p.shadedFill(band, col, mul(col, [0.78, 0.76, 0.8]), light, H.a * 0.3, 0.3);
    p.clip(band, () => { for (let i = 0; i < 5; i++) { const a = rad(a0 + (a1 - a0) * (0.16 + i * 0.17)); const x0 = cx + Math.cos(a) * H.a * 0.9, y0 = hc + Math.sin(a) * H.b * 0.92; p.stroke([[x0, y0], [x0 - s * 3 * u, y0 + 10 * u]], 1.2 * u, mul(col, [0.68, 0.66, 0.7])); } });
    p.inkRing(band, ow * 0.55, thick);
  }
};
/** bowler: rounded felt dome + flat wide brim (railroad baron) */
const bowlerOn = (p, H, cx, hc, col, u, ow, thick, light) => {
  const by = hc - H.b * 0.66;
  const dome = [...ellPts(cx, by, H.a * 0.78, H.b * 0.60, 180, 360, 0, 40), [cx - H.a * 0.78, by]];
  p.shadedFill(dome, col, mul(col, [0.45, 0.45, 0.5]), light, H.a * 0.6, 0.35);
  p.clip(dome, () => { p.stroke(ellPts(cx - 22 * u, by - 0.30 * H.b, 0.20 * H.a, 0.15 * H.b, 195, 305, 0, 14), 4.5 * u, "#ffffff40"); });
  p.inkRing(dome, ow * 0.85, thick);
  const brim = ellPts(cx, by + 2 * u, H.a * 1.22, H.b * 0.15, 0, 360, 0, 48);
  p.shadedFill(brim, mix(col, "#ffffff", 0.08), mul(col, [0.5, 0.5, 0.55]), light, H.a * 0.8, 0.3);
  p.inkRing(brim, ow * 0.85, thick);
};
/** long hair: side falls over the shoulders, a white scarf band, and a front braid (dancing woman) */
const longHairOn = (p, H, cx, hc, O, u, ow, thick, light) => {
  const col = O.hair, dark = mul(col, [0.72, 0.7, 0.74]);
  // side falls: wavy panels from the head's sides down over the shoulders
  for (const s of [-1, 1]) {
    const x0 = cx + s * 0.80 * H.a, x1 = cx + s * 1.06 * H.a, y0 = hc - 0.30 * H.b, y1 = hc + 2.05 * H.b;
    const pts = [[x0, y0], [x1, y0 + 0.25 * H.b], [x1 + s * 2 * u, (y0 + y1) / 2], [x1 - s * 3 * u, y1 - 0.28 * H.b], [x0 + s * 4 * u, y1], [x0 - s * 2 * u, (y0 + y1) / 2]];
    p.shadedFill(pts, col, dark, light, H.a * 0.3, 0.3);
    p.poly(pts, null, ow * 0.6);
    for (let i = 0; i < 3; i++) { const yy = y0 + (0.35 + i * 0.45) * H.b; p.stroke([[x0 + s * 4 * u, yy], [x1 - s * 4 * u, yy + 0.18 * H.b]], 1.1 * u, dark); }
  }
  // scarf band across the crown + a knot at the side
  if (O.scarf) {
    const band = [...ellPts(cx, hc - 0.06 * H.b, H.a * 1.05, H.b * 1.02, 195, 345, 0, 28), ...ellPts(cx, hc - 0.06 * H.b, H.a * 1.05, H.b * 0.78, 345, 195, 0, 28)];
    p.shadedFill(band, O.scarf, mul(O.scarf, [0.82, 0.82, 0.86]), light, H.a * 0.4, 0.3);
    p.inkRing(band, ow * 0.55, thick);
    p.dot(cx + 0.98 * H.a, hc - 0.28 * H.b, 4.2 * u, O.scarf);
  }
  // braid over her right shoulder: overlapping links slanting down to the chest
  if (O.braid) {
    let bx = cx + 0.86 * H.a, by = hc + 0.55 * H.b;
    for (let i = 0; i < 5; i++) { p.ell(bx, by, 0.20 * H.a, 0.17 * H.b, i % 2 ? dark : col, 1.4 * u); bx -= 0.10 * H.a; by += 0.34 * H.b; }
    p.dot(bx + 0.05 * H.a, by - 0.05 * H.b, 3.4 * u, "#a03d2a");
  }
};
const cobweb = (p, cx, cy, r, u) => {
  const g = p.g; g.save(); g.globalAlpha = 0.8;
  for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); p.stroke([[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], 1.1 * u, "#f2f2f2"); }
  for (let k = 1; k <= 4; k++) { const rr = r * k / 4.3, pts = []; for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } p.stroke(pts, 1 * u, "#f2f2f2"); }
  g.restore();
};

/** front-facing Roman-era character. opts: expr, blink, look, facing, seed, L/R arm poses, tilt, headTilt, bob, nohelmet, light */
export const romanFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? OUTFITS[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = O.spear ? "spear" : "hang", tilt = 0, headTilt = 0,
    bob = 0, nohelmet = false, light = rad(-120), web = false, step = 0 } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = O.longLegs ?? 1.38, sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = O.legs ?? mix(O.tunic, INK, 0.62), armCol = mix(O.tunic, INK, 0.5);
  const helmet = !!O.helmet && !nohelmet, old = O.helmet === "old";
  p.rot = null;
  // ---- cape behind everything ----
  if (O.cape) {
    const cp = [[cx - 0.48 * W, chin + 0.08 * HH], [cx + 0.48 * W, chin + 0.08 * HH], [cx + 0.62 * W, sole - 0.55 * HH], [cx + 0.2 * W, sole - 0.45 * HH], [cx - 0.2 * W, sole - 0.5 * HH], [cx - 0.62 * W, sole - 0.55 * HH]];
    p.gradFill(cp, O.cape, mul(O.cape, [0.6, 0.6, 0.7]), light); p.inkRing(cp, ow * 0.8, thick);
  }
  // ---- legs ----
  const dress = !!O.dress;
  for (const side of [-1, 1]) {
    const up = Math.max(0, Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)))) * 30 * (step ? 1 : 0);
    const hx = cx + side * 16 * u, fx = cx + side * (O.thinLegs ? 30 : 22) * u, fy = sole - 4 * u - up;
    if (O.thinLegs) { // baron: long thin stick legs, plain dark shoes
      p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 3.4 * u, legCol);
      p.ell(fx + side * 4 * u, fy + 1 * u, 8.5 * u, 3.8 * u, "#141210", 1.6 * u);
      continue;
    }
    if (O.stilts) { // stilt poles run alongside each leg down past the shoe to the rope
      p.band([[hx + side * 7 * u, hipY + 0.1 * HH], [fx + side * 7 * u, sole + 0.34 * HH]], "#8a5a34", 3.4 * u, 1.4 * u, "round");
      p.poly(rrect(fx - 9 * u, fy - 3 * u, fx + 11 * u, fy + 3 * u, 2 * u), "#5b3d22", 1.6 * u);
    }
    p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 5.8 * u, legCol);
    const sandal = O.helmet ? LEATHER : "#5a3b2a";
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u + 3, INK);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u, sandal);
    if (O.helmet) for (let k = 1; k <= 3; k++) p.stroke([[fx - 4 * u, fy - k * 0.07 * HH], [fx + 4 * u, fy - k * 0.07 * HH - 2 * u]], 2 * u, LEATHER);
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: (0.4 * W) / 1.06 * (O.stout ? 1.12 : 1), b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.17 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.1 + k * u);
    switch (pose) {
      case "spear": return { pts: [s, [X(6), s[1] + 0.42 * HH], [X(10), s[1] + 0.2 * HH]], front: false };
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], front: false, finger: true };
      case "up": return { pts: [s, [X(14), s[1] - 0.3 * HH], [X(22), s[1] - 0.75 * HH]], front: false };
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(opts.wv || 0)), s[1] - 0.62 * HH]], front: false };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]], front: false };
      case "belly": return { pts: [s, [X(8), s[1] + 0.45 * HH], [tcx + side * 0.25 * T.a, torsoBot - 0.35 * HH]], front: true };
      case "temple": return { pts: [s, [X(26), s[1] + 0.05 * HH], [cx + side * (H.a + 16 * u), hc - 0.1 * HH]], front: false, swirl: true };
      case "lift": return { pts: [s, [X(20), s[1] - 0.25 * HH], [X(4), s[1] - 0.82 * HH]], front: false };
      case "shield": return { pts: [s, [X(4), s[1] + 0.4 * HH], [tcx + side * 0.6 * T.a, torsoBot - 0.1 * HH]], front: true };
      case "cross": return { pts: [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * T.a, s[1] + 0.32 * HH]], front: true };
      case "reach": { const lf = (opts.lift || 0) * 0.62 * HH; return { pts: [s, [X(42), s[1] - 0.12 * HH - lf * 0.6], [X(82), s[1] - 0.5 * HH - lf]], front: false }; }
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]], front: false };
      case "thumb": return { pts: [s, [X(20), s[1] + 0.12 * HH], [X(44), s[1] - 0.12 * HH]], front: false, thumb: true };
      default: return { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]], front: false };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
    const [hx, hy] = a.pts[2];
    p.dot(hx, hy, 5.5 * u);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.stroke([[hx, hy], [hx + dx / l * 14 * u, hy + dy / l * 14 * u]], 2.6 * u); }
    if (a.thumb) p.stroke([[hx, hy], [hx + Math.sign(hx - cx) * 6 * u, hy - 12 * u]], 2.6 * u);
  };
  // spear behind
  if (O.spear && R === "spear") {
    const [hx, hy] = arms[1].pts[2], s0 = [hx + 2 * u, sole - 2 * u], s1 = [hx - 3 * u, 70];
    p.band([s0, s1], old ? "#6d5236" : "#8a5a34", 4.2 * u, 1.4 * u, "round");
    const tip = [[s1[0] - 7 * u, s1[1] + 6 * u], [s1[0], s1[1] - 34 * u], [s1[0] + 7 * u, s1[1] + 6 * u], [s1[0], s1[1] + 14 * u]];
    p.poly(tip, old ? "#8b7c6a" : "#c9cfd6", 2 * u);
    if (web) cobweb(p, s1[0] - 2 * u, s1[1] + 60 * u, 70 * u, u);
  }
  for (const a of arms) if (!a.front) drawArm(a);
  // torso
  if (dress) {
    const D = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 2.5, egg: 0.35, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(cx, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, O.dress, mul(O.dress, SH_CLOTH), light); p.inkRing(dp, ow, thick);
    if (O.panel) { // contrasting apron front panel down the skirt (top hides under the torso curve)
      const pn = [[cx - 0.15 * D.a, torsoBot - 0.02 * HH], [cx + 0.15 * D.a, torsoBot - 0.02 * HH], [cx + 0.33 * D.a, sole - 0.52 * HH], [cx - 0.33 * D.a, sole - 0.52 * HH]];
      p.clip(dp, () => { p.poly(pn, O.panel, 1.6 * u); p.stroke([[cx, torsoBot + 0.04 * HH], [cx, sole - 0.56 * HH]], 1.1 * u, mul(O.panel, [0.8, 0.78, 0.8])); });
    }
  }
  // below the torso: NO slab — the torso blob's own rounded bottom is the hem, and the
  // legs (drawn earlier, from hipY) emerge directly beneath its curve. Armor keeps its
  // pteruges straps, but each strap now hangs from the torso's curved lower edge:
  // its tip parallels the body curve instead of ending on a straight slab line.
  if (!dress && O.armor) {
    for (let i = -3; i <= 3; i++) {
      const dxn = i * 0.27, edge = torsoBot - (1 - Math.pow(1 - Math.pow(Math.abs(dxn), 2.6), 0.385)) * T.b;
      const x = tcx + dxn * T.a, st = [[x - 9 * u, edge - 0.12 * HH], [x + 9 * u, edge - 0.12 * HH], [x + 9 * u, edge + 0.22 * HH], [x - 9 * u, edge + 0.22 * HH]];
      p.poly(st, old ? "#5e4632" : LEATHER, 1.6 * u);
    }
  }
  p.gradFill(tp, O.tunic, mul(O.tunic, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.armor) {
      const top = chin - 0.1 * HH, bot = torsoBot - 0.25 * HH, n = 5;
      for (let i = 0; i < n; i++) {
        const y0 = top + (bot - top) * i / n, y1 = top + (bot - top) * (i + 1) / n;
        const c = old ? (i % 2 ? "#8d8679" : "#9a9384") : (i % 2 ? "#a7b0ba" : "#bcc4cc");
        p.poly([[tcx - 1.5 * T.a, y0], [tcx + 1.5 * T.a, y0 + 3 * u], [tcx + 1.5 * T.a, y1 + 3 * u], [tcx - 1.5 * T.a, y1]], c, 1.8 * u);
      }
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.2 * HH], [tcx + 1.4 * T.a, torsoBot - 0.2 * HH]], LEATHER, 0.08 * HH, 1.5 * u);
      for (let i = -2; i <= 2; i++) p.dot(tcx + i * 0.3 * T.a, torsoBot - 0.2 * HH, 2.4 * u, BRASS);
      if (old) for (let i = 0; i < 5; i++) p.ell(tcx + Math.sin(i * 1.7) * 0.7 * T.a, top + (bot - top) * ((i * 0.31) % 1), 6 * u, 3 * u, "#8a4b22", 0);
    } else {
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.24 * HH], [tcx + 1.4 * T.a, torsoBot - 0.24 * HH]], O.apron ? "#5a3b2a" : "#e2c27a", 0.05 * HH, 1.2 * u);
      if (O.toga) p.band([[tcx - 1.0 * T.a, chin - 0.1 * HH], [tcx + 1.1 * T.a, torsoBot - 0.1 * HH]], O.toga, 0.16 * HH, 1.6 * u);
      if (O.apron) p.poly([[tcx - 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.6 * T.a, torsoBot + 0.2 * HH], [tcx - 0.6 * T.a, torsoBot + 0.2 * HH]], O.apron, 1.6 * u);
      p.stroke([[tcx - 0.2 * T.a, chin + 0.02 * HH], [tcx, chin + 0.16 * HH], [tcx + 0.2 * T.a, chin + 0.02 * HH]], 2 * u);
    }
  });
  p.inkRing(tp, ow, thick);
  if (O.lacing) { // criss-cross lacing down the bodice (dancing woman)
    const y0 = chin + 0.12 * HH, y1 = chin + 0.72 * HH, lace = "#e8dcc0";
    p.clip(tp, () => {
      for (let i = 0; i < 4; i++) {
        const ya = y0 + (y1 - y0) * i / 4, yb = y0 + (y1 - y0) * (i + 1) / 4;
        p.stroke([[tcx - 9 * u, ya], [tcx + 9 * u, yb]], 2.2 * u, lace);
        p.stroke([[tcx + 9 * u, ya], [tcx - 9 * u, yb]], 2.2 * u, lace);
      }
      for (let i = 0; i <= 4; i++) { const yy = y0 + (y1 - y0) * i / 4; for (const s of [-1, 1]) p.dot(tcx + s * 9 * u, yy, 1.9 * u, "#3a2415"); }
    });
  }
  if (O.dressBelt) { // leather waist belt + brass buckle at the bodice bottom
    const beltY = torsoBot - 0.10 * HH;
    p.clip(tp, () => { p.band([[tcx - 1.2 * T.a, beltY], [tcx + 1.2 * T.a, beltY]], "#4a3226", 0.07 * HH, 1.3 * u, "round"); });
    p.poly(rrect(tcx - 6 * u, beltY - 5 * u, tcx + 6 * u, beltY + 5 * u, 2 * u), BRASS, 1.6 * u);
  }
  if (O.chain) { // gold chain of office across the chest + pendant
    for (let i = -3; i <= 3; i++) p.dot(tcx + i * 0.17 * T.a, chin + 0.3 * HH + Math.abs(i) * 0.045 * HH, 3.4 * u, "#e6c068");
    p.ell(tcx, chin + 0.52 * HH, 7 * u, 9 * u, "#e6c068", 2 * u);
  }
  if (O.waistcoat) { // railroad baron: white shirt V, cravat knot, button row, pocket flaps
    p.poly([[tcx - 0.21 * T.a, chin + 0.03 * HH], [tcx + 0.21 * T.a, chin + 0.03 * HH], [tcx, chin + 0.40 * HH]], "#f4efe2", 1.6 * u);
    p.dot(tcx, chin + 0.11 * HH, 2.8 * u, "#26232a");
    for (let i = 0; i < 4; i++) p.ell(tcx, chin + (0.44 + i * 0.115) * HH, 3.2 * u, 3.2 * u, "#f0e7cd", 1.4 * u);
    for (const s of [-1, 1]) p.stroke([[tcx + s * 0.36 * T.a, torsoBot - 0.40 * HH], [tcx + s * 0.72 * T.a, torsoBot - 0.40 * HH]], 2.4 * u, mix(O.tunic, INK, 0.3));
  }
  if (O.watchChain) { // gold pocket-watch chain: sags from the second button to the right pocket, fob at the end
    const A = [tcx + 2 * u, chin + 0.555 * HH], B = [tcx + 0.62 * T.a, torsoBot - 0.42 * HH], C = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 0.11 * HH];
    for (let i = 0; i <= 14; i++) { const t = i / 14, x = (1 - t) * (1 - t) * A[0] + 2 * (1 - t) * t * C[0] + t * t * B[0], y = (1 - t) * (1 - t) * A[1] + 2 * (1 - t) * t * C[1] + t * t * B[1]; p.dot(x, y, 2.0 * u, "#d9a845"); }
    p.ell(B[0], B[1] + 3 * u, 4.4 * u, 4.4 * u, "#e6c068", 1.5 * u);
  }
  if (O.suit) { // 1945 engineer's suit at Baron detail level: shirt V, folded lapels, tie, button row, pockets, belt
    const dk = mul(O.tunic, [0.6, 0.6, 0.66]), lt = mix(O.tunic, "#ffffff", 0.16);
    p.poly([[tcx - 0.20 * T.a, chin + 0.03 * HH], [tcx + 0.20 * T.a, chin + 0.03 * HH], [tcx, chin + 0.38 * HH]], "#f4efe2", 1.6 * u); // shirt V
    for (const s of [-1, 1]) p.poly([[tcx + s * 0.20 * T.a, chin + 0.03 * HH], [tcx + s * 0.35 * T.a, chin + 0.10 * HH], [tcx + s * 0.06 * T.a, chin + 0.44 * HH], [tcx, chin + 0.38 * HH]], lt, 1.5 * u); // lapels
    const tx = O.tieLoose ? 5 * u : 0; // tie: knot + tapered blade, knocked askew after the blast
    p.poly([[tcx + tx - 4.5 * u, chin + 0.05 * HH], [tcx + tx + 4.5 * u, chin + 0.05 * HH], [tcx + tx + 2.5 * u, chin + 0.13 * HH], [tcx + tx - 2.5 * u, chin + 0.13 * HH]], O.tie, 1.4 * u);
    p.poly([[tcx + tx - 5.5 * u, chin + 0.12 * HH], [tcx + tx + 5.5 * u, chin + 0.12 * HH], [tcx + tx + 7.5 * u, chin + 0.46 * HH], [tcx + tx, chin + 0.56 * HH], [tcx + tx - 7.5 * u, chin + 0.46 * HH]], O.tie, 1.5 * u);
    p.stroke([[tcx + tx, chin + 0.15 * HH], [tcx + tx + (O.tieLoose ? 3 * u : 0), chin + 0.43 * HH]], 1.1 * u, mul(O.tie, [0.68, 0.68, 0.74]));
    for (let i = 0; i < 3; i++) p.ell(tcx, chin + (0.64 + i * 0.125) * HH, 3.1 * u, 3.1 * u, "#c9cdd4", 1.4 * u); // jacket buttons
    p.stroke([[tcx - 0.52 * T.a, chin + 0.34 * HH], [tcx - 0.18 * T.a, chin + 0.34 * HH]], 2.2 * u, dk); // breast pocket
    p.poly([[tcx - 0.47 * T.a, chin + 0.34 * HH], [tcx - 0.38 * T.a, chin + 0.25 * HH], [tcx - 0.29 * T.a, chin + 0.34 * HH]], "#f6f1e2", 1.3 * u); // pocket square
    for (const s of [-1, 1]) p.stroke([[tcx + s * 0.34 * T.a, torsoBot - 0.38 * HH], [tcx + s * 0.70 * T.a, torsoBot - 0.38 * HH]], 2.4 * u, dk); // flap pockets
    const beltY = torsoBot - 0.24 * HH; // leather belt over the generic band + brass buckle
    p.clip(tp, () => { p.band([[tcx - 1.2 * T.a, beltY], [tcx + 1.2 * T.a, beltY]], "#2a211c", 0.055 * HH, 1.2 * u, "round"); });
    p.poly(rrect(tcx - 6 * u, beltY - 5 * u, tcx + 6 * u, beltY + 5 * u, 2 * u), BRASS, 1.6 * u);
    if (O.soot) p.clip(tp, () => { // ash smudges across the jacket after the blast
      p.ell(tcx - 0.45 * T.a, chin + 0.55 * HH, 0.16 * T.a, 0.07 * HH, "#1c1a17aa", 0);
      p.ell(tcx + 0.38 * T.a, torsoBot - 0.45 * HH, 0.13 * T.a, 0.06 * HH, "#1c1a1799", 0);
      p.ell(tcx + 0.10 * T.a, chin + 0.82 * HH, 0.10 * T.a, 0.05 * HH, "#1c1a1788", 0);
    });
  }
  if (O.rope) { // Franciscan rope belt (cingulum): hemp band over the robe, knot at the front, two dangling ends
    const wy = torsoBot - 0.24 * HH;
    p.band([[tcx - 0.94 * T.a, wy], [tcx + 0.94 * T.a, wy]], "#c8a165", 0.075 * HH, 1.6 * u, "round");
    for (let i = -2; i <= 2; i++) p.stroke([[tcx + i * 0.34 * T.a, wy - 0.03 * HH], [tcx + i * 0.34 * T.a + 3 * u, wy + 0.03 * HH]], 1.1 * u, "#a37f45");
    p.dot(tcx + 0.06 * T.a, wy + 0.01 * HH, 4.6 * u, "#b98d4f"); p.dot(tcx + 0.06 * T.a, wy + 0.01 * HH, 2.2 * u, "#8a6535");
    for (const e of [-1, 1]) { const ex = tcx + 0.06 * T.a + e * 0.10 * T.a; p.stroke([[tcx + 0.06 * T.a, wy + 0.03 * HH], [ex, wy + 0.30 * HH]], 3.4 * u, "#c8a165"); p.dot(ex, wy + 0.32 * HH, 3 * u, "#b98d4f"); }
  }
  if (O.woodCross && L === "belly" && R === "belly") { // small wooden cross held against the chest with both hands
    const kx = tcx, y0 = torsoBot - 0.88 * HH, y1 = torsoBot - 0.22 * HH, barY = torsoBot - 0.70 * HH;
    p.poly([[kx - 2.5 * u, y0], [kx + 2.5 * u, y0], [kx + 2.5 * u, y1], [kx - 2.5 * u, y1]], "#7a5230", 1.8 * u);
    p.poly([[kx - 0.30 * T.a, barY - 2.2 * u], [kx + 0.30 * T.a, barY - 2.2 * u], [kx + 0.30 * T.a, barY + 2.2 * u], [kx - 0.30 * T.a, barY + 2.2 * u]], "#7a5230", 1.8 * u);
    p.stroke([[kx, y0 + 4 * u], [kx, y1 - 4 * u]], 1.1 * u, "#5b3a20");
  }
  if (O.lute) { // lute held at the belly: pear body, neck up-left, sound hole + strings
    p.ell(tcx + 0.16 * T.a, torsoBot - 0.42 * HH, 0.30 * T.a, 0.34 * HH, "#8a5a34", 2.4 * u);
    p.ell(tcx + 0.16 * T.a, torsoBot - 0.46 * HH, 0.10 * T.a, 0.11 * HH, "#3a2614", 0);
    p.stroke([[tcx + 0.02 * T.a, torsoBot - 0.62 * HH], [tcx - 0.52 * T.a, torsoBot - 1.02 * HH]], 5.5 * u, "#5b3d22");
    p.stroke([[tcx + 0.10 * T.a, torsoBot - 0.68 * HH], [tcx + 0.22 * T.a, torsoBot - 0.2 * HH]], 1.1 * u, "#e8ddc4");
  }
  if (O.drum) { // waist drum: red shell, pale head, rope zigzag
    const dx0 = tcx - 0.34 * T.a, dx1 = tcx + 0.34 * T.a, dy0 = torsoBot - 0.66 * HH, dy1 = torsoBot - 0.2 * HH;
    p.poly(rrect(dx0, dy0, dx1, dy1, 6 * u), "#a03d2a", 2.2 * u);
    p.ell(tcx, dy0, 0.34 * T.a, 0.07 * HH, "#e8dcc0", 2 * u);
    for (let i = 0; i < 4; i++) { const xa = dx0 + (dx1 - dx0) * i / 4, xb = dx0 + (dx1 - dx0) * (i + 1) / 4; p.stroke([[xa, dy0 + 3 * u], [xb, dy1 - 3 * u]], 1.6 * u, "#e8dcc0"); }
  }
  if (O.cane && L === "hang") { // thin walking cane in the left hand, gold knob at the grip
    const [hx, hy] = arms[0].pts[2];
    p.band([[hx - 1 * u, hy - 7 * u], [hx - 8 * u, sole - 2 * u]], "#7a5c22", 2.4 * u, 1.1 * u, "round");
    p.ell(hx - 1 * u, hy - 9 * u, 4.4 * u, 4.4 * u, "#e6c068", 1.6 * u);
  }
  if (O.briefcase && L === "hang") { // engineer's leather briefcase hanging from the left hand: handle, flap, brass clasps
    const [hx, hy] = arms[0].pts[2], bx = hx - 2 * u, by = hy + 0.16 * HH;
    p.stroke([[hx - 12 * u, by], [hx - 12 * u, hy + 2 * u], [hx + 10 * u, hy + 2 * u], [hx + 10 * u, by]], 3 * u, "#4a3226");
    p.poly(rrect(bx - 48 * u, by, bx + 48 * u, by + 0.58 * HH, 6 * u), "#7a4a2a", 2.2 * u);
    p.stroke([[bx - 48 * u, by + 0.20 * HH], [bx + 48 * u, by + 0.20 * HH]], 2.2 * u, "#4a3226");
    p.stroke([[bx - 40 * u, by + 0.10 * HH], [bx + 40 * u, by + 0.10 * HH]], 1.2 * u, "#96683f");
    for (const s of [-1, 1]) p.poly(rrect(bx + s * 26 * u - 4 * u, by + 0.15 * HH, bx + s * 26 * u + 4 * u, by + 0.25 * HH, 1.5 * u), BRASS, 1.3 * u);
  }
  if (O.armor) for (const s of [-1, 1]) { // shoulder plates
    const sp = ellPts(tcx + s * 0.72 * T.a, chin + 0.1 * HH, 0.42 * T.a, 0.13 * HH, 180, 360, s * 8, 20);
    p.poly(sp, old ? "#9a9384" : "#c5ccd3", 1.8 * u);
  }
  if (O.moss) {/* reserved */}
  for (const a of arms) if (a.front) drawArm(a);
  // shield in front, held by the left hand
  if (O.shield && L === "shield") {
    const sx = tcx - 0.55 * T.a, sy = torsoBot + 0.05 * HH, sw = 0.36 * W, sh = 0.78 * HH;
    const sp = rrect(sx - sw, sy - sh, sx + sw, sy + sh, 8 * u);
    p.gradFill(sp, "#c0302c", "#7d1d22", light);
    p.clip(sp, () => {
      p.band([[sx - sw, sy], [sx + sw, sy]], BRASS, 6 * u, 1.2 * u);
      p.band([[sx, sy - sh], [sx, sy + sh]], BRASS, 6 * u, 1.2 * u);
      for (const s of [-1, 1]) { p.stroke([[sx + s * 12 * u, sy - 14 * u], [sx + s * 34 * u, sy - 46 * u], [sx + s * 22 * u, sy - 44 * u], [sx + s * 46 * u, sy - 74 * u]], 3.5 * u, BRASS); p.stroke([[sx + s * 12 * u, sy + 14 * u], [sx + s * 34 * u, sy + 46 * u], [sx + s * 22 * u, sy + 44 * u], [sx + s * 46 * u, sy + 74 * u]], 3.5 * u, BRASS); }
      p.stroke(ellPts(sx - sw * 0.5, sy - sh * 0.7, sw * 0.3, sh * 0.1, 200, 320, 0, 10), 3 * u, "#ffffff44");
    });
    p.ell(sx, sy, 13 * u, 13 * u, "#e6c068", 2.2 * u);
    p.inkRing(sp, ow, thick);
  }
  if (O.pole && !opts.noPole) { // Blondin's balancing pole: one long bar held low across both hands, ends drooping
    const py = chin + 1.02 * HH;
    p.band([[cx - 265 * u, py + 16 * u], [cx - 120 * u, py + 2 * u], [cx, py - 2 * u], [cx + 120 * u, py + 2 * u], [cx + 265 * u, py + 16 * u]], "#7a5230", 5 * u, 1.8 * u, "round");
    for (const s2 of [-1, 1]) p.ell(cx + s2 * 265 * u, py + 17 * u, 6 * u, 6 * u, "#4a3226", 1.6 * u);
    for (const s2 of [-1, 1]) p.dot(cx + s2 * 24 * u, py + 1 * u, 5.5 * u); // hands gripping the pole
  }
  if (O.bowtie) { // red bow tie at the collar
    const by = chin + 0.10 * HH;
    for (const s2 of [-1, 1]) p.poly([[cx, by], [cx + s2 * 15 * u, by - 6.5 * u], [cx + s2 * 15 * u, by + 6.5 * u]], O.bowtie, 1.8 * u);
    p.dot(cx, by, 3.6 * u, mul(O.bowtie, [0.7, 0.7, 0.75]));
  }
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  if (helmet) galea(p, H, cx, hc, light, thick, ow, old, u);
  const hp = blobPts(cx, hc, H);
  if (O.hair && !helmet) { const hb = blobPts(cx, hc - 0.03 * HH, { ...H, a: H.a * 1.04, b: H.b * 1.05 }); p.poly(hb, O.hair, 0); }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (helmet) {
    const bandY = hc - H.b * 0.42, bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
    p.shadedFill(bp, old ? "#8f8a7e" : STEEL, mul(old ? "#8f8a7e" : STEEL, [0.62, 0.64, 0.72]), light, H.a, 0.4);
    p.clip(bp, () => { p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 5 * u, "#ffffff66");
      if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
    p.poly(bp, null, ow * 0.9);
    p.band([[cx - H.a * 1.05, bandY], [cx + H.a * 1.05, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
    p.poly(rrect(cx - 4 * u, bandY - 0.55 * H.b, cx + 4 * u, bandY - 3 * u, 2 * u), old ? "#a88a4a" : BRASS, 1.5 * u);
    cheeks(p, H, cx, hc, light, ow, old, u);
  } else if (O.bowler) bowlerOn(p, H, cx, hc, O.bowler, u, ow, thick, light);
  else if (O.cap) hatOn(p, { hat: "cap", cap: O.cap, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.hair) hatOn(p, { hat: "hair", hair: O.hair, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.tonsure) tonsureOn(p, H, cx, hc, O.tonsure, u, ow, thick, light);
  else if (O.helmet && nohelmet) { // bald old head with white side tufts
    for (const s of [-1, 1]) p.ell(cx + s * 0.9 * H.a, hc - 0.1 * H.b, 0.22 * H.a, 0.3 * H.b, "#f4f1ea", 3 * u);
  }
  if (O.longHair) longHairOn(p, H, cx, hc, O, u, ow, thick, light);
  if (O.beard) {
    const bd = blobPts(cx + 6 * u * facing, hc + 0.85 * H.b, { a: 0.62 * H.a, b: 0.75 * H.b, nTop: 2.4, nBot: 1.6, egg: -0.35, asym: 0, rot: 0, noise: 0.02, seed: seed + 4 });
    p.shadedFill(bd, O.beard, mul(O.beard, [0.86, 0.86, 0.92]), light, 0.6 * H.a, 0.3);
    p.clip(bd, () => { for (let i = -3; i <= 3; i++) p.stroke([[cx + i * 9 * u, hc + 0.45 * H.b], [cx + i * 7 * u, hc + 1.35 * H.b]], 1.2 * u, "#c9c4bb"); });
    p.inkRing(bd, ow * 0.8, thick);
  }
  faceFront(p, cx, hc, W, expr, facing, look, lid, helmet, skin, O.beard ? O.beard : O.moustache, !!O.stout);
  if (opts.blindfold) { // dark cloth band tied across the eyes + knot tails at the side
    const ey = hc - 1 * u;
    p.poly(rrect(cx - H.a * 1.02, ey - 11 * u, cx + H.a * 1.02, ey + 11 * u, 8 * u), "#33272e", 2.2 * u);
    p.stroke([[cx - H.a * 0.9, ey - 8 * u], [cx + H.a * 0.9, ey - 9 * u]], 1.4 * u, "#57424e");
    p.poly([[cx + H.a * 1.0, ey], [cx + H.a * 1.28, ey + 16 * u], [cx + H.a * 1.05, ey + 20 * u]], "#33272e", 1.8 * u);
  }
  if (O.bandage) { // white bandage strip wrapped across the forehead + two stitch ticks (aftermath hero)
    p.poly(rrect(cx - 0.74 * H.a, hc - 0.54 * H.b, cx + 0.74 * H.a, hc - 0.28 * H.b, 4 * u), "#efe9dc", 1.8 * u);
    p.stroke([[cx - 0.70 * H.a, hc - 0.33 * H.b], [cx + 0.70 * H.a, hc - 0.35 * H.b]], 1.1 * u, "#cfc6b2");
    for (const s of [-0.4, 0.05, 0.5]) p.stroke([[cx + s * H.a, hc - 0.52 * H.b], [cx + s * H.a, hc - 0.31 * H.b]], 1.1 * u, "#b9ae94");
  }
  if (O.soot) { p.ell(cx - 30 * u, hc + 10 * u, 10 * u, 6 * u, "#3a352f55", 0); p.ell(cx + 24 * u, hc + 20 * u, 7 * u, 4.5 * u, "#3a352f44", 0); } // ash smudges on the cheeks
  if (O.blush) for (const s of [-1, 1]) p.ell(cx + s * 27 * u, hc + 11 * u, 7.5 * u, 4.6 * u, "#e88a7a59", 0); // soft rosy cheeks
  if (O.brows) for (const s of [-1, 1]) p.ell(cx + 7 * u * facing + s * 14 * u, hc - 20 * u, 11 * u, 5 * u, O.brows, 2 * u);
  if (O.beard) { // re-draw the mouth over the beard for open mouths
    if (expr === "shock" || expr === "snore") p.ell(cx + 8 * u * facing, hc + 22 * u, 6 * u, 7 * u, "#5a1e28", 2 * u);
  }
  if (O.sweat && (expr === "unimpressed" || expr === "pained" || expr === "shock")) p.ell(cx - 42 * u, hc - 24 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u); // bead of sweat at the temple
  if (O.pipe) { // shepherd's pipe at the lips, bowl up-right
    const mx = cx + 8 * u * facing, my = hc + 22 * u;
    p.stroke([[mx, my], [mx + 46 * u, my - 52 * u]], 3.6 * u, "#6a4a2a");
    p.poly([[mx + 40 * u, my - 62 * u], [mx + 58 * u, my - 66 * u], [mx + 52 * u, my - 46 * u]], "#8a5a34", 1.6 * u);
    for (let i = 0; i < 3; i++) p.dot(mx + (14 + i * 11) * u, my - (16 + i * 13) * u, 1.5 * u, "#2e2015");
  }
  p.rot = null;
  if (arms.some((a) => a.swirl)) { // cuckoo swirl next to the temple
    const a = arms.find((x) => x.swirl), [hx, hy] = a.pts[2], ph = opts.swirl || 0, pts = [];
    for (let i = 0; i < 40; i++) { const t = i / 40 * Math.PI * 4 + ph, r = (4 + i * 0.7) * u; pts.push([hx + Math.cos(t) * r, hy - 40 * u + Math.sin(t) * r]); }
    p.stroke(pts, 3 * u, "#ffffff"); p.stroke(pts, 1.4 * u, INK);
  }
};

/** loose helmet prop card (lifted off the old soldier) */
export const helmetCard = (p) => {
  const H = headBlob(3, 118, 0), u = 2 * H.a / 100, hc = 560, light = rad(-120), thick = thickAngle(light), ow = 5 * u;
  galea(p, H, 300, hc, light, thick, ow, true, u);
  const bandY = hc - H.b * 0.42, bp = ellPts(300, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  // dark inside visible from below
  p.ell(300, bandY, H.a * 1.05, 0.12 * H.b, "#2a221e", 0);
  p.shadedFill(bp, "#8f8a7e", mul("#8f8a7e", [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => { for (let i = 0; i < 9; i++) p.ell(300 + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
  p.poly(bp, null, ow * 0.9);
  p.band([[300 - H.a * 1.05, bandY], [300 + H.a * 1.05, bandY]], "#a88a4a", 7 * u, 1.8 * u, "round");
  cheeks(p, H, 300, hc, light, ow, true, u);
};

/** ZZZ for the sleeping guard */
export const fxZ = (p, t) => {
  const g = p.g; g.save(); g.font = "900 120px Arial Black, Arial"; g.lineJoin = "round";
  for (let i = 0; i < 3; i++) {
    const k = (t + i / 3) % 1, x = 220 + i * 70 + Math.sin(k * 6) * 20, y = 700 - k * 500, s = 0.5 + k * 0.7;
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = Math.min(1, (1 - k) * 2.5);
    g.lineWidth = 16; g.strokeStyle = INK; g.strokeText("Z", 0, 0); g.fillStyle = "#ffffff"; g.fillText("Z", 0, 0); g.restore();
  }
  g.restore();
};
/** falling leaf */
export const fxLeaf = (p, col) => { p.poly([[300, 380], [420, 470], [300, 620], [180, 470]], col, 14); p.stroke([[300, 400], [300, 600]], 8); };
/** dust cloud puff (k 0..1 growth) */
export const fxDust = (p, k, col = "#e8dcc4") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = 90 + 150 * k; p.ell(300 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.6, 120 + 60 * k, 100 + 50 * k, col, 12); }
  p.ell(300, 520, 170 + 110 * k, 140 + 80 * k, col, 0);
  g.restore();
};
export const fxDrip = (p) => p.ell(300, 500, 40, 64, "#9fd4ff", 10);
export const fxWood = (p, seed) => { p.poly([[200, 420], [400, 400], [420, 560], [230, 600]], "#5b3d22", 14); p.stroke([[240, 450], [380, 440]], 6, "#3a2614"); p.ell(330, 520, 26, 18, "#4d7a32", 0); };

export const headCenter = (seed = 3) => { const H = headBlob(seed, 118, 0), HH = 2 * H.b; return 975 - 1.38 * HH - 1.08 * HH - H.b; };

/** a dancer lying collapsed on the cobbles (tasteful, no gore). opts: col (clothes), hair, skin */
export const fxFallen = (p, { col = "#7a4a8a", hair = "#2b211c", skin = "#f5c9a0" } = {}) => {
  const legCol = mix(col, INK, 0.5), armCol = mix(col, INK, 0.42);
  // legs stretched out, shoes at the right end
  p.stroke([[424, 824], [520, 814]], 13, legCol);
  p.stroke([[424, 852], [518, 850]], 13, legCol);
  p.ell(530, 812, 11, 7, "#4a3226", 2);
  p.ell(528, 850, 11, 7, "#4a3226", 2);
  // body: one soft heap of clothes
  const body = [[252, 788], [338, 776], [424, 784], [450, 826], [436, 876], [348, 890], [262, 884], [240, 836]];
  p.poly(body, col, 10);
  p.stroke([[286, 806], [392, 800]], 3, mix(col, INK, 0.35));
  // one arm flopped upward, hand open
  p.stroke([[306, 806], [262, 744]], 12, armCol);
  p.dot(260, 738, 8, skin);
  // head resting on the ground, eyes closed
  p.ell(182, 824, 54, 47, skin, 9);
  p.ell(168, 798, 52, 32, hair, 0);
  p.ell(196, 788, 26, 15, hair, 0);
  p.stroke([[158, 826], [184, 826]], 4.5);
  p.ell(176, 848, 5, 6.5, "#5a1e28", 2);
};

/** one abandoned shoe on the cobbles (the mystery payoff prop) */
export const fxShoe = (p, { col = "#8e3324" } = {}) => {
  p.poly([[206, 884], [394, 884], [402, 910], [198, 910]], "#4a3226", 6);
  p.poly([[238, 884], [248, 822], [302, 792], [356, 822], [368, 884]], col, 8);
  p.stroke([[256, 850], [348, 850]], 4, mix(col, INK, 0.45));
  p.stroke([[268, 828], [336, 828]], 3, "#e8dcc0");
};

/** the little stove on the rope: cast-iron body, chimney, frying pan with a golden omelette, steam curls */
export const fxStove = (p, { lit = 1 } = {}) => {
  // legs splay to grip the rope
  for (const s2 of [-1, 1]) p.stroke([[300 + s2 * 52, 838], [300 + s2 * 88, 902]], 11, "#26222a");
  // body
  p.poly(rrect(238, 700, 362, 842, 14), "#333038", 9);
  p.poly(rrect(238, 700, 362, 742, 14), "#454049", 0);
  p.ell(300, 786, 30, 34, "#1d1a20", 5); // fire door
  if (lit) { p.ell(300, 790, 17, 21, "#ff9a3c", 0); p.ell(300, 798, 9, 12, "#ffd23c", 0); }
  p.poly(rrect(232, 690, 368, 706, 6), "#26222a", 5);
  // chimney pipe up the back-left
  p.poly(rrect(252, 596, 274, 700, 5), "#3b3742", 6);
  p.poly(rrect(246, 584, 280, 600, 5), "#26222a", 5);
  // frying pan on top: dark disc, handle to the right, golden omelette + steam
  p.ell(308, 684, 66, 15, "#211e24", 6);
  p.stroke([[368, 682], [428, 668]], 10, "#211e24");
  p.ell(308, 680, 54, 11.5, "#f2b63c", 0);
  p.ell(292, 678, 15, 5, "#ffd97a", 0); p.ell(326, 681, 11, 4, "#e09a26", 0);
  if (lit) for (const [sx, ph] of [[282, 0], [312, 2.1], [338, 4.2]]) {
    const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push([sx + Math.sin(t * 5 + ph) * 9, 660 - t * 92]); }
    p.stroke(pts, 5, "#ffffffcc");
  }
};
