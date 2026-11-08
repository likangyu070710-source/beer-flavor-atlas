# -*- coding: utf-8 -*-
"""多页改造的冒烟测试：导航、标题、溢出、控制台错误、键盘可达性。"""
import sys
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8765"
PAGES = [
    ("index.html", "home"),
    ("styles.html", "style"),
    ("lab.html", "lab"),
    ("note.html", "note"),
    ("origin.html", "origin"),
    ("transfer.html", "transfer"),
]

errors = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.on("console", lambda m: errors.append(("console", m.type, m.text)) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(("pageerror", str(e))))

    for f, key in PAGES:
        page.goto(f"{BASE}/{f}?intro=0", wait_until="networkidle")
        h1 = page.locator("h1").first
        visible = h1.is_visible() if h1.count() else False
        txt = h1.inner_text().strip()[:26] if h1.count() else "—"
        nav = page.locator(".nav-item")
        cur = page.locator('.nav-item[aria-current="page"]')
        overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        # 导航 href 是否都是真实文件
        hrefs = nav.evaluate_all("els => els.map(e => e.getAttribute('href'))")
        print(f"{f:<15} h1={'✔' if visible else '✘'} {txt!r:<30} nav={nav.count()} current={cur.count()} "
              f"overflow={overflow} hrefs={hrefs}")

    # 点击导航：从首页进化合物页
    page.goto(f"{BASE}/index.html?intro=0", wait_until="networkidle")
    page.click('.nav-item[href="lab.html"]')
    page.wait_for_load_state("networkidle")
    print("\n导航跳转 ->", page.url.split("/")[-1], "| h1:", page.locator("h1").first.inner_text().strip()[:20])

    # 键盘：第一下 Tab 应落在 skip link
    page.goto(f"{BASE}/index.html?intro=0", wait_until="networkidle")
    page.keyboard.press("Tab")
    focused = page.evaluate("document.activeElement.className + '|' + document.activeElement.textContent.trim()")
    print("首个 Tab 焦点 ->", focused)

    # 手机视口
    m = browser.new_page(viewport={"width": 390, "height": 844})
    for f, _ in PAGES:
        m.goto(f"{BASE}/{f}?intro=0", wait_until="networkidle")
        ov = m.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        print(f"390px {f:<15} overflow={ov}")

    # 深链：直接进某个风格详情
    page.goto(f"{BASE}/styles.html?style=kriek", wait_until="networkidle")
    print("\n深链 ?style=kriek ->", page.locator("h1").first.inner_text().strip()[:30])

    browser.close()

print("\n=== 控制台错误 ===")
if errors:
    for e in errors[:12]:
        print(" ", e)
else:
    print("  无")
