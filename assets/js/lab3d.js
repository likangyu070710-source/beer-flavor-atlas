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

  var els = {}, scene, camera, renderer, ray, ndc, jars = [], pick = [], bottle, liquid, surface;
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
        '<div class="l3d-brand"><span class="dot"></span>3D FERMENTATION BAY <i>发酵舱</i></div>' +
        '<div class="l3d-top-actions">' +
          '<div class="l3d-modes" role="group" aria-label="模式">' +
            '<button type="button" data-l3d-mode="novice">小白</button>' +
            '<button type="button" data-l3d-mode="expert">专家</button>' +
          "</div>" +
          '<button type="button" class="l3d-exit" data-l3d-close>退出 3D</button>' +
        "</div>" +
      "</header>" +
      '<aside class="l3d-left">' +
        '<div class="l3d-cap">当前配方 / RECIPE</div>' +
        '<div class="l3d-chips" id="l3dChips"></div>' +
        '<div class="l3d-hint"><b>拖拽</b>货架上的原料到瓶中<br><b>拖动</b>空白处旋转视角 · <b>滚轮</b>缩放</div>' +
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
      var mode = e.target.closest("[data-l3d-mode]");
      if (mode) {
        A.setMode(mode.getAttribute("data-l3d-mode"));
        paintMode();
        refreshJars();
        refreshHUD();
        return;
      }
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

      var tag = makeShelfTag(level);
      tag.position.set(-4.32, y + 0.3, -3.05);
      shelf.add(tag);
    });
    [-3.86, 3.86].forEach(function (x) {
      var post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 3.4, 0.56), boardMat);
      post.position.set(x, 1.6, -3.52);
      shelf.add(post);
    });
    scene.add(shelf);
  }

  function makeShelfTag(level) {
    var names = [
      ["发酵 / FERMENT", "rgba(95,227,208,0.9)"],
      ["酒花 / HOP", "rgba(233,169,78,0.9)"],
      ["麦芽 / MALT", "rgba(207,132,82,0.9)"],
    ];
    var c = document.createElement("canvas");
    c.width = 512; c.height = 96;
    var g = c.getContext("2d");
    g.fillStyle = "rgba(4,12,14,0.72)";
    g.fillRect(0, 0, 512, 96);
    g.fillStyle = names[level][1];
    g.fillRect(0, 0, 6, 96);
    g.fillStyle = "rgba(234,255,251,0.92)";
    g.font = "500 38px 'PingFang SC', sans-serif";
    g.textBaseline = "middle";
    g.fillText(names[level][0], 20, 50);
    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sp.scale.set(1.18, 0.222, 1);
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

  function buildJars() {
    jars = [];
    pick = [];
    var ids = jarIds();
    var spots = [];
    for (var level = 0; level < 3; level++) {
      for (var i = 0; i < 8; i++) {
        spots.push({ x: -3.15 + i * 0.9, y: [0.78, 1.72, 2.66][level] + 0.045, z: -3.52, level: level });
      }
    }
    ids.slice(0, spots.length).forEach(function (id, idx) {
      var jar = makeJar(id);
      var s = spots[idx];
      jar.position.set(s.x, s.y, s.z);
      jar.userData.home = new THREE.Vector3(s.x, s.y, s.z);
      jar.userData.level = s.level;
      scene.add(jar);
      jars.push(jar);
    });
    refreshJars();
  }

  function makeJar(id) {
    var info = A.label(id);
    var g = new THREE.Group();
    g.userData.id = id;

    var glass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.4, 20, 1, true),
      new THREE.MeshPhysicalMaterial({ color: 0xbfeee6, transparent: true, opacity: 0.14, roughness: 0.05, metalness: 0, side: THREE.DoubleSide, depthWrite: false })
    );
    glass.position.y = 0.2;
    glass.userData.jar = g;
    g.add(glass);
    pick.push(glass);

    var liq = new THREE.Mesh(
      new THREE.CylinderGeometry(0.148, 0.148, 0.3, 18),
      new THREE.MeshStandardMaterial({ color: cssColor(info.color), emissive: cssColor(info.color), emissiveIntensity: 0.45, roughness: 0.35 })
    );
    liq.position.y = 0.18;
    liq.userData.jar = g;
    g.add(liq);
    pick.push(liq);
    g.userData.liquid = liq;

    var cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.176, 0.176, 0.055, 20),
      new THREE.MeshStandardMaterial({ color: 0x1e2a2d, roughness: 0.4, metalness: 0.6 })
    );
    cap.position.y = 0.39;
    cap.userData.jar = g;
    g.add(cap);
    pick.push(cap);

    var baseRing = new THREE.Mesh(
      new THREE.RingGeometry(0.17, 0.192, 24),
      new THREE.MeshBasicMaterial({ color: cssColor(info.color), transparent: true, opacity: 0.32, side: THREE.DoubleSide })
    );
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = 0.004;
    g.add(baseRing);
    g.userData.baseRing = baseRing;

    var ring = new THREE.Mesh(
      new THREE.RingGeometry(0.197, 0.225, 24),
      new THREE.MeshBasicMaterial({ color: 0x5fe3d0, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.006;
    ring.visible = false;
    g.add(ring);
    g.userData.ring = ring;

    paintJar(g);
    return g;
  }

  function paintJar(jar) {
    var info = A.label(jar.userData.id);
    if (jar.userData.liquid) {
      jar.userData.liquid.material.color = cssColor(info.color);
      jar.userData.liquid.material.emissive = cssColor(info.color);
    }
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
    paintMode();
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
    [0.78, "注入 55 种化合物…"],
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
      /* 悬停高亮 */
      ndcFromEvent(e);
      ray.setFromCamera(ndc, camera);
      var hit = ray.intersectObjects(pick, false)[0];
      pick.forEach(function (m) {
        var j = m.userData.jar;
        if (!j) return;
        var on = hit && hit.object.userData.jar === j;
        j.userData.liquid.material.emissiveIntensity += ((on ? 1.2 : 0.45) - j.userData.liquid.material.emissiveIntensity) * 0.2;
      });
      els.canvas.style.cursor = hit ? "grab" : "";
      if (hit) {
        var jid = hit.object.userData.jar.userData.id;
        var inf = A.label(jid);
        els.tip.innerHTML = "<b>" + inf.main + "</b><i>" + inf.sub + " · " + inf.family + "</i>";
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
    var info = A.label(id);
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
    var was = A.snapshot(null).ids.indexOf(id) >= 0;
    if (!was) A.toggle(id);
    afterChange(id, !was);
    splash();
    var info = A.label(id);
    state.reactEx = A.snapshot(id).ex;
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
    var snap = A.snapshot(id);
    setMouth(snap.ex);
    /* 表情延后一点，先抬手 */
    global.setTimeout(function () { setMouth(A.snapshot(state.focus).ex); }, added ? 900 : 120);
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
  function paintMode() {
    var mode = A.mode();
    var btns = els.root.querySelectorAll("[data-l3d-mode]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-l3d-mode") === mode ? "true" : "false");
    }
  }

  function refreshJars() {
    if (!jars.length) return;
    jars.forEach(function (j) { paintJar(j); });
    refreshJarStates();
  }

  function refreshJarStates() {
    var snap = A.snapshot(state.focus);
    jars.forEach(function (j) {
      j.userData.ring.visible = snap.ids.indexOf(j.userData.id) >= 0;
    });
    setMouth(snap.ex);
  }

  function refreshHUD() {
    if (!els.score) return;
    var snap = A.snapshot(state.focus);
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
    paintMode();
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
      cam: [Math.round(camera.position.x * 100) / 100, Math.round(camera.position.y * 100) / 100, Math.round(camera.position.z * 100) / 100],
      w: w,
      h: h,
    };
  }

  global.Lab3D = { open: openScene, close: closeScene, debug: debugInfo };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})(window);
