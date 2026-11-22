/**
 * AI 创作框：一句话要求 + 效果标签 + 数量 → 显示预计费用 → 业主确认后才生成。
 * 只通过 /api/ai/* 网关调用，前端不持有任何模型或密钥。
 * 生成结果是候选，点“采用这一张”才回填页面。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEditor } from '../state/editor.ts';
import { api } from '../lib/api.ts';
import { Guess, Icon } from '../components/ui.tsx';
import type { AiAccount, AiAssetKind, AiEstimate } from '../../shared/ai/contract.ts';
import type { Asset } from '../../shared/project/model.ts';
import { resolveKey } from '../../shared/theme/resolve.ts';

/** 效果标签。【推测】正式词库、参考图与互斥规则由内部维护后替换（方案「关键提示词的效果预览」）。 */
const EFFECTS: { id: string; label: string; desc: string; group?: string }[] = [
  { id: 'flat', label: '扁平', desc: '简洁色块，无立体感', group: 'depth' },
  { id: '3d', label: '立体', desc: '有体积和光影', group: 'depth' },
  { id: 'glass', label: '玻璃质感', desc: '通透、有高光和折射', group: 'material' },
  { id: 'frosted', label: '磨砂', desc: '柔和、半透明颗粒感', group: 'material' },
  { id: 'metal', label: '金属', desc: '金属反光与拉丝', group: 'material' },
  { id: 'glow', label: '发光', desc: '边缘或主体带光晕' },
  { id: 'outline', label: '描边', desc: '清晰的外轮廓线' },
];

export function AiComposer({ label, kind, slot, pixels, onClose, onAdopt }: {
  label: string;
  kind: AiAssetKind;
  slot: string;
  pixels: { width: number; height: number };
  onClose: () => void;
  onAdopt: (a: Asset) => void;
}) {
  const { project, update, notify } = useEditor();
  const [text, setText] = useState('');
  const [effects, setEffects] = useState<string[]>([]);
  const [count, setCount] = useState(kind === 'icon' ? 1 : 2);
  const [est, setEst] = useState<AiEstimate | null>(null);
  const [acc, setAcc] = useState<AiAccount | null>(null);
  const [busy, setBusy] = useState(false);
  const [cands, setCands] = useState<Asset[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const idem = useRef(crypto.randomUUID());

  useEffect(() => { api.aiAccount().then(setAcc).catch(() => {}); }, []);
  useEffect(() => {
    api.aiEstimate({ kind, width: pixels.width, height: pixels.height, count }).then(setEst).catch(() => setEst(null));
  }, [kind, pixels.width, pixels.height, count]);

  const toggle = (id: string) => {
    const g = EFFECTS.find((e) => e.id === id)?.group;
    setEffects((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur.filter((x) => !g || EFFECTS.find((e) => e.id === x)?.group !== g), id]));
  };

  /** 系统拼接的完整要求：业主只写一句话，规范约束由平台补齐。 */
  const fullPrompt = useMemo(() => {
    const p = project!;
    const primary = resolveKey(p.theme, 'primary').hex;
    const fx = effects.map((id) => EFFECTS.find((e) => e.id === id)!.label).join('、');
    return [text.trim() || label, fx && `效果：${fx}`, `用途：${label}`, `品牌：${p.name}`, `主色 ${primary}`, `输出 ${pixels.width}×${pixels.height}px`].filter(Boolean).join('；');
  }, [project, text, effects, label, pixels]);

  const generate = async () => {
    setBusy(true);
    try {
      const r = await api.aiGenerate({ projectId: project!.id, kind, slot, prompt: fullPrompt, width: pixels.width, height: pixels.height, count, idempotencyKey: idem.current });
      idem.current = crypto.randomUUID();
      if (r.job.status === 'failed') notify(`生成失败：${r.job.error ?? '未知原因'}。已退回预留费用，已采用的素材没有变化。`, true);
      setCands(r.assets);
      setPick(r.assets[0]?.id ?? null);
      // 候选进入项目素材（生成历史），但不替换页面
      update((d) => { for (const a of r.assets) if (!d.assets.some((x) => x.id === a.id)) d.assets.push(a); });
      api.aiAccount().then(setAcc).catch(() => {});
      api.aiEstimate({ kind, width: pixels.width, height: pixels.height, count }).then(setEst).catch(() => {});
    } catch (e) {
      notify((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="overlay" style={{ background: 'rgba(0,0,0,0.35)' }} onMouseDown={onClose} />
      <div className="composer" role="dialog" aria-label={`AI 生成${label}`}>
        <div className="row" style={{ marginBottom: 10 }}>
          <Icon name="spark" />
          <b>AI 生成 · {label}</b>
          <span className="hint">{pixels.width}×{pixels.height}px</span>
          {acc?.mock && <span className="badge warn">演示网关</span>}
          <span className="spacer" />
          <button className="btn ghost sm icon" onClick={onClose} aria-label="关闭"><Icon name="close" size={15} /></button>
        </div>

        {cands.length > 0 && (
          <>
            <div className="hint" style={{ marginBottom: 8 }}>选一张满意的候选，点「采用这一张」才会放进页面</div>
            <div className="cands">
              {cands.map((a) => <div key={a.id} className={`cand ${pick === a.id ? 'on' : ''}`} onClick={() => setPick(a.id)}><img src={a.url} alt="候选" /></div>)}
            </div>
          </>
        )}

        <textarea autoFocus placeholder={`用一句话描述你想要的${label}，例如：蓝紫色星空背景，中间有金色奖杯`} value={text} onChange={(e) => setText(e.target.value)} maxLength={200} />
        <div className="row wrap" style={{ margin: '6px 0 12px', position: 'relative' }}>
          {EFFECTS.map((e) => (
            <button key={e.id} className={`chip ${effects.includes(e.id) ? 'on' : ''}`} onClick={() => toggle(e.id)} onMouseEnter={() => setHover(e.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(e.id)} onBlur={() => setHover(null)}>
              {e.label}
            </button>
          ))}
          {hover && (
            <div className="card" style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, padding: 12, width: 240, zIndex: 2, boxShadow: 'var(--shadow)' }}>
              <b>{EFFECTS.find((e) => e.id === hover)!.label}</b>
              <div className="hint">{EFFECTS.find((e) => e.id === hover)!.desc}</div>
              <div className="hint" style={{ marginTop: 6 }}>效果参考图待内部提供 <Guess text="示例" /></div>
            </div>
          )}
        </div>
        <details style={{ marginBottom: 12 }}>
          <summary className="hint" style={{ cursor: 'pointer' }}>查看平台补齐后的完整要求</summary>
          <div className="hint" style={{ marginTop: 6 }}>{fullPrompt}</div>
        </details>
        <div className="row">
          <span className="hint">数量</span>
          <select className="select" style={{ width: 70, padding: '4px 8px' }} value={count} onChange={(e) => setCount(Number(e.target.value))} aria-label="生成数量">
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="fee">
            {est ? <>预计 <b>{est.total} {est.currency}</b>（{est.unitPrice}/张）· 余额 {est.balance}</> : '正在估价…'}
          </span>
          <span className="spacer" />
          {pick && <button className="btn" onClick={() => onAdopt(cands.find((c) => c.id === pick)!)}><Icon name="check" size={15} />采用这一张</button>}
          <button className="btn primary" disabled={busy || !est?.enough} onClick={generate}>
            {busy ? '生成中…' : est && !est.enough ? '余额不足' : cands.length ? `再生成 · ${est?.total ?? ''}` : `生成 · ${est?.total ?? ''}`}
          </button>
        </div>
      </div>
    </>
  );
}
