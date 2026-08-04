// ==================== 父页面 对话框管理器（商城后台） ====================
// 此脚本由 admin/index.html 加载，通过 MutationObserver 监听 iframe 子页面中的
// .dialog-overlay / .confirm-overlay 元素的增删，自动在父页面显示/隐藏全屏遮罩背板，
// 确保遮罩覆盖整个浏览器视口（包括侧边栏和顶栏）。
// 子页面代码无需任何修改。

(function() {
  'use strict';

var iframeContainer = document.querySelector('.iframe-container');
var observer = null;
var backdrop = null;

var WATCH_SELECTORS = '.dialog-overlay, .confirm-overlay';

function getActiveIframe() {
  return document.querySelector('.iframe-container iframe.active') || document.getElementById('contentFrame');
}

function bindIframeEvents(iframe) {
  if (!iframe || iframe._adDialogBound) return;
  iframe._adDialogBound = true;
  iframe.addEventListener('load', function() {
    setTimeout(setupObserver, 100);
  });
}

// 绑定现有 iframe，并监听后续新增的 iframe
var iframes = document.querySelectorAll('.iframe-container iframe');
iframes.forEach(bindIframeEvents);

if (iframeContainer) {
  var containerObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType === 1 && node.tagName === 'IFRAME') {
          bindIframeEvents(node);
        }
      });
    });
  });
  containerObserver.observe(iframeContainer, { childList: true });
}

  // ---- 遮罩背板（仅覆盖侧边栏和顶栏，对话框自身的遮罩由子页面 .dialog-overlay 处理） ----
  // Shopify 授权对话框已通过 shopify_dialog.js 在父页面 #dialogHost 中渲染全屏遮罩，
  // 不走此 MutationObserver 路径。
  function showBackdrop() {
    if (backdrop) return;
    var host = document.getElementById('dialogHost');
    if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }

    backdrop = document.createElement('div');
    backdrop.id = 'adBackdrop';
    var sidebar = document.querySelector('.sidebar');
    var header = document.querySelector('.header');
    var sidebarW = sidebar ? sidebar.offsetWidth : 0;
    var headerH = header ? header.offsetHeight : 0;
    backdrop.style.cssText =
      'position:fixed;top:0;left:0;bottom:0;z-index:9998;background:rgba(0,0,0,0.5);pointer-events:none;' +
      'width:' + sidebarW + 'px;';
    host.appendChild(backdrop);
    if (headerH > 0) {
      var topBar = document.createElement('div');
      topBar.id = 'adBackdropTop';
      topBar.style.cssText =
        'position:fixed;top:0;left:' + sidebarW + 'px;right:0;height:' + headerH + 'px;z-index:9998;' +
        'background:rgba(0,0,0,0.5);pointer-events:none;';
      host.appendChild(topBar);
    }
  }

  function hideBackdrop() {
    if (backdrop) { backdrop.remove(); backdrop = null; }
    var topBar = document.getElementById('adBackdropTop');
    if (topBar) { topBar.remove(); }
  }

  // ---- 检查 iframe 中是否还有可见对话框 ----
  function hasVisibleDialog() {
    var iframe = getActiveIframe();
    if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) return false;
    var dialogs = iframe.contentDocument.body.querySelectorAll(WATCH_SELECTORS);
    for (var i = 0; i < dialogs.length; i++) {
      var d = dialogs[i];
      var style = window.getComputedStyle(d);
      if (style.display !== 'none' && style.visibility !== 'hidden' && d.offsetParent !== null) return true;
    }
    return false;
  }

  // ---- MutationObserver：监听当前 active iframe body 的 DOM 变化 ----
  function setupObserver() {
    if (observer) { observer.disconnect(); observer = null; }
    hideBackdrop();

    var iframe = getActiveIframe();
    if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) return;

    var body = iframe.contentDocument.body;

    function handleMutations(mutations) {
      var added = false, removed = false;

      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];

        // ---- 属性变化：对话框通过 display:none/flex 切换显示/隐藏 ----
        if (m.type === 'attributes') {
          if (matchesSelector(m.target)) {
            var s = window.getComputedStyle(m.target);
            if (s.display !== 'none' && s.visibility !== 'hidden') {
              added = true;
            } else {
              removed = true;
            }
          }
          continue;
        }

        // 检查新增节点
        for (var j = 0; j < m.addedNodes.length; j++) {
          var node = m.addedNodes[j];
          if (node.nodeType === 1) {
            if (matchesSelector(node)) { added = true; break; }
            if (node.querySelectorAll) {
              var inner = node.querySelectorAll(WATCH_SELECTORS);
              if (inner.length > 0) { added = true; break; }
            }
          }
        }

        // 检查移除节点
        for (var k = 0; k < m.removedNodes.length; k++) {
          var rnode = m.removedNodes[k];
          if (rnode.nodeType === 1) {
            if (matchesSelector(rnode)) { removed = true; break; }
            if (rnode.querySelectorAll) {
              var rinner = rnode.querySelectorAll(WATCH_SELECTORS);
              if (rinner.length > 0) { removed = true; break; }
            }
          }
        }
      }

      if (added) showBackdrop();
      if (removed) {
        if (!hasVisibleDialog()) hideBackdrop();
      }
    }

    function matchesSelector(el) {
      if (!el.classList) return false;
      // 检查是否匹配任一 WATCH_SELECTOR
      var sel = el.classList.contains('dialog-overlay') || el.classList.contains('confirm-overlay');
      return sel;
    }

    observer = new MutationObserver(handleMutations);
    observer.observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

    // 初始检查
    if (hasVisibleDialog()) showBackdrop();
  }

  // 对当前 active iframe 立即初始化一次
  setupObserver();

  // 暴露给 loadIframe：切换 active iframe 后重新绑定 observer
  window.adRebindObserver = setupObserver;

  // ---- 导航时关闭（由 loadIframe 调用） ----
  window.adOnNavigate = function() {
    if (observer) { observer.disconnect(); observer = null; }
    hideBackdrop();
    closePaymentProviderDialog();
  };

  // ---- 支付服务商配置：由父页面承载，完整覆盖后台视口 ----
  // iframe 仅负责发起和接收结果，避免对话框只遮罩内容区。
  var paymentProviderDialog = null;
  var paymentProviderSource = null;
  var paymentProviderKeydown = null;

  function escapePaymentDialogHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function closePaymentProviderDialog() {
    ['shippingLocationCountry', 'shippingLocationProvince'].forEach(function(selectId) {
      var dropdown = document.getElementById(selectId + 'Dropdown');
      if (dropdown) dropdown.remove();
    });
    if (paymentProviderDialog) { paymentProviderDialog.remove(); paymentProviderDialog = null; }
    if (paymentProviderKeydown) { document.removeEventListener('keydown', paymentProviderKeydown); paymentProviderKeydown = null; }
    paymentProviderSource = null;
  }

  function openPaymentProviderDialog(source, providerKey, provider, options) {
    closePaymentProviderDialog();
    var host = document.getElementById('dialogHost');
    if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }
    options = options || {};
    var providerName = escapePaymentDialogHtml(provider.name || '支付服务商');
    var providerType = escapePaymentDialogHtml(provider.type || '支付方式');
    var currentState = provider.onboardingState || (provider.connected ? 'connected' : 'not_started');
    var flows = {
      stripe: {
        kind: 'authorization',
        connectTitle: '连接 Stripe',
        connectCopy: '登录您的 Stripe 账户并确认授权，即可让系统安全处理信用卡收款。',
        accountLabel: '已授权 Stripe 账户',
        fields: [
          { name: 'merchantAccount', label: 'Stripe 商家账户', placeholder: '输入已授权的 Stripe 商家账户' },
          { name: 'settlementCurrency', label: '结算币种', placeholder: '例如：USD' }
        ]
      },
      paypal: {
        kind: 'authorization',
        connectTitle: '连接 PayPal',
        connectCopy: '登录您的 PayPal 商家账户并确认授权，即可开启 PayPal 支付。',
        accountLabel: '已授权 PayPal 商家账户',
        fields: [
          { name: 'merchantAccount', label: 'PayPal 商家账户', placeholder: '输入已授权的 PayPal 商家账户' },
          { name: 'settlementCurrency', label: '结算币种', placeholder: '例如：USD' }
        ]
      },
      airwallex: {
        kind: 'manual',
        connectTitle: '配置空中云汇',
        connectCopy: '填写空中云汇提供的连接信息后保存。',
        fields: [
          { name: 'clientId', label: '唯一客户 ID', placeholder: 'Enter Unique client ID' },
          { name: 'apiKey', label: '客户端 API 密钥', placeholder: 'Enter Client API key', sensitive: true },
          { name: 'webhookToken', label: 'Webhook 令牌', placeholder: 'Enter Webhook Token', sensitive: true }
        ]
      },
      qianhai: {
        kind: 'manual',
        connectTitle: '配置钱海',
        connectCopy: '填写钱海提供的收款信息后保存。',
        fields: [
          { name: 'account', label: '账号', placeholder: '输入 Oceanpayment 账号' },
          { name: 'terminalId', label: '终端号', placeholder: '输入终端号' },
          { name: 'secretKey', label: '秘钥', placeholder: '输入秘钥', sensitive: true }
        ]
      },
      afterpay: {
        kind: 'manual',
        connectTitle: '配置 Afterpay',
        connectCopy: '填写 Afterpay 提供的收款信息后保存。',
        fields: [
          { name: 'merchantId', label: 'MerchantId', placeholder: '输入 MerchantId' },
          { name: 'secretKey', label: 'SecretKey', placeholder: '输入 SecretKey', sensitive: true }
        ]
      }
    };
    var flow = flows[providerKey] || {
      kind: 'application',
      connectTitle: '申请开通 ' + providerName,
      connectCopy: '补充经营资料后，服务商会完成审核。',
      fields: [
        { name: 'businessName', label: '企业或个体工商户名称', placeholder: '请输入营业执照上的名称' },
        { name: 'storeUrl', label: '店铺网址', placeholder: '例如：https://www.example.com' }
      ]
    };
    paymentProviderSource = source;
    paymentProviderDialog = document.createElement('div');
    paymentProviderDialog.id = 'paymentProviderDialog';
    paymentProviderDialog.setAttribute('role', 'presentation');
    paymentProviderDialog.style.cssText = 'position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(25,21,18,.46);box-sizing:border-box;';
    host.appendChild(paymentProviderDialog);
    function button(label, attribute, primary) {
      return '<button type="button" ' + attribute + ' style="height:36px;padding:0 14px;border:' + (primary ? '0' : '1px solid #e8e1da') + ';border-radius:8px;background:' + (primary ? '#c58c54' : '#fff') + ';color:' + (primary ? '#fff' : '#4d443d') + ';font:600 12px/1 system-ui,sans-serif;cursor:pointer;">' + label + '</button>';
    }
    function sendProviderUpdate(update) {
      if (paymentProviderSource) paymentProviderSource.postMessage({ type: 'rbk-payment-provider-saved', providerKey: providerKey, provider: update, primaryCardProvider: options.primaryCardProvider || '' }, '*');
    }
    function applicationFields(required) {
      var config = provider.config || {};
      return (flow.fields || []).map(function(field) {
        var value = config[field.name] || (field.name === 'merchantAccount' ? provider.accountLabel || '' : '');
        return '<label style="display:block;margin-top:16px;color:#2e2823;font:600 14px/1.5 system-ui,sans-serif;">' + escapePaymentDialogHtml(field.label) + '<input' + (required ? ' required' : '') + ' name="' + escapePaymentDialogHtml(field.name) + '"' + (field.sensitive ? ' type="password" autocomplete="off"' : '') + ' placeholder="' + escapePaymentDialogHtml(field.placeholder) + '" value="' + escapePaymentDialogHtml(value) + '" style="display:block;width:100%;height:40px;box-sizing:border-box;margin-top:6px;padding:0 12px;border:1px solid #e8e1da;border-radius:8px;color:#2e2823;font:400 14px/1 system-ui,sans-serif;"></label>';
      }).join('');
    }
    function render(view) {
      var isConnected = currentState === 'connected' && !!provider.connected;
      var title = providerName;
      var copy = providerType + '服务。';
      var content = '';
      if ((isConnected || flow.kind === 'manual') && view !== 'connect' && view !== 'application') {
        title = '配置 ' + providerName;
        copy = flow.kind === 'authorization' ? '核对当前商家账户与结算信息；如需更换账户，可重新授权。' : flow.connectCopy;
        var reauthorize = flow.kind === 'authorization' && isConnected ? button('重新授权', 'data-provider-connect', false) : '';
        content = '<form data-provider-config-form style="margin-top:6px;">' + applicationFields(flow.kind === 'manual') + '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px;">' + button('取消', 'data-payment-dialog-close', false) + reauthorize + '<button type="submit" style="height:36px;padding:0 14px;border:0;border-radius:8px;background:#c58c54;color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer;">保存配置</button></div></form>';
      } else if (currentState === 'pending_review' && view !== 'application') {
        title = providerName + ' 正在审核';
        copy = '资料已提交，审核通过后会自动更新为可用状态。';
        content = '<div style="margin-top:22px;padding:16px;border:1px solid #f0dfc9;border-radius:10px;background:#fffaf4;"><strong style="display:block;color:#9a672f;font:600 14px/1.5 system-ui,sans-serif;">● 等待审核</strong><p style="margin:6px 0 0;color:#7b7168;font:400 12px/1.6 system-ui,sans-serif;">审核期间无需重复提交。若服务商需要补充资料，我们会在这里提醒您。</p></div><div style="display:flex;justify-content:flex-end;margin-top:24px;">' + button('我知道了', 'data-payment-dialog-close', true) + '</div>';
      } else if (flow.kind === 'authorization' && view !== 'application') {
        title = flow.connectTitle;
        copy = flow.connectCopy;
        content = '<div style="margin-top:22px;padding:16px;border:1px solid #ece4dc;border-radius:10px;background:#fcfaf8;"><strong style="display:block;color:#2e2823;font:600 14px/1.5 system-ui,sans-serif;">安全授权</strong><ol style="margin:8px 0 0;padding-left:18px;color:#7b7168;font:400 12px/1.8 system-ui,sans-serif;"><li>打开 ' + providerName + ' 官方页面并登录。</li><li>确认授权本店铺使用收款服务。</li><li>完成后返回本页，系统会自动更新连接状态。</li></ol></div><div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px;">' + button('取消', 'data-payment-dialog-close', false) + button('继续前往 ' + providerName + ' 授权', 'data-provider-authorize', true) + '</div>';
      } else if (flow.kind === 'manual') {
        title = flow.connectTitle;
        copy = flow.connectCopy;
        content = '<form data-provider-config-form style="margin-top:6px;">' + applicationFields(true) + '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px;">' + button('取消', 'data-payment-dialog-close', false) + '<button type="submit" style="height:36px;padding:0 14px;border:0;border-radius:8px;background:#c58c54;color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer;">保存配置</button></div></form>';
      } else {
        title = flow.connectTitle;
        copy = flow.connectCopy;
        content = '<form data-provider-application-form style="margin-top:6px;">' + applicationFields(true) + '<p style="margin:12px 0 0;color:#7b7168;font:400 12px/1.6 system-ui,sans-serif;">提交后将进入审核流程。审核通过后，您可以选择是否在买家端启用该支付方式。</p><div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px;">' + button('取消', 'data-payment-dialog-close', false) + '<button type="submit" style="height:36px;padding:0 14px;border:0;border-radius:8px;background:#c58c54;color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer;">提交资料</button></div></form>';
      }
      paymentProviderDialog.innerHTML = '<section role="dialog" aria-modal="true" aria-labelledby="paymentProviderDialogTitle" style="width:min(560px,100%);max-height:calc(100vh - 48px);overflow:auto;box-sizing:border-box;padding:24px;border:1px solid #e8e1da;border-radius:12px;background:#fff;box-shadow:0 24px 56px rgba(42,32,24,.25);"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;"><div><h2 id="paymentProviderDialogTitle" style="margin:0;color:#2e2823;font:600 16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;">' + title + '</h2><p style="margin:4px 0 0;color:#7b7168;font:400 12px/1.6 system-ui,-apple-system,Segoe UI,sans-serif;">' + copy + '</p></div><button type="button" data-payment-dialog-close aria-label="关闭" style="width:32px;height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:#7b7168;font:400 24px/1 system-ui,sans-serif;cursor:pointer;">×</button></div>' + content + '</section>';
      paymentProviderDialog.querySelectorAll('[data-payment-dialog-close]').forEach(function(element) { element.addEventListener('click', closePaymentProviderDialog); });
      var connectButton = paymentProviderDialog.querySelector('[data-provider-connect]');
      if (connectButton) connectButton.addEventListener('click', function() { render(flow.kind === 'authorization' ? 'connect' : flow.kind === 'manual' ? 'manual' : 'application'); });
      var authorizeButton = paymentProviderDialog.querySelector('[data-provider-authorize]');
      if (authorizeButton) authorizeButton.addEventListener('click', function() { sendProviderUpdate({ connected: true, onboardingState: 'connected', accountLabel: flow.accountLabel || '已授权商户账户' }); closePaymentProviderDialog(); });
      var applicationForm = paymentProviderDialog.querySelector('[data-provider-application-form]');
      if (applicationForm) applicationForm.addEventListener('submit', function(event) { event.preventDefault(); if (!applicationForm.checkValidity()) { applicationForm.reportValidity(); return; } sendProviderUpdate({ connected: false, onboardingState: 'pending_review', accountLabel: '' }); closePaymentProviderDialog(); });
      var configForm = paymentProviderDialog.querySelector('[data-provider-config-form]');
      if (configForm) configForm.addEventListener('submit', function(event) { event.preventDefault(); if (!configForm.checkValidity()) { configForm.reportValidity(); return; } var config = {}; (flow.fields || []).forEach(function(field) { config[field.name] = String(configForm.elements[field.name] && configForm.elements[field.name].value || '').trim(); }); sendProviderUpdate({ connected: isConnected || flow.kind === 'manual', onboardingState: isConnected || flow.kind === 'manual' ? 'connected' : currentState, accountLabel: isConnected ? provider.accountLabel : '已完成配置', config: config }); closePaymentProviderDialog(); });
      var firstField = paymentProviderDialog.querySelector('input');
      if (firstField) firstField.focus();
    }
    render();
    paymentProviderDialog.addEventListener('click', function(event) { if (event.target === paymentProviderDialog) closePaymentProviderDialog(); });
    paymentProviderKeydown = function(event) { if (event.key === 'Escape') closePaymentProviderDialog(); };
    document.addEventListener('keydown', paymentProviderKeydown);
  }

  function openPaymentRoutingDialog(source, providers, cardRouting) {
    closePaymentProviderDialog();
    var cardProviders = Object.keys(providers || {}).filter(function(key) {
      return providers[key].connected && String(providers[key].type || '').indexOf('信用卡') !== -1;
    });
    if (!cardProviders.length) return;
    var host = document.getElementById('dialogHost');
    if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }
    var primary = cardProviders.indexOf(cardRouting.primary) !== -1 ? cardRouting.primary : cardProviders[0];
    var rows = cardProviders.map(function(key) {
      var provider = providers[key];
      return '<label style="display:flex;align-items:center;gap:10px;min-height:46px;padding:0 12px;border-top:1px solid #eee7e0;color:#2e2823;font:500 14px/1.5 system-ui,sans-serif;cursor:pointer;"><input type="radio" name="paymentRoutingPrimary" value="' + escapePaymentDialogHtml(key) + '"' + (key === primary ? ' checked' : '') + '><span>' + escapePaymentDialogHtml(provider.name) + '</span><span style="margin-left:auto;color:#7b7168;font:400 12px/1.5 system-ui,sans-serif;">' + escapePaymentDialogHtml(provider.type) + '</span></label>';
    }).join('');
    paymentProviderSource = source;
    paymentProviderDialog = document.createElement('div');
    paymentProviderDialog.id = 'paymentProviderDialog';
    paymentProviderDialog.setAttribute('role', 'presentation');
    paymentProviderDialog.style.cssText = 'position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(25,21,18,.46);box-sizing:border-box;';
    paymentProviderDialog.innerHTML =
      '<section role="dialog" aria-modal="true" aria-labelledby="paymentRoutingDialogTitle" style="width:min(560px,100%);max-height:calc(100vh - 48px);overflow:auto;box-sizing:border-box;padding:24px;border:1px solid #e8e1da;border-radius:12px;background:#fff;box-shadow:0 24px 56px rgba(42,32,24,.25);">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;"><div><h2 id="paymentRoutingDialogTitle" style="margin:0;color:#2e2823;font:600 16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;">设置信用卡收款顺序</h2><p style="margin:4px 0 0;color:#7b7168;font:400 12px/1.6 system-ui,-apple-system,Segoe UI,sans-serif;">买家端仍只显示信用卡；收款服务商的选择与失败处理由系统完成。</p></div><button type="button" data-payment-dialog-close aria-label="关闭" style="width:32px;height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:#7b7168;font:400 24px/1 system-ui,sans-serif;cursor:pointer;">×</button></div>' +
        '<form data-payment-routing-form style="margin-top:22px;"><div style="overflow:hidden;border:1px solid #e8e1da;border-radius:8px;">' + rows + '</div><label style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px;color:#2e2823;font:500 14px/1.5 system-ui,sans-serif;cursor:pointer;"><span>支付失败时自动尝试其他服务商<span style="display:block;margin-top:3px;color:#7b7168;font:400 12px/1.5 system-ui,sans-serif;">仅尝试已连接且支持信用卡的服务商。</span></span><input type="checkbox" name="fallback"' + (cardRouting.fallback ? ' checked' : '') + '></label><div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px;"><button type="button" data-payment-dialog-close style="height:36px;padding:0 14px;border:1px solid #e8e1da;border-radius:8px;background:#fff;color:#4d443d;font:500 12px/1 system-ui,sans-serif;cursor:pointer;">取消</button><button type="submit" style="height:36px;padding:0 14px;border:0;border-radius:8px;background:#c58c54;color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer;">保存顺序</button></div></form>' +
      '</section>';
    host.appendChild(paymentProviderDialog);
    paymentProviderDialog.querySelectorAll('[data-payment-dialog-close]').forEach(function(button) { button.addEventListener('click', closePaymentProviderDialog); });
    paymentProviderDialog.addEventListener('click', function(event) { if (event.target === paymentProviderDialog) closePaymentProviderDialog(); });
    paymentProviderDialog.querySelector('[data-payment-routing-form]').addEventListener('submit', function(event) {
      event.preventDefault();
      var form = event.currentTarget;
      var selected = form.querySelector('input[name="paymentRoutingPrimary"]:checked');
      if (paymentProviderSource && selected) paymentProviderSource.postMessage({ type: 'rbk-payment-routing-saved', cardRouting: { primary:selected.value, fallback:form.elements.fallback.checked } }, '*');
      closePaymentProviderDialog();
    });
    paymentProviderKeydown = function(event) { if (event.key === 'Escape') closePaymentProviderDialog(); };
    document.addEventListener('keydown', paymentProviderKeydown);
  }

  function openMessagingProviderDialog(source, payload) {
    closePaymentProviderDialog();
    var providers = Array.isArray(payload.providers) ? payload.providers : [];
    var currentProvider = String(payload.currentProvider || '');
    function messagingProviderLogo(key, name) {
      var sources = { salesmartly:'https://www.salesmartly.com/favicon.ico', intercom:'https://cdn.simpleicons.org/intercom/286EFA?viewbox=auto', zendesk:'https://cdn.simpleicons.org/zendesk/03363D?viewbox=auto', crisp:'https://cdn.simpleicons.org/crisp/1976D2?viewbox=auto', livechat:'https://cdn.simpleicons.org/livechat/FF5100?viewbox=auto', gorgias:'https://cdn.simpleicons.org/gorgias/000000?viewbox=auto', tidio:'https://cdn.simpleicons.org/tidio/3B5BDB?viewbox=auto', sobot:'https://www.sobot.com/favicon.ico' };
      var src = sources[key];
      return '<span aria-label="' + escapePaymentDialogHtml(name) + ' Logo" style="display:grid;width:32px;height:32px;overflow:hidden;flex:0 0 32px;border:1px solid #e8e1da;border-radius:8px;place-items:center;background:#fff;"><img src="' + (src || '') + '" alt="" referrerpolicy="no-referrer" style="display:block;width:24px;height:24px;object-fit:contain;" onerror="this.remove();"></span>';
    }
    var rows = providers.map(function(provider) {
      var key = String(provider.key || '');
      var name = escapePaymentDialogHtml(provider.name || '服务商');
      var isCurrent = key === currentProvider;
      var selectable = !!provider.supported && !isCurrent;
      var status = isCurrent ? '当前服务商' : provider.connected ? '已验证' : provider.supported ? '待配置' : '即将支持';
      var statusColor = isCurrent || provider.connected ? '#129e5a' : '#8b8178';
      var tag = selectable ? 'button' : 'div';
      var attributes = selectable ? ' type="button" data-messaging-provider-select="' + escapePaymentDialogHtml(key) + '" aria-label="选择服务商 ' + name + '"' : '';
      var background = isCurrent ? 'background:#fff8ef;' : '';
      var cursor = selectable ? 'cursor:pointer;' : '';
      return '<' + tag + attributes + ' data-messaging-provider-row style="display:grid;width:100%;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:12px;min-height:66px;box-sizing:border-box;padding:10px 14px;border:0;border-top:1px solid #eee7e0;' + background + cursor + 'color:#2e2823;text-align:left;font:inherit;"><div style="display:flex;align-items:center;gap:10px;min-width:0;">' + messagingProviderLogo(key, provider.name || '服务商') + '<span><strong style="display:block;font:600 14px/1.4 system-ui,sans-serif;">' + name + '</strong><span style="display:block;margin-top:2px;color:#7b7168;font:400 12px/1.5 system-ui,sans-serif;">' + (provider.supported ? 'Web 即时通讯集成' : '服务商扩展计划') + '</span></span></div><span style="color:' + statusColor + ';font:400 12px/1.5 system-ui,sans-serif;">● ' + status + '</span>' + (selectable ? '<span aria-hidden="true" style="color:#8b8178;font:400 22px/1 system-ui,sans-serif;">›</span>' : '') + '</' + tag + '>';
    }).join('');
    var host = document.getElementById('dialogHost');
    if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }
    paymentProviderSource = source;
    paymentProviderDialog = document.createElement('div');
    paymentProviderDialog.id = 'messagingProviderDialog';
    paymentProviderDialog.setAttribute('role', 'presentation');
    paymentProviderDialog.style.cssText = 'position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(25,21,18,.46);box-sizing:border-box;';
    paymentProviderDialog.innerHTML =
      '<section role="dialog" aria-modal="true" aria-labelledby="messagingProviderDialogTitle" style="display:flex;width:min(640px,100%);max-height:calc(100vh - 48px);min-height:0;box-sizing:border-box;flex-direction:column;overflow:hidden;padding:24px;border:1px solid #e8e1da;border-radius:12px;background:#fff;box-shadow:0 24px 56px rgba(42,32,24,.25);">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;"><div><h2 id="messagingProviderDialogTitle" style="margin:0;color:#2e2823;font:600 16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;">选择服务商</h2><p style="margin:4px 0 0;color:#7b7168;font:400 12px/1.6 system-ui,-apple-system,Segoe UI,sans-serif;">选择当前服务商；配置会在即时通讯主页完成。</p></div><button type="button" data-messaging-dialog-close aria-label="关闭选择服务商" style="width:32px;height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:#7b7168;font:400 24px/1 system-ui,sans-serif;cursor:pointer;">×</button></div>' +
        '<input data-messaging-provider-search placeholder="搜索服务商" aria-label="搜索服务商" style="display:block;width:100%;height:40px;box-sizing:border-box;margin-top:18px;padding:0 12px;border:1px solid #c58c54;border-radius:8px;color:#2e2823;font:400 14px/1 system-ui,sans-serif;outline:none;">' +
        '<div data-messaging-provider-list style="min-height:0;flex:1 1 auto;overflow-y:auto;margin-top:14px;border:1px solid #e8e1da;border-radius:10px;scrollbar-gutter:stable;">' + rows + '</div>' +
      '</section>';
    host.appendChild(paymentProviderDialog);
    paymentProviderDialog.querySelectorAll('[data-messaging-dialog-close]').forEach(function(button) { button.addEventListener('click', closePaymentProviderDialog); });
    paymentProviderDialog.addEventListener('click', function(event) {
      if (event.target === paymentProviderDialog) { closePaymentProviderDialog(); return; }
      var option = event.target.closest('[data-messaging-provider-select]');
      if (!option || !paymentProviderSource) return;
      paymentProviderSource.postMessage({ type: 'rbk-messaging-provider-selected', providerKey: option.getAttribute('data-messaging-provider-select') }, '*');
      closePaymentProviderDialog();
    });
    var search = paymentProviderDialog.querySelector('[data-messaging-provider-search]');
    search.addEventListener('input', function() {
      var query = search.value.trim().toLowerCase();
      paymentProviderDialog.querySelectorAll('[data-messaging-provider-row]').forEach(function(row) { row.hidden = row.innerText.toLowerCase().indexOf(query) === -1; });
    });
    paymentProviderKeydown = function(event) { if (event.key === 'Escape') closePaymentProviderDialog(); };
    document.addEventListener('keydown', paymentProviderKeydown);
    search.focus();
  }

  function openMessagingProviderConfigDialog(source, payload) {
    closePaymentProviderDialog();
    var provider = payload.provider || {};
    var connection = Object.assign({ workspace:'', widgetId:'', publicKey:'', allowedDomain:'', connected:false, verifiedAt:'' }, payload.connection || {});
    var host = document.getElementById('dialogHost');
    if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }
    var fields = [
      { key:'workspace', label:'客服工作区', placeholder:'例如：my-workspace' },
      { key:'widgetId', label:'Web 渠道 ID', placeholder:'例如：widget_123456' },
      { key:'publicKey', label:'买家端公钥', placeholder:'例如：pk_live_••••••••', sensitive:true },
      { key:'allowedDomain', label:'已授权域名', placeholder:'例如：shop.example.com' }
    ];
    var fieldMarkup = fields.map(function(field) { return '<label style="display:block;margin-top:16px;color:#2e2823;font:600 14px/1.5 system-ui,sans-serif;"><span style="color:#d64b35;">*</span> ' + escapePaymentDialogHtml(field.label) + '<input required name="' + field.key + '"' + (field.sensitive ? ' type="password" autocomplete="off"' : '') + ' value="' + escapePaymentDialogHtml(connection[field.key] || '') + '" placeholder="' + escapePaymentDialogHtml(field.placeholder) + '" style="display:block;width:100%;height:40px;box-sizing:border-box;margin-top:6px;padding:0 12px;border:1px solid #e8e1da;border-radius:8px;color:#2e2823;font:400 14px/1 system-ui,sans-serif;"></label>'; }).join('');
    paymentProviderSource = source;
    paymentProviderDialog = document.createElement('div');
    paymentProviderDialog.id = 'messagingProviderConfigDialog';
    paymentProviderDialog.setAttribute('role', 'presentation');
    paymentProviderDialog.style.cssText = 'position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(25,21,18,.46);box-sizing:border-box;';
    paymentProviderDialog.innerHTML = '<section role="dialog" aria-modal="true" aria-labelledby="messagingProviderConfigDialogTitle" style="width:min(600px,100%);max-height:calc(100vh - 48px);overflow:auto;box-sizing:border-box;padding:24px;border:1px solid #e8e1da;border-radius:12px;background:#fff;box-shadow:0 24px 56px rgba(42,32,24,.25);"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;"><div><h2 id="messagingProviderConfigDialogTitle" style="margin:0;color:#2e2823;font:600 16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;">配置 ' + escapePaymentDialogHtml(provider.name || '服务商') + '</h2><p style="margin:4px 0 0;color:#7b7168;font:400 12px/1.6 system-ui,sans-serif;">填写 Web 渠道接入信息。保存后系统会验证配置，并托管买家端安装。</p></div><button type="button" data-messaging-config-close aria-label="关闭" style="width:32px;height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:#7b7168;font:400 24px/1 system-ui,sans-serif;cursor:pointer;">×</button></div><form data-messaging-provider-config-form style="margin-top:6px;">' + fieldMarkup + '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px;"><button type="button" data-messaging-config-close style="height:36px;padding:0 14px;border:1px solid #e8e1da;border-radius:8px;background:#fff;color:#4d443d;font:500 12px/1 system-ui,sans-serif;cursor:pointer;">取消</button><button type="submit" style="height:36px;padding:0 14px;border:0;border-radius:8px;background:#c58c54;color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer;">保存并验证</button></div></form></section>';
    host.appendChild(paymentProviderDialog);
    paymentProviderDialog.querySelectorAll('[data-messaging-config-close]').forEach(function(button) { button.addEventListener('click', closePaymentProviderDialog); });
    paymentProviderDialog.addEventListener('click', function(event) { if (event.target === paymentProviderDialog) closePaymentProviderDialog(); });
    var form = paymentProviderDialog.querySelector('[data-messaging-provider-config-form]');
    form.addEventListener('submit', function(event) { event.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } var saved = { connected:true, verifiedAt:new Date().toLocaleString('zh-CN', { hour12:false }) }; fields.forEach(function(field) { saved[field.key] = String(form.elements[field.key].value || '').trim(); }); if (paymentProviderSource) paymentProviderSource.postMessage({ type:'rbk-messaging-provider-config-saved', providerKey:provider.key, connection:saved }, '*'); closePaymentProviderDialog(); });
    paymentProviderKeydown = function(event) { if (event.key === 'Escape') closePaymentProviderDialog(); };
    document.addEventListener('keydown', paymentProviderKeydown);
    var firstField = form.querySelector('input'); if (firstField) firstField.focus();
  }

  function openPaymentMethodCatalogDialog(source, payload) {
    closePaymentProviderDialog();
    var catalog = Array.isArray(payload.catalog) ? payload.catalog : [];
    var catalogByKey = {};
    catalog.forEach(function(item) { if (item && item.key) catalogByKey[item.key] = item; });
    var availableCatalog = catalog.slice();
    var buyerMethods = Array.isArray(payload.buyerMethods) ? payload.buyerMethods.filter(function(key, index, list) { return catalogByKey[key] && list.indexOf(key) === index; }) : [];
    var host = document.getElementById('dialogHost');
    if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }
    paymentProviderSource = source;
    paymentProviderDialog = document.createElement('div');
    paymentProviderDialog.id = 'paymentMethodCatalogDialog';
    paymentProviderDialog.setAttribute('role', 'presentation');
    paymentProviderDialog.style.cssText = 'position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(25,21,18,.46);box-sizing:border-box;';
    paymentProviderDialog.innerHTML =
      '<section role="dialog" aria-modal="true" aria-labelledby="paymentMethodCatalogDialogTitle" style="display:flex;width:min(760px,100%);max-height:calc(100vh - 48px);min-height:0;box-sizing:border-box;flex-direction:column;overflow:hidden;padding:24px;border:1px solid #e8e1da;border-radius:12px;background:#fff;box-shadow:0 24px 56px rgba(42,32,24,.25);">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;"><div><h2 id="paymentMethodCatalogDialogTitle" style="margin:0;color:#2e2823;font:600 16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;">管理支付方式</h2><p style="margin:4px 0 0;color:#7b7168;font:400 12px/1.6 system-ui,sans-serif;">勾选买家可选择的支付方式；已启用的方式可直接拖拽调整结账页展示顺序。</p></div><button type="button" data-payment-dialog-close aria-label="关闭" style="width:32px;height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:#7b7168;font:400 24px/1 system-ui,sans-serif;cursor:pointer;">×</button></div>' +
        '<input data-payment-method-search placeholder="搜索支付方式" aria-label="搜索支付方式" style="display:block;width:100%;height:40px;box-sizing:border-box;margin-top:18px;padding:0 12px;border:1px solid #c58c54;border-radius:8px;color:#2e2823;font:400 14px/1 system-ui,sans-serif;outline:none;">' +
        '<div data-payment-method-catalog-list style="min-height:0;flex:1 1 auto;overflow-y:auto;margin-top:14px;border:1px solid #e8e1da;border-radius:10px;scrollbar-gutter:stable;"></div>' +
        '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;"><button type="button" data-payment-dialog-close style="height:36px;padding:0 14px;border:1px solid #e8e1da;border-radius:8px;background:#fff;color:#4d443d;font:500 12px/1 system-ui,sans-serif;cursor:pointer;">取消</button><button type="button" data-payment-method-catalog-save style="height:36px;padding:0 14px;border:0;border-radius:8px;background:#c58c54;color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer;">保存支付方式</button></div>' +
      '</section>';
    host.appendChild(paymentProviderDialog);
    var list = paymentProviderDialog.querySelector('[data-payment-method-catalog-list]');
    var search = paymentProviderDialog.querySelector('[data-payment-method-search]');
    function paymentMethodLogo(item) {
      var sources = { paypal:'https://cdn.simpleicons.org/paypal/003087?viewbox=auto', afterpay:'https://cdn.simpleicons.org/afterpay/000000?viewbox=auto', qianhai:'https://www.oceanpayment.com/favicon.ico', airwallex:'https://www.airwallex.com/favicon.ico' };
      var src = sources[item.key] || 'https://cdn.simpleicons.org/visa/1A1F71?viewbox=auto';
      return '<span aria-label="' + escapePaymentDialogHtml(item.name) + ' Logo" style="display:grid;width:32px;height:32px;overflow:hidden;border:1px solid #e8e1da;border-radius:8px;place-items:center;background:#fff;"><img src="' + src + '" alt="" referrerpolicy="no-referrer" style="display:block;width:24px;height:24px;object-fit:contain;" onerror="this.style.display=\'none\';"></span>';
    }
    function paymentMethodCatalogSummary(item) {
      var summaries = {
        paypal:'参考手续费：3.49% + 固定费用 / 笔 · 支持 11 种本地支付方式',
        afterpay:'参考手续费：6% + US$0.30 / 笔 · 支持 2 种本地支付方式',
        qianhai:'参考手续费：3.5% + US$0.30 / 笔 · 支持 10 种本地支付方式',
        airwallex:'参考手续费：2.9% + US$0.30 / 笔 · 支持 15 种本地支付方式'
      };
      return summaries[item.key] || item.description || '';
    }
    function methodRows() {
      return availableCatalog.slice().sort(function(left, right) {
        var leftOrder = buyerMethods.indexOf(left.key);
        var rightOrder = buyerMethods.indexOf(right.key);
        if (leftOrder !== -1 && rightOrder !== -1) return leftOrder - rightOrder;
        if (leftOrder !== -1) return -1;
        if (rightOrder !== -1) return 1;
        return catalog.indexOf(left) - catalog.indexOf(right);
      }).map(function(item) {
        var isEnabled = buyerMethods.indexOf(item.key) !== -1;
        return '<div data-payment-method-row data-payment-method-key="' + escapePaymentDialogHtml(item.key) + '" style="display:grid;grid-template-columns:auto auto minmax(0,1fr);align-items:center;gap:12px;min-height:68px;padding:10px 14px;border-top:1px solid #eee7e0;box-sizing:border-box;"><input type="checkbox" data-payment-method-toggle="' + escapePaymentDialogHtml(item.key) + '" aria-label="启用 ' + escapePaymentDialogHtml(item.name) + '"' + (isEnabled ? ' checked' : '') + '>' + paymentMethodLogo(item) + '<div><strong style="display:block;color:#2e2823;font:600 14px/1.4 system-ui,sans-serif;">' + escapePaymentDialogHtml(item.name) + '</strong><span style="display:block;margin-top:2px;color:#7b7168;font:400 12px/1.5 system-ui,sans-serif;">' + escapePaymentDialogHtml(paymentMethodCatalogSummary(item)) + '</span></div></div>';
      }).join('');
    }
    function renderCatalog() {
      list.innerHTML = methodRows() || '<div style="padding:28px 14px;color:#7b7168;font:400 12px/1.6 system-ui,sans-serif;text-align:center;">请先配置可用的收款服务商。</div>';
      applySearch();
    }
    function applySearch() {
      var query = search.value.trim().toLowerCase();
      list.querySelectorAll('[data-payment-method-row]').forEach(function(row) { row.hidden = row.innerText.toLowerCase().indexOf(query) === -1; });
    }
    renderCatalog();
    paymentProviderDialog.querySelectorAll('[data-payment-dialog-close]').forEach(function(button) { button.addEventListener('click', closePaymentProviderDialog); });
    search.addEventListener('input', applySearch);
    list.addEventListener('change', function(event) {
      var toggle = event.target.closest('[data-payment-method-toggle]');
      if (!toggle) return;
      var key = toggle.getAttribute('data-payment-method-toggle');
      if (toggle.checked) buyerMethods.push(key);
      else buyerMethods = buyerMethods.filter(function(item) { return item !== key; });
      renderCatalog();
    });
    paymentProviderDialog.querySelector('[data-payment-method-catalog-save]').addEventListener('click', function() {
      if (paymentProviderSource) paymentProviderSource.postMessage({ type:'rbk-payment-methods-saved', buyerMethods:buyerMethods }, '*');
      closePaymentProviderDialog();
    });
    paymentProviderDialog.addEventListener('click', function(event) { if (event.target === paymentProviderDialog) closePaymentProviderDialog(); });
    paymentProviderKeydown = function(event) { if (event.key === 'Escape') closePaymentProviderDialog(); };
    document.addEventListener('keydown', paymentProviderKeydown);
    search.focus();
  }

  function openPaymentProviderCatalogDialog(source, providers) {
    closePaymentProviderDialog();
    var host = document.getElementById('dialogHost');
    if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }
    var logoSources = { stripe:'https://cdn.simpleicons.org/stripe/635BFF?viewbox=auto', airwallex:'https://www.airwallex.com/favicon.ico', qianhai:'https://www.oceanpayment.com/favicon.ico', paypal:'https://cdn.simpleicons.org/paypal/003087?viewbox=auto', afterpay:'https://cdn.simpleicons.org/afterpay/000000?viewbox=auto' };
    function stateFor(provider) {
      var state = provider.onboardingState || (provider.connected ? 'connected' : 'not_started');
      return { connected:{ label:'已连接', action:'管理', color:'#129e5a' }, needs_information:{ label:'需补资料', action:'补充资料', color:'#9a672f' }, pending_review:{ label:'等待审核', action:'查看状态', color:'#9a672f' }, rejected:{ label:'审核未通过', action:'重新提交', color:'#c2403a' }, authorization:{ label:'等待授权', action:'继续授权', color:'#9a672f' }, not_started:{ label:'未开通', action:'新增配置', color:'#8b8178' } }[state] || { label:'未开通', action:'新增配置', color:'#8b8178' };
    }
    var rows = Object.keys(providers || {}).map(function(key) {
      var provider = providers[key] || {};
      var state = stateFor(provider);
      var name = escapePaymentDialogHtml(provider.name || '支付服务商');
      var type = escapePaymentDialogHtml(provider.type || '支付方式');
      var logo = logoSources[key] || '';
      return '<div style="display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:12px;min-height:68px;padding:10px 14px;border-top:1px solid #eee7e0;box-sizing:border-box;"><span aria-label="' + name + ' Logo" style="display:grid;width:32px;height:32px;overflow:hidden;border:1px solid #e8e1da;border-radius:8px;place-items:center;background:#fff;"><img src="' + logo + '" alt="" referrerpolicy="no-referrer" style="display:block;width:24px;height:24px;object-fit:contain;" onerror="this.style.display=\'none\';"></span><div><strong style="display:block;color:#2e2823;font:600 14px/1.4 system-ui,sans-serif;">' + name + '</strong><span style="display:block;margin-top:2px;color:#7b7168;font:400 12px/1.5 system-ui,sans-serif;">' + type + '</span></div><span style="color:' + state.color + ';font:400 12px/1.5 system-ui,sans-serif;white-space:nowrap;">● ' + state.label + '</span><button type="button" data-payment-provider-catalog-item="' + escapePaymentDialogHtml(key) + '" style="height:32px;padding:0 12px;border:1px solid #e8e1da;border-radius:8px;background:#fff;color:#4d443d;font:500 12px/1 system-ui,sans-serif;cursor:pointer;">' + state.action + '</button></div>';
    }).join('');
    paymentProviderSource = source;
    paymentProviderDialog = document.createElement('div');
    paymentProviderDialog.id = 'paymentProviderCatalogDialog';
    paymentProviderDialog.setAttribute('role', 'presentation');
    paymentProviderDialog.style.cssText = 'position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(25,21,18,.46);box-sizing:border-box;';
    paymentProviderDialog.innerHTML = '<section role="dialog" aria-modal="true" aria-labelledby="paymentProviderCatalogDialogTitle" style="display:flex;width:min(680px,100%);max-height:calc(100vh - 48px);min-height:0;box-sizing:border-box;flex-direction:column;overflow:hidden;padding:24px;border:1px solid #e8e1da;border-radius:12px;background:#fff;box-shadow:0 24px 56px rgba(42,32,24,.25);"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;"><div><h2 id="paymentProviderCatalogDialogTitle" style="margin:0;color:#2e2823;font:600 16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;">配置收款服务商</h2><p style="margin:4px 0 0;color:#7b7168;font:400 12px/1.6 system-ui,sans-serif;">按服务商要求完成官方授权或填写配置信息。</p></div><button type="button" data-payment-dialog-close aria-label="关闭" style="width:32px;height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:#7b7168;font:400 24px/1 system-ui,sans-serif;cursor:pointer;">×</button></div><div style="min-height:0;overflow-y:auto;margin-top:18px;border:1px solid #e8e1da;border-radius:10px;scrollbar-gutter:stable;">' + rows + '</div><div style="display:flex;justify-content:flex-end;margin-top:20px;"><button type="button" data-payment-dialog-close style="height:36px;padding:0 14px;border:1px solid #e8e1da;border-radius:8px;background:#fff;color:#4d443d;font:500 12px/1 system-ui,sans-serif;cursor:pointer;">关闭</button></div></section>';
    host.appendChild(paymentProviderDialog);
    paymentProviderDialog.querySelectorAll('[data-payment-dialog-close]').forEach(function(button) { button.addEventListener('click', closePaymentProviderDialog); });
    paymentProviderDialog.querySelectorAll('[data-payment-provider-catalog-item]').forEach(function(button) { button.addEventListener('click', function() { var key = button.getAttribute('data-payment-provider-catalog-item'); openPaymentProviderDialog(source, key, (providers || {})[key] || {}); }); });
    paymentProviderDialog.addEventListener('click', function(event) { if (event.target === paymentProviderDialog) closePaymentProviderDialog(); });
    paymentProviderKeydown = function(event) { if (event.key === 'Escape') closePaymentProviderDialog(); };
    document.addEventListener('keydown', paymentProviderKeydown);
  }

  function openCreditCardProviderDialog(source, providers, currentKey) {
    closePaymentProviderDialog();
    var host = document.getElementById('dialogHost');
    if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }
    var logoSources = { stripe:'https://cdn.simpleicons.org/stripe/635BFF?viewbox=auto', airwallex:'https://www.airwallex.com/favicon.ico', qianhai:'https://www.oceanpayment.com/favicon.ico' };
    var fees = { stripe:'参考手续费：2.9% + US$0.30 / 笔', airwallex:'参考手续费：2.9% + US$0.30 / 笔', qianhai:'参考手续费：3.5% + US$0.30 / 笔' };
    var rows = ['stripe','airwallex','qianhai'].map(function(key) {
      var provider = (providers || {})[key] || {};
      var name = escapePaymentDialogHtml(provider.name || key);
      var isCurrent = key === currentKey;
      var state = provider.connected ? '已配置' : '未配置';
      return '<button type="button" data-credit-card-provider="' + key + '" style="display:grid;width:100%;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;min-height:68px;padding:10px 14px;border:0;border-top:1px solid #eee7e0;background:' + (isCurrent ? '#fffaf4' : '#fff') + ';color:#2e2823;text-align:left;cursor:pointer;"><span aria-label="' + name + ' Logo" style="display:grid;width:32px;height:32px;overflow:hidden;border:1px solid #e8e1da;border-radius:8px;place-items:center;background:#fff;"><img src="' + logoSources[key] + '" alt="" referrerpolicy="no-referrer" style="display:block;width:24px;height:24px;object-fit:contain;" onerror="this.style.display=\'none\';"></span><span><strong style="display:block;font:600 14px/1.4 system-ui,sans-serif;">' + name + '信用卡</strong><span style="display:block;margin-top:2px;color:#7b7168;font:400 12px/1.5 system-ui,sans-serif;">' + fees[key] + ' · 支持 7 种国际卡组织</span></span><span style="color:' + (provider.connected ? '#129e5a' : '#8b8178') + ';font:400 12px/1.5 system-ui,sans-serif;white-space:nowrap;">' + (isCurrent ? '● 当前生效' : state) + '</span></button>';
    }).join('');
    paymentProviderSource = source;
    paymentProviderDialog = document.createElement('div');
    paymentProviderDialog.id = 'creditCardProviderDialog';
    paymentProviderDialog.setAttribute('role', 'presentation');
    paymentProviderDialog.style.cssText = 'position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(25,21,18,.46);box-sizing:border-box;';
    paymentProviderDialog.innerHTML = '<section role="dialog" aria-modal="true" aria-labelledby="creditCardProviderDialogTitle" style="width:min(620px,100%);max-height:calc(100vh - 48px);overflow:auto;box-sizing:border-box;padding:24px;border:1px solid #e8e1da;border-radius:12px;background:#fff;box-shadow:0 24px 56px rgba(42,32,24,.25);"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;"><div><h2 id="creditCardProviderDialogTitle" style="margin:0;color:#2e2823;font:600 16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;">选择信用卡服务商</h2><p style="margin:4px 0 0;color:#7b7168;font:400 12px/1.6 system-ui,sans-serif;">Stripe、空中云汇和钱海只能选择一家作为当前生效的信用卡服务商。</p></div><button type="button" data-payment-dialog-close aria-label="关闭" style="width:32px;height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:#7b7168;font:400 24px/1 system-ui,sans-serif;cursor:pointer;">×</button></div><div style="overflow:hidden;margin-top:18px;border:1px solid #e8e1da;border-radius:10px;">' + rows + '</div><div style="display:flex;justify-content:flex-end;margin-top:20px;"><button type="button" data-payment-dialog-close style="height:36px;padding:0 14px;border:1px solid #e8e1da;border-radius:8px;background:#fff;color:#4d443d;font:500 12px/1 system-ui,sans-serif;cursor:pointer;">取消</button></div></section>';
    host.appendChild(paymentProviderDialog);
    paymentProviderDialog.querySelectorAll('[data-payment-dialog-close]').forEach(function(button) { button.addEventListener('click', closePaymentProviderDialog); });
    paymentProviderDialog.querySelectorAll('[data-credit-card-provider]').forEach(function(button) { button.addEventListener('click', function() { var key = button.getAttribute('data-credit-card-provider'); source.postMessage({ type:'rbk-payment-provider-saved', providerKey:key, provider:{}, primaryCardProvider:key }, '*'); closePaymentProviderDialog(); }); });
    paymentProviderDialog.addEventListener('click', function(event) { if (event.target === paymentProviderDialog) closePaymentProviderDialog(); });
    paymentProviderKeydown = function(event) { if (event.key === 'Escape') closePaymentProviderDialog(); };
    document.addEventListener('keydown', paymentProviderKeydown);
  }

  function openPaymentActivationConfirmDialog(source) {
    closePaymentProviderDialog();
    var host = document.getElementById('dialogHost');
    if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }
    paymentProviderSource = source;
    paymentProviderDialog = document.createElement('div');
    paymentProviderDialog.id = 'paymentActivationConfirmDialog';
    paymentProviderDialog.setAttribute('role', 'presentation');
    paymentProviderDialog.style.cssText = 'position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(25,21,18,.46);box-sizing:border-box;';
    paymentProviderDialog.innerHTML = '<section role="dialog" aria-modal="true" aria-labelledby="paymentActivationConfirmTitle" style="width:min(460px,100%);box-sizing:border-box;padding:24px;border:1px solid #e8e1da;border-radius:12px;background:#fff;box-shadow:0 24px 56px rgba(42,32,24,.25);"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;"><div><h2 id="paymentActivationConfirmTitle" style="margin:0;color:#2e2823;font:600 16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;">确认保存并生效？</h2><p style="margin:8px 0 0;color:#7b7168;font:400 12px/1.65 system-ui,sans-serif;">保存后，已选择且已配置的支付方式将立即在买家结账页生效；未配置的方式不会向买家展示。</p></div><button type="button" data-payment-dialog-close aria-label="关闭" style="width:32px;height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:#7b7168;font:400 24px/1 system-ui,sans-serif;cursor:pointer;">×</button></div><div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px;"><button type="button" data-payment-dialog-close style="height:36px;padding:0 14px;border:1px solid #e8e1da;border-radius:8px;background:#fff;color:#4d443d;font:500 12px/1 system-ui,sans-serif;cursor:pointer;">取消</button><button type="button" data-payment-activation-confirm style="height:36px;padding:0 14px;border:0;border-radius:8px;background:#c58c54;color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer;">确认保存并生效</button></div></section>';
    host.appendChild(paymentProviderDialog);
    paymentProviderDialog.querySelectorAll('[data-payment-dialog-close]').forEach(function(button) { button.addEventListener('click', closePaymentProviderDialog); });
    paymentProviderDialog.querySelector('[data-payment-activation-confirm]').addEventListener('click', function() { if (paymentProviderSource) paymentProviderSource.postMessage({ type:'rbk-payment-activation-confirmed' }, '*'); closePaymentProviderDialog(); });
    paymentProviderDialog.addEventListener('click', function(event) { if (event.target === paymentProviderDialog) closePaymentProviderDialog(); });
    paymentProviderKeydown = function(event) { if (event.key === 'Escape') closePaymentProviderDialog(); };
    document.addEventListener('keydown', paymentProviderKeydown);
  }

  function openPaymentCheckoutPreviewDialog(source, methods) {
    closePaymentProviderDialog();
    var host = document.getElementById('dialogHost');
    if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }
    var rows = (Array.isArray(methods) ? methods : []).map(function(method, index) { return '<label style="display:flex;align-items:center;gap:12px;min-height:62px;padding:10px 14px;border-top:1px solid #eee7e0;box-sizing:border-box;cursor:pointer;"><input type="radio" name="paymentCheckoutPreview"' + (index === 0 ? ' checked' : '') + ' style="width:16px;height:16px;margin:0;accent-color:#c58c54;"><span style="display:grid;width:30px;height:30px;place-items:center;border:1px solid #e8e1da;border-radius:8px;color:#8c5e32;font:600 12px/1 system-ui,sans-serif;">' + escapePaymentDialogHtml((method.name || '付').charAt(0)) + '</span><span><strong style="display:block;color:#2e2823;font:600 14px/1.4 system-ui,sans-serif;">' + escapePaymentDialogHtml(method.name || '支付方式') + '</strong><span style="display:block;margin-top:2px;color:#7b7168;font:400 12px/1.5 system-ui,sans-serif;">' + escapePaymentDialogHtml(method.description || '') + '</span></span></label>'; }).join('');
    paymentProviderSource = source;
    paymentProviderDialog = document.createElement('div');
    paymentProviderDialog.id = 'paymentCheckoutPreviewDialog';
    paymentProviderDialog.setAttribute('role', 'presentation');
    paymentProviderDialog.style.cssText = 'position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(25,21,18,.46);box-sizing:border-box;';
    paymentProviderDialog.innerHTML = '<section role="dialog" aria-modal="true" aria-labelledby="paymentCheckoutPreviewTitle" style="width:min(520px,100%);box-sizing:border-box;padding:24px;border:1px solid #e8e1da;border-radius:12px;background:#fff;box-shadow:0 24px 56px rgba(42,32,24,.25);"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;"><div><h2 id="paymentCheckoutPreviewTitle" style="margin:0;color:#2e2823;font:600 16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;">买家端支付方式示例</h2><p style="margin:4px 0 0;color:#7b7168;font:400 12px/1.6 system-ui,sans-serif;">结账页会按以下顺序展示已选择且已配置的支付方式。</p></div><button type="button" data-payment-dialog-close aria-label="关闭" style="width:32px;height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:#7b7168;font:400 24px/1 system-ui,sans-serif;cursor:pointer;">×</button></div><div style="margin-top:18px;border:1px solid #e8e1da;border-radius:10px;overflow:hidden;">' + (rows || '<div style="padding:28px 14px;color:#7b7168;font:400 12px/1.6 system-ui,sans-serif;text-align:center;">暂无可在买家端展示的支付方式。</div>') + '</div><button type="button" disabled style="display:block;width:100%;height:42px;margin-top:18px;border:0;border-radius:8px;background:#c58c54;color:#fff;font:600 14px/1 system-ui,sans-serif;opacity:.7;">继续支付</button><div style="display:flex;justify-content:flex-end;margin-top:20px;"><button type="button" data-payment-dialog-close style="height:36px;padding:0 14px;border:1px solid #e8e1da;border-radius:8px;background:#fff;color:#4d443d;font:500 12px/1 system-ui,sans-serif;cursor:pointer;">关闭</button></div></section>';
    host.appendChild(paymentProviderDialog);
    paymentProviderDialog.querySelectorAll('[data-payment-dialog-close]').forEach(function(button) { button.addEventListener('click', closePaymentProviderDialog); });
    paymentProviderDialog.addEventListener('click', function(event) { if (event.target === paymentProviderDialog) closePaymentProviderDialog(); });
    paymentProviderKeydown = function(event) { if (event.key === 'Escape') closePaymentProviderDialog(); };
    document.addEventListener('keydown', paymentProviderKeydown);
  }

  // ---- 发货地点配置：由父页面承载，完整覆盖后台视口 ----
  function openShippingLocationDialog(source, location) {
    closePaymentProviderDialog();
    var host = document.getElementById('dialogHost');
    if (!host) { host = document.createElement('div'); host.id = 'dialogHost'; document.body.appendChild(host); }
    location = location || {};
    var countries = { CN: '中国大陆', US: '美国', GB: '英国' };
    var provinces = {
      CN: ['广东省', '浙江省', '江苏省', '上海市', '北京市'],
      US: ['California', 'New York', 'Texas', 'Washington'],
      GB: ['England', 'Scotland', 'Wales', 'Northern Ireland']
    };
    var country = location.country || 'CN';
    var province = location.province || (provinces[country] || [])[0] || '';
    function optionList(values, value) {
      return values.map(function(item) { return '<option value="' + escapePaymentDialogHtml(item) + '"' + (item === value ? ' selected' : '') + '>' + escapePaymentDialogHtml(item) + '</option>'; }).join('');
    }
    function provinceOptions(value, selected) { return optionList(provinces[value] || [], selected); }
    paymentProviderSource = source;
    paymentProviderDialog = document.createElement('div');
    paymentProviderDialog.id = 'shippingLocationDialog';
    paymentProviderDialog.setAttribute('role', 'presentation');
    paymentProviderDialog.style.cssText = 'position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(25,21,18,.46);box-sizing:border-box;';
    paymentProviderDialog.innerHTML = '<style>#shippingLocationDialog,#shippingLocationDialog *{font-family:var(--font-sans)!important;}</style><section role="dialog" aria-modal="true" aria-labelledby="shippingLocationDialogTitle" style="width:min(640px,100%);max-height:calc(100vh - 48px);overflow:auto;box-sizing:border-box;padding:24px;border:1px solid #e8e1da;border-radius:12px;background:#fff;box-shadow:0 24px 56px rgba(42,32,24,.25);"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;"><div><h2 id="shippingLocationDialogTitle" style="margin:0;color:#2e2823;font:600 16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;">' + (location.id ? '编辑发货地点' : '添加发货地点') + '</h2><p style="margin:4px 0 0;color:#7b7168;font:400 12px/1.6 system-ui,-apple-system,Segoe UI,sans-serif;">地点名称会在买家结账时作为发货地点展示，也用于 SKU 库存和 ERP 库存同步。</p></div><button type="button" data-shipping-location-close aria-label="关闭" style="width:32px;height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:#7b7168;font:400 24px/1 system-ui,sans-serif;cursor:pointer;">×</button></div><form data-shipping-location-form style="margin-top:20px;"><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 18px;"><label style="grid-column:1 / -1;display:block;color:#2e2823;font:600 14px/1.5 system-ui,sans-serif;">地点名称<input required name="name" maxlength="80" placeholder="例如：深圳主仓" value="' + escapePaymentDialogHtml(location.name || '') + '" style="display:block;width:100%;height:40px;box-sizing:border-box;margin-top:6px;padding:0 12px;border:1px solid #e8e1da;border-radius:8px;color:#2e2823;font:400 14px/1 system-ui,sans-serif;"></label><label style="display:block;color:#2e2823;font:600 14px/1.5 system-ui,sans-serif;">国家/地区<select required name="country" data-shipping-country style="display:block;width:100%;height:40px;box-sizing:border-box;margin-top:6px;padding:0 12px;border:1px solid #e8e1da;border-radius:8px;background:#fff;color:#2e2823;font:400 14px/1 system-ui,sans-serif;">' + Object.keys(countries).map(function(key) { return '<option value="' + key + '"' + (key === country ? ' selected' : '') + '>' + countries[key] + '</option>'; }).join('') + '</select></label><label style="display:block;color:#2e2823;font:600 14px/1.5 system-ui,sans-serif;">省/州<select required name="province" data-shipping-province style="display:block;width:100%;height:40px;box-sizing:border-box;margin-top:6px;padding:0 12px;border:1px solid #e8e1da;border-radius:8px;background:#fff;color:#2e2823;font:400 14px/1 system-ui,sans-serif;">' + provinceOptions(country, province) + '</select></label><label style="display:block;color:#2e2823;font:600 14px/1.5 system-ui,sans-serif;">城市<input required name="city" maxlength="80" placeholder="请输入城市" value="' + escapePaymentDialogHtml(location.city || '') + '" style="display:block;width:100%;height:40px;box-sizing:border-box;margin-top:6px;padding:0 12px;border:1px solid #e8e1da;border-radius:8px;color:#2e2823;font:400 14px/1 system-ui,sans-serif;"></label><label style="display:block;color:#2e2823;font:600 14px/1.5 system-ui,sans-serif;">邮编<input required name="postalCode" maxlength="20" placeholder="请输入邮编" value="' + escapePaymentDialogHtml(location.postalCode || '') + '" style="display:block;width:100%;height:40px;box-sizing:border-box;margin-top:6px;padding:0 12px;border:1px solid #e8e1da;border-radius:8px;color:#2e2823;font:400 14px/1 system-ui,sans-serif;"></label><label style="display:block;color:#2e2823;font:600 14px/1.5 system-ui,sans-serif;">电话区号<input required name="phoneCode" maxlength="8" placeholder="例如：+86" value="' + escapePaymentDialogHtml(location.phoneCode || '+86') + '" style="display:block;width:100%;height:40px;box-sizing:border-box;margin-top:6px;padding:0 12px;border:1px solid #e8e1da;border-radius:8px;color:#2e2823;font:400 14px/1 system-ui,sans-serif;"></label><label style="display:block;color:#2e2823;font:600 14px/1.5 system-ui,sans-serif;">电话号码<input required name="phone" maxlength="30" placeholder="请输入电话号码" value="' + escapePaymentDialogHtml(location.phone || '') + '" style="display:block;width:100%;height:40px;box-sizing:border-box;margin-top:6px;padding:0 12px;border:1px solid #e8e1da;border-radius:8px;color:#2e2823;font:400 14px/1 system-ui,sans-serif;"></label></div><div style="display:flex;flex-wrap:wrap;gap:18px;margin-top:20px;padding:14px 0;border-top:1px solid #eee7e0;border-bottom:1px solid #eee7e0;"><label style="display:flex;align-items:center;gap:8px;color:#2e2823;font:500 14px/1.5 system-ui,sans-serif;cursor:pointer;"><input type="checkbox" name="available"' + (location.available !== false ? ' checked' : '') + ' style="width:16px;height:16px;margin:0;accent-color:#c58c54;">地点可用</label><label style="display:flex;align-items:center;gap:8px;color:#2e2823;font:500 14px/1.5 system-ui,sans-serif;cursor:pointer;"><input type="checkbox" name="erpConnected"' + (location.erpConnected !== false ? ' checked' : '') + ' style="width:16px;height:16px;margin:0;accent-color:#c58c54;">开启三方 ERP 库存连接</label><label style="display:flex;align-items:center;gap:8px;color:#2e2823;font:500 14px/1.5 system-ui,sans-serif;cursor:pointer;"><input type="checkbox" name="isDefault"' + (location.isDefault ? ' checked' : '') + ' style="width:16px;height:16px;margin:0;accent-color:#c58c54;">设为默认地点</label></div><p style="margin:10px 0 0;color:#7b7168;font:400 12px/1.6 system-ui,sans-serif;">默认地点是商城的兜底主仓库，建议设置为库存最全、发货最频繁的主仓库。</p><div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px;"><button type="button" data-shipping-location-close style="height:36px;padding:0 14px;border:1px solid #e8e1da;border-radius:8px;background:#fff;color:#4d443d;font:500 12px/1 system-ui,sans-serif;cursor:pointer;">取消</button><button type="submit" style="height:36px;padding:0 14px;border:0;border-radius:8px;background:#c58c54;color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer;">保存地点</button></div></form></section>';
    paymentProviderDialog.insertAdjacentHTML('afterbegin', '<style>#shippingLocationDialog [data-shipping-location-form]>div:first-child{gap:18px 20px!important;}#shippingLocationDialog [data-shipping-location-form] label>input:not([type="checkbox"]),#shippingLocationDialog [data-shipping-location-form] label>select{margin-top:8px!important;}#shippingLocationDialog .searchable-select{display:block!important;width:100%!important;min-width:0!important;margin-top:8px!important;}#shippingLocationDialog .searchable-select-trigger{display:flex!important;width:100%!important;min-width:0!important;height:40px!important;padding:0 40px 0 12px!important;border:1px solid #e8e1da!important;border-radius:8px!important;box-shadow:none!important;}</style>');
    host.appendChild(paymentProviderDialog);
    paymentProviderDialog.querySelectorAll('[data-shipping-location-close]').forEach(function(button) { button.addEventListener('click', closePaymentProviderDialog); });
    var form = paymentProviderDialog.querySelector('[data-shipping-location-form]');
    var countrySelect = paymentProviderDialog.querySelector('[data-shipping-country]'); var provinceSelect = paymentProviderDialog.querySelector('[data-shipping-province]');
    countrySelect.id = 'shippingLocationCountry'; provinceSelect.id = 'shippingLocationProvince';
    var formGrid = form.firstElementChild;
    var addressField = document.createElement('label');
    addressField.style.cssText = 'grid-column:1 / -1;display:block;color:#2e2823;font:600 14px/1.5 system-ui,sans-serif;';
    addressField.innerHTML = '详细地址<input name="address" maxlength="160" placeholder="请输入街道、门牌号等详细地址" value="' + escapePaymentDialogHtml(location.address || '') + '" style="display:block;width:100%;height:40px;box-sizing:border-box;margin-top:6px;padding:0 12px;border:1px solid #e8e1da;border-radius:8px;color:#2e2823;font:400 14px/1 system-ui,sans-serif;">';
    formGrid.appendChild(addressField);
    form.querySelectorAll('input[type="checkbox"]').forEach(function(input) {
      var label = input.parentElement; var visual = document.createElement('span');
      input.setAttribute('data-shipping-checkbox-input', ''); input.style.cssText = 'position:absolute;width:1px;height:1px;margin:-1px;opacity:0;pointer-events:none;';
      visual.className = 'checkbox' + (input.checked ? ' checked' : ''); visual.setAttribute('data-shipping-checkbox-visual', ''); visual.setAttribute('aria-hidden', 'true'); visual.textContent = input.checked ? '✓' : '';
      input.insertAdjacentElement('afterend', visual);
      input.addEventListener('change', function() { visual.classList.toggle('checked', input.checked); visual.textContent = input.checked ? '✓' : ''; });
    });
    function refreshShippingSearchableSelect(select) {
      if (select._searchable) {
        var refs = select._searchable;
        if (refs.dropdown && refs.dropdown.parentNode) refs.dropdown.remove();
        if (refs.wrapper && refs.wrapper.parentNode) refs.wrapper.remove();
        select.style.display = ''; select._searchable = null;
      }
      if (typeof buildSearchableSelect === 'function') buildSearchableSelect(select);
    }
    if (typeof initSearchableSelects === 'function') initSearchableSelects();
    countrySelect.addEventListener('change', function() { provinceSelect.innerHTML = provinceOptions(countrySelect.value, (provinces[countrySelect.value] || [])[0] || ''); refreshShippingSearchableSelect(provinceSelect); });
    form.addEventListener('submit', function(event) { event.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } if (paymentProviderSource) paymentProviderSource.postMessage({ type:'rbk-shipping-location-saved', location:{ id: location.id || ('location_' + Date.now()), name:String(form.elements.name.value || '').trim(), country:form.elements.country.value, province:form.elements.province.value, city:String(form.elements.city.value || '').trim(), postalCode:String(form.elements.postalCode.value || '').trim(), phoneCode:String(form.elements.phoneCode.value || '').trim(), phone:String(form.elements.phone.value || '').trim(), available:form.elements.available.checked, erpConnected:form.elements.erpConnected.checked, isDefault:form.elements.isDefault.checked } }, '*'); closePaymentProviderDialog(); });
    paymentProviderDialog.addEventListener('click', function(event) { if (event.target === paymentProviderDialog) closePaymentProviderDialog(); });
    paymentProviderKeydown = function(event) { if (event.key === 'Escape') closePaymentProviderDialog(); };
    document.addEventListener('keydown', paymentProviderKeydown);
    form.addEventListener('submit', function(event) { event.preventDefault(); event.stopImmediatePropagation(); if (!form.checkValidity()) { form.reportValidity(); return; } if (paymentProviderSource) paymentProviderSource.postMessage({ type:'rbk-shipping-location-saved', location:{ id: location.id || ('location_' + Date.now()), name:String(form.elements.name.value || '').trim(), country:form.elements.country.value, province:form.elements.province.value, city:String(form.elements.city.value || '').trim(), postalCode:String(form.elements.postalCode.value || '').trim(), address:String(form.elements.address.value || '').trim(), phoneCode:String(form.elements.phoneCode.value || '').trim(), phone:String(form.elements.phone.value || '').trim(), available:form.elements.available.checked, erpConnected:form.elements.erpConnected.checked, isDefault:form.elements.isDefault.checked } }, '*'); closePaymentProviderDialog(); }, true);
    var firstField = paymentProviderDialog.querySelector('input'); if (firstField) firstField.focus();
  }

  window.addEventListener('message', function(event) {
    var message = event.data || {};
    var activeIframe = getActiveIframe();
    if (!activeIframe || event.source !== activeIframe.contentWindow) return;
    if (message.type === 'rbk-payment-provider-dialog') openPaymentProviderDialog(event.source, message.providerKey, message.provider || {});
    if (message.type === 'rbk-credit-card-provider-dialog') openCreditCardProviderDialog(event.source, message.providers || {}, message.currentKey || '');
    if (message.type === 'rbk-payment-activation-confirm-dialog') openPaymentActivationConfirmDialog(event.source);
    if (message.type === 'rbk-payment-checkout-preview-dialog') openPaymentCheckoutPreviewDialog(event.source, message.methods || []);
    if (message.type === 'rbk-payment-provider-catalog-dialog') openPaymentProviderCatalogDialog(event.source, message.providers || {});
    if (message.type === 'rbk-payment-routing-dialog') openPaymentRoutingDialog(event.source, message.providers || {}, message.cardRouting || {});
    if (message.type === 'rbk-payment-method-catalog-dialog') openPaymentMethodCatalogDialog(event.source, message);
    if (message.type === 'rbk-messaging-provider-dialog') openMessagingProviderDialog(event.source, message);
    if (message.type === 'rbk-messaging-provider-config-dialog') openMessagingProviderConfigDialog(event.source, message);
    if (message.type === 'rbk-shipping-location-dialog') openShippingLocationDialog(event.source, message.location || null);
  });

  // ---- Escape 键关闭对话框 ----
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (!hasVisibleDialog()) return;
    hideBackdrop();
  });

})();
