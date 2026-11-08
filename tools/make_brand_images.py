# -*- coding: utf-8 -*-
"""生成啤酒站的封面图与图标。

封面：1200x630，用 HTML/CSS 排版后截图，保证字体与网站一致；
图标：把站内那个啤酒杯 SVG 光栅化成 180 与 32 两个尺寸，直角不变形。
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = Path("D:/WorkBudyDATA/2026-10-30-18-20-23/beer-flavor-atlas")
IMG = ROOT / "images"
SHOTS = ROOT / "shots"
TMP = ROOT / "shots" / "_tmp"
for d in (IMG, SHOTS, TMP):
    d.mkdir(parents=True, exist_ok=True)

GLASS = """
<svg viewBox="0 0 120 160" fill="none">
  <defs>
    <linearGradient id="beer{g}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{hi}"/><stop offset="1" stop-color="{lo}"/>
    </linearGradient>
  </defs>
  <path d="M22 44h76l-7.5 96a18 18 0 0 1-18 17h-25a18 18 0 0 1-18-17L22 44Z" fill="url(#beer{g})"/>
  <g fill="#f7e8cc"><circle cx="38" cy="38" r="17"/><circle cx="60" cy="30" r="21"/><circle cx="82" cy="38" r="17"/>
  <rect x="21" y="36" width="78" height="17" rx="8.5"/></g>
  <path d="M34 96h52" stroke="rgba(255,255,255,.18)" stroke-width="3" stroke-linecap="round"/>
</svg>
"""

COVER = f"""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1200px; height:630px; overflow:hidden; position:relative;
    background:#0e0c0a; color:#f4ecdd;
    font-family:"PingFang SC","Microsoft YaHei","Segoe UI",sans-serif;
  }}
  .glow {{
    position:absolute; inset:0;
    background:
      radial-gradient(760px 520px at 82% 18%, rgba(233,169,78,.30), transparent 62%),
      radial-gradient(620px 420px at 6% 108%, rgba(134,171,142,.16), transparent 60%);
  }}
  .frame {{ position:absolute; inset:38px; border:1px solid rgba(236,223,203,.13); }}
  .text {{ position:absolute; left:84px; top:132px; width:640px; }}
  .kicker {{
    font-family:Consolas,monospace; font-size:15px; letter-spacing:.34em;
    color:#e9a94e; text-transform:uppercase; margin-bottom:30px;
  }}
  h1 {{ font-size:86px; line-height:1.12; letter-spacing:.02em; font-weight:600; }}
  h1 em {{
    display:block; font-family:Georgia,serif; font-style:italic; font-weight:400;
    font-size:40px; color:#f6cd85; letter-spacing:.05em; margin-top:18px;
  }}
  .rule {{ width:64px; height:2px; background:#e9a94e; margin:34px 0 24px; opacity:.8; }}
  .sub {{ font-size:21px; line-height:1.7; color:#d9cdb9; }}
  .sub b {{ color:#f4ecdd; font-weight:600; }}
  .glasses {{ position:absolute; right:82px; bottom:126px; display:flex; gap:20px; align-items:flex-end; }}
  .glasses svg {{ width:118px; height:158px; overflow:visible; filter:drop-shadow(0 22px 34px rgba(0,0,0,.55)); }}
  .glasses .s {{ width:92px; height:124px; opacity:.9; }}
  .foot {{
    position:absolute; left:84px; bottom:56px;
    font-family:Consolas,monospace; font-size:13.5px; letter-spacing:.12em; color:#7d7365;
  }}
</style></head><body>
  <div class="glow"></div><div class="frame"></div>
  <div class="text">
    <div class="kicker">Beer Flavor Atlas · 2026</div>
    <h1>啤酒风味图谱<em>Beer Flavor Atlas</em></h1>
    <div class="rule"></div>
    <p class="sub"><b>226</b> 项化学指标 · <b>22</b> 种风格 · <b>55</b> 个风味化合物<br>
    把一杯啤酒拆成能读、能调、能迁移的组合</p>
  </div>
  <div class="glasses">
    {GLASS.format(g="A", hi="#3a2a1e", lo="#150f0b")}
    {GLASS.format(g="B", hi="#f9d99a", lo="#cf8f2c")}
    {GLASS.format(g="C", hi="#7d2f43", lo="#3a1220")}
  </div>
  <div class="foot">250 COMMERCIAL BEERS · 50 SENSORY DIMENSIONS · 6 PAGES</div>
</body></html>"""

ICON = """<!doctype html><html><head><meta charset="utf-8"><style>
html,body{{margin:0;padding:0;background:transparent}}
.wrap{{width:{s}px;height:{s}px;background:#140f0a;display:grid;place-items:center}}
svg{{width:{i}px;height:{i}px}}
</style></head><body><div class="wrap">
<svg viewBox="0 0 40 40" fill="none">
  <path d="M12.4 13.8h15.2l-1.5 17.9a3.6 3.6 0 0 1-3.6 3.3h-5a3.6 3.6 0 0 1-3.6-3.3L12.4 13.8Z" fill="#e9a94e"/>
  <circle cx="15.4" cy="12.7" r="3.6" fill="#f7e8cc"/>
  <circle cx="20" cy="11.4" r="4.2" fill="#f7e8cc"/>
  <circle cx="24.6" cy="12.7" r="3.6" fill="#f7e8cc"/>
  <rect x="12.3" y="13.1" width="15.4" height="3.4" rx="1.7" fill="#f7e8cc"/>
</svg></div></body></html>"""

(TMP / "cover.html").write_text(COVER, encoding="utf-8")

with sync_playwright() as p:
    b = p.chromium.launch()

    # 封面：先出 PNG，再压成 <100KB 的 JPEG
    pg = b.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    pg.goto((TMP / "cover.html").as_uri(), wait_until="load")
    pg.wait_for_timeout(400)
    pg.screenshot(path=str(SHOTS / "beer-cover-1200.png"))
    pg.close()

    # 图标
    for size, inner, name in [(180, 118, "beer-appicon-180"), (32, 21, "beer-favicon-32")]:
        f = TMP / f"{name}.html"
        f.write_text(ICON.format(s=size, i=inner), encoding="utf-8")
        ip = b.new_page(viewport={"width": size, "height": size}, device_scale_factor=1)
        ip.goto(f.as_uri(), wait_until="load")
        ip.wait_for_timeout(200)
        ip.screenshot(path=str(SHOTS / f"{name}.png"), omit_background=False)
        ip.close()

    b.close()

# OG：JPEG，控制在 100 KB 以内
cover = Image.open(SHOTS / "beer-cover-1200.png").convert("RGB")
cover.save(IMG / "og-image.jpg", "JPEG", quality=86, optimize=True, progressive=True)
cover.save(SHOTS / "beer-cover-1200.jpg", "JPEG", quality=86, optimize=True, progressive=True)

# 站点自用图标
Image.open(SHOTS / "beer-appicon-180.png").convert("RGB").save(IMG / "apple-touch-icon.png", "PNG", optimize=True)
Image.open(SHOTS / "beer-favicon-32.png").convert("RGBA").save(IMG / "favicon-32.png", "PNG", optimize=True)
Image.open(SHOTS / "beer-appicon-180.png").convert("RGBA").resize((192, 192), Image.LANCZOS).save(IMG / "favicon-192.png", "PNG", optimize=True)

for f in sorted(IMG.glob("*")) + sorted(SHOTS.glob("beer-*")):
    if f.is_file():
        try:
            im = Image.open(f)
            print(f"{f.name:<28} {im.size[0]}x{im.size[1]}  {f.stat().st_size//1024} KB")
        except Exception:
            pass
