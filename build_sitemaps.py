"""
build_sitemaps.py — generate SEO-optimized slug URLs for podcast & webinars.

What this does
--------------
GitHub Pages can't rewrite URLs server-side, so the only way to get clean
slug-based URLs (with the title as a keyword in the path) is to pre-render
one static HTML file per episode/replay at build time.

For each row in the podcast / webinars / summits sheet tabs, this script:

1. Computes a slug from the title (matches data/sheets.js → ridaSlugify())
2. Renders a per-row HTML file under:
       /podcast/<episode_number>-<slug>/index.html
       /webinar/<slug>/index.html
   These files share the shell of the existing dynamic templates
   (/podcast-episode/index.html and /webinar/index.html) but with per-row
   <title>, <meta description>, <link canonical>, OG/Twitter, and a
   `window.RIDA_EPISODE_NUMBER` / `window.RIDA_WEBINAR_SLUG` set so
   sheets.js knows which row to render dynamic content from.

3. Writes data/podcast-slugs.js and data/webinar-slugs.js — small maps the
   old query-param shells (/podcast-episode/, /webinar/) read to redirect
   legacy URLs (`?ep=388`, `?title=Foo`) to the new slug URL.

4. Writes sitemap-podcast.xml and sitemap-webinars.xml listing the slug
   URLs only.

5. Writes sitemap.xml as a sitemap-index of three children
   (sitemap-core.xml, sitemap-podcast.xml, sitemap-webinars.xml).

Run this after adding/editing rows in the Google Sheet, then commit and
push the generated files. Run `python indexnow.py` after deploy to ping
Bing/Yandex with the new URLs.

Usage
-----
    python build_sitemaps.py
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import date
from html import escape as html_escape
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

SHEET_ID = "1FOeB6lyOCKzj4u9caLPxModWYrpCILE0h4-7O_0yR4s"
HOST = "https://www.rid.academy"
ROOT = Path(__file__).resolve().parent

PODCAST_TAB = "podcast"
REPLAY_TABS = ["webinars", "summits"]

PODCAST_EP_TEMPLATE = ROOT / "podcast-episode" / "index.html"
WEBINAR_TEMPLATE = ROOT / "webinar" / "index.html"


# ─── slug ─────────────────────────────────────────────────────────────────
def slugify(s):
    """Mirror data/sheets.js → ridaSlugify() so generated URLs match what
    the client-side slug→row lookup expects."""
    s = (s or "").lower().strip().replace("&", " and ")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"^-+|-+$", "", s)
    return s


def to_int_str(v):
    """gviz returns numeric cells as floats. Coerce '388.0' → '388'.
    Non-numeric values pass through unchanged (so a string episode label
    like 'Bonus 5' isn't mangled)."""
    raw = str(v or "").strip()
    if not raw:
        return ""
    try:
        f = float(raw)
        if f.is_integer():
            return str(int(f))
    except (ValueError, TypeError):
        pass
    return raw


# ─── sheet fetch ──────────────────────────────────────────────────────────
def fetch_sheet(tab):
    url = (
        f"https://docs.google.com/spreadsheets/d/{SHEET_ID}"
        f"/gviz/tq?tqx=out:json&headers=1&sheet={urllib.parse.quote(tab)}"
    )
    print(f"  Fetching {tab}…", end=" ", flush=True)
    with urllib.request.urlopen(url, timeout=30) as r:
        text = r.read().decode("utf-8")
    m = re.search(r"google\.visualization\.Query\.setResponse\(([\s\S]*)\)", text)
    if not m:
        print("(no data)")
        return []
    data = json.loads(m.group(1))
    cols = [c.get("label", "").strip() for c in data["table"]["cols"]]
    rows = []
    for row in data["table"]["rows"]:
        cells = row.get("c") or []
        if not any(c and c.get("v") not in (None, "") for c in cells):
            continue
        obj = {}
        for i, cell in enumerate(cells):
            if i >= len(cols):
                break
            v = cell.get("v") if cell else None
            obj[cols[i]] = "" if v is None else str(v).strip()
        rows.append(obj)
    print(f"{len(rows)} rows")
    return rows


def parse_sheet_date(raw):
    if not raw:
        return None
    m = re.match(r"Date\((\d+),(\d+),(\d+)\)", raw)
    if m:
        try:
            return date(int(m.group(1)), int(m.group(2)) + 1, int(m.group(3)))
        except ValueError:
            return None
    try:
        from datetime import datetime
        return datetime.fromisoformat(raw[:10]).date()
    except (ValueError, TypeError):
        return None


# ─── template rendering ───────────────────────────────────────────────────
RE_TITLE = re.compile(r"<title>.*?</title>", re.S)
RE_META_DESC = re.compile(r'<meta name="description" content="[^"]*">')
RE_CANONICAL = re.compile(r'<link rel="canonical" href="[^"]*">')
RE_OG_TITLE = re.compile(r'<meta property="og:title" content="[^"]*">')
RE_OG_DESC = re.compile(r'<meta property="og:description" content="[^"]*">')
RE_TW_TITLE = re.compile(r'<meta name="twitter:title" content="[^"]*">')
RE_TW_DESC = re.compile(r'<meta name="twitter:description" content="[^"]*">')
RE_OG_URL = re.compile(r'<meta property="og:url" content="[^"]*">')


def fix_paths(html):
    """Per-row pages live two levels deep (/podcast/<n>-<slug>/index.html).
    Existing templates use '../images/' and '../data/' which would break
    at that depth. Rewrite to absolute paths so they resolve everywhere."""
    return (
        html.replace('"../images/', '"/images/')
            .replace('"../data/', '"/data/')
    )


def swap_or_inject(html, regex, replacement, after_marker=None):
    """Replace if regex matches; otherwise inject before </head>."""
    new, n = regex.subn(replacement, html, count=1)
    if n:
        return new
    inject = replacement + "\n  "
    return html.replace("</head>", inject + "</head>", 1)


def render_episode_page(template, title, ep_num, slug, description, date_str):
    pretty_title = f"{title} | Less Insurance Dependence Podcast | RID Academy"
    desc_short = re.sub(r"\s+", " ", description or title).strip()[:160]
    if not desc_short:
        desc_short = (
            f"{title} — Less Insurance Dependence Podcast episode "
            f"{ep_num}, from RID Academy."
        )
    pretty_title_esc = html_escape(pretty_title, quote=True)
    desc_esc = html_escape(desc_short, quote=True)
    canonical_url = f"{HOST}/podcast/{ep_num}-{slug}/"
    canonical_esc = html_escape(canonical_url, quote=True)

    html = template
    html = RE_TITLE.sub(f"<title>{html_escape(pretty_title)}</title>", html, count=1)
    html = swap_or_inject(
        html, RE_META_DESC,
        f'<meta name="description" content="{desc_esc}">',
    )
    html = swap_or_inject(
        html, RE_CANONICAL,
        f'<link rel="canonical" href="{canonical_esc}">',
    )
    html = swap_or_inject(
        html, RE_OG_URL,
        f'<meta property="og:url" content="{canonical_esc}">',
    )
    html = swap_or_inject(
        html, RE_OG_TITLE,
        f'<meta property="og:title" content="{pretty_title_esc}">',
    )
    html = swap_or_inject(
        html, RE_OG_DESC,
        f'<meta property="og:description" content="{desc_esc}">',
    )
    html = swap_or_inject(
        html, RE_TW_TITLE,
        f'<meta name="twitter:title" content="{pretty_title_esc}">',
    )
    html = swap_or_inject(
        html, RE_TW_DESC,
        f'<meta name="twitter:description" content="{desc_esc}">',
    )

    # Inject per-episode JSON-LD just before </head>
    schema = {
        "@context": "https://schema.org",
        "@type": "PodcastEpisode",
        "name": title,
        "description": desc_short,
        "url": canonical_url,
        "episodeNumber": ep_num,
        "partOfSeries": {
            "@type": "PodcastSeries",
            "@id": f"{HOST}/podcast#series",
            "name": "Less Insurance Dependence Podcast",
        },
    }
    if date_str:
        schema["datePublished"] = date_str
    schema_tag = (
        '<script type="application/ld+json" data-rida-ep-static>'
        + json.dumps(schema, ensure_ascii=False)
        + "</script>"
    )
    html = html.replace("</head>", "  " + schema_tag + "\n</head>", 1)

    # Tell sheets.js which episode to render. Replace the existing
    # ../data/sheets.js include (which fix_paths will rewrite to absolute)
    # with our pre-script + absolute include in one shot.
    html = html.replace(
        '<script src="../data/sheets.js" defer></script>',
        f'<script>window.RIDA_EPISODE_NUMBER = "{ep_num}";</script>\n'
        f'<script src="/data/sheets.js" defer></script>',
    )

    return fix_paths(html)


def render_webinar_page(template, title, slug, description, date_str, category):
    label = "Summit Replay" if category == "summit" else "Webinar Replay"
    pretty_title = f"{title} | {label} | RID Academy"
    desc_short = re.sub(r"\s+", " ", description or title).strip()[:160]
    if not desc_short:
        desc_short = f"{title} — full {label.lower()} from RID Academy."
    pretty_title_esc = html_escape(pretty_title, quote=True)
    desc_esc = html_escape(desc_short, quote=True)
    canonical_url = f"{HOST}/webinar/{slug}/"
    canonical_esc = html_escape(canonical_url, quote=True)

    html = template
    html = RE_TITLE.sub(f"<title>{html_escape(pretty_title)}</title>", html, count=1)
    html = swap_or_inject(html, RE_META_DESC,
        f'<meta name="description" content="{desc_esc}">')
    html = swap_or_inject(html, RE_CANONICAL,
        f'<link rel="canonical" href="{canonical_esc}">')
    html = swap_or_inject(html, RE_OG_URL,
        f'<meta property="og:url" content="{canonical_esc}">')
    html = swap_or_inject(html, RE_OG_TITLE,
        f'<meta property="og:title" content="{pretty_title_esc}">')
    html = swap_or_inject(html, RE_OG_DESC,
        f'<meta property="og:description" content="{desc_esc}">')
    html = swap_or_inject(html, RE_TW_TITLE,
        f'<meta name="twitter:title" content="{pretty_title_esc}">')
    html = swap_or_inject(html, RE_TW_DESC,
        f'<meta name="twitter:description" content="{desc_esc}">')

    schema = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": title,
        "description": desc_short,
        "url": canonical_url,
        "thumbnailUrl": f"{HOST}/images/og-webinars.jpg",
        "publisher": {
            "@type": "Organization",
            "@id": f"{HOST}/#organization",
            "name": "RID Academy",
        },
    }
    if date_str:
        schema["uploadDate"] = date_str
    schema_tag = (
        '<script type="application/ld+json" data-rida-video-static>'
        + json.dumps(schema, ensure_ascii=False)
        + "</script>"
    )
    html = html.replace("</head>", "  " + schema_tag + "\n</head>", 1)

    html = html.replace(
        '<script src="../data/sheets.js"></script>',
        f'<script>window.RIDA_WEBINAR_SLUG = {json.dumps(slug)};</script>\n'
        f'<script src="/data/sheets.js"></script>',
    )

    return fix_paths(html)


# ─── sitemap writer ───────────────────────────────────────────────────────
def write_sitemap(path, entries):
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for loc, lastmod, changefreq, priority in entries:
        parts.append("  <url>")
        parts.append(f"    <loc>{xml_escape(loc)}</loc>")
        if lastmod:
            parts.append(f"    <lastmod>{lastmod}</lastmod>")
        if changefreq:
            parts.append(f"    <changefreq>{changefreq}</changefreq>")
        if priority:
            parts.append(f"    <priority>{priority}</priority>")
        parts.append("  </url>")
    parts.append("</urlset>")
    path.write_text("\n".join(parts) + "\n", encoding="utf-8")
    print(f"  Wrote {path.name} ({len(entries)} URLs)")


# ─── podcast builder ──────────────────────────────────────────────────────
def build_podcast():
    rows = fetch_sheet(PODCAST_TAB)
    template = PODCAST_EP_TEMPLATE.read_text(encoding="utf-8")
    today = date.today().isoformat()
    sitemap_entries = []
    slug_map = {}   # ep_num → slug   (for legacy URL redirect)

    pod_root = ROOT / "podcast"
    pod_root.mkdir(exist_ok=True)

    for r in rows:
        raw_ep = r.get("episode") or r.get("Episode") or r.get("ep")
        title = r.get("title") or r.get("Title")
        if not raw_ep or not title:
            continue
        ep_num = to_int_str(raw_ep)
        slug = slugify(title)
        if not slug:
            continue

        d = parse_sheet_date(r.get("date") or r.get("Date"))
        lastmod = d.isoformat() if d else today

        out_dir = pod_root / f"{ep_num}-{slug}"
        out_dir.mkdir(exist_ok=True)
        html = render_episode_page(
            template, title, ep_num, slug,
            r.get("description") or r.get("Description") or "",
            lastmod,
        )
        (out_dir / "index.html").write_text(html, encoding="utf-8")

        sitemap_entries.append((
            f"{HOST}/podcast/{ep_num}-{slug}/",
            lastmod, "monthly", "0.7",
        ))
        slug_map[ep_num] = f"{ep_num}-{slug}"

    write_sitemap(ROOT / "sitemap-podcast.xml", sitemap_entries)

    # Slug map for legacy /podcast-episode/?ep=N redirect
    (ROOT / "data" / "podcast-slugs.js").write_text(
        "/* AUTO-GENERATED by build_sitemaps.py — do not edit by hand. */\n"
        "window.RIDA_PODCAST_SLUGS = " + json.dumps(slug_map, indent=2, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"  Wrote data/podcast-slugs.js ({len(slug_map)} entries)")
    return len(sitemap_entries)


# ─── webinar builder ──────────────────────────────────────────────────────
def build_webinars():
    template = WEBINAR_TEMPLATE.read_text(encoding="utf-8")
    today = date.today().isoformat()
    sitemap_entries = []
    slug_map = {}   # ridaSlugify(title) → slug   (for legacy redirect)
    used_slugs = set()

    web_root = ROOT / "webinar"
    web_root.mkdir(exist_ok=True)

    for tab in REPLAY_TABS:
        rows = fetch_sheet(tab)
        category = "summit" if tab == "summits" else "webinar"
        for r in rows:
            title = r.get("title") or r.get("Title")
            if not title:
                continue
            base_slug = slugify(title)
            if not base_slug:
                continue

            # Deduplicate slugs across both tabs
            slug = base_slug
            n = 2
            while slug in used_slugs:
                slug = f"{base_slug}-{n}"
                n += 1
            used_slugs.add(slug)

            d = parse_sheet_date(r.get("date") or r.get("Date"))
            lastmod = d.isoformat() if d else today

            out_dir = web_root / slug
            out_dir.mkdir(exist_ok=True)
            html = render_webinar_page(
                template, title, slug,
                r.get("description") or r.get("Description") or "",
                lastmod, category,
            )
            (out_dir / "index.html").write_text(html, encoding="utf-8")

            sitemap_entries.append((
                f"{HOST}/webinar/{slug}/",
                lastmod, "monthly", "0.7",
            ))
            # Lookup key is the *title's* slug (what sheets.js's ridaSlugify
            # produces), since the legacy URL has the raw title in ?title=
            slug_map[base_slug] = slug

    write_sitemap(ROOT / "sitemap-webinars.xml", sitemap_entries)

    (ROOT / "data" / "webinar-slugs.js").write_text(
        "/* AUTO-GENERATED by build_sitemaps.py — do not edit by hand. */\n"
        "window.RIDA_WEBINAR_SLUGS = " + json.dumps(slug_map, indent=2, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"  Wrote data/webinar-slugs.js ({len(slug_map)} entries)")
    return len(sitemap_entries)


# ─── sitemap index ────────────────────────────────────────────────────────
def build_sitemap_index():
    today = date.today().isoformat()
    children = ["sitemap-core.xml", "sitemap-podcast.xml", "sitemap-webinars.xml"]
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for name in children:
        parts.append("  <sitemap>")
        parts.append(f"    <loc>{HOST}/{name}</loc>")
        parts.append(f"    <lastmod>{today}</lastmod>")
        parts.append("  </sitemap>")
    parts.append("</sitemapindex>")
    (ROOT / "sitemap.xml").write_text("\n".join(parts) + "\n", encoding="utf-8")
    print(f"  Wrote sitemap.xml (index of {len(children)} child sitemaps)")


def main():
    print("Fetching sheets:")
    try:
        n_pod = build_podcast()
        n_web = build_webinars()
    except Exception as e:
        print(f"\nERROR: {e}", file=sys.stderr)
        sys.exit(1)
    print("\nWriting sitemap index:")
    build_sitemap_index()
    print(f"\nDone. {n_pod} podcast episode pages + {n_web} replay pages generated.")
    print("Next: git add . && git commit && git push")
    print("Then: python indexnow.py")


if __name__ == "__main__":
    main()
