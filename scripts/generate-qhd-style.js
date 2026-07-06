#!/usr/bin/env node
/**
 * 全国旅游页面生成器 — 复用秦皇岛旅游官网设计
 * 每个城市生成完整页面套件，左上角可切换城市
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.all-lv.com';
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cities.json'), 'utf8'));

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
.city-dropdown{display:none;position:absolute;top:calc(100% + 8px);left:0;width:320px;max-height:70vh;background:#fff;border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,0.18);border:1px solid #e2e8f0;z-index:999;overflow:hidden}
.city-dropdown.open{display:flex;flex-direction:column}
@keyframes dropdownIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.city-dropdown-header{padding:14px 16px 10px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.city-dropdown-title{font-size:.8rem;color:#1a1a2e;font-weight:700}
.city-dropdown-count{font-size:.7rem;color:#94a3b8;background:#f1f5f9;padding:2px 8px;border-radius:10px}
.city-dropdown-body{overflow-y:auto;padding:8px 0;flex:1}
.province-group{margin-bottom:4px}
.province-label{padding:8px 16px 4px;font-size:.7rem;color:#94a3b8;font-weight:700;letter-spacing:.5px;position:sticky;top:0;background:#fff;z-index:1}
.city-option{display:flex;align-items:center;gap:8px;padding:8px 16px;font-size:.88rem;color:#1a1a2e;transition:background .15s;text-decoration:none}
.city-option:hover{background:#f1f5f9}
.city-option.active{background:#eff6ff;color:#1a73e8;font-weight:600}
.city-option.active::before{content:"✓";font-size:.75rem;color:#1a73e8;margin-right:-4px}
.navbar.scrolled .city-selector-btn{background:rgba(0,0,0,0.06);border-color:#e2e8f0;color:#1a1a2e}
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
<title>${c.name}旅游官网 — ${c.tagline} | 2026攻略</title>
<meta name="description" content="${c.name}旅游官网 · 2026最新攻略。${c.description}">
<meta name="keywords" content="${c.keywords.join(',')}">
<meta name="author" content="${c.name}旅游官网">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${SITE}/city/${c.id}/">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#1a73e8">
<meta property="og:title" content="${c.name}旅游官网 — ${c.tagline}">
<meta property="og:description" content="${c.description}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}/city/${c.id}/">
<meta property="og:site_name" content="${c.name}旅游官网">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebSite","name":"${c.name}旅游官网","url":"${SITE}/city/${c.id}/","description":"${c.description}",
"potentialAction":{"@type":"SearchAction","target":"${SITE}/city/${c.id}/guide?q={search_term_string}","query-input":"required name=search_term_string"}}
</script>
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>${citySelectorCSS}
.hero-full{min-height:100vh;display:flex;align-items:center;position:relative;overflow:hidden;background:linear-gradient(135deg,${c.color||'#0d47a1'} 0%,${c.color||'#1a73e8'}88 100%)}
.hero-overlay{position:absolute;inset:0;z-index:1;background:linear-gradient(135deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.3) 100%)}
.hero-grid{max-width:var(--max-width);margin:0 auto;width:100%;position:relative;z-index:2;padding:120px 24px 80px;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.city-intro{padding:100px 24px;background:#fff}
.city-grid{max-width:var(--max-width);margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.attractions-preview{padding:100px 24px;background:var(--gray-50)}
.attractions-grid{max-width:var(--max-width);margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
@media(max-width:768px){.hero-grid,.city-grid{grid-template-columns:1fr}.attractions-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<!-- 导航栏 -->
<nav class="navbar" id="navbar">
  <div class="nav-inner">
    ${citySelector(c.id)}
    <ul class="nav-links" id="navLinks">
      <li><a href="/city/${c.id}/" class="active">首页</a></li>
      <li><a href="/city/${c.id}/attractions">景点</a></li>
      <li><a href="/city/${c.id}/food">美食</a></li>
      <li><a href="/city/${c.id}/guide">攻略</a></li>
      <li><a href="/city/${c.id}/itinerary">行程</a></li>
      <li><a href="/city/${c.id}/blog">博客</a></li>
    </ul>
    <a href="/city/${c.id}/itinerary" class="nav-cta">免费规划行程 <span class="nav-cta-arrow">→</span></a>
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
        <a href="/city/${c.id}/itinerary" class="btn btn-white" style="font-size:1rem;padding:14px 28px">🗺️ 智能规划行程</a>
        <a href="/city/${c.id}/attractions" class="btn btn-outline-white" style="font-size:1rem;padding:14px 28px">🏔️ 探索景点</a>
      </div>
    </div>
    <div style="text-align:center;font-size:8rem;filter:drop-shadow(0 8px 32px rgba(0,0,0,0.3))">${c.emoji}</div>
  </div>
</section>

<!-- 城市简介 -->
<section class="city-intro">
  <div class="city-grid">
    <div>
      <h2 style="font-size:2rem;font-weight:800;margin-bottom:16px">关于${c.name}</h2>
      <p style="font-size:1.05rem;line-height:1.9;color:#475569;margin-bottom:24px">${c.description}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div style="padding:16px;background:var(--gray-50);border-radius:12px"><div style="font-size:1.5rem;margin-bottom:4px">📅</div><div style="font-weight:600">最佳时间</div><div style="font-size:.9rem;color:#64748b">${c.bestSeason}</div></div>
        <div style="padding:16px;background:var(--gray-50);border-radius:12px"><div style="font-size:1.5rem;margin-bottom:4px">⏱️</div><div style="font-weight:600">建议天数</div><div style="font-size:.9rem;color:#64748b">${c.suggestedDays}</div></div>
        <div style="padding:16px;background:var(--gray-50);border-radius:12px"><div style="font-size:1.5rem;margin-bottom:4px">📍</div><div style="font-weight:600">省份</div><div style="font-size:.9rem;color:#64748b">${c.province}</div></div>
        <div style="padding:16px;background:var(--gray-50);border-radius:12px"><div style="font-size:1.5rem;margin-bottom:4px">🌤️</div><div style="font-weight:600">气候</div><div style="font-size:.9rem;color:#64748b">${c.climate || '详见攻略'}</div></div>
      </div>
    </div>
    <div style="font-size:10rem;text-align:center;opacity:.15">${c.emoji}</div>
  </div>
</section>

<!-- 热门景点 -->
<section class="attractions-preview">
  <div style="text-align:center;margin-bottom:48px">
    <h2 style="font-size:2rem;font-weight:800;margin-bottom:8px">🏔️ 热门景点</h2>
    <p style="color:#64748b">${c.name}最值得去的地方</p>
  </div>
  <div class="attractions-grid">
    ${(c.attractions || []).slice(0, 6).map(a => `
    <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;transition:all .25s;cursor:pointer" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 32px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
      <div style="height:160px;background:linear-gradient(135deg,${c.color||'#1a73e8'}44 0%,${c.color||'#1a73e8'}22 100%);display:flex;align-items:center;justify-content:center;font-size:3.5rem">${a.icon}</div>
      <div style="padding:20px">
        <h3 style="font-weight:700;margin-bottom:6px">${a.name}</h3>
        <p style="font-size:.9rem;color:#64748b;line-height:1.6">${a.desc.slice(0, 60)}...</p>
        <div style="margin-top:12px;display:flex;gap:12px;font-size:.8rem;color:#94a3b8">
          ${a.ticket ? '<span>🎫 '+a.ticket+'</span>' : ''}
          ${a.time ? '<span>⏱️ '+a.time+'</span>' : ''}
        </div>
      </div>
    </div>`).join('')}
  </div>
  <div style="text-align:center;margin-top:36px">
    <a href="/city/${c.id}/attractions" class="btn btn-primary" style="padding:12px 32px">查看全部景点 →</a>
  </div>
</section>

<!-- 美食推荐 -->
<section style="padding:100px 24px;background:#fff">
  <div style="text-align:center;margin-bottom:48px">
    <h2 style="font-size:2rem;font-weight:800;margin-bottom:8px">🍜 必吃美食</h2>
    <p style="color:#64748b">${c.name}特色美食推荐</p>
  </div>
  <div style="max-width:var(--max-width);margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px">
    ${(c.food || []).slice(0, 4).map(f => `
    <div style="padding:24px;background:var(--gray-50);border-radius:14px;border:1px solid #e2e8f0">
      <div style="font-size:2rem;margin-bottom:8px">${f.icon}</div>
      <h3 style="font-weight:700;margin-bottom:6px">${f.name}</h3>
      <p style="font-size:.9rem;color:#64748b;line-height:1.6">${f.desc.slice(0, 80)}...</p>
    </div>`).join('')}
  </div>
  <div style="text-align:center;margin-top:36px">
    <a href="/city/${c.id}/food" class="btn btn-primary" style="padding:12px 32px">查看全部美食 →</a>
  </div>
</section>

<!-- 旅游攻略 -->
<section style="padding:100px 24px;background:var(--gray-50)">
  <div style="text-align:center;margin-bottom:48px">
    <h2 style="font-size:2rem;font-weight:800;margin-bottom:8px">📋 旅游攻略</h2>
    <p style="color:#64748b">交通·住宿·最佳时间·注意事项</p>
  </div>
  <div style="max-width:var(--max-width);margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px">
    ${(c.guide || []).map(g => `
    <div style="padding:28px;background:#fff;border-radius:14px;border:1px solid #e2e8f0">
      <div style="font-size:2rem;margin-bottom:12px">${g.icon}</div>
      <h3 style="font-weight:700;margin-bottom:8px">${g.title}</h3>
      <div style="font-size:.9rem;color:#475569;line-height:1.7">${g.content.replace(/<[^>]+>/g,'').slice(0,120)}...</div>
    </div>`).join('')}
  </div>
  <div style="text-align:center;margin-top:36px">
    <a href="/city/${c.id}/guide" class="btn btn-primary" style="padding:12px 32px">查看完整攻略 →</a>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-brand"><h3>${c.name}旅游官网</h3><p>致力于为每一位来${c.name}的游客，提供最实用、最全面的旅游攻略。</p></div>
      <div class="footer-col"><h4>热门页面</h4><a href="/city/${c.id}/">首页</a><a href="/city/${c.id}/attractions">景点推荐</a><a href="/city/${c.id}/food">美食推荐</a></div>
      <div class="footer-col"><h4>旅游攻略</h4><a href="/city/${c.id}/guide">出行指南</a><a href="/city/${c.id}/itinerary">行程规划</a><a href="/city/${c.id}/blog">旅游博客</a></div>
      <div class="footer-col"><h4>其他城市</h4>${data.cities.filter(x=>x.id!==c.id).slice(0,4).map(x=>`<a href="/city/${x.id}/">${x.name}</a>`).join('')}</div>
    </div>
    <div class="footer-bottom"><span>© 2026 全国旅游攻略</span><div><a href="/sitemap.xml">网站地图</a></div></div>
  </div>
</footer>
<script>
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
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
<title>${c.name}景点推荐 - ${c.name}旅游攻略</title>
<meta name="description" content="${c.name}最值得去的景点推荐：精选${c.name}必玩景点，附详细攻略、门票、交通信息。">
<meta name="keywords" content="${c.name}景点,${c.name}旅游,${c.name}攻略">
<link rel="canonical" href="${SITE}/city/${c.id}/attractions">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>${citySelectorCSS}</style>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
  {"@type":"ListItem","position":1,"name":"首页","item":"${SITE}/city/${c.id}/"},
  {"@type":"ListItem","position":2,"name":"景点","item":"${SITE}/city/${c.id}/attractions"}
]}
</script>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner">
  ${citySelector(c.id)}
  <ul class="nav-links" id="navLinks">
    <li><a href="/city/${c.id}/">首页</a></li>
    <li><a href="/city/${c.id}/attractions" class="active">景点</a></li>
    <li><a href="/city/${c.id}/food">美食</a></li>
    <li><a href="/city/${c.id}/guide">攻略</a></li>
    <li><a href="/city/${c.id}/itinerary">行程</a></li>
    <li><a href="/city/${c.id}/blog">博客</a></li>
  </ul>
  <a href="/city/${c.id}/itinerary" class="nav-cta">免费规划行程 →</a>
  <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
</div></nav>

<main style="max-width:960px;margin:0 auto;padding:100px 24px 60px">
  <nav style="font-size:.875rem;color:#6b7280;margin-bottom:24px"><a href="/city/${c.id}/" style="color:#1a73e8">首页</a> / <span>景点推荐</span></nav>
  <h1 style="font-size:2.2rem;font-weight:800;margin-bottom:8px">🏔️ ${c.name}景点推荐</h1>
  <p style="color:#64748b;margin-bottom:40px;font-size:1.05rem">${c.name}最值得去的景点，附门票和游玩建议</p>
  ${(c.attractions || []).map(a => `
  <div style="background:#fff;border-radius:16px;padding:28px;margin-bottom:20px;border:1px solid #e2e8f0;transition:all .2s" onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow=''">
    <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:8px">${a.icon} ${a.name}</h3>
    <p style="color:#475569;line-height:1.8;margin-bottom:12px">${a.desc}</p>
    <div style="display:flex;gap:20px;font-size:.85rem;color:#94a3b8;flex-wrap:wrap">
      ${a.ticket ? '<span>🎫 门票：'+a.ticket+'</span>' : ''}
      ${a.time ? '<span>⏱️ 游玩时间：'+a.time+'</span>' : ''}
    </div>
  </div>`).join('')}
</main>

<footer class="footer"><div class="footer-inner"><p>© 2026 ${c.name}旅游官网 · <a href="/city/${c.id}/">返回首页</a></p></div></footer>
<script>
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
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
<title>${c.name}美食攻略 - ${c.name}旅游</title>
<meta name="description" content="${c.name}必吃美食推荐：特色小吃、网红餐厅、本地人私藏好店。">
<link rel="canonical" href="${SITE}/city/${c.id}/food">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>${citySelectorCSS}</style>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner">
  ${citySelector(c.id)}
  <ul class="nav-links" id="navLinks">
    <li><a href="/city/${c.id}/">首页</a></li>
    <li><a href="/city/${c.id}/attractions">景点</a></li>
    <li><a href="/city/${c.id}/food" class="active">美食</a></li>
    <li><a href="/city/${c.id}/guide">攻略</a></li>
    <li><a href="/city/${c.id}/itinerary">行程</a></li>
    <li><a href="/city/${c.id}/blog">博客</a></li>
  </ul>
  <a href="/city/${c.id}/itinerary" class="nav-cta">免费规划行程 →</a>
  <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
</div></nav>

<main style="max-width:960px;margin:0 auto;padding:100px 24px 60px">
  <nav style="font-size:.875rem;color:#6b7280;margin-bottom:24px"><a href="/city/${c.id}/" style="color:#1a73e8">首页</a> / <span>美食攻略</span></nav>
  <h1 style="font-size:2.2rem;font-weight:800;margin-bottom:8px">🍜 ${c.name}美食攻略</h1>
  <p style="color:#64748b;margin-bottom:40px;font-size:1.05rem">${c.name}必吃美食，特色小吃一网打尽</p>
  ${(c.food || []).map(f => `
  <div style="background:#fff;border-radius:16px;padding:28px;margin-bottom:20px;border:1px solid #e2e8f0">
    <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:8px">${f.icon} ${f.name}</h3>
    <p style="color:#475569;line-height:1.8;margin-bottom:8px">${f.desc}</p>
    ${f.tip ? '<p style="font-size:.85rem;color:#94a3b8">💡 '+f.tip+'</p>' : ''}
  </div>`).join('')}
</main>

<footer class="footer"><div class="footer-inner"><p>© 2026 ${c.name}旅游官网 · <a href="/city/${c.id}/">返回首页</a></p></div></footer>
<script>
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
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
<title>${c.name}旅游攻略 - 交通/住宿/最佳时间</title>
<meta name="description" content="${c.name}旅游全攻略：交通指南、住宿推荐、最佳旅游时间、行程规划。">
<link rel="canonical" href="${SITE}/city/${c.id}/guide">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>${citySelectorCSS}</style>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner">
  ${citySelector(c.id)}
  <ul class="nav-links" id="navLinks">
    <li><a href="/city/${c.id}/">首页</a></li>
    <li><a href="/city/${c.id}/attractions">景点</a></li>
    <li><a href="/city/${c.id}/food">美食</a></li>
    <li><a href="/city/${c.id}/guide" class="active">攻略</a></li>
    <li><a href="/city/${c.id}/itinerary">行程</a></li>
    <li><a href="/city/${c.id}/blog">博客</a></li>
  </ul>
  <a href="/city/${c.id}/itinerary" class="nav-cta">免费规划行程 →</a>
  <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
</div></nav>

<main style="max-width:960px;margin:0 auto;padding:100px 24px 60px">
  <nav style="font-size:.875rem;color:#6b7280;margin-bottom:24px"><a href="/city/${c.id}/" style="color:#1a73e8">首页</a> / <span>旅游攻略</span></nav>
  <h1 style="font-size:2.2rem;font-weight:800;margin-bottom:8px">📋 ${c.name}旅游攻略</h1>
  <p style="color:#64748b;margin-bottom:40px;font-size:1.05rem">${c.description}</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">
    ${(c.guide || []).map(g => `
    <div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e2e8f0">
      <h3 style="font-size:1.15rem;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">${g.icon} ${g.title}</h3>
      <div style="color:#475569;line-height:1.8;font-size:.95rem">${g.content}</div>
    </div>`).join('')}
  </div>
</main>

<footer class="footer"><div class="footer-inner"><p>© 2026 ${c.name}旅游官网 · <a href="/city/${c.id}/">返回首页</a></p></div></footer>
<script>
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
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
<title>${c.name}行程规划 - ${c.name}${days}日游攻略</title>
<meta name="description" content="${c.name}${days}日游行程规划，合理安排时间，不错过任何精彩景点。">
<link rel="canonical" href="${SITE}/city/${c.id}/itinerary">
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
    <li><a href="/city/${c.id}/attractions">景点</a></li>
    <li><a href="/city/${c.id}/food">美食</a></li>
    <li><a href="/city/${c.id}/guide">攻略</a></li>
    <li><a href="/city/${c.id}/itinerary" class="active">行程</a></li>
    <li><a href="/city/${c.id}/blog">博客</a></li>
  </ul>
  <a href="/city/${c.id}/itinerary" class="nav-cta">免费规划行程 →</a>
  <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
</div></nav>

<main style="max-width:800px;margin:0 auto;padding:100px 24px 60px">
  <h1 style="font-size:2.2rem;font-weight:800;margin-bottom:8px;text-align:center">🗺️ ${c.name}行程规划</h1>
  <p style="color:#64748b;margin-bottom:36px;text-align:center;font-size:1.05rem">建议游玩 ${c.suggestedDays}，以下是推荐行程</p>
  <div class="day-tabs">
    ${dayPlans.map((d,i)=>`<div class="day-tab${i===0?' active':''}" onclick="showDay(${i})">第${d.day}天</div>`).join('')}
  </div>
  ${dayPlans.map((d,i)=>`
  <div class="day-panel${i===0?' active':''}" id="day-${i}">
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:16px">第${d.day}天：${d.title}</h2>
      <ul style="list-style:none;padding:0">
        ${d.items.map(item=>`<li style="padding:12px 0;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:12px"><span style="width:8px;height:8px;background:var(--brand);border-radius:50%;flex-shrink:0"></span>${item}</li>`).join('')}
      </ul>
    </div>
  </div>`).join('')}
</main>

<footer class="footer"><div class="footer-inner"><p>© 2026 ${c.name}旅游官网 · <a href="/city/${c.id}/">返回首页</a></p></div></footer>
<script>
function showDay(n){document.querySelectorAll('.day-tab').forEach((t,i)=>{t.classList.toggle('active',i===n)});document.querySelectorAll('.day-panel').forEach((p,i)=>{p.classList.toggle('active',i===n)})}
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
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
<title>${c.name}旅游博客 - ${c.name}攻略分享</title>
<meta name="description" content="${c.name}旅游攻略分享，最新${c.name}旅游资讯、游记、攻略。">
<link rel="canonical" href="${SITE}/city/${c.id}/blog">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>${citySelectorCSS}</style>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner">
  ${citySelector(c.id)}
  <ul class="nav-links" id="navLinks">
    <li><a href="/city/${c.id}/">首页</a></li>
    <li><a href="/city/${c.id}/attractions">景点</a></li>
    <li><a href="/city/${c.id}/food">美食</a></li>
    <li><a href="/city/${c.id}/guide">攻略</a></li>
    <li><a href="/city/${c.id}/itinerary">行程</a></li>
    <li><a href="/city/${c.id}/blog" class="active">博客</a></li>
  </ul>
  <a href="/city/${c.id}/itinerary" class="nav-cta">免费规划行程 →</a>
  <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
</div></nav>

<main style="max-width:960px;margin:0 auto;padding:100px 24px 60px">
  <h1 style="font-size:2.2rem;font-weight:800;margin-bottom:8px">📝 ${c.name}旅游博客</h1>
  <p style="color:#64748b;margin-bottom:40px;font-size:1.05rem">${c.name}旅游攻略、游记、实用信息</p>
  ${(c.blogs || []).length > 0 ? c.blogs.map(b => `
  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #e2e8f0;transition:all .2s;cursor:pointer" onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow=''">
    <h3 style="font-weight:700;margin-bottom:6px"><a href="/city/${c.id}/blog/${b.slug}" style="color:inherit">${b.title}</a></h3>
    <p style="font-size:.9rem;color:#64748b">${b.excerpt || ''}</p>
    <div style="font-size:.8rem;color:#94a3b8;margin-top:8px">📅 ${b.date || '2026'}</div>
  </div>`).join('') : '<div style="text-align:center;padding:60px;color:#94a3b8"><p>博客内容即将上线，敬请期待！</p></div>'}
</main>

<footer class="footer"><div class="footer-inner"><p>© 2026 ${c.name}旅游官网 · <a href="/city/${c.id}/">返回首页</a></p></div></footer>
<script>
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
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
  
  fs.writeFileSync(path.join(cityDir, 'index.html'), generateIndex(city));
  fs.writeFileSync(path.join(cityDir, 'attractions.html'), generateAttractions(city));
  fs.writeFileSync(path.join(cityDir, 'food.html'), generateFood(city));
  fs.writeFileSync(path.join(cityDir, 'guide.html'), generateGuide(city));
  fs.writeFileSync(path.join(cityDir, 'itinerary.html'), generateItinerary(city));
  fs.writeFileSync(path.join(cityDir, 'blog.html'), generateBlog(city));
  
  console.log(`✅ ${city.name}: 6个页面 → city/${city.id}/`);
}

// 生成根目录 index.html（按省份分组）
const provinces = groupByProvince();
let provinceHTML = '';
for (const [prov, cities] of Object.entries(provinces)) {
  provinceHTML += `
  <div class="province-section">
    <h2 class="province-title">${prov}</h2>
    <div class="city-cards">
      ${cities.map(c => `
      <a href="/city/${c.id}/" class="city-card">
        <div class="emoji">${c.emoji}</div>
        <div class="info">
          <h3>${c.name}</h3>
          <p>${c.tagline}</p>
        </div>
      </a>`).join('')}
    </div>
  </div>`;
}
const rootIndex = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>全国旅游攻略 — 发现中国最美目的地</title>
<meta name="description" content="全国旅游攻略，精选中国热门城市，景点/美食/行程一站搞定。">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="stylesheet" href="/style.css">
<style>
.hero-picker{background:linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%);color:#fff;padding:80px 24px 40px;text-align:center}
.province-section{max-width:1100px;margin:0 auto;padding:24px 24px 0}
.province-title{font-size:1.2rem;font-weight:700;color:#1a1a2e;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #e2e8f0}
.city-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
.city-card{display:flex;align-items:center;gap:14px;padding:16px 20px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;transition:all .25s;cursor:pointer;color:#1a1a2e;text-decoration:none}
.city-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.1);border-color:#cbd5e1}
.city-card .emoji{font-size:2rem}
.city-card .info h3{font-size:1.05rem;font-weight:700;margin-bottom:2px}
.city-card .info p{font-size:.82rem;color:#64748b}
.main-content{padding-bottom:60px}
.footer-simple{text-align:center;padding:40px 24px;color:#94a3b8;font-size:.85rem;border-top:1px solid #e2e8f0}
</style>
</head>
<body>
<div class="hero-picker">
  <div style="font-size:4rem;margin-bottom:16px">🌍</div>
  <h1 style="font-size:clamp(2rem,5vw,3rem);font-weight:900;margin-bottom:8px">全国旅游攻略</h1>
  <p style="font-size:1.1rem;opacity:.85;margin-bottom:8px">发现中国最美目的地</p>
  <p style="font-size:.9rem;opacity:.6">${Object.keys(provinces).length} 个省份 · ${data.cities.length} 个城市</p>
</div>
<div class="main-content">
  ${provinceHTML}
</div>
<footer class="footer-simple">
  <p>© 2026 全国旅游攻略 · <a href="/sitemap.xml">网站地图</a></p>
</footer>
</body>
</html>`;
fs.writeFileSync(path.join(ROOT, 'index.html'), rootIndex);
console.log(`✅ 首页: index.html`);
console.log('\n🎉 全部完成！');
