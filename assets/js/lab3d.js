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
  };

  var cam = { theta: 0.42, phi: 1.34, radius: 12.4, tRadius: 12.4, vT: 0, vP: 0 };
  var BASE = { theta: 0.13, phi: 1.28, radius: 6.9, tx: 0 };
  var TARGET = new THREE.Vector3(0, 1.14, 0);
  var NARROW = false;

  var els = {}, scene, camera, renderer, ray, ndc, jars = [], pick = [], plates = [], bottle, liquid, surface;
  var char, head, armR, mouthSet = {}, eyeSet = {}, browSet = {}, glassInHand;
  var glowRing, mouthWorld = new THREE.Vector3();
  var orbs = [], drops = [], flash = 0;
  var clock = 0, lastT = 0;

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
      '<canvas id="l3dCanvas"></canvas>' +
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

    els.canvas.addEventListener("pointerdown", onDown);
    els.canvas.addEventListener("pointermove", onMove);
    els.canvas.addEventListener("pointerup", onUp);
    els.canvas.addEventListener("pointercancel", onUp);
    els.canvas.addEventListener("pointerleave", function () {
      if (!state.dragging && !state.orbit) setOver(false);
    });
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
      renderer.toneMappingExposure = 0.82;
    }

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04070a, 0.032);

    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
    ray = new THREE.Raycaster();
    ndc = new THREE.Vector2();

    buildLights();
    buildRoom();
    buildShelves();
    buildBottle();
    buildCharacter();
    buildJars();
    onResize();
    return true;
  }

  function buildLights() {
    scene.add(new THREE.HemisphereLight(0x6fb8bd, 0x0b0906, 0.08));

    var key = new THREE.SpotLight(0xffc27a, 1.3, 26, 0.6, 0.62, 1.1);
    key.position.set(-3.4, 7.4, 4.2);
    key.target.position.set(-0.6, 0.9, 0.4);
    scene.add(key, key.target);

    var rim = new THREE.PointLight(0x5fe3d0, 1.1, 16, 2);
    rim.position.set(4.6, 2.6, 2.4);
    scene.add(rim);

    var back = new THREE.PointLight(0x2b7a86, 0.75, 12, 2);
    back.position.set(0, 3.2, -3.6);
    scene.add(back);

    var warm = new THREE.PointLight(0xe9a94e, 0.7, 8, 2);
    warm.position.set(2.2, 1.6, 1.6);
    scene.add(warm);

    /* 货架补光：道具都小，靠一盏贴脸的柔光把造型托出来 */
    var fill = new THREE.PointLight(0xc4e8e2, 0.55, 9, 2);
    fill.position.set(0, 2.4, -1.5);
    scene.add(fill);
  }

  function buildRoom() {
    /* 地面：暗色金属 + 一圈暖光 */
    var floorMat = new THREE.MeshStandardMaterial({ color: 0x070b0d, roughness: 0.72, metalness: 0.28 });
    var floor = new THREE.Mesh(new THREE.CircleGeometry(16, 64), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    scene.add(floor);

    var glowTex = radialTexture("rgba(233,169,78,0.42)", "rgba(233,169,78,0)");
    var glow = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 9),
      new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.22 })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(-0.8, 0.01, 0.4);
    scene.add(glow);

    var grid = new THREE.GridHelper(22, 44, 0x2a6a72, 0x133036);
    grid.material.transparent = true;
    grid.material.opacity = 0.44;
    grid.position.y = 0.005;
    scene.add(grid);

    /* 后墙与灯带 */
    var wallMat = new THREE.MeshStandardMaterial({ color: 0x080d10, roughness: 0.94, metalness: 0.1 });
    var wall = new THREE.Mesh(new THREE.BoxGeometry(18, 7.4, 0.3), wallMat);
    wall.position.set(0, 3.4, -4.4);
    scene.add(wall);

    var stripMat = new THREE.MeshBasicMaterial({ color: 0x2b8e96, transparent: true, opacity: 0.55 });
    [-4.6, 4.6].forEach(function (x) {
      var s = new THREE.Mesh(new THREE.BoxGeometry(0.08, 5.4, 0.06), stripMat);
      s.position.set(x, 2.8, -4.22);
      scene.add(s);
    });

    var lineMat = new THREE.MeshBasicMaterial({ color: 0x1b4a50, transparent: true, opacity: 0.5 });
    var line = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.02, 0.02), lineMat);
    line.position.set(0, 5.1, -4.22);
    scene.add(line);

    /* 左侧两只发酵罐剪影，补足“厂房”尺度 */
    var tankMat = new THREE.MeshStandardMaterial({ color: 0x131c1f, roughness: 0.55, metalness: 0.55 });
    [-5.7, -6.9].forEach(function (x, i) {
      var h = 3.4 - i * 0.7;
      var t = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, h, 24), tankMat);
      t.position.set(x, h / 2, -2.6 - i * 0.8);
      scene.add(t);
      var cap = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), tankMat);
      cap.position.set(x, h, -2.6 - i * 0.8);
      scene.add(cap);
    });
  }

  function buildShelves() {
    var boardMat = new THREE.MeshStandardMaterial({ color: 0x1c2426, roughness: 0.5, metalness: 0.6 });
    var shelf = new THREE.Group();
    [0.78, 1.72, 2.66].forEach(function (y, level) {
      var board = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.07, 0.62), boardMat);
      board.position.set(0, y, -3.52);
      shelf.add(board);

      var lip = new THREE.Mesh(
        new THREE.BoxGeometry(7.8, 0.012, 0.02),
        new THREE.MeshBasicMaterial({ color: 0x5fe3d0, transparent: true, opacity: 0.5 })
      );
      lip.position.set(0, y + 0.04, -3.21);
      shelf.add(lip);

    });
    [-3.86, 3.86].forEach(function (x) {
      var post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 3.4, 0.56), boardMat);
      post.position.set(x, 1.6, -3.52);
      shelf.add(post);
    });
    scene.add(shelf);

    /* 货架顶上的库房招牌，给“这是一整面原料墙”一个说法 */
    var sign = makeSign();
    sign.position.set(0, 3.62, -4.16);
    scene.add(sign);
  }

  function makeSign() {
    var c = document.createElement("canvas");
    c.width = 1024; c.height = 192;
    var g = c.getContext("2d");
    g.fillStyle = "rgba(5,13,15,0.86)";
    g.fillRect(0, 0, 1024, 192);
    g.strokeStyle = "rgba(95,227,208,0.28)";
    g.lineWidth = 4;
    g.strokeRect(2, 2, 1020, 188);
    g.fillStyle = "rgba(233,169,78,0.9)";
    g.fillRect(40, 62, 6, 68);
    g.fillStyle = "rgba(234,255,251,0.94)";
    g.font = "600 62px 'PingFang SC', sans-serif";
    g.textBaseline = "middle";
    g.fillText("原 料 仓", 68, 88);
    g.fillStyle = "rgba(120,190,186,0.95)";
    g.font = "500 24px monospace";
    g.fillText("INGREDIENT STORE", 72, 136);
    g.textAlign = "right";
    g.fillStyle = "rgba(120,190,186,0.7)";
    g.font = "500 22px monospace";
    g.fillText("24 UNITS · 4°C", 984, 120);
    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sp.scale.set(2.7, 0.5, 1);
    return sp;
  }

  function buildBottle() {
    bottle = new THREE.Group();
    bottle.position.set(-1.25, 0, 0.9);

    var pedMat = new THREE.MeshStandardMaterial({ color: 0x141c1f, roughness: 0.35, metalness: 0.7 });
    var ped = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.02, 0.2, 32), pedMat);
    ped.position.y = 0.1;
    bottle.add(ped);

    var pedRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.93, 0.012, 8, 64),
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
      color: 0x7ec4b8, transparent: true, opacity: 0.11,
      roughness: 0.08, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.1,
      side: THREE.DoubleSide, depthWrite: false,
    });
    var glass = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), glassMat);
    glass.position.y = 0.2;
    bottle.add(glass);

    /* 瓶内液体：几何体先下移，使缩放从瓶底开始 */
    var lq = new THREE.CylinderGeometry(0.305, 0.305, 1.0, 32, 1, false);
    lq.translate(0, 0.5, 0);
    liquid = new THREE.Mesh(
      lq,
      new THREE.MeshBasicMaterial({ color: 0x8a98a6, transparent: true, opacity: 0.9 })
    );
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

    /* 瓶身标签 */
    var lc = document.createElement("canvas");
    lc.width = 512; lc.height = 256;
    var lg = lc.getContext("2d");
    lg.fillStyle = "#0d1416";
    lg.fillRect(0, 0, 512, 256);
    lg.strokeStyle = "rgba(233,169,78,0.55)";
    lg.lineWidth = 6;
    lg.strokeRect(10, 10, 492, 236);
    lg.fillStyle = "#e9a94e";
    lg.font = "600 54px Georgia, serif";
    lg.textAlign = "center";
    lg.fillText("BEER", 256, 92);
    lg.fillText("ATLAS", 256, 152);
    lg.fillStyle = "rgba(234,255,251,0.65)";
    lg.font = "22px monospace";
    lg.fillText("FERMENTATION UNIT · 22", 256, 198);
    var ltex = new THREE.CanvasTexture(lc);
    var label = new THREE.Mesh(
      new THREE.CylinderGeometry(0.352, 0.352, 0.56, 40, 1, true, -0.9, 1.8),
      new THREE.MeshStandardMaterial({ map: ltex, roughness: 0.7, metalness: 0.05 })
    );
    label.position.y = 0.53;
    bottle.add(label);

    /* 瓶口高亮环，拖拽悬停时亮起 */
    var mouthRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.012, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x5fe3d0, transparent: true, opacity: 0.0 })
    );
    mouthRing.rotation.x = Math.PI / 2;
    mouthRing.position.y = 0.2 + 1.46;
    mouthRing.userData.mouth = true;
    bottle.add(mouthRing);
    bottle.userData.mouthRing = mouthRing;

    scene.add(bottle);
    mouthWorld.set(-1.25, 0.2 + 1.46, 0.9);
  }

  function buildCharacter() {
    char = new THREE.Group();
    char.position.set(2.0, 0, 1.0);

    var skin = new THREE.MeshStandardMaterial({ color: 0xd8ab7c, roughness: 0.86, metalness: 0 });
    var shirt = new THREE.MeshStandardMaterial({ color: 0xc9bda3, roughness: 0.92, metalness: 0 });
    var apron = new THREE.MeshStandardMaterial({ color: 0x34261a, roughness: 0.88, metalness: 0 });
    var pants = new THREE.MeshStandardMaterial({ color: 0x1a2224, roughness: 0.9 });
    var hairM = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.92 });

    /* 腿与鞋 */
    [-0.115, 0.115].forEach(function (x) {
      var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.062, 0.5, 12), pants);
      leg.position.set(x, 0.3, 0);
      char.add(leg);
      var shoe = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 12), pants);
      shoe.scale.set(1, 0.55, 1.5);
      shoe.position.set(x, 0.055, 0.05);
      char.add(shoe);
    });

    var hips = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.26), pants);
    hips.position.y = 0.57;
    char.add(hips);

    var torso = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.31, 0.58, 20), shirt);
    torso.scale.z = 0.86;
    torso.position.y = 0.92;
    char.add(torso);

    [-0.235, 0.235].forEach(function (x) {
      var sh = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 12), shirt);
      sh.position.set(x, 1.16, 0);
      char.add(sh);
    });

    /* 围裙与口袋 */
    var apronMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.56, 0.035), apron);
    apronMesh.position.set(0, 0.86, 0.272);
    char.add(apronMesh);
    var pocket = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.02), new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.9 }));
    pocket.position.set(0, 0.72, 0.294);
    char.add(pocket);
    [-0.13, 0.13].forEach(function (x) {
      var strap = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.5, 0.02), apron);
      strap.position.set(x, 1.28, 0.2);
      strap.rotation.x = -0.12;
      char.add(strap);
    });

    /* 手臂 */
    function makeArm(side) {
      var g = new THREE.Group();
      g.position.set(side * 0.285, 1.15, 0);
      var upper = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.052, 0.44, 12), shirt);
      upper.position.y = -0.22;
      g.add(upper);
      var hand = new THREE.Mesh(new THREE.SphereGeometry(0.068, 16, 12), skin);
      hand.position.y = -0.46;
      g.add(hand);
      g.rotation.z = side * 0.08;
      char.add(g);
      return g;
    }
    makeArm(-1);
    armR = makeArm(1);
    armR.rotation.x = -0.5;
    armR.rotation.z = -0.1;

    /* 右手里的酒杯 */
    glassInHand = new THREE.Group();
    var cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.078, 0.055, 0.16, 16, 1, true),
      new THREE.MeshPhysicalMaterial({ color: 0xf6cd85, transparent: true, opacity: 0.5, roughness: 0.08, side: THREE.DoubleSide })
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
      new THREE.CylinderGeometry(0.079, 0.074, 0.022, 16),
      new THREE.MeshStandardMaterial({ color: 0xf7efdd, roughness: 0.95 })
    );
    foam.position.y = 0.156;
    glassInHand.add(foam);
    glassInHand.position.set(0.02, -0.5, 0.1);
    glassInHand.rotation.x = 0.5;
    armR.add(glassInHand);

    /* 脖子与头 */
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.1, 12), skin);
    neck.position.y = 1.28;
    char.add(neck);

    head = new THREE.Group();
    head.position.y = 1.47;
    char.add(head);

    var skull = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 24), skin);
    head.add(skull);

    [-0.246, 0.246].forEach(function (x) {
      var ear = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), skin);
      ear.scale.set(0.7, 1, 0.6);
      ear.position.set(x, -0.01, 0);
      head.add(ear);
    });

    var cap = new THREE.Mesh(new THREE.SphereGeometry(0.258, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.52), hairM);
    cap.position.y = 0.012;
    head.add(cap);
    var fringe = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.075, 0.13), hairM);
    fringe.position.set(0, 0.175, 0.175);
    fringe.rotation.x = 0.28;
    head.add(fringe);

    /* 五官 */
    var ink = new THREE.MeshStandardMaterial({ color: 0x2a1c14, roughness: 0.6 });
    var white = new THREE.MeshBasicMaterial({ color: 0xffffff });

    eyeSet.normal = new THREE.Group();
    [-0.083, 0.083].forEach(function (x) {
      var e = new THREE.Mesh(new THREE.SphereGeometry(0.031, 16, 12), ink);
      e.position.set(x, 0.015, 0.232);
      eyeSet.normal.add(e);
      var h = new THREE.Mesh(new THREE.SphereGeometry(0.0095, 8, 8), white);
      h.position.set(x - 0.01, 0.028, 0.256);
      eyeSet.normal.add(h);
    });
    head.add(eyeSet.normal);

    eyeSet.x = new THREE.Group();
    [-0.083, 0.083].forEach(function (x) {
      [0.7, -0.7].forEach(function (rot) {
        var bar = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.011, 0.011), ink);
        bar.position.set(x, 0.015, 0.246);
        bar.rotation.z = rot;
        eyeSet.x.add(bar);
      });
    });
    eyeSet.x.visible = false;
    head.add(eyeSet.x);

    browSet.bad = new THREE.Group();
    [-0.085, 0.085].forEach(function (x, i) {
      var b = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.014, 0.01), ink);
      b.position.set(x, 0.09, 0.238);
      b.rotation.z = i ? 0.3 : -0.3;
      browSet.bad.add(b);
    });
    browSet.bad.visible = false;
    head.add(browSet.bad);

    browSet.flat = new THREE.Group();
    [-0.085, 0.085].forEach(function (x) {
      var b = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.011, 0.01), ink);
      b.position.set(x, 0.088, 0.238);
      browSet.flat.add(b);
    });
    head.add(browSet.flat);

    var blushMat = new THREE.MeshBasicMaterial({ color: 0xd98a6a, transparent: true, opacity: 0.3 });
    [-0.15, 0.15].forEach(function (x) {
      var c = new THREE.Mesh(new THREE.CircleGeometry(0.036, 16), blushMat);
      c.position.set(x, -0.055, 0.226);
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
        var o = new THREE.Mesh(new THREE.SphereGeometry(0.055, 20, 14), new THREE.MeshStandardMaterial({ color: 0x3a1d18, roughness: 0.7 }));
        o.scale.set(1.2, 0.8, 0.4);
        m.add(o);
        var t = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), new THREE.MeshStandardMaterial({ color: 0xc96a5f, roughness: 0.7 }));
        t.scale.set(1, 0.7, 0.4);
        t.position.set(0, -0.022, 0.02);
        m.add(t);
      }
      m.position.set(0, -0.095, 0.236);
      m.visible = false;
      head.add(m);
      return m;
    }
    mouthSet.bad = mouthMesh("frown");
    mouthSet.flat = mouthMesh("flat");
    mouthSet.smile = mouthMesh("smile");
    mouthSet.open = mouthMesh("open");

    var nose = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), skin);
    nose.position.set(0, -0.04, 0.25);
    head.add(nose);

    char.userData.head = head;
    char.userData.arm = armR;
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
    g.fillStyle = "rgba(4,10,12,0.94)";
    g.fillRect(0, 0, w, h);
    g.fillStyle = info.color;
    g.fillRect(0, 0, 12, h);
    g.strokeStyle = "rgba(150,220,214,0.4)";
    g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, w - 3, h - 3);
    g.fillStyle = "#f4fffc";
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
    if (els.root) {
      els.root.classList.remove("is-open");
      els.root.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("l3d-lock");
    if (els.tip) els.tip.classList.remove("is-on");
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
    updateBottle(dt);
    updateJars();
    updateOrbs(now);
    updateDrops(dt);
    if (state.overBottle && glowRing) glowRing.material.opacity = 0.55 + Math.sin(now / 140) * 0.25;
    else if (glowRing) glowRing.material.opacity += (0.6 - glowRing.material.opacity) * 0.1;

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

    /* 眨眼 */
    var blink = (t % 4.2) > 4.05;
    var sy = blink ? 0.12 : 1;
    if (eyeSet.normal) eyeSet.normal.scale.y += (sy - eyeSet.normal.scale.y) * 0.4;

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
  }

  function updateBottle(dt) {
    if (!liquid) return;
    var targetLevel = Math.max(0.06, state.level == null ? 0.16 : state.level);
    liquid.scale.y += (targetLevel - liquid.scale.y) * 0.1;
    liquid.material.color.lerp(cssColor(state.color || "#8a98a6").multiplyScalar(0.86), 0.1);
    surface.material.color.lerp(cssColor(state.color || "#8a98a6"), 0.1);
    surface.position.y = 0.26 + liquid.scale.y;
    surface.material.opacity = 0.22 + liquid.scale.y * 0.2;
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

  function onDown(e) {
    if (!state.opened || state.phase === "loading") return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    ndcFromEvent(e);
    ray.setFromCamera(ndc, camera);
    var hits = ray.intersectObjects(pick, false);
    state.moved = 0;
    state.lx = e.clientX;
    state.ly = e.clientY;
    jars.forEach(function (j) { j.userData.hoverOn = false; });

    if (hits.length) {
      var jar = hits[0].object.userData.jar;
      if (!jar) return;
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
    state.orbit = true;
    cam.vT = 0;
    cam.vP = 0;
    if (els.canvas.setPointerCapture) els.canvas.setPointerCapture(e.pointerId);
  }

  function onMove(e) {
    if (!state.opened) return;
    if (!state.dragging && !state.orbit) {
      /* 悬停：整件抬一点、底环亮起来 */
      ndcFromEvent(e);
      ray.setFromCamera(ndc, camera);
      var hit = ray.intersectObjects(pick, false)[0];
      var overJar = hit ? hit.object.userData.jar : null;
      jars.forEach(function (j) { j.userData.hoverOn = j === overJar; });
      els.canvas.style.cursor = hit ? "grab" : "";
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
      dragging: !!state.dragging,
      over: state.overBottle,
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
