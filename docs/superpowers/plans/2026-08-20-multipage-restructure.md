# Multi-page restructure — Vaconsa proposal site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the single-file `index.html` (10 sections, ~1,370 lines) into a real multi-page static site — one URL per section plus a new home page — while sharing header/nav/footer/CSS from one place via a small Python build script.

**Architecture:** A shared `_layout.html` shell (head boilerplate + `<style>` + header/nav/footer/WhatsApp button, with `{{TITLE}}`/`{{DESCRIPTION}}`/`{{CANONICAL}}`/`{{CONTENT}}` slots) is combined by `build.py` with one content-only file per page under `pages/`, producing static output: `index.html` at the repo root for the home page, `{name}/index.html` for every other page (so `serve` resolves clean URLs like `/desarrolladores/` with zero server config).

**Tech Stack:** Plain HTML/CSS/JS (unchanged), Python 3 for the build script (no new runtime dependency — same tooling class as the existing `sync-vault-copy.py`).

**Spec:** `docs/superpowers/specs/2026-08-20-multipage-restructure-design.md`

## Global Constraints

- No new npm/node build tooling — Python only, matching `sync-vault-copy.py` precedent.
- No content rewrites beyond what the split requires — copy, specs, and data move verbatim from the current `index.html` unless a task explicitly says otherwise (only `pages/inicio.html` is genuinely new copy).
- Every page's `<title>` and meta description must be distinct and accurate to that page's content (this is the exact defect the original Vaconsa audit flagged on the real site — do not reintroduce it here).
- `BASE_URL` for canonical/og URLs is `https://vaconsa.up.railway.app/` (already the official link, confirmed 2026-08-20).
- Every task ends by running `python build.py`, serving the output locally (`python -m http.server` from repo root), and checking the affected page(s) in a browser before committing.
- Work happens in an isolated git worktree (branch `multipage-restructure`) so the live `main` branch — and Railway's deploy from it — is untouched until the final merge task.

---

### Task 1: Build pipeline + shared layout + home page

**Files:**
- Create: `build.py`
- Create: `_layout.html`
- Create: `pages/inicio.html`
- Reference (read-only, for verbatim extraction): `index.html:3-17` (head meta), `index.html:18-482` (`<style>` block), `index.html:492-525` (header), `index.html:1011-1022` (footer + WhatsApp button)

**Interfaces:**
- Produces: `build.py` CLI (`python build.py`, no args) — reads `_layout.html` + every `pages/*.html`, writes built output. Every later task depends on this running correctly.
- Produces: `_layout.html` template slots `{{TITLE}}`, `{{DESCRIPTION}}`, `{{CANONICAL}}`, `{{CONTENT}}`, plus header nav links each carrying a `data-nav="<id>"` attribute that `build.py` matches against each page's front-matter `nav:` value to mark the current page (`aria-current="page"`).
- Produces: page front-matter contract — every `pages/*.html` file MUST start with an HTML comment block:
  ```html
  <!--
  title: ...
  description: ...
  nav: ...
  -->
  ```
  followed by the page's content. `nav:` must match one of the `data-nav` values in `_layout.html`'s header, or be empty (no matching nav link) — used by pages like `respaldo-tecnico` and `cotizar` that have no dedicated nav item today.

- [ ] **Step 1: Write `build.py`**

```python
#!/usr/bin/env python3
"""Genera las paginas estaticas del sitio a partir de _layout.html + pages/*.html.

Uso: python build.py
"""
import io
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
LAYOUT = os.path.join(HERE, "_layout.html")
PAGES_DIR = os.path.join(HERE, "pages")
BASE_URL = "https://vaconsa.up.railway.app/"

FRONTMATTER_RE = re.compile(r"^<!--\s*(.*?)\s*-->\s*", re.DOTALL)


def parse_page(path):
    raw = io.open(path, encoding="utf-8").read()
    m = FRONTMATTER_RE.match(raw)
    if not m:
        raise SystemExit("%s: falta el bloque de front-matter al inicio" % path)
    fm_text = m.group(1)
    content = raw[m.end():].strip()

    fm = {}
    for line in fm_text.splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, _, val = line.partition(":")
        fm[key.strip()] = val.strip()

    for required in ("title", "description", "nav"):
        if required not in fm:
            raise SystemExit("%s: falta '%s:' en el front-matter" % (path, required))

    return fm, content


def output_path(name):
    if name == "inicio":
        return os.path.join(HERE, "index.html")
    folder = os.path.join(HERE, name)
    os.makedirs(folder, exist_ok=True)
    return os.path.join(folder, "index.html")


def canonical_for(name):
    return BASE_URL if name == "inicio" else "%s%s/" % (BASE_URL, name)


def mark_active_nav(layout_html, nav_id):
    if not nav_id:
        return layout_html
    pattern = re.compile(r'(<a\b[^>]*\bdata-nav="%s"[^>]*)(>)' % re.escape(nav_id))
    return pattern.sub(lambda m: m.group(1) + ' aria-current="page"' + m.group(2), layout_html, count=1)


def build_page(layout_html, name):
    fm, content = parse_page(os.path.join(PAGES_DIR, name + ".html"))
    page_html = mark_active_nav(layout_html, fm["nav"])
    page_html = (page_html
                 .replace("{{TITLE}}", fm["title"])
                 .replace("{{DESCRIPTION}}", fm["description"])
                 .replace("{{CANONICAL}}", canonical_for(name))
                 .replace("{{CONTENT}}", content))
    dest = output_path(name)
    io.open(dest, "w", encoding="utf-8", newline="\n").write(page_html)
    return dest


def main():
    layout_html = io.open(LAYOUT, encoding="utf-8").read()
    names = sorted(
        os.path.splitext(f)[0]
        for f in os.listdir(PAGES_DIR)
        if f.endswith(".html")
    )
    if "inicio" not in names:
        raise SystemExit("pages/inicio.html no existe - es la pagina de inicio obligatoria")
    built = [build_page(layout_html, name) for name in names]
    print("Construidas %d paginas:" % len(built))
    for path in built:
        print(" -", os.path.relpath(path, HERE))


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Write `_layout.html`**

Build this file in three parts:

1. **Head boilerplate** — copy `index.html:3-17` verbatim, then replace the page-specific values with template slots so it reads:
   ```html
   <!doctype html>
   <html lang="es-MX">
   <head>
   <meta charset="utf-8">
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <title>{{TITLE}}</title>
   <meta name="description" content="{{DESCRIPTION}}">
   <meta name="robots" content="noindex, nofollow">
   <meta property="og:type" content="website">
   <meta property="og:locale" content="es_MX">
   <meta property="og:title" content="{{TITLE}}">
   <meta property="og:description" content="{{DESCRIPTION}}">
   <meta name="twitter:card" content="summary_large_image">
   <meta property="og:image" content="https://vaconsa.up.railway.app/og.jpg">
   <meta property="og:image:width" content="1200">
   <meta property="og:image:height" content="630">
   <link rel="canonical" href="{{CANONICAL}}">
   <style>
   ```
2. **Style block** — copy `index.html:19-481` (everything between the `<style>` line at 18 and the `</style>` line at 482, exclusive of both tag lines since `<style>` is already opened above) verbatim, then close with `</style>\n</head>\n<body>`.
3. **Header, content marker, footer, WhatsApp button, script** — copy `index.html:492-525` (header) verbatim EXCEPT for these exact substitutions:
   - `<a class="brand" href="#top">` → `<a class="brand" href="/">`
   - `<a href="#catalogo">Catálogo</a>` → `<a href="/catalogo/" data-nav="catalogo">Catálogo</a>`
   - `<a href="#documentos">Fichas técnicas</a>` → `<a href="/fichas-tecnicas/" data-nav="fichas-tecnicas">Fichas técnicas</a>`
   - `<a href="#servicios">Servicios</a>` → `<a href="/servicios/" data-nav="servicios">Servicios</a>`
   - `<a href="#desarrolladores">Desarrolladores</a>` → `<a href="/desarrolladores/" data-nav="desarrolladores">Desarrolladores</a>`
   - `<a href="#nosotros">Nosotros</a>` → `<a href="/nosotros/" data-nav="nosotros">Nosotros</a>`
   - `<a href="#social">Responsabilidad</a>` → `<a href="/responsabilidad/" data-nav="responsabilidad">Responsabilidad</a>`
   - `<a href="#contacto">Contacto</a>` → `<a href="/donde-estamos/" data-nav="donde-estamos">Contacto</a>`
   - `<a class="portal" href="#portal-clientes" title="Portal de clientes">` → `<a class="portal" href="/portal-clientes/" title="Portal de clientes" data-nav="portal-clientes">`
   - `<a class="btn" href="#cotizar">Solicitar cotización</a>` → `<a class="btn" href="/cotizar/" data-nav="cotizar">Solicitar cotización</a>`

   Immediately after the closed `</header>`, add:
   ```html
   {{CONTENT}}
   ```

   Then copy `index.html:1011-1022` (footer + WhatsApp button) verbatim EXCEPT:
   - `<a class="wa" href="#cotizar" aria-label="Contactar por WhatsApp">` → `<a class="wa" href="/cotizar/" aria-label="Contactar por WhatsApp">`

   Then add:
   ```html
   <script>
   document.getElementById('year').textContent = new Date().getFullYear();
   </script>
   {{PAGE_SCRIPT}}
   </body>
   </html>
   ```
   (`{{PAGE_SCRIPT}}` is a plain string, not run through the same `.replace()` calls as the other slots — see Step 3: pages with no extra JS simply have nothing to substitute there, so add one more `.replace("{{PAGE_SCRIPT}}", fm.get("script", ""))` line to `build_page()` in `build.py` before writing the file, reading an optional `script:` front-matter key that names a `<script src="...">` tag or is empty. Update `build.py` now to add this.)

- [ ] **Step 3: Update `build.py`'s `build_page()` to support the optional `script` front-matter key**

Add to `parse_page()`'s required-keys check: only `title`, `description`, `nav` stay required; `script` is optional (`fm.get("script", "")`). Add to `build_page()`, right after the `{{CONTENT}}` replace:
```python
    page_html = page_html.replace("{{PAGE_SCRIPT}}", fm.get("script", ""))
```

- [ ] **Step 4: Write `pages/inicio.html`**

```html
<!--
title: Vaconsa — Tubería, válvulas y conexiones industriales | Nexo Web
description: Distribuidora industrial en Monterrey desde 1978. Tubería, válvulas y conexiones bajo norma ASTM, API y ASME — y, en paralelo, sistemas de urbanización y edificación para desarrolladores y constructores.
nav:
-->
<section class="hero" id="top">
  <div class="wrap">
    <div class="eyebrow"><div class="rule"></div><span>Monterrey, N.L. · Desde 1978</span></div>
    <h1>TUBERÍA, VÁLVULAS<br>Y CONEXIONES<br><em>PARA CADA PROYECTO</em></h1>
    <p>Distribuimos acero al carbón, inoxidable y aleaciones bajo especificación ASTM, API y ASME para la industria de Monterrey — y, en paralelo, sistemas de urbanización y edificación para desarrolladores y constructores.</p>
    <div class="stats">
      <div><div class="v">48</div><div class="l">Años operando</div></div>
      <div><div class="v">¼"–60"</div><div class="l">Rango de diámetro</div></div>
      <div><div class="v">2</div><div class="l">Líneas de negocio</div></div>
    </div>
  </div>
</section>

<section class="services" id="preview">
  <div class="wrap">
    <div class="sec-head"><h2>Cómo podemos ayudarle</h2></div>
    <div class="svc-grid">
      <a class="svc" href="/catalogo/"><div class="n">01</div><h3>Buscador de material</h3><p>Busque por norma, material o medida y reciba precio y disponibilidad el mismo día.</p></a>
      <a class="svc" href="/fichas-tecnicas/"><div class="n">02</div><h3>Catálogos y fichas técnicas</h3><p>Tablas dimensionales y catálogos de fábrica descargables.</p></a>
      <a class="svc" href="/servicios/"><div class="n">03</div><h3>Servicios en planta</h3><p>Corte, roscado, galvanizado, calibración y marcado — listo para instalar.</p></a>
      <a class="svc" href="/desarrolladores/"><div class="n">04</div><h3>Desarrolladores y constructores</h3><p>Urbanización, agua potable, edificación y obra civil para desarrollos habitacionales.</p></a>
      <a class="svc" href="/nosotros/"><div class="n">05</div><h3>Nosotros</h3><p>48 años respaldando proyectos industriales del noreste.</p></a>
      <a class="svc" href="/respaldo-tecnico/"><div class="n">06</div><h3>Respaldo técnico</h3><p>Normas ASTM, ASME, API, NACE y marcas representadas con soporte de fábrica.</p></a>
      <a class="svc" href="/responsabilidad/"><div class="n">07</div><h3>Responsabilidad social</h3><p>Iniciativas de la empresa con su comunidad.</p></a>
      <a class="svc" href="/donde-estamos/"><div class="n">08</div><h3>Dónde estamos</h3><p>Oficinas, distribución y bolsa de trabajo.</p></a>
    </div>
  </div>
</section>
```

Note: the `<a class="svc">` cards reuse the existing `.svc`/`.svc-grid` CSS classes as clickable links instead of static divs — this needs one small additive CSS rule (`.svc` is currently styled as `<div>`; anchors need `text-decoration:none;color:inherit;` to not look like a raw link). Add to `_layout.html`'s copied `<style>` block, right after the existing `.svc p{...}` rule:
```css
  a.svc{text-decoration:none;color:inherit;cursor:pointer;}
```

- [ ] **Step 5: Run the build and verify the home page**

```bash
python build.py
```
Expected: prints `Construidas 1 paginas:` and ` - index.html` (only `inicio.html` exists in `pages/` so far — this is expected at this point in the plan).

Then:
```bash
python -m http.server 8940
```
Open `http://localhost:8940/index.html` in a browser. Verify: page loads with no console errors, title bar shows "Vaconsa — Tubería, válvulas y conexiones industriales | Nexo Web", header/nav/footer/WhatsApp button render identically to the current live site, the 8 preview cards are clickable links (they'll 404 until later tasks build their targets — that's expected right now, just confirm the href values are `/catalogo/`, `/fichas-tecnicas/`, etc.), dark and light mode both render correctly (toggle OS theme or use devtools).

- [ ] **Step 6: Commit**

```bash
git add build.py _layout.html pages/inicio.html
git commit -m "feat: add build pipeline + shared layout + home page"
```

---

### Task 2: `catalogo.html` (buscador de material) + cross-page prefill

**Files:**
- Create: `pages/catalogo.html`
- Reference: `index.html:593-616` (finder section), `index.html:1027-1218` (CATALOG data, chips, render, escapeHtml, prefill, input listener)

**Interfaces:**
- Consumes: `_layout.html`'s `{{PAGE_SCRIPT}}` slot (Task 1)
- Produces: `prefill(prod, norma)` behavior changes from same-page scroll to cross-page navigation — Task 7 (`cotizar.html`) depends on the URL contract this task establishes: `/cotizar/?prod=<value>&norma=<value>` (both URL-encoded).

- [ ] **Step 1: Write `pages/catalogo.html`**

Front matter:
```html
<!--
title: Buscador de material — Vaconsa | Nexo Web
description: Busque tubería, conexiones y válvulas por norma, material o medida — ASTM, API, ASME, PVC. Cada resultado trae su ficha técnica y cotiza en un clic.
nav: catalogo
script: <script src="/catalogo.js"></script>
-->
```

Content: copy `index.html:593-616` (the `<section class="finder" id="catalogo">...</section>` block) verbatim as the body.

- [ ] **Step 2: Write `catalogo.js`**

Copy `index.html:1027-1216` verbatim (the `CATALOG` array through the `qEl.addEventListener('input', render)` line) into a new file `catalogo.js` at the repo root, EXCEPT replace the `prefill()` function (currently `index.html:1207-1214`) with:

```javascript
function prefill(prod, norma){
  const url = '/cotizar/?prod=' + encodeURIComponent(prod) + '&norma=' + encodeURIComponent(norma);
  window.location.href = url;
}
```

Also copy the two lines that run at load time (`buildChips(); render();`, currently `index.html:1217-1218`) to the end of `catalogo.js`.

- [ ] **Step 3: Rebuild and verify**

```bash
python build.py
python -m http.server 8940
```
Open `http://localhost:8940/catalogo/`. Verify: search box filters results as you type, family chips filter correctly, clicking "Cotizar" on any result navigates to a URL like `/cotizar/?prod=Tuber%C3%ADa...&norma=ASTM+A106` (this will 404 until Task 7 — confirm the URL shape is correct in the address bar, that's the deliverable this task owns).

- [ ] **Step 4: Commit**

```bash
git add pages/catalogo.html catalogo.js build.py
git commit -m "feat: add catalogo page, prefill navigates cross-page now"
```

---

### Task 3: `fichas-tecnicas.html` and `servicios.html`

**Files:**
- Create: `pages/fichas-tecnicas.html`
- Create: `pages/servicios.html`
- Reference: `index.html:618-668` (docs section), `index.html:670-682` (services section)

Both are static content with no page-specific JS — bundled into one task since neither has an independent behavior a reviewer could accept/reject separately from the other.

- [ ] **Step 1: Write `pages/fichas-tecnicas.html`**

```html
<!--
title: Catálogos y fichas técnicas — Vaconsa | Nexo Web
description: Tablas dimensionales y catálogos de fábrica de Vaconsa — tubería y conexiones, bridas, acero inoxidable, válvulas e instrumentación, descargables en PDF.
nav: fichas-tecnicas
-->
```
followed by `index.html:618-668` copied verbatim as the body.

- [ ] **Step 2: Write `pages/servicios.html`**

```html
<!--
title: Servicios en planta — Vaconsa | Nexo Web
description: Corte, roscado, biselado, maquinado de brida, galvanizado, calibración de manómetros y marcado de piezas — material listo para instalar, sin que su cuadrilla lo haga en obra.
nav: servicios
-->
```
followed by `index.html:670-682` copied verbatim as the body.

- [ ] **Step 3: Rebuild and verify**

```bash
python build.py
python -m http.server 8940
```
Open `http://localhost:8940/fichas-tecnicas/` and `http://localhost:8940/servicios/`. Verify both render full content, all PDF download links work (open in new tab, confirm 200 not 404), nav highlights the correct current page on each.

- [ ] **Step 4: Commit**

```bash
git add pages/fichas-tecnicas.html pages/servicios.html
git commit -m "feat: add fichas-tecnicas and servicios pages"
```

---

### Task 4: `desarrolladores.html`

**Files:**
- Create: `pages/desarrolladores.html`
- Reference: `index.html:684-766` (dev section, added earlier today)

- [ ] **Step 1: Write `pages/desarrolladores.html`**

```html
<!--
title: Desarrolladores y constructores — Vaconsa | Nexo Web
description: Sistemas de urbanización, agua potable, edificación y obra civil para desarrollos habitacionales horizontales y verticales — tubería, conexiones y válvulas bajo norma NMX, NOM y AWWA.
nav: desarrolladores
-->
```
followed by `index.html:684-766` copied verbatim as the body.

**Watch for:** the three `<img src="img/desarrolladores-*.jpg">` tags use a relative path. Since this page now builds to `desarrolladores/index.html` (one folder deep) instead of repo root, a relative `img/...` path would resolve to `desarrolladores/img/...` and 404. Change all three `src="img/..."` to `src="/img/..."` (absolute from site root) in this file.

- [ ] **Step 2: Rebuild and verify**

```bash
python build.py
python -m http.server 8940
```
Open `http://localhost:8940/desarrolladores/`. Verify: all three photos load (hero skyline, C900 pipes, fire-system pipes — not broken image icons), the tall-photo crop fix from earlier today still holds, all four content groups render (Urbanización, Agua potable, Edificación, plus the closing statement).

- [ ] **Step 3: Commit**

```bash
git add pages/desarrolladores.html
git commit -m "feat: add desarrolladores page, fix now-relative image paths"
```

---

### Task 5: `nosotros.html` and `respaldo-tecnico.html`

**Files:**
- Create: `pages/nosotros.html`
- Create: `pages/respaldo-tecnico.html`
- Reference: `index.html:768-786` (about section), `index.html:788-817` (trust section)

Bundled for the same reason as Task 3 — both static, no independent behavior.

- [ ] **Step 1: Write `pages/nosotros.html`**

```html
<!--
title: Nosotros — Vaconsa | Nexo Web
description: Vaconsa Productos Industriales, fundada en 1978 como Válvulas y Conexiones del Norte, S.A. de C.V. — 48 años respaldando a la industria energética, siderúrgica, química y manufacturera del noreste.
nav: nosotros
-->
```
followed by `index.html:768-786` copied verbatim as the body.

- [ ] **Step 2: Write `pages/respaldo-tecnico.html`**

```html
<!--
title: Respaldo técnico — Vaconsa | Nexo Web
description: Material certificado bajo normas ASTM, ASME, API y NACE, con marcas representadas de soporte directo de fábrica — Walworth, Proval, Worcester, Petroforja, Pantech Steel, EMMSA, Cresco.
nav:
-->
```
followed by `index.html:788-817` copied verbatim as the body. (`nav:` is intentionally empty — the current site has no dedicated nav link for this section either, per the spec's decision to keep every section 1:1 without inventing new nav entries.)

- [ ] **Step 3: Rebuild and verify**

```bash
python build.py
python -m http.server 8940
```
Open `http://localhost:8940/nosotros/` and `http://localhost:8940/respaldo-tecnico/`. Verify both render full content (timeline, norm badges, brand tags) and that `respaldo-tecnico`'s nav shows no active-highlighted link (expected — it has none).

- [ ] **Step 4: Commit**

```bash
git add pages/nosotros.html pages/respaldo-tecnico.html
git commit -m "feat: add nosotros and respaldo-tecnico pages"
```

---

### Task 6: `responsabilidad.html`

**Files:**
- Create: `pages/responsabilidad.html`
- Reference: `index.html:819-855` (social section)

- [ ] **Step 1: Write `pages/responsabilidad.html`**

```html
<!--
title: Responsabilidad social — Vaconsa | Nexo Web
description: Las iniciativas de responsabilidad social de Vaconsa con su comunidad en Monterrey.
nav: responsabilidad
-->
```
followed by `index.html:819-855` copied verbatim as the body.

- [ ] **Step 2: Rebuild and verify**

```bash
python build.py
python -m http.server 8940
```
Open `http://localhost:8940/responsabilidad/`. Verify full content renders, nav highlights "Responsabilidad".

- [ ] **Step 3: Commit**

```bash
git add pages/responsabilidad.html
git commit -m "feat: add responsabilidad page"
```

---

### Task 7: `cotizar.html` (quote form + prefill receiver)

**Files:**
- Create: `pages/cotizar.html`
- Create: `cotizar.js`
- Reference: `index.html:857-919` (quote section), `index.html:1240-1275` (quoteForm submit handler)

**Interfaces:**
- Consumes: the `/cotizar/?prod=...&norma=...` URL contract established in Task 2.

- [ ] **Step 1: Write `pages/cotizar.html`**

```html
<!--
title: Solicitar cotización — Vaconsa | Nexo Web
description: Solicite cotización de tubería, válvulas o conexiones — respuesta el mismo día hábil.
nav: cotizar
script: <script src="/cotizar.js"></script>
-->
```
followed by `index.html:857-919` copied verbatim as the body.

- [ ] **Step 2: Write `cotizar.js`**

Copy `index.html:1240-1275` verbatim (the `quoteForm` submit handler) into `cotizar.js`, then add this new block ABOVE that handler in the same file, to read `?prod=`/`?norma=` from the URL on page load and fill the form (replacing what `prefill()` used to do on the single-page version):

```javascript
(function prefillFromQuery(){
  const params = new URLSearchParams(window.location.search);
  const prod = params.get('prod');
  const norma = params.get('norma');
  if (!prod && !norma) return;
  const form = document.getElementById('quoteForm');
  if (!form) return;
  if (prod) form.querySelector('#f-prod').value = prod;
  if (norma) form.querySelector('#f-norma').value = norma;
  form.querySelector('#f-cant').focus();
})();
```

- [ ] **Step 3: Rebuild and verify**

```bash
python build.py
python -m http.server 8940
```
1. Open `http://localhost:8940/cotizar/` directly — form is empty, submits correctly (check the existing submit-success UI still fires).
2. Open `http://localhost:8940/catalogo/`, click "Cotizar" on any result, confirm it lands on `/cotizar/` with the product and norma fields pre-filled from the URL query params — this closes the loop Task 2 opened.

- [ ] **Step 4: Commit**

```bash
git add pages/cotizar.html cotizar.js
git commit -m "feat: add cotizar page with cross-page prefill receiver"
```

---

### Task 8: `donde-estamos.html` (contact + bolsa de trabajo)

**Files:**
- Create: `pages/donde-estamos.html`
- Create: `donde-estamos.js`
- Reference: `index.html:921-979` (contact section, includes the jobs form), `index.html:1220-1239` (jobsForm submit handler)

- [ ] **Step 1: Write `pages/donde-estamos.html`**

```html
<!--
title: Dónde estamos — Vaconsa | Nexo Web
description: Oficinas y centro de distribución de Vaconsa en Santa Catarina, N.L. — contacto directo y bolsa de trabajo.
nav: donde-estamos
script: <script src="/donde-estamos.js"></script>
-->
```
followed by `index.html:921-979` copied verbatim as the body.

- [ ] **Step 2: Write `donde-estamos.js`**

Copy `index.html:1220-1239` verbatim (the `jobsForm` submit handler) into `donde-estamos.js`.

- [ ] **Step 3: Rebuild and verify**

```bash
python build.py
python -m http.server 8940
```
Open `http://localhost:8940/donde-estamos/`. Verify: office address and map link render, `mailto:ventas@vaconsa.com.mx` link correct, jobs form submits and shows its existing success state, native validation still rejects a malformed email (type `asdf` in the email field, confirm the browser blocks submit — this was the validation fix from earlier today, must survive the split).

- [ ] **Step 4: Commit**

```bash
git add pages/donde-estamos.html donde-estamos.js
git commit -m "feat: add donde-estamos page"
```

---

### Task 9: `portal-clientes.html`

**Files:**
- Create: `pages/portal-clientes.html`
- Create: `portal-clientes.js`
- Reference: `index.html:981-1009` (portal-demo section), `index.html:1275-1364` (PORTAL_CLIENTS data, mxn, renderClients, login/logout handlers — this range comes after both the jobsForm and quoteForm handlers in the original file, so no overlap with Task 7 or Task 8's extractions)

- [ ] **Step 1: Write `pages/portal-clientes.html`**

```html
<!--
title: Portal de clientes — Vaconsa | Nexo Web
description: Prototipo de portal donde los clientes de Vaconsa verían sus facturas directamente, sin llamar a pedir un estado de cuenta.
nav: portal-clientes
script: <script src="/portal-clientes.js"></script>
-->
```
followed by `index.html:981-1009` copied verbatim as the body.

- [ ] **Step 2: Write `portal-clientes.js`**

Copy `index.html:1275-1364` verbatim into `portal-clientes.js` — the `PORTAL_CLIENTS` array, `mxn()`, `renderClients()`, the `portalLoginForm` submit handler, and the `portalLogout` click handler.

- [ ] **Step 3: Rebuild and verify**

```bash
python build.py
python -m http.server 8940
```
Open `http://localhost:8940/portal-clientes/`. Verify: fake login accepts any credentials, client list renders with the 5 example companies, clicking a client expands its invoice table (folio/fecha/monto/estatus), "Salir" logs out and shows the login form again — exact same behavior as the version another session built into the single-page site this morning, just now on its own URL.

- [ ] **Step 4: Commit**

```bash
git add pages/portal-clientes.html portal-clientes.js
git commit -m "feat: add portal-clientes page"
```

---

### Task 10: Deploy wiring, vault twin, cleanup, and full-site verification

**Files:**
- Modify: `package.json`
- Modify: `sync-vault-copy.py`
- Modify: `README.md`
- Delete: `index.html` (the old single-file source — its content now lives split across `_layout.html` + `pages/*.html`; the build regenerates a NEW `index.html` at the repo root as build output, so this delete removes the old hand-written source, not the site's home page)

**Interfaces:**
- Consumes: every page built by Tasks 1–9 — this task is the integration checkpoint for the whole plan.

- [ ] **Step 1: Add a build step to `package.json`**

Read the current `package.json` (`cat package.json`) and add a `build` script that runs before `start`. If it currently looks like:
```json
{
  "scripts": {
    "start": "serve ."
  }
}
```
change the `scripts` block to:
```json
{
  "scripts": {
    "build": "python build.py",
    "start": "npm run build && serve ."
  }
}
```
(Running the build as part of `start` — rather than relying on a separate Railway build phase — means this works regardless of whether Railway's build image has Python; `serve` only starts after `build.py` has already produced the pages.)

- [ ] **Step 2: Update `sync-vault-copy.py` to mirror only the built home page**

Read the current file. It currently reads `index.html` from the repo root as SOURCE. After Task 1–9, that's no longer the hand-written single-page source — it's `build.py`'s generated output for the home page, which is exactly what should be mirrored (an Artifact is one page; the home page is the right one to preview). No code change should be needed if `SRC` already points at `os.path.join(HERE, "index.html")` — verify that's still the case, and confirm by running:
```bash
python build.py
python sync-vault-copy.py
```
Expected: succeeds, writes to the vault path, and the output no longer contains `id="catalogo"` or other section markup (since the home page is now just the hero + preview cards) — open the written file and confirm it matches the home page content, not the old full single-page dump.

- [ ] **Step 3: Update `README.md`**

Read the current README. Update the "Arquitectura" section (currently describes "un solo archivo, sin dependencias ni build step") to describe the new structure: `_layout.html` + `pages/*.html` + `build.py`, one URL per section, `python build.py` (or `npm run build`) regenerates the static output. Update the "Copia gemela en el vault" note to say it now mirrors only the home page, not the full site (per Task 2 above). Update the "Deploy" section to mention the new `npm run build && serve .` start command.

- [ ] **Step 4: Delete the old single-file source**

```bash
git rm index.html
```
(This removes the hand-written source from git. `build.py` will regenerate a new `index.html` locally as build output — confirm this in the next step — but that regenerated file should NOT be committed, since it's now a build artifact. Add `/index.html` to `.gitignore` — but only the root one, not `pages/inicio.html` — check `.gitignore`'s current content first and append `index.html` on its own line if not already covered by an existing pattern. Also add the other generated output folders — every directory `build.py` creates via `output_path()`: `catalogo/`, `fichas-tecnicas/`, `servicios/`, `desarrolladores/`, `nosotros/`, `respaldo-tecnico/`, `responsabilidad/`, `cotizar/`, `donde-estamos/`, `portal-clientes/` — to `.gitignore` as well, so Railway's own `npm run build` is what produces them at deploy time, not a stale committed copy.)

- [ ] **Step 5: Full-site verification pass**

```bash
python build.py
python -m http.server 8940
```
Open every one of these URLs in the browser and confirm each renders correctly, nav highlights the right page, and dark/light mode both work: `/`, `/catalogo/`, `/fichas-tecnicas/`, `/servicios/`, `/desarrolladores/`, `/nosotros/`, `/respaldo-tecnico/`, `/responsabilidad/`, `/cotizar/`, `/donde-estamos/`, `/portal-clientes/`.

Then re-run the two cross-page flows end to end:
1. `/catalogo/` → click "Cotizar" on a result → lands on `/cotizar/` with fields pre-filled.
2. `/` → click each of the 8 preview cards → lands on the matching page (no 404s).

- [ ] **Step 6: Commit**

```bash
git add package.json sync-vault-copy.py README.md .gitignore
git commit -m "chore: wire up build step for deploy, retire single-file index.html"
```

---

## Self-review notes

- **Spec coverage:** every section in `docs/superpowers/specs/2026-08-20-multipage-restructure-design.md` maps to a task — file structure (Task 1), page inventory (Tasks 1–9), JS split table (Tasks 2, 7, 8, 9), vault twin scope-narrowing (Task 10), Railway deploy (Task 10), verification plan (every task's final step + Task 10's full pass).
- **Cross-page prefill** is the one genuine behavior change from the current site — Tasks 2 and 7 are explicit about the exact contract (`/cotizar/?prod=...&norma=...`) so neither task's implementer has to guess the other's interface.
- **Image path fix** (Task 4) was caught during this self-review: every other page is content-only with no local asset references, but `desarrolladores.html` has the three photos added earlier today, and moving that content one folder deeper breaks their relative paths if not caught — now explicit in Task 4 rather than left to be discovered at verification time.
