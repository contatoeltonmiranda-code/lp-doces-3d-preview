/* Granulê Brigaderia: cenas por rolagem. Sem motion (prefers-reduced-motion) tudo fica no estado final estático. */
(() => {
  const root = document.documentElement;
  const motion = root.classList.contains('motion') && window.gsap && window.ScrollTrigger;
  if (!motion) root.classList.remove('motion');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const small = matchMedia('(max-width: 640px)').matches;
  const IMG = 'assets/img/';

  /* gerador deterministico: mesma cena em todo carregamento */
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- campos de partículas ---------- */
  const DEPTH = [ // fundo, meio, frente
    { blur: 3, op: .9, k: .35 },
    { blur: 0, op: 1, k: .7 },
    { blur: 7, op: 1, k: 1.25 },
  ];
  function particle(field, o) {
    const p = document.createElement('div');
    p.className = 'p d' + o.d;
    p.style.cssText = `left:${o.x}%;top:${o.y}%;width:${o.w}${o.unit || 'vw'};z-index:${o.d}`;
    const m = document.createElement('div'); m.className = 'm';
    const img = new Image(); img.src = o.src; img.alt = ''; img.decoding = 'async'; img.loading = o.lazy === false ? 'eager' : 'lazy';
    img.style.setProperty('--r', (o.r || 0) + 'deg');
    img.style.setProperty('--d', (4.5 + (o.seed || 0) * 3).toFixed(2) + 's');
    img.style.setProperty('--dl', (-(o.seed || 0) * 5).toFixed(2) + 's');
    const dp = DEPTH[o.d];
    if (dp.blur) img.style.filter = `blur(${dp.blur}px)`;
    img.style.opacity = dp.op;
    m.appendChild(img); p.appendChild(m); field.appendChild(p);
    p._d = o.d; return p;
  }
  function spread(name, specs, seed, avoid) {
    const field = $(`[data-field="${name}"]`); if (!field) return [];
    const r = rng(seed), out = [];
    specs.forEach((sp) => {
      for (let i = 0; i < sp.n; i++) {
        let x, y, tries = 0;
        do { x = sp.x0 + r() * (sp.x1 - sp.x0); y = sp.y0 + r() * (sp.y1 - sp.y0); tries++; }
        while (avoid && sp.d > 0 && x > avoid[0] && x < avoid[1] && y > avoid[2] && y < avoid[3] && tries < 30);
        const w = sp.w0 + r() * (sp.w1 - sp.w0);
        out.push(particle(field, { src: sp.src(i, r), x, y, w, d: sp.d, r: (r() * 360) | 0, seed: r(), unit: sp.unit, lazy: sp.lazy }));
      }
    });
    return out;
  }
  const brig = (i) => `${IMG}brig-0${(i % 6) + 1}.webp`;
  const gran = (i, r) => `${IMG}gran-${pad(1 + ((r() * 21) | 0))}.webp`;
  const sc = small ? .55 : 1;

  const heroP = spread('hero', [
    { n: Math.round(4 * sc), d: 0, src: brig, x0: 2, x1: 96, y0: 4, y1: 70, w0: 3, w1: 4.5, lazy: false },
    { n: Math.round(6 * sc), d: 1, src: brig, x0: 0, x1: 94, y0: 8, y1: 74, w0: small ? 11 : 6, w1: small ? 15 : 8.5, lazy: false },
    { n: Math.round(2 * sc), d: 2, src: brig, x0: -6, x1: 4, y0: 10, y1: 80, w0: small ? 22 : 12, w1: small ? 28 : 16, lazy: false },
    { n: Math.round(2 * sc), d: 2, src: brig, x0: 88, x1: 96, y0: 0, y1: 70, w0: small ? 22 : 12, w1: small ? 28 : 16, lazy: false },
    { n: Math.round(14 * sc), d: 1, src: gran, x0: 0, x1: 98, y0: 0, y1: 78, w0: small ? 4 : 2, w1: small ? 6 : 3.2, lazy: false },
    { n: Math.round(5 * sc), d: 2, src: gran, x0: 0, x1: 98, y0: 0, y1: 85, w0: small ? 9 : 5, w1: small ? 12 : 7, lazy: false },
  ], 7, [10, 90, 6, 76]);

  const histP = spread('historia', [
    { n: small ? 5 : 8, d: 1, src: (i) => `${IMG}shard-${pad((i % 10) + 1)}.webp`, x0: 4, x1: 92, y0: -30, y1: -8, w0: small ? 10 : 5, w1: small ? 15 : 8.5 },
    { n: small ? 3 : 5, d: 2, src: (i) => `${IMG}shard-${pad(((i + 5) % 10) + 1)}.webp`, x0: 0, x1: 95, y0: -40, y1: -10, w0: small ? 16 : 9, w1: small ? 20 : 12 },
  ], 21);
  const favas = [];
  const hf = $('[data-field="historia"]');
  if (hf) {
    favas.push(particle(hf, { src: `${IMG}fava-1.webp`, x: small ? -6 : 3, y: small ? 70 : 62, w: small ? 22 : 10, d: 1, r: 20, seed: .3 }));
    favas.push(particle(hf, { src: `${IMG}fava-2.webp`, x: small ? 80 : 87, y: small ? 12 : 14, w: small ? 20 : 9, d: 1, r: -30, seed: .7 }));
  }

  const provaP = spread('prova', [
    { n: small ? 4 : 7, d: 1, src: (i) => `${IMG}form-0${(i % 7) + 1}.webp`, x0: 0, x1: 92, y0: -25, y1: 10, w0: small ? 16 : 6, w1: small ? 22 : 9 },
  ], 33);

  spread('faq', [
    { n: small ? 2 : 4, d: 1, src: gran, x0: 0, x1: 6, y0: 10, y1: 90, w0: small ? 5 : 2.2, w1: small ? 7 : 3 },
    { n: small ? 2 : 4, d: 1, src: gran, x0: 93, x1: 98, y0: 10, y1: 90, w0: small ? 5 : 2.2, w1: small ? 7 : 3 },
    { n: 1, d: 1, src: brig, x0: 90, x1: 94, y0: 4, y1: 12, w0: small ? 12 : 5, w1: small ? 14 : 6 },
  ], 41);

  // CTA final: brigadeiros pousam num anel em volta do botão
  const finalField = $('[data-field="final"]'), finalP = [];
  if (finalField) {
    const r = rng(55), n = small ? 7 : 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r() * .4;
      const rx = small ? 50 : 42, ry = small ? 46 : 38;
      const x = 50 + Math.cos(a) * rx * (.8 + r() * .35) - 4, y = 50 + Math.sin(a) * ry * (.8 + r() * .3) - 4;
      finalP.push(particle(finalField, { src: brig(i), x, y, w: small ? 13 + r() * 6 : 5.5 + r() * 3.5, d: i % 5 === 0 ? 2 : 1, r: (r() * 360) | 0, seed: r() }));
    }
    spread('final', [{ n: small ? 4 : 7, d: 2, src: gran, x0: 0, x1: 96, y0: 0, y1: 95, w0: small ? 8 : 4, w1: small ? 11 : 6 }], 56);
  }

  /* ---------- trilha de granulado na faixa ---------- */
  const streak = $('.streak'), streakItems = [];
  if (streak) {
    const r = rng(77), n = small ? 8 : 16;
    for (let i = 0; i < n; i++) {
      const img = new Image(); img.src = gran(i, r); img.alt = ''; img.loading = 'lazy';
      const d = r(); const w = 20 + d * 70;
      img.style.width = w + 'px'; if (d > .75) img.style.filter = 'blur(4px)'; if (d < .25) img.style.filter = 'blur(2px)';
      streak.appendChild(img);
      streakItems.push({ el: img, x: r() * innerWidth, y: r() * innerHeight * .9, s: .5 + d * 1.6, rot: r() * 360 });
    }
    streakItems.forEach((o) => { o.el.style.transform = `translate3d(${o.x}px,${o.y}px,0) rotate(${o.rot}deg)`; });
  }

  /* ---------- etapa 4 em canvas: granulado grudando na bolinha ---------- */
  const canvas = $('.roll'), ctx = canvas && canvas.getContext('2d');
  const load = (src) => { const i = new Image(); i.src = src; return i; };
  const ball = load(IMG + 'ball-plain.webp'), done = load(IMG + 'fl-tradicional.webp');
  const sprites = Array.from({ length: 21 }, (_, i) => load(`${IMG}gran-${pad(i + 1)}.webp`));
  const sprinkles = (() => { const r = rng(99), n = small ? 110 : 170, out = [];
    for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * .93;
      out.push({ tx: Math.cos(a) * rr, ty: Math.sin(a) * rr, rot: r() * Math.PI, sp: (r() * 21) | 0, t0: .12 + r() * .6, dx: (r() - .5) * .5, len: .2 + r() * .1 }); }
    return out; })();
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  let lastQ = -1;
  function drawRoll(q) {
    if (!ctx) return; q = Math.max(0, Math.min(1, q));
    const W = canvas.clientWidth, H = canvas.clientHeight; if (!W) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(W * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const R = W * .24, cx = W / 2, cy0 = H * .48;
    const fall = easeOut(Math.min(1, q / .22)), cy = -R + (cy0 + R) * fall;
    const swap = Math.max(0, Math.min(1, (q - .8) / .16));
    // sombra
    ctx.save(); ctx.globalAlpha = .35 * fall * (1 - swap); ctx.fillStyle = '#120804';
    ctx.beginPath(); ctx.ellipse(cx, cy0 + R * 1.08, R * .9, R * .16, 0, 0, Math.PI * 2); ctx.filter = 'blur(8px)'; ctx.fill(); ctx.restore();
    if (swap < 1) {
      ctx.globalAlpha = 1 - swap;
      if (ball.complete) ctx.drawImage(ball, cx - R * 1.02, cy - R * 1.02, R * 2.04, R * 2.04);
      for (const s of sprinkles) {
        const img = sprites[s.sp]; if (!img.complete || !img.naturalWidth) continue;
        const arrive = s.t0 + .1; if (q < s.t0) continue;
        const L = R * s.len, k = img.naturalHeight / img.naturalWidth;
        let x = cx + s.tx * R, y = cy + s.ty * R, rot = s.rot;
        if (q < arrive) { const u = (q - s.t0) / .1; y = -L + (y + L) * u; x += s.dx * R * (1 - u); rot += (1 - u) * 3; }
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        const w = k > 1 ? L / k : L, h = k > 1 ? L : L * k; ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore();
      }
    }
    if (swap > 0 && done.complete) {
      ctx.globalAlpha = swap; const dw = R * 2 / .74, dh = dw * (done.naturalHeight / done.naturalWidth || .9);
      ctx.drawImage(done, cx - dw / 2, cy0 - dh * .37 + (1 - swap) * H * .06, dw, dh);
    }
    ctx.globalAlpha = 1;
  }
  [ball, done, ...sprites].forEach((i) => i.addEventListener('load', () => { if (lastQ >= 0) drawRoll(lastQ); }));

  /* ---------- sem motion: estados finais estáticos ---------- */
  if (!motion) {
    finalP.forEach((p) => (p.style.opacity = 1));
    return;
  }

  /* ---------- motion ---------- */
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .11, smoothWheel: true }); window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault();
    lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  const vh = () => innerHeight;
  const depthY = (p, amt) => -(DEPTH[p._d].k) * amt;

  // 1. HERO: tampa sai, camadas em profundidade
  const hero = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: .6 } });
  hero.to('.hero-lid', { yPercent: -170, xPercent: 55, rotate: 32, opacity: 0, ease: 'power1.in', duration: .75 }, 0)
      .to('.hero-box', { scale: 1.08, yPercent: -4, ease: 'none', duration: 1 }, 0)
      .to('.hero-title .l1', { yPercent: -18, ease: 'none', duration: 1 }, 0)
      .to('.hero-title .l3', { yPercent: 14, ease: 'none', duration: 1 }, 0);
  heroP.forEach((p) => hero.to(p, { y: () => depthY(p, vh() * .5), ease: 'none', duration: 1 }, 0));
  // parallax pelo mouse
  if (matchMedia('(pointer: fine)').matches) {
    const tilt = $('.tilt'), movers = $$('.hero .field .m').map((m) => ({ m, k: DEPTH[m.parentNode._d].k,
      x: gsap.quickTo(m, 'x', { duration: .9, ease: 'power3' }), y: gsap.quickTo(m, 'y', { duration: .9, ease: 'power3' }) }));
    const rx = gsap.quickTo(tilt, 'rotationX', { duration: 1, ease: 'power3' }), ry = gsap.quickTo(tilt, 'rotationY', { duration: 1, ease: 'power3' });
    const bx = gsap.quickTo('.hero-obj', 'x', { duration: 1.1, ease: 'power3' });
    $('.hero').addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      rx(ny * -5); ry(nx * 7); bx(nx * 18);
      movers.forEach((o) => { o.x(nx * 46 * o.k); o.y(ny * 34 * o.k); });
    });
  }

  // 2. HISTÓRIA: barra quebra, lascas caem
  const hist = gsap.timeline({ scrollTrigger: { trigger: '.historia .pin', start: 'top top', end: 'bottom bottom', scrub: .6 } });
  hist.fromTo('.bar-a', { xPercent: 0, rotate: 0 }, { xPercent: small ? -72 : -96, yPercent: 18, rotate: -16, ease: 'power2.out', duration: .62 }, 0)
      .fromTo('.bar-b', { xPercent: 0, rotate: 0 }, { xPercent: small ? 72 : 96, yPercent: -4, rotate: 14, ease: 'power2.out', duration: .62 }, 0)
      .fromTo('.hist-title', { scale: .94 }, { scale: 1, ease: 'none', duration: 1 }, 0);
  histP.forEach((p, i) => hist.fromTo(p, { y: 0, rotate: 0 }, { y: () => vh() * (1.35 + DEPTH[p._d].k * .25), rotate: (i % 2 ? 1 : -1) * 160, ease: 'none', duration: .9 }, (i % 5) * .03));
  favas.forEach((p, i) => hist.to(p, { rotate: i ? -50 : 60, y: -vh() * .12, ease: 'none', duration: 1 }, 0));

  // 3. PROCESSO: 4 etapas numa cena fixa
  const proc = $('.processo'), steps = $$('.step'), hud = $('.hud-n'), vis = $('.proc-visual');
  const shardsBox = $('.drop-shards');
  for (let i = 0; i < 5; i++) { const im = new Image(); im.src = `${IMG}shard-${pad(i + 2)}.webp`; im.alt = ''; im.style.left = (22 + i * 12) + '%'; shardsBox.appendChild(im); }
  const spoon = $('.spoon'), steam = $('.steam');
  gsap.set(spoon, { opacity: 0 }); gsap.set(steam, { opacity: 0 });
  const stir = { a: 0 };
  const pt = gsap.timeline({ defaults: { ease: 'none' } });
  $$('img', shardsBox).forEach((im, i) => pt.fromTo(im, { y: 0, rotate: i * 40, opacity: 1, scale: 1 },
    { y: () => vis.clientHeight * (.72 + (i % 2) * .06), rotate: i * 40 + 220, scale: .55, opacity: 0, ease: 'power1.in', duration: .5 }, .1 + i * .12));
  pt.to(spoon, { opacity: 1, duration: .12 }, 1)
    .to(steam, { opacity: 1, duration: .15 }, 1)
    .to(stir, { a: Math.PI * 6, duration: 1, onUpdate: () => {
      const R = vis.clientWidth * .16; gsap.set(spoon, { x: Math.cos(stir.a) * R, y: Math.sin(stir.a) * R * .35, rotate: Math.sin(stir.a) * 9 }); } }, 1)
    .to([spoon, steam], { opacity: 0, duration: .12 }, 1.95)
    .to('.pv-pan', { yPercent: 70, opacity: 0, duration: .3, ease: 'power2.in' }, 2)
    .fromTo('.pv-bowl', { yPercent: -70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .85, ease: 'power1.out' }, 2.1)
    .fromTo(proc, { backgroundColor: '#E9A23B' }, { backgroundColor: '#3B1F14', duration: .8 }, 2.15)
    .fromTo(proc, { '--fg': '#3B1F14' }, { '--fg': '#F6EBDD', duration: .1 }, 2.5)
    .to('.pv-bowl', { yPercent: 60, opacity: 0, duration: .2, ease: 'power2.in' }, 3)
    .to('.pv-roll', { opacity: 1, duration: .1 }, 3.05)
    .to({}, { duration: .05 }, 3.95);
  ScrollTrigger.create({ trigger: proc, start: 'top top', end: 'bottom bottom', scrub: .5, animation: pt,
    onUpdate: (st) => {
      const p = st.progress, idx = Math.min(3, Math.floor(p * 4 + .0001));
      steps.forEach((s, i) => s.classList.toggle('on', i === idx));
      if (hud.textContent !== String(idx + 1)) hud.textContent = idx + 1;
      const q = (p * 4 - 3) / .92; lastQ = q; if (p > .7) drawRoll(q);
    } });
  steps[0].classList.add('on');
  drawRoll(0);

  // 4. FAIXA: borrão proporcional à velocidade + granulado atravessando
  const fTitle = $('[data-blur]'); let blur = 0, faixaOn = false;
  ScrollTrigger.create({ trigger: '.faixa', start: 'top bottom', end: 'bottom top', onToggle: (st) => (faixaOn = st.isActive) });
  gsap.ticker.add((t, dt) => {
    if (!faixaOn) return;
    const v = lenis ? Math.abs(lenis.velocity) : 0;
    blur += (Math.min(14, v * .45) - blur) * .18;
    fTitle.style.filter = blur > .2 ? `blur(${blur.toFixed(2)}px)` : 'none';
    const W = innerWidth + 120, step = (dt || 16) / 16;
    streakItems.forEach((o) => { o.x -= (1.2 + v * 1.1) * o.s * step; if (o.x < -120) o.x += W + 120;
      o.el.style.transform = `translate3d(${o.x}px,${o.y}px,0) rotate(${o.rot}deg)`; });
  });

  // 5. SABORES: entrada em cascata
  gsap.set('.card', { y: 60, opacity: 0 });
  ScrollTrigger.batch('.card', { start: 'top 88%', once: true,
    onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: .1, overwrite: true }) });

  // 6. PROVA: forminhas vazias caindo
  provaP.forEach((p, i) => gsap.fromTo(p, { y: 0, rotate: 0 }, { y: () => $('.prova').offsetHeight * (1 + (i % 3) * .12), rotate: (i % 2 ? 1 : -1) * 200, ease: 'none',
    scrollTrigger: { trigger: '.prova', start: 'top bottom', end: 'bottom top', scrub: .8 } }));
  gsap.from('.note', { y: 50, opacity: 0, duration: .9, ease: 'power3.out', stagger: .12, scrollTrigger: { trigger: '.notes', start: 'top 85%', once: true } });

  // 7. KITS: caixa CSS 3D gira 360° pela rolagem, doces entram um a um
  const cells = $('.cells'); for (let i = 0; i < 25; i++) cells.appendChild(document.createElement('i'));
  const order = Array.from({ length: 25 }, (_, i) => i).sort((a, b) => rng(5 + a)() - rng(5 + b)());
  const drops = $('.drops'); const dropEls = [];
  for (let i = 0; i < (small ? 7 : 11); i++) { const im = new Image(); im.src = brig(i); im.alt = ''; im.loading = 'lazy'; drops.appendChild(im); dropEls.push(im); }
  gsap.set('.drip', { clipPath: 'inset(0 0 100% 0)' });
  const kt = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.kits .pin', start: 'top top', end: 'bottom bottom', scrub: .6 } });
  kt.fromTo('.box3d', { '--a': '-28deg' }, { '--a': '332deg', duration: 1 }, 0)
    .to('.drip', { clipPath: 'inset(0 0 0% 0)', duration: .55, ease: 'power1.out' }, 0)
    .fromTo('.box3d', { y: 40 }, { y: 0, duration: .5 }, 0);
  const cellEls = $$('.cells i');
  order.forEach((ci, k) => kt.to(cellEls[ci], { opacity: 0, duration: .03 }, .08 + k * .029));
  dropEls.forEach((im, i) => kt.fromTo(im, { y: -vh() * .2, xPercent: -50 + ((i % 3) - 1) * 70, opacity: 0, rotate: i * 30, scale: 1 },
    { keyframes: [{ opacity: 1, duration: .02 }, { y: () => vh() * .3, rotate: i * 30 + 180, scale: .6, duration: .1, ease: 'power1.in' }, { opacity: 0, duration: .01 }] }, .06 + i * .065));
  kt.fromTo('.bow', { y: -vh() * .55, opacity: 0, rotate: -12 }, { y: 0, opacity: 1, rotate: 0, duration: .16, ease: 'back.out(1.6)' }, .82);

  // 9. FINAL: brigadeiros chovem e pousam em volta do botão
  gsap.set(finalP, { y: () => -vh() * 1.1, opacity: 0 });
  ScrollTrigger.create({ trigger: '.final', start: 'top 55%', once: true, onEnter: () =>
    gsap.to(finalP, { y: 0, opacity: 1, duration: 1.4, ease: 'bounce.out', stagger: { each: .07, from: 'random' } }) });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
