/* ════════════════════════════════════════════════════════════════════
   ThryveX — Footer interactive globe (cobe)

   A small WebGL globe next to "Panamá → Worldwide" — markers light up
   Panama City plus the worldwide network (Miami, Santo Domingo, etc.).
   Drag to spin; auto-rotates otherwise.

   Performance / accessibility:
     • Lazy: the globe is only created when the footer scrolls into view,
       and destroyed when it leaves (IntersectionObserver) — no GPU work
       while you're reading the rest of the page.
     • Device pixel ratio capped at 2.
     • prefers-reduced-motion: the globe renders static (no auto-spin);
       manual drag still works.
   ════════════════════════════════════════════════════════════════════ */
import createGlobe from 'cobe';

(function () {
  'use strict';

  const canvas = document.querySelector('.f-globe');
  if (!canvas) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let globe = null;
  let phi = 0;
  let size = 0;

  // Drag-to-rotate state
  let pointerInteracting = null;
  let pointerMovement = 0;

  function build() {
    if (globe) return;
    size = canvas.offsetWidth;
    if (!size) return;

    globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size * dpr,
      height: size * dpr,
      phi: 0,
      theta: 0.28,
      dark: 1,
      diffuse: 1.15,
      mapSamples: 14000,
      mapBrightness: 5,
      baseColor: [0.32, 0.40, 0.55],
      markerColor: [0.22, 0.74, 1],
      glowColor: [0.18, 0.42, 0.85],
      markers: [
        { location: [8.98, -79.52],  size: 0.11 },  // Panama City (home)
        { location: [25.76, -80.19], size: 0.06 },  // Miami
        { location: [18.48, -69.93], size: 0.06 },  // Santo Domingo
        { location: [40.71, -74.01], size: 0.05 },  // New York
        { location: [19.43, -99.13], size: 0.05 },  // Mexico City
        { location: [40.42, -3.70],  size: 0.05 },  // Madrid
        { location: [51.50, -0.12],  size: 0.05 },  // London
        { location: [-23.55, -46.63], size: 0.05 }  // São Paulo
      ],
      onRender: (state) => {
        if (pointerInteracting === null && !reduce) phi += 0.004;
        state.phi = phi + pointerMovement / 200;
      }
    });

    requestAnimationFrame(() => { canvas.style.opacity = '1'; });
  }

  function destroy() {
    if (globe) { globe.destroy(); globe = null; }
    canvas.style.opacity = '0';
  }

  // Drag to spin
  canvas.addEventListener('pointerdown', (e) => {
    pointerInteracting = e.clientX - pointerMovement;
  });
  window.addEventListener('pointerup', () => { pointerInteracting = null; });
  window.addEventListener('pointermove', (e) => {
    if (pointerInteracting !== null) {
      pointerMovement = e.clientX - pointerInteracting;
    }
  });

  // Lazy create / destroy with viewport visibility
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) build(); else destroy();
  }, { threshold: 0.1 });
  io.observe(canvas);

  // Rebuild on resize so the backing store matches the new CSS size
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (globe && canvas.offsetWidth !== size) { destroy(); build(); }
    }, 200);
  }, { passive: true });
}());
