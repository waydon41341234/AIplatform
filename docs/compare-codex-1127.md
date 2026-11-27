# 设计稿对比：原稿 · 设计稿1127（Codex）· 原型 v67

> 2026-11-27 · 只读比对：没有改动任何 Figma 文件和代码 · 对应 Waydon 19:54 选的「先列差异再决定」

**简称与标记**

- **原** = 原稿 `KEDg6ZjNHLCa2RmMn1veKH`（Claude 编辑到 11-27 约 16:45）
- **新** = 设计稿1127 `FikSmkYSPbP30PrjagWyYl`（Waydon 复制原稿后由 Codex 在 11-26/27 编辑；里面还有 Waydon 贴入的参考页和 Claude 晚上做的自定义模版页）
- **v67** = HTML 原型 git `d08b3df`（分支 `claude/project-thread-wjzojz`），单文件 `$P` = `/tmp/claude-0/-home-user/61df5c60-864a-5542-9d38-8855734728dc/scratchpad/pub/prototype/dist/prototype-single.html`
- 复制文件会保留节点 id，同一个 id 在两边是同一个东西。链接文字带「原 / 新」的，表示只在那一边有，或者特指那一边。没有前缀的是两边共有的节点，链接指向新稿；把 fileKey 换成原稿的，就能打开原稿里的同一个节点。
- 截图根目录 `$S` = `/tmp/claude-0/-home-user/61df5c60-864a-5542-9d38-8855734728dc/scratchpad/cmp1127/`（临时目录，会话结束可能被清掉）
- **需决定** = 等 Waydon 拍板；**部分成立** = 复核后只成立一部分，后面附复核说明；**未复核** = 没经过复核，只有比对员的证据

---

## 1. 结论摘要

1. **时间线**：新稿是 11-27 约 09:20（UTC+8）从原稿复制的。原稿 id 前缀 ≤432 的节点新稿都有，434–479 都没有。之后 Claude 的 11-27 改动只在原稿里，v67 与原稿一致。
2. **原稿较新的部分**：01/02/03 和 04 各页上的 11-27 决定：方案 A 色值胶囊、默认色块、PC 锁定（约 808 处顶栏）、AI 默认头像、公告栏、槽位素材库、AI 模版选中面板，以及 v67 用的 21 套模版原图。
3. **新稿较新的部分**：Codex 的 6 个审稿页，加上整页重做的「04-AI 模版」21 套。Codex 在已有帧上只改了少数几处：约 50 帧颜色行换成 G6A、fresh 改名「巴西绿」、03 加余额框颜色行；另外删了 05、09 两页。新稿里还有 Waydon 贴入的「多皮肤」参考页和 Claude 晚上做的「自定义模版」3 页（明天 11-28 汇报用），这两类都不是 Codex 做的。
4. **Codex 在已有帧上的改动大多要退回**：G6A 的胶囊显示 Key 名、不显示 HEX，违反 Waydon 09:30 选的方案 A；复制图标还是 SF Symbols 字符。
5. **建议的母版**：以后只在新稿上改（**需决定**）。新资料都在新稿里；原稿的实例级改动在新稿上可以用脚本按相同 id 回放。原稿冻结为只读，作为移植来源。
6. **移植方向**：原稿 → 新稿：02/03 的新组件、04 各页的新帧、99 条文案变量、模版原图归档页。新稿内部：G6A 换回 G6、还原 317:55871、风格缩略图重新绑变量。
7. **待 Waydon 决定 4 件**：母版文件、AI 一键设计进入时是否先显示模版、21 套模版用哪一版（含巴西绿）、Codex 的新交互（取色器切 Key、卡片 6 样式、单卡换图）要不要。
8. **顺序**：先改 Figma，再改 HTML。Codex 的源码在 Waydon 的 Windows 电脑上，这次没拿到，之后还要和 v67 的代码对一遍。

---

## 2. 页面结构差异

| 页面 | 原 顶层数 | 新 顶层数 | 变化 |
|---|---|---|---|
| 00 封面与说明 | 0 | 0 | 两边都是空页，交付需要的封面 / 清单页还没做 |
| 01 设计规范 Foundations | 2 | 2 | 完全相同（含填充、描边、圆角、变量绑定）。两边都没记录 11-27 新加的 token |
| 02 切图母组件 | 9 | 8 | 新稿缺 AI 头像 a1–a8 [原 434:446127](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=434-446127)、copy 图标、user-1x1 的 a1 头像。新稿 7 个风格缩略图底色解除了变量绑定；slice/ai-style 位置不同 |
| 03 组件 | 204 | 200 | 184 个完全相同。新稿缺 4 个新组件。有差异的 15 个里，11 个是原稿的 11-27 改动，4 个是 Codex 改的 |
| 04 页面 | 163 | 163 | 只有头像组件不同（原稿较新），Codex 没改 |
| 04-2 编辑器 · 基础与多语言 | 136 | 136 | Codex 把 4 帧 Banner 颜色行换成 G6A；原稿多 PC 锁、取色器复制按钮、头像 |
| 04-3 换色 / 加载 / 顶部栏 | 179 | 178 | 原稿多「PC 切换锁定」段 [原 434:448257](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=434-448257)；Codex 把 4 帧（隐藏页签）换成 G6A |
| 04-4 工作台 · 补充状态 | 171 | 171 | 只有原稿的 PC 锁和头像 |
| 04-5 编辑器 · 模块编辑 | 88 | 87 | Codex 重做游戏菜单 / 游戏卡片布局 4 帧，16 帧颜色行换 G6A；原稿多公告栏段 [原 440:635497](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=440-635497) |
| 04-6 外壳 · 创作框 · 首页补齐 | 164 | 164 | 只有头像 |
| 04-7 新页面 | 169 | 158 | 原稿多 11 个 AI 头像流程节点（435:127470–435:129770） |
| 04-8 第五轮 ED-01~05 | 317 | 295 | 原稿多 22 个槽位素材库节点（434:*）；Codex 改 10 帧颜色引用 + 12 帧余额框颜色 |
| 04-9 第五轮 ED-06~17 | 195 | 187 | Codex 删了 8 个「已废弃」的导出连接帧；其余只差 PC 锁 |
| 04-10 AI 首页设计 | 246 | 233 | 原稿多 13 帧 440:*（模版选中、Toast 撤销、面板全长），8 帧多了模版块 / 提示词块；Codex 改「巴西绿」8 帧 |
| 04-11 未登录与登录 | 114 | 114 | 只有头像 |
| 04-AI 统一生成 | 5 | 5 | 原稿 G3 改成「消息 · 已读/未读」，新稿还是「信箱 · 未登录/已登录」 |
| 04-下午改动 11-26 | 6 | 7 | 原稿文字样式卡用 TxColorRow + HexChip；Codex 用 Key 药丸，并新增余额框段 [新 65731:539120](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65731-539120) |
| 04-AI 模版 11-27 | 7 | 139 | Codex 整页重做，原稿 105 个子帧在新稿里一个都没有 |
| 05 原型 Prototype | 0 | — | 空页，没有 flow。新稿删了，没有损失 |
| 09 AI 图标草稿 | 38 | — | 新稿删了，Codex 改用 H2 页的图源区 [新 65716:673530](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65716-673530) |
| Codex 新页 ×6 | — | 14 / 73 / 13 / 3 / 3 / 90 | [颜色方案 A 65661:2](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65661-2)、[公告栏 65689:369835](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-369835)、[PC 锁定与头像 65689:659752](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-659752)、[Banner AI 候选尺寸 65689:738396](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-738396)、[真实素材库 65716:673529](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65716-673529)、[游戏菜单与方卡 65736:54128](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65736-54128) |
| 多皮肤 | — | 8 | [新 65730:22709](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65730-22709)：公司真实皮肤（巴西绿 3 款、卡片样式 10 款、定制版式 A–D），推断是 Waydon 贴入的。只作参考，不要改 |
| 自定义模版 01/02/03 | — | 未统计 | [01 65826:371840](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65826-371840) / [02 65826:344233](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65826-344233) / [03 65826:446678](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65826-446678)：Claude 11-27 晚按 Waydon 12:06 的要求做的（11-28 汇报），连同变量集合 09、10。不是 Codex 做的 |

---

## 3. 只在原稿里、新稿缺少的内容（必须移植）

**切图与组件（02 / 03）**

| 内容 | 原稿节点 | 说明 |
|---|---|---|
| AI 默认头像切图 a1–a8 + 原图 | [原 434:446127](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=434-446127) | 128×128，有 PNG@2x 导出。新稿只有页面上的矩形 |
| copy 图标切图 | 格子 [原 459:13](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=459-13)（slice/icon/copy 459:14） | 色值胶囊里的 ⧉ |
| user-1x1 默认头像改为 a1（渐变留作兜底） | 6:43 内 [原 434:449515](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=434-449515) | 会带到 InspirationCard 13:164、AccountMenu 227:89082 和所有顶栏 |
| AvatarOption / AvatarPicker / AvatarEditable | [原 434:461487](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=434-461487) / [原 434:461671](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=434-461671) / [原 435:104589](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=435-104589) | 更换头像：电脑弹窗、手机底部面板 |
| AD/TplCard | [原 439:292929](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=439-292929) | 模版卡：默认、选中、加载骨架、失败重试，各有桌面 / 手机。去留随决策 2 |
| AD/AiDesignPanel State=模版选中 | [原 439:292933](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=439-292933) / [原 439:293052](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=439-293052)；输入态 440:36442 / 440:36489 | 去留随决策 2 |
| IconSegOption State=Locked | [原 434:441758](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=434-441758) | v67 `css/editor.css:13` 引用这个 id |
| AssetLibraryDialog 10 个槽位变体 | [原 434:446283](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=434-446283) 起 | 11-26 已生成的素材，带分类筛选 |
| G6/HexChip、RainbowSwatch、TxColorRow、预览、说明 | [原 460:31190](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=460-31190)、[原 462:31118](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=462-31118)、[原 463:31176](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=463-31176)、465:31476、467:335704 | 方案 A，位于段 392:173615 |
| G6/ColorRow、G6/TxSwatch 新样式 | [原 424:548184](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=424-548184)、392:174056 | 默认色块排第一并选中，蓝圈统一 |
| ColorPicker 复制按钮（44 个变体） | 141:1372 内 464:33597 等 | 取色器 hex 框旁的 ⧉ |
| KeyRow：色值胶囊 + Key 标签（12 个变体） | 229:115018 内 464:31140 等 | 新稿只有 Key 标签 |
| 删掉 ColorDefaultBtn | 新稿仍有 [新 424:548144](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=424-548144) | 这是 09:18 前的残留，不要并回 |

**04 各页的帧**

| 内容 | 原稿节点 | 说明 |
|---|---|---|
| 04-3「PC 切换锁定 · 暂未开放」段 | [原 434:448257](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=434-448257) | 夜 / 日两帧 + 说明卡，4 语 toast，168 条连线 |
| 04-5 公告栏 11-27 段 + NT-05 颜色页签 | [原 440:635497](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=440-635497)、[原 452:37647](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=452-37647) / 452:38662 | NT-01..04、NT-M01/M02（夜 / 日）、组件条、前端说明 |
| 04-7 AI 默认头像流程 | [原 435:127470](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=435-127470)（标签）… 435:129770 | 我的页悬停、换头像（选 a5）、已更新，桌面 / 手机 × 夜 / 日 |
| 04-8 槽位素材库 | [原 434:451565](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=434-451565) 等 22 个节点 | Banner 大 / 小、Logo、图标、其它槽位，桌面 / 手机 × 夜 / 日 |
| 04-10 模版选中 / Toast 撤销 / 面板全长 | [原 440:334066](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=440-334066) 等 13 帧；模版块在 [267:250053](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=267-250053) 等 4 帧，提示词块在 [267:252842](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=267-252842) 等 4 帧 | 去留随决策 2 |
| 04-AI 统一生成：信箱 → 消息（已读 / 未读） | G3 [384:124958](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=384-124958) 内 11 帧夜间 + 日间、说明 384:124960；G1 说明 384:23314 多一句 Banner 候选说明 | 只改文字，可以用脚本回放 |
| 04-下午改动：文字样式卡 | [398:17934](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=398-17934)、398:18976、399:19406、399:19529 | TxColorRow + HexChip |
| 所有桌面编辑器顶栏的 PC Locked | 约 808 处：04-2 60、04-3 79、04-4 27、04-5 74、04-8 164、04-9 75 …… | 换实例状态，可以用脚本按 id 回放 |
| ColorPicker 复制、KeyRow 胶囊、头像的实例 | 04、04-2 … 04-11 | 组件到位后自动更新 |
| 04-AI 模版原稿：21 个 TPL、21 个说明、21 个素材槽、42 张原图（含 478:2–478:13） | [原 430:619174](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=430-619174) | v67 素材和 manifest 的来源，建议复制成归档页 |
| 09 AI 图标草稿（37 张草稿 + 素材库入库 434:26471） | [原 340:2](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=340-2) | `docs/ai-prompts.md` 第 8 行、第 260–335 行引用了它 |

**变量**

| 内容 | 位置 | 说明 |
|---|---|---|
| 99 条文案（ed/lib-*、ad/tpl-*、mp/nt-*、ad/st-*-s、ad/e-cost） | 06 文案 | 素材库、模版卡、公告栏、风格副标题、费用 |
| 9 条 AD 文案的繁 / 英 / 越翻译 | ad/st-premium、ad/st-*-d、ad/p-balance 等 | 新稿 4 种语言都还是中文 |
| color/border/swatch-edge | `VariableID:459:12`（01 平台界面） | 色块内描边：夜白 18%、日黑 12% |
| 删掉 ed/keys-show-key | 新稿仍有 `VariableID:241:39` | 「显示 Key 名」开关 08:59 已删 |

---

## 4. 新稿新增的内容

**Codex 做的**

| 内容 | 新稿节点 | 建议 |
|---|---|---|
| G6A 颜色组件 8 套（HexValue、ColorRow、KeyRow、KeyListPanel、ColorPicker、ColorPanel、ColorRowMobile、KeyRowMobile） | [新 65662:21](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65662-21) … 65677:1210（页 65661:2） | 不采用，换回 03 的 G6。见 §6 #1、#2 |
| 取色器切 Key 流程（14 帧） | [新 65781:55708](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65781-55708) | 随决策 4 |
| 公告栏交互审核（72 帧，222 条连线） | [新 65689:369835](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-369835) | 把已读 / 未读预览、富文本改色与撤销状态并入 04-5 公告栏段；改正气泡和字号 |
| PC 锁定与账号头像（13 帧） | [新 65689:659752](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-659752) | 手机帧 [新 65689:737546](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-737546) / [新 65689:737796](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-737796) 并入 04-3；头像用原稿组件 |
| Banner AI 候选尺寸不符 → 裁切 / 留边（42 帧） | [新 65692:2613](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65692-2613)、65692:2614 | v67 没有。可以采用，并统一用一个裁切对话框 |
| 真实素材库审核（44 帧）+ 183 件图源 | [新 65716:673715](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65716-673715)、65716:673716、[新 65716:673530](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65716-673530) | 多出的状态并入 04-8；图源区保留，替代 09 页 |
| 游戏菜单与方卡审稿（90 帧：6 种卡片样式、单卡换图 44 帧） | [新 65736:54128](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65736-54128)、[新 65750:29505](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65750-29505)、[新 65779:34483](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65779-34483) | 随决策 4 |
| 04-AI 模版整页重做：21 套 H5、42 张 AI 原图、一键设计桌面 / 手机流程、126 个详情面板、84 个已应用 / 已撤销帧 | [新 65736:140301](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65736-140301)（platinum-1）等；流程起点 [新 65750:36829](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65750-36829) | 随决策 2、3 |
| 03 余额框颜色行 ×3（金额 accent_3、描边 border、底色 bg_2、图标 primary） | 65731:537911 / 538034 / 538157（在 TopbarContentList 307:16634） | 内容采用（与 v67 一致），用 G6 重建 |
| 04-下午改动「余额框 · 五种模式刷新图标」段 | [新 65731:539120](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65731-539120) | 刷新图标默认色继续跟 primary，见 §6 #24 |
| 变量集合：AI 首页模版 / 色彩（420）、一键设计 · 套件交互（74 个 BOOLEAN）、游戏菜单审稿 · 当前分类（24 个 BOOLEAN） | 65736:140281 / 65736:172612 / 65736:137438 | 色彩改成 21 个模式；BOOLEAN 并入 07 原型状态 |
| color/game-card/preview-selected | `VariableID:65778:79970` | 和 brand/subtle 重复，建议改成别名（未复核） |
| 171 条文案（ai-template/*、game-card/*、mp/game-menu-*、filter/*，4 语齐全）+ 07 原型状态 10 个 | 06 文案 / 07 | 跟随功能决定保留 |
| 已有帧上的改动 | 巴西绿（8 帧 + [260:11634](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=260-11634) + 文案 260:9557/9558）；7 个风格缩略图解绑；约 50 帧颜色行换成 G6A；04-5 布局 4 帧；317:55871；删 04-9 的 8 帧；删 05 / 09 页 | 见 §5、§6 |

**不是 Codex 做的（保持不动）**

| 内容 | 新稿节点 | 说明 |
|---|---|---|
| 多皮肤（公司皮肤参考） | [新 65730:22709](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65730-22709) | 巴西绿 [新 65757:437033](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65757-437033)、卡片样式 [新 65747:55010](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65747-55010)、定制版式 [新 65819:195487](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65819-195487)。是 Codex「巴西绿」和 6 种卡片样式的来源 |
| 自定义模版 01 线框组件 / 02 编辑器 / 03 AI 生成流程 + 集合 09 线框、10 自定义模版风格 | [新 65826:371840](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65826-371840) / [新 65826:344233](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65826-344233) / [新 65826:446678](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65826-446678) | Claude 11-27 晚做的，11-28 汇报要用 |

---

## 5. 移动 / 改名

- **没有节点跨页移动**：原稿独有的 id 在新稿里都查不到，所以都算新增或删除。
- 04-AI 模版里 techblue / fresh / festive / neon / minimal 五段被删掉后，用同名重建（65736:26603 / 26610 / 26617 / 26624 / 26631）。platinum、blackgold 两段 id 没变，但里面的内容全换了。
- 21 套模版全部改名，例如 香槟晨光 → 白金 · 棋牌、锦鲤鸿运 → 红金 · 彩票（红底）。
- fresh 的显示名从「清新明亮」改成「巴西绿」，模板 id 保持 fresh；08 AI 风格预设里的模式名仍叫「fresh 清新明亮」。
- 09 页的原图改到 H2 图源区 [新 65716:673530](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65716-673530)，内容搬过去了，但节点 id 都是新的。
- [231:135489](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=231-135489) slice/ai-style 只改了位置：(0,3400) → (2400,2600)。
- [317:55871](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=317-55871) 改名为「H5/气泡/功能」，主组件也换了（详见 §6 #26）。

---

## 6. 冲突：原稿 / v67 与 Codex 不一致

| # | 主题 | 原稿 / v67 | Codex（新稿） | 建议 |
|---|---|---|---|---|
| 1 | 色值胶囊（方案 A） | 「● #HEX ⧉」始终显示当前生效的 HEX，点一下复制；Key 标签在下面。v67 相同 | G6A/HexValue：绑定时显示 Key 名，只有自定义色才显示 HEX；复制图标是 SF Symbols「􀈷」，看起来像文件；没有「已复制」状态 | 用原稿。Waydon 09:20 说过「看不出也复制不了 hex」，09:30 选了方案 A |
| 2 | 颜色行的色块 | 默认 Key 色块排第一并选中（蓝圈），后面 4 个推荐色和彩虹钮。v67 相同 | 桌面只有默认色块 + 彩虹；手机是默认 + 4 + 彩虹，分两行；「已选色」状态哪个色块都没有蓝圈 | 用原稿，桌面和手机用同一套 |
| 3 | 「默认」按钮、「显示 Key 名」开关 | 已删（09:18、08:59） | 新稿仍有 [新 424:548144](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=424-548144) 和 ed/keys-show-key。这是复制时的旧内容，不是 Codex 的选择 | 用原稿 |
| 4 | 余额框颜色行 | 原稿 03 只有一句过时说明「金额文字跟随主色 primary」；v67 有 4 行：accent_3 / border / bg_2 / primary | 同样 4 行、同样的 Key，但用的是 G6A；04-8 里还被裁切看不全 | 内容用 Codex 的，用 G6 重建，面板改成可滚动，删掉原稿那句说明 |
| 5 | **需决定** AI 一键设计：进入时是否显示成品 | 选了风格就显示「{风格} · 3 套模版 · 套用免费」，可以预览、应用；付费「生成 3 套 ✦50」是另一回事（Waydon 08:59） | 交接 §3：进入不显示成品，风格区用骨架屏，流程是 生成 → 确认 50 点 → 3 套结果；并写明「进入即展示免费成品」已被后来的反馈取消。但新稿原型起点 [新 65750:36829](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65750-36829) 仍连到「已停用」的免费模版入口 [新 65736:182903](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65736-182903) | 建议按 Codex：交接写明是后来的反馈，也能解决「付费结果 = 免费模版」的矛盾。确认后先改 Figma |
| 6 | 提示词块（复制 / 改写后生成 / 展开） | 原稿 + v67 都有 | 已删，只保留设置区的提示词输入框 | 随 #5。建议只留一个「改写后生成」小链接，点了填进补充描述 |
| 7 | **需决定** 21 套模版 | 原稿 21 套：各有名字（香槟晨光…）、AI Logo、3 张宣传 Banner、布局各不相同，含彩金池 / 页脚。v67 用的就是这套 | 整页重做：名称「风格 · 游戏类型」，统一用 GAMING Logo，每套 1 张游戏类型 Banner，真实 7 模块结构，左栏按钮 150×70；所有配色都换了 | 建议用 Codex 的 21 套：结构符合 11-26「改成真实结构」。每套名称保持独立好记；先修好 §8 列的对比度、提示词、切图问题，再替换 v67 素材 |
| 8 | **需决定** fresh 改成「巴西绿」 | 清新明亮「白底绿青 · 大圆角」，3 套浅色 | 巴西绿「荷叶绿 · 黑金 · Rolex绿」，3 套深色，取自多皮肤 1-1-101/102/103；08 模式名没改 | 随 #7。如果用巴西绿：去掉 Rolex，副标题一行写完，补 4 语，缩略图和 08 模式名同步改；缩略图底色继续绑 sp/bg |
| 9 | festive 套件的深浅 | festive-1、2 浅色，festive-3 深色 | festive-2 改成红底深色（节日代表），festive-3 改成浅色 | 随 #7，同步改风格卡缩略图和提示词 |
| 10 | 左栏游戏分类按钮 | v67：76×35、圆角 6、选中用渐变、所有模版都带蓝色投影 rgba(114,159,255,.15)、未选中无描边 | 150×70（750 稿）、圆角 35/8/35、未选中 bg_2 + 1px 内描边、选中 primary 纯色、无投影 | 用 Codex，改 v67 |
| 11 | 底部导航「注册」的选中图 | v67 选中时显示存款钱包；bn-reg.webp 有但没用上（遗留问题） | 注册、注册-off 是两个独立组件 | 用 Codex |
| 12 | 套用模版时保留业主上传的素材 | v67 会覆盖上传的 Banner 和图标，还会改 Banner 尺寸、列数、圆角；选模版时只提示「会替换 Banner 和入口图标（共 22 张），可撤销」 | 加「同时替换已上传素材」开关，默认关；交接说冲突时应用前提示，但新稿里没画这个提示 | 用 Codex（交接 §4）。先在 Figma 画冲突提示 |
| 13 | 模版颜色变量 | 原稿没有专门的集合；v67 套用时写进 68 Key | 「AI 首页模版 / 色彩」：420 个变量，只有 1 个模式，没有别名 | 改成 1 个集合 21 个模式，用 68 Key 的名字，没给的 Key 别名到默认值 |
| 14 | **需决定** 从模块行打开取色器能否切 Key | 原稿 / v67：行内取色器的标题固定，不能切 Key，只改这一行 | 交接 §7 + [新 65781:55708](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65781-55708)：可以切 Key，应用后这一行改为跟随该 Key；改 HEX 会改写这个 Key，全页生效；行名变成「主色」 | 建议保持只改这一行。如果要能切 Key：行名不变，加「跟随 primary」标签，应用前让用户选「只改这一行 / 改全部（N 处）」 |
| 15 | **需决定** 游戏菜单 / 游戏卡片布局 | v67：分类样式 竖排 / 横向标签 / 图标分类；竖排时 2/3 列（提示「最多 3 列」），其它 2/3/4 列；圆角 0/20/32，间距 12/20/32 | 6 种卡片样式；菜单位置 左侧 / 中部；非横版每行 3/4 张（没有 2），选 4 自动改成中部菜单；横版 2/3；两个模块合成一个面板；经典卡片 180×180 | 6 种样式等 Waydon 确认。菜单在左侧时禁用「每行 4 张」并写明原因，不要悄悄改菜单；保留 2 列和图标分类；圆角 / 间距档位统一成一套；经典卡片尺寸确认是 130/260 还是 180 |
| 16 | **需决定** 单张游戏卡换图 | v67：封面来自游戏平台，只有兜底图和收藏星能换 | 每张卡可以上传或用 AI（每轮 10 点、3 张候选）→ 裁切 / 留边 → 应用，可撤销 | 先定封面能不能由业主替换。如果能：AI 走统一 AI 面板（4 张候选、✦10），裁切用 v67 的对话框 |
| 17 | PC 锁定 | 组件状态 Locked，所有顶栏都用；04-3 有说明段；v67 桌面和手机「页面」面板都锁 | 只在 4 个单独帧上锁，其余新帧 PC 都能点；桌面 toast 盖住了 H5 顶栏 | 用原稿的组件级锁，再把 Codex 的手机帧并入 04-3 补齐手机版（v67 手机已经有锁定的 PC 选项） |
| 18 | 账号头像 | 02 有切图组件、03 有选择器；顶栏默认 a1 | 头像是页面上的矩形，不是组件，也没有导出设置；顶栏还是蓝色渐变圆 | 用原稿 |
| 19 | 公告栏 | 原稿 NT-01..05 + 手机 M01/M02，与 v67 一致 | 72 帧审稿：多了已读 / 未读预览开关、富文本改色与撤销；但未登录时也显示 99 气泡，字号写成「14 px」，正文有单独的撤销 | 以原稿为底，并入 Codex 的已读 / 未读和改色撤销状态。字号用 750 单位，气泡只在已登录时显示，撤销用全局那一套 |
| 20 | 槽位素材库 | 原稿 04-8 20 帧（夜 / 日），按槽位只列合适的图；v67 一致 | H2 页 44 帧（只有夜间），多了图标选中 / 置灰、裁切留边、已采用、撤销；Banner 槽位默认就列出尺寸不符的图 | 以原稿帧为底，补上 Codex 多出的状态。默认显示「适合此槽位」，尺寸不符的放到「全部」里并标「可调整」 |
| 21 | 裁切 / 留边对话框 | v67：自由拖动裁切 + 留边颜色 bg_1 / bg_2 / primary | Banner 只能选 上移 / 居中 / 下移 3 档；单卡可以自由拖动，但留边颜色固定 | 全部用 v67 那一个对话框 |
| 22 | 导出「连接 Figma」步骤 | 原稿 04-9 还留着 8 个「已废弃」帧；v67 代码里有这一步但走不到 | 删掉了 | 接受删除，补上 ED-16 行留下的空位；以后删掉 v67 的这段死代码 |
| 23 | 09 AI 图标草稿页 | 原稿留着 11-26 的原始生成图 | 删了，图源整理到 [新 65716:673530](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65716-673530)（含 6 张无字原图，id 是新的） | 图没丢，但 `docs/ai-prompts.md` 里指向 340:2 的链接要改，或者把这页复制过去当归档 |
| 24 | 余额框刷新图标的默认色 | v67 跟随 primary | 画了「默认紫色」和「与底色同为 bg_2」两种 | 保持 primary；如果要紫色，就加一个 Key，不要写死颜色 |
| 25 | 公告栏消息入口文案 | 消息，已读 / 未读（Waydon 09:08） | 新稿 G3 还是「信箱、未登录 / 已登录」（复制时的旧稿） | 用原稿 |
| 26 | Waydon 原稿里的隐藏气泡 | 317:55871 → 气泡 / 状态=样式1（317:53137） | 改名「H5/气泡/功能」，换成 317:51361（中部边缘 max 58） | 还原（规则：不改 Waydon 原稿 317:55525），除非是 Waydon 自己改的 |
| 27 | 组件放在哪里 | 全部在 03 | G6A 8 套放在审稿页 65661:2 | G6A 并入 03 或归档。**部分成立**：「多皮肤」页上的 16 个组件是 Waydon 贴的公司素材，不能当成 Codex 的东西去合并或删除 |

---

## 7. 原型 v67 与 Figma 的差距

**Figma 落后于 v67（两个文件都是）**

| 主题 | Figma | v67 | 处理 |
|---|---|---|---|
| 编辑器底稿 | 04-2 … 04-9 还是第五轮的「星河体育」：彩金池 / 中部导航 / 页脚 / 菜单栏 / 侧边栏，4 个版式都没标「暂未开放」，例如 [126:23568](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=126-23568)、[227:89423](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=227-89423) | 经典蓝白 7 模块、添加模块、AI 一键设计卡、页面设置（模板卡、品牌配色、首页背景）、检查 | Figma 加一行经典蓝白基线（桌面 / 手机 × 夜 / 日），旧帧加「历史稿」标记 |
| 03 顶部栏内容面板 | [307:16634](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=307-16634) 还是 11-26 的布局 | 功能排列、余额框 5 种模式、名称行、图标上传、颜色行、文字样式 | 按 v67 重做，颜色行用 G6 |
| Banner 颜色行 | 「Banner 占位底 / 指示器（选中）/ 指示器（未选中）」，没有重置 | 「图片加载前的底色 / 指示器 · 当前 / 指示器 · 其它」+「当前已是默认颜色」 | 定一种说法，4 语同步 |
| 游戏菜单颜色行 | 菜单底板、分类文字、选中分类、选中分类文字（[215:74268](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=215-74268)） | 按钮底图（第一个是「按钮图」）、按钮投影、分类文字 未选中 / 选中 | 补 Figma |
| 选中模块工具栏方向 | 原稿 G1–G4、NT-01 和新稿全部是横向、在模块上方 | 竖向、在模块右侧 | `docs/remaining-work.md:38` 写的是「横向选中工具栏未做」，所以以 Figma 横向为准，改 v67。**部分成立**：没有记录显示 Waydon 选过竖向 |
| 自定义圆角 / 间距、布局重置 | 只有 3 档 | 有自定义 px 输入和「当前已是默认布局」 | 补 Figma |
| 模板页 | [297:78311](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=297-78311) 等：经典蓝 · 九宫格、白金 · 简约都能用，「9 个模块」 | 只开放经典蓝白（7 个模块），白金显示暂未开放 | 改 Figma |
| 创作框页签 | 3 个页签，占位「搜索模板、项目」 | 4 个页签（加了首页设计）、「搜索模板、项目、对话」、DEMO 角标 | 改 Figma |
| 手机编辑器导航栏 | [132:25830](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=132-25830)：返回、标题、已自动保存、检查、导出 | 多了撤销 / 重做 / 重置 / DEMO，375 宽时标题被截成「星河…」 | 先在 Figma 设计（收进 ⋯ 菜单） |
| 检查拦住导出、PC 锁定后的导出文件列表 | 没画 | 有 | 补 Figma |
| v67 已做但没画的 AI 状态 | 没画 | 余额不足、全部失败不扣点、部分失败免费重试、生成中取消、模版图加载失败 | 补 Figma |
| 01 规范 | 没有 swatch-edge、preview-selected 和 06–10 集合；--fill-3-solid 没有对应变量 | 用了 --sw-edge、--fill-3-solid | 更新 01 的夜 / 日两张板 |
| 00 封面 / 清单 | 两边都是空的 | 导出对话框预览的源文件结构从「00 封面 / 清单」开始 | 做 00 清单页 |

**v67 落后于 Figma / Codex**

| 主题 | Figma / Codex | v67 | 处理 |
|---|---|---|---|
| 生成中 / 生成完后面板自动滚到顶 | 交接 §3 要求 | 不滚，进度和结果在屏幕外（§8 高 #18） | 改 aidesign.js |
| 左栏分类按钮规格 | 新稿 21 套都是 150×70 | 76×35、渐变、带蓝色投影 | 随 §6 #10 |
| 注册选中图 | 新稿有 | 显示存款钱包 | 加 imgOutOn |
| 「同时替换已上传素材」开关 + 冲突提示 | 新稿有开关（提示没画） | 没有 | 先画提示，再改代码 |
| 6 种卡片样式、单卡换图 | [新 65736:54128](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65736-54128) | 没有 | 随决策 4 |
| Banner AI 候选尺寸不符时裁切 / 留边 | [新 65689:738396](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-738396) | 没有（AI 候选总是目标尺寸） | 风险低，可复用 openResize |
| 公告栏「预览状态 已读 / 未读」 | [新 65689:734555](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-734555) | 没有 | 随 §6 #19 |
| 每套替换 13 个游戏分类图标 + 公告图标 | 新稿每套 31 张 | 只换 9 类，不换公告图标 | 随决策 3 |
| 主题化搜索图标 | 新稿有 | 顶栏没有底色的 4 套仍用经典蓝色搜索图 | 随决策 3 |
| 新稿 21 套的配色和素材 | 新稿 | 仍用原稿的数据和图 | 随决策 3。Codex 的素材文件在 Windows 上，或者从 Figma 导出 651 个组件（要先加导出设置） |

---

## 8. 不合理的设计 / 交互与修改建议

### 高

| # | 位置 | 问题 | 修改 |
|---|---|---|---|
| 1 | 新稿 02 / 03 | 落后于 11-27 的决定：缺头像切图和组件、copy 图标、PC Locked、HexChip / TxColorRow、KeyRow 胶囊、素材库槽位、TplCard / 模版选中；还留着「默认」按钮和 ed/keys-show-key | 按 §9 第 3–5 步移植原稿组件 |
| 2 | G6A/HexValue [新 65662:21](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65662-21)、ColorRow [新 65665:59](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65665-59)；实例在 04-2 [新 129:945](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=129-945)、133:2425、135:40903、135:41489，04-5 [新 215:71720](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=215-71720) 等 16 帧，04-8 [新 283:409771](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=283-409771) 等 22 帧 | 绑定时胶囊显示 Key 名（ddt_bg、text_primary），看不到 HEX，也不清楚复制的是 Key 还是 HEX。违反 09:30 的方案 A。截图 `$S/pages-a/shots/NEW_129-945_banner-color-desktop.png` | 胶囊始终显示「● #RRGGBB ⧉」（透明色显示 %），复制 HEX；Key 放在下面的标签里 |
| 3 | [新 65665:59](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65665-59)（桌面）vs [新 65676:1096](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65676-1096)（手机） | 桌面去掉了 4 个推荐色，手机还留着；「已选色」状态没有任何色块带蓝圈；默认色块显示黑色，胶囊上的点却是 neutral_2 灰色（同一个变量渲染出两种颜色）。截图 `$S/base/shots/NEW_65665-59_G6A-ColorRow.png` | 两端都用：默认色块排第一 + 4 个推荐 + 彩虹，选中的那个加蓝圈；默认色块绑定到它的 Key |
| 4 | G6A 各组件（例如 [新 65662:21](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65662-21)、65670:532、65671:2147），文字节点「􀈷」，字体 SF Pro | 复制图标是 SF Symbols 的私有字符，Windows 和网页会显示成方块；SF Symbols 不允许在网页使用，规则要求用 Phosphor 切图组件 | 换成 slice/icon/copy（Phosphor Copy）实例；HEX 用 Roboto Mono |
| 5 | 新稿 [新 135:40903](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=135-40903)、[新 135:41489](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=135-41489)（手机 Banner 颜色） | 换成 G6A 手机行后每行 112 高，面板底部到 y=890，超出 812 屏：第 3 行被裁掉，底部工具栏（页面 / 模块 / 配色 / 预览）被挡住。截图 `$S/pages-a/shots/NEW_135-40903_banner-color-mobile.png` | 换回 G6 单行；如果坚持 44px 点击区，面板设最大高度并在里面滚动，色块保持一行 |
| 6 | 新稿 [新 308:89170](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=308-89170)，面板 308:89227（及另外 11 帧） | 内容 931.5 高，放在 836 高、裁切内容、不能滚动的面板里：「描边」行被切掉一半，「底色」「刷新 / 切换图标」和两条说明完全看不到。截图 `$S/pages-c/shots/NEW_308-89170_topbar-loggedin-panel.png` | 面板改成纵向滚动，或者按 v67 把这 4 行放到帐户栏的颜色页签；补一帧滚动后的状态 |
| 7 | 新稿 [新 215:83559](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=215-83559)、[新 215:84813](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=215-84813)（日间布局） | 新加的选项行绑的是夜间变量：未选中文字 #EBEBF5 60% 叠在白色面板上，对比度约 1.3:1，「中部菜单」「竖向」「每行 4 张」几乎看不见。截图 `$S/pages-b/figma/new_215-84813_gamecards_layout_light.png` | 改绑日间 token（文字 #3C3C43 60%，选中 #007AFF / 12%） |
| 8 | 新稿页 [新 65661:2](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65661-2) | 8 套 G6A 组件和 03 的 KeyRow、KeyListPanel、ColorPicker、G6/ColorRow 重复，而且 TopbarContentList 已经在用 G6A | 有用的变体并进 03 的组件，实例换回来，G6A 归档 |
| 9 | [新 65736:54128](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65736-54128)（0 个组件）、头像矩形 65689:738126…（没有导出设置）、04-AI 模版 651 个「资源 / …」组件（0 个有导出设置） | Codex 的新功能只画了帧，没有做组件和切图，违反「交付必须有切图 + 色值规范 + 组件」 | 在 03 建 GameCard Style=…、ImageFitDialog State=…、模版结果卡；02 补切图和导出设置；头像用原稿的 slice/avatar |
| 10 | `VariableCollectionId:65736:140281` | 420 个变量只有一个「Mode 1」，没有别名，集合名没有编号，不能按模式切换整套颜色。**部分成立**：每套只存 20 个 Key 是故意的（11 个基础色 + 覆盖，与 v67 一致），真正的问题是没有模式、没有别名 | 改成 21 个模式，用 68 Key 的名字，没给的 Key 别名到默认 |
| 11 | 新稿 04-AI 模版：起点 [新 65750:36829](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65750-36829) → [新 65736:182903](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65736-182903)；84 个「应用这一套 · 免费」、126 处「现成模板免费选择，应用不扣点」 | 新稿流程和 Codex 自己交接 §3 矛盾：可点击原型仍连到「已停用」的免费模版入口；没有骨架屏风格卡，也没有 3 套结果页 | 按决策 2 重画：风格骨架卡 → 设置 → 生成 → 确认 50 点 → 进度（可取消）→ 3 张结果卡 → 预览 → 应用 / 撤销；旧帧移到归档页 |
| 12 | [新 65736:193708](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65736-193708)（桌面）、[新 65736:194855](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65736-194855)（手机） | 付了 50 点之后只有标题和「应用生成候选」，看不到预览，不能在 3 套里挑，也不能放弃 | 显示 3 张结果缩略图，选中用淡蓝底 + 蓝字、不打勾；有预览、应用、放弃；失败的那张标出来，可以免费重试 |
| 13 | [新 65781:55708](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65781-55708)（65781:55709 → 65791:4503） | 从「首页背景」行打开取色器，切到「主色」再改 HEX，会把全页用 primary 的地方都改掉，却没有任何影响范围提示；这一行的名字也变成「主色 primary」，原来的用途名不见了 | 见 §6 #14 |
| 14 | 新稿 21 套顶栏「俱乐部名称 www.188.com」，例如 [新 65746:40777](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65746-40777) | 网址用的是 border 色，21 套里有 20 套和顶栏底色的对比度只有 1.30–2.05:1（festive-2：#A80000 叠在 #6F0204 上是 1.58）。交接说的 neutral_3 也有 18 套不达标 | 绑定 neutral_1 或 neutral_2，每套检查对 bs_topnav_bg 至少 3:1；techblue-2 的搜索文字（2.74:1）也一起改 |
| 15 | 原提示词 atlas 组件 [新 65736:173481](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65736-173481)、65736:173493、65736:173505、65736:176502 | fresh-1/2/3 和 festive-2 的图标提示词还在写浅色（象牙白、#199C87…），但这 4 套现在是深色底配 #FFDE8F / #1A8950 / #78E02C / #FFD501，「按编辑提示词生成」出来的图标会和主题不搭 | 按最终配色重写这 4 条，图标有冲突就重新生成，并补记到 `docs/ai-prompts.md` |
| 16 | 新稿 04-AI 模版（原稿 433:* / 437:* / 439:* / 441:*、478:2–478:13 都不在） | v67 用的原图在新稿里找不到，manifest 里的 figma id 在新稿全部失效。**部分成立**：478:* 是 14:36–14:41 生成的，在复制之后，所以不是 Codex 删的；430:654090 / 654091 两段还在 | 合并前先把原稿 04-AI 模版复制成归档页「04-AI 模版 11-27 · v67 原稿」 |
| 17 | v67 `js/aidesign.js` mergeTpl() / putTplAssets() | 套用模版会替换业主上传的 Banner 和入口 / 导航 / 菜单图标，还会改 Banner 尺寸、列数、圆角、菜单样式。**部分成立**：选模版时有提示「会替换 Banner 和入口图标（共 22 张），可撤销」，但没提到会覆盖用户上传的图和布局；付费结果那条路径完全没有提示 | 按交接 §4：默认保留上传素材，开关打开才替换；应用前列出会改什么 |
| 18 | v67 AI 一键设计面板（aidesign.js edStart / edFinish） | 结果和进度画在面板顶部，但面板不会滚上去。复现：`$P?reset=1&lang=zh-Hans&theme=dark#/editor` → AI 一键设计 → 把面板滚到底 → 生成 3 套 → 开始生成，scrollTop 一直是 433，只看到一个灰掉的「重新生成 3 套」。截图 `$S/pages-d/v67_ad_progress.png` | 在 edStart / edFinish 渲染后把 `.ad-eres` 滚到可见位置，或把 `.ed-right` / `.ad-mbody` 的 scrollTop 设为 0 |
| 19 | v67 aidesign.js buildDesign() | 付费「生成 3 套」用默认设置时，返回的就是下面写着「套用免费」的那 3 套（提示词完全一样）。只有改了主色或图标风格时才会不同 | 随决策 2。若按 Codex：进入不再显示免费模版；若保留：生成结果必须随主色、图标风格、补充描述变化 |

### 中

| # | 位置 | 问题 | 修改 |
|---|---|---|---|
| 1 | 新稿所有桌面编辑器顶栏（04-2/3/4/5/8/9，04-8 和 04-9 共 231 帧；Codex 的新帧，例如 [新 65689:734555](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-734555)） | PC 显示为可选，还带 SET_VARIABLE 连线，和 09:28 的决定、Codex 自己的锁定页矛盾 | 用原稿的 IconSegOption Locked，连线改成指向「暂未开放」toast |
| 2 | 新稿 253:16、253:119、253:222、253:319、253:416、253:513、253:610 | 风格缩略图的底色解绑成写死的颜色（fresh #0B4D2F、festive #480001），和 sp/bg 的值对不上，而说明 253:13 写着「颜色全部来自 08」 | 重新绑 sp/bg（`VariableID:250:33`）；要换底色就改 08 的模式值 |
| 3 | 新稿 [新 317:55871](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=317-55871)（Waydon 原稿段 317:55525 内） | 一个隐藏实例被改名并换了主组件 | 换回 317:53137 并改名「气泡」 |
| 4 | 06 文案（两边） | ad/* 文案里英文和中文一样的：原稿 163 条、新稿 170 条；新稿还有 7 条 4 种语言都是中文 | 从 `prototype/js/i18n-ad.js` 回填 |
| 5 | 新稿 [新 260:11634](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=260-11634)，文案 260:9557/9558 | 「巴西绿 · 荷叶绿 · 黑金 · Rolex绿」带了第三方商标；副标题折成两行，这张卡比别的高；在 v67 的单行里会被截断；08 模式名没改。**部分成立**：「黑金」和新稿 fresh 的 3 套深色模版并不矛盾，只和 v67 的浅色模版矛盾 | 副标题改成一行，例如「荷叶绿 · 金点缀」，补 4 语；缩略图、模版、08 模式名统一 |
| 6 | [307:16634](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=307-16634)；原稿说明 307:16421 | 03 顶部栏内容组件两边都过时；原稿说明写金额跟随 primary，v67 实际是 accent_3 | 按 v67 重做，改说明 |
| 7 | 01（[4:6](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=4-6) / [9:43](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=9-43)）、00（0:1） | 新 token 没有记录，封面清单页是空的 | 两张规范板补行；做 00 清单（页面列表、切图数、变量集合） |
| 8 | 新稿 65736:137438、65736:172612 | 98 个 BOOLEAN 原型变量，作用范围 ALL_SCOPES，集合没编号，模式叫「Mode 1」。**部分成立**：原稿 07 原型状态的 61 个 BOOLEAN 也是 ALL_SCOPES，BOOLEAN 本来就收窄不了；集合 09、10（65826:*）是 Claude 的自定义模版，不是 Codex 的 | 并入 07 原型状态，给模式起真实的名字 |
| 9 | 新稿 04-2、04-3 | 颜色行组件混用。**部分成立**：繁中 / 英 / 越的顶部栏帧（178:56503 等）两边本来就是旧的普通色块；Codex 只换了 8 帧 G6 | 定下方案后一次性换掉所有实例，再从 04-2 重新复制引用帧 |
| 10 | 两边的 [135:41489](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=135-41489)；v67 日间 Banner 颜色 | 白色和近白色块对白色面板只有约 1.3:1。**部分成立**：这是 09:32 Waydon 认可的细内描边，色块还有 tooltip 和胶囊显示色值，属于可选优化 | 亮度 > 0.8 的色块改用至少 3:1 的描边变量 |
| 11 | 两边：04-2 / 04-3 / 04-4 的旧编辑器帧、[204:64472](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=204-64472) / 204:65507「PC 画布待设计」、04 创作框 3 页签帧 | 已被第六、七轮决定取代，但没有任何「历史稿」标记 | 加段落横幅「历史稿 · 以 04-AI 统一生成 / 04-下午改动 / 04-AI 模版 为准」，或者更新这些帧 |
| 12 | 新稿 04-5：总览 [新 212:69349](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=212-69349)、整帧 [新 215:73860](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=215-73860)、审稿页 [新 65750:53187](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65750-53187) | 同一个控件有三个版本（样式 + 标签形状 / 菜单位置 + 左栏按钮 / 合并面板 + 6 样式） | 决策 4 定下来后，三处统一，4 语都改 |
| 13 | 新稿 [新 215:73860](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=215-73860)、[新 215:75114](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=215-75114)（含日间） | 画布上的选中框、模块标签、浮动工具栏被删掉，看不出在编辑哪个模块；左树列着彩金池 / 中部导航 / 页脚，画布上却是公告栏 / 帐户栏 | 恢复选中框和工具栏，左树改成真实的经典模块 |
| 14 | 新稿说明 [新 65751:39597](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65751-39597)「4张菜单自动中部」 | 在卡片模块里选「每行 4 张」会悄悄改掉另一个模块的布局，没有提示、确认或撤销 | 菜单在左侧时禁用 4 并说明原因；或者显示「菜单将移到中部」并给撤销 toast。先在 Figma 画出来 |
| 15 | 两边 [297:78311](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=297-78311)、297:78630、297:79129、297:79308 | 模板页还是两款可用、「9 个模块」，和 11-26 只开放经典蓝白的决定矛盾 | 白金标暂未开放，用经典蓝白的真实缩略图，写「7 个模块」 |
| 16 | 两边 04-8 / 04-9，例如 [283:411460](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=283-411460)、283:411676、283:427830 | 还在画 v67 已经删掉的模块（侧边栏、页脚、中部导航） | 加经典蓝白基线行，第五轮的帧标成已被取代 |
| 17 | 新稿 [新 231:124271](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=231-124271)、231:127513、237:199456、237:199927、290:39242 等 | 素材库还是占位版：4 个分类，8 张图里 6 张副标题写「世界杯开幕」，不是 11-26 的真素材 | 用原稿的真素材版 |
| 18 | 原稿 434:*（04-8）vs 新稿 [新 65716:673529](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65716-673529) | Claude 和 Codex 同一天各做了一套槽位素材库，互不引用 | 合并到原稿的帧里，补上 Codex 多出的状态和日间版，H2 页标成参考 |
| 19 | v67 应用 AI 设计后（adEApply） | 「已解决 1 项：底部导航」「已应用 AI 设计 · 撤销」和「生成整套图标」提示条叠在顶栏中间，文字看不清，撤销按钮和未登录 / 已登录切换都被挡住。截图 `$S/pages-d/v67_ad_applied.png` | 应用时把检查提示合并进 toast；toast 放在 64px 顶栏下面，按固定间距排列；图标提示条等 toast 消失后再出现 |
| 20 | 原稿 [原 440:403387](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=440-403387) / 440:334066；v67 tplSec + `.ad-egen` | 预览模版时有两个蓝色主按钮：「应用这一套」（免费）就在吸底的「生成 3 套 ✦50」上面，很容易误点花掉 50 点 | 预览模版时把底部按钮改成次要样式，只留一个主按钮 |
| 21 | 新稿 [新 398:17934](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=398-17934) 等 4 帧，药丸 65731:540336 / 540342 / 540348 / 540354 | 注释浮层挡住字号步进器和字重分段；色块折成两行；药丸显示 Key 不显示 HEX；SF 字符。**部分成立**：「默认」文字已经隐藏，首个色块也是选中的，所以只违反 09:30 的方案 A（原稿 398:17934 的注释也压到了下一张卡） | 用原稿的 TxColorRow + HexChip，注释移到卡片外面 |
| 22 | 新稿（没有 340:2）；`docs/ai-prompts.md` | 文档里「原图见 Figma 09 AI 图标草稿 (340:2)」的链接失效。**部分成立**：6 张无字原图在 [新 65716:673530](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65716-673530) 里还在，只是要改链接 | 把文档链接改成新 id，或者复制 09 页 |
| 23 | 新稿 21 套的「游戏分类」，例如 [新 65746:42250](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65746-42250) | 「试玩」没有按双字规则加字间空格。**部分成立**：最近 / 收藏是隐藏的，所以看不出重叠；看得见的行间距是均匀的 90px | 双字规则全部统一；隐藏项的位置也整理一下 |
| 24 | 新稿「Banner 轮播」，例如 [新 65746:41146](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65746-41146) | 只有 1 张图，指示器却画了 3 个点；原稿和 v67 每套有 3 张 | 每套补到 3 张，或者只显示 1 个点；写清楚套用时第 2、3 张用什么 |
| 25 | 新稿 [新 65775:99921](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65775-99921) 等（65772:10656 内） | 套用红色 festive-2 之后，「品牌配色 / 11 个基础色」还是金黑配色；版式列了 4 个选项且没标暂未开放；没有模板卡和首页背景；「AI 一键设计」旁边有个空的蓝色药丸 | 按 v67 现在的页面设置面板重做，色块绑定到已套用的那一套 |
| 26 | 新稿 [新 65746:36755](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65746-36755) / 65746:69727（84 个面板） | 「同时替换已上传素材」放在应用按钮下面；原提示词超出面板 94–870px 且不能收起；只有中英两种语言 | 选项放到主按钮上面，提示词默认收起（或按 §3 去掉），补 4 语 |
| 27 | 新稿 04-AI 模版 245 个顶层帧 | 全部只有夜间、简体中文，违反日夜和 4 语规则 | 补日间版流程，每种面板做一个越南语 / 英文帧，用最长的文案检查 |
| 28 | 新稿 [新 65736:189386](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65736-189386) / 190533、[新 65736:191547](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65736-191547) / 192694 | 第一次生成也写「确认重新生成」，正文还说「现成模板免费」；进度页没有百分比也不能取消，没生成完就能点「查看生成候选」 | 写「生成 3 套 · 本次消耗 50 点」，加进度 % 和取消（0 张结果时不扣点），没生成完不能看结果 |
| 29 | 新稿 [新 65750:29505](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65750-29505)、[新 65716:801566](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65716-801566)、65689:736677 等 | Codex 的新帧用的是旧编辑器底稿：左树有彩金池 / 中部导航 / 页脚 / 菜单栏 / 侧边栏，Banner 面板是 规格 大 / 通用 / 小、圆点 / 短条、710×209 | 改用现在的 7 模块编辑器（Banner 样式放在「内容」里，指示器 s1–s4） |
| 30 | 新稿 [新 65689:734555](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-734555)、65692:34046 等 | 预览是未登录（显示登录 / 注册），消息图标却有「99」气泡 | 气泡只在已登录预览里显示 |
| 31 | 新稿 65750:*（例如 [新 65750:35069](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65750-35069)）、65736:150367 / 147859 | 「卡片行数」实际是每行张数；横版按 3、2 倒序排；每行 4 张时「左侧」变灰却不说原因；早期帧还在画左栏 + 4 张，和后来的规则矛盾 | 改名「每行张数」，从小到大排，加说明「每行 4 张时菜单固定在中部」，早期帧标成已被取代 |
| 32 | 新稿 [新 65779:34519](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65779-34519)、65779:34735、65779:34771、65779:34915 | 标题是占位「所选游戏」；生成中帧把演示按钮「生成失败 / 选择生成候选」露出来了；取消态文案和生成中一样；方卡也提示「圆版主体保持在安全圆内」；没有关闭 ✕；候选是 3 张，别处是 4 张 | 显示游戏名和缩略图；演示按钮收进 DEMO 条；每个状态写自己的文案；加 ✕；用统一 AI 面板（4 张候选）和 v67 的裁切对话框 |
| 33 | 新稿 [新 65692:37720](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65692-37720) vs 65779:34519 / 34555 | Banner 和单卡的裁切 / 留边是两套交互 | 见 §6 #21 |
| 34 | 新稿 [新 65689:734555](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-734555)「全段文字样式 14 px」 | 给业主看的字号要用 750 稿单位（v67 显示 26） | 改成 750 单位，和 v67 一致 |
| 35 | 新稿 [新 65781:55709](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65781-55709)（白字压在 #F5F7FA 上）、[新 65689:738134](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-738134)（深色胶囊上的深色点）、65671:2147 夜间 | 对比度远低于 3:1，文字和色点都看不见 | 文字颜色按底色亮度自动选（v67 的 inkOn）；色点和色块加 swatch-edge 描边；透明色用棋盘格 |

### 低（全部未复核）

| # | 位置 | 问题 | 修改 |
|---|---|---|---|
| 1 | 两边 307:16319 说明文字 | text/tertiary 在 #1C1C1E 上约 2.5:1 | 改用 text/secondary |
| 2 | 两边 229:115018 KeyRow | 开关删了，ShowKey=关 / 开的变体还在，变体数翻倍到 12 | 删掉 ShowKey 属性 |
| 3 | 两边 189:538 slice/brand/logo-600x100 | 唯一一个没有导出设置的切图，而且放在画板外 y=-300 | 加 PNG @1x/@2x + SVG 导出，移进 Brand 板 |
| 4 | 原稿 [原 434:461671](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=434-461671) AvatarPicker | 选中头像用蓝圈 + ✓ 角标；规则是「选中不打勾」（原本是给列表定的） | 问 Waydon 网格是否也适用；适用就去掉 ✓ |
| 5 | 新稿 [新 65689:737109](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65689-737109) | 桌面「暂未开放」toast 盖住画布的 H5 顶栏和登录按钮 | 放在编辑器顶栏下面、画布上方居中 |
| 6 | v67 桌面编辑器点 PC | toast 盖住未登录 / 已登录切换 | 放到顶栏下面（top ≈ 76px） |
| 7 | v67 `#/editor` 375 宽 | 标题被截成「星河…」，英 / 越更严重 | 见 §7 手机导航栏 |
| 8 | 两边 04 页 229:92424、229:92688、235:139331 / 139441 / 139552；04-2 135:41851–135:41856 | 5 个孤立节点压在段落标题上；6 个标题图层名和文字对不上 | 删掉孤立节点，改图层名 |
| 9 | 新稿 [新 65736:152730](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65736-152730)；v67 画布 | 经典 H5 左栏未选中分类文字 #999999，约 2.7:1 | 这是 Waydon 模版的默认值，先问他再改（例如 #767676） |
| 10 | 原稿 [原 440:635497](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=440-635497) | 公告栏手机只有 NT-M01 / M02，没有气泡关、入口关、颜色页签 | 补 NT-M03–M05（夜 / 日） |
| 11 | v67 `#/projects` 多选 | 勾选框压在搜索图标上；手机底部「已选 0 个」条挡住最后一行 | 勾选框放在 28px 半透明底上，列表底部留出底条高度 + 16px |
| 12 | v67 `#/editor?lang=vi` | 底部导航「Chia sẻ kiếm tiền」折行溢出；「Đăng nhập」被裁 | 单行省略号，或者最小 10px |
| 13 | v67 `#/recharge` | 默认没选档位，按钮显示「确认充值（模拟）· —」且不可点，自定义卡没写范围；Figma 233:135981 预选 1,000 点 | 预选 Figma 的默认档，补范围说明 |
| 14 | 新稿 280:13 ED-16 行 x=1540 / 3080 | 删掉连接帧后留下空位 | 左移补齐，或者加一行说明「连接步骤已移除（11-27）」 |
| 15 | 原稿 237:180083 等 8 帧 | 已废弃的连接帧还放在主流程里 | 删掉或归档 |
| 16 | v67 aidesign.js genBtn | 第一次生成时按钮就变成「重新生成 3 套 ✦50」 | 生成中显示灰色「生成中…」 |
| 17 | 两边 398:18973、398:20015、398:18975 | 说明还在讲「默认」「自动」，这两个都已经没有了 | 改成「第一个色块 = 绑定的 Key（再点一次恢复默认），右侧显示当前色值」 |
| 18 | 原稿 267:250053 vs 440:403387 vs v67 | AI 面板的区块顺序随状态变化，「效果图（可选）」和「上传效果图」两种叫法 | 固定为 v67 的顺序：风格 → 模版 → 效果图 → 图标 → 主色 → 补充描述 |
| 19 | 原稿 [原 440:401410](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=440-401410)；v67 | 套用古铜尊享之后，页面设置还显示旧版式 / 旧模板名 | 显示「AI 模版 · 古铜尊享」，带切换 / 恢复原设计 |
| 20 | 原稿 [原 440:334066](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/?node-id=440-334066)、440:401410 画布 | 图标位置是空的金色方块，Banner 是空渐变 | 放上 blackgold-2 的素材 |
| 21 | 新稿 [新 65731:539121](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65731-539121) / 65731:539333 | 夜间卡片是纯白；「小号」示例约 6px；手机帧和桌面完全一样 | 夜间用 fill-2 卡片，小号示例至少 9px，手机画成底部面板 |
| 22 | 新稿 [新 65775:99921](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65775-99921)、65736:196735 | 撤销 toast 盖住 H5 底部导航 | 放在画布区上方 |
| 23 | v67 一键设计确认框 | 「本次消耗 约 50 点」里的「约」让费用显得不确定 | 写「本次消耗 50 点」 |
| 24 | 新稿套件名，例如「巴西绿 · 电子 (Rolex黑)」「红金 · 彩票 (红底)」 | 给业主看的名字里带了商标和设计备注 | 显示名干净、4 语，备注写进图层描述 |
| 25 | 新稿 minimal-1/2/3、platinum-1/2/3 | 同一风格 3 套颜色太接近（minimal 主色 #34383C / #51545C / #3B4149），基本只是 Banner 不一样 | 每套给不同的点缀色或冷暖 |
| 26 | 新稿 festive-2 底部导航 [新 65746:42759](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65746-42759) 等深色套件 | 未选中图标是深灰叠在 #250000 上，几乎看不见 | off 图标从 neutral_1 着色，检查对导航底色 ≥ 3:1 |
| 27 | v67 左栏按钮、顶栏没有底色的套件 | 经典蓝色投影和蓝色搜索图出现在所有套件里 | 去掉默认投影（交接 §8），搜索图按套着色 |
| 28 | 新稿左面板「账户栏 / 游戏分类」vs v67「帐户栏 / 游戏菜单」；图层名「TRANG CHỦ」 | 模块叫法不统一，图层名过时 | 每个模块定一个名字（4 语），改图层名 |
| 29 | 新稿 [新 65731:535952](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65731-535952) / 65731:537075 | 高亮的是「内容」页签，显示的却是余额框颜色行 | 高亮「颜色」，或者把这几行挪过去 |
| 30 | 新稿 65736:140825、65750:*、65778:36796–41144 | 测试文字「最多展示两行文字后省略哦哦哦哦哦哦」「94中部111」；被裁掉的角标；5 张没有标注的 1920×640「Generated Image」 | 换成真实文案；角标收进 375 画布；图片加标注或移到图源区 |
| 31 | 新稿 [新 65750:30552](https://www.figma.com/design/FikSmkYSPbP30PrjagWyYl/?node-id=65750-30552) 等（375×1187） | 「手机」游戏帧只是把 H5 预览和桌面面板上下摞起来，没有底部面板和编辑器外壳 | 画成手机编辑器 +「模块」底部面板 |
| 32 | 新稿 65661:2 的 ColorPicker 等 | 52 个填充没绑变量；新页大多只有夜间、简体中文 | 绑定变量，补日间和繁 / 英 / 越 |

---

## 9. 建议的对齐步骤

> 下面按「新稿做母版」（决策 1 的推荐项）写。如果 Waydon 选原稿做母版，第 2–6 步方向反过来：把 Codex 新页、多皮肤、自定义模版搬进原稿。

1. **先定 4 件事**：见本报告开头和 §6 里标「需决定」的 #5、#7、#8、#14、#15、#16。11-28 汇报前不要动新稿的自定义模版 3 页和多皮肤页。
2. **冻结原稿**：只读，作为来源。新稿里先建归档页：「04-AI 模版 11-27 · v67 原稿」（复制原稿 430:619174 的全部内容）和「09 AI 图标草稿」（复制 340:2）。
3. **变量（脚本，原稿 → 新稿）**：加 99 条文案和 color/border/swatch-edge，补 9 条翻译；按 i18n-ad.js 补齐 170 条只有中文的 AD 文案；删 ed/keys-show-key；风格缩略图重新绑 sp/bg；21 套模版颜色改成 21 个模式；原型 BOOLEAN 并入 07。
4. **组件（Waydon 在 Figma 桌面端手动跨文件复制，插件 API 不能跨文件；粘贴后检查组件和变量绑定是否落到本地）**：02 的 slice/avatar a1–a8、slice/icon/copy、user-1x1；03 的 Avatar×3、TplCard（随决策 2）、IconSegOption Locked、AiDesignPanel 模版选中（随决策 2）、AssetLibraryDialog 槽位变体、HexChip / RainbowSwatch / TxColorRow、新 ColorRow / TxSwatch、ColorPicker 复制、KeyRow 胶囊。删掉 ColorDefaultBtn；G6A 的有用变体并进 03，然后归档 G6A；还原 317:55871。
5. **实例回放（脚本，id 相同）**：约 808 处 PC → Locked；所有 G6A 实例换回 G6/ColorRow + HexChip（04-2、04-3、04-5、04-8、04-下午改动、03 TopbarContentList）；32 处 TxColorRow；头像；ColorPicker 复制；文字差异（G3 的信箱 → 消息、384:23314 那句）。
6. **帧**：从原稿复制 04-3 434:448257、04-5 440:635497 + NT-05、04-7 435:*、04-8 434:*、04-10 440:*（随决策 2）。再把 Codex 审稿页里要保留的状态并入对应的 04 页：PC 手机帧、公告栏已读 / 未读、Banner AI 尺寸裁切、素材库额外状态、游戏布局（随决策 4）。其余审稿页标「已并入 / 参考」。
7. **修 §8 的高、中问题**（Figma 里改）：顺带把每个新状态的日间版、手机版、4 语补齐。
8. **规范和清单**：01 两张板补新 token 和集合；做 00 封面 / 清单页；给旧帧加「历史稿」横幅。
9. **然后改 HTML**：按对齐后的 Figma 改 v67；更新代码和文档里引用的旧 id（`css/editor.css:13` 的 434:441758、`assets/ai-tpl/*/manifest.json` 的 figma id、`docs/ai-prompts.md` 的 340:2）；修 v67 自己的问题（§8 高 #17–19、中 #19–20 等）。按规则一个模块做完推一次 git。
10. **Codex 源码**：在 Waydon 的 Windows 电脑 `C:/Users/waydon/.codex/visualizations/2026/11/26/01a21755-…/AIplatform-work`（版本 7a1d6273，未 commit）。之后要拷过来或连线，再和 v67 比对代码（取色器「应用无反应」的修复、6 种卡片样式、单卡换图、模版应用时的保护逻辑）。

---

## 附录 A：已排除（复核不成立）

| 原说法 | 为什么排除 |
|---|---|
| 风格卡缩略图是「图片式」，要改成 v67 / Codex 的骨架屏 | Figma 的 StyleCard 缩略图本来就是矢量切图 slice/style/<key>（约 100 个纯色节点，没有图片）；v67 的 styleThumb() 注释写着是它的原型版。两边已经一致，只是细节多少不同 |
| 「Codex 的自定义模版 03 AI 生成流程（65826:446678）」用了 4 个新风格名、每次只出 1 个结果，和交接 §3 的 3 套结果矛盾（连同「与文件其余部分不一致」一条） | 归属错了：这是 Claude 11-27 晚按 Waydon 12:06 的要求做的自定义模版（11-28 汇报），4 个风格对应参考稿 A–D，「结果按所选风格跳转」是故意的。手机帧 390 宽这一点另外检查 |

**复核时修正的细节**（已经改进正文）：头像切图导出是 PNG@2x，不是 webp；新稿多出的四语皆中文 AD 文案是 7 条，不是 8 条；新稿占位素材库 8 张里 6 张副标题是「世界杯开幕」，2 张是「NBA 季后赛」；04-8 / 04-9 新稿未锁的 PC 是 231 帧（154 + 71），不是约 185 帧；v67 胶囊的 tooltip 是「复制色值 #HEX」，「Key 名 · #HEX」是色块的 tooltip；v67 手机「页面」面板有锁定的 PC 选项，不是「手机没有 H5 / PC 切换」；「看不出也复制不了 hex」是 09:20 说的，方案 A 是 09:30 选的。

## 附录 B：未复核

- §8「低」的 32 条都没有经过复核，证据只来自各比对组。
- §4 中「preview-selected 改为别名」一条未复核。

## 附录 C：覆盖范围

**查过的**
- 原稿和新稿共有的 18 页：每个顶层节点都做了指纹比对（id、类型、尺寸、子孙数、文字哈希、结构 / 填充哈希）。01、02、03 和 317:55525 还做了深度属性哈希；04 各页查了自有节点和原型连线哈希。
- 原稿独有的 id 全部在新稿里用 getNodeByIdAsync 查过，结果都为 null，所以没有跨页移动。
- 所有变量集合（模式、数量、取值哈希、逐条差异），以及文字、效果、颜色样式。
- 新稿 6 个 Codex 页、04-AI 模版整页（21 套逐套提取配色、布局、顶栏、按钮、绑定、651 个组件），多皮肤只列了结构。
- v67：用 Playwright 在 1440 / 375、夜 / 日、简中（部分越南语）下操作了编辑器颜色行、顶部栏、PC 锁定、AI 一键设计（入口、模版、扣点确认 / 取消、进度、结果、应用 / 撤销）、公告栏、素材库、头像、模板页、多选、充值，并读了相关源码。

**没查的**
- 实例内部的逐节点差异：只确认了它们来自哪个改动过的主组件。
- 04-10 / 04-11 / 04-AI 统一生成 / 04-下午改动只比了结构、文字和名称；只改颜色或位置的 Codex 改动可能漏掉。
- 日间和手机的成对帧大多只比了指纹，没有截图。
- v67 没有跑繁中和完整的英 / 越；平板抽屉和 04-4 的每个工作台状态没有逐个点。
- 改动作者：没有版本历史，317:55871 的换组件和缩略图解绑是谁做的无法证明；「设计稿4」GAbvzR34ArOROqmPq2kOKs 没有权限。
- Codex 源码（在 Windows 电脑上）。

**比对员的工作文件**（临时目录）：`$S/base/`、`$S/pages-a/`、`$S/pages-b/`、`$S/pages-c/`、`$S/pages-d/`、`$S/tpl/`、`$S/newpages/`，各自有 Figma 截图（shots/ 或 figma/）和 v67 截图（pw/ 或 proto/）。Codex 交接原文：`$S/codex-handoff.md`。

---

## 附录 D：顶部栏排查剩下的问题（与本次比对无关，等合并方向定了一起修）（workflow topbar-regression-hunt，已复核；d08b3df 之后仍存在）

v65 引入、还没修：
- 深海科技（techblue-1）：顶部栏变深蓝 #12204A 后，STAR GAMING 深蓝字 Logo 几乎看不见（1.0:1）；Figma TPL 437:221956 同样。techblue-2、minimal-2/3 之前就看不清（manifest 写了 Logo 白色圆角底板但没实现）。→ 设计问题，先改 Figma（Logo 浅色版或白底板）。
- PC 顶部栏选中导航「热门」颜色跟着 --tb-search 变成近白 #E8F0FF（原来品牌蓝 #1678FF，在 #12204A 上 3.88:1 够用）。→ 给导航单独变量。
- AI 模版套用后，默认搜索图标用遮罩上色，变成实心一团（不是线框放大镜）。
- 余额框颜色 › 金额文字 的色值胶囊没显示 AI 自动色（画布 #000，胶囊 accent_3）。
- 选中的「默认」色块仍画 Key 原色（胶囊已改对）。
- v65 之前套过模版的旧存档：深色平铺模版仍是白底顶部栏（字已能看清），没有迁移到深色底。

之前就有（base 一样）：
- 编辑器顶栏的 toast 盖住「未登录 / 已登录」切换；越南文下点「已登录」可能点到 toast 的「撤销」，把刚套的模版撤掉。（中）
- 手机编辑器保存失败时，顶栏项目名缩成一个字、DEMO 被截、多出一个「重试」（按钮套按钮）。（中）
- 电脑编辑器顶栏在越南文 / 英文、保存失败或已导出时溢出，「导出」被挤出屏幕。（低）
- 手机全屏预览的关闭 × 盖住顶部栏的搜索。（低，要先改 Figma）
- 导出 › 源文件结构 › 02 切图：Logo 切图显示平台 orb +「星河体育」而不是项目 Logo；缺币种 36×36 切图；搜索写 24×24 应为 56×49。（低）
- 工作台 AI 结果查看器里 PC 模式没锁（其它地方都「暂未开放」）。（低）

证据：scratchpad/tbhunt/verify*/、tbhunt/surfaces/、tbhunt/migration/。
