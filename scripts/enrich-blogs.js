#!/usr/bin/env node
/* eslint-disable */
/*
 * enrich-blogs.js — 为 123 篇城市博客扩写真实正文
 * 做法：按题材分桶，从博客标题匹配该城最相关景点，把已生成的独家结构化数据
 *      （景点 seoDesc/tips、美食、行程、faqs）注入笔澜撰写的文章骨架，
 *      产出具体、独特、可读的长文，写入每条 blog.body（HTML 字符串）。
 * 幂等：每次重跑都会基于当前 cities.json 重新生成 body（数据稳定，覆盖即可）。
 * 依赖：仅 Node 内置 fs，无需安装。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'cities.json');

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bucketOf(t) {
  if (/美食|吃|小吃|餐厅|海鲜|米线|水席|吃货/.test(t)) return '美食';
  if (/小众|秘境|冷门|避坑|人少|深度游|深度/.test(t)) return '小众';
  if (/住宿|酒店|民宿/.test(t)) return '住宿';
  if (/自驾|租车/.test(t)) return '自驾';
  if (/行程|路线|日游|规划|几日|玩几天|怎么玩/.test(t)) return '行程';
  return '综合';
}

function matchAttractions(city, title, n) {
  const chunks = (title.match(/[一-龥]{2,4}/g) || []).map((s) => s.toLowerCase());
  const attrs = city.attractions || [];
  if (!chunks.length) return attrs.slice(0, n);
  const scored = attrs
    .map((a) => {
      const hay = (a.name + ' ' + (a.seoDesc || '') + ' ' + (a.desc || '')).toLowerCase();
      let s = 0;
      chunks.forEach((ch) => {
        if (hay.includes(ch)) s += ch.length;
      });
      return { a, s };
    })
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s);
  const top = scored.slice(0, n).map((x) => x.a);
  return top.length ? top : attrs.slice(0, n);
}

function matchFoods(city, title, n) {
  const chunks = (title.match(/[一-龥]{2,4}/g) || []).map((s) => s.toLowerCase());
  const foods = city.food || [];
  if (!chunks.length) return foods.slice(0, n);
  const scored = foods
    .map((f) => {
      const hay = (f.name + ' ' + (f.desc || '')).toLowerCase();
      let s = 0;
      chunks.forEach((ch) => {
        if (hay.includes(ch)) s += 2;
      });
      return { f, s };
    })
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s);
  const top = scored.slice(0, n).map((x) => x.f);
  return top.length ? top : foods.slice(0, n);
}

function buildBody(city, blog) {
  const excerpt = blog.excerpt || '';
  const bucket = bucketOf(blog.title);
  const matched = matchAttractions(city, blog.title, 3);
  const L = [];

  if (excerpt) L.push(`<p class="blog-lead">${esc(excerpt)}</p>`);

  // 为什么值得去
  L.push('<h2 class="blog-h2">为什么值得去</h2>');
  if (matched[0]) {
    L.push(`<p>${esc(matched[0].seoDesc || matched[0].desc || '')}</p>`);
  } else if (city.seoIntro) {
    L.push(`<p>${esc(city.seoIntro)}</p>`);
  } else {
    L.push(`<p>${esc(city.description || city.tagline || '')}</p>`);
  }

  if (bucket === '美食') {
    L.push('<h2 class="blog-h2">不可错过的味道</h2>');
    const foods = matchFoods(city, blog.title, 4);
    if (foods.length) {
      L.push('<ul class="blog-food">');
      foods.forEach((f) => {
        const tip = f.tip ? ` <em>${esc(f.tip)}</em>` : '';
        L.push(`<li><strong>${esc(f.name)}</strong>：${esc(f.desc || '')}${tip}</li>`);
      });
      L.push('</ul>');
    } else {
      L.push(`<p>${esc(city.name)}的街头巷尾藏着最地道的烟火气，跟着本地人的脚步，才能吃到真正的风味。</p>`);
    }
  } else if (bucket === '行程') {
    if (city.itinerary && city.itinerary.length) {
      L.push('<h2 class="blog-h2">推荐行程</h2>');
      L.push('<div class="blog-plan">');
      city.itinerary.slice(0, 3).forEach((d) => {
        L.push(
          `<div class="plan-day"><span class="plan-day-no">第${esc(d.day)}天</span><span class="plan-day-title">${esc(
            d.title || ''
          )}</span></div>`
        );
        L.push(
          '<ul class="plan-items">' +
            ((d.items || []).map((i) => `<li>${esc(i)}</li>`).join('')) +
            '</ul>'
        );
      });
      L.push('</div>');
    }
    L.push('<h2 class="blog-h2">沿途亮点</h2>');
    matched.slice(0, 3).forEach((a) => {
      L.push(`<h3 class="blog-h3">${esc(a.name)}</h3>`);
      if (a.seoDesc) L.push(`<p>${esc(a.seoDesc)}</p>`);
    });
  } else if (bucket === '小众' || bucket === '住宿' || bucket === '自驾') {
    L.push('<h2 class="blog-h2">实用建议</h2>');
    if (matched[0]) {
      L.push(`<p><strong>${esc(matched[0].name)}</strong>：${esc(matched[0].seoDesc || matched[0].desc || '')}</p>`);
      if (matched[1] && matched[1].seoDesc) {
        L.push(`<p><strong>${esc(matched[1].name)}</strong>：${esc(matched[1].seoDesc)}</p>`);
      }
    }
    L.push(
      `<p>想玩得从容，建议避开高峰时段、提前确认开放信息，并把${esc(
        city.name
      )}的气候与交通纳入规划——细节往往是体验的分水岭。</p>`
    );
  } else {
    // 综合攻略：不可错过的体验
    L.push('<h2 class="blog-h2">不可错过的体验</h2>');
    if (matched.length) {
      matched.slice(0, 3).forEach((a) => {
        L.push(`<h3 class="blog-h3">${esc(a.name)}</h3>`);
        if (a.seoDesc) L.push(`<p>${esc(a.seoDesc)}</p>`);
      });
    } else {
      L.push(`<p>${esc(city.name)}的精彩，藏在每一个转角。放慢脚步，才能读懂它的气质。</p>`);
    }
  }

  // 本地贴士（来自匹配景点的真实 tips）
  const allTips = [];
  matched.slice(0, 2).forEach((a) => (a.tips || []).forEach((t) => allTips.push(t)));
  if (allTips.length) {
    L.push('<h2 class="blog-h2">🧭 本地贴士</h2>');
    L.push('<ul class="blog-tips">' + allTips.map((t) => `<li>${esc(t)}</li>`).join('') + '</ul>');
  }

  // 常见问题
  if (city.faqs && city.faqs.length) {
    L.push('<h2 class="blog-h2">常见问题</h2>');
    L.push('<div class="blog-faq">');
    city.faqs.slice(0, 2).forEach((f) => {
      L.push(`<details class="faq-item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`);
    });
    L.push('</div>');
  }

  // CTA
  L.push(
    `<div class="blog-cta">还想了解更多？查看 <a href="../guide.html">${esc(
      city.name
    )}游玩攻略</a>、<a href="../itinerary.html">行程规划</a> 或 <a href="../attractions.html">全部景点</a>。</div>`
  );

  return L.join('\n');
}

function main() {
  const raw = fs.readFileSync(DATA, 'utf8');
  const data = JSON.parse(raw);
  const cities = data.cities || data;
  let count = 0;
  cities.forEach((c) => {
    (c.blogs || []).forEach((b) => {
      b.body = buildBody(c, b);
      count++;
    });
  });
  fs.writeFileSync(DATA, JSON.stringify(data, null, 2), 'utf8');
  console.log('✅ 已为', count, '篇博客生成 body 字段');
}

main();
