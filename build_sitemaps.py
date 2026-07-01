"""
build_sitemaps.py — regenerate sitemap-podcast.xml and sitemap-webinars.xml
from the live Google Sheet.

Why this exists
---------------
GitHub Pages can't rewrite URLs server-side, so podcast episode and
webinar/summit replay pages all share one HTML shell (/podcast-episode/
and /webinar/). Google won't crawl what it can't find in a sitemap, so we
list every episode and replay explicitly here — with the canonical
query-param URL Google sees on the site itself.

(Slug URLs will come later once the site moves to Next.js. For now,
query-param URLs are the discoverable form.)

Usage
-----
    python build_sitemaps.py

Writes:
    sitemap-podcast.xml      one <url> per episode  (?ep=N)
    sitemap-webinars.xml     one <url> per replay   (?title=...)
    sitemap.xml              sitemap-index of the three child sitemaps

Run after adding/editing rows in the sheet, then commit and push.
`python indexnow.py` after deploy re-pings Bing/Yandex with any new URLs.
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

PODCAST_TAB = "podcast"
REPLAY_TABS = ["webinars", "summits"]


def to_int_str(v):
    """gviz returns numeric cells as floats ('388.0'). Coerce to int-string
    when the value is a whole number so the URL is `?ep=388` not
    `?ep=388.0` (Google was indexing the float form as its own URL)."""
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


def build_podcast_sitemap():
    rows = fetch_sheet(PODCAST_TAB)
    today = date.today().isoformat()
    entries = []
    for r in rows:
        raw_ep = r.get("episode") or r.get("Episode") or r.get("ep")
        if not raw_ep:
            continue
        ep_num = to_int_str(raw_ep)
        if not ep_num:
            continue
        d = parse_sheet_date(r.get("date") or r.get("Date"))
        lastmod = d.isoformat() if d else today
        entries.append((
            f"{HOST}/podcast-episode/?ep={ep_num}",
            lastmod, "monthly", "0.7",
        ))
    write_sitemap(ROOT / "sitemap-podcast.xml", entries)
    return len(entries)


def build_webinars_sitemap():
    today = date.today().isoformat()
    entries = []
    for tab in REPLAY_TABS:
        rows = fetch_sheet(tab)
        for r in rows:
            title = r.get("title") or r.get("Title")
            if not title:
                continue
            # Encode the title exactly as sheets.js does (encodeURIComponent)
            # so the sitemap URL matches the canonical the page emits.
            encoded = urllib.parse.quote(title, safe="")
            d = parse_sheet_date(r.get("date") or r.get("Date"))
            lastmod = d.isoformat() if d else today
            entries.append((
                f"{HOST}/webinar/?title={encoded}",
                lastmod, "monthly", "0.7",
            ))
    write_sitemap(ROOT / "sitemap-webinars.xml", entries)
    return len(entries)


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
        n_pod = build_podcast_sitemap()
        n_web = build_webinars_sitemap()
    except Exception as e:
        print(f"\nERROR: {e}", file=sys.stderr)
        sys.exit(1)
    print("\nWriting sitemap index:")
    build_sitemap_index()
    print(f"\nDone. {n_pod} podcast + {n_web} replay URLs in sitemaps.")
    print("Next: git add sitemap*.xml && git commit && git push")
    print("Then: python indexnow.py")


if __name__ == "__main__":
    main()
