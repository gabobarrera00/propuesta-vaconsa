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
  // Textos en el idioma de la página (T de /i18n.js).
  done.innerHTML = '<div class="big"></div><p class="r-msg"></p><p class="r-demo" style="font-size:12.5px;"></p>';
  done.querySelector('.big').textContent = T('sentTitle');
  done.querySelector('.r-msg').textContent = T('jobsThanks', nombre, area);
  done.querySelector('.r-demo').textContent = T('demoNote');
  form.replaceWith(done);
  done.scrollIntoView({behavior:'smooth', block:'center'});
});
