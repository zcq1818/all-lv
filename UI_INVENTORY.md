# 全国旅游攻略站点 — 全部 UI 清单

> 本地预览地址：http://127.0.0.1:8099/
> 设计系统文件：/style.css（Design System v3.0，Google Blue / 海岸极简）

## 📊 UI 规模总览

| 类别 | 数量 | 说明 |
|------|------|------|
| 根级页面 | 2 | `index.html` 首页、`404.html` |
| 城市首页 | 28 | `/city/<城市>/index.html` |
| 城市景点页 | 28 | `/city/<城市>/attractions.html` |
| 城市美食页 | 28 | `/city/<城市>/food.html` |
| 城市攻略页 | 28 | `/city/<城市>/guide.html` |
| 城市行程页 | 28 | `/city/<城市>/itinerary.html` |
| 城市博客列表 | 28 | `/city/<城市>/blog.html` |
| 博客文章 | 84 | `/city/<城市>/blog/*.html` |
| **HTML 总计** | **254** | — |

## 🧩 全局组件（贯穿所有城市页）

| 组件 | 样式 | 脚本 | 功能 |
|------|------|------|------|
| 顶部导航 + 城市选择器 | style.css | — | 城市下拉切换（按省份分组） |
| 搜索浮层 | `/css/search.css` | `/js/search.js` | 站内全文搜索 |
| 天气小组件 | `/css/weather.css` | `/js/weather.js` | 目的地天气展示 |
| 分享组件 | `/css/share.css` | `/js/share.js` | 社交分享 / 复制链接 |
| 用户功能栏 | `/css/user-features.css` | `/js/user-features.js` | 收藏 / 历史 / 主题 |
| AI 客服浮窗 | `/css/chat-widget.css` | `/js/chat-widget.js` | 右下角聊天机器人 |
| 无障碍增强 | — | `/js/accessibility.js` | 键盘导航 / 跳转 / 对比度 |

## 🎨 设计系统（/style.css）

- **品牌色**：`--brand #1a73e8`、`--brand-dark #0d47a1`
- **强调色**：落日橙 `#E37400`、珊瑚红 `#EA4335`、绿 `#0F9D58`、青 `#00ACC1`
- **中性灰阶**：`--gray-50` → `--gray-900`（11 级）
- **圆角**：xs 4 / sm 8 / 12 / lg 16 / xl 24 / full
- **阴影**：xs → xl + brand 辉光，分层叠加
- **排版**：`--font-sans` 系统字体栈（含中文 PingFang / 微软雅黑）；字号 xs 0.75rem → 6xl 3.75rem
- **间距**：基于 4px 栅格（--s1 0.25rem → --s8 2rem）

## 🌆 28 个城市

beihai(北海) · beijing(北京) · chengdu(成都) · chongqing(重庆) · dali(大理) · dunhuang(敦煌) · guangzhou(广州) · guilin(桂林) · guiyang(贵阳) · haerbin(哈尔滨) · hangzhou(杭州) · hongkong(中国香港) · huangshan(黄山) · jiuzhaigou(九寨沟) · kunming(昆明) · lhasa(拉萨) · lijiang(丽江) · luoyang(洛阳) · macau(中国澳门) · nanjing(南京) · qingdao(青岛) · sanya(三亚) · shanghai(上海) · suzhou(苏州) · xiamen(厦门) · xian(西安) · xining(西宁) · zhangjiajie(张家界)

## 🔗 快速浏览入口

- 首页：http://127.0.0.1:8099/
- 北京城市首页：http://127.0.0.1:8099/city/beijing/
- 北京景点页：http://127.0.0.1:8099/city/beijing/attractions.html
- 北京美食页：http://127.0.0.1:8099/city/beijing/food.html
- 北京攻略页：http://127.0.0.1:8099/city/beijing/guide.html
- 北京行程页：http://127.0.0.1:8099/city/beijing/itinerary.html
- 404 页：http://127.0.0.1:8099/404.html

---
**UI Designer**：像素君
**预览方式**：本地静态服务器（Python http.server，端口 8099）
**说明**：所有页面路径均为绝对路径（`/city/...`、`/style.css`），需通过服务器根目录 `E:\cn\all-lv` 访问，直接双击文件会因路径问题失效。
