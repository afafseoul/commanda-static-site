/* ========= 1. HERO GRADIENT CANVAS ========= */
const canvas = document.getElementById('gradient-canvas');
const ctx = canvas.getContext('2d');
let w, h, t = 0;

function resize() {
  w = canvas.width  = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function draw() {
  t += 0.003;
  for (let i = 0; i < h; i++) {
    const g = Math.floor(128 + 128 * Math.sin(i * 0.02 + t));
    ctx.fillStyle = `rgb(${g}, ${255 - g}, 200)`;
    ctx.fillRect(0, i, w, 1);
  }
  requestAnimationFrame(draw);
}
draw();

/* ========= 2. SCROLL‑REVEAL ========= */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('anim-show');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

const revealables = document.querySelectorAll('.anim-fade, .anim-up, .anim-scale');
revealables.forEach(el => observer.observe(el));

/* == Révéler immédiatement ce qui est déjà dans le viewport (ex : ancre #features) == */
function revealInitial() {
  revealables.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.85) el.classList.add('anim-show');
  });
}
revealInitial();
window.addEventListener('resize', revealInitial);
