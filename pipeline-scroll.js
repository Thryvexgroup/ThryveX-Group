/* ════════════════════════════════════════════════════════════════════
   ThryveX — Automation Pipeline: self-playing scroll reveal (GSAP)

   Desktop (min-width: 1101px, motion allowed):
     • When the #pipeline section scrolls into view, the sequence plays
       ONCE on its own — the user scrolls once, then watches it unfold.
       (No pinning / no scroll-jacking — it does not require 5 scrolls.)
     • The 5 steps reveal one at a time (fade + slide-up + slight scale).
     • The connector line "fills" and a glowing dot travels across it —
       data flowing from one step to the next.
     • Earlier steps dim as focus moves forward, then the whole completed
       pipeline settles back to full focus at the end.

   Gated through ThryveScroll.add(), so under prefers-reduced-motion it
   never runs and the section keeps its normal stacked reveal.
   gsap.matchMedia() means below 1101px the existing behaviour is used.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (!window.ThryveScroll) return;            // scroll foundation missing → leave defaults

  // Runs only when motion is enabled + libs are live (see scroll.js).
  ThryveScroll.add(function (gsap, ScrollTrigger) {
    var track = document.getElementById('pipeTrack');
    if (!track) return;

    var mm = gsap.matchMedia();

    mm.add('(min-width: 1101px)', function () {
      var steps = gsap.utils.toArray('#pipeTrack .pipe-step');   // 5
      var conns = gsap.utils.toArray('#pipeTrack .pipe-conn');   // 4
      var lines = conns.map(function (c) { return c.querySelector('.pipe-conn-line'); });
      var dots  = conns.map(function (c) { return c.querySelector('.pipe-conn-dot'); });

      // Let GSAP own the steps + connector dots (kill CSS transitions / loop).
      track.classList.add('pipe-seq');

      // Initial states
      gsap.set(steps, { opacity: 0, y: 44, scale: 0.94 });
      gsap.set(lines, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(dots,  { autoAlpha: 0, left: '0%', xPercent: -50 });

      // Time-based timeline that plays ONCE when the section enters view.
      var tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: '#pipeline',
          start: 'top 65%',
          once: true
        }
      });

      steps.forEach(function (step, i) {
        // Reveal current step
        tl.to(step, { opacity: 1, y: 0, scale: 1, duration: 0.42 }, i === 0 ? 0 : '+=0.1');

        // Dim earlier steps as focus moves forward
        if (i > 0) {
          tl.to(steps.slice(0, i), { opacity: 0.4, scale: 0.97, duration: 0.33 }, '<');
        }

        // Flow data into the next step: fill the line + send the dot across
        if (i < lines.length) {
          tl.fromTo(lines[i], { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'none' }, '<0.08');
          tl.fromTo(dots[i],
            { autoAlpha: 1, left: '0%' },
            { left: '100%', duration: 0.4, ease: 'none' }, '<');
          tl.to(dots[i], { autoAlpha: 0, duration: 0.12 });
        }
      });

      // Settle: the completed pipeline ends fully lit.
      tl.to(steps, { opacity: 1, scale: 1, duration: 0.38 }, '+=0.1');

      /* ── Ambient flow pulse ──────────────────────────────────────────
         After the reveal, a glowing dot keeps travelling down the pipeline
         (connector → connector), looping forever — leads continuously
         flowing through the automated system. Dedicated dots so this never
         conflicts with the reveal. Paused while the section is offscreen.  */
      var flowDots = conns.map(function (c) {
        var d = document.createElement('div');
        d.className = 'pipe-flow-dot';
        d.setAttribute('aria-hidden', 'true');
        c.appendChild(d);
        return d;
      });
      gsap.set(flowDots, { autoAlpha: 0, left: '0%', xPercent: -50 });

      var loop = gsap.timeline({ repeat: -1, repeatDelay: 0.9, paused: true });
      flowDots.forEach(function (d, i) {
        var at = i * 0.55;                       // sequential hand-off down the line
        loop.set(d, { left: '0%', autoAlpha: 0 }, at)
            .to(d,  { autoAlpha: 1, duration: 0.15 }, at)
            .to(d,  { left: '100%', duration: 0.75, ease: 'power1.inOut' }, at)
            .to(d,  { autoAlpha: 0, duration: 0.2 }, at + 0.7);
      });

      var revealDone = false;
      var st = ScrollTrigger.create({
        trigger: '#pipeline', start: 'top bottom', end: 'bottom top',
        onToggle: function (self) {
          if (!revealDone) return;
          if (self.isActive) loop.play(); else loop.pause();
        }
      });
      tl.eventCallback('onComplete', function () {
        revealDone = true;
        if (st.isActive) loop.play();
      });

      // Cleanup when leaving this breakpoint (resize) — restore defaults.
      return function () {
        track.classList.remove('pipe-seq');
        loop.kill();
        st.kill();
        flowDots.forEach(function (d) { d.remove(); });
        gsap.set(steps, { clearProps: 'all' });
        gsap.set(lines, { clearProps: 'all' });
        gsap.set(dots,  { clearProps: 'all' });
      };
    });
  });
}());
