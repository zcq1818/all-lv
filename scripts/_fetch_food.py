#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""抓取全部城市美食真实照片，保存到 assets/images/<cityId>/food/<i>.webp，并写回 cities.json。"""
import os, io, gzip, json, time, urllib.parse, urllib.request, ssl

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
DATA = os.path.join(ROOT, 'data', 'cities.json')
IMG = os.path.join(ROOT, 'assets', 'images')
UA = "Mozilla/5.0 (compatible; TravelGuideBot/1.0; +http://example.com)"
CTX = ssl.create_default_context()

API = ("https://commons.wikimedia.org/w/api.php?action=query&generator=search"
       "&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=800&format=json")

def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Encoding": "gzip"})
    for _ in range(5):
        try:
            with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
                raw = r.read()
                if not raw:
                    time.sleep(3); continue
                if r.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
                d = json.loads(raw)
                for p in d.get("query", {}).get("pages", {}).values():
                    for ii in p.get("imageinfo", []):
                        if ii.get("thumburl"):
                            return ii["thumburl"]
                return None
        except Exception:
            time.sleep(4)
    return None

def download(url, out):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for _ in range(5):
        try:
            with urllib.request.urlopen(req, timeout=40, context=CTX) as r:
                blob = r.read()
            if len(blob) < 3000:
                time.sleep(3); continue
            saved = False
            try:
                from PIL import Image
                im = Image.open(io.BytesIO(blob)).convert("RGB")
                w, h = im.size
                if w > 800:
                    im = im.resize((800, int(h * 800 / w)), Image.LANCZOS)
                im.save(out, "WEBP", quality=82)
                saved = True
            except Exception:
                try:
                    with open(out, "wb") as f:
                        f.write(blob)
                    saved = True
                except Exception:
                    saved = False
            if not saved:
                time.sleep(3); continue
            return True
        except Exception:
            time.sleep(4)
    return False

d = json.load(open(DATA, encoding='utf-8'))
ok = skip = fail = 0
for c in d['cities']:
    cid, cname = c['id'], c['name']
    for i, f in enumerate(c.get('food', [])):
        if f.get('image'):
            skip += 1; continue
        queries = [f['name'], f"{cname}{f['name']}", f"{f['name']}菜"]
        got = None
        for q in queries:
            got = fetch_json(API + "&gsrsearch=" + urllib.parse.quote(q))
            if got:
                break
            time.sleep(1.5)
        if got:
            out = os.path.join(IMG, cid, 'food', f"{i}.webp")
            os.makedirs(os.path.dirname(out), exist_ok=True)
            if download(got, out):
                f['image'] = f"/assets/images/{cid}/food/{i}.webp"
                ok += 1
                print(f"✅ {cname}/{f['name']}")
            else:
                fail += 1
                print(f"⚠️ 下载失败 {cname}/{f['name']}")
        else:
            fail += 1
            print(f"❌ 无图 {cname}/{f['name']}")
        time.sleep(0.8)

json.dump(d, open(DATA, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f"\n完成: 新增{ok} 跳过{skip} 失败/无图{fail}")
