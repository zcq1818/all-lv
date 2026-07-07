#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""为新增的秦皇岛(qinhuangdao)抓取：景点真实图(webp) + 维基百科详细介绍 + 美食真实图(webp)。
复用 _fetch_images / _fetch_food / _fetch_details 的抓取逻辑，直接存 webp（与全站一致）。
只处理 image/detail 为空的条目（增量、幂等）。结果写回 data/cities.json。
"""
import os, json, time, gzip, urllib.parse, urllib.request, io
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
DATA = os.path.join(ROOT, "data", "cities.json")
IMG_ROOT = os.path.join(ROOT, "assets", "images")
LOG = os.path.join(IMG_ROOT, "_add_qhd_progress.log")
API = "https://commons.wikimedia.org/w/api.php"
WIKI = "https://zh.wikipedia.org/w/api.php"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
API_DELAY = 1.4

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
                log(f"  429 限流，退避 {wait}s"); time.sleep(wait); continue
            time.sleep(5)
        except Exception as e:
            time.sleep(5)
    return None if is_json else b""

def commons_search(term, n=5):
    params = {
        "action": "query", "generator": "search", "gsrsearch": term,
        "gsrnamespace": "6", "gsrlimit": str(n),
        "prop": "imageinfo", "iiprop": "url|size|mime",
        "iiurlwidth": "1280", "format": "json",
    }
    url = API + "?" + urllib.parse.urlencode(params)
    d = http_get(url)
    if not d:
        return []
    pages = (d.get("query") or {}).get("pages", {})
    cands = []
    for p in pages.values():
        ii = (p.get("imageinfo") or [{}])[0]
        u, mime = ii.get("thumburl"), (ii.get("mime") or "")
        if u and mime.startswith("image") and "svg" not in mime.lower():
            w, h = ii.get("width") or 0, ii.get("height") or 0
            cands.append((u, w, h, p.get("title")))
    return cands

def pick_best(cands):
    if not cands:
        return None, None
    landscape = [c for c in cands if c[1] and c[2] and c[1] >= c[2]]
    pool = landscape if landscape else cands
    pool = sorted(pool, key=lambda c: (c[1] or 0), reverse=True)
    return pool[0][0], pool[0][3]

def find_image(name, city, max_w=1280):
    queries = [name, f"{name} {city}", city]
    for q in queries:
        if not q:
            continue
        time.sleep(API_DELAY)
        cands = commons_search(q, 5)
        if cands:
            u, t = pick_best(cands)
            # 重新要指定宽度的缩略图
            if u:
                u2 = u.split("/thumb/")
                # 直接用原 thumburl（已是1280）
                return u, t
    return None, None

def save_webp(url, dest, max_w):
    blob = http_get(url, is_json=False)
    if not blob or len(blob) < 2000:
        return 0
    try:
        im = Image.open(io.BytesIO(blob)).convert("RGB")
        w, h = im.size
        if w > max_w:
            im = im.resize((max_w, int(h * max_w / w)), Image.LANCZOS)
        im.save(dest, "WEBP", quality=82)
        return os.path.getsize(dest)
    except Exception as e:
        log(f"    webp转换失败: {e}")
        return 0

def wiki_extract(title):
    base = (WIKI + "?action=query&prop=extracts&exintro&explaintext"
            "&redirects=1&format=json&titles=")
    d = http_get(base + urllib.parse.quote(title))
    pages = (d or {}).get("query", {}).get("pages", {})
    for p in pages.values():
        if "missing" in p:
            continue
        ex = (p.get("extract") or "").strip()
        if len(ex) >= 30:
            return ex, "https://zh.wikipedia.org/wiki/" + urllib.parse.quote(p.get("title", title))
    return None, None

def gen_fallback(a, city_name):
    desc = a.get("desc") or ""
    parts = [f"{a['name']}位于{city_name}，是当地最具人气的旅游目的地之一。{desc}"]
    ticket = a.get("ticket")
    if ticket:
        parts.append(f"门票方面，票价为{ticket}，旅游旺季容易排长队，建议提前预约并避开高峰时段。")
    else:
        parts.append("门票多以景区现场公示为准，出行前留意官方公告即可。")
    t = a.get("time") or "半天"
    parts.append(f"建议游玩时间安排在{t}左右，可结合周边景点串联成一日游线路。")
    return "\n".join(parts)

def main():
    d = json.load(open(DATA, encoding="utf-8"))
    city = next((c for c in d["cities"] if c["id"] == "qinhuangdao"), None)
    if not city:
        log("未找到秦皇岛，退出"); return
    cid, cname = city["id"], city["name"]
    city_dir = os.path.join(IMG_ROOT, cid)
    food_dir = os.path.join(city_dir, "food")
    os.makedirs(food_dir, exist_ok=True)
    log(f"开始秦皇岛：{len(city['attractions'])}景点 + {len(city['food'])}美食")

    # 景点图 + 详情
    ok_img = fail_img = 0
    real = gen = 0
    for i, a in enumerate(city["attractions"]):
        name = a["name"]
        # 图
        if not a.get("image"):
            url, credit = find_image(name, cname)
            if url:
                dest = os.path.join(city_dir, f"{i}.webp")
                sz = save_webp(url, dest, 1280)
                if sz > 3000:
                    a["image"] = f"/assets/images/{cid}/{i}.webp"
                    a["imageCredit"] = "https://commons.wikimedia.org/wiki/" + (credit or "")
                    ok_img += 1
                    log(f"    ✓图 {name} ({sz//1024}KB)")
                else:
                    fail_img += 1
                    log(f"    ✗图 {name} 失败")
            else:
                fail_img += 1
                log(f"    ✗图 {name} 未找到")
        # 详情
        if not a.get("detail"):
            ex, s = wiki_extract(name)
            if not ex:
                ex, s = wiki_extract(f"{name} {cname}")
            if ex:
                a["detail"], a["detailSource"] = ex, s; real += 1
            else:
                a["detail"], a["detailSource"] = gen_fallback(a, cname), ""; gen += 1
            log(f"    详情 {name}: {'真实' if s else '生成'}")
        # checkpoint
        with open(DATA, "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False, separators=(",", ":"))

    # 美食图
    ok_food = fail_food = 0
    for i, f in enumerate(city["food"]):
        fname = f["name"]
        if not f.get("image"):
            url, credit = find_image(fname, cname)
            if not url:
                url, credit = find_image(f"{fname} {cname}", cname)
            if not url:
                url, credit = find_image(f"{cname}美食", cname)
            if url:
                dest = os.path.join(food_dir, f"{i}.webp")
                sz = save_webp(url, dest, 800)
                if sz > 3000:
                    f["image"] = f"/assets/images/{cid}/food/{i}.webp"
                    ok_food += 1
                    log(f"    ✓食 {fname} ({sz//1024}KB)")
                else:
                    fail_food += 1
                    log(f"    ✗食 {fname} 失败")
            else:
                fail_food += 1
                log(f"    ✗食 {fname} 未找到")
    with open(DATA, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, separators=(",", ":"))

    log(f"完成：景点图 {ok_img}成功/{fail_img}失败 | 详情 真实{real}/生成{gen} | 美食图 {ok_food}成功/{fail_food}失败")

if __name__ == "__main__":
    main()
