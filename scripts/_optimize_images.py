import os, json, sys
from PIL import Image, features

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
DATA = os.path.join(ROOT, "data", "cities.json")
MAX_W = 1280
WEBP_QUALITY = 82

assert features.check("webp"), "Pillow 未编译 webp 支持"

def fs_path(url_path):
    # /assets/images/beijing/0.jpg -> E:\cn\all-lv\assets\images\beijing\0.jpg
    rel = url_path.lstrip("/").replace("/", os.sep)
    return os.path.join(ROOT, rel)

def convert_one(src_fs):
    if not os.path.exists(src_fs):
        return None
    try:
        with Image.open(src_fs) as im:
            im = im.convert("RGB")
            if im.width > MAX_W:
                h = round(im.height * MAX_W / im.width)
                im = im.resize((MAX_W, h), Image.LANCZOS)
            base, _ = os.path.splitext(src_fs)
            dst = base + ".webp"
            im.save(dst, "WEBP", quality=WEBP_QUALITY, method=4)
            if dst != src_fs and os.path.exists(src_fs):
                os.remove(src_fs)
            return dst
    except Exception as e:
        print("  转换失败:", src_fs, e)
        return None

d = json.load(open(DATA, encoding="utf-8"))
converted = 0
skipped = 0
for c in d["cities"]:
    for a in c.get("attractions", []):
        img = a.get("image")
        if not img:
            skipped += 1
            continue
        src = fs_path(img)
        if src.lower().endswith(".webp") and os.path.exists(src):
            skipped += 1
            continue
        dst = convert_one(src)
        if dst:
            rel = os.path.relpath(dst, ROOT).replace(os.sep, "/")
            a["image"] = "/" + rel
            converted += 1
        else:
            skipped += 1

json.dump(d, open(DATA, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

# 统计体积
total = 0
cnt = 0
for root, _, files in os.walk(os.path.join(ROOT, "assets", "images")):
    for f in files:
        if "_test" in f:
            continue
        total += os.path.getsize(os.path.join(root, f))
        cnt += 1
print(f"转换完成：{converted} 张转 WebP，跳过 {skipped} 张")
print(f"图片目录现状：{cnt} 个文件，总体积 {total/1024/1024:.1f} MB")
