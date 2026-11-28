# AI 生图提示词记录

本文记录本项目到目前为止用过的全部 AI 生图提示词，中英文对照。

- **工具**：Figma `generate_image`（Figma AI），生成的图用作原型素材（图标、Banner、Logo）。部分条目指定了模型，已在条目里注明；未注明的用默认模型。
- **规则**：以后每次新生成图片，都要把提示词追加到本文，中英文对照。「中文」是译文，方便阅读；「English」是实际提交的原文，照抄不改。
- **时间**：马来西亚时间（Asia/Kuala_Lumpur，UTC+8）。**尺寸**：生成时请求的宽 × 高（px）。
- **产出路径**：`prototype/assets/…` 是仓库里原型用的图；`ai-icons/…` 是项目文件夹 `custom-design-platform/ai-icons/` 里的切图原图。11-26 的生成原图也在 Figma「09 AI 图标草稿」(340:2)。
- 完全相同的提示词只列一次，并注明「×N 次」。
- 自定义模版「AI 一键生成整页」的 4 个风格标签默认提示词（文字提示词，业主可改，不是直接提交的生图提示词）见文末「2026-11-28 · 自定义模版 · 风格标签默认提示词」。

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
| 11-27 | 默认头像（8 款，一张总图切） | 1 | 2048×1024 |
| 11-27 | AI 一键设计模版：Banner 总图（21 套） | 21 | 1020×948 / 1024×1024 |
| 11-27 | AI 一键设计模版：图标总图（21 套） | 21 | 1024×820 / 1280×1024 |
| | **合计** | **86** | |

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


### 默认头像

业主账号的 AI 默认头像（「我的」页账户卡片、顶部栏头像），新账号默认 a1，业主可换成任意一款或上传自己的图。一张总图出 4 列 × 2 行，每格 384×432（实际出图 1536×864），切图时左右各补 24px 底色成 432×432 正方形，再缩到 256×256 存 webp；界面里一律圆形裁切。8 款依次为：a1 短发眼镜女生 / a2 卷发胡子男生 / a3 马尾女生 / a4 银发长者 / a5 小机器人 / a6 橘猫 / a7 小熊猫 / a8 大熊猫。

#### 默认头像 · 8 款总图

- 尺寸 2048×1024（实际出图 1536×864，默认模型 gpt-image-2.5-flare）· 时间 2026-11-27 09:33
- 产出：`prototype/assets/avatars/a1.webp` ~ `a8.webp`（256×256，每张 4–5 KB）；Figma「02 切图母组件」`slice/avatar/a1` ~ `a8`（434:446127 内），源图同一画框里的 `source · avatar sprite sheet 4×2`（434:441757）

**中文**

一张包含 8 个默认头像的总图，精确排成 4 列 × 2 行：8 个等大的正方形格子边贴边，没有间隙、没有边框、没有外框、没有文字、没有 Logo。每格一个友好的卡通角色，头肩像，居中、正面，头部四周留足空间，保证圆形裁切后仍然完整。每格满版一种纯色粉彩底色，每格颜色不同：天蓝、薄荷绿、蜜桃、薰衣草紫、奶油黄、珊瑚粉、青绿、长春花蓝。8 个风格统一：柔和现代的 3D 黏土搪胶玩具质感，圆润造型，平滑哑光光影，大而友善的眼睛，温和的微笑，细节干净简洁，高品质 App 头像。第 1 行从左到右：黑色短波波头、戴圆框眼镜的年轻女性；深棕色皮肤、短卷发、胡子修剪整齐的男性；暖棕肤色、红棕色波浪长发扎马尾的女性；银发、穿开衫的年长男性。第 2 行从左到右：白蓝配色、圆形屏幕脸的友好小机器人；橘色虎斑猫；小熊猫；大熊猫。只要虚构角色，不像任何真实人物，不要任何品牌元素。

**English**

```text
A sprite sheet of 8 default profile avatars arranged in a precise grid of 4 columns by 2 rows: 8 equal square tiles touching edge to edge, no gutters, no borders, no frames, no text, no logos. Each tile shows one friendly cartoon character, head and shoulders, centered, facing forward, with generous margin around the head so it stays fully inside a circular crop. Each tile has a flat solid pastel background color filling the whole tile, a different color per tile: sky blue, mint green, peach, lavender, butter yellow, coral pink, teal, periwinkle. Consistent style across all 8: soft modern 3D clay vinyl-toy look, rounded shapes, smooth matte shading, big friendly eyes, gentle smile, clean simple details, high quality app avatar. Row 1, left to right: a young woman with a short black bob and round glasses; a man with dark brown skin, short curly hair and a neat beard; a woman with warm tan skin and wavy auburn hair in a ponytail; an older man with silver hair wearing a cardigan. Row 2, left to right: a small friendly white and blue robot with a round screen face; an orange tabby cat; a red panda; a giant panda. Fictional characters only, not resembling any real person, no brand elements.
```

---

## 11-27 AI 一键设计 · 页面风格模版（7 风格 × 3 套）

Waydon 11-27 08:59 要求「AI 一键设计」的页面风格模版改成真实 AI 生成的模版。每套模版用两次生图：一张 **Banner 总图**（3 张通用 Banner 上下排，切成 `banner-1~3.webp`，存 720×212 webp，上传规格 1020×300）和一张 **图标总图**（5×4 格，切成帐户栏 4 个 `acct-*`、底部导航 6 个 `bn-*`（`-off` 是程序去饱和做的未选中灰图，72×72）、游戏分类 9 个 `gm-*`，去背存 96×96 透明 webp）。Logo 沿用 11-26 已生成的 `assets/ai-logo/`，不重新生成。Figma 页「04-AI 模版 11-27」（430:619174），两张总图原图在每套模版画框旁边。模型一律 `gpt-image-2.5-sunburst`。每套的中文「生成提示词」（界面里选中模版时显示的那段）在 `prototype/assets/ai-tpl/<id>/manifest.json` 的 `prompt_zh`。

两种总图的英文结构是固定的，每套只换风格、主题、配色这几处；下面每条都给出完整中文翻译和英文原文。

> 白金（platinum-1~3）、黑金（blackgold-1~3）6 套：11-27 09:37 和 12:27 两次调用被会话的自动权限检查拦下（没出图、没扣点）；14:34 Waydon 选「現在補生成」，14:36–14:41 补生成 12 张，排在本节最后。白金 3 套是浅色底，Banner 总图照极简的经验加了「每张 Banner 有自己的底色面板」一句、图标总图加了「图标下不要投影」一句。

### 科技蓝 · 深海科技（techblue-1）

#### 深海科技 · Banner 总图

- 尺寸 请求 1020×948（实际出图 1024×1024）· 时间 2026-11-27 09:40
- 产出：`prototype/assets/ai-tpl/techblue-1/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #0A1430 间隔。风格：未来科技蓝、深海军蓝空间、发光的电光蓝光线、全息界面、干净的科幻感；主题：深海蓝光、数据光轨、全息球场。配色：主色 #1678FF，点缀色 #FFB020，底色 #0A1430。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #0A1430 gutters. Style: futuristic tech blue, deep navy space, glowing electric blue light lines, holographic UI, clean sci-fi; theme: deep-sea blue glow, data light trails, holographic stadium. Palette primary #1678FF, accent #FFB020, background #0A1430. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 深海科技 · 图标总图

- 尺寸 请求 1024×820（实际出图 1280×1024）· 时间 2026-11-27 09:37
- 产出：`prototype/assets/ai-tpl/techblue-1/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #0A1430 底；不要文字、不要标签、不要网格线。同一套统一的图标：未来科技蓝、深海军蓝空间、发光的电光蓝光线、全息界面、干净的科幻感；主题元素：深海蓝光、数据光轨、全息球场；主色 #1678FF，#FFB020 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #0A1430 background, no text, no labels, no grid lines. Consistent icon set: futuristic tech blue, deep navy space, glowing electric blue light lines, holographic UI, clean sci-fi; motif: deep-sea blue glow, data light trails, holographic stadium; main colour #1678FF with #FFB020 highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 科技蓝 · 极光青域（techblue-2）

#### 极光青域 · Banner 总图

- 尺寸 请求 1020×948（实际出图 1024×1024）· 时间 2026-11-27 09:50
- 产出：`prototype/assets/ai-tpl/techblue-2/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #061A2B 间隔。风格：未来科技蓝、深海军蓝空间、发光的电光蓝光线、全息界面、干净的科幻感；主题：青色极光丝带、冰晶、电路板纹理。配色：主色 #00A8FF，点缀色 #FFB020，底色 #061A2B。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #061A2B gutters. Style: futuristic tech blue, deep navy space, glowing electric blue light lines, holographic UI, clean sci-fi; theme: cyan aurora ribbons, ice crystals, circuit-board patterns. Palette primary #00A8FF, accent #FFB020, background #061A2B. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 极光青域 · 图标总图

- 尺寸 请求 1024×820（实际出图 1280×1024）· 时间 2026-11-27 09:51
- 产出：`prototype/assets/ai-tpl/techblue-2/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #061A2B 底；不要文字、不要标签、不要网格线。同一套统一的图标：未来科技蓝、深海军蓝空间、发光的电光蓝光线、全息界面、干净的科幻感；主题元素：青色极光丝带、冰晶、电路板纹理；主色 #00A8FF，#FFB020 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #061A2B background, no text, no labels, no grid lines. Consistent icon set: futuristic tech blue, deep navy space, glowing electric blue light lines, holographic UI, clean sci-fi; motif: cyan aurora ribbons, ice crystals, circuit-board patterns; main colour #00A8FF with #FFB020 highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 科技蓝 · 星际蓝紫（techblue-3）

#### 星际蓝紫 · Banner 总图

- 尺寸 请求 1020×948（实际出图 1024×1024）· 时间 2026-11-27 09:55
- 产出：`prototype/assets/ai-tpl/techblue-3/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #0D1036 间隔。风格：未来科技蓝、深海军蓝空间、发光的电光蓝光线、全息界面、干净的科幻感；主题：星云、蓝紫色行星、曲速粒子。配色：主色 #4F6BFF，点缀色 #8F7BFF，底色 #0D1036。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #0D1036 gutters. Style: futuristic tech blue, deep navy space, glowing electric blue light lines, holographic UI, clean sci-fi; theme: nebula clouds, blue-violet planets, warp-speed particles. Palette primary #4F6BFF, accent #8F7BFF, background #0D1036. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 星际蓝紫 · 图标总图

- 尺寸 请求 1024×820（实际出图 1280×1024）· 时间 2026-11-27 09:56
- 产出：`prototype/assets/ai-tpl/techblue-3/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #0D1036 底；不要文字、不要标签、不要网格线。同一套统一的图标：未来科技蓝、深海军蓝空间、发光的电光蓝光线、全息界面、干净的科幻感；主题元素：星云、蓝紫色行星、曲速粒子；主色 #4F6BFF，#8F7BFF 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #0D1036 background, no text, no labels, no grid lines. Consistent icon set: futuristic tech blue, deep navy space, glowing electric blue light lines, holographic UI, clean sci-fi; motif: nebula clouds, blue-violet planets, warp-speed particles; main colour #4F6BFF with #8F7BFF highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 清新明亮 · 薄荷清晨（fresh-1）

#### 薄荷清晨 · Banner 总图

- 尺寸 请求 1020×948（实际出图 1024×1024）· 时间 2026-11-27 09:45
- 产出：`prototype/assets/ai-tpl/fresh-1/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #F2FAF6 间隔。风格：清新明亮、亲切友好，白底上的薄荷绿与叶绿，柔和日光，圆润造型，俏皮的轻 3D；主题：薄荷叶、露珠、阳光明媚的清晨草地。配色：主色 #14B87A，点缀色 #FFA61A，底色 #F2FAF6。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #F2FAF6 gutters. Style: fresh bright and friendly, mint and leaf greens on white, soft daylight, rounded shapes, playful 3D-lite; theme: mint leaves, dew drops, sunny morning meadow. Palette primary #14B87A, accent #FFA61A, background #F2FAF6. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 薄荷清晨 · 图标总图

- 尺寸 请求 1024×820（实际出图 1280×1024）· 时间 2026-11-27 09:46
- 产出：`prototype/assets/ai-tpl/fresh-1/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #F2FAF6 底；不要文字、不要标签、不要网格线。同一套统一的图标：清新明亮、亲切友好，白底上的薄荷绿与叶绿，柔和日光，圆润造型，俏皮的轻 3D；主题元素：薄荷叶、露珠、阳光明媚的清晨草地；主色 #14B87A，#FFA61A 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #F2FAF6 background, no text, no labels, no grid lines. Consistent icon set: fresh bright and friendly, mint and leaf greens on white, soft daylight, rounded shapes, playful 3D-lite; motif: mint leaves, dew drops, sunny morning meadow; main colour #14B87A with #FFA61A highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 清新明亮 · 青柠海岸（fresh-2）

#### 青柠海岸 · Banner 总图

- 尺寸 请求 1020×948（实际出图 1024×1024）· 时间 2026-11-27 09:51
- 产出：`prototype/assets/ai-tpl/fresh-2/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #EFFAF9 间隔。风格：清新明亮、亲切友好，白底上的薄荷绿与叶绿，柔和日光，圆润造型，俏皮的轻 3D；主题：青柠片、松石绿海浪、阳光沙滩、夏日氛围。配色：主色 #10B3A8，点缀色 #FFC233，底色 #EFFAF9。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #EFFAF9 gutters. Style: fresh bright and friendly, mint and leaf greens on white, soft daylight, rounded shapes, playful 3D-lite; theme: lime slices, turquoise waves, sunny beach, summer vibe. Palette primary #10B3A8, accent #FFC233, background #EFFAF9. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 青柠海岸 · 图标总图

- 尺寸 请求 1024×820（实际出图 1280×1024）· 时间 2026-11-27 09:52
- 产出：`prototype/assets/ai-tpl/fresh-2/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #EFFAF9 底；不要文字、不要标签、不要网格线。同一套统一的图标：清新明亮、亲切友好，白底上的薄荷绿与叶绿，柔和日光，圆润造型，俏皮的轻 3D；主题元素：青柠片、松石绿海浪、阳光沙滩、夏日氛围；主色 #10B3A8，#FFC233 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #EFFAF9 background, no text, no labels, no grid lines. Consistent icon set: fresh bright and friendly, mint and leaf greens on white, soft daylight, rounded shapes, playful 3D-lite; motif: lime slices, turquoise waves, sunny beach, summer vibe; main colour #10B3A8 with #FFC233 highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 清新明亮 · 森系草绿（fresh-3）

#### 森系草绿 · Banner 总图

- 尺寸 请求 1020×948（实际出图 1024×1024）· 时间 2026-11-27 09:56
- 产出：`prototype/assets/ai-tpl/fresh-3/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #F5FBEF 间隔。风格：清新明亮、亲切友好，白底上的薄荷绿与叶绿，柔和日光，圆润造型，俏皮的轻 3D；主题：森林草地、可爱蘑菇、萤火虫光点、纸艺层次。配色：主色 #3CBF4A，点缀色 #FFB21A，底色 #F5FBEF。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #F5FBEF gutters. Style: fresh bright and friendly, mint and leaf greens on white, soft daylight, rounded shapes, playful 3D-lite; theme: forest grass, cute mushrooms, firefly sparkles, papercraft layers. Palette primary #3CBF4A, accent #FFB21A, background #F5FBEF. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 森系草绿 · 图标总图

- 尺寸 请求 1024×820（实际出图 1280×1024）· 时间 2026-11-27 09:57
- 产出：`prototype/assets/ai-tpl/fresh-3/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #F5FBEF 底；不要文字、不要标签、不要网格线。同一套统一的图标：清新明亮、亲切友好，白底上的薄荷绿与叶绿，柔和日光，圆润造型，俏皮的轻 3D；主题元素：森林草地、可爱蘑菇、萤火虫光点、纸艺层次；主色 #3CBF4A，#FFB21A 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #F5FBEF background, no text, no labels, no grid lines. Consistent icon set: fresh bright and friendly, mint and leaf greens on white, soft daylight, rounded shapes, playful 3D-lite; motif: forest grass, cute mushrooms, firefly sparkles, papercraft layers; main colour #3CBF4A with #FFB21A highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 节日红金 · 新春红包（festive-1）

#### 新春红包 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 10:06
- 产出：`prototype/assets/ai-tpl/festive-1/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #FFF6EC 间隔。风格：中国节庆红金，灯笼、红包、金币、祥云，喜庆；主题：红包雨、金元宝、红灯笼、鞭炮。配色：主色 #D9302C，点缀色 #E9B23C，底色 #FFF6EC。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #FFF6EC gutters. Style: Chinese festive red and gold, lanterns, red envelopes, gold coins, auspicious clouds, celebratory; theme: red envelope rain, gold ingots, red lanterns, firecrackers. Palette primary #D9302C, accent #E9B23C, background #FFF6EC. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 新春红包 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 10:06
- 产出：`prototype/assets/ai-tpl/festive-1/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #FFF6EC 底；不要文字、不要标签、不要网格线。同一套统一的图标：中国节庆红金，灯笼、红包、金币、祥云，喜庆；主题元素：红包雨、金元宝、红灯笼、鞭炮；主色 #D9302C，#E9B23C 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #FFF6EC background, no text, no labels, no grid lines. Consistent icon set: Chinese festive red and gold, lanterns, red envelopes, gold coins, auspicious clouds, celebratory; motif: red envelope rain, gold ingots, red lanterns, firecrackers; main colour #D9302C with #E9B23C highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 节日红金 · 锦鲤鸿运（festive-2）

#### 锦鲤鸿运 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 10:10
- 产出：`prototype/assets/ai-tpl/festive-2/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #FFF1E6 间隔。风格：中国节庆红金，灯笼、红包、金币、祥云，喜庆；主题：金红锦鲤、祥云、水波纹、剪纸风。配色：主色 #C4161C，点缀色 #F0B429，底色 #FFF1E6。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #FFF1E6 gutters. Style: Chinese festive red and gold, lanterns, red envelopes, gold coins, auspicious clouds, celebratory; theme: gold-and-red koi fish, auspicious clouds, water ripples, paper-cut style. Palette primary #C4161C, accent #F0B429, background #FFF1E6. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 锦鲤鸿运 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 10:10
- 产出：`prototype/assets/ai-tpl/festive-2/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #FFF1E6 底；不要文字、不要标签、不要网格线。同一套统一的图标：中国节庆红金，灯笼、红包、金币、祥云，喜庆；主题元素：金红锦鲤、祥云、水波纹、剪纸风；主色 #C4161C，#F0B429 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #FFF1E6 background, no text, no labels, no grid lines. Consistent icon set: Chinese festive red and gold, lanterns, red envelopes, gold coins, auspicious clouds, celebratory; motif: gold-and-red koi fish, auspicious clouds, water ripples, paper-cut style; main colour #C4161C with #F0B429 highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 节日红金 · 红金夜宴（festive-3）

#### 红金夜宴 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 10:10
- 产出：`prototype/assets/ai-tpl/festive-3/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #3A0D0B 间隔。风格：中国节庆红金，灯笼、红包、金币、祥云，喜庆；主题：深红夜空、烟花、金色舞狮。配色：主色 #E8541E，点缀色 #F2C14E，底色 #3A0D0B。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #3A0D0B gutters. Style: Chinese festive red and gold, lanterns, red envelopes, gold coins, auspicious clouds, celebratory; theme: deep crimson night, fireworks, golden lion dance. Palette primary #E8541E, accent #F2C14E, background #3A0D0B. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 红金夜宴 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 10:10
- 产出：`prototype/assets/ai-tpl/festive-3/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #3A0D0B 底；不要文字、不要标签、不要网格线。同一套统一的图标：中国节庆红金，灯笼、红包、金币、祥云，喜庆；主题元素：深红夜空、烟花、金色舞狮；主色 #E8541E，#F2C14E 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #3A0D0B background, no text, no labels, no grid lines. Consistent icon set: Chinese festive red and gold, lanterns, red envelopes, gold coins, auspicious clouds, celebratory; motif: deep crimson night, fireworks, golden lion dance; main colour #E8541E with #F2C14E highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 霓虹电竞 · 电竞紫电（neon-1）

#### 电竞紫电 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 10:06
- 产出：`prototype/assets/ai-tpl/neon-1/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #0E0A1A 间隔。风格：赛博朋克电竞霓虹，暗紫黑底，发光的紫色与青色霓虹灯管，故障风点缀；主题：紫色霓虹闪电、电竞手柄、竞技场舞台。配色：主色 #B14DFF，点缀色 #FFB03B，底色 #0E0A1A。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #0E0A1A gutters. Style: cyberpunk esports neon, dark purple-black, glowing violet and cyan neon tubes, glitch accents; theme: violet neon lightning, esports gamepad, arena stage. Palette primary #B14DFF, accent #FFB03B, background #0E0A1A. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 电竞紫电 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 10:06
- 产出：`prototype/assets/ai-tpl/neon-1/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #0E0A1A 底；不要文字、不要标签、不要网格线。同一套统一的图标：赛博朋克电竞霓虹，暗紫黑底，发光的紫色与青色霓虹灯管，故障风点缀；主题元素：紫色霓虹闪电、电竞手柄、竞技场舞台；主色 #B14DFF，#FFB03B 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #0E0A1A background, no text, no labels, no grid lines. Consistent icon set: cyberpunk esports neon, dark purple-black, glowing violet and cyan neon tubes, glitch accents; motif: violet neon lightning, esports gamepad, arena stage; main colour #B14DFF with #FFB03B highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 霓虹电竞 · 赛博青光（neon-2）

#### 赛博青光 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 10:12
- 产出：`prototype/assets/ai-tpl/neon-2/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #071615 间隔。风格：赛博朋克电竞霓虹，暗紫黑底，发光的紫色与青色霓虹灯管，故障风点缀；主题：赛博朋克城市、青色霓虹招牌、雨夜倒影、故障效果。配色：主色 #19D3C5，点缀色 #FFB03B，底色 #071615。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #071615 gutters. Style: cyberpunk esports neon, dark purple-black, glowing violet and cyan neon tubes, glitch accents; theme: cyberpunk city, cyan neon signs, rainy night reflections, glitch. Palette primary #19D3C5, accent #FFB03B, background #071615. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 赛博青光 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 10:12
- 产出：`prototype/assets/ai-tpl/neon-2/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #071615 底；不要文字、不要标签、不要网格线。同一套统一的图标：赛博朋克电竞霓虹，暗紫黑底，发光的紫色与青色霓虹灯管，故障风点缀；主题元素：赛博朋克城市、青色霓虹招牌、雨夜倒影、故障效果；主色 #19D3C5，#FFB03B 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #071615 background, no text, no labels, no grid lines. Consistent icon set: cyberpunk esports neon, dark purple-black, glowing violet and cyan neon tubes, glitch accents; motif: cyberpunk city, cyan neon signs, rainy night reflections, glitch; main colour #19D3C5 with #FFB03B highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 霓虹电竞 · 霓虹粉夜（neon-3）

#### 霓虹粉夜 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 10:12
- 产出：`prototype/assets/ai-tpl/neon-3/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #14080F 间隔。风格：赛博朋克电竞霓虹，暗紫黑底，发光的紫色与青色霓虹灯管，故障风点缀；主题：粉色霓虹招牌、迪斯科球、激光束、合成波网格。配色：主色 #FF3D8B，点缀色 #FFB03B，底色 #14080F。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #14080F gutters. Style: cyberpunk esports neon, dark purple-black, glowing violet and cyan neon tubes, glitch accents; theme: pink neon signs, disco ball, laser beams, synthwave grid. Palette primary #FF3D8B, accent #FFB03B, background #14080F. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 霓虹粉夜 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 10:12
- 产出：`prototype/assets/ai-tpl/neon-3/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #14080F 底；不要文字、不要标签、不要网格线。同一套统一的图标：赛博朋克电竞霓虹，暗紫黑底，发光的紫色与青色霓虹灯管，故障风点缀；主题元素：粉色霓虹招牌、迪斯科球、激光束、合成波网格；主色 #FF3D8B，#FFB03B 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #14080F background, no text, no labels, no grid lines. Consistent icon set: cyberpunk esports neon, dark purple-black, glowing violet and cyan neon tubes, glitch accents; motif: pink neon signs, disco ball, laser beams, synthwave grid; main colour #FF3D8B with #FFB03B highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 极简灰 · 墨白（minimal-1）

#### 墨白 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 10:09
- 产出：`prototype/assets/ai-tpl/minimal-1/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #F5F5F5 间隔。每张 Banner 是一块通栏面板，有自己的底色（白到浅灰的渐变，或炭灰），和纯色间隔明显区分，方便把三张切开。风格：极简单色，浅灰与米白，干净的几何造型，细微阴影，瑞士设计式的克制；主题：黑白几何、大面积留白、一抹琥珀色点缀。配色：主色 #222222，点缀色 #F59E0B，底色 #F5F5F5。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #F5F5F5 gutters. Each banner is a full-width panel with its own background tone (white-to-light-grey gradient or charcoal), clearly distinct from the flat gutters so the three banners are easy to separate. Style: minimal monochrome, light grey and off-white, clean geometric, subtle shadows, Swiss design restraint; theme: black-and-white geometry, big negative space, one amber accent. Palette primary #222222, accent #F59E0B, background #F5F5F5. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 墨白 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 10:09
- 产出：`prototype/assets/ai-tpl/minimal-1/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #F5F5F5 底；不要文字、不要标签、不要网格线。同一套统一的图标：极简单色，浅灰与米白，干净的几何造型，细微阴影，瑞士设计式的克制；主题元素：黑白几何、大面积留白、一抹琥珀色点缀；主色 #222222，#F59E0B 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #F5F5F5 background, no text, no labels, no grid lines. Consistent icon set: minimal monochrome, light grey and off-white, clean geometric, subtle shadows, Swiss design restraint; motif: black-and-white geometry, big negative space, one amber accent; main colour #222222 with #F59E0B highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 极简灰 · 雾蓝灰（minimal-2）

#### 雾蓝灰 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 10:15
- 产出：`prototype/assets/ai-tpl/minimal-2/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #F3F4F7 间隔。每张 Banner 是一块通栏面板，有自己的底色（雾蓝灰渐变，或深石板灰），和纯色间隔明显区分，方便把三张切开。风格：极简单色，浅灰与米白，干净的几何造型，细微阴影，瑞士设计式的克制；主题：雾蓝灰渐变、磨砂玻璃卡片、柔和阴影。配色：主色 #3B4250，点缀色 #5B8DEF，底色 #F3F4F7。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #F3F4F7 gutters. Each banner is a full-width panel with its own background tone (misty blue-grey gradient or deep slate), clearly distinct from the flat gutters so the three banners are easy to separate. Style: minimal monochrome, light grey and off-white, clean geometric, subtle shadows, Swiss design restraint; theme: misty blue-grey gradients, frosted glass cards, soft shadows. Palette primary #3B4250, accent #5B8DEF, background #F3F4F7. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 雾蓝灰 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 10:15
- 产出：`prototype/assets/ai-tpl/minimal-2/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #F3F4F7 底；不要文字、不要标签、不要网格线。同一套统一的图标：极简单色，浅灰与米白，干净的几何造型，细微阴影，瑞士设计式的克制；主题元素：雾蓝灰渐变、磨砂玻璃卡片、柔和阴影；主色 #3B4250，#5B8DEF 做高光。图标浮在纯色底上，下方不要投影，也不要地面阴影。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #F3F4F7 background, no text, no labels, no grid lines. Consistent icon set: minimal monochrome, light grey and off-white, clean geometric, subtle shadows, Swiss design restraint; motif: misty blue-grey gradients, frosted glass cards, soft shadows; main colour #3B4250 with #5B8DEF highlights. Icons float on the flat background with no cast shadow or ground shadow beneath them. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 极简灰 · 石墨暖灰（minimal-3）

#### 石墨暖灰 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 10:15
- 产出：`prototype/assets/ai-tpl/minimal-3/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #F6F4F1 间隔。每张 Banner 是一块通栏面板，有自己的底色（暖纸米色，或石墨灰），和纯色间隔明显区分，方便把三张切开。风格：极简单色，浅灰与米白，干净的几何造型，细微阴影，瑞士设计式的克制；主题：石墨、赤陶黏土、纸张颗粒质感、温暖日光。配色：主色 #4A4440，点缀色 #C98B4A，底色 #F6F4F1。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #F6F4F1 gutters. Each banner is a full-width panel with its own background tone (warm paper beige or graphite), clearly distinct from the flat gutters so the three banners are easy to separate. Style: minimal monochrome, light grey and off-white, clean geometric, subtle shadows, Swiss design restraint; theme: graphite, terracotta clay, paper grain texture, warm daylight. Palette primary #4A4440, accent #C98B4A, background #F6F4F1. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 石墨暖灰 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 10:15
- 产出：`prototype/assets/ai-tpl/minimal-3/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #F6F4F1 底；不要文字、不要标签、不要网格线。同一套统一的图标：极简单色，浅灰与米白，干净的几何造型，细微阴影，瑞士设计式的克制；主题元素：石墨、赤陶黏土、纸张颗粒质感、温暖日光；主色 #4A4440，#C98B4A 做高光。图标浮在纯色底上，下方不要投影，也不要地面阴影。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #F6F4F1 background, no text, no labels, no grid lines. Consistent icon set: minimal monochrome, light grey and off-white, clean geometric, subtle shadows, Swiss design restraint; motif: graphite, terracotta clay, paper grain texture, warm daylight; main colour #4A4440 with #C98B4A highlights. Icons float on the flat background with no cast shadow or ground shadow beneath them. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 白金 · 香槟晨光（platinum-1）

#### 香槟晨光 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 14:36 · Figma 原图 478:2
- 产出：`prototype/assets/ai-tpl/platinum-1/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #F7F6F3 间隔。每张 Banner 是一块通栏面板，有自己的底色（象牙白到香槟色的渐变，或暖灰褐），和纯色间隔明显区分，方便把三张切开。风格：奢华白金与香槟金，柔和日光，象牙白底，细金线勾勒，大量留白；主题：香槟金丝带、水晶奖杯、柔和晨光、珍珠光泽。配色：主色 #C8A96A，点缀色 #B98A45，底色 #F7F6F3。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #F7F6F3 gutters. Each banner is a full-width panel with its own background tone (ivory-to-champagne gradient or warm taupe), clearly distinct from the flat gutters so the three banners are easy to separate. Style: luxury platinum and champagne-gold, soft daylight, ivory background, thin gold linework, generous white space; theme: champagne-gold silk ribbons, crystal trophy, soft morning light, pearl highlights. Palette primary #C8A96A, accent #B98A45, background #F7F6F3. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 香槟晨光 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 14:37 · Figma 原图 478:3
- 产出：`prototype/assets/ai-tpl/platinum-1/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #F7F6F3 底；不要文字、不要标签、不要网格线。同一套统一的图标：奢华白金与香槟金，柔和日光，象牙白底，细金线勾勒，大量留白；主题元素：香槟金丝带、水晶奖杯、柔和晨光、珍珠光泽；主色 #C8A96A，#B98A45 做高光。图标浮在纯色底上，下方不要投影，也不要地面阴影。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #F7F6F3 background, no text, no labels, no grid lines. Consistent icon set: luxury platinum and champagne-gold, soft daylight, ivory background, thin gold linework, generous white space; motif: champagne-gold silk ribbons, crystal trophy, soft morning light, pearl highlights; main colour #C8A96A with #B98A45 highlights. Icons float on the flat background with no cast shadow or ground shadow beneath them. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 白金 · 玫瑰香槟（platinum-2）

#### 玫瑰香槟 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 14:38 · Figma 原图 478:4
- 产出：`prototype/assets/ai-tpl/platinum-2/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #FAF6F4 间隔。每张 Banner 是一块通栏面板，有自己的底色（粉象牙色渐变，或玫瑰灰褐），和纯色间隔明显区分，方便把三张切开。风格：奢华白金与香槟金，柔和日光，象牙白底，细金线勾勒，大量留白；主题：玫瑰金花瓣、香槟气泡、粉金色光斑、缎面质感。配色：主色 #C99A82，点缀色 #B8806A，底色 #FAF6F4。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #FAF6F4 gutters. Each banner is a full-width panel with its own background tone (blush-ivory gradient or rose-taupe), clearly distinct from the flat gutters so the three banners are easy to separate. Style: luxury platinum and champagne-gold, soft daylight, ivory background, thin gold linework, generous white space; theme: rose-gold petals, champagne bubbles, blush-gold bokeh, satin texture. Palette primary #C99A82, accent #B8806A, background #FAF6F4. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 玫瑰香槟 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 14:38 · Figma 原图 478:5
- 产出：`prototype/assets/ai-tpl/platinum-2/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #FAF6F4 底；不要文字、不要标签、不要网格线。同一套统一的图标：奢华白金与香槟金，柔和日光，象牙白底，细金线勾勒，大量留白；主题元素：玫瑰金花瓣、香槟气泡、粉金色光斑、缎面质感；主色 #C99A82，#B8806A 做高光。图标浮在纯色底上，下方不要投影，也不要地面阴影。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #FAF6F4 background, no text, no labels, no grid lines. Consistent icon set: luxury platinum and champagne-gold, soft daylight, ivory background, thin gold linework, generous white space; motif: rose-gold petals, champagne bubbles, blush-gold bokeh, satin texture; main colour #C99A82 with #B8806A highlights. Icons float on the flat background with no cast shadow or ground shadow beneath them. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 白金 · 铂银之境（platinum-3）

#### 铂银之境 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 14:38 · Figma 原图 478:6
- 产出：`prototype/assets/ai-tpl/platinum-3/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #F4F5F7 间隔。每张 Banner 是一块通栏面板，有自己的底色（银灰渐变，或深枪灰），和纯色间隔明显区分，方便把三张切开。风格：奢华白金与香槟金，柔和日光，象牙白底，细金线勾勒，大量留白；主题：拉丝铂金、银色多面几何、冷调镜面高光、一处香槟金点缀。配色：主色 #9AA3AD，点缀色 #C8A96A，底色 #F4F5F7。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #F4F5F7 gutters. Each banner is a full-width panel with its own background tone (silver-grey gradient or deep gunmetal), clearly distinct from the flat gutters so the three banners are easy to separate. Style: luxury platinum and champagne-gold, soft daylight, ivory background, thin gold linework, generous white space; theme: brushed platinum, silver faceted geometry, cool specular highlights, a single champagne-gold accent. Palette primary #9AA3AD, accent #C8A96A, background #F4F5F7. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 铂银之境 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 14:39 · Figma 原图 478:7
- 产出：`prototype/assets/ai-tpl/platinum-3/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #F4F5F7 底；不要文字、不要标签、不要网格线。同一套统一的图标：奢华白金与香槟金，柔和日光，象牙白底，细金线勾勒，大量留白；主题元素：拉丝铂金、银色多面几何、冷调镜面高光、一处香槟金点缀；主色 #9AA3AD，#C8A96A 做高光。图标浮在纯色底上，下方不要投影，也不要地面阴影。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #F4F5F7 background, no text, no labels, no grid lines. Consistent icon set: luxury platinum and champagne-gold, soft daylight, ivory background, thin gold linework, generous white space; motif: brushed platinum, silver faceted geometry, cool specular highlights, a single champagne-gold accent; main colour #9AA3AD with #C8A96A highlights. Icons float on the flat background with no cast shadow or ground shadow beneath them. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 黑金 · 午夜鎏金（blackgold-1）

#### 午夜鎏金 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 14:39 · Figma 原图 478:8
- 产出：`prototype/assets/ai-tpl/blackgold-1/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #111111 间隔。风格：黑金奢华 VIP 娱乐场，深黑丝绒，抛光的金属金，戏剧性的轮廓光，高对比；主题：黑丝绒上的金皇冠、金币雨、戏剧性聚光灯。配色：主色 #D4AF37，点缀色 #E8A33A，底色 #111111。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #111111 gutters. Style: black-and-gold luxury VIP casino, deep black velvet, polished gold metal, dramatic rim light, high contrast; theme: gold crown on black velvet, raining gold coins, dramatic spotlight. Palette primary #D4AF37, accent #E8A33A, background #111111. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 午夜鎏金 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 14:40 · Figma 原图 478:9
- 产出：`prototype/assets/ai-tpl/blackgold-1/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #111111 底；不要文字、不要标签、不要网格线。同一套统一的图标：黑金奢华 VIP 娱乐场，深黑丝绒，抛光的金属金，戏剧性的轮廓光，高对比；主题元素：黑丝绒上的金皇冠、金币雨、戏剧性聚光灯；主色 #D4AF37，#E8A33A 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #111111 background, no text, no labels, no grid lines. Consistent icon set: black-and-gold luxury VIP casino, deep black velvet, polished gold metal, dramatic rim light, high contrast; motif: gold crown on black velvet, raining gold coins, dramatic spotlight; main colour #D4AF37 with #E8A33A highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 黑金 · 古铜尊享（blackgold-2）

#### 古铜尊享 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 14:40 · Figma 原图 478:10
- 产出：`prototype/assets/ai-tpl/blackgold-2/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #14100B 间隔。风格：黑金奢华 VIP 娱乐场，深黑丝绒，抛光的金属金，戏剧性的轮廓光，高对比；主题：古铜浮雕、深色皮革纹理、琥珀暖光、装饰艺术（Art Deco）纹饰。配色：主色 #B8862B，点缀色 #E6C675，底色 #14100B。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #14100B gutters. Style: black-and-gold luxury VIP casino, deep black velvet, polished gold metal, dramatic rim light, high contrast; theme: antique bronze embossing, dark leather texture, amber warm light, art-deco ornaments. Palette primary #B8862B, accent #E6C675, background #14100B. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 古铜尊享 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 14:41 · Figma 原图 478:11
- 产出：`prototype/assets/ai-tpl/blackgold-2/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #14100B 底；不要文字、不要标签、不要网格线。同一套统一的图标：黑金奢华 VIP 娱乐场，深黑丝绒，抛光的金属金，戏剧性的轮廓光，高对比；主题元素：古铜浮雕、深色皮革纹理、琥珀暖光、装饰艺术（Art Deco）纹饰；主色 #B8862B，#E6C675 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #14100B background, no text, no labels, no grid lines. Consistent icon set: black-and-gold luxury VIP casino, deep black velvet, polished gold metal, dramatic rim light, high contrast; motif: antique bronze embossing, dark leather texture, amber warm light, art-deco ornaments; main colour #B8862B with #E6C675 highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

### 黑金 · 香槟夜宴（blackgold-3）

#### 香槟夜宴 · Banner 总图

- 尺寸 请求 1024×1024（实际出图 1024×1024）· 时间 2026-11-27 14:41 · Figma 原图 478:12
- 产出：`prototype/assets/ai-tpl/blackgold-3/banner-1.webp` ~ `banner-3.webp`

**中文**

为手机线上游戏（娱乐场、体育、电竞）首页做三张独立的横幅宣传 Banner，在一张图里上下排列，每张严格 3.4:1（1020×300），之间用 24px 纯色 #0B0B0D 间隔。风格：黑金奢华 VIP 娱乐场，深黑丝绒，抛光的金属金，戏剧性的轮廓光，高对比；主题：香槟塔、金色光斑、夜宴舞台、柔和金光。配色：主色 #E6C675，点缀色 #D4AF37，底色 #0B0B0D。第 1 张：首存优惠，大号粗体中文标题「首存豪礼 最高送 888」，加一个小的行动按钮胶囊「立即领取」。第 2 张：体育 / 电竞赛事，标题「赛事狂欢 天天加奖」。第 3 张：VIP 会员，标题「VIP 尊享 返水无上限」。标题放在左侧 55% 内，主体物放右侧，四边各留 6% 安全边距；不要真实品牌 Logo，不要真人面孔，文字清晰，细节丰富。

**English**

```text
Three separate horizontal promotional banners for a mobile online gaming (casino, sports, esports) home page, stacked vertically in one image, each banner exactly 3.4:1 (1020x300), separated by 24px solid #0B0B0D gutters. Style: black-and-gold luxury VIP casino, deep black velvet, polished gold metal, dramatic rim light, high contrast; theme: champagne tower, golden bokeh, night gala stage, soft gold glow. Palette primary #E6C675, accent #D4AF37, background #0B0B0D. Banner 1: welcome bonus with a large bold Chinese headline '首存豪礼 最高送 888' and a small CTA pill '立即领取'. Banner 2: sports/esports event with headline '赛事狂欢 天天加奖'. Banner 3: VIP club with headline 'VIP 尊享 返水无上限'. Keep headlines in the left 55%, hero object on the right, safe margin 6% on every side, no logos of real brands, no real people faces, crisp text, high detail.
```

#### 香槟夜宴 · 图标总图

- 尺寸 请求 1280×1024（实际出图 1280×1024）· 时间 2026-11-27 14:41 · Figma 原图 478:13
- 产出：`prototype/assets/ai-tpl/blackgold-3/acct-*.webp`（4）、`bn-*.webp`（6 + 6 张 -off）、`gm-*.webp`（9）

**中文**

一张 5 列 × 4 行的网格总图：20 个等大的正方形格子，每格居中放一个手机 App 图标，四周留 18% 内边距，纯色 #0B0B0D 底；不要文字、不要标签、不要网格线。同一套统一的图标：黑金奢华 VIP 娱乐场，深黑丝绒，抛光的金属金，戏剧性的轮廓光，高对比；主题元素：香槟塔、金色光斑、夜宴舞台、柔和金光；主色 #E6C675，#D4AF37 做高光。第 1 行：存钱罐（利息宝）、VIP 皇冠、带金币的分享赚钱礼物、更多（四个小方块）、注册（带加号的人像）。第 2 行：首页（房子）、优惠礼盒、分享赚钱红包、存款钱包、我的（人像）。第 3 行：火焰（热门）、扑克牌、鱼、真人荷官、老虎机。第 4 行：足球、电竞手柄、彩票球、公鸡，最后一格留空（只有底色）。光影、线条粗细、透视全部一致，游戏 UI 品质，1024×820。

**English**

```text
A 5-column x 4-row grid sheet of 20 equal square cells of mobile app icons, one icon centered per cell with 18% padding, on a flat solid #0B0B0D background, no text, no labels, no grid lines. Consistent icon set: black-and-gold luxury VIP casino, deep black velvet, polished gold metal, dramatic rim light, high contrast; motif: champagne tower, golden bokeh, night gala stage, soft gold glow; main colour #E6C675 with #D4AF37 highlights. Row 1: piggy-bank interest vault, VIP crown, share-and-earn gift with coins, more (four small squares), register (person with plus). Row 2: home house, promotions gift box, share-and-earn red envelope, deposit wallet, my profile person. Row 3: flame / hot, playing cards, fish, live dealer, slot machine. Row 4: soccer ball, esports gamepad, lottery balls, rooster, and the last cell left EMPTY (background only). Same lighting, same stroke weight, same perspective, game-UI quality, 1024x820.
```

---

## 2026-11-28 · 自定义模版 · 风格标签默认提示词

自定义模版「AI 一键生成整页」弹窗（Figma 设计稿1127 03 页 66114:81676；组件 AIF/StyleTag 66109:81570、SpecPackChip 66109:81583、SpecPackPanel 66110:81628、PromptComposer 66112:81908）。

- **怎么用**：业主点一个风格标签 → 提示词框填入该标签的默认提示词（按当前界面语言）；可以直接生成，也可以改。改过再点别的标签 → 换成新标签的默认提示词，提示「已换成「巴西绿」默认提示词」带「撤销」。没改过的默认提示词跟着切换语言。可以不选标签只写文字（演示用版式自己的原稿配色）。
- **上限**：300 字符（按 JS 字符串长度）。默认提示词要给业主留改写的余地（标签提示「可直接用或再修改」，Figma S3 是在默认上加一句）：中文 85–89 字符；English / Tiếng Việt 照 Figma 原文 262–304 字符，几乎顶满（巴西绿 English 正好 300，一点标签计数就变红、一个字也加不进去，QA 11-28），原型里压到 English 231–239、Tiếng Việt 205–230 字符（意思不变，删掉重复修饰和次要的正文字色描述），至少留 60 字符。Figma「06 文案 i18n」`ct/prompt-*` 的 en / vi 值待同步。
- **清空文字**：标签选中、提示词清空（或只有空格）时生成按钮照样可用，请求里的 `prompt` 发该标签当前语言的默认提示词、`promptEdited: false`（style-prompts.md「清空文字：标签仍选中时，按钮可用（按标签默认提示词生成）」）。
- **版本**：`stylePromptVersion: "ct-style-v1"`，随请求发送（见 `docs/spec-pack/request-example.md`）；改默认提示词时升版本（en / vi 压短发生在 v1 发布前，同一个未合并分支里，仍记 v1）。
- **规范包永远附带**：每次生成都附带普通定制规范包 `normal-custom-v1`（`docs/spec-pack/normal-custom-v1.json`，原型数据 `prototype/js/ct-specpack.js`），业主只能查看（弹窗里「普通定制规范 · 已附带」），改不了；尺寸、画布、字号、多语言留位这些硬约束由后端拼进每个素材的提示词（见 `docs/spec-pack/request-example.md`）。
- **代码位置**：`prototype/js/i18n-custom.js` 的 `ct/prompt-<标签>`；标签 → 配色版本在 `prototype/js/customtpl.js` 的 `TAGS`。

| 标签 | key | 演示配色版本 | 平分时版式 |
| --- | --- | --- | --- |
| 白金 / 白金 / Platinum / Bạch kim | `platinum` | 香槟金 `gold`（`result-X-gold.jpg`） | B |
| 巴西绿 / 巴西綠 / Brazil Green / Xanh Brazil | `brazil-green` | 墨绿金 `green`（`result-X-green.jpg`） | A |
| 暗夜绿 / 暗夜綠 / Night Green / Xanh đêm | `night-green` | 暗夜绿 `night`（`result-X-night.jpg`） | C |
| 清爽蓝 / 清爽藍 / Fresh Blue / Xanh tươi mát | `fresh-blue` | 清爽蓝 `blue`（`result-X-blue.jpg`） | D |
| 不选（按提示词） | `null` | 匹配到的版式 X 自己的原稿配色 | A |

### 默认提示词（4 标签 × 4 语言，照抄代码）

#### 白金（`platinum`）

- **简体中文**（88 字符）：浅色象牙白底 + 香槟金主色 + 银灰点缀，整体明亮、留白多、细金线描边；Banner 用金属质感人物与奖杯，柔和日光；图标金属质感、统一圆角、不要投影；主按钮香槟金底配白字。
- **繁體中文**（88 字符）：淺色象牙白底 + 香檳金主色 + 銀灰點綴，整體明亮、留白多、細金線描邊；Banner 用金屬質感人物與獎盃，柔和日光；圖示金屬質感、統一圓角、不要投影；主按鈕香檳金底配白字。
- **English**（239 字符）：Ivory base + champagne gold primary + silver-grey accents; bright and airy, fine gold outlines. Banners: metallic figures and trophies in soft daylight. Icons: metallic, rounded corners, no shadows. Main button: champagne gold, white text.
- **Tiếng Việt**（217 字符）：Nền trắng ngà + vàng champagne + điểm xám bạc; sáng, thoáng, viền vàng mảnh. Banner: nhân vật và cúp kim loại dưới nắng dịu. Biểu tượng: kim loại, bo góc đồng nhất, không đổ bóng. Nút chính: vàng champagne, chữ trắng.

#### 巴西绿（`brazil-green`）

- **简体中文**（85 字符）：荷叶绿深色底 + 黑金点缀 + 祖母绿高光，清爽有质感；Banner 用深绿渐变配金色光效与球场元素；图标绿金双色、细金属描边；主按钮金色配深色字，标题白色、正文浅灰绿。
- **繁體中文**（85 字符）：荷葉綠深色底 + 黑金點綴 + 祖母綠高光，清爽有質感；Banner 用深綠漸層配金色光效與球場元素；圖示綠金雙色、細金屬描邊；主按鈕金色配深色字，標題白色、內文淺灰綠。
- **English**（238 字符）：Dark lotus-green base + black-gold accents + emerald highlights; fresh yet refined. Banners: deep green gradients, gold light, stadium elements. Icons: green-gold duotone, fine metal outlines. Main button: gold, dark text; white headings.
- **Tiếng Việt**（205 字符）：Nền xanh lá sen đậm + điểm đen vàng + ánh ngọc lục bảo; tươi mát mà sang. Banner: xanh đậm chuyển màu, ánh vàng, sân bóng. Biểu tượng: xanh vàng, viền kim loại mảnh. Nút chính: vàng chữ tối; tiêu đề trắng.

#### 暗夜绿（`night-green`）

- **简体中文**（89 字符）：纯黑底 + 荧光绿主色 + 青绿点缀，高对比、科技电竞感；Banner 用暗色背景配霓虹绿光效与动感人物；图标霓虹描边、轻微发光；主按钮荧光绿配黑字，次级文字用中灰，卡片深灰底。
- **繁體中文**（89 字符）：純黑底 + 螢光綠主色 + 青綠點綴，高對比、科技電競感；Banner 用暗色背景配霓虹綠光效與動感人物；圖示霓虹描邊、輕微發光；主按鈕螢光綠配黑字，次級文字用中灰，卡片深灰底。
- **English**（231 字符）：Pure black base + neon green primary + teal accents; high-contrast esports mood. Banners: dark backgrounds, neon green light, dynamic figures. Icons: neon outlines, slight glow. Main button: neon green, black text; dark grey cards.
- **Tiếng Việt**（215 字符）：Nền đen tuyền + xanh neon + điểm xanh ngọc; tương phản cao, chất thể thao điện tử. Banner: nền tối, ánh xanh neon, nhân vật năng động. Biểu tượng: viền neon, phát sáng nhẹ. Nút chính: xanh neon chữ đen; thẻ xám đậm.

#### 清爽蓝（`fresh-blue`）

- **简体中文**（86 字符）：浅蓝白底 + 亮蓝主色 + 天蓝点缀，明亮清爽、运动感；Banner 用蓝白渐变配运动员与球类动感元素；图标蓝色扁平带轻微高光、统一圆角；主按钮亮蓝配白字，卡片白底细描边。
- **繁體中文**（86 字符）：淺藍白底 + 亮藍主色 + 天藍點綴，明亮清爽、運動感；Banner 用藍白漸層配運動員與球類動感元素；圖示藍色扁平帶輕微高光、統一圓角；主按鈕亮藍配白字，卡片白底細描邊。
- **English**（238 字符）：Pale blue-white base + bright blue primary + sky-blue accents; clean and sporty. Banners: blue-white gradients, athletes, dynamic balls. Icons: flat blue, soft highlight, rounded corners. Main button: bright blue, white text; white cards.
- **Tiếng Việt**（230 字符）：Nền trắng xanh nhạt + xanh dương sáng + điểm xanh da trời; sáng, sạch, thể thao. Banner: xanh trắng chuyển màu, vận động viên, bóng. Biểu tượng: phẳng màu xanh, ánh nhẹ, bo góc đồng nhất. Nút chính: xanh sáng chữ trắng; thẻ trắng.
