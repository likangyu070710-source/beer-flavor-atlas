# -*- coding: utf-8 -*-
"""
啤酒风味图谱 · 数据构建脚本
--------------------------------
把论文《基于多输出偏最小二乘、共表达网络与风格条件生成模型的啤酒风味解析与调控》
中的表格与结论，转成网站使用的结构化数据（data/flavor-data.js）。

数据来源标注约定（字段 src）：
  表5   —— 0–6 分感官分级节选
  表6   —— 共表达网络六个模块
  表8   —— 一级可归因维度的关键化合物
  表12  —— 四个风格的化学指纹（Cohen's d）
  表13  —— 三条风格轴的统计量
  表14  —— Tripel 迁移位移最大的化合物
  表21  —— 50 个感官维度的完整 Top-3
  表22  —— 决定模型形态的五个数据事实
  表27  —— 标记物核验
  图19  —— 四个缺陷化合物的逐风格分布

说明：论文未逐格公布 226 个化合物在 22 个风格上的实测浓度。本脚本以论文的
分位得分口径为基础，用“风格感官画像 × 化合物—感官敏感度”推算相对含量指数，
再乘以该化合物的基准浓度得到可读的含量区间；论文明确给出的数值（表12 的 d 值、
表13/14 的位移、表22 的阈值）以原文为准并在页面上单独标注。
"""

import json
import math
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "data" / "flavor-data.js"

AXES = [
    ("bitter", "苦味", "Bitterness"),
    ("hop", "酒花香", "Hop aroma"),
    ("ester", "酯香·果香", "Ester / fruity"),
    ("malt", "麦芽甜香", "Malt sweetness"),
    ("roast", "焙烤焦香", "Roast"),
    ("phenol", "酚味·辛香", "Phenolic / spice"),
    ("sour", "酸味", "Sourness"),
    ("alcohol", "酒精感", "Alcohol"),
    ("body", "酒体·口感", "Body / mouthfeel"),
    ("sulfur", "硫味", "Sulfur"),
    ("aged", "氧化陈味", "Aged / oxidized"),
    ("floral", "花香", "Floral"),
]
AXIS_KEYS = [a[0] for a in AXES]


def C(cid, cn, en, fam, mod, unit, ref, sens, aroma, palate="", finish="", note="", src=""):
    return dict(id=cid, cn=cn, en=en, family=fam, module=mod, unit=unit, ref=ref,
                sens=sens, aroma=aroma, palate=palate, finish=finish, note=note, src=src)


COMPOUNDS = [
    # ---------------- 酵母代谢 ----------------
    C("ethanol", "乙醇", "Ethanol", "yeast", 0, "mg/L", 50000,
      {"alcohol": 1.0, "body": 0.40, "ester": 0.15},
      "温热的酒精与极轻的溶剂气息", "撑起酒体骨架，带来温暖的口腔刺激", "酒精余热绵长，高浓度时略显灼烧",
      "发酵主产物，酒精感与酒体的共同来源", "表8 alcohol ρ=0.82"),
    C("ethyl_acetate", "乙酸乙酯", "Ethyl acetate", "yeast", 0, "mg/L", 25,
      {"ester": 0.78, "floral": 0.22, "aged": 0.10},
      "菠萝与清亮溶剂感的酯香", "带来轻快的果味前调", "散去得快，留下一点甜润",
      "酵母酯化的起点，过量呈指甲油味", "表12 Tripel d=0.72；表14 位移 +2.48"),
    C("isoamyl_acetate", "乙酸异戊酯", "Isoamyl acetate", "yeast", 0, "mg/L", 3.2,
      {"ester": 0.92, "floral": 0.12},
      "香蕉、梨与糖果般的甜润果香", "果味在口中铺开，甜感上扬", "果香收尾干净",
      "高发酵度艾尔的标志性酯", "表12 Tripel d=1.02"),
    C("isobutyl_acetate", "乙酸异丁酯", "Isobutyl acetate", "yeast", 0, "mg/L", 0.12,
      {"ester": 0.72, "floral": 0.30},
      "莓果与花香交织的轻快酯香", "", "花香先行散去，留一点果甜",
      "与乙酸异戊酯同步升降，强化果香层次", "表12 Tripel d=0.76"),
    C("ethyl_hexanoate", "己酸乙酯", "Ethyl hexanoate", "yeast", 0, "mg/L", 0.45,
      {"ester": 0.86, "malt": 0.10},
      "青苹果、草莓与一丝奶酪的浓郁果香", "中段果味最饱满", "油脂感让果香在余味里停留",
      "脂肪酸乙酯，发酵强度与酯化能力的指标", "表12 Tripel d=0.73"),
    C("ethyl_octanoate", "辛酸乙酯", "Ethyl octanoate", "yeast", 0, "mg/L", 0.9,
      {"ester": 0.80, "body": 0.18},
      "熟梨、杏与轻微皂感的丰满果香", "增加口感的圆润度", "皂感在尾段转为柔和的甜",
      "在酒精感、苦度、酒体等六个维度进入前三，是发酵强度的通用代理", "表8 六维共同候选"),
    C("ethyl_decanoate", "癸酸乙酯", "Ethyl decanoate", "yeast", 0, "mg/L", 0.25,
      {"ester": 0.62, "body": 0.15},
      "油脂感与蜡质的柔和果香", "让酒体显得更厚", "",
      "长链脂肪酸乙酯，过量带来皂感与腻感", "表21 sweetness 首位 ρ=0.39"),
    C("phenethyl_acetate", "乙酸苯乙酯", "Phenethyl acetate", "yeast", 0, "mg/L", 0.6,
      {"floral": 0.85, "ester": 0.42, "malt": 0.10},
      "玫瑰与蜂蜜的柔甜花香", "花香在中段变得柔软", "蜂蜜般的甜香留在口腔上部",
      "苯乙醇的酯化产物，玫瑰香的核心", "表12 Tripel d=0.70；表27 秩相关 0.930"),
    C("phenethyl_alcohol", "苯乙醇", "Phenethyl alcohol", "yeast", 3, "mg/L", 28,
      {"floral": 0.90, "malt": 0.12},
      "玫瑰花瓣与丁香般的甜花香", "花香铺满口腔", "花香细腻，收口略甜",
      "高级醇中最具花香者，Tripel 中显著偏高", "表6 模块3 代表物质"),
    C("isoamyl_alcohol", "异戊醇", "Isoamyl alcohol", "yeast", 0, "mg/L", 65,
      {"alcohol": 0.55, "body": 0.28, "ester": 0.12},
      "醇厚的杂醇油气息，衬托果香", "增加口感的重量", "酒精感延长",
      "高级醇主体，过量呈溶剂味", "表21 A_esters_isoaa 第3"),
    C("isobutanol", "异丁醇", "Isobutanol", "yeast", 0, "mg/L", 12,
      {"alcohol": 0.45, "body": 0.18},
      "轻微的溶剂与醇甜气息", "提升酒体的厚度", "",
      "发酵副产物，与酵母菌株和温度相关", "表21 F_hops_woody 首位"),
    C("mb2", "2-甲基-1-丁醇", "2-methyl-1-butanol", "yeast", 15, "mg/L", 12,
      {"alcohol": 0.42, "body": 0.20},
      "淡薄的醇香与麦芽底味", "使口感更饱满", "",
      "活跃发酵期的副产物", "表6 模块15 代表物质"),
    C("glycerol", "甘油", "Glycerol", "yeast", 0, "mg/L", 1800,
      {"body": 0.95, "malt": 0.22},
      "几乎无香，只在杯壁上留下痕迹", "带来圆润甜厚的口感与挂杯", "余味显得柔顺而不干",
      "酒体的第一贡献物，风格内相关退至第六位", "表8 body ρ=0.57；表14 位移 +2.08"),
    C("diacetyl", "双乙酰", "Diacetyl", "yeast", 15, "mg/L", 0.12,
      {"malt": 0.38, "body": 0.18},
      "黄油、奶油糖般的圆润香气", "口感变得滑腻", "过量时留下黏腻的甜",
      "缺陷化合物，阈值 0.09 mg/L 低于样本中位数 0.285", "表22 缺陷阈值"),
    C("acetaldehyde", "乙醛", "Acetaldehyde", "yeast", 15, "mg/L", 6,
      {"ester": 0.22, "aged": 0.48, "sour": 0.12},
      "青苹果与生青感", "入口有一瞬的尖锐", "转为纸板与未熟的果皮",
      "年轻啤酒与氧化啤酒的共同标志", "表8 F_malt_all ρ=0.47"),
    C("ethyl_propionate", "丙酸乙酯", "Ethyl propionate", "yeast", 0, "mg/L", 0.05,
      {"ester": 0.55, "floral": 0.15},
      "轻飘的果香与朗姆酒气息", "", "",
      "酯类谱系的次要成员", "表8 F_malt_cara 第2"),
    C("hexyl_acetate", "乙酸己酯", "Hexyl acetate", "yeast", 0, "mg/L", 0.06,
      {"ester": 0.58, "floral": 0.22},
      "苹果与梨的清甜果香", "", "",
      "热带水果酒花维度的首位化合物", "表21 F_hops_tropical ρ=0.28"),
    C("amyl_acetate", "乙酸戊酯", "Amyl acetate", "yeast", 0, "mg/L", 0.08,
      {"ester": 0.62, "floral": 0.10},
      "香蕉与糖果的甜香", "", "",
      "与乙酸异戊酯同族的酯", "表21 dms 第3（候选）"),
    C("isopentyl_butanoate", "丁酸异戊酯", "Isopentyl butanoate", "yeast", 0, "mg/L", 0.03,
      {"ester": 0.68, "floral": 0.12},
      "熟果与一点奶油感", "", "",
      "脂肪酸酯，指向发酵强度", "表21 X4vg 第3"),
    C("ethyl_isobutyrate", "异丁酸乙酯", "Ethyl isobutyrate", "yeast", 0, "mg/L", 0.05,
      {"ester": 0.58, "floral": 0.18},
      "莓果与甜香", "", "",
      "支链酸酯，增加果香的层次", "表21 A_hops_woody 第2"),
    C("octenol", "1-辛烯-3-醇", "1-octen-3-ol", "yeast", 3, "mg/L", 0.02,
      {"malt": 0.32, "aged": 0.38},
      "蘑菇与湿润谷物的气息", "口感显得沉闷", "陈味在尾段浮现",
      "氧化陈化模块的代表物质", "表6 模块3 代表物质"),
    C("lactic_acid", "乳酸", "Lactic acid", "wild", 0, "mg/L", 900,
      {"sour": 0.90, "body": 0.32},
      "柔和的酸奶与酸面团感", "酸味圆润，包裹舌面", "酸度缓慢退去，留下一点奶质",
      "酸啤的首要标志，Kriek 与 Lambic 中 d 值最高", "表8 lactic ρ=0.45；表12 Lambic d=2.20"),
    C("octanoic_acid", "辛酸", "Octanoic acid", "yeast", 0, "mg/L", 8,
      {"body": 0.22, "sour": 0.28, "phenol": 0.15},
      "羊膻与皂感的中链脂肪酸气息", "口感变得粗糙", "皂感在余味里滞留",
      "酵母自溶与脂肪酸代谢的标志", ""),
    # ---------------- 酒花 ----------------
    C("iso_alpha", "异α-酸", "Iso-alpha acids", "hop", 23, "mg/L", 28,
      {"bitter": 1.0, "hop": 0.25, "body": 0.15},
      "本身气味很淡，只在舌根留下干爽的苦", "苦味干净、持续且有抓舌感", "苦味绵延，支撑收口的干爽度",
      "苦度的机制锚点，风格内相关仍居前三", "表8 bitternes ρ=0.68"),
    C("linalool", "里那醇", "Linalool", "hop", 23, "mg/L", 0.09,
      {"hop": 0.86, "floral": 0.38},
      "柑橘皮、佛手与白花的酒花香气", "香气从鼻腔回到口腔", "花香轻巧地收尾",
      "酒花单萜醇的核心，受干投与发酵双重影响", "表21 A_hops_all ρ=0.41；表27 0.922"),
    C("geraniol", "香叶醇", "Geraniol", "hop", 23, "mg/L", 0.03,
      {"hop": 0.70, "floral": 0.52},
      "玫瑰与天竺葵的甜花香", "", "花香留得比里那醇久",
      "酒花花香的主力，Hoppy 风格中最高", "表27 最高风格 Hoppy，秩相关 0.918"),
    C("citronellol", "香茅醇", "Citronellol", "hop", 23, "mg/L", 0.02,
      {"hop": 0.55, "floral": 0.48},
      "柠檬草与花瓣的清香", "", "",
      "柑橘酒花维度的首位化合物", "表21 A_hops_citrus ρ=0.37"),
    C("nerol", "橙花醇", "Nerol", "hop", 23, "mg/L", 0.02,
      {"hop": 0.52, "floral": 0.42},
      "橙花与甜柑橘", "", "",
      "与香叶醇互为异构体", ""),
    C("cdbt", "二氢-β-松油醇", "Cis-dihydro-β-terpineol", "hop", 21, "mg/L", 0.35,
      {"hop": 0.90, "floral": 0.26},
      "干投酒花的草本、松脂与辛香调", "香气在口中停留较久", "草本苦香收尾",
      "酒花萜烯醇经发酵转化而来，同时受酒花投放与发酵进程影响", "表8 F_hops_all ρ=0.55"),
    C("beta_phellandrene", "β-水芹烯", "Beta-phellandrene", "hop", 26, "mg/L", 0.01,
      {"hop": 0.62, "phenol": 0.18},
      "胡椒与松针的辛香", "", "",
      "在多个酯香维度中作为风格代理出现", "表21 A_esters_fruity ρ=0.22"),
    C("alpha_terpineol", "α-松油醇", "Alpha-terpineol", "hop", 23, "mg/L", 0.05,
      {"hop": 0.55, "floral": 0.32},
      "丁香与松木的香气", "", "",
      "酒花单萜醇模块成员", "表21 orange 第2 ρ=0.21"),
    C("terpinen_4_ol", "4-松油醇", "Terpinen-4-ol", "hop", 23, "mg/L", 0.04,
      {"hop": 0.50, "phenol": 0.22},
      "泥土、胡椒与木质的气息", "", "",
      "陈化酒花中相对上升的萜烯醇", "表21 F_malt_bread ρ=0.32"),
    C("beta_caryophyllene", "β-石竹烯", "β-caryophyllene", "hop", 26, "mg/L", 0.06,
      {"hop": 0.55, "phenol": 0.32},
      "黑胡椒与木质辛香", "", "",
      "倍半萜模块成员，干投酒花的标志", "表6 模块26"),
    C("z_farnesene", "Z-β-法尼烯", "Z-β-farnesene", "hop", 26, "mg/L", 0.08,
      {"hop": 0.50, "floral": 0.22},
      "酒花精油中的青绿与花香", "", "",
      "倍半萜与脂肪酸酯模块的代表物质", "表6 模块26 代表物质"),
    C("farnesol", "法尼醇", "Farnesol", "hop", 21, "mg/L", 0.02,
      {"floral": 0.45, "hop": 0.30},
      "柔和的椴树花与蜂蜜香", "", "",
      "C15 萜烯醇模块代表物质", "表6 模块21 代表物质"),
    C("nerolidol", "橙花叔醇", "Nerolidol", "hop", 21, "mg/L", 0.03,
      {"floral": 0.48, "hop": 0.32},
      "橙花、木质与淡淡的青草", "略带油脂感", "",
      "C15 萜烯醇，陈化中缓慢增加", "表21 A_malt_grain 第3"),
    # ---------------- 麦芽与焙烤 ----------------
    C("furfural", "糠醛", "Furfural", "malt", 3, "mg/L", 0.35,
      {"roast": 0.55, "aged": 0.42, "malt": 0.22},
      "焦糖、杏仁与陈旧木桶的甜香", "带来焦糖般的甜感", "焦苦与干涩并存",
      "焙烤与陈化的双面指标，Tripel 中显著偏低", "表12 Tripel d=−0.98"),
    C("methylpyrazine", "甲基吡嗪", "Methylpyrazine", "malt", 3, "mg/L", 0.02,
      {"roast": 0.86, "malt": 0.26},
      "烘烤坚果、可可与咖啡的焙烤香", "苦味带上焦香", "焦苦绵长",
      "深色麦芽焙烤的标志，Tripel 中显著偏低", "表12 Tripel d=−0.90"),
    C("ethyl_furoate", "糠酸乙酯", "Ethyl furoate", "malt", 3, "mg/L", 0.01,
      {"roast": 0.52, "aged": 0.32},
      "焦糖与烤面包的焦甜", "", "",
      "焙烤麦芽的酯化产物，Tripel 中最低", "表12 Tripel d=−0.98"),
    C("furfuryl_alcohol", "糠醇", "Furfuryl alcohol", "malt", 3, "mg/L", 0.8,
      {"roast": 0.45, "aged": 0.52},
      "焦苦与陈化木质味", "口感发干", "干涩的焦苦停留",
      "长时间桶陈的标志，Lambic 中最高", "表12 Tripel d=−0.71；Lambic d=1.49"),
    C("phenylacetaldehyde", "苯乙醛", "Phenylacetaldehyde", "malt", 3, "mg/L", 0.12,
      {"floral": 0.42, "malt": 0.45, "aged": 0.22},
      "蜂蜜与玫瑰的甜香", "甜感圆润", "过量时转为陈化的纸味",
      "麦芽风味维度的第2位", "表8 F_malt_all ρ=0.28"),
    C("methanethiol", "甲硫醇", "Methanethiol", "malt", 15, "mg/L", 0.004,
      {"sulfur": 0.88, "roast": 0.32},
      "煮熟卷心菜与焦硫气息", "口腔里留下硫的钝感", "硫味散得慢",
      "焦糊麦芽维度的首位化合物", "表8 F_malt_burn ρ=0.40"),
    C("dms", "二甲基硫", "Dimethyl sulfide", "malt", 15, "mg/L", 0.024,
      {"sulfur": 0.90, "roast": 0.22},
      "煮玉米与熟蔬菜的硫味", "让酒体显得平", "硫味在余味里拖尾",
      "缺陷化合物，阈值 19 µg/L 低于样本中位数 24.2 µg/L", "表22 缺陷阈值"),
    C("benzaldehyde", "苯甲醛", "Benzaldehyde", "malt", 3, "mg/L", 0.08,
      {"malt": 0.38, "roast": 0.22},
      "杏仁与樱桃核的甜香", "", "",
      "与核果类风味相关", "表21 A_malt_bread 第3"),
    C("e_alpha_ionone", "E-α-紫罗兰酮", "E-α-ionone", "malt", 3, "mg/L", 0.0006,
      {"floral": 0.62, "malt": 0.32},
      "紫罗兰与干草的甜香", "", "",
      "麦芽与花香之间的桥梁", "表21 F_malt_all 第3"),
    C("e_beta_ionone", "E-β-紫罗兰酮", "E-β-ionone", "malt", 3, "mg/L", 0.0009,
      {"floral": 0.52, "roast": 0.32, "aged": 0.20},
      "紫罗兰、干梅与烘烤的复合香", "口感略干", "",
      "陈化模块与焙烤的交汇点", "表21 A_malt_all 第3"),
    # ---------------- 酚类与香料 ----------------
    C("4vg", "4-乙烯基愈创木酚", "4-vinylguaiacol", "phenol", 0, "mg/L", 0.9,
      {"phenol": 0.95},
      "丁香、胡椒与烟熏的酚香", "酚味在舌面留下轻微麻感", "丁香余味明显",
      "小麦啤的标志；67.2% 的样本落在同一原子值，是保原子变换的动机", "表8 X4vg ρ=0.49"),
    C("4eg", "4-乙基愈创木酚", "4-ethyl-guaiacol", "phenol", 3, "mg/L", 0.35,
      {"phenol": 0.86, "roast": 0.25, "aged": 0.32},
      "烟熏、香料与一点马厩气", "酚味与焦香叠加", "烟熏感在余味中拉长",
      "Tripel 中显著偏低，指向焙烤与烟熏的缺席", "表12 Tripel d=−0.88"),
    C("4ep", "4-乙基苯酚", "4-ethylphenol", "phenol", 3, "mg/L", 0.12,
      {"phenol": 0.76, "aged": 0.38},
      "皮革、马厩与动物性的酚味", "口感变得粗犷", "野味停留很久",
      "布雷特酵母与野生菌群的标志", "表12 Kriek d=1.50"),
    C("eugenol", "丁香酚", "Eugenol", "phenol", 3, "mg/L", 0.03,
      {"phenol": 0.95, "malt": 0.10},
      "丁香与香料的热感", "口腔有温热麻感", "香料余味持久",
      "Kriek 中最高（d=2.03），来自樱桃核与香料", "表12 Kriek d=2.03"),
    C("guaiacol", "愈创木酚", "Guaiacol", "phenol", 3, "mg/L", 0.05,
      {"phenol": 0.86, "roast": 0.35, "aged": 0.22},
      "烟熏、药草与木炭的气息", "烟熏感包裹舌面", "烟熏与苦味一起收尾",
      "烟熏麦芽与桶陈的共同产物", "表6 模块3 代表物质"),
    # ---------------- 理化与其他 ----------------
    C("co2", "二氧化碳", "Carbon dioxide", "other", 0, "mg/L", 5000,
      {"body": 0.12, "bitter": 0.18, "sour": 0.22},
      "无香，只有气泡的刺激", "气泡带来清爽与轻微的刺感", "气泡散去后苦味更明显",
      "碳酸化程度影响苦味与清爽感的感知", "表8 co2 ρ=0.48"),
    C("so2", "二氧化硫", "SO2", "other", 0, "mg/L", 8,
      {"sulfur": 0.90},
      "刺鼻的硫味与火柴头气息", "低量时几乎不可感", "高量时喉咙发紧",
      "抗氧化剂，Pils/Lager 中显著偏高（d=0.96）", "表12 Pils d=0.96"),
    C("iron", "铁", "Iron", "other", 0, "mg/L", 0.08,
      {"aged": 0.40, "body": 0.12, "bitter": 0.08},
      "金属与铁腥感", "口感发涩", "金属味在余味里残留",
      "酒花型风格的代理指标，非香气成因", "表8 A_hops_noble 第2；B.5 风格代理"),
    C("t2n", "反式-2-壬烯醛", "trans-2-nonenal", "malt", 3, "mg/L", 0.0015,
      {"aged": 0.92, "roast": 0.10},
      "纸板、陈旧油脂与硬纸箱", "口感发干、失去果汁感", "纸板味久久不退",
      "氧化陈化的头号标志，缺陷集合成员", "表22 缺陷集合；A_hops_all 首位"),
]

UNIT_FIX = {
    "t2n": ("µg/L", 1.5), "dms": ("µg/L", 24), "methanethiol": ("µg/L", 4),
    "e_alpha_ionone": ("µg/L", 0.6), "e_beta_ionone": ("µg/L", 0.9),
    "linalool": ("µg/L", 90), "geraniol": ("µg/L", 30), "citronellol": ("µg/L", 20),
    "nerol": ("µg/L", 20), "cdbt": ("µg/L", 350), "beta_phellandrene": ("µg/L", 10),
    "alpha_terpineol": ("µg/L", 50), "terpinen_4_ol": ("µg/L", 40),
    "beta_caryophyllene": ("µg/L", 60), "z_farnesene": ("µg/L", 80),
    "farnesol": ("µg/L", 20), "nerolidol": ("µg/L", 30),
    "methylpyrazine": ("µg/L", 20), "ethyl_furoate": ("µg/L", 10),
    "phenylacetaldehyde": ("µg/L", 120), "benzaldehyde": ("µg/L", 80),
    "hexyl_acetate": ("µg/L", 60), "amyl_acetate": ("µg/L", 80),
    "isopentyl_butanoate": ("µg/L", 30), "ethyl_isobutyrate": ("µg/L", 50),
    "ethyl_propionate": ("µg/L", 50), "octenol": ("µg/L", 20),
    "ethyl_decanoate": ("µg/L", 250), "4eg": ("µg/L", 350), "4ep": ("µg/L", 120),
    "guaiacol": ("µg/L", 50), "eugenol": ("µg/L", 30), "furfural": ("µg/L", 350),
    "furfuryl_alcohol": ("µg/L", 800), "t2n_x": ("µg/L", 1),
}
# 乳酸、乙酸、4-乙基苯酚归入野生菌群
FAMILY_FIX = {"lactic_acid": "wild", "acetic_acid": "wild", "4ep": "wild"}

STYLES = [
    dict(id="pils", cn="皮尔森 / 拉格", en="Pils / Lager", group="lager", n=11, abv="4.4–5.2%",
         p=[3.4, 3.0, 2.6, 3.0, 0.6, 0.5, 0.9, 2.6, 2.4, 1.7, 0.8, 1.6],
         desc="低温长时发酵的淡色拉格，干净的麦芽底味上浮着草本酒花香，收口干爽。",
         src="表12 / 表13 / 表22"),
    dict(id="low", cn="低醇 / 无醇", en="Low / No alcohol", group="lager", n=None, abv="≤1.2%",
         p=[2.0, 1.8, 1.4, 2.6, 0.5, 0.4, 1.0, 0.7, 1.2, 1.2, 0.9, 1.0],
         desc="酒精被压到几乎不可感，风味重心落在麦芽甜香与轻薄的酒体上。",
         src="表5 #83"),
    dict(id="wheat", cn="小麦啤", en="Wheat", group="wheat", n=None, abv="4.5–5.5%",
         p=[2.6, 2.6, 3.2, 3.0, 0.5, 2.4, 1.6, 2.8, 2.9, 0.8, 1.0, 2.4],
         desc="小麦蛋白带来柔和的浑浊酒体，酵母酚香与果香交织成丁香与香蕉的组合。",
         src="表5 #142；表27 4VG"),
    dict(id="fruit", cn="果味啤酒", en="Fruitbeer", group="sour", n=None, abv="4.0–6.0%",
         p=[1.4, 1.4, 3.6, 3.6, 0.5, 0.8, 2.6, 2.2, 2.8, 0.6, 0.8, 2.2],
         desc="在基酒上叠加果汁或果泥，果香主导、酸度上升，苦味退到背景。",
         src="图19"),
    dict(id="lambic", cn="兰比克", en="Lambic", group="sour", n=11, abv="5.0–6.5%",
         p=[2.0, 2.0, 3.0, 1.6, 0.6, 1.8, 5.2, 2.2, 2.4, 1.4, 2.4, 1.0],
         desc="自然发酵、长时间桶陈，乳酸与乙酸共同构成本能的酸，混着谷仓与皮革的野性。",
         src="表12 / 表13 / 表27"),
    dict(id="kriek", cn="樱桃兰比克", en="Kriek", group="sour", n=10, abv="5.0–6.5%",
         p=[1.8, 1.8, 3.4, 2.4, 0.6, 2.6, 5.0, 2.2, 2.8, 0.8, 1.8, 2.4],
         desc="兰比克基酒浸渍樱桃，果酸与乳酸叠加，杏仁与丁香从核果里透出来。",
         src="表12 / 表13"),
    dict(id="hoppy", cn="酒花型艾尔", en="Hoppy", group="ale", n=None, abv="5.5–7.5%",
         p=[5.0, 5.0, 3.2, 2.2, 0.8, 1.0, 1.0, 4.0, 3.0, 0.8, 1.2, 3.0],
         desc="以大量酒花投放与干投为核心，柑橘、松脂与热带水果层层堆叠，苦味干净而持续。",
         src="表5 #213；表27"),
    dict(id="wfa", cn="西佛兰德艾尔", en="West Flanders ale", group="sour", n=None, abv="5.5–7.0%",
         p=[2.4, 2.0, 2.4, 2.8, 1.4, 2.0, 4.2, 2.8, 3.0, 1.0, 2.8, 1.2],
         desc="混合发酵的红色艾尔，酸度明快，果味与香醋气息交织，收口干。",
         src="表12 乙酸实测最高"),
    dict(id="brett", cn="布雷特 / 混合发酵", en="Brett / cofermented", group="sour", n=None, abv="5.0–7.0%",
         p=[2.0, 1.8, 2.8, 2.6, 0.8, 3.0, 3.6, 2.8, 2.6, 1.2, 2.0, 1.6],
         desc="布雷特酵母主导的混合发酵，马厩、皮革与熟果味并存，酒体薄而层次多。",
         src="表6 模块3"),
    dict(id="stout", cn="世涛 / 波特", en="Stout / Porter", group="dark", n=None, abv="5.0–9.0%",
         p=[5.0, 4.0, 3.0, 3.6, 4.8, 1.4, 1.0, 4.0, 4.2, 0.8, 1.6, 1.0],
         desc="深色麦芽经高温焙烤，咖啡、可可与焦糖交织，苦味厚重、酒体饱满。",
         src="表5 #202；表6 模块26 邻接"),
    dict(id="amber", cn="琥珀艾尔", en="Amber", group="ale", n=None, abv="4.8–6.0%",
         p=[3.8, 3.0, 3.0, 4.0, 1.8, 0.6, 0.8, 3.2, 3.2, 0.6, 1.0, 2.2],
         desc="中等色度的艾尔，焦糖麦芽的甜香与温和的苦味取得平衡。",
         src="画像形状相关最低 0.456"),
    dict(id="scotch", cn="苏格兰艾尔", en="Scotch", group="dark", n=None, abv="6.0–9.0%",
         p=[3.0, 2.0, 2.4, 4.6, 3.6, 1.0, 0.8, 4.4, 4.2, 0.8, 2.2, 1.4],
         desc="长时间煮麦汁带来焦糖化，麦芽甜厚、酒精温暖，泥煤与烟熏若有若无。",
         src="表13 邻接 Christmas 6.14"),
    dict(id="flanders", cn="佛兰德老棕", en="Flanders old brown", group="sour", n=None, abv="5.0–7.0%",
         p=[2.2, 1.6, 2.6, 3.6, 2.6, 2.2, 4.4, 3.2, 3.4, 1.0, 3.0, 1.4],
         desc="棕色基酒经乳酸菌与酵母长期作用，酸、甜、木桶三者在口中拉锯。",
         src="表13 邻接"),
    dict(id="brown", cn="棕色艾尔", en="Brown", group="ale", n=None, abv="4.5–6.5%",
         p=[3.0, 2.2, 2.8, 4.0, 2.6, 0.8, 0.8, 3.2, 3.4, 0.6, 1.2, 1.6],
         desc="坚果与焦糖的棕色艾尔，苦味克制，麦芽风味占主导。",
         src="表13 邻接 4.78"),
    dict(id="saison", cn="赛松", en="Saison", group="ale", n=None, abv="5.0–8.0%",
         p=[4.2, 3.6, 3.4, 2.4, 0.8, 2.4, 2.4, 3.8, 2.2, 0.8, 1.0, 2.4],
         desc="高温发酵的农舍艾尔，酵母酚香辛锐，酒体干爽，苦味收得利落。",
         src="图18 可辨识性"),
    dict(id="blond", cn="金色艾尔", en="Blond", group="ale", n=31, abv="6.0–7.5%",
         p=[4.0, 3.2, 3.4, 2.8, 0.6, 0.6, 1.0, 3.8, 3.0, 0.6, 0.8, 2.6],
         desc="浅色高发酵度艾尔，果香清亮，苦味中等，收口干净并带一点酒精暖意。",
         src="表5 #30；表13 邻接 Tripel 5.01"),
    dict(id="strong", cn="烈性艾尔", en="Strong ale", group="ale", n=None, abv="7.0–11.0%",
         p=[3.8, 3.4, 3.8, 4.0, 1.6, 1.2, 1.0, 4.8, 4.2, 0.6, 1.4, 2.6],
         desc="高浓度麦汁发酵，酯香与酒精同时上扬，酒体厚实，余味悠长。",
         src="表5 #170；表27 乙酸乙酯最高"),
    dict(id="xmas", cn="圣诞啤酒", en="Christmas", group="dark", n=None, abv="7.0–10.0%",
         p=[3.6, 2.6, 3.6, 4.4, 3.2, 2.6, 1.0, 4.2, 4.4, 0.8, 1.8, 2.2],
         desc="香料与深色麦芽同台，肉桂、丁香与焦糖构成节庆式的甜香。",
         src="表13 邻接"),
    dict(id="faro", cn="法罗", en="Faro", group="sour", n=3, abv="4.0–5.5%",
         p=[1.6, 1.4, 2.8, 3.8, 0.6, 1.6, 4.4, 2.2, 2.8, 0.8, 2.0, 1.0],
         desc="兰比克调入糖浆，酸度被甜味柔化，成为易饮的酸甜平衡。",
         src="表22 仅 3 例"),
    dict(id="brut", cn="布鲁特", en="Brut", group="abbey", n=4, abv="8.0–11.0%",
         p=[2.8, 2.8, 3.2, 2.2, 0.5, 0.5, 1.4, 4.2, 1.8, 0.8, 0.6, 2.4],
         desc="香槟化的高发酵度啤酒，极干的口感、活跃的气泡与细腻的果香。",
         src="表22 仅 4 例；表13 邻接 Tripel 8.50"),
    dict(id="tripel", cn="三料", en="Tripel", group="abbey", n=28, abv="8.0–10.0%",
         p=[4.0, 4.4, 4.6, 2.6, 0.6, 0.6, 1.0, 4.2, 3.0, 0.5, 0.8, 3.4],
         desc="修道院式高发酵度金色烈性艾尔，酯香饱满、酒精温暖，收口却意外干爽。",
         src="表5 #147；表12 / 表13 / 表14"),
    dict(id="dubbel", cn="双料", en="Dubbel", group="abbey", n=None, abv="6.0–8.0%",
         p=[3.0, 2.4, 3.8, 4.2, 2.8, 1.2, 1.0, 4.0, 3.8, 0.6, 1.4, 2.0],
         desc="深色修道院双料，焦糖与深色果脯的甜香，酒体中等偏厚。",
         src="表13 邻接 Brown 4.97"),
]

# 论文明确给出的特征组合：强制该风格在该化合物上的相对指数（1.0 = 基准）
OVERRIDE = {
    ("wheat", "4vg"): 2.15, ("pils", "4vg"): 0.03, ("hoppy", "4vg"): 0.05,
    ("tripel", "4vg"): 0.08, ("kriek", "4vg"): 0.95, ("lambic", "4vg"): 1.35,
    ("saison", "4vg"): 1.30, ("brett", "4vg"): 0.45, ("stout", "4vg"): 0.10,
    ("lambic", "lactic_acid"): 2.60, ("kriek", "lactic_acid"): 2.25,
    ("wfa", "lactic_acid"): 2.10, ("flanders", "lactic_acid"): 1.95,
    ("faro", "lactic_acid"): 2.30, ("brett", "lactic_acid"): 1.40,
    ("wheat", "lactic_acid"): 1.25, ("pils", "lactic_acid"): 0.32,
    ("tripel", "lactic_acid"): 0.45, ("hoppy", "lactic_acid"): 0.55,
    ("lambic", "acetic_acid"): 1.70, ("kriek", "acetic_acid"): 1.40,
    ("faro", "acetic_acid"): 1.45, ("wfa", "acetic_acid"): 1.55,
    ("tripel", "acetic_acid"): 0.42, ("pils", "acetic_acid"): 0.30,
    ("pils", "iso_alpha"): 1.18, ("hoppy", "iso_alpha"): 1.52, ("stout", "iso_alpha"): 1.42,
    ("tripel", "iso_alpha"): 1.24, ("wheat", "iso_alpha"): 0.58,
    ("lambic", "iso_alpha"): 0.22, ("kriek", "iso_alpha"): 0.18,
    ("low", "iso_alpha"): 0.72, ("blond", "iso_alpha"): 1.05,
    ("tripel", "isoamyl_acetate"): 1.55, ("tripel", "isobutyl_acetate"): 1.62,
    ("tripel", "ethyl_hexanoate"): 1.48, ("tripel", "ethyl_octanoate"): 1.34,
    ("tripel", "phenethyl_acetate"): 1.46, ("tripel", "ethyl_acetate"): 1.42,
    ("tripel", "ethanol"): 1.32,
    ("strong", "ethanol"): 1.46, ("brut", "ethanol"): 1.30, ("dubbel", "ethanol"): 1.22,
    ("scotch", "ethanol"): 1.36, ("xmas", "ethanol"): 1.20, ("low", "ethanol"): 0.10,
    ("tripel", "furfural"): 0.26, ("tripel", "methylpyrazine"): 0.14,
    ("tripel", "ethyl_furoate"): 0.12, ("tripel", "4eg"): 0.18,
    ("tripel", "furfuryl_alcohol"): 0.22,
    ("kriek", "eugenol"): 2.30, ("kriek", "4ep"): 2.40, ("kriek", "4eg"): 1.55,
    ("brett", "4ep"): 2.10, ("brett", "4eg"): 1.75, ("brett", "guaiacol"): 1.65,
    ("lambic", "furfuryl_alcohol"): 1.85, ("lambic", "furfural"): 1.55,
    ("pils", "so2"): 1.62, ("tripel", "so2"): 0.55, ("blond", "so2"): 0.52,
    ("amber", "so2"): 0.55, ("brown", "so2"): 0.55, ("strong", "so2"): 0.50,
    ("dubbel", "so2"): 0.55, ("fruit", "so2"): 0.50, ("brut", "so2"): 0.48,
    ("scotch", "so2"): 0.50, ("xmas", "so2"): 0.50, ("saison", "so2"): 0.50,
    ("brett", "so2"): 0.55, ("hoppy", "so2"): 0.55, ("wheat", "so2"): 0.60,
    ("kriek", "so2"): 0.45, ("faro", "so2"): 0.45, ("lambic", "so2"): 0.40,
    ("stout", "so2"): 0.45, ("flanders", "so2"): 0.52, ("wfa", "so2"): 0.50,
    ("low", "so2"): 0.60, ("pils", "linalool"): 0.52, ("pils", "geraniol"): 0.45,
    ("wheat", "linalool"): 1.45, ("wheat", "geraniol"): 1.35,
    ("hoppy", "linalool"): 2.05, ("hoppy", "geraniol"): 2.10, ("hoppy", "cdbt"): 2.25,
    ("hoppy", "citronellol"): 1.95, ("hoppy", "beta_caryophyllene"): 1.85,
    ("stout", "methylpyrazine"): 2.55, ("stout", "furfural"): 2.25,
    ("stout", "methanethiol"): 2.05, ("stout", "dms"): 1.15,
    ("scotch", "methylpyrazine"): 2.05, ("scotch", "furfural"): 1.90,
    ("pils", "diacetyl"): 0.42, ("pils", "acetaldehyde"): 0.55,
    ("tripel", "dms"): 0.55, ("tripel", "diacetyl"): 0.42,
    ("tripel", "glycerol"): 1.18, ("lambic", "t2n"): 1.35,
}

# 化合物在风味上的重要性权重（影响“关键化合物”排序，避免微量酯类挤占名单）
IMPORTANCE = {
    "ethanol": 1.0, "iso_alpha": 1.0, "isoamyl_acetate": .92, "ethyl_acetate": .85,
    "ethyl_octanoate": .80, "ethyl_hexanoate": .78, "linalool": .88, "geraniol": .60,
    "cdbt": .80, "4vg": .95, "4eg": .70, "4ep": .55, "eugenol": .60, "guaiacol": .55,
    "lactic_acid": .95, "acetic_acid": .85, "glycerol": .85, "diacetyl": .80,
    "acetaldehyde": .65, "dms": .75, "t2n": .70, "methylpyrazine": .80, "furfural": .75,
    "furfuryl_alcohol": .60, "methanethiol": .60, "phenethyl_alcohol": .80,
    "phenethyl_acetate": .75, "isoamyl_alcohol": .65, "co2": .60, "so2": .60,
    "iron": .40, "phenylacetaldehyde": .55, "beta_caryophyllene": .55,
    "z_farnesene": .45, "isobutyl_acetate": .70, "isobutanol": .45, "mb2": .40,
    "octenol": .45, "nerolidol": .40, "farnesol": .35, "citronellol": .55,
    "nerol": .40, "alpha_terpineol": .45, "terpinen_4_ol": .45, "beta_phellandrene": .40,
    "ethyl_decanoate": .55, "octanoic_acid": .50, "e_alpha_ionone": .45,
    "e_beta_ionone": .45, "benzaldehyde": .35, "ethyl_propionate": .30,
    "hexyl_acetate": .35, "amyl_acetate": .30, "isopentyl_butanoate": .30,
    "ethyl_isobutyrate": .30, "ethyl_furoate": .35,
}


NOTE_CN = {"color": "色度", "bitter": "苦度", "protein": "蛋白", "ph": "pH", "des": "DES",
           "beta_glucan": "β-葡聚糖", "epicubenol": "表库贝醇", "humulone_epoxide": "葎草酮环氧化物 II",
           "alpha_muurolol": "α-木罗醇", "beta_ocimene": "β-罗勒烯"}

# 论文表12 给出的四风格指纹（Cohen's d），用于页面直接展示
FINGERPRINT = {
    "tripel": dict(pos=[("isoamyl_acetate", 1.02), ("isobutyl_acetate", 0.76), ("ethyl_hexanoate", 0.73),
                        ("ethyl_octanoate", 0.72), ("phenethyl_acetate", 0.70)],
                   neg=[("ethyl_furoate", -0.98), ("methylpyrazine", -0.90), ("4eg", -0.88),
                        ("furfuryl_alcohol", -0.71), ("color", -0.71)]),
    "kriek": dict(pos=[("eugenol", 2.03), ("lactic_acid", 1.98), ("ethyl_benzoate", 1.85),
                       ("beta_ocimene", 1.76), ("4ep", 1.50)],
                  neg=[("beta_glucan", -1.19), ("epicubenol", -1.18), ("des", -1.14),
                       ("bitter", -1.11), ("humulone_epoxide", -1.10)]),
    "lambic": dict(pos=[("lactic_acid", 2.20), ("furfuryl_alcohol", 1.49), ("isopentenyl_isobutyrate", 1.33),
                        ("4vg", 1.32), ("acetic_acid", 1.25)],
                   neg=[("ph", -2.01), ("alpha_muurolol", -1.08), ("bitter", -1.08),
                        ("phenylacetaldehyde", -1.01), ("isoamyl_acetate", -0.98)]),
    "pils": dict(pos=[("so2", 0.96), ("mb2", 0.74), ("z_farnesal", 0.55),
                      ("ethyl_hexanol", 0.51), ("humulene_14", 0.50)],
                 neg=[("protein", -1.91), ("germacrene_d", -1.61), ("color", -1.53),
                      ("styrene", -1.23), ("linalool", -1.16)]),
}

NAME_CN = {
    "Beta-phellandrene": "β-水芹烯", "Furfural": "糠醛", "E-β-ionone": "E-β-紫罗兰酮",
    "Z-nerolidol": "Z-橙花叔醇", "Ethyl tiglate": "惕各酸乙酯", "Carbon dioxide": "二氧化碳",
    "Benzaldehyde": "苯甲醛", "4-ethyl-guaiacol": "4-乙基愈创木酚", "Phenethyl alcohol": "苯乙醇",
    "Y-methyl-1-octanol": "γ-甲基-1-辛醇", "Methylpyrazine": "甲基吡嗪",
    "Methyl isoeugenol": "甲基异丁香酚", "E-2-nonenal": "反式-2-壬烯醛", "Linalool": "里那醇",
    "Dimethyl sulfide": "二甲基硫", "Citronellol": "香茅醇",
    "Trans-dihydro-α-terpinyl acetate": "反式二氢-α-乙酸松油酯", "Methyl heptenone": "甲基庚烯酮",
    "Ethyl octanoate": "辛酸乙酯", "Iron": "铁", "Ethyl 2-hexenoate": "2-己烯酸乙酯",
    "E-ortho-methoxy cinnamaldehyde": "反式邻甲氧基肉桂醛", "Ethyl 2-methylbutyrate": "2-甲基丁酸乙酯",
    "N-hexanol": "正己醇", "Acetaldehyde": "乙醛", "Isoamyl alcohol": "异戊醇",
    "Ethyl acetate": "乙酸乙酯", "E,Z-farnesal": "E,Z-法尼醛", "Ambroxide": "龙涎香醚",
    "E-dihydro-apofarnesal": "E-二氢降法尼醛", "E-α-ionone": "E-α-紫罗兰酮", "Eugenol": "丁香酚",
    "Epicubenol": "表库贝醇", "Terpinen-4-ol": "4-松油醇", "3-methyl-2-butenal": "3-甲基-2-丁烯醛",
    "Ethyl propionate": "丙酸乙酯", "Methanethiol": "甲硫醇", "Glycerol": "甘油",
    "Cis-dihydro-β-terpineol": "二氢-β-松油醇", "Geosmin": "土臭素", "Hexyl acetate": "乙酸己酯",
    "Isobutanol": "异丁醇", "Neo-allo-ocimene": "新别罗勒烯", "13-epi manool oxide": "13-表-泪杉醇氧化物",
    "Eucalyptol": "桉叶油醇", "2-methyltetrahydrofuran-3-one": "2-甲基四氢呋喃-3-酮",
    "Ethyl decanoate": "癸酸乙酯", "Iso-alpha acids": "异α-酸",
    "Caryophylla-4,8-dien-5-ol": "石竹烯-4,8-二烯-5-醇", "E,E-2,4-decadienal": "E,E-2,4-癸二烯醛",
    "Amyl acetate": "乙酸戊酯", "Ethyl 3-methylbutyrate": "3-甲基丁酸乙酯",
    "Gamma-eudesmol": "γ-桉叶醇", "α-phellandrene": "α-水芹烯", "Cis-linalool oxide": "顺式里那醇氧化物",
    "Ethyl linalool": "乙基里那醇", "Alpha-terpineol": "α-松油醇",
    "Z,Z-geranyl linalool": "Z,Z-香叶基里那醇", "Terpinolene": "异松油烯",
    "Cis-β-terpineol": "顺式-β-松油醇", "Limonene": "柠檬烯", "Lactic acid": "乳酸",
    "Acetic acid": "乙酸", "Isoamyl acetate": "乙酸异戊酯", "3-methyl-2-hexanol": "3-甲基-2-己醇",
    "2-butyl octanoate": "2-丁基辛酸酯", "Styrene": "苯乙烯", "Isopentyl butanoate": "丁酸异戊酯",
    "Neryl formate": "甲酸橙花酯", "4-vinylguaiacol": "4-乙烯基愈创木酚",
}

# 50 个感官维度（表21），顺序与论文一致
EVIDENCE = [
    ("A_malt_all", "麦芽香（总体）", "aroma", [("Beta-phellandrene", .83, .29, 0), ("Furfural", .91, .25, 0), ("E-β-ionone", .86, .25, 0)]),
    ("A_malt_grain", "谷物香", "aroma", [("Beta-phellandrene", .46, .23, 1), ("Furfural", .40, .19, 1), ("Z-nerolidol", .48, .11, 1)]),
    ("A_malt_bread", "面包香", "aroma", [("Ethyl tiglate", .79, .24, 0), ("Carbon dioxide", .69, .22, 0), ("Benzaldehyde", .67, .12, 0)]),
    ("A_malt_cara", "焦糖麦芽香", "aroma", [("Furfural", .93, .30, 0), ("4-ethyl-guaiacol", .67, .14, 0), ("Phenethyl alcohol", .76, .13, 0)]),
    ("A_malt_burn", "焦糊麦芽香", "aroma", [("Y-methyl-1-octanol", .52, .26, 1), ("Methylpyrazine", .71, .17, 0), ("Methyl isoeugenol", .55, .03, 1)]),
    ("A_hops_all", "酒花香气（总体）", "aroma", [("E-2-nonenal", .69, .43, 0), ("Linalool", .67, .41, 0), ("Dimethyl sulfide", .72, .40, 0)]),
    ("A_hops_citrus", "柑橘酒花", "aroma", [("Citronellol", .87, .37, 0), ("Trans-dihydro-α-terpinyl acetate", .77, .29, 0), ("Methyl heptenone", .78, .27, 0)]),
    ("A_hops_tropical", "热带水果酒花", "aroma", [("Dimethyl sulfide", .92, .32, 0), ("Citronellol", .71, .26, 0), ("Beta-phellandrene", .86, .23, 0)]),
    ("A_hops_noble", "贵族酒花", "aroma", [("Ethyl octanoate", .84, .48, 0), ("Iron", .88, .33, 0), ("Ethyl 2-hexenoate", .67, .32, 0)]),
    ("A_hops_woody", "木质酒花", "aroma", [("E-ortho-methoxy cinnamaldehyde", .73, .24, 0), ("Ethyl 2-methylbutyrate", .79, .24, 0), ("Iron", .73, .12, 0)]),
    ("A_esters_all", "酯香（总体）", "aroma", [("N-hexanol", .93, .36, 0), ("Acetaldehyde", .98, .35, 0), ("Isoamyl alcohol", .50, .30, 1)]),
    ("A_esters_ethac", "乙酸酯香", "aroma", [("Ethyl acetate", .75, .36, 0), ("Acetaldehyde", .89, .34, 0), ("E,Z-farnesal", .70, .27, 0)]),
    ("A_esters_isoaa", "乙酸异戊酯香", "aroma", [("N-hexanol", .92, .34, 0), ("Isoamyl alcohol", .51, .22, 1), ("Ambroxide", .51, .10, 1)]),
    ("A_esters_flower", "花香酯", "aroma", [("Beta-phellandrene", .82, .19, 0), ("E-dihydro-apofarnesal", .63, .15, 0), ("E-α-ionone", .84, .09, 0)]),
    ("A_esters_fruity", "果香酯", "aroma", [("Beta-phellandrene", .95, .22, 0), ("Eugenol", .59, .19, 1), ("Epicubenol", .90, .17, 0)]),
    ("F_malt_all", "麦芽风味（总体）", "flavour", [("Acetaldehyde", .99, .47, 0), ("Phenylacetaldehyde", .60, .28, 0), ("E-α-ionone", .89, .28, 0)]),
    ("F_malt_grain", "谷物风味", "flavour", [("E-β-ionone", .80, .25, 0), ("Terpinen-4-ol", .76, .24, 0), ("3-methyl-2-butenal", .63, .13, 0)]),
    ("F_malt_bread", "面包风味", "flavour", [("Acetaldehyde", .63, .38, 0), ("Terpinen-4-ol", .74, .32, 0), ("Carbon dioxide", .78, .26, 0)]),
    ("F_malt_cara", "焦糖麦芽风味", "flavour", [("Acetaldehyde", .91, .43, 0), ("Ethyl propionate", .67, .17, 0), ("Phenethyl alcohol", .75, .16, 0)]),
    ("F_malt_burn", "焦糊风味", "flavour", [("Methanethiol", .68, .40, 0), ("Glycerol", .61, .36, 0), ("Methylpyrazine", .85, .22, 0)]),
    ("F_hops_all", "酒花风味（总体）", "flavour", [("Cis-dihydro-β-terpineol", .82, .55, 0), ("E-2-nonenal", .71, .46, 0), ("Dimethyl sulfide", .79, .42, 0)]),
    ("F_hops_citrus", "柑橘风味", "flavour", [("Furfural", .81, .27, 0), ("Geosmin", .81, .23, 0), ("Cis-dihydro-β-terpineol", .67, .19, 0)]),
    ("F_hops_tropical", "热带水果风味", "flavour", [("Hexyl acetate", .86, .28, 0), ("Dimethyl sulfide", .51, .28, 1), ("Beta-phellandrene", .55, .24, 1)]),
    ("F_hops_noble", "贵族酒花风味", "flavour", [("Cis-dihydro-β-terpineol", .70, .52, 0), ("Ethyl octanoate", .84, .51, 0), ("Iron", .97, .42, 0)]),
    ("F_hops_woody", "木质风味", "flavour", [("Isobutanol", .87, .32, 0), ("Cis-dihydro-β-terpineol", .71, .32, 0), ("Neo-allo-ocimene", .61, .20, 0)]),
    ("F_esters_all", "酯类风味（总体）", "flavour", [("Acetaldehyde", .98, .40, 0), ("N-hexanol", .86, .38, 0), ("Phenethyl alcohol", .80, .22, 0)]),
    ("F_esters_ethac", "乙酸酯风味", "flavour", [("Ethyl acetate", .87, .50, 0), ("Acetaldehyde", .80, .39, 0), ("E,Z-farnesal", .64, .28, 0)]),
    ("F_esters_isoaa", "乙酸异戊酯风味", "flavour", [("N-hexanol", .73, .30, 0), ("Acetaldehyde", .68, .24, 0), ("13-epi manool oxide", .52, .16, 1)]),
    ("F_esters_flower", "花香酯风味", "flavour", [("Beta-phellandrene", .58, .22, 1), ("Eucalyptol", .52, .14, 1), ("2-methyltetrahydrofuran-3-one", .45, .13, 1)]),
    ("F_esters_fruity", "果香酯风味", "flavour", [("Beta-phellandrene", .80, .23, 0), ("Epicubenol", .80, .13, 0), ("E-β-ionone", .58, .05, 1)]),
    ("acidity", "酸度", "other", [("Acetic acid", .95, .42, 0), ("Isoamyl acetate", .91, .37, 0), ("Lactic acid", 1.0, .32, 0)]),
    ("bitternes", "苦度", "other", [("Iso-alpha acids", .98, .68, 0), ("Cis-dihydro-β-terpineol", .88, .59, 0), ("Ethyl octanoate", .99, .59, 0)]),
    ("sweetness", "甜度", "other", [("Ethyl decanoate", .60, .39, 0), ("Iron", .82, .36, 0), ("Ethyl octanoate", .61, .29, 0)]),
    ("X4vg", "4-乙烯基愈创木酚", "other", [("4-vinylguaiacol", 1.0, .49, 0), ("Neryl formate", .50, .38, 1), ("Isopentyl butanoate", .61, .14, 0)]),
    ("diacetyl", "双乙酰", "other", [("Eugenol", .92, .32, 0), ("Furfural", .47, .25, 1), ("Beta-phellandrene", .75, .23, 0)]),
    ("dms", "二甲基硫", "other", [("Caryophylla-4,8-dien-5-ol", .68, .17, 0), ("E,E-2,4-decadienal", .36, .16, 1), ("Amyl acetate", .36, .16, 1)]),
    ("metallic", "金属感", "other", [("Iron", .99, .24, 0), ("Ethyl 3-methylbutyrate", .91, .23, 0), ("Isopentyl butanoate", .73, .22, 0)]),
    ("stale_hops", "陈旧酒花", "other", [("Gamma-eudesmol", .69, .26, 0), ("E-ortho-methoxy cinnamaldehyde", .79, .26, 0), ("Iron", .59, .13, 1)]),
    ("t2n", "反式-2-壬烯醛", "other", [("α-phellandrene", .73, .21, 0), ("Glycerol", .75, .18, 0), ("Cis-linalool oxide", .62, .14, 0)]),
    ("orange", "橙香", "other", [("Ethyl linalool", .77, .27, 0), ("Alpha-terpineol", .76, .21, 0), ("Z,Z-geranyl linalool", .67, .13, 0)]),
    ("coriander", "芫荽", "other", [("Terpinolene", .60, .21, 0), ("Cis-β-terpineol", .65, .20, 0), ("Limonene", .71, .15, 0)]),
    ("clove", "丁香", "other", [("Limonene", .86, .26, 0), ("Eucalyptol", .73, .26, 0), ("Linalool", .62, .14, 0)]),
    ("lactic", "乳酸感", "other", [("Lactic acid", 1.0, .45, 0), ("Acetic acid", .89, .41, 0), ("Isoamyl acetate", .97, .41, 0)]),
    ("acetic", "乙酸感", "other", [("Acetic acid", .96, .36, 0), ("Lactic acid", 1.0, .35, 0), ("Isoamyl acetate", .80, .30, 0)]),
    ("barnyard", "马厩味", "other", [("Gamma-eudesmol", .80, .27, 0), ("E-ortho-methoxy cinnamaldehyde", .66, .23, 0), ("Epicubenol", .43, .23, 1)]),
    ("alcohol", "酒精感", "other", [("Ethanol", .92, .82, 0), ("Ethyl octanoate", .92, .62, 0), ("Acetaldehyde", .99, .60, 0)]),
    ("aftertaste", "回味", "other", [("Ethanol", .81, .52, 0), ("Cis-dihydro-β-terpineol", .78, .51, 0), ("Ethyl octanoate", .88, .51, 0)]),
    ("body", "酒体", "other", [("Glycerol", .89, .57, 0), ("3-methyl-2-hexanol", .86, .55, 0), ("Ethyl octanoate", .76, .53, 0)]),
    ("co2", "二氧化碳感", "other", [("Ethyl octanoate", .86, .55, 0), ("Carbon dioxide", .72, .48, 0), ("3-methyl-2-hexanol", .82, .42, 0)]),
    ("overall", "总体印象", "other", [("Ethyl acetate", .78, .33, 0), ("2-butyl octanoate", .76, .23, 0), ("Styrene", .65, .19, 0)]),
]

TIER1 = {"alcohol", "bitternes", "body", "co2", "F_hops_all", "F_hops_noble", "aftertaste",
         "F_esters_ethac", "X4vg", "A_hops_noble", "F_malt_all", "lactic", "F_malt_cara",
         "A_hops_all", "acidity", "F_malt_burn", "F_esters_all"}

FAMILIES = [
    dict(id="yeast", cn="酵母代谢", en="Yeast", color="#E3A857"),
    dict(id="hop", cn="酒花来源", en="Hop", color="#83A98F"),
    dict(id="malt", cn="麦芽与焙烤", en="Malt & roast", color="#C97B4A"),
    dict(id="phenol", cn="酚类与香料", en="Phenolic", color="#A98BC0"),
    dict(id="wild", cn="野生菌群", en="Wild flora", color="#C06B84"),
    dict(id="other", cn="理化与其他", en="Physical", color="#8A98A6"),
]

MODULES = [
    dict(id=26, label="倍半萜与脂肪酸酯", size=37, hint="指向干投酒花",
         reps=["Z-β-farnesene", "β-石竹烯", "β-水芹烯"]),
    dict(id=3, label="氧化陈化混合族", size=45, hint="桶陈与氧化的共同产物",
         reps=["苯乙醇", "1-辛烯-3-醇", "E-β-紫罗兰酮"]),
    dict(id=0, label="酵母发酵与酯化", size=19, hint="发酵强度与酯化能力",
         reps=["乙醇", "乙酸异戊酯", "辛酸乙酯", "甘油"]),
    dict(id=21, label="C15 萜烯醇", size=22, hint="酒花萜烯的转化产物",
         reps=["法尼醇", "橙花叔醇", "二氢-β-松油醇"]),
    dict(id=23, label="酒花单萜醇", size=20, hint="柑橘与花香的直接来源",
         reps=["里那醇", "α-松油醇", "4-松油醇"]),
    dict(id=15, label="发酵副产物与羰基", size=20, hint="连二酮、醛与硫化物",
         reps=["2-甲基-1-丁醇", "双乙酰", "甲硫醇"]),
]

# 搜索别名：把常见的商品名与英文写法并入检索
ALIAS = {
    "pils": "pilsner lager 皮尔森 拉格 淡色拉格 比尔森",
    "low": "low alcohol 无醇 低醇 零度",
    "wheat": "weizen witbier 白啤 小麦 德式小麦",
    "fruit": "fruit beer 果啤 果味",
    "lambic": "lambic 兰比克 自然发酵 酸啤 sour",
    "kriek": "kriek 樱桃 酸啤 sour",
    "hoppy": "ipa india pale ale 印度淡色艾尔 酒花 双倍ipa",
    "wfa": "west flanders 西佛兰德 红艾尔 酸啤",
    "brett": "brett 布雷特 混合发酵 酸啤",
    "stout": "stout porter 世涛 波特 黑啤 帝国世涛",
    "amber": "amber 琥珀",
    "scotch": "scotch 苏格兰 烈性",
    "flanders": "flanders 佛兰德 老棕 酸啤",
    "brown": "brown 棕色",
    "saison": "saison 赛松 农舍",
    "blond": "blond 金色 金啤",
    "strong": "strong ale 烈性 大麦酒",
    "xmas": "christmas 圣诞 香料",
    "faro": "faro 法罗 酸啤",
    "brut": "brut 布鲁特 香槟",
    "tripel": "tripel 三料 修道院 abbey",
    "dubbel": "dubbel 双料 修道院 abbey",
}

GROUPS = [
    dict(id="all", cn="全部风格"),
    dict(id="lager", cn="拉格"),
    dict(id="ale", cn="艾尔"),
    dict(id="wheat", cn="小麦"),
    dict(id="sour", cn="酸啤 / 混合发酵"),
    dict(id="dark", cn="深色 / 烘焙"),
    dict(id="abbey", cn="修道院 / 烈性"),
]


def profile(spec):
    return {k: v for k, v in zip(AXIS_KEYS, spec["p"])}


def relative_index(sens, prof):
    num = sum(w * (prof[a] - 3.0) for a, w in sens.items())
    den = max(0.6, sum(abs(w) for w in sens.values()))
    return 100.0 * (1.0 + 0.40 * num / den)


def resolve_mid(c, s, prof):
    key = (s["id"], c["id"])
    if key in OVERRIDE:
        return c["ref"] * OVERRIDE[key]
    return c["ref"] * relative_index(c["sens"], prof) / 100.0


def spread(c, s, mid):
    """区间宽度：拉格较窄、酸啤与烈性较宽；微量化合物下限取 0。"""
    wide = 0.30 if s["group"] in ("sour", "dark", "abbey") else 0.24
    if s["group"] == "lager":
        wide = 0.20
    lo, hi = mid * (1 - wide), mid * (1 + wide * 1.25)
    if mid < c["ref"] * 0.10:
        lo = 0.0
        hi = max(mid * 2.1, c["ref"] * 0.02)
    return lo, hi


def rnd(v, unit):
    if unit == "mg/L":
        if v >= 1000:
            return round(v / 10.0) * 10.0
        if v >= 100:
            return round(v)
        if v >= 10:
            return round(v, 1)
        if v >= 1:
            return round(v, 2)
        return round(v, 4)
    return max(0.0, round(v, 3)) if v >= 1 else max(0.0, round(v, 3))


def apply_fixes():
    for c in COMPOUNDS:
        if c["id"] in UNIT_FIX:
            c["unit"], c["ref"] = UNIT_FIX[c["id"]]
        if c["id"] in FAMILY_FIX:
            c["family"] = FAMILY_FIX[c["id"]]


def contribution(c, prof, mid):
    """化合物对风格特征的贡献：感官强度 × 风格画像 × 实际存在度 × 重要性。"""
    pres = min(mid / c["ref"], 2.6) if c["ref"] else 1.0
    num = sum(max(0.0, w) * prof[a] for a, w in c["sens"].items())
    den = sum(max(0.0, w) for w in c["sens"].values()) or 1.0
    return (num / den) * pres * IMPORTANCE.get(c["id"], 0.35)


def main():
    apply_fixes()
    by_id = {c["id"]: c for c in COMPOUNDS}
    style_d = []
    idx_map = {}
    for si, st in enumerate(STYLES):
        pro = profile(st)
        idx_map[st["id"]] = si
        row = {}
        for c in COMPOUNDS:
            mid = resolve_mid(c, st, pro)
            row[c["id"]] = math.log(max(mid / c["ref"], 0.005)) if c["ref"] else 0.0
        style_d.append(row)
    cd_all = [{} for _ in STYLES]
    for c in COMPOUNDS:
        vals = [style_d[i][c["id"]] for i in range(len(STYLES))]
        mu = sum(vals) / len(vals)
        sd = math.sqrt(sum((v - mu) ** 2 for v in vals) / max(1, len(vals) - 1)) or 1.0
        for i, v in enumerate(vals):
            cd_all[i][c["id"]] = round(max(-2.2, min(2.2, (v - mu) / sd)), 2)
    styles_out = []
    for si, s in enumerate(STYLES):
        prof = profile(s)
        values = {}
        for c in COMPOUNDS:
            mid = resolve_mid(c, s, prof)
            lo, hi = spread(c, s, mid)
            values[c["id"]] = [rnd(lo, c["unit"]), rnd(mid, c["unit"]), rnd(hi, c["unit"])]
        # 关键化合物：按对风格特征的贡献度排序
        scored = []
        for c in COMPOUNDS:
            _, mid, _ = values[c["id"]]
            scored.append((contribution(c, prof, mid), c["id"]))
        scored.sort(reverse=True)
        key = [cid for _, cid in scored[:12]]

        # 指纹：论文给出 d 的直接用；其余按跨风格标准化后的 d 值计算
        fp = FINGERPRINT.get(s["id"])
        if fp:
            pos = [dict(id=k, d=v) for k, v in fp["pos"] if k in by_id]
            neg = [dict(id=k, d=v) for k, v in fp["neg"] if k in by_id]
            fp_src = "表12"
            notes = [dict(k=NOTE_CN.get(k, k), d=v) for k, v in fp["pos"] + fp["neg"] if k not in by_id]
            if len(fp["pos"]) < 5 or len(fp["neg"]) < 5:
                cd = cd_all[si]
                used = {x["id"] for x in pos} | {x["id"] for x in neg}
                fill_pos = [dict(id=cid, d=round(cd[cid], 2)) for cid in sorted(cd, key=lambda k: -cd[k]) if cid not in used]
                fill_neg = [dict(id=cid, d=round(cd[cid], 2)) for cid in sorted(cd, key=lambda k: cd[k]) if cid not in used]
                seen = {x["id"] for x in pos}
                pos = (pos + [x for x in fill_pos if x["id"] not in seen])[:5]
                seen = {x["id"] for x in neg}
                neg = (neg + [x for x in fill_neg if x["id"] not in seen])[:5]
                fp_src = "表12 / 推算补足"
        else:
            cd = cd_all[si]
            pos = [dict(id=cid, d=cd[cid]) for cid in sorted(cd, key=lambda k: -cd[k]) if cd[cid] >= 0.4][:5]
            neg = [dict(id=cid, d=cd[cid]) for cid in sorted(cd, key=lambda k: cd[k]) if cd[cid] <= -0.4][:5]
            fp_src = "跨风格标准化 d"
            notes = []
        styles_out.append(dict(id=s["id"], cn=s["cn"], en=s["en"], group=s["group"], alias=ALIAS.get(s["id"], ""),
                               n=s["n"], abv=s["abv"], desc=s["desc"], src=s["src"],
                               profile=prof, values=values, key=key,
                               fp=dict(pos=pos, neg=neg, src=fp_src, notes=notes)))

    # 50 维证据表 + 证据等级
    ev_out = []
    rest = [e for e in EVIDENCE if e[0] not in TIER1]
    # 依据首选 |ρ| 排序，前 18 为二级、其余 15 为三级
    rest_sorted = sorted(rest, key=lambda e: -e[3][0][2])
    tier2 = {e[0] for e in rest_sorted[:18]}
    for did, cn, group, tops in EVIDENCE:
        tier = 1 if did in TIER1 else (2 if did in tier2 else 3)
        ev_out.append(dict(id=did, cn=cn, group=group, tier=tier,
                           top=[dict(en=en, cn=NAME_CN.get(en, en), pi=pi, rho=rho, relaxed=bool(rel))
                                for en, pi, rho, rel in tops]))

    data = dict(
        meta=dict(
            title="啤酒风味图谱",
            en="Beer Flavor Atlas",
            subtitle="250 款商业啤酒 × 226 项化学指标 → 50 维感官 → 风格迁移",
            paper="基于多输出偏最小二乘、共表达网络与风格条件生成模型的啤酒风味解析与调控",
            team="MCB2608100 · 赛道 A",
            updated="2026-10-30",
            scale_note=("含量区间为论文分位得分口径下的相对量：以该化合物在 250 款样本中的基准浓度为 100%，"
                        "按风格感官画像与化合物—感官敏感度换算，区间取基准的 ±20%～±30%。"
                        "论文未逐格公布 226 项指标在 22 个风格上的实测浓度，绝对值仅用于量级对照；"
                        "论文直接给出的 d 值、位移与阈值均按原文标注。"),
        ),
        axes=[dict(id=a, cn=b, en=c) for a, b, c in AXES],
        groups=GROUPS,
        families=FAMILIES,
        modules=MODULES,
        compounds=[dict(id=c["id"], cn=c["cn"], en=c["en"], family=c["family"], module=c["module"],
                        unit=c["unit"], ref=c["ref"], sens=c["sens"], aroma=c["aroma"],
                        palate=c["palate"], finish=c["finish"], note=c["note"], src=c["src"],
                        defect=c["id"] in ("dms", "diacetyl", "4vg", "t2n"),
                        imp=IMPORTANCE.get(c["id"], 0.35))
                   for c in COMPOUNDS],
        styles=styles_out,
        evidence=ev_out,
        paper=dict(
            facts=[
                dict(k="风格样本极少且极不均衡", v="22 种风格，Faro 3 例、Brut 4 例、Kriek 10 例、Lambic 11 例、Pils/Lager 11 例，最大类 Blond 31 例"),
                dict(k="风格可分但重叠严重", v="22 类留出准确率 0.512（多数类仅 0.124）；Tripel 对 Pils/Lager 的二分类达 0.974"),
                dict(k="缺失以“原子”形态出现", v="13.6% 的单元格为左删失；4VG 有 67.2% 的样本落在同一原子值"),
                dict(k="缺陷阈值低于数据基率", v="DMS 阈值 19 µg/L 低于中位数 24.2 µg/L；Diacetyl 阈值 0.09 mg/L 低于中位数 0.285 mg/L"),
                dict(k="源与目标沿一条轴分离", v="沿 Tripel–Pils/Lager 方向投影：源中位 −8.78，目标中位 +2.79，目标 10% 分位 +1.25"),
            ],
            network=dict(edges=602, density=0.024, Q=0.5874, randomQ=[-0.0092, 0.0127], within=0.347, cross=0.157,
                         isolates=51, modules=6),
            axes={
                "tripel": dict(target="Tripel", n=28, axis_len=9.27, src_median=-8.78, tgt_p10=1.25,
                               tgt_median=2.79, shift=11.57),
                "kriek": dict(target="Kriek", n=10, axis_len=12.15, src_median=-6.50, tgt_p10=5.43,
                              tgt_median=9.07, shift=15.57),
                "lambic": dict(target="Lambic", n=11, axis_len=11.44, src_median=-6.84, tgt_p10=3.51,
                               tgt_median=7.95, shift=14.79),
            },
            tripel=dict(
                moved=11.74, nonzero=216, above05=93, defect_cost=1.3,
                p_before=0.384, p_after=0.364, core80=97,
                source_mix=[("酵母代谢产物", 49.0), ("酒花萜烯", 26.1), ("麦芽来源", 7.6),
                            ("香料类", 5.8), ("野生菌群", 3.7)],
                axis_components=[("乙酸乙酯", 0.219), ("乙醇", 0.190), ("异戊醇", 0.159),
                                 ("色度", 0.115), ("4-乙烯基愈创木酚", -0.001), ("苯乙醇", -0.025)],
                shifts=[("乙酸乙酯", "Ethyl acetate", "酵母", 2.48, 2.1),
                        ("乙醇", "Ethanol", "酵母", 2.15, 3.9),
                        ("甘油", "Glycerol", "酵母", 2.08, 5.6),
                        ("乳酸", "Lactic acid", "野生菌群", 1.95, 7.3),
                        ("乙酸异丁酯", "Isobutyl acetate", "酵母", 1.94, 8.9),
                        ("己酸乙酯", "Ethyl hexanoate", "酵母", 1.89, 10.5)],
                sparse=[(0, 216, 93, 11.74), (0.02, 208, 89, 11.74), (0.05, 199, 85, 11.75),
                        (0.10, 185, 81, 11.78), (0.20, 167, 75, 11.85), (0.30, 150, 72, 11.96)],
            ),
            generation=dict(fidelity=0.766, coverage=0.991, ks=0.409, k_used=10,
                            shape_corr=0.827, recall=0.523, baseline_resample=0.998),
            markers=[("4VG", "Wheat", "Wheat", 0.758), ("乙酸乙酯", "Strong ale", "Strong ale", 0.942),
                     ("乙酸苯乙酯", "Strong ale", "Strong ale", 0.930), ("异戊醇", "Brut", "Brut", 0.973),
                     ("里那醇", "Wheat", "Wheat", 0.922), ("香叶醇", "Hoppy", "Hoppy", 0.918),
                     ("乳酸", "Lambic", "Lambic", 0.972), ("乙酸", "Lambic", "West Flanders ale", 0.944)],
        ),
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    body = json.dumps(data, ensure_ascii=False, indent=1, separators=(",", ": "))
    OUT.write_text("/* 自动生成，请修改 tools/build_data.py 后重新运行。 */\n"
                   "window.BEER_DATA = " + body + ";\n", encoding="utf-8")
    print("compounds", len(COMPOUNDS), "styles", len(styles_out), "evidence", len(ev_out))
    print("bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
