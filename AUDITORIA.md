# Auditoría — Propuesta Vaconsa

Revisión de `index.html`, `auditoria.html`, `sync-vault-copy.py` y los `CLAUDE.md` en el commit `da59e7d`.

Gabo: lee primero la auditoría de `regios-solutions`, porque **esta empieza donde esa termina**. La hiciste un día después y el salto es grande. Aquí hay menos defectos y más arquitectura — que es la señal de que ya pasaste de "¿se ve bien?" a "¿aguanta?".

---

## Lo que hiciste bien, y no es cortesía

Esto es lo más importante del documento, así que va primero. En **un día** entre un repo y el otro corregiste solo, sin que nadie te lo dijera:

- **Cero emojis. Nueve SVG en línea**, incluido un corte técnico de una brida con líneas de cota. En `regios` había catorce emojis. Esto es exactamente el hallazgo #4 de esa auditoría, resuelto antes de que existiera la auditoría.
- **`:focus-visible`** presente. En `regios` no había ninguno.
- **`prefers-reduced-motion`** respetado, apagando el `scroll-behavior: smooth`. En `regios` faltaba.
- **Modo oscuro completo, con el patrón correcto de tres capas** — variables en `:root` pelón, luego `@media (prefers-color-scheme: dark)` protegido con `:root:not([data-theme="light"])`, luego `:root[data-theme="dark"]`. Ese `:not()` es el detalle que casi nadie pone y es lo que hace que el interruptor manual gane en las dos direcciones. Si esto salió de una plantilla, entiéndelo; si lo entendiste, es nivel profesional.
- **`textContent` para todo dato que viene del usuario**, más un `escapeHtml()` para el único lugar que arma HTML. Esa es la defensa contra inyección de HTML/JS y la aplicaste por costumbre, no por susto. Es la decisión de seguridad más importante en una página con un buscador y la tomaste bien.
- **`aria-pressed` en los chips de familia.** Un botón que se queda "activo" necesita decir su estado; sin eso un lector de pantalla anuncia "Válvulas, botón" y nunca "presionado".
- **La regla de divulgación en `CLAUDE.md`,** marcada como no negociable: cinta oscura arriba, repetida en el pie, el formulario avisa dos veces que no envía nada y de hecho no envía nada, y `noindex, nofollow`. Y la instrucción explícita de no conectar el formulario a un endpoint real mientras la página lleve la marca de Vaconsa. **Eso es más rigor ético que el de muchas agencias que cobran.** Volveré a esto abajo, porque tiene un hueco.
- **La regla de integridad del contenido:** *"nunca inventes una norma o una clase de presión para llenar un hueco; si no se sabe, el campo dice Consultar."* Es la regla correcta y la razón es la correcta: la credibilidad se sostiene en que un ingeniero de compras reconozca sus propias especificaciones. Un dato inventado ahí mata la venta y la relación.
- **Documentaste el error de CSS que ya te había morddido** — `.hero-facts div` pegándole a los hijos anidados y triplicando el padding, resuelto con `>`. Escribir el error en el `CLAUDE.md` para que no vuelva es exactamente lo que hace un equipo maduro.
- **Los commits.** Conventional Commits, en español, un cambio lógico cada uno, y el mensaje dice el *por qué*: `fix: el conteo de hallazgos decía 10, son 12`. Mucha gente con años de experiencia escribe "cambios" y ya.
- **El método de `auditoria.html`:** doce hallazgos, cinco categorías, cada uno con su impacto — **y una sección de "lo que ya funciona bien".** Ese último bloque es lo que separa a un consultor de alguien que llegó a criticar. Un cliente que solo recibe defectos se pone a la defensiva.

Ahora los hallazgos.

---

## Importante

### 1. Escribiste la validación correcta y luego la apagaste

`index.html:686` y `index.html:760` — los dos formularios llevan `novalidate`.

Mira el marcado que ya escribiste:

```html
<input type="email" id="f-mail" name="correo" required placeholder="compras@empresa.com">
```

Eso es **perfecto**. `type="email"` le dice al navegador que valide el formato y además le da al celular el teclado con la `@`. `required` hace que el navegador bloquee el envío y muestre el mensaje en el idioma del usuario, gratis, sin una línea de JavaScript.

Y luego `novalidate` desactiva todo eso, y el JS lo reemplaza con esto:

```js
if (!el.value.trim()){ el.focus(); el.style.borderColor = 'var(--red)'; return; }
```

Que solo revisa que no esté vacío. Consecuencias medibles:

- **`asdf` pasa como correo válido.** Pruébalo. Un prospecto se equivoca al teclear, cree que envió su solicitud, y Vaconsa nunca lo puede contactar. En un formulario de cotización industrial, ese es dinero perdido de las dos partes.
- **El borde rojo nunca se quita.** Lo pintas en `el.style.borderColor` y no hay código que lo regrese. El usuario corrige el campo y sigue viéndolo rojo.
- **No hay mensaje de error.** Solo un borde de color. Alguien con daltonismo — más o menos uno de cada doce hombres, y este formulario lo llenan ingenieros de compras — no ve absolutamente nada. No sabe qué falló ni por qué no se envió.
- **No hay `aria-invalid` ni región de anuncio.** Con lector de pantalla el envío falla **en silencio total**.

La lección general, y es una de las grandes:

> Cuando el navegador ya hace algo, hacerlo tú a mano casi siempre resulta peor. No porque programes mal, sino porque la plataforma lleva veinte años cubriendo casos que tú no vas a pensar: idiomas, teclados de móvil, lectores de pantalla, autocompletado, teclado físico.

**Arreglo (aplicado en el formulario de cotización, el de bolsa de trabajo es tuyo):** quité `novalidate`, borré el bucle de validación a mano, y agregué CSS con `:user-invalid` para pintar el campo mal llenado **solo después de que la persona lo tocó** — no al cargar la página, que es el error clásico de `:invalid`. Menos código y más funcionalidad.

**Cómo pedirlo:** *"Usa la validación nativa del navegador. Nada de `novalidate`. Estilos con `:user-invalid`, y JavaScript solo para lo que la plataforma no hace."*

---

### 2. `twitter:card` promete una imagen grande que no existe

`index.html:13` declara `summary_large_image` y **no hay ninguna etiqueta `og:image` en el archivo.**

El resultado es la peor de las tres opciones: pediste la tarjeta grande, no hay imagen que ponerle, y la tarjeta sale rota o degradada según la app. Es peor que no haber pedido nada.

Y fíjate: **el hallazgo #3 de tu propia `auditoria.html` es exactamente esto** — *"sin imagen de vista previa al compartir el enlace"* — sobre el sitio de Vaconsa. Lo mismo pasó en `regios`. Dos de dos. Cuando encuentras un defecto en el trabajo de otro, revísalo en el tuyo **el mismo día**; es la costumbre más rentable de esta auditoría.

Importa el doble aquí, porque esta página **se manda por WhatsApp o correo a un director de compras.** Cómo se ve la vista previa *es* la primera impresión, antes de que abra el enlace.

**Arreglo:** produce un PNG o JPG de **1200 × 630 px** — el corte técnico de la brida que ya dibujaste sobre el fondo de papel, con el logo de Nexo Web y "Propuesta de rediseño". Guárdalo en el repo y enlázalo con URL absoluta (las relativas no funcionan en `og:image`). Mientras no exista, `summary` en lugar de `summary_large_image`. *(No lo arreglé porque hay que producir la imagen, y esa decisión de diseño es tuya.)*

---

### 3. El buscador no le dice nada a quien no puede ver la pantalla

`index.html:497` — el contenedor de resultados no tiene `aria-live`.

Cuando alguien escribe `a106` y la lista pasa de 25 tarjetas a 1, quien ve la pantalla lo nota de inmediato. Con lector de pantalla, **no pasa nada**: el foco sigue en el campo de texto y nadie anuncia que los resultados cambiaron. El buscador — que es la pieza central de la propuesta, el argumento entero — es inusable.

**Arreglo (aplicado):** agregué una región `aria-live="polite"` que anuncia el conteo ("12 resultados"). `polite` espera a que la persona termine de escribir en lugar de interrumpir cada tecla, que es lo correcto para un buscador que filtra al teclear.

---

### 4. Dos detalles de comportamiento

**a) Los anclas quedan tapadas por el encabezado pegajoso.** No hay `scroll-padding-top` y el header es `sticky`. Se nota en el menú y también en `prefill()`, donde compensaste con `block:'start'`. Con `scroll-padding-top` en el `html` se arregla para todos los saltos de una vez, incluidos los de `scrollIntoView`. *(Aplicado — una línea.)*

**b) `setTimeout(() => ..., 500)` es una carrera, no una espera.** `index.html:1000` — después de un scroll suave pones el foco a los 500 ms a ver si ya llegó. Con la página larga, un teléfono lento o `prefers-reduced-motion` activo, 500 ms es el número equivocado en las dos direcciones: o mueves el foco antes de tiempo, o dejas medio segundo muerto. Lo correcto es el evento `scrollend`, con `setTimeout` como respaldo para los navegadores que aún no lo tienen. *(No lo arreglé: es buen ejercicio y el arreglo es de cinco líneas.)*

La lección: **un número mágico de milisegundos es casi siempre la señal de que no encontraste el evento correcto.** Cuando escribas `setTimeout` con un número inventado, ese es el momento de buscar qué evento estás esperando de verdad.

---

## Arquitectura — el hallazgo que de verdad importa

### 5. Ya te pasaste del límite de un archivo, y el script de sincronización es la prueba

Tres cosas por separado que son la misma cosa:

1. **`index.html` pesa 58 KB con el CSS y el JS adentro.** El navegador no puede guardar en caché nada por separado: cada visita descarga los estilos y la lógica otra vez, aunque no hayan cambiado.
2. **`CATALOG` tiene 25 registros de producto codificados dentro del HTML** — familia, norma, diámetro, material, etiquetas, URL de catálogo. Son *datos*, viviendo dentro de una *presentación*.
3. **Existe `sync-vault-copy.py`** cuyo trabajo entero es generar una segunda copia de la misma página porque una vive en el repo y otra en el vault.

El punto 3 es la confesión. **Escribiste un programa para pelear contra un problema que solo existe porque hay dos copias de la misma verdad.** Y lo escribiste bien — es la respuesta correcta al problema equivocado. La respuesta correcta al problema correcto es que haya **una sola fuente y dos salidas generadas de ella**. Eso se llama *build step*, y este repo acaba de ganárselo.

Y el punto 2 es la bomba de tiempo. Hoy son 25 productos. Cuando Vaconsa diga *"súbenos los otros 60"* o *"quítale el precio a este"*, la pregunta va a ser: ¿voy a editar a mano un arreglo de JavaScript dentro de un archivo HTML de 58 KB, y luego correr un script de Python para regenerar la otra copia? Hazlo dos veces y vas a meter un error de sintaxis que tumba el buscador completo.

**La secuencia de arreglo, en orden de esfuerzo:**

| Paso | Qué haces | Qué compras |
|---|---|---|
| 1 | Saca `CATALOG` a `catalogo.json` y cárgalo con `fetch` | Los datos se editan sin tocar código. Un error de JSON no tumba la página. |
| 2 | Saca el `<style>` y el `<script>` a archivos | El navegador los guarda en caché. Segunda visita, más rápida. |
| 3 | Un build step que genere las dos salidas de una fuente | `sync-vault-copy.py` desaparece. El drift se vuelve imposible, no solo improbable. |

**No necesitas React para nada de esto.** Los pasos 1 y 2 son HTML y un `fetch`. Y ojo — **la decisión original de un solo archivo fue correcta**, y lo escribiste en el `README`: *"separar en style.css/script.js no aporta nada aquí"*. Tenías razón **cuando lo escribiste**. Dejó de ser cierto cuando apareció el segundo destino de publicación. Eso es lo normal: las decisiones de arquitectura no se equivocan, **caducan**. Saber cuándo caducó una es la habilidad.

Cuándo sí necesitas un framework está en `NEXO-WEB-PLAYBOOK.md`, con este repo como el ejemplo de "estás a un paso".

---

## Menores

- **`lang="es"`, y en `regios` pusiste `lang="es-MX"`.** La variante regional es mejor (corrección ortográfica, separación de sílabas, acento del lector de pantalla) y ya lo sabías. Elige uno y aplícalo siempre — la inconsistencia entre dos repos tuyos del mismo mes es la señal de que falta una lista de verificación, no conocimiento. *(Aplicado: `es-MX`.)*
- **`.gitignore` dice `.vercel` dos veces.** Trivial y aun así vale decirlo: es un archivo de cuatro líneas. Si no notaste una línea repetida en cuatro, la costumbre a construir es *releer el diff antes de hacer commit*, no *ser más cuidadoso*. `git diff --staged` antes de cada commit, siempre. *(Aplicado.)*
- **Sin `canonical` y sin favicon** en ninguna de las dos páginas. *(Canonical aplicado.)*
- **`card.innerHTML = '<plantilla>'` y luego `querySelector().textContent = ...`** — funciona y es seguro, pero construye el DOM dos veces por tarjeta. La forma idiomática es el elemento `<template>` en el HTML y `cloneNode(true)`: se parsea una sola vez, y la plantilla queda visible en el marcado en lugar de escondida en una cadena de JavaScript. Con 25 tarjetas no se nota; con 200 sí.
- **El indicador de foco y el de error son del mismo color.** `index.html:204` — `input:focus` pone `border-color: var(--red)`, y el rojo es también el color de "algo está mal". Un campo enfocado y un campo mal llenado se ven igual. Se nota más ahora que la validación nativa sí marca los inválidos: por eso el `:user-invalid` que agregué lleva además un anillo (`outline`), para que se distingan. Lo correcto de fondo es que el foco use un color neutro o de acento y el rojo quede reservado para el error. Es tu paleta, así que la decisión es tuya.
- **`escapeHtml()` se usa en un solo lugar** — el estado de "sin coincidencias". Es correcto, pero es el único punto de la página donde armas HTML con una cadena, y por eso es el único que podría fallar algún día. Ese bloque se puede hacer con `textContent` igual que los demás y entonces `escapeHtml` se borra. **Menos caminos, menos riesgo:** una función de seguridad que solo se usa una vez suele significar que ese lugar debería usar el patrón de los otros.

---

## Lo que le falta a tu página de auditoría

`auditoria.html` cubre cinco categorías: SEO y metadatos, conversión, contenido desactualizado, marca y redes, portal de usuarios. Doce hallazgos. El método es bueno.

**Falta una sexta categoría: rendimiento y experiencia en móvil.**

Es la que más pesa en una junta, porque no es opinión: es un número que Google publica de su sitio. "Su página tarda X segundos en cargar en un celular con datos móviles" es un argumento que nadie discute, y encima Google lo usa para posicionar.

No te doy el número. **Te doy el método, y hay una razón:** yo medí vaconsa.com.mx dos veces y me dio 11.8 s la primera y 0.75 s la segunda. Una sola medición no es un dato — es una anécdota. Si llevas "11.8 segundos" a la junta y el director abre su sitio y carga rápido, **perdiste toda tu credibilidad y la propuesta completa con ella.**

Así que: [PageSpeed Insights](https://pagespeed.web.dev/) sobre `vaconsa.com.mx`, pestaña móvil, **tres veces en días distintos**, y reportas el rango con las tres fechas. Mira LCP (cuándo aparece el contenido principal), CLS (cuánto brinca la página al cargar) e INP (qué tan rápido responde al tocarla). Y como es WordPress de 2017 sin mantenimiento, es muy probable que haya algo real ahí — pero *probable* no se pone en una propuesta.

Esa regla vale para todo lo que hagas:

> Un número medido una vez no es un dato. Mide tres veces, reporta el rango, di cuándo lo mediste. Y si no lo puedes sostener, no lo pongas.

---

## Sobre mandar esto — la parte que no es código

Tu regla de divulgación es sólida. Le falta una distinción y vale mucho:

**`noindex` detiene a los buscadores. No detiene a las personas.** `propuesta-vaconsa.vercel.app` responde 200 a quien tenga el enlace. Está bien — con la cinta de divulgación es honesto — pero tienes que saber la diferencia antes de mandarlo, no después. Si el enlace se reenvía dentro de Vaconsa sin tu correo de contexto, alguien puede abrir una página con su logo y su nombre sin saber qué es. La cinta oscura arriba es lo único que lo evita. **No la quites nunca, ni la hagas más discreta, ni por estética.**

Tres cosas más antes de mandarlo:

1. **Manda primero la auditoría, no el rediseño.** La auditoría es un regalo: doce hallazgos concretos de su sitio, incluyendo lo que ya hacen bien. El rediseño, sin pedirlo, puede leerse como *"les hice su trabajo porque el suyo está mal"* — y con un negocio familiar de 1978 en Monterrey, el orgullo es un factor real. Secuencia: manda la auditoría, ofrece enseñarles cómo se vería resuelto, **y muestra el rediseño cuando digan sí.** La misma pieza, recibida completamente distinto.
2. **Su logo es su marca registrada.** Usarlo en una propuesta identificada como propuesta es práctica normal y defendible. Dejarlo en una URL pública indefinidamente ya no. Cuando el ciclo se cierre — sí o no — **baja la página o quítale la marca.** Ponle fecha tú mismo.
3. **Búscale nombre a quién se lo mandas.** "A quien corresponda" no llega a ningún lado. El director comercial o el de compras; LinkedIn basta. Una propuesta de este nivel merece un destinatario con nombre.

Y el detalle que más va a pesar: **lleva impreso el dibujo de la brida.** Es lo único de toda la pieza que no puede haber salido de una plantilla, y es lo que le dice a un ingeniero que entendiste su oficio.

---

## Qué viene arreglado en este PR

1. `novalidate` fuera del formulario de cotización + validación nativa + `:user-invalid`. El de bolsa de trabajo sigue como estaba, para que hagas la comparación.
2. `aria-live="polite"` con conteo de resultados en el buscador.
3. `scroll-padding-top` en el `html`.
4. `lang="es-MX"`.
5. `<link rel="canonical">`.
6. `.gitignore` sin la línea duplicada.

> ⚠️ **Al integrar este PR, corre `python sync-vault-copy.py`.** Toqué `index.html` y la copia gemela del vault no se actualiza sola — si no lo corres, las dos versiones quedan distintas. Que este PR traiga su propio recordatorio de sincronizar es, precisamente, el hallazgo #5 demostrándose en vivo.

## Qué te queda

- [ ] Producir el `og:image` de 1200×630 (o bajar a `summary` mientras)
- [ ] `novalidate` fuera del formulario de bolsa de trabajo también
- [ ] `scrollend` en lugar del `setTimeout(500)`
- [ ] `CATALOG` → `catalogo.json` (paso 1 de la tabla)
- [ ] `<style>` y `<script>` a archivos propios (paso 2)
- [ ] Build step que genere las dos salidas, y borrar `sync-vault-copy.py` (paso 3)
- [ ] Sexta categoría de la auditoría: rendimiento, medido tres veces con fechas
- [ ] El bloque de "sin coincidencias" con `textContent`, y borrar `escapeHtml`
- [ ] Favicon
- [ ] Fecha de caducidad para la página con la marca de Vaconsa

---

## El resumen

`regios-solutions` fue una página que se veía bien. **Esta es una pieza de ingeniería** — con un concepto visual defendible, datos reales, accesibilidad de verdad, una regla ética escrita antes de necesitarla y commits que un equipo aceptaría sin comentarios. En un día.

Los hallazgos de arriba son de dos tipos, y la diferencia importa más que la lista:

- **Del 1 al 4 son costumbres.** Se arreglan con la lista de verificación al final de la auditoría de `regios`. Se resuelven una vez y no vuelven.
- **El 5 es criterio,** y ese es el que se paga caro. Nadie te va a decir "ya necesitas un build step". Lo tienes que ver tú, y la señal fue que escribiste un script de Python para sincronizar dos copias de un archivo. **Aprende a reconocer ese momento** — el momento en que tu herramienta empieza a pelear contigo — y vas a estar años adelante de gente que programa mejor que tú.

Cuánto vale esto y cómo cobrarlo: `NEXO-WEB-PLAYBOOK.md`, en este mismo repo. Va a decir un número más alto del que tenías en la cabeza.

— Revisado por tu tío Chuy y buddai · agosto 2026
