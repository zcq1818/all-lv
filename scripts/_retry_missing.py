# -*- coding: utf-8 -*-
"""补抓12座新城中 image 字段为空的景点图/美食图。幂等，仅处理缺失项。"""
import os, json, time, gzip, io, random, urllib.parse, urllib.request, urllib.error
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data", "cities.json")
IMG_ROOT = os.path.join(ROOT, "assets", "images")
LOG = os.path.join(IMG_ROOT, "_retry_missing.log")
API = "https://commons.wikimedia.org/w/api.php"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
API_DELAY = 8.0

NEW_IDS = ["wuhan", "changsha", "tianjin", "shenzhen", "dalian", "wuyishan",
           "emeishan", "pingyao", "datong", "kashgar", "taipei", "hulunbuir"]
GLOBAL_COOLDOWN_UNTIL = 0.0

def log(msg):
    line = f"[{time.strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def http_get(url, timeout=30, is_json=True):
    global GLOBAL_COOLDOWN_UNTIL
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(6):
        now = time.time()
        if now < GLOBAL_COOLDOWN_UNTIL:
            time.sleep(GLOBAL_COOLDOWN_UNTIL - now + 0.3)
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
                ra = e.headers.get("Retry-After")
                try:
                    wait = int(ra) if ra and str(ra).strip().isdigit() else 0
                except Exception:
                    wait = 0
                if wait <= 0:
                    wait = 12 * (attempt + 1)
                wait = min(wait, 300) + random.uniform(0, 5)
                GLOBAL_COOLDOWN_UNTIL = time.time() + wait
                log(f"  429 限流，全局退避 {int(wait)}s (Retry-After={ra})")
                time.sleep(wait); continue
            time.sleep(5)
        except Exception:
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
        u, mime = ii.get("url"), (ii.get("mime") or "")
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

def find_image(name, city):
    # 补抓用更宽的关键词组合
    queries = [name, f"{name} {city}", f"{city} {name}",
               f"{name} 风景", f"{city} {name} 景点", f"{name} 旅游"]
    for q in queries:
        if not q:
            continue
        time.sleep(API_DELAY)
        cands = commons_search(q, 6)
        if cands:
            u, t = pick_best(cands)
            if u:
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

def main():
    d = json.load(open(DATA, encoding="utf-8"))
    cities = {c["id"]: c for c in d["cities"]}
    ok = fail = 0
    for cid in NEW_IDS:
        c = cities.get(cid)
        if not c:
            continue
        cname = c["name"]
        city_dir = os.path.join(IMG_ROOT, cid)
        os.makedirs(city_dir, exist_ok=True)
        # 景点
        for i, a in enumerate(c["attractions"]):
            if a.get("image"):
                continue
            log(f"补抓景点图 {cname}/{a['name']}")
            url, credit = find_image(a["name"], cname)
            if url:
                dest = os.path.join(city_dir, f"{i}.webp")
                sz = save_webp(url, dest, 1280)
                if sz > 3000:
                    a["image"] = f"/assets/images/{cid}/{i}.webp"
                    a["imageCredit"] = "https://commons.wikimedia.org/wiki/" + (credit or "")
                    ok += 1
                    log(f"  ✓ {a['name']} ({sz//1024}KB)")
                else:
                    fail += 1
                    log(f"  ✗ {a['name']} 文件过小/转换失败")
            else:
                fail += 1
                log(f"  ✗ {a['name']} 未找到")
            with open(DATA, "w", encoding="utf-8") as f:
                json.dump(d, f, ensure_ascii=False, separators=(",", ":"))
        # 美食
        food_dir = os.path.join(city_dir, "food")
        os.makedirs(food_dir, exist_ok=True)
        for i, f in enumerate(c["food"]):
            if f.get("image"):
                continue
            log(f"补抓美食图 {cname}/{f['name']}")
            url, credit = find_image(f["name"], cname)
            if url:
                dest = os.path.join(food_dir, f"{i}.webp")
                sz = save_webp(url, dest, 800)
                if sz > 2000:
                    f["image"] = f"/assets/images/{cid}/food/{i}.webp"
                    f["imageCredit"] = "https://commons.wikimedia.org/wiki/" + (credit or "")
                    ok += 1
                    log(f"  ✓ {f['name']} ({sz//1024}KB)")
                else:
                    fail += 1
                    log(f"  ✗ {f['name']} 文件过小/转换失败")
            else:
                fail += 1
                log(f"  ✗ {f['name']} 未找到")
            with open(DATA, "w", encoding="utf-8") as f:
                json.dump(d, f, ensure_ascii=False, separators=(",", ":"))
    log(f"########## 补抓完成: 成功 {ok} / 失败 {fail} ##########")

if __name__ == "__main__":
    main()
