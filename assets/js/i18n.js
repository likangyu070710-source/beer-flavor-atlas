/* 中英文切换运行时。
   翻译表由 data/i18n-en.js 提供（tools/build_i18n.py 生成），
   化合物 / 风格 / 感官轴 / 族名直接复用数据里的 en 字段。
   设计要点：
   - 文本节点级替换，命中不了的保持中文，不做半句拼接；
   - 数字归一化为 {n}，运行时按原顺序回填，动态计数也能复用同一条翻译；
   - MutationObserver 跟踪重渲染产生的新节点，切回中文时按 __zh 还原。 */
(function (global) {
  var CJK = /[\u4e00-\u9fff]/;
  var NUM = /\d+(?:\.\d+)?/g;
  var KEY = "atlas-lang";
  var HTML_LANG = { zh: "zh-CN", en: "en" };

  var MAP = {};        // 规范化中文 -> 英文
  var NAMES = {};      // 数据层专名：中文 -> 英文
  var lang = "zh";
  var applying = false;
  var queued = false;

  function norm(s) {
    s = String(s).replace(/\s+/g, " ").trim();
    s = s.replace(NUM, "{n}");
    s = s.replace(/\s*\{n\}\s*/g, " {n} ");
    return s.replace(/\s+/g, " ").trim();
  }

  function buildMap() {
    var src = global.I18N_EN || {};
    Object.keys(src).forEach(function (k) { MAP[norm(k)] = src[k]; });
    var d = global.BEER_DATA;
    if (!d) return;
    (d.compounds || []).forEach(function (c) { NAMES[c.cn] = c.en; });
    (d.styles || []).forEach(function (s) { NAMES[s.cn] = s.en; });
    (d.axes || []).forEach(function (a) { NAMES[a.cn] = a.en; });
    (d.families || []).forEach(function (f) { NAMES[f.cn] = f.en; });
  }

  function fill(tpl, src) {
    var nums = src.match(NUM) || [];
    var need = (tpl.match(/\{n\}/g) || []).length;
    if (need !== nums.length) return null;
    var i = 0;
    return tpl.replace(/\{n\}/g, function () { return nums[i++]; });
  }

  /* 翻译一条文本；翻译不了返回 null（保持原文，避免半句英文） */
  function tr(text) {
    if (text == null) return null;
    var raw = String(text);
    var s = raw.replace(/\s+/g, " ").trim();
    if (!s || !CJK.test(s)) return null;

    if (NAMES[s]) return NAMES[s];

    var hit = MAP[s] || MAP[norm(s)];
    if (hit) return hit.indexOf("{n}") >= 0 ? fill(hit, s) : hit;

    // “属性 · stale_hops” 这类复合串：按中圆点拆段，每段都能译才拼
    if (s.indexOf(" · ") >= 0) {
      var parts = s.split(" · ");
      var out = parts.map(function (p) {
        var q = p.trim();
        if (!CJK.test(q)) return q;
        return NAMES[q] || MAP[q] || MAP[norm(q)] || null;
      });
      if (out.every(function (x) { return x !== null; })) return out.join(" · ");
    }
    return null;
  }

  function translated(node) {
    if (!node || node.__zh === undefined) return;
    var raw = node.__zh;
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw);
    var out = tr(m[2]);
    if (out === null) return;
    node.nodeValue = m[1] + out + m[3];
  }

  function translateText(node) {
    if (node.__zh !== undefined) return;
    var raw = node.nodeValue;
    if (!raw || !CJK.test(raw)) return;
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw);
    var out = tr(m[2]);
    if (out === null) return;
    node.__zh = raw;
    node.nodeValue = m[1] + out + m[3];
    joinSpace(node);
  }

  var ATTRS = ["title", "placeholder", "aria-label", "data-tip", "alt"];

  /* 英文里 “its<b>Key…” 会粘成一串，这里补一个空格 */
  function wordish(ch) { return !!ch && /[A-Za-z0-9]/.test(ch); }
  function joinSpace(node) {
    var v = node.nodeValue;
    var next = node.nextSibling;
    if (!v || !next || next.nodeType !== 1) return;
    var nx = (next.textContent || "").trim();
    if (wordish(v.charAt(v.length - 1)) && wordish(nx.charAt(0))) node.nodeValue = v + " ";
  }

  function translateAttrs(el) {
    if (!el.getAttribute) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      var v = el.getAttribute(a);
      if (!v || !CJK.test(v)) continue;
      var cache = el.__zhAttr || (el.__zhAttr = {});
      if (cache[a] !== undefined) continue;
      var out = tr(v);
      if (out === null) continue;
      cache[a] = v;
      el.setAttribute(a, out);
    }
  }

  var DUP_SEL = "small, .stage-t span, .s-en, .hm-style-en, .nav-lab i, .rx-name i, .t-name i, .cp-head i, .sh-name i, h2 em, h1 em";
  var LATIN = /[A-Za-z]/;

  /* 中文标题旁本来就有的英文小注，在英文模式下会和标题重复，隐藏；
     原文是中文的副标题（带补充信息）保留。 */
  function markDup() {
    if (lang !== "en") return;
    var els = document.querySelectorAll(DUP_SEL);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var hadCJK = false;
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) {
        if (w.currentNode.__zh !== undefined) { hadCJK = true; break; }
      }
      // 纯数字（如 “/ 6”）保留，只隐藏英文译名一类的小注
      var show = hadCJK || !LATIN.test(el.textContent || "");
      el.classList.toggle("i18n-dup", !show);
    }
  }

  function clearDup() {
    var els = document.querySelectorAll(".i18n-dup");
    for (var i = 0; i < els.length; i++) els[i].classList.remove("i18n-dup");
  }

  /* 翻译是逐节点做的，英文里会出现 “its<b>Key</b>” 粘在一起。
     全量翻完后统一过一遍：相邻两个节点都是字母开头/结尾时补一个空格。 */
  function fixSpaces(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      var n = walker.currentNode;
      var v = n.nodeValue;
      if (!v || !v.trim()) continue;
      var next = n.nextSibling;
      if (next && next.nodeType === 1 && !/\s$/.test(v)) {
        var t = (next.textContent || "").trim();
        if (wordish(v.charAt(v.length - 1)) && (wordish(t.charAt(0)) || t.charAt(0) === "—")) {
          n.nodeValue = v + " ";
          v = n.nodeValue;
        }
      }
      var prev = n.previousSibling;
      if (prev && prev.nodeType === 1 && !/^\s/.test(v)) {
        var q = (prev.textContent || "").trim();
        if ((wordish(v.charAt(0)) || v.charAt(0) === "—") && q && wordish(q.charAt(q.length - 1))) n.nodeValue = " " + v;
      }
    }
  }

  function skip(el) {
    if (!el || !el.closest) return false;
    return !!el.closest("script,style,.no-i18n");
  }

  function apply(root) {
    if (lang !== "en" || applying) return;
    applying = true;
    try {
      var node = root.nodeType === 3 ? root : null;
      if (node) { translateText(node); return; }
      if (root.nodeType === 1) translateAttrs(root);
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          return skip(n.parentElement) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        },
      });
      while (walker.nextNode()) translateText(walker.currentNode);
      if (root.querySelectorAll) {
        var els = root.querySelectorAll("[title],[placeholder],[aria-label],[data-tip]");
        for (var i = 0; i < els.length; i++) translateAttrs(els[i]);
      }
      markDup();
      fixSpaces(root);
    } finally {
      applying = false;
    }
  }

  function restore(root) {
    if (!root) return;
    if (root.nodeType === 3) {
      if (root.__zh !== undefined) { root.nodeValue = root.__zh; delete root.__zh; }
      return;
    }
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      var n = walker.currentNode;
      if (n.__zh !== undefined) { n.nodeValue = n.__zh; delete n.__zh; }
    }
    if (!root.querySelectorAll) return;
    var els = root.querySelectorAll("*");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el.__zhAttr) continue;
      Object.keys(el.__zhAttr).forEach(function (a) {
        el.setAttribute(a, el.__zhAttr[a]);
      });
      delete el.__zhAttr;
    }
  }

  function tick() {
    queued = false;
    if (lang !== "en") return;
    apply(document.body);
  }

  function observe() {
    if (!global.MutationObserver) return;
    new MutationObserver(function () {
      if (lang !== "en" || applying || queued) return;
      queued = true;
      (global.requestAnimationFrame || global.setTimeout)(tick);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function paintSwitch() {
    var box = document.getElementById("langSwitch");
    if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll("[data-lang]"), function (b) {
      b.classList.toggle("is-on", b.dataset.lang === lang);
      b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
    });
  }

  function setLang(next, silent) {
    lang = next === "en" ? "en" : "zh";
    global.ATLAS_LANG = lang;
    document.documentElement.setAttribute("lang", HTML_LANG[lang]);
    document.body.classList.toggle("lang-en", lang === "en");
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    paintSwitch();
    if (!silent) document.dispatchEvent(new CustomEvent("atlas:lang", { detail: { lang: lang } }));
    if (lang === "en") { apply(document.body); setTitle(); }
    else { restore(document.body); clearDup(); setTitle(); }
  }

  var TITLES = {
    zh: "啤酒风味图谱 · Beer Flavor Atlas",
    en: "Beer Flavor Atlas · 22 styles, 55 compounds",
  };
  function setTitle() { document.title = TITLES[lang]; }

  function init() {
    observe();
    var box = document.getElementById("langSwitch");
    if (box) {
      box.addEventListener("click", function (e) {
        var b = e.target.closest("[data-lang]");
        if (b) setLang(b.dataset.lang);
      });
    }
    // 首屏：先按当前语言渲染一次
    if (lang === "en") {
      document.documentElement.setAttribute("lang", "en");
      document.body.classList.add("lang-en");
    }
    paintSwitch();
    global.ATLAS_LANG = lang;
    // app.js 首次渲染后再整体过一遍
    setTimeout(function () {
      if (lang === "en") { apply(document.body); setTitle(); }
      paintSwitch();
    }, 0);
  }

  global.AtlasI18n = {
    tr: tr,
    apply: apply,
    restore: restore,
    setLang: setLang,
    get lang() { return lang; },
    switchNode: function () { return document.getElementById("langSwitch"); },
  };

  // 同步确定语言，保证 app.js 首次渲染就知道该出哪一版文案
  buildMap();
  try { lang = localStorage.getItem(KEY) === "en" ? "en" : "zh"; } catch (e) { lang = "zh"; }
  global.ATLAS_LANG = lang;
  if (lang === "en") {
    document.documentElement.setAttribute("lang", "en");
    if (document.body) document.body.classList.add("lang-en");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
