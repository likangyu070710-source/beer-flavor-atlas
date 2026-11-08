/* ============================================================
   小白模式的「原料」对照表
   一个化合物对应一样厨房里能找到的东西，名称与说明都写给不懂化学的人。
   结构：window.BEER_INGREDIENTS = { families, items }
   - items[id] 的 id 与 data/flavor-data.js 的 compounds[].id 一一对应
   - 没有对应项的化合物回退到化合物原名（见 app.js 的 ing()）
   ============================================================ */
window.BEER_INGREDIENTS = {
  families: {
    yeast: { cn: "发酵出来的", en: "From fermentation" },
    hop: { cn: "酒花与花草", en: "Hops, herbs & flowers" },
    malt: { cn: "麦芽与烘烤", en: "Malt & toast" },
    phenol: { cn: "香料与烟熏", en: "Spice & smoke" },
    wild: { cn: "酸与野菌", en: "Sour & wild" },
    other: { cn: "其他", en: "Other" },
  },
  items: {
    ethanol: {
      cn: "酒精", en: "Alcohol", emoji: "🍶",
      note: "酒精本身的味道，撑起酒体，也带来一点灼热感。",
      noteEn: "The taste of alcohol itself: body, warmth, a little burn.",
    },
    ethyl_acetate: {
      cn: "熟苹果", en: "Ripe apple", emoji: "🍎",
      note: "熟苹果一样的果香，量太大会转向洗甲水。",
      noteEn: "Ripe-apple fruitiness; too much turns nail-polish sharp.",
    },
    isoamyl_acetate: {
      cn: "香蕉", en: "Banana", emoji: "🍌",
      note: "香蕉糖的甜香，啤酒里最常见的果香。",
      noteEn: "Banana-sweet, the most common fruity note in beer.",
    },
    isobutyl_acetate: {
      cn: "樱桃", en: "Cherry", emoji: "🍒",
      note: "樱桃与红浆果的甜香。",
      noteEn: "Sweet cherry and red berries.",
    },
    ethyl_hexanoate: {
      cn: "菠萝", en: "Pineapple", emoji: "🍍",
      note: "菠萝与青苹果的清香。",
      noteEn: "Pineapple and green apple.",
    },
    ethyl_octanoate: {
      cn: "桃子", en: "Peach", emoji: "🍑",
      note: "桃子、杏子一样的熟果香。",
      noteEn: "Ripe peach and apricot.",
    },
    ethyl_decanoate: {
      cn: "葡萄", en: "Grape", emoji: "🍇",
      note: "葡萄和白兰地式的圆润果香。",
      noteEn: "Round grape and brandy-like fruit.",
    },
    phenethyl_acetate: {
      cn: "玫瑰", en: "Rose", emoji: "🌹",
      note: "玫瑰花瓣的甜香。",
      noteEn: "Sweet rose petals.",
    },
    phenethyl_alcohol: {
      cn: "橙花", en: "Orange blossom", emoji: "🌸",
      note: "玫瑰与橙花混合的花香。",
      noteEn: "Rose and orange blossom together.",
    },
    isoamyl_alcohol: {
      cn: "杂醇", en: "Fusel spirit", emoji: "🥃",
      note: "高度酒那种冲的杂醇味，多了会盖住香气。",
      noteEn: "Fusel, spirit-like; in excess it buries the aroma.",
    },
    isobutanol: {
      cn: "溶剂", en: "Solvent", emoji: "🧴",
      note: "一点溶剂味，少量时反而是酒体的骨架。",
      noteEn: "A solvent note that gives body when faint.",
    },
    mb2: {
      cn: "红酒", en: "Red wine", emoji: "🍷",
      note: "葡萄酒似的杂醇香。",
      noteEn: "Wine-like higher alcohols.",
    },
    glycerol: {
      cn: "糖浆", en: "Syrup", emoji: "🍯",
      note: "糖浆般的圆润口感，让酒更顺。",
      noteEn: "Syrupy roundness that smooths the palate.",
    },
    diacetyl: {
      cn: "黄油", en: "Butter", emoji: "🧈",
      note: "黄油与爆米花的甜腻味，少量像奶糖，多了腻。",
      noteEn: "Butter and butterscotch: creamy in traces, cloying in excess.",
    },
    acetaldehyde: {
      cn: "青苹果皮", en: "Green apple skin", emoji: "🍏",
      note: "青苹果皮与生南瓜的青味。",
      noteEn: "Green-apple skin and raw pumpkin.",
    },
    ethyl_propionate: {
      cn: "热带水果", en: "Tropical fruit", emoji: "🥭",
      note: "熟透热带水果的甜香。",
      noteEn: "Ripe tropical fruit.",
    },
    hexyl_acetate: {
      cn: "梨", en: "Pear", emoji: "🍐",
      note: "梨与苹果的清香。",
      noteEn: "Pear and apple.",
    },
    amyl_acetate: {
      cn: "水果糖", en: "Fruit candy", emoji: "🍬",
      note: "糖果一样的甜果香。",
      noteEn: "Candy-like fruit sweetness.",
    },
    isopentyl_butanoate: {
      cn: "杏子", en: "Apricot", emoji: "🧁",
      note: "杏子与香蕉的混合甜香。",
      noteEn: "Apricot and banana.",
    },
    ethyl_isobutyrate: {
      cn: "水果糖浆", en: "Fruit syrup", emoji: "🍹",
      note: "菠萝味水果糖的香气。",
      noteEn: "Pineapple candy.",
    },
    octenol: {
      cn: "蘑菇", en: "Mushroom", emoji: "🍄",
      note: "蘑菇与湿泥土的鲜味。",
      noteEn: "Mushroom and damp earth.",
    },
    lactic_acid: {
      cn: "酸奶", en: "Yogurt", emoji: "🥛",
      note: "酸奶一样柔和的酸味。",
      noteEn: "Soft, yogurt-like acidity.",
    },
    octanoic_acid: {
      cn: "奶酪", en: "Cheese", emoji: "🧀",
      note: "奶酪与一点皂感的脂肪酸味。",
      noteEn: "Cheesy, slightly soapy fatty acid.",
    },
    iso_alpha: {
      cn: "啤酒花", en: "Hops", emoji: "🌿",
      note: "啤酒苦味的主要来源。",
      noteEn: "The main source of hop bitterness.",
    },
    linalool: {
      cn: "薰衣草", en: "Lavender", emoji: "💜",
      note: "薰衣草与柑橘的花香。",
      noteEn: "Lavender and citrus.",
    },
    geraniol: {
      cn: "柠檬草", en: "Lemongrass", emoji: "🍋",
      note: "柠檬草与天竺葵的香气。",
      noteEn: "Lemongrass and geranium.",
    },
    citronellol: {
      cn: "香茅", en: "Citronella", emoji: "🌾",
      note: "香茅与玫瑰的清新香气。",
      noteEn: "Fresh citronella and rose.",
    },
    nerol: {
      cn: "橙花蜜", en: "Neroli", emoji: "🌼",
      note: "橙花的清甜。",
      noteEn: "Clean orange-blossom sweetness.",
    },
    cdbt: {
      cn: "松针", en: "Pine needle", emoji: "🌲",
      note: "松针与树脂的清凉。",
      noteEn: "Pine needle and resin.",
    },
    beta_phellandrene: {
      cn: "柑橘皮", en: "Citrus peel", emoji: "🍊",
      note: "柑橘皮与胡椒的辛香。",
      noteEn: "Citrus peel and pepper.",
    },
    alpha_terpineol: {
      cn: "松木", en: "Pine wood", emoji: "🌳",
      note: "松木与丁香的香气。",
      noteEn: "Pine wood and clove.",
    },
    terpinen_4_ol: {
      cn: "湿木头", en: "Wet wood", emoji: "🌧️",
      note: "湿木头与泥土的气息。",
      noteEn: "Wet wood and earth.",
    },
    beta_caryophyllene: {
      cn: "黑胡椒", en: "Black pepper", emoji: "🌶️",
      note: "黑胡椒与丁香的辛香。",
      noteEn: "Black pepper and clove.",
    },
    z_farnesene: {
      cn: "苹果皮", en: "Apple peel", emoji: "🫒",
      note: "青苹果皮与草木的清香。",
      noteEn: "Green apple peel and greenery.",
    },
    farnesol: {
      cn: "接骨木花", en: "Elderflower", emoji: "🏵️",
      note: "接骨木花与蜂蜜的花香。",
      noteEn: "Elderflower and honey.",
    },
    nerolidol: {
      cn: "檀木", en: "Sandalwood", emoji: "🍂",
      note: "檀木与花香的尾韵。",
      noteEn: "Sandalwood and floral depth.",
    },
    furfural: {
      cn: "烤面包", en: "Toast", emoji: "🍞",
      note: "烤面包与焦糖的香气。",
      noteEn: "Toast and caramel.",
    },
    methylpyrazine: {
      cn: "烤坚果", en: "Roasted nuts", emoji: "☕",
      note: "烤坚果与咖啡的焦香。",
      noteEn: "Roasted nuts and coffee.",
    },
    ethyl_furoate: {
      cn: "太妃糖", en: "Toffee", emoji: "🍮",
      note: "太妃糖与焦糖的甜香。",
      noteEn: "Toffee and caramel.",
    },
    furfuryl_alcohol: {
      cn: "烤木头", en: "Charred wood", emoji: "🪵",
      note: "烤木头与焦苦味。",
      noteEn: "Charred wood and burnt sugar.",
    },
    phenylacetaldehyde: {
      cn: "蜂蜜", en: "Honey", emoji: "🌺",
      note: "蜂蜜与玫瑰的甜香。",
      noteEn: "Honey and rose.",
    },
    methanethiol: {
      cn: "煮卷心菜", en: "Boiled cabbage", emoji: "🥬",
      note: "煮卷心菜的硫味，极微量就能闻到。",
      noteEn: "Cooked-cabbage sulfur; potent even in traces.",
    },
    dms: {
      cn: "煮玉米", en: "Sweetcorn", emoji: "🌽",
      note: "煮玉米与蔬菜的甜味。",
      noteEn: "Cooked sweetcorn and vegetables.",
    },
    benzaldehyde: {
      cn: "杏仁", en: "Almond", emoji: "🌰",
      note: "杏仁与樱桃核的香气。",
      noteEn: "Almond and cherry stone.",
    },
    e_alpha_ionone: {
      cn: "紫罗兰", en: "Violet", emoji: "🫐",
      note: "紫罗兰与覆盆子的花香。",
      noteEn: "Violet and raspberry.",
    },
    e_beta_ionone: {
      cn: "鸢尾根", en: "Iris root", emoji: "💐",
      note: "紫罗兰与木质的干花香。",
      noteEn: "Dry violet and wood.",
    },
    "4vg": {
      cn: "烟熏丁香", en: "Smoked clove", emoji: "💨",
      note: "烟熏与丁香的香料味，德式小麦啤酒的标志。",
      noteEn: "Smoke and clove, the mark of a wheat beer.",
    },
    "4eg": {
      cn: "烟熏木屑", en: "Smoked woodchip", emoji: "🥓",
      note: "烟熏与木质的香料味。",
      noteEn: "Smoke and wood spice.",
    },
    "4ep": {
      cn: "皮革", en: "Leather", emoji: "🧤",
      note: "皮革与马厩的野味。",
      noteEn: "Leather and barnyard.",
    },
    eugenol: {
      cn: "丁香", en: "Clove", emoji: "🪵",
      note: "丁香与暖香料的辛香。",
      noteEn: "Clove and warm spice.",
    },
    guaiacol: {
      cn: "篝火烟", en: "Campfire smoke", emoji: "🏕️",
      note: "烟熏与一点药水的气息。",
      noteEn: "Smoke with a medicinal edge.",
    },
    co2: {
      cn: "气泡水", en: "Sparkling water", emoji: "🫧",
      note: "气泡带来的杀口感。",
      noteEn: "The prickle of carbonation.",
    },
    so2: {
      cn: "火柴头", en: "Match head", emoji: "🧨",
      note: "火柴头一样的硫味。",
      noteEn: "Match-head sulfur.",
    },
    iron: {
      cn: "铁锈", en: "Rust", emoji: "🔩",
      note: "铁锈与血腥味。",
      noteEn: "Rust and blood.",
    },
    t2n: {
      cn: "旧纸板", en: "Old cardboard", emoji: "📦",
      note: "纸板与氧化后的陈味。",
      noteEn: "Cardboard and stale oxidation.",
    },
  },
};
