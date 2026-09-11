---
status: accepted
date: 2026-09-09
---

# Surf 镜像强制 X11/Openbox 模式以保障 fcitx5 中文输入的确定性

Selkies 基座在支持的硬件上默认走 Wayland（Smithay + Labwc）以获得零拷贝编码。本部署是无 GPU 的小型 VPS，Wayland 的核心收益（GPU 零拷贝）天然不可得（该性能判断仍需 PoC 实测佐证）；而 Wayland 下 Chrome 的 fcitx5 输入依赖 `--enable-wayland-ime` 与组合器 input-method 协议，边角行为多、验收不可控。X11/Openbox 是 fcitx5 的经典通路（GTK IM 模块 + XIM，`GTK_IM_MODULE/QT_IM_MODULE/XMODIFIERS` 三件套），行为可静态预期。

决定（已获用户批准，2026-09-09）：部署环境固定 `PIXELFLUX_WAYLAND=false`，镜像以 `/defaults/autostart` 整文件方式同时提供 `fcitx5 -d &` 与基座原样 Chrome 启动行（`wrapped-chrome ${CHROME_CLI}`，已对固定 tag 官方文件核实），双向静态断言防止任一职责缺失。用户若否决回到 Wayland/Labwc，须重新设计 IME 自启挂点并重做中文输入验收。

## Consequences

- 放弃 Wayland 零拷贝与 Labwc 特性（本机无 GPU，预期影响有限，最终以 PoC 实测为准）；未来若换 GPU 机型需重估。
- 中文输入验收以 X11 真实键入为准，失败即发布阻断（v1 硬项）。
- `/config` 持久卷中旧 autostart 不会被新默认覆盖：升级时执行幂等迁移（备份 → 与当前镜像默认做 sha256 比对 → 一致保留；**任何未知内容一律备份 + STOP 人工裁决，不自动删除**），见部署计划。

## 2026-09-11 更新（经用户批准）

实测（v0.1.0 验收期间）发现：容器内 fcitx5 与 Selkies 文本注入（本地设备 IME 路径）互相干扰，导致注入丢字；停用 fcitx5 后本地输入法输入完全恢复。经用户确认，**fcitx5 从镜像中移除**（apt 包、IME ENV 与 autostart 行全部撤下），中文输入统一走本地设备 IME 注入；原始键码模式下无远端 IM 记为已知限制。

本 ADR 的 X11/Openbox 决定**继续有效**（文本注入管线在 X11 下实测稳定）；「fcitx5 双向 autostart 职责」部分自本日起废止，autostart 整文件仅保留基座 Chrome 启动行。原文件名中的 fcitx5 字样保留作历史记录。
