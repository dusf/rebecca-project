// ==================== Shopify 拉取商品 ====================
// Shopify 模拟店铺站点数据
var shopifyProductStores = [
  { id: 'site-1', name: 'QVR品牌站', domain: 'qvr.myshopify.com', productCount: 128 },
  { id: 'site-2', name: 'Fashion Plus', domain: 'fashion-plus.myshopify.com', productCount: 56 },
  { id: 'site-3', name: 'Tokyo Select', domain: 'tokyo-select.myshopify.com', productCount: 42 }
];

// Shopify 模拟商品数据（按站点）
var shopifyProductsMap = {
  'site-1': [
    { id: 'sp-1-1', title: 'iPhone 15 Pro 保护壳', category: '数码电子', price: 129, stock: '3款200件', image: 'phone' },
    { id: 'sp-1-2', title: 'USB-C 快充数据线 2m', category: '数码电子', price: 49, stock: '1款500件', image: 'phone' },
    { id: 'sp-1-3', title: '无线充电底座', category: '数码电子', price: 199, stock: '2款150件', image: 'phone' },
    { id: 'sp-1-4', title: '蓝牙音箱 Mini', category: '数码电子', price: 299, stock: '4款80件', image: 'phone' },
    { id: 'sp-1-5', title: '笔记本散热支架', category: '数码电子', price: 89, stock: '1款300件', image: 'phone' },
    { id: 'sp-1-6', title: 'Type-C 拓展坞 7合1', category: '数码电子', price: 259, stock: '2款120件', image: 'phone' },
    { id: 'sp-1-7', title: '降噪耳机收纳盒', category: '数码电子', price: 79, stock: '3款400件', image: 'phone' },
    { id: 'sp-1-8', title: 'iPad 磁吸键盘套', category: '数码电子', price: 399, stock: '2款60件', image: 'phone' }
  ],
  'site-2': [
    { id: 'sp-2-1', title: '春季棉麻衬衫', category: '服饰鞋包', price: 199, stock: '5款300件', image: 'shirt' },
    { id: 'sp-2-2', title: '真皮斜挎包', category: '服饰鞋包', price: 599, stock: '3款80件', image: 'shirt' },
    { id: 'sp-2-3', title: '运动跑步鞋 Air', category: '服饰鞋包', price: 459, stock: '6款200件', image: 'shirt' },
    { id: 'sp-2-4', title: '女士太阳镜 UV400', category: '服饰鞋包', price: 299, stock: '2款150件', image: 'shirt' },
    { id: 'sp-2-5', title: '羊毛围巾格纹款', category: '服饰鞋包', price: 169, stock: '1款250件', image: 'shirt' }
  ],
  'site-3': [
    { id: 'sp-3-1', title: '日本抹茶粉 100g', category: '食品饮料', price: 138, stock: '1款500件', image: 'coffee' },
    { id: 'sp-3-2', title: '限定樱花杯', category: '家居生活', price: 258, stock: '2款100件', image: 'home' },
    { id: 'sp-3-3', title: '北海道奶酪蛋糕', category: '食品饮料', price: 89, stock: '1款300件', image: 'coffee' },
    { id: 'sp-3-4', title: '无添加洗面奶', category: '美妆护肤', price: 158, stock: '2款400件', image: 'droplet' }
  ]
};

var shopifyProductAuthStoreDomain = '';
var shopifyProductSelectedSiteId = null;
var shopifyProductSelected = {};  // { spId: true }

// ---- 授权对话框 ----
function openShopifyProductAuth() {
  document.getElementById('shopifyProductStoreDomain').value = '';
  shopifyProductAuthStoreDomain = '';
  document.getElementById('shopifyProductAuthOverlay').style.display = 'flex';
  document.getElementById('shopifyProductAuthOverlay').onclick = function(e) {
    if (e.target === document.getElementById('shopifyProductAuthOverlay')) closeShopifyProductAuth();
  };
}

function closeShopifyProductAuth() {
  document.getElementById('shopifyProductAuthOverlay').style.display = 'none';
}

function confirmShopifyProductAuth() {
  var domain = document.getElementById('shopifyProductStoreDomain').value.trim();
  if (!domain) {
    showToast('error', '请输入 Shopify 店铺域名');
    return;
  }
  shopifyProductAuthStoreDomain = domain;
  closeShopifyProductAuth();
  openShopifyProductSiteSelect();
}

// ---- 站点选择对话框 ----
function openShopifyProductSiteSelect() {
  shopifyProductSelectedSiteId = null;
  document.getElementById('shopifyProductSiteNextBtn').disabled = true;
  renderShopifyProductSiteList();
  document.getElementById('shopifyProductSiteOverlay').style.display = 'flex';
  document.getElementById('shopifyProductSiteOverlay').onclick = function(e) {
    if (e.target === document.getElementById('shopifyProductSiteOverlay')) closeShopifyProductSiteSelect();
  };
}

function closeShopifyProductSiteSelect() {
  document.getElementById('shopifyProductSiteOverlay').style.display = 'none';
}

function renderShopifyProductSiteList() {
  var list = document.getElementById('shopifyProductSiteList');
  list.innerHTML = shopifyProductStores.map(function(store) {
    var selected = shopifyProductSelectedSiteId === store.id ? ' selected' : '';
    return '<div class="sync-site-row-v3' + selected + '" data-site-id="' + store.id + '" onclick="selectShopifyProductSite(\'' + store.id + '\')">' +
      '<div class="sync-site-info-v3">' +
        '<div class="sync-site-name-v3">' + store.name + '<span class="sync-site-badge">' + store.productCount + '件商品</span></div>' +
        '<div class="sync-site-domain-v3">' + store.domain + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function selectShopifyProductSite(siteId) {
  shopifyProductSelectedSiteId = siteId;
  document.getElementById('shopifyProductSiteNextBtn').disabled = false;
  renderShopifyProductSiteList();
}

function goToShopifyProducts() {
  if (!shopifyProductSelectedSiteId) return;
  var site = shopifyProductStores.find(function(s) { return s.id === shopifyProductSelectedSiteId; });
  if (!site) return;
  document.getElementById('shopifyProductSelectedSiteName').textContent = site.name;
  shopifyProductSelected = {};
  closeShopifyProductSiteSelect();
  renderShopifyProductList();
  updateShopifyProductBar();
  document.getElementById('shopifyProductSelectOverlay').style.display = 'flex';
  document.getElementById('shopifyProductSelectOverlay').onclick = function(e) {
    if (e.target === document.getElementById('shopifyProductSelectOverlay')) closeShopifyProductSelect();
  };
}

function closeShopifyProductSelect() {
  document.getElementById('shopifyProductSelectOverlay').style.display = 'none';
}

// ---- 商品选择列表 ----
function renderShopifyProductList() {
  var productList = shopifyProductsMap[shopifyProductSelectedSiteId] || [];
  var listEl = document.getElementById('shopifyProductList');

  var svgIcons = {
    phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    shirt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
    coffee: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
    home: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    droplet: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>'
  };

  var html = '<div class="sync-series-children">';
  productList.forEach(function(sp) {
    var selected = shopifyProductSelected[sp.id] ? ' selected' : '';
    var icon = svgIcons[sp.image] || svgIcons.phone;
    html += '<div class="sync-series-child' + selected + '" onclick="shopifyProductToggle(\'' + sp.id + '\')">';
    html += '<div class="sync-series-child-check">' + (selected ? '&#10003;' : '') + '</div>';
    html += '<span style="display:inline-flex;align-items:center;gap:6px;color:hsl(var(--muted-foreground));margin-right:8px;flex-shrink:0;">' + icon + '</span>';
    html += '<span style="flex:1">' + sp.title + '</span>';
    html += '<span style="font-size:11px;color:hsl(var(--muted-foreground));margin-right:12px;">' + sp.category + '</span>';
    html += '<span style="font-weight:500;font-size:13px;margin-right:12px;">&yen;' + sp.price + '</span>';
    html += '<span style="font-size:11px;color:hsl(var(--muted-foreground))">' + sp.stock + '</span>';
    html += '</div>';
  });
  html += '</div>';
  listEl.innerHTML = html;
  updateShopifyProductSelectAllCb();
}

function shopifyProductToggle(spId) {
  if (shopifyProductSelected[spId]) {
    delete shopifyProductSelected[spId];
  } else {
    shopifyProductSelected[spId] = true;
  }
  renderShopifyProductList();
  updateShopifyProductBar();
}

function shopifyProductToggleSelectAll() {
  var productList = shopifyProductsMap[shopifyProductSelectedSiteId] || [];
  var allSelected = productList.length > 0 && productList.every(function(sp) { return shopifyProductSelected[sp.id]; });
  if (allSelected) {
    productList.forEach(function(sp) { delete shopifyProductSelected[sp.id]; });
  } else {
    productList.forEach(function(sp) { shopifyProductSelected[sp.id] = true; });
  }
  renderShopifyProductList();
  updateShopifyProductBar();
}

function updateShopifyProductSelectAllCb() {
  var productList = shopifyProductsMap[shopifyProductSelectedSiteId] || [];
  var allSel = productList.length > 0 && productList.every(function(sp) { return shopifyProductSelected[sp.id]; });
  var cb = document.getElementById('shopifyProductSelectAllCb');
  if (cb) {
    cb.classList.toggle('checked', allSel);
    cb.innerHTML = allSel ? '&#10003;' : '';
  }
}

function updateShopifyProductBar() {
  var cnt = Object.keys(shopifyProductSelected).filter(function(k) { return shopifyProductSelected[k]; }).length;
  document.getElementById('shopifyProductSelectedCount').textContent = '已选 ' + cnt + ' 个';
  document.getElementById('shopifyProductSyncBtn').disabled = cnt === 0;
}

// ---- 同步商品到商城后台 ----
function syncShopifyProducts() {
  var productList = shopifyProductsMap[shopifyProductSelectedSiteId] || [];
  var selected = productList.filter(function(sp) { return shopifyProductSelected[sp.id]; });
  if (selected.length === 0) return;

  var today = new Date().toISOString().split('T')[0];
  var newCount = 0;
  var skippedCount = 0;

  selected.forEach(function(sp) {
    // 检查是否已存在同名商品
    var exists = products.some(function(p) { return p.name === sp.title; });
    if (exists) {
      skippedCount++;
      return;
    }

    var spuPrefix = {
      '数码电子': 'SPU-DZ', '服饰鞋包': 'SPU-FS', '食品饮料': 'SPU-SP',
      '家居生活': 'SPU-JJ', '美妆护肤': 'SPU-MZ'
    };
    var prefix = spuPrefix[sp.category] || 'SPU-IM';
    var newId = products.length > 0 ? Math.max.apply(null, products.map(function(p) { return p.id; })) + 1 : 1;
    var spuNum = String(10000 + newId).slice(1);
    var spu = prefix + '-' + spuNum;

    products.push({
      id: newId,
      name: sp.title,
      spu: spu,
      category: sp.category,
      price: sp.price,
      originalPrice: Math.round(sp.price * 1.2),
      stock: sp.stock,
      stockLink: false,
      stockUpdateTime: '',
      status: 'draft',
      seoSlug: sp.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, ''),
      seriesCount: 0,
      seriesNames: [],
      creator: 'Shopify',
      org: '导入组',
      orgPath: '总部/导入组',
      date: today,
      updateDate: today,
      sourceShopify: true,
      shopifySite: shopifyProductSelectedSiteId
    });
    newCount++;
  });

  closeShopifyProductSelect();
  renderProducts();

  var msg = '已同步 ' + newCount + ' 个商品';
  if (skippedCount > 0) msg += '，跳过 ' + skippedCount + ' 个重复名称的商品';
  showToast('success', msg);
}
