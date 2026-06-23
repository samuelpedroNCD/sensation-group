(function () {
  var STORAGE_KEY = 'sg_cookie_consent';

  if (localStorage.getItem(STORAGE_KEY)) return;

  var LANG_KEY = 'sg-lang';
  var lang = localStorage.getItem(LANG_KEY) || (navigator.language || '').slice(0, 2).toLowerCase();

  var copy = {
    pt: {
      text: 'Utilizamos cookies para melhorar a sua experiência. Pode aceitar todos ou apenas os essenciais.',
      more: 'Saber mais',
      accept: 'Aceitar todos',
      reject: 'Só essenciais',
    },
    en: {
      text: 'We use cookies to improve your experience. You can accept all or only essential cookies.',
      more: 'Learn more',
      accept: 'Accept all',
      reject: 'Essential only',
    },
    fr: {
      text: 'Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez tout accepter ou seulement les essentiels.',
      more: 'En savoir plus',
      accept: 'Tout accepter',
      reject: 'Essentiels uniquement',
    },
    es: {
      text: 'Usamos cookies para mejorar su experiencia. Puede aceptar todas o solo las esenciales.',
      more: 'Saber más',
      accept: 'Aceptar todas',
      reject: 'Solo esenciales',
    },
  };

  var t = copy[lang] || copy['pt'];

  /* ── CSS ── */
  var style = document.createElement('style');
  style.textContent = [
    '#sg-cookie-banner{',
      'position:fixed;bottom:0;left:0;right:0;z-index:9999;',
      'background:#0C0B09;border-top:1px solid rgba(255,255,255,0.1);',
      'padding:16px 40px;',
      'display:flex;align-items:center;gap:24px;flex-wrap:wrap;',
      'font-family:"Inter",sans-serif;font-size:13px;font-weight:400;',
      'color:rgba(255,255,255,0.75);',
      'transform:translateY(100%);transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);',
    '}',
    '#sg-cookie-banner.is-visible{transform:translateY(0);}',
    '#sg-cookie-banner p{margin:0;flex:1;min-width:200px;line-height:1.5;}',
    '#sg-cookie-banner a{color:rgba(255,255,255,0.5);text-decoration:underline;white-space:nowrap;}',
    '#sg-cookie-banner a:hover{color:rgba(255,255,255,0.85);}',
    '.sg-cookie-actions{display:flex;gap:10px;flex-shrink:0;}',
    '.sg-cookie-btn{',
      'display:inline-flex;align-items:center;',
      'padding:9px 20px;border-radius:2px;font-size:12px;font-weight:500;',
      'font-family:"Inter",sans-serif;letter-spacing:0.04em;',
      'cursor:pointer;transition:background 0.2s,color 0.2s,border-color 0.2s;',
      'white-space:nowrap;border:1px solid transparent;',
    '}',
    '.sg-cookie-btn--accept{background:#fff;color:#0C0B09;border-color:#fff;}',
    '.sg-cookie-btn--accept:hover{background:#F5F2EC;border-color:#F5F2EC;}',
    '.sg-cookie-btn--reject{background:transparent;color:rgba(255,255,255,0.6);border-color:rgba(255,255,255,0.2);}',
    '.sg-cookie-btn--reject:hover{color:#fff;border-color:rgba(255,255,255,0.55);}',
    '@media(max-width:600px){',
      '#sg-cookie-banner{padding:16px 20px;}',
      '.sg-cookie-actions{width:100%;}',
      '.sg-cookie-btn{flex:1;justify-content:center;}',
    '}',
  ].join('');
  document.head.appendChild(style);

  /* ── HTML ── */
  var banner = document.createElement('div');
  banner.id = 'sg-cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML =
    '<p>' + t.text + ' <a href="' + _cookiesUrl() + '">' + t.more + '</a></p>' +
    '<div class="sg-cookie-actions">' +
      '<button class="sg-cookie-btn sg-cookie-btn--reject" id="sg-cookie-reject">' + t.reject + '</button>' +
      '<button class="sg-cookie-btn sg-cookie-btn--accept" id="sg-cookie-accept">' + t.accept + '</button>' +
    '</div>';
  document.body.appendChild(banner);

  /* slide in after paint */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });
  });

  function dismiss(value) {
    localStorage.setItem(STORAGE_KEY, value);
    banner.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
    banner.classList.remove('is-visible');
    banner.addEventListener('transitionend', function () { banner.remove(); }, { once: true });
  }

  document.getElementById('sg-cookie-accept').addEventListener('click', function () { dismiss('all'); });
  document.getElementById('sg-cookie-reject').addEventListener('click', function () { dismiss('essential'); });

  function _cookiesUrl() {
    var path = window.location.pathname;
    if (path === '/' || path.endsWith('index.html')) return 'cookies.html';
    var depth = (path.match(/\//g) || []).length;
    return depth > 1 ? '../cookies.html' : 'cookies.html';
  }
})();
