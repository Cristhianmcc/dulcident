import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Sound } from '../core/sound.js';

const $ = s => document.querySelector(s);
const card = $('#card'), canvas = $('#scene'), fx = $('#fx');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let started = false;

function gateCheck(){
  const ok = card.clientWidth >= 760 && card.clientHeight >= 460 && !matchMedia('(pointer: coarse)').matches;
  $('#gate').hidden = ok;
  if (ok && !started){ started = true; init().catch(err => { console.error(err); $('#gateMsg').textContent = 'Tu navegador no pudo iniciar el 3D (WebGL). Prueba con Chrome actualizado.'; $('#gate').hidden = false; }); }
}
addEventListener('resize', gateCheck);
gateCheck();

/* ───────────────────────── Escena ───────────────────────── */
async function init(){
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const CARD = '#E3F1EA';
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CARD);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .9;

  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  const camTarget = new THREE.Vector3(0, 1.3, 0);
  camera.position.set(0, 4.7, 12.6);
  camera.lookAt(camTarget);

  const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(4, 7, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe8ee, .8); rim.position.set(-5, 3, -4); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xbfe3d2, .55));

  const world = new THREE.Group(); scene.add(world);

  /* ── Materiales de gomita ── */
  const gumMat = new THREE.MeshPhysicalMaterial({ color:'#F27C83', roughness:.26, clearcoat:1, clearcoatRoughness:.08,
    transmission:.18, thickness:.9, attenuationColor:new THREE.Color('#B0102E'), attenuationDistance:.6, ior:1.4,
    sheen:.6, sheenColor:new THREE.Color('#FFD3DA'), sheenRoughness:.4 });
  const toothMat = new THREE.MeshPhysicalMaterial({ color:'#FFF7EA', roughness:.15, clearcoat:1, clearcoatRoughness:.04,
    transmission:.22, thickness:.5, attenuationColor:new THREE.Color('#F0D3A2'), attenuationDistance:.9, ior:1.5 });
  const tongueMat = new THREE.MeshPhysicalMaterial({ color:'#FF8FA4', roughness:.36, clearcoat:.8, clearcoatRoughness:.18,
    sheen:.7, sheenColor:new THREE.Color('#FFE0E6'), sheenRoughness:.5 });
  const palateMat = new THREE.MeshPhysicalMaterial({ color:'#EC6575', roughness:.3, clearcoat:.9, clearcoatRoughness:.12, side:THREE.DoubleSide });
  const throatMat = new THREE.MeshStandardMaterial({ color:'#5A1222', roughness:.55 });
  const deepMat = new THREE.MeshBasicMaterial({ color:'#1E0509' });
  const holeMat = new THREE.MeshPhysicalMaterial({ color:'#8E1427', roughness:.2, clearcoat:1 });
  const syrupMat = new THREE.MeshPhysicalMaterial({ color:'#D0122E', roughness:.06, clearcoat:1, clearcoatRoughness:.02 });
  const strandMat = new THREE.MeshPhysicalMaterial({ color:'#FF8E96', roughness:.22, clearcoat:1, clearcoatRoughness:.06, sheen:.5, sheenColor:new THREE.Color('#FFE3E7') });
  const goldMat = new THREE.MeshStandardMaterial({ color:'#F4C542', metalness:1, roughness:.22 });

  /* ── El arco (herradura) ── */
  const TH = 1.72, A = 1.72, B = 1.5, C = .32;
  const GUM_RX = .4, GUM_RY = .37;
  const UPPER = new THREE.Matrix4().compose(new THREE.Vector3(0, 2.12, -.05),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(-.22, 0, 0)), new THREE.Vector3(1, 1, 1));
  const UPPER_ROT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-.22, 0, 0));
  const UP = new THREE.Vector3(0, 1, 0);
  const archPoint = (th, o = new THREE.Vector3()) => o.set(A * Math.sin(th), 0, B * Math.cos(th) - C);
  const archTangent = (th, o = new THREE.Vector3()) => o.set(A * Math.cos(th), 0, -B * Math.sin(th)).normalize();

  // Tabla de longitud de arco para repartir los dientes por su ancho real
  const ARC_N = 800, arcTh = new Float32Array(ARC_N), arcS = new Float32Array(ARC_N);
  { const p = new THREE.Vector3(), q = new THREE.Vector3(); let s = 0;
    for (let i = 0; i < ARC_N; i++){ const th = -TH + 2 * TH * i / (ARC_N - 1); archPoint(th, p);
      if (i) s += p.distanceTo(q); arcTh[i] = th; arcS[i] = s; q.copy(p); } }
  const S_TOTAL = arcS[ARC_N - 1], S_MID = S_TOTAL / 2;
  const thetaAtS = s => { let lo = 0, hi = ARC_N - 1; while (hi - lo > 1){ const m = (lo + hi) >> 1; if (arcS[m] < s) lo = m; else hi = m; }
    const f = (s - arcS[lo]) / Math.max(1e-6, arcS[hi] - arcS[lo]); return arcTh[lo] + (arcTh[hi] - arcTh[lo]) * f; };
  const sAtTheta = th => { const i = Math.round((th + TH) / (2 * TH) * (ARC_N - 1)); return arcS[Math.max(0, Math.min(ARC_N - 1, i))]; };

  /* ── Tipos de diente (del centro hacia atrás) ── */
  const TYPES = [
    { w:.30, h:.50, d:.22, e:.55, incisor:true },
    { w:.27, h:.46, d:.22, e:.55, incisor:true },
    { w:.29, h:.54, d:.28, e:.6, canine:true },
    { w:.32, h:.44, d:.36, e:.5 },
    { w:.33, h:.44, d:.38, e:.5 },
    { w:.42, h:.42, d:.44, e:.45, molar:true },
  ];
  const GAP = .018;
  function toothGeometry(ty){
    const g = new THREE.SphereGeometry(1, 30, 22), p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++){
      v.fromBufferAttribute(p, i);
      const sx = Math.sign(v.x) * Math.pow(Math.abs(v.x), ty.e), sy = Math.sign(v.y) * Math.pow(Math.abs(v.y), ty.e * .9), sz = Math.sign(v.z) * Math.pow(Math.abs(v.z), ty.e);
      let x = sx * ty.w / 2, y = sy * ty.h / 2, z = sz * ty.d / 2;
      if (sy < 0){ const k = 1 - .34 * sy * sy; x *= k; z *= k; }
      if (ty.canine && sy > 0){ const k = 1 - .4 * sy * sy; x *= k; z *= k; y += .03 * sy; }
      if (ty.incisor && sy > 0) z *= 1 - .32 * sy;
      if (ty.molar && sy > .55) y += .028 * Math.cos(sx * Math.PI * 1.7) * Math.cos(sz * Math.PI * 1.7) - .012;
      p.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals(); return g;
  }
  const toothGeos = TYPES.map(toothGeometry);

  // Posiciones de los dientes por longitud de arco (12 por arcada, casi tocándose)
  const slots = [];
  for (const side of [-1, 1]){
    let acc = GAP / 2;
    TYPES.forEach((ty, k) => { const s = S_MID + side * (acc + ty.w / 2); slots.push({ s, k, side, th:thetaAtS(s) }); acc += ty.w + GAP; });
  }
  const boundaries = [];
  for (const side of [-1, 1]){ let acc = 0; boundaries.push(S_MID); TYPES.forEach(ty => { acc += ty.w + GAP; boundaries.push(S_MID + side * acc); }); }

  /* ── Encías: tubo en herradura con física de gelatina (resortes encadenados) ── */
  const K = 24;
  const gumP = [0, 1].map(() => Array.from({ length:K }, () => ({ o:new THREE.Vector3(), v:new THREE.Vector3(), t:new THREE.Vector3(), w:0 })));
  const gumSamples = [[], []];
  const gums = [];
  function buildGum(jaw){
    const N = 96, M = 30, n = N * M, sign = jaw ? -1 : 1;
    const base = new Float32Array(n * 3), fi = new Float32Array(n), topW = new Float32Array(n);
    const c = new THREE.Vector3(), t = new THREE.Vector3(), nr = new THREE.Vector3(), p = new THREE.Vector3();
    for (let i = 0; i < N; i++){
      const th = -TH + 2 * TH * i / (N - 1); archPoint(th, c); archTangent(th, t); nr.crossVectors(t, UP);
      const k = Math.min(1, (TH - Math.abs(th)) * 1.55 / .4), cap = Math.sqrt(Math.max(0, 1 - (1 - k) * (1 - k)));
      const s = sAtTheta(th); let db = 9; for (const b of boundaries) db = Math.min(db, Math.abs(s - b));
      const inTeeth = Math.abs(s - S_MID) < 1.95 ? 1 : 0, pap = inTeeth * Math.exp(-((db / .055) ** 2));
      for (let j = 0; j < M; j++){
        const ph = 2 * Math.PI * j / M, cs = Math.cos(ph), sn = Math.sin(ph);
        const top = Math.max(0, sn * sign);
        const bump = .06 * pap * top ** 6;
        p.copy(c).addScaledVector(nr, cs * GUM_RX * cap * (1 + .08 * top)).addScaledVector(UP, sn * GUM_RY * cap + sign * bump);
        if (jaw) p.applyMatrix4(UPPER);
        const id = i * M + j; base[id * 3] = p.x; base[id * 3 + 1] = p.y; base[id * 3 + 2] = p.z;
        fi[id] = (th + TH) / (2 * TH) * (K - 1); topW[id] = .3 + .7 * top;
      }
    }
    const idx = [];
    for (let i = 0; i < N - 1; i++) for (let j = 0; j < M; j++){
      const a = i * M + j, b = i * M + (j + 1) % M, cc = (i + 1) * M + j, d = (i + 1) * M + (j + 1) % M;
      idx.push(a, cc, b, b, cc, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3)); g.setIndex(idx); g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, gumMat); world.add(mesh);
    // muestras para choques
    for (let i = 0; i < 140; i++){
      const th = -TH + .08 + (2 * TH - .16) * i / 139; const cen = archPoint(th), tg = archTangent(th), nn = new THREE.Vector3().crossVectors(tg, UP), uu = UP.clone();
      if (jaw){ cen.applyMatrix4(UPPER); nn.applyQuaternion(UPPER_ROT); uu.applyQuaternion(UPPER_ROT); }
      gumSamples[jaw].push({ c:cen, n:nn, u:uu });
    }
    gums.push({ mesh, base, fi, topW, jaw });
  }
  buildGum(0); buildGum(1);

  // Las dos masas de encía se juntan atrás, angostándose a media altura
  function buildPillar(side){
    const th = side * (TH - .2), lo = archPoint(th), hi = archPoint(th).applyMatrix4(UPPER);
    const nr = new THREE.Vector3().crossVectors(archTangent(th), UP).multiplyScalar(.18);
    const ctrl = lo.clone().lerp(hi, .5).add(nr).add(new THREE.Vector3(0, 0, -.12));
    const curve = new THREE.QuadraticBezierCurve3(lo, ctrl, hi);
    const N = 26, M = 22, pos = [], idx = [];
    const t = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), p = new THREE.Vector3();
    for (let i = 0; i < N; i++){
      const u = i / (N - 1); const c = curve.getPoint(u); curve.getTangent(u, t);
      a.set(0, 0, 1).cross(t).normalize(); if (a.lengthSq() < .1) a.set(1, 0, 0); b.crossVectors(t, a).normalize();
      const r = .36 - .15 * Math.sin(Math.PI * u);
      for (let j = 0; j < M; j++){ const ph = 2 * Math.PI * j / M; p.copy(c).addScaledVector(a, Math.cos(ph) * r).addScaledVector(b, Math.sin(ph) * r * 1.1); pos.push(p.x, p.y, p.z); }
    }
    for (let i = 0; i < N - 1; i++) for (let j = 0; j < M; j++){ const q = i * M + j, r = i * M + (j + 1) % M, s = (i + 1) * M + j, d = (i + 1) * M + (j + 1) % M; idx.push(q, s, r, r, s, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, gumMat); world.add(m); return m;
  }
  buildPillar(-1); buildPillar(1);

  // Paladar en domo, garganta oscura y campanilla
  const palate = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), palateMat);
  palate.scale.set(1.5, .62, 1.22); palate.position.set(0, .05, -.22).applyMatrix4(UPPER); palate.quaternion.copy(UPPER_ROT); world.add(palate);
  const throat = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), throatMat);
  throat.scale.set(1.3, .95, .45); throat.position.set(0, 1.08, -.86); world.add(throat);
  const deep = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), deepMat);
  deep.scale.set(.62, .5, .2); deep.position.set(0, 1.08, -.48); world.add(deep);
  const uvulaPivot = new THREE.Group(); uvulaPivot.position.set(0, 1.74, -.42); world.add(uvulaPivot);
  const uvula = new THREE.Mesh(new THREE.CapsuleGeometry(.085, .2, 8, 16), palateMat); uvula.position.y = -.2; uvulaPivot.add(uvula);
  const uv = { a:0, v:0, b:0, bv:0 };

  // Lengua grande con su surco al centro
  const tongueGeo = new THREE.SphereGeometry(1, 64, 40);
  { const p = tongueGeo.attributes.position; for (let i = 0; i < p.count; i++){ let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (y > 0) y -= .26 * Math.exp(-((x / .17) ** 2)) * y; if (z > .3) y += .08 * (z - .3); p.setXYZ(i, x, y, z); } tongueGeo.computeVertexNormals(); }
  const TONGUE_C = new THREE.Vector3(0, .2, -.12), TONGUE_S = new THREE.Vector3(1.2, .42, 1.02);
  const tongue = new THREE.Mesh(tongueGeo, tongueMat); tongue.position.copy(TONGUE_C); tongue.scale.copy(TONGUE_S); world.add(tongue);

  // Sombras de contacto
  const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(40,90,70,.55)'); g.addColorStop(.55, 'rgba(40,90,70,.2)'); g.addColorStop(1, 'rgba(40,90,70,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const FLOOR = -.37;
  const mouthShadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map:shadowTex, transparent:true, depthWrite:false, toneMapped:false }));
  mouthShadow.rotation.x = -Math.PI / 2; mouthShadow.position.set(0, FLOOR + .002, .1); mouthShadow.scale.set(5.4, 4.2, 1); mouthShadow.renderOrder = -1; world.add(mouthShadow);
  const smallShadowMat = new THREE.MeshBasicMaterial({ map:shadowTex, transparent:true, depthWrite:false, toneMapped:false, opacity:.9 });
  const smallShadowGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

  /* ── Dientes ── */
  const teeth = [];
  const toothMeshes = [];
  const CAVITY = new Set(['0:-1:5', '0:1:3', '1:-1:4']);
  slots.forEach(sl => [0, 1].forEach(jaw => {
    const ty = TYPES[sl.k];
    const c = archPoint(sl.th), t = archTangent(sl.th), nr = new THREE.Vector3().crossVectors(t, UP);
    const m4 = new THREE.Matrix4().makeBasis(t, UP, nr);
    const q = new THREE.Quaternion().setFromRotationMatrix(m4);
    const rest = c.clone();
    if (jaw === 0){ rest.y = GUM_RY - .1 + ty.h / 2; }
    else { rest.y = -(GUM_RY - .1 + ty.h / 2); rest.applyMatrix4(UPPER); q.premultiply(UPPER_ROT).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI)); }
    const out = new THREE.Vector3(0, 1, 0).applyQuaternion(q); // hacia la corona
    const mesh = new THREE.Mesh(toothGeos[sl.k], toothMat);
    mesh.position.copy(rest); mesh.quaternion.copy(q); world.add(mesh);
    const tooth = { mesh, ty, jaw, rest, restQ:q.clone(), out, pos:rest.clone(), q:q.clone(), vel:new THREE.Vector3(), w:new THREE.Vector3(),
      disp:new THREE.Vector3(), dv:new THREE.Vector3(), lat:new THREE.Vector3(), loose:0, state:'anchored',
      r:Math.max(ty.w, ty.h, ty.d) * .42, fi:(sl.th + TH) / (2 * TH) * (K - 1),
      socket:rest.clone().addScaledVector(out, -(ty.h / 2 - .1)), lastClack:0, cavity:CAVITY.has(`${jaw}:${sl.side}:${sl.k}`), drill:0, filled:false,
      shadow:null, hold:0 };
    mesh.userData.tooth = tooth;
    if (tooth.cavity){
      const spot = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), new THREE.MeshStandardMaterial({ color:'#5B3018', roughness:.7 }));
      spot.scale.set(ty.w * .3, .03, ty.d * .28); spot.position.set(0, ty.h / 2 - .012, 0); spot.userData.tooth = tooth; mesh.add(spot); tooth.spot = spot;
    }
    const hole = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), holeMat);
    hole.scale.set(ty.w * .38, .05, ty.d * .38); hole.position.copy(tooth.socket); hole.quaternion.copy(q); hole.visible = false; world.add(hole); tooth.hole = hole;
    const sh = new THREE.Mesh(smallShadowGeo, smallShadowMat); sh.visible = false; sh.renderOrder = -1; world.add(sh); tooth.shadow = sh;
    teeth.push(tooth); toothMeshes.push(mesh);
  }));

  /* ── Gotas de jarabe ── */
  const DROPS = 180;
  const dropMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), syrupMat, DROPS);
  dropMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); dropMesh.frustumCulled = false; world.add(dropMesh);
  const drops = Array.from({ length:DROPS }, () => ({ alive:false, p:new THREE.Vector3(), v:new THREE.Vector3(), stuck:false, life:0, r:.04, tooth:null, off:new THREE.Vector3(), n:new THREE.Vector3(0, 1, 0) }));
  let dropCursor = 0;
  const ZERO_M = new THREE.Matrix4().makeScale(0, 0, 0), DROP_M = new THREE.Matrix4();
  for (let i = 0; i < DROPS; i++) dropMesh.setMatrixAt(i, ZERO_M);
  const spawnDrop = (p, v, r = .04) => { const d = drops[dropCursor]; dropCursor = (dropCursor + 1) % DROPS;
    Object.assign(d, { alive:true, stuck:false, life:0, r, tooth:null }); d.p.copy(p); d.v.copy(v); };

  /* ── Hilo de encía tipo caramelo ── */
  const strands = [];
  function makeTube(rings, seg){
    const g = new THREE.BufferGeometry(); const n = rings * seg;
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const idx = []; for (let i = 0; i < rings - 1; i++) for (let j = 0; j < seg; j++){ const a = i * seg + j, b = i * seg + (j + 1) % seg, c = (i + 1) * seg + j, d = (i + 1) * seg + (j + 1) % seg; idx.push(a, c, b, b, c, d); }
    g.setIndex(idx); const m = new THREE.Mesh(g, strandMat); m.frustumCulled = false; world.add(m); return m;
  }
  const _t = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _p = new THREE.Vector3();
  function writeTube(mesh, pts, radii){
    const pos = mesh.geometry.attributes.position, seg = pos.count / pts.length;
    for (let i = 0; i < pts.length; i++){
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(pts.length - 1, i + 1)];
      _t.subVectors(p1, p0).normalize(); _a.set(0, 1, 0); if (Math.abs(_t.y) > .9) _a.set(1, 0, 0);
      _a.cross(_t).normalize(); _b.crossVectors(_t, _a);
      for (let j = 0; j < seg; j++){ const ph = 2 * Math.PI * j / seg; _p.copy(pts[i]).addScaledVector(_a, Math.cos(ph) * radii[i]).addScaledVector(_b, Math.sin(ph) * radii[i]);
        pos.setXYZ(i * seg + j, _p.x, _p.y, _p.z); }
    }
    pos.needsUpdate = true; mesh.geometry.computeVertexNormals();
  }
  function spawnStrand(tooth){
    strands.push({ tooth, a:makeTube(10, 10), b:makeTube(10, 10), snapped:false, t:0, mid:new THREE.Vector3(), endA:new THREE.Vector3(), endB:new THREE.Vector3(), r0:.075 });
  }

  /* ── Monedas del hada ── */
  const coinGeo = new THREE.CylinderGeometry(.15, .15, .04, 32);
  const coins3d = [];

  /* ── Personajes-herramienta ── */
  const redMat = new THREE.MeshPhysicalMaterial({ color:'#E8465C', roughness:.22, clearcoat:1, clearcoatRoughness:.06, transmission:.15, thickness:.4, attenuationColor:new THREE.Color('#9A0D25'), attenuationDistance:.5 });
  const whiteMat = new THREE.MeshPhysicalMaterial({ color:'#FFFDF9', roughness:.2, clearcoat:1, clearcoatRoughness:.05 });
  const mintMat = new THREE.MeshPhysicalMaterial({ color:'#3FD6B0', roughness:.2, clearcoat:1, clearcoatRoughness:.06, transmission:.15, thickness:.4, attenuationColor:new THREE.Color('#117A60'), attenuationDistance:.5 });
  const steelMat = new THREE.MeshStandardMaterial({ color:'#D9E2E6', metalness:1, roughness:.18 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color:'#ffffff', roughness:.3, emissive:'#ffffff', emissiveIntensity:.15 });
  const eyeBlack = new THREE.MeshBasicMaterial({ color:'#16181A' });
  function makeEye(r){
    const g = new THREE.Group();
    const w = new THREE.Mesh(new THREE.CircleGeometry(r, 28), eyeWhite);
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(r * .5, 20), eyeBlack); pupil.position.z = .002;
    const glint = new THREE.Mesh(new THREE.CircleGeometry(r * .16, 10), eyeWhite); glint.position.set(r * .14, r * .16, .004); pupil.add(glint);
    g.add(w, pupil); g.userData = { pupil, r }; return g;
  }

  // Pinchy: fórceps rojo, va de cabeza y su pico es la punta del cursor
  const pinchy = new THREE.Group(), pinchyBody = new THREE.Group(); pinchy.add(pinchyBody);
  const armL = new THREE.Group(), armR = new THREE.Group(); pinchyBody.add(armL, armR);
  for (const [arm, s] of [[armL, -1], [armR, 1]]){
    const handle = new THREE.Mesh(new THREE.CapsuleGeometry(.075, .5, 8, 16), redMat); handle.position.set(s * .15, .36, -.03); handle.rotation.z = -s * .36; arm.add(handle);
    const grip = new THREE.Mesh(new THREE.SphereGeometry(.09, 16, 12), redMat); grip.position.set(s * .27, .66, -.03); arm.add(grip);
    const jaw = new THREE.Mesh(new THREE.CapsuleGeometry(.052, .17, 6, 12), redMat); jaw.position.set(-s * .025, -.2, 0); jaw.rotation.z = -s * .2; arm.add(jaw);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 10), whiteMat); tip.position.set(s * .012, -.33, .01); arm.add(tip);
  }
  const hinge = new THREE.Mesh(new THREE.SphereGeometry(.15, 24, 18), whiteMat); pinchyBody.add(hinge);
  const pEyes = [makeEye(.05), makeEye(.05)]; pEyes[0].position.set(-.062, .03, .152); pEyes[1].position.set(.062, .03, .152); pinchyBody.add(...pEyes);
  const PINCHY_TIP = new THREE.Vector3(0, -.37, 0);
  pinchy.scale.setScalar(1.05); scene.add(pinchy);

  // Dr. Drill: taladro menta con anillos blancos y fresa plateada
  const drill = new THREE.Group(), drillBody = new THREE.Group(); drill.add(drillBody);
  const dBody = new THREE.Mesh(new THREE.CapsuleGeometry(.13, .38, 8, 20), mintMat); dBody.position.y = .12; drillBody.add(dBody);
  for (const y of [-.02, .3]){ const ring = new THREE.Mesh(new THREE.TorusGeometry(.135, .03, 10, 28), whiteMat); ring.rotation.x = Math.PI / 2; ring.position.y = y; drillBody.add(ring); }
  const dHead = new THREE.Mesh(new THREE.CapsuleGeometry(.09, .16, 6, 16), whiteMat); dHead.position.set(.07, .5, 0); dHead.rotation.z = -.7; drillBody.add(dHead);
  const bur = new THREE.Group(); bur.position.y = -.18; drillBody.add(bur);
  const burShaft = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .2, 12), steelMat); burShaft.position.y = -.1; bur.add(burShaft);
  const burTip = new THREE.Mesh(new THREE.ConeGeometry(.04, .09, 14), steelMat); burTip.rotation.x = Math.PI; burTip.position.y = -.24; bur.add(burTip);
  const dEyes = [makeEye(.048), makeEye(.048)]; dEyes[0].position.set(-.055, .2, .132); dEyes[1].position.set(.055, .2, .132); drillBody.add(...dEyes);
  const DRILL_TIP = new THREE.Vector3(0, -.47, 0);
  drill.scale.setScalar(0); scene.add(drill);

  /* ── Letras gigantes de la marca, pegadas a la pared del fondo ── */
  try { await Promise.race([document.fonts.load('900 200px Nunito'), new Promise(r => setTimeout(r, 2500))]); } catch(e){}
  const wmCanvas = document.createElement('canvas'); wmCanvas.width = 2400; wmCanvas.height = 560;
  { const x = wmCanvas.getContext('2d'); x.fillStyle = CARD; x.fillRect(0, 0, 2400, 560);
    x.font = "900 400px Nunito, 'Arial Rounded MT Bold', sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.save(); x.shadowColor = 'rgba(70,130,105,.28)'; x.shadowBlur = 40; x.shadowOffsetY = 18; x.fillStyle = '#FFFFFF'; x.fillText('Dulcident', 1200, 300); x.restore();
    x.fillStyle = '#FFFFFF'; x.fillText('Dulcident', 1200, 300); }
  const wmTex = new THREE.CanvasTexture(wmCanvas); wmTex.colorSpace = THREE.SRGBColorSpace; wmTex.anisotropy = 4;
  const wordmark = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map:wmTex, toneMapped:false }));
  scene.add(wordmark);
  const WM_DIST = 17;
  let wmRise = reduceMotion ? 1 : 0;

  /* ── Tamaño y encuadre ── */
  const bounds = { xMin:-4, xMax:4, zMin:-2.4, zMax:3.2 };
  let W = 1, H = 1, worldBaseX = .6;
  function resize(){
    W = card.clientWidth; H = card.clientHeight; if (!W || !H) return;
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    // la boca vive en el lado derecho: su centro queda cerca del 66% del ancho
    { const d = camera.position.distanceTo(camTarget), vw = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
      worldBaseX = vw * (camera.aspect > 1.45 ? .17 : .14); }
    // límites del piso visibles en pantalla
    const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR), hit = new THREE.Vector3();
    ray.setFromCamera(new THREE.Vector2(-.97, -.75), camera); if (ray.ray.intersectPlane(plane, hit)) bounds.xMin = hit.x - worldBaseX;
    ray.setFromCamera(new THREE.Vector2(.97, -.75), camera); if (ray.ray.intersectPlane(plane, hit)) bounds.xMax = hit.x - worldBaseX;
    placeWordmark();
  }
  const camFwd = new THREE.Vector3(), camUp = new THREE.Vector3();
  function placeWordmark(){
    camera.getWorldDirection(camFwd); camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    const vh = 2 * WM_DIST * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), vw = vh * camera.aspect;
    const w = Math.min(vw * .86, vh * 2.6), h = w * 560 / 2400;
    wordmark.scale.set(w, h, 1); wordmark.quaternion.copy(camera.quaternion);
    wordmark.position.copy(camera.position).addScaledVector(camFwd, WM_DIST).addScaledVector(camUp, vh * (.27 - (1 - wmRise) * .06));
    wordmark.material.opacity = 1;
  }
  new ResizeObserver(resize).observe(card); resize();

  /* ── Entrada ── */
  const intro = { y:reduceMotion ? 0 : 7, v:0, on:!reduceMotion, t:0 };
  const squash = { s:0, v:0 };

  /* ── Entrada del puntero ── */
  const ndc = new THREE.Vector2(9, 9), raycaster = new THREE.Raycaster();
  const ptr = { inside:false, cx:0, cy:0 };
  let demo = false;
  function setPtr(cx, cy){ const r = canvas.getBoundingClientRect(); ptr.cx = cx; ptr.cy = cy; ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); }
  let hover = null, hoverHit = new THREE.Vector3(), grabbed = null, drilling = null, orbit = null;
  const grabPlane = new THREE.Plane(), grabArm = new THREE.Vector3();
  let yaw = 0, pitch = 0, yawT = 0, pitchT = 0, yawV = 0;

  canvas.addEventListener('pointermove', e => { if (demo) return; setPtr(e.clientX, e.clientY); ptr.inside = true;
    if (orbit){ yawT = THREE.MathUtils.clamp(orbit.yaw + (e.clientX - orbit.x) * .005, -.75, .75); pitchT = THREE.MathUtils.clamp(orbit.pitch + (e.clientY - orbit.y) * .003, -.2, .32); } });
  let realInside = false;
  canvas.addEventListener('pointerenter', () => { realInside = true; if (!demo) ptr.inside = true; });
  canvas.addEventListener('pointerleave', () => { realInside = false; if (!demo && !grabbed && !orbit) ptr.inside = false; });
  canvas.addEventListener('pointerdown', e => { Sound.unlock(); if (demo) return; try { canvas.setPointerCapture(e.pointerId); } catch(_){} setPtr(e.clientX, e.clientY); ptr.inside = true; down(); });
  addEventListener('pointerup', () => { if (!demo) up(); });
  addEventListener('blur', () => { if (!demo) up(); });

  function pick(){
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(toothMeshes, true);
    for (const h of hits){ const t = h.object.userData.tooth; if (t && t.state !== 'returning'){ hoverHit.copy(h.point); return t; } }
    return null;
  }
  function down(){
    const t = pick();
    if (t){
      if (t.cavity && !t.filled && t.state === 'anchored'){ drilling = t; Sound.drill.start(); return; }
      grabbed = t; camera.getWorldDirection(camFwd); grabPlane.setFromNormalAndCoplanarPoint(camFwd, hoverHit);
      const local = world.worldToLocal(hoverHit.clone()); grabArm.subVectors(local, t.pos);
      if (t.state === 'anchored'){ t.lat.set(0, 0, 0); Sound.squish.start(); }
      else { t.state = 'held'; t.vel.set(0, 0, 0); }
      return;
    }
    orbit = { x:ptr.cx, y:ptr.cy, yaw:yawT, pitch:pitchT }; canvas.classList.add('orbiting');
  }
  function up(){
    if (grabbed){ const t = grabbed; if (t.state === 'held'){ t.state = 'free'; if (t.vel.length() > 13) t.vel.setLength(13); Sound.whoosh(); } Sound.squish.stop(); grabbed = null; }
    if (drilling){ drilling = null; Sound.drill.stop(); }
    if (orbit){ orbit = null; canvas.classList.remove('orbiting'); }
  }

  /* ── Interfaz ── */
  const state = { pulled:0, coins:0, cariesLeft:[...teeth].filter(t => t.cavity).length, rewardCaries:false, rewardTen:false };
  function refreshChart(){
    $('#cariesN').textContent = state.cariesLeft; $('#pulledN').textContent = Math.min(state.pulled, 10);
    const off = (state.rewardCaries ? 5 : 0) + (state.rewardTen ? 10 : 0); $('#offN').textContent = off + '%';
    $('#offPill').classList.toggle('won', off > 0); $('#coins').textContent = state.coins;
    window.dispatchEvent(new CustomEvent('dulci:premio', { detail:{ off, caries:state.rewardCaries, diez:state.rewardTen } }));
  }
  const cardRect = () => card.getBoundingClientRect();
  const _sv = new THREE.Vector3();
  function toCard(local){ _sv.copy(local); world.localToWorld(_sv); _sv.project(camera); return { x:(_sv.x + 1) / 2 * W, y:(1 - _sv.y) / 2 * H }; }
  const PALETTE = ['#F2705F', '#8F63E8', '#2FB892', '#F4C542', '#FF8FB1', '#E8465C'];
  function sparkle(x, y, n = 10, colors = ['#F4C542', '#FFFDF9', '#FF8FB1'], spread = 70){
    for (let i = 0; i < n; i++){ const s = document.createElement('i'); s.className = 'spark';
      const a = Math.random() * Math.PI * 2, d = spread * (.4 + Math.random() * .8);
      s.style.cssText = `left:${x}px;top:${y}px;--c:${colors[i % colors.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--s:${8 + Math.random() * 12}px;--t:${.5 + Math.random() * .5}s`;
      fx.appendChild(s); setTimeout(() => s.remove(), 1100); }
  }
  function dust(x, y){ const s = document.createElement('i'); s.className = 'dust'; const a = -Math.PI / 2 + (Math.random() - .5) * 2.4, d = 20 + Math.random() * 40;
    s.style.cssText = `left:${x}px;top:${y}px;--c:${Math.random() < .5 ? '#FFF3DC' : '#E9D9B8'};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`; fx.appendChild(s); setTimeout(() => s.remove(), 600); }
  function confetti(x, y, n = 46){
    for (let i = 0; i < n; i++){ const c = document.createElement('i'); c.className = 'confetti'; const a = -Math.PI / 2 + (Math.random() - .5) * 2.6, d = 140 + Math.random() * 260;
      c.style.cssText = `left:${x}px;top:${y}px;--c:${PALETTE[i % PALETTE.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d + 260}px;--r:${(Math.random() - .5) * 900}deg;width:${8 + Math.random() * 8}px;height:${8 + Math.random() * 8}px`;
      fx.appendChild(c); setTimeout(() => c.remove(), 1700); }
  }
  const PHRASES = ['¿Ves? Ni dolió.', 'Usa hilo dental la próxima.', 'Uno menos.', 'Era de leche, seguro.', 'Sin anestesia, como los valientes.', 'El hada ya viene en camino.', '¿Seguro que era ese?', 'Escupe, por favor.', 'Tranquilo, es de azúcar.', 'Abre más grande.'];
  let phraseI = Math.floor(Math.random() * PHRASES.length);
  function say(text, color, big = false){
    const box = $('#phrases'); while (box.children.length > 2) box.firstChild.remove();
    const el = document.createElement('div'); el.className = 'phrase' + (big ? ' big' : ''); el.style.setProperty('--c', color);
    [...text].forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? ' ' : ch; s.style.animationDelay = (i * .025) + 's'; el.appendChild(s); });
    box.appendChild(el); setTimeout(() => el.remove(), 3100);
  }
  function flyCoin(from){
    const fb = $('#fairyBtn').getBoundingClientRect(), cr = cardRect();
    const tx = fb.left - cr.left + fb.width - 24, ty = fb.top - cr.top + fb.height / 2;
    const el = document.createElement('div'); el.className = 'flycoin'; el.style.left = from.x + 'px'; el.style.top = from.y + 'px'; fx.appendChild(el);
    const mx = (from.x + tx) / 2, my = Math.min(from.y, ty) - 140;
    const anim = el.animate([
      { transform:'translate(0,0) scale(1) rotateY(0)' },
      { transform:`translate(${mx - from.x}px,${my - from.y}px) scale(1.25) rotateY(540deg)`, offset:.5 },
      { transform:`translate(${tx - from.x}px,${ty - from.y}px) scale(.7) rotateY(1080deg)` }
    ], { duration:900, easing:'cubic-bezier(.4,.1,.3,1)' });
    anim.onfinish = () => { el.remove(); state.coins++; refreshChart(); Sound.ding(); const b = $('#fairyBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); sparkle(tx, ty, 6); };
  }

  /* ── El ¡pop! ── */
  function popTooth(t){
    t.state = 'held'; t.hold = 0; t.vel.set(0, 0, 0); t.hole.visible = true;
    const k = Math.round(t.fi); for (let i = 0; i < K; i++){ const g = Math.exp(-(((i - t.fi) ** 2) / 2.2)); gumP[t.jaw][i].v.addScaledVector(t.out, -1.6 * g); }
    squash.v += t.jaw ? -1.2 : 1.6;
    for (let i = 0; i < 9; i++) spawnDrop(t.socket.clone().addScaledVector(t.out, .03),
      new THREE.Vector3((Math.random() - .5) * 1.6, 0, (Math.random() - .5) * 1.2).addScaledVector(t.out, 1.2 + Math.random() * 1.8), .028 + Math.random() * .03);
    spawnStrand(t);
    const coin = new THREE.Mesh(coinGeo, goldMat); coin.position.copy(t.socket); world.add(coin);
    coins3d.push({ mesh:coin, v:new THREE.Vector3((Math.random() - .5) * 1.4, 4.4, 1.2), t:0 });
    const sp = toCard(t.socket); sparkle(sp.x, sp.y, 12);
    Sound.pop(); Sound.squish.stop(); setTimeout(() => Sound.boing(), 60);
    pinchyState.surprise = .7; pinchyState.boing = 1;
    state.pulled++; refreshChart();
    say(PHRASES[phraseI++ % PHRASES.length], PALETTE[state.pulled % 4]);
    if (state.pulled >= 10 && !state.rewardTen){ state.rewardTen = true; setTimeout(() => reward('¡Diez dientes! 10% de descuento.'), 700); }
  }
  function reward(text){
    refreshChart(); Sound.fanfare(); say(text, '#E8465C', true);
    const p = toCard(new THREE.Vector3(0, 1.1, .5)); confetti(p.x, p.y);
  }

  /* ── Choques ── */
  const _d = new THREE.Vector3(), _n = new THREE.Vector3();
  function gumHit(p, r){ // devuelve penetración y normal en _n
    let best = 0;
    for (const jaw of [0, 1]){
      let bi = -1, bd = 1e9; const smp = gumSamples[jaw];
      for (let i = 0; i < smp.length; i += 2){ const d = p.distanceToSquared(smp[i].c); if (d < bd){ bd = d; bi = i; } }
      if (bd > 1) continue;
      for (let i = Math.max(0, bi - 2); i <= Math.min(smp.length - 1, bi + 2); i++){
        const s = smp[i]; _d.subVectors(p, s.c); const a = _d.dot(s.n), b = _d.dot(s.u);
        const ea = GUM_RX + r, eb = GUM_RY + r, e = (a / ea) ** 2 + (b / eb) ** 2;
        if (e < 1){ const sc = 1 / Math.sqrt(Math.max(e, 1e-4)); const pen = (sc - 1) * Math.sqrt(a * a + b * b);
          if (pen > best){ best = pen; _n.set(0, 0, 0).addScaledVector(s.n, a / (ea * ea)).addScaledVector(s.u, b / (eb * eb)).normalize(); } }
      }
    }
    return best;
  }
  const _q = new THREE.Vector3();
  function tongueHit(p, r){
    _q.subVectors(p, TONGUE_C); _q.x /= TONGUE_S.x + r; _q.y /= TONGUE_S.y + r; _q.z /= TONGUE_S.z + r;
    const L = _q.length(); if (L >= 1 || _q.y < -.2) return 0;
    _n.set(_q.x / (TONGUE_S.x + r), _q.y / (TONGUE_S.y + r), _q.z / (TONGUE_S.z + r)).normalize();
    return (1 - L) * (TONGUE_S.y + r);
  }
  function bounce(t, n, pen, e = .42){
    t.pos.addScaledVector(n, pen); const vn = t.vel.dot(n);
    if (vn < 0){ t.vel.addScaledVector(n, -(1 + e) * vn); t.vel.multiplyScalar(.9);
      t.w.addScaledVector(new THREE.Vector3().crossVectors(n, t.vel), 1.2);
      const now = performance.now(); if (-vn > 1.2 && now - t.lastClack > 90){ t.lastClack = now; Sound.clack(-vn); } }
  }

  /* ── Hada de los dientes ── */
  function fairy(){
    Sound.unlock(); Sound.chime();
    for (const t of teeth){ if (t.state !== 'anchored'){ if (grabbed === t) up(); t.state = 'returning'; t.ret = 0; t.from = t.pos.clone(); t.fromQ = t.q.clone(); } t.loose = 0; }
    for (const d of drops) d.alive = false;
    for (const s of strands){ world.remove(s.a, s.b); s.a.geometry.dispose(); s.b.geometry.dispose(); } strands.length = 0;
    const p = toCard(new THREE.Vector3(0, 1.2, .6)); sparkle(p.x, p.y, 26, ['#F4C542', '#FFFDF9', '#8F63E8', '#FF8FB1'], 200);
    say('Todo como nuevo.', '#8F63E8');
  }
  $('#fairyBtn').addEventListener('click', fairy);
  $('#soundBtn').addEventListener('click', e => { Sound.unlock(); const m = !Sound.muted; Sound.setMuted(m); e.currentTarget.setAttribute('aria-pressed', String(!m)); e.currentTarget.querySelector('b').textContent = m ? 'no' : 'sí'; });

  /* ── Demostración: Pinchy saca un diente solo ── */
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function moveTo(x, y, ms){ return new Promise(res => { const x0 = ptr.cx, y0 = ptr.cy, t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; setPtr(x0 + (x - x0) * e, y0 + (y - y0) * e); if (k < 1) requestAnimationFrame(step); else res(); };
    requestAnimationFrame(step); }); }
  async function runDemo(){
    if (demo) return; Sound.unlock();
    let pool = teeth.filter(t => t.state === 'anchored' && !(t.cavity && !t.filled));
    if (!pool.length){ fairy(); await wait(900); pool = teeth.filter(t => t.state === 'anchored' && !(t.cavity && !t.filled)); }
    const front = pool.filter(t => t.jaw === 0).sort((a, b) => b.rest.z - a.rest.z);
    const t = (front[0] || pool[0]);
    demo = true; $('#demoBtn').disabled = true;
    const cr = cardRect(); const crown = t.rest.clone().addScaledVector(t.out, t.ty.h * .38); const sp = toCard(crown);
    if (!ptr.inside){ setPtr(cr.left + W * .78, cr.top + H * .25); }
    ptr.inside = true;
    await moveTo(cr.left + sp.x, cr.top + sp.y, 700); await wait(120);
    down();
    const sgn = t.jaw ? 1 : -1;
    for (let i = 0; i < 3; i++){ await moveTo(cr.left + sp.x - 34, cr.top + sp.y, 150); await moveTo(cr.left + sp.x + 34, cr.top + sp.y, 150); }
    await moveTo(cr.left + sp.x, cr.top + sp.y, 120);
    await moveTo(cr.left + sp.x + 10, cr.top + sp.y + sgn * 150, 520);
    await wait(150);
    await moveTo(cr.left + sp.x - 260, cr.top + sp.y + sgn * 230, 170);
    up(); await wait(500);
    demo = false; ptr.inside = realInside; $('#demoBtn').disabled = false;
  }
  $('#demoBtn').addEventListener('click', runDemo);

  /* ── Bucle principal ── */
  const pinchyState = { open:.15, openV:0, flip:0, surprise:0, boing:0, boingV:0, blink:2, squint:0 };
  const toolPos = new THREE.Vector3(0, 2, 2), toolVel = new THREE.Vector3(), toolTarget = new THREE.Vector3();
  let toolMix = 0, drillScale = 0, pinchyScale = 0;
  const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _m = new THREE.Vector3(), _qq = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
  const fwdPlane = new THREE.Plane();
  let last = performance.now(), dustT = 0, time = 0, heroVisible = true;
  // fuera de vista, la boca se pausa para no gastar
  new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; if (!heroVisible){ up(); Sound.squish.stop(); Sound.drill.stop(); } }).observe(card);

  function frame(now){
    requestAnimationFrame(frame);
    let dt = Math.min(1 / 30, (now - last) / 1000); last = now; if (document.hidden || !heroVisible) return; time += dt;

    // entrada: la boca cae como gelatina
    if (intro.on){ intro.t += dt; if (intro.t > .55){ intro.v -= 26 * dt; intro.y += intro.v * dt;
        if (intro.y <= 0){ intro.y = 0; if (intro.v < -2){ squash.v += -intro.v * .55; Sound.creak(); } intro.v = -intro.v * .18; if (Math.abs(intro.v) < .8){ intro.v = 0; intro.on = false; } } } }
    wmRise = Math.min(1, wmRise + dt * 1.6); placeWordmark();
    squash.v += (-170 * squash.s - 9 * squash.v) * dt; squash.s += squash.v * dt; squash.s = THREE.MathUtils.clamp(squash.s, -.25, .25);

    yaw += (yawT - yaw) * Math.min(1, dt * 8); pitch += (pitchT - pitch) * Math.min(1, dt * 8);
    const yawVel = (yawT - yaw) * 8;
    world.position.set(worldBaseX, intro.y, 0);
    world.rotation.set(pitch, yaw, 0);
    world.scale.set(1 + squash.s * .5, 1 - squash.s, 1 + squash.s * .5);
    const shK = 1 / (1 + intro.y * .25); mouthShadow.scale.set(5.4 * shK, 4.2 * shK, 1); mouthShadow.material.opacity = shK;

    raycaster.setFromCamera(ndc, camera);
    if (!grabbed && !drilling && !orbit) hover = ptr.inside ? pick() : null;

    // punto objetivo del agarre en coordenadas locales
    let target = null;
    if (grabbed){ const hit = new THREE.Vector3(); if (raycaster.ray.intersectPlane(grabPlane, hit)){ target = world.worldToLocal(hit).sub(grabArm); } }

    // física de dientes
    const sub = 2, h = dt / sub;
    for (let st = 0; st < sub; st++){
      for (const t of teeth){
        if (t.state === 'anchored'){
          if (grabbed === t && target){
            const raw = _v.subVectors(target, t.rest); const L = raw.length();
            const T = .62 - .4 * t.loose;                // salida: más floja, sale antes
            const lateral = _w.copy(raw).addScaledVector(t.out, -raw.dot(t.out));
            const latSpeed = _m.subVectors(lateral, t.lat).length() / h; t.lat.copy(lateral);
            const before = t.loose; t.loose = Math.min(1, t.loose + Math.min(latSpeed, 3) * h * .26);
            if (Math.floor(before * 6) !== Math.floor(t.loose * 6)) Sound.creak();
            const dmax = .06 + .2 * t.loose, sc = L > 1e-5 ? dmax * (1 - Math.exp(-L / dmax)) / L : 0;
            t.disp.lerp(_m.copy(raw).multiplyScalar(sc), Math.min(1, h * 30)); t.dv.set(0, 0, 0);
            t.tension = L / T;
            if (L > T){ popTooth(t); t.pos.copy(t.rest).add(t.disp); continue; }
          } else {
            t.dv.addScaledVector(t.disp, -260 * h).multiplyScalar(1 - Math.min(1, 9 * h)); t.disp.addScaledVector(t.dv, h); t.tension = 0;
          }
          if (drilling === t){ t.disp.set((Math.random() - .5) * .014, (Math.random() - .5) * .01, (Math.random() - .5) * .014); }
          t.pos.copy(t.rest).add(t.disp);
          const L = t.disp.length();
          if (L > 1e-5){ _m.crossVectors(t.out, t.disp).normalize(); _qq.setFromAxisAngle(_m, L * 1.7); t.q.copy(_qq).multiply(t.restQ); } else t.q.copy(t.restQ);
        } else if (t.state === 'held'){
          if (grabbed === t && target){ const np = _v.copy(t.pos).lerp(target, Math.min(1, h * 24)); _w.subVectors(np, t.pos).divideScalar(h); t.vel.lerp(_w, .35); t.pos.copy(np); }
          else t.state = 'free';
          t.hold += h; _qq.setFromAxisAngle(_m.set(.3, 1, .2).normalize(), Math.sin(t.hold * 9) * .02); t.q.premultiply(_qq);
        } else if (t.state === 'free'){
          t.vel.y -= 9.5 * h; t.pos.addScaledVector(t.vel, h);
          // giro
          const wl = t.w.length(); if (wl > 1e-4){ _qq.setFromAxisAngle(_m.copy(t.w).divideScalar(wl), wl * h); t.q.premultiply(_qq).normalize(); }
          t.w.multiplyScalar(1 - Math.min(1, 1.2 * h));
          // piso y bordes
          if (t.pos.y < FLOOR + t.r * .7){ _n.set(0, 1, 0); bounce(t, _n, FLOOR + t.r * .7 - t.pos.y, .38); t.vel.x *= .985; t.vel.z *= .985; t.w.multiplyScalar(.96); }
          if (t.pos.x < bounds.xMin + t.r){ _n.set(1, 0, 0); bounce(t, _n, bounds.xMin + t.r - t.pos.x, .5); }
          if (t.pos.x > bounds.xMax - t.r){ _n.set(-1, 0, 0); bounce(t, _n, t.pos.x - (bounds.xMax - t.r), .5); }
          if (t.pos.z < bounds.zMin){ _n.set(0, 0, 1); bounce(t, _n, bounds.zMin - t.pos.z, .5); }
          if (t.pos.z > bounds.zMax){ _n.set(0, 0, -1); bounce(t, _n, t.pos.z - bounds.zMax, .5); }
          let pen = gumHit(t.pos, t.r * .8); if (pen > 0) bounce(t, _n.clone(), pen, .45);
          pen = tongueHit(t.pos, t.r * .8); if (pen > 0){ bounce(t, _n.clone(), pen, .35); const k = Math.round(1); }
          if (t.pos.y > 6) t.vel.y = Math.min(t.vel.y, 0);
        } else if (t.state === 'returning'){
          t.ret += h / .7; const k = Math.min(1, t.ret), e = 1 - (1 - k) ** 3;
          t.pos.lerpVectors(t.from, t.rest, e); t.pos.y += Math.sin(k * Math.PI) * .9; t.q.slerpQuaternions(t.fromQ, t.restQ, e);
          if (k >= 1){ t.state = 'anchored'; t.disp.set(0, 0, 0); t.dv.copy(t.out).multiplyScalar(-1.2); t.hole.visible = false; t.vel.set(0, 0, 0); t.w.set(0, 0, 0); }
        }
      }
      // choques entre dientes sueltos y contra los anclados
      for (let i = 0; i < teeth.length; i++){ const a = teeth[i]; if (a.state !== 'free' && a.state !== 'held') continue;
        for (let j = 0; j < teeth.length; j++){ if (i === j) continue; const b = teeth[j]; if (b.state === 'returning') continue;
          _d.subVectors(a.pos, b.pos); const rr = (a.r + b.r) * .78, d2 = _d.lengthSq(); if (d2 >= rr * rr || d2 < 1e-8) continue;
          const d = Math.sqrt(d2); _n.copy(_d).divideScalar(d); const pen = rr - d;
          if (b.state === 'free' && j > i){ a.pos.addScaledVector(_n, pen / 2); b.pos.addScaledVector(_n, -pen / 2); const rv = _w.subVectors(a.vel, b.vel).dot(_n);
            if (rv < 0){ a.vel.addScaledVector(_n, -rv * .8); b.vel.addScaledVector(_n, rv * .8); if (-rv > 1.5) Sound.clack(-rv * .7); } }
          else if (b.state === 'anchored' && a.state === 'free'){ bounce(a, _n.clone(), pen, .45); b.dv.addScaledVector(_n, -Math.min(2, a.vel.length()) * .3); }
        } }
    }
    for (const t of teeth){
      t.mesh.position.copy(t.pos); t.mesh.quaternion.copy(t.q);
      const loose = t.state === 'free' || t.state === 'held';
      t.shadow.visible = loose; if (loose){ const hh = Math.max(0, t.pos.y - FLOOR); const s = t.r * 2.6 * (1 + hh * .35); t.shadow.position.set(t.pos.x, FLOOR + .003, t.pos.z); t.shadow.scale.set(s, 1, s); }
      if (t.state === 'free' && t.vel.lengthSq() < .02 && t.pos.y < FLOOR + t.r){ t.vel.multiplyScalar(.9); }
    }

    // gelatina de las encías: resortes encadenados
    for (const jaw of [0, 1]){ const P = gumP[jaw];
      for (const p of P){ p.t.set(0, 0, 0); p.w = 0; }
      for (const t of teeth){ if (t.jaw !== jaw) continue; const L = t.disp.lengthSq(); if (L < 1e-6 && !(grabbed === t)) continue;
        for (let i = 0; i < K; i++){ const g = Math.exp(-(((i - t.fi) ** 2) / 1.6)); if (g < .02) continue; P[i].t.addScaledVector(t.disp, .55 * g); P[i].w = Math.max(P[i].w, g); } }
      for (let i = 0; i < K; i++){ const p = P[i], l = P[Math.max(0, i - 1)].o, r = P[Math.min(K - 1, i + 1)].o;
        _v.copy(l).add(r).addScaledVector(p.o, -2).multiplyScalar(70);
        _v.addScaledVector(p.o, -95).addScaledVector(p.v, -7.5);
        if (p.w > 0) _v.add(_w.subVectors(p.t, p.o).multiplyScalar(200 * p.w));
        p.v.addScaledVector(_v, dt); }
      for (const p of P) p.o.addScaledVector(p.v, dt);
    }
    // deformar las mallas de encía
    for (const g of gums){
      const pos = g.mesh.geometry.attributes.position, P = gumP[g.jaw], b = g.base;
      let pull = null; if (grabbed && grabbed.jaw === g.jaw && grabbed.state === 'anchored') pull = grabbed;
      for (let i = 0; i < pos.count; i++){
        const f = g.fi[i], i0 = Math.floor(f), i1 = Math.min(K - 1, i0 + 1), fr = f - i0, tw = g.topW[i];
        const o0 = P[i0].o, o1 = P[i1].o;
        let x = b[i * 3] + (o0.x + (o1.x - o0.x) * fr) * tw, y = b[i * 3 + 1] + (o0.y + (o1.y - o0.y) * fr) * tw, z = b[i * 3 + 2] + (o0.z + (o1.z - o0.z) * fr) * tw;
        if (pull){ const dx = b[i * 3] - pull.socket.x, dy = b[i * 3 + 1] - pull.socket.y, dz = b[i * 3 + 2] - pull.socket.z, d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < .2){ const gg = Math.exp(-d2 / .035) * tw * 1.1; x += pull.disp.x * gg; y += pull.disp.y * gg; z += pull.disp.z * gg; } }
        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true; g.mesh.geometry.computeVertexNormals();
    }

    // campanilla: tiembla sola con el movimiento
    uv.v += (-60 * uv.a - 3 * uv.v - yawVel * 2.5 - squash.v * .8) * dt; uv.a += uv.v * dt;
    uv.bv += (-40 * uv.b - 2.5 * uv.bv + squash.v * 2) * dt; uv.b += uv.bv * dt;
    uvulaPivot.rotation.set(uv.b * .3 + Math.sin(time * 1.7) * .03, 0, uv.a * .4 + Math.sin(time * 1.3) * .04);

    // hilos de encía
    for (let i = strands.length - 1; i >= 0; i--){
      const s = strands[i], t = s.tooth;
      if (t.state === 'anchored' || t.state === 'returning'){ world.remove(s.a, s.b); strands.splice(i, 1); continue; }
      const A0 = s.endA.copy(t.socket), B0 = s.endB.copy(t.pos).addScaledVector(_m.set(0, -1, 0).applyQuaternion(t.q), t.ty.h * .36);
      const L = A0.distanceTo(B0);
      if (!s.snapped){ s.mid.lerpVectors(A0, B0, .5); s.mid.y -= Math.min(.18, L * .12);
        if (L > 1.15){ s.snapped = true; s.t = 0; s.snapMid = s.mid.clone(); Sound.snap(); const sp = toCard(s.mid); sparkle(sp.x, sp.y, 6, ['#FF8FB1', '#FFFDF9']);
          spawnDrop(s.mid.clone(), new THREE.Vector3(0, -.5, 0), .035); } }
      else { s.t += dt / .32; }
      if (s.snapped && s.t >= 1){ world.remove(s.a, s.b); s.a.geometry.dispose(); s.b.geometry.dispose(); strands.splice(i, 1); continue; }
      const thin = THREE.MathUtils.clamp(Math.sqrt(.3 / Math.max(L, .05)), .25, 1);
      for (const [mesh, P0] of [[s.a, A0], [s.b, B0]]){
        let M1 = s.mid;
        if (s.snapped){ const e = 1 - (1 - s.t) ** 3, wob = Math.sin(s.t * 18) * (1 - s.t) * .05; M1 = _w.copy(s.snapMid).lerp(P0, e); M1.y += wob; }
        const pts = [], radii = [];
        for (let k = 0; k < 10; k++){ const u = k / 9; const p = new THREE.Vector3().lerpVectors(P0, M1, u); p.y -= Math.sin(u * Math.PI) * .03;
          pts.push(p); radii.push(s.r0 * (1 - .78 * u ** 1.6) * (s.snapped ? (1 - s.t * .6) : thin)); }
        writeTube(mesh, pts, radii);
      }
    }

    // gotas de jarabe
    for (let i = 0; i < DROPS; i++){ const d = drops[i];
      if (!d.alive){ dropMesh.setMatrixAt(i, ZERO_M); continue; }
      d.life += dt;
      if (!d.stuck){
        d.v.y -= 8 * dt; d.p.addScaledVector(d.v, dt);
        let stuck = false;
        if (d.p.y < FLOOR + d.r * .3){ d.p.y = FLOOR + d.r * .3; _n.set(0, 1, 0); stuck = true; }
        else if (d.v.y < 0 && tongueHit(d.p, d.r * .3) > 0){ stuck = true; }
        else if (d.v.y < 0 && gumHit(d.p, d.r * .3) > 0){ stuck = true; }
        else for (const t of teeth){ if (t.state !== 'anchored' || t.socket.distanceToSquared(d.p) > .5) continue; if (d.p.distanceToSquared(t.pos) < (t.r * .9) ** 2 && d.v.y < 0){ stuck = true; d.tooth = t; d.off.subVectors(d.p, t.pos); break; } }
        if (stuck){ d.stuck = true; d.life = 0; d.n.copy(_n); if (Math.random() < .5) Sound.drip(); }
        if (d.p.y < -3) d.alive = false;
      } else {
        if (d.tooth){ if (d.tooth.state !== 'anchored'){ d.alive = false; continue; } d.p.copy(d.tooth.pos).add(d.off); }
        if (d.life > 9) d.alive = false;
      }
      const fade = d.stuck ? Math.max(0, 1 - Math.max(0, d.life - 8)) : 1;
      const m = DROP_M;
      if (d.stuck){ _qq.setFromUnitVectors(UP, d.n); m.compose(d.p, _qq, _m.set(d.r * 1.7 * fade, d.r * .45 * fade, d.r * 1.7 * fade)); }
      else { const sp = d.v.length(); _qq.setFromUnitVectors(UP, _w.copy(d.v).normalize()); m.compose(d.p, _qq, _m.set(d.r, d.r * (1 + Math.min(.8, sp * .08)), d.r)); }
      dropMesh.setMatrixAt(i, m);
    }
    dropMesh.instanceMatrix.needsUpdate = true;

    // monedas
    for (let i = coins3d.length - 1; i >= 0; i--){ const c = coins3d[i]; c.t += dt; c.v.y -= 9 * dt; c.mesh.position.addScaledVector(c.v, dt);
      c.mesh.rotation.x = Math.PI / 2; c.mesh.rotation.z += dt * 14;
      if (c.t > .62){ flyCoin(toCard(c.mesh.position)); world.remove(c.mesh); coins3d.splice(i, 1); } }

    // taladro
    if (drilling){
      const t = drilling; t.drill += dt / 1.4;
      Sound.drill.set((n, ct) => { n.o1.frequency.setTargetAtTime(130 + Math.random() * 25, ct, .02); n.f.frequency.setTargetAtTime(1300 + t.drill * 900, ct, .05); });
      dustT += dt; const sp = toCard(t.pos.clone().addScaledVector(t.out, t.ty.h * .5)); while (dustT > .03){ dustT -= .03; dust(sp.x, sp.y); }
      const k = Math.min(1, t.drill); t.spot.material.color.setRGB(.36 + k * .48, .19 + k * .65, .09 + k * .76);
      if (t.drill >= 1){ t.filled = true; drilling = null; Sound.drill.stop(); Sound.ding(); sparkle(sp.x, sp.y, 12, ['#D9E2E6', '#FFFDF9', '#F4C542']);
        state.cariesLeft--; refreshChart(); t.fillT = 0; say(['Empaste listo.', 'Brilla como plata.', 'Una caries menos.'][state.cariesLeft % 3], '#2FB892');
        if (state.cariesLeft === 0 && !state.rewardCaries){ state.rewardCaries = true; setTimeout(() => reward('¡Sonrisa perfecta! 5% de descuento.'), 600); } }
    }
    for (const t of teeth){ if (t.spot && t.filled){ t.fillT = (t.fillT || 0) + dt; const k = Math.max(0, 1 - Math.max(0, t.fillT - 1.2) / 1.2); t.spot.scale.set(t.ty.w * .3 * k, .03 * k + .0001, t.ty.d * .28 * k); if (k <= 0) t.spot.visible = false; }
      if (t.spot && !t.filled && t.state === 'anchored'){ t.spot.visible = true; } }

    // herramienta-cursor
    const wantDrill = (drilling || (hover && hover.cavity && !hover.filled && hover.state === 'anchored' && !grabbed));
    toolMix += ((wantDrill ? 1 : 0) - toolMix) * Math.min(1, dt * 14);
    const visible = ptr.inside || demo || grabbed;
    pinchyScale += (((visible && toolMix < .5) ? 1 : 0) - pinchyScale) * Math.min(1, dt * 16);
    drillScale += (((visible && toolMix >= .5) ? 1 : 0) - drillScale) * Math.min(1, dt * 16);
    if (grabbed){ toolTarget.copy(grabbed.pos).add(grabArm); world.localToWorld(toolTarget); }
    else if (hover && !orbit){ toolTarget.copy(hoverHit); }
    else { camera.getWorldDirection(camFwd); fwdPlane.setFromNormalAndCoplanarPoint(camFwd, _v.set(worldBaseX, 1, 1.1)); raycaster.ray.intersectPlane(fwdPlane, toolTarget) || toolTarget.copy(toolPos); }
    // sigue al cursor con un poquito de retraso: se siente vivo
    { const k = 1 - Math.exp(-dt * (grabbed ? 40 : 18)); _v.copy(toolPos).lerp(toolTarget, k);
      _w.subVectors(_v, toolPos).divideScalar(Math.max(dt, 1e-4)); toolVel.lerp(_w, .3); toolPos.copy(_v); }
    const ps = pinchyState;
    const flipT = (grabbed && grabbed.jaw === 1 && grabbed.state === 'anchored') || (!grabbed && hover && hover.jaw === 1 && hover.state === 'anchored') ? Math.PI : 0;
    ps.flip += (flipT - ps.flip) * Math.min(1, dt * 10);
    const openT = grabbed ? .02 : (hover ? .34 : .14);
    ps.openV += ((openT - ps.open) * 320 - ps.openV * 22) * dt; ps.open += ps.openV * dt;
    armL.rotation.z = ps.open; armR.rotation.z = -ps.open;
    ps.boingV += (-260 * ps.boing - 10 * ps.boingV) * dt; ps.boing += ps.boingV * dt;
    const sway = THREE.MathUtils.clamp(-toolVel.x * .05, -.5, .5);
    pinchy.rotation.set(0, 0, ps.flip + sway);
    pinchyBody.scale.set(1 - ps.boing * .15, 1 + ps.boing * .25, 1);
    const tipW = _w.copy(PINCHY_TIP).multiplyScalar(1.05).applyEuler(pinchy.rotation);
    pinchy.position.copy(toolPos).sub(tipW);
    pinchy.scale.setScalar(1.05 * Math.max(.0001, pinchyScale));
    // ojos de Pinchy: se concentra al jalar, sorpresa en el pop, parpadea solo
    ps.surprise = Math.max(0, ps.surprise - dt); ps.blink -= dt; if (ps.blink < -.12) ps.blink = 2 + Math.random() * 3;
    const tension = grabbed && grabbed.tension ? Math.min(1, grabbed.tension) : 0;
    ps.squint += ((grabbed ? .35 + tension * .5 : 0) - ps.squint) * Math.min(1, dt * 12);
    let eyeY = 1 - ps.squint; if (ps.blink < 0) eyeY = .08; if (ps.surprise > 0) eyeY = 1.3;
    const shake = grabbed ? tension * .012 : 0;
    for (const e of pEyes){ e.scale.set(ps.surprise > 0 ? 1.3 : 1, Math.max(.06, eyeY), 1); const pu = e.userData.pupil;
      pu.position.x = THREE.MathUtils.clamp(toolVel.x * .006, -.02, .02) + (Math.random() - .5) * shake; pu.position.y = THREE.MathUtils.clamp(toolVel.y * .006, -.02, .02) - (grabbed ? .008 : 0); }
    pinchyBody.position.x = (Math.random() - .5) * shake * 2;
    // Dr. Drill
    drill.position.copy(toolPos).sub(_m.copy(DRILL_TIP));
    drill.rotation.set(0, 0, sway * .6);
    drill.scale.setScalar(Math.max(.0001, drillScale));
    bur.rotation.y += dt * (drilling ? 60 : 6);
    const dz = drilling ? (Math.random() - .5) * .03 : 0; drillBody.position.set(dz, dz, 0);
    drillBody.scale.set(drilling ? 1.06 : 1, drilling ? .93 : 1, 1);
    for (const e of dEyes){ e.scale.set(1, drilling ? .45 : (ps.blink < 0 ? .08 : 1), 1); const pu = e.userData.pupil; pu.position.x = THREE.MathUtils.clamp(toolVel.x * .006, -.02, .02); pu.position.y = -.01; }

    if (grabbed && grabbed.state === 'anchored') Sound.squish.set((n, ct) => { const tt = grabbed.tension || 0;
      n.g.gain.setTargetAtTime(Math.min(.3, tt * .26) * (.7 + Math.random() * .6), ct, .03); n.f.frequency.setTargetAtTime(280 + tt * 900 + Math.random() * 120, ct, .03); });

    renderer.render(scene, camera);
  }
  refreshChart();
  requestAnimationFrame(t => { last = t; frame(t); });
}
