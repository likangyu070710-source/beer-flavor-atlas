/* 自动生成，请修改 tools/build_data.py 后重新运行。 */
window.BEER_DATA = {
 "meta": {
  "title": "啤酒风味图谱",
  "en": "Beer Flavor Atlas",
  "subtitle": "250 款商业啤酒 × 226 项化学指标 → 50 维感官 → 风格迁移",
  "paper": "基于多输出偏最小二乘、共表达网络与风格条件生成模型的啤酒风味解析与调控",
  "team": "MCB2608100 · 赛道 A",
  "updated": "2026-10-30",
  "scale_note": "含量区间为论文分位得分口径下的相对量：以该化合物在 250 款样本中的基准浓度为 100%，按风格感官画像与化合物—感官敏感度换算，区间取基准的 ±20%～±30%。论文未逐格公布 226 项指标在 22 个风格上的实测浓度，绝对值仅用于量级对照；论文直接给出的 d 值、位移与阈值均按原文标注。"
 },
 "axes": [
  {
   "id": "bitter",
   "cn": "苦味",
   "en": "Bitterness"
  },
  {
   "id": "hop",
   "cn": "酒花香",
   "en": "Hop aroma"
  },
  {
   "id": "ester",
   "cn": "酯香·果香",
   "en": "Ester / fruity"
  },
  {
   "id": "malt",
   "cn": "麦芽甜香",
   "en": "Malt sweetness"
  },
  {
   "id": "roast",
   "cn": "焙烤焦香",
   "en": "Roast"
  },
  {
   "id": "phenol",
   "cn": "酚味·辛香",
   "en": "Phenolic / spice"
  },
  {
   "id": "sour",
   "cn": "酸味",
   "en": "Sourness"
  },
  {
   "id": "alcohol",
   "cn": "酒精感",
   "en": "Alcohol"
  },
  {
   "id": "body",
   "cn": "酒体·口感",
   "en": "Body / mouthfeel"
  },
  {
   "id": "sulfur",
   "cn": "硫味",
   "en": "Sulfur"
  },
  {
   "id": "aged",
   "cn": "氧化陈味",
   "en": "Aged / oxidized"
  },
  {
   "id": "floral",
   "cn": "花香",
   "en": "Floral"
  }
 ],
 "groups": [
  {
   "id": "all",
   "cn": "全部风格"
  },
  {
   "id": "lager",
   "cn": "拉格"
  },
  {
   "id": "ale",
   "cn": "艾尔"
  },
  {
   "id": "wheat",
   "cn": "小麦"
  },
  {
   "id": "sour",
   "cn": "酸啤 / 混合发酵"
  },
  {
   "id": "dark",
   "cn": "深色 / 烘焙"
  },
  {
   "id": "abbey",
   "cn": "修道院 / 烈性"
  }
 ],
 "families": [
  {
   "id": "yeast",
   "cn": "酵母代谢",
   "en": "Yeast",
   "color": "#E3A857"
  },
  {
   "id": "hop",
   "cn": "酒花来源",
   "en": "Hop",
   "color": "#83A98F"
  },
  {
   "id": "malt",
   "cn": "麦芽与焙烤",
   "en": "Malt & roast",
   "color": "#C97B4A"
  },
  {
   "id": "phenol",
   "cn": "酚类与香料",
   "en": "Phenolic",
   "color": "#A98BC0"
  },
  {
   "id": "wild",
   "cn": "野生菌群",
   "en": "Wild flora",
   "color": "#C06B84"
  },
  {
   "id": "other",
   "cn": "理化与其他",
   "en": "Physical",
   "color": "#8A98A6"
  }
 ],
 "modules": [
  {
   "id": 26,
   "label": "倍半萜与脂肪酸酯",
   "size": 37,
   "hint": "指向干投酒花",
   "reps": [
    "Z-β-farnesene",
    "β-石竹烯",
    "β-水芹烯"
   ]
  },
  {
   "id": 3,
   "label": "氧化陈化混合族",
   "size": 45,
   "hint": "桶陈与氧化的共同产物",
   "reps": [
    "苯乙醇",
    "1-辛烯-3-醇",
    "E-β-紫罗兰酮"
   ]
  },
  {
   "id": 0,
   "label": "酵母发酵与酯化",
   "size": 19,
   "hint": "发酵强度与酯化能力",
   "reps": [
    "乙醇",
    "乙酸异戊酯",
    "辛酸乙酯",
    "甘油"
   ]
  },
  {
   "id": 21,
   "label": "C15 萜烯醇",
   "size": 22,
   "hint": "酒花萜烯的转化产物",
   "reps": [
    "法尼醇",
    "橙花叔醇",
    "二氢-β-松油醇"
   ]
  },
  {
   "id": 23,
   "label": "酒花单萜醇",
   "size": 20,
   "hint": "柑橘与花香的直接来源",
   "reps": [
    "里那醇",
    "α-松油醇",
    "4-松油醇"
   ]
  },
  {
   "id": 15,
   "label": "发酵副产物与羰基",
   "size": 20,
   "hint": "连二酮、醛与硫化物",
   "reps": [
    "2-甲基-1-丁醇",
    "双乙酰",
    "甲硫醇"
   ]
  }
 ],
 "compounds": [
  {
   "id": "ethanol",
   "cn": "乙醇",
   "en": "Ethanol",
   "family": "yeast",
   "module": 0,
   "unit": "mg/L",
   "ref": 50000,
   "sens": {
    "alcohol": 1.0,
    "body": 0.4,
    "ester": 0.15
   },
   "aroma": "温热的酒精与极轻的溶剂气息",
   "palate": "撑起酒体骨架，带来温暖的口腔刺激",
   "finish": "酒精余热绵长，高浓度时略显灼烧",
   "note": "发酵主产物，酒精感与酒体的共同来源",
   "src": "表8 alcohol ρ=0.82",
   "defect": false,
   "imp": 1.0
  },
  {
   "id": "ethyl_acetate",
   "cn": "乙酸乙酯",
   "en": "Ethyl acetate",
   "family": "yeast",
   "module": 0,
   "unit": "mg/L",
   "ref": 25,
   "sens": {
    "ester": 0.78,
    "floral": 0.22,
    "aged": 0.1
   },
   "aroma": "菠萝与清亮溶剂感的酯香",
   "palate": "带来轻快的果味前调",
   "finish": "散去得快，留下一点甜润",
   "note": "酵母酯化的起点，过量呈指甲油味",
   "src": "表12 Tripel d=0.72；表14 位移 +2.48",
   "defect": false,
   "imp": 0.85
  },
  {
   "id": "isoamyl_acetate",
   "cn": "乙酸异戊酯",
   "en": "Isoamyl acetate",
   "family": "yeast",
   "module": 0,
   "unit": "mg/L",
   "ref": 3.2,
   "sens": {
    "ester": 0.92,
    "floral": 0.12
   },
   "aroma": "香蕉、梨与糖果般的甜润果香",
   "palate": "果味在口中铺开，甜感上扬",
   "finish": "果香收尾干净",
   "note": "高发酵度艾尔的标志性酯",
   "src": "表12 Tripel d=1.02",
   "defect": false,
   "imp": 0.92
  },
  {
   "id": "isobutyl_acetate",
   "cn": "乙酸异丁酯",
   "en": "Isobutyl acetate",
   "family": "yeast",
   "module": 0,
   "unit": "mg/L",
   "ref": 0.12,
   "sens": {
    "ester": 0.72,
    "floral": 0.3
   },
   "aroma": "莓果与花香交织的轻快酯香",
   "palate": "",
   "finish": "花香先行散去，留一点果甜",
   "note": "与乙酸异戊酯同步升降，强化果香层次",
   "src": "表12 Tripel d=0.76",
   "defect": false,
   "imp": 0.7
  },
  {
   "id": "ethyl_hexanoate",
   "cn": "己酸乙酯",
   "en": "Ethyl hexanoate",
   "family": "yeast",
   "module": 0,
   "unit": "mg/L",
   "ref": 0.45,
   "sens": {
    "ester": 0.86,
    "malt": 0.1
   },
   "aroma": "青苹果、草莓与一丝奶酪的浓郁果香",
   "palate": "中段果味最饱满",
   "finish": "油脂感让果香在余味里停留",
   "note": "脂肪酸乙酯，发酵强度与酯化能力的指标",
   "src": "表12 Tripel d=0.73",
   "defect": false,
   "imp": 0.78
  },
  {
   "id": "ethyl_octanoate",
   "cn": "辛酸乙酯",
   "en": "Ethyl octanoate",
   "family": "yeast",
   "module": 0,
   "unit": "mg/L",
   "ref": 0.9,
   "sens": {
    "ester": 0.8,
    "body": 0.18
   },
   "aroma": "熟梨、杏与轻微皂感的丰满果香",
   "palate": "增加口感的圆润度",
   "finish": "皂感在尾段转为柔和的甜",
   "note": "在酒精感、苦度、酒体等六个维度进入前三，是发酵强度的通用代理",
   "src": "表8 六维共同候选",
   "defect": false,
   "imp": 0.8
  },
  {
   "id": "ethyl_decanoate",
   "cn": "癸酸乙酯",
   "en": "Ethyl decanoate",
   "family": "yeast",
   "module": 0,
   "unit": "µg/L",
   "ref": 250,
   "sens": {
    "ester": 0.62,
    "body": 0.15
   },
   "aroma": "油脂感与蜡质的柔和果香",
   "palate": "让酒体显得更厚",
   "finish": "",
   "note": "长链脂肪酸乙酯，过量带来皂感与腻感",
   "src": "表21 sweetness 首位 ρ=0.39",
   "defect": false,
   "imp": 0.55
  },
  {
   "id": "phenethyl_acetate",
   "cn": "乙酸苯乙酯",
   "en": "Phenethyl acetate",
   "family": "yeast",
   "module": 0,
   "unit": "mg/L",
   "ref": 0.6,
   "sens": {
    "floral": 0.85,
    "ester": 0.42,
    "malt": 0.1
   },
   "aroma": "玫瑰与蜂蜜的柔甜花香",
   "palate": "花香在中段变得柔软",
   "finish": "蜂蜜般的甜香留在口腔上部",
   "note": "苯乙醇的酯化产物，玫瑰香的核心",
   "src": "表12 Tripel d=0.70；表27 秩相关 0.930",
   "defect": false,
   "imp": 0.75
  },
  {
   "id": "phenethyl_alcohol",
   "cn": "苯乙醇",
   "en": "Phenethyl alcohol",
   "family": "yeast",
   "module": 3,
   "unit": "mg/L",
   "ref": 28,
   "sens": {
    "floral": 0.9,
    "malt": 0.12
   },
   "aroma": "玫瑰花瓣与丁香般的甜花香",
   "palate": "花香铺满口腔",
   "finish": "花香细腻，收口略甜",
   "note": "高级醇中最具花香者，Tripel 中显著偏高",
   "src": "表6 模块3 代表物质",
   "defect": false,
   "imp": 0.8
  },
  {
   "id": "isoamyl_alcohol",
   "cn": "异戊醇",
   "en": "Isoamyl alcohol",
   "family": "yeast",
   "module": 0,
   "unit": "mg/L",
   "ref": 65,
   "sens": {
    "alcohol": 0.55,
    "body": 0.28,
    "ester": 0.12
   },
   "aroma": "醇厚的杂醇油气息，衬托果香",
   "palate": "增加口感的重量",
   "finish": "酒精感延长",
   "note": "高级醇主体，过量呈溶剂味",
   "src": "表21 A_esters_isoaa 第3",
   "defect": false,
   "imp": 0.65
  },
  {
   "id": "isobutanol",
   "cn": "异丁醇",
   "en": "Isobutanol",
   "family": "yeast",
   "module": 0,
   "unit": "mg/L",
   "ref": 12,
   "sens": {
    "alcohol": 0.45,
    "body": 0.18
   },
   "aroma": "轻微的溶剂与醇甜气息",
   "palate": "提升酒体的厚度",
   "finish": "",
   "note": "发酵副产物，与酵母菌株和温度相关",
   "src": "表21 F_hops_woody 首位",
   "defect": false,
   "imp": 0.45
  },
  {
   "id": "mb2",
   "cn": "2-甲基-1-丁醇",
   "en": "2-methyl-1-butanol",
   "family": "yeast",
   "module": 15,
   "unit": "mg/L",
   "ref": 12,
   "sens": {
    "alcohol": 0.42,
    "body": 0.2
   },
   "aroma": "淡薄的醇香与麦芽底味",
   "palate": "使口感更饱满",
   "finish": "",
   "note": "活跃发酵期的副产物",
   "src": "表6 模块15 代表物质",
   "defect": false,
   "imp": 0.4
  },
  {
   "id": "glycerol",
   "cn": "甘油",
   "en": "Glycerol",
   "family": "yeast",
   "module": 0,
   "unit": "mg/L",
   "ref": 1800,
   "sens": {
    "body": 0.95,
    "malt": 0.22
   },
   "aroma": "几乎无香，只在杯壁上留下痕迹",
   "palate": "带来圆润甜厚的口感与挂杯",
   "finish": "余味显得柔顺而不干",
   "note": "酒体的第一贡献物，风格内相关退至第六位",
   "src": "表8 body ρ=0.57；表14 位移 +2.08",
   "defect": false,
   "imp": 0.85
  },
  {
   "id": "diacetyl",
   "cn": "双乙酰",
   "en": "Diacetyl",
   "family": "yeast",
   "module": 15,
   "unit": "mg/L",
   "ref": 0.12,
   "sens": {
    "malt": 0.38,
    "body": 0.18
   },
   "aroma": "黄油、奶油糖般的圆润香气",
   "palate": "口感变得滑腻",
   "finish": "过量时留下黏腻的甜",
   "note": "缺陷化合物，阈值 0.09 mg/L 低于样本中位数 0.285",
   "src": "表22 缺陷阈值",
   "defect": true,
   "imp": 0.8
  },
  {
   "id": "acetaldehyde",
   "cn": "乙醛",
   "en": "Acetaldehyde",
   "family": "yeast",
   "module": 15,
   "unit": "mg/L",
   "ref": 6,
   "sens": {
    "ester": 0.22,
    "aged": 0.48,
    "sour": 0.12
   },
   "aroma": "青苹果与生青感",
   "palate": "入口有一瞬的尖锐",
   "finish": "转为纸板与未熟的果皮",
   "note": "年轻啤酒与氧化啤酒的共同标志",
   "src": "表8 F_malt_all ρ=0.47",
   "defect": false,
   "imp": 0.65
  },
  {
   "id": "ethyl_propionate",
   "cn": "丙酸乙酯",
   "en": "Ethyl propionate",
   "family": "yeast",
   "module": 0,
   "unit": "µg/L",
   "ref": 50,
   "sens": {
    "ester": 0.55,
    "floral": 0.15
   },
   "aroma": "轻飘的果香与朗姆酒气息",
   "palate": "",
   "finish": "",
   "note": "酯类谱系的次要成员",
   "src": "表8 F_malt_cara 第2",
   "defect": false,
   "imp": 0.3
  },
  {
   "id": "hexyl_acetate",
   "cn": "乙酸己酯",
   "en": "Hexyl acetate",
   "family": "yeast",
   "module": 0,
   "unit": "µg/L",
   "ref": 60,
   "sens": {
    "ester": 0.58,
    "floral": 0.22
   },
   "aroma": "苹果与梨的清甜果香",
   "palate": "",
   "finish": "",
   "note": "热带水果酒花维度的首位化合物",
   "src": "表21 F_hops_tropical ρ=0.28",
   "defect": false,
   "imp": 0.35
  },
  {
   "id": "amyl_acetate",
   "cn": "乙酸戊酯",
   "en": "Amyl acetate",
   "family": "yeast",
   "module": 0,
   "unit": "µg/L",
   "ref": 80,
   "sens": {
    "ester": 0.62,
    "floral": 0.1
   },
   "aroma": "香蕉与糖果的甜香",
   "palate": "",
   "finish": "",
   "note": "与乙酸异戊酯同族的酯",
   "src": "表21 dms 第3（候选）",
   "defect": false,
   "imp": 0.3
  },
  {
   "id": "isopentyl_butanoate",
   "cn": "丁酸异戊酯",
   "en": "Isopentyl butanoate",
   "family": "yeast",
   "module": 0,
   "unit": "µg/L",
   "ref": 30,
   "sens": {
    "ester": 0.68,
    "floral": 0.12
   },
   "aroma": "熟果与一点奶油感",
   "palate": "",
   "finish": "",
   "note": "脂肪酸酯，指向发酵强度",
   "src": "表21 X4vg 第3",
   "defect": false,
   "imp": 0.3
  },
  {
   "id": "ethyl_isobutyrate",
   "cn": "异丁酸乙酯",
   "en": "Ethyl isobutyrate",
   "family": "yeast",
   "module": 0,
   "unit": "µg/L",
   "ref": 50,
   "sens": {
    "ester": 0.58,
    "floral": 0.18
   },
   "aroma": "莓果与甜香",
   "palate": "",
   "finish": "",
   "note": "支链酸酯，增加果香的层次",
   "src": "表21 A_hops_woody 第2",
   "defect": false,
   "imp": 0.3
  },
  {
   "id": "octenol",
   "cn": "1-辛烯-3-醇",
   "en": "1-octen-3-ol",
   "family": "yeast",
   "module": 3,
   "unit": "µg/L",
   "ref": 20,
   "sens": {
    "malt": 0.32,
    "aged": 0.38
   },
   "aroma": "蘑菇与湿润谷物的气息",
   "palate": "口感显得沉闷",
   "finish": "陈味在尾段浮现",
   "note": "氧化陈化模块的代表物质",
   "src": "表6 模块3 代表物质",
   "defect": false,
   "imp": 0.45
  },
  {
   "id": "lactic_acid",
   "cn": "乳酸",
   "en": "Lactic acid",
   "family": "wild",
   "module": 0,
   "unit": "mg/L",
   "ref": 900,
   "sens": {
    "sour": 0.9,
    "body": 0.32
   },
   "aroma": "柔和的酸奶与酸面团感",
   "palate": "酸味圆润，包裹舌面",
   "finish": "酸度缓慢退去，留下一点奶质",
   "note": "酸啤的首要标志，Kriek 与 Lambic 中 d 值最高",
   "src": "表8 lactic ρ=0.45；表12 Lambic d=2.20",
   "defect": false,
   "imp": 0.95
  },
  {
   "id": "octanoic_acid",
   "cn": "辛酸",
   "en": "Octanoic acid",
   "family": "yeast",
   "module": 0,
   "unit": "mg/L",
   "ref": 8,
   "sens": {
    "body": 0.22,
    "sour": 0.28,
    "phenol": 0.15
   },
   "aroma": "羊膻与皂感的中链脂肪酸气息",
   "palate": "口感变得粗糙",
   "finish": "皂感在余味里滞留",
   "note": "酵母自溶与脂肪酸代谢的标志",
   "src": "",
   "defect": false,
   "imp": 0.5
  },
  {
   "id": "iso_alpha",
   "cn": "异α-酸",
   "en": "Iso-alpha acids",
   "family": "hop",
   "module": 23,
   "unit": "mg/L",
   "ref": 28,
   "sens": {
    "bitter": 1.0,
    "hop": 0.25,
    "body": 0.15
   },
   "aroma": "本身气味很淡，只在舌根留下干爽的苦",
   "palate": "苦味干净、持续且有抓舌感",
   "finish": "苦味绵延，支撑收口的干爽度",
   "note": "苦度的机制锚点，风格内相关仍居前三",
   "src": "表8 bitternes ρ=0.68",
   "defect": false,
   "imp": 1.0
  },
  {
   "id": "linalool",
   "cn": "里那醇",
   "en": "Linalool",
   "family": "hop",
   "module": 23,
   "unit": "µg/L",
   "ref": 90,
   "sens": {
    "hop": 0.86,
    "floral": 0.38
   },
   "aroma": "柑橘皮、佛手与白花的酒花香气",
   "palate": "香气从鼻腔回到口腔",
   "finish": "花香轻巧地收尾",
   "note": "酒花单萜醇的核心，受干投与发酵双重影响",
   "src": "表21 A_hops_all ρ=0.41；表27 0.922",
   "defect": false,
   "imp": 0.88
  },
  {
   "id": "geraniol",
   "cn": "香叶醇",
   "en": "Geraniol",
   "family": "hop",
   "module": 23,
   "unit": "µg/L",
   "ref": 30,
   "sens": {
    "hop": 0.7,
    "floral": 0.52
   },
   "aroma": "玫瑰与天竺葵的甜花香",
   "palate": "",
   "finish": "花香留得比里那醇久",
   "note": "酒花花香的主力，Hoppy 风格中最高",
   "src": "表27 最高风格 Hoppy，秩相关 0.918",
   "defect": false,
   "imp": 0.6
  },
  {
   "id": "citronellol",
   "cn": "香茅醇",
   "en": "Citronellol",
   "family": "hop",
   "module": 23,
   "unit": "µg/L",
   "ref": 20,
   "sens": {
    "hop": 0.55,
    "floral": 0.48
   },
   "aroma": "柠檬草与花瓣的清香",
   "palate": "",
   "finish": "",
   "note": "柑橘酒花维度的首位化合物",
   "src": "表21 A_hops_citrus ρ=0.37",
   "defect": false,
   "imp": 0.55
  },
  {
   "id": "nerol",
   "cn": "橙花醇",
   "en": "Nerol",
   "family": "hop",
   "module": 23,
   "unit": "µg/L",
   "ref": 20,
   "sens": {
    "hop": 0.52,
    "floral": 0.42
   },
   "aroma": "橙花与甜柑橘",
   "palate": "",
   "finish": "",
   "note": "与香叶醇互为异构体",
   "src": "",
   "defect": false,
   "imp": 0.4
  },
  {
   "id": "cdbt",
   "cn": "二氢-β-松油醇",
   "en": "Cis-dihydro-β-terpineol",
   "family": "hop",
   "module": 21,
   "unit": "µg/L",
   "ref": 350,
   "sens": {
    "hop": 0.9,
    "floral": 0.26
   },
   "aroma": "干投酒花的草本、松脂与辛香调",
   "palate": "香气在口中停留较久",
   "finish": "草本苦香收尾",
   "note": "酒花萜烯醇经发酵转化而来，同时受酒花投放与发酵进程影响",
   "src": "表8 F_hops_all ρ=0.55",
   "defect": false,
   "imp": 0.8
  },
  {
   "id": "beta_phellandrene",
   "cn": "β-水芹烯",
   "en": "Beta-phellandrene",
   "family": "hop",
   "module": 26,
   "unit": "µg/L",
   "ref": 10,
   "sens": {
    "hop": 0.62,
    "phenol": 0.18
   },
   "aroma": "胡椒与松针的辛香",
   "palate": "",
   "finish": "",
   "note": "在多个酯香维度中作为风格代理出现",
   "src": "表21 A_esters_fruity ρ=0.22",
   "defect": false,
   "imp": 0.4
  },
  {
   "id": "alpha_terpineol",
   "cn": "α-松油醇",
   "en": "Alpha-terpineol",
   "family": "hop",
   "module": 23,
   "unit": "µg/L",
   "ref": 50,
   "sens": {
    "hop": 0.55,
    "floral": 0.32
   },
   "aroma": "丁香与松木的香气",
   "palate": "",
   "finish": "",
   "note": "酒花单萜醇模块成员",
   "src": "表21 orange 第2 ρ=0.21",
   "defect": false,
   "imp": 0.45
  },
  {
   "id": "terpinen_4_ol",
   "cn": "4-松油醇",
   "en": "Terpinen-4-ol",
   "family": "hop",
   "module": 23,
   "unit": "µg/L",
   "ref": 40,
   "sens": {
    "hop": 0.5,
    "phenol": 0.22
   },
   "aroma": "泥土、胡椒与木质的气息",
   "palate": "",
   "finish": "",
   "note": "陈化酒花中相对上升的萜烯醇",
   "src": "表21 F_malt_bread ρ=0.32",
   "defect": false,
   "imp": 0.45
  },
  {
   "id": "beta_caryophyllene",
   "cn": "β-石竹烯",
   "en": "β-caryophyllene",
   "family": "hop",
   "module": 26,
   "unit": "µg/L",
   "ref": 60,
   "sens": {
    "hop": 0.55,
    "phenol": 0.32
   },
   "aroma": "黑胡椒与木质辛香",
   "palate": "",
   "finish": "",
   "note": "倍半萜模块成员，干投酒花的标志",
   "src": "表6 模块26",
   "defect": false,
   "imp": 0.55
  },
  {
   "id": "z_farnesene",
   "cn": "Z-β-法尼烯",
   "en": "Z-β-farnesene",
   "family": "hop",
   "module": 26,
   "unit": "µg/L",
   "ref": 80,
   "sens": {
    "hop": 0.5,
    "floral": 0.22
   },
   "aroma": "酒花精油中的青绿与花香",
   "palate": "",
   "finish": "",
   "note": "倍半萜与脂肪酸酯模块的代表物质",
   "src": "表6 模块26 代表物质",
   "defect": false,
   "imp": 0.45
  },
  {
   "id": "farnesol",
   "cn": "法尼醇",
   "en": "Farnesol",
   "family": "hop",
   "module": 21,
   "unit": "µg/L",
   "ref": 20,
   "sens": {
    "floral": 0.45,
    "hop": 0.3
   },
   "aroma": "柔和的椴树花与蜂蜜香",
   "palate": "",
   "finish": "",
   "note": "C15 萜烯醇模块代表物质",
   "src": "表6 模块21 代表物质",
   "defect": false,
   "imp": 0.35
  },
  {
   "id": "nerolidol",
   "cn": "橙花叔醇",
   "en": "Nerolidol",
   "family": "hop",
   "module": 21,
   "unit": "µg/L",
   "ref": 30,
   "sens": {
    "floral": 0.48,
    "hop": 0.32
   },
   "aroma": "橙花、木质与淡淡的青草",
   "palate": "略带油脂感",
   "finish": "",
   "note": "C15 萜烯醇，陈化中缓慢增加",
   "src": "表21 A_malt_grain 第3",
   "defect": false,
   "imp": 0.4
  },
  {
   "id": "furfural",
   "cn": "糠醛",
   "en": "Furfural",
   "family": "malt",
   "module": 3,
   "unit": "µg/L",
   "ref": 350,
   "sens": {
    "roast": 0.55,
    "aged": 0.42,
    "malt": 0.22
   },
   "aroma": "焦糖、杏仁与陈旧木桶的甜香",
   "palate": "带来焦糖般的甜感",
   "finish": "焦苦与干涩并存",
   "note": "焙烤与陈化的双面指标，Tripel 中显著偏低",
   "src": "表12 Tripel d=−0.98",
   "defect": false,
   "imp": 0.75
  },
  {
   "id": "methylpyrazine",
   "cn": "甲基吡嗪",
   "en": "Methylpyrazine",
   "family": "malt",
   "module": 3,
   "unit": "µg/L",
   "ref": 20,
   "sens": {
    "roast": 0.86,
    "malt": 0.26
   },
   "aroma": "烘烤坚果、可可与咖啡的焙烤香",
   "palate": "苦味带上焦香",
   "finish": "焦苦绵长",
   "note": "深色麦芽焙烤的标志，Tripel 中显著偏低",
   "src": "表12 Tripel d=−0.90",
   "defect": false,
   "imp": 0.8
  },
  {
   "id": "ethyl_furoate",
   "cn": "糠酸乙酯",
   "en": "Ethyl furoate",
   "family": "malt",
   "module": 3,
   "unit": "µg/L",
   "ref": 10,
   "sens": {
    "roast": 0.52,
    "aged": 0.32
   },
   "aroma": "焦糖与烤面包的焦甜",
   "palate": "",
   "finish": "",
   "note": "焙烤麦芽的酯化产物，Tripel 中最低",
   "src": "表12 Tripel d=−0.98",
   "defect": false,
   "imp": 0.35
  },
  {
   "id": "furfuryl_alcohol",
   "cn": "糠醇",
   "en": "Furfuryl alcohol",
   "family": "malt",
   "module": 3,
   "unit": "µg/L",
   "ref": 800,
   "sens": {
    "roast": 0.45,
    "aged": 0.52
   },
   "aroma": "焦苦与陈化木质味",
   "palate": "口感发干",
   "finish": "干涩的焦苦停留",
   "note": "长时间桶陈的标志，Lambic 中最高",
   "src": "表12 Tripel d=−0.71；Lambic d=1.49",
   "defect": false,
   "imp": 0.6
  },
  {
   "id": "phenylacetaldehyde",
   "cn": "苯乙醛",
   "en": "Phenylacetaldehyde",
   "family": "malt",
   "module": 3,
   "unit": "µg/L",
   "ref": 120,
   "sens": {
    "floral": 0.42,
    "malt": 0.45,
    "aged": 0.22
   },
   "aroma": "蜂蜜与玫瑰的甜香",
   "palate": "甜感圆润",
   "finish": "过量时转为陈化的纸味",
   "note": "麦芽风味维度的第2位",
   "src": "表8 F_malt_all ρ=0.28",
   "defect": false,
   "imp": 0.55
  },
  {
   "id": "methanethiol",
   "cn": "甲硫醇",
   "en": "Methanethiol",
   "family": "malt",
   "module": 15,
   "unit": "µg/L",
   "ref": 4,
   "sens": {
    "sulfur": 0.88,
    "roast": 0.32
   },
   "aroma": "煮熟卷心菜与焦硫气息",
   "palate": "口腔里留下硫的钝感",
   "finish": "硫味散得慢",
   "note": "焦糊麦芽维度的首位化合物",
   "src": "表8 F_malt_burn ρ=0.40",
   "defect": false,
   "imp": 0.6
  },
  {
   "id": "dms",
   "cn": "二甲基硫",
   "en": "Dimethyl sulfide",
   "family": "malt",
   "module": 15,
   "unit": "µg/L",
   "ref": 24,
   "sens": {
    "sulfur": 0.9,
    "roast": 0.22
   },
   "aroma": "煮玉米与熟蔬菜的硫味",
   "palate": "让酒体显得平",
   "finish": "硫味在余味里拖尾",
   "note": "缺陷化合物，阈值 19 µg/L 低于样本中位数 24.2 µg/L",
   "src": "表22 缺陷阈值",
   "defect": true,
   "imp": 0.75
  },
  {
   "id": "benzaldehyde",
   "cn": "苯甲醛",
   "en": "Benzaldehyde",
   "family": "malt",
   "module": 3,
   "unit": "µg/L",
   "ref": 80,
   "sens": {
    "malt": 0.38,
    "roast": 0.22
   },
   "aroma": "杏仁与樱桃核的甜香",
   "palate": "",
   "finish": "",
   "note": "与核果类风味相关",
   "src": "表21 A_malt_bread 第3",
   "defect": false,
   "imp": 0.35
  },
  {
   "id": "e_alpha_ionone",
   "cn": "E-α-紫罗兰酮",
   "en": "E-α-ionone",
   "family": "malt",
   "module": 3,
   "unit": "µg/L",
   "ref": 0.6,
   "sens": {
    "floral": 0.62,
    "malt": 0.32
   },
   "aroma": "紫罗兰与干草的甜香",
   "palate": "",
   "finish": "",
   "note": "麦芽与花香之间的桥梁",
   "src": "表21 F_malt_all 第3",
   "defect": false,
   "imp": 0.45
  },
  {
   "id": "e_beta_ionone",
   "cn": "E-β-紫罗兰酮",
   "en": "E-β-ionone",
   "family": "malt",
   "module": 3,
   "unit": "µg/L",
   "ref": 0.9,
   "sens": {
    "floral": 0.52,
    "roast": 0.32,
    "aged": 0.2
   },
   "aroma": "紫罗兰、干梅与烘烤的复合香",
   "palate": "口感略干",
   "finish": "",
   "note": "陈化模块与焙烤的交汇点",
   "src": "表21 A_malt_all 第3",
   "defect": false,
   "imp": 0.45
  },
  {
   "id": "4vg",
   "cn": "4-乙烯基愈创木酚",
   "en": "4-vinylguaiacol",
   "family": "phenol",
   "module": 0,
   "unit": "mg/L",
   "ref": 0.9,
   "sens": {
    "phenol": 0.95
   },
   "aroma": "丁香、胡椒与烟熏的酚香",
   "palate": "酚味在舌面留下轻微麻感",
   "finish": "丁香余味明显",
   "note": "小麦啤的标志；67.2% 的样本落在同一原子值，是保原子变换的动机",
   "src": "表8 X4vg ρ=0.49",
   "defect": true,
   "imp": 0.95
  },
  {
   "id": "4eg",
   "cn": "4-乙基愈创木酚",
   "en": "4-ethyl-guaiacol",
   "family": "phenol",
   "module": 3,
   "unit": "µg/L",
   "ref": 350,
   "sens": {
    "phenol": 0.86,
    "roast": 0.25,
    "aged": 0.32
   },
   "aroma": "烟熏、香料与一点马厩气",
   "palate": "酚味与焦香叠加",
   "finish": "烟熏感在余味中拉长",
   "note": "Tripel 中显著偏低，指向焙烤与烟熏的缺席",
   "src": "表12 Tripel d=−0.88",
   "defect": false,
   "imp": 0.7
  },
  {
   "id": "4ep",
   "cn": "4-乙基苯酚",
   "en": "4-ethylphenol",
   "family": "wild",
   "module": 3,
   "unit": "µg/L",
   "ref": 120,
   "sens": {
    "phenol": 0.76,
    "aged": 0.38
   },
   "aroma": "皮革、马厩与动物性的酚味",
   "palate": "口感变得粗犷",
   "finish": "野味停留很久",
   "note": "布雷特酵母与野生菌群的标志",
   "src": "表12 Kriek d=1.50",
   "defect": false,
   "imp": 0.55
  },
  {
   "id": "eugenol",
   "cn": "丁香酚",
   "en": "Eugenol",
   "family": "phenol",
   "module": 3,
   "unit": "µg/L",
   "ref": 30,
   "sens": {
    "phenol": 0.95,
    "malt": 0.1
   },
   "aroma": "丁香与香料的热感",
   "palate": "口腔有温热麻感",
   "finish": "香料余味持久",
   "note": "Kriek 中最高（d=2.03），来自樱桃核与香料",
   "src": "表12 Kriek d=2.03",
   "defect": false,
   "imp": 0.6
  },
  {
   "id": "guaiacol",
   "cn": "愈创木酚",
   "en": "Guaiacol",
   "family": "phenol",
   "module": 3,
   "unit": "µg/L",
   "ref": 50,
   "sens": {
    "phenol": 0.86,
    "roast": 0.35,
    "aged": 0.22
   },
   "aroma": "烟熏、药草与木炭的气息",
   "palate": "烟熏感包裹舌面",
   "finish": "烟熏与苦味一起收尾",
   "note": "烟熏麦芽与桶陈的共同产物",
   "src": "表6 模块3 代表物质",
   "defect": false,
   "imp": 0.55
  },
  {
   "id": "co2",
   "cn": "二氧化碳",
   "en": "Carbon dioxide",
   "family": "other",
   "module": 0,
   "unit": "mg/L",
   "ref": 5000,
   "sens": {
    "body": 0.12,
    "bitter": 0.18,
    "sour": 0.22
   },
   "aroma": "无香，只有气泡的刺激",
   "palate": "气泡带来清爽与轻微的刺感",
   "finish": "气泡散去后苦味更明显",
   "note": "碳酸化程度影响苦味与清爽感的感知",
   "src": "表8 co2 ρ=0.48",
   "defect": false,
   "imp": 0.6
  },
  {
   "id": "so2",
   "cn": "二氧化硫",
   "en": "SO2",
   "family": "other",
   "module": 0,
   "unit": "mg/L",
   "ref": 8,
   "sens": {
    "sulfur": 0.9
   },
   "aroma": "刺鼻的硫味与火柴头气息",
   "palate": "低量时几乎不可感",
   "finish": "高量时喉咙发紧",
   "note": "抗氧化剂，Pils/Lager 中显著偏高（d=0.96）",
   "src": "表12 Pils d=0.96",
   "defect": false,
   "imp": 0.6
  },
  {
   "id": "iron",
   "cn": "铁",
   "en": "Iron",
   "family": "other",
   "module": 0,
   "unit": "mg/L",
   "ref": 0.08,
   "sens": {
    "aged": 0.4,
    "body": 0.12,
    "bitter": 0.08
   },
   "aroma": "金属与铁腥感",
   "palate": "口感发涩",
   "finish": "金属味在余味里残留",
   "note": "酒花型风格的代理指标，非香气成因",
   "src": "表8 A_hops_noble 第2；B.5 风格代理",
   "defect": false,
   "imp": 0.4
  },
  {
   "id": "t2n",
   "cn": "反式-2-壬烯醛",
   "en": "trans-2-nonenal",
   "family": "malt",
   "module": 3,
   "unit": "µg/L",
   "ref": 1.5,
   "sens": {
    "aged": 0.92,
    "roast": 0.1
   },
   "aroma": "纸板、陈旧油脂与硬纸箱",
   "palate": "口感发干、失去果汁感",
   "finish": "纸板味久久不退",
   "note": "氧化陈化的头号标志，缺陷集合成员",
   "src": "表22 缺陷集合；A_hops_all 首位",
   "defect": true,
   "imp": 0.7
  }
 ],
 "styles": [
  {
   "id": "pils",
   "cn": "皮尔森 / 拉格",
   "en": "Pils / Lager",
   "group": "lager",
   "alias": "pilsner lager 皮尔森 拉格 淡色拉格 比尔森",
   "n": 11,
   "abv": "4.4–5.2%",
   "desc": "低温长时发酵的淡色拉格，干净的麦芽底味上浮着草本酒花香，收口干爽。",
   "src": "表12 / 表13 / 表22",
   "profile": {
    "bitter": 3.4,
    "hop": 3.0,
    "ester": 2.6,
    "malt": 3.0,
    "roast": 0.6,
    "phenol": 0.5,
    "sour": 0.9,
    "alcohol": 2.6,
    "body": 2.4,
    "sulfur": 1.7,
    "aged": 0.8,
    "floral": 1.6
   },
   "values": {
    "ethanol": [
     32770.0,
     40970.0,
     51210.0
    ],
    "ethyl_acetate": [
     13.9,
     17.4,
     21.7
    ],
    "isoamyl_acetate": [
     2.03,
     2.54,
     3.18
    ],
    "isobutyl_acetate": [
     0.0693,
     0.0867,
     0.1084
    ],
    "ethyl_hexanoate": [
     0.3084,
     0.3855,
     0.4819
    ],
    "ethyl_octanoate": [
     0.5942,
     0.7428,
     0.9285
    ],
    "ethyl_decanoate": [
     164.883,
     206.104,
     257.63
    ],
    "phenethyl_acetate": [
     0.2897,
     0.3621,
     0.4526
    ],
    "phenethyl_alcohol": [
     11.3,
     14.2,
     17.7
    ],
    "isoamyl_alcohol": [
     42.5,
     53.1,
     66.3
    ],
    "isobutanol": [
     7.84,
     9.81,
     12.3
    ],
    "mb2": [
     7.82,
     9.77,
     12.2
    ],
    "glycerol": [
     1160.0,
     1450.0,
     1810.0
    ],
    "diacetyl": [
     0.0403,
     0.0504,
     0.063
    ],
    "acetaldehyde": [
     2.64,
     3.3,
     4.12
    ],
    "ethyl_propionate": [
     30.171,
     37.714,
     47.143
    ],
    "hexyl_acetate": [
     35.04,
     43.8,
     54.75
    ],
    "amyl_acetate": [
     50.204,
     62.756,
     78.444
    ],
    "isopentyl_butanoate": [
     18.72,
     23.4,
     29.25
    ],
    "ethyl_isobutyrate": [
     29.811,
     37.263,
     46.579
    ],
    "octenol": [
     8.357,
     10.446,
     13.057
    ],
    "lactic_acid": [
     230,
     288,
     360
    ],
    "octanoic_acid": [
     2.09,
     2.61,
     3.26
    ],
    "iso_alpha": [
     26.4,
     33.0,
     41.3
    ],
    "linalool": [
     37.44,
     46.8,
     58.5
    ],
    "geraniol": [
     10.8,
     13.5,
     16.875
    ],
    "citronellol": [
     11.824,
     14.781,
     18.476
    ],
    "nerol": [
     11.997,
     14.996,
     18.745
    ],
    "cdbt": [
     244.855,
     306.069,
     382.586
    ],
    "beta_phellandrene": [
     6.2,
     7.75,
     9.688
    ],
    "alpha_terpineol": [
     31.761,
     39.701,
     49.626
    ],
    "terpinen_4_ol": [
     22.222,
     27.778,
     34.722
    ],
    "beta_caryophyllene": [
     30.345,
     37.931,
     47.414
    ],
    "z_farnesene": [
     53.049,
     66.311,
     82.889
    ],
    "farnesol": [
     10.624,
     13.28,
     16.6
    ],
    "nerolidol": [
     15.936,
     19.92,
     24.9
    ],
    "furfural": [
     68.8,
     86.0,
     107.5
    ],
    "methylpyrazine": [
     4.206,
     5.257,
     6.571
    ],
    "ethyl_furoate": [
     0.0,
     0.705,
     1.48
    ],
    "furfuryl_alcohol": [
     0.0,
     66.309,
     139.249
    ],
    "phenylacetaldehyde": [
     58.234,
     72.793,
     90.991
    ],
    "methanethiol": [
     1.161,
     1.451,
     1.813
    ],
    "dms": [
     7.557,
     9.446,
     11.807
    ],
    "benzaldehyde": [
     41.472,
     51.84,
     64.8
    ],
    "e_alpha_ionone": [
     0.303,
     0.378,
     0.473
    ],
    "e_beta_ionone": [
     0.184,
     0.23,
     0.287
    ],
    "4vg": [
     0.0,
     0.027,
     0.0567
    ],
    "4eg": [
     0.0,
     11.846,
     24.877
    ],
    "4ep": [
     0.0,
     4.8,
     10.08
    ],
    "eugenol": [
     0.0,
     2.857,
     6.0
    ],
    "guaiacol": [
     0.0,
     1.413,
     2.966
    ],
    "co2": [
     2770.0,
     3460.0,
     4320.0
    ],
    "so2": [
     10.4,
     13.0,
     16.2
    ],
    "iron": [
     0.0247,
     0.0309,
     0.0387
    ],
    "t2n": [
     0.135,
     0.168,
     0.21
    ]
   },
   "key": [
    "iso_alpha",
    "ethanol",
    "cdbt",
    "isoamyl_acetate",
    "ethyl_hexanoate",
    "glycerol",
    "ethyl_octanoate",
    "so2",
    "isoamyl_alcohol",
    "ethyl_acetate",
    "linalool",
    "isobutyl_acetate"
   ],
   "fp": {
    "pos": [
     {
      "id": "so2",
      "d": 0.96
     },
     {
      "id": "mb2",
      "d": 0.74
     }
    ],
    "neg": [
     {
      "id": "linalool",
      "d": -1.16
     }
    ],
    "src": "表12",
    "notes": [
     {
      "k": "z_farnesal",
      "d": 0.55
     },
     {
      "k": "ethyl_hexanol",
      "d": 0.51
     },
     {
      "k": "humulene_14",
      "d": 0.5
     },
     {
      "k": "蛋白",
      "d": -1.91
     },
     {
      "k": "germacrene_d",
      "d": -1.61
     },
     {
      "k": "色度",
      "d": -1.53
     },
     {
      "k": "styrene",
      "d": -1.23
     }
    ]
   }
  },
  {
   "id": "low",
   "cn": "低醇 / 无醇",
   "en": "Low / No alcohol",
   "group": "lager",
   "alias": "low alcohol 无醇 低醇 零度",
   "n": null,
   "abv": "≤1.2%",
   "desc": "酒精被压到几乎不可感，风味重心落在麦芽甜香与轻薄的酒体上。",
   "src": "表5 #83",
   "profile": {
    "bitter": 2.0,
    "hop": 1.8,
    "ester": 1.4,
    "malt": 2.6,
    "roast": 0.5,
    "phenol": 0.4,
    "sour": 1.0,
    "alcohol": 0.7,
    "body": 1.2,
    "sulfur": 1.2,
    "aged": 0.9,
    "floral": 1.0
   },
   "values": {
    "ethanol": [
     4000.0,
     5000.0,
     6250.0
    ],
    "ethyl_acetate": [
     6.2,
     7.75,
     9.68
    ],
    "isoamyl_acetate": [
     0.8743,
     1.09,
     1.37
    ],
    "isobutyl_acetate": [
     0.03,
     0.0376,
     0.0469
    ],
    "ethyl_hexanoate": [
     0.1476,
     0.1845,
     0.2306
    ],
    "ethyl_octanoate": [
     0.2486,
     0.3108,
     0.3885
    ],
    "ethyl_decanoate": [
     68.883,
     86.104,
     107.63
    ],
    "phenethyl_acetate": [
     0.142,
     0.1775,
     0.2218
    ],
    "phenethyl_alcohol": [
     6.17,
     7.71,
     9.64
    ],
    "isoamyl_alcohol": [
     9.06,
     11.3,
     14.2
    ],
    "isobutanol": [
     1.32,
     1.65,
     2.06
    ],
    "mb2": [
     1.39,
     1.73,
     2.17
    ],
    "glycerol": [
     555,
     694,
     867
    ],
    "diacetyl": [
     0.0655,
     0.0819,
     0.1024
    ],
    "acetaldehyde": [
     1.05,
     1.32,
     1.65
    ],
    "ethyl_propionate": [
     13.029,
     16.286,
     20.357
    ],
    "hexyl_acetate": [
     15.168,
     18.96,
     23.7
    ],
    "amyl_acetate": [
     21.618,
     27.022,
     33.778
    ],
    "isopentyl_butanoate": [
     8.064,
     10.08,
     12.6
    ],
    "ethyl_isobutyrate": [
     12.884,
     16.105,
     20.132
    ],
    "octenol": [
     7.534,
     9.417,
     11.771
    ],
    "lactic_acid": [
     159,
     199,
     249
    ],
    "octanoic_acid": [
     1.1,
     1.37,
     1.72
    ],
    "iso_alpha": [
     16.1,
     20.2,
     25.2
    ],
    "linalool": [
     30.379,
     37.974,
     47.468
    ],
    "geraniol": [
     9.207,
     11.508,
     14.385
    ],
    "citronellol": [
     5.934,
     7.417,
     9.272
    ],
    "nerol": [
     6.032,
     7.54,
     9.426
    ],
    "cdbt": [
     125.517,
     156.897,
     196.121
    ],
    "beta_phellandrene": [
     3.152,
     3.94,
     4.925
    ],
    "alpha_terpineol": [
     16.092,
     20.115,
     25.144
    ],
    "terpinen_4_ol": [
     11.164,
     13.956,
     17.444
    ],
    "beta_caryophyllene": [
     15.073,
     18.841,
     23.552
    ],
    "z_farnesene": [
     27.022,
     33.778,
     42.222
    ],
    "farnesol": [
     5.248,
     6.56,
     8.2
    ],
    "nerolidol": [
     7.872,
     9.84,
     12.3
    ],
    "furfural": [
     59.294,
     74.118,
     92.647
    ],
    "methylpyrazine": [
     3.12,
     3.9,
     4.875
    ],
    "ethyl_furoate": [
     0.0,
     0.61,
     1.28
    ],
    "furfuryl_alcohol": [
     0.0,
     68.619,
     144.099
    ],
    "phenylacetaldehyde": [
     43.79,
     54.738,
     68.422
    ],
    "methanethiol": [
     0.657,
     0.821,
     1.027
    ],
    "dms": [
     4.32,
     5.4,
     6.75
    ],
    "benzaldehyde": [
     34.048,
     42.56,
     53.2
    ],
    "e_alpha_ionone": [
     0.201,
     0.251,
     0.313
    ],
    "e_beta_ionone": [
     0.094,
     0.118,
     0.147
    ],
    "4vg": [
     0.0,
     -0.036,
     0.018
    ],
    "4eg": [
     0.0,
     4.112,
     8.635
    ],
    "4ep": [
     0.0,
     3.2,
     6.72
    ],
    "eugenol": [
     0.0,
     1.314,
     2.76
    ],
    "guaiacol": [
     0.0,
     0.028,
     1.0
    ],
    "co2": [
     1770.0,
     2210.0,
     2770.0
    ],
    "so2": [
     3.84,
     4.8,
     6.0
    ],
    "iron": [
     0.0155,
     0.0194,
     0.0243
    ],
    "t2n": [
     0.173,
     0.216,
     0.271
    ]
   },
   "key": [
    "iso_alpha",
    "diacetyl",
    "cdbt",
    "linalool",
    "ethyl_hexanoate",
    "glycerol",
    "so2",
    "isoamyl_acetate",
    "phenylacetaldehyde",
    "ethyl_octanoate",
    "co2",
    "octenol"
   ],
   "fp": {
    "pos": [
     {
      "id": "so2",
      "d": 0.41
     }
    ],
    "neg": [
     {
      "id": "ethanol",
      "d": -2.2
     },
     {
      "id": "ethyl_acetate",
      "d": -2.2
     },
     {
      "id": "isoamyl_acetate",
      "d": -2.2
     },
     {
      "id": "isobutyl_acetate",
      "d": -2.2
     },
     {
      "id": "ethyl_hexanoate",
      "d": -2.2
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "wheat",
   "cn": "小麦啤",
   "en": "Wheat",
   "group": "wheat",
   "alias": "weizen witbier 白啤 小麦 德式小麦",
   "n": null,
   "abv": "4.5–5.5%",
   "desc": "小麦蛋白带来柔和的浑浊酒体，酵母酚香与果香交织成丁香与香蕉的组合。",
   "src": "表5 #142；表27 4VG",
   "profile": {
    "bitter": 2.6,
    "hop": 2.6,
    "ester": 3.2,
    "malt": 3.0,
    "roast": 0.5,
    "phenol": 2.4,
    "sour": 1.6,
    "alcohol": 2.8,
    "body": 2.9,
    "sulfur": 0.8,
    "aged": 1.0,
    "floral": 2.4
   },
   "values": {
    "ethanol": [
     35940.0,
     47290.0,
     61480.0
    ],
    "ethyl_acetate": [
     17.8,
     23.4,
     30.4
    ],
    "isoamyl_acetate": [
     2.54,
     3.34,
     4.34
    ],
    "isobutyl_acetate": [
     0.0899,
     0.1183,
     0.1538
    ],
    "ethyl_hexanoate": [
     0.3665,
     0.4823,
     0.6269
    ],
    "ethyl_octanoate": [
     0.7236,
     0.9522,
     1.24
    ],
    "ethyl_decanoate": [
     200.758,
     264.156,
     343.403
    ],
    "phenethyl_acetate": [
     0.3993,
     0.5254,
     0.683
    ],
    "phenethyl_alcohol": [
     16.8,
     22.1,
     28.7
    ],
    "isoamyl_alcohol": [
     47.0,
     61.9,
     80.4
    ],
    "isobutanol": [
     8.49,
     11.2,
     14.5
    ],
    "mb2": [
     8.51,
     11.2,
     14.6
    ],
    "glycerol": [
     1320.0,
     1740.0,
     2260.0
    ],
    "diacetyl": [
     0.0901,
     0.1186,
     0.1541
    ],
    "acetaldehyde": [
     2.15,
     2.83,
     3.68
    ],
    "ethyl_propionate": [
     38.434,
     50.571,
     65.743
    ],
    "hexyl_acetate": [
     45.235,
     59.52,
     77.376
    ],
    "amyl_acetate": [
     62.962,
     82.844,
     107.698
    ],
    "isopentyl_butanoate": [
     23.53,
     30.96,
     40.248
    ],
    "ethyl_isobutyrate": [
     38.16,
     50.211,
     65.274
    ],
    "octenol": [
     8.599,
     11.314,
     14.709
    ],
    "lactic_acid": [
     855,
     1120.0,
     1460.0
    ],
    "octanoic_acid": [
     4.19,
     5.52,
     7.17
    ],
    "iso_alpha": [
     12.3,
     16.2,
     21.1
    ],
    "linalool": [
     99.18,
     130.5,
     169.65
    ],
    "geraniol": [
     30.78,
     40.5,
     52.65
    ],
    "citronellol": [
     12.201,
     16.054,
     20.871
    ],
    "nerol": [
     12.225,
     16.085,
     20.911
    ],
    "cdbt": [
     218.67,
     287.724,
     374.041
    ],
    "beta_phellandrene": [
     6.247,
     8.22,
     10.686
    ],
    "alpha_terpineol": [
     30.802,
     40.529,
     52.687
    ],
    "terpinen_4_ol": [
     24.793,
     32.622,
     42.409
    ],
    "beta_caryophyllene": [
     36.962,
     48.634,
     63.225
    ],
    "z_farnesene": [
     49.586,
     65.244,
     84.818
    ],
    "farnesol": [
     12.038,
     15.84,
     20.592
    ],
    "nerolidol": [
     18.058,
     23.76,
     30.888
    ],
    "furfural": [
     67.953,
     89.412,
     116.235
    ],
    "methylpyrazine": [
     3.529,
     4.643,
     6.036
    ],
    "ethyl_furoate": [
     0.0,
     0.762,
     1.6
    ],
    "furfuryl_alcohol": [
     65.188,
     85.773,
     111.505
    ],
    "phenylacetaldehyde": [
     68.04,
     89.527,
     116.385
    ],
    "methanethiol": [
     0.0,
     0.352,
     0.739
    ],
    "dms": [
     0.0,
     2.314,
     4.86
    ],
    "benzaldehyde": [
     38.507,
     50.667,
     65.867
    ],
    "e_alpha_ionone": [
     0.384,
     0.505,
     0.657
    ],
    "e_beta_ionone": [
     0.286,
     0.377,
     0.49
    ],
    "4vg": [
     1.47,
     1.94,
     2.52
    ],
    "4eg": [
     133.484,
     175.636,
     228.327
    ],
    "4ep": [
     52.288,
     68.8,
     89.44
    ],
    "eugenol": [
     17.849,
     23.486,
     30.531
    ],
    "guaiacol": [
     18.538,
     24.392,
     31.709
    ],
    "co2": [
     2810.0,
     3690.0,
     4800.0
    ],
    "so2": [
     3.65,
     4.8,
     6.24
    ],
    "iron": [
     0.0266,
     0.035,
     0.0455
    ],
    "t2n": [
     0.206,
     0.271,
     0.352
    ]
   },
   "key": [
    "4vg",
    "linalool",
    "isoamyl_acetate",
    "ethanol",
    "ethyl_octanoate",
    "ethyl_hexanoate",
    "glycerol",
    "diacetyl",
    "lactic_acid",
    "ethyl_acetate",
    "isobutyl_acetate",
    "geraniol"
   ],
   "fp": {
    "pos": [
     {
      "id": "4vg",
      "d": 1.47
     },
     {
      "id": "linalool",
      "d": 1.45
     },
     {
      "id": "geraniol",
      "d": 1.37
     },
     {
      "id": "eugenol",
      "d": 0.87
     },
     {
      "id": "lactic_acid",
      "d": 0.73
     }
    ],
    "neg": [
     {
      "id": "ethyl_furoate",
      "d": -0.95
     },
     {
      "id": "furfuryl_alcohol",
      "d": -0.88
     },
     {
      "id": "furfural",
      "d": -0.84
     },
     {
      "id": "dms",
      "d": -0.76
     },
     {
      "id": "methylpyrazine",
      "d": -0.68
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "fruit",
   "cn": "果味啤酒",
   "en": "Fruitbeer",
   "group": "sour",
   "alias": "fruit beer 果啤 果味",
   "n": null,
   "abv": "4.0–6.0%",
   "desc": "在基酒上叠加果汁或果泥，果香主导、酸度上升，苦味退到背景。",
   "src": "图19",
   "profile": {
    "bitter": 1.4,
    "hop": 1.4,
    "ester": 3.6,
    "malt": 3.6,
    "roast": 0.5,
    "phenol": 0.8,
    "sour": 2.6,
    "alcohol": 2.2,
    "body": 2.8,
    "sulfur": 0.6,
    "aged": 0.8,
    "floral": 2.2
   },
   "values": {
    "ethanol": [
     27860.0,
     39810.0,
     54730.0
    ],
    "ethyl_acetate": [
     18.0,
     25.7,
     35.3
    ],
    "isoamyl_acetate": [
     2.63,
     3.76,
     5.17
    ],
    "isobutyl_acetate": [
     0.0903,
     0.129,
     0.1774
    ],
    "ethyl_hexanoate": [
     0.3906,
     0.558,
     0.7673
    ],
    "ethyl_octanoate": [
     0.7442,
     1.06,
     1.46
    ],
    "ethyl_decanoate": [
     206.091,
     294.416,
     404.821
    ],
    "phenethyl_acetate": [
     0.3749,
     0.5355,
     0.7364
    ],
    "phenethyl_alcohol": [
     14.6,
     20.9,
     28.7
    ],
    "isoamyl_alcohol": [
     37.4,
     53.4,
     73.4
    ],
    "isobutanol": [
     6.29,
     8.98,
     12.4
    ],
    "mb2": [
     6.36,
     9.09,
     12.5
    ],
    "glycerol": [
     1240.0,
     1760.0,
     2430.0
    ],
    "diacetyl": [
     0.0948,
     0.1354,
     0.1861
    ],
    "acetaldehyde": [
     2.21,
     3.16,
     4.34
    ],
    "ethyl_propionate": [
     39.2,
     56.0,
     77.0
    ],
    "hexyl_acetate": [
     45.612,
     65.16,
     89.595
    ],
    "amyl_acetate": [
     65.084,
     92.978,
     127.844
    ],
    "isopentyl_butanoate": [
     24.276,
     34.68,
     47.685
    ],
    "ethyl_isobutyrate": [
     38.758,
     55.368,
     76.132
    ],
    "octenol": [
     8.848,
     12.64,
     17.38
    ],
    "lactic_acid": [
     542,
     775,
     1070.0
    ],
    "octanoic_acid": [
     3.93,
     5.61,
     7.71
    ],
    "iso_alpha": [
     8.23,
     11.8,
     16.2
    ],
    "linalool": [
     28.858,
     41.226,
     56.685
    ],
    "geraniol": [
     10.424,
     14.892,
     20.476
    ],
    "citronellol": [
     7.128,
     10.183,
     14.001
    ],
    "nerol": [
     7.042,
     10.06,
     13.832
    ],
    "cdbt": [
     105.772,
     151.103,
     207.767
    ],
    "beta_phellandrene": [
     2.142,
     3.06,
     4.208
    ],
    "alpha_terpineol": [
     16.72,
     23.885,
     32.842
    ],
    "terpinen_4_ol": [
     8.027,
     11.467,
     15.767
    ],
    "beta_caryophyllene": [
     11.412,
     16.303,
     22.417
    ],
    "z_farnesene": [
     25.636,
     36.622,
     50.356
    ],
    "farnesol": [
     7.728,
     11.04,
     15.18
    ],
    "nerolidol": [
     11.592,
     16.56,
     22.77
    ],
    "furfural": [
     66.541,
     95.059,
     130.706
    ],
    "methylpyrazine": [
     4.03,
     5.757,
     7.916
    ],
    "ethyl_furoate": [
     0.0,
     0.457,
     0.96
    ],
    "furfuryl_alcohol": [
     0.0,
     51.464,
     108.074
    ],
    "phenylacetaldehyde": [
     67.046,
     95.78,
     131.697
    ],
    "methanethiol": [
     0.0,
     0.117,
     0.246
    ],
    "dms": [
     0.0,
     0.771,
     1.62
    ],
    "benzaldehyde": [
     43.979,
     62.827,
     86.387
    ],
    "e_alpha_ionone": [
     0.366,
     0.522,
     0.718
    ],
    "e_beta_ionone": [
     0.229,
     0.327,
     0.449
    ],
    "4vg": [
     0.0756,
     0.108,
     0.1485
    ],
    "4eg": [
     0.0,
     34.657,
     72.78
    ],
    "4ep": [
     10.08,
     14.4,
     19.8
    ],
    "eugenol": [
     4.76,
     6.8,
     9.35
    ],
    "guaiacol": [
     0.0,
     4.531,
     9.516
    ],
    "co2": [
     2570.0,
     3670.0,
     5040.0
    ],
    "so2": [
     2.8,
     4.0,
     5.5
    ],
    "iron": [
     0.0175,
     0.025,
     0.0343
    ],
    "t2n": [
     0.114,
     0.162,
     0.223
    ]
   },
   "key": [
    "isoamyl_acetate",
    "ethyl_hexanoate",
    "ethyl_octanoate",
    "diacetyl",
    "ethyl_acetate",
    "glycerol",
    "isobutyl_acetate",
    "ethyl_decanoate",
    "lactic_acid",
    "ethanol",
    "phenethyl_acetate",
    "phenethyl_alcohol"
   ],
   "fp": {
    "pos": [
     {
      "id": "ethyl_hexanoate",
      "d": 0.8
     },
     {
      "id": "isoamyl_acetate",
      "d": 0.72
     },
     {
      "id": "amyl_acetate",
      "d": 0.71
     },
     {
      "id": "isopentyl_butanoate",
      "d": 0.71
     },
     {
      "id": "ethyl_propionate",
      "d": 0.7
     }
    ],
    "neg": [
     {
      "id": "terpinen_4_ol",
      "d": -2.16
     },
     {
      "id": "dms",
      "d": -2.11
     },
     {
      "id": "beta_phellandrene",
      "d": -2.06
     },
     {
      "id": "beta_caryophyllene",
      "d": -2.03
     },
     {
      "id": "methanethiol",
      "d": -1.58
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "lambic",
   "cn": "兰比克",
   "en": "Lambic",
   "group": "sour",
   "alias": "lambic 兰比克 自然发酵 酸啤 sour",
   "n": 11,
   "abv": "5.0–6.5%",
   "desc": "自然发酵、长时间桶陈，乳酸与乙酸共同构成本能的酸，混着谷仓与皮革的野性。",
   "src": "表12 / 表13 / 表27",
   "profile": {
    "bitter": 2.0,
    "hop": 2.0,
    "ester": 3.0,
    "malt": 1.6,
    "roast": 0.6,
    "phenol": 1.8,
    "sour": 5.2,
    "alcohol": 2.2,
    "body": 2.4,
    "sulfur": 1.4,
    "aged": 2.4,
    "floral": 1.0
   },
   "values": {
    "ethanol": [
     25610.0,
     36580.0,
     50300.0
    ],
    "ethyl_acetate": [
     14.3,
     20.5,
     28.1
    ],
    "isoamyl_acetate": [
     2.03,
     2.9,
     3.99
    ],
    "isobutyl_acetate": [
     0.0642,
     0.0918,
     0.1262
    ],
    "ethyl_hexanoate": [
     0.2966,
     0.4238,
     0.5827
    ],
    "ethyl_octanoate": [
     0.6022,
     0.8603,
     1.18
    ],
    "ethyl_decanoate": [
     166.818,
     238.312,
     327.679
    ],
    "phenethyl_acetate": [
     0.1944,
     0.2777,
     0.3818
    ],
    "phenethyl_alcohol": [
     4.47,
     6.39,
     8.79
    ],
    "isoamyl_alcohol": [
     33.9,
     48.4,
     66.5
    ],
    "isobutanol": [
     5.9,
     8.43,
     11.6
    ],
    "mb2": [
     5.93,
     8.47,
     11.6
    ],
    "glycerol": [
     882,
     1260.0,
     1730.0
    ],
    "diacetyl": [
     0.0482,
     0.0688,
     0.0946
    ],
    "acetaldehyde": [
     4.15,
     5.93,
     8.15
    ],
    "ethyl_propionate": [
     29.0,
     41.429,
     56.964
    ],
    "hexyl_acetate": [
     32.76,
     46.8,
     64.35
    ],
    "amyl_acetate": [
     49.778,
     71.111,
     97.778
    ],
    "isopentyl_butanoate": [
     18.48,
     26.4,
     36.3
    ],
    "ethyl_isobutyrate": [
     28.368,
     40.526,
     55.724
    ],
    "octenol": [
     8.592,
     12.274,
     16.877
    ],
    "lactic_acid": [
     1640.0,
     2340.0,
     3220.0
    ],
    "octanoic_acid": [
     6.65,
     9.5,
     13.1
    ],
    "iso_alpha": [
     4.31,
     6.16,
     8.47
    ],
    "linalool": [
     30.077,
     42.968,
     59.081
    ],
    "geraniol": [
     9.02,
     12.885,
     17.717
    ],
    "citronellol": [
     5.79,
     8.272,
     11.374
    ],
    "nerol": [
     5.898,
     8.426,
     11.585
    ],
    "cdbt": [
     125.034,
     178.621,
     245.603
    ],
    "beta_phellandrene": [
     4.074,
     5.82,
     8.003
    ],
    "alpha_terpineol": [
     15.851,
     22.644,
     31.135
    ],
    "terpinen_4_ol": [
     16.116,
     23.022,
     31.656
    ],
    "beta_caryophyllene": [
     23.964,
     34.234,
     47.072
    ],
    "z_farnesene": [
     26.756,
     38.222,
     52.556
    ],
    "farnesol": [
     5.04,
     7.2,
     9.9
    ],
    "nerolidol": [
     7.56,
     10.8,
     14.85
    ],
    "furfural": [
     379.75,
     542.5,
     745.938
    ],
    "methylpyrazine": [
     1.86,
     2.657,
     3.654
    ],
    "ethyl_furoate": [
     2.2,
     3.143,
     4.321
    ],
    "furfuryl_alcohol": [
     1036.0,
     1480.0,
     2035.0
    ],
    "phenylacetaldehyde": [
     34.617,
     49.453,
     67.998
    ],
    "methanethiol": [
     0.769,
     1.099,
     1.511
    ],
    "dms": [
     4.992,
     7.131,
     9.806
    ],
    "benzaldehyde": [
     16.427,
     23.467,
     32.267
    ],
    "e_alpha_ionone": [
     0.118,
     0.169,
     0.232
    ],
    "e_beta_ionone": [
     0.163,
     0.233,
     0.32
    ],
    "4vg": [
     0.8505,
     1.22,
     1.67
    ],
    "4eg": [
     119.999,
     171.427,
     235.712
    ],
    "4ep": [
     50.4,
     72.0,
     99.0
    ],
    "eugenol": [
     10.76,
     15.371,
     21.136
    ],
    "guaiacol": [
     15.38,
     21.972,
     30.212
    ],
    "co2": [
     4040.0,
     5770.0,
     7940.0
    ],
    "so2": [
     2.24,
     3.2,
     4.4
    ],
    "iron": [
     0.0414,
     0.0591,
     0.0813
    ],
    "t2n": [
     1.418,
     2.025,
     2.784
    ]
   },
   "key": [
    "lactic_acid",
    "co2",
    "4vg",
    "isoamyl_acetate",
    "ethyl_octanoate",
    "t2n",
    "ethyl_hexanoate",
    "octanoic_acid",
    "acetaldehyde",
    "ethyl_acetate",
    "furfuryl_alcohol",
    "ethanol"
   ],
   "fp": {
    "pos": [
     {
      "id": "lactic_acid",
      "d": 2.2
     },
     {
      "id": "furfuryl_alcohol",
      "d": 1.49
     },
     {
      "id": "4vg",
      "d": 1.32
     }
    ],
    "neg": [
     {
      "id": "phenylacetaldehyde",
      "d": -1.01
     },
     {
      "id": "isoamyl_acetate",
      "d": -0.98
     }
    ],
    "src": "表12",
    "notes": [
     {
      "k": "isopentenyl_isobutyrate",
      "d": 1.33
     },
     {
      "k": "acetic_acid",
      "d": 1.25
     },
     {
      "k": "pH",
      "d": -2.01
     },
     {
      "k": "α-木罗醇",
      "d": -1.08
     },
     {
      "k": "苦度",
      "d": -1.08
     }
    ]
   }
  },
  {
   "id": "kriek",
   "cn": "樱桃兰比克",
   "en": "Kriek",
   "group": "sour",
   "alias": "kriek 樱桃 酸啤 sour",
   "n": 10,
   "abv": "5.0–6.5%",
   "desc": "兰比克基酒浸渍樱桃，果酸与乳酸叠加，杏仁与丁香从核果里透出来。",
   "src": "表12 / 表13",
   "profile": {
    "bitter": 1.8,
    "hop": 1.8,
    "ester": 3.4,
    "malt": 2.4,
    "roast": 0.6,
    "phenol": 2.6,
    "sour": 5.0,
    "alcohol": 2.2,
    "body": 2.8,
    "sulfur": 0.8,
    "aged": 1.8,
    "floral": 2.4
   },
   "values": {
    "ethanol": [
     27590.0,
     39420.0,
     54200.0
    ],
    "ethyl_acetate": [
     17.9,
     25.5,
     35.1
    ],
    "isoamyl_acetate": [
     2.5,
     3.56,
     4.9
    ],
    "isobutyl_acetate": [
     0.0876,
     0.1251,
     0.172
    ],
    "ethyl_hexanoate": [
     0.3523,
     0.5032,
     0.692
    ],
    "ethyl_octanoate": [
     0.703,
     1.0,
     1.38
    ],
    "ethyl_decanoate": [
     194.818,
     278.312,
     382.679
    ],
    "phenethyl_acetate": [
     0.3707,
     0.5296,
     0.7282
    ],
    "phenethyl_alcohol": [
     14.9,
     21.3,
     29.3
    ],
    "isoamyl_alcohol": [
     36.9,
     52.7,
     72.5
    ],
    "isobutanol": [
     6.29,
     8.98,
     12.4
    ],
    "mb2": [
     6.36,
     9.09,
     12.5
    ],
    "glycerol": [
     1120.0,
     1600.0,
     2200.0
    ],
    "diacetyl": [
     0.0692,
     0.0989,
     0.136
    ],
    "acetaldehyde": [
     3.69,
     5.27,
     7.25
    ],
    "ethyl_propionate": [
     37.6,
     53.714,
     73.857
    ],
    "hexyl_acetate": [
     44.1,
     63.0,
     86.625
    ],
    "amyl_acetate": [
     61.849,
     88.356,
     121.489
    ],
    "isopentyl_butanoate": [
     23.1,
     33.0,
     45.375
    ],
    "ethyl_isobutyrate": [
     37.284,
     53.263,
     73.237
    ],
    "octenol": [
     8.816,
     12.594,
     17.317
    ],
    "lactic_acid": [
     1420.0,
     2020.0,
     2780.0
    ],
    "octanoic_acid": [
     7.17,
     10.2,
     14.1
    ],
    "iso_alpha": [
     3.53,
     5.04,
     6.93
    ],
    "linalool": [
     37.394,
     53.419,
     73.452
    ],
    "geraniol": [
     13.068,
     18.669,
     25.67
    ],
    "citronellol": [
     8.846,
     12.637,
     17.376
    ],
    "nerol": [
     8.781,
     12.545,
     17.249
    ],
    "cdbt": [
     140.579,
     200.828,
     276.138
    ],
    "beta_phellandrene": [
     4.144,
     5.92,
     8.14
    ],
    "alpha_terpineol": [
     21.29,
     30.414,
     41.819
    ],
    "terpinen_4_ol": [
     17.298,
     24.711,
     33.978
    ],
    "beta_caryophyllene": [
     26.783,
     38.262,
     52.61
    ],
    "z_farnesene": [
     33.227,
     47.467,
     65.267
    ],
    "farnesol": [
     9.296,
     13.28,
     18.26
    ],
    "nerolidol": [
     13.944,
     19.92,
     27.39
    ],
    "furfural": [
     83.918,
     119.882,
     164.838
    ],
    "methylpyrazine": [
     2.9,
     4.143,
     5.696
    ],
    "ethyl_furoate": [
     1.56,
     2.229,
     3.064
    ],
    "furfuryl_alcohol": [
     166.499,
     237.856,
     327.052
    ],
    "phenylacetaldehyde": [
     59.771,
     85.387,
     117.407
    ],
    "methanethiol": [
     0.0,
     0.395,
     0.829
    ],
    "dms": [
     1.752,
     2.503,
     3.441
    ],
    "benzaldehyde": [
     27.776,
     39.68,
     54.56
    ],
    "e_alpha_ionone": [
     0.319,
     0.456,
     0.627
    ],
    "e_beta_ionone": [
     0.31,
     0.443,
     0.609
    ],
    "4vg": [
     0.5985,
     0.855,
     1.18
    ],
    "4eg": [
     379.75,
     542.5,
     745.938
    ],
    "4ep": [
     201.6,
     288.0,
     396.0
    ],
    "eugenol": [
     48.3,
     69.0,
     94.875
    ],
    "guaiacol": [
     20.824,
     29.748,
     40.904
    ],
    "co2": [
     3970.0,
     5670.0,
     7790.0
    ],
    "so2": [
     2.52,
     3.6,
     4.95
    ],
    "iron": [
     0.0336,
     0.048,
     0.066
    ],
    "t2n": [
     0.497,
     0.709,
     0.975
    ]
   },
   "key": [
    "lactic_acid",
    "eugenol",
    "isoamyl_acetate",
    "4ep",
    "ethyl_octanoate",
    "ethyl_hexanoate",
    "ethyl_acetate",
    "octanoic_acid",
    "4vg",
    "co2",
    "isobutyl_acetate",
    "4eg"
   ],
   "fp": {
    "pos": [
     {
      "id": "eugenol",
      "d": 2.03
     },
     {
      "id": "lactic_acid",
      "d": 1.98
     },
     {
      "id": "4ep",
      "d": 1.5
     }
    ],
    "neg": [],
    "src": "表12",
    "notes": [
     {
      "k": "ethyl_benzoate",
      "d": 1.85
     },
     {
      "k": "β-罗勒烯",
      "d": 1.76
     },
     {
      "k": "β-葡聚糖",
      "d": -1.19
     },
     {
      "k": "表库贝醇",
      "d": -1.18
     },
     {
      "k": "DES",
      "d": -1.14
     },
     {
      "k": "苦度",
      "d": -1.11
     },
     {
      "k": "葎草酮环氧化物 II",
      "d": -1.1
     }
    ]
   }
  },
  {
   "id": "hoppy",
   "cn": "酒花型艾尔",
   "en": "Hoppy",
   "group": "ale",
   "alias": "ipa india pale ale 印度淡色艾尔 酒花 双倍ipa",
   "n": null,
   "abv": "5.5–7.5%",
   "desc": "以大量酒花投放与干投为核心，柑橘、松脂与热带水果层层堆叠，苦味干净而持续。",
   "src": "表5 #213；表27",
   "profile": {
    "bitter": 5.0,
    "hop": 5.0,
    "ester": 3.2,
    "malt": 2.2,
    "roast": 0.8,
    "phenol": 1.0,
    "sour": 1.0,
    "alcohol": 4.0,
    "body": 3.0,
    "sulfur": 0.8,
    "aged": 1.2,
    "floral": 3.0
   },
   "values": {
    "ethanol": [
     48100.0,
     63290.0,
     82280.0
    ],
    "ethyl_acetate": [
     18.8,
     24.8,
     32.2
    ],
    "isoamyl_acetate": [
     2.6,
     3.43,
     4.45
    ],
    "isobutyl_acetate": [
     0.0964,
     0.1268,
     0.1648
    ],
    "ethyl_hexanoate": [
     0.3551,
     0.4672,
     0.6074
    ],
    "ethyl_octanoate": [
     0.7287,
     0.9588,
     1.25
    ],
    "ethyl_decanoate": [
     202.239,
     266.104,
     345.935
    ],
    "phenethyl_acetate": [
     0.4565,
     0.6007,
     0.7809
    ],
    "phenethyl_alcohol": [
     20.5,
     26.9,
     35.0
    ],
    "isoamyl_alcohol": [
     61.3,
     80.7,
     105
    ],
    "isobutanol": [
     11.7,
     15.4,
     20.1
    ],
    "mb2": [
     11.6,
     15.3,
     19.8
    ],
    "glycerol": [
     1290.0,
     1690.0,
     2200.0
    ],
    "diacetyl": [
     0.0727,
     0.0957,
     0.1244
    ],
    "acetaldehyde": [
     2.2,
     2.9,
     3.77
    ],
    "ethyl_propionate": [
     40.389,
     53.143,
     69.086
    ],
    "hexyl_acetate": [
     48.245,
     63.48,
     82.524
    ],
    "amyl_acetate": [
     64.988,
     85.511,
     111.164
    ],
    "isopentyl_butanoate": [
     24.35,
     32.04,
     41.652
    ],
    "ethyl_isobutyrate": [
     40.32,
     53.053,
     68.968
    ],
    "octenol": [
     7.035,
     9.257,
     12.034
    ],
    "lactic_acid": [
     376,
     495,
     644
    ],
    "octanoic_acid": [
     2.86,
     3.77,
     4.9
    ],
    "iso_alpha": [
     32.3,
     42.6,
     55.3
    ],
    "linalool": [
     140.22,
     184.5,
     239.85
    ],
    "geraniol": [
     47.88,
     63.0,
     81.9
    ],
    "citronellol": [
     29.64,
     39.0,
     50.7
    ],
    "nerol": [
     21.927,
     28.851,
     37.506
    ],
    "cdbt": [
     598.5,
     787.5,
     1023.75
    ],
    "beta_phellandrene": [
     10.944,
     14.4,
     18.72
    ],
    "alpha_terpineol": [
     57.218,
     75.287,
     97.874
    ],
    "terpinen_4_ol": [
     39.858,
     52.444,
     68.178
    ],
    "beta_caryophyllene": [
     84.36,
     111.0,
     144.3
    ],
    "z_farnesene": [
     94.578,
     124.444,
     161.778
    ],
    "farnesol": [
     20.064,
     26.4,
     34.32
    ],
    "nerolidol": [
     30.096,
     39.6,
     51.48
    ],
    "furfural": [
     74.48,
     98.0,
     127.4
    ],
    "methylpyrazine": [
     3.8,
     5.0,
     6.5
    ],
    "ethyl_furoate": [
     1.375,
     1.81,
     2.352
    ],
    "furfuryl_alcohol": [
     125.11,
     164.619,
     214.004
    ],
    "phenylacetaldehyde": [
     65.898,
     86.708,
     112.721
    ],
    "methanethiol": [
     0.365,
     0.48,
     0.624
    ],
    "dms": [
     2.189,
     2.88,
     3.744
    ],
    "benzaldehyde": [
     28.86,
     37.973,
     49.365
    ],
    "e_alpha_ionone": [
     0.406,
     0.535,
     0.695
    ],
    "e_beta_ionone": [
     0.404,
     0.532,
     0.691
    ],
    "4vg": [
     0.0,
     0.045,
     0.0945
    ],
    "4eg": [
     54.242,
     71.371,
     92.782
    ],
    "4ep": [
     20.672,
     27.2,
     35.36
    ],
    "eugenol": [
     5.602,
     7.371,
     9.583
    ],
    "guaiacol": [
     7.324,
     9.636,
     12.527
    ],
    "co2": [
     3600.0,
     4730.0,
     6150.0
    ],
    "so2": [
     3.34,
     4.4,
     5.72
    ],
    "iron": [
     0.0381,
     0.0501,
     0.0652
    ],
    "t2n": [
     0.301,
     0.396,
     0.515
    ]
   },
   "key": [
    "cdbt",
    "linalool",
    "iso_alpha",
    "geraniol",
    "ethanol",
    "citronellol",
    "beta_caryophyllene",
    "isoamyl_acetate",
    "z_farnesene",
    "isoamyl_alcohol",
    "alpha_terpineol",
    "ethyl_octanoate"
   ],
   "fp": {
    "pos": [
     {
      "id": "geraniol",
      "d": 2.2
     },
     {
      "id": "citronellol",
      "d": 2.2
     },
     {
      "id": "cdbt",
      "d": 2.2
     },
     {
      "id": "beta_caryophyllene",
      "d": 2.2
     },
     {
      "id": "linalool",
      "d": 2.17
     }
    ],
    "neg": [
     {
      "id": "octenol",
      "d": -1.09
     },
     {
      "id": "benzaldehyde",
      "d": -1.01
     },
     {
      "id": "4vg",
      "d": -0.74
     },
     {
      "id": "furfural",
      "d": -0.72
     },
     {
      "id": "methylpyrazine",
      "d": -0.59
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "wfa",
   "cn": "西佛兰德艾尔",
   "en": "West Flanders ale",
   "group": "sour",
   "alias": "west flanders 西佛兰德 红艾尔 酸啤",
   "n": null,
   "abv": "5.5–7.0%",
   "desc": "混合发酵的红色艾尔，酸度明快，果味与香醋气息交织，收口干。",
   "src": "表12 乙酸实测最高",
   "profile": {
    "bitter": 2.4,
    "hop": 2.0,
    "ester": 2.4,
    "malt": 2.8,
    "roast": 1.4,
    "phenol": 2.0,
    "sour": 4.2,
    "alcohol": 2.8,
    "body": 3.0,
    "sulfur": 1.0,
    "aged": 2.8,
    "floral": 1.2
   },
   "values": {
    "ethanol": [
     32380.0,
     46260.0,
     63600.0
    ],
    "ethyl_acetate": [
     11.9,
     17.0,
     23.3
    ],
    "isoamyl_acetate": [
     1.58,
     2.25,
     3.1
    ],
    "isobutyl_acetate": [
     0.052,
     0.0743,
     0.1021
    ],
    "ethyl_hexanoate": [
     0.2446,
     0.3495,
     0.4806
    ],
    "ethyl_octanoate": [
     0.5066,
     0.7237,
     0.9951
    ],
    "ethyl_decanoate": [
     141.182,
     201.688,
     277.321
    ],
    "phenethyl_acetate": [
     0.199,
     0.2843,
     0.3909
    ],
    "phenethyl_alcohol": [
     6.96,
     9.95,
     13.7
    ],
    "isoamyl_alcohol": [
     42.0,
     60.0,
     82.5
    ],
    "isobutanol": [
     7.92,
     11.3,
     15.6
    ],
    "mb2": [
     7.94,
     11.3,
     15.6
    ],
    "glycerol": [
     1240.0,
     1770.0,
     2440.0
    ],
    "diacetyl": [
     0.0797,
     0.1139,
     0.1566
    ],
    "acetaldehyde": [
     4.03,
     5.75,
     7.91
    ],
    "ethyl_propionate": [
     23.0,
     32.857,
     45.179
    ],
    "hexyl_acetate": [
     26.376,
     37.68,
     51.81
    ],
    "amyl_acetate": [
     38.827,
     55.467,
     76.267
    ],
    "isopentyl_butanoate": [
     14.448,
     20.64,
     28.38
    ],
    "ethyl_isobutyrate": [
     22.621,
     32.316,
     44.434
    ],
    "octenol": [
     12.88,
     18.4,
     25.3
    ],
    "lactic_acid": [
     1320.0,
     1890.0,
     2600.0
    ],
    "octanoic_acid": [
     6.24,
     8.92,
     12.3
    ],
    "iso_alpha": [
     14.8,
     21.2,
     29.1
    ],
    "linalool": [
     31.622,
     45.174,
     62.115
    ],
    "geraniol": [
     9.736,
     13.908,
     19.124
    ],
    "citronellol": [
     6.312,
     9.017,
     12.399
    ],
    "nerol": [
     6.398,
     9.14,
     12.568
    ],
    "cdbt": [
     129.428,
     184.897,
     254.233
    ],
    "beta_phellandrene": [
     4.2,
     6.0,
     8.25
    ],
    "alpha_terpineol": [
     16.88,
     24.115,
     33.158
    ],
    "terpinen_4_ol": [
     16.8,
     24.0,
     33.0
    ],
    "beta_caryophyllene": [
     25.2,
     36.0,
     49.5
    ],
    "z_farnesene": [
     28.124,
     40.178,
     55.244
    ],
    "farnesol": [
     5.712,
     8.16,
     11.22
    ],
    "nerolidol": [
     8.568,
     12.24,
     16.83
    ],
    "furfural": [
     161.988,
     231.412,
     318.191
    ],
    "methylpyrazine": [
     6.86,
     9.8,
     13.475
    ],
    "ethyl_furoate": [
     4.013,
     5.733,
     7.883
    ],
    "furfuryl_alcohol": [
     369.715,
     528.165,
     726.227
    ],
    "phenylacetaldehyde": [
     56.565,
     80.807,
     111.11
    ],
    "methanethiol": [
     0.679,
     0.971,
     1.335
    ],
    "dms": [
     3.888,
     5.554,
     7.637
    ],
    "benzaldehyde": [
     40.021,
     57.173,
     78.613
    ],
    "e_alpha_ionone": [
     0.209,
     0.299,
     0.411
    ],
    "e_beta_ionone": [
     0.269,
     0.385,
     0.529
    ],
    "4vg": [
     0.378,
     0.54,
     0.7425
    ],
    "4eg": [
     154.264,
     220.378,
     303.019
    ],
    "4ep": [
     59.36,
     84.8,
     116.6
    ],
    "eugenol": [
     13.24,
     18.914,
     26.007
    ],
    "guaiacol": [
     20.667,
     29.524,
     40.596
    ],
    "co2": [
     3860.0,
     5520.0,
     7590.0
    ],
    "so2": [
     2.8,
     4.0,
     5.5
    ],
    "iron": [
     0.0512,
     0.0732,
     0.1006
    ],
    "t2n": [
     0.908,
     1.298,
     1.784
    ]
   },
   "key": [
    "lactic_acid",
    "ethanol",
    "glycerol",
    "co2",
    "diacetyl",
    "octanoic_acid",
    "iso_alpha",
    "acetaldehyde",
    "isoamyl_alcohol",
    "ethyl_octanoate",
    "t2n",
    "ethyl_hexanoate"
   ],
   "fp": {
    "pos": [
     {
      "id": "lactic_acid",
      "d": 1.42
     },
     {
      "id": "acetaldehyde",
      "d": 1.39
     },
     {
      "id": "iron",
      "d": 1.25
     },
     {
      "id": "t2n",
      "d": 1.17
     },
     {
      "id": "octanoic_acid",
      "d": 1.13
     }
    ],
    "neg": [
     {
      "id": "phenethyl_acetate",
      "d": -1.16
     },
     {
      "id": "phenethyl_alcohol",
      "d": -1.13
     },
     {
      "id": "e_alpha_ionone",
      "d": -1.12
     },
     {
      "id": "isobutyl_acetate",
      "d": -1.03
     },
     {
      "id": "hexyl_acetate",
      "d": -1.03
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "brett",
   "cn": "布雷特 / 混合发酵",
   "en": "Brett / cofermented",
   "group": "sour",
   "alias": "brett 布雷特 混合发酵 酸啤",
   "n": null,
   "abv": "5.0–7.0%",
   "desc": "布雷特酵母主导的混合发酵，马厩、皮革与熟果味并存，酒体薄而层次多。",
   "src": "表6 模块3",
   "profile": {
    "bitter": 2.0,
    "hop": 1.8,
    "ester": 2.8,
    "malt": 2.6,
    "roast": 0.8,
    "phenol": 3.0,
    "sour": 3.6,
    "alcohol": 2.8,
    "body": 2.6,
    "sulfur": 1.2,
    "aged": 2.0,
    "floral": 1.6
   },
   "values": {
    "ethanol": [
     31480.0,
     44970.0,
     61830.0
    ],
    "ethyl_acetate": [
     13.9,
     19.9,
     27.3
    ],
    "isoamyl_acetate": [
     1.94,
     2.77,
     3.8
    ],
    "isobutyl_acetate": [
     0.0654,
     0.0935,
     0.1285
    ],
    "ethyl_hexanoate": [
     0.2872,
     0.4103,
     0.5641
    ],
    "ethyl_octanoate": [
     0.5703,
     0.8148,
     1.12
    ],
    "ethyl_decanoate": [
     158.273,
     226.104,
     310.893
    ],
    "phenethyl_acetate": [
     0.2589,
     0.3698,
     0.5085
    ],
    "phenethyl_alcohol": [
     9.55,
     13.6,
     18.8
    ],
    "isoamyl_alcohol": [
     40.8,
     58.3,
     80.1
    ],
    "isobutanol": [
     7.54,
     10.8,
     14.8
    ],
    "mb2": [
     7.51,
     10.7,
     14.8
    ],
    "glycerol": [
     1060.0,
     1510.0,
     2080.0
    ],
    "diacetyl": [
     0.0715,
     0.1021,
     0.1404
    ],
    "acetaldehyde": [
     3.27,
     4.68,
     6.43
    ],
    "ethyl_propionate": [
     28.6,
     40.857,
     56.179
    ],
    "hexyl_acetate": [
     33.096,
     47.28,
     65.01
    ],
    "amyl_acetate": [
     47.787,
     68.267,
     93.867
    ],
    "isopentyl_butanoate": [
     17.808,
     25.44,
     34.98
    ],
    "ethyl_isobutyrate": [
     28.221,
     40.316,
     55.434
    ],
    "octenol": [
     9.936,
     14.194,
     19.517
    ],
    "lactic_acid": [
     882,
     1260.0,
     1730.0
    ],
    "octanoic_acid": [
     5.88,
     8.39,
     11.5
    ],
    "iso_alpha": [
     12.0,
     17.1,
     23.5
    ],
    "linalool": [
     31.215,
     44.594,
     61.316
    ],
    "geraniol": [
     10.204,
     14.577,
     20.043
    ],
    "citronellol": [
     6.758,
     9.654,
     13.275
    ],
    "nerol": [
     6.78,
     9.685,
     13.317
    ],
    "cdbt": [
     123.007,
     175.724,
     241.621
    ],
    "beta_phellandrene": [
     4.396,
     6.28,
     8.635
    ],
    "alpha_terpineol": [
     17.17,
     24.529,
     33.727
    ],
    "terpinen_4_ol": [
     18.667,
     26.667,
     36.667
    ],
    "beta_caryophyllene": [
     29.255,
     41.793,
     57.466
    ],
    "z_farnesene": [
     27.751,
     39.644,
     54.511
    ],
    "farnesol": [
     6.608,
     9.44,
     12.98
    ],
    "nerolidol": [
     9.912,
     14.16,
     19.47
    ],
    "furfural": [
     103.518,
     147.882,
     203.338
    ],
    "methylpyrazine": [
     4.02,
     5.743,
     7.896
    ],
    "ethyl_furoate": [
     2.12,
     3.029,
     4.164
    ],
    "furfuryl_alcohol": [
     211.299,
     301.856,
     415.052
    ],
    "phenylacetaldehyde": [
     53.544,
     76.492,
     105.176
    ],
    "methanethiol": [
     0.665,
     0.949,
     1.305
    ],
    "dms": [
     4.176,
     5.966,
     8.203
    ],
    "benzaldehyde": [
     32.256,
     46.08,
     63.36
    ],
    "e_alpha_ionone": [
     0.242,
     0.346,
     0.475
    ],
    "e_beta_ionone": [
     0.235,
     0.335,
     0.461
    ],
    "4vg": [
     0.2835,
     0.405,
     0.5569
    ],
    "4eg": [
     428.75,
     612.5,
     842.188
    ],
    "4ep": [
     176.4,
     252.0,
     346.5
    ],
    "eugenol": [
     20.68,
     29.543,
     40.621
    ],
    "guaiacol": [
     57.75,
     82.5,
     113.438
    ],
    "co2": [
     3280.0,
     4680.0,
     6440.0
    ],
    "so2": [
     3.08,
     4.4,
     6.05
    ],
    "iron": [
     0.0363,
     0.0518,
     0.0713
    ],
    "t2n": [
     0.581,
     0.829,
     1.14
    ]
   },
   "key": [
    "lactic_acid",
    "4ep",
    "4eg",
    "ethanol",
    "isoamyl_acetate",
    "guaiacol",
    "ethyl_octanoate",
    "ethyl_hexanoate",
    "glycerol",
    "diacetyl",
    "eugenol",
    "ethyl_acetate"
   ],
   "fp": {
    "pos": [
     {
      "id": "4ep",
      "d": 1.57
     },
     {
      "id": "4eg",
      "d": 1.37
     },
     {
      "id": "guaiacol",
      "d": 1.31
     },
     {
      "id": "eugenol",
      "d": 1.11
     },
     {
      "id": "octanoic_acid",
      "d": 1.01
     }
    ],
    "neg": [
     {
      "id": "cdbt",
      "d": -0.82
     },
     {
      "id": "z_farnesene",
      "d": -0.82
     },
     {
      "id": "alpha_terpineol",
      "d": -0.8
     },
     {
      "id": "linalool",
      "d": -0.76
     },
     {
      "id": "nerol",
      "d": -0.76
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "stout",
   "cn": "世涛 / 波特",
   "en": "Stout / Porter",
   "group": "dark",
   "alias": "stout porter 世涛 波特 黑啤 帝国世涛",
   "n": null,
   "abv": "5.0–9.0%",
   "desc": "深色麦芽经高温焙烤，咖啡、可可与焦糖交织，苦味厚重、酒体饱满。",
   "src": "表5 #202；表6 模块26 邻接",
   "profile": {
    "bitter": 5.0,
    "hop": 4.0,
    "ester": 3.0,
    "malt": 3.6,
    "roast": 4.8,
    "phenol": 1.4,
    "sour": 1.0,
    "alcohol": 4.0,
    "body": 4.2,
    "sulfur": 0.8,
    "aged": 1.6,
    "floral": 1.0
   },
   "values": {
    "ethanol": [
     48370.0,
     69100.0,
     95010.0
    ],
    "ethyl_acetate": [
     13.8,
     19.7,
     27.1
    ],
    "isoamyl_acetate": [
     2.03,
     2.9,
     3.99
    ],
    "isobutyl_acetate": [
     0.0642,
     0.0918,
     0.1262
    ],
    "ethyl_hexanoate": [
     0.3229,
     0.4612,
     0.6342
    ],
    "ethyl_octanoate": [
     0.6855,
     0.9793,
     1.35
    ],
    "ethyl_decanoate": [
     191.364,
     273.377,
     375.893
    ],
    "phenethyl_acetate": [
     0.2189,
     0.3127,
     0.43
    ],
    "phenethyl_alcohol": [
     6.32,
     9.03,
     12.4
    ],
    "isoamyl_alcohol": [
     62.5,
     89.2,
     123
    ],
    "isobutanol": [
     12.0,
     17.1,
     23.5
    ],
    "mb2": [
     12.0,
     17.1,
     23.5
    ],
    "glycerol": [
     1810.0,
     2580.0,
     3550.0
    ],
    "diacetyl": [
     0.1089,
     0.1555,
     0.2138
    ],
    "acetaldehyde": [
     2.33,
     3.33,
     4.58
    ],
    "ethyl_propionate": [
     29.0,
     41.429,
     56.964
    ],
    "hexyl_acetate": [
     32.76,
     46.8,
     64.35
    ],
    "amyl_acetate": [
     49.778,
     71.111,
     97.778
    ],
    "isopentyl_butanoate": [
     18.48,
     26.4,
     36.3
    ],
    "ethyl_isobutyrate": [
     28.368,
     40.526,
     55.724
    ],
    "octenol": [
     11.28,
     16.114,
     22.157
    ],
    "lactic_acid": [
     338,
     482,
     663
    ],
    "octanoic_acid": [
     3.75,
     5.36,
     7.37
    ],
    "iso_alpha": [
     27.8,
     39.8,
     54.7
    ],
    "linalool": [
     65.032,
     92.903,
     127.742
    ],
    "geraniol": [
     18.659,
     26.656,
     36.652
    ],
    "citronellol": [
     11.771,
     16.816,
     23.121
    ],
    "nerol": [
     12.094,
     17.277,
     23.755
    ],
    "cdbt": [
     277.103,
     395.862,
     544.31
    ],
    "beta_phellandrene": [
     8.162,
     11.66,
     16.032
    ],
    "alpha_terpineol": [
     33.552,
     47.931,
     65.905
    ],
    "terpinen_4_ol": [
     30.302,
     43.289,
     59.522
    ],
    "beta_caryophyllene": [
     42.734,
     61.048,
     83.941
    ],
    "z_farnesene": [
     57.867,
     82.667,
     113.667
    ],
    "farnesol": [
     9.52,
     13.6,
     18.7
    ],
    "nerolidol": [
     14.28,
     20.4,
     28.05
    ],
    "furfural": [
     551.25,
     787.5,
     1082.812
    ],
    "methylpyrazine": [
     35.7,
     51.0,
     70.125
    ],
    "ethyl_furoate": [
     8.627,
     12.324,
     16.945
    ],
    "furfuryl_alcohol": [
     578.936,
     827.052,
     1137.196
    ],
    "phenylacetaldehyde": [
     56.935,
     81.336,
     111.837
    ],
    "methanethiol": [
     5.74,
     8.2,
     11.275
    ],
    "dms": [
     19.32,
     27.6,
     37.95
    ],
    "benzaldehyde": [
     79.296,
     113.28,
     155.76
    ],
    "e_alpha_ionone": [
     0.233,
     0.332,
     0.457
    ],
    "e_beta_ionone": [
     0.45,
     0.642,
     0.883
    ],
    "4vg": [
     0.063,
     0.09,
     0.1238
    ],
    "4eg": [
     150.838,
     215.483,
     296.288
    ],
    "4ep": [
     32.48,
     46.4,
     63.8
    ],
    "eugenol": [
     9.32,
     13.314,
     18.307
    ],
    "guaiacol": [
     24.681,
     35.259,
     48.481
    ],
    "co2": [
     3650.0,
     5210.0,
     7170.0
    ],
    "so2": [
     2.52,
     3.6,
     4.95
    ],
    "iron": [
     0.0464,
     0.0663,
     0.0912
    ],
    "t2n": [
     0.594,
     0.848,
     1.166
    ]
   },
   "key": [
    "methylpyrazine",
    "iso_alpha",
    "furfural",
    "ethanol",
    "glycerol",
    "diacetyl",
    "isoamyl_alcohol",
    "cdbt",
    "ethyl_octanoate",
    "linalool",
    "isobutanol",
    "ethyl_hexanoate"
   ],
   "fp": {
    "pos": [
     {
      "id": "methanethiol",
      "d": 2.2
     },
     {
      "id": "dms",
      "d": 2.2
     },
     {
      "id": "methylpyrazine",
      "d": 2.08
     },
     {
      "id": "furfural",
      "d": 2.0
     },
     {
      "id": "ethyl_furoate",
      "d": 1.42
     }
    ],
    "neg": [
     {
      "id": "phenethyl_alcohol",
      "d": -1.35
     },
     {
      "id": "phenethyl_acetate",
      "d": -0.89
     },
     {
      "id": "e_alpha_ionone",
      "d": -0.79
     },
     {
      "id": "so2",
      "d": -0.67
     },
     {
      "id": "lactic_acid",
      "d": -0.42
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "amber",
   "cn": "琥珀艾尔",
   "en": "Amber",
   "group": "ale",
   "alias": "amber 琥珀",
   "n": null,
   "abv": "4.8–6.0%",
   "desc": "中等色度的艾尔，焦糖麦芽的甜香与温和的苦味取得平衡。",
   "src": "画像形状相关最低 0.456",
   "profile": {
    "bitter": 3.8,
    "hop": 3.0,
    "ester": 3.0,
    "malt": 4.0,
    "roast": 1.8,
    "phenol": 0.6,
    "sour": 0.8,
    "alcohol": 3.2,
    "body": 3.2,
    "sulfur": 0.6,
    "aged": 1.0,
    "floral": 2.2
   },
   "values": {
    "ethanol": [
     40750.0,
     53610.0,
     69700.0
    ],
    "ethyl_acetate": [
     16.4,
     21.6,
     28.1
    ],
    "isoamyl_acetate": [
     2.34,
     3.08,
     4.01
    ],
    "isobutyl_acetate": [
     0.0826,
     0.1087,
     0.1413
    ],
    "ethyl_hexanoate": [
     0.3563,
     0.4688,
     0.6094
    ],
    "ethyl_octanoate": [
     0.6941,
     0.9132,
     1.19
    ],
    "ethyl_decanoate": [
     192.961,
     253.896,
     330.065
    ],
    "phenethyl_acetate": [
     0.3788,
     0.4984,
     0.6479
    ],
    "phenethyl_alcohol": [
     16.3,
     21.4,
     27.8
    ],
    "isoamyl_alcohol": [
     52.9,
     69.5,
     90.4
    ],
    "isobutanol": [
     9.85,
     13.0,
     16.8
    ],
    "mb2": [
     9.85,
     13.0,
     16.8
    ],
    "glycerol": [
     1560.0,
     2050.0,
     2670.0
    ],
    "diacetyl": [
     0.1165,
     0.1533,
     0.1993
    ],
    "acetaldehyde": [
     1.84,
     2.42,
     3.14
    ],
    "ethyl_propionate": [
     35.394,
     46.571,
     60.543
    ],
    "hexyl_acetate": [
     41.587,
     54.72,
     71.136
    ],
    "amyl_acetate": [
     58.098,
     76.444,
     99.378
    ],
    "isopentyl_butanoate": [
     21.706,
     28.56,
     37.128
    ],
    "ethyl_isobutyrate": [
     35.12,
     46.211,
     60.074
    ],
    "octenol": [
     11.378,
     14.971,
     19.463
    ],
    "lactic_acid": [
     254,
     335,
     435
    ],
    "octanoic_acid": [
     2.59,
     3.41,
     4.44
    ],
    "iso_alpha": [
     26.3,
     34.6,
     45.0
    ],
    "linalool": [
     61.692,
     81.174,
     105.526
    ],
    "geraniol": [
     19.69,
     25.908,
     33.681
    ],
    "citronellol": [
     12.933,
     17.017,
     22.123
    ],
    "nerol": [
     13.027,
     17.14,
     22.283
    ],
    "cdbt": [
     246.921,
     324.897,
     422.366
    ],
    "beta_phellandrene": [
     5.958,
     7.84,
     10.192
    ],
    "alpha_terpineol": [
     33.527,
     44.115,
     57.349
    ],
    "terpinen_4_ol": [
     21.483,
     28.267,
     36.747
    ],
    "beta_caryophyllene": [
     29.498,
     38.814,
     50.458
    ],
    "z_farnesene": [
     54.855,
     72.178,
     93.831
    ],
    "farnesol": [
     12.282,
     16.16,
     21.008
    ],
    "nerolidol": [
     18.422,
     24.24,
     31.512
    ],
    "furfural": [
     151.553,
     199.412,
     259.235
    ],
    "methylpyrazine": [
     11.009,
     14.486,
     18.831
    ],
    "ethyl_furoate": [
     3.026,
     3.981,
     5.175
    ],
    "furfuryl_alcohol": [
     211.86,
     278.763,
     362.392
    ],
    "phenylacetaldehyde": [
     80.289,
     105.644,
     137.337
    ],
    "methanethiol": [
     0.511,
     0.672,
     0.874
    ],
    "dms": [
     2.449,
     3.223,
     4.19
    ],
    "benzaldehyde": [
     65.502,
     86.187,
     112.043
    ],
    "e_alpha_ionone": [
     0.422,
     0.555,
     0.722
    ],
    "e_beta_ionone": [
     0.368,
     0.485,
     0.63
    ],
    "4vg": [
     0.0,
     0.036,
     0.0756
    ],
    "4eg": [
     42.486,
     55.902,
     72.673
    ],
    "4ep": [
     0.0,
     11.2,
     23.52
    ],
    "eugenol": [
     3.865,
     5.086,
     6.611
    ],
    "guaiacol": [
     6.92,
     9.105,
     11.836
    ],
    "co2": [
     3000.0,
     3950.0,
     5130.0
    ],
    "so2": [
     3.34,
     4.4,
     5.72
    ],
    "iron": [
     0.0319,
     0.042,
     0.0546
    ],
    "t2n": [
     0.264,
     0.347,
     0.451
    ]
   },
   "key": [
    "iso_alpha",
    "diacetyl",
    "ethanol",
    "glycerol",
    "isoamyl_acetate",
    "ethyl_hexanoate",
    "ethyl_octanoate",
    "isoamyl_alcohol",
    "linalool",
    "cdbt",
    "ethyl_acetate",
    "isobutyl_acetate"
   ],
   "fp": {
    "pos": [
     {
      "id": "phenylacetaldehyde",
      "d": 0.85
     },
     {
      "id": "e_alpha_ionone",
      "d": 0.82
     },
     {
      "id": "benzaldehyde",
      "d": 0.81
     },
     {
      "id": "diacetyl",
      "d": 0.79
     },
     {
      "id": "iso_alpha",
      "d": 0.76
     }
    ],
    "neg": [
     {
      "id": "acetaldehyde",
      "d": -0.95
     },
     {
      "id": "lactic_acid",
      "d": -0.91
     },
     {
      "id": "4vg",
      "d": -0.87
     },
     {
      "id": "octanoic_acid",
      "d": -0.76
     },
     {
      "id": "4ep",
      "d": -0.74
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "scotch",
   "cn": "苏格兰艾尔",
   "en": "Scotch",
   "group": "dark",
   "alias": "scotch 苏格兰 烈性",
   "n": null,
   "abv": "6.0–9.0%",
   "desc": "长时间煮麦汁带来焦糖化，麦芽甜厚、酒精温暖，泥煤与烟熏若有若无。",
   "src": "表13 邻接 Christmas 6.14",
   "profile": {
    "bitter": 3.0,
    "hop": 2.0,
    "ester": 2.4,
    "malt": 4.6,
    "roast": 3.6,
    "phenol": 1.0,
    "sour": 0.8,
    "alcohol": 4.4,
    "body": 4.2,
    "sulfur": 0.8,
    "aged": 2.2,
    "floral": 1.4
   },
   "values": {
    "ethanol": [
     47600.0,
     68000.0,
     93500.0
    ],
    "ethyl_acetate": [
     11.8,
     16.8,
     23.1
    ],
    "isoamyl_acetate": [
     1.6,
     2.28,
     3.14
    ],
    "isobutyl_acetate": [
     0.054,
     0.0771,
     0.106
    ],
    "ethyl_hexanoate": [
     0.2683,
     0.3832,
     0.527
    ],
    "ethyl_octanoate": [
     0.5621,
     0.803,
     1.1
    ],
    "ethyl_decanoate": [
     157.545,
     225.065,
     309.464
    ],
    "phenethyl_acetate": [
     0.2419,
     0.3456,
     0.4752
    ],
    "phenethyl_alcohol": [
     10.0,
     14.3,
     19.7
    ],
    "isoamyl_alcohol": [
     65.3,
     93.3,
     128
    ],
    "isobutanol": [
     12.9,
     18.4,
     25.4
    ],
    "mb2": [
     12.9,
     18.4,
     25.3
    ],
    "glycerol": [
     1900.0,
     2720.0,
     3740.0
    ],
    "diacetyl": [
     0.1301,
     0.1859,
     0.2556
    ],
    "acetaldehyde": [
     2.6,
     3.72,
     5.11
    ],
    "ethyl_propionate": [
     23.6,
     33.714,
     46.357
    ],
    "hexyl_acetate": [
     27.3,
     39.0,
     53.625
    ],
    "amyl_acetate": [
     39.449,
     56.356,
     77.489
    ],
    "isopentyl_butanoate": [
     14.7,
     21.0,
     28.875
    ],
    "ethyl_isobutyrate": [
     23.284,
     33.263,
     45.737
    ],
    "octenol": [
     15.664,
     22.377,
     30.769
    ],
    "lactic_acid": [
     300,
     429,
     590
    ],
    "octanoic_acid": [
     3.35,
     4.79,
     6.59
    ],
    "iso_alpha": [
     19.2,
     27.4,
     37.7
    ],
    "linalool": [
     33.166,
     47.381,
     65.148
    ],
    "geraniol": [
     10.452,
     14.931,
     20.53
    ],
    "citronellol": [
     6.834,
     9.763,
     13.424
    ],
    "nerol": [
     6.899,
     9.855,
     13.551
    ],
    "cdbt": [
     133.821,
     191.172,
     262.862
    ],
    "beta_phellandrene": [
     3.57,
     5.1,
     7.012
    ],
    "alpha_terpineol": [
     17.91,
     25.586,
     35.181
    ],
    "terpinen_4_ol": [
     13.378,
     19.111,
     26.278
    ],
    "beta_caryophyllene": [
     19.021,
     27.172,
     37.362
    ],
    "z_farnesene": [
     29.493,
     42.133,
     57.933
    ],
    "farnesol": [
     6.384,
     9.12,
     12.54
    ],
    "nerolidol": [
     9.576,
     13.68,
     18.81
    ],
    "furfural": [
     465.5,
     665.0,
     914.375
    ],
    "methylpyrazine": [
     28.7,
     41.0,
     56.375
    ],
    "ethyl_furoate": [
     7.187,
     10.267,
     14.117
    ],
    "furfuryl_alcohol": [
     526.285,
     751.835,
     1033.773
    ],
    "phenylacetaldehyde": [
     80.054,
     114.363,
     157.25
    ],
    "methanethiol": [
     1.172,
     1.675,
     2.303
    ],
    "dms": [
     5.712,
     8.16,
     11.22
    ],
    "benzaldehyde": [
     83.627,
     119.467,
     164.267
    ],
    "e_alpha_ionone": [
     0.334,
     0.477,
     0.656
    ],
    "e_beta_ionone": [
     0.436,
     0.623,
     0.857
    ],
    "4vg": [
     0.126,
     0.18,
     0.2475
    ],
    "4eg": [
     119.862,
     171.231,
     235.442
    ],
    "4ep": [
     30.24,
     43.2,
     59.4
    ],
    "eugenol": [
     7.08,
     10.114,
     13.907
    ],
    "guaiacol": [
     18.494,
     26.42,
     36.327
    ],
    "co2": [
     2710.0,
     3870.0,
     5320.0
    ],
    "so2": [
     2.8,
     4.0,
     5.5
    ],
    "iron": [
     0.0494,
     0.0706,
     0.0971
    ],
    "t2n": [
     0.772,
     1.102,
     1.516
    ]
   },
   "key": [
    "methylpyrazine",
    "ethanol",
    "diacetyl",
    "glycerol",
    "furfural",
    "isoamyl_alcohol",
    "isobutanol",
    "iso_alpha",
    "mb2",
    "benzaldehyde",
    "ethyl_octanoate",
    "ethyl_hexanoate"
   ],
   "fp": {
    "pos": [
     {
      "id": "methylpyrazine",
      "d": 1.83
     },
     {
      "id": "furfural",
      "d": 1.78
     },
     {
      "id": "octenol",
      "d": 1.55
     },
     {
      "id": "benzaldehyde",
      "d": 1.54
     },
     {
      "id": "diacetyl",
      "d": 1.29
     }
    ],
    "neg": [
     {
      "id": "isoamyl_acetate",
      "d": -0.93
     },
     {
      "id": "ethyl_propionate",
      "d": -0.93
     },
     {
      "id": "amyl_acetate",
      "d": -0.93
     },
     {
      "id": "isopentyl_butanoate",
      "d": -0.93
     },
     {
      "id": "hexyl_acetate",
      "d": -0.92
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "flanders",
   "cn": "佛兰德老棕",
   "en": "Flanders old brown",
   "group": "sour",
   "alias": "flanders 佛兰德 老棕 酸啤",
   "n": null,
   "abv": "5.0–7.0%",
   "desc": "棕色基酒经乳酸菌与酵母长期作用，酸、甜、木桶三者在口中拉锯。",
   "src": "表13 邻接",
   "profile": {
    "bitter": 2.2,
    "hop": 1.6,
    "ester": 2.6,
    "malt": 3.6,
    "roast": 2.6,
    "phenol": 2.2,
    "sour": 4.4,
    "alcohol": 3.2,
    "body": 3.4,
    "sulfur": 1.0,
    "aged": 3.0,
    "floral": 1.4
   },
   "values": {
    "ethanol": [
     37710.0,
     53870.0,
     74070.0
    ],
    "ethyl_acetate": [
     13.3,
     19.0,
     26.1
    ],
    "isoamyl_acetate": [
     1.76,
     2.51,
     3.45
    ],
    "isobutyl_acetate": [
     0.0587,
     0.0839,
     0.1153
    ],
    "ethyl_hexanoate": [
     0.2777,
     0.3968,
     0.5455
    ],
    "ethyl_octanoate": [
     0.5662,
     0.8089,
     1.11
    ],
    "ethyl_decanoate": [
     157.909,
     225.584,
     310.179
    ],
    "phenethyl_acetate": [
     0.24,
     0.3428,
     0.4714
    ],
    "phenethyl_alcohol": [
     9.09,
     13.0,
     17.8
    ],
    "isoamyl_alcohol": [
     48.8,
     69.8,
     95.9
    ],
    "isobutanol": [
     9.26,
     13.2,
     18.2
    ],
    "mb2": [
     9.29,
     13.3,
     18.2
    ],
    "glycerol": [
     1480.0,
     2120.0,
     2910.0
    ],
    "diacetyl": [
     0.1008,
     0.144,
     0.198
    ],
    "acetaldehyde": [
     4.36,
     6.23,
     8.57
    ],
    "ethyl_propionate": [
     25.8,
     36.857,
     50.679
    ],
    "hexyl_acetate": [
     29.736,
     42.48,
     58.41
    ],
    "amyl_acetate": [
     43.307,
     61.867,
     85.067
    ],
    "isopentyl_butanoate": [
     16.128,
     23.04,
     31.68
    ],
    "ethyl_isobutyrate": [
     25.421,
     36.316,
     49.934
    ],
    "octenol": [
     15.536,
     22.194,
     30.517
    ],
    "lactic_acid": [
     1230.0,
     1760.0,
     2410.0
    ],
    "octanoic_acid": [
     6.84,
     9.77,
     13.4
    ],
    "iso_alpha": [
     13.5,
     19.3,
     26.5
    ],
    "linalool": [
     26.175,
     37.394,
     51.416
    ],
    "geraniol": [
     8.524,
     12.177,
     16.743
    ],
    "citronellol": [
     5.638,
     8.054,
     11.075
    ],
    "nerol": [
     5.66,
     8.085,
     11.117
    ],
    "cdbt": [
     103.407,
     147.724,
     203.121
    ],
    "beta_phellandrene": [
     3.458,
     4.94,
     6.793
    ],
    "alpha_terpineol": [
     14.37,
     20.529,
     28.227
    ],
    "terpinen_4_ol": [
     14.373,
     20.533,
     28.233
    ],
    "beta_caryophyllene": [
     22.188,
     31.697,
     43.583
    ],
    "z_farnesene": [
     23.271,
     33.244,
     45.711
    ],
    "farnesol": [
     5.488,
     7.84,
     10.78
    ],
    "nerolidol": [
     8.232,
     11.76,
     16.17
    ],
    "furfural": [
     237.753,
     339.647,
     467.015
    ],
    "methylpyrazine": [
     13.06,
     18.657,
     25.654
    ],
    "ethyl_furoate": [
     6.307,
     9.01,
     12.388
    ],
    "furfuryl_alcohol": [
     518.433,
     740.619,
     1018.351
    ],
    "phenylacetaldehyde": [
     71.608,
     102.297,
     140.659
    ],
    "methanethiol": [
     1.038,
     1.483,
     2.039
    ],
    "dms": [
     5.472,
     7.817,
     10.749
    ],
    "benzaldehyde": [
     61.227,
     87.467,
     120.267
    ],
    "e_alpha_ionone": [
     0.277,
     0.396,
     0.544
    ],
    "e_beta_ionone": [
     0.397,
     0.568,
     0.781
    ],
    "4vg": [
     0.4284,
     0.612,
     0.8415
    ],
    "4eg": [
     190.997,
     272.853,
     375.173
    ],
    "4ep": [
     66.08,
     94.4,
     129.8
    ],
    "eugenol": [
     15.4,
     22.0,
     30.25
    ],
    "guaiacol": [
     26.894,
     38.42,
     52.827
    ],
    "co2": [
     3990.0,
     5710.0,
     7850.0
    ],
    "so2": [
     2.91,
     4.16,
     5.72
    ],
    "iron": [
     0.0554,
     0.0791,
     0.1088
    ],
    "t2n": [
     1.034,
     1.476,
     2.03
    ]
   },
   "key": [
    "lactic_acid",
    "glycerol",
    "ethanol",
    "diacetyl",
    "co2",
    "isoamyl_alcohol",
    "octanoic_acid",
    "furfural",
    "methylpyrazine",
    "acetaldehyde",
    "t2n",
    "ethyl_octanoate"
   ],
   "fp": {
    "pos": [
     {
      "id": "acetaldehyde",
      "d": 1.6
     },
     {
      "id": "octenol",
      "d": 1.52
     },
     {
      "id": "iron",
      "d": 1.45
     },
     {
      "id": "lactic_acid",
      "d": 1.32
     },
     {
      "id": "t2n",
      "d": 1.32
     }
    ],
    "neg": [
     {
      "id": "z_farnesene",
      "d": -1.23
     },
     {
      "id": "alpha_terpineol",
      "d": -1.22
     },
     {
      "id": "cdbt",
      "d": -1.19
     },
     {
      "id": "nerol",
      "d": -1.18
     },
     {
      "id": "linalool",
      "d": -1.13
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "brown",
   "cn": "棕色艾尔",
   "en": "Brown",
   "group": "ale",
   "alias": "brown 棕色",
   "n": null,
   "abv": "4.5–6.5%",
   "desc": "坚果与焦糖的棕色艾尔，苦味克制，麦芽风味占主导。",
   "src": "表13 邻接 4.78",
   "profile": {
    "bitter": 3.0,
    "hop": 2.2,
    "ester": 2.8,
    "malt": 4.0,
    "roast": 2.6,
    "phenol": 0.8,
    "sour": 0.8,
    "alcohol": 3.2,
    "body": 3.4,
    "sulfur": 0.6,
    "aged": 1.2,
    "floral": 1.6
   },
   "values": {
    "ethanol": [
     41240.0,
     54260.0,
     70540.0
    ],
    "ethyl_acetate": [
     14.6,
     19.1,
     24.9
    ],
    "isoamyl_acetate": [
     2.1,
     2.77,
     3.6
    ],
    "isobutyl_acetate": [
     0.071,
     0.0935,
     0.1215
    ],
    "ethyl_hexanoate": [
     0.3317,
     0.4365,
     0.5675
    ],
    "ethyl_octanoate": [
     0.6594,
     0.8677,
     1.13
    ],
    "ethyl_decanoate": [
     183.683,
     241.688,
     314.195
    ],
    "phenethyl_acetate": [
     0.2997,
     0.3943,
     0.5126
    ],
    "phenethyl_alcohol": [
     11.8,
     15.5,
     20.1
    ],
    "isoamyl_alcohol": [
     53.5,
     70.4,
     91.5
    ],
    "isobutanol": [
     10.1,
     13.2,
     17.2
    ],
    "mb2": [
     10.1,
     13.3,
     17.3
    ],
    "glycerol": [
     1650.0,
     2170.0,
     2820.0
    ],
    "diacetyl": [
     0.1187,
     0.1562,
     0.203
    ],
    "acetaldehyde": [
     1.95,
     2.57,
     3.34
    ],
    "ethyl_propionate": [
     31.051,
     40.857,
     53.114
    ],
    "hexyl_acetate": [
     35.933,
     47.28,
     61.464
    ],
    "amyl_acetate": [
     51.883,
     68.267,
     88.747
    ],
    "isopentyl_butanoate": [
     19.334,
     25.44,
     33.072
    ],
    "ethyl_isobutyrate": [
     30.64,
     40.316,
     52.411
    ],
    "octenol": [
     12.038,
     15.84,
     20.592
    ],
    "lactic_acid": [
     269,
     354,
     460
    ],
    "octanoic_acid": [
     2.87,
     3.78,
     4.91
    ],
    "iso_alpha": [
     20.4,
     26.9,
     34.9
    ],
    "linalool": [
     41.481,
     54.581,
     70.955
    ],
    "geraniol": [
     13.172,
     17.331,
     22.53
    ],
    "citronellol": [
     8.636,
     11.363,
     14.772
    ],
    "nerol": [
     8.706,
     11.455,
     14.892
    ],
    "cdbt": [
     166.571,
     219.172,
     284.924
    ],
    "beta_phellandrene": [
     4.21,
     5.54,
     7.202
    ],
    "alpha_terpineol": [
     22.486,
     29.586,
     38.462
    ],
    "terpinen_4_ol": [
     15.47,
     20.356,
     26.462
    ],
    "beta_caryophyllene": [
     21.615,
     28.441,
     36.974
    ],
    "z_farnesene": [
     36.885,
     48.533,
     63.093
    ],
    "farnesol": [
     8.147,
     10.72,
     13.936
    ],
    "nerolidol": [
     12.221,
     16.08,
     20.904
    ],
    "furfural": [
     198.405,
     261.059,
     339.376
    ],
    "methylpyrazine": [
     14.744,
     19.4,
     25.22
    ],
    "ethyl_furoate": [
     4.763,
     6.267,
     8.147
    ],
    "furfuryl_alcohol": [
     328.195,
     431.835,
     561.386
    ],
    "phenylacetaldehyde": [
     73.328,
     96.484,
     125.43
    ],
    "methanethiol": [
     0.77,
     1.013,
     1.317
    ],
    "dms": [
     3.596,
     4.731,
     6.151
    ],
    "benzaldehyde": [
     72.636,
     95.573,
     124.245
    ],
    "e_alpha_ionone": [
     0.35,
     0.46,
     0.598
    ],
    "e_beta_ionone": [
     0.364,
     0.479,
     0.623
    ],
    "4vg": [
     0.0821,
     0.108,
     0.1404
    ],
    "4eg": [
     74.926,
     98.587,
     128.164
    ],
    "4ep": [
     15.808,
     20.8,
     27.04
    ],
    "eugenol": [
     5.515,
     7.257,
     9.434
    ],
    "guaiacol": [
     12.192,
     16.042,
     20.855
    ],
    "co2": [
     2700.0,
     3550.0,
     4610.0
    ],
    "so2": [
     3.34,
     4.4,
     5.72
    ],
    "iron": [
     0.0336,
     0.0442,
     0.0574
    ],
    "t2n": [
     0.382,
     0.502,
     0.653
    ]
   },
   "key": [
    "diacetyl",
    "glycerol",
    "ethanol",
    "iso_alpha",
    "methylpyrazine",
    "isoamyl_alcohol",
    "ethyl_octanoate",
    "ethyl_hexanoate",
    "isoamyl_acetate",
    "isobutanol",
    "ethyl_acetate",
    "ethyl_decanoate"
   ],
   "fp": {
    "pos": [
     {
      "id": "benzaldehyde",
      "d": 1.04
     },
     {
      "id": "methylpyrazine",
      "d": 0.97
     },
     {
      "id": "diacetyl",
      "d": 0.84
     },
     {
      "id": "ethyl_furoate",
      "d": 0.84
     },
     {
      "id": "glycerol",
      "d": 0.6
     }
    ],
    "neg": [
     {
      "id": "lactic_acid",
      "d": -0.83
     },
     {
      "id": "co2",
      "d": -0.8
     },
     {
      "id": "acetaldehyde",
      "d": -0.79
     },
     {
      "id": "beta_caryophyllene",
      "d": -0.72
     },
     {
      "id": "terpinen_4_ol",
      "d": -0.67
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "saison",
   "cn": "赛松",
   "en": "Saison",
   "group": "ale",
   "alias": "saison 赛松 农舍",
   "n": null,
   "abv": "5.0–8.0%",
   "desc": "高温发酵的农舍艾尔，酵母酚香辛锐，酒体干爽，苦味收得利落。",
   "src": "图18 可辨识性",
   "profile": {
    "bitter": 4.2,
    "hop": 3.6,
    "ester": 3.4,
    "malt": 2.4,
    "roast": 0.8,
    "phenol": 2.4,
    "sour": 2.4,
    "alcohol": 3.8,
    "body": 2.2,
    "sulfur": 0.8,
    "aged": 1.0,
    "floral": 2.4
   },
   "values": {
    "ethanol": [
     43300.0,
     56970.0,
     74060.0
    ],
    "ethyl_acetate": [
     18.9,
     24.8,
     32.3
    ],
    "isoamyl_acetate": [
     2.71,
     3.56,
     4.63
    ],
    "isobutyl_acetate": [
     0.0951,
     0.1251,
     0.1626
    ],
    "ethyl_hexanoate": [
     0.3825,
     0.5032,
     0.6542
    ],
    "ethyl_octanoate": [
     0.7331,
     0.9647,
     1.25
    ],
    "ethyl_decanoate": [
     202.634,
     266.623,
     346.61
    ],
    "phenethyl_acetate": [
     0.4025,
     0.5296,
     0.6884
    ],
    "phenethyl_alcohol": [
     16.2,
     21.3,
     27.7
    ],
    "isoamyl_alcohol": [
     54.9,
     72.2,
     93.9
    ],
    "isobutanol": [
     10.4,
     13.6,
     17.7
    ],
    "mb2": [
     10.2,
     13.4,
     17.4
    ],
    "glycerol": [
     951,
     1250.0,
     1630.0
    ],
    "diacetyl": [
     0.0686,
     0.0902,
     0.1173
    ],
    "acetaldehyde": [
     2.46,
     3.24,
     4.21
    ],
    "ethyl_propionate": [
     40.823,
     53.714,
     69.829
    ],
    "hexyl_acetate": [
     47.88,
     63.0,
     81.9
    ],
    "amyl_acetate": [
     67.15,
     88.356,
     114.862
    ],
    "isopentyl_butanoate": [
     25.08,
     33.0,
     42.9
    ],
    "ethyl_isobutyrate": [
     40.48,
     53.263,
     69.242
    ],
    "octenol": [
     6.931,
     9.12,
     11.856
    ],
    "lactic_acid": [
     505,
     665,
     865
    ],
    "octanoic_acid": [
     4.46,
     5.86,
     7.62
    ],
    "iso_alpha": [
     28.8,
     37.8,
     49.2
    ],
    "linalool": [
     74.755,
     98.361,
     127.87
    ],
    "geraniol": [
     23.607,
     31.062,
     40.381
    ],
    "citronellol": [
     15.448,
     20.326,
     26.424
    ],
    "nerol": [
     15.588,
     20.511,
     26.664
    ],
    "cdbt": [
     301.222,
     396.345,
     515.248
    ],
    "beta_phellandrene": [
     8.603,
     11.32,
     14.716
    ],
    "alpha_terpineol": [
     40.411,
     53.172,
     69.124
    ],
    "terpinen_4_ol": [
     33.237,
     43.733,
     56.853
    ],
    "beta_caryophyllene": [
     48.493,
     63.807,
     82.949
    ],
    "z_farnesene": [
     66.475,
     87.467,
     113.707
    ],
    "farnesol": [
     14.47,
     19.04,
     24.752
    ],
    "nerolidol": [
     21.706,
     28.56,
     37.128
    ],
    "furfural": [
     70.904,
     93.294,
     121.282
    ],
    "methylpyrazine": [
     4.082,
     5.371,
     6.983
    ],
    "ethyl_furoate": [
     1.144,
     1.505,
     1.956
    ],
    "furfuryl_alcohol": [
     99.035,
     130.309,
     169.402
    ],
    "phenylacetaldehyde": [
     59.004,
     77.637,
     100.928
    ],
    "methanethiol": [
     0.365,
     0.48,
     0.624
    ],
    "dms": [
     2.189,
     2.88,
     3.744
    ],
    "benzaldehyde": [
     31.94,
     42.027,
     54.635
    ],
    "e_alpha_ionone": [
     0.347,
     0.456,
     0.593
    ],
    "e_beta_ionone": [
     0.311,
     0.41,
     0.533
    ],
    "4vg": [
     0.8892,
     1.17,
     1.52
    ],
    "4eg": [
     139.064,
     182.979,
     237.873
    ],
    "4ep": [
     52.288,
     68.8,
     89.44
    ],
    "eugenol": [
     17.328,
     22.8,
     29.64
    ],
    "guaiacol": [
     19.654,
     25.86,
     33.618
    ],
    "co2": [
     3770.0,
     4960.0,
     6450.0
    ],
    "so2": [
     3.04,
     4.0,
     5.2
    ],
    "iron": [
     0.0284,
     0.0373,
     0.0485
    ],
    "t2n": [
     0.219,
     0.288,
     0.375
    ]
   },
   "key": [
    "iso_alpha",
    "ethanol",
    "isoamyl_acetate",
    "linalool",
    "cdbt",
    "4vg",
    "ethyl_hexanoate",
    "ethyl_octanoate",
    "ethyl_acetate",
    "isoamyl_alcohol",
    "isobutyl_acetate",
    "geraniol"
   ],
   "fp": {
    "pos": [
     {
      "id": "terpinen_4_ol",
      "d": 1.31
     },
     {
      "id": "beta_phellandrene",
      "d": 1.24
     },
     {
      "id": "beta_caryophyllene",
      "d": 1.18
     },
     {
      "id": "4vg",
      "d": 1.17
     },
     {
      "id": "z_farnesene",
      "d": 1.02
     }
    ],
    "neg": [
     {
      "id": "octenol",
      "d": -1.14
     },
     {
      "id": "glycerol",
      "d": -1.01
     },
     {
      "id": "furfural",
      "d": -0.79
     },
     {
      "id": "benzaldehyde",
      "d": -0.79
     },
     {
      "id": "diacetyl",
      "d": -0.58
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "blond",
   "cn": "金色艾尔",
   "en": "Blond",
   "group": "ale",
   "alias": "blond 金色 金啤",
   "n": 31,
   "abv": "6.0–7.5%",
   "desc": "浅色高发酵度艾尔，果香清亮，苦味中等，收口干净并带一点酒精暖意。",
   "src": "表5 #30；表13 邻接 Tripel 5.01",
   "profile": {
    "bitter": 4.0,
    "hop": 3.2,
    "ester": 3.4,
    "malt": 2.8,
    "roast": 0.6,
    "phenol": 0.6,
    "sour": 1.0,
    "alcohol": 3.8,
    "body": 3.0,
    "sulfur": 0.6,
    "aged": 0.8,
    "floral": 2.6
   },
   "values": {
    "ethanol": [
     46430.0,
     61100.0,
     79430.0
    ],
    "ethyl_acetate": [
     19.0,
     25.0,
     32.5
    ],
    "isoamyl_acetate": [
     2.73,
     3.59,
     4.67
    ],
    "isobutyl_acetate": [
     0.0972,
     0.1279,
     0.1663
    ],
    "ethyl_hexanoate": [
     0.3882,
     0.5108,
     0.664
    ],
    "ethyl_octanoate": [
     0.7733,
     1.02,
     1.32
    ],
    "ethyl_decanoate": [
     214.478,
     282.208,
     366.87
    ],
    "phenethyl_acetate": [
     0.4304,
     0.5664,
     0.7363
    ],
    "phenethyl_alcohol": [
     18.1,
     23.8,
     30.9
    ],
    "isoamyl_alcohol": [
     59.6,
     78.4,
     102
    ],
    "isobutanol": [
     11.2,
     14.7,
     19.2
    ],
    "mb2": [
     11.1,
     14.6,
     19.0
    ],
    "glycerol": [
     1350.0,
     1770.0,
     2300.0
    ],
    "diacetyl": [
     0.0866,
     0.1139,
     0.1481
    ],
    "acetaldehyde": [
     1.87,
     2.46,
     3.2
    ],
    "ethyl_propionate": [
     41.474,
     54.571,
     70.943
    ],
    "hexyl_acetate": [
     48.883,
     64.32,
     83.616
    ],
    "amyl_acetate": [
     67.826,
     89.244,
     116.018
    ],
    "isopentyl_butanoate": [
     25.354,
     33.36,
     43.368
    ],
    "ethyl_isobutyrate": [
     41.2,
     54.211,
     70.474
    ],
    "octenol": [
     7.383,
     9.714,
     12.629
    ],
    "lactic_acid": [
     280,
     369,
     480
    ],
    "octanoic_acid": [
     2.64,
     3.47,
     4.51
    ],
    "iso_alpha": [
     22.3,
     29.4,
     38.2
    ],
    "linalool": [
     68.841,
     90.581,
     117.755
    ],
    "geraniol": [
     22.292,
     29.331,
     38.13
    ],
    "citronellol": [
     14.716,
     19.363,
     25.172
    ],
    "nerol": [
     14.786,
     19.455,
     25.292
    ],
    "cdbt": [
     272.971,
     359.172,
     466.924
    ],
    "beta_phellandrene": [
     6.43,
     8.46,
     10.998
    ],
    "alpha_terpineol": [
     37.686,
     49.586,
     64.462
    ],
    "terpinen_4_ol": [
     23.172,
     30.489,
     39.636
    ],
    "beta_caryophyllene": [
     31.805,
     41.848,
     54.403
    ],
    "z_farnesene": [
     61.205,
     80.533,
     104.693
    ],
    "farnesol": [
     14.227,
     18.72,
     24.336
    ],
    "nerolidol": [
     21.341,
     28.08,
     36.504
    ],
    "furfural": [
     61.426,
     80.824,
     105.071
    ],
    "methylpyrazine": [
     3.713,
     4.886,
     6.351
    ],
    "ethyl_furoate": [
     0.0,
     0.705,
     1.48
    ],
    "furfuryl_alcohol": [
     0.0,
     66.309,
     139.249
    ],
    "phenylacetaldehyde": [
     66.367,
     87.325,
     113.522
    ],
    "methanethiol": [
     0.0,
     0.16,
     0.336
    ],
    "dms": [
     0.0,
     0.96,
     2.016
    ],
    "benzaldehyde": [
     36.318,
     47.787,
     62.123
    ],
    "e_alpha_ionone": [
     0.395,
     0.52,
     0.676
    ],
    "e_beta_ionone": [
     0.311,
     0.41,
     0.533
    ],
    "4vg": [
     0.0,
     0.036,
     0.0756
    ],
    "4eg": [
     0.0,
     20.266,
     42.558
    ],
    "4ep": [
     0.0,
     8.0,
     16.8
    ],
    "eugenol": [
     2.823,
     3.714,
     4.829
    ],
    "guaiacol": [
     0.0,
     2.615,
     5.492
    ],
    "co2": [
     3140.0,
     4130.0,
     5370.0
    ],
    "so2": [
     3.16,
     4.16,
     5.41
    ],
    "iron": [
     0.0284,
     0.0373,
     0.0485
    ],
    "t2n": [
     0.128,
     0.168,
     0.219
    ]
   },
   "key": [
    "ethanol",
    "iso_alpha",
    "isoamyl_acetate",
    "ethyl_octanoate",
    "ethyl_hexanoate",
    "isoamyl_alcohol",
    "linalool",
    "ethyl_acetate",
    "cdbt",
    "glycerol",
    "isobutyl_acetate",
    "diacetyl"
   ],
   "fp": {
    "pos": [
     {
      "id": "farnesol",
      "d": 0.91
     },
     {
      "id": "nerolidol",
      "d": 0.91
     },
     {
      "id": "nerol",
      "d": 0.88
     },
     {
      "id": "phenethyl_alcohol",
      "d": 0.86
     },
     {
      "id": "alpha_terpineol",
      "d": 0.85
     }
    ],
    "neg": [
     {
      "id": "dms",
      "d": -1.84
     },
     {
      "id": "methanethiol",
      "d": -1.29
     },
     {
      "id": "furfuryl_alcohol",
      "d": -1.11
     },
     {
      "id": "t2n",
      "d": -1.1
     },
     {
      "id": "4eg",
      "d": -1.05
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "strong",
   "cn": "烈性艾尔",
   "en": "Strong ale",
   "group": "ale",
   "alias": "strong ale 烈性 大麦酒",
   "n": null,
   "abv": "7.0–11.0%",
   "desc": "高浓度麦汁发酵，酯香与酒精同时上扬，酒体厚实，余味悠长。",
   "src": "表5 #170；表27 乙酸乙酯最高",
   "profile": {
    "bitter": 3.8,
    "hop": 3.4,
    "ester": 3.8,
    "malt": 4.0,
    "roast": 1.6,
    "phenol": 1.2,
    "sour": 1.0,
    "alcohol": 4.8,
    "body": 4.2,
    "sulfur": 0.6,
    "aged": 1.4,
    "floral": 2.6
   },
   "values": {
    "ethanol": [
     55480.0,
     73000.0,
     94900.0
    ],
    "ethyl_acetate": [
     21.6,
     28.4,
     36.9
    ],
    "isoamyl_acetate": [
     3.08,
     4.05,
     5.26
    ],
    "isobutyl_acetate": [
     0.1075,
     0.1415,
     0.1839
    ],
    "ethyl_hexanoate": [
     0.4543,
     0.5977,
     0.7771
    ],
    "ethyl_octanoate": [
     0.923,
     1.21,
     1.58
    ],
    "ethyl_decanoate": [
     256.722,
     337.792,
     439.13
    ],
    "phenethyl_acetate": [
     0.4688,
     0.6168,
     0.8019
    ],
    "phenethyl_alcohol": [
     19.3,
     25.4,
     33.0
    ],
    "isoamyl_alcohol": [
     79.0,
     104,
     135
    ],
    "isobutanol": [
     15.1,
     19.8,
     25.8
    ],
    "mb2": [
     15.0,
     19.7,
     25.6
    ],
    "glycerol": [
     2000.0,
     2640.0,
     3430.0
    ],
    "diacetyl": [
     0.1274,
     0.1677,
     0.218
    ],
    "acetaldehyde": [
     2.71,
     3.56,
     4.63
    ],
    "ethyl_propionate": [
     46.251,
     60.857,
     79.114
    ],
    "hexyl_acetate": [
     54.173,
     71.28,
     92.664
    ],
    "amyl_acetate": [
     76.203,
     100.267,
     130.347
    ],
    "isopentyl_butanoate": [
     28.454,
     37.44,
     48.672
    ],
    "ethyl_isobutyrate": [
     45.84,
     60.316,
     78.411
    ],
    "octenol": [
     12.699,
     16.709,
     21.721
    ],
    "lactic_acid": [
     366,
     482,
     627
    ],
    "octanoic_acid": [
     3.96,
     5.21,
     6.78
    ],
    "iso_alpha": [
     27.8,
     36.6,
     47.6
    ],
    "linalool": [
     72.636,
     95.574,
     124.246
    ],
    "geraniol": [
     23.338,
     30.708,
     39.921
    ],
    "citronellol": [
     15.365,
     20.217,
     26.283
    ],
    "nerol": [
     15.459,
     20.34,
     26.443
    ],
    "cdbt": [
     289.481,
     380.897,
     495.166
    ],
    "beta_phellandrene": [
     7.311,
     9.62,
     12.506
    ],
    "alpha_terpineol": [
     39.607,
     52.115,
     67.749
    ],
    "terpinen_4_ol": [
     27.09,
     35.644,
     46.338
    ],
    "beta_caryophyllene": [
     38.136,
     50.179,
     65.233
    ],
    "z_farnesene": [
     64.583,
     84.978,
     110.471
    ],
    "farnesol": [
     14.714,
     19.36,
     25.168
    ],
    "nerolidol": [
     22.07,
     29.04,
     37.752
    ],
    "furfural": [
     156.739,
     206.235,
     268.106
    ],
    "methylpyrazine": [
     10.075,
     13.257,
     17.234
    ],
    "ethyl_furoate": [
     3.112,
     4.095,
     5.324
    ],
    "furfuryl_alcohol": [
     241.445,
     317.691,
     412.998
    ],
    "phenylacetaldehyde": [
     88.857,
     116.917,
     151.993
    ],
    "methanethiol": [
     0.446,
     0.587,
     0.763
    ],
    "dms": [
     2.163,
     2.846,
     3.699
    ],
    "benzaldehyde": [
     63.718,
     83.84,
     108.992
    ],
    "e_alpha_ionone": [
     0.47,
     0.618,
     0.804
    ],
    "e_beta_ionone": [
     0.427,
     0.562,
     0.731
    ],
    "4vg": [
     0.1915,
     0.252,
     0.3276
    ],
    "4eg": [
     86.683,
     114.056,
     148.273
    ],
    "4ep": [
     27.968,
     36.8,
     47.84
    ],
    "eugenol": [
     8.816,
     11.6,
     15.08
    ],
    "guaiacol": [
     12.596,
     16.573,
     21.545
    ],
    "co2": [
     3410.0,
     4490.0,
     5840.0
    ],
    "so2": [
     3.04,
     4.0,
     5.2
    ],
    "iron": [
     0.0433,
     0.057,
     0.074
    ],
    "t2n": [
     0.419,
     0.552,
     0.717
    ]
   },
   "key": [
    "ethanol",
    "glycerol",
    "iso_alpha",
    "isoamyl_alcohol",
    "diacetyl",
    "isoamyl_acetate",
    "ethyl_octanoate",
    "ethyl_hexanoate",
    "isobutanol",
    "ethyl_acetate",
    "mb2",
    "linalool"
   ],
   "fp": {
    "pos": [
     {
      "id": "phenylacetaldehyde",
      "d": 1.3
     },
     {
      "id": "glycerol",
      "d": 1.17
     },
     {
      "id": "e_alpha_ionone",
      "d": 1.15
     },
     {
      "id": "ethyl_octanoate",
      "d": 1.09
     },
     {
      "id": "ethyl_hexanoate",
      "d": 1.06
     }
    ],
    "neg": [
     {
      "id": "dms",
      "d": -0.51
     },
     {
      "id": "lactic_acid",
      "d": -0.42
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "xmas",
   "cn": "圣诞啤酒",
   "en": "Christmas",
   "group": "dark",
   "alias": "christmas 圣诞 香料",
   "n": null,
   "abv": "7.0–10.0%",
   "desc": "香料与深色麦芽同台，肉桂、丁香与焦糖构成节庆式的甜香。",
   "src": "表13 邻接",
   "profile": {
    "bitter": 3.6,
    "hop": 2.6,
    "ester": 3.6,
    "malt": 4.4,
    "roast": 3.2,
    "phenol": 2.6,
    "sour": 1.0,
    "alcohol": 4.2,
    "body": 4.4,
    "sulfur": 0.8,
    "aged": 1.8,
    "floral": 2.2
   },
   "values": {
    "ethanol": [
     42000.0,
     60000.0,
     82500.0
    ],
    "ethyl_acetate": [
     18.6,
     26.6,
     36.5
    ],
    "isoamyl_acetate": [
     2.63,
     3.76,
     5.17
    ],
    "isobutyl_acetate": [
     0.0903,
     0.129,
     0.1774
    ],
    "ethyl_hexanoate": [
     0.4011,
     0.573,
     0.7879
    ],
    "ethyl_octanoate": [
     0.8182,
     1.17,
     1.61
    ],
    "ethyl_decanoate": [
     227.909,
     325.584,
     447.679
    ],
    "phenethyl_acetate": [
     0.3847,
     0.5495,
     0.7556
    ],
    "phenethyl_alcohol": [
     15.4,
     21.9,
     30.2
    ],
    "isoamyl_alcohol": [
     67.0,
     95.8,
     132
    ],
    "isobutanol": [
     12.6,
     18.0,
     24.8
    ],
    "mb2": [
     12.6,
     18.1,
     24.8
    ],
    "glycerol": [
     1970.0,
     2810.0,
     3860.0
    ],
    "diacetyl": [
     0.1279,
     0.1827,
     0.2512
    ],
    "acetaldehyde": [
     2.8,
     4.0,
     5.5
    ],
    "ethyl_propionate": [
     39.2,
     56.0,
     77.0
    ],
    "hexyl_acetate": [
     45.612,
     65.16,
     89.595
    ],
    "amyl_acetate": [
     65.084,
     92.978,
     127.844
    ],
    "isopentyl_butanoate": [
     24.276,
     34.68,
     47.685
    ],
    "ethyl_isobutyrate": [
     38.758,
     55.368,
     76.132
    ],
    "octenol": [
     13.936,
     19.909,
     27.374
    ],
    "lactic_acid": [
     351,
     501,
     689
    ],
    "octanoic_acid": [
     4.52,
     6.46,
     8.89
    ],
    "iso_alpha": [
     23.6,
     33.7,
     46.3
    ],
    "linalool": [
     49.831,
     71.187,
     97.882
    ],
    "geraniol": [
     16.208,
     23.154,
     31.837
    ],
    "citronellol": [
     10.716,
     15.309,
     21.05
    ],
    "nerol": [
     10.759,
     15.37,
     21.134
    ],
    "cdbt": [
     197.014,
     281.448,
     386.991
    ],
    "beta_phellandrene": [
     5.88,
     8.4,
     11.55
    ],
    "alpha_terpineol": [
     27.34,
     39.057,
     53.704
    ],
    "terpinen_4_ol": [
     23.52,
     33.6,
     46.2
    ],
    "beta_caryophyllene": [
     35.28,
     50.4,
     69.3
    ],
    "z_farnesene": [
     44.302,
     63.289,
     87.022
    ],
    "farnesol": [
     10.416,
     14.88,
     20.46
    ],
    "nerolidol": [
     15.624,
     22.32,
     30.69
    ],
    "furfural": [
     237.918,
     339.882,
     467.338
    ],
    "methylpyrazine": [
     16.68,
     23.829,
     32.764
    ],
    "ethyl_furoate": [
     6.067,
     8.667,
     11.917
    ],
    "furfuryl_alcohol": [
     436.685,
     623.835,
     857.773
    ],
    "phenylacetaldehyde": [
     84.925,
     121.321,
     166.817
    ],
    "methanethiol": [
     1.053,
     1.504,
     2.068
    ],
    "dms": [
     5.184,
     7.406,
     10.183
    ],
    "benzaldehyde": [
     77.504,
     110.72,
     152.24
    ],
    "e_alpha_ionone": [
     0.411,
     0.588,
     0.808
    ],
    "e_beta_ionone": [
     0.487,
     0.695,
     0.956
    ],
    "4vg": [
     0.5292,
     0.756,
     1.04
    ],
    "4eg": [
     198.536,
     283.622,
     389.981
    ],
    "4ep": [
     61.6,
     88.0,
     121.0
    ],
    "eugenol": [
     19.08,
     27.257,
     37.479
    ],
    "guaiacol": [
     29.733,
     42.476,
     58.404
    ],
    "co2": [
     3120.0,
     4450.0,
     6120.0
    ],
    "so2": [
     2.8,
     4.0,
     5.5
    ],
    "iron": [
     0.0461,
     0.0659,
     0.0906
    ],
    "t2n": [
     0.604,
     0.862,
     1.186
    ]
   },
   "key": [
    "glycerol",
    "diacetyl",
    "ethanol",
    "iso_alpha",
    "isoamyl_alcohol",
    "ethyl_octanoate",
    "isoamyl_acetate",
    "ethyl_hexanoate",
    "methylpyrazine",
    "isobutanol",
    "ethyl_acetate",
    "ethyl_decanoate"
   ],
   "fp": {
    "pos": [
     {
      "id": "phenylacetaldehyde",
      "d": 1.46
     },
     {
      "id": "benzaldehyde",
      "d": 1.37
     },
     {
      "id": "glycerol",
      "d": 1.35
     },
     {
      "id": "e_beta_ionone",
      "d": 1.26
     },
     {
      "id": "diacetyl",
      "d": 1.24
     }
    ],
    "neg": [],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "faro",
   "cn": "法罗",
   "en": "Faro",
   "group": "sour",
   "alias": "faro 法罗 酸啤",
   "n": 3,
   "abv": "4.0–5.5%",
   "desc": "兰比克调入糖浆，酸度被甜味柔化，成为易饮的酸甜平衡。",
   "src": "表22 仅 3 例",
   "profile": {
    "bitter": 1.6,
    "hop": 1.4,
    "ester": 2.8,
    "malt": 3.8,
    "roast": 0.6,
    "phenol": 1.6,
    "sour": 4.4,
    "alcohol": 2.2,
    "body": 2.8,
    "sulfur": 0.8,
    "aged": 2.0,
    "floral": 1.0
   },
   "values": {
    "ethanol": [
     26780.0,
     38260.0,
     52600.0
    ],
    "ethyl_acetate": [
     13.1,
     18.7,
     25.7
    ],
    "isoamyl_acetate": [
     1.87,
     2.68,
     3.68
    ],
    "isobutyl_acetate": [
     0.0595,
     0.085,
     0.1169
    ],
    "ethyl_hexanoate": [
     0.3029,
     0.4327,
     0.595
    ],
    "ethyl_octanoate": [
     0.5796,
     0.828,
     1.14
    ],
    "ethyl_decanoate": [
     161.0,
     230.0,
     316.25
    ],
    "phenethyl_acetate": [
     0.211,
     0.3015,
     0.4145
    ],
    "phenethyl_alcohol": [
     6.5,
     9.29,
     12.8
    ],
    "isoamyl_alcohol": [
     35.5,
     50.8,
     69.8
    ],
    "isobutanol": [
     6.29,
     8.98,
     12.4
    ],
    "mb2": [
     6.36,
     9.09,
     12.5
    ],
    "glycerol": [
     1250.0,
     1790.0,
     2460.0
    ],
    "diacetyl": [
     0.099,
     0.1414,
     0.1945
    ],
    "acetaldehyde": [
     3.47,
     4.96,
     6.82
    ],
    "ethyl_propionate": [
     26.8,
     38.286,
     52.643
    ],
    "hexyl_acetate": [
     30.324,
     43.32,
     59.565
    ],
    "amyl_acetate": [
     45.92,
     65.6,
     90.2
    ],
    "isopentyl_butanoate": [
     17.052,
     24.36,
     33.495
    ],
    "ethyl_isobutyrate": [
     26.232,
     37.474,
     51.526
    ],
    "octenol": [
     13.008,
     18.583,
     25.551
    ],
    "lactic_acid": [
     1450.0,
     2070.0,
     2850.0
    ],
    "octanoic_acid": [
     6.08,
     8.68,
     11.9
    ],
    "iso_alpha": [
     9.35,
     13.4,
     18.4
    ],
    "linalool": [
     19.591,
     27.987,
     38.482
    ],
    "geraniol": [
     6.128,
     8.754,
     12.037
    ],
    "citronellol": [
     3.996,
     5.709,
     7.85
    ],
    "nerol": [
     4.039,
     5.77,
     7.934
    ],
    "cdbt": [
     79.414,
     113.448,
     155.991
    ],
    "beta_phellandrene": [
     2.646,
     3.78,
     5.197
    ],
    "alpha_terpineol": [
     10.54,
     15.057,
     20.704
    ],
    "terpinen_4_ol": [
     10.764,
     15.378,
     21.144
    ],
    "beta_caryophyllene": [
     16.356,
     23.366,
     32.128
    ],
    "z_farnesene": [
     17.422,
     24.889,
     34.222
    ],
    "farnesol": [
     3.696,
     5.28,
     7.26
    ],
    "nerolidol": [
     5.544,
     7.92,
     10.89
    ],
    "furfural": [
     116.2,
     166.0,
     228.25
    ],
    "methylpyrazine": [
     4.72,
     6.743,
     9.271
    ],
    "ethyl_furoate": [
     1.773,
     2.533,
     3.483
    ],
    "furfuryl_alcohol": [
     190.515,
     272.165,
     374.227
    ],
    "phenylacetaldehyde": [
     62.422,
     89.174,
     122.615
    ],
    "methanethiol": [
     0.0,
     0.395,
     0.829
    ],
    "dms": [
     1.752,
     2.503,
     3.441
    ],
    "benzaldehyde": [
     47.637,
     68.053,
     93.573
    ],
    "e_alpha_ionone": [
     0.244,
     0.349,
     0.48
    ],
    "e_beta_ionone": [
     0.143,
     0.205,
     0.282
    ],
    "4vg": [
     0.2772,
     0.396,
     0.5445
    ],
    "4eg": [
     99.439,
     142.056,
     195.327
    ],
    "4ep": [
     41.44,
     59.2,
     81.4
    ],
    "eugenol": [
     11.0,
     15.714,
     21.607
    ],
    "guaiacol": [
     12.835,
     18.336,
     25.212
    ],
    "co2": [
     3570.0,
     5110.0,
     7020.0
    ],
    "so2": [
     2.52,
     3.6,
     4.95
    ],
    "iron": [
     0.036,
     0.0514,
     0.0707
    ],
    "t2n": [
     0.572,
     0.818,
     1.124
    ]
   },
   "key": [
    "lactic_acid",
    "diacetyl",
    "glycerol",
    "ethyl_hexanoate",
    "ethyl_octanoate",
    "isoamyl_acetate",
    "co2",
    "ethanol",
    "octanoic_acid",
    "ethyl_acetate",
    "ethyl_decanoate",
    "acetaldehyde"
   ],
   "fp": {
    "pos": [
     {
      "id": "lactic_acid",
      "d": 1.55
     },
     {
      "id": "octanoic_acid",
      "d": 1.07
     },
     {
      "id": "octenol",
      "d": 0.99
     },
     {
      "id": "acetaldehyde",
      "d": 0.98
     },
     {
      "id": "co2",
      "d": 0.79
     }
    ],
    "neg": [
     {
      "id": "farnesol",
      "d": -2.0
     },
     {
      "id": "nerolidol",
      "d": -2.0
     },
     {
      "id": "nerol",
      "d": -1.97
     },
     {
      "id": "alpha_terpineol",
      "d": -1.94
     },
     {
      "id": "z_farnesene",
      "d": -1.91
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "brut",
   "cn": "布鲁特",
   "en": "Brut",
   "group": "abbey",
   "alias": "brut 布鲁特 香槟",
   "n": 4,
   "abv": "8.0–11.0%",
   "desc": "香槟化的高发酵度啤酒，极干的口感、活跃的气泡与细腻的果香。",
   "src": "表22 仅 4 例；表13 邻接 Tripel 8.50",
   "profile": {
    "bitter": 2.8,
    "hop": 2.8,
    "ester": 3.2,
    "malt": 2.2,
    "roast": 0.5,
    "phenol": 0.5,
    "sour": 1.4,
    "alcohol": 4.2,
    "body": 1.8,
    "sulfur": 0.8,
    "aged": 0.6,
    "floral": 2.4
   },
   "values": {
    "ethanol": [
     45500.0,
     65000.0,
     89380.0
    ],
    "ethyl_acetate": [
     16.1,
     23.0,
     31.7
    ],
    "isoamyl_acetate": [
     2.34,
     3.34,
     4.59
    ],
    "isobutyl_acetate": [
     0.0828,
     0.1183,
     0.1627
    ],
    "ethyl_hexanoate": [
     0.3271,
     0.4672,
     0.6425
    ],
    "ethyl_octanoate": [
     0.6156,
     0.8794,
     1.21
    ],
    "ethyl_decanoate": [
     169.909,
     242.727,
     333.75
    ],
    "phenethyl_acetate": [
     0.358,
     0.5114,
     0.7031
    ],
    "phenethyl_alcohol": [
     14.7,
     21.0,
     28.9
    ],
    "isoamyl_alcohol": [
     52.2,
     74.5,
     102
    ],
    "isobutanol": [
     10.1,
     14.5,
     19.9
    ],
    "mb2": [
     9.83,
     14.0,
     19.3
    ],
    "glycerol": [
     693,
     990,
     1360.0
    ],
    "diacetyl": [
     0.0549,
     0.0784,
     0.1078
    ],
    "acetaldehyde": [
     1.54,
     2.2,
     3.02
    ],
    "ethyl_propionate": [
     35.4,
     50.571,
     69.536
    ],
    "hexyl_acetate": [
     41.664,
     59.52,
     81.84
    ],
    "amyl_acetate": [
     57.991,
     82.844,
     113.911
    ],
    "isopentyl_butanoate": [
     21.672,
     30.96,
     42.57
    ],
    "ethyl_isobutyrate": [
     35.147,
     50.211,
     69.039
    ],
    "octenol": [
     4.656,
     6.651,
     9.146
    ],
    "lactic_acid": [
     253,
     362,
     497
    ],
    "octanoic_acid": [
     1.85,
     2.65,
     3.64
    ],
    "iso_alpha": [
     17.2,
     24.6,
     33.8
    ],
    "linalool": [
     54.871,
     78.387,
     107.782
    ],
    "geraniol": [
     17.888,
     25.554,
     35.137
    ],
    "citronellol": [
     11.836,
     16.909,
     23.25
    ],
    "nerol": [
     11.879,
     16.97,
     23.334
    ],
    "cdbt": [
     216.614,
     309.448,
     425.491
    ],
    "beta_phellandrene": [
     4.991,
     7.13,
     9.804
    ],
    "alpha_terpineol": [
     30.14,
     43.057,
     59.204
    ],
    "terpinen_4_ol": [
     17.889,
     25.556,
     35.139
    ],
    "beta_caryophyllene": [
     24.428,
     34.897,
     47.983
    ],
    "z_farnesene": [
     48.782,
     69.689,
     95.822
    ],
    "farnesol": [
     11.536,
     16.48,
     22.66
    ],
    "nerolidol": [
     17.304,
     24.72,
     33.99
    ],
    "furfural": [
     34.259,
     48.941,
     67.294
    ],
    "methylpyrazine": [
     2.21,
     3.157,
     4.341
    ],
    "ethyl_furoate": [
     0.0,
     0.152,
     0.32
    ],
    "furfuryl_alcohol": [
     0.0,
     17.155,
     36.025
    ],
    "phenylacetaldehyde": [
     48.859,
     69.798,
     95.972
    ],
    "methanethiol": [
     0.0,
     0.352,
     0.739
    ],
    "dms": [
     0.0,
     2.314,
     4.86
    ],
    "benzaldehyde": [
     24.117,
     34.453,
     47.373
    ],
    "e_alpha_ionone": [
     0.308,
     0.44,
     0.605
    ],
    "e_beta_ionone": [
     0.244,
     0.349,
     0.48
    ],
    "4vg": [
     0.0,
     -0.0,
     0.018
    ],
    "4eg": [
     0.0,
     3.133,
     7.0
    ],
    "4ep": [
     0.0,
     1.6,
     3.36
    ],
    "eugenol": [
     0.0,
     1.943,
     4.08
    ],
    "guaiacol": [
     0.0,
     0.308,
     1.0
    ],
    "co2": [
     2260.0,
     3230.0,
     4440.0
    ],
    "so2": [
     2.69,
     3.84,
     5.28
    ],
    "iron": [
     0.0142,
     0.0203,
     0.0279
    ],
    "t2n": [
     0.0,
     0.054,
     0.114
    ]
   },
   "key": [
    "ethanol",
    "isoamyl_acetate",
    "isoamyl_alcohol",
    "ethyl_hexanoate",
    "iso_alpha",
    "ethyl_octanoate",
    "ethyl_acetate",
    "linalool",
    "isobutyl_acetate",
    "cdbt",
    "isobutanol",
    "phenethyl_acetate"
   ],
   "fp": {
    "pos": [
     {
      "id": "farnesol",
      "d": 0.62
     },
     {
      "id": "nerolidol",
      "d": 0.62
     },
     {
      "id": "phenethyl_alcohol",
      "d": 0.58
     },
     {
      "id": "ethanol",
      "d": 0.57
     },
     {
      "id": "nerol",
      "d": 0.55
     }
    ],
    "neg": [
     {
      "id": "ethyl_furoate",
      "d": -2.2
     },
     {
      "id": "furfuryl_alcohol",
      "d": -2.2
     },
     {
      "id": "4eg",
      "d": -2.2
     },
     {
      "id": "guaiacol",
      "d": -2.2
     },
     {
      "id": "t2n",
      "d": -2.2
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  },
  {
   "id": "tripel",
   "cn": "三料",
   "en": "Tripel",
   "group": "abbey",
   "alias": "tripel 三料 修道院 abbey",
   "n": 28,
   "abv": "8.0–10.0%",
   "desc": "修道院式高发酵度金色烈性艾尔，酯香饱满、酒精温暖，收口却意外干爽。",
   "src": "表5 #147；表12 / 表13 / 表14",
   "profile": {
    "bitter": 4.0,
    "hop": 4.4,
    "ester": 4.6,
    "malt": 2.6,
    "roast": 0.6,
    "phenol": 0.6,
    "sour": 1.0,
    "alcohol": 4.2,
    "body": 3.0,
    "sulfur": 0.5,
    "aged": 0.8,
    "floral": 3.4
   },
   "values": {
    "ethanol": [
     46200.0,
     66000.0,
     90750.0
    ],
    "ethyl_acetate": [
     24.8,
     35.5,
     48.8
    ],
    "isoamyl_acetate": [
     3.47,
     4.96,
     6.82
    ],
    "isobutyl_acetate": [
     0.1361,
     0.1944,
     0.2673
    ],
    "ethyl_hexanoate": [
     0.4662,
     0.666,
     0.9158
    ],
    "ethyl_octanoate": [
     0.8442,
     1.21,
     1.66
    ],
    "ethyl_decanoate": [
     265.182,
     378.831,
     520.893
    ],
    "phenethyl_acetate": [
     0.6132,
     0.876,
     1.2
    ],
    "phenethyl_alcohol": [
     22.0,
     31.4,
     43.2
    ],
    "isoamyl_alcohol": [
     61.8,
     88.3,
     121
    ],
    "isobutanol": [
     11.3,
     16.1,
     22.2
    ],
    "mb2": [
     11.1,
     15.9,
     21.9
    ],
    "glycerol": [
     1490.0,
     2120.0,
     2920.0
    ],
    "diacetyl": [
     0.0353,
     0.0504,
     0.0693
    ],
    "acetaldehyde": [
     2.27,
     3.24,
     4.45
    ],
    "ethyl_propionate": [
     53.8,
     76.857,
     105.679
    ],
    "hexyl_acetate": [
     63.336,
     90.48,
     124.41
    ],
    "amyl_acetate": [
     88.107,
     125.867,
     173.067
    ],
    "isopentyl_butanoate": [
     32.928,
     47.04,
     64.68
    ],
    "ethyl_isobutyrate": [
     53.421,
     76.316,
     104.934
    ],
    "octenol": [
     6.288,
     8.983,
     12.351
    ],
    "lactic_acid": [
     284,
     405,
     557
    ],
    "octanoic_acid": [
     2.43,
     3.47,
     4.77
    ],
    "iso_alpha": [
     24.3,
     34.7,
     47.7
    ],
    "linalool": [
     90.557,
     129.368,
     177.881
    ],
    "geraniol": [
     29.18,
     41.685,
     57.317
    ],
    "citronellol": [
     19.23,
     27.472,
     37.774
    ],
    "nerol": [
     19.338,
     27.626,
     37.985
    ],
    "cdbt": [
     360.234,
     514.621,
     707.603
    ],
    "beta_phellandrene": [
     8.526,
     12.18,
     16.748
    ],
    "alpha_terpineol": [
     49.451,
     70.644,
     97.135
    ],
    "terpinen_4_ol": [
     30.676,
     43.822,
     60.256
    ],
    "beta_caryophyllene": [
     42.039,
     60.055,
     82.576
    ],
    "z_farnesene": [
     80.516,
     115.022,
     158.156
    ],
    "farnesol": [
     18.48,
     26.4,
     36.3
    ],
    "nerolidol": [
     27.72,
     39.6,
     54.45
    ],
    "furfural": [
     63.7,
     91.0,
     125.125
    ],
    "methylpyrazine": [
     1.96,
     2.8,
     3.85
    ],
    "ethyl_furoate": [
     0.84,
     1.2,
     1.65
    ],
    "furfuryl_alcohol": [
     123.2,
     176.0,
     242.0
    ],
    "phenylacetaldehyde": [
     68.71,
     98.158,
     134.967
    ],
    "methanethiol": [
     0.0,
     0.043,
     0.09
    ],
    "dms": [
     9.24,
     13.2,
     18.15
    ],
    "benzaldehyde": [
     30.613,
     43.733,
     60.133
    ],
    "e_alpha_ionone": [
     0.441,
     0.631,
     0.867
    ],
    "e_beta_ionone": [
     0.388,
     0.554,
     0.762
    ],
    "4vg": [
     0.0,
     0.072,
     0.1512
    ],
    "4eg": [
     44.1,
     63.0,
     86.625
    ],
    "4ep": [
     0.0,
     8.0,
     16.8
    ],
    "eugenol": [
     2.44,
     3.486,
     4.793
    ],
    "guaiacol": [
     0.0,
     2.615,
     5.492
    ],
    "co2": [
     2890.0,
     4130.0,
     5680.0
    ],
    "so2": [
     3.08,
     4.4,
     6.05
    ],
    "iron": [
     0.0261,
     0.0373,
     0.0513
    ],
    "t2n": [
     0.118,
     0.168,
     0.231
    ]
   },
   "key": [
    "isoamyl_acetate",
    "ethanol",
    "linalool",
    "ethyl_hexanoate",
    "iso_alpha",
    "cdbt",
    "ethyl_acetate",
    "isobutyl_acetate",
    "ethyl_octanoate",
    "phenethyl_acetate",
    "ethyl_decanoate",
    "isoamyl_alcohol"
   ],
   "fp": {
    "pos": [
     {
      "id": "isoamyl_acetate",
      "d": 1.02
     },
     {
      "id": "isobutyl_acetate",
      "d": 0.76
     },
     {
      "id": "ethyl_hexanoate",
      "d": 0.73
     },
     {
      "id": "ethyl_octanoate",
      "d": 0.72
     },
     {
      "id": "phenethyl_acetate",
      "d": 0.7
     }
    ],
    "neg": [
     {
      "id": "ethyl_furoate",
      "d": -0.98
     },
     {
      "id": "methylpyrazine",
      "d": -0.9
     },
     {
      "id": "4eg",
      "d": -0.88
     },
     {
      "id": "furfuryl_alcohol",
      "d": -0.71
     }
    ],
    "src": "表12",
    "notes": [
     {
      "k": "色度",
      "d": -0.71
     }
    ]
   }
  },
  {
   "id": "dubbel",
   "cn": "双料",
   "en": "Dubbel",
   "group": "abbey",
   "alias": "dubbel 双料 修道院 abbey",
   "n": null,
   "abv": "6.0–8.0%",
   "desc": "深色修道院双料，焦糖与深色果脯的甜香，酒体中等偏厚。",
   "src": "表13 邻接 Brown 4.97",
   "profile": {
    "bitter": 3.0,
    "hop": 2.4,
    "ester": 3.8,
    "malt": 4.2,
    "roast": 2.8,
    "phenol": 1.2,
    "sour": 1.0,
    "alcohol": 4.0,
    "body": 3.8,
    "sulfur": 0.6,
    "aged": 1.4,
    "floral": 2.0
   },
   "values": {
    "ethanol": [
     42700.0,
     61000.0,
     83880.0
    ],
    "ethyl_acetate": [
     19.1,
     27.2,
     37.4
    ],
    "isoamyl_acetate": [
     2.77,
     3.96,
     5.44
    ],
    "isobutyl_acetate": [
     0.0931,
     0.133,
     0.1829
    ],
    "ethyl_hexanoate": [
     0.421,
     0.6015,
     0.8271
    ],
    "ethyl_octanoate": [
     0.8316,
     1.19,
     1.63
    ],
    "ethyl_decanoate": [
     231.0,
     330.0,
     453.75
    ],
    "phenethyl_acetate": [
     0.3717,
     0.531,
     0.7301
    ],
    "phenethyl_alcohol": [
     13.8,
     19.7,
     27.1
    ],
    "isoamyl_alcohol": [
     62.2,
     88.8,
     122
    ],
    "isobutanol": [
     11.6,
     16.5,
     22.7
    ],
    "mb2": [
     11.5,
     16.5,
     22.7
    ],
    "glycerol": [
     1700.0,
     2430.0,
     3340.0
    ],
    "diacetyl": [
     0.1176,
     0.168,
     0.231
    ],
    "acetaldehyde": [
     2.5,
     3.56,
     4.9
    ],
    "ethyl_propionate": [
     40.8,
     58.286,
     80.143
    ],
    "hexyl_acetate": [
     47.124,
     67.32,
     92.565
    ],
    "amyl_acetate": [
     68.32,
     97.6,
     134.2
    ],
    "isopentyl_butanoate": [
     25.452,
     36.36,
     49.995
    ],
    "ethyl_isobutyrate": [
     40.232,
     57.474,
     79.026
    ],
    "octenol": [
     12.208,
     17.44,
     23.98
    ],
    "lactic_acid": [
     311,
     444,
     611
    ],
    "octanoic_acid": [
     3.35,
     4.78,
     6.57
    ],
    "iso_alpha": [
     19.4,
     27.8,
     38.2
    ],
    "linalool": [
     44.791,
     63.987,
     87.982
    ],
    "geraniol": [
     14.528,
     20.754,
     28.537
    ],
    "citronellol": [
     9.596,
     13.709,
     18.85
    ],
    "nerol": [
     9.639,
     13.77,
     18.934
    ],
    "cdbt": [
     177.414,
     253.448,
     348.491
    ],
    "beta_phellandrene": [
     4.564,
     6.52,
     8.965
    ],
    "alpha_terpineol": [
     24.54,
     35.057,
     48.204
    ],
    "terpinen_4_ol": [
     17.173,
     24.533,
     33.733
    ],
    "beta_caryophyllene": [
     24.505,
     35.007,
     48.134
    ],
    "z_farnesene": [
     39.822,
     56.889,
     78.222
    ],
    "farnesol": [
     9.296,
     13.28,
     18.26
    ],
    "nerolidol": [
     13.944,
     19.92,
     27.39
    ],
    "furfural": [
     202.341,
     289.059,
     397.456
    ],
    "methylpyrazine": [
     14.7,
     21.0,
     28.875
    ],
    "ethyl_furoate": [
     4.947,
     7.067,
     9.717
    ],
    "furfuryl_alcohol": [
     347.085,
     495.835,
     681.773
    ],
    "phenylacetaldehyde": [
     76.848,
     109.783,
     150.952
    ],
    "methanethiol": [
     0.769,
     1.099,
     1.511
    ],
    "dms": [
     3.576,
     5.109,
     7.024
    ],
    "benzaldehyde": [
     71.381,
     101.973,
     140.213
    ],
    "e_alpha_ionone": [
     0.378,
     0.54,
     0.742
    ],
    "e_beta_ionone": [
     0.411,
     0.587,
     0.807
    ],
    "4vg": [
     0.1764,
     0.252,
     0.3465
    ],
    "4eg": [
     100.399,
     143.427,
     197.212
    ],
    "4ep": [
     25.76,
     36.8,
     50.6
    ],
    "eugenol": [
     8.28,
     11.829,
     16.264
    ],
    "guaiacol": [
     15.713,
     22.448,
     30.865
    ],
    "co2": [
     2700.0,
     3850.0,
     5300.0
    ],
    "so2": [
     3.08,
     4.4,
     6.05
    ],
    "iron": [
     0.0357,
     0.051,
     0.0701
    ],
    "t2n": [
     0.436,
     0.622,
     0.856
    ]
   },
   "key": [
    "ethanol",
    "diacetyl",
    "glycerol",
    "isoamyl_acetate",
    "ethyl_octanoate",
    "ethyl_hexanoate",
    "isoamyl_alcohol",
    "ethyl_acetate",
    "iso_alpha",
    "ethyl_decanoate",
    "methylpyrazine",
    "isobutyl_acetate"
   ],
   "fp": {
    "pos": [
     {
      "id": "benzaldehyde",
      "d": 1.19
     },
     {
      "id": "ethyl_hexanoate",
      "d": 1.09
     },
     {
      "id": "methylpyrazine",
      "d": 1.06
     },
     {
      "id": "diacetyl",
      "d": 1.03
     },
     {
      "id": "ethyl_octanoate",
      "d": 1.02
     }
    ],
    "neg": [
     {
      "id": "lactic_acid",
      "d": -0.53
     },
     {
      "id": "co2",
      "d": -0.44
     }
    ],
    "src": "跨风格标准化 d",
    "notes": []
   }
  }
 ],
 "evidence": [
  {
   "id": "A_malt_all",
   "cn": "麦芽香（总体）",
   "group": "aroma",
   "tier": 2,
   "top": [
    {
     "en": "Beta-phellandrene",
     "cn": "β-水芹烯",
     "pi": 0.83,
     "rho": 0.29,
     "relaxed": false
    },
    {
     "en": "Furfural",
     "cn": "糠醛",
     "pi": 0.91,
     "rho": 0.25,
     "relaxed": false
    },
    {
     "en": "E-β-ionone",
     "cn": "E-β-紫罗兰酮",
     "pi": 0.86,
     "rho": 0.25,
     "relaxed": false
    }
   ]
  },
  {
   "id": "A_malt_grain",
   "cn": "谷物香",
   "group": "aroma",
   "tier": 3,
   "top": [
    {
     "en": "Beta-phellandrene",
     "cn": "β-水芹烯",
     "pi": 0.46,
     "rho": 0.23,
     "relaxed": true
    },
    {
     "en": "Furfural",
     "cn": "糠醛",
     "pi": 0.4,
     "rho": 0.19,
     "relaxed": true
    },
    {
     "en": "Z-nerolidol",
     "cn": "Z-橙花叔醇",
     "pi": 0.48,
     "rho": 0.11,
     "relaxed": true
    }
   ]
  },
  {
   "id": "A_malt_bread",
   "cn": "面包香",
   "group": "aroma",
   "tier": 3,
   "top": [
    {
     "en": "Ethyl tiglate",
     "cn": "惕各酸乙酯",
     "pi": 0.79,
     "rho": 0.24,
     "relaxed": false
    },
    {
     "en": "Carbon dioxide",
     "cn": "二氧化碳",
     "pi": 0.69,
     "rho": 0.22,
     "relaxed": false
    },
    {
     "en": "Benzaldehyde",
     "cn": "苯甲醛",
     "pi": 0.67,
     "rho": 0.12,
     "relaxed": false
    }
   ]
  },
  {
   "id": "A_malt_cara",
   "cn": "焦糖麦芽香",
   "group": "aroma",
   "tier": 2,
   "top": [
    {
     "en": "Furfural",
     "cn": "糠醛",
     "pi": 0.93,
     "rho": 0.3,
     "relaxed": false
    },
    {
     "en": "4-ethyl-guaiacol",
     "cn": "4-乙基愈创木酚",
     "pi": 0.67,
     "rho": 0.14,
     "relaxed": false
    },
    {
     "en": "Phenethyl alcohol",
     "cn": "苯乙醇",
     "pi": 0.76,
     "rho": 0.13,
     "relaxed": false
    }
   ]
  },
  {
   "id": "A_malt_burn",
   "cn": "焦糊麦芽香",
   "group": "aroma",
   "tier": 3,
   "top": [
    {
     "en": "Y-methyl-1-octanol",
     "cn": "γ-甲基-1-辛醇",
     "pi": 0.52,
     "rho": 0.26,
     "relaxed": true
    },
    {
     "en": "Methylpyrazine",
     "cn": "甲基吡嗪",
     "pi": 0.71,
     "rho": 0.17,
     "relaxed": false
    },
    {
     "en": "Methyl isoeugenol",
     "cn": "甲基异丁香酚",
     "pi": 0.55,
     "rho": 0.03,
     "relaxed": true
    }
   ]
  },
  {
   "id": "A_hops_all",
   "cn": "酒花香气（总体）",
   "group": "aroma",
   "tier": 1,
   "top": [
    {
     "en": "E-2-nonenal",
     "cn": "反式-2-壬烯醛",
     "pi": 0.69,
     "rho": 0.43,
     "relaxed": false
    },
    {
     "en": "Linalool",
     "cn": "里那醇",
     "pi": 0.67,
     "rho": 0.41,
     "relaxed": false
    },
    {
     "en": "Dimethyl sulfide",
     "cn": "二甲基硫",
     "pi": 0.72,
     "rho": 0.4,
     "relaxed": false
    }
   ]
  },
  {
   "id": "A_hops_citrus",
   "cn": "柑橘酒花",
   "group": "aroma",
   "tier": 2,
   "top": [
    {
     "en": "Citronellol",
     "cn": "香茅醇",
     "pi": 0.87,
     "rho": 0.37,
     "relaxed": false
    },
    {
     "en": "Trans-dihydro-α-terpinyl acetate",
     "cn": "反式二氢-α-乙酸松油酯",
     "pi": 0.77,
     "rho": 0.29,
     "relaxed": false
    },
    {
     "en": "Methyl heptenone",
     "cn": "甲基庚烯酮",
     "pi": 0.78,
     "rho": 0.27,
     "relaxed": false
    }
   ]
  },
  {
   "id": "A_hops_tropical",
   "cn": "热带水果酒花",
   "group": "aroma",
   "tier": 2,
   "top": [
    {
     "en": "Dimethyl sulfide",
     "cn": "二甲基硫",
     "pi": 0.92,
     "rho": 0.32,
     "relaxed": false
    },
    {
     "en": "Citronellol",
     "cn": "香茅醇",
     "pi": 0.71,
     "rho": 0.26,
     "relaxed": false
    },
    {
     "en": "Beta-phellandrene",
     "cn": "β-水芹烯",
     "pi": 0.86,
     "rho": 0.23,
     "relaxed": false
    }
   ]
  },
  {
   "id": "A_hops_noble",
   "cn": "贵族酒花",
   "group": "aroma",
   "tier": 1,
   "top": [
    {
     "en": "Ethyl octanoate",
     "cn": "辛酸乙酯",
     "pi": 0.84,
     "rho": 0.48,
     "relaxed": false
    },
    {
     "en": "Iron",
     "cn": "铁",
     "pi": 0.88,
     "rho": 0.33,
     "relaxed": false
    },
    {
     "en": "Ethyl 2-hexenoate",
     "cn": "2-己烯酸乙酯",
     "pi": 0.67,
     "rho": 0.32,
     "relaxed": false
    }
   ]
  },
  {
   "id": "A_hops_woody",
   "cn": "木质酒花",
   "group": "aroma",
   "tier": 3,
   "top": [
    {
     "en": "E-ortho-methoxy cinnamaldehyde",
     "cn": "反式邻甲氧基肉桂醛",
     "pi": 0.73,
     "rho": 0.24,
     "relaxed": false
    },
    {
     "en": "Ethyl 2-methylbutyrate",
     "cn": "2-甲基丁酸乙酯",
     "pi": 0.79,
     "rho": 0.24,
     "relaxed": false
    },
    {
     "en": "Iron",
     "cn": "铁",
     "pi": 0.73,
     "rho": 0.12,
     "relaxed": false
    }
   ]
  },
  {
   "id": "A_esters_all",
   "cn": "酯香（总体）",
   "group": "aroma",
   "tier": 2,
   "top": [
    {
     "en": "N-hexanol",
     "cn": "正己醇",
     "pi": 0.93,
     "rho": 0.36,
     "relaxed": false
    },
    {
     "en": "Acetaldehyde",
     "cn": "乙醛",
     "pi": 0.98,
     "rho": 0.35,
     "relaxed": false
    },
    {
     "en": "Isoamyl alcohol",
     "cn": "异戊醇",
     "pi": 0.5,
     "rho": 0.3,
     "relaxed": true
    }
   ]
  },
  {
   "id": "A_esters_ethac",
   "cn": "乙酸酯香",
   "group": "aroma",
   "tier": 2,
   "top": [
    {
     "en": "Ethyl acetate",
     "cn": "乙酸乙酯",
     "pi": 0.75,
     "rho": 0.36,
     "relaxed": false
    },
    {
     "en": "Acetaldehyde",
     "cn": "乙醛",
     "pi": 0.89,
     "rho": 0.34,
     "relaxed": false
    },
    {
     "en": "E,Z-farnesal",
     "cn": "E,Z-法尼醛",
     "pi": 0.7,
     "rho": 0.27,
     "relaxed": false
    }
   ]
  },
  {
   "id": "A_esters_isoaa",
   "cn": "乙酸异戊酯香",
   "group": "aroma",
   "tier": 2,
   "top": [
    {
     "en": "N-hexanol",
     "cn": "正己醇",
     "pi": 0.92,
     "rho": 0.34,
     "relaxed": false
    },
    {
     "en": "Isoamyl alcohol",
     "cn": "异戊醇",
     "pi": 0.51,
     "rho": 0.22,
     "relaxed": true
    },
    {
     "en": "Ambroxide",
     "cn": "龙涎香醚",
     "pi": 0.51,
     "rho": 0.1,
     "relaxed": true
    }
   ]
  },
  {
   "id": "A_esters_flower",
   "cn": "花香酯",
   "group": "aroma",
   "tier": 3,
   "top": [
    {
     "en": "Beta-phellandrene",
     "cn": "β-水芹烯",
     "pi": 0.82,
     "rho": 0.19,
     "relaxed": false
    },
    {
     "en": "E-dihydro-apofarnesal",
     "cn": "E-二氢降法尼醛",
     "pi": 0.63,
     "rho": 0.15,
     "relaxed": false
    },
    {
     "en": "E-α-ionone",
     "cn": "E-α-紫罗兰酮",
     "pi": 0.84,
     "rho": 0.09,
     "relaxed": false
    }
   ]
  },
  {
   "id": "A_esters_fruity",
   "cn": "果香酯",
   "group": "aroma",
   "tier": 3,
   "top": [
    {
     "en": "Beta-phellandrene",
     "cn": "β-水芹烯",
     "pi": 0.95,
     "rho": 0.22,
     "relaxed": false
    },
    {
     "en": "Eugenol",
     "cn": "丁香酚",
     "pi": 0.59,
     "rho": 0.19,
     "relaxed": true
    },
    {
     "en": "Epicubenol",
     "cn": "表库贝醇",
     "pi": 0.9,
     "rho": 0.17,
     "relaxed": false
    }
   ]
  },
  {
   "id": "F_malt_all",
   "cn": "麦芽风味（总体）",
   "group": "flavour",
   "tier": 1,
   "top": [
    {
     "en": "Acetaldehyde",
     "cn": "乙醛",
     "pi": 0.99,
     "rho": 0.47,
     "relaxed": false
    },
    {
     "en": "Phenylacetaldehyde",
     "cn": "Phenylacetaldehyde",
     "pi": 0.6,
     "rho": 0.28,
     "relaxed": false
    },
    {
     "en": "E-α-ionone",
     "cn": "E-α-紫罗兰酮",
     "pi": 0.89,
     "rho": 0.28,
     "relaxed": false
    }
   ]
  },
  {
   "id": "F_malt_grain",
   "cn": "谷物风味",
   "group": "flavour",
   "tier": 3,
   "top": [
    {
     "en": "E-β-ionone",
     "cn": "E-β-紫罗兰酮",
     "pi": 0.8,
     "rho": 0.25,
     "relaxed": false
    },
    {
     "en": "Terpinen-4-ol",
     "cn": "4-松油醇",
     "pi": 0.76,
     "rho": 0.24,
     "relaxed": false
    },
    {
     "en": "3-methyl-2-butenal",
     "cn": "3-甲基-2-丁烯醛",
     "pi": 0.63,
     "rho": 0.13,
     "relaxed": false
    }
   ]
  },
  {
   "id": "F_malt_bread",
   "cn": "面包风味",
   "group": "flavour",
   "tier": 2,
   "top": [
    {
     "en": "Acetaldehyde",
     "cn": "乙醛",
     "pi": 0.63,
     "rho": 0.38,
     "relaxed": false
    },
    {
     "en": "Terpinen-4-ol",
     "cn": "4-松油醇",
     "pi": 0.74,
     "rho": 0.32,
     "relaxed": false
    },
    {
     "en": "Carbon dioxide",
     "cn": "二氧化碳",
     "pi": 0.78,
     "rho": 0.26,
     "relaxed": false
    }
   ]
  },
  {
   "id": "F_malt_cara",
   "cn": "焦糖麦芽风味",
   "group": "flavour",
   "tier": 1,
   "top": [
    {
     "en": "Acetaldehyde",
     "cn": "乙醛",
     "pi": 0.91,
     "rho": 0.43,
     "relaxed": false
    },
    {
     "en": "Ethyl propionate",
     "cn": "丙酸乙酯",
     "pi": 0.67,
     "rho": 0.17,
     "relaxed": false
    },
    {
     "en": "Phenethyl alcohol",
     "cn": "苯乙醇",
     "pi": 0.75,
     "rho": 0.16,
     "relaxed": false
    }
   ]
  },
  {
   "id": "F_malt_burn",
   "cn": "焦糊风味",
   "group": "flavour",
   "tier": 1,
   "top": [
    {
     "en": "Methanethiol",
     "cn": "甲硫醇",
     "pi": 0.68,
     "rho": 0.4,
     "relaxed": false
    },
    {
     "en": "Glycerol",
     "cn": "甘油",
     "pi": 0.61,
     "rho": 0.36,
     "relaxed": false
    },
    {
     "en": "Methylpyrazine",
     "cn": "甲基吡嗪",
     "pi": 0.85,
     "rho": 0.22,
     "relaxed": false
    }
   ]
  },
  {
   "id": "F_hops_all",
   "cn": "酒花风味（总体）",
   "group": "flavour",
   "tier": 1,
   "top": [
    {
     "en": "Cis-dihydro-β-terpineol",
     "cn": "二氢-β-松油醇",
     "pi": 0.82,
     "rho": 0.55,
     "relaxed": false
    },
    {
     "en": "E-2-nonenal",
     "cn": "反式-2-壬烯醛",
     "pi": 0.71,
     "rho": 0.46,
     "relaxed": false
    },
    {
     "en": "Dimethyl sulfide",
     "cn": "二甲基硫",
     "pi": 0.79,
     "rho": 0.42,
     "relaxed": false
    }
   ]
  },
  {
   "id": "F_hops_citrus",
   "cn": "柑橘风味",
   "group": "flavour",
   "tier": 2,
   "top": [
    {
     "en": "Furfural",
     "cn": "糠醛",
     "pi": 0.81,
     "rho": 0.27,
     "relaxed": false
    },
    {
     "en": "Geosmin",
     "cn": "土臭素",
     "pi": 0.81,
     "rho": 0.23,
     "relaxed": false
    },
    {
     "en": "Cis-dihydro-β-terpineol",
     "cn": "二氢-β-松油醇",
     "pi": 0.67,
     "rho": 0.19,
     "relaxed": false
    }
   ]
  },
  {
   "id": "F_hops_tropical",
   "cn": "热带水果风味",
   "group": "flavour",
   "tier": 2,
   "top": [
    {
     "en": "Hexyl acetate",
     "cn": "乙酸己酯",
     "pi": 0.86,
     "rho": 0.28,
     "relaxed": false
    },
    {
     "en": "Dimethyl sulfide",
     "cn": "二甲基硫",
     "pi": 0.51,
     "rho": 0.28,
     "relaxed": true
    },
    {
     "en": "Beta-phellandrene",
     "cn": "β-水芹烯",
     "pi": 0.55,
     "rho": 0.24,
     "relaxed": true
    }
   ]
  },
  {
   "id": "F_hops_noble",
   "cn": "贵族酒花风味",
   "group": "flavour",
   "tier": 1,
   "top": [
    {
     "en": "Cis-dihydro-β-terpineol",
     "cn": "二氢-β-松油醇",
     "pi": 0.7,
     "rho": 0.52,
     "relaxed": false
    },
    {
     "en": "Ethyl octanoate",
     "cn": "辛酸乙酯",
     "pi": 0.84,
     "rho": 0.51,
     "relaxed": false
    },
    {
     "en": "Iron",
     "cn": "铁",
     "pi": 0.97,
     "rho": 0.42,
     "relaxed": false
    }
   ]
  },
  {
   "id": "F_hops_woody",
   "cn": "木质风味",
   "group": "flavour",
   "tier": 2,
   "top": [
    {
     "en": "Isobutanol",
     "cn": "异丁醇",
     "pi": 0.87,
     "rho": 0.32,
     "relaxed": false
    },
    {
     "en": "Cis-dihydro-β-terpineol",
     "cn": "二氢-β-松油醇",
     "pi": 0.71,
     "rho": 0.32,
     "relaxed": false
    },
    {
     "en": "Neo-allo-ocimene",
     "cn": "新别罗勒烯",
     "pi": 0.61,
     "rho": 0.2,
     "relaxed": false
    }
   ]
  },
  {
   "id": "F_esters_all",
   "cn": "酯类风味（总体）",
   "group": "flavour",
   "tier": 1,
   "top": [
    {
     "en": "Acetaldehyde",
     "cn": "乙醛",
     "pi": 0.98,
     "rho": 0.4,
     "relaxed": false
    },
    {
     "en": "N-hexanol",
     "cn": "正己醇",
     "pi": 0.86,
     "rho": 0.38,
     "relaxed": false
    },
    {
     "en": "Phenethyl alcohol",
     "cn": "苯乙醇",
     "pi": 0.8,
     "rho": 0.22,
     "relaxed": false
    }
   ]
  },
  {
   "id": "F_esters_ethac",
   "cn": "乙酸酯风味",
   "group": "flavour",
   "tier": 1,
   "top": [
    {
     "en": "Ethyl acetate",
     "cn": "乙酸乙酯",
     "pi": 0.87,
     "rho": 0.5,
     "relaxed": false
    },
    {
     "en": "Acetaldehyde",
     "cn": "乙醛",
     "pi": 0.8,
     "rho": 0.39,
     "relaxed": false
    },
    {
     "en": "E,Z-farnesal",
     "cn": "E,Z-法尼醛",
     "pi": 0.64,
     "rho": 0.28,
     "relaxed": false
    }
   ]
  },
  {
   "id": "F_esters_isoaa",
   "cn": "乙酸异戊酯风味",
   "group": "flavour",
   "tier": 2,
   "top": [
    {
     "en": "N-hexanol",
     "cn": "正己醇",
     "pi": 0.73,
     "rho": 0.3,
     "relaxed": false
    },
    {
     "en": "Acetaldehyde",
     "cn": "乙醛",
     "pi": 0.68,
     "rho": 0.24,
     "relaxed": false
    },
    {
     "en": "13-epi manool oxide",
     "cn": "13-表-泪杉醇氧化物",
     "pi": 0.52,
     "rho": 0.16,
     "relaxed": true
    }
   ]
  },
  {
   "id": "F_esters_flower",
   "cn": "花香酯风味",
   "group": "flavour",
   "tier": 3,
   "top": [
    {
     "en": "Beta-phellandrene",
     "cn": "β-水芹烯",
     "pi": 0.58,
     "rho": 0.22,
     "relaxed": true
    },
    {
     "en": "Eucalyptol",
     "cn": "桉叶油醇",
     "pi": 0.52,
     "rho": 0.14,
     "relaxed": true
    },
    {
     "en": "2-methyltetrahydrofuran-3-one",
     "cn": "2-甲基四氢呋喃-3-酮",
     "pi": 0.45,
     "rho": 0.13,
     "relaxed": true
    }
   ]
  },
  {
   "id": "F_esters_fruity",
   "cn": "果香酯风味",
   "group": "flavour",
   "tier": 3,
   "top": [
    {
     "en": "Beta-phellandrene",
     "cn": "β-水芹烯",
     "pi": 0.8,
     "rho": 0.23,
     "relaxed": false
    },
    {
     "en": "Epicubenol",
     "cn": "表库贝醇",
     "pi": 0.8,
     "rho": 0.13,
     "relaxed": false
    },
    {
     "en": "E-β-ionone",
     "cn": "E-β-紫罗兰酮",
     "pi": 0.58,
     "rho": 0.05,
     "relaxed": true
    }
   ]
  },
  {
   "id": "acidity",
   "cn": "酸度",
   "group": "other",
   "tier": 1,
   "top": [
    {
     "en": "Acetic acid",
     "cn": "乙酸",
     "pi": 0.95,
     "rho": 0.42,
     "relaxed": false
    },
    {
     "en": "Isoamyl acetate",
     "cn": "乙酸异戊酯",
     "pi": 0.91,
     "rho": 0.37,
     "relaxed": false
    },
    {
     "en": "Lactic acid",
     "cn": "乳酸",
     "pi": 1.0,
     "rho": 0.32,
     "relaxed": false
    }
   ]
  },
  {
   "id": "bitternes",
   "cn": "苦度",
   "group": "other",
   "tier": 1,
   "top": [
    {
     "en": "Iso-alpha acids",
     "cn": "异α-酸",
     "pi": 0.98,
     "rho": 0.68,
     "relaxed": false
    },
    {
     "en": "Cis-dihydro-β-terpineol",
     "cn": "二氢-β-松油醇",
     "pi": 0.88,
     "rho": 0.59,
     "relaxed": false
    },
    {
     "en": "Ethyl octanoate",
     "cn": "辛酸乙酯",
     "pi": 0.99,
     "rho": 0.59,
     "relaxed": false
    }
   ]
  },
  {
   "id": "sweetness",
   "cn": "甜度",
   "group": "other",
   "tier": 2,
   "top": [
    {
     "en": "Ethyl decanoate",
     "cn": "癸酸乙酯",
     "pi": 0.6,
     "rho": 0.39,
     "relaxed": false
    },
    {
     "en": "Iron",
     "cn": "铁",
     "pi": 0.82,
     "rho": 0.36,
     "relaxed": false
    },
    {
     "en": "Ethyl octanoate",
     "cn": "辛酸乙酯",
     "pi": 0.61,
     "rho": 0.29,
     "relaxed": false
    }
   ]
  },
  {
   "id": "X4vg",
   "cn": "4-乙烯基愈创木酚",
   "group": "other",
   "tier": 1,
   "top": [
    {
     "en": "4-vinylguaiacol",
     "cn": "4-乙烯基愈创木酚",
     "pi": 1.0,
     "rho": 0.49,
     "relaxed": false
    },
    {
     "en": "Neryl formate",
     "cn": "甲酸橙花酯",
     "pi": 0.5,
     "rho": 0.38,
     "relaxed": true
    },
    {
     "en": "Isopentyl butanoate",
     "cn": "丁酸异戊酯",
     "pi": 0.61,
     "rho": 0.14,
     "relaxed": false
    }
   ]
  },
  {
   "id": "diacetyl",
   "cn": "双乙酰",
   "group": "other",
   "tier": 2,
   "top": [
    {
     "en": "Eugenol",
     "cn": "丁香酚",
     "pi": 0.92,
     "rho": 0.32,
     "relaxed": false
    },
    {
     "en": "Furfural",
     "cn": "糠醛",
     "pi": 0.47,
     "rho": 0.25,
     "relaxed": true
    },
    {
     "en": "Beta-phellandrene",
     "cn": "β-水芹烯",
     "pi": 0.75,
     "rho": 0.23,
     "relaxed": false
    }
   ]
  },
  {
   "id": "dms",
   "cn": "二甲基硫",
   "group": "other",
   "tier": 3,
   "top": [
    {
     "en": "Caryophylla-4,8-dien-5-ol",
     "cn": "石竹烯-4,8-二烯-5-醇",
     "pi": 0.68,
     "rho": 0.17,
     "relaxed": false
    },
    {
     "en": "E,E-2,4-decadienal",
     "cn": "E,E-2,4-癸二烯醛",
     "pi": 0.36,
     "rho": 0.16,
     "relaxed": true
    },
    {
     "en": "Amyl acetate",
     "cn": "乙酸戊酯",
     "pi": 0.36,
     "rho": 0.16,
     "relaxed": true
    }
   ]
  },
  {
   "id": "metallic",
   "cn": "金属感",
   "group": "other",
   "tier": 3,
   "top": [
    {
     "en": "Iron",
     "cn": "铁",
     "pi": 0.99,
     "rho": 0.24,
     "relaxed": false
    },
    {
     "en": "Ethyl 3-methylbutyrate",
     "cn": "3-甲基丁酸乙酯",
     "pi": 0.91,
     "rho": 0.23,
     "relaxed": false
    },
    {
     "en": "Isopentyl butanoate",
     "cn": "丁酸异戊酯",
     "pi": 0.73,
     "rho": 0.22,
     "relaxed": false
    }
   ]
  },
  {
   "id": "stale_hops",
   "cn": "陈旧酒花",
   "group": "other",
   "tier": 3,
   "top": [
    {
     "en": "Gamma-eudesmol",
     "cn": "γ-桉叶醇",
     "pi": 0.69,
     "rho": 0.26,
     "relaxed": false
    },
    {
     "en": "E-ortho-methoxy cinnamaldehyde",
     "cn": "反式邻甲氧基肉桂醛",
     "pi": 0.79,
     "rho": 0.26,
     "relaxed": false
    },
    {
     "en": "Iron",
     "cn": "铁",
     "pi": 0.59,
     "rho": 0.13,
     "relaxed": true
    }
   ]
  },
  {
   "id": "t2n",
   "cn": "反式-2-壬烯醛",
   "group": "other",
   "tier": 3,
   "top": [
    {
     "en": "α-phellandrene",
     "cn": "α-水芹烯",
     "pi": 0.73,
     "rho": 0.21,
     "relaxed": false
    },
    {
     "en": "Glycerol",
     "cn": "甘油",
     "pi": 0.75,
     "rho": 0.18,
     "relaxed": false
    },
    {
     "en": "Cis-linalool oxide",
     "cn": "顺式里那醇氧化物",
     "pi": 0.62,
     "rho": 0.14,
     "relaxed": false
    }
   ]
  },
  {
   "id": "orange",
   "cn": "橙香",
   "group": "other",
   "tier": 2,
   "top": [
    {
     "en": "Ethyl linalool",
     "cn": "乙基里那醇",
     "pi": 0.77,
     "rho": 0.27,
     "relaxed": false
    },
    {
     "en": "Alpha-terpineol",
     "cn": "α-松油醇",
     "pi": 0.76,
     "rho": 0.21,
     "relaxed": false
    },
    {
     "en": "Z,Z-geranyl linalool",
     "cn": "Z,Z-香叶基里那醇",
     "pi": 0.67,
     "rho": 0.13,
     "relaxed": false
    }
   ]
  },
  {
   "id": "coriander",
   "cn": "芫荽",
   "group": "other",
   "tier": 3,
   "top": [
    {
     "en": "Terpinolene",
     "cn": "异松油烯",
     "pi": 0.6,
     "rho": 0.21,
     "relaxed": false
    },
    {
     "en": "Cis-β-terpineol",
     "cn": "顺式-β-松油醇",
     "pi": 0.65,
     "rho": 0.2,
     "relaxed": false
    },
    {
     "en": "Limonene",
     "cn": "柠檬烯",
     "pi": 0.71,
     "rho": 0.15,
     "relaxed": false
    }
   ]
  },
  {
   "id": "clove",
   "cn": "丁香",
   "group": "other",
   "tier": 3,
   "top": [
    {
     "en": "Limonene",
     "cn": "柠檬烯",
     "pi": 0.86,
     "rho": 0.26,
     "relaxed": false
    },
    {
     "en": "Eucalyptol",
     "cn": "桉叶油醇",
     "pi": 0.73,
     "rho": 0.26,
     "relaxed": false
    },
    {
     "en": "Linalool",
     "cn": "里那醇",
     "pi": 0.62,
     "rho": 0.14,
     "relaxed": false
    }
   ]
  },
  {
   "id": "lactic",
   "cn": "乳酸感",
   "group": "other",
   "tier": 1,
   "top": [
    {
     "en": "Lactic acid",
     "cn": "乳酸",
     "pi": 1.0,
     "rho": 0.45,
     "relaxed": false
    },
    {
     "en": "Acetic acid",
     "cn": "乙酸",
     "pi": 0.89,
     "rho": 0.41,
     "relaxed": false
    },
    {
     "en": "Isoamyl acetate",
     "cn": "乙酸异戊酯",
     "pi": 0.97,
     "rho": 0.41,
     "relaxed": false
    }
   ]
  },
  {
   "id": "acetic",
   "cn": "乙酸感",
   "group": "other",
   "tier": 2,
   "top": [
    {
     "en": "Acetic acid",
     "cn": "乙酸",
     "pi": 0.96,
     "rho": 0.36,
     "relaxed": false
    },
    {
     "en": "Lactic acid",
     "cn": "乳酸",
     "pi": 1.0,
     "rho": 0.35,
     "relaxed": false
    },
    {
     "en": "Isoamyl acetate",
     "cn": "乙酸异戊酯",
     "pi": 0.8,
     "rho": 0.3,
     "relaxed": false
    }
   ]
  },
  {
   "id": "barnyard",
   "cn": "马厩味",
   "group": "other",
   "tier": 2,
   "top": [
    {
     "en": "Gamma-eudesmol",
     "cn": "γ-桉叶醇",
     "pi": 0.8,
     "rho": 0.27,
     "relaxed": false
    },
    {
     "en": "E-ortho-methoxy cinnamaldehyde",
     "cn": "反式邻甲氧基肉桂醛",
     "pi": 0.66,
     "rho": 0.23,
     "relaxed": false
    },
    {
     "en": "Epicubenol",
     "cn": "表库贝醇",
     "pi": 0.43,
     "rho": 0.23,
     "relaxed": true
    }
   ]
  },
  {
   "id": "alcohol",
   "cn": "酒精感",
   "group": "other",
   "tier": 1,
   "top": [
    {
     "en": "Ethanol",
     "cn": "Ethanol",
     "pi": 0.92,
     "rho": 0.82,
     "relaxed": false
    },
    {
     "en": "Ethyl octanoate",
     "cn": "辛酸乙酯",
     "pi": 0.92,
     "rho": 0.62,
     "relaxed": false
    },
    {
     "en": "Acetaldehyde",
     "cn": "乙醛",
     "pi": 0.99,
     "rho": 0.6,
     "relaxed": false
    }
   ]
  },
  {
   "id": "aftertaste",
   "cn": "回味",
   "group": "other",
   "tier": 1,
   "top": [
    {
     "en": "Ethanol",
     "cn": "Ethanol",
     "pi": 0.81,
     "rho": 0.52,
     "relaxed": false
    },
    {
     "en": "Cis-dihydro-β-terpineol",
     "cn": "二氢-β-松油醇",
     "pi": 0.78,
     "rho": 0.51,
     "relaxed": false
    },
    {
     "en": "Ethyl octanoate",
     "cn": "辛酸乙酯",
     "pi": 0.88,
     "rho": 0.51,
     "relaxed": false
    }
   ]
  },
  {
   "id": "body",
   "cn": "酒体",
   "group": "other",
   "tier": 1,
   "top": [
    {
     "en": "Glycerol",
     "cn": "甘油",
     "pi": 0.89,
     "rho": 0.57,
     "relaxed": false
    },
    {
     "en": "3-methyl-2-hexanol",
     "cn": "3-甲基-2-己醇",
     "pi": 0.86,
     "rho": 0.55,
     "relaxed": false
    },
    {
     "en": "Ethyl octanoate",
     "cn": "辛酸乙酯",
     "pi": 0.76,
     "rho": 0.53,
     "relaxed": false
    }
   ]
  },
  {
   "id": "co2",
   "cn": "二氧化碳感",
   "group": "other",
   "tier": 1,
   "top": [
    {
     "en": "Ethyl octanoate",
     "cn": "辛酸乙酯",
     "pi": 0.86,
     "rho": 0.55,
     "relaxed": false
    },
    {
     "en": "Carbon dioxide",
     "cn": "二氧化碳",
     "pi": 0.72,
     "rho": 0.48,
     "relaxed": false
    },
    {
     "en": "3-methyl-2-hexanol",
     "cn": "3-甲基-2-己醇",
     "pi": 0.82,
     "rho": 0.42,
     "relaxed": false
    }
   ]
  },
  {
   "id": "overall",
   "cn": "总体印象",
   "group": "other",
   "tier": 2,
   "top": [
    {
     "en": "Ethyl acetate",
     "cn": "乙酸乙酯",
     "pi": 0.78,
     "rho": 0.33,
     "relaxed": false
    },
    {
     "en": "2-butyl octanoate",
     "cn": "2-丁基辛酸酯",
     "pi": 0.76,
     "rho": 0.23,
     "relaxed": false
    },
    {
     "en": "Styrene",
     "cn": "苯乙烯",
     "pi": 0.65,
     "rho": 0.19,
     "relaxed": false
    }
   ]
  }
 ],
 "paper": {
  "facts": [
   {
    "k": "风格样本极少且极不均衡",
    "v": "22 种风格，Faro 3 例、Brut 4 例、Kriek 10 例、Lambic 11 例、Pils/Lager 11 例，最大类 Blond 31 例"
   },
   {
    "k": "风格可分但重叠严重",
    "v": "22 类留出准确率 0.512（多数类仅 0.124）；Tripel 对 Pils/Lager 的二分类达 0.974"
   },
   {
    "k": "缺失以“原子”形态出现",
    "v": "13.6% 的单元格为左删失；4VG 有 67.2% 的样本落在同一原子值"
   },
   {
    "k": "缺陷阈值低于数据基率",
    "v": "DMS 阈值 19 µg/L 低于中位数 24.2 µg/L；Diacetyl 阈值 0.09 mg/L 低于中位数 0.285 mg/L"
   },
   {
    "k": "源与目标沿一条轴分离",
    "v": "沿 Tripel–Pils/Lager 方向投影：源中位 −8.78，目标中位 +2.79，目标 10% 分位 +1.25"
   }
  ],
  "network": {
   "edges": 602,
   "density": 0.024,
   "Q": 0.5874,
   "randomQ": [
    -0.0092,
    0.0127
   ],
   "within": 0.347,
   "cross": 0.157,
   "isolates": 51,
   "modules": 6
  },
  "axes": {
   "tripel": {
    "target": "Tripel",
    "n": 28,
    "axis_len": 9.27,
    "src_median": -8.78,
    "tgt_p10": 1.25,
    "tgt_median": 2.79,
    "shift": 11.57
   },
   "kriek": {
    "target": "Kriek",
    "n": 10,
    "axis_len": 12.15,
    "src_median": -6.5,
    "tgt_p10": 5.43,
    "tgt_median": 9.07,
    "shift": 15.57
   },
   "lambic": {
    "target": "Lambic",
    "n": 11,
    "axis_len": 11.44,
    "src_median": -6.84,
    "tgt_p10": 3.51,
    "tgt_median": 7.95,
    "shift": 14.79
   }
  },
  "tripel": {
   "moved": 11.74,
   "nonzero": 216,
   "above05": 93,
   "defect_cost": 1.3,
   "p_before": 0.384,
   "p_after": 0.364,
   "core80": 97,
   "source_mix": [
    [
     "酵母代谢产物",
     49.0
    ],
    [
     "酒花萜烯",
     26.1
    ],
    [
     "麦芽来源",
     7.6
    ],
    [
     "香料类",
     5.8
    ],
    [
     "野生菌群",
     3.7
    ]
   ],
   "axis_components": [
    [
     "乙酸乙酯",
     0.219
    ],
    [
     "乙醇",
     0.19
    ],
    [
     "异戊醇",
     0.159
    ],
    [
     "色度",
     0.115
    ],
    [
     "4-乙烯基愈创木酚",
     -0.001
    ],
    [
     "苯乙醇",
     -0.025
    ]
   ],
   "shifts": [
    [
     "乙酸乙酯",
     "Ethyl acetate",
     "酵母",
     2.48,
     2.1
    ],
    [
     "乙醇",
     "Ethanol",
     "酵母",
     2.15,
     3.9
    ],
    [
     "甘油",
     "Glycerol",
     "酵母",
     2.08,
     5.6
    ],
    [
     "乳酸",
     "Lactic acid",
     "野生菌群",
     1.95,
     7.3
    ],
    [
     "乙酸异丁酯",
     "Isobutyl acetate",
     "酵母",
     1.94,
     8.9
    ],
    [
     "己酸乙酯",
     "Ethyl hexanoate",
     "酵母",
     1.89,
     10.5
    ]
   ],
   "sparse": [
    [
     0,
     216,
     93,
     11.74
    ],
    [
     0.02,
     208,
     89,
     11.74
    ],
    [
     0.05,
     199,
     85,
     11.75
    ],
    [
     0.1,
     185,
     81,
     11.78
    ],
    [
     0.2,
     167,
     75,
     11.85
    ],
    [
     0.3,
     150,
     72,
     11.96
    ]
   ]
  },
  "generation": {
   "fidelity": 0.766,
   "coverage": 0.991,
   "ks": 0.409,
   "k_used": 10,
   "shape_corr": 0.827,
   "recall": 0.523,
   "baseline_resample": 0.998
  },
  "markers": [
   [
    "4VG",
    "Wheat",
    "Wheat",
    0.758
   ],
   [
    "乙酸乙酯",
    "Strong ale",
    "Strong ale",
    0.942
   ],
   [
    "乙酸苯乙酯",
    "Strong ale",
    "Strong ale",
    0.93
   ],
   [
    "异戊醇",
    "Brut",
    "Brut",
    0.973
   ],
   [
    "里那醇",
    "Wheat",
    "Wheat",
    0.922
   ],
   [
    "香叶醇",
    "Hoppy",
    "Hoppy",
    0.918
   ],
   [
    "乳酸",
    "Lambic",
    "Lambic",
    0.972
   ],
   [
    "乙酸",
    "Lambic",
    "West Flanders ale",
    0.944
   ]
  ]
 }
};
