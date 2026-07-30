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

  var CONNECTED_STORES = [
    {
      id: 'store-north',
      name: 'Rebecca 北美旗舰店',
      domain: 'rebecca-north.myshopify.com',
      state: '已连接',
      connectionState: 'connected',
      lastSyncAt: '2026-07-29 09:18'
    },
    {
      id: 'store-eu',
      name: 'Rebecca 欧洲站',
      domain: 'rebecca-eu.myshopify.com',
      state: '已连接',
      connectionState: 'connected',
      lastSyncAt: '2026-07-28 21:06'
    },
    {
      id: 'store-outlet',
      name: 'Rebecca Outlet',
      domain: 'rebecca-outlet.myshopify.com',
      state: '已连接',
      connectionState: 'connected',
      lastSyncAt: '2026-07-29 08:42'
    }
  ];

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
      mapping[field.key] = matchedIndex === -1 ? (field.required ? '0' : 'skip') : String(matchedIndex);
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
    loadPromise = root.fetch('common/html/user_dialogs.html?v=11')
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
    return '\uFEFF邮箱（必填）,名字,姓氏,手机号,标签,订阅状态,短信营销授权,WhatsApp 营销授权\r\n';
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

  function csvMappingMarkup() {
    var headerOptions = state.csv.headers.map(function (header, index) {
      return { value: String(index), label: header || ('第 ' + (index + 1) + ' 列') };
    });
    return '<div class="um-dialog-form-grid">' + CSV_FIELDS.map(function (field) {
      var options = field.required ? headerOptions : [{ value: 'skip', label: '不导入此字段' }].concat(headerOptions);
      return '<div class="um-dialog-field"><span class="um-dialog-field-label">' +
        escapeHtml(field.label) + (field.required ? ' *' : '') + '</span>' +
        comboMarkup('csv-' + field.key, state.csv.mapping[field.key], options, field.label + '字段映射') +
        '</div>';
    }).join('') + '</div>';
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
      title: 'CSV 导入用户',
      subtitle: '上传 Shopify 客户 CSV 或本系统模板',
      body: stepsMarkup(['上传文件', '校验与映射', '确认结果'], 1) +
        '<div class="um-dialog-guidance"><strong>身份边界：</strong>CSV 只能导入客户资料、标签、订阅状态和营销授权，不能迁移 Shopify 密码或快捷登录绑定。导入用户将以待激活状态保存。</div>' +
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
        '<p class="um-dialog-section-copy">邮箱为必填字段；模板同时支持名字、姓氏、手机号、标签、订阅状态、短信营销授权和 WhatsApp 营销授权。多个标签使用“|”分隔；订阅状态支持已订阅、未订阅、待确认、已退订和无效邮箱，营销授权填写“是”或“否”；邮件渠道授权由订阅状态表达。</p>',
      footer: '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>'
    };
  }

  function renderCsvStep2() {
    var validation = state.csv.validation;
    return {
      title: '校验并映射字段',
      subtitle: state.csv.fileName,
      body: stepsMarkup(['上传文件', '校验与映射', '确认结果'], 2) +
        '<div class="um-file-summary"><strong>' + escapeHtml(state.csv.fileName) +
        '</strong><p class="um-dialog-muted">已读取 ' + state.csv.rows.length + ' 行数据；下方仅预览前 5 行。</p></div>' +
        '<div class="um-summary-grid">' +
        '<div class="um-summary-card"><span>有效邮箱</span><strong>' + validation.valid + '</strong></div>' +
        '<div class="um-summary-card"><span>缺失邮箱</span><strong>' + validation.missingEmail + '</strong></div>' +
        '<div class="um-summary-card"><span>无效邮箱</span><strong>' + validation.invalidEmail + '</strong></div>' +
        '<div class="um-summary-card"><span>文件内重复</span><strong>' + validation.duplicates + '</strong></div>' +
        '</div>' +
        '<div class="um-dialog-guidance">邮箱是唯一必填字段。订阅状态与短信、WhatsApp 营销授权留空时，不覆盖现有用户的对应状态；系统自动记录 CSV 导入来源和操作时间。</div>' +
        '<h3>字段映射</h3><p class="um-dialog-section-copy">每个下拉都可以搜索 CSV 列名。</p>' +
        csvMappingMarkup() + '<h3>数据预览</h3>' + csvPreviewMarkup(),
      footer: '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="csv-back">上一步</button>' +
        '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="csv-review"' +
        (validation.valid ? '' : ' disabled') + '>继续确认</button>'
    };
  }

  function renderCsvStep3() {
    var result = state.csv.result;
    return {
      title: result ? 'CSV 导入完成' : '确认 CSV 导入',
      subtitle: state.csv.fileName,
      body: stepsMarkup(['上传文件', '校验与映射', '确认结果'], 3) +
        (result
          ? resultMarkup(result) +
            '<div class="um-dialog-guidance">导入只创建或合并待激活客户档案；现有本地登录身份、社交绑定和会话均未改变。</div>'
          : '<div class="um-rule-card"><strong>合并规则</strong><ul class="um-risk-list">' +
            '<li>按标准化邮箱匹配，相同邮箱合并到一条用户档案。</li>' +
            '<li>新用户以待激活状态保存，不创建或迁移密码。</li>' +
            '<li>订阅状态和营销授权按模板值导入，来源与操作时间由系统自动记录。</li>' +
            '<li>客户编号、账号状态、登录方式、用户来源和交易数据均不允许通过 CSV 覆盖。</li>' +
            '<li>无效邮箱会计入失败，缺失邮箱会计入跳过。</li></ul></div>' +
            '<div class="um-summary-grid"><div class="um-summary-card"><span>准备导入</span><strong>' +
            state.csv.records.length + '</strong></div><div class="um-summary-card"><span>有效邮箱</span><strong>' +
            state.csv.validation.valid + '</strong></div><div class="um-summary-card"><span>预计跳过</span><strong>' +
            state.csv.validation.missingEmail +
            '</strong></div><div class="um-summary-card"><span>预计失败</span><strong>' +
            state.csv.validation.invalidEmail + '</strong></div></div>' +
            (state.csv.error ? '<div class="um-dialog-error" role="alert">' + escapeHtml(state.csv.error) + '</div>' : '')),
      footer: result
        ? '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="close">完成</button>'
        : '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="csv-edit">返回映射</button>' +
          '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
          '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="csv-import"' +
          (state.csv.busy ? ' disabled' : '') + '>' + (state.csv.busy ? '正在导入…' : '开始导入') + '</button>'
    };
  }

  function renderCsv() {
    var config = state.csv.step === 1
      ? renderCsvStep1()
      : (state.csv.step === 2 ? renderCsvStep2() : renderCsvStep3());
    renderShell('csv', config);
  }

  function shopifyDefaultState() {
    return {
      step: 1,
      connectionView: 'list',
      domain: '',
      domainError: '',
      connectionNotice: '',
      newlyConnectedStore: null,
      selectedStoreId: '',
      selected: new Set(),
      search: '',
      kind: 'all',
      status: 'all',
      result: null,
      error: '',
      busy: false
    };
  }

  function shopifyStores() {
    var newlyConnectedStore = state.shopify && state.shopify.newlyConnectedStore;
    if (!newlyConnectedStore) return CONNECTED_STORES;
    return [newlyConnectedStore].concat(CONNECTED_STORES.filter(function (store) {
      return store.domain !== newlyConnectedStore.domain;
    }));
  }

  function selectedStore() {
    return shopifyStores().find(function (store) {
      return store.id === state.shopify.selectedStoreId;
    }) || null;
  }

  function currentShopifyRecords() {
    return filterShopifyRecords(SHOPIFY_RECORDS, {
      search: state.shopify.search,
      kind: state.shopify.kind,
      status: state.shopify.status
    });
  }

  function storeListMarkup() {
    return '<div class="um-store-list">' + shopifyStores().map(function (store) {
      var selected = store.id === state.shopify.selectedStoreId;
      var connected = store.connectionState === 'connected';
      return '<button class="um-store-row' + (selected ? ' is-selected' : '') +
        '" type="button" data-dialog-action="shopify-store" data-store-id="' + escapeHtml(store.id) +
        '" aria-pressed="' + selected + '"' + (connected ? '' : ' disabled') +
        '><span class="um-status-dot' + (connected ? '' : ' is-warning') +
        '" aria-hidden="true"></span><span class="um-store-row-copy"><strong>' +
        escapeHtml(store.name) + '</strong><span>' + escapeHtml(store.domain) +
        '</span></span><span class="um-dialog-muted">' + escapeHtml(store.state) +
        '<br>上次同步 ' + escapeHtml(store.lastSyncAt) + '</span></button>';
    }).join('') + '</div>';
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
        escapeHtml(record.firstName + ' ' + record.lastName) + '</strong><span>' +
        escapeHtml(record.email) + (record.phone ? ' · ' + escapeHtml(record.phone) : '') +
        '</span></span><span class="um-dialog-muted">' +
        escapeHtml(record.profileKind === 'subscriber' ? '邮件订阅者' : '客户档案') + '<br>' +
        escapeHtml(MARKETING_STATUS_LABELS[record.marketingStatus] || '未知状态') + '</span></button>';
    }).join('') + '</div>';
  }

  function renderShopifyConnectForm() {
    return {
      title: '连接新的 Shopify 店铺',
      subtitle: '一个域名对应一个店铺，且必须单独完成授权',
      body: shopifyStepsMarkup(['选择店铺', '选择用户', '导入结果'], 1) +
        '<div class="um-dialog-guidance"><strong>生产环境流程：</strong>输入域名仅用于定位店铺；点击后将跳转 Shopify 安装/授权页，商家确认权限并返回本系统、成功取得该店访问令牌后，才会建立连接。</div>' +
        '<div class="um-dialog-warning">当前页面是交互原型，因此下一步只模拟 OAuth 成功。每个 <code>*.myshopify.com</code> 域名只代表一家店，不能据此发现或读取同一商家的其他店铺。</div>' +
        '<div class="um-dialog-field"><label for="umShopifyDomain">Shopify 店铺域名</label>' +
        '<input class="um-dialog-input" id="umShopifyDomain" type="text" value="' +
        escapeHtml(state.shopify.domain) + '" placeholder="your-store.myshopify.com" autocomplete="off" autofocus>' +
        (state.shopify.domainError ? '<div class="um-dialog-error" role="alert">' +
          escapeHtml(state.shopify.domainError) + '</div>' : '') + '</div>',
      footer: '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="shopify-back-connect">返回店铺列表</button>' +
        '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="shopify-connect">模拟 Shopify 授权</button>'
    };
  }

  function renderShopifyStep1() {
    if (state.shopify.connectionView === 'connect') return renderShopifyConnectForm();
    return {
      title: '选择已连接店铺',
      subtitle: '每个条目都已针对单个店铺分别完成授权',
      body: shopifyStepsMarkup(['选择店铺', '选择用户', '导入结果'], 1) +
        '<div class="um-dialog-guidance">以下店铺来自本系统保存的连接记录，不是根据某个域名从 Shopify 自动查出的店铺。要添加其他店铺，请逐店完成授权。</div>' +
        (state.shopify.connectionNotice ? '<div class="um-dialog-guidance">' +
          escapeHtml(state.shopify.connectionNotice) + '</div>' : '') +
        storeListMarkup(),
      footer: '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="shopify-connect-new">连接新店铺</button>' +
        '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="shopify-records"' +
        (state.shopify.selectedStoreId ? '' : ' disabled') + '>选择客户档案</button>'
    };
  }

  function renderShopifyStep2() {
    var records = currentShopifyRecords();
    var allCurrentSelected = records.length && records.every(function (record) {
      return state.shopify.selected.has(record.id);
    });
    return {
      title: '选择 Shopify 客户档案',
      subtitle: selectedStore() ? selectedStore().name : '',
      body: shopifyStepsMarkup(['选择店铺', '选择用户', '导入结果'], 2) +
        '<div class="um-dialog-guidance">CSV/API 导入只创建或合并待激活档案，不迁移密码、社交绑定或登录会话。</div>' +
        '<div class="um-selection-toolbar"><div class="um-dialog-field"><label for="umShopifySearch">搜索用户</label>' +
        '<input class="um-dialog-input" id="umShopifySearch" type="search" value="' +
        escapeHtml(state.shopify.search) + '" placeholder="姓名、邮箱或手机号"></div>' +
        '<div class="um-dialog-field"><span class="um-dialog-field-label">档案范围</span>' +
        comboMarkup('shopify-kind', state.shopify.kind, [
          { value: 'all', label: '全部档案' },
          { value: 'customer', label: '客户档案' },
          { value: 'subscriber', label: '邮件订阅者' }
        ], '档案范围') + '</div>' +
        '<div class="um-dialog-field"><span class="um-dialog-field-label">营销状态</span>' +
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
        (allCurrentSelected ? '✓' : '') + '</span> 全选当前筛选结果（' + records.length + '）</button>' +
        '<span>已选 ' + state.shopify.selected.size +
        ' 项 <button type="button" data-dialog-action="shopify-clear">清空全部</button></span></div>' +
        shopifyRecordListMarkup() +
        (state.shopify.error ? '<div class="um-dialog-error" role="alert">' +
          escapeHtml(state.shopify.error) + '</div>' : ''),
      footer: '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="shopify-back-stores">上一步</button>' +
        '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="shopify-import"' +
        (state.shopify.selected.size && !state.shopify.busy ? '' : ' disabled') + '>' +
        (state.shopify.busy ? '正在导入…' : '导入所选用户') + '</button>'
    };
  }

  function renderShopifyStep3() {
    return {
      title: 'Shopify 导入完成',
      subtitle: selectedStore() ? selectedStore().name : '',
      body: shopifyStepsMarkup(['选择店铺', '选择用户', '导入结果'], 3) +
        resultMarkup(state.shopify.result) +
        '<div class="um-dialog-guidance">所有新建档案均为待激活状态；相同邮箱已合并，未迁移 Shopify 密码、快捷登录绑定或会话。</div>',
      footer: '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="close">完成</button>'
    };
  }

  function renderShopify() {
    var renderers = [
      renderShopifyStep1,
      renderShopifyStep2,
      renderShopifyStep3
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
        (state.exportUsers.busy ? '正在导出…' : '导出 CSV') + '</button>'
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
    if (name.indexOf('csv-') === 0) {
      state.csv.mapping[name.slice(4)] = value;
      refreshCsvRecords();
      renderCsv();
      return;
    }
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
    if (action === 'csv-review') {
      state.csv.step = 3;
      renderCsv();
      return;
    }
    if (action === 'csv-edit') {
      state.csv.step = 2;
      renderCsv();
      return;
    }
    if (action === 'csv-import') {
      var csvOperationNonce = openNonce;
      state.csv.busy = true;
      state.csv.error = '';
      renderCsv();
      var importableRecords = state.csv.records.filter(function (record) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email || '');
      });
      var csvImport = await invokeHookAsync('importUsers', [importableRecords, 'shopify_csv']);
      if (csvOperationNonce !== openNonce) return;
      if (!csvImport.ok) {
        operationFailed(state.csv, renderCsv, csvImport.error);
        return;
      }
      var csvResult = mergeCsvImportResult(csvImport.value, state.csv.validation);
      var csvCompletion = await completeHookAsync(csvResult);
      if (csvOperationNonce !== openNonce) return;
      if (!csvCompletion.ok) {
        operationFailed(state.csv, renderCsv, csvCompletion.error);
        return;
      }
      state.csv.busy = false;
      state.csv.result = csvResult;
      renderCsv();
      return;
    }
    if (action === 'shopify-connect-new') {
      state.shopify.connectionView = 'connect';
      state.shopify.domainError = '';
      renderShopify();
      return;
    }
    if (action === 'shopify-connect') {
      var domainInput = root.document.getElementById('umShopifyDomain');
      var domain = String(domainInput && domainInput.value || '').trim().toLocaleLowerCase();
      state.shopify.domain = domain;
      if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain)) {
        state.shopify.domainError = '请输入有效的 *.myshopify.com 店铺域名。';
        renderShopify();
        return;
      }
      state.shopify.domainError = '';
      var existingStore = CONNECTED_STORES.find(function (store) {
        return store.domain === domain;
      });
      if (existingStore) {
        state.shopify.selectedStoreId = existingStore.id;
      } else {
        state.shopify.newlyConnectedStore = {
          id: 'store-newly-connected',
          name: domain.split('.')[0] + '（新连接）',
          domain: domain,
          state: '已连接',
          connectionState: 'connected',
          lastSyncAt: '尚未同步'
        };
        state.shopify.selectedStoreId = state.shopify.newlyConnectedStore.id;
      }
      state.shopify.connectionNotice = '已模拟完成 ' + domain +
        ' 的单店授权；生产环境须在 Shopify 授权回调成功后才可保存该连接。';
      state.shopify.connectionView = 'list';
      renderShopify();
      return;
    }
    if (action === 'shopify-back-connect') {
      state.shopify.connectionView = 'list';
      state.shopify.domainError = '';
      renderShopify();
      return;
    }
    if (action === 'shopify-store') {
      var chosenStore = shopifyStores().find(function (store) {
        return store.id === actionTarget.getAttribute('data-store-id');
      });
      if (!chosenStore || chosenStore.connectionState !== 'connected') return;
      state.shopify.selectedStoreId = chosenStore.id;
      state.shopify.selected = new Set();
      renderShopify();
      return;
    }
    if (action === 'shopify-records') {
      state.shopify.step = 2;
      renderShopify();
      return;
    }
    if (action === 'shopify-back-stores') {
      state.shopify.step = 1;
      state.shopify.connectionView = 'list';
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
    if (action === 'shopify-import') {
      var shopifyOperationNonce = openNonce;
      var store = selectedStore();
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
      state.shopify.busy = true;
      state.shopify.error = '';
      renderShopify();
      var shopifyImport = await invokeHookAsync('importUsers', [selectedRecords, 'shopify_api']);
      if (shopifyOperationNonce !== openNonce) return;
      if (!shopifyImport.ok) {
        operationFailed(state.shopify, renderShopify, shopifyImport.error);
        return;
      }
      var shopifyCompletion = await completeHookAsync(shopifyImport.value);
      if (shopifyOperationNonce !== openNonce) return;
      if (!shopifyCompletion.ok) {
        operationFailed(state.shopify, renderShopify, shopifyCompletion.error);
        return;
      }
      state.shopify.busy = false;
      state.shopify.result = shopifyImport.value;
      state.shopify.step = 3;
      renderShopify();
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
    if (action === 'export-confirm') {
      var selectedExportFields = exportSelectedKeys();
      if (!selectedExportFields.length || state.exportUsers.busy) return;
      var exportOperationNonce = openNonce;
      state.exportUsers.busy = true;
      state.exportUsers.error = '';
      renderExportUsers();
      var exportCall = await invokeHookAsync('exportUsers', [
        state.exportUsers.scope,
        selectedExportFields
      ]);
      if (exportOperationNonce !== openNonce) return;
      if (!exportCall.ok) {
        operationFailed(state.exportUsers, renderExportUsers, exportCall.error);
        return;
      }
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
    openShopifyImport: function () {
      state.shopify = shopifyDefaultState();
      return openDialog('shopify', renderShopify, false).catch(function () { return false; });
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
