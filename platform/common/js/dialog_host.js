// ==================== 父页面 对话框管理器 ====================
// 此脚本由 platform/index.html 加载，在父页面中管理所有 iframe 子页面的对话框
// 确保对话框的遮罩层覆盖整个浏览器视口（包括侧边栏和顶栏）
// 子页面通过 window.parent 调用此文件暴露的函数来打开/关闭对话框

(function() {
  'use strict';

  var DLG_LOADED = {};  // 记录已加载的对话框集合

  // ==================== iframe 访问 ====================
  function getFrame() {
    // 缓存机制下当前活动 iframe 不一定是固定 contentFrame，取 active 的那个
    return document.querySelector('.iframe-container iframe.active') || document.getElementById('contentFrame');
  }

  function getFW() {
    var f = getFrame();
    return f && f.contentWindow;
  }

  // ==================== 关闭所有对话框 ====================
  window.dlgCloseAll = function() {
    document.querySelectorAll('#dialogHost .dialog-overlay').forEach(function(ov) {
      ov.style.display = 'none';
    });
  };

  // ==================== 加载对话框 HTML 到父页面 ====================
  function ensureDialogs(key, urls, callback) {
    if (DLG_LOADED[key]) { callback(); return; }
    DLG_LOADED[key] = true;

    var fetches = urls.map(function(u) { return fetch(u).then(function(r) { return r.text(); }); });
    Promise.all(fetches).then(function(htmls) {
      var host = document.getElementById('dialogHost');
      if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }
      htmls.forEach(function(h) {
        var div = document.createElement('div');
        div.innerHTML = h;
        host.appendChild(div);
      });
      callback();
    }).catch(function(err) {
      console.error('对话框加载失败:', err);
      DLG_LOADED[key] = false;
    });
  }

  // ==================== 组织对话框 ====================
  var ORG_DLG_URLS = [
    'account/organization/form-dialog.html',
    'account/organization/delete-dialog.html',
    'account/organization/batch-delete-dialog.html'
  ];

  // ==================== 账号对话框 ====================
  var ACCT_DLG_URLS = [
    'account/accounts/form-dialog.html',
    'account/accounts/delete-dialog.html',
    'account/accounts/reset-pwd-dialog.html'
  ];

  // ---- 表单对话框 ----

  window.openOrgFormDialog = function(mode, id) {
    ensureDialogs('org', ORG_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;

      var title   = document.getElementById('orgFormDialogTitle');
      var typeSel = document.getElementById('orgFormType');
      var nameInp = document.getElementById('orgFormName');
      var parSel  = document.getElementById('orgFormParent');
      var statSel = document.getElementById('orgFormStatus');

      document.getElementById('orgFormMode').value   = mode;
      document.getElementById('orgFormEditId').value = id || '';

      if (mode === 'edit' && id) {
        title.textContent = '编辑组织';
        var node = fw.findNode(id);
        if (!node) { fw.showToast('error', '组织不存在'); return; }
        typeSel.value = node.type;
        nameInp.value = node.name;
        statSel.value = node.status;
        var hasChildren = fw.orgData.some(function(item) { return item.parent === id; });
        typeSel.disabled = hasChildren;
        dlgRefreshOrgParentOptions(node.type, id);
        parSel.value = node.parent || '';
      } else {
        title.textContent = '添加组织';
        typeSel.disabled = false;
        typeSel.value = 'company';
        nameInp.value = '';
        statSel.value = 'active';
        dlgRefreshOrgParentOptions('company', null);
      }

      var overlay = document.getElementById('orgFormDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeOrgFormDialog = function() {
    var ov = document.getElementById('orgFormDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.submitOrgForm = function() {
    var fw = getFW();
    if (!fw) return;

    var mode   = document.getElementById('orgFormMode').value;
    var editId = document.getElementById('orgFormEditId').value;
    var type   = document.getElementById('orgFormType').value;
    var name   = document.getElementById('orgFormName').value.trim();
    var parent = document.getElementById('orgFormParent').value;
    var status = document.getElementById('orgFormStatus').value;

    if (!name) { fw.showToast('warning', '请输入组织名称'); return; }

    var parentLevel = -1;
    if (parent) {
      var pNode = fw.findNode(parent);
      if (!pNode) { fw.showToast('error', '上级组织不存在'); return; }
      parentLevel = fw.ORG_TYPE_LEVEL[pNode.type];
    }
    var myLevel = fw.ORG_TYPE_LEVEL[type];
    if (type !== 'group' && !parent) { fw.showToast('warning', '该类型组织必须选择上级组织'); return; }
    if (parent && parentLevel !== myLevel - 1) { fw.showToast('warning', '上级组织类型不匹配，请遵循直系父子层级规则'); return; }

    if (mode === 'add') {
      fw.orgAddItem(type, name, parent || null, status);
    } else {
      fw.orgUpdateItem(editId, type, name, parent || null, status);
    }

    closeOrgFormDialog();
    fw.renderTable();
  };

  function dlgRefreshOrgParentOptions(selType, excludeId) {
    var fw = getFW();
    if (!fw) return;
    var parSel = document.getElementById('orgFormParent');
    var parentLevel = fw.ORG_TYPE_LEVEL[selType] - 1;
    if (selType === 'group') {
      parSel.innerHTML = '<option value="">-- 无（顶级） --</option>';
      parSel.disabled = true;
      return;
    }
    parSel.disabled = false;
    var excludeIds = excludeId ? [excludeId].concat(fw.getDescendantIds(excludeId)) : [];
    var candidates = fw.orgData.filter(function(item) {
      if (excludeIds.indexOf(item.id) !== -1) return false;
      return fw.ORG_TYPE_LEVEL[item.type] === parentLevel;
    });
    var html = '<option value="">-- 请选择 --</option>';
    candidates.forEach(function(item) { html += '<option value="' + item.id + '">' + item.name + '</option>'; });
    parSel.innerHTML = html;
    if (candidates.length === 0) parSel.innerHTML = '<option value="">-- 无可用上级 --</option>';
  }

  window.onOrgFormTypeChange = function() {
    var type = document.getElementById('orgFormType').value;
    var editId = document.getElementById('orgFormEditId').value || null;
    dlgRefreshOrgParentOptions(type, editId);
  };

  // ---- 删除对话框 ----

  window.openOrgDeleteDialog = function(id) {
    ensureDialogs('org', ORG_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var node = fw.findNode(id);
      if (!node) { fw.showToast('error', '组织不存在'); return; }
      document.getElementById('orgDeleteId').value = id;
      var childIds = fw.getDescendantIds(id);
      var msg = '';
      if (childIds.length > 0) {
        var childNames = childIds.map(function(cid) { return fw.getNodeName(cid); }).join('、');
        msg = '<p>确定要删除 <strong>' + node.name + '</strong> 及其下属的 <strong>' + childIds.length + '</strong> 个组织吗？</p><p style="color:hsl(var(--error));margin-top:6px;">下属组织包括：' + childNames + '</p><p style="margin-top:10px;">此操作不可恢复。</p>';
      } else {
        msg = '<p>确定要删除 <strong>' + node.name + '</strong> 吗？</p><p style="margin-top:6px;">此操作不可恢复。</p>';
      }
      document.getElementById('orgDeleteMsg').innerHTML = msg;
      var overlay = document.getElementById('orgDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeOrgDeleteDialog = function() {
    var ov = document.getElementById('orgDeleteDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmOrgDelete = function() {
    var fw = getFW();
    var id = document.getElementById('orgDeleteId').value;
    closeOrgDeleteDialog();
    if (fw) { fw.orgDeleteItem(id); fw.renderTable(); }
  };

  // ---- 批量删除对话框 ----

  window.openOrgBatchDeleteDialog = function(ids) {
    ensureDialogs('org', ORG_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;

      var allIds = [];
      ids.forEach(function(id) { allIds.push(id); allIds = allIds.concat(fw.getDescendantIds(id)); });
      var uniqueIds = [];
      allIds.forEach(function(id) { if (uniqueIds.indexOf(id) === -1) uniqueIds.push(id); });

      var directNames = ids.map(function(id) { return fw.getNodeName(id); }).join('、');
      var totalCount = uniqueIds.length;
      var msg = '<p>确定要批量删除以下 <strong>' + ids.length + '</strong> 个组织吗？</p>';
      msg += '<p style="color:hsl(var(--muted-foreground));margin-top:6px;">选中组织：' + directNames + '</p>';
      if (totalCount > ids.length) {
        msg += '<p style="color:hsl(var(--error));margin-top:6px;">含下属组织共将删除 <strong>' + totalCount + '</strong> 个组织</p>';
      }
      msg += '<p style="margin-top:10px;">此操作不可恢复。</p>';

      document.getElementById('orgBatchDeleteMsg').innerHTML = msg;
      document.getElementById('orgBatchDeleteIds').value = JSON.stringify(uniqueIds);
      var overlay = document.getElementById('orgBatchDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeOrgBatchDeleteDialog = function() {
    var ov = document.getElementById('orgBatchDeleteDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmOrgBatchDelete = function() {
    var fw = getFW();
    var idsJson = document.getElementById('orgBatchDeleteIds').value;
    var uniqueIds = JSON.parse(idsJson);
    closeOrgBatchDeleteDialog();
    if (fw) { fw.orgBatchDeleteItems(uniqueIds); fw.renderTable(); }
  };

  // ---- 账号表单对话框 ----

  window.openAcctFormDialog = function(mode, id) {
    ensureDialogs('acct', ACCT_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;

      var title   = document.getElementById('acctFormDialogTitle');
      var phoneInp = document.getElementById('acctFormPhone');
      var nameInp  = document.getElementById('acctFormName');
      var pwdInp   = document.getElementById('acctFormPassword');
      var pwdLabel = document.getElementById('acctFormPwdLabel');
      var orgTreeContainer = document.getElementById('acctFormOrgTreeSelect');
      var emailInp = document.getElementById('acctFormEmail');
      var statSel  = document.getElementById('acctFormStatus');

      document.getElementById('acctFormMode').value    = mode;
      document.getElementById('acctFormEditId').value  = id || '';

      // 初始化组织树形选择器：从缓存的组织机构 iframe 中读取 orgData
      var orgUrl = 'account/organization/organization.html';
      var orgFrame = window.PLATFORM_IFRAME_CACHE && window.PLATFORM_IFRAME_CACHE[orgUrl];
      var orgData = (orgFrame && orgFrame.contentWindow && orgFrame.contentWindow.orgData)
        ? orgFrame.contentWindow.orgData : [];
      if (window.acctFormOrgPicker) window.acctFormOrgPicker.destroy();
      window.acctFormOrgPicker = OrgTreeSelect.create(orgTreeContainer, {
        data: orgData,
        placeholder: '-- 请选择 --'
      });

      if (mode === 'edit' && id) {
        title.textContent = '编辑账号';
        var acct = fw.findAcct(id);
        if (!acct) { if (typeof showToast === 'function') showToast('error', '账号不存在'); else console.error('账号不存在'); return; }
        phoneInp.value = acct.phone;
        nameInp.value  = acct.name;
        pwdInp.value   = '';
        pwdInp.placeholder = '留空则不修改密码';
        pwdLabel.innerHTML = '密码 <span style="color:hsl(var(--muted-foreground));font-weight:400;">（留空不修改）</span>';
        emailInp.value = acct.email || '';
        statSel.value  = acct.status;
        if (acct.org) window.acctFormOrgPicker.setValue(acct.org);
      } else {
        title.textContent = '添加账号';
        phoneInp.value   = '';
        nameInp.value    = '';
        pwdInp.value     = '';
        pwdInp.placeholder = '请输入登录密码';
        pwdLabel.innerHTML = '密码 <span style="color:hsl(var(--error))">*</span>';
        emailInp.value   = '';
        statSel.value    = 'active';
      }

      var overlay = document.getElementById('acctFormDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeAcctFormDialog = function() {
    var ov = document.getElementById('acctFormDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.submitAcctForm = function() {
    var fw = getFW();
    if (!fw) return;

    var mode     = document.getElementById('acctFormMode').value;
    var editId   = parseInt(document.getElementById('acctFormEditId').value) || null;
    var phone    = document.getElementById('acctFormPhone').value.trim();
    var name     = document.getElementById('acctFormName').value.trim();
    var password = document.getElementById('acctFormPassword').value;
    var org      = window.acctFormOrgPicker ? window.acctFormOrgPicker.getValue() : '';
    var email    = document.getElementById('acctFormEmail').value.trim();
    var status   = document.getElementById('acctFormStatus').value;

    if (!phone)  { fw.showToast('warning', '请输入手机号'); return; }
    if (!name)   { fw.showToast('warning', '请输入姓名'); return; }
    if (mode === 'add' && !password) { fw.showToast('warning', '请输入登录密码'); return; }
    if (!org)    { fw.showToast('warning', '请选择所属组织'); return; }
    if (!/^1\d{10}$/.test(phone)) { fw.showToast('warning', '请输入正确的手机号格式'); return; }

    if (mode === 'add') {
      fw.acctAddItem(phone, name, password, org, email, status);
    } else {
      fw.acctUpdateItem(editId, phone, name, password, org, email, status);
    }

    closeAcctFormDialog();
    fw.renderTable();
  };

  // ---- 账号删除对话框 ----

  window.openAcctDeleteDialog = function(id) {
    ensureDialogs('acct', ACCT_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var acct = fw.findAcct(id);
      if (!acct) { fw.showToast('error', '账号不存在'); return; }

      document.getElementById('acctDeleteId').value = id;
      document.getElementById('acctDeleteIsBatch').value = 'false';
      document.getElementById('acctDeleteDialogTitle').textContent = '删除账号';
      var msg = '<p>确定要删除账号「<strong>' + acct.name + '（' + acct.phone + '）</strong>」吗？</p><p style="margin-top:6px;">此操作不可恢复。</p>';
      document.getElementById('acctDeleteMsg').innerHTML = msg;

      var overlay = document.getElementById('acctDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeAcctDeleteDialog = function() {
    var ov = document.getElementById('acctDeleteDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmAcctDelete = function() {
    var fw = getFW();
    var id = document.getElementById('acctDeleteId').value;
    var isBatch = document.getElementById('acctDeleteIsBatch').value === 'true';
    closeAcctDeleteDialog();
    if (!fw) return;
    if (isBatch) {
      var ids = JSON.parse(id); // batch 时 acctDeleteId 存的是 JSON 数组
      fw.acctBatchDeleteItems(ids);
    } else {
      fw.acctDeleteItem(parseInt(id));
    }
    fw.renderTable();
  };

  // ---- 账号批量删除（复用同一个对话框） ----

  window.openAcctBatchDeleteDialog = function(ids) {
    ensureDialogs('acct', ACCT_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      if (!ids || ids.length === 0) { fw.showToast('info', '请先选择要删除的账号'); return; }

      document.getElementById('acctDeleteId').value = JSON.stringify(ids);
      document.getElementById('acctDeleteIsBatch').value = 'true';
      document.getElementById('acctDeleteDialogTitle').textContent = '批量删除账号';
      var msg = '<p>确定要批量删除以下 <strong>' + ids.length + '</strong> 个账号吗？</p><p style="margin-top:6px;">此操作不可恢复。</p>';
      document.getElementById('acctDeleteMsg').innerHTML = msg;

      var overlay = document.getElementById('acctDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  // ---- 账号批量重置密码对话框 ----

  window.openAcctBatchResetPwdDialog = function(ids) {
    ensureDialogs('acct', ACCT_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      if (!ids || ids.length === 0) { fw.showToast('info', '请先选择要操作的账号'); return; }

      document.getElementById('acctResetPwdIds').value = JSON.stringify(ids);
      var msg = '<p>确定要为以下 <strong>' + ids.length + '</strong> 个账号重置登录密码吗？</p><p style="margin-top:6px;color:hsl(var(--muted-foreground));">重置后将生成新的随机密码。</p>';
      document.getElementById('acctResetPwdMsg').innerHTML = msg;

      var overlay = document.getElementById('acctResetPwdDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeAcctBatchResetPwdDialog = function() {
    var ov = document.getElementById('acctResetPwdDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmAcctBatchResetPwd = function() {
    var fw = getFW();
    var idsJson = document.getElementById('acctResetPwdIds').value;
    var ids = JSON.parse(idsJson);
    closeAcctBatchResetPwdDialog();
    if (fw) {
      fw.acctBatchResetPwdItems(ids);
      fw.renderTable();
    }
  };

  // 暴露 getFW 供子页面获取 frame window 引用
  window.getFW = getFW;

  // ==================== Escape 关闭对话框 ====================
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    var overlays = document.querySelectorAll('#dialogHost .dialog-overlay');
    overlays.forEach(function(ov) {
      if (ov.style.display === 'flex') ov.style.display = 'none';
    });
  });

  // ==================== 导航时自动关闭对话框 ====================
  // 在 loadIframe 被调用后由 index.html 触发
  window.dlgOnNavigate = function() {
    dlgCloseAll();
  };

})();
