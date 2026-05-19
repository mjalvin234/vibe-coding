#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
import os
import secrets
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse


def _json(handler: BaseHTTPRequestHandler, payload, status: int = 200):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(data)))
    # CORS for local frontend dev
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.end_headers()
    handler.wfile.write(data)


def _not_found(handler: BaseHTTPRequestHandler):
    _json(handler, {"ok": False, "error": {"code": "NOT_FOUND", "message": "Not Found"}}, status=404)


def _ok(handler: BaseHTTPRequestHandler, data):
    _json(handler, {"ok": True, "data": data})


def _bad(handler: BaseHTTPRequestHandler, code: str, message: str, status: int = 400):
    _json(handler, {"ok": False, "error": {"code": code, "message": message}}, status=status)


def _read_json_body(handler: BaseHTTPRequestHandler):
    try:
        length = int(handler.headers.get("Content-Length", "0") or "0")
    except ValueError:
        length = 0
    if length <= 0:
        return {}
    raw = handler.rfile.read(length)
    if not raw:
        return {}
    return json.loads(raw.decode("utf-8"))


ANNOUNCEMENTS = [
    {
        "id": "5033253724",
        "publishedAt": "2026-04-16",
        "publisher": "王敏",
        "title": "关于 2026 年春节放假安排的通知",
        "scope": "全公司",
        "status": "已发布",
    },
    {
        "id": "366872911",
        "publishedAt": "2026-04-08",
        "publisher": "陈蕾",
        "title": "系统维护窗口通知（今晚 23:00）",
        "scope": "研发中心",
        "status": "草稿",
    },
]

MESSAGES = [
    {"id": "m-1001", "type": "审批", "status": "未读", "title": "请假申请待你处理", "from": "流程中心", "time": "2 分钟前"},
    {"id": "m-1002", "type": "系统", "status": "已读", "title": "权限策略已更新", "from": "系统", "time": "1 天前"},
    {"id": "m-1003", "type": "考勤", "status": "未读", "title": "外出打卡定位策略上线", "from": "考勤管理", "time": "2 天前"},
]

INBOX_TODO = [
    {"id": "wf-9921", "title": "出差申请", "initiator": "李雷", "arrivedAt": "2026-04-17 09:02", "module": "我的申请", "status": "待处理"},
    {"id": "wf-8751", "title": "调岗调薪审批", "initiator": "韩梅梅", "arrivedAt": "2026-04-16 14:21", "module": "员工管理", "status": "待处理"},
    {"id": "wf-6604", "title": "补卡申请", "initiator": "王敏", "arrivedAt": "2026-04-15 20:10", "module": "考勤管理", "status": "待处理"},
]

INBOX_DONE = [
    {
        "id": "done-1",
        "title": "采购申请 · 办公用品",
        "initiator": "张三",
        "closedAt": "2026-04-16 17:20",
        "duration": "1.5 天",
        "result": "同意",
    },
    {
        "id": "done-2",
        "title": "用印申请",
        "initiator": "李四",
        "closedAt": "2026-04-15 11:08",
        "duration": "4 小时",
        "result": "同意",
    },
]

# Mock QR sessions: id -> created_at epoch
QR_SESSIONS: dict[str, float] = {}

DASHBOARD_SUMMARY = {
    "kpis": [
        {"id": "kpi-emp", "label": "在职人数", "value": "1,284"},
        {"id": "kpi-pend", "label": "待审批", "value": "18"},
        {"id": "kpi-onb", "label": "本月入职", "value": "12"},
        {"id": "kpi-off", "label": "本月离职", "value": "4"},
    ],
    "quickActions": [
        {"id": "qa-1", "label": "发起审批", "path": "/workflow"},
        {"id": "qa-2", "label": "请假", "path": "/my-apply"},
        {"id": "qa-3", "label": "加班", "path": "/my-apply"},
        {"id": "qa-4", "label": "报销", "path": "/my-apply"},
        {"id": "qa-5", "label": "入职", "path": "/staff/onboarding"},
        {"id": "qa-6", "label": "离职", "path": "/staff/offboarding"},
        {"id": "qa-7", "label": "转正", "path": "/staff/probation"},
        {"id": "qa-8", "label": "调岗", "path": "/staff/transfer"},
    ],
    "workbenchTodos": [
        {"id": "wb-1", "title": "请假审批 · 张三", "meta": "待你处理 · 2 小时前"},
        {"id": "wb-2", "title": "入职资料补全 · 李四", "meta": "待填写 · 今天 18:00 截止"},
        {"id": "wb-3", "title": "报销单 · 王五", "meta": "待复核 · 昨天"},
    ],
    "announcementFeed": [
        {
            "id": "af-1",
            "title": "系统维护窗口",
            "desc": "今晚 23:00–01:00 · 预计 5 分钟不可用",
            "tag": "系统",
            "tone": "system",
        },
        {
            "id": "af-2",
            "title": "社保基数调整提醒",
            "desc": "本周五截止 · 请检查员工档案",
            "tag": "提醒",
            "tone": "remind",
        },
        {
            "id": "af-3",
            "title": "异常打卡风险",
            "desc": "3 人待核实 · 建议今日处理",
            "tag": "风险",
            "tone": "risk",
        },
    ],
    "schedule": [
        {
            "id": "sc-1",
            "time": "10:30",
            "title": "候选人面试 · 前端工程师",
            "meta": "面试官：王五 · 会议室 2",
        },
        {
            "id": "sc-2",
            "time": "14:00",
            "title": "试用期评估 · 张三",
            "meta": "主管：李四 · 待填写评价",
        },
        {
            "id": "sc-3",
            "time": "16:30",
            "title": "培训签到 · 劳动合规",
            "meta": "讲师：HRBP · 线上会议",
        },
    ],
    # 与 Figma 工作台「趋势概览」柱状示意（184:1059）高度序列一致
    "trendBars": [40, 70, 55, 90, 60, 110, 80, 120, 75, 95, 60, 105],
    "recentVisits": [
        {"id": "rv-1", "title": "员工档案 · 李四", "meta": "3 分钟前"},
        {"id": "rv-2", "title": "审批单 · 报销 #A-1024", "meta": "昨天"},
        {"id": "rv-3", "title": "考勤报表 · 2026-03", "meta": "本周一"},
    ],
}


COMMON_PAGE_FILTERS = [
    {"key": "q", "label": "关键词", "type": "text", "placeholder": "编号 / 名称 / 关键字"},
    {
        "key": "status",
        "label": "状态",
        "type": "select",
        "options": [
            {"value": "", "label": "全部"},
            {"value": "active", "label": "有效"},
            {"value": "inactive", "label": "停用 / 归档"},
        ],
    },
]

SELECT_EFFECT = [
    {"value": "", "label": "全部"},
    {"value": "active", "label": "有效 / 在途"},
    {"value": "inactive", "label": "草稿 / 归档"},
]


def _norm_api_path(path: str) -> str:
    s = "/" + "/".join(p for p in (path or "").split("/") if p)
    return s or "/"


def _pack(cols: list[str], *rows: tuple) -> tuple[list[str], list[list[str]]]:
    return cols, [[str(c) for c in r] for r in rows]


def _cells_of_row(r: object) -> list[str]:
    if isinstance(r, (list, tuple)):
        return [str(c) for c in r]
    if isinstance(r, dict) and r.get("cells") is not None:
        return [str(c) for c in r["cells"]]
    return []


def _apply_page_query_filters(body: dict, query: dict) -> dict:
    """GET /api/page-data 查询参数对当前表格行做简单 Mock 过滤。"""
    if not isinstance(body, dict) or not body.get("columns") or body.get("rows") is None:
        return body
    cols: list[str] = list(body["columns"])
    rows = body["rows"]
    q = (query.get("q") or "").strip().lower()
    st = (query.get("status") or "").strip()
    lv = (query.get("level") or "").strip()
    role_type = (query.get("role_type") or "").strip()
    env = (query.get("env") or "").strip()
    tag = (query.get("tag") or "").strip().lower()
    owner_q = (query.get("owner_q") or "").strip().lower()
    node_q = (query.get("node") or "").strip().lower()
    prog_q = (query.get("progress_q") or "").strip().lower()
    org_kind = (query.get("org_kind") or "").strip()
    if not any((q, st, lv, role_type, env, tag, owner_q, node_q, prog_q, org_kind)):
        return body

    def col_idx(name: str) -> int:
        return cols.index(name) if name in cols else -1

    out: list = []
    for r in rows:
        cells = _cells_of_row(r)
        blob = " ".join(cells).lower()
        if q and q not in blob:
            continue
        if lv:
            i = col_idx("级别")
            if i >= 0 and i < len(cells) and lv.upper() not in str(cells[i]).upper():
                continue
        if role_type:
            ti = col_idx("类型")
            if ti < 0 or ti >= len(cells):
                continue
            cv = str(cells[ti])
            if role_type == "preset" and "预置" not in cv:
                continue
            if role_type == "custom" and "自定义" not in cv:
                continue
        if env:
            ei = col_idx("环境")
            if ei >= 0 and ei < len(cells):
                cv = str(cells[ei])
                if env == "prod" and "生产" not in cv:
                    continue
                if env == "uat" and "uat" not in cv.lower():
                    continue
        if tag:
            vi = col_idx("版本标签")
            if vi < 0 or vi >= len(cells) or tag not in str(cells[vi]).lower():
                continue
        if owner_q:
            oi = col_idx("负责人")
            if oi < 0 or oi >= len(cells) or owner_q not in str(cells[oi]).lower():
                continue
        if node_q:
            ni = col_idx("当前节点")
            if ni < 0:
                ni = col_idx("办理节点")
            if ni < 0:
                ni = col_idx("审批状态")
            if ni < 0 or ni >= len(cells) or node_q not in str(cells[ni]).lower():
                continue
        if org_kind:
            ti = col_idx("类型")
            if ti < 0 or ti >= len(cells):
                continue
            cv = str(cells[ti])
            if org_kind == "company" and "公司" not in cv:
                continue
            if org_kind == "dept" and "部门" not in cv:
                continue
        if prog_q:
            pi = col_idx("进度 · 申请日")
            if pi < 0 or pi >= len(cells) or prog_q not in str(cells[pi]).lower():
                continue
        if st:
            si = col_idx("状态")
            if si < 0:
                si = col_idx("人员状态")
            if si < 0:
                si = col_idx("生效状态")
            if si < 0:
                si = col_idx("审批状态")
            if si >= 0 and si < len(cells):
                cv = str(cells[si])
                if st == "active":
                    if not any(
                        x in cv
                        for x in (
                            "有效",
                            "生效",
                            "启用",
                            "正常",
                            "审批中",
                            "已通过",
                            "在职",
                            "试用",
                            "待发起",
                            "交接中",
                        )
                    ):
                        continue
                elif st == "inactive":
                    if not any(x in cv for x in ("停用", "草稿", "归档", "暂停", "禁用", "告警")):
                        continue
        out.append(r)
    return {**body, "rows": out}


def mock_page_data(path: str) -> dict:
    """按菜单路径返回 Mock 列表页数据（供前端通用表格页使用）。"""
    path = _norm_api_path(path)
    segs = [p for p in path.split("/") if p]
    head = segs[0] if segs else ""
    sub = segs[1] if len(segs) > 1 else ""
    body: dict = {"filters": COMMON_PAGE_FILTERS}

    def kpis(*vals: str):
        xs = [str(x) for x in vals]
        body["kpis"] = [{"v": xs[i], "k": xs[i + 1]} for i in range(0, len(xs), 2)]

    # ---------- 各业务域表格 ----------
    if head == "employee":
        cols, rows = _pack(
            ["工号", "姓名", "部门", "岗位", "入职日期", "人员状态", "操作"],
            ("E-2024-001", "张三", "研发中心", "高级工程师", "2023-03-01", "在职", "详情"),
            ("E-2024-088", "李四", "人力资源部", "HRBP", "2022-08-15", "在职", "详情"),
            ("E-2024-120", "王五", "销售中心", "区域经理", "2024-01-08", "试用", "详情"),
            ("E-2023-266", "赵六", "供应链", "采购专员", "2023-11-20", "在职", "详情"),
        )
        body["columns"], body["rows"] = cols, rows
        kpis("1,284", "在职人员", "12", "本月入职", "4", "待转正")
        return body

    # 员工管理五页 · 对齐 Figma ZHNbAy50bYd0oqZavray98（如 999:17015、999:17080 等列表画板）
    if head == "staff":
        leaf = segs[1] if len(segs) > 1 else ""
        if leaf == "roster":
            cols, rows = _pack(
                ["工号", "姓名", "部门 / 岗位", "人员状态", "操作"],
                ("E-2024-001", "张三", "技术中心 · 高级工程师", "在职", "详情"),
                ("E-2024-088", "李四", "人力资源部 · HRBP", "在职", "详情"),
            )
            kpis("1,284", "在职人员", "18", "本月入职")
            body["filters"] = [
                {"key": "q", "label": "姓名 / 工号", "type": "text", "placeholder": "输入关键字"},
                {
                    "key": "status",
                    "label": "人员状态",
                    "type": "select",
                    "options": [
                        {"value": "", "label": "全部"},
                        {"value": "active", "label": "在职 / 试用"},
                        {"value": "inactive", "label": "其他"},
                    ],
                },
            ]
        elif leaf == "onboarding":
            cols, rows = _pack(
                ["姓名", "入职部门", "岗位 · 到岗日", "当前节点", "操作"],
                ("王五", "研发中心", "高级工程师 · 5/12", "资料收集", "办理"),
                ("赵六", "销售中心", "区域经理 · 5/20", "Offer 确认", "办理"),
            )
            kpis("6", "在途入职", "2", "本周到岗")
            body["filters"] = [
                {"key": "q", "label": "姓名", "type": "text", "placeholder": "输入关键字"},
                {"key": "node", "label": "当前节点", "type": "text", "placeholder": "如 资料收集"},
            ]
        elif leaf == "probation":
            cols, rows = _pack(
                ["姓名", "部门", "岗位 · 试用结束", "审批状态", "操作"],
                ("孙某", "技术中心", "前端 · 2026-06-30", "审批中", "查看"),
                ("周某", "产品部", "产品经理 · 2026-07-15", "待发起", "编辑"),
            )
            kpis("14", "试用中", "3", "待发起转正")
            body["filters"] = [
                {"key": "q", "label": "姓名", "type": "text", "placeholder": "输入关键字"},
                {"key": "node", "label": "审批状态", "type": "text", "placeholder": "如 审批中"},
            ]
        elif leaf == "transfer":
            cols, rows = _pack(
                ["姓名", "原部门 / 岗位", "目标部门 / 岗位", "进度 · 申请日", "操作"],
                ("吴某", "研发中心 / Java", "技术中心 / 专家", "审批中 · 5/08", "查看"),
                ("郑某", "人力 / HRBP", "薪酬 / 专员", "草稿 · 5/06", "编辑"),
            )
            kpis("5", "在途变更", "1", "待审批")
            body["filters"] = [
                {"key": "q", "label": "姓名", "type": "text", "placeholder": "输入关键字"},
                {"key": "progress_q", "label": "进度", "type": "text", "placeholder": "关键字"},
            ]
        elif leaf == "offboarding":
            cols, rows = _pack(
                ["姓名", "部门 / 岗位", "最后工作日", "办理节点", "操作"],
                ("钱某", "供应链 · 采购专员", "2026-05-30", "交接中", "办理"),
                ("冯某", "财务 · 会计", "2026-06-08", "待审批", "查看"),
            )
            kpis("2", "在途离职", "1", "待交接")
            body["filters"] = [
                {"key": "q", "label": "姓名", "type": "text", "placeholder": "输入关键字"},
                {"key": "node", "label": "办理节点", "type": "text", "placeholder": "如 交接中"},
            ]
        else:
            cols, rows = _pack(
                ["说明"],
                (f"未知的 staff 子路径：{leaf}",),
            )
            kpis("—", "—", "—", "—")
        body["columns"], body["rows"] = cols, rows
        return body

    if head == "org":
        cols, rows = _pack(
            ["组织编码", "组织名称", "类型", "编制", "在岗", "负责人", "操作"],
            ("ORG-01", "集团总部", "公司", "200", "186", "陈蕾", "详情"),
            ("ORG-01-RD", "研发中心", "部门", "320", "298", "刘洋", "详情"),
            ("ORG-01-HR", "人力资源部", "部门", "45", "42", "王敏", "详情"),
        )
        body["columns"], body["rows"] = cols, rows
        kpis("18", "组织单元", "7", "本月变更")
        if len(segs) >= 2 and segs[1] == "positions":
            body["filters"] = [
                {"key": "q", "label": "岗位名称", "type": "text", "placeholder": "关键字"},
                {
                    "key": "status",
                    "label": "列表状态",
                    "type": "select",
                    "options": list(SELECT_EFFECT),
                },
            ]
        elif len(segs) >= 1 and segs[-1] == "dept":
            body["filters"] = [
                {"key": "q", "label": "部门名称", "type": "text", "placeholder": "关键字"},
                {"key": "owner_q", "label": "负责人", "type": "text", "placeholder": "关键字"},
            ]
        else:
            body["filters"] = [
                {"key": "q", "label": "组织名称 / 编码", "type": "text", "placeholder": "关键字"},
                {
                    "key": "org_kind",
                    "label": "组织类型",
                    "type": "select",
                    "options": [
                        {"value": "", "label": "全部"},
                        {"value": "company", "label": "公司"},
                        {"value": "dept", "label": "部门"},
                    ],
                },
            ]
        return body

    if head == "performance":
        cols, rows = _pack(
            ["指标", "本期", "上期", "单位", "趋势", "操作"],
            ("绩效得分", "86.4", "84.1", "分", "↑", "下钻"),
            ("任务完成率", "92%", "88%", "%", "↑", "下钻"),
            ("工单总量", "1,024", "993", "单", "↑", "下钻"),
        )
        body["columns"], body["rows"] = cols, rows
        kpis("86.4", "团队均分", "12", "待改进项")
        body["filters"] = [
            {"key": "q", "label": "指标名称", "type": "text", "placeholder": "关键字"},
        ]
        return body

    if head == "recruit":
        cols, rows = _pack(
            ["需求编号", "职位", "HC", "在招", "负责人", "状态", "操作"],
            ("RQ-2401", "高级前端工程师", "3", "2", "周琪", "招聘中", "详情"),
            ("RQ-2402", "薪酬专员", "1", "0", "王敏", "暂停", "详情"),
            ("RQ-2309", "Java 开发", "5", "1", "刘洋", "招聘中", "详情"),
        )
        body["columns"], body["rows"] = cols, rows
        kpis("42", "在招职位", "128", "在库简历")
        body["filters"] = [
            {"key": "q", "label": "职位 / 需求编号", "type": "text", "placeholder": "关键字"},
        ]
        return body

    if head == "workflow":
        cols, rows = _pack(
            ["流程编码", "流程名称", "版本", "发布状态", "最近更新", "操作"],
            ("WF-LEAVE", "请假审批流", "v3.2", "已发布", "2026-04-28", "设计"),
            ("WF-EXP", "报销审批流", "v1.8", "草稿", "2026-04-20", "设计"),
            ("WF-ONB", "入职办理流", "v2.0", "已发布", "2026-03-10", "设计"),
        )
        body["columns"], body["rows"] = cols, rows
        kpis("56", "在用流程", "3", "待发布变更")
        body["filters"] = [
            {"key": "q", "label": "流程编码 / 名称", "type": "text", "placeholder": "关键字"},
        ]
        return body

    if head == "attendance":
        cols, rows = _pack(
            ["规则/记录", "适用范围", "说明", "最近变更", "操作"],
            ("早班 09:00-18:00", "总部职能", "午休 12:00-13:00", "2026-04-01", "编辑"),
            ("外勤打卡策略", "销售序列", "需定位 + 照片", "2026-04-12", "编辑"),
            ("补卡次数上限", "全员", "每月 3 次", "2026-01-05", "编辑"),
        )
        body["columns"], body["rows"] = cols, rows
        kpis("98.2%", "本月出勤率", "126", "异常待处理")
        return body

    if head == "payroll":
        cols, rows = _pack(
            ["账期", "核算批次", "人数", "状态", "锁定时间", "操作"],
            ("2026-04", "BATCH-202604-01", "1,284", "已锁定", "2026-05-01 10:00", "查看"),
            ("2026-04", "BATCH-202604-02", "12", "试算中", "-", "查看"),
            ("2026-03", "BATCH-202603-01", "1,276", "已归档", "2026-04-02 09:30", "查看"),
        )
        body["columns"], body["rows"] = cols, rows
        kpis("1,284", "本月发薪人数", "0", "待处理异常")
        return body

    if head == "benefits":
        cols, rows = _pack(
            ["福利项", "规则编码", "适用人群", "额度/说明", "状态", "操作"],
            ("补充医疗", "BNF-MED-01", "正式员工", "按职级分档", "生效", "编辑"),
            ("年节礼包", "BNF-HOL-02", "全员", "人均 800 元", "生效", "编辑"),
            ("健身津贴", "BNF-GYM-03", "研发中心", "500 元/季", "试用", "编辑"),
        )
        body["columns"], body["rows"] = cols, rows
        kpis("12", "福利项", "99.1%", "本月发放完成率")
        return body

    if head == "performance-mgmt":
        cols, rows = _pack(
            ["周期", "方案名称", "覆盖人数", "阶段", "截止日", "操作"],
            ("2026-Q2", "Q2 目标与评估", "860", "目标确认中", "2026-05-15", "进入"),
            ("2026-Q1", "Q1 绩效闭环", "842", "已归档", "2026-04-10", "查看"),
        )
        body["columns"], body["rows"] = cols, rows
        kpis("860", "在评人数", "128", "待校准")
        return body

    if head == "system":
        s1 = segs[1] if len(segs) > 1 else ""
        s2 = segs[2] if len(segs) > 2 else ""
        if s1 == "roles":
            cols, rows = _pack(
                ["角色编码", "角色名称", "类型", "关联用户数", "最近变更", "操作"],
                ("ROLE-HRBP", "HRBP", "预置", "42", "2026-03-01 10:20", "详情"),
                ("ROLE-PAY", "薪酬专员", "预置", "6", "2026-04-12 09:01", "详情"),
                ("ROLE-INT-FE", "内部·前端工程师", "自定义", "128", "2026-05-01 15:44", "编辑"),
            )
            kpis("36", "角色总数", "3", "近 7 日变更")
            body["filters"] = [
                {"key": "q", "label": "角色编码 / 名称", "type": "text", "placeholder": "输入关键字"},
                {
                    "key": "role_type",
                    "label": "类型",
                    "type": "select",
                    "options": [
                        {"value": "", "label": "全部"},
                        {"value": "preset", "label": "预置"},
                        {"value": "custom", "label": "自定义"},
                    ],
                },
            ]
        elif s1 == "permissions":
            cols, rows = _pack(
                ["策略", "主体", "资源范围", "生效状态", "更新人", "操作"],
                ("菜单·员工花名册", "ROLE-HRBP", "组织树 · 只读", "生效", "王敏", "编辑"),
                ("数据·薪酬明细", "ROLE-PAY", "本部门 · 脱敏", "生效", "系统", "授权"),
                ("字段·银行账号", "ROLE-INT-FE", "本人 · 明文", "草稿", "刘洋", "编辑"),
            )
            kpis("128", "策略条目", "4", "待发布草稿")
            body["filters"] = [
                {"key": "q", "label": "策略 / 主体", "type": "text", "placeholder": "输入关键字"},
                {
                    "key": "status",
                    "label": "生效状态",
                    "type": "select",
                    "options": [
                        {"value": "", "label": "全部"},
                        {"value": "active", "label": "生效"},
                        {"value": "inactive", "label": "草稿"},
                    ],
                },
            ]
        elif s1 == "config" and s2 == "dict":
            cols, rows = _pack(
                ["字典编码", "名称", "枚举项数", "状态", "最近发布", "操作"],
                ("DICT-EMP-STATUS", "人员状态", "6", "生效", "2026-02-18", "编辑"),
                ("DICT-CONTRACT-TYPE", "合同类型", "4", "生效", "2026-01-05", "详情"),
                ("DICT-LEAVE-HALF", "请假半天规则", "2", "试用", "2026-04-28", "编辑"),
            )
            kpis("86", "字典项", "5", "本月变更")
            body["filters"] = [
                {"key": "q", "label": "字典编码 / 名称", "type": "text", "placeholder": "输入关键字"},
                {
                    "key": "status",
                    "label": "字典状态",
                    "type": "select",
                    "options": list(COMMON_PAGE_FILTERS[1]["options"]),
                },
            ]
        elif s1 == "integration":
            cols, rows = _pack(
                ["连接器", "环境", "状态", "上次成功同步", "操作"],
                ("AD 账号", "生产", "正常", "2026-05-06 08:10", "详情"),
                ("企业微信通讯录", "生产", "告警", "2026-05-05 22:01", "编辑"),
                ("银行报盘 SFTP", "UAT", "停用", "-", "编辑"),
            )
            kpis("12", "连接器", "1", "异常待处理")
            body["filters"] = [
                {"key": "q", "label": "连接器", "type": "text", "placeholder": "名称关键字"},
                {
                    "key": "env",
                    "label": "环境",
                    "type": "select",
                    "options": [
                        {"value": "", "label": "全部"},
                        {"value": "prod", "label": "生产"},
                        {"value": "uat", "label": "UAT"},
                    ],
                },
            ]
        elif s1 == "logs":
            cols, rows = _pack(
                ["时间", "级别", "模块", "摘要", "操作者", "操作"],
                (
                    "2026-05-06 14:22:01",
                    "INFO",
                    "权限",
                    "ROLE-PAY 绑定用户 +2",
                    "王敏",
                    "查看详情",
                ),
                (
                    "2026-05-06 13:01:44",
                    "WARN",
                    "集成",
                    "企微 token 即将过期",
                    "系统",
                    "查看详情",
                ),
                ("2026-05-06 09:00:00", "ERROR", "登录", "连续失败 5 次 · IP 已封禁", "网关", "查看详情"),
            )
            kpis("18.2万", "今日条数", "0", "严重告警")
            body["filters"] = [
                {"key": "q", "label": "模块 / 摘要", "type": "text", "placeholder": "输入关键字"},
                {
                    "key": "level",
                    "label": "级别",
                    "type": "select",
                    "options": [
                        {"value": "", "label": "全部"},
                        {"value": "ERROR", "label": "ERROR"},
                        {"value": "WARN", "label": "WARN"},
                        {"value": "INFO", "label": "INFO"},
                    ],
                },
            ]
        elif s1 == "snapshots":
            cols, rows = _pack(
                ["快照 ID", "业务域", "版本标签", "创建时间", "操作"],
                ("SNAP-ORG-240501", "组织架构", "v2026.05.01", "2026-05-01 00:05", "对比"),
                ("SNAP-PERM-240428", "权限矩阵", "v2026.04.28", "2026-04-28 18:30", "对比"),
                ("SNAP-DICT-240415", "字典包", "v2026.04.15", "2026-04-15 11:00", "详情"),
            )
            kpis("24", "保留快照", "3", "本月新建")
            body["filters"] = [
                {"key": "q", "label": "业务域", "type": "text", "placeholder": "输入关键字"},
                {"key": "tag", "label": "版本标签", "type": "text", "placeholder": "如 v2026.05.01"},
            ]
        else:
            cols, rows = _pack(
                ["说明"],
                (f"未配置的系统子路径：/{'/'.join(segs)}",),
            )
            kpis("—", "—", "—", "—")
        body["columns"], body["rows"] = cols, rows
        return body

    if head == "my-apply":
        cols, rows = _pack(
            ["申请单号", "类型", "标题摘要", "提交时间", "当前节点", "状态", "操作"],
            ("AP-9921", "出差", "上海客户拜访 3 天", "2026-04-17 09:02", "部门负责人", "审批中", "查看"),
            ("AP-8751", "调岗调薪", "晋升调薪申请", "2026-04-16 14:21", "HR 复核", "审批中", "查看"),
            ("AP-6604", "补卡", "4/12 忘打卡", "2026-04-15 20:10", "考勤员", "已通过", "查看"),
        )
        body["columns"], body["rows"] = cols, rows
        kpis("5", "进行中", "42", "本年累计")
        body["filters"] = [
            {"key": "q", "label": "关键词", "type": "text", "placeholder": "单号 / 标题摘要"},
            {"key": "node", "label": "当前节点", "type": "text", "placeholder": "如 部门负责人"},
        ]
        return body

    if head == "messages":
        cols, rows = _pack(
            ["消息 ID", "类型", "标题", "状态", "时间", "操作"],
            ("m-2001", "审批", "合同续签提醒", "未读", "30 分钟前", "已读"),
            ("m-2002", "系统", "密码策略将升级", "已读", "昨天", "查看"),
            ("m-2003", "订阅", "招聘周报", "未读", "周一 09:00", "查看"),
        )
        body["columns"], body["rows"] = cols, rows
        kpis("3", "未读", "12", "订阅项")
        return body

    if head == "inbox":
        if sub == "done":
            cols, rows = _pack(
                ["流程标题", "发起人", "办结时间", "耗时", "结果", "操作"],
                ("采购申请 · 办公用品", "张三", "2026-04-16 17:20", "1.5 天", "同意", "详情"),
                ("用印申请", "李四", "2026-04-15 11:08", "4 小时", "同意", "详情"),
            )
        elif sub == "initiated":
            cols, rows = _pack(
                ["流程标题", "发起时间", "当前节点", "状态", "操作"],
                ("请假 2 天", "2026-04-10 09:00", "审批人：王敏", "审批中", "撤回"),
                ("加班申请", "2026-04-08 21:30", "考勤确认", "已完成", "查看"),
            )
        else:
            cols, rows = _pack(
                ["标题", "发起人", "到达时间", "所属模块", "SLA", "操作"],
                ("出差申请", "李雷", "2026-04-17 09:02", "我的申请", "剩余 8h", "处理"),
                ("调岗调薪审批", "韩梅梅", "2026-04-16 14:21", "员工管理", "正常", "处理"),
                ("补卡申请", "王敏", "2026-04-15 20:10", "考勤管理", "超时 1h", "处理"),
            )
        body["columns"], body["rows"] = cols, rows
        kpis("18", "待办", "240", "本年已办")
        return body

    if head == "kpi-board":
        cols, rows = _pack(
            ["指标", "本期", "上期", "单位", "趋势", "操作"],
            ("绩效得分", "86.4", "84.1", "分", "↑", "下钻"),
            ("任务完成率", "92%", "88%", "%", "↑", "下钻"),
            ("工单总量", "1,024", "993", "单", "↑", "下钻"),
        )
        body["columns"], body["rows"] = cols, rows
        kpis("86.4", "团队均分", "12", "待改进项")
        return body

    if head == "personalization":
        cols, rows = _pack(
            ["配置项", "当前值", "说明", "操作"],
            ("导航布局", "侧边栏", "可在顶部栏切换", "修改"),
            ("主题", "浅色 · 蓝", "跟随组织策略", "修改"),
            ("首页卡片顺序", "已自定义", "拖拽排序已保存", "重置"),
        )
        body["columns"], body["rows"] = cols, rows
        return body

    if head == "quick-links":
        cols, rows = _pack(
            ["快捷名称", "目标路径", "排序", "最近使用", "操作"],
            ("发起请假", "/my-apply/leave", "1", "今天", "编辑"),
            ("工资单", "/payroll/payslip", "2", "上月", "编辑"),
            ("待办箱", "/inbox/todo", "3", "今天", "编辑"),
        )
        body["columns"], body["rows"] = cols, rows
        return body

    if head == "favorites":
        cols, rows = _pack(
            ["收藏流程", "分类", "添加时间", "操作"],
            ("调岗调薪审批", "人事", "2026-03-01", "取消收藏"),
            ("出差申请", "行政", "2026-02-18", "取消收藏"),
            ("绩效自评", "绩效", "2026-01-05", "取消收藏"),
        )
        body["columns"], body["rows"] = cols, rows
        return body

    # 默认：仍给出可用表格，便于未单独配置的路径
    cols, rows = _pack(
        ["编号", "名称", "说明", "最近更新", "操作"],
        ("T-001", "示例记录 A", f"路径 {path} 的 Mock 数据。", "2026-05-02", "详情"),
        ("T-002", "示例记录 B", "可接真实接口替换本页。", "2026-05-01", "详情"),
        ("T-003", "示例记录 C", "筛选与导出按钮为占位。", "2026-04-30", "详情"),
    )
    body["columns"], body["rows"] = cols, rows
    return body


def _row_cells_any(r: object) -> list[str]:
    if isinstance(r, dict):
        return [str(x) for x in (r.get("cells") or [])]
    if isinstance(r, (list, tuple)):
        return [str(x) for x in r]
    return []


def _find_page_row(page_path: str, row_id: str) -> tuple[list[str], list[str]] | None:
    """在 mock_page_data 结果中按首列 / id / 任意单元格匹配行。"""
    row_id = (row_id or "").strip()
    if not row_id:
        return None
    body = mock_page_data(page_path)
    cols = [str(x) for x in (body.get("columns") or [])]
    for r in body.get("rows") or []:
        cells = _row_cells_any(r)
        if isinstance(r, dict) and r.get("id") is not None:
            rid = str(r.get("id"))
        elif cells:
            rid = cells[0]
        else:
            rid = ""
        if rid == row_id or row_id in cells:
            return cols, cells
    return None


def _pairs_skip_action(columns: list[str], cells: list[str]) -> list[tuple[str, str]]:
    pairs: list[tuple[str, str]] = []
    for i, lab in enumerate(columns):
        if str(lab) == "操作":
            continue
        v = cells[i] if i < len(cells) else "—"
        pairs.append((str(lab), str(v)))
    return pairs


_STAFF_MODAL_PATH: dict[str, str] = {
    "staff-roster": "/staff/roster",
    "staff-onboarding": "/staff/onboarding",
    "staff-probation": "/staff/probation",
    "staff-transfer": "/staff/transfer",
    "staff-offboarding": "/staff/offboarding",
}


def _modal_payload(
    title: str,
    intro: str,
    rows: list[tuple[str, str]],
    actions: list[dict] | None = None,
) -> dict:
    return {
        "title": title,
        "intro": intro,
        "sections": [{"title": "", "rows": [{"label": a, "value": b} for a, b in rows]}],
        "actions": actions
        or [
            {"id": "close", "label": "关闭", "style": "secondary"},
            {"id": "submit", "label": "确认", "style": "primary"},
        ],
    }


def _modal_kv_section(rows: list[tuple[str, str]]) -> list[dict]:
    return [{"title": "", "rows": [{"label": a, "value": b} for a, b in rows]}]


def _try_staff_modal(kind: str, id_: str, ctx: str, page_path: str) -> dict | None:
    """员工域：新建表单 / 查看摘要 / 办理（通过·驳回）。与前端 staff-* modal kind 对应。"""
    staff_kinds = frozenset({
        "staff-roster",
        "staff-onboarding",
        "staff-probation",
        "staff-transfer",
        "staff-offboarding",
    })
    if kind not in staff_kinds:
        return None
    ctx_l = (ctx or "view").strip().lower()
    rid = id_ or "—"
    label = {
        "staff-roster": "员工花名册",
        "staff-onboarding": "入职办理",
        "staff-probation": "转正申请",
        "staff-transfer": "调岗调薪",
        "staff-offboarding": "离职办理",
    }[kind]
    timeline_demo = [
        {"time": "2026-05-05 10:20", "title": "提交申请", "meta": "发起人 · 系统记录"},
        {"time": "2026-05-06 09:15", "title": "当前节点", "meta": "待您处理 / 已查看"},
    ]

    if ctx_l == "create":
        if kind == "staff-roster":
            fields: list[dict] = [
                {"name": "empNo", "label": "工号", "type": "text", "placeholder": "如 E-2025-001"},
                {"name": "name", "label": "姓名", "type": "text", "required": True},
                {"name": "dept", "label": "部门", "type": "text"},
                {"name": "job", "label": "岗位", "type": "text"},
                {"name": "hireDate", "label": "入职日期", "type": "date"},
                {
                    "name": "status",
                    "label": "人员状态",
                    "type": "select",
                    "options": [
                        {"value": "active", "label": "在职"},
                        {"value": "probation", "label": "试用"},
                        {"value": "pending", "label": "待入职"},
                    ],
                },
            ]
        elif kind == "staff-onboarding":
            fields = [
                {"name": "name", "label": "姓名", "type": "text", "required": True},
                {"name": "dept", "label": "入职部门", "type": "text", "required": True},
                {"name": "job", "label": "拟任岗位", "type": "text"},
                {"name": "start", "label": "计划到岗日", "type": "date"},
                {
                    "name": "note",
                    "label": "备注",
                    "type": "textarea",
                    "placeholder": "Offer 编号、特殊约定等",
                },
            ]
        elif kind == "staff-probation":
            fields = [
                {"name": "name", "label": "姓名", "type": "text", "required": True},
                {"name": "dept", "label": "部门", "type": "text"},
                {"name": "job", "label": "岗位", "type": "text"},
                {"name": "end", "label": "试用结束日", "type": "date", "required": True},
            ]
        elif kind == "staff-transfer":
            fields = [
                {"name": "name", "label": "姓名", "type": "text", "required": True},
                {"name": "from_", "label": "原部门 / 岗位", "type": "text"},
                {"name": "to", "label": "目标部门 / 岗位", "type": "text", "required": True},
                {"name": "eff", "label": "希望生效日", "type": "date"},
            ]
        else:
            fields = [
                {"name": "name", "label": "姓名", "type": "text", "required": True},
                {"name": "lastDay", "label": "最后工作日", "type": "date", "required": True},
                {
                    "name": "reason",
                    "label": "离职类型",
                    "type": "select",
                    "options": [
                        {"value": "voluntary", "label": "主动离职"},
                        {"value": "mutual", "label": "协商解除"},
                    ],
                },
                {"name": "note", "label": "说明", "type": "textarea"},
            ]
        return {
            "title": f"新建 · {label}",
            "intro": "与列表页主按钮串联；保存为 Mock。",
            "variant": "form",
            "fields": fields,
            "actions": [
                {"id": "close", "label": "取消", "style": "secondary"},
                {"id": "submit", "label": "保存", "style": "primary"},
            ],
        }

    if ctx_l == "edit" and kind == "staff-probation":
        return {
            "title": f"编辑 · {label}",
            "intro": "调整草稿态申请。",
            "variant": "form",
            "fields": [
                {"name": "name", "label": "姓名", "type": "text", "value": rid},
                {"name": "end", "label": "试用结束日", "type": "date"},
            ],
            "actions": [
                {"id": "close", "label": "取消", "style": "secondary"},
                {"id": "submit", "label": "保存草稿", "style": "primary"},
            ],
        }

    if ctx_l == "edit" and kind == "staff-transfer":
        return {
            "title": f"编辑 · {label}",
            "intro": "调整草稿态调岗调薪单。",
            "variant": "form",
            "fields": [
                {"name": "name", "label": "姓名", "type": "text", "value": rid},
                {"name": "to", "label": "目标部门 / 岗位", "type": "text"},
                {"name": "eff", "label": "希望生效日", "type": "date"},
            ],
            "actions": [
                {"id": "close", "label": "取消", "style": "secondary"},
                {"id": "submit", "label": "保存草稿", "style": "primary"},
            ],
        }

    if ctx_l == "approve":
        found_a = _find_page_row(page_path, rid) or _find_page_row(_STAFF_MODAL_PATH.get(kind, page_path), rid)
        if found_a:
            fc_a, cs_a = found_a
            rows_kv = _pairs_skip_action(fc_a, cs_a)
        else:
            rows_kv = [
                ("业务单号", rid),
                ("所属模块", label),
                ("当前路由", page_path),
            ]
        return {
            "title": f"办理 · {label}",
            "intro": "下列字段来自当前列表行；「通过 / 驳回」为 Mock。",
            "sections": _modal_kv_section(rows_kv),
            "variant": "form",
            "fields": [
                {
                    "name": "opinion",
                    "label": "审批意见",
                    "type": "textarea",
                    "placeholder": "通过说明或驳回原因（选填）",
                }
            ],
            "timeline": timeline_demo,
            "actions": [
                {"id": "reject", "label": "驳回", "style": "secondary"},
                {"id": "close", "label": "关闭", "style": "secondary"},
                {"id": "approve", "label": "通过", "style": "primary"},
            ],
        }

    found_d = _find_page_row(page_path, rid) or _find_page_row(_STAFF_MODAL_PATH.get(kind, page_path), rid)
    if found_d:
        fc_d, cs_d = found_d
        detail_rows = _pairs_skip_action(fc_d, cs_d)
        title_sfx = f" · {cs_d[0]}" if cs_d else ""
    else:
        detail_rows = [
            ("引用 ID", rid),
            ("模块", label),
            ("路由", page_path),
        ]
        title_sfx = ""
    body: dict = {
        "title": f"查看 · {label}{title_sfx}",
        "intro": "与当前列表行数据一致。",
        "sections": _modal_kv_section(detail_rows),
        "actions": [{"id": "close", "label": "关闭", "style": "primary"}],
    }
    if kind != "staff-roster":
        body["timeline"] = timeline_demo
    return body


def _try_system_modal(kind: str, id_: str, ctx: str, page_path: str) -> dict | None:
    """系统设置六页 · 与 Figma 1087:4362 / 4749 / 5136 / 5523 / 5910 / 6297 画板串联。"""
    if kind not in (
        "role-form",
        "perm-form",
        "dict-form",
        "integration-form",
        "log-filter",
        "snapshot-run",
        "snapshot-row",
        "log-detail",
    ):
        return None
    ctx_l = (ctx or "").strip().lower()
    rid = id_ or "new"

    if kind == "role-form":
        if ctx_l == "create" or rid == "new":
            return {
                "title": "新建角色",
                "intro": "定义角色编码与可见菜单范围（Mock，对齐角色管理画板）。",
                "variant": "form",
                "fields": [
                    {"name": "code", "label": "角色编码", "type": "text", "placeholder": "ROLE-XXX", "required": True},
                    {"name": "name", "label": "角色名称", "type": "text", "placeholder": "如：招聘专员", "required": True},
                    {
                        "name": "type",
                        "label": "类型",
                        "type": "select",
                        "options": [
                            {"value": "preset", "label": "预置"},
                            {"value": "custom", "label": "自定义"},
                        ],
                    },
                ],
                "actions": [
                    {"id": "close", "label": "取消", "style": "secondary"},
                    {"id": "submit", "label": "保存", "style": "primary"},
                ],
            }
        found_role = _find_page_row(page_path, rid) or _find_page_row("/system/roles", rid)
        if found_role:
            fc_r, cs_r = found_role
            return _modal_payload(
                f"角色 · {cs_r[0] if cs_r else rid}",
                "与角色列表行一致。",
                _pairs_skip_action(fc_r, cs_r),
                [{"id": "close", "label": "关闭", "style": "primary"}],
            )
        return _modal_payload(
            f"角色 · {rid}",
            "未找到该角色。",
            [("角色编码", rid), ("路由", page_path)],
            [{"id": "close", "label": "关闭", "style": "primary"}],
        )

    if kind == "perm-form":
        if ctx_l == "create" or rid == "new":
            return {
                "title": "新建权限策略",
                "intro": "绑定主体与资源范围，可后续接「授权 / 数据权限」Tab（权限画板）。",
                "variant": "form",
                "fields": [
                    {"name": "name", "label": "策略名称", "type": "text", "required": True},
                    {"name": "subject", "label": "主体（角色/用户）", "type": "text", "placeholder": "ROLE-HRBP"},
                    {"name": "scope", "label": "资源范围说明", "type": "textarea", "placeholder": "菜单、字段或行级规则摘要"},
                ],
                "actions": [
                    {"id": "close", "label": "取消", "style": "secondary"},
                    {"id": "submit", "label": "保存草稿", "style": "primary"},
                ],
            }
        if ctx_l == "grant":
            found_g = _find_page_row(page_path, rid) or _find_page_row("/system/permissions", rid)
            rows_g = (
                _pairs_skip_action(found_g[0], found_g[1]) + [("目标用户 / 角色", "从目录选择")]
                if found_g
                else [("策略条目", rid), ("目标用户 / 角色", "从目录选择")]
            )
            auth_title = found_g[1][0] if found_g and found_g[1] else rid
            return _modal_payload(
                f"授权 · {auth_title}",
                "下列字段来自权限列表当前行；生产变更需双人复核。",
                rows_g,
                [
                    {"id": "submit", "label": "保存授权", "style": "primary"},
                    {"id": "close", "label": "取消", "style": "secondary"},
                ],
            )
        found_p = _find_page_row(page_path, rid) or _find_page_row("/system/permissions", rid)
        if found_p:
            fc_p, cs_p = found_p
            return _modal_payload(
                f"策略 · {cs_p[0] if cs_p else rid}",
                "与权限列表行一致。",
                _pairs_skip_action(fc_p, cs_p),
                [{"id": "close", "label": "关闭", "style": "primary"}],
            )
        return _modal_payload(
            f"策略 · {rid}",
            "未找到该策略行。",
            [("策略 ID", rid), ("路由", page_path)],
            [{"id": "close", "label": "关闭", "style": "primary"}],
        )

    if kind == "dict-form":
        if ctx_l == "create" or rid == "new":
            return {
                "title": "新建字典",
                "intro": "字典编码全局唯一；枚举项可在保存后维护（字典管理画板）。",
                "variant": "form",
                "fields": [
                    {"name": "code", "label": "字典编码", "type": "text", "placeholder": "DICT-XXX", "required": True},
                    {"name": "title", "label": "显示名称", "type": "text", "required": True},
                ],
                "actions": [
                    {"id": "close", "label": "取消", "style": "secondary"},
                    {"id": "submit", "label": "创建", "style": "primary"},
                ],
            }
        found_dict = _find_page_row(page_path, rid) or _find_page_row("/system/config/dict", rid)
        if found_dict:
            fc_dct, cs_dct = found_dict
            return _modal_payload(
                f"字典 · {cs_dct[0] if cs_dct else rid}",
                "与字典列表行一致。",
                _pairs_skip_action(fc_dct, cs_dct),
                [
                    {"id": "submit", "label": "发布新版本", "style": "primary"},
                    {"id": "close", "label": "关闭", "style": "secondary"},
                ],
            )
        return _modal_payload(
            f"字典 · {rid}",
            "未找到该字典行。",
            [("字典编码", rid), ("路由", page_path)],
            [
                {"id": "submit", "label": "发布新版本", "style": "primary"},
                {"id": "close", "label": "关闭", "style": "secondary"},
            ],
        )

    if kind == "integration-form":
        if ctx_l == "create" or rid == "new":
            return {
                "title": "注册连接器",
                "intro": "配置端点、凭证与同步频率（集成中心画板）。",
                "variant": "form",
                "fields": [
                    {"name": "name", "label": "连接器名称", "type": "text", "required": True},
                    {"name": "env", "label": "环境", "type": "select", "options": [
                        {"value": "prod", "label": "生产"},
                        {"value": "uat", "label": "UAT"},
                    ]},
                    {"name": "endpoint", "label": "Base URL", "type": "text", "placeholder": "https://"},
                ],
                "actions": [
                    {"id": "close", "label": "取消", "style": "secondary"},
                    {"id": "submit", "label": "保存", "style": "primary"},
                ],
            }
        found_int = _find_page_row(page_path, rid) or _find_page_row("/system/integration", rid)
        if found_int:
            fc_i, cs_i = found_int
            return _modal_payload(
                f"连接器 · {cs_i[0] if cs_i else rid}",
                "与集成中心列表行一致。",
                _pairs_skip_action(fc_i, cs_i),
                [{"id": "close", "label": "关闭", "style": "primary"}],
            )
        return _modal_payload(
            f"连接器 · {rid}",
            "未找到该连接器。",
            [("连接器 ID", rid), ("路由", page_path)],
            [{"id": "close", "label": "关闭", "style": "primary"}],
        )

    if kind == "log-filter":
        return {
            "title": "日志高级筛选",
            "intro": "按时间、级别、模块与关键字过滤（日志查询画板）。",
            "variant": "form",
            "fields": [
                {"name": "from", "label": "开始时间", "type": "text", "placeholder": "2026-05-01 00:00"},
                {"name": "to", "label": "结束时间", "type": "text", "placeholder": "2026-05-06 23:59"},
                {
                    "name": "level",
                    "label": "级别",
                    "type": "select",
                    "options": [
                        {"value": "", "label": "全部"},
                        {"value": "ERROR", "label": "ERROR"},
                        {"value": "WARN", "label": "WARN"},
                        {"value": "INFO", "label": "INFO"},
                    ],
                },
            ],
            "actions": [
                {"id": "close", "label": "取消", "style": "secondary"},
                {"id": "submit", "label": "应用筛选", "style": "primary"},
            ],
        }

    if kind == "snapshot-run":
        return {
            "title": "新建快照对比",
            "intro": "选择左右版本生成差异报告（快照对比画板）。",
            "variant": "form",
            "fields": [
                {
                    "name": "left",
                    "label": "基准快照",
                    "type": "select",
                    "options": [
                        {"value": "SNAP-ORG-240501", "label": "SNAP-ORG-240501"},
                        {"value": "SNAP-PERM-240428", "label": "SNAP-PERM-240428"},
                    ],
                },
                {
                    "name": "right",
                    "label": "对比快照",
                    "type": "select",
                    "options": [
                        {"value": "SNAP-PERM-240428", "label": "SNAP-PERM-240428"},
                        {"value": "SNAP-DICT-240415", "label": "SNAP-DICT-240415"},
                    ],
                },
            ],
            "actions": [
                {"id": "close", "label": "取消", "style": "secondary"},
                {"id": "submit", "label": "生成对比", "style": "primary"},
            ],
        }

    if kind == "snapshot-row":
        found_snap = _find_page_row("/system/snapshots", rid)
        snap_pairs = _pairs_skip_action(found_snap[0], found_snap[1]) if found_snap else [("快照 ID", rid)]
        if ctx_l == "compare":
            return _modal_payload(
                "快照差异 · " + rid,
                "下列为所选快照在列表中的行；左右对比为演示数据。",
                snap_pairs
                + [
                    ("右侧候选", "在「新建对比任务」中选择"),
                    ("差异摘要", "示例：组织节点 +3 / 权限 −1"),
                ],
                [{"id": "close", "label": "关闭", "style": "primary"}],
            )
        if found_snap:
            fc_s, cs_s = found_snap
            return _modal_payload(
                f"快照详情 · {cs_s[0] if cs_s else rid}",
                "与快照列表行一致。",
                snap_pairs,
                [{"id": "close", "label": "关闭", "style": "primary"}],
            )
        return _modal_payload(
            "快照",
            "未找到该快照。",
            [("ID", rid)],
            [{"id": "close", "label": "关闭", "style": "primary"}],
        )

    if kind == "log-detail":
        found_log = _find_page_row("/system/logs", rid)
        if found_log:
            fc_l, cs_l = found_log
            try:
                si = fc_l.index("摘要")
                title_l = cs_l[si] if si < len(cs_l) else rid
            except ValueError:
                title_l = rid
            return _modal_payload(
                f"日志详情 · {title_l}",
                "与日志列表行一致。",
                _pairs_skip_action(fc_l, cs_l),
                [{"id": "close", "label": "关闭", "style": "primary"}],
            )
        return _modal_payload(
            "日志详情",
            "未找到该日志。",
            [("引用", rid)],
            [{"id": "close", "label": "关闭", "style": "primary"}],
        )

    return None


def mock_modal(kind: str, id_: str, page_path: str, ctx: str) -> dict:
    """弹窗内容：与前端 data-hrms-modal / Hash 参数对应。"""
    kind = (kind or "").strip()
    id_ = (id_ or "").strip()
    page_path = _norm_api_path(page_path or "/")
    ctx = (ctx or "").strip()

    st = _try_staff_modal(kind, id_, ctx, page_path)
    if st is not None:
        return st

    st_sys = _try_system_modal(kind, id_, ctx, page_path)
    if st_sys is not None:
        return st_sys

    if kind == "ann":
        for a in ANNOUNCEMENTS:
            if str(a.get("id")) == id_:
                return _modal_payload(
                    a["title"],
                    "公告详情（列表 → 弹窗串联 Mock）",
                    [
                        ("公告编号", str(a["id"])),
                        ("发布时间", a["publishedAt"]),
                        ("发布人", a["publisher"]),
                        ("可见范围", a["scope"]),
                        ("状态", a["status"]),
                    ],
                    [{"id": "close", "label": "关闭", "style": "primary"}],
                )
        return _modal_payload("公告", "未找到该公告。", [("请求编号", id_ or "-")], [{"id": "close", "label": "关闭", "style": "primary"}])

    if kind == "wf":
        for w in INBOX_TODO:
            if w.get("id") == id_:
                return _modal_payload(
                    "处理流程 · " + w["title"],
                    "审批意见、附件与轨迹区。",
                    [
                        ("流程单号", id_),
                        ("发起人", w["initiator"]),
                        ("到达时间", w["arrivedAt"]),
                        ("所属模块", w["module"]),
                        ("状态", w["status"]),
                    ],
                    [
                        {"id": "approve", "label": "同意", "style": "primary"},
                        {"id": "close", "label": "关闭", "style": "secondary"},
                    ],
                )
        return _modal_payload("待办处理", "未匹配的流程单。", [("引用 ID", id_ or "-")])

    if kind == "msg":
        for m in MESSAGES:
            if m.get("id") == id_:
                return _modal_payload(
                    "【" + m["type"] + "】" + m["title"],
                    "来自 " + m["from"] + " · " + m["time"],
                    [
                        ("消息 ID", m["id"]),
                        ("类型", m["type"]),
                        ("状态", m["status"]),
                    ],
                    [{"id": "close", "label": "关闭", "style": "primary"}],
                )
        return _modal_payload("消息", "未找到消息。", [("ID", id_ or "-")])

    if kind in ("org-form", "dept-form", "pos-form"):
        ctx_ol = (ctx or "").strip().lower()
        if ctx_ol == "create" or id_ == "new":
            titles_o = {"org-form": "新建组织", "dept-form": "新建部门", "pos-form": "新建岗位"}
            return {
                "title": titles_o[kind],
                "intro": "与列表「新建」按钮串联。",
                "variant": "form",
                "fields": [
                    {"name": "code", "label": "编码", "type": "text", "placeholder": "如 ORG-XX", "required": True},
                    {"name": "name", "label": "名称", "type": "text", "required": True},
                ],
                "actions": [
                    {"id": "close", "label": "取消", "style": "secondary"},
                    {"id": "submit", "label": "保存", "style": "primary"},
                ],
            }
        found_o = _find_page_row(page_path, id_)
        o_lab = {"org-form": "组织", "dept-form": "部门", "pos-form": "岗位"}.get(kind, "信息")
        if found_o:
            fc_o, cs_o = found_o
            return _modal_payload(
                f"{o_lab} · {cs_o[0] if cs_o else id_}",
                "与列表行一致。",
                _pairs_skip_action(fc_o, cs_o),
                [{"id": "close", "label": "关闭", "style": "primary"}],
            )
        return _modal_payload(
            f"{o_lab} · {id_}",
            "未找到该行。",
            [("编码/主键", id_), ("路由", page_path)],
            [{"id": "close", "label": "关闭", "style": "primary"}],
        )

    if kind == "recruit-form":
        ctx_rf = (ctx or "").strip().lower()
        if ctx_rf == "create" or id_ == "new":
            return {
                "title": "新建招聘需求",
                "intro": "与「招聘管理」列表列一致：需求编号、职位、HC、在招、负责人、状态。",
                "variant": "form",
                "fields": [
                    {"name": "reqNo", "label": "需求编号", "type": "text", "placeholder": "如 RQ-2410", "required": True},
                    {"name": "position", "label": "职位", "type": "text", "required": True, "placeholder": "如 高级前端工程师"},
                    {"name": "hc", "label": "HC", "type": "text", "placeholder": "计划编制，如 3"},
                    {"name": "hiring", "label": "在招", "type": "text", "placeholder": "当前在招人数，如 2"},
                    {"name": "owner", "label": "负责人", "type": "text", "placeholder": "如 周琪"},
                    {
                        "name": "status",
                        "label": "状态",
                        "type": "select",
                        "options": [
                            {"value": "recruiting", "label": "招聘中"},
                            {"value": "paused", "label": "暂停"},
                            {"value": "draft", "label": "草稿"},
                        ],
                    },
                    {
                        "name": "jd",
                        "label": "职位描述 / 任职资格",
                        "type": "textarea",
                        "placeholder": "岗位职责、任职要求、工作地点等",
                    },
                ],
                "actions": [
                    {"id": "close", "label": "取消", "style": "secondary"},
                    {"id": "submit", "label": "创建需求", "style": "primary"},
                ],
            }
        found_rf = _find_page_row("/recruit", id_)
        if found_rf:
            fc_rf, cs_rf = found_rf
            return _modal_payload(
                f"招聘需求 · {cs_rf[0] if cs_rf else id_}",
                "与列表行一致。",
                _pairs_skip_action(fc_rf, cs_rf),
                [
                    {"id": "submit", "label": "保存草稿", "style": "primary"},
                    {"id": "close", "label": "关闭", "style": "secondary"},
                ],
            )
        return _modal_payload(
            "招聘需求",
            "未找到该需求。",
            [("需求编号", id_ or "-")],
            [{"id": "close", "label": "关闭", "style": "primary"}],
        )

    if kind == "workflow-form":
        ctx_wf = (ctx or "").strip().lower()
        if ctx_wf == "create" or id_ == "new":
            return {
                "title": "新建流程定义",
                "intro": "与「流程中心」列表列一致：流程编码、流程名称、版本、发布状态。",
                "variant": "form",
                "fields": [
                    {"name": "code", "label": "流程编码", "type": "text", "placeholder": "如 WF-LEAVE", "required": True},
                    {"name": "name", "label": "流程名称", "type": "text", "required": True, "placeholder": "如 请假审批流"},
                    {"name": "ver", "label": "版本", "type": "text", "placeholder": "如 v3.2"},
                    {
                        "name": "publishStatus",
                        "label": "发布状态",
                        "type": "select",
                        "options": [
                            {"value": "published", "label": "已发布"},
                            {"value": "draft", "label": "草稿"},
                        ],
                    },
                    {"name": "changelog", "label": "变更说明", "type": "textarea", "placeholder": "本轮版本变更摘要（选填）"},
                ],
                "actions": [
                    {"id": "close", "label": "取消", "style": "secondary"},
                    {"id": "submit", "label": "保存", "style": "primary"},
                ],
            }
        found_wf = _find_page_row("/workflow", id_)
        if found_wf:
            fc_w, cs_w = found_wf
            is_design = ctx_wf == "design"
            title_w = ("流程设计 · " if is_design else "流程 · ") + (cs_w[0] if cs_w else id_)
            intro_w = (
                "基于当前行打开流程设计说明；下列为列表中的流程信息。"
                if is_design
                else "与列表行一致。"
            )
            actions_w: list[dict] = (
                [
                    {"id": "submit", "label": "进入画布", "style": "primary"},
                    {"id": "close", "label": "关闭", "style": "secondary"},
                ]
                if is_design
                else [{"id": "close", "label": "关闭", "style": "primary"}]
            )
            return _modal_payload(title_w, intro_w, _pairs_skip_action(fc_w, cs_w), actions_w)
        return _modal_payload(
            "流程",
            "未找到该流程。",
            [("流程编码", id_ or "-")],
            [{"id": "close", "label": "关闭", "style": "primary"}],
        )

    if kind == "record":
        ctx_rec = (ctx or "").strip().lower()
        if ctx_rec == "create" or id_ == "new":
            if page_path == "/my-apply":
                return {
                    "title": "发起申请",
                    "intro": "与「我的申请」列表字段对齐的演示表单。",
                    "variant": "form",
                    "fields": [
                        {
                            "name": "type",
                            "label": "类型",
                            "type": "select",
                            "options": [
                                {"value": "leave", "label": "请假"},
                                {"value": "trip", "label": "出差"},
                                {"value": "exp", "label": "报销"},
                                {"value": "other", "label": "其他"},
                            ],
                        },
                        {
                            "name": "title",
                            "label": "标题摘要",
                            "type": "text",
                            "required": True,
                            "placeholder": "简要说明申请事项",
                        },
                        {"name": "reason", "label": "事由说明", "type": "textarea", "placeholder": "详细说明（选填）"},
                    ],
                    "actions": [
                        {"id": "close", "label": "取消", "style": "secondary"},
                        {"id": "submit", "label": "提交", "style": "primary"},
                    ],
                }
            return {
                "title": "新建记录",
                "intro": "当前路由的通用新建表单。",
                "variant": "form",
                "fields": [
                    {"name": "code", "label": "编号", "type": "text", "placeholder": "主键 / 编码"},
                    {"name": "name", "label": "名称", "type": "text", "required": True},
                    {"name": "remark", "label": "说明", "type": "textarea"},
                ],
                "actions": [
                    {"id": "close", "label": "取消", "style": "secondary"},
                    {"id": "submit", "label": "保存", "style": "primary"},
                ],
            }
        if ctx_rec == "inbox-done" or page_path == "/inbox/done":
            for d in INBOX_DONE:
                if d.get("id") == id_:
                    return _modal_payload(
                        "已办详情 · " + str(d.get("title", "")),
                        "与已办列表行一致。",
                        [
                            ("流程标题", str(d.get("title", ""))),
                            ("发起人", str(d.get("initiator", ""))),
                            ("办结时间", str(d.get("closedAt", ""))),
                            ("耗时", str(d.get("duration", ""))),
                            ("结果", str(d.get("result", ""))),
                        ],
                        [{"id": "close", "label": "关闭", "style": "primary"}],
                    )
        found_rec = _find_page_row(page_path, id_)
        if found_rec:
            fc_r, cs_r = found_rec
            return _modal_payload(
                f"详情 · {cs_r[0] if cs_r else id_}",
                "与当前列表行一致。",
                _pairs_skip_action(fc_r, cs_r),
                [
                    {"id": "submit", "label": "保存草稿", "style": "primary"},
                    {"id": "close", "label": "关闭", "style": "secondary"},
                ],
            )
        return _modal_payload(
            "记录详情 · " + (id_ or "未命名"),
            "该路由下未匹配到 Mock 列表行；真实环境替换为详情接口。",
            [
                ("业务主键", id_ or "-"),
                ("当前路由", page_path),
                ("附加上下文", ctx or "无"),
            ],
            [
                {"id": "submit", "label": "保存草稿", "style": "primary"},
                {"id": "close", "label": "关闭", "style": "secondary"},
            ],
        )

    if kind == "wb-quick":
        label = id_
        for qa in DASHBOARD_SUMMARY.get("quickActions", []):
            if qa.get("id") == id_:
                label = qa.get("label", id_)
                break
        return _modal_payload(
            "快捷入口 · " + label,
            "从工作台快捷区打开（与 Figma 快捷入口画板串联）。",
            [
                ("动作 ID", id_ or "-"),
                ("下一步", "跳转至对应发起页或流程模板"),
            ],
            [
                {"id": "submit", "label": "进入办理", "style": "primary"},
                {"id": "close", "label": "取消", "style": "secondary"},
            ],
        )

    if kind == "wb-todo":
        for t in DASHBOARD_SUMMARY.get("workbenchTodos", []):
            if t.get("id") == id_:
                return _modal_payload(
                    "待办 · " + t["title"],
                    t.get("meta", ""),
                    [("待办 ID", id_), ("处理人", "当前登录用户")],
                    [
                        {"id": "submit", "label": "去处理", "style": "primary"},
                        {"id": "close", "label": "关闭", "style": "secondary"},
                    ],
                )
        return _modal_payload("待办", "未找到该待办项。", [("ID", id_)])

    if kind == "wb-feed":
        for f in DASHBOARD_SUMMARY.get("announcementFeed", []):
            if f.get("id") == id_:
                return _modal_payload(
                    f["title"],
                    f.get("desc", ""),
                    [("标签", f.get("tag", "")), ("提醒 ID", id_)],
                    [{"id": "close", "label": "知道了", "style": "primary"}],
                )
        return _modal_payload("提醒", "未找到条目。", [("ID", id_)])

    if kind == "wb-sched":
        for s in DASHBOARD_SUMMARY.get("schedule", []):
            if s.get("id") == id_:
                return _modal_payload(
                    s.get("time", "") + " · " + s.get("title", "日程"),
                    s.get("meta", ""),
                    [("日程 ID", id_)],
                    [{"id": "close", "label": "关闭", "style": "primary"}],
                )
        return _modal_payload("日程", "未找到日程。", [("ID", id_)])

    if kind == "wfc":
        return _modal_payload(
            "发起流程",
            "顶部栏「发起流程」入口（与 Figma 工作台顶栏串联）。",
            [
                ("流程模板", ctx or "请假 / 出差 / 报销 / 入职 …"),
                ("事由摘要", "在此填写申请说明"),
                ("抄送", "直属上级、HRBP"),
            ],
            [
                {"id": "submit", "label": "下一步", "style": "primary"},
                {"id": "close", "label": "取消", "style": "secondary"},
            ],
        )

    if kind == "legal":
        title = "隐私政策" if id_ == "privacy" else "用户协议"
        return _modal_payload(
            title,
            "以下为占位条款，实际应以法务审定文本为准。",
            [
                ("版本", "2026-01"),
                ("更新日期", "2026-05-02"),
                ("摘要", "信息收集范围、使用目的、存储期限与联系方式等。"),
            ],
            [{"id": "close", "label": "我已阅读", "style": "primary"}],
        )

    return _modal_payload(
        "弹窗",
        f"未知类型 kind={kind!r}，占位内容。",
        [("ID", id_ or "-"), ("路径", page_path)],
        [{"id": "close", "label": "关闭", "style": "primary"}],
    )


class Handler(BaseHTTPRequestHandler):
    server_version = "hrms-mock/0.1"

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/auth/login":
            try:
                body = _read_json_body(self)
            except json.JSONDecodeError:
                return _bad(self, "BAD_JSON", "请求体不是合法 JSON", status=400)
            username = (body.get("username") or body.get("account") or "").strip()
            pw = str(body.get("password") or "").strip()
            remember = bool(body.get("rememberMe"))
            if not username or not pw:
                return _bad(self, "VALIDATION", "请输入账号与密码", status=400)
            if pw.lower() == "wrong":
                return _bad(self, "AUTH_FAILED", "账号或密码不正确", status=401)
            if len(pw) < 6:
                return _bad(self, "VALIDATION", "密码长度至少 6 位", status=400)
            token = secrets.token_urlsafe(32)
            return _ok(
                self,
                {
                    "token": token,
                    "rememberMe": remember,
                    "user": {"displayName": "演示用户", "username": username},
                },
            )

        return _not_found(self)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query or "")

        if path == "/api/health":
            return _ok(self, {"status": "up"})

        if path == "/api/auth/qr-session":
            sid = uuid.uuid4().hex
            QR_SESSIONS[sid] = time.time()
            return _ok(
                self,
                {
                    "sessionId": sid,
                    "expiresAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + 300)),
                    "hint": "请使用企业微信/钉钉扫描（联调前为占位会话）",
                },
            )

        if path == "/api/auth/qr-status":
            sid = (qs.get("sessionId", [""])[0] or "").strip()
            if not sid or sid not in QR_SESSIONS:
                return _bad(self, "NOT_FOUND", "会话不存在或已过期", status=404)
            return _ok(self, {"status": "pending", "message": "等待扫码确认"})

        if path == "/api/dashboard/summary":
            return _ok(self, DASHBOARD_SUMMARY)

        if path == "/api/page-data":
            p = (qs.get("path", [""])[0] or "/").strip()
            flat: dict[str, str] = {}
            for k, v in qs.items():
                if k == "path":
                    continue
                if isinstance(v, list) and v:
                    flat[k] = str(v[0])
                elif v is not None and str(v) != "":
                    flat[k] = str(v)
            raw = mock_page_data(p)
            data = _apply_page_query_filters(raw, flat) if isinstance(raw, dict) else raw
            return _ok(self, data)

        if path == "/api/modal":
            k = (qs.get("kind", [""])[0] or "").strip()
            id_ = (qs.get("id", [""])[0] or "").strip()
            pth = (qs.get("path", [""])[0] or "/").strip()
            ctx = (qs.get("ctx", [""])[0] or "").strip()
            if not k:
                return _bad(self, "VALIDATION", "缺少 kind", status=400)
            return _ok(self, mock_modal(k, id_, pth, ctx))

        if path == "/api/announcements":
            status = (qs.get("status", [""])[0] or "").strip()
            q = (qs.get("q", [""])[0] or "").strip()
            items = ANNOUNCEMENTS
            if status:
                items = [x for x in items if x["status"] == status]
            if q:
                items = [x for x in items if q in x["title"]]
            return _ok(self, {"items": items, "total": len(items)})

        if path == "/api/messages":
            t = (qs.get("type", [""])[0] or "").strip()
            s = (qs.get("status", [""])[0] or "").strip()
            q = (qs.get("q", [""])[0] or "").strip()
            items = MESSAGES
            if t:
                items = [x for x in items if x["type"] == t]
            if s:
                items = [x for x in items if x["status"] == s]
            if q:
                items = [x for x in items if q in x["title"]]
            return _ok(self, {"items": items, "total": len(items)})

        if path == "/api/inbox/todo":
            q = (qs.get("q", [""])[0] or "").strip()
            items = INBOX_TODO
            if q:
                items = [x for x in items if q in x["title"] or q in x["initiator"]]
            return _ok(self, {"items": items, "total": len(items)})

        if path == "/api/inbox/done":
            q = (qs.get("q", [""])[0] or "").strip()
            items = INBOX_DONE
            if q:
                items = [x for x in items if q in x["title"] or q in x["initiator"]]
            return _ok(self, {"items": items, "total": len(items)})

        return _not_found(self)

    def log_message(self, fmt, *args):
        # keep terminal output clean
        return


def main(host: str = "127.0.0.1", port: int = 8787):
    env = os.environ.get("PORT", "").strip()
    if env.isdigit():
        port = int(env)
    httpd = ThreadingHTTPServer((host, port), Handler)
    print(f"HRMS mock backend listening on http://{host}:{port}")
    print("演示登录：用户名 admin，密码 123456（密码已做 trim）")
    httpd.serve_forever()


if __name__ == "__main__":
    main()

