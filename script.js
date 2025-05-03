// Observer pour les animations au scroll
const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // animation une seule fois
        }
      });
    },
    {
      threshold: 0.15
    }
  );
  
  // Cible tous les éléments avec la classe fade-in
  document.querySelectorAll(".fade-in").forEach(el => {
    observer.observe(el);
  });
  