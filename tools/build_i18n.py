# -*- coding: utf-8 -*-
"""由 tools/i18n_zh_en.tsv 生成 data/i18n-en.js。

表里一行一条：中文原文 <TAB> 英文。
数字可写成 {n} 占位，运行时按原句里的数字顺序回填，
所以 “127 字” 和 “98 字” 共用一条。

另有一小撮运行期合成串（“属性 · stale_hops” 这类）靠分段回退处理，
在 EXTRA 里给出可复用的词头即可。
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "tools/i18n_zh_en.tsv"
OUT = ROOT / "data/i18n-en.js"
NUM = re.compile(r"\d+(?:\.\d+)?")

# 运行期按 “ · ” 拆段翻译时用到的词头
EXTRA = {
    "属性": "Attr",
    "风格档案": "Style file",
    "属性（总体）": "Attribute (overall)",
}


def norm(s):
    s = str(s).replace("\ufeff", "").replace("\r", "")
    s = re.sub(r"\s+", " ", s).strip()
    s = NUM.sub("{n}", s)
    s = re.sub(r"\s*\{n\}\s*", " {n} ", s)
    return re.sub(r"\s+", " ", s).strip()


def main():
    data, conflicts = {}, []
    for line in SRC.read_text(encoding="utf-8-sig").splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if "\t" not in line:
            print("!! 缺少制表符：", line[:40])
            continue
        zh, en = line.split("\t", 1)
        zh, en = zh.strip(), en.strip()
        if not zh or not en:
            continue
        k = norm(zh)
        ni, no = len(NUM.findall(zh)), en.count("{n}")
        if no and no != ni:
            print("!! 占位不匹配 zh=%d en=%d :: %s" % (ni, no, zh[:30]))
        if k in data and data[k] != en:
            conflicts.append((k, data[k], en))
        data[k] = en

    for k, v in EXTRA.items():
        data.setdefault(norm(k), v)

    js = (
        "/* 由 tools/build_i18n.py 生成，请勿直接编辑。\n"
        "   文案改动请改 tools/i18n_zh_en.tsv 后重跑脚本。 */\n"
        "window.I18N_EN = "
        + json.dumps(data, ensure_ascii=False, indent=0, sort_keys=True)
        + ";\n"
    )
    OUT.write_text(js, encoding="utf-8")
    print("entries:", len(data), "| written %.0f KB" % (OUT.stat().st_size / 1024))
    if conflicts:
        print("!! 同一中文出现多条不同译文：", len(conflicts))
        for k, a, b in conflicts[:3]:
            print("   ", k[:30], "->", a[:30], "|", b[:30])


if __name__ == "__main__":
    main()
