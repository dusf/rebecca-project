(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.UserComponents = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const CONTROL_OPTIONS = {
    accountStatus: [
      { value: 'all', label: '账号状态', placeholder: true },
      { value: 'active', label: '已注册' },
      { value: 'pending', label: '待激活' },
      { value: 'disabled', label: '已禁用' }
    ],
    marketingStatus: [
      { value: 'all', label: '营销状态', placeholder: true },
      { value: 'subscribed', label: '已订阅' },
      { value: 'not_subscribed', label: '未订阅' },
      { value: 'pending', label: '待确认' },
      { value: 'unsubscribed', label: '已退订' },
      { value: 'invalid', label: '无效邮箱' }
    ]
  };

  var controllers = typeof WeakMap === 'function' ? new WeakMap() : null;
  var idSequence = 0;

  function normalizeOptions(name, options) {
    if (!Array.isArray(options) || options.length === 0) {
      throw new Error('UserComponents: "' + name + '" requires at least one option.');
    }
    var seenValues = new Set();
    var normalized = options.map(function (option, index) {
      var value = option && option.value !== null && option.value !== undefined
        ? String(option.value).trim()
        : '';
      var label = option ? String(option.label || '').trim() : '';
      if (!value || !label) {
        throw new Error('UserComponents: every option requires a non-empty value and label.');
      }
      if (seenValues.has(value)) {
        throw new Error('UserComponents: duplicate option value "' + value + '".');
      }
      seenValues.add(value);
      return {
        value: value,
        label: label,
        sequence: index + 1,
        disabled: Boolean(option.disabled),
        placeholder: Boolean(option.placeholder)
      };
    });
    if (!normalized.some(function (option) { return !option.disabled; })) {
      throw new Error('UserComponents: "' + name + '" requires at least one enabled option.');
    }
    return normalized;
  }

  function getDocument(element) {
    return element.ownerDocument || (root && root.document) || null;
  }

  function dispatchChange(element, name, value, label) {
    var doc = getDocument(element);
    var detail = { name: name, value: value, label: label };
    var event;
    if (root && typeof root.CustomEvent === 'function') {
      event = new root.CustomEvent('um:change', { bubbles: true, detail: detail });
    } else if (doc && doc.createEvent) {
      event = doc.createEvent('CustomEvent');
      event.initCustomEvent('um:change', true, false, detail);
    }
    if (event) element.dispatchEvent(event);
  }

  function resolveElement(target, scope) {
    if (target && target.nodeType === 1) return target;
    var doc = scope || (root && root.document);
    if (!doc || typeof target !== 'string') return null;
    return doc.querySelector(target);
  }

  function makeComboboxElement(name, value, doc) {
    var element = doc.createElement('div');
    element.className = 'um-combobox';
    element.setAttribute('data-um-combobox', name);
    element.setAttribute('data-value', value || '');
    element.innerHTML =
      '<button class="um-control um-combobox-trigger" type="button" aria-haspopup="listbox" aria-expanded="false"></button>' +
      '<div class="um-combobox-popover" role="listbox" hidden>' +
        '<div class="um-combobox-search-wrap">' +
          '<input class="um-combobox-search" type="text" placeholder="输入关键词搜索" aria-label="搜索选项">' +
        '</div>' +
        '<div class="um-combobox-options"></div>' +
      '</div>';
    return element;
  }

  function mountCombobox(element, suppliedOptions) {
    if (!element || element.nodeType !== 1) return null;
    if (controllers && controllers.has(element)) return controllers.get(element);

    var name = element.getAttribute('data-um-combobox') || '';
    var source = suppliedOptions || CONTROL_OPTIONS[name];
    var options = normalizeOptions(name, source);
    var trigger = element.querySelector('.um-combobox-trigger');
    var popover = element.querySelector('.um-combobox-popover');
    var search = element.querySelector('.um-combobox-search');
    var optionsHost = element.querySelector('.um-combobox-options');
    if (!trigger || !popover || !search || !optionsHost) {
      throw new Error('UserComponents: invalid combobox markup for "' + name + '".');
    }

    idSequence += 1;
    var listboxId = popover.id || 'um-listbox-' + idSequence;
    popover.id = listboxId;
    trigger.setAttribute('aria-controls', listboxId);
    search.setAttribute('aria-controls', listboxId);

    var value = String(element.getAttribute('data-value') || options[0].value);
    if (!options.some(function (option) { return option.value === value && !option.disabled; })) {
      value = options.filter(function (option) { return !option.disabled; })[0].value;
    }
    var filtered = options.slice();
    var activeIndex = 0;
    var isOpen = false;

    function selectedOption() {
      return options.filter(function (option) { return option.value === value; })[0] || options[0];
    }

    function enabledIndexes() {
      var indexes = [];
      filtered.forEach(function (option, index) {
        if (!option.disabled) indexes.push(index);
      });
      return indexes;
    }

    function normalizeActive(preferred) {
      var indexes = enabledIndexes();
      if (!indexes.length) {
        activeIndex = -1;
        return;
      }
      if (indexes.indexOf(preferred) !== -1) {
        activeIndex = preferred;
        return;
      }
      activeIndex = indexes[0];
    }

    function renderOptions() {
      optionsHost.innerHTML = '';
      if (!filtered.length) {
        var empty = getDocument(element).createElement('div');
        empty.className = 'um-combobox-empty';
        empty.textContent = '没有匹配选项';
        optionsHost.appendChild(empty);
        activeIndex = -1;
        search.removeAttribute('aria-activedescendant');
        return;
      }

      normalizeActive(activeIndex);
      filtered.forEach(function (option, index) {
        var optionButton = getDocument(element).createElement('button');
        optionButton.type = 'button';
        optionButton.className = 'um-combobox-option';
        optionButton.id = listboxId + '-option-' + index;
        optionButton.setAttribute('role', 'option');
        optionButton.setAttribute('data-value', option.value);
        optionButton.setAttribute('aria-selected', option.value === value ? 'true' : 'false');
        optionButton.tabIndex = -1;
        optionButton.disabled = option.disabled;
        var sequence = getDocument(element).createElement('span');
        sequence.className = 'um-combobox-option-sequence';
        sequence.setAttribute('aria-hidden', 'true');
        sequence.textContent = option.sequence + '.';
        var label = getDocument(element).createElement('span');
        label.className = 'um-combobox-option-label';
        label.textContent = option.label;
        optionButton.appendChild(sequence);
        optionButton.appendChild(label);
        if (index === activeIndex) optionButton.classList.add('is-active');
        optionButton.addEventListener('mouseenter', function () {
          if (!option.disabled) {
            activeIndex = index;
            syncActive();
          }
        });
        optionButton.addEventListener('click', function () {
          if (!option.disabled) selectAt(index, true);
        });
        optionsHost.appendChild(optionButton);
      });
      syncActive();
    }

    function syncActive() {
      var nodes = optionsHost.querySelectorAll('.um-combobox-option');
      Array.prototype.forEach.call(nodes, function (node, index) {
        node.classList.toggle('is-active', index === activeIndex);
      });
      if (activeIndex >= 0 && nodes[activeIndex]) {
        search.setAttribute('aria-activedescendant', nodes[activeIndex].id);
        if (typeof nodes[activeIndex].scrollIntoView === 'function') {
          nodes[activeIndex].scrollIntoView({ block: 'nearest' });
        }
      } else {
        search.removeAttribute('aria-activedescendant');
      }
    }

    function syncValue() {
      var option = selectedOption();
      element.setAttribute('data-value', value);
      trigger.textContent = option.label;
      trigger.setAttribute('data-value', value);
      trigger.classList.toggle('is-placeholder', option.placeholder);
      Array.prototype.forEach.call(optionsHost.querySelectorAll('.um-combobox-option'), function (node) {
        node.setAttribute('aria-selected', node.getAttribute('data-value') === value ? 'true' : 'false');
      });
    }

    function open(focusSearch) {
      if (trigger.disabled || isOpen) return;
      isOpen = true;
      popover.hidden = false;
      element.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      filtered = options.slice();
      search.value = '';
      activeIndex = filtered.findIndex(function (option) { return option.value === value && !option.disabled; });
      renderOptions();
      if (focusSearch !== false) search.focus();
    }

    function close(restoreFocus) {
      if (!isOpen) return;
      isOpen = false;
      popover.hidden = true;
      element.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      search.removeAttribute('aria-activedescendant');
      if (restoreFocus) trigger.focus();
    }

    function selectAt(index, emit) {
      var option = filtered[index];
      if (!option || option.disabled) return;
      value = option.value;
      syncValue();
      close(true);
      if (emit) dispatchChange(element, name, value, option.label);
    }

    function moveActive(direction) {
      var indexes = enabledIndexes();
      if (!indexes.length) return;
      var position = indexes.indexOf(activeIndex);
      if (position === -1) position = direction > 0 ? -1 : 0;
      position = (position + direction + indexes.length) % indexes.length;
      activeIndex = indexes[position];
      syncActive();
    }

    function handleNavigation(event) {
      if (event.isComposing === true || event.keyCode === 229) return;
      var key = event.key;
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        if (!isOpen) open(false);
        moveActive(key === 'ArrowDown' ? 1 : -1);
      } else if (key === 'Home' || key === 'End') {
        event.preventDefault();
        if (!isOpen) open(false);
        var indexes = enabledIndexes();
        if (indexes.length) {
          activeIndex = key === 'Home' ? indexes[0] : indexes[indexes.length - 1];
          syncActive();
        }
      } else if (key === 'Enter') {
        event.preventDefault();
        if (!isOpen) open(true);
        else selectAt(activeIndex, true);
      } else if (key === 'Escape' && isOpen) {
        event.preventDefault();
        close(true);
      }
    }

    function onTriggerClick() {
      if (isOpen) close(false);
      else open(true);
    }

    function onSearchInput() {
      var query = search.value.trim().toLocaleLowerCase();
      filtered = options.filter(function (option) {
        return option.label.toLocaleLowerCase().indexOf(query) !== -1 ||
          option.value.toLocaleLowerCase().indexOf(query) !== -1 ||
          String(option.sequence).indexOf(query) !== -1;
      });
      activeIndex = filtered.findIndex(function (option) { return option.value === value && !option.disabled; });
      renderOptions();
    }

    function onDocumentPointer(event) {
      if (isOpen && !element.contains(event.target)) close(false);
    }

    trigger.addEventListener('click', onTriggerClick);
    trigger.addEventListener('keydown', handleNavigation);
    search.addEventListener('input', onSearchInput);
    search.addEventListener('keydown', handleNavigation);
    getDocument(element).addEventListener('pointerdown', onDocumentPointer);
    syncValue();
    renderOptions();

    var controller = {
      element: element,
      open: open,
      close: close,
      getValue: function () { return value; },
      setValue: function (nextValue, emit) {
        var normalized = String(nextValue);
        var option = options.filter(function (item) {
          return item.value === normalized && !item.disabled;
        })[0];
        if (!option) return false;
        value = normalized;
        syncValue();
        if (emit) dispatchChange(element, name, value, option.label);
        return true;
      },
      refresh: function (nextOptions) {
        var previousValue = value;
        options = normalizeOptions(name, nextOptions);
        if (!options.some(function (option) { return option.value === value && !option.disabled; })) {
          value = options.filter(function (option) { return !option.disabled; })[0].value;
        }
        filtered = options.slice();
        activeIndex = 0;
        syncValue();
        renderOptions();
        if (value !== previousValue) {
          var option = selectedOption();
          dispatchChange(element, name, value, option.label);
        }
      },
      destroy: function () {
        close(false);
        trigger.removeEventListener('click', onTriggerClick);
        trigger.removeEventListener('keydown', handleNavigation);
        search.removeEventListener('input', onSearchInput);
        search.removeEventListener('keydown', handleNavigation);
        getDocument(element).removeEventListener('pointerdown', onDocumentPointer);
        if (controllers) controllers.delete(element);
      }
    };
    if (controllers) controllers.set(element, controller);
    return controller;
  }

  function mount(scope) {
    var base = scope || (root && root.document);
    if (!base || !base.querySelectorAll) return [];
    var mounted = [];
    if (base.nodeType === 1 && base.matches('[data-um-combobox]')) {
      mounted.push(mountCombobox(base));
    }
    Array.prototype.forEach.call(base.querySelectorAll('[data-um-combobox]'), function (element) {
      mounted.push(mountCombobox(element));
    });
    return mounted;
  }

  function controllerFor(target, scope) {
    var element = resolveElement(target, scope);
    if (!element) return null;
    return controllers && controllers.get(element) || mountCombobox(element);
  }

  var api = {
    CONTROL_OPTIONS: CONTROL_OPTIONS,
    mount: mount,
    mountCombobox: mountCombobox,
    createCombobox: function (name, value, doc) {
      var targetDocument = doc || (root && root.document);
      if (!targetDocument) return null;
      normalizeOptions(name, CONTROL_OPTIONS[name]);
      return makeComboboxElement(name, value || CONTROL_OPTIONS[name][0].value, targetDocument);
    },
    getValue: function (target, scope) {
      var controller = controllerFor(target, scope);
      return controller ? controller.getValue() : null;
    },
    setValue: function (target, value, emit, scope) {
      var controller = controllerFor(target, scope);
      return controller ? controller.setValue(value, emit) : false;
    },
    refresh: function (target, options, scope) {
      var controller = controllerFor(target, scope);
      if (!controller) return false;
      controller.refresh(options);
      return true;
    },
    closeAll: function (scope) {
      var base = scope || (root && root.document);
      if (!base || !base.querySelectorAll) return;
      Array.prototype.forEach.call(base.querySelectorAll('[data-um-combobox]'), function (element) {
        var controller = controllers && controllers.get(element);
        if (controller) controller.close(false);
      });
    }
  };

  if (root && root.document) {
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', function () { mount(root.document); });
    } else {
      mount(root.document);
    }
  }

  return api;
});
