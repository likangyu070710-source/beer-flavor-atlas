# -*- coding: utf-8 -*-
"""把多文件站点打包为单文件 HTML，便于转发（双击即可运行，无需服务器）。

用法：python tools/build_standalone.py
输出：dist/啤酒风味图谱.html
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "dist" / "啤酒风味图谱.html"

CSS = ROOT / "assets/css/style.css"
JS = [
    ROOT / "data/flavor-data.js",
    ROOT / "data/i18n-en.js",
    ROOT / "assets/js/charts.js",
    ROOT / "assets/js/i18n.js",
    ROOT / "assets/js/art.js",
    ROOT / "assets/js/reactor.js",
    ROOT / "assets/js/app.js",
]


def guard(text, tag):
    # 内联时不能出现会提前闭合标签的序列
    return text.replace("</" + tag, "<\\/" + tag)


def main():
    html = (ROOT / "index.html").read_text(encoding="utf-8")

    css = guard(CSS.read_text(encoding="utf-8"), "style")
    html = html.replace(
        '<link rel="stylesheet" href="assets/css/style.css">',
        "<style>\n" + css + "\n</style>",
    )

    for path in JS:
        src = guard(path.read_text(encoding="utf-8"), "script")
        tag = '<script src="%s"></script>' % path.relative_to(ROOT).as_posix()
        assert tag in html, "找不到脚本标签：" + tag
        html = html.replace(tag, "<script>\n" + src + "\n</script>")

    # 单文件版不需要再引用任何外部资源，确认干净
    left = re.findall(r'(?:src|href)="(?!data:|#)([^"]+)"', html)
    assert not left, "仍存在外部引用：%s" % left

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print("built:", OUT, "%.0f KB" % (OUT.stat().st_size / 1024))


if __name__ == "__main__":
    main()
