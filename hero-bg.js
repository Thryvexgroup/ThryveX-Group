/* ════════════════════════════════════════════════════════════════════
   ThryveX — Hero 3D Network Background  (vanilla Three.js, no build step)

   A slowly drifting 3D network of glowing nodes connected by thin lines —
   evokes "connected automated systems." Nodes react to cursor (parallax).

   Performance / accessibility:
     • Pixel ratio capped (MAX_DPR).
     • Rendering pauses when the hero is offscreen (IntersectionObserver)
       and when the tab is hidden (visibilitychange).
     • Degrades to a static CSS gradient on mobile / coarse pointer and on
       prefers-reduced-motion (and if WebGL is unavailable). In those cases
       no WebGL context is ever created.

   Wiring: hero gets class `hero-enhanced` (hides the old 2D canvas) plus
   either `webgl-active` (3D running) or `fallback-active` (static gradient).
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const hero = document.getElementById('hero');
  const canvas = document.getElementById('heroNet');
  if (!hero || !canvas) return;

  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqMobile = window.matchMedia('(max-width: 860px), (pointer: coarse)');

  function webglOK() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (_) { return false; }
  }

  // JS is running → retire the legacy 2D particle canvas in favour of this system.
  hero.classList.add('hero-enhanced');

  // Decide mode. Reduced motion / mobile / no-WebGL → static gradient, no GL.
  if (mqReduce.matches || mqMobile.matches || !webglOK()) {
    hero.classList.add('fallback-active');
    return;
  }
  hero.classList.add('webgl-active');

  // Load Three.js only on this (WebGL) path, and after first paint — so
  // mobile / reduced-motion visitors never download the ~700KB library and
  // the hero text/background paint first.
  var startThree = function () {
    import('three')
      .then(function (THREE) { initNetwork(THREE); })
      .catch(function () {
        hero.classList.remove('webgl-active');
        hero.classList.add('fallback-active');   // graceful: show static gradient
      });
  };
  if ('requestIdleCallback' in window) requestIdleCallback(startThree, { timeout: 1500 });
  else setTimeout(startThree, 200);
  return;

  function initNetwork(THREE) {
  /* ── Tunables ─────────────────────────────────────────────────────── */
  const NODES     = 110;   // node count
  const LINK_DIST = 15;    // world-unit distance below which two nodes link
  const DRIFT     = 0.05;  // node drift speed
  const NODE_SIZE = 2.3;   // glow sprite size (world units, attenuated)
  const MAX_DPR   = 1.5;   // pixel-ratio cap
  const CAM_Z     = 80;

  /* ── Renderer / scene / camera ────────────────────────────────────── */
  let w = canvas.clientWidth  || hero.clientWidth;
  let h = canvas.clientHeight || hero.clientHeight;

  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: true, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
  renderer.setSize(w, h, false);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 500);
  camera.position.set(0, 0, CAM_Z);
  camera.lookAt(0, 0, 0);

  // Visible half-extents at z=0, so nodes fill the frame (slightly beyond).
  function halfExtents() {
    const vH = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * CAM_Z;
    const halfH = (vH / 2) * 1.05;
    return { x: halfH * camera.aspect, y: halfH, z: 24 };
  }
  let H = halfExtents();

  /* ── Nodes (glowing points) ───────────────────────────────────────── */
  // Low-saturation accent palette to match the dark #050508 theme.
  const palette = [
    new THREE.Color(0.32, 0.60, 0.85),  // muted blue
    new THREE.Color(0.40, 0.74, 0.80),  // muted cyan
    new THREE.Color(0.55, 0.50, 0.82),  // muted violet
  ];

  const pos = new Float32Array(NODES * 3);
  const col = new Float32Array(NODES * 3);
  const vel = new Float32Array(NODES * 3);
  for (let i = 0; i < NODES; i++) {
    const ix = i * 3;
    pos[ix]     = (Math.random() * 2 - 1) * H.x;
    pos[ix + 1] = (Math.random() * 2 - 1) * H.y;
    pos[ix + 2] = (Math.random() * 2 - 1) * H.z;
    vel[ix]     = (Math.random() * 2 - 1) * DRIFT;
    vel[ix + 1] = (Math.random() * 2 - 1) * DRIFT;
    vel[ix + 2] = (Math.random() * 2 - 1) * DRIFT;
    const c = palette[(Math.random() * palette.length) | 0];
    col[ix] = c.r; col[ix + 1] = c.g; col[ix + 2] = c.b;
  }

  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  nodeGeo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  const nodeMat = new THREE.PointsMaterial({
    size: NODE_SIZE, map: makeGlowSprite(), vertexColors: true,
    transparent: true, blending: THREE.AdditiveBlending,
    depthWrite: false, sizeAttenuation: true, opacity: 0.95
  });
  const points = new THREE.Points(nodeGeo, nodeMat);

  /* ── Lines (connections, distance-faded via vertex colour) ────────── */
  const maxSeg  = (NODES * (NODES - 1)) / 2;
  const linePos = new Float32Array(maxSeg * 2 * 3);
  const lineCol = new Float32Array(maxSeg * 2 * 3);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineCol, 3));
  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);

  const group = new THREE.Group();
  group.add(lines);
  group.add(points);
  scene.add(group);

  // Soft radial-gradient sprite for the node glow (generated, no asset file).
  function makeGlowSprite() {
    const s = 64;
    const cnv = document.createElement('canvas');
    cnv.width = cnv.height = s;
    const g = cnv.getContext('2d');
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0,   'rgba(255,255,255,1)');
    gr.addColorStop(0.3, 'rgba(255,255,255,0.55)');
    gr.addColorStop(1,   'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
    const t = new THREE.CanvasTexture(cnv);
    t.needsUpdate = true;
    return t;
  }

  // Rebuild the line segments each frame from current node positions.
  function buildLines() {
    let s = 0;
    for (let i = 0; i < NODES; i++) {
      const ix = i * 3, ax = pos[ix], ay = pos[ix + 1], az = pos[ix + 2];
      for (let j = i + 1; j < NODES; j++) {
        const jx = j * 3;
        const dx = ax - pos[jx], dy = ay - pos[jx + 1], dz = az - pos[jx + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < LINK_DIST) {
          const f = 1 - d / LINK_DIST;          // closeness → brightness
          const o = s * 6;
          linePos[o]     = ax; linePos[o + 1] = ay; linePos[o + 2] = az;
          linePos[o + 3] = pos[jx]; linePos[o + 4] = pos[jx + 1]; linePos[o + 5] = pos[jx + 2];
          // tint each endpoint by its node colour, scaled by closeness
          lineCol[o]     = col[ix] * f;     lineCol[o + 1] = col[ix + 1] * f; lineCol[o + 2] = col[ix + 2] * f;
          lineCol[o + 3] = col[jx] * f;     lineCol[o + 4] = col[jx + 1] * f; lineCol[o + 5] = col[jx + 2] * f;
          s++;
        }
      }
    }
    lineGeo.setDrawRange(0, s * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
  }

  /* ── Cursor parallax ──────────────────────────────────────────────── */
  let curX = 0, curY = 0, tgtX = 0, tgtY = 0;
  window.addEventListener('mousemove', (e) => {
    tgtX = (e.clientX / window.innerWidth)  * 2 - 1;
    tgtY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  /* ── Animation loop ───────────────────────────────────────────────── */
  let raf = 0, running = false, last = performance.now();

  function frame(now) {
    const dt = Math.min((now - last) / 16.67, 3); // frame-rate-independent step
    last = now;

    // drift nodes, wrap at bounds
    for (let i = 0; i < NODES; i++) {
      const ix = i * 3;
      pos[ix]     += vel[ix]     * dt;
      pos[ix + 1] += vel[ix + 1] * dt;
      pos[ix + 2] += vel[ix + 2] * dt;
      if (pos[ix]     >  H.x) pos[ix]     -= 2 * H.x; else if (pos[ix]     < -H.x) pos[ix]     += 2 * H.x;
      if (pos[ix + 1] >  H.y) pos[ix + 1] -= 2 * H.y; else if (pos[ix + 1] < -H.y) pos[ix + 1] += 2 * H.y;
      if (pos[ix + 2] >  H.z) pos[ix + 2] -= 2 * H.z; else if (pos[ix + 2] < -H.z) pos[ix + 2] += 2 * H.z;
    }
    nodeGeo.attributes.position.needsUpdate = true;
    buildLines();

    // slow global drift of the whole network
    group.rotation.y += 0.0008 * dt;
    group.rotation.x  = Math.sin(now * 0.00007) * 0.06;

    // parallax: ease the camera toward the cursor, keep looking at centre
    curX += (tgtX - curX) * 0.04;
    curY += (tgtY - curY) * 0.04;
    camera.position.x = curX * 8;
    camera.position.y = -curY * 6;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop()  { running = false; cancelAnimationFrame(raf); }

  /* ── Pause when offscreen / tab hidden ────────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !document.hidden) start(); else stop();
  }, { threshold: 0.01 });
  io.observe(hero);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stop(); return; }
    const r = hero.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) start();
  });

  /* ── Resize ───────────────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    w = canvas.clientWidth  || hero.clientWidth;
    h = canvas.clientHeight || hero.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    H = halfExtents();
  }, { passive: true });

  /* ── Live reduced-motion switch: freeze + show static gradient ────── */
  mqReduce.addEventListener('change', (e) => {
    if (e.matches) {
      stop();
      hero.classList.remove('webgl-active');
      hero.classList.add('fallback-active');
    }
  });

  // First paint (IntersectionObserver will start the loop since the hero
  // is on screen at load).
  renderer.render(scene, camera);
  }
}());
