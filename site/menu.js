// Mobile menu toggle, shared by the landing and the gallery. Labels come from data attributes.
(function () {
  var btn = document.getElementById('menubtn'), nav = document.getElementById('mobnav');
  if (!btn || !nav) return;
  function setMenu(open) {
    nav.hidden = !open;
    document.getElementById('ico-close').hidden = !open;
    document.getElementById('ico-open').hidden = open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? btn.dataset.close : btn.dataset.open);
  }
  btn.addEventListener('click', function () { setMenu(nav.hidden); });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
})();
