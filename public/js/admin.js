/* JTEC - scripts do painel */
(function () {
  'use strict';

  document.querySelectorAll('form[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!window.confirm(form.getAttribute('data-confirm'))) e.preventDefault();
    });
  });

  // Pré-visualização de imagem ao digitar a URL
  document.querySelectorAll('.image-field input').forEach(function (input) {
    input.addEventListener('change', function () {
      var wrap = input.closest('.image-field');
      var img = wrap.querySelector('img');
      if (!input.value) { if (img) img.remove(); return; }
      if (!img) {
        img = document.createElement('img');
        img.className = 'image-field__preview';
        img.alt = '';
        wrap.appendChild(img);
      }
      img.src = input.value;
    });
  });
})();
