/* Selector de diente: modelo dental de gomita visto desde arriba */
const NAMES = ['incisivo central', 'incisivo lateral', 'canino', 'primer premolar', 'segundo premolar', 'primer molar'];
const TW = [26, 21, 22, 22, 22, 30].map(v => v * 1.3);   // ancho a lo largo del arco
const TD = [15, 14, 20, 24, 25, 30].map(v => v * 1.3);   // profundidad hacia adentro
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const jaw = document.getElementById('jaw'), picked = document.getElementById('picked');
const svg = el('svg', { viewBox:'0 0 440 400', role:'group', 'aria-labelledby':'jawLegend' });
const defs = el('defs', {}, svg);
defs.innerHTML = `
  <linearGradient id="jGum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7909A"/><stop offset="1" stop-color="#EE6F7E"/></linearGradient>
  <radialGradient id="jTooth" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FFF6E6"/><stop offset="1" stop-color="#F1DFC2"/></radialGradient>
  <radialGradient id="jPick" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#FFB2A6"/><stop offset=".6" stop-color="#F2705F"/><stop offset="1" stop-color="#D8513F"/></radialGradient>
  <radialGradient id="jTongue" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#FFB0BF"/><stop offset="1" stop-color="#F57F96"/></radialGradient>
  <filter id="jShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#9C3A48" flood-opacity=".35"/></filter>`;
// Arco elíptico: el frente de la arcada de arriba mira hacia arriba y el de abajo hacia abajo
const A = 140, B = 125;
const arcPt = (upper, t, cy) => ({ x:220 + A * Math.sin(t), y:upper ? cy - B * Math.cos(t) : cy + B * Math.cos(t) });
const arcN = (upper, t) => { const nx = Math.sin(t) / A, ny = (upper ? -1 : 1) * Math.cos(t) / B, L = Math.hypot(nx, ny); return { x:nx / L, y:ny / L }; };
const SAMPLES = 600, tab = [];
{ let s = 0, prev = arcPt(true, 0, 0); for (let i = 0; i <= SAMPLES; i++){ const t = 1.55 * i / SAMPLES, p = arcPt(true, t, 0); if (i) s += Math.hypot(p.x - prev.x, p.y - prev.y); tab.push([t, s]); prev = p; } }
const tAt = s => { for (let i = 1; i < tab.length; i++) if (tab[i][1] >= s){ const [t0, s0] = tab[i - 1], [t1, s1] = tab[i]; return t0 + (t1 - t0) * (s - s0) / (s1 - s0); } return 1.55; };
const shapeOf = (k, w, d) => {
  const hw = w / 2, hd = d / 2;
  if (k <= 1) return `M${-hw} ${-hd + 4}Q${-hw} ${-hd} ${-hw + 5} ${-hd}H${hw - 5}Q${hw} ${-hd} ${hw} ${-hd + 4}V${hd - 6}Q${hw} ${hd} ${hw - 7} ${hd}H${-hw + 7}Q${-hw} ${hd} ${-hw} ${hd - 6}Z`;
  if (k === 2) return `M0 ${-hd}Q${hw} ${-hd + 2} ${hw} ${0}Q${hw} ${hd} 0 ${hd}Q${-hw} ${hd} ${-hw} 0Q${-hw} ${-hd + 2} 0 ${-hd}Z`;
  if (k <= 4) return `M0 ${-hd}C${hw * 1.1} ${-hd} ${hw * 1.1} ${hd} 0 ${hd}C${-hw * 1.1} ${hd} ${-hw * 1.1} ${-hd} 0 ${-hd}Z`;
  const r = 8; return `M${-hw + r} ${-hd}H${hw - r}Q${hw} ${-hd} ${hw} ${-hd + r}V${hd - r}Q${hw} ${hd} ${hw - r} ${hd}H${-hw + r}Q${-hw} ${hd} ${-hw} ${hd - r}V${-hd + r}Q${-hw} ${-hd} ${-hw + r} ${-hd}Z`;
};
const grooveOf = (k, w, d) => {
  if (k <= 2) return '';
  if (k <= 4) return `M${-w * .22} 0Q0 ${d * .12} ${w * .22} 0`;
  return `M${-w * .26} ${-d * .05}Q0 ${d * .08} ${w * .26} ${-d * .05}M0 ${-d * .26}Q${w * .06} 0 0 ${d * .26}`;
};
let chosen = null;
const arch = (upper) => {
  const cy = upper ? 166 : 234, g = el('g', {}, svg);
  const order = [5, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5], GAP = 2;
  const half = TW.reduce((a, b) => a + b, 0) + 6 * GAP;
  const T = tAt(half);
  // encía: banda gruesa en herradura
  const outer = [], inner = [], fillIn = [];
  for (let i = 0; i <= 60; i++){ const t = -T - .06 + (2 * T + .12) * i / 60, p = arcPt(upper, t, cy), n = arcN(upper, t);
    const o = 10 + 4 * Math.cos(t), ii = 24 + 16 * Math.min(1, Math.abs(t) / T);
    outer.push(`${(p.x + n.x * o).toFixed(1)} ${(p.y + n.y * o).toFixed(1)}`);
    inner.push(`${(p.x - n.x * ii).toFixed(1)} ${(p.y - n.y * ii).toFixed(1)}`);
    fillIn.push(`${(p.x - n.x * (ii - 6)).toFixed(1)} ${(p.y - n.y * (ii - 6)).toFixed(1)}`); }
  // paladar (arriba) o lengua (abajo), dentro del arco
  el('path', { d:'M' + fillIn.join('L') + 'Z', fill:upper ? '#F6B3BC' : 'url(#jTongue)', stroke:upper ? '#F6B3BC' : '#F589A0', 'stroke-width':10, 'stroke-linejoin':'round' }, g);
  if (upper) for (let i = 0; i < 3; i++) el('path', { d:`M${196 - i * 6} ${cy - 62 + i * 15}q24 -7 ${48 + i * 12} 0`, fill:'none', stroke:'#EC97A3', 'stroke-width':4, 'stroke-linecap':'round' }, g);
  else el('path', { d:`M220 ${cy + 30}V${cy + 78}`, stroke:'#EC7890', 'stroke-width':4, 'stroke-linecap':'round' }, g);
  el('path', { d:'M' + outer.join('L') + 'L' + inner.reverse().join('L') + 'Z', fill:'url(#jGum)', stroke:'#EE6F7E', 'stroke-width':8, 'stroke-linejoin':'round' }, g);
  let acc = -half;
  order.forEach((k, idx) => {
    const w = TW[k], d = TD[k], mid = acc + w / 2 + GAP / 2; acc += w + GAP;
    const t = Math.sign(mid) * tAt(Math.abs(mid)), p = arcPt(upper, t, cy), n = arcN(upper, t);
    const phi = Math.atan2(n.x, -n.y) * 180 / Math.PI;   // el lado -y local mira hacia afuera
    const c = { x:p.x - n.x * (d / 2 - 4), y:p.y - n.y * (d / 2 - 4) };
    const tg = el('g', { class:'t', tabindex:'0', role:'button', transform:`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${phi.toFixed(1)})` }, g);
    const side = idx < 6 ? 'derecho' : 'izquierdo', name = `${NAMES[k]} ${upper ? 'superior' : 'inferior'} ${side}`;
    tg.setAttribute('aria-label', name); tg.dataset.name = name;
    const inn = el('g', { class:'in' }, tg);
    el('path', { class:'body', d:shapeOf(k, w, d), filter:'url(#jShadow)' }, inn);
    const gr = grooveOf(k, w, d); if (gr) el('path', { class:'groove', d:gr }, inn);
    el('ellipse', { class:'shine', cx:-w * .16, cy:-d * .18, rx:w * .16, ry:d * .1 }, inn);
    const pick = () => {
      if (chosen) chosen.classList.remove('sel'); chosen = tg; tg.classList.add('sel');
      inn.animate([{ transform:'translateY(-4px) scale(1)' }, { transform:'translateY(-8px) scale(1.3, 1.2)' }, { transform:'translateY(-4px) scale(1)' }], { duration:480, easing:'cubic-bezier(.34,1.56,.64,1)' });
      picked.innerHTML = `Elegiste: <b>${name}</b>`; window.dispatchEvent(new Event('dulci:diente'));
    };
    tg.addEventListener('click', pick); tg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); pick(); } });
  });
  return g;
};
arch(true); arch(false);
for (const [x, txt, anchor] of [[8, 'Derecha', 'start'], [432, 'Izquierda', 'end']]) {
  const tx = el('text', { x, y:205, 'text-anchor':anchor, class:'side' }, svg); tx.textContent = txt; }
jaw.insertBefore(svg, picked);

/* Formulario y ticket */
const form = document.getElementById('bookForm'), err = document.getElementById('formErr'), ticket = document.getElementById('ticket');
const date = document.getElementById('f-date');
const today = new Date(); const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
date.min = iso(today); const def = new Date(today); def.setDate(def.getDate() + 3); date.value = iso(def);
let bonus = { off:0, caries:false, diez:false };
const paintBonus = () => {
  const parts = []; if (bonus.caries) parts.push('5% por sonrisa perfecta'); if (bonus.diez) parts.push('10% por diez dientes');
  document.getElementById('tk-bonus').textContent = parts.length ? `${bonus.off}% de descuento (${parts.join(' + ')})` : 'Juega arriba para ganar descuentos';
};
window.addEventListener('dulci:premio', e => { bonus = e.detail; paintBonus(); });
const fx = document.getElementById('bookFx');
const confetti = (x, y) => { const C = ['#F2705F', '#8F63E8', '#2FB892', '#F4C542', '#FF8FB1'];
  for (let i = 0; i < 56; i++){ const c = document.createElement('i'); c.className = 'confetti'; const a = -Math.PI / 2 + (Math.random() - .5) * 2.4, d = 120 + Math.random() * 280;
    c.style.cssText = `left:${x}px;top:${y}px;--c:${C[i % 5]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d + 300}px;--r:${(Math.random() - .5) * 900}deg;border-radius:${Math.random() < .5 ? '50%' : '4px'}`;
    fx.appendChild(c); setTimeout(() => c.remove(), 1700); } };
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('f-name').value.trim(), email = document.getElementById('f-email').value.trim();
  let msg = '';
  if (!name) msg = 'Escribe tu nombre para el ticket.';
  else if (!/^\S+@\S+\.\S+$/.test(email)) msg = 'Revisa el correo: le falta la @ o el dominio.';
  else if (!date.value) msg = 'Elige una fecha para tu cita.';
  else if (!chosen) msg = 'Toca en el modelo el diente que te preocupa.';
  err.textContent = msg;
  if (msg){ form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); return; }
  const d = new Date(date.value + 'T12:00:00');
  document.getElementById('tk-name').textContent = name;
  document.getElementById('tk-when').textContent = d.toLocaleDateString('es', { weekday:'long', day:'numeric', month:'long' }) + ', ' + document.getElementById('f-time').value;
  document.getElementById('tk-tooth').textContent = chosen.dataset.name;
  paintBonus();
  ticket.classList.remove('done'); void ticket.offsetWidth; ticket.classList.add('done');
  const pr = ticket.getBoundingClientRect(), br = fx.getBoundingClientRect();
  confetti(pr.left - br.left + pr.width - 70, pr.top - br.top + 50);
  form.querySelector('.submit').textContent = 'Reservado';
});
form.addEventListener('input', () => { err.textContent = ''; form.querySelector('.submit').textContent = 'Reservar mi cita'; });
window.addEventListener('dulci:diente', () => { err.textContent = ''; });

