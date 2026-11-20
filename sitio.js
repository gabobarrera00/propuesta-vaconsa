// Comportamiento común a todas las páginas:
//   1. Cotizador tipo carrito (lista guardada en el navegador, envío por
//      WhatsApp o correo que abre la app de la persona; nada se envía solo).
//   2. Sugerencias en vivo del buscador del encabezado (combobox accesible).
//   3. Aparición progresiva al hacer scroll (solo si hay movimiento permitido).
// Depende de CATALOG (de /catalogo-datos.js, cargado antes).
(function () {
  'use strict';

  // Contactos reales, los mismos del sitio de Vaconsa.
  var WHATSAPP = '528120106106';            // +52 81 2010 6106 (botón de WhatsApp de vaconsa.com.mx)
  var CORREO = 'ventas@vaconsa.com.mx';
  var KEY = 'vaconsa.cotizacion.v1';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ================= 1. Cotizador ================= */
  var state = { items: [], notas: '' };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && Array.isArray(saved.items)) {
      // Solo se aceptan productos que existen en el catálogo real.
      state.items = saved.items.filter(function (i) {
        return i && CATALOG.some(function (c) { return c.name === i.name; });
      }).map(function (i) {
        return { name: i.name, qty: Math.max(1, Math.min(99999, parseInt(i.qty, 10) || 1)) };
      });
      state.notas = typeof saved.notas === 'string' ? saved.notas.slice(0, 1000) : '';
    }
  } catch (e) { /* almacenamiento bloqueado o dañado: se empieza vacío */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* sin almacenamiento: la lista vive solo en esta visita */ }
  }
  function product(name) {
    for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].name === name) return CATALOG[i];
    return null;
  }
  function count() { return state.items.length; }

  var live = $('#cart-live');
  function announce(msg) {
    if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = msg; }, 50);
  }

  var btn = $('.cart-btn');
  var panel = $('#cart');
  var backdrop = $('.cart-backdrop');
  var list = panel && $('.cart-list', panel);
  var notas = panel && $('#cart-notas', panel);
  var lastFocus = null;

  function plural(n) { return T('products', n); }
  // Nombre y norma en el idioma de la página; la lista se guarda con el
  // nombre en español (la clave estable de CATALOG).
  function shown(name) { var p = product(name); return p ? locItem(p) : { name: name, norma: '' }; }

  function updateBadge(bump) {
    if (!btn) return;
    var n = count();
    var badge = $('.cart-n', btn);
    badge.textContent = String(n);
    badge.hidden = n === 0;
    btn.setAttribute('aria-label', T('cartLabel', n));
    if (bump && !reduced) {
      badge.classList.remove('bump');
      void badge.offsetWidth;
      badge.classList.add('bump');
    }
  }

  function message() {
    var lines = [T('msgHello'), ''];
    state.items.forEach(function (it, i) {
      var p = shown(it.name);
      lines.push((i + 1) + '. ' + p.name + (p.norma ? ' (' + p.norma + ')' : '') + ' — ' + T('msgQty') + ': ' + it.qty);
    });
    if (state.notas.trim()) { lines.push(''); lines.push(T('msgNotes') + ': ' + state.notas.trim()); }
    lines.push('');
    lines.push(T('msgFooter'));
    return lines.join('\n');
  }

  function renderCart() {
    if (!panel) return;
    list.innerHTML = '';
    var empty = state.items.length === 0;
    $('.cart-empty', panel).hidden = !empty;
    $('.cart-foot', panel).hidden = empty;
    state.items.forEach(function (it, idx) {
      var p = shown(it.name);
      var li = el('li', 'cart-item');
      var txt = el('div', 'ci-txt');
      txt.appendChild(el('span', 'ci-name', p.name));
      txt.appendChild(el('span', 'ci-norma', p.norma || T('consult')));
      var qtyWrap = el('div', 'ci-qty');
      var qid = 'ci-q-' + idx;
      var lab = el('label', 'sr-only', T('qtyOf', p.name));
      lab.setAttribute('for', qid);
      var minus = el('button', 'ci-step', '−');
      minus.type = 'button';
      minus.setAttribute('aria-label', T('minusOne', p.name));
      var input = el('input');
      input.type = 'number'; input.id = qid; input.min = '1'; input.max = '99999'; input.inputMode = 'numeric';
      input.value = String(it.qty);
      var plus = el('button', 'ci-step', '+');
      plus.type = 'button';
      plus.setAttribute('aria-label', T('plusOne', p.name));
      function setQty(v) {
        it.qty = Math.max(1, Math.min(99999, parseInt(v, 10) || 1));
        input.value = String(it.qty);
        save(); syncLinks();
      }
      minus.addEventListener('click', function () { setQty(it.qty - 1); });
      plus.addEventListener('click', function () { setQty(it.qty + 1); });
      input.addEventListener('change', function () { setQty(input.value); });
      qtyWrap.appendChild(lab); qtyWrap.appendChild(minus); qtyWrap.appendChild(input); qtyWrap.appendChild(plus);
      var rm = el('button', 'ci-rm', T('remove'));
      rm.type = 'button';
      rm.setAttribute('aria-label', T('removeFrom', p.name));
      rm.addEventListener('click', function () {
        remove(it.name);
        var next = list.querySelector('.ci-rm') || $('.cart-close', panel);
        next.focus();
      });
      li.appendChild(txt); li.appendChild(qtyWrap); li.appendChild(rm);
      list.appendChild(li);
    });
    if (notas) notas.value = state.notas;
    $('.cart-count', panel).textContent = empty ? '' : plural(state.items.length);
    syncLinks();
  }

  function syncLinks() {
    if (!panel) return;
    var msg = message();
    $('.cart-wa', panel).href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);
    $('.cart-mail', panel).href = 'mailto:' + CORREO + '?subject=' + encodeURIComponent(T('mailSubject')) + '&body=' + encodeURIComponent(msg);
  }

  function add(name) {
    var p = product(name);
    if (!p) return;
    var it = state.items.filter(function (i) { return i.name === name; })[0];
    if (it) it.qty += 1; else state.items.push({ name: name, qty: 1 });
    save(); renderCart(); updateBadge(true);
    announce(T('added', shown(name).name, count()));
  }
  function remove(name) {
    state.items = state.items.filter(function (i) { return i.name !== name; });
    save(); renderCart(); updateBadge(false);
    announce(T('removed', shown(name).name, count()));
  }

  function focusables() {
    return Array.prototype.filter.call(
      panel.querySelectorAll('a[href], button, input, textarea'),
      function (e) { return !e.disabled && e.offsetParent !== null; });
  }
  function openCart() {
    if (!panel || !panel.hidden) return;
    lastFocus = document.activeElement;
    panel.hidden = false; backdrop.hidden = false;
    document.documentElement.classList.add('cart-lock');
    btn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      panel.classList.add('open'); backdrop.classList.add('open');
    }); });
    $('.cart-close', panel).focus();
  }
  function closeCart() {
    if (!panel || panel.hidden) return;
    panel.classList.remove('open'); backdrop.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('cart-lock');
    setTimeout(function () { panel.hidden = true; backdrop.hidden = true; }, reduced ? 0 : 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (panel) {
    btn.addEventListener('click', openCart);
    backdrop.addEventListener('click', closeCart);
    $('.cart-close', panel).addEventListener('click', closeCart);
    $('.cart-clear', panel).addEventListener('click', function () {
      state.items = []; save(); renderCart(); updateBadge(false);
      announce(T('cleared'));
      $('.cart-close', panel).focus();
    });
    notas.addEventListener('input', function () { state.notas = notas.value.slice(0, 1000); save(); syncLinks(); });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeCart(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    renderCart();
    updateBadge(false);
  }

  window.Cotizacion = { add: add, has: function (n) { return state.items.some(function (i) { return i.name === n; }); }, open: openCart };

  // Botones "Agregar a cotización" de las páginas de familia (marcado estático
  // con data-add="<nombre en español de CATALOG>").
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-add]');
    if (!b) return;
    add(b.getAttribute('data-add'));
    b.textContent = T('addedShort');
    b.classList.add('added');
    clearTimeout(b._t);
    b._t = setTimeout(function () { b.textContent = T('addAnother'); b.classList.remove('added'); }, 1600);
  });

  // Selector ES | EN: lleva a la misma página en el otro idioma y conserva la
  // búsqueda o el filtro actual (?q=, ?fam=) y el ancla.
  document.querySelectorAll('.lang-switch a[hreflang]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (location.search || location.hash) a.href = a.getAttribute('href').split(/[?#]/)[0] + location.search + location.hash;
    });
  });

  /* ================= 2. Sugerencias del buscador ================= */
  var q = $('#q');
  var sug = $('#q-sug');
  if (q && sug) {
    var opts = [], active = -1, suppress = false;
    var onCatalog = !!document.getElementById('results');
    function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    function close() {
      sug.hidden = true; q.setAttribute('aria-expanded', 'false');
      q.removeAttribute('aria-activedescendant'); active = -1;
    }
    function setActive(i) {
      opts.forEach(function (o, k) { o.setAttribute('aria-selected', String(k === i)); });
      active = i;
      if (i >= 0) { q.setAttribute('aria-activedescendant', opts[i].id); opts[i].scrollIntoView({ block: 'nearest' }); }
      else q.removeAttribute('aria-activedescendant');
    }
    function choose(o) {
      var name = o.dataset.name;
      close();
      if (o.dataset.all) {
        if (onCatalog) { suppress = true; q.dispatchEvent(new Event('input')); }
        else location.href = BASE + '/catalogo/?q=' + encodeURIComponent(q.value.trim());
        return;
      }
      q.value = locItem(product(name)).name;
      if (onCatalog) { suppress = true; q.dispatchEvent(new Event('input')); }
      else location.href = BASE + '/catalogo/?q=' + encodeURIComponent(q.value);
    }
    function update() {
      if (suppress) { suppress = false; close(); return; }
      var text = q.value.trim();
      sug.innerHTML = ''; opts = []; active = -1;
      if (text.length < 2) { close(); return; }
      var toks = norm(text).split(/\s+/);
      var hits = CATALOG.map(function (it) {
        var hay = norm(hayFor(it));
        if (!toks.every(function (t) { return hay.indexOf(t) >= 0; })) return null;
        var score = norm(locItem(it).name).indexOf(toks[0]) >= 0 ? 0 : 1;
        return { it: it, score: score };
      }).filter(Boolean).sort(function (a, b) { return a.score - b.score; }).slice(0, 6);
      hits.forEach(function (h, i) {
        var li = el('li', 'sug-opt');
        li.id = 'q-sug-' + i; li.setAttribute('role', 'option'); li.setAttribute('aria-selected', 'false');
        li.dataset.name = h.it.name;
        var L = locItem(h.it);
        li.appendChild(el('span', 'sug-name', L.name));
        li.appendChild(el('span', 'sug-meta', L.famLabel + ' · ' + (L.norma || T('consult'))));
        sug.appendChild(li); opts.push(li);
      });
      var all = el('li', 'sug-opt sug-all', hits.length ? T('seeAll', text) : T('noSug', text));
      all.id = 'q-sug-all'; all.setAttribute('role', 'option'); all.setAttribute('aria-selected', 'false'); all.dataset.all = '1';
      sug.appendChild(all); opts.push(all);
      sug.hidden = false; q.setAttribute('aria-expanded', 'true');
    }
    q.setAttribute('role', 'combobox');
    q.setAttribute('aria-autocomplete', 'list');
    q.setAttribute('aria-expanded', 'false');
    q.setAttribute('aria-controls', 'q-sug');
    q.setAttribute('autocomplete', 'off');
    q.addEventListener('input', update);
    q.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        if (sug.hidden) update();
        if (opts.length) { e.preventDefault(); setActive((active + 1) % opts.length); }
      } else if (e.key === 'ArrowUp') {
        if (opts.length && !sug.hidden) { e.preventDefault(); setActive(active <= 0 ? opts.length - 1 : active - 1); }
      } else if (e.key === 'Enter') {
        if (!sug.hidden && active >= 0) { e.preventDefault(); choose(opts[active]); }
        else close();
      } else if (e.key === 'Escape') {
        if (!sug.hidden) { e.preventDefault(); close(); }
      }
    });
    // mousedown en vez de click: así la opción se elige antes de que el
    // campo pierda el foco y la lista se cierre.
    sug.addEventListener('mousedown', function (e) {
      var o = e.target.closest('.sug-opt');
      if (o) { e.preventDefault(); choose(o); }
    });
    q.addEventListener('blur', function () { setTimeout(close, 120); });
  }

  /* ================= 3. Aparición al hacer scroll ================= */
  if (document.documentElement.classList.contains('motion')) {
    var groups = ['.account-strip', '.cats-head', '.cats-sub', '.cat', '.help-row', '.sec-head', '.sec-sub', '.svc', '.rse',
      '.dev-group-t', '.dev-item', '.doc-group', '.loc', '.jobs', '.about-copy', '.timeline li', '.trust-grid > *',
      '.lines-strip figure', '.quote-grid > *', '.portal-card'];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.08 });
    document.querySelectorAll(groups.join(',')).forEach(function (node) {
      var i = 0, s = node.previousElementSibling;
      while (s && i < 6) { if (s.classList.contains('reveal')) i++; s = s.previousElementSibling; }
      node.style.setProperty('--i', i % 4);
      node.classList.add('reveal');
      io.observe(node);
    });
  }
})();
