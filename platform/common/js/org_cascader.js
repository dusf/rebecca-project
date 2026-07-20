// ==================== 组织级联选择器 ====================
// 基于扁平 orgData 生成多级级联下拉，适配账号筛选和表单选择场景
// 数据约定：每个节点含 id / name / type / parent / status
//
// 用法：
//   var picker = OrgCascader.create(container, {
//     data: orgData,
//     placeholder: '全部组织',       // 根级占位文本（不传则默认“请选择”）
//     allowEmpty: true,              // 是否允许不选（即 placeholder 作为有效选项）
//     value: '瑞贝卡集团/瑞贝卡科技/技术研发部', // 按完整路径设置，或传节点 id
//     onChange: function(value, node) { // value 为当前选中节点的完整路径字符串
//       console.log(value, node);
//     }
//   });
//   picker.setValue('...');
//   picker.getValue();   // 返回完整路径字符串或空字符串
//   picker.getNode();    // 返回当前选中的节点对象或 null
//   picker.destroy();

(function() {
  'use strict';

  var ORG_TYPE_ORDER = ['group', 'company', 'dept', 'team'];

  function getChildren(data, parentId) {
    return data.filter(function(item) {
      return (item.parent || null) === (parentId || null) &&
             item.status !== 'disabled';
    }).sort(function(a, b) {
      return (a.sort || 0) - (b.sort || 0);
    });
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

  function findNodeByPath(data, path) {
    if (!path) return null;
    var parts = path.split('/');
    var parentId = null;
    var matched = null;
    for (var i = 0; i < parts.length; i++) {
      var children = getChildren(data, parentId);
      var found = null;
      for (var j = 0; j < children.length; j++) {
        if (children[j].name === parts[i]) {
          found = children[j];
          break;
        }
      }
      if (!found) return null;
      matched = found;
      parentId = found.id;
    }
    return matched;
  }

  function getNodeLevel(node) {
    if (!node) return -1;
    var idx = ORG_TYPE_ORDER.indexOf(node.type);
    return idx === -1 ? 0 : idx;
  }

  function Cascader(container, options) {
    this.container = container;
    this.data = options.data || [];
    this.placeholder = options.placeholder || '请选择';
    this.allowEmpty = options.allowEmpty === true;
    this.onChange = options.onChange || null;
    this.selects = [];
    this.currentNode = null;

    this.render();
    if (options.value) this.setValue(options.value);
  }

  Cascader.prototype.render = function() {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.selects = [];
    this.addLevel(null);
  };

  Cascader.prototype.addLevel = function(parentId) {
    var wrapper = document.createElement('div');
    wrapper.className = 'org-cascader-level';

    var select = document.createElement('select');
    select.className = 'org-cascader-select';

    var placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = this.selects.length === 0 ? this.placeholder : '请选择';
    select.appendChild(placeholderOption);

    var children = getChildren(this.data, parentId);
    for (var i = 0; i < children.length; i++) {
      var opt = document.createElement('option');
      opt.value = children[i].id;
      opt.textContent = children[i].name;
      select.appendChild(opt);
    }

    var self = this;
    select.addEventListener('change', function() {
      self.handleLevelChange(wrapper, select.value);
    });

    wrapper.appendChild(select);
    this.container.appendChild(wrapper);
    this.selects.push(wrapper);
  };

  Cascader.prototype.handleLevelChange = function(wrapper, value) {
    // 移除当前级之后的所有级
    var idx = this.selects.indexOf(wrapper);
    while (this.selects.length > idx + 1) {
      var last = this.selects.pop();
      if (last && last.parentNode) last.parentNode.removeChild(last);
    }

    if (!value) {
      this.currentNode = null;
      this.fireChange();
      return;
    }

    var node = findNode(this.data, value);
    this.currentNode = node;

    // 如果该节点还有子节点且不是最后一级，追加下一级
    var children = node ? getChildren(this.data, node.id) : [];
    if (children.length > 0) {
      this.addLevel(node.id);
    }

    this.fireChange();
  };

  Cascader.prototype.fireChange = function() {
    var value = this.getValue();
    if (this.onChange) this.onChange(value, this.currentNode);
  };

  Cascader.prototype.setValue = function(value) {
    var node = null;
    if (typeof value === 'string') {
      // 先按完整路径尝试
      node = findNodeByPath(this.data, value);
      if (!node) {
        // 再按 id 尝试
        node = findNode(this.data, value);
      }
    }

    this.render();
    this.currentNode = node;

    if (!node) {
      this.fireChange();
      return;
    }

    // 从根到当前节点构建路径
    var path = [node];
    var current = node;
    while (current.parent) {
      current = findNode(this.data, current.parent);
      if (!current) break;
      path.unshift(current);
    }

    // 清空容器，按路径重新生成
    this.container.innerHTML = '';
    this.selects = [];

    for (var i = 0; i < path.length; i++) {
      this.addLevelAt(i === 0 ? null : path[i - 1].id, path[i].id);
    }

    // 如果最后一级还有子节点，追加一个空级供继续选择
    var last = path[path.length - 1];
    var children = getChildren(this.data, last.id);
    if (children.length > 0) {
      this.addLevel(last.id);
    }

    this.fireChange();
  };

  Cascader.prototype.addLevelAt = function(parentId, selectedId) {
    var wrapper = document.createElement('div');
    wrapper.className = 'org-cascader-level';

    var select = document.createElement('select');
    select.className = 'org-cascader-select';

    var placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = this.selects.length === 0 ? this.placeholder : '请选择';
    select.appendChild(placeholderOption);

    var children = getChildren(this.data, parentId);
    for (var i = 0; i < children.length; i++) {
      var opt = document.createElement('option');
      opt.value = children[i].id;
      opt.textContent = children[i].name;
      if (children[i].id === selectedId) opt.selected = true;
      select.appendChild(opt);
    }

    var self = this;
    select.addEventListener('change', function() {
      self.handleLevelChange(wrapper, select.value);
    });

    wrapper.appendChild(select);
    this.container.appendChild(wrapper);
    this.selects.push(wrapper);
  };

  Cascader.prototype.getValue = function() {
    return this.currentNode ? getPath(this.data, this.currentNode) : '';
  };

  Cascader.prototype.getNode = function() {
    return this.currentNode;
  };

  Cascader.prototype.destroy = function() {
    if (this.container) this.container.innerHTML = '';
    this.selects = [];
    this.currentNode = null;
  };

  window.OrgCascader = {
    create: function(container, options) {
      return new Cascader(container, options);
    }
  };
})();
