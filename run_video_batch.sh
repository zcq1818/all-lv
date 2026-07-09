#!/usr/bin/env bash
# Batch-complete the 6 remaining city promo videos, wire VIDEO_CITIES, rebuild, commit+push.
# Idempotent: skips cities already present. Gracefully stops on daily quota (429).
# Token: from $TOKEN env, else falls back to .video_token file (gitignored).
set -u
cd /e/cn/all-lv
PY="C:/Users/ERIC/.workbuddy/binaries/python/versions/3.13.12/python.exe"
SK="D:/WorkBuddy/resources/app.asar.unpacked/resources/builtin-skills/buddy-multimodal-generation/scripts/buddy-cloud.py"
NODE="C:/Users/ERIC/.workbuddy/binaries/node/versions/22.22.2/node.exe"
OUT="assets/videos"
mkdir -p "$OUT/vertical"

# token resolution
TOKEN="${TOKEN:-}"
if [ -z "$TOKEN" ] && [ -f .video_token ]; then TOKEN=$(cat .video_token); fi
if [ -z "$TOKEN" ]; then echo "NO TOKEN AVAILABLE"; exit 2; fi

# city id -> cinematic prompt (ids must match data/cities.json & video filename)
CITIES=(wuhan changsha tianjin huangshan hulunbuir xining)
PROMPTS=(
 "Cinematic blue-hour aerial of Wuhan: Yangtze River winding past Yellow Crane Tower, East Lake reflections, warm city lights glowing, slow drifting camera, warm terracotta tone, 5 seconds"
 "Cinematic night of Changsha: Orange Isle and Xiang River with vibrant neon reflections, Yuelu Mountain silhouette, glowing city lights on water, slow camera move, warm cinematic tone, 5 seconds"
 "Cinematic golden-hour of Tianjin: Haihe River, the Tianjin Eye ferris wheel lit up, European riverside architecture, golden lights, slow dolly, warm tone, 5 seconds"
 "Cinematic misty dawn over Huangshan Yellow Mountain: sea of clouds among bizarre granite peaks and ancient pine trees, soft pink-gold sunrise light, slow aerial drift, serene tone, 5 seconds"
 "Cinematic summer aerial of Hulunbuir Grassland: endless green meadows, winding rivers, grazing horses and sheep, yurts, golden low sunlight, slow panoramic glide, 5 seconds"
 "Cinematic evening of Xining: Qinghai Lake shimmering at golden hour, distant snow mountains, prayer flags, warm plateau light, slow drone pull-back, 5 seconds"
)

gen_one() {
  local c="$1" p="$2"
  if [ -f "$OUT/$c.mp4" ] && [ -f "$OUT/vertical/$c-vertical.mp4" ]; then
    echo "[$c] already present, skip"; return 0
  fi
  echo "=== [$c] submitting ==="
  local OUTRAW ERR="_gen_${c}.err.txt"
  OUTRAW=$(echo -n "$TOKEN" | "$PY" -u "$SK" video "$p" --token-stdin 2>"$ERR")
  if echo "$OUTRAW" | grep -q "daily submit limit"; then
    echo "[$c] QUOTA EXCEEDED (429)"; return 99
  fi
  local URL
  URL=$(printf '%s' "$OUTRAW" | "$PY" -c "import sys,json,re
raw=sys.stdin.read()
try:
    d=json.loads(raw)
except Exception:
    m=re.search(r'\{.*\}', raw, re.S)
    d=json.loads(m.group(0)) if m else {}
def grab(o):
    if isinstance(o, dict):
        for k in ('result_url','url','video_url'):
            if o.get(k): return o[k]
        for v in o.values():
            r=grab(v)
            if r: return r
    if isinstance(o, list):
        for v in o:
            r=grab(v)
            if r: return r
    return None
r=grab(d)
print(r if isinstance(r, str) else (r[0] if isinstance(r, list) and r else ''))")
  if [ -z "$URL" ]; then echo "[$c] FAILED (no url)"; tail -15 "$ERR"; return 1; fi
  curl -sS -L -o "$OUT/$c.mp4" "$URL"
  local SZ; SZ=$(stat -c%s "$OUT/$c.mp4" 2>/dev/null || echo 0)
  if [ "${SZ:-0}" -lt 10000 ]; then echo "[$c] download too small ($SZ)"; return 1; fi
  ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT/$c.mp4" >/dev/null 2>&1 || { echo "[$c] probe failed"; return 1; }
  ffmpeg -y -i "$OUT/$c.mp4" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -c:v libx264 -preset fast -crf 24 -c:a aac -b:a 128k "$OUT/vertical/$c-vertical.mp4" 2>>"$ERR" || { echo "[$c] ffmpeg vertical failed"; return 1; }
  echo "[$c] DONE"
  return 0
}

for i in "${!CITIES[@]}"; do
  c="${CITIES[$i]}"
  gen_one "$c" "${PROMPTS[$i]}"
  rc=$?
  if [ "$rc" -eq 99 ]; then echo "QUOTA hit, stopping."; break; fi
  if [ "$rc" -ne 0 ]; then echo "[warn] $c failed rc=$rc, continuing"; fi
done

# summary
missing=0
for c in "${CITIES[@]}"; do
  if [ -f "$OUT/$c.mp4" ] && [ -f "$OUT/vertical/$c-vertical.mp4" ]; then echo "OK   $c"; else echo "MISS $c"; missing=$((missing+1)); fi
done
echo "missing=$missing"
if [ "$missing" -gt 0 ]; then echo "Not all videos ready; skip wiring/deploy. Re-run after quota resets."; exit 0; fi

# wire VIDEO_CITIES (idempotent append)
echo "=== wiring VIDEO_CITIES ==="
"$NODE" -e "
const fs=require('fs');
const f='scripts/generate-qhd-style.js';
let s=fs.readFileSync(f,'utf8');
const add=['wuhan','changsha','tianjin','huangshan','hulunbuir','xining'];
s=s.replace(/const VIDEO_CITIES = new Set\(\[[^\]]*\]\);/, (m)=>{
  const cur=m.match(/\[([^\]]*)\]/)[1];
  let ids=cur.split(',').map(x=>x.trim().replace(/^'|'$/g,'')).filter(Boolean);
  for(const a of add){ if(!ids.includes(a)) ids.push(a); }
  return 'const VIDEO_CITIES = new Set(['+ids.map(x=>\"'\"+x+\"'\").join(',')+']);';
});
fs.writeFileSync(f,s);
console.log('wired ids:', ids.join(','));
"

echo "=== rebuild site ==="
"$NODE" scripts/generate-qhd-style.js 2>&1 | tail -3

echo "=== git commit + push (triggers Vercel deploy) ==="
git add assets/videos/ scripts/generate-qhd-style.js city/ index.html 2>/dev/null
git commit -m "feat: add 6 city promo videos (wuhan/changsha/tianjin/huangshan/hulunbuir/xining) + wire VIDEO_CITIES" 2>&1 | tail -3
git push origin main 2>&1 | tail -3
echo "DONE_ALL"
