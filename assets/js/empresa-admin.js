(function () {
  "use strict";

  const links = window.UDEV_LINKS || {};
  const STORAGE_DRAFT_KEY = "udev_site_content_draft";
  const STORAGE_PREVIEW_KEY = "udev_site_preview_content";
  const STORAGE_DRIVE_FILE_ID = "udev_site_drive_file_id";
  const DEFAULT_CONTENT_URL = links.publicContentUrl || "/assets/data/site-content.json";

  let content = null;
  let accessToken = "";
  let tokenClient = null;
  let bannerEditIndex = -1;
  let productEditIndex = -1;

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const element = byId(id);

    if (element) {
      element.textContent = value;
    }
  }

  function showStatus(message, isError) {
    setText("js-local-status", message);
    const status = byId("js-local-status");

    if (status) {
      status.style.color = isError ? "#ff9eb3" : "";
    }
  }

  function showDriveStatus(message, isError) {
    setText("js-drive-status", message);
    const status = byId("js-drive-status");

    if (status) {
      status.style.color = isError ? "#ff9eb3" : "";
    }
  }

  function safeString(value, fallback) {
    if (value === undefined || value === null || value === "") {
      return fallback || "";
    }

    return String(value);
  }

  function slugify(value) {
    return safeString(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  async function fetchCurrentContent() {
    const response = await fetch(DEFAULT_CONTENT_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Falha ao carregar dados atuais do site.");
    }

    return response.json();
  }

  function normalizeContent(data) {
    const result = cloneData(data || {});

    if (!result.meta) {
      result.meta = {};
    }

    if (!result.hero) {
      result.hero = {};
    }

    if (!result.contacts) {
      result.contacts = {};
    }

    if (!result.contacts.company) {
      result.contacts.company = {};
    }

    if (!result.contacts.developer) {
      result.contacts.developer = {};
    }

    if (!Array.isArray(result.banners)) {
      result.banners = [];
    }

    if (!Array.isArray(result.products)) {
      result.products = [];
    }

    if (!Array.isArray(result.testimonials)) {
      result.testimonials = [];
    }

    return result;
  }

  function syncTopFormsToContent() {
    content.contacts.company.name = safeString(byId("js-company-name").value, "UDEV - StartUP");
    content.contacts.company.email = safeString(byId("js-company-email").value, "udev.oficial@gmail.com");
    content.contacts.company.instagram = safeString(
      byId("js-company-instagram").value,
      "https://www.instagram.com/udev.oficial/"
    );
    content.contacts.company.whatsapp = safeString(byId("js-company-whatsapp").value, "+55 (63) 98441-2348");
    content.contacts.company.whatsappUrl = safeString(
      byId("js-company-whatsapp-url").value,
      "https://wa.me/5563984412348?text=Ol%C3%A1%2C%20quero%20conhecer%20as%20solu%C3%A7%C3%B5es%20da%20UDEV%20StartUP."
    );

    content.contacts.developer.name = safeString(
      byId("js-dev-name").value,
      "Pedro Henrique Santos Silva"
    );
    content.contacts.developer.role = safeString(
      byId("js-dev-role").value,
      "Desenvolvedor / CO-CEO"
    );
    content.contacts.developer.email = safeString(
      byId("js-dev-email").value,
      "pedrohenrique.dev.contato@gmail.com"
    );
    content.contacts.developer.phone = safeString(byId("js-dev-phone").value, "+55 (63) 98441-2348");

    content.hero.headline = safeString(
      byId("js-hero-headline").value,
      "Soluções inteligentes em software e tecnologia"
    );
    content.hero.subheadline = safeString(byId("js-hero-subheadline").value, "");

    content.meta.updatedAt = new Date().toISOString();
  }

  function fillTopForms() {
    byId("js-company-name").value = safeString(content.contacts.company.name, "UDEV - StartUP");
    byId("js-company-email").value = safeString(content.contacts.company.email, "udev.oficial@gmail.com");
    byId("js-company-instagram").value = safeString(
      content.contacts.company.instagram,
      "https://www.instagram.com/udev.oficial/"
    );
    byId("js-company-whatsapp").value = safeString(content.contacts.company.whatsapp, "+55 (63) 98441-2348");
    byId("js-company-whatsapp-url").value = safeString(content.contacts.company.whatsappUrl, "");

    byId("js-dev-name").value = safeString(content.contacts.developer.name, "Pedro Henrique Santos Silva");
    byId("js-dev-role").value = safeString(content.contacts.developer.role, "Desenvolvedor / CO-CEO");
    byId("js-dev-email").value = safeString(
      content.contacts.developer.email,
      "pedrohenrique.dev.contato@gmail.com"
    );
    byId("js-dev-phone").value = safeString(content.contacts.developer.phone, "+55 (63) 98441-2348");

    byId("js-hero-headline").value = safeString(
      content.hero.headline,
      "Soluções inteligentes em software e tecnologia"
    );
    byId("js-hero-subheadline").value = safeString(content.hero.subheadline, "");
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
    byId("js-product-badge").value = "";
    byId("js-product-download-url").value = "";
    byId("js-product-online-url").value = "";
    byId("js-product-image-url").value = "";
    byId("js-product-description").value = "";
    byId("js-product-visible").checked = true;
    byId("js-product-featured").checked = false;
    productEditIndex = -1;
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
          "<strong>" +
          safeString(banner.title, "Banner") +
          "</strong>" +
          "<p>" +
          safeString(banner.description, "Sem descrição") +
          "</p>" +
          '<span class="small muted">' +
          safeString(banner.ctaLabel, "Sem CTA") +
          " → " +
          safeString(banner.ctaUrl, "#") +
          "</span>" +
          "</div>" +
          '<div class="admin-item-actions">' +
          '<button class="btn btn-secondary js-edit-banner" data-index="' +
          index +
          '" type="button">Editar</button>' +
          '<button class="btn btn-outline js-remove-banner" data-index="' +
          index +
          '" type="button">Remover</button>' +
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
          "<strong>" +
          safeString(product.name, "Produto") +
          "</strong>" +
          '<p class="small muted">ID: ' +
          safeString(product.id, "sem-id") +
          " | Categoria: " +
          safeString(product.category, "-") +
          "</p>" +
          "<p>" +
          safeString(product.description, "Sem descrição") +
          "</p>" +
          '<span class="small muted">Download: ' +
          safeString(product.downloadUrl, "não definido") +
          "</span>" +
          "</div>" +
          '<div class="admin-item-actions">' +
          '<button class="btn btn-secondary js-edit-product" data-index="' +
          index +
          '" type="button">Editar</button>' +
          '<button class="btn btn-outline js-remove-product" data-index="' +
          index +
          '" type="button">Remover</button>' +
          "</div>" +
          "</article>"
      )
      .join("");
  }

  function bindListActions() {
    byId("js-banner-admin-list").addEventListener("click", function (event) {
      const editButton = event.target.closest(".js-edit-banner");
      const removeButton = event.target.closest(".js-remove-banner");

      if (editButton) {
        const index = Number(editButton.getAttribute("data-index"));
        const banner = content.banners[index];

        if (!banner) {
          return;
        }

        byId("js-banner-title").value = safeString(banner.title);
        byId("js-banner-tag").value = safeString(banner.tag);
        byId("js-banner-description").value = safeString(banner.description);
        byId("js-banner-cta-label").value = safeString(banner.ctaLabel);
        byId("js-banner-cta-url").value = safeString(banner.ctaUrl);
        byId("js-banner-image-url").value = safeString(banner.imageUrl);
        bannerEditIndex = index;
        showStatus("Editando banner #" + (index + 1), false);
        return;
      }

      if (removeButton) {
        const index = Number(removeButton.getAttribute("data-index"));
        content.banners.splice(index, 1);
        renderBannerList();
        showStatus("Banner removido.", false);
      }
    });

    byId("js-product-admin-list").addEventListener("click", function (event) {
      const editButton = event.target.closest(".js-edit-product");
      const removeButton = event.target.closest(".js-remove-product");

      if (editButton) {
        const index = Number(editButton.getAttribute("data-index"));
        const product = content.products[index];

        if (!product) {
          return;
        }

        byId("js-product-id").value = safeString(product.id);
        byId("js-product-name").value = safeString(product.name);
        byId("js-product-subtitle").value = safeString(product.subtitle);
        byId("js-product-category").value = safeString(product.category);
        byId("js-product-badge").value = safeString(product.badge);
        byId("js-product-download-url").value = safeString(product.downloadUrl);
        byId("js-product-online-url").value = safeString(product.onlineUrl);
        byId("js-product-image-url").value = safeString(product.imageUrl);
        byId("js-product-description").value = safeString(product.description);
        byId("js-product-visible").checked = product.visible !== false;
        byId("js-product-featured").checked = product.featured === true;
        productEditIndex = index;
        showStatus("Editando produto #" + (index + 1), false);
        return;
      }

      if (removeButton) {
        const index = Number(removeButton.getAttribute("data-index"));
        content.products.splice(index, 1);
        renderProductList();
        showStatus("Produto removido.", false);
      }
    });
  }

  function addOrUpdateBanner() {
    const title = safeString(byId("js-banner-title").value);
    const description = safeString(byId("js-banner-description").value);

    if (!title || !description) {
      showStatus("Informe título e descrição do banner.", true);
      return;
    }

    const banner = {
      id: "banner-" + slugify(title) + "-" + Date.now(),
      title: title,
      tag: safeString(byId("js-banner-tag").value, "Banner"),
      description: description,
      ctaLabel: safeString(byId("js-banner-cta-label").value, "Ver mais"),
      ctaUrl: safeString(byId("js-banner-cta-url").value, "/"),
      imageUrl: safeString(byId("js-banner-image-url").value, "")
    };

    if (bannerEditIndex >= 0) {
      banner.id = content.banners[bannerEditIndex].id || banner.id;
      content.banners[bannerEditIndex] = banner;
      showStatus("Banner atualizado.", false);
    } else {
      content.banners.push(banner);
      showStatus("Banner adicionado.", false);
    }

    clearBannerForm();
    renderBannerList();
  }

  function addOrUpdateProduct() {
    const name = safeString(byId("js-product-name").value);
    const description = safeString(byId("js-product-description").value);

    if (!name || !description) {
      showStatus("Informe nome e descrição do produto.", true);
      return;
    }

    const idInput = safeString(byId("js-product-id").value);

    const product = {
      id: idInput || slugify(name),
      name: name,
      subtitle: safeString(byId("js-product-subtitle").value, "Produto Udev"),
      category: safeString(byId("js-product-category").value, "Produto"),
      badge: safeString(byId("js-product-badge").value, "Disponível"),
      downloadUrl: safeString(byId("js-product-download-url").value, ""),
      onlineUrl: safeString(byId("js-product-online-url").value, ""),
      imageUrl: safeString(byId("js-product-image-url").value, ""),
      description: description,
      visible: byId("js-product-visible").checked,
      featured: byId("js-product-featured").checked
    };

    if (productEditIndex >= 0) {
      content.products[productEditIndex] = product;
      showStatus("Produto atualizado.", false);
    } else {
      content.products.push(product);
      showStatus("Produto adicionado.", false);
    }

    clearProductForm();
    renderProductList();
  }

  function exportJson() {
    syncTopFormsToContent();
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "udev-site-content.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showStatus("JSON exportado com sucesso.", false);
  }

  function saveDraft() {
    syncTopFormsToContent();
    localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(content));
    showStatus("Rascunho salvo no navegador.", false);
  }

  function applyPreview() {
    syncTopFormsToContent();
    localStorage.setItem(STORAGE_PREVIEW_KEY, JSON.stringify(content));
    showStatus("Pré-visualização local aplicada. Abra o site com ?preview=1.", false);
  }

  async function importJsonFile(file) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    content = normalizeContent(parsed);
    fillTopForms();
    renderBannerList();
    renderProductList();
    showStatus("JSON importado com sucesso.", false);
  }

  async function ensureGoogleLoaded() {
    if (!(window.google && window.google.accounts && window.google.accounts.oauth2)) {
      throw new Error("Google Identity Services ainda não carregado. Aguarde e tente novamente.");
    }
  }

  async function ensureToken(interactive) {
    await ensureGoogleLoaded();

    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: links.googleClientId,
        scope: links.googleDriveScope,
        callback: function (response) {
          if (!response || !response.access_token) {
            showDriveStatus("Falha na autenticação Google.", true);
            return;
          }

          accessToken = response.access_token;
          setText("js-auth-status", "Autenticado no Google Drive.");
        }
      });
    }

    if (accessToken) {
      return accessToken;
    }

    if (!interactive) {
      throw new Error("Faça autenticação Google antes de continuar.");
    }

    await new Promise((resolve, reject) => {
      tokenClient.callback = function (response) {
        if (!response || !response.access_token) {
          reject(new Error("Não foi possível obter token OAuth."));
          return;
        }

        accessToken = response.access_token;
        setText("js-auth-status", "Autenticado no Google Drive.");
        resolve();
      };

      tokenClient.requestAccessToken({ prompt: "consent" });
    });

    return accessToken;
  }

  async function driveRequest(url, options) {
    const token = await ensureToken(false);
    const requestOptions = Object.assign({}, options || {});
    requestOptions.headers = Object.assign({}, requestOptions.headers || {}, {
      Authorization: "Bearer " + token
    });

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Drive API erro: " + response.status + " " + errorText);
    }

    return response;
  }

  async function findDriveFileByName(name) {
    const query = encodeURIComponent("name='" + name + "' and trashed=false");
    const url =
      "https://www.googleapis.com/drive/v3/files?q=" +
      query +
      "&fields=files(id,name,mimeType,modifiedTime)&orderBy=modifiedTime desc&pageSize=1";

    const response = await driveRequest(url, { method: "GET" });
    const data = await response.json();

    return Array.isArray(data.files) && data.files.length ? data.files[0] : null;
  }

  function buildMultipartBody(metadata, contentPart, mimeType) {
    const boundary = "udevBoundary" + Date.now();
    const payload = contentPart instanceof Blob ? contentPart : new Blob([String(contentPart)], { type: mimeType });
    const body = new Blob(
      [
        "--",
        boundary,
        "\r\n",
        "Content-Type: application/json; charset=UTF-8\r\n\r\n",
        JSON.stringify(metadata),
        "\r\n--",
        boundary,
        "\r\n",
        "Content-Type: ",
        mimeType,
        "\r\n\r\n",
        payload,
        "\r\n--",
        boundary,
        "--"
      ],
      { type: "multipart/related; boundary=" + boundary }
    );

    return {
      boundary: boundary,
      body: body
    };
  }

  async function saveContentToDrive() {
    syncTopFormsToContent();
    await ensureToken(true);

    let fileId = safeString(byId("js-drive-file-id").value) || localStorage.getItem(STORAGE_DRIVE_FILE_ID) || "";

    if (!fileId) {
      const existing = await findDriveFileByName(links.driveContentFileName);

      if (existing) {
        fileId = existing.id;
      }
    }

    const jsonContent = JSON.stringify(content, null, 2);
    const metadata = { name: links.driveContentFileName, mimeType: "application/json" };
    const multipart = buildMultipartBody(metadata, jsonContent, "application/json");

    const url = fileId
      ? "https://www.googleapis.com/upload/drive/v3/files/" + fileId + "?uploadType=multipart"
      : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

    const response = await driveRequest(url, {
      method: fileId ? "PATCH" : "POST",
      headers: {
        "Content-Type": "multipart/related; boundary=" + multipart.boundary
      },
      body: multipart.body
    });

    const saved = await response.json();
    fileId = saved.id;

    await driveRequest("https://www.googleapis.com/drive/v3/files/" + fileId + "/permissions", {
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

    showDriveStatus(
      "JSON salvo no Drive. File ID: " + fileId + " | URL sugerida: https://drive.google.com/uc?export=download&id=" + fileId,
      false
    );
  }

  async function loadContentFromDrive() {
    await ensureToken(true);

    let fileId = safeString(byId("js-drive-file-id").value) || localStorage.getItem(STORAGE_DRIVE_FILE_ID) || "";

    if (!fileId) {
      const existing = await findDriveFileByName(links.driveContentFileName);

      if (existing) {
        fileId = existing.id;
      }
    }

    if (!fileId) {
      throw new Error("Nenhum arquivo JSON encontrado no Drive.");
    }

    const response = await driveRequest("https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media", {
      method: "GET"
    });

    const data = await response.json();
    content = normalizeContent(data);
    fillTopForms();
    renderBannerList();
    renderProductList();

    byId("js-drive-file-id").value = fileId;
    localStorage.setItem(STORAGE_DRIVE_FILE_ID, fileId);

    showDriveStatus("Conteúdo carregado do Drive com sucesso.", false);
  }

  async function uploadImageToDrive(file) {
    await ensureToken(true);

    const metadata = {
      name: file.name,
      mimeType: file.type || "application/octet-stream"
    };

    const multipart = buildMultipartBody(metadata, file, file.type || "application/octet-stream");

    const response = await driveRequest("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/related; boundary=" + multipart.boundary
      },
      body: multipart.body
    });

    const data = await response.json();
    const fileId = data.id;

    await driveRequest("https://www.googleapis.com/drive/v3/files/" + fileId + "/permissions", {
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

  function bindButtons() {
    byId("js-load-site-data").addEventListener("click", async function () {
      try {
        const remoteData = await fetchCurrentContent();
        content = normalizeContent(remoteData);
        fillTopForms();
        renderBannerList();
        renderProductList();
        showStatus("Dados atuais do site carregados.", false);
      } catch (error) {
        showStatus(error.message, true);
      }
    });

    byId("js-save-draft").addEventListener("click", function () {
      try {
        saveDraft();
      } catch (error) {
        showStatus(error.message, true);
      }
    });

    byId("js-export-json").addEventListener("click", function () {
      try {
        exportJson();
      } catch (error) {
        showStatus(error.message, true);
      }
    });

    byId("js-apply-preview").addEventListener("click", function () {
      try {
        applyPreview();
      } catch (error) {
        showStatus(error.message, true);
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
        await importJsonFile(file);
      } catch (error) {
        showStatus("Falha ao importar JSON: " + error.message, true);
      }

      event.target.value = "";
    });

    byId("js-clear-banner-form").addEventListener("click", clearBannerForm);
    byId("js-clear-product-form").addEventListener("click", clearProductForm);

    byId("js-add-banner").addEventListener("click", addOrUpdateBanner);
    byId("js-add-product").addEventListener("click", addOrUpdateProduct);

    byId("js-connect-google").addEventListener("click", async function () {
      try {
        await ensureToken(true);
        setText("js-auth-status", "Autenticado no Google Drive.");
      } catch (error) {
        setText("js-auth-status", error.message);
      }
    });

    byId("js-save-drive").addEventListener("click", async function () {
      try {
        await saveContentToDrive();
      } catch (error) {
        showDriveStatus(error.message, true);
      }
    });

    byId("js-load-drive").addEventListener("click", async function () {
      try {
        await loadContentFromDrive();
      } catch (error) {
        showDriveStatus(error.message, true);
      }
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
        const url = await uploadImageToDrive(file);
        byId("js-banner-image-url").value = url;
        showDriveStatus("Imagem de banner enviada ao Drive.", false);
      } catch (error) {
        showDriveStatus(error.message, true);
      }

      event.target.value = "";
    });

    byId("js-product-image-file").addEventListener("change", async function (event) {
      const file = event.target.files && event.target.files[0];

      if (!file) {
        return;
      }

      try {
        const url = await uploadImageToDrive(file);
        byId("js-product-image-url").value = url;
        showDriveStatus("Imagem de produto enviada ao Drive.", false);
      } catch (error) {
        showDriveStatus(error.message, true);
      }

      event.target.value = "";
    });
  }

  async function bootstrapContent() {
    const draft = localStorage.getItem(STORAGE_DRAFT_KEY);

    if (draft) {
      try {
        content = normalizeContent(JSON.parse(draft));
        showStatus("Rascunho local carregado.", false);
        return;
      } catch (error) {
        localStorage.removeItem(STORAGE_DRAFT_KEY);
      }
    }

    const remoteData = await fetchCurrentContent();
    content = normalizeContent(remoteData);
    showStatus("Dados atuais carregados.", false);
  }

  document.addEventListener("DOMContentLoaded", async function () {
    try {
      await bootstrapContent();
      fillTopForms();
      renderBannerList();
      renderProductList();
      bindButtons();
      bindListActions();

      const rememberedFileId = localStorage.getItem(STORAGE_DRIVE_FILE_ID);
      if (rememberedFileId) {
        byId("js-drive-file-id").value = rememberedFileId;
      }
    } catch (error) {
      showStatus("Falha ao iniciar painel: " + error.message, true);
    }
  });
})();
