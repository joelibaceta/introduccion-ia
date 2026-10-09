/* ============================================================
   deck.js — inicialización de reveal.js + partículas
   ============================================================ */

/* ---------- Reveal ---------- */
Reveal.initialize({
  width: 1920,
  height: 1080,
  margin: 0,
  minScale: 0.2,
  maxScale: 2.0,
  controls: true,
  progress: true,
  hash: true,
  transition: "fade",      // transición suave y elegante
  transitionSpeed: "slow",
  backgroundTransition: "fade",
});

/* ---------- Partículas (estética etérea, sutil) ---------- */
/* Paleta clara: puntos blancos/azules flotando lento, con enlaces
   tenues. Pensado para leerse como "premium", no como screensaver. */
const particlePreset = {
  fpsLimit: 60,
  detectRetina: true,
  background: { color: "transparent" },
  particles: {
    number: { value: 55, density: { enable: true, area: 1000 } },
    color: { value: ["#4b7bff", "#8a6bf0", "#ffffff"] },
    opacity: {
      value: { min: 0.15, max: 0.55 },
      animation: { enable: true, speed: 0.6, sync: false },
    },
    size: { value: { min: 1, max: 3.2 } },
    links: {
      enable: true,
      distance: 150,
      color: "#9db6ff",
      opacity: 0.25,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.6,
      direction: "none",
      random: true,
      straight: false,
      outModes: { default: "out" },
    },
  },
  interactivity: {
    events: { onHover: { enable: true, mode: "grab" } },
    modes: { grab: { distance: 160, links: { opacity: 0.4 } } },
  },
};

async function initParticles() {
  if (typeof tsParticles === "undefined") return;
  // una sola instancia global de fondo
  tsParticles.load({ id: "bg-particles", options: particlePreset });
}

window.addEventListener("load", initParticles);
