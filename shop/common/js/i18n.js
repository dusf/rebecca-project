/**
 * shop 端国际化引擎
 * 支持语言：zh-CN（默认）、en-US、fr-FR
 * 商家自定义文案（产品名、价格等）走 mock 数据，不走 i18n
 * 模板固定文案通过 data-i18n 属性自动替换
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'shop_locale';
  var DEFAULT_LOCALE = 'zh-CN';
  var SUPPORTED = ['zh-CN', 'en-US', 'fr-FR'];

  /* ==================== 翻译字典 ==================== */
  var DICT = {
    'zh-CN': {
      // ---- 公告栏 ----
      'announcement.text': '全球极速配送 · 单笔订单满 ¥2,299 免运费',

      // ---- 导航 ----
      'nav.home': '首页',
      'nav.bestsellers': '热销爆款',
      'nav.new': '新品',
      'nav.about': '关于我们',
      'nav.help': '帮助中心',

      // ---- 头部操作 ----
      'header.search': '搜索',
      'header.account': '账户',
      'header.cart': '购物袋',
      'header.currency': 'CNY ¥',
      'header.lang': '语言',

      // ---- Hero ----
      'hero.title': '奢华秀发，\n焕新演绎',
      'hero.subtitle': '高端真人发产品，隐形自然设计。\n让自信与美同行。',
      'hero.cta1': '选购假发',
      'hero.cta2': '探索系列',

      // ---- 分类 ----
      'categories.title': '探索品类',
      'categories.cta': '立即选购',
      'categories.wig': '假发',
      'categories.wigDesc': '丰盈自然，优雅随心',
      'categories.extension': '接发',
      'categories.extensionDesc': '顺滑柔亮，自然融入',
      'categories.topper': '发片 / 头顶补发',
      'categories.topperDesc': '轻盈无痕，告别稀疏',

      // ---- 热销 ----
      'bestsellers.tag': '热销精选',
      'bestsellers.title': '深受喜爱',
      'bestsellers.viewAll': '查看全部',
      'bestsellers.badge': '热销',
      'product.p1Name': '奢华大波浪假发',
      'product.p1Spec': '22" | 自然黑',
      'product.p2Name': '丝滑直发假发',
      'product.p2Spec': '24" | 自然黑',
      'product.p3Name': '深卷假发',
      'product.p3Spec': '20" | 自然黑',
      'product.p4Name': '挑染大波浪假发',
      'product.p4Spec': '22" | 巧克力棕',
      'product.p5Name': '高清蕾丝闭合假发',
      'product.p5Spec': '18" | 自然黑',
      'product.p6Name': '短波波假发',
      'product.p6Spec': '12" | 栗色',
      'product.p7Name': '渐变长卷假发',
      'product.p7Spec': '26" | 焦糖渐变',
      'product.p8Name': '空气刘海直发',
      'product.p8Spec': '16" | 亚麻棕',

      // ---- 工艺 ----
      'craft.title': '隐形蕾丝工艺',
      'craft.subtitle': '匠心打造，自然无痕',
      'craft.desc': '我们的隐形蕾丝工艺，完美贴合头皮，发际线自然无痕，佩戴舒适稳固，呈现宛如天生的秀发质感。',
      'craft.f1Title': '隐形蕾丝技术',
      'craft.f1Desc': '超轻薄蕾丝，边缘自然服帖',
      'craft.f2Title': '匠心手工制作',
      'craft.f2Desc': '手工逐根钩织，细节精致出众',
      'craft.f3Title': '甄选优质真人发',
      'craft.f3Desc': '精选优质真人发，光泽自然',
      'craft.cta': '了解更多',

      // ---- 发色拉 ----
      'textures.title': '为你而生，\n尽显魅力',
      'textures.subtitle': '发色与发质',
      'textures.straight': '直发',
      'textures.deepWave': '大波浪',
      'textures.looseWave': '深波浪',
      'textures.deepCurl': '深卷',
      'textures.curly': '卷发',
      'textures.bodyWave': '水波纹',
      'textures.naturalBrown': '自然棕',
      'textures.chocolateBrown': '巧克力棕',
      'textures.honeyTea': '蜂蜜茶',
      'textures.highlightGold': '高光金',

      // ---- 信任徽章 ----
      'trust.shipping': '全球极速配送',
      'trust.shippingDesc': '快速直达，安心送达',
      'trust.returns': '30天无忧退换',
      'trust.returnsDesc': '无忧退换，购物更安心',
      'trust.payment': '安全支付',
      'trust.paymentDesc': '多重加密，支付安全',
      'trust.consult': '专家顾问服务',
      'trust.consultDesc': '一对一专属顾问，全程贴心',
      'trust.quality': '甄选真人发',
      'trust.qualityDesc': '真人发质，健康自然',

      // ---- 页脚 ----
      'footer.brandDesc': '奢华发品，赋予你自信与力量。\n让你成为不可替代的自己。',
      'footer.shop': '选购',
      'footer.shopWigs': '假发',
      'footer.shopExtensions': '接发',
      'footer.shopToppers': '发片 / 头顶补发',
      'footer.shopNew': '新品',
      'footer.shopBest': '热销爆款',
      'footer.service': '客户服务',
      'footer.serviceHelp': '帮助中心',
      'footer.serviceShipping': '配送与物流',
      'footer.serviceReturns': '退换政策',
      'footer.servicePayment': '支付方式',
      'footer.serviceContact': '联系我们',
      'footer.brand': '品牌故事',
      'footer.brandAbout': '我们的故事',
      'footer.brandCraft': '匠心工艺',
      'footer.brandSustain': '可持续发展',
      'footer.brandPress': '媒体报道',
      'footer.brandBlog': '品牌资讯',
      'footer.newsletter': '加入 NOIRÉ 会员',
      'footer.newsletterDesc': '第一时间获取新品、专属优惠与品牌资讯',
      'footer.newsletterPlaceholder': '请输入邮箱',
      'footer.privacy': '隐私政策',
      'footer.terms': '使用条款',
      'footer.accessibility': '无障碍服务',
      'footer.copyright': '© 2025 NOIRÉ HAIR. 保留所有权利。',

      // ---- 通用 ----
      'common.currency': '¥',
      'common.reviews': '条评价',
      'common.close': '关闭',
      'page.title': 'NOIRÉ HAIR — 奢华假发',
    },

    'en-US': {
      'announcement.text': 'Free express shipping worldwide on orders over ¥2,299',

      'nav.home': 'Home',
      'nav.bestsellers': 'Best Sellers',
      'nav.new': 'New Arrivals',
      'nav.about': 'About Us',
      'nav.help': 'Help Center',

      'header.search': 'Search',
      'header.account': 'Account',
      'header.cart': 'Bag',
      'header.currency': 'CNY ¥',
      'header.lang': 'Language',

      'hero.title': 'Luxury Hair,\nRedefined',
      'hero.subtitle': 'Premium human hair products with invisible,\nnatural design. Confidence meets beauty.',
      'hero.cta1': 'Shop Wigs',
      'hero.cta2': 'Explore Collections',

      'categories.title': 'Explore Categories',
      'categories.cta': 'Shop Now',
      'categories.wig': 'Wigs',
      'categories.wigDesc': 'Full & natural, effortless elegance',
      'categories.extension': 'Extensions',
      'categories.extensionDesc': 'Silky & lustrous, seamlessly blends',
      'categories.topper': 'Toppers',
      'categories.topperDesc': 'Light & invisible, goodbye thinning',

      'bestsellers.tag': 'Best Sellers',
      'bestsellers.title': 'Most Loved',
      'bestsellers.viewAll': 'View All',
      'bestsellers.badge': 'Hot',
      'product.p1Name': 'Luxury Wavy Wig',
      'product.p1Spec': '22" | Natural Black',
      'product.p2Name': 'Silky Straight Wig',
      'product.p2Spec': '24" | Natural Black',
      'product.p3Name': 'Deep Curl Wig',
      'product.p3Spec': '20" | Natural Black',
      'product.p4Name': 'Highlighted Wavy Wig',
      'product.p4Spec': '22" | Chocolate Brown',
      'product.p5Name': 'HD Lace Closure Wig',
      'product.p5Spec': '18" | Natural Black',
      'product.p6Name': 'Short Bob Wig',
      'product.p6Spec': '12" | Chestnut',
      'product.p7Name': 'Ombre Long Curl Wig',
      'product.p7Spec': '26" | Caramel Ombre',
      'product.p8Name': 'Air Bangs Straight',
      'product.p8Spec': '16" | Ash Brown',

      'craft.title': 'Invisible Lace Craftsmanship',
      'craft.subtitle': 'Artisan Made, Naturally Seamless',
      'craft.desc': 'Our invisible lace technology blends seamlessly with your scalp. Natural hairline, comfortable fit, and a look that\'s indistinguishable from your own hair.',
      'craft.f1Title': 'Invisible Lace Tech',
      'craft.f1Desc': 'Ultra-thin lace, seamless edges',
      'craft.f2Title': 'Artisan Handcrafted',
      'craft.f2Desc': 'Individually hand-knotted, exquisite detail',
      'craft.f3Title': 'Premium Human Hair',
      'craft.f3Desc': 'Carefully selected, naturally lustrous',
      'craft.cta': 'Learn More',

      'textures.title': 'Made for You,\nUniquely Stunning',
      'textures.subtitle': 'Colors & Textures',
      'textures.straight': 'Straight',
      'textures.deepWave': 'Deep Wave',
      'textures.looseWave': 'Loose Wave',
      'textures.deepCurl': 'Deep Curl',
      'textures.curly': 'Curly',
      'textures.bodyWave': 'Body Wave',
      'textures.naturalBrown': 'Natural Brown',
      'textures.chocolateBrown': 'Chocolate Brown',
      'textures.honeyTea': 'Honey Tea',
      'textures.highlightGold': 'Highlight Gold',

      'trust.shipping': 'Express Shipping',
      'trust.shippingDesc': 'Fast & reliable delivery',
      'trust.returns': '30-Day Returns',
      'trust.returnsDesc': 'Hassle-free returns',
      'trust.payment': 'Secure Payment',
      'trust.paymentDesc': 'Encrypted & protected',
      'trust.consult': 'Expert Consultation',
      'trust.consultDesc': '1-on-1 dedicated advisor',
      'trust.quality': 'Premium Human Hair',
      'trust.qualityDesc': 'Healthy & natural',

      'footer.brandDesc': 'Luxury hair that empowers your confidence.\nBe irreplaceably you.',
      'footer.shop': 'Shop',
      'footer.shopWigs': 'Wigs',
      'footer.shopExtensions': 'Extensions',
      'footer.shopToppers': 'Toppers',
      'footer.shopNew': 'New Arrivals',
      'footer.shopBest': 'Best Sellers',
      'footer.service': 'Customer Service',
      'footer.serviceHelp': 'Help Center',
      'footer.serviceShipping': 'Shipping & Delivery',
      'footer.serviceReturns': 'Return Policy',
      'footer.servicePayment': 'Payment Methods',
      'footer.serviceContact': 'Contact Us',
      'footer.brand': 'Our Story',
      'footer.brandAbout': 'About Us',
      'footer.brandCraft': 'Craftsmanship',
      'footer.brandSustain': 'Sustainability',
      'footer.brandPress': 'Press',
      'footer.brandBlog': 'Blog',
      'footer.newsletter': 'Join NOIRÉ Membership',
      'footer.newsletterDesc': 'Be the first to know about new arrivals, exclusive offers & brand news',
      'footer.newsletterPlaceholder': 'Enter your email',
      'footer.privacy': 'Privacy Policy',
      'footer.terms': 'Terms of Service',
      'footer.accessibility': 'Accessibility',
      'footer.copyright': '© 2025 NOIRÉ HAIR. All rights reserved.',

      'common.currency': '¥',
      'common.reviews': 'reviews',
      'common.close': 'Close',
      'page.title': 'NOIRÉ HAIR — Luxury Wigs',
    },

    'fr-FR': {
      'announcement.text': 'Livraison express mondiale · Offerte dès ¥2 299 d\'achat',

      'nav.home': 'Accueil',
      'nav.bestsellers': 'Meilleures Ventes',
      'nav.new': 'Nouveautés',
      'nav.about': 'À Propos',
      'nav.help': 'Aide',

      'header.search': 'Rechercher',
      'header.account': 'Compte',
      'header.cart': 'Panier',
      'header.currency': 'CNY ¥',
      'header.lang': 'Langue',

      'hero.title': 'Cheveux de Luxe,\nRéinventés',
      'hero.subtitle': 'Produits capillaires premium en cheveux naturels,\ndesign invisible. La confiance rencontre la beauté.',
      'hero.cta1': 'Acheter des Perruques',
      'hero.cta2': 'Explorer les Collections',

      'categories.title': 'Explorer les Catégories',
      'categories.cta': 'Acheter',
      'categories.wig': 'Perruques',
      'categories.wigDesc': 'Volumineux & naturel, élégance sans effort',
      'categories.extension': 'Extensions',
      'categories.extensionDesc': 'Soyeux & brillant, se fond naturellement',
      'categories.topper': 'Volumateurs',
      'categories.topperDesc': 'Léger & invisible, adieu clairsemé',

      'bestsellers.tag': 'Sélection Tendance',
      'bestsellers.title': 'Les Plus Aimés',
      'bestsellers.viewAll': 'Voir Tout',
      'bestsellers.badge': 'Top',
      'product.p1Name': 'Perruque Ondulée Luxe',
      'product.p1Spec': '22" | Noir Naturel',
      'product.p2Name': 'Perruque Lisse Soyeuse',
      'product.p2Spec': '24" | Noir Naturel',
      'product.p3Name': 'Perruque Bouclée',
      'product.p3Spec': '20" | Noir Naturel',
      'product.p4Name': 'Perruque Ondulée Balayage',
      'product.p4Spec': '22" | Brun Chocolat',
      'product.p5Name': 'Perruque Lace HD',
      'product.p5Spec': '18" | Noir Naturel',
      'product.p6Name': 'Perruque Bob Court',
      'product.p6Spec': '12" | Châtain',
      'product.p7Name': 'Perruque Longue Ombrée',
      'product.p7Spec': '26" | Dégradé Caramel',
      'product.p8Name': 'Frange Aérienne Lisse',
      'product.p8Spec': '16" | Brun Cendré',

      'craft.title': 'Savoir-faire Lace Invisible',
      'craft.subtitle': 'Fait Main, Naturellement Invisible',
      'craft.desc': 'Notre technologie de lace invisible se fond parfaitement avec votre cuir chevelu. Ligne capillaire naturelle, confort optimal, un rendu indiscernable de vos propres cheveux.',
      'craft.f1Title': 'Technologie Lace Invisible',
      'craft.f1Desc': 'Lace ultra-fine, bords imperceptibles',
      'craft.f2Title': 'Fabrication Artisanale',
      'craft.f2Desc': 'Noué à la main, détails exquis',
      'craft.f3Title': 'Cheveux Naturels Premium',
      'craft.f3Desc': 'Sélection rigoureuse, éclat naturel',
      'craft.cta': 'En Savoir Plus',

      'textures.title': 'Créé pour Vous,\nUnique & Éclatant',
      'textures.subtitle': 'Couleurs & Textures',
      'textures.straight': 'Lisse',
      'textures.deepWave': 'Ondulation Profonde',
      'textures.looseWave': 'Ondulation Lâche',
      'textures.deepCurl': 'Bouclé Profond',
      'textures.curly': 'Bouclé',
      'textures.bodyWave': 'Ondulation Corps',
      'textures.naturalBrown': 'Brun Naturel',
      'textures.chocolateBrown': 'Brun Chocolat',
      'textures.honeyTea': 'Thé Miel',
      'textures.highlightGold': 'Or Lumineux',

      'trust.shipping': 'Livraison Express',
      'trust.shippingDesc': 'Rapide et fiable',
      'trust.returns': 'Retours 30 Jours',
      'trust.returnsDesc': 'Retours sans souci',
      'trust.payment': 'Paiement Sécurisé',
      'trust.paymentDesc': 'Crypté et protégé',
      'trust.consult': 'Conseil Expert',
      'trust.consultDesc': 'Conseiller dédié 1-à-1',
      'trust.quality': 'Cheveux Naturels Premium',
      'trust.qualityDesc': 'Sains et naturels',

      'footer.brandDesc': 'Des cheveux de luxe qui inspirent confiance.\nSoyez irremplaçable.',
      'footer.shop': 'Boutique',
      'footer.shopWigs': 'Perruques',
      'footer.shopExtensions': 'Extensions',
      'footer.shopToppers': 'Volumateurs',
      'footer.shopNew': 'Nouveautés',
      'footer.shopBest': 'Meilleures Ventes',
      'footer.service': 'Service Client',
      'footer.serviceHelp': 'Centre d\'Aide',
      'footer.serviceShipping': 'Livraison',
      'footer.serviceReturns': 'Politique de Retour',
      'footer.servicePayment': 'Modes de Paiement',
      'footer.serviceContact': 'Nous Contacter',
      'footer.brand': 'Notre Histoire',
      'footer.brandAbout': 'À Propos',
      'footer.brandCraft': 'Savoir-faire',
      'footer.brandSustain': 'Durabilité',
      'footer.brandPress': 'Presse',
      'footer.brandBlog': 'Blog',
      'footer.newsletter': 'Rejoindre le Club NOIRÉ',
      'footer.newsletterDesc': 'Soyez les premiers informés des nouveautés, offres exclusives et actualités',
      'footer.newsletterPlaceholder': 'Entrez votre email',
      'footer.privacy': 'Politique de Confidentialité',
      'footer.terms': 'Conditions d\'Utilisation',
      'footer.accessibility': 'Accessibilité',
      'footer.copyright': '© 2025 NOIRÉ HAIR. Tous droits réservés.',

      'common.currency': '¥',
      'common.reviews': 'avis',
      'common.close': 'Fermer',
      'page.title': 'NOIRÉ HAIR — Perruques de Luxe',
    }
  };

  /* ==================== 语言名称映射 ==================== */
  var LOCALE_NAMES = {
    'zh-CN': '中文',
    'en-US': 'English',
    'fr-FR': 'Français'
  };

  /* ==================== 核心 API ==================== */

  function getLocale() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    return DEFAULT_LOCALE;
  }

  function setLocale(locale) {
    if (SUPPORTED.indexOf(locale) === -1) return;
    localStorage.setItem(STORAGE_KEY, locale);
    applyAll();
    // 触发自定义事件，让动态渲染的模块（如产品卡片）重新渲染
    document.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale: locale } }));
  }

  function t(key) {
    var locale = getLocale();
    var dict = DICT[locale] || DICT[DEFAULT_LOCALE];
    return dict[key] || DICT[DEFAULT_LOCALE][key] || key;
  }

  /** 替换所有带 data-i18n 属性的元素文本 */
  function applyAll() {
    var els = document.querySelectorAll('[data-i18n]');
    els.forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var text = t(key);
      // 处理换行：\n → <br>
      if (text.indexOf('\n') !== -1) {
        el.innerHTML = text.split('\n').map(function (line) {
          return line.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }).join('<br>');
      } else {
        el.textContent = text;
      }
    });
    // placeholder
    var phEls = document.querySelectorAll('[data-i18n-placeholder]');
    phEls.forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    // html lang
    document.documentElement.lang = getLocale();
  }

  function getSupported() { return SUPPORTED.slice(); }
  function getLocaleName(locale) { return LOCALE_NAMES[locale] || locale; }

  /* ==================== 导出 ==================== */
  window.ShopI18n = {
    t: t,
    getLocale: getLocale,
    setLocale: setLocale,
    getSupported: getSupported,
    getLocaleName: getLocaleName,
    applyAll: applyAll
  };

  // 初始化
  document.documentElement.lang = getLocale();
})();
