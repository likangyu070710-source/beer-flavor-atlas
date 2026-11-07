/* 啤酒主题矢量插画：首页主视觉与四张风格卡片。
   全部为内联 SVG，无外部依赖，随页面缩放不失真。 */
(function (global) {
  "use strict";

  var seq = 0;
  function uid() { seq += 1; return "b" + seq; }

  /* 各风格的酒液与泡沫配色 */
  var PAL = {
    hoppy: { hi: "#f7c777", lo: "#c8801f", foam: "#fdf1dd", foam2: "#e8cfae", accent: "#8aa85f" },
    stout: { hi: "#5a4130", lo: "#150e0a", foam: "#d9bd96", foam2: "#a98a63", accent: "#7a5138" },
    kriek: { hi: "#c14a4f", lo: "#67121c", foam: "#f2d9d5", foam2: "#d3a9a8", accent: "#a3242f" },
    tripel: { hi: "#f9d99a", lo: "#cf8f2c", foam: "#fdf6e7", foam2: "#ead4ac", accent: "#e9a94e" },
  };

  var SHAPE = {
    pint: "M146 64 H254 L236 246 Q234 256 224 256 H176 Q166 256 164 246 Z",
    chalice: "M136 74 C136 148 164 182 200 182 C236 182 264 148 264 74 Z",
    tumbler: "M152 88 H248 L240 246 Q239 256 229 256 H171 Q161 256 160 246 Z",
  };

  var SHAPE_OF = { hoppy: "pint", stout: "pint", kriek: "tumbler", tripel: "chalice" };
  var TOP = { pint: 64, chalice: 74, tumbler: 88 };
  var SURF = { pint: 96, chalice: 102, tumbler: 112 };
  var WIDTH = { pint: [146, 254], chalice: [136, 264], tumbler: [152, 248] };

  function foamPath(x1, x2, y, h, bumps) {
    var w = x2 - x1, n = bumps || 4, step = w / n, d = "M" + x1 + " " + (y + h) + " L" + x1 + " " + y;
    for (var i = 0; i < n; i++) {
      var cx = x1 + step * (i + 0.5), nx = x1 + step * (i + 1);
      d += " Q" + cx.toFixed(1) + " " + (y - 7) + " " + nx.toFixed(1) + " " + y;
    }
    return d + " L" + x2 + " " + (y + h) + " Z";
  }

  function bubbles(seed, x1, x2, top, bottom, n) {
    var out = "", r = seed;
    function rnd() { r = (r * 9301 + 49297) % 233280; return r / 233280; }
    for (var i = 0; i < n; i++) {
      var x = x1 + rnd() * (x2 - x1);
      var y = top + rnd() * (bottom - top);
      var rad = 0.9 + rnd() * 2.1;
      out += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + rad.toFixed(2) +
        '" fill="#fff" opacity="' + (0.08 + rnd() * 0.22).toFixed(2) + '"/>';
    }
    return out;
  }

  /* 装饰：酒花球、咖啡豆、樱桃、八角 */
  function garnish(kind) {
    if (kind === "hoppy") {
      return (
        '<g transform="translate(318 198) scale(1.45)">' +
        '<path d="M0 -18 L0 -26" stroke="#6f8a4e" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M0 -18 C11 -15 17 -4 17 7 C17 19 9 26 0 26 C-9 26 -17 19 -17 7 C-17 -4 -11 -15 0 -18Z" fill="#7e9b5a"/>' +
        '<path d="M-12 1 Q0 7 12 1" stroke="#5b7442" stroke-width="1.5" fill="none"/>' +
        '<path d="M-14 10 Q0 17 14 10" stroke="#5b7442" stroke-width="1.5" fill="none"/>' +
        '<path d="M-10 19 Q0 24 10 19" stroke="#5b7442" stroke-width="1.5" fill="none"/>' +
        '<path d="M0 -18 L0 24" stroke="#5b7442" stroke-width="1.2" opacity=".6"/>' +
        "</g>"
      );
    }
    if (kind === "stout") {
      return (
        '<g transform="translate(316 226)">' +
        '<ellipse cx="0" cy="0" rx="13" ry="9" fill="#6b4630" transform="rotate(-18)"/>' +
        '<ellipse cx="-16" cy="10" rx="11" ry="8" fill="#5a3a27" transform="rotate(12)"/>' +
        '<path d="M-12 -2 C-4 2 -2 8 -4 8" stroke="#3d2618" stroke-width="1.4" fill="none"/>' +
        "</g>"
      );
    }
    if (kind === "kriek") {
      return (
        '<g transform="translate(312 214)">' +
        '<circle cx="0" cy="8" r="15" fill="#a3242f"/><circle cx="-4" cy="4" r="5" fill="#c9505a" opacity=".7"/>' +
        '<circle cx="24" cy="15" r="12" fill="#8d1b26"/><circle cx="21" cy="11" r="4" fill="#b9414c" opacity=".7"/>' +
        '<path d="M0 -4 C2 -18 8 -24 14 -26" stroke="#6f7d3f" stroke-width="1.6" fill="none"/>' +
        '<path d="M20 4 C24 -10 30 -16 36 -18" stroke="#6f7d3f" stroke-width="1.6" fill="none"/>' +
        "</g>"
      );
    }
    return (
      '<g transform="translate(316 214)">' +
      '<path d="M0 -18 L0 0" stroke="#e9a94e" stroke-width="1.4" opacity=".7"/>' +
      '<circle cx="0" cy="8" r="9" fill="none" stroke="#e9a94e" stroke-width="1.4" opacity=".45"/>' +
      '<circle cx="16" cy="-4" r="2.2" fill="#f6cd85" opacity=".8"/>' +
      '<circle cx="-12" cy="16" r="1.6" fill="#f6cd85" opacity=".6"/>' +
      "</g>"
    );
  }

  /* 一只杯子（本地坐标 400×300） */
  function glassGroup(kind, opts) {
    var p = PAL[kind], form = SHAPE_OF[kind], shape = SHAPE[form], u = uid();
    var w = WIDTH[form], surf = SURF[form], top = TOP[form];
    var opts = opts || {};
    var withGlow = opts.glow !== false;

    var liquidH = 260 - surf;
    var clip = "c" + u;

    var foamH = form === "tumbler" ? 26 : 34;
    var foam = foamPath(w[0] + 5, w[1] - 5, top + 3, foamH, form === "pint" ? 4 : 5);

    var s =
      '<defs>' +
      '<linearGradient id="l' + u + '" x1="0" y1="0" x2="0.1" y2="1">' +
      '<stop offset="0" stop-color="' + p.hi + '"/><stop offset="0.55" stop-color="' + p.lo + '"/>' +
      '<stop offset="1" stop-color="' + p.lo + '"/></linearGradient>' +
      '<linearGradient id="f' + u + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + p.foam + '"/><stop offset="1" stop-color="' + p.foam2 + '"/></linearGradient>' +
      '<linearGradient id="g' + u + '" x1="0" y1="0" x2="1" y2="0.2">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0.16"/><stop offset="0.28" stop-color="#fff" stop-opacity="0.03"/>' +
      '<stop offset="0.72" stop-color="#fff" stop-opacity="0.02"/><stop offset="1" stop-color="#fff" stop-opacity="0.13"/>' +
      "</linearGradient>" +
      '<clipPath id="' + clip + '"><path d="' + shape + '"/></clipPath>' +
      (withGlow
        ? '<radialGradient id="r' + u + '" cx="0.5" cy="0.5" r="0.5">' +
          '<stop offset="0" stop-color="' + p.accent + '" stop-opacity="0.28"/>' +
          '<stop offset="1" stop-color="' + p.accent + '" stop-opacity="0"/></radialGradient>'
        : "") +
      "</defs>";

    if (withGlow) {
      s += '<ellipse cx="200" cy="150" rx="150" ry="130" fill="url(#r' + u + ')"/>';
    }

    // 杯身：先铺一层玻璃色，再叠酒液
    s += '<path d="' + shape + '" fill="#141110" opacity="0.35"/>';
    s += '<g clip-path="url(#' + clip + ')">';
    s += '<rect x="120" y="' + (surf - 4) + '" width="160" height="' + (liquidH + 4) + '" fill="url(#l' + u + ')"/>';
    s += '<path d="' + foam + '" fill="url(#f' + u + ')"/>';
    s += bubbles(7 + kind.length, w[0] + 12, w[1] - 12, surf + 18, 246, kind === "stout" ? 6 : 12);
    // 杯壁高光
    s += '<rect x="' + (w[0] + 10) + '" y="' + (top + 14) + '" width="5" height="' + (210 - top) + '" rx="2.5" fill="#fff" opacity="0.1"/>';
    s += '<rect x="' + (w[1] - 16) + '" y="' + (top + 30) + '" width="3" height="' + (170 - top) + '" rx="1.5" fill="#fff" opacity="0.07"/>';
    s += "</g>";

    // 杯口、杯身轮廓
    s += '<path d="' + shape + '" fill="none" stroke="#f3e6d2" stroke-opacity="0.28" stroke-width="1.6"/>';
    s += '<ellipse cx="200" cy="' + (top + 1) + '" rx="' + ((w[1] - w[0]) / 2) + '" ry="5" fill="none" stroke="#f3e6d2" stroke-opacity="0.32" stroke-width="1.4"/>';
    s += '<ellipse cx="200" cy="' + (top + 1) + '" rx="' + ((w[1] - w[0]) / 2 - 3) + '" ry="3.4" fill="#f3e6d2" opacity="0.05"/>';

    if (form === "chalice") {
      s += '<rect x="196" y="180" width="8" height="60" fill="#f3e6d2" opacity="0.16"/>';
      s += '<ellipse cx="200" cy="243" rx="40" ry="8" fill="#f3e6d2" opacity="0.13"/>';
      s += '<ellipse cx="200" cy="243" rx="40" ry="8" fill="none" stroke="#f3e6d2" stroke-opacity="0.3" stroke-width="1.3"/>';
    }

    // 杯底投影
    s += '<ellipse cx="200" cy="264" rx="' + ((w[1] - w[0]) / 2 + 6) + '" ry="6" fill="#000" opacity="0.35"/>';

    s += garnish(kind);
    return s;
  }

  /* 首页大图：三种酒并排 */
  function hero() {
    var u = uid();
    var s =
      '<defs><radialGradient id="h' + u + '" cx="0.5" cy="0.35" r="0.62">' +
      '<stop offset="0" stop-color="#e9a94e" stop-opacity="0.22"/>' +
      '<stop offset="0.55" stop-color="#c8801f" stop-opacity="0.07"/>' +
      '<stop offset="1" stop-color="#e9a94e" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="s' + u + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#f3e6d2" stop-opacity="0.16"/>' +
      '<stop offset="1" stop-color="#f3e6d2" stop-opacity="0"/></linearGradient></defs>';

    s += '<rect width="1200" height="520" fill="url(#h' + u + ')"/>';
    s += '<ellipse cx="600" cy="470" rx="470" ry="46" fill="#e9a94e" opacity="0.06"/>';
    s += '<path d="M60 470 H1140" stroke="#f3e6d2" stroke-opacity="0.14" stroke-width="1"/>';

    s += '<g transform="translate(-10 114) scale(1.35)">' + glassGroup("stout", { glow: false }) + "</g>";
    s += '<g transform="translate(290 74) scale(1.55)">' + glassGroup("tripel", { glow: false }) + "</g>";
    s += '<g transform="translate(680 127) scale(1.30)">' + glassGroup("kriek", { glow: false }) + "</g>";

    // 顶部漂浮气泡与麦穗、酒花
    s += '<g opacity="0.5">' +
      '<circle cx="220" cy="120" r="2.4" fill="#f6cd85" opacity="0.5"/>' +
      '<circle cx="300" cy="80" r="1.6" fill="#f6cd85" opacity="0.4"/>' +
      '<circle cx="980" cy="110" r="2.2" fill="#f6cd85" opacity="0.45"/>' +
      '<circle cx="1040" cy="170" r="1.5" fill="#f6cd85" opacity="0.35"/></g>';

    // 左侧酒花
    s += '<g transform="translate(120 300) rotate(-8)" opacity="0.9">' +
      '<path d="M0 -10 C22 -18 38 0 30 22 C22 44 2 50 -10 36 C-22 22 -18 -4 0 -10Z" fill="#5d7442"/>' +
      '<path d="M6 -2 C22 2 28 18 22 32" stroke="#465a32" stroke-width="1.6" fill="none"/>' +
      '<path d="M-6 8 C8 12 14 26 8 38" stroke="#465a32" stroke-width="1.4" fill="none"/>' +
      "</g>";

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="120 130 1080 400" preserveAspectRatio="xMidYMid meet" role="img">' + s + "</svg>";
  }

  /* 卡片插画 */
  function card(kind) {
    var s = '<g transform="translate(200 182) scale(1.14) translate(-200 -182)">' +
      glassGroup(kind, { glow: true }) + "</g>";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="102 26 300 276" preserveAspectRatio="xMidYMid meet" role="img">' + s + "</svg>";
  }

  /* 小图标：首页五个入口 */
  var ICON = {
    library: '<path d="M4 6h9M4 10h9M4 14h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="16.5" cy="11" r="4" stroke="currentColor" stroke-width="1.4"/><path d="M19.6 14.2 22 17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
    lab: '<circle cx="9" cy="8" r="2.4" stroke="currentColor" stroke-width="1.4"/><circle cx="16" cy="14" r="2.4" stroke="currentColor" stroke-width="1.4"/><circle cx="7" cy="17" r="2.2" stroke="currentColor" stroke-width="1.4"/><path d="M10.8 9.5 14.3 12.6M9.6 14.8 12.4 12.6" stroke="currentColor" stroke-width="1.2"/>',
    note: '<path d="M6 4h9l3 3v13H6z" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M9 10h7M9 13h7M9 16h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
    origin: '<path d="M4 18V7M4 18h16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M7 14l3.4-4 3 2.6L19 6" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle cx="19" cy="6" r="1.6" fill="currentColor"/>',
    transfer: '<path d="M4 9h11l-2.6-2.6M20 15H9l2.6 2.6" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  };

  function icon(name) {
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">' + (ICON[name] || "") + "</svg>";
  }

  global.BeerArt = { hero: hero, card: card, icon: icon };
})(window);
