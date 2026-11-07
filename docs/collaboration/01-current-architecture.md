# 当前网站技术架构说明

> 检查日期：2026-11-06  
> 检查范围：当前工作目录中的源码、静态资源、预览脚本和可读取的 Git 元数据。  
> 保护原则：本次未修改任何网站功能代码、现有样式、素材、依赖或 Git 历史。

## 1. 结论摘要

当前网站是一个不依赖前端框架和打包器的静态单页网站，使用 HTML5、CSS 和原生 JavaScript ES Modules。页面由 11 个纵向模块组成，`src/data/sections.js` 提供模块顺序和元数据，`src/main.js` 将模块类型映射到各模块的 `renderXxx()` 函数，并一次性拼接到 `<main>` 中。

代码层面适合以“一个模块一个 JS 文件、一个局部 CSS 文件、一个独立素材目录”的方式接收外部模块；但当前主工作区的 Git 指针失效，无法确认分支、提交历史、未提交修改和未跟踪文件。因此，项目暂时不具备安全开展分支协作的完整条件。应先恢复主 Git 元数据并建立经确认的基线，再开始并行开发或正式整合。

## 2. 技术栈及可核实版本

| 类别 | 当前实际情况 | 版本结论 |
| --- | --- | --- |
| 页面 | HTML5 | 无独立版本清单 |
| 样式 | 原生 CSS，包含 CSS 变量、Grid、Flex、`svh`、sticky、媒体查询、关键帧动画 | 无预处理器 |
| 脚本 | 原生 JavaScript，浏览器 ES Modules（`<script type="module">`） | 无 Babel/TypeScript |
| 框架 | 未使用 React、Vue、Svelte 等框架 | 不适用 |
| 构建工具 | 未发现 Vite、Webpack、Rollup 等 | 不适用 |
| 包管理 | 未发现 `package.json`、锁文件或 `node_modules` 依赖声明 | 当前无 npm 依赖版本可核实 |
| 本地预览 | `preview-server.cjs`，只使用 Node 内置 `http`、`fs`、`path` | 项目未声明 Node 版本；本次检查环境为 Node `v24.22.1`，这不是项目锁定版本 |
| 外部 CDN | `index.html` 和源码中未发现外部 CDN 引用 | 当前无外部运行时依赖 |

因此，队友不得把本项目理解为 React/Vite 项目，也不得自行重建为其他框架。若 3D 模块需要 Three.js、`<model-viewer>` 或其他库，必须作为新增依赖单独申报、固定精确版本并等待主项目确认。

## 3. 目录结构和主要入口

```text
lumi/
├─ index.html                         # 正式页面入口，加载全局/模块 CSS 和 src/main.js
├─ styles.css                        # 全局变量、公共布局、导航、开屏和通用组件样式
├─ preview-server.cjs                # 无依赖的本地静态服务器，默认 127.0.0.1:4173
├─ module-two-preview.html           # 模块二独立预览入口
├─ src/
│  ├─ main.js                        # 页面组装、模块初始化、导航、滚动观察、公共事件
│  ├─ module-two-preview.js          # 模块二预览组装
│  ├─ data/sections.js               # 11 个模块的顺序、ID、标题、类型及部分列表数据
│  ├─ state/store.js                 # 轻量内存状态容器
│  ├─ components/
│  │  ├─ SectionShell.js             # 通用 section 外壳和标题区
│  │  ├─ SideNav.js                  # 右侧章节导航
│  │  └─ PlaceholderMedia.js         # 占位素材组件
│  └─ sections/
│     ├─ OpeningSection.js
│     ├─ BackgroundSection.js/.css
│     ├─ CharacterSection.js
│     ├─ VideoSection.js + VideoFrameSection.css
│     ├─ ExpressionsSection.js
│     ├─ ActionsSection.js
│     ├─ OutfitsSection.js
│     ├─ ScenesSection.js/.css
│     ├─ GameSection.js/.css
│     ├─ GameSection.interactions.js
│     └─ EndingSection.js
├─ public/assets/                    # 图片、视频、光标和各模块素材
├─ scripts/                          # 素材处理 PowerShell 脚本
├─ output/                           # 本地输出目录
└─ github-pages-export/              # 带独立 .git 的发布快照，不是当前主仓库元数据
```

正式入口链路是：

```text
index.html
  → styles.css + 4 个现有模块 CSS
  → src/main.js
  → sections.js 决定顺序
  → renderers[type] 调用模块 render 函数
  → 字符串拼接写入 #app
  → 调用模块 init 函数绑定动画和交互
```

## 4. 11 个模块的组织、引用和渲染

| 序号 | ID | type | 当前渲染文件 | 当前初始化逻辑 |
| --- | --- | --- | --- | --- |
| 01 | `opening` | `opening` | `OpeningSection.js` | `main.js` 内 `initOpeningTimeline()` |
| 02 | `background` | `background` | `BackgroundSection.js` | `initBackgroundStack()` |
| 03 | `character` | `character` | `CharacterSection.js` | 公共点击状态；当前为占位内容 |
| 04 | `transition-one` | `video` | `VideoSection.js` | `initVideoFrames()` |
| 05 | `expressions` | `expressions` | `ExpressionsSection.js` | `main.js` 中按钮监听 |
| 06 | `transition-two` | `video` | `VideoSection.js` | 与模块四共用 `initVideoFrames()` |
| 07 | `actions` | `actions` | `ActionsSection.js` | 当前为占位内容 |
| 08 | `outfits` | `outfits` | `OutfitsSection.js` | `main.js` 中按钮监听 |
| 09 | `scenes` | `scenes` | `ScenesSection.js` | `initScenes()` |
| 10 | `game` | `game` | `GameSection.js` | `initGameInteraction()` |
| 11 | `ending` | `ending` | `EndingSection.js` | 公共 `data-scroll-target` 返回顶部；当前为简易结束内容 |

模块渲染函数返回 HTML 字符串，不返回 DOM 节点。多数普通模块使用 `sectionShell(section, content, extraClass)` 生成统一的 `<section>`，特殊全屏模块（场景、小游戏）直接返回自己的 `<section>` 字符串，但仍保留：

- `id="${section.id}"`
- `class="section ..."`
- `data-section-id="${section.id}"`

这三个接口是侧边导航、滚动观察和公共布局能够识别模块的关键契约。

## 5. 单页滚动、转场和动画实现

网站没有路由器、轮播库或统一动画库，全部使用浏览器原生能力：

- 页面是普通纵向文档流，不使用全站 `scroll-snap`。
- `html { scroll-behavior: smooth; }` 提供基础平滑滚动。
- 导航点击通过 `scrollIntoView({ behavior: 'smooth' })` 定位。
- `IntersectionObserver` 以 `threshold: 0.45` 判断当前章节，更新侧边导航、页码和共享状态。
- 开屏模块高度为约 `300svh`，内部舞台 `position: sticky; top: 0; height: 100svh`；先以 `requestAnimationFrame` 自动播放，再按模块局部滚动距离驱动 CSS 变量和遮罩。
- 模块二监听 `scroll/resize`，通过 `requestAnimationFrame` 合帧计算卡片堆叠动画。
- 模块四、六用 `IntersectionObserver` 控制视频进入视口时播放、离开时暂停；贴纸使用 CSS `@keyframes`。
- 模块九高度为 `500svh`，内部 sticky 舞台按滚动进度逐张变换相框。
- 模块十使用 Pointer Events、pointer capture、定时器和 CSS 动画实现投喂与摸头。
- 已实现的主要动画均使用 CSS transform/opacity 或 rAF，并有部分 `prefers-reduced-motion` 处理。

当前没有统一的动画生命周期管理器。多个模块各自直接向 `window` 或模块根元素绑定监听器；部分初始化函数会返回清理函数，但 `main.js` 当前没有统一保存或调用这些清理函数。新模块必须自行保持初始化幂等，并提供完整 cleanup，避免未来重复挂载时泄漏。

## 6. 公共组件、全局样式和共享状态

### 公共组件

- `SectionShell.js`：普通模块的推荐外壳；包含 `.section`、`.section__inner` 和标题区域。
- `SideNav.js`：根据 `sections` 自动生成全部章节导航。
- `PlaceholderMedia.js`：占位组件，不是新模块的强制依赖。

### 全局样式

`styles.css` 定义：

- `:root` 颜色、字体、阴影等公共变量。
- `* { box-sizing: border-box; }`、`body`、按钮等全局规则。
- 全站自定义鼠标光标。
- 固定页头和固定侧边导航。
- `.section`、`.section__inner`、标题、卡片、按钮等公共样式。
- 开屏模块的大量专用样式。
- 760px 移动端断点和 reduced-motion 规则。

模块二、四/六、九、十已有单独 CSS 文件；其中模块样式大多带 `.section--xxx` 前缀，但仍存在少量顶层类（例如转场、场景元素和游戏拖拽幽灵）。新模块应使用更严格的模块根选择器和唯一命名。

### 共享状态

`createSiteStore()` 是一个本地、同步、无持久化的轻量 store，当前字段包括：

- `activeSection`
- `characterExpression`
- `selectedExpression`
- `selectedOutfit`
- `gameInteraction`

它只通过 `main.js` 创建并订阅，没有作为参数注入模块。新模块原则上应保持模块内部状态；确需影响全站时，先定义最小状态接口，再由主项目显式接入，不能直接创建新的全局变量。

## 7. 模块三、模块七和最后一个模块的接入点

### 模块三：3D 角色模型展示

当前槽位为 `id: character`、`type: character`、序号 `03`。最低风险方案是新增 `Character3DSection.js` 和 `Character3DSection.css`，保留旧 `CharacterSection.js` 不删除，仅在 `main.js` 切换导入和 renderer，并新增一次初始化调用。保持 ID 和 type 不变，可避免影响导航顺序、页码、滚动观察和其他模块。

### 模块七

当前槽位为 `id: actions`、`type: actions`、序号 `07`。设计确认后新增独立的 `ActionsSectionV2.js/.css`，保留旧文件作为快速回退。若模块语义不再是“动作”，可以在整合时修改 `sections.js` 中这一项的 label/title/type，但 ID 建议继续保留 `actions`，除非导航语义确实必须改变。

### 最后一个模块

当前最后模块为 `id: ending`、`type: ending`、序号 `11`。新增 `EndingSectionV2.js/.css` 后只切换 renderer。必须继续输出 `data-section-id="ending"`；如需返回顶部，继续使用现有 `data-scroll-target="opening"` 契约，避免另写全局滚动逻辑。

## 8. 是否适合直接集成外部独立模块

从代码结构看：有条件适合。模块边界清晰、渲染入口集中、静态资源路径直观，且没有复杂构建链。

从当前协作安全看：暂不适合“直接复制后立即提交”。存在以下前置问题：

1. 主 `.git` 文件指向 `C:/Users/46814/Documents/ChatGPT/lumi/.git/worktrees/lumi`，该目标不存在。
2. 因此无法可靠读取当前分支、主仓库最近提交、未提交修改或未跟踪文件。
3. 未配置依赖清单、浏览器支持范围、lint/test/build 命令。
4. 模块接口尚未形成书面契约；本目录中的另外两份文档用于补足这一点。
5. 模块七和模块十一的具体设计需求仍未提供。

在 Git 问题解决、基线确认、设计和依赖决策完成后，项目适合采用独立分支或独立交付包进行多人协作。

## 9. Git 状态与基线检查结果

### 主工作目录

| 检查项 | 结果 |
| --- | --- |
| 当前分支 | 无法确认；Git worktree 指针目标不存在 |
| 最近提交 | 无法确认 |
| 未提交修改 | 无法确认，不能据此认定工作区干净 |
| 未跟踪文件 | 无法确认，不能据此认定素材已被跟踪 |
| 可靠主基线 | 当前没有可验证的可靠主基线 |

当前目录可见的重要内容包括 `src/`、`public/assets/`、根级 HTML/CSS/预览脚本、素材处理脚本、`output/` 和发布导出目录。`public/assets/` 中本次统计到 86 个媒体文件：78 个 PNG、6 个 JPG、2 个 MP4，总体约 56.7 MB。由于主 Git 不可用，不能判断其中哪些是未跟踪的重要素材。

### `github-pages-export` 内嵌仓库

该目录内有独立 `.git`：

- 分支：`main`
- 状态：干净
- 最近提交：`3a5a671 Publish Lumi interactive site`
- 无已配置 remote
- 约 100 个被跟踪文件

它只能证明该发布快照自身有一个干净提交，不能证明外层主项目的当前源码和全部素材已安全进入版本历史，也不能作为外层主仓库的替代品。

### 是否适合立即建立新基线

不适合立即提交。应先确认主仓库原位置是否可恢复，或在用户明确同意后重新建立正确的 Git 仓库/工作树关系；随后重新执行 `status`、`log`、`ls-files` 和未跟踪素材审计。只有用户核对变更清单并明确授权后，才建立“协作开发前基线”提交或标签。本次没有执行提交、重置、清理、checkout 或 Git 修复。

