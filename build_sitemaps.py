"""
Generate sitemap-podcast.xml and sitemap-webinars.xml from the live Google
Sheet, so every podcast episode and webinar/summit replay is discoverable
by search engines (instead of relying on JS-rendered internal links).

Why this exists
---------------
GitHub Pages can't render dynamic URLs server-side, so episode and replay
pages all share one HTML shell at /podcast-episode/ and /webinar/. The
canonical query-param URLs (/podcast-episode/?ep=388, /webinar/?title=...)
are valid but Google won't crawl what it can't find — and without a
sitemap entry per item, discovery depends on the homepage / podcast index
linking each one (which itself loads via JS).

Listing every item in a sitemap fixes that: Bing/Google read the sitemap
directly and queue each URL for crawl, no JS execution required.

Usage
-----
    python build_sitemaps.py

Writes:
    sitemap-podcast.xml      one <url> per episode
    sitemap-webinars.xml     one <url> per webinar/summit replay

The root sitemap.xml is a sitemap-index that references both, plus the
hand-curated list of core pages.
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

SHEET_ID = "1FOeB6lyOCKzj4u9caLPxModWYrpCILE0h4-7O_0yR4s"
HOST = "https://www.rid.academy"
ROOT = Path(__file__).resolve().parent

# Tab name → (output file, URL builder)
PODCAST_TAB = "podcast"
REPLAY_TABS = ["webinars", "summits"]


def fetch_sheet(tab):
    """Fetch one sheet tab via gviz and return list of dict rows keyed by header label."""
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
    """gviz returns dates as 'Date(YYYY,M,D)' (month is 0-indexed)."""
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


def write_sitemap(path, entries):
    """entries = list of (loc, lastmod, changefreq, priority)."""
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


def build_podcast_sitemap():
    rows = fetch_sheet(PODCAST_TAB)
    entries = []
    today = date.today().isoformat()
    for r in rows:
        ep = r.get("episode") or r.get("Episode") or r.get("ep")
        if not ep:
            continue
        loc = f"{HOST}/podcast-episode/?ep={ep}"
        d = parse_sheet_date(r.get("date") or r.get("Date"))
        lastmod = d.isoformat() if d else today
        entries.append((loc, lastmod, "monthly", "0.7"))
    write_sitemap(ROOT / "sitemap-podcast.xml", entries)
    return len(entries)


def build_webinars_sitemap():
    all_entries = []
    today = date.today().isoformat()
    for tab in REPLAY_TABS:
        rows = fetch_sheet(tab)
        for r in rows:
            title = r.get("title") or r.get("Title")
            if not title:
                continue
            # URL keeps the title verbatim — matches what sheets.js produces
            # via window.location.search, so canonical alignment stays exact.
            loc = f"{HOST}/webinar/?title={urllib.parse.quote(title)}"
            d = parse_sheet_date(r.get("date") or r.get("Date"))
            lastmod = d.isoformat() if d else today
            all_entries.append((loc, lastmod, "monthly", "0.7"))
    write_sitemap(ROOT / "sitemap-webinars.xml", all_entries)
    return len(all_entries)


def build_sitemap_index():
    """Top-level sitemap.xml is a sitemap-index pointing to the three children."""
    today = date.today().isoformat()
    children = [
        ("sitemap-core.xml", today),
        ("sitemap-podcast.xml", today),
        ("sitemap-webinars.xml", today),
    ]
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for name, lastmod in children:
        parts.append("  <sitemap>")
        parts.append(f"    <loc>{HOST}/{name}</loc>")
        parts.append(f"    <lastmod>{lastmod}</lastmod>")
        parts.append("  </sitemap>")
    parts.append("</sitemapindex>")
    (ROOT / "sitemap.xml").write_text("\n".join(parts) + "\n", encoding="utf-8")
    print(f"  Wrote sitemap.xml (index of {len(children)} child sitemaps)")


def main():
    print("Fetching sheets:")
    try:
        n_pod = build_podcast_sitemap()
        n_web = build_webinars_sitemap()
    except Exception as e:
        print(f"\nERROR: {e}", file=sys.stderr)
        sys.exit(1)
    print("\nWriting sitemap index:")
    build_sitemap_index()
    print(f"\nDone. {n_pod} podcast episodes + {n_web} replays now in sitemaps.")
    print("Next: git add sitemap*.xml && git commit && git push")
    print("Then: python indexnow.py   (re-pings everything, including new URLs)")


if __name__ == "__main__":
    main()
