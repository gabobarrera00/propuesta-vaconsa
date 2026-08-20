# Multi-page restructure — Vaconsa proposal site

**Date:** 2026-08-20
**Status:** Approved by Gabo ("dale, va así")
**Repo:** `propuesta-vaconsa`

## Why

The site started as a single scrolling `index.html` and grew to 10 sections (~1,370 lines) after today's "Desarrolladores y constructores" addition. Gabo asked for it to be reorganized "en carpetas" — clarified: each section becomes its own page with its own URL (`/desarrolladores`, `/servicios`, etc.), plus a new home page introducing who Vaconsa is and what they specialize in, with a short preview of each section and a link into it.

## Goals

- Every existing section becomes its own real page at a clean URL (`/nombre/` → `nombre/index.html`).
- New home page (`/`): who Vaconsa is, what they specialize in, a short preview card per section linking into it (design call — Gabo delegated this).
- Header/nav/footer/WhatsApp button defined once, shared by every page — a nav or footer edit is a one-file change, not ten.
- No content is rewritten from scratch — existing copy, specs, forms, and data (catalog, portal demo clients) move as-is from section to page.
- No new runtime framework. Consistent with the project's existing tooling (`sync-vault-copy.py` is already a small Python script) and with Gabo's own earlier decision that Vaconsa gets a real framework migration only alongside a bigger future redesign, not now.

## Non-goals

- No real backend for the client portal (still the fake-login prototype, unchanged in behavior).
- No CMS, no client-side router, no npm build tooling (no React/Vite here).
- No content changes beyond what's needed to split sections into pages (copy stays the same).

## Architecture

```
propuesta-vaconsa/
  _layout.html          ← shared shell: <head> boilerplate, <style>, header/nav, footer, WhatsApp button, {{CONTENT}} marker
  pages/
    inicio.html          → /
    catalogo.html         → /catalogo/
    fichas-tecnicas.html  → /fichas-tecnicas/
    servicios.html        → /servicios/
    desarrolladores.html  → /desarrolladores/
    nosotros.html         → /nosotros/
    respaldo-tecnico.html → /respaldo-tecnico/
    responsabilidad.html  → /responsabilidad/
    cotizar.html          → /cotizar/
    donde-estamos.html    → /donde-estamos/
    portal-clientes.html  → /portal-clientes/
  build.py               ← reads _layout.html + each pages/*.html, writes final static HTML
  img/, og.jpg, sync-vault-copy.py, package.json, ...  (unchanged)
```

`build.py` output: `index.html` at repo root (home) plus one folder per other page containing its own `index.html` (e.g. `desarrolladores/index.html`), so Railway's static file server (`serve`) resolves `/desarrolladores` to `/desarrolladores/index.html` with zero server config.

## Page front-matter

Each `pages/*.html` file starts with a tiny front-matter block `build.py` parses and strips before injecting the rest as `{{CONTENT}}`:

```html
<!--
title: Desarrolladores y constructores — Vaconsa | Nexo Web
description: Tubería, conexiones y válvulas para redes de urbanización...
nav: desarrolladores
-->
<section class="dev" id="desarrolladores">
  ...
</section>
```

- `title` / `description` → become that page's `<title>` and `<meta name="description">` / `og:title` / `og:description` in `_layout.html`'s head. This also fixes, for this proposal site, the exact defect the original audit flagged on the *real* vaconsa.com.mx (identical title on every page) — worth getting right here since it's now genuinely per-page.
- `nav` → tells `_layout.html` which header link gets `aria-current="page"` (styled active, not clickable to itself).
- `canonical` / `og:url` derive automatically from the page's own output path.

## JS split

Today's single `<script>` block (line 1024–1364) splits by section, based on what each function/handler actually touches:

| Stays in `_layout.html` (every page) | Moves into its page's own `<script>` |
|---|---|
| `year` footer stamp | `catalogo.html`: `CATALOG` data, chips, `render()`, `escapeHtml()`, search input listener |
| WhatsApp float button markup | `donde-estamos.html`: jobs form submit handler |
| — | `cotizar.html`: quote form submit handler + prefill-from-URL (see below) |
| — | `portal-clientes.html`: `PORTAL_CLIENTS` data, `mxn()`, `renderClients()`, login/logout handlers |

**Cross-page prefill (the one real behavior change).** Today, clicking "Cotizar" on a catalog result scrolls to the quote form *on the same page* and fills it in. Once `/catalogo` and `/cotizar` are different pages, that can't scroll — so the catalog's "Cotizar" buttons instead navigate to `/cotizar/?prod=...&norma=...`, and `cotizar.html`'s script reads those query params on load to prefill the same two fields. Same UX, one hop.

## Vault twin (Artifact) copy

`sync-vault-copy.py` currently mirrors the single `index.html` into `vault/03 - export/paginas-web/vaconsa-propuesta.html` for Artifact publishing. An Artifact is one page, so it can't mirror the whole multi-page site. After this change it mirrors **only the built home page** (root `index.html`, post-build) — the Artifact becomes a homepage preview, not a full site mirror. `BASE` (already fixed today to the Railway URL) is what makes its now-more relative links absolute. Note this scope-narrowing in the repo's `README.md`.

## Railway deploy

`package.json`'s `start` script already serves static files (`serve .`). Add a `build` step (`python build.py`) that Railway runs before `start`, so a push of only source files (`_layout.html`, `pages/*.html`) still deploys the generated pages. If Railway's Python isn't available in that build image, fall back to running `build.py` locally and committing the generated output — decide during implementation based on what Railway's build actually has available.

## Verification plan

Same as today's practice: serve the built output locally (`python -m http.server`), open every page in the browser, check nav highlighting, the catalog → cotizar prefill hand-off, the portal demo login/expand/logout, the jobs form, dark and light mode, before pushing.

## Open questions / decisions left to implementation

- Exact home-page preview copy per section (design-time call, not a blocker).
- Whether `respaldo-tecnico` stays its own page or folds into `nosotros` — spec keeps them separate (1:1 with today's sections) since Gabo said "todas las secciones," not "consolida algunas."
