document.getElementById('jobsForm').addEventListener('submit', function(e){
  e.preventDefault();
  const form = e.target;
  // Sin novalidate el navegador ya no llega aquí hasta que required y
  // type="email" estén satisfechos — mismo arreglo que el formulario de
  // cotización. Ver AUDITORIA.md #1.
  const nombre = form.querySelector('#j-nom').value.trim();
  const area = form.querySelector('#j-area').value;
  const done = document.createElement('div');
  done.className = 'sent';
  done.innerHTML =
    '<div class="big">Solicitud recibida</div>' +
    '<p>Gracias, <span class="r-nom"></span>. Guardamos su currículum para el área de <span class="r-area"></span> y le avisaremos cuando haya una vacante que corresponda.</p>' +
    '<p style="font-size:11.5px;">(Demostración — no se envió información real.)</p>';
  done.querySelector('.r-nom').textContent = nombre;
  done.querySelector('.r-area').textContent = area;
  form.replaceWith(done);
  done.scrollIntoView({behavior:'smooth', block:'center'});
});
