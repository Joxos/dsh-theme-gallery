# 极光絮语（cyber）渲染性能压榨方案

> **执行状态：已实施。** 最终采用 canvas-sprite 合成器架构（T1/T2 路线合并落地，
> T3 着色器路线实测淘汰），实测数据与结论见
> [aurora-render-perf-results.md](aurora-render-perf-results.md)。

目标：**在不丢失任何特效的前提下，把"极光絮语"的常驻渲染开销压到最低**。
手段不限——从零成本 CSS 微调，到帧率总控、纹理降采样、混合消除，直到用单个着色器重写整个环境场。

---

## 0. "不丢失特效"的判定标准（验收契约）

README 与样式源码承诺的身份特征（`README.md:26-30`）：

| # | 特效 | 源码位置 | 保持要求 |
|---|------|----------|----------|
| E1 | 极光底层 4 层慢速漂移（26s ease-in-out alternate，各自轨迹） | `src/client/presets/cyber/style.css:27-38` | 轨迹、时长、缓动、颜色逐点不变 |
| E2 | 静态极光底色（linear 155°/160°，160% 尺寸） | `style.css:24-25` | 像素级不变 |
| E3 | 胶质脉动 `body::after`：opacity .38→.72（12s）+ sway translate+scale（28s），light= multiply / dark= screen，叠在全部 UI 之上 | `style.css:39-42` | 混合方式、覆盖关系、运动曲线不变 |
| E4 | 流光团 4 个大 blob（62–86vmax），各自 translate+scale+rotate（11/14/17/13s），组底部线性渐隐 mask，组内 screen 混合（light= multiply @ .2） | `src/client/styles/page.css:45-55` | 同上 |
| E5 | 半透明玻璃 token（bg-layer 0.34–0.5 透明度）、菜单 blur(28px) saturate(170%) | `src/client/presets/cyber/tokens.js`、`style.css:8` | 不动 |
| E6 | 即使系统开"减弱动态"也持续运动（身份声明） | `README.md:26-28` | 不得挂到 `prefers-reduced-motion` 上 |
| E7 | 明暗双主题跟随宿主、切样式整体可移除 | `plugin.js:59-76` | 保持挂载/卸载对称 |

**允许的误差预算**（"看不出来"的量化定义）：

- 运动：任何一帧的位移阶跃 ≤ 2.5px（柔和渐变边缘上不可察觉）；周期、相位、缓动零漂移。
- 颜色：非混合区 ΔE ≤ 1（光栅降采样仅影响低频渐变）；混合重叠区 ΔE ≤ 3 且仅在 A/B 并排时可辨。
- 结构：DOM/类名可变（smoke test 同步更新），视觉输出不变。

---

## 1. 现状拆解：一帧到底在画什么

### 1.1 环境效果的三层结构

```
z 轴（从底到顶）
├─ .dsg-aurora          fixed, z-index:-1          静态底色 + 4 个漂移层 (a/b/c/d)
├─ 宿主 UI（半透明面板，透出极光）
├─ body::after          fixed, z-index:2147483001   胶质脉动：3 个 radial，multiply/screen 混合
└─ .dsg-fx (shell.overlay，全窗口最上层浮层)
   └─ mask: 底部线性渐隐
      └─ 4 个 blob（62–86vmax），mix-blend-mode:screen / light:multiply
```

`shell.overlay` 是"全窗口、所有列之上、滚动容器之外"的浮层（已通过宿主 Slot 拓扑确认），
所以 E3、E4 都是**每帧要对整个窗口做混合**的顶层效果。

### 1.2 纹理内存预算（RGBA8，光栅比例 = DPR）

各元素的合成层纹理由"元素盒 × 光栅比例²"决定：

| 层 | CSS 尺寸 | 像素数 | 1440p@DPR1.5 | 4K@DPR2 |
|----|----------|--------|--------------|---------|
| 极光底色（160% bg 裁到盒） | 视口 | 3.7M | 33 MB | 133 MB |
| 漂移层 a–d | 1160×882 … 896×666 | 3.8M | 34 MB | 60 MB |
| `body::after`（inset:-8%） | 116%² 视口 | 5.0M | 45 MB | 179 MB |
| FX blob A–D（80/70/86/62 vmax） | 14.8M（1440p）/ 33.2M（4K） | 14.8M | **133 MB** | **531 MB** |
| **合计** | | | **≈ 245 MB** | **≈ 900 MB** |

blob 是大头：它们是**低频径向渐变**，却按 DPR² 光栅化成巨幅纹理——纯浪费。

### 1.3 每帧合成成本模型（1440p@1.5，60Hz，估算）

- 覆盖面积：底色 1 屏 + 漂移层可见部分 ~1 屏 + UI 1 屏 + 胶质 1.35 屏（混合）+ blob 可见部分 ~1.6 屏（混合）+ mask 应用 1 屏。
- 混合类像素 ≈ 3 屏/帧，总合成 ≈ 6–8 屏/帧 ≈ 22–30M px/帧 → **≈ 1.3–1.8 G px/s**；120Hz 屏翻倍。
- 9 条 CSS 动画按显示刷新率（60/120Hz）无条件 tick，**即使每帧位移只有 0.1–0.3px**。
- 耦合放大器（已核实宿主前端 CSS 消费）：
  - `--dsw-menu-backdrop-filter` → 菜单/浮层/（macOS）窗口底衬的 `backdrop-filter`：只要环境场在动，开着的菜单每帧重算 blur(28px) saturate(170%)。
  - `--dsw-elevation-*`、`--dsw-shadow-lv3` → modal/悬浮预览/Toast 的大半径模糊阴影，滚动即重绘。
  - `vw/vh/vmax` 进了元素尺寸和关键帧 → 每次窗口缩放触发全量重布局 + 9 层重光栅。

> 结论：持续成本 = **纹理内存（数百 MB）× 混合过绘（每帧 ~3 屏）× 刷新率（60/120Hz）**。
> 压榨空间也正落在这三个乘数上，外加一个隐藏乘数——开着菜单时的 backdrop-filter 重算。

---

## 2. T0：先做的四个判定性实验（半天，决定后面怎么切）

| 实验 | 验证什么 | 怎么做 | 影响哪条优化 |
|------|----------|--------|--------------|
| T0-1 | `will-change:transform` 层是否"首帧光栅、缩放只做纹理放大"（文本缩放变糊即此行为） | 一张含小字号文本的 `scale(1→3)` 动画页，开 Layer borders 观察是否重光栅 | T1-2 纹理降采样 |
| T0-2 | `mask-image` 是否隔离混合组（blob 的 screen 只在组内互混、不与 UI 混） | 两个交叠 blob + 组 mask，A/B 对比去 mask 时与 UI 的混合差异 | T2-2 混合消除 |
| T0-3 | `mix-blend-mode` + 动画是否走合成器，还是主线程逐帧重绘 | Performance 面板 + Paint flashing，观察 blob/gel 动画时有无持续 Paint | T2-1/T3-1 收益预期 |
| T0-4 | 基线指标 | DevTools Task Manager 的 GPU Memory 列；`chrome://tracing`（`cc,devtools.timeline`）取 Composite 每帧耗时；FPS meter；流式打字时的掉帧 | 所有验收 |

产出：一份基线表（GPU 显存、每帧合成耗时、60/120Hz 下的功耗）。**后面每一步都用同一套指标回归。**

---

## 3. T1：零视觉差异的免费优化（纯 CSS，逐条可单独合入）

### T1-1 `contain: strict` 锁住环境层的布局/绘制
`.dsg-aurora`、`.dsg-fx` 都是 fixed + inset:0 的定尺寸容器：
```css
.dsg-aurora, .dsg-fx { contain: strict; }
```
收益：UI 侧 DOM 抖动（流式输出）不再穿透到环境层的布局/绘制失效链。风险：无（容器自身定尺寸）。

### T1-2 纹理降采样：渐变按 CSS 像素封顶（"免费或 4 倍"）
径向渐变**没有高频细节**，按 DPR² 光栅化是纯浪费。做法：把每个 blob / 漂移层的盒子缩小 2×，把 `scale(2)` 折进现有 transform（关键帧位移量同步 ×2，最终屏幕几何完全一致）：
```css
/* 例：blob C 原 86vmax → 43vmax 盒 + scale(2)，位移 26vmax→52vmax */
.dsg-fxBlobC{width:43vmax;height:43vmax;left:-6vmax;bottom:-26vmax;
  transform:scale(2);animation:dsg-fx-c 17s ease-in-out infinite alternate}
@keyframes dsg-fx-c{0%{transform:translate3d(0,0,0) scale(2)}
  100%{transform:translate3d(52vmax,-60vmax,0) scale(2.44)}}
```
- 若 T0-1 成立（不重光栅）：纹理内存 **4×↓**（1440p@1.5 的 245MB → ~120MB），采样带宽同步下降。
- 若 T0-1 不成立：几何与像素完全不变，只是白做——**保底不亏**。
- 验收：golden-frame 截图差分应为 0（渐变放大无可见差异）。

### T1-3 `will-change` 卫生
只保留在确实动画的 9 个元素上（现状已满足）；`body::after` 与 `.dsg-fx` 增加 `will-change:transform` 反而会多抬升图层，**保持现状**，仅在 T0-3 证明主线程重绘时才对 gel 加 `transform:translateZ(0)` 试探。列出以免误改。

### T1-4 样式失效成本（低优先级）
`style.css:3-4` 的 `body *{--dsw-shadow-lv3…!important}` 与 `[class*="_card_38jqx"]` 属性子串选择器，在流式插入节点时逐条匹配。在 Performance 面板看 Style recalc 占比；若 > 5%，把属性选择器改为宿主稳定类名精确匹配。预期收益小，但流式场景值得看一眼。

> T1 合计预期：显存 4×↓（T1-2 生效时），布局/绘制失效隔离，视觉零变化。

---

## 4. T2：结构性重排（视觉等效，动刀更大）

### T2-1 帧率总控：环境场 30fps 采样（最大的单点收益）
这些动画是 11–28s 周期的慢漂移，**每帧位移 0.1–2.3px**（1440p 实测推算：漂移层 0.3px/帧@24fps，blob ≤2.3px/帧）。60/120Hz 采样是纯浪费。

做法：保留 `@keyframes`（曲线零改动），用一个 rAF 时钟统一 seek：
```js
const fps = 30, step = 1000 / fps
let last = -Infinity
function tick(now) {
  if (now - last >= step) {
    last = now
    for (const a of document.getAnimations()) a.currentTime = now // 9 条，O(9) 写入
  }
  requestAnimationFrame(tick)
}
```
（把 CSS 动画 `pause()` 后按量化时间 seek；相位由 `performance.timeOrigin` 对齐，掉 tick 后追墙钟。）

收益：
- 环境合成唤醒 60/120Hz → 30Hz：**2–4×↓**；
- 开着菜单时 backdrop-filter 重算频率同步减半/降到 1/4（隐藏收益）；
- 120Hz 屏（ProMotion/高刷）收益最大。

风险与对策：动画从合成器线程移交主线程驱动，UI 大忙时可能丢 tick——但每 tick ≤ 2.3px 的柔和渐变，丢帧不可见；追钟保证相位不漂。若 T0-3 显示当前混合层本来就在主线程重绘，则此改动毫无额外代价。

### T2-2 混合消除与预混
- **FX blob 组**：若 T0-2 证实 mask 组隔离，则 blob 的 `screen` 只影响 blob 互相重叠区。
  - 方案 a：`mix-blend-mode: screen → plus-lighter`（纯加法，GPU 最便宜的混合），重叠区差异 = a·b 项，柔和低透明度渐变下 ΔE 通常 ≤ 3；
  - 方案 b（保真度更高）：把"组内 screen 预混 + 底部 mask"全部算进一个离屏合成结果（T3-1 的 shader 顺手完成），组内混合次数 4→0。
  - 验收：重叠区 golden-frame 差分 ΔE ≤ 3，超差就回退保留 `screen`。
- **胶质层 `body::after`**：它对**活动 UI** 做 multiply/screen，这是 E3 的定义本身，必须保留一条全屏混合。但可以：
  - 把 gel 与 FX 组合并成**一个**顶层混合层（两次混合 → 一次），需 A/B 确认二者相对层序不变；
  - pulse 的 `opacity` 动画改由 T2-1 的时钟驱动同一个层（减少一次属性动画通道）。

### T2-3 resize 抑制
- `vw/vh/vmax` 关键帧使窗口缩放时 9 层全部重算 + 重光栅。把视口单位解析成 CSS 变量（`--dsg-vw` 等），由 ResizeObserver 防抖 150ms 更新一次；
- 可选激进项：交互式拖拽缩放期间冻结环境动画（松手恢复）。属行为变化，默认关闭，做成开关。

> T2 合计预期：在 T1 基础上再 2–4×↓ 合成唤醒 + 少 2 条全屏混合通道。

---

## 5. T3：极限手段（"任何手段"档）

### T3-1 单着色器环境场（推荐终态）
把 E1–E4 全部搬进**两块 canvas**，用解析式渐变一次画完：

```
canvas#dsg-aurora-gl   fixed inset:0 z-index:-1  alpha:false  分辨率 = CSS px ÷ 2
canvas#dsg-fx-gl       fixed inset:0（顶层） mix-blend-mode:multiply/screen
```

- 片元着色器逐项复刻公式：
  - 底色 = 双 stop 线性渐变；漂移层 = `radial-gradient(closest-side, rgba(c,α), transparent)` —— CSS 的预乘 alpha 插值恰等于"恒定 RGB × 线性 α 斜坡"，shader 里 `vec4(rgb, α*(1-t))` 精确等价；
  - 4 个 blob 的组内 screen + mask + gel 的 pulse/sway **全部在 shader 内预混**，顶层只剩**一次**全屏混合；
  - 缓动 `ease-in-out` = `cubic-bezier(.42,0,.58,1)`，每 tick 在 CPU 算好 9 个变换量当 uniform 传入——轨迹与 CSS 逐点一致。
- 驱动：T2-1 的 30fps 时钟；`OffscreenCanvas` + worker 可把主线程占用归零；`desynchronized:true` 降低合成延迟。
- 显存：245MB → **< 10MB**（两块半分辨率画布）；混合通道 5 → 1；每帧像素量 ~6–8 屏 → ~2 屏，且只在 30fps。
- 优雅降级：无 WebGL / context lost → 回落 T1/T2 的 CSS 实现（保留现在的结构作为 fallback 分支）。
- 细节：渐变降采样若出 banding，在 shader 里加蓝噪 dither（顺手比 CSS 更干净）。

### T3-2 自适应质量总控
滚动监测帧预算（rAF 实际间隔），超预算时逐级降：30→20→12fps、1/2→1/3 分辨率；恢复后升回。远程桌面 / 核显 / 电池模式自动落在低档。**任何档位都不移除特效**，只降采样率与分辨率。

### T3-3 用户侧开关（可选）
`localStorage: dsg.style-gallery.fx = {fps, scale}` 供极客调参；默认自动。

---

## 6. 统一验收协议（每一步都跑）

1. **特效契约**：对照 §0 的 E1–E7 逐条人工核对（明暗两主题）。
2. **golden-frame 差分**：`document.getAnimations().forEach(a => { a.pause(); a.currentTime = T })`，
   T ∈ {0, 25%, 50%, 75%, 100%} × {light, dark} × {1280×800, 2560×1440, 3840×2160}，
   截图比对（T1 允许 diff=0；T2/T3 允许 SSIM ≥ 0.995、混合重叠区 ΔE ≤ 3）。
3. **指标门槛**（1440p@1.5 基线之上）：
   - 常驻 GPU 显存 < 60MB（T2 后）/ < 20MB（T3-1 后）；
   - 环境场每帧合成耗时 < 0.5ms @30fps（UHD 620 级核显实测）；
   - 环境 tick 主线程耗时 < 0.2ms；
   - 流式输出时掉帧率与"恢复原生"一致（≤ +2%）。
4. **回归**：`pnpm build` 重新生成 `client.js`（提交的产物）→ `pnpm check` → `pnpm test`；
   结构变化同步更新 `scripts/smoke-test.mjs:153-186` 的 DOM 断言。

---

## 7. 实施顺序与预期收益汇总

| 步骤 | 内容 | 视觉风险 | 预期收益 |
|------|------|----------|----------|
| T0 | 四个判定实验 + 基线 | 无 | 定向 |
| T1-1/1-2 | contain + 纹理降采样 | 零（差分=0） | 显存 ≤ 4×↓ |
| T2-1 | 30fps 帧率总控 | 零（<2.3px/tick） | 合成唤醒 2–4×↓，菜单 blur 同步降频 |
| T2-2 | 混合消除/预混 | 微（ΔE≤3） | 全屏混合通道 5→2 |
| T3-1 | 单 shader 环境场 | 微（可差分验证） | 显存 245MB→<10MB，合成 ~6–8×↓ |
| T3-2 | 自适应降级 | 无 | 弱机/远程桌面兜底 |

叠加终态（T3-1 + T2-1 + T3-2）：**常驻环境渲染从"每秒 GB 级像素混合 + 数百 MB 显存"降到"每秒两百 MB 级、<20MB 显存"，约一个数量级**；特效轨迹逐点保留。

## 8. 明确不做（会丢特效或得不偿失）

- 挂 `prefers-reduced-motion`、缩短周期、改缓动 —— 违反 E6 与身份声明；
- 把 gel 的 multiply/screen 换成普通 alpha —— UI 上的胶质感是 E3 本体；
- 移除 `will-change` —— 会把层踢回主线程；
- 用 `filter: blur()` 替代渐变 —— 更贵；
- 缩短 `--dsw-menu-backdrop-filter` 半径 —— E5，且属宿主消费面。

## 9. 风险与回退

- Blink 对混合层动画、will-change 光栅策略随版本变化 → T0 先行，每步保留 git 独立提交可回退；
- `plus-lighter` 在亮色 multiply 场景差异略大 → 只对暗色组内混合启用，亮色保留原混合；
- canvas 路线引入 context lost / 缩放重建 → fallback 分支常驻；
- smoke test 与提交产物 `client.js` 必须同步重构建（`README.md:55-58` 约定）。
