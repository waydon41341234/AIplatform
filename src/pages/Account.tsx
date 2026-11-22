import { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';
import type { AiAccount, LedgerEntry } from '../../shared/ai/contract.ts';

const TYPE: Record<string, string> = { topup: '充值', reserve: '预留', release: '释放', charge: '扣费', adjust: '调整' };

export function AccountPage() {
  const [acc, setAcc] = useState<AiAccount | null>(null);
  const [rows, setRows] = useState<LedgerEntry[]>([]);
  useEffect(() => { api.aiAccount().then(setAcc); api.aiLedger().then(setRows); }, []);
  return (
    <div className="home">
      <h1 style={{ fontSize: 24, margin: '0 0 6px' }}>AI 余额与用量</h1>
      <p className="muted" style={{ marginTop: 0 }}>上传素材、选布局、调颜色都不收费。只有你点击「生成」时才会按显示的价格扣费。</p>
      {acc && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div className="hint">当前余额</div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>{acc.balance} <span style={{ fontSize: 16 }}>{acc.currency}</span></div>
          <div className="row" style={{ marginTop: 8 }}>
            {acc.mock && <span className="badge warn">演示网关：不产生真实费用，充值功能由开发同事接入</span>}
            <span className="hint">服务：{acc.providerName}</span>
          </div>
        </div>
      )}
      <div className="card" style={{ padding: 8 }}>
        {rows.length === 0 && <div className="empty" style={{ border: 0 }}>还没有用量记录</div>}
        {rows.map((r) => (
          <div key={r.id} className="row" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>
            <span className="badge">{TYPE[r.type]}</span>
            <span>{r.note}</span>
            <span className="spacer" />
            <b style={{ color: r.amount < 0 ? 'var(--err)' : 'var(--ok)' }}>{r.amount > 0 ? '+' : ''}{r.amount}</b>
            <span className="hint" style={{ width: 140, textAlign: 'right' }}>{new Date(r.at).toLocaleString('zh-CN')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
