/**
 * NOIRÉ HAIR — 搜索结果页逻辑
 */
(function () {
  'use strict';

  var state = {
    keyword: '',
    scope: 'all',
    sort: 'recommend',
    filters: {},
    page: 1,
    pageSize: 12,
    allProducts: []
  };

  // 演示数据：商品（含 category 字段，与一级导航栏的假发/接发/配件分类对应）
  var MOCK_PRODUCTS = [
    // ---- 假发 ----
    { id: 1, category: 'wig', name: 'HD蕾丝大波浪假发 22英寸', spec: '22英寸 | 自然黑 | HD蕾丝', price: 2299, sales: 1234, rating: 5, isNew: true, image: 'images/m1.png', type: 'hdLace', texture: 'bodyWave', length: '20-24', color: 'natural-black', craft: 'hd-lace' },
    { id: 2, category: 'wig', name: '奢华深波浪全蕾丝假发 22英寸', spec: '22英寸 | 自然黑 | 手工钩织', price: 2499, sales: 987, rating: 5, isHot: true, image: 'images/m2.png', type: 'fullLace', texture: 'deepCurl', length: '20-24', color: 'natural-black', craft: 'handmade' },
    { id: 3, category: 'wig', name: '自然黑大波浪 Closure 假发 20英寸', spec: '20英寸 | 自然黑 | 预拔发际线', price: 1999, sales: 756, rating: 4, isNew: true, image: 'images/m3.png', type: 'closure', texture: 'bodyWave', length: '20-24', color: 'natural-black', craft: 'pre-plucked' },
    { id: 4, category: 'wig', name: '蜂蜜棕蕾丝前额假发 22英寸', spec: '22英寸 | 蜂蜜棕 | 预拔发际线', price: 2399, sales: 642, rating: 5, image: 'images/m4.png', type: 'laceFront', texture: 'bodyWave', length: '20-24', color: 'honey', craft: 'pre-plucked' },
    { id: 5, category: 'wig', name: '无胶大波浪真人发假发 24英寸', spec: '24英寸 | 自然黑 | 预拔发际线', price: 2799, sales: 1102, rating: 5, isHot: true, image: 'images/m5.png', type: 'noGlue', texture: 'bodyWave', length: '20-24', color: 'natural-black', craft: 'pre-plucked' },
    { id: 6, category: 'wig', name: '深棕色大波浪 HD 假发 22英寸', spec: '22英寸 | 深棕色 | HD蕾丝', price: 2199, sales: 534, rating: 4, image: 'images/m6.png', type: 'hdLace', texture: 'bodyWave', length: '20-24', color: 'dark-brown', craft: 'hd-lace' },
    { id: 7, category: 'wig', name: 'HD 蕾丝大波浪假发 20英寸', spec: '20英寸 | 自然黑 | HD蕾丝', price: 2299, sales: 1008, rating: 5, isNew: true, image: 'images/m7.png', type: 'hdLace', texture: 'bodyWave', length: '20-24', color: 'natural-black', craft: 'hd-lace' },
    { id: 8, category: 'wig', name: '巧克力棕大波浪 Closure 假发 22英寸', spec: '22英寸 | 巧克力棕 | 手工钩织', price: 2299, sales: 689, rating: 4, image: 'images/m8.png', type: 'closure', texture: 'bodyWave', length: '20-24', color: 'chocolate', craft: 'handmade' },
    { id: 9, category: 'wig', name: '金色长直发全蕾丝假发 24英寸', spec: '24英寸 | 金色 | 预拔发际线', price: 2099, sales: 445, rating: 4, image: 'images/xinpinzhuti.png', type: 'fullLace', texture: 'straight', length: '20-24', color: 'golden', craft: 'pre-plucked' },
    { id: 10, category: 'wig', name: '挑染色水波纹蕾丝前额 22英寸', spec: '22英寸 | 挑染色 | HD蕾丝', price: 2599, sales: 312, rating: 5, image: 'images/xilie.png', type: 'laceFront', texture: 'waterWave', length: '20-24', color: 'ombre', craft: 'hd-lace' },
    { id: 11, category: 'wig', name: '自然卷短发波波头 12英寸', spec: '12英寸 | 自然黑 | 预拔发际线', price: 1299, sales: 289, rating: 4, image: 'images/category-wig.png', type: 'closure', texture: 'naturalCurl', length: '8-12', color: 'natural-black', craft: 'pre-plucked' },
    { id: 12, category: 'wig', name: '深波浪 HD 假发 14英寸', spec: '14英寸 | 深棕色 | HD蕾丝', price: 1599, sales: 678, rating: 5, isHot: true, image: 'images/category-extension.png', type: 'hdLace', texture: 'deepCurl', length: '14-18', color: 'dark-brown', craft: 'hd-lace' },
    { id: 13, category: 'wig', name: '无胶直发假发 18英寸', spec: '18英寸 | 自然黑 | 手工钩织', price: 1899, sales: 521, rating: 4, image: 'images/category-topper.png', type: 'noGlue', texture: 'straight', length: '14-18', color: 'natural-black', craft: 'handmade' },
    { id: 14, category: 'wig', name: '全蕾丝长卷发 26英寸', spec: '26英寸 | 巧克力棕 | 手工钩织', price: 3199, sales: 233, rating: 5, image: 'images/hero-model.png', type: 'fullLace', texture: 'looseWave', length: '26-30', color: 'chocolate', craft: 'handmade' },
    { id: 15, category: 'wig', name: 'Closure 深波浪假发 20英寸', spec: '20英寸 | 蜂蜜棕 | 预拔发际线', price: 1999, sales: 412, rating: 4, image: 'images/hero-model-2.png', type: 'closure', texture: 'deepCurl', length: '20-24', color: 'honey', craft: 'pre-plucked' },
    { id: 16, category: 'wig', name: 'HD 蕾丝前额头套 24英寸', spec: '24英寸 | 自然黑 | HD蕾丝', price: 2699, sales: 876, rating: 5, isHot: true, image: 'images/hero-model-3.png', type: 'laceFront', texture: 'bodyWave', length: '20-24', color: 'natural-black', craft: 'hd-lace' },
    { id: 17, category: 'wig', name: '35英寸超长直发全蕾丝假发', spec: '36英寸 | 自然黑 | 手工钩织', price: 3599, sales: 156, rating: 5, image: 'images/jiafa.png', type: 'fullLace', texture: 'straight', length: '32-99', color: 'natural-black', craft: 'handmade' },
    { id: 18, category: 'wig', name: '32英寸大波浪 HD 假发', spec: '32英寸 | 深棕色 | 预拔发际线', price: 2899, sales: 198, rating: 4, image: 'images/jiefa.png', type: 'hdLace', texture: 'bodyWave', length: '32-99', color: 'dark-brown', craft: 'pre-plucked' },
    { id: 19, category: 'wig', name: '金色大波浪 Closure 假发 22英寸', spec: '22英寸 | 金色 | 预拔发际线', price: 2399, sales: 367, rating: 4, image: 'images/chocolate-brown.png', type: 'closure', texture: 'bodyWave', length: '20-24', color: 'golden', craft: 'pre-plucked' },
    { id: 20, category: 'wig', name: '巧克力棕水波纹蕾丝前额 20英寸', spec: '20英寸 | 巧克力棕 | HD蕾丝', price: 2199, sales: 298, rating: 5, image: 'images/pinpai.png', type: 'laceFront', texture: 'waterWave', length: '20-24', color: 'chocolate', craft: 'hd-lace' },
    { id: 21, category: 'wig', name: '自然黑松散波浪无胶假发 18英寸', spec: '18英寸 | 自然黑 | 预拔发际线', price: 1799, sales: 543, rating: 4, image: 'images/peijian.png', type: 'noGlue', texture: 'looseWave', length: '14-18', color: 'natural-black', craft: 'pre-plucked' },
    { id: 22, category: 'wig', name: '蜂蜜棕长直发全蕾丝假发 24英寸', spec: '24英寸 | 蜂蜜棕 | 手工钩织', price: 2099, sales: 478, rating: 5, image: 'images/xinpinzhuti.png', type: 'fullLace', texture: 'straight', length: '20-24', color: 'honey', craft: 'handmade' },
    { id: 23, category: 'wig', name: '挑染色深波浪 HD 假发 22英寸', spec: '22英寸 | 挑染色 | HD蕾丝', price: 2699, sales: 215, rating: 5, image: 'images/xilie.png', type: 'hdLace', texture: 'deepCurl', length: '20-24', color: 'ombre', craft: 'hd-lace' },
    { id: 24, category: 'wig', name: '黑色短发波波头 10英寸', spec: '10英寸 | 自然黑 | 预拔发际线', price: 999, sales: 892, rating: 4, isHot: true, image: 'images/category-wig.png', type: 'closure', texture: 'straight', length: '8-12', color: 'natural-black', craft: 'pre-plucked' },

    // ---- 接发 ----
    { id: 101, category: 'extension', name: '夹片接发 大波浪 20英寸', spec: '20英寸 | 自然黑 | 夹片安装', price: 899, sales: 521, rating: 5, isNew: true, image: 'images/m1.png', install: 'clipIn', texture: 'extBigWave', length: '18-20', color: 'extNaturalBlack' },
    { id: 102, category: 'extension', name: '贴片接发 直发 22英寸', spec: '22英寸 | 巧克力棕 | 贴片安装', price: 1099, sales: 433, rating: 4, image: 'images/m2.png', install: 'tapeIn', texture: 'extStraight', length: '22-24', color: 'extChocolateBrown' },
    { id: 103, category: 'extension', name: '手绑接发 水波纹 24英寸', spec: '24英寸 | 蜂蜜棕 | 手绑', price: 1399, sales: 312, rating: 5, image: 'images/m3.png', install: 'handTied', texture: 'extWaterWave', length: '22-24', color: 'extHoneyBrown' },
    { id: 104, category: 'extension', name: '微环接发 松散波浪 18英寸', spec: '18英寸 | 自然黑 | 微环', price: 999, sales: 287, rating: 4, image: 'images/m4.png', install: 'microRing', texture: 'extLooseWave', length: '18-20', color: 'extNaturalBlack' },
    { id: 105, category: 'extension', name: 'I-Tip 接发 深波浪 26英寸', spec: '26英寸 | 金色 | I-Tip', price: 1299, sales: 198, rating: 5, image: 'images/m5.png', install: 'iTip', texture: 'extDeepWave', length: '26-30', color: 'extGolden' },
    { id: 106, category: 'extension', name: 'U-Tip 接发 自然卷 22英寸', spec: '22英寸 | 深棕色 | U-Tip', price: 1199, sales: 256, rating: 4, image: 'images/m6.png', install: 'uTip', texture: 'extNaturalCurl', length: '22-24', color: 'extDarkBrown' },
    { id: 107, category: 'extension', name: '发帘接发 蓬松直发 24英寸', spec: '24英寸 | 挑染色 | 发帘', price: 949, sales: 341, rating: 4, image: 'images/m7.png', install: 'weft', texture: 'extVoluminous', length: '22-24', color: 'extHighlight' },

    // ---- 配件 ----
    { id: 201, category: 'accessory', name: '真丝假发帽 舒适透气', spec: '佩戴固定 | 真丝', price: 59, sales: 1023, rating: 5, isHot: true, image: 'images/peijian.png', fix: 'wigCap' },
    { id: 202, category: 'accessory', name: '假发固定带 防滑可调', spec: '佩戴固定 | 防滑', price: 39, sales: 876, rating: 4, image: 'images/peijian.png', fix: 'fixBand' },
    { id: 203, category: 'accessory', name: '假发专用梳 宽齿护理', spec: '造型工具 | 宽齿', price: 29, sales: 654, rating: 4, image: 'images/peijian.png', style: 'wideTooth' },
    { id: 204, category: 'accessory', name: '丝绸睡帽 护发助眠', spec: '睡眠保护 | 丝绸', price: 79, sales: 421, rating: 5, image: 'images/peijian.png', sleep: 'silkCap' },
    { id: 205, category: 'accessory', name: '折叠假发支架 便携收纳', spec: '收纳支撑 | 折叠', price: 99, sales: 512, rating: 4, image: 'images/peijian.png', store: 'foldable' },
    { id: 206, category: 'accessory', name: '接发钳 微环安装工具', spec: '接发工具 | 钳', price: 49, sales: 233, rating: 4, image: 'images/peijian.png', installtool: 'tweezers' },
    { id: 207, category: 'accessory', name: '边缘定型带 刘海固定', spec: '佩戴固定 | 定型', price: 35, sales: 388, rating: 5, image: 'images/peijian.png', fix: 'edgeBand' },
    { id: 208, category: 'accessory', name: '假发头模 展示收纳', spec: '收纳支撑 | 头模', price: 129, sales: 199, rating: 4, image: 'images/peijian.png', store: 'wigHead' }
  ];

  // 价格区间默认值
  var PRICE_MIN = 0;
  var PRICE_MAX = 6999;

  // 筛选显示名（标签统一引用，便于已选条件展示）
  var FILTER_LABELS = {
    type: { hdLace: 'HD蕾丝假发', noGlue: '无胶假发', laceFront: '蕾丝前额假发', closure: 'Closure假发', fullLace: '全蕾丝假发', upart: 'U-Part假发', vpart: 'V-Part假发' },
    texture: { straight: '直发', deepWave: '大波浪', looseWave: '松散波浪', deepCurl: '深波浪', bodyWave: '水波纹', naturalCurl: '自然卷', voluminous: '蓬松直发', smallCurl: '小卷发' },
    length: { '8-12': '8-12英寸', '14-18': '14-18英寸', '20-24': '20-24英寸', '26-30': '26-30英寸', '32-99': '32英寸以上' },
    color: { 'natural-black': '自然黑', 'dark-brown': '深棕色', chocolate: '巧克力棕', honey: '蜂蜜棕', golden: '金色', red: '红色系', highlight: '挑染色', ombre: '渐变色' },
    craft: { 'pre-plucked': '预拔发际线', 'hd-lace': 'HD蕾丝', handmade: '手工钩织' },
    other: { 'in-stock': '仅看有货' }
  };

  // 各分类左侧筛选配置（参考一级导航栏假发/接发/配件的二级、三级菜单）
  // 每个 group: { key, title, type: 'checkbox' | 'color', options: [{value,label}] }
  var FILTER_CONFIGS = {
    wig: [
      { key: 'type', title: '假发类型', type: 'checkbox', options: [
        { value: 'noGlue', label: '无胶假发' }, { value: 'hdLace', label: 'HD蕾丝假发' },
        { value: 'laceFront', label: '蕾丝前额假发' }, { value: 'closure', label: 'Closure假发' },
        { value: 'fullLace', label: '全蕾丝假发' }, { value: 'upart', label: 'U-Part假发' },
        { value: 'vpart', label: 'V-Part假发' }
      ] },
      { key: 'texture', title: '发型纹理', type: 'checkbox', options: [
        { value: 'straight', label: '直发' }, { value: 'deepWave', label: '大波浪' },
        { value: 'looseWave', label: '松散波浪' }, { value: 'deepCurl', label: '深波浪' },
        { value: 'bodyWave', label: '水波纹' }, { value: 'naturalCurl', label: '自然卷' },
        { value: 'voluminous', label: '蓬松直发' }, { value: 'smallCurl', label: '小卷发' }
      ] },
      { key: 'length', title: '长度', type: 'checkbox', options: [
        { value: '8-12', label: '8-12英寸' }, { value: '14-18', label: '14-18英寸' },
        { value: '20-24', label: '20-24英寸' }, { value: '26-30', label: '26-30英寸' },
        { value: '32-99', label: '32英寸以上' }
      ] },
      { key: 'color', title: '颜色', type: 'color', options: [
        { value: 'natural-black', label: '自然黑' }, { value: 'dark-brown', label: '深棕色' },
        { value: 'chocolate', label: '巧克力棕' }, { value: 'honey', label: '蜂蜜棕' },
        { value: 'golden', label: '金色' }, { value: 'red', label: '红色系' },
        { value: 'highlight', label: '挑染色' }, { value: 'ombre', label: '渐变色' }
      ] },
      { key: 'craft', title: '工艺', type: 'checkbox', options: [
        { value: 'pre-plucked', label: '预拔发际线' }, { value: 'hd-lace', label: 'HD蕾丝' },
        { value: 'handmade', label: '手工钩织' }
      ] }
    ],
    extension: [
      { key: 'install', title: '安装方式', type: 'checkbox', options: [
        { value: 'clipIn', label: '夹片接发' }, { value: 'tapeIn', label: '贴片接发' },
        { value: 'weft', label: '发帘接发' }, { value: 'handTied', label: '手绑接发' },
        { value: 'microRing', label: '微环接发' }, { value: 'iTip', label: 'I-Tip接发' },
        { value: 'uTip', label: 'U-Tip接发' }
      ] },
      { key: 'texture', title: '发型纹理', type: 'checkbox', options: [
        { value: 'extStraight', label: '直发' }, { value: 'extBigWave', label: '大波浪' },
        { value: 'extLooseWave', label: '松散波浪' }, { value: 'extDeepWave', label: '深波浪' },
        { value: 'extWaterWave', label: '水波纹' }, { value: 'extNaturalCurl', label: '自然卷' },
        { value: 'extVoluminous', label: '蓬松直发' }, { value: 'extSmallCurl', label: '小卷发' }
      ] },
      { key: 'length', title: '长度', type: 'checkbox', options: [
        { value: '12-16', label: '12-16英寸' }, { value: '18-20', label: '18-20英寸' },
        { value: '22-24', label: '22-24英寸' }, { value: '26-30', label: '26-30英寸' },
        { value: '32-99', label: '32英寸以上' }
      ] },
      { key: 'color', title: '颜色', type: 'color', options: [
        { value: 'extNaturalBlack', label: '自然黑' }, { value: 'extDarkBrown', label: '深棕色' },
        { value: 'extChocolateBrown', label: '巧克力棕' }, { value: 'extHoneyBrown', label: '蜂蜜棕' },
        { value: 'extGolden', label: '金色' }, { value: 'extHighlight', label: '挑染色' },
        { value: 'extOmbre', label: '渐变色' }
      ] }
    ],
    accessory: [
      { key: 'fix', title: '佩戴固定', type: 'checkbox', options: [
        { value: 'wigCap', label: '假发帽' }, { value: 'antiSlip', label: '防滑发带' },
        { value: 'fixBand', label: '假发固定带' }, { value: 'clip', label: '固定夹' },
        { value: 'edgeBand', label: '边缘定型带' }, { value: 'laceFix', label: '蕾丝固定工具' }
      ] },
      { key: 'style', title: '造型工具', type: 'checkbox', options: [
        { value: 'wigComb', label: '假发梳' }, { value: 'wideTooth', label: '宽齿梳' },
        { value: 'edgeComb', label: '边缘造型梳' }, { value: 'puff', label: '气垫梳' },
        { value: 'section', label: '分区夹' }, { value: 'kit', label: '造型工具套装' }
      ] },
      { key: 'sleep', title: '睡眠保护', type: 'checkbox', options: [
        { value: 'silkCap', label: '丝绸睡帽' }, { value: 'satinCap', label: '缎面睡帽' },
        { value: 'sleepBand', label: '睡眠发带' }, { value: 'pillow', label: '丝绸枕套' }
      ] },
      { key: 'store', title: '收纳支撑', type: 'checkbox', options: [
        { value: 'stand', label: '假发支架' }, { value: 'foldable', label: '折叠假发支架' },
        { value: 'wigHead', label: '假发头模' }, { value: 'dustBag', label: '防尘收纳袋' },
        { value: 'travel', label: '旅行收纳包' }
      ] },
      { key: 'installtool', title: '接发工具', type: 'checkbox', options: [
        { value: 'tweezers', label: '接发钳' }, { value: 'ringTool', label: '穿环器' },
        { value: 'remover', label: '微环工具' }, { value: 'sectionClip', label: '拆卸工具' },
        { value: 'installKit', label: '安装工具套装' }
      ] }
    ],
    all: [
      { key: 'type', title: '假发类型', type: 'checkbox', options: [
        { value: 'noGlue', label: '无胶假发' }, { value: 'hdLace', label: 'HD蕾丝假发' },
        { value: 'laceFront', label: '蕾丝前额假发' }, { value: 'closure', label: 'Closure假发' },
        { value: 'fullLace', label: '全蕾丝假发' }
      ] },
      { key: 'install', title: '接发方式', type: 'checkbox', options: [
        { value: 'clipIn', label: '夹片接发' }, { value: 'tapeIn', label: '贴片接发' },
        { value: 'weft', label: '发帘接发' }, { value: 'handTied', label: '手绑接发' },
        { value: 'microRing', label: '微环接发' }, { value: 'iTip', label: 'I-Tip接发' },
        { value: 'uTip', label: 'U-Tip接发' }
      ] },
      { key: 'fix', title: '配件分类', type: 'checkbox', options: [
        { value: 'wigCap', label: '假发帽' }, { value: 'fixBand', label: '固定带' },
        { value: 'wideTooth', label: '护理梳' }, { value: 'silkCap', label: '睡帽' },
        { value: 'foldable', label: '支架' }, { value: 'tweezers', label: '接发钳' }
      ] }
    ]
  };

  // 颜色对应的色块
  var COLOR_DOTS = {
    'natural-black': '#1a1a1a', 'dark-brown': '#3d2314', chocolate: '#5c3a21', honey: '#b87333',
    golden: '#c8a25f', red: '#8b1a1a', highlight: '#9a9a9a', ombre: 'linear-gradient(135deg,#1a1a1a,#c8a25f)',
    'extNaturalBlack': '#1a1a1a', 'extDarkBrown': '#3d2314', 'extChocolateBrown': '#5c3a21',
    'extHoneyBrown': '#b87333', 'extGolden': '#c8a25f', 'extHighlight': '#9a9a9a', 'extOmbre': 'linear-gradient(135deg,#1a1a1a,#c8a25f)'
  };

  // 相关搜索
  var RELATED_KEYWORDS = ['HD蕾丝假发', '深波浪假发', '24英寸假发', '大波浪假发'];

  function init() {
    readUrlParams();
    state.allProducts = MOCK_PRODUCTS.slice();
    // 演示数据补充原价：未显式设置时按约 85 折反推，用于展示划线原价与折扣标签
    state.allProducts.forEach(function (p) {
      if (p.originalPrice == null) {
        p.originalPrice = Math.round(p.price / 0.85 / 10) * 10;
      }
    });
    state.priceMin = PRICE_MIN;
    state.priceMax = PRICE_MAX;
    bindEvents();
    renderFilters(state.scope);
    renderAll();
  }

  // 读取 URL 中的 bankuai/search 参数
  function readUrlParams() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || params.get('search') || '';
    state.keyword = decodeURIComponent(q);
  }

  function bindEvents() {
    // 搜索框
    var keywordInput = document.getElementById('srKeyword');
    var searchBtn = document.getElementById('srSearchBtn');
    if (keywordInput) {
      keywordInput.value = state.keyword;
      keywordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          state.keyword = keywordInput.value.trim();
          state.page = 1;
          updateUrl();
          renderAll();
        }
      });
    }
    if (searchBtn) {
      searchBtn.addEventListener('click', function () {
        state.keyword = keywordInput.value.trim();
        state.page = 1;
        updateUrl();
        renderAll();
      });
    }

    // 相关搜索
    document.getElementById('srRelated').addEventListener('click', function (e) {
      var tag = e.target.closest('.tag');
      if (!tag) return;
      state.keyword = tag.textContent;
      keywordInput.value = state.keyword;
      state.page = 1;
      updateUrl();
      renderAll();
    });

    // 搜索范围 tabs（切换分类时左侧筛选条件动态变化）
    document.getElementById('srScopeTabs').addEventListener('click', function (e) {
      var tab = e.target.closest('.tab');
      if (!tab) return;
      document.querySelectorAll('#srScopeTabs .tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      state.scope = tab.getAttribute('data-scope');
      state.page = 1;
      state.filters = {};
      renderFilters(state.scope);
      renderAll();
    });

    // 左侧筛选折叠/展开
    document.getElementById('srFilters').addEventListener('click', function (e) {
      var title = e.target.closest('.filter-title');
      if (title) {
        var block = title.parentElement;
        block.classList.toggle('collapsed');
      }
    });

    // 复选框筛选
    document.getElementById('srFilters').addEventListener('change', function (e) {
      var cb = e.target.closest('input[type="checkbox"][data-filter]');
      if (!cb) return;
      var group = cb.getAttribute('data-filter');
      var val = cb.value;
      if (!state.filters[group]) state.filters[group] = [];
      if (cb.checked) {
        if (state.filters[group].indexOf(val) === -1) state.filters[group].push(val);
      } else {
        state.filters[group] = state.filters[group].filter(function (v) { return v !== val; });
      }
      state.page = 1;
      renderAll();
    });

    // 颜色单选（同一组只能选一个）
    document.getElementById('srFilters').addEventListener('click', function (e) {
      var opt = e.target.closest('.color-option');
      if (!opt) return;
      var color = opt.getAttribute('data-color');
      document.querySelectorAll('.color-option').forEach(function (o) { o.classList.remove('selected'); });
      if (state.filters.color && state.filters.color[0] === color) {
        delete state.filters.color;
      } else {
        opt.classList.add('selected');
        state.filters.color = [color];
      }
      state.page = 1;
      renderAll();
    });

    // 清除全部筛选
    document.getElementById('srClearAll').addEventListener('click', clearAllFilters);
    document.getElementById('srClearTags').addEventListener('click', clearAllFilters);

    // 已选条件标签删除
    document.getElementById('srFilterTags').addEventListener('click', function (e) {
      var del = e.target.closest('button[data-group][data-val]');
      if (!del) return;
      var group = del.getAttribute('data-group');
      var val = del.getAttribute('data-val');
      removeFilter(group, val);
    });

    // 排序
    document.querySelectorAll('.sort-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.sort-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.sort = btn.getAttribute('data-sort');
        state.page = 1;
        renderAll();
      });
    });

    // 价格滑块
    var minInput = document.getElementById('srPriceMin');
    var maxInput = document.getElementById('srPriceMax');
    function onPriceChange() {
      var min = parseInt(minInput.value, 10);
      var max = parseInt(maxInput.value, 10);
      if (min > max) {
        var tmp = min; min = max; max = tmp;
      }
      state.priceMin = min;
      state.priceMax = max;
      document.getElementById('srPriceMinLabel').textContent = '¥' + min.toLocaleString();
      document.getElementById('srPriceMaxLabel').textContent = '¥' + max.toLocaleString() + '+';
      state.page = 1;
      renderAll();
    }
    minInput.addEventListener('input', onPriceChange);
    maxInput.addEventListener('input', onPriceChange);
  }

  function clearAllFilters() {
    state.filters = {};
    state.priceMin = PRICE_MIN;
    state.priceMax = PRICE_MAX;
    document.querySelectorAll('#srFilters input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
    document.querySelectorAll('.color-option').forEach(function (o) { o.classList.remove('selected'); });
    document.getElementById('srPriceMin').value = PRICE_MIN;
    document.getElementById('srPriceMax').value = PRICE_MAX;
    document.getElementById('srPriceMinLabel').textContent = '¥' + PRICE_MIN.toLocaleString();
    document.getElementById('srPriceMaxLabel').textContent = '¥' + PRICE_MAX.toLocaleString() + '+';
    state.page = 1;
    renderAll();
  }

  function removeFilter(group, val) {
    if (!state.filters[group]) return;
    state.filters[group] = state.filters[group].filter(function (v) { return v !== val; });
    if (state.filters[group].length === 0) delete state.filters[group];
    // 同步 UI
    if (group === 'color') {
      document.querySelectorAll('.color-option').forEach(function (o) { o.classList.remove('selected'); });
    } else {
      var cb = document.querySelector('input[data-filter="' + group + '"][value="' + val + '"]');
      if (cb) cb.checked = false;
    }
    state.page = 1;
    renderAll();
  }

  function updateUrl() {
    var params = new URLSearchParams(window.location.search);
    params.set('bankuai', 'search');
    if (state.keyword) params.set('q', state.keyword);
    else params.delete('q');
    var newUrl = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', newUrl);
  }

  // 通用过滤：关键词 + 左侧筛选 + 价格（不含范围 scope）
  function applyBaseFilters() {
    var list = state.allProducts.slice();

    // 关键词匹配
    var kw = state.keyword.trim().toLowerCase();
    if (kw) {
      list = list.filter(function (p) {
        return p.name.toLowerCase().indexOf(kw) !== -1 ||
               p.spec.toLowerCase().indexOf(kw) !== -1;
      });
    }

    // 筛选
    for (var group in state.filters) {
      var vals = state.filters[group];
      if (!vals || !vals.length) continue;
      list = list.filter(function (p) {
        return vals.indexOf(p[group]) !== -1;
      });
    }

    // 价格
    var min = state.priceMin != null ? state.priceMin : PRICE_MIN;
    var max = state.priceMax != null ? state.priceMax : PRICE_MAX;
    list = list.filter(function (p) { return p.price >= min && p.price <= max; });

    return list;
  }

  // 按范围分类统计（基于通用过滤结果，便于各 tab 显示数量）
  function matchScope(p, scope) {
    if (scope === 'all') return true;
    return p.category === scope;
  }

  // 评论数（演示数据未单独维护评论字段时，以销量的约 60% 估算）
  function getReviews(p) {
    return p.reviews != null ? p.reviews : Math.round(p.sales * 0.6);
  }

  function computeScopeCounts() {
    var base = applyBaseFilters();
    var counts = { all: base.length, wig: 0, extension: 0, accessory: 0 };
    base.forEach(function (p) {
      if (matchScope(p, 'wig')) counts.wig++;
      if (matchScope(p, 'extension')) counts.extension++;
      if (matchScope(p, 'accessory')) counts.accessory++;
    });
    return counts;
  }

  function getFilteredProducts() {
    var list = applyBaseFilters();

    // 搜索范围
    if (state.scope !== 'all') {
      list = list.filter(function (p) { return matchScope(p, state.scope); });
    }

    // 排序
    if (state.sort === 'price-asc') {
      list.sort(function (a, b) { return a.price - b.price; });
    } else if (state.sort === 'price-desc') {
      list.sort(function (a, b) { return b.price - a.price; });
    } else if (state.sort === 'reviews-desc') {
      list.sort(function (a, b) { return getReviews(b) - getReviews(a); });
    } else if (state.sort === 'sales') {
      list.sort(function (a, b) { return b.sales - a.sales; });
    } else if (state.sort === 'new') {
      list.sort(function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0); });
    }
    // recommend 保持默认顺序

    return list;
  }

  function renderAll() {
    try {
      var filtered = getFilteredProducts();
      renderResultCount(filtered.length);
      renderScopeCounts();
      renderRelated();
      renderActiveFilters();
      renderGrid(filtered);
      renderPagination(filtered.length);
    } catch (err) {
      console.error('[search-results] renderAll error:', err);
    }
  }

  function renderScopeCounts() {
    var counts = computeScopeCounts();
    document.querySelectorAll('#srScopeTabs .tab-count').forEach(function (el) {
      var scope = el.getAttribute('data-count');
      el.textContent = counts[scope] != null ? counts[scope] : 0;
    });
  }

  function renderResultCount(total) {
    document.getElementById('srCount').textContent = '找到 ' + total + ' 件相关商品';
  }

  // 根据分类动态渲染左侧筛选条件（参考一级导航栏二级/三级菜单）
  function renderFilters(scope) {
    var config = FILTER_CONFIGS[scope] || FILTER_CONFIGS.all;
    var container = document.getElementById('srFilterGroups');
    if (!container) return;
    var html = config.map(function (group) {
      var items = group.options.map(function (opt) {
        if (group.type === 'color') {
          var dot = COLOR_DOTS[opt.value] || '#ccc';
          return '<label class="color-option" data-color="' + opt.value + '">' +
            '<span class="dot" style="background:' + dot + '"></span><span>' + opt.label + '</span></label>';
        }
        return '<label><input type="checkbox" data-filter="' + group.key + '" value="' + opt.value + '"><span>' + opt.label + '</span></label>';
      }).join('');
      var icon = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
      var cls = group.type === 'color' ? ' color-grid' : '';
      return '<div class="filter-block">' +
        '<div class="filter-title"><span>' + group.title + '</span>' + icon + '</div>' +
        '<div class="filter-content' + cls + '">' + items + '</div>' +
      '</div>';
    }).join('');
    container.innerHTML = html;
  }

  // 获取筛选条件的展示名称
  function getFilterLabel(group, val) {
    if (FILTER_LABELS[group] && FILTER_LABELS[group][val]) return FILTER_LABELS[group][val];
    // 从配置中回退查找
    var cat = FILTER_CONFIGS[state.scope] || FILTER_CONFIGS.all;
    for (var i = 0; i < cat.length; i++) {
      if (cat[i].key === group) {
        for (var j = 0; j < cat[i].options.length; j++) {
          if (cat[i].options[j].value === val) return cat[i].options[j].label;
        }
      }
    }
    return val;
  }

  function renderRelated() {
    var wrap = document.getElementById('srRelatedWrap');
    var container = document.getElementById('srRelated');
    container.innerHTML = RELATED_KEYWORDS.map(function (k) {
      return '<span class="tag">' + k + '</span>';
    }).join('');
    wrap.style.display = 'flex';
  }

  function renderActiveFilters() {
    var wrap = document.getElementById('srActiveFilters');
    var container = document.getElementById('srFilterTags');
    var tags = [];
    for (var group in state.filters) {
      var vals = state.filters[group];
      if (!vals) continue;
      vals.forEach(function (val) {
        var label = getFilterLabel(group, val);
        tags.push('<span class="filter-tag">' + label + '<button data-group="' + group + '" data-val="' + val + '">×</button></span>');
      });
    }
    if (state.priceMin > PRICE_MIN || state.priceMax < PRICE_MAX) {
      var priceLabel = '¥' + state.priceMin.toLocaleString() + ' - ¥' + state.priceMax.toLocaleString();
      tags.push('<span class="filter-tag">' + priceLabel + '<button data-group="price" data-val="price">×</button></span>');
    }
    container.innerHTML = tags.join('');
    wrap.style.display = tags.length ? 'flex' : 'none';
  }

  function renderGrid(products) {
    var container = document.getElementById('srGrid');
    var empty = document.getElementById('srEmptyState');
    var pagination = document.getElementById('srPagination');
    if (!products.length) {
      container.style.display = 'none';
      if (pagination) pagination.style.display = 'none';
      if (empty) empty.style.display = 'block';
      return;
    }
    container.style.display = '';
    if (pagination) pagination.style.display = '';
    if (empty) empty.style.display = 'none';
    var start = (state.page - 1) * state.pageSize;
    var pageProducts = products.slice(start, start + state.pageSize);
    container.innerHTML = pageProducts.map(function (p) {
      // 折扣标签：由售价与原价计算得出，无折扣时不显示
      var badge = '';
      if (p.originalPrice > p.price) {
        var discount = Math.round((1 - p.price / p.originalPrice) * 100);
        badge = '<span class="product-badge">-' + discount + '%</span>';
      }
      var stars = '★'.repeat(p.rating) + '☆'.repeat(5 - p.rating);
      // 原价（划线），无折扣时隐藏
      var originalHtml = p.originalPrice > p.price
        ? '<span class="product-original">￥' + p.originalPrice.toLocaleString() + '</span>'
        : '';
      return '' +
        '<div class="product-card" data-id="' + p.id + '" data-page="product/detail.html?id=' + p.id + '">' +
          '<div class="product-thumb">' +
            badge +
            '<img src="' + p.image + '" alt="' + p.name + '">' +
            '<button type="button" class="wish-btn" title="收藏">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="product-info">' +
            '<h3 class="product-name">' + p.name + '</h3>' +
            '<div class="product-meta">' + p.spec + '</div>' +
            '<div class="product-price">￥' + p.price.toLocaleString() + originalHtml + '</div>' +
            '<div class="product-rating"><span class="stars">' + stars + '</span><span class="rating-value">' + p.rating.toFixed(1) + '</span><span class="rating-sales">(' + p.sales.toLocaleString() + ')</span></div>' +
          '</div>' +
        '</div>';
    }).join('');

    // 商品卡片点击跳转详情页，收藏按钮阻止冒泡
    container.querySelectorAll('.product-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.wish-btn')) {
          e.stopPropagation();
          e.preventDefault();
          var btn = e.target.closest('.wish-btn');
          btn.classList.toggle('active');
          return;
        }
        var page = card.getAttribute('data-page');
        if (page && window.ShopRouter && window.ShopRouter.loadPage) {
          window.ShopRouter.loadPage(page);
        }
      });
    });
  }

  function renderPagination(total) {
    var container = document.getElementById('srPagination');
    var totalPages = Math.ceil(total / state.pageSize);
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }
    var html = '';
    html += '<button ' + (state.page === 1 ? 'disabled' : '') + ' data-page="prev">‹</button>';
    for (var i = 1; i <= totalPages; i++) {
      html += '<button class="' + (i === state.page ? 'active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }
    html += '<button ' + (state.page === totalPages ? 'disabled' : '') + ' data-page="next">›</button>';
    container.innerHTML = html;

    // 绑定分页事件
    container.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-page');
        if (action === 'prev') {
          if (state.page > 1) state.page--;
        } else if (action === 'next') {
          if (state.page < totalPages) state.page++;
        } else {
          state.page = parseInt(action, 10);
        }
        renderGrid(getFilteredProducts());
        renderPagination(total);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
