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

## Shared scripts, cotizador and contacts (2026-11-20)

- `catalogo-datos.js` holds `CATALOG`, `FAM_IMG`, `PRODUCT_IMG` and `imgFor()`; every page loads it, then `sitio.js` (cotizador, header search suggestions, scroll reveal). `catalogo.js` only runs on /catalogo/.
- **Cotizador:** "Agregar a cotización" on each catalog card; the list lives in `localStorage` (`vaconsa.cotizacion.v1`, every access in try/catch, only names that exist in CATALOG are accepted). Sending opens the visitor's own WhatsApp (`wa.me/528120106106`) or mail client (`mailto:ventas@vaconsa.com.mx`) with the list prefilled and a closing line saying it came from the Nexo Web proposal. The page itself never posts anything, so the "forms send nothing" rule above still holds — do not replace these links with a real endpoint.
- **Contacts and their source:** phone and address are on vaconsa.com.mx. WhatsApp +52 81 2010 6106 is the number behind the WhatsApp button on vaconsa.com.mx. `ventas@` (instead of their published `asistentecomercial@`) and dropping the San Pedro office were Gabo's decisions (commit df1431d). The hours "Lun–Vie 8:00–18:00" come from the first version of this page and are NOT published on vaconsa.com.mx — confirm before relying on them. vaconsa.com.mx has no real social profiles (its icons link to "#"), so the footer has no social column; add one only with real URLs.
- **Lighthouse (mobile, 11 pages):** performance 93–100, accessibility 100, best practices 100. SEO shows 66–69 only because of `is-crawlable`: that is the deliberate `noindex` and must stay. `robots.txt` allows crawling on purpose so crawlers can read that `noindex`; `sitemap.xml` is generated by `build.js` (gitignored).
- **Photos:** each product uses its own Commons photo when one with a verified licence exists (`img/p-*.jpg`, credits on /catalogo/); otherwise its family photo. Still sharing a photo: Filtros Y (with Trampas de vapor) and Válvula de aguja (with Manómetros). Tubería aleada, Conexión bridada de fierro fundido, Tubing inoxidable and Uniones de golpe use their family photo.

## Build script must not depend on Python

On 2026-08-20 the deploy build step was `python3 build.py || python build.py`. It crash-looped in production for ~15 minutes: Railway's build image has **neither** `python3` **nor** `python` — the fallback didn't help because both branches failed (`sh: 1: python3: not found` / `sh: 1: python: not found`). The fix was rewriting `build.py` as `build.js` (verified byte-for-byte identical output) so the deploy path depends only on Node, which `package.json`'s `engines` field already requires and which Railway therefore already guarantees. **Lesson: never add a runtime dependency to the deploy path (`npm run build`/`npm start`) that isn't already provable from something Railway is known to provide.** A local `python build.py` succeeding is not evidence it'll work on Railway — the two environments are not the same image.

## The page must stay a superset of vaconsa.com.mx

The pitch is *"todo lo que ya tienen, más lo que no tienen"* — that only survives contact with the client if it is literally true. A prospect who asks *"¿y dónde están nuestros catálogos?"* or *"¿y responsabilidad social?"* and finds them missing has just won the argument.

So the page deliberately carries everything their current site carries — the 15 PDF catalogs (linked to the real files on their server), the 1978 history, certifications, the four social-responsibility initiatives, the jobs form with CV upload, the client portal, both locations, the privacy notice — plus the search and quote flow they lack. **Do not trim a section to tidy up the page.** If their site gains something, add it here too.

The social-responsibility section matters more than its size suggests: a company that puts earthquake relief and a pilgrimage in its main nav is signalling what its owners care about. Dropping it reads as not having understood them.

## Content is real — keep it that way

Every norm, class and diameter in the `CATALOG` array in `catalogo.js` was taken from Vaconsa's own product pages (`/valvulas/`, `/tuberia-de-acero-al-carbon/`, `/conexiones/`, `/bridas/`, `/inoxidable/`, `/equipo-de-control-de-presion/`, `/instrumentacion/`, `/pvc/`). The credibility of the pitch rests on a buying engineer recognizing their own specs. Never invent a norm or a pressure class to fill a gap — if something is unknown, the field says "Consultar".

## Design intent

Current direction (2026-11-20, branch `estilo-ferguson`): **distributor storefront**, the layout pattern of large industrial distributors (ferguson.com was the reference; nothing of theirs is copied: no logo, text, photos or code). It replaced the condensed "nameplate" look because the owners found it too boxy and hard to scan.

- **Header stack:** thin disclosure ribbon, then a near-black utility bar (location, hours, Sucursales, Fichas técnicas, Bolsa de trabajo, Ayuda), then the graphite header with logo, a large white search box centred (`id="q"`, red square submit button), Portal de clientes and a red Cotizar button, then the main menu in the same graphite band ("Todos los productos" = /catalogo/).
- **Colour (Gabo, 2026-11-20, replaces the earlier navy/blue):** white background; graphite `#1F2226` (utility bar `#121417`) for header, menu and footer; near-black `#141619` for text and headings; Vaconsa red `#C20E23` as the ONLY accent, for buttons, links, active states and errors. No blue anywhere. Red never tints long headlines or decorative icons. No light-grey fills or faded text: panels are white with a visible border, form fields have a `#7A8087` border. **No dark mode** (removed on purpose). Every text/background pair is at least 4.5:1; minimum measured 5.57 (logo SA).
- **Type:** Archivo at normal width, clear sizes, no condensed headings, sentence case.
- **No hard boxes.** Category grid has no cards or borders: big 4:3 photo, dark title, up to four sublinks (deep links to `/catalogo/?fam=…&q=…`, PDF catalogs, or `/desarrolladores/#urbanizacion|#agua-potable|#edificacion`). Inner-page panels are soft grey fills with a 6px radius; lists use whitespace or a single hairline.
- **Home page:** banner (Monterrey photo, short text, one button), account strip (portal de clientes), "Todos los productos" grid of 12 (9 industrial families + 3 developer systems), help row, photo credits.
- **Photos:** the original stock photos plus five Wikimedia Commons product photos (`img/cat-*.jpg`, cropped). Every Commons photo is credited with author and licence in the home page `.credits` paragraph — keep that in sync if any image changes. The Monterrey photo keeps its Rick González CC BY 2.0 credit wherever it appears.
- **Shape and motion (2026-11-20):** soft radii (buttons 8px, cards 18px, banner and footer top 28px), light shadows, help row as a pill. Motion uses only transform and opacity (150–400 ms) and lives entirely inside `@media (prefers-reduced-motion: no-preference)`; the scroll reveal only runs when the head script adds `.motion` to <html> (IntersectionObserver present and reduced motion not requested), so without it nothing is ever hidden. "Todos los productos" opens a dropdown on hover/keyboard focus (desktop only, hidden under 900px).
- **Catalog cards:** each CATALOG item renders as a card with its family photo (`FAM_IMG` in catalogo.js) and only the name. Specs (norma, medida, material, PDF, Cotizar) overlay the card on hover (hover devices only), on keyboard focus (`:has(:focus-visible)`) or on tap; a second tap or Escape closes; only one open at a time. Empty fields fall back to "Consultar". Only cards new to a render animate in, so typing in the search does not flicker.
- Single search box, thin ribbon and breadcrumbs only on respaldo-tecnico still apply. On phones the menu scrolls horizontally and the search drops to its own row.

## CSS gotcha that already bit once

Descendant selectors on wrapper classes hit nested elements too. `.hero-facts div` matched the inner `.n` and `.l` divs and applied the cell padding three times over, inflating each cell from 70px to 123px and pushing the page 22px wider than the viewport on mobile. It is now `.hero-facts > div`. **Prefer the child combinator for any wrapper-and-cells pattern here.**

## Verifying changes

There is no test suite; verify in a browser and actually measure rather than eyeballing:

- Build then serve locally (`node build.js && python -m http.server`) — opening via `file://` no longer works: links are root-absolute (`/catalogo/`, etc.) and pages load external scripts like `/catalogo.js`, both of which need an actual origin to resolve.
- Check horizontal overflow at a narrow width: `document.documentElement.scrollWidth` must equal `clientWidth`. Window resizing is unreliable on Gabo's machine, so test mobile by loading the page inside a 390px-wide `<iframe>` — media queries respond to the iframe viewport.
- Exercise the flow end to end: search a norm → *Cotizar* → confirm the form prefilled → submit → confirmation panel.
- Check contrast: every visible text against its background must be at least 4.5:1 (large text 3:1). The site is light-only, so do not reintroduce a dark theme.
