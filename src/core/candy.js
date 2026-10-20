/* Lluvia de gomitas: dulces de verdad (gotas, aros, gusanitos y estrellas) que salen disparados,
   caen con gravedad, giran y rebotan en el borde de abajo de la pantalla. Viven en la capa fija #fx. */
const COLORS = ['#F2705F', '#FF8FB1', '#2FB892', '#F4C542', '#8F63E8', '#3FD6B0', '#FF6B6B'];
const SHAPES = ['drop', 'ring', 'worm', 'star', 'bear'];
const layer = () => document.getElementById('fx');
let parts = [], running = false, last = 0;

function make(shape, color, size){
  const el = document.createElement('i');
  el.className = 'gummy ' + shape;
  el.style.setProperty('--c', color);
  el.style.width = (shape === 'worm' ? size * 2.2 : size) + 'px';
  el.style.height = (shape === 'worm' ? size * .55 : shape === 'bear' ? size * 1.15 : size) + 'px';
  layer().appendChild(el);
  return el;
}

export function candyBurst(x, y, n = 60, spread = 1){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) n = Math.min(n, 12);
  for (let i = 0; i < n; i++){
    const shape = SHAPES[i % SHAPES.length], size = 18 + Math.random() * 20;
    const a = -Math.PI / 2 + (Math.random() - .5) * 2.4 * spread, v = 520 + Math.random() * 760;
    parts.push({ el:make(shape, COLORS[(Math.random() * COLORS.length) | 0], size), x, y,
      vx:Math.cos(a) * v, vy:Math.sin(a) * v, r:Math.random() * 360, vr:(Math.random() - .5) * 900, life:0, size, bounces:0 });
  }
  if (!running){ running = true; last = performance.now(); requestAnimationFrame(step); }
}

function step(now){
  const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
  const floor = innerHeight - 18;
  for (const p of parts){
    p.life += dt; p.vy += 2100 * dt; p.vx *= 1 - .4 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
    if (p.y > floor - p.size / 2 && p.vy > 0){   // rebote de gomita: pierde fuerza y se aplasta un poco
      p.y = floor - p.size / 2; p.vy *= -.45; p.vx *= .8; p.vr *= .6; p.bounces++; p.squash = 1;
    }
    p.squash = Math.max(0, (p.squash || 0) - dt * 6);
    const fade = Math.max(0, Math.min(1, 3.6 - p.life));
    p.el.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%) rotate(${p.r}deg) scale(${1 + p.squash * .25},${1 - p.squash * .3})`;
    p.el.style.opacity = fade;
  }
  parts = parts.filter(p => { if (p.life > 3.6){ p.el.remove(); return false; } return true; });
  if (parts.length) requestAnimationFrame(step); else running = false;
}
