// ==================== 文章编辑 - JS ====================
var editingId = null;
var currentTags = [];
var currentLocale = '';
var coverImageData = null;
var supportedLocales = [];

// ==================== 模拟数据 ====================
var articlesData = [
  { id: 'A001', title: '如何选择适合你的发套', handle: 'how-to-choose-a-wig', status: 'published', category: 'c1', tags: ['发型', '教程'], readCount: 1234, isPinned: false, scheduledAt: null, publishedAt: '2026-07-15', seoTitle: '如何选择发套 | QVR', seoDesc: '了解脸型、长度、材质...', body: '<h2>选择发套的五大要点</h2><p>每个人的脸型、肤色和风格偏好都不同...</p>' },
];

var articleCategories = [];

function getDefaultArticleCategories() {
  var locales = supportedLocales;
  var l1 = locales.length > 0 ? locales[0].key : 'zh_CN';
  var l2 = locales.length > 1 ? locales[1].key : 'en_US';
  var defaults = {
    'zh_CN': [
      { name: '护理知识',  desc: '假发护理、洗护技巧与保养指南' },
      { name: '时尚趋势',  desc: '全球假发时尚潮流与搭配灵感' },
      { name: '产品评测',  desc: '真实产品使用体验与对比评测' },
      { name: '买家秀',    desc: '买家真实佩戴效果展示与分享' },
      { name: '品牌故事',  desc: '品牌文化理念与幕后精彩故事' },
    ],
    'en_US': [
      { name: 'Hair Care',       desc: 'Wig care, washing tips and maintenance guide' },
      { name: 'Fashion Trends',  desc: 'Global wig fashion trends and styling inspiration' },
      { name: 'Product Review',  desc: 'Real product reviews and comparisons' },
      { name: 'Buyer Showcase',  desc: 'Real buyer wearing showcase and sharing' },
      { name: 'Brand Story',     desc: 'Brand culture philosophy and behind-the-scenes stories' },
    ],
  };
  var handles = ['hair-care', 'fashion-trends', 'product-review', 'buyer-show', 'brand-story'];
  return handles.map(function(h, i) {
    var name = {}, desc = {};
    locales.forEach(function(loc) {
      var row = (defaults[loc.key] || defaults['en_US'] || [[]])[i] || { name: h, desc: '' };
      name[loc.key] = row.name;
      desc[loc.key] = row.desc;
    });
    return { id: 'c' + (i + 1), handle: h, name: name, description: desc, image: '', sortOrder: i + 1 };
  });
}

document.addEventListener('DOMContentLoaded', function() {
  supportedLocales = window.getShopSupportedLocales();
  currentLocale = window.getShopDefaultLocale();
  var shopKey = (window.getCurrentShopId ? window.getCurrentShopId() : 'qvr') + '_article_categories_v2';
  articleCategories = JSON.parse(localStorage.getItem(shopKey)) || getDefaultArticleCategories();
  editingId = sessionStorage.getItem('editArticleId');
  sessionStorage.removeItem('editArticleId');
  buildCategorySelect();
  if (editingId) { loadExistingArticle(editingId); }
  else { document.getElementById('articlePageTitle').textContent = '新建文章'; renderLocaleSelector(); updateSeoCounts(); renderTags(); }
});

function buildCategorySelect() {
  var sel = document.getElementById('articleCategory');
  if (!sel) return;
  var locale = currentLocale || (supportedLocales.length > 0 ? supportedLocales[0].key : 'zh_CN');
  sel.innerHTML = '<option value="">请选择分类</option>' + articleCategories.map(function(c) {
    return '<option value="' + c.id + '">' + ((c.name && c.name[locale]) || (c.name && c.name[supportedLocales.length > 0 ? supportedLocales[0].key : 'zh_CN']) || c.id) + '</option>';
  }).join('');
}

function loadExistingArticle(id) {
  var a = articlesData.find(function(ar) { return ar.id === id; });
  if (!a) { showArticleToast('error', '文章记录不存在'); setTimeout(function() { goBack(); }, 1500); return; }
  editingId = a.id;
  document.getElementById('articlePageTitle').textContent = '编辑文章 - ' + a.title;
  currentLocale = a.locale || (supportedLocales.length > 0 ? supportedLocales[0].key : 'zh_CN');
  renderLocaleSelector();
  setVal('contentTitle', a.title || '');
  setVal('contentHandle', a.handle || '');
  setVal('articleCategory', a.category || '');
  setVal('seoTitle', a.seoTitle || '');
  setVal('seoDesc', a.seoDesc || '');
  document.getElementById('richtextEditor').innerHTML = a.body || '';
  if (a.scheduledAt) { toggleOn('scheduleToggle'); setVal('scheduledAt', a.scheduledAt.slice(0, 16)); }
  if (a.isPinned) toggleOn('pinToggle');
  if (a.status === 'published') toggleOn('statusToggle');
  // 回填封面图
  if (a.coverImage) {
    coverImageData = a.coverImage;
    document.getElementById('coverPreviewImg').src = coverImageData;
    document.getElementById('coverPreview').style.display = 'block';
    document.getElementById('coverPlaceholder').style.display = 'none';
  } else { coverImageData = null; }
  currentTags = a.tags || [];
  renderTags();
  updateSeoCounts();
}

function setVal(id, val) { var el = document.getElementById(id); if (el) el.value = val !== null && val !== undefined ? val : ''; }
function goBack() { if (typeof navigateToPage === 'function') navigateToPage('content/article_list.html'); else window.history.back(); }
function toggleSwitch(el) { el.classList.toggle('active'); }
function toggleOn(id) { var el = document.getElementById(id); if (el) el.classList.add('active'); }

// ==================== 标签管理 ====================
function renderTags() {
  var container = document.getElementById('tagContainer');
  if (!container) return;
  var html = currentTags.map(function(t) {
    return '<span class="tag-chip">' + t + '<span class="tag-remove" onclick="removeTag(\'' + t + '\')">×</span></span>';
  }).join('');
  html += '<input type="text" class="tag-input" id="tagInput" placeholder="输入标签后按回车" onkeydown="addTag(event)">';
  container.innerHTML = html;
}

function addTag(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  var val = e.target.value.trim();
  if (!val) return;
  if (currentTags.indexOf(val) !== -1) { showArticleToast('error', '标签已存在'); return; }
  currentTags.push(val);
  renderTags();
}

function removeTag(tag) {
  currentTags = currentTags.filter(function(t) { return t !== tag; });
  renderTags();
}

// ==================== 定时发布 ====================
function onScheduleToggle(el) {
  el.classList.toggle('active');
  var group = document.getElementById('scheduleGroup');
  if (group) group.style.display = el.classList.contains('active') ? '' : 'none';
}

// ==================== SEO 计数 ====================
document.addEventListener('input', function(e) {
  if (e.target.id === 'seoTitle' || e.target.id === 'seoDesc') updateSeoCounts();
});
function updateSeoCounts() {
  var tv = document.getElementById('seoTitle').value, dv = document.getElementById('seoDesc').value;
  var tc = document.getElementById('seoTitleCount'), dc = document.getElementById('seoDescCount');
  if (tc) { tc.textContent = tv.length + '/70'; tc.className = 'char-count' + (tv.length > 70 ? ' warn' : ''); }
  if (dc) { dc.textContent = dv.length + '/160'; dc.className = 'char-count' + (dv.length > 160 ? ' warn' : ''); }
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
  currentLocale = locale;
  renderLocaleSelector();
  buildCategorySelect();
  var label = window.getShopLocaleLabel ? window.getShopLocaleLabel(locale) : locale;
  showArticleToast('info', '已切换到 ' + label + ' 版本');
}

// ==================== 封面图处理 ====================
function handleCoverFile(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  if (!file.type.match(/^image\//)) { showArticleToast('error', '请选择图片文件'); return; }
  if (file.size > 5 * 1024 * 1024) { showArticleToast('error', '图片大小不能超过 5MB'); return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    coverImageData = e.target.result;
    document.getElementById('coverPreviewImg').src = coverImageData;
    document.getElementById('coverPreview').style.display = 'block';
    document.getElementById('coverPlaceholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
  input.value = '';
}
function removeCover() {
  coverImageData = null;
  document.getElementById('coverPreview').style.display = 'none';
  document.getElementById('coverPlaceholder').style.display = 'flex';
  document.getElementById('coverPreviewImg').src = '';
}

function showArticleToast(type, msg) {
  var toast = document.getElementById('articleToast');
  if (!toast) return;
  toast.className = 'toast ' + type; toast.textContent = msg;
  setTimeout(function() { toast.classList.add('show'); }, 10);
  setTimeout(function() { toast.classList.remove('show'); }, 2500);
}

// ==================== 富文本 ====================
function execCmd(cmd, val) { document.execCommand(cmd, false, val || null); document.getElementById('richtextEditor').focus(); }
function formatHeading(val) { document.execCommand('formatBlock', false, '<' + val + '>'); }
function insertLink() { var u = prompt('请输入链接地址：', 'https://'); if (u) { var t = window.getSelection().toString() || u; document.execCommand('createLink', false, u); } }
function insertImage() { var u = prompt('请输入图片URL：', 'https://'); if (u) document.execCommand('insertImage', false, u); }
function insertVideo() {
  var u = prompt('请输入视频URL：', 'https://');
  if (u) {
    var h = '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:16px 0;"><iframe src="' + u.replace('watch?v=', 'embed/') + '" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen></iframe></div>';
    document.getElementById('richtextEditor').focus(); document.execCommand('insertHTML', false, h);
  }
}
function insertDivider() { document.getElementById('richtextEditor').focus(); document.execCommand('insertHTML', false, '<hr>'); }
function openProductCardDialog() { showArticleToast('info', '商品卡片选择器已打开（演示）'); }

// ==================== 保存 ====================
function saveDraft() { submitArticle('draft'); }
function publishArticle() { submitArticle('published'); }

function submitArticle(status) {
  var title = document.getElementById('contentTitle').value.trim();
  if (!title) { showArticleToast('error', '请输入文章标题'); return; }
  var handle = document.getElementById('contentHandle').value.trim();
  if (!handle) handle = title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
  var category = document.getElementById('articleCategory').value;
  if (!category) { showArticleToast('error', '请选择文章分类'); return; }
  var isSchedule = document.getElementById('scheduleToggle').classList.contains('active');
  var scheduledAt = isSchedule ? document.getElementById('scheduledAt').value : null;
  // 提交数据包含语言版本
  var articleData = {
    id: editingId,
    title: title,
    handle: handle,
    category: category,
    locale: currentLocale,
    status: status,
    coverImage: coverImageData,
    seoTitle: document.getElementById('seoTitle').value.trim(),
    seoDesc: document.getElementById('seoDesc').value.trim(),
    body: document.getElementById('richtextEditor').innerHTML,
    tags: currentTags,
    isPinned: document.getElementById('pinToggle').classList.contains('active'),
    scheduledAt: scheduledAt,
  };
  showArticleToast('success', '文章「' + title + '」已' + (status === 'published' ? '发布' : '保存为草稿') + '！');
  setTimeout(function() { goBack(); }, 800);
}

// ==================== 对话框 ====================
function openPageDialog(html) {
  closePageDialog();
  var overlay = document.createElement('div');
  overlay.id = 'pageDialogRoot'; overlay.innerHTML = html;
  document.body.appendChild(overlay.firstElementChild);
}
function closePageDialog() { var el = document.querySelector('.content-dialog-overlay'); if (el) el.remove(); }
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closePageDialog(); });
