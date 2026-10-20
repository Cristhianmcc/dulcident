/* Reserva: el diente se elige tocándolo en la boca 3D (el hero emite 'dulci:pick3d').
   El resto es un formulario de mentira que arma un ticket con los descuentos ganados jugando. */
import { face } from './reviews.js';

const $ = id => document.getElementById(id);
const form = $('bookForm'), err = $('formErr'), ticket = $('ticket'), picked = $('picked');
let tooth = null;

window.addEventListener('dulci:pick3d', e => {
  tooth = e.detail.name;
  picked.innerHTML = `Elegiste: <b>${tooth}</b>`;
  err.textContent = '';
});

// dolor: la carita cambia según el número
const pain = $('f-pain'), painOut = $('painOut'), painFace = $('painFace');
const paintPain = () => {
  const v = +pain.value; painOut.textContent = v;
  painFace.innerHTML = face(40, v <= 3 ? 'smile' : v <= 7 ? 'flat' : 'wow');
};
pain.addEventListener('input', paintPain); paintPain();

// chips de opción única
const choice = {};
form.querySelectorAll('.chips').forEach(group => {
  const name = group.dataset.name, opts = [...group.querySelectorAll('.opt')];
  opts.forEach(o => o.setAttribute('role', 'radio'));
  const set = o => { opts.forEach(x => { x.classList.toggle('on', x === o); x.setAttribute('aria-checked', String(x === o)); }); choice[name] = o.dataset.v; };
  set(opts.find(o => o.classList.contains('on')) || opts[0]);
  opts.forEach(o => o.addEventListener('click', () => set(o)));
});

// descuentos que llegan del juego
let bonus = { off:0, caries:false, diez:false };
const paintBonus = () => {
  const parts = []; if (bonus.caries) parts.push('5% por sonrisa perfecta'); if (bonus.diez) parts.push('10% por diez dientes');
  $('tk-bonus').textContent = parts.length ? `${bonus.off}% de descuento (${parts.join(' + ')})` : 'Juega arriba para ganar descuentos';
};
window.addEventListener('dulci:premio', e => { bonus = e.detail; paintBonus(); });

const fx = $('bookFx');
const confetti = (x, y) => { const C = ['#F2705F', '#8F63E8', '#2FB892', '#F4C542', '#FF8FB1'];
  for (let i = 0; i < 56; i++){ const c = document.createElement('i'); c.className = 'confetti'; const a = -Math.PI / 2 + (Math.random() - .5) * 2.4, d = 120 + Math.random() * 280;
    c.style.cssText = `left:${x}px;top:${y}px;--c:${C[i % 5]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d + 300}px;--r:${(Math.random() - .5) * 900}deg;border-radius:${Math.random() < .5 ? '50%' : '4px'}`;
    fx.appendChild(c); setTimeout(() => c.remove(), 1700); } };

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = $('f-name').value.trim();
  let msg = '';
  if (!tooth) msg = 'Primero toca en la boca el diente que te da lata.';
  else if (!name) msg = 'Escribe tu nombre para el ticket.';
  err.textContent = msg;
  if (msg){ form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); return; }
  $('tk-name').textContent = name;
  $('tk-tooth').textContent = tooth;
  $('tk-pain').textContent = `${pain.value} de 10`;
  $('tk-flavor').textContent = choice.flavor;
  $('tk-when').textContent = choice.when;
  paintBonus();
  ticket.hidden = false;
  ticket.classList.remove('done'); void ticket.offsetWidth; ticket.classList.add('done');
  const pr = ticket.getBoundingClientRect(), br = fx.getBoundingClientRect();
  confetti(pr.left - br.left + pr.width - 70, pr.top - br.top + 40);
  form.querySelector('.submit').textContent = 'Agendado';
});
form.addEventListener('input', () => { err.textContent = ''; form.querySelector('.submit').textContent = 'Agenda tu cita'; });
