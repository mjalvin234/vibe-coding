/**
 * 全局弹窗：通过 Hash 串联各画板操作 — #/path?modal=kind&id=xxx&ctx=...
 * 与 Figma 中「列表 → 详情 / 处理 / 发起流程」等弹层一致的可扩展骨架。
 */
(function (global) {
  "use strict";

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizePath(p) {
    if (global.HrmsPageRegistry && global.HrmsPageRegistry.normalizePath) {
      return global.HrmsPageRegistry.normalizePath(p);
    }
    if (!p) return "/";
    var s = String(p).split("#")[0].split("?")[0];
    if (s[0] !== "/") s = "/" + s;
    s = s.replace(/\/+/g, "/");
    if (s.length > 1 && s.slice(-1) === "/") s = s.slice(0, -1);
    return s || "/";
  }

  function parseHash() {
    var raw = (global.location.hash || "").replace(/^#/, "");
    var qi = raw.indexOf("?");
    var pathPart = qi >= 0 ? raw.slice(0, qi) : raw;
    var search = qi >= 0 ? raw.slice(qi + 1) : "";
    var params = new URLSearchParams(search);
    return {
      path: normalizePath(pathPart || "/workbench"),
      modal: (params.get("modal") || "").trim(),
      id: (params.get("id") || "").trim(),
      ctx: (params.get("ctx") || "").trim(),
    };
  }

  function setModal(path, modal, id, ctx) {
    var p = normalizePath(path);
    var q = new URLSearchParams();
    if (modal) q.set("modal", modal);
    if (id != null && String(id) !== "") q.set("id", String(id));
    if (ctx) q.set("ctx", ctx);
    var qs = q.toString();
    global.location.hash = "#" + p + (qs ? "?" + qs : "");
  }

  function clearModal() {
    var h = parseHash();
    global.location.hash = "#" + h.path;
  }

  function renderFormFields(fields) {
    return (fields || [])
      .map(function (f) {
        var t = f.type || "text";
        var name = f.name || "field";
        var lab = escapeHtml(f.label || "");
        var ph = f.placeholder ? " placeholder=\"" + escapeHtml(f.placeholder) + "\"" : "";
        var req = f.required ? " required" : "";
        var ro = f.readonly ? " readonly" : "";
        var val = escapeHtml(f.value != null ? String(f.value) : "");
        var hint = f.hint
          ? '<span class="modal-field__hint">' + escapeHtml(f.hint) + "</span>"
          : "";
        if (t === "select" && f.options && f.options.length) {
          var opts = f.options
            .map(function (o) {
              var sel = o.selected ? " selected" : "";
              return (
                '<option value="' + escapeHtml(String(o.value)) + '"' + sel + ">" + escapeHtml(o.label) + "</option>"
              );
            })
            .join("");
          return (
            '<label class="modal-field">' +
            '<span class="modal-field__lab">' +
            lab +
            (f.required ? ' <abbr title="必填">*</abbr>' : "") +
            "</span>" +
            '<select class="modal-field__ctl" name="' +
            escapeHtml(name) +
            '"' +
            req +
            ">" +
            opts +
            "</select>" +
            hint +
            "</label>"
          );
        }
        if (t === "textarea") {
          return (
            '<label class="modal-field">' +
            '<span class="modal-field__lab">' +
            lab +
            (f.required ? ' <abbr title="必填">*</abbr>' : "") +
            "</span>" +
            '<textarea class="modal-field__ctl modal-field__ctl--area" name="' +
            escapeHtml(name) +
            '"' +
            ph +
            req +
            ro +
            ">" +
            val +
            "</textarea>" +
            hint +
            "</label>"
          );
        }
        var inputType = t === "date" || t === "email" ? t : "text";
        return (
          '<label class="modal-field">' +
          '<span class="modal-field__lab">' +
          lab +
          (f.required ? ' <abbr title="必填">*</abbr>' : "") +
          "</span>" +
          '<input class="modal-field__ctl" type="' +
          escapeHtml(inputType) +
          '" name="' +
          escapeHtml(name) +
          '" value="' +
          val +
          '"' +
          ph +
          req +
          ro +
          "/>" +
          hint +
          "</label>"
        );
      })
      .join("");
  }

  function renderTimeline(items) {
    if (!items || !items.length) return "";
    var inner = items
      .map(function (x) {
        return (
          '<div class="modal-tl__row">' +
          '<div class="modal-tl__time">' +
          escapeHtml(x.time || "") +
          "</div>" +
          '<div class="modal-tl__body">' +
          '<div class="modal-tl__title">' +
          escapeHtml(x.title || "") +
          "</div>" +
          (x.meta ? '<div class="modal-tl__meta muted">' + escapeHtml(x.meta) + "</div>" : "") +
          "</div></div>"
        );
      })
      .join("");
    return (
      '<section class="modal-sec modal-sec--tl" aria-label="变更记录">' +
      '<h3 class="modal-sec__title">最近动态</h3>' +
      '<div class="modal-timeline">' +
      inner +
      "</div></section>"
    );
  }

  function renderModalBody(d) {
    d = d || {};
    var intro = d.intro
      ? '<p class="modal-intro muted">' + escapeHtml(d.intro) + "</p>"
      : "";
    var sections = (d.sections || [])
      .map(function (sec) {
        var rows = (sec.rows || [])
          .map(function (r) {
            return (
              '<div class="modal-kv">' +
              "<dt>" +
              escapeHtml(r.label) +
              "</dt><dd>" +
              escapeHtml(r.value) +
              "</dd></div>"
            );
          })
          .join("");
        var t = sec.title ? '<h3 class="modal-sec__title">' + escapeHtml(sec.title) + "</h3>" : "";
        return '<section class="modal-sec">' + t + '<div class="modal-kvlist">' + rows + "</div></section>";
      })
      .join("");
    var formBlock = "";
    if (d.variant === "form" && d.fields && d.fields.length) {
      formBlock = '<div class="modal-form">' + renderFormFields(d.fields) + "</div>";
    }
    var tlBlock = d.timeline && d.timeline.length ? renderTimeline(d.timeline) : "";
    var extra = d.html ? '<div class="modal-extra">' + d.html + "</div>" : "";
    return intro + sections + formBlock + tlBlock + extra;
  }

  function modalBtnClass(a) {
    if (a.style === "primary" || a.id === "approve" || a.id === "submit" || a.id === "ok") {
      return "modal-btn modal-btn--primary";
    }
    if (a.id === "reject" || a.style === "danger") {
      return "modal-btn modal-btn--danger";
    }
    return "modal-btn";
  }

  function renderModalFoot(d) {
    var actions = d.actions || [{ id: "close", label: "关闭", style: "secondary" }];
    var hasReject = actions.some(function (a) {
      return a.id === "reject";
    });
    var left = [];
    var right = [];
    if (hasReject) {
      for (var i = 0; i < actions.length; i++) {
        var a = actions[i];
        if (a.style === "primary" || a.id === "approve" || a.id === "submit" || a.id === "ok") {
          right.push(a);
        } else {
          left.push(a);
        }
      }
      var leftHtml = left
        .map(function (a) {
          return (
            '<button type="button" class="' +
            modalBtnClass(a) +
            '" data-hrms-modal-action="' +
            escapeHtml(a.id) +
            '">' +
            escapeHtml(a.label) +
            "</button>"
          );
        })
        .join("");
      var rightHtml = right
        .map(function (a) {
          return (
            '<button type="button" class="' +
            modalBtnClass(a) +
            '" data-hrms-modal-action="' +
            escapeHtml(a.id) +
            '">' +
            escapeHtml(a.label) +
            "</button>"
          );
        })
        .join("");
      return (
        '<div class="modal-dialog__ft-inner modal-dialog__ft-inner--split">' +
        '<div class="modal-dialog__ft-left">' +
        leftHtml +
        "</div>" +
        '<div class="modal-dialog__ft-right">' +
        rightHtml +
        "</div></div>"
      );
    }
    return actions
      .map(function (a) {
        return (
          '<button type="button" class="' +
          modalBtnClass(a) +
          '" data-hrms-modal-action="' +
          escapeHtml(a.id) +
          '">' +
          escapeHtml(a.label) +
          "</button>"
        );
      })
      .join("");
  }

  function toast(msg, type) {
    if (global.HrmsAppShellToast) return global.HrmsAppShellToast(msg, type);
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.dataset.type = type || "info";
    el.classList.add("is-show");
    global.clearTimeout(toast._t);
    toast._t = global.setTimeout(function () {
      el.classList.remove("is-show");
    }, 2200);
  }

  function bindFoot(ft, d) {
    if (!ft) return;
    ft.onclick = function (e) {
      var b = e.target.closest("[data-hrms-modal-action]");
      if (!b) return;
      var id = b.getAttribute("data-hrms-modal-action");
      if (id === "close" || id === "cancel") {
        clearModal();
        return;
      }
      if (id === "submit" || id === "approve" || id === "ok") {
        toast("已提交", "success");
        clearModal();
        return;
      }
      if (id === "reject") {
        toast("已驳回", "success");
        clearModal();
        return;
      }
      toast("已执行：" + (b.textContent || id), "success");
    };
  }

  function loadModalContent(h) {
    var titleEl = document.getElementById("hrmsModalTitle");
    var bodyEl = document.getElementById("hrmsModalBody");
    var ftEl = document.getElementById("hrmsModalFt");
    if (!titleEl || !bodyEl || !ftEl) return;

    titleEl.textContent = "加载中…";
    bodyEl.innerHTML = '<div class="muted">加载中…</div>';
    ftEl.innerHTML = "";

    if (!global.HrmsApi || !global.HrmsApi.modalDetail) {
      titleEl.textContent = "错误";
      bodyEl.innerHTML = '<div class="muted">HrmsApi.modalDetail 未定义</div>';
      return;
    }

    global.HrmsApi
      .modalDetail(h.modal, h.id, { path: h.path, ctx: h.ctx })
      .then(function (d) {
        titleEl.textContent = d.title || "详情";
        bodyEl.innerHTML = renderModalBody(d);
        ftEl.innerHTML = renderModalFoot(d);
        var dlg = document.querySelector(".modal-dialog");
        if (dlg) dlg.classList.toggle("modal-dialog--wide", d.size === "wide");
        bindFoot(ftEl, d);
        var closeBtn = document.getElementById("hrmsModalClose");
        if (closeBtn) closeBtn.focus();
      })
      .catch(function () {
        titleEl.textContent = "加载失败";
        bodyEl.innerHTML =
          '<div class="muted">无法加载弹窗内容。请确认后端已启动，且参数正确。</div>';
        ftEl.innerHTML =
          '<button type="button" class="modal-btn" data-hrms-modal-action="close">关闭</button>';
        bindFoot(ftEl, {});
      });
  }

  function sync() {
    var root = document.getElementById("hrmsModalRoot");
    if (!root) return;
    var h = parseHash();
    if (!h.modal) {
      root.classList.remove("is-open");
      root.setAttribute("aria-hidden", "true");
      document.body.classList.remove("hrms-modal-open");
      var dlgClosed = document.querySelector(".modal-dialog");
      if (dlgClosed) dlgClosed.classList.remove("modal-dialog--wide");
      return;
    }
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("hrms-modal-open");
    loadModalContent(h);
  }

  function onDocClick(e) {
    var btn = e.target.closest("[data-hrms-modal]");
    if (!btn) return;
    if (btn.closest("#hrmsModalRoot") && !btn.hasAttribute("data-hrms-modal")) return;
    var kind = btn.getAttribute("data-hrms-modal");
    if (!kind) return;
    e.preventDefault();
    var id = btn.getAttribute("data-hrms-id") || "";
    var ctx = btn.getAttribute("data-hrms-ctx") || "";
    var path = parseHash().path;
    setModal(path, kind, id, ctx);
  }

  function onModalRootClick(e) {
    if (e.target.closest("[data-hrms-modal-close]")) {
      e.preventDefault();
      clearModal();
    }
  }

  function onKeydown(e) {
    if (e.key !== "Escape") return;
    if (!parseHash().modal) return;
    clearModal();
  }

  function install() {
    document.body.addEventListener("click", onDocClick);
    var root = document.getElementById("hrmsModalRoot");
    if (root) root.addEventListener("click", onModalRootClick);
    document.addEventListener("keydown", onKeydown);
    /* 仅变更 hash 查询串（如点「新建」带 modal=）时也要同步弹层，避免与壳体刷新时序竞态 */
    global.addEventListener("hashchange", function () {
      sync();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }

  global.HrmsModal = {
    parseHash: parseHash,
    setModal: setModal,
    clear: clearModal,
    sync: sync,
    escapeHtml: escapeHtml,
  };
})(window);
