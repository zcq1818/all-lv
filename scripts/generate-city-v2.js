#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.all-lv.com';
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cities.json'), 'utf8'));

function generateCityPage(city) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${city.name}旅游攻略 - ${city.tagline}</title>
<meta name="description" content="${city.description}">
<meta name="keywords" content="${city.keywords.join(',')}">
<link rel="canonical" href="${SITE}/city/${city.id}/">
<meta property="og:title" content="${city.name}旅游攻略 - ${city.tagline}">
<meta property="og:description" content="${city.description}">
<meta property="og:type" content="website">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"TouristDestination","name":"${city.name}","description":"${city.description}","url":"${SITE}/city/${city.id}/","geo":{"@type":"GeoCoordinates","latitude":${city.lat},"longitude":${city.lng}}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
  {"@type":"ListItem","position":1,"name":"首页","item":"${SITE}/"},
  {"@type":"ListItem","position":2,"name":"${city.name}","item":"${SITE}/city/${city.id}/"}
]}
</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"PingFang SC","Microsoft YaHei",sans-serif;color:#1a1a2e;background:#f0f2f5;line-height:1.7}
a{text-decoration:none;color:inherit}

/* Nav */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border-bottom:1px solid #e2e8f0;transition:all .2s}
.nav-inner{max-width:1100px;margin:0 auto;padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between}
.nav-back{display:flex;align-items:center;gap:8px;font-weight:600;font-size:.95rem;color:#64748b;transition:color .2s}
.nav-back:hover{color:#1a1a2e}
.nav-title{font-weight:700;font-size:1rem}

/* Hero */
.hero{padding:100px 24px 40px;text-align:center;color:#fff;position:relative}
.hero-emoji{font-size:5rem;margin-bottom:16px;filter:drop-shadow(0 8px 24px rgba(0,0,0,0.2))}
.hero h1{font-size:clamp(2rem,5vw,2.8rem);font-weight:900;margin-bottom:8px}
.hero p{font-size:1.1rem;opacity:.85;max-width:500px;margin:0 auto 24px}
.hero-badges{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}
.badge{padding:6px 16px;background:rgba(255,255,255,0.2);border-radius:24px;font-size:.85rem;backdrop-filter:blur(4px)}

/* Tabs */
.tabs{position:sticky;top:56px;z-index:50;background:#fff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:center;gap:0}
.tab{padding:14px 28px;font-size:.95rem;font-weight:600;color:#64748b;cursor:pointer;border-bottom:3px solid transparent;transition:all .2s;user-select:none}
.tab:hover{color:#1a1a2e}
.tab.active{color:#1a1a2e;border-bottom-color:#4ecdc4}
.tab-content{display:none}
.tab-content.active{display:block}

/* Content */
.content{max-width:900px;margin:0 auto;padding:32px 24px 60px}
.card{background:#fff;border-radius:16px;padding:28px;margin-bottom:20px;border:1px solid #e2e8f0;transition:all .2s}
.card:hover{box-shadow:0 8px 24px rgba(0,0,0,0.06);border-color:#ddd}
.card h3{font-size:1.15rem;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:8px}
.card p{color:#475569;font-size:.95rem;line-height:1.8}
.card .meta{display:flex;gap:16px;margin-top:12px;font-size:.8rem;color:#94a3b8;flex-wrap:wrap}
.card .meta span{display:flex;align-items:center;gap:4px}

.section-title{font-size:1.4rem;font-weight:800;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #e2e8f0}

.info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-bottom:32px}
.info-box{background:#fff;border-radius:14px;padding:24px;border:1px solid #e2e8f0}
.info-box h3{font-size:1rem;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.info-box p,.info-box ul{color:#475569;font-size:.92rem;line-height:1.8}
.info-box ul{padding-left:18px}
.info-box li{margin-bottom:6px}

.footer{text-align:center;padding:40px 24px;color:#94a3b8;font-size:.85rem;border-top:1px solid #e2e8f0}

@media(max-width:640px){
  .tab{padding:12px 16px;font-size:.85rem}
  .hero{padding:80px 20px 32px}
  .content{padding:24px 16px 48px}
  .card{padding:20px}
}
</style>
</head>
<body>

<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="nav-back">← 全部城市</a>
    <span class="nav-title">${city.emoji} ${city.name}</span>
    <div style="width:60px"></div>
  </div>
</nav>

<div class="hero" style="background:linear-gradient(135deg,${city.color || '#0f2027'}dd 0%,${city.color || '#2c5364'}88 100%)">
  <div class="hero-emoji">${city.emoji}</div>
  <h1>${city.name}旅游攻略</h1>
  <p>${city.tagline}</p>
  <div class="hero-badges">
    <span class="badge">📍 ${city.province}</span>
    <span class="badge">📅 建议 ${city.suggestedDays}</span>
    <span class="badge">🌤️ ${city.bestSeason}</span>
  </div>
</div>

<div class="tabs">
  <div class="tab active" data-tab="attractions">🏔️ 景点</div>
  <div class="tab" data-tab="food">🍜 美食</div>
  <div class="tab" data-tab="guide">📋 攻略</div>
</div>

<div class="tab-content active" id="tab-attractions">
  <div class="content">
    <div class="section-title">${city.name}必玩景点</div>
    <div id="attractions-list"></div>
  </div>
</div>

<div class="tab-content" id="tab-food">
  <div class="content">
    <div class="section-title">${city.name}必吃美食</div>
    <div id="food-list"></div>
  </div>
</div>

<div class="tab-content" id="tab-guide">
  <div class="content">
    <div class="section-title">${city.name}旅游攻略</div>
    <div id="guide-content"></div>
  </div>
</div>

<footer class="footer">
  <p>© 2026 全国旅游攻略 · <a href="/">返回首页</a></p>
</footer>

<script>
// Tab switching
document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('tab-' + t.dataset.tab).classList.add('active');
  });
});

// Nav scroll
window.addEventListener('scroll', () => {
  document.querySelector('.nav').style.boxShadow = window.scrollY > 10 ? '0 2px 12px rgba(0,0,0,0.08)' : 'none';
});

// Content data - will be populated by generator or manually
const attractions = __ATTRACTIONS__;
const food = __FOOD__;
const guide = __GUIDE__;

// Render attractions
document.getElementById('attractions-list').innerHTML = attractions.map(a => 
  '<div class="card"><h3>' + a.icon + ' ' + a.name + '</h3><p>' + a.desc + '</p><div class="meta">' +
  (a.ticket ? '<span>🎫 ' + a.ticket + '</span>' : '') +
  (a.time ? '<span>⏱️ ' + a.time + '</span>' : '') +
  '</div></div>'
).join('');

// Render food
document.getElementById('food-list').innerHTML = food.map(f =>
  '<div class="card"><h3>' + f.icon + ' ' + f.name + '</h3><p>' + f.desc + '</p>' +
  (f.tip ? '<div class="meta"><span>💡 ' + f.tip + '</span></div>' : '') + '</div>'
).join('');

// Render guide
document.getElementById('guide-content').innerHTML = guide.map(g =>
  '<div class="info-box"><h3>' + g.icon + ' ' + g.title + '</h3>' + g.content + '</div>'
).join('');
// Wrap in grid
document.getElementById('guide-content').outerHTML = '<div class="info-grid" id="guide-content">' + document.getElementById('guide-content').innerHTML + '</div>';
</script>
</body>
</html>`;
}

// City content data
const cityContent = {
  sanya: {
    attractions: [
      {icon:"🏝️",name:"蜈支洲岛",desc:"中国的马尔代夫，海水能见度极高，是潜水和水上运动的绝佳去处。岛上情人桥、观日岩、妈祖庙等景点值得打卡。",ticket:"门票+船票 约168元",time:"建议1天"},
      {icon:"🌊",name:"亚龙湾",desc:"天下第一湾，7公里长的月牙形海滩，沙质细腻洁白，海水清澈见底。周边高端度假酒店林立。",ticket:"免费",time:"建议半天"},
      {icon:"🗿",name:"天涯海角",desc:"三亚标志性景点，天涯石、海角石、南天一柱等巨石矗立海边，承载着无数浪漫传说。",ticket:"68元",time:"建议2-3小时"},
      {icon:"🙏",name:"南山文化旅游区",desc:"108米海上观音像震撼壮观，南山寺、不二法门、长寿谷等景点充满佛教文化氛围。",ticket:"129元",time:"建议半天"},
      {icon:"🌴",name:"呀诺达雨林",desc:"热带雨林景区，踏瀑戏水、高空滑索、雨林穿越等体验项目丰富，是亲近自然的好去处。",ticket:"158元",time:"建议1天"},
      {icon:"🌅",name:"鹿回头公园",desc:"三亚制高点，登顶可俯瞰三亚全景。日落时分最美，是观赏三亚夜景的绝佳位置。",ticket:"42元",time:"建议2小时"},
    ],
    food: [
      {icon:"🦐",name:"第一市场海鲜",desc:"三亚最地道的海鲜体验，自己挑选新鲜海鲜，找加工店现做。皮皮虾、和乐蟹、芒果螺必点。",tip:"推荐林姐香味海鲜、小胡子海鲜加工"},
      {icon:"🍜",name:"抱罗粉",desc:"海南特色米粉，汤头鲜美，配料丰富。粗圆粉配上牛肉汤或海鲜汤，是三亚人的早餐首选。",tip:"加点黄灯笼辣椒更地道"},
      {icon:"🥥",name:"椰子鸡",desc:"用新鲜椰子水做汤底，配上文昌鸡，清甜鲜美。三亚的椰子鸡比内地正宗太多。",tip:"嗲嗲的椰子鸡、椰小鸡口碑好"},
      {icon:"🍖",name:"东山羊",desc:"海南四大名菜之一，肉质鲜嫩无膻味。红烧、清汤、打边炉都好吃。",tip:"三亚湾附近多家老字号"},
      {icon:"🧊",name:"清补凉",desc:"三亚街头必备甜品，椰奶/糖水打底，配上红豆、薏米、西瓜、椰肉等，消暑神器。",tip:"路边摊3-5元一碗，加椰奶更好喝"},
      {icon:"🐟",name:"文昌鸡",desc:"海南四大名菜之首，白切做法最经典，皮脆肉嫩，蘸酱吃绝了。",tip:"琼乡阁、沿江海南鸡饭店"},
    ],
    guide: [
      {icon:"✈️",title:"交通指南",content:"<ul><li><b>飞机：</b>凤凰国际机场，全国主要城市直飞，机场到市区约30分钟</li><li><b>市内交通：</b>公交覆盖主要景点，打车起步价8元，推荐租车自驾更自由</li><li><b>景区间：</b>蜈支洲岛需到码头坐船，南山/天涯海角在西线，亚龙湾在东线</li></ul>"},
      {icon:"🏨",title:"住宿推荐",content:"<ul><li><b>三亚湾：</b>性价比最高，离机场近，看日落绝佳（200-500元/晚）</li><li><b>亚龙湾：</b>高端度假首选，一线海景酒店（500-2000元/晚）</li><li><b>海棠湾：</b>免税店附近，新酒店多（400-1500元/晚）</li><li><b>大东海：</b>交通便利，吃喝方便（200-600元/晚）</li></ul>"},
      {icon:"🌤️",title:"最佳时间",content:"<p><b>最佳：10月-次年3月</b>，气温22-28°C，避开台风季。</p><p>4-9月为淡季，酒店便宜但偶有台风。春节/国庆是旺季，价格翻倍需提前预订。</p><p>12-2月是避寒高峰，北方游客最多。</p>"},
      {icon:"⚠️",title:"注意事项",content:"<ul><li>防晒必备：SPF50+防晒霜、墨镜、遮阳帽</li><li>第一市场买海鲜要看好秤，选信誉好的加工店</li><li>蜈支洲岛旺季要提前买票，现场可能排队2小时+</li><li>南山寺参观注意着装，不要太暴露</li><li>打车用滴滴，避免被宰</li></ul>"},
    ],
  },
  chengdu: {
    attractions: [
      {icon:"🐼",name:"大熊猫繁育研究基地",desc:"离大熊猫最近的地方，可以看到各年龄段的熊猫，小熊猫活动区最受欢迎。早上熊猫最活跃。",ticket:"55元",time:"建议半天"},
      {icon:"🏮",name:"锦里古街",desc:"成都最古老的商业街，红灯笼、青石板、三国文化。小吃一条街，边逛边吃。",ticket:"免费",time:"建议2-3小时"},
      {icon:"🏯",name:"武侯祠",desc:"中国唯一的君臣合祀祠庙，纪念诸葛亮和刘备。红墙竹影是成都最出片的打卡点。",ticket:"50元",time:"建议2小时"},
      {icon:"🎭",name:"宽窄巷子",desc:"清朝古街改造的文化街区，宽巷子、窄巷子、井巷子各有特色。茶馆、小吃、文创店林立。",ticket:"免费",time:"建议2-3小时"},
      {icon:"⛰️",name:"青城山",desc:"道教名山，前山道教文化浓厚，后山自然风光优美。与都江堰联票更划算。",ticket:"80元",time:"建议1天"},
      {icon:"💧",name:"都江堰",desc:"两千年历史的水利工程，至今仍在使用。鱼嘴、飞沙堰、宝瓶口三大工程巧夺天工。",ticket:"80元",time:"建议半天"},
    ],
    food: [
      {icon:"🍲",name:"火锅",desc:"成都灵魂美食，牛油锅底配毛肚、黄喉、鸭肠，麻辣鲜香。没有一顿火锅解决不了的事。",tip:"小龙坎、蜀大侠、大龙燚都是热门选择"},
      {icon:"🥢",name:"串串香",desc:"成都版撸串，竹签串好各种食材，涮火锅吃。冷锅串串和热锅串串各有风味。",tip:"马路边边、钢管厂五区小郡肝"},
      {icon:"🥟",name:"钟水饺",desc:"成都名小吃，皮薄馅嫩，红油浇头甜中带辣。与北方水饺完全不同。",tip:"春熙路附近多家老字号"},
      {icon:"🍜",name:"担担面",desc:"成都街头最常见的面，芝麻酱+辣椒油+肉末，拌匀后香气扑鼻。",tip:"龙抄手、陈麻婆豆腐店都有"},
      {icon:"🐰",name:"兔头",desc:"成都人的最爱，五香和麻辣两种口味。啃兔头是成都人的休闲方式。",tip:"双流老妈兔头、王妈手撕烤兔"},
      {icon:"🫖",name:"盖碗茶",desc:"成都茶馆文化精髓，一碗茶、一把竹椅、一下午。人民公园鹤鸣茶社最有氛围。",tip:"人民公园鹤鸣茶社，感受最地道的成都慢生活"},
    ],
    guide: [
      {icon:"✈️",title:"交通指南",content:"<ul><li><b>飞机：</b>双流国际机场/天府国际机场，地铁直达市区</li><li><b>高铁：</b>成都东站为主要枢纽，高铁网络发达</li><li><b>市内：</b>地铁覆盖主城区，公交发达，打车方便</li><li><b>周边：</b>青城山/都江堰高铁30分钟可达</li></ul>"},
      {icon:"🏨",title:"住宿推荐",content:"<ul><li><b>春熙路/太古里：</b>市中心，吃喝购物最方便（200-600元/晚）</li><li><b>宽窄巷子附近：</b>文化氛围好，出行便利（200-500元/晚）</li><li><b>锦里/武侯祠附近：</b>景点集中，适合游客（180-400元/晚）</li></ul>"},
      {icon:"🌤️",title:"最佳时间",content:"<p><b>最佳：3-6月、9-11月</b>，气候舒适，适合户外活动。</p><p>7-8月较热但可避暑去青城山。冬天阴冷但可以泡温泉、吃火锅。</p><p>春秋两季最适合拍照，银杏和樱花很美。</p>"},
      {icon:"⚠️",title:"注意事项",content:"<ul><li>火锅点微辣就行，成都的微辣≈外地的特辣</li><li>大熊猫基地早上7:30开门，越早去越好</li><li>成都人吃饭要排号，热门店提前1-2小时取号</li><li>春熙路/太古里可以逛半天，留足时间</li><li>喝茶掏耳朵是成都特色体验，但要注意卫生</li></ul>"},
    ],
  },
  xian: {
    attractions: [
      {icon:"🗿",name:"秦始皇兵马俑",desc:"世界第八大奇迹，数千个真人大小的陶俑排列整齐，气势恢宏。一号坑最壮观。",ticket:"120元",time:"建议半天"},
      {icon:"🏰",name:"西安城墙",desc:"中国保存最完整的古城墙，周长13.74公里。骑自行车环城墙一圈是最经典的体验。",ticket:"54元",time:"建议2-3小时"},
      {icon:"🕌",name:"大雁塔",desc:"唐代高僧玄奘为保存佛经而建，是西安标志性建筑。北广场音乐喷泉晚上很壮观。",ticket:"40元",time:"建议2小时"},
      {icon:"🏮",name:"回民街",desc:"西安最著名的美食街，各种小吃让人眼花缭乱。肉夹馍、羊肉泡馍、凉皮必吃。",ticket:"免费",time:"建议2-3小时"},
      {icon:"♨️",name:"华清池",desc:"唐代皇家温泉行宫，杨贵妃沐浴之地。《长恨歌》实景演出非常震撼。",ticket:"120元",time:"建议2-3小时"},
      {icon:"⛰️",name:"华山",desc:"天下第一险山，长空栈道、鹞子翻身惊险刺激。西峰看日出是华山最美时刻。",ticket:"160元",time:"建议1-2天"},
    ],
    food: [
      {icon:"🫓",name:"肉夹馍",desc:"西安第一小吃，白吉馍外酥里嫩，腊汁肉肥瘦相间。回民街的牛羊肉夹馍也别有风味。",tip:"子午路张记、秦豫肉夹馍最正宗"},
      {icon:"🍲",name:"羊肉泡馍",desc:"西安人的灵魂美食，自己掰馍，厨师煮制，汤浓肉烂，冬天吃一碗暖到心里。",tip:"老孙家、老米家泡馍，掰馍要掰小块"},
      {icon:"🍜",name:"biangbiang面",desc:"陕西特色宽面，一根面条有裤带那么宽，配上油泼辣子，香辣过瘾。",tip:"回民街和永兴坊都有"},
      {icon:"🥟",name:"饺子宴",desc:"西安特色，一桌饺子几十种馅料和造型，蒸煎煮炸样样有。德发长最有名。",tip:"德发长饺子馆，需提前预约"},
      {icon:"🫕",name:"凉皮",desc:"西安街头最常见的小吃，米皮或面皮配上辣椒油、醋、蒜，夏天吃最爽。",tip:"魏家凉皮、盛志望麻酱酿皮"},
      {icon:"🍖",name:"葫芦鸡",desc:"西安传统名菜，整鸡先煮后蒸再炸，外酥里嫩，形似葫芦。",tip:"西安饭庄、春发生"},
    ],
    guide: [
      {icon:"✈️",title:"交通指南",content:"<ul><li><b>飞机：</b>咸阳国际机场，机场大巴/地铁14号线到市区约1小时</li><li><b>高铁：</b>西安北站，地铁2号线直达市中心</li><li><b>市内：</b>地铁覆盖主要景点，公交发达</li><li><b>兵马俑：</b>火车站坐游5路(306路)直达，约1小时</li></ul>"},
      {icon:"🏨",title:"住宿推荐",content:"<ul><li><b>钟楼/鼓楼附近：</b>市中心，回民街步行可达（200-500元/晚）</li><li><b>大雁塔附近：</b>靠近大雁塔和陕西历史博物馆（200-400元/晚）</li><li><b>城墙内：</b>老城区氛围好，出行方便（180-400元/晚）</li></ul>"},
      {icon:"🌤️",title:"最佳时间",content:"<p><b>最佳：3-5月、9-11月</b>，气候舒适，适合户外活动。</p><p>春天可以去青龙寺看樱花，秋天城墙上看银杏。</p><p>夏天较热但可以去华山避暑。冬天冷但游客少，酒店便宜。</p>"},
      {icon:"⚠️",title:"注意事项",content:"<ul><li>兵马俑一定要请导游或租讲解器，不然看不懂</li><li>回民街游客多价格偏高，可以去洒金桥吃更地道</li><li>华山需要体力，建议西峰上北峰下</li><li>陕西历史博物馆免费但要提前预约</li><li>城墙骑行建议下午去，可以看到日落</li></ul>"},
    ],
  },
  hangzhou: {
    attractions: [
      {icon:"🌸",name:"西湖",desc:"杭州的灵魂，苏堤春晓、断桥残雪、雷峰夕照等十景闻名天下。骑行环湖是最惬意的方式。",ticket:"免费",time:"建议1天"},
      {icon:"🙏",name:"灵隐寺",desc:"杭州最古老的寺庙，飞来峰石刻造像精美。香火旺盛，是求姻缘和事业的热门去处。",ticket:"75元(含飞来峰)",time:"建议半天"},
      {icon:"🏞️",name:"千岛湖",desc:"1078个岛屿散落湖中，水质清澈可直接饮用。坐船游湖、登梅峰观岛是必体验。",ticket:"150元",time:"建议1天"},
      {icon:"🎭",name:"宋城",desc:"以宋代文化为主题的乐园，《宋城千古情》演出震撼，被称为世界三大名秀之一。",ticket:"290元(含演出)",time:"建议半天-1天"},
      {icon:"🍵",name:"龙井村",desc:"西湖龙井的产地，茶田层层叠叠，春天可以看采茶、品新茶。茶香四溢的世外桃源。",ticket:"免费",time:"建议2-3小时"},
      {icon:"🏛️",name:"浙江省博物馆",desc:"了解浙江历史文化的好去处，良渚文化展品是镇馆之宝。免费参观。",ticket:"免费",time:"建议2-3小时"},
    ],
    food: [
      {icon:"🐟",name:"西湖醋鱼",desc:"杭帮菜代表，西湖草鱼用醋汁浇淋，酸甜适口。楼外楼的最正宗。",tip:"楼外楼、知味观"},
      {icon:"🥩",name:"东坡肉",desc:"苏东坡发明的名菜，五花肉慢炖入味，肥而不腻，入口即化。",tip:"楼外楼、外婆家"},
      {icon:"🦐",name:"龙井虾仁",desc:"杭帮菜经典，新鲜河虾仁配龙井茶叶，清香鲜嫩。",tip:"知味观、楼外楼"},
      {icon:"🥟",name:"小笼包",desc:"杭州小笼包皮薄汁多，蟹粉小笼最受欢迎。知味观的小笼是招牌。",tip:"知味观、新丰小吃"},
      {icon:"🍜",name:"片儿川",desc:"杭州特色面，笋片+雪菜+肉片，汤头鲜美。是杭州人最日常的一碗面。",tip:"奎元馆、慧娟面馆"},
      {icon:"🍵",name:"龙井茶",desc:"中国十大名茶之首，明前龙井最珍贵。在龙井村茶农家喝茶是最地道的体验。",tip:"龙井村、梅家坞"},
    ],
    guide: [
      {icon:"✈️",title:"交通指南",content:"<ul><li><b>飞机：</b>萧山国际机场，机场大巴/地铁到市区约1小时</li><li><b>高铁：</b>杭州东站/杭州站，地铁直达市中心</li><li><b>市内：</b>地铁+公交覆盖全面，西湖周边骑行最方便</li><li><b>千岛湖：</b>杭州西站高铁约1小时，或自驾约2.5小时</li></ul>"},
      {icon:"🏨",title:"住宿推荐",content:"<ul><li><b>西湖附近：</b>步行可达西湖，价格偏高（300-800元/晚）</li><li><b>武林广场：</b>市中心商圈，交通便利（200-500元/晚）</li><li><b>河坊街/南宋御街：</b>老城区氛围，美食多（200-400元/晚）</li></ul>"},
      {icon:"🌤️",title:"最佳时间",content:"<p><b>最佳：3-5月、9-11月</b>，春天看樱花和龙井新茶，秋天桂花飘香。</p><p>夏天热但可以去千岛湖避暑。冬天断桥残雪很美但不一定能看到。</p><p>清明前后是龙井茶季，可以体验采茶。</p>"},
      {icon:"⚠️",title:"注意事项",content:"<ul><li>西湖节假日人超多，建议工作日或早上去</li><li>灵隐寺要先买飞来峰门票再买寺庙门票</li><li>宋城千古情演出要提前订票，旺季常售罄</li><li>龙井茶买明前的最正宗，注意辨别真假</li><li>西湖骑行建议扫码共享单车，不用租贵的</li></ul>"},
    ],
  },
  dali: {
    attractions: [
      {icon:"⛰️",name:"苍山",desc:"十九峰十八溪，云雾缭绕如仙境。坐索道上山可俯瞰洱海全景，洗马潭是最美高山湖泊。",ticket:"索道单程150元",time:"建议半天-1天"},
      {icon:"🌊",name:"洱海",desc:"大理的灵魂，环湖骑行128公里是最经典的体验。双廊、才村、喜洲各有风情。",ticket:"免费",time:"建议1-2天"},
      {icon:"🏘️",name:"大理古城",desc:"始建于明代的古城，青石板路、白族民居、文艺小店。洋人街和人民路最热闹。",ticket:"免费",time:"建议半天"},
      {icon:"🏯",name:"崇圣寺三塔",desc:"大理标志性景点，三座白塔矗立千年。倒影池拍三塔倒影是最经典的角度。",ticket:"75元",time:"建议2小时"},
      {icon:"🏘️",name:"双廊古镇",desc:"洱海边最美小镇，面朝大海，春暖花开。杨丽萍的太阳宫和月亮宫就在这里。",ticket:"免费",time:"建议半天"},
      {icon:"🏘️",name:"喜洲古镇",desc:"白族建筑保存最好的古镇，喜洲粑粑是特色小吃。稻田和古镇相映成趣。",ticket:"免费",time:"建议2-3小时"},
    ],
    food: [
      {icon:"🫓",name:"喜洲粑粑",desc:"白族特色面食，烤制而成，外酥里嫩，有甜咸两种口味。喜洲古镇现烤的最好吃。",tip:"喜洲古镇入口处"},
      {icon:"🐟",name:"酸辣鱼",desc:"大理特色菜，洱海鲫鱼用酸木瓜和辣椒烹制，酸辣开胃。",tip:"大理古城人民路"},
      {icon:"🍵",name:"三道茶",desc:"白族待客之道，一苦二甜三回味，蕴含人生哲理。",tip:"喜洲严家大院有表演"},
      {icon:"🍜",name:"饵丝/饵块",desc:"大理主食，大米制成。炒饵块、煮饵丝都好吃，是大理人的日常。",tip:"古城内随处可见"},
      {icon:"🥛",name:"乳扇",desc:"白族特色乳制品，可以烤着吃或炸着吃，蘸玫瑰酱是绝配。",tip:"古城街头小摊"},
      {icon:"🌹",name:"鲜花饼",desc:"云南特色伴手礼，玫瑰花馅料香甜。大理有很多手工鲜花饼店。",tip:"嘉华鲜花饼"},
    ],
    guide: [
      {icon:"✈️",title:"交通指南",content:"<ul><li><b>飞机：</b>大理机场，距古城约30公里，机场大巴/打车约40分钟</li><li><b>高铁：</b>大理站，距古城约15公里，公交/打车约30分钟</li><li><b>环洱海：</b>租电动车或包车，一圈约128公里</li><li><b>古城内：</b>步行为主，景点间距离不远</li></ul>"},
      {icon:"🏨",title:"住宿推荐",content:"<ul><li><b>大理古城：</b>最方便，吃喝逛都在步行范围（150-400元/晚）</li><li><b>双廊：</b>海景房首选，看洱海日落（200-600元/晚）</li><li><b>才村/龙龛：</b>安静，离古城近，性价比高（100-300元/晚）</li></ul>"},
      {icon:"🌤️",title:"最佳时间",content:"<p><b>最佳：3-5月、9-11月</b>，春天樱花盛开，秋天天气晴朗。</p><p>6-8月是雨季但也是花季。冬天阳光充足，是晒太阳的好时候。</p><p>农历三月十五（约4月）有三月街民族节。</p>"},
      {icon:"⚠️",title:"注意事项",content:"<ul><li>大理紫外线强，防晒必备</li><li>环洱海骑行注意电动车电量，提前规划充电点</li><li>古城内银器店很多，购买需谨慎辨别真假</li><li>苍山上气温低，带件外套</li><li>双廊旺季住宿要提前预订</li></ul>"},
    ],
  },
  lijiang: {
    attractions: [
      {icon:"🏘️",name:"丽江古城",desc:"世界文化遗产，纳西族古城。四方街、木府、大水车是标志。夜晚的酒吧街很热闹。",ticket:"古城维护费50元",time:"建议1天"},
      {icon:"🏔️",name:"玉龙雪山",desc:"纳西族神山，海拔5596米。大索道到4680米是离雪山最近的地方。蓝月谷美如仙境。",ticket:"100元+大索道120元",time:"建议1天"},
      {icon:"🌊",name:"泸沽湖",desc:"高原明珠，湖水清澈见底。摩梭族走婚文化独特，猪槽船游湖是必体验。",ticket:"70元",time:"建议2天"},
      {icon:"🏘️",name:"束河古镇",desc:"比丽江古城更安静的古镇，纳西族风情浓郁。茶马古道博物馆值得一看。",ticket:"免费",time:"建议半天"},
      {icon:"💧",name:"蓝月谷",desc:"玉龙雪山脚下的蓝色湖泊，湖水因矿物质呈现梦幻蓝色。拍照超美。",ticket:"含在雪山门票内",time:"建议2小时"},
      {icon:"🎭",name:"印象丽江",desc:"张艺谋导演的大型实景演出，以玉龙雪山为背景，500多位当地演员参演。",ticket:"190元",time:"约1小时"},
    ],
    food: [
      {icon:"🐟",name:"腊排骨火锅",desc:"丽江特色，腊排骨炖煮入味，配上蔬菜和豆腐，冬天吃最暖和。",tip:"钰洁腊排骨、滇厨餐厅"},
      {icon:"🐔",name:"三文鱼",desc:"丽江的三文鱼是虹鳟鱼，清蒸或刺身都好吃。沱江鱼府最有名。",tip:"沱江鱼府"},
      {icon:"🍜",name:"鸡豆凉粉",desc:"纳西族特色小吃，鸡豆磨成粉制成凉粉，凉拌或煎着吃。",tip:"古城内小摊"},
      {icon:"🫖",name:"酥油茶",desc:"纳西族传统饮品，咸香浓郁。第一次喝可能不习惯，但配粑粑很搭。",tip:"古城茶馆"},
      {icon:"🍖",name:"黑山羊火锅",desc:"丽江本地黑山羊，肉质鲜嫩无膻味。配上蘸水，冬天吃最过瘾。",tip:"阿寿第一家"},
      {icon:"🍪",name:"丽江粑粑",desc:"纳西族传统面食，层层酥脆，有甜咸两种。古城内很多店在卖。",tip:"古城内"},
    ],
    guide: [
      {icon:"✈️",title:"交通指南",content:"<ul><li><b>飞机：</b>丽江三义机场，距古城约28公里，机场大巴20元</li><li><b>高铁：</b>丽江站，公交/打车到古城约20分钟</li><li><b>泸沽湖：</b>大巴约4-5小时，或飞机30分钟</li><li><b>古城内：</b>步行为主，石板路不适合拉杆箱</li></ul>"},
      {icon:"🏨",title:"住宿推荐",content:"<ul><li><b>丽江古城内：</b>最有氛围，纳西庭院客栈（150-500元/晚）</li><li><b>束河古镇：</b>更安静，性价比高（100-300元/晚）</li><li><b>泸沽湖：</b>里格半岛湖景房最美（200-600元/晚）</li></ul>"},
      {icon:"🌤️",title:"最佳时间",content:"<p><b>最佳：4-5月、9-10月</b>，天气晴朗，适合户外活动。</p><p>6-9月是雨季，但雨后常有彩虹。冬天阳光充足但早晚冷。</p><p>泸沽湖5-10月最美，水性杨花盛开。</p>"},
      {icon:"⚠️",title:"注意事项",content:"<ul><li>丽江海拔2400米，刚到可能有轻微高反</li><li>玉龙雪山大索道要提前预约，旺季常售罄</li><li>古城酒吧街很吵，住宿避开这条街</li><li>泸沽湖路况复杂，建议包车或跟团</li><li>拉市海骑马要选正规马场，避免被宰</li></ul>"},
    ],
  },
  xiamen: {
    attractions: [
      {icon:"🏝️",name:"鼓浪屿",desc:"万国建筑博物馆，钢琴之岛。日光岩是最高点，菽庄花园藏海补山。小巷里藏着各种文艺小店。",ticket:"轮渡35元",time:"建议1天"},
      {icon:"🏫",name:"厦门大学",desc:"中国最美大学之一，芙蓉湖、芙蓉隧道涂鸦墙是标志。需预约入校。",ticket:"免费(需预约)",time:"建议2小时"},
      {icon:"🏘️",name:"曾厝垵",desc:"文艺渔村，各种小吃和手工艺品。离海边近，适合傍晚逛。",ticket:"免费",time:"建议2-3小时"},
      {icon:"🛕",name:"南普陀寺",desc:"闽南佛教圣地，紧邻厦大。素斋很有名，后山可以俯瞰厦门。",ticket:"免费",time:"建议2小时"},
      {icon:"🌊",name:"环岛路",desc:"沿海公路，骑行或散步都很惬意。一国两制标语牌是网红打卡点。",ticket:"免费",time:"建议2-3小时"},
      {icon:"🍜",name:"中山路步行街",desc:"厦门最繁华的商业街，骑楼建筑风格独特。各种闽南小吃集中。",ticket:"免费",time:"建议2-3小时"},
    ],
    food: [
      {icon:"🍜",name:"沙茶面",desc:"厦门第一小吃，沙茶汤底浓郁，配上各种海鲜和内脏，每家店味道都不同。",tip:"乌糖沙茶面、月华沙茶面"},
      {icon:"🥟",name:"海蛎煎",desc:"闽南特色，鸡蛋和海蛎煎成饼，蘸甜辣酱吃。中山路和曾厝垵都有。",tip:"莲欢海蛎煎"},
      {icon:"🍲",name:"姜母鸭",desc:"厦门人冬天必吃，姜味浓郁，鸭肉入味。配上米酒更地道。",tip:"洪长全姜母鸭"},
      {icon:"🫖",name:"功夫茶",desc:"闽南人生活必需品，铁观音是主角。找家茶馆坐下来品茶是厦门慢生活。",tip:"中山路附近茶庄"},
      {icon:"🥜",name:"花生汤",desc:"厦门甜品，花生炖得软烂，汤甜而不腻。配油条是经典早餐。",tip:"黄则和花生汤"},
      {icon:"🍖",name:"烧肉粽",desc:"闽南粽子，五花肉+香菇+板栗+干贝，料足味美。1980烧肉粽最有名。",tip:"1980烧肉粽"},
    ],
    guide: [
      {icon:"✈️",title:"交通指南",content:"<ul><li><b>飞机：</b>高崎国际机场，地铁/公交到市区约30分钟</li><li><b>高铁：</b>厦门站(岛内)或厦门北站(岛外)</li><li><b>鼓浪屿：</b>东渡码头坐轮渡约20分钟，需提前买票</li><li><b>市内：</b>BRT快速公交+地铁+公交覆盖全面</li></ul>"},
      {icon:"🏨",title:"住宿推荐",content:"<ul><li><b>中山路/轮渡附近：</b>去鼓浪屿方便，吃喝方便（200-500元/晚）</li><li><b>曾厝垵：</b>文艺氛围好，离海边近（150-400元/晚）</li><li><b>鼓浪屿岛上：</b>最有氛围，但价格偏高（300-800元/晚）</li></ul>"},
      {icon:"🌤️",title:"最佳时间",content:"<p><b>最佳：3-5月、10-12月</b>，气候舒适，适合户外活动。</p><p>夏天热但海风凉爽。冬天温暖，是避寒好去处。</p><p>10月有厦门国际马拉松。</p>"},
      {icon:"⚠️",title:"注意事项",content:"<ul><li>鼓浪屿船票要提前在公众号预约，旺季常售罄</li><li>厦门大学限流，要提前3天预约</li><li>曾厝垵小吃价格偏高，可以去中山路吃更正宗</li><li>环岛路骑车注意防晒</li><li>南普陀寺素斋要排队，建议早去</li></ul>"},
    ],
  },
  qingdao: {
    attractions: [
      {icon:"🌊",name:"栈桥",desc:"青岛标志性建筑，伸入海中440米。回澜阁是观赏海景和小青岛的最佳位置。",ticket:"免费",time:"建议1小时"},
      {icon:"🏘️",name:"八大关",desc:"万国建筑博览会，200多栋欧式建筑掩映在绿树中。秋天银杏叶最美。",ticket:"免费",time:"建议2-3小时"},
      {icon:"⛰️",name:"崂山",desc:"海上第一名山，道教圣地。南线看海，北线看山。太清宫最值得去。",ticket:"90元",time:"建议1天"},
      {icon:"🍺",name:"青岛啤酒博物馆",desc:"了解青岛啤酒百年历史，原浆啤酒品尝是亮点。就在啤酒街旁边。",ticket:"60元",time:"建议2小时"},
      {icon:"🏖️",name:"金沙滩",desc:"亚洲第一滩，沙质细腻金黄。夏天可以游泳、冲浪、沙滩排球。",ticket:"免费",time:"建议半天"},
      {icon:"⛪",name:"天主教堂",desc:"哥特式建筑，双塔尖顶是青岛天际线的一部分。内部彩绘玻璃很美。",ticket:"10元",time:"建议30分钟"},
    ],
    food: [
      {icon:"🦐",name:"海鲜大餐",desc:"青岛海鲜新鲜又便宜，辣炒蛤蜊、清蒸海螺、烤鱿鱼是标配。营口路海鲜市场最地道。",tip:"营口路海鲜市场买完找店加工"},
      {icon:"🍺",name:"青岛啤酒",desc:"来青岛必须喝原浆啤酒，和瓶装的完全不同。啤酒街和登州路啤酒街最正宗。",tip:"登州路啤酒街，塑料袋装啤酒是特色"},
      {icon:"🥟",name:"鲅鱼水饺",desc:"青岛特色，鲅鱼肉做馅，鲜美多汁。比普通水饺鲜太多了。",tip:"船歌鱼水饺"},
      {icon:"🍖",name:"烤鱿鱼",desc:"青岛街头小吃之王，新鲜鱿鱼现烤，撒上辣椒面和孜然。",tip:"台东夜市"},
      {icon:"🍲",name:"海鲜锅",desc:"一锅各种海鲜蒸煮，原汁原味。配上青岛啤酒，绝配。",tip:"前海沿、大杰海鲜锅"},
      {icon:"🫓",name:"流亭猪蹄",desc:"青岛名小吃，猪蹄卤制入味，软烂脱骨。",tip:"周钦公流亭猪蹄"},
    ],
    guide: [
      {icon:"✈️",title:"交通指南",content:"<ul><li><b>飞机：</b>胶东国际机场，机场大巴/地铁到市区约1.5小时</li><li><b>高铁：</b>青岛站(老城区)或青岛北站</li><li><b>市内：</b>地铁+公交覆盖全面，老城区步行即可</li><li><b>崂山：</b>公交或打车约1小时</li></ul>"},
      {icon:"🏨",title:"住宿推荐",content:"<ul><li><b>栈桥/中山路附近：</b>老城区，景点集中（200-500元/晚）</li><li><b>八大关/太平角：</b>环境好，离海边近（300-800元/晚）</li><li><b>台东商圈：</b>吃喝方便，夜市热闹（150-350元/晚）</li></ul>"},
      {icon:"🌤️",title:"最佳时间",content:"<p><b>最佳：5-10月</b>，夏天可以洗啤酒节，秋天八大关银杏最美。</p><p>8月有青岛国际啤酒节。冬天风大冷，但游客少。</p><p>7-8月是旺季，住宿要提前订。</p>"},
      {icon:"⚠️",title:"注意事项",content:"<ul><li>海鲜配啤酒容易痛风，适量食用</li><li>营口路海鲜市场买海鲜要看秤，找靠谱加工店</li><li>崂山南线看海景，北线看山景，选一条即可</li><li>栈桥节假日人很多，建议早上去</li><li>金沙滩在黄岛区，需要坐隧道公交或地铁</li></ul>"},
    ],
  },
  guilin: {
    attractions: [
      {icon:"🏞️",name:"漓江",desc:"桂林山水精华，从桂林到阳朔83公里是世界级风光。竹筏漂流或游船都值得体验。",ticket:"游船216元",time:"建议1天"},
      {icon:"⛰️",name:"阳朔西街",desc:"洋人街，背包客天堂。各种酒吧、餐厅、手工艺品店。晚上最热闹。",ticket:"免费",time:"建议半天-1天"},
      {icon:"🌊",name:"遇龙河",desc:"小漓江，比漓江更安静。竹筏漂流看田园风光，是阳朔最美的体验。",ticket:"竹筏约200元",time:"建议半天"},
      {icon:"🌾",name:"龙脊梯田",desc:"壮族梯田，层层叠叠从山脚到山顶。平安寨和金坑大寨各有特色。春天灌水和秋天金黄最美。",ticket:"80元",time:"建议1天"},
      {icon:"🐘",name:"象鼻山",desc:"桂林市徽，山形酷似大象饮水。訾洲公园是拍象鼻山全景的最佳角度。",ticket:"免费",time:"建议1小时"},
      {icon:"🏔️",name:"银子岩",desc:"喀斯特溶洞，钟乳石在灯光下如银子般闪耀。音乐石屏和瑶池仙境最震撼。",ticket:"65元",time:"建议2小时"},
    ],
    food: [
      {icon:"🍜",name:"桂林米粉",desc:"桂林第一小吃，卤菜粉最经典。干拌吃法，配上酸豆角和辣椒。",tip:"崇善米粉、日头火米粉"},
      {icon:"🐟",name:"啤酒鱼",desc:"阳朔特色，漓江鲜鱼用啤酒焖煮，鱼肉鲜嫩入味。",tip:"大师傅啤酒鱼、谢大姐啤酒鱼"},
      {icon:"🍲",name:"荔浦芋头扣肉",desc:"桂林名菜，荔浦芋头和五花肉交替蒸制，软烂入味。",tip:"椿记烧鹅"},
      {icon:"🐔",name:"田螺酿",desc:"桂林十八酿之一，田螺肉剁碎加调料再塞回螺壳，鲜美独特。",tip:"阳朔西街"},
      {icon:"🍵",name:"油茶",desc:"桂林人的早餐，茶叶和花生捣碎煮成，配上米花和排散。",tip:"恭城油茶"},
      {icon:"🍖",name:"椿记烧鹅",desc:"桂林最火的烧鹅店，皮脆肉嫩，蘸梅子酱吃。",tip:"椿记烧鹅多家分店"},
    ],
    guide: [
      {icon:"✈️",title:"交通指南",content:"<ul><li><b>飞机：</b>两江国际机场，机场大巴到市区约40分钟</li><li><b>高铁：</b>桂林站/桂林北站</li><li><b>漓江：</b>桂林码头上船，阳朔下船</li><li><b>龙脊梯田：</b>桂林坐大巴约2小时</li></ul>"},
      {icon:"🏨",title:"住宿推荐",content:"<ul><li><b>桂林市区：</b>两江四湖附近，夜景美（150-400元/晚）</li><li><b>阳朔西街：</b>最热闹，吃喝方便（150-400元/晚）</li><li><b>阳朔遇龙河：</b>田园风光，安静（200-500元/晚）</li></ul>"},
      {icon:"🌤️",title:"最佳时间",content:"<p><b>最佳：4-10月</b>，夏天可以玩水，秋天龙脊梯田金黄最美。</p><p>春天3-4月烟雨漓江最有意境。</p><p>冬天是枯水期，漓江水位低，体验稍差。</p>"},
      {icon:"⚠️",title:"注意事项",content:"<ul><li>漓江游船要提前订票，旺季常售罄</li><li>龙脊梯田山路弯多，晕车的提前吃药</li><li>阳朔西街酒吧多，晚上比较吵</li><li>遇龙河竹筏有年龄限制，1.2米以下儿童不能坐</li><li>桂林米粉要干拌吃才正宗</li></ul>"},
    ],
  },
  lhasa: {
    attractions: [
      {icon:"🏛️",name:"布达拉宫",desc:"世界屋脊上的宫殿，藏传佛教圣地。红宫白宫金顶辉煌，内部壁画和佛像令人震撼。",ticket:"200元(旺季)",time:"建议2-3小时"},
      {icon:"🛕",name:"大昭寺",desc:"藏传佛教最神圣的寺庙，供奉着释迦牟尼12岁等身像。门前磕长头的信徒令人动容。",ticket:"85元",time:"建议2小时"},
      {icon:"🏘️",name:"八廓街",desc:"拉萨最古老的街道，转经路上朝圣者络绎不绝。各种藏饰店、甜茶馆、唐卡店林立。",ticket:"免费",time:"建议2-3小时"},
      {icon:"🏔️",name:"纳木错",desc:"世界最高大湖，海拔4718米。湖水碧蓝如宝石，念青唐古拉山倒映湖中。",ticket:"120元",time:"建议1天"},
      {icon:"🛕",name:"色拉寺",desc:"藏传佛教格鲁派六大寺之一，下午3点的辩经是最精彩的看点。",ticket:"50元",time:"建议2-3小时"},
      {icon:"🏔️",name:"哲蚌寺",desc:"世界最大的寺庙，曾有僧侣上万人。雪顿节晒佛仪式壮观。",ticket:"50元",time:"建议2小时"},
    ],
    food: [
      {icon:"🍵",name:"甜茶",desc:"拉萨人的日常饮品，红茶加牛奶和糖，香甜浓郁。光明港琼甜茶馆最有氛围。",tip:"光明港琼甜茶馆，一杯几毛钱"},
      {icon:"🍜",name:"藏面",desc:"拉萨主食，青稞面制成，配上牛肉汤。简单但很暖和。",tip:"光明港琼甜茶馆"},
      {icon:"🥩",name:"牦牛肉",desc:"高原特色，牦牛肉干是伴手礼首选。炖牦牛肉鲜嫩有嚼劲。",tip:"娜玛瑟德餐厅"},
      {icon:"🫓",name:"糌粑",desc:"藏族主食，青稞粉加酥油茶捏成团。第一次可能不习惯，但值得尝试。",tip:"藏族家庭或藏餐馆"},
      {icon:"🍺",name:"青稞酒",desc:"藏族传统饮品，度数不高，微甜。节日和待客必备。",tip:"拉萨酒吧街"},
      {icon:"🍲",name:"火锅",desc:"拉萨的牦牛肉火锅很有特色，高原上吃火锅别有风味。",tip:"娜玛瑟德、玛吉阿米"},
    ],
    guide: [
      {icon:"✈️",title:"交通指南",content:"<ul><li><b>飞机：</b>贡嘎机场，距市区约60公里，机场大巴约1小时</li><li><b>火车：</b>拉萨站，青藏铁路终点，格尔木到拉萨约14小时</li><li><b>市内：</b>出租车起步价10元，公交覆盖主要景点</li><li><b>纳木错：</b>包车约4-5小时单程</li></ul>"},
      {icon:"🏨",title:"住宿推荐",content:"<ul><li><b>八廓街/大昭寺附近：</b>最方便，氛围最好（150-400元/晚）</li><li><b>布达拉宫附近：</b>交通便利，酒店多（200-500元/晚）</li><li><b>仙足岛：</b>安静，有青旅（80-200元/晚）</li></ul>"},
      {icon:"🌤️",title:"最佳时间",content:"<p><b>最佳：6-10月</b>，氧气充足，气候舒适。</p><p>7-8月是雨季但白天晴天多。冬天阳光充足但寒冷，游客少。</p><p>雪顿节(8月)有晒佛仪式和藏戏表演。</p>"},
      {icon:"⚠️",title:"注意事项",content:"<ul><li><b>高反：</b>拉萨海拔3650米，前2天不要剧烈运动，多喝水</li><li>布达拉宫每天限流5000人，旺季要提前7天预约</li><li>寺庙参观要顺时针转，不要逆时针</li><li>纳木错海拔4718米，高反严重者慎去</li><li>尊重当地宗教习惯，不要摸小孩头</li><li>拍照前要征得同意，有些地方禁止拍照</li></ul>"},
    ],
  },
};

// Generate pages
for (const city of data.cities) {
  const cityDir = path.join(ROOT, 'city', city.id);
  fs.mkdirSync(cityDir, { recursive: true });
  
  const content = cityContent[city.id];
  if (!content) { console.log(`⚠️ ${city.name}: 无内容数据，跳过`); continue; }
  
  let page = generateCityPage({...city, ...content});
  page = page.replace('__ATTRACTIONS__', JSON.stringify(content.attractions));
  page = page.replace('__FOOD__', JSON.stringify(content.food));
  page = page.replace('__GUIDE__', JSON.stringify(content.guide));
  
  fs.writeFileSync(path.join(cityDir, 'index.html'), page);
  console.log(`✅ ${city.name}: city/${city.id}/`);
}
console.log('\n🎉 Done!');
