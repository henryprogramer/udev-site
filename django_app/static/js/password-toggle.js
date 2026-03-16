(function () {
  function toggleField(field, trigger) {
    if (!field) return;
    var isPassword = field.getAttribute('type') === 'password';
    field.setAttribute('type', isPassword ? 'text' : 'password');
    if (trigger) {
      trigger.classList.toggle('is-open', isPassword);
      trigger.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
      trigger.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
      var sr = trigger.querySelector('.sr-only');
      if (sr) {
        sr.textContent = isPassword ? 'Ocultar senha' : 'Mostrar senha';
      }
    }
  }

  document.querySelectorAll('[data-password-toggle]').forEach(function (button) {
    var targetId = button.getAttribute('data-password-toggle');
    var field = document.getElementById(targetId);
    button.addEventListener('click', function () {
      toggleField(field, button);
    });
  });
})();
