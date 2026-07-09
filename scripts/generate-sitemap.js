#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const SITE = 'https://lv.divdu.com';
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'cities.json'), 'utf8'));

const urls = [
  { loc: SITE + '/', priority: '1.0', changefreq: 'daily' },
];

for (const city of data.cities) {
  urls.push({ loc: `${SITE}/city/${city.id}/`, priority: '0.9', changefreq: 'weekly' });
  urls.push({ loc: `${SITE}/city/${city.id}/attractions`, priority: '0.8', changefreq: 'weekly' });
  urls.push({ loc: `${SITE}/city/${city.id}/food`, priority: '0.7', changefreq: 'weekly' });
  urls.push({ loc: `${SITE}/city/${city.id}/guide`, priority: '0.8', changefreq: 'weekly' });
  urls.push({ loc: `${SITE}/city/${city.id}/itinerary`, priority: '0.8', changefreq: 'weekly' });
  urls.push({ loc: `${SITE}/city/${city.id}/blog`, priority: '0.6', changefreq: 'weekly' });
  if (city.blogs) {
    for (const blog of city.blogs) {
      urls.push({ loc: `${SITE}/city/${city.id}/blog/${blog.slug}`, priority: '0.6', changefreq: 'monthly' });
    }
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority><changefreq>${u.changefreq}</changefreq></url>`).join('\n')}
</urlset>`;

// 英文子站 en/（若存在 data/cities.en.json 则纳入 sitemap）
const enPath = path.join(__dirname, '..', 'data', 'cities.en.json');
if (fs.existsSync(enPath)) {
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const enIds = new Set(enData.cities.map(c => c.id));
  urls.push({ loc: `${SITE}/en/`, priority: '0.9', changefreq: 'daily' });
  for (const city of data.cities) {
    if (!enIds.has(city.id)) continue;
    urls.push({ loc: `${SITE}/en/city/${city.id}/`, priority: '0.9', changefreq: 'weekly' });
    urls.push({ loc: `${SITE}/en/city/${city.id}/attractions`, priority: '0.8', changefreq: 'weekly' });
    urls.push({ loc: `${SITE}/en/city/${city.id}/food`, priority: '0.7', changefreq: 'weekly' });
    urls.push({ loc: `${SITE}/en/city/${city.id}/guide`, priority: '0.8', changefreq: 'weekly' });
    urls.push({ loc: `${SITE}/en/city/${city.id}/itinerary`, priority: '0.8', changefreq: 'weekly' });
    urls.push({ loc: `${SITE}/en/city/${city.id}/blog`, priority: '0.6', changefreq: 'weekly' });
    if (city.blogs) {
      for (const blog of city.blogs) {
        urls.push({ loc: `${SITE}/en/city/${city.id}/blog/${blog.slug}`, priority: '0.6', changefreq: 'monthly' });
      }
    }
  }
  // 重新写带 en 的 sitemap
  const xmlEn = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority><changefreq>${u.changefreq}</changefreq></url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), xmlEn);
  console.log(`✅ sitemap.xml: ${urls.length} URLs (含英文子站)`);
} else {
  fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), xml);
  console.log(`✅ sitemap.xml: ${urls.length} URLs`);
}
