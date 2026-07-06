/**
 * 全站搜索组件 — 检索景点、美食、攻略
 * 自执行 IIFE，按 Ctrl+K 或点击搜索按钮唤起
 * 数据源：attractions.json + 内置美食/攻略索引
 */
(function () {
  'use strict';

  var SEARCH_DATA = null;
  var DATA_URL = 'data/attractions.json';

  // 内置通用搜索索引（无需后端，覆盖热门旅行关键词）
  var BUILT_IN_INDEX = [
    // 通用美食标签
    { type: 'food', title: '特色小吃', desc: '当地必尝特色小吃推荐', url: 'food', tag: '美食' },
    { type: 'food', title: '网红餐厅', desc: '人气打卡餐厅合集', url: 'food', tag: '美食' },
    { type: 'food', title: '夜市攻略', desc: '当地最热闹夜市与美食街', url: 'food', tag: '夜市' },
    { type: 'food', title: '本地人推荐', desc: '本地人私藏的好店清单', url: 'food', tag: '美食' },
    { type: 'food', title: '早餐指南', desc: '地道早餐吃什么', url: 'food', tag: '美食' },
    { type: 'food', title: '特产伴手礼', desc: '值得带回家的当地特产', url: 'food', tag: '特产' },
    // 通用攻略标签
    { type: 'guide', title: '交通指南', desc: '高铁/飞机/自驾如何到达', url: 'guide#transport', tag: '交通' },
    { type: 'guide', title: '住宿推荐', desc: '各区域住宿对比与推荐', url: 'guide#accommodation', tag: '住宿' },
    { type: 'guide', title: '最佳旅游时间', desc: '四季特点与最佳出行窗口', url: 'guide#besttime', tag: '时间' },
    { type: 'guide', title: '旅行注意事项', desc: '防晒防坑、实用贴士', url: 'guide#tips', tag: '贴士' },
    { type: 'guide', title: '行程规划', desc: '精选路线一日/三日游', url: 'itinerary', tag: '行程' },
    { type: 'guide', title: '预算攻略', desc: '穷游/舒适/奢华三档预算', url: 'guide', tag: '攻略' },
    // 通用博客文章
    { type: 'blog', title: '必玩景点TOP10', desc: '第一次来不可错过的景点', url: 'blog', tag: '攻略' },
    { type: 'blog', title: '拍照打卡指南', desc: '最佳拍照机位与时间', url: 'blog', tag: '攻略' },
    { type: 'blog', title: '亲子游攻略', desc: '带娃出行的完美路线', url: 'blog', tag: '亲子' },
    { type: 'blog', title: '情侣约会指南', desc: '浪漫行程安排', url: 'blog', tag: '情侣' },
    { type: 'blog', title: '当地人私房路线', desc: '避开游客的小众玩法', url: 'blog', tag: '小众' },
    { type: 'blog', title: '省钱攻略', desc: '门票交通住宿省钱技巧', url: 'blog', tag: '省钱' }
  ];

  var dom = {};
  var state = { query: '', results: [], activeIndex: -1 };

  // ============ 初始化 ============

  function init() {
    if (document.querySelector('.qhd-search-overlay')) return;
    buildDOM();
    cacheDom();
    bindEvents();
  }

  // ============ DOM 构建 ============

  function buildDOM() {
    var overlay = document.createElement('div');
    overlay.className = 'qhd-search-overlay';
    overlay.innerHTML =
      '<div class="qhd-search-modal">' +
        '<div class="qhd-search-header">' +
          '<svg class="qhd-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '<input type="text" class="qhd-search-input" placeholder="搜索景点、美食、攻略…" autocomplete="off" />' +
          '<button class="qhd-search-close" aria-label="关闭"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
        '</div>' +
        '<div class="qhd-search-body" id="qhdSearchBody">' +
          '<div class="qhd-search-hint">' +
            '<p>输入关键词搜索，或试试：</p>' +
            '<div class="qhd-search-suggestions">' +
              '<button class="qhd-suggestion-chip">景点</button>' +
              '<button class="qhd-suggestion-chip">美食</button>' +
              '<button class="qhd-suggestion-chip">攻略</button>' +
              '<button class="qhd-suggestion-chip">住宿</button>' +
              '<button class="qhd-suggestion-chip">行程</button>' +
              '<button class="qhd-suggestion-chip">交通</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  function cacheDom() {
    dom.overlay = document.querySelector('.qhd-search-overlay');
    dom.input = dom.overlay.querySelector('.qhd-search-input');
    dom.body = dom.overlay.querySelector('#qhdSearchBody');
    dom.close = dom.overlay.querySelector('.qhd-search-close');
  }

  // ============ 事件绑定 ============

  function bindEvents() {
    // Ctrl+K / Cmd+K 唤起
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        open();
      }
      if (e.key === 'Escape') close();
    });

    // 搜索按钮（导航栏的 .nav-search-trigger）
    document.addEventListener('click', function (e) {
      if (e.target.closest('.nav-search-trigger')) {
        e.preventDefault();
        open();
      }
    });

    dom.close.addEventListener('click', close);
    dom.overlay.addEventListener('click', function (e) {
      if (e.target === dom.overlay) close();
    });

    // 输入搜索
    var debounceTimer = null;
    dom.input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        state.query = dom.input.value.trim();
        search();
      }, 200);
    });

    // 键盘导航
    dom.input.addEventListener('keydown', function (e) {
      var items = dom.body.querySelectorAll('.qhd-result-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.activeIndex = Math.min(state.activeIndex + 1, items.length - 1);
        updateActive(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.activeIndex = Math.max(state.activeIndex - 1, -1);
        updateActive(items);
      } else if (e.key === 'Enter') {
        if (state.activeIndex >= 0 && items[state.activeIndex]) {
          var href = items[state.activeIndex].getAttribute('data-href');
          if (href) window.location.href = href;
        }
      }
    });

    // 点击建议词
    dom.body.addEventListener('click', function (e) {
      var chip = e.target.closest('.qhd-suggestion-chip');
      if (chip) {
        dom.input.value = chip.textContent;
        state.query = chip.textContent;
        search();
        dom.input.focus();
      }
      var item = e.target.closest('.qhd-result-item');
      if (item) {
        var href = item.getAttribute('data-href');
        if (href) window.location.href = href;
      }
    });
  }

  // ============ 搜索逻辑 ============

  function ensureData() {
    if (SEARCH_DATA) return Promise.resolve(SEARCH_DATA);
    return fetch(DATA_URL, { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : { spots: [] }; })
      .catch(function () { return { spots: [] }; })
      .then(function (data) {
        SEARCH_DATA = data;
        return data;
      });
  }

  function search() {
    if (!state.query) {
      renderHint();
      return;
    }

    ensureData().then(function (data) {
      var q = state.query.toLowerCase();
      var results = [];

      // 搜索景点
      (data.spots || []).forEach(function (spot) {
        var score = 0;
        var name = (spot.name || '').toLowerCase();
        var desc = (spot.desc || '').toLowerCase();
        var area = (spot.area || '').toLowerCase();
        if (name.indexOf(q) >= 0) score += 10;
        if (desc.indexOf(q) >= 0) score += 3;
        if (area.indexOf(q) >= 0) score += 2;
        (spot.highlights || []).forEach(function (h) {
          if (h.toLowerCase().indexOf(q) >= 0) score += 2;
        });
        if (score > 0) {
          results.push({
            type: 'attraction',
            title: spot.name,
            desc: spot.desc,
            url: 'attractions#' + spot.id + '-spot',
            tag: spot.level || '景点',
            score: score
          });
        }
      });

      // 搜索内置索引
      BUILT_IN_INDEX.forEach(function (item) {
        var score = 0;
        if (item.title.toLowerCase().indexOf(q) >= 0) score += 8;
        if (item.desc.toLowerCase().indexOf(q) >= 0) score += 3;
        if (item.tag.toLowerCase().indexOf(q) >= 0) score += 2;
        if (score > 0) results.push(Object.assign({}, item, { score: score }));
      });

      results.sort(function (a, b) { return b.score - a.score; });
      state.results = results.slice(0, 20);
      state.activeIndex = -1;
      renderResults();
    });
  }

  // ============ 渲染 ============

  function renderHint() {
    dom.body.innerHTML =
      '<div class="qhd-search-hint">' +
        '<p>输入关键词搜索，或试试：</p>' +
        '<div class="qhd-search-suggestions">' +
          '<button class="qhd-suggestion-chip">景点</button>' +
          '<button class="qhd-suggestion-chip">美食</button>' +
          '<button class="qhd-suggestion-chip">攻略</button>' +
          '<button class="qhd-suggestion-chip">住宿</button>' +
          '<button class="qhd-suggestion-chip">行程</button>' +
          '<button class="qhd-suggestion-chip">交通</button>' +
        '</div>' +
      '</div>';
  }

  function renderResults() {
    if (state.results.length === 0) {
      dom.body.innerHTML =
        '<div class="qhd-search-empty">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '<p>没有找到「' + escapeHtml(state.query) + '」的相关内容</p>' +
          '<span>试试换个关键词，或浏览<a href="`attractions">全部景点</a></span>' +
        '</div>';
      return;
    }

    // 按类型分组
    var groups = { attraction: [], food: [], guide: [], blog: [] };
    state.results.forEach(function (r) {
      if (groups[r.type]) groups[r.type].push(r);
    });

    var typeLabels = {
      attraction: '景点',
      food: '美食',
      guide: '攻略',
      blog: '文章'
    };

    var html = '<div class="qhd-results">';
    Object.keys(groups).forEach(function (type) {
      if (!groups[type].length) return;
      html += '<div class="qhd-result-group"><div class="qhd-result-group-label">' + typeLabels[type] + '</div>';
      groups[type].forEach(function (r) {
        html +=
          '<a class="qhd-result-item" data-href="' + escapeHtml(r.url) + '">' +
            '<div class="qhd-result-info">' +
              '<div class="qhd-result-title">' + highlight(r.title, state.query) + '</div>' +
              '<div class="qhd-result-desc">' + highlight(r.desc, state.query) + '</div>' +
            '</div>' +
            '<span class="qhd-result-tag">' + escapeHtml(r.tag) + '</span>' +
          '</a>';
      });
      html += '</div>';
    });
    html += '</div>';
    dom.body.innerHTML = html;
  }

  function updateActive(items) {
    items.forEach(function (item, i) {
      item.classList.toggle('active', i === state.activeIndex);
    });
    if (state.activeIndex >= 0 && items[state.activeIndex]) {
      items[state.activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  // ============ 工具函数 ============

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function highlight(text, query) {
    if (!query) return escapeHtml(text);
    var escaped = escapeHtml(text);
    var reg = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return escaped.replace(reg, '<mark>$1</mark>');
  }

  function open() {
    dom.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { dom.input.focus(); }, 100);
  }

  function close() {
    dom.overlay.classList.remove('open');
    document.body.style.overflow = '';
    dom.input.value = '';
    state.query = '';
    renderHint();
  }

  // ============ 启动 ============

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
