// Datos reales del catálogo de Vaconsa: cada norma, clase y diámetro sale de
// sus propias páginas de producto. Nunca inventar; si no se sabe, "Consultar".
// Lo comparten catalogo.js (página de catálogo) y sitio.js (sugerencias del
// buscador y cotizador en todas las páginas).
const CATALOG = [
  { fam:'Tubería', name:'Tubería de acero al carbón sin costura', docLabel:'Espesores de tubería', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/espesorestuberia.pdf',
    norma:'ASTM A106 · A53-B · API 5L (PSL 1 / PSL 2)', diam:'½" – 24"', mat:'Acero al carbón',
    tags:'a106 a53 api5l psl1 psl2 sin costura seamless carbon tuberia pipe' },
  { fam:'Tubería', name:'Tubería de acero al carbón con costura', docLabel:'Espesores de tubería', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/espesorestuberia.pdf',
    norma:'ASTM A53 Gr.A / Gr.B · ERW · DSAW · SSAW', diam:'½" – 60"', mat:'Acero al carbón',
    tags:'a53 erw dsaw ssaw con costura soldada tuberia pipe carbon' },
  { fam:'Tubería', name:'Tubería aleada para alta temperatura',
    norma:'ASTM A333 Gr.1/3/6 · A213 · SA210', diam:'Consultar', mat:'Acero aleado',
    tags:'a333 a213 sa210 aleada baja temperatura caldera aleado' },
  { fam:'Conexiones', name:'Conexión soldable a tope', docLabel:'Espesores de conexión soldable', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/espesores_conexion_soldable.pdf',
    norma:'ASTM A234 WPB', diam:'½" – 48"', mat:'Acero al carbón',
    tags:'a234 wpb soldable tope codo tee reduccion buttweld conexion' },
  { fam:'Conexiones', name:'Conexión forjada roscada y socket', docLabel:'Pesos de conexión forjada', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/pesosconexionforjadantp.pdf',
    norma:'ASTM A105 · clases 3000# y 6000#', diam:'⅛" – 4"', mat:'Acero forjado',
    tags:'a105 forjada roscada npt socket weld sw 3000 6000 conexion' },
  { fam:'Conexiones', name:'Conexión bridada de fierro fundido',
    norma:'Para agua potable', diam:'Consultar', mat:'Fierro fundido',
    tags:'fierro fundido agua potable bridada conexion' },
  { fam:'Bridas', name:'Brida forjada de acero al carbón', docLabel:'Dimensiones clase 150#', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/tabla_bridas_150.pdf',
    norma:'ASTM A105 · ASME B16.5 / B16.20', diam:'½" – 48"', mat:'Acero forjado',
    tags:'a105 b16.5 brida slip on wn cuello roscada ciega blind sw rf ff rtj 150 300 600 900 1500' },
  { fam:'Inoxidable', name:'Tubería de acero inoxidable', docLabel:'Ficha técnica sin costura', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/tuberia-sin-costura.pdf',
    norma:'ASTM A312 TP304/304L · TP316/316L', diam:'Con y sin costura', mat:'Inoxidable',
    tags:'a312 304 304l 316 316l inoxidable stainless tuberia' },
  { fam:'Inoxidable', name:'Conexiones y bridas inoxidables',
    norma:'ASTM A403 · A182 F304L / F316L', diam:'Consultar', mat:'Inoxidable',
    tags:'a403 a182 f304l f316l inoxidable conexion brida stainless' },
  { fam:'Inoxidable', name:'Tubing inoxidable y aleaciones',
    norma:'304/304L · 316/316L · Hastelloy C-22', diam:'Instrumentación', mat:'Inoxidable / aleación',
    tags:'tubing hastelloy c22 304 316 instrumentacion aleacion' },
  { fam:'Válvulas', name:'Válvula de compuerta, globo y check', docLabel:'Catálogo Walworth', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/Walworth.pdf',
    norma:'API 600 · ASTM A216 · 125# a 1500#', diam:'Fundida', mat:'Acero al carbón',
    tags:'api600 a216 compuerta globo check gate globe fundida valvula 150 300 600 900 1500' },
  { fam:'Válvulas', name:'Válvula forjada compuerta, globo y check', docLabel:'Catálogo Walworth forjado', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/Walworth-Forjado.pdf',
    norma:'API 602 · ASTM A105 · 150# a 2500#', diam:'½" – 2"', mat:'Acero forjado',
    tags:'api602 a105 forjada compuerta globo check valvula 800 1500 2500' },
  { fam:'Válvulas', name:'Válvula de esfera flotante y muñón', docLabel:'Catálogo Worcester', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/CATALOGO-Worcester.pdf',
    norma:'API 6D', diam:'½" – 48"', mat:'Carbón · inox · bronce · latón',
    tags:'api6d esfera bola ball flotante munon trunnion valvula bronce laton' },
  { fam:'Válvulas', name:'Válvula mariposa wafer, lug y bridada', docLabel:'Catálogo Proval', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/Catalogo-Proval.pdf',
    norma:'Disco DI o inoxidable', diam:'Palanca o actuador', mat:'Hierro dúctil / inox',
    tags:'mariposa butterfly wafer lug bridada actuador neumatico electrico valvula' },
  { fam:'Válvulas', name:'Válvula de retención DUO Check', docLabel:'Catálogo DUO Check', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/ES-Duocheck-PROVAL.pdf',
    norma:'Clases 125# · 150# · 300# · 600# · 900#', diam:'Consultar', mat:'Hierro y acero fundido',
    tags:'duo check retencion doble clapeta valvula' },
  { fam:'Vapor', name:'Trampas de vapor y reguladoras', docLabel:'Catálogo de condensado', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/WM-Cond-Catalog-Spanish.pdf',
    norma:'Termodinámicas · termostáticas · alivio', diam:'Consultar', mat:'Servicio de vapor',
    tags:'vapor steam trampa termodinamica termostatica reguladora presion alivio eliminador aire' },
  { fam:'Vapor', name:'Filtros Y para retención de partículas',
    norma:'Clases 125# · 150# · 250#', diam:'Consultar', mat:'Hierro y acero fundido',
    tags:'filtro y strainer particulas linea vapor' },
  { fam:'Petrolero', name:'Bridas, carretes, cruces y tees API',
    norma:'API 6A · 16A · 17D', diam:'Acero forjado', mat:'Equipo petrolero',
    tags:'api6a api16a api17d brida carrete cruz tee adaptadora petrolero wellhead' },
  { fam:'Petrolero', name:'Mangueras rotatorias y de cementar',
    norma:'API 7K · 5,000 – 15,000 psi', diam:'Consultar', mat:'Equipo petrolero',
    tags:'api7k manguera rotatoria cementar choke kill api16c api17k produccion petrolero psi' },
  { fam:'Petrolero', name:'Uniones de golpe y juntas giratorias',
    norma:'ASTM A105 · AISI 4130 · hasta 15,000 psi', diam:'1" – 12"', mat:'Acero forjado',
    tags:'union golpe hammer union junta giratoria swivel 4130 a105 15000 psi petrolero' },
  { fam:'Instrumentación', name:'Manómetros industriales y patrón', docLabel:'Catálogo De Wit', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/Catalogo_De_Wit_Completo.pdf',
    norma:'Bourdon de bronce o inoxidable', diam:'Diafragma · dúplex · seguridad', mat:'Instrumentación',
    tags:'manometro presion bourdon bronce inoxidable diafragma duplex patron seguridad' },
  { fam:'Instrumentación', name:'Termómetros bimetálicos y de bulbo', docLabel:'Catálogo De Wit', docUrl:'https://www.vaconsa.com.mx/wp-content/uploads/2017/10/Catalogo_De_Wit_Completo.pdf',
    norma:'AISI 316', diam:'Bulbo rígido · capilar', mat:'Instrumentación',
    tags:'termometro bimetalico bulbo rigido capilar 316 temperatura' },
  { fam:'Instrumentación', name:'Válvula de aguja alta presión',
    norma:'AISI 316 · ASTM A105 · 6,000 – 10,000 psi', diam:'⅛" – 1"', mat:'Inox / acero forjado',
    tags:'aguja needle 316 a105 6000 10000 psi alta presion instrumentacion valvula' },
  { fam:'PVC', name:'Tubería y conexión plástica',
    norma:'PVC C40 / C80 / C120 · CPVC Ced. 80 · HDPE PE4710', diam:'Consultar', mat:'Termoplástico',
    tags:'pvc cpvc c40 c80 c120 hdpe pe100 pe4710 plastico tuberia' },
  { fam:'PVC', name:'Válvulas y actuadores plásticos',
    norma:'Bola · mariposa · accesorios', diam:'Consultar', mat:'Termoplástico',
    tags:'pvc valvula bola mariposa actuador accesorio plastico' }
];

// Foto de cada familia para las tarjetas del catálogo (las mismas de la
// rejilla de inicio; los créditos de las de Wikimedia están en el inicio).
const FAM_IMG = {
  "Tubería": "/img/lineas-tuberia-valvulas-800.jpg",
  "Conexiones": "/img/lineas-conexiones-sistemas-800.jpg",
  "Bridas": "/img/cat-bridas.jpg",
  "Válvulas": "/img/lineas-valvulas-industriales-800.jpg",
  "Inoxidable": "/img/cat-inoxidable.jpg",
  "Vapor": "/img/cat-vapor.jpg",
  "Petrolero": "/img/lineas-infraestructura-industrial-800.jpg",
  "Instrumentación": "/img/cat-instrumentacion.jpg",
  "PVC": "/img/cat-pvc.jpg"
};

// Foto propia de cada producto cuando existe una con licencia libre verificada
// (Wikimedia Commons; créditos en la página del catálogo). Si un producto no
// tiene, usa la foto de su familia.
const PRODUCT_IMG = {
  "Tubería de acero al carbón sin costura": "/img/p-sin-costura.jpg",
  "Tubería de acero al carbón con costura": "/img/p-con-costura.jpg",
  "Conexión soldable a tope": "/img/p-soldable.jpg",
  "Conexión forjada roscada y socket": "/img/p-forjada.jpg",
  "Tubería de acero inoxidable": "/img/p-inox-tuberia.jpg",
  "Conexiones y bridas inoxidables": "/img/p-inox-conexiones.jpg",
  "Válvula de compuerta, globo y check": "/img/p-compuerta.jpg",
  "Válvula forjada compuerta, globo y check": "/img/p-valvula-forjada.jpg",
  "Válvula de esfera flotante y muñón": "/img/p-esfera.jpg",
  "Válvula mariposa wafer, lug y bridada": "/img/p-mariposa.jpg",
  "Válvula de retención DUO Check": "/img/p-duo-check.jpg",
  "Bridas, carretes, cruces y tees API": "/img/p-api6a.jpg",
  "Mangueras rotatorias y de cementar": "/img/p-manguera.jpg",
  "Termómetros bimetálicos y de bulbo": "/img/p-termometro.jpg",
  "Válvulas y actuadores plásticos": "/img/p-pvc-valvula.jpg"
};
function imgFor(item) { return PRODUCT_IMG[item.name] || FAM_IMG[item.fam] || "/img/lineas-tuberia-valvulas-800.jpg"; }

// ---------------------------------------------------------------------------
// Inglés (/en/). Clave = nombre en español de CATALOG. Solo se traducen las
// palabras; normas, clases y medidas quedan idénticas. Terminología técnica
// estándar en inglés (ASTM/API/ASME). Revisar con una persona nativa o con
// Vaconsa antes de publicar: ver CLAUDE.md.
// ---------------------------------------------------------------------------
const CATALOG_EN = {
  'Tubería de acero al carbón sin costura': { name:'Seamless carbon steel pipe', mat:'Carbon steel' },
  'Tubería de acero al carbón con costura': { name:'Welded carbon steel pipe', mat:'Carbon steel' },
  'Tubería aleada para alta temperatura': { name:'Alloy steel pipe for high-temperature service', diam:'On request', mat:'Alloy steel' },
  'Conexión soldable a tope': { name:'Butt-weld fittings', mat:'Carbon steel' },
  'Conexión forjada roscada y socket': { name:'Forged threaded and socket-weld fittings', norma:'ASTM A105 · classes 3000# and 6000#', mat:'Forged steel' },
  'Conexión bridada de fierro fundido': { name:'Cast iron flanged fittings', norma:'For potable water', diam:'On request', mat:'Cast iron' },
  'Brida forjada de acero al carbón': { name:'Forged carbon steel flanges', mat:'Forged steel' },
  'Tubería de acero inoxidable': { name:'Stainless steel pipe', diam:'Seamless and welded', mat:'Stainless steel' },
  'Conexiones y bridas inoxidables': { name:'Stainless steel fittings and flanges', diam:'On request', mat:'Stainless steel' },
  'Tubing inoxidable y aleaciones': { name:'Stainless steel and alloy tubing', diam:'Instrumentation', mat:'Stainless steel / alloy' },
  'Válvula de compuerta, globo y check': { name:'Gate, globe and check valves', norma:'API 600 · ASTM A216 · 125# to 1500#', diam:'Cast', mat:'Carbon steel', docLabel:'Walworth catalog' },
  'Válvula forjada compuerta, globo y check': { name:'Forged gate, globe and check valves', norma:'API 602 · ASTM A105 · 150# to 2500#', mat:'Forged steel', docLabel:'Walworth forged steel catalog' },
  'Válvula de esfera flotante y muñón': { name:'Floating and trunnion-mounted ball valves', mat:'Carbon steel · stainless · bronze · brass', docLabel:'Worcester catalog' },
  'Válvula mariposa wafer, lug y bridada': { name:'Wafer, lug and flanged butterfly valves', norma:'Ductile iron or stainless steel disc', diam:'Lever or actuator', mat:'Ductile iron / stainless steel', docLabel:'Proval catalog' },
  'Válvula de retención DUO Check': { name:'DUO Check dual-plate check valves', norma:'Classes 125# · 150# · 300# · 600# · 900#', diam:'On request', mat:'Cast iron and cast steel', docLabel:'DUO Check catalog' },
  'Trampas de vapor y reguladoras': { name:'Steam traps and pressure regulators', norma:'Thermodynamic · thermostatic · relief', diam:'On request', mat:'Steam service', docLabel:'Condensate catalog' },
  'Filtros Y para retención de partículas': { name:'Y-strainers', norma:'Classes 125# · 150# · 250#', diam:'On request', mat:'Cast iron and cast steel' },
  'Bridas, carretes, cruces y tees API': { name:'API flanges, spools, crosses and tees', diam:'Forged steel', mat:'Oilfield equipment' },
  'Mangueras rotatorias y de cementar': { name:'Rotary and cementing hoses', diam:'On request', mat:'Oilfield equipment' },
  'Uniones de golpe y juntas giratorias': { name:'Hammer unions and swivel joints', norma:'ASTM A105 · AISI 4130 · up to 15,000 psi', mat:'Forged steel' },
  'Manómetros industriales y patrón': { name:'Industrial and test pressure gauges', norma:'Bronze or stainless steel Bourdon tube', diam:'Diaphragm · duplex · safety pattern', mat:'Instrumentation', docLabel:'De Wit catalog' },
  'Termómetros bimetálicos y de bulbo': { name:'Bimetallic and bulb thermometers', diam:'Rigid stem · capillary', mat:'Instrumentation', docLabel:'De Wit catalog' },
  'Válvula de aguja alta presión': { name:'High-pressure needle valves', mat:'Stainless / forged steel' },
  'Tubería y conexión plástica': { name:'Plastic pipe and fittings', norma:'PVC C40 / C80 / C120 · CPVC Sch. 80 · HDPE PE4710', diam:'On request', mat:'Thermoplastic' },
  'Válvulas y actuadores plásticos': { name:'Plastic valves and actuators', norma:'Ball · butterfly · accessories', diam:'On request', mat:'Thermoplastic' }
};
const DOC_LABEL_EN = {
  'Espesores de tubería':'Pipe wall thickness chart', 'Espesores de conexión soldable':'Butt-weld fitting wall thickness chart',
  'Pesos de conexión forjada':'Forged fitting weight chart', 'Dimensiones clase 150#':'Class 150# dimensions',
  'Ficha técnica sin costura':'Seamless pipe datasheet'
};

// Familias: una página por familia en /productos/<slug>/ (y /en/productos/<slug>/).
// Las descripciones solo resumen lo que ya dice CATALOG; las descargas son los
// PDF reales de vaconsa.com.mx (los mismos de /fichas-tecnicas/).
const FAMILIAS = [
  { fam:'Tubería', slug:'tuberia', es:'Tubería de acero', en:'Steel pipe',
    desc_es:'Tubería de acero al carbón con y sin costura bajo ASTM A106, A53 y API 5L, de ½" a 60", y tubería aleada ASTM A333, A213 y SA210.',
    desc_en:'Seamless and welded carbon steel pipe to ASTM A106, A53 and API 5L, from ½" to 60", plus alloy pipe to ASTM A333, A213 and SA210.',
    docs:[['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/espesorestuberia.pdf','Espesores de tubería de acero','Steel pipe wall thickness chart']] },
  { fam:'Conexiones', slug:'conexiones', es:'Conexiones', en:'Fittings',
    desc_es:'Conexión soldable a tope ASTM A234 WPB de ½" a 48", conexión forjada roscada y socket ASTM A105 en clases 3000# y 6000#, y conexión bridada de fierro fundido para agua potable.',
    desc_en:'ASTM A234 WPB butt-weld fittings from ½" to 48", ASTM A105 forged threaded and socket-weld fittings in classes 3000# and 6000#, and cast iron flanged fittings for potable water.',
    docs:[['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/espesores_conexion_soldable.pdf','Espesores de conexión soldable a tope','Butt-weld fitting wall thickness chart'],
          ['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/pesosconexionforjadantp.pdf','Pesos de conexión forjada NPT','NPT forged fitting weight chart']] },
  { fam:'Bridas', slug:'bridas', es:'Bridas', en:'Flanges',
    desc_es:'Bridas forjadas de acero al carbón ASTM A105 bajo ASME B16.5 y B16.20, de ½" a 48".',
    desc_en:'ASTM A105 forged carbon steel flanges to ASME B16.5 and B16.20, from ½" to 48".',
    docs:[['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/tabla_bridas_150.pdf','Dimensiones de bridas clase 150#','Flange dimensions, class 150#'],
          ['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/tabla_bridas_300.pdf','Dimensiones de bridas clase 300#','Flange dimensions, class 300#'],
          ['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/tabla_bridas_600.pdf','Dimensiones de bridas clase 600#','Flange dimensions, class 600#']] },
  { fam:'Válvulas', slug:'valvulas', es:'Válvulas', en:'Valves', brands:['Walworth','Worcester','Proval'],
    desc_es:'Válvulas de compuerta, globo y check fundidas (API 600) y forjadas (API 602), de esfera API 6D, de mariposa wafer, lug y bridada, y de retención DUO Check.',
    desc_en:'Cast (API 600) and forged (API 602) gate, globe and check valves, API 6D ball valves, wafer, lug and flanged butterfly valves, and DUO Check dual-plate check valves.',
    docs:[['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/Walworth.pdf','Walworth — acero fundido','Walworth — cast steel'],
          ['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/Walworth-Forjado.pdf','Walworth — acero forjado','Walworth — forged steel'],
          ['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/CATALOGO-Worcester.pdf','Worcester — válvulas de esfera','Worcester — ball valves'],
          ['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/Catalogo-Proval.pdf','Proval — válvulas de mariposa','Proval — butterfly valves'],
          ['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/ES-Duocheck-PROVAL.pdf','Proval — DUO Check','Proval — DUO Check']] },
  { fam:'Inoxidable', slug:'inoxidable', es:'Acero inoxidable', en:'Stainless steel',
    desc_es:'Tubería ASTM A312 TP304/304L y TP316/316L con y sin costura, conexiones y bridas ASTM A403 y A182, y tubing 304, 316 y Hastelloy C-22.',
    desc_en:'Seamless and welded ASTM A312 TP304/304L and TP316/316L pipe, ASTM A403 and A182 fittings and flanges, and 304, 316 and Hastelloy C-22 tubing.',
    docs:[['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/tuberia-sin-costura.pdf','Tubería inoxidable sin costura','Seamless stainless steel pipe'],
          ['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/tuberia-con-costura.pdf','Tubería inoxidable con costura','Welded stainless steel pipe']] },
  { fam:'Vapor', slug:'vapor', es:'Vapor', en:'Steam',
    desc_es:'Trampas de vapor termodinámicas y termostáticas, válvulas reguladoras y de alivio, y filtros Y en clases 125#, 150# y 250#.',
    desc_en:'Thermodynamic and thermostatic steam traps, pressure regulating and relief valves, and Y-strainers in classes 125#, 150# and 250#.',
    docs:[['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/WM-Cond-Catalog-Spanish.pdf','Condensado y vapor','Condensate and steam']] },
  { fam:'Petrolero', slug:'petrolero', es:'Equipo petrolero', en:'Oilfield equipment',
    desc_es:'Bridas, carretes, cruces y tees API 6A, 16A y 17D, mangueras rotatorias y de cementar API 7K de 5,000 a 15,000 psi, y uniones de golpe y juntas giratorias de 1" a 12".',
    desc_en:'API 6A, 16A and 17D flanges, spools, crosses and tees, API 7K rotary and cementing hoses rated 5,000 to 15,000 psi, and hammer unions and swivel joints from 1" to 12".',
    docs:[] },
  { fam:'Instrumentación', slug:'instrumentacion', es:'Instrumentación', en:'Instrumentation', brands:['De Wit'],
    desc_es:'Manómetros industriales y patrón con tubo Bourdon de bronce o inoxidable, termómetros bimetálicos y de bulbo AISI 316, y válvula de aguja de alta presión de 6,000 a 10,000 psi.',
    desc_en:'Industrial and test pressure gauges with bronze or stainless steel Bourdon tubes, AISI 316 bimetallic and bulb thermometers, and high-pressure needle valves rated 6,000 to 10,000 psi.',
    docs:[['https://www.vaconsa.com.mx/wp-content/uploads/2017/10/Catalogo_De_Wit_Completo.pdf','De Wit — catálogo completo','De Wit — full catalog']] },
  { fam:'PVC', slug:'pvc', es:'PVC y plásticos', en:'PVC and plastics',
    desc_es:'Tubería y conexión de PVC C40, C80 y C120, CPVC cédula 80 y HDPE PE4710, y válvulas plásticas de bola y mariposa con sus actuadores.',
    desc_en:'PVC C40, C80 and C120, CPVC Schedule 80 and HDPE PE4710 pipe and fittings, plus plastic ball and butterfly valves with actuators.',
    docs:[] }
];

// Créditos de las fotos de Wikimedia Commons (autor, licencia, página).
const PHOTO_CREDITS = Object.assign({
 "/img/p-sin-costura.jpg": {
  "a": "Seamless Steel Pipes",
  "l": "CC BY-SA 4.0",
  "lu": "https://creativecommons.org/licenses/by-sa/4.0",
  "p": "https://commons.wikimedia.org/wiki/File:Seamless_Steel_Pipes.jpg"
 },
 "/img/p-con-costura.jpg": {
  "a": "Fumikas Sagisavas",
  "l": "CC0",
  "lu": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  "p": "https://commons.wikimedia.org/wiki/File:Repair_and_welding_of_steam_pipes.jpg"
 },
 "/img/p-soldable.jpg": {
  "a": "Луносвет",
  "l": "CC BY-SA 3.0",
  "lu": "https://creativecommons.org/licenses/by-sa/3.0",
  "p": "https://commons.wikimedia.org/wiki/File:Otvod_steel.jpg"
 },
 "/img/p-forjada.jpg": {
  "a": "Ghasemimoshref",
  "l": "CC BY-SA 4.0",
  "lu": "https://creativecommons.org/licenses/by-sa/4.0",
  "p": "https://commons.wikimedia.org/wiki/File:Plumbing_gear_connections.jpg"
 },
 "/img/p-inox-tuberia.jpg": {
  "a": "Libowei111",
  "l": "CC BY-SA 4.0",
  "lu": "https://creativecommons.org/licenses/by-sa/4.0",
  "p": "https://commons.wikimedia.org/wiki/File:304_STAINLESS_STEEL_PIPE.png"
 },
 "/img/p-inox-conexiones.jpg": {
  "a": "Kees08",
  "l": "CC BY-SA 4.0",
  "lu": "https://creativecommons.org/licenses/by-sa/4.0",
  "p": "https://commons.wikimedia.org/wiki/File:BSPP_Male_Straight_Thread.png"
 },
 "/img/p-compuerta.jpg": {
  "a": "Heather Smith",
  "l": "CC BY 3.0",
  "lu": "https://creativecommons.org/licenses/by/3.0",
  "p": "https://commons.wikimedia.org/wiki/File:Valve.jpg"
 },
 "/img/p-valvula-forjada.jpg": {
  "a": "Heather Smith",
  "l": "CC BY-SA 3.0",
  "lu": "https://creativecommons.org/licenses/by-sa/3.0",
  "p": "https://commons.wikimedia.org/wiki/File:Super-duplex-valve-globe-valves.jpg"
 },
 "/img/p-esfera.jpg": {
  "a": "Heather Smith",
  "l": "CC BY 3.0",
  "lu": "https://creativecommons.org/licenses/by/3.0",
  "p": "https://commons.wikimedia.org/wiki/File:Ball_valve--The-Alloy-Valve-Stockist.JPG"
 },
 "/img/p-mariposa.jpg": {
  "a": "Heather Smith",
  "l": "CC BY 3.0",
  "lu": "https://creativecommons.org/licenses/by/3.0",
  "p": "https://commons.wikimedia.org/wiki/File:Butterfly-valve--The-Alloy-Valve-Stockist.JPG"
 },
 "/img/p-duo-check.jpg": {
  "a": "Heather Smith",
  "l": "CC BY 3.0",
  "lu": "https://creativecommons.org/licenses/by/3.0",
  "p": "https://commons.wikimedia.org/wiki/File:Wafer_check_valve--The-Alloy-Valve-Stockist.JPG"
 },
 "/img/p-termometro.jpg": {
  "a": "Palagiri",
  "l": "CC BY-SA 3.0",
  "lu": "https://creativecommons.org/licenses/by-sa/3.0",
  "p": "https://commons.wikimedia.org/wiki/File:Industrial_instrumetns-dial_guage_stem_thermometer..jpg"
 },
 "/img/p-api6a.jpg": {
  "a": "ReAl",
  "l": "CC BY-SA 3.0",
  "lu": "https://creativecommons.org/licenses/by-sa/3.0",
  "p": "https://commons.wikimedia.org/wiki/File:Solohiv_natural_gas_plant_-_christmas_tree_2.jpg"
 },
 "/img/p-manguera.jpg": {
  "a": "Norsk olje og gass",
  "l": "CC BY-SA 2.0",
  "lu": "https://creativecommons.org/licenses/by-sa/2.0",
  "p": "https://commons.wikimedia.org/wiki/File:Oseberg_drill_floor.jpg"
 },
 "/img/p-pvc-valvula.jpg": {
  "a": "SuSanA Secretariat",
  "l": "CC BY 2.0",
  "lu": "https://creativecommons.org/licenses/by/2.0",
  "p": "https://commons.wikimedia.org/wiki/File:Basket_strainer_by_HAYWARD_(model-_EASTAR_(PETG))_(6052568008).jpg"
 }
}, {
  '/img/cat-bridas.jpg': { a:'Cxliu000', l:'CC BY 4.0', lu:'https://creativecommons.org/licenses/by/4.0/', p:'https://commons.wikimedia.org/wiki/File:Machined_weld_neck_flanges_showing_faces_and_tapered_hubs.webp' },
  '/img/cat-inoxidable.jpg': { a:'Metinoxoverseas', l:'CC0', lu:'https://creativecommons.org/publicdomain/zero/1.0/', p:'https://commons.wikimedia.org/wiki/File:Stainless_Steel_317L_Seamless_U_Tubes_Exporters_In_India.jpg' },
  '/img/cat-vapor.jpg': { a:'Mairi Dulaney', l:'CC BY-SA 4.0', lu:'https://creativecommons.org/licenses/by-sa/4.0/', p:'https://commons.wikimedia.org/wiki/File:1_In_Steam_Globe_Valve_Parts_2019.jpg' },
  '/img/cat-instrumentacion.jpg': { a:'CEphoto, Uwe Aranas', l:'CC BY-SA 3.0', lu:'https://creativecommons.org/licenses/by-sa/3.0/', p:'https://commons.wikimedia.org/wiki/File:MAXIMATOR-High-Pressure-Manometer-01a.jpg' },
  '/img/cat-pvc.jpg': { a:'GWT Technik', l:'CC BY-SA 4.0', lu:'https://creativecommons.org/licenses/by-sa/4.0/', p:'https://commons.wikimedia.org/wiki/File:PVC-U_Druckrohr_Transparent_.jpg' }
});

// Idioma de la página actual y versión localizada de un producto.
function pageLang() { return (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es'; }
function locItem(item, lang) {
  const en = (lang || pageLang()) === 'en' ? (CATALOG_EN[item.name] || {}) : {};
  const fam = FAMILIAS.find(f => f.fam === item.fam);
  const dl = item.docLabel ? (en.docLabel || ((lang || pageLang()) === 'en' ? (DOC_LABEL_EN[item.docLabel] || item.docLabel) : item.docLabel)) : '';
  return {
    key: item.name,
    name: en.name || item.name,
    norma: en.norma || item.norma || '',
    diam: en.diam || item.diam || '',
    mat: en.mat || item.mat || '',
    fam: item.fam,
    famLabel: fam ? ((lang || pageLang()) === 'en' ? fam.en : fam.es) : item.fam,
    docUrl: item.docUrl || '',
    docLabel: dl
  };
}
