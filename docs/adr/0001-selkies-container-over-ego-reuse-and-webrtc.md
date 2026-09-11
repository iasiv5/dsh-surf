---
status: accepted
date: 2026-09-07
---

# Surf 浏览器采用自建 Selkies 容器，而非复用 ego-browser 基建或 WebRTC 方案

用户要在 DSH 界面里以远程服务器出口沉浸式上网。DSH 生态已有 ego-browser（有现成的 CDP 截屏+输入推流管线），业界也有 neko（WebRTC）等成熟"云浏览器"。我们决定**不**走这两条路，而是部署自维护镜像 `lscr.io/linuxserver/chrome + fcitx5`（Selkies 基座，WebSocket + WebCodecs 推流），挂在带 forward-auth 认证的边缘反代后面。

决定性约束：① 小型 VPS（2 核 / 3.6GB 级），公网仅有 HTTPS 端口可经反向代理使用（无 UDP 媒体通道），部署之初没有 Docker；② 用户要**音频与近本地的流畅度**（跨区长链路上的"出口切换"用途）；③ 用户明确要与 ego-browser、better-sidebar **解耦**。ego 的 CDP 通路无音频、分辨率档位为 agent 观察优化；neko 的 WebRTC 媒体无法穿透现有 HTTP 反代且资源规格不达标；Kasm 装不下。Selkies 纯 WebSocket 单端口 443 可达、WebCodecs 60fps@1080p 含音频、`/config` 卷天然持久登录态、官方文档明确支持子路径反代与 forward-auth 边缘认证——是唯一同时满足全部约束的选项。

## Considered Options

- **复用 ego-browser 基建（CDP screencast 自建人类 UI）**：零新增依赖、内存增量最小，但无音频通路、画质档位需大量调参、且必然与 ego 运行态耦合（与解耦诉求冲突）。作为 v1 弃用；若未来想要"零 Docker 的轻量版"可重新评估。
- **neko / neko-rooms（WebRTC）**：沉浸度天花板，但 WebRTC 媒体流不能过 nginx/Caddy HTTP 反代，需开新端口或 TURN-over-443；且官方规格 720p 起步要 4核/3GB。被部署面双重否决。
- **Kasm Workspaces**：基础足迹 2核/4GB 超出本机；CE 许可限非商用。出局。
- **BrowserBox 等成品 CDP screencast**：已闭源商业化。出局。
- **better-sidebar 内嵌浏览器**：跑在用户本地 iframe，出口不是服务器。语义上就不满足需求。

## Consequences

- 引入 Docker 与一个常驻 ~1-1.5GB 容器：用户知情并接受。
- 产生自维护镜像（叠加中文输入法），升级走"改 FROM tag 重建"，登录态不受影响。
- 流量账：只有推流出站计费（部署套餐按出流量计费，余量按数量级宽裕），部署时以 `SELKIES_*|locked` 钉码率上限 + 云平台流量告警兜底。
- 与 ego-browser 保持平行系统：两套浏览器、两个 profile、互不感知。这是有意的边界，不是待清理的重复。
