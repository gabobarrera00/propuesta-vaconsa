# Propuesta de rediseño — Vaconsa

**Live (oficial, el link que se manda):** https://vaconsa.up.railway.app _(2026-08-20: Railway pasa a ser el link oficial — deploy automático en cada push a `main`, siempre al día)_
**Live (Vercel, respaldo):** https://propuesta-vaconsa.vercel.app _(deploy manual vía CLI — desactualizado desde que se fusionó el PR de auditoría; no compartir hasta volver a publicar con `vercel login` + `npx vercel deploy --prod`)_

Propuesta de rediseño (no solicitada) del sitio de **Vaconsa Productos Industriales**, distribuidora de tubería, válvulas y conexiones en Monterrey, N.L. — construida como pieza de prospección de **Nexo Web**, el servicio de páginas web de Gabo.

**No es el sitio oficial de Vaconsa.** La página lo declara de forma visible arriba y en el pie, y está marcada `noindex` para que no aparezca en buscadores ni compita con su sitio real.

## Por qué existe

El sitio actual (vaconsa.com.mx) tiene problemas concretos que cuestan negocio:

| Hallazgo | Impacto |
|---|---|
| Meta descripción por defecto de WordPress (*"Otro sitio realizado con WordPress"*) | Google no tiene qué mostrar en resultados |
| `<title>` idéntico ("Vaconsa") en las 6 páginas | Ninguna página posiciona por su tema |
| "Solicitar Cotización" es un `mailto:` vacío | El CTA principal no captura nada y falla en móvil |
| Footer "© 2017" y catálogos PDF de octubre 2017 | Lee como empresa abandonada |
| Cero redes sociales enlazadas | Sin señal de actividad |

Esta propuesta ataca el más caro: **convertir la cotización en un flujo real**.

## Qué demuestra

La propuesta es un **superconjunto** del sitio actual: conserva todo lo que Vaconsa ya ofrece y agrega la capa comercial que le falta. Eso es deliberado — un rediseño que borra contenido no se puede defender en una junta.

**Lo que agrega**

- **Buscador de especificaciones** — 25 familias de producto con sus normas reales (ASTM A106, A312 TP316L, API 600, API 6D, API 7K, ASME B16.5…), filtrables por texto y por familia. Escribir `a106` encuentra la ficha correcta.
- **Cotización en un clic** — cada resultado prellena material y norma en el formulario y salta a él.
- **Servicios en planta** — corte, roscado, galvanizado, calibración y marcado, hoy enterrados al fondo de una página.
- **Dibujo técnico en SVG** — brida acotada con línea de eje y cuadro de rótulo, en vez de foto de stock.

**Lo que conserva del sitio actual**

- Los **15 catálogos y tablas dimensionales** en PDF, enlazados a los archivos reales de su servidor — y además adjuntos a cada resultado de búsqueda, no solo listados aparte.
- **Historia** (fundación 1978, razón social original) y las **certificaciones** ASTM · ASME · API · NACE.
- **Responsabilidad social** — las cuatro iniciativas: terremoto, Día del Niño, regreso a clases y peregrinación.
- **Bolsa de trabajo** con área de interés y carga de CV.
- **Portal de clientes**, ambas ubicaciones con enlace a mapa, y el aviso de privacidad.

El contenido técnico es real, extraído de las propias páginas de producto de Vaconsa.

## Arquitectura

Sitio multi-página generado a partir de una plantilla compartida, con un build step chico:

- `_layout.html` — cabecera, nav, footer y bloque `<head>` comunes a toda página, con marcadores (`{{TITLE}}`, `{{DESCRIPTION}}`, `{{CANONICAL}}`, `{{CONTENT}}`, `{{PAGE_SCRIPT}}`) que `build.js` reemplaza
- `pages/*.html` — una página por sección (inicio, catálogo, fichas técnicas, servicios, desarrolladores, nosotros, respaldo técnico, responsabilidad, cotizar, dónde estamos, portal de clientes), cada una con su propio front-matter (`title`, `description`, `nav`, `script` opcional) y su contenido
- `build.js` — combina `_layout.html` + cada `pages/*.html` y escribe la salida estática: `pages/inicio.html` se convierte en `index.html` (raíz), el resto en `<seccion>/index.html`, así que cada sección vive en su propia URL (`/catalogo/`, `/cotizar/`, etc.). Es Node plano (sin dependencias), no Python — la imagen de build de Railway no trae ni `python` ni `python3`, y Node es la única runtime que el deploy garantiza (ver `engines` en `package.json`).

`node build.js` (o `npm run build`) regenera todo el sitio estático a partir de las fuentes. La salida generada (`index.html` en la raíz + las carpetas de sección) no se versiona — ver `.gitignore` — se produce en cada build, local o en Railway.

**Copia gemela en el vault:** `vault/03 - export/paginas-web/vaconsa-propuesta.html`. Ahora mirror solo de la página de inicio (`index.html` generado, no el sitio completo) — es la variante publicada como Artifact, idéntica salvo que no lleva `<!doctype>`, `<html>`, `<head>` ni `<body>` (el publicador los inyecta) y sus enlaces/imágenes están absolutizados a `vaconsa.up.railway.app`. `python sync-vault-copy.py` la regenera después de `node build.js` — este script sí sigue en Python porque solo corre localmente (nunca en Railway), donde Python está disponible.

## Cómo verlo

```
node build.js
python -m http.server 8940
```

Abre `http://localhost:8940/`. Cada sección vive en su propia URL (`/catalogo/`, `/fichas-tecnicas/`, `/servicios/`, `/desarrolladores/`, `/nosotros/`, `/respaldo-tecnico/`, `/responsabilidad/`, `/cotizar/`, `/donde-estamos/`, `/portal-clientes/`).

## Deploy

Railway (oficial) conectado directo al repo — auto-deploy en cada push a `main`. `npm run start` corre `npm run build` (`node build.js`, regenera todas las páginas) antes de levantar `serve .`, así que el build corre como parte del arranque en vez de depender de una fase de build separada de Railway. **Nota histórica:** la primera versión de este build step usaba `python build.py` con un *fallback* a `python3` — se rompió en producción el 2026-08-20 porque la imagen de build de Railway no trae ninguno de los dos instalados (crash-loop, sitio caído ~15 min hasta el fix). Se reescribió en Node (`build.js`, salida idéntica byte a byte, verificado) precisamente para no depender de un binario que Railway no garantiza. Vercel (respaldo) vía CLI manual: `npx vercel deploy --prod` — requiere `vercel login` la primera vez, por eso quedó desactualizado.

## Estado

Pieza de prospección — todavía no presentada a Vaconsa. Ver `experiment-paginas-web.md` en el vault de Gabo para el seguimiento.
