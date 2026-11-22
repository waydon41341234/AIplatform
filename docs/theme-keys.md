# 68 个颜色 Key

权威来源：`docs/source/色值Key绑定规范.md`；代码：`shared/theme/keys.ts`；测试：`tests/theme.test.ts`。

## 结构

- **11 个基础色**（业主输入）：primary, lead, neutral_1, neutral_2, neutral_3, border, bg_1, bg_2, accent_1, accent_2, accent_3
- **57 个规则 Key**：
  - `ref`：引用另一个 Key，可带透明度（border99 → 153/255；20% → 0.2，保留 alpha，不与白色混合）
  - `fixed`：固定 HEX，可为 #RRGGBBAA（阴影色）
  - `design`：跟设计（home_bg, home_db, btmnav_def, btmnav_active, bs_topnav_bg, web_bs_yj_bg, web_btmnav_db），值由版式或业主给
  - `cond`：条件规则（profile_icon_1–4 按“有底/无底”；cards_text 按“欧美/经典”卡片）

## 三层设置

| 层 | 存在哪 | 谁改 |
| --- | --- | --- |
| 默认规则 | `EXT_KEYS[k].rule` | 公司规范，代码里 |
| 版式跟设计值 | `theme.designValues` | 换版式时写入 |
| 业主覆盖 | `theme.overrides` | 编辑器“改这个用途的颜色”；“恢复默认”删除覆盖 |

## 元素绑定

元素（如 `bottomnav.def`）绑定到一个 Key。优先级：业主绑定 > 版式 `defaultBindings` > `MODULE_ELEMENTS` 的 `defaultKey`。
`locked: true` 表示“保持此颜色用途关联”：不能换 Key（需先解锁），换版式不受影响，但 Key 的颜色变化照常联动。

## 输出

- `theme.json`：每个 Key 的默认规则、当前规则、来源、中文描述、解析结果；每个元素的绑定与锁定状态。
- SVG：每个上色图形带 `data-element` 与 `data-key`，同时写入解析后的颜色。
- Figma（待做）：基础色/固定色/覆盖 → Color Variables；引用 → 变量别名；条件规则 → 组件变体或模式。
