# AI 网关接入说明

## 原则

- 平台只依赖 `shared/ai/contract.ts` 的契约，**不绑定任何模型或供应商**。设计阶段使用的任何个人模型都不进入平台。
- 前端只调 `/api/ai/*`，不知道模型名、密钥、供应商地址。
- 默认 `AI_PROVIDER=mock`：演示网关按目标尺寸返回占位 SVG，演示余额 100 点，不产生真实费用，界面显示“演示网关”。

## 接入真实网关的步骤

1. 新建 `server/ai/<name>Provider.ts`，实现 `server/ai/provider.ts` 的 `AiProvider`：
   - `unitPrice(req)`：按类型/尺寸返回单价（与 `priceVersion` 一起版本化）
   - `generate(req)`：调用上游，返回 `{ upstreamId, cost?, images[] }`。`cost` 取上游实际计费；拿不到时返回 `undefined`，任务会标为“待核对”并保留预留，不会自动重试。
2. 在 `server/ai/index.ts` 的 `providers` 注册，部署时设置 `AI_PROVIDER=<name>`。
3. 密钥从环境变量或密钥管理服务读取，**不要**写进代码、`data/`、项目 JSON、交付包或 Git。
4. 上游返回的图片尺寸不一定精确：在 provider 内或返回后，按 `req.width/height` 做裁切/留边，再交给平台（方案：AI 也要“先生成，再转换、检查并采用”）。

## 计费流程（`server/ai/service.ts`）

```
estimate → 检查余额 → reserve(−上限) → provider.generate → release(+上限) → charge(−实际)
                                        └ 失败 → release(+上限)，不扣费（真实网关需按上游是否收费决定）
```

- 幂等：同一 `idempotencyKey` 重复提交返回同一任务，不重复扣费。目前幂等表在内存里，重启后失效，上线需持久化。
- 并发：参考实现依赖 Node 单线程；多实例部署必须把“检查余额 + 预留”做成数据库原子操作。
- 单次最多 4 张（`MAX_BATCH`）。

## 自定义模版 · AI 一键生成整页（2026-11-28，原型）

- 入口：`#/custom` 排版画布「AI 一键生成」→ 弹窗（风格标签 + 可改的提示词 ≤ 300 字 + 普通定制规范包 `normal-custom-v1` 永远附带、只读）→ 现有扣点确认（50 点）→ 生成中 → 结果 → 采用进编辑器。
- 建议新增整页入口 `POST /api/ai/page-jobs`，后端按 `outputs` 拆成多个现有 `AiGenerateRequest`（`shared/ai/contract.ts`），整页只预留 / 结算一次 50 点，子请求 `idempotencyKey` = 整页 key + 槽位。完整请求 / 拆分 / 返回示例见 `docs/spec-pack/request-example.md`；规范包内容见 `docs/spec-pack/normal-custom-v1.md`（机读 `normal-custom-v1.json`）。
- 原型里请求体由 `prototype/js/customtpl.js` 的 `buildReq()` 在点「AI 一键生成 · 50 点」时拼好（`projectId` 为 `null`，原型没有后端项目），扣点确认通过后发起生成；同一个对象挂在生成中状态 `CT_S.gen.req` 和结果 `CT_S.res.req` 上，并可从控制台读 `window.CT.lastRequest`（最近一次真正发起的请求；`window.CT.buildRequest()` 按当前排版和提示词现拼一份，不扣点）。
- 字段：`kind: "page"`、`locale`、`layout`（`platform` / `starter` / `fixed` / `blocks[{id, module, option, params}]` / `hidden` / `sequence`）、`styleTag`（`platinum` | `brazil-green` | `night-green` | `fresh-blue` | `null`）、`stylePromptVersion: "ct-style-v1"`、`promptEdited`、`prompt`（原样发送；标签选中而文字清空 / 只有空格时发该标签当前语言的默认提示词，`promptEdited: false`）、`specPack { version, source, inline }`、`outputs`（theme 11 个 Key、排版里有 Banner 才出通用 Banner 1020×300 × 3、按模块出游戏类型 / 中部导航消息 / 底部导航前 5 个图标；`logo` / `gameCards` 为 `false`）、`cost: 50`。`outputs` 由平台按排版 + 规范包算出，业主不选。
- 演示网关：按 `styleTag` 选对应配色版本的现成整页图；`null` 用匹配到的版式自己的原稿配色（对照表见 request-example.md 第 4 节）。

## 上线前待定（方案第 9 节）

预充值 vs 业主自带 Key、费率与税费发票、退款规则、上游对账周期、失败是否收费的判定、每日额度与并发限制。
