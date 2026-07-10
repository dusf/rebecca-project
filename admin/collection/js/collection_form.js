// ==================== 系列表单脚本 ====================
// 系列数据
function loadCollections() {
  try {
    var s = localStorage.getItem('rebecca_collections_' + (getCurrentShopId ? getCurrentShopId() : 'default'));
    if (s) return JSON.parse(s);
  } catch(e) {}
  return [];
}
function saveCollections(cols) {
  try { localStorage.setItem('rebecca_collections_' + (getCurrentShopId ? getCurrentShopId() : 'default'), JSON.stringify(cols)); } catch(e) {}
}

var collections = loadCollections();
var editingId = null;
var isEditMode = false;
var assocProducts = [];
var coverDataUrl = '';

// ==================== URL 参数 ====================
function getUrlParam(name) {
  var m = location.search.match(new RegExp('[?&]' + name + '=([^&]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

// ==================== 字符计数 ====================
function updateNameCount() { var v = document.getElementById('collectionName').value; document.getElementById('nameCount').textContent = v.length + '/100'; }
function updateSeoTitleCount() { var v = document.getElementById('seoTitle').value; document.getElementById('seoTitleCount').textContent = v.length + '/200'; }
function updateSeoDescCount() { var v = document.getElementById('seoDesc').value; document.getElementById('seoDescCount').textContent = v.length + '/500'; }

// ==================== 封面图 ====================
function uploadCover() { document.getElementById('coverInput').click(); }
function handleCoverUpload(e) {
  var f = e.target.files[0];
  if (!f) return;
  if (f.size > 5 * 1024 * 1024) { showToast('error', '图片大小不能超过5MB'); return; }
  var r = new FileReader();
  r.onload = function(ev) { setCoverPreview(ev.target.result); };
  r.readAsDataURL(f);
}
function setCoverPreview(url) {
  coverDataUrl = url;
  var el = document.getElementById('coverUpload');
  el.classList.add('has-image');
  var img = el.querySelector('img');
  if (!img) { img = document.createElement('img'); img.src = url; el.insertBefore(img, el.firstChild); }
  else img.src = url;
  el.querySelector('.upload-icon').style.display = 'none';
  el.querySelector('.upload-text').style.display = 'none';
}
function removeCover(e) {
  e.stopPropagation();
  coverDataUrl = '';
  var el = document.getElementById('coverUpload');
  el.classList.remove('has-image');
  var img = el.querySelector('img');
  if (img) img.remove();
  el.querySelector('.upload-icon').style.display = '';
  el.querySelector('.upload-text').style.display = '';
}

// ==================== 状态切换 ====================
function toggleStatusUI() {
  var t = document.getElementById('statusToggle').querySelector('.toggle');
  t.classList.toggle('active');
  document.getElementById('statusLabel').textContent = t.classList.contains('active') ? '启用' : '禁用';
  document.getElementById('statusLabel').classList.toggle('disabled', !t.classList.contains('active'));
}

// ==================== 关联产品渲染 ====================
function renderAssocProducts() {
  var list = document.getElementById('assocProductList');
  document.getElementById('assocCount').textContent = '已关联 ' + assocProducts.length + ' 个产品';
  if (assocProducts.length === 0) {
    list.innerHTML = '<div class="assoc-empty">暂未关联产品，点击「关联产品」开始添加</div>';
    return;
  }
  var colors = ['#C9A96E', '#6B8F71', '#5B7FBF', '#C06070', '#8B7A9E', '#D4A76A', '#5A9E8F', '#7B9EC7'];
  var isManual = document.getElementById('sortMethod').value === 'manual';
  list.innerHTML = assocProducts.map(function(p, i) {
    var c = colors[(p.id || i) % colors.length];
    return '<div class="assoc-product-item" data-id="' + p.id + '" ' + (isManual ? 'draggable="true"' : '') + '>' +
      (isManual ? '<span class="sort-handle">&#9776;</span>' : '') +
      '<div class="product-img" style="background:linear-gradient(135deg,' + c + ',' + c + '88);color:white;">' + (p.name || '').charAt(0) + '</div>' +
      '<div class="product-info"><div class="product-name">' + p.name + '</div><div class="product-meta">$' + (p.price || '--') + '</div></div>' +
      '<span class="remove-product" onclick="removeAssocProduct(\'' + p.id + '\')">&times;</span>' +
    '</div>';
  }).join('');
  if (isManual) enableSortDrag();
}
function removeAssocProduct(id) {
  assocProducts = assocProducts.filter(function(p) { return p.id !== id; });
  renderAssocProducts();
  showToast('info', '已移除产品');
}
function sortAssocProducts() {
  var sm = document.getElementById('sortMethod').value;
  switch (sm) {
    case 'created-desc':
      assocProducts.sort(function(a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });
      break;
    case 'created-asc':
      assocProducts.sort(function(a, b) { return (a.createdAt || '').localeCompare(b.createdAt || ''); });
      break;
    case 'title-asc':
      assocProducts.sort(function(a, b) { return (a.name || '').localeCompare(b.name || '', 'zh'); });
      break;
    case 'title-desc':
      assocProducts.sort(function(a, b) { return (b.name || '').localeCompare(a.name || '', 'zh'); });
      break;
    case 'price-desc':
      assocProducts.sort(function(a, b) { return (b.price || 0) - (a.price || 0); });
      break;
    case 'price-asc':
      assocProducts.sort(function(a, b) { return (a.price || 0) - (b.price || 0); });
      break;
    case 'manual':
      // 手动模式保持当前顺序不变
      break;
  }
}
function onSortMethodChange() {
  var sm = document.getElementById('sortMethod').value;
  document.getElementById('sortHint').textContent = sm === 'manual' ? '拖拽已关联产品列表中的产品行调整顺序' : '新产品默认排在已关联产品列表末尾';
  sortAssocProducts();
  renderAssocProducts();
}

// 手动排序拖拽
function enableSortDrag() {
  var list = document.getElementById('assocProductList');
  var items = list.querySelectorAll('.assoc-product-item');
  var dragItem = null;
  items.forEach(function(item) {
    item.addEventListener('dragstart', function(e) {
      dragItem = this; this.style.opacity = '0.4'; e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragover', function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    item.addEventListener('drop', function(e) {
      e.preventDefault();
      if (dragItem && dragItem !== this) {
        var allItems = Array.from(list.querySelectorAll('.assoc-product-item'));
        var fromIdx = allItems.indexOf(dragItem);
        var toIdx = allItems.indexOf(this);
        if (fromIdx >= 0 && toIdx >= 0) {
          var moved = assocProducts.splice(fromIdx, 1)[0];
          assocProducts.splice(toIdx, 0, moved);
          renderAssocProducts();
        }
      }
    });
    item.addEventListener('dragend', function() { this.style.opacity = '1'; dragItem = null; });
  });
}

// ==================== 产品选择对话框 ====================
var conditionLogic = 'ALL';
var conditions = [];
var pickerProducts = [];     // 筛选结果
var pickerSelected = {};    // 被勾选的 { id: true }

// 模拟产品池（实际从 window.products 读取）
function getProductPool() {
  if (typeof products !== 'undefined' && products.length) return products;
  return [
    { id: 1, name: '13x4 HD Lace Frontal', category: 'Human Hair', price: 129, status: 'on-sale', tags: ['热销', '新品'], createdAt: '2026-06-15' },
    { id: 2, name: 'Body Wave 180% Density', category: 'Human Hair', price: 189, status: 'on-sale', tags: ['热销'], createdAt: '2026-06-20' },
    { id: 3, name: 'Straight 13x6 Lace Wig', category: 'Human Hair', price: 159, status: 'on-sale', tags: ['新品'], createdAt: '2026-07-01' },
    { id: 4, name: 'Curly Synthetic Lace Front', category: 'Synthetic', price: 49, status: 'on-sale', tags: ['折扣'], createdAt: '2026-05-10' },
    { id: 5, name: 'Bob Cut Lace Closure', category: 'Accessories', price: 79, status: 'off-sale', tags: ['清仓'], createdAt: '2026-04-28' },
    { id: 6, name: 'Deep Wave HD Lace', category: 'Human Hair', price: 199, status: 'on-sale', tags: ['热销', '新品'], createdAt: '2026-07-05' },
    { id: 7, name: 'Kinky Straight Frontal', category: 'Human Hair', price: 169, status: 'on-sale', tags: [], createdAt: '2026-06-18' },
    { id: 8, name: 'Water Wave 13x4', category: 'Synthetic', price: 55, status: 'on-sale', tags: ['折扣'], createdAt: '2026-06-25' },
  ];
}

// 条件字段定义
var COND_FIELDS = [
  { value: 'name', label: '商品标题', ops: ['contains', 'not_contains'], valType: 'text' },
  { value: 'category', label: '商品分类', ops: ['equals', 'not_equals'], valType: 'select' },
  { value: 'tags', label: '商品标记', ops: ['contains', 'not_contains'], valType: 'tags' },
  { value: 'price', label: '商品售价', ops: ['gt', 'lt', 'eq', 'between'], valType: 'number' },
  { value: 'originalPrice', label: '商品原价', ops: ['gt', 'lt', 'eq', 'between'], valType: 'number' },
  { value: 'status', label: '商品状态', ops: ['equals', 'not_equals'], valType: 'status' },
];

var OP_LABELS = { contains: '包含', not_contains: '不包含', equals: '等于', not_equals: '不等于', gt: '大于', lt: '小于', eq: '等于', between: '区间' };

var CATEGORIES = ['Human Hair', 'Synthetic', 'Accessories'];
var ALL_TAGS = ['热销', '新品', '折扣', '清仓'];

function setConditionLogic(logic) {
  conditionLogic = logic;
  document.getElementById('logicAll').classList.toggle('checked', logic === 'ALL');
  document.getElementById('logicAny').classList.toggle('checked', logic === 'ANY');
  filterPickerProducts();
}

function addCondition(init) {
  var c = init || { field: 'name', op: 'contains', value: '' };
  conditions.push(c);
  renderConditions();
  filterPickerProducts();
}

function removeCondition(idx) {
  conditions.splice(idx, 1);
  renderConditions();
  filterPickerProducts();
}

function updateCondition(idx, prop, val) {
  conditions[idx][prop] = val;
  if (prop === 'field') {
    var fd = COND_FIELDS.find(function(f) { return f.value === val; });
    conditions[idx].op = fd && fd.ops.length ? fd.ops[0] : 'contains';
    conditions[idx].value = '';
  }
  renderConditions();
  filterPickerProducts();
}

function renderConditions() {
  var html = conditions.map(function(c, i) {
    var fd = COND_FIELDS.find(function(f) { return f.value === c.field; });
    var ops = fd ? fd.ops : ['contains'];
    var valHtml = '';
    if (fd) {
      if (fd.valType === 'select') {
        valHtml = '<select class="cond-value" onchange="updateCondition(' + i + ',\'value\',this.value)">' +
          '<option value="">请选择</option>' + CATEGORIES.map(function(v) { return '<option value="' + v + '"' + (c.value === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') +
          '</select>';
      } else if (fd.valType === 'status') {
        valHtml = '<select class="cond-value" onchange="updateCondition(' + i + ',\'value\',this.value)">' +
          '<option value="">请选择</option>' +
          '<option value="on-sale"' + (c.value === 'on-sale' ? ' selected' : '') + '>已上架</option>' +
          '<option value="off-sale"' + (c.value === 'off-sale' ? ' selected' : '') + '>已下架</option>' +
          '</select>';
      } else if (fd.valType === 'tags') {
        valHtml = '<select class="cond-value" onchange="updateCondition(' + i + ',\'value\',this.value)">' +
          '<option value="">请选择标记</option>' + ALL_TAGS.map(function(v) { return '<option value="' + v + '"' + (c.value === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') +
          '</select>';
      } else if (c.op === 'between') {
        var parts = (c.value || '').split(',');
        valHtml = '<input class="cond-value" style="width:70px;" value="' + (parts[0] || '') + '" placeholder="最小值" onchange="updateBetween(' + i + ',0,this.value)" />' +
          '<span style="margin:0 4px;">-</span>' +
          '<input class="cond-value" style="width:70px;" value="' + (parts[1] || '') + '" placeholder="最大值" onchange="updateBetween(' + i + ',1,this.value)" />';
      } else {
        valHtml = '<input class="cond-value" value="' + c.value + '" placeholder="请输入值" onchange="updateCondition(' + i + ',\'value\',this.value)" />';
      }
    }
    return '<div class="condition-row">' +
      '<select class="cond-field" onchange="updateCondition(' + i + ',\'field\',this.value)">' +
        COND_FIELDS.map(function(f) { return '<option value="' + f.value + '"' + (c.field === f.value ? ' selected' : '') + '>' + f.label + '</option>'; }).join('') +
      '</select>' +
      '<select class="cond-op" onchange="updateCondition(' + i + ',\'op\',this.value)">' +
        ops.map(function(o) { return '<option value="' + o + '"' + (c.op === o ? ' selected' : '') + '>' + OP_LABELS[o] + '</option>'; }).join('') +
      '</select>' +
      valHtml +
      '<span class="cond-remove" onclick="removeCondition(' + i + ')" title="移除条件">&times;</span>' +
    '</div>';
  }).join('');
  document.getElementById('conditionRows').innerHTML = html;
}

function updateBetween(idx, pos, val) {
  var parts = (conditions[idx].value || '').split(',');
  parts[pos] = val;
  conditions[idx].value = parts.join(',');
  filterPickerProducts();
}

function matchCondition(product, cond) {
  var val = null;
  if (cond.field === 'name') val = product.name || '';
  else if (cond.field === 'category') val = product.category || '';
  else if (cond.field === 'status') val = product.status || '';
  else if (cond.field === 'price') val = product.price || 0;
  else if (cond.field === 'originalPrice') val = product.originalPrice || product.price || 0;
  else if (cond.field === 'tags') val = (product.tags || []).join(',');

  if (cond.op === 'contains') return String(val).toLowerCase().indexOf(String(cond.value).toLowerCase()) >= 0;
  if (cond.op === 'not_contains') return String(val).toLowerCase().indexOf(String(cond.value).toLowerCase()) < 0;
  if (cond.op === 'equals') return String(val).toLowerCase() === String(cond.value).toLowerCase();
  if (cond.op === 'not_equals') return String(val).toLowerCase() !== String(cond.value).toLowerCase();
  if (cond.op === 'gt') return Number(val) > Number(cond.value);
  if (cond.op === 'lt') return Number(val) < Number(cond.value);
  if (cond.op === 'eq') return Number(val) === Number(cond.value);
  if (cond.op === 'between') {
    var parts = (cond.value || '').split(',');
    var v = Number(val);
    var min = parts[0] ? Number(parts[0]) : -Infinity;
    var max = parts[1] ? Number(parts[1]) : Infinity;
    return v >= min && v <= max;
  }
  return false;
}

function filterPickerProducts() {
  var pool = getProductPool();
  // 排除已关联产品
  var assocIds = assocProducts.map(function(p) { return p.id; });
  pool = pool.filter(function(p) { return assocIds.indexOf(p.id) < 0; });

  if (conditions.length === 0) {
    pickerProducts = pool;
    document.getElementById('pickerEmpty').style.display = pool.length === 0 ? 'block' : 'none';
    document.getElementById('pickerProductGrid').style.display = pool.length > 0 ? '' : 'none';
  } else {
    pickerProducts = pool.filter(function(product) {
      if (conditionLogic === 'ALL') {
        return conditions.every(function(c) { return matchCondition(product, c); });
      } else {
        return conditions.some(function(c) { return matchCondition(product, c); });
      }
    });
  }
  renderPickerProducts();
}

function renderPickerProducts() {
  var grid = document.getElementById('pickerProductGrid');
  var empty = document.getElementById('pickerEmpty');
  var colors = ['#C9A96E', '#6B8F71', '#5B7FBF', '#C06070', '#8B7A9E', '#D4A76A', '#5A9E8F', '#7B9EC7'];

  if (pickerProducts.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    grid.innerHTML = pickerProducts.map(function(p) {
      var c = colors[p.id % colors.length];
      var sel = pickerSelected[p.id];
      return '<div class="picker-product-card' + (sel ? ' selected' : '') + '" onclick="togglePickerProduct(' + p.id + ')">' +
        '<div class="card-img" style="position:relative;background:linear-gradient(135deg,' + c + ',' + c + '88);">' +
          '<span style="font-size:24px;opacity:0.6;">' + (p.name || '').charAt(0) + '</span>' +
          '<div class="check-mark"' + (sel ? '' : ' style="display:none;"') + '>&#10003;</div>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-name">' + p.name + '</div>' +
          '<div class="card-price">$' + (p.price || '--') + ' <span class="card-status" style="color:' + (p.status === 'on-sale' ? 'hsl(142 55% 35%)' : 'hsl(var(--muted-foreground))') + ';">' + (p.status === 'on-sale' ? '已上架' : '已下架') + '</span></div>' +
        '</div>' +
      '</div>';
    }).join('');
  }
  updatePickerSelectionUI();
}

function togglePickerProduct(id) {
  pickerSelected[id] = !pickerSelected[id];
  renderPickerProducts();
}

function toggleSelectAllPicker() {
  var allSelected = pickerProducts.every(function(p) { return pickerSelected[p.id]; });
  pickerProducts.forEach(function(p) { pickerSelected[p.id] = !allSelected; });
  renderPickerProducts();
}

function updatePickerSelectionUI() {
  var cnt = Object.values(pickerSelected).filter(Boolean).length;
  document.getElementById('pickerSelectedCount').textContent = cnt > 0 ? '（已选 ' + cnt + ' 个）' : '';
  var allSel = pickerProducts.length > 0 && pickerProducts.every(function(p) { return pickerSelected[p.id]; });
  document.getElementById('pickerSelectAllCb').classList.toggle('checked', allSel);
  document.getElementById('pickerSelectAllCb').innerHTML = allSel ? '&#10003;' : '';
  document.getElementById('pickerFooterInfo').textContent = '共筛选出 ' + pickerProducts.length + ' 个产品';
}

function openProductPicker() {
  // 初始化选中状态
  pickerSelected = {};
  assocProducts.forEach(function(p) { pickerSelected[p.id] = true; });
  conditions = [];
  conditionLogic = 'ALL';
  document.getElementById('logicAll').classList.add('checked');
  document.getElementById('logicAny').classList.remove('checked');
  renderConditions();
  addCondition();
  filterPickerProducts();
  document.getElementById('productPickerOverlay').style.display = 'flex';
  document.getElementById('productPickerOverlay').onclick = function(e) {
    if (e.target === document.getElementById('productPickerOverlay')) closeProductPicker();
  };
}

function closeProductPicker() {
  document.getElementById('productPickerOverlay').style.display = 'none';
}

function confirmProductPicker() {
  var selected = pickerProducts.filter(function(p) { return pickerSelected[p.id]; });
  selected.forEach(function(p) {
    if (!assocProducts.find(function(a) { return a.id === p.id; })) {
      assocProducts.push({ id: p.id, name: p.name, price: p.price, status: p.status, createdAt: p.createdAt });
    }
  });
  sortAssocProducts();
  renderAssocProducts();
  closeProductPicker();
  showToast('success', '已添加 ' + selected.length + ' 个产品');
}

// ==================== 保存 ====================
function saveCollection() {
  var name = document.getElementById('collectionName').value.trim();
  if (!name) { showToast('error', '请填写系列名称'); document.getElementById('collectionName').focus(); return; }

  var slug = document.getElementById('seoSlug').value.trim();
  // 自动生成 slug
  if (!slug) {
    slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').substring(0, 100);
    document.getElementById('seoSlug').value = slug;
  }
  // 检查 slug 唯一性
  var dup = collections.find(function(c) { return c.slug === slug && c.id !== editingId; });
  if (dup) { showToast('error', '该网址名称已被使用，请修改'); return; }

  var status = document.getElementById('statusToggle').querySelector('.toggle').classList.contains('active') ? 'enabled' : 'disabled';
  var sortMethod = document.getElementById('sortMethod').value;

  if (isEditMode) {
    var col = collections.find(function(c) { return c.id === editingId; });
    if (col) {
      col.name = name;
      col.cover = coverDataUrl || col.cover;
      col.status = status;
      col.seoTitle = document.getElementById('seoTitle').value.trim();
      col.seoDesc = document.getElementById('seoDesc').value.trim();
      col.slug = slug;
      col.sortMethod = sortMethod;
      col.assocProducts = assocProducts.slice();
      col.productCount = assocProducts.length;
      saveCollections(collections);
      showToast('success', '保存成功');
    }
  } else {
    var newCol = {
      id: 'col-' + Date.now(),
      name: name,
      cover: coverDataUrl,
      status: status,
      seoTitle: document.getElementById('seoTitle').value.trim(),
      seoDesc: document.getElementById('seoDesc').value.trim(),
      slug: slug,
      sortMethod: sortMethod,
      assocProducts: assocProducts.slice(),
      productCount: assocProducts.length,
      createdAt: new Date().toISOString().split('T')[0]
    };
    // 检查名称唯一性
    var dup = collections.find(function(c) { return c.name === name; });
    if (dup) { showToast('error', '该系列名称已被使用'); return; }
    collections.unshift(newCol);
    saveCollections(collections);
    showToast('success', '系列创建成功');
  }
  setTimeout(function() { navigateToPage('collection_list.html'); }, 600);
}

function cancelForm() {
  navigateToPage('collection_list.html');
}

// ==================== 初始化 ====================
(function initForm() {
  var id = getUrlParam('id');
  if (id) {
    isEditMode = true;
    editingId = id;
    var col = collections.find(function(c) { return c.id === id; });
    if (col) {
      document.getElementById('formTitle').textContent = '编辑系列';
      document.getElementById('formSubtitle').textContent = '修改系列信息、更新产品关联及排序设置';
      document.getElementById('collectionName').value = col.name || '';
      document.getElementById('seoTitle').value = col.seoTitle || '';
      document.getElementById('seoDesc').value = col.seoDesc || '';
      document.getElementById('seoSlug').value = col.slug || '';
      document.getElementById('sortMethod').value = col.sortMethod || 'created-desc';
      if (col.status === 'disabled') {
        document.getElementById('statusToggle').querySelector('.toggle').classList.remove('active');
        document.getElementById('statusLabel').textContent = '禁用';
        document.getElementById('statusLabel').classList.add('disabled');
      }
      if (col.cover) setCoverPreview(col.cover);
      assocProducts = (col.assocProducts || []).slice();
      updateNameCount();
      updateSeoTitleCount();
      updateSeoDescCount();
      renderAssocProducts();
      onSortMethodChange();
      return;
    }
  }
  updateNameCount();
  updateSeoTitleCount();
  updateSeoDescCount();
  onSortMethodChange();
})();
