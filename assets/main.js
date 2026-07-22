/* 1050 Highlands Dr — site behaviors (no dependencies) */
(function () {
  'use strict';

  /* Mobile nav ---------------------------------------------------- */
  var nav = document.querySelector('.nav');
  var burger = document.querySelector('.nav-burger');
  if (nav && burger) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav-mobile a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('nav-open'); });
    });
  }

  /* Reveal on scroll ---------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* Lightbox -------------------------------------------------------- */
  var photos = Array.prototype.slice.call(document.querySelectorAll('.photo.clickable'));
  if (photos.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML =
      '<button class="lb-btn lb-close" aria-label="Close">&#10005;</button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous photo">&#8592;</button>' +
      '<img alt="">' +
      '<div class="lb-cap"><b></b><span></span></div>' +
      '<button class="lb-btn lb-next" aria-label="Next photo">&#8594;</button>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img');
    var lbH = lb.querySelector('.lb-cap b');
    var lbD = lb.querySelector('.lb-cap span');
    var idx = 0;

    function show(i) {
      idx = (i + photos.length) % photos.length;
      var p = photos[idx];
      var img = p.querySelector('img');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      lbH.textContent = (p.querySelector('.cap-h') || {}).textContent || '';
      lbD.textContent = (p.querySelector('.cap-d') || {}).textContent || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus();
    }
    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
    photos.forEach(function (p, i) {
      p.setAttribute('tabindex', '0');
      p.setAttribute('role', 'button');
      p.addEventListener('click', function () { show(i); });
      p.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); }
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Downtown filters ------------------------------------------------ */
  var chips = document.querySelectorAll('.chip[data-filter]');
  if (chips.length) {
    var spots = document.querySelectorAll('[data-cats]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('on'); c.setAttribute('aria-pressed','false'); });
        chip.classList.add('on');
        chip.setAttribute('aria-pressed','true');
        var f = chip.getAttribute('data-filter');
        spots.forEach(function (s) {
          var hit = f === 'all' || s.getAttribute('data-cats').split(' ').indexOf(f) !== -1;
          s.style.display = hit ? '' : 'none';
        });
      });
    });
  }

  /* Contact form (mailto — no backend, nothing stored) --------------- */
  var form = document.getElementById('showing-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var g = function (k) { return (fd.get(k) || '').toString().trim(); };
      var when = [g('date'), g('time')].filter(Boolean).join(' at ');
      var body = [
        'Name: ' + g('name'),
        'Email: ' + g('email'),
        'Phone: ' + (g('phone') || '—'),
        'Preferred showing time: ' + (when || '—'),
        '',
        g('message') || '(no message)',
        '',
        '— Sent from the 1050 Highlands Dr website'
      ].join('\n');
      var href = 'mailto:' + form.getAttribute('data-agent-email') +
        '?subject=' + encodeURIComponent('Showing request — 1050 Highlands Dr, Erie') +
        '&body=' + encodeURIComponent(body);
      window.location.href = href;
      var ok = document.getElementById('form-sent');
      if (ok) { form.hidden = true; ok.hidden = false; }
    });
  }

  /* Mortgage calculator ---------------------------------------------- */
  var calc = document.getElementById('calc');
  if (calc) {
    var price = document.getElementById('calc-price');
    var down = document.getElementById('calc-down');
    var rate = document.getElementById('calc-rate');
    var term = document.getElementById('calc-term');
    var out = document.getElementById('calc-out');
    var sub = document.getElementById('calc-sub');
    var fmt = function (n) {
      return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    var update = function () {
      var P = parseFloat(price.value) || 0;
      var dPct = Math.min(Math.max(parseFloat(down.value) || 0, 0), 100);
      var r = (parseFloat(rate.value) || 0) / 100 / 12;
      var n = (parseInt(term.value, 10) || 30) * 12;
      var loan = P * (1 - dPct / 100);
      var m = r > 0 ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
      out.textContent = fmt(m) + '/mo';
      sub.textContent = fmt(loan) + ' loan · ' + dPct + '% down (' + fmt(P * dPct / 100) + ')';
    };
    [price, down, rate, term].forEach(function (el) {
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    });
    update();
  }
})();
