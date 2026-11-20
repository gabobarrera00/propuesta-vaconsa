// CATALOG y FAM_IMG viven en /catalogo-datos.js (lo cargan todas las páginas:
// el buscador con sugerencias y el cotizador los usan fuera del catálogo).


const FAMS = [...new Set(CATALOG.map(i => i.fam))];
let activeFam = null;
let shownNames = new Set();


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
      '<div class="pcard-media"><img alt="" width="800" height="600" loading="lazy" decoding="async"></div>' +
      '<div class="pcard-bar"><span class="pcard-fam"></span>' +
        '<h3 class="pcard-name"><button type="button" class="pcard-toggle" aria-expanded="false"></button></h3>' +
        '<button type="button" class="btn sm pcard-add">Agregar a cotización</button></div>' +
      '<div class="pcard-specs" role="region">' +
        '<p class="pcard-specs-t"></p>' +
        '<dl class="specs">' +
          '<div class="spec"><dt>Norma</dt><dd class="v-norma"></dd></div>' +
          '<div class="spec"><dt>Medida</dt><dd class="v-diam"></dd></div>' +
          '<div class="spec"><dt>Material</dt><dd class="v-mat"></dd></div>' +
        '</dl>' +
        '<div class="foot"><span class="norm"></span></div>' +
      '</div>';
    card.querySelector('img').src = imgFor(item);
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

    // Agregar a la lista de cotización (cotizador de /sitio.js).
    const addBtn = card.querySelector('.pcard-add');
    addBtn.setAttribute('aria-label', 'Agregar ' + item.name + ' a la cotización');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!window.Cotizacion) return;
      window.Cotizacion.add(item.name);
      addBtn.textContent = 'Agregado ✓';
      addBtn.classList.add('added');
      clearTimeout(addBtn._t);
      addBtn._t = setTimeout(() => { addBtn.textContent = 'Agregar otra'; addBtn.classList.remove('added'); }, 1600);
    });
    if (window.Cotizacion && window.Cotizacion.has(item.name)) addBtn.textContent = 'Agregar otra';

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
