/** 开发跳过登录：打开 login.html?skip=1 将写入占位 token 并进入工作台（当前壳未做强制鉴权）。 */
(function skipLoginIfRequested() {
  try {
    const sp = new URLSearchParams(window.location.search || "");
    if (sp.get("skip") !== "1") return;
    sessionStorage.setItem("hrms:token", "dev-bypass");
    window.location.replace("./index.html#/workbench");
  } catch (_) {}
})();

function q(sel) {
  return document.querySelector(sel);
}

function isMobile(v) {
  return /^1\d{10}$/.test(v);
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function normalizeAccount(v) {
  return String(v || "").trim();
}

function normalizePassword(v) {
  return String(v || "").trim();
}

function setToast(message, type) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type || "info";
  el.classList.add("is-show");
  window.clearTimeout(setToast._t);
  setToast._t = window.setTimeout(() => el.classList.remove("is-show"), 2400);
}

function setFieldError(inputEl, msg) {
  if (!inputEl) return;
  const wrap = inputEl.closest("[data-field]");
  if (!wrap) return;
  wrap.classList.toggle("is-invalid", !!msg);
  const err = wrap.querySelector("[data-error]");
  if (err) err.textContent = msg || "";
}

function validateAccountForm() {
  const account = document.getElementById("account");
  const password = document.getElementById("password");
  const vAccount = normalizeAccount(account?.value);
  const vPassword = normalizePassword(password?.value);

  let ok = true;
  const isDemoAdmin = vAccount.toLowerCase() === "admin";
  if (!vAccount) {
    setFieldError(account, "请输入企业邮箱或手机号，或演示账号 admin");
    ok = false;
  } else if (!isDemoAdmin && !(isEmail(vAccount) || isMobile(vAccount))) {
    setFieldError(account, "格式不正确：请输入 admin、邮箱或 11 位手机号");
    ok = false;
  } else {
    setFieldError(account, "");
  }

  if (!vPassword) {
    setFieldError(password, "请输入密码");
    ok = false;
  } else if (vPassword.length < 6) {
    setFieldError(password, "密码至少 6 位（演示：admin / 123456）");
    ok = false;
  } else {
    setFieldError(password, "");
  }

  return ok;
}

function setSubmitting(isSubmitting) {
  const btn = document.getElementById("loginBtn");
  if (!btn) return;
  btn.disabled = !!isSubmitting;
  btn.setAttribute("aria-busy", String(!!isSubmitting));
  btn.dataset.loading = isSubmitting ? "true" : "false";
}

function setActiveTab(tab, opts) {
  opts = opts || {};
  const accountBtn = q('[data-tab="account"]');
  const qrBtn = q('[data-tab="qr"]');
  const accountPanel = document.getElementById("panel-account");
  const qrPanel = document.getElementById("panel-qr");

  const isAccount = tab === "account";
  if (!accountBtn || !qrBtn || !accountPanel || !qrPanel) return;

  accountBtn.classList.toggle("is-active", isAccount);
  qrBtn.classList.toggle("is-active", !isAccount);
  accountBtn.setAttribute("aria-selected", String(isAccount));
  qrBtn.setAttribute("aria-selected", String(!isAccount));
  accountBtn.tabIndex = isAccount ? 0 : -1;
  qrBtn.tabIndex = isAccount ? -1 : 0;

  accountPanel.classList.toggle("is-active", isAccount);
  qrPanel.classList.toggle("is-active", !isAccount);
  accountPanel.setAttribute("aria-hidden", String(!isAccount));
  qrPanel.setAttribute("aria-hidden", String(isAccount));

  if (opts.focus) (isAccount ? accountBtn : qrBtn).focus();
  if (opts.focusFirstField && isAccount) document.getElementById("account")?.focus();

  if (!isAccount && window.HrmsApi?.qrSession) {
    window.HrmsApi
      .qrSession()
      .then((data) => {
        const box = document.querySelector(".qr__box");
        if (box && data?.sessionId) {
          box.setAttribute("data-session-id", data.sessionId);
          box.setAttribute("aria-label", "扫码登录二维码占位，会话已创建");
        }
      })
      .catch(() => {});
  }
}

function isLikelyNetworkError(err) {
  const m = String(err?.message || "");
  return (
    /failed to fetch|load failed|networkerror|fetch/i.test(m) ||
    (err && err.name === "TypeError") ||
    m === "Failed to fetch"
  );
}

function isDemoOfflineCreds(accountVal, passwordVal) {
  return String(accountVal || "").trim().toLowerCase() === "admin" && String(passwordVal || "").trim() === "123456";
}

function persistToken(token, remember) {
  try {
    sessionStorage.setItem("hrms:token", token);
    if (remember) localStorage.setItem("hrms:token", token);
    else localStorage.removeItem("hrms:token");
  } catch (_) {}
}

function goWorkbench() {
  window.location.replace("./index.html#/workbench");
}

function initLoginPage() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (btn) setActiveTab(btn.dataset.tab, { focusFirstField: true });
  });

  document.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    if (!active || !active.matches || !active.matches("[data-tab]")) return;
    const key = e.key;
    if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Home" && key !== "End") return;
    e.preventDefault();
    if (key === "ArrowLeft" || key === "Home") setActiveTab("account", { focus: true });
    if (key === "ArrowRight" || key === "End") setActiveTab("qr", { focus: true });
  });

  const form = document.getElementById("panel-account");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateAccountForm()) {
      setToast("请先修正表单错误后再登录", "error");
      return;
    }

    setSubmitting(true);
    const remember = false;
    const accountVal = normalizeAccount(document.getElementById("account")?.value);
    const passwordVal = normalizePassword(document.getElementById("password")?.value);

    try {
      if (!window.HrmsApi?.login) {
        setToast("API 客户端未加载（请确认已引入 src/api.js）", "error");
        return;
      }
      const data = await window.HrmsApi.login({
        username: accountVal,
        password: passwordVal,
        rememberMe: remember,
      });
      if (data?.token) {
        persistToken(data.token, remember);
      }
      setToast("登录成功，正在进入工作台", "success");
      window.setTimeout(goWorkbench, 280);
    } catch (err) {
      const m = String(err?.message || "");
      const network = isLikelyNetworkError(err);
      if (network && isDemoOfflineCreds(accountVal, passwordVal)) {
        persistToken("offline-demo", remember);
        setToast("后端未连接：已使用演示账号离线进入工作台（数据为壳内 Mock）", "success");
        window.setTimeout(goWorkbench, 400);
        return;
      }
      const msg = network
        ? "无法连接后端 API。请在终端执行：cd 人力资源/backend && python3 server.py（默认 http://127.0.0.1:8787），再刷新本页；演示账号也可在无后端时自动离线进入。"
        : m || "登录失败，请检查账号密码或后端服务";
      setToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  });

  ["account", "password"].forEach((id) => {
    const el = document.getElementById(id);
    el?.addEventListener("input", () => validateAccountForm());
    el?.addEventListener("blur", () => validateAccountForm());
  });

  const togglePassword = document.getElementById("togglePassword");
  const password = document.getElementById("password");
  togglePassword?.addEventListener("click", () => {
    if (!password || !togglePassword) return;
    const toText = password.type === "password";
    password.type = toText ? "text" : "password";
    togglePassword.setAttribute("aria-pressed", String(toText));
  });

  setActiveTab("account");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLoginPage);
} else {
  initLoginPage();
}

