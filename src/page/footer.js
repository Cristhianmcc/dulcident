/* Footer: letras de gomita que se aplastan */
const mega = document.getElementById('mega');
[...'Dulcident'].forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch; if (i === 1) s.className = 'u'; s.setAttribute('aria-hidden', 'true'); mega.appendChild(s); });
const squish = s => { s.classList.remove('squish'); void s.offsetWidth; s.classList.add('squish'); };
mega.querySelectorAll('span').forEach(s => s.addEventListener('mouseenter', () => squish(s)));
if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) mega.querySelectorAll('span').forEach((s, i) => setTimeout(() => squish(s), i * 70)); }), { threshold:.5 }).observe(mega);

/* Llamado final: gomitas que llueven detrás del texto */
const cta = document.getElementById('aprende');
if (cta && !matchMedia('(prefers-reduced-motion: reduce)').matches){
  const C = ['#F4C542', '#FF8FB1', '#2FB892', '#F2705F', '#FFFDF9', '#3FD6B0'];
  for (let i = 0; i < 26; i++){
    const c = document.createElement('i'); c.className = 'candy'; c.setAttribute('aria-hidden', 'true');
    const s = 16 + Math.random() * 26, ring = Math.random() < .3;
    c.style.cssText = `left:${Math.random() * 100}%;--s:${s}px;--c:${C[i % C.length]};--t:${7 + Math.random() * 8}s;--d:${-Math.random() * 12}s;--dx:${(Math.random() - .5) * 120}px;--rot:${(Math.random() - .5) * 720}deg;--r:${Math.random() < .4 ? '30%' : '50%'}` + (ring ? `;-webkit-mask:radial-gradient(circle, transparent 32%, #000 34%)` : '');
    cta.appendChild(c);
  }
}
