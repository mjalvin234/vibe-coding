/**
 * 页面注册：工作台与 Figma 184:857 对齐；其它路径多为列表占位或建设中。
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizePath(p) {
  if (!p) return "/";
  var s = String(p).split("#")[0].split("?")[0];
  if (s[0] !== "/") s = "/" + s;
  s = s.replace(/\/+/g, "/");
  if (s.length > 1 && s.slice(-1) === "/") s = s.slice(0, -1);
  return s || "/";
}

function wbPillClass(tone) {
  if (tone === "remind") return "wb-pill wb-pill--remind";
  if (tone === "risk") return "wb-pill wb-pill--risk";
  return "wb-pill wb-pill--system";
}

/** 工作台整页 — 对齐 Figma「Workbench / 工作台 (Data Lab)」184:857 Main 区 */
function renderWorkbenchShell(d) {
  d = d || {};

  var kpisHtml = (d.kpis || [])
    .map(function (k) {
      return (
        '<article class="wb-kpi" aria-label="' +
        escapeHtml(k.label) +
        '">' +
        '<div class="wb-kpi__label">' +
        escapeHtml(k.label) +
        "</div>" +
        '<div class="wb-kpi__value">' +
        escapeHtml(String(k.value)) +
        "</div></article>"
      );
    })
    .join("");

  function quickActionHref(a) {
    var raw = a && a.path != null ? String(a.path).trim() : "";
    if (raw) return normalizePath(raw);
    var id = String((a && a.id) || "");
    var byId = {
      "qa-1": "/workflow",
      "qa-2": "/my-apply",
      "qa-3": "/my-apply",
      "qa-4": "/my-apply",
      "qa-5": "/staff/onboarding",
      "qa-6": "/staff/offboarding",
      "qa-7": "/staff/probation",
      "qa-8": "/staff/transfer",
    };
    return byId[id] || "/workflow";
  }

  function qaButtons(list) {
    return (list || [])
      .map(function (a) {
        var href = "#" + escapeHtml(quickActionHref(a));
        return (
          '<a class="wb-quick__btn" href="' +
          href +
          '"><span class="wb-quick__dot" aria-hidden="true"></span><span class="wb-quick__txt">' +
          escapeHtml(a.label) +
          "</span></a>"
        );
      })
      .join("");
  }
  var qaList = d.quickActions || [];
  var qaHtml =
    '<div class="wb-quick-rows">' +
    '<div class="wb-quick-row">' +
    qaButtons(qaList.slice(0, 4)) +
    "</div>" +
    '<div class="wb-quick-row">' +
    qaButtons(qaList.slice(4, 8)) +
    "</div></div>";

  function todoHref(t) {
    var raw = t && t.path != null ? String(t.path).trim() : "";
    return raw ? normalizePath(raw) : "/inbox";
  }

  var todoHtml = (d.workbenchTodos || [])
    .map(function (t) {
      var th = "#" + escapeHtml(todoHref(t));
      return (
        '<a class="wb-todo" href="' +
        th +
        '">' +
        '<span class="wb-todo__title">' +
        escapeHtml(t.title) +
        "</span>" +
        '<span class="wb-todo__meta">' +
        escapeHtml(t.meta) +
        "</span></a>"
      );
    })
    .join("");

  function feedHref(x) {
    var raw = x && x.path != null ? String(x.path).trim() : "";
    return raw ? normalizePath(raw) : "/messages";
  }

  var feedHtml = (d.announcementFeed || [])
    .map(function (x) {
      var fh = "#" + escapeHtml(feedHref(x));
      return (
        '<a class="wb-feed" href="' +
        fh +
        '">' +
        '<div class="wb-feed__hd">' +
        '<div class="wb-feed__title">' +
        escapeHtml(x.title) +
        "</div>" +
        '<span class="wb-pill ' +
        wbPillClass(x.tone) +
        ' wb-pill--sm">' +
        escapeHtml(x.tag) +
        "</span></div>" +
        '<p class="wb-feed__desc">' +
        escapeHtml(x.desc) +
        "</p></a>"
      );
    })
    .join("");

  function schedHref(s) {
    var raw = s && s.path != null ? String(s.path).trim() : "";
    return raw ? normalizePath(raw) : "/inbox";
  }

  var schedHtml = (d.schedule || [])
    .map(function (s) {
      var sh = "#" + escapeHtml(schedHref(s));
      return (
        '<a class="wb-sched wb-sched--figma" href="' +
        sh +
        '">' +
        '<div class="wb-sched__timebox" aria-hidden="true">' +
        '<span class="wb-sched__time">' +
        escapeHtml(s.time) +
        "</span></div>" +
        '<div class="wb-sched__mid">' +
        '<div class="wb-sched__title">' +
        escapeHtml(s.title) +
        "</div>" +
        '<div class="wb-sched__meta">' +
        escapeHtml(s.meta) +
        "</div></div></a>"
      );
    })
    .join("");

  var bars = d.trendBars || [40, 70, 55, 90, 60, 110, 80, 120, 75, 95, 60, 105];
  var trendHtml = bars
    .map(function (h) {
      return (
        '<div class="wb-trend__bar" style="height:' +
        escapeHtml(String(h)) +
        'px" role="presentation"></div>'
      );
    })
    .join("");

  function recentHref(r) {
    var raw = r && r.path != null ? String(r.path).trim() : "";
    return raw ? normalizePath(raw) : "/staff/roster";
  }

  var recentHtml = (d.recentVisits || [])
    .map(function (r) {
      var rh = "#" + escapeHtml(recentHref(r));
      return (
        '<a class="wb-recent" href="' +
        rh +
        '">' +
        '<div class="wb-recent__title">' +
        escapeHtml(r.title) +
        "</div>" +
        '<div class="wb-recent__meta">' +
        escapeHtml(r.meta) +
        "</div></a>"
      );
    })
    .join("");

  return (
    '<div class="wb-page wb-page--figma184">' +
    '<header class="wb-page__masthead" aria-labelledby="wb-masthead-title">' +
    '<div class="wb-page__masthead-text">' +
    '<p class="wb-page__masthead-eyebrow">门户首页</p>' +
    '<h1 id="wb-masthead-title" class="wb-page__headline">工作台</h1>' +
    '<p class="wb-page__masthead-sub">关键指标、待办、公告与日程摘要（与画板 Main 区结构一致）</p>' +
    "</div>" +
    '<span class="wb-page__masthead-badge" title="当前为前端演示数据">演示环境</span>' +
    "</header>" +
    '<section class="wb-page__kpis" aria-label="关键指标">' +
    kpisHtml +
    "</section>" +
    '<div class="wb-figma-grid">' +
    '<div class="wb-figma-row wb-figma-row--2">' +
    '<section class="wb-card wb-card--figma" aria-label="快捷入口">' +
    '<header class="wb-card__hd wb-card__hd--plain"><h2 class="wb-card__title">快捷入口</h2>' +
    '<p class="wb-card__hint">常用操作一键直达</p></header>' +
    '<div class="wb-card__bd wb-card__bd--tight">' +
    qaHtml +
    "</div></section>" +
    '<section class="wb-card wb-card--figma" aria-label="我的待办">' +
    '<header class="wb-card__hd wb-card__hd--plain"><h2 class="wb-card__title">我的待办</h2></header>' +
    '<div class="wb-card__bd wb-card__bd--tight"><div class="wb-todos">' +
    todoHtml +
    "</div></div></section></div>" +
    '<div class="wb-figma-row wb-figma-row--2">' +
    '<section class="wb-card wb-card--figma wb-card--lift" aria-label="公告与提醒">' +
    '<header class="wb-card__hd wb-card__hd--plain"><h2 class="wb-card__title">公告与提醒</h2>' +
    '<p class="wb-card__hint">制度更新 / 系统维护 / 风险提示</p></header>' +
    '<div class="wb-card__bd wb-card__bd--tight"><div class="wb-feeds">' +
    feedHtml +
    "</div></div></section>" +
    '<section class="wb-card wb-card--figma wb-card--lift" aria-label="今日事项">' +
    '<header class="wb-card__hd wb-card__hd--plain"><h2 class="wb-card__title">今日事项</h2>' +
    '<p class="wb-card__hint">日程 / 面试 / 培训</p></header>' +
    '<div class="wb-card__bd wb-card__bd--tight"><div class="wb-scheds wb-scheds--figma">' +
    schedHtml +
    "</div></div></section></div>" +
    '<div class="wb-figma-row wb-figma-row--trend">' +
    '<section class="wb-card wb-card--figma wb-card--lift wb-card--trend" aria-label="趋势概览">' +
    '<header class="wb-card__hd wb-card__hd--plain"><h2 class="wb-card__title">趋势概览</h2>' +
    '<p class="wb-card__hint">入离职 / 审批量 · 近 30 天</p></header>' +
    '<div class="wb-card__bd wb-card__bd--tight">' +
    '<div class="wb-trend"><div class="wb-trend__plot">' +
    trendHtml +
    "</div></div></div></section>" +
    '<section class="wb-card wb-card--figma wb-card--lift wb-card--recent" aria-label="最近访问">' +
    '<header class="wb-card__hd wb-card__hd--plain"><h2 class="wb-card__title">最近访问</h2>' +
    '<p class="wb-card__hint">快速回到你最近打开的内容</p></header>' +
    '<div class="wb-card__bd wb-card__bd--tight"><div class="wb-recents">' +
    recentHtml +
    "</div></div></section></div></div></div>"
  );
}

function mountWorkbench() {
  var mountId = "hrms-workbench-root";
  window.setTimeout(function () {
    var el = document.getElementById(mountId);
    if (!el) return;
    if (!window.HrmsApi || !window.HrmsApi.dashboardSummary) {
      el.innerHTML = '<p class="wb-state wb-state--err">API 未加载，请确认已引入 src/api.js。</p>';
      return;
    }
    el.innerHTML = '<p class="wb-state">加载中…</p>';
    window.HrmsApi
      .dashboardSummary()
      .then(function (data) {
        el.innerHTML = renderWorkbenchShell(data);
        if (window.HrmsModal && window.HrmsModal.sync) window.HrmsModal.sync();
      })
      .catch(function () {
        el.innerHTML =
          '<p class="wb-state wb-state--err">无法加载工作台数据。请确认已引入 <code class="wb-code">hrms-static-mock-embed.js</code>；或启动后端 <code class="wb-code">python3 server.py</code> 后刷新。</p>';
      });
  }, 0);
  return '<div id="' + mountId + '" class="wb-mount"></div>';
}

/** 列表行操作 → Hash ctx；组织类「详情」保持 edit 以兼容既有 Mock。 */
function rowActionCtx(cellText, config) {
  var raw = String(cellText || "");
  if (config && config.rowCtx && config.rowCtx[raw]) {
    return config.rowCtx[raw];
  }
  if (raw === "办理") return "approve";
  if (raw === "设计") return "design";
  if (raw === "查看" || raw === "详情") return "view";
  if (raw === "对比") return "compare";
  if (raw === "编辑") return "edit";
  return "view";
}

function isRowModalTrigger(cellText) {
  var raw = String(cellText || "");
  return (
    raw === "编辑" ||
    raw === "详情" ||
    raw === "查看" ||
    raw === "办理" ||
    raw === "查看详情" ||
    raw === "对比" ||
    raw === "授权" ||
    raw === "设计" ||
    raw === "下钻" ||
    raw === "进入"
  );
}

function normalizeDataRow(r) {
  if (r && typeof r === "object" && !Array.isArray(r) && r.cells) {
    var cells = r.cells;
    var id =
      r.id != null && String(r.id) !== ""
        ? String(r.id)
        : cells && cells.length
          ? String(cells[0])
          : "";
    return { id: id, cells: cells || [] };
  }
  if (Array.isArray(r)) {
    return { id: String(r[0] || ""), cells: r };
  }
  return { id: "", cells: [] };
}

function buildOrgFiltersHtml(filters, mountId, path, query) {
  var fq = query || {};
  if (!filters || !filters.length) return "";
  var fields = filters.map(function (f) {
    var key = f.key || "";
    var val = fq[key] != null ? String(fq[key]) : "";
    if (f.type === "select") {
      var opts = (f.options || []).map(function (o) {
        var ov = o.value != null ? String(o.value) : "";
        var sel = ov === val ? " selected" : "";
        return (
          '<option value="' +
          escapeHtml(ov) +
          '"' +
          sel +
          ">" +
          escapeHtml(o.label != null ? String(o.label) : "") +
          "</option>"
        );
      });
      return (
        '<label class="org-filters__item"><span class="org-filters__label">' +
        escapeHtml(f.label || "") +
        '</span><select class="org-filters__control" name="' +
        escapeHtml(key) +
        '">' +
        opts.join("") +
        "</select></label>"
      );
    }
    return (
      '<label class="org-filters__item"><span class="org-filters__label">' +
      escapeHtml(f.label || "") +
      '</span><input type="text" class="org-filters__control" name="' +
      escapeHtml(key) +
      '" value="' +
      escapeHtml(val) +
      '" placeholder="' +
      escapeHtml(f.placeholder || "") +
      '" autocomplete="off" /></label>'
    );
  });
  return (
    '<form class="org-filters" data-hrms-path="' +
    escapeHtml(path) +
    '" data-hrms-mount="' +
    escapeHtml(mountId) +
    '">' +
    '<div class="org-filters__row">' +
    fields.join("") +
    '</div><div class="org-filters__actions">' +
    '<button type="submit" class="org-btn org-btn--tool">查询</button>' +
    '<button type="button" class="org-btn org-btn--ghost org-filters__reset">重置</button>' +
    "</div></form>"
  );
}

/** 列表顶 KPI 条（与画板工作台 KPI / 摘要卡：白底、蓝灰描边、主色点缀） */
function buildKpiStripHtml(kpis) {
  var items = (kpis || []).map(function (x) {
    var v = escapeHtml(x.v != null ? String(x.v) : "");
    var k = escapeHtml(x.k != null ? String(x.k) : "");
    return (
      '<article class="org-kpi-mini" aria-label="' +
      k +
      '">' +
      '<span class="org-kpi-mini__dot" aria-hidden="true"></span>' +
      '<div class="org-kpi-mini__val">' +
      v +
      "</div>" +
      '<div class="org-kpi-mini__lab">' +
      k +
      "</div></article>"
    );
  });
  return '<div class="org-page__kpis-strip-inner">' + items.join("") + "</div>";
}

/** 招聘管理 · 漏斗阶段占位（对齐画板四色块） */
function buildRecruitFunnelHtml() {
  return (
    '<div class="org-recruit-funnel" aria-label="招聘阶段概览">' +
    '<div class="org-recruit-funnel__item org-recruit-funnel__item--cv"><span class="org-recruit-funnel__n">128</span><span class="org-recruit-funnel__t">简历筛选</span></div>' +
    '<div class="org-recruit-funnel__item org-recruit-funnel__item--iv"><span class="org-recruit-funnel__n">32</span><span class="org-recruit-funnel__t">面试中</span></div>' +
    '<div class="org-recruit-funnel__item org-recruit-funnel__item--of"><span class="org-recruit-funnel__n">6</span><span class="org-recruit-funnel__t">Offer</span></div>' +
    '<div class="org-recruit-funnel__item org-recruit-funnel__item--on"><span class="org-recruit-funnel__n">4</span><span class="org-recruit-funnel__t">待入职</span></div>' +
    "</div>"
  );
}

/** 流程中心 · 底部时间线示意 */
function buildWorkflowTimelineHtml() {
  return (
    '<div class="org-wf-timeline" aria-label="流程阶段示意">' +
    '<div class="org-wf-timeline__hd">示例：选中行的流程骨架</div>' +
    '<ol class="org-wf-timeline__track">' +
    '<li class="org-wf-timeline__step is-done"><span>发起</span></li>' +
    '<li class="org-wf-timeline__step is-done"><span>部门审批</span></li>' +
    '<li class="org-wf-timeline__step is-current"><span>HR 复核</span></li>' +
    '<li class="org-wf-timeline__step"><span>归档</span></li>' +
    "</ol></div>"
  );
}

/** 绩效看板 · 右侧图表占位 */
function buildPerformanceAsideHtml() {
  return (
    '<div class="org-perf-charts">' +
    '<div class="org-perf-charts__title">指标分布</div>' +
    '<div class="org-perf-charts__bars" aria-hidden="true">' +
    '<span style="height:72%"></span><span style="height:48%"></span><span style="height:88%"></span><span style="height:56%"></span><span style="height:64%"></span>' +
    "</div>" +
    '<div class="org-perf-charts__donut" aria-hidden="true"><span class="org-perf-charts__donut-ring"></span></div>' +
    '<p class="org-perf-charts__hint">演示用静态图，可替换为 ECharts 等</p>' +
    "</div>"
  );
}

function buildStaffAsideFromData(data) {
  var rows = (data && data.rows) || [];
  if (!rows.length) {
    return '<p class="org-staff-hub__hint">暂无数据</p>';
  }
  var nr = normalizeDataRow(rows[0]);
  var cells = nr.cells || [];
  var no = cells[0] || "—";
  var name = cells[1] || "—";
  var dept = cells[2] || "—";
  var st = cells[3] || "—";
  return (
    '<div class="org-staff-card">' +
    '<div class="org-staff-card__avatar" aria-hidden="true">' +
    escapeHtml(name.slice(0, 1)) +
    "</div>" +
    '<div class="org-staff-card__bd">' +
    '<div class="org-staff-card__name">' +
    escapeHtml(name) +
    "</div>" +
    '<div class="org-staff-card__meta">' +
    escapeHtml(dept) +
    "</div>" +
    '<dl class="org-staff-card__kv">' +
    "<dt>工号</dt><dd>" +
    escapeHtml(no) +
    "</dd>" +
    "<dt>状态</dt><dd>" +
    escapeHtml(st) +
    "</dd></dl>" +
    '<p class="org-staff-card__tip">首行预览 · 点击表格「详情」查看完整弹窗</p>' +
    "</div></div>"
  );
}

function msgRowToneClass(type) {
  var t = String(type || "");
  if (t.indexOf("审批") >= 0) return "msg-row--tone-approval";
  if (t.indexOf("系统") >= 0) return "msg-row--tone-system";
  if (t.indexOf("考勤") >= 0) return "msg-row--tone-attendance";
  return "msg-row--tone-default";
}

function buildOrgTableHtml(data, config) {
  var columns = (data && data.columns) || [];
  var rawRows = (data && data.rows) || [];
  var rowKind = config.rowModal || config.formModal;

  var head =
    "<thead><tr>" +
    columns
      .map(function (c) {
        return "<th>" + escapeHtml(c) + "</th>";
      })
      .join("") +
    "</tr></thead>";

  var body =
    "<tbody>" +
    rawRows
      .map(function (r) {
        var nr = normalizeDataRow(r);
        var cells = nr.cells || [];
        var rowId = nr.id || "";
        var tds = cells
          .map(function (cell, idx) {
            var colName = columns[idx] || "";
            var isAction = colName === "操作";
            var raw = String(cell != null ? cell : "");
            var content = escapeHtml(raw);
            if (isAction && isRowModalTrigger(raw)) {
              var rctx = rowActionCtx(raw, config);

              // 检查是否需要跳转链接（如"设计"按钮跳转到编辑页面）
              if (rctx === "design" && config.designHref) {
                var href = config.designHref.replace(":id", rowId);
                return (
                  '<td class="org-table__actions">' +
                  '<a class="org-link-btn" href="#' + escapeHtml(href) + '">' +
                  content +
                  "</a></td>"
                );
              }

              return (
                '<td class="org-table__actions">' +
                '<button type="button" class="org-link-btn" data-hrms-modal="' +
                escapeHtml(rowKind) +
                '" data-hrms-id="' +
                escapeHtml(rowId) +
                '" data-hrms-ctx="' +
                escapeHtml(rctx) +
                '">' +
                content +
                "</button></td>"
              );
            }
            return "<td>" + content + "</td>";
          })
          .join("");
        return "<tr>" + tds + "</tr>";
      })
      .join("") +
    "</tbody>";

  return (
    '<div class="org-table-wrap">' +
    '<table class="org-table">' +
    head +
    body +
    "</table></div>"
  );
}

function mountOrgList(config) {
  var mountId = config.mountId;
  var path = config.path;
  var filterSlotId = mountId + "-filters";
  var kpiSlotId = mountId + "-kpis";
  var useKpiStrip = config.showKpisStrip !== false;

  // 支持 newHref 参数：如果提供则跳转页面，否则打开弹窗
  var newBtnHtml;
  if (config.newHref) {
    newBtnHtml = '<a class="org-btn org-btn--tool" href="#' + escapeHtml(config.newHref) + '">' + escapeHtml(config.newLabel) + '</a>';
  } else {
    newBtnHtml = '<button type="button" class="org-btn org-btn--tool" data-hrms-modal="' +
      escapeHtml(config.formModal) +
      '" data-hrms-id="new" data-hrms-ctx="create">' +
      escapeHtml(config.newLabel) +
      "</button>";
  }

  var toolbarHtml = config.hideToolbar
    ? ""
    : '<div class="org-toolbar">' + newBtnHtml + "</div>";

  var kpiBlock = useKpiStrip
    ? '<div id="' + escapeHtml(kpiSlotId) + '" class="org-page__kpis-strip is-empty" aria-label="关键指标"></div>'
    : "";
  var funnelBlock = config.recruitFunnel ? buildRecruitFunnelHtml() : "";

  var panelMain = "";
  if (config.staffHubAside) {
    panelMain =
      kpiBlock +
      funnelBlock +
      '<div class="org-staff-hub">' +
      '<div class="org-staff-hub__main">' +
      '<div id="' +
      escapeHtml(filterSlotId) +
      '" class="org-page__filters-wrap"></div>' +
      toolbarHtml +
      '<div id="' +
      escapeHtml(mountId) +
      '" class="org-page__mount"></div>' +
      "</div>" +
      '<aside id="' +
      escapeHtml(mountId) +
      '-aside" class="org-staff-hub__aside" aria-label="员工摘要">' +
      '<p class="org-staff-hub__hint">加载中…</p>' +
      "</aside></div>";
  } else if (config.performanceSplit) {
    panelMain =
      kpiBlock +
      '<div id="' +
      escapeHtml(filterSlotId) +
      '" class="org-page__filters-wrap"></div>' +
      toolbarHtml +
      '<div class="org-perf-layout">' +
      '<div class="org-perf-layout__main">' +
      '<div id="' +
      escapeHtml(mountId) +
      '" class="org-page__mount"></div></div>' +
      '<aside class="org-perf-layout__aside" aria-label="趋势图表">' +
      buildPerformanceAsideHtml() +
      "</aside></div>";
  } else {
    panelMain =
      kpiBlock +
      funnelBlock +
      '<div id="' +
      escapeHtml(filterSlotId) +
      '" class="org-page__filters-wrap"></div>' +
      toolbarHtml +
      '<div id="' +
      escapeHtml(mountId) +
      '" class="org-page__mount"></div>' +
      (config.workflowTimeline ? buildWorkflowTimelineHtml() : "");
  }

  window.setTimeout(function () {
    var tableMount = document.getElementById(mountId);
    var filterMount = document.getElementById(filterSlotId);
    var kpiMount = useKpiStrip ? document.getElementById(kpiSlotId) : null;
    if (!tableMount) return;
    if (!window.HrmsApi || !window.HrmsApi.pageData) {
      tableMount.innerHTML = '<p class="wb-state wb-state--err">API 未加载。</p>';
      return;
    }
    var query = {};

    function bindFilterForm(form) {
      if (!form) return;
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var fd = new FormData(form);
        query = {};
        fd.forEach(function (v, k) {
          query[k] = String(v != null ? v : "");
        });
        refetch();
      });
      var resetBtn = form.querySelector(".org-filters__reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          query = {};
          form.reset();
          refetch();
        });
      }
    }

    function refetch() {
      tableMount.innerHTML = '<p class="wb-state">加载中…</p>';
      if (kpiMount) {
        kpiMount.innerHTML = "";
        kpiMount.classList.add("is-empty");
      }
      window.HrmsApi
        .pageData(path, query)
        .then(function (data) {
          var filters = (data && data.filters) || [];
          var filtersHtml = filters.length ? buildOrgFiltersHtml(filters, mountId, path, query) : "";
          if (filterMount) filterMount.innerHTML = filtersHtml;
          tableMount.innerHTML = buildOrgTableHtml(data, config);
          bindFilterForm(filterMount ? filterMount.querySelector("form.org-filters") : null);
          if (kpiMount) {
            var kpis = (data && data.kpis) || [];
            if (kpis.length) {
              kpiMount.innerHTML = buildKpiStripHtml(kpis);
              kpiMount.classList.remove("is-empty");
            } else {
              kpiMount.innerHTML = "";
              kpiMount.classList.add("is-empty");
            }
          }
          if (config.staffHubAside) {
            var asideEl = document.getElementById(mountId + "-aside");
            if (asideEl) asideEl.innerHTML = buildStaffAsideFromData(data);
          }
          if (window.HrmsModal && window.HrmsModal.sync) window.HrmsModal.sync();
        })
        .catch(function () {
          if (filterMount) filterMount.innerHTML = "";
          if (kpiMount) {
            kpiMount.innerHTML = "";
            kpiMount.classList.add("is-empty");
          }
          tableMount.innerHTML =
            '<p class="wb-state wb-state--err">无法加载列表。无后端时应自动使用离线 Mock；请确认已引入 <code class="wb-code">hrms-page-mock-embed.js</code> 或启动后端后刷新。</p>';
        });
    }

    refetch();
  }, 0);

  return (
    '<div class="org-page org-page--figma">' +
    '<header class="org-page__hero org-page__hero--biz" aria-labelledby="org-page-title">' +
    '<div class="org-page__hero-main">' +
    '<h1 id="org-page-title" class="org-page__title">' +
    escapeHtml(config.title) +
    "</h1>" +
    '<p class="org-page__sub">' +
    escapeHtml(config.subtitle) +
    "</p>" +
    "</div>" +
    '<span class="org-page__hero-badge">演示环境</span>' +
    "</header>" +
    '<section class="org-page__panel org-page__panel--figma">' +
    panelMain +
    "</section>" +
    "</div>"
  );
}

/** Figma 侧栏入口占位：与列表页同一壳体（Hero + 白卡片） */
function renderFigmaStubPage(title, subtitle, bodyHtml) {
  return (
    '<div class="org-page">' +
    '<header class="org-page__hero" aria-labelledby="stub-title">' +
    '<h1 id="stub-title" class="org-page__title">' +
    escapeHtml(title) +
    "</h1>" +
    '<p class="org-page__sub">' +
    escapeHtml(subtitle) +
    "</p>" +
    "</header>" +
    '<section class="org-page__panel org-page__panel--stub">' +
    (bodyHtml || '<p class="org-page__stub-note">该模块与 Figma 画板对应，后续可接真实路由与接口。</p>') +
    "</section>" +
    "</div>"
  );
}

function msgPillClass(status) {
  var s = String(status || "");
  if (s === "未读") return "msg-pill msg-pill--unread";
  return "msg-pill msg-pill--read";
}

/** 消息中心：GET /api/messages */
function mountMessagesPage() {
  var mountId = "hrms-msg-mount";
  window.setTimeout(function () {
    var root = document.getElementById(mountId);
    if (!root) return;

    function readFilters() {
      var form = document.getElementById("hrms-msg-filters");
      if (!form) return { q: "", type: "", status: "" };
      var fd = new FormData(form);
      return {
        q: String(fd.get("q") || ""),
        type: String(fd.get("type") || ""),
        status: String(fd.get("status") || ""),
      };
    }

    function renderTable(items) {
      if (!items.length) {
        root.innerHTML = '<p class="org-page__stub-note">暂无消息</p>';
        return;
      }
      var rows = items
        .map(function (m) {
          return (
            '<tr class="msg-row ' +
            msgRowToneClass(m.type) +
            '">' +
            "<td>" +
            escapeHtml(m.type) +
            "</td>" +
            "<td><span class=\"" +
            msgPillClass(m.status) +
            "\">" +
            escapeHtml(m.status) +
            "</span></td>" +
            "<td>" +
            escapeHtml(m.title) +
            "</td>" +
            "<td>" +
            escapeHtml(m.from) +
            "</td>" +
            "<td>" +
            escapeHtml(m.time) +
            "</td>" +
            '<td class="org-table__actions"><button type="button" class="org-link-btn" data-hrms-modal="msg" data-hrms-id="' +
            escapeHtml(m.id) +
            '">查看</button></td></tr>'
          );
        })
        .join("");
      root.innerHTML =
        '<div class="org-table-wrap"><table class="org-table"><thead><tr>' +
        "<th>类型</th><th>状态</th><th>标题</th><th>来源</th><th>时间</th><th>操作</th>" +
        "</tr></thead><tbody>" +
        rows +
        "</tbody></table></div>";
      if (window.HrmsModal && window.HrmsModal.sync) window.HrmsModal.sync();
    }

    function load() {
      root.innerHTML = '<p class="org-page__stub-note">加载中…</p>';
      var f = readFilters();
      if (!window.HrmsApi || !window.HrmsApi.messages) {
        root.innerHTML = '<p class="wb-state wb-state--err">API 未加载。</p>';
        return;
      }
      window.HrmsApi
        .messages(f)
        .then(function (data) {
          renderTable((data && data.items) || []);
        })
        .catch(function () {
          root.innerHTML =
            '<p class="wb-state wb-state--err">无法加载消息。请确认离线数据脚本已加载，或启动后端后刷新。</p>';
        });
    }

    var form = document.getElementById("hrms-msg-filters");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        load();
      });
      var resetBtn = form.querySelector(".org-filters__reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          form.reset();
          load();
        });
      }
    }
    load();
  }, 0);

  return (
    '<div class="org-page org-page--figma">' +
    '<header class="org-page__hero org-page__hero--biz" aria-labelledby="msg-page-title">' +
    '<div class="org-page__hero-main">' +
    '<h1 id="msg-page-title" class="org-page__title">消息中心</h1>' +
    '<p class="org-page__sub">系统、审批与业务订阅；按类型与状态筛选，行左侧色条区分消息类型。</p>' +
    "</div>" +
    '<span class="org-page__hero-badge">演示环境</span>' +
    "</header>" +
    '<section class="org-page__panel org-page__panel--figma">' +
    '<div class="msg-quick-tabs" role="tablist" aria-label="消息分类">' +
    '<span class="msg-quick-tabs__item is-active">全部</span>' +
    '<span class="msg-quick-tabs__item">未读</span>' +
    '<span class="msg-quick-tabs__item">系统通知</span>' +
    "</div>" +
    '<form id="hrms-msg-filters" class="org-filters">' +
    '<div class="org-filters__row">' +
    '<label class="org-filters__item"><span class="org-filters__label">关键词</span>' +
    '<input class="org-filters__control" type="search" name="q" placeholder="标题关键词" autocomplete="off" /></label>' +
    '<label class="org-filters__item"><span class="org-filters__label">类型</span>' +
    '<select class="org-filters__control" name="type">' +
    '<option value="">全部</option><option value="审批">审批</option><option value="系统">系统</option><option value="考勤">考勤</option>' +
    "</select></label>" +
    '<label class="org-filters__item"><span class="org-filters__label">状态</span>' +
    '<select class="org-filters__control" name="status">' +
    '<option value="">全部</option><option value="未读">未读</option><option value="已读">已读</option>' +
    "</select></label></div>" +
    '<div class="org-filters__actions">' +
    '<button type="submit" class="org-btn org-btn--tool">查询</button>' +
    '<button type="button" class="org-btn org-btn--ghost org-filters__reset">重置</button>' +
    "</div></form>" +
    '<div id="' +
    mountId +
    '" class="org-page__mount"></div></section></div>'
  );
}

/** 待办 / 已办：GET /api/inbox/todo | /api/inbox/done */
function mountInboxPage(isDone) {
  var mountId = "hrms-inbox-mount";
  window.setTimeout(function () {
    var root = document.getElementById(mountId);
    if (!root) return;

    function readQ() {
      var form = document.getElementById("hrms-inbox-filters");
      if (!form) return "";
      return String(new FormData(form).get("q") || "");
    }

    function renderTodo(items) {
      if (!items.length) {
        root.innerHTML = '<p class="org-page__stub-note">暂无待办</p>';
        return;
      }
      var rows = items
        .map(function (w) {
          return (
            "<tr>" +
            "<td>" +
            escapeHtml(w.title) +
            "</td>" +
            "<td>" +
            escapeHtml(w.initiator) +
            "</td>" +
            "<td>" +
            escapeHtml(w.arrivedAt) +
            "</td>" +
            "<td>" +
            escapeHtml(w.module) +
            "</td>" +
            "<td>" +
            escapeHtml(w.status) +
            "</td>" +
            '<td class="org-table__actions"><button type="button" class="org-link-btn" data-hrms-modal="wf" data-hrms-id="' +
            escapeHtml(w.id) +
            '">处理</button></td></tr>'
          );
        })
        .join("");
      root.innerHTML =
        '<div class="org-table-wrap"><table class="org-table"><thead><tr>' +
        "<th>标题</th><th>发起人</th><th>到达时间</th><th>所属模块</th><th>状态</th><th>操作</th>" +
        "</tr></thead><tbody>" +
        rows +
        "</tbody></table></div>";
      if (window.HrmsModal && window.HrmsModal.sync) window.HrmsModal.sync();
    }

    function renderDone(items) {
      if (!items.length) {
        root.innerHTML = '<p class="org-page__stub-note">暂无已办记录</p>';
        return;
      }
      var rows = items
        .map(function (w) {
          return (
            "<tr>" +
            "<td>" +
            escapeHtml(w.title) +
            "</td>" +
            "<td>" +
            escapeHtml(w.initiator) +
            "</td>" +
            "<td>" +
            escapeHtml(w.closedAt) +
            "</td>" +
            "<td>" +
            escapeHtml(w.duration) +
            "</td>" +
            "<td>" +
            escapeHtml(w.result) +
            "</td>" +
            '<td class="org-table__actions"><button type="button" class="org-link-btn" data-hrms-modal="record" data-hrms-id="' +
            escapeHtml(w.id) +
            '" data-hrms-ctx="inbox-done">详情</button></td></tr>'
          );
        })
        .join("");
      root.innerHTML =
        '<div class="org-table-wrap"><table class="org-table"><thead><tr>' +
        "<th>流程标题</th><th>发起人</th><th>办结时间</th><th>耗时</th><th>结果</th><th>操作</th>" +
        "</tr></thead><tbody>" +
        rows +
        "</tbody></table></div>";
      if (window.HrmsModal && window.HrmsModal.sync) window.HrmsModal.sync();
    }

    function load() {
      root.innerHTML = '<p class="org-page__stub-note">加载中…</p>';
      var q = readQ();
      if (!window.HrmsApi) {
        root.innerHTML = '<p class="wb-state wb-state--err">API 未加载。</p>';
        return;
      }
      var req = isDone ? window.HrmsApi.inboxDone({ q: q }) : window.HrmsApi.inboxTodo({ q: q });
      req
        .then(function (data) {
          var items = (data && data.items) || [];
          if (isDone) renderDone(items);
          else renderTodo(items);
        })
        .catch(function () {
          root.innerHTML =
            '<p class="wb-state wb-state--err">无法加载待办/已办。请确认离线数据脚本已加载，或启动后端后刷新。</p>';
        });
    }

    var form = document.getElementById("hrms-inbox-filters");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        load();
      });
      var resetBtn = form.querySelector(".org-filters__reset");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          form.reset();
          load();
        });
      }
    }
    load();
  }, 0);

  var tabTodo = isDone ? "inbox-tab" : "inbox-tab is-active";
  var tabDone = isDone ? "inbox-tab is-active" : "inbox-tab";
  return (
    '<div class="org-page org-page--figma">' +
    '<header class="org-page__hero org-page__hero--biz" aria-labelledby="inbox-page-title">' +
    '<div class="org-page__hero-main">' +
    '<h1 id="inbox-page-title" class="org-page__title">待办 / 已办</h1>' +
    '<p class="org-page__sub">待办由流程中心推送；已办保留办结快照便于追溯。</p>' +
    "</div>" +
    '<span class="org-page__hero-badge">演示环境</span>' +
    "</header>" +
    '<section class="org-page__panel org-page__panel--figma">' +
    '<div class="inbox-stat-cards" aria-label="任务概览">' +
    '<div class="inbox-stat-card inbox-stat-card--todo"><span class="inbox-stat-card__n">18</span><span class="inbox-stat-card__t">待处理</span></div>' +
    '<div class="inbox-stat-card inbox-stat-card--done"><span class="inbox-stat-card__n">42</span><span class="inbox-stat-card__t">本周已办</span></div>' +
    "</div>" +
    '<form id="hrms-inbox-filters" class="org-filters org-filters--compact">' +
    '<div class="org-filters__row">' +
    '<label class="org-filters__item"><span class="org-filters__label">关键词</span>' +
    '<input class="org-filters__control" type="search" name="q" placeholder="标题 / 发起人" autocomplete="off" /></label></div>' +
    '<div class="org-filters__actions">' +
    '<button type="submit" class="org-btn org-btn--tool">查询</button>' +
    '<button type="button" class="org-btn org-btn--ghost org-filters__reset">重置</button>' +
    "</div></form>" +
    '<div class="inbox-tabs" role="tablist" aria-label="待办与已办">' +
    '<a class="' +
    tabTodo +
    '" role="tab" href="#/inbox" aria-selected="' +
    String(!isDone) +
    '">待办任务</a>' +
    '<a class="' +
    tabDone +
    '" role="tab" href="#/inbox/done" aria-selected="' +
    String(!!isDone) +
    '">已办任务</a>' +
    "</div>" +
    '<div id="' +
    mountId +
    '" class="org-page__mount"></div></section></div>'
  );
}

function renderNotImplemented(path) {
  var p = normalizePath(path);
  var pe = escapeHtml(p);
  return renderFigmaStubPage(
    "页面建设中",
    "与 Figma 文件 ZHNbAy50bYd0oqZavray98 导航一致；此路径尚未接入业务界面。",
    '<p class="org-page__stub-note">路径 <code class="wb-code">' +
      pe +
      '</code></p><p class="org-page__stub-note"><a class="org-page__stub-link" href="#/workbench">返回工作台</a></p>'
  );
}

/**
 * 考勤管理页面 — 对应 Figma 1293:7493
 */
function mountAttendancePage() {
  var kpis = [
    { label: "今日出勤", value: "1,256", note: "出勤率 94%", color: "green" },
    { label: "迟到人数", value: "12", note: "", color: "orange" },
    { label: "早退人数", value: "5", note: "", color: "red" },
    { label: "请假人数", value: "23", note: "", color: "purple" },
    { label: "外出人数", value: "44", note: "", color: "blue" }
  ];

  var rows = [
    { name: "张伟", id: "E001", dept: "技术部", deptColor: "blue", clockIn: "08:55", clockOut: "18:30", status: "正常", statusClass: "normal", hours: "9.5h" },
    { name: "李娜", id: "E002", dept: "产品部", deptColor: "green", clockIn: "09:15", clockOut: "19:00", status: "迟到", statusClass: "late", hours: "9.75h" },
    { name: "王磊", id: "E003", dept: "技术部", deptColor: "orange", clockIn: "08:45", clockOut: "17:30", status: "早退", statusClass: "early", hours: "8.75h" },
    { name: "刘洋", id: "E005", dept: "测试部", deptColor: "orange", clockIn: "08:50", clockOut: "18:45", status: "正常", statusClass: "normal", hours: "9.9h" },
    { name: "陈晨", id: "E006", dept: "运营部", deptColor: "purple", clockIn: "09:02", clockOut: "18:20", status: "迟到", statusClass: "late", hours: "9.3h" }
  ];

  var kpisHtml = kpis.map(function(k) {
    return '<div class="attendance-kpi attendance-kpi--' + k.color + '">' +
      '<div class="attendance-kpi__header">' +
      '<div class="attendance-kpi__icon attendance-kpi__icon--' + k.color + '"></div>' +
      '<span class="attendance-kpi__label">' + escapeHtml(k.label) + '</span></div>' +
      '<div class="attendance-kpi__value attendance-kpi__value--' + k.color + '">' + escapeHtml(k.value) + '</div>' +
      (k.note ? '<div class="attendance-kpi__note attendance-kpi__note--' + k.color + '">' + escapeHtml(k.note) + '</div>' : '') +
      '</div>';
  }).join("");

  var rowsHtml = rows.map(function(r) {
    return '<div class="attendance-table__row">' +
      '<span class="attendance-table__cell attendance-table__cell--name">' + escapeHtml(r.name) + '</span>' +
      '<span class="attendance-table__cell">' + escapeHtml(r.id) + '</span>' +
      '<span class="attendance-table__cell attendance-table__cell--dept attendance-table__cell--dept-' + r.deptColor + '">' + escapeHtml(r.dept) + '</span>' +
      '<span class="attendance-table__cell attendance-table__cell--time">' + escapeHtml(r.clockIn) + '</span>' +
      '<span class="attendance-table__cell attendance-table__cell--time">' + escapeHtml(r.clockOut) + '</span>' +
      '<span class="attendance-table__cell attendance-table__cell--status attendance-table__cell--status-' + r.statusClass + '">' + escapeHtml(r.status) + '</span>' +
      '<span class="attendance-table__cell attendance-table__cell--hours">' + escapeHtml(r.hours) + '</span></div>';
  }).join("");

  return '<div class="attendance-page">' +
    '<div class="attendance-header">' +
    '<h1 class="attendance-header__title">考勤管理</h1>' +
    '<div class="attendance-header__date">' +
    '<div class="attendance-header__date-divider"></div>' +
    '<span class="attendance-header__date-text">2026年5月18日 星期日</span>' +
    '<div class="attendance-header__date-divider"></div></div></div>' +
    '<div class="attendance-kpis">' + kpisHtml + '</div>' +
    '<div class="attendance-tabs">' +
    '<div class="attendance-tab attendance-tab--active">考勤统计</div>' +
    '<div class="attendance-tab attendance-tab--warning">异常处理</div>' +
    '<div class="attendance-tab attendance-tab--purple">排班管理</div>' +
    '<div class="attendance-tab attendance-tab--green">导出报表</div></div>' +
    '<div class="attendance-filter">' +
    '<div class="attendance-filter__item">全部部门</div>' +
    '<div class="attendance-filter__item">全部状态</div>' +
    '<div class="attendance-filter__search"><input class="attendance-filter__search-input" placeholder="搜索员工姓名..." readonly></div></div>' +
    '<div class="attendance-table">' +
    '<div class="attendance-table__header">' +
    '<span>员工信息</span><span>工号</span><span>部门</span><span>上班打卡</span><span>下班打卡</span><span>考勤状态</span><span>工时</span></div>' +
    rowsHtml + '</div></div>';
}

/**
 * 薪酬管理页面 — 对应 Figma 1293:7766
 */
function mountSalaryPage() {
  var kpis = [
    { label: "本月应发总额", value: "¥3,256,800", note: "同比 +2.5%", color: "blue" },
    { label: "本月实发总额", value: "¥2,845,200", note: "同比 +1.8%", color: "green" },
    { label: "社保公积金", value: "¥411,600", note: "同比 稳定", color: "purple" },
    { label: "本月个税", value: "¥186,400", note: "同比 +3.2%", color: "orange" }
  ];

  var rows = [
    { name: "李娜", dept: "产品部", deptColor: "green", base: "¥18000", perf: "¥4500", overtime: "¥0", social: "¥1980", fund: "¥2160", tax: "¥2520", actual: "¥25840", status: "已确认" },
    { name: "王磊", dept: "技术部", deptColor: "blue", base: "¥16000", perf: "¥2800", overtime: "¥1200", social: "¥1760", fund: "¥1920", tax: "¥1680", actual: "¥24640", status: "待确认" },
    { name: "赵敏", dept: "设计部", deptColor: "purple", base: "¥14000", perf: "¥2200", overtime: "¥600", social: "¥1540", fund: "¥1680", tax: "¥1120", actual: "¥21460", status: "已确认" },
    { name: "刘洋", dept: "测试部", deptColor: "blue-light", base: "¥13000", perf: "¥2000", overtime: "¥400", social: "¥1430", fund: "¥1560", tax: "¥980", actual: "¥19430", status: "待确认" }
  ];

  var kpisHtml = kpis.map(function(k) {
    var noteClass = k.note.indexOf("稳定") > -1 ? "blue" : "green";
    return '<div class="salary-kpi salary-kpi--' + k.color + '">' +
      '<span class="salary-kpi__label">' + escapeHtml(k.label) + '</span>' +
      '<div class="salary-kpi__value salary-kpi__value--' + k.color + '">' + escapeHtml(k.value) + '</div>' +
      '<div class="salary-kpi__note salary-kpi__note--' + noteClass + '">' + escapeHtml(k.note) + '</div></div>';
  }).join("");

  var rowsHtml = rows.map(function(r) {
    var statusClass = r.status === "已确认" ? "confirmed" : "pending";
    return '<div class="salary-table__row">' +
      '<span class="salary-table__cell salary-table__cell--name">' + escapeHtml(r.name) + '</span>' +
      '<span class="salary-table__cell salary-table__cell--dept salary-table__cell--dept-' + r.deptColor + '">' + escapeHtml(r.dept) + '</span>' +
      '<span class="salary-table__cell">' + escapeHtml(r.base) + '</span>' +
      '<span class="salary-table__cell">' + escapeHtml(r.perf) + '</span>' +
      '<span class="salary-table__cell">' + escapeHtml(r.overtime) + '</span>' +
      '<span class="salary-table__cell">' + escapeHtml(r.social) + '</span>' +
      '<span class="salary-table__cell">' + escapeHtml(r.fund) + '</span>' +
      '<span class="salary-table__cell">' + escapeHtml(r.tax) + '</span>' +
      '<span class="salary-table__cell salary-table__cell--amount">' + escapeHtml(r.actual) + '</span>' +
      '<span class="salary-table__cell salary-table__cell--status salary-table__cell--status-' + statusClass + '">' + escapeHtml(r.status) + '</span></div>';
  }).join("");

  return '<div class="salary-page">' +
    '<div class="salary-header">' +
    '<h1 class="salary-header__title">薪酬管理</h1>' +
    '<div class="salary-header__month">' +
    '<span class="salary-header__month-text">2026年5月</span></div></div>' +
    '<div class="salary-kpis">' + kpisHtml + '</div>' +
    '<div class="salary-tabs">' +
    '<div class="salary-tab"><span class="salary-tab__text salary-tab__text--active">工资单明细</span><div class="salary-tab__underline"></div></div>' +
    '<div class="salary-tab"><span class="salary-tab__text salary-tab__text--default">薪资结构</span></div>' +
    '<div class="salary-tab"><span class="salary-tab__text salary-tab__text--default">调整记录</span></div>' +
    '<div class="salary-tab"><span class="salary-tab__text salary-tab__text--default">个税计算</span></div></div>' +
    '<div class="salary-toolbar">' +
    '<div class="salary-toolbar__filter">全部部门</div>' +
    '<div class="salary-toolbar__filter">全部状态</div>' +
    '<div class="salary-toolbar__btn salary-toolbar__btn--outline">导出报表</div>' +
    '<div class="salary-toolbar__btn salary-toolbar__btn--green">批量确认</div>' +
    '<div class="salary-toolbar__btn salary-toolbar__btn--primary">+ 发放工资</div></div>' +
    '<div class="salary-table">' +
    '<div class="salary-table__header">' +
    '<span>员工</span><span>部门</span><span>基本工资</span><span>绩效</span><span>加班费</span><span>社保</span><span>公积金</span><span>个税</span><span>实发</span><span>状态</span></div>' +
    rowsHtml + '</div></div>';
}

/**
 * 培训管理页面 — 对应 Figma 1293:7945
 */
function mountTrainingPage() {
  var stats = [
    { label: "总培训人数", value: "356", color: "gray" },
    { label: "本月完成", value: "12", color: "green" },
    { label: "进行中培训", value: "8", color: "blue" },
    { label: "待开始", value: "5", color: "purple" }
  ];

  var trainings = [
    { title: "新员工入职培训", status: "进行中", statusClass: "progress", date: "2026-05-20", teacher: "HR部", location: "会议室A", count: "25/30人", progress: 60, progressColor: "blue" },
    { title: "劳动法规培训", status: "待开始", statusClass: "pending", date: "2026-05-22", teacher: "法务部", location: "线上", count: "50/50人", progress: 0, progressColor: "blue" },
    { title: "安全生产培训", status: "已完成", statusClass: "done", date: "2026-05-15", teacher: "安全部", location: "大会议室", count: "120/120人", progress: 100, progressColor: "green" },
    { title: "领导力提升培训", status: "待开始", statusClass: "pending", date: "2026-05-25", teacher: "外部讲师", location: "培训中心", count: "30/40人", progress: 0, progressColor: "blue" }
  ];

  var statsHtml = stats.map(function(s) {
    return '<div class="training-stat">' +
      '<span class="training-stat__label">' + escapeHtml(s.label) + '</span>' +
      '<div class="training-stat__value training-stat__value--' + s.color + '">' + escapeHtml(s.value) + '</div></div>';
  }).join("");

  var cardsHtml = trainings.map(function(t) {
    return '<div class="training-card">' +
      '<div class="training-card__header">' +
      '<span class="training-card__title">' + escapeHtml(t.title) + '</span>' +
      '<span class="training-card__status training-card__status--' + t.statusClass + '">' + escapeHtml(t.status) + '</span></div>' +
      '<span class="training-card__date">' + escapeHtml(t.date) + '</span>' +
      '<div class="training-card__meta">' +
      '<span>讲师: ' + escapeHtml(t.teacher) + '</span>' +
      '<span>' + escapeHtml(t.location) + '</span></div>' +
      '<span class="training-card__count">参与人数: ' + escapeHtml(t.count) + '</span>' +
      '<div class="training-card__progress">' +
      '<div class="training-card__progress-bar training-card__progress-bar--' + t.progressColor + '" style="width:' + t.progress + '%"></div></div>' +
      '<span class="training-card__progress-text">完成进度: ' + t.progress + '%</span>' +
      '<div class="training-card__actions">' +
      '<div class="training-card__btn training-card__btn--primary">详情</div>' +
      '<div class="training-card__btn training-card__btn--default">管理</div></div></div>';
  }).join("");

  return '<div class="training-page">' +
    '<div class="training-header">' +
    '<h1 class="training-header__title">培训管理</h1>' +
    '<div class="training-header__btn">+ 新建培训</div></div>' +
    '<div class="training-stats">' + statsHtml + '</div>' +
    '<div class="training-cards">' + cardsHtml + '</div></div>';
}

/**
 * 404 页面 — 对应 Figma 1293:8267
 */
function mountNotFoundPage() {
  return '<div class="notfound-page">' +
    '<div class="notfound-content">' +
    '<h1 class="notfound-code">404</h1>' +
    '<h2 class="notfound-title">页面走丢了</h2>' +
    '<p class="notfound-desc">抱歉，您访问的页面不存在或已被移除</p>' +
    '<div class="notfound-actions">' +
    '<a class="notfound-btn notfound-btn--primary" href="#/workbench">返回首页</a>' +
    '<a class="notfound-btn notfound-btn--secondary" href="#">联系管理员</a></div></div></div>';
}

/**
 * 个人设置页面 — 对应 Figma 1293:8524
 */
function mountSettingsPage() {
  var options = [
    { title: "账户安全", desc: "密码修改、登录设备管理、两步验证" },
    { title: "通知设置", desc: "消息提醒、邮件通知、推送设置" },
    { title: "隐私设置", desc: "个人信息可见范围、数据导出" },
    { title: "主题设置", desc: "界面主题、语言偏好、字体大小" },
    { title: "帮助与反馈", desc: "使用帮助、常见问题、意见反馈" }
  ];

  var optionsHtml = options.map(function(o) {
    return '<div class="settings-option">' +
      '<div class="settings-option__content">' +
      '<span class="settings-option__title">' + escapeHtml(o.title) + '</span>' +
      '<span class="settings-option__desc">' + escapeHtml(o.desc) + '</span></div>' +
      '<span class="settings-option__arrow">›</span></div>';
  }).join("");

  return '<div class="settings-page">' +
    '<h1 class="settings-page__title">个人设置</h1>' +
    '<div class="settings-profile">' +
    '<div class="settings-profile__avatar">' +
    '<span class="settings-profile__avatar-text">张</span></div>' +
    '<div class="settings-profile__info">' +
    '<h2 class="settings-profile__name">张三</h2>' +
    '<p class="settings-profile__position">产品经理 · 产品部 · 入职 2 年</p>' +
    '<p class="settings-profile__contact">zhangsan@company.com · 138****5678</p></div>' +
    '<div class="settings-profile__edit">编辑</div></div>' +
    '<div class="settings-options">' + optionsHtml + '</div></div>';
}

/**
 * 招聘管理页面 — 对应 Figma 1293:7157
 */
/**
 * 招聘管理页面 — 对应 Figma 786:15556
 * 五列漏斗布局，支持子页面导航
 */
function mountRecruitPage(subPage) {
  // 检查是否为子页面
  if (subPage === 'candidate') {
    return mountRecruitCandidatePage();
  }
  if (subPage === 'position') {
    return mountRecruitPositionPage();
  }
  if (subPage === 'interview') {
    return mountRecruitInterviewPage();
  }
  if (subPage === 'offer') {
    return mountRecruitOfferPage();
  }

  // KPI 数据
  var kpis = [
    { label: "开放 HC", value: "54" },
    { label: "漏斗中位时长", value: "92h" },
    { label: "面试官负载", value: "8.9h" },
    { label: "Offer 接受率", value: "71%" }
  ];

  // 漏斗列数据
  var funnelCols = [
    { id: "demand", title: "需求", titleColor: "blue", bgClass: "demand", metricColor: "blue",
      metric: '<strong>2</strong>｜后端', fields: 'JD 更新 / 优先级 / HC' },
    { id: "funnel", title: "漏斗", titleColor: "purple", bgClass: "funnel", metricColor: "purple",
      metric: '简历 <strong>318</strong>｜<strong>24</strong>h SLA', fields: '内推占比 / 来源 / SLA' },
    { id: "session", title: "场次", titleColor: "teal", bgClass: "session", metricColor: "teal",
      metric: '在面 <strong>46</strong>｜爽约率 <strong>13%</strong>', fields: '面试轮次 / 负载 / 爽约' },
    { id: "offer", title: "Offer", titleColor: "orange", bgClass: "offer", metricColor: "orange",
      metric: '待发 <strong>11</strong>｜接受率预估 <strong>71%</strong>', fields: '审批状态 / 竞品风险 / 薪酬' },
    { id: "onboard", title: "到岗", titleColor: "green", bgClass: "onboard", metricColor: "green",
      metric: '下周入职 <strong>6</strong> 人', fields: '背调 / 设备工单 / 报到日' }
  ];

  // 候选人表格数据
  var candidates = [
    { name: "李四", stage: "场次", progress: "已面 3 轮｜背调待定", version: "v2.1", review: "优秀", keyHC: "是" },
    { name: "Mike", stage: "Offer", progress: "Offer 待审批｜竞品 counter", version: "v2.1", review: "待定", keyHC: "是" },
    { name: "Amy", stage: "到岗", progress: "下周四报到｜Relocation", version: "v2.0", review: "通过", keyHC: "否" }
  ];

  // 渲染 KPI 卡片
  var kpisHtml = kpis.map(function(k) {
    return '<div class="recruit-kpi">' +
      '<div class="recruit-kpi__label">' + escapeHtml(k.label) + '</div>' +
      '<div class="recruit-kpi__value">' + escapeHtml(k.value) + '</div></div>';
  }).join("");

  // 渲染漏斗列
  var colsHtml = funnelCols.map(function(col) {
    return '<div class="recruit-funnel__col recruit-funnel__col--' + col.bgClass + '" data-stage="' + col.id + '" onclick="window.location.hash=\'#!/recruit/candidate\'">' +
      '<div class="recruit-funnel__col-title recruit-funnel__col-title--' + col.titleColor + '">' + escapeHtml(col.title) + '</div>' +
      '<div class="recruit-funnel__col-metric recruit-funnel__col-metric--' + col.metricColor + '">' + col.metric + '</div>' +
      '<div class="recruit-funnel__col-label">关键字段</div>' +
      '<div class="recruit-funnel__col-fields">' + escapeHtml(col.fields) + '</div></div>';
  }).join("");

  // 渲染表格行
  var rowsHtml = candidates.map(function(c) {
    return '<tr onclick="window.location.hash=\'#!/recruit/candidate\'" style="cursor:pointer">' +
      '<td>' + escapeHtml(c.name) + '</td>' +
      '<td>' + escapeHtml(c.stage) + '</td>' +
      '<td>' + escapeHtml(c.progress) + '</td>' +
      '<td>' + escapeHtml(c.version) + '</td>' +
      '<td>' + escapeHtml(c.review) + '</td>' +
      '<td>' + escapeHtml(c.keyHC) + '</td></tr>';
  }).join("");

  return '<div class="recruit-page">' +
    '<header class="recruit-hero">' +
    '<h1 class="recruit-hero__title">招聘管理｜五列漏斗</h1>' +
    '<p class="recruit-hero__subtitle">把 HC、漏斗阶段、面试官负载和 Offer 风险放在一张图里。</p>' +
    '<div class="recruit-hero__actions">' +
    '<button class="recruit-hero__btn recruit-hero__btn--primary" onclick="window.location.hash=\'#!/recruit/candidate\'">录入候选人</button>' +
    '<button class="recruit-hero__btn recruit-hero__btn--default">导出漏斗</button>' +
    '<button class="recruit-hero__btn recruit-hero__btn--default">面试官负载</button>' +
    '<button class="recruit-hero__btn recruit-hero__btn--default">Offer 草稿</button>' +
    '</div></header>' +
    '<section class="recruit-kpis">' + kpisHtml + '</section>' +
    '<section class="recruit-funnel">' +
    '<div class="recruit-funnel__header">' +
    '<h2 class="recruit-funnel__title">招聘漏斗</h2>' +
    '<p class="recruit-funnel__subtitle">需求 → 漏斗 → 场次 → Offer → 到岗</p></div>' +
    '<div class="recruit-funnel__cols">' + colsHtml + '</div>' +
    '<div class="recruit-candidates">' +
    '<span class="recruit-candidates__title">候选人清单</span>' +
    '<p class="recruit-candidates__hint">当前聚焦阶段：Offer · 题库版本 / 面试官评价 / 薪酬区间 / 是否关键 HC</p>' +
    '<div class="recruit-table-wrap">' +
    '<table class="recruit-table"><thead><tr>' +
    '<th>候选人</th><th>阶段</th><th>进展摘要</th><th>题库版本</th><th>面试官评价</th><th>关键 HC</th>' +
    '</tr></thead><tbody>' + rowsHtml + '</tbody></table></div></div>' +
    '</section></div>';
}

/**
 * 招聘管理 - 候选人详情子页面
 */
function mountRecruitCandidatePage() {
  var candidates = [
    { name: "李四", stage: "场次", progress: "已面 3 轮｜背调待定", version: "v2.1", review: "优秀", keyHC: "是" },
    { name: "Mike", stage: "Offer", progress: "Offer 待审批｜竞品 counter", version: "v2.1", review: "待定", keyHC: "是" },
    { name: "Amy", stage: "到岗", progress: "下周四报到｜Relocation", version: "v2.0", review: "通过", keyHC: "否" },
    { name: "张伟", stage: "漏斗", progress: "简历筛选中｜待安排面试", version: "v2.1", review: "待定", keyHC: "否" },
    { name: "王刚", stage: "需求", progress: "HC 已确认｜待发布 JD", version: "v2.0", review: "—", keyHC: "是" }
  ];

  var rowsHtml = candidates.map(function(c) {
    return '<tr>' +
      '<td>' + escapeHtml(c.name) + '</td>' +
      '<td>' + escapeHtml(c.stage) + '</td>' +
      '<td>' + escapeHtml(c.progress) + '</td>' +
      '<td>' + escapeHtml(c.version) + '</td>' +
      '<td>' + escapeHtml(c.review) + '</td>' +
      '<td>' + escapeHtml(c.keyHC) + '</td></tr>';
  }).join("");

  return '<div class="recruit-page">' +
    '<div class="recruit-subnav">' +
    '<button class="recruit-subnav__btn recruit-subnav__btn--active" onclick="window.location.hash=\'#!/recruit/candidate\'">候选人列表</button>' +
    '<button class="recruit-subnav__btn" onclick="window.location.hash=\'#!/recruit/position\'">职位管理</button>' +
    '<button class="recruit-subnav__btn" onclick="window.location.hash=\'#!/recruit/interview\'">面试安排</button>' +
    '<button class="recruit-subnav__btn" onclick="window.location.hash=\'#!/recruit/offer\'">Offer管理</button>' +
    '</div>' +
    '<div class="recruit-filter">' +
    '<div class="recruit-filter__search"><input class="recruit-filter__search-input" placeholder="搜索候选人姓名..." readonly></div>' +
    '<div class="recruit-filter__group">' +
    '<span class="recruit-filter__label">阶段</span>' +
    '<div class="recruit-filter__select">全部阶段 ▾</div></div>' +
    '<div class="recruit-filter__group">' +
    '<span class="recruit-filter__label">HC</span>' +
    '<div class="recruit-filter__select">全部HC ▾</div></div>' +
    '<div class="recruit-filter__btn recruit-filter__btn--primary">查询</div>' +
    '<div class="recruit-filter__btn recruit-filter__btn--default" onclick="window.location.hash=\'#!/recruit\'">返回漏斗</div>' +
    '</div>' +
    '<div class="recruit-table-wrap">' +
    '<table class="recruit-table"><thead><tr>' +
    '<th>候选人</th><th>阶段</th><th>进展摘要</th><th>题库版本</th><th>面试官评价</th><th>关键 HC</th>' +
    '</tr></thead><tbody>' + rowsHtml + '</tbody></table></div></div>';
}

/**
 * 招聘管理 - 职位管理子页面
 */
function mountRecruitPositionPage() {
  var positions = [
    { name: "前端工程师", dept: "技术部", hc: 2, received: 45, interviewed: 12, status: "招聘中" },
    { name: "产品经理", dept: "产品部", hc: 1, received: 28, interviewed: 8, status: "招聘中" },
    { name: "UI设计师", dept: "设计部", hc: 1, received: 32, interviewed: 6, status: "已暂停" },
    { name: "数据分析师", dept: "数据部", hc: 2, received: 18, interviewed: 5, status: "招聘中" }
  ];

  var rowsHtml = positions.map(function(p) {
    return '<tr>' +
      '<td>' + escapeHtml(p.name) + '</td>' +
      '<td>' + escapeHtml(p.dept) + '</td>' +
      '<td>' + escapeHtml(p.hc) + '</td>' +
      '<td>' + escapeHtml(p.received) + '</td>' +
      '<td>' + escapeHtml(p.interviewed) + '</td>' +
      '<td>' + escapeHtml(p.status) + '</td></tr>';
  }).join("");

  return '<div class="recruit-page">' +
    '<div class="recruit-subnav">' +
    '<button class="recruit-subnav__btn" onclick="window.location.hash=\'#!/recruit/candidate\'">候选人列表</button>' +
    '<button class="recruit-subnav__btn recruit-subnav__btn--active" onclick="window.location.hash=\'#!/recruit/position\'">职位管理</button>' +
    '<button class="recruit-subnav__btn" onclick="window.location.hash=\'#!/recruit/interview\'">面试安排</button>' +
    '<button class="recruit-subnav__btn" onclick="window.location.hash=\'#!/recruit/offer\'">Offer管理</button>' +
    '</div>' +
    '<div class="recruit-filter">' +
    '<div class="recruit-filter__search"><input class="recruit-filter__search-input" placeholder="搜索职位名称..." readonly></div>' +
    '<div class="recruit-filter__group">' +
    '<span class="recruit-filter__label">部门</span>' +
    '<div class="recruit-filter__select">全部部门 ▾</div></div>' +
    '<div class="recruit-filter__group">' +
    '<span class="recruit-filter__label">状态</span>' +
    '<div class="recruit-filter__select">全部状态 ▾</div></div>' +
    '<div class="recruit-filter__btn recruit-filter__btn--primary">新增职位</div>' +
    '<div class="recruit-filter__btn recruit-filter__btn--default" onclick="window.location.hash=\'#!/recruit\'">返回漏斗</div>' +
    '</div>' +
    '<div class="recruit-table-wrap">' +
    '<table class="recruit-table"><thead><tr>' +
    '<th>职位名称</th><th>所属部门</th><th>HC数量</th><th>收到简历</th><th>已面试</th><th>状态</th>' +
    '</tr></thead><tbody>' + rowsHtml + '</tbody></table></div></div>';
}

/**
 * 招聘管理 - 面试安排子页面
 */
function mountRecruitInterviewPage() {
  var interviews = [
    { candidate: "李四", position: "前端工程师", interviewer: "王经理", date: "2024-01-15", time: "14:00", round: "二面", status: "待面试" },
    { candidate: "张伟", position: "产品经理", interviewer: "李经理", date: "2024-01-16", time: "10:00", round: "一面", status: "待面试" },
    { candidate: "王刚", position: "UI设计师", interviewer: "陈经理", date: "2024-01-14", time: "15:30", round: "三面", status: "已完成" }
  ];

  var rowsHtml = interviews.map(function(i) {
    return '<tr>' +
      '<td>' + escapeHtml(i.candidate) + '</td>' +
      '<td>' + escapeHtml(i.position) + '</td>' +
      '<td>' + escapeHtml(i.interviewer) + '</td>' +
      '<td>' + escapeHtml(i.date) + '</td>' +
      '<td>' + escapeHtml(i.time) + '</td>' +
      '<td>' + escapeHtml(i.round) + '</td>' +
      '<td>' + escapeHtml(i.status) + '</td></tr>';
  }).join("");

  return '<div class="recruit-page">' +
    '<div class="recruit-subnav">' +
    '<button class="recruit-subnav__btn" onclick="window.location.hash=\'#!/recruit/candidate\'">候选人列表</button>' +
    '<button class="recruit-subnav__btn" onclick="window.location.hash=\'#!/recruit/position\'">职位管理</button>' +
    '<button class="recruit-subnav__btn recruit-subnav__btn--active" onclick="window.location.hash=\'#!/recruit/interview\'">面试安排</button>' +
    '<button class="recruit-subnav__btn" onclick="window.location.hash=\'#!/recruit/offer\'">Offer管理</button>' +
    '</div>' +
    '<div class="recruit-filter">' +
    '<div class="recruit-filter__search"><input class="recruit-filter__search-input" placeholder="搜索候选人..." readonly></div>' +
    '<div class="recruit-filter__group">' +
    '<span class="recruit-filter__label">日期</span>' +
    '<div class="recruit-filter__select">选择日期 ▾</div></div>' +
    '<div class="recruit-filter__group">' +
    '<span class="recruit-filter__label">状态</span>' +
    '<div class="recruit-filter__select">全部状态 ▾</div></div>' +
    '<div class="recruit-filter__btn recruit-filter__btn--primary">新增安排</div>' +
    '<div class="recruit-filter__btn recruit-filter__btn--default" onclick="window.location.hash=\'#!/recruit\'">返回漏斗</div>' +
    '</div>' +
    '<div class="recruit-table-wrap">' +
    '<table class="recruit-table"><thead><tr>' +
    '<th>候选人</th><th>应聘职位</th><th>面试官</th><th>日期</th><th>时间</th><th>轮次</th><th>状态</th>' +
    '</tr></thead><tbody>' + rowsHtml + '</tbody></table></div></div>';
}

/**
 * 招聘管理 - Offer管理子页面
 */
function mountRecruitOfferPage() {
  var offers = [
    { candidate: "Mike", position: "前端工程师", salary: "25K", status: "待审批", approveDate: "2024-01-18", deadline: "2024-01-25" },
    { candidate: "Amy", position: "产品经理", salary: "30K", status: "已发送", approveDate: "2024-01-10", deadline: "2024-01-20" },
    { candidate: "赵敏", position: "数据分析师", salary: "22K", status: "已接受", approveDate: "2024-01-05", deadline: "2024-01-15" }
  ];

  var rowsHtml = offers.map(function(o) {
    return '<tr>' +
      '<td>' + escapeHtml(o.candidate) + '</td>' +
      '<td>' + escapeHtml(o.position) + '</td>' +
      '<td>' + escapeHtml(o.salary) + '</td>' +
      '<td>' + escapeHtml(o.status) + '</td>' +
      '<td>' + escapeHtml(o.approveDate) + '</td>' +
      '<td>' + escapeHtml(o.deadline) + '</td></tr>';
  }).join("");

  return '<div class="recruit-page">' +
    '<div class="recruit-subnav">' +
    '<button class="recruit-subnav__btn" onclick="window.location.hash=\'#!/recruit/candidate\'">候选人列表</button>' +
    '<button class="recruit-subnav__btn" onclick="window.location.hash=\'#!/recruit/position\'">职位管理</button>' +
    '<button class="recruit-subnav__btn" onclick="window.location.hash=\'#!/recruit/interview\'">面试安排</button>' +
    '<button class="recruit-subnav__btn recruit-subnav__btn--active" onclick="window.location.hash=\'#!/recruit/offer\'">Offer管理</button>' +
    '</div>' +
    '<div class="recruit-filter">' +
    '<div class="recruit-filter__search"><input class="recruit-filter__search-input" placeholder="搜索候选人..." readonly></div>' +
    '<div class="recruit-filter__group">' +
    '<span class="recruit-filter__label">状态</span>' +
    '<div class="recruit-filter__select">全部状态 ▾</div></div>' +
    '<div class="recruit-filter__btn recruit-filter__btn--primary">新增Offer</div>' +
    '<div class="recruit-filter__btn recruit-filter__btn--default" onclick="window.location.hash=\'#!/recruit\'">返回漏斗</div>' +
    '</div>' +
    '<div class="recruit-table-wrap">' +
    '<table class="recruit-table"><thead><tr>' +
    '<th>候选人</th><th>应聘职位</th><th>薪资</th><th>状态</th><th>审批日期</th><th>截止日期</th>' +
    '</tr></thead><tbody>' + rowsHtml + '</tbody></table></div></div>';
}

/**
 * 绩效看板页面 — 对应 Figma 786:14656
 * 包含 Hero、KPI 卡片、待校准清单、分布概览图表
 */
function mountPerformancePage() {
  // KPI 数据
  var kpis = [
    { label: "校准进度", value: "71%", note: "未锁条目 31" },
    { label: "均分变动", value: "-0.6", note: "上轮 78.9" },
    { label: "争议率", value: "14.2%", note: "待指派 6" },
    { label: "裁剪检查", value: "PASS", note: "目标 22±3" }
  ];

  // 待校准清单数据
  var calibrationRows = [
    { name: "Alice", dept: "研发·高工", scores: "82 / 76", diff: "+6", diffClass: "", barWidth: 29, barClass: "gray", priority: "P2", priorityClass: "", suggestion: "统一到 82", deadline: "05-08" },
    { name: "Ben", dept: "招聘·顾问", scores: "74 / 61", diff: "+13", diffClass: "diff-positive", barWidth: 62, barClass: "orange", priority: "P0", priorityClass: "priority-p0", suggestion: "二次面谈", deadline: "", highlight: true },
    { name: "Mike", dept: "销售·经理", scores: "90 / 88", diff: "+2", diffClass: "diff-negative", barWidth: 10, barClass: "green", priority: "P3", priorityClass: "", suggestion: "无异议", deadline: "—" },
    { name: "周七", dept: "法务·专员", scores: "68 / 72", diff: "-4", diffClass: "", barWidth: 19, barClass: "gray", priority: "P1", priorityClass: "", suggestion: "补证据链", deadline: "05-09" },
    { name: "Jane", dept: "HR·HRBP", scores: "85 / 79", diff: "+6", diffClass: "", barWidth: 29, barClass: "gray", priority: "P2", priorityClass: "", suggestion: "拆分评语", deadline: "05-08" },
    { name: "陈晨", dept: "供应链·主管", scores: "79 / 70", diff: "+9", diffClass: "diff-positive", barWidth: 43, barClass: "orange", priority: "P0", priorityClass: "priority-p0", suggestion: "校准复议", deadline: "", highlight: true },
    { name: "刘扬", dept: "财务·分析", scores: "88 / 86", diff: "+2", diffClass: "diff-negative", barWidth: 10, barClass: "green", priority: "P3", priorityClass: "", suggestion: "待二次确认", deadline: "—" }
  ];

  // 柱状图数据
  var barChartData = [
    { value: 89, label: "技术", color: "#2563eb" },
    { value: 81, label: "招聘", color: "#16a34a" },
    { value: 78, label: "共享服务", color: "#d97706" },
    { value: 76, label: "法务", color: "#dc2626" },
    { value: 75, label: "市场营销", color: "#2563eb" },
    { value: 73, label: "财务管理", color: "#16a34a" },
    { value: 72, label: "客户服务", color: "#d97706" },
    { value: 70, label: "运营管理", color: "#dc2626" },
    { value: 68, label: "产品开发", color: "#2563eb" }
  ];

  // 渲染 KPI 卡片
  var kpisHtml = kpis.map(function(k) {
    return '<div class="perf-kpi">' +
      '<div class="perf-kpi__label">' + escapeHtml(k.label) + '</div>' +
      '<div class="perf-kpi__value">' + escapeHtml(k.value) + '</div>' +
      '<div class="perf-kpi__note">' + escapeHtml(k.note) + '</div></div>';
  }).join("");

  // 渲染表格行
  var rowsHtml = calibrationRows.map(function(r) {
    var rowClass = r.highlight ? ' class="highlight"' : '';
    var diffClass = r.diffClass ? ' ' + r.diffClass : '';
    var priorityHtml = r.priorityClass
      ? '<span class="' + r.priorityClass + '">' + escapeHtml(r.priority) + '</span>'
      : escapeHtml(r.priority);
    return '<tr' + rowClass + '>' +
      '<td class="name">' + escapeHtml(r.name) + '</td>' +
      '<td>' + escapeHtml(r.dept) + '</td>' +
      '<td>' + escapeHtml(r.scores) + '</td>' +
      '<td class="' + r.diffClass + '">' + escapeHtml(r.diff) + '</td>' +
      '<td><div class="perf-bar"><div class="perf-bar__fill perf-bar__fill--' + r.barClass + '" style="width:' + r.barWidth + 'px"></div></div></td>' +
      '<td>' + priorityHtml + '</td>' +
      '<td>' + escapeHtml(r.suggestion) + '</td>' +
      '<td>' + escapeHtml(r.deadline) + '</td></tr>';
  }).join("");

  // 渲染柱状图
  var barChartHtml = barChartData.map(function(b) {
    var height = Math.round(b.value * 0.87);
    return '<div class="perf-bar-col">' +
      '<span class="perf-bar-col__value">' + b.value + '</span>' +
      '<div class="perf-bar-col__bar" style="height:' + height + 'px;background:' + b.color + '"></div>' +
      '<span class="perf-bar-col__label">' + escapeHtml(b.label) + '</span></div>';
  }).join("");

  return '<div class="perf-page">' +
    '<header class="perf-hero">' +
    '<h1 class="perf-hero__title">绩效看板｜校准与分布</h1>' +
    '<p class="perf-hero__subtitle">围绕吞吐、质量、协同三类指标，集中处理争议和版本锁定。</p>' +
    '<div class="perf-hero__actions">' +
    '<button class="perf-hero__btn perf-hero__btn--primary">锁定本轮校准</button>' +
    '<button class="perf-hero__btn perf-hero__btn--default">导出分布</button>' +
    '<button class="perf-hero__btn perf-hero__btn--default">争议清单</button>' +
    '<button class="perf-hero__btn perf-hero__btn--default">只看敏感</button>' +
    '</div></header>' +
    '<section class="perf-kpis">' + kpisHtml + '</section>' +
    '<div class="perf-main">' +
    '<section class="perf-list">' +
    '<div class="perf-list__hd">' +
    '<span class="perf-list__title">待校准清单</span>' +
    '<span class="perf-list__badge perf-list__badge--blue">待处理 7</span>' +
    '<span class="perf-list__badge perf-list__badge--orange">高差值 ≥8 · 2</span>' +
    '<span class="perf-list__badge perf-list__badge--gray">今日截止 · 1</span>' +
    '</div>' +
    '<p class="perf-list__hint">高差值条目优先处理，避免校准会现场堆积。规则：自评 vs 主管评分取整到半分；争议需留痕理由与附件。</p>' +
    '<div class="perf-list__summary">' +
    '<span class="perf-list__summary-text">本周已校准 12 人 · 剩余 SLA 3.2 天</span>' +
    '<a class="perf-list__summary-link" href="#">排序：差值↓</a>' +
    '<span class="perf-list__summary-muted">筛选：全部优先级</span>' +
    '</div>' +
    '<div class="org-table-wrap" style="flex:1;overflow:auto">' +
    '<table class="perf-table"><thead><tr>' +
    '<th>姓名</th><th>部门·岗位</th><th>自评/主管</th><th>差值</th><th>偏离条</th><th>优先级</th><th>处理建议</th><th>截止</th>' +
    '</tr></thead><tbody>' + rowsHtml + '</tbody></table></div>' +
    '<p class="perf-list__footer">说明：锁定清单后仅保留快照；导出含操作日志。P0 需 HRD 会签，P1/P2 由部门负责人闭环，P3 可批量通过。</p>' +
    '</section>' +
    '<section class="perf-charts">' +
    '<h2 class="perf-charts__title">分布概览</h2>' +
    '<p class="perf-charts__subtitle">不同组织的绩效得分和争议热度。</p>' +
    '<div class="perf-chart-box">' +
    '<h3 class="perf-chart-box__title">绩效得分</h3>' +
    '<p class="perf-chart-box__hint">柱状图 · 组织对比（0–100）</p>' +
    '<div class="perf-bar-chart">' + barChartHtml + '</div></div>' +
    '<div class="perf-chart-box">' +
    '<h3 class="perf-chart-box__title">得分占比</h3>' +
    '<p class="perf-chart-box__hint">环形图 · 结构分布</p>' +
    '<div class="perf-pie-chart">' +
    '<div class="perf-pie"><svg viewBox="0 0 42 42" width="118" height="118">' +
    '<circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e8eef6" stroke-width="3"></circle>' +
    '<circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#2563eb" stroke-width="3" stroke-dasharray="27 73" stroke-dashoffset="25"></circle>' +
    '<circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#16a34a" stroke-width="3" stroke-dasharray="25 75" stroke-dashoffset="52"></circle>' +
    '<circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#d97706" stroke-width="3" stroke-dasharray="24 76" stroke-dashoffset="77"></circle>' +
    '<circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#dc2626" stroke-width="3" stroke-dasharray="23 77" stroke-dashoffset="1"></circle>' +
    '</svg></div>' +
    '<div class="perf-legend">' +
    '<div class="perf-legend__item"><div class="perf-legend__dot" style="background:#2563eb"></div><span class="perf-legend__text">技术中心 27% · 领先</span></div>' +
    '<div class="perf-legend__item"><div class="perf-legend__dot" style="background:#16a34a"></div><span class="perf-legend__text">招聘中心 25% · 争议较多</span></div>' +
    '<div class="perf-legend__item"><div class="perf-legend__dot" style="background:#d97706"></div><span class="perf-legend__text">共享服务 24% · 需校准</span></div>' +
    '<div class="perf-legend__item"><div class="perf-legend__dot" style="background:#dc2626"></div><span class="perf-legend__text">法务合规 23% · SLA 压力</span></div>' +
    '</div></div></div></section></div></div>';
}

/**
 * 绩效看板 - 工单总量页面 — 对应 Figma 1197:4961
 */
function mountWorkOrdersPage() {
  // KPI 数据
  var kpis = [
    { label: "本月工单总量", value: "1,248", trend: "+12%", trendClass: "" },
    { label: "平均处理时长", value: "2.3h", trend: "-18min", trendClass: "perf-wo-kpi__trend--down" },
    { label: "满意度评分", value: "4.6", unit: "/5.0", trendClass: "" },
    { label: "SLA达标率", value: "94.2%", trend: "达标", trendClass: "" }
  ];

  // 工单类型分布数据
  var typeDist = [
    { label: "人事咨询", count: 456, percent: "36%", fillClass: "perf-wo-type-row__fill--blue", valueClass: "" },
    { label: "薪酬查询", count: 312, percent: "25%", fillClass: "perf-wo-type-row__fill--green", valueClass: "perf-wo-type-row__value--green" },
    { label: "系统问题", count: 234, percent: "19%", fillClass: "perf-wo-type-row__fill--orange", valueClass: "perf-wo-type-row__value--orange" },
    { label: "流程审批", count: 156, percent: "13%", fillClass: "perf-wo-type-row__fill--purple", valueClass: "perf-wo-type-row__value--purple" },
    { label: "其他", count: 90, percent: "7%", fillClass: "perf-wo-type-row__fill--gray", valueClass: "perf-wo-type-row__value--gray" }
  ];

  // 处理漏斗数据
  var funnel = [
    { label: "提交", value: 1248, barClass: "perf-wo-funnel-row__bar--submit" },
    { label: "分配", value: 1190, barClass: "perf-wo-funnel-row__bar--assign" },
    { label: "处理中", value: 856, barClass: "perf-wo-funnel-row__bar--process" },
    { label: "已完成", value: 1182, barClass: "perf-wo-funnel-row__bar--done" }
  ];

  // 趋势数据
  var trendData = [
    { value: 98, label: "W1", isCurrent: false },
    { value: 112, label: "W2", isCurrent: false },
    { value: 105, label: "W3", isCurrent: false },
    { value: 124, label: "W4", isCurrent: false },
    { value: 108, label: "W5", isCurrent: false },
    { value: 118, label: "W6", isCurrent: false },
    { value: 102, label: "W7", isCurrent: false },
    { value: 128, label: "W8", isCurrent: false },
    { value: 115, label: "W9", isCurrent: false },
    { value: 122, label: "W10", isCurrent: false },
    { value: 130, label: "W11", isCurrent: true },
    { value: 124, label: "W12", isCurrent: true }
  ];

  // 渲染 KPI 卡片
  var kpisHtml = kpis.map(function(k) {
    var valueClass = k.label === "本月工单总量" ? "" :
                     k.label === "满意度评分" ? "perf-wo-kpi__value--success" : "";
    var unitHtml = k.unit ? '<span class="perf-wo-kpi__unit">' + escapeHtml(k.unit) + '</span>' : '';
    var trendHtml = k.trend ? '<span class="perf-wo-kpi__trend ' + (k.trendClass || '') + '">' + escapeHtml(k.trend) + '</span>' : '';
    return '<div class="perf-wo-kpi">' +
      '<div class="perf-wo-kpi__label">' + escapeHtml(k.label) + '</div>' +
      '<div class="perf-wo-kpi__row">' +
      '<span class="perf-wo-kpi__value ' + valueClass + '">' + escapeHtml(k.value) + '</span>' +
      unitHtml + trendHtml + '</div></div>';
  }).join("");

  // 渲染类型分布
  var typeDistHtml = typeDist.map(function(t) {
    var width = Math.round(t.count / 456 * 160);
    return '<div class="perf-wo-type-row">' +
      '<span class="perf-wo-type-row__label">' + escapeHtml(t.label) + '</span>' +
      '<div class="perf-wo-type-row__bar"><div class="perf-wo-type-row__fill ' + t.fillClass + '" style="width:' + width + 'px"></div></div>' +
      '<span class="perf-wo-type-row__value ' + t.valueClass + '">' + escapeHtml(t.count) + ' (' + t.percent + ')</span></div>';
  }).join("");

  // 渲染处理漏斗
  var funnelHtml = funnel.map(function(f) {
    return '<div class="perf-wo-funnel-row">' +
      '<span class="perf-wo-funnel-row__label">' + escapeHtml(f.label) + '</span>' +
      '<div class="perf-wo-funnel-row__bar ' + f.barClass + '">' + escapeHtml(f.value) + '</div></div>';
  }).join("");

  // 渲染趋势图
  var trendHtml = trendData.map(function(b) {
    var height = Math.round(b.value / 130 * 234);
    var currentClass = b.isCurrent ? "perf-wo-bar-col__bar--current" : "";
    return '<div class="perf-wo-bar-col">' +
      '<span class="perf-wo-bar-col__value">' + b.value + '</span>' +
      '<div class="perf-wo-bar-col__bar ' + currentClass + '" style="height:' + height + 'px"></div>' +
      '<span class="perf-wo-bar-col__label">' + escapeHtml(b.label) + '</span></div>';
  }).join("");

  return '<div class="perf-wo-page">' +
    '<div class="perf-wo-hero">' +
    '<h1 class="perf-wo-hero__title">工单总量</h1>' +
    '<p class="perf-wo-hero__subtitle">统计各类型工单数量与处理效率，追踪服务质量指标。</p></div>' +
    '<div class="perf-wo-kpis">' + kpisHtml + '</div>' +
    '<div class="perf-wo-main">' +
    '<div class="perf-wo-dist">' +
    '<h2 class="perf-wo-dist__title">工单类型分布</h2>' +
    typeDistHtml +
    '<h3 class="perf-wo-funnel-title">处理漏斗</h3>' +
    funnelHtml + '</div>' +
    '<div class="perf-wo-trend">' +
    '<h2 class="perf-wo-trend__title">近12周工单趋势</h2>' +
    '<div class="perf-wo-trend__chart">' +
    '<div class="perf-wo-bars">' + trendHtml + '</div>' +
    '<div class="perf-wo-stats">' +
    '<div class="perf-wo-stat"><span class="perf-wo-stat__label">平均周工单</span><span class="perf-wo-stat__value">113.8</span></div>' +
    '<div class="perf-wo-stat"><span class="perf-wo-stat__label">峰值</span><span class="perf-wo-stat__value">130</span></div>' +
    '<div class="perf-wo-stat"><span class="perf-wo-stat__label">最低</span><span class="perf-wo-stat__value">98</span></div>' +
    '</div></div></div></div></div>';
}

/**
 * 绩效看板 - 任务完成率页面 — 对应 Figma 1197:4940
 */
function mountTaskCompletionPage() {
  // KPI 数据
  var kpis = [
    { label: "本月完成率", value: "87.5%", trend: "+5.2%", valueClass: "perf-task-kpi__value--success" },
    { label: "按时完成", value: "156", unit: "件", valueClass: "" },
    { label: "延期任务", value: "23", unit: "件", valueClass: "perf-task-kpi__value--warning" },
    { label: "待处理", value: "18", unit: "件", valueClass: "perf-task-kpi__value--danger" }
  ];

  // 延期原因分析
  var delayReasons = [
    { label: "需求变更", count: "8件" },
    { label: "资源不足", count: "6件" },
    { label: "技术难点", count: "5件" },
    { label: "依赖阻塞", count: "4件" }
  ];

  // 月度趋势数据
  var trendData = [
    { value: "82%", label: "1月" },
    { value: "85%", label: "2月" },
    { value: "79%", label: "3月" },
    { value: "88%", label: "4月" },
    { value: "84%", label: "5月" },
    { value: "87%", label: "6月" }
  ];

  // 渲染 KPI 卡片
  var kpisHtml = kpis.map(function(k) {
    var unitHtml = k.unit ? '<span class="perf-task-kpi__unit">' + escapeHtml(k.unit) + '</span>' : '';
    var trendHtml = k.trend ? '<span class="perf-task-kpi__trend">' + escapeHtml(k.trend) + '</span>' : '';
    return '<div class="perf-task-kpi">' +
      '<div class="perf-task-kpi__label">' + escapeHtml(k.label) + '</div>' +
      '<div class="perf-task-kpi__row">' +
      '<span class="perf-task-kpi__value ' + (k.valueClass || '') + '">' + escapeHtml(k.value) + '</span>' +
      unitHtml + trendHtml + '</div></div>';
  }).join("");

  // 渲染延期原因
  var reasonsHtml = delayReasons.map(function(r) {
    return '<div class="perf-task-reason-row">' +
      '<span class="perf-task-reason-row__label">' + escapeHtml(r.label) + '</span>' +
      '<span class="perf-task-reason-row__value">' + escapeHtml(r.count) + '</span></div>';
  }).join("");

  // 渲染趋势图
  var trendHtml = trendData.map(function(b) {
    return '<div class="perf-task-trend__point">' +
      '<span class="perf-task-trend__point-value">' + escapeHtml(b.value) + '</span>' +
      '<div class="perf-task-trend__point-dot"></div>' +
      '<span class="perf-task-trend__point-label">' + escapeHtml(b.label) + '</span></div>';
  }).join("");

  return '<div class="perf-task-page">' +
    '<div class="perf-task-hero">' +
    '<h1 class="perf-task-hero__title">任务完成率</h1>' +
    '<p class="perf-task-hero__subtitle">追踪团队任务执行情况，分析完成率与延期原因。</p></div>' +
    '<div class="perf-task-kpis">' + kpisHtml + '</div>' +
    '<div class="perf-task-main">' +
    '<div class="perf-task-dist">' +
    '<h2 class="perf-task-dist__title">任务状态分布</h2>' +
    '<div class="perf-task-dist__chart">' +
    '<div class="perf-task-dist__donut"></div>' +
    '<div class="perf-task-dist__legend">' +
    '<div class="perf-task-dist__legend-item"><div class="perf-task-dist__legend-dot perf-task-dist__legend-dot--done"></div><span class="perf-task-dist__legend-text">已完成 67%</span></div>' +
    '<div class="perf-task-dist__legend-item"><div class="perf-task-dist__legend-dot perf-task-dist__legend-dot--progress"></div><span class="perf-task-dist__legend-text">进行中 20%</span></div>' +
    '<div class="perf-task-dist__legend-item"><div class="perf-task-dist__legend-dot perf-task-dist__legend-dot--delay"></div><span class="perf-task-dist__legend-text">延期 8%</span></div>' +
    '<div class="perf-task-dist__legend-item"><div class="perf-task-dist__legend-dot perf-task-dist__legend-dot--pending"></div><span class="perf-task-dist__legend-text">待处理 5%</span></div>' +
    '</div></div>' +
    '<h3 class="perf-task-reason-title">延期原因分析</h3>' +
    reasonsHtml + '</div>' +
    '<div class="perf-task-trend">' +
    '<h2 class="perf-task-trend__title">月度完成率趋势</h2>' +
    '<div class="perf-task-trend__chart">' +
    '<div class="perf-task-trend__line">' + trendHtml + '</div>' +
    '<p class="perf-task-trend__summary">目标线: 85% | 实际平均: 84.2%</p></div></div></div></div>';
}

/**
 * 绩效看板 - 绩效设置页面 — 对应 Figma 1204:4919
 */
function mountPerformanceSettingsPage() {
  // 考核周期数据
  var periods = [
    { name: "2026-Q2", badge: "进行中", badgeClass: "perf-set-period__badge--active", progress: 45, progressClass: "perf-set-period__progress-bar--active" },
    { name: "2026-Q1", badge: "已结束", badgeClass: "perf-set-period__badge--done", progress: 100, progressClass: "perf-set-period__progress-bar--done" },
    { name: "2025-Q4", badge: "已结束", badgeClass: "perf-set-period__badge--done", progress: 100, progressClass: "perf-set-period__progress-bar--done" },
    { name: "2025-Q3", badge: "已归档", badgeClass: "perf-set-period__badge--archived", progress: 100, progressClass: "perf-set-period__progress-bar--archived" }
  ];

  // 评分等级
  var grades = [
    { label: "A", range: "90-100", desc: "优秀", badgeClass: "perf-set-grade__badge--a" },
    { label: "B+", range: "80-89", desc: "良好", badgeClass: "perf-set-grade__badge--bplus" },
    { label: "B", range: "70-79", desc: "合格", badgeClass: "perf-set-grade__badge--b" },
    { label: "C", range: "60-69", desc: "待改进", badgeClass: "perf-set-grade__badge--c" },
    { label: "D", range: "<60", desc: "不合格", badgeClass: "perf-set-grade__badge--d" }
  ];

  // 维度权重
  var weights = [
    { name: "业绩产出", percent: "40%" },
    { name: "协同沟通", percent: "20%" },
    { name: "学习成长", percent: "15%" },
    { name: "合规风控", percent: "15%" },
    { name: "价值观", percent: "10%" }
  ];

  // 审批流程步骤
  var flowSteps = [
    { num: "1", title: "自评提交", role: "员工本人", numClass: "perf-set-flow-step__num--1" },
    { num: "2", title: "主管评分", role: "直属上级", numClass: "perf-set-flow-step__num--2" },
    { num: "3", title: "部门审核", role: "部门负责人", numClass: "perf-set-flow-step__num--3" },
    { num: "4", title: "HR复核", role: "HR部门", numClass: "perf-set-flow-step__num--4" },
    { num: "5", title: "结果确认", role: "员工本人", numClass: "perf-set-flow-step__num--5" }
  ];

  // 其他设置
  var otherSettings = [
    { name: "自动提醒", value: "已开启" },
    { name: "评分匿名", value: "已关闭" },
    { name: "结果公示", value: "已开启" },
    { name: "申诉期限", value: "7天" }
  ];

  // 渲染考核周期
  var periodsHtml = periods.map(function(p) {
    return '<div class="perf-set-period">' +
      '<div class="perf-set-period__row">' +
      '<span class="perf-set-period__name">' + escapeHtml(p.name) + '</span>' +
      '<span class="perf-set-period__badge ' + p.badgeClass + '">' + escapeHtml(p.badge) + '</span></div>' +
      '<div class="perf-set-period__progress"><div class="perf-set-period__progress-bar ' + p.progressClass + '" style="width:' + p.progress + '%"></div></div></div>';
  }).join("");

  // 渲染评分等级
  var gradesHtml = grades.map(function(g) {
    return '<div class="perf-set-grade">' +
      '<div class="perf-set-grade__badge ' + g.badgeClass + '">' + escapeHtml(g.label) + '</div>' +
      '<span class="perf-set-grade__range">' + escapeHtml(g.range) + '</span>' +
      '<span class="perf-set-grade__label">' + escapeHtml(g.desc) + '</span></div>';
  }).join("");

  // 渲染维度权重
  var weightsHtml = weights.map(function(w) {
    var width = parseInt(w.percent) * 1.6;
    return '<div class="perf-set-weight">' +
      '<span class="perf-set-weight__name">' + escapeHtml(w.name) + '</span>' +
      '<div class="perf-set-weight__bar"><div style="width:' + width + 'px;height:100%;background:#1f73eb;border-radius:4px"></div></div>' +
      '<span class="perf-set-weight__value">' + escapeHtml(w.percent) + '</span></div>';
  }).join("");

  // 渲染审批流程
  var flowHtml = flowSteps.map(function(s, idx) {
    var arrow = idx < flowSteps.length - 1 ? '<div class="perf-set-flow-arrow">↓</div>' : '';
    return '<div class="perf-set-flow-step">' +
      '<div class="perf-set-flow-step__num ' + s.numClass + '">' + s.num + '</div>' +
      '<div class="perf-set-flow-step__content">' +
      '<span class="perf-set-flow-step__title">' + escapeHtml(s.title) + '</span>' +
      '<span class="perf-set-flow-step__role">' + escapeHtml(s.role) + '</span></div></div>' + arrow;
  }).join("");

  // 渲染其他设置
  var otherHtml = otherSettings.map(function(o) {
    return '<div class="perf-set-other">' +
      '<span class="perf-set-other__name">' + escapeHtml(o.name) + '</span>' +
      '<span class="perf-set-other__value">' + escapeHtml(o.value) + '</span></div>';
  }).join("");

  return '<div class="perf-set-page">' +
    '<div class="perf-set-hero">' +
    '<h1 class="perf-set-hero__title">绩效设置</h1>' +
    '<p class="perf-set-hero__subtitle">配置考核周期、评分规则、权重分配与审批流程。</p></div>' +
    '<div class="perf-set-main">' +
    '<div class="perf-set-card">' +
    '<h2 class="perf-set-card__title">考核周期设置</h2>' +
    periodsHtml +
    '<button class="perf-set-new-btn"><span class="perf-set-new-btn__icon">+</span>新建考核周期</button></div>' +
    '<div class="perf-set-card">' +
    '<h2 class="perf-set-card__title">评分规则配置</h2>' +
    '<h3 class="perf-set-card__subtitle">等级划分</h3>' +
    gradesHtml +
    '<h3 class="perf-set-card__subtitle">维度权重模板</h3>' +
    weightsHtml + '</div>' +
    '<div class="perf-set-card">' +
    '<h2 class="perf-set-card__title">审批流程设置</h2>' +
    flowHtml +
    '<h3 class="perf-set-card__subtitle">其他设置</h3>' +
    otherHtml + '</div></div></div>';
}

/**
 * 绩效看板 - 绩效得分页面 — 对应 Figma 1197:4919
 */
function mountPerformanceScorePage() {
  // KPI 数据
  var kpis = [
    { label: "当前周期得分", value: "92.4", trend: "+3.1", trendClass: "perf-score-kpi__trend--up" },
    { label: "团队排名", value: "12/86", trend: "↑3", trendClass: "perf-score-kpi__trend--up", valueClass: "perf-score-kpi__value--success" },
    { label: "目标完成率", value: "96%", trend: "达标", trendClass: "", valueClass: "perf-score-kpi__value--success" },
    { label: "待改进项", value: "2", unit: "项", trendClass: "", valueClass: "perf-score-kpi__value--warning" }
  ];

  // 维度得分明细
  var dimensions = [
    { name: "业绩产出", weight: "40%", score: "38.6", grade: "A", gradeClass: "perf-score-detail__grade--a" },
    { name: "协同沟通", weight: "20%", score: "18.2", grade: "A", gradeClass: "perf-score-detail__grade--a" },
    { name: "学习成长", weight: "15%", score: "13.5", grade: "B+", gradeClass: "perf-score-detail__grade--bplus" },
    { name: "合规风控", weight: "15%", score: "14.8", grade: "A", gradeClass: "perf-score-detail__grade--a" },
    { name: "价值观", weight: "10%", score: "7.3", grade: "B", gradeClass: "perf-score-detail__grade--b" }
  ];

  // 多周期趋势数据
  var trendData = [
    { value: 86, label: "24-Q1", isCurrent: false },
    { value: 88, label: "24-Q2", isCurrent: false },
    { value: 91, label: "24-Q3", isCurrent: false },
    { value: 89, label: "24-Q4", isCurrent: false },
    { value: 92, label: "25-Q1", isCurrent: true },
    { value: 94, label: "25-Q2", isCurrent: true }
  ];

  // 渲染 KPI 卡片
  var kpisHtml = kpis.map(function(k) {
    var unitHtml = k.unit ? '<span class="perf-score-kpi__unit">' + escapeHtml(k.unit) + '</span>' : '';
    var trendHtml = k.trend ? '<span class="perf-score-kpi__trend ' + (k.trendClass || '') + '">' + escapeHtml(k.trend) + '</span>' : '';
    return '<div class="perf-score-kpi">' +
      '<div class="perf-score-kpi__label">' + escapeHtml(k.label) + '</div>' +
      '<div class="perf-score-kpi__row">' +
      '<span class="perf-score-kpi__value ' + (k.valueClass || '') + '">' + escapeHtml(k.value) + '</span>' +
      unitHtml + trendHtml + '</div></div>';
  }).join("");

  // 渲染维度得分明细
  var dimensionsHtml = dimensions.map(function(d) {
    return '<div class="perf-score-detail__row">' +
      '<span class="perf-score-detail__col perf-score-detail__col--dim">' + escapeHtml(d.name) + '</span>' +
      '<span class="perf-score-detail__col">' + escapeHtml(d.weight) + '</span>' +
      '<span class="perf-score-detail__col">' + escapeHtml(d.score) + '</span>' +
      '<span class="perf-score-detail__col perf-score-detail__grade ' + d.gradeClass + '">' + escapeHtml(d.grade) + '</span></div>';
  }).join("");

  // 渲染趋势图
  var trendHtml = trendData.map(function(b) {
    var height = Math.round(b.value * 2.5);
    var barClass = b.isCurrent ? "perf-score-trend__bar--current" : "perf-score-trend__bar--last";
    return '<div class="perf-score-trend__bar-col">' +
      '<span class="perf-score-trend__bar-value">' + b.value + '</span>' +
      '<div class="perf-score-trend__bar ' + barClass + '" style="height:' + height + 'px"></div>' +
      '<span class="perf-score-trend__bar-label">' + escapeHtml(b.label) + '</span></div>';
  }).join("");

  return '<div class="perf-score-page">' +
    '<div class="perf-score-hero">' +
    '<h1 class="perf-score-hero__title">绩效得分</h1>' +
    '<p class="perf-score-hero__subtitle">按考核周期查询个人/团队绩效得分，支持趋势对比与维度下钻。</p></div>' +
    '<div class="perf-score-kpis">' + kpisHtml + '</div>' +
    '<div class="perf-score-main">' +
    '<div class="perf-score-detail">' +
    '<h2 class="perf-score-detail__title">维度得分明细</h2>' +
    '<div class="perf-score-detail__header">' +
    '<span class="perf-score-detail__col perf-score-detail__col--dim">维度</span>' +
    '<span class="perf-score-detail__col">权重</span>' +
    '<span class="perf-score-detail__col">得分</span>' +
    '<span class="perf-score-detail__col">等级</span></div>' +
    dimensionsHtml + '</div>' +
    '<div class="perf-score-trend">' +
    '<h2 class="perf-score-trend__title">多周期得分趋势</h2>' +
    '<div class="perf-score-trend__chart">' +
    '<div class="perf-score-trend__bars">' + trendHtml + '</div>' +
    '<div class="perf-score-trend__legend">' +
    '<div class="perf-score-trend__legend-item"><div class="perf-score-trend__legend-dot perf-score-trend__legend-dot--last"></div><span class="perf-score-trend__legend-text">上年度</span></div>' +
    '<div class="perf-score-trend__legend-item"><div class="perf-score-trend__legend-dot perf-score-trend__legend-dot--current"></div><span class="perf-score-trend__legend-text">本年度</span></div>' +
    '</div></div></div></div></div>';
}

/**
 * 请假申请页面 — 对应 Figma 411:1697
 * 包含请假表单、审批流程、提示信息、历史记录
 */
function mountLeavePage() {
  return '<div class="apply-page">' +
    '<header class="apply-hero">' +
    '<h1 class="apply-hero__title">请假</h1>' +
    '<p class="apply-hero__path">菜单定位：我的申请 / 请假 · /my-apply/leave</p>' +
    '</header>' +
    '<div class="apply-main">' +
    '<div class="apply-form-card">' +
    '<h2 class="apply-form-card__title">请假申请单</h2>' +
    '<div class="apply-form-grid">' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">请假类型</label>' +
    '<select class="apply-field__control apply-field__select" name="leaveType">' +
    '<option value="">请选择</option>' +
    '<option value="annual">年假</option>' +
    '<option value="sick">病假</option>' +
    '<option value="personal">事假</option>' +
    '<option value="marriage">婚假</option>' +
    '<option value="maternity">产假</option>' +
    '<option value="paternity">陪产假</option>' +
    '<option value="bereavement">丧假</option>' +
    '</select>' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">可休余额</label>' +
    '<input type="text" class="apply-field__control" name="balance" value="剩余 6.5 天" readonly />' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">开始时间</label>' +
    '<input type="datetime-local" class="apply-field__control" name="startTime" />' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">结束时间</label>' +
    '<input type="datetime-local" class="apply-field__control" name="endTime" />' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">请假时长</label>' +
    '<input type="text" class="apply-field__control" name="duration" placeholder="自动计算" readonly />' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">工作交接人</label>' +
    '<select class="apply-field__control apply-field__select" name="handover">' +
    '<option value="">请选择交接同事</option>' +
    '<option value="1">张三</option>' +
    '<option value="2">李四</option>' +
    '<option value="3">王五</option>' +
    '</select>' +
    '</div>' +
    '<div class="apply-field apply-field--full">' +
    '<label class="apply-field__label">请假事由</label>' +
    '<textarea class="apply-field__control apply-field__textarea" name="reason" placeholder="请输入请假说明，并补充需要协同处理的工作交接事项。"></textarea>' +
    '</div>' +
    '<div class="apply-field apply-field--full">' +
    '<label class="apply-field__label">附件上传</label>' +
    '<div class="apply-attachment">' +
    '<span class="apply-attachment__text">病假证明 / 说明材料</span>' +
    '<button type="button" class="apply-attachment__btn">上传附件</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="apply-actions">' +
    '<button type="button" class="apply-btn apply-btn--default" onclick="history.back()">取消</button>' +
    '<button type="button" class="apply-btn apply-btn--default">暂存</button>' +
    '<button type="button" class="apply-btn apply-btn--primary">提交申请</button>' +
    '</div>' +
    '</div>' +
    '<aside class="apply-aside">' +
    '<h3 class="apply-aside__title">审批流程</h3>' +
    '<div class="apply-flow">' +
    '<div class="apply-flow-node">' +
    '<h4 class="apply-flow-node__title">发起人</h4>' +
    '<p class="apply-flow-node__info">王敏 · 已填写</p>' +
    '</div>' +
    '<div class="apply-flow-node apply-flow-node--current">' +
    '<h4 class="apply-flow-node__title">直属主管</h4>' +
    '<p class="apply-flow-node__info">李峰 · 待审批</p>' +
    '</div>' +
    '<div class="apply-flow-node">' +
    '<h4 class="apply-flow-node__title">HRBP</h4>' +
    '<p class="apply-flow-node__info">系统按规则抄送</p>' +
    '</div>' +
    '</div>' +
    '<h3 class="apply-aside__title">请假提示</h3>' +
    '<div class="apply-tips">' +
    '<p class="apply-tips__item">• 年假余额不足时，不允许直接提交</p>' +
    '<p class="apply-tips__item">• 连续请假超过 3 天需补充说明</p>' +
    '<p class="apply-tips__item">• 请提前确认交接事项已完成</p>' +
    '</div>' +
    '<h3 class="apply-aside__title">历史记录</h3>' +
    '<div class="apply-history">' +
    '<p class="apply-history__item">2026-04-10 年假 1 天 · 已通过</p>' +
    '<p class="apply-history__item">2026-03-22 调休 0.5 天 · 已通过</p>' +
    '</div>' +
    '</aside>' +
    '</div>' +
    '</div>';
}

/**
 * 出差申请页面 — 对应 Figma
 */
function mountTripPage() {
  return '<div class="apply-page">' +
    '<header class="apply-hero">' +
    '<h1 class="apply-hero__title">出差</h1>' +
    '<p class="apply-hero__path">菜单定位：我的申请 / 出差 · /my-apply/trip</p>' +
    '</header>' +
    '<div class="apply-main">' +
    '<div class="apply-form-card">' +
    '<h2 class="apply-form-card__title">出差申请单</h2>' +
    '<div class="apply-form-grid">' +
    '<div class="apply-field apply-field--double">' +
    '<label class="apply-field__label">出差事由</label>' +
    '<input type="text" class="apply-field__control" name="purpose" placeholder="请输入出差事由" />' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">出发地</label>' +
    '<input type="text" class="apply-field__control" name="from" placeholder="如：北京" />' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">目的地</label>' +
    '<input type="text" class="apply-field__control" name="to" placeholder="如：上海" />' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">开始日期</label>' +
    '<input type="date" class="apply-field__control" name="startDate" />' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">结束日期</label>' +
    '<input type="date" class="apply-field__control" name="endDate" />' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">同行人员</label>' +
    '<select class="apply-field__control apply-field__select" name="companions">' +
    '<option value="">请选择</option>' +
    '<option value="1">张三</option>' +
    '<option value="2">李四</option>' +
    '</select>' +
    '</div>' +
    '</div>' +
    '<div class="trip-itinerary">' +
    '<h3 class="trip-itinerary__title">费用预算</h3>' +
    '<div class="trip-itinerary__row">' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">交通费</label>' +
    '<input type="number" class="apply-field__control" name="transportFee" placeholder="0.00" />' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">住宿费</label>' +
    '<input type="number" class="apply-field__control" name="hotelFee" placeholder="0.00" />' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">其他费用</label>' +
    '<input type="number" class="apply-field__control" name="otherFee" placeholder="0.00" />' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="apply-actions">' +
    '<button type="button" class="apply-btn apply-btn--default" onclick="history.back()">取消</button>' +
    '<button type="button" class="apply-btn apply-btn--default">暂存</button>' +
    '<button type="button" class="apply-btn apply-btn--primary">提交申请</button>' +
    '</div>' +
    '</div>' +
    '<aside class="apply-aside">' +
    '<h3 class="apply-aside__title">审批流程</h3>' +
    '<div class="apply-flow">' +
    '<div class="apply-flow-node">' +
    '<h4 class="apply-flow-node__title">发起人</h4>' +
    '<p class="apply-flow-node__info">填写申请</p>' +
    '</div>' +
    '<div class="apply-flow-node apply-flow-node--current">' +
    '<h4 class="apply-flow-node__title">直属主管</h4>' +
    '<p class="apply-flow-node__info">待审批</p>' +
    '</div>' +
    '<div class="apply-flow-node">' +
    '<h4 class="apply-flow-node__title">财务复核</h4>' +
    '<p class="apply-flow-node__info">预算审核</p>' +
    '</div>' +
    '</div>' +
    '<h3 class="apply-aside__title">差旅标准</h3>' +
    '<div class="apply-tips">' +
    '<p class="apply-tips__item">• 一线城市住宿标准：500元/天</p>' +
    '<p class="apply-tips__item">• 二线城市住宿标准：350元/天</p>' +
    '<p class="apply-tips__item">• 交通费按实际票据报销</p>' +
    '</div>' +
    '</aside>' +
    '</div>' +
    '</div>';
}

/**
 * 发起申请页面 — 对应 Figma
 */
function mountStartApplyPage() {
  var categories = [
    { icon: '📋', title: '请假申请', desc: '年假、病假、事假等', path: '/my-apply/leave' },
    { icon: '✈️', title: '出差申请', desc: '国内、国外出差', path: '/my-apply/trip' },
    { icon: '🔄', title: '调岗调薪', desc: '岗位或薪资调整', path: '/my-apply/transfer-salary' },
    { icon: '📝', title: '报销申请', desc: '费用报销', path: '/my-apply/expense' },
    { icon: '🎓', title: '培训申请', desc: '外部培训报名', path: '/my-apply/training' },
    { icon: '📄', title: '证明开具', desc: '在职、收入证明', path: '/my-apply/certificate' },
    { icon: '⏰', title: '加班申请', desc: '加班调休', path: '/my-apply/overtime' },
    { icon: '🔑', title: '权限申请', desc: '系统权限开通', path: '/my-apply/permission' }
  ];

  var cardsHtml = categories.map(function(c) {
    return '<a class="apply-start-card" href="#' + escapeHtml(c.path) + '">' +
      '<div class="apply-start-card__icon">' + c.icon + '</div>' +
      '<h3 class="apply-start-card__title">' + escapeHtml(c.title) + '</h3>' +
      '<p class="apply-start-card__desc">' + escapeHtml(c.desc) + '</p>' +
      '</a>';
  }).join('');

  return '<div class="apply-page">' +
    '<header class="apply-hero">' +
    '<h1 class="apply-hero__title">发起申请</h1>' +
    '<p class="apply-hero__path">菜单定位：我的申请 / 发起申请 · /my-apply/start</p>' +
    '</header>' +
    '<div class="apply-form-card">' +
    '<p style="margin:0 0 16px;color:#657487;font-size:13px;">选择需要发起的申请类型，快速进入申请流程。</p>' +
    '<div class="apply-start-grid">' + cardsHtml + '</div>' +
    '</div>' +
    '</div>';
}

/**
 * 调岗调薪申请页面 — 对应 Figma
 */
function mountTransferSalaryPage() {
  return '<div class="apply-page">' +
    '<header class="apply-hero">' +
    '<h1 class="apply-hero__title">调岗调薪</h1>' +
    '<p class="apply-hero__path">菜单定位：我的申请 / 调岗调薪 · /my-apply/transfer-salary</p>' +
    '</header>' +
    '<div class="apply-main">' +
    '<div class="apply-form-card">' +
    '<h2 class="apply-form-card__title">调岗调薪申请单</h2>' +
    '<div class="apply-form-grid">' +
    '<div class="apply-field apply-field--double">' +
    '<label class="apply-field__label">申请对象</label>' +
    '<select class="apply-field__control apply-field__select" name="employee">' +
    '<option value="">请选择员工</option>' +
    '<option value="1">张三 - 研发部</option>' +
    '<option value="2">李四 - 市场部</option>' +
    '</select>' +
    '</div>' +
    '<div class="apply-field apply-field--double">' +
    '<label class="apply-field__label">生效日期</label>' +
    '<input type="date" class="apply-field__control" name="effectiveDate" />' +
    '</div>' +
    '</div>' +
    '<div class="transfer-compare" style="margin-top:20px;">' +
    '<div class="transfer-column">' +
    '<h3 class="transfer-column__title">变更前</h3>' +
    '<div class="apply-field" style="margin-bottom:12px;">' +
    '<label class="apply-field__label">部门</label>' +
    '<input type="text" class="apply-field__control" value="研发部" readonly />' +
    '</div>' +
    '<div class="apply-field" style="margin-bottom:12px;">' +
    '<label class="apply-field__label">岗位</label>' +
    '<input type="text" class="apply-field__control" value="高级工程师" readonly />' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">薪资</label>' +
    '<input type="text" class="apply-field__control" value="25,000 元/月" readonly />' +
    '</div>' +
    '</div>' +
    '<div class="transfer-arrow">→</div>' +
    '<div class="transfer-column transfer-column--after">' +
    '<h3 class="transfer-column__title">变更后</h3>' +
    '<div class="apply-field" style="margin-bottom:12px;">' +
    '<label class="apply-field__label">部门</label>' +
    '<select class="apply-field__control apply-field__select">' +
    '<option value="">请选择</option>' +
    '<option value="dev">研发部</option>' +
    '<option value="product">产品部</option>' +
    '</select>' +
    '</div>' +
    '<div class="apply-field" style="margin-bottom:12px;">' +
    '<label class="apply-field__label">岗位</label>' +
    '<select class="apply-field__control apply-field__select">' +
    '<option value="">请选择</option>' +
    '<option value="senior">高级工程师</option>' +
    '<option value="lead">技术主管</option>' +
    '</select>' +
    '</div>' +
    '<div class="apply-field">' +
    '<label class="apply-field__label">薪资</label>' +
    '<input type="number" class="apply-field__control" placeholder="输入新薪资" />' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="apply-field apply-field--full" style="margin-top:20px;">' +
    '<label class="apply-field__label">调整原因</label>' +
    '<textarea class="apply-field__control apply-field__textarea" name="reason" placeholder="请说明调岗调薪的原因"></textarea>' +
    '</div>' +
    '<div class="apply-actions">' +
    '<button type="button" class="apply-btn apply-btn--default" onclick="history.back()">取消</button>' +
    '<button type="button" class="apply-btn apply-btn--default">暂存</button>' +
    '<button type="button" class="apply-btn apply-btn--primary">提交申请</button>' +
    '</div>' +
    '</div>' +
    '<aside class="apply-aside">' +
    '<h3 class="apply-aside__title">审批流程</h3>' +
    '<div class="apply-flow">' +
    '<div class="apply-flow-node">' +
    '<h4 class="apply-flow-node__title">发起人</h4>' +
    '<p class="apply-flow-node__info">HR专员</p>' +
    '</div>' +
    '<div class="apply-flow-node apply-flow-node--current">' +
    '<h4 class="apply-flow-node__title">部门负责人</h4>' +
    '<p class="apply-flow-node__info">待审批</p>' +
    '</div>' +
    '<div class="apply-flow-node">' +
    '<h4 class="apply-flow-node__title">HRD</h4>' +
    '<p class="apply-flow-node__info">薪资变更复核</p>' +
    '</div>' +
    '</div>' +
    '<h3 class="apply-aside__title">注意事项</h3>' +
    '<div class="apply-tips">' +
    '<p class="apply-tips__item">• 薪资调整需 HRD 会签</p>' +
    '<p class="apply-tips__item">• 跨部门调动需双方负责人确认</p>' +
    '<p class="apply-tips__item">• 生效日期不可早于审批通过日</p>' +
    '</div>' +
    '</aside>' +
    '</div>' +
    '</div>';
}

/**
 * 个性化布局页面 — 对应 Figma
 */
function mountPersonalizationLayoutPage() {
  var components = [
    { name: '公告与通知', id: 'announcements', enabled: true },
    { name: '消息列表', id: 'messages', enabled: true },
    { name: '待办任务', id: 'todos', enabled: true },
    { name: '绩效看板', id: 'performance', enabled: false },
    { name: '快捷入口', id: 'quicklinks', enabled: true },
    { name: '日程安排', id: 'schedule', enabled: false }
  ];

  var componentsHtml = components.map(function(c) {
    var checked = c.enabled ? ' checked' : '';
    return '<div class="personalization-component">' +
      '<span class="personalization-component__name">' + escapeHtml(c.name) + '</span>' +
      '<label class="personalization-toggle">' +
      '<input type="checkbox"' + checked + ' data-component="' + escapeHtml(c.id) + '" />' +
      '<span class="personalization-toggle__slider"></span>' +
      '</label>' +
      '</div>';
  }).join('');

  return '<div class="apply-page">' +
    '<header class="apply-hero">' +
    '<h1 class="apply-hero__title">个性化布局</h1>' +
    '<p class="apply-hero__path">菜单定位：门户首页 / 个性化布局 · /personalization/layout</p>' +
    '</header>' +
    '<div class="apply-main">' +
    '<div class="apply-form-card" style="max-width:500px;">' +
    '<div style="display:flex;gap:12px;margin-bottom:20px;">' +
    '<button type="button" class="apply-btn apply-btn--primary">保存布局</button>' +
    '<button type="button" class="apply-btn apply-btn--default">恢复默认</button>' +
    '<button type="button" class="apply-btn apply-btn--default">立即预览</button>' +
    '</div>' +
    '<h3 style="margin:0 0 12px;font-size:14px;color:#071827;">可选组件</h3>' +
    '<div style="display:flex;flex-direction:column;gap:12px;">' + componentsHtml + '</div>' +
    '</div>' +
    '<div class="apply-form-card" style="flex:1;">' +
    '<h3 style="margin:0 0 12px;font-size:14px;color:#071827;">工作台预览</h3>' +
    '<div style="padding:40px;text-align:center;color:#657487;font-size:13px;background:#f8fafc;border-radius:12px;border:1px dashed #eef2f7;">' +
    '预览区域 — 根据组件配置动态生成' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';
}

/**
 * 对比分析页面 — 对应 Figma
 */
function mountCompareAnalysisPage() {
  return '<div class="apply-page">' +
    '<header class="apply-hero">' +
    '<h1 class="apply-hero__title">对比分析</h1>' +
    '<p class="apply-hero__path">菜单定位：绩效看板 / 对比分析 · /kpi-board/compare</p>' +
    '</header>' +
    '<div class="apply-form-card">' +
    '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:20px;">' +
    '<div class="apply-field" style="margin-bottom:0;min-width:160px;">' +
    '<label class="apply-field__label">对比周期</label>' +
    '<select class="apply-field__control apply-field__select">' +
    '<option value="2026-q2">2026-Q2</option>' +
    '<option value="2026-q1">2026-Q1</option>' +
    '</select>' +
    '</div>' +
    '<div class="apply-field" style="margin-bottom:0;min-width:160px;">' +
    '<label class="apply-field__label">组织维度</label>' +
    '<select class="apply-field__control apply-field__select">' +
    '<option value="dept">部门</option>' +
    '<option value="team">团队</option>' +
    '</select>' +
    '</div>' +
    '<div class="apply-field" style="margin-bottom:0;min-width:160px;">' +
    '<label class="apply-field__label">对比方式</label>' +
    '<select class="apply-field__control apply-field__select">' +
    '<option value="yoy">同比</option>' +
    '<option value="mom">环比</option>' +
    '</select>' +
    '</div>' +
    '<button type="button" class="apply-btn apply-btn--primary" style="margin-left:auto;">导出分析</button>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">' +
    '<div style="padding:16px;border-radius:12px;background:#f0f7ff;border:1px solid #dbeafe;">' +
    '<div style="font-size:12px;color:#657487;margin-bottom:4px;">本期平均分</div>' +
    '<div style="font-size:24px;font-weight:700;color:#071827;">82.5</div>' +
    '</div>' +
    '<div style="padding:16px;border-radius:12px;background:#f0fdf4;border:1px solid #bbf7d0;">' +
    '<div style="font-size:12px;color:#657487;margin-bottom:4px;">同比提升</div>' +
    '<div style="font-size:24px;font-weight:700;color:#16a34a;">+5.2%</div>' +
    '</div>' +
    '<div style="padding:16px;border-radius:12px;background:#fefce8;border:1px solid #fef08a;">' +
    '<div style="font-size:12px;color:#657487;margin-bottom:4px;">领先组织</div>' +
    '<div style="font-size:24px;font-weight:700;color:#071827;">技术中心</div>' +
    '</div>' +
    '<div style="padding:16px;border-radius:12px;background:#fef2f2;border:1px solid #fecaca;">' +
    '<div style="font-size:12px;color:#657487;margin-bottom:4px;">异常指标</div>' +
    '<div style="font-size:24px;font-weight:700;color:#dc2626;">3 项</div>' +
    '</div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
    '<div style="padding:20px;border-radius:12px;background:#f8fafc;border:1px solid #eef2f7;">' +
    '<h3 style="margin:0 0 12px;font-size:14px;color:#071827;">趋势对比</h3>' +
    '<div style="height:200px;display:flex;align-items:center;justify-content:center;color:#657487;font-size:13px;">图表占位 — 可接入 ECharts</div>' +
    '</div>' +
    '<div style="padding:20px;border-radius:12px;background:#f8fafc;border:1px solid #eef2f7;">' +
    '<h3 style="margin:0 0 12px;font-size:14px;color:#071827;">结构分布</h3>' +
    '<div style="height:200px;display:flex;align-items:center;justify-content:center;color:#657487;font-size:13px;">图表占位 — 可接入 ECharts</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';
}

// ==================== 流程编辑数据 ====================
// 模拟已有流程数据
var workflowDataStore = {
  '1': { name: '请假申请', desc: '员工提交请假申请后的审批流程' },
  '2': { name: '报销申请', desc: '费用报销审批流程' },
  '3': { name: '出差申请', desc: '国内、国外出差审批流程' }
};

/**
 * OA审批流程 - 基本设置页面 — 对应 Figma 1299:10164
 * 表单模版创建的第一步：基本信息、发起设置、管理员设置
 */
function mountOABasicSettingsPage() {
  return '<div class="oa-page oa-page--no-nav">' +
    // 顶部导航栏
    '<div class="oa-topnav">' +
    '<div class="oa-topnav__logo">' +
    '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 30 30\'%3E%3Crect fill=\'%23c4c4c4\' width=\'30\' height=\'30\' rx=\'4\'/%3E%3C/svg%3E" class="oa-topnav__logo-icon" />' +
    '<span>LOGO</span>' +
    '</div>' +
    '<div class="oa-topnav__search">' +
    '<input type="text" class="oa-topnav__search-input" placeholder="请输入您要搜索的关键字" />' +
    '<span class="oa-topnav__search-icon">🔍</span>' +
    '</div>' +
    '<div class="oa-topnav__actions">' +
    '<span class="oa-topnav__icon-btn">🏠</span>' +
    '<span class="oa-topnav__icon-btn">💬</span>' +
    '<span class="oa-topnav__icon-btn">⭐</span>' +
    '<span class="oa-topnav__icon-btn oa-topnav__icon-btn--badge">🛒</span>' +
    '</div>' +
    '<div class="oa-topnav__user">' +
    '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\'%3E%3Ccircle fill=\'%23c4c4c4\' cx=\'16\' cy=\'16\' r=\'16\'/%3E%3C/svg%3E" class="oa-topnav__avatar" />' +
    '<span class="oa-topnav__username">迷人的李主任</span>' +
    '<span class="oa-topnav__arrow">▼</span>' +
    '</div>' +
    '</div>' +
    // 左侧导航
    '<div class="oa-sidebar">' +
    '<div class="oa-sidebar__menu">' +
    '<div class="oa-sidebar__item oa-sidebar__item--expanded">' +
    '<span class="oa-sidebar__icon">🛡</span>' +
    '<span>年度管理</span>' +
    '<span class="oa-sidebar__arrow">▼</span>' +
    '</div>' +
    '<div class="oa-sidebar__subitem oa-sidebar__subitem--active">' +
    '<span>表单管理</span>' +
    '</div>' +
    '<div class="oa-sidebar__item">' +
    '<span class="oa-sidebar__icon">💬</span>' +
    '<span>审批管理</span>' +
    '<span class="oa-sidebar__arrow">▶</span>' +
    '</div>' +
    '<div class="oa-sidebar__item">' +
    '<span class="oa-sidebar__icon">📦</span>' +
    '<span>OA审批</span>' +
    '<span class="oa-sidebar__arrow">▶</span>' +
    '</div>' +
    '<div class="oa-sidebar__item">' +
    '<span class="oa-sidebar__icon">👾</span>' +
    '<span>人员管理</span>' +
    '<span class="oa-sidebar__arrow">▶</span>' +
    '</div>' +
    '<div class="oa-sidebar__item">' +
    '<span class="oa-sidebar__icon">⚙</span>' +
    '<span>一级菜单</span>' +
    '<span class="oa-sidebar__arrow">▶</span>' +
    '</div>' +
    '</div>' +
    '<div class="oa-sidebar__divider"></div>' +
    '<div class="oa-sidebar__toggle">' +
    '<span>◀</span>' +
    '</div>' +
    '</div>' +
    // 步骤导航
    '<nav class="oa-stepnav">' +
    '<a class="oa-stepnav__back" href="#!/workflow">←</a>' +
    '<div class="oa-stepnav__item">' +
    '<span class="oa-stepnav__number oa-stepnav__number--active">1</span>' +
    '<span class="oa-stepnav__label oa-stepnav__label--active">基本设置</span>' +
    '</div>' +
    '<div class="oa-stepnav__line oa-stepnav__line--active"></div>' +
    '<div class="oa-stepnav__item">' +
    '<span class="oa-stepnav__number oa-stepnav__number--pending">2</span>' +
    '<span class="oa-stepnav__label oa-stepnav__label--pending">表单设计</span>' +
    '</div>' +
    '<div class="oa-stepnav__line"></div>' +
    '<div class="oa-stepnav__item">' +
    '<span class="oa-stepnav__number oa-stepnav__number--pending">3</span>' +
    '<span class="oa-stepnav__label oa-stepnav__label--pending">流程设置</span>' +
    '</div>' +
    '<span class="oa-stepnav__help">帮助</span>' +
    '</nav>' +
    // 主内容区
    '<div class="oa-content oa-content--basic">' +
    '<div class="oa-basic-form__wrapper">' +
    '<div class="oa-basic-form">' +
    // 缩略图
    '<div class="oa-basic-form__thumb" id="formThumb">' +
    '<span>+</span>' +
    '</div>' +
    // 表单名称
    '<div class="oa-basic-form__row">' +
    '<div class="oa-basic-form__label oa-basic-form__label--required">表单名称</div>' +
    '<div class="oa-basic-form__control">' +
    '<input type="text" class="oa-basic-form__input" id="formName" placeholder="请输入表单名称" />' +
    '</div>' +
    '</div>' +
    // 表单说明
    '<div class="oa-basic-form__row">' +
    '<div class="oa-basic-form__label">表单说明</div>' +
    '<div class="oa-basic-form__control">' +
    '<textarea class="oa-basic-form__textarea oa-basic-form__textarea--sm" id="formDesc" placeholder="请输入表单说明"></textarea>' +
    '<div class="oa-basic-form__char-count"><span id="descCount">0</span>/100</div>' +
    '</div>' +
    '</div>' +
    // 谁可以发起
    '<div class="oa-basic-form__row">' +
    '<div class="oa-basic-form__label oa-basic-form__label--required">谁可以发起</div>' +
    '<div class="oa-basic-form__control">' +
    '<div class="oa-basic-form__options" id="initiatorOptions">' +
    '<label class="oa-basic-form__option oa-basic-form__option--checked" data-value="all">' +
    '<span class="oa-basic-form__checkbox oa-basic-form__checkbox--checked"></span>' +
    '<span class="oa-basic-form__option-text">全部</span>' +
    '</label>' +
    '<label class="oa-basic-form__option" data-value="specified">' +
    '<span class="oa-basic-form__checkbox"></span>' +
    '<span class="oa-basic-form__option-text">指定成员</span>' +
    '</label>' +
    // 添加成员按钮（在选择指定成员时显示）
    '<span class="oa-basic-form__add-btn oa-basic-form__add-btn--hidden" id="addInitiatorBtn">+ 添加</span>' +
    '</div>' +
    // 已选发起成员显示区域
    '<div class="oa-basic-form__selected-tags" id="selectedInitiators"></div>' +
    '</div>' +
    '</div>' +
    // 表单管理员
    '<div class="oa-basic-form__row">' +
    '<div class="oa-basic-form__label oa-basic-form__label--required">表单管理员</div>' +
    '<div class="oa-basic-form__control">' +
    '<div class="oa-basic-form__options" id="adminOptions">' +
    '<label class="oa-basic-form__option oa-basic-form__option--checked" data-value="all">' +
    '<span class="oa-basic-form__checkbox oa-basic-form__checkbox--checked"></span>' +
    '<span class="oa-basic-form__option-text">全部[OA审核]管理员</span>' +
    '</label>' +
    '<label class="oa-basic-form__option" data-value="specified">' +
    '<span class="oa-basic-form__checkbox"></span>' +
    '<span class="oa-basic-form__option-text">指定[OA审核]管理员</span>' +
    '</label>' +
    // 添加管理员按钮
    '<span class="oa-basic-form__add-btn oa-basic-form__add-btn--hidden" id="addAdminBtn">+ 添加</span>' +
    '</div>' +
    // 已选管理员显示区域
    '<div class="oa-basic-form__selected-tags" id="selectedAdmins"></div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // 底部操作栏（不包含发布按钮）
    '<div class="oa-footer oa-footer--center">' +
    '<button type="button" class="oa-btn oa-btn--default" id="previewBtn">预览</button>' +
    '<button type="button" class="oa-btn oa-btn--default" id="saveDraftBtn">保存草稿</button>' +
    '<button type="button" class="oa-btn oa-btn--primary" id="nextStepBtn">下一步</button>' +
    '</div>' +
    '</div>' +
    // 人员选择弹窗
    '<div class="oa-modal" id="personModal" style="display:none">' +
    '<div class="oa-modal__overlay"></div>' +
    '<div class="oa-modal__content oa-modal__content--lg">' +
    '<div class="oa-modal__header">' +
    '<span id="personModalTitle">选择人员</span>' +
    '<button class="oa-modal__close" id="closePersonModal">×</button>' +
    '</div>' +
    '<div class="oa-modal__body">' +
    '<div class="oa-person-selector">' +
    '<div class="oa-person-selector__search">' +
    '<input type="text" class="oa-basic-form__input" placeholder="搜索姓名..." id="personSearch" />' +
    '</div>' +
    '<div class="oa-person-selector__list" id="personList"></div>' +
    '</div>' +
    '</div>' +
    '<div class="oa-modal__footer">' +
    '<button type="button" class="oa-btn oa-btn--default" id="cancelPersonBtn">取消</button>' +
    '<button type="button" class="oa-btn oa-btn--primary" id="confirmPersonBtn">确定</button>' +
    '</div>' +
    '</div>' +
    '</div>';
}

/**
 * OA审批流程 - 表单设计页面 — 对应 Figma 1299:8691
 * 左侧控件面板 + 中间设计画布 + 右侧属性面板
 * 支持拖拽添加控件、删除、编辑
 */
function mountOAFormDesignPage() {
  // 控件定义 - 按 Figma 设计分类，使用扁平风格图标
  var layoutControls = [
    { id: 'column', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="5" height="12" rx="1"/><rect x="9" y="2" width="5" height="12" rx="1"/></svg>', text: '分栏', type: 'layout' }
  ];

  var basicControls = [
    { id: 'text', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="10" y2="12"/></svg>', text: '单行输入框', type: 'basic', placeholder: '请输入' },
    { id: 'textarea', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="12" height="12" rx="1"/><line x1="4" y1="5" x2="12" y2="5"/><line x1="4" y1="8" x2="12" y2="8"/><line x1="4" y1="11" x2="8" y2="11"/></svg>', text: '多行输入框', type: 'basic', placeholder: '请输入' },
    { id: 'number', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><text x="3" y="12" font-size="10" fill="currentColor" stroke="none">123</text></svg>', text: '数字输入框', type: 'basic', placeholder: '请输入数字' },
    { id: 'radio', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5" cy="5" r="2.5"/><circle cx="5" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="5" cy="11" r="2.5"/><line x1="9" y1="5" x2="14" y2="5"/><line x1="9" y1="11" x2="14" y2="11"/></svg>', text: '单选框', type: 'basic', placeholder: '请选择' },
    { id: 'checkbox', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="4" height="4" rx="1"/><path d="M3.5 5l1 1 2-2" stroke-width="1"/><rect x="2" y="9" width="4" height="4" rx="1"/><line x1="8" y1="5" x2="14" y2="5"/><line x1="8" y1="11" x2="14" y2="11"/></svg>', text: '多选框', type: 'basic', placeholder: '请选择' },
    { id: 'date', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="11" rx="1"/><line x1="2" y1="7" x2="14" y2="7"/><line x1="5" y1="1" x2="5" y2="4"/><line x1="11" y1="1" x2="11" y2="4"/></svg>', text: '日期', type: 'basic', placeholder: '请选择日期' },
    { id: 'daterange', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="6" height="9" rx="1"/><rect x="9" y="4" width="6" height="9" rx="1"/><line x1="1" y1="7" x2="7" y2="7"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="3" y1="2" x2="3" y2="5"/><line x1="11" y1="2" x2="11" y2="5"/></svg>', text: '日期区间', type: 'basic', placeholder: '请选择日期范围' },
    { id: 'desc', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg>', text: '说明文字', type: 'basic', placeholder: '' },
    { id: 'idcard', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="14" height="10" rx="2"/><circle cx="5" cy="7" r="1.5"/><line x1="8" y1="7" x2="13" y2="7"/><line x1="8" y1="10" x2="11" y2="10"/></svg>', text: '身份证', type: 'basic', placeholder: '请输入身份证号' },
    { id: 'phone', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 1h2l1 3-2 2c1 2 3 4 5 5l2-2 3 1v2a2 2 0 01-2 2C6 14 2 10 1 5a2 2 0 012-2z"/></svg>', text: '电话', type: 'basic', placeholder: '请输入电话号码' }
  ];

  var advancedControls = [
    { id: 'cascade', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4h4v4H2zM6 8h4v4H6zM10 4h4v4h-4z"/><line x1="4" y1="8" x2="4" y2="10"/><line x1="4" y1="10" x2="6" y2="10"/></svg>', text: '级联/分类', type: 'advanced', placeholder: '请选择' },
    { id: 'image', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="10" rx="1"/><circle cx="5.5" cy="6.5" r="1.5"/><path d="M14 11l-3-3-4 4"/></svg>', text: '图片', type: 'advanced', placeholder: '点击上传图片' },
    { id: 'table', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="12" height="12" rx="1"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="2" y1="10" x2="14" y2="10"/><line x1="6" y1="2" x2="6" y2="14"/><line x1="10" y1="2" x2="10" y2="14"/></svg>', text: '明细/表格', type: 'advanced', placeholder: '' },
    { id: 'money', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><text x="3" y="12" font-size="12" fill="currentColor" stroke="none">¥</text></svg>', text: '金额', type: 'advanced', placeholder: '请输入金额' },
    { id: 'attachment', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12V6a3 3 0 016 0v6"/><path d="M5 12a2 2 0 004 0V6"/></svg>', text: '附件', type: 'advanced', placeholder: '点击上传附件' },
    { id: 'signature', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 14c2-2 4-6 6-10 1 0 2 1 2 2-4 2-6 6-8 8z"/><path d="M10 6l2-2c1-1 2-1 3 0s1 2 0 3l-7 7"/></svg>', text: '手写签名', type: 'advanced', placeholder: '点击签名' },
    { id: 'external', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg>', text: '外部联系人', type: 'advanced', placeholder: '请选择' },
    { id: 'contact', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5" cy="6" r="2.5"/><path d="M1 14c0-2.5 1.5-4 4-4s4 1.5 4 4"/><circle cx="12" cy="5" r="2"/><path d="M10 11c1-.5 1.5-1 2-1 2 0 3 1.5 3 3"/></svg>', text: '联系人', type: 'advanced', placeholder: '请选择' },
    { id: 'invoice', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="1" width="10" height="14" rx="1"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="9" y2="11"/></svg>', text: '发票', type: 'advanced', placeholder: '请选择' },
    { id: 'customer', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="12" height="10" rx="1"/><path d="M2 7h12"/><rect x="4" y="2" width="3" height="4" rx="1"/></svg>', text: '客户', type: 'advanced', placeholder: '请选择' },
    { id: 'account', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="12" height="8" rx="1"/><line x1="6" y1="7" x2="6" y2="9"/><line x1="10" y1="7" x2="10" y2="9"/><line x1="8" y1="4" x2="8" y2="12"/></svg>', text: '收款账户', type: 'advanced', placeholder: '请选择' },
    { id: 'budget', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="12" height="12" rx="1"/><line x1="5" y1="11" x2="5" y2="8"/><line x1="8" y1="11" x2="8" y2="5"/><line x1="11" y1="11" x2="11" y2="6"/></svg>', text: '预算申请', type: 'advanced', placeholder: '请填写' },
    { id: 'contract', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="1" width="10" height="14" rx="1"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="8" y2="11"/><path d="M9 11l2 2 3-3"/></svg>', text: '关联合同', type: 'advanced', placeholder: '请选择' },
    { id: 'department', icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="1" width="4" height="3" rx="1"/><rect x="1" y="8" width="4" height="3" rx="1"/><rect x="6" y="8" width="4" height="3" rx="1"/><rect x="11" y="8" width="4" height="3" rx="1"/><line x1="8" y1="4" x2="8" y2="6"/><line x1="3" y1="6" x2="13" y2="6"/><line x1="3" y1="6" x2="3" y2="8"/><line x1="8" y1="6" x2="8" y2="8"/><line x1="13" y1="6" x2="13" y2="8"/></svg>', text: '部门', type: 'advanced', placeholder: '请选择' }
  ];

  // 生成控件 HTML
  function renderControlItems(controls) {
    return controls.map(function(c) {
      return '<div class="oa-controls__item" draggable="true" data-control-id="' + c.id + '" data-control-type="' + c.type + '" data-control-text="' + c.text + '" data-control-placeholder="' + (c.placeholder || '') + '">' +
        '<span class="oa-controls__item-icon">' + c.icon + '</span>' +
        '<span class="oa-controls__item-text">' + c.text + '</span>' +
        '</div>';
    }).join('');
  }

  // 已添加的字段（初始演示数据）
  var formFields = [
    { id: 'field-1', controlId: 'text', title: '单行输入框', placeholder: '请输入', required: true },
    { id: 'field-2', controlId: 'date', title: '日期', placeholder: '请选择日期', required: false }
  ];

  return '<div class="oa-page oa-page--no-nav">' +
    '<nav class="oa-stepnav">' +
    '<a class="oa-stepnav__back" href="#!/workflow/create">←</a>' +
    '<div class="oa-stepnav__item">' +
    '<span class="oa-stepnav__number oa-stepnav__number--completed">✓</span>' +
    '<span class="oa-stepnav__label oa-stepnav__label--completed">基本设置</span>' +
    '</div>' +
    '<div class="oa-stepnav__line oa-stepnav__line--completed"></div>' +
    '<div class="oa-stepnav__item">' +
    '<span class="oa-stepnav__number oa-stepnav__number--active">2</span>' +
    '<span class="oa-stepnav__label oa-stepnav__label--active">表单设计</span>' +
    '</div>' +
    '<div class="oa-stepnav__line"></div>' +
    '<div class="oa-stepnav__item">' +
    '<span class="oa-stepnav__number oa-stepnav__number--pending">3</span>' +
    '<span class="oa-stepnav__label oa-stepnav__label--pending">流程设置</span>' +
    '</div>' +
    '</nav>' +
    '<div class="oa-content oa-content--form-design">' +
    // 左侧控件面板
    '<div class="oa-controls">' +
    '<div class="oa-controls__tabs">' +
    '<div class="oa-controls__tab oa-controls__tab--active" data-tab="widgets">控件</div>' +
    '<div class="oa-controls__tab" data-tab="groups">控件组</div>' +
    '<div class="oa-controls__tab" data-tab="relations">关联</div>' +
    '</div>' +
    // 控件Tab内容
    '<div class="oa-controls__content oa-controls__content--active" id="tab-widgets">' +
    '<div class="oa-controls__main">' +
    // 布局控件
    '<div class="oa-controls__section">' +
    '<div class="oa-controls__section-header">' +
    '<span class="oa-controls__section-icon">▼</span>' +
    '<span class="oa-controls__section-title">布局控件</span>' +
    '</div>' +
    '<div class="oa-controls__grid">' + renderControlItems(layoutControls) + '</div>' +
    '</div>' +
    // 基础控件
    '<div class="oa-controls__section">' +
    '<div class="oa-controls__section-header">' +
    '<span class="oa-controls__section-icon">▼</span>' +
    '<span class="oa-controls__section-title">基础控件</span>' +
    '</div>' +
    '<div class="oa-controls__grid">' + renderControlItems(basicControls) + '</div>' +
    '</div>' +
    // 增强控件
    '<div class="oa-controls__section">' +
    '<div class="oa-controls__section-header">' +
    '<span class="oa-controls__section-icon">▼</span>' +
    '<span class="oa-controls__section-title">增强控件</span>' +
    '</div>' +
    '<div class="oa-controls__grid">' + renderControlItems(advancedControls) + '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // 控件组Tab内容
    '<div class="oa-controls__content" id="tab-groups">' +
    '<div class="oa-controls__main">' +
    '<div class="oa-controls__empty-tip">暂无控件组，可从控件区选择多个控件创建分组</div>' +
    '</div>' +
    '</div>' +
    // 关联Tab内容
    '<div class="oa-controls__content" id="tab-relations">' +
    '<div class="oa-controls__main">' +
    '<div class="oa-controls__empty-tip">暂无关联配置，选择字段后可设置关联规则</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // 中间画布
    '<div class="oa-designer">' +
    '<div class="oa-designer__toolbar">' +
    '<div class="oa-designer__device-switch">' +
    '<button class="oa-designer__device-btn oa-designer__device-btn--active" title="手机端"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="4" y="1" width="8" height="14" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/></svg></button>' +
    '<button class="oa-designer__device-btn" title="PC端"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="1" y="3" width="14" height="9" rx="1"/><line x1="5" y1="14" x2="11" y2="14"/><line x1="8" y1="12" x2="8" y2="14"/></svg></button>' +
    '</div>' +
    '<div class="oa-designer__toolbar-divider"></div>' +
    '<button class="oa-designer__toolbar-btn"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 2v12l4-3 4 3V2z"/></svg>撤销</button>' +
    '<button class="oa-designer__toolbar-btn"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 14V2l-4 3-4-3v12z"/></svg>重做</button>' +
    '<button class="oa-designer__toolbar-btn oa-designer__toolbar-btn--active"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2"/></svg>预览</button>' +
    '<div class="oa-designer__toolbar-divider"></div>' +
    '<button class="oa-designer__toolbar-btn"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="5" cy="8" r="2"/><circle cx="11" cy="8" r="2"/><line x1="7" y1="8" x2="9" y2="8"/></svg>连接器</button>' +
    '<button class="oa-designer__toolbar-btn"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="2" width="12" height="12" rx="1"/><path d="M5 5h6M5 8h6M5 11h4"/></svg>打印模板</button>' +
    '</div>' +
    '<div class="oa-designer__canvas">' +
    '<div class="oa-designer__phone-frame" id="formCanvas">' +
    // 字段会通过 JS 动态渲染
    '<div class="oa-designer__field" data-field-id="field-1">' +
    '<div class="oa-designer__field-header">' +
    '<div>' +
    '<div class="oa-designer__field-title">单行输入框</div>' +
    '<div class="oa-designer__field-placeholder">请输入</div>' +
    '</div>' +
    '<div class="oa-designer__field-actions">' +
    '<button class="oa-designer__field-action" title="上移"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 12V4M4 8l4-4 4 4"/></svg></button>' +
    '<button class="oa-designer__field-action" title="下移"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 4v8M4 8l4 4 4-4"/></svg></button>' +
    '<button class="oa-designer__field-action oa-designer__field-action--delete" title="删除"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="oa-designer__field" data-field-id="field-2">' +
    '<div class="oa-designer__field-header">' +
    '<div>' +
    '<div class="oa-designer__field-title">日期</div>' +
    '<div class="oa-designer__field-placeholder">请选择日期</div>' +
    '</div>' +
    '<div class="oa-designer__field-actions">' +
    '<button class="oa-designer__field-action" title="上移"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 12V4M4 8l4-4 4 4"/></svg></button>' +
    '<button class="oa-designer__field-action" title="下移"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 4v8M4 8l4 4 4-4"/></svg></button>' +
    '<button class="oa-designer__field-action oa-designer__field-action--delete" title="删除"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // 空状态提示（拖拽区域）
    '<div class="oa-designer__empty" id="formEmpty" style="display:none">' +
    '<div class="oa-designer__empty-icon"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="24" height="24" rx="2"/><line x1="4" y1="12" x2="28" y2="12"/><line x1="12" y1="4" x2="12" y2="28"/><line x1="20" y1="16" x2="20" y2="24"/><line x1="16" y1="20" x2="24" y2="20"/></svg></div>' +
    '<div class="oa-designer__empty-text">+ 点击或拖拽左侧控件至此</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // 右侧属性面板
    '<div class="oa-properties">' +
    '<div class="oa-properties__header">' +
    '<div class="oa-properties__header-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="10" y2="12"/></svg></div>' +
    '<div class="oa-properties__header-title">单行输入框</div>' +
    '</div>' +
    '<div class="oa-properties__body">' +
    '<div class="oa-properties__section">' +
    '<div class="oa-properties__section-title">标题</div>' +
    '<div class="oa-properties__row">' +
    '<input type="text" class="oa-properties__input" value="单行输入框" placeholder="请输入标题" id="propTitle" />' +
    '</div>' +
    '<div class="oa-properties__char-count"><span id="propTitleCount">5</span>/50</div>' +
    '</div>' +
    '<div class="oa-properties__section">' +
    '<div class="oa-properties__section-title">提示文字</div>' +
    '<div class="oa-properties__row">' +
    '<input type="text" class="oa-properties__input" value="请输入" placeholder="请输入提示文字" id="propPlaceholder" />' +
    '</div>' +
    '<div class="oa-properties__char-count"><span id="propPlaceholderCount">3</span>/50</div>' +
    '</div>' +
    '<div class="oa-properties__section">' +
    '<div class="oa-properties__section-title">默认值</div>' +
    '<div class="oa-properties__row">' +
    '<input type="text" class="oa-properties__input" placeholder="请输入默认值" id="propDefault" />' +
    '</div>' +
    '</div>' +
    '<div class="oa-properties__section">' +
    '<div class="oa-properties__toggle-row">' +
    '<span class="oa-properties__toggle-label">必填</span>' +
    '<span class="oa-properties__toggle oa-properties__toggle--on" id="propRequired"></span>' +
    '</div>' +
    '<div class="oa-properties__toggle-row">' +
    '<span class="oa-properties__toggle-label">自定义</span>' +
    '<span class="oa-properties__toggle" id="propCustom"></span>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="oa-footer">' +
    '<button type="button" class="oa-btn oa-btn--default" onclick="window.location.hash=\'#!/workflow/create\'">上一步</button>' +
    '<div style="display:flex;gap:12px">' +
    '<button type="button" class="oa-btn oa-btn--default">保存草稿</button>' +
    '<button type="button" class="oa-btn oa-btn--primary" onclick="window.location.hash=\'#!/workflow/create/flow\'">下一步</button>' +
    '</div>' +
    '</div>' +
    '</div>';
}

/**
 * OA审批流程 - 流程设置页面 — 对应 Figma 1299:6521
 * 流程节点配置：发起人 -> 审批人 -> 抄送人
 */
function mountOAFlowSettingsPage() {
  return '<div class="oa-page oa-page--no-nav">' +
    '<nav class="oa-stepnav">' +
    '<a class="oa-stepnav__back" href="#!/workflow/create/form">←</a>' +
    '<div class="oa-stepnav__item">' +
    '<span class="oa-stepnav__number oa-stepnav__number--completed">✓</span>' +
    '<span class="oa-stepnav__label oa-stepnav__label--completed">基本设置</span>' +
    '</div>' +
    '<div class="oa-stepnav__line oa-stepnav__line--completed"></div>' +
    '<div class="oa-stepnav__item">' +
    '<span class="oa-stepnav__number oa-stepnav__number--completed">✓</span>' +
    '<span class="oa-stepnav__label oa-stepnav__label--completed">表单设计</span>' +
    '</div>' +
    '<div class="oa-stepnav__line oa-stepnav__line--completed"></div>' +
    '<div class="oa-stepnav__item">' +
    '<span class="oa-stepnav__number oa-stepnav__number--active">3</span>' +
    '<span class="oa-stepnav__label oa-stepnav__label--active">流程设置</span>' +
    '</div>' +
    '</nav>' +
    '<div class="oa-content oa-content--flow">' +
    // 左侧节点类型面板
    '<div class="oa-flow-panel">' +
    '<div class="oa-flow-panel__header">节点类型</div>' +
    '<div class="oa-flow-panel__body">' +
    '<div class="oa-flow-panel__item" draggable="true" data-node-type="approver">' +
    '<div class="oa-flow-panel__icon oa-flow-panel__icon--approver"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg></div>' +
    '<span class="oa-flow-panel__text">审批人</span>' +
    '</div>' +
    '<div class="oa-flow-panel__item" draggable="true" data-node-type="cc">' +
    '<div class="oa-flow-panel__icon oa-flow-panel__icon--cc"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="4" width="12" height="8" rx="1"/><line x1="6" y1="8" x2="10" y2="8"/></svg></div>' +
    '<span class="oa-flow-panel__text">抄送人</span>' +
    '</div>' +
    '<div class="oa-flow-panel__item" draggable="true" data-node-type="condition">' +
    '<div class="oa-flow-panel__icon oa-flow-panel__icon--condition"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 2l8 6-8 6z"/></svg></div>' +
    '<span class="oa-flow-panel__text">条件分支</span>' +
    '</div>' +
    '<div class="oa-flow-panel__item" draggable="true" data-node-type="notify">' +
    '<div class="oa-flow-panel__icon oa-flow-panel__icon--notify"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M8 2v1M8 13v1M2 8H1M15 8h-1M4 4L3 3M13 13l-1-1M4 12l-1 1M13 3l-1 1"/><circle cx="8" cy="8" r="3"/></svg></div>' +
    '<span class="oa-flow-panel__text">通知</span>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // 中间流程画布
    '<div class="oa-flow-canvas">' +
    '<div class="oa-flow-canvas__toolbar">' +
    '<span class="oa-flow-canvas__status">' +
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" style="width:14px;height:14px;color:#ff844b"><circle cx="8" cy="8" r="6"/><line x1="8" y1="5" x2="8" y2="8"/><circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"/></svg>' +
    '草稿' +
    '</span>' +
    '</div>' +
    '<div class="oa-flow-canvas__content" id="flowCanvas">' +
    // 发起人节点
    '<div class="oa-flow-node" data-node-id="node-initiator">' +
    '<div class="oa-flow-node__header oa-flow-node__header--initiator">' +
    '<div class="oa-flow-node__icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg></div>' +
    '<span class="oa-flow-node__title">发起人</span>' +
    '</div>' +
    '<div class="oa-flow-node__body">' +
    '<div class="oa-flow-node__desc">全员可见</div>' +
    '</div>' +
    '</div>' +
    // 连接线
    '<div class="oa-flow-connector">' +
    '<div class="oa-flow-connector__line"></div>' +
    '<div class="oa-flow-connector__add" title="添加节点">+</div>' +
    '<div class="oa-flow-connector__line"></div>' +
    '</div>' +
    // 审批人节点
    '<div class="oa-flow-node oa-flow-node--editable" data-node-id="node-1" onclick="window.location.hash=\'#!/workflow/create/flow/approver\'">' +
    '<div class="oa-flow-node__header oa-flow-node__header--approver">' +
    '<div class="oa-flow-node__icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg></div>' +
    '<span class="oa-flow-node__title">审批人</span>' +
    '<span class="oa-flow-node__edit"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2l4 4-8 8H2v-4l8-8z"/></svg></span>' +
    '</div>' +
    '<div class="oa-flow-node__body">' +
    '<div class="oa-flow-node__desc">直属主管</div>' +
    '<div class="oa-flow-node__tags">' +
    '<span class="oa-flow-node__tag">或签</span>' +
    '</div>' +
    '</div>' +
    '<button type="button" class="oa-flow-node__delete" title="删除"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>' +
    '</div>' +
    // 连接线
    '<div class="oa-flow-connector">' +
    '<div class="oa-flow-connector__line"></div>' +
    '<div class="oa-flow-connector__add" title="添加节点">+</div>' +
    '<div class="oa-flow-connector__line"></div>' +
    '</div>' +
    // 审批人节点2
    '<div class="oa-flow-node oa-flow-node--editable" data-node-id="node-2" onclick="window.location.hash=\'#!/workflow/create/flow/approver\'">' +
    '<div class="oa-flow-node__header oa-flow-node__header--approver">' +
    '<div class="oa-flow-node__icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg></div>' +
    '<span class="oa-flow-node__title">审批人</span>' +
    '<span class="oa-flow-node__edit"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2l4 4-8 8H2v-4l8-8z"/></svg></span>' +
    '</div>' +
    '<div class="oa-flow-node__body">' +
    '<div class="oa-flow-node__desc">HRBP</div>' +
    '<div class="oa-flow-node__tags">' +
    '<span class="oa-flow-node__tag">会签</span>' +
    '</div>' +
    '</div>' +
    '<button type="button" class="oa-flow-node__delete" title="删除"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>' +
    '</div>' +
    // 连接线
    '<div class="oa-flow-connector">' +
    '<div class="oa-flow-connector__line"></div>' +
    '<div class="oa-flow-connector__add" title="添加节点">+</div>' +
    '<div class="oa-flow-connector__line"></div>' +
    '</div>' +
    // 抄送人节点
    '<div class="oa-flow-node oa-flow-node--editable" data-node-id="node-3" onclick="window.location.hash=\'#!/workflow/create/flow/approver\'">' +
    '<div class="oa-flow-node__header oa-flow-node__header--cc">' +
    '<div class="oa-flow-node__icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="4" width="12" height="8" rx="1"/><line x1="6" y1="8" x2="10" y2="8"/></svg></div>' +
    '<span class="oa-flow-node__title">抄送人</span>' +
    '<span class="oa-flow-node__edit"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2l4 4-8 8H2v-4l8-8z"/></svg></span>' +
    '</div>' +
    '<div class="oa-flow-node__body">' +
    '<div class="oa-flow-node__desc">人事专员</div>' +
    '</div>' +
    '<button type="button" class="oa-flow-node__delete" title="删除"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>' +
    '</div>' +
    // 结束节点
    '<div class="oa-flow-connector">' +
    '<div class="oa-flow-connector__line"></div>' +
    '</div>' +
    '<div class="oa-flow-node oa-flow-node--end">' +
    '<div class="oa-flow-node__header oa-flow-node__header--end">' +
    '<div class="oa-flow-node__icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="8" r="5"/></svg></div>' +
    '<span class="oa-flow-node__title">结束</span>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // 右侧属性面板
    '<div class="oa-flow-properties">' +
    '<div class="oa-flow-properties__header">' +
    '<span class="oa-flow-properties__title">流程属性</span>' +
    '</div>' +
    '<div class="oa-flow-properties__body">' +
    '<div class="oa-flow-properties__section">' +
    '<div class="oa-flow-properties__label">流程名称</div>' +
    '<input type="text" class="oa-flow-properties__input" value="请假申请审批流程" placeholder="请输入流程名称" />' +
    '</div>' +
    '<div class="oa-flow-properties__section">' +
    '<div class="oa-flow-properties__label">流程说明</div>' +
    '<textarea class="oa-flow-properties__textarea" placeholder="请输入流程说明">员工提交请假申请后的审批流程</textarea>' +
    '</div>' +
    '<div class="oa-flow-properties__section">' +
    '<div class="oa-flow-properties__label">生效范围</div>' +
    '<div class="oa-flow-properties__tags">' +
    '<span class="oa-flow-properties__tag">全体员工</span>' +
    '<span class="oa-flow-properties__tag oa-flow-properties__tag--add">+ 添加</span>' +
    '</div>' +
    '</div>' +
    '<div class="oa-flow-properties__section">' +
    '<div class="oa-flow-properties__label">高级设置</div>' +
    '<div class="oa-flow-properties__toggle-row">' +
    '<span>允许撤回</span>' +
    '<span class="oa-flow-properties__toggle oa-flow-properties__toggle--on"></span>' +
    '</div>' +
    '<div class="oa-flow-properties__toggle-row">' +
    '<span>自动提醒</span>' +
    '<span class="oa-flow-properties__toggle oa-flow-properties__toggle--on"></span>' +
    '</div>' +
    '<div class="oa-flow-properties__toggle-row">' +
    '<span>审批时限</span>' +
    '<span class="oa-flow-properties__toggle"></span>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="oa-footer oa-footer--center">' +
    '<button type="button" class="oa-btn oa-btn--default" id="flowPrevStepBtn">上一步</button>' +
    '<button type="button" class="oa-btn oa-btn--default" id="flowSaveDraftBtn">保存草稿</button>' +
    '<button type="button" class="oa-btn oa-btn--primary" id="flowPublishBtn">发布流程</button>' +
    '</div>' +
    '</div>';
}

/**
 * OA审批流程 - 审批人设置面板 — 对应 Figma 1299:6324
 * 右侧滑出面板配置审批人/抄送人
 * 左侧保留完整的流程设置页面内容
 */
function mountOAApproverSettingsPanel() {
  var options = [
    { icon: '👤', text: '指定人员' },
    { icon: '👥', text: '指定部门' },
    { icon: '👔', text: '直属主管' },
    { icon: '🏢', text: '部门负责人' },
    { icon: '🔄', text: '连续多级' },
    { icon: '👤', text: '发起人自己' }
  ];

  // 默认选中"直属主管"（索引2），因为节点默认描述是"直属主管"
  var optionsHtml = options.map(function(o, idx) {
    var selectedClass = idx === 2 ? ' oa-approver-panel__option--selected' : '';
    return '<div class="oa-approver-panel__option' + selectedClass + '"><span class="oa-approver-panel__option-icon">' + o.icon + '</span><span class="oa-approver-panel__option-text">' + o.text + '</span></div>';
  }).join('');

  return '<div class="oa-page oa-page--no-nav oa-page--with-panel">' +
    '<nav class="oa-stepnav">' +
    '<a class="oa-stepnav__back" href="#!/workflow/create/form">←</a>' +
    '<div class="oa-stepnav__item">' +
    '<span class="oa-stepnav__number oa-stepnav__number--completed">✓</span>' +
    '<span class="oa-stepnav__label oa-stepnav__label--completed">基本设置</span>' +
    '</div>' +
    '<div class="oa-stepnav__line oa-stepnav__line--completed"></div>' +
    '<div class="oa-stepnav__item">' +
    '<span class="oa-stepnav__number oa-stepnav__number--completed">✓</span>' +
    '<span class="oa-stepnav__label oa-stepnav__label--completed">表单设计</span>' +
    '</div>' +
    '<div class="oa-stepnav__line oa-stepnav__line--completed"></div>' +
    '<div class="oa-stepnav__item">' +
    '<span class="oa-stepnav__number oa-stepnav__number--active">3</span>' +
    '<span class="oa-stepnav__label oa-stepnav__label--active">流程设置</span>' +
    '</div>' +
    '</nav>' +
    '<div class="oa-content oa-content--flow">' +
    // 左侧节点类型面板
    '<div class="oa-flow-panel">' +
    '<div class="oa-flow-panel__header">节点类型</div>' +
    '<div class="oa-flow-panel__body">' +
    '<div class="oa-flow-panel__item" draggable="true" data-node-type="approver">' +
    '<div class="oa-flow-panel__icon oa-flow-panel__icon--approver"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg></div>' +
    '<span class="oa-flow-panel__text">审批人</span>' +
    '</div>' +
    '<div class="oa-flow-panel__item" draggable="true" data-node-type="cc">' +
    '<div class="oa-flow-panel__icon oa-flow-panel__icon--cc"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="4" width="12" height="8" rx="1"/><line x1="6" y1="8" x2="10" y2="8"/></svg></div>' +
    '<span class="oa-flow-panel__text">抄送人</span>' +
    '</div>' +
    '<div class="oa-flow-panel__item" draggable="true" data-node-type="condition">' +
    '<div class="oa-flow-panel__icon oa-flow-panel__icon--condition"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 2l8 6-8 6z"/></svg></div>' +
    '<span class="oa-flow-panel__text">条件分支</span>' +
    '</div>' +
    '<div class="oa-flow-panel__item" draggable="true" data-node-type="notify">' +
    '<div class="oa-flow-panel__icon oa-flow-panel__icon--notify"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M8 2v1M8 13v1M2 8H1M15 8h-1M4 4L3 3M13 13l-1-1M4 12l-1 1M13 3l-1 1"/><circle cx="8" cy="8" r="3"/></svg></div>' +
    '<span class="oa-flow-panel__text">通知</span>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // 中间流程画布
    '<div class="oa-flow-canvas">' +
    '<div class="oa-flow-canvas__toolbar">' +
    '<span class="oa-flow-canvas__status">' +
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" style="width:14px;height:14px;color:#ff844b"><circle cx="8" cy="8" r="6"/><line x1="8" y1="5" x2="8" y2="8"/><circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"/></svg>' +
    '草稿' +
    '</span>' +
    '</div>' +
    '<div class="oa-flow-canvas__content" id="flowCanvas">' +
    // 发起人节点
    '<div class="oa-flow-node" data-node-id="node-initiator">' +
    '<div class="oa-flow-node__header oa-flow-node__header--initiator">' +
    '<div class="oa-flow-node__icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg></div>' +
    '<span class="oa-flow-node__title">发起人</span>' +
    '</div>' +
    '<div class="oa-flow-node__body">' +
    '<div class="oa-flow-node__desc">全员可见</div>' +
    '</div>' +
    '</div>' +
    // 连接线
    '<div class="oa-flow-connector">' +
    '<div class="oa-flow-connector__line"></div>' +
    '<div class="oa-flow-connector__add" title="添加节点">+</div>' +
    '<div class="oa-flow-connector__line"></div>' +
    '</div>' +
    // 审批人节点（高亮选中状态）
    '<div class="oa-flow-node oa-flow-node--editable oa-flow-node--selected" data-node-id="node-1">' +
    '<div class="oa-flow-node__header oa-flow-node__header--approver">' +
    '<div class="oa-flow-node__icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg></div>' +
    '<span class="oa-flow-node__title">审批人</span>' +
    '<span class="oa-flow-node__edit"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2l4 4-8 8H2v-4l8-8z"/></svg></span>' +
    '</div>' +
    '<div class="oa-flow-node__body">' +
    '<div class="oa-flow-node__desc">直属主管</div>' +
    '<div class="oa-flow-node__tags">' +
    '<span class="oa-flow-node__tag">或签</span>' +
    '</div>' +
    '</div>' +
    '<button type="button" class="oa-flow-node__delete" title="删除"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>' +
    '</div>' +
    // 连接线
    '<div class="oa-flow-connector">' +
    '<div class="oa-flow-connector__line"></div>' +
    '<div class="oa-flow-connector__add" title="添加节点">+</div>' +
    '<div class="oa-flow-connector__line"></div>' +
    '</div>' +
    // 审批人节点2
    '<div class="oa-flow-node oa-flow-node--editable" data-node-id="node-2">' +
    '<div class="oa-flow-node__header oa-flow-node__header--approver">' +
    '<div class="oa-flow-node__icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg></div>' +
    '<span class="oa-flow-node__title">审批人</span>' +
    '<span class="oa-flow-node__edit"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2l4 4-8 8H2v-4l8-8z"/></svg></span>' +
    '</div>' +
    '<div class="oa-flow-node__body">' +
    '<div class="oa-flow-node__desc">HRBP</div>' +
    '<div class="oa-flow-node__tags">' +
    '<span class="oa-flow-node__tag">会签</span>' +
    '</div>' +
    '</div>' +
    '<button type="button" class="oa-flow-node__delete" title="删除"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>' +
    '</div>' +
    // 连接线
    '<div class="oa-flow-connector">' +
    '<div class="oa-flow-connector__line"></div>' +
    '<div class="oa-flow-connector__add" title="添加节点">+</div>' +
    '<div class="oa-flow-connector__line"></div>' +
    '</div>' +
    // 抄送人节点
    '<div class="oa-flow-node oa-flow-node--editable" data-node-id="node-3">' +
    '<div class="oa-flow-node__header oa-flow-node__header--cc">' +
    '<div class="oa-flow-node__icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="4" width="12" height="8" rx="1"/><line x1="6" y1="8" x2="10" y2="8"/></svg></div>' +
    '<span class="oa-flow-node__title">抄送人</span>' +
    '<span class="oa-flow-node__edit"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2l4 4-8 8H2v-4l8-8z"/></svg></span>' +
    '</div>' +
    '<div class="oa-flow-node__body">' +
    '<div class="oa-flow-node__desc">人事专员</div>' +
    '</div>' +
    '<button type="button" class="oa-flow-node__delete" title="删除"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>' +
    '</div>' +
    // 结束节点
    '<div class="oa-flow-connector">' +
    '<div class="oa-flow-connector__line"></div>' +
    '</div>' +
    '<div class="oa-flow-node oa-flow-node--end">' +
    '<div class="oa-flow-node__header oa-flow-node__header--end">' +
    '<div class="oa-flow-node__icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="8" r="5"/></svg></div>' +
    '<span class="oa-flow-node__title">结束</span>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // 右侧流程属性面板
    '<div class="oa-flow-properties">' +
    '<div class="oa-flow-properties__header">' +
    '<span class="oa-flow-properties__title">流程属性</span>' +
    '</div>' +
    '<div class="oa-flow-properties__body">' +
    '<div class="oa-flow-properties__section">' +
    '<div class="oa-flow-properties__label">流程名称</div>' +
    '<input type="text" class="oa-flow-properties__input" value="请假申请审批流程" placeholder="请输入流程名称" />' +
    '</div>' +
    '<div class="oa-flow-properties__section">' +
    '<div class="oa-flow-properties__label">流程说明</div>' +
    '<textarea class="oa-flow-properties__textarea" placeholder="请输入流程说明">员工提交请假申请后的审批流程</textarea>' +
    '</div>' +
    '<div class="oa-flow-properties__section">' +
    '<div class="oa-flow-properties__label">生效范围</div>' +
    '<div class="oa-flow-properties__tags">' +
    '<span class="oa-flow-properties__tag">全体员工</span>' +
    '<span class="oa-flow-properties__tag oa-flow-properties__tag--add">+ 添加</span>' +
    '</div>' +
    '</div>' +
    '<div class="oa-flow-properties__section">' +
    '<div class="oa-flow-properties__label">高级设置</div>' +
    '<div class="oa-flow-properties__toggle-row">' +
    '<span>允许撤回</span>' +
    '<span class="oa-flow-properties__toggle oa-flow-properties__toggle--on"></span>' +
    '</div>' +
    '<div class="oa-flow-properties__toggle-row">' +
    '<span>自动提醒</span>' +
    '<span class="oa-flow-properties__toggle oa-flow-properties__toggle--on"></span>' +
    '</div>' +
    '<div class="oa-flow-properties__toggle-row">' +
    '<span>审批时限</span>' +
    '<span class="oa-flow-properties__toggle"></span>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    // 右侧滑出的审批人设置面板
    '<div class="oa-approver-panel">' +
    '<header class="oa-approver-panel__header">' +
    '<span class="oa-approver-panel__close" id="approverCloseBtn">×</span>' +
    '<h2 class="oa-approver-panel__title">审批人设置</h2>' +
    '</header>' +
    '<div class="oa-approver-panel__content">' +
    '<div class="oa-approver-panel__section">' +
    '<h3 class="oa-approver-panel__section-title">选择审批方式</h3>' +
    '<div class="oa-approver-panel__grid">' + optionsHtml + '</div>' +
    '</div>' +
    '<div class="oa-approver-panel__section">' +
    '<h3 class="oa-approver-panel__section-title">审批方式</h3>' +
    '<div style="display:flex;gap:16px">' +
    '<label style="display:flex;align-items:center;gap:8px;font-size:14px;color:#31373d">' +
    '<input type="radio" name="approveType" value="会签" /> 会签（需所有人审批）' +
    '</label>' +
    '<label style="display:flex;align-items:center;gap:8px;font-size:14px;color:#31373d">' +
    '<input type="radio" name="approveType" value="或签" checked /> 或签（一人审批即可）' +
    '</label>' +
    '</div>' +
    '</div>' +
    '<div class="oa-approver-panel__section">' +
    '<h3 class="oa-approver-panel__section-title">已选人员</h3>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
    '<span class="oa-tag oa-tag--default">张三 <a href="#" style="margin-left:4px">×</a></span>' +
    '<span class="oa-tag oa-tag--default">李四 <a href="#" style="margin-left:4px">×</a></span>' +
    '<span class="oa-tag oa-tag--add">+ 添加人员</span>' +
    '</div>' +
    '</div>' +
    '<div class="oa-approver-panel__section">' +
    '<h3 class="oa-approver-panel__section-title">高级设置</h3>' +
    '<div class="oa-approver-panel__toggles">' +
    '<div class="oa-approver-panel__toggle-row">' +
    '<span>允许转交</span>' +
    '<span class="oa-approver-panel__toggle"></span>' +
    '</div>' +
    '<div class="oa-approver-panel__toggle-row">' +
    '<span>自动提醒</span>' +
    '<span class="oa-approver-panel__toggle oa-approver-panel__toggle--on"></span>' +
    '</div>' +
    '<div class="oa-approver-panel__toggle-row">' +
    '<span>审批时限</span>' +
    '<span class="oa-approver-panel__toggle"></span>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<footer class="oa-approver-panel__footer">' +
    '<button type="button" class="oa-approver-panel__btn oa-approver-panel__btn--cancel" id="approverCancelBtn">取消</button>' +
    '<button type="button" class="oa-approver-panel__btn oa-approver-panel__btn--save" id="approverSaveBtn">确定</button>' +
    '</footer>' +
    '</div>' +
    // 底部操作栏
    '<div class="oa-footer oa-footer--center">' +
    '<button type="button" class="oa-btn oa-btn--default" id="flowPrevStepBtn">上一步</button>' +
    '<button type="button" class="oa-btn oa-btn--default" id="flowSaveDraftBtn">保存草稿</button>' +
    '<button type="button" class="oa-btn oa-btn--primary" id="flowPublishBtn">发布流程</button>' +
    '</div>' +
    '</div>';
}

function buildRegistry() {
  return {
    leaves: [
      { path: "/workbench", chain: [{ label: "工作台" }], item: { label: "工作台" } },
      { path: "/my-apply", chain: [{ label: "我的申请" }], item: { label: "申请列表" } },
      { path: "/my-apply/leave", chain: [{ label: "我的申请" }, { label: "请假" }], item: { label: "请假" } },
      { path: "/my-apply/trip", chain: [{ label: "我的申请" }, { label: "出差" }], item: { label: "出差" } },
      { path: "/my-apply/transfer-salary", chain: [{ label: "我的申请" }, { label: "调岗调薪" }], item: { label: "调岗调薪" } },
      { path: "/my-apply/start", chain: [{ label: "我的申请" }, { label: "发起申请" }], item: { label: "发起申请" } },
      { path: "/personalization/layout", chain: [{ label: "门户首页" }, { label: "个性化布局" }], item: { label: "个性化布局" } },
      { path: "/kpi-board/compare", chain: [{ label: "绩效看板" }, { label: "对比分析" }], item: { label: "对比分析" } },
      { path: "/performance", chain: [{ label: "绩效看板" }], item: { label: "绩效看板" } },
      { path: "/performance", chain: [{ label: "绩效看板" }], item: { label: "绩效看板" } },
      { path: "/performance/work-orders", chain: [{ label: "绩效看板" }, { label: "工单总量" }], item: { label: "工单总量" } },
      { path: "/performance/task-completion", chain: [{ label: "绩效看板" }, { label: "任务完成率" }], item: { label: "任务完成率" } },
      { path: "/performance/settings", chain: [{ label: "绩效看板" }, { label: "绩效设置" }], item: { label: "绩效设置" } },
      { path: "/performance/score", chain: [{ label: "绩效看板" }, { label: "绩效得分" }], item: { label: "绩效得分" } },
      { path: "/recruit", chain: [{ label: "招聘管理" }], item: { label: "招聘管理" } },
      { path: "/recruit/candidate", chain: [{ label: "招聘管理" }, { label: "候选人列表" }], item: { label: "候选人列表" } },
      { path: "/recruit/position", chain: [{ label: "招聘管理" }, { label: "职位管理" }], item: { label: "职位管理" } },
      { path: "/recruit/interview", chain: [{ label: "招聘管理" }, { label: "面试安排" }], item: { label: "面试安排" } },
      { path: "/recruit/offer", chain: [{ label: "招聘管理" }, { label: "Offer管理" }], item: { label: "Offer管理" } },
      { path: "/workflow", chain: [{ label: "流程中心" }], item: { label: "流程中心" } },
      { path: "/workflow/create", chain: [{ label: "流程中心" }, { label: "新建流程" }], item: { label: "基本设置" } },
      { path: "/workflow/create/form", chain: [{ label: "流程中心" }, { label: "新建流程" }], item: { label: "表单设计" } },
      { path: "/workflow/create/flow", chain: [{ label: "流程中心" }, { label: "新建流程" }], item: { label: "流程设置" } },
      { path: "/workflow/create/flow/approver", chain: [{ label: "流程中心" }, { label: "新建流程" }], item: { label: "审批人设置" } },
      { path: "/messages", chain: [{ label: "消息中心" }], item: { label: "消息列表" } },
      {
        path: "/inbox",
        chain: [{ label: "待办 / 已办" }, { label: "待办任务" }],
        item: { label: "待办任务" },
      },
      {
        path: "/inbox/done",
        chain: [{ label: "待办 / 已办" }, { label: "已办任务" }],
        item: { label: "已办任务" },
      },
      {
        path: "/org/structure/info",
        chain: [{ label: "组织管理" }, { label: "组织信息" }],
        item: { label: "组织信息" },
      },
      {
        path: "/org/structure/dept",
        chain: [{ label: "组织管理" }, { label: "部门管理" }],
        item: { label: "部门管理" },
      },
      {
        path: "/org/positions/info",
        chain: [{ label: "组织管理" }, { label: "岗位设置" }],
        item: { label: "岗位设置" },
      },
      {
        path: "/staff/roster",
        chain: [{ label: "员工管理" }, { label: "员工花名册" }],
        item: { label: "员工花名册" },
      },
      {
        path: "/staff/onboarding",
        chain: [{ label: "员工管理" }, { label: "入职办理" }],
        item: { label: "入职办理" },
      },
      {
        path: "/staff/probation",
        chain: [{ label: "员工管理" }, { label: "转正申请" }],
        item: { label: "转正申请" },
      },
      {
        path: "/staff/transfer",
        chain: [{ label: "员工管理" }, { label: "调岗调薪" }],
        item: { label: "调岗调薪" },
      },
      {
        path: "/staff/offboarding",
        chain: [{ label: "员工管理" }, { label: "离职办理" }],
        item: { label: "离职办理" },
      },
      {
        path: "/system/roles",
        chain: [{ label: "系统设置" }, { label: "角色管理" }],
        item: { label: "角色管理" },
      },
      {
        path: "/system/permissions",
        chain: [{ label: "系统设置" }, { label: "权限" }],
        item: { label: "权限" },
      },
      {
        path: "/system/config/dict",
        chain: [{ label: "系统设置" }, { label: "字典管理" }],
        item: { label: "字典管理" },
      },
      {
        path: "/system/integration",
        chain: [{ label: "系统设置" }, { label: "集成中心" }],
        item: { label: "集成中心" },
      },
      {
        path: "/system/logs",
        chain: [{ label: "系统设置" }, { label: "日志查询" }],
        item: { label: "日志查询" },
      },
      {
        path: "/system/snapshots",
        chain: [{ label: "系统设置" }, { label: "快照对比" }],
        item: { label: "快照对比" },
      },
      {
        path: "/attendance",
        chain: [{ label: "考勤管理" }],
        item: { label: "考勤记录" },
      },
      {
        path: "/salary",
        chain: [{ label: "薪酬管理" }],
        item: { label: "工资单" },
      },
      {
        path: "/training",
        chain: [{ label: "培训管理" }],
        item: { label: "培训计划" },
      },
      {
        path: "/settings",
        chain: [{ label: "个人设置" }],
        item: { label: "个人设置" },
      },
      {
        path: "/notfound",
        chain: [{ label: "页面不存在" }],
        item: { label: "404" },
      },
    ],
    renderers: {
      "/workbench": function () {
        return mountWorkbench();
      },
      "/workbench/layout": function () {
        return mountWorkbench();
      },
      "/workbench/quick": function () {
        return mountWorkbench();
      },
      "/workbench/favorites": function () {
        return mountWorkbench();
      },
      "/my-apply": function () {
        return mountOrgList({
          mountId: "hrms-my-apply-mount",
          path: "/my-apply",
          title: "我的申请",
          subtitle: "在途与已结申请统一查询；顶部摘要与列表、详情弹窗串联（演示数据）。",
          newLabel: "发起申请",
          formModal: "record",
          rowModal: "record",
          hideToolbar: false,
        });
      },
      "/my-apply/leave": function () {
        return mountLeavePage();
      },
      "/my-apply/trip": function () {
        return mountTripPage();
      },
      "/my-apply/transfer-salary": function () {
        return mountTransferSalaryPage();
      },
      "/my-apply/start": function () {
        return mountStartApplyPage();
      },
      "/personalization/layout": function () {
        return mountPersonalizationLayoutPage();
      },
      "/kpi-board/compare": function () {
        return mountCompareAnalysisPage();
      },
      "/org/structure/info": function () {
        return mountOrgList({
          mountId: "hrms-org-info-mount",
          path: "/org/structure/info",
          title: "组织信息",
          subtitle: "维护法人主体与证照信息，支撑部门与岗位挂载。",
          newLabel: "新建组织",
          formModal: "org-form",
          rowCtx: { 详情: "edit" },
        });
      },
      "/org/structure/dept": function () {
        return mountOrgList({
          mountId: "hrms-org-dept-mount",
          path: "/org/structure/dept",
          title: "部门管理",
          subtitle: "维护部门树、负责人与在岗人数，变更影响任职与权限缓存。",
          newLabel: "新建部门",
          formModal: "dept-form",
          rowCtx: { 详情: "edit" },
        });
      },
      "/org/positions/info": function () {
        return mountOrgList({
          mountId: "hrms-org-pos-mount",
          path: "/org/positions/info",
          title: "岗位设置",
          subtitle: "维护岗位、职级与编制；与招聘需求、员工任职关联。",
          newLabel: "新建岗位",
          formModal: "pos-form",
          rowCtx: { 详情: "edit" },
        });
      },
      /* 员工五页 ↔ Figma 列表：999:17015/16690 花名册，999:17080/16755 入职，999:17145/16820 转正，999:17210/16885 调岗，999:17275/16950 离职 */
      "/staff/roster": function () {
        return mountOrgList({
          mountId: "hrms-staff-roster-mount",
          path: "/staff/roster",
          title: "员工花名册",
          subtitle: "员工管理 · 花名册与侧栏摘要；支持筛选与行内详情（演示数据）。",
          newLabel: "新增人员",
          formModal: "staff-roster",
          rowModal: "staff-roster",
          staffHubAside: true,
        });
      },
      "/staff/onboarding": function () {
        return mountOrgList({
          mountId: "hrms-staff-onb-mount",
          path: "/staff/onboarding",
          title: "入职办理",
          subtitle: "从 Offer 确认、入职准备到到岗确认；与编制、合同与账号开通联动。",
          newLabel: "新建入职单",
          formModal: "staff-onboarding",
          rowModal: "staff-onboarding",
        });
      },
      "/staff/probation": function () {
        return mountOrgList({
          mountId: "hrms-staff-prob-mount",
          path: "/staff/probation",
          title: "转正申请",
          subtitle: "试用期考核与转正评审；通过后更新人员状态与薪酬档。",
          newLabel: "发起转正",
          formModal: "staff-probation",
          rowModal: "staff-probation",
        });
      },
      "/staff/transfer": function () {
        return mountOrgList({
          mountId: "hrms-staff-tr-mount",
          path: "/staff/transfer",
          title: "调岗调薪",
          subtitle: "岗位、汇报线与薪酬结构变更；需审批与生效日期。",
          newLabel: "发起申请",
          formModal: "staff-transfer",
          rowModal: "staff-transfer",
        });
      },
      "/staff/offboarding": function () {
        return mountOrgList({
          mountId: "hrms-staff-off-mount",
          path: "/staff/offboarding",
          title: "离职办理",
          subtitle: "离职面谈、交接清单、权限回收与离职证明开具。",
          newLabel: "新建离职单",
          formModal: "staff-offboarding",
          rowModal: "staff-offboarding",
        });
      },
      /* 系统设置 ↔ Figma：1087:4362 角色 / 4749 权限 / 5136 字典 / 5523 集成 / 5910 日志 / 6297 快照 */
      "/system/roles": function () {
        return mountOrgList({
          mountId: "hrms-sys-roles-mount",
          path: "/system/roles",
          title: "角色管理",
          subtitle: "维护预置与自定义角色，与菜单、数据权限策略关联。",
          newLabel: "新建角色",
          formModal: "role-form",
          rowModal: "role-form",
        });
      },
      "/system/permissions": function () {
        return mountOrgList({
          mountId: "hrms-sys-perm-mount",
          path: "/system/permissions",
          title: "权限",
          subtitle: "策略级授权与资源范围；可与「数据权限」分 Tab 扩展（对齐 Figma 权限画板）。",
          newLabel: "新建策略",
          formModal: "perm-form",
          rowModal: "perm-form",
          rowCtx: { 授权: "grant", 编辑: "edit", 详情: "view" },
        });
      },
      "/system/config/dict": function () {
        return mountOrgList({
          mountId: "hrms-sys-dict-mount",
          path: "/system/config/dict",
          title: "字典管理",
          subtitle: "统一枚举口径，供表单、流程与报表引用；发布前支持草稿。",
          newLabel: "新建字典",
          formModal: "dict-form",
          rowModal: "dict-form",
        });
      },
      "/system/integration": function () {
        return mountOrgList({
          mountId: "hrms-sys-int-mount",
          path: "/system/integration",
          title: "集成中心",
          subtitle: "外部系统连接器与健康状态；密钥轮换与同步任务监控。",
          newLabel: "注册连接器",
          formModal: "integration-form",
          rowModal: "integration-form",
        });
      },
      "/system/logs": function () {
        return mountOrgList({
          mountId: "hrms-sys-logs-mount",
          path: "/system/logs",
          title: "日志查询",
          subtitle: "审计登录、权限变更与集成同步；支持导出与高级筛选。",
          newLabel: "高级筛选",
          formModal: "log-filter",
          rowModal: "log-detail",
        });
      },
      "/system/snapshots": function () {
        return mountOrgList({
          mountId: "hrms-sys-snap-mount",
          path: "/system/snapshots",
          title: "快照对比",
          subtitle: "关键配置域的版本快照与差异对比，用于变更评审与回滚评估。",
          newLabel: "新建对比任务",
          formModal: "snapshot-run",
          rowModal: "snapshot-row",
          rowCtx: { 对比: "compare", 详情: "view" },
        });
      },
      "/performance": function () {
        return mountOrgList({
          mountId: "hrms-perf-mount",
          path: "/performance",
          title: "绩效看板",
          subtitle: "团队指标、趋势与排名摘要；右侧为图表占位，可接入真实分析服务。",
          hideToolbar: true,
          formModal: "record",
          rowModal: "record",
          performanceSplit: true,
        });
      },
      "/performance/work-orders": function () {
        return mountWorkOrdersPage();
      },
      "/performance/task-completion": function () {
        return mountTaskCompletionPage();
      },
      "/performance/settings": function () {
        return mountPerformanceSettingsPage();
      },
      "/performance/score": function () {
        return mountPerformanceScorePage();
      },
      "/messages": function () {
        return mountMessagesPage();
      },
      "/inbox": function () {
        return mountInboxPage(false);
      },
      "/inbox/done": function () {
        return mountInboxPage(true);
      },
      "/recruit": function () {
        return mountRecruitPage();
      },
      "/recruit/candidate": function () {
        return mountRecruitPage("candidate");
      },
      "/recruit/position": function () {
        return mountRecruitPage("position");
      },
      "/recruit/interview": function () {
        return mountRecruitPage("interview");
      },
      "/recruit/offer": function () {
        return mountRecruitPage("offer");
      },
      "/workflow": function () {
        return mountOrgList({
          mountId: "hrms-workflow-mount",
          path: "/workflow",
          title: "流程中心",
          subtitle: "流程定义、版本与发布状态；点击「设计」进入流程编辑。",
          newLabel: "新建流程",
          newHref: "/workflow/create",
          formModal: "workflow-form",
          rowModal: "workflow-form",
          designHref: "/workflow/create",
          workflowTimeline: true,
        });
      },
      "/workflow/create": function () {
        return mountOABasicSettingsPage();
      },
      "/workflow/create/form": function () {
        return mountOAFormDesignPage();
      },
      "/workflow/create/flow": function () {
        return mountOAFlowSettingsPage();
      },
      "/workflow/create/flow/approver": function () {
        return mountOAApproverSettingsPanel();
      },
      "/attendance": function () {
        return mountAttendancePage();
      },
      "/salary": function () {
        return mountSalaryPage();
      },
      "/training": function () {
        return mountTrainingPage();
      },
      "/settings": function () {
        return mountSettingsPage();
      },
      "/notfound": function () {
        return mountNotFoundPage();
      },
    },
  };
}

// ==================== 表单设计器拖拽功能 ====================
var formDesignerState = {
  fields: [],
  selectedFieldId: null,
  draggedControl: null,
  fieldCounter: 0,
  history: [],
  historyIndex: -1
};

function initFormDesigner() {
  // Tab切换
  var tabs = document.querySelectorAll('.oa-controls__tab');
  var tabContents = document.querySelectorAll('.oa-controls__content');

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var tabId = this.getAttribute('data-tab');

      // 切换tab激活状态
      tabs.forEach(function(t) { t.classList.remove('oa-controls__tab--active'); });
      this.classList.add('oa-controls__tab--active');

      // 切换内容显示
      tabContents.forEach(function(content) {
        content.classList.remove('oa-controls__content--active');
        if (content.id === 'tab-' + tabId) {
          content.classList.add('oa-controls__content--active');
        }
      });
    });
  });

  var controls = document.querySelectorAll('.oa-controls__item[draggable="true"]');
  var canvas = document.getElementById('formCanvas');
  var emptyState = document.getElementById('formEmpty');

  if (!canvas) return;

  // 初始化已有字段数据
  var existingFields = canvas.querySelectorAll('.oa-designer__field');
  existingFields.forEach(function(field) {
    var fieldId = field.getAttribute('data-field-id');
    if (fieldId) {
      formDesignerState.fields.push({
        id: fieldId,
        controlId: field.querySelector('.oa-designer__field-title')?.textContent?.toLowerCase() || 'text',
        title: field.querySelector('.oa-designer__field-title')?.textContent || '字段',
        placeholder: field.querySelector('.oa-designer__field-placeholder')?.textContent || '',
        required: false
      });
    }
  });

  // 控件拖拽开始
  controls.forEach(function(control) {
    control.addEventListener('dragstart', function(e) {
      formDesignerState.draggedControl = {
        id: this.getAttribute('data-control-id'),
        type: this.getAttribute('data-control-type'),
        text: this.getAttribute('data-control-text'),
        placeholder: this.getAttribute('data-control-placeholder')
      };
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'copy';
    });

    control.addEventListener('dragend', function() {
      this.classList.remove('dragging');
      formDesignerState.draggedControl = null;
    });

    // 点击也可以添加
    control.addEventListener('click', function() {
      var controlData = {
        id: this.getAttribute('data-control-id'),
        type: this.getAttribute('data-control-type'),
        text: this.getAttribute('data-control-text'),
        placeholder: this.getAttribute('data-control-placeholder')
      };
      addFieldToCanvas(controlData);
    });
  });

  // 画布拖拽接收
  canvas.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (emptyState) emptyState.classList.add('oa-designer__empty--drag-over');
  });

  canvas.addEventListener('dragleave', function() {
    if (emptyState) emptyState.classList.remove('oa-designer__empty--drag-over');
  });

  canvas.addEventListener('drop', function(e) {
    e.preventDefault();
    if (emptyState) emptyState.classList.remove('oa-designer__empty--drag-over');
    if (formDesignerState.draggedControl) {
      addFieldToCanvas(formDesignerState.draggedControl);
    }
  });

  // 绑定字段事件
  bindFieldEvents();

  // 设备切换（手机端/PC端）
  var deviceBtns = document.querySelectorAll('.oa-designer__device-btn');
  deviceBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      deviceBtns.forEach(function(b) { b.classList.remove('oa-designer__device-btn--active'); });
      this.classList.add('oa-designer__device-btn--active');

      var phoneFrame = document.querySelector('.oa-designer__phone-frame');
      if (phoneFrame) {
        var isPC = this.getAttribute('title') === 'PC端';
        if (isPC) {
          phoneFrame.style.width = '100%';
          phoneFrame.style.maxWidth = '100%';
        } else {
          phoneFrame.style.width = '375px';
          phoneFrame.style.maxWidth = '375px';
        }
      }
    });
  });

  // 撤销功能
  var undoBtn = document.querySelector('.oa-designer__toolbar-btn:nth-of-type(1)');
  if (undoBtn) {
    undoBtn.addEventListener('click', function() {
      if (formDesignerState.historyIndex > 0) {
        formDesignerState.historyIndex--;
        restoreFromHistory();
        showToast('已撤销');
      } else {
        showToast('没有可撤销的操作');
      }
    });
  }

  // 重做功能
  var redoBtn = document.querySelector('.oa-designer__toolbar-btn:nth-of-type(2)');
  if (redoBtn) {
    redoBtn.addEventListener('click', function() {
      if (formDesignerState.historyIndex < formDesignerState.history.length - 1) {
        formDesignerState.historyIndex++;
        restoreFromHistory();
        showToast('已重做');
      } else {
        showToast('没有可重做的操作');
      }
    });
  }

  // 保存初始状态到历史
  saveToHistory();
}

function saveToHistory() {
  var canvas = document.getElementById('formCanvas');
  if (!canvas) return;

  // 删除历史中当前位置之后的所有状态
  formDesignerState.history = formDesignerState.history.slice(0, formDesignerState.historyIndex + 1);

  // 保存当前状态
  var fields = canvas.querySelectorAll('.oa-designer__field');
  var state = [];
  fields.forEach(function(field) {
    if (field.id !== 'formEmpty') {
      state.push({
        id: field.getAttribute('data-field-id'),
        html: field.outerHTML
      });
    }
  });

  formDesignerState.history.push(state);
  formDesignerState.historyIndex = formDesignerState.history.length - 1;

  // 限制历史记录数量
  if (formDesignerState.history.length > 50) {
    formDesignerState.history.shift();
    formDesignerState.historyIndex--;
  }
}

function restoreFromHistory() {
  var canvas = document.getElementById('formCanvas');
  var emptyState = document.getElementById('formEmpty');
  if (!canvas || formDesignerState.historyIndex < 0) return;

  var state = formDesignerState.history[formDesignerState.historyIndex];

  // 清除当前字段（保留空状态元素）
  var currentFields = canvas.querySelectorAll('.oa-designer__field');
  currentFields.forEach(function(f) {
    if (f.id !== 'formEmpty') {
      f.remove();
    }
  });

  // 恢复历史状态
  if (state && state.length > 0) {
    state.forEach(function(item) {
      canvas.insertAdjacentHTML('beforeend', item.html);
    });
    if (emptyState) emptyState.style.display = 'none';
  } else {
    if (emptyState) emptyState.style.display = 'flex';
  }

  // 重新绑定字段事件
  bindFieldEvents();
}

function showToast(message) {
  if (typeof window.HrmsAppShellToast === 'function') {
    window.HrmsAppShellToast(message, 'info');
  }
}

function addFieldToCanvas(controlData) {
  var canvas = document.getElementById('formCanvas');
  var emptyState = document.getElementById('formEmpty');
  if (!canvas) return;

  // 隐藏空状态
  if (emptyState) emptyState.style.display = 'none';

  // 创建新字段 ID
  formDesignerState.fieldCounter++;
  var fieldId = 'field-' + Date.now() + '-' + formDesignerState.fieldCounter;

  // 创建字段元素
  var fieldEl = document.createElement('div');
  fieldEl.className = 'oa-designer__field';
  fieldEl.setAttribute('data-field-id', fieldId);

  fieldEl.innerHTML =
    '<div class="oa-designer__field-header">' +
    '<div>' +
    '<div class="oa-designer__field-title">' + (controlData.text || '字段') + '</div>' +
    '<div class="oa-designer__field-placeholder">' + (controlData.placeholder || '请输入') + '</div>' +
    '</div>' +
    '<div class="oa-designer__field-actions">' +
    '<button class="oa-designer__field-action" title="上移" data-action="up"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 12V4M4 8l4-4 4 4"/></svg></button>' +
    '<button class="oa-designer__field-action" title="下移" data-action="down"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 4v8M4 8l4 4 4-4"/></svg></button>' +
    '<button class="oa-designer__field-action oa-designer__field-action--delete" title="删除" data-action="delete"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>' +
    '</div>' +
    '</div>';

  // 插入到空状态之前
  if (emptyState) {
    canvas.insertBefore(fieldEl, emptyState);
  } else {
    canvas.appendChild(fieldEl);
  }

  // 保存字段数据
  formDesignerState.fields.push({
    id: fieldId,
    controlId: controlData.id,
    title: controlData.text,
    placeholder: controlData.placeholder,
    required: false
  });

  // 绑定事件
  bindFieldEvents();

  // 选中新添加的字段
  selectField(fieldId);

  // 保存历史
  saveToHistory();

  // 显示提示
  if (typeof window.HrmsAppShellToast === 'function') {
    window.HrmsAppShellToast('已添加「' + controlData.text + '」控件', 'success');
  }
}

function bindFieldEvents() {
  var fields = document.querySelectorAll('.oa-designer__field');

  fields.forEach(function(field) {
    // 点击选中
    field.addEventListener('click', function(e) {
      if (e.target.closest('.oa-designer__field-action')) return;
      var fieldId = this.getAttribute('data-field-id');
      selectField(fieldId);
    });

    // 操作按钮
    var actions = field.querySelectorAll('.oa-designer__field-action');
    actions.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var action = this.getAttribute('data-action');
        var fieldEl = this.closest('.oa-designer__field');
        var fieldId = fieldEl.getAttribute('data-field-id');

        if (action === 'delete') {
          deleteField(fieldId, fieldEl);
        } else if (action === 'up') {
          moveField(fieldEl, 'up');
        } else if (action === 'down') {
          moveField(fieldEl, 'down');
        }
      });
    });
  });
}

function selectField(fieldId) {
  // 移除之前的选中状态
  document.querySelectorAll('.oa-designer__field--selected').forEach(function(f) {
    f.classList.remove('oa-designer__field--selected');
  });

  // 设置新的选中状态
  var field = document.querySelector('.oa-designer__field[data-field-id="' + fieldId + '"]');
  if (field) {
    field.classList.add('oa-designer__field--selected');
    formDesignerState.selectedFieldId = fieldId;

    // 更新右侧属性面板
    var fieldData = formDesignerState.fields.find(function(f) { return f.id === fieldId; });
    if (fieldData) {
      updatePropertiesPanel(fieldData);
    }
  }
}

function deleteField(fieldId, fieldEl) {
  // 动画效果
  fieldEl.style.transition = 'opacity 0.2s, transform 0.2s';
  fieldEl.style.opacity = '0';
  fieldEl.style.transform = 'translateX(-20px)';

  setTimeout(function() {
    fieldEl.remove();
    // 从数据中移除
    formDesignerState.fields = formDesignerState.fields.filter(function(f) { return f.id !== fieldId; });

    // 检查是否需要显示空状态
    var canvas = document.getElementById('formCanvas');
    var emptyState = document.getElementById('formEmpty');
    var remainingFields = canvas.querySelectorAll('.oa-designer__field');

    if (remainingFields.length === 0 && emptyState) {
      emptyState.style.display = 'flex';
    }

    // 清除选中状态
    formDesignerState.selectedFieldId = null;
    clearPropertiesPanel();

    // 保存历史
    saveToHistory();

    if (typeof window.HrmsAppShellToast === 'function') {
      window.HrmsAppShellToast('已删除字段', 'success');
    }
  }, 200);
}

function moveField(fieldEl, direction) {
  var canvas = document.getElementById('formCanvas');

  if (direction === 'up' && fieldEl.previousElementSibling && !fieldEl.previousElementSibling.classList.contains('oa-designer__empty')) {
    canvas.insertBefore(fieldEl, fieldEl.previousElementSibling);
    saveToHistory();
  } else if (direction === 'down' && fieldEl.nextElementSibling && !fieldEl.nextElementSibling.classList.contains('oa-designer__empty')) {
    canvas.insertBefore(fieldEl.nextElementSibling, fieldEl);
    saveToHistory();
  }
}

function updatePropertiesPanel(fieldData) {
  var headerIcon = document.querySelector('.oa-properties__header-icon');
  var headerTitle = document.querySelector('.oa-properties__header-title');
  var propTitle = document.getElementById('propTitle');
  var propPlaceholder = document.getElementById('propPlaceholder');
  var propTitleCount = document.getElementById('propTitleCount');
  var propPlaceholderCount = document.getElementById('propPlaceholderCount');
  var propRequired = document.getElementById('propRequired');

  if (headerIcon) headerIcon.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="10" y2="12"/></svg>';
  if (headerTitle) headerTitle.textContent = fieldData.title;
  if (propTitle) propTitle.value = fieldData.title;
  if (propPlaceholder) propPlaceholder.value = fieldData.placeholder || '';
  if (propTitleCount) propTitleCount.textContent = (fieldData.title || '').length;
  if (propPlaceholderCount) propPlaceholderCount.textContent = (fieldData.placeholder || '').length;

  // 必填状态
  if (propRequired) {
    if (fieldData.required) {
      propRequired.classList.add('oa-properties__toggle--on');
    } else {
      propRequired.classList.remove('oa-properties__toggle--on');
    }
  }

  // 绑定属性输入事件
  if (propTitle) {
    propTitle.oninput = function() {
      fieldData.title = this.value;
      var fieldEl = document.querySelector('.oa-designer__field[data-field-id="' + fieldData.id + '"] .oa-designer__field-title');
      if (fieldEl) fieldEl.textContent = this.value;
      if (propTitleCount) propTitleCount.textContent = this.value.length;
      if (headerTitle) headerTitle.textContent = this.value;
      saveToHistory();
    };
  }

  if (propPlaceholder) {
    propPlaceholder.oninput = function() {
      fieldData.placeholder = this.value;
      var fieldEl = document.querySelector('.oa-designer__field[data-field-id="' + fieldData.id + '"] .oa-designer__field-placeholder');
      if (fieldEl) fieldEl.textContent = this.value;
      if (propPlaceholderCount) propPlaceholderCount.textContent = this.value.length;
      saveToHistory();
    };
  }

  // 必填切换
  if (propRequired) {
    propRequired.onclick = function() {
      fieldData.required = !fieldData.required;
      this.classList.toggle('oa-properties__toggle--on');
      saveToHistory();
    };
  }
}

function clearPropertiesPanel() {
  var headerIcon = document.querySelector('.oa-properties__header-icon');
  var headerTitle = document.querySelector('.oa-properties__header-title');
  var propTitle = document.getElementById('propTitle');
  var propPlaceholder = document.getElementById('propPlaceholder');

  if (headerIcon) headerIcon.textContent = '?';
  if (headerTitle) headerTitle.textContent = '请选择字段';
  if (propTitle) propTitle.value = '';
  if (propPlaceholder) propPlaceholder.value = '';
}

window.HrmsPageRegistry = {
  buildRegistry: buildRegistry,
  normalizePath: normalizePath,
  escapeHtml: escapeHtml,
  renderNotImplemented: renderNotImplemented,
  initFormDesigner: initFormDesigner,
  initBasicSettings: initBasicSettings,
  initFlowSettings: initFlowSettings,
  initApproverSettings: initApproverSettings,
};

// ==================== 流程设置页面交互 ====================
var flowSettingsState = {
  nodes: [],
  nodeIdCounter: 3
};

function initFlowSettings() {
  var canvas = document.getElementById('flowCanvas');
  if (!canvas) return;

  // 重置状态，防止页面重新渲染时数据重复
  flowSettingsState.nodes = [];
  flowSettingsState.nodeIdCounter = 3;

  // 初始化节点数据
  var existingNodes = canvas.querySelectorAll('.oa-flow-node[data-node-id]');
  existingNodes.forEach(function(node) {
    var nodeId = node.getAttribute('data-node-id');
    if (nodeId && nodeId !== 'node-initiator') {
      var header = node.querySelector('.oa-flow-node__header');
      var type = 'approver';
      if (header) {
        if (header.classList.contains('oa-flow-node__header--cc')) {
          type = 'cc';
        } else if (header.classList.contains('oa-flow-node__header--condition')) {
          type = 'condition';
        } else if (header.classList.contains('oa-flow-node__header--notify')) {
          type = 'notify';
        }
      }
      var titleEl = node.querySelector('.oa-flow-node__title');
      var descEl = node.querySelector('.oa-flow-node__desc');
      flowSettingsState.nodes.push({
        id: nodeId,
        type: type,
        title: titleEl ? titleEl.textContent : '节点',
        desc: descEl ? descEl.textContent : ''
      });
      // 更新计数器以避免ID冲突
      var numMatch = nodeId.match(/node-(\d+)/);
      if (numMatch) {
        var num = parseInt(numMatch[1], 10);
        if (num > flowSettingsState.nodeIdCounter) {
          flowSettingsState.nodeIdCounter = num;
        }
      }
    }
  });

  // 绑定删除按钮事件
  bindFlowNodeEvents();

  // 绑定添加节点按钮事件
  var addBtns = document.querySelectorAll('.oa-flow-connector__add');
  addBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      // 显示节点类型选择菜单
      showAddNodeMenu(this.parentElement);
    });
  });

  // 绑定左侧节点类型点击事件
  var panelItems = document.querySelectorAll('.oa-flow-panel__item');
  panelItems.forEach(function(item) {
    item.addEventListener('click', function() {
      var nodeType = this.getAttribute('data-node-type');
      // 显示位置选择菜单
      showPositionMenu(nodeType);
    });
  });

  // 绑定流程属性面板开关事件
  var flowToggles = document.querySelectorAll('.oa-flow-properties__toggle');
  flowToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function() {
      var isOn = this.classList.contains('oa-flow-properties__toggle--on');
      this.classList.toggle('oa-flow-properties__toggle--on');

      var label = this.previousElementSibling ? this.previousElementSibling.textContent : '';

      if (typeof window.HrmsAppShellToast === 'function') {
        window.HrmsAppShellToast((isOn ? '已关闭：' : '已开启：') + label, 'info');
      }
    });
  });

  // 绑定流程属性面板添加标签事件
  var flowAddTag = document.querySelector('.oa-flow-properties__tag--add');
  if (flowAddTag) {
    flowAddTag.addEventListener('click', function() {
      if (typeof window.HrmsAppShellToast === 'function') {
        window.HrmsAppShellToast('打开范围选择器（演示）', 'info');
      }
    });
  }

  // 绑定底部按钮事件
  var prevBtn = document.getElementById('flowPrevStepBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      window.location.hash = '#!/workflow/create/form';
    });
  }

  var saveDraftBtn = document.getElementById('flowSaveDraftBtn');
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', function() {
      if (typeof window.HrmsAppShellToast === 'function') {
        window.HrmsAppShellToast('草稿已保存', 'success');
      }
    });
  }

  var publishBtn = document.getElementById('flowPublishBtn');
  if (publishBtn) {
    publishBtn.addEventListener('click', function() {
      if (typeof window.HrmsAppShellToast === 'function') {
        window.HrmsAppShellToast('流程已发布', 'success');
      }
      window.location.hash = '#!/workflow';
    });
  }
}

function bindFlowNodeEvents() {
  var nodes = document.querySelectorAll('.oa-flow-node--editable');
  nodes.forEach(function(node) {
    // 删除按钮
    var deleteBtn = node.querySelector('.oa-flow-node__delete');
    if (deleteBtn) {
      deleteBtn.onclick = function(e) {
        e.stopPropagation();
        e.preventDefault();
        deleteFlowNode(node);
        return false;
      };
    }
  });
}

function deleteFlowNode(nodeEl) {
  var nodeId = nodeEl.getAttribute('data-node-id');

  // 找到节点后面的连接线
  var nextConnector = nodeEl.nextElementSibling;

  // 动画效果
  nodeEl.style.transition = 'opacity 0.2s, transform 0.2s';
  nodeEl.style.opacity = '0';
  nodeEl.style.transform = 'scale(0.9)';

  setTimeout(function() {
    // 移除节点
    nodeEl.remove();

    // 移除节点后面的连接线（保留前面的连接线以维持流程连贯性）
    if (nextConnector && nextConnector.classList.contains('oa-flow-connector')) {
      nextConnector.remove();
    }

    // 从数据中移除
    flowSettingsState.nodes = flowSettingsState.nodes.filter(function(n) {
      return n.id !== nodeId;
    });

    // 重新绑定事件
    bindFlowNodeEvents();

    if (typeof window.HrmsAppShellToast === 'function') {
      window.HrmsAppShellToast('已删除节点', 'success');
    }
  }, 200);
}

function showAddNodeMenu(connector) {
  // 移除已存在的菜单
  var existingMenu = document.querySelector('.oa-flow-node-menu');
  if (existingMenu) existingMenu.remove();

  var menuHtml = '<div class="oa-flow-node-menu">' +
    '<div class="oa-flow-node-menu__item" data-type="approver" title="审批人">' +
    '<div class="oa-flow-node-menu__icon oa-flow-node-menu__icon--approver"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg></div>' +
    '</div>' +
    '<div class="oa-flow-node-menu__item" data-type="cc" title="抄送人">' +
    '<div class="oa-flow-node-menu__icon oa-flow-node-menu__icon--cc"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="4" width="12" height="8" rx="1"/><line x1="6" y1="8" x2="10" y2="8"/></svg></div>' +
    '</div>' +
    '<div class="oa-flow-node-menu__item" data-type="condition" title="条件分支">' +
    '<div class="oa-flow-node-menu__icon oa-flow-node-menu__icon--condition"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 2l8 6-8 6z"/></svg></div>' +
    '</div>' +
    '<div class="oa-flow-node-menu__item" data-type="notify" title="通知">' +
    '<div class="oa-flow-node-menu__icon oa-flow-node-menu__icon--notify"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M8 2v1M8 13v1M2 8H1M15 8h-1M4 4L3 3M13 13l-1-1M4 12l-1 1M13 3l-1 1"/><circle cx="8" cy="8" r="3"/></svg></div>' +
    '</div>' +
    '</div>';

  // 插入菜单
  connector.insertAdjacentHTML('afterbegin', menuHtml);

  var menu = connector.querySelector('.oa-flow-node-menu');

  // 绑定菜单项点击事件
  menuItems = menu.querySelectorAll('.oa-flow-node-menu__item');
  menuItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      var nodeType = this.getAttribute('data-type');
      menu.remove();
      addFlowNode(nodeType, connector);
    });
  });

  // 点击其他地方关闭菜单
  var closeMenu = function(e) {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(function() {
    document.addEventListener('click', closeMenu);
  }, 10);
}

// 显示位置选择菜单（从左侧节点类型点击后）
function showPositionMenu(nodeType) {
  // 移除已存在的菜单
  var existingMenu = document.querySelector('.oa-flow-position-menu');
  if (existingMenu) existingMenu.remove();

  var canvas = document.getElementById('flowCanvas');
  if (!canvas) return;

  // 获取所有连接线位置
  var connectors = canvas.querySelectorAll('.oa-flow-connector');
  var positions = [];
  var nodeIndex = 0;

  // 构建位置选项
  positions.push({ label: '发起人之后', connector: connectors[0] });
  nodeIndex = 1;

  connectors.forEach(function(conn, idx) {
    if (idx < connectors.length - 1) {
      var nextNode = conn.nextElementSibling;
      if (nextNode && nextNode.classList.contains('oa-flow-node')) {
        var titleEl = nextNode.querySelector('.oa-flow-node__title');
        var title = titleEl ? titleEl.textContent : '节点' + nodeIndex;
        if (idx + 1 < connectors.length) {
          positions.push({ label: title + '之后', connector: connectors[idx + 1] });
        }
        nodeIndex++;
      }
    }
  });

  var positionHtml = positions.map(function(p, idx) {
    return '<div class="oa-flow-position-menu__item" data-index="' + idx + '">' + p.label + '</div>';
  }).join('');

  // 计算菜单位置（画布中心上方）
  var canvasRect = canvas.getBoundingClientRect();

  var menuHtml = '<div class="oa-flow-position-menu" style="position:fixed;top:' + (canvasRect.top + 20) + 'px;left:' + (canvasRect.left + canvasRect.width / 2 - 100) + 'px;">' +
    '<div class="oa-flow-position-menu__title">选择插入位置</div>' +
    '<div class="oa-flow-position-menu__body">' + positionHtml + '</div>' +
    '</div>';

  // 添加到body
  document.body.insertAdjacentHTML('beforeend', menuHtml);
  var menu = document.body.lastElementChild;

  // 绑定位置选项点击事件
  var menuItems = menu.querySelectorAll('.oa-flow-position-menu__item');
  menuItems.forEach(function(item, idx) {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      var position = positions[idx];
      menu.remove();
      addFlowNode(nodeType, position.connector);
    });
  });

  // 点击其他地方关闭菜单
  var closeMenu = function(e) {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(function() {
    document.addEventListener('click', closeMenu);
  }, 10);
}

function addFlowNode(nodeType, afterConnector) {
  var canvas = document.getElementById('flowCanvas');
  if (!canvas) return;

  flowSettingsState.nodeIdCounter++;
  var nodeId = 'node-' + flowSettingsState.nodeIdCounter;

  var title, headerClass, desc;
  if (nodeType === 'approver') {
    title = '审批人';
    headerClass = 'oa-flow-node__header--approver';
    desc = '请选择审批人';
  } else if (nodeType === 'cc') {
    title = '抄送人';
    headerClass = 'oa-flow-node__header--cc';
    desc = '请选择抄送人';
  } else if (nodeType === 'condition') {
    title = '条件分支';
    headerClass = 'oa-flow-node__header--condition';
    desc = '请设置条件';
  } else {
    title = '通知';
    headerClass = 'oa-flow-node__header--notify';
    desc = '请设置通知';
  }

  // 创建节点HTML
  var nodeHtml = '<div class="oa-flow-node oa-flow-node--editable" data-node-id="' + nodeId + '" onclick="window.location.hash=\'#!/workflow/create/flow/approver\'">' +
    '<div class="oa-flow-node__header ' + headerClass + '">' +
    '<div class="oa-flow-node__icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="6" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg></div>' +
    '<span class="oa-flow-node__title">' + title + '</span>' +
    '<span class="oa-flow-node__edit"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2l4 4-8 8H2v-4l8-8z"/></svg></span>' +
    '</div>' +
    '<div class="oa-flow-node__body">' +
    '<div class="oa-flow-node__desc">' + desc + '</div>' +
    '</div>' +
    '<button type="button" class="oa-flow-node__delete" title="删除"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>' +
    '</div>';

  // 创建连接线HTML
  var connectorHtml = '<div class="oa-flow-connector">' +
    '<div class="oa-flow-connector__line"></div>' +
    '<div class="oa-flow-connector__add" title="添加节点">+</div>' +
    '<div class="oa-flow-connector__line"></div>' +
    '</div>';

  // 确定插入位置
  var insertTarget;
  if (afterConnector && afterConnector.classList && afterConnector.classList.contains('oa-flow-connector')) {
    // 如果指定了连接线，在该连接线后插入
    insertTarget = afterConnector;
  } else {
    // 否则在结束节点前的连接线处插入
    var endNode = canvas.querySelector('.oa-flow-node--end');
    if (endNode) {
      insertTarget = endNode.previousElementSibling;
      if (!insertTarget || !insertTarget.classList.contains('oa-flow-connector')) {
        insertTarget = endNode;
      }
    }
  }

  if (insertTarget) {
    insertTarget.insertAdjacentHTML('afterend', nodeHtml + connectorHtml);
  }

  // 添加到数据
  flowSettingsState.nodes.push({
    id: nodeId,
    type: nodeType,
    title: title,
    desc: desc
  });

  // 重新绑定事件
  bindFlowNodeEvents();

  // 绑定新添加的连接线按钮
  var newAddBtn = canvas.querySelector('.oa-flow-node[data-node-id="' + nodeId + '"] + .oa-flow-connector .oa-flow-connector__add');
  if (newAddBtn) {
    newAddBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      // 传入连接线容器（父元素），而不是按钮本身
      showAddNodeMenu(this.parentElement);
    });
  }

  if (typeof window.HrmsAppShellToast === 'function') {
    window.HrmsAppShellToast('已添加「' + title + '」节点', 'success');
  }
}

// ==================== 审批人设置面板交互 ====================
function initApproverSettings() {
  // 初始化流程设置的基础交互（删除节点、添加节点等）
  // initFlowSettings 已经绑定了底部按钮事件
  initFlowSettings();

  // 绑定节点点击事件（打开编辑面板）
  rebindNodeClickEvents();

  // 绑定审批人设置面板内的交互事件
  initApproverPanelEvents();
}

// 关闭审批人设置面板
function closeApproverPanel(saved) {
  var panel = document.querySelector('.oa-approver-panel');
  var selectedNode = document.querySelector('.oa-flow-node--selected');

  if (panel) {
    panel.style.transition = 'transform 0.3s ease';
    panel.style.transform = 'translateX(100%)';
    setTimeout(function() {
      panel.remove();
      // 面板移除后重新绑定节点点击事件
      rebindNodeClickEvents();
    }, 300);
  } else {
    // 如果面板不存在，直接重新绑定事件
    rebindNodeClickEvents();
  }

  // 移除节点选中状态
  if (selectedNode) {
    selectedNode.classList.remove('oa-flow-node--selected');
  }

  // 更新URL但不重新渲染
  if (window.location.hash.indexOf('/approver') > 0) {
    history.replaceState(null, '', '#!/workflow/create/flow');
  }

  if (saved && typeof window.HrmsAppShellToast === 'function') {
    window.HrmsAppShellToast('已保存设置', 'success');
  }
}

// 重新绑定节点点击事件（打开编辑面板）
function rebindNodeClickEvents() {
  var nodes = document.querySelectorAll('.oa-flow-node--editable');
  nodes.forEach(function(node) {
    node.onclick = function(e) {
      // 如果点击的是删除按钮，不打开编辑面板
      if (e.target.closest('.oa-flow-node__delete')) {
        return;
      }
      openApproverPanel(node);
    };
  });
}

// 打开审批人设置面板
function openApproverPanel(nodeEl) {
  // 移除其他节点的选中状态
  document.querySelectorAll('.oa-flow-node--selected').forEach(function(n) {
    n.classList.remove('oa-flow-node--selected');
  });

  // 添加选中状态
  nodeEl.classList.add('oa-flow-node--selected');

  // 检查是否已有面板
  if (document.querySelector('.oa-approver-panel')) {
    return;
  }

  // 更新URL
  history.replaceState(null, '', '#!/workflow/create/flow/approver');

  // 获取节点信息
  var nodeDesc = nodeEl.querySelector('.oa-flow-node__desc');
  var nodeTag = nodeEl.querySelector('.oa-flow-node__tag');
  var currentDesc = nodeDesc ? nodeDesc.textContent : '请选择审批人';
  var currentTag = nodeTag ? nodeTag.textContent : '或签';

  var options = [
    { icon: '👤', text: '指定人员' },
    { icon: '👥', text: '指定部门' },
    { icon: '👔', text: '直属主管' },
    { icon: '🏢', text: '部门负责人' },
    { icon: '🔄', text: '连续多级' },
    { icon: '👤', text: '发起人自己' }
  ];

  // 找到当前选中的选项
  var selectedOptionIndex = options.findIndex(function(o) { return o.text === currentDesc; });
  if (selectedOptionIndex < 0) selectedOptionIndex = 2; // 默认选择"直属主管"

  var optionsHtml = options.map(function(o, idx) {
    var selectedClass = idx === selectedOptionIndex ? ' oa-approver-panel__option--selected' : '';
    return '<div class="oa-approver-panel__option' + selectedClass + '"><span class="oa-approver-panel__option-icon">' + o.icon + '</span><span class="oa-approver-panel__option-text">' + o.text + '</span></div>';
  }).join('');

  var panelHtml = '<div class="oa-approver-panel">' +
    '<header class="oa-approver-panel__header">' +
    '<span class="oa-approver-panel__close" id="approverCloseBtn">×</span>' +
    '<h2 class="oa-approver-panel__title">审批人设置</h2>' +
    '</header>' +
    '<div class="oa-approver-panel__content">' +
    '<div class="oa-approver-panel__section">' +
    '<h3 class="oa-approver-panel__section-title">选择审批方式</h3>' +
    '<div class="oa-approver-panel__grid">' + optionsHtml + '</div>' +
    '</div>' +
    '<div class="oa-approver-panel__section">' +
    '<h3 class="oa-approver-panel__section-title">审批方式</h3>' +
    '<div style="display:flex;gap:16px">' +
    '<label style="display:flex;align-items:center;gap:8px;font-size:14px;color:#31373d">' +
    '<input type="radio" name="approveType" value="会签"' + (currentTag === '会签' ? ' checked' : '') + ' /> 会签（需所有人审批）' +
    '</label>' +
    '<label style="display:flex;align-items:center;gap:8px;font-size:14px;color:#31373d">' +
    '<input type="radio" name="approveType" value="或签"' + (currentTag === '或签' ? ' checked' : '') + ' /> 或签（一人审批即可）' +
    '</label>' +
    '</div>' +
    '</div>' +
    '<div class="oa-approver-panel__section">' +
    '<h3 class="oa-approver-panel__section-title">已选人员</h3>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
    '<span class="oa-tag oa-tag--default">张三 <a href="#" style="margin-left:4px">×</a></span>' +
    '<span class="oa-tag oa-tag--default">李四 <a href="#" style="margin-left:4px">×</a></span>' +
    '<span class="oa-tag oa-tag--add">+ 添加人员</span>' +
    '</div>' +
    '</div>' +
    '<div class="oa-approver-panel__section">' +
    '<h3 class="oa-approver-panel__section-title">高级设置</h3>' +
    '<div class="oa-approver-panel__toggles">' +
    '<div class="oa-approver-panel__toggle-row">' +
    '<span>允许转交</span>' +
    '<span class="oa-approver-panel__toggle" data-key="transfer"></span>' +
    '</div>' +
    '<div class="oa-approver-panel__toggle-row">' +
    '<span>自动提醒</span>' +
    '<span class="oa-approver-panel__toggle oa-approver-panel__toggle--on" data-key="remind"></span>' +
    '</div>' +
    '<div class="oa-approver-panel__toggle-row">' +
    '<span>审批时限</span>' +
    '<span class="oa-approver-panel__toggle" data-key="timeout"></span>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<footer class="oa-approver-panel__footer">' +
    '<button type="button" class="oa-approver-panel__btn oa-approver-panel__btn--cancel" id="approverCancelBtn">取消</button>' +
    '<button type="button" class="oa-approver-panel__btn oa-approver-panel__btn--save" id="approverSaveBtn">确定</button>' +
    '</footer>' +
    '</div>';

  // 找到oa-content容器并添加面板
  var content = document.querySelector('.oa-content--flow');
  if (content) {
    content.insertAdjacentHTML('beforeend', panelHtml);
  }

  // 初始化面板事件
  initApproverPanelEvents();
}

// 初始化审批人面板事件
function initApproverPanelEvents() {
  // 绑定审批方式选项点击事件
  var options = document.querySelectorAll('.oa-approver-panel__option');
  options.forEach(function(option) {
    option.addEventListener('click', function() {
      options.forEach(function(o) {
        o.classList.remove('oa-approver-panel__option--selected');
      });
      this.classList.add('oa-approver-panel__option--selected');

      var textEl = this.querySelector('.oa-approver-panel__option-text');
      var selectedText = textEl ? textEl.textContent : '';

      var selectedNode = document.querySelector('.oa-flow-node--selected');
      if (selectedNode) {
        var descEl = selectedNode.querySelector('.oa-flow-node__desc');
        if (descEl) {
          descEl.textContent = selectedText;
        }
      }

      if (typeof window.HrmsAppShellToast === 'function') {
        window.HrmsAppShellToast('已选择：' + selectedText, 'success');
      }
    });
  });

  // 绑定会签/或签切换事件
  var approveTypeRadios = document.querySelectorAll('input[name="approveType"]');
  approveTypeRadios.forEach(function(radio) {
    radio.addEventListener('change', function() {
      var tagText = this.value;

      var selectedNode = document.querySelector('.oa-flow-node--selected');
      if (selectedNode) {
        var tagEl = selectedNode.querySelector('.oa-flow-node__tag');
        if (tagEl) {
          tagEl.textContent = tagText;
        }
      }

      if (typeof window.HrmsAppShellToast === 'function') {
        window.HrmsAppShellToast('已切换为：' + tagText, 'success');
      }
    });
  });

  // 绑定开关点击事件
  var toggles = document.querySelectorAll('.oa-approver-panel__toggle');
  toggles.forEach(function(toggle) {
    toggle.addEventListener('click', function() {
      var isOn = this.classList.contains('oa-approver-panel__toggle--on');
      this.classList.toggle('oa-approver-panel__toggle--on');

      var label = this.previousElementSibling ? this.previousElementSibling.textContent : '';

      if (typeof window.HrmsAppShellToast === 'function') {
        window.HrmsAppShellToast((isOn ? '已关闭：' : '已开启：') + label, 'info');
      }
    });
  });

  // 绑定关闭按钮
  var closeBtn = document.getElementById('approverCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      closeApproverPanel(false);
    });
  }

  // 绑定取消按钮
  var cancelBtn = document.getElementById('approverCancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      closeApproverPanel(false);
    });
  }

  // 绑定人员标签删除事件
  var tagLinks = document.querySelectorAll('.oa-approver-panel__section .oa-tag a');
  tagLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var tag = this.parentElement;
      tag.style.transition = 'opacity 0.2s';
      tag.style.opacity = '0';
      setTimeout(function() {
        tag.remove();
        if (typeof window.HrmsAppShellToast === 'function') {
          window.HrmsAppShellToast('已移除人员', 'success');
        }
      }, 200);
      return false;
    });
  });

  // 绑定添加人员事件
  var addPersonTag = document.querySelector('.oa-approver-panel__section .oa-tag--add');
  if (addPersonTag) {
    addPersonTag.addEventListener('click', function() {
      if (typeof window.HrmsAppShellToast === 'function') {
        window.HrmsAppShellToast('打开人员选择器（演示）', 'info');
      }
    });
  }

  // 绑定确定按钮
  var saveBtn = document.getElementById('approverSaveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      closeApproverPanel(true);
    });
  }
}

// ==================== 基本设置页面交互 ====================
var basicSettingsState = {
  initiatorType: 'all',
  adminType: 'all',
  selectedInitiators: [],
  selectedAdmins: []
};

// 模拟人员列表
var mockPersons = [
  { id: '1', name: '张三', dept: '技术部', avatar: '' },
  { id: '2', name: '李四', dept: '人事部', avatar: '' },
  { id: '3', name: '王五', dept: '财务部', avatar: '' },
  { id: '4', name: '赵六', dept: '市场部', avatar: '' },
  { id: '5', name: '钱七', dept: '运营部', avatar: '' }
];

var currentSelectorType = 'initiator';
var tempSelectedIds = [];

function initBasicSettings() {
  // 表单说明字数统计
  var formDesc = document.getElementById('formDesc');
  var descCount = document.getElementById('descCount');
  if (formDesc && descCount) {
    formDesc.addEventListener('input', function() {
      descCount.textContent = this.value.length;
    });
  }

  // 谁可以发起 - 单选交互
  var initiatorOptions = document.querySelectorAll('#initiatorOptions .oa-basic-form__option');
  var addInitiatorBtn = document.getElementById('addInitiatorBtn');

  initiatorOptions.forEach(function(option) {
    option.addEventListener('click', function() {
      // 取消其他选中
      initiatorOptions.forEach(function(o) {
        o.classList.remove('oa-basic-form__option--checked');
        o.querySelector('.oa-basic-form__checkbox').classList.remove('oa-basic-form__checkbox--checked');
      });
      // 选中当前
      this.classList.add('oa-basic-form__option--checked');
      this.querySelector('.oa-basic-form__checkbox').classList.add('oa-basic-form__checkbox--checked');

      var value = this.getAttribute('data-value');
      basicSettingsState.initiatorType = value;

      // 显示/隐藏添加按钮
      if (value === 'specified') {
        addInitiatorBtn.classList.remove('oa-basic-form__add-btn--hidden');
      } else {
        addInitiatorBtn.classList.add('oa-basic-form__add-btn--hidden');
      }
    });
  });

  // 表单管理员 - 单选交互
  var adminOptions = document.querySelectorAll('#adminOptions .oa-basic-form__option');
  var addAdminBtn = document.getElementById('addAdminBtn');

  adminOptions.forEach(function(option) {
    option.addEventListener('click', function() {
      // 取消其他选中
      adminOptions.forEach(function(o) {
        o.classList.remove('oa-basic-form__option--checked');
        o.querySelector('.oa-basic-form__checkbox').classList.remove('oa-basic-form__checkbox--checked');
      });
      // 选中当前
      this.classList.add('oa-basic-form__option--checked');
      this.querySelector('.oa-basic-form__checkbox').classList.add('oa-basic-form__checkbox--checked');

      var value = this.getAttribute('data-value');
      basicSettingsState.adminType = value;

      // 显示/隐藏添加按钮
      if (value === 'specified') {
        addAdminBtn.classList.remove('oa-basic-form__add-btn--hidden');
      } else {
        addAdminBtn.classList.add('oa-basic-form__add-btn--hidden');
      }
    });
  });

  // 人员选择弹窗
  var personModal = document.getElementById('personModal');
  var closePersonModal = document.getElementById('closePersonModal');
  var cancelPersonBtn = document.getElementById('cancelPersonBtn');
  var confirmPersonBtn = document.getElementById('confirmPersonBtn');
  var personModalTitle = document.getElementById('personModalTitle');
  var personList = document.getElementById('personList');
  var personSearch = document.getElementById('personSearch');

  function openPersonModal(type) {
    currentSelectorType = type;
    tempSelectedIds = type === 'initiator' ? basicSettingsState.selectedInitiators.slice() : basicSettingsState.selectedAdmins.slice();
    personModalTitle.textContent = type === 'initiator' ? '选择发起成员' : '选择管理员';
    renderPersonList();
    personModal.style.display = 'flex';
  }

  function renderPersonList() {
    personList.innerHTML = mockPersons.map(function(p) {
      var isSelected = tempSelectedIds.indexOf(p.id) > -1;
      return '<div class="oa-person-item' + (isSelected ? ' oa-person-item--selected' : '') + '" data-id="' + p.id + '">' +
        '<div class="oa-person-item__avatar"><span>' + p.name.charAt(0) + '</span></div>' +
        '<div class="oa-person-item__info">' +
        '<div class="oa-person-item__name">' + p.name + '</div>' +
        '<div class="oa-person-item__dept">' + p.dept + '</div>' +
        '</div>' +
        '<div class="oa-person-item__check">' + (isSelected ? '✓' : '') + '</div>' +
        '</div>';
    }).join('');

    personList.querySelectorAll('.oa-person-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        var idx = tempSelectedIds.indexOf(id);
        if (idx > -1) {
          tempSelectedIds.splice(idx, 1);
          this.classList.remove('oa-person-item--selected');
          this.querySelector('.oa-person-item__check').textContent = '';
        } else {
          tempSelectedIds.push(id);
          this.classList.add('oa-person-item--selected');
          this.querySelector('.oa-person-item__check').textContent = '✓';
        }
      });
    });
  }

  // 添加发起成员按钮
  if (addInitiatorBtn) {
    addInitiatorBtn.addEventListener('click', function() {
      openPersonModal('initiator');
    });
  }

  // 添加管理员按钮
  if (addAdminBtn) {
    addAdminBtn.addEventListener('click', function() {
      openPersonModal('admin');
    });
  }

  // 关闭弹窗
  if (closePersonModal) {
    closePersonModal.addEventListener('click', function() {
      personModal.style.display = 'none';
    });
  }
  if (cancelPersonBtn) {
    cancelPersonBtn.addEventListener('click', function() {
      personModal.style.display = 'none';
    });
  }
  if (personModal) {
    personModal.querySelector('.oa-modal__overlay').addEventListener('click', function() {
      personModal.style.display = 'none';
    });
  }

  // 确认选择
  if (confirmPersonBtn) {
    confirmPersonBtn.addEventListener('click', function() {
      if (currentSelectorType === 'initiator') {
        basicSettingsState.selectedInitiators = tempSelectedIds.slice();
        renderSelectedPersons('initiator');
      } else {
        basicSettingsState.selectedAdmins = tempSelectedIds.slice();
        renderSelectedPersons('admin');
      }
      personModal.style.display = 'none';
    });
  }

  // 渲染已选人员
  function renderSelectedPersons(type) {
    var containerId = type === 'initiator' ? 'selectedInitiators' : 'selectedAdmins';
    var ids = type === 'initiator' ? basicSettingsState.selectedInitiators : basicSettingsState.selectedAdmins;
    var container = document.getElementById(containerId);
    if (!container) return;

    var html = ids.map(function(id) {
      var person = mockPersons.find(function(p) { return p.id === id; });
      if (!person) return '';
      return '<span class="oa-tag">' +
        '<span class="oa-tag__text">' + person.name + '</span>' +
        '<span class="oa-tag__close" data-id="' + id + '" data-type="' + type + '">×</span>' +
        '</span>';
    }).join('');
    container.innerHTML = html;

    // 绑定删除事件
    container.querySelectorAll('.oa-tag__close').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        var t = this.getAttribute('data-type');
        var arr = t === 'initiator' ? basicSettingsState.selectedInitiators : basicSettingsState.selectedAdmins;
        var idx = arr.indexOf(id);
        if (idx > -1) {
          arr.splice(idx, 1);
          renderSelectedPersons(t);
        }
      });
    });
  }

  // 搜索
  if (personSearch) {
    personSearch.addEventListener('input', function() {
      var keyword = this.value.toLowerCase();
      personList.querySelectorAll('.oa-person-item').forEach(function(item) {
        var name = item.querySelector('.oa-person-item__name').textContent.toLowerCase();
        item.style.display = name.indexOf(keyword) > -1 || !keyword ? 'flex' : 'none';
      });
    });
  }

  // 缩略图点击
  var formThumb = document.getElementById('formThumb');
  if (formThumb) {
    formThumb.addEventListener('click', function() {
      if (typeof window.HrmsAppShellToast === 'function') {
        window.HrmsAppShellToast('请上传表单缩略图', 'info');
      }
    });
  }

  // 预览按钮
  var previewBtn = document.getElementById('previewBtn');
  if (previewBtn) {
    previewBtn.addEventListener('click', function() {
      if (typeof window.HrmsAppShellToast === 'function') {
        window.HrmsAppShellToast('预览功能开发中', 'info');
      }
    });
  }

  // 下一步按钮
  var nextStepBtn = document.getElementById('nextStepBtn');
  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', function() {
      var formName = document.getElementById('formName');
      if (formName && !formName.value.trim()) {
        if (typeof window.HrmsAppShellToast === 'function') {
          window.HrmsAppShellToast('请填写表单名称', 'error');
        }
        formName.focus();
        return;
      }
      window.location.hash = '#!/workflow/create/form';
    });
  }

  // 保存草稿
  var saveDraftBtn = document.getElementById('saveDraftBtn');
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', function() {
      if (typeof window.HrmsAppShellToast === 'function') {
        window.HrmsAppShellToast('草稿已保存', 'success');
      }
    });
  }
}
