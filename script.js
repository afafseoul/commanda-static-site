// Gradient Animation (déjà en CSS)

// Scroll-Reveal animation
const revealEls = document.querySelectorAll('.reveal');

const revealConfig = {
  root: null,
  rootMargin: '0px',
  threshold: 0.2
};

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      obs.unobserve(entry.target);
    }
  });
}, revealConfig);

revealEls.forEach(el => observer.observe(el));
