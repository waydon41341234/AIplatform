# 后端接口（v1）

基础地址 `/api`，JSON。错误统一为 `{ "error": "给业主看的中文信息" }`，5xx 不暴露内部细节。
类型定义见 `shared/project/model.ts`、`shared/ai/contract.ts`。

## 项目

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/projects` | 列表：`{ id, name, level, templateId, updatedAt, primary }[]`，按更新时间倒序 |
| POST | `/projects` | 新建。body：`NewProjectInput { name, level, templateId, paletteColors?, paletteId? }` → 201 `Project` |
| GET | `/projects/:id` | 读取完整 `Project`（经 `migrate()`） |
| PUT | `/projects/:id` | 保存。body：`{ project, baseUpdatedAt? }`；`baseUpdatedAt` 与服务器不一致时 409 → `{ updatedAt }` |
| POST | `/projects/:id/duplicate` | 复制 → 201 `Project` |

`:id` 只允许 `[A-Za-z0-9_-]{1,64}`。

## 素材

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/assets` | 原始字节上传。`Content-Type` 为 png/jpeg/gif/svg+xml/webp；`X-Filename` 为 URI 编码文件名；≤15MB。服务端读取真实像素尺寸 → 201 `Asset` |
| GET | `/assets/:file` | 读取素材 |

上传后素材还不属于任何项目；前端把 `Asset` 写入 `project.assets` 并保存才算采用。

## AI 网关

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/ai/account` | `AiAccount { currency, balance, mock, providerName }` |
| POST | `/ai/estimate` | body `{ kind, width, height, count }` → `AiEstimate`（单价、总价、预留、余额、是否足够、价格版本） |
| POST | `/ai/jobs` | body `AiGenerateRequest`（含 `idempotencyKey`）→ 201 `{ job: AiJob, assets: Asset[] }`；余额不足 402 |
| GET | `/ai/ledger` | 账本流水（新到旧） |

上线需要新增（尚未实现）：登录鉴权、按业主过滤以上全部接口、充值、任务查询与异步轮询、上游对账。
