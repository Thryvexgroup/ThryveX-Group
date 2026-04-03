export default function handler(req, res) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0EA5E9"/>
      <stop offset="50%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0EA5E9" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#7C3AED" stop-opacity="0.05"/>
    </linearGradient>
    <filter id="blur1">
      <feGaussianBlur stdDeviation="60"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="#050508"/>

  <!-- Glow blobs -->
  <circle cx="200" cy="180" r="260" fill="#0EA5E9" fill-opacity="0.07" filter="url(#blur1)"/>
  <circle cx="1050" cy="480" r="220" fill="#7C3AED" fill-opacity="0.08" filter="url(#blur1)"/>

  <!-- Grid lines -->
  <line x1="0" y1="315" x2="1200" y2="315" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  <line x1="600" y1="0" x2="600" y2="630" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>

  <!-- Top border accent -->
  <rect x="0" y="0" width="1200" height="3" fill="url(#g1)"/>

  <!-- Logo mark — infinity symbol approximation using two circles -->
  <g transform="translate(80, 48)">
    <ellipse cx="28" cy="22" rx="16" ry="10" fill="none" stroke="url(#g1)" stroke-width="4"/>
    <ellipse cx="54" cy="22" rx="16" ry="10" fill="none" stroke="url(#g1)" stroke-width="4"/>
  </g>

  <!-- Company name -->
  <text x="80" y="84" font-family="'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="-0.5" fill="#E2E8F0">ThryveX Group</text>

  <!-- Divider -->
  <rect x="80" y="200" width="60" height="4" rx="2" fill="url(#g1)"/>

  <!-- Main headline -->
  <text x="80" y="290" font-family="'Helvetica Neue', Arial, sans-serif" font-size="72" font-weight="800" letter-spacing="-2" fill="url(#g1)">AI Automation</text>
  <text x="80" y="375" font-family="'Helvetica Neue', Arial, sans-serif" font-size="72" font-weight="800" letter-spacing="-2" fill="#F8FAFC">Agency</text>

  <!-- Subtitle -->
  <text x="80" y="440" font-family="'Helvetica Neue', Arial, sans-serif" font-size="24" font-weight="400" fill="#64748B">Scale Without Limits. Powered by AI.</text>

  <!-- Domain -->
  <text x="80" y="570" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="500" fill="rgba(14,165,233,0.8)">thryvexgroup.com</text>

  <!-- Right decoration — abstract circuit dots -->
  <g opacity="0.4">
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

  <!-- Corner accent -->
  <rect x="1140" y="590" width="60" height="40" fill="url(#g2)" rx="4"/>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.status(200).send(svg);
}
