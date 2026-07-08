#!/usr/bin/env node
/**
 * 全国旅游页面生成器 — 复用秦皇岛旅游官网设计
 * 每个城市生成完整页面套件，左上角可切换城市
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://lv.divdu.com';

// ===== SEO 工具函数（生成式站点统一注入，覆盖全部页面）=====
function seoHead({ title, description, keywords, url, image, type = 'website', jsonLd = null, noindex = false }) {
  const kw = Array.isArray(keywords) ? keywords.join(',') : (keywords || '');
  const imgAbs = image ? (image.startsWith('http') ? image : SITE + image) : '';
  const robots = noindex ? '\n<meta name="robots" content="noindex,follow">' : '';
  let ld = '';
  if (jsonLd) {
    const arr = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    ld = arr.map(o => '\n<script type="application/ld+json">\n' + JSON.stringify(o) + '\n</script>').join('');
  }
  const twCard = imgAbs ? 'summary_large_image' : 'summary';
  return `<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${kw}">
<link rel="canonical" href="${url}">${robots}
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="全国旅游攻略">
<meta property="og:locale" content="zh_CN">
${imgAbs ? `<meta property="og:image" content="${imgAbs}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">` : ''}
<meta name="twitter:card" content="${twCard}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
${imgAbs ? `<meta name="twitter:image" content="${imgAbs}">` : ''}${ld}`;
}
function breadcrumb(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((it, i) => ({
      "@type": "ListItem", "position": i + 1, "name": it[0], "item": SITE + it[1]
    }))
  };
}
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cities.json'), 'utf8'));

// ===== 相对路径后处理 =====
// 依据文件所在目录深度，将绝对路径(/xxx)转为相对前缀(../../)，
// 使站点在「域名根目录」「GitHub Pages 子路径」「本地双击打开」三种场景下都能正确加载 CSS/图片/JS。
function relPrefixFor(filePath) {
  const rel = path.relative(ROOT, path.dirname(filePath));
  const segs = rel === '' ? 0 : rel.split(path.sep).length;
  return '../'.repeat(segs);
}
function relativize(html, filePath) {
  const p = relPrefixFor(filePath);
  return html
    .replace(/(href|src)="\//g, `$1="${p}`)
    .replace(/url\(\//g, `url(${p}`);
}
function writeHtml(relPath, html) {
  const filePath = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, relativize(html, filePath));
}

// 按省份分组
function groupByProvince() {
  const provinces = {};
  data.cities.forEach(c => {
    if (!provinces[c.province]) provinces[c.province] = [];
    provinces[c.province].push(c);
  });
  return provinces;
}

// 城市选择器 — 省份 > 城市层级
function citySelector(currentCityId) {
  const provinces = groupByProvince();
  const current = data.cities.find(c => c.id === currentCityId);
  let provinceGroups = '';
  for (const [prov, cities] of Object.entries(provinces)) {
    const cityLinks = cities.map(c =>
      `<a href="/city/${c.id}/" class="city-option${c.id === currentCityId ? ' active' : ''}">${c.emoji} ${c.name}</a>`
    ).join('');
    provinceGroups += `<div class="province-group"><div class="province-label">${prov}</div>${cityLinks}</div>`;
  }
  return `
<div class="city-selector" id="citySelector">
  <button class="city-selector-btn" onclick="toggleCityMenu()">
    <span>${current?.emoji || '🌍'}</span>
    <span class="city-selector-name">${current?.name || '选择城市'}</span>
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
  </button>
  <div class="city-dropdown" id="cityDropdown">
    <div class="city-dropdown-header">
      <span class="city-dropdown-title">选择目的地</span>
      <span class="city-dropdown-count">${data.cities.length}个城市</span>
    </div>
    <div class="city-dropdown-body">${provinceGroups}</div>
  </div>
</div>`;
}

// 城市选择器 CSS — 省份 > 城市层级
const citySelectorCSS = `
/* ===== 城市选择器 ===== */
.city-selector{position:relative;margin-right:12px}
.city-selector-btn{display:flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:var(--radius);cursor:pointer;font-size:.88rem;color:#fff;transition:all .2s;white-space:nowrap}
.city-selector-btn:hover{background:rgba(255,255,255,0.25);border-color:rgba(255,255,255,0.4)}
.city-selector-name{font-weight:600}
.city-dropdown{display:none;position:absolute;top:calc(100% + 8px);left:0;width:320px;max-height:70vh;background:#fff;border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,0.18);border:1px solid #E9E1D6;z-index:999;overflow:hidden}
.city-dropdown.open{display:flex;flex-direction:column}
@keyframes dropdownIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.city-dropdown-header{padding:14px 16px 10px;border-bottom:1px solid #F3EEE7;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.city-dropdown-title{font-size:.8rem;color:#211C18;font-weight:700}
.city-dropdown-count{font-size:.7rem;color:#B8AB99;background:#F3EEE7;padding:2px 8px;border-radius:10px}
.city-dropdown-body{overflow-y:auto;padding:8px 0;flex:1}
.province-group{margin-bottom:4px}
.province-label{padding:8px 16px 4px;font-size:.7rem;color:#B8AB99;font-weight:700;letter-spacing:.5px;position:sticky;top:0;background:#fff;z-index:1}
.city-option{display:flex;align-items:center;gap:8px;padding:8px 16px;font-size:.88rem;color:#211C18;transition:background .15s;text-decoration:none}
.city-option:hover{background:#F3EEE7}
.city-option.active{background:#F7EDE8;color:#BD4B2B;font-weight:600}
.city-option.active::before{content:"✓";font-size:.75rem;color:#BD4B2B;margin-right:-4px}
.navbar.scrolled .city-selector-btn{background:rgba(0,0,0,0.06);border-color:#E9E1D6;color:#211C18}
@media(max-width:640px){.city-dropdown{width:calc(100vw - 32px);left:-8px}}
`;

// 城市选择器 JS
const citySelectorJS = `
function toggleCityMenu(){var d=document.getElementById('cityDropdown');d.classList.toggle('open')}
document.addEventListener('click',function(e){if(!e.target.closest('#citySelector')&&!e.target.closest('.city-selector')){var d=document.getElementById('cityDropdown');if(d)d.classList.remove('open')}});
`;

// ===== 首页模板 =====
function generateIndex(city) {
  const c = city;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoHead({
  title: `${c.name}旅游官网 — ${c.tagline} | 2026攻略`,
  description: c.description,
  keywords: c.keywords,
  url: `${SITE}/city/${c.id}/`,
  image: (c.attractions && c.attractions[0] && c.attractions[0].image) ? c.attractions[0].image : '',
  type: 'website',
  jsonLd: [
    {
      "@context": "https://schema.org", "@type": "TouristDestination",
      "name": `${c.name}旅游`,
      "description": c.description,
      "url": `${SITE}/city/${c.id}/`,
      "image": (c.attractions && c.attractions[0]) ? `${SITE}${c.attractions[0].image}` : '',
      "address": { "@type": "PostalAddress", "addressRegion": c.province, "addressCountry": "CN" },
      "geo": { "@type": "GeoCoordinates", "latitude": c.lat, "longitude": c.lng },
      "touristType": ["休闲度假", "亲子出游", "摄影打卡", "美食探店"],
      "containsPlace": (c.attractions || []).slice(0, 12).map(a => ({
        "@type": "TouristAttraction", "name": a.name,
        "url": `${SITE}/city/${c.id}/attraction/${c.attractions.indexOf(a)}.html`,
        "image": `${SITE}${a.image}`
      }))
    },
    breadcrumb([['首页', '/'], [c.name, `/city/${c.id}/`]])
  ]
})}
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#BD4B2B">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>${citySelectorCSS}
.hero-full{min-height:100vh;display:flex;align-items:center;position:relative;overflow:hidden;${(c.attractions&&c.attractions[0]&&c.attractions[0].image)?`background-image:linear-gradient(135deg,rgba(143,53,23,.55) 0%,rgba(189,75,43,.32) 100%),url(${c.attractions[0].image});background-size:cover;background-position:center;`:`background:linear-gradient(135deg,${c.color||'#8F3517'} 0%,${c.color||'#BD4B2B'}88 100%)`}}
.hero-overlay{position:absolute;inset:0;z-index:1;background:linear-gradient(135deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.3) 100%)}
.hero-photo{width:100%;max-width:420px;aspect-ratio:4/5;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.4);border:4px solid rgba(255,255,255,.25);margin:0 auto}
.hero-grid{max-width:var(--max-width);margin:0 auto;width:100%;position:relative;z-index:2;padding:120px 24px 80px;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.city-intro{padding:100px 24px;background:#fff}
.city-grid{max-width:var(--max-width);margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.attractions-preview{padding:100px 24px;background:var(--gray-50)}
.attractions-grid{max-width:var(--max-width);margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
@media(max-width:768px){.hero-grid,.city-grid{grid-template-columns:1fr}.attractions-grid{grid-template-columns:1fr}.hero-photo{display:none}}
</style>
</head>
<body>
<!-- 导航栏 -->
<nav class="navbar" id="navbar">
  <div class="nav-inner">
    ${citySelector(c.id)}
    <ul class="nav-links" id="navLinks">
      <li><a href="/city/${c.id}/" class="active">首页</a></li>
      <li><a href="/city/${c.id}/attractions.html">景点</a></li>
      <li><a href="/city/${c.id}/food.html">美食</a></li>
      <li><a href="/city/${c.id}/guide.html">攻略</a></li>
      <li><a href="/city/${c.id}/itinerary.html">行程</a></li>
      <li><a href="/city/${c.id}/blog.html">博客</a></li>
    </ul>
    <a href="/city/${c.id}/itinerary.html" class="nav-cta">免费规划行程 <span class="nav-cta-arrow">→</span></a>
    <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
  </div>
</nav>

<!-- Hero -->
<section class="hero-full" id="main-content">
  <div class="hero-overlay"></div>
  <div class="hero-grid">
    <div style="color:#fff">
      <h1 style="font-size:clamp(2.5rem,5vw,4rem);font-weight:900;line-height:1.15;margin-bottom:20px;text-shadow:0 4px 40px rgba(0,0,0,0.3)">
        ${c.heroTitle || '发现'+c.name+'<br>最美风光'}
      </h1>
      <p style="font-size:1.15rem;opacity:.95;line-height:1.8;margin-bottom:36px;max-width:500px;text-shadow:0 2px 16px rgba(0,0,0,0.3)">
        ${c.heroSub || c.description}
      </p>
      <div style="display:flex;gap:16px;flex-wrap:wrap">
        <a href="/city/${c.id}/itinerary.html" class="btn btn-white" style="font-size:1rem;padding:14px 28px">🗺️ 智能规划行程</a>
        <a href="/city/${c.id}/attractions.html" class="btn btn-outline-white" style="font-size:1rem;padding:14px 28px">🏔️ 探索景点</a>
      </div>
    </div>
    ${(c.attractions&&c.attractions[1]&&c.attractions[1].image)?`<div class="hero-photo"><img src="${c.attractions[1].image}" alt="${c.name}风光实景" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy"></div>`:`<div style="text-align:center;font-size:8rem;filter:drop-shadow(0 8px 32px rgba(0,0,0,0.3))">${c.emoji}</div>`}
  </div>
</section>

<!-- 城市简介 -->
<section class="city-intro">
  <div class="city-grid">
    <div>
      <h2 style="font-size:2rem;font-weight:800;margin-bottom:16px">关于${c.name}</h2>
      <p style="font-size:1.05rem;line-height:1.9;color:#6B6155;margin-bottom:24px">${c.description}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div style="padding:16px;background:var(--gray-50);border-radius:12px"><div style="font-size:1.5rem;margin-bottom:4px">📅</div><div style="font-weight:600">最佳时间</div><div style="font-size:.9rem;color:#8A7E6E">${c.bestSeason}</div></div>
        <div style="padding:16px;background:var(--gray-50);border-radius:12px"><div style="font-size:1.5rem;margin-bottom:4px">⏱️</div><div style="font-weight:600">建议天数</div><div style="font-size:.9rem;color:#8A7E6E">${c.suggestedDays}</div></div>
        <div style="padding:16px;background:var(--gray-50);border-radius:12px"><div style="font-size:1.5rem;margin-bottom:4px">📍</div><div style="font-weight:600">省份</div><div style="font-size:.9rem;color:#8A7E6E">${c.province}</div></div>
        <div style="padding:16px;background:var(--gray-50);border-radius:12px"><div style="font-size:1.5rem;margin-bottom:4px">🌤️</div><div style="font-weight:600">气候</div><div style="font-size:.9rem;color:#8A7E6E">${c.climate || '详见攻略'}</div></div>
      </div>
    </div>
    <div style="font-size:10rem;text-align:center;opacity:.15">${c.emoji}</div>
  </div>
</section>

<!-- 热门景点 -->
<section class="attractions-preview">
  <div style="text-align:center;margin-bottom:48px">
    <h2 style="font-size:2rem;font-weight:800;margin-bottom:8px">🏔️ 热门景点</h2>
    <p style="color:#8A7E6E">${c.name}最值得去的地方</p>
  </div>
  <div class="attractions-grid">
    ${(c.attractions || []).slice(0, 6).map((a, i) => `
    <a href="/city/${c.id}/attraction/${i}.html" style="display:block;text-decoration:none;color:inherit;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E9E1D6;transition:all .25s" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 32px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
      <div style="height:160px;overflow:hidden;background:linear-gradient(135deg,${c.color||'#BD4B2B'}44 0%,${c.color||'#BD4B2B'}22 100%);display:flex;align-items:center;justify-content:center;font-size:3.5rem">${a.image ? `<img src="${a.image}" alt="${a.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover">` : a.icon}</div>
      <div style="padding:20px">
        <h3 style="font-weight:700;margin-bottom:6px">${a.name}</h3>
        <p style="font-size:.9rem;color:#8A7E6E;line-height:1.6">${a.desc.slice(0, 60)}...</p>
        <div style="margin-top:12px;display:flex;gap:12px;font-size:.8rem;color:#B8AB99">
          ${a.ticket ? '<span>🎫 '+a.ticket+'</span>' : ''}
          ${a.time ? '<span>⏱️ '+a.time+'</span>' : ''}
        </div>
      </div>
    </a>`).join('')}
  </div>
  <div style="text-align:center;margin-top:36px">
    <a href="/city/${c.id}/attractions.html" class="btn btn-primary" style="padding:12px 32px">查看全部景点 →</a>
  </div>
</section>

<!-- 美食推荐 -->
<section style="padding:100px 24px;background:#fff">
  <div style="text-align:center;margin-bottom:48px">
    <h2 style="font-size:2rem;font-weight:800;margin-bottom:8px">🍜 必吃美食</h2>
    <p style="color:#8A7E6E">${c.name}特色美食推荐</p>
  </div>
  <div style="max-width:var(--max-width);margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px">
    ${(c.food || []).slice(0, 4).map(f => `
    <div style="padding:24px;background:var(--gray-50);border-radius:14px;border:1px solid #E9E1D6">
      <div style="font-size:2rem;margin-bottom:8px">${f.icon}</div>
      <h3 style="font-weight:700;margin-bottom:6px">${f.name}</h3>
      <p style="font-size:.9rem;color:#8A7E6E;line-height:1.6">${f.desc.slice(0, 80)}...</p>
    </div>`).join('')}
  </div>
  <div style="text-align:center;margin-top:36px">
    <a href="/city/${c.id}/food.html" class="btn btn-primary" style="padding:12px 32px">查看全部美食 →</a>
  </div>
</section>

<!-- 旅游攻略 -->
<section style="padding:100px 24px;background:var(--gray-50)">
  <div style="text-align:center;margin-bottom:48px">
    <h2 style="font-size:2rem;font-weight:800;margin-bottom:8px">📋 旅游攻略</h2>
    <p style="color:#8A7E6E">交通·住宿·最佳时间·注意事项</p>
  </div>
  <div style="max-width:var(--max-width);margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px">
    ${(c.guide || []).map(g => `
    <div style="padding:28px;background:#fff;border-radius:14px;border:1px solid #E9E1D6">
      <div style="font-size:2rem;margin-bottom:12px">${g.icon}</div>
      <h3 style="font-weight:700;margin-bottom:8px">${g.title}</h3>
      <div style="font-size:.9rem;color:#6B6155;line-height:1.7">${g.content.replace(/<[^>]+>/g,'').slice(0,120)}...</div>
    </div>`).join('')}
  </div>
  <div style="text-align:center;margin-top:36px">
    <a href="/city/${c.id}/guide.html" class="btn btn-primary" style="padding:12px 32px">查看完整攻略 →</a>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-brand"><h3>${c.name}旅游官网</h3><p>致力于为每一位来${c.name}的游客，提供最实用、最全面的旅游攻略。</p></div>
      <div class="footer-col"><h4>热门页面</h4><a href="/city/${c.id}/">首页</a><a href="/city/${c.id}/attractions.html">景点推荐</a><a href="/city/${c.id}/food.html">美食推荐</a></div>
      <div class="footer-col"><h4>旅游攻略</h4><a href="/city/${c.id}/guide.html">出行指南</a><a href="/city/${c.id}/itinerary.html">行程规划</a><a href="/city/${c.id}/blog.html">旅游博客</a></div>
      <div class="footer-col"><h4>其他城市</h4>${data.cities.filter(x=>x.id!==c.id).slice(0,4).map(x=>`<a href="/city/${x.id}/">${x.name}</a>`).join('')}</div>
    </div>
    <div class="footer-bottom"><span>© 2026 全国旅游攻略</span><span style="font-size:.8rem;color:#B8AB99">· 图片来源：Wikimedia Commons（CC BY / CC BY-SA）</span><div><a href="/sitemap.xml">网站地图</a></div></div>
  </div>
</footer>
<script>
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
(function(){if(!('IntersectionObserver'in window))return;var d=document.documentElement;d.classList.add('reveal-ready');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)})})();
document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});
${citySelectorJS}
</script>
</body>
</html>`;
}

// ===== 景点页模板 =====
function generateAttractions(city) {
  const c = city;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoHead({
  title: `${c.name}景点推荐 - ${c.name}旅游攻略`,
  description: `${c.name}最值得去的景点推荐：精选${c.name}必玩景点，附详细攻略、门票、交通信息。`,
  keywords: [`${c.name}景点`, `${c.name}旅游`, `${c.name}攻略`, `${c.name}必玩`],
  url: `${SITE}/city/${c.id}/attractions.html`,
  image: (c.attractions && c.attractions[0]) ? c.attractions[0].image : '',
  type: 'website',
  jsonLd: breadcrumb([['首页', `/city/${c.id}/`], [`${c.name}景点`, `/city/${c.id}/attractions.html`]])
})}
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>${citySelectorCSS}</style>
<style>
.spot-card:hover img{transform:scale(1.06)}
.spot-card img{transition:transform .45s ease}
</style>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner">
  ${citySelector(c.id)}
  <ul class="nav-links" id="navLinks">
    <li><a href="/city/${c.id}/">首页</a></li>
    <li><a href="/city/${c.id}/attractions.html" class="active">景点</a></li>
    <li><a href="/city/${c.id}/food.html">美食</a></li>
    <li><a href="/city/${c.id}/guide.html">攻略</a></li>
    <li><a href="/city/${c.id}/itinerary.html">行程</a></li>
    <li><a href="/city/${c.id}/blog.html">博客</a></li>
  </ul>
  <a href="/city/${c.id}/itinerary.html" class="nav-cta">免费规划行程 →</a>
  <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
</div></nav>

<main style="max-width:960px;margin:0 auto;padding:100px 24px 60px">
  <nav style="font-size:.875rem;color:#6B6155;margin-bottom:24px"><a href="/city/${c.id}/" style="color:#BD4B2B">首页</a> / <span>景点推荐</span></nav>
  <h1 style="font-size:2.2rem;font-weight:800;margin-bottom:8px">🏔️ ${c.name}景点推荐</h1>
  <p style="color:#8A7E6E;margin-bottom:40px;font-size:1.05rem">${c.name}最值得去的景点，附门票和游玩建议</p>
  ${(c.attractions || []).map((a, idx) => `
  <a class="spot-card reveal" href="/city/${c.id}/attraction/${idx}.html" style="display:block;text-decoration:none;color:inherit;background:#fff;border-radius:16px;margin-bottom:20px;border:1px solid #E9E1D6;overflow:hidden;box-shadow:var(--shadow-sm);transition:all .25s" onmouseover="this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.boxShadow='var(--shadow-sm)'">
    ${a.image ? `
    <div style="aspect-ratio:16/9;overflow:hidden;background:#F3EEE7">
      <img src="${a.image}" alt="${a.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">
    </div>` : ''}
    <div style="padding:22px 28px 26px">
      <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:8px">${a.icon} ${a.name}</h3>
      <p style="color:#6B6155;line-height:1.8;margin-bottom:12px">${a.desc}</p>
      <div style="display:flex;gap:20px;font-size:.85rem;color:#B8AB99;flex-wrap:wrap">
        ${a.ticket ? '<span>🎫 门票：'+a.ticket+'</span>' : ''}
        ${a.time ? '<span>⏱️ 游玩时间：'+a.time+'</span>' : ''}
      </div>
    </div>
  </a>`).join('')}
</main>

<footer class="footer"><div class="footer-inner"><p>© 2026 ${c.name}旅游官网 · <a href="/city/${c.id}/">返回首页</a></p><p style="font-size:.8rem;color:#B8AB99;margin-top:6px">图片来源：Wikimedia Commons（CC BY / CC BY-SA）</p></div></footer>
<script>
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
(function(){if(!('IntersectionObserver'in window))return;var d=document.documentElement;d.classList.add('reveal-ready');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)})})();
document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});
${citySelectorJS}
</script>
</body>
</html>`;
}

// ===== 景点详情页模板 =====
function generateAttractionDetail(city, a, idx) {
  const c = city;
  const url = `${SITE}/city/${c.id}/attraction/${idx}.html`;
  const others = (c.attractions || [])
    .map((x, i) => ({ x, i }))
    .filter(o => o.i !== idx)
    .slice(0, 4);
  const attractionSchema = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": a.name,
    "description": a.desc,
    "image": a.image ? (SITE + a.image) : '',
    "url": url,
    "address": { "@type": "PostalAddress", "addressLocality": c.name, "addressRegion": c.province, "addressCountry": "CN" },
    "isPartOf": { "@type": "TouristDestination", "name": c.name + "旅游", "url": SITE + "/city/" + c.id + "/" },
    "touristType": ["休闲度假", "摄影打卡", "亲子出游"]
  };
  if (a.detailSource) attractionSchema.sameAs = a.detailSource;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoHead({
  title: `${a.name} - ${c.name}旅游攻略`,
  description: `${a.name}：${a.desc} 门票${a.ticket || '以景区公示为准'}，游玩时间${a.time || '建议半天'}。`,
  keywords: [a.name, `${c.name}景点`, `${c.name}旅游`, a.name + '攻略'],
  url: url,
  image: a.image || '',
  type: 'article',
  jsonLd: [attractionSchema, breadcrumb([['首页', '/'], [c.name, `/city/${c.id}/`], [`${c.name}景点`, `/city/${c.id}/attractions.html`], [a.name, `/city/${c.id}/attraction/${idx}.html`]])]
})}

<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>${citySelectorCSS}</style>
<style>
.att-hero{position:relative;height:52vh;min-height:380px;overflow:hidden;display:flex;align-items:flex-end}
.att-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.att-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,.12) 0%,rgba(15,23,42,.5) 58%,rgba(15,23,42,.82) 100%)}
.att-hero-inner{position:relative;z-index:1;max-width:960px;margin:0 auto;width:100%;padding:0 24px 40px;color:#fff}
.att-hero h1{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:900;text-shadow:0 2px 16px rgba(0,0,0,.5)}
.att-hero .sub{opacity:.92;margin-top:8px;font-size:1.05rem}
.att-body{max-width:960px;margin:0 auto;padding:36px 24px 60px}
.att-meta{display:flex;gap:28px;flex-wrap:wrap;margin:24px 0;padding:20px 24px;background:#FBF8F4;border:1px solid #E9E1D6;border-radius:14px}
.att-meta .m b{display:block;color:#B8AB99;font-size:.76rem;font-weight:600;margin-bottom:4px;letter-spacing:.04em}
.att-meta .m span{color:#211C18;font-weight:600;font-size:1rem}
.att-desc{font-size:1.08rem;line-height:1.9;color:#4A423A}
.att-credit{margin-top:28px;font-size:.8rem;color:#B8AB99}
.att-credit a{color:#BD4B2B}
.rel-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-top:20px}
.rel-card{display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid #E9E1D6;border-radius:14px;overflow:hidden;transition:all .25s}
.rel-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.1)}
.rel-card img{width:100%;height:130px;object-fit:cover;display:block}
.rel-card .ri{padding:12px 14px;font-weight:700}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-top:36px}
@media(max-width:600px){.att-meta{gap:16px}.att-meta .m{font-size:.9rem}}
</style>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner">
  ${citySelector(c.id)}
  <ul class="nav-links" id="navLinks">
    <li><a href="/city/${c.id}/">首页</a></li>
    <li><a href="/city/${c.id}/attractions.html" class="active">景点</a></li>
    <li><a href="/city/${c.id}/food.html">美食</a></li>
    <li><a href="/city/${c.id}/guide.html">攻略</a></li>
    <li><a href="/city/${c.id}/itinerary.html">行程</a></li>
    <li><a href="/city/${c.id}/blog.html">博客</a></li>
  </ul>
  <a href="/city/${c.id}/itinerary.html" class="nav-cta">免费规划行程 →</a>
  <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
</div></nav>

<header class="att-hero">
  ${a.image ? `<img src="${a.image}" alt="${a.name}" loading="lazy">` : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,${c.color||'#BD4B2B'},#2E7D5B)"></div>`}
  <div class="att-hero-inner">
    <div style="font-size:2.4rem;margin-bottom:6px">${a.icon}</div>
    <h1>${a.name}</h1>
    <div class="sub">${c.name} · 必玩景点</div>
  </div>
</header>

<main class="att-body">
  <nav style="font-size:.875rem;color:#6B6155;margin-bottom:8px"><a href="/city/${c.id}/" style="color:#BD4B2B">首页</a> / <a href="/city/${c.id}/attractions.html" style="color:#BD4B2B">景点</a> / <span>${a.name}</span></nav>
  <div class="att-meta">
    ${a.ticket ? `<div class="m"><b>🎫 门票</b><span>${a.ticket}</span></div>` : ''}
    ${a.time ? `<div class="m"><b>⏱️ 建议游玩</b><span>${a.time}</span></div>` : ''}
    <div class="m"><b>📍 所在城市</b><span>${c.name}</span></div>
  </div>
  <p class="att-desc">${a.desc}</p>
  <section style="margin-top:36px">
    <h2 style="font-size:1.4rem;font-weight:800;margin-bottom:16px;display:flex;align-items:center;gap:8px">📖 详细介绍</h2>
    <div style="color:#4A423A;line-height:1.95;font-size:1.02rem">
      ${(a.detail || a.desc).split('\\n').filter(p => p.trim()).map(p => `<p style="margin-bottom:16px">${p}</p>`).join('')}
    </div>
    ${a.detailSource ? `<p style="margin-top:18px;font-size:.82rem;color:#B8AB99">文字来源：<a href="${a.detailSource}" target="_blank" rel="noopener" style="color:#8A7E6E">维基百科</a>（CC BY-SA）</p>` : ''}
  </section>
  ${a.imageCredit ? `<p class="att-credit">图片来源：<a href="${a.imageCredit}" target="_blank" rel="noopener">Wikimedia Commons</a>（CC BY / CC BY-SA）</p>` : `<p class="att-credit">图片来源：Wikimedia Commons（CC BY / CC BY-SA）</p>`}
  ${others.length ? `
  <section style="margin-top:48px">
    <h2 style="font-size:1.4rem;font-weight:800;margin-bottom:6px">${c.name}其他热门景点</h2>
    <p style="color:#8A7E6E;margin-bottom:20px">继续探索${c.name}的精彩去处</p>
    <div class="rel-grid">
      ${others.map(o => `
      <a class="rel-card" href="/city/${c.id}/attraction/${o.i}.html">
        ${o.x.image ? `<img src="${o.x.image}" alt="${o.x.name}" loading="lazy">` : `<div style="height:130px;display:flex;align-items:center;justify-content:center;font-size:2.4rem;background:#F3EEE7">${o.x.icon}</div>`}
        <div class="ri">${o.x.icon} ${o.x.name}</div>
      </a>`).join('')}
    </div>
  </section>` : ''}
  <div class="cta-row">
    <a href="/city/${c.id}/itinerary.html" class="btn btn-primary" style="padding:12px 28px">规划${c.name}行程 →</a>
    <a href="/city/${c.id}/food.html" class="btn" style="padding:12px 28px">看看当地美食</a>
  </div>
</main>

<footer class="footer"><div class="footer-inner"><p>© 2026 ${c.name}旅游官网 · <a href="/city/${c.id}/">返回首页</a></p><p style="font-size:.8rem;color:#B8AB99;margin-top:6px">图片来源：Wikimedia Commons（CC BY / CC BY-SA）</p></div></footer>
<script>
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
(function(){if(!('IntersectionObserver'in window))return;var d=document.documentElement;d.classList.add('reveal-ready');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)})})();
document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});
${citySelectorJS}
</script>
</body>
</html>`;
}

// ===== 美食页模板 =====
function generateFood(city) {
  const c = city;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoHead({
  title: `${c.name}美食攻略 - ${c.name}旅游`,
  description: `${c.name}必吃美食推荐：特色小吃、网红餐厅、本地人私藏好店。`,
  keywords: [`${c.name}美食`, `${c.name}小吃`, `${c.name}旅游`, `${c.name}攻略`],
  url: `${SITE}/city/${c.id}/food.html`,
  image: (c.attractions && c.attractions[0]) ? c.attractions[0].image : '',
  type: 'website',
  jsonLd: breadcrumb([['首页', `/city/${c.id}/`], [`${c.name}美食`, `/city/${c.id}/food.html`]])
})}

<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>${citySelectorCSS}</style>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner">
  ${citySelector(c.id)}
  <ul class="nav-links" id="navLinks">
    <li><a href="/city/${c.id}/">首页</a></li>
    <li><a href="/city/${c.id}/attractions.html">景点</a></li>
    <li><a href="/city/${c.id}/food.html" class="active">美食</a></li>
    <li><a href="/city/${c.id}/guide.html">攻略</a></li>
    <li><a href="/city/${c.id}/itinerary.html">行程</a></li>
    <li><a href="/city/${c.id}/blog.html">博客</a></li>
  </ul>
  <a href="/city/${c.id}/itinerary.html" class="nav-cta">免费规划行程 →</a>
  <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
</div></nav>

<main style="max-width:960px;margin:0 auto;padding:100px 24px 60px">
  <nav style="font-size:.875rem;color:#6B6155;margin-bottom:24px"><a href="/city/${c.id}/" style="color:#BD4B2B">首页</a> / <span>美食攻略</span></nav>
  <h1 style="font-size:2.2rem;font-weight:800;margin-bottom:8px">🍜 ${c.name}美食攻略</h1>
  <p style="color:#8A7E6E;margin-bottom:40px;font-size:1.05rem">${c.name}必吃美食，特色小吃一网打尽</p>
  ${(c.food || []).map(f => `
  <div style="background:#fff;border-radius:16px;overflow:hidden;margin-bottom:20px;border:1px solid #E9E1D6;transition:all .25s" onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow=''">
    ${f.image ? `<div style="height:200px;overflow:hidden"><img src="${f.image}" alt="${f.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block"></div>` : `<div style="height:200px;display:flex;align-items:center;justify-content:center;font-size:3.5rem;background:#F3EEE7">${f.icon}</div>`}
    <div style="padding:28px">
    <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:8px">${f.icon} ${f.name}</h3>
    <p style="color:#6B6155;line-height:1.8;margin-bottom:8px">${f.desc}</p>
    ${f.tip ? '<p style="font-size:.85rem;color:#B8AB99">💡 '+f.tip+'</p>' : ''}
    </div>
  </div>`).join('')}
</main>

<footer class="footer"><div class="footer-inner"><p>© 2026 ${c.name}旅游官网 · <a href="/city/${c.id}/">返回首页</a></p><p style="font-size:.8rem;color:#B8AB99;margin-top:6px">图片来源：Wikimedia Commons（CC BY / CC BY-SA）</p></div></footer>
<script>
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
(function(){if(!('IntersectionObserver'in window))return;var d=document.documentElement;d.classList.add('reveal-ready');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)})})();
document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});
${citySelectorJS}
</script>
</body>
</html>`;
}

// ===== 攻略页模板 =====
function generateGuide(city) {
  const c = city;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoHead({
  title: `${c.name}旅游攻略 - 交通/住宿/最佳时间`,
  description: `${c.name}旅游全攻略：交通指南、住宿推荐、最佳旅游时间、行程规划。`,
  keywords: [`${c.name}旅游攻略`, `${c.name}交通`, `${c.name}住宿`, `${c.name}最佳时间`],
  url: `${SITE}/city/${c.id}/guide.html`,
  image: (c.attractions && c.attractions[0]) ? c.attractions[0].image : '',
  type: 'website',
  jsonLd: [
    breadcrumb([['首页', `/city/${c.id}/`], [`${c.name}攻略`, `/city/${c.id}/guide.html`]]),
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": `${c.name}最佳旅游时间是什么时候？`, "acceptedAnswer": { "@type": "Answer", "text": c.bestSeason || "四季皆宜，具体视景点而定。" } },
        { "@type": "Question", "name": `${c.name}建议玩几天？`, "acceptedAnswer": { "@type": "Answer", "text": `建议游玩 ${c.suggestedDays}。${c.climate ? "当地气候：" + c.climate : ""}` } },
        { "@type": "Question", "name": `${c.name}有哪些必去景点？`, "acceptedAnswer": { "@type": "Answer", "text": (c.attractions || []).slice(0, 5).map(a => a.name).join("、") } }
      ]
    }
  ]
})}

<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>${citySelectorCSS}</style>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner">
  ${citySelector(c.id)}
  <ul class="nav-links" id="navLinks">
    <li><a href="/city/${c.id}/">首页</a></li>
    <li><a href="/city/${c.id}/attractions.html">景点</a></li>
    <li><a href="/city/${c.id}/food.html">美食</a></li>
    <li><a href="/city/${c.id}/guide.html" class="active">攻略</a></li>
    <li><a href="/city/${c.id}/itinerary.html">行程</a></li>
    <li><a href="/city/${c.id}/blog.html">博客</a></li>
  </ul>
  <a href="/city/${c.id}/itinerary.html" class="nav-cta">免费规划行程 →</a>
  <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
</div></nav>

<main style="max-width:960px;margin:0 auto;padding:100px 24px 60px">
  <nav style="font-size:.875rem;color:#6B6155;margin-bottom:24px"><a href="/city/${c.id}/" style="color:#BD4B2B">首页</a> / <span>旅游攻略</span></nav>
  <h1 style="font-size:2.2rem;font-weight:800;margin-bottom:8px">📋 ${c.name}旅游攻略</h1>
  <p style="color:#8A7E6E;margin-bottom:40px;font-size:1.05rem">${c.description}</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">
    ${(c.guide || []).map(g => `
    <div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #E9E1D6">
      <h3 style="font-size:1.15rem;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">${g.icon} ${g.title}</h3>
      <div style="color:#6B6155;line-height:1.8;font-size:.95rem">${g.content}</div>
    </div>`).join('')}
  </div>
</main>

<footer class="footer"><div class="footer-inner"><p>© 2026 ${c.name}旅游官网 · <a href="/city/${c.id}/">返回首页</a></p><p style="font-size:.8rem;color:#B8AB99;margin-top:6px">图片来源：Wikimedia Commons（CC BY / CC BY-SA）</p></div></footer>
<script>
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
(function(){if(!('IntersectionObserver'in window))return;var d=document.documentElement;d.classList.add('reveal-ready');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)})})();
document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});
${citySelectorJS}
</script>
</body>
</html>`;
}

// ===== 行程页模板 =====
function generateItinerary(city) {
  const c = city;
  const days = parseInt(c.suggestedDays) || 3;
  const dayPlans = (c.itinerary || []).length > 0 ? c.itinerary : [
    {day:1, title:'抵达 + 市区游览', items:['抵达'+c.name, '入住酒店', '市区闲逛', '品尝当地美食']},
    {day:2, title:'核心景点', items:(c.attractions||[]).slice(0,3).map(a=>a.name)},
    {day:3, title:'深度体验', items:(c.attractions||[]).slice(3,6).map(a=>a.name)},
  ];
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoHead({
  title: `${c.name}行程规划 - ${c.name}${days}日游攻略`,
  description: `${c.name}${days}日游行程规划，合理安排时间，不错过任何精彩景点。`,
  keywords: [`${c.name}行程`, `${c.name}旅游攻略`, `${c.name}${days}日游`],
  url: `${SITE}/city/${c.id}/itinerary.html`,
  image: (c.attractions && c.attractions[0]) ? c.attractions[0].image : '',
  type: 'website',
  jsonLd: breadcrumb([['首页', `/city/${c.id}/`], [`${c.name}行程`, `/city/${c.id}/itinerary.html`]])
})}

<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>${citySelectorCSS}
.day-tabs{display:flex;gap:8px;margin-bottom:32px;flex-wrap:wrap;justify-content:center}
.day-tab{padding:10px 24px;border-radius:var(--radius-full);font-weight:600;font-size:.92rem;cursor:pointer;transition:all var(--dur) var(--ease-out);border:2px solid var(--border);background:#fff;color:var(--text-secondary)}
.day-tab:hover{border-color:var(--brand);color:var(--brand)}
.day-tab.active{background:var(--brand);color:#fff;border-color:var(--brand)}
.day-panel{display:none}.day-panel.active{display:block;animation:fadeIn .4s}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner">
  ${citySelector(c.id)}
  <ul class="nav-links" id="navLinks">
    <li><a href="/city/${c.id}/">首页</a></li>
    <li><a href="/city/${c.id}/attractions.html">景点</a></li>
    <li><a href="/city/${c.id}/food.html">美食</a></li>
    <li><a href="/city/${c.id}/guide.html">攻略</a></li>
    <li><a href="/city/${c.id}/itinerary.html" class="active">行程</a></li>
    <li><a href="/city/${c.id}/blog.html">博客</a></li>
  </ul>
  <a href="/city/${c.id}/itinerary.html" class="nav-cta">免费规划行程 →</a>
  <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
</div></nav>

<main style="max-width:800px;margin:0 auto;padding:100px 24px 60px">
  <h1 style="font-size:2.2rem;font-weight:800;margin-bottom:8px;text-align:center">🗺️ ${c.name}行程规划</h1>
  <p style="color:#8A7E6E;margin-bottom:36px;text-align:center;font-size:1.05rem">建议游玩 ${c.suggestedDays}，以下是推荐行程</p>
  <div class="day-tabs">
    ${dayPlans.map((d,i)=>`<div class="day-tab${i===0?' active':''}" onclick="showDay(${i})">第${d.day}天</div>`).join('')}
  </div>
  ${dayPlans.map((d,i)=>`
  <div class="day-panel${i===0?' active':''}" id="day-${i}">
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #E9E1D6">
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:16px">第${d.day}天：${d.title}</h2>
      <ul style="list-style:none;padding:0">
        ${d.items.map(item=>`<li style="padding:12px 0;border-bottom:1px solid #F3EEE7;display:flex;align-items:center;gap:12px"><span style="width:8px;height:8px;background:var(--brand);border-radius:50%;flex-shrink:0"></span>${item}</li>`).join('')}
      </ul>
    </div>
  </div>`).join('')}
</main>

<footer class="footer"><div class="footer-inner"><p>© 2026 ${c.name}旅游官网 · <a href="/city/${c.id}/">返回首页</a></p><p style="font-size:.8rem;color:#B8AB99;margin-top:6px">图片来源：Wikimedia Commons（CC BY / CC BY-SA）</p></div></footer>
<script>
function showDay(n){document.querySelectorAll('.day-tab').forEach((t,i)=>{t.classList.toggle('active',i===n)});document.querySelectorAll('.day-panel').forEach((p,i)=>{p.classList.toggle('active',i===n)})}
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
(function(){if(!('IntersectionObserver'in window))return;var d=document.documentElement;d.classList.add('reveal-ready');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)})})();
document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});
${citySelectorJS}
</script>
</body>
</html>`;
}

// ===== 博客页模板 =====
function generateBlog(city) {
  const c = city;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoHead({
  title: `${c.name}旅游博客 - ${c.name}攻略分享`,
  description: `${c.name}旅游攻略分享，最新${c.name}旅游资讯、游记、攻略。`,
  keywords: [`${c.name}博客`, `${c.name}游记`, `${c.name}旅游`, `${c.name}攻略`],
  url: `${SITE}/city/${c.id}/blog.html`,
  image: (c.attractions && c.attractions[0]) ? c.attractions[0].image : '',
  type: 'website',
  jsonLd: breadcrumb([['首页', `/city/${c.id}/`], [`${c.name}博客`, `/city/${c.id}/blog.html`]])
})}

<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>${citySelectorCSS}</style>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner">
  ${citySelector(c.id)}
  <ul class="nav-links" id="navLinks">
    <li><a href="/city/${c.id}/">首页</a></li>
    <li><a href="/city/${c.id}/attractions.html">景点</a></li>
    <li><a href="/city/${c.id}/food.html">美食</a></li>
    <li><a href="/city/${c.id}/guide.html">攻略</a></li>
    <li><a href="/city/${c.id}/itinerary.html">行程</a></li>
    <li><a href="/city/${c.id}/blog.html" class="active">博客</a></li>
  </ul>
  <a href="/city/${c.id}/itinerary.html" class="nav-cta">免费规划行程 →</a>
  <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
</div></nav>

<main style="max-width:960px;margin:0 auto;padding:100px 24px 60px">
  <h1 style="font-size:2.2rem;font-weight:800;margin-bottom:8px">📝 ${c.name}旅游博客</h1>
  <p style="color:#8A7E6E;margin-bottom:40px;font-size:1.05rem">${c.name}旅游攻略、游记、实用信息</p>
  ${(c.blogs || []).length > 0 ? c.blogs.map(b => `
  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #E9E1D6;transition:all .2s;cursor:pointer" onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow=''">
    <h3 style="font-weight:700;margin-bottom:6px"><a href="blog/${b.slug}.html" style="color:inherit">${b.title}</a></h3>
    <p style="font-size:.9rem;color:#8A7E6E">${b.excerpt || ''}</p>
    <div style="font-size:.8rem;color:#B8AB99;margin-top:8px">📅 ${b.date || '2026'}</div>
  </div>`).join('') : '<div style="text-align:center;padding:60px;color:#B8AB99"><p>博客内容即将上线，敬请期待！</p></div>'}
</main>

<footer class="footer"><div class="footer-inner"><p>© 2026 ${c.name}旅游官网 · <a href="/city/${c.id}/">返回首页</a></p><p style="font-size:.8rem;color:#B8AB99;margin-top:6px">图片来源：Wikimedia Commons（CC BY / CC BY-SA）</p></div></footer>
<script>
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
(function(){if(!('IntersectionObserver'in window))return;var d=document.documentElement;d.classList.add('reveal-ready');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)})})();
document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});
${citySelectorJS}
</script>
</body>
</html>`;
}

// ===== 博客详情页模板（修复旧版绝对路径死链；统一暖陶土风格 + 子路径安全） =====
function generateBlogDetail(city, blog, idx) {
  const c = city;
  const heroImg = (c.attractions && c.attractions[0] && c.attractions[0].image) ? c.attractions[0].image : '';
  const heroBg = heroImg ? 'url(' + heroImg + ') center/cover' : 'linear-gradient(135deg,#BD4B2B,#8F3517)';
  const excerpt = blog.excerpt || '';
  const date = blog.date || '2026';
  const bodyHTML = excerpt
    ? '<p class="blog-lead">' + excerpt + '</p><div class="blog-note">📝 这篇游记的完整正文正在精心整理中。先看看 <a href="../guide.html">' + c.name + '游玩攻略</a> 或 <a href="../itinerary.html">' + c.name + '行程规划</a>，获取实用信息。</div>'
    : '<div class="blog-note">正文即将上线，敬请期待。</div>';
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoHead({
  title: `${blog.title} - ${c.name}旅游博客`,
  description: excerpt || `${blog.title} — ${c.name}旅游博客分享。`,
  keywords: [blog.title, `${c.name}旅游`, `${c.name}博客`],
  url: `${SITE}/city/${c.id}/blog/${blog.slug}.html`,
  image: heroImg || '',
  type: 'article',
  jsonLd: [
    {
      "@context": "https://schema.org", "@type": "BlogPosting",
      "headline": blog.title,
      "description": excerpt || blog.title,
      "image": heroImg ? `${SITE}${heroImg}` : '',
      "datePublished": String(blog.date || "2026-01-01"),
      "dateModified": String(blog.date || "2026-01-01"),
      "author": { "@type": "Organization", "name": "全国旅游攻略" },
      "publisher": { "@type": "Organization", "name": "全国旅游攻略", "logo": { "@type": "ImageObject", "url": `${SITE}/assets/favicon.svg` } },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE}/city/${c.id}/blog/${blog.slug}.html` },
      "articleSection": c.name + "旅游"
    },
    breadcrumb([['首页', '/'], [c.name, `/city/${c.id}/`], [`${c.name}博客`, `/city/${c.id}/blog.html`], [blog.title, `/city/${c.id}/blog/${blog.slug}.html`]])
  ]
})}

<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>${citySelectorCSS}
.blog-hero{position:relative;background:${heroBg};color:#fff;padding:120px 24px 56px;text-align:center;overflow:hidden}
.blog-hero::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,32,39,.55),rgba(15,32,39,.8))}
.blog-hero>*{position:relative;z-index:1}
.blog-hero .bprov{font-size:.8rem;letter-spacing:.15em;opacity:.85}
.blog-hero h1{font-size:clamp(1.6rem,4vw,2.4rem);font-weight:800;margin:10px 0 8px;text-shadow:0 2px 12px rgba(0,0,0,.4)}
.blog-hero .bdate{font-size:.85rem;opacity:.7}
.blog-main{max-width:760px;margin:0 auto;padding:48px 24px 60px}
.blog-lead{font-size:1.1rem;line-height:1.9;color:#4A423A;margin-bottom:24px}
.blog-note{background:#FBF8F4;border:1px solid #E9E1D6;border-left:4px solid #BD4B2B;border-radius:10px;padding:18px 20px;color:#6B6155;font-size:.95rem;line-height:1.8}
.blog-note a{color:#BD4B2B;font-weight:600}
.blog-back{display:inline-block;margin-top:28px;color:#BD4B2B;font-weight:600;text-decoration:none}
</style>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner">
  ${citySelector(c.id)}
  <ul class="nav-links" id="navLinks">
    <li><a href="/city/${c.id}/">首页</a></li>
    <li><a href="/city/${c.id}/attractions.html">景点</a></li>
    <li><a href="/city/${c.id}/food.html">美食</a></li>
    <li><a href="/city/${c.id}/guide.html">攻略</a></li>
    <li><a href="/city/${c.id}/itinerary.html">行程</a></li>
    <li><a href="/city/${c.id}/blog.html" class="active">博客</a></li>
  </ul>
  <a href="/city/${c.id}/itinerary.html" class="nav-cta">免费规划行程 →</a>
  <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
</div></nav>
<header class="blog-hero">
  <div class="bprov">${c.name} · 旅行博客</div>
  <h1>${blog.title}</h1>
  <div class="bdate">📅 ${date}</div>
</header>
<main class="blog-main reveal">
  ${bodyHTML}
  <a class="blog-back" href="../blog.html">← 返回 ${c.name}博客列表</a>
</main>
<footer class="footer"><div class="footer-inner"><p>© 2026 ${c.name}旅游官网 · <a href="/city/${c.id}/">返回首页</a></p><p style="font-size:.8rem;color:#B8AB99;margin-top:6px">图片来源：Wikimedia Commons（CC BY / CC BY-SA）</p></div></footer>
<script>
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
(function(){if(!('IntersectionObserver'in window))return;var d=document.documentElement;d.classList.add('reveal-ready');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)})})();
document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});
${citySelectorJS}
</script>
</body>
</html>`;
}

// ===== 主入口 =====
for (const city of data.cities) {
  const cityDir = path.join(ROOT, 'city', city.id);
  fs.mkdirSync(cityDir, { recursive: true });
  
  writeHtml(`city/${city.id}/index.html`, generateIndex(city));
  writeHtml(`city/${city.id}/attractions.html`, generateAttractions(city));
  writeHtml(`city/${city.id}/food.html`, generateFood(city));
  writeHtml(`city/${city.id}/guide.html`, generateGuide(city));
  writeHtml(`city/${city.id}/itinerary.html`, generateItinerary(city));
  writeHtml(`city/${city.id}/blog.html`, generateBlog(city));

  const blogDir = path.join(cityDir, 'blog');
  fs.rmSync(blogDir, { recursive: true, force: true });
  fs.mkdirSync(blogDir, { recursive: true });
  (city.blogs || []).forEach((b, i) => {
    writeHtml(`city/${city.id}/blog/${b.slug}.html`, generateBlogDetail(city, b, i));
  });

  const attDir = path.join(cityDir, 'attraction');
  fs.mkdirSync(attDir, { recursive: true });
  (city.attractions || []).forEach((a, i) => {
    writeHtml(`city/${city.id}/attraction/${i}.html`, generateAttractionDetail(city, a, i));
  });

  console.log(`✅ ${city.name}: 6个页面 + ${ (city.attractions||[]).length }个景点详情 → city/${city.id}/`);
}

// 生成根目录 index.html（按大区 > 省份 分组 + 编辑精选）
// 注意：根页使用「根相对路径」(无前导 /)，确保 GitHub Pages 子路径 /all-lv 下也能正确解析
const REGION_MAP = {
  '华北': ['北京','天津','河北','山西','内蒙古'],
  '东北': ['辽宁','吉林','黑龙江'],
  '华东': ['上海','江苏','浙江','安徽','福建','江西','山东','中国台湾'],
  '华中': ['河南','湖北','湖南'],
  '华南': ['广东','广西','海南','香港','澳门'],
  '西南': ['重庆','四川','贵州','云南','西藏'],
  '西北': ['陕西','甘肃','青海','宁夏','新疆'],
};
const REGION_ORDER = ['华北','东北','华东','华中','华南','西南','西北'];
const REGION_DESC = {
  '华北':'帝都风骨 · 草原长歌',
  '东北':'白山黑水 · 冰雪林海',
  '华东':'江南烟雨 · 海派繁华',
  '华中':'楚风豫韵 · 山水相依',
  '华南':'热带海岸 · 岭南风情',
  '西南':'秘境高原 · 多彩民族',
  '西北':'大漠孤烟 · 千年丝路',
};
const provinces2 = groupByProvince();
// 编辑精选 6 城（按名称匹配，缺失自动跳过）
const FEATURED = ['北京','西安','成都','杭州','三亚','丽江'];
const featuredCities = FEATURED.map(n => data.cities.find(c => c.name === n)).filter(Boolean);

function cityCardHTML(c) {
  const img = (c.attractions && c.attractions[0] && c.attractions[0].image)
    ? `<img class="thumb" src="${c.attractions[0].image}" alt="${c.name}风光实景" loading="lazy">`
    : `<div class="emoji-fallback">${c.emoji}</div>`;
  return `<a href="city/${c.id}/" class="city-card reveal">${img}<div class="info"><h3>${c.name}</h3><p>${c.tagline}</p></div></a>`;
}

const regionNav = REGION_ORDER.map(r => `<a href="#region-${r}" class="region-chip">${r}</a>`).join('');

const featuredHTML = featuredCities.map(c => {
  const img = (c.attractions && c.attractions[0] && c.attractions[0].image)
    ? `<img class="fthumb" src="${c.attractions[0].image}" alt="${c.name}风光实景" loading="lazy">`
    : `<div class="fthumb emoji-fallback">${c.emoji}</div>`;
  return `<a href="city/${c.id}/" class="featured-card reveal">${img}<div class="finfo"><span class="fprov">${c.province}</span><h3>${c.name}</h3><p>${c.tagline}</p></div></a>`;
}).join('');

let regionHTML = '';
for (const region of REGION_ORDER) {
  const provsInRegion = REGION_MAP[region].filter(p => provinces2[p]);
  if (provsInRegion.length === 0) continue;
  let inner = '';
  for (const p of provsInRegion) {
    inner += `<div class="province-block"><h3 class="province-title">${p}</h3><div class="city-cards">${provinces2[p].map(cityCardHTML).join('')}</div></div>`;
  }
  regionHTML += `<section class="region-section" id="region-${region}"><div class="region-head"><h2 class="region-title">${region}</h2><span class="region-desc">${REGION_DESC[region]}</span></div>${inner}</section>`;
}

const rootIndex = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoHead({
  title: `全国旅游攻略 — 发现中国最美目的地`,
  description: `全国旅游攻略，精选中国 41 个热门城市，景点、美食、行程、攻略一站搞定。`,
  keywords: ['全国旅游', '中国旅游', '旅游攻略', '热门城市', '景点推荐'],
  url: `${SITE}/`,
  image: 'assets/images/hero.webp',
  type: 'website',
  jsonLd: [
    {
      "@context": "https://schema.org", "@type": "WebSite",
      "name": "全国旅游攻略", "url": `${SITE}/`,
      "description": "精选中国热门城市的旅游攻略，覆盖景点、美食、行程与实用指南。",
      "potentialAction": { "@type": "SearchAction", "target": `${SITE}/?s={search_term_string}`, "query-input": "required name=search_term_string" }
    },
    breadcrumb([['首页', '/']]),
    {
      "@context": "https://schema.org", "@type": "ItemList",
      "name": "中国热门旅游城市",
      "itemListElement": data.cities.slice(0, 20).map((ct, i) => ({
        "@type": "ListItem", "position": i + 1,
        "name": ct.name, "url": `${SITE}/city/${ct.id}/`
      }))
    }
  ]
})}

<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="stylesheet" href="style.css">
<style>
.hero-picker{position:relative;background-image:url(assets/images/hero.webp);background-size:cover;background-position:center;color:#fff;padding:120px 24px 64px;text-align:center;overflow:hidden}
.hero-picker::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,32,39,.62) 0%,rgba(15,32,39,.38) 45%,rgba(15,32,39,.78) 100%)}
.hero-picker>*{position:relative;z-index:1}
.hero-eyebrow{display:inline-block;font-size:.78rem;letter-spacing:.14em;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);padding:6px 14px;border-radius:999px;margin-bottom:18px;backdrop-filter:blur(4px)}
.region-nav{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:26px}
.region-chip{color:#fff;text-decoration:none;font-size:.9rem;padding:7px 16px;border:1px solid rgba(255,255,255,.35);border-radius:999px;transition:all .2s;backdrop-filter:blur(4px)}
.region-chip:hover{background:#BD4B2B;border-color:#BD4B2B;transform:translateY(-2px)}
.featured-section{max-width:1100px;margin:0 auto;padding:48px 24px 8px}
.section-head{display:flex;align-items:baseline;gap:12px;margin-bottom:20px}
.section-title{font-size:1.5rem;font-weight:700;color:#211C18;margin:0}
.section-sub{font-size:.85rem;color:#8A7E6E}
.featured-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
.featured-card{display:block;position:relative;height:200px;border-radius:16px;overflow:hidden;text-decoration:none;color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.12);transition:all .28s}
.featured-card:hover{transform:translateY(-4px);box-shadow:0 14px 34px rgba(189,75,43,.3)}
.featured-card .fthumb{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.featured-card .fthumb.emoji-fallback{display:flex;align-items:center;justify-content:center;font-size:3.4rem;background:linear-gradient(135deg,#BD4B2B,#2E7D5B)}
.featured-card .finfo{position:absolute;inset:auto 0 0 0;padding:16px;background:linear-gradient(180deg,transparent,rgba(15,32,39,.85));z-index:1}
.featured-card .fprov{font-size:.72rem;letter-spacing:.1em;opacity:.85}
.featured-card .finfo h3{font-size:1.25rem;font-weight:700;margin:2px 0}
.featured-card .finfo p{font-size:.8rem;opacity:.85;margin:0}
.region-section{max-width:1100px;margin:0 auto;padding:36px 24px 0;scroll-margin-top:80px}
.region-head{display:flex;align-items:baseline;gap:12px;margin-bottom:18px;padding-bottom:10px;border-bottom:2px solid #E9E1D6}
.region-title{font-size:1.4rem;font-weight:700;color:#BD4B2B;margin:0}
.region-desc{font-size:.85rem;color:#8A7E6E}
.province-block{margin-bottom:26px}
.province-title{font-size:1.05rem;font-weight:700;color:#4A423A;margin-bottom:12px}
.city-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
.city-card{display:block;padding:0;background:#fff;border:1px solid #E9E1D6;border-radius:12px;overflow:hidden;transition:all .25s;cursor:pointer;color:#211C18;text-decoration:none}
.city-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.1);border-color:#DAD0C2}
.city-card .thumb{width:100%;height:140px;object-fit:cover;display:block;background:#F3EEE7}
.city-card .emoji-fallback{width:100%;height:140px;display:flex;align-items:center;justify-content:center;font-size:3rem;background:linear-gradient(135deg,#BD4B2B 0%,#2E7D5B 100%)}
.city-card .info{padding:14px 16px}
.city-card .info h3{font-size:1.05rem;font-weight:700;margin-bottom:2px}
.city-card .info p{font-size:.82rem;color:#8A7E6E}
.main-content{padding-bottom:60px}
.footer-simple{text-align:center;padding:40px 24px;color:#B8AB99;font-size:.85rem;border-top:1px solid #E9E1D6}
@media (max-width:640px){.featured-strip{grid-template-columns:1fr 1fr}.city-cards{grid-template-columns:1fr 1fr}.hero-picker{padding:90px 18px 48px}}
</style>
</head>
<body>
<div class="hero-picker">
  <span class="hero-eyebrow">中国 · ${data.cities.length} 城 · 精选旅行攻略</span>
  <h1 style="font-size:clamp(2rem,5vw,3rem);font-weight:900;margin-bottom:8px;text-shadow:0 2px 12px rgba(0,0,0,.45)">全国旅游攻略</h1>
  <p style="font-size:1.1rem;opacity:.9;margin-bottom:6px">发现中国最美目的地</p>
  <p style="font-size:.9rem;opacity:.65;margin-bottom:4px">景点 · 美食 · 行程，一站规划</p>
  <p style="font-size:.85rem;opacity:.6">${Object.keys(provinces2).length} 个省级行政区 · ${data.cities.length} 座城市</p>
  <nav class="region-nav">${regionNav}</nav>
</div>
<main class="main-content">
  <section class="featured-section">
    <div class="section-head"><h2 class="section-title">编辑精选</h2><span class="section-sub">最值得出发的 ${featuredCities.length} 个目的地</span></div>
    <div class="featured-strip">${featuredHTML}</div>
  </section>
  ${regionHTML}
</main>
<footer class="footer-simple">
  <p>© 2026 全国旅游攻略 · <a href="sitemap.xml">网站地图</a></p>
  <p style="font-size:.8rem;opacity:.8;margin-top:6px">图片来源：Wikimedia Commons（CC BY / CC BY-SA）</p>
</footer>
<script>
window.addEventListener('scroll',function(){var n=document.getElementById('navbar');if(n)n.classList.toggle('scrolled',window.scrollY>20)});
(function(){if(!('IntersectionObserver'in window))return;var d=document.documentElement;d.classList.add('reveal-ready');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)})})();
</script>
</body>
</html>`;
writeHtml('index.html', rootIndex);
console.log(`✅ 首页: index.html`);
console.log('\n🎉 全部完成！');
