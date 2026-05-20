# JML BPM 前端原型（静态演示）

今麦郎 BPM 相关页面的静态复刻与分享包，用于本地或 Netlify 静态托管演示。

## 入口页面

| 说明 | 路径 |
|------|------|
| 开发环境复刻（首页 + 工作台） | [开发环境页面复刻-分享包/index.html](./开发环境页面复刻-分享包/index.html) |
| 通用申请审批页 | [通用申请审批页面-分享包/index.html](./通用申请审批页面-分享包/index.html) |
| 饮品 OA 移动端审批 | [饮品OA通知通报-移动端审批页面.html](./饮品OA通知通报-移动端审批页面.html) |

## 本地运行

在项目根目录启动静态服务（勿用 `file://` 直接打开）：

```bash
python3 -m http.server 8080
```

访问：`http://localhost:8080/开发环境页面复刻-分享包/index.html`

## Netlify 部署

已包含 `netlify.toml`。构建时会执行 `scripts/build-netlify.sh`，将中文路径重命名为 ASCII 后输出到 `dist/`（Netlify 对中文文件名支持不稳定）。

发布目录：`dist`（由 Netlify 自动构建，无需本地提交 `dist/`）。

部署后短链（均为英文路径）：

- `/` 或 `/dev` → `/dev-replica/index.html`（开发环境复刻）
- `/approve` → `/approve-share/index.html`（通用申请审批）
- `/mobile` → `/mobile-approve.html`（移动端审批）

若仍 404，请在 Netlify 控制台执行 **Clear cache and deploy**，并确认 Build command 为 `bash scripts/build-netlify.sh`、Publish directory 为 `dist`。

## 说明

- 纯静态 HTML / JS，无构建步骤
- 审批、首页等为原型快照，部分外链接口可能不可用
- PDF 合并下载依赖 [pdf-lib](https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/) CDN
