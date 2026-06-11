/* ════════════════════════════════════════════════════════════════════
   ThryveX — Border beam injector

   The service cards (.s-card) already use ::before and ::after, so the
   border beam needs its own element. We append one .s-beam span per card;
   all motion lives in CSS (and is disabled under prefers-reduced-motion).
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Border beam injector ─────────────────────────────────────── */
  document.querySelectorAll('.s-card').forEach(function (card) {
    var beam = document.createElement('span');
    beam.className = 's-beam';
    beam.setAttribute('aria-hidden', 'true');
    card.appendChild(beam);
  });

  /* ── Sticky "Book a Call" CTA ─────────────────────────────────────
     Visible once past the hero, hidden again over the contact section
     (so it doesn't duplicate the contact CTA).                        */
  var cta = document.querySelector('.sticky-cta');
  if (cta) {
    var hero = document.getElementById('hero');
    var contact = document.getElementById('contact');
    var heroIn = !!hero, contactIn = false;
    var update = function () {
      cta.classList.toggle('show', !heroIn && !contactIn);
    };
    if (hero) {
      new IntersectionObserver(function (e) { heroIn = e[0].isIntersecting; update(); },
        { threshold: 0.15 }).observe(hero);
    }
    if (contact) {
      new IntersectionObserver(function (e) { contactIn = e[0].isIntersecting; update(); },
        { threshold: 0.05 }).observe(contact);
    }
  }
}());
