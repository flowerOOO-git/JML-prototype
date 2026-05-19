const frame = document.getElementById("devFrame");

const topPlatformTabs = ["日常办公平台", "开发测试平台", "运维管理平台"];

const PAGE = {
  home: "../今麦郎BPM平台-开发环境.html",
  workbench: "../今麦郎BPM平台-工作台.html",
  approve: "../通用申请审批页面-分享包/index.html",
};

const APPROVE_FOLIO_ID = "TYSX-202605170001";

const iconMap = {
  首页: "<svg viewBox='0 0 24 24'><path d='M3 11.5L12 4l9 7.5'/><path d='M6.5 10.5V20h11V10.5'/></svg>",
  流程草稿: "<svg viewBox='0 0 24 24'><rect x='6' y='3' width='12' height='18' rx='2'/><path d='M9 8h6M9 12h4'/></svg>",
  发起流程: "<svg viewBox='0 0 24 24'><circle cx='12' cy='12' r='8.5'/><path d='M12 8v8M8 12h8'/></svg>",
  工作台: "<svg viewBox='0 0 24 24'><rect x='4' y='4' width='7' height='7' rx='1'/><rect x='13' y='4' width='7' height='7' rx='1'/><rect x='4' y='13' width='7' height='7' rx='1'/><rect x='13' y='13' width='7' height='7' rx='1'/></svg>",
  我的申请: "<svg viewBox='0 0 24 24'><rect x='5' y='3' width='14' height='18' rx='2'/><path d='M9 8h6M9 12h6M9 16h3'/></svg>",
  我的已办: "<svg viewBox='0 0 24 24'><circle cx='12' cy='12' r='8.5'/><path d='M8.5 12.5l2.2 2.2 4.8-4.8'/></svg>",
  我的办结: "<svg viewBox='0 0 24 24'><rect x='4' y='6' width='16' height='14' rx='2'/><path d='M8 6V4h8v2'/><path d='M9 11h6'/></svg>",
  我的代理: "<svg viewBox='0 0 24 24'><circle cx='9' cy='9' r='3'/><circle cx='16' cy='8.5' r='2.5'/><path d='M3 19c1-3 3-4.5 6-4.5s5 1.5 6 4.5'/></svg>",
  查询流程: "<svg viewBox='0 0 24 24'><circle cx='11' cy='11' r='6'/><path d='M16 16l4.5 4.5'/></svg>",
  自动化测试菜单: "<svg viewBox='0 0 24 24'><rect x='7' y='7' width='10' height='10' rx='2'/><path d='M12 3v3M8 21h8M5 12h2M17 12h2'/></svg>",
  流程导航: "<svg viewBox='0 0 24 24'><path d='M4 6h16M4 12h10M4 18h7'/></svg>",
};

const enhanceCSS = `
  /* 顶部导航 */
  .clone-top-header-bar,
  .clone-top-header-bar .bannerStyle,
  .clone-top-header-bar .el-menu,
  .clone-top-header-bar .logo-box,
  .headerStyle .logo-box {
    background-color: #ff0005 !important;
    background: #ff0005 !important;
  }
  .header-menu-item {
    color: rgba(255,255,255,.78) !important;
    border-bottom: 2px solid transparent !important;
    transition: color .2s, border-bottom-color .2s, background-color .2s;
  }
  .header-menu-item:hover { color: #fff !important; }
  .header-menu-item.clone-header-tab,
  .el-menu--horizontal > .header-menu-item.clone-header-tab {
    background-color: #ff0005 !important;
  }
  .header-menu-item.clone-header-tab:hover,
  .header-menu-item.clone-header-tab:focus,
  .header-menu-item.clone-header-tab.clone-active,
  .el-menu--horizontal > .header-menu-item.clone-header-tab:hover,
  .el-menu--horizontal > .header-menu-item.clone-header-tab:focus {
    background-color: color(srgb 0.9 0 0.0176471) !important;
  }
  .header-menu-item.clone-active {
    color: #fff !important;
    border-bottom: 2px solid #fff !important;
    font-weight: 600;
  }

  /* 左侧导航：首页 / 工作台统一工作台样式（保留各自 DOM，不隐藏） */
  .container-left.sidebar-container,
  .collect-body .body-left {
    background: #fff !important;
  }
  .container-left .collect-tabs.activeTab {
    color: #e8220c !important;
    background-color: transparent !important;
    border-left: none !important;
    border-bottom: 2px solid #e8220c !important;
    font-weight: 600;
  }
  .container-left .el-menu-item.menu-item-area.is-active,
  .container-left .el-menu-item.clone-sidebar-active {
    color: #e8220c !important;
    background-color: #fef2f2 !important;
    border-left: 3px solid #e8220c !important;
    border-bottom: none !important;
    font-weight: 600;
  }
  .container-left .el-menu-item.menu-item-area {
    color: #4b5563 !important;
  }
  .container-left .el-menu-item.menu-item-area:hover {
    color: #e8220c !important;
    background-color: #fff5f5 !important;
  }
  .container-left .menu-group-title {
    color: #9ca3af !important;
    font-size: 12px !important;
  }

  .el-menu-item.menu-item-area.is-active,
  .el-menu-item.clone-sidebar-active {
    color: #e8220c !important;
    background-color: #fef2f2 !important;
    border-left: 3px solid #e8220c !important;
    font-weight: 600;
  }
  .el-menu-item.menu-item-area.is-active .clone-left-icon,
  .el-menu-item.clone-sidebar-active .clone-left-icon {
    color: #e8220c !important;
  }

  .clone-left-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-right: 6px;
    color: #8c919a;
    vertical-align: middle;
    flex-shrink: 0;
  }
  .clone-left-icon svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    fill: none;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .clone-folio-link { cursor: pointer !important; }

  /* 首页流程单号 */
  .folio-jump.link-theme-color,
  .folio-jump.link-theme-color span {
    color: #ff0005 !important;
  }
`;

const getCurrentPage = () => {
  const src = decodeURIComponent(frame.src || "");
  if (src.includes("工作台")) return "workbench";
  return "home";
};

const navigateTo = (pageKey) => {
  const url = PAGE[pageKey];
  if (!url) return;
  const fileName = url.split("/").pop();
  if (decodeURIComponent(frame.src || "").includes(fileName)) return;
  frame.src = url;
};

const openApproveInNewTab = () => {
  window.open(PAGE.approve, "_blank", "noopener");
};

const getMenuItemLabel = (li) => {
  const title = li.querySelector(".tooltip-title span, .tooltip-title");
  if (title) return (title.textContent || "").replace(/\s+/g, "").trim();
  return (li.textContent || "").replace(/\s+/g, "").trim();
};

const injectStyle = (doc) => {
  if (doc.getElementById("clone-nav-enhance-style")) return;
  const el = doc.createElement("style");
  el.id = "clone-nav-enhance-style";
  el.textContent = enhanceCSS;
  doc.head.appendChild(el);
};

const applyTopHeaderBg = (doc) => {
  const header = doc.querySelector(".headerStyle");
  if (header) header.classList.add("clone-top-header-bar");
  const logoBox = doc.querySelector(".logo-box");
  if (logoBox) logoBox.style.backgroundColor = "";
};

const markTopNav = (doc) => {
  applyTopHeaderBg(doc);
  doc.querySelectorAll("li.header-menu-item").forEach((li) => {
    li.classList.remove("clone-active");
    const text = (li.textContent || "").trim();
    if (topPlatformTabs.includes(text)) {
      li.classList.add("clone-header-tab");
      li.style.backgroundColor = "";
    }
    if (text === "日常办公平台") {
      li.classList.add("clone-active");
      li.style.borderBottomColor = "";
    }
  });
};

const setSidebarActive = (doc) => {
  const activeRoute = getCurrentPage() === "workbench" ? "integrated" : "index";
  doc.querySelectorAll("li.menu-item-area[route-name]").forEach((li) => {
    const route = li.getAttribute("route-name");
    const isActive = route === activeRoute;
    li.classList.toggle("is-active", isActive);
    li.classList.toggle("clone-sidebar-active", isActive);
  });
};

const iconKeyByText = (text) =>
  Object.keys(iconMap).find((k) => text === k || text.startsWith(k));

const addSidebarIcons = (doc) => {
  doc.querySelectorAll("li.el-menu-item, .el-submenu__title").forEach((row) => {
    if (row.querySelector(".clone-left-icon")) return;
    const spans = Array.from(row.querySelectorAll("span"));
    const textSpan =
      spans.find((s) => {
        const t = (s.textContent || "").trim();
        return t && iconKeyByText(t);
      }) || row;
    const text = (textSpan.textContent || "").trim();
    const key = iconKeyByText(text);
    if (!key) return;
    const icon = doc.createElement("span");
    icon.className = "clone-left-icon";
    icon.innerHTML = iconMap[key];
    if (textSpan.parentNode === row) row.insertBefore(icon, textSpan);
    else row.insertBefore(icon, row.firstChild);
  });
};

const resolveSidebarNav = (li) => {
  const route = li.getAttribute("route-name");
  if (route === "integrated") return "workbench";
  if (route === "index") return "home";
  const label = getMenuItemLabel(li);
  if (label === "工作台" || label.endsWith("工作台")) return "workbench";
  if (label === "首页" || label.endsWith("首页")) return "home";
  return null;
};

const bindSidebarNavigation = (doc) => {
  if (doc.body.dataset.cloneSidebarNavBound === "1") return;
  doc.body.dataset.cloneSidebarNavBound = "1";

  doc.body.addEventListener(
    "click",
    (event) => {
      let node = event.target;
      while (node && node !== doc.body) {
        const li = node.closest?.("li.menu-item-area, li.el-menu-item");
        if (li) {
          const target = resolveSidebarNav(li);
          if (target) {
            event.preventDefault();
            event.stopPropagation();
            navigateTo(target);
            return;
          }
        }
        node = node.parentElement;
      }
    },
    true
  );
};

const containsApproveFolio = (el) => (el.textContent || "").includes(APPROVE_FOLIO_ID);

const isFolioClickTarget = (node) => {
  const folioEl = node.closest?.(".folio-jump, .folioContent, .folioText");
  if (folioEl && containsApproveFolio(folioEl)) return true;
  return (node.textContent || "").trim() === APPROVE_FOLIO_ID;
};

const markFolioLinks = (doc) => {
  [".folio-jump", ".folioContent", ".folioText"].forEach((selector) => {
    doc.querySelectorAll(selector).forEach((el) => {
      if (!containsApproveFolio(el)) return;
      el.classList.add("clone-folio-link");
      (el.closest(".folio-jump, .folioContent") || el).classList.add("clone-folio-link");
    });
  });
};

const bindFolioJump = (doc) => {
  if (doc.body.dataset.cloneFolioBound === "1") return;
  doc.body.dataset.cloneFolioBound = "1";
  markFolioLinks(doc);
  doc.body.addEventListener(
    "click",
    (event) => {
      let node = event.target;
      while (node && node !== doc.body) {
        if (isFolioClickTarget(node)) {
          event.preventDefault();
          event.stopPropagation();
          openApproveInNewTab();
          return;
        }
        node = node.parentElement;
      }
    },
    true
  );
};

const enhancePage = () => {
  try {
    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc?.body) return;
    injectStyle(doc);
    markTopNav(doc);
    setSidebarActive(doc);
    addSidebarIcons(doc);
    bindSidebarNavigation(doc);
    bindFolioJump(doc);
    markFolioLinks(doc);
  } catch (err) {
    console.error("页面增强失败:", err);
  }
};

frame.addEventListener("load", () => {
  enhancePage();
  setTimeout(enhancePage, 600);
});
