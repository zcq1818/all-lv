#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""为全部景点补充'详细介绍'文本。
策略：优先抓取维基百科中文导语(真实、权威、CC BY-SA)，抓不到则用基于景点字段生成的兜底文字。
结果写入 data/cities.json 每个 attraction 的 detail / detailSource 字段。
每处理完一个城市即写回一次(中间 checkpoint)，避免中断丢数据。
"""
import os, json, time, gzip, urllib.parse, urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
DATA = os.path.join(ROOT, "data", "cities.json")
LOG = os.path.join(ROOT, "assets", "images", "_fetch_details_progress.log")
UA = "Mozilla/5.0 (compatible; TravelGuideBot/1.0; +http://example.com)"

def log(msg):
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(time.strftime("%H:%M:%S") + " " + msg + "\n")

def req_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Encoding": "gzip"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=12) as r:
                raw = r.read()
                if r.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
                if not raw:
                    time.sleep(2); continue
                return json.loads(raw)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(8 * (attempt + 1)); continue
            time.sleep(2)
        except Exception:
            time.sleep(2)
    return {}

def wiki_extract(title):
    base = "https://zh.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&format=json&titles="
    d = req_json(base + urllib.parse.quote(title))
    pages = d.get("query", {}).get("pages", {})
    for p in pages.values():
        if "missing" in p:
            continue
        ex = (p.get("extract") or "").strip()
        if len(ex) >= 30:
            return ex, "https://zh.wikipedia.org/wiki/" + urllib.parse.quote(p.get("title", title))
    return None, None

def gen_fallback(a, city_name):
    desc = a.get("desc") or ""
    parts = []
    parts.append(f"{a['name']}位于{city_name}，是当地最具人气的旅游目的地之一。{desc}")
    ticket = a.get("ticket")
    if ticket:
        parts.append(f"门票方面，票价为{ticket}，旅游旺季容易排长队，建议提前在官方渠道预约购票，并尽量避开高峰时段入园，体验更从容。")
    else:
        parts.append("门票多以景区现场公示为准，部分时段会有优惠或免费政策，出行前留意官方公告即可。")
    t = a.get("time") or "半天"
    parts.append(f"建议游玩时间安排在{t}左右，可结合周边其他景点串联成一日游线路，体验会更完整。")
    return "\n".join(parts)

def main():
    d = json.load(open(DATA, encoding="utf-8"))
    total = sum(len(c.get("attractions", [])) for c in d["cities"])
    done = 0; real = 0; gen = 0
    log(f"开始：共 {total} 个景点")
    for c in d["cities"]:
        cn = c["name"]
        for a in c.get("attractions", []):
            detail = None; src = None
            # 1) 景点名
            ex, s = wiki_extract(a["name"])
            if not ex and cn:
                # 2) 景点名+城市
                ex, s = wiki_extract(f"{a['name']} {cn}")
            if ex:
                detail = ex; src = s; real += 1
            else:
                detail = gen_fallback(a, cn); gen += 1
            a["detail"] = detail
            a["detailSource"] = src or ""
            done += 1
        # 每城 checkpoint 写回
        with open(DATA, "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False, separators=(",", ":"))
        log(f"[{done}/{total}] {cn} 完成 | 真实:{real} 生成:{gen}")
    log(f"全部完成 ✅ 真实百科:{real} 生成兜底:{gen} 总计:{done}")

if __name__ == "__main__":
    main()
