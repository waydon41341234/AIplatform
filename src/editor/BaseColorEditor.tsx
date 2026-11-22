/** 11 个基础色编辑：按用途分组，色块 + HEX。业主看到的是用途名，Key 在高级设置里。 */
import { useEffect, useState } from 'react';
import { BASE_KEYS, BASE_KEY_INFO, type BaseKey } from '../../shared/theme/keys.ts';
import { parseHex } from '../../shared/theme/resolve.ts';

const GROUPS = ['主色', '文字', '背景', '辅助色'] as const;

export function HexInput({ value, onChange, ariaLabel }: { value: string; onChange: (hex: string) => void; ariaLabel: string }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  const valid = parseHex(text) !== null;
  return (
    <span className="row" style={{ gap: 6 }}>
      <label className="swatch" style={{ cursor: 'pointer' }} title="点击取色">
        <i style={{ background: value }} />
        <input type="color" aria-label={ariaLabel} value={value.slice(0, 7)} onChange={(e) => onChange(e.target.value.toUpperCase())} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
      </label>
      <input
        className="input"
        style={{ width: 96, padding: '5px 8px', fontFamily: 'monospace', borderColor: valid ? undefined : 'var(--err)' }}
        value={text}
        aria-label={`${ariaLabel} HEX`}
        onChange={(e) => {
          setText(e.target.value);
          const p = parseHex(e.target.value);
          if (p) onChange(p.hex);
        }}
        onBlur={() => setText(value)}
      />
    </span>
  );
}

export function BaseColorEditor({ colors, onChange, showKeys }: { colors: Record<BaseKey, string>; onChange: (k: BaseKey, hex: string) => void; showKeys?: boolean }) {
  return (
    <div className="stack" style={{ gap: 14 }}>
      {GROUPS.map((g) => (
        <div key={g}>
          <div className="hint" style={{ marginBottom: 6 }}>{g}</div>
          <div className="stack" style={{ gap: 6 }}>
            {BASE_KEYS.filter((k) => BASE_KEY_INFO[k].group === g).map((k) => (
              <div key={k} className="row">
                <HexInput value={colors[k]} ariaLabel={BASE_KEY_INFO[k].label} onChange={(v) => onChange(k, v)} />
                <span>{BASE_KEY_INFO[k].label}</span>
                {showKeys && <code className="hint">{k}</code>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
