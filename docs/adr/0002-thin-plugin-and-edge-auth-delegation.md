---
status: accepted
date: 2026-09-07
---

# dsh-surf 的 DSH 半身是"薄插件"：只做入口，不做浏览；认证完全委托边缘链

dsh-surf 由两个生命周期完全不同的部分组成：**浏览栈**（Docker 容器 + 边缘路由，独立于 DSH 存活）与 **DSH 半身**（一个薄插件：入口按钮 + 新标签页打开 `/surf/`）。认证不自建——Surf 浏览器的唯一门禁是 dsh-auth 边缘会话，与 DSH 本体同一道门。

理由：容器 GUI 内置免密 sudo 终端（官方文档警告），任何到达即等于容器 root，因此边缘认证是硬性的；dsh-auth 已是部署环境的唯一门禁，再加一层 basic auth 或 PIN 只有管理成本没有安全增益。DSH 半身刻意不依赖 better-sidebar（用核心 `shell.overlay` slot / 自挂 React root）、不依赖 ego-browser——满足用户"解耦"要求，也让"浏览器挂了 DSH 不受影响、DSH 重启浏览器不断线"成立。新标签页打开时 iframe/页面与 DSH 同源（同 host 拼路径），dsh-auth 会话 cookie 自动携带，无二次登录。

## Consequences

- 边缘配置改动收敛为边缘网关一处（`/surf/*` → 容器环回端口），多个公网入口同时生效；具体宿主侧接线见各部署环境的运维文档，不属于本插件仓库。
- 薄插件挂了或被卸载，浏览器依然可用（直接访问 URL）；反之容器挂了，DSH 一切如常。
- v1 之后若做"DSH 页面内嵌 iframe 模式"（`allow="autoplay; fullscreen; clipboard-read; clipboard-write"`），只加 UI，不动这套边界。
- 明确的非目标（no-s）：不做多人/多会话；不给 agent 开驾驶 Surf 浏览器的通路（未来若要，走 Selkies 生态的 Pelorus computer-use API，另立 ADR）。
