(() => {
  const footerHtml = `
<footer style="background:#0d0d0d;border-top:0.5px solid rgba(255,255,255,0.07);">
  <div style="max-width:960px;margin:0 auto;padding:44px 32px 0;">
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:36px;padding-bottom:36px;border-bottom:0.5px solid rgba(255,255,255,0.06);">
      <div>
        <img src="/images/RIDA%20Logo%202.svg" alt="RID Academy" style="height:24px;width:auto;filter:brightness(1.1);display:block;margin-bottom:14px;">
        <p style="font-size:12.5px;color:rgba(255,255,255,0.4);line-height:1.7;max-width:280px;margin-bottom:18px;">Practical guidance for dentists building independent, profitable practices free from PPO dependence.</p>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:18px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(226,214,3,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <a href="mailto:team@rid.academy" style="font-size:12.5px;color:rgba(255,255,255,0.45);text-decoration:none;" onmouseover="this.style.color='#E2D603'" onmouseout="this.style.color='rgba(255,255,255,0.45)'">team@rid.academy</a>
        </div>
        <div style="display:flex;gap:8px;">
          <a href="https://www.instagram.com/ridacademy/" target="_blank" rel="noopener" title="Instagram" style="display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center;border:0.5px solid rgba(255,255,255,0.12);border-radius:50%;color:rgba(255,255,255,0.5);text-decoration:none;transition:all 0.2s;" onmouseover="this.style.background='#E2D603';this.style.borderColor='#E2D603';this.style.color='#111'" onmouseout="this.style.background='transparent';this.style.borderColor='rgba(255,255,255,0.12)';this.style.color='rgba(255,255,255,0.5)'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg></a>
          <a href="https://www.facebook.com/profile.php?id=100064228176993" target="_blank" rel="noopener" title="Facebook" style="display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center;border:0.5px solid rgba(255,255,255,0.12);border-radius:50%;color:rgba(255,255,255,0.5);text-decoration:none;transition:all 0.2s;" onmouseover="this.style.background='#E2D603';this.style.borderColor='#E2D603';this.style.color='#111'" onmouseout="this.style.background='transparent';this.style.borderColor='rgba(255,255,255,0.12)';this.style.color='rgba(255,255,255,0.5)'"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.7.3-1 1-1z"/></svg></a>
          <a href="https://www.linkedin.com/company/reducing-insurance-dependence-academy/" target="_blank" rel="noopener" title="LinkedIn" style="display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center;border:0.5px solid rgba(255,255,255,0.12);border-radius:50%;color:rgba(255,255,255,0.5);text-decoration:none;transition:all 0.2s;" onmouseover="this.style.background='#E2D603';this.style.borderColor='#E2D603';this.style.color='#111'" onmouseout="this.style.background='transparent';this.style.borderColor='rgba(255,255,255,0.12)';this.style.color='rgba(255,255,255,0.5)'"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 8.5H3.56V20h3.38V8.5Zm-1.69-1.56a1.97 1.97 0 1 0 0-3.94 1.97 1.97 0 0 0 0 3.94ZM20 20v-6.2c0-3.32-1.77-4.86-4.13-4.86-1.9 0-2.75 1.05-3.23 1.79V8.5H9.25c.04 1.47 0 11.5 0 11.5h3.39v-6.42c0-.34.02-.68.13-.92.27-.68.88-1.39 1.91-1.39 1.35 0 1.89 1.03 1.89 2.54V20H20Z"/></svg></a>
        </div>
      </div>
      <div>
        <h3 style="font-size:10px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:rgba(255,255,255,0.8);margin-bottom:16px;">Navigation</h3>
        <a href="/" style="display:block;font-size:13px;color:rgba(255,255,255,0.45);text-decoration:none;margin-bottom:10px;transition:color 0.15s;" onmouseover="this.style.color='#E2D603'" onmouseout="this.style.color='rgba(255,255,255,0.45)'">Home</a>
        <a href="/tools" style="display:block;font-size:13px;color:rgba(255,255,255,0.45);text-decoration:none;margin-bottom:10px;transition:color 0.15s;" onmouseover="this.style.color='#E2D603'" onmouseout="this.style.color='rgba(255,255,255,0.45)'">Tools</a>
        <a href="/podcast" style="display:block;font-size:13px;color:rgba(255,255,255,0.45);text-decoration:none;margin-bottom:10px;transition:color 0.15s;" onmouseover="this.style.color='#E2D603'" onmouseout="this.style.color='rgba(255,255,255,0.45)'">Podcast</a>
        <a href="/resources" style="display:block;font-size:13px;color:rgba(255,255,255,0.45);text-decoration:none;transition:color 0.15s;" onmouseover="this.style.color='#E2D603'" onmouseout="this.style.color='rgba(255,255,255,0.45)'">Resources</a>
      </div>
      <div>
        <h3 style="font-size:10px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:rgba(255,255,255,0.8);margin-bottom:16px;">More</h3>
        <a href="/webinars" style="display:block;font-size:13px;color:rgba(255,255,255,0.45);text-decoration:none;margin-bottom:10px;transition:color 0.15s;" onmouseover="this.style.color='#E2D603'" onmouseout="this.style.color='rgba(255,255,255,0.45)'">Webinar Archive</a>
        <a href="/about" style="display:block;font-size:13px;color:rgba(255,255,255,0.45);text-decoration:none;margin-bottom:10px;transition:color 0.15s;" onmouseover="this.style.color='#E2D603'" onmouseout="this.style.color='rgba(255,255,255,0.45)'">About</a>
        <a href="/marketing-consultation" style="display:block;font-size:13px;color:rgba(255,255,255,0.45);text-decoration:none;margin-bottom:10px;transition:color 0.15s;" onmouseover="this.style.color='#E2D603'" onmouseout="this.style.color='rgba(255,255,255,0.45)'">Marketing Consultation</a>
        <a href="/events" style="display:block;font-size:13px;color:rgba(255,255,255,0.45);text-decoration:none;margin-bottom:10px;transition:color 0.15s;" onmouseover="this.style.color='#E2D603'" onmouseout="this.style.color='rgba(255,255,255,0.45)'">Events</a>
        <a href="/contact" style="display:block;font-size:13px;color:rgba(255,255,255,0.45);text-decoration:none;transition:color 0.15s;" onmouseover="this.style.color='#E2D603'" onmouseout="this.style.color='rgba(255,255,255,0.45)'">Contact Us</a>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:16px 0;">
      <span style="font-size:11px;color:rgba(255,255,255,0.25);">© 2026 RID Academy by Ekwa Marketing. All rights reserved.</span>
      <div style="display:flex;gap:18px;">
        <a href="/privacy-policy" style="font-size:11px;color:rgba(255,255,255,0.25);text-decoration:none;" onmouseover="this.style.color='rgba(255,255,255,0.5)'" onmouseout="this.style.color='rgba(255,255,255,0.25)'">Privacy Policy</a>
        <a href="/contact" style="font-size:11px;color:rgba(255,255,255,0.25);text-decoration:none;" onmouseover="this.style.color='rgba(255,255,255,0.5)'" onmouseout="this.style.color='rgba(255,255,255,0.25)'">Contact Us</a>
      </div>
    </div>
  </div>
</footer>`;

  const style = document.createElement('style');
  style.textContent = `
    a.nav-cta, button.nav-cta { color: #000 !important; }
    a.nav-cta:hover, button.nav-cta:hover { color: #000 !important; }
  `;
  document.head.appendChild(style);

  const footer = document.querySelector('footer');
  if (footer) footer.outerHTML = footerHtml;

  // ── Cookie consent banner (auto-injected on every page) ──────────────────
  (function () {
    var STORAGE_KEY = 'rida_cookie_consent';
    if (localStorage.getItem(STORAGE_KEY)) return;

    var bannerStyle = document.createElement('style');
    bannerStyle.textContent = `
      #rida-cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:9000;background:#111;border-top:1px solid rgba(226,214,3,.18);padding:18px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;font-family:'Inter',system-ui,sans-serif;font-size:.82rem;color:rgba(255,255,255,.65);box-shadow:0 -6px 40px rgba(0,0,0,.5);transform:translateY(100%);transition:transform .4s cubic-bezier(.4,0,.2,1)}
      #rida-cookie-banner.rida-cb-visible{transform:translateY(0)}
      #rida-cookie-banner p{margin:0;flex:1;min-width:220px;line-height:1.65}
      #rida-cookie-banner a{color:#E2D603;text-decoration:underline;text-decoration-color:rgba(226,214,3,.35)}
      #rida-cookie-banner a:hover{color:#fff}
      .rida-cb-actions{display:flex;gap:10px;flex-shrink:0;flex-wrap:wrap}
      .rida-cb-btn{padding:9px 22px;border-radius:6px;font-size:.8rem;font-weight:700;cursor:pointer;border:none;font-family:inherit;transition:all .2s;white-space:nowrap}
      .rida-cb-accept{background:#E2D603;color:#000}.rida-cb-accept:hover{background:#f0e440}
      .rida-cb-decline{background:transparent;color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.15)}.rida-cb-decline:hover{color:rgba(255,255,255,.7);border-color:rgba(255,255,255,.35)}
      @media(max-width:600px){#rida-cookie-banner{padding:16px 20px;flex-direction:column}.rida-cb-actions{width:100%}.rida-cb-btn{flex:1;text-align:center}}
    `;
    document.head.appendChild(bannerStyle);

    var banner = document.createElement('div');
    banner.id = 'rida-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = '<p>We use cookies to analyse site traffic and improve your experience. By clicking <strong>Accept</strong> you consent to our use of cookies. Read our <a href="/privacy-policy">Privacy Policy</a> for details.</p>'
      + '<div class="rida-cb-actions"><button class="rida-cb-btn rida-cb-decline" id="rida-cb-decline">Decline</button><button class="rida-cb-btn rida-cb-accept" id="rida-cb-accept">Accept Cookies</button></div>';
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
})();
