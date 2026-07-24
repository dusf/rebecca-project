/* ============================================================
   赠品池 - 表单逻辑（admin/gift/js/gift_pool_form.js）
   支持：多个关联产品，每个产品多个SKU，并分别填写可赠送库存。无标签字段。
   ============================================================ */
(function () {
  'use strict';
  const GWP = window.GWP;

  const q = new URLSearchParams(location.search);
  const editId = q.get('edit');
  const isEdit = !!editId;

  let blocks = []; // { productId, productTitle, image, variants:[{variantId, sku, stock}] }

  function init() {
    GWP.gwpCombo(document);
    if (isEdit) {
      const item = GWP.getPool(editId);
      if (item) {
        document.getElementById('formTitle').textContent = '编辑赠品';
        document.getElementById('displayName').value = item.displayName || '';
        document.getElementById('remark').value = item.remark || '';
        GWP.setComboValue(document.getElementById('status'), item.status || 'active');
        blocks = (item.products || []).map((p) => ({
          productId: p.productId, productTitle: p.productTitle, image: p.image,
          variants: (p.variants || []).map((v) => ({ variantId: v.variantId, sku: v.sku, stock: v.stock || 0 }))
        }));
      }
    }
    renderBlocks();
    document.getElementById('addProductBtn').addEventListener('click', openAssocDialog);
    document.getElementById('btnCancel').addEventListener('click', () => GWP.back('pool'));
    document.getElementById('btnSave').addEventListener('click', save);
  }

  function openAssocDialog() {
    GWP.gwpOpenAssocDialog(blocks, (sel) => {
      const stockMap = {};
      blocks.forEach((b) => (b.variants || []).forEach((v) => { stockMap[b.productId + '::' + v.variantId] = v.stock; }));
      blocks = sel.map((p) => {
        const prod = GWP.getProduct(p.productId) || { variants: [] };
        return {
          productId: p.productId, productTitle: p.productTitle, image: p.image,
          variants: p.variantIds.map((vid) => {
            const v = (prod.variants || []).find((x) => x.id === vid) || {};
            return { variantId: vid, sku: v.sku || vid, stock: stockMap[p.productId + '::' + vid] || 0 };
          })
        };
      });
      renderBlocks();
    });
  }

  function renderBlocks() {
    const wrap = document.getElementById('productBlocks');
    const count = document.getElementById('prodCount');
    if (count) count.textContent = '已关联 ' + blocks.length + ' 个产品';
    if (!blocks.length) {
      wrap.innerHTML = '<div class="assoc-empty">暂未关联产品，点击「关联产品」开始添加</div>';
      return;
    }
    wrap.innerHTML = blocks.map((b, i) => {
      const pickLabel = b.productId ? GWP.escapeHtml(b.productTitle) : '未选择商品';
      const variants = (b.variants || []).map((v, vi) => `
        <div class="gwp-sku-row" data-vi="${vi}">
          <span class="gwp-sku-name">${GWP.escapeHtml(v.sku || v.variantId)}</span>
          <span class="gwp-sku-stock">
            <label>可赠库存</label>
            <input type="number" min="0" class="form-input gwp-stock-input" value="${Number(v.stock) || 0}" data-vi="${vi}">
          </span>
          <button type="button" class="gwp-sku-remove" data-del-variant="${vi}" title="移除 SKU">&times;</button>
        </div>`).join('') || '<div class="gwp-muted gwp-variant-empty">请先选择商品并添加 SKU</div>';
      return `
        <div class="gwp-prod-block" data-i="${i}">
          <div class="gwp-prod-main">
            <div class="product-img" data-pick="${i}" title="点击重新选择商品">${b.image || '📦'}</div>
            <div class="product-info" data-pick="${i}" style="cursor:pointer;">
              <div class="product-name">${pickLabel}</div>
              <div class="product-meta">${(b.variants || []).length} 个 SKU</div>
            </div>
            <span class="remove-product" data-del-block="${i}" title="移除产品">&times;</span>
          </div>
          <div class="gwp-sku-list">${variants}</div>
        </div>`;
    }).join('');

    wrap.querySelectorAll('[data-pick]').forEach((el) => el.addEventListener('click', () => openAssocDialog()));
    wrap.querySelectorAll('[data-del-block]').forEach((btn) => btn.addEventListener('click', () => { blocks.splice(+btn.dataset.delBlock, 1); renderBlocks(); }));
    wrap.querySelectorAll('[data-del-variant]').forEach((btn) => btn.addEventListener('click', () => {
      const bi = +btn.closest('.gwp-prod-block').dataset.i;
      blocks[bi].variants.splice(+btn.dataset.delVariant, 1);
      renderBlocks();
    }));
    wrap.querySelectorAll('.gwp-stock-input').forEach((inp) => inp.addEventListener('input', () => {
      const bi = +inp.closest('.gwp-prod-block').dataset.i;
      const vi = +inp.dataset.vi;
      blocks[bi].variants[vi].stock = Math.max(0, Number(inp.value) || 0);
    }));
  }

  function save() {
    const displayName = document.getElementById('displayName').value.trim();
    if (!displayName) { GWP.toast('请填写赠品名称'); return; }
    const valid = blocks.filter((b) => b.productId && b.variants.length);
    if (!valid.length) { GWP.toast('请至少关联一个产品并添加SKU'); return; }
    const obj = {
      id: editId || GWP.newId('P'),
      displayName,
      products: valid.map((b) => ({
        productId: b.productId, productTitle: b.productTitle, image: b.image,
        variants: b.variants.map((v) => ({ variantId: v.variantId, sku: v.sku, stock: Math.max(0, Number(v.stock) || 0) }))
      })),
      status: GWP.comboValue(document.getElementById('status')) || 'active',
      remark: document.getElementById('remark').value.trim(),
      createdAt: isEdit ? (GWP.getPool(editId) || {}).createdAt : GWP.today()
    };
    GWP.savePool(obj);
    GWP.toast('已保存');
    setTimeout(() => GWP.back('pool'), 400);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
