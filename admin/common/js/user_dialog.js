(function (root) {
  'use strict';

  var FOCUSABLE = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled]):not([type="hidden"])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  var CSV_FIELDS = [
    { key: 'email', label: '邮箱', required: true, aliases: ['email', 'email address', '邮箱', '邮箱（必填）', '电子邮箱'] },
    { key: 'firstName', label: '名字', aliases: ['first name', 'firstname', '名字', '名'] },
    { key: 'lastName', label: '姓氏', aliases: ['last name', 'lastname', '姓氏', '姓'] },
    { key: 'phone', label: '手机号', aliases: ['phone', 'phone number', '手机号', '电话'] },
    { key: 'tags', label: '标签', aliases: ['tags', 'tag', '标签', '用户标签'] },
    {
      key: 'marketingStatus',
      label: '订阅状态',
      aliases: [
        'subscription status', 'email subscription status', '订阅状态',
        'email marketing consent state', 'accepts email marketing', 'marketing status', '邮件营销状态', '接受邮件营销'
      ]
    },
    {
      key: 'smsMarketing',
      label: '短信营销授权',
      aliases: ['sms marketing consent', 'accepts sms marketing', 'sms marketing', '短信营销授权', '短信授权']
    },
    {
      key: 'whatsappMarketing',
      label: 'WhatsApp 营销授权',
      aliases: ['whatsapp marketing consent', 'accepts whatsapp marketing', 'whatsapp marketing', 'whatsapp 营销授权', 'whatsapp 授权']
    }
  ];

  var MARKETING_STATUS_LABELS = {
    subscribed: '已订阅',
    not_subscribed: '未订阅',
    unsubscribed: '已退订',
    pending: '待确认',
    invalid: '无效邮箱'
  };

  var SHOPIFY_AUTH_CONTEXT = {
    accountEmail: 'owner@qvr.com',
    store: {
      id: 'store-qvr',
      name: 'QVR 官方商店',
      domain: 'qvr-official.myshopify.com'
    }
  };

  var SHOPIFY_RECORDS = [
    {
      id: 'gid-customer-201', firstName: 'Sophia', lastName: 'Miller',
      email: 'sophia.miller@example.com', phone: '+1 415 555 0136',
      profileKind: 'subscriber', marketingStatus: 'subscribed',
      consent: { source: 'checkout', consentedAt: '2026-07-18T09:10:00.000Z', note: 'Shopify checkout' }
    },
    {
      id: 'gid-customer-202', firstName: 'Liam', lastName: 'Wilson',
      email: 'liam.wilson@example.com', phone: '+1 206 555 0174',
      profileKind: 'customer', marketingStatus: 'not_subscribed'
    },
    {
      id: 'gid-customer-203', firstName: 'Emma', lastName: 'Taylor',
      email: 'emma.taylor@example.com', phone: '+44 20 7946 0911',
      profileKind: 'subscriber', marketingStatus: 'subscribed',
      consent: { source: 'footer', consentedAt: '2026-06-09T12:35:00.000Z', note: 'Shopify newsletter' }
    },
    {
      id: 'gid-customer-204', firstName: 'Noah', lastName: 'Brown',
      email: 'noah.brown@example.com', phone: '',
      profileKind: 'customer', marketingStatus: 'unsubscribed',
      marketingStatusAt: '2026-07-02T11:25:00.000Z'
    },
    {
      id: 'gid-customer-205', firstName: 'Olivia', lastName: 'Davis',
      email: 'olivia.davis@example.com', phone: '+61 2 5550 0148',
      profileKind: 'subscriber', marketingStatus: 'subscribed',
      consent: { source: 'shopify_api', consentedAt: '2026-07-23T04:48:00.000Z', note: 'Shopify Forms' }
    },
    {
      id: 'gid-customer-206', firstName: 'Ethan', lastName: 'Moore',
      email: 'ethan.moore@example.com', phone: '',
      profileKind: 'customer', marketingStatus: 'pending',
      marketingStatusAt: '2026-07-22T03:40:00.000Z'
    },
    {
      id: 'gid-customer-207', firstName: 'Ava', lastName: 'Martin',
      email: 'ava.martin@example.com', phone: '+33 1 84 80 12 64',
      profileKind: 'subscriber', marketingStatus: 'subscribed',
      consent: { source: 'registration', consentedAt: '2026-05-31T15:00:00.000Z', note: 'Customer account signup' }
    },
    {
      id: 'gid-customer-208', firstName: 'Lucas', lastName: 'Lee',
      email: 'lucas.lee@example.com', phone: '+65 6123 4567',
      profileKind: 'customer', marketingStatus: 'invalid',
      marketingStatusAt: '2026-07-21T08:20:00.000Z'
    },
    {
      id: 'gid-customer-209', firstName: 'Mia', lastName: 'Anderson',
      email: 'mia.anderson@example.com', phone: '',
      profileKind: 'subscriber', marketingStatus: 'subscribed',
      consent: { source: 'offline_event', consentedAt: '2026-04-12T06:30:00.000Z', note: 'Pop-up event' }
    },
    {
      id: 'gid-customer-210', firstName: 'Leo', lastName: 'Thomas',
      email: 'leo.thomas@example.com', phone: '+81 3 5555 0182',
      profileKind: 'customer', marketingStatus: 'not_subscribed'
    }
  ];

  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function csvError(code, message, details) {
    var error = new Error(message);
    error.code = code;
    error.details = details || {};
    return error;
  }

  function parseCsv(text) {
    var source = String(text === null || text === undefined ? '' : text).replace(/^\uFEFF/, '');
    var rows = [];
    var row = [];
    var field = '';
    var quoted = false;
    for (var index = 0; index < source.length; index += 1) {
      var character = source[index];
      if (quoted) {
        if (character === '"' && source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else if (character === '"') {
          quoted = false;
        } else {
          field += character;
        }
        continue;
      }
      if (character === '"') {
        quoted = true;
      } else if (character === ',') {
        row.push(field);
        field = '';
      } else if (character === '\r' || character === '\n') {
        row.push(field);
        field = '';
        if (row.some(function (cell) { return String(cell).trim() !== ''; })) rows.push(row);
        row = [];
        if (character === '\r' && source[index + 1] === '\n') index += 1;
      } else {
        field += character;
      }
    }
    if (quoted) {
      throw csvError('CSV_UNCLOSED_QUOTE', 'CSV 存在未闭合的引号，请检查文件格式。');
    }
    row.push(field);
    if (row.some(function (cell) { return String(cell).trim() !== ''; })) rows.push(row);
    if (!rows.length) return rows;
    var expectedColumns = rows[0].length;
    rows.slice(1).forEach(function (dataRow, rowIndex) {
      if (dataRow.length !== expectedColumns) {
        throw csvError(
          'CSV_COLUMN_MISMATCH',
          'CSV 第 ' + (rowIndex + 2) + ' 行有 ' + dataRow.length +
            ' 列，应为 ' + expectedColumns + ' 列。',
          { row: rowIndex + 2, actual: dataRow.length, expected: expectedColumns }
        );
      }
    });
    return rows;
  }

  function autoCsvMapping(headers) {
    var normalized = headers.map(function (header) { return String(header || '').trim().toLocaleLowerCase(); });
    var mapping = {};
    CSV_FIELDS.forEach(function (field) {
      var matchedIndex = -1;
      field.aliases.some(function (alias) {
        matchedIndex = normalized.indexOf(alias.toLocaleLowerCase());
        return matchedIndex !== -1;
      });
      mapping[field.key] = matchedIndex === -1 ? 'skip' : String(matchedIndex);
    });
    return mapping;
  }

  function csvValue(row, mappingValue) {
    if (mappingValue === 'skip') return '';
    var index = Number(mappingValue);
    return Number.isInteger(index) && index >= 0 ? String(row[index] || '').trim() : '';
  }

  function normalizeMarketingStatus(value) {
    var normalized = String(value || '').trim().toLocaleLowerCase().replace(/\s+/g, '_');
    if (['yes', 'true', '1', 'subscribed', '已订阅'].indexOf(normalized) !== -1) return 'subscribed';
    if (['unsubscribed', '退订', '已退订'].indexOf(normalized) !== -1) return 'unsubscribed';
    if (['pending', '待确认'].indexOf(normalized) !== -1) return 'pending';
    if (['invalid', '无效邮箱'].indexOf(normalized) !== -1) return 'invalid';
    if (['no', 'false', '0', 'not_subscribed', '未订阅'].indexOf(normalized) !== -1) return 'not_subscribed';
    return '';
  }

  function normalizeMarketingAuthorization(value) {
    var normalized = String(value || '').trim().toLocaleLowerCase().replace(/\s+/g, '_');
    if (!normalized) return null;
    if (['yes', 'true', '1', '是', '已授权', '授权'].indexOf(normalized) !== -1) return true;
    if (['no', 'false', '0', '否', '未授权'].indexOf(normalized) !== -1) return false;
    return null;
  }

  function normalizeCsvTags(value) {
    var tags = [];
    String(value || '').split(/[|,，;；]/).forEach(function(tag) {
      var normalized = tag.trim();
      if (normalized && normalized.length <= 40 && tags.indexOf(normalized) === -1 && tags.length < 20) {
        tags.push(normalized);
      }
    });
    return tags;
  }

  function buildCsvRecords(rows, mapping) {
    return rows.map(function (row) {
      var requestedStatus = normalizeMarketingStatus(csvValue(row, mapping.marketingStatus));
      var smsMarketing = normalizeMarketingAuthorization(csvValue(row, mapping.smsMarketing));
      var whatsappMarketing = normalizeMarketingAuthorization(csvValue(row, mapping.whatsappMarketing));
      var marketingChannels = {};
      if (smsMarketing !== null) marketingChannels.sms = smsMarketing;
      if (whatsappMarketing !== null) marketingChannels.whatsapp = whatsappMarketing;
      var record = {
        email: csvValue(row, mapping.email).toLocaleLowerCase(),
        firstName: csvValue(row, mapping.firstName),
        lastName: csvValue(row, mapping.lastName),
        phone: csvValue(row, mapping.phone),
        tags: normalizeCsvTags(csvValue(row, mapping.tags)),
        marketingChannels: marketingChannels
      };
      if (requestedStatus) record.marketingStatus = requestedStatus;
      if (requestedStatus === 'subscribed') {
        record.consent = {
          source: 'csv_import',
          consentedAt: new Date().toISOString(),
          note: 'CSV 导入订阅授权'
        };
      }
      return record;
    });
  }

  function validateCsvRecords(records) {
    var seen = {};
    var valid = 0;
    var invalid = 0;
    var missingEmail = 0;
    var invalidEmail = 0;
    var duplicates = 0;
    records.forEach(function (record) {
      if (!String(record.email || '').trim()) {
        missingEmail += 1;
        invalid += 1;
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
        invalidEmail += 1;
        invalid += 1;
        return;
      }
      valid += 1;
      if (seen[record.email]) duplicates += 1;
      seen[record.email] = true;
    });
    return {
      total: records.length,
      valid: valid,
      invalid: invalid,
      missingEmail: missingEmail,
      invalidEmail: invalidEmail,
      duplicates: duplicates
    };
  }

  function filterShopifyRecords(records, filters) {
    var query = String(filters && filters.search || '').trim().toLocaleLowerCase();
    var kind = filters && filters.kind || 'all';
    var status = filters && filters.status || 'all';
    return records.filter(function (record) {
      if (kind !== 'all' && record.profileKind !== kind) return false;
      if (status !== 'all' && record.marketingStatus !== status) return false;
      if (!query) return true;
      return [
        record.firstName,
        record.lastName,
        record.email,
        record.phone
      ].join(' ').toLocaleLowerCase().indexOf(query) !== -1;
    });
  }

  function setCurrentSelection(selection, currentIds, selected) {
    var next = new Set(selection || []);
    currentIds.forEach(function (id) {
      if (selected) next.add(id);
      else next.delete(id);
    });
    return next;
  }

  function createSessionGate() {
    var generation = 0;
    return {
      next: function () {
        generation += 1;
        return generation;
      },
      isCurrent: function (token) {
        return token === generation;
      },
      current: function () {
        return generation;
      }
    };
  }

  function settleSessionTask(task, gate, token) {
    return Promise.resolve(task).then(function (value) {
      return { current: gate.isCurrent(token), value: value };
    }, function (error) {
      return Promise.reject({ current: gate.isCurrent(token), error: error });
    });
  }

  function getComboKeyAction(event, currentIndex, count) {
    var safeIndex = count > 0 ? Math.max(0, Math.min(currentIndex, count - 1)) : -1;
    var result = { handled: false, index: safeIndex, select: false, close: false };
    if (!event || event.isComposing || event.keyCode === 229) return result;
    if (event.key === 'Escape') {
      result.handled = true;
      result.close = true;
      return result;
    }
    if (count <= 0) return result;
    if (event.key === 'ArrowDown') {
      result.handled = true;
      result.index = (safeIndex + 1) % count;
    } else if (event.key === 'ArrowUp') {
      result.handled = true;
      result.index = (safeIndex - 1 + count) % count;
    } else if (event.key === 'Home') {
      result.handled = true;
      result.index = 0;
    } else if (event.key === 'End') {
      result.handled = true;
      result.index = count - 1;
    } else if (event.key === 'Enter') {
      result.handled = true;
      result.select = true;
    }
    return result;
  }

  function canRestoreFocus(input) {
    var state = input || {};
    return Boolean(
      state.navigationMatches &&
      state.frameIsActive &&
      state.frameVisible &&
      state.targetConnected
    );
  }

  function resolveFocusableOpener(target) {
    if (!target || typeof target.closest !== 'function') return target;
    var collapsedMenu = target.closest('details:not([open])');
    if (!collapsedMenu || typeof collapsedMenu.querySelector !== 'function') return target;
    return collapsedMenu.querySelector('summary') || target;
  }

  function normalizeHookResult(result, allowVoid) {
    if ((result === undefined || result === null) && allowVoid) {
      return { ok: true, error: '', value: result };
    }
    if (!result || result.ok === false) {
      return {
        ok: false,
        error: result && result.error ? String(result.error) : '操作未完成，请重试。',
        value: null
      };
    }
    return { ok: true, error: '', value: result };
  }

  function settleHookResult(task, allowVoid) {
    return Promise.resolve(task).then(function (result) {
      var normalized = normalizeHookResult(result, allowVoid);
      if (!normalized.ok) normalized.failure = result;
      return normalized;
    }, function (error) {
      return {
        ok: false,
        error: error && error.message ? error.message : '操作执行失败，请重试。',
        value: null
      };
    });
  }

  function canonicalValue(value) {
    if (Array.isArray(value)) return value.map(canonicalValue);
    if (!value || typeof value !== 'object') return value;
    return Object.keys(value).sort().reduce(function (result, key) {
      result[key] = canonicalValue(value[key]);
      return result;
    }, {});
  }

  function resolveDeletionRiskState(outcome, ids) {
    var result = outcome || {};
    if (result.ok !== true) {
      return {
        riskStatus: 'error',
        users: [],
        error: '无法读取订单或 Shopify 关联风险。' +
          (result.error ? ' ' + String(result.error) : ' 请重试。')
      };
    }
    var value = result.value;
    var users = Array.isArray(value) ? value : (value ? [value] : []);
    var requestedIds = Array.isArray(ids) ? ids : [];
    var normalizedIds = requestedIds.map(function (id) { return String(id || '').trim(); });
    var idSet = new Set(normalizedIds);
    var returnedIds = users.map(function (user) {
      return user && typeof user === 'object' ? String(user.id || '').trim() : '';
    });
    var returnedIdSet = new Set(returnedIds);
    var complete = normalizedIds.length > 0 &&
      normalizedIds.every(Boolean) &&
      idSet.size === normalizedIds.length &&
      users.length === normalizedIds.length &&
      returnedIds.every(Boolean) &&
      returnedIdSet.size === returnedIds.length &&
      returnedIds.every(function (id) { return idSet.has(id); });
    if (!complete) {
      return {
        riskStatus: 'error',
        users: [],
        version: '',
        error: '无法读取订单或 Shopify 关联风险。返回的用户风险数据不完整或格式错误，请重试。'
      };
    }
    var sortedUsers = users.slice().sort(function (first, second) {
      return String(first.id).localeCompare(String(second.id));
    });
    return {
      riskStatus: 'ready',
      users: sortedUsers,
      version: JSON.stringify(canonicalValue(sortedUsers)),
      error: ''
    };
  }

  function canPermanentlyDelete(deletion) {
    return Boolean(deletion && deletion.riskStatus === 'ready' && deletion.version && !deletion.busy);
  }

  function mergeCsvImportResult(result, validation) {
    var source = result || {};
    var counts = source.counts || {};
    var review = validation || {};
    var sourceWarnings = source.warnings || {};
    var validationWarnings = (Number(review.consentMissing) || 0) + (Number(review.consentInvalid) || 0);
    var merged = Object.assign({}, source, {
      counts: {
        created: Number(counts.created) || 0,
        merged: Number(counts.merged) || 0,
        skipped: (Number(counts.skipped) || 0) + (Number(review.missingEmail) || 0),
        failed: (Number(counts.failed) || 0) + (Number(review.invalidEmail) || 0)
      },
      warnings: {
        consentDowngraded: Math.max(Number(sourceWarnings.consentDowngraded) || 0, validationWarnings)
      }
    });
    return merged;
  }

  var exported = {
    parseCsv: parseCsv,
    autoCsvMapping: autoCsvMapping,
    buildCsvRecords: buildCsvRecords,
    validateCsvRecords: validateCsvRecords,
    filterShopifyRecords: filterShopifyRecords,
    setCurrentSelection: setCurrentSelection,
    createSessionGate: createSessionGate,
    settleSessionTask: settleSessionTask,
    getComboKeyAction: getComboKeyAction,
    canRestoreFocus: canRestoreFocus,
    resolveFocusableOpener: resolveFocusableOpener,
    normalizeHookResult: normalizeHookResult,
    settleHookResult: settleHookResult,
    resolveDeletionRiskState: resolveDeletionRiskState,
    canPermanentlyDelete: canPermanentlyDelete,
    mergeCsvImportResult: mergeCsvImportResult
  };

  if (typeof module === 'object' && module.exports) module.exports = exported;
  if (!root || !root.document) return;

  var loaded = false;
  var loadPromise = null;
  var openNonce = 0;
  var navigationGeneration = 0;
  var focusRestoreTimer = null;
  var csvSessionGate = createSessionGate();
  var active = null;
  var csvJobSequence = 0;
  var csvJob = null;
  var shopifyJobSequence = 0;
  var shopifyJob = null;
  var exportJobSequence = 0;
  var exportJob = null;
  var state = {
    csv: null,
    shopify: null,
    marketing: null,
    batchTag: null,
    exportUsers: null,
    deletion: null
  };

  function activeFrame() {
    return root.document.querySelector('.iframe-container iframe.active') ||
      root.document.getElementById('contentFrame');
  }

  function captureContext() {
    var frame = activeFrame();
    var frameWindow = frame && frame.contentWindow;
    var opener = null;
    try {
      opener = frame && frame.contentDocument ? frame.contentDocument.activeElement : null;
    } catch (error) {
      opener = null;
    }
    return {
      frame: frame,
      frameWindow: frameWindow,
      hooks: frameWindow && frameWindow.UserPageHooks,
      opener: opener || root.document.activeElement
    };
  }

  function showParentError(message) {
    var host = root.document.getElementById('toastContainer') || root.document.body;
    var alert = root.document.createElement('div');
    alert.className = 'um-dialog-global-error';
    alert.setAttribute('role', 'alert');
    alert.textContent = String(message || '操作失败，请重试。');
    host.appendChild(alert);
    root.setTimeout(function () {
      if (alert.parentNode) alert.parentNode.removeChild(alert);
    }, 4800);
  }

  function ensureDialogs() {
    if (loaded) return Promise.resolve();
    if (loadPromise) return loadPromise;
    loadPromise = root.fetch('common/html/user_dialogs.html?v=14')
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
      })
      .then(function (html) {
        var host = root.document.getElementById('dialogHost');
        if (!host) {
          host = root.document.createElement('div');
          host.id = 'dialogHost';
          root.document.body.appendChild(host);
        }
        var wrapper = root.document.createElement('div');
        wrapper.innerHTML = html;
        while (wrapper.firstChild) host.appendChild(wrapper.firstChild);
        bindHost(host);
        loaded = true;
      })
      .catch(function (error) {
        loadPromise = null;
        root.console.error('用户对话框加载失败:', error);
        showParentError('用户操作对话框加载失败，请刷新后台后重试。');
        throw error;
      });
    return loadPromise;
  }

  function overlayFor(type) {
    return root.document.querySelector('[data-user-dialog="' + type + '"]');
  }

  function titleId(type) {
    return 'um' + type.charAt(0).toUpperCase() + type.slice(1) + 'DialogTitle';
  }

  function stepsMarkup(labels, current) {
    return '<div class="um-dialog-steps" style="--um-step-count:' + labels.length + '">' +
      labels.map(function (label, index) {
        var step = index + 1;
        var className = step === current ? ' is-active' : (step < current ? ' is-complete' : '');
        return '<div class="um-dialog-step' + className + '" data-step="' + step + '">' +
          escapeHtml(label) + '</div>';
      }).join('') + '</div>';
  }

  function shopifyStepsMarkup(labels, current) {
    return '<div class="um-dialog-steps um-shopify-dialog-steps">' +
      labels.map(function (label, index) {
        var step = index + 1;
        var className = step === current ? ' is-active' : (step < current ? ' is-complete' : '');
        var divider = index < labels.length - 1
          ? '<span class="um-dialog-step-divider' + (step < current ? ' is-complete' : '') +
            '" aria-hidden="true"></span>'
          : '';
        return '<div class="um-dialog-step' + className + '">' +
          '<span class="um-dialog-step-num" aria-hidden="true">' +
          (step < current ? '✓' : step) + '</span><span class="um-dialog-step-label">' +
          escapeHtml(label) + '</span></div>' + divider;
      }).join('') + '</div>';
  }

  function headerMarkup(type, title, subtitle, blocking) {
    return '<div class="um-dialog-header-copy"><h2 id="' + titleId(type) + '">' +
      escapeHtml(title) + '</h2>' + (subtitle ? '<p>' + escapeHtml(subtitle) + '</p>' : '') +
      '</div><button class="um-dialog-close" type="button" data-dialog-action="close" aria-label="关闭对话框"' +
      (blocking ? ' title="请使用取消按钮退出"' : '') + '>×</button>';
  }

  function renderShell(type, config) {
    var overlay = overlayFor(type);
    if (!overlay) return;
    var dialog = overlay.querySelector('.um-dialog');
    if (type === 'shopify' && dialog) {
      dialog.setAttribute('data-shopify-step', String(config.shopifyStep || 1));
      dialog.setAttribute('data-shopify-view', String(config.shopifyView || 'default'));
    }
    overlay.querySelector('.um-dialog-header').innerHTML = headerMarkup(
      type,
      config.title,
      config.subtitle || '',
      Boolean(config.blocking)
    );
    overlay.querySelector('.um-dialog-body').innerHTML = config.body || '';
    overlay.querySelector('.um-dialog-footer').innerHTML = config.footer || '';
  }

  function focusFirst(overlay) {
    root.setTimeout(function () {
      var target = overlay.querySelector('[autofocus]') || overlay.querySelector(FOCUSABLE);
      if (target) target.focus();
    }, 0);
  }

  function isFrameVisible(frame) {
    if (!frame || activeFrame() !== frame || !frame.classList.contains('active') || frame.hidden) return false;
    var style = root.getComputedStyle ? root.getComputedStyle(frame) : null;
    return !style || (style.display !== 'none' && style.visibility !== 'hidden');
  }

  function restoredOpener(previous) {
    if (!previous || previous.navigationGeneration !== navigationGeneration ||
        !isFrameVisible(previous.frame)) return null;
    var target = previous.opener && previous.opener.isConnected !== false ? previous.opener : null;
    var frameDocument = null;
    try {
      frameDocument = previous.frame && previous.frame.contentDocument;
    } catch (error) {
      frameDocument = null;
    }
    if (!target && (!frameDocument || !previous.opener)) return null;
    if (!target && previous.opener.id) {
      var byId = frameDocument.getElementById(previous.opener.id);
      if (byId) target = byId;
    }
    var attributes = ['data-row-action', 'data-user-id', 'data-bulk', 'data-import'];
    var selector = previous.opener.tagName ? previous.opener.tagName.toLocaleLowerCase() : '';
    attributes.forEach(function (name) {
      var value = previous.opener.getAttribute && previous.opener.getAttribute(name);
      if (value !== null && value !== undefined) {
        selector += '[' + name + '="' +
          String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"]';
      }
    });
    if (!target && selector) {
      var replacement = frameDocument.querySelector(selector);
      if (replacement) target = replacement;
    }
    if (!target && frameDocument) {
      target = frameDocument.querySelector('#userListHeader button, #userFormHeader button, button');
    }
    target = resolveFocusableOpener(target);
    return canRestoreFocus({
      navigationMatches: previous.navigationGeneration === navigationGeneration,
      frameIsActive: activeFrame() === previous.frame,
      frameVisible: isFrameVisible(previous.frame),
      targetConnected: Boolean(target && target.isConnected !== false)
    }) ? target : null;
  }

  function hideAll(restoreFocus) {
    var previous = active;
    if (focusRestoreTimer !== null) {
      root.clearTimeout(focusRestoreTimer);
      focusRestoreTimer = null;
    }
    Array.prototype.forEach.call(root.document.querySelectorAll('[data-user-dialog]'), function (overlay) {
      overlay.hidden = true;
    });
    root.document.body.classList.remove('um-dialog-open');
    active = null;
    if (restoreFocus !== false && previous && previous.opener && typeof previous.opener.focus === 'function') {
      focusRestoreTimer = root.setTimeout(function () {
        focusRestoreTimer = null;
        try {
          var target = restoredOpener(previous);
          if (target && typeof target.focus === 'function') target.focus();
        } catch (error) {
          // The originating iframe may have navigated away.
        }
      }, 0);
    }
  }

  function openDialog(type, render, blocking) {
    var token = ++openNonce;
    var context = captureContext();
    return ensureDialogs().then(function () {
      if (token !== openNonce) return;
      if (active && active.type === 'csv') csvSessionGate.next();
      hideAll(false);
      active = {
        type: type,
        overlay: overlayFor(type),
        blocking: Boolean(blocking),
        frame: context.frame,
        frameWindow: context.frameWindow,
        hooks: context.hooks,
        opener: context.opener,
        navigationGeneration: navigationGeneration
      };
      render();
      active.overlay.hidden = false;
      root.document.body.classList.add('um-dialog-open');
      focusFirst(active.overlay);
    });
  }

  function closeActive(restoreFocus) {
    openNonce += 1;
    csvSessionGate.next();
    hideAll(restoreFocus);
  }

  function hooksAvailable(method) {
    return active && active.hooks && typeof active.hooks[method] === 'function';
  }

  function invokeHook(method, args, allowVoid) {
    if (!hooksAvailable(method)) {
      return { ok: false, error: '当前页面未提供“' + method + '”操作，请刷新后重试。', value: null };
    }
    try {
      var result = active.hooks[method].apply(active.hooks, args || []);
      var normalized = normalizeHookResult(result, allowVoid);
      if (!normalized.ok) normalized.failure = result;
      return normalized;
    } catch (error) {
      return {
        ok: false,
        error: error && error.message ? error.message : '操作执行失败，请重试。',
        value: null
      };
    }
  }

  function invokeHookAsync(method, args, allowVoid) {
    if (!hooksAvailable(method)) {
      return Promise.resolve({
        ok: false,
        error: '当前页面未提供“' + method + '”操作，请刷新后重试。',
        value: null
      });
    }
    var rawResult;
    try {
      rawResult = active.hooks[method].apply(active.hooks, args || []);
    } catch (error) {
      return Promise.resolve({
        ok: false,
        error: error && error.message ? error.message : '操作执行失败，请重试。',
        value: null
      });
    }
    return settleHookResult(rawResult, allowVoid);
  }

  function completeHookAsync(result) {
    if (!hooksAvailable('onDialogComplete')) {
      return Promise.resolve({ ok: true, error: '', value: null });
    }
    return invokeHookAsync('onDialogComplete', [result], true);
  }

  function shopifyJobSnapshot(job) {
    if (!job) {
      return {
        status: 'idle',
        processed: 0,
        total: 0,
        result: null,
        error: ''
      };
    }
    return {
      id: job.id,
      status: job.status,
      processed: job.processed,
      total: job.total,
      store: Object.assign({}, job.store),
      result: job.result ? {
        ok: job.result.ok,
        counts: Object.assign({}, job.result.counts),
        warnings: Object.assign({}, job.result.warnings)
      } : null,
      error: job.error || ''
    };
  }

  function currentPageHooks() {
    var frame = activeFrame();
    try {
      return frame && frame.contentWindow && frame.contentWindow.UserPageHooks;
    } catch (error) {
      return null;
    }
  }

  function csvJobSnapshot(job) {
    if (!job) {
      return {
        status: 'idle',
        processed: 0,
        total: 0,
        fileName: '',
        result: null,
        error: ''
      };
    }
    return {
      id: job.id,
      status: job.status,
      processed: job.processed,
      total: job.total,
      fileName: job.fileName,
      result: job.result ? {
        ok: job.result.ok,
        counts: Object.assign({}, job.result.counts),
        warnings: Object.assign({}, job.result.warnings)
      } : null,
      error: job.error || ''
    };
  }

  function notifyCsvJob(job) {
    var snapshot = csvJobSnapshot(job);
    var targets = [];
    if (job && job.hooks) targets.push(job.hooks);
    var currentHooks = currentPageHooks();
    if (currentHooks && targets.indexOf(currentHooks) === -1) targets.push(currentHooks);
    targets.forEach(function (hooks) {
      if (hooks && typeof hooks.onCsvImportProgress === 'function') {
        try {
          hooks.onCsvImportProgress(snapshot);
        } catch (error) {
          // 页面状态提示失败不应中断后台导入任务。
        }
      }
    });
  }

  function emptyCsvJobResult() {
    return {
      ok: true,
      counts: { created: 0, merged: 0, skipped: 0, failed: 0 },
      warnings: { consentDowngraded: 0 }
    };
  }

  function clearCsvJob(job) {
    if (!job || csvJob !== job) return;
    if (job.timer) root.clearTimeout(job.timer);
    if (job.dismissTimer) root.clearTimeout(job.dismissTimer);
    csvJob = null;
    notifyCsvJob(null);
  }

  function scheduleCsvJobDismiss(job) {
    if (!job || csvJob !== job || job.status !== 'completed') return;
    if (job.dismissTimer) root.clearTimeout(job.dismissTimer);
    job.dismissTimer = root.setTimeout(function () {
      if (csvJob !== job) return;
      if (active && active.type === 'csv-progress') {
        job.dismissWhenClosed = true;
        return;
      }
      clearCsvJob(job);
    }, 6000);
  }

  function finishCsvJob(job) {
    if (!job || csvJob !== job) return;
    job.status = job.systemFailure && job.result.counts.created + job.result.counts.merged === 0
      ? 'failed'
      : 'completed';
    job.finishedAt = Date.now();
    settleShopifyJobHook(job, 'onDialogComplete', [job.result], true).then(function () {
      if (csvJob !== job) return;
      notifyCsvJob(job);
      if (typeof root.showToast === 'function') {
        root.showToast(
          job.status === 'completed' ? 'success' : 'error',
          job.status === 'completed' ? 'CSV 用户导入完成' : 'CSV 用户导入失败'
        );
      }
      if (active && active.type === 'csv-progress') renderCsvProgress();
      scheduleCsvJobDismiss(job);
    });
  }

  async function processNextCsvRecord(job) {
    if (!job || csvJob !== job || ['queued', 'running'].indexOf(job.status) === -1) return;
    job.status = 'running';
    notifyCsvJob(job);
    if (job.processed >= job.total) {
      finishCsvJob(job);
      return;
    }

    var record = job.records[job.processed];
    var email = String(record && record.email || '').trim();
    if (!email) {
      job.result.counts.skipped += 1;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      job.result.counts.failed += 1;
    } else {
      var imported = await settleShopifyJobHook(job, 'importUsers', [[record], 'shopify_csv']);
      if (csvJob !== job) return;
      if (imported.ok) {
        mergeShopifyJobResult(job.result, imported.value);
      } else {
        job.result.counts.failed += 1;
        job.systemFailure = true;
        job.error = imported.error;
      }
    }
    job.processed += 1;
    notifyCsvJob(job);

    if (job.processed >= job.total) {
      finishCsvJob(job);
      return;
    }
    job.timer = root.setTimeout(function () {
      processNextCsvRecord(job);
    }, 320);
  }

  function startCsvJob(records, fileName, hooks) {
    csvJob = {
      id: 'csv-import-' + Date.now() + '-' + (++csvJobSequence),
      status: 'queued',
      processed: 0,
      total: records.length,
      records: records.slice(),
      fileName: fileName,
      hooks: hooks,
      result: emptyCsvJobResult(),
      error: '',
      systemFailure: false,
      startedAt: Date.now(),
      finishedAt: null,
      timer: null,
      dismissTimer: null,
      dismissWhenClosed: false
    };
    notifyCsvJob(csvJob);
    csvJob.timer = root.setTimeout(function () {
      processNextCsvRecord(csvJob);
    }, 180);
    return csvJob;
  }

  function notifyShopifyJob(job) {
    var snapshot = shopifyJobSnapshot(job);
    var targets = [];
    if (job && job.hooks) targets.push(job.hooks);
    var currentHooks = currentPageHooks();
    if (currentHooks && targets.indexOf(currentHooks) === -1) targets.push(currentHooks);
    targets.forEach(function (hooks) {
      if (hooks && typeof hooks.onShopifySyncProgress === 'function') {
        try {
          hooks.onShopifySyncProgress(snapshot);
        } catch (error) {
          // 页面状态提示失败不应中断后台同步任务。
        }
      }
    });
  }

  function settleShopifyJobHook(job, method, args, allowVoid) {
    if (!job || !job.hooks || typeof job.hooks[method] !== 'function') {
      return Promise.resolve({
        ok: false,
        error: '当前页面未提供“' + method + '”操作，请刷新后重试。',
        value: null
      });
    }
    var task;
    try {
      task = job.hooks[method].apply(job.hooks, args || []);
    } catch (error) {
      return Promise.resolve({
        ok: false,
        error: error && error.message ? error.message : '操作执行失败，请重试。',
        value: null
      });
    }
    return settleHookResult(task, allowVoid);
  }

  function emptyShopifyJobResult() {
    return {
      ok: true,
      counts: { created: 0, merged: 0, skipped: 0, failed: 0 },
      warnings: { consentDowngraded: 0 }
    };
  }

  function mergeShopifyJobResult(target, source) {
    var result = source || {};
    var counts = result.counts || {};
    var warnings = result.warnings || {};
    ['created', 'merged', 'skipped', 'failed'].forEach(function (key) {
      target.counts[key] += Number(counts[key]) || 0;
    });
    target.warnings.consentDowngraded += Number(warnings.consentDowngraded) || 0;
    return target;
  }

  function finishShopifyJob(job) {
    if (!job || shopifyJob !== job) return;
    var counts = job.result.counts;
    job.status = counts.failed >= job.total && job.total > 0 ? 'failed' : 'completed';
    job.finishedAt = Date.now();
    if (job.status === 'failed' && !job.error) {
      job.error = '所选用户均未同步成功，请检查连接后重试。';
    }
    settleShopifyJobHook(job, 'onDialogComplete', [job.result], true).then(function () {
      if (shopifyJob !== job) return;
      notifyShopifyJob(job);
      if (typeof root.showToast === 'function') {
        root.showToast(
          job.status === 'completed' ? 'success' : 'error',
          job.status === 'completed' ? 'Shopify 用户同步完成' : 'Shopify 用户同步失败'
        );
      }
      if (active && active.type === 'shopify-progress') {
        renderShopifyProgress();
      }
      scheduleShopifyJobDismiss(job);
    });
  }

  function clearShopifyJob(job) {
    if (!job || shopifyJob !== job) return;
    if (job.timer) root.clearTimeout(job.timer);
    if (job.dismissTimer) root.clearTimeout(job.dismissTimer);
    shopifyJob = null;
    notifyShopifyJob(null);
  }

  function scheduleShopifyJobDismiss(job) {
    if (!job || shopifyJob !== job || job.status !== 'completed') return;
    if (job.dismissTimer) root.clearTimeout(job.dismissTimer);
    job.dismissTimer = root.setTimeout(function () {
      if (shopifyJob !== job) return;
      if (active && active.type === 'shopify-progress') {
        job.dismissWhenClosed = true;
        return;
      }
      clearShopifyJob(job);
    }, 6000);
  }

  async function processNextShopifyRecord(job) {
    if (!job || shopifyJob !== job || ['queued', 'running'].indexOf(job.status) === -1) return;
    job.status = 'running';
    notifyShopifyJob(job);
    if (job.processed >= job.total) {
      finishShopifyJob(job);
      return;
    }

    var record = job.records[job.processed];
    var imported = await settleShopifyJobHook(job, 'importUsers', [[record], 'shopify_api']);
    if (shopifyJob !== job) return;
    if (imported.ok) {
      mergeShopifyJobResult(job.result, imported.value);
    } else {
      job.result.counts.failed += 1;
      job.error = imported.error;
    }
    job.processed += 1;
    notifyShopifyJob(job);

    if (job.processed >= job.total) {
      finishShopifyJob(job);
      return;
    }
    job.timer = root.setTimeout(function () {
      processNextShopifyRecord(job);
    }, 280);
  }

  function startShopifyJob(records, store, hooks) {
    shopifyJob = {
      id: 'shopify-sync-' + Date.now() + '-' + (++shopifyJobSequence),
      status: 'queued',
      processed: 0,
      total: records.length,
      records: records.slice(),
      store: Object.assign({}, store),
      hooks: hooks,
      result: emptyShopifyJobResult(),
      error: '',
      startedAt: Date.now(),
      finishedAt: null,
      timer: null,
      dismissTimer: null,
      dismissWhenClosed: false
    };
    notifyShopifyJob(shopifyJob);
    shopifyJob.timer = root.setTimeout(function () {
      processNextShopifyRecord(shopifyJob);
    }, 180);
    return shopifyJob;
  }

  function exportJobSnapshot(job) {
    if (!job) {
      return { status: 'idle', processed: 0, total: 0, scopeLabel: '', error: '' };
    }
    return {
      id: job.id,
      status: job.status,
      processed: job.processed,
      total: job.total,
      scopeLabel: job.scopeLabel,
      fileName: job.file ? job.file.fileName : '',
      error: job.error || ''
    };
  }

  function notifyExportJob(job) {
    var snapshot = exportJobSnapshot(job);
    var targets = [];
    if (job && job.hooks) targets.push(job.hooks);
    var currentHooks = currentPageHooks();
    if (currentHooks && targets.indexOf(currentHooks) === -1) targets.push(currentHooks);
    targets.forEach(function (hooks) {
      if (hooks && typeof hooks.onExportProgress === 'function') {
        try {
          hooks.onExportProgress(snapshot);
        } catch (error) {
          // 页面状态提示失败不应中断后台导出任务。
        }
      }
    });
  }

  function settleExportJobHook(job, method, args, allowVoid) {
    if (!job || !job.hooks || typeof job.hooks[method] !== 'function') {
      return Promise.resolve({
        ok: false,
        error: '当前页面未提供“' + method + '”操作，请刷新后重试。',
        value: null
      });
    }
    var task;
    try {
      task = job.hooks[method].apply(job.hooks, args || []);
    } catch (error) {
      return Promise.resolve({
        ok: false,
        error: error && error.message ? error.message : '导出文件生成失败，请重试。',
        value: null
      });
    }
    return settleHookResult(task, allowVoid);
  }

  function finishExportJob(job) {
    if (!job || exportJob !== job) return;
    job.processed = job.total;
    notifyExportJob(job);
    settleExportJobHook(job, 'prepareExportUsers', [job.scope, job.fields]).then(function (prepared) {
      if (exportJob !== job) return;
      if (!prepared.ok) {
        job.status = 'failed';
        job.error = prepared.error;
      } else {
        job.status = 'ready';
        job.file = prepared.value;
        job.error = '';
      }
      notifyExportJob(job);
      if (typeof root.showToast === 'function') {
        root.showToast(
          job.status === 'ready' ? 'success' : 'error',
          job.status === 'ready' ? '导出文件已生成，可以下载' : '导出文件生成失败'
        );
      }
      if (active && active.type === 'export-progress') renderExportProgress();
    });
  }

  function processExportJob(job) {
    if (!job || exportJob !== job || ['queued', 'running'].indexOf(job.status) === -1) return;
    job.status = 'running';
    job.tick += 1;
    job.processed = Math.min(job.total, Math.round(job.total * Math.min(job.tick, 10) / 10));
    notifyExportJob(job);
    if (job.tick >= 10) {
      finishExportJob(job);
      return;
    }
    job.timer = root.setTimeout(function () {
      processExportJob(job);
    }, 520);
  }

  function startExportJob(settings, hooks) {
    exportJob = {
      id: 'user-export-' + Date.now() + '-' + (++exportJobSequence),
      status: 'queued',
      processed: 0,
      total: Math.max(0, Number(settings.count) || 0),
      scope: settings.scope,
      scopeLabel: settings.scopeLabel,
      fields: settings.fields.slice(),
      hooks: hooks,
      tick: 0,
      timer: null,
      file: null,
      error: ''
    };
    notifyExportJob(exportJob);
    exportJob.timer = root.setTimeout(function () {
      processExportJob(exportJob);
    }, 300);
    return exportJob;
  }

  function resultCounts(result) {
    var counts = result && result.counts ? result.counts : {};
    return {
      created: Number(counts.created) || 0,
      merged: Number(counts.merged) || 0,
      skipped: Number(counts.skipped) || 0,
      failed: Number(counts.failed) || 0
    };
  }

  function resultMarkup(result) {
    var counts = resultCounts(result);
    var consentDowngraded = Number(result && result.warnings && result.warnings.consentDowngraded) || 0;
    return '<div class="um-result-grid">' +
      '<div class="um-result-card"><span>新建</span><strong>' + counts.created + '</strong></div>' +
      '<div class="um-result-card"><span>合并</span><strong>' + counts.merged + '</strong></div>' +
      '<div class="um-result-card"><span>跳过</span><strong>' + counts.skipped + '</strong></div>' +
      '<div class="um-result-card"><span>失败</span><strong>' + counts.failed + '</strong></div>' +
      '</div>' +
      (consentDowngraded
        ? '<div class="um-dialog-warning"><strong>订阅授权降级：</strong>' + consentDowngraded +
          ' 条记录缺少有效授权，已按未订阅档案导入。</div>'
        : '');
  }

  function comboMarkup(name, value, options, label) {
    if (!Array.isArray(options) || !options.length) throw new Error('自绘下拉选项不能为空');
    var normalized = options.map(function (option) {
      var optionValue = String(option.value === undefined ? '' : option.value).trim();
      if (!optionValue) throw new Error('自绘下拉真实值不能为空');
      return {
        value: optionValue,
        label: String(option.label || optionValue),
        placeholder: Boolean(option.placeholder) || optionValue === 'all' || optionValue === 'none'
      };
    });
    var selected = normalized.find(function (option) { return option.value === String(value); }) || normalized[0];
    var safeName = String(name).replace(/[^a-z0-9_-]/gi, '-');
    var listboxId = 'um-combo-list-' + safeName;
    return '<div class="um-dialog-combobox" data-dialog-combo="' + escapeHtml(name) +
      '" data-value="' + escapeHtml(selected.value) + '">' +
      '<button class="um-dialog-combobox-trigger' + (selected.placeholder ? ' is-placeholder' : '') +
      '" type="button" data-dialog-action="combo-toggle" ' +
      'aria-haspopup="listbox" aria-controls="' + listboxId +
      '" aria-expanded="false" aria-label="' + escapeHtml(label || name) + '">' +
      '<span>' + escapeHtml(selected.label) + '</span></button>' +
      '<div class="um-dialog-combobox-popover" hidden>' +
      '<input class="um-dialog-input" type="text" role="combobox" data-combo-search placeholder="搜索选项" aria-label="搜索' +
      escapeHtml(label || name) + '" aria-controls="' + listboxId +
      '" aria-expanded="true" aria-autocomplete="list" aria-activedescendant="">' +
      '<div class="um-dialog-combobox-options" id="' + listboxId + '" role="listbox">' + normalized.map(function (option, index) {
        return '<button class="um-dialog-combobox-option" id="' + listboxId + '-option-' + index +
          '" type="button" role="option" data-dialog-action="combo-option" ' +
          'data-value="' + escapeHtml(option.value) + '" data-label="' + escapeHtml(option.label) +
          '" aria-selected="' + (option.value === selected.value ? 'true' : 'false') + '">' +
          escapeHtml(option.label) + '</button>';
      }).join('') + '</div><div class="um-dialog-combobox-empty" hidden>无匹配选项</div></div></div>';
  }

  function comboVisibleOptions(combo) {
    return Array.prototype.slice.call(combo.querySelectorAll('.um-dialog-combobox-option'))
      .filter(function (option) { return !option.hidden; });
  }

  function setComboActive(combo, index) {
    var visible = comboVisibleOptions(combo);
    var search = combo.querySelector('[data-combo-search]');
    Array.prototype.forEach.call(combo.querySelectorAll('.um-dialog-combobox-option'), function (option) {
      option.classList.remove('is-active');
    });
    if (!visible.length) {
      if (search) search.setAttribute('aria-activedescendant', '');
      return;
    }
    var safeIndex = Math.max(0, Math.min(index, visible.length - 1));
    var option = visible[safeIndex];
    option.classList.add('is-active');
    if (search) search.setAttribute('aria-activedescendant', option.id);
    if (typeof option.scrollIntoView === 'function') option.scrollIntoView({ block: 'nearest' });
  }

  function closeCombo(combo, restoreFocus) {
    if (!combo) return;
    var popover = combo.querySelector('.um-dialog-combobox-popover');
    var trigger = combo.querySelector('.um-dialog-combobox-trigger');
    popover.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  }

  function closeOtherCombos(except) {
    if (!active) return;
    Array.prototype.forEach.call(active.overlay.querySelectorAll('[data-dialog-combo]'), function (combo) {
      if (combo !== except) closeCombo(combo, false);
    });
  }

  function openCombo(combo) {
    closeOtherCombos(combo);
    var popover = combo.querySelector('.um-dialog-combobox-popover');
    var trigger = combo.querySelector('.um-dialog-combobox-trigger');
    var search = combo.querySelector('[data-combo-search]');
    popover.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    var visible = comboVisibleOptions(combo);
    var selectedIndex = visible.findIndex(function (option) {
      return option.getAttribute('aria-selected') === 'true';
    });
    setComboActive(combo, selectedIndex === -1 ? 0 : selectedIndex);
    search.focus();
  }

  function handleComboKeyboard(event) {
    var combo = event.target.closest && event.target.closest('[data-dialog-combo]');
    if (!combo) return false;
    var trigger = event.target.closest('.um-dialog-combobox-trigger');
    var popover = combo.querySelector('.um-dialog-combobox-popover');
    if (trigger && popover.hidden) {
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].indexOf(event.key) === -1) return false;
      if (event.isComposing || event.keyCode === 229) return false;
      event.preventDefault();
      openCombo(combo);
      var initial = event.key === 'End' || event.key === 'ArrowUp'
        ? comboVisibleOptions(combo).length - 1
        : 0;
      setComboActive(combo, initial);
      return true;
    }
    if (popover.hidden) return false;
    var visible = comboVisibleOptions(combo);
    var activeIndex = visible.findIndex(function (option) {
      return option.classList.contains('is-active');
    });
    var action = getComboKeyAction(event, activeIndex === -1 ? 0 : activeIndex, visible.length);
    if (!action.handled) return false;
    event.preventDefault();
    if (action.close) {
      closeCombo(combo, true);
      return true;
    }
    if (action.select) {
      var selected = visible[activeIndex === -1 ? 0 : activeIndex];
      if (selected) selected.click();
      return true;
    }
    setComboActive(combo, action.index);
    return true;
  }

  function csvDefaultState() {
    return {
      step: 1,
      fileName: '',
      rows: [],
      headers: [],
      mapping: {},
      records: [],
      validation: null,
      result: null,
      error: '',
      busy: false,
      sessionToken: csvSessionGate.current()
    };
  }

  function csvMockText() {
    return [
      '名字,姓氏,邮箱（必填）,手机号,标签,订阅状态,短信营销授权,WhatsApp 营销授权',
      'Mia,Chen,mia.chen@example.com,+86 13800001001,VIP|高价值客户,已订阅,是,否',
      'Leo,\"Wang, Jr.\",leo.wang@example.com,+86 13800001002,批发客户,未订阅,否,是',
      'Ava,\"O\"\"Connor\",ava.oconnor@example.com,+1 4155550188,新品关注,已订阅,是,是',
      'Noah,Li,noah.li@example.com,,线下客户,已退订,否,否',
      'Emma,Zhou,emma.zhou@example.com,+86 13800001005,,待确认,,',
      '重复,档案,MIA.CHEN@example.com,,复购客户,未订阅,否,否'
    ].join('\r\n');
  }

  function csvTemplateText() {
    return [
      '\uFEFF邮箱（必填）,名字,姓氏,手机号,标签,订阅状态,短信营销授权,WhatsApp 营销授权',
      'mia.chen@example.com,Mia,Chen,13800001001,VIP|高价值客户,已订阅,是,否',
      'leo.wang@example.com,Leo,Wang,13800001002,批发客户,未订阅,否,是',
      "ava.oconnor@example.com,Ava,O'Connor,,新品关注,待确认,,"
    ].join('\r\n') + '\r\n';
  }

  function downloadCsvTemplate() {
    var url = root.URL.createObjectURL(new Blob([csvTemplateText()], { type: 'text/csv;charset=utf-8' }));
    var link = root.document.createElement('a');
    link.href = url;
    link.download = '用户导入模板.csv';
    root.document.body.appendChild(link);
    link.click();
    link.remove();
    root.URL.revokeObjectURL(url);
  }

  function loadCsvText(fileName, text) {
    var parsed;
    try {
      parsed = parseCsv(text);
    } catch (error) {
      state.csv.fileName = '';
      state.csv.rows = [];
      state.csv.headers = [];
      state.csv.mapping = {};
      state.csv.records = [];
      state.csv.validation = null;
      state.csv.result = null;
      state.csv.step = 1;
      state.csv.busy = false;
      state.csv.error = error && error.message
        ? error.message
        : 'CSV 格式无法解析，请检查文件后重试。';
      renderCsv();
      return false;
    }
    if (parsed.length < 2) {
      state.csv.error = '文件中没有可导入的数据行。';
      state.csv.busy = false;
      renderCsv();
      return false;
    }
    state.csv.fileName = fileName;
    state.csv.headers = parsed[0].map(function (header) { return String(header || '').trim(); });
    state.csv.rows = parsed.slice(1);
    state.csv.mapping = autoCsvMapping(state.csv.headers);
    if (state.csv.mapping.email === 'skip') {
      state.csv.fileName = '';
      state.csv.rows = [];
      state.csv.headers = [];
      state.csv.mapping = {};
      state.csv.records = [];
      state.csv.validation = null;
      state.csv.step = 1;
      state.csv.busy = false;
      state.csv.error = '未识别到邮箱列，请使用系统模板整理数据后重新上传。';
      renderCsv();
      return false;
    }
    state.csv.step = 2;
    state.csv.error = '';
    state.csv.busy = false;
    refreshCsvRecords();
    renderCsv();
    return true;
  }

  function readCsvFile(file) {
    var csvState = state.csv;
    var token = csvSessionGate.next();
    csvState.sessionToken = token;
    csvState.busy = true;
    csvState.error = '';
    renderCsv();
    var readTask;
    try {
      readTask = file.text();
    } catch (error) {
      readTask = Promise.reject(error);
    }
    return settleSessionTask(readTask, csvSessionGate, token).then(function (outcome) {
      if (!outcome.current || !active || active.type !== 'csv' || state.csv !== csvState) return false;
      return loadCsvText(file.name, outcome.value);
    }).catch(function (outcome) {
      if (!outcome.current || !active || active.type !== 'csv' || state.csv !== csvState) return false;
      csvState.busy = false;
      csvState.error = '读取 CSV 文件失败，请重新选择。';
      renderCsv();
      return false;
    });
  }

  function refreshCsvRecords() {
    state.csv.records = buildCsvRecords(state.csv.rows, state.csv.mapping);
    state.csv.validation = validateCsvRecords(state.csv.records);
  }

  function csvPreviewMarkup() {
    var preview = state.csv.records.slice(0, 5);
    return '<div class="um-dialog-table-wrap"><table class="um-dialog-table"><thead><tr>' +
      '<th>邮箱</th><th>姓名</th><th>标签</th><th>订阅状态</th><th>短信授权</th><th>WhatsApp 授权</th></tr></thead><tbody>' +
      preview.map(function (record) {
        var channels = record.marketingChannels || {};
        return '<tr><td>' + escapeHtml(record.email || '-') + '</td><td>' +
          escapeHtml([record.firstName, record.lastName].filter(Boolean).join(' ') || '-') + '</td><td>' +
          escapeHtml((record.tags || []).join('、') || '-') + '</td><td>' +
          escapeHtml(MARKETING_STATUS_LABELS[record.marketingStatus] || '-') + '</td><td>' +
          escapeHtml(channels.sms === true ? '已授权' : (channels.sms === false ? '未授权' : '-')) + '</td><td>' +
          escapeHtml(channels.whatsapp === true ? '已授权' : (channels.whatsapp === false ? '未授权' : '-')) +
          '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function renderCsvStep1() {
    return {
      title: '从 CSV 导入',
      subtitle: '上传 Shopify 客户 CSV 或系统模板',
      body: shopifyStepsMarkup(['上传文件', '数据预览'], 1) +
        '<div class="um-csv-step-content um-csv-step-upload">' +
        '<p class="um-csv-step-note">系统会自动识别模板字段；CSV 只创建或合并待激活档案，不迁移密码、社交绑定或登录会话。</p>' +
        '<div class="um-upload-zone" data-csv-drop-zone>' +
        '<div><span class="um-upload-icon" aria-hidden="true">⇧</span><strong>拖放 CSV 文件到这里</strong>' +
        '<p class="um-dialog-muted">支持 UTF-8 CSV、Shopify Customer CSV 和系统模板</p>' +
        '<div class="um-upload-actions"><button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="csv-pick"' +
        (state.csv.busy ? ' disabled' : '') + '>' + (state.csv.busy ? '正在读取…' : '选择 CSV 文件') + '</button>' +
        '<button class="um-dialog-button" type="button" data-dialog-action="csv-template">下载 CSV 模板</button>' +
        '<button class="um-dialog-button" type="button" data-dialog-action="csv-example"' +
        (state.csv.busy ? ' disabled' : '') + '>使用示例文件体验</button></div>' +
        '<input class="um-screenreader-only" id="umCsvFileInput" type="file" accept=".csv,text/csv"></div></div>' +
        (state.csv.error ? '<div class="um-dialog-error" role="alert">' + escapeHtml(state.csv.error) + '</div>' : '') +
        '<p class="um-csv-template-note">邮箱为必填字段；模板内含 3 行虚构示例，请删除示例后填写真实数据。多个标签使用“|”分隔，营销授权填写“是”或“否”。</p></div>',
      footer: '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>'
    };
  }

  function renderCsvStep2() {
    return {
      title: '从 CSV 导入',
      subtitle: state.csv.fileName,
      body: shopifyStepsMarkup(['上传文件', '数据预览'], 2) +
        '<div class="um-csv-step-content um-csv-step-preview">' +
        '<div class="um-file-summary"><strong>' + escapeHtml(state.csv.fileName) +
        '</strong><p class="um-dialog-muted">共 ' + state.csv.rows.length + ' 行数据，系统已自动识别字段；下方预览前 5 行。</p></div>' +
        '<h3>数据预览</h3>' + csvPreviewMarkup() +
        '<p class="um-csv-template-note">逐行校验、重复合并和失败统计会在后台导入完成后统一展示。</p>' +
        (state.csv.error ? '<div class="um-dialog-error" role="alert">' + escapeHtml(state.csv.error) + '</div>' : '') +
        '</div>',
      footer: '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="csv-back">上一步</button>' +
        '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="csv-import"' +
        (state.csv.records.length && !state.csv.busy ? '' : ' disabled') + '>' +
        (state.csv.busy ? '正在创建导入任务…' : '开始导入') + '</button>'
    };
  }

  function renderCsv() {
    renderShell('csv', state.csv.step === 1 ? renderCsvStep1() : renderCsvStep2());
  }

  function shopifyDefaultState() {
    return {
      step: 1,
      authView: 'consent',
      accountEmail: SHOPIFY_AUTH_CONTEXT.accountEmail,
      loginEmail: '',
      authError: '',
      authorized: false,
      store: Object.assign({}, SHOPIFY_AUTH_CONTEXT.store),
      selected: new Set(),
      search: '',
      kind: 'all',
      status: 'all',
      result: null,
      error: '',
      busy: false
    };
  }

  function selectedShopifyStore() {
    return state.shopify && state.shopify.store
      ? state.shopify.store
      : SHOPIFY_AUTH_CONTEXT.store;
  }

  function currentShopifyRecords() {
    return filterShopifyRecords(SHOPIFY_RECORDS, {
      search: state.shopify.search,
      kind: state.shopify.kind,
      status: state.shopify.status
    });
  }

  function shopifyRecordListMarkup() {
    var records = currentShopifyRecords();
    if (!records.length) return '<div class="um-empty-panel">没有符合当前筛选条件的 Shopify 客户档案。</div>';
    return '<div class="um-shopify-list">' + records.map(function (record) {
      var checked = state.shopify.selected.has(record.id);
      return '<button class="um-shopify-record" type="button" role="checkbox" aria-checked="' +
        checked + '" data-dialog-action="shopify-toggle-record" data-shopify-record="' +
        escapeHtml(record.id) + '"><span class="um-dialog-checkbox-box" aria-hidden="true">' +
        (checked ? '✓' : '') + '</span><span class="um-shopify-record-copy"><strong>' +
        escapeHtml(record.email) +
        '</strong></span><span class="um-dialog-muted um-shopify-record-state">' +
        escapeHtml(record.profileKind === 'subscriber' ? '邮件订阅者' : '客户档案') + '<br>' +
        escapeHtml(MARKETING_STATUS_LABELS[record.marketingStatus] || '未知状态') + '</span></button>';
    }).join('') + '</div>';
  }

  function renderShopifyLogin() {
    return {
      title: '从 Shopify 导入',
      subtitle: '使用 Shopify 账号继续授权',
      shopifyStep: 1,
      shopifyView: 'auth',
      body: shopifyStepsMarkup(['Shopify 授权', '选择用户'], 1) +
        '<div class="um-shopify-step-content um-shopify-step-auth"><div class="um-shopify-auth-card"><div class="um-shopify-auth-brand">' +
        '<span class="um-shopify-auth-logo" aria-hidden="true">S</span><div><strong>登录 Shopify</strong>' +
        '<span>继续连接 ' + escapeHtml(selectedShopifyStore().name) + '</span></div></div>' +
        '<div class="um-dialog-field"><label for="umShopifyAccount">邮箱</label>' +
        '<input class="um-dialog-input" id="umShopifyAccount" type="email" value="' +
        escapeHtml(state.shopify.loginEmail) + '" ' +
        'placeholder="Shopify 账号邮箱" autocomplete="username" autofocus></div>' +
        '<div class="um-dialog-field"><label for="umShopifyPassword">密码</label>' +
        '<input class="um-dialog-input" id="umShopifyPassword" type="password" value="" ' +
        'placeholder="Shopify 账号密码" autocomplete="current-password"></div>' +
        (state.shopify.authError ? '<div class="um-dialog-error" role="alert">' +
          escapeHtml(state.shopify.authError) + '</div>' : '') +
        '<p class="um-shopify-security-note">实际接入时会跳转到 Shopify 官方登录页，账号和密码不会提交或保存到本系统。</p></div></div>',
      footer: '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="shopify-login">登录并继续</button>'
    };
  }

  function renderShopifyStep1() {
    if (state.shopify.authView === 'login') return renderShopifyLogin();
    var store = selectedShopifyStore();
    return {
      title: '从 Shopify 导入',
      subtitle: '已登录 ' + state.shopify.accountEmail,
      shopifyStep: 1,
      shopifyView: 'auth',
      body: shopifyStepsMarkup(['Shopify 授权', '选择用户'], 1) +
        '<div class="um-shopify-step-content um-shopify-step-auth"><div class="um-shopify-auth-card"><div class="um-shopify-auth-brand">' +
        '<span class="um-shopify-auth-logo" aria-hidden="true">S</span><div><strong>QVR商城后台</strong>' +
        '<span>请求连接你的 Shopify 商店</span></div></div>' +
        '<div class="um-shopify-auth-account"><span class="um-status-dot" aria-hidden="true"></span>' +
        '<div><strong>' + escapeHtml(state.shopify.accountEmail) + '</strong><span>Shopify 已登录</span></div></div>' +
        '<div class="um-shopify-store-summary"><span>授权商店</span><strong>' +
        escapeHtml(store.name) + '</strong><small>' + escapeHtml(store.domain) + '</small></div>' +
        '<div class="um-shopify-permissions"><strong>授权后，本系统可以：</strong><ul>' +
        '<li>读取客户基本资料与联系方式</li><li>读取邮件、短信及 WhatsApp 营销授权状态</li>' +
        '<li>同步所选用户并按邮箱合并已有档案</li></ul></div>' +
        '<p class="um-shopify-security-note">不会读取客户密码、Shopify 登录会话或支付信息。一个授权会话只连接当前商店。</p>' +
        (state.shopify.authError ? '<div class="um-dialog-error" role="alert">' +
          escapeHtml(state.shopify.authError) + '</div>' : '') + '</div></div>',
      footer: '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="shopify-other-account">使用其他账号</button>' +
        '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="shopify-authorize">确认授权并继续</button>'
    };
  }

  function renderShopifyStep2() {
    var records = currentShopifyRecords();
    var allCurrentSelected = records.length && records.every(function (record) {
      return state.shopify.selected.has(record.id);
    });
    return {
      title: '从 Shopify 导入',
      subtitle: selectedShopifyStore().name,
      shopifyStep: 2,
      shopifyView: 'selection',
      body: shopifyStepsMarkup(['Shopify 授权', '选择用户'], 2) +
        '<div class="um-shopify-step-content um-shopify-step-selection">' +
        '<p class="um-shopify-selection-note">API 导入只创建或合并待激活档案，不迁移密码、社交绑定或登录会话。</p>' +
        '<div class="um-selection-toolbar um-shopify-selection-toolbar"><div class="um-dialog-field"><label class="um-dialog-visually-hidden" for="umShopifySearch">搜索用户</label>' +
        '<input class="um-dialog-input" id="umShopifySearch" type="search" value="' +
        escapeHtml(state.shopify.search) + '" placeholder="搜索姓名、邮箱或手机号"></div>' +
        '<div class="um-dialog-field">' +
        comboMarkup('shopify-kind', state.shopify.kind, [
          { value: 'all', label: '全部档案' },
          { value: 'customer', label: '客户档案' },
          { value: 'subscriber', label: '邮件订阅者' }
        ], '档案范围') + '</div>' +
        '<div class="um-dialog-field">' +
        comboMarkup('shopify-status', state.shopify.status, [
          { value: 'all', label: '营销状态' },
          { value: 'subscribed', label: '已订阅' },
          { value: 'not_subscribed', label: '未订阅' },
          { value: 'unsubscribed', label: '已退订' },
          { value: 'pending', label: '待确认' },
          { value: 'invalid', label: '无效邮箱' }
        ], '营销状态') + '</div></div>' +
        '<div class="um-selection-meta"><button class="um-dialog-check-action" type="button" role="checkbox" aria-checked="' +
        Boolean(allCurrentSelected) + '" data-dialog-action="shopify-select-current"><span class="um-dialog-checkbox-box" aria-hidden="true">' +
        (allCurrentSelected ? '✓' : '') + '</span>全选（' + records.length + '）</button>' +
        '<span class="um-selection-selected">已选 ' + state.shopify.selected.size + ' 项</span>' +
        '<button class="um-selection-clear" type="button" data-dialog-action="shopify-clear"' +
        (state.shopify.selected.size ? '' : ' disabled') + '>清空</button></div>' +
        shopifyRecordListMarkup() +
        (state.shopify.error ? '<div class="um-dialog-error" role="alert">' +
          escapeHtml(state.shopify.error) + '</div>' : '') + '</div>',
      footer: '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="shopify-back-auth">上一步</button>' +
        '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="shopify-import"' +
        (state.shopify.selected.size && !state.shopify.busy ? '' : ' disabled') + '>' +
        (state.shopify.busy ? '正在创建同步任务…' : '同步所选用户') + '</button>'
    };
  }

  function progressStatusIconMarkup(statusClass) {
    if (statusClass === 'is-completed') {
      return '<span class="um-shopify-progress-icon" aria-hidden="true">' +
        '<img src="common/vendor/fontawesome-free/solid/check.svg" alt=""></span>';
    }
    if (statusClass === 'is-failed') {
      return '<span class="um-shopify-progress-icon" aria-hidden="true">' +
        '<img src="common/vendor/fontawesome-free/solid/exclamation.svg" alt=""></span>';
    }
    return '<span class="um-shopify-progress-icon" aria-hidden="true"></span>';
  }

  function renderCsvProgress() {
    var task = csvJobSnapshot(csvJob);
    var running = task.status === 'queued' || task.status === 'running';
    var completed = task.status === 'completed';
    var statusClass = completed ? 'is-completed' : (task.status === 'failed' ? 'is-failed' : 'is-running');
    var statusTitle = completed ? '导入完成' : (task.status === 'failed' ? '导入失败' : '正在后台导入');
    var statusCopy = completed
      ? 'CSV 用户已处理完成，用户列表已经更新。'
      : (task.status === 'failed'
        ? '导入任务未能完成，请查看失败原因后重新发起。'
        : '你可以关闭此窗口继续其他操作，任务会在后台持续处理。');
    var percent = task.total ? Math.min(100, Math.round(task.processed / task.total * 100)) : 0;
    renderShell('csv-progress', {
      title: 'CSV 导入进度',
      subtitle: task.fileName || 'CSV 文件',
      body: '<div class="um-shopify-step-content um-shopify-step-progress">' +
        '<div class="um-shopify-progress-status ' + statusClass + '">' +
        progressStatusIconMarkup(statusClass) + '<div><strong>' +
        statusTitle + '</strong><span>' + statusCopy + '</span></div></div>' +
        '<div class="um-shopify-progress-count"><strong>' + task.processed + ' / ' + task.total +
        '</strong><span>位用户</span></div>' +
        '<div class="um-shopify-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="' +
        task.total + '" aria-valuenow="' + task.processed + '" aria-label="CSV 用户导入进度">' +
        '<span style="width:' + percent + '%"></span></div>' +
        (running ? '<p class="um-shopify-progress-note">关闭对话框不会中断导入；可从“导入”菜单再次查看进度。</p>' : '') +
        (!running && task.result ? resultMarkup(task.result) : '') +
        (task.error ? '<div class="um-dialog-error" role="alert">' + escapeHtml(task.error) + '</div>' : '') +
        '</div>',
      footer: (running ? '' :
        '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="csv-start-new">再次导入</button>') +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="close">' +
        (running ? '关闭' : '完成') + '</button>'
    });
  }

  function shopifyProgressMarkup() {
    var sync = shopifyJobSnapshot(shopifyJob);
    var running = sync.status === 'queued' || sync.status === 'running';
    var completed = sync.status === 'completed';
    var statusClass = completed ? 'is-completed' : (sync.status === 'failed' ? 'is-failed' : 'is-running');
    var title = completed ? '同步完成' : (sync.status === 'failed' ? '同步失败' : '正在后台同步');
    var description = completed
      ? '所选 Shopify 用户已处理完成，用户列表已更新。'
      : (sync.status === 'failed'
        ? '同步任务未能完成，请查看失败原因后重新发起。'
        : '你可以关闭此窗口继续其他操作，任务会在后台持续处理。');
    var percent = sync.total ? Math.min(100, Math.round(sync.processed / sync.total * 100)) : 0;
    return '<div class="um-shopify-step-content um-shopify-step-progress">' +
      '<div class="um-shopify-progress-status ' + statusClass + '">' +
      progressStatusIconMarkup(statusClass) + '<div><strong>' +
      title + '</strong><span>' + description + '</span></div></div>' +
      '<div class="um-shopify-progress-count"><strong>' + sync.processed + ' / ' + sync.total +
      '</strong><span>位用户</span></div>' +
      '<div class="um-shopify-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="' +
      sync.total + '" aria-valuenow="' + sync.processed + '" aria-label="Shopify 用户同步进度">' +
      '<span style="width:' + percent + '%"></span></div>' +
      (running ? '<p class="um-shopify-progress-note">同步任务已在后台运行，关闭对话框不会中断任务；可从“导入”菜单再次查看进度。</p>' : '') +
      (!running && sync.result ? resultMarkup(sync.result) : '') +
      (sync.error ? '<div class="um-dialog-error" role="alert">' + escapeHtml(sync.error) + '</div>' : '') +
      '</div>';
  }

  function renderShopifyProgress() {
    var sync = shopifyJobSnapshot(shopifyJob);
    var running = sync.status === 'queued' || sync.status === 'running';
    var storeName = shopifyJob && shopifyJob.store ? shopifyJob.store.name : SHOPIFY_AUTH_CONTEXT.store.name;
    renderShell('shopify-progress', {
      title: 'Shopify 同步进度',
      subtitle: storeName,
      body: shopifyProgressMarkup(),
      footer: (running ? '' :
        '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="shopify-start-new">再次导入</button>') +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="close">' +
        (running ? '关闭' : '完成') + '</button>'
    });
  }

  function renderShopify() {
    var renderers = [
      renderShopifyStep1,
      renderShopifyStep2
    ];
    renderShell('shopify', renderers[state.shopify.step - 1]());
  }

  function marketingSelectedChannels() {
    if (!state.marketing || !state.marketing.channels) return [];
    return ['email', 'sms', 'whatsapp'].filter(function (channel) {
      return Boolean(state.marketing.channels[channel]);
    });
  }

  function marketingValidationMessage() {
    if (!marketingSelectedChannels().length) return '请至少选择一个需要更新的营销渠道。';
    return '';
  }

  function marketingValid() {
    return !marketingValidationMessage();
  }

  function marketingChannelMarkup(channel, label) {
    var checked = Boolean(state.marketing.channels[channel]);
    return '<button class="um-marketing-channel-option" type="button" role="checkbox" aria-checked="' +
      checked + '" data-dialog-action="marketing-toggle-channel" data-marketing-channel="' +
      channel + '"><span class="um-dialog-checkbox-box" aria-hidden="true">' +
      (checked ? '✓' : '') + '</span><span>' + label + '</span></button>';
  }

  function renderMarketing() {
    var count = state.marketing.ids.length;
    renderShell('marketing', {
      title: count > 1 ? '批量营销授权' : '营销授权',
      subtitle: '将为 ' + count + ' 位用户授予所选营销渠道权限',
      body: '<div class="um-marketing-channel-group"><span class="um-dialog-field-label">营销渠道 *</span>' +
        '<div class="um-marketing-channel-list" role="group" aria-label="选择营销渠道">' +
        marketingChannelMarkup('email', '客户同意接收营销电子邮件。') +
        marketingChannelMarkup('sms', '客户同意接收营销短信。') +
        marketingChannelMarkup('whatsapp', '客户同意接收 WhatsApp 营销消息。') +
        '</div></div>' +
        (state.marketing.error ? '<div class="um-dialog-error" role="alert">' +
          escapeHtml(state.marketing.error) + '</div>' : ''),
      footer: '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="marketing-confirm"' +
        (marketingValid() && !state.marketing.busy ? '' : ' disabled') + '>' +
        (state.marketing.busy ? '正在更新…' : '确认更新') + '</button>'
    });
  }

  function loadDeletionRisk() {
    var outcome;
    if (hooksAvailable('getUsers')) {
      outcome = invokeHook('getUsers', [state.deletion.ids]);
    } else if (hooksAvailable('getUser')) {
      outcome = invokeHook('getUser');
    } else {
      outcome = {
        ok: false,
        error: '当前页面未提供用户风险读取接口。',
        value: null
      };
    }
    var risk = resolveDeletionRiskState(outcome, state.deletion.ids);
    state.deletion.users = risk.users;
    state.deletion.riskStatus = risk.riskStatus;
    state.deletion.version = risk.version || '';
    state.deletion.error = risk.error;
    state.deletion.busy = false;
    renderDelete();
    if (risk.riskStatus === 'error') showParentError(risk.error);
  }

  function renderDelete() {
    if (state.deletion.riskStatus !== 'ready') {
      var reading = state.deletion.riskStatus === 'loading';
      renderShell('delete', {
        title: state.deletion.title,
        blocking: true,
        body: reading
          ? '<p class="um-delete-confirm-copy">正在检查用户关联数据，请稍候…</p>'
          : '<div class="um-dialog-error" role="alert"><strong>暂时无法确认是否可安全删除。</strong>' +
            '<p>请重试检查，或取消本次操作。</p></div>',
        footer: '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
          '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="delete-risk-retry"' +
          (reading ? ' disabled' : '') + '>' + (reading ? '正在检查…' : '重试') + '</button>'
      });
      return;
    }
    var users = state.deletion.users;
    var orderUsers = users.filter(function (user) { return Number(user.orderCount) > 0; });
    var shopifyUsers = users.filter(function (user) {
      return (user.stores && user.stores.length) || (user.externalProfiles && user.externalProfiles.length);
    });
    var risky = orderUsers.length > 0 || shopifyUsers.length > 0;
    renderShell('delete', {
      title: state.deletion.title,
      blocking: true,
      body: '<p class="um-delete-confirm-copy">' + escapeHtml(state.deletion.message) + '</p>' +
        (risky
          ? '<div class="um-dialog-warning">所选用户存在订单或 Shopify 关联，建议改为禁用账号以保留业务记录。</div>'
          : '') +
        (state.deletion.error ? '<div class="um-dialog-error" role="alert">' +
          escapeHtml(state.deletion.error) + '</div>' : ''),
      footer: ((risky || state.deletion.lockUnavailable) && hooksAvailable('disableUsers')
        ? '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="delete-disable"' +
          (state.deletion.busy ? ' disabled' : '') + '>改为禁用账号</button>'
        : '') +
        '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
        '<button class="um-dialog-button um-dialog-button-danger" type="button" data-dialog-action="delete-confirm"' +
        (state.deletion.busy || state.deletion.lockUnavailable ? ' disabled' : '') + '>' +
        (state.deletion.busy ? '正在处理…' :
          (state.deletion.lockUnavailable ? '当前无法安全删除' : '确认删除')) + '</button>'
    });
  }

  function batchTagDraft() {
    return String(state.batchTag && state.batchTag.draft || '').trim();
  }

  function batchTagValues() {
    if (!state.batchTag) return [];
    var tags = Array.isArray(state.batchTag.tags) ? state.batchTag.tags.slice() : [];
    var draft = batchTagDraft();
    if (draft && tags.indexOf(draft) === -1) tags.push(draft);
    return tags;
  }

  function batchTagValidationMessage() {
    var draft = batchTagDraft();
    if (draft.length > 40) return '每个标签名称不能超过 40 个字符。';
    if (batchTagValues().length > 20) return '一次最多添加 20 个标签。';
    return '';
  }

  function focusBatchTagInput() {
    var input = root.document.getElementById('umBatchTagInput');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }

  function commitBatchTagDraft() {
    var source = String(state.batchTag && state.batchTag.draft || '');
    var parts = source.split(/[,，]/).map(function (value) {
      return value.trim();
    }).filter(Boolean);
    if (!parts.length) {
      focusBatchTagInput();
      return false;
    }
    if (parts.some(function (tag) { return tag.length > 40; })) {
      state.batchTag.error = '每个标签名称不能超过 40 个字符。';
      renderBatchTag();
      focusBatchTagInput();
      return false;
    }
    var next = Array.isArray(state.batchTag.tags) ? state.batchTag.tags.slice() : [];
    parts.forEach(function (tag) {
      if (next.indexOf(tag) === -1) next.push(tag);
    });
    if (next.length > 20) {
      state.batchTag.error = '一次最多添加 20 个标签。';
      renderBatchTag();
      focusBatchTagInput();
      return false;
    }
    state.batchTag.tags = next;
    state.batchTag.draft = '';
    state.batchTag.error = '';
    renderBatchTag();
    focusBatchTagInput();
    return true;
  }

  function renderBatchTag() {
    if (state.batchTag.result) {
      renderShell('batch-tag', {
        title: '标签添加完成',
        subtitle: state.batchTag.ids.length + ' 位用户',
        body: '<div class="um-dialog-guidance" role="status"><strong>已完成批量标签操作。</strong>' +
          escapeHtml(state.batchTag.result.message || '') + '</div>',
        footer: '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="close">完成</button>'
      });
      return;
    }
    var draft = batchTagDraft();
    var tags = Array.isArray(state.batchTag.tags) ? state.batchTag.tags : [];
    var values = batchTagValues();
    var validationMessage = batchTagValidationMessage();
    var tagMarkup = tags.length ? tags.map(function (tag, index) {
      return '<span class="um-batch-tag-chip"><span>' + escapeHtml(tag) + '</span>' +
        '<button type="button" data-dialog-action="batch-tag-remove" data-tag-index="' + index +
        '" aria-label="移除标签 ' + escapeHtml(tag) + '">×</button></span>';
    }).join('') : '<span class="um-batch-tag-empty">已创建的标签会显示在这里</span>';
    renderShell('batch-tag', {
      title: state.batchTag.ids.length === 1 ? '为用户添加标签' : '为所选用户添加标签',
      subtitle: state.batchTag.ids.length + ' 位用户',
      body: '<div class="um-dialog-field"><label for="umBatchTagInput">标签名称 *</label>' +
        '<div class="um-batch-tag-input-row"><input class="um-dialog-input" id="umBatchTagInput" type="text" maxlength="80" autocomplete="off" autofocus ' +
        'value="' + escapeHtml(state.batchTag.draft) + '" placeholder="输入标签后按 Enter 或逗号">' +
        '<button class="um-dialog-button" type="button" data-dialog-action="batch-tag-add"' +
        (draft && draft.length <= 40 && tags.length < 20 ? '' : ' disabled') + '>添加</button></div>' +
        '<div class="um-dialog-field-help">按 Enter、中文或英文逗号创建标签，可连续添加多个；一次最多添加 20 个。</div></div>' +
        '<div class="um-batch-tag-list" aria-label="待添加标签">' + tagMarkup + '</div>' +
        '<div class="um-dialog-guidance">这些标签会一次添加到全部所选用户；用户已有的同名标签不会重复添加。</div>' +
        (validationMessage ? '<div class="um-dialog-error" role="alert">' +
          escapeHtml(validationMessage) + '</div>' : '') +
        (state.batchTag.error ? '<div class="um-dialog-error" role="alert">' +
          escapeHtml(state.batchTag.error) + '</div>' : ''),
      footer: '<button class="um-dialog-button" type="button" data-dialog-action="close"' +
        (state.batchTag.busy ? ' disabled' : '') + '>取消</button>' +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="batch-tag-confirm"' +
        (values.length && !validationMessage && !state.batchTag.busy ? '' : ' disabled') + '>' +
        (state.batchTag.busy ? '正在添加…' : '添加 ' + values.length + ' 个标签') + '</button>'
    });
  }

  function exportSelectedKeys() {
    if (!state.exportUsers) return [];
    return state.exportUsers.fields.filter(function (field) {
      return state.exportUsers.selected.has(field.key);
    }).map(function (field) { return field.key; });
  }

  function renderExportUsers() {
    var selectedKeys = exportSelectedKeys();
    var allSelected = selectedKeys.length === state.exportUsers.fields.length;
    var fieldMarkup = state.exportUsers.fields.map(function (field) {
      var checked = state.exportUsers.selected.has(field.key);
      return '<button class="um-export-field" type="button" role="checkbox" aria-checked="' +
        checked + '" data-dialog-action="export-toggle-field" data-export-field="' +
        escapeHtml(field.key) + '"><span class="um-dialog-checkbox-box" aria-hidden="true">' +
        (checked ? '✓' : '') + '</span><span>' + escapeHtml(field.label) + '</span></button>';
    }).join('');
    renderShell('export', {
      title: '导出用户',
      subtitle: state.exportUsers.scopeLabel + ' · ' + state.exportUsers.count + ' 位用户',
      body: '<div class="um-dialog-guidance">选择需要写入 CSV 的字段。内部主键、店铺标识和授权历史不会导出。</div>' +
        '<div class="um-export-selection-meta"><span>已选 ' + selectedKeys.length + ' / ' +
        state.exportUsers.fields.length + ' 个字段</span><span>' +
        '<button type="button" data-dialog-action="export-select-all"' +
        (allSelected ? ' disabled' : '') + '>全选</button>' +
        '<button type="button" data-dialog-action="export-clear"' +
        (selectedKeys.length ? '' : ' disabled') + '>清空</button></span></div>' +
        '<div class="um-export-field-grid" role="group" aria-label="选择导出字段">' +
        fieldMarkup + '</div>' +
        (selectedKeys.length ? '' : '<div class="um-dialog-error" role="alert">请至少选择一个导出字段。</div>') +
        (state.exportUsers.error ? '<div class="um-dialog-error" role="alert">' +
          escapeHtml(state.exportUsers.error) + '</div>' : ''),
      footer: '<button class="um-dialog-button" type="button" data-dialog-action="close"' +
        (state.exportUsers.busy ? ' disabled' : '') + '>取消</button>' +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="export-confirm"' +
        (selectedKeys.length && !state.exportUsers.busy ? '' : ' disabled') + '>' +
        (state.exportUsers.busy ? '正在创建任务…' : '生成导出文件') + '</button>'
    });
  }

  function renderExportProgress() {
    var task = exportJobSnapshot(exportJob);
    var running = task.status === 'queued' || task.status === 'running';
    var ready = task.status === 'ready';
    var statusClass = ready ? 'is-completed' : (task.status === 'failed' ? 'is-failed' : 'is-running');
    var statusTitle = ready ? '文件已生成' : (task.status === 'failed' ? '生成失败' : '正在生成导出文件');
    var statusCopy = ready
      ? 'CSV 文件已经准备完成，请点击下载。'
      : (task.status === 'failed'
        ? '导出任务未能完成，请关闭后重新生成。'
        : '任务正在后台处理，你可以关闭窗口继续其他操作。');
    var percent = task.total ? Math.min(100, Math.round(task.processed / task.total * 100)) : 0;
    renderShell('export-progress', {
      title: '导出进度',
      subtitle: (task.scopeLabel || '用户数据') + ' · ' + task.total + ' 位用户',
      body: '<div class="um-shopify-step-content um-shopify-step-progress">' +
        '<div class="um-shopify-progress-status ' + statusClass + '">' +
        progressStatusIconMarkup(statusClass) + '<div><strong>' +
        statusTitle + '</strong><span>' + statusCopy + '</span></div></div>' +
        '<div class="um-shopify-progress-count"><strong>' + task.processed + ' / ' + task.total +
        '</strong><span>位用户</span></div>' +
        '<div class="um-shopify-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="' +
        task.total + '" aria-valuenow="' + task.processed + '" aria-label="用户数据导出进度">' +
        '<span style="width:' + percent + '%"></span></div>' +
        (running ? '<p class="um-shopify-progress-note">这是交互原型，为方便查看动画，本次固定模拟约 6 秒；正式环境由服务端按实际任务进度更新。</p>' : '') +
        (task.error ? '<div class="um-dialog-error" role="alert">' + escapeHtml(task.error) + '</div>' : '') +
        '</div>',
      footer: (task.status === 'failed'
        ? '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="export-reset">重新导出</button>'
        : '') +
        '<button class="um-dialog-button" type="button" data-dialog-action="close">关闭</button>' +
        (ready
          ? '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="export-download">下载文件</button>'
          : '')
    });
  }

  function operationFailed(targetState, render, message) {
    targetState.busy = false;
    targetState.error = message || '操作未完成，请重试。';
    render();
    showParentError(targetState.error);
    return false;
  }

  async function completeAndClose(result, targetState, render) {
    var completion = await completeHookAsync(result);
    if (!completion.ok) return operationFailed(targetState, render, completion.error);
    closeActive(true);
    return true;
  }

  function handleComboChange(name, value) {
    if (name === 'shopify-kind') {
      state.shopify.kind = value;
      renderShopify();
      return;
    }
    if (name === 'shopify-status') {
      state.shopify.status = value;
      renderShopify();
      return;
    }
  }

  async function handleClick(event) {
    if (!active || !active.overlay.contains(event.target)) return;
    if (event.target === active.overlay) {
      if (!active.blocking) closeActive(true);
      return;
    }
    var actionTarget = event.target.closest('[data-dialog-action]');
    if (!actionTarget) return;
    var action = actionTarget.getAttribute('data-dialog-action');
    if (action === 'close') {
      if (active.type === 'csv-progress' && csvJob && csvJob.status === 'completed') {
        clearCsvJob(csvJob);
      }
      if (active.type === 'shopify-progress' && shopifyJob && shopifyJob.status === 'completed') {
        clearShopifyJob(shopifyJob);
      }
      closeActive(true);
      return;
    }
    if (action === 'combo-toggle') {
      var combo = actionTarget.closest('[data-dialog-combo]');
      var popover = combo.querySelector('.um-dialog-combobox-popover');
      if (popover.hidden) openCombo(combo);
      else closeCombo(combo, true);
      return;
    }
    if (action === 'combo-option') {
      var comboHost = actionTarget.closest('[data-dialog-combo]');
      handleComboChange(
        comboHost.getAttribute('data-dialog-combo'),
        actionTarget.getAttribute('data-value')
      );
      return;
    }
    if (action === 'csv-pick') {
      var input = root.document.getElementById('umCsvFileInput');
      if (input) input.click();
      return;
    }
    if (action === 'csv-example') {
      var exampleToken = csvSessionGate.next();
      state.csv.sessionToken = exampleToken;
      if (csvSessionGate.isCurrent(exampleToken) && active.type === 'csv') {
        loadCsvText('user-import-example.csv', csvMockText());
      }
      return;
    }
    if (action === 'csv-template') {
      downloadCsvTemplate();
      return;
    }
    if (action === 'csv-back') {
      state.csv.step = 1;
      renderCsv();
      return;
    }
    if (action === 'csv-import') {
      if (!state.csv.records.length || state.csv.busy) return;
      state.csv.busy = true;
      state.csv.error = '';
      renderCsv();
      startCsvJob(state.csv.records, state.csv.fileName, active && active.hooks);
      closeActive(true);
      return;
    }
    if (action === 'csv-start-new') {
      if (csvJob && ['queued', 'running'].indexOf(csvJob.status) !== -1) return;
      clearCsvJob(csvJob);
      state.csv = csvDefaultState();
      closeActive(false);
      root.UserDialogs.openCsvImport();
      return;
    }
    if (action === 'shopify-other-account') {
      state.shopify.authView = 'login';
      state.shopify.authError = '';
      state.shopify.authorized = false;
      renderShopify();
      return;
    }
    if (action === 'shopify-login') {
      var accountInput = root.document.getElementById('umShopifyAccount');
      var passwordInput = root.document.getElementById('umShopifyPassword');
      var accountEmail = String(accountInput && accountInput.value || '').trim().toLocaleLowerCase();
      var password = String(passwordInput && passwordInput.value || '');
      state.shopify.loginEmail = accountEmail;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail) || !password) {
        state.shopify.authError = '请输入有效的 Shopify 账号邮箱和密码。';
        renderShopify();
        return;
      }
      state.shopify.accountEmail = accountEmail;
      state.shopify.authError = '';
      state.shopify.authView = 'consent';
      renderShopify();
      return;
    }
    if (action === 'shopify-authorize') {
      state.shopify.authError = '';
      state.shopify.authorized = true;
      state.shopify.step = 2;
      state.shopify.selected = new Set();
      renderShopify();
      return;
    }
    if (action === 'shopify-back-auth') {
      state.shopify.step = 1;
      state.shopify.authView = 'consent';
      state.shopify.authorized = false;
      renderShopify();
      return;
    }
    if (action === 'shopify-clear') {
      state.shopify.selected.clear();
      renderShopify();
      return;
    }
    if (action === 'shopify-toggle-record') {
      var recordId = actionTarget.getAttribute('data-shopify-record');
      if (state.shopify.selected.has(recordId)) state.shopify.selected.delete(recordId);
      else state.shopify.selected.add(recordId);
      renderShopify();
      return;
    }
    if (action === 'shopify-select-current') {
      var currentRecords = currentShopifyRecords();
      var currentSelected = currentRecords.length > 0 && currentRecords.every(function (record) {
        return state.shopify.selected.has(record.id);
      });
      state.shopify.selected = setCurrentSelection(
        state.shopify.selected,
        currentRecords.map(function (record) { return record.id; }),
        !currentSelected
      );
      renderShopify();
      return;
    }
    if (action === 'shopify-start-new') {
      if (shopifyJob && ['queued', 'running'].indexOf(shopifyJob.status) !== -1) return;
      clearShopifyJob(shopifyJob);
      state.shopify = shopifyDefaultState();
      closeActive(false);
      root.UserDialogs.openShopifyImport();
      return;
    }
    if (action === 'shopify-import') {
      if (!state.shopify.authorized) {
        state.shopify.step = 1;
        state.shopify.authView = 'consent';
        state.shopify.authError = 'Shopify 授权已失效，请重新确认授权。';
        renderShopify();
        return;
      }
      var store = selectedShopifyStore();
      var selectedRecords = SHOPIFY_RECORDS.filter(function (record) {
        return state.shopify.selected.has(record.id);
      }).map(function (record) {
        var profile = Object.assign({}, record);
        profile.externalId = record.id;
        profile.store = {
          id: store.id,
          name: store.name,
          domain: store.domain
        };
        return profile;
      });
      if (!selectedRecords.length) {
        state.shopify.error = '请至少选择一位需要同步的 Shopify 用户。';
        renderShopify();
        return;
      }
      state.shopify.busy = true;
      state.shopify.error = '';
      renderShopify();
      startShopifyJob(selectedRecords, store, active && active.hooks);
      closeActive(true);
      return;
    }
    if (action === 'marketing-toggle-channel') {
      var marketingChannel = actionTarget.getAttribute('data-marketing-channel');
      if (['email', 'sms', 'whatsapp'].indexOf(marketingChannel) === -1) return;
      state.marketing.channels[marketingChannel] = !state.marketing.channels[marketingChannel];
      state.marketing.error = '';
      renderMarketing();
      var channelToggle = active.overlay.querySelector(
        '[data-dialog-action="marketing-toggle-channel"][data-marketing-channel="' +
        marketingChannel + '"]'
      );
      if (channelToggle) channelToggle.focus();
      return;
    }
    if (action === 'marketing-confirm') {
      if (!marketingValid()) return;
      var marketingOperationNonce = openNonce;
      var selectedMarketingChannels = marketingSelectedChannels();
      var consent = {
        source: 'admin',
        consentedAt: new Date().toISOString(),
        note: '后台营销授权'
      };
      state.marketing.busy = true;
      state.marketing.error = '';
      renderMarketing();
      var marketingChanged = 0;
      for (var channelIndex = 0; channelIndex < selectedMarketingChannels.length; channelIndex += 1) {
        var selectedMarketingChannel = selectedMarketingChannels[channelIndex];
        var marketingCall = selectedMarketingChannel === 'email'
          ? await invokeHookAsync('updateMarketing', [
              state.marketing.ids,
              'subscribed',
              consent
            ])
          : await invokeHookAsync('updateMarketingChannel', [
              state.marketing.ids,
              selectedMarketingChannel,
              true,
              consent
            ]);
        if (marketingOperationNonce !== openNonce) return;
        if (!marketingCall.ok) {
          operationFailed(state.marketing, renderMarketing, marketingCall.error);
          return;
        }
        marketingChanged += Number(marketingCall.value && marketingCall.value.changed) || 0;
      }
      await completeAndClose(
        { ok: true, changed: marketingChanged, channels: selectedMarketingChannels },
        state.marketing,
        renderMarketing
      );
      return;
    }
    if (action === 'export-toggle-field') {
      var exportField = actionTarget.getAttribute('data-export-field');
      if (state.exportUsers.selected.has(exportField)) state.exportUsers.selected.delete(exportField);
      else state.exportUsers.selected.add(exportField);
      state.exportUsers.error = '';
      renderExportUsers();
      return;
    }
    if (action === 'export-select-all') {
      state.exportUsers.selected = new Set(state.exportUsers.fields.map(function (field) { return field.key; }));
      state.exportUsers.error = '';
      renderExportUsers();
      return;
    }
    if (action === 'export-clear') {
      state.exportUsers.selected.clear();
      state.exportUsers.error = '';
      renderExportUsers();
      return;
    }
    if (action === 'export-download') {
      if (!exportJob || exportJob.status !== 'ready' || !exportJob.file) return;
      var downloadCall = await settleExportJobHook(exportJob, 'downloadPreparedExport', [exportJob.file]);
      if (!downloadCall.ok) {
        exportJob.status = 'failed';
        exportJob.error = downloadCall.error;
        notifyExportJob(exportJob);
        renderExportProgress();
        return;
      }
      exportJob = null;
      notifyExportJob(null);
      closeActive(true);
      return;
    }
    if (action === 'export-reset') {
      if (exportJob && exportJob.timer) root.clearTimeout(exportJob.timer);
      exportJob = null;
      notifyExportJob(null);
      closeActive(true);
      return;
    }
    if (action === 'export-confirm') {
      var selectedExportFields = exportSelectedKeys();
      if (!selectedExportFields.length || state.exportUsers.busy) return;
      state.exportUsers.busy = true;
      state.exportUsers.error = '';
      renderExportUsers();
      startExportJob({
        scope: state.exportUsers.scope,
        scopeLabel: state.exportUsers.scopeLabel,
        count: state.exportUsers.count,
        fields: selectedExportFields
      }, active && active.hooks);
      closeActive(true);
      return;
    }
    if (action === 'batch-tag-add') {
      commitBatchTagDraft();
      return;
    }
    if (action === 'batch-tag-remove') {
      var tagIndex = Number(actionTarget.getAttribute('data-tag-index'));
      if (!Number.isInteger(tagIndex) || tagIndex < 0 || tagIndex >= state.batchTag.tags.length) return;
      state.batchTag.tags.splice(tagIndex, 1);
      state.batchTag.error = '';
      renderBatchTag();
      focusBatchTagInput();
      return;
    }
    if (action === 'batch-tag-confirm') {
      var tags = batchTagValues();
      if (!tags.length || batchTagValidationMessage() || state.batchTag.busy) return;
      var tagOperationNonce = openNonce;
      state.batchTag.busy = true;
      state.batchTag.error = '';
      renderBatchTag();
      var tagCall = await invokeHookAsync('addTags', [state.batchTag.ids, tags]);
      if (tagOperationNonce !== openNonce) return;
      if (!tagCall.ok) {
        operationFailed(state.batchTag, renderBatchTag, tagCall.error);
        return;
      }
      var tagCompletion = await completeHookAsync(tagCall.value);
      if (tagOperationNonce !== openNonce) return;
      if (!tagCompletion.ok) {
        operationFailed(state.batchTag, renderBatchTag, tagCompletion.error);
        return;
      }
      state.batchTag.busy = false;
      state.batchTag.result = {
        message: tagCall.value && tagCall.value.message
          ? String(tagCall.value.message)
          : tags.length + ' 个标签已处理。'
      };
      renderBatchTag();
      focusFirst(active.overlay);
      return;
    }
    if (action === 'delete-risk-retry') {
      state.deletion.riskStatus = 'loading';
      state.deletion.error = '';
      state.deletion.busy = true;
      renderDelete();
      loadDeletionRisk();
      return;
    }
    if (action === 'delete-disable') {
      if (state.deletion.riskStatus !== 'ready') return;
      var disableOperationNonce = openNonce;
      state.deletion.busy = true;
      state.deletion.error = '';
      renderDelete();
      var disableCall = await invokeHookAsync('disableUsers', [state.deletion.ids]);
      if (disableOperationNonce !== openNonce) return;
      if (!disableCall.ok) {
        operationFailed(state.deletion, renderDelete, disableCall.error);
        return;
      }
      await completeAndClose(disableCall.value, state.deletion, renderDelete);
      return;
    }
    if (action === 'delete-confirm') {
      if (state.deletion.riskStatus !== 'ready' || !canPermanentlyDelete(state.deletion)) return;
      var deleteOperationNonce = openNonce;
      state.deletion.busy = true;
      state.deletion.error = '';
      renderDelete();
      var removeCall = await invokeHookAsync('removeUsersIfRiskUnchanged', [
        state.deletion.ids,
        state.deletion.users
      ]);
      if (deleteOperationNonce !== openNonce) return;
      if (!removeCall.ok) {
        if (removeCall.failure && removeCall.failure.code === 'RISK_CHANGED') {
          var changedMessage = removeCall.failure.error ||
            '用户订单或 Shopify 关联风险已发生变化。请重新查看最新风险后，再次确认永久删除。';
          loadDeletionRisk();
          if (state.deletion.riskStatus === 'ready') {
            state.deletion.error = changedMessage;
            state.deletion.busy = false;
            renderDelete();
          }
          showParentError(changedMessage);
          return;
        }
        if (removeCall.failure && removeCall.failure.code === 'LOCK_UNAVAILABLE') {
          state.deletion.lockUnavailable = true;
          operationFailed(
            state.deletion,
            renderDelete,
            removeCall.failure.error || '当前浏览器无法取得安全写锁，请改为禁用账号或重试。'
          );
          return;
        }
        operationFailed(state.deletion, renderDelete, removeCall.error);
        return;
      }
      await completeAndClose(removeCall.value, state.deletion, renderDelete);
    }
  }

  function handleInput(event) {
    if (!active || !active.overlay.contains(event.target)) return;
    if (event.target.matches('[data-combo-search]')) {
      var query = event.target.value.trim().toLocaleLowerCase();
      var combo = event.target.closest('[data-dialog-combo]');
      var visibleCount = 0;
      Array.prototype.forEach.call(
        event.target.parentNode.querySelectorAll('.um-dialog-combobox-option'),
        function (option) {
          option.hidden = option.textContent.toLocaleLowerCase().indexOf(query) === -1;
          if (!option.hidden) visibleCount += 1;
        }
      );
      var empty = combo.querySelector('.um-dialog-combobox-empty');
      if (empty) empty.hidden = visibleCount > 0;
      setComboActive(combo, 0);
      return;
    }
    if (event.target.id === 'umShopifySearch') {
      state.shopify.search = event.target.value;
      var cursor = event.target.selectionStart;
      renderShopify();
      var nextSearch = root.document.getElementById('umShopifySearch');
      if (nextSearch) {
        nextSearch.focus();
        nextSearch.setSelectionRange(cursor, cursor);
      }
      return;
    }
    if (event.target.id === 'umBatchTagInput') {
      state.batchTag.draft = event.target.value;
      state.batchTag.error = '';
      if (/[,，]/.test(state.batchTag.draft)) {
        commitBatchTagDraft();
        return;
      }
      var cursor = event.target.selectionStart;
      renderBatchTag();
      var nextTagInput = root.document.getElementById('umBatchTagInput');
      if (nextTagInput) {
        nextTagInput.focus();
        nextTagInput.setSelectionRange(cursor, cursor);
      }
      return;
    }
  }

  function handleChange(event) {
    if (!active || !active.overlay.contains(event.target)) return;
    if (event.target.id === 'umCsvFileInput' && event.target.files && event.target.files[0]) {
      readCsvFile(event.target.files[0]);
    }
  }

  function handleDragOver(event) {
    var zone = event.target.closest('[data-csv-drop-zone]');
    if (!zone || !active || active.type !== 'csv') return;
    event.preventDefault();
    zone.classList.add('is-dragging');
  }

  function handleDragLeave(event) {
    var zone = event.target.closest('[data-csv-drop-zone]');
    if (zone) zone.classList.remove('is-dragging');
  }

  function handleDrop(event) {
    var zone = event.target.closest('[data-csv-drop-zone]');
    if (!zone || !active || active.type !== 'csv') return;
    event.preventDefault();
    zone.classList.remove('is-dragging');
    var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file) return;
    readCsvFile(file);
  }

  function trapFocus(event) {
    if (!active) return;
    if (handleComboKeyboard(event)) return;
    if (active.type === 'batch-tag' && event.target.id === 'umBatchTagInput' &&
        (event.key === 'Enter' || event.key === ',' || event.key === '，') &&
        !event.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      commitBatchTagDraft();
      return;
    }
    if (event.key === 'Escape') {
      if (!active.blocking) {
        event.preventDefault();
        closeActive(true);
      }
      return;
    }
    if (event.key !== 'Tab') return;
    var focusables = Array.prototype.slice.call(active.overlay.querySelectorAll(FOCUSABLE))
      .filter(function (element) {
        return !element.hidden && element.offsetParent !== null;
      });
    if (!focusables.length) {
      event.preventDefault();
      return;
    }
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && root.document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && root.document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function bindHost(host) {
    host.addEventListener('click', handleClick);
    host.addEventListener('input', handleInput);
    host.addEventListener('change', handleChange);
    host.addEventListener('dragover', handleDragOver);
    host.addEventListener('dragleave', handleDragLeave);
    host.addEventListener('drop', handleDrop);
  }

  root.document.addEventListener('keydown', trapFocus);

  root.UserDialogs = {
    openCsvImport: function () {
      csvSessionGate.next();
      state.csv = csvDefaultState();
      state.csv.sessionToken = csvSessionGate.current();
      return openDialog('csv', renderCsv, false).catch(function () { return false; });
    },
    openCsvImportProgress: function () {
      if (!csvJob) return this.openCsvImport();
      return openDialog('csv-progress', renderCsvProgress, false).catch(function () { return false; });
    },
    getCsvImportState: function () {
      return csvJobSnapshot(csvJob);
    },
    openShopifyImport: function () {
      state.shopify = shopifyDefaultState();
      return openDialog('shopify', renderShopify, false).catch(function () { return false; });
    },
    openShopifySyncProgress: function () {
      if (!shopifyJob) return this.openShopifyImport();
      return openDialog('shopify-progress', renderShopifyProgress, false).catch(function () { return false; });
    },
    getShopifySyncState: function () {
      return shopifyJobSnapshot(shopifyJob);
    },
    openMarketingConsent: function (ids) {
      var normalizedIds = Array.isArray(ids) ? ids.filter(Boolean) : [ids].filter(Boolean);
      state.marketing = {
        ids: normalizedIds,
        channels: {
          email: false,
          sms: false,
          whatsapp: false
        },
        error: '',
        busy: false
      };
      return openDialog('marketing', renderMarketing, false).catch(function () { return false; });
    },
    openBatchTag: function (ids) {
      var normalizedIds = Array.from(new Set(
        (Array.isArray(ids) ? ids : [ids]).filter(Boolean)
      ));
      state.batchTag = {
        ids: normalizedIds,
        tags: [],
        draft: '',
        error: normalizedIds.length ? '' : '请先选择至少一位用户。',
        busy: false,
        result: null
      };
      return openDialog('batch-tag', renderBatchTag, false).catch(function () { return false; });
    },
    openExportUsers: function (options) {
      var settings = options || {};
      var seen = Object.create(null);
      var fields = (Array.isArray(settings.fields) ? settings.fields : []).filter(function (field) {
        var key = String(field && field.key || '').trim();
        if (!key || seen[key]) return false;
        seen[key] = true;
        field.key = key;
        field.label = String(field.label || key);
        return true;
      });
      state.exportUsers = {
        scope: settings.scope === 'selected' || settings.scope === 'query' ? settings.scope : 'all',
        scopeLabel: String(settings.scopeLabel || '全部用户'),
        count: Math.max(0, Number(settings.count) || 0),
        fields: fields,
        selected: new Set(fields.map(function (field) { return field.key; })),
        error: fields.length ? '' : '当前没有可导出的字段。',
        busy: false
      };
      return openDialog('export', renderExportUsers, false).catch(function () { return false; });
    },
    openExportProgress: function () {
      if (!exportJob) return Promise.resolve(false);
      return openDialog('export-progress', renderExportProgress, false).catch(function () { return false; });
    },
    getExportTaskState: function () {
      return exportJobSnapshot(exportJob);
    },
    openDeleteConfirm: function (options) {
      var settings = options || {};
      var ids = Array.isArray(settings.ids) ? settings.ids.filter(Boolean) : [];
      state.deletion = {
        ids: ids,
        title: settings.title || '确认删除',
        message: settings.message || (ids.length > 1
          ? '删除后，所选 ' + ids.length + ' 位用户的档案及营销授权记录将永久移除，且无法恢复。'
          : '删除后，该用户的档案及营销授权记录将永久移除，且无法恢复。'),
        users: [],
        riskStatus: 'loading',
        version: '',
        error: '',
        lockUnavailable: false,
        busy: false
      };
      return openDialog('delete', function () {
        renderDelete();
        loadDeletionRisk();
      }, true).catch(function () { return false; });
    },
    closeAll: function (options) {
      closeActive(!(options && options.restoreFocus === false));
    },
    openMarketing: function (ids) {
      return this.openMarketingConsent(ids);
    },
    openConsent: function (ids) {
      return this.openMarketingConsent(ids);
    },
    getState: function () {
      return {
        activeType: active && active.type,
        csv: state.csv,
        shopify: state.shopify,
        marketing: state.marketing,
        batchTag: state.batchTag,
        exportUsers: state.exportUsers,
        deletion: state.deletion
      };
    }
  };

  var previousNavigate = root.adOnNavigate;
  root.adOnNavigate = function () {
    navigationGeneration += 1;
    root.UserDialogs.closeAll({ restoreFocus: false });
    if (typeof previousNavigate === 'function') previousNavigate();
  };
})(typeof window !== 'undefined' ? window : globalThis);
