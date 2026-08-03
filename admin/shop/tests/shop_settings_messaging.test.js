const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'shop_settings.html'), 'utf8');
const dialogHostSource = fs.readFileSync(path.resolve(__dirname, '..', '..', 'common', 'js', 'dialog_host.js'), 'utf8');

test('即时通讯配置以当前服务商为一级页，并具备买家端展示规则', () => {
  assert.match(source, /function messagingSettings\(\)/);
  assert.match(source, /function renderMessagingSettings\(\)/);
  assert.match(source, /function saveMessagingSettings\(event\)/);
  assert.match(source, /及时语/);
  assert.match(source, /Salesmartly/);
  assert.match(source, /Web 渠道 ID/);
  assert.match(source, /买家端公钥/);
  assert.match(source, /已授权域名/);
  assert.match(source, /验证配置/);
  assert.match(source, /当前服务商/);
  assert.match(source, /选择服务商/);
  assert.match(source, /function openMessagingProviderDialog\(\)/);
  assert.match(source, /rbk-messaging-provider-dialog/);
  assert.match(source, /rbk-messaging-provider-selected/);
  assert.match(source, /当前服务商/);
  assert.match(source, /即将支持/);
  assert.match(source, /启用买家端展示/);
  assert.match(source, /系统托管安装/);
  assert.match(source, /商品详情页：自动传递商品链接/);
  assert.match(source, /装修页优先规则/);
  assert.match(source, /function renderMessagingCenter\(\)/);
  assert.match(source, /messaging-preview-launcher/);
  assert.match(source, /仅会显示一个聊天入口/);
});

test('即时通讯服务商弹窗由后台顶层宿主渲染', () => {
  assert.match(dialogHostSource, /function openMessagingProviderDialog\(/);
  assert.match(dialogHostSource, /id = 'messagingProviderDialog'/);
  assert.match(dialogHostSource, /position:fixed;inset:0/);
  assert.match(dialogHostSource, /rbk-messaging-provider-selected/);
});
