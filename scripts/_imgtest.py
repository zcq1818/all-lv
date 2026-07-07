import json, urllib.parse, urllib.request, ssl, os, time, gzip, io

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

def api_search(term, n=3):
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": term,
        "gsrnamespace": "6",
        "gsrlimit": str(n),
        "prop": "imageinfo",
        "iiprop": "url|size|mime",
        "iiurlwidth": "800",
        "format": "json",
    }
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=25) as r:
                raw = r.read()
                if not raw:
                    print("empty body attempt", attempt); time.sleep(3); continue
                data = gzip.decompress(raw) if raw[:2] == b"\x1f\x8b" else raw
                d = json.loads(data)
                return d.get("query", {}).get("pages", {})
        except Exception as e:
            print("api err:", e); time.sleep(4)
    return {}

def main():
    pages = api_search("故宫", 3)
    print("结果数:", len(pages))
    out = None
    for p in pages.values():
        ii = (p.get("imageinfo") or [{}])[0]
        print("-", p.get("title"), "| mime:", ii.get("mime"), "| thumb:", ii.get("thumburl"))
        if ii.get("thumburl") and (ii.get("mime") or "").startswith("image"):
            out = ii["thumburl"]; break
    if out:
        req = urllib.request.Request(out, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            blob = r.read()
        if blob[:2] == b"\x1f\x8b":
            blob = gzip.decompress(blob)
        path = "/e/cn/all-lv/assets/images/_test_gugong.jpg"
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            f.write(blob)
        print("下载成功:", path, "bytes:", len(blob))
    else:
        print("无可用图片")

if __name__ == "__main__":
    main()
