/* ============================================================
   lab3d.js — 全场景 3D 发酵舱
   依赖：本地 assets/vendor/three.min.js（r134，不联网）
   职责：开屏加载 → 3D 房间 → 可拖拽旋转的相机 → 货架原料拖放
        → 3D 小人试饮 → HUD 同步
   与 2D 的关系：只通过 window.AtlasLab 读写选择，不复制数据。
   ============================================================ */
(function (global) {
  "use strict";

  var THREE = global.THREE;
  var A = global.AtlasLab;
  var REDUCE = !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var state = {
    opened: false,
    phase: "idle",      // idle | loading | intro | live
    t0: 0,
    focus: null,
    dragging: null,
    dragDist: 0,
    orbit: false,
    moved: 0,
    px: 0,
    py: 0,
    lx: 0,
    ly: 0,
    overBottle: false,
    reactAt: -1,
    reactEx: 2,
    lastToggle: 0,
    /* 点小人：press 是按下未抬手的候选，poke 正在播的动作 */
    press: null,
    poke: null,
    charStage: 0,
    lastPoke: 0,
    foamDone: false,
    /* 瓶盖收藏：只放内存，不落盘，也不在开屏时回扫 */
    caps: [],
    capsSealed: false,
    capFlight: [],
    capFx: [],
    sealGlowAt: 0,
    /* 瓶内漩涡 */
    spin: 0,
    swirlPulse: 0,
  };

  var cam = { theta: 0.42, phi: 1.34, radius: 12.4, tRadius: 12.4, vT: 0, vP: 0 };
  var BASE = { theta: 0.13, phi: 1.28, radius: 6.9, tx: 0 };
  var TARGET = new THREE.Vector3(0, 1.14, 0);
  var NARROW = false;
  var padRight = 12; /* 右侧读数面板占掉的宽度，气泡别钻到它下面 */

  var els = {}, scene, camera, renderer, ray, ndc, jars = [], pick = [], plates = [], bottle, liquid, surface;
  var char, head, armR, mouthSet = {}, eyeSet = {}, browSet = {}, glassInHand;
  var glowRing, mouthWorld = new THREE.Vector3();
  var orbs = [], drops = [], flash = 0;
  var clock = 0, lastT = 0;
  /* 彩蛋用的小物件：可点的人物部件、上唇泡沫、瓶内漩涡、六枚瓶盖 */
  var charPick = [], foamLip = null, swirl = null;
  var capSockets = null, capMeshes = [];

  /* ---------------- 小工具 ---------------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function lerpAngle(a, b, t) {
    var d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
  }
  function cssColor(hex) { return new THREE.Color(hex); }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  function clip(s, n) {
    s = String(s || "");
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }
  /* 3D 里只讲“原料”：不论页面停在哪种模式，这里一律取日常说法 */
  function L(id) { return A.label(id, "novice"); }
  function S(focusId) { return A.snapshot(focusId, "novice"); }

  /* ---------------- DOM ---------------- */
  function mount() {
    if (els.root) return;
    var root = document.createElement("div");
    root.className = "l3d";
    root.id = "lab3d";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "3D 发酵舱");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<canvas id="l3dCanvas" tabindex="0" aria-label="按 Enter 与酿酒师说话，Esc 退出"></canvas>' +
      '<div class="l3d-say" id="l3dSay" role="status" aria-live="polite" aria-atomic="true">' +
        '<div class="l3d-say-in">' +
          '<p class="l3d-say-l"></p><p class="l3d-say-l"></p>' +
        "</div>" +
      "</div>" +
      '<div class="l3d-scan"></div>' +
      '<div class="l3d-tip" id="l3dTip"></div>' +
      '<header class="l3d-top">' +
        '<div class="l3d-brand"><span class="dot"></span>3D 发酵舱</div>' +
        '<div class="l3d-top-actions">' +
          '<span class="l3d-scope"><b>原料视角</b></span>' +
          '<button type="button" class="l3d-exit" data-l3d-close>退出 3D</button>' +
        "</div>" +
      "</header>" +
      '<aside class="l3d-left">' +
        '<div class="l3d-cap">当前配方 / RECIPE</div>' +
        '<div class="l3d-chips" id="l3dChips"></div>' +
        '<div class="l3d-hint">点一下原料即可投放，也可以直接拖进瓶口<br>拖动空白处旋转视角，滚轮缩放</div>' +
      "</aside>" +
      '<aside class="l3d-right">' +
        '<div class="l3d-score-label">TASTE INDEX</div>' +
        '<div class="l3d-score"><b id="l3dScore">—</b><span>/100</span></div>' +
        '<div class="l3d-verdict" id="l3dVerdict"></div>' +
        '<div class="l3d-focus" id="l3dFocus"></div>' +
        '<div class="l3d-note" id="l3dNote"></div>' +
      "</aside>" +
      '<div class="l3d-bottom">' +
        '<span id="l3dCount">0 种原料</span>' +
        '<span class="l3d-bar"><i id="l3dLevel"></i></span>' +
        '<span id="l3dStyle"></span>' +
        '<span class="l3d-mini" id="l3dMini"></span>' +
      "</div>" +
      '<div class="l3d-loading" id="l3dLoading">' +
        '<div class="l3d-loader">' +
          '<div class="l3d-ring"></div><div class="l3d-ring"></div><div class="l3d-ring"></div>' +
          '<div class="l3d-core">3D<small>LAB</small></div>' +
        "</div>" +
        '<div class="l3d-load-text"><b>正在初始化发酵舱</b><span class="l3d-stage" id="l3dStage">建立三维坐标系…</span>' +
          '<div class="l3d-progress"><i id="l3dBar"></i></div><em class="l3d-pct" id="l3dPct">0%</em></div>' +
        '<button type="button" class="l3d-skip" data-l3d-skip>SKIP</button>' +
      "</div>" +
      '<div class="l3d-error" id="l3dError" hidden><b>这台设备暂时跑不了 3D</b><p id="l3dErrorMsg">浏览器没有可用的 WebGL 上下文。2D 试饮台仍然可用。</p><button type="button" class="l3d-exit" data-l3d-close>返回 2D</button></div>';
    document.body.appendChild(root);

    els = {
      root: root,
      canvas: $("#l3dCanvas", root),
      chips: $("#l3dChips", root),
      score: $("#l3dScore", root),
      verdict: $("#l3dVerdict", root),
      focus: $("#l3dFocus", root),
      note: $("#l3dNote", root),
      count: $("#l3dCount", root),
      level: $("#l3dLevel", root),
      style: $("#l3dStyle", root),
      mini: $("#l3dMini", root),
      loading: $("#l3dLoading", root),
      stage: $("#l3dStage", root),
      bar: $("#l3dBar", root),
      pct: $("#l3dPct", root),
      err: $("#l3dError", root),
      errMsg: $("#l3dErrorMsg", root),
      tip: $("#l3dTip", root),
      say: $("#l3dSay", root),
      sayLines: root.querySelectorAll(".l3d-say-l"),
    };

    root.addEventListener("click", function (e) {
      var close = e.target.closest("[data-l3d-close]");
      if (close) { closeScene(); return; }
      var skip = e.target.closest("[data-l3d-skip]");
      if (skip) { finishLoading(true); return; }
      var chip = e.target.closest("[data-l3d-rm]");
      if (chip) {
        A.toggle(chip.getAttribute("data-l3d-rm"));
        afterChange(chip.getAttribute("data-l3d-rm"), false);
      }
    });

    document.addEventListener("atlas:lang", onLangChange);
    /* 译文比原文长，气泡会变宽；宽度变一次就重量一次，别让它顶到右侧面板 */
    if (global.ResizeObserver) {
      sayRO = new ResizeObserver(function () { measureSay(); });
      sayRO.observe(els.say);
    }
    els.canvas.addEventListener("pointerdown", onDown);
    els.canvas.addEventListener("pointermove", onMove);
    els.canvas.addEventListener("pointerup", onUp);
    els.canvas.addEventListener("pointercancel", onUp);
    els.canvas.addEventListener("pointerleave", function () {
      if (state.press) { state.press = null; els.canvas.style.cursor = ""; }
      if (!state.dragging && !state.orbit) setOver(false);
    });
    els.canvas.addEventListener("keydown", onCanvasKey);
    els.canvas.addEventListener("wheel", onWheel, { passive: false });
    global.addEventListener("resize", onResize);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && state.opened) closeScene();
    });
  }

  /* ---------------- 场景 ---------------- */
  function initScene() {
    if (scene) return true;
    if (!THREE || !A) return false;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: els.canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch (err) {
      showError(err && err.message);
      return false;
    }
    if (!renderer || !renderer.getContext()) { showError(); return false; }

    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x04070a, 1);
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    if (THREE.ACESFilmicToneMapping) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.72;
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x150d09);
    scene.fog = new THREE.FogExp2(0x1a100b, 0.03);

    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
    ray = new THREE.Raycaster();
    ndc = new THREE.Vector2();

    ensureRoomTextures();
    buildLights();
    buildRoom();
    buildShelves();
    buildBottle();
    buildCharacter();
    buildJars();
    onResize();
    return true;
  }

  /* ================= 材质：程序化木纹 / 砖墙 / 地毯 ================= */
  /* 纯色材质再准也“假”，暖意基本来自这几张画出来的贴图 */
  var TEX = {};

  function makeCanvasTex(w, h, draw, rx, ry) {
    var c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.anisotropy = 4;
    return t;
  }

  function texRepeat(src, rx, ry) {
    var t = src.clone();
    t.needsUpdate = true;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    return t;
  }

  function woodTexture(base, dark, light, planks, grain) {
    planks = planks || 6;
    return makeCanvasTex(512, 512, function (g, w, h) {
      var pw = w / planks;
      for (var i = 0; i < planks; i++) {
        var x = i * pw;
        g.fillStyle = i % 2 ? base : dark;
        g.fillRect(x, 0, pw, h);
        g.globalAlpha = 0.1 + (i % 3) * 0.05;
        g.fillStyle = light;
        g.fillRect(x, 0, pw, h);
        g.globalAlpha = 1;
        var n = grain || 26;
        for (var k = 0; k < n; k++) {
          var y0 = (k / n) * h + Math.random() * 6;
          g.strokeStyle = "rgba(40,22,12," + (0.05 + Math.random() * 0.07).toFixed(3) + ")";
          g.lineWidth = 0.8 + Math.random() * 1.6;
          g.beginPath();
          g.moveTo(x, y0);
          for (var s = 1; s <= 6; s++) {
            g.lineTo(x + (s / 6) * pw, y0 + Math.sin(s * 1.7 + k) * 2.2);
          }
          g.stroke();
        }
        g.fillStyle = "rgba(28,15,8,0.5)";
        g.fillRect(x, 0, 1.5, h);
      }
    });
  }

  function brickTexture() {
    return makeCanvasTex(512, 512, function (g, w, h) {
      g.fillStyle = "#5a3b2e";
      g.fillRect(0, 0, w, h);
      var rows = 9, cols = 4, bh = h / rows, bw = w / cols;
      for (var r = 0; r < rows; r++) {
        for (var c = -1; c <= cols; c++) {
          var x = c * bw + (r % 2 ? bw / 2 : 0);
          var y = r * bh;
          var t = 0.8 + Math.random() * 0.34;
          g.fillStyle = "rgb(" + Math.round(126 * t) + "," + Math.round(74 * t) + "," + Math.round(56 * t) + ")";
          g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
          g.fillStyle = "rgba(255,214,176,0.055)";
          g.fillRect(x + 3, y + 3, bw - 6, 3);
          g.fillStyle = "rgba(20,10,6,0.12)";
          g.fillRect(x + 2, y + bh - 6, bw - 4, 3);
        }
      }
    }, 4.4, 2.2);
  }

  function rugTexture() {
    return makeCanvasTex(512, 512, function (g, w, h) {
      var cx = w / 2, cy = h / 2;
      g.fillStyle = "#3a2016";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#3a1c14";
      g.beginPath();
      g.arc(cx, cy, cx - 2, 0, Math.PI * 2);
      g.fill();
      ["#6b2f24", "#492018", "#7a3a28", "#3f1c15"].forEach(function (col, i) {
        g.strokeStyle = col;
        g.globalAlpha = 0.55;
        g.lineWidth = 30 - i * 5;
        g.beginPath();
        g.arc(cx, cy, cx - 26 - i * 38, 0, Math.PI * 2);
        g.stroke();
      });
      g.globalAlpha = 1;
      g.strokeStyle = "rgba(0,0,0,0.12)";
      g.lineWidth = 2;
      for (var i = 0; i < 96; i++) {
        var a = (i / 96) * Math.PI * 2;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26);
        g.lineTo(cx + Math.cos(a) * (cx - 8), cy + Math.sin(a) * (cy - 8));
        g.stroke();
      }
    });
  }

  function ensureRoomTextures() {
    if (TEX.wood) return;
    TEX.wood = woodTexture("#8d5c39", "#7a4b2c", "#a06c44", 6, 30);
    TEX.plank = woodTexture("#b07a4c", "#98643c", "#c48d5a", 4, 20);
    TEX.brick = brickTexture();
    TEX.rug = rugTexture();
    TEX.glowWarm = radialTexture("rgba(255,196,128,0.95)", "rgba(255,150,70,0)");
  }

  /* ================= 灯光 ================= */
  var pendants = [];

  function buildLights() {
    /* 暖色天光：上半球是灯罩的米黄，下半球是地板的深棕 */
    scene.add(new THREE.HemisphereLight(0xffd7ae, 0x2a1a10, 0.26));

    var key = new THREE.SpotLight(0xffc98a, 1.1, 30, 0.8, 0.75, 1.15);
    key.position.set(-3.4, 7.4, 4.6);
    key.target.position.set(-0.4, 1.0, 0.2);
    scene.add(key, key.target);

    /* 两盏吊灯：既是光源，也是“这屋子有人在用”的暗示 */
    pendants.push(makePendant(-2.55, 3.12, -0.8, 1.0));
    pendants.push(makePendant(2.62, 3.2, -1.2, 0.82));

    /* 冷轮廓只留一点，把人和砖墙分开 */
    var rim = new THREE.PointLight(0x86ccc6, 0.42, 15, 2);
    rim.position.set(4.9, 2.7, 1.5);
    scene.add(rim);

    /* 货架补光：暖白贴脸，别让原料的颜色被环境吃掉 */
    var fill = new THREE.PointLight(0xffd2a4, 0.5, 9, 2);
    fill.position.set(0, 2.35, -1.35);
    scene.add(fill);

    /* 相机侧柔光：给人物补脸，不然半边脸全在阴影里 */
    var face = new THREE.PointLight(0xffcfa0, 0.55, 7, 2);
    face.position.set(2.8, 1.85, 3.2);
    scene.add(face);
  }

  function makePendant(x, y, z, power) {
    var g = new THREE.Group();
    g.position.set(x, y, z);

    /* 吊点在天花板：整盏灯挂在一个 pivot 上，摆起来才是真的绕挂点转。
       PointLight 留在 g 里不跟着摆 —— 否则全场材质的受光每帧都在抖。 */
    var hang = 7.4 - y;
    var pivot = new THREE.Group();
    pivot.position.y = hang;
    g.add(pivot);

    var cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, hang, 6),
      mat(0x1a1310, { r: 0.9 })
    );
    cord.position.y = -hang / 2;
    pivot.add(cord);

    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.058, 0.05, 12), mat(0x2a221c, { r: 0.5, m: 0.5 }));
    cap.position.y = 0.22 - hang;
    pivot.add(cap);

    var shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.27, 0.26, 30, 1, true),
      mat(0x3a2f26, { r: 0.45, m: 0.5, back: true })
    );
    shade.position.y = 0.08 - hang;
    pivot.add(shade);

    var inner = new THREE.Mesh(
      new THREE.ConeGeometry(0.255, 0.24, 30, 1, true),
      mat(0xffcf94, { r: 0.6, e: 0.6, back: true })
    );
    /* mat() 是全局缓存：两盏灯拿到的是同一个实例，改发光强度会两盏一起变。
       摆动要各自呼吸，这里必须 clone 一份。 */
    inner.material = inner.material.clone();
    inner.position.y = 0.075 - hang;
    pivot.add(inner);

    var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.062, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe0b4 }));
    bulb.position.y = -0.04 - hang;
    pivot.add(bulb);

    var glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glowWarm, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.5,
    }));
    glow.scale.set(1.7, 1.7, 1);
    glow.position.y = -0.04 - hang;
    pivot.add(glow);

    var lamp = new THREE.PointLight(0xffb877, 0.9 * power, 11, 2);
    lamp.position.y = -0.1;
    g.add(lamp);

    g.userData.pivot = pivot;
    g.userData.glow = glow;
    g.userData.inner = inner;
    g.userData.bulb = bulb;
    g.userData.lamp = lamp;
    g.userData.power = power;
    g.userData.ang = 0;
    g.userData.vel = 0;

    scene.add(g);
    return g;
  }

  var BULB_BASE = new THREE.Color(0xffe0b4);
  var BULB_WARM = new THREE.Color(0xfff3dc);

  /* 吊灯惯性：镜头一转，灯跟着“甩”一下再荡回来。
     没加任何 mesh，只让 pivot 绕 z 轴转，g 与 pendants[] 都不动。
     发光跟着摆幅微调（单次变化 ≤10%），否则摆动会读成灯在接触不良。 */
  function updatePendants(dt) {
    if (!pendants.length) return;
    var t0 = clamp(cam.vT * 6, -0.1, 0.1);
    var t1 = clamp(cam.vP * 6, -0.1, 0.1) * -0.7;
    for (var i = 0; i < pendants.length; i++) {
      var p = pendants[i];
      var u = p.userData;
      var piv = u.pivot;
      if (!piv) continue;
      if (REDUCE) {
        piv.rotation.z = 0;
        u.ang = 0;
        u.vel = 0;
        if (u.glow) u.glow.material.opacity = 0.5;
        if (u.inner) u.inner.material.emissiveIntensity = 0.6;
        if (u.bulb) u.bulb.material.color.copy(BULB_BASE);
        if (u.lamp) u.lamp.intensity = u.power * 0.9;
        continue;
      }
      var target = i ? t1 : t0;
      /* 阻尼弹簧：往目标角追，越过再荡回来 */
      u.vel += (-(u.ang - target) * 9 - u.vel * 1.1) * dt;
      u.ang += u.vel * dt;
      u.ang = clamp(u.ang, -0.19, 0.19);
      piv.rotation.z = u.ang;

      var k = Math.min(1, Math.abs(u.ang) / 0.14);
      if (u.glow) u.glow.material.opacity = 0.5 + 0.07 * k;
      if (u.inner) u.inner.material.emissiveIntensity = 0.6 - 0.11 * k;
      if (u.bulb) u.bulb.material.color.copy(BULB_BASE).lerp(BULB_WARM, 0.1 * k);
      if (u.lamp) u.lamp.intensity = u.power * 0.9 * (1 - 0.04 * k);
    }
  }

  /* 接地阴影：不开 shadowMap，用一张软圆片把物体“按”在地上 */
  function makeBlobShadow(r, op) {
    var m = new THREE.Mesh(
      new THREE.PlaneGeometry(r * 2.1, r * 2.1),
      new THREE.MeshBasicMaterial({
        map: radialTexture("rgba(0,0,0,0.6)", "rgba(0,0,0,0)"),
        transparent: true, depthWrite: false, opacity: op == null ? 0.5 : op,
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.013;
    return m;
  }

  /* ================= 房间 ================= */
  function buildRoom() {
    ensureRoomTextures();

    var floor = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 18),
      new THREE.MeshStandardMaterial({ map: texRepeat(TEX.wood, 4, 3.4), color: 0x9c7452, roughness: 0.87, metalness: 0.03 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -1.5);
    scene.add(floor);

    /* 圆地毯：让中央这一小块像“有人待着”的地方 */
    var rug = new THREE.Mesh(
      new THREE.CircleGeometry(2.0, 56),
      new THREE.MeshStandardMaterial({ map: TEX.rug, roughness: 0.97, metalness: 0 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0.5, 0.007, 1.0);
    scene.add(rug);

    var wall = new THREE.Mesh(
      new THREE.BoxGeometry(20, 7.6, 0.3),
      new THREE.MeshStandardMaterial({ map: texRepeat(TEX.brick, 3.4, 1.5), color: 0x8d5c46, roughness: 0.96 })
    );
    wall.position.set(0, 3.4, -4.48);
    scene.add(wall);

    /* 墙裙：齐腰的木板，砖墙就不那么“厂房” */
    var wain = new THREE.Mesh(
      new THREE.BoxGeometry(20, 1.02, 0.1),
      new THREE.MeshStandardMaterial({ map: texRepeat(TEX.plank, 6, 1), color: 0x94674a, roughness: 0.82 })
    );
    wain.position.set(0, 0.51, -4.3);
    scene.add(wain);

    var railMat = mat(0x7a4f30, { r: 0.7 });
    var rail = new THREE.Mesh(new THREE.BoxGeometry(20, 0.07, 0.16), railMat);
    rail.position.set(0, 1.02, -4.26);
    scene.add(rail);

    /* 横梁：招牌挂在这上头 */
    var beam = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.15, 0.18), railMat);
    beam.position.set(0, 3.9, -4.2);
    scene.add(beam);

    /* 左边的铜发酵罐，暖金属和大木桶是同一套色 */
    [-6.9, -8.2].forEach(function (x, i) {
      var h = 3.2 - i * 0.55;
      var tank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.66, 0.72, h, 28),
        mat(0x8d5a33, { r: 0.38, m: 0.78 })
      );
      tank.position.set(x, h / 2, -2.9 - i * 0.9);
      scene.add(tank);
      var cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.66, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
        mat(0x8d5a33, { r: 0.38, m: 0.78 })
      );
      cap.position.set(x, h, -2.9 - i * 0.9);
      scene.add(cap);
      var hoop = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.022, 8, 30), mat(0x4a4038, { r: 0.5, m: 0.6 }));
      hoop.rotation.x = Math.PI / 2;
      hoop.position.set(x, h * 0.42, -2.9 - i * 0.9);
      scene.add(hoop);
    });

    /* 右墙边：木桶、板条箱、一盆啤酒花 */
    scene.add(makeBarrel(-4.62, -2.55, 0.42, 0.86));
    scene.add(makeBarrel(-4.0, -3.35, 0.3, 0.62));
    scene.add(makeCrate(4.3, -2.9, 0.62, 0.44));
    scene.add(makeCrate(4.38, -2.45, 0.5, 0.34, 0.46));
    scene.add(makePlant(-3.5, -1.75));
    scene.add(makeBoard(-5.3, 2.35, -4.26, 0.36));
  }

  function makeBarrel(x, z, r, h) {
    var g = new THREE.Group();
    var pts = [];
    for (var i = 0; i <= 10; i++) {
      var t = i / 10;
      pts.push(new THREE.Vector2(r * (0.82 + 0.18 * Math.sin(Math.PI * t)), t * h));
    }
    var body = new THREE.Mesh(
      new THREE.LatheGeometry(pts, 26),
      new THREE.MeshStandardMaterial({ map: texRepeat(TEX.plank, 2, 1), color: 0xc08a5c, roughness: 0.8 })
    );
    g.add(body);

    [0.16, 0.5, 0.84].forEach(function (t) {
      var rr = r * (0.82 + 0.18 * Math.sin(Math.PI * t)) + 0.008;
      var hoop = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.014, 6, 26), mat(0x453a30, { r: 0.45, m: 0.55 }));
      hoop.rotation.x = Math.PI / 2;
      hoop.position.y = t * h;
      g.add(hoop);
    });

    var lid = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.82, r * 0.82, 0.03, 22), mat(0x6f4526, { r: 0.8 }));
    lid.position.y = h + 0.005;
    g.add(lid);
    g.add(makeBlobShadow(r * 1.15, 0.45));

    g.position.set(x, 0, z);
    g.rotation.y = x * 0.7;
    return g;
  }

  function makeCrate(x, z, w, h, y) {
    var g = new THREE.Group();
    var box = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, w * 0.82),
      new THREE.MeshStandardMaterial({ map: texRepeat(TEX.plank, 2, 1), color: 0xc79a6c, roughness: 0.85 })
    );
    g.add(box);
    var frameMat = mat(0x8a5c38, { r: 0.8 });
    [-1, 1].forEach(function (s) {
      var sl = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.035, w * 0.86), frameMat);
      sl.position.y = s * (h / 2 - 0.02);
      g.add(sl);
      var side = new THREE.Mesh(new THREE.BoxGeometry(0.035, h, w * 0.86), frameMat);
      side.position.x = s * (w / 2 - 0.01);
      g.add(side);
    });
    g.position.set(x, (y || 0) + h / 2, z);
    g.rotation.y = 0.16;
    g.add(makeBlobShadow(w * 0.72, 0.4));
    return g;
  }

  function makePlant(x, z) {
    var g = new THREE.Group();
    var pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.13, 0.24, 20),
      mat(0xa85a3a, { r: 0.85 })
    );
    pot.position.y = 0.12;
    g.add(pot);
    var rim = new THREE.Mesh(new THREE.TorusGeometry(0.172, 0.016, 8, 22), mat(0xb96a46, { r: 0.8 }));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.235;
    g.add(rim);
    var soil = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.02, 20), mat(0x3a2418, { r: 0.95 }));
    soil.position.y = 0.235;
    g.add(soil);

    var leafMat = mat(0x4f7a3a, { r: 0.85, flat: true });
    for (var i = 0; i < 7; i++) {
      var a = (i / 7) * Math.PI * 2 + 0.4;
      var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.009, 0.42, 6), mat(0x557a3c, { r: 0.9 }));
      stem.position.set(Math.sin(a) * 0.05, 0.42, Math.cos(a) * 0.05);
      stem.rotation.set(Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35);
      g.add(stem);

      var leaf = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), leafMat);
      leaf.scale.set(0.9, 0.22, 0.62);
      leaf.position.set(Math.sin(a) * 0.16, 0.52 + (i % 3) * 0.08, Math.cos(a) * 0.16);
      leaf.rotation.set(Math.cos(a) * 0.5, -a, -Math.sin(a) * 0.5);
      g.add(leaf);
    }
    g.position.set(x, 0, z);
    g.add(makeBlobShadow(0.3, 0.4));
    return g;
  }

  function makeBoard(x, y, z, faceY) {
    var c = document.createElement("canvas");
    c.width = 512; c.height = 352;
    var g = c.getContext("2d");
    g.fillStyle = "#20241f";
    g.fillRect(0, 0, 512, 352);
    g.fillStyle = "rgba(255,255,255,0.035)";
    for (var i = 0; i < 40; i++) g.fillRect(Math.random() * 512, Math.random() * 352, 40, 1);
    g.fillStyle = "rgba(240,226,196,0.92)";
    g.font = "600 34px 'PingFang SC', sans-serif";
    g.fillText("今日试酿", 40, 70);
    g.fillStyle = "rgba(233,169,78,0.95)";
    g.font = "600 64px Georgia, serif";
    g.fillText("TRIPEL", 40, 150);
    g.strokeStyle = "rgba(240,226,196,0.35)";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(40, 180);
    g.lineTo(472, 180);
    g.stroke();
    g.fillStyle = "rgba(240,226,196,0.8)";
    g.font = "28px monospace";
    g.fillText("8.2% ABV", 40, 228);
    g.fillText("24 IBU", 40, 268);
    g.fillText("18 °C", 40, 308);
    g.fillStyle = "rgba(240,226,196,0.25)";
    g.font = "italic 24px Georgia, serif";
    g.fillText("— 第 22 号发酵记录 —", 40, 340);

    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    var frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.72, 1.22, 0.05),
      new THREE.MeshStandardMaterial({ map: texRepeat(TEX.plank, 1, 1), color: 0xb98a5e, roughness: 0.8 })
    );
    var face = new THREE.Mesh(
      new THREE.PlaneGeometry(1.56, 1.06),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })
    );
    face.position.z = 0.028;
    var grp = new THREE.Group();
    grp.add(frame, face);
    grp.position.set(x, y, z);
    grp.rotation.y = faceY == null ? -0.22 : faceY;
    return grp;
  }

  /* ================= 货架 ================= */
  function buildShelves() {
    var boardMat = new THREE.MeshStandardMaterial({
      map: texRepeat(TEX.plank, 3, 1), color: 0xa5754a, roughness: 0.78, metalness: 0.04,
    });
    var shelf = new THREE.Group();

    [0.78, 1.72, 2.66].forEach(function (y) {
      var board = new THREE.Mesh(new THREE.BoxGeometry(7.9, 0.085, 0.64), boardMat);
      board.position.set(0, y, -3.52);
      shelf.add(board);

      /* 板下的暖光条：不真的照明，只负责“这层被人照看着” */
      var strip = new THREE.Mesh(
        new THREE.BoxGeometry(7.6, 0.014, 0.03),
        new THREE.MeshBasicMaterial({ color: 0xffb877, transparent: true, opacity: 0.42 })
      );
      strip.position.set(0, y - 0.052, -3.23);
      shelf.add(strip);

      [-3.5, -1.17, 1.17, 3.5].forEach(function (x) {
        var br = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.17, 0.5), boardMat);
        br.position.set(x, y - 0.12, -3.56);
        shelf.add(br);
      });
    });

    [-3.97, 3.97].forEach(function (x) {
      [-3.76, -3.3].forEach(function (z) {
        var post = new THREE.Mesh(new THREE.BoxGeometry(0.085, 3.44, 0.085), boardMat);
        post.position.set(x, 1.7, z);
        shelf.add(post);
      });
      var foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.6), boardMat);
      foot.position.set(x, 0.025, -3.53);
      shelf.add(foot);
    });

    scene.add(shelf);

    /* 货架顶上的木招牌 */
    var sign = makeSign();
    sign.position.set(0, 3.62, -4.05);
    scene.add(sign);
  }

  function makeSign() {
    var c = document.createElement("canvas");
    c.width = 1024; c.height = 192;
    var g = c.getContext("2d");
    g.fillStyle = "rgba(26,15,9,0.94)";
    g.fillRect(0, 0, 1024, 192);
    g.strokeStyle = "rgba(233,169,78,0.5)";
    g.lineWidth = 4;
    g.strokeRect(2, 2, 1020, 188);
    g.fillStyle = "rgba(233,169,78,0.85)";
    g.fillRect(40, 62, 6, 68);
    g.fillStyle = "#f8e0b6";
    g.font = "600 62px 'PingFang SC', sans-serif";
    g.textBaseline = "middle";
    g.fillText("原 料 仓", 68, 88);
    g.fillStyle = "rgba(214,176,138,0.9)";
    g.font = "500 24px monospace";
    g.fillText("INGREDIENT STORE", 72, 136);
    g.textAlign = "right";
    g.fillStyle = "rgba(214,176,138,0.66)";
    g.font = "500 22px monospace";
    g.fillText("24 UNITS · 4°C", 984, 120);
    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sp.scale.set(2.7, 0.5, 1);
    return sp;
  }

  /* ================= 酒瓶 ================= */
  function buildBottle() {
    bottle = new THREE.Group();
    bottle.position.set(-1.25, 0, 0.9);

    /* 木质垫台 + 一圈黄铜环，替掉冷冰冰的金属底座 */
    var pedMat = new THREE.MeshStandardMaterial({
      map: texRepeat(TEX.plank, 2, 1), color: 0x8a5f3c, roughness: 0.8, metalness: 0.05,
    });
    var ped = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.0, 0.2, 36), pedMat);
    ped.position.y = 0.1;
    bottle.add(ped);

    var pedRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.93, 0.014, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0xe9a94e, transparent: true, opacity: 0.6 })
    );
    pedRing.rotation.x = Math.PI / 2;
    pedRing.position.y = 0.205;
    bottle.add(pedRing);
    glowRing = pedRing;

    var pts = [
      [0, 0], [0.3, 0], [0.34, 0.05], [0.35, 0.52], [0.31, 0.72],
      [0.16, 0.95], [0.14, 1.32], [0.165, 1.38], [0.165, 1.44], [0.13, 1.46],
    ].map(function (p) { return new THREE.Vector2(p[0], p[1]); });

    var glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x3a2a1a, transparent: true, opacity: 0.52,
      roughness: 0.12, metalness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.06,
      side: THREE.DoubleSide, depthWrite: false,
    });
    var glass = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), glassMat);
    glass.position.y = 0.2;
    bottle.add(glass);

    var lq = new THREE.CylinderGeometry(0.305, 0.305, 1.0, 32, 1, false);
    lq.translate(0, 0.5, 0);
    liquid = new THREE.Mesh(lq, new THREE.MeshBasicMaterial({ color: 0x2a1a0c }));
    liquid.position.y = 0.26;
    liquid.scale.y = 0.16;
    bottle.add(liquid);

    surface = new THREE.Mesh(
      new THREE.CircleGeometry(0.3, 32),
      new THREE.MeshBasicMaterial({ color: 0xe3a857, transparent: true, opacity: 0.5 })
    );
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = 0.26 + 0.16;
    bottle.add(surface);

    /* 瓶内漩涡：液面是一张纯色圆片，只转材质看不出变化，
       所以再压一张画出来的旋纹 —— 投料后转几圈自己停下，静止时 0 draw call。 */
    swirl = new THREE.Mesh(
      new THREE.CircleGeometry(0.30, 40),
      new THREE.MeshBasicMaterial({
        map: swirlTexture(), transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending,
      })
    );
    swirl.rotation.x = -Math.PI / 2;
    swirl.position.y = 0.26 + 0.16 + 0.002;
    swirl.visible = false;
    swirl.renderOrder = 2;
    bottle.add(swirl);

    /* 软木塞与封口，瓶口才不是一根空心管子 */
    var cork = new THREE.Mesh(new THREE.CylinderGeometry(0.128, 0.132, 0.12, 20), mat(0xb98a55, { r: 0.92 }));
    cork.position.y = 0.2 + 1.47;
    bottle.add(cork);
    var foil = new THREE.Mesh(new THREE.CylinderGeometry(0.142, 0.142, 0.05, 24), mat(0xb5813a, { r: 0.35, m: 0.75 }));
    foil.position.y = 0.2 + 1.43;
    bottle.add(foil);

    var lc = document.createElement("canvas");
    lc.width = 512; lc.height = 256;
    var lg = lc.getContext("2d");
    lg.fillStyle = "#6b3a22";
    lg.fillRect(0, 0, 512, 256);
    lg.strokeStyle = "rgba(240,220,180,0.7)";
    lg.lineWidth = 6;
    lg.strokeRect(12, 12, 488, 232);
    lg.fillStyle = "#f4e2bb";
    lg.font = "600 54px Georgia, serif";
    lg.textAlign = "center";
    lg.fillText("BEER", 256, 92);
    lg.fillText("ATLAS", 256, 152);
    lg.fillStyle = "rgba(240,220,180,0.7)";
    lg.font = "22px monospace";
    lg.fillText("FERMENTATION UNIT · 22", 256, 198);
    var ltex = new THREE.CanvasTexture(lc);
    var label = new THREE.Mesh(
      new THREE.CylinderGeometry(0.353, 0.353, 0.44, 40, 1, true, -0.95, 1.9),
      new THREE.MeshStandardMaterial({ map: ltex, roughness: 0.66, metalness: 0.03 })
    );
    label.position.y = 0.55;
    bottle.add(label);

    var mouthRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.15, 0.012, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x5fe3d0, transparent: true, opacity: 0.0 })
    );
    mouthRing.rotation.x = Math.PI / 2;
    mouthRing.position.y = 0.2 + 1.52;
    mouthRing.userData.mouth = true;
    bottle.add(mouthRing);
    bottle.userData.mouthRing = mouthRing;

    buildCaps();

    scene.add(bottle);
    mouthWorld.set(-1.25, 0.2 + 1.52, 0.9);
  }

  /* ---------------- 六枚瓶盖 ----------------
     按风味族配对，不认具体化合物：只要瓶里同时出现过某两族，就掉一枚盖子。
     槽位与规则固定绑定（槽 0 恒为酵母×酒花……），所以中途是「随机几个坑先亮」。
     空凹位是常驻的可发现性暗示（1 个 InstancedMesh），盖子解锁前不占 draw call。 */
  var CAP_PAIRS = [
    { a: "yeast", b: "hop" },
    { a: "yeast", b: "malt" },
    { a: "hop", b: "phenol" },
    { a: "malt", b: "phenol" },
    { a: "wild", b: "yeast" },
    { a: "wild", b: "malt" },
  ];

  var CAP_SAY = [
    ["果香酒花，酵母碰酒花。", "垫台记下了。"],
    ["香蕉面包，酵母吃过麦芽。", "垫台记下了。"],
    ["香料花园，酒花遇见酚。", "垫台记下了。"],
    ["酚类点了火，麦芽焦了。", "垫台记下了。"],
    ["野菌接手，酵母退了。", "垫台记下了。"],
    ["六枚都在了。", "往后这屋子有你一份。"],
  ];

  /* 弧位：-52° … +52°，步长 20.8°，半径 0.78。弧长 0.283，盖径 0.175，不会叠。 */
  var CAP_R = 0.78;
  var CAP_Y = 0.2075;        /* 盖心 */
  var CAP_RING_Y = 0.2062;   /* 凹位刻痕，比盖低一点，盖上后不打架 */
  var CAP_TILT = 12 * Math.PI / 180;

  function capAngle(i) { return (-52 + 20.8 * i) * Math.PI / 180; }
  function capSlot(i) {
    var a = capAngle(i);
    return new THREE.Vector3(Math.sin(a) * CAP_R, CAP_Y, Math.cos(a) * CAP_R);
  }

  var capFam = {}, capFamColor = {}, capReady = false;

  function readCapFamilies() {
    if (capReady || !A) return;
    var meta = A.meta();
    (meta.compounds || []).forEach(function (c) {
      capFam[c.id] = c.family;
      if (!capFamColor[c.family]) {
        var lb = A.label(c.id);
        if (lb && lb.color) capFamColor[c.family] = lb.color;
      }
    });
    capReady = true;
  }

  /* 双色：盖面用第一个族、冠圈用第二个族 —— 六枚连起来才构成一张族对表。
     都往铜色里兑一点，压得住头顶吊灯的直射，不会在浅木垫台上糊成白点。
     麦芽作冠圈时压到 #96593A：酵母金和麦芽铜只差 12° 色相，2px 冠圈会糊成一块。 */
  function capColors(pair) {
    readCapFamilies();
    var face = cssColor(capFamColor[pair.a] || "#b5813a")
      .lerp(cssColor(0xb5813a), 0.3).multiplyScalar(0.5);
    var band = pair.b === "malt"
      ? cssColor(0x96593a)
      : cssColor(capFamColor[pair.b] || "#8d5a33").lerp(cssColor(0xb5813a), 0.2);
    band.multiplyScalar(0.56);
    return { face: face, band: band };
  }

  function setCapOpacity(g, v) {
    g.traverse(function (o) { if (o.isMesh && o.material) o.material.opacity = v; });
  }

  function buildCaps() {
    /* 凹位刻痕：6 个同形环，1 个 InstancedMesh，环半径 0.095 贴着盖边 */
    var geo = new THREE.TorusGeometry(0.095, 0.006, 6, 20);
    geo.rotateX(-Math.PI / 2);   /* 先把环放平，实例矩阵就只剩平移 */
    capSockets = new THREE.InstancedMesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: 0x8a6a44, transparent: true, opacity: 0.55, depthWrite: false,
      }),
      CAP_PAIRS.length
    );
    capSockets.renderOrder = 1;
    var m4 = new THREE.Matrix4();
    for (var i = 0; i < CAP_PAIRS.length; i++) {
      var p = capSlot(i);
      m4.makeTranslation(p.x, CAP_RING_Y, p.z);
      capSockets.setMatrixAt(i, m4);
    }
    capSockets.instanceMatrix.needsUpdate = true;
    capSockets.frustumCulled = false;
    bottle.add(capSockets);

    capMeshes = CAP_PAIRS.map(function (pair, idx) {
      var g = new THREE.Group();
      var cols = capColors(pair);
      /* 盖面 14–16 段平面着色就读成「压边盖」；冠圈单独一个材质，双色才立得住 */
      var faceMat = new THREE.MeshStandardMaterial({
        color: cols.face, roughness: 0.82, metalness: 0.2,
        flatShading: true, transparent: true, opacity: 1,
      });
      var bandMat = new THREE.MeshStandardMaterial({
        color: cols.band, roughness: 0.68, metalness: 0.26,
        transparent: true, opacity: 1,
      });
      var face = new THREE.Mesh(new THREE.CylinderGeometry(0.0875, 0.0875, 0.012, 16), faceMat);
      face.position.y = 0.004;
      g.add(face);
      /* 冠圈压到盖面下缘并外扩一点，俯视才看得见那圈深色压边 */
      var band = new THREE.Mesh(new THREE.TorusGeometry(0.089, 0.0075, 6, 18), bandMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = -0.004;
      g.add(band);

      /* 统一朝瓶心倾 12°（绕切向轴）：六枚高光落在同一侧，整排读成一条弧 */
      var a = capAngle(idx);
      g.quaternion.setFromAxisAngle(new THREE.Vector3(Math.cos(a), 0, -Math.sin(a)), CAP_TILT);
      g.userData.quat = g.quaternion.clone();
      g.position.copy(capSlot(idx));
      g.visible = false;
      bottle.add(g);
      return g;
    });
  }

  function mouthLocal() {
    return mouthWorld.clone().sub(bottle.position);
  }

  /* 瓶口一捧光：复用吊灯那张暖光贴图。第 1 枚收半档，后面才是标准亮度。 */
  function mouthFlash(now, first) {
    var op = REDUCE ? 0.6 : (first ? 0.51 : 0.85);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glowWarm, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: op,
    }));
    sp.position.copy(mouthWorld);
    sp.scale.setScalar(REDUCE ? 0.9 : (first ? 0.5 : 0.35));
    scene.add(sp);
    state.capFx.push({
      obj: sp, kind: "flash", t0: now,
      dur: REDUCE ? 400 : (first ? 450 : 900),
      to: first ? 1.0 : 1.5,
    });
  }

  /* 凹位上一圈脉冲：用完立刻 remove，不留常驻开销 */
  function capPulse(at, now) {
    initGeo();
    var ring = new THREE.Mesh(
      GEO.capPulse,
      new THREE.MeshBasicMaterial({ color: 0xf6cd85, transparent: true, opacity: 0.7, depthWrite: false })
    );
    ring.position.copy(at);
    ring.rotation.x = -Math.PI / 2;
    ring.scale.setScalar(0.05);
    ring.renderOrder = 2;
    bottle.add(ring);
    state.capFx.push({ obj: ring, kind: "ring", t0: now, dur: 500 });
  }

  function unlockCap(i, now) {
    if (state.caps.indexOf(i) >= 0) return false;
    state.caps.push(i);
    var first = state.caps.length === 1;
    var g = capMeshes[i];
    if (!g) return true;
    if (REDUCE) {
      /* 不飞：直接落位，120ms 淡入 */
      g.position.copy(capSlot(i));
      g.quaternion.copy(g.userData.quat);
      g.visible = true;
      setCapOpacity(g, 0);
      state.capFlight.push({ mesh: g, kind: "fade", t0: now, dur: 120 });
    } else {
      /* 抛物线三档完全一致：变光不变盖，飞得长短会被读成物理出错 */
      g.position.copy(mouthLocal());
      g.scale.setScalar(1);
      g.visible = true;
      state.capFlight.push({
        mesh: g, kind: "fly", t0: now, dur: 620,
        from: mouthLocal(), to: capSlot(i),
      });
    }
    mouthFlash(now, first);
    return true;
  }

  /* 一次 commit 最多解锁 1 枚：取槽位序号最小的未收集命中项。
     否则两枚盖同飞、闪两次光、两套台词抢同一个气泡。 */
  function checkCaps() {
    if (!capSockets) return -1;
    readCapFamilies();
    var have = {};
    S(null).ids.forEach(function (id) {
      var f = capFam[id];
      if (f) have[f] = 1;
    });
    var got = -1;
    for (var i = 0; i < CAP_PAIRS.length; i++) {
      if (state.caps.indexOf(i) >= 0) continue;
      if (have[CAP_PAIRS[i].a] && have[CAP_PAIRS[i].b]) { got = i; break; }
    }
    if (got < 0) return -1;
    unlockCap(got, performance.now());
    if (state.caps.length >= CAP_PAIRS.length && !state.capsSealed) {
      state.capsSealed = true;
      state.sealGlowAt = performance.now();
    }
    return got;
  }

  function updateCaps(now) {
    for (var i = state.capFlight.length - 1; i >= 0; i--) {
      var f = state.capFlight[i];
      var k = clamp((now - f.t0) / f.dur, 0, 1);
      if (f.kind === "fade") {
        setCapOpacity(f.mesh, k);
        if (k >= 1) { setCapOpacity(f.mesh, 1); state.capFlight.splice(i, 1); }
        continue;
      }
      if (f.kind === "bounce") {
        var b = 1 - ease(k);
        f.mesh.scale.set(1 + 0.15 * b, 1 - 0.2 * b, 1 + 0.15 * b);
        if (k >= 1) { f.mesh.scale.setScalar(1); state.capFlight.splice(i, 1); }
        continue;
      }
      /* fly：水平直线 + 竖直抛物线，顺手转 6 rad */
      var e = ease(k);
      f.mesh.position.lerpVectors(f.from, f.to, e);
      f.mesh.position.y += Math.sin(Math.PI * e) * 0.55;
      f.mesh.rotation.x = e * 6;
      if (k >= 1) {
        f.mesh.position.copy(f.to);
        f.mesh.quaternion.copy(f.mesh.userData.quat);   /* 落回「朝瓶心 12°」的姿势 */
        state.capFlight.splice(i, 1);
        state.capFlight.push({ mesh: f.mesh, kind: "bounce", t0: now, dur: 160 });
        capPulse(f.to, now);
      }
    }

    for (var j = state.capFx.length - 1; j >= 0; j--) {
      var x = state.capFx[j];
      var t = clamp((now - x.t0) / x.dur, 0, 1);
      if (x.kind === "flash") {
        var op0 = REDUCE ? 0.6 : (x.to > 1.1 ? 0.85 : 0.51);
        x.obj.material.opacity = op0 * (1 - t);
        if (!REDUCE) x.obj.scale.setScalar(0.35 + ((x.to || 1.5) - 0.35) * ease(t));
        if (t >= 1) {
          scene.remove(x.obj);
          x.obj.material.dispose();
          state.capFx.splice(j, 1);
        }
      } else {
        x.obj.material.opacity = 0.7 * (1 - t);
        if (!REDUCE) x.obj.scale.setScalar(0.05 + 0.1 * ease(t));
        if (t >= 1) {
          bottle.remove(x.obj);
          x.obj.material.dispose();
          state.capFx.splice(j, 1);
        }
      }
    }
  }

  /* ================= 人物 ================= */
  function buildCharacter() {
    char = new THREE.Group();
    char.position.set(2.0, 0, 1.0);

    var skin = mat(0xe4b487, { r: 0.84 });
    var shirt = mat(0xe4d7bb, { r: 0.94 });
    var shirtDark = mat(0xcfc3a8, { r: 0.95 });
    var apron = mat(0x6a3f26, { r: 0.9 });
    var pants = mat(0x2c3a3c, { r: 0.92 });
    var boot = mat(0x4a3022, { r: 0.72 });
    var hairM = mat(0x3b2518, { r: 0.92 });
    var ink = mat(0x2a1c14, { r: 0.55 });

    /* 靴子：鞋底、鞋面、靴筒，站得住才像在干活 */
    [-0.12, 0.12].forEach(function (x) {
      var sole = new THREE.Mesh(new THREE.SphereGeometry(0.098, 18, 12), mat(0x241812, { r: 0.82 }));
      sole.scale.set(1.02, 0.24, 1.42);
      sole.position.set(x, 0.026, 0.035);
      char.add(sole);
      var upper = new THREE.Mesh(new THREE.SphereGeometry(0.098, 18, 14), boot);
      upper.scale.set(1, 0.84, 1.3);
      upper.position.set(x, 0.078, 0.032);
      char.add(upper);
      var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.09, 0.1, 14), boot);
      shaft.position.set(x, 0.145, -0.012);
      char.add(shaft);
    });

    /* 腿：膝盖处补一颗球，免得圆柱接缝露出来 */
    [-0.12, 0.12].forEach(function (x) {
      var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.07, 0.42, 14), pants);
      leg.position.set(x, 0.39, -0.005);
      char.add(leg);
      var knee = new THREE.Mesh(new THREE.SphereGeometry(0.079, 14, 12), pants);
      knee.position.set(x, 0.585, 0);
      char.add(knee);
    });

    var hips = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.25), pants);
    hips.position.y = 0.665;
    char.add(hips);

    /* 躯干：上窄下宽的毛衣，再加一点胸廓，别像根管子 */
    var torso = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.275, 0.5, 22), shirt);
    torso.scale.z = 0.82;
    torso.position.y = 0.98;
    char.add(torso);

    var chest = new THREE.Mesh(new THREE.SphereGeometry(0.24, 22, 14), shirt);
    chest.scale.set(1, 0.6, 0.8);
    chest.position.y = 1.13;
    char.add(chest);

    [-0.225, 0.225].forEach(function (x) {
      var sh = new THREE.Mesh(new THREE.SphereGeometry(0.092, 16, 12), shirt);
      sh.scale.set(1, 0.86, 0.9);
      sh.position.set(x, 1.165, 0);
      char.add(sh);
    });

    /* 围裙：胸兜 + 裙摆 + 腰带 + 口袋里插支笔 */
    var bib = new THREE.Mesh(new THREE.CylinderGeometry(0.252, 0.27, 0.36, 26, 1, true, -0.78, 1.56), apron);
    bib.position.set(0, 0.98, 0.008);
    bib.scale.z = 0.84;
    char.add(bib);
    var skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.272, 0.302, 0.24, 26, 1, true, -0.86, 1.72), apron);
    skirt.position.set(0, 0.72, 0.008);
    skirt.scale.z = 0.84;
    char.add(skirt);
    var belt = new THREE.Mesh(new THREE.CylinderGeometry(0.279, 0.279, 0.06, 26, 1, true, -0.92, 1.84), mat(0x53311c, { r: 0.85 }));
    belt.position.set(0, 0.805, 0.008);
    belt.scale.z = 0.84;
    char.add(belt);
    var pocket = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.095, 0.018), mat(0x58351f, { r: 0.88 }));
    pocket.position.set(0, 0.735, 0.232);
    char.add(pocket);
    var pen = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8), mat(0xd9a24e, { r: 0.5, m: 0.4 }));
    pen.position.set(0.042, 0.79, 0.24);
    pen.rotation.z = 0.22;
    char.add(pen);

    var collar = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.018, 8, 20), shirtDark);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.265;
    char.add(collar);

    /* 围裙的挂脖带 */
    [-1, 1].forEach(function (side) {
      var strap = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.26, 0.02), apron);
      strap.position.set(side * 0.06, 1.22, 0.15);
      strap.rotation.set(-0.92, 0, side * -0.06);
      char.add(strap);
    });

    /* 手臂：袖子到肘，卷边下面是露出来的小臂 */
    function makeArm(side) {
      var g = new THREE.Group();
      g.position.set(side * 0.275, 1.2, 0);

      var upper = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.06, 0.26, 14), shirt);
      upper.position.y = -0.13;
      g.add(upper);

      var cuff = new THREE.Mesh(new THREE.TorusGeometry(0.061, 0.019, 8, 18), shirtDark);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.262;
      g.add(cuff);

      var fore = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.046, 0.2, 14), skin);
      fore.position.y = -0.37;
      g.add(fore);

      var hand = new THREE.Mesh(new THREE.SphereGeometry(0.062, 16, 12), skin);
      hand.scale.set(1, 1.12, 0.82);
      hand.position.y = -0.485;
      g.add(hand);

      var thumb = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), skin);
      thumb.position.set(side * -0.045, -0.465, 0.032);
      g.add(thumb);

      g.rotation.z = side * 0.09;
      char.add(g);
      return g;
    }
    makeArm(-1);
    armR = makeArm(1);
    armR.rotation.x = -0.5;
    armR.rotation.z = -0.1;
    char.userData.armL = char.children[char.children.length - 2];
    /* 记住手臂的静止角度：点击动作全部相对它做插值，回位才不会跑偏 */
    char.userData.armL.userData.baseZ = char.userData.armL.rotation.z;
    char.userData.armRBaseX = armR.rotation.x;

    /* 手里的酒杯 */
    glassInHand = new THREE.Group();
    var cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.078, 0.055, 0.16, 18, 1, true),
      new THREE.MeshPhysicalMaterial({ color: 0xf6cd85, transparent: true, opacity: 0.42, roughness: 0.06, side: THREE.DoubleSide })
    );
    cup.position.y = 0.075;
    glassInHand.add(cup);
    var beer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.064, 0.046, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0xc97a22, emissive: 0x5a2c08, emissiveIntensity: 0.55, roughness: 0.4 })
    );
    beer.position.y = 0.048;
    glassInHand.add(beer);
    var foam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.079, 0.074, 0.024, 16),
      new THREE.MeshStandardMaterial({ color: 0xf7efdd, roughness: 0.95 })
    );
    foam.position.y = 0.157;
    glassInHand.add(foam);
    var handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.052, 0.011, 6, 18, Math.PI * 1.3),
      new THREE.MeshStandardMaterial({ color: 0xe8e2ce, roughness: 0.5 })
    );
    handle.position.set(0.085, 0.08, 0);
    handle.rotation.z = -0.4;
    glassInHand.add(handle);
    glassInHand.position.set(0.02, -0.5, 0.1);
    glassInHand.rotation.x = 0.5;
    armR.add(glassInHand);

    /* 脖子 */
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.09, 0.12, 14), skin);
    neck.position.y = 1.28;
    char.add(neck);

    head = new THREE.Group();
    head.position.y = 1.47;
    char.add(head);

    var skull = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 24), skin);
    skull.scale.set(1, 1.02, 0.97);
    head.add(skull);

    [-0.247, 0.247].forEach(function (x) {
      var ear = new THREE.Mesh(new THREE.SphereGeometry(0.046, 14, 10), skin);
      ear.scale.set(0.65, 1, 0.6);
      ear.position.set(x, -0.005, 0.01);
      head.add(ear);
    });

    /* 头发：一个不那么像头盔的罩子 + 三缕刘海 + 后脑的发髻 */
    var crown = new THREE.Mesh(new THREE.SphereGeometry(0.257, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.52), hairM);
    crown.position.y = 0.022;
    head.add(crown);

    var backHair = new THREE.Mesh(new THREE.SphereGeometry(0.235, 24, 18), hairM);
    backHair.scale.set(1.02, 0.94, 0.85);
    backHair.position.set(0, 0.015, -0.055);
    head.add(backHair);

    /* 偏分：一大一小两缕，压在额头上，别做成齐刘海 */
    var sweepA = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 10), hairM);
    sweepA.scale.set(1.5, 0.42, 0.8);
    sweepA.position.set(-0.035, 0.152, 0.175);
    sweepA.rotation.set(0.12, 0, 0.16);
    head.add(sweepA);
    var sweepB = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 10), hairM);
    sweepB.scale.set(1.25, 0.38, 0.78);
    sweepB.position.set(0.115, 0.145, 0.16);
    sweepB.rotation.set(0.1, 0, -0.3);
    head.add(sweepB);

    var bun = new THREE.Mesh(new THREE.SphereGeometry(0.088, 16, 12), hairM);
    bun.scale.set(1, 0.92, 0.86);
    bun.position.set(0, 0.115, -0.245);
    head.add(bun);
    var tie = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.012, 6, 16), mat(0x8c5a3a, { r: 0.8 }));
    tie.rotation.y = Math.PI / 2;
    tie.position.set(0, 0.095, -0.21);
    head.add(tie);

    [-1, 1].forEach(function (side) {
      var burn = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.085, 0.05), hairM);
      burn.position.set(side * 0.226, -0.015, 0.035);
      head.add(burn);
      /* 鬓角碎发：把发际线的直角揉开 */
      var wisp = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), hairM);
      wisp.scale.set(0.7, 0.55, 0.85);
      wisp.position.set(side * 0.185, 0.075, 0.135);
      wisp.rotation.z = side * -0.3;
      head.add(wisp);
    });

    /* 眼睛：眼白 + 虹膜 + 高光，各自成组，眨眼才压得住 */
    var white = new THREE.MeshBasicMaterial({ color: 0xf6efe3 });
    eyeSet.normal = new THREE.Group();
    eyeSet.eyes = [];
    [-0.08, 0.08].forEach(function (x) {
      var e = new THREE.Group();
      e.position.set(x, 0.016, 0.2);
      var sclera = new THREE.Mesh(new THREE.SphereGeometry(0.045, 18, 14), white);
      sclera.scale.set(1, 1.04, 0.66);
      sclera.position.z = 0.012;
      e.add(sclera);
      var iris = new THREE.Mesh(new THREE.SphereGeometry(0.024, 14, 12), ink);
      iris.scale.set(1, 1, 0.55);
      iris.position.z = 0.045;
      e.add(iris);
      var hi = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 8, 8), white);
      hi.position.set(-0.009, 0.012, 0.056);
      e.add(hi);
      eyeSet.normal.add(e);
      eyeSet.eyes.push(e);
    });
    head.add(eyeSet.normal);

    eyeSet.x = new THREE.Group();
    [-0.08, 0.08].forEach(function (x) {
      [0.7, -0.7].forEach(function (rot) {
        var bar = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.011, 0.011), ink);
        bar.position.set(x, 0.014, 0.238);
        bar.rotation.z = rot;
        eyeSet.x.add(bar);
      });
    });
    eyeSet.x.visible = false;
    head.add(eyeSet.x);

    browSet.bad = new THREE.Group();
    [-0.088, 0.088].forEach(function (x, i) {
      var b = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.014, 0.012), ink);
      b.position.set(x, 0.092, 0.226);
      b.rotation.z = i ? 0.3 : -0.3;
      browSet.bad.add(b);
    });
    browSet.bad.visible = false;
    head.add(browSet.bad);

    browSet.flat = new THREE.Group();
    [-0.088, 0.088].forEach(function (x, i) {
      var b = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.012, 0.012), ink);
      b.position.set(x, 0.09, 0.226);
      b.rotation.z = i ? -0.06 : 0.06;
      browSet.flat.add(b);
    });
    head.add(browSet.flat);

    var blushMat = new THREE.MeshBasicMaterial({ color: 0xd98a6a, transparent: true, opacity: 0.22 });
    [-0.145, 0.145].forEach(function (x) {
      var c = new THREE.Mesh(new THREE.CircleGeometry(0.04, 18), blushMat);
      c.position.set(x, -0.06, 0.212);
      c.rotation.y = x > 0 ? -0.42 : 0.42;
      head.add(c);
    });

    function mouthMesh(kind) {
      var m;
      if (kind === "frown") {
        m = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.011, 8, 20, Math.PI), ink);
        m.rotation.z = Math.PI;
      } else if (kind === "flat") {
        m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.011, 0.011), ink);
      } else if (kind === "smile") {
        m = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.011, 8, 20, Math.PI), ink);
      } else {
        m = new THREE.Group();
        var o = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), new THREE.MeshStandardMaterial({ color: 0x3a1d18, roughness: 0.7 }));
        o.scale.set(1.35, 0.78, 0.4);
        m.add(o);
        var t = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), new THREE.MeshStandardMaterial({ color: 0xc96a5f, roughness: 0.7 }));
        t.scale.set(1.1, 0.6, 0.4);
        t.position.set(0, -0.024, 0.018);
        m.add(t);
        var teeth = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.008), new THREE.MeshStandardMaterial({ color: 0xf4ecdd, roughness: 0.6 }));
        teeth.position.set(0, 0.024, 0.02);
        m.add(teeth);
      }
      m.position.set(0, -0.098, 0.226);
      m.visible = false;
      head.add(m);
      return m;
    }
    mouthSet.bad = mouthMesh("frown");
    mouthSet.flat = mouthMesh("flat");
    mouthSet.smile = mouthMesh("smile");
    mouthSet.open = mouthMesh("open");

    var nose = new THREE.Mesh(new THREE.SphereGeometry(0.028, 14, 10), skin);
    nose.scale.set(1, 0.9, 0.85);
    nose.position.set(0, -0.032, 0.238);
    head.add(nose);

    /* 上唇那点泡沫：两片错开才像「沾上去」，单片会读成贴纸。
       挂在一个 Group 上，外部只用 foamLip.visible 开关，两片一起走。 */
    var noseBottom = -0.032 - 0.028 * 0.9;   /* 鼻底，泡沫上缘不能越过它 */
    head.userData.noseBottom = noseBottom;
    var foamMat = new THREE.MeshStandardMaterial({ color: 0xf7efdd, roughness: 0.95 });
    foamLip = new THREE.Group();
    var foamA = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), foamMat);
    foamA.scale.set(0.042, 0.014, 0.014);
    foamA.position.set(-0.038, -0.080, 0.2345);   /* 上缘 -0.066，低于鼻底 */
    foamLip.add(foamA);
    var foamB = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), foamMat);
    foamB.scale.set(0.030, 0.011, 0.012);
    foamB.position.set(0.044, -0.072, 0.2360);    /* 上缘 -0.061，低于鼻底 */
    foamLip.add(foamB);
    foamLip.visible = false;
    head.add(foamLip);

    char.userData.head = head;
    char.userData.arm = armR;
    /* 可点部位只留头与胸：髋会被垫台前沿和瓶身切掉半截，手臂附近要留出来起手转视角 */
    [skull, chest].forEach(function (m) {
      m.userData.char = char;
      charPick.push(m);
    });
    char.add(makeBlobShadow(0.32, 0.42));
    scene.add(char);
  }

  /* ---------------- 货架上的原料 ----------------
     每样原料都做成名字对应的实物：香蕉是弯的，面包有皮，酒花是个球果。
     全部用单位几何体缩放拼装、材质按颜色缓存；24 件约 150 个网格，
     换来一眼能认出架子上摆的是什么。 */
  var GEO = null;
  var MATS = {};

  function initGeo() {
    if (GEO) return;
    GEO = {
      sph: new THREE.SphereGeometry(1, 18, 14),
      box: new THREE.BoxGeometry(1, 1, 1),
      cyl: new THREE.CylinderGeometry(1, 1, 1, 18),
      cup: new THREE.CylinderGeometry(1, 0.76, 1, 18),
      taper: new THREE.CylinderGeometry(0.78, 1, 1, 18),
      shoulder: new THREE.CylinderGeometry(0.45, 1, 1, 18),
      cone: new THREE.ConeGeometry(1, 1, 14),
      hemi: new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      torus: new THREE.TorusGeometry(1, 0.32, 8, 20),
      arc: new THREE.TorusGeometry(1, 0.3, 8, 18, 2.2),
      wedge: new THREE.CylinderGeometry(1, 1, 1, 14, 1, false, 0, 1.05),
      plane: new THREE.PlaneGeometry(1, 1),
      /* 瓶盖落地的那圈脉冲：单位半径 + 细管，靠 scale 决定大小 */
      capPulse: new THREE.TorusGeometry(1, 0.06, 6, 18),
    };
  }

  function mat(color, o) {
    o = o || {};
    var rough = o.r == null ? 0.66 : o.r;
    var metal = o.m || 0;
    var emis = o.e || 0;
    var op = o.t ? (o.op == null ? 1 : o.op) : 0;
    var key = color + "|" + rough + "|" + metal + "|" + emis + "|" + op + "|" + (o.flat ? 1 : 0);
    if (MATS[key]) return MATS[key];
    var mt = new THREE.MeshStandardMaterial({
      color: color,
      roughness: rough,
      metalness: metal,
      emissive: emis ? color : 0x000000,
      emissiveIntensity: emis,
      transparent: !!o.t,
      opacity: o.t ? (o.op == null ? 1 : o.op) : 1,
      flatShading: !!o.flat,
      side: o.back ? THREE.DoubleSide : THREE.FrontSide,
    });
    MATS[key] = mt;
    return mt;
  }

  function G() { return new THREE.Group(); }

  function add(parent, key, color, x, y, z, o) {
    o = o || {};
    var m = new THREE.Mesh(GEO[key], mat(color, o));
    m.position.set(x || 0, y || 0, z || 0);
    m.scale.set(o.sx == null ? 1 : o.sx, o.sy == null ? 1 : o.sy, o.sz == null ? 1 : o.sz);
    m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
    parent.add(m);
    return m;
  }

  /* --- 瓶子与罐子 --- */
  function pBottle(s) {
    var g = G(), h = s.h || 0.42, r = s.r || 0.09;
    add(g, "cyl", s.c, 0, h * 0.36, 0, { sx: r, sy: h * 0.72, sz: r, r: s.rough || 0.34, m: 0.06 });
    add(g, "shoulder", s.c, 0, h * 0.78, 0, { sx: r, sy: h * 0.12, sz: r, r: s.rough || 0.34 });
    add(g, "cyl", s.c, 0, h * 0.9, 0, { sx: r * 0.45, sy: h * 0.12, sz: r * 0.45, r: s.rough || 0.34 });
    add(g, "cyl", s.cap || 0x2b2b28, 0, h * 0.99, 0, { sx: r * 0.47, sy: h * 0.07, sz: r * 0.47, r: 0.42, m: 0.35 });
    if (s.label) add(g, "cyl", s.label, 0, h * 0.34, 0, { sx: r * 1.03, sy: h * 0.22, sz: r * 1.03, r: 0.9 });
    return g;
  }

  function pJar(s) {
    var g = G(), r = s.r || 0.1;
    add(g, "cyl", s.c, 0, 0.105, 0, { sx: r, sy: 0.21, sz: r, r: 0.4, m: 0.05 });
    if (s.label !== null) add(g, "cyl", s.label || 0xe9e2ce, 0, 0.108, 0, { sx: r * 1.015, sy: 0.08, sz: r * 1.015, r: 0.9 });
    add(g, "cyl", s.cap || 0x2e2a24, 0, 0.232, 0, { sx: r * 1.02, sy: 0.046, sz: r * 1.02, r: 0.4, m: 0.45 });
    if (s.dip) add(g, "cyl", 0x9a7a46, r * 0.55, 0.29, 0.01, { sx: 0.008, sy: 0.2, sz: 0.008, rz: 0.3, r: 0.8 });
    return g;
  }

  function pCan(s) {
    var g = G();
    add(g, "box", s.c, 0, 0.125, 0, { sx: 0.19, sy: 0.25, sz: 0.125, r: 0.5, m: 0.4 });
    add(g, "cyl", s.c, 0, 0.25, 0.04, { sx: 0.028, sy: 0.03, sz: 0.028, r: 0.4, m: 0.7 });
    add(g, "torus", 0x9aa4a6, 0, 0.27, -0.02, { sx: 0.045, sy: 0.045, sz: 0.045, rx: Math.PI / 2, r: 0.35, m: 0.7 });
    add(g, "box", 0x1c2426, 0, 0.115, 0.064, { sx: 0.09, sy: 0.08, sz: 0.01, r: 0.8 });
    add(g, "box", 0xd8d2bc, 0, 0.115, 0.07, { sx: 0.06, sy: 0.012, sz: 0.004, r: 0.9 });
    return g;
  }

  function pFlask(s) {
    var g = G();
    add(g, "cyl", s.c, 0, 0.11, 0, { sx: 0.082, sy: 0.22, sz: 0.042, r: 0.3, m: 0.8 });
    add(g, "cyl", s.c, 0, 0.228, 0, { sx: 0.028, sy: 0.036, sz: 0.028, r: 0.3, m: 0.8 });
    add(g, "cyl", 0x2b2f30, 0, 0.25, 0, { sx: 0.03, sy: 0.026, sz: 0.03, r: 0.5 });
    add(g, "box", 0x6b5230, 0, 0.1, 0.046, { sx: 0.13, sy: 0.12, sz: 0.006, r: 0.8 });
    return g;
  }

  /* --- 果实与花草 --- */
  function pApple(s) {
    var g = G(), r = s.r || 0.15;
    add(g, "sph", s.c, 0, r * 0.95, 0, { sx: r * 1.02, sy: r * 0.95, sz: r * 1.02, r: 0.5 });
    add(g, "cyl", 0x53351b, 0, r * 1.95, 0, { sx: 0.011, sy: 0.08, sz: 0.011, rx: 0.12, r: 0.9 });
    add(g, "sph", 0x4e7c36, 0.05, r * 2.02, 0.012, { sx: 0.058, sy: 0.013, sz: 0.036, rz: -0.45, ry: 0.5, r: 0.8 });
    return g;
  }

  function pPear(s) {
    var g = G(), r = 0.105;
    add(g, "sph", s.c, 0, r * 0.95, 0, { sx: r, sy: r * 0.95, sz: r, r: 0.5 });
    add(g, "sph", s.c, 0, r * 2.0, 0, { sx: r * 0.66, sy: r * 0.8, sz: r * 0.66, r: 0.5 });
    add(g, "cyl", 0x54381c, 0, r * 2.95, 0, { sx: 0.01, sy: 0.07, sz: 0.01, rx: 0.16, r: 0.9 });
    add(g, "sph", 0x4e7c36, 0.045, r * 2.9, 0.01, { sx: 0.048, sy: 0.012, sz: 0.03, rz: -0.4, r: 0.8 });
    return g;
  }

  function pPeach(s) {
    var g = G(), r = s.r || 0.145;
    add(g, "sph", s.c, 0, r * 1.0, 0, { sx: r * 1.02, sy: r * 0.96, sz: r * 1.0, r: 0.55 });
    /* 桃子的中缝 */
    add(g, "box", 0xa85a44, 0, r * 1.0, r * 0.96, { sx: 0.006, sy: r * 1.4, sz: 0.006, r: 0.9 });
    add(g, "sph", 0x8d4a3a, 0.02, r * 1.92, 0.02, { sx: 0.028, sy: 0.026, sz: 0.026, r: 0.8 });
    add(g, "sph", 0x4e7c36, -0.05, r * 1.95, 0.02, { sx: 0.058, sy: 0.012, sz: 0.034, rz: 0.55, r: 0.8 });
    return g;
  }

  function pMango(s) {
    var g = G();
    add(g, "sph", s.c, 0, 0.145, 0, { sx: 0.16, sy: 0.11, sz: 0.1, rz: 0.26, ry: 0.5, r: 0.5 });
    add(g, "cyl", 0x53351b, 0.125, 0.235, 0.02, { sx: 0.009, sy: 0.05, sz: 0.009, rz: -0.55, r: 0.9 });
    return g;
  }

  function pCitrus(s) {
    var g = G();
    add(g, "sph", s.c, 0, 0.132, 0, { sx: 0.138, sy: 0.132, sz: 0.138, r: 0.55 });
    add(g, "sph", 0x9c6122, 0, 0.258, 0, { sx: 0.028, sy: 0.014, sz: 0.028, r: 0.9 });
    add(g, "cone", s.c2 || 0xf2b64a, 0.135, 0.175, 0.03, { sx: 0.03, sy: 0.2, sz: 0.03, rz: 1.15, rx: 0.3, r: 0.55 });
    return g;
  }

  function pPeel(s) {
    var g = G();
    for (var i = 0; i < 4; i++) {
      add(g, "torus", s.c, Math.sin(i * 1.5) * 0.028, 0.05 + i * 0.052, Math.cos(i * 1.5) * 0.028,
        { sx: 0.125 - i * 0.02, sy: 0.125 - i * 0.02, sz: 0.125 - i * 0.02, rx: Math.PI / 2, ry: i * 0.9, rz: i * 0.28, r: 0.45 });
    }
    add(g, "sph", 0x4e7c36, 0, 0.008, 0, { sx: 0.085, sy: 0.01, sz: 0.085, r: 0.9 });
    return g;
  }

  function pBanana(s) {
    var g = G();
    add(g, "arc", s.c, 0, 0.212, 0, { sx: 0.168, sy: 0.168, sz: 0.168, rz: 3.61, r: 0.5 });
    add(g, "sph", 0x6b5322, -0.15, 0.14, 0, { sx: 0.02, sy: 0.021, sz: 0.028, r: 0.8 });
    add(g, "sph", 0x6b5322, 0.15, 0.14, 0, { sx: 0.02, sy: 0.021, sz: 0.028, r: 0.8 });
    return g;
  }

  function pCherry(s) {
    var g = G();
    [-0.055, 0.06].forEach(function (x, i) {
      add(g, "sph", s.c, x, 0.072, i ? 0.02 : -0.01, { sx: 0.07, sy: 0.066, sz: 0.07, r: 0.32 });
      add(g, "cyl", 0x4d6b2e, x * 0.5, 0.185, i ? 0.012 : -0.006, { sx: 0.006, sy: 0.16, sz: 0.006, rz: x * 2.4, rx: i ? -0.22 : 0.18, r: 0.9 });
    });
    add(g, "sph", 0x4e7c36, 0.02, 0.27, 0, { sx: 0.052, sy: 0.012, sz: 0.03, rz: 0.2, r: 0.8 });
    return g;
  }

  function pGrape(s) {
    var g = G();
    var pts = [[0, 0.085, 0], [-0.088, 0.135, 0.035], [0.082, 0.14, 0.024], [0.012, 0.135, -0.088], [-0.024, 0.21, 0.058],
      [0.052, 0.215, -0.035], [-0.07, 0.225, -0.035], [0.012, 0.29, 0.012]];
    pts.forEach(function (p, i) {
      add(g, "sph", s.c, p[0], p[1], p[2], { sx: 0.06, sy: 0.058, sz: 0.06, r: 0.42, flat: i % 3 === 0 });
    });
    add(g, "cyl", 0x5c4a2a, 0, 0.29, 0, { sx: 0.007, sy: 0.07, sz: 0.007, r: 0.9 });
    add(g, "sph", 0x4e7c36, 0.055, 0.31, 0.01, { sx: 0.05, sy: 0.012, sz: 0.03, rz: -0.5, r: 0.8 });
    return g;
  }

  function pPineapple(s) {
    var g = G();
    add(g, "taper", s.c, 0, 0.16, 0, { sx: 0.112, sy: 0.3, sz: 0.112, r: 0.6, flat: true });
    [0.08, 0.16, 0.24].forEach(function (y, i) {
      add(g, "torus", s.c2 || 0xa87c24, 0, y, 0, { sx: 0.113 - i * 0.004, sy: 0.113 - i * 0.004, sz: 0.113 - i * 0.004, rx: Math.PI / 2, r: 0.5 });
    });
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * Math.PI * 2;
      add(g, "cone", 0x4d7a34, Math.sin(a) * 0.032, 0.37, Math.cos(a) * 0.032,
        { sx: 0.02, sy: 0.12, sz: 0.038, rx: Math.cos(a) * 0.45, rz: -Math.sin(a) * 0.45, r: 0.85 });
    }
    return g;
  }

  function pCandy(s) {
    var g = G();
    add(g, "cyl", s.c, 0, 0.1, 0, { sx: 0.06, sy: 0.1, sz: 0.06, rz: Math.PI / 2, r: 0.35 });
    add(g, "cone", s.c2 || 0xf7e2ea, -0.078, 0.1, 0, { sx: 0.06, sy: 0.072, sz: 0.06, rz: Math.PI / 2, r: 0.6 });
    add(g, "cone", s.c2 || 0xf7e2ea, 0.078, 0.1, 0, { sx: 0.06, sy: 0.072, sz: 0.06, rz: -Math.PI / 2, r: 0.6 });
    add(g, "cyl", 0xf4f1e6, 0, 0.1, 0, { sx: 0.063, sy: 0.012, sz: 0.063, rz: Math.PI / 2, r: 0.8 });
    return g;
  }

  function pBlossom(s) {
    var g = G(), r = s.r || 0.072;
    add(g, "cyl", 0x4a6f33, 0, 0.09, 0, { sx: 0.008, sy: 0.18, sz: 0.008, r: 0.9 });
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * Math.PI * 2;
      add(g, "sph", s.c, Math.sin(a) * r * 0.74, 0.205, Math.cos(a) * r * 0.74, { sx: r * 0.62, sy: r * 0.26, sz: r * 0.42, ry: a, r: 0.6 });
    }
    add(g, "cone", 0x4f7a35, 0, 0.19, 0, { sx: r * 0.9, sy: 0.06, sz: r * 0.9, rx: Math.PI, r: 0.85 });
    add(g, "sph", s.c2 || 0xe8c25c, 0, 0.218, 0, { sx: r * 0.34, sy: r * 0.2, sz: r * 0.34, r: 0.65 });
    add(g, "sph", 0x4f7a35, 0.045, 0.055, 0.01, { sx: 0.046, sy: 0.011, sz: 0.026, rz: -0.5, r: 0.8 });
    return g;
  }

  function pRose(s) {
    var g = G();
    add(g, "cyl", 0x456b31, 0, 0.085, 0, { sx: 0.011, sy: 0.17, sz: 0.011, r: 0.9 });
    add(g, "cone", 0x4f7a35, 0, 0.168, 0, { sx: 0.032, sy: 0.05, sz: 0.032, rx: Math.PI, r: 0.85 });
    for (var i = 0; i < 7; i++) {
      var a = (i / 7) * Math.PI * 2;
      add(g, "sph", s.c, Math.sin(a) * 0.036, 0.196, Math.cos(a) * 0.036, { sx: 0.042, sy: 0.04, sz: 0.042, ry: a, r: 0.5 });
    }
    for (i = 0; i < 5; i++) {
      var b = (i / 5) * Math.PI * 2 + 0.4;
      add(g, "sph", s.c2 || 0xc45f78, Math.sin(b) * 0.022, 0.232, Math.cos(b) * 0.022, { sx: 0.03, sy: 0.034, sz: 0.03, r: 0.5 });
    }
    add(g, "sph", 0xa8455e, 0, 0.252, 0, { sx: 0.022, sy: 0.02, sz: 0.022, r: 0.5 });
    return g;
  }

  function pUmbel(s) {
    var g = G();
    add(g, "cyl", 0x4a6f33, 0, 0.1, 0, { sx: 0.007, sy: 0.2, sz: 0.007, r: 0.9 });
    for (var i = 0; i < 7; i++) {
      var a = (i / 7) * Math.PI * 2;
      add(g, "cyl", 0x6e8a4a, Math.sin(a) * 0.03, 0.235, Math.cos(a) * 0.03,
        { sx: 0.004, sy: 0.06, sz: 0.004, rz: -Math.sin(a) * 0.7, rx: Math.cos(a) * 0.7, r: 0.9 });
      add(g, "sph", s.c, Math.sin(a) * 0.06, 0.268, Math.cos(a) * 0.06, { sx: 0.021, sy: 0.017, sz: 0.021, r: 0.7 });
    }
    add(g, "sph", s.c, 0, 0.276, 0, { sx: 0.024, sy: 0.019, sz: 0.024, r: 0.7 });
    return g;
  }

  function pSprig(s) {
    var g = G();
    add(g, "cyl", 0x5d7a4a, 0, 0.13, 0, { sx: 0.006, sy: 0.26, sz: 0.006, r: 0.9 });
    for (var i = 0; i < 9; i++) {
      add(g, "sph", s.c, Math.sin(i * 1.9) * 0.02, 0.165 + i * 0.019, Math.cos(i * 1.9) * 0.02, { sx: 0.026, sy: 0.023, sz: 0.026, r: 0.7 });
    }
    [-0.03, 0.03].forEach(function (x, i) {
      add(g, "sph", 0x5d7a4a, x, 0.07, 0, { sx: 0.05, sy: 0.01, sz: 0.018, rz: i ? -0.6 : 0.6, r: 0.8 });
    });
    return g;
  }

  function pBlades(s) {
    var g = G();
    for (var i = 0; i < 7; i++) {
      var a = -0.5 + i * 0.166;
      add(g, "box", i % 2 ? s.c2 || 0xcfd06a : s.c, Math.sin(a) * 0.03, 0.2, Math.cos(a) * 0.03,
        { sx: 0.015, sy: 0.36, sz: 0.011, rz: a, rx: -0.16 + i * 0.05, r: 0.85 });
    }
    add(g, "cyl", 0x9c9450, 0, 0.055, 0, { sx: 0.028, sy: 0.05, sz: 0.028, r: 0.9 });
    return g;
  }

  function pPine(s) {
    var g = G();
    add(g, "cyl", 0x6b4a2c, 0, 0.15, 0, { sx: 0.011, sy: 0.3, sz: 0.011, rz: 0.06, r: 0.9 });
    for (var i = 0; i < 14; i++) {
      var y = 0.05 + i * 0.019, side = i % 2 ? 1 : -1;
      add(g, "box", i % 3 ? 0x3f6b3f : 0x4f7a4a, side * 0.048, y, 0, { sx: 0.11, sy: 0.007, sz: 0.007, rz: side * 0.5, r: 0.85 });
    }
    return g;
  }

  function pHop(s) {
    var g = G();
    add(g, "sph", s.c, 0, 0.2, 0, { sx: 0.082, sy: 0.15, sz: 0.082, r: 0.85, flat: true });
    for (var i = 0; i < 7; i++) {
      var a = i * 0.897;
      add(g, "sph", s.c2 || 0x8aa03a, Math.sin(a) * 0.05, 0.18 + (i % 3) * 0.045, Math.cos(a) * 0.05,
        { sx: 0.036, sy: 0.072, sz: 0.036, rx: Math.cos(a) * 0.24, rz: -Math.sin(a) * 0.3, r: 0.85, flat: true });
    }
    add(g, "cyl", 0x5c4a2a, 0, 0.365, 0, { sx: 0.006, sy: 0.07, sz: 0.006, rz: -0.2, r: 0.9 });
    add(g, "sph", 0x4e7c36, 0.06, 0.3, 0.02, { sx: 0.045, sy: 0.01, sz: 0.026, rz: -0.6, r: 0.8 });
    return g;
  }

  /* --- 谷物、乳品与加工物 --- */
  function pBread(s) {
    var g = G();
    add(g, "sph", s.c, 0, 0.085, 0, { sx: 0.155, sy: 0.088, sz: 0.1, r: 0.86, flat: true });
    [-0.07, 0, 0.07].forEach(function (x) {
      add(g, "box", s.c2 || 0xefd9a6, x, 0.158, 0, { sx: 0.012, sy: 0.01, sz: 0.13, rz: 0.55, rx: 0.12, r: 0.9 });
    });
    add(g, "sph", 0xc98a4a, 0, 0.02, 0, { sx: 0.15, sy: 0.014, sz: 0.095, r: 0.95 });
    return g;
  }

  function pCheese(s) {
    var g = G();
    add(g, "wedge", s.c, 0, 0.074, 0, { sx: 0.195, sy: 0.148, sz: 0.195, ry: -0.55, r: 0.7 });
    [[0.03, 0.095], [-0.045, 0.06], [0.005, 0.125]].forEach(function (p) {
      add(g, "sph", s.c2 || 0xd9a33c, p[0], 0.14, p[1], { sx: 0.021, sy: 0.021, sz: 0.021, r: 0.8 });
    });
    return g;
  }

  function pButter(s) {
    var g = G();
    add(g, "box", 0xe8e2d0, 0, 0.008, 0, { sx: 0.25, sy: 0.012, sz: 0.18, r: 0.95 });
    add(g, "box", s.c, 0, 0.074, 0, { sx: 0.21, sy: 0.128, sz: 0.145, r: 0.5 });
    add(g, "box", 0xf9efc0, 0, 0.14, 0, { sx: 0.215, sy: 0.012, sz: 0.15, r: 0.45 });
    return g;
  }

  function pMushroom(s) {
    var g = G();
    [[0, 0.13, 0.112], [0.085, 0.062, 0.072]].forEach(function (m) {
      add(g, "cyl", 0xe6dcc4, m[0], m[1] * 0.5, 0, { sx: 0.03, sy: m[1], sz: 0.03, r: 0.9 });
      add(g, "hemi", s.c, m[0], m[1], 0, { sx: m[2], sy: m[2] * 0.66, sz: m[2], r: 0.72 });
    });
    return g;
  }

  function pYogurt(s) {
    var g = G();
    add(g, "cup", s.c || 0xf2efe6, 0, 0.085, 0, { sx: 0.104, sy: 0.17, sz: 0.104, r: 0.62 });
    add(g, "cyl", 0xdfe9ea, 0, 0.176, 0, { sx: 0.111, sy: 0.02, sz: 0.111, r: 0.5 });
    add(g, "box", 0xd6dde0, 0.125, 0.018, 0.02, { sx: 0.145, sy: 0.007, sz: 0.026, rz: -0.32, r: 0.35, m: 0.4 });
    return g;
  }

  function pToffee(s) {
    var g = G();
    add(g, "box", s.c, 0, 0.062, 0, { sx: 0.185, sy: 0.124, sz: 0.12, r: 0.55 });
    add(g, "box", 0xf0d8a0, 0, 0.126, 0, { sx: 0.19, sy: 0.01, sz: 0.124, r: 0.5 });
    add(g, "box", s.c, 0.028, 0.16, 0.01, { sx: 0.13, sy: 0.062, sz: 0.095, ry: 0.3, rz: 0.08, r: 0.55 });
    return g;
  }

  function pAlmond(s) {
    var g = G();
    [[-0.06, 0.032, 0.02, 0.3], [0.05, 0.03, 0.05, -0.4], [0.0, 0.034, -0.06, 0.9], [0.10, 0.09, 0.0, 0.2]].forEach(function (p) {
      add(g, "sph", s.c, p[0], p[1] + 0.018, p[2], { sx: 0.042, sy: 0.03, sz: 0.08, ry: p[3], r: 0.8 });
    });
    return g;
  }

  function pNuts(s) {
    var g = G();
    var pts = [[-0.06, 0.04, 0.02], [0.02, 0.038, 0.05], [0.07, 0.038, -0.02], [-0.02, 0.038, -0.06],
      [0.0, 0.095, 0.0], [0.06, 0.092, 0.035], [-0.05, 0.09, -0.03]];
    pts.forEach(function (p, i) {
      add(g, "sph", i % 4 ? s.c : s.c2 || 0x8a5c30, p[0] * 1.18, p[1] * 1.15, p[2] * 1.18, { sx: 0.05, sy: 0.04, sz: 0.06, ry: i, r: 0.78, flat: i % 2 === 0 });
    });
    return g;
  }

  function pPepper(s) {
    var g = G();
    add(g, "cup", 0x2a3438, 0, 0.036, 0, { sx: 0.135, sy: 0.072, sz: 0.135, r: 0.45, m: 0.4 });
    for (var i = 0; i < 13; i++) {
      var a = i * 2.2, rr = 0.032 + (i % 5) * 0.013;
      add(g, "sph", s.c, Math.sin(a) * rr, 0.068 + (i % 3) * 0.013, Math.cos(a) * rr, { sx: 0.026, sy: 0.026, sz: 0.026, r: 0.85 });
    }
    return g;
  }

  function pClove(s) {
    var g = G();
    [[-0.06, 0.02, 0.3], [0.01, -0.05, -0.35], [0.075, 0.03, 0.85], [-0.015, 0.055, 1.35]].forEach(function (p) {
      var c = G();
      add(c, "cyl", s.c, 0, 0.05, 0, { sx: 0.02, sy: 0.1, sz: 0.02, r: 0.8 });
      add(c, "sph", s.c, 0, 0.106, 0, { sx: 0.045, sy: 0.038, sz: 0.045, r: 0.8 });
      c.position.set(p[0] * 1.5, 0.016, p[1] * 1.5);
      c.rotation.set(1.35, p[2], 0.2);
      g.add(c);
    });
    if (s.smoke) {
      [0.14, 0.2, 0.26].forEach(function (y, i) {
        add(g, "sph", 0x9aa8a6, Math.sin(i * 2) * 0.02, y, 0.02, { sx: 0.04 + i * 0.012, sy: 0.035, sz: 0.04, r: 0.9, t: true, op: 0.14 });
      });
    }
    return g;
  }

  function pCampfire(s) {
    var g = G();
    [0, 1.05, -1.05].forEach(function (ry, i) {
      add(g, "cyl", i ? 0x4a3320 : 0x5c4028, 0, 0.042 + i * 0.012, 0, { sx: 0.03, sy: 0.32, sz: 0.03, rz: Math.PI / 2, ry: ry, r: 0.9 });
    });
    add(g, "cone", 0xef7524, 0, 0.155, 0, { sx: 0.072, sy: 0.17, sz: 0.072, e: 0.9, r: 0.4 });
    add(g, "cone", 0xffc154, 0, 0.135, 0, { sx: 0.042, sy: 0.115, sz: 0.042, e: 1.5, r: 0.3 });
    for (var i = 0; i < 4; i++) {
      var a = i * 1.6;
      add(g, "sph", 0xff8a3a, Math.sin(a) * 0.1, 0.018, Math.cos(a) * 0.1, { sx: 0.015, sy: 0.013, sz: 0.015, e: 1.6, r: 0.3 });
    }
    return g;
  }

  function pCabbage(s) {
    var g = G();
    add(g, "sph", s.c, 0, 0.142, 0, { sx: 0.14, sy: 0.14, sz: 0.14, r: 0.85, flat: true });
    for (var i = 0; i < 5; i++) {
      var a = i * 1.3;
      add(g, "sph", s.c2 || 0x9fc07a, Math.sin(a) * 0.072, 0.085 + (i % 2) * 0.05, Math.cos(a) * 0.072,
        { sx: 0.098, sy: 0.082, sz: 0.055, ry: a, r: 0.85, flat: true });
    }
    add(g, "cyl", 0xd8e4c0, 0, 0.018, 0, { sx: 0.048, sy: 0.04, sz: 0.048, r: 0.9 });
    return g;
  }

  function pCorn(s) {
    var g = G();
    add(g, "cyl", s.c, 0, 0.2, 0, { sx: 0.062, sy: 0.34, sz: 0.062, r: 0.55, flat: true });
    for (var i = 0; i < 3; i++) {
      var a = i * 2.1;
      add(g, "cone", s.c2 || 0x9fb85e, Math.sin(a) * 0.062, 0.1, Math.cos(a) * 0.062,
        { sx: 0.042, sy: 0.19, sz: 0.016, rz: -Math.sin(a) * 0.3, rx: Math.cos(a) * 0.3, r: 0.85, back: true });
    }
    add(g, "sph", 0xe0d08a, 0, 0.38, 0, { sx: 0.02, sy: 0.035, sz: 0.02, r: 0.9 });
    return g;
  }

  function pLog(s) {
    var g = G(), r = s.r || 0.072;
    add(g, "cyl", s.c, 0, r, 0, { sx: r, sy: 0.32, sz: r, rz: Math.PI / 2, ry: 0.2, r: 0.88 });
    [-0.161, 0.161].forEach(function (x) {
      add(g, "cyl", s.c2 || 0xc9a06a, x, r, 0, { sx: r * 0.9, sy: 0.006, sz: r * 0.9, rz: Math.PI / 2, r: 0.7 });
    });
    if (s.moss) add(g, "sph", 0x4d6b34, 0.02, r * 1.8, 0, { sx: 0.06, sy: 0.018, sz: 0.048, r: 0.9 });
    if (s.ember) [-0.03, 0.05].forEach(function (x) {
      add(g, "sph", 0xe06a2a, x, r * 0.85, r * 0.7, { sx: 0.013, sy: 0.011, sz: 0.006, e: 1.4, r: 0.4 });
    });
    return g;
  }

  function pBlock(s) {
    var g = G();
    add(g, "box", s.c, 0, 0.072, 0, { sx: 0.29, sy: 0.144, sz: 0.13, r: 0.82 });
    [-0.045, 0.02, 0.08].forEach(function (y) {
      add(g, "box", s.c2 || 0x6f4a2e, 0.01, 0.072 + y, 0.066, { sx: 0.24, sy: 0.006, sz: 0.002, r: 0.9 });
    });
    return g;
  }

  function pChips(s) {
    var g = G();
    [[0, 0.014, 0, 0.3], [0.045, 0.03, 0.03, -0.5], [-0.055, 0.028, 0.025, 0.8],
      [0.01, 0.05, -0.03, 0.1], [-0.02, 0.072, 0.01, -0.9], [0.055, 0.078, -0.02, 0.4], [0.0, 0.1, 0.02, 1.2]].forEach(function (p, i) {
      add(g, "box", i % 3 ? s.c : s.c2 || 0x8a6a45, p[0], p[1], p[2], { sx: 0.16, sy: 0.012, sz: 0.066, ry: p[3], rz: p[1] * 1.4, r: 0.9 });
    });
    return g;
  }

  function pLeather(s) {
    var g = G();
    add(g, "box", s.c, 0, 0.028, 0, { sx: 0.25, sy: 0.052, sz: 0.19, r: 0.75 });
    add(g, "box", s.c2 || 0x7a4a2c, 0.03, 0.072, 0.01, { sx: 0.21, sy: 0.044, sz: 0.16, ry: 0.2, rz: 0.06, r: 0.75 });
    add(g, "box", 0x3a241a, 0, 0.055, 0.1, { sx: 0.23, sy: 0.005, sz: 0.005, r: 0.9 });
    return g;
  }

  function pCardboard(s) {
    var g = G();
    add(g, "box", s.c, 0, 0.1, 0, { sx: 0.26, sy: 0.2, sz: 0.23, r: 0.95 });
    add(g, "box", s.c2 || 0xc9a878, 0, 0.2, 0.035, { sx: 0.27, sy: 0.01, sz: 0.09, r: 0.95 });
    add(g, "box", 0xb59a72, 0, 0.1, 0.116, { sx: 0.045, sy: 0.21, sz: 0.004, r: 0.95 });
    return g;
  }

  function pMatch(s) {
    var g = G();
    [[-0.045, 0.3, 0.16], [0.03, 0.26, -0.15], [0.095, 0.19, 0.42]].forEach(function (p) {
      var m = G(), h = p[1];
      add(m, "cyl", 0xd9c9a6, 0, h * 0.5, 0, { sx: 0.007, sy: h, sz: 0.007, r: 0.9 });
      add(m, "sph", s.c, 0, h + 0.012, 0, { sx: 0.021, sy: 0.023, sz: 0.021, r: 0.55 });
      m.position.set(p[0], 0, 0.01);
      m.rotation.z = -p[2];
      g.add(m);
    });
    add(g, "box", 0xb8452e, 0.015, 0.008, -0.07, { sx: 0.13, sy: 0.014, sz: 0.085, r: 0.85 });
    return g;
  }

  function pBolt(s) {
    var g = G();
    add(g, "cyl", s.c, 0, 0.062, 0, { sx: 0.075, sy: 0.07, sz: 0.075, r: 0.85, m: 0.45, flat: true });
    add(g, "cyl", s.c, 0, 0.066, 0.12, { sx: 0.03, sy: 0.24, sz: 0.03, rx: Math.PI / 2, r: 0.85, m: 0.45 });
    add(g, "cyl", s.c, 0, 0.066, 0.2, { sx: 0.058, sy: 0.042, sz: 0.058, rx: Math.PI / 2, r: 0.85, m: 0.45, flat: true });
    return g;
  }

  function pRoot(s) {
    var g = G();
    add(g, "sph", s.c, 0, 0.052, 0, { sx: 0.155, sy: 0.052, sz: 0.088, r: 0.92, flat: true });
    add(g, "sph", s.c, 0.085, 0.058, 0.018, { sx: 0.055, sy: 0.048, sz: 0.055, r: 0.92, flat: true });
    add(g, "cyl", 0x4a6b34, 0.015, 0.155, 0, { sx: 0.007, sy: 0.13, sz: 0.007, rz: 0.2, r: 0.9 });
    add(g, "sph", s.c2 || 0x9a7fc0, 0.005, 0.235, 0, { sx: 0.036, sy: 0.024, sz: 0.036, r: 0.6 });
    return g;
  }

  /* 造型表：id → 用哪套形状、什么颜色 */
  var SHAPES = {
    bottle: pBottle, jar: pJar, can: pCan, flask: pFlask,
    apple: pApple, pear: pPear, peach: pPeach, mango: pMango, citrus: pCitrus, peel: pPeel,
    banana: pBanana, cherry: pCherry, grape: pGrape, pineapple: pPineapple, candy: pCandy,
    blossom: pBlossom, rose: pRose, umbel: pUmbel, sprig: pSprig, blades: pBlades, pine: pPine, hop: pHop,
    bread: pBread, cheese: pCheese, butter: pButter, mushroom: pMushroom, yogurt: pYogurt,
    toffee: pToffee, almond: pAlmond, nuts: pNuts, pepper: pPepper, clove: pClove, cabbage: pCabbage,
    corn: pCorn, log: pLog, block: pBlock, chips: pChips, leather: pLeather, cardboard: pCardboard,
    match: pMatch, bolt: pBolt, root: pRoot, fire: pCampfire,
  };

  var PROP = {
    ethanol: { s: "bottle", c: 0xc2a057, cap: 0x3a3024, label: 0xefe4c4, h: 0.44, r: 0.088 },
    ethyl_acetate: { s: "apple", c: 0xb23a2e, r: 0.152 },
    isoamyl_acetate: { s: "banana", c: 0xe8c93f },
    isobutyl_acetate: { s: "cherry", c: 0x9e1f2e },
    ethyl_hexanoate: { s: "pineapple", c: 0xd8a02c, c2: 0xa87c24 },
    ethyl_octanoate: { s: "peach", c: 0xe08a5c },
    ethyl_decanoate: { s: "grape", c: 0x6b3f7a },
    phenethyl_acetate: { s: "rose", c: 0xd05a72, c2: 0xb03e58 },
    phenethyl_alcohol: { s: "blossom", c: 0xf7f2e4, c2: 0xe8b84a, r: 0.078 },
    isoamyl_alcohol: { s: "flask", c: 0xa8b0b2 },
    isobutanol: { s: "can", c: 0x6e7a7e },
    mb2: { s: "bottle", c: 0x33452f, cap: 0x6b2a2a, label: 0xded2b8, h: 0.46, r: 0.082 },
    glycerol: { s: "jar", c: 0xc98a2a, label: 0xf2e6c6, r: 0.098 },
    diacetyl: { s: "butter", c: 0xf2df94 },
    acetaldehyde: { s: "apple", c: 0x7fa844, r: 0.13 },
    ethyl_propionate: { s: "mango", c: 0xe0913a },
    hexyl_acetate: { s: "pear", c: 0xc8c94a },
    amyl_acetate: { s: "candy", c: 0xe05a72, c2: 0xf7e2ea },
    isopentyl_butanoate: { s: "peach", c: 0xe09a4a, r: 0.118 },
    ethyl_isobutyrate: { s: "jar", c: 0xd9a63a, label: 0xf6e2b0, r: 0.092 },
    octenol: { s: "mushroom", c: 0x9c7a58 },
    lactic_acid: { s: "yogurt", c: 0xf4f1e8 },
    octanoic_acid: { s: "cheese", c: 0xefc25c, c2: 0xd9a33c },
    iso_alpha: { s: "hop", c: 0xb6c14a, c2: 0x8aa03a },
    linalool: { s: "sprig", c: 0x8a6bb5 },
    geraniol: { s: "blades", c: 0xb8c85a, c2: 0xcfd06a },
    citronellol: { s: "blades", c: 0xa8b84a, c2: 0xd2cf6e },
    nerol: { s: "jar", c: 0xe8a83a, label: 0xfaeecb, r: 0.09, dip: true },
    cdbt: { s: "pine", c: 0x3f6b3f },
    beta_phellandrene: { s: "citrus", c: 0xe08a2a, c2: 0xf2b64a },
    alpha_terpineol: { s: "log", c: 0xc9a878, c2: 0xe0c496, r: 0.076 },
    terpinen_4_ol: { s: "log", c: 0x6e5236, c2: 0xa88a62, r: 0.072, moss: true },
    beta_caryophyllene: { s: "pepper", c: 0x2a2320 },
    z_farnesene: { s: "peel", c: 0xb23a2e },
    farnesol: { s: "umbel", c: 0xf4efdc },
    nerolidol: { s: "block", c: 0x8a5f3c, c2: 0x6f4a2e },
    furfural: { s: "bread", c: 0xb5722e, c2: 0xefd9a6 },
    methylpyrazine: { s: "nuts", c: 0x8a5a30, c2: 0x6b4224 },
    ethyl_furoate: { s: "toffee", c: 0xb5711e },
    furfuryl_alcohol: { s: "log", c: 0x3a2a1e, c2: 0x2a1e14, r: 0.07, ember: true },
    phenylacetaldehyde: { s: "jar", c: 0xe0a52a, label: 0xfae6b4, r: 0.096, dip: true },
    methanethiol: { s: "cabbage", c: 0x8fb06a, c2: 0x9fc07a },
    dms: { s: "corn", c: 0xefc03a, c2: 0x9fb85e },
    benzaldehyde: { s: "almond", c: 0xc99a6a },
    e_alpha_ionone: { s: "blossom", c: 0x8a6bc0, c2: 0xe8c25c, r: 0.07 },
    e_beta_ionone: { s: "root", c: 0x6b5a3a, c2: 0x9a7fc0 },
    "4vg": { s: "clove", c: 0x4a3324, smoke: true },
    "4eg": { s: "chips", c: 0xc9a878, c2: 0x8a6a45 },
    "4ep": { s: "leather", c: 0x8a5230, c2: 0x6b3a22 },
    eugenol: { s: "clove", c: 0x5a3a22 },
    guaiacol: { s: "fire" },
    co2: { s: "bottle", c: 0xa8ccb4, cap: 0x2f6a72, label: 0x7fc9d6, h: 0.4, r: 0.085 },
    so2: { s: "match", c: 0xc04a2e },
    iron: { s: "bolt", c: 0x8a4a2e },
    t2n: { s: "cardboard", c: 0xbf9560, c2: 0xd2b184 },
  };

  function buildJars() {
    initGeo();
    jars = [];
    pick = [];
    plates = [];
    var ids = jarIds();
    var yOf = [0.78, 1.72, 2.66];
    var spots = [];
    for (var level = 0; level < 3; level++) {
      for (var i = 0; i < 8; i++) {
        spots.push({ x: -3.15 + i * 0.9, y: yOf[level] + 0.045, z: -3.52, level: level });
      }
    }
    ids.slice(0, spots.length).forEach(function (id, idx) {
      var s = spots[idx];
      var item = makeItem(id);
      item.position.set(s.x, s.y, s.z);
      item.userData.home = new THREE.Vector3(s.x, s.y, s.z);
      item.userData.level = s.level;
      scene.add(item);
      jars.push(item);

      /* 脚下小铭牌：像仓库的货位卡，谁的名字归谁 */
      var plate = makePlate(id, s.x, yOf[s.level] + 0.088, -3.216);
      plate.visible = !NARROW;
      scene.add(plate);
    });
    refreshJars();
  }

  function makeItem(id) {
    var info = L(id);
    var g = new THREE.Group();
    g.userData.id = id;

    var p = PROP[id] || { s: "jar", c: 0x8a98a6 };
    var body = (SHAPES[p.s] || pJar)(p);
    /* 统一放大：货架层高 0.94，原料占满一半才看得清 */
    body.scale.setScalar(1.32);
    g.add(body);
    g.userData.inner = body;

    var baseRing = new THREE.Mesh(
      new THREE.RingGeometry(0.195, 0.222, 28),
      new THREE.MeshBasicMaterial({ color: cssColor(info.color), transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = 0.004;
    g.add(baseRing);
    g.userData.baseRing = baseRing;

    var ring = new THREE.Mesh(
      new THREE.RingGeometry(0.228, 0.258, 28),
      new THREE.MeshBasicMaterial({ color: 0x5fe3d0, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.006;
    ring.visible = false;
    g.add(ring);
    g.userData.ring = ring;

    body.traverse(function (o) {
      if (o.isMesh) { o.userData.jar = g; pick.push(o); }
    });

    paintJar(g);
    return g;
  }

  function makePlate(id, x, y, z) {
    var c = document.createElement("canvas");
    c.width = 512; c.height = 128;
    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    var m = new THREE.Mesh(GEO.plane, new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    m.scale.set(0.64, 0.17, 1);
    m.position.set(x, y, z);
    m.rotation.x = -0.2;
    m.userData.plate = { id: id, canvas: c, tex: tex };
    plates.push(m);
    drawPlate(m.userData.plate);
    return m;
  }

  function drawPlate(p) {
    var info = L(p.id);
    var g = p.canvas.getContext("2d");
    var w = p.canvas.width, h = p.canvas.height;
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(32,19,11,0.93)";
    g.fillRect(0, 0, w, h);
    g.fillStyle = info.color;
    g.fillRect(0, 0, 12, h);
    g.strokeStyle = "rgba(214,176,138,0.34)";
    g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, w - 3, h - 3);
    g.fillStyle = "#f7e9d2";
    var name = clip(info.main, 18);
    var size = name.length > 11 ? 46 : name.length > 7 ? 58 : 74;
    g.font = "600 " + size + "px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    g.textBaseline = "middle";
    g.fillText(name, 30, h / 2 + 3, w - 44);
    p.tex.needsUpdate = true;
  }

  function paintJar(jar) {
    var info = L(jar.userData.id);
    if (jar.userData.baseRing) jar.userData.baseRing.material.color = cssColor(info.color);
  }

  function jarIds() {
    var key = A.styleKey().slice(0, 12);
    var meta = A.meta();
    var byFam = {};
    meta.compounds.forEach(function (c) {
      (byFam[c.family] = byFam[c.family] || []).push(c);
    });
    var fams = meta.families.map(function (f) { return f.id; });
    var out = key.slice();
    var fi = 0;
    var guard = 0;
    while (out.length < 24 && guard < 400) {
      var f = fams[fi % fams.length];
      var arr = byFam[f] || [];
      for (var i = 0; i < arr.length; i++) {
        if (out.indexOf(arr[i].id) < 0) { out.push(arr[i].id); break; }
      }
      fi++;
      guard++;
    }
    /* 用真实化合物补足，避免某种风格 key 不足 12 个 */
    meta.compounds.forEach(function (c) {
      if (out.length < 24 && out.indexOf(c.id) < 0) out.push(c.id);
    });
    return out;
  }

  /* ---------------- 贴图 ---------------- */
  function radialTexture(inner, outer) {
    var c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    var g = c.getContext("2d");
    var grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grd.addColorStop(0, inner);
    grd.addColorStop(1, outer);
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  /* 漩涡旋纹：128×128，3 条半径不同的螺旋臂。中心对称的渐变绕 Y 转在屏幕上是零变化，
     转速看的就是这张图的转动，所以必须是旋臂而不是同心环。 */
  function swirlTexture() {
    if (TEX.swirl) return TEX.swirl;
    var S = 128;
    var c = document.createElement("canvas");
    c.width = c.height = S;
    var g = c.getContext("2d");
    g.clearRect(0, 0, S, S);
    g.lineCap = "round";
    var arms = [
      [3.5, "rgba(255,214,150,0.55)"],
      [2.9, "rgba(255,214,150,0.43)"],
      [2.3, "rgba(255,214,150,0.31)"],
    ];
    for (var i = 0; i < arms.length; i++) {
      g.lineWidth = arms[i][0];
      g.strokeStyle = arms[i][1];
      g.beginPath();
      var a0 = (i / arms.length) * Math.PI * 2;
      for (var s = 0; s <= 40; s++) {
        var t = s / 40;
        var r = 10 + t * 52;          /* 10 → 62 */
        var a = a0 + t * 2.6;         /* 臂转角 2.6 rad */
        var px = S / 2 + Math.cos(a) * r;
        var py = S / 2 + Math.sin(a) * r;
        if (s === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.stroke();
    }
    g.strokeStyle = "rgba(255,240,210,0.18)";
    g.lineWidth = 1;
    g.beginPath();
    g.arc(S / 2, S / 2, 62.5, 0, Math.PI * 2);
    g.stroke();

    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    TEX.swirl = tex;
    return tex;
  }

  /* ---------------- 打开 / 关闭 ---------------- */
  function openScene() {
    mount();
    if (!initScene()) {
      els.root.classList.add("is-open");
      els.root.setAttribute("aria-hidden", "false");
      document.body.classList.add("l3d-lock");
      showError();
      return;
    }
    state.opened = true;
    state.phase = "loading";
    state.t0 = performance.now();
    state.focus = null;
    hideSay();
    els.loading.classList.remove("is-done");
    els.root.classList.add("is-open");
    els.root.setAttribute("aria-hidden", "false");
    document.body.classList.add("l3d-lock");
    paintPlates();
    refreshJars();
    refreshHUD();
    fitView();
    cam.theta = BASE.theta + 0.5;
    cam.phi = 1.42;
    cam.radius = BASE.radius + 5.6;
    cam.tRadius = BASE.radius;
    onResize();
    lastT = performance.now();
    if (REDUCE) finishLoading(true);
    requestAnimationFrame(loop);
    if (els && els.root) {
      var btn = $("[data-l3d-close]", els.root);
      if (btn) btn.focus({ preventScroll: true });
    }
  }

  function closeScene() {
    if (!state.opened) return;
    state.opened = false;
    state.phase = "idle";
    state.dragging = null;
    state.orbit = false;
    state.press = null;
    state.poke = null;
    if (els.root) {
      els.root.classList.remove("is-open");
      els.root.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("l3d-lock");
    if (els.tip) els.tip.classList.remove("is-on");
    hideSay();
    if (A && A.sync) A.sync();
  }

  function showError(msg) {
    if (!els.err) return;
    els.err.hidden = false;
    if (msg) els.errMsg.textContent = msg;
    if (els.loading) els.loading.classList.add("is-done");
  }

  /* ---------------- 加载动画 ---------------- */
  var STAGES = [
    [0.0, "建立三维坐标系…"],
    [0.18, "载入 226 项风味指标…"],
    [0.38, "校准分光仪与光源…"],
    [0.58, "生成发酵舱与货架…"],
    [0.78, "把 24 份原料摆上架…"],
    [0.93, "准备试饮…"],
  ];

  function tickLoading(now) {
    var p = clamp((now - state.t0) / 2200, 0, 1);
    var shown = Math.round((p < 0.92 ? p : 0.92 + (p - 0.92) * 0.6) * 100);
    els.bar.style.width = shown + "%";
    els.pct.textContent = shown + "%";
    for (var i = STAGES.length - 1; i >= 0; i--) {
      if (p >= STAGES[i][0]) { els.stage.textContent = STAGES[i][1]; break; }
    }
    if (p >= 1) finishLoading(false);
  }

  function finishLoading(skip) {
    if (state.phase !== "loading") return;
    state.phase = "intro";
    els.bar.style.width = "100%";
    els.pct.textContent = "100%";
    els.loading.classList.add("is-done");
    state.t0 = performance.now();
    if (skip) { cam.theta = BASE.theta; cam.phi = BASE.phi; cam.radius = BASE.radius; cam.tRadius = BASE.radius; }
    if (REDUCE) { state.phase = "live"; }
  }

  /* ---------------- 每帧 ---------------- */
  function loop(now) {
    if (!state.opened) return;
    var dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
    lastT = now;
    clock += dt;

    if (state.phase === "loading") {
      tickLoading(now);
    } else if (state.phase === "intro") {
      var k = clamp((now - state.t0) / 1500, 0, 1);
      var e = ease(k);
      cam.theta += (BASE.theta - cam.theta) * 0.08;
      cam.phi += (BASE.phi - cam.phi) * 0.08;
      cam.radius += (BASE.radius - cam.radius) * 0.08;
      cam.tRadius = BASE.radius;
      if (k >= 1) state.phase = "live";
    }

    updateCamera();
    updateCharacter(dt, now);
    updatePendants(dt);
    placeSay();
    updateBottle(dt);
    updateSwirl(dt, now);
    updateCaps(now);
    updateJars();
    updateOrbs(now);
    updateDrops(dt);
    if (state.overBottle && glowRing) glowRing.material.opacity = 0.55 + Math.sin(now / 140) * 0.25;
    else if (glowRing) {
      /* 集齐后铜边常亮到 0.85，用 1.2s 渐亮上去，不是一下子跳 */
      var target = 0.6;
      if (state.capsSealed) {
        target = state.sealGlowAt ? 0.6 + 0.25 * clamp((now - state.sealGlowAt) / 1200, 0, 1) : 0.85;
      }
      glowRing.material.opacity += (target - glowRing.material.opacity) * 0.1;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  function renderOnce() {
    if (!renderer) return;
    updateCamera();
    renderer.render(scene, camera);
  }

  function updateCamera() {
    /* 阻尼与惯性 */
    if (!state.orbit) {
      cam.theta += cam.vT;
      cam.phi += cam.vP;
      cam.vT *= 0.93;
      cam.vP *= 0.93;
    }
    cam.phi = clamp(cam.phi, 0.52, 1.46);
    cam.radius += (cam.tRadius - cam.radius) * 0.12;
    var sp = Math.sin(cam.phi);
    camera.position.set(
      TARGET.x + cam.radius * sp * Math.sin(cam.theta),
      TARGET.y + cam.radius * Math.cos(cam.phi),
      TARGET.z + cam.radius * sp * Math.cos(cam.theta)
    );
    camera.lookAt(TARGET);
  }

  function updateCharacter(dt, now) {
    if (!char) return;
    var t = REDUCE ? 0 : now / 1000;
    char.position.y = Math.sin(t * 1.5) * 0.012;
    head.rotation.z = Math.sin(t * 0.7) * 0.02;

    /* 始终转身面向镜头，像柜台后的店主 */
    var target = Math.atan2(camera.position.x - char.position.x, camera.position.z - char.position.z);
    char.rotation.y = lerpAngle(char.rotation.y, target, 0.09);

    /* 眨眼：每只眼各自压扁，才不会往脸中间塌 */
    var blink = (t % 4.2) > 4.05;
    var sy = blink ? 0.1 : 1;
    if (eyeSet.eyes) {
      for (var i = 0; i < eyeSet.eyes.length; i++) {
        var e = eyeSet.eyes[i];
        e.scale.y += (sy - e.scale.y) * 0.45;
      }
    }

    /* 试饮反应 */
    if (state.reactAt > 0) {
      var dt2 = (now - state.reactAt) / 1000;
      if (dt2 > 1.8) {
        state.reactAt = -1;
        armR.rotation.x += (-0.5 - armR.rotation.x) * 0.15;
        head.rotation.x += (0 - head.rotation.x) * 0.15;
      } else if (dt2 >= 0) {
        var kk = dt2 < 0.38 ? dt2 / 0.38 : Math.max(0, 1 - (dt2 - 1.0) / 0.55);
        armR.rotation.x = -0.5 - 0.95 * kk;
        head.rotation.x = -0.16 * kk;
      }
    }

    /* 点一下的反应：叠在呼吸与试饮之上，但绝不碰 position.y 与 char.rotation.y */
    updatePoke(now);
  }

  /* ---------------- 点一下酿酒师 ----------------
     四档循环，第 4 档（上唇沾泡沫）每个会话只演一次；演过之后档 3 整组复用档 1。
     全部用 performance.now() 差值驱动，不排定时器 —— 掉帧时也不会错拍。 */
  var POKE_LINES = [
    ["嗯？想听我讲讲？", "先投两样，我边喝边说。"],
    ["这屋子，二十二年了。", "木头都喝出酒味了。"],
    ["……非要点第四下？", "……行吧，就一次。"],
    ["看什么，唇上沾了沫？", "别笑，你也一样。"],
  ];

  /* 彩蛋演完之后档 3 不再是「催你点第四下」，整组退回档 1 的姿态与台词 */
  function pokeEff(stage) {
    return stage === 3 && state.foamDone ? 1 : stage;
  }

  function rampK(t, up, hold, down) {
    if (t <= 0) return 0;
    if (t < up) return ease(t / up);
    if (t < up + hold) return 1;
    if (t < up + hold + down) return 1 - ease((t - up - hold) / down);
    return 0;
  }

  function pokeDone(t, up, hold, down) { return t >= up + hold + down; }

  function clearPoke() {
    state.poke = null;
    if (!char) return;
    head.rotation.y = 0;
    if (state.reactAt <= 0) {
      head.rotation.x = 0;
      armR.rotation.x = char.userData.armRBaseX;
    }
    var armL = char.userData.armL;
    if (armL && armL.userData.baseZ != null) armL.rotation.z = armL.userData.baseZ;
    if (foamLip) foamLip.visible = false;
  }

  function updatePoke(now) {
    var p = state.poke;
    if (!p || !char) return;
    var t = now - p.at;
    var armL = char.userData.armL;
    var baseZ = armL && armL.userData.baseZ != null ? armL.userData.baseZ : -0.09;
    var busy = state.reactAt > 0;

    if (p.stage === 1) {
      /* 看你：头轻轻转过来，停半秒再回去 */
      head.rotation.y = -0.14 * rampK(t, 180, 500, 300);
      if (pokeDone(t, 180, 500, 300)) clearPoke();
    } else if (p.stage === 2) {
      /* 举杯：手臂抬起来；正在试饮就让位，只把头往杯子的方向偏一点 */
      var k2 = rampK(t, 220, 600, 320);
      if (busy) head.rotation.y = 0.12 * k2;
      else { head.rotation.y = 0; armR.rotation.x = char.userData.armRBaseX - 0.75 * k2; }
      if (pokeDone(t, 220, 600, 320)) clearPoke();
    } else if (p.stage === 3) {
      /* 闻杯：低头凑近，手臂跟到一半 */
      var k3 = rampK(t, 240, 700, 400);
      head.rotation.y = 0;
      head.rotation.x = -0.16 * k3;
      if (!busy) armR.rotation.x = char.userData.armRBaseX - 0.4 * k3;
      if (pokeDone(t, 240, 700, 400)) clearPoke();
    } else {
      /* 彩蛋：抬手抹一把上唇，泡沫在收手时消失 */
      var k4 = rampK(t, 300, 420, 500);
      head.rotation.y = 0;
      if (armL) armL.rotation.z = baseZ + (0.95 - baseZ) * k4;
      if (foamLip) foamLip.visible = t < 300 + 420 + 420;
      if (pokeDone(t, 300, 420, 500)) {
        state.foamDone = true;
        clearPoke();
      }
    }
  }

  function tapCharacter() {
    if (!char || state.phase !== "live") return;
    var now = performance.now();
    if (now - state.lastPoke < 600) {
      /* 连点只重播当前这一档，不往下跳 */
      if (state.charStage) state.poke = { at: now, stage: pokeEff(state.charStage) };
      return;
    }
    state.lastPoke = now;
    var next = state.charStage >= 4 ? 1 : state.charStage + 1;
    if (next === 4 && state.foamDone) next = 1;   /* 彩蛋每会话一次，之后回到第 1 档 */
    state.charStage = next;
    if (next === 4) state.foamDone = true;
    state.poke = { at: now, stage: pokeEff(next) };
    sayPair(POKE_LINES[pokeEff(next) - 1], 80, 0);
  }

  /* ---------------- 台词 ----------------
     尝一口说两句：第一句是当下反应，第二句是酿酒师的自言自语。
     按五档愉悦度各写一套，气泡跟着脑袋走，转视角也不会掉队。 */
  var LINES = [
    ["咳……这也太冲了。", "先记下来，下次别这么放。"],
    ["嗯……有点跑偏。", "比例得改，苦味压过了头。"],
    ["还行，中规中矩。", "再添一味，层次就出来了。"],
    ["不错，香气立起来了。", "这个配比，可以记进配方本。"],
    ["好酒！这一口很完整。", "就照这个方子，再酿一桶。"],
  ];

  var sayPos = new THREE.Vector3();
  var sayBox = { w: 0, h: 0 };
  var sayTimers = [];
  var sayRO = null;
  var sayState = { prio: -1, at: 0 };

  function clearSayTimers() {
    for (var i = 0; i < sayTimers.length; i++) global.clearTimeout(sayTimers[i]);
    sayTimers = [];
  }

  function hideSay() {
    clearSayTimers();
    if (els.say) els.say.classList.remove("is-on", "is-two");
    sayState.prio = -1;
  }

  /* 台词仲裁：任何时候只留一个气泡。
     优先级 瓶盖 2 > 投料 1 > 人物 0，低优先级的插不进正在说话的高优先级；
     气泡刚出来不到 700ms 时不重播淡入，只换字 —— 连续投料不会闪成一片。 */
  function sayPair(pair, delay, prio) {
    if (!els.say || !pair) return;
    prio = prio || 0;
    delay = delay > 0 ? delay : 0;
    var now = performance.now();
    var showing = els.say.classList.contains("is-on");
    var busy = showing || sayTimers.length > 0;
    /* 单句也要能走这个接口：第二行清空、不加 is-two，
       否则 aria-live 会把上一句残留再念一遍、measureSay 还会多算一行 */
    var two = !!(pair[1] && pair[1].length);

    if (busy && sayState.prio > prio) return;

    if (showing && now - sayState.at < 700) {
      clearSayTimers();
      els.sayLines[0].textContent = pair[0];
      els.sayLines[1].textContent = two ? pair[1] : "";
      els.say.classList.remove("is-two");
      measureSay();
      if (two) {
        sayTimers.push(global.setTimeout(function () {
          if (state.opened) els.say.classList.add("is-two");
        }, REDUCE ? 60 : 1250));
      }
      sayTimers.push(global.setTimeout(hideSay, REDUCE ? 5000 : 6100));
      sayState.at = now;
      sayState.prio = prio;
      return;
    }

    hideSay();
    sayState.prio = prio;
    sayTimers.push(global.setTimeout(function () {
      if (!state.opened) return;
      els.sayLines[0].textContent = pair[0];
      els.sayLines[1].textContent = two ? pair[1] : "";
      els.say.classList.add("is-on");
      sayState.at = performance.now();
      measureSay();
    }, REDUCE ? Math.min(delay, 120) : delay));
    if (two) {
      sayTimers.push(global.setTimeout(function () {
        if (state.opened) els.say.classList.add("is-two");
      }, (REDUCE ? Math.min(delay, 120) : delay) + (REDUCE ? 60 : 1250)));
    }
    sayTimers.push(global.setTimeout(hideSay, REDUCE ? 5000 : 6100));
  }

  /* 投放落定后约 1 秒才开口：先抬手、入口，再说话 */
  function queueSay(ex) {
    sayPair(LINES[clamp(ex | 0, 0, 4)], 960, 1);
  }

  function measureSay() {
    if (!els.say || !els.say.classList.contains("is-on")) return;
    sayBox.w = els.say.offsetWidth;
    sayBox.h = els.say.offsetHeight;
    placeSay();
  }

  /* 切语言：气泡里的中文可能已经被换掉，先收起再重量一次 */
  function onLangChange() {
    hideSay();
    measureSay();
    paintPlates();
  }

  /* 每帧把脑袋的世界坐标投到屏幕，气泡贴在上面，尾巴对准脑袋 */
  function placeSay() {
    if (!els.say || !sayBox.w || !head || !els.say.classList.contains("is-on")) return;
    var r = els.canvas.getBoundingClientRect();
    head.getWorldPosition(sayPos);
    /* 头顶再高一点就飘了：只留出发梢的余量 */
    sayPos.y += 0.34;
    var v = sayPos.project(camera);
    var hx = (v.x * 0.5 + 0.5) * r.width;
    var hy = (-v.y * 0.5 + 0.5) * r.height;
    var left = clamp(hx - sayBox.w * 0.55, 12, r.width - padRight - sayBox.w);
    var top = Math.max(14, hy - sayBox.h - 8);
    els.say.style.transform = "translate3d(" + Math.round(left) + "px," + Math.round(top) + "px,0)";
    els.say.style.setProperty("--tail", Math.round(clamp(hx - left, 24, sayBox.w - 24)) + "px");
  }

  function updateBottle(dt) {
    if (!liquid) return;
    var targetLevel = Math.max(0.06, state.level == null ? 0.16 : state.level);
    liquid.scale.y += (targetLevel - liquid.scale.y) * 0.1;
    var lc = cssColor(state.color || "#8a98a6").multiplyScalar(0.34);
    liquid.material.color.copy(lc);
    surface.material.color.copy(lc.clone().multiplyScalar(2.2));
    surface.position.y = 0.26 + liquid.scale.y;
    surface.material.opacity = 0.22 + liquid.scale.y * 0.2;
  }

  /* 漩涡：随液面走，投料后转几圈自己停。停稳与液面见底时整块隐藏（回到 0 draw call）。 */
  function updateSwirl(dt, now) {
    if (!swirl || !liquid) return;
    var lvl = liquid.scale.y;
    swirl.position.y = 0.26 + lvl + 0.002;
    if (REDUCE) {
      /* 减弱动效：不转，只在投料时相对基值亮一下（基值 0.24 → +0.18 再回落） */
      var p = state.swirlPulse ? clamp(1 - (now - state.swirlPulse) / 150, 0, 1) : 0;
      swirl.visible = p > 0.02 && lvl > 0.045;
      if (swirl.visible) swirl.material.opacity = 0.24 + 0.18 * p;
      return;
    }
    state.spin *= Math.pow(0.94, dt * 60);
    if (state.spin < 0.05 || lvl < 0.08) { swirl.visible = false; return; }
    swirl.visible = true;
    swirl.rotation.z += state.spin * dt;
    swirl.material.opacity = Math.min(0.55, state.spin * 0.14);
  }

  /* 投料时给漩涡一脚：越满转得越狠，但到 4.2 就封顶 */
  function kickSwirl() {
    if (REDUCE) { state.swirlPulse = performance.now(); return; }
    var n = S(null).count;
    state.spin = Math.min(4.2, Math.max(state.spin, 2.6 + n * 0.08));
  }

  /* 悬停抬升：比换材质更轻，也不会破坏每件原料自己的颜色 */
  function updateJars() {
    for (var i = 0; i < jars.length; i++) {
      var j = jars[i];
      var t = j.userData.hoverOn && !state.dragging ? 1 : 0;
      var h = j.userData.hover || 0;
      h += (t - h) * 0.2;
      j.userData.hover = h;
      j.userData.inner.position.y = h * 0.045;
      j.userData.baseRing.material.opacity = 0.26 + h * 0.4;
      var s = 1 + h * 0.12;
      j.userData.baseRing.scale.set(s, s, s);
    }
  }

  /* ---------------- 交互 ---------------- */
  function ndcFromEvent(e) {
    var r = els.canvas.getBoundingClientRect();
    state.px = e.clientX - r.left;
    state.py = e.clientY - r.top;
    ndc.set((state.px / r.width) * 2 - 1, -(state.py / r.height) * 2 + 1);
    return r;
  }

  /* 悬停设备的判断：触屏上没有“悬停”，别把光标改来改去 */
  var canHover = null;
  function hoverable() {
    if (canHover == null) canHover = !!(global.matchMedia && global.matchMedia("(hover: hover)").matches);
    return canHover;
  }

  function onDown(e) {
    /* 加载与入场动画期间都不接操作，进场之后才开始认人 */
    if (!state.opened || state.phase !== "live" || state.dragging || state.orbit) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    ndcFromEvent(e);
    ray.setFromCamera(ndc, camera);
    /* 一次 raycast 同时测原料与人物，取最近的那个命中 */
    var hits = ray.intersectObjects(pick.concat(charPick), false);
    state.moved = 0;
    state.lx = e.clientX;
    state.ly = e.clientY;
    jars.forEach(function (j) { j.userData.hoverOn = false; });

    var hit = hits.length ? hits[0] : null;

    if (hit && hit.object.userData.jar) {
      var jar = hit.object.userData.jar;
      state.dragging = jar;
      state.dragDist = camera.position.distanceTo(jar.position);
      jar.userData.dragHome = jar.position.clone();
      jar.scale.setScalar(1.1);
      els.root.classList.add("is-dragging");
      if (els.tip) els.tip.classList.remove("is-on");
      if (els.canvas.setPointerCapture) els.canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }

    if (hit && hit.object.userData.char) {
      /* 按在人物身上：先记一笔，抬手时再判断是“点”还是“转视角” */
      state.press = { t: performance.now(), x: e.clientX, y: e.clientY };
      state.moved = 0;
      els.canvas.style.cursor = "grabbing";
      if (els.tip) els.tip.classList.remove("is-on");
      return;
    }

    state.orbit = true;
    cam.vT = 0;
    cam.vP = 0;
    if (els.canvas.setPointerCapture) els.canvas.setPointerCapture(e.pointerId);
  }

  function onMove(e) {
    if (!state.opened) return;

    /* 按住人物还没抬手：挪得少就等着当一次点击，挪过头了转成一圈视角 */
    if (state.press) {
      var px0 = e.clientX - state.press.x;
      var py0 = e.clientY - state.press.y;
      if (Math.abs(px0) + Math.abs(py0) <= 6) return;
      state.press = null;
      els.canvas.style.cursor = "";
      state.orbit = true;
      state.moved = 99;
      state.lx = e.clientX;
      state.ly = e.clientY;
      cam.vT = -px0 * 0.0016;
      cam.vP = -py0 * 0.0013;
      return;
    }

    if (!state.dragging && !state.orbit) {
      /* 悬停：整件抬一点、底环亮起来 */
      ndcFromEvent(e);
      ray.setFromCamera(ndc, camera);
      var hit = ray.intersectObjects(pick, false)[0];
      var overJar = hit ? hit.object.userData.jar : null;
      var overChar = null;
      if (!hit && hoverable() && charPick.length) {
        var ch = ray.intersectObjects(charPick, false)[0];
        overChar = ch ? ch.object.userData.char : null;
      }
      jars.forEach(function (j) { j.userData.hoverOn = j === overJar; });
      els.canvas.style.cursor = hit ? "grab" : overChar ? "pointer" : "";
      if (hit) {
        var jid = overJar.userData.id;
        var inf = L(jid);
        els.tip.innerHTML = "<b>" + inf.emoji + " " + inf.main + "</b><i>" + inf.family + " · 点一下或拖进瓶子</i>";
        els.tip.style.left = state.px + "px";
        els.tip.style.top = state.py + "px";
        els.tip.classList.add("is-on");
      } else {
        els.tip.classList.remove("is-on");
      }
      return;
    }
    var dx = e.clientX - state.lx;
    var dy = e.clientY - state.ly;
    state.lx = e.clientX;
    state.ly = e.clientY;
    state.moved += Math.abs(dx) + Math.abs(dy);

    if (state.dragging) {
      var r = ndcFromEvent(e);
      var v = new THREE.Vector3(ndc.x, ndc.y, 0.5).unproject(camera);
      v.sub(camera.position).normalize();
      var pos = camera.position.clone().add(v.multiplyScalar(state.dragDist));
      state.dragging.position.copy(pos);
      state.dragging.position.z = clamp(pos.z, -1.2, 2.4);
      setOver(overBottle(r));
      e.preventDefault();
      return;
    }
    if (state.orbit) {
      cam.theta -= dx * 0.0055;
      cam.phi -= dy * 0.0045;
      cam.vT = -dx * 0.0016;
      cam.vP = -dy * 0.0013;
      cam.phi = clamp(cam.phi, 0.52, 1.46);
    }
  }

  function onUp(e) {
    if (!state.opened) return;
    if (state.press) {
      var p = state.press;
      state.press = null;
      els.canvas.style.cursor = "";
      /* 指针被系统收走（pointercancel）时只清状态，不派发点击 */
      if (e.type !== "pointercancel" && state.moved < 6 && performance.now() - p.t < 400) {
        tapCharacter();
      }
      return;
    }
    if (state.dragging) {
      var jar = state.dragging;
      var id = jar.userData.id;
      var over = state.overBottle;
      state.dragging = null;
      els.root.classList.remove("is-dragging");
      setOver(false);
      if (over) {
        flyToBottle(jar, id);
      } else {
        jar.position.copy(jar.userData.dragHome);
        jar.scale.setScalar(1);
      }
      if (state.moved < 6 && !over) {
        /* 轻点也算投放，降低操作门槛 */
        flyToBottle(jar, id);
      }
      e.preventDefault();
      return;
    }
    state.orbit = false;
    if (Math.abs(cam.vT) < 0.0004) cam.vT = 0;
    if (Math.abs(cam.vP) < 0.0004) cam.vP = 0;
  }

  function onWheel(e) {
    if (!state.opened) return;
    e.preventDefault();
    cam.tRadius = clamp(cam.tRadius + Math.sign(e.deltaY) * 0.55, 5.4, 12.5);
  }

  /* 键盘：Enter / Space 等于点一下酿酒师（画面里唯一的“说话”入口） */
  function onCanvasKey(e) {
    if (!state.opened) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      tapCharacter();
    }
  }

  function onResize() {
    if (!renderer) return;
    var w = els.canvas.clientWidth || global.innerWidth;
    var h = els.canvas.clientHeight || global.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    fitView();
    if (state.phase === "loading" || state.phase === "intro") renderOnce();
  }

  /* 窄屏时把镜头拉远、目标点右移，保证酒瓶与小人同时入画 */
  function fitView() {
    if (!els.canvas) return;
    var w = els.canvas.clientWidth || global.innerWidth;
    NARROW = w < 720;
    BASE.radius = NARROW ? 10.6 : 6.9;
    BASE.tx = NARROW ? 0.35 : 0;
    TARGET.x = BASE.tx;
    /* 窄屏把主角往中间收一点，避免瓶子和人被左右边缘切掉 */
    if (bottle) {
      bottle.position.x = NARROW ? -0.95 : -1.25;
      mouthWorld.set(bottle.position.x, 1.66, bottle.position.z);
    }
    if (char) char.position.x = NARROW ? 1.72 : 2.0;
    /* 手机屏太窄，架沿名字会糊成一片，只留模型 */
    plates.forEach(function (p) { p.visible = !NARROW; });
    var panel = els.root && els.root.querySelector(".l3d-right");
    padRight = panel && panel.offsetWidth ? panel.offsetWidth + 38 : 12;
    measureSay();
    if (state.phase === "live") cam.tRadius = BASE.radius;
  }

  function overBottle(rect) {
    if (!camera) return false;
    var v = mouthWorld.clone().project(camera);
    var x = (v.x * 0.5 + 0.5) * rect.width;
    var y = (-v.y * 0.5 + 0.5) * rect.height;
    var d = Math.hypot(state.px - x, state.py - y);
    return d < 110;
  }

  function setOver(v) {
    if (state.overBottle === v) return;
    state.overBottle = v;
    if (els.root) els.root.classList.toggle("is-over-bottle", v);
    var mr = bottle && bottle.userData.mouthRing;
    if (mr) mr.material.opacity = v ? 0.95 : 0;
  }

  /* ---------------- 投放 ---------------- */
  function flyToBottle(jar, id) {
    jar.position.copy(jar.userData.dragHome);
    jar.scale.setScalar(1);
    var from = jar.position.clone();
    var geo = new THREE.SphereGeometry(0.075, 12, 10);
    var info = L(id);
    var orb = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: cssColor(info.color) }));
    orb.position.copy(from);
    scene.add(orb);
    orbs.push({ mesh: orb, from: from, t0: performance.now(), id: id });
  }

  function updateOrbs(now) {
    for (var i = orbs.length - 1; i >= 0; i--) {
      var o = orbs[i];
      var k = clamp((now - o.t0) / 420, 0, 1);
      var e = ease(k);
      o.mesh.position.lerpVectors(o.from, mouthWorld, e);
      o.mesh.position.y += Math.sin(e * Math.PI) * 0.5;
      o.mesh.scale.setScalar(1 + Math.sin(e * Math.PI) * 0.5);
      if (k >= 1) {
        scene.remove(o.mesh);
        o.mesh.geometry.dispose();
        o.mesh.material.dispose();
        orbs.splice(i, 1);
        commit(o.id);
      }
    }
  }

  function commit(id) {
    var was = S(null).ids.indexOf(id) >= 0;
    if (!was) A.toggle(id);
    afterChange(id, !was);
    splash();
    var info = L(id);
    state.reactEx = S(id).ex;
    state.reactAt = performance.now() + 260;
    kickSwirl();
    /* 先看这一投有没有凑齐族配对：瓶盖台词优先级最高，抢在试饮反应前面说 */
    var got = checkCaps();
    if (got >= 0) sayPair(CAP_SAY[got], 960, 2);
    else queueSay(state.reactEx);
    if (was) {
      /* 已在瓶中：给瓶身一个脉冲即可 */
      flash = 0.4;
    }
  }

  function afterChange(id, added) {
    state.focus = id;
    refreshHUD();
    refreshJarStates();
    var snap = S(id);
    setMouth(snap.ex);
    /* 表情延后一点，先抬手 */
    global.setTimeout(function () { setMouth(S(state.focus).ex); }, added ? 900 : 120);
  }

  function splash() {
    for (var i = 0; i < 10; i++) {
      var m = new THREE.Mesh(
        new THREE.SphereGeometry(0.02 + Math.random() * 0.02, 8, 6),
        new THREE.MeshBasicMaterial({ color: i % 3 ? 0xf6cd85 : 0x5fe3d0, transparent: true, opacity: 0.9 })
      );
      m.position.copy(mouthWorld);
      scene.add(m);
      drops.push({
        mesh: m,
        vx: (Math.random() - 0.5) * 1.6,
        vy: 0.8 + Math.random() * 1.4,
        vz: (Math.random() - 0.5) * 1.6,
        life: 0,
      });
    }
  }

  function updateDrops(dt) {
    for (var i = drops.length - 1; i >= 0; i--) {
      var d = drops[i];
      d.life += dt;
      d.vy -= 4.2 * dt;
      d.mesh.position.x += d.vx * dt;
      d.mesh.position.y += d.vy * dt;
      d.mesh.position.z += d.vz * dt;
      d.mesh.material.opacity = Math.max(0, 0.9 - d.life * 1.6);
      if (d.life > 0.9) {
        scene.remove(d.mesh);
        d.mesh.geometry.dispose();
        d.mesh.material.dispose();
        drops.splice(i, 1);
      }
    }
  }

  /* ---------------- 表情 ---------------- */
  function setMouth(ex) {
    if (!mouthSet.smile) return;
    mouthSet.bad.visible = false;
    mouthSet.flat.visible = false;
    mouthSet.smile.visible = false;
    mouthSet.open.visible = false;
    eyeSet.normal.visible = true;
    eyeSet.x.visible = false;
    browSet.bad.visible = false;
    browSet.flat.visible = true;

    if (ex <= 1) {
      mouthSet.bad.visible = true;
      browSet.bad.visible = true;
      browSet.flat.visible = false;
      if (ex === 0) { eyeSet.normal.visible = false; eyeSet.x.visible = true; }
    } else if (ex === 2) {
      mouthSet.flat.visible = true;
    } else if (ex === 3) {
      mouthSet.smile.visible = true;
      browSet.flat.visible = false;
    } else {
      mouthSet.open.visible = true;
      browSet.flat.visible = false;
    }
  }

  /* ---------------- HUD ---------------- */
  /* 切了语言再进来时，货架铭牌要跟着换 */
  function paintPlates() {
    plates.forEach(function (p) {
      if (p.userData.plate) drawPlate(p.userData.plate);
    });
  }

  function refreshJars() {
    if (!jars.length) return;
    jars.forEach(function (j) { paintJar(j); });
    refreshJarStates();
  }

  function refreshJarStates() {
    var snap = S(state.focus);
    jars.forEach(function (j) {
      j.userData.ring.visible = snap.ids.indexOf(j.userData.id) >= 0;
    });
    setMouth(snap.ex);
  }

  function refreshHUD() {
    if (!els.score) return;
    var snap = S(state.focus);
    state.level = snap.level;
    state.color = snap.color;
    if (liquid && Math.abs(liquid.scale.y - 0.16) < 0.001) liquid.scale.y = Math.max(0.06, snap.level);
    els.score.textContent = snap.score == null ? "—" : snap.score;
    els.verdict.textContent = snap.verdict || "等待投放";
    els.verdict.setAttribute("data-ex", snap.ex);
    els.focus.innerHTML = (snap.name || "空瓶") + (snap.sub ? "<i>" + snap.sub + "</i>" : "");
    els.note.textContent = snap.note || "从货架上拖一样原料过来。";
    els.count.textContent = snap.count + " 种原料";
    els.level.style.width = Math.max(4, Math.round(snap.level * 100)) + "%";
    els.style.textContent = snap.style;
    if (els.mini) els.mini.textContent = (snap.score == null ? "—" : snap.score) + " · " + (snap.verdict || "");

    if (snap.count) {
      els.chips.innerHTML = snap.names
        .map(function (n) {
          return '<button type="button" class="l3d-chip" data-l3d-rm="' + n.id + '" title="移除 ' + n.name + '"><span>' +
            n.emoji + "</span><b>" + n.name + '</b><span class="x">×</span></button>';
        })
        .join("");
    } else {
      els.chips.innerHTML = '<p class="l3d-empty">瓶里还是空的。<br>拖一样原料进来试试。</p>';
    }
  }

  /* ---------------- 入口 ---------------- */
  /* 调试接口：把瓶口与货架的屏幕坐标交出来，方便自动化测试拖拽 */
  function debugInfo() {
    if (!camera || !els.canvas) return null;
    var w = els.canvas.clientWidth, h = els.canvas.clientHeight;
    var v = mouthWorld.clone().project(camera);
    return {
      bottle: { x: Math.round((v.x * 0.5 + 0.5) * w), y: Math.round((-v.y * 0.5 + 0.5) * h) },
      jars: jars.map(function (j) {
        var p = j.position.clone().project(camera);
        return {
          id: j.userData.id,
          x: Math.round((p.x * 0.5 + 0.5) * w),
          y: Math.round((-p.y * 0.5 + 0.5) * h),
        };
      }),
      phase: state.phase,
      level: liquid ? +liquid.scale.y.toFixed(2) : null,
      dragging: !!state.dragging,
      over: state.overBottle,
      /* 彩蛋验收用 */
      caps: state.caps.slice(),
      capsSealed: state.capsSealed,
      charStage: state.charStage,
      sayOn: !!(els.say && els.say.classList.contains("is-on")),
      spin: +state.spin.toFixed(2),
      foamVisible: !!(foamLip && foamLip.visible),
      /* 第一盏灯的 pivot 摆角，供自动化对比（0 表示静止） */
      pendantAng: pendants.length ? +((pendants[0].userData.ang || 0).toFixed(3)) : 0,
      /* 当前气泡说的是哪一行，便于断言「该说集齐时没说专属」 */
      sayPairName: (els.say && els.say.classList.contains("is-on") && els.sayLines)
        ? els.sayLines[0].textContent : "",
      render: renderer ? { calls: renderer.info.render.calls, tris: renderer.info.render.triangles } : null,
      box: jars.length ? (function () {
        var b = new THREE.Box3().setFromObject(jars[0]);
        return [+b.min.x.toFixed(2), +b.min.y.toFixed(2), +b.min.z.toFixed(2),
          +b.max.x.toFixed(2), +b.max.y.toFixed(2), +b.max.z.toFixed(2)];
      })() : null,
      cam: [Math.round(camera.position.x * 100) / 100, Math.round(camera.position.y * 100) / 100, Math.round(camera.position.z * 100) / 100],
      w: w,
      h: h,
    };
  }

  global.Lab3D = { open: openScene, close: closeScene, debug: debugInfo };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})(window);
