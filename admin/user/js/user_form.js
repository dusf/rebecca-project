(function (root) {
  'use strict';

  const ACCOUNT_LABELS = {
    registered: '已注册',
    pending: '待激活',
    disabled: '已禁用'
  };
  const MARKETING_LABELS = {
    subscribed: '已订阅',
    unsubscribed: '已退订',
    not_subscribed: '未订阅',
    pending: '待确认',
    invalid: '无效邮箱'
  };
  const SOURCE_LABELS = {
    admin: '后台手动添加',
    storefront: '店铺前台',
    newsletter: '邮件订阅表单',
    shopify_api: 'Shopify API',
    shopify_csv: 'Shopify CSV',
    csv: 'CSV 导入',
    registration: '注册页面',
    checkout: '结账页面',
    footer: '页脚订阅',
    customer_service: '客服确认',
    other: '其他'
  };
  const LANGUAGE_OPTIONS = [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-TW', label: '繁體中文' },
    { value: 'en-US', label: 'English' },
    { value: 'ja-JP', label: '日本語' }
  ];
  const COUNTRY_OPTIONS = [
    { value: '+86', label: '中国大陆 +86' },
    { value: '+852', label: '中国香港 +852' },
    { value: '+853', label: '中国澳门 +853' },
    { value: '+886', label: '中国台湾 +886' },
    { value: '+1', label: '美国/加拿大 +1' },
    { value: '+44', label: '英国 +44' },
    { value: '+81', label: '日本 +81' },
    { value: '+65', label: '新加坡 +65' },
    { value: '+61', label: '澳大利亚 +61' }
  ];
  const CONSENT_OPTIONS = [
    { value: 'none', label: '请选择同意来源' },
    { value: 'registration', label: '注册页面' },
    { value: 'checkout', label: '结账页面' },
    { value: 'footer', label: '页脚订阅' },
    { value: 'customer_service', label: '客服确认' },
    { value: 'newsletter', label: '邮件订阅表单' },
    { value: 'shopify_api', label: 'Shopify API' },
    { value: 'shopify_csv', label: 'Shopify CSV' },
    { value: 'admin', label: '后台手动记录' },
    { value: 'other', label: '其他' }
  ];

  const params = new URLSearchParams(root.location.search);
  const state = {
    mode: params.get('mode') === 'edit' ? 'edit' : 'add',
    userId: params.get('id') || '',
    user: null,
    tags: [],
    marketing: false,
    marketingTouched: false,
    saving: false,
    countryCode: '+86',
    phone: ''
  };
  const elements = {};
  const comboboxControllers = {};
  let consentDateController = null;

  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function readText(id) {
    const input = root.document.getElementById(id);
    return input ? input.value.trim() : '';
  }

  function fullName(user) {
    return [user && user.firstName, user && user.lastName].filter(Boolean).join(' ') || '未填写姓名';
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(Number(value) || 0);
  }

  function sourceLabel(source) {
    return SOURCE_LABELS[source] || source || '未知';
  }

  function statusBadge(status, kind) {
    const labels = kind === 'marketing' ? MARKETING_LABELS : ACCOUNT_LABELS;
    let tone = '';
    if (status === 'registered' || status === 'subscribed') tone = ' um-badge-success';
    else if (status === 'disabled' || status === 'invalid') tone = ' um-badge-danger';
    else if (status === 'pending' || status === 'unsubscribed') tone = ' um-badge-warning';
    return '<span class="um-badge' + tone + '">' + escapeHtml(labels[status] || status || '—') + '</span>';
  }

  function showToast(message, tone) {
    const region = elements.toastRegion;
    if (!region) return;
    const toast = root.document.createElement('div');
    toast.className = 'um-toast um-toast-' + (tone || 'success');
    toast.textContent = message;
    region.appendChild(toast);
    root.setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3200);
  }

  function navigate(path) {
    try {
      if (root.parent && typeof root.parent.loadAdminPage === 'function') {
        root.parent.loadAdminPage('users', path);
        return true;
      }
    } catch (error) {
      showToast('无法访问父页面导航，将在当前页面打开。', 'error');
    }
    return false;
  }

  function returnToList() {
    if (!navigate('user/users.html')) root.location.href = 'users.html';
  }

  function openExistingUser(userId) {
    const path = 'user/user_form.html?mode=edit&id=' + encodeURIComponent(userId);
    if (!navigate(path)) root.location.href = 'user_form.html?mode=edit&id=' + encodeURIComponent(userId);
  }

  function comboboxMarkup(name, value) {
    return '<div class="um-combobox" data-um-combobox="' + escapeHtml(name) +
      '" data-value="' + escapeHtml(value || '') + '">' +
      '<button class="um-control um-combobox-trigger" type="button" aria-haspopup="listbox" aria-expanded="false"></button>' +
      '<div class="um-combobox-popover" role="listbox" hidden>' +
      '<div class="um-combobox-search-wrap">' +
      '<input class="um-combobox-search" type="text" placeholder="输入关键词搜索" aria-label="搜索选项">' +
      '</div><div class="um-combobox-options"></div></div></div>';
  }

  function fieldMarkup(name, label, control, options) {
    const settings = options || {};
    return '<div class="um-field' + (settings.full ? ' um-field-full' : '') + '" data-field="' +
      escapeHtml(name) + '">' +
      '<label class="um-field-label"' + (settings.forId ? ' for="' + escapeHtml(settings.forId) + '"' : '') + '>' +
      escapeHtml(label) + (settings.required ? ' <span class="um-required" aria-hidden="true">*</span>' : '') +
      '</label>' + control +
      (settings.help ? '<div class="um-field-help">' + escapeHtml(settings.help) + '</div>' : '') +
      '<div class="um-field-error" id="' + escapeHtml(name) + 'Error"></div></div>';
  }

  function textInput(id, value, attrs) {
    return '<input class="um-text-control" id="' + escapeHtml(id) + '" type="text" value="' +
      escapeHtml(value || '') + '" ' + (attrs || '') + '>';
  }

  function cardMarkup(title, body, description) {
    return '<section class="um-form-card"><div class="um-section-heading"><div><h2>' +
      escapeHtml(title) + '</h2>' +
      (description ? '<p>' + escapeHtml(description) + '</p>' : '') +
      '</div></div>' + body + '</section>';
  }

  function splitPhone(phone) {
    const value = String(phone || '').trim();
    const sorted = COUNTRY_OPTIONS.map(function (option) { return option.value; })
      .sort(function (a, b) { return b.length - a.length; });
    const code = sorted.find(function (item) {
      return value.indexOf(item) === 0;
    });
    return {
      countryCode: code || '+86',
      phone: code ? value.slice(code.length).trim() : value
    };
  }

  function latestSubscribedConsent(user) {
    const history = Array.isArray(user && user.consentHistory) ? user.consentHistory : [];
    for (let index = history.length - 1; index >= 0; index -= 1) {
      if (history[index].status === 'subscribed') return history[index];
    }
    return null;
  }

  function consentOptions(currentSource) {
    const options = CONSENT_OPTIONS.slice();
    if (currentSource && !options.some(function (option) { return option.value === currentSource; })) {
      options.push({ value: currentSource, label: sourceLabel(currentSource) });
    }
    return options;
  }

  function renderHeader() {
    const isEdit = state.mode === 'edit';
    elements.header.innerHTML =
      '<div><button class="um-back-button" id="userBackButton" type="button">← 返回用户列表</button>' +
      '<h1 class="um-page-title">' + (isEdit ? '编辑用户' : '添加用户') + '</h1>' +
      '<p class="um-page-subtitle">' +
      (isEdit ? '更新用户基本资料和营销授权，不会改变其登录身份。' : '创建统一用户档案，后续由用户完成可信验证激活账号。') +
      '</p></div>' +
      '<div class="um-header-actions"><button class="um-button um-button-secondary" id="userCancelButton" type="button">取消</button>' +
      '<button class="um-button um-button-primary" id="userSaveButton" type="submit" form="userForm">' +
      (isEdit ? '保存更改' : '保存用户') + '</button></div>';
  }

  function basicCard() {
    const user = state.user || {};
    const phoneParts = splitPhone(user.phone);
    state.countryCode = phoneParts.countryCode;
    state.phone = phoneParts.phone;
    const body = '<div class="um-form-grid">' +
      fieldMarkup('userEmail', '邮箱', textInput('userEmail', user.email, 'inputmode="email" autocomplete="email"'), {
        forId: 'userEmail', required: true, full: true, help: '邮箱会标准化并作为统一用户档案的唯一匹配键。'
      }) +
      fieldMarkup('firstName', '名字', textInput('firstName', user.firstName, 'autocomplete="given-name"'), { forId: 'firstName' }) +
      fieldMarkup('lastName', '姓氏', textInput('lastName', user.lastName, 'autocomplete="family-name"'), { forId: 'lastName' }) +
      fieldMarkup('countryCode', '国家/地区代码', '<div id="countryCodeHost">' +
        comboboxMarkup('countryCode', phoneParts.countryCode) + '</div>') +
      fieldMarkup('phone', '手机号', textInput('phone', phoneParts.phone, 'inputmode="tel" autocomplete="tel-national"'), {
        forId: 'phone'
      }) +
      fieldMarkup('preferredLanguage', '首选语言', '<div id="preferredLanguageHost">' +
        comboboxMarkup('preferredLanguage', user.preferredLanguage || 'zh-CN') + '</div>', { full: true }) +
      '<div class="um-duplicate-card um-field-full" id="duplicateUserCard" hidden></div>' +
      '</div>';
    return cardMarkup('基本资料', body, '后台可维护联系资料，但不能人工把账号设为已注册。');
  }

  function dateControlMarkup(value) {
    return '<div class="um-date-control um-datetime-control" id="consentedAtControl" data-value="' +
      escapeHtml(value || '') + '">' +
      '<button class="um-control um-date-trigger is-placeholder" id="consentedAtTrigger" type="button" ' +
      'aria-haspopup="dialog" aria-expanded="false">请选择同意时间</button>' +
      '<div class="um-date-popover um-datetime-popover" id="consentedAtPopover" role="dialog" aria-label="选择同意日期和时间" hidden>' +
      '<div class="um-date-header"><button type="button" data-date-action="previous" aria-label="上个月">‹</button>' +
      '<strong id="consentedAtMonthLabel"></strong>' +
      '<button type="button" data-date-action="next" aria-label="下个月">›</button></div>' +
      '<div class="um-date-weekdays" aria-hidden="true"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>' +
      '<div class="um-date-grid" id="consentedAtDateGrid"></div>' +
      '<div class="um-time-editor"><label>时间</label><div><input class="um-text-control" id="consentHour" type="text" inputmode="numeric" maxlength="2" aria-label="小时">' +
      '<span>:</span><input class="um-text-control" id="consentMinute" type="text" inputmode="numeric" maxlength="2" aria-label="分钟"></div></div>' +
      '<div class="um-date-footer"><button type="button" data-date-action="now">现在</button>' +
      '<span></span><button type="button" data-date-action="clear">清除</button>' +
      '<button type="button" data-date-action="confirm">确定</button></div>' +
      '</div></div>';
  }

  function marketingCard() {
    const current = state.user || {};
    const latestConsent = latestSubscribedConsent(current);
    state.marketing = current.marketingStatus === 'subscribed';
    state.marketingTouched = false;
    const consentSource = latestConsent ? latestConsent.source : 'none';
    const consentedAt = latestConsent ? latestConsent.consentedAt : '';
    const consentNote = latestConsent ? latestConsent.note : '';
    const body =
      '<div class="um-switch-row"><div><div class="um-switch-title">接收邮件营销</div>' +
      '<p>仅在已取得用户明确授权时开启。订阅状态与账号激活状态彼此独立。</p></div>' +
      '<button class="um-switch" id="marketingSwitch" type="button" role="switch" aria-checked="' +
      String(state.marketing) + '" aria-label="接收邮件营销"></button></div>' +
      '<div class="um-consent-fields" id="marketingConsentFields"' + (state.marketing ? '' : ' hidden') + '>' +
      '<div class="um-guidance um-compliance-guidance"><strong>合规提示：</strong>请记录可核验的同意来源和时间。后台代录不应替代用户主动授权。</div>' +
      '<div class="um-form-grid">' +
      fieldMarkup('consentSource', '同意来源', '<div id="consentSourceHost">' +
        comboboxMarkup('consentSource', consentSource) + '</div>', { required: true }) +
      fieldMarkup('consentedAt', '同意时间', dateControlMarkup(consentedAt), { required: true }) +
      fieldMarkup('consentNote', '授权备注', '<textarea class="um-text-control" id="consentNote" maxlength="500" placeholder="可填写授权场景、凭证或补充说明">' +
        escapeHtml(consentNote) + '</textarea>', { forId: 'consentNote', full: true }) +
      '</div></div>';
    return cardMarkup('邮件营销', body, '营销同意会记录进授权历史，退订不会删除历史记录。');
  }

  function tagsAndNoteCard() {
    const user = state.user || {};
    state.tags = Array.isArray(user.tags) ? user.tags.slice() : [];
    const body = '<div class="um-form-grid">' +
      fieldMarkup('tags', '标签', '<div class="um-tag-editor"><div class="um-tag-input-row">' +
        '<input class="um-text-control" id="tagInput" type="text" maxlength="40" placeholder="输入标签后添加">' +
        '<button class="um-button um-button-secondary" id="addTagButton" type="button">添加</button></div>' +
        '<div class="um-tag-list" id="userTagList"></div></div>', {
        full: true, help: '标签仅供后台筛选和运营管理使用。'
      }) +
      fieldMarkup('internalNote', '内部备注', '<textarea class="um-text-control" id="internalNote" maxlength="2000" placeholder="仅后台可见">' +
        escapeHtml(user.note || '') + '</textarea>', { forId: 'internalNote', full: true }) +
      '</div>';
    return cardMarkup('标签与备注', body);
  }

  function providerType(provider) {
    return typeof provider === 'string' ? provider : (provider && provider.type) || 'unknown';
  }

  function providerLabel(provider) {
    const type = providerType(provider);
    const labels = {
      password: '邮箱与密码',
      email: '邮箱验证',
      google: 'Google',
      facebook: 'Facebook',
      shop: 'Shop'
    };
    return labels[type] || type;
  }

  function identityCard() {
    const providers = Array.isArray(state.user.authProviders) ? state.user.authProviders : [];
    const content = providers.length ? providers.map(function (provider) {
      const detail = typeof provider === 'object' && provider.subject ? provider.subject : '';
      return '<div class="um-readonly-row"><div><strong>' + escapeHtml(providerLabel(provider)) +
        '</strong><span>' + escapeHtml(detail || '已绑定') + '</span></div><span class="um-badge">只读</span></div>';
    }).join('') : '<div class="um-empty-inline">尚未绑定登录身份；用户完成可信验证后会自动写入。</div>';
    return cardMarkup('登录身份', '<div class="um-readonly-list">' + content + '</div>',
      '身份绑定只能由可信邮箱或社交验证流程更新，后台不可人工添加。');
  }

  function shopifyCard() {
    const profiles = Array.isArray(state.user.externalProfiles) ? state.user.externalProfiles : [];
    const content = profiles.length ? profiles.map(function (profile) {
      const store = profile.store || {};
      return '<div class="um-readonly-row"><div><strong>' + escapeHtml(store.name || sourceLabel(profile.source)) +
        '</strong><span>' + escapeHtml(store.domain || profile.externalId || 'Shopify 客户') +
        '</span><small>' + escapeHtml(profile.externalId || '') + '</small></div><span class="um-badge">只读</span></div>';
    }).join('') : '<div class="um-empty-inline">暂无 Shopify 客户绑定。</div>';
    return cardMarkup('Shopify 绑定', '<div class="um-readonly-list">' + content + '</div>',
      'Shopify 客户标识和店铺关系由导入与同步流程维护。');
  }

  function consentHistoryCard() {
    const history = Array.isArray(state.user.consentHistory) ? state.user.consentHistory.slice().reverse() : [];
    const content = history.length ? '<div class="um-history-list">' + history.map(function (entry) {
      return '<div class="um-history-entry"><div>' + statusBadge(entry.status, 'marketing') +
        '<strong>' + escapeHtml(sourceLabel(entry.source)) + '</strong><time>' + escapeHtml(formatDate(entry.consentedAt)) +
        '</time></div>' + (entry.note ? '<p>' + escapeHtml(entry.note) + '</p>' : '') + '</div>';
    }).join('') + '</div>' : '<div class="um-empty-inline">暂无营销授权记录。</div>';
    return cardMarkup('营销授权历史', content, '历史记录只读，用于保留订阅、退订和导入状态的审计轨迹。');
  }

  function renderMain() {
    let markup = basicCard() + marketingCard() + tagsAndNoteCard();
    if (state.mode === 'edit') markup += identityCard() + shopifyCard() + consentHistoryCard();
    elements.main.innerHTML = markup;
    mountFormControls();
    renderTags();
  }

  function summaryRow(label, value) {
    return '<div class="um-summary-row"><dt>' + escapeHtml(label) + '</dt><dd>' + value + '</dd></div>';
  }

  function renderSidebar() {
    if (state.mode === 'add') {
      elements.sidebar.innerHTML = cardMarkup('账号状态',
        '<div class="um-sidebar-status">' + statusBadge('pending', 'account') +
        '<p>保存后只会创建待激活用户档案。用户首次完成邮箱或快捷登录验证后，系统才会将账号升级为已注册。</p></div>') +
        cardMarkup('创建来源', '<dl class="um-summary-list">' +
          summaryRow('来源', escapeHtml(sourceLabel('admin'))) +
          summaryRow('登录身份', '<span class="um-muted">保存时不创建</span>') +
          '</dl>');
      return;
    }
    const user = state.user;
    const statusAction = user.accountStatus === 'disabled' ? 'restore' : 'disabled';
    elements.sidebar.innerHTML = cardMarkup('状态摘要',
      '<div class="um-sidebar-status">' + statusBadge(user.accountStatus, 'account') +
      '<div>' + statusBadge(user.marketingStatus, 'marketing') + '</div>' +
      '<button class="um-button ' + (statusAction === 'disabled' ? 'um-button-danger um-button-secondary' : 'um-button-secondary') +
      '" id="accountStatusButton" type="button" data-status-action="' + statusAction + '">' +
      (statusAction === 'disabled' ? '禁用账号' : '恢复账号') + '</button>' +
      '<p>后台只能禁用账号或恢复禁用前状态，不能人工将账号设为已注册。</p></div>') +
      cardMarkup('用户摘要', '<dl class="um-summary-list">' +
        summaryRow('姓名', escapeHtml(fullName(user))) +
        summaryRow('用户 ID', '<code>' + escapeHtml(user.id) + '</code>') +
        summaryRow('来源', escapeHtml(sourceLabel(user.source))) +
        summaryRow('创建时间', escapeHtml(formatDate(user.createdAt))) +
        summaryRow('最近登录', escapeHtml(user.lastLoginAt ? formatDate(user.lastLoginAt) : '从未登录')) +
        summaryRow('订单数', escapeHtml(user.orderCount || 0)) +
        summaryRow('累计消费', escapeHtml(formatMoney(user.totalSpent))) +
        '</dl>');
  }

  function renderGuidance() {
    elements.guidance.innerHTML = state.mode === 'add'
      ? '<strong>重要：</strong>后台添加只创建待激活档案，不创建密码，也不会发送登录邀请。若邮箱已存在，请进入原档案编辑，避免重复用户。'
      : '<strong>身份安全：</strong>邮箱或快捷登录验证是账号升级为已注册的唯一可信路径。此页只能维护资料、营销同意以及禁用或恢复账号。';
  }

  function renderTags() {
    const host = root.document.getElementById('userTagList');
    if (!host) return;
    host.innerHTML = state.tags.length ? state.tags.map(function (tag, index) {
      return '<span class="um-tag"><span>' + escapeHtml(tag) + '</span>' +
        '<button class="um-tag-remove" type="button" data-remove-tag="' + index +
        '" aria-label="移除标签 ' + escapeHtml(tag) + '">×</button></span>';
    }).join('') : '<span class="um-muted">暂未添加标签</span>';
  }

  function mountCombobox(name, options) {
    const element = root.document.querySelector('[data-um-combobox="' + name + '"]');
    if (!element) return;
    comboboxControllers[name] = root.UserComponents.mountCombobox(element, options);
  }

  function getComboboxValue(name) {
    const controller = comboboxControllers[name];
    return controller ? controller.getValue() : '';
  }

  function mountFormControls() {
    mountCombobox('countryCode', COUNTRY_OPTIONS);
    mountCombobox('preferredLanguage', LANGUAGE_OPTIONS);
    const latestConsent = latestSubscribedConsent(state.user);
    mountCombobox('consentSource', consentOptions(latestConsent && latestConsent.source));
    consentDateController = createDateTimeController(root.document.getElementById('consentedAtControl'));
    syncMarketingVisibility();
  }

  function createDateTimeController(control) {
    if (!control) return null;
    const trigger = control.querySelector('.um-date-trigger');
    const popover = control.querySelector('.um-date-popover');
    const grid = control.querySelector('.um-date-grid');
    const monthLabel = control.querySelector('#consentedAtMonthLabel');
    const hourInput = control.querySelector('#consentHour');
    const minuteInput = control.querySelector('#consentMinute');
    let value = control.getAttribute('data-value') || '';
    let selected = value ? new Date(value) : null;
    if (selected && Number.isNaN(selected.getTime())) selected = null;
    let view = selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) :
      new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let open = false;

    function twoDigits(number) {
      return String(number).padStart(2, '0');
    }

    function syncTrigger() {
      trigger.textContent = value ? formatDate(value) : '请选择同意时间';
      trigger.classList.toggle('is-placeholder', !value);
      control.setAttribute('data-value', value);
    }

    function renderCalendar() {
      monthLabel.textContent = view.getFullYear() + ' 年 ' + (view.getMonth() + 1) + ' 月';
      const firstDay = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
      const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      let markup = '';
      for (let blank = 0; blank < firstDay; blank += 1) {
        markup += '<span class="um-date-cell-empty"></span>';
      }
      for (let day = 1; day <= days; day += 1) {
        const isSelected = selected && selected.getFullYear() === view.getFullYear() &&
          selected.getMonth() === view.getMonth() && selected.getDate() === day;
        markup += '<button class="um-date-cell" type="button" data-date-day="' + day +
          '" aria-selected="' + String(Boolean(isSelected)) + '">' + day + '</button>';
      }
      grid.innerHTML = markup;
      const time = selected || new Date();
      hourInput.value = twoDigits(time.getHours());
      minuteInput.value = twoDigits(time.getMinutes());
    }

    function setOpen(next) {
      open = next;
      popover.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      if (open) renderCalendar();
    }

    function selectDay(day) {
      const base = selected || new Date();
      selected = new Date(view.getFullYear(), view.getMonth(), day, base.getHours(), base.getMinutes(), 0, 0);
      renderCalendar();
    }

    function readTime() {
      const hour = Number(hourInput.value);
      const minute = Number(minuteInput.value);
      if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
        return null;
      }
      return { hour: hour, minute: minute };
    }

    function commitSelection() {
      const time = readTime();
      if (!selected) {
        setFieldError('consentedAt', '请先选择日期');
        return;
      }
      if (!time) {
        setFieldError('consentedAt', '请输入有效时间（00:00–23:59）');
        return;
      }
      selected.setHours(time.hour, time.minute, 0, 0);
      value = selected.toISOString();
      clearFieldError('consentedAt');
      syncTrigger();
      setOpen(false);
      trigger.focus();
    }

    trigger.addEventListener('click', function () { setOpen(!open); });
    popover.addEventListener('click', function (event) {
      const dayButton = event.target.closest('[data-date-day]');
      if (dayButton) {
        selectDay(Number(dayButton.getAttribute('data-date-day')));
        return;
      }
      const actionButton = event.target.closest('[data-date-action]');
      if (!actionButton) return;
      const action = actionButton.getAttribute('data-date-action');
      if (action === 'previous' || action === 'next') {
        view = new Date(view.getFullYear(), view.getMonth() + (action === 'next' ? 1 : -1), 1);
        renderCalendar();
      } else if (action === 'now') {
        selected = new Date();
        view = new Date(selected.getFullYear(), selected.getMonth(), 1);
        renderCalendar();
      } else if (action === 'clear') {
        selected = null;
        value = '';
        syncTrigger();
        setOpen(false);
        trigger.focus();
      } else if (action === 'confirm') {
        commitSelection();
      }
    });
    root.document.addEventListener('pointerdown', function (event) {
      if (open && !control.contains(event.target)) setOpen(false);
    });
    syncTrigger();
    return {
      getValue: function () { return value; },
      setValue: function (nextValue) {
        value = nextValue || '';
        selected = value ? new Date(value) : null;
        if (selected && Number.isNaN(selected.getTime())) {
          selected = null;
          value = '';
        }
        if (selected) view = new Date(selected.getFullYear(), selected.getMonth(), 1);
        syncTrigger();
      }
    };
  }

  function getDateValue() {
    return consentDateController ? consentDateController.getValue() : '';
  }

  function getConsentSource() {
    const source = getComboboxValue('consentSource');
    return source === 'none' ? '' : source;
  }

  function syncMarketingVisibility() {
    const button = root.document.getElementById('marketingSwitch');
    const fields = root.document.getElementById('marketingConsentFields');
    if (button) button.setAttribute('aria-checked', String(state.marketing));
    if (fields) fields.hidden = !state.marketing;
  }

  function clearFieldError(name) {
    const field = root.document.querySelector('[data-field="' + name + '"]');
    if (!field) return;
    field.classList.remove('is-invalid');
    const control = field.querySelector('.um-text-control, .um-control, .um-switch');
    if (control) {
      control.removeAttribute('aria-invalid');
      control.removeAttribute('aria-describedby');
    }
    const error = field.querySelector('.um-field-error');
    if (error) error.textContent = '';
  }

  function setFieldError(name, message) {
    const field = root.document.querySelector('[data-field="' + name + '"]');
    if (!field) return;
    field.classList.add('is-invalid');
    const control = field.querySelector('.um-text-control, .um-control, .um-switch');
    if (control) {
      control.setAttribute('aria-invalid', 'true');
      control.setAttribute('aria-describedby', name + 'Error');
    }
    const error = field.querySelector('.um-field-error');
    if (error) error.textContent = message;
  }

  function clearErrors() {
    Array.prototype.forEach.call(root.document.querySelectorAll('.um-field.is-invalid'), function (field) {
      clearFieldError(field.getAttribute('data-field'));
    });
    elements.errorSummary.hidden = true;
    elements.errorSummary.innerHTML = '';
  }

  function showErrorSummary(messages) {
    const list = Array.isArray(messages) ? messages : [messages];
    elements.errorSummary.innerHTML = '<strong>请检查以下内容：</strong><ul>' + list.map(function (message) {
      return '<li>' + escapeHtml(message) + '</li>';
    }).join('') + '</ul>';
    elements.errorSummary.hidden = false;
    elements.errorSummary.focus();
  }

  function validate() {
    clearErrors();
    const errors = [];
    const email = readText('userEmail').toLowerCase();
    if (!email) {
      setFieldError('userEmail', '请输入邮箱地址');
      errors.push('请输入邮箱地址');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('userEmail', '请输入有效邮箱地址');
      errors.push('邮箱地址格式不正确');
    }
    if (state.marketing) {
      if (!getConsentSource()) {
        setFieldError('consentSource', '请选择同意来源');
        errors.push('请选择邮件营销同意来源');
      }
      if (!getDateValue()) {
        setFieldError('consentedAt', '请选择同意时间');
        errors.push('请选择邮件营销同意时间');
      }
    }
    if (errors.length) showErrorSummary(errors);
    return errors.length === 0;
  }

  function addTag() {
    const input = root.document.getElementById('tagInput');
    const value = input ? input.value.trim() : '';
    if (!value) return;
    const duplicate = state.tags.some(function (tag) {
      return tag.toLocaleLowerCase() === value.toLocaleLowerCase();
    });
    if (duplicate) {
      showToast('该标签已经存在。', 'error');
      return;
    }
    state.tags.push(value);
    input.value = '';
    renderTags();
  }

  function showDuplicate(existing) {
    const card = root.document.getElementById('duplicateUserCard');
    if (!card || !existing) return;
    card.hidden = false;
    card.innerHTML = '<div><strong>该邮箱已有用户档案</strong><p>' +
      escapeHtml(fullName(existing)) + ' · ' + escapeHtml(existing.email) +
      '</p><small>不会创建重复用户，请进入原档案继续编辑。</small></div>' +
      '<button class="um-button um-button-secondary" id="openDuplicateUserButton" type="button">查看原档案</button>';
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function consentChanged(consent) {
    const current = latestSubscribedConsent(state.user);
    if (!current) return true;
    return String(current.source || '') !== String(consent.source || '') ||
      String(current.consentedAt || '') !== String(consent.consentedAt || '') ||
      String(current.note || '') !== String(consent.note || '');
  }

  function phoneForSave() {
    const phone = readText('phone');
    return phone ? getComboboxValue('countryCode') + ' ' + phone : '';
  }

  function setSaving(saving) {
    state.saving = saving;
    const saveButton = root.document.getElementById('userSaveButton');
    if (saveButton) {
      saveButton.disabled = saving;
      saveButton.textContent = saving ? '保存中…' : (state.mode === 'edit' ? '保存更改' : '保存用户');
    }
  }

  function saveAdd() {
    return root.UserStore.createManual({
      email: readText('userEmail'),
      firstName: readText('firstName'),
      lastName: readText('lastName'),
      phone: phoneForSave(),
      preferredLanguage: getComboboxValue('preferredLanguage'),
      tags: state.tags.slice(),
      note: readText('internalNote'),
      marketingOptIn: state.marketing,
      consent: state.marketing ? {
        source: getConsentSource(),
        consentedAt: getDateValue(),
        note: readText('consentNote')
      } : null
    });
  }

  function saveEdit() {
    const result = root.UserStore.update(state.user.id, {
      email: readText('userEmail'),
      firstName: readText('firstName'),
      lastName: readText('lastName'),
      phone: phoneForSave(),
      preferredLanguage: getComboboxValue('preferredLanguage'),
      tags: state.tags.slice(),
      note: readText('internalNote')
    });
    if (!result.ok) return result;

    const consent = {
      source: getConsentSource(),
      consentedAt: getDateValue(),
      note: readText('consentNote')
    };
    let marketingResult = null;
    if (state.marketing && (state.user.marketingStatus !== 'subscribed' || consentChanged(consent))) {
      marketingResult = root.UserStore.setMarketingStatus([state.user.id], 'subscribed', consent);
    } else if (!state.marketing && state.marketingTouched) {
      const nextStatus = state.user.marketingStatus === 'subscribed' ? 'unsubscribed' : 'not_subscribed';
      if (nextStatus !== state.user.marketingStatus) {
        marketingResult = root.UserStore.setMarketingStatus([state.user.id], nextStatus, {
          source: 'admin',
          consentedAt: new Date().toISOString(),
          note: '后台编辑用户资料'
        });
      }
    }
    if (marketingResult && !marketingResult.ok) return marketingResult;
    return { ok: true, user: root.UserStore.get(state.user.id) };
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (state.saving || !validate()) return;
    setSaving(true);
    const result = state.mode === 'edit' ? saveEdit() : saveAdd();
    if (!result.ok) {
      setSaving(false);
      if (result.existing) showDuplicate(result.existing);
      showErrorSummary(result.error || '保存失败，请检查后重试');
      return;
    }
    showToast(state.mode === 'edit' ? '用户资料已保存。' : '已创建待激活用户档案。', 'success');
    root.setTimeout(returnToList, 550);
  }

  function handleStatusAction(button) {
    if (!state.user || state.saving) return;
    const action = button.getAttribute('data-status-action');
    const result = root.UserStore.setAccountStatus([state.user.id], action);
    if (!result.ok) {
      showToast(result.error || '账号状态更新失败。', 'error');
      return;
    }
    state.user = root.UserStore.get(state.user.id);
    renderSidebar();
    showToast(action === 'disabled' ? '账号已禁用。' : '账号已恢复到禁用前状态。', 'success');
  }

  function handleClick(event) {
    if (event.target.closest('#userBackButton, #userCancelButton')) {
      returnToList();
      return;
    }
    if (event.target.closest('#marketingSwitch')) {
      state.marketing = !state.marketing;
      state.marketingTouched = true;
      syncMarketingVisibility();
      return;
    }
    if (event.target.closest('#addTagButton')) {
      addTag();
      return;
    }
    const removeTag = event.target.closest('[data-remove-tag]');
    if (removeTag) {
      state.tags.splice(Number(removeTag.getAttribute('data-remove-tag')), 1);
      renderTags();
      return;
    }
    if (event.target.closest('#openDuplicateUserButton')) {
      const existing = root.UserStore.findByEmail(readText('userEmail'));
      if (existing) openExistingUser(existing.id);
      return;
    }
    const statusButton = event.target.closest('[data-status-action]');
    if (statusButton) handleStatusAction(statusButton);
  }

  function handleKeydown(event) {
    if (event.target.id === 'tagInput' && event.key === 'Enter' && !event.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      addTag();
    }
  }

  function exposeHooks() {
    root.UserPageHooks = {
      getUser: function () {
        return state.user ? root.UserStore.get(state.user.id) : null;
      },
      updateMarketing: function (ids, status, consent) {
        return root.UserStore.setMarketingStatus(ids, status, consent);
      },
      onConsentComplete: function () {
        if (state.mode !== 'edit') return;
        state.user = root.UserStore.get(state.user.id);
        renderMain();
        renderSidebar();
      },
      onDialogComplete: function () {
        this.onConsentComplete();
      }
    };
  }

  function renderMissingUser() {
    elements.guidance.innerHTML = '';
    elements.main.innerHTML = cardMarkup('未找到用户',
      '<div class="um-empty-inline">链接中的用户 ID 不存在，用户可能已被删除。</div>' +
      '<button class="um-button um-button-secondary um-empty-action" id="userBackButton" type="button">返回用户列表</button>');
    elements.sidebar.innerHTML = '';
    const saveButton = root.document.getElementById('userSaveButton');
    if (saveButton) saveButton.hidden = true;
  }

  function initialize() {
    elements.header = root.document.getElementById('userFormHeader');
    elements.guidance = root.document.getElementById('manualAddGuidance');
    elements.main = root.document.getElementById('userFormMain');
    elements.sidebar = root.document.getElementById('userFormSidebar');
    elements.form = root.document.getElementById('userForm');
    elements.errorSummary = root.document.getElementById('userFormErrorSummary');
    elements.toastRegion = root.document.getElementById('userFormToastRegion');

    renderHeader();
    if (!root.UserStore || !root.UserComponents) {
      elements.main.innerHTML = cardMarkup('页面加载失败',
        '<div class="um-empty-inline">用户数据或系统控件未能加载，请刷新页面后重试。</div>');
      return;
    }
    if (state.mode === 'edit') {
      state.user = state.userId ? root.UserStore.get(state.userId) : null;
      if (!state.user) {
        renderMissingUser();
        elements.form.addEventListener('click', handleClick);
        return;
      }
    }
    renderGuidance();
    renderMain();
    renderSidebar();
    exposeHooks();
    elements.form.addEventListener('submit', handleSubmit);
    elements.form.addEventListener('click', handleClick);
    elements.form.addEventListener('keydown', handleKeydown);
  }

  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})(window);
