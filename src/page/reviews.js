/* Reseñas: caritas de diente y tarjetas */
const face = (s, mood = 'smile') => `<svg width="${s}" height="${s}" viewBox="0 0 40 40" aria-hidden="true">
  <path d="M10 8.5c4-3.6 7.5.8 10 .8s6-4.4 10-.8c4.2 3.8 1.6 12.4-.6 17.6-1.2 3-2 8.9-4.3 8.9-2.1 0-2-6.3-5.1-6.3s-3 6.3-5.1 6.3c-2.3 0-3.1-5.9-4.3-8.9C8.4 20.9 5.8 12.3 10 8.5z" fill="#FFF7EA" stroke="#E7D7BE" stroke-width="1.2"/>
  <circle cx="15.5" cy="16.5" r="2.6" fill="#16181A"/><circle cx="24.5" cy="16.5" r="2.6" fill="#16181A"/>
  <circle cx="16.3" cy="15.6" r=".8" fill="#fff"/><circle cx="25.3" cy="15.6" r=".8" fill="#fff"/>
  ${mood === 'smile' ? '<path d="M16.5 21.5q3.5 3.4 7 0" fill="none" stroke="#16181A" stroke-width="1.8" stroke-linecap="round"/>'
    : mood === 'wow' ? '<ellipse cx="20" cy="22.6" rx="2" ry="2.4" fill="#16181A"/>'
    : '<path d="M16.5 22h7" stroke="#16181A" stroke-width="1.8" stroke-linecap="round"/>'}
  ${mood === 'glasses' ? '<g fill="none" stroke="#2B3438" stroke-width="1.4"><circle cx="15.5" cy="16.5" r="4.3"/><circle cx="24.5" cy="16.5" r="4.3"/><path d="M19.8 16.3h.4"/></g><path d="M16.5 21.5q3.5 3.4 7 0" fill="none" stroke="#16181A" stroke-width="1.8" stroke-linecap="round"/>' : ''}
</svg>`;
const tongue = s => `<svg width="${s}" height="${s}" viewBox="0 0 40 40" aria-hidden="true"><path d="M9 12c0-4 22-4 22 0v10c0 9-5 13-11 13S9 31 9 22z" fill="#FF8FA4" stroke="#E8657E" stroke-width="1.2"/><path d="M20 20v10" stroke="#E8657E" stroke-width="1.5" stroke-linecap="round"/><circle cx="15.5" cy="15" r="2.4" fill="#16181A"/><circle cx="24.5" cy="15" r="2.4" fill="#16181A"/><path d="M17 20.5q3 2.8 6 0" fill="none" stroke="#16181A" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const REVIEWS = [
  { who:'Muela del juicio', where:'Arriba a la izquierda', when:'Hace 2 días', c:'#FFB3C6', mood:'glasses',
    text:'Llegué temblando y salí volando. Literalmente: Pinchy me lanzó hasta el otro lado de la mesa. Diez de diez.', shot:'#FFD9E2' },
  { who:'Incisivo central', where:'Fila de arriba', when:'Hace 5 días', c:'#B8F0DF', mood:'smile',
    text:'El empaste de Dr. Drill brilla tanto que ahora sonrío solo para presumirlo.' },
  { who:'Canino inferior', where:'Abajo a la derecha', when:'Hace 1 semana', c:'#FBE3A0', mood:'wow',
    text:'Bristles me cepilló cuatro minutos y además me cantó. No pedí lo segundo, pero lo agradezco.', shot:'#FFF1C9' },
  { who:'Primer molar', where:'Abajo a la izquierda', when:'Hace 2 semanas', c:'#D9C8FF', mood:'smile',
    text:'Me encontraron una caries que ni sabía que tenía. El taladro suena feo, pero el ding del final lo compensa.' },
  { who:'Segundo premolar', where:'Arriba a la derecha', when:'Hace 3 semanas', c:'#FFC9B8', mood:'flat',
    text:'Flossy entró por un hueco donde nadie había entrado jamás. Me siento otro diente.' },
  { who:'La lengua', where:'Paciente invitada', when:'Hace 1 mes', c:'#FFD3DD', tongue:true,
    text:'No soy diente, pero me colé. Atención excelente, aunque el jarabe rojo me asustó un poco.', shot:'#FFE6EC' },
];
const rv = document.getElementById('reviews'), faces = document.getElementById('faces');
REVIEWS.forEach((r, i) => {
  const av = r.tongue ? tongue(34) : face(34, r.mood);
  if (i < 4) faces.insertAdjacentHTML('beforeend', `<span class="av" style="--c:${r.c}">${av}</span>`);
  rv.insertAdjacentHTML('beforeend', `<article class="review">
    <header><span class="av" style="--c:${r.c}">${av}</span><div><strong>${r.who}</strong><span>${r.where} · ${r.when}</span></div></header>
    <div class="stars" aria-label="5 de 5 estrellas">★★★★★</div>
    <blockquote>${r.text}</blockquote>
    ${r.shot ? `<div class="shot" style="--c:${r.shot}">${r.tongue ? tongue(92) : face(92, r.mood)}</div>` : ''}
  </article>`);
});


export { face, tongue };
