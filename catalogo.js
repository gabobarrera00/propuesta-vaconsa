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

const FAMS = [...new Set(CATALOG.map(i => i.fam))];
let activeFam = null;
let shownNames = new Set();

// Foto de cada familia para las tarjetas del catálogo (las mismas de la
// rejilla de inicio; los créditos de las de Wikimedia están en el inicio).
const FAM_IMG = {
  "Tubería": "/img/lineas-tuberia-valvulas.jpg",
  "Conexiones": "/img/lineas-conexiones-sistemas.jpg",
  "Bridas": "/img/cat-bridas.jpg",
  "Válvulas": "/img/lineas-valvulas-industriales.jpg",
  "Inoxidable": "/img/cat-inoxidable.jpg",
  "Vapor": "/img/cat-vapor.jpg",
  "Petrolero": "/img/lineas-infraestructura-industrial.jpg",
  "Instrumentación": "/img/cat-instrumentacion.jpg",
  "PVC": "/img/cat-pvc.jpg"
};

const chipsEl = document.getElementById('chips');
const resultsEl = document.getElementById('results');
const qEl = document.getElementById('q');
const countEl = document.getElementById('resultsCount');

function buildChips(){
  chipsEl.innerHTML = '';
  const all = mkChip('Todo', null);
  chipsEl.appendChild(all);
  FAMS.forEach(f => chipsEl.appendChild(mkChip(f, f)));
}
function mkChip(label, fam){
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'chip';
  b.textContent = label;
  b.setAttribute('aria-pressed', String(activeFam === fam));
  b.addEventListener('click', () => {
    activeFam = (activeFam === fam) ? null : fam;
    buildChips();
    render();
  });
  return b;
}

function render(){
  const q = qEl.value.trim().toLowerCase();
  const hits = CATALOG.filter(item => {
    if (activeFam && item.fam !== activeFam) return false;
    if (!q) return true;
    const hay = (item.name + ' ' + item.norma + ' ' + item.mat + ' ' + item.diam + ' ' + item.tags + ' ' + item.fam).toLowerCase();
    return q.split(/\s+/).every(t => hay.includes(t));
  });

  resultsEl.innerHTML = '';

  // Anuncia el conteo en la región aria-live para quien no ve la pantalla.
  countEl.textContent = hits.length === 1 ? '1 resultado' : hits.length + ' resultados';

  if (!hits.length){
    const d = document.createElement('div');
    d.className = 'empty';
    d.innerHTML = '<b>Sin coincidencias para “' + escapeHtml(qEl.value.trim()) + '”</b>Manejamos material fuera de catálogo por pedido especial. Pregúntenos directamente y le confirmamos disponibilidad.';
    const btn = document.createElement('button');
    btn.className = 'btn sm';
    btn.type = 'button';
    btn.style.marginTop = '16px';
    btn.textContent = 'Preguntar por este material';
    btn.addEventListener('click', () => prefill(qEl.value.trim(), ''));
    d.appendChild(document.createElement('br'));
    d.appendChild(btn);
    resultsEl.appendChild(d);
    return;
  }

  // Tarjetas: foto + solo el nombre. Las especificaciones aparecen encima al
  // pasar el cursor, con foco de teclado o con un toque (otro toque cierra).
  // Solo animan las tarjetas que no estaban en el render anterior: así, al
  // escribir en el buscador, las que se quedan no parpadean.
  const prevShown = shownNames;
  shownNames = new Set();
  let fresh = 0;
  hits.forEach((item, idx) => {
    const id = 'specs-' + CATALOG.indexOf(item);
    const card = document.createElement('article');
    card.className = 'pcard';
    card.dataset.open = 'false';
    if (!prevShown.has(item.name)) {
      card.classList.add('pcard-new');
      card.style.setProperty('--i', String(Math.min(fresh++, 8)));
    }
    shownNames.add(item.name);
    card.innerHTML =
      '<div class="pcard-media"><img alt="" loading="lazy" decoding="async"></div>' +
      '<div class="pcard-bar"><span class="pcard-fam"></span>' +
        '<h3 class="pcard-name"><button type="button" class="pcard-toggle" aria-expanded="false"></button></h3></div>' +
      '<div class="pcard-specs" role="region">' +
        '<p class="pcard-specs-t"></p>' +
        '<dl class="specs">' +
          '<div class="spec"><dt>Norma</dt><dd class="v-norma"></dd></div>' +
          '<div class="spec"><dt>Medida</dt><dd class="v-diam"></dd></div>' +
          '<div class="spec"><dt>Material</dt><dd class="v-mat"></dd></div>' +
        '</dl>' +
        '<div class="foot"><span class="norm"></span></div>' +
      '</div>';
    card.querySelector('img').src = FAM_IMG[item.fam] || '/img/lineas-tuberia-valvulas.jpg';
    card.querySelector('.pcard-fam').textContent = item.fam;
    const toggle = card.querySelector('.pcard-toggle');
    toggle.textContent = item.name;
    toggle.setAttribute('aria-controls', id);
    const specs = card.querySelector('.pcard-specs');
    specs.id = id;
    specs.setAttribute('aria-label', 'Especificaciones de ' + item.name);
    card.querySelector('.pcard-specs-t').textContent = item.name;
    // Sin dato, "Consultar": nunca se inventa una norma ni una clase.
    card.querySelector('.v-norma').textContent = item.norma || 'Consultar';
    card.querySelector('.v-diam').textContent = item.diam || 'Consultar';
    card.querySelector('.v-mat').textContent = item.mat || 'Consultar';

    const norm = card.querySelector('.norm');
    if (item.docUrl){
      const a = document.createElement('a');
      a.href = item.docUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'doc-link';
      a.textContent = '↓ ' + item.docLabel;
      norm.appendChild(a);
    } else {
      norm.textContent = 'Certificado incluido';
    }

    const b = document.createElement('button');
    b.className = 'btn sm';
    b.type = 'button';
    b.textContent = 'Cotizar';
    b.addEventListener('click', (e) => { e.stopPropagation(); prefill(item.name, item.norma); });
    card.querySelector('.foot').appendChild(b);

    // Un toque (o clic) en cualquier parte de la tarjeta abre; otro cierra.
    // Los enlaces y el botón Cotizar de adentro siguen funcionando normal.
    card.addEventListener('click', (e) => {
      if (e.target.closest('a, .btn')) return;
      setOpen(card, card.dataset.open !== 'true');
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && card.dataset.open === 'true') { setOpen(card, false); toggle.focus(); }
    });
    resultsEl.appendChild(card);
  });
}

function setOpen(card, open){
  // Solo una abierta a la vez: en celular abrir otra cierra la anterior.
  if (open) resultsEl.querySelectorAll('.pcard[data-open="true"]').forEach(c => { if (c !== card) setOpen(c, false); });
  card.dataset.open = String(open);
  card.querySelector('.pcard-toggle').setAttribute('aria-expanded', String(open));
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function prefill(prod, norma){
  const url = '/cotizar/?prod=' + encodeURIComponent(prod) + '&norma=' + encodeURIComponent(norma);
  window.location.href = url;
}

qEl.addEventListener('input', render);
// El buscador del encabezado es el mismo campo: aquí filtra en vivo, así que
// Enter no debe recargar la página.
if (qEl.form) qEl.form.addEventListener('submit', (e) => { e.preventDefault(); render(); });

// Entradas desde fuera del catálogo:
//   ?q=...   buscador del header
//   ?fam=... tarjetas de "familia de producto" del inicio y links del footer
// Ambos se aplican antes de dibujar los chips para que el chip correcto quede
// marcado desde el primer render, sin un parpadeo de "Todo" primero.
const params = new URLSearchParams(window.location.search);
const initialQ = params.get('q');
if (initialQ) qEl.value = initialQ;

const initialFam = params.get('fam');
if (initialFam && FAMS.includes(initialFam)) activeFam = initialFam;

buildChips();
render();
