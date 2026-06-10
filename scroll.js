/* ════════════════════════════════════════════════════════════════════
   ThryveX — Scroll Foundation
   Lenis (smooth scroll) + GSAP / ScrollTrigger, properly synced.

   • One reusable setup. Add scroll animations later via ThryveScroll.add().
   • Respects prefers-reduced-motion: when reduced (or if a library fails
     to load) smooth scroll AND all animations are disabled, and the page
     falls back to plain native scrolling.

   Loaded AFTER gsap, ScrollTrigger and lenis are on the page.
   Globals expected: window.gsap, window.ScrollTrigger, window.Lenis
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var hasLibs = !!gsap && !!ScrollTrigger && typeof window.Lenis === 'function';

  var lenis = null;

  /* ── Public API — the single entry point for all future scroll work ──
     ThryveScroll.enabled        → true only when smooth scroll + animation
                                    are live (motion allowed + libs loaded).
     ThryveScroll.reducedMotion  → user's prefers-reduced-motion setting.
     ThryveScroll.lenis          → the Lenis instance (or null).
     ThryveScroll.gsap / .ScrollTrigger → handy references.
     ThryveScroll.add(setupFn)   → register scroll animations. setupFn is
                                    called with (gsap, ScrollTrigger) ONLY
                                    when motion is enabled; under reduced
                                    motion it is skipped, so nothing moves.
     ThryveScroll.scrollTo(t, o) → programmatic scroll that works in both
                                    modes (smooth when enabled, instant when
                                    reduced).                                */
  var api = {
    enabled: false,
    reducedMotion: prefersReduced,
    lenis: null,
    gsap: gsap || null,
    ScrollTrigger: ScrollTrigger || null,

    add: function (setupFn) {
      if (typeof setupFn !== 'function') return this;
      if (!this.enabled) return this;            // reduced motion / no libs → no-op
      setupFn(gsap, ScrollTrigger);
      ScrollTrigger.refresh();
      return this;
    },

    scrollTo: function (target, opts) {
      if (lenis) { lenis.scrollTo(target, opts); return; }
      var behavior = prefersReduced ? 'auto' : 'smooth';
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: behavior });
      } else {
        var el = typeof target === 'string' ? document.querySelector(target) : target;
        if (el) el.scrollIntoView({ behavior: behavior, block: 'start' });
      }
    }
  };
  window.ThryveScroll = api;

  /* ── Reduced motion or missing libraries: stop here. ──────────────────
     No Lenis, no ScrollTrigger ticker, native scroll only.                */
  if (prefersReduced || !hasLibs) return;

  /* ── Smooth scroll + animation foundation ─────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  lenis = new Lenis({
    lerp: 0.35,               // high = settles almost immediately, minimal drift
    wheelMultiplier: 1.15,    // close to native distance per wheel notch
    smoothWheel: true
  });

  // Sync: every Lenis scroll tick tells ScrollTrigger to recalculate.
  lenis.on('scroll', ScrollTrigger.update);

  // Drive Lenis from GSAP's single rAF ticker (no competing loops, no jitter).
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  api.lenis = lenis;
  api.enabled = true;
}());
