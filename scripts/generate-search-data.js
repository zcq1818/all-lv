#!/usr/bin/env node
/**
 * 从 cities.json 生成 attractions.json 搜索索引
 */
const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'cities.json'), 'utf8'));

const spots = [];

for (const city of data.cities) {
  for (const attr of (city.attractions || [])) {
    spots.push({
      id: `${city.id}-${attr.name}`,
      name: attr.name,
      desc: attr.desc,
      city: city.name,
      cityId: city.id,
      province: city.province,
      emoji: attr.icon || '📍',
      level: '景点',
      area: city.name,
      highlights: attr.desc ? attr.desc.slice(0, 30).split('，') : [],
      ticket: attr.ticket || '',
      time: attr.time || ''
    });
  }
  
  // Add food items as searchable spots
  for (const food of (city.food || [])) {
    spots.push({
      id: `${city.id}-food-${food.name}`,
      name: food.name,
      desc: food.desc || `${city.name}特色美食`,
      city: city.name,
      cityId: city.id,
      province: city.province,
      emoji: '🍜',
      level: '美食',
      area: city.name,
      highlights: [],
      ticket: '',
      time: ''
    });
  }
}

const output = { spots, total: spots.length };
fs.writeFileSync(path.join(__dirname, '..', 'data', 'attractions.json'), JSON.stringify(output, null, 2));
console.log(`✅ attractions.json: ${spots.length} 条搜索数据`);
