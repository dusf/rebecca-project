// ==================== FAQ 帮助条目编辑 - JS ====================
var editingId = null;
var currentLocale = '';
var supportedLocales = [];

var faqGroupsData = [
  { id: 'G001', name: '尺码相关', sortOrder: 1 },
  { id: 'G002', name: '护理与保养', sortOrder: 2 },
  { id: 'G003', name: '配送与物流', sortOrder: 3 },
  { id: 'G004', name: '退换货政策', sortOrder: 4 },
  { id: 'G005', name: '付款与结算', sortOrder: 5 },
];

var faqsData = [
  { id: 'F001', question: '如何正确测量头围？', handle: 'how-to-measure-head', groupId: 'G001', groupName: '尺码相关', status: 'published', sortOrder: 1, publishedAt: '2026-07-20', body: '<p>使用软尺绕头一周，从前额到后脑勺最宽处测量...</p>' },
];

document.addEventListener('DOMContentLoaded', function() {
  supportedLocales = window.getShopSupportedLocales();
  currentLocale = window.getShopDefaultLocale();
  editingId = sessionStorage.getItem('editFaqId');
  sessionStorage.removeItem('editFaqId');
  buildGroupSelect();
  if (editingId) { loadExistingFaq(editingId); }
  else { document.getElementById('faqPageTitle').textContent = '新建帮助条目'; renderLocaleSelector(); updateSeoCounts(); }
});

function buildGroupSelect() {
  var sel = document.getElementById('faqGroup');
  if (!sel) return;
  sel.innerHTML = '<option value="">请选择分类</option>' + faqGroupsData.map(function(g) { return '<option value="' + g.id + '">' + g.name + '</option>'; }).join('');
}

function loadExistingFaq(id) {
  var f = faqsData.find(function(fr) { return fr.id === id; });
  if (!f) { showFaqToast('error', '帮助条目不存在'); setTimeout(function() { goBack(); }, 1500); return; }
  editingId = f.id;
  document.getElementById('faqPageTitle').textContent = '编辑帮助条目 - ' + f.question;
  currentLocale = f.locale || 'zh_CN';
  renderLocaleSelector();
  setVal('contentTitle', f.question || '');
  setVal('contentHandle', f.handle || '');
  setVal('faqGroup', f.groupId || '');
  setVal('seoTitle', f.seoTitle || '');
  setVal('seoDesc', f.seoDesc || '');
  document.getElementById('richtextEditor').innerHTML = f.body || '';
  if (f.status === 'published') toggleOn('statusToggle');
  updateSeoCounts();
}

function setVal(id, val) { var el = document.getElementById(id); if (el) el.value = val !== null && val !== undefined ? val : ''; }
function goBack() { if (typeof navigateToPage === 'function') navigateToPage('content/faq_list.html'); else window.history.back(); }
function toggleSwitch(el) { el.classList.toggle('active'); }
function toggleOn(id) { var el = document.getElementById(id); if (el) el.classList.add('active'); }

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
  var label = window.getShopLocaleLabel ? window.getShopLocaleLabel(locale) : locale;
  showFaqToast('info', '已切换到 ' + label + ' 版本');
}

// ==================== 富文本 ====================
function execCmd(cmd, val) { document.execCommand(cmd, false, val || null); document.getElementById('richtextEditor').focus(); }
function formatHeading(val) { document.execCommand('formatBlock', false, '<' + val + '>'); }
function insertLink() { var u = prompt('请输入链接地址：', 'https://'); if (u) document.execCommand('createLink', false, u); }
function insertImage() { var u = prompt('请输入图片URL：', 'https://'); if (u) document.execCommand('insertImage', false, u); }
function insertVideo() {
  var u = prompt('请输入视频URL：', 'https://');
  if (u) { var h = '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:16px 0;"><iframe src="' + u.replace('watch?v=', 'embed/') + '" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen></iframe></div>'; document.getElementById('richtextEditor').focus(); document.execCommand('insertHTML', false, h); }
}
function insertDivider() { document.getElementById('richtextEditor').focus(); document.execCommand('insertHTML', false, '<hr>'); }
function openProductCardDialog() { showFaqToast('info', '商品卡片选择器已打开（演示）'); }

// SEO counts
document.addEventListener('input', function(e) {
  if (e.target.id === 'seoTitle' || e.target.id === 'seoDesc') updateSeoCounts();
});
function updateSeoCounts() {
  var tv = document.getElementById('seoTitle').value, dv = document.getElementById('seoDesc').value;
  var tc = document.getElementById('seoTitleCount'), dc = document.getElementById('seoDescCount');
  if (tc) { tc.textContent = tv.length + '/70'; tc.className = 'char-count' + (tv.length > 70 ? ' warn' : ''); }
  if (dc) { dc.textContent = dv.length + '/160'; dc.className = 'char-count' + (dv.length > 160 ? ' warn' : ''); }
}

function showFaqToast(type, msg) {
  var toast = document.getElementById('faqToast');
  if (!toast) return;
  toast.className = 'toast ' + type; toast.textContent = msg;
  setTimeout(function() { toast.classList.add('show'); }, 10);
  setTimeout(function() { toast.classList.remove('show'); }, 2500);
}

// ==================== 保存/发布 ====================
function saveDraft() { submitFaq('draft'); }
function publishFaq() { submitFaq('published'); }

function submitFaq(status) {
  var question = document.getElementById('contentTitle').value.trim();
  if (!question) { showFaqToast('error', '请输入问题标题'); return; }
  var handle = document.getElementById('contentHandle').value.trim();
  if (!handle) handle = question.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
  var groupId = document.getElementById('faqGroup').value;
  if (!groupId) { showFaqToast('error', '请选择所属分类'); return; }
  // 提交数据包含语言版本
  var faqData = {
    id: editingId,
    question: question,
    handle: handle,
    groupId: groupId,
    locale: currentLocale,
    status: status,
    seoTitle: document.getElementById('seoTitle').value.trim(),
    seoDesc: document.getElementById('seoDesc').value.trim(),
    body: document.getElementById('richtextEditor').innerHTML,
  };
  showFaqToast('success', '帮助条目「' + question + '」已' + (status === 'published' ? '发布' : '保存为草稿') + '！');
  setTimeout(function() { goBack(); }, 800);
}

// ==================== 对话框 ====================
function faqOpenDialog(html) { faqCloseDialog(); var o = document.createElement('div'); o.id = 'faqDlgRoot'; o.innerHTML = html; document.body.appendChild(o.firstElementChild); }
function faqCloseDialog() { var el = document.querySelector('.content-dialog-overlay'); if (el) el.remove(); }
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') faqCloseDialog(); });
