# AI 生成 · 统一排版与流程（规范 + 实施计划）

> 起因：业主反馈「统一 ai 生成的排版和流程，我看几个模块各做各的」。
> 范围：编辑器里所有「给模块生成图片」的 AI（Banner、顶部栏 Logo / 图标、余额框币种、公告栏、帐户栏、游戏菜单、游戏卡片、底部导航，以及可选的侧边栏）。
> 参照物：首页 composer（参考图槽 + 提示词 + 模型下拉 + 发送键带点数），也就是业主说的「像首页那样」。
> 不在本次范围：首页 / 工作台的 composer 本身、AI 一键设计（AD-03）面板。这两处只在第 8 节列出跟进建议。

---

## 0. 现状：一句话列出各做各的地方

现在一共有 **7 种做法**：

| 现在的流程 | 面板形态 | 输入框 | 款式 | 结果 | 失败 | 扣点确认 |
|---|---|---|---|---|---|---|
| Banner AI（editor.js aiPanel） | 整面板接管，带 ‹ 返回 | 旧 .ai-box，没有空提示词拦截 | 8 个文字关键词，不填进提示词 | 4 张候选，标「最贴合」，采用 / 保留当前 / 重新生成 | 独立失败态 + 通知 | 只在余额不足时弹窗 |
| 顶部栏图标 AI（tbAiSec） | 在内容页里展开，放在整组下面 | c-box，模型说明写死 | 5 张图卡，点了会填提示词 | 1 张结果，采用 / 重新生成 | 只弹 toast | 没有确认，余额不足直接充值 |
| 顶部栏 Logo AI（tbLogoSec） | 卡片套卡片，放在行下面 | 只有提示词，没有参考图和模型 | 没有 | 4 张，默认选中第 1 张 | 只弹 toast | 没有确认 |
| 余额框币种（bx-ai） | 灰盒子 | 没有 | 5 个预设 | 点一下直接套用，免费 | 没有 | 没有 |
| 模块图标 AI（modpanels iaOpen / iaOpenOne） | 整面板接管 + 底部固定 CTA | c-box 但**没有发送键** | 9 张大卡（5 张实物 + 4 种矢量） | 先出样板，再出其余，最后逐个采用 | 独立失败态 + 通知 | 只有「其余」那一步要确认 |
| 按钮底图 / 卡片兜底图（gmBai / gcAi） | 在内容页里展开 | c-box + 发送键 | 5 个小图卡 | 1 张 | 只弹 toast | 没有确认，gc 收 ✦10 |
| 工具条「AI · 10」（aidesign adMod） | 不开面板，直接在画布上蒙层 | 没有 | 没有 | 直接套用 | 只弹 toast | 没有确认 |

还有一个问题：同一个模块上会同时出现三四个 ✦，图标各不相同（魔棒 / ✦），文案也不同（采用 / 使用、重新生成 / 再来一次），业主分不清哪个按钮做什么。

---

## 1. 统一原则（写给业主看的版本）

1. **一个入口样子**：只要能用 AI 生成的图，那一行末尾都有同一个 ✦ 按钮。工具条上的「✦ AI」和 ⋯ 菜单里的「AI 生成」打开的也是同一个面板。
2. **一个面板样子**：所有模块打开后长得都一样，跟首页输入框是同一套：参考图、提示词、款式、模型、发送（发送键上写点数）。
3. **一种结果样子**：先显示生成中的骨架和进度，然后出几张候选让你挑。挑中一张以后，主按钮是「使用」，次按钮是「再生成 ✦N」，还有文字按钮「取消」。
4. **一种扣点规则**：点数永远写在发送键上。单次消耗 ≤ ✦20 时直接生成；超过 ✦20（比如整套图标）先弹一个确认框。余额不够时统一弹出充值框。失败不扣点。
5. **用了能撤销**：点「使用」以后关闭面板，回到模块设置，并弹出「已换上 AI xxx · 撤销」。
6. **一套图标和单个图标是同一个面板**：面板里有一个「范围：只这一个 / 整套」开关，不再是两个面板。

---

## 2. 入口（所有模块一致）

| 入口 | 位置 | 行为 |
|---|---|---|
| 行尾 ✦ | 内容页里每个支持 AI 的素材行末尾（`.tb-ai`，图标统一用 `sparkle-fill`，提示文字 `aig/entry-tip`「AI 生成这张图」） | `AIG.open(mod, target, {idx})`：打开面板，自动选中这一行对应的目标；如果是图标行，范围设为「只这一个」 |
| ⋯ 菜单 | 素材行 ⋯ 菜单和画布点图弹出的菜单（桌面是下拉，手机是底部弹层），菜单项 `aig/menu`「✦ AI 生成」 | 跟行尾 ✦ 一样 |
| 工具条 ✦ AI | 画布上选中模块时出现的浮动工具条（桌面）和手机模块弹层的标题栏 | `AIG.open(mod)`：打开面板，选中这个模块的默认目标（见第 6 节） |
| 内容页底部的大按钮（可选） | 原来的「用 AI 生成一套图标」「AI 生成搜索 / 币种图标」 | 删掉。如果一个模块的行上都没有 ✦（比如公告栏），就保留一个次按钮「✦ AI 生成图片」，点了等同于工具条 ✦ AI |

统一后要调整的地方：

- Banner 原来的魔棒按钮「AI 生成」改成 ✦。
- 公告栏、帐户栏、游戏菜单的入口行**补上**行尾 ✦（现在只有底部导航有）。
- 余额框币种行的 ✦ 不再展开预设盒子，改为打开统一面板，目标是「余额框币种图标」。
- 工具条上原来的「AI · 10」（aidesign 的整模块重新生成）**改名、换图标**，避免跟 ✦ AI 混淆，详见第 7 节。

---

## 3. 面板结构

桌面：替换右侧模块面板，宽度约 307–340px，模块的 内容 / 布局 / 颜色 页签暂时隐藏。
手机：替换模块底部弹层的内容，高度跟着内容走，最高 90dvh。只有在出现「整套」结果列表时才强制撑高。

```
┌──────────────────────────────────────┐
│ ✦ AI 生成 · 搜索图标              ✕ │  ① 标题栏 .aig-hd
├──────────────────────────────────────┤
│ [Logo] [币种] [搜索] [侧边栏入口]   │  ② 目标切换（只有 ≥2 个目标时显示）
│ 范围：(只这一个) (整套 6 个)        │  ②' 范围开关（只在图标类目标显示）
├──────────────────────────────────────┤
│ 款式                                  │  ③ 款式卡 .aig-styles：5 列小图卡，单选，
│ [光泽][扁平][黑金][喜庆][霓虹]       │     点一下就把款式提示词写进框里
├──────────────────────────────────────┤
│ ┌─────┬────────────────────────────┐ │  ④ 输入框，沿用首页 .c-box
│ │参考图│ 提示词（4 行，最多 300 字）  │ │     .c-input = refSlot + textarea
│ │  +  │                            │ │
│ └─────┴────────────────────────────┘ │
│  [GPT Image ▾] [4 张 · 56×49]  (✦20↑)│     .c-tools = 模型 + 数量/规格 + 发送键
│ 提示词由 AI 看参考图写出，可以再改 │  ⑤ 输入框下的提示行 .c-hint / .p-note
├──────────────────────────────────────┤
│ 候选 · 挑一张                         │  ⑥ 结果区 .aig-res（还没生成时不显示）
│ [▢][▢][▢][▢]                         │
│ [  使用  ] [再生成 ✦20]   取消       │  ⑦ 操作行 .aig-acts
└──────────────────────────────────────┘
```

### 3.1 各部分说明

1. **标题栏**：左侧 ✦ 加标题 `aig/title`「AI 生成 · {name}」，{name} 是当前目标的名字（例如「Banner 第 2 张」「搜索图标」「整套底部导航图标」）。右侧是 ✕（`aig/close`），点了回到模块面板。手机上不再额外显示弹层自己的 ✕，以免出现两个关闭按钮。
2. **目标切换**：用分段按钮 `.seg`，只有模块有 2 个以上可生成的图片目标时才显示。切换目标后会清空结果区，但提示词会按新目标的默认值重写（如果用户改过提示词，则保留，见 3.2）。
3. **范围开关**（只有图标类目标才有）：「只这一个 · {entry}」/「整套 · {n} 个」。选「整套」后，下方出现入口清单（可勾选，带「必交」标签和「全选 / 全不选」），点数也随之变为整套的价格。
4. **款式卡**：所有图片目标统一用 5 个实物款式（glossy / flat / blackgold / festive / neon），预览图使用各模块自己的样图。模块图标额外有 4 个矢量款式（线性 / 面性 / 双色 / 渐变），排在后面，点了同样会填写提示词（需要补 4 条预设文案）。单选。
5. **输入框**：完全沿用首页的结构 `.composer-lite > .c-box > .c-input + .c-tools`，不再使用旧的 `.ai-box`。
   - 参考图槽：用 `window.refSlot(st, 'aigRef')`，上传走 `refPick / refUpload`（带动画进度圈），格式统一为 `IMG_ACCEPT` + jpeg，大小 ≤ 10MB。
   - 上传完成后**统一做反推提示词**：调用 `window.aiRefRead`，把完整提示词写进输入框，并自动选中最接近的款式。识别期间输入框禁用，占位文字显示「AI 正在识别参考图…」。识别完成后提示行改为「提示词由 AI 看参考图写出，可以再改」。
   - 提示词：4 行，最多 300 字；初始值来自目标的默认提示词 + 当前款式。
   - 模型：只有一个共享的模型选择 `aigModelPill`，选项为「GPT Image · 写实质感、文字清晰」和「Gemini（Nano Banana Pro）· 出图快、风格多样」。桌面用下拉菜单，手机用底部弹层（复用首页的 `S.sheet='model'` 弹层内容）。
   - 数量 / 规格：只读的小标签「4 张 · 1020×300」。数量来自适配器的 `count`（Banner 大图 / 小图是 3 张，文案和骨架数量都按真实值显示）。
   - 发送键：`.send`，内容是 ✦ + 点数 + ↑，提示文字为「本次约消耗 ✦N」。提示词为空时显示为禁用；如果仍然点击，按首页规则提示：输入框红边、轻微抖动，并显示「先描述一下想要的风格」。生成中，发送键变成转圈，输入框、款式和模型都锁住。
6. **余额不足**：输入框下方显示一行红字 `aig/low`「余额不足 · 去充值」。这时点击发送统一调用 `window.lowBalance(cost)`，不再直接跳到充值。

### 3.2 提示词被覆盖的保护
如果用户手动改过提示词（`dirty=true`），再点款式卡时仍然会替换提示词，但提示行会出现「已按新款式改写提示词 · 还原」（`aig/prompt-replaced` + `aig/prompt-undo`），点「还原」恢复上一版。

---

## 4. 状态机（所有模块一致）

```
setup ──发送──▶ (cost>20 ? 确认框) ──▶ generating ──成功──▶ cands ──使用──▶ 关闭面板 + 撤销 toast
  ▲                                        │                  │
  │                                        └──失败──▶ failed ─┤ 重试 ──▶ generating
  └───────────── 取消 / 改目标 / 改范围 ◀──────────────────────┘ 再生成 ──▶ generating
```

| 状态 | 结果区显示 | 操作行 |
|---|---|---|
| `setup` | 不显示 | 无（只有发送键可用） |
| `analyzing` | 不显示；输入框禁用，占位文字为识别中 | 发送键禁用 |
| `generating` | `count` 个骨架格，带百分比进度；整套时再加一条进度条「正在生成 3/6」 | 文字按钮「取消」（`aig/cancel`）。整套取消时只按已成功的张数扣点 |
| `cands` | 候选网格（图标 4 列，Banner / Logo 2 列），可以单选。最匹配的一张带「最贴合」角标，**默认选中这张**。选中后画布实时预览（Banner 已有，其他目标由适配器的 `preview()` 实现，可以不做） | 主按钮「使用」（未选中时禁用）、次按钮「再生成 ✦N」、文字按钮「取消」 |
| `failed` | `count` 个红色虚线失败格，加一行内联错误「生成失败，没有扣点」，同时写入通知中心 | 主按钮「重试 ✦N」、文字按钮「取消」 |
| `partial`（只有整套会出现） | 列表里失败的那几行标红 | 「补齐失败的 f 个 ✦X」（超过 ✦20 要确认）、「使用已生成的」、「取消」 |

### 4.1 整套图标（范围 = 整套）
保留现在「先出样板再出其余」的做法（业主已经验证过，成本低），只是改用统一的外观：

1. 发送（✦20）后生成 **1 个样板入口 × 4 张候选**，结果区显示「样板 · {entry}」的候选网格。
2. 挑中一张后，主按钮变成「按这个款式生成其余 {m} 个 ✦{x}」。超过 ✦20 时弹确认框（`costConfirm`）。
3. 生成其余入口时，结果区变成**列表模式**：每行显示 名称 | 旧图 → 新图 | 「重做 ✦20」。重做会把这个入口的所有状态图（off / on）全部重新生成，修正了现在只重做第一张的问题。
4. 完成后，主按钮「全部使用」，文字按钮「取消」。

数量单位统一按「入口」计算。双状态入口（底部导航的未选 / 选中、游戏菜单的选中分类）算 1 个入口，但价格按图片张数计算，在确认框正文里写明：「{n} 个入口 · {k} 张图」。

### 4.2 关闭和保留
- 点 ✕、按 Esc、切换模块、点画布空白处，都会关闭面板。**生成结果按「模块 + 目标」保留在本次会话里**（`E.aig[mod]`），再打开时还能看到。这样就不会出现扣了点、但结果因为误关丢掉的情况。
- 每次成功生成的候选同时放进素材库（`projAssets`，名称为「AI · {目标} · n」）。这一点沿用 Banner 现在的做法，并推广到所有目标。
- 「使用」以后：`commit()` 写入（可以撤销）→ 关闭面板 → 弹 toast `aig/used`「已换上 AI {name}」并带撤销按钮。

---

## 5. 统一文案和 i18n 键（新增 `aig/*`，4 种语言都要写）

| key | zh-Hans | zh-Hant | en | vi |
|---|---|---|---|---|
| aig/entry-tip | AI 生成这张图 | AI 生成這張圖 | Generate with AI | Tạo bằng AI |
| aig/menu | AI 生成 | AI 生成 | Generate with AI | Tạo bằng AI |
| aig/title | AI 生成 · {name} | AI 生成 · {name} | AI · {name} | AI · {name} |
| aig/close | 关闭 | 關閉 | Close | Đóng |
| aig/target | 生成哪张 | 生成哪張 | Image | Ảnh |
| aig/scope-one | 只这一个 · {name} | 只這一個 · {name} | Just this · {name} | Chỉ cái này · {name} |
| aig/scope-set | 整套 · {n} 个 | 整套 · {n} 個 | Whole set · {n} | Cả bộ · {n} |
| aig/style | 款式 | 款式 | Style | Phong cách |
| aig/prompt-ph | 描述你想要的样子，或上传参考图让 AI 帮你写 | 描述你想要的樣子，或上傳參考圖讓 AI 幫你寫 | Describe the look, or upload a reference and let AI write it | Mô tả kiểu bạn muốn, hoặc tải ảnh mẫu để AI viết giúp |
| aig/prompt-ref | 提示词由 AI 看参考图写出，可以再改 | 提示詞由 AI 看參考圖寫出，可以再改 | AI wrote this from your reference — edit as you like | AI viết từ ảnh mẫu, bạn có thể sửa |
| aig/prompt-replaced | 已按新款式改写提示词 | 已按新款式改寫提示詞 | Prompt rewritten for this style | Đã viết lại theo phong cách mới |
| aig/prompt-undo | 还原 | 還原 | Restore | Khôi phục |
| aig/count-spec | {n} 张 · {w}×{h} | {n} 張 · {w}×{h} | {n} · {w}×{h} | {n} ảnh · {w}×{h} |
| aig/send-tip | 本次约消耗 ✦{n} | 本次約消耗 ✦{n} | Uses about ✦{n} | Tốn khoảng ✦{n} |
| aig/low | 余额不足 · 去充值 | 餘額不足 · 去儲值 | Not enough credits · Top up | Không đủ điểm · Nạp thêm |
| aig/generating | 正在生成 {n} 张… {p}% | 正在生成 {n} 張… {p}% | Generating {n}… {p}% | Đang tạo {n} ảnh… {p}% |
| aig/cands | 候选 · 挑一张 | 候選 · 挑一張 | Pick one | Chọn một ảnh |
| aig/best | 最贴合 | 最貼合 | Best match | Hợp nhất |
| aig/use | 使用 | 使用 | Use | Dùng |
| aig/use-all | 全部使用 | 全部使用 | Use all | Dùng tất cả |
| aig/again | 再生成 ✦{n} | 再生成 ✦{n} | Again ✦{n} | Tạo lại ✦{n} |
| aig/cancel | 取消 | 取消 | Cancel | Hủy |
| aig/failed | 生成失败，没有扣点 | 生成失敗，沒有扣點 | Generation failed — no credits used | Tạo thất bại, không trừ điểm |
| aig/retry | 重试 ✦{n} | 重試 ✦{n} | Retry ✦{n} | Thử lại ✦{n} |
| aig/sample | 样板 · {name} | 樣板 · {name} | Sample · {name} | Mẫu · {name} |
| aig/rest | 按这个款式生成其余 {m} 个 ✦{x} | 按這個款式生成其餘 {m} 個 ✦{x} | Make the other {m} in this style ✦{x} | Tạo {m} cái còn lại theo kiểu này ✦{x} |
| aig/redo | 重做 ✦{n} | 重做 ✦{n} | Redo ✦{n} | Làm lại ✦{n} |
| aig/fill | 补齐失败的 {f} 个 ✦{x} | 補齊失敗的 {f} 個 ✦{x} | Redo {f} failed ✦{x} | Tạo lại {f} ảnh lỗi ✦{x} |
| aig/confirm-title | 生成 {name}？ | 生成 {name}？ | Generate {name}? | Tạo {name}? |
| aig/confirm-body | {n} 个入口 · {k} 张图，本次消耗约 ✦{x} | {n} 個入口 · {k} 張圖，本次消耗約 ✦{x} | {n} items · {k} images, about ✦{x} | {n} mục · {k} ảnh, khoảng ✦{x} |
| aig/used | 已换上 AI {name} | 已換上 AI {name} | AI {name} applied | Đã dùng {name} AI |
| aig/cancelled | 已取消，只扣了已生成的 {n} 张 | 已取消，只扣了已生成的 {n} 張 | Cancelled — charged for {n} finished | Đã hủy, chỉ trừ {n} ảnh đã tạo |
| aig/vs-line / vs-fill / vs-duo / vs-grad | 4 条矢量款式提示词 | 同左繁体 | same in en | same in vi |

可以复用、不需要新建的键：`ed/tbai-<st>`（款式名）、`model/gpt-desc`、`model/gemini-desc`、`composer/ref-slot`、`composer/empty-hint`、`ed/tbai-analyzing`、`confirm/*`、`rec/partial`、`mp/required`、`mp/ai-all`、`mp/ai-none`。
统一后不再使用、可以删除的键：`ed/ai-kw-1..8`、`ed/ai-style-title`、`ed/keep-current`（仅 AI 处）、`ed/tbai-mode`、`ed/tbai-m-*`、`ed/tbai-ref-up`、`ed/tbai-prompt`、`ed/tbai-sprompt-tip`、`ed/tbai-busy`、`ed/tbai-title`、`ed/tbai-target`、`ed/bal-ai-note`、`mp/ai-gen-sample`、`rec/redo-sample-cost`（仅 AI 处）。删除前先用 grep 确认没有其他引用。

---

## 6. 各模块对照表（适配器要实现的内容）

各适配器的 `cost` 都是单次发送的价格，数量就是候选数量。「使用写入」一列沿用现在真实的写法，保证功能不变。

| 模块 | 目标（targets） | 规格 | 款式 | 数量 | 点数 | 生成（generate，保持现有资源/算法） | 使用写入 E.D（apply，都在 commit 里） |
|---|---|---|---|---|---|---|---|
| banner | 「第 N 张轮播图」（默认是当前这一张，有多张时用下拉切换） | `BANNER[size]`：large 1500×680、general 1020×300、medium 1020×300、small 320×202；PC 画布为 1920×564 | 5 款，其中光泽 / 黑金 / 喜庆 / 霓虹使用 `assets/ai-banner/*.webp` 作为预览图 | general/medium 4，large/small 3（`candBase()`） | 20 | `candList` + `candScore`（原来按关键词排序，改为按款式 + 提示词 + 参考图排序） | `setAsset('slide'+i, {f,w,h})`，并加入 projAssets |
| topbar | Logo、币种、搜索、侧边栏入口（只有开启 side 时才显示）、余额框币种（只在已登录且余额框开启时显示） | Logo 宽 330–600×100（显示 230×76）；币种 36×36；搜索 56×49；侧边栏入口 48×48；余额框币种 52×52 | 5 款 | Logo 4；图标 4（同一款式的 4 种色调 / 相邻款式变体） | 每个目标 20；范围「整套」= 币种 + 搜索（+ 侧边栏入口）= 40 / 60 | Logo 用 `LOGO_AI_F` 滤镜按轮次轮换；图标用 `assets/ai-tb/{cur,search}-<st>.png`，侧边栏入口用 `SIDE_AI(st)` | Logo：`tb.logoF=f; tbFitSet('logo',null)`；图标：`tbIconSet('cur'/'search', path)`、`tbIconSet('side','img:'+…)`；余额框币种：`balSet(b=>b.curImg=path)` |
| midnav（帐户栏） | 入口图标（每个入口一个，范围可选只这一个 / 整套）；帐户布局下还有余额框币种 | 57×50；余额框币种 52×52 | 5 款 + 4 种矢量 | 单个 4；整套是样板 4 张加其余每个 1 张 | 20 / 每个入口 20 | `styleSrc / candSrc`（modpanels），余额框币种同 topbar | `items[i][f]=src`（沿用 iaAdopt）；余额框币种同 topbar |
| notice | 入口图标（喇叭、信箱） | 喇叭 36×32、信箱 57×50（`NT_SPEC`） | 同上 | 同上 | 20 | 同上 | `items[i].img`；信箱 `defOn` 时同时写 `imgOn`（沿用 iaAdopt） |
| gamemenu | 分类图标（范围可选）；按钮底图（只在 style=side 时出现，未选 / 选中两张一起生成） | 分类图标：side 58×44，icons/tabs 100×76；按钮底图 150×70 ×2 | 5 款（+ 分类图标多 4 种矢量） | 分类图标 4；按钮底图 4 组 | 20 | 分类图标同上；底图用 `gmBtnSvg(style, on, primary)` | 分类图标：`items[i][f]`；底图：`m.btnOff/btnSel=gmBtnSvg(...)`，并删除 `ec['gamemenu.bg' / 'gamemenu.active']` |
| gamecards | 封面兜底图、收藏星（未选 / 选中两张一起） | 260×260；36×36 ×2 | 5 款 | 4 | **10**（保持现价，待业主确认是否统一为 20） | `gcFbSvg / gcStarSvg(style, on, primary)` | 兜底图：`m.fallback=…; m.fallbackOn=true`；收藏星：`m.starOff/starSel=…; m.fav=true` |
| bottomnav | 入口图标（未选 / 选中两张，范围可选） | 50×50（`bnSpec`） | 5 款 + 4 种矢量 | 同 midnav | 每个入口 20（两张图） | 同上 | `items[i].img / imgOn` |
| sidebar（新增，可选） | 入口图标 | 60×60 | 同上 | 同上 | 20 | 复用 icon 适配器（`modTitle` 补上 sidebar） | `items[i].img` |
| jackpot / footer / 侧边栏头图 | 不提供 AI | — | — | — | — | — | — |

各模块的默认目标（工具条 ✦ AI 打开时选中哪个）：banner 选当前这张；topbar 选 Logo；notice / midnav / bottomnav / gamemenu 选整套入口图标；gamecards 选兜底图。

---

## 7. 跟「AI 一键设计」的边界

- **工具条「AI · 10」（adMod，重新生成整个模块的样式 / 配色）** 不是生成图片，不放进这个面板。改名为「换样式 · ✦10」，图标改成 `shuffle`，跟 ✦ AI 区分开。点击后先弹确认（`costConfirm`，✦10），这样「所有花点数的 AI 都会先说价钱」这条规则对它也成立。手机标题栏上的 ✦ 图标也换成 `shuffle`。
- Banner 工具条以后只有一个 ✦ AI（图片）按钮和一个「换样式」按钮，不会再出现两个都叫 AI 的按钮。

---

## 8. 跟进建议（本次不做）

- 首页 composer：参考图上传后也做反推提示词（跟编辑器保持一致），或者明确保留首页只把参考图当图片使用。这需要业主决定。
- AI 一键设计（AD-03）面板：把「补充描述 + 上传效果图」合并成顶部的 `.c-box`，生成按钮改为 send pill（✦50，并保留确认框）。
- `aidesign.js` 里的 modelBody 改为复用 `AIG.modelMenu()`。

---

## 9. 需要业主确认的点

1. 余额框币种原来是**免费、点一下就用**，统一后改成跟其他目标一样走生成流程，收 ✦20、出 4 张候选。如果想保留免费，可以把它改成款式卡下方的「直接套用预设」小链接，但这样就破坏了统一。**建议：统一收费。**
2. 游戏卡片目前是 ✦10，其他都是 ✦20，是否统一为 ✦20。
3. 单个图标从原来出 1 张结果改为出 4 张候选，价格不变（✦20）。
4. 工具条「AI · 10」改名为「换样式 · ✦10」，并且加一步确认。

---

# 实施计划

## A. 新文件 `prototype/js/aigen.js`：`window.AIG` 共享渲染器

加载顺序：放在 `core.js / editor.js` 之后、`modpanels.js` 之前（或者放在 modpanels 之后，只要渲染时 `AIG.reg` 已经注册好即可）。同时要在 `build-single.py` 的脚本列表和 `index.html` 里加上它。

```js
window.AIG = {
  reg(mod, adapter),            // 注册适配器
  open(mod, target, {idx, scope}),
  close(),
  isOpen(mod),                  // 给 editor.modulePanel 判断是否切换到 AIG 面板
  panel(),                      // 返回整块面板 HTML（桌面和手机共用）
  composer(opts),               // 纯函数：根据 {refSt, refAct, prompt, ph, busy, analyzing, model, chips, cost, disabled} 输出 .c-box 的 HTML，供首页 / AD 以后复用
  modelPill(model, act), modelMenu(model),
  state(),                      // E.aig[mod]
};
```

适配器接口（每个模块一个）：

```js
{
  name: (tg, idx) => 'Banner 第 2 张',
  targets: () => [{ id, label, kind: 'image'|'icon'|'pair', spec: [w, h], count, cost, scopeable }],
  defaultTarget: () => id,
  styles: (tg) => [{ id, label, preview }],   // 默认 AIG.STYLES5，图标类多 4 种矢量
  preset: (tg, style) => '提示词',              // 默认 window.aiPreset
  entries: (tg) => [{ i, name, req, pics }],    // 只有 scopeable 才需要
  generate: (job) => [cand...] ,                // 同步返回候选（模拟），由 AIG 统一负责延时、失败、扣点
  score: (cands, st) => bestIndex,              // 可选
  preview: (cand) => void,                      // 可选：画布实时预览
  apply: (cands, st) => void,                   // 只写 E.D，AIG 会在外面包上 commit
  payTag: 'banner'|'iconset'|…                  // 传给 pay() 的统计标签
}
```

AIG 统一负责的部分：

- 状态 `E.aig = { mod, tg, idx, scope, style, prompt, dirty, prevPrompt, model, refSt, analyzing, fromRef, stage, cands, pick, rows, tok, pct }`。
- 引用 `refPick / refUpload / aiRefRead`、`afford / pay / fail / takeFail`、`costConfirm / lowBalance`、`notice()`、`toast + undoOpt`、`projAssets`。
- 生成节奏：单张 1.4s，整套每个入口 320ms；进度百分比每 200ms 更新一次。
- 动作统一用 `data-act="aig*"`：`aigOpen aigClose aigTarget aigScope aigStyle aigRefPick/Rm/Cancel/View aigModel aigSend aigPick aigUse aigAgain aigRetry aigCancel aigRest aigRedo aigFill aigPromptUndo aigEntry aigAll`，再加上 `I.aigPrompt`（不重新渲染，只切换发送键的 `.is-disabled`）。
- 键盘：Esc 关闭；在输入框里按 Ctrl/⌘+Enter 发送。
- AFTER_RENDER：打开后滚动到面板顶部（解决 375 宽度下标题被顶部 tabs 遮住的问题），并让输入框获得焦点。

## B. CSS（`css/editor.css`，在原有 `.tbai-box` 后面追加 `.aig-*`）

`.aig-hd`、`.aig-styles`（5 列，复用 `.tbai-opt` 的视觉，图标类 9 张时自动换行）、`.aig-box`（= `.c-box.tbai-box`，去掉卡片套卡片）、`.aig-res`、`.aig-grid.is-c2/.is-c4`、`.aig-cand`（复用 `.cand` 的 is-on / best / skeleton / is-fail）、`.aig-list`（整套列表）、`.aig-acts`（主 / 次 / 文字三种按钮）。手机端操作行放在弹层底部（`position: sticky; bottom: 0`），只在列表模式时强制 `.is-tall`。

## C. 逐模块迁移（每一步做完都要构建 + 跑回归）

1. **先做 AIG 骨架 + Banner 适配器**：`modulePanel()` 里 `E.ai` 的分支改为判断 `AIG.isOpen('banner')`。`openAi` 改为 `AIG.open('banner', 'slide'+cur)`。删掉 `aiPanel / aiKw / KW_ST`，`candScore` 改为按款式打分。顺便修好 PC 上的规格问题（适配器读 `E.device==='pc'` 时用 1920×564），并删除 `pc.js` 里的 `CAND_F / slideF` 预览滤镜。
2. **topbar 适配器**：把 Logo、图标、余额框币种合成一个适配器。删掉 `tbAiSec / tbLogoSec / bx-ai`，以及 `tbAiJump / tbLogoAiOpen / balCurAi` 这几个入口（改为调用 `AIG.open('topbar', tg)`）。行尾 ✦ 和 ⋯ 菜单统一指向 AIG。删除旧 CSS：`.tbai-drop/.tbai-ref/.tbai-an/.tbai-pbox/.tblogo/.bx-ai*`（注意 gmBai 也用了 `.tblogo`，要同一步一起迁移，或者先把样式改名再删）。
3. **icon 适配器**（notice / midnav / gamemenu 分类 / bottomnav / 可选 sidebar）：`iaOpen / iaOpenOne` 改成 `AIG.open(b, 'icons', {idx, scope})`。把样板 → 其余 → 列表这套流程移到 AIG 的 scope=set 分支。`iaRedo` 改为重做这个入口的全部状态图。在 notice / midnav / gamemenu 的入口行补上 ✦。删除 `MP.aiPanel` 和 `.ia-foot` 固定底栏。
4. **gamemenu 按钮底图、gamecards 适配器**：作为同一模块的附加目标接进来（gamemenu 的 targets = 分类图标 + 按钮底图）。删除 `gmBaiSec / gcAiSec` 和对应的状态。
5. **工具条**：`selToolbar` 只保留一个 ✦ AI（调用 `AIG.open(mod)`，只对有适配器的模块显示）。adMod 改为「换样式」：换图标、改文案，并在 `adMod` 开头加上 `costConfirm`。手机模块标题栏同步修改。
6. **i18n**：在 `js/i18n-editor.js` 末尾加上 `aig/*`（4 种语言），删除已废弃的键。跑一遍 i18n 完整性检查，确认每个键都是 4 项。
7. **文档**：完成后在 `docs/remaining-work.md` 里把这一项标记完成，截图放到 `docs/screenshots/ai-unified-*`。

## D. 验收（Playwright 用 file:// 打开 dist，分别在 1440 和 375 宽度下测）

- 对每个模块的每个目标：从行尾 ✦、⋯ 菜单、工具条三个入口打开，标题都是「AI 生成 · {name}」，结构一致（截图对比）。
- 流程：上传参考图后提示词被反推，并自动选中款式；点款式会改写提示词，并出现「还原」；清空提示词后发送键禁用，点击有抖动提示；发送后出现骨架和进度，然后出候选，默认选中最贴合的一张；点「使用」后 E.D 写入正确、面板关闭、toast 可以撤销，撤销后 E.D 恢复。
- 失败（提示词里写「失败」或 takeFail）：出现失败格和「没有扣点」，余额不变；点重试后成功。
- 扣点：≤ ✦20 时不弹确认，> ✦20 时弹 costConfirm；余额不足时弹 lowBalance；整套取消时只扣已完成的张数。
- 关闭后再打开，候选还在；素材库里能看到「AI · …」。
- 回归脚本 `t-cl.js` 仍然输出 3 行，并以 `broken [] []` 结尾；页面没有 pageerror。
