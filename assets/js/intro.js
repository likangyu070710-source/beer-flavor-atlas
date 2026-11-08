/* ============================================================
   intro.js — 首页开屏
   ------------------------------------------------------------
   职责很小：决定播不播、跟随鼠标、滚数字、到点收场。
   所有位移与填充都交给 CSS 动画，这里只负责加类与计时。
   ============================================================ */
(function () {
  "use strict";

  var el = document.getElementById("intro");
  if (!el) return;

  var params = new URLSearchParams(location.search);
  var force = params.get("intro");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var seen = false;
  try {
    seen = sessionStorage.getItem("atlas-intro-seen") === "1";
  } catch (e) {}

  /* 强制关闭 / 减少动态 / 本次会话已看过：直接移除，不留残余 */
  if (force === "0" || reduce || (seen && force !== "1")) {
    el.parentNode.removeChild(el);
    document.body.classList.remove("intro-lock", "intro-armed");
    return;
  }

  var shell = document.querySelector(".shell");
  var skip = el.querySelector(".intro-skip");
  var done = false;
  var timer = null;

  document.body.classList.add("intro-lock", "intro-armed");
  if (shell) shell.inert = true;
  try {
    sessionStorage.setItem("atlas-intro-seen", "1");
  } catch (e) {}

  /* ---------- 光标光晕：只在指针设备上跟 ---------- */
  if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
    var raf = 0;
    var mx = 50;
    var my = 62;
    el.addEventListener("pointermove", function (e) {
      mx = (e.clientX / window.innerWidth) * 100;
      my = (e.clientY / window.innerHeight) * 100;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        el.style.setProperty("--mx", mx.toFixed(2) + "%");
        el.style.setProperty("--my", my.toFixed(2) + "%");
      });
    });
  }

  /* ---------- 数字从 0 滚到位 ---------- */
  function countUp() {
    var list = el.querySelectorAll(".intro-stats b");
    Array.prototype.forEach.call(list, function (node, i) {
      var target = parseInt(node.getAttribute("data-count") || node.textContent, 10);
      if (!target || !window.requestAnimationFrame) return;
      var start = performance.now() + 1160 + i * 100;
      var dur = 760;
      function step(now) {
        var t = (now - start) / dur;
        if (t < 0) {
          requestAnimationFrame(step);
          return;
        }
        if (t > 1) t = 1;
        var eased = 1 - Math.pow(1 - t, 3);
        node.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  countUp();

  /* ---------- 收场 ---------- */
  function dismiss() {
    if (done) return;
    done = true;
    clearTimeout(timer);
    el.classList.add("is-out");
    document.body.classList.remove("intro-lock", "intro-armed");
    document.body.classList.add("intro-done");

    /* 幕布上移的同时把页面从下方顶上来，这样揭开的始终是页面顶部，
       而不是"透过幕布缝隙看到页面中段" */
    if (shell) {
      shell.inert = false;
      if (!reduce && shell.animate) {
        shell.animate(
          [{ transform: "translateY(100vh)" }, { transform: "none" }],
          { duration: 920, easing: "cubic-bezier(0.76, 0, 0.24, 1)" }
        );
      }
    }

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      if (el.parentNode) el.parentNode.removeChild(el);
      window.removeEventListener("keydown", onKey);
      el.removeEventListener("transitionend", finish);
    }
    el.addEventListener("transitionend", finish);
    setTimeout(finish, 1050);
  }

  function onKey(e) {
    if (e.key === "Tab") return;
    dismiss();
  }

  /* 自动收场；任何主动输入都可以提前结束 */
  timer = setTimeout(dismiss, 2900);
  el.addEventListener("click", dismiss);
  el.addEventListener("wheel", dismiss, { passive: true });
  el.addEventListener("touchstart", dismiss, { passive: true });
  window.addEventListener("keydown", onKey);
  if (skip) skip.addEventListener("click", dismiss);

  /* 切到后台时停掉计时，回来重新给两秒，避免回来只剩一帧 */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clearTimeout(timer);
    } else if (!done) {
      timer = setTimeout(dismiss, 1400);
    }
  });
})();
