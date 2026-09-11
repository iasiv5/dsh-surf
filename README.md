# dsh-surf

一个 DSH 薄插件 + 自托管流式浏览器面：在 DSH 界面里提供一枚「🌐 Surf」入口按钮，
一键打开由你自己的服务器托管的远程 Chrome 桌面（Selkies 视频流），中文输入经你本地
设备的输入法直接注入远端。

- **npm 插件包**：极薄的宿主/客户端双半身，只负责打开入口 URL，不代理任何流量；
- **`deploy/` 镜像源码**：基于固定 tag 的 `linuxserver/chrome` 基座，强制 X11 模式，
  整文件 autostart 保住基座 Chrome 启动行；不带容器内输入法（避免与本地 IME 注入冲突）。

## 1. 定位

dsh-surf 的目标是「把一台远端浏览器桌面挂进 DSH 侧边一枚按钮」：

- 插件半身（`lib/`）：在 shell overlay 注册两个按钮 —— 🌐 Surf 主按钮与 ⚙ 设置按钮
  （设置 basePath）；点击主按钮经 `window.open(..., '_blank', 'noopener')` 打开
  `<origin>[basePath]/surf/`；
- 镜像半身（`deploy/`）：Selkies + Chrome 的容器镜像，视频流直接在浏览器与
  容器之间建立，插件与容器之间没有代理层。

## 2. 架构示意

```
浏览器 (DSH Web)
   │  点击「🌐 Surf」(window.open, noopener)
   ▼
反向代理 (TLS 终结 + 认证网关 + WebSocket 长连接, 见 deploy/reverse-proxy.md)
   │  /surf/*
   ▼
dsh-surf 容器 (Selkies-GStreamer 流服务, X11 模式)
   └── Chrome (wrapped-chrome, 基座启动行保留)
   ▼
互联网
```

## 3. 插件安装

发布后可从 npm 安装：

```bash
dsh plugin --profile web add @iasiv5/dsh-surf
```

从源码本地安装（开发模式）：

```bash
dsh plugin --profile web add link:/path/to/dsh-surf
```

安装后重启 DSH Web，在 **设置 → 网络冲浪** 一级菜单中直接点击即可打开远端浏览器。
入口固定使用根路径 `/surf/`，不再提供 basePath 设置；Surf 不占用主页面浮层空间，适合
手机等小屏幕设备。

## 4. 镜像部署

```bash
cd deploy/
cp docker-compose.example.yml docker-compose.yml
# 实例化 PUID/PGID（id -u / id -g）与 TZ
docker compose up -d --build
```

- 容器只绑定 `127.0.0.1:3000`，必须放在带认证的 TLS 反代后面；
- 反代四规则（WebSocket / 长超时 / 关缓冲 / body limit）、forward-auth 接法与
  SUBFOLDER 双斜杠陷阱见 **[deploy/reverse-proxy.md](deploy/reverse-proxy.md)**；
- 挂在子路径时保持 `SUBFOLDER=/surf/`，由代理剥掉外层前缀。

## 5. 安全警告

`/surf/` 是运行在你主机上的一整个远程浏览器会话，背后就是你的网络：

- **不要**把 3000 端口暴露到公网，**不要**无认证裸跑；
- 示例 compose 已默认 `DISABLE_TERMINALS=true`、`DISABLE_SUDO=true`（无网页终端、
  浏览器会话内无 root），分享/麦克风以 `false|locked` 锁死（UI 不可重开）——请保留；
- 反代链每一层都有自己的 body limit（取最小值生效），改动前逐层核对。

## 6. 已知限制

- **basePath 为手动适配**：客户端经 localStorage（键 `dsh-surf:basePath`）保存前缀，
  默认根挂载；插件不会自动探测所处路径前缀；
- **无硬性视频码率帽**：上游未提供严格的视频码率上限变量，当前以帧率/CRF/分辨率
  单值锁定 + 音频码率限幅 + 云平台流量告警作为护栏；是否自建硬帽为开放决策；
- **中文输入走本地设备 IME**：容器内**不装**输入法——容器内 IME 会与 Selkies 文本注入
  冲突（实测吃字）。你本地输入法打字经注入直达远端；若经原始键码模式接入，远端无
  中文 IM，此为设计取舍；
- **X11 取舍**：镜像强制 `PIXELFLUX_WAYLAND=false`，放弃 Wayland 路径（成熟稳定，
  与文本注入管线兼容）；
- **容器→本地下载经反代受限**：上游下载功能绑定容器内独立 HTTPS 端口，反代链（含
  认证网关）不代理该端口；上传方向不受影响（走数据 WebSocket，且不受反代 body
  limit 约束）；
- 镜像升级**不会**自动更新持久卷里已存在的 autostart（首启复制语义），升级时需按
  迁移步骤核对 `.config/openbox/autostart` 哈希。

## 7. 能力表述规范

本文档只描述已实现的设计；**未经实测确认的能力一律表述为「设计支持 / 验收要求」**，
不以已验证口径书写。实测结论请以随版本发布的验收记录为准。

## 8. 许可证与 ADR

- 许可证：[MIT](LICENSE)（Copyright (c) 2026 iasiv5）
- 设计决策记录见 [docs/adr/](docs/adr/)：
  - 0001 — 为何用 Selkies 容器而非复用 ego / WebRTC 直连
  - 0002 — 薄插件 + 边缘认证委托
  - 0003 — 强制 X11 模式（2026-09-11 起：X11 保留，容器内 fcitx5 已移除，理由见已知限制）
