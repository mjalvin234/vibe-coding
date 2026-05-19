function q(sel) {
  return document.querySelector(sel);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setToast(message, type) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type || "info";
  el.classList.add("is-show");
  window.clearTimeout(setToast._t);
  setToast._t = window.setTimeout(() => el.classList.remove("is-show"), 2200);
}

function normalizePath(p) {
  if (!p) return "/";
  var s = String(p).split("#")[0].split("?")[0];
  if (s[0] !== "/") s = "/" + s;
  s = s.replace(/\/+/g, "/");
  if (s.length > 1 && s.slice(-1) === "/") s = s.slice(0, -1);
  return s || "/";
}

function currentPathFromHash() {
  var h = window.location.hash || "";
  if (h.indexOf("#") === 0) h = h.slice(1);
  // 处理 hashbang 格式 #!/path
  if (h.indexOf("!") === 0) h = h.slice(1);
  return normalizePath(h || "/workbench");
}

function flattenMenu(items, chain) {
  chain = chain || [];
  var out = [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var next = chain.concat(it);
    if (it.path) out.push({ path: normalizePath(it.path), chain: next, item: it });
    if (it.children && it.children.length) out = out.concat(flattenMenu(it.children, next));
  }
  out.sort(function (a, b) {
    return b.path.length - a.path.length;
  });
  return out;
}

function matchChain(menu, path) {
  var p = normalizePath(path);
  var idx = flattenMenu(menu);
  for (var i = 0; i < idx.length; i++) {
    var m = idx[i];
    if (p === m.path || p.indexOf(m.path + "/") === 0) return m.chain;
  }
  return [];
}

function pageTitleFromChain(chain) {
  if (!chain.length) return "工作台";
  return chain[chain.length - 1].label;
}

function card(title, bodyHtml) {
  return (
    '<section class="card">' +
    '<div class="card__hd"><div class="card__title">' +
    escapeHtml(title) +
    '</div></div>' +
    '<div class="card__bd">' +
    bodyHtml +
    "</div></section>"
  );
}

function renderPage(path, title) {
  var content = document.getElementById("content");
  if (!content) return;

  var p = normalizePath(path);
  var reg = window.__HRMS_REGISTRY;
  if (!reg && window.HrmsPageRegistry) {
    reg = window.HrmsPageRegistry.buildRegistry();
    window.__HRMS_REGISTRY = reg;
  }

  var renderer = reg && reg.renderers ? reg.renderers[p] : null;
  var html;
  if (renderer) {
    html = renderer({ path: p, title: title });
  } else if (window.HrmsPageRegistry && window.HrmsPageRegistry.renderNotImplemented) {
    html = window.HrmsPageRegistry.renderNotImplemented(p);
  } else {
    html = card("页面建设中", '<div class="muted">路径：<span class="mono">' + escapeHtml(p) + "</span></div>");
  }

  content.innerHTML = html;
  var isWorkbench = p === "/workbench" || p.indexOf("/workbench/") === 0;
  document.body.classList.toggle("hrms-route-workbench", isWorkbench);
  var docTitle = p === "/workbench" ? "工作台" : String(title || "HRMS");
  document.title = "HRMS · " + docTitle;
  if (window.HrmsModal && window.HrmsModal.sync) window.HrmsModal.sync();

  // 初始化表单设计器（如果是表单设计页面）
  if (p === "/workflow/create/form" && window.HrmsPageRegistry && window.HrmsPageRegistry.initFormDesigner) {
    setTimeout(function() {
      window.HrmsPageRegistry.initFormDesigner();
    }, 100);
  }

  // 初始化基本设置页面
  if (p === "/workflow/create" && window.HrmsPageRegistry && window.HrmsPageRegistry.initBasicSettings) {
    setTimeout(function() {
      window.HrmsPageRegistry.initBasicSettings();
    }, 100);
  }

  // 初始化流程设置页面
  if (p === "/workflow/create/flow" && window.HrmsPageRegistry && window.HrmsPageRegistry.initFlowSettings) {
    setTimeout(function() {
      window.HrmsPageRegistry.initFlowSettings();
    }, 100);
  }

  // 初始化审批人设置面板
  if (p === "/workflow/create/flow/approver" && window.HrmsPageRegistry && window.HrmsPageRegistry.initApproverSettings) {
    setTimeout(function() {
      window.HrmsPageRegistry.initApproverSettings();
    }, 100);
  }
}

function bootstrap() {
  window.HrmsAppShellToast = setToast;
  delete window.__HRMS_REGISTRY;
  if (!window.HrmsNav) {
    setToast("导航脚本未加载（src/hrms-nav.js）", "error");
    return;
  }
  if (!window.HrmsPageRegistry) {
    setToast("页面注册表未加载（src/page-registry.js）", "error");
  }

  // 与 Figma 184:857 一致：主导航为左侧竖栏；历史上若存了 top 则迁移为 sidebar
  try {
    var savedNav = window.localStorage.getItem("hrms:navLayout");
    if (savedNav === "top") {
      window.localStorage.setItem("hrms:navLayout", "sidebar");
    }
  } catch (_) {}

  var navRoot = document.getElementById("navRoot");
  var nav = window.HrmsNav.mount({
    root: navRoot,
    layout: "sidebar",
    basePath: "",
    onNavigate: function () {
      var path = currentPathFromHash();
      var chain = matchChain(window.HrmsNav.MENU || [], path);
      renderPage(path, pageTitleFromChain(chain));
    },
  });

  function refresh() {
    var path = currentPathFromHash();
    var chain = matchChain(window.HrmsNav.MENU || [], path);
    renderPage(path, pageTitleFromChain(chain));
  }

  window.addEventListener("hashchange", refresh);
  refresh();

  // Quick backend visibility check (optional)
  window.HrmsApi?.health?.().catch(() => {});
}

bootstrap();

