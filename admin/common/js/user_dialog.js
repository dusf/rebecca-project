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
    { key: 'email', label: '邮箱', required: true, aliases: ['email', 'email address', '邮箱', '电子邮箱'] },
    { key: 'firstName', label: '名字', aliases: ['first name', 'firstname', '名字', '名'] },
    { key: 'lastName', label: '姓氏', aliases: ['last name', 'lastname', '姓氏', '姓'] },
    { key: 'phone', label: '手机号', aliases: ['phone', 'phone number', '手机号', '电话'] },
    {
      key: 'marketingStatus',
      label: '邮件营销状态',
      aliases: ['email marketing consent state', 'accepts email marketing', 'marketing status', '邮件营销状态', '接受邮件营销']
    },
    {
      key: 'consentSource',
      label: '同意来源',
      aliases: ['consent source', 'marketing consent source', '同意来源', '授权来源']
    },
    {
      key: 'consentedAt',
      label: '同意时间',
      aliases: ['email marketing consent updated at', 'consented at', 'consent time', '同意时间', '授权时间']
    }
  ];

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
    return 'not_subscribed';
  }

  function parseConsentDateTime(value) {
    var text = String(value || '').trim();
    var parts = text.match(
      /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:?\d{2})?$/
    );
    if (!parts) return '';
    var year = Number(parts[1]);
    var month = Number(parts[2]);
    var day = Number(parts[3]);
    var hour = Number(parts[4]);
    var minute = Number(parts[5]);
    var second = Number(parts[6] || 0);
    var daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (month < 1 || month > 12 || day < 1 || day > daysInMonth ||
        hour > 23 || minute > 59 || second > 59) return '';
    var date = new Date(text);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
  }

  function buildCsvRecords(rows, mapping) {
    return rows.map(function (row) {
      var requestedStatus = normalizeMarketingStatus(csvValue(row, mapping.marketingStatus));
      var source = csvValue(row, mapping.consentSource);
      var consentedAt = csvValue(row, mapping.consentedAt);
      var parsedConsentedAt = parseConsentDateTime(consentedAt);
      var record = {
        email: csvValue(row, mapping.email).toLocaleLowerCase(),
        firstName: csvValue(row, mapping.firstName),
        lastName: csvValue(row, mapping.lastName),
        phone: csvValue(row, mapping.phone),
        marketingStatus: requestedStatus
      };
      if (requestedStatus === 'subscribed' && source && parsedConsentedAt) {
        record.consent = { source: source, consentedAt: parsedConsentedAt, note: 'CSV 导入授权记录' };
      } else if (requestedStatus === 'subscribed') {
        record.marketingStatus = 'not_subscribed';
        record.importIssue = consentedAt && !parsedConsentedAt
          ? 'invalid_consent_time'
          : 'missing_consent';
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
    var consentMissing = 0;
    var consentInvalid = 0;
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
      if (record.importIssue === 'missing_consent') consentMissing += 1;
      if (record.importIssue === 'invalid_consent_time') consentInvalid += 1;
    });
    return {
      total: records.length,
      valid: valid,
      invalid: invalid,
      missingEmail: missingEmail,
      invalidEmail: invalidEmail,
      duplicates: duplicates,
      consentMissing: consentMissing,
      consentInvalid: consentInvalid
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
    var idSet = new Set(Array.isArray(ids) ? ids : []);
    return {
      riskStatus: 'ready',
      users: users.filter(function (user) {
        return user && idSet.has(user.id);
      }),
      error: ''
    };
  }

  function canPermanentlyDelete(deletion) {
    return Boolean(deletion && deletion.riskStatus === 'ready' && !deletion.busy);
  }

  function mergeCsvImportResult(result, validation) {
    var source = result || {};
    var counts = source.counts || {};
    var review = validation || {};
    return Object.assign({}, source, {
      counts: {
        created: Number(counts.created) || 0,
        merged: Number(counts.merged) || 0,
        skipped: (Number(counts.skipped) || 0) +
          (Number(review.missingEmail) || 0) +
          (Number(review.consentMissing) || 0) +
          (Number(review.consentInvalid) || 0),
        failed: (Number(counts.failed) || 0) + (Number(review.invalidEmail) || 0)
      }
    });
  }

  var exported = {
    parseCsv: parseCsv,
    parseConsentDateTime: parseConsentDateTime,
    autoCsvMapping: autoCsvMapping,
    buildCsvRecords: buildCsvRecords,
    validateCsvRecords: validateCsvRecords,
    filterShopifyRecords: filterShopifyRecords,
    setCurrentSelection: setCurrentSelection,
    createSessionGate: createSessionGate,
    settleSessionTask: settleSessionTask,
    getComboKeyAction: getComboKeyAction,
    canRestoreFocus: canRestoreFocus,
    normalizeHookResult: normalizeHookResult,
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
    loadPromise = root.fetch('common/html/user_dialogs.html')
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
      return normalizeHookResult(active.hooks[method].apply(active.hooks, args || []), allowVoid);
    } catch (error) {
      return {
        ok: false,
        error: error && error.message ? error.message : '操作执行失败，请重试。',
        value: null
      };
    }
  }

  function completeHook(result) {
    if (!hooksAvailable('onDialogComplete')) return { ok: true, error: '', value: null };
    return invokeHook('onDialogComplete', [result], true);
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
    return '<div class="um-result-grid">' +
      '<div class="um-result-card"><span>新建</span><strong>' + counts.created + '</strong></div>' +
      '<div class="um-result-card"><span>合并</span><strong>' + counts.merged + '</strong></div>' +
      '<div class="um-result-card"><span>跳过</span><strong>' + counts.skipped + '</strong></div>' +
      '<div class="um-result-card"><span>失败</span><strong>' + counts.failed + '</strong></div>' +
      '</div>';
  }

  function comboMarkup(name, value, options, label) {
    if (!Array.isArray(options) || !options.length) throw new Error('自绘下拉选项不能为空');
    var normalized = options.map(function (option) {
      var optionValue = String(option.value === undefined ? '' : option.value).trim();
      if (!optionValue) throw new Error('自绘下拉真实值不能为空');
      return { value: optionValue, label: String(option.label || optionValue) };
    });
    var selected = normalized.find(function (option) { return option.value === String(value); }) || normalized[0];
    var safeName = String(name).replace(/[^a-z0-9_-]/gi, '-');
    var listboxId = 'um-combo-list-' + safeName;
    return '<div class="um-dialog-combobox" data-dialog-combo="' + escapeHtml(name) +
      '" data-value="' + escapeHtml(selected.value) + '">' +
      '<button class="um-dialog-combobox-trigger" type="button" data-dialog-action="combo-toggle" ' +
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
      'First Name,Last Name,Email,Phone,Accepts Email Marketing,Consent Source,Consented At',
      'Mia,Chen,mia.chen@example.com,+86 13800001001,yes,checkout,2026-07-12T09:30:00.000Z',
      'Leo,\"Wang, Jr.\",leo.wang@example.com,+86 13800001002,no,,',
      'Ava,\"O\"\"Connor\",ava.oconnor@example.com,+1 4155550188,yes,footer,2026-07-15T11:20:00.000Z',
      'Noah,Li,noah.li@example.com,,unsubscribed,,',
      'Emma,Zhou,emma.zhou@example.com,+86 13800001005,pending,,',
      '重复,档案,MIA.CHEN@example.com,,no,,'
    ].join('\r\n');
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
      '<th>邮箱</th><th>名字</th><th>姓氏</th><th>手机号</th><th>营销状态</th></tr></thead><tbody>' +
      preview.map(function (record) {
        return '<tr><td>' + escapeHtml(record.email || '—') + '</td><td>' +
          escapeHtml(record.firstName || '—') + '</td><td>' +
          escapeHtml(record.lastName || '—') + '</td><td>' +
          escapeHtml(record.phone || '—') + '</td><td>' +
          escapeHtml(record.marketingStatus) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function renderCsvStep1() {
    return {
      title: 'CSV 导入用户',
      subtitle: '上传 Shopify 客户 CSV 或本系统模板',
      body: stepsMarkup(['上传文件', '校验与映射', '确认结果'], 1) +
        '<div class="um-dialog-guidance"><strong>身份边界：</strong>CSV 只能导入客户资料和营销状态，不能迁移 Shopify 密码或快捷登录绑定。导入用户将以待激活状态保存。</div>' +
        '<div class="um-upload-zone" data-csv-drop-zone>' +
        '<div><span class="um-upload-icon" aria-hidden="true">⇧</span><strong>拖放 CSV 文件到这里</strong>' +
        '<p class="um-dialog-muted">支持 UTF-8 CSV、Shopify Customer CSV 和系统模板</p>' +
        '<div class="um-upload-actions"><button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="csv-pick"' +
        (state.csv.busy ? ' disabled' : '') + '>' + (state.csv.busy ? '正在读取…' : '选择 CSV 文件') + '</button>' +
        '<button class="um-dialog-button" type="button" data-dialog-action="csv-example"' +
        (state.csv.busy ? ' disabled' : '') + '>使用示例文件体验</button></div>' +
        '<input class="um-screenreader-only" id="umCsvFileInput" type="file" accept=".csv,text/csv"></div></div>' +
        (state.csv.error ? '<div class="um-dialog-error" role="alert">' + escapeHtml(state.csv.error) + '</div>' : '') +
        '<p class="um-dialog-section-copy">系统模板字段：邮箱、名字、姓氏、手机号、邮件营销状态、同意来源、同意时间。相同邮箱将合并到现有用户档案。</p>',
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
        '<div class="um-summary-card"><span>订阅授权缺失</span><strong>' + validation.consentMissing + '</strong></div>' +
        '<div class="um-summary-card"><span>授权时间无效</span><strong>' + validation.consentInvalid + '</strong></div>' +
        '</div>' +
        '<div class="um-dialog-warning">订阅记录缺少同意来源、时间，或时间无法解析时，将按未订阅导入并计入跳过；不会伪造营销授权。</div>' +
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
            '<li>营销订阅仅在来源和时间完整时生效并记录历史。</li>' +
            '<li>无效邮箱会计入失败；缺失邮箱和不完整营销授权会计入跳过，且每行只计一次。</li></ul></div>' +
            '<div class="um-summary-grid"><div class="um-summary-card"><span>准备导入</span><strong>' +
            state.csv.records.length + '</strong></div><div class="um-summary-card"><span>有效邮箱</span><strong>' +
            state.csv.validation.valid + '</strong></div><div class="um-summary-card"><span>预计跳过</span><strong>' +
            (state.csv.validation.missingEmail + state.csv.validation.consentMissing + state.csv.validation.consentInvalid) +
            '</strong></div><div class="um-summary-card"><span>预计失败</span><strong>' +
            state.csv.validation.invalidEmail +
            '</strong></div></div>' +
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
      domain: '',
      domainError: '',
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

  function selectedStore() {
    return CONNECTED_STORES.find(function (store) { return store.id === state.shopify.selectedStoreId; }) || null;
  }

  function currentShopifyRecords() {
    return filterShopifyRecords(SHOPIFY_RECORDS, {
      search: state.shopify.search,
      kind: state.shopify.kind,
      status: state.shopify.status
    });
  }

  function storeListMarkup() {
    return '<div class="um-store-list">' + CONNECTED_STORES.map(function (store) {
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
        escapeHtml(record.marketingStatus) + '</span></button>';
    }).join('') + '</div>';
  }

  function renderShopifyStep1() {
    return {
      title: '从 Shopify 导入用户',
      subtitle: '授权单个店铺读取客户资料',
      body: stepsMarkup(['连接店铺', '选择连接', '选择用户', '导入结果'], 1) +
        '<div class="um-dialog-guidance"><strong>授权边界：</strong>Shopify 授权用于读取店铺客户资料，不会取得买家密码或登录会话。相同邮箱将合并到现有用户档案。</div>' +
        '<div class="um-dialog-warning">每个 <code>*.myshopify.com</code> 店铺都需要单独安装并授权。本系统不会通过一次 OAuth 枚举你的全部店铺。</div>' +
        '<div class="um-dialog-field"><label for="umShopifyDomain">Shopify 店铺域名</label>' +
        '<input class="um-dialog-input" id="umShopifyDomain" type="text" value="' +
        escapeHtml(state.shopify.domain) + '" placeholder="your-store.myshopify.com" autocomplete="off" autofocus>' +
        (state.shopify.domainError ? '<div class="um-dialog-error" role="alert">' +
          escapeHtml(state.shopify.domainError) + '</div>' : '') + '</div>',
      footer: '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="shopify-connect">模拟授权并继续</button>'
    };
  }

  function renderShopifyStep2() {
    return {
      title: '选择已连接店铺',
      subtitle: '列表仅展示本系统已分别保存的 Shopify 连接',
      body: stepsMarkup(['连接店铺', '选择连接', '选择用户', '导入结果'], 2) +
        '<div class="um-dialog-guidance">已完成 <strong>' + escapeHtml(state.shopify.domain) +
        '</strong> 的模拟授权。以下三个店铺是本系统既有连接记录，并非本次 OAuth 自动发现的店铺。</div>' +
        storeListMarkup(),
      footer: '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="shopify-back-connect">上一步</button>' +
        '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
        '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="shopify-records"' +
        (state.shopify.selectedStoreId ? '' : ' disabled') + '>选择客户档案</button>'
    };
  }

  function renderShopifyStep3() {
    var records = currentShopifyRecords();
    var allCurrentSelected = records.length && records.every(function (record) {
      return state.shopify.selected.has(record.id);
    });
    return {
      title: '选择 Shopify 客户档案',
      subtitle: selectedStore() ? selectedStore().name : '',
      body: stepsMarkup(['连接店铺', '选择连接', '选择用户', '导入结果'], 3) +
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
          { value: 'all', label: '全部营销状态' },
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

  function renderShopifyStep4() {
    return {
      title: 'Shopify 导入完成',
      subtitle: selectedStore() ? selectedStore().name : '',
      body: stepsMarkup(['连接店铺', '选择连接', '选择用户', '导入结果'], 4) +
        resultMarkup(state.shopify.result) +
        '<div class="um-dialog-guidance">所有新建档案均为待激活状态；相同邮箱已合并，未迁移 Shopify 密码、快捷登录绑定或会话。</div>',
      footer: '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="close">完成</button>'
    };
  }

  function renderShopify() {
    var renderers = [
      renderShopifyStep1,
      renderShopifyStep2,
      renderShopifyStep3,
      renderShopifyStep4
    ];
    renderShell('shopify', renderers[state.shopify.step - 1]());
  }

  function localDateTimeValue(date) {
    var value = date || new Date();
    var offset = value.getTimezoneOffset() * 60000;
    return new Date(value.getTime() - offset).toISOString().slice(0, 16);
  }

  function marketingTimeMarkup() {
    var value = state.marketing.consentedAt;
    var label = value
      ? new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).format(new Date(value))
      : '请选择同意时间';
    return '<div class="um-dialog-datetime" data-marketing-datetime>' +
      '<input type="hidden" id="umMarketingTimeValue" value="' + escapeHtml(value) + '">' +
      '<button class="um-dialog-datetime-trigger' + (value ? '' : ' is-placeholder') +
      '" type="button" data-dialog-action="marketing-time-toggle" aria-haspopup="dialog" aria-expanded="' +
      state.marketing.timeOpen + '">' + escapeHtml(label) + '</button>' +
      '<div class="um-dialog-datetime-popover" role="dialog" aria-label="设置同意日期和时间"' +
      (state.marketing.timeOpen ? '' : ' hidden') + '>' +
      '<div class="um-dialog-form-grid"><div class="um-dialog-field"><label for="umMarketingDateDraft">日期</label>' +
      '<input class="um-dialog-input" id="umMarketingDateDraft" type="text" inputmode="numeric" placeholder="YYYY-MM-DD" value="' +
      escapeHtml(state.marketing.dateDraft) + '"></div>' +
      '<div class="um-dialog-field"><label for="umMarketingClockDraft">时间</label>' +
      '<input class="um-dialog-input" id="umMarketingClockDraft" type="text" inputmode="numeric" placeholder="HH:MM" value="' +
      escapeHtml(state.marketing.timeDraft) + '"></div></div>' +
      (state.marketing.timeError ? '<div class="um-dialog-error" role="alert">' +
        escapeHtml(state.marketing.timeError) + '</div>' : '') +
      '<div class="um-dialog-inline-actions"><button class="um-dialog-button" type="button" data-dialog-action="marketing-time-now">现在</button>' +
      '<button class="um-dialog-button" type="button" data-dialog-action="marketing-time-clear">清除</button>' +
      '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="marketing-time-confirm">确定</button>' +
      '</div></div></div>';
  }

  function marketingValid() {
    if (!state.marketing || state.marketing.status !== 'subscribed') return true;
    return state.marketing.source !== 'none' && Boolean(parseConsentDateTime(state.marketing.consentedAt));
  }

  function renderMarketing() {
    var count = state.marketing.ids.length;
    renderShell('marketing', {
      title: count > 1 ? '批量更新邮件营销' : '更新邮件营销',
      subtitle: '将更新 ' + count + ' 位用户并写入授权历史',
      body: '<div class="um-dialog-guidance">只有在已取得明确同意时才能标记为已订阅；登录验证码和订单通知等服务邮件不受此状态影响。</div>' +
        '<div class="um-dialog-form-grid"><div class="um-dialog-field"><span class="um-dialog-field-label">营销状态</span>' +
        comboMarkup('marketing-status', state.marketing.status, [
          { value: 'subscribed', label: '已订阅' },
          { value: 'unsubscribed', label: '已退订' },
          { value: 'not_subscribed', label: '未订阅' }
        ], '营销状态') + '</div>' +
        '<div class="um-dialog-field"><span class="um-dialog-field-label">同意来源' +
        (state.marketing.status === 'subscribed' ? ' *' : '') + '</span>' +
        comboMarkup('marketing-source', state.marketing.source, [
          { value: 'none', label: '请选择同意来源' },
          { value: 'registration', label: '注册页面' },
          { value: 'checkout', label: '结账页面' },
          { value: 'footer', label: '页脚订阅' },
          { value: 'offline_event', label: '线下活动' },
          { value: 'customer_service', label: '客服沟通' },
          { value: 'admin', label: '后台人工确认' },
          { value: 'other', label: '其他' }
         ], '同意来源') + '</div>' +
        '<div class="um-dialog-field"><span class="um-dialog-field-label">同意时间' +
        (state.marketing.status === 'subscribed' ? ' *' : '') + '</span>' +
        marketingTimeMarkup() + '</div>' +
        '<div class="um-dialog-field" style="flex-basis:100%"><label for="umMarketingNote">授权备注</label>' +
        '<textarea class="um-dialog-input" id="umMarketingNote" rows="3" style="height:auto" placeholder="可填写授权场景或凭证说明">' +
        escapeHtml(state.marketing.note) + '</textarea></div></div>' +
        (marketingValid() ? '' : '<div class="um-dialog-error" role="alert">标记为已订阅必须选择非空同意来源并填写有效同意时间。</div>') +
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
      outcome = invokeHook('getUsers');
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
        subtitle: state.deletion.ids.length + ' 位用户',
        blocking: true,
        body: '<div class="um-dialog-danger"><strong>此操作不可恢复。</strong> ' +
          escapeHtml(state.deletion.message) + '</div>' +
          (reading
            ? '<div class="um-dialog-guidance">正在读取订单和 Shopify 关联风险，请稍候。</div>'
            : '<div class="um-dialog-error" role="alert"><strong>无法读取订单或 Shopify 关联风险。</strong>' +
              '<p>风险确认前不能永久删除用户。请重试读取，或取消本次操作。</p>' +
              (state.deletion.error ? '<p>' + escapeHtml(state.deletion.error) + '</p>' : '') +
              '</div>'),
        footer: '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
          '<button class="um-dialog-button um-dialog-button-primary" type="button" data-dialog-action="delete-risk-retry"' +
          (reading ? ' disabled' : '') + '>' + (reading ? '正在重试…' : '重试读取风险') + '</button>'
      });
      return;
    }
    var users = state.deletion.users;
    var orderUsers = users.filter(function (user) { return Number(user.orderCount) > 0; });
    var shopifyUsers = users.filter(function (user) {
      return (user.stores && user.stores.length) || (user.externalProfiles && user.externalProfiles.length);
    });
    var risky = orderUsers.length > 0 || shopifyUsers.length > 0;
    var names = users.slice(0, 4).map(function (user) {
      return escapeHtml([user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || user.id);
    }).join('、');
    renderShell('delete', {
      title: state.deletion.title,
      subtitle: state.deletion.ids.length + ' 位用户',
      blocking: true,
      body: '<div class="um-dialog-danger"><strong>此操作不可恢复。</strong> ' +
        escapeHtml(state.deletion.message) + '</div>' +
        (names ? '<p>即将处理：' + names + (users.length > 4 ? ' 等' : '') + '</p>' : '') +
        (risky
          ? '<div class="um-dialog-warning"><strong>建议改为禁用账号：</strong>所选用户中有 ' +
            orderUsers.length + ' 位存在订单，' + shopifyUsers.length +
            ' 位存在 Shopify 绑定。禁用可保留订单、授权和审计关系。</div>'
          : '<div class="um-dialog-guidance">未检测到订单或 Shopify 绑定；删除仍会移除用户档案和授权历史。</div>') +
        '<ul class="um-risk-list"><li>有订单的用户：' + orderUsers.length +
        '</li><li>有 Shopify 绑定的用户：' + shopifyUsers.length + '</li></ul>' +
        (state.deletion.error ? '<div class="um-dialog-error" role="alert">' +
          escapeHtml(state.deletion.error) + '</div>' : ''),
      footer: (risky && hooksAvailable('disableUsers')
        ? '<button class="um-dialog-button um-dialog-button-quiet" type="button" data-dialog-action="delete-disable"' +
          (state.deletion.busy ? ' disabled' : '') + '>改为禁用账号</button>'
        : '') +
        '<button class="um-dialog-button" type="button" data-dialog-action="close">取消</button>' +
        '<button class="um-dialog-button um-dialog-button-danger" type="button" data-dialog-action="delete-confirm"' +
        (state.deletion.busy ? ' disabled' : '') + '>' +
        (state.deletion.busy ? '正在处理…' : '确认永久删除') + '</button>'
    });
  }

  function operationFailed(targetState, render, message) {
    targetState.busy = false;
    targetState.error = message || '操作未完成，请重试。';
    render();
    showParentError(targetState.error);
    return false;
  }

  function completeAndClose(result, targetState, render) {
    var completion = completeHook(result);
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
    if (name === 'marketing-status') {
      state.marketing.status = value;
      renderMarketing();
      return;
    }
    if (name === 'marketing-source') {
      state.marketing.source = value;
      renderMarketing();
    }
  }

  function handleClick(event) {
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
      state.csv.busy = true;
      state.csv.error = '';
      renderCsv();
      var importableRecords = state.csv.records.filter(function (record) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email || '');
      });
      var csvImport = invokeHook('importUsers', [importableRecords, 'shopify_csv']);
      if (!csvImport.ok) {
        operationFailed(state.csv, renderCsv, csvImport.error);
        return;
      }
      var csvResult = mergeCsvImportResult(csvImport.value, state.csv.validation);
      var csvCompletion = completeHook(csvResult);
      if (!csvCompletion.ok) {
        operationFailed(state.csv, renderCsv, csvCompletion.error);
        return;
      }
      state.csv.busy = false;
      state.csv.result = csvResult;
      renderCsv();
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
      state.shopify.step = 2;
      renderShopify();
      return;
    }
    if (action === 'shopify-back-connect') {
      state.shopify.step = 1;
      renderShopify();
      return;
    }
    if (action === 'shopify-store') {
      var chosenStore = CONNECTED_STORES.find(function (store) {
        return store.id === actionTarget.getAttribute('data-store-id');
      });
      if (!chosenStore || chosenStore.connectionState !== 'connected') return;
      state.shopify.selectedStoreId = chosenStore.id;
      state.shopify.selected = new Set();
      renderShopify();
      return;
    }
    if (action === 'shopify-records') {
      state.shopify.step = 3;
      renderShopify();
      return;
    }
    if (action === 'shopify-back-stores') {
      state.shopify.step = 2;
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
      var shopifyImport = invokeHook('importUsers', [selectedRecords, 'shopify_api']);
      if (!shopifyImport.ok) {
        operationFailed(state.shopify, renderShopify, shopifyImport.error);
        return;
      }
      var shopifyCompletion = completeHook(shopifyImport.value);
      if (!shopifyCompletion.ok) {
        operationFailed(state.shopify, renderShopify, shopifyCompletion.error);
        return;
      }
      state.shopify.busy = false;
      state.shopify.result = shopifyImport.value;
      state.shopify.step = 4;
      renderShopify();
      return;
    }
    if (action === 'marketing-time-toggle') {
      state.marketing.timeOpen = !state.marketing.timeOpen;
      state.marketing.timeError = '';
      renderMarketing();
      if (state.marketing.timeOpen) {
        var dateDraft = root.document.getElementById('umMarketingDateDraft');
        if (dateDraft) dateDraft.focus();
      } else {
        var timeTrigger = active.overlay.querySelector('[data-dialog-action="marketing-time-toggle"]');
        if (timeTrigger) timeTrigger.focus();
      }
      return;
    }
    if (action === 'marketing-time-now') {
      var nowValue = localDateTimeValue(new Date());
      state.marketing.dateDraft = nowValue.slice(0, 10);
      state.marketing.timeDraft = nowValue.slice(11, 16);
      state.marketing.timeError = '';
      renderMarketing();
      return;
    }
    if (action === 'marketing-time-clear') {
      state.marketing.consentedAt = '';
      state.marketing.dateDraft = '';
      state.marketing.timeDraft = '';
      state.marketing.timeError = '';
      state.marketing.timeOpen = false;
      renderMarketing();
      return;
    }
    if (action === 'marketing-time-confirm') {
      var draft = state.marketing.dateDraft + 'T' + state.marketing.timeDraft;
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(draft) || !parseConsentDateTime(draft)) {
        state.marketing.timeError = '请输入有效日期和时间（YYYY-MM-DD、HH:MM）。';
        renderMarketing();
        return;
      }
      state.marketing.consentedAt = draft;
      state.marketing.timeError = '';
      state.marketing.timeOpen = false;
      renderMarketing();
      var confirmedTrigger = active.overlay.querySelector('[data-dialog-action="marketing-time-toggle"]');
      if (confirmedTrigger) confirmedTrigger.focus();
      return;
    }
    if (action === 'marketing-confirm') {
      if (!marketingValid()) return;
      var consent = {
        source: state.marketing.source === 'none' ? 'admin' : state.marketing.source,
        consentedAt: state.marketing.consentedAt
          ? new Date(state.marketing.consentedAt).toISOString()
          : new Date().toISOString(),
        note: state.marketing.note
      };
      state.marketing.busy = true;
      state.marketing.error = '';
      renderMarketing();
      var marketingCall = invokeHook('updateMarketing', [
        state.marketing.ids,
        state.marketing.status,
        consent
      ]);
      if (!marketingCall.ok) {
        operationFailed(state.marketing, renderMarketing, marketingCall.error);
        return;
      }
      completeAndClose(marketingCall.value, state.marketing, renderMarketing);
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
      state.deletion.busy = true;
      state.deletion.error = '';
      renderDelete();
      var disableCall = invokeHook('disableUsers', [state.deletion.ids]);
      if (!disableCall.ok) {
        operationFailed(state.deletion, renderDelete, disableCall.error);
        return;
      }
      completeAndClose(disableCall.value, state.deletion, renderDelete);
      return;
    }
    if (action === 'delete-confirm') {
      if (state.deletion.riskStatus !== 'ready' || !canPermanentlyDelete(state.deletion)) return;
      state.deletion.busy = true;
      state.deletion.error = '';
      renderDelete();
      var removeCall = invokeHook('removeUsers', [state.deletion.ids]);
      if (!removeCall.ok) {
        operationFailed(state.deletion, renderDelete, removeCall.error);
        return;
      }
      completeAndClose(removeCall.value, state.deletion, renderDelete);
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
    if (event.target.id === 'umMarketingDateDraft') {
      state.marketing.dateDraft = event.target.value;
      state.marketing.timeError = '';
      return;
    }
    if (event.target.id === 'umMarketingClockDraft') {
      state.marketing.timeDraft = event.target.value;
      state.marketing.timeError = '';
      return;
    }
    if (event.target.id === 'umMarketingNote') state.marketing.note = event.target.value;
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
    if (event.key === 'Escape') {
      if (active.type === 'marketing' && state.marketing && state.marketing.timeOpen) {
        event.preventDefault();
        state.marketing.timeOpen = false;
        state.marketing.timeError = '';
        renderMarketing();
        var trigger = active.overlay.querySelector('[data-dialog-action="marketing-time-toggle"]');
        if (trigger) trigger.focus();
        return;
      }
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
        status: 'subscribed',
        source: 'none',
        consentedAt: '',
        dateDraft: '',
        timeDraft: '',
        timeOpen: false,
        timeError: '',
        note: '',
        error: '',
        busy: false
      };
      return openDialog('marketing', renderMarketing, false).catch(function () { return false; });
    },
    openDeleteConfirm: function (options) {
      var settings = options || {};
      var ids = Array.isArray(settings.ids) ? settings.ids.filter(Boolean) : [];
      state.deletion = {
        ids: ids,
        title: settings.title || (ids.length > 1 ? '删除所选用户' : '删除用户'),
        message: settings.message || '删除后用户档案及其授权历史将无法恢复，请谨慎操作。',
        users: [],
        riskStatus: 'loading',
        error: '',
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
