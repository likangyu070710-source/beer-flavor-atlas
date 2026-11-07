/* ============================================================
   reactor.js — 化合物交互页的「入瓶 + 试饮」动画
   只负责图形与动画，数据（评分、颜色、液位）由 app.js 写入 data-* 属性。
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

  /* 液位 0..1 → 液面 y（瓶身内 84..168） */
  function surfaceY(level) {
    var l = Math.max(0, Math.min(1, level));
    return 168 - 84 * l;
  }

  /* ---------------- 表情 ---------------- */
  var DOT_EYES =
    '<circle cx="-13" cy="-8" r="3.2" fill="#3b2a20"/>' +
    '<circle cx="13" cy="-8" r="3.2" fill="#3b2a20"/>';

  var EXPR = [
    /* 0 难以下咽：>_< 眼、皱眉、吐舌、汗滴 */
    '<g class="rx-ex" data-ex="0" style="opacity:0">' +
      '<path d="M-20 -25 l11 4" stroke="#3b2a20" stroke-width="2.2" stroke-linecap="round" opacity=".5"/>' +
      '<path d="M20 -25 l-11 4" stroke="#3b2a20" stroke-width="2.2" stroke-linecap="round" opacity=".5"/>' +
      '<path d="M-21 -12 l9 5 -9 5" stroke="#3b2a20" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
      '<path d="M21 -12 l-9 5 9 5" stroke="#3b2a20" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
      '<rect x="-5" y="9" width="10" height="13" rx="5" fill="#c96a5f"/>' +
      '<path d="M-11 7 Q0 21 11 7 Z" fill="#3b2a20"/>' +
      '<path d="M26 -21 c3.4 4.4 3.4 7.2 0 9.6 c-3.4 -2.4 -3.4 -5.2 0 -9.6Z" fill="#9fc6d6" opacity=".85"/>' +
    "</g>",
    /* 1 不太妙：眯眼、下垂嘴、一滴汗 */
    '<g class="rx-ex" data-ex="1" style="opacity:0">' +
      '<path d="M-20 -22 l11 5" stroke="#3b2a20" stroke-width="2.1" stroke-linecap="round" opacity=".5"/>' +
      '<path d="M20 -22 l-11 5" stroke="#3b2a20" stroke-width="2.1" stroke-linecap="round" opacity=".5"/>' +
      '<ellipse cx="-13" cy="-8" rx="3.5" ry="2.6" fill="#3b2a20"/>' +
      '<ellipse cx="13" cy="-8" rx="3.5" ry="2.6" fill="#3b2a20"/>' +
      '<path d="M-11 15 Q0 6 11 15" stroke="#3b2a20" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<path d="M27 -19 c2.8 3.8 2.8 6.2 0 8.2 c-2.8 -2 -2.8 -4.4 0 -8.2Z" fill="#9fc6d6" opacity=".65"/>' +
    "</g>",
    /* 2 中规中矩 */
    '<g class="rx-ex" data-ex="2" style="opacity:0">' +
      DOT_EYES +
      '<path d="M-8 12 h16" stroke="#3b2a20" stroke-width="2.6" stroke-linecap="round"/>' +
    "</g>",
    /* 3 不错：微笑、腮红 */
    '<g class="rx-ex" data-ex="3" style="opacity:0">' +
      DOT_EYES +
      '<path d="M-11 7 Q0 17 11 7" stroke="#3b2a20" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<ellipse cx="-21" cy="5" rx="4.6" ry="2.8" fill="#d98a6a" opacity=".28"/>' +
      '<ellipse cx="21" cy="5" rx="4.6" ry="2.8" fill="#d98a6a" opacity=".28"/>' +
    "</g>",
    /* 4 很好喝：笑眼、张口笑、腮红、星点 */
    '<g class="rx-ex" data-ex="4" style="opacity:0">' +
      '<path d="M-19 -10 q5 -7 10 0" stroke="#3b2a20" stroke-width="2.8" stroke-linecap="round" fill="none"/>' +
      '<path d="M9 -10 q5 -7 10 0" stroke="#3b2a20" stroke-width="2.8" stroke-linecap="round" fill="none"/>' +
      '<path d="M-13 6 Q0 24 13 6 Q0 13 -13 6 Z" fill="#3b2a20"/>' +
      '<path d="M-6 12 q6 7 12 0 q-6 4 -12 0Z" fill="#c96a5f"/>' +
      '<ellipse cx="-22" cy="3" rx="5" ry="3" fill="#d98a6a" opacity=".35"/>' +
      '<ellipse cx="22" cy="3" rx="5" ry="3" fill="#d98a6a" opacity=".35"/>' +
      '<path d="M-27 -27 v8 M-31 -23 h8" stroke="#e9a94e" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M28 -21 v6 M25 -18 h6" stroke="#e9a94e" stroke-width="1.7" stroke-linecap="round"/>' +
    "</g>",
  ].join("");

  /* ---------------- 舞台 ---------------- */
  function stage() {
    return (
      '<svg class="rx-svg" viewBox="0 0 300 220" fill="none" aria-hidden="true">' +
        '<defs>' +
          '<clipPath id="rx-clip"><path d="' + BOTTLE + '"/></clipPath>' +
          '<radialGradient id="rx-halo" cx="0.5" cy="0.5" r="0.5">' +
            '<stop offset="0" stop-color="#e9a94e" stop-opacity=".17"/>' +
            '<stop offset="1" stop-color="#e9a94e" stop-opacity="0"/>' +
          "</radialGradient>" +
        "</defs>" +

        '<circle class="rx-halo" cx="84" cy="112" r="88" fill="url(#rx-halo)" opacity="0"/>' +
        '<ellipse cx="84" cy="196" rx="44" ry="5.5" fill="#e9a94e" opacity=".06"/>' +

        '<path d="' + BOTTLE + '" fill="rgba(236,223,203,.035)" stroke="rgba(236,223,203,.32)" stroke-width="1.6" stroke-linejoin="round"/>' +

        '<g clip-path="url(#rx-clip)">' +
          '<g class="rx-liquid">' +
            '<rect class="rx-fill" x="46" y="0" width="76" height="210" fill="#8a98a6" opacity=".9"/>' +
            '<ellipse class="rx-surface" cx="84" cy="2.4" rx="33" ry="3.4" fill="#fff" opacity=".26"/>' +
          "</g>" +
          '<g class="rx-bubble-layer"></g>' +
        "</g>" +

        '<g class="rx-label" opacity=".9">' +
          '<rect x="55" y="132" width="58" height="34" rx="2.5" fill="rgba(18,15,13,.34)" stroke="rgba(236,223,203,.2)" stroke-width="1"/>' +
          '<path d="M62 143h30M62 150h38M62 157h22" stroke="rgba(236,223,203,.26)" stroke-width="1.4" stroke-linecap="round"/>' +
        "</g>" +

        '<path d="M74 44h20" stroke="rgba(236,223,203,.45)" stroke-width="1.4" stroke-linecap="round"/>' +
        '<path d="M64 146v26" stroke="#fff" stroke-opacity=".09" stroke-width="2.6" stroke-linecap="round"/>' +

        '<g class="rx-drop" opacity="0">' +
          '<circle cx="84" cy="0" r="4.6" fill="#8a98a6"/>' +
          '<circle cx="82.5" cy="-1.6" r="1.3" fill="#fff" opacity=".5"/>' +
        "</g>" +
        '<ellipse class="rx-splash" cx="84" cy="41" rx="7" ry="2" fill="none" stroke="#fff" stroke-width="1.6" opacity="0"/>' +

        '<g transform="translate(226 118)">' +
          '<g class="rx-face">' +
            '<circle r="34" fill="#f2e3c6"/>' +
            '<circle class="rx-tint" r="34" fill="#9fb37a" opacity="0"/>' +
            EXPR +
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
    var tx = box.left + (84 / 300) * box.width;
    var ty = box.top + (40 / 220) * box.height;
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
    var exs = svg.querySelectorAll(".rx-ex");
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
        window.setTimeout(function () { pour(svg, color, true); }, lead);
      } else {
        pour(svg, color);
      }
      window.setTimeout(function () {
        tweenLiquid(liq, fill, fromY, toY, fromColor, color, 540);
        bubbles(svg, toY, 120);
        popHalo(svg);
        if (!sameEx) switchFace(svg, exs, fromEx, ex);
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
