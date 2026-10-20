/* Reserva: el diente se elige tocándolo en la boca 3D (el hero emite 'dulci:pick3d').
   El resto es un formulario de mentira que arma un ticket con los descuentos ganados jugando. */
import { face } from './reviews.js';

const $ = id => document.getElementById(id);
const form = $('bookForm'), err = $('formErr'), ticket = $('ticket'), printer = $('printer'), picked = $('picked');
const card = form.closest('.book-card');
const ACCENT = { Fresa:'#E8465C', Menta:'#2FB892', Uva:'#8F63E8' };
let tooth = null;

window.addEventListener('dulci:pick3d', e => {
  tooth = e.detail.name;
  picked.innerHTML = `Elegiste el <b>${tooth}</b>`;
  err.textContent = '';
});

// dolor: la carita cambia según el número
const pain = $('f-pain'), painOut = $('painOut'), painFace = $('painFace');
const paintPain = () => {
  const v = +pain.value; painOut.textContent = v;
  painFace.innerHTML = face(64, v <= 3 ? 'smile' : v <= 7 ? 'flat' : 'wow');
  document.getElementById('painWord').textContent = ['Nada', 'Casi nada', 'Poquito', 'Se nota', 'Molesta', 'Duele', 'Duele harto', 'Mucho', 'Muchísimo', '¡Auxilio!'][v - 1];
  pain.style.setProperty('--fill', `${(v - 1) / 9 * 100}%`);
};
pain.addEventListener('input', paintPain); paintPain();

// chips de opción única
const choice = {};
form.querySelectorAll('.chips').forEach(group => {
  const name = group.dataset.name, opts = [...group.querySelectorAll('.opt')];
  opts.forEach(o => o.setAttribute('role', 'radio'));
  const set = o => { opts.forEach(x => { x.classList.toggle('on', x === o); x.setAttribute('aria-checked', String(x === o)); }); choice[name] = o.dataset.v;
    // el sabor tiñe toda la tarjeta: números, slider y botón
    if (name === 'flavor'){ card.style.setProperty('--accent', ACCENT[o.dataset.v]); window.dispatchEvent(new CustomEvent('dulci:sabor', { detail:{ color:ACCENT[o.dataset.v] } })); } };
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
  $('tk-num').textContent = 'Ticket de cita #' + (1000 + Math.floor(Math.random() * 9000));
  printer.hidden = false; form.hidden = true;
  ticket.classList.remove('done'); ticket.style.animation = 'none'; void ticket.offsetWidth; ticket.style.animation = ''; ticket.classList.add('done');
  const pr = ticket.getBoundingClientRect(), br = fx.getBoundingClientRect();
  confetti(pr.left - br.left + pr.width - 70, pr.top - br.top + 40);
  form.querySelector('.submit').textContent = 'Agendado';
});
document.getElementById('againTicket').addEventListener('click', () => { printer.hidden = true; form.hidden = false; form.querySelector('.submit').textContent = 'Agenda tu cita'; });
form.addEventListener('input', () => { err.textContent = ''; form.querySelector('.submit').textContent = 'Agenda tu cita'; });
