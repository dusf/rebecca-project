// ==================== 组织树形选择器 ====================
// 适用于账号筛选、表单选择等场景，替代级联 select 下拉
//
// 用法：
//   var picker = OrgTreeSelect.create(container, {
//     data: orgData,
//     placeholder: '全部组织',
//     allowEmpty: true,                // 是否允许不选
//     value: '瑞贝卡集团/瑞贝卡科技',  // 设置选中值（完整路径）
//     onChange: function(value) { ... }
//   });
//   picker.getValue();   // 返回完整路径字符串或空字符串
//   picker.setValue(path);
//   picker.destroy();

(function() {
  'use strict';

  function buildTree(data) {
    var map = {};
    var roots = [];
    data.forEach(function(item) {
      item.children = [];
      map[item.id] = item;
    });
    data.forEach(function(item) {
      if (item.parent && map[item.parent]) {
        map[item.parent].children.push(item);
      } else {
        roots.push(item);
      }
    });
    function sortFn(node) {
      node.children.sort(function(a, b) { return (a.sort || 0) - (b.sort || 0); });
      node.children.forEach(sortFn);
    }
    roots.sort(function(a, b) { return (a.sort || 0) - (b.sort || 0); });
    roots.forEach(sortFn);
    return roots;
  }

  function findNode(data, id) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].id === id) return data[i];
    }
    return null;
  }

  function getPath(data, node) {
    if (!node) return '';
    var parts = [node.name];
    var current = node;
    while (current.parent) {
      current = findNode(data, current.parent);
      if (!current) break;
      parts.unshift(current.name);
    }
    return parts.join('/');
  }

  function TreeSelect(container, options) {
    this.container = container;
    this.data = options.data || [];
    this.placeholder = options.placeholder || '全部组织';
    this.allowEmpty = options.allowEmpty === true;
    this.onChange = options.onChange || null;
    this.currentNode = null;
    this.collapsedSet = {};
    this.dropdown = null;
    this.trigger = null;
    this.destroyed = false;

    this.render();
    if (options.value) this.setValue(options.value);
  }

  TreeSelect.prototype.render = function() {
    var self = this;
    var container = this.container;
    if (!container) return;
    container.innerHTML = '';

    // 触发器（类似 select 的外观）
    var trigger = document.createElement('div');
    trigger.className = 'org-tree-trigger';
    trigger.innerHTML = '<span class="org-tree-trigger-text">' + this.placeholder + '</span>' +
      '<svg class="org-tree-trigger-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
    this.trigger = trigger;
    container.appendChild(trigger);

    // 下拉面板
    var dropdown = document.createElement('div');
    dropdown.className = 'org-tree-dropdown';
    dropdown.style.display = 'none';
    this.dropdown = dropdown;

    // 全部组织选项（如果允许空）
    if (this.allowEmpty) {
      var clearItem = document.createElement('div');
      clearItem.className = 'org-tree-item org-tree-clear';
      clearItem.textContent = '全部组织';
      clearItem.addEventListener('click', function(e) {
        e.stopPropagation();
        self.currentNode = null;
        self.updateTrigger();
        self.close();
      });
      dropdown.appendChild(clearItem);
    }

    // 构建树节点
    var tree = buildTree(this.data);
    this.renderTree(tree, dropdown, 0);

    container.appendChild(dropdown);

    // 点击触发器切换显示
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      if (self.destroyed) return;
      if (dropdown.style.display === 'block') {
        self.close();
      } else {
        self.open();
      }
    });
  };

  TreeSelect.prototype.renderTree = function(nodes, parentEl, depth) {
    var self = this;
    nodes.forEach(function(node) {
      var hasChildren = node.children && node.children.length > 0;
      var wrapper = document.createElement('div');
      wrapper.className = 'org-tree-node';

      var item = document.createElement('div');
      item.className = 'org-tree-item';
      if (depth > 0) {
        item.style.paddingLeft = (depth * 24 + 12) + 'px';
      }

      // 展开/折叠图标
      var toggle = document.createElement('span');
      toggle.className = 'org-tree-toggle' + (hasChildren ? '' : ' org-tree-toggle-leaf');
      if (hasChildren) {
        toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
      }
      item.appendChild(toggle);

      // 节点名称
      var label = document.createElement('span');
      label.className = 'org-tree-label';
      label.textContent = node.name + (node.status === 'disabled' ? ' (已停用)' : '');
      item.appendChild(label);

      // 点击选中该节点
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        // 如果点击的是展开/折叠图标，执行展开/折叠
        if (e.target.closest('.org-tree-toggle') && hasChildren) {
          if (self.collapsedSet[node.id]) {
            delete self.collapsedSet[node.id];
            toggle.classList.remove('org-tree-collapsed');
          } else {
            self.collapsedSet[node.id] = true;
            toggle.classList.add('org-tree-collapsed');
          }
          childrenWrap.style.display = childrenWrap.style.display === 'none' ? 'block' : 'none';
          return;
        }
        // 选中节点
        self.currentNode = node;
        self.updateTrigger();
        self.close();
      });

      wrapper.appendChild(item);
      parentEl.appendChild(wrapper);

      // 子节点
      if (hasChildren) {
        var childrenWrap = document.createElement('div');
        childrenWrap.className = 'org-tree-children';
        self.renderTree(node.children, childrenWrap, depth + 1);
        wrapper.appendChild(childrenWrap);
      }
    });
  };

  TreeSelect.prototype.updateTrigger = function() {
    if (!this.trigger) return;
    var textEl = this.trigger.querySelector('.org-tree-trigger-text');
    if (textEl) {
      textEl.textContent = this.currentNode ? getPath(this.data, this.currentNode) : this.placeholder;
    }
    this.trigger.classList.toggle('has-value', !!this.currentNode);
  };

  TreeSelect.prototype.open = function() {
    if (!this.dropdown || this.destroyed) return;
    this.dropdown.style.display = 'block';
    // 更新当前值的高亮状态
    this.highlightCurrent();
  };

  TreeSelect.prototype.close = function() {
    if (!this.dropdown) return;
    this.dropdown.style.display = 'none';
    if (this.onChange) {
      this.onChange(this.getValue());
    }
  };

  TreeSelect.prototype.highlightCurrent = function() {
    if (!this.dropdown) return;
    var items = this.dropdown.querySelectorAll('.org-tree-item');
    var self = this;
    items.forEach(function(item) {
      item.classList.remove('org-tree-selected');
    });
    if (this.currentNode) {
      var labels = this.dropdown.querySelectorAll('.org-tree-label');
      labels.forEach(function(label) {
        if (label.textContent === self.currentNode.name || label.textContent === self.currentNode.name + ' (已停用)') {
          var item = label.closest('.org-tree-item');
          if (item) item.classList.add('org-tree-selected');
        }
      });
    }
  };

  TreeSelect.prototype.setValue = function(value) {
    if (!value) {
      this.currentNode = null;
      this.updateTrigger();
      return;
    }
    // 按完整路径查找节点
    var node = null;
    if (typeof value === 'string') {
      var parts = value.split('/');
      var parentId = null;
      for (var i = 0; i < parts.length; i++) {
        var children = this.data.filter(function(item) {
          return (item.parent || null) === parentId && item.name === parts[i];
        });
        if (children.length === 0) break;
        node = children[0];
        parentId = node.id;
      }
    }
    this.currentNode = node;
    this.updateTrigger();
  };

  TreeSelect.prototype.getValue = function() {
    return this.currentNode ? getPath(this.data, this.currentNode) : '';
  };

  TreeSelect.prototype.destroy = function() {
    this.destroyed = true;
    if (this.container) this.container.innerHTML = '';
    this.dropdown = null;
    this.trigger = null;
    this.currentNode = null;
  };

  // 全局：点击外部关闭所有树形选择器
  document.addEventListener('click', function(e) {
    document.querySelectorAll('.org-tree-dropdown').forEach(function(dd) {
      if (dd.style.display === 'block') {
        var container = dd.parentElement;
        if (container && !container.contains(e.target)) {
          dd.style.display = 'none';
        }
      }
    });
  });

  window.OrgTreeSelect = {
    create: function(container, options) {
      return new TreeSelect(container, options);
    }
  };
})();
