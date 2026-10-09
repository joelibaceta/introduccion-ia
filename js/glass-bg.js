/* ============================================================
   glass-bg.js — fondo de CRISTAL generativo en movimiento
   three.js · nudo translúcido iridiscente, loop infinito
   ------------------------------------------------------------
   No usa ningún modelo externo: es un render 3D en tiempo real
   con la misma estética que la referencia (glass azul/violeta,
   fondo claro), girando de forma lenta y sutil.
   ============================================================ */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/* textura de respaldo: degradado claro (blanco → lavanda) para
   que el cristal transmita luz y se vea aireado, no oscuro. */
function gradientTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d").createLinearGradient(0, 0, 512, 512);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.55, "#eef1fb");
  g.addColorStop(1, "#e3ddfb");
  const ctx = c.getContext("2d");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function initGlass(canvas, opts = {}) {
  const {
    p = 2, q = 3,             // parámetros del nudo (varían por slide)
    tube = 0.42,
    tint = 0xcdddff,          // tinte del vidrio
    attenuation = 0x4b7bff,   // color de absorción interna
    speed = 0.12,             // velocidad de giro (sutil)
  } = opts;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  // reflejos de estudio
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // plano de respaldo claro (para transmisión aireada)
  const backing = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshBasicMaterial({ map: gradientTexture() })
  );
  backing.position.z = -6;
  scene.add(backing);

  // el nudo de cristal
  const geo = new THREE.TorusKnotGeometry(1.15, tube, 320, 48, p, q);
  const mat = new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0,
    roughness: 0.04,
    transmission: 1,
    thickness: 1.8,
    ior: 1.35,
    iridescence: 1,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [130, 520],
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    attenuationColor: new THREE.Color(attenuation),
    attenuationDistance: 2.6,
    envMapIntensity: 1.5,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // luces suaves de alto rango
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x8a6bf0, 1.4); rim.position.set(-4, -2, -3); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));

  // bloom para el brillo etéreo
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.45, 0.6, 0.9));
  composer.addPass(new OutputPass());

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t = 0, raf;
  function loop() {
    raf = requestAnimationFrame(loop);
    if (!reduce) {
      t += 0.01 * speed;
      mesh.rotation.y = t;
      mesh.rotation.x = Math.sin(t * 0.6) * 0.22;
      mesh.rotation.z = Math.cos(t * 0.4) * 0.12;
    }
    composer.render();
  }
  loop();

  return {
    stop() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); },
  };
}
