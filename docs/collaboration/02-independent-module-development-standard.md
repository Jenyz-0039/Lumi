# 队友独立模块开发规范

> 本文可直接提供给队友及其 Codex/其他 AI。  
> 适用模块：模块三（3D 角色模型展示）、模块七、模块十一（网站最后一个模块）。  
> 核心目标：独立开发、可单独预览、低风险接入，不改动主项目已有模块。

## 1. 强制技术栈

1. 使用原生 HTML5、CSS 和 JavaScript ES Modules。
2. 模块源码必须是浏览器可直接加载的 `.js`，使用 `import/export`；不得交付 JSX、TSX 或只能经打包器运行的源码。
3. 不得把模块或项目迁移到 React、Vue、Svelte、Next.js、Nuxt、Vite 等框架/构建体系。
4. 主项目当前无第三方 npm 运行时依赖、无 `package.json`、无锁文件。除 3D 渲染确有必要外，优先使用浏览器原生 API。
5. 本地预览使用 Node 静态服务器即可。主项目当前的 `preview-server.cjs` 仅依赖 Node 内置模块；项目没有锁定 Node 版本。
6. 不得自行修改主项目的 `index.html`、`styles.css`、`src/main.js`、`src/data/sections.js`、公共组件、已有模块文件、现有素材或 Git 配置。交付时只提供新增文件和一份接入说明。

## 2. 模块接口契约

每个模块至少导出一个纯渲染函数；有动画或交互时再导出一个初始化函数。

```js
export function renderModuleName(section) {
  return `
    <section
      id="${section.id}"
      class="section section--unique-module-name"
      data-section-id="${section.id}"
    >
      <div class="unique-module-name__stage">
        <!-- 模块内容 -->
      </div>
    </section>
  `;
}

export function initModuleName() {
  const root = document.querySelector('[data-section-id="expected-id"]');
  if (!root || root.dataset.initialized === 'true') return () => {};
  root.dataset.initialized = 'true';

  // 只在 root 内查找元素、绑定事件和启动动画。

  return () => {
    // 取消 rAF、observer、timer，移除所有事件并释放资源。
    delete root.dataset.initialized;
  };
}
```

渲染函数要求：

- 只根据传入的 `section` 和模块内常量生成 HTML，不修改 DOM、不绑定事件、不访问全局状态。
- 最外层必须保留 `id`、`.section` 和 `data-section-id` 三个接口。
- 模块三的 ID 为 `character`；模块七为 `actions`；最后模块为 `ending`。
- HTML 中的 `id`、`data-*` 和类名必须在模块内唯一。
- 不在模块 HTML 中插入 `<style>` 或全局 `<script>`。

初始化函数要求：

- 只能在模块根节点内查询和修改元素。
- 必须幂等，重复调用不得叠加监听器、canvas 或动画循环。
- 必须返回 cleanup 函数；即使当前主项目只初始化一次，也要为未来替换和热重载准备。
- 初始化失败应保持静态内容/海报可见，不能抛出错误导致后续模块失效。

## 3. 推荐交付目录

每个模块单独交付一个文件夹，不把三个模块混在一起：

```text
module-03-character-3d/
├─ README.md                         # 功能、运行方式、兼容性、已知问题
├─ INTEGRATION.md                    # 需要主项目执行的最小接入步骤
├─ DEPENDENCIES.md                   # 全部第三方依赖、精确版本、来源、许可证
├─ FILES.sha256                      # 建议提供的文件校验清单
├─ sections/
│  ├─ Character3DSection.js
│  └─ Character3DSection.css
├─ assets/
│  └─ module-03-character-3d/
│     ├─ model/
│     ├─ textures/
│     ├─ poster/
│     └─ vendor/                     # 仅在批准采用本地第三方文件时存在
└─ preview/
   ├─ index.html
   ├─ preview.js
   └─ preview-server.cjs             # 可复用或提供简短运行说明
```

模块七使用唯一前缀 `module-07-...`，模块十一使用 `module-11-ending`。最终接入主项目时，JS/CSS 放入 `src/sections/`，素材放入 `public/assets/module-03-character-3d/`、`module-07-.../`、`module-11-ending/`。

## 4. 命名与导出规则

推荐导出名称：

| 模块 | 渲染导出 | 初始化导出 | 根类 |
| --- | --- | --- | --- |
| 03 | `renderCharacter3D` | `initCharacter3D` | `.section--character-3d` |
| 07 | `renderActionsV2` 或按最终语义命名 | `initActionsV2` | `.section--actions-v2` |
| 11 | `renderEndingV2` | `initEndingV2` | `.section--ending-v2` |

不得使用 `default export`，统一使用具名导出，方便主项目审查和切换。文件名、导出名和根类必须互相对应。旧模块文件不会被删除，新文件不得与旧导出同名到难以区分。

## 5. 素材和路径管理

1. 每个模块只使用自己的素材目录，不引用队友电脑的绝对路径，不使用 `C:\...`、`file://`、桌面路径或临时目录。
2. 交付代码中的正式素材路径按主项目约定写为：

   ```js
   const ASSET_ROOT = './public/assets/module-03-character-3d';
   ```

3. 文件名使用小写英文、数字和连字符，不含空格、中文括号或版本含糊的 `final-final`。
4. 图片优先使用 WebP/AVIF（确认目标浏览器支持后）或经过压缩的 PNG/JPG；视频优先 MP4/H.264，并提供合理 poster。
5. 不内联大体积 base64，不把媒体写进 JS/CSS。
6. 所有素材必须说明来源、版权/授权状态和是否允许公开发布；第三方库必须保留许可证文件。
7. 不覆盖主项目已有素材；即使文件名相同，也必须放在模块专属目录。
8. README 中列出每个素材的用途、尺寸、格式和大致体积。

## 6. CSS 隔离规范

所有模块样式必须从唯一根类开始：

```css
.section--character-3d { /* 模块根 */ }
.section--character-3d .character-3d__canvas { /* 子元素 */ }
@keyframes character-3d-idle { /* 唯一动画名 */ }
```

禁止：

- 修改 `:root`、`html`、`body`、`*`、`.section`、`main`、`button`、`img` 等全局选择器。
- 使用无前缀的通用类，如 `.container`、`.active`、`.title`、`.canvas`。
- 覆盖现有 `--ink`、`--blue` 等全局变量；模块变量必须以模块名开头，例如 `--character-3d-bg`。
- 使用无上限的全局 z-index。模块内部建议建立 `isolation: isolate`，局部 z-index 控制在约 0–20；确需 fixed 浮层时在接入说明中声明。
- 使用 `!important` 抢占其他模块样式，除非有明确、已记录且经过批准的原因。

样式必须包含窄屏适配，并处理 `prefers-reduced-motion: reduce`。模块不得改变 `body` 的 overflow、cursor、touch-action 或用户选择行为；如交互期间确需临时改变，必须限定时间并在 cleanup 和所有取消路径中恢复。

## 7. 事件、动画和滚动隔离

1. 优先绑定到模块根节点或模块子元素，不绑定 `document`/`window`。
2. 必须使用 Pointer Events 统一鼠标、触控和手写笔；不要同时叠加 mouse/touch 两套监听造成重复触发。
3. 需要 `window` 的 `scroll/resize` 时：保存命名函数引用、使用 passive（适用时）、用 rAF 合帧，并在 cleanup 中移除。
4. 禁止拦截全站滚轮、方向键、触摸滚动或调用全局 `preventDefault()`。
5. 禁止修改主站导航、页头、其他模块 class、`body.dataset.activeSection` 或共享 store。
6. 动画循环必须可暂停：模块离开视口、标签页隐藏或 reduced-motion 开启时停止/降级。
7. 所有 `requestAnimationFrame`、`setTimeout`、`setInterval`、`IntersectionObserver`、`ResizeObserver` 必须可追踪并在 cleanup 中取消/断开。
8. 不注册匿名、无法移除的全局监听器。

## 8. 宽高、响应式和滚动触发

- 普通模块默认使用 `.section` 的 `min-height: 100vh` 和公共内边距；不要无理由覆盖。
- 全屏视觉模块可使用 `min-height: 100svh`。如果需要长滚动叙事，必须在 `INTEGRATION.md` 明确总高度、sticky 舞台高度和滚动进度公式。
- 不使用写死的桌面像素画布。优先 `clamp()`、百分比、`vw/vh/svh`、`aspect-ratio` 和 `ResizeObserver`。
- 至少验证 360×800、768×1024、1440×900 三类视口；3D 模块还需验证设备横竖屏切换。
- 模块根节点不得横向撑开页面；检查 `overflow`、大 transform、绝对定位和 canvas DPR。
- 滚动触发优先使用模块根的 `IntersectionObserver`；需要连续进度时，只读取一次布局信息并通过 rAF 更新 transform/opacity。
- 不改变全站滚动行为，不新增全局 scroll-snap。

## 9. 第三方依赖管理

未经确认不得向主项目添加依赖。若确需新增，先在 `DEPENDENCIES.md` 提交：

```text
名称：
用途：
精确版本：
官方来源 URL：
许可证：
浏览器端文件及体积：
是否需要构建步骤：
是否需要 decoder/worker/WASM：
离线预览方式：
替代方案：
安全与维护风险：
```

不得使用 `latest`、浮动 semver、未固定版本的 CDN URL 或来历不明的压缩文件。主项目当前没有包管理清单，因此依赖接入方案必须二选一并经确认：

- 引入正式的 `package.json` 和锁文件，同时说明构建/部署变化；或
- 使用经过批准的浏览器 ESM/vendor 文件，连同许可证、精确版本和校验值放入模块专属目录。

队友可以为自己的预览环境使用开发工具，但最终交付源码必须仍可被主项目的原生 ES Module 架构接入。

## 10. 模块三：3D 专项要求

### 模型格式

- 正式交付首选单文件 `.glb`（glTF 2.0 binary）。多文件 `.gltf + .bin + textures` 仅在确有必要时使用，并确保相对 URI 完整。
- 不建议把 FBX、OBJ、Blender 工程文件作为网页运行时格式；可作为源文件附带，但网页应加载导出的 GLB/glTF。
- 坐标、朝向、单位、原点、动画 clip 名称和材质必须在 README 中说明。
- 交付前使用 glTF Validator 检查，报告不应有 error；warning 需解释。

### 加载和降级

- 3D 库和 loader 必须按“第三方依赖管理”申报并固定精确版本；不要假定主项目已安装 Three.js。
- 模型只在模块接近视口时开始加载，显示明确 loading 状态；加载失败时显示静态 poster 和可理解的提示，不能留下空白 canvas。
- 若使用 Draco、Meshopt、KTX2/Basis 等压缩，decoder/worker/WASM 必须一并交付、固定版本并使用模块相对路径，不依赖外部 CDN。
- 处理 WebGL 不可用、context lost、低性能设备和 reduced-motion 情况。

### 生命周期与资源释放

cleanup 至少负责：

- `cancelAnimationFrame`，停止 clock、mixer 和自定义循环。
- 断开 observer，移除 resize、pointer、visibility 等事件。
- 遍历场景并 `dispose()` geometry、material、texture、render target。
- 对材质数组和共享纹理去重后释放，避免重复 dispose。
- `renderer.dispose()`；只有在模块确定卸载且确有必要时再考虑释放 WebGL context。
- 移除 canvas、loading UI 和临时 DOM 引用。
- 清空 loader/缓存引用，确保重新初始化不会生成两个 renderer。

### 性能预算与优化

- 建议首屏所需 GLB 压缩后目标不超过 10 MB，硬上限需在超出 15 MB 前与主项目确认。
- 常规纹理优先不超过 2048×2048；只有确实需要的近景纹理才更高。控制透明材质、draw calls、骨骼数和实时灯光数量。
- 对静态网格合并/实例化，合理使用 Draco/Meshopt 和 KTX2；删除未使用的节点、动画、相机、灯光和纹理。
- renderer pixel ratio 必须设上限，例如 `Math.min(devicePixelRatio, 1.5)`，低端或移动设备可进一步降低。
- 离开视口时暂停渲染；静止场景优先按需渲染，而不是永久 60 FPS。
- 不默认启用昂贵后处理、超高阴影贴图或多个实时阴影光源。
- 记录模型三角面数、贴图总量、GLB 大小、典型 draw calls 和桌面/移动端观察到的帧率。

### 交互兼容

- 使用 Pointer Events；拖拽旋转只在 canvas 内生效，不阻止页面垂直滚动。
- 在触屏上区分横向旋转手势和纵向页面滚动；不要对整个模块设置 `touch-action: none`。
- 提供键盘可用的替代控件或“自动旋转开关/重置视角”按钮，并有可见焦点。
- canvas 必须有可访问名称和静态文字/图片替代信息。
- 尊重 `prefers-reduced-motion`，关闭自动旋转或降低运动。
- 不隐藏或替换全站光标；如需模块内光标，只在模块根内生效并在 coarse pointer 上关闭。

## 11. 独立预览要求

每个交付包必须可单独预览，不依赖队友本机绝对路径：

1. `preview/index.html` 只加载该模块 CSS 和 `preview.js`。
2. `preview.js` 构造与主站相同形状的 section 数据，调用正式 `renderXxx()` 和 `initXxx()`；不得复制另一套模块实现。
3. 使用静态服务器运行，不能要求直接双击 HTML。
4. README 提供一条明确命令和访问 URL。
5. 预览页可以有简单背景/视口切换工具，但这些工具不能混入正式模块文件。
6. 至少提供桌面、移动端截图或短录屏，以及控制台无 error 的说明。

## 12. 交付验收清单

- [ ] 只包含模块新增文件，无主项目既有文件修改。
- [ ] 具名导出和根 section 契约正确。
- [ ] CSS 全部按唯一根类隔离。
- [ ] 所有事件、observer、timer、rAF 有 cleanup。
- [ ] 素材全部使用相对路径且位于模块专属目录。
- [ ] 依赖精确版本、来源、许可证和校验信息完整。
- [ ] 独立预览可运行，控制台无 error。
- [ ] 桌面、平板、手机布局已检查。
- [ ] reduced-motion、键盘、触屏和鼠标行为已检查。
- [ ] 3D 模块通过 glTF 验证并提供性能数据、poster 和失败降级。
- [ ] README/INTEGRATION/DEPENDENCIES/文件清单齐全。
- [ ] 未改动或复制覆盖模块一、二、四、六、九、十的文件与素材。

