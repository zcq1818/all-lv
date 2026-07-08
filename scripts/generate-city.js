#!/usr/bin/env node
/**
 * 城市页面生成器
 * 从 data/cities.json 读取城市数据，生成景点、美食、攻略等页面
 * 用法: node scripts/generate-city.js <city-id>
 * 示例: node scripts/generate-city.js sanya
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'cities.json');
const SITE = 'https://lv.divdu.com'; // TODO: 换成实际域名

function loadCities() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  return data.cities;
}

function generateAttractionPage(city) {
  const template = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${city.name}景点推荐 - ${city.name}旅游攻略</title>
<meta name="description" content="${city.name}最值得去的景点推荐：精选${city.name}必玩景点，附详细攻略、门票、交通信息。${city.description}">
<meta name="keywords" content="${city.name}景点,${city.name}旅游,${city.name}攻略,${city.keywords.slice(0, 5).join(',')}">
<meta name="author" content="全国旅游攻略">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${SITE}/city/${city.id}/attractions">
<meta property="og:title" content="${city.name}景点推荐 - ${city.name}旅游攻略">
<meta property="og:description" content="${city.name}最值得去的景点推荐">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}/city/${city.id}/attractions">
<meta property="og:site_name" content="全国旅游攻略">
<link rel="stylesheet" href="../../style.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  "name": "${city.name}",
  "description": "${city.description}",
  "url": "${SITE}/city/${city.id}",
  "geo": { "@type": "GeoCoordinates", "latitude": ${city.lat}, "longitude": ${city.lng} },
  "touristType": ["文化旅游", "自然观光", "美食体验"]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "首页", "item": "${SITE}/" },
    { "@type": "ListItem", "position": 2, "name": "${city.name}", "item": "${SITE}/city/${city.id}" },
    { "@type": "ListItem", "position": 3, "name": "景点推荐", "item": "${SITE}/city/${city.id}/attractions" }
  ]
}
</script>
</head>
<body>
<nav class="navbar" id="navbar">
  <div class="nav-inner">
    <a href="/" class="nav-logo">全国旅游攻略</a>
    <ul class="nav-links" id="navLinks">
      <li><a href="/">首页</a></li>
      <li><a href="/city/${city.id}" class="active">${city.name}</a></li>
      <li><a href="/city/${city.id}/attractions">景点</a></li>
      <li><a href="/city/${city.id}/food">美食</a></li>
      <li><a href="/city/${city.id}/guide">攻略</a></li>
    </ul>
    <button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button>
  </div>
</nav>

<main class="container" style="max-width:960px;margin:0 auto;padding:80px 24px 48px;">
  <nav class="breadcrumb" style="font-size:.875rem;color:#6b7280;margin-bottom:24px;">
    <a href="/">首页</a> / <a href="/city/${city.id}">${city.name}</a> / <span>景点推荐</span>
  </nav>
  
  <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px;">${city.name}景点推荐</h1>
  <p style="color:#6b7280;margin-bottom:32px;">${city.description}</p>
  
  <div id="attractions-list" style="display:grid;gap:24px;">
    <!-- 景点列表由 JS 动态填充，或手动生成 -->
    <p style="color:#94a3b8;text-align:center;padding:48px;">景点数据加载中...</p>
  </div>
</main>

<footer class="footer">
  <div class="footer-inner">
    <p>© 2026 全国旅游攻略 · <a href="/sitemap.xml">网站地图</a></p>
  </div>
</footer>
<script>
window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});
</script>
</body>
</html>`;
  return template;
}

function generateFoodPage(city) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${city.name}美食攻略 - ${city.name}旅游</title>
<meta name="description" content="${city.name}必吃美食推荐：特色小吃、网红餐厅、本地人私藏好店。">
<meta name="keywords" content="${city.name}美食,${city.name}小吃,${city.name}餐厅,${city.name}特色菜">
<link rel="canonical" href="${SITE}/city/${city.id}/food">
<link rel="stylesheet" href="../../style.css">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
  {"@type":"ListItem","position":1,"name":"首页","item":"${SITE}/"},
  {"@type":"ListItem","position":2,"name":"${city.name}","item":"${SITE}/city/${city.id}"},
  {"@type":"ListItem","position":3,"name":"美食攻略","item":"${SITE}/city/${city.id}/food"}
]}
</script>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner"><a href="/" class="nav-logo">全国旅游攻略</a><ul class="nav-links" id="navLinks"><li><a href="/">首页</a></li><li><a href="/city/${city.id}">${city.name}</a></li><li><a href="/city/${city.id}/attractions">景点</a></li><li><a href="/city/${city.id}/food" class="active">美食</a></li><li><a href="/city/${city.id}/guide">攻略</a></li></ul><button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button></div></nav>
<main class="container" style="max-width:960px;margin:0 auto;padding:80px 24px 48px;">
  <nav class="breadcrumb" style="font-size:.875rem;color:#6b7280;margin-bottom:24px;"><a href="/">首页</a> / <a href="/city/${city.id}">${city.name}</a> / <span>美食攻略</span></nav>
  <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px;">${city.name}美食攻略</h1>
  <p style="color:#6b7280;margin-bottom:32px;">${city.name}必吃美食推荐，特色小吃、网红餐厅一网打尽。</p>
  <div style="color:#94a3b8;text-align:center;padding:48px;">美食内容生成中...</div>
</main>
<footer class="footer"><div class="footer-inner"><p>© 2026 全国旅游攻略</p></div></footer>
<script>window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});</script>
</body>
</html>`;
}

function generateGuidePage(city) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${city.name}旅游攻略 - 交通/住宿/最佳时间</title>
<meta name="description" content="${city.name}旅游全攻略：交通指南、住宿推荐、最佳旅游时间、行程规划。">
<link rel="canonical" href="${SITE}/city/${city.id}/guide">
<link rel="stylesheet" href="../../style.css">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
  {"@type":"ListItem","position":1,"name":"首页","item":"${SITE}/"},
  {"@type":"ListItem","position":2,"name":"${city.name}","item":"${SITE}/city/${city.id}"},
  {"@type":"ListItem","position":3,"name":"旅游攻略","item":"${SITE}/city/${city.id}/guide"}
]}
</script>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner"><a href="/" class="nav-logo">全国旅游攻略</a><ul class="nav-links" id="navLinks"><li><a href="/">首页</a></li><li><a href="/city/${city.id}">${city.name}</a></li><li><a href="/city/${city.id}/attractions">景点</a></li><li><a href="/city/${city.id}/food">美食</a></li><li><a href="/city/${city.id}/guide" class="active">攻略</a></li></ul><button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button></div></nav>
<main class="container" style="max-width:960px;margin:0 auto;padding:80px 24px 48px;">
  <nav class="breadcrumb" style="font-size:.875rem;color:#6b7280;margin-bottom:24px;"><a href="/">首页</a> / <a href="/city/${city.id}">${city.name}</a> / <span>旅游攻略</span></nav>
  <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px;">${city.name}旅游攻略</h1>
  <p style="color:#6b7280;margin-bottom:32px;">${city.description}</p>
  <section style="margin-bottom:32px;"><h2 style="font-size:1.4rem;font-weight:700;margin-bottom:16px;">📍 最佳旅游时间</h2><p>${city.bestSeason}</p></section>
  <section style="margin-bottom:32px;"><h2 style="font-size:1.4rem;font-weight:700;margin-bottom:16px;">📅 建议游玩天数</h2><p>${city.suggestedDays}</p></section>
  <section style="margin-bottom:32px;"><h2 style="font-size:1.4rem;font-weight:700;margin-bottom:16px;">🚄 交通指南</h2><p>详细交通信息生成中...</p></section>
  <section style="margin-bottom:32px;"><h2 style="font-size:1.4rem;font-weight:700;margin-bottom:16px;">🏨 住宿推荐</h2><p>住宿推荐生成中...</p></section>
</main>
<footer class="footer"><div class="footer-inner"><p>© 2026 全国旅游攻略</p></div></footer>
<script>window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});</script>
</body>
</html>`;
}

function generateCityIndex(city) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${city.name}旅游攻略 - ${city.tagline}</title>
<meta name="description" content="${city.description}">
<meta name="keywords" content="${city.keywords.join(',')}">
<link rel="canonical" href="${SITE}/city/${city.id}">
<meta property="og:title" content="${city.name}旅游攻略 - ${city.tagline}">
<meta property="og:description" content="${city.description}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="../../style.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  "name": "${city.name}",
  "description": "${city.description}",
  "url": "${SITE}/city/${city.id}",
  "geo": { "@type": "GeoCoordinates", "latitude": ${city.lat}, "longitude": ${city.lng} }
}
</script>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-inner"><a href="/" class="nav-logo">全国旅游攻略</a><ul class="nav-links" id="navLinks"><li><a href="/">首页</a></li><li><a href="/city/${city.id}" class="active">${city.name}</a></li><li><a href="/city/${city.id}/attractions">景点</a></li><li><a href="/city/${city.id}/food">美食</a></li><li><a href="/city/${city.id}/guide">攻略</a></li></ul><button class="hamburger" id="hamburger" aria-label="菜单"><span></span><span></span><span></span></button></div></nav>
<main style="max-width:960px;margin:0 auto;padding:80px 24px 48px;">
  <h1 style="font-size:2.5rem;font-weight:800;margin-bottom:8px;">${city.name}旅游攻略</h1>
  <p style="font-size:1.2rem;color:#6b7280;margin-bottom:32px;">${city.tagline}</p>
  <p style="margin-bottom:32px;line-height:1.8;">${city.description}</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
    <a href="/city/${city.id}/attractions" style="display:block;padding:24px;background:#f8fafc;border-radius:12px;text-decoration:none;color:#1e293b;border:1px solid #e2e8f0;transition:all 0.2s;">
      <div style="font-size:2rem;margin-bottom:8px;">🏔️</div>
      <h3 style="font-weight:700;margin-bottom:4px;">景点推荐</h3>
      <p style="font-size:.875rem;color:#6b7280;">精选${city.name}必玩景点</p>
    </a>
    <a href="/city/${city.id}/food" style="display:block;padding:24px;background:#f8fafc;border-radius:12px;text-decoration:none;color:#1e293b;border:1px solid #e2e8f0;transition:all 0.2s;">
      <div style="font-size:2rem;margin-bottom:8px;">🍜</div>
      <h3 style="font-weight:700;margin-bottom:4px;">美食攻略</h3>
      <p style="font-size:.875rem;color:#6b7280;">${city.name}必吃美食</p>
    </a>
    <a href="/city/${city.id}/guide" style="display:block;padding:24px;background:#f8fafc;border-radius:12px;text-decoration:none;color:#1e293b;border:1px solid #e2e8f0;transition:all 0.2s;">
      <div style="font-size:2rem;margin-bottom:8px;">📋</div>
      <h3 style="font-weight:700;margin-bottom:4px;">旅游攻略</h3>
      <p style="font-size:.875rem;color:#6b7280;">交通/住宿/最佳时间</p>
    </a>
  </div>
</main>
<footer class="footer"><div class="footer-inner"><p>© 2026 全国旅游攻略</p></div></footer>
<script>window.addEventListener('scroll',function(){document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});document.getElementById('hamburger').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open')});</script>
</body>
</html>`;
}

// Main
const targetCity = process.argv[2];
const cities = loadCities();

if (targetCity) {
  const city = cities.find(c => c.id === targetCity);
  if (!city) { console.error(`❌ 城市 ${targetCity} 未找到`); process.exit(1); }
  
  const cityDir = path.join(ROOT, 'city', city.id);
  fs.mkdirSync(cityDir, { recursive: true });
  
  fs.writeFileSync(path.join(cityDir, 'index.html'), generateCityIndex(city));
  fs.writeFileSync(path.join(cityDir, 'attractions.html'), generateAttractionPage(city));
  fs.writeFileSync(path.join(cityDir, 'food.html'), generateFoodPage(city));
  fs.writeFileSync(path.join(cityDir, 'guide.html'), generateGuidePage(city));
  
  console.log(`✅ ${city.name}: 生成 4 个页面到 city/${city.id}/`);
} else {
  // Generate all cities
  for (const city of cities) {
    const cityDir = path.join(ROOT, 'city', city.id);
    fs.mkdirSync(cityDir, { recursive: true });
    
    fs.writeFileSync(path.join(cityDir, 'index.html'), generateCityIndex(city));
    fs.writeFileSync(path.join(cityDir, 'attractions.html'), generateAttractionPage(city));
    fs.writeFileSync(path.join(cityDir, 'food.html'), generateFoodPage(city));
    fs.writeFileSync(path.join(cityDir, 'guide.html'), generateGuidePage(city));
    
    console.log(`✅ ${city.name}: city/${city.id}/`);
  }
}
console.log('\n🎉 Done!');
