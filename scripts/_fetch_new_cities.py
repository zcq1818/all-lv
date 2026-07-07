# -*- coding: utf-8 -*-
"""抓取12座新增热门城市的真实图片(Wikimedia Commons) + 维基百科简介 + 美食图。
幂等：image/detail 已存在则跳过；进度持续落盘到 cities.json。
关键优化：429 限流时尊重 Retry-After 头并施加全局冷却，避免在窗口内反复重试。
"""
import os, json, time, gzip, io, random, urllib.parse, urllib.request, urllib.error
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data", "cities.json")
IMG_ROOT = os.path.join(ROOT, "assets", "images")
LOG = os.path.join(IMG_ROOT, "_fetch_new_cities_progress.log")
API = "https://commons.wikimedia.org/w/api.php"
WIKI = "https://zh.wikipedia.org/w/api.php"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
API_DELAY = 8.0  # 每次 API 调用前的温和间隔，降低触发限流概率（冷却后续跑用更慢节奏）

NEW_IDS = ["wuhan", "changsha", "tianjin", "shenzhen", "dalian", "wuyishan",
           "emeishan", "pingyao", "datong", "kashgar", "taipei", "hulunbuir"]

# 全局冷却：任何请求遇到 429 后，所有后续请求都暂停到该时间点之后
GLOBAL_COOLDOWN_UNTIL = 0.0

os.makedirs(IMG_ROOT, exist_ok=True)

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

def find_image(name, city, max_w=1280):
    queries = [name, f"{name} {city}", city]
    for q in queries:
        if not q:
            continue
        time.sleep(API_DELAY)
        cands = commons_search(q, 5)
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

def wiki_extract(title):
    base = (WIKI + "?action=query&prop=extracts&exintro&explaintext"
            "&redirects=1&format=json&titles=")
    time.sleep(API_DELAY)
    d = http_get(base + urllib.parse.quote(title))
    pages = (d or {}).get("query", {}).get("pages", {})
    for p in pages.values():
        if "missing" in p:
            continue
        ex = (p.get("extract") or "").strip()
        if len(ex) >= 30:
            return ex, "https://zh.wikipedia.org/wiki/" + urllib.parse.quote(p.get("title", title))
    return None, None

def wiki_extract_batch(title_list):
    """一次请求批量抓取多个条目导语，返回 {规范标题: (extract, url)}。省预算。"""
    out = {}
    if not title_list:
        return out
    titles = "|".join(urllib.parse.quote(t) for t in title_list)
    url = (WIKI + "?action=query&prop=extracts&exintro&explaintext"
           "&redirects=1&format=json&titles=" + titles)
    time.sleep(API_DELAY)
    d = http_get(url)
    pages = (d or {}).get("query", {}).get("pages", {})
    for p in pages.values():
        if "missing" in p:
            continue
        ex = (p.get("extract") or "").strip()
        t = p.get("title", "")
        if len(ex) >= 30:
            out[t] = (ex, "https://zh.wikipedia.org/wiki/" + urllib.parse.quote(t))
    return out

def gen_fallback(a, city_name):
    desc = a.get("desc") or ""
    parts = [f"{a['name']}位于{city_name}，是当地最具人气的旅游目的地之一。{desc}"]
    ticket = a.get("ticket")
    parts.append(f"门票方面，票价为{ticket}，旅游旺季容易排长队，建议提前预约并避开高峰时段。" if ticket
                 else "门票多以景区现场公示为准，出行前留意官方公告即可。")
    t = a.get("time") or "半天"
    parts.append(f"建议游玩时间安排在{t}左右，可结合周边景点串联成一日游线路。")
    return "\n".join(parts)

def main():
    d = json.load(open(DATA, encoding="utf-8"))
    total_img = total_img_fail = total_real = total_gen = total_food = total_food_fail = 0
    for cid in NEW_IDS:
        city = next((c for c in d["cities"] if c["id"] == cid), None)
        if not city:
            log(f"未找到 {cid}，跳过"); continue
        cname = city["name"]
        city_dir = os.path.join(IMG_ROOT, cid)
        food_dir = os.path.join(city_dir, "food")
        os.makedirs(food_dir, exist_ok=True)
        log(f"===== 开始 {cname} ({cid})：{len(city['attractions'])}景点 + {len(city['food'])}美食 =====")

        ok_img = fail_img = real = gen = 0
        # 批量抓维基简介：整城一次请求，省下大量 API 预算
        need = [a for a in city["attractions"] if not a.get("detail")]
        if need:
            batch = wiki_extract_batch([a["name"] for a in need])
            for a in need:
                ex, s = batch.get(a["name"], (None, None))
                if not ex:
                    ex, s = wiki_extract(a["name"])
                if not ex:
                    ex, s = wiki_extract(f"{a['name']} {cname}")
                if ex:
                    a["detail"], a["detailSource"] = ex, s; real += 1
                else:
                    a["detail"], a["detailSource"] = gen_fallback(a, cname), ""; gen += 1
                log(f"    详情 {a['name']}: {'真实' if s else '生成'}")
            with open(DATA, "w", encoding="utf-8") as f:
                json.dump(d, f, ensure_ascii=False, separators=(",", ":"))

        # 逐个抓景点真实图
        for i, a in enumerate(city["attractions"]):
            name = a["name"]
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
                        log(f"    ✗图 {name} 文件过小")
                else:
                    fail_img += 1
                    log(f"    ✗图 {name} 未找到")
            with open(DATA, "w", encoding="utf-8") as f:
                json.dump(d, f, ensure_ascii=False, separators=(",", ":"))
            time.sleep(1.0)

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
                        log(f"    ✗食 {fname} 文件过小")
                else:
                    fail_food += 1
                    log(f"    ✗食 {fname} 未找到")
        with open(DATA, "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False, separators=(",", ":"))

        log(f"  {cname} 完成：图 {ok_img}成功/{fail_img}失败 | 详情 真实{real}/生成{gen} | 食 {ok_food}成功/{fail_food}失败")
        total_img += ok_img; total_img_fail += fail_img
        total_real += real; total_gen += gen
        total_food += ok_food; total_food_fail += fail_food

    log(f"\n########## 全部完成 ##########")
    log(f"景点图：{total_img}成功 / {total_img_fail}失败")
    log(f"详情：真实 {total_real} / 生成 {total_gen}")
    log(f"美食图：{total_food}成功 / {total_food_fail}失败")

if __name__ == "__main__":
    main()
