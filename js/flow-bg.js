/* ============================================================
   flow-bg.js — "imagen viva": el render real de IA, en movimiento
   ------------------------------------------------------------
   Toma el still de alta calidad (tu render) y le aplica un shader
   de domain-warp muy sutil: el cristal fluye/respira de forma
   orgánica, en bucle perpetuo, sin saltos. Conserva la calidad
   del render porque el fotograma base ES la imagen real.
   ============================================================ */
import * as THREE from "three";

export function initFlow(canvas, imgUrl, opts = {}) {
  const amp = opts.amp ?? 1.0;        // intensidad del oleaje (sutil)
  const focus = opts.focus ?? 0.6;    // centro del "respiro"
  const hue = opts.hue ?? 0.0;        // giro de tono (variedad por slide, en rad)
  const zoom = opts.zoom ?? 1.0;      // acercamiento del encuadre

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTex:  { value: null },
    uTime: { value: 0 },
    uImgA: { value: 1 },
    uCanA: { value: 1 },
    uAmp:  { value: amp },
    uFocus:{ value: focus },
  };

  const tex = new THREE.TextureLoader().load(imgUrl, () => resize());
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  uniforms.uTex.value = tex;

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTex;
      uniform float uTime, uImgA, uCanA, uAmp, uFocus;

      // emula object-fit: cover
      vec2 cover(vec2 uv) {
        vec2 s = vec2(1.0);
        if (uCanA > uImgA) s.y = uImgA / uCanA;
        else               s.x = uCanA / uImgA;
        return (uv - 0.5) * s + 0.5;
      }

      void main() {
        float t = uTime * 0.15;
        vec2 uv = vUv;

        // respiración lenta alrededor del foco
        vec2 c = vec2(uFocus, 0.5);
        float sc = 1.0 + 0.012 * sin(t * 0.6);
        uv = c + (uv - c) / sc;

        // domain-warp: oleaje de cristal, muy sutil
        vec2 d;
        d.x = (sin(uv.y * 6.0 + t) * 0.0040 + sin(uv.y * 13.0 - t * 1.3) * 0.0016) * uAmp;
        d.y = (cos(uv.x * 5.0 - t * 0.9) * 0.0040 + cos(uv.x * 11.0 + t) * 0.0016) * uAmp;

        vec3 col = texture2D(uTex, cover(uv + d)).rgb;

        // leve destello de luz que recorre la pieza
        col *= 1.0 + 0.03 * sin(t * 0.8 + uv.x * 3.0);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    uniforms.uCanA.value = w / h;
    if (tex.image) uniforms.uImgA.value = tex.image.width / tex.image.height;
  }
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf, t0 = performance.now();
  function loop() {
    raf = requestAnimationFrame(loop);
    uniforms.uTime.value = reduce ? 0 : (performance.now() - t0) / 1000;
    renderer.render(scene, camera);
  }
  loop();

  return { stop() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); } };
}
