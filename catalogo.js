// Página del catálogo (/catalogo/ y /en/catalogo/).
// CATALOG, FAMILIAS e imgFor viven en /catalogo-datos.js; los textos de
// interfaz (T, LANG, BASE, locItem, hayFor) en /i18n.js. Todos se cargan antes.

const FAMS = [...new Set(CATALOG.map(i => i.fam))];
let activeFam = null;
let shownNames = new Set();

const chipsEl = document.getElementById('chips');
const resultsEl = document.getElementById('results');
const qEl = document.getElementById('q');
const countEl = document.getElementById('resultsCount');

function famLabel(fam){
  const f = FAMILIAS.find(x => x.fam === fam);
  return f ? (LANG === 'en' ? f.en : f.es) : fam;
}

function buildChips(){
  chipsEl.innerHTML = '';
  chipsEl.appendChild(mkChip(T('all'), null));
  FAMS.forEach(f => chipsEl.appendChild(mkChip(famLabel(f), f)));
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
  // Busca en español e inglés a la vez y sin importar acentos.
  const toks = normTxt(qEl.value.trim()).split(/\s+/).filter(Boolean);
  const hits = CATALOG.filter(item => {
    if (activeFam && item.fam !== activeFam) return false;
    if (!toks.length) return true;
    const hay = normTxt(hayFor(item));
    return toks.every(t => hay.includes(t));
  });

  resultsEl.innerHTML = '';

  // Anuncia el conteo en la región aria-live para quien no ve la pantalla.
  countEl.textContent = T('results', hits.length);

  if (!hits.length){
    const d = document.createElement('div');
    d.className = 'empty';
    const b = document.createElement('b');
    b.textContent = T('noMatchTitle', qEl.value.trim());
    d.appendChild(b);
    d.appendChild(document.createTextNode(T('noMatchText')));
    const btn = document.createElement('button');
    btn.className = 'btn sm';
    btn.type = 'button';
    btn.style.marginTop = '16px';
    btn.textContent = T('askThis');
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
  hits.forEach((item) => {
    const L = locItem(item);
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
      '<div class="pcard-media"><img alt="" width="800" height="600" loading="lazy" decoding="async"></div>' +
      '<div class="pcard-bar"><span class="pcard-fam"></span>' +
        '<h3 class="pcard-name"><button type="button" class="pcard-toggle" aria-expanded="false"></button></h3>' +
        '<button type="button" class="btn sm pcard-add"></button></div>' +
      '<div class="pcard-specs" role="region">' +
        '<p class="pcard-specs-t"></p>' +
        '<dl class="specs">' +
          '<div class="spec"><dt class="l-norma"></dt><dd class="v-norma"></dd></div>' +
          '<div class="spec"><dt class="l-diam"></dt><dd class="v-diam"></dd></div>' +
          '<div class="spec"><dt class="l-mat"></dt><dd class="v-mat"></dd></div>' +
        '</dl>' +
        '<div class="foot"><span class="norm"></span></div>' +
      '</div>';
    card.querySelector('img').src = imgFor(item);
    card.querySelector('.pcard-fam').textContent = L.famLabel;
    const toggle = card.querySelector('.pcard-toggle');
    toggle.textContent = L.name;
    toggle.setAttribute('aria-controls', id);
    const specs = card.querySelector('.pcard-specs');
    specs.id = id;
    specs.setAttribute('aria-label', T('specsOf', L.name));
    card.querySelector('.pcard-specs-t').textContent = L.name;
    card.querySelector('.l-norma').textContent = T('norma');
    card.querySelector('.l-diam').textContent = T('size');
    card.querySelector('.l-mat').textContent = T('material');
    // Sin dato, "Consultar": nunca se inventa una norma ni una clase.
    card.querySelector('.v-norma').textContent = L.norma || T('consult');
    card.querySelector('.v-diam').textContent = L.diam || T('consult');
    card.querySelector('.v-mat').textContent = L.mat || T('consult');

    const norm = card.querySelector('.norm');
    if (L.docUrl){
      const a = document.createElement('a');
      a.href = L.docUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'doc-link';
      a.textContent = '↓ ' + L.docLabel + (LANG === 'en' ? ' (PDF, Spanish)' : '');
      norm.appendChild(a);
    } else {
      norm.textContent = T('certIncluded');
    }

    const b = document.createElement('button');
    b.className = 'btn sm';
    b.type = 'button';
    b.textContent = T('quote');
    b.addEventListener('click', (e) => { e.stopPropagation(); prefill(L.name, L.norma); });
    card.querySelector('.foot').appendChild(b);

    // Agregar a la lista de cotización (cotizador de /sitio.js).
    const addBtn = card.querySelector('.pcard-add');
    addBtn.textContent = (window.Cotizacion && window.Cotizacion.has(item.name)) ? T('addAnother') : T('addToQuote');
    addBtn.setAttribute('aria-label', T('addNamed', L.name));
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!window.Cotizacion) return;
      window.Cotizacion.add(item.name);
      addBtn.textContent = T('addedShort');
      addBtn.classList.add('added');
      clearTimeout(addBtn._t);
      addBtn._t = setTimeout(() => { addBtn.textContent = T('addAnother'); addBtn.classList.remove('added'); }, 1600);
    });

    // Un toque (o clic) en cualquier parte de la tarjeta abre; otro cierra.
    // Los enlaces y los botones de adentro siguen funcionando normal.
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

function prefill(prod, norma){
  window.location.href = BASE + '/cotizar/?prod=' + encodeURIComponent(prod) + '&norma=' + encodeURIComponent(norma);
}

qEl.addEventListener('input', render);
// El buscador del encabezado es el mismo campo: aquí filtra en vivo, así que
// Enter no debe recargar la página.
if (qEl.form) qEl.form.addEventListener('submit', (e) => { e.preventDefault(); render(); });

// Entradas desde fuera del catálogo:
//   ?q=...   buscador del header
//   ?fam=... clave en español de la familia (menú, inicio, pie, páginas de familia)
// Ambos se aplican antes de dibujar los chips para que el chip correcto quede
// marcado desde el primer render, sin un parpadeo de "Todo" primero.
const params = new URLSearchParams(window.location.search);
const initialQ = params.get('q');
if (initialQ) qEl.value = initialQ;

const initialFam = params.get('fam');
if (initialFam && FAMS.includes(initialFam)) activeFam = initialFam;

buildChips();
render();
