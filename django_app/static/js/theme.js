(function () {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const logos = document.querySelectorAll('.theme-logo');

  function applyTheme(theme) {
    const selected = theme === 'light' ? 'light' : 'dark';
    root.setAttribute('data-theme', selected);
    window.localStorage.setItem('udev-theme', selected);

    logos.forEach((img) => {
      const darkSrc = img.getAttribute('data-dark-src');
      const lightSrc = img.getAttribute('data-light-src');
      img.src = selected === 'light' ? lightSrc : darkSrc;
    });

    if (toggle) {
      toggle.textContent = selected === 'light' ? 'Dark Mode' : 'Light Mode';
    }
  }

  const persisted = window.localStorage.getItem('udev-theme');
  const preferred =
    persisted ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

  applyTheme(preferred);

  if (toggle) {
    toggle.addEventListener('click', function () {
      const current = root.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
})();
