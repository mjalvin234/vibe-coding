/**
 * 后端未启动时：列表 / 工作台 / 消息等待办 / 弹窗 使用与 server.py 同步的嵌入 Mock。
 * 依赖 hrms-static-mock-embed.js、hrms-page-mock-embed.js（由 backend 脚本生成）。
 */
(function (g) {
  "use strict";

  var toastOnce = false;

  function afterOffline() {
    if (toastOnce) return;
    toastOnce = true;
    if (typeof g.HrmsAppShellToast === "function") {
      g.HrmsAppShellToast("后端未连接：已切换为离线演示数据，可继续浏览与操作（保存类动作为 Mock）。", "success");
    }
  }

  function clone(x) {
    return JSON.parse(JSON.stringify(x));
  }

  function cellsOfRow(r) {
    if (Array.isArray(r)) return r.map(String);
    if (r && typeof r === "object" && Array.isArray(r.cells)) return r.cells.map(String);
    return [];
  }

  function colIdx(cols, name) {
    var i = cols.indexOf(name);
    return i >= 0 ? i : -1;
  }

  /** 与 backend server._apply_page_query_filters 对齐（简化版） */
  function applyPageQueryFilters(body, query) {
    query = query || {};
    if (!body || !body.columns || body.rows == null) return body;
    var cols = body.columns;
    var rows = body.rows;
    var q = String(query.q || "")
      .trim()
      .toLowerCase();
    var st = String(query.status || "").trim();
    var lv = String(query.level || "").trim();
    var roleType = String(query.role_type || "").trim();
    var env = String(query.env || "").trim();
    var tag = String(query.tag || "")
      .trim()
      .toLowerCase();
    var ownerQ = String(query.owner_q || "")
      .trim()
      .toLowerCase();
    var nodeQ = String(query.node || "")
      .trim()
      .toLowerCase();
    var progQ = String(query.progress_q || "")
      .trim()
      .toLowerCase();
    var orgKind = String(query.org_kind || "").trim();
    if (!q && !st && !lv && !roleType && !env && !tag && !ownerQ && !nodeQ && !progQ && !orgKind) {
      return body;
    }

    var out = [];
    for (var ri = 0; ri < rows.length; ri++) {
      var r = rows[ri];
      var cells = cellsOfRow(r);
      var blob = cells.join(" ").toLowerCase();
      if (q && blob.indexOf(q) < 0) continue;
      if (lv) {
        var li = colIdx(cols, "级别");
        if (li >= 0 && li < cells.length && String(cells[li]).toUpperCase().indexOf(lv.toUpperCase()) < 0) continue;
      }
      if (roleType) {
        var ti = colIdx(cols, "类型");
        if (ti < 0 || ti >= cells.length) continue;
        var cv = String(cells[ti]);
        if (roleType === "preset" && cv.indexOf("预置") < 0) continue;
        if (roleType === "custom" && cv.indexOf("自定义") < 0) continue;
      }
      if (env) {
        var ei = colIdx(cols, "环境");
        if (ei >= 0 && ei < cells.length) {
          cv = String(cells[ei]);
          if (env === "prod" && cv.indexOf("生产") < 0) continue;
          if (env === "uat" && cv.toLowerCase().indexOf("uat") < 0) continue;
        }
      }
      if (tag) {
        var vi = colIdx(cols, "版本标签");
        if (vi < 0 || vi >= cells.length || String(cells[vi]).toLowerCase().indexOf(tag) < 0) continue;
      }
      if (ownerQ) {
        var oi = colIdx(cols, "负责人");
        if (oi < 0 || oi >= cells.length || String(cells[oi]).toLowerCase().indexOf(ownerQ) < 0) continue;
      }
      if (nodeQ) {
        var ni = colIdx(cols, "当前节点");
        if (ni < 0) ni = colIdx(cols, "办理节点");
        if (ni < 0) ni = colIdx(cols, "审批状态");
        if (ni < 0 || ni >= cells.length || String(cells[ni]).toLowerCase().indexOf(nodeQ) < 0) continue;
      }
      if (orgKind) {
        var t2 = colIdx(cols, "类型");
        if (t2 < 0 || t2 >= cells.length) continue;
        cv = String(cells[t2]);
        if (orgKind === "company" && cv.indexOf("公司") < 0) continue;
        if (orgKind === "dept" && cv.indexOf("部门") < 0) continue;
      }
      if (progQ) {
        var pi = colIdx(cols, "进度 · 申请日");
        if (pi < 0 || pi >= cells.length || String(cells[pi]).toLowerCase().indexOf(progQ) < 0) continue;
      }
      if (st) {
        var si = colIdx(cols, "状态");
        if (si < 0) si = colIdx(cols, "人员状态");
        if (si < 0) si = colIdx(cols, "生效状态");
        if (si < 0) si = colIdx(cols, "审批状态");
        if (si >= 0 && si < cells.length) {
          cv = String(cells[si]);
          if (st === "active") {
            if (
              !/有效|生效|启用|正常|审批中|已通过|在职|试用|待发起|交接中/.test(cv)
            ) {
              continue;
            }
          } else if (st === "inactive") {
            if (!/停用|草稿|归档|暂停|禁用|告警/.test(cv)) continue;
          }
        }
      }
      out.push(r);
    }
    var next = clone(body);
    next.rows = out;
    return next;
  }

  function staticEmbed() {
    return g.__HRMS_STATIC_MOCK_EMBED || null;
  }

  function pageEmbed() {
    return g.__HRMS_PAGE_MOCK_EMBED || null;
  }

  function modalPayload(title, intro, pairs, actions) {
    var rows = (pairs || []).map(function (ab) {
      return { label: ab[0], value: ab[1] };
    });
    return {
      title: title,
      intro: intro || "",
      sections: [{ title: "", rows: rows }],
      actions:
        actions || [
          { id: "close", label: "关闭", style: "primary" },
        ],
    };
  }

  function findById(list, id, key) {
    key = key || "id";
    id = String(id || "");
    for (var i = 0; i < (list || []).length; i++) {
      if (String(list[i][key]) === id) return list[i];
    }
    return null;
  }

  function normalizeEmbedRow(r) {
    if (r && typeof r === "object" && !Array.isArray(r) && r.cells) {
      var cells = (r.cells || []).map(function (c) {
        return String(c != null ? c : "");
      });
      var rid =
        r.id != null && String(r.id) !== ""
          ? String(r.id)
          : cells.length
            ? String(cells[0])
            : "";
      return { id: rid, cells: cells };
    }
    if (Array.isArray(r)) {
      var arr = r.map(function (c) {
        return String(c != null ? c : "");
      });
      return { id: arr[0] || "", cells: arr };
    }
    return { id: "", cells: [] };
  }

  function findRowInPageEmbed(pagePath, rowId) {
    var pe = pageEmbed();
    if (!pe) return null;
    var raw = pe[pagePath] || pe["__default__"];
    if (!raw || !raw.rows || !raw.columns) return null;
    var columns = raw.columns;
    rowId = String(rowId || "").trim();
    if (!rowId) return null;
    for (var ri = 0; ri < raw.rows.length; ri++) {
      var nr = normalizeEmbedRow(raw.rows[ri]);
      if (nr.id === rowId) return { columns: columns, cells: nr.cells };
      for (var j = 0; j < nr.cells.length; j++) {
        if (nr.cells[j] === rowId) return { columns: columns, cells: nr.cells };
      }
    }
    return null;
  }

  function pairsFromColumnsCells(columns, cells) {
    var pairs = [];
    for (var i = 0; i < columns.length; i++) {
      var lab = columns[i];
      if (lab === "操作") continue;
      pairs.push([lab, i < cells.length ? cells[i] : "—"]);
    }
    return pairs;
  }

  function mockModalDetail(kind, id, extra) {
    var st = staticEmbed();
    var dash = st ? st.dashboardSummary : {};
    kind = String(kind || "").trim();
    id = String(id || "").trim();
    var ctx = (extra && String(extra.ctx || "")) || "";
    var ctxL = ctx.trim().toLowerCase();
    var pagePath = (extra && extra.path) || "/";

    if (kind === "wf") {
      var w = findById((st && st.inboxTodo) || [], id);
      if (w) {
        return {
          title: "处理待办",
          intro: id + " · " + (w.module || "业务流程") + " · 申请人 " + (w.initiator || "—") + "；请填写处理意见后再提交。",
          sections: [
            {
              title: "流程信息",
              rows: [
                { label: "流程单号", value: id },
                { label: "发起人", value: w.initiator || "—" },
                { label: "到达时间", value: w.arrivedAt || "—" },
                { label: "所属模块", value: w.module || "—" },
                { label: "当前状态", value: w.status || "—" },
              ],
            },
          ],
          variant: "form",
          fields: [
            {
              name: "opinion",
              label: "处理意见",
              type: "textarea",
              placeholder: "请输入审批意见...",
              required: true,
            },
            {
              name: "nextHandler",
              label: "下一节点处理人",
              type: "select",
              options: [
                { value: "auto", label: "系统自动分配" },
                { value: "user1", label: "张三（法务部）" },
                { value: "user2", label: "李四（财务部）" },
              ],
            },
          ],
          actions: [
            { id: "reject", label: "驳回", style: "danger" },
            { id: "close", label: "取消", style: "secondary" },
            { id: "approve", label: "提交通过", style: "primary" },
          ],
        };
      }
      return {
        title: "处理待办",
        intro: "请填写处理意见。",
        variant: "form",
        fields: [
          { name: "opinion", label: "处理意见", type: "textarea", placeholder: "请输入审批意见..." },
        ],
        actions: [
          { id: "reject", label: "驳回", style: "danger" },
          { id: "close", label: "取消", style: "secondary" },
          { id: "approve", label: "提交通过", style: "primary" },
        ],
      };
    }

    if (kind === "start-apply") {
      return {
        title: "选择流程模板",
        intro: "请选择要发起的申请类型。",
        variant: "form",
        fields: [
          {
            name: "category",
            label: "申请类型",
            type: "select",
            required: true,
            options: [
              { value: "leave", label: "请假申请" },
              { value: "trip", label: "出差申请" },
              { value: "transfer", label: "调岗调薪" },
              { value: "expense", label: "报销申请" },
              { value: "training", label: "培训申请" },
              { value: "certificate", label: "证明开具" },
            ],
          },
          {
            name: "reason",
            label: "申请说明",
            type: "textarea",
            placeholder: "简要说明申请事由（可选）",
          },
        ],
        actions: [
          { id: "close", label: "取消", style: "secondary" },
          { id: "submit", label: "下一步", style: "primary" },
        ],
      };
    }

    if (kind === "leave-form") {
      if (ctxL === "create" || id === "new") {
        return {
          title: "发起请假申请",
          intro: "填写请假信息后提交审批。",
          variant: "form",
          fields: [
            {
              name: "leaveType",
              label: "请假类型",
              type: "select",
              required: true,
              options: [
                { value: "annual", label: "年假" },
                { value: "sick", label: "病假" },
                { value: "personal", label: "事假" },
                { value: "marriage", label: "婚假" },
                { value: "maternity", label: "产假" },
                { value: "paternity", label: "陪产假" },
                { value: "bereavement", label: "丧假" },
              ],
            },
            { name: "startDate", label: "开始时间", type: "text", placeholder: "如 2026-04-26 09:00", required: true },
            { name: "endDate", label: "结束时间", type: "text", placeholder: "如 2026-04-27 18:00", required: true },
            { name: "duration", label: "请假时长", type: "text", placeholder: "自动计算" },
            {
              name: "handover",
              label: "工作交接人",
              type: "select",
              options: [
                { value: "", label: "请选择" },
                { value: "1", label: "张三" },
                { value: "2", label: "李四" },
              ],
            },
            { name: "reason", label: "请假事由", type: "textarea", placeholder: "请输入请假说明", required: true },
          ],
          sections: [
            {
              title: "可休余额",
              rows: [
                { label: "年假余额", value: "6.5 天" },
                { label: "调休余额", value: "1.0 天" },
              ],
            },
          ],
          actions: [
            { id: "close", label: "取消", style: "secondary" },
            { id: "save", label: "暂存", style: "secondary" },
            { id: "submit", label: "提交申请", style: "primary" },
          ],
        };
      }
      return modalPayload("请假详情", "请假申请记录。", [["申请单号", id]]);
    }

    if (kind === "trip-form") {
      if (ctxL === "create" || id === "new") {
        return {
          title: "发起出差申请",
          intro: "填写出差信息后提交审批。",
          variant: "form",
          fields: [
            { name: "purpose", label: "出差事由", type: "text", required: true, placeholder: "如 客户拜访" },
            { name: "from", label: "出发地", type: "text", placeholder: "如 北京", required: true },
            { name: "to", label: "目的地", type: "text", placeholder: "如 上海", required: true },
            { name: "startDate", label: "开始日期", type: "date", required: true },
            { name: "endDate", label: "结束日期", type: "date", required: true },
            {
              name: "companions",
              label: "同行人员",
              type: "select",
              options: [
                { value: "", label: "无" },
                { value: "1", label: "张三" },
                { value: "2", label: "李四" },
              ],
            },
            { name: "transportFee", label: "交通费预算", type: "text", placeholder: "0.00" },
            { name: "hotelFee", label: "住宿费预算", type: "text", placeholder: "0.00" },
          ],
          actions: [
            { id: "close", label: "取消", style: "secondary" },
            { id: "save", label: "暂存", style: "secondary" },
            { id: "submit", label: "提交申请", style: "primary" },
          ],
        };
      }
      return modalPayload("出差详情", "出差申请记录。", [["申请单号", id]]);
    }

    if (kind === "transfer-form") {
      if (ctxL === "create" || id === "new") {
        return {
          title: "发起调岗调薪申请",
          intro: "填写变更信息后提交审批。",
          variant: "form",
          fields: [
            {
              name: "employee",
              label: "申请对象",
              type: "select",
              required: true,
              options: [
                { value: "1", label: "张三 - 研发部" },
                { value: "2", label: "李四 - 市场部" },
              ],
            },
            { name: "effectiveDate", label: "生效日期", type: "date", required: true },
            { name: "newDept", label: "目标部门", type: "text" },
            { name: "newPosition", label: "目标岗位", type: "text" },
            { name: "newSalary", label: "调整后薪资", type: "text", placeholder: "如 28000" },
            { name: "reason", label: "调整原因", type: "textarea", placeholder: "请说明调岗调薪原因" },
          ],
          sections: [
            {
              title: "当前信息",
              rows: [
                { label: "部门", value: "研发部" },
                { label: "岗位", value: "高级工程师" },
                { label: "薪资", value: "25,000 元/月" },
              ],
            },
          ],
          actions: [
            { id: "close", label: "取消", style: "secondary" },
            { id: "save", label: "暂存", style: "secondary" },
            { id: "submit", label: "提交申请", style: "primary" },
          ],
        };
      }
      return modalPayload("调岗调薪详情", "调岗调薪申请记录。", [["申请单号", id]]);
    }

    if (kind === "msg") {
      var m = findById((st && st.messagesItems) || [], id);
      if (m) {
        return modalPayload(
          "【" + m.type + "】" + m.title,
          "来自 " + m.from + " · " + m.time,
          [
            ["消息 ID", m.id],
            ["类型", m.type],
            ["状态", m.status],
          ],
          [{ id: "close", label: "关闭", style: "primary" }]
        );
      }
      return modalPayload("消息", "未找到消息。", [["ID", id || "-"]]);
    }

    if (kind === "ann") {
      var a = findById((st && st.announcements) || [], id);
      if (a) {
        return modalPayload(
          a.title,
          "公告详情（离线 Mock）",
          [
            ["公告编号", String(a.id)],
            ["发布时间", a.publishedAt],
            ["发布人", a.publisher],
            ["可见范围", a.scope],
            ["状态", a.status],
          ],
          [{ id: "close", label: "关闭", style: "primary" }]
        );
      }
      return modalPayload("公告", "未找到该公告。", [["请求编号", id || "-"]]);
    }

    if (kind === "wb-quick") {
      var lab = id;
      var qa = (dash.quickActions || []).slice();
      for (var qi = 0; qi < qa.length; qi++) {
        if (String(qa[qi].id) === id) {
          lab = qa[qi].label || id;
          break;
        }
      }
      return modalPayload(
        "快捷入口 · " + lab,
        "从工作台快捷区打开（离线 Mock）。",
        [
          ["动作 ID", id || "-"],
          ["下一步", "跳转至对应发起页或流程模板"],
        ],
        [
          { id: "submit", label: "进入办理", style: "primary" },
          { id: "close", label: "取消", style: "secondary" },
        ]
      );
    }

    if (kind === "wb-todo") {
      var t = findById(dash.workbenchTodos || [], id);
      if (t) {
        return modalPayload(
          "待办 · " + t.title,
          t.meta || "",
          [
            ["待办 ID", id],
            ["处理人", "当前登录用户"],
          ],
          [
            { id: "submit", label: "去处理", style: "primary" },
            { id: "close", label: "关闭", style: "secondary" },
          ]
        );
      }
      return modalPayload("待办", "未找到该待办项。", [["ID", id]]);
    }

    if (kind === "wb-feed") {
      var f = findById(dash.announcementFeed || [], id);
      if (f) {
        return modalPayload(
          f.title,
          f.desc || "",
          [
            ["标签", f.tag || ""],
            ["提醒 ID", id],
          ],
          [{ id: "close", label: "知道了", style: "primary" }]
        );
      }
      return modalPayload("提醒", "未找到条目。", [["ID", id]]);
    }

    if (kind === "wb-sched") {
      var s = findById(dash.schedule || [], id);
      if (s) {
        return modalPayload(
          (s.time || "") + " · " + (s.title || "日程"),
          s.meta || "",
          [["日程 ID", id]],
          [{ id: "close", label: "关闭", style: "primary" }]
        );
      }
      return modalPayload("日程", "未找到日程。", [["ID", id]]);
    }

    if (kind === "wfc") {
      return modalPayload(
        "发起流程",
        "填写申请说明并选择流程模板（离线 Mock）。",
        [
          ["流程模板", ctx || "请假 / 出差 / 报销 / 入职 …"],
          ["事由摘要", "在此填写申请说明"],
          ["抄送", "直属上级、HRBP"],
        ],
        [
          { id: "submit", label: "下一步", style: "primary" },
          { id: "close", label: "取消", style: "secondary" },
        ]
      );
    }

    if (kind === "log-detail") {
      var logFound = findRowInPageEmbed("/system/logs", id);
      if (logFound) {
        var sumIdx = logFound.columns.indexOf("摘要");
        var logTitle =
          sumIdx >= 0 && sumIdx < logFound.cells.length ? logFound.cells[sumIdx] : id;
        return modalPayload(
          "日志详情 · " + logTitle,
          "与日志列表行一致（离线 Mock）。",
          pairsFromColumnsCells(logFound.columns, logFound.cells),
          [{ id: "close", label: "关闭", style: "primary" }]
        );
      }
      return modalPayload(
        "日志详情",
        "未找到该条日志。",
        [["引用", id || "-"]],
        [{ id: "close", label: "关闭", style: "primary" }]
      );
    }

    if (kind === "snapshot-row") {
      var snapFound = findRowInPageEmbed("/system/snapshots", id);
      var snapPairs = snapFound
        ? pairsFromColumnsCells(snapFound.columns, snapFound.cells)
        : [["快照 ID", id || "-"]];
      if (ctxL === "compare") {
        return modalPayload(
          "快照差异 · " + id,
          "对比所选快照（离线 Mock）；下列为基准行数据。",
          snapPairs.concat([
            ["右侧候选", "在「新建对比任务」中选择"],
            ["差异摘要", "示例：组织节点 +3 / 权限 −1"],
          ]),
          [{ id: "close", label: "关闭", style: "primary" }]
        );
      }
      if (snapFound) {
        return modalPayload(
          "快照详情 · " + (snapFound.cells[0] || id),
          "与快照列表行一致（离线 Mock）。",
          snapPairs,
          [{ id: "close", label: "关闭", style: "primary" }]
        );
      }
      return modalPayload(
        "快照",
        "未找到该快照。",
        [["ID", id || "-"]],
        [{ id: "close", label: "关闭", style: "primary" }]
      );
    }

    if (kind === "legal") {
      var title = id === "privacy" ? "隐私政策" : "用户协议";
      return modalPayload(
        title,
        "以下为占位条款（离线 Mock）。",
        [
          ["版本", "2026-01"],
          ["更新日期", "2026-05-02"],
          ["摘要", "信息收集范围、使用目的、存储期限与联系方式等。"],
        ],
        [{ id: "close", label: "我已阅读", style: "primary" }]
      );
    }

    if (kind === "recruit-form") {
      if (ctxL === "create" || id === "new") {
        return {
          title: "新建招聘需求",
          intro: "与「招聘管理」列表列一致：需求编号、职位、HC、在招、负责人、状态。",
          variant: "form",
          fields: [
            { name: "reqNo", label: "需求编号", type: "text", placeholder: "如 RQ-2410", required: true },
            { name: "position", label: "职位", type: "text", required: true, placeholder: "如 高级前端工程师" },
            { name: "hc", label: "HC", type: "text", placeholder: "计划编制，如 3" },
            { name: "hiring", label: "在招", type: "text", placeholder: "当前在招人数，如 2" },
            { name: "owner", label: "负责人", type: "text", placeholder: "如 周琪" },
            {
              name: "status",
              label: "状态",
              type: "select",
              options: [
                { value: "recruiting", label: "招聘中" },
                { value: "paused", label: "暂停" },
                { value: "draft", label: "草稿" },
              ],
            },
            { name: "jd", label: "职位描述 / 任职资格", type: "textarea", placeholder: "岗位职责、任职要求、工作地点等" },
          ],
          actions: [
            { id: "close", label: "取消", style: "secondary" },
            { id: "submit", label: "创建需求", style: "primary" },
          ],
        };
      }
      var rRow = findRowInPageEmbed("/recruit", id);
      if (rRow) {
        return modalPayload(
          "招聘需求 · " + (rRow.cells[0] || id),
          "与列表行一致（离线 Mock）。",
          pairsFromColumnsCells(rRow.columns, rRow.cells),
          [
            { id: "submit", label: "保存草稿", style: "primary" },
            { id: "close", label: "关闭", style: "secondary" },
          ]
        );
      }
      return modalPayload(
        "招聘需求",
        "未找到该需求。",
        [["需求编号", id || "-"]],
        [{ id: "close", label: "关闭", style: "primary" }]
      );
    }

    if (kind === "workflow-form") {
      if (ctxL === "create" || id === "new") {
        return {
          title: "新建流程定义",
          intro: "与「流程中心」列表列一致：流程编码、流程名称、版本、发布状态。",
          variant: "form",
          fields: [
            { name: "code", label: "流程编码", type: "text", placeholder: "如 WF-LEAVE", required: true },
            { name: "name", label: "流程名称", type: "text", required: true, placeholder: "如 请假审批流" },
            { name: "ver", label: "版本", type: "text", placeholder: "如 v3.2" },
            {
              name: "publishStatus",
              label: "发布状态",
              type: "select",
              options: [
                { value: "published", label: "已发布" },
                { value: "draft", label: "草稿" },
              ],
            },
            { name: "changelog", label: "变更说明", type: "textarea", placeholder: "本轮版本变更摘要（选填）" },
          ],
          actions: [
            { id: "close", label: "取消", style: "secondary" },
            { id: "submit", label: "保存", style: "primary" },
          ],
        };
      }
      var wRow = findRowInPageEmbed("/workflow", id);
      if (wRow) {
        var isDesign = ctxL === "design";
        return modalPayload(
          (isDesign ? "流程设计 · " : "流程 · ") + (wRow.cells[0] || id),
          isDesign
            ? "基于当前行打开流程设计说明（离线 Mock）；下列为列表中的流程信息。"
            : "与列表行一致（离线 Mock）。",
          pairsFromColumnsCells(wRow.columns, wRow.cells),
          isDesign
            ? [
                { id: "submit", label: "进入画布", style: "primary" },
                { id: "close", label: "关闭", style: "secondary" },
              ]
            : [{ id: "close", label: "关闭", style: "primary" }]
        );
      }
      return modalPayload(
        "流程",
        "未找到该流程。",
        [["流程编码", id || "-"]],
        [{ id: "close", label: "关闭", style: "primary" }]
      );
    }

    if (kind === "record") {
      if (ctxL === "create" || id === "new") {
        if (pagePath === "/my-apply") {
          return {
            title: "发起申请",
            intro: "与「我的申请」列表字段对齐的演示表单（离线 Mock）。",
            variant: "form",
            fields: [
              {
                name: "type",
                label: "类型",
                type: "select",
                options: [
                  { value: "leave", label: "请假" },
                  { value: "trip", label: "出差" },
                  { value: "exp", label: "报销" },
                  { value: "other", label: "其他" },
                ],
              },
              { name: "title", label: "标题摘要", type: "text", required: true, placeholder: "简要说明申请事项" },
              { name: "reason", label: "事由说明", type: "textarea", placeholder: "详细说明（选填）" },
            ],
            actions: [
              { id: "close", label: "取消", style: "secondary" },
              { id: "submit", label: "提交", style: "primary" },
            ],
          };
        }
        return {
          title: "新建记录",
          intro: "当前路由的通用新建表单（离线 Mock）。",
          variant: "form",
          fields: [
            { name: "code", label: "编号", type: "text", placeholder: "主键 / 编码" },
            { name: "name", label: "名称", type: "text", required: true },
            { name: "remark", label: "说明", type: "textarea" },
          ],
          actions: [
            { id: "close", label: "取消", style: "secondary" },
            { id: "submit", label: "保存", style: "primary" },
          ],
        };
      }
      if (ctxL === "inbox-done" || pagePath === "/inbox/done") {
        var doneIt = findById((st && st.inboxDone) || [], id);
        if (doneIt) {
          return modalPayload(
            "已办详情 · " + doneIt.title,
            "与已办列表行一致（离线 Mock）。",
            [
              ["流程标题", doneIt.title],
              ["发起人", doneIt.initiator],
              ["办结时间", doneIt.closedAt],
              ["耗时", doneIt.duration],
              ["结果", doneIt.result],
            ],
            [{ id: "close", label: "关闭", style: "primary" }]
          );
        }
      }
      var rowHit = findRowInPageEmbed(pagePath, id);
      if (rowHit) {
        var prs = pairsFromColumnsCells(rowHit.columns, rowHit.cells);
        var headCell = rowHit.cells[0] || id;
        return modalPayload(
          "详情 · " + headCell,
          "与当前列表行数据一致（离线 Mock）。",
          prs,
          [
            { id: "submit", label: "保存草稿", style: "primary" },
            { id: "close", label: "关闭", style: "secondary" },
          ]
        );
      }
      return modalPayload(
        "记录详情 · " + (id || "未命名"),
        "该路由下未匹配到离线列表行；连接后端后可加载真实详情。",
        [
          ["业务主键", id || "-"],
          ["当前路由", pagePath],
          ["附加上下文", ctx || "无"],
        ],
        [
          { id: "submit", label: "保存草稿", style: "primary" },
          { id: "close", label: "关闭", style: "secondary" },
        ]
      );
    }

    if (kind === "org-form" || kind === "dept-form" || kind === "pos-form") {
      if (ctxL === "create" || id === "new") {
        var titles = {
          "org-form": "新建组织",
          "dept-form": "新建部门",
          "pos-form": "新建岗位",
        };
        return {
          title: titles[kind] || "新建",
          intro: "离线演示表单，保存为 Mock。",
          variant: "form",
          fields: [
            { name: "code", label: "编码", type: "text", placeholder: "如 ORG-XX", required: true },
            { name: "name", label: "名称", type: "text", required: true },
          ],
          actions: [
            { id: "close", label: "取消", style: "secondary" },
            { id: "submit", label: "保存", style: "primary" },
          ],
        };
      }
      var orgHit = findRowInPageEmbed(pagePath, id);
      var oLab = { "org-form": "组织", "dept-form": "部门", "pos-form": "岗位" }[kind] || "信息";
      if (orgHit) {
        return modalPayload(
          oLab + " · " + (orgHit.cells[0] || id),
          "与列表行一致（离线 Mock）。",
          pairsFromColumnsCells(orgHit.columns, orgHit.cells),
          [{ id: "close", label: "关闭", style: "primary" }]
        );
      }
      return modalPayload(
        oLab + " · " + id,
        "未在离线数据中找到该行。",
        [
          ["编码/主键", id],
          ["路由", pagePath],
        ],
        [{ id: "close", label: "关闭", style: "primary" }]
      );
    }

    var staffKinds = {
      "staff-roster": "员工花名册",
      "staff-onboarding": "入职办理",
      "staff-probation": "转正申请",
      "staff-transfer": "调岗调薪",
      "staff-offboarding": "离职办理",
    };
    if (staffKinds[kind]) {
      if (ctxL === "create" || id === "new") {
        return {
          title: "新建 · " + staffKinds[kind],
          intro: "离线演示表单。",
          variant: "form",
          fields: [
            { name: "name", label: "姓名", type: "text", required: true },
            { name: "dept", label: "部门", type: "text" },
          ],
          actions: [
            { id: "close", label: "取消", style: "secondary" },
            { id: "submit", label: "提交", style: "primary" },
          ],
        };
      }
      if (ctxL === "edit" && kind === "staff-probation") {
        var shProb = findRowInPageEmbed(pagePath, id);
        var nameProb = shProb && shProb.cells.length ? shProb.cells[0] : id;
        return {
          title: "编辑 · " + staffKinds[kind],
          intro: "调整草稿态申请；字段与列表行对齐。",
          variant: "form",
          fields: [
            { name: "name", label: "姓名", type: "text", value: nameProb },
            { name: "end", label: "试用结束日", type: "date" },
          ],
          actions: [
            { id: "close", label: "取消", style: "secondary" },
            { id: "submit", label: "保存草稿", style: "primary" },
          ],
        };
      }
      if (ctxL === "edit" && kind === "staff-transfer") {
        var shTr = findRowInPageEmbed(pagePath, id);
        var nameTr = shTr && shTr.cells.length ? shTr.cells[0] : id;
        var toTr =
          shTr && shTr.cells.length > 2 ? shTr.cells[2] : "";
        return {
          title: "编辑 · " + staffKinds[kind],
          intro: "调整草稿态调岗调薪单。",
          variant: "form",
          fields: [
            { name: "name", label: "姓名", type: "text", value: nameTr },
            { name: "to", label: "目标部门 / 岗位", type: "text", value: toTr },
            { name: "eff", label: "希望生效日", type: "date" },
          ],
          actions: [
            { id: "close", label: "取消", style: "secondary" },
            { id: "submit", label: "保存草稿", style: "primary" },
          ],
        };
      }
      if (ctxL === "approve") {
        var shAp = findRowInPageEmbed(pagePath, id);
        var pairsAp = shAp ? pairsFromColumnsCells(shAp.columns, shAp.cells) : [["记录 ID", id]];
        var secRows = pairsAp.map(function (ab) {
          return { label: ab[0], value: ab[1] };
        });
        return {
          title: "办理 · " + staffKinds[kind],
          intro: "下列字段来自当前列表行（离线 Mock）。",
          sections: [{ title: "", rows: secRows }],
          variant: "form",
          fields: [
            {
              name: "opinion",
              label: "审批意见",
              type: "textarea",
              placeholder: "通过说明或驳回原因（选填）",
            },
          ],
          actions: [
            { id: "reject", label: "驳回", style: "danger" },
            { id: "close", label: "关闭", style: "secondary" },
            { id: "approve", label: "通过", style: "primary" },
          ],
        };
      }
      var staffHit = findRowInPageEmbed(pagePath, id);
      if (staffHit) {
        return modalPayload(
          staffKinds[kind] + " · " + (staffHit.cells[0] || id),
          "与列表行一致（离线 Mock）。",
          pairsFromColumnsCells(staffHit.columns, staffHit.cells),
          [{ id: "close", label: "关闭", style: "primary" }]
        );
      }
      return modalPayload(staffKinds[kind] + " · " + id, "未找到该条记录（离线 Mock）。", [
        ["记录 ID", id],
        ["上下文", ctx || "view"],
      ]);
    }

    if (kind === "role-form") {
      if (ctxL === "create" || id === "new") {
        return {
          title: "新建角色",
          intro: "离线 Mock。",
          variant: "form",
          fields: [
            { name: "code", label: "角色编码", type: "text", placeholder: "ROLE-XXX", required: true },
            { name: "name", label: "角色名称", type: "text", required: true },
          ],
          actions: [
            { id: "close", label: "取消", style: "secondary" },
            { id: "submit", label: "保存", style: "primary" },
          ],
        };
      }
      var roleHit = findRowInPageEmbed(pagePath, id) || findRowInPageEmbed("/system/roles", id);
      if (roleHit) {
        return modalPayload(
          "角色 · " + (roleHit.cells[0] || id),
          "与角色列表行一致（离线 Mock）。",
          pairsFromColumnsCells(roleHit.columns, roleHit.cells),
          [{ id: "close", label: "关闭", style: "primary" }]
        );
      }
      return modalPayload("角色 · " + id, "未找到该角色。", [["角色编码", id]]);
    }

    if (kind === "perm-form" || kind === "dict-form" || kind === "integration-form") {
      if (ctxL === "create" || id === "new") {
        return {
          title: "新建（离线 Mock）",
          variant: "form",
          fields: [{ name: "name", label: "名称", type: "text", required: true }],
          actions: [
            { id: "close", label: "取消", style: "secondary" },
            { id: "submit", label: "保存", style: "primary" },
          ],
        };
      }
      var sysPath = pagePath;
      if (kind === "perm-form") sysPath = "/system/permissions";
      if (kind === "dict-form") sysPath = "/system/config/dict";
      if (kind === "integration-form") sysPath = "/system/integration";
      var sysHit = findRowInPageEmbed(pagePath, id) || findRowInPageEmbed(sysPath, id);
      if (ctxL === "grant" && kind === "perm-form" && sysHit) {
        return modalPayload(
          "授权 · " + (sysHit.cells[0] || id),
          "基于当前策略行发起授权（离线 Mock）。",
          pairsFromColumnsCells(sysHit.columns, sysHit.cells).concat([
            ["目标用户 / 角色", "从目录选择"],
          ]),
          [
            { id: "submit", label: "保存授权", style: "primary" },
            { id: "close", label: "取消", style: "secondary" },
          ]
        );
      }
      if (sysHit) {
        var sysLab =
          kind === "perm-form" ? "策略" : kind === "dict-form" ? "字典" : "连接器";
        return modalPayload(
          sysLab + " · " + (sysHit.cells[0] || id),
          "与列表行一致（离线 Mock）。",
          pairsFromColumnsCells(sysHit.columns, sysHit.cells),
          [{ id: "close", label: "关闭", style: "primary" }]
        );
      }
      return modalPayload("详情 · " + id, "未找到该条记录。", [["ID", id]]);
    }

    if (kind === "log-filter" || kind === "snapshot-run") {
      return {
        title: kind === "log-filter" ? "日志高级筛选" : "生成快照",
        variant: "form",
        fields: [{ name: "q", label: "关键字", type: "text" }],
        actions: [
          { id: "close", label: "取消", style: "secondary" },
          { id: "submit", label: "应用", style: "primary" },
        ],
      };
    }

    return modalPayload(
      "弹窗（离线）",
      "kind=" + kind + " 的占位内容；连接后端后可加载完整表单。",
      [
        ["ID", id || "-"],
        ["路径", pagePath],
      ],
      [{ id: "close", label: "关闭", style: "primary" }]
    );
  }

  function filterMessages(items, opts) {
    opts = opts || {};
    var t = String(opts.type || "").trim();
    var s = String(opts.status || "").trim();
    var q = String(opts.q || "")
      .trim()
      .toLowerCase();
    var out = (items || []).slice();
    if (t) out = out.filter(function (x) { return x.type === t; });
    if (s) out = out.filter(function (x) { return x.status === s; });
    if (q) out = out.filter(function (x) { return String(x.title || "").toLowerCase().indexOf(q) >= 0; });
    return { items: out, total: out.length };
  }

  /** 与画板一致：部分列表补全 4 枚 KPI，便于顶部指标条展示 */
  function enrichPagePresentation(p, c) {
    if (!c || typeof c !== "object") return;
    var k = c.kpis;
    if (!k || !k.length) return;
    if (k.length >= 4) return;
    var extra = [];
    if (p === "/performance") {
      extra = [
        { v: "Top 15%", k: "团队排名" },
        { v: "4.2", k: "协作分" },
      ];
    } else if (p === "/recruit") {
      extra = [
        { v: "6", k: "面试中" },
        { v: "2", k: "待发 Offer" },
      ];
    } else if (p === "/workflow") {
      extra = [
        { v: "128", k: "本月实例" },
        { v: "99.2%", k: "SLA 达成" },
      ];
    } else if (p === "/my-apply") {
      extra = [
        { v: "3", k: "待补材料" },
        { v: "1", k: "即将超时" },
      ];
    } else if (p === "/staff/roster") {
      extra = [
        { v: "96%", k: "信息完整度" },
        { v: "7", k: "待签合同" },
      ];
    } else {
      return;
    }
    c.kpis = k.concat(extra.slice(0, 4 - k.length));
  }

  function filterInbox(items, q) {
    q = String(q || "")
      .trim()
      .toLowerCase();
    var out = (items || []).slice();
    if (!q) return { items: out, total: out.length };
    out = out.filter(function (x) {
      return (
        String(x.title || "")
          .toLowerCase()
          .indexOf(q) >= 0 ||
        String(x.initiator || "")
          .toLowerCase()
          .indexOf(q) >= 0
      );
    });
    return { items: out, total: out.length };
  }

  g.__HrmsOfflineMock = {
    afterOffline: afterOffline,
    health: function () {
      return Promise.resolve({ status: "up-mock" });
    },
    dashboardSummary: function () {
      var st = staticEmbed();
      if (!st || !st.dashboardSummary) return Promise.reject(new Error("no static embed"));
      return Promise.resolve(clone(st.dashboardSummary));
    },
    pageData: function (path, params) {
      var pe = pageEmbed();
      if (!pe) return Promise.reject(new Error("no page embed"));
      var p = String(path || "/");
      var raw = pe[p] || pe["__default__"];
      var c = clone(raw);
      c = applyPageQueryFilters(c, params || {});
      enrichPagePresentation(p, c);
      return Promise.resolve(c);
    },
    messages: function (opts) {
      var st = staticEmbed();
      if (!st || !st.messagesItems) return Promise.reject(new Error("no static embed"));
      return Promise.resolve(filterMessages(st.messagesItems, opts));
    },
    inboxTodo: function (opts) {
      var st = staticEmbed();
      if (!st || !st.inboxTodo) return Promise.reject(new Error("no static embed"));
      return Promise.resolve(filterInbox(st.inboxTodo, (opts && opts.q) || ""));
    },
    inboxDone: function (opts) {
      var st = staticEmbed();
      if (!st || !st.inboxDone) return Promise.reject(new Error("no static embed"));
      return Promise.resolve(filterInbox(st.inboxDone, (opts && opts.q) || ""));
    },
    announcements: function (opts) {
      var st = staticEmbed();
      if (!st || !st.announcements) return Promise.reject(new Error("no static embed"));
      var items = (st.announcements || []).slice();
      opts = opts || {};
      var status = String(opts.status || "").trim();
      var q = String(opts.q || "")
        .trim()
        .toLowerCase();
      if (status) items = items.filter(function (x) { return x.status === status; });
      if (q) items = items.filter(function (x) { return String(x.title || "").toLowerCase().indexOf(q) >= 0; });
      return Promise.resolve({ items: items, total: items.length });
    },
    modalDetail: function (kind, id, extra) {
      return Promise.resolve(mockModalDetail(kind, id, extra || {}));
    },
  };

  function wrapPromise(p, offlineFn) {
    var m = g.__HrmsOfflineMock;
    if (!m) return p;
    return p.catch(function () {
      g.HrmsApi = g.HrmsApi || {};
      g.HrmsApi.__usingOfflineMock = true;
      afterOffline();
      return offlineFn();
    });
  }

  g.__HrmsOfflineWrap = wrapPromise;
})(typeof window !== "undefined" ? window : this);
