#!/usr/bin/env node
/**
 * Genera las paginas estaticas del sitio a partir de _layout.html + pages/*.html.
 *
 * Uso: node build.js
 *
 * Reemplaza a build.py: la imagen de build de Railway no trae python ni
 * python3, y Node ya es la unica runtime que el deploy garantiza (ver
 * package.json "engines").
 */
const fs = require("fs");
const path = require("path");

const HERE = __dirname;
const LAYOUT = path.join(HERE, "_layout.html");
const PAGES_DIR = path.join(HERE, "pages");
const BASE_URL = "https://vaconsa.up.railway.app/";

const FRONTMATTER_RE = /^<!--\s*([\s\S]*?)\s*-->\s*/;

function readNormalized(filePath) {
  return fs.readFileSync(filePath, "utf-8").replace(/\r\n|\r/g, "\n");
}

function writeNormalized(filePath, content) {
  fs.writeFileSync(filePath, content, { encoding: "utf-8" });
}

function parsePage(filePath) {
  const raw = readNormalized(filePath);
  const m = FRONTMATTER_RE.exec(raw);
  if (!m) {
    throw new Error(`${filePath}: falta el bloque de front-matter al inicio`);
  }
  const fmText = m[1];
  const content = raw.slice(m[0].length).trim();

  const fm = {};
  for (const rawLine of fmText.split("\n")) {
    const line = rawLine.trim();
    if (!line || !line.includes(":")) continue;
    const idx = line.indexOf(":");
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    fm[key] = val;
  }

  for (const required of ["title", "description", "nav"]) {
    if (!(required in fm)) {
      throw new Error(`${filePath}: falta '${required}:' en el front-matter`);
    }
  }

  return { fm, content };
}

function outputPath(name) {
  if (name === "inicio") {
    return path.join(HERE, "index.html");
  }
  const folder = path.join(HERE, name);
  fs.mkdirSync(folder, { recursive: true });
  return path.join(folder, "index.html");
}

function canonicalFor(name) {
  return name === "inicio" ? BASE_URL : `${BASE_URL}${name}/`;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function markActiveNav(layoutHtml, navId) {
  if (!navId) return layoutHtml;
  const pattern = new RegExp(`(<a\\b[^>]*\\bdata-nav="${escapeRegExp(navId)}"[^>]*)(>)`);
  return layoutHtml.replace(pattern, (_match, p1, p2) => `${p1} aria-current="page"${p2}`);
}

function buildPage(layoutHtml, name) {
  const { fm, content } = parsePage(path.join(PAGES_DIR, `${name}.html`));
  let pageHtml = markActiveNav(layoutHtml, fm.nav);
  pageHtml = pageHtml
    .split("{{TITLE}}").join(fm.title)
    .split("{{DESCRIPTION}}").join(fm.description)
    .split("{{CANONICAL}}").join(canonicalFor(name))
    .split("{{CONTENT}}").join(content)
    .split("{{PAGE_SCRIPT}}").join(fm.script || "");
  const dest = outputPath(name);
  writeNormalized(dest, pageHtml);
  return dest;
}

function main() {
  const layoutHtml = readNormalized(LAYOUT);
  const names = fs
    .readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.basename(f, ".html"))
    .sort();

  if (!names.includes("inicio")) {
    throw new Error("pages/inicio.html no existe - es la pagina de inicio obligatoria");
  }

  const built = names.map((name) => buildPage(layoutHtml, name));
  console.log(`Construidas ${built.length} paginas:`);
  for (const p of built) {
    console.log(" -", path.relative(HERE, p));
  }
}

main();
