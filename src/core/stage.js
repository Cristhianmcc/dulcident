/* El escenario: cada sección con data-pose dice dónde va la boca.
   Mientras una sección llena la pantalla, la boca se queda en su pose;
   entre dos secciones se mezcla de una a otra según el scroll.
   x: posición horizontal en pantalla (0 a 1) · dy: subir/bajar (unidades 3D) · s: escala
   rx/ry: inclinación y giro · wm: logo gigante · play: se puede jugar · book: modo selector
   xray: corte de rayos X (media boca en malla de alambre) */
export const POSES = {
  // la boca siempre mira casi de frente: solo cambia de lugar y de tamaño
  hero:    { x:.53, dy:-.35, s:1.1,  rx:0,   ry:-.2,  wm:1, play:1, book:0, xray:0 },
  team:    { x:.5,  dy:.6,   s:.7,   rx:0,   ry:0,    wm:0, play:0, book:0, xray:0 },
  reviews: { x:.7,  dy:-.1,  s:1.0,  rx:.04, ry:-.22, wm:0, play:0, book:0, xray:0 },
  how:     { x:.5,  dy:.05,  s:.85,  rx:0,   ry:0,    wm:0, play:0, book:0, xray:1 },
  book:    { x:.28, dy:-.1,  s:.85,  rx:0,   ry:0,    wm:0, play:0, book:1, xray:0 },
  away:    { x:.5,  dy:7.5,  s:.6,   rx:0,   ry:0,    wm:0, play:0, book:0, xray:0 },
};
const KEYS = Object.keys(POSES.hero);

export const pose = { ...POSES.hero, index:0 };
let marks = [];   // { start, end, p } en píxeles de documento

export function measure(){
  const vh = innerHeight;
  marks = [...document.querySelectorAll('[data-pose]')].map(el => {
    const r = el.getBoundingClientRect(), top = r.top + scrollY;
    return { start:top, end:Math.max(top, top + r.height - vh), p:POSES[el.dataset.pose] || POSES.away, el };
  });
}
addEventListener('resize', measure);

const smooth = k => k * k * (3 - 2 * k);

/* Pose objetivo para el scroll actual */
export function targetPose(out = {}){
  if (!marks.length) measure();
  const y = scrollY;
  let a = marks[0], b = marks[0], k = 0, idx = 0;
  for (let i = 0; i < marks.length; i++){
    const m = marks[i];
    if (y < m.start){ // entre la anterior y esta
      if (i === 0){ a = b = m; break; }
      a = marks[i - 1]; b = m; idx = i - 1;
      k = smooth(Math.min(1, Math.max(0, (y - a.end) / Math.max(1, b.start - a.end))));
      break;
    }
    a = b = m; idx = i; k = 0;
    if (y <= m.end) break;
  }
  for (const key of KEYS) out[key] = a.p[key] + (b.p[key] - a.p[key]) * k;
  out.index = k > .5 ? idx + 1 : idx;
  return out;
}

export const sections = () => marks.map(m => m.el);
