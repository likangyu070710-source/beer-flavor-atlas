/* ============================================================
   app.js — 啤酒风味图谱
   ============================================================ */
(function () {
  "use strict";

  const D = window.BEER_DATA;
  const AX = D.axes;
  const AXM = Object.fromEntries(AX.map((a) => [a.id, a]));
  const CM = Object.fromEntries(D.compounds.map((c) => [c.id, c]));
  const SM = Object.fromEntries(D.styles.map((s) => [s.id, s]));
  const FAM = Object.fromEntries(D.families.map((f) => [f.id, f]));
  const GRP = Object.fromEntries(D.groups.map((g) => [g.id, g]));
  const C = window.Charts;
  const PG = window.AtlasPages;
  const PAGE = (document.body && document.body.dataset.page) || "home";

  const state = {
    view: PAGE,
    styleId: "tripel",
    detail: false,
    group: "all",
    q: "",
    sel: [],
    seed: 0,
    tab: "list",
    from: "pils",
    to: "tripel",
    rx: { id: null, kind: "sync" },
  };

  /* ================= 口味评分 ================= */
  /* 12 条感官轴的愉悦度：正值讨喜，负值劝退。个别化合物的感官描述会误导
     （双乙酰“奶油”、DMS“玉米”），用 TASTE_FIX 按常识钉住。 */
  const TASTE_VAL = {
    ester: 1, malt: 0.82, floral: 0.78, hop: 0.5, roast: 0.34, body: 0.3,
    bitter: 0.12, sour: 0.16, alcohol: 0.06, phenol: -0.12, sulfur: -1, aged: -1,
  };
  const TASTE_FIX = {
    diacetyl: 34, methanethiol: 9, acetic_acid: 24, so2: 30, iron: 20,
    t2n: 8, dms: 15, "4vg": 60, co2: 52, iso_alpha: 48, ethanol: 44, lactic_acid: 56,
  };
  const TASTE_WORD = ["难以下咽", "不太妙", "中规中矩", "不错", "很好喝"];

  function tasteScore(c) {
    if (!c) return null;
    if (TASTE_FIX[c.id] != null) return TASTE_FIX[c.id];
    let num = 0, den = 0;
    Object.keys(c.sens).forEach((k) => {
      const v = TASTE_VAL[k];
      if (v == null) return;
      num += c.sens[k] * v;
      den += c.sens[k];
    });
    return Math.round(clamp(50 + 42 * (den ? num / den : 0), 4, 96));
  }

  function tasteEx(v) {
    return v >= 72 ? 4 : v >= 58 ? 3 : v >= 42 ? 2 : v >= 26 ? 1 : 0;
  }

  /* ================= 工具 ================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function conv(v, unit) {
    if (unit === "mg/L" && v >= 1000) return [v / 1000, "g/L"];
    if (unit === "µg/L" && v >= 1000) return [v / 1000, "mg/L"];
    return [v, unit];
  }
  function nf(v) {
    let s;
    if (v >= 100) s = v.toFixed(0);
    else if (v >= 10) s = v.toFixed(1);
    else s = v.toFixed(2);
    return s.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  }
  function fmtV(v, unit) {
    const [x, u] = conv(v, unit);
    return nf(x) + " " + u;
  }
  function rangeText(lo, hi, unit) {
    const [a, ua] = conv(lo, unit);
    const [b, ub] = conv(hi, unit);
    if (lo <= 0) return "未检出 – " + nf(b) + " " + ub;
    if (ua === ub) return nf(a) + " – " + nf(b) + " " + ub;
    return nf(a) + " " + ua + " – " + nf(b) + " " + ub;
  }
  function shortRange(lo, hi, unit) {
    const [a, ua] = conv(lo, unit);
    const [b, ub] = conv(hi, unit);
    return (lo > 0 ? nf(a) : "0") + "–" + nf(b) + " " + ub;
  }

  const mid = (cid, sid) => (SM[sid] || SM[state.styleId]).values[cid][1];
  const pres = (cid, sid) => mid(cid, sid) / CM[cid].ref;
  const dev = (cid, sid) => (pres(cid, sid) - 1) * 100;

  function salience(c) {
    return Math.max.apply(null, Object.values(c.sens));
  }
  function weightOf(c, sid) {
    return c.imp * clamp(pres(c.id, sid), 0.02, 2.6) * (0.4 + salience(c));
  }
  function levelWord(d) {
    if (d > 90) return ["极显著偏高", "up"];
    if (d > 25) return ["偏高", "up"];
    if (d > -20) return ["接近基准", "flat"];
    if (d > -60) return ["偏低", "down"];
    return ["显著偏低", "down"];
  }

  function attrPills(c, n) {
    return Object.entries(c.sens)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, n || 3)
      .map(([k, v]) => {
        const nm = AXM[k] ? AXM[k].cn : k;
        return '<span class="attr-pill">' + nm + "<b>" + (v > 0 ? "+" : "") + v.toFixed(2).replace(/0+$/, "").replace(/\.$/, "") + "</b></span>";
      })
      .join("");
  }

  function rangeBar(lo, mid_, hi, c) {
    const max = Math.max(hi * 1.18, c.ref * 1.5, 0.0001);
    const L = clamp((lo / max) * 100, 0, 100);
    const H = clamp((hi / max) * 100, 0, 100);
    const M = clamp((mid_ / max) * 100, 0, 100);
    return (
      '<div class="range"><div class="range-track">' +
      '<i class="range-fill" style="left:' + L + "%;width:" + Math.max(H - L, 1.5) + '%"></i>' +
      '<i class="range-mid" style="left:' + M + '%"></i>' +
      "</div><div class=\"range-lab\"><span>" + rangeText(lo, hi, c.unit) + "</span></div></div>"
    );
  }

  /* ================= 风格：列表 ================= */
  /* ---------------- 首页 ---------------- */
  const HOME_MODS = [
    { v: "style", n: "01", icon: "library", t: "风格查询", d: "22 个风格的关键化合物与含量区间" },
    { v: "lab", n: "02", icon: "lab", t: "化合物交互", d: "增减化合物，实时看感官轮廓怎么变" },
    { v: "note", n: "03", icon: "note", t: "口味生成", d: "把当前组合写成一段品鉴笔记" },
    { v: "origin", n: "04", icon: "origin", t: "风格溯源", d: "Tripel 的原料、工艺与化合物因果链" },
    { v: "transfer", n: "05", icon: "transfer", t: "风格迁移", d: "从一种风格改造成另一种的干预清单" },
  ];
  const HOME_GAL = ["hoppy", "stout", "kriek", "tripel"];

  function renderHome() {
    const A = window.BeerArt;
    const el = $("#view-home");

    const stats = [
      ["250", "款啤酒"],
      ["226", "项指标"],
      ["22", "个风格"],
      ["50", "维感官"],
    ]
      .map((x) => '<div class="hm-stat"><b>' + x[0] + "</b><span>" + x[1] + "</span></div>")
      .join("");

    const mods = HOME_MODS.map(
      (m) =>
        '<button class="hm-mod" data-go="' + m.v + '">' +
        '<span class="hm-mod-ico">' + A.icon(m.icon) + "</span>" +
        '<span class="hm-mod-no">' + m.n + "</span>" +
        '<span class="hm-mod-t">' + m.t + "</span>" +
        '<span class="hm-mod-d">' + m.d + "</span>" +
        '<span class="hm-mod-go" aria-hidden="true">→</span>' +
        "</button>"
    ).join("");

    const gal = HOME_GAL.map((id) => {
      const s = SM[id];
      const keys = s.key.slice(0, 2).map((k) => CM[k].cn).join(" · ");
      return (
        '<button class="hm-style" data-style="' + id + '">' +
        '<span class="hm-style-art">' + A.card(id) + "</span>" +
        '<span class="hm-style-body">' +
        '<span class="hm-style-top"><b>' + s.cn + "</b><i>" + (GRP[s.group] ? GRP[s.group].cn : "") + "</i></span>" +
        '<span class="hm-style-en">' + s.en + "</span>" +
        '<span class="hm-style-keys">' + keys + "</span>" +
        "</span></button>"
      );
    }).join("");

    el.innerHTML =
      '<div class="home">' +
      '<section class="hm-hero">' +
      '<div class="hm-hero-body">' +
      '<div class="eyebrow">00 / 首页 · Home</div>' +
      "<h1>一杯啤酒里有 226 个可测的风味分子</h1>" +
      '<p class="lede">从 250 款商业啤酒的化学谱与 50 维感官评分出发，把风格拆成能读、能调、能迁移的化合物组合。</p>' +
      '<div class="hm-cta">' +
      '<button class="solid-btn" data-go="style">进入风格库</button>' +
      '<button class="line-btn" data-go="lab">直接调配方</button>' +
      '<button class="link-btn" data-go="origin">看 Tripel 是怎么来的 →</button>' +
      "</div>" +
      '<div class="hm-stats">' + stats + "</div>" +
      "</div>" +
      '<div class="hm-hero-art">' + A.hero() + "</div>" +
      "</section>" +

      '<section class="hm-sec">' +
      '<div class="hm-sec-head"><div class="hm-sec-t">五个入口<small>Five ways in</small></div>' +
      '<span class="hm-sec-note">查风格、调组合、写描述、溯源、迁移</span></div>' +
      '<div class="hm-mods">' + mods + "</div>" +
      "</section>" +

      '<section class="hm-sec">' +
      '<div class="hm-sec-head"><div class="hm-sec-t">四种风格，四种化学指纹<small>Four fingerprints</small></div>' +
      '<span class="hm-sec-note">点开任一风格，看它的含量区间与论文指纹</span></div>' +
      '<div class="hm-gal">' + gal + "</div>" +
      "</section>" +

      '<section class="hm-quote">' +
      "<p>内容依据论文表 5–27 整理，含量区间按分位得分口径推算；完整口径与出处见弹窗。</p>" +
      '<button class="link-btn" data-open-scale>数据口径与出处 →</button>' +
      "</section>" +
      "</div>";
  }

  function renderStyle() {
    const el = $("#view-style");
    if (state.detail) return renderStyleDetail(el);

    const groups = D.groups.map((g) => {
      const n = g.id === "all" ? D.styles.length : D.styles.filter((s) => s.group === g.id).length;
      return (
        '<button class="chip' + (state.group === g.id ? " is-on" : "") + '" data-group="' + g.id + '">' +
        g.cn + '<span class="chip-count">' + n + "</span></button>"
      );
    }).join("");

    const list = D.styles.filter((s) => {
      if (state.group !== "all" && s.group !== state.group) return false;
      if (!state.q) return true;
      const q = state.q.toLowerCase();
      return (s.cn + s.en + s.desc + (s.alias || "")).toLowerCase().indexOf(q) >= 0;
    });

    const cards = list
      .map((s) => {
        const vals = AX.map((a) => s.profile[a.id]);
        const key = s.key.slice(0, 3).map((cid) => {
          const c = CM[cid];
          return "<span><i></i>" + c.cn + "</span>";
        }).join("");
        return (
          '<article class="s-card" data-style="' + s.id + '">' +
          '<div class="s-top"><div><div class="s-name">' + s.cn + '</div><div class="s-en">' + s.en + "</div></div>" +
          '<span class="s-fam">' + GRP[s.group].cn + "</span></div>" +
          '<div class="s-body"><div class="s-radar">' + C.miniBars(vals, 62, 34) + "</div>" +
          '<div class="s-key">' + key + "</div></div>" +
          '<div class="s-foot"><span>苦度 <b>' + s.profile.bitter.toFixed(1) + "</b> · 酯香 <b>" + s.profile.ester.toFixed(1) +
          "</b></span><span>" + (s.n ? "n=" + s.n : "n≥3") + "</span></div>" +
          "</article>"
        );
      })
      .join("");

    el.innerHTML =
      '<div class="view-head"><div class="eyebrow">01 / 风格查询 · Style library</div>' +
      "<h1>22 种风格的风味坐标<em>Flavor map</em></h1>" +
      '<p class="lede">从 250 款商业啤酒中归纳的 22 个风格，每一种都由一组化合物浓度与 50 维感官评分共同定位。' +
      "点击任一风格，查看它的<b>关键风味化合物及其含量区间</b>、感官画像与论文给出的化学指纹。</p></div>" +
      '<div class="toolbar"><div class="search"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4L14 14"/></svg>' +
      '<input id="q" type="search" placeholder="搜索风格，如 IPA / 世涛 / 酸啤" value="' + state.q + '"></div>' +
      '<div class="chips">' + groups + "</div></div>" +
      '<div class="grid-styles">' + (cards || '<p class="empty-hint">没有匹配的风格，试试其他关键词。</p>') + "</div>" +
      evidencePanel();

    $("#q").addEventListener("input", (e) => {
      state.q = e.target.value;
      const pos = e.target.selectionStart;
      renderStyle();
      const q = $("#q");
      if (q) { q.focus(); q.setSelectionRange(pos, pos); }
    });
  }

  function styleListClick(e) {
    const chip = e.target.closest("[data-group]");
    if (chip) { state.group = chip.dataset.group; renderStyle(); return; }
    const card = e.target.closest("[data-style]");
    if (card) { state.styleId = card.dataset.style; state.detail = true; state.sel = SM[state.styleId].key.slice(0, 6); syncCrumb(); renderStyle(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }

  function evidencePanel() {
    const rows = D.evidence
      .map((d) => {
        const t = d.top
          .map((x) => '<div class="ev-c"><b>' + x.cn + "</b><span>π " + x.pi.toFixed(2) + " · |ρ| " + x.rho.toFixed(2) + (x.relaxed ? " †" : "") + "</span></div>")
          .join("");
        const g = d.group === "aroma" ? "Aroma" : d.group === "flavour" ? "Flavour" : "属性";
        return (
          '<div class="ev-row"><div class="ev-dim"><b>' + d.cn + "</b><span>" + g + " · " + d.id + "</span></div>" + t +
          '<div class="ev-tier"><i class="tier-' + d.tier + '">' + ["", "一级", "二级", "三级"][d.tier] + "</i></div></div>"
        );
      })
      .join("");
    return (
      '<details class="panel ev-panel"><summary><span class="h2" style="display:inline">论文证据<small>50 个感官维度的完整 Top-3</small></span>' +
      '<span class="panel-note">表 21 · 点击展开</span></summary>' +
      '<p class="panel-note" style="margin:10px 0 14px">名单按“先以入选频率 π ≥ 0.6 筛稳定候选、再按边际效应量 |ρ| 排序”的两步规则生成；† 表示候选不足时放宽阈值的补充项。' +
      "证据等级：一级 17 维可归因到单一化合物，二级 18 维由多化合物共同承载，三级 15 维受标签侧限制。</p>" +
      '<div class="ev-head"><span>感官维度</span><span>第 1 位</span><span>第 2 位</span><span>第 3 位</span><span>证据</span></div>' +
      '<div class="ev-body">' + rows + "</div></details>"
    );
  }

  /* ================= 风格：详情 ================= */
  function renderStyleDetail(el) {
    const s = SM[state.styleId];
    const vals = AX.map((a) => s.profile[a.id]);
    const keyRows = s.key
      .map((cid) => {
        const c = CM[cid];
        const d = dev(cid, s.id);
        const w = levelWord(d);
        return (
          '<div class="t-row"><div class="t-c t-name"><b>' + c.cn + "</b><i>" + c.en + "</i></div>" +
          '<div class="t-c"><span class="fam-tag" style="--fc:' + FAM[c.family].color + '">' + FAM[c.family].cn + "</span></div>" +
          '<div class="t-c">' + rangeBar(s.values[cid][0], s.values[cid][1], s.values[cid][2], c) + "</div>" +
          '<div class="t-c"><span class="dir dir-' + w[1] + '">' + (w[1] === "up" ? "▲" : w[1] === "down" ? "▼" : "·") + " " + (d > 0 ? "+" : "") + Math.round(d) + "%</span></div>" +
          '<div class="t-c attr-mini">' + attrPills(c, 3) + "</div></div>"
        );
      })
      .join("");

    const fp = (list, cls) =>
      list
        .map((x) => {
          const c = CM[x.id];
          if (!c) return "";
          const pct = clamp(Math.abs(x.d) / 2.2 * 100, 4, 100);
          const col = cls === "up" ? "linear-gradient(90deg,rgba(233,169,78,.35),#e9a94e)" : "linear-gradient(90deg,rgba(134,171,142,.35),#86ab8e)";
          return (
            '<div class="fp-item"><span>' + c.cn + '</span><span class="fp-bar"><i style="width:' + pct + "%;background:" + col + '"></i></span>' +
            '<span class="fp-d">' + (x.d > 0 ? "+" : "") + x.d.toFixed(2) + "</span></div>"
          );
        })
        .join("");

    const notes = (s.fp.notes || [])
      .map((n) => '<span class="ev">' + n.k + " <b>" + (n.d > 0 ? "+" : "") + n.d.toFixed(2) + "</b></span>")
      .join("");

    el.innerHTML =
      '<button class="line-btn" data-back style="margin-bottom:18px">← 返回风格列表</button>' +
      '<div class="d-hero"><div class="d-title"><div class="eyebrow">风格档案 · ' + s.en + "</div>" +
      "<h1>" + s.cn + "<em>" + s.en + "</em></h1>" +
      '<p class="d-desc">' + s.desc + "</p>" +
      '<div class="d-meta"><span class="tag tag-amber">' + GRP[s.group].cn + "</span>" +
      '<span class="tag">' + (s.n ? s.n + " 个样本" : "样本 n≥3") + "</span>" +
      '<span class="tag">ABV ' + s.abv + "</span>" +
      '<span class="tag tag-src">论文出处 ' + s.src + "</span></div>" +
      '<div class="note-actions" style="margin-top:10px">' +
      '<button class="solid-btn" data-lab>在化合物台打开 →</button>' +
      '<button class="line-btn" data-migrate>以此为迁移目标</button></div></div>' +
      '<div class="radar-box">' + C.radar([{ values: vals, color: "#e9a94e", width: 1.9, dotR: 2.4 }], { axes: AX, size: 340 }) + "</div></div>" +

      '<div class="metrics">' +
      metric("苦度", s.profile.bitter, "0–6") + metric("酯香·果香", s.profile.ester, "0–6") +
      metric("酒精感", s.profile.alcohol, "0–6") + metric("酒体", s.profile.body, "0–6") + "</div>" +

      '<div class="panel" style="margin-top:16px"><div class="panel-head"><div class="h2">关键风味化合物<small>Key compounds</small></div>' +
      '<span class="panel-note">含量区间为分位得分口径推算，单位按该化合物实际量纲</span></div>' +
      '<div class="table"><div class="t-row t-head"><span>化合物</span><span>化学来源</span><span>含量区间</span><span>相对基准</span><span>感官贡献</span></div>' +
      keyRows + "</div>" +
      '<div class="src-note"><b>怎么读这张表：</b>「相对基准」是该化合物在本风格中的中位含量相对 250 款样本基准的偏离，▲ 表示高于基准、▼ 表示低于基准；' +
      "感官贡献取论文中该化合物与各感官维度的关联方向与强度。点「在化合物台打开」可把这组化合物带进交互台继续增减。</div></div>" +

      '<div class="panel"><div class="panel-head"><div class="h2">化学指纹<small>Fingerprint</small></div>' +
      '<span class="panel-note">' + (s.fp.src.indexOf("表12") >= 0 ? "论文表 12 的 Cohen's d（不足处按同一口径补足）" : "跨 22 风格标准化后的 d 值") + "</span></div>" +
      '<div class="fp-grid"><div class="fp-col"><div class="fp-cap up">显著偏高</div>' + fp(s.fp.pos, "up") + "</div>" +
      '<div class="fp-col"><div class="fp-cap down">显著偏低</div>' + fp(s.fp.neg, "down") + "</div></div>" +
      (notes ? '<div class="stage-ev" style="margin-top:12px">' + notes + "</div>" : "") +
      '<div class="src-note">' + (s.fp.src.indexOf("表12") >= 0
        ? "<b>表 12 原文口径：</b>d 值为该风格相对其余样本的标准化均值差，取正向、负向各前 5 位。色度、苦度、蛋白等非化合物指标同样列入，因为它们本身就是风格判别的强指示。"
        : "<b>口径说明：</b>论文仅对 Tripel、Kriek、Lambic、Pils/Lager 四个风格给出指纹表。此处按同一 Cohen's d 定义，在各化合物上跨 22 个风格做标准化后取正负两端，可与其他风格横向比较。") +
      "</div></div>";
  }

  function metric(k, v, unit) {
    return '<div class="metric"><div class="metric-k">' + k + '</div><div class="metric-v">' + v.toFixed(1) + "<small>/ 6</small></div></div>";
  }

  /* ================= 实验室 ================= */
  /* ---------------- 调配与试饮（动画面板） ---------------- */
  function labScene(sel, s) {
    const R = window.Reactor;
    const rx = state.rx || {};
    let focusId = rx.id;
    if (focusId && rx.kind !== "remove" && sel.indexOf(focusId) < 0) focusId = null;
    if (!focusId) focusId = sel.length ? sel[0] : null;

    const c = focusId ? CM[focusId] : null;
    const score = c ? tasteScore(c) : null;
    const ex = c ? tasteEx(score) : 2;
    const fam = c ? FAM[c.family] : null;
    const color = fam ? fam.color : "#8a98a6";
    const level = sel.length ? 0.16 + 0.6 * Math.min(1, sel.length / 12) : 0.02;
    const kind = rx.kind || "sync";
    const chip = kind === "add" ? "刚加入" : kind === "remove" ? "已移除" : "";
    const chipCls = kind === "remove" ? " is-out" : "";

    return (
      '<div class="panel rx-panel">' +
      '<div class="panel-head"><div class="h2">调配与试饮<small>Mix &amp; taste</small></div>' +
      '<span class="panel-note">' + sel.length + " 种已在瓶中</span></div>" +
      '<div class="rx-wrap">' +
      '<div class="rx-stage" data-rx-stage data-score="' + (score == null ? 50 : score) +
      '" data-ex="' + ex + '" data-level="' + level.toFixed(3) +
      '" data-color="' + color + '" data-kind="' + kind + '"' +
      (rx.from ? ' data-from="' + Math.round(rx.from.x) + "," + Math.round(rx.from.y) + '"' : "") + ">" +
      (R ? R.stage() : "") + "</div>" +
      '<div class="rx-side">' +
      '<div class="rx-top"><span class="rx-kicker">口味评分</span>' +
      (chip ? '<span class="rx-chip' + chipCls + '">' + chip + "</span>" : "") + "</div>" +
      '<div class="rx-name">' + (c ? c.cn + "<i>" + c.en + "</i>" : "尚未加入化合物") + "</div>" +
      '<div class="rx-scoreline"><b class="rx-num" data-ex="' + ex + '">' + (score == null ? "—" : score) + "</b>" +
      (score == null ? "" : "<small>/100</small>") +
      (c ? '<span class="rx-verdict" data-ex="' + ex + '">' + TASTE_WORD[ex] + "</span>" : "") + "</div>" +
      '<div class="rx-meter"><i style="width:' + (score == null ? 0 : score) + '%"></i></div>' +
      '<p class="rx-hint">' +
      (c
        ? "<b>" + (fam ? fam.cn : "") + "</b> · <span>按 12 条感官轴的愉悦度加权</span>"
        : "<span>从左侧挑一个化合物，看它落进瓶里是什么味道</span>") +
      "</p></div></div></div>"
    );
  }

  function renderLab() {
    const el = $("#view-lab");
    const s = SM[state.styleId];
    const sel = state.sel.filter((id) => CM[id]);
    const groups = D.families
      .map((f) => {
        const items = D.compounds
          .filter((c) => c.family === f.id)
          .map((c) => {
            const on = sel.indexOf(c.id) >= 0;
            return (
              '<button class="cat-item' + (on ? " is-on" : "") + '" data-cid="' + c.id + '">' +
              '<span class="cat-dot" style="background:' + f.color + '"></span><span>' + c.cn + "</span>" +
              "<i>" + (on ? "已加入" : "+") + "</i></button>"
            );
          })
          .join("");
        return '<div class="cat-group"><div class="cat-group-h"><span>' + f.cn + "</span><i>" + D.compounds.filter((c) => c.family === f.id).length + "</i></div>" + items + "</div>";
      })
      .join("");

    const options = D.styles
      .map((x) => '<option value="' + x.id + '"' + (x.id === state.styleId ? " selected" : "") + ">" + x.cn + " · " + x.en + "</option>")
      .join("");

    el.innerHTML =
      '<div class="view-head"><div class="eyebrow">02 / 化合物交互 · Compound lab</div>' +
      "<h1>把配方拆成化合物<em>Build a profile</em></h1>" +
      '<p class="lede">目录里是论文涉及的 55 个风味化合物。点击加入或移除，旁边的面板会实时给出<b>每种化合物的感官属性</b>，' +
      "以及它相对所选风格的<b>影响强度与方向</b>——偏高意味着这一版比典型风格更浓，偏低则相反。</p></div>" +
      '<div class="toolbar"><div class="sel-field" style="max-width:280px;flex:1 1 240px"><label>风格语境</label>' +
      '<select id="labStyle">' + options + "</select></div>" +
      '<button class="line-btn" data-preset>载入该风格的特征组合</button>' +
      '<button class="line-btn" data-clear>清空</button></div>' +
      '<div class="lab"><div class="catalog panel"><div class="panel-head"><div class="h2">化合物目录<small>55 compounds</small></div>' +
      '<span class="panel-note">' + sel.length + " 项已选</span></div>" +
      '<div class="search" style="max-width:none;margin-bottom:10px"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4L14 14"/></svg>' +
      '<input id="cq" type="search" placeholder="按名称筛选" value="' + (state.cq || "") + '"></div>' +
      '<div class="cat-scroll" id="catScroll">' + groups + "</div></div>" +
      '<div class="lab-main">' + labScene(sel, s) + labSummary(sel, s) + labAttrs(sel, s) + labCompounds(sel, s) + "</div></div>";

    if (window.Reactor) window.Reactor.attach(el);
    if (state.rx) state.rx = { id: state.rx.id, kind: "sync", from: null };

    $("#labStyle").addEventListener("change", (e) => {
      state.styleId = e.target.value;
      state.sel = SM[state.styleId].key.slice(0, 6);
      state.rx = { id: null, kind: "sync", from: null };
      syncCrumb();
      renderLab();
    });
    const cq = $("#cq");
    if (cq) cq.addEventListener("input", (e) => {
      state.cq = e.target.value;
      filterCatalog();
    });
  }

  function filterCatalog() {
    const q = (state.cq || "").toLowerCase();
    $$("#catScroll .cat-item").forEach((it) => {
      const c = CM[it.dataset.cid];
      const hit = !q || (c.cn + c.en).toLowerCase().indexOf(q) >= 0;
      it.style.display = hit ? "" : "none";
    });
    $$("#catScroll .cat-group").forEach((g) => {
      const any = $$(".cat-item", g).some((i) => i.style.display !== "none");
      g.style.display = any ? "" : "none";
    });
  }

  function labSummary(sel, s) {
    const obj = aggScores(sel, s.id);
    const vals = AX.map((a) => obj[a.id]);
    const match = sel.length ? matchStyle(vals, s) : 0;
    const pills = sel
      .map((id) => '<span class="sel-pill">' + CM[id].cn + '<button data-rm="' + id + '" aria-label="移除">×</button></span>')
      .join("");
    return (
      '<div class="panel"><div class="panel-head"><div class="h2">当前组合<small>' + sel.length + ' compounds</small></div>' +
      '<span class="panel-note">目标风格：' + s.cn + "</span></div>" +
      (sel.length
        ? '<div class="sel-strip">' + pills + "</div>"
        : '<p class="empty-hint">还没有化合物。可以从目录逐个加入，或点「载入该风格的特征组合」。</p>') +
      '<div class="two-col" style="margin-top:16px;grid-template-columns:minmax(0,1fr) 300px;align-items:center">' +
      '<div><div class="match-box"><div class="match-num">' + (sel.length ? Math.round(match) : "—") + '<small>%</small></div>' +
      '<div class="match-txt">与本风格画像的贴合度<br><span style="color:var(--muted-2)">按 12 个感官轴的均方误差换算</span></div></div>' +
      compBar(sel) + "</div>" +
      '<div class="radar-box" style="border:0;background:none">' +
      C.radar([
        { values: AX.map((a) => s.profile[a.id]), color: "rgba(162,149,127,.85)", width: 1.2, dash: "4 4", fill: false, dots: false },
        { values: vals, color: "#e9a94e", width: 1.9, dotR: 2.2 },
      ], { axes: AX, size: 292, fontSize: 9 }) +
      "</div></div></div>"
    );
  }

  function compBar(sel) {
    if (!sel.length) return "";
    const cnt = {};
    sel.forEach((id) => { const f = CM[id].family; cnt[f] = (cnt[f] || 0) + 1; });
    const fams = D.families.filter((f) => cnt[f.id]);
    const total = sel.length;
    const bars = C.stack(fams.map((f) => ({ v: cnt[f.id], color: f.color })), { width: 520, height: 8 });
    const legend = fams
      .map((f) => '<span><i style="background:' + f.color + '"></i>' + f.cn + " " + Math.round((cnt[f.id] / total) * 100) + "%</span>")
      .join("");
    return '<div style="margin-top:18px"><div class="metric-k">来源构成</div>' +
      '<div style="margin:8px 0 8px">' + bars + "</div>" +
      '<div class="axis-legend" style="gap:12px">' + legend + "</div></div>";
  }

  function aggScores(ids, sid) {
    const out = {};
    AX.forEach((a) => {
      let sum = 0;
      ids.forEach((id) => {
        const c = CM[id];
        const w = weightOf(c, sid);
        sum += Math.max(0, c.sens[a.id] || 0) * w;
      });
      out[a.id] = 6 * (1 - Math.exp(-0.55 * sum));
    });
    return out;
  }

  function matchStyle(vals, s) {
    let e = 0;
    AX.forEach((a, i) => { e += Math.abs(vals[i] - s.profile[a.id]); });
    return clamp(100 * (1 - (e / AX.length) / 6 * 1.35), 0, 100);
  }

  function labAttrs(sel, s) {
    const obj = aggScores(sel, s.id);
    const bars = AX.map((a) => {
      const v = obj[a.id];
      const w = (v / 6) * 100;
      const col = v > 3.6 ? "#e9a94e" : v > 2.2 ? "rgba(233,169,78,.75)" : "rgba(134,171,142,.75)";
      return '<div class="attr-row"><span class="attr-name">' + a.cn + '</span><span class="attr-track"><i style="width:' + w + "%;background:" + col + '"></i></span>' +
        '<span class="attr-val">' + v.toFixed(1) + "</span></div>";
    }).join("");
    const peak = AX.map((a) => [a, obj[a.id]]).sort((p, q) => q[1] - p[1])[0];
    return (
      '<div class="panel"><div class="panel-head"><div class="h2">组合的感官属性<small>Sensory attributes</small></div>' +
      '<span class="panel-note">' + (sel.length ? "主导轴：" + peak[0].cn + " " + peak[1].toFixed(1) + " / 6" : "等待选择化合物") + "</span></div>" +
      '<div class="attr-bars">' + bars + "</div></div>"
    );
  }

  function labCompounds(sel, s) {
    if (!sel.length) return '<div class="panel"><div class="h2">逐化合物的影响<small>Per compound</small></div><p class="empty-hint">选中化合物后，这里会逐一列出它的感官属性、在「' + s.cn + "」中的含量位置与影响方向。</p></div>";
    const maxAbs = Math.max.apply(null, sel.map((id) => Math.abs(dev(id, s.id))).concat([1]));
    const rows = sel
      .slice()
      .sort((a, b) => Math.abs(dev(b, s.id)) - Math.abs(dev(a, s.id)))
      .map((id) => {
        const c = CM[id];
        const d = dev(id, s.id);
        const w = levelWord(d);
        const pct = clamp(Math.abs(d) / maxAbs * 50, 2, 50);
        const v = s.values[id];
        return (
          '<div class="cp-card"><div class="cp-head"><span class="cat-dot" style="background:' + FAM[c.family].color + '"></span>' +
          "<b>" + c.cn + "</b><i>" + c.en + "</i>" +
          '<span class="cp-conc">' + rangeText(v[0], v[2], c.unit) + "</span>" +
          '<button class="cp-x" data-rm="' + id + '" aria-label="移除">×</button></div>' +
          '<div class="cp-body"><div class="attr-mini">' + attrPills(c, 4) + "</div>" +
          '<div class="cp-imp"><span class="dir dir-' + w[1] + '">' + (w[1] === "up" ? "▲" : w[1] === "down" ? "▼" : "—") + " " + w[0] + "</span>" +
          '<span class="impact-bar"><i class="' + (d >= 0 ? "pos" : "neg") + '" style="width:' + pct + '%"></i></span>' +
          '<span class="impact-val">' + (d > 0 ? "+" : "") + Math.round(d) + "%</span></div>" +
          '<p class="cp-note">' + c.note + "</p></div></div>"
        );
      })
      .join("");
    return '<div class="panel"><div class="panel-head"><div class="h2">逐化合物的影响<small>Per compound</small></div>' +
      '<span class="panel-note">方向相对于「' + s.cn + "」的样本基准</span></div>" + rows + "</div>";
  }

  function labClick(e) {
    const rm = e.target.closest("[data-rm]");
    if (rm) { toggle(rm.dataset.rm, rm); return; }
    const item = e.target.closest("[data-cid]");
    if (item) { toggle(item.dataset.cid, item); return; }
    if (e.target.closest("[data-preset]")) {
      state.sel = SM[state.styleId].key.slice(0, 8);
      state.rx = { id: null, kind: "sync", from: null };
      renderLab();
      return;
    }
    if (e.target.closest("[data-clear]")) { state.sel = []; state.rx = { id: null, kind: "sync", from: null }; renderLab(); }
  }

  function toggle(id, el) {
    const i = state.sel.indexOf(id);
    if (i >= 0) {
      state.sel.splice(i, 1);
      state.rx = { id: id, kind: "remove", from: null };
    } else {
      state.sel.push(id);
      const r = el ? el.getBoundingClientRect() : null;
      state.rx = {
        id: id,
        kind: "add",
        from: r ? { x: r.left + Math.min(r.width * 0.42, 120), y: r.top + r.height / 2 } : null,
      };
    }
    renderLab();
    persist();
  }

  /* ================= 口味生成 ================= */
  const ARO_SENT = [
    "先由{A}的{a}起势，{B}随后补上{b}，{C}把{c}垫在背景里。",
    "开瓶是{A}的{a}，紧接着{B}的{b}涌上来，{C}在尾端添了一层{c}。",
    "前段由{A}主导，{a}铺开；中段{B}的{b}接续，{C}让{c}始终在场。",
  ];
  const PAL_SENT = [
    "入口{body}，{alc}，{bit}。",
    "质地{body}，{alc}；{bit}，让整体不至于失焦。",
    "{body}是这一口的基调，{alc}，{bit}，结构由此立住。",
  ];
  const FIN_SENT = [
    "主导者是{name}，{cat}停留得最久，{tail}。",
    "收口之后，{cat}还在，主要来自{name}；{tail}。",
    "尾段是{name}带来的{cat}，{tail}。",
  ];
  const FIN_WORD = {
    bitter: "苦味与干爽感", roast: "焦香与焦苦", sour: "明亮的酸感", alcohol: "酒精的暖意",
    ester: "果香的甜润", phenol: "酚香的辛麻", aged: "氧化后的干涩", malt: "麦芽的甜香",
    floral: "花香的余韵", hop: "草本的苦香", body: "圆润的口感", sulfur: "硫味",
  };

  function buildNote(ids, s, seed) {
    if (window.ATLAS_LANG === "en") return buildNoteEn(ids, s, seed);
    const list = ids.map((id) => CM[id]).filter(Boolean);
    if (!list.length) return null;
    const scored = list.map((c) => ({ c: c, w: weightOf(c, s.id) })).sort((a, b) => b.w - a.w);
    const vals = aggScores(ids, s.id);
    const tot = scored.reduce((x, y) => x + y.w, 0) || 1;

    const aromaRank = scored.slice().sort((a, b) => aromWeight(b.c) - aromWeight(a.c));
    const top3 = aromaRank.slice(0, 3).map((x) => x.c);
    const fill = (tpl, arr) =>
      tpl
        .replace("{A}", hl(arr[0])).replace("{a}", arr[0].aroma)
        .replace("{B}", hl(arr[1] || arr[0])).replace("{b}", (arr[1] || arr[0]).aroma)
        .replace("{C}", hl(arr[2] || arr[0])).replace("{c}", (arr[2] || arr[0]).aroma);

    let aroma;
    if (top3.length >= 3) aroma = fill(ARO_SENT[seed % ARO_SENT.length], top3);
    else if (top3.length === 2) aroma = "由" + hl(top3[0]) + "的" + top3[0].aroma + "主导，" + hl(top3[1]) + "补上" + top3[1].aroma + "。";
    else aroma = "几乎由" + hl(top3[0]) + "一手构成，" + top3[0].aroma + "从杯口一直铺到鼻腔。";

    const body = vals.body > 4.4 ? "厚实饱满、带一点黏度" : vals.body > 3.4 ? "中等偏厚、质地圆润" : vals.body > 2.4 ? "中等酒体、质地干净" : "轻盈薄爽";
    const alc = vals.alcohol > 4.4 ? "酒精感强而温暖，几乎能感到它的重量" : vals.alcohol > 3.4 ? "酒精感明确，暖意从舌根升到鼻腔" : vals.alcohol > 2.4 ? "酒精感温和，不抢风味" : "几乎感觉不到酒精";
    const bit = vals.bitter > 4.4 ? "苦味有力且收得干净" : vals.bitter > 3.4 ? "苦味清晰，撑住收口" : vals.bitter > 2.4 ? "苦味克制，只在尾段露头" : "苦味很轻";
    const sour = vals.sour > 4.2 ? "，酸度明亮地主宰中段" : vals.sour > 3.0 ? "，酸度清晰可辨" : vals.sour > 2.0 ? "，有一点点酸提亮" : "";
    const palate = PAL_SENT[seed % PAL_SENT.length].replace("{body}", body).replace("{alc}", alc).replace("{bit}", bit + sour);

    const finC = scored.slice().sort((a, b) => finWeight(b.c) - finWeight(a.c))[0].c;
    const finAxis = ["bitter", "roast", "alcohol", "sour", "phenol", "ester", "aged", "malt", "floral", "hop", "body", "sulfur"]
      .slice()
      .sort((x, y) => (vals[y] * (finC.sens[y] || 0.05)) - (vals[x] * (finC.sens[x] || 0.05)))[0];
    const catWord = FIN_WORD[finAxis] || "风味";
    const tailWord = vals.roast > 3.4 ? "焦香与苦味一起缓缓退去" : vals.sour > 4 ? "酸味退得比想象中慢" : vals.alcohol > 4 ? "暖意留在喉咙，果香已经散尽" : "风味收得利落，不留黏腻";
    const finish = FIN_SENT[seed % FIN_SENT.length].replace("{name}", hl(finC)).replace("{cat}", catWord).replace("{tail}", tailWord);

    let paras = [aroma, palate, finish];
    let text = paras.join("");
    const len = (t) => t.replace(/<[^>]+>/g, "").replace(/[\s，。；：、,.!?;:]/g, "").length;
    if (len(text) < 100) {
      const extra = "整体" + balanceWord(vals) + "，与" + s.cn + "的典型形象" + (matchStyle(AX.map((a) => vals[a.id]), s) > 78 ? "相当接近" : "略有偏离") + "。";
      paras[2] = paras[2] + extra;
      text = paras.join("");
    }
    if (len(text) > 200) {
      text = [aroma, palate].join("");
    }
    const chars = len(text);
    const dom = scored.slice(0, 4).map((x) => ({ c: x.c, share: (x.w / tot) * 100 }));

    const parts = {
      aroma: top3.slice(0, 3).map((c) => c.cn),
      palate: [["酒体", vals.body], ["酒精", vals.alcohol], ["苦味", vals.bitter], ["酸度", vals.sour]],
      finish: { name: finC.cn, cat: catWord },
    };
    return { paras: paras, text: text, chars: chars, dom: dom, vals: vals, parts: parts,
             match: matchStyle(AX.map((a) => vals[a.id]), s) };
  }

  const EN_FIN = {
    bitter: "the bitterness and dry grip", roast: "roast and char", sour: "the bright acidity",
    alcohol: "the warmth of alcohol", ester: "the sweet fruit of esters", phenol: "the prickly phenols",
    aged: "the dryness of age", malt: "malt sweetness", floral: "the floral tail",
    hop: "the herbal bitterness of hops", body: "the roundness of body", sulfur: "a sulfur edge",
  };

  function buildNoteEn(ids, s, seed) {
    const list = ids.map((id) => CM[id]).filter(Boolean);
    if (!list.length) return null;
    const T = (window.AtlasI18n && window.AtlasI18n.tr) || function (x) { return x; };
    const scored = list.map((c) => ({ c: c, w: weightOf(c, s.id) })).sort((a, b) => b.w - a.w);
    const vals = aggScores(ids, s.id);
    const tot = scored.reduce((x, y) => x + y.w, 0) || 1;

    const aromRank = scored.slice().sort((a, b) => aromWeight(b.c) - aromWeight(a.c));
    const top3 = aromRank.slice(0, 3).map((x) => x.c);
    const nm = (c) =>
      '<span class="hl" data-tip="' + String(T(c.note) || c.note).replace(/"/g, "&quot;") + '">' + c.en + "</span>";
    const ds = (c) => {
      const t = T(c.aroma) || c.aroma;
      // 句中首字母小写（DMS、CO₂ 这类全大写缩写保持原样）
      return t.replace(/^([A-Z])(?=[a-z])/, (m) => m.toLowerCase());
    };

    let aroma;
    if (top3.length >= 3) {
      aroma = [
        "It opens on " + nm(top3[0]) + " with " + ds(top3[0]) + ", " + nm(top3[1]) + " layers in " + ds(top3[1]) +
          ", and " + nm(top3[2]) + " keeps " + ds(top3[2]) + " underneath.",
        "The nose starts on " + nm(top3[0]) + " — " + ds(top3[0]) + " — then " + nm(top3[1]) + " adds " + ds(top3[1]) +
          ", with " + nm(top3[2]) + " holding " + ds(top3[2]) + " in the background.",
        "First comes " + nm(top3[0]) + " (" + ds(top3[0]) + "), " + nm(top3[1]) + " follows with " + ds(top3[1]) +
          ", and " + nm(top3[2]) + " keeps " + ds(top3[2]) + " in play.",
      ][seed % 3];
    } else if (top3.length === 2) {
      aroma = "The nose is led by " + nm(top3[0]) + " (" + ds(top3[0]) + "), with " + nm(top3[1]) + " adding " + ds(top3[1]) + ".";
    } else {
      aroma = "The nose is almost entirely " + nm(top3[0]) + ": " + ds(top3[0]) + ", from the rim all the way back.";
    }

    const body = vals.body > 4.4 ? "full and almost syrupy" : vals.body > 3.4 ? "medium-full and rounded" : vals.body > 2.4 ? "medium bodied and clean" : "light and crisp";
    const alc = vals.alcohol > 4.4 ? "the alcohol is warm and weighty" : vals.alcohol > 3.4 ? "alcohol is clear, its warmth rising into the nose" : vals.alcohol > 2.4 ? "alcohol stays in the background" : "alcohol is barely noticeable";
    const bit = vals.bitter > 4.4 ? "bitterness is firm and clean" : vals.bitter > 3.4 ? "bitterness is clear and carries the finish" : vals.bitter > 2.4 ? "bitterness is restrained, showing only at the end" : "bitterness is very light";
    const sour = vals.sour > 4.2 ? ", with bright acidity running through the middle" : vals.sour > 3.0 ? ", with acidity clearly present" : vals.sour > 2.0 ? ", lifted by a touch of acidity" : "";
    const palate = "On the palate it is " + body + "; " + alc + ", and " + bit + sour + ".";

    const finC = scored.slice().sort((a, b) => finWeight(b.c) - finWeight(a.c))[0].c;
    const finAxis = ["bitter", "roast", "alcohol", "sour", "phenol", "ester", "aged", "malt", "floral", "hop", "body", "sulfur"]
      .slice()
      .sort((x, y) => (vals[y] * (finC.sens[y] || 0.05)) - (vals[x] * (finC.sens[x] || 0.05)))[0];
    const catWord = EN_FIN[finAxis] || "the flavour";
    const tail = vals.roast > 3.4 ? "roast and bitterness fade together" : vals.sour > 4 ? "the acidity clears more slowly than expected" : vals.alcohol > 4 ? "warmth stays in the throat after the fruit is gone" : "it ends clean, without cloying";
    const finish = [
      "The finish belongs to " + nm(finC) + ": " + catWord + " lingers longest, and " + tail + ".",
      "After swallowing, " + catWord + " remains, carried by " + nm(finC) + "; " + tail + ".",
      "The tail is " + catWord + " from " + nm(finC) + ", and " + tail + ".",
    ][seed % 3];

    const match = matchStyle(AX.map((a) => vals[a.id]), s);
    let paras = [aroma, palate, finish];
    let text = paras.join(" ");
    const words = (t) => (t.replace(/<[^>]+>/g, " ").match(/[A-Za-z][A-Za-z'\-]*/g) || []).length;
    if (words(text) < 70) {
      const bal = vals.body > 3.9 ? "dense and intense" : vals.body > 2.9 ? "well proportioned" : "restrained and crisp";
      paras[2] = paras[2] + " Overall it reads as " + bal + ", " + (match > 78 ? "very close to" : "a little off") + " the typical " + s.en + ".";
      text = paras.join(" ");
    }
    const chars = words(text);
    const dom = scored.slice(0, 4).map((x) => ({ c: x.c, share: (x.w / tot) * 100 }));
    const parts = {
      aroma: top3.slice(0, 3).map((c) => c.en),
      palate: [["Body", vals.body], ["Alcohol", vals.alcohol], ["Bitterness", vals.bitter], ["Acidity", vals.sour]],
      finish: { name: finC.en, cat: catWord },
    };
    return { paras: paras, text: text, chars: chars, dom: dom, vals: vals, parts: parts, match: match };
  }

  function aromWeight(c) {
    const k = ["ester", "hop", "floral", "malt", "roast", "phenol"];
    return k.reduce((s, a) => s + Math.max(0, c.sens[a] || 0), 0) * c.imp;
  }
  function finWeight(c) {
    const k = ["bitter", "roast", "aged", "alcohol", "sour", "phenol"];
    return k.reduce((s, a) => s + Math.max(0, c.sens[a] || 0), 0) * c.imp;
  }
  function balanceWord(v) {
    const avg = AX.reduce((s, a) => s + v[a.id], 0) / AX.length;
    if (avg > 3.9) return "浓烈而密集";
    if (avg > 2.9) return "结构匀称";
    return "克制而清爽";
  }
  function hl(c) {
    return '<span class="hl" data-tip="' + c.note.replace(/"/g, "&quot;") + '">' + c.cn + "</span>";
  }

  function noteParts(note) {
    if (!note) return "";
    const chips = note.parts.aroma.map((n) => '<span class="attr-pill">' + n + "</span>").join("");
    const pal = note.parts.palate
      .filter((x) => x[1] > 0.4)
      .map((x) => '<span class="ev">' + x[0] + " <b>" + x[1].toFixed(1) + "</b></span>")
      .join("");
    return (
      '<div class="panel"><div class="panel-head"><div class="h2">描述构成<small>How it was built</small></div>' +
      '<span class="panel-note">三段各由什么支撑</span></div>' +
      '<div class="part-row"><span class="part-k">香气</span><span class="attr-mini">' + chips + "</span></div>" +
      '<div class="part-row"><span class="part-k">口感</span><span class="attr-mini">' + pal + "</span></div>" +
      '<div class="part-row"><span class="part-k">余味</span><span class="attr-mini"><span class="attr-pill">' +
      note.parts.finish.name + " · " + note.parts.finish.cat + "</span></span></div>" +
      '<p class="panel-note" style="margin:10px 0 0">香气段取香气类权重最高的三个化合物，按各自的气味描述拼接；口感段读取 12 条感官轴的聚合分值；余味段取余味类权重最高的化合物及其主导感官。</p></div>'
    );
  }

  function renderNote() {
    const el = $("#view-note");
    const s = SM[state.styleId];
    const ids = state.sel.length ? state.sel : s.key.slice(0, 8);
    const note = buildNote(ids, s, state.seed);
    const paras = note
      ? note.paras
        .map((p, i) => '<p><span class="note-sec">' + ["香气", "口感", "余味"][i] + "</span>" + p + "</p>")
        .join("")
      : '<p class="empty-hint">还没有可用的化合物组合。</p>';

    const dom = note
      ? note.dom
        .map((x, i) => (
          '<div class="dom-row"><span class="dom-rank">' + (i + 1) + "</span>" +
          '<span class="dom-name">' + x.c.cn + "<i>" + x.c.aroma + "</i></span>" +
          '<span class="dom-share">' + Math.round(x.share) + "%</span>" +
          '<span class="dom-bar"><i style="width:' + clamp(x.share * 2.4, 6, 100) + '%"></i></span></div>'
        ))
        .join("")
      : "";

    el.innerHTML =
      '<div class="view-head"><div class="eyebrow">03 / 口味生成 · Tasting note</div>' +
      "<h1>让化合物自己开口<em>Tasting note</em></h1>" +
      '<p class="lede">根据当前化合物组合与它们在<b>' + s.cn + "</b>中的含量位置，生成一段 <b>100–200 字</b>的整体风味描述，" +
      "覆盖香气、口感与余味，并标出起主导作用的化合物。描述由规则引擎生成，可反复换一种写法。</p></div>" +
      '<div class="note-wrap"><div class="lab-main"><div class="note-card"><div class="note-kicker"><span>Tasting note · 品鉴笔记</span><b>' + (note ? note.chars : 0) + " 字</b></div>" +
      '<h2 class="note-title">' + s.cn + " · " + (state.sel.length ? state.sel.length + " 种化合物组合" : "风格典型组合") + "</h2>" +
      '<div class="note-sub">' + s.en + " · " + GRP[s.group].cn + "</div>" +
      '<div class="note-body" id="noteBody">' + paras + "</div>" +
      '<div class="note-foot"><span>主导化合物已用琥珀色下划线标出，悬停可看机制说明</span>' +
      '<span class="note-actions"><button class="solid-btn" data-reseed>换一种写法</button>' +
      '<button class="line-btn" data-copy>复制文本</button></span></div></div>' + noteParts(note) +
      '<div class="panel"><div class="panel-head"><div class="h2">文本口径<small>Method</small></div></div>' +
      '<p style="font-size:11.5px;line-height:1.85;color:var(--muted);margin:0">描述由「化合物 → 感官轴 → 句式」三层规则拼装：先按重要性、含量位置与感官强度计算权重，' +
      "再取香气类权重最高的三种化合物生成前段，中段读取苦味、酒体、酒精与酸度的聚合分值，尾段选择余味最长的化合物。字数控制在 100–200 之间。</p></div></div>" +
      '<div class="lab-main"><div class="panel"><div class="panel-head"><div class="h2">风格贴合度<small>Match</small></div></div>' +
      '<div class="match-box"><div class="match-num">' + Math.round(note ? note.match : 0) + '<small>%</small></div>' +
      '<div class="match-txt">与「' + s.cn + '」的 50 维画像相比<br><span style="color:var(--muted-2)">12 轴近似，仅作参考</span></div></div>' +
      '<div class="radar-box" style="border:0;background:none;padding:0;margin-top:14px">' + C.radar([
        { values: AX.map((a) => s.profile[a.id]), color: "rgba(162,149,127,.8)", width: 1.1, dash: "4 4", fill: false, dots: false },
        { values: AX.map((a) => (note ? note.vals[a.id] : 0)), color: "#e9a94e", width: 1.8, dotR: 2 },
      ], { axes: AX, size: 268, fontSize: 8.5 }) + "</div></div>" +
      '<div class="panel"><div class="panel-head"><div class="h2">主导化合物<small>Key drivers</small></div>' +
      '<span class="panel-note">按权重占比</span></div><div class="dom-list">' + dom + "</div></div></div></div>";

  }

  /* ================= 溯源 ================= */
  function renderOrigin() {
    const el = $("#view-origin");
    const P = D.paper;
    const T = P.tripel;
    const ax = P.axes.tripel;
    const s = SM.tripel;

    const stages = [
      {
        t: "原料", en: "Grist",
        d: "以淡色皮尔森麦芽为主体，另加最高 20% 的蔗糖或葡萄糖。可发酵糖比例被刻意抬高，色度压在 4–6 EBC，焙烤麦芽几乎不参与。",
        ev: [["色度", "-0.71"], ["糠酸乙酯", "-0.98"], ["甲基吡嗪", "-0.90"], ["4-乙基愈创木酚", "-0.88"]],
      },
      {
        t: "糖化", en: "Mashing",
        d: "低温蛋白休止后，在 62–65 °C 长时间糖化，追求高可发酵性与低糊精。麦汁里可被酵母利用的糖多，留给酒体的残糖少。",
        ev: [["乙醇", "+0.190"], ["甘油", "+2.08"], ["麦芽甜香", "2.6 / 6"]],
      },
      {
        t: "发酵", en: "Fermentation",
        d: "18–22 °C 高温发酵，高发酵度酵母将糖迅速转成乙醇与酯。乙酸酯与脂肪酸乙酯同步上升，构成三料最容易被认出的果香。",
        ev: [["乙酸乙酯", "+0.219"], ["异戊醇", "+0.159"], ["乙酸异戊酯", "d 1.02"], ["乙酸异丁酯", "d 0.76"]],
      },
      {
        t: "瓶中熟化", en: "Bottle conditioning",
        d: "装瓶时补糖进行二次发酵，2–4 周冷储。碳酸化充分、硫化物挥发，苦味与酒精被气泡托起，收口反而显得干爽。",
        ev: [["二氧化碳", "5.7 g/L"], ["DMS 比值", "≤ 1"], ["判别概率", "0.384→0.364"]],
      },
    ];

    const chain = [
      ["淡色麦芽 + 20% 糖", "色度 4–6 EBC、焙烤类缺席", "干净底色，无焦糖与烟熏"],
      ["高可发酵性麦汁", "乙醇 +0.190、甘油 +2.08", "酒体轻，酒精却温暖"],
      ["高温发酵 / 高发酵度", "乙酸乙酯 +0.219、异戊醇 +0.159", "饱满的梨与香蕉果香"],
      ["贵族酒花、低投放量", "里那醇、二氢-β-松油醇", "苦味干净，花香在背景"],
      ["瓶中二次发酵", "CO₂ 充足、SO₂ 偏低、DMS 不升", "起泡活跃，收口干爽"],
    ]
      .map(
        (r) =>
          '<div class="chain-row"><div class="flow-node">' + r[0] + "</div><div class=\"flow-arrow\">→</div>" +
          '<div class="flow-node mid">' + r[1] + '</div><div class="flow-arrow">→</div><div class="flow-node res">' + r[2] + "</div></div>"
      )
      .join("");

    const shifts = T.shifts
      .map(
        (x, i) =>
          '<div class="shift-row"><span class="sh-rank">' + (i + 1) + "</span><span class=\"sh-name\">" + x[0] + "<i>" + x[1] + "</i></span>" +
          '<span class="sh-src">' + x[2] + "</span>" +
          '<span class="fp-bar" style="width:100%"><i style="width:' + (x[3] / 2.6) * 100 + "%;background:linear-gradient(90deg,rgba(233,169,78,.3),#e9a94e)\"></i></span>" +
          '<span class="sh-v">+' + x[3].toFixed(2) + "</span></div>"
      )
      .join("");

    const mixCols = ["#e9a94e", "#86ab8e", "#cf8452", "#a98bc0", "#c06b84"];
    const mix = T.source_mix
      .map((x, i) => '<span><i style="background:' + mixCols[i] + '"></i>' + x[0] + " " + x[1].toFixed(1) + "%</span>")
      .join("");

    el.innerHTML =
      '<div class="view-head"><div class="eyebrow">04 / 风格溯源 · Origin</div>' +
      "<h1>三料是怎么长出来的<em>Anatomy of a Tripel</em></h1>" +
      '<p class="lede">论文第三问把风格写成一条有化学含义的轴：从皮尔森/拉格的质心出发，沿 <b>u<sub>T</sub></b> 方向移动 ' +
      "<b>11.57</b> 个单位，就到达三料的典型位置。这条轴上的每一个位移，都能落回具体的原料与工艺动作。</p></div>" +

      '<div class="kpis" style="margin-bottom:16px">' +
      kpi("风格轴长", "9.27", "Tripel ↔ Pils/Lager 质心距离") +
      kpi("所需位移", "11.57", "源中位 −8.78 → 目标中位 +2.79") +
      kpi("缺陷代价", "+1.3%", "内嵌约束后位移仅增 1.3%") +
      kpi("风格判别", "0.974", "Tripel / Pils 二分类准确率") + "</div>" +

      '<div class="origin-grid"><div class="panel"><div class="panel-head"><div class="h2">四个工艺阶段<small>Process</small></div>' +
      '<span class="panel-note">括号内为论文表 12 / 表 14 / 7.6.1 的数值</span></div><div class="stage-list">' +
      stages
        .map(
          (st, i) =>
            '<div class="stage"><div class="stage-no">' + (i + 1) + "</div><div class=\"stage-body\">" +
            '<div class="stage-t">' + st.t + "<span>" + st.en + "</span></div>" +
            '<p class="stage-d">' + st.d + "</p><div class=\"stage-ev\">" +
            st.ev.map((e) => '<span class="ev">' + e[0] + " <b>" + e[1] + "</b></span>").join("") +
            "</div></div></div>"
        )
        .join("") + "</div></div>" +

      '<div class="lab-main"><div class="panel"><div class="panel-head"><div class="h2">风格轴上的位置<small>Style axis</small></div></div>' +
      '<div class="axis-plot">' + C.axisPlot({
        min: -11, max: 13, width: 600,
        targetBand: [ax.tgt_p10, 8.5],
        arrow: [ax.src_median, ax.tgt_median, "11.57"],
        marks: [
          { v: ax.src_median, label: "Pils/Lager 中位 −8.78", color: "#86ab8e" },
          { v: ax.tgt_median, label: "Tripel 中位 +2.79", color: "#e9a94e", anchor: "end" },
        ],
      }) + "</div>" +
      '<div class="axis-legend"><span><i style="background:#86ab8e"></i>源风格质心投影</span>' +
      '<span><i style="background:#e9a94e"></i>目标风格中位</span>' +
      '<span><i style="background:rgba(236,223,203,.45)"></i>虚线为目标 10% 分位 +1.25（达标线）</span></div>' +
      '<p class="panel-note" style="margin-top:6px">轴长 9.27 为两风格质心在 226 维空间中的距离；所需位移 11.57 是把源样本推到目标中位所需的欧氏移动量，与风格内部离散度（均方根约 12）同一量级——跨风格改造更接近重写而非微调。</p></div>' +

      '<div class="panel"><div class="panel-head"><div class="h2">感官画像<small>Profile</small></div>' +
      '<span class="panel-note">0–6 分</span></div>' +
      C.radar([{ values: AX.map((a) => s.profile[a.id]), color: "#e9a94e", width: 1.8, dotR: 2.2 }], { axes: AX, size: 300, fontSize: 9 }) + "</div></div></div>" +

      '<div class="panel" style="margin-top:16px"><div class="panel-head"><div class="h2">原料、工艺与化合物如何共同决定风味<small>Causal chain</small></div>' +
      '<span class="panel-note">左：工艺动作 · 中：化合物响应 · 右：感官结果</span></div>' + chain + "</div>" +

      '<div class="two-col" style="margin-top:16px">' +
      '<div class="panel"><div class="panel-head"><div class="h2">化学指纹<small>表 12 · Cohen\u2019s d</small></div></div>' +
      '<div class="fp-grid"><div class="fp-col"><div class="fp-cap up">显著偏高</div>' +
      s.fp.pos.map((x) => fpItem(x, "#e9a94e")).join("") + "</div>" +
      '<div class="fp-col"><div class="fp-cap down">显著偏低</div>' +
      s.fp.neg.map((x) => fpItem(x, "#86ab8e")).join("") + "</div></div></div>" +

      '<div class="panel"><div class="panel-head"><div class="h2">位移最大的化合物<small>表 14</small></div>' +
      '<span class="panel-note">11 个供体平均</span></div><div class="shift-list">' + shifts + "</div>" +
      '<div class="src-note" style="margin-top:12px">前 10 位中有 8 个是酵母代谢产物、1 个来自酒花（里那醇）、1 个来自野生菌群（乳酸）。按来源汇总，' +
      "位移的 49.0% 落在酵母代谢物、26.1% 落在酒花萜烯——这正是把一款拉格改造成三料应有的动作。</div>" +
      '<div style="margin-top:12px">' + C.stack(T.source_mix.map((x, i) => ({ v: x[1], color: mixCols[i] })), { width: 520, height: 10 }) + "</div>" +
      '<div class="axis-legend">' + mix + "</div></div></div>" +

      '<div class="panel" style="margin-top:16px"><div class="panel-head"><div class="h2">稀疏化路径<small>Sparsity</small></div>' +
      '<span class="panel-note">在目标中加入 ℓ₁ 项后，改动面可进一步收缩</span></div>' +
      '<div class="metrics" style="grid-template-columns:repeat(6,1fr)">' +
      T.sparse.map((x) => '<div class="metric"><div class="metric-k">λ = ' + x[0].toFixed(2) + '</div><div class="metric-v">' + x[3].toFixed(2) + "</div><div class=\"metric-k\" style=\"margin-top:2px\">非零 " + x[1] + " · &gt;0.5 " + x[2] + "</div></div>").join("") +
      "</div>" +
      '<div class="src-note">λ 由 0 增至 0.30 时，非零位移化合物由 216 降到 150、|Δz| &gt; 0.5 的由 93 降到 72，位移只增加 1.8%（11.74 → 11.96），且仍全部达到目标水平。' +
      "如果要把方案交给酿造端执行，这条路径比全谱调整更可操作。</div></div>" +

      '<div class="panel" style="margin-top:16px"><div class="panel-head"><div class="h2">论文如何验证这一结论<small>Evidence</small></div></div>' +
      '<div class="kpis">' +
      kpi("生成风格保真", "0.766", "判别器把生成谱判为目标风格的比例") +
      kpi("覆盖比", "0.991", "生成分布覆盖真实尾部的程度") +
      kpi("画像形状相关", "0.827", "22 风格平均，bootstrap [0.766, 0.879]") +
      kpi("缺陷浓度比", "≤ 1.00", "11 个供体全部不恶化") + "</div>" +
      '<div class="src-note"><b>可直接复核的数：</b>真实留出样本的 22 类判别召回率为 0.523，生成样本的风格保真 0.766 高于它，说明生成谱偏“典型”；' +
      "检出率偏差仍有 0.105，保原子机制只减轻、未消除离散检出结构的误差。这些限定同样适用于本页的画像展示。</div></div>";
  }

  function kpi(k, v, n) {
    return '<div class="kpi"><div class="kpi-k">' + k + '</div><div class="kpi-v">' + v + '</div><div class="kpi-n">' + n + "</div></div>";
  }
  function fpItem(x, col) {
    const c = CM[x.id];
    if (!c) return "";
    const pct = clamp(Math.abs(x.d) / 2.2 * 100, 4, 100);
    return '<div class="fp-item"><span>' + c.cn + '</span><span class="fp-bar"><i style="width:' + pct + "%;background:linear-gradient(90deg," + col + "55," + col + ')"></i></span>' +
      '<span class="fp-d">' + (x.d > 0 ? "+" : "") + x.d.toFixed(2) + "</span></div>";
  }

  /* ================= 迁移 ================= */
  function pairData(fromId, toId) {
    const a = SM[fromId], b = SM[toId];
    const items = D.compounds.map((c) => {
      const sv = a.values[c.id][1], tv = b.values[c.id][1];
      const rel = (tv - sv) / c.ref;
      let op = "";
      if (sv < c.ref * 0.09 && tv > c.ref * 0.22) op = "add";
      else if (tv < c.ref * 0.09 && sv > c.ref * 0.22) op = "del";
      else if (tv > sv * 1.16) op = "up";
      else if (tv < sv * 0.86) op = "down";
      return { c: c, s: sv, t: tv, d: tv - sv, rel: rel, op: op, abs: Math.abs(rel) };
    });
    items.forEach((x) => { x.score = x.abs * (x.c.imp || 0.35); });
    const moves = items.filter((x) => x.op).sort((x, y) => y.score - x.score);
    const add = moves.filter((x) => x.op === "add" || x.op === "up");
    const del = moves.filter((x) => x.op === "del" || x.op === "down");
    const big = items.filter((x) => Math.abs(x.d) > x.c.ref * 0.18).length;
    return { a: a, b: b, items: items, moves: moves, add: add, del: del, big: big };
  }

  function renderTransfer() {
    const el = $("#view-transfer");
    const pd = pairData(state.from, state.to);
    const a = pd.a, b = pd.b;
    const paperPair = state.from === "pils" && state.to === "tripel";
    const axInfo = paperPair ? D.paper.axes.tripel : null;

    const sel = (id, cur) =>
      D.styles.map((s) => '<option value="' + s.id + '"' + (s.id === cur ? " selected" : "") + ">" + s.cn + " · " + s.en + "</option>").join("");

    const tabs = [["list", "干预清单"], ["path", "迁移路径"], ["diff", "差值对比"]]
      .map((t) => '<button data-tab="' + t[0] + '"' + (state.tab === t[0] ? ' class="is-on"' : "") + ">" + t[1] + "</button>")
      .join("");

    el.innerHTML =
      '<div class="view-head"><div class="eyebrow">05 / 风格迁移 · Style transfer</div>' +
      "<h1>从一种风格改造成另一种<em>Style transfer</em></h1>" +
      '<p class="lede">迁移沿目标与源质心之差的方向进行，求的是<b>带缺陷上限的最小干预解</b>：在 DMS、双乙酰、4VG、反式-2-壬烯醛不高于源样本的前提下，' +
      "用最小的欧氏位移把谱推到目标风格。下面列出需要增加、删减与调整的化合物及其用量区间。</p></div>" +

      '<div class="transfer-bar"><div class="sel-field"><label>源风格 Source</label><select id="fromSel">' + sel(a.id, state.from) + "</select></div>" +
      '<button class="swap-btn" data-swap aria-label="交换">⇄</button>' +
      '<div class="sel-field"><label>目标风格 Target</label><select id="toSel">' + sel(b.id, state.to) + "</select></div></div>" +

      '<div class="kpis" style="margin-bottom:16px">' +
      kpi("需改动化合物", pd.moves.length + " / 55", "显著位移 " + pd.big + " 项") +
      kpi("增加方向", pd.add.length + " 项", "含新增与上调") +
      kpi("删减方向", pd.del.length + " 项", "含删除与下调") +
      kpi("缺陷约束", "≤ 1.00", "四个缺陷化合物浓度比") +
      (axInfo ? kpi("论文口径位移", axInfo.shift.toFixed(2), "表 13 · 源中位 " + axInfo.src_median) : kpi("轴距（推算）", "—", "论文仅给出三条风格轴")) +
      "</div>" +

      '<div class="panel"><div class="panel-head"><div class="h2">' + a.cn + " → " + b.cn + "<small>Intervention</small></div>" +
      '<div class="seg">' + tabs + "</div></div>" +
      (state.tab === "list" ? tabList(pd) : state.tab === "path" ? tabPath(pd, axInfo) : tabDiff(pd)) +
      "</div>" +
      '<div class="src-note" style="margin-top:14px">' +
      (paperPair
        ? "<b>与论文对齐：</b>Pils/Lager → Tripel 的位移为 11.74 个欧氏单位，226 个化合物中 93 个 |Δz| &gt; 0.5、216 个有非零位移；把缺陷约束内嵌后位移只增加 1.3%，判别概率由 0.384 微降至 0.364。表 14 给出 11 个供体的平均前 6 位。"
        : "<b>口径说明：</b>逐化合物区间来自与风格画像一致的分位得分换算，用于判断方向与量级；论文表 13 只公布了 Tripel / Kriek / Lambic 三条风格轴的统计量，其余组合的绝对位移不宣称与论文一致。") +
      "</div>";
  }

  function tabList(pd) {
    const rows = pd.moves
      .slice(0, 16)
      .map((x) => {
        const opLab = { add: "新增", del: "删减", up: "上调", down: "下调" }[x.op];
        const cls = { add: "op-add", del: "op-del", up: "op-up", down: "op-down" }[x.op];
        const pct = Math.round((x.t / x.s - 1) * 100);
        return (
          '<div class="t-row mig-row"><div class="t-c t-name"><b>' + x.c.cn + "</b><i>" + x.c.en + "</i></div>" +
          '<div class="t-c"><span class="mig-op ' + cls + '">' + opLab + "</span></div>" +
          '<div class="t-c t-num">' + rangeText(pd.a.values[x.c.id][0], pd.a.values[x.c.id][2], x.c.unit) + "</div>" +
          '<div class="t-c t-num">' + rangeText(pd.b.values[x.c.id][0], pd.b.values[x.c.id][2], x.c.unit) + "</div>" +
          '<div class="t-c t-num" style="color:' + (x.d > 0 ? "#f6cd85" : "#86ab8e") + '">' + (pct > 0 ? "+" : "") + pct + "%</div></div>"
        );
      })
      .join("");
    return (
      '<div class="table"><div class="t-row mig-row t-head"><span>化合物</span><span>操作</span><span>源风格区间</span><span>目标风格区间</span><span>变化</span></div>' +
      (rows || '<p class="empty-hint">这两个风格的化合物谱几乎一致，无需改动。</p>') + "</div>" +
      '<div class="src-note" style="margin-top:12px">区间是该化合物在源/目标风格中的 10%–90% 分布近似；「变化」按中位含量计算。' +
      "新增表示源风格接近未检出、目标风格明确存在；删减反之。清单按「位移 × 化合物重要性」排序，仅显示前 16 项，共 " + pd.moves.length + " 项。</div>"
    );
  }

  function tabPath(pd, axInfo) {
    const steps = [0, 0.25, 0.5, 0.75, 1];
    const cards = steps
      .map((t) => {
        const top = pd.moves.slice(0, 3);
        const list = top
          .map((x) => {
            const v = x.s + x.d * t;
            return '<div class="path-line"><span>' + x.c.cn + "</span><b>" + fmtV(v, x.c.unit) + "</b></div>";
          })
          .join("");
        const prog = Math.round(t * 100);
        return (
          '<div class="path-step"><div class="path-pct">' + prog + "%</div>" +
          '<div class="path-v">' + (axInfo ? (11.74 * t).toFixed(1) : (100 * t).toFixed(0)) + '<small style="font-size:9px;color:var(--muted-2)">' + (axInfo ? " 位移" : "% 进度") + "</small></div>" +
          '<div class="path-k">' + (t === 1 ? "达到目标中位" : t === 0 ? "源风格样本" : "沿轴插值") + "</div>" +
          '<div class="path-bar"><i style="width:' + (t * 100) + '%"></i></div>' +
          '<div class="path-lines">' + list + "</div></div>"
        );
      })
      .join("");
    return (
      '<p class="panel-note" style="margin:0 0 12px">迁移有闭式解：最优解形如 clip(z₀ + a·u, ℓ, u<sub>D</sub>)，沿风格轴等比例移动，越界分量截回化学可行盒、缺陷分量截回源值。因此路径可以按位移比例等分展示。</p>' +
      '<div class="path">' + cards + "</div>" +
      '<div class="src-note" style="margin-top:14px">缺陷约束在每一段都已生效：DMS、双乙酰、4VG、反式-2-壬烯醛沿路径单调不增。' +
      (axInfo ? "整条路径的终点位移为 11.74，判别概率 0.364；若不施加缺陷约束，位移可降到 11.59，也就是说约束的代价只有 1.3%。" : "") + "</div>"
    );
  }

  function tabDiff(pd) {
    const top = pd.moves.slice(0, 12);
    const maxAbs = Math.max.apply(null, top.map((x) => Math.abs(x.rel)).concat([0.001]));
    const rows = top
      .map((x) => {
        const w = clamp((Math.abs(x.rel) / maxAbs) * 50, 1, 50);
        const col = x.d > 0 ? "linear-gradient(90deg,rgba(233,169,78,.4),#e9a94e)" : "linear-gradient(270deg,rgba(134,171,142,.4),#86ab8e)";
        const style = x.d > 0 ? "left:50%;width:" + w + "%" : "right:50%;width:" + w + "%";
        return (
          '<div class="diff-row"><span class="diff-name">' + x.c.cn + '</span><span class="diff-track"><i style="' + style + ";background:" + col + '"></i></span>' +
          '<span class="diff-v">' + (x.d > 0 ? "+" : "") + fmtV(Math.abs(x.d), x.c.unit) + "</span></div>"
        );
      })
      .join("");

    const defects = ["dms", "diacetyl", "4vg", "t2n"].map((id) => {
      const c = CM[id];
      const sv = pd.a.values[id][1], tv = pd.b.values[id][1];
      const raw = sv > 0 ? tv / sv : 1;
      const capped = Math.min(1, raw);
      const MAXR = 2.6;
      const wRaw = clamp((raw / MAXR) * 100, 0, 100);
      const wCap = clamp((capped / MAXR) * 100, 0, 100);
      return (
        '<div class="defect-row"><span>' + c.cn + '<i style="font-style:normal;color:var(--muted-2);font-size:10px"> · ' + c.en + "</i></span>" +
        '<span class="defect-track"><i class="raw" style="width:' + wRaw + '%"></i><i class="cap" style="width:' + wCap + '%"></i>' +
        '<b class="lim"></b></span>' +
        '<span class="t-num" style="text-align:right">' + raw.toFixed(1) + " → " + capped.toFixed(2) + "</span></div>"
      );
    }).join("");

    return (
      '<div class="two-col"><div><div class="h3">化合物差值（相对基准的变化幅度，取前 12 位）</div><div class="diff-list">' + rows + "</div>" +
      '<div class="axis-legend" style="margin-top:10px"><span><i style="background:#e9a94e"></i>目标更高</span><span><i style="background:#86ab8e"></i>目标更低</span></div></div>' +
      '<div><div class="h3">感官画像对照</div>' +
      C.radar([
        { values: AX.map((x) => pd.a.profile[x.id]), color: "rgba(162,149,127,.85)", width: 1.2, dash: "4 4", fill: false, dots: false },
        { values: AX.map((x) => pd.b.profile[x.id]), color: "#e9a94e", width: 1.9, dotR: 2.2 },
      ], { axes: AX, size: 300, fontSize: 9 }) +
      '<div class="axis-legend" style="justify-content:center"><span><i style="background:rgba(162,149,127,.85)"></i>' + pd.a.cn + '</span><span><i style="background:#e9a94e"></i>' + pd.b.cn + "</span></div>" +
      '<div class="h3" style="margin-top:18px">缺陷化合物浓度比（迁移后 / 源）</div>' + defects +
      '<p class="panel-note" style="margin-top:6px">浅红为不加约束时的浓度比，绿色为施加「不恶化」约束后的结果，竖线为 1.0 上限；约束在求解时内嵌，不是事后筛选。</p></div></div>'
    );
  }

  /* ================= 路由与事件 ================= */
  function syncCrumb() {
    const s = SM[state.styleId];
    $("#crumbStyle").textContent = window.ATLAS_LANG === "en" ? s.en : s.cn + " " + s.en;
  }

  /* 跨页记忆：只存「用户选了什么」，不存渲染结果 */
  function persist() {
    if (!PG || !PG.isMultiPage) return;
    PG.write({ styleId: state.styleId, sel: state.sel, from: state.from, to: state.to, tab: state.tab });
  }

  /* 地址栏跟随状态，刷新和分享都能回到同一处 */
  function syncUrl(view, params) {
    if (!PG || !history.replaceState) return;
    history.replaceState(null, "", PG.url(view, params));
  }

  function render() {
    const el = $(".view");
    if (el) el.classList.add("is-on");
    if (state.view === "home") renderHome();
    if (state.view === "style") renderStyle();
    if (state.view === "lab") renderLab();
    if (state.view === "note") renderNote();
    if (state.view === "origin") renderOrigin();
    if (state.view === "transfer") renderTransfer();
  }

  document.addEventListener("atlas:lang", () => {
    syncCrumb();
    render();
    if (window.AtlasI18n) window.AtlasI18n.apply(document.body);
  });

  /* 多页之间用真实地址跳转，浏览器前进/后退、新标签打开都正常工作 */
  function go(view, params) {
    if (!PG) return;
    if (view === state.view) {
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    persist();
    location.href = PG.url(view, params);
  }

  document.addEventListener("click", (e) => {
    /* 导航是真实链接，交给浏览器处理；这里只兜底同页锚点 */
    if (e.target.closest(".nav-item")) return;

    if (state.view === "home") {
      const jump = e.target.closest("[data-go]");
      if (jump) { go(jump.dataset.go); return; }
      const card = e.target.closest(".hm-style[data-style]");
      if (card) {
        state.styleId = card.dataset.style;
        state.detail = true;
        state.sel = SM[state.styleId].key.slice(0, 6);
        syncCrumb();
        go("style", { style: state.styleId });
        return;
      }
    }

    if (state.view === "style") {
      const chip = e.target.closest("[data-group]");
      if (chip) { state.group = chip.dataset.group; renderStyle(); return; }
      const card = e.target.closest("[data-style]");
      if (card) {
        state.styleId = card.dataset.style; state.detail = true;
        state.sel = SM[state.styleId].key.slice(0, 6);
        syncCrumb(); renderStyle();
        persist();
        syncUrl("style", { style: state.styleId });
        window.scrollTo({ top: 0, behavior: "smooth" }); return;
      }
    }

    if (e.target.closest("[data-open-scale]")) { openScale(); return; }
    if (e.target.closest("[data-close-scale]")) { closeScale(); return; }

    const back = e.target.closest("[data-back]");
    if (back) {
      state.detail = false;
      renderStyle();
      syncUrl("style");
      return;
    }

    const labBtn = e.target.closest("[data-lab]");
    if (labBtn) { state.sel = SM[state.styleId].key.slice(0, 8); persist(); go("lab"); return; }

    const migBtn = e.target.closest("[data-migrate]");
    if (migBtn) {
      state.to = state.styleId;
      state.from = state.styleId === "pils" ? "tripel" : "pils";
      state.tab = "list";
      go("transfer", { from: state.from, to: state.to });
      return;
    }

    if (e.target.closest("[data-reseed]")) { state.seed++; renderNote(); return; }
    if (e.target.closest("[data-copy]")) { copyNote(); return; }
    if (e.target.closest("[data-swap]")) {
      const t = state.from; state.from = state.to; state.to = t;
      renderTransfer();
      persist();
      syncUrl("transfer", { from: state.from, to: state.to, tab: state.tab });
      return;
    }

    const tab = e.target.closest("[data-tab]");
    if (tab) {
      state.tab = tab.dataset.tab;
      renderTransfer();
      persist();
      syncUrl("transfer", { from: state.from, to: state.to, tab: state.tab });
      return;
    }

    if (e.target.closest("[data-clear]")) { state.sel = []; renderLab(); persist(); return; }
    if (e.target.closest("[data-preset]")) { state.sel = SM[state.styleId].key.slice(0, 8); renderLab(); persist(); return; }
  });

  document.addEventListener("change", (e) => {
    if (e.target.id === "fromSel") {
      state.from = e.target.value;
      renderTransfer();
      persist();
      syncUrl("transfer", { from: state.from, to: state.to, tab: state.tab });
    }
    if (e.target.id === "toSel") {
      state.to = e.target.value;
      renderTransfer();
      persist();
      syncUrl("transfer", { from: state.from, to: state.to, tab: state.tab });
    }
  });

  /* 关掉标签页前再存一次，覆盖键盘操作等没走 click 的路径 */
  window.addEventListener("pagehide", persist);

  // 化合物目录与选择（lab 视图内）
  document.addEventListener("click", (e) => {
    if (state.view !== "lab") return;
    if (e.target.closest("#view-lab [data-cid]") || e.target.closest("#view-lab [data-rm]") || e.target.closest("#view-lab [data-preset]") || e.target.closest("#view-lab [data-clear]")) {
      if (e.target.closest("[data-preset]") || e.target.closest("[data-clear]")) return;
      labClick(e);
    }
  });

  function copyNote() {
    const s = SM[state.styleId];
    const ids = state.sel.length ? state.sel : s.key.slice(0, 8);
    const note = buildNote(ids, s, state.seed);
    if (!note) return;
    const plain = note.paras.map((p) => p.replace(/<[^>]+>/g, "")).join("");
    const done = () => showTip("已复制到剪贴板", window.innerWidth / 2, 80);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(plain).then(done, () => fallbackCopy(plain, done));
    } else fallbackCopy(plain, done);
  }
  function fallbackCopy(text, cb) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); cb(); } catch (err) { /* ignore */ }
    document.body.removeChild(ta);
  }

  /* ---------------- 数据口径弹窗 ---------------- */
  function openScale() {
    const tb = D.paper;
    const rows = [
      ["表 5", "0–6 分感官分级节选", "8 款代表性啤酒的苦度、酒体、酒精感等分值"],
      ["表 6", "共表达网络模块", "6 个模块的规模与代表物质（Q = 0.5874）"],
      ["表 8", "一级可归因维度", "17 个维度的关键化合物与边际 |ρ|"],
      ["表 12", "四风格化学指纹", "Tripel / Kriek / Lambic / Pils 的正负各 5 位，单位 Cohen's d"],
      ["表 13", "三条风格轴", "轴长、源中位、目标 10% 分位与中位、所需位移"],
      ["表 14", "Tripel 迁移位移", "11 个供体平均的前 6 位化合物与累计占比"],
      ["表 21", "50 维完整 Top-3", "π 入选频率与 |ρ| 边际相关"],
      ["表 22", "五个数据事实", "风格样本数、缺陷阈值与基率等"],
      ["表 27", "标记物核验", "8 个工艺标志物的生成谱 / 实测谱排序一致性"],
    ]
      .map((r) => "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>")
      .join("");

    $("#scaleBody").innerHTML =
      "<h3>数据口径与出处</h3>" +
      '<p style="color:var(--muted-2);font-family:var(--font-mono);font-size:10.5px;letter-spacing:.06em">' + D.meta.paper + "</p>" +
      "<h4>结构化数据文件</h4>" +
      "<p>站点所有内容来自 <code>data/flavor-data.js</code> 一个文件：55 个化合物、22 个风格 × 55 项含量、50 个感官维度的 Top-3、6 个共表达模块，以及论文表 12–27 的原始数值。" +
      "修改该文件即可调整站点；它由 <code>tools/build_data.py</code> 生成，也可以直接手改。</p>" +
      "<h4>含量区间怎么来的</h4>" +
      "<p>" + D.meta.scale_note + "</p>" +
      "<h4>逐表对应</h4>" +
      "<table><tr><th>出处</th><th>内容</th><th>用于</th></tr>" + rows + "</table>" +
      "<h4>边界</h4>" +
      "<p>本页是论文结论的可视化与推演，不是实测数据库。感官画像为 0–6 相对分级，跨风格比较可比、绝对值不可外推；" +
      "迁移清单给出方向与量级，工艺放大前仍需以实测浓度复核。论文自身亦声明：dms 与 diacetyl 两个维度的标签与化学测量脱节，" +
      "其名义化合物与评分的秩相关仅 0.09 与 −0.10。</p>";
    $("#scaleModal").classList.add("is-on");
    $("#scaleModal").setAttribute("aria-hidden", "false");
  }
  function closeScale() {
    $("#scaleModal").classList.remove("is-on");
    $("#scaleModal").setAttribute("aria-hidden", "true");
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeScale();
  });

  /* ---------------- tooltip ---------------- */
  const tip = $("#tooltip");
  document.addEventListener("mouseover", (e) => {
    const t = e.target.closest("[data-tip]");
    if (!t) return;
    tip.textContent = t.dataset.tip;
    tip.classList.add("is-on");
  });
  document.addEventListener("mousemove", (e) => {
    if (!tip.classList.contains("is-on")) return;
    const x = Math.min(e.clientX + 14, window.innerWidth - 280);
    const y = Math.min(e.clientY + 16, window.innerHeight - 80);
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("[data-tip]")) tip.classList.remove("is-on");
  });
  function showTip(text, x, y) {
    tip.textContent = text;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
    tip.classList.add("is-on");
    setTimeout(() => tip.classList.remove("is-on"), 1400);
  }

  /* ---------------- 启动 ---------------- */
  /* 每页只渲染自己那一个视图；状态从地址参数与会话记忆里恢复，
     所以从风格库跳到化合物页，选中的风格和化合物不会丢。 */
  function boot() {
    const saved = PG && PG.isMultiPage ? PG.read() : {};
    const q = new URLSearchParams(location.search);

    if (saved.styleId && SM[saved.styleId]) state.styleId = saved.styleId;
    if (SM[q.get("style")]) { state.styleId = q.get("style"); state.detail = true; }
    if (SM[q.get("from")]) state.from = q.get("from");
    if (SM[q.get("to")]) state.to = q.get("to");
    if (q.get("tab")) state.tab = q.get("tab");

    const selRaw = q.get("sel");
    if (selRaw) {
      state.sel = selRaw.split(",").filter((id) => CM[id]);
    } else if (saved.sel && saved.sel.length) {
      state.sel = saved.sel.filter((id) => CM[id]);
    }
    if (!state.sel.length) {
      state.sel = SM[state.styleId].key.slice(0, state.view === "lab" ? 8 : 6);
    }

    syncCrumb();
    render();
    persist();

    /* 窄屏导航是横向滚动的，把当前页滚进视野，避免用户以为只有两个入口 */
    const cur = $('.nav-item[aria-current="page"]');
    if (cur && cur.scrollIntoView) {
      cur.scrollIntoView({ block: "nearest", inline: "center" });
    }

    $("#btnReset").addEventListener("click", () => {
      state.sel = SM[state.styleId].key.slice(0, 6);
      state.seed = 0;
      render();
      persist();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
