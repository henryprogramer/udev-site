(function () {
  "use strict";

  const externalLinks = window.UDEV_LINKS || {};

  function applyExternalLinks() {
    const elements = document.querySelectorAll("[data-link-key]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-link-key");
      const targetUrl = externalLinks[key];

      if (!targetUrl) {
        console.warn("Link não configurado para:", key);
        return;
      }

      element.setAttribute("href", targetUrl);
    });
  }

  function applyCurrentYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll(".js-year").forEach((el) => {
      el.textContent = year;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyExternalLinks();
    applyCurrentYear();
  });
})();
