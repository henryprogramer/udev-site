(() => {
  const targets = document.querySelectorAll('.reveal-on-scroll');
  if (!targets.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  targets.forEach((el) => observer.observe(el));
})();
