# Playbook Nexo Web

Cómo elegir el stack, dónde publicar, y cuánto cobrar.

Gabo: las dos auditorías (`AUDITORIA.md` aquí y en `regios-solutions`) son sobre **el código**. Este documento es sobre **el negocio**. Es el más importante de los tres.

Va en este repo porque Nexo Web es el negocio y esta propuesta es su pieza de presentación.

---

# Parte 1 — Cómo se elige un stack

## La respuesta que no te sirve

Si le preguntas a internet *"¿qué uso para hacer páginas web?"*, la respuesta es React, Next.js, Tailwind, Vercel, y algún servicio de base de datos. Es la respuesta más común y **para tus dos proyectos es la respuesta equivocada.**

No porque esas herramientas sean malas. Porque un framework resuelve un problema que **tú todavía no tienes**, y adoptarlo antes de tener el problema es puro costo: más archivos, `npm install`, paso de compilación, dependencias que se actualizan y rompen, y una página que ya no puedes abrir con doble clic para ver si quedó bien.

Y hay una prueba de esto que es tuya: en el `CLAUDE.md` de `regios-solutions` escribiste

> *"Keep it a single page — that's the scope. Don't add routing, a CMS, or a framework unless the business's needs genuinely outgrow a one-pager."*

**Eso está correcto y lo escribiste solo.** Este documento no viene a corregirlo. Viene a decirte *cómo saber cuándo esa frase deja de aplicar*, porque va a dejar de aplicar, y ahí es donde la mayoría se atora — o se queda en HTML plano tres años más de lo que debía, o se brinca a React para un folleto de una página.

## La escalera

Cinco escalones. **Subes uno cuando algo real te empuja, nunca porque el siguiente suene mejor.**

### Escalón 1 — HTML + CSS + JS, un archivo o tres

*Para:* folletos de una página, sitios de aterrizaje, propuestas, portafolios. Cero dependencias, cero compilación, se abre con doble clic.

*Aquí vive:* `regios-solutions`. **Correctamente.** Una página para un instalador de paneles solares no necesita nada más, y que se pueda abrir sin instalar nada es una ventaja de verdad — tú previsualizas al instante y el cliente puede abrir el archivo si algún día quiere.

*La señal de que ya no alcanza:* copias y pegas el mismo encabezado en un segundo archivo HTML.

### Escalón 2 — Lo mismo, pero los datos en un JSON

*Para:* cuando el sitio muestra una *lista* de cosas — productos, servicios, precios, propiedades, platillos.

Los datos salen a `datos.json` y el HTML los pinta con `fetch`. Los datos se editan sin tocar código; un error de sintaxis en el JSON no tumba la página; y — esto es lo comercial — **el cliente puede editar el JSON él mismo** si le enseñas, y deja de pagarte por cada cambio de texto. Suena a que pierdes ingreso; en realidad ganas el cliente, porque los cambios de texto son el trabajo que odias y que no puedes cobrar caro.

*Aquí ya debería estar:* `propuesta-vaconsa`. Tiene 25 registros de producto codificados dentro del HTML. Ver hallazgo #5 de su auditoría.

*La señal:* tienes datos en un arreglo dentro del HTML. Ya estás en el escalón 2 aunque no lo hayas subido.

### Escalón 3 — Paso de compilación (build step)

*Para:* cuando **una fuente tiene que producir varias salidas**, o cuando hay partes que se repiten entre páginas.

Un build step es un programa que toma tus archivos fuente y genera los archivos finales. Herramientas: [Vite](https://vite.dev) para lo general, [Astro](https://astro.build) si son varios sitios de contenido.

*Aquí ya debería estar `propuesta-vaconsa` también*, y la prueba la escribiste tú: **`sync-vault-copy.py` es un build step hecho a mano.** Un programa que genera una salida a partir de una fuente. Eso es literalmente la definición. Ya cruzaste el escalón; solo lo cruzaste con una herramienta que tú mantienes en lugar de una que mantiene alguien más.

*La señal:* escribes un script para sincronizar dos archivos, o pegas el mismo encabezado en tres páginas.

### Escalón 4 — React (o mejor, Next.js) + Tailwind

*Para:* cuando la página tiene **estado que cambia y varias partes tienen que reaccionar al mismo tiempo.**

Concretamente, React se gana su lugar cuando hay: sesión de usuario (quién está conectado), un carrito, filtros que se combinan y se reflejan en la URL, formularios de varios pasos, algo que se actualiza en vivo. En una palabra: **cuando llevas la cuenta de más de dos o tres cosas que cambian y tienen que mantenerse de acuerdo entre ellas.**

Ojo con esto, porque es la trampa: **el buscador de Vaconsa NO es esa situación.** Tiene dos estados (el texto y la familia activa) y unas 60 líneas de JS lo manejan bien. Reescribirlo en React lo haría más largo, no más simple.

**¿Qué es Tailwind?** En lugar de escribir CSS en otro archivo, pones clases directo en el HTML: `class="flex items-center gap-4 rounded-lg bg-navy p-6"`. Se ve horrible al principio y es genuinamente mejor cuando el proyecto crece, por una razón específica: **no tienes que inventar nombres.** El problema real del CSS a escala no es escribirlo, es que nadie sabe si puede borrar `.hero-facts` sin romper otra pantalla. Con Tailwind los estilos viven junto a lo que estilizan, así que borrar el componente borra sus estilos.

En un archivo de 300 líneas de CSS que tú escribiste completo, Tailwind no te compra nada. En 3,000 líneas que escribieron cuatro personas, te salva.

*Next.js* es React más las cosas que un sitio real necesita: rutas, renderizado en el servidor (para que Google lea el contenido), optimización de imágenes, y un lugar donde poner endpoints. Si vas a React, ve directo a Next; React solo te deja armando el resto a mano.

*La señal:* estás manejando cuatro o más cosas que cambian y tienen que estar de acuerdo, o necesitas rutas de verdad con `/productos/valvulas`.

### Escalón 5 — Framework + backend + base de datos

*Para:* cuando los datos tienen que **guardarse y sobrevivir**, o cuando hay que hacer algo que no puede pasar en la computadora del visitante.

Concretamente: cuentas de usuario con contraseña, cobros con tarjeta, un formulario cuyas respuestas se almacenan y se consultan, mandar correos, un panel donde el cliente edita su contenido, cualquier cosa con una llave secreta (una llave de API en el JavaScript del navegador **es una llave pública**; cualquiera la ve).

*La señal:* la frase *"y que el cliente pueda entrar a ver..."* aparece en la conversación. Ahí ya necesitas base de datos y sesiones. No hay atajo.

## La regla, en una línea

> **Sube un escalón cuando el problema te empuje, nunca cuando la herramienta te llame.** Y cada escalón se paga con complejidad para siempre, así que el que te saltas gratis es dinero.

Un proveedor que llega con React para un folleto de una página no es más avanzado: **cobra más por darte algo más frágil.** Que tú puedas ver la diferencia es una ventaja competitiva de verdad, sobre todo en Monterrey, donde vas a competir contra agencias que le meten WordPress con veinte plugins a un negocio que necesitaba una página.

## Nota honesta: el stack de tu tío no es tu stack

En el vault de Chuy hay un documento (`coding_style.md`) que dice que los proyectos se despliegan en **NixOS sobre metal desnudo en Hetzner**, con systemd y Caddy, sin Docker, backend en Elixir. Es casi lo contrario de lo que te acabo de recomendar.

Las dos cosas están bien, porque **resuelven problemas distintos:**

- Chuy corre infraestructura que tiene que estar viva a las 3 de la mañana, con datos de gobiernos e instituciones encima. Ahí lo que compras es **control y reproducibilidad**: quieres que el servidor esté declarado en un archivo, que se pueda reconstruir idéntico, y que ninguna empresa pueda cambiarte las reglas ni los precios. Se paga con una curva de aprendizaje fuerte.
- Tú vendes páginas a negocios en Monterrey. Lo que compras es **velocidad de entrega**: publicar en un minuto, HTTPS automático, cero servidores que administrar. Aprender NixOS ahora, en tu etapa, sería tirar meses en un problema que no tienes.

**El stack es función de la etapa, no de qué tan bueno eres.** El día que tengas un cliente con datos que no pueden salir de México, o cinco clientes con base de datos y la factura de la nube empiece a doler, ese día vuelves a este párrafo. Hoy, no.

Y eso también es la respuesta cuando un cliente te pregunte *"¿por qué no usas [lo que sea que leyó]?"*: **"Porque su proyecto no lo necesita, y lo que no se necesita se paga en mantenimiento."** Ese es el argumento de alguien que sabe, y suena mucho mejor que una lista de tecnologías.

---

# Parte 2 — Dónde publicar

Tres opciones y una división clara.

## Vercel — tu opción por defecto

Sitios estáticos, sitios con build step, Next.js. Empujas a `main` y se publica. HTTPS automático, CDN global, previsualización por cada rama. El plan gratuito alcanza de sobra para clientes como Regios.

**Es lo que ya usas y está bien.** Dos reglas:

1. **Una sola URL por sitio.** `regios-solutions` está publicado en Vercel *y* en GitHub Pages al mismo tiempo. Ver hallazgo #5 de su auditoría.
2. **El dominio va a nombre del cliente.** Que Pablo compre `regiostech.mx` con su tarjeta y te dé acceso. Si el dominio es tuyo y truenan, te conviertes en rehén o en villano. Los proveedores serios no son dueños del dominio del cliente. **Nunca.**

## Railway — cuando hace falta un servidor de verdad

[Railway](https://railway.app) es donde vas a correr lo que Vercel no hace: **un proceso que no se apaga y una base de datos.**

Concretamente, en el momento en que un cliente te pida:

- un formulario cuyas respuestas se guarden y se puedan consultar,
- un login,
- una tienda con inventario,
- que se manden correos o recordatorios de WhatsApp solos,
- un panel donde el cliente edite su contenido,
- cualquier cosa a cierta hora todos los días.

Railway te da un Postgres en dos clics, variables de entorno donde las llaves secretas están seguras (fuera del navegador), y despliegue desde GitHub igual que Vercel. Su plan de arranque cuesta unos pocos dólares al mes — **y eso se lo cobras al cliente**, no lo absorbes tú. Si el proyecto necesita servidor, el proyecto paga su servidor.

**La división, para que no la pienses cada vez:**

| Necesitas | Publica en |
|---|---|
| Nada se guarda, nada es secreto | **Vercel** |
| Se guarda algo, hay llaves, o hay una base de datos | **Railway** |

Chuy tiene un skill de Railway en el AIOS: si le pides *"usa el skill de Railway y ayúdame a montar esto"*, Claude te lleva paso por paso.

## GitHub Pages — para nada de esto

Sirve para documentación y proyectos personales. Sin variables de entorno, sin funciones, sin control del build. **Apágalo en `regios-solutions`.** No es una segunda copia de respaldo, es una segunda fuente de confusión.

---

# Parte 3 — Cuánto cobrar

Aquí está el punto y no es el precio: **es que casi seguro estás por cobrar de menos, y el primer número que pongas te va a marcar por años.** El cliente que te contrató en $3,000 no acepta $12,000 el año siguiente, y hablar de esto ahora es más barato que corregirlo después.

## El mercado mexicano, 2026

Rangos reportados por agencias y freelancers mexicanos este año (fuentes al final):

**Sitio de aterrizaje / una página**
- Freelance básico, con plantilla: **$5,000 – $10,000 MXN**
- Optimizado a conversión — formulario, WhatsApp, SEO básico: **$8,000 – $15,000 MXN**
- Estratégico — copy profesional, CRO, automatizaciones (o precio de agencia): **$15,000 – $30,000+ MXN**

**Sitio corporativo PyME, varias páginas:** $10,000 – $40,000 MXN

**Mantenimiento mensual:** $2,000 – $4,000 MXN ($24,000 – $48,000 al año)

**Por hora, si te lo preguntan:** nivel medio $200 – $400 MXN, senior $400 – $800 MXN. La tarifa que se cita como típica anda en $320 – $380 MXN/hora.

## Dónde caen tus dos proyectos

Aquí está el dato que importa.

**`regios-solutions`** — una página, diseño propio (no plantilla), responsiva, meta descripción escrita, CTA de WhatsApp, `lang` correcto. Con los arreglos de la auditoría — contraste, Open Graph, datos estructurados, SVG, foco — es sin discusión el **tramo optimizado: $8,000 – $15,000 MXN.**

**`propuesta-vaconsa`** — buscador con 25 fichas de producto y normas reales, filtros por familia, formulario que se prellena, modo oscuro, accesibilidad, dibujo técnico en SVG hecho a la medida, más una auditoría de doce hallazgos del sitio actual. Eso es **el tramo estratégico: $15,000 – $30,000 MXN**, y en el extremo alto si va con la auditoría, porque la auditoría es consultoría, no diseño.

Pregúntate qué número tenías en la cabeza antes de leer esto. **Esa distancia es el hallazgo.**

Y una precisión importante: cobras el tramo optimizado **porque el trabajo lo es**, no porque tengas 17 años ni porque lleves cero clientes pagados. El cliente no compra tus años; compra una página que le trae prospectos. Nadie le pregunta a su plomero cuántos años tiene.

## Cómo cobrar (el método importa más que el número)

**1. Precio fijo, nunca por hora.** Estimas horas para *calcularlo*, y cotizas un número cerrado. Por hora te castiga por ser rápido — y tú, dirigiendo a Claude, eres muy rápido. Si haces en 4 horas lo que a otro le toma 20, por hora ganas la quinta parte por el mismo resultado. El cliente además prefiere el número cerrado: sabe cuánto va a pagar.

**2. Precio en tres opciones, no una.** Nunca mandes un solo número — invita a regatearlo. Manda tres:

- **Esencial** — la página, publicada, responsiva, WhatsApp. *(extremo bajo)*
- **Completo** — más Open Graph, datos estructurados, analítica, y tú le entregas el reporte del primer mes. *(extremo alto — y aquí es donde quieres que caiga)*
- **Completo + mantenimiento** — el anterior más cambios y reporte mensual. *(mensualidad aparte)*

Con un solo precio la pregunta del cliente es *"¿lo tomo o lo dejo?"*. Con tres es *"¿cuál me llevo?"*. Es la misma técnica que ya usaste sin darte cuenta al mandar la auditoría **junto** con el rediseño: le diste al cliente algo que comparar.

**3. 50% por adelantado.** Siempre, desde el primer cliente, sin excepción. No es desconfianza, es la norma de la industria: cubre tu tiempo si el proyecto se cancela y — más importante — **filtra al cliente que nunca iba a pagar.** El que se ofende por el anticipo te iba a dar problemas.

**4. Escribe qué NO incluye.** La causa número uno de proyectos que se vuelven infierno es el alcance que se estira: "ya que estás, ¿le pones un blog?". Tu cotización dice qué incluye, cuántas rondas de cambios (dos), y qué se cotiza aparte. Sin eso, terminas trabajando cuatro veces por el precio de una y odiando el negocio.

**5. El mantenimiento es el negocio de verdad.** Un sitio de $12,000 es un pago. Cinco clientes a $2,500 al mes son **$12,500 mensuales que llegan sin vender nada nuevo.** El trabajo del proyecto es conseguir el cliente; el trabajo del negocio es que se quede. Al terminar cada sitio, ofrece el mantenimiento: cambios de texto, actualizar fotos, reporte mensual, mantener el hosting y el dominio vivos.

## La palanca para subir el precio

Aquí se conecta con el hallazgo #10 de la auditoría de `regios`. La cadena completa:

1. Instalas analítica en el primer sitio de pago y marcas el clic a WhatsApp como evento.
2. A los 90 días le llevas al cliente: *"la página tuvo 1,240 visitas y 34 clics a WhatsApp."*
3. Le preguntas cuántos se convirtieron en venta y cuánto vale una instalación.
4. Si cerró dos ventas de $80,000, tu página de $12,000 le devolvió trece veces la inversión — **y ahora está por escrito.**
5. Ese es tu testimonio, tu caso de éxito y tu justificación para cotizar el doble al siguiente.

Sin analítica no tienes ninguno de los cinco pasos y tu precio se queda donde empezó. **La analítica no es una función del sitio, es tu herramienta de ventas.**

## Dos cosas que no te puedo contestar

1. **Facturación e impuestos.** Cobrar como menor de edad en México tiene reglas — RFC, régimen, si necesitas a tu mamá o a Chuy en los papeles — y no te voy a dar una respuesta que no puedo verificar. **Pregúntale a Chuy y a su contador antes de tu primer cobro**, no después. Hay un agente `accountant` en el AIOS para empezar la conversación. Un cliente empresarial como Vaconsa **va a pedir factura**; si no puedes darla, se cae la venta. Resuélvelo antes de que te pase.
2. **Qué cobrar a un familiar o a un amigo.** Es una decisión tuya y de la relación. Solo una advertencia: si el primer sitio de tu portafolio salió gratis, el cliente que lo vio va a esperar el mismo precio. Si haces uno gratis, que sea **explícitamente** a cambio de algo — un testimonio escrito, tres referidos con nombre, permiso de usarlo en el portafolio — y que quede dicho de frente.

---

# Parte 4 — La lista de una hoja

**Antes de escribir una línea**
- [ ] ¿En qué escalón de la escalera está esto de verdad? (Casi siempre el 1 o el 2)
- [ ] ¿Cuál es el canal de venta del cliente — WhatsApp, teléfono, correo, tienda? Todo el sitio se ordena alrededor de eso
- [ ] ¿Qué cuenta como éxito? (prospectos por mes, no "una página bonita")

**Antes de entregar** — la lista completa está al final de `regios-solutions/AUDITORIA.md`
- [ ] Contraste WCAG AA medido, sobre todo en botones
- [ ] Vista previa probada pegando el enlace en WhatsApp
- [ ] JSON-LD con datos reales, ninguno inventado
- [ ] Cero emojis como iconos
- [ ] `:focus-visible` visible al tabular
- [ ] Probado a 390px, sin scroll horizontal
- [ ] Una sola URL
- [ ] Analítica instalada, clic a WhatsApp como evento

**Antes de cotizar**
- [ ] Tres opciones, nunca un solo precio
- [ ] Precio fijo, no por hora
- [ ] Escrito qué NO incluye y cuántas rondas de cambios
- [ ] 50% por adelantado
- [ ] Mantenimiento mensual ofrecido
- [ ] Dominio a nombre del cliente
- [ ] Ya sabes cómo vas a facturar

---

## Fuentes de los rangos de precio

Consultadas en agosto de 2026. Los rangos son consistentes entre ellas, lo cual es buena señal — cuando cinco fuentes independientes coinciden, el número es del mercado y no de alguien.

- [¿Cuánto cobrar por una landing page en México? Guía de precios 2026 — Universe Page](https://universepage.com.mx/blog/cuanto-cobrar-landing-page-mexico)
- [¿Cuánto cobrar por una página web en México? Precios 2026 — Universe Page](https://universepage.com.mx/blog/cuanto-cobrar-pagina-web-mexico)
- [¿Cuánto cuesta una página web en México 2026? Precios reales — Newemage](https://newemage.com.mx/cuanto-cuesta-una-pagina-web-en-mexico/)
- [Desarrollo web en México: precios reales por tipo de proyecto 2026 — Magokoro](https://www.magokoro.mx/blog/precios-desarrollo-web-mexico)
- [¿Cuánto cuesta una página web en México en 2026? — Novemp](https://novemp.com.mx/cuanto-cuesta-una-pagina-web-mexico/)
- [Cuánto cobrar por una página web como freelance — Hostinger México](https://www.hostinger.com/mx/tutoriales/cuanto-cobrar-por-una-pagina-web)

---

## Y lo último

Dos repos, dos días, y en el segundo ya habías corregido casi todo lo que estaba mal en el primero. Eso — corregir sin que nadie te diga — es más difícil de enseñar que cualquier cosa de este documento y es la razón por la que vale la pena escribirlo.

Lo que sigue no es aprender más tecnología. Es **cobrar lo que vale el trabajo y conseguir el segundo cliente.** El código ya está a nivel; el precio todavía no.

— Chuy y buddai · agosto 2026
