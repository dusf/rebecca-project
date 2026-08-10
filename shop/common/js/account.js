/* ============================================================
   NOIRÉ 登录 / 注册弹窗公共逻辑
   依赖：ShopRouter（可选）
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'noire_account_user';
  var LS_LOGGED_IN = 'noire_logged_in';

  var ICONS = {
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><polyline points="2,7 12,13 22,7"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,12 20,22 4,22 4,12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    percent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="17.5" r="1.5"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    sync: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6"/><path d="M21 11A9 9 0 0 0 5.25 6.25L2.5 9"/><path d="M3 13a9 9 0 0 0 15.75 4.75l2.75-2.75"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
  };

  var userInfo = null;
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) userInfo = JSON.parse(raw);
  } catch (e) { userInfo = null; }

  function isLoggedIn() {
    return localStorage.getItem(LS_LOGGED_IN) === '1' && !!userInfo;
  }

  function setLoggedIn(user) {
    userInfo = user || userInfo;
    if (userInfo) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(userInfo)); } catch (e) {}
    }
    localStorage.setItem(LS_LOGGED_IN, '1');
  }

  function logout() {
    localStorage.removeItem(LS_LOGGED_IN);
    userInfo = null;
  }

  function getUser() { return userInfo; }

  var modalHtml =
    '<div class="account-modal-overlay" id="accountModalOverlay">' +
      '<div class="account-modal">' +
        '<div class="account-modal-left">' +
          '<div class="account-modal-brand">' +
            '<p class="brand-label">欢迎加入</p>' +
            '<h1 class="brand-logo">NOIRÉ</h1>' +
            '<p class="brand-tagline">注册即享专属礼遇，开启你的奢美发艺之旅</p>' +
          '</div>' +
          '<div class="account-modal-benefits">' +
            '<div class="account-benefit-item">' +
              '<div class="account-benefit-icon">' + ICONS.gift + '</div>' +
              '<div class="account-benefit-text"><h4>100 积分</h4><p>注册成功即赠 100 积分</p></div>' +
            '</div>' +
            '<div class="account-benefit-item">' +
              '<div class="account-benefit-icon">' + ICONS.percent + '</div>' +
              '<div class="account-benefit-text"><h4>会员专属优惠</h4><p>尊享会员价与积分福利</p></div>' +
            '</div>' +
            '<div class="account-benefit-item">' +
              '<div class="account-benefit-icon">' + ICONS.heart + '</div>' +
              '<div class="account-benefit-text"><h4>收藏与订单同步</h4><p>跨设备同步，随时随地管理</p></div>' +
            '</div>' +
            '<div class="account-benefit-item">' +
              '<div class="account-benefit-icon">' + ICONS.bell + '</div>' +
              '<div class="account-benefit-text"><h4>新品动态抢先知</h4><p>第一时间获取新品与专属活动</p></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="account-modal-right">' +
          '<button class="account-modal-close" id="accountModalClose" aria-label="关闭">' + ICONS.close + '</button>' +
          '<div class="account-modal-tabs">' +
            '<button class="account-modal-tab active" data-tab="login">登录</button>' +
            '<button class="account-modal-tab" data-tab="register">注册</button>' +
          '</div>' +
          '<div class="account-panel active" data-panel="login">' + buildLoginPanel() + '</div>' +
          '<div class="account-panel" data-panel="register">' + buildRegisterPanel() + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  var SOCIAL_ICONS = {
    google: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#000000" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#000000" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .58.05.84.13V9.4a6.33 6.33 0 0 0-1-.05A6.34 6.34 0 1 0 14.97 16V9.04a8.27 8.27 0 0 0 4.62 1.4V7.04a4.85 4.85 0 0 1-1-1.35z"/></svg>'
  };

  function buildSocialBtns() {
    var order = ['google', 'facebook', 'tiktok', 'x'];
    var labels = { google: 'Google', facebook: 'Facebook', tiktok: 'TikTok', x: 'X' };
    return '<div class="account-social-btns">' +
      order.map(function (key) {
        return '<button type="button" class="account-social-btn" data-social="' + key + '">' +
          SOCIAL_ICONS[key] + '<span>' + labels[key] + '</span></button>';
      }).join('') + '</div>';
  }

  function buildLoginPanel() {
    return '<div class="account-modal-heading"><h2>欢迎回来</h2><p>登录账号，继续你的专属美发之旅</p></div>' +
      '<form class="account-form" id="loginForm">' +
        '<div class="account-input-group">' +
          '<label>邮箱地址</label>' +
          '<div class="account-input-wrap"><span class="input-icon">' + ICONS.mail + '</span><input type="email" id="loginEmail" placeholder="请输入邮箱地址" required></div>' +
        '</div>' +
        '<div class="account-input-group">' +
          '<label>登录密码</label>' +
          '<div class="account-input-wrap"><span class="input-icon">' + ICONS.lock + '</span><input type="password" id="loginPassword" placeholder="请输入登录密码" required><button type="button" class="account-toggle-password" data-toggle="loginPassword">' + ICONS.eye + '</button></div>' +
        '</div>' +
        '<div class="account-form-options">' +
          '<label class="account-remember"><input type="checkbox" id="loginRemember" checked><span>7天内免登录</span></label>' +
          '<a href="#" class="account-forgot">忘记密码？</a>' +
        '</div>' +
        '<button type="submit" class="account-submit-btn">立即登录</button>' +
      '</form>' +
      '<div class="account-divider"><span>或使用以下方式登录</span></div>' +
      buildSocialBtns() +
      '<div class="account-modal-footer">还没有账号？<a href="#" data-switch="register">立即注册</a></div>';
  }

  function buildRegisterPanel() {
    return '<div class="account-modal-heading"><h2>欢迎加入 NOIRÉ</h2><p>注册成为会员，解锁专属礼遇</p></div>' +
      '<div class="account-quick-benefits">' +
        '<div class="account-quick-benefit"><div>' + ICONS.gift + '</div><div><strong>100 积分</strong><span>新入注册即得</span></div></div>' +
        '<div class="account-quick-benefit"><div>' + ICONS.bell + '</div><div><strong>新品优先通知</strong><span>抢先获取上新</span></div></div>' +
        '<div class="account-quick-benefit"><div>' + ICONS.percent + '</div><div><strong>会员专属优惠</strong><span>折扣与积分福利</span></div></div>' +
      '</div>' +
      '<form class="account-form" id="registerForm">' +
        '<div class="account-input-group">' +
          '<label>邮箱地址</label>' +
          '<div class="account-input-wrap"><span class="input-icon">' + ICONS.mail + '</span><input type="email" id="registerEmail" placeholder="请输入邮箱地址" required></div>' +
        '</div>' +
        '<div class="account-input-group">' +
          '<label>验证码</label>' +
          '<div class="account-input-wrap has-suffix"><span class="input-icon">' + ICONS.shield + '</span><input type="text" id="registerCode" placeholder="请输入验证码" required><span class="account-input-suffix" id="sendCodeBtn">发送验证码</span></div>' +
        '</div>' +
        '<div class="account-input-group">' +
          '<label>设置密码</label>' +
          '<div class="account-input-wrap"><span class="input-icon">' + ICONS.lock + '</span><input type="password" id="registerPassword" placeholder="请设置 8-16 位密码" required minlength="8" maxlength="16"><button type="button" class="account-toggle-password" data-toggle="registerPassword">' + ICONS.eye + '</button></div>' +
        '</div>' +
        '<div class="account-agreement">' +
          '<input type="checkbox" id="registerAgree" required checked>' +
          '<span>我已阅读并同意<a href="#">《用户协议》</a>和<a href="#">《隐私政策》</a></span>' +
        '</div>' +
        '<button type="submit" class="account-submit-btn">注册并领取 100 积分</button>' +
      '</form>' +
      '<div class="account-divider"><span>或使用以下方式注册</span></div>' +
      buildSocialBtns() +
      '<div class="account-hint"><span>' + ICONS.check + '</span>若第三方账号未返回邮箱信息，系统将引导补充邮箱后完成注册。</div>' +
      '<div class="account-modal-footer">已有账号？<a href="#" data-switch="login">立即登录</a></div>';
  }

  var overlay = null;

  function init() {
    if (document.getElementById('accountModalOverlay')) return;
    var wrapper = document.createElement('div');
    wrapper.innerHTML = modalHtml;
    document.body.appendChild(wrapper.firstElementChild);
    overlay = document.getElementById('accountModalOverlay');
    bindModalEvents();
  }

  function bindModalEvents() {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    var closeBtn = document.getElementById('accountModalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    overlay.querySelectorAll('.account-modal-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchTab(this.getAttribute('data-tab'));
      });
    });

    overlay.querySelectorAll('[data-switch]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        switchTab(this.getAttribute('data-switch'));
      });
    });

    overlay.querySelectorAll('.account-toggle-password').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var inputId = this.getAttribute('data-toggle');
        var input = document.getElementById(inputId);
        if (!input) return;
        var isPwd = input.type === 'password';
        input.type = isPwd ? 'text' : 'password';
        this.innerHTML = isPwd ? ICONS.eyeOff : ICONS.eye;
      });
    });

    var sendCodeBtn = document.getElementById('sendCodeBtn');
    if (sendCodeBtn) {
      sendCodeBtn.addEventListener('click', function () {
        var email = document.getElementById('registerEmail').value.trim();
        if (!email) { alert('请先输入邮箱地址'); return; }
        var self = this;
        if (self.classList.contains('disabled')) return;
        self.classList.add('disabled');
        self.textContent = '已发送';
        var sec = 60;
        var timer = setInterval(function () {
          sec--;
          self.textContent = sec + 's';
          if (sec <= 0) {
            clearInterval(timer);
            self.classList.remove('disabled');
            self.textContent = '发送验证码';
          }
        }, 1000);
      });
    }

    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('loginEmail').value.trim();
        var pwd = document.getElementById('loginPassword').value;
        if (!email || !pwd) { alert('请填写邮箱和密码'); return; }
        // 演示：直接登录成功
        setLoggedIn({ email: email, name: email.split('@')[0], avatar: '' });
        closeModal();
        onLoginSuccess();
      });
    }

    var registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('registerEmail').value.trim();
        var code = document.getElementById('registerCode').value.trim();
        var pwd = document.getElementById('registerPassword').value;
        var agree = document.getElementById('registerAgree').checked;
        if (!email || !code || !pwd) { alert('请完整填写注册信息'); return; }
        if (!agree) { alert('请同意用户协议和隐私政策'); return; }
        setLoggedIn({ email: email, name: email.split('@')[0], avatar: '', points: 100 });
        closeModal();
        onLoginSuccess();
      });
    }

    overlay.querySelectorAll('[data-social]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        alert('演示模式：第三方登录将直接登录成功');
        setLoggedIn({ email: 'demo@noire.com', name: 'NOIRÉ 会员', avatar: '', points: 100 });
        closeModal();
        onLoginSuccess();
      });
    });
  }

  function switchTab(tab) {
    overlay.querySelectorAll('.account-modal-tab').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-tab') === tab);
    });
    overlay.querySelectorAll('.account-panel').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-panel') === tab);
    });
  }

  function openModal(defaultTab) {
    if (!overlay) init();
    switchTab(defaultTab || 'login');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  function onLoginSuccess() {
    // 同步刷新 header 头像和下拉菜单状态
    if (window.ShopHeader && window.ShopHeader.updateAccountState) {
      window.ShopHeader.updateAccountState();
    }
    // 登录成功后跳个人中心
    if (window.ShopRouter) {
      window.ShopRouter.loadPage('user/index.html');
    }
  }

  function handleAccountClick() {
    if (isLoggedIn()) {
      if (window.ShopRouter) {
        window.ShopRouter.loadPage('user/index.html');
      }
    } else {
      openModal('login');
    }
  }

  window.ShopAccount = {
    init: init,
    open: openModal,
    close: closeModal,
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    logout: logout,
    handleAccountClick: handleAccountClick
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
