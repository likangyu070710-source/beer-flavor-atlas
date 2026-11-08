/* ============================================================
   pages.js — 多页路由与跨页状态
   ------------------------------------------------------------
   每个视图是一个真实的 HTML 文件，导航是可抓取、可收藏的链接。
   这一层只做三件事：
     1. 视图名 → 文件名 的映射
     2. 跨页共享的选择状态（sessionStorage，关掉标签页即失效）
     3. 兼容旧版 hash 链接（#lab / #style/tripel）
   ============================================================ */
(function () {
  "use strict";

  var FILES = {
    home: "index.html",
    style: "styles.html",
    lab: "lab.html",
    note: "note.html",
    origin: "origin.html",
    transfer: "transfer.html",
  };

  var KEY = "atlas-page-state";

  function read() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function write(patch) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(patch));
    } catch (e) {
      /* 隐私模式下 sessionStorage 可能不可用，降级为不记忆 */
    }
  }

  /* 生成带参数的站内地址；同名参数会被覆盖，null 值跳过 */
  function url(view, params) {
    var u = new URL(FILES[view] || FILES.home, location.href);
    if (params) {
      Object.keys(params).forEach(function (k) {
        var v = params[k];
        if (v === null || v === undefined || v === "") return;
        u.searchParams.set(k, v);
      });
    }
    return u.href;
  }

  function page() {
    return (document.body && document.body.dataset.page) || "home";
  }

  window.AtlasPages = {
    FILES: FILES,
    read: read,
    write: write,
    url: url,
    page: page,
    isMultiPage: true,
  };

  /* 旧链接兼容：/#lab → lab.html，/#style/tripel → styles.html?style=tripel */
  var raw = (location.hash || "").replace(/^#/, "");
  if (raw) {
    var parts = raw.split("/");
    var target = parts[0];
    if (FILES[target] && target !== page()) {
      var p = {};
      if (target === "style" && parts[1]) p.style = parts[1];
      location.replace(url(target, p));
    }
  }
})();
