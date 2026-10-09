/* ============================================================
   aurora-bg.js — fondo "aurora de cristal" global y animado
   ------------------------------------------------------------
   Shader WebGL fullscreen: gradiente fluido iridiscente (blanco →
   azul → violeta → cian) que se mueve lento y en bucle. Sesgado a
   blanco en la mitad izquierda para que el texto siempre sea legible.
   Una sola instancia detrás de todas las slides → coherencia total.
   ============================================================ */
import * as THREE from "three";

export function initAurora(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(1);   // ligero: el fondo no necesita retina

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uRes:  { value: new THREE.Vector2(1, 1) },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position,1.0);}`,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime; uniform vec2 uRes;

      float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
        return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
      }
      float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<3;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }

      void main(){
        vec2 uv = vUv;
        float asp = uRes.x / max(uRes.y, 1.0);
        vec2 p = vec2(uv.x*asp, uv.y);
        float t = uTime*0.025;

        vec2 q = vec2(fbm(p*2.6 + t), fbm(p*2.6 + vec2(5.2,1.3) - t));
        float n = fbm(p*2.6 + q*1.6 + t*0.5);

        vec3 white  = vec3(0.965,0.975,1.0);
        vec3 blue   = vec3(0.29,0.48,0.98);
        vec3 violet = vec3(0.56,0.44,0.95);
        vec3 cyan   = vec3(0.32,0.80,0.96);

        vec3 col = mix(white, blue,   smoothstep(0.30,0.85,n));
        col = mix(col, violet, smoothstep(0.45,0.95,q.x)*0.9);
        col = mix(col, cyan,   smoothstep(0.60,1.00,q.y)*0.55);

        // halo brillante que deriva
        float glow = smoothstep(0.55, 0.0, distance(uv, vec2(0.74,0.42) + 0.06*vec2(sin(t), cos(t*0.8))));
        col += glow*0.12;

        // sesgo a blanco en la izquierda (zona de texto)
        float leftFade = smoothstep(0.02, 0.62, uv.x);
        col = mix(white, col, leftFade);

        // suavizar intensidad global (aireado)
        col = mix(white, col, 0.9);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
  }
  window.addEventListener("resize", resize);
  resize();

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf, t0 = performance.now();
  function loop() {
    raf = requestAnimationFrame(loop);
    uniforms.uTime.value = reduce ? 0 : (performance.now() - t0) / 1000;
    renderer.render(scene, camera);
  }
  loop();

  return { stop() { cancelAnimationFrame(raf); renderer.dispose(); } };
}
