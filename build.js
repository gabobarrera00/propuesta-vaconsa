#!/usr/bin/env node
/**
 * Genera las paginas estaticas del sitio a partir de _layout.html + pages/*.html.
 *
 * Uso: node build.js
 *
 * - Español: pages/*.html      -> /index.html y /<seccion>/index.html
 * - Inglés:  pages/en/*.html   -> /en/index.html y /en/<seccion>/index.html
 *   (cada página en español debe tener su par en inglés, o el build falla)
 * - Familias de producto: se generan desde CATALOG y FAMILIAS
 *   (catalogo-datos.js) en /productos/<slug>/ y /en/productos/<slug>/.
 * - sitemap.xml con las URLs de los dos idiomas y sus alternas.
 *
 * Solo Node, sin dependencias: la imagen de build del deploy no trae Python
 * (ver CLAUDE.md, "Build script must not depend on Python").
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const HERE = __dirname;
const LAYOUT = path.join(HERE, "_layout.html");
const PAGES_DIR = path.join(HERE, "pages");
const BASE_URL = "https://vaconsa.up.railway.app";
const LANGS = ["es", "en"];

const FRONTMATTER_RE = /^<!--\s*([\s\S]*?)\s*-->\s*/;

function readNormalized(filePath) {
  return fs.readFileSync(filePath, "utf-8").replace(/\r\n|\r/g, "\n");
}
function writeNormalized(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, { encoding: "utf-8" });
}
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function parsePage(filePath) {
  const raw = readNormalized(filePath);
  const m = FRONTMATTER_RE.exec(raw);
  if (!m) throw new Error(`${filePath}: falta el bloque de front-matter al inicio`);
  const content = raw.slice(m[0].length).trim();
  const fm = {};
  for (const rawLine of m[1].split("\n")) {
    const line = rawLine.trim();
    if (!line || !line.includes(":")) continue;
    const idx = line.indexOf(":");
    fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  for (const required of ["title", "description", "nav"]) {
    if (!(required in fm)) throw new Error(`${filePath}: falta '${required}:' en el front-matter`);
  }
  return { fm, content };
}

// URL pública de una página: name "inicio" es la raíz; "productos/tuberia" una subcarpeta.
function urlPath(lang, name) {
  const prefix = lang === "en" ? "/en/" : "/";
  return name === "inicio" ? prefix : `${prefix}${name}/`;
}
function canonicalFor(lang, name) { return BASE_URL + urlPath(lang, name); }
function outputFile(lang, name) {
  const parts = [HERE];
  if (lang === "en") parts.push("en");
  if (name !== "inicio") parts.push(...name.split("/"));
  return path.join(...parts, "index.html");
}

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function markActiveNav(html, navId) {
  if (!navId) return html;
  const pattern = new RegExp(`(<a\\b[^>]*\\bdata-nav="${escapeRegExp(navId)}"[^>]*)(>)`);
  return html.replace(pattern, (_m, p1, p2) => `${p1} aria-current="page" tabindex="-1"${p2}`);
}

const CRUMB = { es: { home: "Inicio", label: "Ruta", products: "Todos los productos" }, en: { home: "Home", label: "Breadcrumb", products: "All products" } };
function breadcrumb(lang, trail) {
  if (!trail || !trail.length) return "";
  const c = CRUMB[lang];
  const parts = [`<a href="/">${c.home}</a>`];
  trail.forEach((t, i) => {
    parts.push('<span aria-hidden="true">/</span>');
    parts.push(i === trail.length - 1 || !t.href ? `<span aria-current="page">${esc(t.text)}</span>` : `<a href="${t.href}">${esc(t.text)}</a>`);
  });
  return `<nav class="breadcrumb" aria-label="${c.label}"><div class="wrap">${parts.join("")}</div></nav>`;
}

// Traduce la plantilla al inglés con los pares de layout.en.js. Un texto en
// español que ya no existe en la plantilla detiene el build.
function layoutFor(lang, layoutEs) {
  if (lang === "es") return layoutEs;
  let html = layoutEs;
  for (const [es, en, all] of require("./layout.en.js")) {
    if (!html.includes(es)) throw new Error(`layout.en.js: no se encontró en _layout.html: ${es.slice(0, 70)}`);
    html = all ? html.split(es).join(en) : html.replace(es, en);
  }
  return html;
}

// En /en/, los enlaces internos apuntan a /en/... (salvo archivos: imágenes,
// scripts, PDF, la auditoría y lo que ya está en /en/).
function prefixEnglishLinks(html) {
  return html.replace(/\b(href|action)="\/(?!\/)([^"]*)"/g, (m, attr, p) => {
    if (/^(en\/|img\/|favicon|auditoria)/.test(p) || /\.(js|css|pdf|xml|txt|svg|jpe?g|png|webp)([?#]|$)/.test(p)) return m;
    return `${attr}="/en/${p}"`;
  });
}

function langSwitch(lang, name) {
  const es = urlPath("es", name), en = urlPath("en", name);
  const cur = (l) => (l === lang ? ' aria-current="true"' : "");
  return `<div class="lang-switch"><a href="${es}" hreflang="es" lang="es" aria-label="ES, Español"${cur("es")}>ES</a><span aria-hidden="true">|</span><a href="${en}" hreflang="en" lang="en" aria-label="EN, English"${cur("en")}>EN</a></div>`;
}
function alternates(name) {
  return [
    `<link rel="alternate" hreflang="es-MX" href="${canonicalFor("es", name)}">`,
    `<link rel="alternate" hreflang="en" href="${canonicalFor("en", name)}">`,
    `<link rel="alternate" hreflang="x-default" href="${canonicalFor("es", name)}">`
  ].join("\n");
}

function render(layoutEs, lang, name, page) {
  let html = markActiveNav(layoutFor(lang, layoutEs), page.fm.nav);
  html = html
    .split("{{TITLE}}").join(page.fm.title)
    .split("{{DESCRIPTION}}").join(page.fm.description)
    .split("{{CANONICAL}}").join(canonicalFor(lang, name))
    .split("{{BREADCRUMB}}").join(page.crumbHtml || "")
    .split("{{CONTENT}}").join(page.content)
    .split("{{PAGE_SCRIPT}}").join(page.fm.script || "");
  if (lang === "en") html = prefixEnglishLinks(html);
  // El selector y las alternas van al final: llevan URLs de los dos idiomas
  // que no deben pasar por el prefijo de /en/.
  html = html.split("{{LANG_SWITCH}}").join(langSwitch(lang, name)).split("{{ALTERNATES}}").join(alternates(name));
  const dest = outputFile(lang, name);
  writeNormalized(dest, html);
  return dest;
}

/* ---------- datos del catálogo (los mismos que usa el navegador) ---------- */
function loadData(lang) {
  const ctx = { document: { documentElement: { lang } } };
  vm.createContext(ctx);
  vm.runInContext(readNormalized(path.join(HERE, "catalogo-datos.js")) +
    "\n;this.D={CATALOG,FAMILIAS,FAM_IMG,PRODUCT_IMG,PHOTO_CREDITS,locItem,imgFor};", ctx);
  return ctx.D;
}

const FAMTXT = {
  es: {
    count: (n) => (n === 1 ? "1 producto en catálogo" : `${n} productos en catálogo`),
    quote: "Solicitar cotización", finder: "Ver en el buscador",
    stock: "Consulte existencia y tiempo de entrega: revisamos cada solicitud contra inventario real antes de responder.",
    specs: "Productos y especificaciones", caption: (f) => `Especificaciones de ${f}`,
    cols: ["Producto", "Norma o especificación", "Medida", "Material", "Ficha técnica", "Cotización"],
    consult: "Consultar", add: "Agregar a cotización", addNamed: (n) => `Agregar a cotización: ${n}`, noDoc: "—", cert: "Certificado incluido",
    brands: "Marcas", downloads: "Descargas", pdfNote: "PDF · vaconsa.com.mx", others: "Otras familias",
    credits: "Fotografías de Wikimedia Commons, recortadas: ",
    title: (f) => `${f} — Vaconsa | Nexo Web`
  },
  en: {
    count: (n) => (n === 1 ? "1 product in the catalog" : `${n} products in the catalog`),
    quote: "Request a quote", finder: "Open in the product finder",
    stock: "Ask about stock and lead time: we check every request against actual inventory before replying.",
    specs: "Products and specifications", caption: (f) => `${f} specifications`,
    cols: ["Product", "Standard or specification", "Size", "Material", "Datasheet", "Quote"],
    consult: "On request", add: "Add to quote", addNamed: (n) => `Add to quote: ${n}`, noDoc: "—", cert: "Mill certificate included",
    brands: "Brands", downloads: "Downloads", pdfNote: "PDF in Spanish · vaconsa.com.mx", others: "Other product families",
    credits: "Photos from Wikimedia Commons, cropped: ",
    title: (f) => `${f} — Vaconsa | Nexo Web`
  }
};

function familyPage(lang, f, D) {
  const t = FAMTXT[lang];
  const label = lang === "en" ? f.en : f.es;
  const desc = lang === "en" ? f.desc_en : f.desc_es;
  const items = D.CATALOG.filter((i) => i.fam === f.fam);
  const hero = D.FAM_IMG[f.fam];
  const used = new Set([hero]);

  const rows = items.map((item) => {
    const L = D.locItem(item, lang);
    const img = D.imgFor(item);
    used.add(img);
    const doc = L.docUrl
      ? `<a class="doc-link" href="${L.docUrl}" target="_blank" rel="noopener">${esc(L.docLabel)}${lang === "en" ? " (PDF, Spanish)" : " (PDF)"}</a>`
      : `<span class="st-muted">${t.cert}</span>`;
    return `      <tr>
        <th scope="row"><div class="st-prod"><img src="${img}" width="800" height="600" alt="" loading="lazy" decoding="async"><span>${esc(L.name)}</span></div></th>
        <td data-label="${t.cols[1]}">${esc(L.norma || t.consult)}</td>
        <td data-label="${t.cols[2]}">${esc(L.diam || t.consult)}</td>
        <td data-label="${t.cols[3]}">${esc(L.mat || t.consult)}</td>
        <td data-label="${t.cols[4]}">${doc}</td>
        <td class="st-act"><button type="button" class="btn sm" data-add="${esc(item.name)}" aria-label="${esc(t.addNamed(L.name))}">${t.add}</button></td>
      </tr>`;
  }).join("\n");

  const brands = f.brands && f.brands.length
    ? `<h2 class="fam-h">${t.brands}</h2>\n    <div class="brands">${f.brands.map((b) => `<span class="brandtag">${esc(b)}</span>`).join("")}</div>` : "";
  const docs = f.docs && f.docs.length
    ? `<h2 class="fam-h">${t.downloads}</h2>
    <ul class="doc-list">
${f.docs.map(([url, es, en]) => `      <li><a href="${url}" target="_blank" rel="noopener"><span class="dl-ico">PDF</span><span class="dl-n">${esc(lang === "en" ? en : es)}</span><span class="dl-m">${t.pdfNote}</span></a></li>`).join("\n")}
    </ul>` : "";
  const others = D.FAMILIAS.filter((x) => x.slug !== f.slug)
    .map((x) => `<a class="fam-chip" href="/productos/${x.slug}/">${esc(lang === "en" ? x.en : x.es)}</a>`).join("");
  const credits = [...used].filter((u) => D.PHOTO_CREDITS[u]).map((u) => {
    const c = D.PHOTO_CREDITS[u];
    return `<a href="${c.p}" rel="noopener">${esc(c.a || "Wikimedia Commons")}</a>, <a href="${c.lu}" rel="noopener">${esc(c.l)}</a>`;
  });

  const content = `<section class="fam-hero">
  <div class="wrap fam-hero-grid">
    <div class="fam-hero-copy">
      <p class="fam-count">${t.count(items.length)}</p>
      <h1>${esc(label)}</h1>
      <p class="fam-desc">${esc(desc)}</p>
      <div class="fam-actions">
        <a class="btn" href="/cotizar/">${t.quote}</a>
        <a class="btn ghost" href="/catalogo/?fam=${encodeURIComponent(f.fam)}">${t.finder}</a>
      </div>
      <p class="fam-stock">${t.stock}</p>
    </div>
    <div class="fam-hero-img"><img src="${hero}" width="800" height="600" alt="" fetchpriority="high"></div>
  </div>
</section>

<section class="fam-body">
  <div class="wrap">
    <h2 class="fam-h">${t.specs}</h2>
    <div class="spec-table-wrap">
    <table class="spec-table">
      <caption class="sr-only">${esc(t.caption(label))}</caption>
      <thead><tr>${t.cols.slice(0, 5).map((c) => `<th scope="col">${c}</th>`).join("")}<th scope="col"><span class="sr-only">${t.cols[5]}</span></th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>
    </div>
    ${brands}
    ${docs}
    <h2 class="fam-h">${t.others}</h2>
    <nav class="fam-others" aria-label="${t.others}">${others}</nav>
    ${credits.length ? `<p class="credits">${t.credits}${credits.join("; ")}.</p>` : ""}
  </div>
</section>`;

  return {
    fm: { title: t.title(label), description: desc, nav: "" },
    content,
    crumbHtml: breadcrumb(lang, [{ text: CRUMB[lang].products, href: "/catalogo/" }, { text: label }])
  };
}

function main() {
  const layoutEs = readNormalized(LAYOUT);
  const names = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith(".html")).map((f) => path.basename(f, ".html")).sort();
  if (!names.includes("inicio")) throw new Error("pages/inicio.html no existe - es la pagina de inicio obligatoria");
  const missingEn = names.filter((n) => !fs.existsSync(path.join(PAGES_DIR, "en", `${n}.html`)));
  if (missingEn.length) throw new Error(`Faltan páginas en inglés en pages/en/: ${missingEn.join(", ")}`);

  const built = [];
  const allNames = [...names];
  for (const lang of LANGS) {
    const dir = lang === "en" ? path.join(PAGES_DIR, "en") : PAGES_DIR;
    for (const name of names) {
      const page = parsePage(path.join(dir, `${name}.html`));
      page.crumbHtml = page.fm.crumb ? breadcrumb(lang, [{ text: page.fm.crumb }]) : "";
      built.push(render(layoutEs, lang, name, page));
    }
    const D = loadData(lang);
    for (const f of D.FAMILIAS) {
      const name = `productos/${f.slug}`;
      if (lang === "es") allNames.push(name);
      built.push(render(layoutEs, lang, name, familyPage(lang, f, D)));
    }
  }

  // sitemap.xml: las dos versiones de cada página, con sus alternas. Las páginas
  // siguen llevando noindex (ver CLAUDE.md), así que no compiten con el sitio
  // oficial de Vaconsa.
  const urls = [];
  for (const name of allNames) for (const lang of LANGS) {
    urls.push(`  <url>
    <loc>${canonicalFor(lang, name)}</loc>
    <xhtml:link rel="alternate" hreflang="es-MX" href="${canonicalFor("es", name)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${canonicalFor("en", name)}"/>
  </url>`);
  }
  writeNormalized(path.join(HERE, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`);

  console.log(`Construidas ${built.length} paginas (${LANGS.join(" + ")}), sitemap con ${urls.length} URLs.`);
}

main();
