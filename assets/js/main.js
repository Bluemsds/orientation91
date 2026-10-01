// Le Web du Coin — interactions et effets au défilement
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Menu mobile
const tog = document.querySelector('.nav-toggle'), menu = document.getElementById('menu');
tog && tog.addEventListener('click', () => { const o = menu.classList.toggle('open'); tog.setAttribute('aria-expanded', o); document.body.classList.toggle('menu-open', o); });

// En-tête qui se réduit
const head = document.querySelector('.header');
const onScrollHead = () => head.classList.toggle('small', scrollY > 30);
addEventListener('scroll', onScrollHead, { passive: true }); onScrollHead();

// ===== Champ de pixels (fond animé, comme des poussières numériques) =====
document.querySelectorAll('canvas.pixels').forEach(cv => {
  const ctx = cv.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
  let W, H, pts = [], mx = 0, my = 0, vis = true;
  const cols = ['#C06BE0', '#8E44C9', '#E3C8F2', '#ffffff'];
  function size() {
    const r = cv.getBoundingClientRect(); W = cv.width = r.width * dpr; H = cv.height = r.height * dpr;
    const n = Math.round(r.width * r.height / (cv.dataset.density || 9000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, z: .3 + Math.random() * .9,
      s: (1.5 + Math.random() * 4.5) * dpr, c: cols[Math.random() * 4 | 0], a: .25 + Math.random() * .6, ph: Math.random() * 6.28 }));
  }
  size(); addEventListener('resize', size);
  addEventListener('pointermove', e => { mx = (e.clientX / innerWidth - .5); my = (e.clientY / innerHeight - .5); }, { passive: true });
  new IntersectionObserver(es => vis = es[0].isIntersecting).observe(cv);
  function loop(t) {
    if (vis) {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        if (!reduce) { p.y -= p.z * .25 * dpr; if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; } }
        const x = p.x + mx * 40 * p.z * dpr, y = p.y + my * 30 * p.z * dpr;
        ctx.globalAlpha = p.a * (.6 + .4 * Math.sin(t / 900 + p.ph));
        ctx.fillStyle = p.c; ctx.fillRect(x, y, p.s * p.z, p.s * p.z);
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
});

if (!reduce) {
  // ===== Apparitions au défilement =====
  document.documentElement.classList.add('js');
  document.querySelectorAll('.split').forEach(el => {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((t, j) => `<span class="ln"><span style="--i:${j}">${t}</span></span>`).join('');
  });
  const els = document.querySelectorAll('[data-r], .split');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  const go = () => els.forEach(el => io.observe(el));
  // Sur l'accueil, on attend la fin de l'intro avant de lancer les animations du haut de page
  if (document.getElementById('intro')) document.addEventListener('intro:done', go, { once: true }); else go();

  // ===== Parallaxe, liste qui s'allume, bandeau qui glisse =====
  const par = [...document.querySelectorAll('[data-p]')];
  const lines = [...document.querySelectorAll('.stack li')];
  const bands = [...document.querySelectorAll('.band-in')];
  let tick = false;
  function frame() {
    tick = false;
    const vh = innerHeight, k = innerWidth < 760 ? .5 : 1;
    par.forEach(el => {
      const r = el.getBoundingClientRect(); if (r.bottom < -300 || r.top > vh + 300) return;
      const d = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.p) * k;
      el.style.translate = `0 ${-d}px`;
      if (el.dataset.rot) el.style.rotate = `${parseFloat(el.dataset.rot) + d * .03}deg`;
    });
    lines.forEach(li => {
      const r = li.getBoundingClientRect(), c = r.top + r.height / 2;
      const on = Math.max(0, 1 - Math.abs(c - vh * .5) / (vh * .32));
      li.style.setProperty('--on', on.toFixed(3));
    });
    bands.forEach((b, i) => {
      const r = b.parentElement.getBoundingClientRect();
      b.style.transform = `translateX(${i % 2 ? (vh - r.top) * .3 - 700 : -(vh - r.top) * .3}px)`;
    });
  }
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', frame); frame();
}
