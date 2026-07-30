const assert = require('node:assert/strict');
const UserComponents = require('../js/user_components.js');

class FakeClassList {
  constructor(element) {
    this.element = element;
  }

  values() {
    return this.element.className.split(/\s+/).filter(Boolean);
  }

  write(values) {
    this.element.className = Array.from(new Set(values)).join(' ');
  }

  add(...names) {
    this.write(this.values().concat(names));
  }

  remove(...names) {
    this.write(this.values().filter((name) => !names.includes(name)));
  }

  toggle(name, force) {
    const values = this.values();
    const has = values.includes(name);
    const enabled = force === undefined ? !has : Boolean(force);
    if (enabled && !has) values.push(name);
    if (!enabled && has) values.splice(values.indexOf(name), 1);
    this.write(values);
    return enabled;
  }
}

class FakeElement {
  constructor(tagName, document) {
    this.nodeType = 1;
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = document;
    this.attributes = new Map();
    this.children = [];
    this.listeners = new Map();
    this.className = '';
    this.classList = new FakeClassList(this);
    this.hidden = false;
    this.disabled = false;
    this.textContent = '';
    this.value = '';
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'id') this.id = String(value);
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  set innerHTML(value) {
    if (value === '') this.children = [];
  }

  get innerHTML() {
    return '';
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(type, listeners.filter((item) => item !== listener));
  }

  dispatchEvent(event) {
    if (!event.target) {
      try {
        Object.defineProperty(event, 'target', { value: this, configurable: true });
      } catch (error) {
        // Native Node events expose a read-only target; these tests do not need to replace it.
      }
    }
    (this.listeners.get(event.type) || []).slice().forEach((listener) => listener(event));
    if (event.bubbles && this.parentNode) this.parentNode.dispatchEvent(event);
    return !event.defaultPrevented;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  contains(target) {
    return target === this || this.children.some((child) => child.contains(target));
  }

  matches(selector) {
    if (selector.startsWith('.')) return this.classList.values().includes(selector.slice(1));
    if (selector === '[data-um-combobox]') return this.attributes.has('data-um-combobox');
    return false;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const found = [];
    this.children.forEach((child) => {
      if (child.matches(selector)) found.push(child);
      found.push(...child.querySelectorAll(selector));
    });
    return found;
  }

  scrollIntoView() {}
}

class FakeDocument {
  constructor() {
    this.listeners = new Map();
    this.activeElement = null;
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }

  createEvent() {
    return {
      initCustomEvent(type, bubbles, cancelable, detail) {
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
        this.detail = detail;
      }
    };
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(type, listeners.filter((item) => item !== listener));
  }
}

function createKeyEvent(key, extra = {}) {
  return {
    type: 'keydown',
    key,
    keyCode: extra.keyCode || 0,
    isComposing: Boolean(extra.isComposing),
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    }
  };
}

function buildCombobox(value = 'active') {
  const document = new FakeDocument();
  const host = document.createElement('div');
  host.className = 'um-combobox';
  host.setAttribute('data-um-combobox', 'accountStatus');
  host.setAttribute('data-value', value);

  const trigger = document.createElement('button');
  trigger.className = 'um-control um-combobox-trigger';
  const popover = document.createElement('div');
  popover.className = 'um-combobox-popover';
  popover.hidden = true;
  const search = document.createElement('input');
  search.className = 'um-combobox-search';
  const options = document.createElement('div');
  options.className = 'um-combobox-options';
  popover.appendChild(search);
  popover.appendChild(options);
  host.appendChild(trigger);
  host.appendChild(popover);
  return { document, host, trigger, popover, search, options };
}

{
  const fixture = buildCombobox();
  const controller = UserComponents.mountCombobox(fixture.host);
  const composingEnter = createKeyEvent('Enter', { isComposing: true });
  fixture.search.dispatchEvent(composingEnter);
  assert.equal(fixture.popover.hidden, true, 'composing Enter must not open or select');
  assert.equal(composingEnter.defaultPrevented, false, 'IME must retain the event');

  const legacyComposingArrow = createKeyEvent('ArrowDown', { keyCode: 229 });
  fixture.trigger.dispatchEvent(legacyComposingArrow);
  assert.equal(fixture.popover.hidden, true, 'keyCode 229 must not navigate');
  assert.equal(legacyComposingArrow.defaultPrevented, false, 'legacy IME must retain the event');

  fixture.trigger.dispatchEvent(createKeyEvent('Enter'));
  assert.equal(fixture.popover.hidden, false, 'normal Enter must still open the combobox');
  controller.destroy();
}

{
  const fixture = buildCombobox('all');
  const controller = UserComponents.mountCombobox(fixture.host);
  assert.equal(
    fixture.trigger.classList.values().includes('is-placeholder'),
    true,
    'default prompt option must use placeholder styling'
  );
  controller.setValue('active', false);
  assert.equal(
    fixture.trigger.classList.values().includes('is-placeholder'),
    false,
    'a concrete selected value must use normal text styling'
  );
  controller.setValue('all', false);
  assert.equal(
    fixture.trigger.classList.values().includes('is-placeholder'),
    true,
    'returning to the default prompt must restore placeholder styling'
  );
  controller.destroy();
}

{
  const fixture = buildCombobox('all');
  const controller = UserComponents.mountCombobox(fixture.host);
  controller.open(false);
  assert.equal(fixture.options.children[0].children[0].textContent, '1.');
  assert.equal(fixture.options.children[2].children[0].textContent, '3.');

  fixture.search.value = '3';
  fixture.search.dispatchEvent({ type: 'input' });
  assert.equal(fixture.options.children.length, 1, 'a numeric query must match the stable option sequence');
  assert.equal(fixture.options.children[0].getAttribute('data-value'), 'pending');
  assert.equal(
    fixture.options.children[0].children[0].textContent,
    '3.',
    'filtered results must preserve their original natural-number sequence'
  );
  controller.destroy();
}

{
  const fixture = buildCombobox();
  const changes = [];
  fixture.host.addEventListener('um:change', (event) => changes.push(event.detail));
  const controller = UserComponents.mountCombobox(fixture.host);
  assert.equal(changes.length, 0, 'initialization must not emit a change');

  controller.refresh([{ value: 'pending', label: '待激活' }]);
  assert.equal(controller.getValue(), 'pending');
  assert.deepEqual(changes, [{
    name: 'accountStatus',
    value: 'pending',
    label: '待激活'
  }], 'refresh fallback must emit the same change detail as a normal selection');

  controller.refresh([{ value: 'pending', label: '待激活（新标签）' }]);
  assert.equal(changes.length, 1, 'refresh must not emit when the value is unchanged');
  controller.destroy();
}

for (const invalidOptions of [
  [{ value: null, label: '空值' }],
  [{ value: '', label: '空字符串' }],
  [{ value: '   ', label: '纯空白' }],
  [{ value: 'active', label: '选项一' }, { value: ' active ', label: '选项二' }]
]) {
  const fixture = buildCombobox();
  assert.throws(
    () => UserComponents.mountCombobox(fixture.host, invalidOptions),
    /value|duplicate/i
  );
}

console.log('user_components focused tests passed');
