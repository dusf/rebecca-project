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
      // 对话框 HTML 注入后，初始化其中所有 select 为可搜索下拉
      if (typeof initSearchableSelects === 'function') initSearchableSelects();
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
        if (!node) { showToast('error', '组织不存在'); return; }
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

    if (!name) { showToast('warning', '请输入组织名称'); return; }

    var parentLevel = -1;
    if (parent) {
      var pNode = fw.findNode(parent);
      if (!pNode) { showToast('error', '上级组织不存在'); return; }
      parentLevel = fw.ORG_TYPE_LEVEL[pNode.type];
    }
    var myLevel = fw.ORG_TYPE_LEVEL[type];
    if (type !== 'group' && !parent) { showToast('warning', '该类型组织必须选择上级组织'); return; }
    if (parent && parentLevel !== myLevel - 1) { showToast('warning', '上级组织类型不匹配，请遵循直系父子层级规则'); return; }

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
      if (parSel._searchable) rebuildSearchableSelect(parSel, '<option value="">-- 无（顶级） --</option>');
      else parSel.innerHTML = '<option value="">-- 无（顶级） --</option>';
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
    if (candidates.length === 0) html = '<option value="">-- 无可用上级 --</option>';

    if (parSel._searchable) {
      rebuildSearchableSelect(parSel, html);
    } else {
      parSel.innerHTML = html;
    }
  }

  /** 销毁并重建可搜索下拉 */
  function rebuildSearchableSelect(select, newHtml) {
    var wrapper = select._searchable.wrapper;
    if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    select._searchable = null;
    select.style.display = '';
    select.innerHTML = newHtml;
    buildSearchableSelect(select);
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
      if (!node) { showToast('error', '组织不存在'); return; }
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

    if (!phone)  { showToast('warning', '请输入手机号'); return; }
    if (!name)   { showToast('warning', '请输入姓名'); return; }
    if (mode === 'add' && !password) { showToast('warning', '请输入登录密码'); return; }
    if (!org)    { showToast('warning', '请选择所属组织'); return; }
    if (!/^1\d{10}$/.test(phone)) { showToast('warning', '请输入正确的手机号格式'); return; }

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
      if (!acct) { showToast('error', '账号不存在'); return; }

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
      var ids = JSON.parse(id);
      fw.acctBatchDeleteItems(ids);
      showToast('success', '已删除 ' + ids.length + ' 个账号');
    } else {
      fw.acctDeleteItem(parseInt(id));
      showToast('success', '账号已删除');
    }
    fw.renderTable();
  };

  // ---- 账号批量删除（复用同一个对话框） ----

  window.openAcctBatchDeleteDialog = function(ids) {
    ensureDialogs('acct', ACCT_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      if (!ids || ids.length === 0) { showToast('info', '请先选择要删除的账号'); return; }

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
      if (!ids || ids.length === 0) { showToast('info', '请先选择要操作的账号'); return; }

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
      var result = fw.acctBatchResetPwdItems(ids);
      fw.renderTable();
      if (result && result.count > 0) {
        showToast('success', '已为 ' + result.count + ' 个账号重置密码，新密码为：' + result.newPwd);
      }
    }
  };

  // 暴露 getFW 供子页面获取 frame window 引用
  window.getFW = getFW;

  // ==================== 可搜索下拉选择器（父页面对话框使用） ====================

  window.initSearchableSelects = function() {
    var selects = document.querySelectorAll('select');
    for (var i = 0; i < selects.length; i++) {
      if (selects[i]._searchable) continue;
      if (!selects[i].id) continue;
      buildSearchableSelect(selects[i]);
    }
  };

  function buildSearchableSelect(select) {
    var selectId = select.id;
    if (!selectId) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'searchable-select';
    wrapper.id = selectId + 'Wrapper';
    var trigger = document.createElement('button');
    trigger.className = 'searchable-select-trigger';
    trigger.type = 'button';
    var selOpt = select.options[select.selectedIndex];
    var triggerSpan = document.createElement('span');
    triggerSpan.textContent = selOpt ? selOpt.text : '请选择';
    trigger.appendChild(triggerSpan);
    var arrow = document.createElement('span');
    arrow.className = 'searchable-select-arrow';
    arrow.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#90A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
    trigger.appendChild(arrow);
    var dropdown = document.createElement('div');
    dropdown.className = 'searchable-select-dropdown';
    dropdown.id = selectId + 'Dropdown';
    dropdown.style.display = 'none';
    var searchArea = document.createElement('div');
    searchArea.className = 'searchable-select-search';
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '输入关键词检索...';
    searchInput.id = selectId + 'Search';
    searchArea.appendChild(searchInput);
    dropdown.appendChild(searchArea);
    var listDiv = document.createElement('div');
    listDiv.className = 'searchable-select-list';
    listDiv.id = selectId + 'List';
    var selValue = select.value;
    var opts = select.querySelectorAll('option');
    for (var j = 0; j < opts.length; j++) {
      var opt = opts[j];
      var item = document.createElement('div');
      item.className = 'searchable-select-option';
      if (opt.value === selValue) item.classList.add('selected');
      item.dataset.value = opt.value;
      item.textContent = (j + 1) + '. ' + opt.text;
      (function(value, text) {
        item.addEventListener('click', function() {
          selectSearchableOption(selectId, value, text);
        });
      })(opt.value, opt.text);
      listDiv.appendChild(item);
    }
    dropdown.appendChild(listDiv);
    wrapper.appendChild(trigger);
    wrapper.appendChild(dropdown);
    select.style.display = 'none';
    select.parentNode.insertBefore(wrapper, select);
    select._searchable = { wrapper: wrapper, trigger: trigger, triggerSpan: triggerSpan, dropdown: dropdown };
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleSearchableDropdown(selectId);
    });
    searchInput.addEventListener('input', function() {
      var q = this.value.toLowerCase();
      var items = dropdown.querySelectorAll('.searchable-select-option');
      var visible = 0;
      for (var k = 0; k < items.length; k++) {
        if (!q || items[k].textContent.toLowerCase().indexOf(q) !== -1) {
          items[k].classList.remove('hidden');
          visible++;
        } else {
          items[k].classList.add('hidden');
        }
      }
      var noneEl = listDiv.querySelector('.searchable-select-none');
      if (visible === 0) {
        if (!noneEl) {
          noneEl = document.createElement('div');
          noneEl.className = 'searchable-select-none';
          noneEl.textContent = '无匹配选项';
          listDiv.appendChild(noneEl);
        }
      } else if (noneEl) { noneEl.remove(); }
    });
    document.addEventListener('click', function(e) {
      var d = document.getElementById(selectId + 'Dropdown');
      if (d && d.style.display === 'block' && !wrapper.contains(e.target)) {
        closeSearchableDropdown(selectId);
      }
    });
  }

  function toggleSearchableDropdown(selectId) {
    var dropdown = document.getElementById(selectId + 'Dropdown');
    var triggerEl = document.querySelector('#' + selectId + 'Wrapper .searchable-select-trigger');
    if (!dropdown) return;
    if (dropdown.style.display === 'block') { closeSearchableDropdown(selectId); return; }
    if (triggerEl) {
      var rect = triggerEl.getBoundingClientRect();
      dropdown.style.top = (rect.bottom + 4) + 'px';
      dropdown.style.left = rect.left + 'px';
      dropdown.style.minWidth = rect.width + 'px';
    }
    dropdown.style.display = 'block';
    if (triggerEl) triggerEl.classList.add('open');
    var search = document.getElementById(selectId + 'Search');
    if (search) setTimeout(function() { search.focus(); }, 100);
  }

  function closeSearchableDropdown(selectId) {
    var dropdown = document.getElementById(selectId + 'Dropdown');
    var triggerEl = document.querySelector('#' + selectId + 'Wrapper .searchable-select-trigger');
    if (dropdown) dropdown.style.display = 'none';
    if (triggerEl) triggerEl.classList.remove('open');
    var search = document.getElementById(selectId + 'Search');
    if (search) search.value = '';
    var list = document.getElementById(selectId + 'List');
    if (list) {
      var items = list.querySelectorAll('.searchable-select-option');
      for (var i = 0; i < items.length; i++) items[i].classList.remove('hidden');
      var noneEl = list.querySelector('.searchable-select-none');
      if (noneEl) noneEl.remove();
    }
  }

  function selectSearchableOption(selectId, value, text) {
    var select = document.getElementById(selectId);
    if (!select) return;
    select.value = value;
    var triggerSpan = document.querySelector('#' + selectId + 'Wrapper .searchable-select-trigger span');
    if (triggerSpan) triggerSpan.textContent = text;
    var list = document.getElementById(selectId + 'List');
    if (list) {
      var items = list.querySelectorAll('.searchable-select-option');
      for (var i = 0; i < items.length; i++) {
        if (items[i].dataset.value === value) { items[i].classList.add('selected'); }
        else { items[i].classList.remove('selected'); }
      }
    }
    closeSearchableDropdown(selectId);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // ==================== 地域对话框 ====================
  var ZONE_DLG_URLS = [
    'parameters/zone/zone-form-dialog.html',
    'parameters/zone/zone-country-dialog.html'
  ];

  // ---- 地域表单对话框 ----
  window.openZoneFormDialog = function(mode, id) {
    ensureDialogs('zone', ZONE_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;

      var title = document.getElementById('zoneFormDialogTitle');
      var nameInp = document.getElementById('zoneFormName');
      var codeInp = document.getElementById('zoneFormCode');
      var statSel = document.getElementById('zoneFormStatus');

      if (mode === 'edit' && id) {
        title.textContent = '编辑地域';
        var zone = fw.findZone(id);
        if (!zone) { if (typeof showToast === 'function') showToast('error', '地域不存在'); else console.error('地域不存在'); return; }
        nameInp.value = zone.name;
        codeInp.value = zone.code;
        statSel.value = zone.status;
      } else {
        title.textContent = '添加地域';
        nameInp.value = '';
        codeInp.value = '';
        statSel.value = 'active';
      }

      var overlay = document.getElementById('zoneFormDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeZoneFormDialog = function() {
    var ov = document.getElementById('zoneFormDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.submitZoneForm = function() {
    var fw = getFW();
    if (!fw) return;

    var name = (document.getElementById('zoneFormName').value || '').trim();
    var code = (document.getElementById('zoneFormCode').value || '').trim().toUpperCase();
    var status = document.getElementById('zoneFormStatus').value;

    if (!name) { if (typeof showToast === 'function') showToast('error', '请输入地域名称'); else alert('请输入地域名称'); return; }
    if (!code) { if (typeof showToast === 'function') showToast('error', '请输入地域代码'); else alert('请输入地域代码'); return; }

    fw.saveZoneFromParent(name, code, status);
  };

  // ---- 地域国家管理对话框 ----
  window.openZoneCountryDialog = function(zoneId) {
    ensureDialogs('zone', ZONE_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;

      var zone = fw.findZone(zoneId);
      if (!zone) { if (typeof showToast === 'function') showToast('error', '地域不存在'); else console.error('地域不存在'); return; }

      document.getElementById('zoneCountryZoneName').textContent = zone.name;
      // 存储当前操作的地域ID
      document.getElementById('zoneCountryDialogOverlay').setAttribute('data-zone-id', zoneId);

      renderZoneCountryList();

      var overlay = document.getElementById('zoneCountryDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeZoneCountryDialog = function() {
    var ov = document.getElementById('zoneCountryDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  // 渲染已添加国家列表
  // countriesStr 可选：传入更新后的国家字符串可直接渲染，避免再次读取 iframe 数据
  window.renderZoneCountryList = function(countriesStr) {
    var overlay = document.getElementById('zoneCountryDialogOverlay');
    var zoneId = overlay ? parseInt(overlay.getAttribute('data-zone-id'), 10) : null;
    console.log('[renderZoneCountryList] zoneId=', zoneId, 'countriesStr=', countriesStr);
    if (!zoneId) return;

    var fw = getFW();
    if (!fw) { console.warn('[renderZoneCountryList] getFW failed'); return; }

    var countryNames = [];
    if (typeof countriesStr === 'string') {
      countryNames = countriesStr.split('、').filter(function(n) { return n.trim(); });
    } else {
      var zone = fw.findZone(zoneId);
      if (!zone) { console.warn('[renderZoneCountryList] zone not found'); return; }
      countryNames = zone.countries ? zone.countries.split('、').filter(function(n) { return n.trim(); }) : [];
    }
    console.log('[renderZoneCountryList] countryNames=', countryNames);
    var tbody = document.getElementById('zoneCountryListBody');
    var emptyEl = document.getElementById('zoneCountryListEmpty');
    if (!tbody || !emptyEl) { console.warn('[renderZoneCountryList] tbody/empty not found'); return; }

    if (countryNames.length === 0) {
      tbody.innerHTML = '';
      emptyEl.style.display = 'block';
    } else {
      emptyEl.style.display = 'none';
      tbody.innerHTML = countryNames.map(function(name, i) {
        return '<tr>' +
          '<td>' + (i + 1) + '</td>' +
          '<td>' + name + '</td>' +
          '<td>' + (fw.getCountryCode(name) || '—') + '</td>' +
          '<td><button class="btn btn-text btn-sm" style="color:hsl(var(--error));" onclick="removeZoneCountry(\'' + zoneId + '\',\'' + name.replace(/'/g, "\\'") + '\')">撤销</button></td>' +
          '</tr>';
      }).join('');
    }
  };

  // 撤销单个国家
  window.removeZoneCountry = function(zoneId, countryName) {
    var fw = getFW();
    if (!fw) return;
    fw.removeCountryFromZone(parseInt(zoneId, 10), countryName);
    renderZoneCountryList();
  };

  // ---- 添加国家子对话框 ----
  window.openAddCountrySubDialog = function() {
    var fw = getFW();
    if (!fw) return;

    var overlay = document.getElementById('zoneCountryDialogOverlay');
    var zoneId = overlay ? overlay.getAttribute('data-zone-id') : null;
    zoneId = zoneId ? parseInt(zoneId, 10) : null;
    if (!zoneId) return;

    var zone = fw.findZone(zoneId);
    if (!zone) return;

    // 获取已添加的国家名称列表
    var existingNames = zone.countries ? zone.countries.split('、').filter(function(n) { return n.trim(); }) : [];

    // 获取所有可用国家（排除已添加的）
    var allCountries = fw.getAllCountries();
    var availableCountries = allCountries.filter(function(c) {
      return existingNames.indexOf(c.name) === -1;
    });

    var tbody = document.getElementById('addCountrySelectBody');
    var emptyEl = document.getElementById('addCountrySelectEmpty');

    if (availableCountries.length === 0) {
      tbody.innerHTML = '';
      emptyEl.style.display = 'block';
    } else {
      emptyEl.style.display = 'none';
      tbody.innerHTML = availableCountries.map(function(c) {
        return '<tr>' +
          '<td><input type="checkbox" class="add-country-check" value="' + c.name.replace(/"/g, '&quot;') + '" onchange="updateAddCountrySelectedCount()" style="width:16px;height:16px;cursor:pointer;"></td>' +
          '<td>' + c.name + '</td>' +
          '<td>' + c.code + '</td>' +
          '</tr>';
      }).join('');
    }

    document.getElementById('addCountrySelectAll').checked = false;
    updateAddCountrySelectedCount();

    var subOverlay = document.getElementById('addCountrySubDialogOverlay');
    if (subOverlay) subOverlay.style.display = 'flex';
  };

  window.closeAddCountrySubDialog = function() {
    var ov = document.getElementById('addCountrySubDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.toggleSelectAllCountries = function(checked) {
    var boxes = document.querySelectorAll('#addCountrySelectBody .add-country-check');
    boxes.forEach(function(b) { b.checked = checked; });
    updateAddCountrySelectedCount();
  };

  window.updateAddCountrySelectedCount = function() {
    var boxes = document.querySelectorAll('#addCountrySelectBody .add-country-check');
    var count = 0;
    boxes.forEach(function(b) { if (b.checked) count++; });
    var el = document.getElementById('addCountrySelectedCount');
    if (el) el.textContent = count;
  };

  window.confirmAddCountries = function() {
    var fw = getFW();
    if (!fw) { console.warn('[confirmAddCountries] getFW failed'); return; }

    var boxes = document.querySelectorAll('#addCountrySelectBody .add-country-check');
    var selectedNames = [];
    boxes.forEach(function(b) {
      if (b.checked) selectedNames.push(b.value);
    });

    if (selectedNames.length === 0) {
      if (typeof showToast === 'function') showToast('info', '请至少选择一个国家'); else alert('请至少选择一个国家');
      return;
    }

    var overlay = document.getElementById('zoneCountryDialogOverlay');
    var zoneId = overlay ? parseInt(overlay.getAttribute('data-zone-id'), 10) : null;
    console.log('[confirmAddCountries] zoneId=', zoneId, 'selectedNames=', selectedNames);
    if (!zoneId) {
      if (typeof showToast === 'function') showToast('error', '未找到当前地域');
      return;
    }

    try {
      var updatedCountries = fw.addCountriesToZone(zoneId, selectedNames);
      console.log('[confirmAddCountries] updatedCountries=', updatedCountries);
      if (!updatedCountries) {
        if (typeof showToast === 'function') showToast('error', '添加国家失败，请重试');
        return;
      }
    } catch (err) {
      console.error('[confirmAddCountries] addCountriesToZone error:', err);
      if (typeof showToast === 'function') showToast('error', '添加国家失败: ' + err.message);
      return;
    }

    closeAddCountrySubDialog();
    // 使用 addCountriesToZone 返回的最新国家字符串直接渲染，避免再次读取 iframe 数据时状态不一致
    renderZoneCountryList(updatedCountries);
    if (typeof showToast === 'function') showToast('success', '已添加 ' + selectedNames.length + ' 个国家');
  };

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
