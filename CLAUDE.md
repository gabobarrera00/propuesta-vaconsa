# CLAUDE.md — Propuesta Vaconsa

## What this is

An unsolicited redesign proposal for **Vaconsa Productos Industriales** (vaconsa.com.mx), an industrial distributor of pipe, valves and fittings in Monterrey. Built as a prospecting piece for **Nexo Web**, Gabo's web-services venture (see `experiment-paginas-web` in his vault). Gabo doesn't code — direction comes from him, execution from Claude.

## The one rule that is not negotiable

**The page must never be able to pass as Vaconsa's official site.**

It carries their name and a mark resembling their logo, which is inherent to a redesign proposal — so the disclosure is what keeps it honest:

- The dark ribbon at the very top (`.demo-bar`) states it is not the official site and names Nexo Web.
- The footer repeats it.
- The quote form says twice that it sends nothing real, and it genuinely posts nowhere.
- `<meta name="robots" content="noindex, nofollow">` keeps it out of search results so it can never compete with or be mistaken for their real site.

Do not remove any of these, and do not wire the form to a real endpoint while the page still carries Vaconsa's branding.

## Architecture

Multi-page site generated from a shared template, with a small build step:

- `_layout.html` — header, nav, footer and the common `<head>` block, with placeholders (`{{TITLE}}`, `{{DESCRIPTION}}`, `{{CANONICAL}}`, `{{CONTENT}}`, `{{PAGE_SCRIPT}}`) that `build.js` fills in
- `pages/*.html` — one page per section (inicio, catálogo, fichas técnicas, servicios, desarrolladores, nosotros, respaldo técnico, responsabilidad, cotizar, dónde estamos, portal de clientes), each with its own front-matter (`title`, `description`, `nav`, optional `script`) and content
- `build.js` — combines `_layout.html` + each `pages/*.html` into the static output: `pages/inicio.html` becomes root `index.html`, the rest become `<seccion>/index.html`, so every section lives at its own URL (`/catalogo/`, `/cotizar/`, etc.). Plain Node, no dependencies — **not Python**: Railway's build image ships neither `python` nor `python3`, and Node is the one runtime the deploy actually guarantees (see `engines` in `package.json`). This bit production once already (see "Build script must not depend on Python" below) — don't reintroduce a Python dependency in the deploy path.
- `sync-vault-copy.py` — the ONE script in this repo that's still Python, and that's fine: it only ever runs locally (never on Railway), where Python is available.

`node build.js` (or `npm run build`) regenerates the whole static site from source. The generated output (root `index.html` + the section folders) is gitignored — it's produced on every build, local or on Railway.

There is a **twin copy** at `vault/03 - export/paginas-web/vaconsa-propuesta.html` — the Artifact-published variant, generated from the built home page only (`python sync-vault-copy.py`, run after `node build.js`). It omits `<!doctype>`, `<html>`, `<head>` and `<body>` (the Artifact publisher injects those) and therefore also omits the `<meta viewport>` and SEO/OG tags that only the hosted version needs, and it absolutizes internal links/images to `vaconsa.up.railway.app` since the Artifact has no sibling pages or `img/` folder next to it. **It covers the home page only, not the whole site** — regenerate it after any `pages/inicio.html` or shared `_layout.html` change, or it drifts.

## Build script must not depend on Python

On 2026-08-20 the deploy build step was `python3 build.py || python build.py`. It crash-looped in production for ~15 minutes: Railway's build image has **neither** `python3` **nor** `python` — the fallback didn't help because both branches failed (`sh: 1: python3: not found` / `sh: 1: python: not found`). The fix was rewriting `build.py` as `build.js` (verified byte-for-byte identical output) so the deploy path depends only on Node, which `package.json`'s `engines` field already requires and which Railway therefore already guarantees. **Lesson: never add a runtime dependency to the deploy path (`npm run build`/`npm start`) that isn't already provable from something Railway is known to provide.** A local `python build.py` succeeding is not evidence it'll work on Railway — the two environments are not the same image.

## The page must stay a superset of vaconsa.com.mx

The pitch is *"todo lo que ya tienen, más lo que no tienen"* — that only survives contact with the client if it is literally true. A prospect who asks *"¿y dónde están nuestros catálogos?"* or *"¿y responsabilidad social?"* and finds them missing has just won the argument.

So the page deliberately carries everything their current site carries — the 15 PDF catalogs (linked to the real files on their server), the 1978 history, certifications, the four social-responsibility initiatives, the jobs form with CV upload, the client portal, both locations, the privacy notice — plus the search and quote flow they lack. **Do not trim a section to tidy up the page.** If their site gains something, add it here too.

The social-responsibility section matters more than its size suggests: a company that puts earthquake relief and a pilgrimage in its main nav is signalling what its owners care about. Dropping it reads as not having understood them.

## Content is real — keep it that way

Every norm, class and diameter in the `CATALOG` array in `catalogo.js` was taken from Vaconsa's own product pages (`/valvulas/`, `/tuberia-de-acero-al-carbon/`, `/conexiones/`, `/bridas/`, `/inoxidable/`, `/equipo-de-control-de-presion/`, `/instrumentacion/`, `/pvc/`). The credibility of the pitch rests on a buying engineer recognizing their own specs. Never invent a norm or a pressure class to fill a gap — if something is unknown, the field says "Consultar".

## Design intent

The concept is *engineering datasheet*, not corporate brochure: hairline rules, zero border-radius, monospaced tabular figures for every spec, and a hero that is an SVG sectional drawing of a weld-neck flange with dimension lines. Vaconsa's brand red (`#C8102E`) is the single accent over steel-biased neutrals. Deliberately no stock photography — the visual language comes from their own trade.

## CSS gotcha that already bit once

Descendant selectors on wrapper classes hit nested elements too. `.hero-facts div` matched the inner `.n` and `.l` divs and applied the cell padding three times over, inflating each cell from 70px to 123px and pushing the page 22px wider than the viewport on mobile. It is now `.hero-facts > div`. **Prefer the child combinator for any wrapper-and-cells pattern here.**

## Verifying changes

There is no test suite; verify in a browser and actually measure rather than eyeballing:

- Build then serve locally (`node build.js && python -m http.server`) — opening via `file://` no longer works: links are root-absolute (`/catalogo/`, etc.) and pages load external scripts like `/catalogo.js`, both of which need an actual origin to resolve.
- Check horizontal overflow at a narrow width: `document.documentElement.scrollWidth` must equal `clientWidth`. Window resizing is unreliable on Gabo's machine, so test mobile by loading the page inside a 390px-wide `<iframe>` — media queries respond to the iframe viewport.
- Exercise the flow end to end: search a norm → *Cotizar* → confirm the form prefilled → submit → confirmation panel.
- Check both themes; the page is token-driven with `prefers-color-scheme` plus `[data-theme]` overrides.
