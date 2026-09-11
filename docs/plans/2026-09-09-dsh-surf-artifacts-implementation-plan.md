# dsh-surf 开源制品实施计划

## 目标

- 建成可开源到 GitHub 的 `dsh-surf` 仓库：npm 插件包（薄插件）、Surf 镜像源码（Dockerfile + autostart）、部署示例与文档
- 交付**未发布的候选制品**：真实部署验收（姊妹计划）通过并产出机器可读验收记录后，才进入本计划 Task 7 发布门
- 脱敏门禁由仓库外私有脚本执行（fail-closed），覆盖工作树、全部 git 历史、路径名/symlink 与发布 tarball

发布顺序流水线：**开源候选（T1-T6）→ 本机部署与验收（部署计划 T1-T8，产出验收记录）→ 发布门（T7，每个不可逆动作前重复绑定断言）→ 发布物复验（部署计划 T9）**。

## 架构快照

- **npm 插件包 `@iasiv5/dsh-surf`**：宿主半身 `lib/index.js`（最小空壳：`name`/`inject`/空 `apply`）；客户端半身 `lib/client.js`（`window.__ModuleLoader__.load` 工厂，`inject:['slots']` 硬依赖，`settings.section` 一级入口 `{id:'dsh-surf', order:130, label:'网络冲浪'}`，点击导航项直接打开根 `/surf/`，无 basePath，主页面不再有浮层；2026-09-11 功能变更后形态）。零 peerDependencies，不代理流量。
- **`deploy/` 镜像源码**：`Dockerfile` 基于固定 tag `lscr.io/linuxserver/chrome`；**强制 X11 模式**（`PIXELFLUX_WAYLAND=false`，见 ADR-0003，已获用户批准）；确定性整文件 autostart 仅保留基座 Chrome 启动行（`wrapped-chrome ${CHROME_CLI}`，已对固定 tag 官方文件核实），本地设备 IME 经 Selkies 文本注入，容器内不装 IME；compose 官方变量名参数化，安全布尔用 `|locked` 值语法强制关闭。
- 前缀挂载入口：已移除（2026-09-11）——入口固定根路径 `/surf/`，`resolveSurfUrl()` 保留前缀拼接能力但无入口调用；已知限制写入 README。
- 流量护栏：帧率/CRF/分辨率单值锁定 + 云平台告警（官方无严格视频码率帽变量，硬帽为开放决策）。
- 安全加固：`DISABLE_TERMINALS=true`、`DISABLE_SUDO=true`；分享/麦克风 `false|locked`；文件传输保留。

## 全局约束

- **脱敏红线**：仓库任何文件不得内嵌——私有公网标识（IP/域名/网关随机路径前缀）、服务器地理位置、云厂商名、套餐数值、DSH 内部端口与服务名、`/etc` 下系统配置路径。审计由仓库外私有脚本执行：`~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh`（fail-closed：输入/工具错误 exit 2，绝不记为干净；路径与列表命中只报计数不回显内容）。指向私有仓库区（`01_docs/`）的路径指针允许保留。脚本缺失即 STOP。
- **发布门**：未通过验收记录严格解析器（`dsh-surf-acceptance-check.sh`：status PASS + blockers 0 + candidate-sha==HEAD + 版本一致）之前，禁止 push / tag / publish；push、tag、publish 为**三个独立确认**；tag 禁 `-f`；publish 必须**发布已审计的那个 tarball 文件**并在发布前重跑绑定断言。
- 插件包零 peerDependencies；镜像引用禁浮动 tag（FROM/image 行结构化检查，见 Task 3；仓库制品必须全部为文本，发现二进制文件即审计失败）；npm 名 `@iasiv5/dsh-surf`（public scoped：publishConfig.access=public，发布需 --access public）；MIT（`LICENSE` 正文，版权人 `iasiv5 / 2026` 发布门复核）；`type: module`。
- 客户端半身工厂形态与实机样板逐字同构（dsh-docs-panel / dsh-flowglass）；React 经 `require('react')`。
- README 未实测能力表述为「设计支持 / 验收要求」。

## 输入工件

- `docs/adr/0001`、`0002`、`0003`（X11，已批准）、`CONTEXT.md`
- 私有脚本：`~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh`（审计）、`~/workspace/01_docs/audit-scripts/dsh-surf-acceptance-check.sh`（验收块解析器，`--evidence-dir` 全语义复验）、`~/workspace/01_docs/audit-scripts/dsh-surf-acceptance-generate.sh`（验收记录唯一生成途径）、`~/workspace/01_docs/audit-scripts/dsh-surf-publish-manifest-check.sh`（publish manifest 严格门）
- 实机插件样板（只读；路径由执行者在 DSH 插件安装目录定位）：dsh-docs-panel 包（package.json `dsh` 字段、cordis.patch.yml、宿主 ESM、client 工厂形态）、dsh-flowglass 包的 `lib/client.js`（`slots.inject('shell.overlay', ...)`）
- 官方文档（已核实）：docker-chrome 页、Selkies configuration reference（单值锁定与 `|locked` 值语法）、reverse-proxy 四规则、`https://raw.githubusercontent.com/linuxserver/docker-chrome/153.0.8010.36-1-ls121/root/defaults/autostart`（基座 Chrome 启动行原文）、baseimage `init-selkies-config/run`（autostart 首启复制语义）
- 姊妹计划验收记录：`~/workspace/01_docs/dsh-surf-deploy/acceptance-0.1.0.md`（**固定文件名**，Task 7 消费；机器块 schema 见部署计划 Task 8）

## 文件结构与职责

- Create: `package.json`、`cordis.patch.yml`、`lib/index.js`、`lib/client.js`
- Create: `deploy/Dockerfile`、`deploy/autostart`、`deploy/docker-compose.example.yml`、`deploy/reverse-proxy.md`
- Create: `README.md`、`LICENSE`、`.gitignore`

## 任务清单

### Task 1: 仓库骨架、Git 初始化与审计脚本就位

- 涉及文件：`.gitignore`、`LICENSE`、`package.json`、`cordis.patch.yml`、`lib/index.js`
- 接口契约
  - Produces: 仓库（分支 main）；`package.json`（`name @iasiv5/dsh-surf` / `version 0.1.0` / `type module` / `main lib/index.js` / `exports {".","./client","./package.json"}` / `dsh.bundle.patch=./cordis.patch.yml` / `dsh.client={platform web, inject [@deepseek-ai/dsh-client-ui-layout]}` / `files=[lib/, cordis.patch.yml, README.md, LICENSE, deploy/]`）；`lib/index.js` 导出 `name='@iasiv5/dsh-surf'`、`inject=[]`、`apply(ctx)` 注册 `dsh-surf` settings namespace
- 验证范围：审计脚本就位、toplevel 断言、ESM 语法、pack 集合相等（当时存在的文件）

- [ ] Step 1: 审计器与自测就位检查（自测不过 = 审计器不可信）
- Run: `bash ~/workspace/01_docs/audit-scripts/selftest-secret-scan.sh >/dev/null && bash ~/workspace/01_docs/audit-scripts/selftest-acceptance-check.sh >/dev/null && bash ~/workspace/01_docs/audit-scripts/selftest-acceptance-generate.sh >/dev/null && bash ~/workspace/01_docs/audit-scripts/selftest-publish-manifest.sh >/dev/null && bash ~/workspace/01_docs/audit-scripts/selftest-lock-integrity.sh >/dev/null && bash ~/workspace/01_docs/audit-scripts/selftest-sri-validate.sh >/dev/null && test -x ~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh && test -x ~/workspace/01_docs/audit-scripts/dsh-surf-acceptance-check.sh && test -x ~/workspace/01_docs/audit-scripts/dsh-surf-acceptance-generate.sh && test -x ~/workspace/01_docs/audit-scripts/dsh-surf-evidence-validate.sh && test -x ~/workspace/01_docs/audit-scripts/dsh-surf-publish-manifest-check.sh && test -x ~/workspace/01_docs/audit-scripts/dsh-surf-lock-integrity.sh && test -x ~/workspace/01_docs/audit-scripts/dsh-surf-sri-validate.sh && echo AUDIT-READY`
- Expected: `AUDIT-READY`（六套自测全过 + 七脚本可执行，含 lock helper 与 SRI 严格校验——round10 建议级③）；否则 STOP 向用户索取/修复
- [ ] Step 2: 嵌套仓库安全初始化
- Run: `cd ~/workspace/dsh-surf && git init -b main && [ "$(git rev-parse --show-toplevel)" = "$HOME/workspace/dsh-surf" ] && git symbolic-ref --short HEAD | grep -qx main && echo REPO-OK`
- Expected: `REPO-OK`（2026-09-10 修订：原 `git rev-parse --abbrev-ref HEAD` 在零提交新生仓库上 fatal（git 2.43 实测 rc=128），换用 `git symbolic-ref --short HEAD`——读 HEAD 符号引用、不依赖 commit 存在，语义等价断言当前分支为 main；修订经用户确认）
- [ ] Step 3: 创建骨架文件（含 package.json 全部字段）
- Change: `.gitignore`（node_modules/、config/）；`LICENSE`（MIT，`Copyright (c) 2026 iasiv5`）；`cordis.patch.yml`（`- insert: [{id: surf, name: "@iasiv5/dsh-surf"}]`）；`package.json`（按 Produces 契约写入全部字段）；`lib/index.js`（scoped `name='@iasiv5/dsh-surf'`、`inject=[]`、`apply(ctx)` 注册 `dsh-surf` settings namespace）
- [ ] Step 4: 语法 + 审计（pre-commit，历史面自动跳过）+ pack 集合相等
- Run: `cd ~/workspace/dsh-surf && node --input-type=module --check < lib/index.js && ~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh . && npm pack --dry-run --json 2>/dev/null | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const got=(j[0]||j).files.map(x=>x.path).sort();const want=['LICENSE','cordis.patch.yml','lib/index.js','package.json'];if(JSON.stringify(got)!==JSON.stringify(want)){console.log('GOT:',got);process.exit(1)}console.log('PACK-EXACT')})"`
- Expected: 语法通过；`SECRET-SCAN-CLEAN`（此时无 commit，脚本输出历史为空 NOTE 属预期；**本步禁止 --require-history**）；`PACK-EXACT`（README 未创建故不在清单）
- [ ] Step 5: checkpoint commit + 历史门生效
- Run: `cd ~/workspace/dsh-surf && git add -A && git commit -m "scaffold: npm package skeleton" && ~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh . --require-history`
- Expected: commit 成功且历史审计 `SECRET-SCAN-CLEAN`（自首个 commit 起历史面纳入门禁）

### Task 2: Settings 内薄入口（TDD，测试可被正确实现通过）

- 涉及文件：`lib/client.js`
- 接口契约
  - Produces: 模块 `{ name:'dsh-surf/client', inject:['slots'], apply, resolveSurfUrl, openSurf }`；**工厂注册 id 必须等于 package.json `name`**（dsh-client-modules 按包名作为 graph row id 校验注册 id，不一致即 "loaded without registering" 整包失败）；`apply(ctx)` 注入 `settings.section`，descriptor `{name:'settings.section', id:'dsh-surf', order:130, label:'网络冲浪'}`；一级菜单点击直接 `window.open(<origin>/surf/, '_blank', 'noopener')`，不再提供 basePath 设置、不再注入 `shell.overlay` 或 `settings.plugin.item`；通过客户端导航适配将默认齿轮替换为浏览器窗口 SVG 图标；设置页内容仅作 fallback 提示（2026-09-11 功能变更）
- 验证范围：loader stub 全断言（注册 id 与 package name、settings.section descriptor、无 shell.overlay/settings.plugin.item、一级菜单 label/直接打开行为、浏览器图标适配、URL resolver、无 origin 抛错）。

- [ ] Step 1: 写失败测试
- Run: `cd ~/workspace/dsh-surf && node test/client-settings.mjs`
- Expected: 失败（`test/client-settings.mjs` 与 Settings 实现尚不存在，非零退出）
- [ ] Step 2: 实现 `lib/client.js` 与 Settings 一级菜单
- Change: 客户端工厂注册 id 等于 `@iasiv5/dsh-surf`；`apply(ctx)` 注入 `settings.section`，注册 `{name:'settings.section', id:'dsh-surf', order:130, label:'网络冲浪'}`；一级菜单捕获点击后直接打开根 `/surf/`，不再注册 `shell.overlay`/`settings.plugin.item`，不再提供 basePath 输入；客户端补浏览器窗口 SVG 图标适配，宿主 `lib/index.js` 保持最小 apply；保留 `resolveSurfUrl`/`openSurf` 与 `exports.name='dsh-surf/client'`。
- [ ] Step 3: 复跑 Settings 回归测试
- Run: `cd ~/workspace/dsh-surf && node test/client-settings.mjs`
- Expected: `CLIENT-SETTINGS-OK`
- [ ] Step 4: 依赖审查（命中即失败）+ 审计
- Run: `cd ~/workspace/dsh-surf && if grep -rqnE "betterSidebar|ego-browser|ego_browser" lib/ package.json; then echo FORBIDDEN-DEP; exit 1; fi && ~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh .`
- Expected: `SECRET-SCAN-CLEAN`（无 FORBIDDEN-DEP；2026-09-10 修订：原 `grep -qnE` 对目录参数 `lib/` 无 `-r` 时不递归且报错跳过，依赖审查实际未覆盖 lib/ 下文件，改用 `grep -rqnE` 全覆盖；修订经用户确认）
- [ ] Step 5: checkpoint commit
- Run: `cd ~/workspace/dsh-surf && git add -A && git commit -m "feat(client): make Network Surf a direct Settings launcher"`

### Task 3: Surf 镜像源码（autostart 整文件保基座启动行 + 权限固定；2026-09-11 起不含 fcitx5）

- 涉及文件：`deploy/Dockerfile`、`deploy/autostart`
- 接口契约
  - Consumes: 基座固定 tag；基座官方 autostart 原文（`#!/bin/bash` + `wrapped-chrome ${CHROME_CLI}`，已核实）；基座 init 首启复制语义
  - Produces: `deploy/autostart`（**精确三行整文件**：shebang、`# dsh-surf managed: base chrome launch`、`wrapped-chrome ${CHROME_CLI}`——保留基座 Chrome 启动行；2026-09-10 修订为四行含 fcitx5，2026-09-11 实测 fcitx5 与本地 IME 注入冲突吃字、经用户确认移除，回退为三行）；Dockerfile（固定 tag `FROM` + 输入设计注释 + `COPY --chmod=0755 autostart /defaults/autostart` + 升级语义注释；无 apt IME 层，CJK 字体由基座自带）
- 验证范围：精确内容断言（非子串）、权限、pin；构建与进程验证在部署计划 Task 2

- [ ] Step 1: 撰写两个文件
- Change: `deploy/autostart` 按契约写精确三行；`deploy/Dockerfile`：`ARG BASE_TAG=153.0.8010.36-1-ls121` → `FROM` → 输入设计注释 → `COPY --chmod=0755 autostart /defaults/autostart` → 升级语义注释（/config 已有 autostart 的旧实例不自动更新，迁移见部署计划 Task 3 Step 1）
- [ ] Step 2: 精确内容 + 权限 + pin 断言
- Run: `cd ~/workspace/dsh-surf && printf '#!/bin/bash\n# dsh-surf managed: base chrome launch\nwrapped-chrome ${CHROME_CLI}\n' | diff - deploy/autostart && echo AUTOSTART-EXACT-OK && grep -q "COPY --chmod=0755 autostart" deploy/Dockerfile && if grep -rn "latest" deploy/; then exit 1; else echo PIN-OK; fi`
- Expected: `AUTOSTART-EXACT-OK`（三行逐字一致）+ `PIN-OK`
- [ ] Step 3: checkpoint commit
- Run: `cd ~/workspace/dsh-surf && git add -A && git commit -m "feat(deploy): surf image (x11, autostart preserving base chrome launch)"`

### Task 4: 部署示例与反代通则

- 涉及文件：`deploy/docker-compose.example.yml`、`deploy/reverse-proxy.md`
- 接口契约
  - Produces: compose（`container_name: dsh-surf`、`image: dsh-surf:0.1.0` + `build: .`、env：`PUID/PGID`（注释：以 `id -u`/`id -g` 实例化）、`TZ`、`LC_ALL=zh_CN.UTF-8`、`PIXELFLUX_WAYLAND=false`、`SUBFOLDER=/surf/`、`TITLE=Surf`、`CHROME_CLI=--lang=zh-CN`、`SELKIES_FRAMERATE=30`、`SELKIES_H264_CRF=23`、`SELKIES_MANUAL_WIDTH=1920`、`SELKIES_MANUAL_HEIGHT=1080`、`SELKIES_IS_MANUAL_RESOLUTION_MODE=true`、`SELKIES_AUDIO_BITRATE=160000`、`SELKIES_ENABLE_SHARING=false|locked`、`SELKIES_MICROPHONE_ENABLED=false|locked`、`DISABLE_TERMINALS=true`、`DISABLE_SUDO=true`、`ports: 127.0.0.1:3000:3000`、`volumes: ./config:/config`、`shm_size: 1gb`、`restart: unless-stopped`）；reverse-proxy.md（四规则 + body-limit + SUBFOLDER 双斜杠 + forward-auth + 安全警告）
- 验证范围：键存在性（缺项即失败）；语法级校验由部署计划 Task 3 `docker compose config` 承接

- [ ] Step 1: 写两个文件
- Change: 按契约写入；宿主值用 `<...>` 占位
- [ ] Step 2: 键存在性检查（缺项即失败）
- Run: `cd ~/workspace/dsh-surf && miss=0; for k in services image build container_name environment ports volumes shm_size restart SUBFOLDER SELKIES_FRAMERATE SELKIES_H264_CRF SELKIES_MANUAL_WIDTH DISABLE_TERMINALS "false|locked"; do grep -qF "$k" deploy/docker-compose.example.yml || { echo "MISSING $k"; miss=1; }; done; [ $miss -eq 0 ] && echo KEYS-OK || exit 1`
- Expected: `KEYS-OK`
- [ ] Step 3: 反代文档要点检查（缺项即失败）
- Run: `cd ~/workspace/dsh-surf && miss=0; for kw in 3000 WebSocket 3600 buffering SUBFOLDER forward-auth sudo; do grep -qi "$kw" deploy/reverse-proxy.md || { echo "MISSING $kw"; miss=1; }; done; [ $miss -eq 0 ] && echo DOCS-OK || exit 1`
- Expected: `DOCS-OK`
- [ ] Step 4: checkpoint commit
- Run: `cd ~/workspace/dsh-surf && git add -A && git commit -m "docs(deploy): compose example and reverse proxy guide"`

### Task 5: 根 README

- 接口契约
  - Produces: 章节：①定位 ②架构示意 ③插件安装 ④镜像部署 ⑤安全警告 ⑥已知限制（入口固定根路径，无 basePath；无码率硬帽；X11 取舍）⑦能力表述规范 ⑧许可证与 ADR 指引（2026-09-11 随 Settings 一级入口变更修订）
- [ ] Step 1: 撰写 README
- Change: 按契约写入（无占位）
- [ ] Step 2: 章节检查
- Run: `cd ~/workspace/dsh-surf && miss=0; for kw in "安装" "部署" "安全" "已知限制" "MIT"; do grep -q "$kw" README.md || { echo "MISSING $kw"; miss=1; }; done; [ $miss -eq 0 ] && echo README-OK || exit 1; ~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh .`
- Expected: `README-OK`；`SECRET-SCAN-CLEAN`
- [ ] Step 3: checkpoint commit
- Run: `cd ~/workspace/dsh-surf && git add -A && git commit -m "docs: root README"`

### Task 6: 发布预检（候选冻结，不发布）

- 接口契约
  - Produces: 候选 commit；预检结论
- [ ] Step 1: 三面审计（工作树 + 全历史 + 精确 tarball；tarball 生成到仓库外，避免触发二进制门与污染工作树）
- Run: `cand="$HOME/workspace/01_docs/dsh-surf-deploy/publish-candidate-$(date +%Y%m%d%H%M%S)"; mkdir -p "$cand" && cd ~/workspace/dsh-surf && packjson=$(npm pack --json --pack-destination "$cand" 2>/dev/null) || exit 1; filename=$(printf '%s' "$packjson" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s)[0].filename))") || exit 1; name="$cand/$filename"; [ -f "$name" ] || { echo "TARBALL-MISSING:$name"; exit 1; }; case "$(realpath "$name")" in "$(realpath "$cand")"/*) ;; *) echo "TARBALL-ESCAPE:$(realpath "$name")"; exit 1;; esac; ~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh . --require-history && ~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh --tarball-only "$name"`
- Expected: 两次 `SECRET-SCAN-CLEAN`（repo 工作树+历史一次；tarball 单独一次；tgz 在仓库外，不会触发工作树二进制门）。tarball 文件名取自**同一次** `npm pack --json` 输出（禁止二次 dry-run 推测），且断言文件存在、realpath 位于本轮时间戳候选目录内
- [ ] Step 2: tarball allowlist 集合相等
- Run: `cd ~/workspace/dsh-surf && npm pack --dry-run --json 2>/dev/null | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);const got=(j[0]||j).files.map(x=>x.path).sort();const want=['LICENSE','README.md','cordis.patch.yml','deploy/Dockerfile','deploy/autostart','deploy/docker-compose.example.yml','deploy/reverse-proxy.md','lib/client.js','lib/index.js','package.json'];if(JSON.stringify(got)!==JSON.stringify(want)){console.log('GOT:',got);process.exit(1)}console.log('PACK-EXACT')})"`
- Expected: `PACK-EXACT`
- [ ] Step 3: npm 名官方源严格判定
- Run: `out=$(npm view @iasiv5/dsh-surf --registry https://registry.npmjs.org 2>&1); case "$out" in *E404*) echo NAME-FREE;; *) echo "UNEXPECTED: $out"; exit 1;; esac`
- Expected: `NAME-FREE`
- [ ] Step 4: 版本一致性
- Run: `cd ~/workspace/dsh-surf && grep -q '"version": "0.1.0"' package.json && grep -q "dsh-surf:0.1.0" deploy/docker-compose.example.yml && echo VERSION-CONSISTENT`
- Expected: `VERSION-CONSISTENT`
- [ ] Step 5: checkpoint commit（不打 tag）
- Run: `cd ~/workspace/dsh-surf && git add -A && git commit -m "chore: release candidate 0.1.0" --allow-empty`

### Task 7: 发布门（验收严格解析；三段独立确认；发布已审计 tarball）

- 接口契约
  - Consumes: **固定路径验收记录** `~/workspace/01_docs/dsh-surf-deploy/acceptance-0.1.0.md`（部署计划 Task 8 产出）+ 解析器 `dsh-surf-acceptance-check.sh`；用户对 **push / tag / publish** 的三段独立确认
  - Produces: GitHub 仓库（v0.1.0 annotated tag 指向 accepted SHA）；npm `@iasiv5/dsh-surf@0.1.0`（发布物 = 已审计 tarball，integrity 与 registry 返回值核对）
- [ ] Step 1: STOP · 发布确认门（收集 + 严格绑定断言）
- Change: 收集 GitHub owner（默认 iasiv5）/精确 URL/public 可见性/默认分支 main、`npm whoami` 身份、MIT 版权行确认。随后每个 Run **显式重赋值** `ACC`：
- Run: `cd ~/workspace/dsh-surf && ACC=~/workspace/01_docs/dsh-surf-deploy/acceptance-0.1.0.md && sha=$(git rev-parse HEAD) && ~/workspace/01_docs/audit-scripts/dsh-surf-acceptance-check.sh "$ACC" "$sha" 0.1.0 --evidence-dir ~/workspace/01_docs/dsh-surf-deploy/evidence-0.1.0 && [ -z "$(git status --porcelain)" ] && echo GATE-BINDING-OK`
- Expected: `GATE-BINDING-OK`（解析器校验唯一 fenced 块/schema/PASS/0 阻断/SHA/版本；源码有任何改动 → 停止回部署验收）
- [ ] Step 2a: 授权检查与绑定（展示后将请求确认 ①push）
- Run: `cd ~/workspace/dsh-surf && ACC=~/workspace/01_docs/dsh-surf-deploy/acceptance-0.1.0.md && sha=$(git rev-parse HEAD) && ~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh . --require-history && ~/workspace/01_docs/audit-scripts/dsh-surf-acceptance-check.sh "$ACC" "$sha" 0.1.0 --evidence-dir ~/workspace/01_docs/dsh-surf-deploy/evidence-0.1.0 && [ -z "$(git status --porcelain)" ] && git remote -v && echo "PUSH-TARGET: $sha -> main"`
- Expected: 全部通过并展示 `PUSH-TARGET`（GitForge `check_remote` 同步通过后 add/set-url origin）
- [ ] Step 2b: 用户确认 ①push 后执行（同一 Run 内重新审计 + 重新绑定 + 推送精确 SHA）
- Run: `cd ~/workspace/dsh-surf && ACC=~/workspace/01_docs/dsh-surf-deploy/acceptance-0.1.0.md && sha=$(git rev-parse HEAD) && ~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh . --require-history && ~/workspace/01_docs/audit-scripts/dsh-surf-acceptance-check.sh "$ACC" "$sha" 0.1.0 --evidence-dir ~/workspace/01_docs/dsh-surf-deploy/evidence-0.1.0 && [ -z "$(git status --porcelain)" ] && git push -u origin "$sha":refs/heads/main`
- Expected: push 成功（推送的正是 accepted SHA；secret scan/acceptance/SHA/clean 四重断言在同一 Run 内通过；确认期间产生新 commit 会因断言失败而停止）
- [ ] Step 3: tag（独立确认 ②tag；绑定 accepted SHA；发布前重审）
- Run: `cd ~/workspace/dsh-surf && ~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh . --require-history && ACC=~/workspace/01_docs/dsh-surf-deploy/acceptance-0.1.0.md && sha=$(git rev-parse HEAD) && ~/workspace/01_docs/audit-scripts/dsh-surf-acceptance-check.sh "$ACC" "$sha" 0.1.0 --evidence-dir ~/workspace/01_docs/dsh-surf-deploy/evidence-0.1.0 && [ -z "$(git status --porcelain)" ] && [ -z "$(git tag -l v0.1.0)" ] && [ -z "$(git ls-remote --tags origin refs/tags/v0.1.0)" ] && git tag -a v0.1.0 -m "release 0.1.0 (acceptance: acceptance-0.1.0.md; candidate: $(git rev-parse --short HEAD))" "$sha" && git push origin v0.1.0`
- Expected: 四重绑定（secret scan + 解析器 --evidence-dir + HEAD + clean）+ 双侧 tag 缺失后才创建 annotated tag（无 `-f`）并推送
- [ ] Step 4: 发布 manifest 生成（全部硬门禁，任一失败即非零退出；**无尾部 `|| true`**；tarball 打到仓库外候选目录）
- Run: `cd ~/workspace/dsh-surf; ACC=~/workspace/01_docs/dsh-surf-deploy/acceptance-0.1.0.md; sha=$(git rev-parse HEAD); ~/workspace/01_docs/audit-scripts/dsh-surf-acceptance-check.sh "$ACC" "$sha" 0.1.0 --evidence-dir ~/workspace/01_docs/dsh-surf-deploy/evidence-0.1.0 || exit 1; [ -z "$(git status --porcelain)" ] || exit 1; cand="$HOME/workspace/01_docs/dsh-surf-deploy/publish-candidate-$(date +%Y%m%d%H%M%S)"; mkdir -p "$cand" 2>/dev/null; name=$(npm pack --pack-destination "$cand" --json 2>/dev/null | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s)[0].filename))") || exit 1; name=$cand/$name; ~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh --tarball-only "$name" || exit 1; h=$(sha256sum "$name" | awk '{print $1}'); sz=$(stat -c %s "$name"); sri="sha512-$(openssl dgst -sha512 -binary "$name" | openssl base64 -A)"; out=$(npm view @iasiv5/dsh-surf@0.1.0 version --registry https://registry.npmjs.org 2>&1); vrc=$?; if [ $vrc -eq 0 ]; then echo "VERSION-EXISTS-ON-REGISTRY"; exit 1; fi; case "$out" in *E404*) ;; *) echo "REGISTRY-ERROR:$out"; exit 1;; esac; printf 'acceptance: acceptance-0.1.0.md\naccepted-sha: %s\ntarball: %s\nversion: 0.1.0\nsha256: %s\nsize: %s\nintegrity: %s\ncreated-at: %s\n' "$sha" "$name" "$h" "$sz" "$sri" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > ~/workspace/01_docs/dsh-surf-deploy/publish-manifest-0.1.0.md.pending && chmod 600 ~/workspace/01_docs/dsh-surf-deploy/publish-manifest-0.1.0.md.pending && mv ~/workspace/01_docs/dsh-surf-deploy/publish-manifest-0.1.0.md.pending ~/workspace/01_docs/dsh-surf-deploy/publish-manifest-0.1.0.md && ~/workspace/01_docs/audit-scripts/dsh-surf-publish-manifest-check.sh ~/workspace/01_docs/dsh-surf-deploy/publish-manifest-0.1.0.md 0.1.0 || exit 1; msha=$(sha256sum ~/workspace/01_docs/dsh-surf-deploy/publish-manifest-0.1.0.md | awk '{print $1}') && echo "MANIFEST-READY manifest-sha256=$msha"`
- 用户操作: 展示 manifest 内容与 **manifest sha256=$msha**（accepted SHA/tarball 路径/hash/SRI/size）→ **用户确认 ③publish（明确针对该 manifest 及其 sha256）**；确认值带入 Step 5
- Expected: `MANIFEST-READY`（VERSION-EXISTS → 已发布 STOP；REGISTRY-ERROR → 网络故障重试；manifest 落盘后已由 dsh-surf-publish-manifest-check.sh 严格自校验：恰 8 键无重复/未知、值格式与固定值、tarball 限定时间戳候选目录且 realpath 不逃逸、size/sha256/SRI 现场重算三等；manifest 自身 sha256 已记录供确认绑定）
- [ ] Step 5: 执行发布（读 manifest；重新绑定与哈希核验；发布该文件；integrity 断言）
- Run: `cd ~/workspace/dsh-surf; ACC=~/workspace/01_docs/dsh-surf-deploy/acceptance-0.1.0.md; m=~/workspace/01_docs/dsh-surf-deploy/publish-manifest-0.1.0.md; msha="<用户确认消息中的 manifest sha256>"; [ -n "$msha" ] || { echo NEED-CONFIRMED-DIGEST; exit 1; }; am=$(sha256sum "$m" | awk '{print $1}'); [ "$am" = "$msha" ] || { echo "MANIFEST-DIGEST-MISMATCH:$am vs $msha"; exit 1; }; [ -r "$m" ] || { echo NO-MANIFEST; exit 1; }; ~/workspace/01_docs/audit-scripts/dsh-surf-publish-manifest-check.sh "$m" 0.1.0 --require-scan || exit 1; accsha=$(grep '^accepted-sha:' "$m" | awk '{print $2}'); ~/workspace/01_docs/audit-scripts/dsh-surf-acceptance-check.sh "$ACC" "$accsha" 0.1.0 --evidence-dir ~/workspace/01_docs/dsh-surf-deploy/evidence-0.1.0 || exit 1; [ "$(git rev-parse HEAD)" = "$accsha" ] || { echo HEAD-MOVED; exit 1; }; [ -z "$(git status --porcelain)" ] || { echo TREE-DIRTY; exit 1; }; tb=$(grep '^tarball:' "$m" | awk '{print $2}'); tar -xzOf "$tb" package/package.json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const p=JSON.parse(s);if(p.name!=='@iasiv5/dsh-surf'||p.version!=='0.1.0'){console.log('BAD-PKG',p.name,p.version);process.exit(1)}})" || { echo BAD-TARBALL-PKG; exit 1; }; npm publish "$tb" --access public --registry https://registry.npmjs.org || exit 1; ri=$(npm view @iasiv5/dsh-surf@0.1.0 dist.integrity --registry https://registry.npmjs.org); li="sha512-$(openssl dgst -sha512 -binary "$tb" | openssl base64 -A)"; mi=$(grep '^integrity:' "$m" | awk '{print $2}'); [ "$ri" = "$li" ] && [ "$ri" = "$mi" ] || { echo "INTEGRITY-MISMATCH registry=$ri local=$li manifest=$mi"; exit 1; }; echo PUBLISH-VERIFIED`
- Expected: `PUBLISH-VERIFIED`（发布前 manifest 经严格 checker 键集/值/候选目录/size/sha256/SRI/scan 全等复验；发布的正是 manifest 绑定、内容与包名/版本核验过的 tarball；registry integrity 与本地重算及 manifest 三方一致）
- [ ] Step 6: 发布后复验
- Run: `t=$(mktemp -d) && cd "$t" && npm pack @iasiv5/dsh-surf@0.1.0 --registry https://registry.npmjs.org >/dev/null 2>&1 && ~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh --tarball-only iasiv5-dsh-surf-0.1.0.tgz && npm view @iasiv5/dsh-surf@0.1.0 version --registry https://registry.npmjs.org && cd / && rm -rf "$t"`
- Expected: registry tarball `SECRET-SCAN-CLEAN`；版本 `0.1.0`

## 2026-09-11 发布通道变更（用户确认）

T7 Step 4/5 的本机 `npm publish` 路径由 GitHub Actions OIDC Trusted Publishing 取代：

- 工作流：`.github/workflows/release.yml`；push `v*` tag 或手动 dispatch 均支持；手动 dispatch 默认 ref=`v0.1.0`，用于本次已存在 tag 的发布。
- 工作流权限：`id-token: write`；runner 使用 Node 24 + npm 11，执行客户端回归、pack allowlist、包名/版本校验后以 `npm publish --provenance --access public` 发布。
- npm 一次性配置：在 `@iasiv5/dsh-surf` 的 Trusted Publishing 中绑定 owner=`iasiv5`、repository=`dsh-surf`、workflow=`release.yml`、environment 留空。
- 本机 `publish-manifest-0.1.0.md` 保留为本地 preflight/审计留痕；实际发布 tarball 由 workflow 从绑定的 `v0.1.0` tag 现场构建，不再依赖本机 OTP。
- 原 Step 5 的执行方式以本通道为准；push/tag/publish 三段独立确认仍然保留。

## 执行纪律

- 开始实现前先复查计划；发现与实机/官方文档不符先停下修计划
- 按任务顺序执行；每任务验证通过再前进；Task 7 无验收记录即 STOP
- push / tag / publish 三段各有独立用户确认；**每个不可逆动作前重复绑定断言（解析器 `--evidence-dir` + HEAD + clean，tag/publish 前另加 secret scan；publish 前另加 publish-manifest 严格 checker）**；验收后源码任何改动 → 回部署计划重新验收
- 遇阻塞立即停下说明，不猜

## 最终验证

- Run: `cd ~/workspace/dsh-surf && git log --oneline | head -12 && ~/workspace/01_docs/audit-scripts/dsh-surf-secret-scan.sh . --require-history && echo FINAL-OK`
- Expected: 提交历史覆盖 T1-T7；`SECRET-SCAN-CLEAN`；发布后另见 Task 7 Step 5 的 registry 复验输出

## 审阅 Checkpoint

- 计划正文到此；请用户审阅后再进入实现
