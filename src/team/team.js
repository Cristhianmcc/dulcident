/* ───────────── El equipo: cuatro personajes de gomita que te miran ───────────── */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const stage = document.getElementById('teamStage'), cv = document.getElementById('teamCanvas');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer = null;
try { renderer = new THREE.WebGLRenderer({ canvas:cv, antialias:true, alpha:true }); } catch(e){ console.warn('Sin WebGL para el equipo', e); }
if (renderer) startTeam();

function startTeam(){
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .9;
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 6, 5); scene.add(key);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xbfe3d2, .6));
  const camera = new THREE.PerspectiveCamera(26, 1, .1, 60);
  camera.position.set(0, 2.1, 10); camera.lookAt(0, 1.35, 0);

  const gummy = (color, att) => new THREE.MeshPhysicalMaterial({ color, roughness:.22, clearcoat:1, clearcoatRoughness:.06,
    transmission:.15, thickness:.4, attenuationColor:new THREE.Color(att), attenuationDistance:.5 });
  const red = gummy('#E8465C', '#9A0D25'), mint = gummy('#3FD6B0', '#117A60'), grape = gummy('#9D6CF5', '#4B2499'), lemon = gummy('#F6C84A', '#A0700A');
  const white = new THREE.MeshPhysicalMaterial({ color:'#FFFDF9', roughness:.2, clearcoat:1, clearcoatRoughness:.05 });
  const pink = new THREE.MeshPhysicalMaterial({ color:'#FF8FB1', roughness:.25, clearcoat:1, sheen:.5, sheenColor:new THREE.Color('#FFE3E7') });
  const steel = new THREE.MeshStandardMaterial({ color:'#D9E2E6', metalness:1, roughness:.18 });
  const eyeW = new THREE.MeshStandardMaterial({ color:'#ffffff', roughness:.3, emissive:'#ffffff', emissiveIntensity:.15 });
  const eyeB = new THREE.MeshBasicMaterial({ color:'#16181A' });
  function eye(r){
    const g = new THREE.Group();
    const w = new THREE.Mesh(new THREE.CircleGeometry(r, 28), eyeW);
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(r * .5, 20), eyeB); pupil.position.z = .003;
    const glint = new THREE.Mesh(new THREE.CircleGeometry(r * .16, 10), eyeW); glint.position.set(r * .14, r * .16, .003); pupil.add(glint);
    g.add(w, pupil); g.userData = { pupil, r }; return g;
  }
  function blob(w, h, d, e = .55){
    const g = new THREE.SphereGeometry(1, 32, 24), p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++){ v.fromBufferAttribute(p, i);
      p.setXYZ(i, Math.sign(v.x) * Math.abs(v.x) ** e * w / 2, Math.sign(v.y) * Math.abs(v.y) ** e * h / 2, Math.sign(v.z) * Math.abs(v.z) ** e * d / 2); }
    g.computeVertexNormals(); return g;
  }
  const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };

  // Dr. Drill
  function makeDrill(){
    const body = new THREE.Group(), x = {};
    body.add(M(new THREE.CapsuleGeometry(.3, .7, 10, 24), mint, 0, 1.0));
    for (const y of [.55, 1.42]){ const r = M(new THREE.TorusGeometry(.31, .06, 12, 32), white, 0, y); r.rotation.x = Math.PI / 2; body.add(r); }
    const head = M(new THREE.CapsuleGeometry(.19, .34, 8, 20), white, .17, 1.86); head.rotation.z = -.7; body.add(head);
    x.bur = new THREE.Group(); x.bur.position.y = .34; body.add(x.bur);
    x.bur.add(M(new THREE.CylinderGeometry(.05, .05, .2, 14), steel, 0, -.1));
    const tip = M(new THREE.ConeGeometry(.08, .16, 16), steel, 0, -.26); tip.rotation.x = Math.PI; x.bur.add(tip);
    const eyes = [eye(.1), eye(.1)]; eyes[0].position.set(-.12, 1.15, .305); eyes[1].position.set(.12, 1.15, .305); body.add(...eyes);
    return { body, eyes, x, eyeY:1.15, h:2.05 };
  }
  // Pinchy
  function makePinchy(){
    const body = new THREE.Group(), x = {}, inner = new THREE.Group(); inner.scale.setScalar(2.15); inner.position.y = .82; body.add(inner);
    x.arms = [];
    for (const s of [-1, 1]){ const arm = new THREE.Group(); inner.add(arm); x.arms.push(arm);
      const hd = M(new THREE.CapsuleGeometry(.075, .5, 8, 16), red, s * .15, .36, -.03); hd.rotation.z = -s * .36; arm.add(hd);
      arm.add(M(new THREE.SphereGeometry(.09, 16, 12), red, s * .27, .66, -.03));
      const jw = M(new THREE.CapsuleGeometry(.052, .17, 6, 12), red, -s * .025, -.2); jw.rotation.z = -s * .2; arm.add(jw);
      arm.add(M(new THREE.SphereGeometry(.05, 12, 10), white, s * .012, -.33, .01)); }
    inner.add(M(new THREE.SphereGeometry(.15, 24, 18), white));
    const eyes = [eye(.05), eye(.05)]; eyes[0].position.set(-.062, .03, .152); eyes[1].position.set(.062, .03, .152); inner.add(...eyes);
    return { body, eyes, x, eyeY:.88, h:2.3 };
  }
  // Bristles
  function makeBristles(){
    const body = new THREE.Group(), x = {};
    body.add(M(new THREE.CapsuleGeometry(.18, 1.04, 10, 24), grape, 0, .7));
    body.add(M(blob(.46, .32, .36), grape, 0, 1.5));
    const cols = ['#FFFDF9', '#3FD6B0'];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++){
      const m = M(new THREE.CapsuleGeometry(.032, .16, 4, 8), r === 1 ? mint : white, -.15 + c * .1, 1.72, -.09 + r * .09); body.add(m); }
    const eyes = [eye(.085), eye(.085)]; eyes[0].position.set(-.085, 1.02, .18); eyes[1].position.set(.085, 1.02, .18); body.add(...eyes);
    return { body, eyes, x, eyeY:1.02, h:1.9 };
  }
  // Flossy
  function makeFlossy(){
    const body = new THREE.Group(), x = {};
    body.add(M(blob(.92, .96, .62, .4), lemon, 0, .5));
    const band = M(blob(.96, .14, .66, .4), white, 0, .82); body.add(band);
    x.tail = new THREE.Group(); x.tail.position.set(0, .96, 0); body.add(x.tail);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(.02, .28, .04), new THREE.Vector3(.24, .5, 0), new THREE.Vector3(.52, .42, 0), new THREE.Vector3(.66, .16, .02)]);
    x.tail.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, .035, 10, false), pink));
    x.tail.add(M(new THREE.SphereGeometry(.05, 12, 10), pink, .66, .16, .02));
    const eyes = [eye(.1), eye(.1)]; eyes[0].position.set(-.16, .55, .315); eyes[1].position.set(.16, .55, .315); body.add(...eyes);
    return { body, eyes, x, eyeY:.55, h:1.55 };
  }

  const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g2 = c.getContext('2d');
    const g = g2.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(40,90,70,.45)'); g.addColorStop(1, 'rgba(40,90,70,0)');
    g2.fillStyle = g; g2.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();

  const chars = [makeDrill(), makePinchy(), makeBristles(), makeFlossy()].map((c, i) => {
    const root = new THREE.Group(); root.add(c.body); scene.add(root);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1), new THREE.MeshBasicMaterial({ map:shadowTex, transparent:true, depthWrite:false, toneMapped:false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = .002; root.add(sh);
    c.body.traverse(o => { if (o.isMesh) o.userData.ci = i; });
    return Object.assign(c, { root, sh, i, y:reduce ? 0 : 5 + i * .9, v:0, sq:0, sqv:0, hov:0, blink:1 + Math.random() * 3, t:Math.random() * 10 });
  });
  const cards = [...document.querySelectorAll('#team .member')];
  let cardHover = -1;
  cards.forEach((el, i) => { el.addEventListener('mouseenter', () => { cardHover = i; }); el.addEventListener('mouseleave', () => { if (cardHover === i) cardHover = -1; }); });

  let W = 1, H = 1, scaleK = 1;
  function resize(){
    W = stage.clientWidth; H = stage.clientHeight; if (!W || !H) return;
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    const vh = 2 * 10 * Math.tan(THREE.MathUtils.degToRad(13)), vw = vh * camera.aspect;
    // dos a cada lado, con el hueco del centro libre para la boca (que vive en el lienzo de atrás)
    const xs = [-.38, -.22, .22, .38]; scaleK = Math.min(1.5, vw * .2 / 2.1);   // mismas x que las tarjetas (--x en el CSS)
    chars.forEach((c, i) => { c.root.position.x = xs[i] * vw; c.root.scale.setScalar(scaleK); });
  }
  new ResizeObserver(resize).observe(stage); resize();

  const mouse = new THREE.Vector2(0, 0), ray = new THREE.Raycaster(); let inside = false;
  addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); mouse.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; });
  const meshes = []; chars.forEach(c => c.body.traverse(o => { if (o.isMesh) meshes.push(o); }));
  let hovered = -1;
  stage.addEventListener('click', () => { if (hovered >= 0){ const c = chars[hovered]; c.sqv += 5.5; } });

  let visible = false, dropped = reduce, last = performance.now();
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !dropped){ dropped = true; } }, { threshold:.25 }).observe(stage);
  const p = new THREE.Vector3();
  function frame(now){
    requestAnimationFrame(frame);
    const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
    if (!visible || document.hidden) return;
    hovered = -1;
    if (inside){ ray.setFromCamera(mouse, camera); const h = ray.intersectObjects(meshes, false)[0]; if (h) hovered = h.object.userData.ci; }
    const active = hovered >= 0 ? hovered : cardHover;
    stage.style.cursor = hovered >= 0 ? 'pointer' : 'default';
    cards.forEach((el, i) => el.classList.toggle('on', i === active));
    for (const c of chars){
      c.t += dt;
      if (dropped && c.y > 0 || c.v !== 0){ c.v -= 24 * dt; c.y += c.v * dt;
        if (c.y <= 0){ c.y = 0; if (c.v < -2) c.sqv += -c.v * .3; c.v = -c.v * .22; if (Math.abs(c.v) < .7) c.v = 0; } }
      c.sqv += (-200 * c.sq - 11 * c.sqv) * dt; c.sq += c.sqv * dt; c.sq = Math.max(-.3, Math.min(.3, c.sq));
      c.hov += ((c.i === active ? 1 : 0) - c.hov) * Math.min(1, dt * 10);
      c.root.position.y = c.y;
      c.body.scale.set(1 + c.sq * .5, 1 - c.sq, 1 + c.sq * .5);
      c.body.rotation.z = Math.sin(c.t * 1.3 + c.i) * .025;
      c.body.position.x = 0;
      const k = c.hov;
      if (c.i === 0){ c.body.position.x = (Math.random() - .5) * .04 * k; c.x.bur.rotation.y += dt * (4 + 50 * k); }
      if (c.i === 1){ const o = .1 + .3 * k + Math.sin(c.t * 3) * .02; c.x.arms[0].rotation.z = o; c.x.arms[1].rotation.z = -o; }
      if (c.i === 2){ c.body.rotation.z += Math.sin(c.t * 15) * .16 * k; }
      if (c.i === 3){ c.x.tail.rotation.z = Math.sin(c.t * 2) * .08 + Math.sin(c.t * 11) * .45 * k; c.x.tail.rotation.y = Math.sin(c.t * 7) * .3 * k; }
      const shk = 1 / (1 + c.y * .4); c.sh.scale.set(shk, shk, 1); c.sh.material.opacity = shk;
      c.sh.position.y = -c.y / Math.max(scaleK, .01) + .002;
      // ojos: siguen al cursor por toda la página y parpadean
      c.blink -= dt; if (c.blink < -.12) c.blink = 2 + Math.random() * 3.5;
      p.set(0, c.eyeY, 0); c.body.localToWorld(p); p.project(camera);
      const dx = Math.max(-1, Math.min(1, (mouse.x - p.x) * camera.aspect * .5)), dy = Math.max(-1, Math.min(1, (mouse.y - p.y) * .7));
      for (const e of c.eyes){ const r = e.userData.r; e.userData.pupil.position.set(dx * r * .4, dy * r * .4, .003);
        e.scale.set(1 + k * .15, c.blink < 0 ? .08 : 1 + k * .15, 1); }
    }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(t => { last = t; frame(t); });
}
