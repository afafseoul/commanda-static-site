// Optional scroll reveal or animations
document.querySelectorAll(".card, .price-card").forEach((el) => {
    el.style.opacity = 0;
    el.style.transform = "translateY(30px)";
  });
  
  window.addEventListener("scroll", () => {
    document.querySelectorAll(".card, .price-card").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.style.opacity = 1;
        el.style.transform = "translateY(0)";
        el.style.transition = "all 0.8s ease-out";
      }
    });
  });
  