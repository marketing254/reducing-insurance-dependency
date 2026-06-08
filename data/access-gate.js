// ─────────────────────────────────────────────────────────────────
//  RID Academy — Reusable lead-capture (block-form) gate
//  Loaded site-wide via data/site-chrome.js.
//
//  Usage from any page:
//    window.ridaAccessGate({
//      title:    'Listen to this episode',
//      subtitle: optional sub line,
//      formType: 'podcast_access' | 'webinar_access' | 'articles_access' | ...
//      ctaLabel: 'Listen →',
//      onUnlock: function() { /* reveal content */ }
//    });
//
//  Auto-listeners (no per-page wiring needed):
//    - Clicks on .ep-listen (podcast "Listen Now" links)  → podcast_access
//    - First <audio> play on /podcast or /podcast-episode/ → podcast_access
//
//  Returning visitors who already submitted are bypassed for 30 days
//  (per formType, stored in localStorage), so the form isn't repeated.
// ─────────────────────────────────────────────────────────────────
(function () {
  if (window.ridaAccessGate) return;

  var MEM_PREFIX = 'rida_unlocked:';
  var MEM_TTL_MS = 30 * 24 * 60 * 60 * 1000;  // 30 days

  function hasMemory(formType) {
    try {
      var v = localStorage.getItem(MEM_PREFIX + formType);
      return v && (Date.now() - parseInt(v, 10)) < MEM_TTL_MS;
    } catch (e) { return false; }
  }
  function setMemory(formType) {
    try { localStorage.setItem(MEM_PREFIX + formType, String(Date.now())); } catch (e) {}
  }

  function ensureStyles() {
    if (document.getElementById('rida-gate-styles')) return;
    var s = document.createElement('style');
    s.id = 'rida-gate-styles';
    s.textContent = [
      ".rida-gate{display:none;position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:9500;align-items:center;justify-content:center;padding:20px;font-family:'Inter',system-ui,sans-serif}",
      ".rida-gate.open{display:flex}",
      ".rida-gate-card{background:#161616;border:1px solid rgba(255,255,255,.12);border-radius:14px;max-width:440px;width:100%;padding:32px 28px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.6)}",
      ".rida-gate-close{position:absolute;top:10px;right:14px;background:none;border:none;color:rgba(255,255,255,.5);font-size:24px;cursor:pointer;line-height:1;padding:4px 8px}",
      ".rida-gate-close:hover{color:#fff}",
      ".rida-gate h3{font-family:'Lora',Georgia,serif;font-size:1.2rem;color:#f5f5f5;margin:0 0 6px;font-weight:600}",
      ".rida-gate .sub{font-size:.82rem;color:rgba(255,255,255,.55);margin-bottom:18px;line-height:1.55}",
      ".rida-gate .fld{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}",
      ".rida-gate label{font-size:.72rem;font-weight:600;color:rgba(255,255,255,.72);letter-spacing:.02em}",
      ".rida-gate input{padding:10px 13px;background:#0a0a0a;border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f5f5;font-size:.88rem;font-family:inherit}",
      ".rida-gate input:focus{border-color:#E2D603;outline:none}",
      ".rida-gate-btn{width:100%;background:#E2D603;color:#000;padding:11px;border-radius:8px;font-weight:700;font-size:.9rem;border:none;cursor:pointer;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:6px;transition:background .2s;font-family:inherit}",
      ".rida-gate-btn:hover:not(:disabled){background:#F0E440}",
      ".rida-gate-btn:disabled{opacity:.6;cursor:wait}",
      ".rida-gate-note{font-size:.7rem;color:rgba(255,255,255,.35);text-align:center;margin-top:10px}",
      ".rida-gate-success{text-align:center;padding:14px 0}",
      ".rida-gate-success .ok{font-size:38px;color:#4ade80;margin-bottom:8px;line-height:1}",
      ".rida-gate-success h4{font-family:'Lora',Georgia,serif;font-size:1.1rem;color:#f5f5f5;margin:0 0 6px;font-weight:600}",
      ".rida-gate-success p{font-size:.82rem;color:rgba(255,255,255,.55);margin:0}"
    ].join('');
    document.head.appendChild(s);
  }

  function ensureNode() {
    var existing = document.getElementById('rida-gate');
    if (existing) return existing;
    var div = document.createElement('div');
    div.id = 'rida-gate';
    div.className = 'rida-gate';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-modal', 'true');
    div.innerHTML = '<div class="rida-gate-card">'
      + '<button type="button" class="rida-gate-close" aria-label="Close">&times;</button>'
      + '<div data-view="form">'
      +   '<h3 data-rida-gate-title>Get instant access</h3>'
      +   '<p class="sub" data-rida-gate-sub>Enter your details to unlock. No spam — unsubscribe anytime.</p>'
      +   '<form data-rida-gate-form novalidate>'
      +     '<div class="fld"><label>Full Name</label><input type="text" name="name" required autocomplete="name"></div>'
      +     '<div class="fld"><label>Email Address</label><input type="email" name="email" required autocomplete="email"></div>'
      +     '<button type="submit" class="rida-gate-btn" data-rida-gate-submit>Unlock &rarr;</button>'
      +     '<p class="rida-gate-note">We\'ll also email you a copy of the link.</p>'
      +   '</form>'
      + '</div>'
      + '<div data-view="success" style="display:none;">'
      +   '<div class="rida-gate-success">'
      +     '<div class="ok">&#10003;</div>'
      +     '<h4>You\'re in!</h4>'
      +     '<p>Enjoy — we\'ve also emailed you a copy.</p>'
      +   '</div>'
      + '</div>'
      + '</div>';
    document.body.appendChild(div);
    return div;
  }

  window.ridaAccessGate = function (opts) {
    opts = opts || {};
    var formType = opts.formType || 'general_access';

    // Returning visitor — skip the form
    if (hasMemory(formType)) {
      if (typeof opts.onUnlock === 'function') {
        try { opts.onUnlock({ cached: true }); } catch (e) {}
      }
      return;
    }

    ensureStyles();
    var node = ensureNode();
    var titleEl  = node.querySelector('[data-rida-gate-title]');
    var subEl    = node.querySelector('[data-rida-gate-sub]');
    var form     = node.querySelector('[data-rida-gate-form]');
    var btn      = node.querySelector('[data-rida-gate-submit]');
    var formView = node.querySelector('[data-view="form"]');
    var okView   = node.querySelector('[data-view="success"]');
    var closeBtn = node.querySelector('.rida-gate-close');

    titleEl.textContent = opts.title || 'Get instant access';
    if (opts.subtitle) subEl.textContent = opts.subtitle;
    btn.innerHTML = (opts.ctaLabel || 'Unlock') + ' &rarr;';
    formView.style.display = 'block';
    okView.style.display = 'none';
    form.reset();

    function close() { node.classList.remove('open'); }
    closeBtn.onclick = close;
    node.onclick = function (e) { if (e.target === node) close(); };

    form.onsubmit = function (e) {
      e.preventDefault();
      var data = {
        name:     form.name.value.trim(),
        email:    form.email.value.trim(),
        resource: opts.title || ''
      };
      if (opts.extra) Object.keys(opts.extra).forEach(function (k) { data[k] = opts.extra[k]; });
      btn.disabled = true;
      btn.textContent = 'Submitting…';

      var send = (typeof window.ridaSubmitForm === 'function')
        ? window.ridaSubmitForm(data, formType)
        : Promise.resolve();

      Promise.resolve(send).then(function () {
        setMemory(formType);
        if (typeof window.gtag === 'function') {
          try { window.gtag('event', 'access_gate_unlock', { form_type: formType, resource: opts.title || '' }); } catch (e) {}
        }
        formView.style.display = 'none';
        okView.style.display = 'block';
        if (typeof opts.onUnlock === 'function') {
          setTimeout(function () { try { opts.onUnlock(data); } catch (e) {} }, 500);
        }
        setTimeout(close, 1500);
      }).catch(function () {
        btn.disabled = false;
        btn.innerHTML = (opts.ctaLabel || 'Unlock') + ' &rarr;';
        alert('Something went wrong. Please try again or email team@rid.academy.');
      });
    };

    node.classList.add('open');
    setTimeout(function () { try { form.name.focus(); } catch (e) {} }, 100);
  };

  // ── Auto-listeners ──────────────────────────────────────────────
  // Any anchor linking to a podcast-episode page gets gated.
  document.addEventListener('click', function (e) {
    var anchor = e.target && e.target.closest && e.target.closest('a[href]');
    if (!anchor) return;
    var href = anchor.getAttribute('href');
    if (!href) return;
    if (!/podcast-episode/i.test(href)) return;          // only podcast-episode links
    if (anchor.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;  // let "open in new tab" pass
    e.preventDefault();
    var card = anchor.closest('.ep-card, .episode-card, .ep-row, .home-podcast-card, .pod-latest');
    var titleEl = card && (card.querySelector('h3') || card.querySelector('.ep-title') || card.querySelector('.episode-title'));
    var epTitle = (titleEl && titleEl.textContent.trim()) || anchor.textContent.trim() || 'Podcast Episode';
    window.ridaAccessGate({
      title: 'Listen to this episode',
      subtitle: epTitle,
      formType: 'podcast_access',
      ctaLabel: 'Listen',
      extra: { episode: epTitle },
      onUnlock: function () { window.location.href = href; }
    });
  }, true);

  document.addEventListener('play', function (e) {
    var el = e.target;
    if (!el || el.tagName !== 'AUDIO') return;
    if (el.dataset.ridaUnlocked === '1') return;
    if (hasMemory('podcast_access')) {
      el.dataset.ridaUnlocked = '1';
      return;
    }
    e.preventDefault();
    try { el.pause(); el.currentTime = 0; } catch (err) {}
    window.ridaAccessGate({
      title: 'Listen to the podcast',
      subtitle: 'Enter your details to start the episode.',
      formType: 'podcast_access',
      ctaLabel: 'Play episode',
      onUnlock: function () {
        el.dataset.ridaUnlocked = '1';
        try { el.play(); } catch (err) {}
      }
    });
  }, true);
})();
