/* NOIRÉ 个人中心占位逻辑 */
(function () {
  'use strict';

  var STORAGE_KEY = 'noire_account_user';
  var LS_LOGGED_IN = 'noire_logged_in';

  function init() {
    var userInfo = null;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) userInfo = JSON.parse(raw);
    } catch (e) { userInfo = null; }

    var nameEl = document.getElementById('userName');
    var emailEl = document.getElementById('userEmail');
    var avatarEl = document.getElementById('userAvatar');
    var pointsEl = document.getElementById('userPoints');

    if (userInfo) {
      if (nameEl) nameEl.textContent = userInfo.name || 'NOIRÉ 会员';
      if (emailEl) emailEl.textContent = userInfo.email || '';
      if (avatarEl) avatarEl.textContent = (userInfo.name || 'N').charAt(0).toUpperCase();
      if (pointsEl) pointsEl.textContent = userInfo.points != null ? userInfo.points : 100;
    }

    var logoutBtn = document.getElementById('userLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem(LS_LOGGED_IN);
        localStorage.removeItem(STORAGE_KEY);
        alert('已退出登录');
        if (window.ShopRouter) {
          window.ShopRouter.loadPage('index.html');
        } else {
          window.location.href = 'index.html';
        }
      });
    }

    var backBtn = document.getElementById('userBackHome');
    if (backBtn) {
      backBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.ShopRouter) {
          window.ShopRouter.loadPage('index.html');
        } else {
          window.location.href = 'index.html';
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
