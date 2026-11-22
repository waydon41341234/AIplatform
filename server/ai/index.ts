/**
 * 选择当前使用的 AI 供应商。
 * 真实网关接入：实现 AiProvider，并通过环境变量 AI_PROVIDER 选择。没有实现前一律使用演示网关。
 */
import type { AiProvider } from './provider.ts';
import { mockProvider } from './mockProvider.ts';

const providers: Record<string, AiProvider> = { mock: mockProvider };

export function currentProvider(): AiProvider {
  const name = process.env.AI_PROVIDER ?? 'mock';
  const p = providers[name];
  if (!p) throw new Error(`未注册的 AI_PROVIDER：${name}`);
  return p;
}
