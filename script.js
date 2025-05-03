/* ========= 1. HERO GRADIENT CANVAS ========= */
/* simple animated gradient inspired by CSS-Tricks  */
const c = document.getElementById('gradient-canvas');
const ctx = c.getContext('2d');
let w, h, t = 0;
function resize(){ w = c.width = window.innerWidth; h = c.height = window.innerHeight }
resize(); window.addEventListener('resize', resize);

function draw(){
  t += .003;
  for(let i=0;i<h;i++){
    const gradient = Math.floor(128 + 128 * Math.sin(i*0.02 + t));
    ctx.fillStyle = `rgb(${gradient},${255-gradient},${200})`;
    ctx.fillRect(0,i,w,1);
  }
  requestAnimationFrame(draw);
}
draw();

/* ========= 2. SCROLL REVEAL with IntersectionObserver ========= */
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('anim-show');
      observer.unobserve(entry.target);
    }
  });
},{threshold:.15});

document.querySelectorAll('.anim-fade, .anim-up, .anim-scale').forEach(el=>observer.observe(el));
/* ========= 2. SCROLL REVEAL with IntersectionObserver ========= */
const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('anim-show');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.15});
  
  document.querySelectorAll('.anim-fade, .anim-up, .anim-scale')
          .forEach(el=>observer.observe(el));
  
  /* ===  NEW: révéler aussitôt les éléments déjà dans le viewport  === */
  function revealInitial(){
    document.querySelectorAll('.anim-fade, .anim-up, .anim-scale').forEach(el=>{
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * .85) el.classList.add('anim-show');
    });
  }
  revealInitial();                // au 1er chargement
  window.addEventListener('resize', revealInitial);   // si viewport change
  
