# AI 生图提示词记录

本文记录本项目到目前为止用过的全部 AI 生图提示词，中英文对照。

- **工具**：Figma `generate_image`（Figma AI），生成的图用作原型素材（图标、Banner、Logo）。部分条目指定了模型，已在条目里注明；未注明的用默认模型。
- **规则**：以后每次新生成图片，都要把提示词追加到本文，中英文对照。「中文」是译文，方便阅读；「English」是实际提交的原文，照抄不改。
- **时间**：马来西亚时间（Asia/Kuala_Lumpur，UTC+8）。**尺寸**：生成时请求的宽 × 高（px）。
- **产出路径**：`prototype/assets/…` 是仓库里原型用的图；`ai-icons/…` 是项目文件夹 `custom-design-platform/ai-icons/` 里的切图原图。11-26 的生成原图也在 Figma「09 AI 图标草稿」(340:2)。
- 完全相同的提示词只列一次，并注明「×N 次」。

| 日期 | 用途 | 条数 | 尺寸 |
| --- | --- | --- | --- |
| 11-26 | 顶部栏图标 | 1 | 2048×1024 |
| 11-26 | 公告栏图标 | 1 | 2048×1024 |
| 11-26 | 中部导航图标 | 1 | 2048×1536 |
| 11-26 | 底部导航图标 | 1 | 2048×2048 |
| 11-26 | 游戏分类图标 | 5 | 1280×768 |
| 11-26 | Banner 通用风格 | 4 | 2040×600 |
| 11-26 | 节日 Banner（无字底图） | 6 | 2040×600 |
| 11-26 | 节日 Banner（AI 直出标题文字） | 6 | 2040×600 |
| 11-26 | Logo | 6 | 1536×512 |
| 11-26 | 小 Banner | 3 | 1024×646 |
| 11-26 | 大 Banner 1500×680 | 3 | 1500×680 |
| 11-27 | Banner 主题 | 6 | 2048×928 |
| | **合计** | **43** | |

---

## 2026-11-26

### 顶部栏图标

一张总图出 2 行 × 5 列，按列切成 5 种默认风格：glossy 光泽卡通 3D / flat 扁平 / blackgold 黑金 / festive 喜庆中国红 / neon 赛博霓虹（下面各类图标同此顺序）。

#### 顶部栏图标 · 搜索 + 币种（5 风格）

- 尺寸 2048×1024 · 时间 2026-11-26 12:49
- 产出：`prototype/assets/ai-tb/search-{glossy,flat,blackgold,festive,neon}.png`、`cur-{glossy,flat,blackgold,festive,neon}.png`（第 1–5 列依次为 glossy / flat / blackgold / festive / neon）；切图原图 `ai-icons/topbar/`，预览 `ai-icons/topbar/预览.png`

**中文**

纯白背景上的图标精灵图：2 行 × 5 列的手机 App 顶部栏图标，在网格中均匀排布，每个图标在格内居中并留足内边距，不要文字、不要标签。上排：放大镜搜索图标。下排：带 ¥ 日元符号的圆形硬币图标。每一列的两个图标为同一种风格。第 1 列：光泽卡通 3D，亮蓝 #1678FF 渐变放大镜，带白色镜面高光；橙黄 #FFAA09 金币配白色 ¥。第 2 列：扁平极简纯色，圆角线条的蓝色放大镜，橙色硬币配白色 ¥，无渐变。第 3 列：黑金奢华，拉丝香槟金金属放大镜配深色镜片，香槟金浮雕硬币带细密边齿。第 4 列：喜庆中国红 #E83A30，金色描边，点缀小祥云，3D 卡通。第 5 列：赛博霓虹，青蓝色发光描边放大镜配深色半透明镜片，紫蓝霓虹发光硬币配发光的 ¥。干净、清晰锐利、尺寸统一，游戏 App UI 图标风格。

**English**

```text
An icon sprite sheet on a pure white background: 2 rows by 5 columns of mobile app top-bar icons, evenly spaced on a grid, each icon centered in its cell with generous padding, no text, no labels. Top row: magnifying glass search icons. Bottom row: round coin icons with a ¥ yen symbol. Each column is one matching style for both icons. Column 1: glossy cartoon 3D, bright blue #1678FF gradient magnifier with white glass highlight, orange-yellow #FFAA09 gold coin with white ¥. Column 2: flat minimal solid color, blue magnifier with rounded strokes, orange coin with white ¥, no gradient. Column 3: black-gold luxury, brushed champagne gold metal magnifier with dark lens, champagne gold embossed coin with fine milled edge. Column 4: festive Chinese red #E83A30 with gold outline and small auspicious cloud accents, 3D cartoon. Column 5: cyber neon, cyan-blue glowing outline magnifier with dark translucent lens, purple-blue neon glowing coin with glowing ¥. Clean, crisp, consistent sizes, game app UI icon style.
```

### 公告栏图标

公告模组的喇叭和站内信入口图标。

#### 公告栏图标 · 喇叭 + 站内信（5 风格）

- 尺寸 2048×1024 · 时间 2026-11-26 13:22
- 产出：`prototype/assets/ai-notice/spk-{glossy,flat,blackgold,festive,neon}.webp`、`mail-{glossy,flat,blackgold,festive,neon}.webp`；切图原图 `ai-icons/ai-notice/`（总图 `ai-notice-sheet.png`）

**中文**

图标精灵图，透明背景，2 行 × 5 列，网格均匀排布，每个图标居中并留足内边距，不要文字、不要标签、不要白色外发光。上排：喇叭 / 扩音器公告图标。下排：信封（站内信收件箱）图标。每一列的两个图标为同一种风格。第 1 列：光泽卡通 3D，亮蓝 #1678FF 渐变，带白色高光。第 2 列：扁平极简，纯蓝 #1678FF 配橙色 #FFAA09 点缀，无渐变。第 3 列：拉丝香槟金金属，奢华，深色点缀。第 4 列：喜庆中国红 #E83A30 配金色描边，点缀小祥云，3D 卡通。第 5 列：深色半透明主体配青紫霓虹发光描边，赛博风格。手机游戏 App UI 图标风格，清晰锐利，尺寸统一。

**English**

```text
Icon sprite sheet, transparent background, 2 rows by 5 columns, evenly spaced grid, each icon centered with generous padding, no text, no labels, no white glow. Top row: loudspeaker / megaphone announcement icons. Bottom row: envelope mail inbox icons. Each column is one matching style for both icons. Column 1: glossy cartoon 3D, bright blue #1678FF gradient with white highlight. Column 2: flat minimal solid blue #1678FF with orange #FFAA09 accent, no gradient. Column 3: brushed champagne gold metal, luxurious, dark accents. Column 4: festive Chinese red #E83A30 with gold outline, small auspicious cloud accent, 3D cartoon. Column 5: cyan-purple neon glowing outline on dark translucent body, cyber style. Mobile game app UI icon style, crisp, consistent sizes.
```

### 中部导航图标

中部导航（midnav）4 个入口图标。

#### 中部导航图标 · 存款 / VIP / 分享 / 更多（5 风格）

- 尺寸 2048×1536 · 时间 2026-11-26 13:22
- 产出：`prototype/assets/ai-acct/{dep,vip,share,more}-{glossy,flat,blackgold,festive,neon}.webp`（第 1–4 行依次为 dep 存钱罐 / vip / share / more）；切图原图 `ai-icons/ai-acct/`（总图 `ai-acct-sheet.png`）

**中文**

图标精灵图，透明背景，4 行 × 5 列，网格均匀排布，每个图标居中并留足内边距，不要文字、不要标签、不要白色外发光。第 1 行：存钱罐（储蓄）图标。第 2 行：VIP 皇冠徽章盾牌图标。第 3 行：一群人（分享 / 推荐）图标。第 4 行：四宫格「更多」菜单图标。每一列是一种风格，用于该列所有行。第 1 列：光泽卡通 3D，亮蓝 #1678FF 渐变，带白色高光。第 2 列：扁平极简，纯蓝 #1678FF 配橙色 #FFAA09 点缀，无渐变。第 3 列：拉丝香槟金金属，奢华。第 4 列：喜庆中国红 #E83A30 配金色描边，3D 卡通。第 5 列：深色半透明主体配青紫霓虹发光描边。手机游戏 App UI 图标，清晰锐利，尺寸统一。

**English**

```text
Icon sprite sheet, transparent background, 4 rows by 5 columns, evenly spaced grid, each icon centered with generous padding, no text, no labels, no white glow. Row 1: piggy bank savings icon. Row 2: VIP crown badge shield icon. Row 3: group of people sharing / referral icon. Row 4: four-square grid "more" menu icon. Each column is one style applied to all rows. Column 1: glossy cartoon 3D, bright blue #1678FF gradient with white highlights. Column 2: flat minimal solid blue #1678FF with orange #FFAA09 accent, no gradient. Column 3: brushed champagne gold metal, luxurious. Column 4: festive Chinese red #E83A30 with gold outline, 3D cartoon. Column 5: cyan-purple neon glowing outline on dark translucent body. Mobile game app UI icons, crisp, consistent sizes.
```

### 底部导航图标

底部导航 5 个入口图标。

#### 底部导航图标 · 首页 / 优惠 / 分享赚 / 注册 / 我的（5 风格）

- 尺寸 2048×2048 · 时间 2026-11-26 13:22
- 产出：`prototype/assets/ai-bnav/{home,promo,bonus,invite,mine}-{glossy,flat,blackgold,festive,neon}.webp`（第 1–5 行依次对应）；`-off` 未选中灰态为后期处理，无单独提示词；切图原图 `ai-icons/ai-bnav/`（总图 `ai-bnav-sheet.png`）

**中文**

图标精灵图，透明背景，5 行 × 5 列，网格均匀排布，每个图标居中并留足内边距，不要文字、不要标签、不要白色外发光。第 1 行：房子（首页）图标。第 2 行：礼盒（优惠活动）图标。第 3 行：装着金币的大圆礼盒（分享赚钱），比其他图标略大。第 4 行：带加号的人像（注册）图标。第 5 行：人像头像（我的账户）图标。每一列是一种风格，用于该列所有行。第 1 列：光泽卡通 3D，亮蓝 #1678FF 渐变，白色高光。第 2 列：扁平极简，纯蓝 #1678FF 配橙色 #FFAA09 点缀，无渐变。第 3 列：拉丝香槟金金属，奢华。第 4 列：喜庆中国红 #E83A30 配金色描边，3D 卡通。第 5 列：深色半透明主体配青紫霓虹发光描边。手机游戏 App 底部导航图标，清晰锐利，尺寸统一。

**English**

```text
Icon sprite sheet, transparent background, 5 rows by 5 columns, evenly spaced grid, each icon centered with generous padding, no text, no labels, no white glow. Row 1: house home icon. Row 2: gift box promotion icon. Row 3: big round gift box with gold coins (share and earn), slightly larger. Row 4: person with plus sign (register) icon. Row 5: person profile (my account) icon. Each column is one style for all rows. Column 1: glossy cartoon 3D, bright blue #1678FF gradient, white highlights. Column 2: flat minimal solid blue #1678FF with orange #FFAA09 accent, no gradient. Column 3: brushed champagne gold metal, luxurious. Column 4: festive Chinese red #E83A30 with gold outline, 3D cartoon. Column 5: cyan-purple neon glowing outline on dark translucent body. Mobile game app bottom navigation icons, crisp, consistent sizes.
```

### 游戏分类图标

每种风格一张 5 × 3 总图，切成 13 个游戏分类图标。

#### 游戏分类图标 · 光泽卡通 3D（glossy）

- 尺寸 1280×768 · 时间 2026-11-26 13:26
- 产出：`prototype/assets/ai-gm/g1-glossy.webp` … `g13-glossy.webp`（按网格从左到右、从上到下编号：g1 热门 … g13 试玩）；切图原图 `ai-icons/ai-gm/`（总图 `ai-gm-sheet.png`）

**中文**

图标精灵图，完全透明背景，严格的 5 列 × 3 行网格，共 13 个独立的游戏分类图标，每个图标在格内居中，彼此之间留足空白，不要文字、不要标签、不要背景、不要地面投影。所有图标统一风格：光泽卡通 3D，亮蓝 #1678FF 渐变主体，带白色高光和少量橙黄 #FFAA09 点缀，干净明亮。第 1 行从左到右：火焰（热门）、叠放的扑克牌（棋牌）、鱼（捕鱼）、老虎机（电子）、区块链方块。第 2 行：带人像剪影的赌场荷官筹码（真人）、足球（体育）、彩票球（彩票）、游戏手柄（电竞）、公鸡（斗鸡）。第 3 行：带箭头的时钟（最近）、爱心（收藏）、播放按钮（试玩）。第 3 行最后两格留空。

**English**

```text
Icon sprite sheet on a fully transparent background, a strict grid of 5 columns x 3 rows, 13 separate game-category icons, each centered in its cell with generous empty space between them, no text, no labels, no background, no shadows on the ground. Style for ALL icons: glossy cartoon 3D, bright blue #1678FF gradient body with white highlights and small orange-yellow #FFAA09 accents, clean and bright. Row 1 left to right: flame (hot), stacked playing cards (card games), fish (fishing), slot machine (slots), blockchain cube. Row 2: casino dealer chip with person silhouette (live casino), soccer ball (sports), lottery ball (lottery), game controller (esports), rooster (cockfight). Row 3: clock with arrow (recent), heart (favorites), play button (demo). Last two cells of row 3 empty.
```

#### 游戏分类图标 · 扁平（flat）

- 尺寸 1280×768 · 时间 2026-11-26 13:26
- 产出：`prototype/assets/ai-gm/g1-flat.webp` … `g13-flat.webp`（按网格从左到右、从上到下编号：g1 热门 … g13 试玩）；切图原图 `ai-icons/ai-gm/`（总图 `ai-gm-sheet.png`）

**中文**

图标精灵图，完全透明背景，严格的 5 列 × 3 行网格，共 13 个独立的游戏分类图标，每个图标在格内居中，彼此之间留足空白，不要文字、不要标签、不要背景。所有图标统一风格：扁平纯色矢量图标，纯蓝 #1678FF 形状，每个图标带一处橙色 #FFAA09 点缀，无渐变、无描边、圆角、极简。第 1 行从左到右：火焰（热门）、叠放的扑克牌（棋牌）、鱼（捕鱼）、老虎机（电子）、区块链方块。第 2 行：带人像剪影的赌场筹码（真人）、足球（体育）、彩票球（彩票）、游戏手柄（电竞）、公鸡（斗鸡）。第 3 行：带箭头的时钟（最近）、爱心（收藏）、播放按钮（试玩）。第 3 行最后两格留空。

**English**

```text
Icon sprite sheet on a fully transparent background, a strict grid of 5 columns x 3 rows, 13 separate game-category icons, each centered in its cell with generous empty space between them, no text, no labels, no background. Style for ALL icons: flat solid vector icons, solid blue #1678FF shapes with one orange #FFAA09 accent part each, no gradient, no outline, rounded corners, minimal. Row 1 left to right: flame (hot), stacked playing cards (card games), fish (fishing), slot machine (slots), blockchain cube. Row 2: casino chip with person silhouette (live casino), soccer ball (sports), lottery ball (lottery), game controller (esports), rooster (cockfight). Row 3: clock with arrow (recent), heart (favorites), play button (demo). Last two cells of row 3 empty.
```

#### 游戏分类图标 · 黑金（blackgold）

- 尺寸 1280×768 · 时间 2026-11-26 13:26
- 产出：`prototype/assets/ai-gm/g1-blackgold.webp` … `g13-blackgold.webp`（按网格从左到右、从上到下编号：g1 热门 … g13 试玩）；切图原图 `ai-icons/ai-gm/`（总图 `ai-gm-sheet.png`）

**中文**

图标精灵图，完全透明背景，严格的 5 列 × 3 行网格，共 13 个独立的游戏分类图标，每个图标在格内居中，彼此之间留足空白，不要文字、不要标签、不要背景。所有图标统一风格：奢华的拉丝香槟金金属 3D，配黑色点缀，浮雕细节，高级黑金赌场风格。第 1 行从左到右：火焰（热门）、叠放的扑克牌（棋牌）、鱼（捕鱼）、老虎机（电子）、区块链方块。第 2 行：带人像剪影的赌场筹码（真人）、足球（体育）、彩票球（彩票）、游戏手柄（电竞）、公鸡（斗鸡）。第 3 行：带箭头的时钟（最近）、爱心（收藏）、播放按钮（试玩）。第 3 行最后两格留空。

**English**

```text
Icon sprite sheet on a fully transparent background, a strict grid of 5 columns x 3 rows, 13 separate game-category icons, each centered in its cell with generous empty space between them, no text, no labels, no background. Style for ALL icons: luxurious brushed champagne-gold metal 3D with black accents, embossed details, premium black-gold casino style. Row 1 left to right: flame (hot), stacked playing cards (card games), fish (fishing), slot machine (slots), blockchain cube. Row 2: casino chip with person silhouette (live casino), soccer ball (sports), lottery ball (lottery), game controller (esports), rooster (cockfight). Row 3: clock with arrow (recent), heart (favorites), play button (demo). Last two cells of row 3 empty.
```

#### 游戏分类图标 · 喜庆中国红（festive）

- 尺寸 1280×768 · 时间 2026-11-26 13:26
- 产出：`prototype/assets/ai-gm/g1-festive.webp` … `g13-festive.webp`（按网格从左到右、从上到下编号：g1 热门 … g13 试玩）；切图原图 `ai-icons/ai-gm/`（总图 `ai-gm-sheet.png`）

**中文**

图标精灵图，完全透明背景，严格的 5 列 × 3 行网格，共 13 个独立的游戏分类图标，每个图标在格内居中，彼此之间留足空白，不要文字、不要标签、不要背景。所有图标统一风格：喜庆中国新年 3D 卡通，中国红 #E83A30 主体，配亮金色描边和金色小祥云装饰。第 1 行从左到右：火焰（热门）、叠放的扑克牌（棋牌）、鱼（捕鱼）、老虎机（电子）、区块链方块。第 2 行：带人像剪影的赌场筹码（真人）、足球（体育）、彩票球（彩票）、游戏手柄（电竞）、公鸡（斗鸡）。第 3 行：带箭头的时钟（最近）、爱心（收藏）、播放按钮（试玩）。第 3 行最后两格留空。

**English**

```text
Icon sprite sheet on a fully transparent background, a strict grid of 5 columns x 3 rows, 13 separate game-category icons, each centered in its cell with generous empty space between them, no text, no labels, no background. Style for ALL icons: festive Chinese New Year 3D cartoon, Chinese red #E83A30 bodies with shiny gold outlines and small gold auspicious cloud decorations. Row 1 left to right: flame (hot), stacked playing cards (card games), fish (fishing), slot machine (slots), blockchain cube. Row 2: casino chip with person silhouette (live casino), soccer ball (sports), lottery ball (lottery), game controller (esports), rooster (cockfight). Row 3: clock with arrow (recent), heart (favorites), play button (demo). Last two cells of row 3 empty.
```

#### 游戏分类图标 · 赛博霓虹（neon）

- 尺寸 1280×768 · 时间 2026-11-26 13:26
- 产出：`prototype/assets/ai-gm/g1-neon.webp` … `g13-neon.webp`（按网格从左到右、从上到下编号：g1 热门 … g13 试玩）；切图原图 `ai-icons/ai-gm/`（总图 `ai-gm-sheet.png`）

**中文**

图标精灵图，完全透明背景，严格的 5 列 × 3 行网格，共 13 个独立的游戏分类图标，每个图标在格内居中，彼此之间留足空白，不要文字、不要标签、不要背景、不要白色外发光。所有图标统一风格：赛博霓虹，青色与紫色霓虹发光描边，深海军蓝半透明主体。第 1 行从左到右：火焰（热门）、叠放的扑克牌（棋牌）、鱼（捕鱼）、老虎机（电子）、区块链方块。第 2 行：带人像剪影的赌场筹码（真人）、足球（体育）、彩票球（彩票）、游戏手柄（电竞）、公鸡（斗鸡）。第 3 行：带箭头的时钟（最近）、爱心（收藏）、播放按钮（试玩）。第 3 行最后两格留空。

**English**

```text
Icon sprite sheet on a fully transparent background, a strict grid of 5 columns x 3 rows, 13 separate game-category icons, each centered in its cell with generous empty space between them, no text, no labels, no background, no outer white glow. Style for ALL icons: cyber neon, glowing cyan and purple neon outlines with dark navy translucent bodies. Row 1 left to right: flame (hot), stacked playing cards (card games), fish (fishing), slot machine (slots), blockchain cube. Row 2: casino chip with person silhouette (live casino), soccer ball (sports), lottery ball (lottery), game controller (esports), rooster (cockfight). Row 3: clock with arrow (recent), heart (favorites), play button (demo). Last two cells of row 3 empty.
```

### Banner 通用风格

2040×600 无字底图，左侧留空，原型里叠 HTML 文字；对应 4 种默认风格。

#### Banner 通用风格 · 亮蓝光泽（glossy）

- 尺寸 2040×600 · 时间 2026-11-26 13:36
- 产出：`prototype/assets/ai-banner/glossy.webp`；原图 `ai-icons/ai-banner/glossy.png`

**中文**

宽幅手机游戏大厅宣传 Banner 背景，亮蓝 #1678FF 光泽风格，右侧是 3D 卡通金币、扑克牌、一座闪亮的奖杯和飞舞的彩纸，柔和光束，左侧三分之一留出干净的空白放标题文字，不要文字、不要字母、不要 Logo、不要人物，鲜艳且高级。

**English**

```text
Wide mobile game-lobby promotional banner background, bright blue #1678FF glossy style, 3D cartoon gold coins, playing cards, a shiny trophy and confetti flying on the right side, soft light rays, clean empty space on the left third for headline text, no text, no letters, no logos, no people, vibrant and premium
```

#### Banner 通用风格 · 黑金（blackgold）

- 尺寸 2040×600 · 时间 2026-11-26 13:36
- 产出：`prototype/assets/ai-banner/blackgold.webp`；原图 `ai-icons/ai-banner/blackgold.png`

**中文**

宽幅手机游戏大厅宣传 Banner 背景，奢华的黑色与香槟金风格，黑色大理石背景，右侧是叠放的金色赌场筹码、金色骰子和一顶金色皇冠，伴有闪烁粒子，优雅的金色线框，左侧三分之一留空放标题文字，不要文字、不要字母、不要 Logo、不要人物。

**English**

```text
Wide mobile game-lobby promotional banner background, luxurious black and champagne-gold style, black marble backdrop, stacked gold casino chips, gold dice and a golden crown on the right side with sparkling particles, elegant gold line frame, empty space on the left third for headline text, no text, no letters, no logos, no people
```

#### Banner 通用风格 · 喜庆中国红（festive）

- 尺寸 2040×600 · 时间 2026-11-26 13:36
- 产出：`prototype/assets/ai-banner/festive.webp`；原图 `ai-icons/ai-banner/festive.png`

**中文**

宽幅手机游戏大厅宣传 Banner 背景，喜庆中国新年风格，中国红 #E83A30 背景配金色祥云纹样，右侧是红包、金元宝和灯笼，金币飘落，左侧三分之一留空放标题文字，不要文字、不要字母、不要 Logo、不要人物。

**English**

```text
Wide mobile game-lobby promotional banner background, festive Chinese New Year style, Chinese red #E83A30 backdrop with gold auspicious cloud patterns, red envelopes, gold ingots and lanterns on the right side, falling gold coins, empty space on the left third for headline text, no text, no letters, no logos, no people
```

#### Banner 通用风格 · 赛博霓虹（neon）

- 尺寸 2040×600 · 时间 2026-11-26 13:36
- 产出：`prototype/assets/ai-banner/neon.webp`；原图 `ai-icons/ai-banner/neon.png`

**中文**

宽幅手机游戏大厅宣传 Banner 背景，赛博霓虹风格，深海军蓝背景配发光的青色与紫色霓虹网格，右侧是霓虹游戏手柄和霓虹老虎机转轴，光线拖尾，左侧三分之一留空放标题文字，不要文字、不要字母、不要 Logo、不要人物。

**English**

```text
Wide mobile game-lobby promotional banner background, cyber neon style, dark navy backdrop with glowing cyan and purple neon grid, a neon game controller and neon slot-machine reels on the right side, light streaks, empty space on the left third for headline text, no text, no letters, no logos, no people
```

### 节日 Banner（无字底图）

先出无字底图，在原型里叠 HTML 标题 / 副标题 / 按钮；随后改用下一节让 AI 直接画出文字的版本。

#### 节日 Banner · 春节（无字底图）

- 尺寸 2040×600 · 时间 2026-11-26 14:34
- 产出：未单独留存文件（原型里的 `fest-*` 现为下一节带标题文字的版本）；叠 HTML 文字的效果预览 `ai-icons/ai-banner/節日Banner預覽.png`；原图见 Figma 09 AI 图标草稿 (340:2)

**中文**

中国春节（农历新年）主题的宽幅手机游戏大厅宣传 Banner 背景：深红背景，金色烟花、红灯笼、福字红包、金元宝，以及右侧一只身穿节日盛装的可爱 3D 小马吉祥物，梅花点缀，左侧三分之一留空放标题文字，不要文字、不要字母、不要 Logo、不要人物，明亮高级的 3D 插画。

**English**

```text
Wide mobile game-lobby promotional banner background for Chinese Spring Festival (Lunar New Year): deep red backdrop, golden fireworks, red lanterns, fu-style red envelopes, gold ingots and a cute 3D horse mascot in festive outfit on the right side, plum blossoms, empty space on the left third for headline text, no text, no letters, no logos, no people, bright premium 3D illustration
```

#### 节日 Banner · 元宵（无字底图）

- 尺寸 2040×600 · 时间 2026-11-26 14:34
- 产出：未单独留存文件（原型里的 `fest-*` 现为下一节带标题文字的版本）；叠 HTML 文字的效果预览 `ai-icons/ai-banner/節日Banner預覽.png`；原图见 Figma 09 AI 图标草稿 (340:2)

**中文**

元宵节主题的宽幅手机游戏大厅宣传 Banner 背景：深紫蓝色夜空，许多发光的漂浮纸灯笼，右侧是一碗汤圆和金币，温暖的光斑虚化，左侧三分之一留空放标题文字，不要文字、不要字母、不要 Logo、不要人物，高级 3D 插画。

**English**

```text
Wide mobile game-lobby promotional banner background for the Lantern Festival: night sky in deep purple-blue, many glowing floating paper lanterns, a bowl of sweet rice dumplings (tangyuan) and gold coins on the right side, warm light bokeh, empty space on the left third for headline text, no text, no letters, no logos, no people, premium 3D illustration
```

#### 节日 Banner · 端午（无字底图）

- 尺寸 2040×600 · 时间 2026-11-26 14:35
- 产出：未单独留存文件（原型里的 `fest-*` 现为下一节带标题文字的版本）；叠 HTML 文字的效果预览 `ai-icons/ai-banner/節日Banner預覽.png`；原图见 Figma 09 AI 图标草稿 (340:2)

**中文**

端午节主题的宽幅手机游戏大厅宣传 Banner 背景：清新的绿色与青绿色河景，右侧是一艘带鼓的彩色 3D 龙舟、竹叶、粽子和金币，水花飞溅，左侧三分之一留空放标题文字，不要文字、不要字母、不要 Logo、不要人物，高级 3D 插画。

**English**

```text
Wide mobile game-lobby promotional banner background for the Dragon Boat Festival: fresh green and teal river scene, a colorful 3D dragon boat with drums, bamboo leaves and zongzi rice dumplings with gold coins on the right side, splashing water, empty space on the left third for headline text, no text, no letters, no logos, no people, premium 3D illustration
```

#### 节日 Banner · 中秋（无字底图）

- 尺寸 2040×600 · 时间 2026-11-26 14:35
- 产出：未单独留存文件（原型里的 `fest-*` 现为下一节带标题文字的版本）；叠 HTML 文字的效果预览 `ai-icons/ai-banner/節日Banner預覽.png`；原图见 Figma 09 AI 图标草稿 (340:2)

**中文**

中秋节主题的宽幅手机游戏大厅宣传 Banner 背景：深海军蓝夜空中一轮巨大的发光金色满月，右侧是桂花枝、一只可爱的 3D 玉兔、精美的月饼和金币，柔和的云朵，左侧三分之一留空放标题文字，不要文字、不要字母、不要 Logo、不要人物，高级 3D 插画。

**English**

```text
Wide mobile game-lobby promotional banner background for the Mid-Autumn Festival: deep navy night with a huge glowing golden full moon, osmanthus branches, a cute 3D jade rabbit, ornate mooncakes and gold coins on the right side, soft clouds, empty space on the left third for headline text, no text, no letters, no logos, no people, premium 3D illustration
```

#### 节日 Banner · 圣诞（无字底图）

- 尺寸 2040×600 · 时间 2026-11-26 14:35
- 产出：未单独留存文件（原型里的 `fest-*` 现为下一节带标题文字的版本）；叠 HTML 文字的效果预览 `ai-icons/ai-banner/節日Banner預覽.png`；原图见 Figma 09 AI 图标草稿 (340:2)

**中文**

圣诞节主题的宽幅手机游戏大厅宣传 Banner 背景：红绿雪景，右侧是装饰好的圣诞树、包装好的礼盒、拐杖糖、金币和闪烁的雪花，温暖的光斑灯光，左侧三分之一留空放标题文字，不要文字、不要字母、不要 Logo、不要人物，高级 3D 插画。

**English**

```text
Wide mobile game-lobby promotional banner background for Christmas: snowy red and green scene, decorated Christmas tree, wrapped gift boxes, candy canes, gold coins and sparkling snowflakes on the right side, warm bokeh lights, empty space on the left third for headline text, no text, no letters, no logos, no people, premium 3D illustration
```

#### 节日 Banner · 跨年（无字底图）

- 尺寸 2040×600 · 时间 2026-11-26 14:35
- 产出：未单独留存文件（原型里的 `fest-*` 现为下一节带标题文字的版本）；叠 HTML 文字的效果预览 `ai-icons/ai-banner/節日Banner預覽.png`；原图见 Figma 09 AI 图标草稿 (340:2)

**中文**

跨年夜倒数主题的宽幅手机游戏大厅宣传 Banner 背景：深邃的午夜蓝夜空，五彩烟花，右侧是金色和银色气球、香槟杯、彩纸、一只发光的时钟和金币，左侧三分之一留空放标题文字，不要文字、不要字母、不要数字、不要 Logo、不要人物，高级 3D 插画。

**English**

```text
Wide mobile game-lobby promotional banner background for New Year's Eve countdown: dark midnight blue sky with colorful fireworks, gold and silver balloons, champagne glasses, confetti, a glowing clock and gold coins on the right side, empty space on the left third for headline text, no text, no letters, no numbers, no logos, no people, premium 3D illustration
```

### 节日 Banner（AI 直出标题文字）

同六个节日，指定模型让 AI 直接画出中文标题、副标题和按钮。

#### 节日 Banner · 春节「新春红包雨」

- 尺寸 2040×600 · 时间 2026-11-26 14:46 · 模型 `gpt-image-2.5-sunburst`
- 产出：`prototype/assets/ai-banner/fest-spring.webp`；原图 `ai-icons/ai-banner/fest-spring.png`；六张合并预览 `ai-icons/ai-banner/節日Banner-AI文案預覽.png`

**中文**

宽幅手机游戏宣传 Banner，中国春节主题。左侧：醒目时尚的大号 3D 中文标题，文字准确为 "新春红包雨"，光泽金属金色毛笔风字体，带红色描边和发光；其下是较小的白色粗体文字，准确为 "天天领红包 最高8888元"；再下面是一个圆角橙金色按钮，深红色文字准确为 "立即领取"。右侧：身穿节日盛装的可爱 3D 小马吉祥物、红包、金元宝、灯笼、烟花、梅花，深红色背景。所有汉字必须是正确的简体中文，清晰锐利、可辨认。高端博彩游戏广告风格。

**English**

```text
Wide mobile game promotional banner, Chinese Spring Festival theme. Left side: large stylish 3D Chinese title text exactly "新春红包雨" in glossy gold metallic brush-style lettering with red outline and glow, below it smaller white bold text exactly "天天领红包 最高8888元", below that a rounded orange-gold button with dark red text exactly "立即领取". Right side: cute 3D horse mascot in festive outfit, red envelopes, gold ingots, lanterns, fireworks, plum blossoms on deep red background. All Chinese characters must be correct Simplified Chinese, crisp and legible. Premium casino-game advertising style.
```

#### 节日 Banner · 元宵「元宵闹花灯」

- 尺寸 2040×600 · 时间 2026-11-26 14:46 · 模型 `gpt-image-2.5-sunburst`
- 产出：`prototype/assets/ai-banner/fest-lantern.webp`；原图 `ai-icons/ai-banner/fest-lantern.png`；六张合并预览 `ai-icons/ai-banner/節日Banner-AI文案預覽.png`

**中文**

宽幅手机游戏宣传 Banner，元宵节主题。左侧：醒目时尚的大号 3D 中文标题，文字准确为 "元宵闹花灯"，发光的金属金色书法字体，带暖橙色光晕；其下是较小的白色粗体文字，准确为 "猜灯谜 好礼送不停"；再下面是一个圆角橙金色按钮，深红色文字准确为 "立即参与"。右侧：一碗汤圆、金币，以及许多漂浮在紫色夜色水乡小镇上空的发光灯笼。所有汉字必须是正确的简体中文，清晰锐利、可辨认。高端博彩游戏广告风格。

**English**

```text
Wide mobile game promotional banner, Lantern Festival theme. Left side: large stylish 3D Chinese title text exactly "元宵闹花灯" in glowing gold metallic calligraphy lettering with warm orange glow, below it smaller white bold text exactly "猜灯谜 好礼送不停", below that a rounded orange-gold button with dark red text exactly "立即参与". Right side: bowl of tangyuan, gold coins, many floating glowing lanterns over a purple night river town. All Chinese characters must be correct Simplified Chinese, crisp and legible. Premium casino-game advertising style.
```

#### 节日 Banner · 端午「端午龙舟赛」

- 尺寸 2040×600 · 时间 2026-11-26 14:46 · 模型 `gpt-image-2.5-sunburst`
- 产出：`prototype/assets/ai-banner/fest-dragonboat.webp`；原图 `ai-icons/ai-banner/fest-dragonboat.png`；六张合并预览 `ai-icons/ai-banner/節日Banner-AI文案預覽.png`

**中文**

宽幅手机游戏宣传 Banner，端午节主题。左侧：醒目时尚的大号 3D 中文标题，文字准确为 "端午龙舟赛"，红金双色的动感粗体毛笔字，带白色描边和水花；其下是浅色底上的较小深绿色粗体文字，准确为 "划龙舟 赢粽享豪礼"；再下面是一个圆角橙金色按钮，深红色文字准确为 "立即参与"。右侧：在飞溅的青绿色水面上竞渡的彩色龙舟、粽子、竹叶、金币。所有汉字必须是正确的简体中文，清晰锐利、可辨认。高端博彩游戏广告风格。

**English**

```text
Wide mobile game promotional banner, Dragon Boat Festival theme. Left side: large stylish 3D Chinese title text exactly "端午龙舟赛" in bold red and gold dynamic brush lettering with white outline and water splash, below it smaller dark green bold text on light background exactly "划龙舟 赢粽享豪礼", below that a rounded orange-gold button with dark red text exactly "立即参与". Right side: colorful dragon boat racing through splashing teal water, zongzi rice dumplings, bamboo leaves, gold coins. All Chinese characters must be correct Simplified Chinese, crisp and legible. Premium casino-game advertising style.
```

#### 节日 Banner · 中秋「中秋花好月圆」

- 尺寸 2040×600 · 时间 2026-11-26 14:46 · 模型 `gpt-image-2.5-sunburst`
- 产出：`prototype/assets/ai-banner/fest-midautumn.webp`；原图 `ai-icons/ai-banner/fest-midautumn.png`；六张合并预览 `ai-icons/ai-banner/節日Banner-AI文案預覽.png`

**中文**

宽幅手机游戏宣传 Banner，中秋节主题。左侧：优雅的大号 3D 中文标题，文字准确为 "中秋花好月圆"，闪亮的金属金色书法字体，带柔和的月光光晕；其下是较小的白色粗体文字，准确为 "月圆人团圆 彩金加倍送"；再下面是一个圆角橙金色按钮，深红色文字准确为 "立即领取"。右侧：深海军蓝夜空中巨大的金色满月、玉兔、精美的月饼、桂花、金币。所有汉字必须是正确的简体中文，清晰锐利、可辨认。高端博彩游戏广告风格。

**English**

```text
Wide mobile game promotional banner, Mid-Autumn Festival theme. Left side: large elegant 3D Chinese title text exactly "中秋花好月圆" in shining gold metallic calligraphy lettering with soft moonlight glow, below it smaller white bold text exactly "月圆人团圆 彩金加倍送", below that a rounded orange-gold button with dark red text exactly "立即领取". Right side: huge golden full moon, jade rabbit, ornate mooncakes, osmanthus flowers, gold coins on deep navy night sky. All Chinese characters must be correct Simplified Chinese, crisp and legible. Premium casino-game advertising style.
```

#### 节日 Banner · 圣诞「圣诞狂欢夜」

- 尺寸 2040×600 · 时间 2026-11-26 14:46 · 模型 `gpt-image-2.5-sunburst`
- 产出：`prototype/assets/ai-banner/fest-xmas.webp`；原图 `ai-icons/ai-banner/fest-xmas.png`；六张合并预览 `ai-icons/ai-banner/節日Banner-AI文案預覽.png`

**中文**

宽幅手机游戏宣传 Banner，圣诞节主题。左侧：俏皮的大号 3D 中文标题，文字准确为 "圣诞狂欢夜"，光泽白金双色字体，字顶覆雪并带红色光晕；其下是较小的白色粗体文字，准确为 "圣诞礼盒 天天开奖"；再下面是一个圆角橙金色按钮，深红色文字准确为 "立即领取"。右侧：装饰好的圣诞树、红绿礼盒、拐杖糖、金币、雪花，暖红色光斑背景。所有汉字必须是正确的简体中文，清晰锐利、可辨认。高端博彩游戏广告风格。

**English**

```text
Wide mobile game promotional banner, Christmas theme. Left side: large playful 3D Chinese title text exactly "圣诞狂欢夜" in glossy white and gold lettering with snow on top and red glow, below it smaller white bold text exactly "圣诞礼盒 天天开奖", below that a rounded orange-gold button with dark red text exactly "立即领取". Right side: decorated Christmas tree, red and green gift boxes, candy canes, gold coins, snow, on warm red bokeh background. All Chinese characters must be correct Simplified Chinese, crisp and legible. Premium casino-game advertising style.
```

#### 节日 Banner · 跨年「跨年倒数狂欢」

- 尺寸 2040×600 · 时间 2026-11-26 14:46 · 模型 `gpt-image-2.5-sunburst`
- 产出：`prototype/assets/ai-banner/fest-newyear.webp`；原图 `ai-icons/ai-banner/fest-newyear.png`；六张合并预览 `ai-icons/ai-banner/節日Banner-AI文案預覽.png`

**中文**

宽幅手机游戏宣传 Banner，跨年夜倒数主题。左侧：炫目的大号 3D 中文标题，文字准确为 "跨年倒数狂欢"，闪亮的金属金色字体，带闪光和紫蓝霓虹光晕；其下是较小的白色粗体文字，准确为 "新年首存 加赠100%"；再下面是一个圆角橙金色按钮，深红色文字准确为 "立即参与"。右侧：指针接近午夜的金色时钟、香槟杯、金色和银色气球、成摞的金币、城市夜景天际线上空的烟花。所有汉字必须是正确的简体中文，清晰锐利、可辨认。高端博彩游戏广告风格。

**English**

```text
Wide mobile game promotional banner, New Year's Eve countdown theme. Left side: large dazzling 3D Chinese title text exactly "跨年倒数狂欢" in shiny gold metallic lettering with sparkle and purple-blue neon glow, below it smaller white bold text exactly "新年首存 加赠100%", below that a rounded orange-gold button with dark red text exactly "立即参与". Right side: golden clock near midnight, champagne glasses, gold and silver balloons, stacks of gold coins, fireworks over a night city skyline. All Chinese characters must be correct Simplified Chinese, crisp and legible. Premium casino-game advertising style.
```

### Logo

6 个虚构品牌的横版 Logo，透明背景。

#### Logo · STAR GAMING（蓝色盾牌）

- 尺寸 1536×512 · 时间 2026-11-26 14:59 · 模型 `gpt-image-2.5-sunburst`
- 产出：`prototype/assets/ai-logo/star-gaming.png`；原图 `ai-icons/ai-logo/star-gaming.png`；合并预览 `ai-icons/ai-logo/Logo預覽.png`

**中文**

横版游戏网站 Logo，完全透明背景，无背景色。左侧：光泽 3D 蓝色 #1678FF 圆角盾牌徽标，中间一颗白色五角星。右侧：粗体文字标，文字准确为 "STAR GAMING"，深海军蓝色；下方一行较小的灰色文字，准确为 "www.star88.com"。干净、锐利、接近矢量的边缘，居中，留足内边距，小尺寸下也清晰可读。

**English**

```text
Horizontal game website logo on a fully transparent background, no background color. Left: glossy 3D blue #1678FF rounded shield emblem with a white star. Right: bold wordmark exactly "STAR GAMING" in deep navy with a smaller line below exactly "www.star88.com" in gray. Clean, crisp vector-like edges, centered, generous padding, legible at small size.
```

#### Logo · ROYAL 88（黑金皇冠）

- 尺寸 1536×512 · 时间 2026-11-26 14:59 · 模型 `gpt-image-2.5-sunburst`
- 产出：`prototype/assets/ai-logo/royal88.png`；原图 `ai-icons/ai-logo/royal88.png`；合并预览 `ai-icons/ai-logo/Logo預覽.png`

**中文**

横版奢华游戏网站 Logo，完全透明背景，无背景色。左侧：拉丝香槟金金属皇冠徽标，配黑色点缀。右侧：优雅的衬线文字标，文字准确为 "ROYAL 88"，金属金色渐变；下方一行较小的金色文字，准确为 "PREMIUM CASINO"。边缘锐利，居中，留足内边距，小尺寸下也清晰可读。

**English**

```text
Horizontal luxury game website logo on a fully transparent background, no background color. Left: brushed champagne-gold metallic crown emblem with black accents. Right: elegant serif wordmark exactly "ROYAL 88" in gold metallic gradient with a smaller line below exactly "PREMIUM CASINO" in gold. Crisp edges, centered, generous padding, legible at small size.
```

#### Logo · 鸿运娱乐（红金祥云）

- 尺寸 1536×512 · 时间 2026-11-26 14:59 · 模型 `gpt-image-2.5-sunburst`
- 产出：`prototype/assets/ai-logo/hongyun.png`；原图 `ai-icons/ai-logo/hongyun.png`；合并预览 `ai-icons/ai-logo/Logo預覽.png`

**中文**

横版喜庆游戏网站 Logo，完全透明背景，无背景色。左侧：红金配色的圆形徽标，内含金色祥云和金币。右侧：粗体 3D 中文文字标，文字准确为 "鸿运娱乐"，红色配金色描边；下方一行较小的金色文字，准确为 "HONGYUN GAMES"。所有汉字为正确的简体中文，边缘锐利，居中，留足内边距。

**English**

```text
Horizontal festive game website logo on a fully transparent background, no background color. Left: round red and gold emblem with a golden auspicious cloud and gold coin. Right: bold 3D Chinese wordmark exactly "鸿运娱乐" in red with gold outline, with a smaller line below exactly "HONGYUN GAMES" in gold. All Chinese characters correct Simplified Chinese, crisp edges, centered, generous padding.
```

#### Logo · NEON PLAY（赛博霓虹手柄）

- 尺寸 1536×512 · 时间 2026-11-26 14:59 · 模型 `gpt-image-2.5-sunburst`
- 产出：`prototype/assets/ai-logo/neon-play.png`；原图 `ai-icons/ai-logo/neon-play.png`；合并预览 `ai-icons/ai-logo/Logo預覽.png`

**中文**

横版赛博风游戏网站 Logo，完全透明背景，无背景色，不要白色外发光。左侧：青紫霓虹游戏手柄徽标，带发光描边。右侧：未来感文字标，文字准确为 "NEON PLAY"，青到紫的霓虹光晕；下方一行较小的青色文字，准确为 "ESPORTS · SLOTS"。清晰锐利，居中，留足内边距，小尺寸下也清晰可读。

**English**

```text
Horizontal cyber game website logo on a fully transparent background, no background color, no outer white glow. Left: neon cyan and purple game controller emblem with glowing outline. Right: futuristic wordmark exactly "NEON PLAY" with cyan-to-purple neon glow, smaller line below exactly "ESPORTS · SLOTS" in cyan. Crisp, centered, generous padding, legible at small size.
```

#### Logo · 星河体育（绿蓝足球）

- 尺寸 1536×512 · 时间 2026-11-26 14:59 · 模型 `gpt-image-2.5-sunburst`
- 产出：`prototype/assets/ai-logo/xinghe.png`；原图 `ai-icons/ai-logo/xinghe.png`；合并预览 `ai-icons/ai-logo/Logo預覽.png`

**中文**

横版体育网站 Logo，完全透明背景，无背景色。左侧：动感徽标，一只足球外绕绿色 #18B566 与蓝色的弧线轨道。右侧：粗斜体中文文字标，文字准确为 "星河体育"，深蓝色；下方一行较小的绿色文字，准确为 "XINGHE SPORTS"。所有汉字为正确的简体中文，边缘锐利，居中，留足内边距。

**English**

```text
Horizontal sports website logo on a fully transparent background, no background color. Left: dynamic emblem of a soccer ball with a swoosh orbit in green #18B566 and blue. Right: bold italic Chinese wordmark exactly "星河体育" in deep blue, with a smaller line below exactly "XINGHE SPORTS" in green. All Chinese characters correct Simplified Chinese, crisp edges, centered, generous padding.
```

#### Logo · LUCKY GEM（紫粉宝石）

- 尺寸 1536×512 · 时间 2026-11-26 14:59 · 模型 `gpt-image-2.5-sunburst`
- 产出：`prototype/assets/ai-logo/lucky-gem.png`；原图 `ai-icons/ai-logo/lucky-gem.png`；合并预览 `ai-icons/ai-logo/Logo預覽.png`

**中文**

横版游戏网站 Logo，完全透明背景，无背景色。左侧：多切面的紫粉色 3D 宝石徽标，带闪光。右侧：圆润的粗体文字标，文字准确为 "LUCKY GEM"，紫到洋红渐变；下方一行较小的灰色文字，准确为 "www.luckygem.com"。边缘锐利，居中，留足内边距，小尺寸下也清晰可读。

**English**

```text
Horizontal game website logo on a fully transparent background, no background color. Left: faceted purple and pink 3D gemstone emblem with sparkle. Right: rounded bold wordmark exactly "LUCKY GEM" in purple-to-magenta gradient, smaller line below exactly "www.luckygem.com" in gray. Crisp edges, centered, generous padding, legible at small size.
```

### 小 Banner

用于小 Banner（160×101，一排 3 张）；原型里存为 640×404。

#### 小 Banner · 蓝色「首充送100%」

- 尺寸 1024×646 · 时间 2026-11-26 15:07
- 产出：`prototype/assets/ai-banner/small-1.webp`；副本 `ai-icons/ai-banner/small-1.webp`

**中文**

手机游戏网站的小号宣传 Banner 卡片，光泽蓝色渐变背景，右侧一个闪亮的 3D 礼盒，金币从中迸出，左侧是醒目的大号中文标题 "首充送100%"，白字金边，干净、高对比，极小尺寸下也能看清，不要其他文字，构图圆润，满版出血。

**English**

```text
Small promotional banner card for a mobile gaming site, glossy blue gradient background, a shiny 3D gift box with gold coins bursting out on the right, bold large Chinese headline "首充送100%" in white with gold outline on the left, clean, high contrast, readable at very small size, no other text, rounded composition, full-bleed
```

#### 小 Banner · 黑金「VIP 晉級禮」

- 尺寸 1024×646 · 时间 2026-11-26 15:07
- 产出：`prototype/assets/ai-banner/small-2.webp`；副本 `ai-icons/ai-banner/small-2.webp`

**中文**

手机游戏网站的小号宣传 Banner 卡片，奢华的黑金背景，右侧一座发光的金色奖杯，带闪光，左侧是醒目的大号中文标题 "VIP 晉級禮"（原文即为繁体），金属金色字，干净、高对比，极小尺寸下也能看清，不要其他文字，满版出血。

**English**

```text
Small promotional banner card for a mobile gaming site, luxurious black and gold background, a glowing golden trophy cup with sparkles on the right, bold large Chinese headline "VIP 晉級禮" in gold metallic lettering on the left, clean, high contrast, readable at very small size, no other text, full-bleed
```

#### 小 Banner · 红橙「每日紅包」

- 尺寸 1024×646 · 时间 2026-11-26 15:07
- 产出：`prototype/assets/ai-banner/small-3.webp`；副本 `ai-icons/ai-banner/small-3.webp`

**中文**

手机游戏网站的小号宣传 Banner 卡片，喜庆的红橙渐变背景，右侧一个红包配金币和彩纸，左侧是醒目的大号中文标题 "每日紅包"（原文即为繁体），白字黄边，干净、高对比，极小尺寸下也能看清，不要其他文字，满版出血。

**English**

```text
Small promotional banner card for a mobile gaming site, festive red and orange gradient background, a red envelope (hongbao) with gold coins and confetti on the right, bold large Chinese headline "每日紅包" in white with yellow outline on the left, clean, high contrast, readable at very small size, no other text, full-bleed
```

### 大 Banner 1500×680

用于大 Banner（750×340，配 1500×680 图）。

#### 大 Banner · 蓝色真人

- 尺寸 1500×680 · 时间 2026-11-26 15:17
- 产出：`prototype/assets/ai-banner/large-1.webp`；副本 `ai-icons/ai-banner/large-1.webp`；尺寸预览 `ai-icons/ai-banner/Banner尺寸預覽.png`

**中文**

宽幅手机赌场首页主视觉 Banner，光泽鲜艳的蓝色渐变配光线拖尾，右侧是一位身穿修身蓝色礼服、手持扑克牌的自信年轻女荷官，扑克筹码和金币飞舞，左侧是醒目的大号中文标题 "真人娛樂 百萬獎金"，白字金边，其下是较小的副标题 "首存即送 豪禮等你拿"（标题与副标题原文均为繁体），精致高级的游戏广告风格，满版出血，无边框。

**English**

```text
Wide mobile casino homepage hero banner, glossy vivid blue gradient with light streaks, a confident young woman dealer in a sleek blue dress on the right holding playing cards, poker chips and gold coins flying, bold large Chinese headline "真人娛樂 百萬獎金" in white with gold edge on the left, smaller subtitle "首存即送 豪禮等你拿" below it, premium polished game-ad style, full-bleed, no borders
```

#### 大 Banner · 黑金

- 尺寸 1500×680 · 时间 2026-11-26 15:17
- 产出：`prototype/assets/ai-banner/large-2.webp`；副本 `ai-icons/ai-banner/large-2.webp`；尺寸预览 `ai-icons/ai-banner/Banner尺寸預覽.png`

**中文**

宽幅手机游戏首页主视觉 Banner，奢华黑金主题，右侧是金色老虎机和迸发的发光彩金金币，左侧是醒目的大号中文标题 "黑金尊享 VIP 返水"，闪亮的金属金色字，其下是较小的白色副标题 "每日返水最高 1.5%"，精致高级的游戏广告风格，满版出血，无边框。

**English**

```text
Wide mobile gaming homepage hero banner, luxurious black and gold theme, golden slot machine and glowing jackpot coins exploding on the right, bold large Chinese headline "黑金尊享 VIP 返水" in shiny gold metallic letters on the left, smaller subtitle "每日返水最高 1.5%" in white below, premium polished game-ad style, full-bleed, no borders
```

#### 大 Banner · 绿色体育

- 尺寸 1500×680 · 时间 2026-11-26 15:17
- 产出：`prototype/assets/ai-banner/large-3.webp`；副本 `ai-icons/ai-banner/large-3.webp`；尺寸预览 `ai-icons/ai-banner/Banner尺寸預覽.png`

**中文**

宽幅手机体育投注首页主视觉 Banner，动感的绿色球场配霓虹青色光轨，右侧一名足球运动员正踢出一颗发光的球，左侧是醒目的大号中文标题 "體育賽事 天天加碼"，白字带青色光晕，其下是较小的副标题 "串關獎金最高翻倍"（标题与副标题原文均为繁体），精致高级的游戏广告风格，满版出血，无边框。

**English**

```text
Wide mobile sports betting homepage hero banner, dynamic green stadium and neon cyan light trails, a football player kicking a glowing ball on the right, bold large Chinese headline "體育賽事 天天加碼" in white with cyan glow on the left, smaller subtitle "串關獎金最高翻倍" below, premium polished game-ad style, full-bleed, no borders
```

---

## 2026-11-27

### Banner 主题

Banner 的 6 个主题底图（节日 / 宣传 / 推广（邀请）/ 奖励 / 新人 / 赛事），2048×928 生成，原型里存为 1020×462；`-th` 缩略图为后期缩放，无单独提示词。左侧 45% 留空叠文字，提示词都要求不出现文字、Logo、品牌和人物（不用真实品牌）。

#### Banner 主题 · 节日

- 尺寸 2048×928 · 时间 2026-11-27 09:04
- 产出：`prototype/assets/ai-banner/theme-festival.webp`（缩略图 `theme-festival-th.webp`）

**中文**

面向线上体育与娱乐场平台的宽幅网站主视觉 Banner，节日庆典主题。浓郁的红金配色，右侧以发光的纸灯笼、绽放的金色烟花、系金丝带的红色礼盒和散落的金币作为主视觉。左侧 45% 是干净、柔光的红色渐变区，留空放大标题。精致的 3D 渲染，高端商业广告品质，电影感光效。不要文字、不要字母、不要 Logo、不要品牌、不要人物。

**English**

```text
Wide website hero banner for an online sports and casino entertainment platform, festive holiday celebration theme. Rich red and gold palette, glowing paper lanterns, golden fireworks bursting, red gift boxes with gold ribbons and scattered gold coins on the right side as the main visual. The left 45% is a clean, softly lit red gradient area left empty for a large headline. Polished 3D render, premium commercial advertising quality, cinematic lighting. No text, no letters, no logos, no brands, no people.
```

#### Banner 主题 · 宣传

- 尺寸 2048×928 · 时间 2026-11-27 09:04
- 产出：`prototype/assets/ai-banner/theme-brand.webp`（缩略图 `theme-brand-th.webp`）

**中文**

面向线上体育娱乐平台的宽幅网站主视觉 Banner，品牌宣传主题。深海军蓝背景配电光蓝光线拖尾，以及亮着泛光灯的夜间体育场，右侧以一座闪耀的金色奖杯配足球和篮球作为主视觉。左侧 45% 是干净的深蓝渐变区，留空放品牌口号。精致的 3D 渲染，高端、专业、电影感。不要文字、不要字母、不要 Logo、不要品牌、不要人物。

**English**

```text
Wide website hero banner for an online sports entertainment platform, brand promotion theme. Deep navy blue background with electric blue light streaks and a dramatic night stadium with floodlights, a shining golden trophy with a football and basketball on the right side as the main visual. The left 45% is a clean dark blue gradient area left empty for a brand slogan. Polished 3D render, premium, professional, cinematic. No text, no letters, no logos, no brands, no people.
```

#### Banner 主题 · 推广（邀请）

- 尺寸 2048×928 · 时间 2026-11-27 09:04
- 产出：`prototype/assets/ai-banner/theme-referral.webp`（缩略图 `theme-referral-th.webp`）

**中文**

面向线上娱乐平台的宽幅网站主视觉 Banner，邀请好友推荐计划主题。紫到蓝渐变背景，右侧以一部悬浮的智能手机作为主视觉：发光连线把它与一个个小圆形头像气泡相连（抽象剪影，不画脸），金币和佣金闪光在它们之间流动。左侧 45% 是干净的渐变区，留空放标题。精致的 3D 渲染，现代、鲜活，高端广告感。不要文字、不要字母、不要 Logo、不要品牌、不要真人。

**English**

```text
Wide website hero banner for an online entertainment platform, invite-friends referral program theme. Purple to blue gradient background, a floating smartphone with glowing connection lines linking small round avatar bubbles (abstract silhouettes, no faces), gold coins and commission sparkles flowing between them on the right side as the main visual. The left 45% is a clean gradient area left empty for a headline. Polished 3D render, modern, vibrant, premium advertising. No text, no letters, no logos, no brands, no real people.
```

#### Banner 主题 · 奖励

- 尺寸 2048×928 · 时间 2026-11-27 09:04
- 产出：`prototype/assets/ai-banner/theme-reward.webp`（缩略图 `theme-reward-th.webp`）

**中文**

面向线上体育与娱乐场平台的宽幅网站主视觉 Banner，奖金奖励主题。深绯红与金色配色，右侧以一只打开的宝箱作为主视觉：满溢发光的金币，红包和宝石带着闪光飞出。左侧 45% 是干净的深色渐变区，留空放醒目的奖金金额标题。精致的 3D 渲染，奢华、激动人心，高端商业品质。不要文字、不要字母、不要数字、不要 Logo、不要品牌、不要人物。

**English**

```text
Wide website hero banner for an online sports and casino entertainment platform, bonus rewards theme. Dark crimson and gold palette, an open treasure chest overflowing with glowing gold coins, red envelopes and gems flying out with sparkles on the right side as the main visual. The left 45% is a clean dark gradient area left empty for a big bonus amount headline. Polished 3D render, luxurious, exciting, premium commercial quality. No text, no letters, no numbers, no logos, no brands, no people.
```

#### Banner 主题 · 新人

- 尺寸 2048×928 · 时间 2026-11-27 09:04
- 产出：`prototype/assets/ai-banner/theme-newbie.webp`（缩略图 `theme-newbie-th.webp`）

**中文**

面向线上娱乐平台的宽幅网站主视觉 Banner，新会员欢迎首存奖金主题。明亮的青色与蓝绿色渐变背景，右侧以一个正在打开、彩纸与丝带飞出的大号光泽礼盒，一枚闪亮的 VIP 徽章和漂浮的金币作为主视觉。左侧 45% 是干净的浅色渐变区，留空放欢迎标题。精致的 3D 渲染，友好、清新，高端广告感。不要文字、不要字母、不要 Logo、不要品牌、不要人物。

**English**

```text
Wide website hero banner for an online entertainment platform, new member welcome first deposit bonus theme. Bright cyan and teal gradient background, a large glossy gift box opening with confetti and ribbons, a shiny VIP badge and floating gold coins on the right side as the main visual. The left 45% is a clean light gradient area left empty for a welcome headline. Polished 3D render, friendly, fresh, premium advertising. No text, no letters, no logos, no brands, no people.
```

#### Banner 主题 · 赛事

- 尺寸 2048×928 · 时间 2026-11-27 09:04
- 产出：`prototype/assets/ai-banner/theme-sports.webp`（缩略图 `theme-sports-th.webp`）

**中文**

面向线上体育投注娱乐平台的宽幅网站主视觉 Banner，大型体育赛事对决主题。夜间体育场草坪，动感的橙蓝速度光轨，右侧以一颗足球和一颗篮球带着动态模糊和能量火花飞过作为主视觉。左侧 45% 是干净的深色区，留空放赛事标题和日期。精致的 3D 渲染，紧张、充满能量，电影感体育广告。不要文字、不要字母、不要 Logo、不要品牌、不要球队队徽、不要人物。

**English**

```text
Wide website hero banner for an online sports betting entertainment platform, major sports tournament match theme. Night stadium pitch with dynamic orange and blue speed light trails, a football and a basketball flying with motion blur and energy sparks on the right side as the main visual. The left 45% is a clean dark area left empty for a match title and date. Polished 3D render, intense, energetic, cinematic sports advertising. No text, no letters, no logos, no brands, no team crests, no people.
```

---

## 待补：11-27 AI 模版（7 风格 × 3 套）

这批生成还在进行中，完成后在此补入每条提示词（格式同上，中英文对照）。
