// ─────────────────────────────────────────────────────────────────
//  RID Academy — GA4 custom event tracking
//  Loaded on every page via data/site-chrome.js.
//  Requires gtag() (GA4 snippet in <head>). Uses event delegation so
//  it works regardless of per-page markup. Fires:
//    cta_click                 — clicks on primary CTA buttons/links
//    marketing_consultation_book — clicks on booking links / "book" CTAs
//    calculator_engaged        — first meaningful input on a calculator page (once/page)
//    podcast_play              — first play of any <audio> element
//    resource_download         — clicks on downloadable files (pdf/doc/xls/zip)
//    outbound_click is handled automatically by GA4 Enhanced Measurement.
// ─────────────────────────────────────────────────────────────────
(function () {
  if (typeof window.gtag !== 'function') return;
  var path = location.pathname;

  function send(name, params) {
    try { window.gtag('event', name, params || {}); } catch (e) {}
  }

  // ── 1. Delegated click tracking ──────────────────────────────────
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a, button');
    if (!el) return;
    var label = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    var href = el.getAttribute('href') || '';

    // Booking — youcanbook.me link OR any CTA whose text mentions booking a session
    if (href.indexOf('youcanbook.me') > -1 ||
        /book .*(session|consultation|meeting)|free strategy session/i.test(label)) {
      send('marketing_consultation_book', { cta_label: label, page_path: path });
    }

    // Resource downloads
    if (/\.(pdf|docx?|xlsx?|zip|pptx?)(\?|$)/i.test(href)) {
      send('resource_download', { file: href.split('/').pop(), page_path: path });
    }

    // Primary CTAs (covers nav, hero, and section buttons across page styles)
    if (el.classList.contains('nav-cta') || el.classList.contains('btn-fill') ||
        el.classList.contains('btn-primary') || el.classList.contains('cta-btn') ||
        el.classList.contains('ev-btn') || el.classList.contains('cf-submit') ||
        el.classList.contains('hero-cta')) {
      send('cta_click', { cta_label: label, page_path: path });
    }
  }, true);

  // ── 2. Podcast / audio play (first play per page) ────────────────
  var audioPlayed = false;
  document.addEventListener('play', function (e) {
    if (e.target && e.target.tagName === 'AUDIO' && !audioPlayed) {
      audioPlayed = true;
      send('podcast_play', { page_path: path });
    }
  }, true);

  // ── 3. Calculator engagement (first meaningful input, once/page) ─
  var CALC_PAGES = ['/ppo-calculator', '/readiness-scorecard', '/revenue-simulator', '/membership-calculator'];
  if (CALC_PAGES.indexOf(path.replace(/\/$/, '')) > -1) {
    var calcFired = false;
    var calcName = path.replace(/\//g, '') || 'calculator';
    document.addEventListener('input', function (e) {
      if (calcFired) return;
      var tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') {
        calcFired = true;
        send('calculator_engaged', { calculator: calcName, page_path: path });
      }
    }, true);
    // Also catch radio/checkbox-driven scorecards via change
    document.addEventListener('change', function (e) {
      if (calcFired) return;
      calcFired = true;
      send('calculator_engaged', { calculator: calcName, page_path: path });
    }, true);
  }
})();
