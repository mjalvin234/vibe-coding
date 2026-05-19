const TEMPLATE_ID = "999:4753";

const specs = [
  {
    name: "员工花名册",
    title: "员工花名册",
    subtitle: "按组织范围查看在职、试用与待入职人员；支持筛选导出与标签维护。",
    btn: "新增人员",
    heads: ["工号", "姓名", "部门 / 岗位", "人员状态", "操作"],
    rows: [
      ["E-2024-001", "张三", "技术中心 · 高级工程师", "在职", "详情"],
      ["E-2024-088", "李四", "人力资源部 · HRBP", "在职", "详情"],
    ],
  },
  {
    name: "入职办理",
    title: "入职办理",
    subtitle: "从 Offer 确认、入职准备到到岗确认；与编制、合同与账号开通联动。",
    btn: "新建入职单",
    heads: ["姓名", "入职部门", "岗位 · 到岗日", "当前节点", "操作"],
    rows: [
      ["王五", "研发中心", "高级工程师 · 5/12", "资料收集", "办理"],
      ["赵六", "销售中心", "区域经理 · 5/20", "Offer 确认", "办理"],
    ],
  },
  {
    name: "转正申请",
    title: "转正申请",
    subtitle: "试用期考核与转正评审；通过后更新人员状态与薪酬档。",
    btn: "发起转正",
    heads: ["姓名", "部门", "岗位 · 试用结束", "审批状态", "操作"],
    rows: [
      ["孙某", "技术中心", "前端 · 2026-06-30", "审批中", "查看"],
      ["周某", "产品部", "产品经理 · 2026-07-15", "待发起", "编辑"],
    ],
  },
  {
    name: "调岗调薪",
    title: "调岗调薪",
    subtitle: "岗位、汇报线与薪酬结构变更；需审批与生效日期。",
    btn: "发起申请",
    heads: ["姓名", "原部门 / 岗位", "目标部门 / 岗位", "进度 · 申请日", "操作"],
    rows: [
      ["吴某", "研发中心 / Java", "技术中心 / 专家", "审批中 · 5/08", "查看"],
      ["郑某", "人力 / HRBP", "薪酬 / 专员", "草稿 · 5/06", "编辑"],
    ],
  },
  {
    name: "离职办理",
    title: "离职办理",
    subtitle: "离职面谈、交接清单、权限回收与离职证明开具。",
    btn: "新建离职单",
    heads: ["姓名", "部门 / 岗位", "最后工作日", "办理节点", "操作"],
    rows: [
      ["钱某", "供应链 · 采购专员", "2026-05-30", "交接中", "办理"],
      ["冯某", "财务 · 会计", "2026-06-08", "待审批", "查看"],
    ],
  },
];

async function loadFontsUnder(node) {
  const texts = node.findAll((n) => n.type === "TEXT");
  const seen = {};
  for (const t of texts) {
    if (t.fontName === figma.mixed) continue;
    const k = t.fontName.family + "\0" + t.fontName.style;
    if (seen[k]) continue;
    seen[k] = true;
    await figma.loadFontAsync(t.fontName);
  }
}

function trimTableRows(listFrame, keepDataRows) {
  while (listFrame.children.length > 1 + keepDataRows) {
    listFrame.children[listFrame.children.length - 1].remove();
  }
}

function setHeaderCells(headerRowFrame, labels) {
  const texts = headerRowFrame.findAll((n) => n.type === "TEXT");
  texts.sort((a, b) => a.absoluteTransform[0][2] - b.absoluteTransform[0][2]);
  for (let i = 0; i < texts.length && i < labels.length; i++) {
    texts[i].characters = labels[i];
  }
}

function setDataRow(dataRowFrame, values) {
  const colFrames = dataRowFrame.children
    .filter((c) => c.type === "FRAME")
    .sort((a, b) => a.x - b.x);
  for (let i = 0; i < colFrames.length && i < values.length; i++) {
    const texts = colFrames[i].findAll((n) => n.type === "TEXT");
    if (!texts.length) continue;
    const t = texts[texts.length - 1];
    t.characters = values[i];
  }
}

/** 与当前画布一致：标题/副标题在「xxx · 内容区」下的 hero 内，而非主内容区顶层 TEXT */
function applyHeroAndLayout(contentFrame, spec) {
  const hero = contentFrame.findOne((n) => n.name === "hero");
  if (hero && hero.children.length >= 2) {
    const ht = hero.children[0];
    const hs = hero.children[1];
    if (ht.type === "TEXT") ht.characters = spec.title;
    if (hs.type === "TEXT") hs.characters = spec.subtitle;
  }
  const main = contentFrame.findOne((n) => n.name === "主内容区");
  if (!main) return;
  if (main.layoutMode === "VERTICAL") {
    main.itemSpacing = 12;
    main.primaryAxisAlignItems = "MIN";
    main.counterAxisAlignItems = "MIN";
  }
  const toolbar = main.findOne((n) => n.name === "工具条");
  if (toolbar && toolbar.layoutMode === "HORIZONTAL") {
    toolbar.primaryAxisAlignItems = "MIN";
    toolbar.counterAxisAlignItems = "CENTER";
    toolbar.itemSpacing = 12;
    const inner = toolbar.children[0];
    if (inner && inner.layoutMode === "HORIZONTAL") {
      inner.primaryAxisAlignItems = "CENTER";
      inner.counterAxisAlignItems = "CENTER";
      inner.paddingLeft = 16;
      inner.paddingRight = 16;
      inner.paddingTop = 8;
      inner.paddingBottom = 8;
      inner.itemSpacing = 8;
    }
  }
  const list = main.findOne((n) => n.type === "FRAME" && String(n.name).indexOf("列表") >= 0);
  if (list && list.layoutMode === "VERTICAL") list.itemSpacing = 0;
}

const template = figma.getNodeById(TEMPLATE_ID);
if (!template || template.type !== "FRAME") {
  throw new Error("Template frame missing: " + TEMPLATE_ID);
}
await figma.setCurrentPageAsync(template.parent);
const page = template.parent;
const gap = 48;
const yNew = template.y + template.height + gap;
const created = [];

for (let i = 0; i < specs.length; i++) {
  const spec = specs[i];
  const node = template.clone();
  node.name = spec.name;
  node.x = template.x + i * (template.width + gap);
  node.y = yNew;

  const content = node.findOne(
    (n) => n.type === "FRAME" && String(n.name).indexOf("内容区") >= 0
  );
  if (!content) throw new Error("内容区 missing");
  await loadFontsUnder(content);
  applyHeroAndLayout(content, spec);

  const main = content.findOne((n) => n.name === "主内容区");
  if (!main) throw new Error("主内容区 missing");

  const toolbar = main.findOne((n) => n.name === "工具条");
  if (toolbar && toolbar.children[0]) {
    const inner = toolbar.children[0];
    const tb = inner.findOne((n) => n.type === "TEXT");
    if (tb) tb.characters = spec.btn;
  }

  const list = main.findOne((n) => n.type === "FRAME" && String(n.name).indexOf("列表") >= 0);
  if (!list) throw new Error("列表 missing");

  trimTableRows(list, 2);
  if (list.children.length < 3) throw new Error("表格行不足");

  setHeaderCells(list.children[0], spec.heads);
  setDataRow(list.children[1], spec.rows[0]);
  setDataRow(list.children[2], spec.rows[1]);

  created.push({ name: spec.name, id: node.id });
}

return { ok: true, template: TEMPLATE_ID, y: yNew, created };
