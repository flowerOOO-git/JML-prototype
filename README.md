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

已包含 `netlify.toml`，发布目录为仓库根目录 `.`。

部署后短链：

- `/` 或 `/dev` → 开发环境复刻
- `/approve` → 通用申请审批
- `/mobile` → 移动端审批页

## 说明

- 纯静态 HTML / JS，无构建步骤
- 审批、首页等为原型快照，部分外链接口可能不可用
- PDF 合并下载依赖 [pdf-lib](https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/) CDN
