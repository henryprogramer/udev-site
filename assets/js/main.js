(function () {
  "use strict";

  const externalLinks = window.UDEV_LINKS || {};

  function applyExternalLinks() {
    const elements = document.querySelectorAll("[data-link-key]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-link-key");
      const targetUrl = externalLinks[key];

      if (!targetUrl) {
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

  function setupRevealAnimations() {
    const revealElements = document.querySelectorAll("[data-reveal]");

    if (!revealElements.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  function setupNewsletterForm() {
    const form = document.querySelector(".js-newsletter-form");
    const input = document.querySelector(".js-newsletter-email");

    if (!form || !input) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const dynamicEmailLink = document.querySelector(".js-company-email-link");
      const emailLink = (dynamicEmailLink && dynamicEmailLink.getAttribute("href")) || "";

      if (!emailLink.startsWith("mailto:")) {
        return;
      }

      if (!input.value || !input.checkValidity()) {
        input.reportValidity();
        return;
      }

      const message = encodeURIComponent(
        "Olá, quero receber novidades da Udev. Meu e-mail para contato é: " +
          input.value.trim()
      );

      const separator = emailLink.includes("?") ? "&" : "?";
      window.location.href =
        emailLink + separator + "subject=Newsletter%20Udev&body=" + message;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyExternalLinks();
    applyCurrentYear();
    setupRevealAnimations();
    setupNewsletterForm();
  });
})();
