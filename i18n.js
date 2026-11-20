// Textos de interfaz en español e inglés para los scripts del sitio.
// El idioma sale de <html lang>: las páginas bajo /en/ llevan lang="en".
// Depende de pageLang() de /catalogo-datos.js (cargado antes).
const LANG = pageLang();
const BASE = LANG === 'en' ? '/en' : '';

const UI = {
  es: {
    consult: 'Consultar',
    products: n => n === 1 ? '1 producto' : n + ' productos',
    results: n => n === 1 ? '1 resultado' : n + ' resultados',
    cartLabel: n => 'Mi cotización, ' + (n === 1 ? '1 producto' : n + ' productos'),
    msgHello: 'Hola, quiero solicitar cotización de:',
    msgQty: 'Cantidad',
    msgNotes: 'Notas',
    msgFooter: 'Enviado desde la propuesta de sitio de Nexo Web.',
    mailSubject: 'Solicitud de cotización',
    qtyOf: name => 'Cantidad de ' + name,
    minusOne: name => 'Restar uno a ' + name,
    plusOne: name => 'Sumar uno a ' + name,
    remove: 'Quitar',
    removeFrom: name => 'Quitar ' + name + ' de la cotización',
    added: (name, n) => 'Agregado a la cotización: ' + name + '. ' + (n === 1 ? '1 producto' : n + ' productos') + ' en la lista.',
    removed: (name, n) => name + ' se quitó de la cotización. ' + (n === 1 ? '1 producto' : n + ' productos') + ' en la lista.',
    cleared: 'La lista de cotización quedó vacía.',
    seeAll: q => 'Ver todos los resultados de “' + q + '”',
    noSug: q => 'Sin sugerencias para “' + q + '” — buscar en el catálogo',
    addToQuote: 'Agregar a cotización',
    addNamed: name => 'Agregar a cotización: ' + name,
    addedShort: 'Agregado ✓',
    addAnother: 'Agregar otra',
    all: 'Todo',
    norma: 'Norma', size: 'Medida', material: 'Material',
    certIncluded: 'Certificado incluido',
    quote: 'Cotizar',
    specsOf: name => 'Especificaciones de ' + name,
    noMatchTitle: q => 'Sin coincidencias para “' + q + '”',
    noMatchText: 'Manejamos material fuera de catálogo por pedido especial. Pregúntenos directamente y le confirmamos disponibilidad.',
    askThis: 'Preguntar por este material',
    sentTitle: 'Solicitud recibida',
    sentQuote: 'Un ejecutivo revisará disponibilidad y le responderá el mismo día hábil.',
    demoNote: '(Demostración — no se envió información real.)',
    rMaterial: 'Material:', rNorma: 'Norma:', rQty: 'Cantidad:', rCompany: 'Empresa:',
    jobsThanks: (nom, area) => 'Gracias, ' + nom + '. Guardamos su currículum para el área de ' + area + ' y le avisaremos cuando haya una vacante que corresponda.',
    invoices: n => n + (n === 1 ? ' factura' : ' facturas'),
    pending: n => n + (n === 1 ? ' pendiente' : ' pendientes'),
    upToDate: 'al corriente',
    invHead: ['Folio', 'Fecha', 'Monto', 'Estatus'],
    status: { Pagada: 'Pagada', Pendiente: 'Pendiente', Vencida: 'Vencida' },
    money: n => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  },
  en: {
    consult: 'On request',
    products: n => n === 1 ? '1 product' : n + ' products',
    results: n => n === 1 ? '1 result' : n + ' results',
    cartLabel: n => 'My quote, ' + (n === 1 ? '1 product' : n + ' products'),
    msgHello: 'Hello, I would like a quote for:',
    msgQty: 'Quantity',
    msgNotes: 'Notes',
    msgFooter: 'Sent from the Nexo Web website proposal.',
    mailSubject: 'Quote request',
    qtyOf: name => 'Quantity of ' + name,
    minusOne: name => 'Remove one ' + name,
    plusOne: name => 'Add one more ' + name,
    remove: 'Remove',
    removeFrom: name => 'Remove ' + name + ' from the quote',
    added: (name, n) => 'Added to the quote: ' + name + '. ' + (n === 1 ? '1 product' : n + ' products') + ' in the list.',
    removed: (name, n) => name + ' was removed from the quote. ' + (n === 1 ? '1 product' : n + ' products') + ' in the list.',
    cleared: 'The quote list is now empty.',
    seeAll: q => 'See all results for “' + q + '”',
    noSug: q => 'No suggestions for “' + q + '” — search the catalog',
    addToQuote: 'Add to quote',
    addNamed: name => 'Add to quote: ' + name,
    addedShort: 'Added ✓',
    addAnother: 'Add another',
    all: 'All',
    norma: 'Standard', size: 'Size', material: 'Material',
    certIncluded: 'Mill certificate included',
    quote: 'Request quote',
    specsOf: name => 'Specifications for ' + name,
    noMatchTitle: q => 'No matches for “' + q + '”',
    noMatchText: 'We supply non-catalog material by special order. Ask us directly and we will confirm availability.',
    askThis: 'Ask about this material',
    sentTitle: 'Request received',
    sentQuote: 'A sales representative will check availability and reply the same business day.',
    demoNote: '(Demo — no information was actually sent.)',
    rMaterial: 'Material:', rNorma: 'Standard:', rQty: 'Quantity:', rCompany: 'Company:',
    jobsThanks: (nom, area) => 'Thank you, ' + nom + '. We have kept your résumé for the ' + area + ' area and will contact you when a matching position opens.',
    invoices: n => n + (n === 1 ? ' invoice' : ' invoices'),
    pending: n => n + ' pending',
    upToDate: 'up to date',
    invHead: ['Invoice no.', 'Date', 'Amount', 'Status'],
    status: { Pagada: 'Paid', Pendiente: 'Pending', Vencida: 'Overdue' },
    money: n => 'MXN $' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
};
function T(key) {
  const v = UI[LANG][key];
  if (typeof v === 'function') return v.apply(null, Array.prototype.slice.call(arguments, 1));
  return v;
}

// Texto donde se busca: español e inglés juntos, para que "gate valve" y
// "válvula de compuerta" encuentren lo mismo en los dos idiomas.
function hayFor(it) {
  const e = CATALOG_EN[it.name] || {};
  return [it.name, it.norma, it.mat, it.diam, it.tags, it.fam, e.name, e.norma, e.diam, e.mat].filter(Boolean).join(' ');
}
function normTxt(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
