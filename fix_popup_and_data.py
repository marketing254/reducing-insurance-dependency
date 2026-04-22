import os, re

RIDA = 'D:/RIDA'

# ── Popup fix: hardcode event data inline so popup never depends on external JS ──
# Event: May 27, 2026
POPUP_EVENT = {
    'title': 'The Modern Dental Practice: Clinical Excellence Meets Scalable Growth',
    'date_label': '27 May 2026 &bull; 7:00 PM &ndash; 9:00 PM EST',
    'register_url': 'https://us02web.zoom.us/webinar/register/WN_cJHLbt1yQ7Gdq7b98nxNsA'
}

# New popup HTML with hardcoded data + inline script (no external dependency)
NEW_POPUP = '''<!-- ============================================================
     LATEST EVENT POPUP BANNER
     To update: change title/date/url in the three data-* attributes below
     ============================================================ -->
<div id="ridaEventPopup" style="display:none;position:fixed;bottom:24px;right:24px;z-index:9999;max-width:360px;width:calc(100% - 48px);">
  <div style="background:#161616;border:1px solid rgba(226,214,3,0.35);border-radius:14px;padding:24px;box-shadow:0 12px 48px rgba(0,0,0,0.6);position:relative;">
    <button onclick="ridaClosePopup()" style="position:absolute;top:12px;right:14px;background:none;border:none;color:rgba(255,255,255,0.45);font-size:20px;cursor:pointer;line-height:1;" title="Close">&#x2715;</button>
    <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#E2D603;margin-bottom:10px;">&#x1F4E3;&nbsp; Upcoming Event</div>
    <h4 id="popupEventTitle" style="font-family:'Lora',Georgia,serif;font-size:16px;font-weight:600;line-height:1.35;margin-bottom:8px;color:#f5f5f5;">''' + POPUP_EVENT['title'] + '''</h4>
    <div id="popupEventDate" style="font-size:13px;color:rgba(255,255,255,0.55);margin-bottom:16px;">''' + POPUP_EVENT['date_label'] + '''</div>
    <a id="popupRegisterBtn" href="''' + POPUP_EVENT['register_url'] + '''" target="_blank" rel="noopener" style="display:block;background:#E2D603;color:#000;text-align:center;padding:10px 20px;border-radius:7px;font-size:13px;font-weight:700;text-decoration:none;transition:background 0.2s;" onmouseover="this.style.background='#F0E440'" onmouseout="this.style.background='#E2D603'">Register Now &rarr;</a>
  </div>
</div>
<script>
(function(){
  if (sessionStorage.getItem('rida_popup_dismissed')) return;
  setTimeout(function(){
    var popup = document.getElementById('ridaEventPopup');
    if (popup) { popup.style.display = 'block'; popup.style.animation = 'ridaPopupIn 0.4s ease'; }
  }, 2500);
})();
function ridaClosePopup(){
  var popup = document.getElementById('ridaEventPopup');
  if (popup) popup.style.display = 'none';
  sessionStorage.setItem('rida_popup_dismissed','1');
}
</script>
<style>
@keyframes ridaPopupIn {
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0); }
}
</style>'''

# Pattern to match entire old popup block (from comment through closing </style>)
OLD_POPUP_PATTERN = re.compile(
    r'<!-- ={5,}\s*\n\s*LATEST EVENT POPUP BANNER.*?</style>',
    re.DOTALL
)

POPUP_FILES = ['index.html', 'rid-academy-dark.html', 'resources.html', 'webinar-archive.html']

for fname in POPUP_FILES:
    fpath = os.path.join(RIDA, fname)
    if not os.path.exists(fpath):
        print(f'SKIP (missing): {fname}'); continue
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()
    original = html

    # Remove duplicate <script src="data/rida-data.js"> for popup (keep first only)
    # webinar-archive has it twice
    if html.count('<script src="data/rida-data.js">') > 1:
        # Remove the second occurrence
        first = html.index('<script src="data/rida-data.js">')
        second = html.index('<script src="data/rida-data.js">', first + 1)
        html = html[:second] + html[second:].replace('<script src="data/rida-data.js"></script>', '', 1)
        print(f'  Removed duplicate rida-data.js load in {fname}')

    # Replace popup block
    if OLD_POPUP_PATTERN.search(html):
        html = OLD_POPUP_PATTERN.sub(NEW_POPUP, html)
        print(f'OK: {fname} popup replaced')
    elif 'ridaEventPopup' not in html:
        # No popup at all — inject before </body>
        html = html.replace('</body>', NEW_POPUP + '\n</body>', 1)
        print(f'OK: {fname} popup injected')
    else:
        print(f'WARN: {fname} has popup but pattern did not match — manual check needed')

    if html != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(html)

print('\nPopup fix done.')
