/* JTECK - scripts do site público */
(function () {
  'use strict';

  // ----- Menu mobile -----
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu-principal');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      document.body.classList.toggle('nav-open', open);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) toggle.click();
    });
  }

  // ----- Header compacto ao rolar -----
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ----- Slider do hero -----
  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = hero.querySelectorAll('.hero__slide');
    var dots = hero.querySelectorAll('.hero__dot');
    var current = 0;
    var timer = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var go = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === current);
        s.setAttribute('aria-hidden', String(i !== current));
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === current);
      });
    };
    var restart = function () {
      if (timer) clearInterval(timer);
      if (!reduceMotion && slides.length > 1) timer = setInterval(function () { go(current + 1); }, 7000);
    };

    hero.querySelectorAll('[data-dir]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        go(current + Number(btn.getAttribute('data-dir')));
        restart();
      });
    });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        go(Number(dot.getAttribute('data-goto')));
        restart();
      });
    });

    // Gestos de toque
    var startX = null;
    hero.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) { go(current + (dx < 0 ? 1 : -1)); restart(); }
      startX = null;
    });

    hero.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    hero.addEventListener('mouseleave', restart);
    go(0);
    restart();
  }

  // ----- Máscara de telefone -----
  document.querySelectorAll('[data-mask="phone"]').forEach(function (input) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '').slice(0, 11);
      var out = d;
      if (d.length > 6) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length > 10 ? 7 : 6) + '-' + d.slice(d.length > 10 ? 7 : 6);
      else if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      else if (d.length > 0) out = '(' + d;
      input.value = out;
    });
  });

  // ----- Validação leve no cliente -----
  var form = document.querySelector('form.form[action="/contato"]');
  if (form) {
    form.addEventListener('submit', function (e) {
      var invalid = false;
      form.querySelectorAll('[required]').forEach(function (el) {
        var field = el.closest('.field');
        var ok = el.value.trim().length > 0 && (el.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value));
        if (field) field.classList.toggle('has-error', !ok);
        if (!ok) invalid = true;
      });
      if (invalid) {
        e.preventDefault();
        var first = form.querySelector('.has-error input, .has-error select, .has-error textarea');
        if (first) first.focus();
      }
    });
  }

  // ----- Animação de entrada -----
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.card, .step, .segment, .stat, .mvv__item, .contact-card').forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  // ----- WhatsApp: esconde o rótulo depois de alguns segundos -----
  var wa = document.querySelector('.whatsapp-float');
  if (wa) {
    setTimeout(function () { wa.classList.add('is-compact'); }, 6000);
  }
})();
