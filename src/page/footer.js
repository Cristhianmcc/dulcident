/* Footer: letras de gomita que se aplastan */
const mega = document.getElementById('mega');
[...'Dulcident'].forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch; if (i === 1) s.className = 'u'; s.setAttribute('aria-hidden', 'true'); mega.appendChild(s); });
const squish = s => { s.classList.remove('squish'); void s.offsetWidth; s.classList.add('squish'); };
mega.querySelectorAll('span').forEach(s => s.addEventListener('mouseenter', () => squish(s)));
if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) mega.querySelectorAll('span').forEach((s, i) => setTimeout(() => squish(s), i * 70)); }), { threshold:.5 }).observe(mega);
