#!/usr/bin/env python3
"""Genera la copia del vault (variante Artifact) a partir de index.html.

El sitio hospedado y el Artifact publicado son la misma página, pero el
publicador de Artifacts inyecta `<!doctype>`, `<html>`, `<head>` y `<body>`,
asi que la copia del vault no debe traerlos. Mantener las dos a mano es una
fuente segura de drift, asi que la copia se genera:

    python sync-vault-copy.py

Diferencias que aplica, y por que:
  - quita el envoltorio del documento (lo pone el publicador)
  - quita viewport/OG/robots (solo le sirven a la version hospedada)
  - convierte los enlaces relativos entre paginas en absolutos, porque
    dentro del Artifact no existe `auditoria.html` ni `/catalogo/` al lado
    (desde el split multi-pagina los enlaces internos son root-relative,
    p. ej. `/catalogo/`, no `catalogo.html`)
"""
import io
import os
import re
import sys

BASE = "https://vaconsa.up.railway.app/"
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "index.html")
DEST = os.path.join(
    os.path.expanduser("~"),
    "aios", "vault", "03 - export", "paginas-web", "vaconsa-propuesta.html",
)


def absolutize(path):
    """BASE ya termina en '/': quita cualquier '/' inicial de path antes de
    concatenar, o un href/src root-relative (p. ej. '/catalogo/') produce
    un doble slash ('...mx//catalogo/')."""
    return BASE + path.lstrip("/")


def build(src_html):
    style_start = src_html.index("<style>")
    body_start = src_html.index("<body>") + len("<body>")
    body_end = src_html.rindex("</body>")

    style = src_html[style_start:src_html.index("</style>") + len("</style>")]
    body = src_html[body_start:body_end].strip()

    # dentro del Artifact no hay paginas hermanas: absolutiza los enlaces.
    # Cubre tanto el estilo viejo relativo (`auditoria.html`) como el
    # root-relative que usan todas las paginas desde el split
    # (`/catalogo/`, `/`, `/cotizar/`) - pero no protocol-relative (`//host`).
    body = re.sub(r'href="(?!https?:|mailto:|tel:|#|//)(/[^"]*|[^"]+\.html)"',
                  lambda m: 'href="%s"' % absolutize(m.group(1)), body)

    # tampoco hay carpeta img/ (ni catalogo.js, etc.) junto al Artifact:
    # absolutiza cualquier src relativo o root-relative
    body = re.sub(r'src="(?!https?:|data:|//)([^"]+)"',
                  lambda m: 'src="%s"' % absolutize(m.group(1)), body)

    return '<meta charset="utf-8">\n<title>Propuesta Vaconsa</title>\n%s\n\n%s\n' % (style, body)


def main():
    src = io.open(SRC, encoding="utf-8").read()
    out = build(src)
    if not os.path.isdir(os.path.dirname(DEST)):
        sys.exit("No encuentro el vault en %s" % os.path.dirname(DEST))
    io.open(DEST, "w", encoding="utf-8", newline="\n").write(out)
    print("escrito %s (%d bytes)" % (DEST, len(out)))


if __name__ == "__main__":
    main()
