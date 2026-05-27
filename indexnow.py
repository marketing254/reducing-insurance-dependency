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
    sm = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    return re.findall(r"<loc>(.*?)</loc>", sm)


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
