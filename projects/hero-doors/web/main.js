import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { SHOTS, TOTAL, shotAt, camAt, dofAt, LIGHTS, lightFor, actorsAt, worldAt, fxAt } from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.08, 1500);
const rx = (a) => a * Math.PI / 180;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });
const M = {
  plank: texM(P.planks(1), 1, 6), beam: texM(P.beam(2), 1, 2), beamDark: texM(P.beam(3, [28, 36, 30]), 1, 2),
  rot: texM(P.rotten(4), 1, 1), rotB: texM(P.rotten(14), 1, 1),
  stone: texM(P.stone(4), 1, 1), stoneMoss: texM(P.mossy(P.stone(4), 5, 1.2), 1, 1),
  grass: texM(P.grass(6), 40, 40), dirt: texM(P.dirt(7), 6, 30), plaster: texM(P.plaster(8), 1, 1), plaster2: texM(P.plaster(18, 28), 1, 1),
  roof: texM(P.roof(9), 2, 2), marble: texM(P.marble(10), 1, 1), marbleTop: toon({ color: '#ece2cf' }),
  trunk: toon({ color: '#6a4a32' }), cypress: toon({ color: '#3f6b36' }), pine: toon({ color: '#5c8a3c' }), bush: toon({ color: '#6c9a42' }),
  hill: toon({ color: '#7aa64c' }), hillFar: toon({ color: '#86ad60' }), mount: toon({ color: '#8fa7b8' }), snow: toon({ color: '#f4f6fa' }),
  iron: toon({ color: '#5c5a57' }), bronze: toon({ color: '#b08a4a' }), wood: toon({ color: '#7a5434' }), door: toon({ color: '#5a3a24' }),
  window: toon({ color: '#2b2430' }), red: toon({ color: '#b8282b' }),
};
M.banner = new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(P.banner()), alphaTest: 0.5, side: THREE.DoubleSide });
// helmet
const helmetIn = P.tex(P.helmetInside()); helmetIn.wrapS = helmetIn.wrapT = THREE.ClampToEdgeWrapping;
M.helmIn = new THREE.MeshToonMaterial({ gradientMap: grad, map: helmetIn, side: THREE.BackSide });
M.helmOut = toon({ color: '#8f8a7e' });

// ---------- ink / normal-depth contract ----------
const NOINK = 'noink'; // userData flag: never outlined (cards, fx, water handled specially)
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});
const waterNd = new THREE.ShaderMaterial({
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`,
});

// ---------- helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = true; parent.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const uvScale = (geo, su, sv) => { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return geo; };
/** box with world-scaled UVs per face (texel density 1 tile per `t` metres) */
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); }
  return g;
};

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 40, 600);

// ---------- world ----------
// Two sets: the Alexandria temple plaza (origin) and a cutaway underground chamber (x≈80).
const DECK = 0; // plaza ground height; cards stand at y=0
const world = new THREE.Group(); scene.add(world);
// water uniforms (applyLight writes these; the harbour plane below is a flat toon mesh)
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') } };
// harbour behind the temple
const sea = add(new THREE.PlaneGeometry(600, 110), toon({ color: '#47799e' }), 0, -1.4, -95, world, { cast: false }); sea.rotation.x = -Math.PI / 2;
// plaza paving
add(tbox(76, 0.2, 50, 3), M.stone, 0, -0.1, 13, world, { cast: false });
// podium + steps
add(tbox(18, 1.0, 5.7, 2.4), M.stone, 0, 0.5, -1.65, world);
add(tbox(8, 0.75, 0.7, 2), M.stone, 0, 0.375, 1.55, world);
add(tbox(8, 0.5, 0.7, 2), M.stone, 0, 0.25, 2.25, world);
add(tbox(8, 0.25, 0.7, 2), M.stone, 0, 0.125, 2.95, world);
// facade wall pieces around the door opening (opening x -1.7..1.7, y 1..5.6, wall front z=-3.2)
add(tbox(7.3, 7.4, 0.8, 2.4), M.marble, -5.35, 4.7, -3.6, world);
add(tbox(7.3, 7.4, 0.8, 2.4), M.marble, 5.35, 4.7, -3.6, world);
add(tbox(3.4, 2.8, 0.8, 2.4), M.marble, 0, 7.0, -3.6, world);
// temple interior (dark room + warm glow behind the doors)
const darkStone = toon({ color: '#4a4238' });
add(tbox(7.4, 0.15, 5.4, 2), darkStone, 0, 1.02, -6.2, world, { cast: false });
add(tbox(0.6, 7.4, 5.4, 2), darkStone, -3.5, 4.7, -6.2, world);
add(tbox(0.6, 7.4, 5.4, 2), darkStone, 3.5, 4.7, -6.2, world);
add(tbox(7.4, 7.4, 0.6, 2), darkStone, 0, 4.7, -8.8, world);
const glowPlane = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 4.6), new THREE.MeshBasicMaterial({ color: '#ffb46c', transparent: true, opacity: 0 }));
glowPlane.position.set(0, 3.3, -8.4); glowPlane.userData.ndSkip = true; world.add(glowPlane);
const doorLight = new THREE.PointLight('#ffa050', 0, 16, 1.6); doorLight.position.set(0, 3.6, -5.6); world.add(doorLight);
// the great bronze doors, on pivot groups at the posts
const doorBronzeMat = texM(P.doorBronze(21), 1, 1);
const mkDoor = (side) => { // side -1 = left post, +1 = right post
  const g = new THREE.Group(); g.position.set(side * 1.7, 1.0, -3.15); world.add(g);
  const leaf = add(tbox(1.7, 4.6, 0.16, 1), doorBronzeMat, -side * 0.85, 2.3, 0, g);
  add(tbox(1.5, 0.18, 0.06, 1), M.bronze, -side * 0.85, 3.9, 0.12, g);
  add(tbox(1.5, 0.18, 0.06, 1), M.bronze, -side * 0.85, 0.7, 0.12, g);
  const ring = add(new THREE.TorusGeometry(0.17, 0.032, 8, 20), M.bronze, -side * 1.42, 2.15, 0.16, g);
  return g;
};
const doorL = mkDoor(-1), doorR = mkDoor(1);
// a bronze feed-pipe runs down the right door post (the twist's drip source)
add(new THREE.CylinderGeometry(0.07, 0.07, 2.3, 10), M.bronze, 2.15, 4.5, -2.6, world);
add(new THREE.SphereGeometry(0.11, 10, 8), M.bronze, 2.15, 3.38, -2.6, world);
// columns + entablature + pediment
const colGeo = new THREE.CylinderGeometry(0.45, 0.52, 6.4, 14);
for (const x of [-5.9, -3.1, 3.1, 5.9]) {
  add(tbox(1.25, 0.35, 1.25, 1.6), M.marble, x, 1.17, -1.6, world);
  add(colGeo, M.marble, x, 4.2, -1.6, world);
  add(tbox(1.3, 0.42, 1.3, 1.6), M.marble, x, 7.6, -1.6, world);
}
add(tbox(19.2, 0.9, 3.0, 2.4), M.marble, 0, 7.85, -2.4, world);
const pedShape = new THREE.Shape(); pedShape.moveTo(-9.6, 0); pedShape.lineTo(9.6, 0); pedShape.lineTo(0, 2.8); pedShape.closePath();
add(new THREE.ExtrudeGeometry(pedShape, { depth: 3.0, bevelEnabled: false }), M.marbleTop, 0, 8.3, -3.9, world);
for (const [x, y] of [[-9.3, 8.45], [9.3, 8.45], [0, 11.2]]) add(new THREE.ConeGeometry(0.32, 0.85, 6), M.bronze, x, y, -2.4, world);
// hanging banners flanking the doors (plain, no lettering)
const bannerMat = new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(P.bannerPlain()), alphaTest: 0.5, side: THREE.DoubleSide });
const bannerCloths = [];
for (const x of [-2.7, 2.7]) {
  add(new THREE.CylinderGeometry(0.05, 0.05, 1.7, 8), M.wood, x, 7.32, -0.82, world).rotation.z = Math.PI / 2;
  const geo = new THREE.PlaneGeometry(1.3, 2.6, 6, 8); geo.translate(0, -1.3, 0);
  const cloth = add(geo, bannerMat, x, 7.3, -0.82, world);
  cloth.userData.base = cloth.geometry.attributes.position.array.slice(); bannerCloths.push(cloth);
}
// altar (plaza, right of the steps) + flame
const altar = new THREE.Group(); altar.position.set(2.6, 0, 4.6); world.add(altar);
add(tbox(1.5, 0.85, 1.05, 1.6), M.stone, 0, 0.43, 0, altar);
add(tbox(1.7, 0.14, 1.2, 1.6), M.marble, 0, 0.92, 0, altar);
add(new THREE.CylinderGeometry(0.34, 0.2, 0.22, 14), M.bronze, 0, 1.1, 0, altar);
const mkFlame = (r, h) => {
  const g = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10), new THREE.MeshBasicMaterial({ color: '#ff7a26' }));
  outer.geometry.translate(0, h / 2, 0); outer.userData.ndSkip = true; g.add(outer);
  const inner = new THREE.Mesh(new THREE.ConeGeometry(r * 0.55, h * 0.62, 10), new THREE.MeshBasicMaterial({ color: '#ffd23c' }));
  inner.geometry.translate(0, h * 0.31, 0); inner.userData.ndSkip = true; g.add(inner);
  return g;
};
const altarFlame = mkFlame(0.26, 0.85); altarFlame.position.set(2.6, 1.18, 4.6); altarFlame.visible = false; world.add(altarFlame);
const altarGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), new THREE.MeshBasicMaterial({ map: P.tex(P.radial('255,150,50', 0.55)), transparent: true, opacity: 0, depthWrite: false }));
altarGlow.position.set(2.6, 1.45, 4.75); altarGlow.userData.ndSkip = true; altarGlow.renderOrder = 3; world.add(altarGlow);
const altarLight = new THREE.PointLight('#ff9a40', 0, 9, 1.8); altarLight.position.set(2.6, 1.7, 4.6); world.add(altarLight);
// broken column stump Hero leans by
const stump = add(new THREE.CylinderGeometry(0.42, 0.48, 1.6, 14), M.marble, -5.4, 0.8, 4.4, world); stump.rotation.z = 0.06;
add(new THREE.CylinderGeometry(0.42, 0.48, 0.9, 14), M.marble, -6.3, 0.45, 5.6, world).rotation.z = 1.35;
// cypress trees + Alexandria houses
const cypress = (x, z, h = 7) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); add(new THREE.CylinderGeometry(0.15, 0.2, 1, 6), M.trunk, 0, 0.5, 0, g); const c = add(new THREE.SphereGeometry(1, 10, 10), M.cypress, 0, 0.9 + h / 2, 0, g); c.scale.set(0.95, h / 2, 0.95); return g; };
cypress(-11.5, 1.5, 8); cypress(11.5, 1.5, 8.5); cypress(-14, 9, 6.5); cypress(14.5, 10, 7.5); cypress(-19, -2, 9); cypress(19, -2, 9);
const houses = [];
const house = (x, z, w, d, h, rot, mat = M.plaster) => {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; world.add(g);
  add(tbox(w, h, d, 2), mat, 0, h / 2, 0, g);
  const rf = add(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.5, 1.6, 4), M.roof, 0, h + 0.8, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
  add(box(0.9, 1.8, 0.1), M.door, 0, 0.9, d / 2 + 0.03, g, { cast: false });
  for (const s of [-1, 1]) add(box(0.6, 0.7, 0.1), M.window, s * w * 0.3, h * 0.62, d / 2 + 0.03, g, { cast: false });
  houses.push(g); return g;
};
const rh2 = P.rng(23);
[[-24, 16], [-30, 26], [25, 18], [31, 28], [-27, 4], [28, 2]].forEach(([x, z], i) => house(x, z, 4.5 + rh2() * 2.5, 4 + rh2() * 2, 3.4 + rh2() * 2, rh2() * 0.5 - 0.25, i % 2 ? M.plaster : M.plaster2));
// rolling hills + mountains (far)
const rt2 = P.rng(51);
for (let i = 0; i < 14; i++) { const a = rt2() * Math.PI * 2, d = 170 + rt2() * 150; if (Math.sin(a) < -0.35) continue; const h = add(new THREE.SphereGeometry(40 + rt2() * 40, 20, 10), i % 2 ? M.hill : M.hillFar, Math.cos(a) * d, -12, Math.sin(a) * d, world, { cast: false }); h.scale.y = 0.5 + rt2() * 0.3; }
for (let i = 0; i < 10; i++) { const a = rt2() * Math.PI * 2, d = 520 + rt2() * 200, hh = 120 + rt2() * 120, r_ = 110 + rt2() * 70; if (Math.sin(a) < -0.3) continue; const g = new THREE.Group(); g.position.set(Math.cos(a) * d, -5, Math.sin(a) * d); world.add(g); add(new THREE.ConeGeometry(r_, hh, 7), M.mount, 0, hh / 2, 0, g, { cast: false }); add(new THREE.ConeGeometry(r_ * 0.3, hh * 0.3, 7), M.snow, 0, hh * 0.86, 0, g, { cast: false }); }
// clouds: painted billboards far away (no fog, no ink)
const clouds = [];
{ const r = P.rng(91);
  for (let i = 0; i < 12; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 120 + r() * 160, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ---------- underground chamber (cutaway, x≈80) ----------
const ug = new THREE.Group(); world.add(ug);
add(tbox(8.6, 0.2, 7.4, 2), M.stoneMoss, 80, -0.1, 0, ug, { cast: false });
add(tbox(8.6, 4.8, 0.5, 2), M.stoneMoss, 80, 2.4, -2.85, ug);
add(tbox(0.5, 4.8, 7.4, 2), M.stoneMoss, 75.95, 2.4, 0, ug);
add(tbox(0.5, 4.8, 7.4, 2), M.stoneMoss, 84.05, 2.4, 0, ug);
add(tbox(8.6, 0.4, 7.4, 2), M.stone, 80, 4.75, 0, ug);
for (const z of [-2.2, 0.6, 2.8]) add(tbox(8.6, 0.34, 0.4, 2), M.beamDark, 80, 4.38, z, ug);
// main beam the ropes run over (z=-1)
add(tbox(7.6, 0.32, 0.36, 2), M.beam, 80.1, 4.02, -1.0, ug);
// sealed air vessel on its stand, fire beneath
add(tbox(1.35, 0.5, 1.35, 1.6), M.stone, 78.3, 0.25, -1.0, ug);
const vessel = add(new THREE.SphereGeometry(0.85, 22, 16), M.bronze, 78.3, 1.62, -1.0, ug);
add(new THREE.CylinderGeometry(0.2, 0.26, 0.4, 12), M.bronze, 78.3, 2.55, -1.0, ug);
add(new THREE.SphereGeometry(0.24, 12, 8), M.bronze, 78.3, 2.78, -1.0, ug);
const ugFlame = mkFlame(0.3, 0.62); ugFlame.position.set(78.3, 0.5, -1.0); ugFlame.visible = false; ug.add(ugFlame);
const ugGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: P.tex(P.radial('255,150,50', 0.55)), transparent: true, opacity: 0, depthWrite: false }));
ugGlow.position.set(78.3, 1.3, 0.1); ugGlow.userData.ndSkip = true; ugGlow.renderOrder = 3; ug.add(ugGlow);
const vesselLight = new THREE.PointLight('#ff8a3c', 0, 9, 1.8); vesselLight.position.set(78.3, 1.3, 0.3); ug.add(vesselLight);
// pipe run: vessel top -> across -> down-spout over the bucket
const pipeMat = toon({ color: '#8a6a34' });
add(new THREE.CylinderGeometry(0.11, 0.11, 0.85, 10), pipeMat, 78.3, 3.1, -1.0, ug);
add(new THREE.CylinderGeometry(0.11, 0.11, 3.4, 10), pipeMat, 79.95, 3.5, -1.0, ug).rotation.z = Math.PI / 2;
add(new THREE.SphereGeometry(0.17, 12, 10), pipeMat, 78.3, 3.5, -1.0, ug);
add(new THREE.SphereGeometry(0.17, 12, 10), pipeMat, 81.7, 3.5, -1.0, ug);
add(new THREE.CylinderGeometry(0.1, 0.13, 0.5, 10), pipeMat, 81.7, 3.28, -1.0, ug);
// water stream from the spout (scaled by flow in worldState)
const stream = add(new THREE.CylinderGeometry(0.075, 0.075, 1, 8), toon({ color: '#7ec8e8' }), 81.7, 2.6, -1.0, ug, { cast: false });
stream.visible = false;
// pulley + ropes
add(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 14), M.bronze, 81.7, 4.05, -1.0, ug).rotation.x = Math.PI / 2;
const ropeMat = toon({ color: '#a8845c' });
const ropeV1 = add(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), ropeMat, 81.7, 3.3, -1.0, ug, { cast: false });
const ropeH = add(new THREE.CylinderGeometry(0.035, 0.035, 5.0, 6), ropeMat, 79.2, 4.14, -1.0, ug, { cast: false }); ropeH.rotation.z = Math.PI / 2;
const ropeV2 = add(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), ropeMat, 76.7, 3.4, -1.0, ug, { cast: false });
add(box(0.34, 0.55, 0.55), M.window, 76.28, 2.85, -1.0, ug, { cast: false }); // wall hole the rope dives through
// the hanging bucket (group origin = handle attach point)
const bucketGroup = new THREE.Group(); bucketGroup.position.set(81.7, 2.45, -1.0); ug.add(bucketGroup);
const bucketBody = add(new THREE.CylinderGeometry(0.4, 0.33, 0.62, 16), texM(P.planks(31), 2, 1), 0, -0.36, 0, bucketGroup);
for (const y of [-0.16, -0.54]) { const band = add(new THREE.TorusGeometry(0.395, 0.028, 8, 24), M.iron, 0, y, 0, bucketGroup); band.rotation.x = Math.PI / 2; }
const handle = add(new THREE.TorusGeometry(0.3, 0.03, 8, 20, Math.PI), M.iron, 0, -0.03, 0, bucketGroup);
const fillDisc = add(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 16), toon({ color: '#5aaec4' }), 0, -0.46, 0, bucketGroup, { cast: false });
fillDisc.visible = false;
// props: crates, barrel, ladder, amphora
add(tbox(0.9, 0.9, 0.9, 1.4), M.plank, 77.0, 0.45, 1.9, ug);
add(tbox(0.7, 0.7, 0.7, 1.4), M.plank, 77.1, 1.25, 1.9, ug);
add(new THREE.CylinderGeometry(0.42, 0.42, 1.05, 14), texM(P.planks(33), 2, 1), 83.1, 0.53, 1.7, ug);
add(new THREE.SphereGeometry(0.34, 12, 10), texM(P.plaster(41, 25), 1, 1), 76.9, 0.34, -2.0, ug);
add(new THREE.CylinderGeometry(0.1, 0.16, 0.5, 10), texM(P.plaster(41, 25), 1, 1), 76.9, 0.85, -2.0, ug);

// ---------- helmet prop (unused in this story; kept for the engine contract) ----------
const helmet = new THREE.Group(); scene.add(helmet); helmet.visible = false;


// ---------- cards ----------
const CW = 1200, CH = 2000, CM = 2.25; // canvas px, card height in metres (design 600x1000 -> 2.25 m)
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.6));
class Card {
  constructor(scale = 1) {
    [this.c, this.g] = (() => { const c = document.createElement('canvas'); c.width = CW; c.height = CH; return [c, c.getContext('2d')]; })();
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    const p = new T.Pen(g); fn(p); this.t.needsUpdate = true;
  }
}
const cards = []; const getCard = (i) => cards[i] || (cards[i] = new Card());

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 1.6 }, fogCol: { value: new THREE.Color() },
  sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash; uniform vec3 fogCol, lift, gain; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(7./d, .62, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue;            // character cards: never outlined by the world ink
      if (card) ds = 1e4;                        // sky
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d));                           // depth jump, near side only
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9); // crease
    }
    return e * (1. - smoothstep(140., 520., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.012,.01,.014), e);
    if (flash < -0.5) c = vec3(e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    c = mix(c, vec3(1.), flash);
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){
    float c0 = coc(vUv);
    if (cinf < .5 || c0 < .6) { gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.)); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<48;i++){ float fi = float(i); float r = sqrt((fi+.5)/48.); float a = fi*2.39996;
      vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5);
      acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = linearToOutputTexel(vec4(acc/max(wsum,1e-3), 1.)); }` }));
// final copy with sRGB handled by the renderer output (we render to screen with linear->sRGB in the shader chunk)
dofScene.children[0].material.toneMapped = false;

// ---------- per-frame state ----------
const tmpV = new THREE.Vector3();
function applyLight(L, f) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000');
  waterU.deep.value.set(L.waterDeep); waterU.shal.value.set(L.waterShal); waterU.glint.value.set(L.glint);
}
function placeSun(L, focus) {
  // sun direction from azimuth/elevation in world space
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 80); sun.target.position.copy(focus);
  const ext = L.shadowExt || 30, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 200; sc.updateProjectionMatrix();
}

function worldState(S, f) {
  // the great doors swing on their posts (overshoot lives in the state value)
  const da = (S.door || 0) * 1.9;
  doorL.rotation.y = da; doorR.rotation.y = -da;
  glowPlane.material.opacity = 0.85 * Math.max(0, S.door || 0);
  doorLight.intensity = 30 * Math.max(0, S.door || 0);
  // banners ripple
  for (const bn of bannerCloths) {
    const pa = bn.geometry.attributes.position, base = bn.userData.base;
    for (let i = 0; i < pa.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; pa.setZ(i, Math.sin(f * 0.15 + x * 3.1 + y * 1.4) * 0.11 * (-y / 2.6)); }
    pa.needsUpdate = true;
  }
  // altar flame: scale + flicker
  const fl = S.altarFlame || 0, flick = 1 + 0.13 * Math.sin(f * 1.7) + 0.07 * Math.sin(f * 4.3);
  altarFlame.visible = fl > 0.02;
  altarFlame.scale.set(0.8 + 0.3 * fl, Math.max(0.03, fl * flick), 0.8 + 0.3 * fl);
  altarLight.intensity = 15 * fl * flick;
  altarGlow.material.opacity = 0.5 * fl;
  // underground fire under the vessel
  const fu = S.fireU || 0, flick2 = 1 + 0.15 * Math.sin(f * 1.9 + 2) + 0.06 * Math.sin(f * 5.1);
  ugFlame.visible = fu > 0.02;
  ugFlame.scale.set(0.9 + 0.3 * fu, Math.max(0.03, fu * flick2), 0.9 + 0.3 * fu);
  vesselLight.intensity = 17 * fu * flick2;
  ugGlow.material.opacity = 0.45 * fu;
  // bucket, ropes, water
  bucketGroup.position.y = 2.45 + (S.bucketY || 0);
  const L1 = 4.12 - bucketGroup.position.y;
  ropeV1.scale.y = L1; ropeV1.position.y = 4.12 - L1 / 2;
  ropeH.position.x = 79.2 - 0.35 * (S.yank || 0);
  const L2 = 1.37 + 0.3 * (S.yank || 0);
  ropeV2.scale.y = L2; ropeV2.position.y = 4.12 - L2 / 2;
  const wf = S.waterFlow || 0;
  stream.visible = wf > 0.02;
  if (stream.visible) {
    const top = 3.02, bot = bucketGroup.position.y - 0.16 + (S.fill || 0) * 0.3, len = Math.max(0.05, top - bot);
    stream.scale.set(Math.max(0.15, wf), len, Math.max(0.15, wf)); stream.position.y = top - len / 2;
  }
  fillDisc.visible = (S.fill || 0) > 0.02;
  fillDisc.position.y = -0.46 + (S.fill || 0) * 0.32;
  // hide the sky clouds while we are underground
  const under = f >= 826 && f < 1122;
  for (const c of clouds) c.visible = !under;
  waterU.t.value = f / 30;
}
function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = getCard(i);
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1;
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false && a.y < DECK + 0.5) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? DECK) + 0.02, a.z); c.blob.scale.set(0.95 * s, 0.6 * s, 1); }
  });
}

const helmetState = (h) => {
  helmet.visible = !!h; if (!h) return;
  helmet.position.set(h.x, h.y, h.z); helmet.rotation.set(h.rx || 0, h.ry || 0, h.rz || 0); helmet.scale.setScalar(h.s || 0.17);
};

const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip) { o.userData.vis0 = o.visible; o.visible = false; return; }
      if (o === sky || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || ndMat;
    } else {
      o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; }
    }
  });
};

window.renderFrame = (f) => {
  const S = shotAt(f), L = lightFor(S, f), C = camAt(f);
  applyLight(L, f);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const W_ = worldAt(f); worldState(W_, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors([...actorsAt(f, T), ...fxAt(f, T)], camera);
  helmetState(W_.helmet);
  sky.position.copy(camera.position);
  for (const c of clouds) c.quaternion.copy(camera.quaternion);
  // pass A: colour
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  // pass B: normal + depth
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  if (window.DEBUG_ND) { const dm = new THREE.MeshBasicMaterial({ map: rtNd.texture }); const ds = fs(dm); renderer.setRenderTarget(null); renderer.render(ds, fsCam); return true; }
  // ink + grade
  const D = dofAt(f);
  inkU.px.value = 2.5; inkU.flash.value = window.DEBUG_E ? -1 : (C.flash || 0); inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  // lens
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
