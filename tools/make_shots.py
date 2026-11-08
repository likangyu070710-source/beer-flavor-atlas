# -*- coding: utf-8 -*-
"""生成两个项目的提交截图：1920x1080 桌面、375x812 手机。

用 DevTools 等价的方式（Playwright viewport 截图），不带浏览器边框。
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

JOBS = [
    ("http://127.0.0.1:8765/index.html", Path("D:/WorkBudyDATA/2026-10-30-18-20-23/beer-flavor-atlas/shots"), "beer"),
    ("http://127.0.0.1:8766/index.html", Path("D:/BIUH学习课程/Web/webproject/my-project/shots"), "danzhou"),
]

with sync_playwright() as p:
    b = p.chromium.launch()
    for url, outdir, tag in JOBS:
        outdir.mkdir(parents=True, exist_ok=True)

        d = b.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
        d.goto(url, wait_until="networkidle")
        d.wait_for_timeout(1200)
        d.screenshot(path=str(outdir / f"{tag}-desktop-1920.png"))
        print(f"{tag} desktop  1920x1080 -> {outdir}")
        d.close()

        m = b.new_page(viewport={"width": 375, "height": 812}, device_scale_factor=1, is_mobile=True, has_touch=True)
        m.goto(url, wait_until="networkidle")
        m.wait_for_timeout(1200)
        m.screenshot(path=str(outdir / f"{tag}-mobile-375.png"))
        print(f"{tag} mobile   375x812 -> {outdir}")
        m.close()
    b.close()
