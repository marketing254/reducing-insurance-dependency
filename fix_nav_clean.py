import os, re

RIDA = 'D:/RIDA'

# ── Nuke every previous dropdown CSS attempt ──────────────────────────────────
DD_CSS_PATTERN = re.compile(
    r'/\* (?:Dropdown nav|── Resources dropdown ──) \*/.*?'
    r'(?=(?:/\*|\s*\.[a-z]|\s*@media\s+\(max-width:\s*[89]\d\dpx\)\s*\{[^}]*\}\s*$))',
    re.DOTALL
)

# Strip ALL known dropdown CSS blocks (any comment sentinel we've used)
STRIP_CSS = re.compile(
    r'\n?\s*/\* (?:Dropdown nav|── Resources dropdown ──) \*/[\s\S]*?'
    r'@media \(max-width: 900px\) \{[^\}]*\.(?:dropdown-menu|nav-drop)[^\}]*\}\s*\}',
    re.DOTALL
)

# ── Minimal, guaranteed-working dropdown CSS ──────────────────────────────────
NEW_CSS = """
    /* Resources dropdown */
    .res-dd { position: relative; }
    .res-dd-menu {
      display: none;
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: #111111;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 6px;
      min-width: 160px;
      z-index: 9999;
      box-shadow: 0 12px 36px rgba(0,0,0,0.6);
      list-style: none;
    }
    .res-dd:hover .res-dd-menu { display: block; }
    .res-dd-menu li a {
      display: block;
      padding: 9px 16px;
      font-size: 0.82rem;
      font-weight: 500;
      color: rgba(255,255,255,0.70) !important;
      text-decoration: none;
      border-radius: 6px;
      white-space: nowrap;
      transition: color 0.15s, background 0.15s;
    }
    .res-dd-menu li a:hover { color: #E2D603 !important; background: rgba(255,255,255,0.04); }
    @media (max-width: 900px) { .res-dd-menu { display: none !important; } }"""

FILES_ACTIVE = {
    'rid-academy-dark.html': False,
    'about.html': False,
    'podcast.html': False,
    'resources.html': True,
    'webinar-archive.html': False,
    'marketing-consultation.html': False,
    'partner.html': False,
    'tools.html': True,
    'events.html': False,
    'learn.html': True,
    'summit.html': False,
    'ppo-calculator.html': True,
    'readiness-scorecard.html': True,
    'revenue-simulator.html': True,
    'membership-calculator.html': True,
}

def build_dd_li(is_active):
    color = ' style="color:var(--accent,#E2D603)"' if is_active else ''
    return (
        f'<li class="res-dd">'
        f'<a href="resources.html"{color}>Resources &#9662;</a>'
        f'<ul class="res-dd-menu">'
        f'<li><a href="resources.html">Articles</a></li>'
        f'<li><a href="tools.html">Tools</a></li>'
        f'</ul>'
        f'</li>'
    )

count = 0
for fname, is_active in FILES_ACTIVE.items():
    fpath = os.path.join(RIDA, fname)
    if not os.path.exists(fpath):
        print(f'SKIP: {fname}'); continue

    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()
    original = html

    # 1. Remove ALL previous dropdown CSS blocks by stripping between sentinels
    html = STRIP_CSS.sub('', html)

    # Also catch leftover residue from button-based approach
    html = re.sub(
        r'\n?\s*/\* ── Resources dropdown ── \*/[\s\S]*?(?=\n\s*(?:/\*|\.[a-zA-Z]|@))',
        '',
        html
    )

    # 2. Insert NEW CSS before the FIRST </style>
    if '/* Resources dropdown */' not in html:
        html = html.replace('</style>', NEW_CSS + '\n    </style>', 1)

    # 3. Replace any existing dropdown li (all variants)
    html = re.sub(
        r'<li[^>]*(?:has-dropdown|res-dd)[^>]*>[\s\S]*?</li>',
        build_dd_li(is_active),
        html
    )

    if html != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(html)
        count += 1
        print(f'OK: {fname}')
    else:
        print(f'UNCHANGED: {fname}')

print(f'\nDone. {count}/{len(FILES_ACTIVE)} files updated.')
