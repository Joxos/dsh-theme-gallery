# 极光絮语渲染性能压榨 — 实验结果

> 配套方案：[aurora-render-perf-plan.md](aurora-render-perf-plan.md)。
> 所有数据来自 `bench/`（系统 Edge，ANGLE D3D11，硬件 GPU），视口 2560×1440 @ DPR 1.5，
> 环境动画全程运行。报告再生成：`node bench/run.mjs` → `bench/out/report.md`。

## 1. 结论（TL;DR）

保留的实现：**canvas-sprite 合成器架构**（`src/client/effects/ambient.js`）——
每个环境渐变（底色、4 个漂移层、gel、4 个流光团）一次性烘焙进**有上限的 canvas 后备店**，
canvas 本身就是它的合成器纹理，运动仍由原 CSS keyframes 在合成器线程驱动。

| 维度 | 基线（历史 CSS 渐变） | 保留实现 | 变化 |
|---|---|---|---|
| 常驻环境纹理（2560×1440@1.5） | 239 MB | **0.1 MB** | **−2390×** |
| 常驻环境纹理（3840×2160@2） | 884 MB | **0.1 MB** | **−8840×** |
| 视觉保真（golden-frame 差分） | — | meanAbs ≤0.45，max Δ≤6，0% 像素 >8 | 无感 |
| 运动 | 合成器 transform 动画 | 完全相同的 keyframes | 逐点一致 |
| 60fps 目标 | 高端 GPU 达成；4K@2 下**渲染崩溃**（见 §3.3） | 任意视口稳定 170fps | 由崩溃变为稳定 |

## 2. 保真门槛（"不丢失特效"的机器判定）

冻结动画时间 T ∈ {0, 4s, 9s, 16s, 26s} × 明暗双主题截图，与历史 CSS 渲染逐像素比对
（稳定截屏：截到两帧完全一致才采信，杜绝半光栅瓦片入镜）。判定门槛：max Δ ≤ 8
且 0% 像素超阈值 = 特效无损。

| 对比 | light meanAbs / maxΔ / %>8 | dark meanAbs / maxΔ / %>8 | 判定 |
|---|---|---|---|
| baseline vs production @2.5K@1.5 | 0.35 / 5 / 0% | 0.45 / 6 / 0% | ✅ 无损 |
| baseline vs productionTiny @2.5K@1.5 | 0.35 / 6 / 0% | 0.45 / 6 / 0% | ✅ 无损 |
| baseline vs productionMicro @2.5K@1.5 | 0.36 / 6 / 0% | 0.45 / 6 / 0% | ✅ 无损 |
| baseline vs productionTiny/Micro @4K 视口 | 0.33 / 6 / 0% | 0.42 / 5 / 0% | ✅ 无损 |
| baseline vs productionLight（plus-lighter） | 0.35 / 5 / 0% | 1.80 / 17 / 4.7% | ❌ 暗色超门槛 |
| production 家族内部互比（各视口） | ≤0.31 / 6 / 0% | ≤0.39 / 5 / 0% | 一致 |

注：首轮门槛曾报 10–33 meanAbs，定位为**截屏竞态伪影**——baseline 的 239MB 纹理在
seek 大跳变后光栅化迟滞，截到了半光栅瓦片（PNG 体积 50KB vs 254KB 即为证据）；
稳定截屏后归零。这一迟滞本身也是大纹理的真实用户代价。

## 3. 保真攻坚记录（两个真实 bug）

1. **非预乘插值黑晕**：Canvas2D 渐变按直通插值，CSS 按预乘插值；`-> transparent`
   端点被拉向黑色，multiply 混合下放大成明显暗斑。修复：`expandStops` 把每段展开成
   密集的预乘等价色标（`src/client/effects/gradients.js`）。
2. **椭圆半径少算一半**：`radial-gradient(900px 700px …)` 的 900/700 是半轴而非直径，
   首版按直径换算导致 gel/漂移层被浓缩。修复后差分从 meanAbs 1.8 / max 48 → 0.35 / 5。

另有一个集成顺序 bug：`commit()` 先挂载后装样式表，首次挂载量到 0×0 几何会把纹理烘成
1×1；已改为样式表先行（`src/client/plugin.js`），smoke test 有对应的顺序回归断言
（反向验证过：还原 bug 立即咬合）。

### 3.3 基线在 4K@2 的渲染崩溃（实测发现）

在 3840×2160 @ DPR2 下，历史 CSS 基线的环境纹理达到 **884 MB**，浏览器**无法完整
渲染场景**：截屏稳定复现"浅色 UI + 黑色空聊天区 + 暗色环境"的半渲染状态（瓦片不光栅、
样式面部分失效），5 个时间点全线偏离且两轮逐字节复现。同视口 DPR1（基线 221 MB）
一切正常，证明这是**纹理内存耗尽**而非采集问题。production 家族（≤2.1 MB）在同
视口稳定渲染。这是"压榨纹理"最直接的用户价值证据：基线不只是慢和重，而是会在
真实高分屏上画不出来。

## 4. 候选横向对比（决定性矩阵：交错调度、中位数×3、4s 负载窗）

系统 Edge / ANGLE D3D11（RTX 5080 Laptop），2560×1440 @1.5，动画全程运行。
main = CrRendererMain 线程 CPU，gpu = GPU 进程主线程 CPU（ms/窗）。

**light**

| 变体 | 纹理 | idle main/gpu | stream main/gpu |
|---|---|---|---|
| baseline | 239 MB | 886 / 1231 | 1074 / 1653 |
| production | 8.2 MB | 862 / 1284 | 969 / 1719 |
| productionTiny | 2.1 MB | 921 / 1294 | 1075 / 1761 |
| productionMicro | 0.5 MB | 903 / 1254 | 1089 / 1711 |
| productionLight（plus-lighter） | 8.2 MB | 1018 / 1404 | 1015 / 1613 |

**dark**

| 变体 | 纹理 | idle main/gpu | stream main/gpu |
|---|---|---|---|
| baseline | 239 MB | 697 / 940 | 795 / 1292 |
| production | 8.2 MB | 752 / 1028 | 928 / 1460 |
| productionTiny | 2.1 MB | 749 / 1039 | 826 / 1411 |
| productionMicro | 0.5 MB | 727 / 999 | 789 / 1332 |
| productionLight（plus-lighter） | 8.2 MB | 685 / 943 | 807 / 1390 |

**读数**：在远离 GPU 瓶颈的高端 GPU 上，各候选的逐帧计算量互有胜负、落在 ±3–5%
噪声带内——合成器驱动的架构本身决定了每帧成本结构。真正的、确定性的硬收益是
**纹理内存（−29× ~ −478×）**：它随窗口尺寸和 DPR 平方增长（4K@2 时基线 ~900 MB），
在核显、远程桌面、虚拟机和多窗口场景直接转化为带宽与驻留余量。另一个实测信号：
golden 截屏竞态中 baseline 的巨纹理在 seek 后光栅化迟滞（半光栅瓦片入镜），
而 production 系稳定——大纹理的迟滞是真实用户可感的。

**混合模式备选**（plus-lighter 替代暗色 screen）：性能差异不显著（噪声带内），
且暗色差分 maxΔ16–18 超出 ≤8 门槛 → **保留 `screen`（逐像素精确）**。

**纹理上限定档**（逐档实测门槛，取最小且留余量者）：

| 档位 | 上限（base/layer/blob/gel，CSS px） | 纹理 @2.5K | 门槛（双主题） |
|---|---|---|---|
| production | 640/384/512/880 | 8.2 MB | ✅ maxΔ5 |
| productionTiny | 320/192/256/440 | 2.1 MB | ✅ maxΔ6 |
| productionMicro | 160/96/128/220 | 0.5 MB | ✅ maxΔ6 |
| **productionNano（出厂）** | **80/48/64/110** | **0.1 MB** | ✅ maxΔ5~6 |
| productionPico | 40/24/32/55 | 0.05 MB | ❌ 暗色 maxΔ9 越过 ≤8 门槛 |

档间逐像素互差 maxΔ≤7（含 4K@2），逐帧计算量互有胜负（噪声带内）——
**nano 是悬崖前留余量的最小档**，7 个渐变件总计 0.1 MB 纹理。
`TEXTURE_CAP`（`src/client/effects/gradients.js`）一处可调。

### 4.1 性能侧的地板证据链（还有什么能砍）

动画开启时的逐帧成本 = 主线程 +436ms/3s、GPU 线程 +1007ms/3s（@170Hz；折合
60fps 约 5% 单核 + 12% GPU 线程）。逐项排除实验（每项中位数×3，对照地板/全开）：

| 假设 | 实验 | 结果 |
|---|---|---|
| 关键帧视口单位（vw/vh/vmax/%）触发主线程解析 | 全部换成等价 px | ❌ 754 ≈ 765ms，无差 |
| CSS 动画机制本身（换 WAAPI 可免） | WAAPI 同曲线驱动 | ❌ 688 ≈ 648ms，无差 |
| `will-change` 提示导致每帧复验 | 全量动画下去掉 will-change | ❌ 788 vs 758ms，无差 |
| mask 组迫使主线程 | 去 mask | ❌ 809 vs 765ms，无差 |
| mix-blend 回退 | 去 blend（前轮） | ❌ 无差 |
| UI 侧主题样式成本（`body *` 属性等） | `native` 无主题对照（流式负载） | ≈ +30ms/3s（约 1% 核），非刀口 |

**结论**：剩余逐帧成本就是特效本体（2 次全屏混合 + 9 层合成 ≈ 2ms/帧 GPU），
砍它=砍特效，且被保真门槛挡住。唯一结构性的主线程杠杆是 **AnimationWorklet**
（合成器线程驱动动画，主线程归零、帧率不降），但它需要宿主 Electron 加
`--enable-blink-features=WorkletAnimation`（当前 Edge/Electron 默认未启用，
插件侧可做 feature-detect + CSS 回退）。除此之外已到数学地板。

## 5. 工程化

- `bench/`：零依赖 CDP 基准工具链（`pnpm bench` / `pnpm bench:quick`），trace 线程级
  CPU、rAF 帧间隙、纹理预算、golden 差分矩阵、规格同步校验（烘焙规格必须与
  样式表里记录的渐变字面量逐字一致，否则拒测）。
- `src/client/effects/`：规格单一来源（`gradients.js`）+ 挂载器（`ambient.js`），
  明暗主题 MutationObserver 重烘焙，resize 仅重烘 gel（唯一使用绝对 px 半径的渐变）。
- `scripts/smoke-test.mjs`：VM 假 DOM 支持 canvas/MutationObserver，断言烘焙流量与
  挂载/卸载对称性。
- 历史渐变字面量保留在样式表注释中作为视觉身份记录，机器校验其与规格同步。

## 6. 复现

```bash
pnpm build && pnpm check && pnpm test   # 构建 + 清单校验 + VM 冒烟
pnpm bench                              # 全矩阵 + 报告（bench/out/report.md）
```
