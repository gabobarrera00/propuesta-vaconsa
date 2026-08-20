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
                 .replace("{{CONTENT}}", content)
                 .replace("{{PAGE_SCRIPT}}", fm.get("script", "")))
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
