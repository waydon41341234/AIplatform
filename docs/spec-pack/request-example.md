# 自定义模版 · AI 一键生成请求示例（2026-11-28）

按 `docs/ai-gateway.md` 的原则写：前端只调 `/api/ai/*`，不知道模型名、密钥和供应商；后端只依赖 `shared/ai/contract.ts` 的契约，真实网关实现 `AiProvider` 后注册即可替换。规范包永远随请求发送，业主改不了。

## 1. 前端 → 平台：`POST /api/ai/page-jobs`（新增，整页生成）

现有 `POST /api/ai/jobs` 一次只生成一个素材槽位（`AiGenerateRequest`：kind / slot / prompt / width / height / count）。整页生成要一起带上排版、提示词和规范包，所以建议加一个整页入口，由后端拆成多个 `AiGenerateRequest`。扣点仍走现有 `estimate → reserve → generate → release → charge` 流程，整页一次 50 点。

```jsonc
{
  "projectId": "p_20261128_0001",
  "idempotencyKey": "ct-page-p_20261128_0001-7f3c9a",   // 防重复点击，同 key 只扣一次
  "kind": "page",
  "locale": "zh-Hans",

  // 业主当前排版（线框编辑器里排好的，不动）
  "layout": {
    "platform": "h5",
    "starter": "A",                     // 从哪套起始线框开始；空白起始为 "blank"
    "fixed": { "topbar": "T1", "bottomnav": "BN1", "float": "X1" },
    "blocks": [
      { "id": "b1", "module": "banner",   "option": "B1",  "params": { "r": "md", "g": "std" } },
      { "id": "b2", "module": "notice",   "option": "N1",  "params": { "r": "md", "g": "std" } },
      { "id": "b3", "module": "account",  "option": "M1",  "params": { "r": "md", "g": "std" } },
      { "id": "b4", "module": "gamemenu", "option": "G1",  "params": { "r": "md", "g": "std" } },
      { "id": "b5", "module": "zone",     "option": "C1a", "params": { "cols": 4, "rows": 3, "r": "md", "g": "std", "h": "H1" }, "title": "热门" },
      { "id": "b6", "module": "zone",     "option": "C5",  "params": { "rows": 3, "r": "md", "g": "std", "h": "H1" }, "title": "捕鱼" },
      { "id": "b7", "module": "footer",   "option": "F1",  "params": { "r": "md", "g": "std" } }
    ],
    "hidden": [],
    "sequence": ["T1", "B1", "N1", "M1", "G1", "C1", "C5", "F1", "BN1", "X1"]   // 结果匹配用的布局选项序列
  },

  // 风格标签：platinum | brazil-green | night-green | fresh-blue | null（不选标签只写文字）
  "styleTag": "platinum",
  "stylePromptVersion": "ct-style-v1",   // 默认提示词版本，见 docs/ai-prompts.md「自定义模版 · 风格标签默认提示词」
  "promptEdited": true,                  // 业主改过默认提示词

  // 业主最终的提示词（≤ 300 字，原样发送）；选了标签但把文字清空 / 只留空格 → 发该标签默认提示词，promptEdited 为 false
  "prompt": "浅色象牙白底 + 香槟金主色 + 玫瑰金点缀，整体明亮、留白多、细金线描边；Banner 用金属质感人物与奖杯，加一点圣诞雪花和礼盒；图标金属质感、统一圆角、不要投影；主按钮香槟金底配白字。",

  // 规范包：永远附带，业主不可改。version 用来对账和缓存，inline 是完整内容（= normal-custom-v1.json）
  "specPack": {
    "version": "normal-custom-v1",
    "source": "figma:FikSmkYSPbP30PrjagWyYl/66009:20504",
    "inline": { "...": "normal-custom-v1.json 全文，此处省略" }
  },

  // 要 AI 出的东西（由平台按排版 + 规范包算出来，前端不让业主选）
  "outputs": {
    "theme": {
      "keys": ["primary", "lead", "neutral_1", "neutral_2", "border", "bg_1", "bg_2", "accent_1", "accent_2", "accent_3", "text_primary"],
      "max": 11
    },
    "banners": [
      { "slot": "banner:large",   "width": 1080, "height": 490, "format": "png", "count": 1 },
      { "slot": "banner:general", "width": 1020, "height": 300, "format": "png", "count": 3 },
      { "slot": "banner:small",   "width": 386,  "height": 244, "format": "png", "count": 1 }
    ],
    "icons": [
      { "set": "gameType",       "width": 100, "height": 76, "format": "png", "names": ["热门", "棋牌", "捕鱼", "真人", "电子", "体育", "电竞", "斗鸡", "彩票", "试玩", "区块链", "最近", "收藏"] },
      { "set": "midNav.message", "width": 80,  "height": 70, "format": "png", "names": ["消息-已读", "消息-未读", "公告", "通知"] },
      { "set": "bottomNav",      "width": 70,  "height": 70, "format": "png", "names": ["首页", "优惠", "我的", "客服", "VIP"], "states": ["default", "active"] }
    ],
    "logo": false,          // 业主自己上传，AI 不出
    "gameCards": false      // 业主在后台换图，AI 不出
  }
}
```

说明：
- `outputs.banners` 只列排版里用到的 Banner 规格（这里 B1 通栏 = 通用 1020×300 × 3 张 + 大 / 小各 1 张做示例）；PC 排版时加 `banner:pc` 1920×564。
- `outputs.icons[bottomNav].names` 取排版里底部导航实际放的入口，不是规范的全部 32 个。
- 字号、画布宽度、多语言间距不在 outputs 里：它们约束生成结果（例如 Banner 标题按 H5 44 / 30 号字留位置、文字区留 1.5–2 倍），由后端拼进每个素材的提示词。

## 2. 平台 → 网关：拆成多个 `AiGenerateRequest`

后端按 outputs 逐项生成，每项是一个现有契约里的请求（`shared/ai/contract.ts`），`prompt` = 业主提示词 + 系统拼接的规范约束：

```jsonc
{
  "projectId": "p_20261128_0001",
  "kind": "banner",
  "slot": "banner:general",
  "prompt": "【业主要求】浅色象牙白底 + 香槟金主色 + 玫瑰金点缀，……主按钮香槟金底配白字。\n【规范 normal-custom-v1】H5 首页通用 Banner，1020×300 PNG；画布 750 宽、内容区 710；主色/点缀色与本次 theme 的 primary、accent_3 一致；标题字号按 H5 44 / 30 留位置，文字区预留 1.5–2 倍长度（多语言）；不要真实品牌 Logo。",
  "width": 1020,
  "height": 300,
  "count": 3,
  "idempotencyKey": "ct-page-p_20261128_0001-7f3c9a:banner:general"
}
```

- 配色（theme 11 个 Key）不是图片：真实网关需要一个返回 JSON 的文本调用，或由标签预设给初值再让 AI 按提示词微调。演示网关直接用标签对应的配色版本。（待定，见开放问题）
- 子请求的 `idempotencyKey` = 整页 key + 槽位，整页重试不会重复扣费。
- 扣费：整页只预留 / 结算一次 50 点；子请求的上游实际费用汇总到这一条流水（`credit/l-customtpl`「自定义模版 AI 生成 · 白金」）。

## 3. 平台 → 前端：结果

```jsonc
{
  "jobId": "job_ct_0001",
  "status": "succeeded",
  "charged": 50,
  "styleTag": "platinum",
  "specPackVersion": "normal-custom-v1",
  "theme": { "primary": "#C8A96A", "lead": "#2B2B2B", "...": "..." },
  "assetIds": ["a_banner_1", "a_banner_2", "a_icon_hot", "..."],
  "match": { "plan": "B", "structure": 0.82 }   // 演示：选哪张现成整页图
}
```

## 4. 演示网关（AI_PROVIDER=mock）怎么出结果

| styleTag | 演示结果 |
| --- | --- |
| `platinum` 白金 | 香槟金版（`result-X-gold.jpg`） |
| `brazil-green` 巴西绿 | 墨绿金版（`result-X-green.jpg`） |
| `night-green` 暗夜绿 | 暗夜绿版（`result-X-night.jpg`） |
| `fresh-blue` 清爽蓝 | 清爽蓝版（`result-X-blue.jpg`） |
| `null`（只写文字） | 版式 X 自己的原稿配色（A 墨绿金 / B 香槟金 / C 暗夜绿 / D 清爽蓝） |

X = 按 `layout.sequence` 匹配到的起始版式（现有规则不变）。文件名按原型现有命名（`resKey`），这里只是示意。
