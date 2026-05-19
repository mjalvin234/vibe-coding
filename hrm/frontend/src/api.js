// Frontend-only API client. 后端不可达时自动降级为嵌入 Mock（见 api-offline-mock.js + *-mock-embed.js）。

function getBaseUrl() {
  if (window.__API_BASE__) {
    return String(window.__API_BASE__).replace(/\/+$/, "");
  }
  var meta = typeof document !== "undefined" ? document.querySelector('meta[name="hrms-api-base"]') : null;
  var fromMeta = meta && meta.getAttribute("content");
  if (fromMeta && String(fromMeta).trim()) {
    return String(fromMeta).trim().replace(/\/+$/, "");
  }
  return "http://127.0.0.1:8787".replace(/\/+$/, "");
}

async function requestJson(path, options) {
  const url = getBaseUrl() + path;
  const res = await fetch(url, options || { method: "GET" });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j?.error?.message) msg = j.error.message;
    } catch (_) {}
    throw new Error(msg);
  }
  const json = await res.json();
  if (!json || json.ok !== true) {
    const msg = json?.error?.message || "请求失败";
    throw new Error(msg);
  }
  return json.data;
}

async function postJson(path, body) {
  return requestJson(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
}

function offlineWrap(promise, offlineFn) {
  if (typeof window.__HrmsOfflineWrap === "function") {
    return window.__HrmsOfflineWrap(promise, offlineFn);
  }
  return promise;
}

function offlineQrSession() {
  return Promise.resolve({
    sessionId: "offline-" + Date.now(),
    expiresAt: new Date(Date.now() + 300000).toISOString().replace(/\.\d{3}Z$/, "Z"),
    hint: "离线演示：扫码为占位，连接后端后可联调真实会话",
  });
}

function offlineQrStatus() {
  return Promise.resolve({ status: "pending", message: "离线演示 · 等待扫码确认（Mock）" });
}

window.HrmsApi = {
  __usingOfflineMock: false,
  health: () => offlineWrap(requestJson("/api/health"), () => window.__HrmsOfflineMock.health()),
  login: (body) => postJson("/api/auth/login", body),
  qrSession: () => offlineWrap(requestJson("/api/auth/qr-session"), offlineQrSession),
  qrStatus: (sessionId) =>
    offlineWrap(
      requestJson("/api/auth/qr-status?sessionId=" + encodeURIComponent(sessionId || "")),
      offlineQrStatus
    ),
  dashboardSummary: () =>
    offlineWrap(requestJson("/api/dashboard/summary"), () => window.__HrmsOfflineMock.dashboardSummary()),
  pageData: (path, params) => {
    const q = new URLSearchParams();
    q.set("path", path || "/");
    if (params && typeof params === "object") {
      Object.keys(params).forEach(function (k) {
        const v = params[k];
        if (v != null && String(v).trim() !== "") q.set(k, String(v));
      });
    }
    return offlineWrap(requestJson("/api/page-data?" + q.toString()), () =>
      window.__HrmsOfflineMock.pageData(path, params)
    );
  },
  modalDetail: (kind, id, extra) => {
    const q = new URLSearchParams();
    q.set("kind", kind || "");
    if (id != null && String(id) !== "") q.set("id", String(id));
    if (extra && extra.path) q.set("path", String(extra.path));
    if (extra && extra.ctx) q.set("ctx", String(extra.ctx));
    const url = "/api/modal?" + q.toString();

    function tryOfflineModal() {
      if (!window.__HrmsOfflineMock || typeof window.__HrmsOfflineMock.modalDetail !== "function") {
        return Promise.reject(new Error("Offline modal unavailable"));
      }
      if (window.HrmsApi) window.HrmsApi.__usingOfflineMock = true;
      return window.__HrmsOfflineMock.modalDetail(kind, id, extra);
    }

    /** 旧版 server.py 不认识 recruit-form / workflow-form 等 kind 时仍返回 200，需改走离线弹窗数据 */
    function isStaleBackendUnknownModal(data) {
      if (!data || typeof data !== "object") return false;
      const title = String(data.title || "").trim();
      const intro = String(data.intro || "");
      return title === "弹窗" && intro.indexOf("未知类型") !== -1;
    }

    return offlineWrap(requestJson(url), tryOfflineModal).then(function (data) {
      if (isStaleBackendUnknownModal(data)) {
        return tryOfflineModal();
      }
      return data;
    });
  },
  announcements: ({ q = "", status = "" } = {}) =>
    offlineWrap(
      requestJson(
        "/api/announcements?q=" +
          encodeURIComponent(q) +
          "&status=" +
          encodeURIComponent(status)
      ),
      () => window.__HrmsOfflineMock.announcements({ q: q, status: status })
    ),
  messages: ({ q = "", type = "", status = "" } = {}) =>
    offlineWrap(
      requestJson(
        "/api/messages?q=" +
          encodeURIComponent(q) +
          "&type=" +
          encodeURIComponent(type) +
          "&status=" +
          encodeURIComponent(status)
      ),
      () => window.__HrmsOfflineMock.messages({ q: q, type: type, status: status })
    ),
  inboxTodo: ({ q = "" } = {}) =>
    offlineWrap(requestJson("/api/inbox/todo?q=" + encodeURIComponent(q)), () =>
      window.__HrmsOfflineMock.inboxTodo({ q: q })
    ),
  inboxDone: ({ q = "" } = {}) =>
    offlineWrap(requestJson("/api/inbox/done?q=" + encodeURIComponent(q)), () =>
      window.__HrmsOfflineMock.inboxDone({ q: q })
    ),
};
