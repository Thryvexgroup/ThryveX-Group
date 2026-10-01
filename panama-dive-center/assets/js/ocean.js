/* Ocean: one continuous WebGL scene behind the whole page.
   Sun rays and caustics near the surface, marine snow and darkness as you descend.
   Driven by a single depth value (0 = surface, 1 = 40 m) that main.js sets from scroll. */
(function () {
  const canvas = document.getElementById('ocean');
  const fallback = document.getElementById('ocean-fallback');
  if (!canvas) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });

  const api = { depth: 0, targetDepth: 0, mouse: [0.5, 0.5], setDepth(d) { api.targetDepth = Math.max(0, Math.min(1, d)); }, setMouse(x, y) { api.mouse = [x, y]; } };
  window.Ocean = api;

  if (!gl) { canvas.remove(); fallback && fallback.classList.add('is-on'); return; }

  const vert = `
    attribute vec2 p; varying vec2 v;
    void main(){ v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

  const frag = `
    precision mediump float;
    varying vec2 v;
    uniform float uTime; uniform vec2 uRes; uniform float uDepth; uniform vec2 uMouse;

    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }

    vec3 pal(float d, float y){
      // four stops from surface to abyss, each with a top and bottom colour
      vec3 sT = vec3(0.184, 0.655, 0.788), sB = vec3(0.043, 0.361, 0.510);
      vec3 hT = vec3(0.043, 0.361, 0.510), hB = vec3(0.024, 0.188, 0.310);
      vec3 mT = vec3(0.024, 0.188, 0.310), mB = vec3(0.012, 0.094, 0.169);
      vec3 aT = vec3(0.012, 0.094, 0.169), aB = vec3(0.008, 0.043, 0.086);
      vec3 top, bot;
      if (d < 0.33){ float t = d/0.33; top = mix(sT, hT, t); bot = mix(sB, hB, t); }
      else if (d < 0.66){ float t = (d-0.33)/0.33; top = mix(hT, mT, t); bot = mix(hB, mB, t); }
      else { float t = (d-0.66)/0.34; top = mix(mT, aT, t); bot = mix(mB, aB, t); }
      return mix(bot, top, y);
    }

    void main(){
      vec2 uv = v; float asp = uRes.x / uRes.y;
      float t = uTime;
      vec2 m = (uMouse - 0.5) * 0.04;
      float light = pow(1.0 - uDepth, 1.6);

      vec3 col = pal(uDepth, uv.y + m.y);

      // sun rays: fan out from a point above the top edge
      vec2 sun = vec2(0.62 + m.x, 1.25);
      vec2 dir = uv - sun; float ang = atan(dir.x, -dir.y);
      float rays = 0.0;
      rays += pow(max(0.0, sin(ang * 18.0 + t * 0.35)), 6.0) * 0.55;
      rays += pow(max(0.0, sin(ang * 31.0 - t * 0.22 + 1.7)), 9.0) * 0.35;
      rays += pow(max(0.0, sin(ang * 9.0 + t * 0.12 + 0.4)), 3.0) * 0.25;
      float fall = smoothstep(0.0, 1.0, uv.y) * smoothstep(1.6, 0.2, length(dir));
      rays *= fall * light;
      col += vec3(0.55, 0.85, 0.95) * rays * 0.35;

      // caustics: ripple network near the surface
      vec2 cu = vec2(uv.x * asp, uv.y) * 6.0 + m * 6.0;
      float c1 = sin(cu.x * 1.3 + t * 0.9 + sin(cu.y * 1.7 + t * 0.6));
      float c2 = sin(cu.y * 1.1 - t * 0.7 + sin(cu.x * 1.9 - t * 0.5));
      float c3 = sin((cu.x + cu.y) * 0.8 + t * 0.4);
      float ca = pow(abs(c1 * c2 * 0.5 + c3 * 0.5), 3.5);
      float caMask = smoothstep(0.35, 1.0, uv.y) * light * light;
      col += vec3(0.5, 0.9, 1.0) * ca * caMask * 0.22;

      // marine snow: drifting particles, denser as you go down
      float snow = 0.0;
      for (int i = 0; i < 3; i++){
        float fi = float(i);
        float sc = 14.0 + fi * 9.0;
        vec2 gp = vec2(uv.x * asp, uv.y) * sc + vec2(fi * 7.3, t * (0.04 + fi * 0.02));
        vec2 cell = floor(gp); vec2 f = fract(gp);
        float h = hash(cell + fi);
        vec2 pos = vec2(hash(cell * 1.7 + fi), hash(cell * 2.3 + fi * 3.1));
        pos.x += sin(t * 0.6 + h * 6.28) * 0.08;
        float d = length(f - pos);
        float r = 0.02 + h * 0.03;
        snow += smoothstep(r, 0.0, d) * step(0.55 + fi * 0.08, h) * (0.35 - fi * 0.08);
      }
      float snowAmt = mix(0.35, 1.0, uDepth);
      col += vec3(0.75, 0.9, 0.95) * snow * snowAmt * 0.6;

      // soft volumetric haze
      float haze = noise(vec2(uv.x * asp * 2.0 + t * 0.05, uv.y * 2.0 - t * 0.03)) * 0.06;
      col += haze * (0.3 + light * 0.7);

      // vignette
      float vig = smoothstep(1.35, 0.35, length((uv - 0.5) * vec2(asp, 1.0)));
      col *= mix(0.78, 1.0, vig);

      gl_FragColor = vec4(col, 1.0);
    }`;

  function compile(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, vert), fs = compile(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) { canvas.remove(); fallback && fallback.classList.add('is-on'); return; }
  const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, 'uTime'), uRes = gl.getUniformLocation(prog, 'uRes'), uDepth = gl.getUniformLocation(prog, 'uDepth'), uMouse = gl.getUniformLocation(prog, 'uMouse');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.7;
    const w = Math.floor(window.innerWidth * dpr), h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  let start = performance.now(), running = true, lastDraw = 0;
  function draw(now) {
    if (!running) return;
    requestAnimationFrame(draw);
    if (now - lastDraw < 1000 / 45) return; // cap at ~45fps, it is a background
    lastDraw = now;
    api.depth += (api.targetDepth - api.depth) * 0.08;
    const t = reduced ? 0 : (now - start) / 1000;
    gl.uniform1f(uTime, t); gl.uniform2f(uRes, canvas.width, canvas.height); gl.uniform1f(uDepth, api.depth); gl.uniform2f(uMouse, api.mouse[0], api.mouse[1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  requestAnimationFrame(draw);

  document.addEventListener('visibilitychange', () => {
    const vis = document.visibilityState === 'visible';
    if (vis && !running) { running = true; start = performance.now() - 0; requestAnimationFrame(draw); }
    if (!vis) running = false;
  });

  if (!reduced) {
    let mx = 0.5, my = 0.5;
    window.addEventListener('pointermove', (e) => { mx = e.clientX / window.innerWidth; my = 1 - e.clientY / window.innerHeight; api.setMouse(mx, my); }, { passive: true });
  }
})();
