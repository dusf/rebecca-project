/* ============================================
   会员中心页面交互 - member.js
   ============================================ */
(function(){
  'use strict';

  /* 路由导航 */
  document.querySelectorAll('[data-page]').forEach(function(link){
    link.addEventListener('click',function(e){
      e.preventDefault();
      var page=this.getAttribute('data-page');
      if(window.ShopRouter&&ShopRouter.loadPage) ShopRouter.loadPage(page);
      else if(window.loadPage) window.loadPage(page);
      else window.location.href=page;
    });
  });

  /* 查看升级规则 */
  var btn=document.getElementById('mcUpgradeBtn');
  if(btn) btn.addEventListener('click',function(){ alert('查看升级规则：累计消费达到对应成长值即可升级'); });

  /* 查看下一级权益 → 滚动到对比表 */
  var moreLink=document.getElementById('mcUpgradeMoreLink');
  if(moreLink) moreLink.addEventListener('click',function(e){
    e.preventDefault();
    var t=document.querySelector('.mc-compare-section');
    if(t) t.scrollIntoView({behavior:'smooth',block:'start'});
  });

  /* 表格展开/收起 */
  var toggle=document.getElementById('mcTableToggle');
  if(toggle) toggle.addEventListener('click',function(){
    var rows=document.querySelectorAll('.mc-compare-table tbody tr');
    var collapsed=this.textContent.includes('收起');
    for(var i=4;i<rows.length;i++){
      rows[i].style.display=collapsed?'none':'';
    }
    this.textContent=collapsed?'查看完整对比 ↓':'收起完整对比 ∧';
  });

  /* FAQ 更多 */
  var faqMore=document.getElementById('mcFaqMore');
  if(faqMore) faqMore.addEventListener('click',function(e){ e.preventDefault(); alert('跳转到会员帮助中心'); });

  /* 规则说明 */
  var rules=document.getElementById('mcRulesLink');
  if(rules) rules.addEventListener('click',function(e){ e.preventDefault(); alert('会员规则说明弹窗'); });

  /* 编辑个人资料 */
  var editBtn=document.getElementById('mcEditProfileBtn');
  if(editBtn) editBtn.addEventListener('click',function(){
    if(window.ShopRouter&&ShopRouter.loadPage) ShopRouter.loadPage('user/settings.html');
    else alert('跳转到账号设置');
  });

  /* 查看会员权益（滚动到权益区） */
  var benefitBtn=document.getElementById('mcViewBenefitsBtn');
  if(benefitBtn) benefitBtn.addEventListener('click',function(){
    var s=document.querySelector('.mc-benefits-section');
    if(s) s.scrollIntoView({behavior:'smooth',block:'start'});
  });

  /* 进度条入场动画 */
  function animateProgress(){
    document.querySelectorAll('.mc-progress-fill,.mc-mini-fill').forEach(function(el){
      var w=el.style.width; el.style.width='0';
      setTimeout(function(){ el.style.width=w; },250);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',animateProgress);
  else animateProgress();

})();
