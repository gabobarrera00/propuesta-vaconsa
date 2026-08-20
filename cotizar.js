(function prefillFromQuery(){
  const params = new URLSearchParams(window.location.search);
  const prod = params.get('prod');
  const norma = params.get('norma');
  if (!prod && !norma) return;
  const form = document.getElementById('quoteForm');
  if (!form) return;
  if (prod) form.querySelector('#f-prod').value = prod;
  if (norma) form.querySelector('#f-norma').value = norma;
  form.querySelector('#f-cant').focus();
})();

document.getElementById('quoteForm').addEventListener('submit', function(e){
  e.preventDefault();
  const form = e.target;
  // Ya no hay bucle de validación a mano: sin novalidate el navegador no llega
  // aquí hasta que required y type="email" estén satisfechos, y él mismo pone el
  // foco y el mensaje en el campo que falta. Menos código y más funcionalidad.
  const prod = form.querySelector('#f-prod').value.trim();
  const norma = form.querySelector('#f-norma').value.trim();
  const cant = form.querySelector('#f-cant').value.trim();
  const emp = form.querySelector('#f-emp').value.trim();

  const slot = document.getElementById('formSlot');
  const done = document.createElement('div');
  done.className = 'sent';
  done.innerHTML =
    '<div class="big">Solicitud recibida</div>' +
    '<p>Un ejecutivo revisará disponibilidad y le responderá el mismo día hábil.</p>' +
    '<p style="font-size:11.5px;">(Demostración — no se envió información real.)</p>' +
    '<div class="recap">' +
      '<div><b>Material:</b> <span class="r-prod"></span></div>' +
      '<div><b>Norma:</b> <span class="r-norma"></span></div>' +
      '<div><b>Cantidad:</b> <span class="r-cant"></span></div>' +
      '<div><b>Empresa:</b> <span class="r-emp"></span></div>' +
    '</div>';
  done.querySelector('.r-prod').textContent = prod;
  done.querySelector('.r-norma').textContent = norma || '—';
  done.querySelector('.r-cant').textContent = cant || '—';
  done.querySelector('.r-emp').textContent = emp;
  slot.innerHTML = '';
  slot.appendChild(done);
  done.scrollIntoView({behavior:'smooth', block:'center'});
});
