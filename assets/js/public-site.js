(function () {
  "use strict";

  const links = window.UDEV_LINKS || {};
  const PREVIEW_STORAGE_KEY = "udev_site_preview_content";

  function safe(value, fallback) {
    if (value === undefined || value === null || value === "") {
      return fallback || "";
    }

    return String(value);
  }

  function setTextAll(selector, value) {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = safe(value);
    });
  }

  function setHrefAll(selector, href) {
    document.querySelectorAll(selector).forEach((el) => {
      el.setAttribute("href", safe(href, "#"));
    });
  }

  function escapeHtml(value) {
    return safe(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function driveDownloadUrl(fileId) {
    return "https://drive.google.com/uc?export=download&id=" + encodeURIComponent(fileId);
  }

  function absoluteUrl(url) {
    const raw = safe(url);

    if (!raw) {
      return "#";
    }

    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("mailto:") || raw.startsWith("tel:")) {
      return raw;
    }

    return raw;
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Falha ao carregar conteúdo (" + response.status + ").");
    }

    return response.json();
  }

  async function loadRawContent() {
    const params = new URLSearchParams(window.location.search);

    if (params.get("preview") === "1") {
      const preview = localStorage.getItem(PREVIEW_STORAGE_KEY);

      if (preview) {
        try {
          return JSON.parse(preview);
        } catch (error) {
          console.warn("Preview inválido", error);
        }
      }
    }

    const runtimeApiBase = localStorage.getItem("udev_site_api_base_url") || links.apiBaseUrl;

    if (runtimeApiBase) {
      try {
        return await fetchJson(String(runtimeApiBase).replace(/\/$/, "") + "/api/content");
      } catch (error) {
        console.warn("Falha no conteúdo da API", error);
      }
    }

    if (links.publicContentDriveFileId) {
      try {
        return await fetchJson(driveDownloadUrl(links.publicContentDriveFileId));
      } catch (error) {
        console.warn("Falha no conteúdo do Drive", error);
      }
    }

    if (links.publicContentUrl) {
      try {
        return await fetchJson(links.publicContentUrl);
      } catch (error) {
        console.warn("Falha no conteúdo local", error);
      }
    }

    return null;
  }

  function normalizeContent(raw) {
    const data = raw && typeof raw === "object" ? raw : {};

    const legacyContacts = data.contacts || {};

    return {
      meta: Object.assign({ published: false }, data.meta || {}),
      hero: Object.assign(
        {
          eyebrow: "",
          headline: "",
          subheadline: "",
          points: []
        },
        data.hero || {}
      ),
      company: Object.assign(
        {
          name: "",
          summary: "",
          email: "",
          instagram: "",
          whatsapp: "",
          whatsappUrl: ""
        },
        data.company || legacyContacts.company || {}
      ),
      support: Object.assign(
        {
          email: "",
          phone: "",
          hours: ""
        },
        data.support || {}
      ),
      developer: Object.assign(
        {
          name: "",
          role: "",
          email: "",
          phone: ""
        },
        data.developer || legacyContacts.developer || {}
      ),
      sales: Object.assign(
        {
          line: ""
        },
        data.sales || {}
      ),
      services: Array.isArray(data.services) ? data.services : [],
      banners: Array.isArray(data.banners) ? data.banners : [],
      products: Array.isArray(data.products) ? data.products : []
    };
  }

  function hasPublicContent(content) {
    if (!content || !content.meta || content.meta.published !== true) {
      return false;
    }

    if (!safe(content.company.name)) {
      return false;
    }

    if (
      !safe(content.hero.headline) &&
      !content.products.length &&
      !content.banners.length &&
      !content.services.length
    ) {
      return false;
    }

    return true;
  }

  function blankPage() {
    document.body.innerHTML = "";
    document.body.style.background = "#ffffff";
  }

  function productDownloadHref(product) {
    if (product.driveFileId) {
      return driveDownloadUrl(product.driveFileId);
    }

    return "";
  }

  function visibleProducts(content) {
    return content.products.filter((item) => item && item.visible !== false);
  }

  function buildProductCard(product) {
    const image = safe(product.imageUrl)
      ? '<div class="catalog-image" style="background-image:url(\'' + escapeHtml(product.imageUrl) + '\')"></div>'
      : "";

    const downloadHref = productDownloadHref(product);
    const downloadButton = downloadHref
      ? '<a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="' +
        escapeHtml(downloadHref) +
        '">Download</a>'
      : "";

    const onlineButton = product.onlineUrl
      ? '<a class="btn btn-secondary" target="_blank" rel="noopener noreferrer" href="' +
        escapeHtml(absoluteUrl(product.onlineUrl)) +
        '">Acessar online</a>'
      : "";

    return (
      '<article class="panel item-card">' +
      image +
      '<p class="eyebrow">' +
      escapeHtml(safe(product.category)) +
      "</p>" +
      "<h3>" +
      escapeHtml(safe(product.name)) +
      "</h3>" +
      "<p>" +
      escapeHtml(safe(product.description)) +
      "</p>" +
      '<div class="card-actions">' +
      downloadButton +
      onlineButton +
      "</div>" +
      "</article>"
    );
  }

  function buildSimpleCard(item, emptyCta) {
    const cta = item.ctaLabel && item.ctaUrl
      ? '<a class="text-link" href="' + escapeHtml(absoluteUrl(item.ctaUrl)) + '">' + escapeHtml(item.ctaLabel) + "</a>"
      : emptyCta || "";

    const image = safe(item.imageUrl)
      ? '<div class="catalog-image" style="background-image:url(\'' + escapeHtml(item.imageUrl) + '\')"></div>'
      : "";

    return (
      '<article class="panel quick-card">' +
      image +
      '<p class="eyebrow">' +
      escapeHtml(safe(item.tag || item.category)) +
      "</p>" +
      "<h3>" +
      escapeHtml(safe(item.title || item.name)) +
      "</h3>" +
      "<p>" +
      escapeHtml(safe(item.description)) +
      "</p>" +
      cta +
      "</article>"
    );
  }

  function renderCollection(containerId, items, renderer) {
    const container = document.getElementById(containerId);

    if (!container) {
      return;
    }

    if (!items.length) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = items.map(renderer).join("");
  }

  function fillShared(content) {
    setTextAll(".js-company-name", safe(content.company.name));
    setTextAll(".js-company-email-text", safe(content.company.email));
    setTextAll(".js-company-whatsapp-text", safe(content.company.whatsapp));
    setTextAll("#js-company-summary", safe(content.company.summary));

    setTextAll(".js-support-email-text", safe(content.support.email));
    setTextAll(".js-support-phone-text", safe(content.support.phone));
    setTextAll("#js-support-hours", safe(content.support.hours));

    setTextAll(".js-dev-name", safe(content.developer.name));
    setTextAll(".js-dev-role", safe(content.developer.role));
    setTextAll(".js-dev-email-text", safe(content.developer.email));
    setTextAll(".js-dev-phone", safe(content.developer.phone));

    setTextAll("#js-sales-line", safe(content.sales.line));

    setHrefAll(".js-company-email-link", content.company.email ? "mailto:" + content.company.email : "#");
    setHrefAll(".js-company-whatsapp-link", safe(content.company.whatsappUrl, "#"));
    setHrefAll(".js-company-instagram-link", safe(content.company.instagram, "#"));

    setHrefAll(".js-support-email-link", content.support.email ? "mailto:" + content.support.email : "#");
    setHrefAll(".js-support-phone-link", content.support.phone ? "tel:" + content.support.phone.replace(/[^+\d]/g, "") : "#");
    setHrefAll(".js-dev-email-link", content.developer.email ? "mailto:" + content.developer.email : "#");
  }

  function fillHome(content) {
    setTextAll(".js-hero-eyebrow", safe(content.hero.eyebrow));
    setTextAll(".js-hero-headline", safe(content.hero.headline));
    setTextAll(".js-hero-subheadline", safe(content.hero.subheadline));

    const pointsContainer = document.getElementById("js-hero-points");

    if (pointsContainer) {
      const points = Array.isArray(content.hero.points) ? content.hero.points.filter(Boolean) : [];
      pointsContainer.innerHTML = points.map((point) => "<span>" + escapeHtml(point) + "</span>").join("");
    }

    if (content.banners.length > 0) {
      setTextAll("#js-home-highlight-title", safe(content.banners[0].title));
      setTextAll("#js-home-highlight-description", safe(content.banners[0].description));

      const tagsContainer = document.getElementById("js-home-highlight-tags");
      if (tagsContainer) {
        tagsContainer.innerHTML = content.banners
          .slice(0, 3)
          .map((banner) => '<div class="tag">' + escapeHtml(safe(banner.tag || banner.title)) + "</div>")
          .join("");
      }
    }

    renderCollection("js-banner-list", content.banners, buildSimpleCard);
    renderCollection("js-services-list", content.services.filter((item) => item.visible !== false), buildSimpleCard);

    const products = visibleProducts(content);
    const featured = products.filter((product) => product.featured);
    renderCollection("js-featured-products", featured.length ? featured : products.slice(0, 6), buildProductCard);
  }

  function fillVendapro(content) {
    const products = visibleProducts(content);
    const vendapro =
      products.find((item) => safe(item.id) === "vendapro-saas") ||
      products.find((item) => /vendapro/i.test(safe(item.name))) ||
      products[0];

    if (!vendapro) {
      return;
    }

    setTextAll(".js-vendapro-name", safe(vendapro.name));
    setTextAll(".js-vendapro-subtitle", safe(vendapro.subtitle));
    setTextAll(".js-vendapro-description", safe(vendapro.description));
    setTextAll(".js-vendapro-long", safe(vendapro.longDescription || vendapro.description));

    const downloadHref = productDownloadHref(vendapro);
    const downloadButton = document.getElementById("js-vendapro-download");
    const onlineButton = document.getElementById("js-vendapro-online");

    if (downloadButton && downloadHref) {
      downloadButton.setAttribute("href", downloadHref);
    }

    if (onlineButton && vendapro.onlineUrl) {
      onlineButton.setAttribute("href", absoluteUrl(vendapro.onlineUrl));
    }

    const metaContainer = document.getElementById("js-vendapro-meta");

    if (metaContainer) {
      const tags = [vendapro.category, vendapro.subtitle].filter(Boolean);
      metaContainer.innerHTML = tags.map((tag) => "<span>" + escapeHtml(tag) + "</span>").join("");
    }

    renderCollection(
      "js-vendapro-related-products",
      products.filter((item) => item.id !== vendapro.id).slice(0, 4),
      buildProductCard
    );
  }

  function fillDownloads(content) {
    renderCollection("js-download-products", visibleProducts(content), buildProductCard);
  }

  function applyByPage(content) {
    fillShared(content);

    const page = document.body.getAttribute("data-page");

    if (page === "home") {
      fillHome(content);
    }

    if (page === "vendapro") {
      fillVendapro(content);
    }

    if (page === "downloads") {
      fillDownloads(content);
    }
  }

  document.addEventListener("DOMContentLoaded", async function () {
    const raw = await loadRawContent();
    const content = normalizeContent(raw);

    if (!hasPublicContent(content)) {
      blankPage();
      return;
    }

    applyByPage(content);
  });
})();
