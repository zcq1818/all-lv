/**
 * 天气组件 — 接入免费天气 API
 * 自执行 IIFE，在含 #weatherWidget 的容器自动渲染
 * 使用 Open-Meteo 免费 API（无需密钥）
 * 通过 data-lat / data-lng 属性或全局 CITY_COORDS 获取城市坐标
 */
(function () {
  'use strict';

  // 默认坐标（北京）
  var DEFAULT_LAT = 39.9042;
  var DEFAULT_LON = 116.4074;

  // 全国主要城市坐标映射
  var CITY_COORDS = {
    beijing:    { lat: 39.9042,  lng: 116.4074 },
    shanghai:   { lat: 31.2304,  lng: 121.4737 },
    guangzhou:  { lat: 23.1291,  lng: 113.2644 },
    shenzhen:   { lat: 22.5431,  lng: 114.0579 },
    chengdu:    { lat: 30.5728,  lng: 104.0668 },
    hangzhou:   { lat: 30.2741,  lng: 120.1551 },
    chongqing:  { lat: 29.4316,  lng: 106.9123 },
    xian:       { lat: 34.3416,  lng: 108.9398 },
    kunming:    { lat: 25.0389,  lng: 102.7183 },
    qingdao:    { lat: 36.0671,  lng: 120.3826 },
    suzhou:     { lat: 31.2990,  lng: 120.5853 },
    nanjing:    { lat: 32.0603,  lng: 118.7969 },
    guilin:     { lat: 25.2736,  lng: 110.2900 },
    lijiang:    { lat: 26.8721,  lng: 100.2299 },
    dali:       { lat: 25.5915,  lng: 100.2299 },
    lhasa:      { lat: 29.6500,  lng: 91.1000 },
    xiamen:     { lat: 24.4798,  lng: 118.0894 },
    haerbin:    { lat: 45.8038,  lng: 126.5350 },
    sanya:      { lat: 18.2528,  lng: 109.5120 },
    guiyang:    { lat: 26.6470,  lng: 106.6302 },
    huangshan:  { lat: 29.7152,  lng: 118.3370 },
    jiuzhaigou: { lat: 33.2597,  lng: 104.2367 },
    zhangjiajie:{ lat: 29.1170,  lng: 110.4797 },
    luoyang:    { lat: 34.6181,  lng: 112.4540 },
    xining:     { lat: 36.6238,  lng: 101.7799 },
    dunhuang:   { lat: 40.1421,  lng: 94.6620 },
    beihai:     { lat: 21.4811,  lng: 109.1200 },
    hongkong:   { lat: 22.3193,  lng: 114.1694 },
    macau:      { lat: 22.1987,  lng: 113.5439 }
  };

  function getCityCoords() {
    // 1. 优先从全局变量读取
    if (window.__cityCoords) return window.__cityCoords;
    // 2. 从页面 data 属性读取
    var el = document.querySelector('[data-city-id]');
    if (el) {
      var cityId = el.getAttribute('data-city-id');
      if (cityId && CITY_COORDS[cityId]) return CITY_COORDS[cityId];
    }
    // 3. 从 URL 路径推断城市
    var match = window.location.pathname.match(/\/city\/([^\/]+)/);
    if (match) {
      var id = match[1].toLowerCase();
      if (CITY_COORDS[id]) return CITY_COORDS[id];
    }
    // 4. 使用默认坐标
    return { lat: DEFAULT_LAT, lng: DEFAULT_LON };
  }

  function init() {
    var containers = document.querySelectorAll('#weatherWidget, .weather-widget');
    containers.forEach(renderWidget);
  }

  function renderWidget(container) {
    container.innerHTML =
      '<div class="weather-loading">加载天气数据中…</div>';

    var coords = getCityCoords();
    var url =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=' + coords.lat + '&longitude=' + coords.lng +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max' +
      '&timezone=Asia%2FShanghai&forecast_days=3';

    fetch(url)
      .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
      .then(function (data) { renderContent(container, data); })
      .catch(function () { renderError(container); });
  }

  function weatherCodeToDesc(code) {
    var map = {
      0: '晴', 1: '晴', 2: '多云', 3: '阴',
      45: '雾', 48: '雾凇', 51: '小毛毛雨', 53: '毛毛雨', 55: '大毛毛雨',
      61: '小雨', 63: '中雨', 65: '大雨', 66: '冻雨', 67: '大冻雨',
      71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒',
      80: '阵雨', 81: '中阵雨', 82: '大阵雨', 85: '阵雪', 86: '大阵雪',
      95: '雷暴', 96: '雷暴夹冰雹', 99: '大雷暴夹冰雹'
    };
    return map[code] || '未知';
  }

  function weatherCodeToIcon(code) {
    if (code === 0 || code === 1) return '☀️';
    if (code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '🌨️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 85 && code <= 86) return '🌨️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  }

  function renderContent(container, data) {
    var c = data.current;
    var d = data.daily;
    var desc = weatherCodeToDesc(c.weather_code);
    var icon = weatherCodeToIcon(c.weather_code);

    // 日出日落
    var sunrise = d.sunrise[0] ? new Date(d.sunrise[0]).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '--';
    var sunset = d.sunset[0] ? new Date(d.sunset[0]).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '--';

    // 未来3天预报
    var forecastHtml = '';
    for (var i = 0; i < Math.min(3, d.time.length); i++) {
      var date = new Date(d.time[i]);
      var dayLabel = i === 0 ? '今天' : i === 1 ? '明天' : '后天';
      forecastHtml +=
        '<div class="weather-forecast-day">' +
          '<span class="weather-forecast-label">' + dayLabel + '</span>' +
          '<span class="weather-forecast-icon">' + weatherCodeToIcon(d.weather_code[i]) + '</span>' +
          '<span class="weather-forecast-temp">' + Math.round(d.temperature_2m_max[i]) + '° / ' + Math.round(d.temperature_2m_min[i]) + '°</span>' +
        '</div>';
    }

    // 潮汐提示（简化版：基于农历日期估算）
    var tideTip = getTideTip();

    container.innerHTML =
      '<div class="weather-card">' +
        '<div class="weather-current">' +
          '<div class="weather-icon">' + icon + '</div>' +
          '<div class="weather-main">' +
            '<div class="weather-temp">' + Math.round(c.temperature_2m) + '°C</div>' +
            '<div class="weather-desc">' + desc + ' · 体感' + Math.round(c.apparent_temperature) + '°C</div>' +
          '</div>' +
          '<div class="weather-extra">' +
            '<div class="weather-extra-item"><span>湿度</span><strong>' + c.relative_humidity_2m + '%</strong></div>' +
            '<div class="weather-extra-item"><span>风速</span><strong>' + Math.round(c.wind_speed_10m) + ' km/h</strong></div>' +
            '<div class="weather-extra-item"><span>紫外线</span><strong>' + (d.uv_index_max[0] ? d.uv_index_max[0].toFixed(1) : '--') + '</strong></div>' +
          '</div>' +
        '</div>' +
        '<div class="weather-sun">' +
          '<span class="weather-sun-item">🌅 日出 ' + sunrise + '</span>' +
          '<span class="weather-sun-item">🌇 日落 ' + sunset + '</span>' +
        '</div>' +
        '<div class="weather-forecast">' + forecastHtml + '</div>' +
        '<div class="weather-tide">' +
          '<span class="weather-tide-icon">🌊</span>' +
          '<span>' + tideTip + '</span>' +
        '</div>' +
        '<div class="weather-tip">' + getTravelTip(c.weather_code, c.temperature_2m) + '</div>' +
      '</div>';
  }

  function getTideTip() {
    // 基于农历的简化潮汐估算（仅供参考）
    var now = new Date();
    var lunarDay = getLunarDay(now);
    if (lunarDay <= 3 || (lunarDay >= 15 && lunarDay <= 18)) {
      return '大潮期，赶海最佳！退潮后2小时是黄金时段';
    } else if (lunarDay <= 7 || (lunarDay >= 22)) {
      return '小潮期，赶海收获较少，适合观潮';
    } else {
      return '中潮期，可以赶海但需注意潮汐表';
    }
  }

  function getLunarDay(date) {
    // 简化版农历日期估算（不准确但够用）
    var baseDate = new Date(2024, 0, 11); // 2024年1月11日 ≈ 农历初一
    var diff = Math.floor((date - baseDate) / 86400000);
    return (diff % 29.5 + 29.5) % 29.5 + 1;
  }

  function getTravelTip(code, temp) {
    if (code >= 61 && code <= 67) return '🌧️ 今天有雨，记得带伞，室内景点更合适';
    if (code >= 71 && code <= 77) return '🌨️ 今天有雪，注意保暖防滑';
    if (code >= 95) return '⛈️ 今天有雷暴，请避免户外活动';
    if (temp >= 30) return '☀️ 高温天气，注意防晒补水，避开正午时段';
    if (temp <= 5) return '🧥 天气寒冷，注意保暖，海边风大';
    if (code === 0 || code === 1) return '🌤️ 天气晴好，非常适合户外游玩和看日出！';
    return '🌤️ 天气适宜出行，祝旅途愉快！';
  }

  function renderError(container) {
    container.innerHTML =
      '<div class="weather-card weather-error">' +
        '<span>天气数据加载失败</span>' +
        '<button class="weather-retry" onclick="window.__weatherInit()">重试</button>' +
      '</div>';
  }

  // 暴露 init 供重试按钮调用
  window.__weatherInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
