export default function handler(req, res) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0EA5E9"/>
      <stop offset="50%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
    <linearGradient id="gbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a1628"/>
      <stop offset="100%" stop-color="#0d1f3c"/>
    </linearGradient>
    <filter id="blur1">
      <feGaussianBlur stdDeviation="70"/>
    </filter>
  </defs>

  <!-- Navy blue background -->
  <rect width="1200" height="630" fill="url(#gbg)"/>

  <!-- Glow blobs -->
  <circle cx="200" cy="160" r="280" fill="#0EA5E9" fill-opacity="0.08" filter="url(#blur1)"/>
  <circle cx="1050" cy="500" r="240" fill="#7C3AED" fill-opacity="0.1" filter="url(#blur1)"/>

  <!-- Top border accent -->
  <rect x="0" y="0" width="1200" height="4" fill="url(#g1)"/>

  <!-- Logo mark -->
  <g transform="translate(80, 52)">
    <ellipse cx="28" cy="22" rx="16" ry="10" fill="none" stroke="url(#g1)" stroke-width="4"/>
    <ellipse cx="54" cy="22" rx="16" ry="10" fill="none" stroke="url(#g1)" stroke-width="4"/>
  </g>

  <!-- Company name -->
  <text x="80" y="88" font-family="'Helvetica Neue', Arial, sans-serif" font-size="26" font-weight="700" fill="#E2E8F0">ThryveX Group</text>

  <!-- Divider -->
  <rect x="80" y="210" width="70" height="4" rx="2" fill="url(#g1)"/>

  <!-- Main headline -->
  <text x="80" y="310" font-family="'Helvetica Neue', Arial, sans-serif" font-size="80" font-weight="800" letter-spacing="-2" fill="url(#g1)">ThryveX Group</text>
  <text x="80" y="400" font-family="'Helvetica Neue', Arial, sans-serif" font-size="64" font-weight="700" letter-spacing="-1.5" fill="#F8FAFC">AI Automation Agency</text>

  <!-- Subtitle -->
  <text x="80" y="460" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="400" fill="#94A3B8">Scale Without Limits. Powered by AI.</text>

  <!-- Domain -->
  <text x="80" y="575" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="500" fill="rgba(14,165,233,0.9)">thryvexgroup.com</text>

  <!-- Right decoration -->
  <g opacity="0.5">
    <circle cx="950" cy="200" r="4" fill="#0EA5E9"/>
    <circle cx="1020" cy="200" r="4" fill="#7C3AED"/>
    <circle cx="1090" cy="200" r="4" fill="#06B6D4"/>
    <line x1="954" y1="200" x2="1016" y2="200" stroke="#0EA5E9" stroke-width="1.5" stroke-dasharray="4,4"/>
    <line x1="1024" y1="200" x2="1086" y2="200" stroke="#7C3AED" stroke-width="1.5" stroke-dasharray="4,4"/>
    <circle cx="950" cy="240" r="4" fill="#0EA5E9"/>
    <line x1="950" y1="204" x2="950" y2="236" stroke="#0EA5E9" stroke-width="1.5" stroke-dasharray="4,4"/>
    <circle cx="1020" cy="280" r="4" fill="#7C3AED"/>
    <line x1="1020" y1="204" x2="1020" y2="276" stroke="#7C3AED" stroke-width="1.5" stroke-dasharray="4,4"/>
    <circle cx="950" cy="320" r="4" fill="#06B6D4"/>
    <line x1="950" y1="244" x2="950" y2="316" stroke="#06B6D4" stroke-width="1.5" stroke-dasharray="4,4"/>
    <circle cx="1090" cy="280" r="4" fill="#06B6D4"/>
    <line x1="1090" y1="204" x2="1090" y2="276" stroke="#06B6D4" stroke-width="1.5" stroke-dasharray="4,4"/>
  </g>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.status(200).send(svg);
}
