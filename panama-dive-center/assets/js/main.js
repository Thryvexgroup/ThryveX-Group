/* Panama Dive Center: descenso por scroll, lectura de profundidad, reveals, mapa, calendario, idioma, medios. */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAX_DEPTH = 40;
  const BASE = 'es';

  /* ---------- Datos de sitios ---------- */
  const SITES = {
    contreras: { name: 'Contreras', level: 'adv', depth: '18–35 m',
      es: { p: 'Un grupo de islas en el borde norte del parque. Inmersiones profundas de mar abierto en pináculos donde patrullan cardúmenes de martillos en la estación seca. Corriente, termoclinas y los animales más grandes del parque.', see: 'Martillos, águilas de mar, jureles' },
      en: { p: 'A group of islands at the northern edge of the park. Deep, open-ocean dives on pinnacles where schooling hammerheads patrol in the dry season. Current, thermoclines, and the biggest animals in the park.', see: 'Hammerheads, eagle rays, jacks' } },
    wahoo: { name: 'Wahoo Rock', level: 'adv', depth: '8–30 m',
      es: { p: 'Una roca que rompe la superficie, así que navegar es fácil y las paredes no. Aquí se concentra el plancton, por eso pasan tiburones ballena y mantas en temporada. Bajos de arena, paredes verticales, grandes cardúmenes.', see: 'Tiburones ballena, mantas, wahoo, barracudas' },
      en: { p: 'A rock that breaks the surface, so navigation is easy and the drop-offs are not. Plankton collects here, which is why whale sharks and mantas pass through in season. Sandy shallows, steep walls, big schools.', see: 'Whale sharks, mantas, wahoo, barracuda' } },
    monalisa: { name: 'Mona Lisa', level: 'all', depth: '10–25 m',
      es: { p: 'Una isla sumergida de rocas que funciona como una estación de limpieza gigante. Nubes de peces mariposa y ángel rey en la ladera sur, con barracudas, jureles y peces espátula que llegan a limpiarse. Tortugas, rayas y punta blanca descansan en la arena.', see: 'Tortugas, punta blanca, barracudas, vida macro' },
      en: { p: 'A submerged island of boulders that works as a giant cleaning station. Clouds of butterflyfish and king angelfish on the southern slope, with barracuda, jacks and spadefish arriving to be cleaned. Turtles, rays and whitetips rest in the sand.', see: 'Turtles, whitetips, barracuda, macro life' } },
    canales: { name: 'Canales de Afuera', level: 'all', depth: '8–30 m',
      es: { p: 'Junto a Isla Afuerita, una roca en superficie marca la entrada a dos formaciones rocosas. Empiezas en lo somero entre peces de arrecife y bajas al fondo más profundo y exigente cuando el grupo está listo.', see: 'Punta blanca, morenas, cardúmenes de pargos' },
      en: { p: 'Next to Isla Afuerita, a surface rock marks the entrance to two rock formations. Start shallow among the reef fish and work down to the deeper, more challenging bottom when the group is ready.', see: 'Whitetip sharks, moray eels, schooling snapper' } },
    frijoles: { name: 'Frijoles', level: 'ow', depth: '10–25 m',
      es: { p: 'Un par de islotes rocosos al norte de Coiba con laderas de bloques y canales de arena. Punta blanca en casi cada inmersión, tortugas residentes y jureles que rodean el pináculo con la luz de la tarde.', see: 'Punta blanca, tortugas, jureles' },
      en: { p: 'A pair of rocky islets north of Coiba with boulder slopes and sand channels. Whitetip reef sharks on nearly every dive, resident turtles, and jacks that circle the pinnacle in the afternoon light.', see: 'Whitetip sharks, turtles, jacks' } },
    granito: { name: 'Granito de Oro', level: 'ow', depth: '5–15 m',
      es: { p: 'Un islote diminuto con playa de arena blanca y el arrecife que hizo famoso al parque para el snorkel. Aquí hacemos las inmersiones de Discover Scuba y Open Water, y aquí pasan los intervalos de superficie.', see: 'Tortugas, peces de arrecife, rayas, snorkel' },
      en: { p: 'A tiny islet with a white-sand beach and the reef that made the park famous for snorkelling. Where we run Discover Scuba and Open Water training dives, and where surface intervals happen.', see: 'Turtles, reef fish, rays, snorkelling' } }
  };
  const LEVEL = { es: { all: 'Todos los niveles', adv: 'Avanzado', ow: 'Open Water' }, en: { all: 'All levels', adv: 'Advanced', ow: 'Open Water' } };

  /* ---------- Idioma ---------- */
  let lang = BASE;
  try { lang = localStorage.getItem('pdc-lang') || BASE; } catch (e) {}
  if (lang !== 'en') lang = BASE;
  const dict = window.PDC_I18N || {};
  const baseCache = new Map();
  function applyLang(l) {
    lang = l; document.documentElement.lang = l; document.body.dataset.lang = l;
    $$('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      if (!baseCache.has(el)) baseCache.set(el, el.textContent);
      const val = l === BASE ? baseCache.get(el) : (dict[l] && dict[l][k]);
      if (val != null) el.textContent = val;
    });
    const btn = $('#lang');
    if (btn) { btn.setAttribute('aria-label', l === BASE ? 'Switch to English' : 'Cambiar a español'); btn.dataset.lang = l; }
    try { localStorage.setItem('pdc-lang', l); } catch (e) {}
    updateZone(); if (activeSite) showSite(activeSite);
  }
  $('#lang') && $('#lang').addEventListener('click', () => applyLang(lang === BASE ? 'en' : BASE));

  /* ---------- Scroll suave ---------- */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    if (window.gsap) { gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  function scrollTo(target) {
    const el = typeof target === 'string' ? $(target) : target; if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -64, duration: 1.4 }); else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    e.preventDefault(); closeMenu(); scrollTo(id); history.replaceState(null, '', id);
  }));

  /* ---------- Profundidad ---------- */
  const sections = $$('[data-depth]');
  const gaugeM = $('#gauge-m'), gaugeFill = $('#gauge-fill'), gaugeZone = $('#gauge-zone'), nav = $('#nav');
  let anchors = [];
  function measure() { anchors = sections.map(s => ({ el: s, top: s.getBoundingClientRect().top + window.scrollY, depth: parseFloat(s.dataset.depth) })); }
  let currentZoneEl = null;
  function updateZone() {
    if (!currentZoneEl || !gaugeZone) return;
    gaugeZone.textContent = (lang === 'en' && currentZoneEl.dataset.zoneEn) ? currentZoneEl.dataset.zoneEn : currentZoneEl.dataset.zone;
  }
  function onScroll() {
    const y = window.scrollY + window.innerHeight * 0.35;
    let d = 0, zone = anchors[0] && anchors[0].el;
    if (anchors.length) {
      if (y <= anchors[0].top) { d = 0; zone = anchors[0].el; }
      else {
        let i = anchors.length - 1;
        for (let k = 0; k < anchors.length - 1; k++) { if (y >= anchors[k].top && y < anchors[k + 1].top) { i = k; break; } }
        const a = anchors[i], b = anchors[i + 1];
        if (!b) { d = a.depth; zone = a.el; }
        else { const t = Math.min(1, Math.max(0, (y - a.top) / (b.top - a.top))); d = a.depth + (b.depth - a.depth) * t; zone = a.el; }
      }
    }
    if (gaugeM) gaugeM.textContent = d.toFixed(1);
    if (gaugeFill) gaugeFill.style.transform = `scaleX(${Math.min(1, d / MAX_DEPTH)})`;
    if (zone !== currentZoneEl) { currentZoneEl = zone; updateZone(); }
    if (window.Ocean) window.Ocean.setDepth(d / MAX_DEPTH);
    document.body.classList.toggle('is-deep', d > 4);
    nav && nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  measure(); onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
  window.addEventListener('load', () => { measure(); onScroll(); });

  /* ---------- Menú ---------- */
  const burger = $('#burger'), menu = $('#menu');
  function closeMenu() { if (!menu) return; menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); lenis && lenis.start(); }
  burger && burger.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    if (open) { menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true'); document.body.classList.add('menu-open'); lenis && lenis.stop(); }
    else closeMenu();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Medios: el vídeo del hero solo si el archivo existe ---------- */
  const vid = $('#hero-video');
  if (vid) {
    vid.addEventListener('canplay', () => vid.classList.add('is-ready'), { once: true });
    vid.addEventListener('error', () => vid.remove(), { once: true });
    const src = vid.querySelector('source'); src && src.addEventListener('error', () => vid.remove(), { once: true });
  }
  $$('.media').forEach(fig => {
    const img = fig.querySelector('img'); if (!img) { fig.classList.add('is-empty'); return; }
    const ok = () => fig.classList.add('is-ready');
    const fail = () => { fig.classList.add('is-empty'); if (window.ScrollTrigger) ScrollTrigger.refresh(); measure(); };
    if (img.complete) { img.naturalWidth ? ok() : fail(); }
    img.addEventListener('load', ok, { once: true }); img.addEventListener('error', fail, { once: true });
  });

  /* ---------- Calendario ---------- */
  $$('.cal__row').forEach(row => {
    const months = row.dataset.months.split(',').map(Number);
    const bar = row.querySelector('.cal__bar'); bar.innerHTML = '';
    for (let m = 1; m <= 12; m++) { const c = document.createElement('i'); if (months.includes(m)) c.className = 'on'; bar.appendChild(c); }
  });

  /* ---------- Mapa ---------- */
  let activeSite = 'contreras';
  const siteName = $('#site-name'), siteDesc = $('#site-desc'), siteDepth = $('#site-depth'), siteSee = $('#site-see'), siteLevel = $('#site-level'), panel = $('#site-panel');
  function showSite(key) {
    const s = SITES[key]; if (!s) return; activeSite = key;
    const L = s[lang] || s[BASE];
    siteName.textContent = s.name; siteDesc.textContent = L.p; siteDepth.textContent = s.depth; siteSee.textContent = L.see; siteLevel.textContent = LEVEL[lang][s.level];
    $$('.pin').forEach(p => p.classList.toggle('is-active', p.dataset.site === key));
    if (panel && !reduced) { panel.classList.remove('is-swap'); void panel.offsetWidth; panel.classList.add('is-swap'); }
  }
  $$('.pin').forEach(p => {
    p.addEventListener('click', () => showSite(p.dataset.site));
    p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showSite(p.dataset.site); } });
  });
  showSite('contreras');

  /* ---------- Reveals y contadores ---------- */
  if (window.gsap && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on('scroll', ScrollTrigger.update);
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__title .line > *', { yPercent: 110, duration: 1.2, stagger: 0.12 }, 0.2)
      .from('.hero .reveal', { y: 22, opacity: 0, duration: 1, stagger: 0.1 }, 0.6)
      .from('.nav', { y: -12, opacity: 0, duration: 0.8 }, 0.4);
    $$('.section .reveal').forEach(el => {
      gsap.from(el, { y: 28, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    $$('.reveal-group').forEach(g => {
      gsap.from(g.children, { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: g, start: 'top 85%', once: true } });
    });
    $$('.media--banner img, .media--wide img, .media--tall img, .media--side img').forEach(img => {
      gsap.fromTo(img, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.to('.hero__media img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    window.addEventListener('load', () => ScrollTrigger.refresh());
  } else {
    $$('.reveal, .reveal-group > *').forEach(el => { el.style.opacity = 1; });
  }

  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
  applyLang(lang);
})();
