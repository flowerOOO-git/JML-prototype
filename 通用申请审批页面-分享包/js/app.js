const frame = document.getElementById("approveFrame");
const pdfModalMask = document.getElementById("pdfModalMask");
const pdfAttachmentListEl = document.getElementById("pdfAttachmentList");
const pdfSelectedListEl = document.getElementById("pdfSelectedList");
const pdfStatusEl = document.getElementById("pdfStatus");
const pdfModalCloseBtn = document.getElementById("pdfModalClose");
const pdfModalCancelBtn = document.getElementById("pdfModalCancel");
const pdfModalConfirmBtn = document.getElementById("pdfModalConfirm");
let pdfDownloadFallbackBtn = document.getElementById("pdfDownloadFallbackBtn");

let currentDoc = null;
let modalAttachments = [];
let selectedOrder = [];
let pdfDownloading = false;
let draggingFileId = null;

const pdfSelectAllEl = document.getElementById("pdfSelectAll");

const updatePdfSelectAllState = () => {
  if (!pdfSelectAllEl) return;
  const allIds = modalAttachments.map((f) => f.id);
  if (!allIds.length) {
    pdfSelectAllEl.checked = false;
    pdfSelectAllEl.indeterminate = false;
    return;
  }
  const selectedCount = allIds.filter((id) => selectedOrder.includes(id)).length;
  pdfSelectAllEl.checked = selectedCount === allIds.length;
  pdfSelectAllEl.indeterminate = selectedCount > 0 && selectedCount < allIds.length;
};

const applyPdfSelectAll = (checked) => {
  selectedOrder = checked ? modalAttachments.map((f) => f.id) : [];
  if (typeof window.__renderActivePdfModal === "function") {
    window.__renderActivePdfModal();
  }
};

if (pdfSelectAllEl) {
  pdfSelectAllEl.addEventListener("change", () => {
    applyPdfSelectAll(pdfSelectAllEl.checked);
  });
}

frame.addEventListener("load", () => {
  try {
    const doc = frame.contentDocument || frame.contentWindow.document;
    if (!doc) return;
    currentDoc = doc;

    const oldStyle = doc.getElementById("approve-page-proxy-style");
    if (oldStyle) oldStyle.remove();
    const style = doc.createElement("style");
    style.id = "approve-page-proxy-style";
    style.textContent = `
      .approve-op-icons { display:inline-flex; align-items:center; justify-content:center; gap:10px; color:#9aa3b5; }
      .approve-op-icons .icon-btn { width:14px; height:14px; display:inline-flex; align-items:center; justify-content:center; line-height:1; }
      .approve-op-icons svg { width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
      #attachments .approve-action-with-icon { display:inline-flex; align-items:center; justify-content:center; gap:2px; }
      #attachments .approve-action-with-icon svg { width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
      #attachments .file-btn-box > i,
      #attachments .file-btn-box > svg,
      #attachments .file-btn-box > span > i,
      #attachments .file-btn-box > span > svg { display:none !important; }
      #attachments .el-table__header-wrapper th.clone-attach-op-col,
      #attachments .el-table__body-wrapper td.clone-attach-op-col {
        display: table-cell !important;
        min-width: 96px !important;
        width: 96px !important;
        max-width: 120px;
        text-align: center;
        vertical-align: middle;
      }
      #attachments .el-table__header-wrapper col.clone-attach-op-col,
      #attachments .el-table__body-wrapper col.clone-attach-op-col {
        width: 96px !important;
      }
      #attachments .el-table__body-wrapper td.clone-attach-op-col .cell {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 24px;
      }
      .approve-pager-arrow { display:inline-flex; align-items:center; justify-content:center; width:12px; height:12px; color:#f5222d; }
      .approve-pager-arrow svg { width:12px; height:12px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
      .clone-reply-log-section { margin-bottom: 12px; }
      .clone-reply-log-section .header-title-default { color: #4469ec !important; }
      .clone-reply-log-table-wrap { padding: 0 12px 16px; }
      .clone-reply-log-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: auto;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.65);
        background: #fff;
      }
      .clone-reply-log-table .col-node,
      .clone-reply-log-table .col-action {
        width: 1%;
        white-space: nowrap;
      }
      .clone-reply-log-table .col-time {
        width: 1%;
        min-width: 158px;
        white-space: nowrap;
      }
      .clone-reply-log-table .col-opinion {
        min-width: 32%;
        width: auto;
      }
      .clone-reply-log-table .col-attachment-col {
        width: 22%;
        min-width: 160px;
      }
      .clone-reply-log-table th {
        background: #fafafa;
        color: rgba(0, 0, 0, 0.85);
        text-align: center;
        padding: 10px 8px;
        border: 1px solid #e8e8e8;
        font-weight: 400;
        line-height: 1.4;
      }
      .clone-reply-log-table td {
        padding: 10px 8px;
        border: 1px solid #e8e8e8;
        text-align: left;
        vertical-align: middle;
        line-height: 1.4;
        word-break: break-all;
      }
      .clone-reply-log-table td.col-index { text-align: center; }
      .clone-reply-log-table td.col-attachment {
        white-space: normal;
        word-break: break-all;
        vertical-align: top;
      }
      .clone-reply-log-table .file-name-column {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        min-width: 0;
      }
      .clone-reply-log-table .file-name-column .file-name-text {
        flex: 1;
        min-width: 0;
      }
      .clone-reply-log-table .file-name-column .approve-op-icons {
        flex: 0 0 auto;
        margin-top: 1px;
      }
      .clone-reply-log-table .file-name-column .icon-area {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
      }
      .clone-reply-log-table .file-type-icon {
        width: 16px;
        height: 16px;
        vertical-align: middle;
      }
      .clone-reply-log-table .downloadSpan {
        color: #4469ec;
        cursor: pointer;
        white-space: normal;
        word-break: break-all;
        line-height: 1.4;
      }
      .clone-reply-log-table .approve-op-icons { color: #9aa3b5; }
      .reply-log-attach-list {
        display: flex;
        flex-direction: column;
      }
      .reply-log-attach-item {
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      .reply-log-attach-item:first-child {
        padding-top: 0;
      }
      .reply-log-attach-item:last-child {
        padding-bottom: 0;
        border-bottom: none;
      }
    `;
    doc.head.appendChild(style);

    const fillById = (id, value) => {
      const el = doc.getElementById(id);
      if (!el) return;
      if ("value" in el) {
        el.value = value;
        el.setAttribute("value", value);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        el.textContent = value;
      }
    };

    const fillByLabel = (label, value) => {
      const labels = Array.from(doc.querySelectorAll("label, .component-item-label, .table-label, span"));
      const labelEl = labels.find((el) => (el.textContent || "").replace(/\s+/g, "").startsWith(label.replace(/\s+/g, "")));
      if (!labelEl) return;
      const row = labelEl.closest(".component-item, .section-child-body, .el-row, tr") || labelEl.parentElement;
      if (!row) return;
      const input = row.querySelector("input.el-input__inner, textarea, input[type='text'], input") || row.querySelector(".cell") || row.querySelector("span");
      if (!input) return;
      if ("value" in input) {
        input.value = value;
        input.setAttribute("value", value);
      } else {
        input.textContent = value;
      }
    };

    const fillData = () => {
      if (doc.body.dataset.cloneApproveFilled === "1") return;
      doc.body.dataset.cloneApproveFilled = "1";
      fillById("textbox7", "CR202605170018");
      fillById("applicationContent", "测试");
      fillById("vendingmachinebuyoutmatters", "是");
      fillById("hrdocuments", "是");
      fillByLabel("申请部门", "今麦郎食品股份有限公司/面品营销中心/湖南南益区");
      fillByLabel("主旨", "测试主旨-附件");
      fillByLabel("申请类型", "呆滞品费用核销");
      fillByLabel("业务类型", "面品业务");
      fillByLabel("是否需要添加抄送人", "是");
      fillByLabel("是否为电商分公司", "是");
      fillByLabel("审批意见", "同意");
    };

    const buildAttachmentOpIconsHtml = (fileName) => {
      const extMatch = (fileName || "").toLowerCase().match(/\.([a-z0-9]+)(?:\s|$)/i);
      const ext = extMatch ? extMatch[1] : "";
      const showPreview = ext === "pdf" || ext === "png";
      const showDownload = ext !== "png";
      return `
        <span class="approve-op-icons">
          ${showPreview ? `<span class="icon-btn" title="预览" aria-label="预览"><svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"></path><circle cx="12" cy="12" r="2.8"></circle></svg></span>` : ""}
          ${showDownload ? `<span class="icon-btn" title="下载" aria-label="下载"><svg viewBox="0 0 24 24"><path d="M12 4v10"></path><path d="M8 10l4 4 4-4"></path><path d="M4 18h16"></path></svg></span>` : ""}
        </span>`;
    };

    const getAttachmentTableHeaders = (attachmentsRoot) =>
      Array.from(attachmentsRoot.querySelectorAll(".el-table__header-wrapper thead th:not(.gutter) .cell")).map((el) =>
        (el.textContent || "").trim()
      );

    const getAttachmentHeaderColCount = (attachmentsRoot) =>
      attachmentsRoot.querySelectorAll(".el-table__header-wrapper thead th:not(.gutter)").length;

    const appendAttachmentOpColElement = (colgroup) => {
      if (colgroup.querySelector("col.clone-attach-op-col")) return;
      const col = doc.createElement("col");
      col.className = "clone-attach-op-col";
      col.setAttribute("name", "el-table_1_column_4");
      col.setAttribute("width", "96");
      colgroup.appendChild(col);
    };

    const ensureAttachmentsOperationColumn = () => {
      const attachments = doc.getElementById("attachments");
      if (!attachments) return -1;

      const headers = getAttachmentTableHeaders(attachments);
      const nameIndex = headers.findIndex((text) => text === "附件名称");
      if (nameIndex < 0) return -1;

      let opIndex = headers.findIndex((text) => text === "操作");
      const headerColCount = getAttachmentHeaderColCount(attachments);
      const bodyRows = Array.from(attachments.querySelectorAll(".el-table__body-wrapper tbody tr"));
      const bodyColCount = bodyRows[0] ? bodyRows[0].querySelectorAll("td").length : 0;
      const needsOpColumn = opIndex < 0 || headerColCount < 4 || bodyColCount < 4;

      if (needsOpColumn) {
        const hiddenCols = attachments.querySelector(".hidden-columns");
        if (hiddenCols && hiddenCols.children.length < 4) {
          const placeholder = doc.createElement("div");
          placeholder.className = "clone-attach-op-col-hidden";
          hiddenCols.appendChild(placeholder);
        }

        const headerRow = attachments.querySelector(".el-table__header-wrapper thead tr");
        if (headerRow && headerColCount < 4) {
          const th = doc.createElement("th");
          th.colSpan = 1;
          th.rowSpan = 1;
          th.className = "el-table_1_column_4 is-leaf el-table__cell clone-attach-op-col";
          th.innerHTML = '<div class="cell">操作</div>';
          const gutter = headerRow.querySelector("th.gutter");
          headerRow.insertBefore(th, gutter || null);
        }

        attachments.querySelectorAll(".el-table__header-wrapper colgroup, .el-table__body-wrapper colgroup").forEach(appendAttachmentOpColElement);

        bodyRows.forEach((row) => {
          if (row.querySelectorAll("td").length >= 4) return;
          const opCell = doc.createElement("td");
          opCell.colSpan = 1;
          opCell.rowSpan = 1;
          opCell.className = "el-table_1_column_4 el-table__cell clone-attach-op-col";
          opCell.innerHTML = '<div class="cell"></div>';
          row.appendChild(opCell);
        });

        opIndex = getAttachmentTableHeaders(attachments).findIndex((text) => text === "操作");
      }

      attachments.querySelectorAll(".el-table__header-wrapper th:not(.gutter)").forEach((th) => {
        if ((th.querySelector(".cell")?.textContent || "").trim() === "操作") {
          th.classList.add("clone-attach-op-col");
        }
      });

      return opIndex;
    };

    const fillAttachmentOperationIcons = () => {
      const attachments = doc.getElementById("attachments");
      if (!attachments) return false;

      const nameIndex = getAttachmentTableHeaders(attachments).findIndex((text) => text === "附件名称");
      const opIndex = ensureAttachmentsOperationColumn();
      if (opIndex < 0 || nameIndex < 0) return false;

      const rows = Array.from(attachments.querySelectorAll(".el-table__body-wrapper tbody tr"));
      if (!rows.length) return false;

      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (!cells[opIndex] || !cells[nameIndex]) return;

        cells[opIndex].classList.add("clone-attach-op-col");
        const nameCell = cells[nameIndex].querySelector(".cell") || cells[nameIndex];
        const fileName = (nameCell.textContent || "").trim();
        const cell = cells[opIndex].querySelector(".cell") || cells[opIndex];
        cell.innerHTML = buildAttachmentOpIconsHtml(fileName);
      });

      return true;
    };

    const ensureOperationIcons = () => {
      fillAttachmentOperationIcons();
    };

    const ensureAttachmentActionIcons = () => {
      const attachments = doc.getElementById("attachments");
      if (!attachments) return;
      const actionNodes = Array.from(attachments.querySelectorAll("button, span, a, div"));
      const isExactActionNode = (el, text) => {
        const ownText = (el.textContent || "").trim();
        if (ownText !== text) return false;
        return !Array.from(el.children).some((child) => ((child.textContent || "").trim() === text));
      };
      actionNodes.forEach((el) => {
        const txt = (el.textContent || "").trim();
        if (txt === "批量下载" && isExactActionNode(el, "批量下载")) {
          if (!el.querySelector(".approve-action-icon-download")) {
            el.classList.add("approve-action-with-icon");
            const icon = doc.createElement("span");
            icon.className = "approve-action-icon-download";
            icon.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 4v10"></path><path d="M8 10l4 4 4-4"></path><path d="M4 18h16"></path></svg>`;
            el.insertBefore(icon, el.firstChild);
          }
        }
        if (txt === "预览" && isExactActionNode(el, "预览")) {
          if (!el.querySelector(".approve-action-icon-preview")) {
            el.classList.add("approve-action-with-icon");
            const icon = doc.createElement("span");
            icon.className = "approve-action-icon-preview";
            icon.innerHTML = `<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"></path><circle cx="12" cy="12" r="2.8"></circle></svg>`;
            el.insertBefore(icon, el.firstChild);
          }
        }
      });
    };

    const ensurePagerArrowIcons = () => {
      const view = doc.defaultView;
      if (!view) return;
      const candidates = Array.from(doc.querySelectorAll("button, .el-button, [role='button']"));
      const tinyBottomButtons = candidates.filter((btn) => {
        const text = (btn.textContent || "").trim();
        if (text.length > 0) return false;
        const rect = btn.getBoundingClientRect();
        if (rect.width < 16 || rect.width > 60 || rect.height < 16 || rect.height > 40) return false;
        if (rect.top < view.innerHeight - 180) return false;
        if (rect.left < view.innerWidth - 220) return false;
        return true;
      });
      if (tinyBottomButtons.length < 2) return;
      tinyBottomButtons.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
      const [leftBtn, rightBtn] = tinyBottomButtons;
      const addArrow = (btn, direction) => {
        const old = btn.querySelector(".approve-pager-arrow");
        if (old) return;
        const icon = doc.createElement("span");
        icon.className = "approve-pager-arrow";
        icon.innerHTML = direction === "left"
          ? `<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"></path></svg>`
          : `<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"></path></svg>`;
        btn.innerHTML = "";
        btn.appendChild(icon);
      };
      addArrow(leftBtn, "left");
      addArrow(rightBtn, "right");
    };

    const getSummaryName = () => {
      const textInputs = Array.from(doc.querySelectorAll("input.el-input__inner, input[type='text'], textarea"));
      const summaryInput = textInputs.find((el) => el.id === "theme" || el.id === "title" || el.id === "subject");
      if (summaryInput && summaryInput.value) return summaryInput.value.trim();
      const labels = Array.from(doc.querySelectorAll("label, .component-item-label, span"));
      const summaryLabel = labels.find((el) => (el.textContent || "").replace(/\s+/g, "").startsWith("主旨"));
      if (summaryLabel) {
        const row = summaryLabel.closest(".component-item, .section-child-body, .el-row") || summaryLabel.parentElement;
        const input = row && row.querySelector("input.el-input__inner, textarea, input");
        if (input && input.value) return input.value.trim();
      }
      return "通用申请";
    };

    const collectAttachments = () => {
      const attachments = doc.getElementById("attachments");
      if (!attachments) return [{ id: "__form_pdf__", name: "表单.pdf", url: "", ext: "pdf", isForm: true }];
      const headers = Array.from(attachments.querySelectorAll("th .cell"));
      const nameIndex = headers.findIndex((el) => ((el.textContent || "").trim() === "附件名称"));
      if (nameIndex < 0) return [{ id: "__form_pdf__", name: "表单.pdf", url: "", ext: "pdf", isForm: true }];
      const rows = Array.from(attachments.querySelectorAll(".el-table__body-wrapper tbody tr"));
      const files = rows.map((row, idx) => {
        const cells = row.querySelectorAll("td");
        const nameCell = cells[nameIndex] && (cells[nameIndex].querySelector(".cell") || cells[nameIndex]);
        const name = (nameCell && nameCell.textContent || "").trim();
        const linkEl = row.querySelector("a[href]");
        const url = linkEl ? linkEl.getAttribute("href") : "";
        const extMatch = name.toLowerCase().match(/\.([a-z0-9]+)$/i);
        const ext = extMatch ? extMatch[1] : "";
        return { id: `${idx}-${name}`, name, url, ext, isForm: false };
      }).filter((x) => x.name);
      return [{ id: "__form_pdf__", name: "表单.pdf", url: "", ext: "pdf", isForm: true }, ...files];
    };

    const setPdfStatus = (text) => { pdfStatusEl.textContent = text || ""; };

    const renderPdfModal = () => {
      pdfAttachmentListEl.innerHTML = "";
      pdfSelectedListEl.innerHTML = "";

      modalAttachments.forEach((file) => {
        const checked = selectedOrder.includes(file.id);
        const li = document.createElement("li");
        li.style.cursor = "pointer";
        li.innerHTML = `<input type="checkbox" ${checked ? "checked" : ""} /><span class="pdf-name" title="${file.name}">${file.name}</span>`;
        const checkbox = li.querySelector("input");
        const applyCheckedState = (nextChecked) => {
          if (nextChecked) {
            if (!selectedOrder.includes(file.id)) selectedOrder.push(file.id);
          } else {
            selectedOrder = selectedOrder.filter((id) => id !== file.id);
          }
          renderPdfModal();
        };
        checkbox.addEventListener("change", () => applyCheckedState(checkbox.checked));
        li.addEventListener("click", (event) => {
          if (event.target === checkbox) return;
          checkbox.checked = !checkbox.checked;
          applyCheckedState(checkbox.checked);
        });
        pdfAttachmentListEl.appendChild(li);
      });

      if (!selectedOrder.length) {
        pdfSelectedListEl.innerHTML = `<li class="pdf-empty">请先勾选附件</li>`;
      } else {
        selectedOrder.forEach((id, index) => {
          const file = modalAttachments.find((f) => f.id === id);
          if (!file) return;
          const li = document.createElement("li");
          li.classList.add("pdf-draggable-item");
          li.draggable = true;
          li.innerHTML = `
            <button class="pdf-drag-handle" type="button" title="拖拽排序">
              <svg viewBox="0 0 16 16">
                <circle cx="5" cy="3.5" r="1.1"></circle><circle cx="11" cy="3.5" r="1.1"></circle>
                <circle cx="5" cy="8" r="1.1"></circle><circle cx="11" cy="8" r="1.1"></circle>
                <circle cx="5" cy="12.5" r="1.1"></circle><circle cx="11" cy="12.5" r="1.1"></circle>
              </svg>
            </button>
            <span class="pdf-name" title="${file.name}">${index + 1}. ${file.name}</span>
            <button class="pdf-delete-btn" type="button" title="删除（取消勾选）">×</button>
          `;

          li.addEventListener("dragstart", (event) => {
            draggingFileId = id;
            li.classList.add("is-dragging");
            if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
          });
          li.addEventListener("dragend", () => {
            draggingFileId = null;
            li.classList.remove("is-dragging");
            pdfSelectedListEl.querySelectorAll(".drag-over-top, .drag-over-bottom").forEach((el) => {
              el.classList.remove("drag-over-top", "drag-over-bottom");
            });
          });
          li.addEventListener("dragover", (event) => {
            if (!draggingFileId || draggingFileId === id) return;
            event.preventDefault();
            const rect = li.getBoundingClientRect();
            const insertBefore = event.clientY < rect.top + rect.height / 2;
            li.classList.toggle("drag-over-top", insertBefore);
            li.classList.toggle("drag-over-bottom", !insertBefore);
          });
          li.addEventListener("dragleave", () => {
            li.classList.remove("drag-over-top", "drag-over-bottom");
          });
          li.addEventListener("drop", (event) => {
            event.preventDefault();
            if (!draggingFileId || draggingFileId === id) return;
            const fromIndex = selectedOrder.indexOf(draggingFileId);
            if (fromIndex < 0) return;
            const [moved] = selectedOrder.splice(fromIndex, 1);
            let targetIndex = selectedOrder.indexOf(id);
            const rect = li.getBoundingClientRect();
            if (!(event.clientY < rect.top + rect.height / 2)) targetIndex += 1;
            if (targetIndex < 0) targetIndex = selectedOrder.length;
            selectedOrder.splice(targetIndex, 0, moved);
            renderPdfModal();
          });
          li.querySelector(".pdf-delete-btn").addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            selectedOrder = selectedOrder.filter((x) => x !== id);
            renderPdfModal();
          });
          pdfSelectedListEl.appendChild(li);
        });
      }
      updatePdfSelectAllState();
    };

    const openPdfModal = () => {
      modalAttachments = collectAttachments();
      selectedOrder = modalAttachments.map((f) => f.id);
      setPdfStatus("");
      window.__renderActivePdfModal = renderPdfModal;
      renderPdfModal();
      pdfModalMask.style.display = "flex";
    };
    window.__openPdfModal = openPdfModal;

    const loadPdfLib = async () => {
      if (window.PDFLib) return window.PDFLib;
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      return window.PDFLib;
    };

    const fetchBinary = async (url) => {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("附件下载失败");
      return resp.arrayBuffer();
    };

    const createPlaceholderPdf = async (PDFLib, fileName, note) => {
      const pdf = await PDFLib.PDFDocument.create();
      const page = pdf.addPage([595, 842]);
      const font = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
      page.drawText("Attachment To PDF Placeholder", { x: 40, y: 790, size: 16, font });
      page.drawText(`File: ${fileName}`, { x: 40, y: 760, size: 12, font });
      page.drawText(note || "Unsupported file type in pure frontend conversion.", { x: 40, y: 735, size: 11, font });
      return pdf.save();
    };

    const createFormPdf = async (PDFLib) => {
      const pdf = await PDFLib.PDFDocument.create();
      const page = pdf.addPage([595, 842]);
      const font = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
      const summary = getSummaryName();
      const lines = [
        "Form Export PDF",
        `Summary: ${summary || "通用申请"}`,
        `Flow No: ${(currentDoc && currentDoc.getElementById("textbox7") && currentDoc.getElementById("textbox7").value) || "-"}`,
        `Generated: ${new Date().toLocaleString()}`
      ];
      lines.forEach((line, idx) => {
        page.drawText(line, { x: 40, y: 790 - idx * 24, size: idx === 0 ? 18 : 12, font });
      });
      return pdf.save();
    };

    const imageToPdf = async (PDFLib, bytes, ext) => {
      const pdf = await PDFLib.PDFDocument.create();
      const page = pdf.addPage([595, 842]);
      const img = ext === "png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      const scale = Math.min((595 - 60) / img.width, (842 - 80) / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, { x: (595 - w) / 2, y: (842 - h) / 2, width: w, height: h });
      return pdf.save();
    };

    const convertAttachmentToPdf = async (PDFLib, file) => {
      if (file.isForm) return createFormPdf(PDFLib);
      const ext = (file.ext || "").toLowerCase();
      if (!file.url) return createPlaceholderPdf(PDFLib, file.name, "No downloadable URL found in current prototype data.");
      if (ext === "pdf") return fetchBinary(file.url);
      if (["png", "jpg", "jpeg"].includes(ext)) {
        const bytes = await fetchBinary(file.url);
        return imageToPdf(PDFLib, bytes, ext === "png" ? "png" : "jpg");
      }
      return createPlaceholderPdf(PDFLib, file.name, "Converted as placeholder for non-image/non-pdf file.");
    };

    const mergeAndDownloadSelected = async () => {
      if (pdfDownloading) return;
      if (!selectedOrder.length) {
        setPdfStatus("请先勾选至少一个附件。");
        return;
      }
      pdfDownloading = true;
      pdfModalConfirmBtn.disabled = true;
      try {
        setPdfStatus("正在加载PDF能力...");
        const PDFLib = await loadPdfLib();
        const merged = await PDFLib.PDFDocument.create();
        const selectedFiles = selectedOrder.map((id) => modalAttachments.find((f) => f.id === id)).filter(Boolean);
        for (let i = 0; i < selectedFiles.length; i += 1) {
          const file = selectedFiles[i];
          setPdfStatus(`正在处理 (${i + 1}/${selectedFiles.length})：${file.name}`);
          const pdfBytes = await convertAttachmentToPdf(PDFLib, file);
          const srcDoc = await PDFLib.PDFDocument.load(pdfBytes);
          const pages = await merged.copyPages(srcDoc, srcDoc.getPageIndices());
          pages.forEach((p) => merged.addPage(p));
        }
        setPdfStatus("正在合并并下载...");
        const mergedBytes = await merged.save();
        const blob = new Blob([mergedBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const summary = getSummaryName().replace(/[\\/:*?"<>|]/g, "_") || "通用申请";
        a.href = url;
        a.download = `${summary}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setPdfStatus("下载已触发。");
        setTimeout(() => {
          pdfModalMask.style.display = "none";
        }, 300);
      } catch (err) {
        setPdfStatus(`处理失败：${err.message || err}`);
      } finally {
        pdfDownloading = false;
        pdfModalConfirmBtn.disabled = false;
      }
    };
    window.__mergePdfDownload = mergeAndDownloadSelected;

    const replyLogAttachmentSamples = [
      "食品事业部子公司印章使用申请-SPBZ-202512180002.pdf",
      "4.1平台技术架构图_V1.pptx",
      "现场核查照片.png",
    ];

    const replyLogRows = [
      {
        index: 1,
        node: "部门主管（依次审批）",
        handler: "张三",
        action: "同意",
        time: "2025.10.29 11:43:44",
        opinion: "同意",
        attachments: [],
      },
      {
        index: 2,
        node: "部门主管（依次审批）",
        handler: "李四",
        action: "同意",
        time: "2025.10.29 11:43:45",
        opinion: "系统(自动审批)",
        attachments: [],
      },
      {
        index: 3,
        node: "人资审批（会签）",
        handler: "李四",
        action: "同意",
        time: "2025.10.29 11:45:45",
        opinion: "测试填入审批意见",
        attachments: [replyLogAttachmentSamples[0]],
      },
      {
        index: 4,
        node: "事业部总经理",
        handler: "赵六",
        action: "前加签->张小五",
        time: "2025.10.30 08:40:45",
        opinion: "请在我之前核查",
        attachments: [replyLogAttachmentSamples[0], replyLogAttachmentSamples[1]],
      },
      {
        index: 5,
        node: "前加签",
        handler: "张小五",
        action: "同意",
        time: "2025.10.30 09:40:45",
        opinion: "已核查，无问题",
        attachments: [replyLogAttachmentSamples[1]],
      },
      {
        index: 6,
        node: "事业部总经理",
        handler: "赵六",
        action: "同意",
        time: "2025.10.30 10:40:45",
        opinion: "同意",
        attachments: [replyLogAttachmentSamples[0], replyLogAttachmentSamples[1]],
      },
      {
        index: 7,
        node: "事业部总经理",
        handler: "赵六",
        action: "后加签->刘七,陈八",
        time: "2025.10.30 11:02:18",
        opinion: "请刘七、陈八在后序节点补充意见",
        attachments: [],
      },
      {
        index: 8,
        node: "后加签",
        handler: "刘七",
        action: "同意",
        time: "2025.10.30 14:15:33",
        opinion: "后加签意见：材料齐全，同意",
        attachments: [replyLogAttachmentSamples[2]],
      },
      {
        index: 9,
        node: "后加签",
        handler: "陈八",
        action: "同意",
        time: "2025.10.30 15:22:41",
        opinion: "财务口径已确认，同意",
        attachments: [],
      },
      {
        index: 10,
        node: "人资审批（会签）",
        handler: "李四",
        action: "转审->王五",
        time: "2025.10.31 09:20:06",
        opinion: "转交王五复核人事相关条款",
        attachments: [replyLogAttachmentSamples[0]],
      },
      {
        index: 11,
        node: "转审",
        handler: "王五",
        action: "同意",
        time: "2025.10.31 10:08:42",
        opinion: "转审完成，条款无异常",
        attachments: [],
      },
      {
        index: 12,
        node: "部门主管（依次审批）",
        handler: "张三",
        action: "退回->人资审批（会签）",
        time: "2025.11.01 15:30:12",
        opinion: "人资审批意见不完整，请补充后重新提交",
        attachments: [replyLogAttachmentSamples[1]],
      },
      {
        index: 13,
        node: "人资审批（会签）",
        handler: "李四",
        action: "驳回",
        time: "2025.11.02 08:55:27",
        opinion: "申请事由与制度不符，予以驳回",
        attachments: [],
      },
      {
        index: 14,
        node: "发起人",
        handler: "王晓明",
        action: "重新提交",
        time: "2025.11.02 14:18:36",
        opinion: "已按驳回意见补充说明并重新提交",
        attachments: [replyLogAttachmentSamples[0]],
      },
      {
        index: 15,
        node: "发起人",
        handler: "王晓明",
        action: "撤销",
        time: "2025.11.03 09:06:12",
        opinion: "暂不办理，先撤回流程",
        attachments: [],
      },
    ];

    const getReplyLogAttachments = (row) => {
      if (Array.isArray(row.attachments)) return row.attachments.filter(Boolean);
      if (row.attachmentName) return [row.attachmentName];
      return [];
    };

    const getReplyLogFileExt = (fileName) => {
      const match = (fileName || "").toLowerCase().match(/\.([a-z0-9]+)$/i);
      return match ? match[1] : "";
    };

    const getReplyLogFileIconId = (fileName) => {
      const ext = getReplyLogFileExt(fileName);
      const iconMap = {
        pdf: "pai-wps-pdf",
        ppt: "pai-wps-ppt",
        pptx: "pai-wps-ppt",
        png: "pai-wps-img",
        jpg: "pai-wps-img",
        jpeg: "pai-wps-img",
        gif: "pai-wps-img",
        webp: "pai-wps-img",
        bmp: "pai-wps-img",
        doc: "pai-wps-word",
        docx: "pai-wps-word",
        xls: "pai-wps-excel",
        xlsx: "pai-wps-excel",
      };
      return iconMap[ext] || "pai-wps-word";
    };

    const buildReplyLogOpIconsHtml = (fileName) => {
      if (!fileName) return "";
      const ext = getReplyLogFileExt(fileName);
      const imageExts = ["png", "jpg", "jpeg", "gif", "webp", "bmp"];
      const isImage = imageExts.includes(ext);
      const showPreview = ext === "pdf" || isImage;
      const showDownload = ext === "pdf" || (ext && !isImage);
      return `
        <span class="approve-op-icons">
          ${showPreview ? `<span class="icon-btn" title="预览" aria-label="预览"><svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"></path><circle cx="12" cy="12" r="2.8"></circle></svg></span>` : ""}
          ${showDownload ? `<span class="icon-btn" title="下载" aria-label="下载"><svg viewBox="0 0 24 24"><path d="M12 4v10"></path><path d="M8 10l4 4 4-4"></path><path d="M4 18h16"></path></svg></span>` : ""}
        </span>`;
    };

    const buildReplyLogAttachmentItemHtml = (fileName) => {
      const iconId = getReplyLogFileIconId(fileName);
      return `
        <div class="reply-log-attach-item">
          <div class="file-name-column">
            <span class="icon-area">
              <svg aria-hidden="true" class="file-type-icon"><use href="#${iconId}" xlink:href="#${iconId}"></use></svg>
            </span>
            <span class="file-name-text"><span class="downloadSpan" title="${fileName}">${fileName}</span></span>
            ${buildReplyLogOpIconsHtml(fileName)}
          </div>
        </div>`;
    };

    const buildReplyLogAttachmentsCellHtml = (fileNames) => {
      if (!fileNames.length) return "";
      return `<div class="reply-log-attach-list">${fileNames.map(buildReplyLogAttachmentItemHtml).join("")}</div>`;
    };


    const buildReplyLogBodyHtml = () =>
      replyLogRows
        .map((row) => {
          const attachments = getReplyLogAttachments(row);
          return `
        <tr>
          <td class="col-index">${row.index}</td>
          <td class="col-node">${row.node}</td>
          <td class="col-handler">${row.handler}</td>
          <td class="col-action">${row.action}</td>
          <td class="col-time">${row.time}</td>
          <td class="col-opinion">${row.opinion}</td>
          <td class="col-attachment">${buildReplyLogAttachmentsCellHtml(attachments)}</td>
        </tr>`;
        })
        .join("");

    const buildReplyLogTableHtml = () => `
      <table class="clone-reply-log-table" cellspacing="0" cellpadding="0" border="0">
        <colgroup>
          <col class="col-index" style="width: 44px;">
          <col class="col-node">
          <col class="col-handler" style="width: 72px;">
          <col class="col-action">
          <col class="col-time">
          <col class="col-opinion">
          <col class="col-attachment-col">
        </colgroup>
        <thead>
          <tr>
            <th class="col-index">序号</th>
            <th class="col-node">节点</th>
            <th class="col-handler">处理人</th>
            <th class="col-action">处理操作</th>
            <th class="col-time">处理时间</th>
            <th class="col-opinion">处理意见</th>
            <th class="col-attachment-col">附件</th>
          </tr>
        </thead>
        <tbody>${buildReplyLogBodyHtml()}</tbody>
      </table>`;

    const ensureReplyLogModule = () => {
      const approvalSection = doc.getElementById("group-approvalCommentsSection");
      if (!approvalSection?.parentNode) return;

      const tableHtml = buildReplyLogTableHtml();
      let section = doc.getElementById("clone-reply-log-section");
      if (section && !section.isConnected) section = null;

      if (section?.isConnected) {
        const tbody = section.querySelector(".clone-reply-log-table tbody");
        if (tbody) {
          const refreshObserver = frame._approveFixObserver;
          if (refreshObserver) refreshObserver.disconnect();
          tbody.innerHTML = buildReplyLogBodyHtml();
          if (refreshObserver) refreshObserver.observe(doc.body, { childList: true, subtree: true });
        }
        return;
      }

      section = doc.createElement("div");
      section.id = "clone-reply-log-section";
      section.className = "section-container warp-section-container clone-reply-log-section";
      section.setAttribute("isvisible", "true");
      section.innerHTML = `
        <div class="title form-section-title _anchor-section-title">
          <div class="header-default-horizontal">
            <span class="header-title-default">审批记录</span>
          </div>
        </div>
        <div class="section-body el-row" style="padding: 0px;">
          <div class="el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 el-col-lg-24 el-col-xl-24">
            <div class="clone-reply-log-table-wrap">${tableHtml}</div>
          </div>
        </div>
      `;

      const observer = frame._approveFixObserver;
      if (observer) observer.disconnect();
      approvalSection.parentNode.insertBefore(section, approvalSection);
      if (observer) observer.observe(doc.body, { childList: true, subtree: true });
    };

    const bindPdfDownloadEntry = () => {
      const doc = currentDoc;
      if (!doc) return;
      const view = doc.defaultView;
      if (!view) return;

      const isVisible = (el) => {
        const css = view.getComputedStyle(el);
        if (css.display === "none" || css.visibility === "hidden" || Number(css.opacity) === 0) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };

      const isPdfEntry = (el) => {
        const text = (el.textContent || "").replace(/\s+/g, "");
        if (text !== "PDF下载") return false;
        if (!isVisible(el)) return false;
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= 220;
      };

      const candidates = Array.from(doc.querySelectorAll("button, a, span, div")).filter(isPdfEntry);
      candidates.forEach((el) => {
        el.style.cursor = "pointer";
      });

      if (doc.body.dataset.boundPdfDownloadDelegate === "1") return;
      doc.body.dataset.boundPdfDownloadDelegate = "1";
      doc.body.addEventListener(
        "click",
        (event) => {
          let node = event.target;
          while (node && node !== doc.body) {
            if (isPdfEntry(node)) {
              event.preventDefault();
              event.stopPropagation();
              openPdfModal();
              return;
            }
            node = node.parentElement;
          }
        },
        true
      );
    };

    const isMutationFromEnhance = (mutation) => {
      const nodes = [...(mutation.addedNodes || []), ...(mutation.removedNodes || [])];
      if (nodes.some((node) => node.id === "clone-reply-log-section")) return true;
      const target = mutation.target;
      if (target?.id === "clone-reply-log-section") return true;
      if (target?.closest?.("#clone-reply-log-section")) return true;
      return false;
    };

    const runWithObserverPaused = (fn) => {
      const observer = frame._approveFixObserver;
      if (observer) observer.disconnect();
      try {
        fn();
      } finally {
        if (observer && doc.body) observer.observe(doc.body, { childList: true, subtree: true });
      }
    };

    const watchAttachmentsTable = () => {
      const attachments = doc.getElementById("attachments");
      if (!attachments || attachments.dataset.cloneAttachTableWatched === "1") return;
      attachments.dataset.cloneAttachTableWatched = "1";

      const refresh = () => {
        if (enhanceRunning) return;
        runWithObserverPaused(() => fillAttachmentOperationIcons());
      };

      const attachObserver = new MutationObserver(() => {
        clearTimeout(attachments._cloneAttachRefreshTimer);
        attachments._cloneAttachRefreshTimer = setTimeout(refresh, 120);
      });
      attachObserver.observe(attachments, { childList: true, subtree: true });
    };

    const bootstrapAttachmentsEnhance = (attempt = 0) => {
      if (fillAttachmentOperationIcons()) {
        watchAttachmentsTable();
        return;
      }
      if (attempt < 25) {
        setTimeout(() => bootstrapAttachmentsEnhance(attempt + 1), 250);
      }
    };

    let enhanceRunning = false;
    const applyAll = () => {
      const doc = currentDoc;
      if (!doc?.body || enhanceRunning) return;
      enhanceRunning = true;
      try {
        fillData();
        ensureReplyLogModule();
        ensureAttachmentActionIcons();
        ensureOperationIcons();
        ensurePagerArrowIcons();
        bindPdfDownloadEntry();
      } finally {
        enhanceRunning = false;
      }
    };

    const scheduleApplyAll = () => {
      clearTimeout(frame._approveApplyAllTimer);
      frame._approveApplyAllTimer = setTimeout(() => {
        runWithObserverPaused(applyAll);
      }, 300);
    };

    runWithObserverPaused(applyAll);
    setTimeout(() => runWithObserverPaused(applyAll), 1000);
    bootstrapAttachmentsEnhance();

    if (frame._approveFixObserver) frame._approveFixObserver.disconnect();
    const observer = new MutationObserver((mutations) => {
      if (enhanceRunning) return;
      if (mutations.every(isMutationFromEnhance)) return;
      scheduleApplyAll();
    });
    observer.observe(doc.body, { childList: true, subtree: true });
    frame._approveFixObserver = observer;
  } catch (e) {
    console.error("审批页面增强失败:", e);
  }
});

const closePdfModal = () => {
  if (pdfDownloading) return;
  pdfModalMask.style.display = "none";
};
pdfModalCloseBtn.addEventListener("click", closePdfModal);
pdfModalCancelBtn.addEventListener("click", closePdfModal);
pdfModalMask.addEventListener("click", (e) => {
  if (e.target === pdfModalMask) closePdfModal();
});

const openPdfModalSafely = () => {
  if (typeof window.__openPdfModal === "function") {
    window.__openPdfModal();
    return;
  }
  pdfStatusEl.textContent = "PDF功能尚未就绪，请稍后重试。";
  pdfModalMask.style.display = "flex";
};

const ensureFallbackButtonForFileMode = () => {
  if (location.protocol !== "file:") return null;
  if (pdfDownloadFallbackBtn) return pdfDownloadFallbackBtn;
  const btn = document.createElement("button");
  btn.id = "pdfDownloadFallbackBtn";
  btn.className = "pdf-fallback-entry";
  btn.type = "button";
  btn.textContent = "PDF下载";
  document.body.appendChild(btn);
  pdfDownloadFallbackBtn = btn;
  return btn;
};

const bindFallbackButton = () => {
  const btn = ensureFallbackButtonForFileMode() || pdfDownloadFallbackBtn;
  if (!btn) return;
  if (btn.dataset.boundPdfClick === "1") return;
  btn.dataset.boundPdfClick = "1";
  btn.addEventListener("click", openPdfModalSafely);
};

const fallbackAttachmentSeed = [
  { id: "__form_pdf__", name: "表单.pdf", url: "", ext: "pdf", isForm: true },
  { id: "fallback-1", name: "审批流转记录.pdf", url: "", ext: "pdf", isForm: false },
  { id: "fallback-2", name: "费用明细.png", url: "", ext: "png", isForm: false },
  { id: "fallback-3", name: "补充说明.docx", url: "", ext: "docx", isForm: false }
];

const setFallbackStatus = (text) => {
  pdfStatusEl.textContent = text || "";
};

const renderFallbackModal = () => {
  pdfAttachmentListEl.innerHTML = "";
  pdfSelectedListEl.innerHTML = "";

  modalAttachments.forEach((file) => {
    const checked = selectedOrder.includes(file.id);
    const li = document.createElement("li");
    li.style.cursor = "pointer";
    li.innerHTML = `<input type="checkbox" ${checked ? "checked" : ""} /><span class="pdf-name" title="${file.name}">${file.name}</span>`;
    const checkbox = li.querySelector("input");
    const applyCheckedState = (nextChecked) => {
      if (nextChecked) {
        if (!selectedOrder.includes(file.id)) selectedOrder.push(file.id);
      } else {
        selectedOrder = selectedOrder.filter((id) => id !== file.id);
      }
      renderFallbackModal();
    };
    checkbox.addEventListener("change", () => applyCheckedState(checkbox.checked));
    li.addEventListener("click", (event) => {
      if (event.target === checkbox) return;
      checkbox.checked = !checkbox.checked;
      applyCheckedState(checkbox.checked);
    });
    pdfAttachmentListEl.appendChild(li);
  });

  if (!selectedOrder.length) {
    pdfSelectedListEl.innerHTML = `<li class="pdf-empty">请先勾选附件</li>`;
    updatePdfSelectAllState();
    return;
  }

  selectedOrder.forEach((id, index) => {
    const file = modalAttachments.find((f) => f.id === id);
    if (!file) return;
    const li = document.createElement("li");
    li.classList.add("pdf-draggable-item");
    li.draggable = true;
    li.innerHTML = `
      <button class="pdf-drag-handle" type="button" title="拖拽排序">
        <svg viewBox="0 0 16 16">
          <circle cx="5" cy="3.5" r="1.1"></circle><circle cx="11" cy="3.5" r="1.1"></circle>
          <circle cx="5" cy="8" r="1.1"></circle><circle cx="11" cy="8" r="1.1"></circle>
          <circle cx="5" cy="12.5" r="1.1"></circle><circle cx="11" cy="12.5" r="1.1"></circle>
        </svg>
      </button>
      <span class="pdf-name" title="${file.name}">${index + 1}. ${file.name}</span>
      <button class="pdf-delete-btn" type="button" title="删除（取消勾选）">×</button>
    `;
    li.addEventListener("dragstart", (event) => {
      draggingFileId = id;
      li.classList.add("is-dragging");
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    });
    li.addEventListener("dragend", () => {
      draggingFileId = null;
      li.classList.remove("is-dragging");
      pdfSelectedListEl.querySelectorAll(".drag-over-top, .drag-over-bottom").forEach((el) => {
        el.classList.remove("drag-over-top", "drag-over-bottom");
      });
    });
    li.addEventListener("dragover", (event) => {
      if (!draggingFileId || draggingFileId === id) return;
      event.preventDefault();
      const rect = li.getBoundingClientRect();
      const insertBefore = event.clientY < rect.top + rect.height / 2;
      li.classList.toggle("drag-over-top", insertBefore);
      li.classList.toggle("drag-over-bottom", !insertBefore);
    });
    li.addEventListener("dragleave", () => {
      li.classList.remove("drag-over-top", "drag-over-bottom");
    });
    li.addEventListener("drop", (event) => {
      event.preventDefault();
      if (!draggingFileId || draggingFileId === id) return;
      const fromIndex = selectedOrder.indexOf(draggingFileId);
      if (fromIndex < 0) return;
      const [moved] = selectedOrder.splice(fromIndex, 1);
      let targetIndex = selectedOrder.indexOf(id);
      const rect = li.getBoundingClientRect();
      if (!(event.clientY < rect.top + rect.height / 2)) targetIndex += 1;
      if (targetIndex < 0) targetIndex = selectedOrder.length;
      selectedOrder.splice(targetIndex, 0, moved);
      renderFallbackModal();
    });
    li.querySelector(".pdf-delete-btn").addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      selectedOrder = selectedOrder.filter((x) => x !== id);
      renderFallbackModal();
    });
    pdfSelectedListEl.appendChild(li);
  });
  updatePdfSelectAllState();
};

const openFallbackPdfModal = () => {
  modalAttachments = fallbackAttachmentSeed.map((item) => ({ ...item }));
  selectedOrder = modalAttachments.map((f) => f.id);
  setFallbackStatus("");
  window.__renderActivePdfModal = renderFallbackModal;
  renderFallbackModal();
  pdfModalMask.style.display = "flex";
};

const loadPdfLibFallback = async () => {
  if (window.PDFLib) return window.PDFLib;
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return window.PDFLib;
};

const getSafeSummaryName = () => {
  try {
    if (!currentDoc) return "通用申请";
    const themeInput = currentDoc.getElementById("theme");
    const titleInput = currentDoc.getElementById("title");
    const subjectInput = currentDoc.getElementById("subject");
    const summary = (themeInput && themeInput.value) || (titleInput && titleInput.value) || (subjectInput && subjectInput.value) || "";
    return summary.trim() || "通用申请";
  } catch (error) {
    return "通用申请";
  }
};

const createFormPdfFallback = async (PDFLib) => {
  const pdf = await PDFLib.PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
  const summary = getSafeSummaryName();
  const lines = ["Form Export PDF", `Summary: ${summary}`, `Generated: ${new Date().toLocaleString()}`];
  lines.forEach((line, idx) => {
    page.drawText(line, { x: 40, y: 790 - idx * 24, size: idx === 0 ? 18 : 12, font });
  });
  return pdf.save();
};

const imageToPdfFallback = async (PDFLib, bytes, ext) => {
  const pdf = await PDFLib.PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const img = ext === "png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
  const scale = Math.min((595 - 60) / img.width, (842 - 80) / img.height);
  const width = img.width * scale;
  const height = img.height * scale;
  page.drawImage(img, { x: (595 - width) / 2, y: (842 - height) / 2, width, height });
  return pdf.save();
};

const createPlaceholderPdfFallback = async (PDFLib, fileName, note) => {
  const pdf = await PDFLib.PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
  page.drawText("Attachment To PDF Placeholder", { x: 40, y: 790, size: 16, font });
  page.drawText(`File: ${fileName}`, { x: 40, y: 760, size: 12, font });
  page.drawText(note || "No downloadable URL found in current prototype data.", { x: 40, y: 735, size: 11, font });
  return pdf.save();
};

const fetchBinaryFallback = async (url) => {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("附件下载失败");
  return resp.arrayBuffer();
};

const convertAttachmentToPdfFallback = async (PDFLib, file) => {
  if (file.isForm) return createFormPdfFallback(PDFLib);
  const ext = (file.ext || "").toLowerCase();
  if (!file.url) return createPlaceholderPdfFallback(PDFLib, file.name);
  if (ext === "pdf") return fetchBinaryFallback(file.url);
  if (["png", "jpg", "jpeg"].includes(ext)) {
    const bytes = await fetchBinaryFallback(file.url);
    return imageToPdfFallback(PDFLib, bytes, ext === "png" ? "png" : "jpg");
  }
  return createPlaceholderPdfFallback(PDFLib, file.name, "Converted as placeholder for non-image/non-pdf file.");
};

const mergeFallbackSelected = async () => {
  if (pdfDownloading) return;
  if (!selectedOrder.length) {
    setFallbackStatus("请先勾选至少一个附件。");
    return;
  }
  pdfDownloading = true;
  pdfModalConfirmBtn.disabled = true;
  try {
    setFallbackStatus("正在加载PDF能力...");
    const PDFLib = await loadPdfLibFallback();
    const merged = await PDFLib.PDFDocument.create();
    const selectedFiles = selectedOrder.map((id) => modalAttachments.find((f) => f.id === id)).filter(Boolean);
    for (let i = 0; i < selectedFiles.length; i += 1) {
      const file = selectedFiles[i];
      setFallbackStatus(`正在处理 (${i + 1}/${selectedFiles.length})：${file.name}`);
      const pdfBytes = await convertAttachmentToPdfFallback(PDFLib, file);
      const srcDoc = await PDFLib.PDFDocument.load(pdfBytes);
      const pages = await merged.copyPages(srcDoc, srcDoc.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }
    setFallbackStatus("正在合并并下载...");
    const mergedBytes = await merged.save();
    const blob = new Blob([mergedBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const summary = getSafeSummaryName().replace(/[\\/:*?"<>|]/g, "_") || "通用申请";
    a.href = url;
    a.download = `${summary}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setFallbackStatus("下载已触发。");
    setTimeout(() => {
      pdfModalMask.style.display = "none";
    }, 300);
  } catch (err) {
    setFallbackStatus(`处理失败：${err.message || err}`);
  } finally {
    pdfDownloading = false;
    pdfModalConfirmBtn.disabled = false;
  }
};

window.__openPdfModal = openFallbackPdfModal;
window.__mergePdfDownload = mergeFallbackSelected;

bindFallbackButton();

pdfModalConfirmBtn.addEventListener("click", async () => {
  if (typeof window.__mergePdfDownload === "function") {
    await window.__mergePdfDownload();
  }
});
