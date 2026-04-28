// ─────────────────────────────────────────────────────────────────
//  RID Academy — Cookie Consent Banner
//  Injected automatically via data/site-chrome.js on every page.
//  Stores preference in localStorage under 'rida_cookie_consent'
//  Values: 'accepted' | 'declined'
// ─────────────────────────────────────────────────────────────────
(function () {
  var STORAGE_KEY = 'rida_cookie_consent';
  if (localStorage.getItem(STORAGE_KEY)) return;

  var style = document.createElement('style');
  style.textContent = `
    #rida-cookie-banner {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 9000;
      background: #111;
      border-top: 1px solid rgba(226,214,3,.18);
      padding: 18px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: .82rem;
      color: rgba(255,255,255,.65);
      box-shadow: 0 -6px 40px rgba(0,0,0,.5);
      transform: translateY(100%);
      transition: transform .4s cubic-bezier(.4,0,.2,1);
    }
    #rida-cookie-banner.rida-cb-visible { transform: translateY(0); }
    #rida-cookie-banner p { margin: 0; flex: 1; min-width: 220px; line-height: 1.65; }
    #rida-cookie-banner a { color: #E2D603; text-decoration: underline; text-decoration-color: rgba(226,214,3,.35); }
    #rida-cookie-banner a:hover { color: #fff; }
    .rida-cb-actions { display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap; }
    .rida-cb-btn {
      padding: 9px 22px; border-radius: 6px; font-size: .8rem; font-weight: 700;
      cursor: pointer; border: none; font-family: inherit; transition: all .2s; white-space: nowrap;
    }
    .rida-cb-accept { background: #E2D603; color: #000; }
    .rida-cb-accept:hover { background: #f0e440; }
    .rida-cb-decline {
      background: transparent; color: rgba(255,255,255,.4);
      border: 1px solid rgba(255,255,255,.15);
    }
    .rida-cb-decline:hover { color: rgba(255,255,255,.7); border-color: rgba(255,255,255,.35); }
    @media(max-width:600px){
      #rida-cookie-banner { padding: 16px 20px; flex-direction: column; }
      .rida-cb-actions { width: 100%; }
      .rida-cb-btn { flex: 1; text-align: center; }
    }
  `;
  document.head.appendChild(style);

  var banner = document.createElement('div');
  banner.id = 'rida-cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <p>
      We use cookies to analyse site traffic and improve your experience.
      By clicking <strong>Accept</strong> you consent to our use of cookies.
      Read our <a href="/privacy-policy">Privacy Policy</a> for details.
    </p>
    <div class="rida-cb-actions">
      <button class="rida-cb-btn rida-cb-decline" id="rida-cb-decline">Decline</button>
      <button class="rida-cb-btn rida-cb-accept" id="rida-cb-accept">Accept Cookies</button>
    </div>
  `;
  document.body.appendChild(banner);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () { banner.classList.add('rida-cb-visible'); });
  });

  function dismiss(choice) {
    try { localStorage.setItem(STORAGE_KEY, choice); } catch (e) {}
    banner.classList.remove('rida-cb-visible');
    setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 450);
  }

  document.getElementById('rida-cb-accept').addEventListener('click', function () { dismiss('accepted'); });
  document.getElementById('rida-cb-decline').addEventListener('click', function () { dismiss('declined'); });
})();
