#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""抓取首页 Hero 用真实中国风景横幅图，保存为 assets/images/hero.webp（约1600px宽）。"""
import os, io, gzip, json, time, urllib.parse, urllib.request, urllib.error, ssl, struct

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
OUT = os.path.join(ROOT, 'assets', 'images', 'hero.webp')
UA = "Mozilla/5.0 (compatible; TravelGuideBot/1.0; +http://example.com)"
CTX = ssl.create_default_context()

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
                pages = d.get("query", {}).get("pages", {})
                for p in pages.values():
                    for ii in p.get("imageinfo", []):
                        if ii.get("thumburl"):
                            return ii["thumburl"]
                return None
        except Exception as e:
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
            # 尝试用 Pillow 转 webp（更稳）；失败则原样保存
            saved = False
            try:
                from PIL import Image
                im = Image.open(io.BytesIO(blob)).convert("RGB")
                w, h = im.size
                if w > 1600:
                    im = im.resize((1600, int(h * 1600 / w)), Image.LANCZOS)
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
            print("已保存 Hero 图:", out, os.path.getsize(out), "bytes")
            return True
        except Exception as e:
            time.sleep(4)
    return False

# 多个候选关键词（皆可代表“中国旅游”），取第一张成功的
candidates = [
    "Guilin Li River landscape",
    "Zhangjiajie National Forest Park",
    "Jiuzhaigou Valley",
    "Great Wall of China",
    "Huangshan mountain",
    "Li River Guilin",
]
base = ("https://commons.wikimedia.org/w/api.php?action=query&generator=search"
        "&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=1600&format=json")

ok = False
for q in candidates:
    t = urllib.parse.quote(q)
    url = base + "&gsrsearch=" + t
    print("尝试关键词:", q)
    thumb = fetch_json(url)
    if thumb:
        print("  拿到缩略图URL:", thumb)
        if download(thumb, OUT):
            ok = True
            break
    else:
        print("  无结果")
    time.sleep(2)

if not ok:
    print("❌ 所有候选关键词均未成功抓取 Hero 图")
    raise SystemExit(1)
print("✅ Hero 图抓取完成")
