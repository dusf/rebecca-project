// ==================== 页面编辑 - JS ====================
var editingId = null;
var currentLocale = '';
var supportedLocales = [];

// ==================== 模拟数据 ====================
var pagesData = [
  { id: 'P001', title: '关于我们', handle: 'about-us', locale: 'zh_CN', locales: ['zh_CN', 'en_US'], status: 'published', publishedAt: '2026-07-20', seoTitle: '关于我们 | QVR品牌站', seoDesc: 'QVR品牌故事与使命', body: '<h2>关于QVR</h2><p>QVR是一个专注于高品质发饰的品牌...</p>' },
  { id: 'P002', title: 'Contact Us', handle: 'contact-us', locale: 'en_US', locales: ['en_US'], status: 'published', publishedAt: '2026-07-19', seoTitle: 'Contact Us | QVR', seoDesc: 'Get in touch with QVR', body: '<h2>Contact Us</h2><p>Email: support@qvr.com</p>' },
];

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
  supportedLocales = window.getShopSupportedLocales();
  currentLocale = window.getShopDefaultLocale();
  editingId = sessionStorage.getItem('editPageId');
  sessionStorage.removeItem('editPageId');
  if (editingId) {
    loadExistingPage(editingId);
  } else {
    document.getElementById('pageTitle').textContent = '新建页面';
    renderLocaleSelector();
    updateSeoCounts();
  }
});

function loadExistingPage(id) {
  var p = pagesData.find(function(pr) { return pr.id === id; });
  if (!p) {
    showPageToast('error', '页面记录不存在');
    setTimeout(function() { goBack(); }, 1500);
    return;
  }
  editingId = p.id;
  document.getElementById('pageTitle').textContent = '编辑页面 - ' + p.title;
  currentLocale = p.locale;
  renderLocaleSelector();
  fillFormFields(p);
}

function fillFormFields(p) {
  setVal('contentTitle', p.title || '');
  setVal('contentHandle', p.handle || '');
  setVal('seoTitle', p.seoTitle || '');
  setVal('seoDesc', p.seoDesc || '');
  document.getElementById('richtextEditor').innerHTML = p.body || '';
  if (p.status === 'published') toggleOn('statusToggle');
  if (p.status === 'disabled') toggleOn('disabledToggle');
  updateSeoCounts();
}

function setVal(id, val) {
  var el = document.getElementById(id);
  if (el) el.value = val !== null && val !== undefined ? val : '';
}

// ==================== 语言版本选择器 ====================
function renderLocaleSelector() {
  var container = document.getElementById('localeSelector');
  if (!container) return;
  container.innerHTML = supportedLocales.map(function(loc) {
    var active = loc.key === currentLocale ? ' active' : '';
    return '<span class="locale-option' + active + '" onclick="switchLocale(\'' + loc.key + '\')">' + loc.flag + ' ' + loc.label + '</span>';
  }).join('');
}

function switchLocale(locale) {
  if (locale === currentLocale) return;
  // Save current locale data
  currentLocale = locale;
  renderLocaleSelector();
  var label = window.getShopLocaleLabel ? window.getShopLocaleLabel(locale) : locale;
  showPageToast('info', '已切换到 ' + label + ' 版本');
}

// ==================== 返回 ====================
function goBack() {
  if (typeof navigateToPage === 'function') {
    navigateToPage('content/page_list.html');
  } else {
    window.history.back();
  }
}

// ==================== Toggle ====================
function toggleSwitch(el) { el.classList.toggle('active'); }
function toggleOn(id) { var el = document.getElementById(id); if (el) el.classList.add('active'); }

// ==================== 简易富文本编辑器 ====================
function execCmd(command, value) {
  document.execCommand(command, false, value || null);
  document.getElementById('richtextEditor').focus();
}

function insertLink() {
  var url = prompt('请输入链接地址：', 'https://');
  if (url) {
    var text = window.getSelection().toString() || url;
    document.execCommand('createLink', false, url);
  }
}

function insertImage() {
  var url = prompt('请输入图片URL或点击确定从媒体库选择：', 'https://');
  if (url) document.execCommand('insertImage', false, url);
}

function insertVideo() {
  var url = prompt('请输入视频URL（YouTube/Vimeo）：', 'https://');
  if (url) {
    var editor = document.getElementById('richtextEditor');
    var iframeHtml = '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:16px 0;"><iframe src="' + url.replace('watch?v=', 'embed/') + '" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen></iframe></div>';
    editor.focus();
    document.execCommand('insertHTML', false, iframeHtml);
  }
}

function insertProductCard() {
  var productName = prompt('请输入商品名称：', '');
  if (!productName) return;
  var editor = document.getElementById('richtextEditor');
  var cardHtml = '<div style="display:inline-block;border:1px solid #e5e5e5;border-radius:8px;padding:12px;margin:8px;text-align:center;cursor:pointer;max-width:200px;"><div style="width:120px;height:120px;background:#f5f5f5;border-radius:6px;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:32px;">📦</div><div style="font-size:14px;font-weight:500;margin-bottom:4px;">' + productName + '</div><div style="font-size:13px;color:#D4845A;font-weight:600;">$29.99</div></div>';
  editor.focus();
  document.execCommand('insertHTML', false, cardHtml);
}

function insertDivider() {
  var editor = document.getElementById('richtextEditor');
  editor.focus();
  document.execCommand('insertHTML', false, '<hr>');
}

function formatHeading(value) {
  document.execCommand('formatBlock', false, '<' + value + '>');
}

// ==================== SEO 字符计数 ====================
document.addEventListener('input', function(e) {
  if (e.target.id === 'seoTitle' || e.target.id === 'seoDesc') updateSeoCounts();
});

function updateSeoCounts() {
  var titleVal = document.getElementById('seoTitle').value;
  var descVal = document.getElementById('seoDesc').value;
  var titleCount = document.getElementById('seoTitleCount');
  var descCount = document.getElementById('seoDescCount');
  if (titleCount) {
    titleCount.textContent = titleVal.length + '/70';
    titleCount.className = 'char-count' + (titleVal.length > 70 ? ' warn' : '');
  }
  if (descCount) {
    descCount.textContent = descVal.length + '/160';
    descCount.className = 'char-count' + (descVal.length > 160 ? ' warn' : '');
  }
}

// ==================== Toast ====================
function showPageToast(type, msg) {
  var toast = document.getElementById('pageToast');
  if (!toast) return;
  toast.className = 'toast ' + type;
  toast.textContent = msg;
  setTimeout(function() { toast.classList.add('show'); }, 10);
  setTimeout(function() { toast.classList.remove('show'); }, 2500);
}

// ==================== 保存/发布 ====================
function saveDraft() { submitPage('draft'); }
function publishPage() { submitPage('published'); }

function submitPage(status) {
  var title = document.getElementById('contentTitle').value.trim();
  if (!title) { showPageToast('error', '请输入页面标题'); return; }
  var handle = document.getElementById('contentHandle').value.trim();
  // Auto-generate handle
  if (!handle) {
    handle = title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
  }
  // Save
  var pageData = {
    id: editingId || 'P' + Date.now(),
    title: title,
    handle: handle,
    locale: currentLocale,
    status: status,
    seoTitle: document.getElementById('seoTitle').value.trim(),
    seoDesc: document.getElementById('seoDesc').value.trim(),
    body: document.getElementById('richtextEditor').innerHTML,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  if (status === 'published') pageData.publishedAt = new Date().toISOString().slice(0, 10);
  showPageToast('success', '页面「' + title + '」已' + (status === 'published' ? '发布' : '保存为草稿') + '！');
  setTimeout(function() { goBack(); }, 800);
}

// ==================== 全屏对话框（商品卡片选择） ====================
function openProductCardDialog() {
  var products = [
    { id: 'PRD001', name: '奢华全蕾丝发套', price: 89.99 },
    { id: 'PRD002', name: '接发系列 - 自然黑', price: 49.99 },
    { id: 'PRD003', name: '发饰配件套装', price: 19.99 },
    { id: 'PRD004', name: '护理精油', price: 29.99 },
  ];
  var html = '<div class="content-dialog-overlay" onclick="if(event.target===this)closePageDialog()"><div class="content-dialog" style="width:640px;"><div class="content-dialog-header">' +
    '<span class="content-dialog-title">插入商品卡片</span>' +
    '<button class="content-dialog-close" onclick="closePageDialog()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
    '</div><div class="content-dialog-body">' +
    '<div class="form-group" style="margin-bottom:16px;"><input type="text" class="form-input" id="productSearchDlg" placeholder="搜索商品..." oninput="filterProductCards()"></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;" id="productCardList">' +
    products.map(function(pr) {
      return '<div class="form-section-card" style="margin-bottom:0;cursor:pointer;transition:all 0.15s;" onclick="selectProductCard(\'' + pr.name + '\', \'' + pr.price + '\')" onmouseover="this.style.borderColor=\'var(--primary)\'" onmouseout="this.style.borderColor=\'\'"><div style="text-align:center;font-size:40px;margin-bottom:8px;">📦</div><div style="font-weight:600;font-size:14px;margin-bottom:4px;">' + pr.name + '</div><div style="color:hsl(var(--primary));font-weight:600;">$' + pr.price.toFixed(2) + '</div></div>';
    }).join('') +
    '</div></div><div class="content-dialog-actions"><button class="btn btn-secondary btn-sm" onclick="closePageDialog()">取消</button></div></div></div>';
  openPageDialog(html);
}

function filterProductCards() {
  var s = document.getElementById('productSearchDlg').value.toLowerCase();
  document.querySelectorAll('#productCardList > div').forEach(function(el) {
    var name = el.querySelector('div:nth-child(2)').textContent.toLowerCase();
    el.style.display = name.indexOf(s) !== -1 ? '' : 'none';
  });
}

function selectProductCard(name, price) {
  closePageDialog();
  var editor = document.getElementById('richtextEditor');
  var cardHtml = '<div style="display:inline-block;border:1px solid #e5e5e5;border-radius:8px;padding:12px;margin:8px;text-align:center;cursor:pointer;max-width:200px;"><div style="width:120px;height:120px;background:#f5f5f5;border-radius:6px;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:32px;">📦</div><div style="font-size:14px;font-weight:500;margin-bottom:4px;">' + name + '</div><div style="font-size:13px;color:#D4845A;font-weight:600;">$' + price + '</div></div>';
  editor.focus();
  document.execCommand('insertHTML', false, cardHtml);
}

function openPageDialog(html) {
  closePageDialog();
  var overlay = document.createElement('div');
  overlay.id = 'pageDialogRoot';
  overlay.innerHTML = html;
  document.body.appendChild(overlay.firstElementChild);
}

function closePageDialog() {
  var el = document.querySelector('.content-dialog-overlay');
  if (el) el.remove();
}

// Esc 关闭对话框
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closePageDialog();
});
