/* ════════════════════════════════════════════════════════════════════
   ThryveX — Border beam injector

   The service cards (.s-card) already use ::before and ::after, so the
   border beam needs its own element. We append one .s-beam span per card;
   all motion lives in CSS (and is disabled under prefers-reduced-motion).
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  document.querySelectorAll('.s-card').forEach(function (card) {
    var beam = document.createElement('span');
    beam.className = 's-beam';
    beam.setAttribute('aria-hidden', 'true');
    card.appendChild(beam);
  });
}());
