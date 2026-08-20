# Propuesta de rediseño — Vaconsa

**Live (oficial, el link que se manda):** https://propuesta-vaconsa.vercel.app
**Live (Railway, espejo):** https://vaconsa.up.railway.app _(mismo commit, deploy automático en cada push a `main` — Vercel sigue siendo la fuente de verdad hasta que se decida lo contrario)_

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

Un solo archivo, sin dependencias ni build step:

- `index.html` — estructura, estilos y lógica en el mismo archivo

Es una demo de una página: separar en `style.css`/`script.js` (como en `regios-solutions`) no aporta nada aquí y complica mantener sincronizada la copia del vault.

**Copia gemela en el vault:** `vault/03 - export/paginas-web/vaconsa-propuesta.html`. Es la variante publicada como Artifact, idéntica salvo que no lleva `<!doctype>`, `<html>`, `<head>` ni `<body>` (el publicador los inyecta). Si editas una, edita la otra.

## Cómo verlo

Abre `index.html` en el navegador. No requiere servidor.

## Deploy

Vercel (oficial) vía CLI manual: `npx vercel deploy --prod`. Railway (espejo) conectado directo al repo — auto-deploy en cada push a `main`, sirviendo los archivos estáticos tal cual con `serve` (`package.json` mínimo, sin build step real).

## Estado

Pieza de prospección — todavía no presentada a Vaconsa. Ver `experiment-paginas-web.md` en el vault de Gabo para el seguimiento.
