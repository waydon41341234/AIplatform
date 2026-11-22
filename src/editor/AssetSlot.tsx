/**
 * 素材槽位：上传 / AI 生成 / 素材库 三个入口。
 * 尺寸不符时不静默拉伸：先给出裁切、留边两种结果预览，业主采用后才上传。
 */
import { useRef, useState } from 'react';
import { useEditor } from '../state/editor.ts';
import { Icon, Modal } from '../components/ui.tsx';
import { api } from '../lib/api.ts';
import { fileSize, fitTo, UPSCALE_WARN, type FitMode } from '../lib/image.ts';
import { AiComposer } from './AiComposer.tsx';
import type { Asset } from '../../shared/project/model.ts';
import type { AiAssetKind } from '../../shared/ai/contract.ts';
import { LOGO_SPEC } from '../../shared/catalog/specs.ts';

export interface SlotSpec {
  /** 逻辑尺寸 */
  width: number;
  height: number;
  /** PNG 倍率（导航图标为 2） */
  scale?: number;
  /** LOGO：宽度在范围内即可 */
  logo?: boolean;
}

export function targetPixels(spec: SlotSpec, src?: { width: number; height: number }) {
  if (spec.logo && src) {
    const w = Math.round((src.width * LOGO_SPEC.height) / src.height);
    return { width: Math.min(LOGO_SPEC.maxWidth, Math.max(LOGO_SPEC.minWidth, w)), height: LOGO_SPEC.height };
  }
  const s = spec.scale ?? 1;
  return { width: spec.width * s, height: spec.height * s };
}

function sizeOk(spec: SlotSpec, a: { width: number; height: number; mime?: string }) {
  if (spec.logo) return a.height === LOGO_SPEC.height && a.width >= LOGO_SPEC.minWidth && a.width <= LOGO_SPEC.maxWidth;
  if (a.mime === 'image/svg+xml') return Math.abs(a.width / a.height - spec.width / spec.height) < 0.01; // 矢量按逻辑比例
  const t = targetPixels(spec);
  return a.width === t.width && a.height === t.height;
}

export function specText(spec: SlotSpec) {
  if (spec.logo) return `宽 ${LOGO_SPEC.minWidth}–${LOGO_SPEC.maxWidth} × 高 ${LOGO_SPEC.height}px，PNG/GIF`;
  const t = targetPixels(spec);
  return spec.scale ? `${spec.width}×${spec.height}（PNG 交付 ${t.width}×${t.height} @2x）` : `${t.width}×${t.height}px`;
}

export function AssetSlot({ label, spec, kind, slot, assetId, onAdopt, onClear, compact }: {
  label: string;
  spec: SlotSpec;
  kind: AiAssetKind;
  slot: string;
  assetId?: string;
  onAdopt: (a: Asset) => void;
  onClear?: () => void;
  compact?: boolean;
}) {
  const { project, update, notify } = useEditor();
  const input = useRef<HTMLInputElement>(null);
  const [fit, setFit] = useState<{ file: File; url: string; width: number; height: number } | null>(null);
  const [ai, setAi] = useState(false);
  const [lib, setLib] = useState(false);
  const asset = assetId ? project!.assets.find((a) => a.id === assetId) : undefined;

  const adopt = (a: Asset) => {
    update((d) => { if (!d.assets.some((x) => x.id === a.id)) d.assets.push(a); });
    onAdopt(a);
  };

  const onFile = async (file: File) => {
    try {
      if (spec.logo && !LOGO_SPEC.formats.includes(file.type as never)) return notify('LOGO 请使用 PNG 或 GIF', true);
      if (file.type === 'image/svg+xml') {
        const a = await api.uploadAsset(file, file.name);
        if (!sizeOk(spec, a)) return notify(`SVG 比例需为 ${spec.width}:${spec.height}`, true);
        return adopt(a);
      }
      const info = await fileSize(file);
      if (sizeOk(spec, info)) return adopt(await api.uploadAsset(file, file.name));
      setFit({ file, ...info });
    } catch (e) {
      notify((e as Error).message, true);
    }
  };

  return (
    <div className={`slot ${asset ? 'filled' : ''}`} style={compact ? { padding: 8 } : undefined}>
      <div className="pic" style={asset ? { backgroundImage: `url(${asset.url})` } : undefined} />
      <div className="info">
        <b>{label}</b>
        <span className="hint">{asset ? `${asset.width}×${asset.height} · ${asset.source === 'ai' ? 'AI 生成' : asset.source === 'library' ? '素材库' : '上传'}` : specText(spec)}</span>
      </div>
      <div className="row" style={{ gap: 2 }}>
        <button className="btn ghost sm icon" title="上传" aria-label={`上传${label}`} onClick={() => input.current?.click()}><Icon name="upload" size={15} /></button>
        <button className="btn ghost sm icon" title="AI 生成" aria-label={`AI 生成${label}`} onClick={() => setAi(true)}><Icon name="spark" size={15} /></button>
        <button className="btn ghost sm icon" title="素材库" aria-label={`从素材库选择${label}`} onClick={() => setLib(true)}><Icon name="grid" size={15} /></button>
        {asset && onClear && <button className="btn ghost sm icon" title="移除" aria-label={`移除${label}`} onClick={onClear}><Icon name="close" size={15} /></button>}
      </div>
      <input ref={input} type="file" hidden accept={spec.logo ? 'image/png,image/gif' : 'image/png,image/jpeg,image/webp,image/svg+xml,image/gif'} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onFile(f); }} />
      {fit && <FitDialog src={fit} spec={spec} label={label} onClose={() => setFit(null)} onAdopt={async (blob) => { setFit(null); try { adopt(await api.uploadAsset(blob, fit.file.name.replace(/\.\w+$/, '') + '.png')); } catch (e) { notify((e as Error).message, true); } }} />}
      {ai && <AiComposer label={label} kind={kind} slot={slot} pixels={targetPixels(spec, spec.logo ? { width: 450, height: 100 } : undefined)} onClose={() => setAi(false)} onAdopt={(a) => { setAi(false); adopt(a); }} />}
      {lib && <LibraryDialog spec={spec} onClose={() => setLib(false)} onPick={(a) => { setLib(false); adopt(a); }} />}
    </div>
  );
}

function FitDialog({ src, spec, label, onClose, onAdopt }: { src: { url: string; width: number; height: number }; spec: SlotSpec; label: string; onClose: () => void; onAdopt: (b: Blob) => void }) {
  const t = targetPixels(spec, src);
  const [previews, setPreviews] = useState<Record<FitMode, string> | null>(null);
  const [blobs, setBlobs] = useState<Record<FitMode, Blob> | null>(null);
  const [mode, setMode] = useState<FitMode>('cover');
  if (!previews) {
    Promise.all([fitTo(src.url, t.width, t.height, 'cover'), fitTo(src.url, t.width, t.height, 'contain')]).then(([c, n]) => {
      setBlobs({ cover: c, contain: n });
      setPreviews({ cover: URL.createObjectURL(c), contain: URL.createObjectURL(n) });
    });
  }
  const upscale = Math.max(t.width / src.width, t.height / src.height);
  return (
    <Modal title={`${label}尺寸需要调整`} sub={`需要 ${t.width}×${t.height}px，这张是 ${src.width}×${src.height}px。选一种处理方式：`} onClose={onClose}>
      {upscale > UPSCALE_WARN && <div className="notice warn">原图偏小，放大约 {upscale.toFixed(1)} 倍后可能不清晰，建议换一张更大的图。</div>}
      <div className="compare">
        {(['cover', 'contain'] as FitMode[]).map((m) => (
          <figure key={m} onClick={() => setMode(m)} style={{ cursor: 'pointer', outline: mode === m ? '2px solid var(--brand)' : 'none', borderRadius: 10, padding: 4 }}>
            {previews ? <img src={previews[m]} alt={m === 'cover' ? '裁切填满' : '完整留边'} /> : <div className="hint">生成预览…</div>}
            <figcaption>{m === 'cover' ? '裁切填满：画面铺满，边缘会被裁掉' : '完整留边：画面完整，多出的部分透明'}</figcaption>
          </figure>
        ))}
      </div>
      <div className="row" style={{ marginTop: 18 }}>
        <span className="spacer" />
        <button className="btn ghost" onClick={onClose}>重新选择图片</button>
        <button className="btn primary" disabled={!blobs} onClick={() => blobs && onAdopt(blobs[mode])}>采用这个结果</button>
      </div>
    </Modal>
  );
}

function LibraryDialog({ spec, onClose, onPick }: { spec: SlotSpec; onClose: () => void; onPick: (a: Asset) => void }) {
  const { project } = useEditor();
  const fits = project!.assets.filter((a) => sizeOk(spec, a));
  return (
    <Modal title="素材库" sub={`显示本项目中符合 ${specText(spec)} 的素材`} onClose={onClose}>
      <div className="notice info">公司集成库参考素材将在接入后显示在这里。目前可复用本项目已上传或生成的素材。</div>
      {fits.length === 0 && <div className="empty">还没有符合尺寸的素材</div>}
      <div className="composer" style={{ position: 'static', transform: 'none', width: '100%', boxShadow: 'none', padding: 0, border: 0, background: 'transparent' }}>
        <div className="cands">
          {fits.map((a) => <div key={a.id} className="cand" onClick={() => onPick(a)} title={a.name}><img src={a.url} alt={a.name} /></div>)}
        </div>
      </div>
    </Modal>
  );
}
