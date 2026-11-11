/* ============================================================
   reactor.js — 调制页的「入瓶 + 试饮」场景
   画面是一间小实验室：台面上立着酒瓶，旁边的小人端着杯子试喝。
   立体感来自三处：柱面高光 / 顶部椭圆 / 台面投影，不用 WebGL，
   因此仍然是零依赖、可 file:// 直开、低端设备也能跑。
   数据（评分、颜色、液位）仍由 app.js 写入 data-* 属性。
   ============================================================ */
(function (global) {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";
  var REDUCE = !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* 上一次的状态：面板每次重渲染都会换新节点，靠它做跨渲染的平滑过渡 */
  var prev = { level: 0.16, color: "#8a98a6", ex: 2 };
  var booted = false;

  var BOTTLE =
    "M72 40h24v34c0 11 22 17 22 33v71a12 12 0 0 1-12 12H62a12 12 0 0 1-12-12v-71c0-16 22-22 22-33Z";

  /* 液位 0..1 → 液面 y（瓶身内 84..168，整组下移 6） */
  function surfaceY(level) {
    var l = Math.max(0, Math.min(1, level));
    return 168 - 84 * l;
  }

  /* ---------------- 表情 ---------------- */
  var DOT_EYES =
    '<ellipse cx="-13" cy="-5" rx="3.3" ry="4" fill="#3b2a20"/>' +
    '<ellipse cx="13" cy="-5" rx="3.3" ry="4" fill="#3b2a20"/>' +
    '<circle cx="-14.2" cy="-6.6" r="1.1" fill="#fff" opacity=".75"/>' +
    '<circle cx="11.8" cy="-6.6" r="1.1" fill="#fff" opacity=".75"/>';

  var EXPR = [
    /* 0 难以下咽：X 眼、波浪嘴、吐舌、汗滴 */
    '<g class="rx-ex" data-ex="0" style="opacity:0">' +
      '<path d="M-19 -11 l9 9 M-10 -11 l-9 9" stroke="#3b2a20" stroke-width="2.7" stroke-linecap="round"/>' +
      '<path d="M9 -11 l9 9 M18 -11 l-9 9" stroke="#3b2a20" stroke-width="2.7" stroke-linecap="round"/>' +
      '<path d="M-11 9 q6 -4 11 1 q5 5 11 0 q-3 11 -12 10 q-9 -1 -10 -11Z" fill="#5b2a24"/>' +
      '<path d="M1 16 q6 1 6 6 q-7 1 -9 -3Z" fill="#c96a5f"/>' +
      '<path d="M27 -21 c3.4 4.4 3.4 7.2 0 9.6 c-3.4 -2.4 -3.4 -5.2 0 -9.6Z" fill="#9fc6d6" opacity=".9"/>' +
    "</g>",
    /* 1 不太妙：半睁眼、撇嘴、一滴汗 */
    '<g class="rx-ex" data-ex="1" style="opacity:0">' +
      '<path d="M-18 -7 q5 -3 9 0" stroke="#3b2a20" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<path d="M9 -7 q4 -3 9 0" stroke="#3b2a20" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<path d="M-17 -3 q4 3 8 0" stroke="#3b2a20" stroke-width="2" stroke-linecap="round" fill="none" opacity=".55"/>' +
      '<path d="M8 -3 q4 3 8 0" stroke="#3b2a20" stroke-width="2" stroke-linecap="round" fill="none" opacity=".55"/>' +
      '<path d="M-11 13 q5 -5 10 -1 q5 4 11 -1" stroke="#3b2a20" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<path d="M28 -20 c2.6 3.6 2.6 6 0 8 c-2.6 -2 -2.6 -4.4 0 -8Z" fill="#9fc6d6" opacity=".7"/>' +
    "</g>",
    /* 2 中规中矩 */
    '<g class="rx-ex" data-ex="2" style="opacity:0">' +
      DOT_EYES +
      '<path d="M-7 12h14" stroke="#3b2a20" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
    "</g>",
    /* 3 不错：笑眼、微笑、腮红 */
    '<g class="rx-ex" data-ex="3" style="opacity:0">' +
      '<path d="M-19 -5 q5 -7 10 0" stroke="#3b2a20" stroke-width="2.8" stroke-linecap="round" fill="none"/>' +
      '<path d="M9 -5 q5 -7 10 0" stroke="#3b2a20" stroke-width="2.8" stroke-linecap="round" fill="none"/>' +
      '<path d="M-10 9 q10 9 20 0" stroke="#3b2a20" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<ellipse cx="-21" cy="6" rx="5" ry="3" fill="#d98a6a" opacity=".32"/>' +
      '<ellipse cx="21" cy="6" rx="5" ry="3" fill="#d98a6a" opacity=".32"/>' +
    "</g>",
    /* 4 很好喝：笑眼、张口笑、腮红、星点 */
    '<g class="rx-ex" data-ex="4" style="opacity:0">' +
      '<path d="M-19 -6 q5 -8 10 0" stroke="#3b2a20" stroke-width="2.9" stroke-linecap="round" fill="none"/>' +
      '<path d="M9 -6 q5 -8 10 0" stroke="#3b2a20" stroke-width="2.9" stroke-linecap="round" fill="none"/>' +
      '<path d="M-12 6 Q0 24 12 6 Q0 12 -12 6 Z" fill="#3b2a20"/>' +
      '<path d="M-5 12 q5 7 10 0 q-5 3 -10 0Z" fill="#c96a5f"/>' +
      '<ellipse cx="-22" cy="4" rx="5.4" ry="3.2" fill="#d98a6a" opacity=".38"/>' +
      '<ellipse cx="22" cy="4" rx="5.4" ry="3.2" fill="#d98a6a" opacity=".38"/>' +
      '<path d="M-28 -25 v8 M-32 -21 h8" stroke="#e9a94e" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M29 -19 v6 M26 -16 h6" stroke="#e9a94e" stroke-width="1.7" stroke-linecap="round"/>' +
    "</g>",
  ].join("");

  /* ---------------- 舞台 ---------------- */
  function stage() {
    return (
      '<svg class="rx-svg" viewBox="0 0 360 260" fill="none" aria-hidden="true">' +
        "<defs>" +
          '<clipPath id="rx-clip"><path d="' + BOTTLE + '"/></clipPath>' +
          '<clipPath id="rx-gclip"><path d="M-9.2 -27 h18.4 l-2.6 22.4 a4 4 0 0 1 -4 3.4 h-5.2 a4 4 0 0 1 -4 -3.4 Z"/></clipPath>' +
          '<linearGradient id="rx-wall" x1="0" y1="0" x2="0.3" y2="1">' +
            '<stop offset="0" stop-color="#2b231c"/><stop offset=".55" stop-color="#1a1511"/><stop offset="1" stop-color="#100d0a"/>' +
          "</linearGradient>" +
          '<radialGradient id="rx-pool" cx=".5" cy=".5" r=".5">' +
            '<stop offset="0" stop-color="#e9a94e" stop-opacity=".2"/>' +
            '<stop offset=".55" stop-color="#e9a94e" stop-opacity=".06"/>' +
            '<stop offset="1" stop-color="#e9a94e" stop-opacity="0"/>' +
          "</radialGradient>" +
          '<radialGradient id="rx-halo" cx=".5" cy=".5" r=".5">' +
            '<stop offset="0" stop-color="#e9a94e" stop-opacity=".22"/>' +
            '<stop offset="1" stop-color="#e9a94e" stop-opacity="0"/>' +
          "</radialGradient>" +
          '<linearGradient id="rx-bench" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#4a3b2e"/><stop offset="1" stop-color="#2a2119"/>' +
          "</linearGradient>" +
          '<linearGradient id="rx-benchfront" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#221b15"/><stop offset="1" stop-color="#15100c"/>' +
          "</linearGradient>" +
          '<linearGradient id="rx-glass" x1="0" y1="0" x2="1" y2="0">' +
            '<stop offset="0" stop-color="#fff" stop-opacity=".26"/>' +
            '<stop offset=".14" stop-color="#fff" stop-opacity=".05"/>' +
            '<stop offset=".5" stop-color="#fff" stop-opacity=".02"/>' +
            '<stop offset=".86" stop-color="#fff" stop-opacity=".1"/>' +
            '<stop offset="1" stop-color="#fff" stop-opacity=".3"/>' +
          "</linearGradient>" +
          '<linearGradient id="rx-shade" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#000" stop-opacity=".04"/>' +
            '<stop offset="1" stop-color="#000" stop-opacity=".38"/>' +
          "</linearGradient>" +
          '<linearGradient id="rx-gloss" x1="0" y1="0" x2="1" y2="0">' +
            '<stop offset="0" stop-color="#fff" stop-opacity=".3"/>' +
            '<stop offset="1" stop-color="#fff" stop-opacity="0"/>' +
          "</linearGradient>" +
          '<radialGradient id="rx-skin" cx=".34" cy=".26" r=".86">' +
            '<stop offset="0" stop-color="#f9e8ca"/><stop offset=".58" stop-color="#e7c99e"/><stop offset="1" stop-color="#c49c6f"/>' +
          "</radialGradient>" +
          '<linearGradient id="rx-hair" x1="0" y1="0" x2="0.4" y2="1">' +
            '<stop offset="0" stop-color="#523824"/><stop offset="1" stop-color="#2a1b11"/>' +
          "</linearGradient>" +
          '<linearGradient id="rx-knit" x1="0" y1="0" x2="0.8" y2="1">' +
            '<stop offset="0" stop-color="#82a189"/><stop offset=".5" stop-color="#5d7c65"/><stop offset="1" stop-color="#3c5444"/>' +
          "</linearGradient>" +
          '<linearGradient id="rx-beer" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#f5cf85"/><stop offset="1" stop-color="#c9832f"/>' +
          "</linearGradient>" +
        "</defs>" +

        /* ---- 背景：实验室的墙、灯、台面 ---- */
        '<g class="rx-lab">' +
          '<rect x="0" y="0" width="360" height="260" fill="url(#rx-wall)"/>' +
          '<ellipse cx="150" cy="70" rx="150" ry="120" fill="url(#rx-pool)"/>' +
          /* 墙上的一排酒瓶剪影 */
          '<g opacity=".22" fill="#0c0a08">' +
            '<path d="M300 96h9v10c0 4 6 5 6 10v18h-21v-18c0-5 6-6 6-10Z"/>' +
            '<path d="M324 92h8v12c0 4 6 5 6 10v20h-20v-20c0-5 6-6 6-10Z"/>' +
            '<path d="M346 98h8v9c0 4 6 5 6 9v18h-20v-18c0-4 6-5 6-9Z"/>' +
          "</g>" +
          '<path d="M252 154h104" stroke="rgba(236,223,203,.16)" stroke-width="1.4"/>' +
          /* 吊灯 */
          '<path d="M150 0v26" stroke="rgba(236,223,203,.2)" stroke-width="1.2"/>' +
          '<path d="M136 40 h28 l-6 -14 h-16 Z" fill="#2a211a" stroke="rgba(236,223,203,.22)" stroke-width="1"/>' +
          '<ellipse cx="150" cy="41" rx="6" ry="2.4" fill="#f6cd85" opacity=".85"/>' +
          '<path d="M136 42 L112 130 h76 L164 42 Z" fill="#e9a94e" opacity=".05"/>' +
          /* 台面：顶面 + 前立面 */
          '<rect x="0" y="192" width="360" height="11" fill="url(#rx-bench)"/>' +
          '<rect x="0" y="192" width="360" height="1.4" fill="rgba(246,205,133,.28)"/>' +
          '<rect x="0" y="203" width="360" height="57" fill="url(#rx-benchfront)"/>' +
          '<g opacity=".16" stroke="#0a0806" stroke-width="1">' +
            '<path d="M60 203v57M168 203v57M276 203v57"/>' +
          "</g>" +
        "</g>" +

        /* ---- 酒瓶 ---- */
        '<circle class="rx-halo" cx="84" cy="112" r="86" fill="url(#rx-halo)" opacity="0"/>' +
        '<ellipse cx="88" cy="197" rx="40" ry="5" fill="#000" opacity=".45"/>' +

        '<g transform="translate(0 6)">' +
          '<path d="' + BOTTLE + '" fill="url(#rx-glass)" stroke="rgba(236,223,203,.3)" stroke-width="1.3" stroke-linejoin="round"/>' +
          '<g clip-path="url(#rx-clip)">' +
            '<g class="rx-liquid">' +
              '<rect class="rx-fill" x="46" y="0" width="76" height="210" fill="#8a98a6" opacity=".92"/>' +
              '<rect x="46" y="0" width="76" height="210" fill="url(#rx-shade)" opacity=".9"/>' +
              '<ellipse class="rx-surface" cx="84" cy="2.4" rx="32" ry="3.2" fill="#fff" opacity=".3"/>' +
            "</g>" +
            '<g class="rx-bubble-layer"></g>' +
            '<rect x="57" y="52" width="5" height="126" rx="2.5" fill="url(#rx-gloss)" opacity=".45"/>' +
            '<rect x="108" y="60" width="6" height="112" rx="3" fill="#000" opacity=".16"/>' +
          "</g>" +
          /* 瓶口与底座，给出厚度 */
          '<ellipse cx="84" cy="40" rx="12" ry="3" fill="#0b0908" opacity=".75"/>' +
          '<ellipse cx="84" cy="40" rx="12" ry="3" stroke="rgba(236,223,203,.42)" stroke-width="1.1"/>' +
          '<ellipse cx="84" cy="189" rx="27" ry="4.4" fill="#000" opacity=".22"/>' +
          '<path d="M74 44h20" stroke="rgba(236,223,203,.5)" stroke-width="1.2" stroke-linecap="round"/>' +
          /* 标签：有厚度的一张贴纸 */
          '<g>' +
            '<rect x="54" y="131" width="60" height="37" rx="2.5" fill="rgba(14,11,9,.42)" stroke="rgba(236,223,203,.24)" stroke-width="1"/>' +
            '<rect x="54" y="131" width="60" height="2" fill="rgba(246,205,133,.35)"/>' +
            '<path d="M61 142h30M61 149h40M61 156h22" stroke="rgba(236,223,203,.3)" stroke-width="1.3" stroke-linecap="round"/>' +
          "</g>" +
        "</g>" +

        /* 落滴与涟漪 */
        '<g class="rx-drop" opacity="0">' +
          '<circle cx="84" cy="0" r="4.6" fill="#8a98a6"/>' +
          '<circle cx="82.4" cy="-1.6" r="1.3" fill="#fff" opacity=".55"/>' +
        "</g>" +
        '<ellipse class="rx-splash" cx="84" cy="41" rx="7" ry="2" fill="none" stroke="#fff" stroke-width="1.6" opacity="0"/>' +

        /* ---- 小人 ---- */
        '<g class="rx-person">' +
          '<ellipse cx="272" cy="199" rx="46" ry="6" fill="#000" opacity=".38"/>' +
          /* 身体 */
          '<path d="M238 203v-39c0-20 15-34 34-34s34 14 34 34v39Z" fill="url(#rx-knit)"/>' +
          '<path d="M244 172c8-8 18-12 28-12" stroke="#96b39b" stroke-width="3" stroke-linecap="round" opacity=".35"/>' +
          '<path d="M256 132 q16 11 32 0" stroke="#33493b" stroke-width="4.5" stroke-linecap="round" fill="none"/>' +
          /* 左臂 */
          '<path d="M241 160c-8 7-11 15-11 24v11" stroke="#4f6c58" stroke-width="13" stroke-linecap="round" fill="none"/>' +
          '<circle cx="230" cy="196" r="7" fill="url(#rx-skin)"/>' +
          /* 头 */
          '<g class="rx-head">' +
            '<ellipse cx="242" cy="104" rx="4.6" ry="7" fill="#d9b78a"/>' +
            '<ellipse cx="302" cy="104" rx="4.6" ry="7" fill="#d9b78a"/>' +
            '<circle cx="272" cy="100" r="30" fill="url(#rx-skin)"/>' +
            '<path d="M243 97c0-22 13-33 29-33s29 11 29 33c-5-8-9-12-14-14-6 5-18 7-27 4-6-2-12 1-17 10Z" fill="url(#rx-hair)"/>' +
            '<path d="M254 81q10-8 22-6" stroke="#7a5537" stroke-width="3" stroke-linecap="round" opacity=".55" fill="none"/>' +
            '<circle class="rx-tint" cx="272" cy="100" r="30" fill="#9fb37a" opacity="0"/>' +
            '<g class="rx-face" transform="translate(272 100)">' + EXPR + "</g>" +
            /* 喝完的奶泡胡子 */
            '<ellipse class="rx-foam" cx="272" cy="113" rx="0" ry="0" fill="#f8f0de" opacity="0"/>' +
          "</g>" +
          /* 端着的酒杯（含手），品尝时整组抬起 */
          '<g class="rx-sip">' +
            '<path d="M300 161q9 7 7 19" stroke="#4f6c58" stroke-width="12" stroke-linecap="round" fill="none"/>' +
            '<g transform="translate(306 176)">' +
              '<path d="M-10.6 -30h21.2l-3 27a4.6 4.6 0 0 1-4.6 4h-9a4.6 4.6 0 0 1-4.6-4Z" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.46)" stroke-width="1.1"/>' +
              '<g clip-path="url(#rx-gclip)">' +
                '<rect class="rx-glass-fill" x="-10" y="-16" width="20" height="22" fill="url(#rx-beer)"/>' +
                '<rect x="-10" y="-16" width="20" height="22" fill="url(#rx-shade)" opacity=".75"/>' +
                '<ellipse cx="0" cy="-16" rx="10" ry="2.6" fill="#fff" opacity=".4"/>' +
              "</g>" +
              '<ellipse cx="0" cy="-29.4" rx="10.2" ry="3.4" fill="#f7efdd"/>' +
              '<ellipse cx="-3" cy="-30.4" rx="4" ry="1.8" fill="#fff" opacity=".7"/>' +
              '<path d="M-6 1.6q8-2.4 12.6 2q1.8 5-4.6 6.2q-10 1.2-12.4-3q-1-3.2 4.4-5.2Z" fill="url(#rx-skin)"/>' +
            "</g>" +
          "</g>" +
        "</g>" +
      "</svg>"
    );
  }

  /* ---------------- 动画工具 ---------------- */
  function can(node) {
    return !REDUCE && node && node.animate;
  }

  function tweenLiquid(liq, fill, fromY, toY, fromC, toC, dur) {
    if (!liq) return;
    if (!can(liq)) {
      liq.style.transform = "translateY(" + toY + "px)";
      if (fill) fill.style.fill = toC;
      return;
    }
    var a = liq.animate(
      [{ transform: "translateY(" + fromY + "px)" }, { transform: "translateY(" + toY + "px)" }],
      { duration: dur, easing: "cubic-bezier(.25,.8,.3,1)", fill: "forwards" }
    );
    a.onfinish = function () { liq.style.transform = "translateY(" + toY + "px)"; a.cancel(); };

    if (fill && fromC !== toC) {
      var b = fill.animate([{ fill: fromC }, { fill: toC }], {
        duration: dur + 140, easing: "ease-out", fill: "forwards",
      });
      b.onfinish = function () { fill.style.fill = toC; b.cancel(); };
    } else if (fill) {
      fill.style.fill = toC;
    }
  }

  /* 从被点击的目录条目飞一滴进瓶口；返回飞行时长，跳过时返回 0 */
  function fly(svg, color, from) {
    if (REDUCE || !from) return 0;
    var box = svg.getBoundingClientRect();
    if (!box.width) return 0;
    var tx = box.left + (84 / 360) * box.width;
    var ty = box.top + (46 / 260) * box.height;
    if (ty < 8 || ty > global.innerHeight - 8 || tx < 8 || tx > global.innerWidth - 8) return 0;
    var dx = tx - from.x;
    var dy = ty - from.y;
    if (Math.abs(dx) < 48 && Math.abs(dy) < 48) return 0;

    var el = document.createElement("span");
    el.className = "rx-fly";
    el.style.left = from.x + "px";
    el.style.top = from.y + "px";
    el.style.background = color;
    el.style.boxShadow = "0 0 12px " + color;
    document.body.appendChild(el);

    var dur = 360;
    var a = el.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: "translate(" + dx * 0.55 + "px," + (dy * 0.55 - 46) + "px) scale(.86)", opacity: 1, offset: 0.55 },
        { transform: "translate(" + dx + "px," + dy + "px) scale(.42)", opacity: 0.9 },
      ],
      { duration: dur, easing: "cubic-bezier(.42,0,.58,1)", fill: "forwards" }
    );
    a.onfinish = function () { if (el.parentNode) el.parentNode.removeChild(el); };
    /* 动画被中断时的兜底，避免残留一个点挂在页面上 */
    global.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, dur + 900);
    return dur;
  }

  function splash(svg) {
    var el = svg.querySelector(".rx-splash");
    if (!el || !can(el)) return;
    el.animate(
      [
        { transform: "scale(.35)", opacity: 0.95 },
        { transform: "scale(2.1)", opacity: 0 },
      ],
      { duration: 520, easing: "cubic-bezier(.2,.7,.4,1)" }
    );
  }

  function pour(svg, color, skipDrop) {
    if (skipDrop) { splash(svg); return; }
    var drop = svg.querySelector(".rx-drop");
    if (!drop) return;
    var dot = drop.querySelectorAll("circle");
    for (var i = 0; i < dot.length; i++) dot[i].setAttribute("fill", i ? "#fff" : color);
    drop.style.opacity = "1";

    if (!can(drop)) {
      drop.style.opacity = "0";
      return;
    }
    var a = drop.animate(
      [
        { transform: "translateY(-8px)", opacity: 0 },
        { transform: "translateY(6px)", opacity: 1, offset: 0.14 },
        { transform: "translateY(41px)", opacity: 1 },
      ],
      { duration: 460, easing: "cubic-bezier(.45,0,.9,.55)", fill: "forwards" }
    );
    a.onfinish = function () {
      drop.style.opacity = "0";
      a.cancel();
      splash(svg);
    };
  }

  function bubbles(svg, surface, delay) {
    var layer = svg.querySelector(".rx-bubble-layer");
    if (!layer || REDUCE) return;
    layer.textContent = "";
    for (var i = 0; i < 6; i++) {
      (function (i) {
        var c = document.createElementNS(SVGNS, "circle");
        var x = 62 + Math.random() * 44;
        var y = 176 + Math.random() * 8;
        var r = 1.2 + Math.random() * 1.5;
        c.setAttribute("cx", x.toFixed(1));
        c.setAttribute("cy", y.toFixed(1));
        c.setAttribute("r", r.toFixed(1));
        c.setAttribute("fill", "#fff");
        c.setAttribute("opacity", "0");
        layer.appendChild(c);

        var dist = Math.max(8, y - surface - 6);
        var anim = c.animate(
          [
            { transform: "translateY(0)", opacity: 0 },
            { opacity: 0.5, offset: 0.18 },
            { transform: "translateY(-" + dist.toFixed(1) + "px)", opacity: 0 },
          ],
          {
            duration: 900 + Math.random() * 560,
            delay: delay + i * 90,
            easing: "ease-out",
            fill: "forwards",
          }
        );
        anim.onfinish = function () { if (c.parentNode) c.parentNode.removeChild(c); };
      })(i);
    }
  }

  function popHalo(svg) {
    var halo = svg.querySelector(".rx-halo");
    if (!can(halo)) return;
    halo.animate([{ opacity: 0, transform: "scale(.9)" }, { opacity: 1, offset: 0.3 }, { opacity: 0, transform: "scale(1.06)" }], {
      duration: 900, easing: "ease-out",
    });
  }

  function setTint(svg, v) {
    var t = svg.querySelector(".rx-tint");
    if (!t) return;
    if (can(t) && parseFloat(t.getAttribute("opacity") || 0) !== v) {
      t.animate([{ opacity: t.getAttribute("opacity") || 0 }, { opacity: v }], {
        duration: 320, easing: "ease-out", fill: "forwards",
      });
    }
    t.setAttribute("opacity", v);
  }

  /* 小人的试饮动作：杯子上抬 → 头后仰 → 放下 → 冒一层奶泡 */
  function sip(svg, good) {
    var cup = svg.querySelector(".rx-sip");
    var head = svg.querySelector(".rx-head");
    var foam = svg.querySelector(".rx-foam");
    if (!can(cup)) return;

    var raise = [
      { transform: "translate(0,0) rotate(0)", offset: 0 },
      { transform: "translate(-27px,-31px) rotate(-13deg)", offset: 0.34 },
      { transform: "translate(-31px,-36px) rotate(-20deg)", offset: 0.52 },
      { transform: "translate(-31px,-36px) rotate(-20deg)", offset: 0.76 },
      { transform: "translate(0,0) rotate(0)", offset: 1 },
    ];
    cup.animate(raise, { duration: 1600, easing: "cubic-bezier(.35,0,.25,1)" });

    if (head && can(head)) {
      head.animate(
        [
          { transform: "rotate(0)", offset: 0 },
          { transform: "rotate(-7deg)", offset: 0.5 },
          { transform: "rotate(-7deg)", offset: 0.74 },
          { transform: "rotate(0)", offset: 1 },
        ],
        { duration: 1600, easing: "cubic-bezier(.35,0,.25,1)" }
      );
    }

    if (foam && can(foam)) {
      foam.animate(
        [
          { transform: "scale(.2)", opacity: 0 },
          { transform: "scale(1)", opacity: 0.95, offset: 0.4 },
          { transform: "scale(1)", opacity: 0.95, offset: 0.8 },
          { transform: "scale(1.25, .6)", opacity: 0, offset: 1 },
        ],
        { duration: 1900, delay: 900, easing: "ease-out" }
      );
    }
    return good;
  }

  function switchFace(svg, exs, fromIdx, toIdx) {
    var i, g;
    for (i = 0; i < exs.length; i++) {
      g = exs[i];
      if (i === toIdx) continue;
      if (i === fromIdx && can(g)) {
        var out = g.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 130, easing: "ease-in", fill: "forwards",
        });
        out.onfinish = (function (node) {
          return function () { node.style.opacity = 0; };
        })(g);
      } else {
        g.style.opacity = 0;
      }
    }

    g = exs[toIdx];
    if (!g) return;
    g.style.opacity = 1;
    if (can(g)) {
      g.animate(
        [
          { opacity: 0, transform: "translateY(5px) scale(.9)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        { duration: 280, easing: "cubic-bezier(.2,.9,.3,1.25)", fill: "forwards" }
      );
    }

    var face = svg.querySelector(".rx-face");
    if (can(face)) {
      if (toIdx >= 4) {
        face.animate(
          [
            { transform: "translateY(0)" },
            { transform: "translateY(-4.5px)", offset: 0.4 },
            { transform: "translateY(0)" },
          ],
          { duration: 460, easing: "ease-out" }
        );
      } else if (toIdx === 0) {
        face.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-3px)", offset: 0.25 },
            { transform: "translateX(3px)", offset: 0.6 },
            { transform: "translateX(0)" },
          ],
          { duration: 400, easing: "ease-in-out" }
        );
      }
    }
    setTint(svg, toIdx === 0 ? 0.34 : toIdx === 1 ? 0.14 : 0);
  }

  function popScore(root) {
    var num = root.querySelector(".rx-num");
    if (!can(num)) return;
    num.animate(
      [
        { transform: "translateY(4px) scale(.86)", opacity: 0.2 },
        { transform: "translateY(0) scale(1.04)", opacity: 1, offset: 0.7 },
        { transform: "translateY(0) scale(1)" },
      ],
      { duration: 420, easing: "cubic-bezier(.2,.9,.3,1.1)" }
    );
    var m = root.querySelector(".rx-meter i");
    if (m && can(m)) {
      m.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        duration: 520, easing: "cubic-bezier(.2,.8,.3,1)",
      });
    }
  }

  function flashChip(root) {
    var chip = root.querySelector(".rx-chip");
    if (!can(chip)) return;
    chip.animate(
      [
        { opacity: 0, transform: "translateY(-4px)" },
        { opacity: 1, transform: "translateY(0)", offset: 0.35 },
        { opacity: 1, transform: "translateY(0)", offset: 0.75 },
        { opacity: 0, transform: "translateY(-2px)" },
      ],
      { duration: 1500, easing: "ease-out", fill: "forwards" }
    );
  }

  /* ---------------- 入口 ---------------- */
  function attach(root) {
    if (!root) return;
    var stageEl = root.querySelector("[data-rx-stage]");
    if (!stageEl) return;
    var svg = stageEl.querySelector(".rx-svg");
    if (!svg) return;

    var ex = parseInt(stageEl.getAttribute("data-ex"), 10);
    var level = parseFloat(stageEl.getAttribute("data-level"));
    var color = stageEl.getAttribute("data-color") || "#8a98a6";
    var kind = stageEl.getAttribute("data-kind") || "sync";
    if (isNaN(ex)) ex = 2;
    if (isNaN(level)) level = 0.16;

    var liq = svg.querySelector(".rx-liquid");
    var fill = svg.querySelector(".rx-fill");
    var glassFill = svg.querySelector(".rx-glass-fill");
    var exs = svg.querySelectorAll(".rx-ex");
    /* 杯里的酒跟着当前化合物换色，但压低亮度，免得抢过瓶子 */
    if (glassFill) glassFill.style.fill = color;
    var fromY = surfaceY(prev.level);
    var toY = surfaceY(level);
    var fromColor = prev.color;
    var fromEx = prev.ex;

    /* 先把画面摆回「上一次」的状态，避免重渲染造成的闪跳 */
    if (liq) liq.style.transform = "translateY(" + fromY + "px)";
    if (fill) fill.style.fill = prev.color;
    svg.style.setProperty("--rx-color", color);
    for (var i = 0; i < exs.length; i++) exs[i].style.opacity = i === prev.ex ? 1 : 0;
    setTint(svg, prev.ex === 0 ? 0.34 : prev.ex === 1 ? 0.14 : 0);

    if (!booted) {
      booted = true;
      if (liq) liq.style.transform = "translateY(" + toY + "px)";
      if (fill) fill.style.fill = color;
      for (i = 0; i < exs.length; i++) exs[i].style.opacity = i === ex ? 1 : 0;
      setTint(svg, ex === 0 ? 0.34 : ex === 1 ? 0.14 : 0);
      prev = { level: level, color: color, ex: ex };
      return;
    }

    var sameEx = ex === prev.ex;
    var gap = REDUCE ? 0 : 440;
    var lead = 0;

    if (kind === "add") {
      flashChip(root);
      popScore(root);
      var point = (stageEl.getAttribute("data-from") || "").split(",");
      if (point.length === 2) lead = fly(svg, color, { x: +point[0], y: +point[1] });
      /* 已经飞过来了，瓶口的等待可以短一些 */
      if (lead) gap = 250;
      if (lead) {
        global.setTimeout(function () { pour(svg, color, true); }, lead);
      } else {
        pour(svg, color);
      }
      global.setTimeout(function () {
        tweenLiquid(liq, fill, fromY, toY, fromColor, color, 540);
        bubbles(svg, toY, 120);
        popHalo(svg);
        if (!sameEx) switchFace(svg, exs, fromEx, ex);
        /* 酒调好了，小人端起来喝一口 */
        global.setTimeout(function () { sip(svg, ex >= 3); }, sameEx ? 260 : 420);
      }, lead + gap);
    } else if (kind === "remove") {
      tweenLiquid(liq, fill, fromY, toY, fromColor, color, 520);
      bubbles(svg, toY, 60);
      flashChip(root);
      if (!sameEx) switchFace(svg, exs, fromEx, ex);
    } else {
      tweenLiquid(liq, fill, fromY, toY, fromColor, color, 520);
      if (!sameEx) switchFace(svg, exs, fromEx, ex);
    }

    prev = { level: level, color: color, ex: ex };
  }

  global.Reactor = { stage: stage, attach: attach };
})(window);
