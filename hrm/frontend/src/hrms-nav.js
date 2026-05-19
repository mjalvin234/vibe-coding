/**
 * HRMS 导航：菜单数据、路由匹配、侧边栏 / 顶部两种布局。
 * 用法：HrmsNav.mount({ root, layout: 'sidebar' | 'top', basePath: '' })
 * 路由：默认监听 hash（#/path），也可 init({ path: '/custom' }) 或由宿主同步 setPath.
 * 壳体默认使用左侧栏（与 Figma「人力资源系统」184:683 一致）；顶栏模式仅保留供 setLayout('top') 等调试。
 */
(function (global) {
  "use strict";

  /**
   * 与 Figma「人力资源系统」侧栏一致；工作台为单入口（#/workbench）。
   * 未接后端的路径走占位页，样式与壳体统一。
   */
  var MENU = [
    { key: "workbench", label: "工作台", path: "/workbench" },
    {
      key: "perf",
      label: "绩效看板",
      children: [
        { key: "perf-overview", label: "概览", path: "/performance" },
        { key: "perf-compare", label: "对比分析", path: "/kpi-board/compare" },
        { key: "perf-work-orders", label: "工单总量", path: "/performance/work-orders" },
        { key: "perf-task-completion", label: "任务完成率", path: "/performance/task-completion" },
        { key: "perf-score", label: "绩效得分", path: "/performance/score" },
        { key: "perf-settings", label: "绩效设置", path: "/performance/settings" },
      ],
    },
    {
      key: "my-apply",
      label: "我的申请",
      children: [
        { key: "my-apply-start", label: "发起申请", path: "/my-apply/start" },
        { key: "my-apply-leave", label: "请假", path: "/my-apply/leave" },
        { key: "my-apply-trip", label: "出差", path: "/my-apply/trip" },
        { key: "my-apply-transfer", label: "调岗调薪", path: "/my-apply/transfer-salary" },
        { key: "my-apply-list", label: "申请列表", path: "/my-apply" },
      ],
    },
    { key: "messages", label: "消息中心", path: "/messages" },
    {
      key: "inbox",
      label: "待办 / 已办",
      children: [
        { key: "inbox-todo", label: "待办任务", path: "/inbox" },
        { key: "inbox-done", label: "已办任务", path: "/inbox/done" },
      ],
    },
    {
      key: "org",
      label: "组织管理",
      children: [
        { key: "org-structure-info", label: "组织信息", path: "/org/structure/info" },
        { key: "org-structure-dept", label: "部门管理", path: "/org/structure/dept" },
        { key: "org-positions-info", label: "岗位设置", path: "/org/positions/info" },
      ],
    },
    {
      key: "staff",
      label: "员工管理",
      children: [
        { key: "staff-roster", label: "员工花名册", path: "/staff/roster" },
        { key: "staff-onboarding", label: "入职办理", path: "/staff/onboarding" },
        { key: "staff-probation", label: "转正申请", path: "/staff/probation" },
        { key: "staff-transfer", label: "调岗调薪", path: "/staff/transfer" },
        { key: "staff-offboarding", label: "离职办理", path: "/staff/offboarding" },
      ],
    },
    { key: "recruit", label: "招聘管理", path: "/recruit" },
    { key: "workflow", label: "流程中心", path: "/workflow" },
    { key: "attendance", label: "考勤管理", path: "/attendance" },
    { key: "salary", label: "薪酬管理", path: "/salary" },
    { key: "training", label: "培训管理", path: "/training" },
    {
      key: "system",
      label: "系统设置",
      children: [
        { key: "sys-roles", label: "角色管理", path: "/system/roles" },
        { key: "sys-perm", label: "权限", path: "/system/permissions" },
        { key: "sys-dict", label: "字典管理", path: "/system/config/dict" },
        { key: "sys-integration", label: "集成中心", path: "/system/integration" },
        { key: "sys-logs", label: "日志查询", path: "/system/logs" },
        { key: "sys-snap", label: "快照对比", path: "/system/snapshots" },
      ],
    },
    { key: "personal-settings", label: "个人设置", path: "/settings" },
  ];

  /** 侧栏菜单项 SVG 图标（stroke=currentColor，收起态仅显示此项） */
  var ICON_SVGS = {
    layout:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
    chart:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 15 3-3 4 4 5-8"/></svg>',
    file:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/></svg>',
    bell:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 7-3 14h18c0-7-3-7-3-14"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    sparkles:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8-5.9-.8 4.5 3.8L6.5 21 12 17.8 17.5 21l-1.1-7.2 4.5-3.8-5.9.8z"/></svg>',
    zap:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    star:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    inbox:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
    building:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h.01"/><path d="M9 12h.01"/><path d="M9 15h.01"/><path d="M9 18h.01"/></svg>',
    users:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    briefcase:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    workflow:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.82 3.98"/><path d="m15.41 6.51-6.82 3.98"/></svg>',
    settings:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    sliders:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>',
    clock:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    wallet:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
    book:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
    user:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    circle:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/></svg>',
  };

  var MENU_KEY_TO_ICON = {
    workbench: "layout",
    perf: "chart",
    "perf-overview": "chart",
    "perf-compare": "sliders",
    "perf-work-orders": "zap",
    "perf-task-completion": "star",
    "perf-score": "sparkles",
    "perf-settings": "settings",
    "my-apply": "file",
    "my-apply-start": "zap",
    "my-apply-leave": "file",
    "my-apply-trip": "briefcase",
    "my-apply-transfer": "users",
    "my-apply-list": "file",
    messages: "bell",
    inbox: "inbox",
    "inbox-todo": "inbox",
    "inbox-done": "inbox",
    org: "building",
    "org-structure-info": "building",
    "org-structure-dept": "building",
    "org-positions-info": "building",
    staff: "users",
    "staff-roster": "users",
    "staff-onboarding": "users",
    "staff-probation": "users",
    "staff-transfer": "users",
    "staff-offboarding": "users",
    recruit: "briefcase",
    workflow: "workflow",
    attendance: "clock",
    salary: "wallet",
    training: "book",
    settings: "user",
    system: "settings",
    "sys-roles": "users",
    "sys-perm": "sliders",
    "sys-dict": "file",
    "sys-integration": "workflow",
    "sys-logs": "file",
    "sys-snap": "layout",
  };

  function sidebarIconHtml(menuKey, depth) {
    var nested = depth > 0;
    var name = MENU_KEY_TO_ICON[menuKey];
    if (!name) {
      if (String(menuKey).indexOf("wb-") === 0) name = "file";
      else if (String(menuKey).indexOf("org-") === 0) name = "building";
      else if (String(menuKey).indexOf("staff-") === 0) name = "users";
      else if (String(menuKey).indexOf("sys-") === 0) name = "sliders";
      else if (String(menuKey).indexOf("inbox-") === 0) name = "inbox";
      else name = "circle";
    }
    var svg = ICON_SVGS[name] || ICON_SVGS.circle;
    var cls = "hrms-nav__icon" + (nested ? " hrms-nav__icon--nested" : "");
    return '<span class="' + cls + '" aria-hidden="true">' + svg + "</span>";
  }

  function normalizePath(p) {
    if (!p) return "/";
    var s = String(p).split("#")[0].split("?")[0];
    if (s[0] !== "/") s = "/" + s;
    s = s.replace(/\/+/g, "/");
    if (s.length > 1 && s.slice(-1) === "/") s = s.slice(0, -1);
    return s || "/";
  }

  /** 收集所有带 path 的节点及层级 key 链 */
  function flattenPaths(items, prefixKeys) {
    var out = [];
    prefixKeys = prefixKeys || [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var keys = prefixKeys.concat(it.key);
      if (it.path) out.push({ path: normalizePath(it.path), keys: keys, item: it });
      if (it.children && it.children.length) out = out.concat(flattenPaths(it.children, keys));
    }
    return out;
  }

  var PATH_INDEX = null;
  function getPathIndex() {
    if (!PATH_INDEX) {
      PATH_INDEX = flattenPaths(MENU);
      PATH_INDEX.sort(function (a, b) { return b.path.length - a.path.length; });
    }
    return PATH_INDEX;
  }

  /**
   * 根据当前路径匹配：返回 openKeys（展开的父级）、selectedKeys（当前选中叶子/节点）
   */
  function matchRoute(currentPath) {
    var path = normalizePath(currentPath);
    var index = getPathIndex();
    var best = null;
    for (var i = 0; i < index.length; i++) {
      if (path === index[i].path || path.indexOf(index[i].path + "/") === 0) {
        best = index[i];
        break;
      }
    }
    if (!best) {
      return { openKeys: [], selectedKeys: [], matchedPath: null, primaryKey: null };
    }
    var keys = best.keys;
    var openKeys = keys.slice(0, -1);
    var selectedKeys = [keys[keys.length - 1]];
    return {
      openKeys: openKeys,
      selectedKeys: selectedKeys,
      matchedPath: best.path,
      primaryKey: keys[0],
    };
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function HrmsNav(options) {
    this.root = options.root;
    this.layout = options.layout || "sidebar";
    this.basePath = options.basePath || "";
    this.collapsed = !!options.collapsed;
    this.onNavigate = options.onNavigate || null;
    this._hashListener = this._onHashChange.bind(this);
    /** 侧栏：仅用户点击父级后展开的分组（不因路由自动展开） */
    this._sidebarGroupOpen = Object.create(null);
  }

  HrmsNav.prototype.getPath = function () {
    if (this._overridePath != null) return normalizePath(this._overridePath);
    var h = global.location.hash || "";
    if (h.indexOf("#") === 0) h = h.slice(1);
    return normalizePath(h || "/workbench");
  };

  HrmsNav.prototype.setPath = function (path, opts) {
    opts = opts || {};
    this._overridePath = normalizePath(path);
    if (!opts.silent) this.render();
    if (this.onNavigate) this.onNavigate(this.getPath());
  };

  HrmsNav.prototype._onHashChange = function () {
    this._overridePath = null;
    this.render();
    if (this.onNavigate) this.onNavigate(this.getPath());
  };

  HrmsNav.prototype._navigate = function (path) {
    var full = normalizePath(this.basePath + path);
    global.location.hash = "#" + full;
  };

  HrmsNav.prototype.setLayout = function (layout) {
    this.layout = layout;
    this.render();
  };

  HrmsNav.prototype.toggleCollapse = function () {
    this.collapsed = !this.collapsed;
    this.render();
  };

  HrmsNav.prototype.destroy = function () {
    global.removeEventListener("hashchange", this._hashListener);
    if (this.root) this.root.innerHTML = "";
  };

  HrmsNav.prototype.render = function () {
    var self = this;
    if (!this.root) return;
    if (typeof document !== "undefined" && document.body) {
      document.body.classList.toggle("hrms-nav-layout-top", this.layout === "top");
      document.body.classList.toggle("hrms-nav-layout-sidebar", this.layout !== "top");
    }
    var path = this.getPath();
    var match = matchRoute(path);

    if (this.layout === "sidebar") {
      this.root.innerHTML = this._renderSidebar(match);
      this._bindSidebar(match);
    } else {
      this.root.innerHTML = this._renderTop(match);
      this._bindTop(match);
    }
  };

  HrmsNav.prototype._renderSidebar = function (match) {
    var collapsed = this.collapsed;
    var wrapClass = "hrms-nav hrms-nav--sidebar" + (collapsed ? " is-collapsed" : "");
    var html =
      '<div class="' + wrapClass + '" data-layout="sidebar">' +
      '<aside class="hrms-nav__sider" aria-label="主导航">' +
      '<div class="hrms-nav__brand">' +
      '<span class="hrms-nav__logo" aria-hidden="true"></span>' +
      (collapsed ? "" : '<span class="hrms-nav__title">人力资源系统</span>') +
      "</div>" +
      '<nav class="hrms-nav__menu" role="navigation">' +
      this._renderMenuLevel(MENU, match, 0, "side") +
      "</nav>" +
      '<button type="button" class="hrms-nav__collapse" aria-expanded="' + (!collapsed) + '" title="' +
      (collapsed ? "展开侧栏" : "收起侧栏") +
      '">' +
      '<span class="hrms-nav__collapse-icon" aria-hidden="true">' +
      (collapsed ? "⟩" : "⟨") +
      "</span>" +
      "</button>" +
      "</aside></div>";
    return html;
  };

  HrmsNav.prototype._renderMenuLevel = function (items, match, depth, mode) {
    var html = "";
    var openSet = {};
    for (var o = 0; o < match.openKeys.length; o++) openSet[match.openKeys[o]] = true;
    var selSet = {};
    for (var s = 0; s < match.selectedKeys.length; s++) selSet[match.selectedKeys[s]] = true;

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var hasChildren = it.children && it.children.length;
      var isOpen =
        mode === "side" && hasChildren
          ? !!this._sidebarGroupOpen[it.key]
          : openSet[it.key] || this._ancestorOfSelected(it, match.selectedKeys);
      var isSelected = selSet[it.key] && (!hasChildren || mode === "top-primary");
      var subSelected = hasChildren && this._subtreeContainsSelected(it, match.selectedKeys);

      if (mode === "side" && hasChildren) {
        html += '<div class="hrms-nav__group' + (isOpen ? " is-open" : "") + '" data-key="' + escapeHtml(it.key) + '">';
        html +=
          '<button type="button" class="hrms-nav__row hrms-nav__row--parent' +
          (subSelected && !isSelected ? " is-active-branch" : "") +
          '" aria-expanded="' +
          isOpen +
          '" title="' +
          escapeHtml(it.label) +
          '">';
        html += sidebarIconHtml(it.key, depth);
        html += '<span class="hrms-nav__label">' + escapeHtml(it.label) + "</span>";
        html += '<span class="hrms-nav__chev" aria-hidden="true"></span>';
        html += "</button>";
        html += '<div class="hrms-nav__sub">';
        html += this._renderMenuLevel(it.children, match, depth + 1, "side");
        html += "</div></div>";
      } else if (mode === "side" && it.path) {
        html +=
          '<a class="hrms-nav__row hrms-nav__row--link' +
          (depth > 0 ? " hrms-nav__row--nested" : "") +
          (selSet[it.key] ? " is-selected" : "") +
          '" href="#' +
          escapeHtml(normalizePath(this.basePath + it.path)) +
          '" data-path="' +
          escapeHtml(it.path) +
          '" title="' +
          escapeHtml(it.label) +
          '">';
        html += sidebarIconHtml(it.key, depth);
        html += '<span class="hrms-nav__label">' + escapeHtml(it.label) + "</span></a>";
      } else if (mode === "side" && !it.path && hasChildren) {
        html += this._renderMenuLevel(it.children, match, depth, "side");
      }

      if (mode === "top-primary") {
        var active = it.key === match.primaryKey;
        html +=
          '<button type="button" class="hrms-nav__top-item' +
          (active ? " is-active" : "") +
          '" data-primary="' +
          escapeHtml(it.key) +
          '">' +
          escapeHtml(it.label) +
          "</button>";
      }

      if (mode === "top-panel") {
        html += this._renderMegaColumn(it, match);
      }
    }
    return html;
  };

  HrmsNav.prototype._ancestorOfSelected = function (node, selectedKeys) {
    if (!node.children) return false;
    for (var i = 0; i < selectedKeys.length; i++) {
      if (this._findKey(node.children, selectedKeys[i])) return true;
    }
    return false;
  };

  HrmsNav.prototype._subtreeContainsSelected = function (node, selectedKeys) {
    if (!node.children) return false;
    for (var i = 0; i < selectedKeys.length; i++) {
      if (this._findKey(node.children, selectedKeys[i])) return true;
    }
    return false;
  };

  HrmsNav.prototype._findKey = function (items, key) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].key === key) return true;
      if (items[i].children && this._findKey(items[i].children, key)) return true;
    }
    return false;
  };

  HrmsNav.prototype._megaPanelInnerHtml = function (primary, match) {
    if (!primary || !primary.children) return "";
    return '<div class="hrms-nav__mega-inner">' + this._renderMegaColumns(primary.children, match) + "</div>";
  };

  HrmsNav.prototype._renderTop = function (match) {
    var primary = null;
    for (var pi = 0; pi < MENU.length; pi++) {
      if (MENU[pi].key === match.primaryKey) {
        primary = MENU[pi];
        break;
      }
    }
    if (!primary) primary = MENU[0];
    var panelHtml = primary ? this._megaPanelInnerHtml(primary, match) : "";

    return (
      '<div class="hrms-nav hrms-nav--top" data-layout="top">' +
      '<div class="hrms-nav__topbar">' +
      '<div class="hrms-nav__brand hrms-nav__brand--inline">' +
      '<span class="hrms-nav__logo" aria-hidden="true"></span>' +
      '<span class="hrms-nav__title">人力资源系统</span>' +
      "</div>" +
      '<div class="hrms-nav__top-items" role="menubar">' +
      this._renderMenuLevel(MENU, match, 0, "top-primary") +
      "</div></div>" +
      '<div class="hrms-nav__mega" data-open="true">' +
      panelHtml +
      "</div></div>"
    );
  };

  HrmsNav.prototype._renderMegaColumns = function (children, match) {
    var html = "";
    for (var i = 0; i < children.length; i++) {
      html += this._renderMegaColumn(children[i], match);
    }
    return html;
  };

  HrmsNav.prototype._renderMegaColumn = function (it, match) {
    var hasChildren = it.children && it.children.length;
    var html = '<div class="hrms-nav__col">';
    if (it.path && !hasChildren) {
      var sel = match.selectedKeys.indexOf(it.key) >= 0;
      html +=
        '<a class="hrms-nav__col-title hrms-nav__col-title--link' +
        (sel ? " is-selected" : "") +
        '" href="#' +
        escapeHtml(normalizePath(this.basePath + it.path)) +
        '">' +
        escapeHtml(it.label) +
        "</a>";
    } else {
      html += '<div class="hrms-nav__col-title">' + escapeHtml(it.label) + "</div>";
    }
    if (hasChildren) {
      html += '<ul class="hrms-nav__col-list">';
      html += this._renderMegaLinks(it.children, match);
      html += "</ul>";
    }
    html += "</div>";
    return html;
  };

  HrmsNav.prototype._renderMegaLinks = function (items, match) {
    var html = "";
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.path && (!it.children || !it.children.length)) {
        var sel = match.selectedKeys.indexOf(it.key) >= 0;
        html +=
          '<li><a class="' +
          (sel ? "is-selected " : "") +
          '" href="#' +
          escapeHtml(normalizePath(this.basePath + it.path)) +
          '">' +
          escapeHtml(it.label) +
          "</a></li>";
      } else if (it.children && it.children.length) {
        html += '<li class="hrms-nav__col-nested"><span class="hrms-nav__col-subtitle">' + escapeHtml(it.label) + "</span>";
        html += "<ul>" + this._renderMegaLinks(it.children, match) + "</ul></li>";
      }
    }
    return html;
  };

  HrmsNav.prototype._bindSidebar = function () {
    var self = this;
    var root = this.root.querySelector(".hrms-nav--sidebar");
    if (!root) return;

    var btn = root.querySelector(".hrms-nav__collapse");
    if (btn) {
      btn.addEventListener("click", function () {
        self.toggleCollapse();
      });
    }

    root.querySelectorAll(".hrms-nav__row--parent").forEach(function (el) {
      el.addEventListener("click", function () {
        var g = el.closest(".hrms-nav__group");
        if (!g) return;
        g.classList.toggle("is-open");
        var open = g.classList.contains("is-open");
        el.setAttribute("aria-expanded", open);
        var k = g.getAttribute("data-key");
        if (k) self._sidebarGroupOpen[k] = open;
      });
    });
  };

  HrmsNav.prototype._bindTop = function (match) {
    var self = this;
    var root = this.root.querySelector(".hrms-nav--top");
    if (!root) return;

    var mega = root.querySelector(".hrms-nav__mega");
    var items = root.querySelectorAll(".hrms-nav__top-item");

    function showPrimary(key) {
      items.forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-primary") === key);
      });
      var primary = null;
      for (var pi = 0; pi < MENU.length; pi++) {
        if (MENU[pi].key === key) {
          primary = MENU[pi];
          break;
        }
      }
      if (mega && primary && primary.children) {
        mega.innerHTML = self._megaPanelInnerHtml(primary, matchRoute(self.getPath()));
        mega.querySelectorAll("a").forEach(function (a) {
          a.addEventListener("click", function () {
            global.setTimeout(function () {
              self.render();
            }, 0);
          });
        });
      }
    }

    showPrimary(match.primaryKey || MENU[0].key);

    items.forEach(function (b) {
      b.addEventListener("mouseenter", function () {
        showPrimary(b.getAttribute("data-primary"));
      });
      b.addEventListener("focus", function () {
        showPrimary(b.getAttribute("data-primary"));
      });
      b.addEventListener("click", function () {
        showPrimary(b.getAttribute("data-primary"));
      });
    });

    mega.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        global.setTimeout(function () {
          self.render();
        }, 0);
      }
    });
  };

  HrmsNav.mount = function (options) {
    var nav = new HrmsNav(options);
    global.addEventListener("hashchange", nav._hashListener);
    nav.render();
    return nav;
  };

  HrmsNav.MENU = MENU;
  HrmsNav.matchRoute = matchRoute;
  HrmsNav.normalizePath = normalizePath;

  global.HrmsNav = HrmsNav;
})(typeof window !== "undefined" ? window : this);

