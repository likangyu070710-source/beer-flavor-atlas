/* ============================================================
   charts.js — 轻量 SVG 图表（无外部依赖）
   ============================================================ */
(function () {
  const SHORT = {
    bitter: "苦", hop: "酒花", ester: "酯香", malt: "麦芽", roast: "焙烤", phenol: "酚香",
    sour: "酸", alcohol: "酒精", body: "酒体", sulfur: "硫", aged: "陈味", floral: "花香",
  };

  const NS = 'xmlns="http://www.w3.org/2000/svg"';

  function r1(v) { return Math.round(v * 10) / 10; }

  /* ---------- 雷达图 ---------- */
  function radar(series, opt) {
    opt = opt || {};
    const size = opt.size || 320;
    const n = opt.axes.length;
    const max = opt.max || 6;
    const cx = size / 2, cy = size / 2 + (opt.labels === false ? 0 : 2);
    const R = size * (opt.labels === false ? 0.4 : 0.315);
    const ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const pt = (i, v) => [cx + Math.cos(ang(i)) * R * (v / max), cy + Math.sin(ang(i)) * R * (v / max)];
    const poly = (vals) => vals.map((v, i) => pt(i, v).map(r1).join(",")).join(" ");

    let g = "";
    // 网格
    [0.25, 0.5, 0.75, 1].forEach((f, k) => {
      const pts = Array.from({ length: n }, (_, i) => pt(i, max * f).map(r1).join(",")).join(" ");
      g += `<polygon points="${pts}" fill="none" stroke="rgba(236,223,203,${k === 3 ? 0.16 : 0.07})" stroke-width="1"/>`;
    });
    // 轴线
    for (let i = 0; i < n; i++) {
      const [x, y] = pt(i, max);
      g += `<line x1="${r1(cx)}" y1="${r1(cy)}" x2="${r1(x)}" y2="${r1(y)}" stroke="rgba(236,223,203,.07)" stroke-width="1"/>`;
    }
    // 数据
    series.forEach((s, si) => {
      if (!s.values) return;
      if (s.fill !== false) {
        g += `<polygon points="${poly(s.values)}" fill="${s.color}" fill-opacity="${s.fillOpacity == null ? 0.16 : s.fillOpacity}" stroke="none"/>`;
      }
      g += `<polygon points="${poly(s.values)}" fill="none" stroke="${s.color}" stroke-width="${s.width || 1.8}"
             stroke-linejoin="round" stroke-dasharray="${s.dash || "none"}" opacity="${s.opacity || 1}"/>`;
      if (s.dots !== false) {
        s.values.forEach((v, i) => {
          const [x, y] = pt(i, v);
          g += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${s.dotR || 2.2}" fill="${s.color}" opacity="${s.opacity || 1}"/>`;
        });
      }
    });
    // 标签
    if (opt.labels !== false) {
      for (let i = 0; i < n; i++) {
        const [x, y] = pt(i, max * 1.19);
        const a = ang(i);
        const cos = Math.cos(a), sin = Math.sin(a);
        const anchor = Math.abs(cos) < 0.25 ? "middle" : cos > 0 ? "start" : "end";
        const dy = sin < -0.7 ? -2 : sin > 0.7 ? 8 : 3;
        const label = (opt.short !== false ? SHORT[opt.axes[i].id] : opt.axes[i].cn) || opt.axes[i].cn;
        g += `<text x="${r1(x)}" y="${r1(y + dy)}" fill="rgba(217,205,185,.72)" font-size="${opt.fontSize || 9.5}"
               text-anchor="${anchor}" font-family="var(--font-ui)">${label}</text>`;
      }
    }
    return `<svg ${NS} viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="感官雷达图">${g}</svg>`;
  }

  /* ---------- 迷你雷达 ---------- */
  function miniRadar(values, size, color) {
    const n = values.length, max = 6;
    const cx = size / 2, cy = size / 2, R = size * 0.42;
    const ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const pt = (i, v) => [cx + Math.cos(ang(i)) * R * (v / max), cy + Math.sin(ang(i)) * R * (v / max)];
    const poly = values.map((v, i) => pt(i, v).map(r1).join(",")).join(" ");
    let g = "";
    [0.5, 1].forEach((f) => {
      g += `<polygon points="${values.map((_, i) => pt(i, max * f).map(r1).join(",")).join(" ")}"
             fill="none" stroke="rgba(236,223,203,.08)" stroke-width="1"/>`;
    });
    g += `<polygon points="${poly}" fill="${color}" fill-opacity=".17" stroke="${color}" stroke-width="1.2" stroke-linejoin="round"/>`;
    return `<svg ${NS} viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">${g}</svg>`;
  }

  /* ---------- 迷你条形谱 ---------- */
  function miniBars(values, w, h, color) {
    w = w || 60; h = h || 34;
    const n = values.length;
    const gap = 1.6;
    const bw = (w - gap * (n - 1)) / n;
    let g = "";
    values.forEach((v, i) => {
      const bh = Math.max(1.6, (v / 6) * h);
      const x = i * (bw + gap);
      const op = 0.28 + 0.72 * (v / 6);
      g += `<rect x="${r1(x)}" y="${r1(h - bh)}" width="${r1(bw)}" height="${r1(bh)}" rx="1"
             fill="${color || "#e9a94e"}" opacity="${r1(op)}"/>`;
    });
    g += `<line x1="0" y1="${h}" x2="${w}" y2="${h}" stroke="rgba(236,223,203,.16)" stroke-width="1"/>`;
    return `<svg ${NS} viewBox="0 0 ${w} ${h + 1}" width="${w}" height="${h + 1}" aria-hidden="true">${g}</svg>`;
  }

  /* ---------- 风格轴 ---------- */
  function axisPlot(opt) {
    const w = 520, h = 172;
    const padL = 28, padR = 28;
    const x0 = opt.min, x1 = opt.max;
    const X = (v) => padL + ((v - x0) / (x1 - x0)) * (w - padL - padR);
    const base = 104;
    let g = "";

    // 目标区间带
    if (opt.targetBand) {
      const a = X(opt.targetBand[0]), b = X(opt.targetBand[1]);
      g += `<rect x="${r1(a)}" y="${base - 32}" width="${r1(b - a)}" height="32" rx="4" fill="url(#bandGrad)"/>`;
      g += `<text x="${r1((a + b) / 2)}" y="${base - 12}" fill="rgba(246,205,133,.92)" font-size="9"
             text-anchor="middle" letter-spacing=".05em">目标风格主体区间</text>`;
      g += `<line x1="${r1(a)}" y1="${base - 36}" x2="${r1(a)}" y2="${base + 5}" stroke="rgba(236,223,203,.32)" stroke-width="1" stroke-dasharray="3 3"/>`;
    }

    // 位移箭头
    if (opt.arrow) {
      const a = X(opt.arrow[0]), b = X(opt.arrow[1]);
      g += `<defs><marker id="ah" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
        <path d="M0 0l7 3.5L0 7z" fill="rgba(233,169,78,.9)"/></marker></defs>`;
      g += `<line x1="${r1(a)}" y1="${base - 58}" x2="${r1(b - 3)}" y2="${base - 58}" stroke="rgba(233,169,78,.7)" stroke-width="1.1" marker-end="url(#ah)"/>`;
      g += `<circle cx="${r1(a)}" cy="${base - 58}" r="2" fill="rgba(233,169,78,.7)"/>`;
      g += `<text x="${r1((a + b) / 2)}" y="${base - 66}" fill="rgba(246,205,133,.95)" font-size="10" text-anchor="middle">所需位移 ${opt.arrow[2]}</text>`;
    }

    // 轴线与刻度
    g += `<line x1="${padL}" y1="${base}" x2="${w - padR}" y2="${base}" stroke="rgba(236,223,203,.24)" stroke-width="1"/>`;
    for (let v = Math.ceil(x0 / 5) * 5; v <= x1; v += 5) {
      const x = X(v);
      g += `<line x1="${r1(x)}" y1="${base}" x2="${r1(x)}" y2="${base + 4}" stroke="rgba(236,223,203,.22)"/>`;
      g += `<text x="${r1(x)}" y="${base + 15}" fill="rgba(162,149,127,.8)" font-size="9.5" text-anchor="middle" font-family="var(--font-mono)">${v}</text>`;
    }
    g += `<text x="${w - padR}" y="${base + 60}" fill="rgba(125,115,101,.75)" font-size="9" text-anchor="end">风格轴投影得分 s(z)</text>`;

    // 标记
    (opt.marks || []).forEach((m) => {
      const x = X(m.v);
      g += `<circle cx="${r1(x)}" cy="${base - 4}" r="3.4" fill="${m.color}" stroke="#141110" stroke-width="1"/>`;
      g += `<line x1="${r1(x)}" y1="${base - 4}" x2="${r1(x)}" y2="${base}" stroke="${m.color}" stroke-width="1.2"/>`;
      g += `<text x="${r1(x)}" y="${base + (m.row === 2 ? 58 : 38)}" fill="${m.color}" font-size="10"
             text-anchor="${m.anchor || "middle"}" font-family="var(--font-ui)">${m.label}</text>`;
    });
    return `<svg ${NS} viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs><linearGradient id="bandGrad" x1="0" x2="1"><stop offset="0" stop-color="#e9a94e" stop-opacity=".22"/><stop offset="1" stop-color="#e9a94e" stop-opacity=".05"/></linearGradient></defs>${g}</svg>`;
  }

  /* ---------- 折线 / 面积 ---------- */
  function line(points, opt) {
    opt = opt || {};
    const w = opt.width || 300, h = opt.height || 110, pad = 6;
    const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
    const x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    const y0 = opt.y0 == null ? Math.min.apply(null, ys) : opt.y0;
    const y1 = opt.y1 == null ? Math.max.apply(null, ys) : opt.y1;
    const X = (v) => pad + (x1 === x0 ? 0 : ((v - x0) / (x1 - x0)) * (w - pad * 2));
    const Y = (v) => h - pad - ((v - y0) / (y1 - y0 || 1)) * (h - pad * 2);
    const d = points.map((p, i) => `${i ? "L" : "M"}${r1(X(p[0]))} ${r1(Y(p[1]))}`).join(" ");
    const area = `${d} L${r1(X(x1))} ${h - pad} L${r1(X(x0))} ${h - pad} Z`;
    const color = opt.color || "#e9a94e";
    const id = "g" + Math.random().toString(36).slice(2, 7);
    let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity=".26"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>`;
    if (opt.grid !== false) {
      [0, 0.5, 1].forEach((f) => {
        const y = pad + f * (h - pad * 2);
        g += `<line x1="${pad}" y1="${r1(y)}" x2="${w - pad}" y2="${r1(y)}" stroke="rgba(236,223,203,.07)"/>`;
      });
    }
    g += `<path d="${area}" fill="url(#${id})"/>`;
    g += `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/>`;
    points.forEach((p) => {
      g += `<circle cx="${r1(X(p[0]))}" cy="${r1(Y(p[1]))}" r="2.4" fill="${color}"/>`;
    });
    return `<svg ${NS} viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" aria-hidden="true">${g}</svg>`;
  }

  /* ---------- 环形进度 ---------- */
  function ring(percent, opt) {
    opt = opt || {};
    const size = opt.size || 74, sw = opt.stroke || 5;
    const r = (size - sw) / 2, c = 2 * Math.PI * r;
    const p = Math.max(0, Math.min(100, percent));
    return `<svg ${NS} viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(236,223,203,.09)" stroke-width="${sw}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${opt.color || "#e9a94e"}" stroke-width="${sw}"
        stroke-linecap="round" stroke-dasharray="${r1((c * p) / 100)} ${r1(c)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
      <text x="${size / 2}" y="${size / 2 + 1}" fill="${opt.color || "#f6cd85"}" font-size="${opt.fontSize || 15}"
        text-anchor="middle" dominant-baseline="middle" font-family="var(--font-num)">${Math.round(p)}</text>
    </svg>`;
  }

  /* ---------- 水平分布条（化学来源占比等） ---------- */
  function stack(items, opt) {
    opt = opt || {};
    const total = items.reduce((s, d) => s + d.v, 0) || 1;
    const w = opt.width || 520, h = opt.height || 12;
    let x = 0, g = "";
    items.forEach((d) => {
      const ww = (d.v / total) * w;
      g += `<rect x="${r1(x)}" y="0" width="${r1(Math.max(ww - 2, 1))}" height="${h}" rx="2" fill="${d.color}"/>`;
      x += ww;
    });
    return `<svg ${NS} viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" aria-hidden="true">${g}</svg>`;
  }

  window.Charts = { radar, miniRadar, miniBars, axisPlot, line, ring, stack, SHORT };
})();
