# -*- coding: utf-8 -*-
"""跨页状态、语言切换、关键交互的回归测试 + 截图。"""
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8765"
shots = []

with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1440, "height": 900})

    # 1) 化合物页：添加一个化合物，看状态是否落盘
    page.goto(f"{BASE}/lab.html", wait_until="networkidle")
    before = page.locator(".rx-verdict").inner_text() if page.locator(".rx-verdict").count() else "—"
    picked = page.locator("[data-cid]").nth(3)
    name = picked.inner_text().split("\n")[0].strip()
    picked.click()
    page.wait_for_timeout(700)
    store = page.evaluate("sessionStorage.getItem('atlas-page-state')")
    print("lab 点击:", name, "| sessionStorage:", store[:90])

    # 2) 跳到品鉴笔记页，组合应延续
    page.click('.nav-item[href="note.html"]')
    page.wait_for_load_state("networkidle")
    note = page.locator(".note-card").inner_text()[:80].replace("\n", " ")
    print("note 页首段:", note)

    # 3) 语言切换：标题、html lang、导航
    page.click('[data-lang="en"]')
    page.wait_for_timeout(400)
    print("EN -> title:", page.title())
    print("EN -> html lang:", page.get_attribute("html", "lang"))
    print("EN -> nav:", page.locator(".nav-lab b").first.inner_text(), "| h1:",
          page.locator("h1").first.inner_text().strip()[:40])

    # 4) 英文回中文
    page.click('[data-lang="zh"]')
    page.wait_for_timeout(300)
    print("ZH -> title:", page.title(), "| lang:", page.get_attribute("html", "lang"))

    # 5) 迁移页：换目标风格，URL 是否跟随
    page.goto(f"{BASE}/transfer.html?from=pils&to=tripel", wait_until="networkidle")
    print("transfer 初始 URL:", page.url.split("/")[-1])
    page.select_option("#toSel", "kriek")
    page.wait_for_timeout(300)
    print("换目标后 URL:", page.url.split("/")[-1])

    # 6) 详情页截图
    page.goto(f"{BASE}/styles.html?style=tripel", wait_until="networkidle")
    page.wait_for_timeout(800)
    page.screenshot(path="shots/detail.png", full_page=False)
    shots.append("detail")

    page.goto(f"{BASE}/index.html?intro=0", wait_until="networkidle")
    page.wait_for_timeout(700)
    page.screenshot(path="shots/home.png", full_page=False)
    shots.append("home")

    m = b.new_page(viewport={"width": 390, "height": 844})
    m.goto(f"{BASE}/lab.html", wait_until="networkidle")
    m.wait_for_timeout(800)
    m.screenshot(path="shots/lab-mobile.png", full_page=False)
    shots.append("lab-mobile")

    b.close()

print("截图:", shots)
