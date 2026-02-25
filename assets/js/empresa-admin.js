(function () {
  "use strict";

  const links = window.UDEV_LINKS || {};

  const STORAGE_DRAFT_KEY = "udev_site_content_draft";
  const STORAGE_PREVIEW_KEY = "udev_site_preview_content";
  const STORAGE_DRIVE_FILE_ID = "udev_site_drive_file_id";
  const STORAGE_API_BASE_URL = "udev_site_api_base_url";

  const DEFAULT_CONTENT_URL = links.publicContentUrl || "/assets/data/site-content.json";
  const DRIVE_OWNER_EMAIL = (links.companyDriveOwnerEmail || "udev.oficial@gmail.com").toLowerCase();

  let content = null;
  let tokenClient = null;
  let accessToken = "";

  let serviceEditIndex = -1;
  let bannerEditIndex = -1;
  let productEditIndex = -1;

  function byId(id) {
    return document.getElementById(id);
  }

  function setStatus(elementId, message, isError) {
    const el = byId(elementId);

    if (!el) {
      return;
    }

    el.textContent = message;
    el.classList.remove("status-ok", "status-error");
    el.classList.add(isError ? "status-error" : "status-ok");
  }

  function safe(value, fallback) {
    if (value === undefined || value === null || value === "") {
      return fallback || "";
    }

    return String(value);
  }

  function slugify(value) {
    return safe(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function defaultContent() {
    return {
      meta: {
        published: false,
        updatedAt: "",
        siteName: ""
      },
      hero: {
        eyebrow: "",
        headline: "",
        subheadline: "",
        points: []
      },
      company: {
        name: "",
        summary: "",
        email: "",
        instagram: "",
        whatsapp: "",
        whatsappUrl: ""
      },
      support: {
        email: "",
        phone: "",
        hours: ""
      },
      developer: {
        name: "",
        role: "",
        email: "",
        phone: ""
      },
      sales: {
        line: ""
      },
      services: [],
      banners: [],
      products: []
    };
  }

  function normalizeContent(raw) {
    const base = defaultContent();
    const data = raw && typeof raw === "object" ? clone(raw) : {};
    const legacyContacts = data.contacts || {};

    base.meta = Object.assign(base.meta, data.meta || {});
    base.hero = Object.assign(base.hero, data.hero || {});
    base.company = Object.assign(base.company, data.company || legacyContacts.company || {});
    base.support = Object.assign(base.support, data.support || {});
    base.developer = Object.assign(base.developer, data.developer || legacyContacts.developer || {});
    base.sales = Object.assign(base.sales, data.sales || {});

    base.services = Array.isArray(data.services) ? data.services : [];
    base.banners = Array.isArray(data.banners) ? data.banners : [];
    base.products = Array.isArray(data.products) ? data.products : [];

    return base;
  }

  async function fetchLocalContent() {
    const response = await fetch(DEFAULT_CONTENT_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Não foi possível carregar os dados locais.");
    }

    return response.json();
  }

  function getApiBaseUrl() {
    const input = byId("js-api-base-url");
    const value = safe(input && input.value, "");
    return value ? value.replace(/\/$/, "") : "";
  }

  async function fetchApiContent() {
    const base = getApiBaseUrl();

    if (!base) {
      throw new Error("Informe a API base.");
    }

    const response = await fetch(base + "/api/content", { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Falha ao carregar da API (" + response.status + ").");
    }

    return response.json();
  }

  async function saveApiContent() {
    const base = getApiBaseUrl();

    if (!base) {
      throw new Error("Informe a API base.");
    }

    syncTopToContent();
    const response = await fetch(base + "/api/content", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(content)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error("Falha ao salvar na API: " + text);
    }

    localStorage.setItem(STORAGE_API_BASE_URL, base);
  }

  function syncTopToContent() {
    content.company.name = safe(byId("js-company-name").value);
    content.company.summary = safe(byId("js-company-summary").value);

    content.hero.eyebrow = safe(byId("js-hero-eyebrow").value);
    content.hero.headline = safe(byId("js-hero-headline").value);
    content.hero.subheadline = safe(byId("js-hero-subheadline").value);

    content.company.email = safe(byId("js-company-email").value);
    content.company.instagram = safe(byId("js-company-instagram").value);
    content.company.whatsapp = safe(byId("js-company-whatsapp").value);
    content.company.whatsappUrl = safe(byId("js-company-whatsapp-url").value);

    content.support.email = safe(byId("js-support-email").value);
    content.support.phone = safe(byId("js-support-phone").value);
    content.support.hours = safe(byId("js-support-hours").value);

    content.developer.name = safe(byId("js-dev-name").value);
    content.developer.role = safe(byId("js-dev-role").value);
    content.developer.email = safe(byId("js-dev-email").value);
    content.developer.phone = safe(byId("js-dev-phone").value);

    content.sales.line = safe(byId("js-sales-line").value);

    content.meta.siteName = safe(content.company.name);
    content.meta.updatedAt = new Date().toISOString();

    const hasEssential = Boolean(content.company.name && (content.hero.headline || content.products.length || content.banners.length || content.services.length));
    content.meta.published = hasEssential;
  }

  function fillTopFromContent() {
    byId("js-company-name").value = safe(content.company.name);
    byId("js-company-summary").value = safe(content.company.summary);

    byId("js-hero-eyebrow").value = safe(content.hero.eyebrow);
    byId("js-hero-headline").value = safe(content.hero.headline);
    byId("js-hero-subheadline").value = safe(content.hero.subheadline);

    byId("js-company-email").value = safe(content.company.email);
    byId("js-company-instagram").value = safe(content.company.instagram);
    byId("js-company-whatsapp").value = safe(content.company.whatsapp);
    byId("js-company-whatsapp-url").value = safe(content.company.whatsappUrl);

    byId("js-support-email").value = safe(content.support.email);
    byId("js-support-phone").value = safe(content.support.phone);
    byId("js-support-hours").value = safe(content.support.hours);

    byId("js-dev-name").value = safe(content.developer.name);
    byId("js-dev-role").value = safe(content.developer.role);
    byId("js-dev-email").value = safe(content.developer.email);
    byId("js-dev-phone").value = safe(content.developer.phone);

    byId("js-sales-line").value = safe(content.sales.line);
  }

  function clearServiceForm() {
    byId("js-service-title").value = "";
    byId("js-service-category").value = "";
    byId("js-service-description").value = "";
    byId("js-service-cta-label").value = "";
    byId("js-service-cta-url").value = "";
    serviceEditIndex = -1;
  }

  function clearBannerForm() {
    byId("js-banner-title").value = "";
    byId("js-banner-tag").value = "";
    byId("js-banner-description").value = "";
    byId("js-banner-cta-label").value = "";
    byId("js-banner-cta-url").value = "";
    byId("js-banner-image-url").value = "";
    bannerEditIndex = -1;
  }

  function clearProductForm() {
    byId("js-product-id").value = "";
    byId("js-product-name").value = "";
    byId("js-product-subtitle").value = "";
    byId("js-product-category").value = "";
    byId("js-product-description").value = "";
    byId("js-product-drive-file-id").value = "";
    byId("js-product-online-url").value = "";
    byId("js-product-image-url").value = "";
    byId("js-product-visible").checked = true;
    byId("js-product-featured").checked = false;
    productEditIndex = -1;
  }

  function renderServiceList() {
    const list = byId("js-service-admin-list");

    if (!content.services.length) {
      list.innerHTML = '<div class="admin-empty">Nenhum serviço cadastrado.</div>';
      return;
    }

    list.innerHTML = content.services
      .map(
        (service, index) =>
          '<article class="admin-item">' +
          '<div class="admin-item-content">' +
          "<strong>" + safe(service.title) + "</strong>" +
          "<p>" + safe(service.description) + "</p>" +
          '<p class="small muted">' + safe(service.category) + " | " + safe(service.ctaLabel) + " → " + safe(service.ctaUrl) + "</p>" +
          "</div>" +
          '<div class="admin-item-actions">' +
          '<button class="btn btn-secondary js-edit-service" data-index="' + index + '" type="button">Editar</button>' +
          '<button class="btn btn-outline js-remove-service" data-index="' + index + '" type="button">Remover</button>' +
          "</div>" +
          "</article>"
      )
      .join("");
  }

  function renderBannerList() {
    const list = byId("js-banner-admin-list");

    if (!content.banners.length) {
      list.innerHTML = '<div class="admin-empty">Nenhum banner cadastrado.</div>';
      return;
    }

    list.innerHTML = content.banners
      .map(
        (banner, index) =>
          '<article class="admin-item">' +
          '<div class="admin-item-content">' +
          "<strong>" + safe(banner.title) + "</strong>" +
          "<p>" + safe(banner.description) + "</p>" +
          '<p class="small muted">' + safe(banner.tag) + " | " + safe(banner.ctaLabel) + " → " + safe(banner.ctaUrl) + "</p>" +
          "</div>" +
          '<div class="admin-item-actions">' +
          '<button class="btn btn-secondary js-edit-banner" data-index="' + index + '" type="button">Editar</button>' +
          '<button class="btn btn-outline js-remove-banner" data-index="' + index + '" type="button">Remover</button>' +
          "</div>" +
          "</article>"
      )
      .join("");
  }

  function renderProductList() {
    const list = byId("js-product-admin-list");

    if (!content.products.length) {
      list.innerHTML = '<div class="admin-empty">Nenhum produto cadastrado.</div>';
      return;
    }

    list.innerHTML = content.products
      .map(
        (product, index) =>
          '<article class="admin-item">' +
          '<div class="admin-item-content">' +
          "<strong>" + safe(product.name) + "</strong>" +
          '<p class="small muted">ID: ' + safe(product.id) + " | " + safe(product.category) + "</p>" +
          "<p>" + safe(product.description) + "</p>" +
          '<p class="small muted">Drive File ID: ' + safe(product.driveFileId) + "</p>" +
          "</div>" +
          '<div class="admin-item-actions">' +
          '<button class="btn btn-secondary js-edit-product" data-index="' + index + '" type="button">Editar</button>' +
          '<button class="btn btn-outline js-remove-product" data-index="' + index + '" type="button">Remover</button>' +
          "</div>" +
          "</article>"
      )
      .join("");
  }

  function bindTabSwitching() {
    const buttons = Array.from(document.querySelectorAll(".tab-button"));
    const panels = Array.from(document.querySelectorAll(".tab-panel"));

    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const tab = button.getAttribute("data-tab");

        buttons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", active ? "true" : "false");
        });

        panels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute("data-panel") === tab);
        });
      });
    });
  }

  function bindAdminListEvents() {
    byId("js-service-admin-list").addEventListener("click", function (event) {
      const edit = event.target.closest(".js-edit-service");
      const remove = event.target.closest(".js-remove-service");

      if (edit) {
        const index = Number(edit.getAttribute("data-index"));
        const service = content.services[index];

        if (!service) {
          return;
        }

        byId("js-service-title").value = safe(service.title);
        byId("js-service-category").value = safe(service.category);
        byId("js-service-description").value = safe(service.description);
        byId("js-service-cta-label").value = safe(service.ctaLabel);
        byId("js-service-cta-url").value = safe(service.ctaUrl);
        serviceEditIndex = index;
        setStatus("js-local-status", "Editando serviço #" + (index + 1), false);
        return;
      }

      if (remove) {
        const index = Number(remove.getAttribute("data-index"));
        content.services.splice(index, 1);
        renderServiceList();
        setStatus("js-local-status", "Serviço removido.", false);
      }
    });

    byId("js-banner-admin-list").addEventListener("click", function (event) {
      const edit = event.target.closest(".js-edit-banner");
      const remove = event.target.closest(".js-remove-banner");

      if (edit) {
        const index = Number(edit.getAttribute("data-index"));
        const banner = content.banners[index];

        if (!banner) {
          return;
        }

        byId("js-banner-title").value = safe(banner.title);
        byId("js-banner-tag").value = safe(banner.tag);
        byId("js-banner-description").value = safe(banner.description);
        byId("js-banner-cta-label").value = safe(banner.ctaLabel);
        byId("js-banner-cta-url").value = safe(banner.ctaUrl);
        byId("js-banner-image-url").value = safe(banner.imageUrl);
        bannerEditIndex = index;
        setStatus("js-local-status", "Editando banner #" + (index + 1), false);
        return;
      }

      if (remove) {
        const index = Number(remove.getAttribute("data-index"));
        content.banners.splice(index, 1);
        renderBannerList();
        setStatus("js-local-status", "Banner removido.", false);
      }
    });

    byId("js-product-admin-list").addEventListener("click", function (event) {
      const edit = event.target.closest(".js-edit-product");
      const remove = event.target.closest(".js-remove-product");

      if (edit) {
        const index = Number(edit.getAttribute("data-index"));
        const product = content.products[index];

        if (!product) {
          return;
        }

        byId("js-product-id").value = safe(product.id);
        byId("js-product-name").value = safe(product.name);
        byId("js-product-subtitle").value = safe(product.subtitle);
        byId("js-product-category").value = safe(product.category);
        byId("js-product-description").value = safe(product.description);
        byId("js-product-drive-file-id").value = safe(product.driveFileId);
        byId("js-product-online-url").value = safe(product.onlineUrl);
        byId("js-product-image-url").value = safe(product.imageUrl);
        byId("js-product-visible").checked = product.visible !== false;
        byId("js-product-featured").checked = product.featured === true;

        productEditIndex = index;
        setStatus("js-local-status", "Editando produto #" + (index + 1), false);
        return;
      }

      if (remove) {
        const index = Number(remove.getAttribute("data-index"));
        content.products.splice(index, 1);
        renderProductList();
        setStatus("js-local-status", "Produto removido.", false);
      }
    });
  }

  function addOrUpdateService() {
    const title = safe(byId("js-service-title").value);
    const description = safe(byId("js-service-description").value);

    if (!title || !description) {
      setStatus("js-local-status", "Preencha título e descrição do serviço.", true);
      return;
    }

    const service = {
      id: "service-" + slugify(title),
      title: title,
      name: title,
      category: safe(byId("js-service-category").value),
      description: description,
      ctaLabel: safe(byId("js-service-cta-label").value),
      ctaUrl: safe(byId("js-service-cta-url").value),
      visible: true
    };

    if (serviceEditIndex >= 0) {
      service.id = content.services[serviceEditIndex].id || service.id;
      content.services[serviceEditIndex] = service;
      setStatus("js-local-status", "Serviço atualizado.", false);
    } else {
      content.services.push(service);
      setStatus("js-local-status", "Serviço adicionado.", false);
    }

    clearServiceForm();
    renderServiceList();
  }

  function addOrUpdateBanner() {
    const title = safe(byId("js-banner-title").value);
    const description = safe(byId("js-banner-description").value);

    if (!title || !description) {
      setStatus("js-local-status", "Preencha título e descrição do banner.", true);
      return;
    }

    const banner = {
      id: "banner-" + slugify(title),
      title: title,
      tag: safe(byId("js-banner-tag").value),
      description: description,
      ctaLabel: safe(byId("js-banner-cta-label").value),
      ctaUrl: safe(byId("js-banner-cta-url").value),
      imageUrl: safe(byId("js-banner-image-url").value)
    };

    if (bannerEditIndex >= 0) {
      banner.id = content.banners[bannerEditIndex].id || banner.id;
      content.banners[bannerEditIndex] = banner;
      setStatus("js-local-status", "Banner atualizado.", false);
    } else {
      content.banners.push(banner);
      setStatus("js-local-status", "Banner adicionado.", false);
    }

    clearBannerForm();
    renderBannerList();
  }

  async function addOrUpdateProduct() {
    const name = safe(byId("js-product-name").value);
    const description = safe(byId("js-product-description").value);
    const driveFileId = safe(byId("js-product-drive-file-id").value);

    if (!name || !description || !driveFileId) {
      setStatus("js-local-status", "Preencha nome, descrição e ID do arquivo no Drive.", true);
      return;
    }

    try {
      await ensureToken(true);
      await validateDriveFileOwnership(driveFileId);
    } catch (error) {
      setStatus("js-local-status", "Produto não validado no Drive: " + error.message, true);
      return;
    }

    const idInput = safe(byId("js-product-id").value);

    const product = {
      id: idInput || slugify(name),
      name: name,
      subtitle: safe(byId("js-product-subtitle").value),
      category: safe(byId("js-product-category").value),
      description: description,
      driveFileId: driveFileId,
      onlineUrl: safe(byId("js-product-online-url").value),
      imageUrl: safe(byId("js-product-image-url").value),
      visible: byId("js-product-visible").checked,
      featured: byId("js-product-featured").checked
    };

    if (productEditIndex >= 0) {
      content.products[productEditIndex] = product;
      setStatus("js-local-status", "Produto atualizado.", false);
    } else {
      content.products.push(product);
      setStatus("js-local-status", "Produto adicionado.", false);
    }

    clearProductForm();
    renderProductList();
  }

  function buildMultipart(metadata, bodyPart, mimeType) {
    const boundary = "udevBoundary" + Date.now();
    const payload = bodyPart instanceof Blob ? bodyPart : new Blob([String(bodyPart)], { type: mimeType });

    const body = new Blob(
      [
        "--", boundary, "\r\n",
        "Content-Type: application/json; charset=UTF-8\r\n\r\n",
        JSON.stringify(metadata),
        "\r\n--", boundary, "\r\n",
        "Content-Type: ", mimeType, "\r\n\r\n",
        payload,
        "\r\n--", boundary, "--"
      ],
      { type: "multipart/related; boundary=" + boundary }
    );

    return { boundary, body };
  }

  async function ensureGoogleLoaded() {
    if (!(window.google && window.google.accounts && window.google.accounts.oauth2)) {
      throw new Error("Google Identity Services ainda não carregado.");
    }
  }

  async function ensureToken(interactive) {
    await ensureGoogleLoaded();

    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: links.googleClientId,
        scope: links.googleDriveScope,
        callback: function () {}
      });
    }

    if (accessToken) {
      return accessToken;
    }

    if (!interactive) {
      throw new Error("Conecte sua conta Google primeiro.");
    }

    await new Promise((resolve, reject) => {
      tokenClient.callback = function (response) {
        if (!response || !response.access_token) {
          reject(new Error("Falha ao obter token OAuth."));
          return;
        }

        accessToken = response.access_token;
        setStatus("js-auth-status", "Autenticado com Google Drive.", false);
        resolve();
      };

      tokenClient.requestAccessToken({ prompt: "consent" });
    });

    return accessToken;
  }

  async function driveFetch(url, options) {
    const token = await ensureToken(false);
    const config = Object.assign({}, options || {});

    config.headers = Object.assign({}, config.headers || {}, {
      Authorization: "Bearer " + token
    });

    const response = await fetch(url, config);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(response.status + " - " + text);
    }

    return response;
  }

  async function findDriveContentFile() {
    const query = encodeURIComponent("name='" + links.driveContentFileName + "' and trashed=false");
    const url = "https://www.googleapis.com/drive/v3/files?q=" + query + "&fields=files(id,name,modifiedTime)&pageSize=1";
    const response = await driveFetch(url, { method: "GET" });
    const data = await response.json();

    if (!Array.isArray(data.files) || !data.files.length) {
      return null;
    }

    return data.files[0];
  }

  async function validateDriveFileOwnership(fileId) {
    const fields = encodeURIComponent("id,name,owners(emailAddress,displayName)");
    const url = "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId) + "?fields=" + fields;
    const response = await driveFetch(url, { method: "GET" });
    const data = await response.json();

    const owners = Array.isArray(data.owners) ? data.owners : [];
    const ownedByCompany = owners.some((owner) => safe(owner.emailAddress).toLowerCase() === DRIVE_OWNER_EMAIL);

    if (!ownedByCompany) {
      throw new Error("Arquivo não pertence à conta " + DRIVE_OWNER_EMAIL + ".");
    }

    return data;
  }

  async function uploadImageToDrive(file) {
    await ensureToken(true);

    const metadata = {
      name: file.name,
      mimeType: file.type || "application/octet-stream"
    };

    const multipart = buildMultipart(metadata, file, file.type || "application/octet-stream");

    const response = await driveFetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/related; boundary=" + multipart.boundary
      },
      body: multipart.body
    });

    const data = await response.json();
    const fileId = data.id;

    await driveFetch("https://www.googleapis.com/drive/v3/files/" + fileId + "/permissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role: "reader", type: "anyone" })
    }).catch(function () {
      return null;
    });

    return "https://drive.google.com/uc?export=view&id=" + fileId;
  }

  async function saveContentToDrive() {
    syncTopToContent();
    await ensureToken(true);

    let fileId = safe(byId("js-drive-file-id").value) || localStorage.getItem(STORAGE_DRIVE_FILE_ID) || "";

    if (!fileId) {
      const existing = await findDriveContentFile();
      if (existing) {
        fileId = existing.id;
      }
    }

    const payload = JSON.stringify(content, null, 2);
    const metadata = {
      name: links.driveContentFileName,
      mimeType: "application/json"
    };

    const multipart = buildMultipart(metadata, payload, "application/json");
    const url = fileId
      ? "https://www.googleapis.com/upload/drive/v3/files/" + fileId + "?uploadType=multipart"
      : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

    const response = await driveFetch(url, {
      method: fileId ? "PATCH" : "POST",
      headers: {
        "Content-Type": "multipart/related; boundary=" + multipart.boundary
      },
      body: multipart.body
    });

    const saved = await response.json();
    fileId = saved.id;

    await driveFetch("https://www.googleapis.com/drive/v3/files/" + fileId + "/permissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role: "reader", type: "anyone" })
    }).catch(function () {
      return null;
    });

    byId("js-drive-file-id").value = fileId;
    localStorage.setItem(STORAGE_DRIVE_FILE_ID, fileId);

    setStatus(
      "js-drive-status",
      "Conteúdo salvo no Drive. ID: " + fileId + " | Atualize publicContentDriveFileId em assets/js/links.js",
      false
    );
  }

  async function loadContentFromDrive() {
    await ensureToken(true);

    let fileId = safe(byId("js-drive-file-id").value) || localStorage.getItem(STORAGE_DRIVE_FILE_ID) || "";

    if (!fileId) {
      const existing = await findDriveContentFile();
      if (existing) {
        fileId = existing.id;
      }
    }

    if (!fileId) {
      throw new Error("Nenhum arquivo de conteúdo encontrado no Drive.");
    }

    const response = await driveFetch("https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media", {
      method: "GET"
    });

    const data = await response.json();
    content = normalizeContent(data);

    fillTopFromContent();
    renderServiceList();
    renderBannerList();
    renderProductList();

    byId("js-drive-file-id").value = fileId;
    localStorage.setItem(STORAGE_DRIVE_FILE_ID, fileId);

    setStatus("js-drive-status", "Conteúdo carregado do Drive.", false);
  }

  function saveDraft() {
    syncTopToContent();
    localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(content));
    setStatus("js-local-status", "Rascunho salvo localmente.", false);
  }

  function applyPreview() {
    syncTopToContent();
    localStorage.setItem(STORAGE_PREVIEW_KEY, JSON.stringify(content));
    setStatus("js-local-status", "Preview local salvo. Abra páginas públicas com ?preview=1.", false);
  }

  function exportJson() {
    syncTopToContent();
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "udev-site-content.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatus("js-local-status", "JSON exportado.", false);
  }

  async function importJson(file) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    content = normalizeContent(parsed);

    fillTopFromContent();
    renderServiceList();
    renderBannerList();
    renderProductList();

    setStatus("js-local-status", "JSON importado com sucesso.", false);
  }

  function bindButtons() {
    byId("js-add-service").addEventListener("click", addOrUpdateService);
    byId("js-clear-service-form").addEventListener("click", clearServiceForm);

    byId("js-add-banner").addEventListener("click", addOrUpdateBanner);
    byId("js-clear-banner-form").addEventListener("click", clearBannerForm);

    byId("js-add-product").addEventListener("click", function () {
      addOrUpdateProduct();
    });
    byId("js-clear-product-form").addEventListener("click", clearProductForm);

    byId("js-connect-google").addEventListener("click", async function () {
      try {
        await ensureToken(true);
      } catch (error) {
        setStatus("js-auth-status", error.message, true);
      }
    });

    byId("js-load-api").addEventListener("click", async function () {
      try {
        const data = await fetchApiContent();
        content = normalizeContent(data);
        fillTopFromContent();
        renderServiceList();
        renderBannerList();
        renderProductList();
        localStorage.setItem(STORAGE_API_BASE_URL, getApiBaseUrl());
        setStatus("js-local-status", "Dados carregados da API.", false);
      } catch (error) {
        setStatus("js-local-status", error.message, true);
      }
    });

    byId("js-save-api").addEventListener("click", async function () {
      try {
        await saveApiContent();
        setStatus("js-local-status", "Dados salvos na API.", false);
      } catch (error) {
        setStatus("js-local-status", error.message, true);
      }
    });

    byId("js-load-drive").addEventListener("click", async function () {
      try {
        await loadContentFromDrive();
      } catch (error) {
        setStatus("js-drive-status", error.message, true);
      }
    });

    byId("js-save-drive").addEventListener("click", async function () {
      try {
        await saveContentToDrive();
      } catch (error) {
        setStatus("js-drive-status", error.message, true);
      }
    });

    byId("js-load-site-data").addEventListener("click", async function () {
      try {
        const data = await fetchLocalContent();
        content = normalizeContent(data);
        fillTopFromContent();
        renderServiceList();
        renderBannerList();
        renderProductList();
        setStatus("js-local-status", "Dados locais recarregados.", false);
      } catch (error) {
        setStatus("js-local-status", error.message, true);
      }
    });

    byId("js-save-draft").addEventListener("click", function () {
      try {
        saveDraft();
      } catch (error) {
        setStatus("js-local-status", error.message, true);
      }
    });

    byId("js-apply-preview").addEventListener("click", function () {
      try {
        applyPreview();
      } catch (error) {
        setStatus("js-local-status", error.message, true);
      }
    });

    byId("js-export-json").addEventListener("click", function () {
      try {
        exportJson();
      } catch (error) {
        setStatus("js-local-status", error.message, true);
      }
    });

    byId("js-import-json-btn").addEventListener("click", function () {
      byId("js-import-json").click();
    });

    byId("js-import-json").addEventListener("change", async function (event) {
      const file = event.target.files && event.target.files[0];

      if (!file) {
        return;
      }

      try {
        await importJson(file);
      } catch (error) {
        setStatus("js-local-status", "Falha ao importar: " + error.message, true);
      }

      event.target.value = "";
    });

    byId("js-upload-banner-image").addEventListener("click", function () {
      byId("js-banner-image-file").click();
    });

    byId("js-upload-product-image").addEventListener("click", function () {
      byId("js-product-image-file").click();
    });

    byId("js-banner-image-file").addEventListener("change", async function (event) {
      const file = event.target.files && event.target.files[0];

      if (!file) {
        return;
      }

      try {
        const imageUrl = await uploadImageToDrive(file);
        byId("js-banner-image-url").value = imageUrl;
        setStatus("js-drive-status", "Imagem de banner enviada ao Drive.", false);
      } catch (error) {
        setStatus("js-drive-status", error.message, true);
      }

      event.target.value = "";
    });

    byId("js-product-image-file").addEventListener("change", async function (event) {
      const file = event.target.files && event.target.files[0];

      if (!file) {
        return;
      }

      try {
        const imageUrl = await uploadImageToDrive(file);
        byId("js-product-image-url").value = imageUrl;
        setStatus("js-drive-status", "Imagem de produto enviada ao Drive.", false);
      } catch (error) {
        setStatus("js-drive-status", error.message, true);
      }

      event.target.value = "";
    });
  }

  async function bootstrap() {
    const draft = localStorage.getItem(STORAGE_DRAFT_KEY);

    if (draft) {
      try {
        content = normalizeContent(JSON.parse(draft));
        setStatus("js-local-status", "Rascunho local carregado.", false);
        return;
      } catch (error) {
        localStorage.removeItem(STORAGE_DRAFT_KEY);
      }
    }

    try {
      const localContent = await fetchLocalContent();
      content = normalizeContent(localContent);
      setStatus("js-local-status", "Dados locais carregados.", false);
    } catch (error) {
      content = defaultContent();
      setStatus("js-local-status", "Dados locais ausentes. Preencha e publique.", true);
    }
  }

  document.addEventListener("DOMContentLoaded", async function () {
    bindTabSwitching();

    await bootstrap();
    fillTopFromContent();

    const apiInput = byId("js-api-base-url");
    if (apiInput) {
      apiInput.value = localStorage.getItem(STORAGE_API_BASE_URL) || safe(links.apiBaseUrl);
    }

    const rememberedFileId = localStorage.getItem(STORAGE_DRIVE_FILE_ID);
    if (rememberedFileId) {
      byId("js-drive-file-id").value = rememberedFileId;
    }

    renderServiceList();
    renderBannerList();
    renderProductList();

    bindAdminListEvents();
    bindButtons();
  });
})();
