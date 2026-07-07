#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为 data/cities.json 中每个城市的 attractions 抓取真实照片（Wikimedia Commons），
下载到 assets/images/<cityId>/<i>.jpg，并把 image / imageCredit 写回 cities.json。
- 带浏览器 UA，规避 Wikimedia 403/空响应
- 429 指数退避
- 依次回退：name -> "name city" -> city
- 幂等：已存在的图片跳过下载
- 进度实时写入 assets/images/_fetch_progress.log
"""
import json, urllib.parse, urllib.request, os, time, gzip, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
DATA = os.path.join(ROOT, "data", "cities.json")
IMG_ROOT = os.path.join(ROOT, "assets", "images")
LOG = os.path.join(IMG_ROOT, "_fetch_progress.log")
API = "https://commons.wikimedia.org/w/api.php"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
API_DELAY = 1.4          # 两次 API 搜索之间的礼貌间隔（秒）
MAX_W = 1200             # 缩略图目标宽度

os.makedirs(IMG_ROOT, exist_ok=True)

def log(msg):
    line = f"[{time.strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def http_get(url, timeout=30, is_json=True):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                raw = r.read()
            if not raw:
                time.sleep(3); continue
            if raw[:2] == b"\x1f\x8b":
                raw = gzip.decompress(raw)
            return json.loads(raw) if is_json else raw
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 12 * (attempt + 1)
                log(f"  429 限流，退避 {wait}s")
                time.sleep(wait); continue
            log(f"  HTTPError {e.code}"); time.sleep(5)
        except Exception as e:
            log(f"  err {e}"); time.sleep(5)
    return None if is_json else b""

def search_candidates(term, n=5):
    params = {
        "action": "query", "generator": "search", "gsrsearch": term,
        "gsrnamespace": "6", "gsrlimit": str(n),
        "prop": "imageinfo", "iiprop": "url|size|mime",
        "iiurlwidth": str(MAX_W), "format": "json",
    }
    url = API + "?" + urllib.parse.urlencode(params)
    try:
        d = http_get(url)
    except Exception:
        return []
    if not d:
        return []
    pages = (d.get("query") or {}).get("pages", {})
    cands = []
    for p in pages.values():
        ii = (p.get("imageinfo") or [{}])[0]
        u, mime = ii.get("thumburl"), (ii.get("mime") or "")
        if u and mime.startswith("image") and "svg" not in mime.lower():
            w = ii.get("width") or 0
            h = ii.get("height") or 0
            cands.append((u, w, h, p.get("title")))
    return cands

def pick_best(cands):
    if not cands:
        return None, None
    # 优先横向（w>=h），横向里按宽度降序；没有横向则按宽度降序
    landscape = [c for c in cands if c[1] and c[2] and c[1] >= c[2]]
    pool = landscape if landscape else cands
    pool = sorted(pool, key=lambda c: (c[1] or 0), reverse=True)
    return pool[0][0], pool[0][3]

def find_image(attraction, city_name):
    name = attraction.get("name", "").strip()
    queries = [name, f"{name} {city_name}"]
    if city_name:
        queries.append(city_name)
    for q in queries:
        if not q:
            continue
        time.sleep(API_DELAY)
        cands = search_candidates(q, 5)
        if cands:
            return pick_best(cands)
    return None, None

def download(url, dest):
    blob = http_get(url, is_json=False)
    if not blob:
        return 0
    with open(dest, "wb") as f:
        f.write(blob)
    return len(blob)

def main():
    data = json.load(open(DATA, encoding="utf-8"))
    cities = data.get("cities", [])
    log(f"开始：共 {len(cities)} 个城市")
    total = sum(len(c.get("attractions", [])) for c in cities)
    done = 0
    ok = 0
    skip = 0
    fail = 0
    for ci, city in enumerate(cities):
        cid = city.get("id")
        cname = city.get("name", "")
        attrs = city.get("attractions", [])
        city_dir = os.path.join(IMG_ROOT, cid)
        os.makedirs(city_dir, exist_ok=True)
        log(f"[{ci+1}/{len(cities)}] 城市 {cname}（{cid}），{len(attrs)} 个景点")
        for i, a in enumerate(attrs):
            name = a.get("name", "")
            dest = os.path.join(city_dir, f"{i}.jpg")
            rel = f"/assets/images/{cid}/{i}.jpg"
            done += 1
            # 已存在且已有 image 字段 -> 跳过
            if os.path.exists(dest) and a.get("image"):
                skip += 1
                continue
            url, credit = find_image(a, cname)
            if url:
                try:
                    sz = download(url, dest)
                except Exception as e:
                    sz = 0
                    log(f"    下载失败 {name}: {e}")
                if sz and sz > 2000:
                    a["image"] = rel
                    a["imageCredit"] = "https://commons.wikimedia.org/wiki/" + (credit or "")
                    ok += 1
                    log(f"    ✓ {name} -> {rel} ({sz//1024}KB)")
                else:
                    fail += 1
                    log(f"    ✗ {name} 下载为空/过小")
            else:
                fail += 1
                log(f"    ✗ {name} 未找到图片")
            # 每处理一个景点后保存，防止中断丢失进度
            if done % 5 == 0:
                json.dump(data, open(DATA, "w", encoding="utf-8"),
                          ensure_ascii=False, indent=2)
        # 每城市结束保存一次
        json.dump(data, open(DATA, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=2)
    log(f"完成：总数 {total}，成功 {ok}，跳过 {skip}，失败 {fail}")
    log(f"失败率 {fail/max(total,1)*100:.1f}%")

if __name__ == "__main__":
    main()
