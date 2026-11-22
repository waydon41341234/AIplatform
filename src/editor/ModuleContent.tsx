/** 各模块“内容”页签：只放业主需要的选项，规范尺寸由平台控制。 */
import { useEditor } from '../state/editor.ts';
import { Seg, Icon } from '../components/ui.tsx';
import { AssetSlot } from './AssetSlot.tsx';
import { BANNER_SPECS, CARD_SPECS, ICON_SPECS, TOPBAR_HEIGHT, type BannerSpecId, type CardSizeId } from '../../shared/catalog/specs.ts';
import { BOTTOMNAV_ENTRIES, MIDNAV_ENTRIES, NAV_MODE_LABELS, STATE_LABELS, requiredNavEntries, type ModuleType, type NavMode } from '../../shared/catalog/home.ts';
import type { Project } from '../../shared/project/model.ts';

type Upd = (fn: (d: Project) => void, o?: { merge?: boolean }) => void;

function TextList({ items, onChange, max = 8, label }: { items: string[]; onChange: (v: string[]) => void; max?: number; label: string }) {
  return (
    <div className="stack" style={{ gap: 6 }}>
      {items.map((t, i) => (
        <div key={i} className="row">
          <input className="input" value={t} maxLength={12} aria-label={`${label} ${i + 1}`} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          <button className="btn ghost sm icon" aria-label="删除" disabled={items.length <= 1} onClick={() => onChange(items.filter((_, j) => j !== i))}><Icon name="close" size={14} /></button>
        </div>
      ))}
      {items.length < max && <button className="btn sm" onClick={() => onChange([...items, `新${label}`])}>添加{label}</button>}
    </div>
  );
}

export function ModuleContent({ type }: { type: ModuleType }) {
  const { project, update } = useEditor();
  const p = project!;
  const m = p.pages.home.modules;
  const u: Upd = (fn, o) => update(fn, o);

  switch (type) {
    case 'topbar': {
      const t = m.topbar.props;
      return (
        <div>
          <div className="field">
            <label className="label">高度 <b>{t.height}px</b> <span className="hint">（{TOPBAR_HEIGHT.min}–{TOPBAR_HEIGHT.max}px）</span></label>
            <input className="range" type="range" min={TOPBAR_HEIGHT.min} max={TOPBAR_HEIGHT.max} value={t.height} onChange={(e) => u((d) => { d.pages.home.modules.topbar.props.height = Number(e.target.value); }, { merge: true })} />
          </div>
          <div className="field">
            <label className="label">LOGO</label>
            <AssetSlot label="LOGO" kind="icon" slot="topbar.logo" spec={{ width: 450, height: 100, logo: true }} assetId={t.logo} onAdopt={(a) => u((d) => { d.pages.home.modules.topbar.props.logo = a.id; })} onClear={() => u((d) => { delete d.pages.home.modules.topbar.props.logo; })} />
            <div className="hint">页面中按栏高等比显示，原图不会被改动。</div>
          </div>
          <div className="field">
            <label className="label">背景</label>
            <Seg value={t.bgMode} options={[{ value: 'color', label: '纯色' }, { value: 'image', label: '图片' }]} onChange={(v) => u((d) => { d.pages.home.modules.topbar.props.bgMode = v; })} />
            {t.bgMode === 'image' && (
              <div style={{ marginTop: 8 }}>
                <AssetSlot label="顶部栏背景" kind="background" slot="topbar.bg" spec={{ width: 750, height: t.height }} assetId={t.bgImage} onAdopt={(a) => u((d) => { d.pages.home.modules.topbar.props.bgImage = a.id; })} onClear={() => u((d) => { delete d.pages.home.modules.topbar.props.bgImage; })} />
                <div className="hint">图片下方保留底色，透明处可见。切回纯色不会丢失颜色设置。</div>
              </div>
            )}
          </div>
          <label className="row field" style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={t.showSearch} onChange={(e) => u((d) => { d.pages.home.modules.topbar.props.showSearch = e.target.checked; })} />
            显示搜索按钮
          </label>
          <div className="hint">登录/注册按钮和余额框会根据上方“未登录 / 已登录”自动切换。</div>
        </div>
      );
    }
    case 'banner': {
      const b = m.banner.props;
      const spec = BANNER_SPECS[b.spec];
      return (
        <div>
          <div className="field">
            <label className="label">Banner 规格</label>
            <div className="stack" style={{ gap: 6 }}>
              {(Object.keys(BANNER_SPECS) as BannerSpecId[]).map((id) => (
                <label key={id} className="row" style={{ cursor: 'pointer' }}>
                  <input type="radio" name="bspec" checked={b.spec === id} onChange={() => u((d) => { d.pages.home.modules.banner.props.spec = id; })} />
                  {BANNER_SPECS[id].label} <span className="hint">{BANNER_SPECS[id].width}×{BANNER_SPECS[id].height}</span>
                </label>
              ))}
            </div>
            {b.images.length > 0 && <div className="hint" style={{ marginTop: 6 }}>换规格后，已有图片若尺寸不符会在检查中提示。</div>}
          </div>
          <div className="field">
            <label className="label">轮播图片（{b.images.length} 张）</label>
            {b.images.map((id, i) => (
              <div key={id + i} onClick={() => u((d) => { d.pages.home.modules.banner.props.active = i; })}>
                <AssetSlot compact label={`第 ${i + 1} 张${b.active === i ? '（预览中）' : ''}`} kind="banner" slot={`banner.${b.spec}`} spec={spec} assetId={id}
                  onAdopt={(a) => u((d) => { d.pages.home.modules.banner.props.images[i] = a.id; })}
                  onClear={() => u((d) => { const bp = d.pages.home.modules.banner.props; bp.images.splice(i, 1); bp.active = Math.min(bp.active, Math.max(0, bp.images.length - 1)); })} />
              </div>
            ))}
            <AssetSlot label="添加一张" kind="banner" slot={`banner.${b.spec}`} spec={spec} onAdopt={(a) => u((d) => { const bp = d.pages.home.modules.banner.props; bp.images.push(a.id); bp.active = bp.images.length - 1; })} />
            <div className="hint">Banner 可交付后在后台自行替换，不放图也能交付。</div>
          </div>
          <div className="field">
            <label className="label">轮播指示器</label>
            <div className="row wrap">
              {(['style1', 'style2', 'style3', 'style4'] as const).map((s, i) => (
                <button key={s} className={`chip ${b.indicator === s ? 'on' : ''}`} onClick={() => u((d) => { d.pages.home.modules.banner.props.indicator = s; })}>样式 {i + 1}</button>
              ))}
            </div>
            <div className="hint" style={{ marginTop: 6 }}>指示点数量会跟着图片数量变化。自行设计指示器即将开放。</div>
          </div>
        </div>
      );
    }
    case 'midnav':
    case 'bottomnav':
      return <NavContent kind={type} />;
    case 'gamecards': {
      const g = m.gamecards.props;
      return (
        <div>
          <div className="field">
            <label className="label">卡片规格</label>
            <select className="select" value={g.cardSize} onChange={(e) => u((d) => { d.pages.home.modules.gamecards.props.cardSize = e.target.value as CardSizeId; })}>
              {(Object.keys(CARD_SPECS) as CardSizeId[]).map((id) => <option key={id} value={id}>{CARD_SPECS[id].width}×{CARD_SPECS[id].height}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">卡片风格</label>
            <Seg value={p.modes.cardStyle as 'classic' | 'western'} options={[{ value: 'classic', label: '经典' }, { value: 'western', label: '欧美' }]} onChange={(v) => u((d) => { d.modes.cardStyle = v; })} />
          </div>
          <div className="field">
            <label className="label">预览卡片数量 <b>{g.count}</b></label>
            <input className="range" type="range" min={2} max={24} value={g.count} onChange={(e) => u((d) => { d.pages.home.modules.gamecards.props.count = Number(e.target.value); }, { merge: true })} />
          </div>
          <label className="row field" style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={g.showLabel} onChange={(e) => u((d) => { d.pages.home.modules.gamecards.props.showLabel = e.target.checked; })} />显示角标
          </label>
          <div className="field">
            <label className="label">卡片画面（可选）</label>
            {Array.from({ length: Math.min(g.count, 6) }, (_, i) => (
              <AssetSlot key={i} compact label={`卡片 ${i + 1}`} kind="card" slot={`gamecards.${g.cardSize}`} spec={CARD_SPECS[g.cardSize]} assetId={g.images[i]}
                onAdopt={(a) => u((d) => { d.pages.home.modules.gamecards.props.images[i] = a.id; })}
                onClear={() => u((d) => { d.pages.home.modules.gamecards.props.images[i] = undefined as never; })} />
            ))}
          </div>
        </div>
      );
    }
    case 'gamemenu':
      return (
        <div className="field">
          <label className="label">游戏分类</label>
          <TextList label="分类" max={6} items={m.gamemenu.props.categories} onChange={(v) => u((d) => { d.pages.home.modules.gamemenu.props.categories = v; d.pages.home.modules.gamemenu.props.active = Math.min(d.pages.home.modules.gamemenu.props.active, v.length - 1); })} />
          <div className="hint" style={{ marginTop: 8 }}>分类图标规格 {ICON_SPECS.gametype.width}×{ICON_SPECS.gametype.height}，PNG @2x 为 {ICON_SPECS.gametype.width * 2}×{ICON_SPECS.gametype.height * 2}。图标上传即将开放。</div>
        </div>
      );
    case 'sidebar':
      return (
        <div className="field">
          <label className="label">侧边栏入口</label>
          <TextList label="入口" max={10} items={m.sidebar.props.entries} onChange={(v) => u((d) => { d.pages.home.modules.sidebar.props.entries = v; })} />
          <div className="hint" style={{ marginTop: 8 }}>在画布上方切到“打开侧边栏”即可预览。</div>
        </div>
      );
    case 'jackpot':
      return (
        <div>
          <div className="field"><label className="label">标题</label><input className="input" maxLength={12} value={m.jackpot.props.title} onChange={(e) => u((d) => { d.pages.home.modules.jackpot.props.title = e.target.value; }, { merge: true })} /></div>
          <div className="field"><label className="label">示例金额</label><input className="input" maxLength={20} value={m.jackpot.props.amount} onChange={(e) => u((d) => { d.pages.home.modules.jackpot.props.amount = e.target.value; }, { merge: true })} /><div className="hint">金额是数据文字，不会烘焙进背景图。可试试长金额看排版。</div></div>
        </div>
      );
    case 'footer':
      return (
        <div>
          <div className="field"><label className="label">版权文字</label><input className="input" maxLength={60} value={m.footer.props.text} onChange={(e) => u((d) => { d.pages.home.modules.footer.props.text = e.target.value; }, { merge: true })} /></div>
          <div className="field"><label className="label">链接</label><TextList label="链接" max={5} items={m.footer.props.links} onChange={(v) => u((d) => { d.pages.home.modules.footer.props.links = v; })} /></div>
        </div>
      );
  }
}

function NavContent({ kind }: { kind: 'midnav' | 'bottomnav' }) {
  const { project, update } = useEditor();
  const np = project!.pages.home.modules[kind].props;
  const catalog = kind === 'midnav' ? MIDNAV_ENTRIES : BOTTOMNAV_ENTRIES;
  const required = requiredNavEntries(kind, np.mode);
  const spec = ICON_SPECS[kind];
  const designed = np.mode === 'configurable' ? catalog.map((e) => e.id) : np.entries;

  return (
    <div>
      <div className="field">
        <label className="label">入口方式</label>
        <div className="stack" style={{ gap: 6 }}>
          {(Object.keys(NAV_MODE_LABELS) as NavMode[]).map((mode) => (
            <label key={mode} className={`choice ${np.mode === mode ? 'on' : ''}`} style={{ padding: 12 }}>
              <div className="row"><input type="radio" checked={np.mode === mode} onChange={() => update((d) => {
                const t = d.pages.home.modules[kind].props;
                t.mode = mode;
                // 切到固定模式时，确保必交入口在列表中；已做的图标全部保留
                if (mode === 'fixed') for (const id of requiredNavEntries(kind, 'fixed')) if (!t.entries.includes(id)) t.entries.push(id);
              })} /><b>{NAV_MODE_LABELS[mode].label}</b></div>
              <div className="hint" style={{ marginLeft: 24 }}>{NAV_MODE_LABELS[mode].help}</div>
            </label>
          ))}
        </div>
      </div>
      {np.mode === 'fixed' && (
        <div className="field">
          <label className="label">要显示的入口</label>
          <div className="row wrap">
            {catalog.map((e) => {
              const req = required.includes(e.id);
              const on = np.entries.includes(e.id);
              return (
                <button key={e.id} className={`chip ${on ? 'on' : ''}`} disabled={req} title={req ? '必交入口' : ''} onClick={() => update((d) => {
                  const t = d.pages.home.modules[kind].props;
                  t.entries = on ? t.entries.filter((x) => x !== e.id) : catalog.map((c) => c.id).filter((id) => id === e.id || t.entries.includes(id));
                })}>{e.label}{req ? ' · 必交' : ''}</button>
              );
            })}
          </div>
        </div>
      )}
      <div className="field">
        <label className="label">图标 <span className="hint">逻辑 {spec.width}×{spec.height}，PNG 交付 @2x {spec.width * 2}×{spec.height * 2}</span></label>
        {designed.map((id) => {
          const e = catalog.find((x) => x.id === id)!;
          return e.states.map((st) => (
            <AssetSlot key={`${id}:${st}`} compact kind="icon" slot={`${kind}.${id}.${st}`} spec={{ width: spec.width, height: spec.height, scale: 2 }}
              label={`${e.label}${e.states.length > 1 ? ' · ' + STATE_LABELS[st] : ''}${required.includes(id) ? '' : '（选配）'}`}
              assetId={np.icons[`${id}:${st}`]}
              onAdopt={(a) => update((d) => { d.pages.home.modules[kind].props.icons[`${id}:${st}`] = a.id; })}
              onClear={() => update((d) => { delete d.pages.home.modules[kind].props.icons[`${id}:${st}`]; })} />
          ));
        })}
        <div className="hint">彩色图标可选提供，不影响交付。入口清单需与真实后台核对。</div>
      </div>
    </div>
  );
}
