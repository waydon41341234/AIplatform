/**
 * 业主 AI 网关接口契约（前后端共用的类型）。
 *
 * 平台只依赖这份契约，不依赖任何具体模型/供应商。首版后端用 MockProvider
 * （server/ai/mockProvider.ts）返回占位图，不产生真实费用。
 * 开发/运维接入真实网关时：实现 server/ai/provider.ts 的 AiProvider 接口并在 server/ai/index.ts 注册，
 * 前端无需改动。详见 docs/ai-gateway.md。
 *
 * 规则（来自方案「AI 费用由业主承担」）：
 * - 只有业主明确点击“生成”才计费；提交前必须展示预计费用。
 * - 服务端先原子预留额度，完成后按实际结算并释放差额。
 * - idempotencyKey 防止重复点击造成重复扣费。
 * - 密钥只存服务端，绝不下发浏览器或写入项目文件。
 */

export type AiAssetKind = 'banner' | 'icon' | 'background' | 'card';

export interface AiGenerateRequest {
  projectId: string;
  kind: AiAssetKind;
  /** 素材槽位，例如 banner:general、bottomnav:home:active */
  slot: string;
  /** 业主的一句话要求 + 系统拼接的规范约束 */
  prompt: string;
  /** 目标像素（已含 @2x） */
  width: number;
  height: number;
  count: number;
  idempotencyKey: string;
}

export interface AiEstimate {
  currency: string;
  unitPrice: number;
  count: number;
  total: number;
  /** 本次预留上限 */
  reserve: number;
  balance: number;
  enough: boolean;
  /** 价格版本（定价变更时按提交时快照结算） */
  priceVersion: string;
}

export type AiJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'needs-review';

export interface AiJob {
  id: string;
  projectId: string;
  slot: string;
  status: AiJobStatus;
  request: Omit<AiGenerateRequest, 'idempotencyKey'>;
  estimate: AiEstimate;
  charged: number;
  /** 上游请求 ID（对账用） */
  upstreamId?: string;
  error?: string;
  createdAt: string;
  finishedAt?: string;
  /** 生成的候选素材 ID（采用前不进入正式页面） */
  assetIds: string[];
}

export type LedgerType = 'topup' | 'reserve' | 'charge' | 'release' | 'adjust';

export interface LedgerEntry {
  id: string;
  type: LedgerType;
  amount: number;
  jobId?: string;
  note: string;
  at: string;
}

export interface AiAccount {
  currency: string;
  balance: number;
  /** 是否为演示网关（无真实费用） */
  mock: boolean;
  providerName: string;
}
