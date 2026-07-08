/**
 * 站点 UI 增强：注入搜索触发按钮 + 暗色模式切换，并处理主题持久化
 * 在所有页面通过 <script src="/js/site-ui.js"> 引入
 */
(function () {
  'use strict';

  var THEME_KEY = 'lv-theme';

  function injectControls() {
    var navInner = document.querySelector('.nav-inner') || document.querySelector('.navbar');
    if (!navInner) return;
    if (navInner.querySelector('.nav-search-trigger')) return; // 已注入则跳过

    var hamburger = navInner.querySelector('.hamburger');

    // 搜索触发按钮
    var searchBtn = document.createElement('button');
    searchBtn.className = 'nav-search-trigger';
    searchBtn.setAttribute('aria-label', '搜索');
    searchBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    if (hamburger && hamburger.parentNode === navInner) {
      navInner.insertBefore(searchBtn, hamburger);
    } else {
      navInner.appendChild(searchBtn);
    }

    // 暗色模式切换
    var themeBtn = document.createElement('button');
    themeBtn.className = 'theme-toggle';
    themeBtn.setAttribute('aria-label', '切换深色模式');
    themeBtn.innerHTML = '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';
    themeBtn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
    if (hamburger && hamburger.parentNode === navInner) {
      navInner.insertBefore(themeBtn, hamburger);
    } else {
      navInner.appendChild(themeBtn);
    }

    syncToggleIcon();
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    syncToggleIcon();
  }

  function syncToggleIcon() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.classList.toggle('theme-dark', isDark);
  }

  function init() {
    injectControls();
  }

  // PWA：注册 Service Worker（离线访问 + 可安装到主屏幕）
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/service-worker.js').catch(function (err) {
        console.warn('[SW] 注册失败:', err);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  registerSW();
})();
