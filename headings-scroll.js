/* ════════════════════════════════════════════════════════════════════
   ThryveX — Scroll-triggered heading + number reveals (GSAP ScrollTrigger)

   • Section headings (.sec-h) split into words (manual split — no plugin)
     and reveal with a confident staggered rise as the section scrolls in.
   • Large numbers (.p-num 01–04 in Process, .w-num 01–04 in Why) count up
     from 00 with a kinetic rise when they enter the viewport.

   Smooth, confident easing (power3 / power1 — no bounce). Each effect fires
   once. The whole thing is gated through ThryveScroll.add(), so under
   prefers-reduced-motion it never runs: headings keep their normal .reveal
   fade and the numbers keep their static styling.

   i18n note: applyLang() in index.html only rewrites text when an element
   has no children, so once we split a heading into word spans it stops
   auto-translating. We re-split (visibly) on language switch to keep EN/ES
   working.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (!window.ThryveScroll) return;            // scroll foundation missing → leave defaults

  ThryveScroll.add(function (gsap, ScrollTrigger) {

    /* ── Section heading word reveals ─────────────────────────────── */
    function currentLang() {
      var on = document.querySelector('.lang-opt.on');
      return (on && on.dataset.lang) || 'en';
    }

    // Replace one i18n line-span's text with word spans for the given lang.
    function splitUnit(span, lang) {
      var text = (span.dataset[lang] || span.textContent || '').trim();
      var isGrad = span.classList.contains('g');     // keep gradient per word
      span.textContent = '';
      var words = text.split(/\s+/).filter(Boolean);
      var els = [];
      words.forEach(function (w, i) {
        var el = document.createElement('span');
        el.className = 'gsap-word' + (isGrad ? ' g' : '');
        el.textContent = w;
        span.appendChild(el);
        if (i < words.length - 1) span.appendChild(document.createTextNode(' '));
        els.push(el);
      });
      return els;
    }

    var registry = [];   // headings we manage, for re-splitting on lang switch

    gsap.utils.toArray('.sec-h').forEach(function (h2) {
      var units = Array.prototype.slice.call(h2.querySelectorAll(':scope > span[data-en]'));
      if (!units.length) return;

      // Take over from the global .reveal fade so GSAP owns this heading.
      h2.classList.remove('reveal');
      gsap.set(h2, { opacity: 1, y: 0, clearProps: 'filter,transform' });

      var lang = currentLang();
      var words = [];
      units.forEach(function (u) { words = words.concat(splitUnit(u, lang)); });

      gsap.set(words, { opacity: 0, yPercent: 60 });
      gsap.to(words, {
        opacity: 1, yPercent: 0,
        duration: 0.7, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: h2, start: 'top 82%', once: true }
      });

      registry.push(units);
    });

    /* ── Hero headline: character mask-reveal on load ─────────────────
       Split "Scale Without" into characters that rise from behind a clip
       mask; "Limits." (an animated typewriter word) rises in as a unit so
       its gradient + typewriter stay intact. Fires once the loader lifts. */
    (function () {
      var title = document.querySelector('.hero-title');
      if (!title) return;
      var line1 = title.querySelector('span:not(.line2)');
      var line2 = title.querySelector('.line2');
      if (!line1) return;

      title.style.animation = 'none';            // GSAP owns the entrance now

      var text = (line1.dataset[currentLang()] || line1.textContent || '').trim();
      line1.textContent = '';
      var chars = [];
      for (var i = 0; i < text.length; i++) {
        if (text[i] === ' ') { line1.appendChild(document.createTextNode(' ')); continue; }
        var mask = document.createElement('span'); mask.className = 'hm-mask';
        var inner = document.createElement('span'); inner.className = 'hm-char';
        inner.textContent = text[i];
        mask.appendChild(inner);
        line1.appendChild(mask);
        chars.push(inner);
      }

      gsap.set(title, { opacity: 1 });
      gsap.set(chars, { yPercent: 110 });
      if (line2) gsap.set(line2, { opacity: 0, y: 24 });

      var played = false;
      function play() {
        if (played) return;
        played = true;
        var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to(chars, { yPercent: 0, duration: 0.7, stagger: 0.035 });
        if (line2) tl.to(line2, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
      }

      // Reveal once the loader lifts (body loses .loading); failsafe timer.
      if (document.body.classList.contains('loading')) {
        var mo = new MutationObserver(function () {
          if (!document.body.classList.contains('loading')) { mo.disconnect(); play(); }
        });
        mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        setTimeout(play, 4000);
      } else {
        play();
      }

      registry.push([line1]);                    // re-translate on language switch
    }());

    // Keep EN/ES working: rebuild words (already visible) on language switch.
    document.querySelectorAll('.lang-opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.dataset.lang || 'en';
        registry.forEach(function (units) {
          var words = [];
          units.forEach(function (u) { words = words.concat(splitUnit(u, lang)); });
          gsap.set(words, { opacity: 1, yPercent: 0 });
        });
      });
    });

    /* ── Big-number count-ups (Process 01–04, Why 01–04) ──────────── */
    function countUp(selector) {
      gsap.utils.toArray(selector).forEach(function (el) {
        var raw = (el.textContent || '').trim();
        var target = parseInt(raw, 10) || 0;
        var pad = raw.length || 2;
        var baseOpacity = parseFloat(getComputedStyle(el).opacity) || 1;  // respect .35 / .3

        gsap.set(el, { opacity: 0, yPercent: 40 });
        var counter = { v: 0 };
        gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
          .to(el, { opacity: baseOpacity, yPercent: 0, duration: 0.6, ease: 'power3.out' }, 0)
          .to(counter, {
            v: target, duration: 0.7, ease: 'power1.out',
            onUpdate: function () { el.textContent = String(Math.round(counter.v)).padStart(pad, '0'); }
          }, 0)
          .call(function () { el.textContent = String(target).padStart(pad, '0'); });  // exact final
      });
    }
    countUp('.p-num');
    countUp('.w-num');
  });
}());
