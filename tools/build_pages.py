#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_pages.py — 由一份外壳模板生成六个真实页面。

为什么要生成而不是手写六份：导航、语言开关、数据口径弹窗在每页都一样，
手写会出现「改了五个页面忘了第六个」的经典问题。模板是唯一事实来源，
跑一次脚本即可让六页保持一致。

用法：
    python tools/build_pages.py
"""

from pathlib import Path
import html

ROOT = Path(__file__).resolve().parent.parent

PAGES = [
    {
        "key": "home",
        "file": "index.html",
        "no": "00",
        "cn": "首页",
        "en": "Home",
        "title": "啤酒风味图谱 · Beer Flavor Atlas",
        "title_en": "Beer Flavor Atlas · 22 styles, 55 compounds",
        "desc": "基于 250 款商业啤酒、226 项化学指标与 50 维感官的风格风味图谱：风格查询、化合物交互、口味生成、风格溯源与跨风格迁移。",
    },
    {
        "key": "style",
        "file": "styles.html",
        "no": "01",
        "cn": "风格查询",
        "en": "Style library",
        "title": "风格查询 · 啤酒风味图谱",
        "title_en": "Style library · Beer Flavor Atlas",
        "desc": "22 种啤酒风格的感官雷达、12 个关键化合物含量区间与四风格化学指纹，可按分类筛选或搜索。",
    },
    {
        "key": "lab",
        "file": "lab.html",
        "no": "02",
        "cn": "化合物交互",
        "en": "Compound lab",
        "title": "化合物交互 · 啤酒风味图谱",
        "title_en": "Compound lab · Beer Flavor Atlas",
        "desc": "55 种风味化合物自由增删，实时给出组合的感官轮廓、与目标风格的贴合度，以及每种化合物的影响方向与强度。",
    },
    {
        "key": "note",
        "file": "note.html",
        "no": "03",
        "cn": "口味生成",
        "en": "Tasting note",
        "title": "口味生成 · 啤酒风味图谱",
        "title_en": "Tasting note · Beer Flavor Atlas",
        "desc": "按当前化合物组合生成 100–200 字的品鉴笔记，覆盖香气、口感与余味，并标出主导化合物。",
    },
    {
        "key": "origin",
        "file": "origin.html",
        "no": "04",
        "cn": "风格溯源",
        "en": "Origin · Tripel",
        "title": "风格溯源 · 三料 Tripel 是怎么形成的",
        "title_en": "Origin · How a Tripel is built",
        "desc": "从原料、工艺到化合物与风味，拆解三料 Tripel 的形成过程：四段工艺时间线、风格轴图与因果链。",
    },
    {
        "key": "transfer",
        "file": "transfer.html",
        "no": "05",
        "cn": "风格迁移",
        "en": "Style transfer",
        "title": "风格迁移 · 啤酒风味图谱",
        "title_en": "Style transfer · Beer Flavor Atlas",
        "desc": "任选源风格与目标风格，得到新增、删减与调整的化合物清单、五段迁移路径与差值对比。",
    },
]

BRAND_ICON = """<svg viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
          <g transform="translate(20 20) scale(1.18) translate(-20 -21.12)">
            <path d="M12.4 13.8h15.2l-1.5 17.9a3.6 3.6 0 0 1-3.6 3.3h-5a3.6 3.6 0 0 1-3.6-3.3L12.4 13.8Z" fill="currentColor"/>
            <circle cx="15.4" cy="12.7" r="3.6" fill="#f7e8cc"/>
            <circle cx="20" cy="11.4" r="4.2" fill="#f7e8cc"/>
            <circle cx="24.6" cy="12.7" r="3.6" fill="#f7e8cc"/>
            <rect x="12.3" y="13.1" width="15.4" height="3.4" rx="1.7" fill="#f7e8cc"/>
          </g>
        </svg>"""

FAVICON = (
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E"
    "%3Crect width='40' height='40' rx='9' fill='%23140f0a'/%3E%3Cg transform='translate(20 20) "
    "scale(1.264) translate(-20 -21.12)'%3E%3Cpath d='M12.4 13.8h15.2l-1.5 17.9a3.6 3.6 0 0 1-3.6 "
    "3.3h-5a3.6 3.6 0 0 1-3.6-3.3L12.4 13.8Z' fill='%23e9a94e'/%3E%3Ccircle cx='15.4' cy='12.7' "
    "r='3.6' fill='%23f7e8cc'/%3E%3Ccircle cx='20' cy='11.4' r='4.2' fill='%23f7e8cc'/%3E"
    "%3Ccircle cx='24.6' cy='12.7' r='3.6' fill='%23f7e8cc'/%3E%3Crect x='12.3' y='13.1' width='15.4' "
    "height='3.4' rx='1.7' fill='%23f7e8cc'/%3E%3C/g%3E%3C/svg%3E"
)


def nav_items(current):
    out = []
    for p in PAGES:
        on = p["key"] == current
        cls = "nav-item is-on" if on else "nav-item"
        cur = ' aria-current="page"' if on else ""
        out.append(
            f'      <a class="{cls}" href="{p["file"]}" data-view="{p["key"]}"{cur}>\n'
            f'        <span class="nav-no">{p["no"]}</span>\n'
            f'        <span class="nav-lab"><b>{p["cn"]}</b><i>{p["en"]}</i></span>\n'
            f"      </a>"
        )
    return "\n".join(out)


TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>@@TITLE@@</title>
<meta name="description" content="@@DESC@@">
<link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="images/favicon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png">
<meta name="theme-color" content="#140f0a">
<meta property="og:type" content="website">
<meta property="og:site_name" content="啤酒风味图谱">
<meta property="og:title" content="@@TITLE@@">
<meta property="og:description" content="@@DESC@@">
<meta property="og:image" content="https://likangyu070710-source.github.io/beer-flavor-atlas/images/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://likangyu070710-source.github.io/beer-flavor-atlas/@@FILE@@">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body data-page="@@KEY@@" data-title-zh="@@TITLE@@" data-title-en="@@TITLE_EN@@">
<a class="skip-link" href="#main">跳到主内容</a>

<div class="shell">
  <aside class="rail" aria-label="站点导航">
    <a class="brand" href="index.html" aria-label="返回首页">
      <span class="brand-mark" aria-hidden="true">
        @@BRAND_ICON@@
      </span>
      <span class="brand-txt">
        <strong>啤酒风味图谱</strong>
        <em>Beer Flavor Atlas</em>
      </span>
    </a>

    <nav class="nav" id="nav" aria-label="主导航">
@@NAV@@
    </nav>

    <div class="rail-foot">
      <div class="rail-stat">
        <span><b>250</b>款啤酒</span>
        <span><b>226</b>项指标</span>
        <span><b>22</b>种风格</span>
      </div>
      <p>数据源自数学建模论文《基于多输出偏最小二乘、共表达网络与风格条件生成模型的啤酒风味解析与调控》</p>
      <button class="link-btn" type="button" data-open-scale>数据口径与出处 →</button>
    </div>
  </aside>

  <main class="main" id="main" tabindex="-1">
    <header class="topbar">
      <div class="crumb" id="crumb">
        <span class="crumb-k">当前风格</span>
        <span class="crumb-v" id="crumbStyle">三料 Tripel</span>
      </div>
      <div class="topbar-actions">
        <div class="lang-switch no-i18n" id="langSwitch" role="group" aria-label="语言 / Language">
          <button type="button" data-lang="zh" class="is-on" aria-pressed="true">中</button>
          <button type="button" data-lang="en" aria-pressed="false">EN</button>
        </div>
        <button class="ghost-btn" type="button" data-open-scale>数据口径</button>
        <button class="ghost-btn" type="button" id="btnReset">重置选择</button>
      </div>
    </header>

    <section class="view is-on" id="view-@@KEY@@" data-view="@@KEY@@"></section>

    <footer class="site-foot">
      <p>内容依据论文表格整理；含量区间按分位得分口径推算，不是实测数据库。</p>
      <p class="site-foot-links">
        <a href="index.html">首页</a>
        <span aria-hidden="true">·</span>
        <a href="styles.html">风格库</a>
        <span aria-hidden="true">·</span>
        <a href="https://github.com/likangyu070710-source/beer-flavor-atlas" rel="noopener">GitHub 仓库</a>
      </p>
    </footer>
  </main>
</div>

<div class="modal" id="scaleModal" aria-hidden="true">
  <div class="modal-veil" data-close-scale></div>
  <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="scaleTitle">
    <button class="modal-x" type="button" data-close-scale aria-label="关闭">×</button>
    <div id="scaleBody"></div>
  </div>
</div>

<div class="tooltip" id="tooltip" role="status" aria-live="polite"></div>

<script src="data/flavor-data.js"></script>
<script src="data/i18n-en.js"></script>
<script src="assets/js/charts.js"></script>
<script src="assets/js/i18n.js"></script>
<script src="assets/js/art.js"></script>
<script src="assets/js/reactor.js"></script>
<script src="assets/js/pages.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>
"""


def main():
    for p in PAGES:
        out = (
            TEMPLATE.replace("@@TITLE_EN@@", html.escape(p["title_en"], quote=True))
            .replace("@@TITLE@@", html.escape(p["title"], quote=True))
            .replace("@@DESC@@", html.escape(p["desc"], quote=True))
            .replace("@@KEY@@", p["key"])
            .replace("@@FILE@@", p["file"])
            .replace("@@FAVICON@@", FAVICON)
            .replace("@@BRAND_ICON@@", BRAND_ICON)
            .replace("@@NAV@@", nav_items(p["key"]))
        )
        path = ROOT / p["file"]
        path.write_text(out, encoding="utf-8")
        print(f"  {p['file']:<16} {len(out):>6} bytes  ({p['cn']})")
    print(f"\n生成 {len(PAGES)} 个页面。")


if __name__ == "__main__":
    main()
