// Portal de clientes — prototipo visual, sin backend. Datos de ejemplo fijos
// en el navegador; no representan clientes reales de Vaconsa.
const PORTAL_CLIENTS = [
  { name:'Construcciones Industriales Ferrand, S.A. de C.V.', invoices:[
    {folio:'FAC-10432', fecha:'2026-06-02', monto:184320, estatus:'Pagada'},
    {folio:'FAC-10501', fecha:'2026-07-14', monto:92150, estatus:'Pagada'},
    {folio:'FAC-10556', fecha:'2026-08-05', monto:47800, estatus:'Pendiente'}
  ]},
  { name:'Grupo Metalúrgico Bernal', invoices:[
    {folio:'FAC-10299', fecha:'2026-05-20', monto:312900, estatus:'Pagada'},
    {folio:'FAC-10388', fecha:'2026-06-30', monto:156400, estatus:'Vencida'}
  ]},
  { name:'Procesos Térmicos del Norte, S.A. de C.V.', invoices:[
    {folio:'FAC-10410', fecha:'2026-06-11', monto:58300, estatus:'Pagada'},
    {folio:'FAC-10475', fecha:'2026-07-22', monto:73900, estatus:'Pagada'},
    {folio:'FAC-10520', fecha:'2026-08-01', monto:121050, estatus:'Pendiente'}
  ]},
  { name:'Petroquímica Sierra Alta', invoices:[
    {folio:'FAC-10201', fecha:'2026-04-18', monto:445600, estatus:'Pagada'},
    {folio:'FAC-10360', fecha:'2026-06-25', monto:198200, estatus:'Pagada'}
  ]},
  { name:'Manufacturas Industriales Coyame', invoices:[
    {folio:'FAC-10333', fecha:'2026-05-30', monto:34750, estatus:'Pendiente'},
    {folio:'FAC-10402', fecha:'2026-06-28', monto:61200, estatus:'Pagada'}
  ]}
];

function mxn(n){
  return '$' + n.toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2});
}

function renderClients(){
  const list = document.getElementById('clientList');
  list.innerHTML = '';
  PORTAL_CLIENTS.forEach(c => {
    const pend = c.invoices.filter(f => f.estatus !== 'Pagada').length;

    const row = document.createElement('div');
    row.className = 'client';
    row.dataset.open = 'false';

    const head = document.createElement('button');
    head.type = 'button';
    head.className = 'client-head';
    head.innerHTML =
      '<div><h3></h3><div class="meta"></div></div>' +
      '<svg class="chev" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';
    head.querySelector('h3').textContent = c.name;
    head.querySelector('.meta').textContent =
      c.invoices.length + (c.invoices.length === 1 ? ' factura' : ' facturas') +
      (pend ? ' · ' + pend + (pend === 1 ? ' pendiente' : ' pendientes') : ' · al corriente');
    head.addEventListener('click', () => {
      row.dataset.open = row.dataset.open === 'true' ? 'false' : 'true';
    });

    const body = document.createElement('div');
    body.className = 'client-body';
    const table = document.createElement('table');
    table.className = 'invoices';
    table.innerHTML = '<thead><tr><th>Folio</th><th>Fecha</th><th>Monto</th><th>Estatus</th></tr></thead>';
    const tbody = document.createElement('tbody');
    c.invoices.forEach(f => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + f.folio + '</td>' +
        '<td>' + f.fecha + '</td>' +
        '<td>' + mxn(f.monto) + '</td>' +
        '<td><span class="inv-status ' + f.estatus.toLowerCase() + '">' + f.estatus + '</span></td>';
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    body.appendChild(table);

    row.appendChild(head);
    row.appendChild(body);
    list.appendChild(row);
  });
}

document.getElementById('portalLoginForm').addEventListener('submit', function(e){
  e.preventDefault();
  document.getElementById('portalLogin').hidden = true;
  document.getElementById('portalApp').hidden = false;
  renderClients();
});

document.getElementById('portalLogout').addEventListener('click', function(){
  document.getElementById('portalApp').hidden = true;
  document.getElementById('portalLogin').hidden = false;
  document.getElementById('portalLoginForm').reset();
});
