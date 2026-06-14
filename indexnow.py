"""
IndexNow ping — instantly notify Bing / Yandex / Seznam that URLs changed.
IndexNow is a free protocol; one ping reaches all participating engines
(Bing, Yandex, Seznam, Naver). Google does NOT use IndexNow but reads the
same sitemap.

Usage:
  python indexnow.py                 # pings every URL in sitemap.xml
  python indexnow.py /contact /tools # pings only the given clean paths

Key file must be live at:
  https://www.rid.academy/e7a8459c2b8644f4b1eeb6fa4a11a47a.txt
(committed to the repo root — IndexNow verifies ownership by fetching it.)
"""
import sys
import json
import re
import urllib.request
from pathlib import Path

HOST = "www.rid.academy"
KEY = "e7a8459c2b8644f4b1eeb6fa4a11a47a"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
ROOT = Path(__file__).resolve().parent


def sitemap_urls():
    """Collect every <loc> from sitemap.xml. If sitemap.xml is a
    sitemap-index (which it is now — root references child sitemaps for
    core pages, podcast episodes, and webinar replays), recurse into each
    child sitemap and return the union of every page URL."""
    sm = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    locs = re.findall(r"<loc>(.*?)</loc>", sm)
    is_index = "<sitemapindex" in sm
    if not is_index:
        return locs

    page_urls = []
    for child_url in locs:
        # Resolve child sitemap to a local path. All child sitemaps live at
        # the repo root and have predictable filenames.
        name = child_url.rsplit("/", 1)[-1]
        child_path = ROOT / name
        if not child_path.exists():
            print(f"  warn: child sitemap {name} not found locally — skipping")
            continue
        child_xml = child_path.read_text(encoding="utf-8")
        page_urls.extend(re.findall(r"<loc>(.*?)</loc>", child_xml))
    return page_urls


def main():
    args = sys.argv[1:]
    if args:
        urls = [f"https://{HOST}{a if a.startswith('/') else '/' + a}" for a in args]
    else:
        urls = sitemap_urls()

    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT, data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    print(f"Submitting {len(urls)} URL(s) to IndexNow ({HOST})...")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            print(f"  HTTP {r.status} {r.reason}")
            if r.status in (200, 202):
                print("  Accepted. Bing/Yandex will crawl these shortly.")
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {e.read().decode('utf-8', 'ignore')[:200]}")
        if e.code == 403:
            print("  → 403 means the key file isn't live yet. Push first, then retry.")
    except Exception as e:
        print(f"  ERROR: {e}")


if __name__ == "__main__":
    main()
