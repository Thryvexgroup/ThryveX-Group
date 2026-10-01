/* Panama Dive Center: scroll descent, depth gauge, reveals, map, calendar, i18n. */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAX_DEPTH = 40;

  /* ---------- Site data (map panel) ---------- */
  const SITES = {
    contreras: { name: 'Contreras', level: 'adv', depth: '18–35 m',
      en: { p: 'A group of islands at the northern edge of the park. Deep, open-ocean dives on pinnacles where schooling hammerheads patrol in the dry season. Current, thermoclines, and the biggest animals in the park.', see: 'Hammerheads, eagle rays, jacks' },
      es: { p: 'Un grupo de islas en el borde norte del parque. Inmersiones profundas de mar abierto en pináculos donde patrullan cardúmenes de martillos en la estación seca. Corriente, termoclinas y los animales más grandes del parque.', see: 'Martillos, águilas de mar, jureles' } },
    wahoo: { name: 'Wahoo Rock', level: 'adv', depth: '8–30 m',
      en: { p: 'A rock that breaks the surface, so navigation is easy and the drop-offs are not. Plankton collects here, which is why whale sharks and mantas pass through in season. Sandy shallows, steep walls, big schools.', see: 'Whale sharks, mantas, wahoo, barracuda' },
      es: { p: 'Una roca que rompe la superficie, así que navegar es fácil y las paredes no. Aquí se concentra el plancton, por eso pasan tiburones ballena y mantas en temporada. Bajos de arena, paredes verticales, grandes cardúmenes.', see: 'Tiburones ballena, mantas, wahoo, barracudas' } },
    monalisa: { name: 'Mona Lisa', level: 'all', depth: '10–25 m',
      en: { p: 'A submerged island of boulders that works as a giant cleaning station. Clouds of butterflyfish and king angelfish on the southern slope, with barracuda, jacks and spadefish arriving to be cleaned. Turtles, rays and whitetips rest in the sand.', see: 'Turtles, whitetips, barracuda, macro life' },
      es: { p: 'Una isla sumergida de rocas que funciona como una estación de limpieza gigante. Nubes de peces mariposa y ángel rey en la ladera sur, con barracudas, jureles y peces espátula que llegan a limpiarse. Tortugas, rayas y punta blanca descansan en la arena.', see: 'Tortugas, punta blanca, barracudas, vida macro' } },
    canales: { name: 'Canales de Afuera', level: 'all', depth: '8–30 m',
      en: { p: 'Next to Isla Afuerita, a surface rock marks the entrance to two rock formations. Start shallow among the reef fish and work down to the deeper, more challenging bottom when the group is ready.', see: 'Whitetip sharks, moray eels, schooling snapper' },
      es: { p: 'Junto a Isla Afuerita, una roca en superficie marca la entrada a dos formaciones rocosas. Empiezas en lo somero entre peces de arrecife y bajas al fondo más profundo y exigente cuando el grupo está listo.', see: 'Punta blanca, morenas, cardúmenes de pargos' } },
    frijoles: { name: 'Frijoles', level: 'ow', depth: '10–25 m',
      en: { p: 'A pair of rocky islets north of Coiba with boulder slopes and sand channels. Whitetip reef sharks on nearly every dive, resident turtles, and jacks that circle the pinnacle in the afternoon light.', see: 'Whitetip sharks, turtles, jacks' },
      es: { p: 'Un par de islotes rocosos al norte de Coiba con laderas de bloques y canales de arena. Punta blanca en casi cada inmersión, tortugas residentes y jureles que rodean el pináculo con la luz de la tarde.', see: 'Punta blanca, tortugas, jureles' } },
    granito: { name: 'Granito de Oro', level: 'ow', depth: '5–15 m',
      en: { p: 'A tiny islet with a white-sand beach and the reef that made the park famous for snorkelling. Where we run Discover Scuba and Open Water training dives, and where surface intervals happen.', see: 'Turtles, reef fish, rays, snorkelling' },
      es: { p: 'Un islote diminuto con playa de arena blanca y el arrecife que hizo famoso al parque para el snorkel. Aquí hacemos las inmersiones de Discover Scuba y Open Water, y aquí pasan los intervalos de superficie.', see: 'Tortugas, peces de arrecife, rayas, snorkel' } }
  };
  const LEVEL = { en: { all: 'All levels', adv: 'Advanced', ow: 'Open Water' }, es: { all: 'Todos los niveles', adv: 'Avanzado', ow: 'Open Water' } };

  /* ---------- i18n ---------- */
  let lang = 'en';
  try { lang = localStorage.getItem('pdc-lang') || 'en'; } catch (e) {}
  const dict = window.PDC_I18N || {};
  const enCache = new Map();
  function applyLang(l) {
    lang = l; document.documentElement.lang = l; document.body.dataset.lang = l;
    $$('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      if (!enCache.has(el)) enCache.set(el, el.textContent);
      const val = l === 'en' ? enCache.get(el) : (dict[l] && dict[l][k]);
      if (val != null) el.textContent = val;
    });
    const btn = $('#lang');
    if (btn) { btn.setAttribute('aria-label', l === 'en' ? 'Cambiar a español' : 'Switch to English'); btn.dataset.lang = l; }
    try { localStorage.setItem('pdc-lang', l); } catch (e) {}
    updateZone(); if (activeSite) showSite(activeSite);
  }
  $('#lang') && $('#lang').addEventListener('click', () => applyLang(lang === 'en' ? 'es' : 'en'));

  /* ---------- Smooth scroll ---------- */
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

  /* ---------- Depth gauge + ocean depth ---------- */
  const sections = $$('[data-depth]');
  const gaugeM = $('#gauge-m'), gaugeFill = $('#gauge-fill'), gaugeZone = $('#gauge-zone'), surfaceBtn = $('#surface'), nav = $('#nav');
  let anchors = [];
  function measure() {
    anchors = sections.map(s => ({ el: s, top: s.getBoundingClientRect().top + window.scrollY, depth: parseFloat(s.dataset.depth) }));
  }
  let currentZoneEl = null, currentDepth = 0;
  function updateZone() {
    if (!currentZoneEl || !gaugeZone) return;
    gaugeZone.textContent = (lang === 'es' && currentZoneEl.dataset.zoneEs) ? currentZoneEl.dataset.zoneEs : currentZoneEl.dataset.zone;
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
    currentDepth = d;
    if (gaugeM) gaugeM.textContent = d.toFixed(1);
    if (gaugeFill) gaugeFill.style.transform = `scaleX(${Math.min(1, d / MAX_DEPTH)})`;
    if (zone !== currentZoneEl) { currentZoneEl = zone; updateZone(); }
    if (window.Ocean) window.Ocean.setDepth(d / MAX_DEPTH);
    document.body.classList.toggle('is-deep', d > 5);
    nav && nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  measure(); onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
  window.addEventListener('load', () => { measure(); onScroll(); });
  surfaceBtn && surfaceBtn.addEventListener('click', () => scrollTo('#top'));

  /* ---------- Menu ---------- */
  const burger = $('#burger'), menu = $('#menu');
  function closeMenu() { if (!menu) return; menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); lenis && lenis.start(); }
  burger && burger.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    if (open) { menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true'); document.body.classList.add('menu-open'); lenis && lenis.stop(); }
    else closeMenu();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Hero video (only if the file exists) ---------- */
  const vid = $('#hero-video');
  if (vid) {
    vid.addEventListener('canplay', () => vid.classList.add('is-ready'), { once: true });
    vid.addEventListener('error', () => vid.remove(), { once: true });
    const src = vid.querySelector('source'); src && src.addEventListener('error', () => vid.remove(), { once: true });
  }

  /* ---------- Ticker ---------- */
  const ticker = $('#ticker');
  if (ticker) { const clone = ticker.innerHTML; ticker.innerHTML = clone + clone; }

  /* ---------- Calendar ---------- */
  $$('.cal__row').forEach(row => {
    const months = row.dataset.months.split(',').map(Number);
    const bar = row.querySelector('.cal__bar'); bar.innerHTML = '';
    for (let m = 1; m <= 12; m++) { const c = document.createElement('i'); if (months.includes(m)) c.className = 'on'; bar.appendChild(c); }
  });

  /* ---------- Map ---------- */
  let activeSite = 'contreras';
  const siteName = $('#site-name'), siteDesc = $('#site-desc'), siteDepth = $('#site-depth'), siteSee = $('#site-see'), siteLevel = $('#site-level'), panel = $('#site-panel');
  function showSite(key) {
    const s = SITES[key]; if (!s) return; activeSite = key;
    const L = s[lang] || s.en;
    siteName.textContent = s.name; siteDesc.textContent = L.p; siteDepth.textContent = s.depth; siteSee.textContent = L.see; siteLevel.textContent = LEVEL[lang][s.level];
    siteDesc.removeAttribute('data-i18n'); siteSee.removeAttribute('data-i18n'); siteLevel.removeAttribute('data-i18n');
    $$('.pin').forEach(p => p.classList.toggle('is-active', p.dataset.site === key));
    if (panel && !reduced) { panel.classList.remove('is-swap'); void panel.offsetWidth; panel.classList.add('is-swap'); }
  }
  $$('.pin').forEach(p => {
    p.addEventListener('click', () => showSite(p.dataset.site));
    p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showSite(p.dataset.site); } });
  });
  showSite('contreras');

  /* ---------- Reveals and counters ---------- */
  if (window.gsap && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on('scroll', ScrollTrigger.update);

    // hero intro
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__title .line > *', { yPercent: 110, duration: 1.3, stagger: 0.12 }, 0.2)
      .from('.hero .reveal', { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 0.7)
      .from('.nav', { y: -12, opacity: 0, duration: 0.8 }, 0.4)
      .from('.nav__gauge', { x: 12, opacity: 0, duration: 0.8 }, 1.0);

    $$('.section .reveal, .reviews .reveal').forEach(el => {
      gsap.from(el, { y: 32, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    $$('.reveal-group').forEach(g => {
      gsap.from(g.children, { y: 28, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: g, start: 'top 85%', once: true } });
    });
    $$('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '';
      const o = { v: 0 };
      gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true }, onUpdate: () => { el.textContent = Math.round(o.v) + suffix; } });
    });
    // section titles get a slight parallax against the ocean
    $$('.section__head h2, .coiba__text h2, .about__grid h2, .contact__text h2').forEach(h => {
      gsap.to(h, { y: -18, ease: 'none', scrollTrigger: { trigger: h, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    window.addEventListener('load', () => ScrollTrigger.refresh());
  } else {
    $$('.reveal, .reveal-group > *').forEach(el => { el.style.opacity = 1; });
  }

  /* ---------- Misc ---------- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
  applyLang(lang);
})();
