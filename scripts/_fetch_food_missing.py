#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""针对 cities.json 中 food 仍无 image 的条目，用泛化/英文关键词补抓 Wikimedia Commons 图。"""
import os, io, gzip, json, time, urllib.parse, urllib.request, ssl

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
DATA = os.path.join(ROOT, 'data', 'cities.json')
IMG = os.path.join(ROOT, 'assets', 'images')
UA = "Mozilla/5.0 (compatible; TravelGuideBot/1.0; +http://example.com)"
CTX = ssl.create_default_context()

API = ("https://commons.wikimedia.org/w/api.php?action=query&generator=search"
       "&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=800&format=json")

# 泛化/英文回退词（针对之前没匹配到的冷门菜）
GENERIC = {
    "海鲜大餐": ["海鲜", "Seafood", "Qingdao seafood"],
    "鲅鱼水饺": ["水饺", "Jiaozi", "Dumpling"],
    "牦牛肉火锅": ["火锅", "Yak meat", "Beef hotpot"],
    "土家腊肉": ["腊肉", "Chinese bacon", "Bacon"],
    "岩耳炖鸡": ["炖鸡", "Chicken soup", "Stew"],
    "狗浇尿饼": ["油饼", "Chinese pancake", "Pancake"],
}

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
            try:
                from PIL import Image
                im = Image.open(io.BytesIO(blob)).convert("RGB")
                w, h = im.size
                if w > 800:
                    im = im.resize((800, int(h * 800 / w)), Image.LANCZOS)
                im.save(out, "WEBP", quality=82)
            except Exception:
                with open(out, "wb") as f:
                    f.write(blob)
            return True
        except Exception:
            time.sleep(4)
    return False

d = json.load(open(DATA, encoding='utf-8'))
ok = fail = 0
for c in d['cities']:
    cid, cname = c['id'], c['name']
    for i, f in enumerate(c.get('food', [])):
        if f.get('image'):
            continue
        base = [f['name'], f"{cname}{f['name']}"]
        base += GENERIC.get(f['name'], [])
        got = None
        for q in base:
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
                print(f"✅ 补抓 {cname}/{f['name']}")
                continue
        fail += 1
        print(f"❌ 仍无图 {cname}/{f['name']}")
        time.sleep(0.8)

json.dump(d, open(DATA, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f"\n补抓完成: 成功{ok} 失败{fail}")
