// Intro animée « Du pavé au pixel » : l'emblème se pixellise, les pavés deviennent des pixels
// qui s'envolent pour écrire « Le web du coin ». Affichée une fois par visite, passable.
(() => {
  const box = document.getElementById('intro');
  if (!box) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = false;
  try { seen = sessionStorage.getItem('lwdc-intro') === '1'; } catch (e) {}
  const done = () => {
    if (box.classList.contains('out')) return;
    box.classList.add('out');
    document.documentElement.classList.remove('intro-on');
    document.dispatchEvent(new Event('intro:done'));
    try { sessionStorage.setItem('lwdc-intro', '1'); } catch (e) {}
    setTimeout(() => box.remove(), 1100);
  };
  if (reduce || seen) { box.remove(); document.documentElement.classList.remove('intro-on'); document.dispatchEvent(new Event('intro:done')); return; }
  box.querySelector('.intro-skip').addEventListener('click', done);
  addEventListener('keydown', e => { if (e.key === 'Escape') done(); }, { once: true });

  const cv = box.querySelector('canvas'), ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W, H;
  const img = new Image();
  img.src = '__EMB__';
  const font = new FontFace('Fredoka', 'url(assets/fonts/fredoka-600.woff2)', { weight: '600' });

  Promise.all([img.decode(), font.load().then(f => document.fonts.add(f)).catch(() => {})]).then(start).catch(done);

  function start() {
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    // 1. Emblème centré
    const ew = Math.min(W * .62, 560 * dpr), eh = ew * img.height / img.width;
    const ex = (W - ew) / 2, ey = H * .44 - eh / 2;
    const off = document.createElement('canvas'); off.width = ew; off.height = eh;
    const oc = off.getContext('2d'); oc.drawImage(img, 0, 0, ew, eh);
    const c = Math.max(7 * dpr, Math.round(ew / 36));
    const data = oc.getImageData(0, 0, ew, eh).data;
    const tiles = [];
    for (let y = 0; y < eh; y += c) for (let x = 0; x < ew; x += c) {
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let yy = y; yy < Math.min(y + c, eh); yy += 2) for (let xx = x; xx < Math.min(x + c, ew); xx += 2) {
        const i = ((yy | 0) * (ew | 0) + (xx | 0)) * 4; r += data[i]; g += data[i + 1]; b += data[i + 2]; a += data[i + 3]; n++;
      }
      if (a / n > 110) tiles.push({ sx: ex + x, sy: ey + y, col: [r / n, g / n, b / n], u: x / ew });
    }
    // 2. Cibles : le texte « Le web du coin » écrit en pixels
    const t = document.createElement('canvas'); t.width = W; t.height = H;
    const tc = t.getContext('2d');
    // Sur téléphone, le nom tient sur deux lignes pour rester lisible
    const lines = innerWidth < 600 ? ['Le web', 'du coin'] : ['Le web du coin'];
    let fs = Math.min(W * (lines.length > 1 ? .2 : .12), 150 * dpr);
    tc.font = `600 ${fs}px Fredoka, sans-serif`;
    const tw = Math.max(...lines.map(l => tc.measureText(l).width));
    if (tw > W * .88) { fs *= W * .88 / tw; tc.font = `600 ${fs}px Fredoka, sans-serif`; }
    tc.textAlign = 'center'; tc.textBaseline = 'middle'; tc.fillStyle = '#fff';
    lines.forEach((l, i) => tc.fillText(l, W / 2, H * .46 + (i - (lines.length - 1) / 2) * fs * 1.05));
    const c2 = Math.max(4 * dpr, Math.round(fs / 11));
    const td = tc.getImageData(0, 0, W, H).data, targets = [];
    for (let y = 0; y < H; y += c2) for (let x = 0; x < W; x += c2) if (td[((y | 0) * W + (x | 0)) * 4 + 3] > 128) targets.push({ x, y });
    // Couleurs cibles : dégradé violet → lilas de gauche à droite
    const minX = Math.min(...targets.map(p => p.x)), maxX = Math.max(...targets.map(p => p.x));
    const A = [142, 68, 201], B = [227, 200, 242];
    targets.forEach(p => { const k = (p.x - minX) / (maxX - minX || 1); p.col = A.map((v, i) => v + (B[i] - v) * k); });
    // Associer tuiles et cibles (balayage de gauche à droite pour les deux)
    tiles.sort((a, b) => a.sx - b.sx || a.sy - b.sy); targets.sort((a, b) => a.x - b.x || a.y - b.y);
    const parts = [];
    const N = Math.max(tiles.length, targets.length);
    for (let i = 0; i < N; i++) {
      const s = tiles[Math.floor(i * tiles.length / N)], tg = targets[Math.floor(i * targets.length / N)];
      const dup = i > 0 && tiles.length < N && Math.floor(i * tiles.length / N) === Math.floor((i - 1) * tiles.length / N);
      parts.push({ s, tg, dup, d: s.u * 700 + Math.random() * 260, ox: (Math.random() - .5) * 260 * dpr, oy: -Math.random() * 220 * dpr });
    }
    // Pixels en trop : ils s'envolent comme des étincelles
    const slogan = box.querySelector('.intro-slogan');
    slogan.style.top = (H * .46 / dpr + fs / dpr * (.62 + (lines.length - 1) * .55)) + 'px';

    const T0 = performance.now();
    const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const mix = (a, b, k) => a + (b - a) * k;
    let sloganOn = false;

    function draw(now) {
      if (box.classList.contains('out') && now - T0 > 200) { /* on laisse finir le fondu */ }
      const t = now - T0;
      ctx.clearRect(0, 0, W, H);
      // Phase 1 : apparition de l'emblème (0 → 900 ms)
      if (t < 1500) {
        const a = Math.min(1, t / 700), sc = .94 + .06 * ease(Math.min(1, t / 900));
        const pix = t > 1000 ? Math.min(1, (t - 1000) / 450) : 0; // l'image cède la place aux tuiles
        ctx.globalAlpha = a * (1 - pix);
        ctx.save(); ctx.translate(W / 2, ey + eh / 2); ctx.scale(sc, sc);
        ctx.drawImage(img, -ew / 2, -eh / 2, ew, eh); ctx.restore();
        ctx.globalAlpha = pix;
        if (pix > 0) for (const p of tiles) { ctx.fillStyle = `rgb(${p.col})`; ctx.fillRect(p.sx, p.sy, c - dpr, c - dpr); }
        ctx.globalAlpha = 1;
      } else {
        // Phase 2 : les pavés deviennent des pixels et volent vers le texte (1,5 s → 3,6 s)
        for (const p of parts) {
          const k = Math.min(1, Math.max(0, (t - 1500 - p.d) / 1150)), e = ease(k);
          const x = mix(p.s.sx, p.tg.x, e) + Math.sin(e * Math.PI) * p.ox;
          const y = mix(p.s.sy, p.tg.y, e) + Math.sin(e * Math.PI) * p.oy;
          const sz = mix(c - dpr, c2 - dpr * .6, e);
          const col = p.s.col.map((v, i) => mix(v, p.tg.col[i], Math.min(1, e * 1.4)) | 0);
          ctx.globalAlpha = p.dup ? Math.min(1, k * 3) : 1;
          // scintillement une fois en place
          if (k >= 1) ctx.globalAlpha = .82 + .18 * Math.sin(now / 160 + p.tg.x * .05);
          ctx.fillStyle = `rgb(${col})`;
          ctx.fillRect(x, y, sz, sz);
        }
        ctx.globalAlpha = 1;
        if (!sloganOn && t > 3500) { sloganOn = true; slogan.classList.add('on'); }
        if (t > 5000) done();
      }
      if (box.isConnected) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
})();
