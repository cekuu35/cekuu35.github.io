// cekuu Store — vitrin mantığı
// Ürünler products.json dosyasından okunur. Düzenlemek için sadece o dosyayı değiştir.

(function () {
  "use strict";

  const grid = document.getElementById("productGrid");
  const filtersEl = document.getElementById("filters");
  const searchEl = document.getElementById("search");
  const emptyEl = document.getElementById("emptyState");

  let allProducts = [];
  let activeCategory = "Tümü";
  let query = "";
  let currency = "$";

  function showSkeletons(n) {
    grid.innerHTML = Array.from({ length: n })
      .map(() => '<div class="skeleton"></div>')
      .join("");
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function priceHtml(p) {
    const main = `<span class="price">${currency}${escapeHtml(p.price)}</span>`;
    const old =
      p.oldPrice != null && p.oldPrice !== ""
        ? `<span class="old-price">${currency}${escapeHtml(p.oldPrice)}</span>`
        : "";
    return main + old;
  }

  function cardHtml(p) {
    const badge = p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : "";
    const url = escapeHtml(p.gumroadUrl || "#");
    return `
      <article class="card">
        <div class="card-media">
          ${badge}
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy" />
        </div>
        <div class="card-body">
          <span class="card-cat">${escapeHtml(p.category || "")}</span>
          <h3 class="card-title">${escapeHtml(p.title)}</h3>
          <p class="card-desc">${escapeHtml(p.description)}</p>
          <div class="card-foot">
            <div>${priceHtml(p)}</div>
            <a class="btn btn-primary gumroad-button" href="${url}" target="_blank" rel="noopener" data-gumroad-overlay-checkout="true">Satın Al</a>
          </div>
        </div>
      </article>`;
  }

  function render() {
    const filtered = allProducts.filter((p) => {
      const catOk = activeCategory === "Tümü" || p.category === activeCategory;
      const q = query.trim().toLowerCase();
      const searchOk =
        !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));
      return catOk && searchOk;
    });

    if (filtered.length === 0) {
      grid.innerHTML = "";
      emptyEl.hidden = false;
    } else {
      emptyEl.hidden = true;
      grid.innerHTML = filtered.map(cardHtml).join("");
    }
  }

  function buildFilters(categories) {
    filtersEl.innerHTML = categories
      .map(
        (c) =>
          `<button class="chip${c === activeCategory ? " active" : ""}" data-cat="${escapeHtml(
            c
          )}">${escapeHtml(c)}</button>`
      )
      .join("");

    filtersEl.querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.cat;
        filtersEl.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        render();
      });
    });
  }

  function applySiteConfig(site) {
    if (!site) return;
    currency = site.currency || "$";
    const set = (id, prop, val) => {
      const el = document.getElementById(id);
      if (el && val) el[prop] = val;
    };
    if (site.brand) {
      document.title = `${site.brand} — ${site.tagline || "Dijital ürünler"}`;
      const brand = document.getElementById("brand");
      if (brand) brand.innerHTML = `🛍️ <span>${escapeHtml(site.brand)}</span>`;
      set("footerBrand", "textContent", `🛍️ ${site.brand}`);
    }
    set("footerTagline", "textContent", site.tagline);
    if (site.gumroadProfile) {
      ["profileLink", "footerProfile"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.href = site.gumroadProfile;
      });
    }
  }

  async function init() {
    document.getElementById("year").textContent = new Date().getFullYear();
    showSkeletons(8);

    // Bülten formu (placeholder — kendi e-posta servisine bağla)
    const newsForm = document.getElementById("newsForm");
    if (newsForm) {
      newsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const note = document.getElementById("newsNote");
        if (note) note.hidden = false;
        newsForm.reset();
      });
    }

    try {
      const res = await fetch("products.json", { cache: "no-store" });
      if (!res.ok) throw new Error("products.json yüklenemedi");
      const data = await res.json();

      applySiteConfig(data.site);
      allProducts = Array.isArray(data.products) ? data.products : [];

      const cats =
        Array.isArray(data.categories) && data.categories.length
          ? data.categories
          : ["Tümü", ...new Set(allProducts.map((p) => p.category).filter(Boolean))];
      if (!cats.includes("Tümü")) cats.unshift("Tümü");

      buildFilters(cats);
      render();
    } catch (err) {
      grid.innerHTML = `<p class="empty">Ürünler yüklenemedi. <br><small>${escapeHtml(
        err.message
      )}</small></p>`;
      console.error(err);
    }
  }

  if (searchEl) {
    searchEl.addEventListener("input", (e) => {
      query = e.target.value;
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
