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
      console.error('对话框加载失败:', key, urls, err);
      DLG_LOADED[key] = false;
      if (typeof showToast === 'function') showToast('error', '对话框组件加载失败，可能需要检查服务器连接（fetch 路径：' + urls[0] + '）');
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
  window.rebuildSearchableSelect = function(select, newHtml) {
    if (!select || !select._searchable) {
      select.innerHTML = newHtml;
      buildSearchableSelect(select);
      return;
    }
    var wrapper = select._searchable.wrapper;
    if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    select._searchable = null;
    select.style.display = '';
    select.innerHTML = newHtml;
    buildSearchableSelect(select);
  };

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
    'parameters/zone/zone-country-dialog.html',
    'parameters/zone/delete-dialog.html'
  ];

  // ==================== 地区对话框 ====================
  var REGION_DLG_URLS = [
    'parameters/region/delete-dialog.html'
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

  // ---- 地域删除对话框 ----

  window.openZoneDeleteDialog = function(id) {
    ensureDialogs('zone', ZONE_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      if (!fw.findZone) { console.error('[dialog_host] openZoneDeleteDialog: iframe 中缺少 findZone 函数'); return; }
      var zone = fw.findZone(id);
      if (!zone) { showToast('error', '地域不存在'); return; }

      document.getElementById('zoneDeleteId').value = id;
      document.getElementById('zoneDeleteIsBatch').value = 'false';
      document.getElementById('zoneDeleteDialogTitle').textContent = '删除地域';
      var msg = '<p>确定要删除「<strong>' + zone.name + '</strong>」吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>';
      document.getElementById('zoneDeleteMsg').innerHTML = msg;

      var overlay = document.getElementById('zoneDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.openZoneBatchDeleteDialog = function(ids) {
    ensureDialogs('zone', ZONE_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      if (!ids || ids.length === 0) { showToast('info', '请先选择要删除的地域'); return; }

      document.getElementById('zoneDeleteId').value = JSON.stringify(ids);
      document.getElementById('zoneDeleteIsBatch').value = 'true';
      document.getElementById('zoneDeleteDialogTitle').textContent = '批量删除地域';
      var msg = '<p>确定要批量删除以下 <strong>' + ids.length + '</strong> 个地域吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>';
      document.getElementById('zoneDeleteMsg').innerHTML = msg;

      var overlay = document.getElementById('zoneDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeZoneDeleteDialog = function() {
    var ov = document.getElementById('zoneDeleteDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmZoneDelete = function() {
    var fw = getFW();
    var id = document.getElementById('zoneDeleteId').value;
    var isBatch = document.getElementById('zoneDeleteIsBatch').value === 'true';
    closeZoneDeleteDialog();
    if (!fw) return;
    if (isBatch) {
      var ids = JSON.parse(id);
      if (fw.zoneBatchDeleteItems) fw.zoneBatchDeleteItems(ids);
      showToast('success', '已删除 ' + ids.length + ' 个地域');
    } else {
      if (fw.zoneDeleteSingle) fw.zoneDeleteSingle(id);
      showToast('success', '地域已删除');
    }
    if (fw.renderZoneTable) fw.renderZoneTable();
  };

  // ---- 地区删除对话框 ----

  window.openRegionDeleteDialog = function(id) {
    ensureDialogs('region', REGION_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) { console.error('[dialog_host] openRegionDeleteDialog: getFW 返回 null，请确认 iframe 是否正确加载'); return; }
      if (!fw.getRegionNode) { console.error('[dialog_host] openRegionDeleteDialog: iframe 中缺少 getRegionNode 函数，region.html 可能未正确初始化'); return; }
      var node = fw.getRegionNode(id);
      if (!node) { showToast('error', '地区不存在'); return; }

      var titleEl = document.getElementById('regionDeleteDialogTitle');
      var idEl = document.getElementById('regionDeleteId');
      var batchEl = document.getElementById('regionDeleteIsBatch');
      var msgEl = document.getElementById('regionDeleteMsg');
      var overlay = document.getElementById('regionDeleteDialogOverlay');
      if (!titleEl || !idEl || !msgEl || !overlay) {
        console.error('[dialog_host] openRegionDeleteDialog: 对话框 DOM 元素缺失，delete-dialog.html 可能未成功注入。titleEl=', titleEl, 'idEl=', idEl, 'msgEl=', msgEl, 'overlay=', overlay);
        showToast('error', '对话框加载失败，请刷新页面后重试');
        return;
      }

      idEl.value = id;
      batchEl.value = 'false';
      titleEl.textContent = '删除地区';
      var hasChildren = fw.regionHasChildren(id);
      var msg = hasChildren
        ? '<p>确定要删除「<strong>' + node.name + '</strong>」及其<strong>所有下级地区</strong>吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>'
        : '<p>确定要删除「<strong>' + node.name + '</strong>」吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>';
      msgEl.innerHTML = msg;

      overlay.style.display = 'flex';
    });
  };

  window.closeRegionDeleteDialog = function() {
    var ov = document.getElementById('regionDeleteDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmRegionDelete = function() {
    var fw = getFW();
    var id = document.getElementById('regionDeleteId').value;
    var isBatch = document.getElementById('regionDeleteIsBatch').value === 'true';
    closeRegionDeleteDialog();
    if (!fw) return;
    if (isBatch) {
      var ids = JSON.parse(id);
      fw.regionBatchDeleteItems(ids);
      showToast('success', '已删除 ' + ids.length + ' 个地区');
    } else {
      fw.regionDeleteItem(id);
      showToast('success', '地区已删除');
    }
    fw.renderRegionDetail();
  };

  window.openRegionBatchDeleteDialog = function(ids) {
    ensureDialogs('region', REGION_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) { console.error('[dialog_host] openRegionBatchDeleteDialog: getFW 返回 null'); return; }
      if (!ids || ids.length === 0) { showToast('info', '请先选择要删除的地区'); return; }

      var titleEl = document.getElementById('regionDeleteDialogTitle');
      var idEl = document.getElementById('regionDeleteId');
      var batchEl = document.getElementById('regionDeleteIsBatch');
      var msgEl = document.getElementById('regionDeleteMsg');
      var overlay = document.getElementById('regionDeleteDialogOverlay');
      if (!titleEl || !idEl || !msgEl || !overlay) {
        console.error('[dialog_host] openRegionBatchDeleteDialog: 对话框 DOM 元素缺失，delete-dialog.html 可能未成功注入');
        showToast('error', '对话框加载失败，请刷新页面后重试');
        return;
      }

      idEl.value = JSON.stringify(ids);
      batchEl.value = 'true';
      titleEl.textContent = '批量删除地区';
      var msg = '<p>确定要批量删除以下 <strong>' + ids.length + '</strong> 个地区吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>';
      msgEl.innerHTML = msg;

      overlay.style.display = 'flex';
    });
  };

  // ==================== 汇率对话框 ====================
  var EXCHANGE_RATE_DLG_URLS = [
    'parameters/exchange_rate/detail-dialog.html',
    'parameters/exchange_rate/config-dialog.html',
    'parameters/exchange_rate/change-source-dialog.html'
  ];

  var erDetailId = null;
  var erChangeIds = [];

  // ---- 汇率详情对话框 ----

  window.openERDetailDialog = function(id) {
    ensureDialogs('exchange_rate', EXCHANGE_RATE_DLG_URLS, function() {
      var fw = getFW();
      if (!fw || !fw.erFindRate) { console.error('[dialog_host] openERDetailDialog: iframe 中缺少 erFindRate'); return; }
      var r = fw.erFindRate(id);
      if (!r) { showToast('error', '币种不存在'); return; }
      erDetailId = id;
      document.getElementById('erDetailCode').textContent = r.code;
      document.getElementById('erDetailName').textContent = r.name;
      document.getElementById('erDetailRate').textContent = '1 USD = ' + r.rate.toFixed(6) + ' ' + r.code;
      var statusMap = { active: '正常', paused: '暂停更新', disabled: '已禁用' };
      document.getElementById('erDetailStatus').textContent = statusMap[r.status] || r.status;
      document.getElementById('erDetailTime').textContent = r.updatedAt;
      document.getElementById('erLogTypeFilter').value = '';
      var overlay = document.getElementById('erDetailDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
      renderERDetailLogs();
    });
  };

  window.closeERDetailDialog = function() {
    erDetailId = null;
    var ov = document.getElementById('erDetailDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.renderERDetailLogs = function() {
    if (!erDetailId) return;
    var fw = getFW();
    if (!fw || !fw.erGetLogs) return;
    var typeFilter = document.getElementById('erLogTypeFilter').value;
    var logs = fw.erGetLogs(erDetailId, typeFilter);
    var tbody = document.getElementById('erDetailLogBody');
    var emptyEl = document.getElementById('erDetailLogEmpty');
    var typeLabels = { api: 'API自动拉取', manual: '手动录入', confirm: '管理员确认更新' };
    var typeCls = { api: 'badge-info', manual: 'badge-warning', confirm: 'badge-success' };

    if (!logs.length) {
      tbody.innerHTML = '';
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';
    tbody.innerHTML = logs.map(function(l) {
      var r = fw.erFindRate(l.currencyId);
      var code = r ? r.code : '';
      var beforeStr = l.beforeRate === 0 ? '--' : (l.beforeRate.toFixed(6) + ' ' + code);
      var afterStr = l.afterRate.toFixed(6) + ' ' + code;
      var label = typeLabels[l.type] || l.type;
      var cls = typeCls[l.type] || 'badge-secondary';
      return '<tr><td>' + l.time + '</td><td><span class="badge ' + cls + '" style="font-size:11px;">' + label + '</span></td><td>' + beforeStr + '</td><td>' + afterStr + '</td><td>' + l.operator + '</td><td style="color:hsl(var(--muted-foreground));">' + (l.remark || '') + '</td></tr>';
    }).join('');
  };

  // ---- 数据源配置对话框 ----

  window.openERConfigDialog = function() {
    ensureDialogs('exchange_rate', EXCHANGE_RATE_DLG_URLS, function() {
      var fw = getFW();
      if (!fw || !fw.erGetConfig) { console.error('[dialog_host] openERConfigDialog: iframe 中缺少 erGetConfig'); return; }
      var cfg = fw.erGetConfig();
      document.getElementById('erConfigApiUrl').value = cfg.apiUrl;
      document.getElementById('erConfigApiKey').value = cfg.apiKey;
      document.getElementById('erConfigApiParams').value = cfg.apiParams;
      document.getElementById('erConfigInterval').value = cfg.refreshInterval;
      document.getElementById('erConfigThreshold').value = cfg.volatilityThreshold || 3;
      var overlay = document.getElementById('erConfigDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeERConfigDialog = function() {
    var ov = document.getElementById('erConfigDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.saveERConfigDialog = function() {
    var fw = getFW();
    if (!fw || !fw.erSaveConfig) return;
    var cfg = {
      apiUrl: (document.getElementById('erConfigApiUrl').value || '').trim(),
      apiKey: (document.getElementById('erConfigApiKey').value || '').trim(),
      apiParams: (document.getElementById('erConfigApiParams').value || '').trim(),
      refreshInterval: parseInt(document.getElementById('erConfigInterval').value, 10),
      volatilityThreshold: parseFloat(document.getElementById('erConfigThreshold').value) || 3
    };
    fw.erSaveConfig(cfg);
    closeERConfigDialog();
    showToast('success', '数据源配置已保存');
  };

  // ---- 更换数据来源对话框 ----

  window.openERChangeSourceDialog = function(ids) {
    ensureDialogs('exchange_rate', EXCHANGE_RATE_DLG_URLS, function() {
      erChangeIds = ids;
      document.getElementById('erChangeSourceCount').textContent = ids.length;
      // 重置 radio 为 API 拉取
      document.querySelector('input[name="erChangeSource"][value="api"]').checked = true;
      erUpdateChangeSourceHint('api');
      var overlay = document.getElementById('erChangeSourceOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeERChangeSourceDialog = function() {
    var ov = document.getElementById('erChangeSourceOverlay');
    if (ov) ov.style.display = 'none';
    erChangeIds = [];
  };

  window.erSelectSourceOption = function(val) {
    document.querySelector('input[name="erChangeSource"][value="' + val + '"]').checked = true;
    erUpdateChangeSourceHint(val);
  };

  function erUpdateChangeSourceHint(val) {
    var note = document.getElementById('erChangeSourceNote');
    var apiOpt = document.getElementById('erOptApi');
    var manualOpt = document.getElementById('erOptManual');
    if (val === 'api') {
      note.textContent = '切换为 API 拉取后，该币种将参与自动刷新。';
      apiOpt.classList.add('selected');
      manualOpt.classList.remove('selected');
    } else {
      note.textContent = '切换为手动维护后，该币种将不再参与 API 自动拉取。';
      manualOpt.classList.add('selected');
      apiOpt.classList.remove('selected');
    }
  }

  window.doERChangeSource = function() {
    if (!erChangeIds.length) { closeERChangeSourceDialog(); return; }
    var fw = getFW();
    if (!fw || !fw.erDoBatchChangeSource) return;
    var radio = document.querySelector('input[name="erChangeSource"]:checked');
    var newSource = radio ? radio.value : 'api';
    fw.erDoBatchChangeSource(erChangeIds, newSource);
    closeERChangeSourceDialog();
  };

  // ==================== 语言对话框 ====================
  var LANGUAGE_DLG_URLS = [
    'parameters/language/form-dialog.html',
    'parameters/language/delete-dialog.html'
  ];

  // ---- 语言表单对话框 ----

  window.openLanguageFormDialog = function(mode, id) {
    ensureDialogs('language', LANGUAGE_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;

      var title   = document.getElementById('languageFormDialogTitle');
      var nameInp = document.getElementById('languageFormName');
      var codeInp = document.getElementById('languageFormCode');
      var statSel = document.getElementById('languageFormStatus');

      document.getElementById('languageFormMode').value    = mode;
      document.getElementById('languageFormEditId').value  = id || '';

      if (mode === 'edit' && id) {
        title.textContent = '编辑语言';
        var lang = fw.findLanguage(id);
        if (!lang) { showToast('error', '语言不存在'); return; }
        nameInp.value = lang.name;
        codeInp.value = lang.code;
        statSel.value = lang.status;
      } else {
        title.textContent = '添加语言';
        nameInp.value = '';
        codeInp.value = '';
        statSel.value = 'active';
      }

      var overlay = document.getElementById('languageFormDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeLanguageFormDialog = function() {
    var ov = document.getElementById('languageFormDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.submitLanguageForm = function() {
    var fw = getFW();
    if (!fw) return;

    var mode   = document.getElementById('languageFormMode').value;
    var editId = document.getElementById('languageFormEditId').value;
    var name   = (document.getElementById('languageFormName').value || '').trim();
    var code   = (document.getElementById('languageFormCode').value || '').trim();
    var status = document.getElementById('languageFormStatus').value;

    if (!name) { showToast('warning', '请输入语言名称'); return; }
    if (!code) { showToast('warning', '请输入语言代码'); return; }

    if (mode === 'add') {
      fw.languageAddItem(name, code, status);
    } else {
      fw.languageUpdateItem(editId, name, code, status);
    }

    closeLanguageFormDialog();
    fw.renderLanguageTable();
    showToast('success', mode === 'add' ? '语言已添加' : '语言已更新');
  };

  // ---- 语言删除对话框 ----

  window.openLanguageDeleteDialog = function(id) {
    ensureDialogs('language', LANGUAGE_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var lang = fw.findLanguage(id);
      if (!lang) { showToast('error', '语言不存在'); return; }

      document.getElementById('languageDeleteId').value = id;
      document.getElementById('languageDeleteIsBatch').value = 'false';
      document.getElementById('languageDeleteDialogTitle').textContent = '删除语言';
      var msg = '<p>确定要删除「<strong>' + lang.name + '（' + lang.code + '）</strong>」吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>';
      document.getElementById('languageDeleteMsg').innerHTML = msg;

      var overlay = document.getElementById('languageDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.openLanguageBatchDeleteDialog = function(ids) {
    ensureDialogs('language', LANGUAGE_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      if (!ids || ids.length === 0) { showToast('info', '请先选择要删除的语言'); return; }

      document.getElementById('languageDeleteId').value = JSON.stringify(ids);
      document.getElementById('languageDeleteIsBatch').value = 'true';
      document.getElementById('languageDeleteDialogTitle').textContent = '批量删除语言';
      var msg = '<p>确定要批量删除以下 <strong>' + ids.length + '</strong> 个语言吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>';
      document.getElementById('languageDeleteMsg').innerHTML = msg;

      var overlay = document.getElementById('languageDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeLanguageDeleteDialog = function() {
    var ov = document.getElementById('languageDeleteDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmLanguageDelete = function() {
    var fw = getFW();
    var id = document.getElementById('languageDeleteId').value;
    var isBatch = document.getElementById('languageDeleteIsBatch').value === 'true';
    closeLanguageDeleteDialog();
    if (!fw) return;
    if (isBatch) {
      var ids = JSON.parse(id);
      fw.languageBatchDeleteItems(ids);
      showToast('success', '已删除 ' + ids.length + ' 个语言');
    } else {
      fw.languageDeleteItem(id);
      showToast('success', '语言已删除');
    }
    fw.renderLanguageTable();
  };

  // ==================== 国家对话框 ====================
  var COUNTRY_DLG_URLS = [
    'parameters/country/form-dialog.html',
    'parameters/country/delete-dialog.html'
  ];

  // ---- 国家表单对话框 ----

  window.openCountryFormDialog = function(mode, id) {
    ensureDialogs('country', COUNTRY_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;

      var title   = document.getElementById('countryFormDialogTitle');
      var nameInp = document.getElementById('countryFormName');
      var codeInp = document.getElementById('countryFormCode');
      var zoneSel = document.getElementById('countryFormZone');
      var langSel = document.getElementById('countryFormLang');
      var currSel = document.getElementById('countryFormCurrency');
      var statSel = document.getElementById('countryFormStatus');

      document.getElementById('countryFormMode').value    = mode;
      document.getElementById('countryFormEditId').value  = id || '';

      // 填充所属地域下拉选项
      dlgFillCountryZoneOptions(zoneSel);

      // 填充默认语言下拉选项
      dlgFillCountryLangOptions(langSel);

      // 填充默认货币下拉选项
      dlgFillCountryCurrencyOptions(currSel);

      if (mode === 'edit' && id) {
        title.textContent = '编辑国家';
        var c = fw.findCountry(id);
        if (!c) { showToast('error', '国家不存在'); return; }
        nameInp.value = c.name;
        codeInp.value = c.code;
        zoneSel.value = c.zone || '';
        langSel.value = c.lang || '';
        currSel.value = c.currency || '';
        statSel.value = c.status;
        document.getElementById('countryFormLevel1').value = (c.levels && c.levels[0]) || '';
        document.getElementById('countryFormLevel2').value = (c.levels && c.levels[1]) || '';
        document.getElementById('countryFormLevel3').value = (c.levels && c.levels[2]) || '';
      } else {
        title.textContent = '添加国家';
        nameInp.value = '';
        codeInp.value = '';
        zoneSel.value = '';
        langSel.value = '';
        currSel.value = '';
        statSel.value = 'active';
        document.getElementById('countryFormLevel1').value = '';
        document.getElementById('countryFormLevel2').value = '';
        document.getElementById('countryFormLevel3').value = '';
      }

      var overlay = document.getElementById('countryFormDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeCountryFormDialog = function() {
    var ov = document.getElementById('countryFormDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.submitCountryForm = function() {
    var fw = getFW();
    if (!fw) return;

    var mode   = document.getElementById('countryFormMode').value;
    var editId = document.getElementById('countryFormEditId').value;
    var name   = (document.getElementById('countryFormName').value || '').trim();
    var code   = (document.getElementById('countryFormCode').value || '').trim().toUpperCase();
    var zone   = document.getElementById('countryFormZone').value;
    var lang   = document.getElementById('countryFormLang').value;
    var currency = document.getElementById('countryFormCurrency').value;
    var status = document.getElementById('countryFormStatus').value;

    if (!name) { showToast('warning', '请输入国家名称'); return; }
    if (!code) { showToast('warning', '请输入国家代码'); return; }
    if (!zone) { showToast('warning', '请选择所属地域'); return; }

    var levels = [];
    var l1 = document.getElementById('countryFormLevel1').value.trim();
    var l2 = document.getElementById('countryFormLevel2').value.trim();
    var l3 = document.getElementById('countryFormLevel3').value.trim();
    if (l1) levels.push(l1);
    if (l2) levels.push(l2);
    if (l3) levels.push(l3);
    if (!levels.length) levels = ['一级', '二级', '三级'];

    if (mode === 'add') {
      fw.countryAddItem(name, code, zone, lang, currency, status, levels);
    } else {
      fw.countryUpdateItem(editId, name, code, zone, lang, currency, status, levels);
    }

    closeCountryFormDialog();
    fw.renderCountryTable();
    showToast('success', mode === 'add' ? '国家已添加' : '国家已更新');
  };

  // ---- 填充地域下拉选项 ----
  function dlgFillCountryZoneOptions(zoneSel) {
    // 优先从 parent window 读取 zone 页面的真实数据
    var zones = window.PARAM_ZONE_DATA || [];
    // 其次尝试从 iframe 缓存读取
    if (!zones.length && window.PLATFORM_IFRAME_CACHE) {
      var cache = window.PLATFORM_IFRAME_CACHE;
      var zoneUrl = 'parameters/zone/zone.html';
      if (cache[zoneUrl] && cache[zoneUrl].contentWindow && cache[zoneUrl].contentWindow.zoneData) {
        zones = cache[zoneUrl].contentWindow.zoneData;
      }
    }
    // 兜底：如果预加载还没完成，使用默认地域列表
    if (!zones.length) {
      zones = [
        { name: '东南亚' }, { name: '北美' }, { name: '欧洲' }, { name: '东亚' },
        { name: '南亚' }, { name: '中东' }, { name: '非洲' }, { name: '大洋洲' }, { name: '南美' }
      ];
    }
    var currentVal = zoneSel.value;
    var html = '<option value="">请选择地域</option>';
    zones.forEach(function(z) {
      html += '<option value="' + z.name + '"' + (z.name === currentVal ? ' selected' : '') + '>' + z.name + '</option>';
    });
    zoneSel.innerHTML = html;
    if (currentVal) zoneSel.value = currentVal;
  }

  // ---- 填充默认语言下拉选项 ----
  function dlgFillCountryLangOptions(langSel) {
    // 优先从 parent window 读取语言页面的真实数据
    var langs = window.PARAM_LANG_DATA || [];
    // 其次尝试从 iframe 缓存读取
    if (!langs.length && window.PLATFORM_IFRAME_CACHE) {
      var cache = window.PLATFORM_IFRAME_CACHE;
      var langUrl = 'parameters/language/language.html';
      if (cache[langUrl] && cache[langUrl].contentWindow && cache[langUrl].contentWindow.languageData) {
        langs = cache[langUrl].contentWindow.languageData;
      }
    }
    // 兜底
    if (!langs.length) {
      langs = [
        { name: '简体中文', code: 'zh-CN' },
        { name: 'English', code: 'en-US' },
        { name: '日本語', code: 'ja-JP' },
        { name: 'Français', code: 'fr-FR' }
      ];
    }
    var currentVal = langSel.value;
    var html = '<option value="">请选择默认语言（可选）</option>';
    langs.forEach(function(l) {
      var display = l.name + ' (' + l.code + ')';
      html += '<option value="' + display + '"' + (display === currentVal ? ' selected' : '') + '>' + display + '</option>';
    });
    langSel.innerHTML = html;
    if (currentVal) langSel.value = currentVal;
  }

  // ---- 填充默认货币下拉选项 ----
  function dlgFillCountryCurrencyOptions(currSel) {
    // 优先从 parent window 读取货币页面的真实数据
    var currencies = window.PARAM_CURR_DATA || [];
    // 其次尝试从 iframe 缓存读取
    if (!currencies.length && window.PLATFORM_IFRAME_CACHE) {
      var cache = window.PLATFORM_IFRAME_CACHE;
      var currUrl = 'parameters/currency/currency.html';
      if (cache[currUrl] && cache[currUrl].contentWindow && cache[currUrl].contentWindow.currencyData) {
        currencies = cache[currUrl].contentWindow.currencyData;
      }
    }
    // 兜底
    if (!currencies.length) {
      currencies = [
        { name: '人民币', code: 'CNY' },
        { name: '美元', code: 'USD' },
        { name: '欧元', code: 'EUR' },
        { name: '日元', code: 'JPY' }
      ];
    }
    var currentVal = currSel.value;
    var html = '<option value="">请选择默认货币（可选）</option>';
    currencies.forEach(function(c) {
      var display = c.name + ' (' + c.code + ')';
      html += '<option value="' + display + '"' + (display === currentVal ? ' selected' : '') + '">' + display + '</option>';
    });
    currSel.innerHTML = html;
    if (currentVal) currSel.value = currentVal;
  }

  // ---- 国家删除对话框 ----

  window.openCountryDeleteDialog = function(id) {
    ensureDialogs('country', COUNTRY_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var c = fw.findCountry(id);
      if (!c) { showToast('error', '国家不存在'); return; }

      document.getElementById('countryDeleteId').value = id;
      document.getElementById('countryDeleteIsBatch').value = 'false';
      document.getElementById('countryDeleteDialogTitle').textContent = '删除国家';
      var msg = '<p>确定要删除「<strong>' + c.name + '（' + c.code + '）</strong>」及其所有地区数据吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>';
      document.getElementById('countryDeleteMsg').innerHTML = msg;

      var overlay = document.getElementById('countryDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.openCountryBatchDeleteDialog = function(ids) {
    ensureDialogs('country', COUNTRY_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      if (!ids || ids.length === 0) { showToast('info', '请先选择要删除的国家'); return; }

      document.getElementById('countryDeleteId').value = JSON.stringify(ids);
      document.getElementById('countryDeleteIsBatch').value = 'true';
      document.getElementById('countryDeleteDialogTitle').textContent = '批量删除国家';
      var msg = '<p>确定要批量删除以下 <strong>' + ids.length + '</strong> 个国家及其所有地区数据吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>';
      document.getElementById('countryDeleteMsg').innerHTML = msg;

      var overlay = document.getElementById('countryDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeCountryDeleteDialog = function() {
    var ov = document.getElementById('countryDeleteDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmCountryDelete = function() {
    var fw = getFW();
    var id = document.getElementById('countryDeleteId').value;
    var isBatch = document.getElementById('countryDeleteIsBatch').value === 'true';
    closeCountryDeleteDialog();
    if (!fw) return;
    if (isBatch) {
      var ids = JSON.parse(id);
      fw.countryBatchDeleteItems(ids);
      showToast('success', '已删除 ' + ids.length + ' 个国家');
    } else {
      fw.countryDeleteItem(id);
      showToast('success', '国家已删除');
    }
    fw.renderCountryTable();
  };

  // ==================== 货币对话框 ====================
  var CURRENCY_DLG_URLS = [
    'parameters/currency/form-dialog.html',
    'parameters/currency/delete-dialog.html'
  ];

  // ---- 货币表单对话框 ----

  window.openCurrencyFormDialog = function(mode, id) {
    ensureDialogs('currency', CURRENCY_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;

      var title    = document.getElementById('currencyFormDialogTitle');
      var nameInp  = document.getElementById('currencyFormName');
      var codeInp  = document.getElementById('currencyFormCode');
      var symbInp  = document.getElementById('currencyFormSymbol');
      var precSel  = document.getElementById('currencyFormPrec');
      var statSel  = document.getElementById('currencyFormStatus');

      document.getElementById('currencyFormMode').value    = mode;
      document.getElementById('currencyFormEditId').value  = id || '';

      if (mode === 'edit' && id) {
        title.textContent = '编辑货币';
        var cur = fw.findCurrency(id);
        if (!cur) { showToast('error', '货币不存在'); return; }
        nameInp.value = cur.name;
        codeInp.value = cur.code;
        symbInp.value = cur.symbol;
        precSel.value = cur.prec;
        statSel.value = cur.status;
      } else {
        title.textContent = '添加货币';
        nameInp.value = '';
        codeInp.value = '';
        symbInp.value = '';
        precSel.value = '2';
        statSel.value = 'active';
      }

      var overlay = document.getElementById('currencyFormDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeCurrencyFormDialog = function() {
    var ov = document.getElementById('currencyFormDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.submitCurrencyForm = function() {
    var fw = getFW();
    if (!fw) return;

    var mode   = document.getElementById('currencyFormMode').value;
    var editId = document.getElementById('currencyFormEditId').value;
    var name   = (document.getElementById('currencyFormName').value || '').trim();
    var code   = (document.getElementById('currencyFormCode').value || '').trim();
    var symbol = (document.getElementById('currencyFormSymbol').value || '').trim();
    var prec   = document.getElementById('currencyFormPrec').value;
    var status = document.getElementById('currencyFormStatus').value;

    if (!name)   { showToast('warning', '请输入货币名称'); return; }
    if (!code)   { showToast('warning', '请输入货币代码'); return; }
    if (!symbol) { showToast('warning', '请输入货币符号'); return; }

    if (mode === 'add') {
      fw.currencyAddItem(name, code, symbol, prec, status);
    } else {
      fw.currencyUpdateItem(editId, name, code, symbol, prec, status);
    }

    closeCurrencyFormDialog();
    fw.renderCurrencyTable();
    showToast('success', mode === 'add' ? '货币已添加' : '货币已更新');
  };

  // ---- 货币删除对话框 ----

  window.openCurrencyDeleteDialog = function(id) {
    ensureDialogs('currency', CURRENCY_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var cur = fw.findCurrency(id);
      if (!cur) { showToast('error', '货币不存在'); return; }

      document.getElementById('currencyDeleteId').value = id;
      document.getElementById('currencyDeleteIsBatch').value = 'false';
      document.getElementById('currencyDeleteDialogTitle').textContent = '删除货币';
      var msg = '<p>确定要删除「<strong>' + cur.name + '（' + cur.code + '）</strong>」吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>';
      document.getElementById('currencyDeleteMsg').innerHTML = msg;

      var overlay = document.getElementById('currencyDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.openCurrencyBatchDeleteDialog = function(ids) {
    ensureDialogs('currency', CURRENCY_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      if (!ids || ids.length === 0) { showToast('info', '请先选择要删除的货币'); return; }

      document.getElementById('currencyDeleteId').value = JSON.stringify(ids);
      document.getElementById('currencyDeleteIsBatch').value = 'true';
      document.getElementById('currencyDeleteDialogTitle').textContent = '批量删除货币';
      var msg = '<p>确定要批量删除以下 <strong>' + ids.length + '</strong> 个货币吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>';
      document.getElementById('currencyDeleteMsg').innerHTML = msg;

      var overlay = document.getElementById('currencyDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeCurrencyDeleteDialog = function() {
    var ov = document.getElementById('currencyDeleteDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmCurrencyDelete = function() {
    var fw = getFW();
    var id = document.getElementById('currencyDeleteId').value;
    var isBatch = document.getElementById('currencyDeleteIsBatch').value === 'true';
    closeCurrencyDeleteDialog();
    if (!fw) return;
    if (isBatch) {
      var ids = JSON.parse(id);
      fw.currencyBatchDeleteItems(ids);
      showToast('success', '已删除 ' + ids.length + ' 个货币');
    } else {
      fw.currencyDeleteItem(id);
      showToast('success', '货币已删除');
    }
    fw.renderCurrencyTable();
  };

  // ==================== 税率对话框 ====================
  var TAX_RATE_DLG_URLS = [
    'parameters/tax_rate/delete-dialog.html'
  ];


  // ---- 税率删除对话框 ----

  window.openTaxRateDeleteDialog = function(id) {
    ensureDialogs('tax-rate', TAX_RATE_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var rate = fw.findTaxRate(id);
      if (!rate) { showToast('error', '税率配置不存在'); return;
      }

      document.getElementById('taxRateDeleteId').value = id;
      document.getElementById('taxRateDeleteIsBatch').value = 'false';
      document.getElementById('taxRateDeleteDialogTitle').textContent = '删除税率配置';
      var label = rate.countryName;
      if (rate.stateName) label += '/' + rate.stateName;
      var msg = '<p>确定要删除「<strong>' + label + '</strong>」的税率配置吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复，删除后该地区将按兜底规则匹配税率。</p>';
      document.getElementById('taxRateDeleteMsg').innerHTML = msg;

      var overlay = document.getElementById('taxRateDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.openTaxRateBatchDeleteDialog = function(ids) {
    ensureDialogs('tax-rate', TAX_RATE_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      if (!ids || ids.length === 0) { showToast('info', '请先选择要删除的税率配置'); return; }

      document.getElementById('taxRateDeleteId').value = JSON.stringify(ids);
      document.getElementById('taxRateDeleteIsBatch').value = 'true';
      document.getElementById('taxRateDeleteDialogTitle').textContent = '批量删除税率配置';
      var msg = '<p>确定要批量删除以下 <strong>' + ids.length + '</strong> 个税率配置吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>';
      document.getElementById('taxRateDeleteMsg').innerHTML = msg;

      var overlay = document.getElementById('taxRateDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeTaxRateDeleteDialog = function() {
    var ov = document.getElementById('taxRateDeleteDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmTaxRateDelete = function() {
    var fw = getFW();
    var id = document.getElementById('taxRateDeleteId').value;
    var isBatch = document.getElementById('taxRateDeleteIsBatch').value === 'true';
    closeTaxRateDeleteDialog();
    if (!fw) return;
    if (isBatch) {
      var ids = JSON.parse(id);
      fw.taxRateBatchDeleteItems(ids);
      showToast('success', '已删除 ' + ids.length + ' 个税率配置');
    } else {
      fw.taxRateDeleteItem(id);
      showToast('success', '税率配置已删除');
    }
    fw.renderTaxRateTable();
  };




  // ==================== 运费管理对话框 ====================
  var SHIPPING_DLG_URLS = [
    'parameters/shipping/provider-dialog.html',
    'parameters/shipping/account-dialog.html',
    'parameters/shipping/channel-dialog.html',
    'parameters/shipping/rate-dialog.html',
    'parameters/shipping/delete-dialog.html',
    'parameters/shipping/copy-dialog.html'
  ];

  // ---- 物流商表单对话框 ----

  window.openShippingProviderDialog = function(mode, id) {
    ensureDialogs('shipping', SHIPPING_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var title = document.getElementById('shippingProviderDialogTitle');
      var nameInp = document.getElementById('shippingProviderName');
      var codeInp = document.getElementById('shippingProviderCode');
      var typeSel = document.getElementById('shippingProviderType');
      var websiteInp = document.getElementById('shippingProviderWebsite');
      var remarkInp = document.getElementById('shippingProviderRemark');
      var statSel = document.getElementById('shippingProviderStatus');

      document.getElementById('shippingProviderMode').value = mode;
      document.getElementById('shippingProviderEditId').value = id || '';

      if (mode === 'edit' && id) {
        title.textContent = '编辑物流商';
        var p = fw.findProvider(id);
        if (!p) { showToast('error', '物流商不存在'); return; }
        nameInp.value = p.name;
        codeInp.value = p.code;
        typeSel.value = p.type;
        websiteInp.value = p.website || '';
        remarkInp.value = p.remark || '';
        statSel.value = p.status;
      } else {
        title.textContent = '添加物流商';
        nameInp.value = '';
        codeInp.value = '';
        typeSel.value = '';
        websiteInp.value = '';
        remarkInp.value = '';
        statSel.value = 'active';
      }

      var overlay = document.getElementById('shippingProviderDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeShippingProviderDialog = function() {
    var ov = document.getElementById('shippingProviderDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.submitShippingProvider = function() {
    var fw = getFW();
    if (!fw) return;
    var mode = document.getElementById('shippingProviderMode').value;
    var editId = document.getElementById('shippingProviderEditId').value;
    var name = (document.getElementById('shippingProviderName').value || '').trim();
    var code = (document.getElementById('shippingProviderCode').value || '').trim().toUpperCase();
    var type = document.getElementById('shippingProviderType').value;
    var website = (document.getElementById('shippingProviderWebsite').value || '').trim();
    var remark = (document.getElementById('shippingProviderRemark').value || '').trim();
    var status = document.getElementById('shippingProviderStatus').value;

    if (!name) { showToast('warning', '请输入物流商名称'); return; }
    if (!code) { showToast('warning', '请输入物流商代码'); return; }
    if (!type) { showToast('warning', '请选择物流商类型'); return; }

    // 唯一性检查
    var providers = fw.providers || [];
    for (var i = 0; i < providers.length; i++) {
      if (mode === 'add' && providers[i].code === code) { showToast('warning', '该物流商代码已被使用'); return; }
      if (mode === 'edit' && providers[i].code === code && providers[i].id !== parseInt(editId)) { showToast('warning', '该物流商代码已被使用'); return; }
    }

    if (mode === 'add') {
      fw.providerAddItem(name, code, type, website, status);
    } else {
      fw.providerUpdateItem(parseInt(editId), name, code, type, website, status);
    }
    closeShippingProviderDialog();
    fw.renderShippingTable();
    showToast('success', mode === 'add' ? '物流商已添加' : '物流商已更新');
  };

  // ---- 授权账号表单对话框 ----

  window.openShippingAccountDialog = function(mode, id) {
    ensureDialogs('shipping', SHIPPING_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var title = document.getElementById('shippingAccountDialogTitle');
      var provSel = document.getElementById('shippingAccountProvider');
      var nameInp = document.getElementById('shippingAccountName');
      var codeInp = document.getElementById('shippingAccountCode');
      var apiKeyInp = document.getElementById('shippingAccountApiKey');
      var apiSecretInp = document.getElementById('shippingAccountApiSecret');
      var callbackInp = document.getElementById('shippingAccountCallbackUrl');
      var remarkInp = document.getElementById('shippingAccountRemark');
      var statSel = document.getElementById('shippingAccountStatus');

      document.getElementById('shippingAccountMode').value = mode;
      document.getElementById('shippingAccountEditId').value = id || '';

      // 填充物流商下拉
      var providers = fw.providers || [];
      provSel.innerHTML = '<option value="">请选择物流商</option>';
      providers.forEach(function(p) { var o = document.createElement('option'); o.value = p.id; o.textContent = p.name; provSel.appendChild(o); });

      if (mode === 'edit' && id) {
        title.textContent = '编辑授权账号';
        var a = fw.findAccount(id);
        if (!a) { showToast('error', '授权账号不存在'); return; }
        provSel.value = a.providerId;
        nameInp.value = a.name;
        codeInp.value = a.code;
        apiKeyInp.value = a.apiKey || '';
        apiSecretInp.value = a.apiSecret || '';
        callbackInp.value = a.callbackUrl || '';
        remarkInp.value = a.remark || '';
        statSel.value = a.status;
      } else {
        title.textContent = '添加授权账号';
        provSel.value = '';
        nameInp.value = '';
        codeInp.value = '';
        apiKeyInp.value = '';
        apiSecretInp.value = '';
        callbackInp.value = '';
        remarkInp.value = '';
        statSel.value = 'active';
      }

      var overlay = document.getElementById('shippingAccountDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeShippingAccountDialog = function() {
    var ov = document.getElementById('shippingAccountDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.submitShippingAccount = function() {
    var fw = getFW();
    if (!fw) return;
    var mode = document.getElementById('shippingAccountMode').value;
    var editId = document.getElementById('shippingAccountEditId').value;
    var providerId = parseInt(document.getElementById('shippingAccountProvider').value);
    var name = (document.getElementById('shippingAccountName').value || '').trim();
    var code = (document.getElementById('shippingAccountCode').value || '').trim().toUpperCase();
    var apiKey = (document.getElementById('shippingAccountApiKey').value || '').trim();
    var apiSecret = (document.getElementById('shippingAccountApiSecret').value || '').trim();
    var callbackUrl = (document.getElementById('shippingAccountCallbackUrl').value || '').trim();
    var remark = (document.getElementById('shippingAccountRemark').value || '').trim();
    var status = document.getElementById('shippingAccountStatus').value;

    if (!providerId) { showToast('warning', '请选择所属物流商'); return; }
    if (!name) { showToast('warning', '请输入账号名称'); return; }
    if (!code) { showToast('warning', '请输入账号代码'); return; }

    var accounts = fw.accounts || [];
    for (var i = 0; i < accounts.length; i++) {
      if (mode === 'add' && accounts[i].code === code) { showToast('warning', '该账号代码已被使用'); return; }
      if (mode === 'edit' && accounts[i].code === code && accounts[i].id !== parseInt(editId)) { showToast('warning', '该账号代码已被使用'); return; }
    }

    if (mode === 'add') {
      fw.accountAddItem(providerId, name, code, apiKey || '', apiSecret || '', callbackUrl, status);
    } else {
      fw.accountUpdateItem(parseInt(editId), providerId, name, code, apiKey || '', apiSecret || '', callbackUrl, status);
    }
    closeShippingAccountDialog();
    fw.renderShippingTable();
    showToast('success', mode === 'add' ? '授权账号已添加' : '授权账号已更新');
  };

  // ---- 渠道表单对话框 ----
  var _chCountryPickerCallback = null;
  var _chTempSelectedCountries = [];

  window.openShippingChannelDialog = function(mode, id) {
    ensureDialogs('shipping', SHIPPING_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var title = document.getElementById('shippingChannelDialogTitle');
      var provDisplay = document.getElementById('shippingChannelProviderDisplay');
      var acctSel = document.getElementById('shippingChannelAccount');
      var nameInp = document.getElementById('shippingChannelName');
      var codeInp = document.getElementById('shippingChannelCode');
      var srvSel = document.getElementById('shippingChannelServiceType');
      var daysInp = document.getElementById('shippingChannelEstimatedDays');
      var statSel = document.getElementById('shippingChannelStatus');

      document.getElementById('shippingChannelMode').value = mode;
      document.getElementById('shippingChannelEditId').value = id || '';

      // 填充账号下拉
      var accounts = fw.accounts || [];
      var providers = fw.providers || [];

      if (mode === 'edit' && id) {
        title.textContent = '编辑渠道';
        var ch = fw.findChannel(id);
        if (!ch) { showToast('error', '渠道不存在'); return; }
        var ac = fw.findAccount(ch.accountId);
        var p = ac ? fw.findProvider(ac.providerId) : null;
        provDisplay.textContent = p ? p.name : '—';
        nameInp.value = ch.name;
        codeInp.value = ch.code;
        srvSel.value = ch.serviceType;
        daysInp.value = ch.estimatedDays || '';
        statSel.value = ch.status;
        _chTempSelectedCountries = (ch.countries || []).slice();
        // 只显示该物流商下的账号
        acctSel.innerHTML = '';
        accounts.forEach(function(a) {
          if (a.providerId === (ac ? ac.providerId : 0)) { var o = document.createElement('option'); o.value = a.id; o.textContent = a.name; acctSel.appendChild(o); }
        });
        acctSel.value = ch.accountId;
      } else {
        title.textContent = '添加渠道';
        provDisplay.textContent = '—';
        nameInp.value = '';
        codeInp.value = '';
        srvSel.value = '';
        daysInp.value = '';
        statSel.value = 'active';
        _chTempSelectedCountries = [];
        // 显示所有账号
        acctSel.innerHTML = '<option value="">请选择授权账号</option>';
        accounts.forEach(function(a) { var o = document.createElement('option'); o.value = a.id; o.textContent = a.name + ' (' + (providers.find(function(p){return p.id===a.providerId;})||{}).name + ')'; acctSel.appendChild(o); });
      }
      document.getElementById('shippingChannelCountries').value = JSON.stringify(_chTempSelectedCountries);
      renderChannelCountryTags();
      var overlay = document.getElementById('shippingChannelDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeShippingChannelDialog = function() {
    var ov = document.getElementById('shippingChannelDialogOverlay');
    if (ov) ov.style.display = 'none';
    _chTempSelectedCountries = [];
  };

  function renderChannelCountryTags() {
    var container = document.getElementById('shippingChannelCountryTags');
    if (!container) return;
    if (_chTempSelectedCountries.length === 0) { container.innerHTML = '<span style="font-size:13px;color:hsl(var(--muted-foreground));">未选择</span>'; return; }
    container.innerHTML = _chTempSelectedCountries.map(function(c) { return '<span class="country-tag">' + c + '</span>'; }).join('');
  }

  window.openCountryPicker = function() {
    var overlay = document.getElementById('countryPickerOverlay');
    if (!overlay) return;
    // 获取国家列表（从 country iframe 或默认列表）
    var allCountries = [];
    try {
      var cache = window.PLATFORM_IFRAME_CACHE;
      if (cache && cache['parameters/country/country.html'] && cache['parameters/country/country.html'].contentWindow && cache['parameters/country/country.html'].contentWindow.countries) {
        allCountries = cache['parameters/country/country.html'].contentWindow.countries;
      }
    } catch(e) {}
    if (!allCountries.length) {
      allCountries = [
        { name: '美国', code: 'US' }, { name: '中国', code: 'CN' }, { name: '英国', code: 'GB' },
        { name: '德国', code: 'DE' }, { name: '法国', code: 'FR' }, { name: '日本', code: 'JP' },
        { name: '澳洲', code: 'AU' }, { name: '加拿大', code: 'CA' }, { name: '巴西', code: 'BR' },
        { name: '南非', code: 'ZA' }, { name: '新加坡', code: 'SG' }, { name: '韩国', code: 'KR' },
        { name: '印度', code: 'IN' }, { name: '意大利', code: 'IT' }, { name: '西班牙', code: 'ES' },
        { name: '荷兰', code: 'NL' }, { name: '瑞典', code: 'SE' }, { name: '挪威', code: 'NO' },
        { name: '丹麦', code: 'DK' }, { name: '芬兰', code: 'FI' }, { name: '波兰', code: 'PL' },
        { name: '乌克兰', code: 'UA' }, { name: '俄罗斯', code: 'RU' }, { name: '阿联酋', code: 'AE' },
        { name: '沙特', code: 'SA' }, { name: '墨西哥', code: 'MX' }, { name: '阿根廷', code: 'AR' },
        { name: '智利', code: 'CL' }, { name: '新西兰', code: 'NZ' }, { name: '泰国', code: 'TH' }
      ];
    }
    var list = document.getElementById('countryPickerList');
    list.innerHTML = allCountries.map(function(c) {
      var checked = _chTempSelectedCountries.indexOf(c.name) !== -1;
      return '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;" onmouseenter="this.style.background=\'hsl(var(--muted))\'" onmouseleave="this.style.background=\'\'">' +
        '<input type="checkbox" class="country-picker-check" value="' + c.name + '"' + (checked ? ' checked' : '') + ' onchange="updateCountryPickerCount()" style="width:16px;height:16px;">' +
        '<span style="font-size:13px;">' + c.name + '</span><span style="font-size:12px;color:hsl(var(--muted-foreground));">' + c.code + '</span>' +
        '</label>';
    }).join('');
    updateCountryPickerCount();
    overlay.style.display = 'flex';
  };

  window.closeCountryPicker = function() {
    var ov = document.getElementById('countryPickerOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.updateCountryPickerCount = function() {
    var boxes = document.querySelectorAll('.country-picker-check');
    var count = 0; boxes.forEach(function(b) { if (b.checked) count++; });
    var el = document.getElementById('countryPickerCount');
    if (el) el.textContent = count;
  };

  window.filterCountryPicker = function() {
    var q = (document.getElementById('countryPickerSearch').value || '').toLowerCase();
    var items = document.querySelectorAll('#countryPickerList label');
    items.forEach(function(item) {
      var text = item.textContent.toLowerCase();
      item.style.display = q ? (text.indexOf(q) !== -1 ? '' : 'none') : '';
    });
  };

  window.confirmCountryPicker = function() {
    var boxes = document.querySelectorAll('.country-picker-check');
    _chTempSelectedCountries = [];
    boxes.forEach(function(b) { if (b.checked) _chTempSelectedCountries.push(b.value); });
    if (_chTempSelectedCountries.length === 0) { showToast('info', '请至少选择一个配送国家'); return; }
    document.getElementById('shippingChannelCountries').value = JSON.stringify(_chTempSelectedCountries);
    renderChannelCountryTags();
    closeCountryPicker();
  };

  window.submitShippingChannel = function() {
    var fw = getFW();
    if (!fw) return;
    var mode = document.getElementById('shippingChannelMode').value;
    var editId = document.getElementById('shippingChannelEditId').value;
    var accountId = parseInt(document.getElementById('shippingChannelAccount').value);
    var name = (document.getElementById('shippingChannelName').value || '').trim();
    var code = (document.getElementById('shippingChannelCode').value || '').trim().toUpperCase();
    var serviceType = document.getElementById('shippingChannelServiceType').value;
    var countries = JSON.parse(document.getElementById('shippingChannelCountries').value || '[]');
    var estimatedDays = (document.getElementById('shippingChannelEstimatedDays').value || '').trim();
    var status = document.getElementById('shippingChannelStatus').value;

    if (!accountId) { showToast('warning', '请选择所属授权账号'); return; }
    if (!name) { showToast('warning', '请输入渠道名称'); return; }
    if (!code) { showToast('warning', '请输入渠道代码'); return; }
    if (!serviceType) { showToast('warning', '请选择服务类型'); return; }
    if (countries.length === 0) { showToast('warning', '请至少选择一个配送国家'); return; }

    var channels = fw.channels || [];
    for (var i = 0; i < channels.length; i++) {
      if (mode === 'add' && channels[i].code === code) { showToast('warning', '该渠道代码已被使用'); return; }
      if (mode === 'edit' && channels[i].code === code && channels[i].id !== parseInt(editId)) { showToast('warning', '该渠道代码已被使用'); return; }
    }

    if (mode === 'add') {
      fw.channelAddItem(accountId, name, code, serviceType, countries, estimatedDays, 'amount', status);
    } else {
      fw.channelUpdateItem(parseInt(editId), accountId, name, code, serviceType, countries, estimatedDays, undefined, status);
    }
    closeShippingChannelDialog();
    fw.renderShippingTable();
    showToast('success', mode === 'add' ? '渠道已添加' : '渠道已更新');
  };

  // ---- 运费规则配置对话框 ----
  var _rateTempRemoteFees = [];
  var _rateRemoteCallback = null;

  window.openShippingRateDialog = function(channelId) {
    ensureDialogs('shipping', SHIPPING_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var ch = fw.findChannel(channelId);
      if (!ch) { showToast('error', '渠道不存在'); return; }
      var ac = fw.findAccount(ch.accountId);
      var p = ac ? fw.findProvider(ac.providerId) : null;

      document.getElementById('shippingRateChannelId').value = channelId;

      // 渠道信息
      var info = document.getElementById('shippingRateChannelInfo');
      var infoCountries = (ch.countries||[]).join('、');
      if (infoCountries.length > 30) infoCountries = infoCountries.substring(0, 30) + '...';
      info.innerHTML = '<div class="info-item"><strong>物流商</strong>' + (p ? p.name : '—') + '</div>' +
        '<div class="info-item"><strong>账号</strong>' + (ac ? ac.name : '—') + '</div>' +
        '<div class="info-item"><strong>渠道</strong>' + ch.name + '</div>' +
        '<div class="info-item"><strong>国家</strong>' + (infoCountries || '—') + '</div>';

      // 查找已有模板
      var templates = fw.templates || [];
      var tpl = null;
      for (var i = 0; i < templates.length; i++) {
        if (templates[i].channelId === channelId) { tpl = templates[i]; break; }
      }

      if (tpl) {
        document.getElementById('shippingRateTemplateId').value = tpl.id;
        document.getElementById('rateBillingType').value = tpl.billingType;
        document.getElementById('rateFirstUnitFee').value = tpl.firstUnitFee || '';
        document.getElementById('rateAdditionalUnitFee').value = tpl.additionalUnitFee || '';
        document.getElementById('rateFreeShippingThreshold').value = tpl.freeShippingThreshold || '';
        document.getElementById('rateInsuranceEnabled').value = tpl.insuranceEnabled ? 'true' : 'false';
        document.getElementById('rateInsuranceRate').value = tpl.insuranceRate || '';
        document.getElementById('rateInsuranceHolder').value = tpl.insuranceHolder || 'platform';
        document.getElementById('rateIsTaxIncluded').value = tpl.isTaxIncluded ? 'true' : 'false';
        _rateTempRemoteFees = (tpl.remoteFeeRules || []).slice();
        document.getElementById('shippingRateDialogTitle').textContent = '编辑运费规则';
      } else {
        document.getElementById('shippingRateTemplateId').value = '';
        document.getElementById('rateBillingType').value = 'amount';
        document.getElementById('rateFirstUnitFee').value = '';
        document.getElementById('rateAdditionalUnitFee').value = '';
        document.getElementById('rateFreeShippingThreshold').value = '';
        document.getElementById('rateInsuranceEnabled').value = 'false';
        document.getElementById('rateInsuranceRate').value = '';
        document.getElementById('rateInsuranceHolder').value = 'platform';
        document.getElementById('rateIsTaxIncluded').value = 'false';
        _rateTempRemoteFees = [];
        document.getElementById('shippingRateDialogTitle').textContent = '配置运费规则';
      }

      onBillingTypeChange();
      onInsuranceChange();
      switchRateTab('basic');
      renderRateRules(tpl ? tpl.rules : null);
      renderRemoteFeeList();

      var overlay = document.getElementById('shippingRateDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeShippingRateDialog = function() {
    var ov = document.getElementById('shippingRateDialogOverlay');
    if (ov) ov.style.display = 'none';
    _rateTempRemoteFees = [];
  };

  window.switchRateTab = function(tab) {
    document.querySelectorAll('#shippingRateDialogOverlay .shipping-tab').forEach(function(t) { t.classList.remove('active'); });
    var basicTab = document.getElementById('rateTab-basic');
    var remoteTab = document.getElementById('rateTab-remote');
    if (tab === 'basic') {
      basicTab.style.display = '';
      remoteTab.style.display = 'none';
    } else {
      basicTab.style.display = 'none';
      remoteTab.style.display = '';
    }
    // highlight active tab button
    var tabs = document.querySelectorAll('#shippingRateDialogOverlay .shipping-tab');
    tabs.forEach(function(t) { if (t.textContent.indexOf(tab === 'basic' ? '基础' : '偏远') !== -1) t.classList.add('active'); });
  };

  window.onBillingTypeChange = function() {
    var type = document.getElementById('rateBillingType').value;
    var title = document.getElementById('rateRulesTitle');
    var tbody = document.getElementById('rateRulesBody');
    var addBtn = document.getElementById('btnAddRateRule');

    if (type === 'fixed') {
      title.textContent = '固定运费金额';
      addBtn.style.display = 'none';
      if (tbody.querySelectorAll('tr').length === 0) {
        tbody.innerHTML = '<tr><td colspan="3"><input class="form-input" type="number" id="rateFixedFee" placeholder="固定运费金额（如 10）" step="0.01" min="0"></td></tr>';
      }
    } else {
      title.textContent = type === 'amount' ? '金额区间规则 ($)' : '重量区间规则 (g)';
      addBtn.style.display = '';
      renderRateRules(null);
    }
  };

  function renderRateRules(rules) {
    var type = document.getElementById('rateBillingType').value;
    var tbody = document.getElementById('rateRulesBody');
    if (type === 'fixed') return;

    var unitLabel = type === 'amount' ? '$' : 'g';
    if (!rules) rules = [{from:0,to:30,fee:8},{from:30,to:80,fee:5},{from:80,to:150,fee:3}];

    tbody.innerHTML = rules.map(function(r, i) {
      return '<tr>' +
        '<td><div class="input-group"><input type="number" class="rate-rule-from" value="' + r.from + '" step="0.01" min="0"><span class="input-unit">' + unitLabel + '</span></div></td>' +
        '<td><div class="input-group"><input type="number" class="rate-rule-to" value="' + (r.to || '') + '" step="0.01" min="0" placeholder="无上限"><span class="input-unit">' + unitLabel + '</span></div></td>' +
        '<td><div class="input-group"><input type="number" class="rate-rule-fee" value="' + r.fee + '" step="0.01" min="0"><span class="input-unit">$</span></div></td>' +
        '<td><button class="btn-row-del" onclick="this.closest(\'tr\').remove()">&times;</button></td>' +
        '</tr>';
    }).join('');
  }

  window.addRateRule = function() {
    var tbody = document.getElementById('rateRulesBody');
    var rows = tbody.querySelectorAll('tr');
    var lastTo = rows.length > 0 ? parseInt(rows[rows.length-1].querySelector('.rate-rule-to').value) || 0 : 0;
    var row = document.createElement('tr');
    row.innerHTML = '<td><div class="input-group"><input type="number" class="rate-rule-from" value="' + lastTo + '" step="0.01" min="0"><span class="input-unit"></span></div></td>' +
      '<td><div class="input-group"><input type="number" class="rate-rule-to" value="' + (lastTo + 50) + '" step="0.01" min="0"><span class="input-unit"></span></div></td>' +
      '<td><div class="input-group"><input type="number" class="rate-rule-fee" value="0" step="0.01" min="0"><span class="input-unit">$</span></div></td>' +
      '<td><button class="btn-row-del" onclick="this.closest(\'tr\').remove()">&times;</button></td>';
    tbody.appendChild(row);
  };

  window.onInsuranceChange = function() {
    var enabled = document.getElementById('rateInsuranceEnabled').value === 'true';
    document.getElementById('rateInsuranceRateGroup').style.display = enabled ? '' : 'none';
    document.getElementById('rateInsuranceHolderGroup').style.display = enabled ? '' : 'none';
  };

  // ---- 偏远地区附加费 ----

  function renderRemoteFeeList() {
    var container = document.getElementById('remoteFeeRulesList');
    if (!container) return;
    if (_rateTempRemoteFees.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:hsl(var(--muted-foreground));font-size:13px;">暂无偏远地区附加费规则</div>';
      return;
    }
    container.innerHTML = _rateTempRemoteFees.map(function(rf, i) {
      var typeLabel = rf.type === 'fixed' ? '固定金额 $' + rf.amount : '百分比 ' + rf.percent + '%';
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid hsl(var(--border));border-radius:6px;margin-bottom:6px;">' +
        '<span style="font-size:13px;"><strong>' + rf.country + '</strong> — ' + typeLabel + '</span>' +
        '<button class="btn-row-del" onclick="removeRemoteFee(' + i + ')">&times;</button>' +
        '</div>';
    }).join('');
  }

  window.addRemoteFeeRule = function() {
    _rateRemoteCallback = function(country) {
      if (!country) return;
      _rateTempRemoteFees.push({ country: country, type: 'fixed', amount: 5 });
      renderRemoteFeeList();
    };
    openRemoteCountryPicker();
  };

  window.removeRemoteFee = function(index) {
    _rateTempRemoteFees.splice(index, 1);
    renderRemoteFeeList();
  };

  window.openRemoteCountryPicker = function() {
    var overlay = document.getElementById('remoteCountryPickerOverlay');
    if (!overlay) return;
    var allCountries = [
      { name: '南非', code: 'ZA' }, { name: '巴西', code: 'BR' }, { name: '阿根廷', code: 'AR' },
      { name: '智利', code: 'CL' }, { name: '俄罗斯', code: 'RU' }, { name: '印度', code: 'IN' },
      { name: '墨西哥', code: 'MX' }, { name: '乌克兰', code: 'UA' }, { name: '沙特', code: 'SA' },
      { name: '阿联酋', code: 'AE' }, { name: '新西兰', code: 'NZ' }, { name: '挪威', code: 'NO' },
      { name: '芬兰', code: 'FI' }, { name: '波兰', code: 'PL' }
    ];
    var list = document.getElementById('remoteCountryPickerList');
    list.innerHTML = allCountries.map(function(c) {
      return '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;" onmouseenter="this.style.background=\'hsl(var(--muted))\'" onmouseleave="this.style.background=\'\'">' +
        '<input type="radio" name="remoteCountryRadio" value="' + c.name + '" style="width:16px;height:16px;">' +
        '<span style="font-size:13px;">' + c.name + '</span><span style="font-size:12px;color:hsl(var(--muted-foreground));">' + c.code + '</span>' +
        '</label>';
    }).join('');
    overlay.style.display = 'flex';
  };

  window.closeRemoteCountryPicker = function() {
    var ov = document.getElementById('remoteCountryPickerOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmRemoteCountryPicker = function() {
    var radio = document.querySelector('input[name="remoteCountryRadio"]:checked');
    if (!radio) { showToast('info', '请选择一个偏远国家'); return; }
    var country = radio.value;
    closeRemoteCountryPicker();
    if (_rateRemoteCallback) _rateRemoteCallback(country);
    _rateRemoteCallback = null;
  };

  // ---- 提交运费规则 ----

  window.submitShippingRate = function() {
    var fw = getFW();
    if (!fw) return;
    var channelId = parseInt(document.getElementById('shippingRateChannelId').value);
    var tplId = document.getElementById('shippingRateTemplateId').value;
    var billingType = document.getElementById('rateBillingType').value;
    var firstUnitFee = parseFloat(document.getElementById('rateFirstUnitFee').value) || 0;
    var additionalUnitFee = parseFloat(document.getElementById('rateAdditionalUnitFee').value) || 0;
    var freeShippingThreshold = parseFloat(document.getElementById('rateFreeShippingThreshold').value) || 0;
    var insuranceEnabled = document.getElementById('rateInsuranceEnabled').value === 'true';
    var insuranceRate = parseFloat(document.getElementById('rateInsuranceRate').value) || 0;
    var insuranceHolder = document.getElementById('rateInsuranceHolder').value;
    var isTaxIncluded = document.getElementById('rateIsTaxIncluded').value === 'true';

    // 读取规则
    var rules = [];
    if (billingType === 'fixed') {
      var fixedFee = parseFloat(document.getElementById('rateFixedFee').value) || 0;
      rules = [{from:0,to:0,fee:fixedFee}];
    } else {
      var froms = document.querySelectorAll('.rate-rule-from');
      var tos = document.querySelectorAll('.rate-rule-to');
      var fees = document.querySelectorAll('.rate-rule-fee');
      for (var i = 0; i < froms.length; i++) {
        var f = parseFloat(froms[i].value) || 0;
        var t = parseFloat(tos[i].value) || 0;
        var fee = parseFloat(fees[i].value) || 0;
        rules.push({ from: f, to: t, fee: fee });
      }
      if (rules.length === 0) { showToast('warning', '请至少配置一条计费规则'); return; }
    }

    var tpl = {
      channelId: channelId,
      billingType: billingType,
      rules: rules,
      firstUnitFee: firstUnitFee,
      additionalUnitFee: additionalUnitFee,
      freeShippingThreshold: freeShippingThreshold,
      remoteFeeRules: _rateTempRemoteFees,
      insuranceEnabled: insuranceEnabled,
      insuranceRate: insuranceRate,
      insuranceHolder: insuranceHolder,
      isTaxIncluded: isTaxIncluded
    };
    if (tplId) tpl.id = parseInt(tplId);

    fw.templateSaveItem(tpl);
    closeShippingRateDialog();
    fw.renderShippingTable();
    showToast('success', '运费规则已保存');
  };

  // ---- 删除对话框（通用） ----

  window.openShippingDeleteDialog = function(type, id) {
    ensureDialogs('shipping', SHIPPING_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var name = '';
      if (type === 'provider') { var p = fw.findProvider(id); if (!p) return; name = p.name; }
      else if (type === 'account') { var a = fw.findAccount(id); if (!a) return; name = a.name; }
      else if (type === 'channel') { var ch = fw.findChannel(id); if (!ch) return; name = ch.name; }

      var typeLabels = { provider: '物流商', account: '授权账号', channel: '渠道' };
      document.getElementById('shippingDeleteType').value = type;
      document.getElementById('shippingDeleteId').value = id;
      document.getElementById('shippingDeleteIsBatch').value = 'false';
      document.getElementById('shippingDeleteDialogTitle').textContent = '删除' + typeLabels[type];
      var msg = '<p>确定要删除' + typeLabels[type] + '「<strong>' + name + '</strong>」吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>';
      document.getElementById('shippingDeleteMsg').innerHTML = msg;

      var overlay = document.getElementById('shippingDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.openShippingBatchDeleteDialog = function(type, ids) {
    ensureDialogs('shipping', SHIPPING_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      if (!ids || ids.length === 0) { showToast('info', '请先选择要删除的项'); return; }
      var typeLabels = { provider: '物流商', account: '授权账号', channel: '渠道' };
      document.getElementById('shippingDeleteType').value = type;
      document.getElementById('shippingDeleteId').value = JSON.stringify(ids);
      document.getElementById('shippingDeleteIsBatch').value = 'true';
      document.getElementById('shippingDeleteDialogTitle').textContent = '批量删除' + typeLabels[type];
      var msg = '<p>确定要批量删除以下 <strong>' + ids.length + '</strong> 个' + typeLabels[type] + '吗？</p><p style="margin-top:6px;color:hsl(var(--error));">此操作不可恢复。</p>';
      document.getElementById('shippingDeleteMsg').innerHTML = msg;
      var overlay = document.getElementById('shippingDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeShippingDeleteDialog = function() {
    var ov = document.getElementById('shippingDeleteDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmShippingDelete = function() {
    var fw = getFW();
    var type = document.getElementById('shippingDeleteType').value;
    var id = document.getElementById('shippingDeleteId').value;
    var isBatch = document.getElementById('shippingDeleteIsBatch').value === 'true';
    closeShippingDeleteDialog();
    if (!fw) return;
    if (isBatch) {
      var ids = JSON.parse(id);
      if (type === 'provider') fw.providerBatchDeleteItems(ids);
      else if (type === 'account') fw.accountBatchDeleteItems(ids);
      else if (type === 'channel') fw.channelBatchDeleteItems(ids);
      showToast('success', '已删除 ' + ids.length + ' 条');
    } else {
      if (type === 'provider') fw.providerDeleteItem(parseInt(id));
      else if (type === 'account') fw.accountDeleteItem(parseInt(id));
      else if (type === 'channel') fw.channelDeleteItem(parseInt(id));
      showToast('success', '已删除');
    }
    fw.renderShippingTable();
  };

  // ---- 复制运费规则对话框 ----

  window.openShippingCopyDialog = function(channelId) {
    ensureDialogs('shipping', SHIPPING_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var ch = fw.findChannel(channelId);
      if (!ch) { showToast('error', '渠道不存在'); return; }
      document.getElementById('shippingCopySourceChannelId').value = channelId;
      document.getElementById('shippingCopySourceLabel').textContent = ch.name + ' (' + (ch.countries||[]).join('、') + ')';

      // 填充目标渠道下拉（排除自身和已有模板的渠道）
      var channels = fw.channels || [];
      var templates = fw.templates || [];
      var tplChannelIds = templates.map(function(t) { return t.channelId; });
      var sel = document.getElementById('shippingCopyTargetChannel');
      sel.innerHTML = '<option value="">请选择目标渠道</option>';
      channels.forEach(function(c) {
        if (c.id !== channelId) {
          var hasTpl = tplChannelIds.indexOf(c.id) !== -1;
          var ac = fw.findAccount(c.accountId);
          var p = ac ? fw.findProvider(ac.providerId) : null;
          var o = document.createElement('option');
          o.value = c.id;
          o.textContent = c.name + ' (' + (p?p.name:'—') + ')' + (hasTpl ? ' [已有规则]' : '');
          sel.appendChild(o);
        }
      });

      var overlay = document.getElementById('shippingCopyDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeShippingCopyDialog = function() {
    var ov = document.getElementById('shippingCopyDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmShippingCopy = function() {
    var fw = getFW();
    if (!fw) return;
    var sourceChannelId = parseInt(document.getElementById('shippingCopySourceChannelId').value);
    var targetChannelId = parseInt(document.getElementById('shippingCopyTargetChannel').value);
    if (!targetChannelId) { showToast('warning', '请选择目标渠道'); return; }

    var templates = fw.templates || [];
    var sourceTpl = null;
    for (var i = 0; i < templates.length; i++) {
      if (templates[i].channelId === sourceChannelId) { sourceTpl = templates[i]; break; }
    }
    if (!sourceTpl) { showToast('error', '源渠道没有运费规则'); return; }

    // 复制模板
    var newTpl = JSON.parse(JSON.stringify(sourceTpl));
    newTpl.channelId = targetChannelId;
    // 如果目标已有模板则更新
    var existing = null;
    for (var j = 0; j < templates.length; j++) {
      if (templates[j].channelId === targetChannelId) { existing = templates[j]; break; }
    }
    if (existing) {
      Object.assign(existing, newTpl);
    } else {
      fw.templateSaveItem(newTpl);
    }
    closeShippingCopyDialog();
    fw.renderShippingTable();
    showToast('success', '运费规则已复制');
  };

  // ==================== 物流商管理对话框 ====================
  var LOGISTICS_DLG_URLS = [
    'parameters/logistics_provider/provider-form-dialog.html',
    'parameters/logistics_provider/account-form-dialog.html',
    'parameters/logistics_provider/delete-dialog.html',
    'parameters/logistics_provider/toggle-dialog.html'
  ];

  // ---- 物流商表单对话框 ----
  window.openLogisticsProviderDialog = function(mode, id) {
    ensureDialogs('logistics', LOGISTICS_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var title = document.getElementById('logisticsProviderDialogTitle');
      var nameInp = document.getElementById('logisticsProviderName');
      var codeInp = document.getElementById('logisticsProviderCode');
      var typeSel = document.getElementById('logisticsProviderType');
      var websiteInp = document.getElementById('logisticsProviderWebsite');
      var logoInp = document.getElementById('logisticsProviderLogo');
      var descInp = document.getElementById('logisticsProviderDescription');
      var sortInp = document.getElementById('logisticsProviderSortOrder');
      var statSel = document.getElementById('logisticsProviderStatus');

      document.getElementById('logisticsProviderMode').value = mode;
      document.getElementById('logisticsProviderEditId').value = id || '';

      if (mode === 'edit' && id) {
        title.textContent = '编辑物流商';
        var p = fw.findProvider(id);
        if (!p) { showToast('error', '物流商不存在'); return; }
        nameInp.value = p.name;
        codeInp.value = p.code;
        codeInp.setAttribute('readonly', 'readonly');
        codeInp.style.backgroundColor = 'hsl(var(--muted))';
        typeSel.value = p.type;
        websiteInp.value = p.website || '';
        if (logoInp) logoInp.value = '';
        descInp.value = p.description || '';
        sortInp.value = p.sortOrder || 999;
        statSel.value = p.status;
      } else {
        title.textContent = '新增物流商';
        nameInp.value = '';
        codeInp.value = '';
        codeInp.removeAttribute('readonly');
        codeInp.style.backgroundColor = '';
        typeSel.value = '';
        websiteInp.value = '';
        if (logoInp) logoInp.value = '';
        descInp.value = '';
        sortInp.value = '999';
        statSel.value = 'enabled';
      }

      var overlay = document.getElementById('logisticsProviderDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeLogisticsProviderDialog = function() {
    var ov = document.getElementById('logisticsProviderDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.submitLogisticsProvider = function() {
    var fw = getFW();
    if (!fw) return;
    var mode = document.getElementById('logisticsProviderMode').value;
    var editId = document.getElementById('logisticsProviderEditId').value;
    var name = (document.getElementById('logisticsProviderName').value || '').trim();
    var code = (document.getElementById('logisticsProviderCode').value || '').trim().toUpperCase();
    var type = document.getElementById('logisticsProviderType').value;
    var website = (document.getElementById('logisticsProviderWebsite').value || '').trim();
    var description = (document.getElementById('logisticsProviderDescription').value || '').trim();
    var sortOrder = parseInt(document.getElementById('logisticsProviderSortOrder').value) || 999;
    var status = document.getElementById('logisticsProviderStatus').value;

    // 表单校验
    if (!name) { showToast('warning', '请输入物流商名称'); return; }
    if (!code) { showToast('warning', '请输入物流商代码'); return; }
    if (!type) { showToast('warning', '请选择物流商类型'); return; }

    // 代码格式校验
    if (!/^[A-Z0-9_]+$/.test(code)) { showToast('warning', '物流商代码只能包含字母、数字和下划线'); return; }
    if (code.length > 20) { showToast('warning', '物流商代码最大20字符'); return; }
    if (name.length > 50) { showToast('warning', '物流商名称最大50字符'); return; }

    // 官网URL校验
    if (website && !/^https?:\/\/.+/.test(website)) { showToast('warning', '请输入有效的官网URL'); return; }

    // 唯一性检查
    var providers = fw.providers || [];
    for (var i = 0; i < providers.length; i++) {
      if (mode === 'add' && providers[i].code === code) { showToast('warning', '该物流商代码已被使用，请更换'); return; }
      if (mode === 'edit' && providers[i].code === code && providers[i].id !== parseInt(editId)) { showToast('warning', '该物流商代码已被使用，请更换'); return; }
    }

    if (mode === 'add') {
      fw.providerAddItem(name, code, type, website, '', description, sortOrder, status);
    } else {
      fw.providerUpdateItem(parseInt(editId), name, code, type, website, '', description, sortOrder, status);
    }
    closeLogisticsProviderDialog();
    fw.renderLogisticsTable();
    showToast('success', mode === 'add' ? '物流商已添加' : '保存成功');
  };

  // ---- 授权账号表单对话框 ----
  window.openLogisticsAccountDialog = function(mode, id) {
    ensureDialogs('logistics', LOGISTICS_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var title = document.getElementById('logisticsAccountDialogTitle');
      var provSel = document.getElementById('logisticsAccountProvider');
      var nameInp = document.getElementById('logisticsAccountName');
      var codeInp = document.getElementById('logisticsAccountCode');
      var apiKeyInp = document.getElementById('logisticsAccountApiKey');
      var apiSecretInp = document.getElementById('logisticsAccountApiSecret');
      var callbackInp = document.getElementById('logisticsAccountCallbackUrl');
      var descInp = document.getElementById('logisticsAccountDescription');
      var statSel = document.getElementById('logisticsAccountStatus');

      document.getElementById('logisticsAccountMode').value = mode;
      document.getElementById('logisticsAccountEditId').value = id || '';

      // 填充物流商下拉
      var providers = fw.providers || [];
      provSel.innerHTML = '<option value="">请选择物流商</option>';
      providers.forEach(function(p) { var o = document.createElement('option'); o.value = p.id; o.textContent = p.name; provSel.appendChild(o); });

      if (mode === 'edit' && id) {
        title.textContent = '编辑授权账号';
        var a = fw.findAccount(id);
        if (!a) { showToast('error', '授权账号不存在'); return; }
        provSel.value = a.providerId;
        provSel.setAttribute('disabled', 'disabled');
        nameInp.value = a.name;
        codeInp.value = a.code;
        codeInp.setAttribute('readonly', 'readonly');
        codeInp.style.backgroundColor = 'hsl(var(--muted))';
        apiKeyInp.value = a.apiKey || '';
        apiSecretInp.value = a.apiSecret || '';
        callbackInp.value = a.callbackUrl || '';
        descInp.value = a.description || '';
        statSel.value = a.status;
      } else {
        title.textContent = '新增授权账号';
        provSel.value = '';
        provSel.removeAttribute('disabled');
        nameInp.value = '';
        codeInp.value = '';
        codeInp.removeAttribute('readonly');
        codeInp.style.backgroundColor = '';
        apiKeyInp.value = '';
        apiSecretInp.value = '';
        callbackInp.value = '';
        descInp.value = '';
        statSel.value = 'enabled';
      }

      var overlay = document.getElementById('logisticsAccountDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeLogisticsAccountDialog = function() {
    var ov = document.getElementById('logisticsAccountDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.submitLogisticsAccount = function() {
    var fw = getFW();
    if (!fw) return;
    var mode = document.getElementById('logisticsAccountMode').value;
    var editId = document.getElementById('logisticsAccountEditId').value;
    var providerId = parseInt(document.getElementById('logisticsAccountProvider').value);
    var name = (document.getElementById('logisticsAccountName').value || '').trim();
    var code = (document.getElementById('logisticsAccountCode').value || '').trim().toUpperCase();
    var apiKey = (document.getElementById('logisticsAccountApiKey').value || '').trim();
    var apiSecret = (document.getElementById('logisticsAccountApiSecret').value || '').trim();
    var callbackUrl = (document.getElementById('logisticsAccountCallbackUrl').value || '').trim();
    var description = (document.getElementById('logisticsAccountDescription').value || '').trim();
    var status = document.getElementById('logisticsAccountStatus').value;

    if (!providerId) { showToast('warning', '请选择所属物流商'); return; }
    if (!name) { showToast('warning', '请输入账号名称'); return; }
    if (!code) { showToast('warning', '请输入账号代码'); return; }

    if (!/^[A-Z0-9_]+$/.test(code)) { showToast('warning', '账号代码只能包含字母、数字和下划线'); return; }
    if (code.length > 30) { showToast('warning', '账号代码最大30字符'); return; }
    if (name.length > 50) { showToast('warning', '账号名称最大50字符'); return; }
    if (callbackUrl && !/^https?:\/\/.+/.test(callbackUrl)) { showToast('warning', '请输入有效的回调URL'); return; }

    var accounts = fw.accounts || [];
    for (var i = 0; i < accounts.length; i++) {
      if (mode === 'add' && accounts[i].code === code) { showToast('warning', '该账号代码已被使用，请更换'); return; }
      if (mode === 'edit' && accounts[i].code === code && accounts[i].id !== parseInt(editId)) { showToast('warning', '该账号代码已被使用，请更换'); return; }
    }

    if (mode === 'add') {
      fw.accountAddItem(providerId, name, code, apiKey, apiSecret, callbackUrl, description, status);
    } else {
      fw.accountUpdateItem(parseInt(editId), providerId, name, code, apiKey, apiSecret, callbackUrl, description, status);
    }
    closeLogisticsAccountDialog();
    fw.renderLogisticsTable();
    showToast('success', mode === 'add' ? '授权账号已添加' : '保存成功');
  };

  // ---- 删除确认对话框 ----
  window.openLogisticsDeleteDialog = function(type, id) {
    ensureDialogs('logistics', LOGISTICS_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var name = '';
      if (type === 'provider') { var p = fw.findProvider(id); name = p ? p.name : ''; }
      else { var a = fw.findAccount(id); name = a ? a.name : ''; }
      var typeName = type === 'provider' ? '物流商' : '授权账号';
      document.getElementById('logisticsDeleteDialogTitle').textContent = '确认删除';
      document.getElementById('logisticsDeleteType').value = type;
      document.getElementById('logisticsDeleteId').value = id;
      document.getElementById('logisticsDeleteIsBatch').value = 'false';
      document.getElementById('logisticsDeleteMsg').innerHTML = '确定要删除' + typeName + '「' + name + '」吗？<br><br>删除后不可恢复。';
      var overlay = document.getElementById('logisticsDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.openLogisticsBatchDeleteDialog = function(type, ids) {
    ensureDialogs('logistics', LOGISTICS_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      if (!ids || ids.length === 0) { showToast('info', '请先选择要删除的项'); return; }
      var typeName = type === 'provider' ? '物流商' : '授权账号';
      document.getElementById('logisticsDeleteDialogTitle').textContent = '批量删除';
      document.getElementById('logisticsDeleteType').value = type;
      document.getElementById('logisticsDeleteId').value = JSON.stringify(ids);
      document.getElementById('logisticsDeleteIsBatch').value = 'true';
      document.getElementById('logisticsDeleteMsg').innerHTML = '确定要删除选中的 ' + ids.length + ' 个' + typeName + '吗？<br><br>删除后不可恢复。';
      var overlay = document.getElementById('logisticsDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeLogisticsDeleteDialog = function() {
    var ov = document.getElementById('logisticsDeleteDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmLogisticsDelete = function() {
    var fw = getFW();
    if (!fw) return;
    var type = document.getElementById('logisticsDeleteType').value;
    var isBatch = document.getElementById('logisticsDeleteIsBatch').value === 'true';
    if (isBatch) {
      var ids = JSON.parse(document.getElementById('logisticsDeleteId').value);
      if (type === 'provider') { fw.providerBatchDeleteItems(ids); }
      else { fw.accountBatchDeleteItems(ids); }
    } else {
      var id = parseInt(document.getElementById('logisticsDeleteId').value);
      if (type === 'provider') { fw.providerDeleteItem(id); }
      else { fw.accountDeleteItem(id); }
    }
    closeLogisticsDeleteDialog();
    fw.renderLogisticsTable();
    showToast('success', '删除成功');
  };

  // ==================== 物流渠道管理对话框 ====================
  var CHANNEL_DLG_URLS = [
    'parameters/channel/channel-form-dialog.html',
    'parameters/channel/delete-dialog.html',
    'parameters/channel/toggle-dialog.html',
    'parameters/channel/copy-dialog.html'
  ];

  var _chTempSelectedCountries = [];

  // ---- 渠道表单对话框 ----
  window.openChannelDialog = function(mode, id) {
    ensureDialogs('channel', CHANNEL_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var title = document.getElementById('channelDialogTitle');
      var provSel = document.getElementById('channelProvider');
      var acctSel = document.getElementById('channelAccount');
      var nameInp = document.getElementById('channelName');
      var codeInp = document.getElementById('channelCode');
      var srvSel = document.getElementById('channelServiceType');
      var daysMinInp = document.getElementById('channelEstDaysMin');
      var daysMaxInp = document.getElementById('channelEstDaysMax');
      var descInp = document.getElementById('channelDescription');
      var sortInp = document.getElementById('channelSortOrder');
      var statSel = document.getElementById('channelStatus');

      document.getElementById('channelMode').value = mode;
      document.getElementById('channelEditId').value = id || '';

      var providers = fw.providers || [];
      var accounts = fw.accounts || [];

      // 填充物流商下拉
      provSel.innerHTML = '<option value="">请选择物流商</option>';
      providers.forEach(function(p) {
        var o = document.createElement('option'); o.value = p.id; o.textContent = p.name; provSel.appendChild(o);
      });

      if (mode === 'edit' && id) {
        title.textContent = '编辑渠道';
        var ch = fw.findChannel(id);
        if (!ch) { showToast('error', '渠道不存在'); return; }
        var ac = fw.findAccount(ch.accountId);
        nameInp.value = ch.name;
        codeInp.value = ch.code;
        srvSel.value = ch.serviceType;
        daysMinInp.value = ch.estimatedDaysMin || '';
        daysMaxInp.value = ch.estimatedDaysMax || '';
        descInp.value = ch.description || '';
        sortInp.value = ch.sortOrder || 999;
        statSel.value = ch.status;
        _chTempSelectedCountries = (ch.countries || []).slice();
        // 编辑模式：物流商锁定，只显示该物流商下的账号
        if (ac) {
          provSel.value = ac.providerId;
          provSel.disabled = true;
          acctSel.innerHTML = '';
          accounts.forEach(function(a) {
            if (a.providerId === ac.providerId) {
              var o = document.createElement('option'); o.value = a.id; o.textContent = a.name; acctSel.appendChild(o);
            }
          });
          acctSel.value = ch.accountId;
        }
      } else {
        title.textContent = '新增渠道';
        provSel.value = '';
        provSel.disabled = false;
        nameInp.value = '';
        codeInp.value = '';
        srvSel.value = '';
        daysMinInp.value = '';
        daysMaxInp.value = '';
        descInp.value = '';
        sortInp.value = '999';
        statSel.value = 'enabled';
        _chTempSelectedCountries = [];
        acctSel.innerHTML = '<option value="">请选择授权账号</option>';
      }
      document.getElementById('channelCountries').value = JSON.stringify(_chTempSelectedCountries);
      renderChannelCountryTags();
      var overlay = document.getElementById('channelDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeChannelDialog = function() {
    var ov = document.getElementById('channelDialogOverlay');
    if (ov) ov.style.display = 'none';
    _chTempSelectedCountries = [];
  };

  window.onChannelAccountChange = function() {
    var fw = getFW();
    if (!fw) return;
    var acctId = parseInt(document.getElementById('channelAccount').value);
    var ac = fw.findAccount(acctId);
    var p = ac ? fw.findProvider(ac.providerId) : null;
    // 自动更新物流商下拉
    var provSel = document.getElementById('channelProvider');
    if (provSel && p && !provSel.disabled) {
      provSel.value = p.id;
    }
  };

  window.onChannelProviderChange = function() {
    var fw = getFW();
    if (!fw) return;
    var provId = parseInt(document.getElementById('channelProvider').value);
    var acctSel = document.getElementById('channelAccount');
    var accounts = fw.accounts || [];
    acctSel.innerHTML = '<option value="">请选择授权账号</option>';
    if (provId) {
      accounts.filter(function(a) { return a.providerId === provId; }).forEach(function(a) {
        var o = document.createElement('option'); o.value = a.id; o.textContent = a.name; acctSel.appendChild(o);
      });
    }
  };

  function renderChannelCountryTags() {
    var container = document.getElementById('channelCountryTags');
    if (!container) return;
    if (_chTempSelectedCountries.length === 0) { container.innerHTML = '<span style="font-size:13px;color:hsl(var(--muted-foreground));">未选择</span>'; return; }
    container.innerHTML = _chTempSelectedCountries.map(function(c) { return '<span class="country-tag">' + c + '</span>'; }).join('');
  }

  window.openChannelCountryPicker = function() {
    var overlay = document.getElementById('channelCountryPickerOverlay');
    if (!overlay) return;
    var allCountries = [
      { name: '美国', code: 'US' }, { name: '中国', code: 'CN' }, { name: '英国', code: 'GB' },
      { name: '德国', code: 'DE' }, { name: '法国', code: 'FR' }, { name: '日本', code: 'JP' },
      { name: '澳洲', code: 'AU' }, { name: '加拿大', code: 'CA' }, { name: '巴西', code: 'BR' },
      { name: '南非', code: 'ZA' }, { name: '新加坡', code: 'SG' }, { name: '韩国', code: 'KR' },
      { name: '印度', code: 'IN' }, { name: '意大利', code: 'IT' }, { name: '西班牙', code: 'ES' },
      { name: '荷兰', code: 'NL' }, { name: '瑞典', code: 'SE' }, { name: '挪威', code: 'NO' },
      { name: '丹麦', code: 'DK' }, { name: '芬兰', code: 'FI' }, { name: '波兰', code: 'PL' },
      { name: '乌克兰', code: 'UA' }, { name: '俄罗斯', code: 'RU' }, { name: '阿联酋', code: 'AE' },
      { name: '沙特', code: 'SA' }, { name: '墨西哥', code: 'MX' }, { name: '阿根廷', code: 'AR' },
      { name: '智利', code: 'CL' }, { name: '新西兰', code: 'NZ' }, { name: '泰国', code: 'TH' }
    ];
    var list = document.getElementById('channelCountryPickerList');
    list.innerHTML = allCountries.map(function(c) {
      var checked = _chTempSelectedCountries.indexOf(c.name) !== -1;
      return '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;" onmouseenter="this.style.background=\'hsl(var(--muted))\'" onmouseleave="this.style.background=\'\'">' +
        '<input type="checkbox" class="channel-country-picker-check" value="' + c.name + '"' + (checked ? ' checked' : '') + ' onchange="updateChannelCountryPickerCount()" style="width:16px;height:16px;">' +
        '<span style="font-size:13px;">' + c.name + '</span><span style="font-size:12px;color:hsl(var(--muted-foreground));">' + c.code + '</span>' +
        '</label>';
    }).join('');
    updateChannelCountryPickerCount();
    overlay.style.display = 'flex';
  };

  window.closeChannelCountryPicker = function() {
    var ov = document.getElementById('channelCountryPickerOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.updateChannelCountryPickerCount = function() {
    var boxes = document.querySelectorAll('.channel-country-picker-check');
    var count = 0; boxes.forEach(function(b) { if (b.checked) count++; });
    var el = document.getElementById('channelCountryPickerCount');
    if (el) el.textContent = count;
  };

  window.filterChannelCountryPicker = function() {
    var q = (document.getElementById('channelCountryPickerSearch').value || '').toLowerCase();
    var items = document.querySelectorAll('#channelCountryPickerList label');
    items.forEach(function(item) {
      var text = item.textContent.toLowerCase();
      item.style.display = q ? (text.indexOf(q) !== -1 ? '' : 'none') : '';
    });
  };

  window.confirmChannelCountryPicker = function() {
    var boxes = document.querySelectorAll('.channel-country-picker-check');
    _chTempSelectedCountries = [];
    boxes.forEach(function(b) { if (b.checked) _chTempSelectedCountries.push(b.value); });
    if (_chTempSelectedCountries.length === 0) { showToast('warning', '请至少选择一个配送国家'); return; }
    document.getElementById('channelCountries').value = JSON.stringify(_chTempSelectedCountries);
    renderChannelCountryTags();
    closeChannelCountryPicker();
  };

  window.submitChannel = function() {
    var fw = getFW();
    if (!fw) return;
    var mode = document.getElementById('channelMode').value;
    var editId = document.getElementById('channelEditId').value;
    var accountId = parseInt(document.getElementById('channelAccount').value);
    var name = (document.getElementById('channelName').value || '').trim();
    var code = (document.getElementById('channelCode').value || '').trim().toUpperCase();
    var serviceType = document.getElementById('channelServiceType').value;
    var countries = JSON.parse(document.getElementById('channelCountries').value || '[]');
    var estDaysMin = parseInt(document.getElementById('channelEstDaysMin').value) || 0;
    var estDaysMax = parseInt(document.getElementById('channelEstDaysMax').value) || 0;
    var description = (document.getElementById('channelDescription').value || '').trim();
    var sortOrder = parseInt(document.getElementById('channelSortOrder').value) || 999;
    var status = document.getElementById('channelStatus').value;

    if (mode === 'add') {
      var provId = parseInt(document.getElementById('channelProvider').value);
      if (!provId) { showToast('warning', '请选择所属物流商'); return; }
    }
    if (!accountId) { showToast('warning', '请选择所属授权账号'); return; }
    if (!name) { showToast('warning', '请输入渠道名称'); return; }
    if (name.length > 100) { showToast('warning', '渠道名称最大100字符'); return; }
    if (!code) { showToast('warning', '请输入渠道代码'); return; }
    if (!/^[A-Z0-9_]+$/.test(code)) { showToast('warning', '渠道代码只能包含字母、数字和下划线'); return; }
    if (code.length > 30) { showToast('warning', '渠道代码最大30字符'); return; }
    if (!serviceType) { showToast('warning', '请选择服务类型'); return; }
    if (countries.length === 0) { showToast('warning', '请至少选择一个配送国家'); return; }
    if (estDaysMin > 0 && estDaysMax > 0 && estDaysMin > estDaysMax) { showToast('warning', '最短时效不能大于最长时效'); return; }

    var channels = fw.channels || [];
    for (var i = 0; i < channels.length; i++) {
      if (mode === 'add' && channels[i].code === code) { showToast('warning', '该渠道代码已被使用，请更换'); return; }
      if (mode === 'edit' && channels[i].code === code && channels[i].id !== parseInt(editId)) { showToast('warning', '该渠道代码已被使用，请更换'); return; }
    }

    if (mode === 'add') {
      fw.channelAddItem(accountId, name, code, serviceType, countries, estDaysMin, estDaysMax, description, sortOrder, status);
    } else {
      fw.channelUpdateItem(parseInt(editId), accountId, name, code, serviceType, countries, estDaysMin, estDaysMax, description, sortOrder, status);
    }
    closeChannelDialog();
    fw.renderChannelTable();
    showToast('success', mode === 'add' ? '渠道已添加' : '保存成功');
  };

  // ---- 删除确认对话框 ----
  window.openChannelDeleteDialog = function(id) {
    ensureDialogs('channel', CHANNEL_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var ch = fw.findChannel(id);
      if (!ch) { showToast('error', '渠道不存在'); return; }
      document.getElementById('channelDeleteDialogTitle').textContent = '确认删除';
      document.getElementById('channelDeleteId').value = id;
      document.getElementById('channelDeleteIsBatch').value = 'false';
      document.getElementById('channelDeleteMsg').innerHTML = '<p>确定要删除渠道「<strong>' + ch.name + '</strong>」吗？</p><p style="margin-top:6px;color:hsl(var(--destructive));">删除后不可恢复。</p>';
      var overlay = document.getElementById('channelDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.openChannelBatchDeleteDialog = function(ids, blockedCount) {
    ensureDialogs('channel', CHANNEL_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      if (!ids || ids.length === 0) { showToast('info', '请先选择要删除的渠道'); return; }
      document.getElementById('channelDeleteDialogTitle').textContent = '批量删除';
      document.getElementById('channelDeleteId').value = JSON.stringify(ids);
      document.getElementById('channelDeleteIsBatch').value = 'true';
      var msg = '<p>选中了 <strong>' + (ids.length + blockedCount) + '</strong> 个渠道</p>';
      if (blockedCount > 0) {
        msg += '<p style="margin-top:6px;color:hsl(var(--destructive));">其中 <strong>' + blockedCount + '</strong> 个渠道存在关联订单，无法删除</p>';
      }
      msg += '<p style="margin-top:6px;">其余 <strong>' + ids.length + '</strong> 个渠道将删除</p>';
      msg += '<p style="margin-top:6px;color:hsl(var(--destructive));">删除后不可恢复。</p>';
      document.getElementById('channelDeleteMsg').innerHTML = msg;
      var overlay = document.getElementById('channelDeleteDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeChannelDeleteDialog = function() {
    var ov = document.getElementById('channelDeleteDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmChannelDelete = function() {
    var fw = getFW();
    if (!fw) return;
    var isBatch = document.getElementById('channelDeleteIsBatch').value === 'true';
    closeChannelDeleteDialog();
    if (isBatch) {
      var ids = JSON.parse(document.getElementById('channelDeleteId').value);
      fw.channelBatchDeleteItems(ids);
      showToast('success', '已删除 ' + ids.length + ' 个渠道');
    } else {
      var id = parseInt(document.getElementById('channelDeleteId').value);
      fw.channelDeleteItem(id);
      showToast('success', '渠道已删除');
    }
    fw.renderChannelTable();
  };

  // ---- 启用/禁用确认对话框 ----
  window.openChannelToggleDialog = function(id) {
    ensureDialogs('channel', CHANNEL_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var ch = fw.findChannel(id);
      if (!ch) { showToast('error', '渠道不存在'); return; }
      var newStatus = ch.status === 'enabled' ? 'disabled' : 'enabled';
      var actionText = newStatus === 'enabled' ? '启用' : '禁用';
      document.getElementById('channelToggleDialogTitle').textContent = '确认' + actionText;
      document.getElementById('channelToggleId').value = id;
      if (newStatus === 'disabled') {
        document.getElementById('channelToggleMsg').innerHTML = '<p>确定要禁用渠道「<strong>' + ch.name + '</strong>」吗？</p><p style="margin-top:6px;color:hsl(var(--muted-foreground));">禁用后，用户结算时将看不到该配送方式。</p>';
        document.getElementById('channelToggleConfirmBtn').textContent = '确定禁用';
      } else {
        document.getElementById('channelToggleMsg').innerHTML = '<p>确定要启用渠道「<strong>' + ch.name + '</strong>」吗？</p><p style="margin-top:6px;color:hsl(var(--muted-foreground));">启用后，该渠道将在结算页显示。</p>';
        document.getElementById('channelToggleConfirmBtn').textContent = '确定启用';
      }
      var overlay = document.getElementById('channelToggleDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeChannelToggleDialog = function() {
    var ov = document.getElementById('channelToggleDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmChannelToggle = function() {
    var fw = getFW();
    if (!fw) return;
    var id = parseInt(document.getElementById('channelToggleId').value);
    var ch = fw.findChannel(id);
    if (!ch) return;
    ch.status = ch.status === 'enabled' ? 'disabled' : 'enabled';
    closeChannelToggleDialog();
    fw.renderChannelTable();
    showToast('success', '已' + (ch.status === 'enabled' ? '启用' : '禁用') + '「' + ch.name + '」');
  };

  // ---- 复制渠道对话框 ----
  window.openChannelCopyDialog = function(id) {
    ensureDialogs('channel', CHANNEL_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var ch = fw.findChannel(id);
      if (!ch) { showToast('error', '渠道不存在'); return; }
      document.getElementById('channelCopyId').value = id;
      document.getElementById('channelCopyMsg').innerHTML = '<p>确定要复制渠道「<strong>' + ch.name + '</strong>」吗？</p><p style="margin-top:6px;color:hsl(var(--muted-foreground));">复制后请编辑渠道代码（新代码不能与已有代码重复）。</p><p style="margin-top:6px;color:hsl(var(--muted-foreground));">将复制：服务类型、配送国家、描述、排序</p>';
      var overlay = document.getElementById('channelCopyDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeChannelCopyDialog = function() {
    var ov = document.getElementById('channelCopyDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmChannelCopy = function() {
    var fw = getFW();
    if (!fw) return;
    var sourceId = parseInt(document.getElementById('channelCopyId').value);
    var newCh = fw.channelCopyItem(sourceId);
    closeChannelCopyDialog();
    if (newCh) {
      fw.renderChannelTable();
      showToast('success', '渠道已复制，请编辑新渠道的代码');
      // 自动打开编辑
      setTimeout(function() { window.openChannelDialog('edit', newCh.id); }, 300);
    } else {
      showToast('error', '复制失败：渠道不存在');
    }
  };

  // ==================== 渠道成本管理对话框 ====================
  var CC_DLG_URLS = [
    'parameters/channel_cost/channel_cost_form_dialog.html',
    'parameters/channel_cost/channel_cost_preview_dialog.html',
    'parameters/channel_cost/channel_cost_confirm_dialogs.html'
  ];

  // ---- 成本表单对话框 ----
  window.openCCDialog = function(mode, id) {
    ensureDialogs('channelCost', CC_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var title = document.getElementById('ccDialogTitle');
      var modeInp = document.getElementById('ccMode');
      var editId = document.getElementById('ccEditId');
      var provSel = document.getElementById('ccProvider');
      var chSel = document.getElementById('ccChannel');
      var readonlyDiv = document.getElementById('ccReadonlyInfo');
      var costNameInp = document.getElementById('ccCostName');
      var firstWeightInp = document.getElementById('ccFirstWeight');
      var firstPriceInp = document.getElementById('ccFirstWeightPrice');
      var addUnitInp = document.getElementById('ccAdditionalUnit');
      var addPriceInp = document.getElementById('ccAdditionalPrice');
      var remoteInp = document.getElementById('ccRemoteAreaFee');
      var hasInsSel = document.getElementById('ccHasInsurance');
      var insFeeInp = document.getElementById('ccInsuranceFee');
      var insFeeGrp = document.getElementById('ccInsuranceFeeGroup');
      var dimCoInp = document.getElementById('ccDimCoefficient');
      var descInp = document.getElementById('ccDescription');
      var statusSel = document.getElementById('ccStatus');

      modeInp.value = mode;
      editId.value = id || '';

      // 填充物流商下拉
      var providers = fw.providers || [];
      provSel.innerHTML = '<option value="">请选择物流商</option>';
      providers.forEach(function(p) { var o = document.createElement('option'); o.value = p.id; o.textContent = p.name; provSel.appendChild(o); });

      if (mode === 'add') {
        title.textContent = '新增成本';
        readonlyDiv.style.display = 'none';
        provSel.disabled = false;
        chSel.disabled = false;
        chSel.innerHTML = '<option value="">请先选择物流商</option>';
        // 重置表单
        costNameInp.value = '';
        firstWeightInp.value = '';
        firstPriceInp.value = '';
        addUnitInp.value = '';
        addPriceInp.value = '';
        remoteInp.value = '0';
        hasInsSel.value = '0';
        insFeeInp.value = '0';
        insFeeGrp.style.display = 'none';
        dimCoInp.value = '0';
        descInp.value = '';
        statusSel.value = '1';
        readonlyDiv.style.display = 'block';
        provSel.disabled = true;
        chSel.disabled = true;
        var cc = fw.findCost(id);
        if (!cc) { showToast('error', '成本配置不存在'); return; }
        var ch = fw.findChannel(cc.channelId);
        var ac = ch ? fw.findAccount(ch.accountId) : null;
        var p = ac ? fw.findProvider(ac.providerId) : null;
        document.getElementById('ccReadonlyProvider').textContent = p ? p.name : '—';
        document.getElementById('ccReadonlyChannel').textContent = ch ? ch.name : '—';
        document.getElementById('ccReadonlyServiceType').textContent = ch ? ch.serviceType : '—';
        costNameInp.value = cc.costName || '';
        firstWeightInp.value = cc.firstWeight || '';
        firstPriceInp.value = cc.firstWeightPrice != null ? cc.firstWeightPrice : '';
        addUnitInp.value = cc.additionalUnit || '';
        addPriceInp.value = cc.additionalPrice != null ? cc.additionalPrice : '';
        remoteInp.value = cc.remoteAreaFee || 0;
        hasInsSel.value = cc.hasShippingInsurance || 0;
        insFeeInp.value = cc.insuranceFee || 0;
        insFeeGrp.style.display = cc.hasShippingInsurance === 1 ? '' : 'none';
        dimCoInp.value = cc.dimCoefficient || 0;
        descInp.value = cc.description || '';
        statusSel.value = cc.isActive || 1;
      }
      var overlay = document.getElementById('ccDialogOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeCCDialog = function() {
    var ov = document.getElementById('ccDialogOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.onCCProviderChange = function() {
    var fw = getFW();
    if (!fw) return;
    var provId = parseInt(document.getElementById('ccProvider').value);
    var chSel = document.getElementById('ccChannel');
    var channels = fw.channels || [];
    var accounts = fw.accounts || [];
    chSel.innerHTML = '<option value="">请选择渠道</option>';
    if (!provId) return;
    var acctIds = accounts.filter(function(a) { return a.providerId === provId; }).map(function(a) { return a.id; });
    var costData = fw.costData || [];
    channels.forEach(function(ch) {
      if (acctIds.indexOf(ch.accountId) === -1) return;
      // 新增时只显示未配置成本的渠道（已有启用成本的排除）
      var mode = document.getElementById('ccMode').value;
      if (mode === 'add') {
        var existCost = costData.filter(function(c) { return c.channelId === ch.id && c.isActive === 1; });
        if (existCost.length > 0) return;
      }
      var o = document.createElement('option'); o.value = ch.id; o.textContent = ch.name; chSel.appendChild(o);
    });
  };

  window.onCCInsuranceChange = function() {
    var hasIns = parseInt(document.getElementById('ccHasInsurance').value);
    var grp = document.getElementById('ccInsuranceFeeGroup');
    if (grp) grp.style.display = hasIns === 1 ? '' : 'none';
  };

  window.submitCC = function() {
    var fw = getFW();
    if (!fw) return;
    var mode = document.getElementById('ccMode').value;
    var editId = mode === 'edit' ? parseInt(document.getElementById('ccEditId').value) : null;
    var costName = document.getElementById('ccCostName').value.trim();
    var firstWeight = parseInt(document.getElementById('ccFirstWeight').value) || 0;
    var firstPrice = parseFloat(document.getElementById('ccFirstWeightPrice').value) || 0;
    var addUnit = parseInt(document.getElementById('ccAdditionalUnit').value) || 0;
    var addPrice = parseFloat(document.getElementById('ccAdditionalPrice').value) || 0;
    var remoteFee = parseFloat(document.getElementById('ccRemoteAreaFee').value) || 0;
    var hasIns = parseInt(document.getElementById('ccHasInsurance').value);
    var insFee = parseFloat(document.getElementById('ccInsuranceFee').value) || 0;
    var dimCo = parseInt(document.getElementById('ccDimCoefficient').value) || 0;
    var desc = document.getElementById('ccDescription').value.trim();
    var status = parseInt(document.getElementById('ccStatus').value);

    // 校验
    if (!costName) { showToast('warning', '请输入成本名称'); return; }
    if (costName.length > 100) { showToast('warning', '成本名称最大100字符'); return; }
    if (!firstWeight || firstWeight <= 0) { showToast('warning', '首重必须大于0'); return; }
    if (firstWeight > 99999) { showToast('warning', '首重最大99999g'); return; }
    if (firstPrice < 0) { showToast('warning', '首重价格不能小于0'); return; }
    if (!addUnit || addUnit <= 0) { showToast('warning', '续重单位必须大于0'); return; }
    if (addPrice < 0) { showToast('warning', '续重单价不能小于0'); return; }
    if (remoteFee < 0) { showToast('warning', '偏远附加费不能小于0'); return; }
    if (hasIns === 1 && insFee <= 0) { showToast('warning', '开启运输保障险后，保险费用必填且大于0'); return; }
    if (dimCo < 0) { showToast('warning', 'DIM系数不能小于0'); return; }

    if (mode === 'add') {
      var chId = parseInt(document.getElementById('ccChannel').value);
      if (!chId) { showToast('warning', '请选择渠道'); return; }
      // 检查是否已有启用成本
      var costData = fw.costData || [];
      var existing = costData.filter(function(c) { return c.channelId === chId && c.isActive === 1; });
      if (status === 1 && existing.length > 0) { showToast('warning', '该渠道已存在启用的成本配置，请先禁用或删除'); return; }
      fw.ccAddItem(chId, costName, firstWeight, firstPrice, addUnit, addPrice, remoteFee, hasIns, insFee, dimCo, desc, status);
    } else {
      var cc = fw.findCost(editId);
      if (!cc) { showToast('error', '成本配置不存在'); return; }
      if (status === 1) {
        var costData = fw.costData || [];
        var dup = costData.filter(function(c) { return c.channelId === cc.channelId && c.isActive === 1 && c.id !== editId; });
        if (dup.length > 0) { showToast('warning', '该渠道已存在启用的成本配置，请先禁用或删除'); return; }
      }
      fw.ccUpdateItem(editId, cc.channelId, costName, firstWeight, firstPrice, addUnit, addPrice, remoteFee, hasIns, insFee, dimCo, desc, status);
    }
    closeCCDialog();
    fw.renderCCTable();
    showToast('success', mode === 'add' ? '成本已添加' : '保存成功');
  };

  // ---- 删除确认对话框 ----
  window.openCCDeleteDialog = function(id) {
    ensureDialogs('channelCost', CC_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var cc = fw.findCost(id);
      if (!cc) { showToast('error', '成本配置不存在'); return; }
      document.getElementById('ccDeleteTitle').textContent = '确认删除';
      document.getElementById('ccDeleteId').value = id;
      document.getElementById('ccDeleteIsBatch').value = 'false';
      document.getElementById('ccDeleteMsg').innerHTML = '<p>确定要删除成本「<strong>' + cc.costName + '</strong>」吗？</p><p style="margin-top:6px;color:hsl(var(--destructive));">删除后不可恢复。</p>';
      document.getElementById('ccDeleteConfirmBtn').textContent = '确定删除';
      var overlay = document.getElementById('ccDeleteOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.openCCBatchDeleteDialog = function(ids, blockedCount) {
    ensureDialogs('channelCost', CC_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      if (!ids || ids.length === 0) { showToast('info', '请先选择要删除的成本配置'); return; }
      document.getElementById('ccDeleteTitle').textContent = '批量删除';
      document.getElementById('ccDeleteId').value = JSON.stringify(ids);
      document.getElementById('ccDeleteIsBatch').value = 'true';
      var msg = '<p>选中了 <strong>' + (ids.length + blockedCount) + '</strong> 个成本配置</p>';
      if (blockedCount > 0) { msg += '<p style="margin-top:6px;color:hsl(var(--destructive));">其中 <strong>' + blockedCount + '</strong> 个存在关联订单，无法删除</p>'; }
      msg += '<p style="margin-top:6px;">其余 <strong>' + ids.length + '</strong> 个将删除</p>';
      msg += '<p style="margin-top:6px;color:hsl(var(--destructive));">删除后不可恢复。</p>';
      document.getElementById('ccDeleteMsg').innerHTML = msg;
      document.getElementById('ccDeleteConfirmBtn').textContent = '确定删除';
      var overlay = document.getElementById('ccDeleteOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeCCDeleteDialog = function() {
    var ov = document.getElementById('ccDeleteOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmCCDelete = function() {
    var fw = getFW();
    if (!fw) return;
    var isBatch = document.getElementById('ccDeleteIsBatch').value === 'true';
    closeCCDeleteDialog();
    if (isBatch) {
      var ids = JSON.parse(document.getElementById('ccDeleteId').value);
      fw.ccBatchDeleteItems(ids);
      showToast('success', '已删除 ' + ids.length + ' 个成本配置');
    } else {
      var id = parseInt(document.getElementById('ccDeleteId').value);
      fw.ccDeleteItem(id);
      showToast('success', '删除成功');
    }
    fw.renderCCTable();
  };

  // ---- 启用/禁用确认对话框 ----
  window.openCCToggleDialog = function(id) {
    ensureDialogs('channelCost', CC_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var cc = fw.findCost(id);
      if (!cc) { showToast('error', '成本配置不存在'); return; }
      var isActive = cc.isActive === 1;
      var action = isActive ? 'disable' : 'enable';
      document.getElementById('ccToggleId').value = id;
      document.getElementById('ccToggleAction').value = action;
      if (isActive) {
        document.getElementById('ccToggleTitle').textContent = '确认禁用';
        document.getElementById('ccToggleMsg').innerHTML = '<p>确定要禁用成本「<strong>' + cc.costName + '</strong>」吗？</p><p style="margin-top:6px;">禁用后，该成本在结算页不生效。</p>';
        document.getElementById('ccToggleConfirmBtn').textContent = '确定禁用';
        document.getElementById('ccToggleConfirmBtn').className = 'btn btn-destructive';
      } else {
        // 启用校验：该渠道是否已有其他启用成本
        var costData = fw.costData || [];
        var dup = costData.filter(function(c) { return c.channelId === cc.channelId && c.isActive === 1 && c.id !== id; });
        if (dup.length > 0) {
          showToast('warning', '该渠道已存在启用的成本配置，请先禁用或删除');
          return;
        }
        document.getElementById('ccToggleTitle').textContent = '确认启用';
        document.getElementById('ccToggleMsg').innerHTML = '<p>确定要启用成本「<strong>' + cc.costName + '</strong>」吗？</p>';
        document.getElementById('ccToggleConfirmBtn').textContent = '确定启用';
        document.getElementById('ccToggleConfirmBtn').className = 'btn btn-primary';
      }
      var overlay = document.getElementById('ccToggleOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeCCToggleDialog = function() {
    var ov = document.getElementById('ccToggleOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmCCToggle = function() {
    var fw = getFW();
    if (!fw) return;
    var id = parseInt(document.getElementById('ccToggleId').value);
    var action = document.getElementById('ccToggleAction').value;
    var cc = fw.findCost(id);
    if (!cc) return;
    closeCCToggleDialog();
    cc.isActive = action === 'enable' ? 1 : 0;
    fw.renderCCTable();
    showToast('success', action === 'enable' ? '已启用' : '已禁用');
  };

  // ---- 复制确认对话框 ----
  window.openCCCopyDialog = function(id) {
    ensureDialogs('channelCost', CC_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var cc = fw.findCost(id);
      if (!cc) { showToast('error', '成本配置不存在'); return; }
      document.getElementById('ccCopyId').value = id;
      document.getElementById('ccCopyMsg').innerHTML = '<p>确定要复制成本「<strong>' + cc.costName + '</strong>」吗？</p><p style="margin-top:6px;">复制后将生成新配置，名称自动添加 _Copy 后缀。</p>';
      var overlay = document.getElementById('ccCopyOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeCCCopyDialog = function() {
    var ov = document.getElementById('ccCopyOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.confirmCCCopy = function() {
    var fw = getFW();
    if (!fw) return;
    var id = parseInt(document.getElementById('ccCopyId').value);
    var newCc = fw.ccCopyItem(id);
    closeCCCopyDialog();
    if (newCc) {
      fw.renderCCTable();
      showToast('success', '成本配置已复制，请编辑新配置');
      setTimeout(function() { window.openCCDialog('edit', newCc.id); }, 300);
    } else {
      showToast('error', '复制失败');
    }
  };

  // ---- 成本预览对话框 ----
  window.openCCPreviewDialog = function(id) {
    ensureDialogs('channelCost', CC_DLG_URLS, function() {
      var fw = getFW();
      if (!fw) return;
      var cc = fw.findCost(id);
      if (!cc) { showToast('error', '成本配置不存在'); return; }
      var ch = fw.findChannel(cc.channelId);
      if (!ch) { showToast('error', '关联渠道不存在'); return; }

      document.getElementById('ccPreviewId').value = id;

      // 填充国家下拉（使用渠道已配置的国家）
      var countries = ch.countries || [];
      var countrySel = document.getElementById('ccPreviewCountry');
      countrySel.innerHTML = '<option value="">请选择国家</option>';
      countries.forEach(function(c) { var o = document.createElement('option'); o.value = c; o.textContent = c; countrySel.appendChild(o); });

      // 重置表单
      document.getElementById('ccPreviewWeight').value = '';
      document.getElementById('ccPreviewRemote').value = '0';
      document.getElementById('ccPreviewInsurance').value = '1';
      // DIM 系数相关
      var dimGroup = document.getElementById('ccPreviewDimGroup');
      if (cc.dimCoefficient > 0) {
        if (dimGroup) dimGroup.style.display = 'block';
        document.getElementById('ccPreviewPackLen').value = '';
        document.getElementById('ccPreviewPackWid').value = '';
        document.getElementById('ccPreviewPackHgt').value = '';
      } else {
        if (dimGroup) dimGroup.style.display = 'none';
      }

      // 显示基本信息
      var ac = fw.findAccount(ch.accountId);
      var p = ac ? fw.findProvider(ac.providerId) : null;
      document.getElementById('ccPreviewInfo').innerHTML =
        '<strong>成本名称：</strong>' + cc.costName + '<br>' +
        '<strong>渠道：</strong>' + (p ? p.name + ' — ' : '') + ch.name + '<br>' +
        '<strong>服务类型：</strong>' + ch.serviceType + ' | <strong>首重：</strong>' + cc.firstWeight + 'g/$' + cc.firstWeightPrice.toFixed(2) + ' | <strong>续重：</strong>' + cc.additionalUnit + 'g/$' + cc.additionalPrice.toFixed(2) + (cc.dimCoefficient > 0 ? ' | <strong>DIM系数：</strong>' + cc.dimCoefficient : '');

      document.getElementById('ccPreviewResult').innerHTML = '<div style="text-align:center;color:hsl(var(--muted-foreground));">请输入商品重量查看运费预览</div>';

      var overlay = document.getElementById('ccPreviewOverlay');
      if (overlay) overlay.style.display = 'flex';
    });
  };

  window.closeCCPreviewDialog = function() {
    var ov = document.getElementById('ccPreviewOverlay');
    if (ov) ov.style.display = 'none';
  };

  window.calcCCPreview = function() {
    var fw = getFW();
    if (!fw) return;
    var id = parseInt(document.getElementById('ccPreviewId').value);
    var cc = fw.findCost(id);
    if (!cc) return;
    var weight = parseInt(document.getElementById('ccPreviewWeight').value) || 0;
    var isRemote = parseInt(document.getElementById('ccPreviewRemote').value);
    var hasIns = parseInt(document.getElementById('ccPreviewInsurance').value);
    var country = document.getElementById('ccPreviewCountry').value;
    var resultDiv = document.getElementById('ccPreviewResult');
    if (!weight || weight <= 0) { resultDiv.innerHTML = '<div style="text-align:center;color:hsl(var(--muted-foreground));">请输入有效的商品重量</div>'; return; }
    if (!country) { resultDiv.innerHTML = '<div style="text-align:center;color:hsl(var(--muted-foreground));">请选择收货国家</div>'; return; }

    // 体积重计算
    var chargeableWeight = weight;
    var volumetricWeight = 0;
    var showVolumetric = false;
    if (cc.dimCoefficient > 0) {
      var packLen = parseFloat(document.getElementById('ccPreviewPackLen').value) || 0;
      var packWid = parseFloat(document.getElementById('ccPreviewPackWid').value) || 0;
      var packHgt = parseFloat(document.getElementById('ccPreviewPackHgt').value) || 0;
      if (packLen > 0 && packWid > 0 && packHgt > 0) {
        volumetricWeight = Math.ceil((packLen * packWid * packHgt) / cc.dimCoefficient * 1000);
        chargeableWeight = Math.max(weight, volumetricWeight);
        showVolumetric = true;
      }
    }

    var extraWeight = Math.max(0, chargeableWeight - cc.firstWeight);
    var additionalUnits = Math.ceil(extraWeight / cc.additionalUnit);
    var baseFee = cc.firstWeightPrice + additionalUnits * cc.additionalPrice;
    var remoteFee = isRemote === 1 ? cc.remoteAreaFee : 0;
    var insFee = (hasIns === 1 && cc.hasShippingInsurance === 1) ? cc.insuranceFee : 0;
    var totalFee = baseFee + remoteFee + insFee;

    var details = '<div style="font-size:14px;font-weight:600;margin-bottom:10px;color:hsl(var(--foreground));">费用明细</div>';
    details += '<table style="width:100%;font-size:13px;border-collapse:collapse;">';
    if (showVolumetric) {
      details += '<tr><td style="padding:4px 0;">├── 体积重（' + packLen.toFixed(1) + '×' + packWid.toFixed(1) + '×' + packHgt.toFixed(1) + '÷' + cc.dimCoefficient + '×1000）</td><td style="text-align:right;font-weight:500;">' + volumetricWeight + 'g</td></tr>';
      details += '<tr><td style="padding:4px 0;">├── 计费重（MAX(' + weight + ', ' + volumetricWeight + ')）</td><td style="text-align:right;font-weight:500;">' + chargeableWeight + 'g</td></tr>';
    }
    details += '<tr><td style="padding:4px 0;">├── 首重（' + cc.firstWeight + 'g以内）</td><td style="text-align:right;font-weight:500;">$' + cc.firstWeightPrice.toFixed(2) + '</td></tr>';
    if (extraWeight > 0) {
      details += '<tr><td style="padding:4px 0;">├── 续重（' + chargeableWeight + '-' + cc.firstWeight + '=' + extraWeight + 'g，' + additionalUnits + '单位×$' + cc.additionalPrice.toFixed(2) + '）</td><td style="text-align:right;font-weight:500;">$' + (additionalUnits * cc.additionalPrice).toFixed(2) + '</td></tr>';
    }
    if (isRemote && remoteFee > 0) {
      details += '<tr><td style="padding:4px 0;">├── 偏远附加费</td><td style="text-align:right;font-weight:500;">$' + remoteFee.toFixed(2) + '</td></tr>';
    }
    if (hasIns && insFee > 0) {
      details += '<tr><td style="padding:4px 0;">└── 运输保障险</td><td style="text-align:right;font-weight:500;">$' + insFee.toFixed(2) + '</td></tr>';
    }
    details += '<tr><td colspan="2" style="padding:8px 0 0;border-top:1px dashed hsl(var(--border));font-weight:700;font-size:15px;color:hsl(var(--primary));">合计运费：<span style="float:right;">$' + totalFee.toFixed(2) + '</span></td></tr>';
    details += '</table>';
    resultDiv.innerHTML = details;
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
