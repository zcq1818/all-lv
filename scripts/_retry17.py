# -*- coding: utf-8 -*-
"""补齐17张缺失占位图：中文检索失效的冷门小吃/古建，改用中英/罗马化别名优先英文检索。
幂等：仅处理 cities.json 中 image 为空的项；进度持续落盘。
限流：每次API前8s间隔；遇429尊重Retry-After并全局冷却。
"""
import os, json, time, gzip, io, random, urllib.parse, urllib.request, urllib.error
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data", "cities.json")
IMG_ROOT = os.path.join(ROOT, "assets", "images")
LOG = os.path.join(IMG_ROOT, "_retry17.log")
API = "https://commons.wikimedia.org/w/api.php"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
API_DELAY = 8.0
GLOBAL_COOLDOWN_UNTIL = 0.0

# 17项精确匹配 + 中英/罗马化别名（英文优先，命中概率高）
# key = (city_id, type, item_name)  type in {'attraction','food'}
TARGETS = [
    ("wuhan", "food", "排骨藕汤", ["Pork rib lotus root soup", "Lotus root pork soup", "Chinese pork rib soup", "排骨莲藕汤"]),
    ("changsha", "attraction", "靖港古镇", ["Jinggang Ancient Town", "Jinggang Town Wangcheng", "Jinggang", "靖港古镇"]),
    ("changsha", "food", "口味虾", ["Spicy crayfish", "Mala crayfish", "Crayfish dish", "crayfish", "湖南口味虾"]),
    ("changsha", "food", "姊妹团子", ["Glutinous rice dumpling", "sticky rice ball", "rice dumpling Changsha", "姊妹团子"]),
    ("shenzhen", "food", "沙井蚝", ["Shajing oyster", "oyster Shenzhen", "oyster farming China", "沙井蚝"]),
    ("shenzhen", "food", "光明乳鸽", ["Roast pigeon", "Guangming squab", "pigeon dish", "乳鸽"]),
    ("wuyishan", "food", "岚谷熏鹅", ["Smoked goose", "Langgu smoked goose", "Wuyishan smoked goose", "熏鹅"]),
    ("wuyishan", "food", "文公菜", ["Hakka dish", "Wuyishan cuisine", "Chinese home dish", "文公菜"]),
    ("wuyishan", "food", "茶油稻花鱼", ["Tea oil fish", "Chinese river fish dish", "fried fish Chinese", "茶油稻花鱼"]),
    ("wuyishan", "food", "孝母饼", ["Sesame cake", "Wuyishan snack", "Chinese cake", "孝母饼"]),
    ("emeishan", "food", "峨眉雪芽", ["Emei Xueya tea", "Emei tea", "Sichuan green tea", "峨眉雪芽"]),
    ("pingyao", "attraction", "日昇昌票号", ["Rishengchang", "Rishengchang Draft Bank", "Pingyao bank", "日昇昌票号"]),
    ("pingyao", "attraction", "协同庆钱庄", ["Pingyao ancient city", "Pingyao old town", "平遥古城", "Qing dynasty bank China", "Pingyao courtyard", "协同庆钱庄", "Xietongqing"]),
    ("datong", "attraction", "大同古城墙", ["Datong City Wall", "Datong city wall", "Datong wall", "大同古城墙"]),
    ("datong", "food", "浑源凉粉", ["Liangfen", "cold noodle Shanxi", "Chinese cold noodle", "浑源凉粉"]),
    ("kashgar", "attraction", "香妃园", ["Apak Hoja Mausoleum", "Afak Hoja Mausoleum", "Xiangfei Tomb", "香妃园"]),
    ("kashgar", "food", "鸽子汤", ["Pigeon soup", "Squab soup", "pigeon broth", "鸽子汤"]),
]

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

def commons_search(term, n=6):
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
            tu = ii.get("thumburl") or u
            cands.append((tu, u, w, h, p.get("title")))
    return cands

def collect_candidates(aliases, prefer_landscape=True):
    """收集所有别名的候选(thumburl优先)，横图优先(food放宽)，去重保序。"""
    out = []
    for q in aliases:
        if not q:
            continue
        time.sleep(API_DELAY)
        cands = commons_search(q, 6)
        for (tu, fu, w, h, title) in cands:
            if prefer_landscape and w and h and w < h:
                continue
            out.append((tu or fu, title, q))
    seen = set(); uniq = []
    for item in out:
        if item[0] not in seen:
            seen.add(item[0]); uniq.append(item)
    return uniq

def save_webp(url, dest, max_w):
    blob = http_get(url, is_json=False)
    if not blob or len(blob) < 2000:
        return 0
    try:
        im = Image.open(io.BytesIO(blob)).convert("RGB")
        w, h = im.size
        if w > max_w:
            im = im.resize((max_w, int(h * max_w / w)), Image.LANCZOS)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        im.save(dest, "WEBP", quality=82)
        return os.path.getsize(dest)
    except Exception as e:
        log(f"    webp转换失败: {e}")
        return 0

def main():
    d = json.load(open(DATA, encoding="utf-8"))
    cities = d["cities"]
    # 建索引
    by_id = {c["id"]: c for c in cities}
    ok = fail = 0
    for (cid, typ, name, aliases) in TARGETS:
        city = by_id.get(cid)
        if not city:
            log(f"✗ 城市缺失: {cid}"); fail += 1; continue
        arr = city["attractions"] if typ == "attraction" else city["food"]
        idx = None
        for i, it in enumerate(arr):
            if it["name"] == name:
                idx = i; break
        if idx is None:
            log(f"✗ 未找到项: {cid}/{name}"); fail += 1; continue
        if arr[idx].get("image"):
            log(f"⊘ 已有图跳过: {cid}/{name}"); continue
        prefer_land = (typ == "attraction")
        cands = collect_candidates(aliases, prefer_land)
        rel = f"{idx}.webp" if typ == "attraction" else f"food/{idx}.webp"
        dest = os.path.join(IMG_ROOT, cid, rel)
        max_w = 1280 if typ == "attraction" else 800
        saved = False
        for (url, title, used_q) in cands:
            sz = save_webp(url, dest, max_w)
            if sz > 3000:
                arr[idx]["image"] = f"/assets/images/{cid}/{rel}"
                arr[idx]["imageCredit"] = "https://commons.wikimedia.org/wiki/" + (title or "")
                json.dump(d, open(DATA, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
                ok += 1
                log(f"✓ {cid}/{name} ({typ}) 命中: '{used_q}' ({sz//1024}KB)")
                saved = True
                break
        if not saved:
            log(f"✗ 图未找到/均无效: {cid}/{name} (试过 {len(cands)} 候选)"); fail += 1; continue
    log(f"=== 完成: 成功 {ok} / 失败 {fail} ===")

if __name__ == "__main__":
    main()
