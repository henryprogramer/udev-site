(function () {
  "use strict";

  const links = window.UDEV_LINKS || {};
  const FALLBACK_CONTENT_URL = "/assets/data/site-content.json";
  const PREVIEW_STORAGE_KEY = "udev_site_preview_content";

  function safeText(value, fallback) {
    if (value === undefined || value === null || value === "") {
      return fallback || "";
    }

    return String(value);
  }

  function escapeHtml(value) {
    return safeText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setTextAll(selector, value) {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = safeText(value);
    });
  }

  function setLinkAll(selector, href, fallbackLabel) {
    document.querySelectorAll(selector).forEach((element) => {
      if (href) {
        element.setAttribute("href", href);
      }

      if (fallbackLabel && !element.textContent.trim()) {
        element.textContent = fallbackLabel;
      }
    });
  }

  function driveDirectUrl(fileId) {
    return "https://drive.google.com/uc?export=download&id=" + encodeURIComponent(fileId);
  }

  async function tryLoadJson(url) {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Falha ao carregar " + url + " (" + response.status + ")");
    }

    return response.json();
  }

  async function loadContent() {
    const params = new URLSearchParams(window.location.search);

    if (params.get("preview") === "1") {
      const preview = localStorage.getItem(PREVIEW_STORAGE_KEY);

      if (preview) {
        try {
          return JSON.parse(preview);
        } catch (error) {
          console.warn("Rascunho de preview inválido:", error);
        }
      }
    }

    const candidates = [];

    if (links.publicContentDriveFileId) {
      candidates.push(driveDirectUrl(links.publicContentDriveFileId));
    }

    if (links.publicContentUrl) {
      candidates.push(links.publicContentUrl);
    }

    if (!candidates.includes(FALLBACK_CONTENT_URL)) {
      candidates.push(FALLBACK_CONTENT_URL);
    }

    for (const url of candidates) {
      try {
        const data = await tryLoadJson(url);

        if (data && typeof data === "object") {
          return data;
        }
      } catch (error) {
        console.warn("Conteúdo não carregado em:", url, error);
      }
    }

    return null;
  }

  function getVisibleProducts(content) {
    if (!Array.isArray(content.products)) {
      return [];
    }

    return content.products.filter((product) => product && product.visible !== false);
  }

  function buildProductCard(product) {
    const imageUrl = safeText(product.imageUrl);
    const imageSection = imageUrl
      ? '<div class="catalog-image" style="background-image:url(\'' + escapeHtml(imageUrl) + '\')"></div>'
      : "";

    const onlineButton = product.onlineUrl
      ? '<a class="btn btn-secondary" target="_blank" rel="noopener noreferrer" href="' +
        escapeHtml(product.onlineUrl) +
        '">Acessar online</a>'
      : "";

    const downloadButton = product.downloadUrl
      ? '<a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="' +
        escapeHtml(product.downloadUrl) +
        '">Download</a>'
      : "";

    return (
      '<article class="panel item-card">' +
      imageSection +
      '<p class="eyebrow">' +
      escapeHtml(safeText(product.category, "Produto")) +
      "</p>" +
      "<h3>" +
      escapeHtml(safeText(product.name, "Produto")) +
      "</h3>" +
      "<p>" +
      escapeHtml(safeText(product.description, "Sem descrição.")) +
      "</p>" +
      '<div class="card-actions">' +
      downloadButton +
      onlineButton +
      "</div>" +
      "</article>"
    );
  }

  function buildBannerCard(banner) {
    const imageUrl = safeText(banner.imageUrl);
    const imageSection = imageUrl
      ? '<div class="catalog-image" style="background-image:url(\'' + escapeHtml(imageUrl) + '\')"></div>'
      : "";

    const ctaUrl = safeText(banner.ctaUrl, "#");

    return (
      '<article class="panel quick-card banner-card">' +
      imageSection +
      '<p class="eyebrow">' +
      escapeHtml(safeText(banner.tag, "Banner")) +
      "</p>" +
      "<h3>" +
      escapeHtml(safeText(banner.title, "Comunicado")) +
      "</h3>" +
      "<p>" +
      escapeHtml(safeText(banner.description, "Sem descrição.")) +
      "</p>" +
      '<a class="text-link" href="' +
      escapeHtml(ctaUrl) +
      '">' +
      escapeHtml(safeText(banner.ctaLabel, "Ver mais")) +
      "</a>" +
      "</article>"
    );
  }

  function fillHome(content) {
    setTextAll(".js-hero-eyebrow", safeText(content.hero && content.hero.eyebrow, "Startup de software"));
    setTextAll(
      ".js-hero-headline",
      safeText(content.hero && content.hero.headline, "Soluções inteligentes em software e tecnologia")
    );
    setTextAll(
      ".js-hero-subheadline",
      safeText(content.hero && content.hero.subheadline, "A Udev cria produtos digitais com foco em resultado.")
    );

    const banners = Array.isArray(content.banners) ? content.banners : [];
    const bannerContainer = document.getElementById("js-banner-list");

    if (bannerContainer) {
      if (banners.length) {
        bannerContainer.innerHTML = banners.map(buildBannerCard).join("");
      } else {
        bannerContainer.innerHTML =
          '<article class="panel quick-card"><h3>Sem banners cadastrados</h3><p>Use a área da empresa para publicar novos banners.</p></article>';
      }
    }

    const products = getVisibleProducts(content);
    const featured = products.filter((product) => product.featured);
    const featuredProducts = featured.length ? featured : products.slice(0, 3);
    const featuredContainer = document.getElementById("js-featured-products");

    if (featuredContainer) {
      if (featuredProducts.length) {
        featuredContainer.innerHTML = featuredProducts.map(buildProductCard).join("");
      } else {
        featuredContainer.innerHTML =
          '<article class="panel quick-card"><h3>Sem produtos cadastrados</h3><p>A empresa ainda não publicou itens na prateleira digital.</p></article>';
      }
    }

    const testimonial = Array.isArray(content.testimonials) && content.testimonials[0];

    if (testimonial) {
      const rating = Math.max(1, Math.min(5, Number(testimonial.rating) || 5));
      setTextAll(".js-testimonial-stars", "★".repeat(rating) + "☆".repeat(5 - rating));
      setTextAll(".js-testimonial-quote", "\u201c" + safeText(testimonial.quote) + "\u201d");
      setTextAll(".js-testimonial-name", safeText(testimonial.name));
      setTextAll(".js-testimonial-role", safeText(testimonial.role));
    }
  }

  function fillVendapro(content) {
    const products = getVisibleProducts(content);
    const vendapro =
      products.find((product) => product.id === "vendapro-saas") ||
      products.find((product) => /vendapro/i.test(safeText(product.name))) ||
      products[0];

    if (vendapro) {
      setTextAll(".js-vendapro-name", safeText(vendapro.name, "VendaPro"));
      setTextAll(".js-vendapro-subtitle", safeText(vendapro.subtitle, "Plataforma web comercial"));
      setTextAll(
        ".js-vendapro-description",
        safeText(vendapro.description, "Solução para gestão comercial e automação operacional.")
      );

      const downloadButton = document.getElementById("js-vendapro-download");
      const onlineButton = document.getElementById("js-vendapro-online");

      if (downloadButton && vendapro.downloadUrl) {
        downloadButton.setAttribute("href", vendapro.downloadUrl);
      }

      if (onlineButton && vendapro.onlineUrl) {
        onlineButton.setAttribute("href", vendapro.onlineUrl);
      }
    }

    const relatedContainer = document.getElementById("js-vendapro-related-products");

    if (relatedContainer) {
      const relatedProducts = products.filter((product) => !vendapro || product.id !== vendapro.id).slice(0, 3);

      if (relatedProducts.length) {
        relatedContainer.innerHTML = relatedProducts.map(buildProductCard).join("");
      } else {
        relatedContainer.innerHTML =
          '<article class="panel quick-card"><h3>Sem produtos relacionados</h3><p>Cadastre novos produtos na área da empresa.</p></article>';
      }
    }
  }

  function fillDownloads(content) {
    const products = getVisibleProducts(content);
    const container = document.getElementById("js-download-products");

    if (!container) {
      return;
    }

    if (!products.length) {
      container.innerHTML =
        '<article class="panel item-card"><h3>Sem downloads cadastrados</h3><p>Use a área da empresa para adicionar produtos e links de download.</p></article>';
      return;
    }

    container.innerHTML = products.map(buildProductCard).join("");
  }

  function fillContact(content) {
    const company = (content.contacts && content.contacts.company) || {};
    const developer = (content.contacts && content.contacts.developer) || {};

    setTextAll(".js-company-name", safeText(company.name, "UDEV - StartUP"));
    setTextAll(".js-company-email-text", safeText(company.email, "udev.oficial@gmail.com"));
    setTextAll(".js-company-whatsapp-text", safeText(company.whatsapp, "+55 (63) 98441-2348"));

    const companyEmailHref = "mailto:" + safeText(company.email, "udev.oficial@gmail.com");
    setLinkAll(".js-company-email-link", companyEmailHref);
    setLinkAll(
      ".js-company-whatsapp-link",
      safeText(company.whatsappUrl, links.whatsapp || "https://wa.me/5563984412348")
    );
    setLinkAll(
      ".js-company-instagram-link",
      safeText(company.instagram, links.instagram || "https://www.instagram.com/udev.oficial/")
    );

    setTextAll(".js-dev-name", safeText(developer.name, "Pedro Henrique Santos Silva"));
    setTextAll(".js-dev-role", safeText(developer.role, "Desenvolvedor / CO-CEO"));
    setTextAll(".js-dev-email-text", safeText(developer.email, "pedrohenrique.dev.contato@gmail.com"));
    setTextAll(".js-dev-phone", safeText(developer.phone, "+55 (63) 98441-2348"));
    setLinkAll(".js-dev-email-link", "mailto:" + safeText(developer.email, "pedrohenrique.dev.contato@gmail.com"));
  }

  function applyByPage(content) {
    const page = document.body.getAttribute("data-page") || "";

    fillContact(content);

    if (page === "home") {
      fillHome(content);
      return;
    }

    if (page === "vendapro") {
      fillVendapro(content);
      return;
    }

    if (page === "downloads") {
      fillDownloads(content);
      return;
    }
  }

  document.addEventListener("DOMContentLoaded", async function () {
    const content = await loadContent();

    if (!content) {
      return;
    }

    applyByPage(content);
  });
})();
