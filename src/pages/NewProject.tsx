/** 新建项目向导：① 品牌与等级 ② 版式 ③ 配色。每一步只有一个主操作。 */
import { useMemo, useState } from 'react';
import { api } from '../lib/api.ts';
import { go } from '../lib/router.ts';
import { Guess, Icon } from '../components/ui.tsx';
import { CATEGORIES, LEVELS, LEVEL_ORDER, scopeFor, type LevelId } from '../../shared/catalog/levels.ts';
import { PALETTES, TEMPLATES } from '../../shared/catalog/templates.ts';
import { createProject } from '../../shared/project/model.ts';
import { renderHomeSvg } from '../../shared/render/svg.ts';
import type { BaseKey } from '../../shared/theme/keys.ts';
import { BaseColorEditor } from '../editor/BaseColorEditor.tsx';

export function LevelPicker({ value, onChange }: { value: LevelId; onChange: (l: LevelId) => void }) {
  return (
    <>
      <div className="level-cards" role="radiogroup" aria-label="定制等级">
        {LEVEL_ORDER.map((id) => (
          <button key={id} role="radio" aria-checked={value === id} className={`choice ${value === id ? 'on' : ''}`} onClick={() => onChange(id)}>
            <h3><span className="radio" />{LEVELS[id].label}</h3>
            <div className="muted">{LEVELS[id].summary}</div>
            <div className="hint" style={{ marginTop: 6 }}>共 {LEVELS[id].categories.length} 类页面/模块</div>
          </button>
        ))}
      </div>
      <div className="card" style={{ padding: 16, marginTop: 14 }}>
        <div className="muted">当前可设计：</div>
        <div className="scope-list">
          {scopeFor(value, 'h5').map((c) => <span key={c} className="chip on">{CATEGORIES[c].label}</span>)}
        </div>
        <div className="hint" style={{ marginTop: 10 }}>PC 端按规范只覆盖首页、彩金池、页脚、菜单栏。切换等级不会删除已做的设计。</div>
      </div>
    </>
  );
}

export function NewProjectPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<LevelId>('normal');
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [paletteId, setPaletteId] = useState(PALETTES[0].id);
  const [colors, setColors] = useState<Record<BaseKey, string>>({ ...PALETTES[0].colors });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const preview = useMemo(() => {
    const p = createProject({ name: name || '品牌名称', level, templateId, paletteColors: colors }, 'preview');
    p.pages.home.height = 1100;
    return renderHomeSvg(p);
  }, [name, level, templateId, colors]);

  const tplPreviews = useMemo(
    () => TEMPLATES.map((t) => {
      const p = createProject({ name: name || '品牌名称', level, templateId: t.id, paletteColors: colors }, 'tpl');
      p.pages.home.height = 1000;
      return { t, svg: renderHomeSvg(p) };
    }),
    [name, level, colors],
  );

  const submit = async () => {
    setBusy(true);
    setErr('');
    try {
      const p = await api.createProject({ name: name.trim(), level, templateId, paletteColors: colors, paletteId });
      go(`/p/${p.id}`);
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };

  const canNext = step === 0 ? name.trim().length > 0 : true;
  const titles = ['品牌名称与定制等级', '选择一个版式', '确认品牌配色'];

  return (
    <div className="wizard">
      <div className="hint">新建定制项目 · 第 {step + 1} 步，共 3 步</div>
      <h1 style={{ margin: '4px 0 0', fontSize: 24 }}>{titles[step]}</h1>
      <div className="wizard-steps">{[0, 1, 2].map((i) => <span key={i} className={i <= step ? 'on' : ''} />)}</div>

      {step === 0 && (
        <div className="stack" style={{ gap: 24 }}>
          <div>
            <label className="label" htmlFor="brand">品牌名称</label>
            <input id="brand" className="input" style={{ maxWidth: 420, height: 44 }} autoFocus placeholder="例如：星河娱乐" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && canNext && setStep(1)} />
          </div>
          <div>
            <div className="label">选择定制版等级</div>
            <LevelPicker value={level} onChange={setLevel} />
          </div>
        </div>
      )}

      {step === 1 && (
        <>
          <p className="muted" style={{ marginTop: 0 }}>版式决定页面的初始组合，之后每个区域都还能单独换布局。 <Guess text="示例版式" /></p>
          <div className="tpl-grid">
            {tplPreviews.map(({ t, svg }) => (
              <button key={t.id} className={`choice ${templateId === t.id ? 'on' : ''}`} onClick={() => setTemplateId(t.id)}>
                <div className="thumb" dangerouslySetInnerHTML={{ __html: svg }} />
                <h3><span className="radio" />{t.label}</h3>
                <div className="hint">{t.description}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <div className="split">
          <div className="stack" style={{ gap: 20 }}>
            <div>
              <div className="label">先选一套推荐配色</div>
              <div className="palette-row">
                {PALETTES.map((pl) => (
                  <button key={pl.id} className={`palette ${paletteId === pl.id ? 'on' : ''}`} onClick={() => { setPaletteId(pl.id); setColors({ ...pl.colors }); }}>
                    <div className="dots">{(['primary', 'lead', 'bg_1', 'accent_1', 'accent_2', 'accent_3'] as BaseKey[]).map((k) => <i key={k} style={{ background: pl.colors[k] }} />)}</div>
                    <div style={{ fontSize: 13 }}>{pl.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="label">需要的话再微调每个颜色</div>
              <BaseColorEditor colors={colors} onChange={(k, v) => { setColors((c) => ({ ...c, [k]: v })); setPaletteId(''); }} />
            </div>
          </div>
          <div>
            <div className="label">首页预览</div>
            <div className="preview-phone" dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
        </div>
      )}

      {err && <div className="notice warn" style={{ marginTop: 16 }}><Icon name="alert" />{err}</div>}
      <div className="wizard-foot">
        <button className="btn ghost" onClick={() => (step === 0 ? go('/') : setStep(step - 1))}><Icon name="back" />{step === 0 ? '取消' : '上一步'}</button>
        {step < 2 ? (
          <button className="btn primary lg" disabled={!canNext} onClick={() => setStep(step + 1)}>下一步</button>
        ) : (
          <button className="btn primary lg" disabled={busy} onClick={submit}>{busy ? '正在创建…' : '创建并开始设计'}</button>
        )}
      </div>
    </div>
  );
}
