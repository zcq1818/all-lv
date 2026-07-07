var fs = require('fs');
var path = require('path');

// Parse all city data
var data = JSON.parse(fs.readFileSync('./data/cities.json', 'utf8'));
var cities = data.cities;

// ===== Generate picsum URL =====
function imgUrl(seed, w, h) {
  w = w || 800; h = h || 500;
  return 'https://picsum.photos/seed/' + encodeURIComponent(seed) + '/' + w + '/' + h;
}

// ===== Blog content generator =====
function generateBlogContent(city, blog) {
  var blocks = [];
  var cityName = city.name;
  var emoji = city.emoji || '🏙️';

  var sections = [];

  if (blog.slug.indexOf('food') >= 0 || blog.slug.indexOf('noodle') >= 0 || blog.slug.indexOf('dim-sum') >= 0 || blog.slug.indexOf('seafood') >= 0 || blog.slug.indexOf('beer') >= 0 || blog.slug.indexOf('egg-tart') >= 0) {
    sections = [
      { h2: '🍽️ ' + cityName + '美食概览', p: cityName + '的美食文化源远流长，从街头小吃到高端餐厅，每一道菜都承载着这座城市的记忆与温度。' + (city.climate || '') + '的气候孕育了独特的饮食文化，让每一位食客流连忘返。' + blog.excerpt },
      { h2: '🥇 必吃推荐', p: '来到' + cityName + '，以下美食不容错过。每一种都有其独特的风味和故事，建议至少安排2-3天时间来慢慢品尝。从经典的招牌菜到隐藏在小巷中的秘密美味，这份清单带你吃遍' + cityName + '。' },
      { h2: '🏪 推荐餐厅', p: '以下餐厅是本地人和游客都认可的口碑好店，涵盖了不同价位和口味，可以根据自己的喜好选择。建议提前电话预约，尤其是热门餐厅在用餐高峰期往往需要排队。' },
      { h2: '💰 价格参考', p: cityName + '的餐饮消费丰俭由人。路边小吃人均20-50元，特色餐厅人均80-150元，高档餐厅人均200元以上。建议以小吃为主、正餐为辅，既能体验地道风味，又能控制预算。' },
      { h2: '⚠️ 温馨提示', p: '1. 部分老牌餐厅可能需要排队，建议错峰用餐。2. 当地特色菜可能偏辣/偏油腻，肠胃不好的朋友注意适量。3. 尽量选择人气旺的餐厅，食材更新鲜。4. 街头小吃注意卫生，选择有固定摊位的商家。' }
    ];
  } else if (blog.slug.indexOf('guide') >= 0 || blog.slug.indexOf('travel') >= 0 || blog.slug.indexOf('itinerary') >= 0 || blog.slug.indexOf('season') >= 0 || blog.slug.indexOf('transport') >= 0) {
    sections = [
      { h2: '🌍 ' + cityName + '概述', p: cityName + '，' + (city.description || '一座充满魅力的旅游城市') + (city.bestSeason ? '。最佳旅行季节为' + city.bestSeason : '') + (city.suggestedDays ? '，建议停留' + city.suggestedDays : '') + '。' + blog.excerpt },
      { h2: '🗺️ 推荐路线', p: '根据您的旅行时间，我们推荐以下路线方案。如果时间充裕，可以将行程延长至' + (city.suggestedDays || '3-4天') + '，更深入地感受' + cityName + '的魅力。早起可以避开人潮，傍晚则适合拍照和散步。' },
      { h2: '🏨 住宿建议', p: cityName + '的住宿选择丰富，从经济型酒店到高端度假村应有尽有。建议选择交通便利的区域，方便游览各个景点。提前预订通常能获得更好的价格和房型选择。' },
      { h2: '🚌 市内交通', p: cityName + '的公共交通系统较为完善，公交车和地铁覆盖主要景点。也可以选择网约车或出租车，价格合理。建议下载当地交通APP，实时查询路线和班次。' },
      { h2: '📅 最佳季节', p: (city.bestSeason || '全年皆宜') + '是游览' + cityName + '的最佳时间。' + (city.climate || '气候宜人') + '。建议避开法定节假日高峰期，选择工作日出行体验更佳。' }
    ];
  } else {
    // Default / attraction-focused
    sections = [
      { h2: '🏛️ ' + cityName + '必游推荐', p: blog.excerpt + '。' + cityName + (city.description ? '，' + city.description : '拥有丰富的旅游资源') + '。无论你是历史爱好者、自然风光迷还是美食达人，这里都能满足你的期待。' },
      { h2: '🎯 深度体验', p: '除了常规打卡，我们还推荐以下深度体验方式，让你更深入地感受' + cityName + '的独特魅力。跟随当地人的脚步，发现不一样的风景和文化。' },
      { h2: '⏰ 开放时间', p: '大部分景点开放时间为 8:00-17:00（旺季延长），建议提前在官方渠道查询最新开放时间并预约门票。周一部分博物馆闭馆，请注意安排行程。' },
      { h2: '🎫 门票信息', p: (city.bestSeason ? '旺季（' + city.bestSeason + '）' : '旅游旺季') + '票价会有上浮，建议提前在线上平台购票，通常有优惠。学生证、老年证等可享受折扣，请随身携带。' }
    ];
  }

  sections.forEach(function(s) {
    blocks.push('<h2>' + s.h2 + '</h2>\n<p>' + s.p + '</p>\n');
    if (blocks.length <= 2) {
      blocks.push('<img src="' + imgUrl(city.id + '-' + blog.slug + '-' + blocks.length, 800, 400) + '" alt="' + s.h2.replace(/<[^>]+>/g,'') + '" style="width:100%;border-radius:12px;margin:16px 0" loading="lazy">\n');
    }
  });

  blocks.push('<h2>📋 实用信息速览</h2>\n<ul>\n<li><strong>最佳季节：</strong>' + (city.bestSeason || '全年皆宜') + '</li>\n<li><strong>建议天数：</strong>' + (city.suggestedDays || '2-3天') + '</li>\n<li><strong>气候特点：</strong>' + (city.climate || '四季分明') + '</li>\n</ul>');

  return blocks.join('\n');
}

// ===== Enrich blog pages =====
function enrichBlogPage(city, blog) {
  var fp = './city/' + city.id + '/blog/' + blog.slug + '.html';
  if (!fs.existsSync(fp)) return;
  var html = fs.readFileSync(fp, 'utf8');
  if (html.split('\n').length > 80) return;

  var heroImg = imgUrl(city.id + '-' + blog.slug, 800, 400);
  var contentBlocks = generateBlogContent(city, blog);

  var oldContent = /<p>[^<]+<\/p>\s*<p>[^<]+<\/p>\s*<p>[^<]+<\/p>/;
  var newContent = '<p>' + blog.excerpt + '</p>\n' +
    '<img src="' + heroImg + '" alt="' + blog.title + '" style="width:100%;border-radius:12px;margin:24px 0" loading="lazy">\n' +
    contentBlocks;

  html = html.replace(oldContent, newContent);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('  Blog: ' + city.id + '/' + blog.slug);
}

// ===== Enrich attractions page =====
function enrichAttractionsPage(city) {
  var fp = './city/' + city.id + '/attractions.html';
  if (!fs.existsSync(fp)) return;
  var html = fs.readFileSync(fp, 'utf8');
  if (html.split('\n').length > 170) return;

  var galleryHtml = '\n' +
    '<div style="max-width:960px;margin:0 auto;padding:0 24px 40px">\n' +
    '<h2 style="font-size:1.5rem;font-weight:700;margin-bottom:24px;display:flex;align-items:center;gap:8px">📸 ' + city.name + '精彩瞬间</h2>\n' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px">\n' +
    '  <img src="' + imgUrl(city.id + '-att-1', 400, 300) + '" alt="' + city.name + '景点" style="width:100%;height:200px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow-sm)" loading="lazy">\n' +
    '  <img src="' + imgUrl(city.id + '-att-2', 400, 300) + '" alt="' + city.name + '风景" style="width:100%;height:200px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow-sm)" loading="lazy">\n' +
    '  <img src="' + imgUrl(city.id + '-att-3', 400, 300) + '" alt="' + city.name + '风光" style="width:100%;height:200px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow-sm)" loading="lazy">\n' +
    '</div>\n</div>\n';

  html = html.replace('</main>', '</main>\n' + galleryHtml);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('  Attractions: ' + city.id);
}

// ===== Enrich food page =====
function enrichFoodPage(city) {
  var fp = './city/' + city.id + '/food.html';
  if (!fs.existsSync(fp)) return;
  var html = fs.readFileSync(fp, 'utf8');
  if (html.split('\n').length > 140) return;

  var galleryHtml = '\n' +
    '<div style="max-width:960px;margin:0 auto;padding:0 24px 40px">\n' +
    '<h2 style="font-size:1.5rem;font-weight:700;margin-bottom:24px;display:flex;align-items:center;gap:8px">🍜 ' + city.name + '美食图鉴</h2>\n' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px">\n' +
    '  <img src="' + imgUrl(city.id + '-food-1', 400, 300) + '" alt="' + city.name + '美食" style="width:100%;height:200px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow-sm)" loading="lazy">\n' +
    '  <img src="' + imgUrl(city.id + '-food-2', 400, 300) + '" alt="' + city.name + '小吃" style="width:100%;height:200px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow-sm)" loading="lazy">\n' +
    '  <img src="' + imgUrl(city.id + '-food-3', 400, 300) + '" alt="' + city.name + '特色美食" style="width:100%;height:200px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow-sm)" loading="lazy">\n' +
    '</div>\n</div>\n';

  html = html.replace('</main>', '</main>\n' + galleryHtml);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('  Food: ' + city.id);
}

// ===== Enrich guide page =====
function enrichGuidePage(city) {
  var fp = './city/' + city.id + '/guide.html';
  if (!fs.existsSync(fp)) return;
  var html = fs.readFileSync(fp, 'utf8');
  if (html.split('\n').length > 130) return;

  var extraHtml = '\n' +
    '<div style="max-width:960px;margin:0 auto;padding:0 24px 40px">\n' +
    '<h2 style="font-size:1.5rem;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px">📸 ' + city.name + '旅行照片</h2>\n' +
    '<img src="' + imgUrl(city.id + '-guide-hero', 800, 400) + '" alt="' + city.name + '旅行" style="width:100%;border-radius:12px;margin-bottom:16px;box-shadow:var(--shadow-sm)" loading="lazy">\n' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px">\n' +
    '  <img src="' + imgUrl(city.id + '-guide-1', 400, 300) + '" alt="' + city.name + '风光" style="width:100%;height:200px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow-sm)" loading="lazy">\n' +
    '  <img src="' + imgUrl(city.id + '-guide-2', 400, 300) + '" alt="' + city.name + '街景" style="width:100%;height:200px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow-sm)" loading="lazy">\n' +
    '</div>\n' +
    '<h3 style="font-size:1.2rem;font-weight:600;margin:24px 0 12px">💡 旅行小贴士</h3>\n' +
    '<ul style="color:#475569;line-height:1.8;padding-left:20px">\n' +
    '<li>提前查看天气预报，合理安排出行</li>\n' +
    '<li>热门景点建议早上去，避开人流高峰</li>\n' +
    '<li>当地特色美食集中在老城区和老街</li>\n' +
    '<li>出行下载离线地图，部分区域信号可能不佳</li>\n' +
    '<li>随身携带身份证，部分景点需要实名购票</li>\n' +
    '<li>注意保管随身物品，尤其在人多的地方</li>\n' +
    '</ul>\n</div>\n';

  html = html.replace('</main>', '</main>\n' + extraHtml);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('  Guide: ' + city.id);
}

// ===== Enrich itinerary page =====
function enrichItineraryPage(city) {
  var fp = './city/' + city.id + '/itinerary.html';
  if (!fs.existsSync(fp)) return;
  var html = fs.readFileSync(fp, 'utf8');
  if (html.split('\n').length > 150) return;

  var extraHtml = '\n' +
    '<div style="max-width:960px;margin:0 auto;padding:0 24px 40px">\n' +
    '<h2 style="font-size:1.5rem;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px">🗺️ ' + city.name + '旅行地图</h2>\n' +
    '<img src="' + imgUrl(city.id + '-itinerary-hero', 800, 400) + '" alt="' + city.name + '行程路线" style="width:100%;border-radius:12px;margin-bottom:24px;box-shadow:var(--shadow-sm)" loading="lazy">\n' +
    '<h3 style="font-size:1.2rem;font-weight:600;margin:24px 0 12px">📋 行前准备清单</h3>\n' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">\n' +
    '<div style="background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0">\n' +
    '<h4 style="font-weight:600;margin-bottom:8px">🎒 必备物品</h4>\n' +
    '<ul style="color:#475569;line-height:1.8;padding-left:16px;margin:0">\n' +
    '<li>身份证/护照</li>\n' +
    '<li>手机充电器+充电宝</li>\n' +
    '<li>舒适运动鞋</li>\n' +
    '<li>防晒霜/雨伞</li>\n' +
    '<li>常用药品</li>\n' +
    '</ul></div>\n' +
    '<div style="background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0">\n' +
    '<h4 style="font-weight:600;margin-bottom:8px">📱 推荐APP</h4>\n' +
    '<ul style="color:#475569;line-height:1.8;padding-left:16px;margin:0">\n' +
    '<li>高德地图（导航）</li>\n' +
    '<li>携程/美团（门票）</li>\n' +
    '<li>大众点评（美食）</li>\n' +
    '<li>铁路12306（火车）</li>\n' +
    '<li>滴滴出行（打车）</li>\n' +
    '</ul></div>\n' +
    '</div>\n</div>\n';

  html = html.replace('</main>', '</main>\n' + extraHtml);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('  Itinerary: ' + city.id);
}

// ===== Enrich index page =====
function enrichIndexPage(city) {
  var fp = './city/' + city.id + '/index.html';
  if (!fs.existsSync(fp)) return;
  var html = fs.readFileSync(fp, 'utf8');

  var photoSection = '\n' +
    '<section class="city-photos" style="padding:60px 24px;background:#fff">\n' +
    '<div style="max-width:var(--max-width);margin:0 auto">\n' +
    '<h2 style="font-size:1.5rem;font-weight:700;margin-bottom:24px;text-align:center">📸 ' + city.name + '风光</h2>\n' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">\n' +
    '  <img src="' + imgUrl(city.id + '-hero-1', 600, 400) + '" alt="' + city.name + '风景" style="width:100%;height:250px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow-md)" loading="lazy">\n' +
    '  <img src="' + imgUrl(city.id + '-hero-2', 600, 400) + '" alt="' + city.name + '城市" style="width:100%;height:250px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow-md)" loading="lazy">\n' +
    '  <img src="' + imgUrl(city.id + '-hero-3', 600, 400) + '" alt="' + city.name + '景色" style="width:100%;height:250px;object-fit:cover;border-radius:12px;box-shadow:var(--shadow-md)" loading="lazy">\n' +
    '</div>\n</div>\n</section>\n';

  html = html.replace('<section class="attractions-preview">', photoSection + '\n<section class="attractions-preview">');
  fs.writeFileSync(fp, html, 'utf8');
  console.log('  Index: ' + city.id);
}

// ===== Main =====
console.log('=== Enriching blog detail pages ===');
cities.forEach(function(c) {
  (c.blogs || []).forEach(function(b) {
    enrichBlogPage(c, b);
  });
});

console.log('\n=== Enriching attractions pages ===');
cities.forEach(function(c) { enrichAttractionsPage(c); });

console.log('\n=== Enriching food pages ===');
cities.forEach(function(c) { enrichFoodPage(c); });

console.log('\n=== Enriching guide pages ===');
cities.forEach(function(c) { enrichGuidePage(c); });

console.log('\n=== Enriching itinerary pages ===');
cities.forEach(function(c) { enrichItineraryPage(c); });

console.log('\n=== Enriching index pages ===');
cities.forEach(function(c) { enrichIndexPage(c); });

console.log('\n=== ALL DONE ===');
