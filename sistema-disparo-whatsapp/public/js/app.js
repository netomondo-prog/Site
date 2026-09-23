/* Sistema de Disparo WhatsApp - scripts do painel */
(function () {
  'use strict';

  document.querySelectorAll('form[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!window.confirm(form.getAttribute('data-confirm'))) e.preventDefault();
    });
  });

  document.querySelectorAll('[data-confirm-click]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (!window.confirm(btn.getAttribute('data-confirm-click'))) e.preventDefault();
    });
  });

  // Selecionar todos (lista de contatos)
  document.querySelectorAll('[data-check-all]').forEach(function (master) {
    master.addEventListener('change', function () {
      var name = master.getAttribute('data-check-all');
      document.querySelectorAll('input[type=checkbox][name="' + name + '"]').forEach(function (cb) { cb.checked = master.checked; });
    });
  });

  // Reordenar arquivos do kit
  document.querySelectorAll('[data-order-input]').forEach(function (list) {
    var input = document.getElementById(list.getAttribute('data-order-input'));
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-move]');
      if (!btn) return;
      var item = btn.closest('.media-item');
      if (btn.getAttribute('data-move') === '-1' && item.previousElementSibling) list.insertBefore(item, item.previousElementSibling);
      if (btn.getAttribute('data-move') === '1' && item.nextElementSibling) list.insertBefore(item.nextElementSibling, item);
      input.value = Array.prototype.map.call(list.querySelectorAll('.media-item'), function (el) { return el.getAttribute('data-id'); }).join(',');
    });
  });
})();
