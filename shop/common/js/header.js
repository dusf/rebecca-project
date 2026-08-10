/**
 * shop 公共头部 — 动态渲染 + 交互
 * 依赖：ShopI18n (i18n.js)
 */
(function () {
  'use strict';

  var I = window.ShopI18n;

  /* ---------- SVG 图标 ---------- */
  var ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    // 配件图标
    cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9"/><path d="M3 12h18"/><path d="M3 12c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5"/></svg>',
    comb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v12"/><path d="M6 3c0 1.5-1 2.5-2 3.5S2 9 2 10.5V12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-1.5c0-1.5-.8-2.5-1.8-3.5S18 4.5 18 3"/><path d="M6 3c0 1.5-1 2.5-2 3.5S2 9 2 10.5V12"/><path d="M10 3v18"/><path d="M14 3v18"/></svg>',
    sleep: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12c0-3.87 3.13-7 7-7s7 3.13 7 7"/><path d="M3 12h18"/><path d="M3 12c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5"/></svg>',
    stand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M12 12h.01"/></svg>',
    tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    // 品牌图标
    leaf2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
    hands: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    face: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M12 12h.01"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    // 帮助中心图标
    guide: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    // 个人中心下拉菜单图标
    order: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    helpCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    logOut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    wear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M12 12h.01"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
    headset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    user2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  };

  /* ---------- 导航配置（一级菜单栏） ---------- */
  var NAV_ITEMS = [
    { key: 'nav.new',        page: 'new-arrivals/index.html' },
    { key: 'nav.wig',        page: '#wig', hasMegaMenu: true },
    { key: 'nav.extension',  page: '#extension', hasMegaMenu: true },
    { key: 'nav.bestsellers',page: '#bestsellers', hasMegaMenu: true },
    { key: 'nav.accessory',  page: '#accessory', hasMegaMenu: true },
    { key: 'nav.brand',      page: '#brand', hasMegaMenu: true },
    { key: 'nav.help',       page: '#help', hasMegaMenu: true }
  ];

  /* ---------- Mega Menu 数据（假发分类） ---------- */
  var WIG_MEGA_MENU = {
    columns: [
      {
        titleKey: 'mega.wigType',
        items: [
          { key: 'mega.noGlue', page: '#' },
          { key: 'mega.hdLace', page: '#' },
          { key: 'mega.laceFront', page: '#' },
          { key: 'mega.closure', page: '#' },
          { key: 'mega.fullLace', page: '#' },
          { key: 'mega.upart', page: '#' },
          { key: 'mega.vpart', page: '#' }
        ]
      },
      {
        titleKey: 'mega.texture',
        items: [
          { key: 'mega.straight', page: '#' },
          { key: 'mega.deepWave', page: '#' },
          { key: 'mega.looseWave', page: '#' },
          { key: 'mega.deepCurl', page: '#' },
          { key: 'mega.bodyWave', page: '#' },
          { key: 'mega.naturalCurl', page: '#' },
          { key: 'mega.voluminous', page: '#' },
          { key: 'mega.smallCurl', page: '#' }
        ]
      },
      {
        titleKey: 'mega.length',
        items: [
          { key: 'mega.len8_12', page: '#' },
          { key: 'mega.len14_18', page: '#' },
          { key: 'mega.len20_24', page: '#' },
          { key: 'mega.len26_30', page: '#' },
          { key: 'mega.len32plus', page: '#' },
          { key: 'mega.lengthGuide', page: '#' }
        ]
      },
      {
        titleKey: 'mega.color',
        items: [
          { key: 'mega.naturalBlack', page: '#' },
          { key: 'mega.darkBrown', page: '#' },
          { key: 'mega.chocolateBrown', page: '#' },
          { key: 'mega.honeyBrown', page: '#' },
          { key: 'mega.golden', page: '#' },
          { key: 'mega.red', page: '#' },
          { key: 'mega.highlight', page: '#' },
          { key: 'mega.ombre', page: '#' }
        ]
      }
    ],
    promo: {
      image: 'images/jiafa.png',
      titleKey: 'mega.seasonPick',
      ctaKey: 'mega.explore'
    }
  };

  /* ---------- Mega Menu 数据（接发分类） ---------- */
  var EXTENSION_MEGA_MENU = {
    columns: [
      {
        titleKey: 'mega.extInstall',
        items: [
          { key: 'mega.extClipIn', page: '#' },
          { key: 'mega.extTapeIn', page: '#' },
          { key: 'mega.extWeft', page: '#' },
          { key: 'mega.extHandTied', page: '#' },
          { key: 'mega.extMicroRing', page: '#' },
          { key: 'mega.extITip', page: '#' },
          { key: 'mega.extUTip', page: '#' }
        ]
      },
      {
        titleKey: 'mega.extTexture',
        items: [
          { key: 'mega.extStraight', page: '#' },
          { key: 'mega.extBigWave', page: '#' },
          { key: 'mega.extLooseWave', page: '#' },
          { key: 'mega.extDeepWave', page: '#' },
          { key: 'mega.extWaterWave', page: '#' },
          { key: 'mega.extNaturalCurl', page: '#' },
          { key: 'mega.extVoluminous', page: '#' },
          { key: 'mega.extSmallCurl', page: '#' }
        ]
      },
      {
        titleKey: 'mega.extLength',
        items: [
          { key: 'mega.extLen12_16', page: '#' },
          { key: 'mega.extLen18_20', page: '#' },
          { key: 'mega.extLen22_24', page: '#' },
          { key: 'mega.extLen26_30', page: '#' },
          { key: 'mega.extLen32plus', page: '#' },
          { key: 'mega.extLengthGuide', page: '#' }
        ]
      },
      {
        titleKey: 'mega.extColor',
        items: [
          { key: 'mega.extNaturalBlack', page: '#' },
          { key: 'mega.extDarkBrown', page: '#' },
          { key: 'mega.extChocolateBrown', page: '#' },
          { key: 'mega.extHoneyBrown', page: '#' },
          { key: 'mega.extGolden', page: '#' },
          { key: 'mega.extHighlight', page: '#' },
          { key: 'mega.extOmbre', page: '#' },
          { key: 'mega.extColorMatch', page: '#' }
        ]
      },
      {
        titleKey: 'mega.extNeed',
        items: [
          { key: 'mega.extAddLength', page: '#' },
          { key: 'mega.extAddVolume', page: '#' },
          { key: 'mega.extAddHighlight', page: '#' },
          { key: 'mega.extTemporary', page: '#' },
          { key: 'mega.extRemovable', page: '#' },
          { key: 'mega.extLongTerm', page: '#' }
        ]
      }
    ],
    promo: {
      image: 'images/jiefa.png',
      titleKey: 'mega.seasonPick',
      ctaKey: 'mega.explore'
    }
  };

  /* ---------- Mega Menu 数据（帮助中心分类） ---------- */
  var HELP_MEGA_MENU = {
    type: 'help',
    columns: [
      {
        icon: 'guide',
        titleKey: 'mega.helpGuide',
        items: [
          { key: 'mega.helpWigGuide', page: '#' },
          { key: 'mega.helpExtGuide', page: '#' },
          { key: 'mega.helpWigType', page: '#' },
          { key: 'mega.helpLaceType', page: '#' },
          { key: 'mega.helpLength', page: '#' },
          { key: 'mega.helpColor', page: '#' },
          { key: 'mega.helpMeasure', page: '#' }
        ]
      },
      {
        icon: 'wear',
        titleKey: 'mega.helpWear',
        items: [
          { key: 'mega.helpWigTutorial', page: '#' },
          { key: 'mega.helpNoGlue', page: '#' },
          { key: 'mega.helpLaceCut', page: '#' },
          { key: 'mega.helpFixMethod', page: '#' },
          { key: 'mega.helpInstall', page: '#' },
          { key: 'mega.helpRemove', page: '#' },
          { key: 'mega.helpSleep', page: '#' },
          { key: 'mega.helpVideo', page: '#' }
        ]
      },
      {
        icon: 'truck',
        titleKey: 'mega.helpOrder',
        items: [
          { key: 'mega.helpQueryOrder', page: '#' },
          { key: 'mega.helpTrack', page: '#' },
          { key: 'mega.helpDelivery', page: '#' },
          { key: 'mega.helpTime', page: '#' },
          { key: 'mega.helpShipping', page: '#' },
          { key: 'mega.helpCustoms', page: '#' },
          { key: 'mega.helpCancel', page: '#' }
        ]
      },
      {
        icon: 'shield',
        titleKey: 'mega.helpReturn',
        items: [
          { key: 'mega.helpReturnPolicy', page: '#' },
          { key: 'mega.helpApplyReturn', page: '#' },
          { key: 'mega.helpRefund', page: '#' },
          { key: 'mega.helpQuality', page: '#' },
          { key: 'mega.helpWrong', page: '#' },
          { key: 'mega.helpDamage', page: '#' },
          { key: 'mega.helpModifyOrder', page: '#' }
        ]
      },
      {
        icon: 'headset',
        titleKey: 'mega.helpContact',
        items: [],
        isContact: true
      }
    ],
    contact: {
      subtitleKey: 'mega.helpContactSub',
      ctaKey: 'mega.helpContactBtn',
      methods: [
        { icon: 'chat', key: 'mega.helpLiveChat', page: '#' },
        { icon: 'mail', key: 'mega.helpEmail', page: '#' },
        { icon: 'user2', key: 'mega.helpConsult', page: '#' }
      ]
    }
  };

  /* ---------- Mega Menu 数据（品牌故事分类） ---------- */
  var BRAND_MEGA_MENU = {
    type: 'list',
    columns: [
      {
        icon: 'leaf2',
        titleKey: 'mega.brandOrigin',
        items: [
          { key: 'mega.brand初心', page: '#' },
          { key: 'mega.brandStory', page: '#' },
          { key: 'mega.brandHistory', page: '#' }
        ]
      },
      {
        icon: 'hands',
        titleKey: 'mega.brandCraft',
        items: [
          { key: 'mega.brandLace', page: '#' },
          { key: 'mega.brandHandTied', page: '#' },
          { key: 'mega.brandCap', page: '#' }
        ]
      },
      {
        icon: 'flame',
        titleKey: 'mega.brandQuality',
        items: [
          { key: 'mega.brandRealHair', page: '#' },
          { key: 'mega.brandSelect', page: '#' },
          { key: 'mega.brandTest', page: '#' }
        ]
      },
      {
        icon: 'face',
        titleKey: 'mega.brandPhilosophy',
        items: [
          { key: 'mega.brandNatural', page: '#' },
          { key: 'mega.brandConfidence', page: '#' },
          { key: 'mega.brandLongTerm', page: '#' }
        ]
      },
      {
        icon: 'heart',
        titleKey: 'mega.brandStories',
        items: [
          { key: 'mega.brandUserStory', page: '#' },
          { key: 'mega.brandBeforeAfter', page: '#' },
          { key: 'mega.brandCommunity', page: '#' }
        ]
      }
    ],
    promo: {
      image: 'images/pinpai.png',
      titleKey: 'mega.brandTitle',
      subtitleKey: 'mega.brandSub',
      ctaKey: 'mega.brandExplore'
    }
  };

  /* ---------- Mega Menu 数据（配件分类） ---------- */
  var ACCESSORY_MEGA_MENU = {
    type: 'list',
    columns: [
      {
        icon: 'cap',
        titleKey: 'mega.accFix',
        items: [
          { key: 'mega.accWigCap', page: '#' },
          { key: 'mega.accAntiSlip', page: '#' },
          { key: 'mega.accFixBand', page: '#' },
          { key: 'mega.accClip', page: '#' },
          { key: 'mega.accEdgeBand', page: '#' },
          { key: 'mega.accLaceFix', page: '#' }
        ]
      },
      {
        icon: 'comb',
        titleKey: 'mega.accStyle',
        items: [
          { key: 'mega.accWigComb', page: '#' },
          { key: 'mega.accWideTooth', page: '#' },
          { key: 'mega.accEdgeComb', page: '#' },
          { key: 'mega.accPuff', page: '#' },
          { key: 'mega.accSection', page: '#' },
          { key: 'mega.accKit', page: '#' }
        ]
      },
      {
        icon: 'sleep',
        titleKey: 'mega.accSleep',
        items: [
          { key: 'mega.accSilkCap', page: '#' },
          { key: 'mega.accSatinCap', page: '#' },
          { key: 'mega.accSleepBand', page: '#' },
          { key: 'mega.accPillow', page: '#' },
          { key: 'mega.accKit', page: '#' }
        ]
      },
      {
        icon: 'stand',
        titleKey: 'mega.accStore',
        items: [
          { key: 'mega.accStand', page: '#' },
          { key: 'mega.accFoldable', page: '#' },
          { key: 'mega.accWigHead', page: '#' },
          { key: 'mega.accDustBag', page: '#' },
          { key: 'mega.accTravel', page: '#' }
        ]
      },
      {
        icon: 'tool',
        titleKey: 'mega.accInstall',
        items: [
          { key: 'mega.accTweezers', page: '#' },
          { key: 'mega.accRingTool', page: '#' },
          { key: 'mega.accRemover', page: '#' },
          { key: 'mega.accSectionClip', page: '#' },
          { key: 'mega.accInstallKit', page: '#' }
        ]
      }
    ],
    promo: {
      image: 'images/peijian.png',
      titleKey: 'mega.accTitle',
      subtitleKey: 'mega.accSub',
      ctaKey: 'mega.accExplore'
    }
  };

  /* ---------- Mega Menu 数据（热门系列分类） ---------- */
  var BESTSELLERS_MEGA_MENU = {
    type: 'list',
    columns: [
      {
        icon: 'fire',
        titleKey: 'mega.bsHotList',
        items: [
          { key: 'mega.bsHotWig', page: '#' },
          { key: 'mega.bsHotExt', page: '#' },
          { key: 'mega.bsWeekHot', page: '#' },
          { key: 'mega.bsUserTop', page: '#' }
        ]
      },
      {
        icon: 'star',
        titleKey: 'mega.bsBeginner',
        items: [
          { key: 'mega.bsEasyStart', page: '#' },
          { key: 'mega.bsFirstBuy', page: '#' }
        ]
      },
      {
        icon: 'leaf',
        titleKey: 'mega.bsNatural',
        items: [
          { key: 'mega.bsNaturalLine', page: '#' },
          { key: 'mega.bsRealFeel', page: '#' }
        ]
      },
      {
        icon: 'star',
        titleKey: 'mega.bsScene',
        items: [
          { key: 'mega.bsDaily', page: '#' },
          { key: 'mega.bsDate', page: '#' },
          { key: 'mega.bsWedding', page: '#' },
          { key: 'mega.bsParty', page: '#' },
          { key: 'mega.bsVacation', page: '#' },
          { key: 'mega.bsContent', page: '#' }
        ]
      },
      {
        icon: 'sun',
        titleKey: 'mega.bsSeason',
        items: [
          { key: 'mega.bsSeasonPick', page: '#' }
        ]
      }
    ],
    promo: {
      image: 'images/xilie.png',
      titleKey: 'mega.bsSeriesPick',
      subtitleKey: 'mega.bsSeriesSub',
      ctaKey: 'mega.bsExplore'
    }
  };

  /* ---------- 渲染 Mega Menu HTML ---------- */
  function renderMegaMenu(menu) {
    // 帮助中心布局
    if (menu.type === 'help') {
      var columnsHtml = menu.columns.map(function (col) {
        var iconSvg = ICONS[col.icon] || '';
        if (col.isContact) {
          // 联系我们列 - 特殊布局
          var contactMethodsHtml = menu.contact.methods.map(function (m) {
            var mIconSvg = ICONS[m.icon] || '';
            return '<a href="' + m.page + '" class="help-contact-method" data-i18n="' + m.key + '">' + mIconSvg + '<span>' + I.t(m.key) + '</span></a>';
          }).join('');
          var subtitleHtml = menu.contact.subtitleKey ? '<p class="help-contact-subtitle" data-i18n="' + menu.contact.subtitleKey + '">' + I.t(menu.contact.subtitleKey) + '</p>' : '';
          return '<div class="help-column help-contact-column">' +
            '<div class="help-column-header">' +
              '<span class="help-column-icon">' + iconSvg + '</span>' +
              '<h4 class="help-column-title" data-i18n="' + col.titleKey + '">' + I.t(col.titleKey) + '</h4>' +
            '</div>' +
            '<div class="help-contact-body">' +
              subtitleHtml +
              '<a href="#" class="help-contact-cta" data-i18n="' + menu.contact.ctaKey + '">' + I.t(menu.contact.ctaKey) + '</a>' +
              '<div class="help-contact-methods">' + contactMethodsHtml + '</div>' +
            '</div>' +
          '</div>';
        }
        var itemsHtml = col.items.map(function (item) {
          return '<a href="' + item.page + '" class="help-list-item" data-i18n="' + item.key + '">' + I.t(item.key) + '<span class="help-item-arrow">›</span></a>';
        }).join('');
        return '<div class="help-column">' +
          '<div class="help-column-header">' +
            '<span class="help-column-icon">' + iconSvg + '</span>' +
            '<h4 class="help-column-title" data-i18n="' + col.titleKey + '">' + I.t(col.titleKey) + '</h4>' +
          '</div>' +
          '<div class="help-column-items">' + itemsHtml + '</div>' +
        '</div>';
      }).join('');

      return '<div class="mega-menu mega-menu-help">' +
        '<div class="mega-menu-inner">' +
          '<div class="help-columns">' + columnsHtml + '</div>' +
        '</div>' +
      '</div>';
    }

    // 配件列表布局
    if (menu.type === 'list') {
      var columnsHtml = menu.columns.map(function (col) {
        var iconSvg = ICONS[col.icon] || '';
        var itemsHtml = col.items.map(function (item) {
          return '<a href="' + item.page + '" class="acc-list-item" data-i18n="' + item.key + '">' + I.t(item.key) + '</a>';
        }).join('');
        return '<div class="acc-column">' +
          '<div class="acc-column-header">' +
            '<span class="acc-column-icon">' + iconSvg + '</span>' +
            '<h4 class="acc-column-title" data-i18n="' + col.titleKey + '">' + I.t(col.titleKey) + '</h4>' +
          '</div>' +
          '<div class="acc-column-items">' + itemsHtml + '</div>' +
        '</div>';
      }).join('');

      var promoHtml = '<div class="mega-menu-promo">' +
        '<img src="' + menu.promo.image + '" alt="Promo" class="mega-menu-promo-img">' +
        '<div class="mega-menu-promo-content">' +
          '<span class="mega-menu-promo-tag" data-i18n="' + menu.promo.titleKey + '">' + I.t(menu.promo.titleKey) + '</span>' +
          (menu.promo.subtitleKey ? '<span class="mega-menu-promo-sub" data-i18n="' + menu.promo.subtitleKey + '">' + I.t(menu.promo.subtitleKey) + '</span>' : '') +
          '<a href="#" class="mega-menu-promo-cta" data-i18n="' + menu.promo.ctaKey + '">' + I.t(menu.promo.ctaKey) + '</a>' +
        '</div>' +
      '</div>';

      return '<div class="mega-menu mega-menu-acc">' +
        '<div class="mega-menu-inner">' +
          '<div class="acc-columns">' + columnsHtml + '</div>' +
          promoHtml +
        '</div>' +
      '</div>';
    }

    // 热门系列列表布局
    if (menu.type === 'list') {
      var columnsHtml = menu.columns.map(function (col) {
        var iconSvg = ICONS[col.icon] || '';
        var itemsHtml = col.items.map(function (item) {
          return '<a href="' + item.page + '" class="bs-list-item" data-i18n="' + item.key + '">' + I.t(item.key) + '<span class="bs-item-arrow">›</span></a>';
        }).join('');
        return '<div class="bs-column">' +
          '<div class="bs-column-header">' +
            '<span class="bs-column-icon">' + iconSvg + '</span>' +
            '<h4 class="bs-column-title" data-i18n="' + col.titleKey + '">' + I.t(col.titleKey) + '</h4>' +
          '</div>' +
          '<div class="bs-column-items">' + itemsHtml + '</div>' +
        '</div>';
      }).join('');

      var promoHtml = '<div class="mega-menu-promo">' +
        '<img src="' + menu.promo.image + '" alt="Promo" class="mega-menu-promo-img">' +
        '<div class="mega-menu-promo-content">' +
          '<span class="mega-menu-promo-tag" data-i18n="' + menu.promo.titleKey + '">' + I.t(menu.promo.titleKey) + '</span>' +
          (menu.promo.subtitleKey ? '<span class="mega-menu-promo-sub" data-i18n="' + menu.promo.subtitleKey + '">' + I.t(menu.promo.subtitleKey) + '</span>' : '') +
          '<a href="#" class="mega-menu-promo-cta" data-i18n="' + menu.promo.ctaKey + '">' + I.t(menu.promo.ctaKey) + '</a>' +
        '</div>' +
      '</div>';

      return '<div class="mega-menu mega-menu-bs">' +
        '<div class="mega-menu-inner">' +
          '<div class="bs-columns">' + columnsHtml + '</div>' +
          promoHtml +
        '</div>' +
      '</div>';
    }

    // 假发/接发列表布局
    var isExtension = menu === EXTENSION_MEGA_MENU;
    var columnsClass = 'mega-menu-columns' + (isExtension ? ' ext-5cols' : '');

    var columnsHtml = menu.columns.map(function (col) {
      var itemsHtml = col.items.map(function (item) {
        return '<a href="' + item.page + '" class="mega-menu-item" data-page="' + item.page + '" data-i18n="' + item.key + '">' + I.t(item.key) + '</a>';
      }).join('');
      return '<div class="mega-menu-column">' +
        '<h4 class="mega-menu-column-title" data-i18n="' + col.titleKey + '">' + I.t(col.titleKey) + '</h4>' +
        '<div class="mega-menu-items">' + itemsHtml + '</div>' +
      '</div>';
    }).join('');

    var promoHtml = '<div class="mega-menu-promo">' +
      '<img src="' + menu.promo.image + '" alt="Promo" class="mega-menu-promo-img">' +
      '<div class="mega-menu-promo-content">' +
        '<span class="mega-menu-promo-tag" data-i18n="' + menu.promo.titleKey + '">' + I.t(menu.promo.titleKey) + '</span>' +
        '<a href="#" class="mega-menu-promo-cta" data-i18n="' + menu.promo.ctaKey + '">' + I.t(menu.promo.ctaKey) + '</a>' +
      '</div>' +
    '</div>';

    return '<div class="mega-menu">' +
      '<div class="mega-menu-inner">' +
        '<div class="' + columnsClass + '">' + columnsHtml + '</div>' +
        promoHtml +
      '</div>' +
    '</div>';
  }

  /* ---------- 账户下拉菜单 HTML ---------- */
  function getAccountHtml() {
    var user = (window.ShopAccount && window.ShopAccount.getUser) ? window.ShopAccount.getUser() : null;
    var loggedIn = !!(user && localStorage.getItem('noire_logged_in') === '1');
    var avatarChar = loggedIn && user.email ? user.email.charAt(0).toUpperCase() : '';
    var avatarHtml = loggedIn
      ? '<div class="shop-account-avatar">' + avatarChar + '</div>'
      : ICONS.user;
    var dropdownHtml =
      '<div class="shop-account-dropdown" id="shopAccountDropdown">' +
        '<div class="shop-account-profile">' +
          '<div class="shop-account-avatar shop-account-avatar-lg">' + (loggedIn ? avatarChar : 'U') + '</div>' +
          '<div class="shop-account-meta">' +
            '<div class="shop-account-name">' + (loggedIn ? (user.name || user.email) : 'NOIRÉ 会员') + '</div>' +
            '<div class="shop-account-level">♦ NOIRÉ 会员 · 2560 积分</div>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="shop-account-main-btn" data-page="user/index.html">查看个人中心 →</button>' +
        '<div class="shop-account-group-title">购物与订单</div>' +
        '<a href="#" class="shop-account-link" data-action="account-menu" data-value="orders">' + ICONS.order + '<span>我的订单</span></a>' +
        '<a href="#" class="shop-account-link" data-action="account-menu" data-value="favorites">' + ICONS.heart + '<span>我的收藏</span></a>' +
        '<a href="#" class="shop-account-link" data-action="account-menu" data-value="history">' + ICONS.clock + '<span>浏览记录</span></a>' +
        '<a href="#" class="shop-account-link" data-action="account-menu" data-value="addresses">' + ICONS.mapPin + '<span>收货地址</span></a>' +
        '<div class="shop-account-group-title">资产与权益</div>' +
        '<a href="#" class="shop-account-link" data-action="account-menu" data-value="wallet">' + ICONS.wallet + '<span>我的钱包</span></a>' +
        '<a href="#" class="shop-account-link" data-action="account-menu" data-value="points">' + ICONS.star + '<span>积分权益</span></a>' +
        '<div class="shop-account-group-title">账户与偏好</div>' +
        '<a href="#" class="shop-account-link" data-action="account-menu" data-value="settings">' + ICONS.settings + '<span>账号设置</span></a>' +
        '<a href="#" class="shop-account-link" data-action="account-menu" data-value="subscriptions">' + ICONS.mail + '<span>邮件订阅管理</span></a>' +
        '<div class="shop-account-group-title">支持与服务</div>' +
        '<a href="#" class="shop-account-link" data-action="account-menu" data-value="help">' + ICONS.helpCircle + '<span>帮助中心</span></a>' +
        '<a href="#" class="shop-account-link" data-action="account-menu" data-value="contact">' + ICONS.headset + '<span>联系客服</span></a>' +
        '<div class="shop-account-divider"></div>' +
        '<button type="button" class="shop-account-link shop-account-logout" id="shopAccountLogout">' + ICONS.logOut + '<span>退出登录</span></button>' +
      '</div>';
    return '<div class="shop-account-wrap" id="shopAccountWrap">' +
      '<button class="shop-icon-btn" data-action="account" aria-label="' + I.t('header.account') + '">' + avatarHtml + '</button>' +
      dropdownHtml +
    '</div>';
  }

  /* ---------- 渲染头部 ---------- */
  function renderHeader(activePage) {
    var header = document.getElementById('shopHeader');
    if (!header) return;

    var currentCountry = I.getCountry();
    var countries = I.getCountries();
    var currentCountryInfo = I.getCountryInfo();

    var navHtml = NAV_ITEMS.map(function (item) {
      var isActive = activePage === item.page;
      var hasMega = item.hasMegaMenu ? ' has-mega' : '';
      var megaArrow = item.hasMegaMenu ? ICONS.chevron : '';
      var megaHtml = '';
      if (item.hasMegaMenu) {
        var menuData = item.key === 'nav.wig' ? WIG_MEGA_MENU : (item.key === 'nav.extension' ? EXTENSION_MEGA_MENU : (item.key === 'nav.bestsellers' ? BESTSELLERS_MEGA_MENU : (item.key === 'nav.accessory' ? ACCESSORY_MEGA_MENU : (item.key === 'nav.brand' ? BRAND_MEGA_MENU : HELP_MEGA_MENU))));
        megaHtml = renderMegaMenu(menuData);
      }
      var navHref = item.page.startsWith('#') ? '#' : item.page;
      return '<div class="shop-nav-item' + hasMega + '">' +
        '<a href="' + navHref + '" class="shop-nav-link' + (isActive ? ' active' : '') + '" data-page="' + item.page + '" data-i18n="' + item.key + '">' + I.t(item.key) + megaArrow + '</a>' +
        megaHtml +
      '</div>';
    }).join('');

    // 国家选择器 HTML
    var countryOptionsHtml = Object.keys(countries).map(function (code) {
      var country = countries[code];
      var isActive = code === currentCountry;
      return '<div class="shop-country-option' + (isActive ? ' active' : '') + '" data-country="' + code + '">' +
        '<span class="shop-country-flag">' + country.flag + '</span>' +
        '<span class="shop-country-name">' + country.name + '</span>' +
        '<span class="shop-country-info">' + country.locale + ' · ' + country.currencySymbol + '</span>' +
      '</div>';
    }).join('');

    var mobileNavHtml = NAV_ITEMS.map(function (item) {
      var navHref = item.page.startsWith('#') ? '#' : item.page;
      return '<a href="' + navHref + '" class="shop-mobile-nav-link" data-page="' + item.page + '" data-i18n="' + item.key + '">' + I.t(item.key) + '</a>';
    }).join('');

    var mobileCountryHtml = Object.keys(countries).map(function (code) {
      var country = countries[code];
      var isActive = code === currentCountry;
      return '<button class="shop-mobile-country-opt' + (isActive ? ' active' : '') + '" data-country="' + code + '">' +
        country.flag + ' ' + country.name +
      '</button>';
    }).join('');

    header.innerHTML =
      '<div class="shop-announcement">' +
        '<button class="shop-announcement-arrow" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>' +
        '<span data-i18n="announcement.text">' + I.t('announcement.text') + '</span>' +
        '<button class="shop-announcement-arrow" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>' +
      '</div>' +
      '<div class="shop-header">' +
        '<div class="shop-container shop-header-inner">' +
          '<button class="shop-hamburger" id="shopHamburger" aria-label="Menu">' + ICONS.menu + '</button>' +
          '<a href="#home" class="shop-logo" data-page="#home">NOIRÉ</a>' +
          '<nav class="shop-nav">' + navHtml + '</nav>' +
          '<div class="shop-header-actions">' +
            '<div class="shop-country-selector">' +
              '<button class="shop-country-btn" id="shopCountryBtn">' +
                '<span class="shop-country-btn-flag">' + currentCountryInfo.flag + '</span>' +
                '<span id="countryCurrentName">' + currentCountryInfo.name + '</span>' + ICONS.chevron +
              '</button>' +
              '<div class="shop-country-dropdown" id="shopCountryDropdown">' + countryOptionsHtml + '</div>' +
            '</div>' +
            '<button class="shop-icon-btn" data-action="search" aria-label="' + I.t('header.search') + '">' + ICONS.search + '</button>' +
            getAccountHtml() +
            '<button class="shop-icon-btn" data-action="cart" aria-label="' + I.t('header.cart') + '">' +
              ICONS.bag + '<span class="shop-cart-badge" id="shopCartBadge">0</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="shop-mobile-nav" id="shopMobileNav">' +
        '<div class="shop-mobile-nav-overlay" id="shopMobileNavOverlay"></div>' +
        '<div class="shop-mobile-nav-panel">' +
          '<button class="shop-mobile-nav-close" id="shopMobileNavClose">' + ICONS.close + '</button>' +
          mobileNavHtml +
          '<div class="shop-mobile-country">' +
            '<div class="shop-mobile-country-label" data-i18n="header.country">' + I.t('header.country') + '</div>' +
            '<div class="shop-mobile-country-options">' + mobileCountryHtml + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    bindEvents();
  }

  /* ---------- 绑定交互 ---------- */
  function bindEvents() {
    // Mega Menu 悬停交互
    var megaItems = document.querySelectorAll('.shop-nav-item.has-mega');
    megaItems.forEach(function (item) {
      var menu = item.querySelector('.mega-menu');
      if (!menu) return;

      var timeout;
      item.addEventListener('mouseenter', function () {
        clearTimeout(timeout);
        menu.classList.add('show');
      });
      item.addEventListener('mouseleave', function () {
        timeout = setTimeout(function () {
          menu.classList.remove('show');
        }, 150);
      });
      menu.addEventListener('mouseenter', function () {
        clearTimeout(timeout);
      });
      menu.addEventListener('mouseleave', function () {
        timeout = setTimeout(function () {
          menu.classList.remove('show');
        }, 150);
      });
    });

    // 国家切换下拉
    var countryBtn = document.getElementById('shopCountryBtn');
    var countryDropdown = document.getElementById('shopCountryDropdown');
    if (countryBtn && countryDropdown) {
      countryBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        countryDropdown.classList.toggle('show');
        countryBtn.classList.toggle('open');
      });
      document.addEventListener('click', function () {
        countryDropdown.classList.remove('show');
        countryBtn.classList.remove('open');
      });
    }

    // 国家选项点击
    document.querySelectorAll('.shop-country-option, .shop-mobile-country-opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var country = this.getAttribute('data-country');
        if (country) I.setCountry(country);
      });
    });

    // 移动端导航
    var hamburger = document.getElementById('shopHamburger');
    var mobileNav = document.getElementById('shopMobileNav');
    var mobileNavClose = document.getElementById('shopMobileNavClose');
    var mobileNavOverlay = document.getElementById('shopMobileNavOverlay');

    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', function () { mobileNav.classList.add('open'); });
    }
    if (mobileNavClose) {
      mobileNavClose.addEventListener('click', function () { mobileNav.classList.remove('open'); });
    }
    if (mobileNavOverlay) {
      mobileNavOverlay.addEventListener('click', function () { mobileNav.classList.remove('open'); });
    }
  }

  /* ---------- 导航点击处理 ---------- */
  function bindNavClicks() {
    // 桌面导航链接
    document.querySelectorAll('.shop-nav-link[data-page]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var page = this.getAttribute('data-page');
        if (page && !page.startsWith('#')) {
          e.preventDefault();
          if (window.ShopRouter) {
            window.ShopRouter.loadPage(page);
          }
        }
      });
    });

    // 移动端导航链接
    document.querySelectorAll('.shop-mobile-nav-link[data-page]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var page = this.getAttribute('data-page');
        if (page && !page.startsWith('#')) {
          e.preventDefault();
          if (window.ShopRouter) {
            window.ShopRouter.loadPage(page);
          }
          // 关闭移动端导航
          var mobileNav = document.getElementById('shopMobileNav');
          if (mobileNav) mobileNav.classList.remove('open');
        }
      });
    });
  }

  /* ---------- 图标按钮点击 ---------- */
  function bindHeaderActions() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      if (action === 'search') {
        e.preventDefault();
        if (window.ShopSearch) window.ShopSearch.open();
      } else if (action === 'account') {
        e.preventDefault();
        var loggedIn = window.ShopAccount && window.ShopAccount.isLoggedIn && window.ShopAccount.isLoggedIn();
        if (loggedIn) {
          toggleAccountDropdown();
        } else {
          if (window.ShopAccount) window.ShopAccount.open('login');
        }
      } else if (action === 'cart') {
        e.preventDefault();
        alert('购物车页面正在设计中');
      }
    });
  }

  /* ---------- 账户下拉菜单交互 ---------- */
  function closeAccountDropdown() {
    var wrap = document.getElementById('shopAccountWrap');
    if (wrap) wrap.classList.remove('open');
  }

  function toggleAccountDropdown() {
    var wrap = document.getElementById('shopAccountWrap');
    if (!wrap) return;
    var willOpen = !wrap.classList.contains('open');
    closeAccountDropdown();
    if (willOpen) wrap.classList.add('open');
  }

  function bindAccountDropdown() {
    // 点击外部关闭
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#shopAccountWrap')) closeAccountDropdown();
    });

    // 菜单项点击
    document.addEventListener('click', function (e) {
      var link = e.target.closest('[data-action="account-menu"]');
      if (!link) return;
      e.preventDefault();
      closeAccountDropdown();
      var label = link.querySelector('span');
      alert('「' + (label ? label.textContent : link.getAttribute('data-value')) + '」功能开发中');
    });

    // 查看个人中心
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.shop-account-main-btn');
      if (!btn) return;
      e.preventDefault();
      closeAccountDropdown();
      if (window.ShopRouter) window.ShopRouter.loadPage('user/index.html');
    });

    // 退出登录
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('#shopAccountLogout');
      if (!btn) return;
      e.preventDefault();
      if (window.ShopAccount && window.ShopAccount.logout) {
        window.ShopAccount.logout();
      }
      closeAccountDropdown();
      updateAccountState();
      alert('已退出登录');
    });
  }

  function updateAccountState() {
    var wrap = document.getElementById('shopAccountWrap');
    if (!wrap) return;
    var parent = wrap.parentNode;
    if (!parent) return;
    var div = document.createElement('div');
    div.innerHTML = getAccountHtml();
    var newWrap = div.firstChild;
    parent.replaceChild(newWrap, wrap);
  }

  /* ---------- 导出 ---------- */
  window.ShopHeader = { render: renderHeader, updateAccountState: updateAccountState };

  // 页面加载完成后绑定导航点击与搜索弹层
  function onReady() {
    bindNavClicks();
    bindHeaderActions();
    bindAccountDropdown();
    if (window.ShopSearch) window.ShopSearch.init();
    if (window.ShopAccount) window.ShopAccount.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
