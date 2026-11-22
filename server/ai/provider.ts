/**
 * AI 供应商适配接口。真实网关由开发/运维实现后在 ./index.ts 注册。
 * 不要在代码里写任何密钥：从环境变量或密钥管理服务读取。
 */
import type { AiGenerateRequest } from '../../shared/ai/contract.ts';

export interface ProviderImage {
  mime: string;
  data: Buffer;
  width: number;
  height: number;
}

export interface ProviderResult {
  upstreamId: string;
  /** 上游实际计费金额；未知时返回 undefined，任务标为待核对 */
  cost?: number;
  images: ProviderImage[];
}

export interface AiProvider {
  name: string;
  mock: boolean;
  currency: string;
  priceVersion: string;
  unitPrice(req: Pick<AiGenerateRequest, 'kind' | 'width' | 'height'>): number;
  generate(req: AiGenerateRequest): Promise<ProviderResult>;
}
