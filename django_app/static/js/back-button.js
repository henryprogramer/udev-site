(function () {
  const backButton = document.getElementById('back-button');
  if (!backButton) return;

  const fallback = backButton.getAttribute('data-fallback') || '/';
  const hasHistory = window.history.length > 1;

  if (!hasHistory) {
    backButton.setAttribute('hidden', '');
  }

  backButton.addEventListener('click', function () {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = fallback;
  });
})();
