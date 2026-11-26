/* AI 生成 · 统一面板（docs/ai-unified.md；Figma「04-AI 统一生成」G1 Banner / G2 顶部栏，组件 03 页 AIG/*）
 * 所有「给模块生成图片」的 AI 共用这一个面板（已接入：Banner、顶部栏 Logo / 币种 / 搜索 / 侧边栏入口 / 余额框币种、帐户栏的余额框币种；
 * 公告栏 / 帐户栏入口 / 游戏菜单 / 游戏卡片 / 底部导航还在 modpanels 的旧面板，按同一套适配器接口迁过来即可）。
 * 面板从上到下（Figma AIG/Panel）：标题栏「✦ AI 生成 · {名字}  ✕」→ 生成哪张（目标分段，≥2 个目标才显示）→ 范围（只这一个 / 整套，图标组才有）
 *   → 整套时的入口清单 → 款式（5 实物 + 图标多 4 矢量）→ 输入框（参考图 + 提示词 + 规格标签 / 模型 + 发送 ✦N）→ 余额不足 / 提示行 → 结果区 → 操作行
 * 状态机：setup → generating → cands | failed；整套：样板 cands → rest（逐个生成）→ list（逐个重做 / 补齐失败 / 全部使用）
 * 扣点：点数写在发送键上；> ✦20 才弹确认；余额不足统一 lowBalance；失败不扣点；结果按「模块 + 目标 + 范围」保留在本次会话（E.aigS），并放进素材库。
 *
 * 适配器：AIG.reg(mod, { targets(), defaultTarget(), impl(tg) | T: { [目标 id]: 实现 }, tool?: false（工具条 / 手机标题栏不放 ✦ AI） })
 *   目标 tg = { id, label, kind: 'image' | 'icon', spec: [w, h] | (entry) => [w, h], count, cost, ratio, cols,
 *              group?: 组名（同组的图标目标可切「整套」）, entry?: 这个目标对应的入口 id（只这一个时生成它）, name?, setName? }
 *   实现 = { styles(tg, a) → [{ id, label, html }], preset(tg, st, a), refPrompt?(tg, res, a), where?(tg), entries?(tg) → [{ i, name, req, def, thumb, pics }],
 *           gen(a, tg, i, n, base) → 候选数组, best?(a, tg, cands), tile(a, tg, i, c), old?(a, tg, i), preview?,
 *           apply(a, tg, i, c)（AIG 外面包 commit）, lib?(a, tg, i, c) → 素材值, pay(tg) → [kind, vars], onTarget?(tg) }
 * 依赖：core（refSlot / refPick / costConfirm / lowBalance / toast）、editor（window.EDX，运行时取）。 */
(function () {
  const A = window.ACT, I = window.INP;
  const t = (...a) => window.t(...a), ic = (...a) => window.ic(...a), esc = (s) => window.esc(s);
  const X = () => window.EDX, S = () => window.S;
  const ADP = {};
  const MAX_ONE = 20; // 单次 ≤ ✦20 直接生成，超过先确认

  const cur = () => { const x = X(); const a = x && x.E.ai; return a && a.aig ? a : null; };
  const adp = (a) => ADP[a.mod];
  const tgsOf = (mod) => (ADP[mod] ? ADP[mod].targets().filter(Boolean) : []);
  const tgOf = (a) => { const l = tgsOf(a.mod); return l.find((q) => q.id === a.tg) || l[0]; };
  const impl = (a, tg) => { const d = adp(a); tg = tg || tgOf(a); return (d.impl ? d.impl(tg) : d.T[tg.id] || d.T[tg.group]) || {}; };
  const entriesOf = (a, tg) => { const m = impl(a, tg); return m.entries ? m.entries(tg).map((e) => Object.assign({}, e, { i: String(e.i) })) : [{ i: tg.entry != null ? String(tg.entry) : '0', name: tg.name || tg.label }]; };
  const scopeable = (a, tg) => !!(tg.group || tg.scopeable) && entriesOf(a, tg).length > 1;
  const busy = (a) => a.stage === 'generating' || a.stage === 'rest';
  const picked = (a, tg) => entriesOf(a, tg).filter((e) => a.picks[e.i]).map((e) => e.i);
  const oneIdx = (a, tg) => (tg.entry != null ? String(tg.entry) : a.idx);
  // 整套的样板：当前目标对应的入口（勾着的话），否则第一个勾着的
  const sampleIdx = (a, tg) => { if (a.scope !== 'set') return oneIdx(a, tg); if (a.sample != null) return a.sample; const p = picked(a, tg); return tg.entry != null && p.includes(String(tg.entry)) ? String(tg.entry) : p[0]; };
  const specOf = (a, tg) => { const sp = typeof tg.spec === 'function' ? tg.spec(sampleIdx(a, tg)) : tg.spec; return sp || [0, 0]; };
  const model = () => X().E.aigModel || 'gpt';
  const mName = (m) => (m === 'gemini' ? 'Gemini' : 'GPT Image');
  const entName = (a, tg, i) => { const e = entriesOf(a, tg).find((q) => q.i === String(i)); return e ? e.name : ''; };
  function nameOf(a, tg) {
    tg = tg || tgOf(a); const m = impl(a, tg);
    if (a.scope === 'set') return tg.setName || t('aig/n-set', { name: tg.label });
    if (m.name) return m.name(a, tg);
    return tg.name || (tg.entry == null && tg.kind === 'icon' ? entName(a, tg, a.idx) : '') || tg.label;
  }
  // 本次发送的价格：整套 = 勾选入口数 × 单价（确认框写明入口数和图片张数）
  const sendCost = (a, tg) => (a.scope === 'set' ? Math.max(1, picked(a, tg).length) * tg.cost : tg.cost);
  const keyOf = (mod, id, tg, idx, scope) => [id, tg, scope === 'set' ? '*' : idx == null ? '' : idx].join('|') + '@' + mod;

  // ---------- 打开 / 关闭 ----------
  function open(mod, tgId, o = {}) {
    const x = X(), E = x.E, d = ADP[mod]; if (!d) return false;
    const tgs = tgsOf(mod); if (!tgs.length) return false;
    const tg = tgs.find((q) => q.id === tgId) || tgs.find((q) => q.id === d.defaultTarget()) || tgs[0];
    const prev = cur();
    E.aigS = E.aigS || {};
    const probe = { mod, tg: tg.id, picks: {} };
    const ents = entriesOf(probe, tg), canSet = scopeable(probe, tg);
    let idx = tg.entry != null ? String(tg.entry) : o.idx != null && o.idx !== '' ? String(o.idx) : null;
    if (idx != null && !ents.some((e) => e.i === idx)) idx = null;
    const scope = canSet ? (o.scope === 'set' || idx == null ? 'set' : 'one') : 'one';
    if (scope === 'one' && idx == null) idx = ents[0] ? ents[0].i : '0';
    const id = E.sel || mod;
    const key = keyOf(mod, id, tg.id, idx, scope);
    let a = E.aigS[key];
    if (!a) {
      const m = impl(probe, tg); const sts = m.styles(tg, probe);
      a = { aig: true, mod, id, tg: tg.id, idx: scope === 'one' ? idx : null, scope, key, style: sts[0].id, prompt: '', dirty: false, prev: null, replaced: false, refSt: {}, analyzing: false, fromRef: false, stage: 'setup', cands: [], pick: null, best: 0, pct: 0, round: 0, picks: {}, rows: {}, failed: {}, busy: {} };
      ents.forEach((e) => { a.picks[e.i] = scope === 'one' ? e.i === idx : !!(e.req || e.def); });
      if (scope === 'set' && !ents.some((e) => a.picks[e.i]) && ents[0]) a.picks[ents[0].i] = true;
      // 切目标 / 切范围时：用户改过的提示词、参考图和款式带过去，没改过就按新目标的默认值重写
      if (prev && prev.mod === mod && (prev.dirty || prev.fromRef)) { a.prompt = prev.prompt; a.dirty = prev.dirty; a.fromRef = prev.fromRef; a.refSt = Object.assign({}, prev.refSt, { _tok: 0 }); if (sts.some((s) => s.id === prev.style)) a.style = prev.style; }
      else a.prompt = m.preset(tg, a.style, a);
      E.aigS[key] = a;
    }
    a.jump = true; E.ai = a; E.picker = null; E.keys = null; E.tab = 'content'; S().menu = null; S().sheet = null;
    if (E.iconAi && window.ACT.iaClose) window.ACT.iaClose(); // 还没迁过来的旧图标面板先关掉
    if (impl(a, tg).onTarget) impl(a, tg).onTarget(tg);
    if (x.mobileEd()) E.mpanel = 'module';
    return true;
  }
  function close() { const E = X().E; E.ai = null; S().menu = null; if (S().sheet === 'aigModel') S().sheet = null; }
  const isOpen = (mod) => { const a = cur(); return !!a && a.mod === mod; };

  // data-arg = 模块 id | 目标 id | 入口 | 范围（后三个可省）
  A.aigOpen = (arg) => {
    const x = X(), E = x.E, p = String(arg || '').split('|'), mod = x.baseName(p[0]);
    if (!ADP[mod]) return false;
    if (!E.sel || x.baseName(E.sel) !== mod) { E.sel = p[0]; E.rn = null; }
    E.h5side = E.sel === 'sidebar';
    if (!open(mod, p[1] || null, { idx: p[2], scope: p[3] })) return false;
  };
  A.aigClose = () => { close(); };
  A.aigTarget = (v) => { const a = cur(); if (!a || busy(a) || a.tg === v) return false; open(a.mod, v, { scope: a.scope }); };
  A.aigScope = (v) => {
    const a = cur(); if (!a || busy(a) || a.scope === v) return false; const tg = tgOf(a);
    const idx = v === 'one' ? (oneIdx(a, tg) != null ? oneIdx(a, tg) : a.sample != null ? a.sample : picked(a, tg)[0] || entriesOf(a, tg)[0].i) : null;
    open(a.mod, a.tg, { idx, scope: v });
  };

  // ---------- 款式 / 提示词 / 参考图 / 模型 ----------
  A.aigStyle = (st) => {
    const a = cur(); if (!a || busy(a) || a.analyzing) return false; const tg = tgOf(a);
    const p = impl(a, tg).preset(tg, st, a);
    // 业主改过（或 AI 看参考图写的）提示词被款式覆盖：给一个「还原」
    if ((a.dirty || a.fromRef) && a.prompt.trim() && a.prompt !== p) { a.prev = a.prompt; a.replaced = true; } else a.replaced = false;
    a.style = st; a.prompt = p; a.dirty = false; a.fromRef = false;
  };
  A.aigPromptUndo = () => { const a = cur(); if (!a || a.prev == null) return false; a.prompt = a.prev; a.prev = null; a.replaced = false; a.dirty = true; };
  I.aigPrompt = (v) => {
    const a = cur(); if (!a) return false;
    a.prompt = String(v).slice(0, 300); a.dirty = true;
    const empty = !a.prompt.trim();
    document.querySelectorAll('.aig-box .send[data-act="aigSend"]').forEach((b) => b.classList.toggle('is-disabled', empty));
    if (a.hintUntil) { a.hintUntil = 0; document.querySelectorAll('.aig .c-hint').forEach((n) => n.remove()); document.querySelectorAll('.aig-box.is-err').forEach((n) => n.classList.remove('is-err')); }
    return false;
  };
  A.aigKey = (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !e.isComposing) { e.preventDefault(); const r = A.aigSend(); return r !== false; } };
  function analyze(a) {
    const tg = tgOf(a), m = impl(a, tg), src = a.refSt.src; if (!src) return;
    a.analyzing = true; window.render();
    window.aiRefRead(src, m.where ? m.where(tg) : ['', ''], (res) => {
      if (X().E.aigS[a.key] !== a) return; a.analyzing = false;
      if (!res) { a.refSt = {}; window.toast(t('mp/icon-bad'), { info: true }); window.render(); return; }
      const r = m.refPrompt ? m.refPrompt(tg, res, a) : { prompt: res.prompt, style: res.style };
      if (m.styles(tg, a).some((s) => s.id === r.style)) a.style = r.style;
      a.prompt = String(r.prompt || '').slice(0, 300); a.fromRef = true; a.dirty = false; a.replaced = false; a.prev = null;
      window.render();
    });
  }
  A.aigRefPick = () => { const a = cur(); if (!a || busy(a) || a.analyzing) return false; window.refPick(a.refSt, () => analyze(a)); return false; };
  A.aigRefView = () => (X().mobileEd() ? A.aigRefPick() : false);
  A.aigRefRm = () => { const a = cur(); if (!a) return false; a.refSt = {}; a.analyzing = false; if (a.fromRef) { const tg = tgOf(a); a.prompt = impl(a, tg).preset(tg, a.style, a); a.fromRef = false; } };
  A.aigRefCancel = () => { const a = cur(); if (!a) return false; window.refCancel(a.refSt); a.analyzing = false; };
  A.aigModel = (m) => { X().E.aigModel = m === 'gemini' ? 'gemini' : 'gpt'; S().menu = null; if (S().sheet === 'aigModel') S().sheet = null; };
  A.aigModelSheet = () => { S().sheet = 'aigModel'; S().menu = null; };
  A.aigEntry = (i) => { const a = cur(); if (!a || busy(a) || a.stage === 'list') return false; const tg = tgOf(a); const e = entriesOf(a, tg).find((q) => q.i === String(i)); if (!e || e.req) return false; a.picks[e.i] = !a.picks[e.i]; resetSet(a); };
  A.aigAll = (v) => { const a = cur(); if (!a || busy(a)) return false; entriesOf(a, tgOf(a)).forEach((e) => { a.picks[e.i] = v === '1' || !!e.req; }); resetSet(a); };
  const resetSet = (a) => { if (a.stage === 'cands' || a.stage === 'failed') { a.stage = 'setup'; a.cands = []; a.pick = null; a.sample = null; } };

  // ---------- 扣点 / 生成 ----------
  function hint(a) {
    const now = Date.now(); a.hintUntil = now + 3000; a.shakeUntil = now + 320;
    setTimeout(() => { if (a.hintUntil && Date.now() >= a.hintUntil) { a.hintUntil = 0; window.render(); } }, 3020);
    setTimeout(() => { const n = document.querySelector('.aig-box textarea'); if (n) n.focus(); }, 0);
  }
  // 价钱：> ✦20 先确认（costConfirm 余额不足时自己变「去充值」）；≤ ✦20 余额不足弹 lowBalance
  function charge(cost, go, conf) {
    const x = X();
    if (cost > MAX_ONE && window.costConfirm) { window.costConfirm(Object.assign({ cost, onOk: go }, conf)); return; }
    if (!x.afford(cost)) { window.lowBalance(cost); return; }
    go();
  }
  const payNow = (a, tg, n) => { if (n <= 0) return; const p = impl(a, tg).pay ? impl(a, tg).pay(tg) : ['iconset', {}]; X().pay(n, p[0], p[1]); };
  function toLib(a, tg, i, list) {
    const E = X().E, m = impl(a, tg); if (!m.lib) return;
    const nm = a.scope === 'set' ? entName(a, tg, i) || nameOf(a, tg) : nameOf(a, tg);
    list.forEach((c) => { const f = m.lib(a, tg, i, c); if (f && !E.projAssets.some((q) => q.f === f)) E.projAssets.push({ f, name: 'AI · ' + nm + ' · ' + (E.projAssets.filter((q) => /^AI ·/.test(q.name)).length + 1) }); });
  }
  const picsOf = (a, tg, list) => { const ents = entriesOf(a, tg); return list.reduce((s, i) => s + ((ents.find((e) => e.i === i) || {}).pics || 1), 0); };
  A.aigSend = () => {
    const a = cur(); if (!a || busy(a) || a.analyzing) return false;
    const tg = tgOf(a);
    if (!a.prompt.trim()) { hint(a); return; }
    if (a.scope === 'set' && !picked(a, tg).length) return false;
    const cost = sendCost(a, tg), n = a.scope === 'set' ? picked(a, tg).length : 1;
    charge(cost, () => { a.okCost = cost; startGen(a); }, { title: t('aig/confirm-title', { name: nameOf(a, tg) }), body: t('aig/confirm-body', { n, k: a.scope === 'set' ? picsOf(a, tg, picked(a, tg)) : tg.count, x: cost }) });
  };
  // 再生成 / 重试：只重做这一轮（整套 = 重出样板），按单价算
  A.aigAgain = () => { const a = cur(); if (!a || busy(a)) return false; const tg = tgOf(a); charge(tg.cost, () => startGen(a, true), { title: t('aig/confirm-title', { name: nameOf(a, tg) }), body: t('aig/confirm-body', { n: 1, k: tg.count, x: tg.cost }) }); };
  A.aigRetry = A.aigAgain;
  function startGen(a, again) {
    const x = X(), tg = tgOf(a), m = impl(a, tg), n = tg.count, tok = (a.tok = {});
    if (a.scope === 'set') { if (!again || a.sample == null) a.sample = sampleIdx(Object.assign({}, a, { sample: null }), tg); a.rows = {}; a.failed = {}; }
    a.back = a.cands.length ? 'cands' : 'setup'; a.stage = 'generating'; a.pct = 0; a.genN = n;
    const tick = setInterval(() => {
      if (a.tok !== tok) { clearInterval(tick); return; }
      a.pct = Math.min(95, a.pct + 12);
      document.querySelectorAll('[data-aig-pct]').forEach((el) => { el.textContent = t('aig/generating', { n, p: a.pct }); });
      document.querySelectorAll('[data-aig-tp]').forEach((el) => { el.textContent = a.pct + '%'; });
    }, 200);
    setTimeout(() => {
      clearInterval(tick); if (a.tok !== tok) return; a.tok = null;
      if (x.fail(a.prompt)) {
        a.stage = 'failed';
        x.notice({ kind: 'failed', cat: 'gen', title: t('aig/title', { name: nameOf(a, tg) }), body: t('aig/failed') });
      } else {
        payNow(a, tg, tg.cost);
        const i = sampleIdx(a, tg);
        a.cands = m.gen(a, tg, i, n, null); a.best = m.best ? m.best(a, tg, a.cands) : 0; a.pick = a.best; a.round++; a.stage = 'cands';
        toLib(a, tg, i, a.cands);
      }
      window.render();
    }, 1400);
  }
  A.aigPick = (k) => { const a = cur(); if (!a || a.stage !== 'cands') return false; a.pick = +k; };
  A.aigCancel = () => {
    const a = cur(); if (!a) return false; const tg = tgOf(a);
    if (a.stage === 'generating') { a.tok = null; a.stage = a.back === 'cands' && a.cands.length ? 'cands' : 'setup'; return; }
    if (a.stage === 'rest') {
      a.tok = null; a.run.slice(a.done).forEach((i) => { a.failed[i] = true; });
      payNow(a, tg, a.okN * tg.cost); a.stage = 'list';
      window.toast(t('aig/cancelled', { n: a.okN }), { info: true }); return;
    }
    if (a.stage === 'failed') { a.stage = a.cands.length ? 'cands' : 'setup'; return; }
    close();
  };
  function finish(a, name) {
    const x = X(), E = x.E;
    a.stage = 'setup'; a.cands = []; a.pick = null; a.rows = {}; a.failed = {}; a.sample = null;
    if (E.ai === a) E.ai = null;
    window.toast(t('aig/used', { name }), x.undoOpt());
  }
  A.aigUse = () => {
    const a = cur(); if (!a || a.stage !== 'cands' || a.pick == null) return false;
    const tg = tgOf(a), m = impl(a, tg), c = a.cands[a.pick], i = sampleIdx(a, tg), name = a.scope === 'set' ? nameOf(a, tg) : nameOf(a, tg);
    X().commit(() => { m.apply(a, tg, i, c); });
    finish(a, name);
  };
  // 整套：样板挑好后按同一款式生成其余入口（发送时已确认过整套价钱的，这一步不再确认）
  A.aigRest = () => {
    const a = cur(); if (!a || a.stage !== 'cands' || a.pick == null) return false;
    const tg = tgOf(a), rest = picked(a, tg).filter((i) => i !== String(a.sample));
    if (!rest.length) return A.aigUse();
    const cost = rest.length * tg.cost;
    if (a.okCost && a.okCost >= cost + tg.cost) { if (!X().afford(cost)) { window.lowBalance(cost); return; } runRest(a, rest); return; }
    charge(cost, () => runRest(a, rest), { title: t('aig/confirm-title', { name: nameOf(a, tg) }), body: t('aig/confirm-body', { n: rest.length, k: picsOf(a, tg, rest), x: cost }), okLabel: t('aig/rest-ok', { m: rest.length }) });
  };
  function runRest(a, list) {
    const x = X(), tg = tgOf(a), m = impl(a, tg), tok = (a.tok = {});
    const base = a.cands[a.pick];
    if (!a.rows[a.sample]) a.rows[a.sample] = base; a.base = base; a.stage = 'rest'; a.run = list.slice(); a.done = 0; a.okN = 0;
    const failSet = x.fail() ? new Set([list[Math.min(1, list.length - 1)], list[Math.min(4, list.length - 1)]]) : new Set();
    list.forEach((i) => { delete a.rows[i]; delete a.failed[i]; });
    const tick = setInterval(() => {
      if (a.tok !== tok) { clearInterval(tick); return; }
      const i = a.run[a.done];
      if (failSet.has(i)) a.failed[i] = true; else { const c = m.gen(a, tg, i, 1, base)[0]; a.rows[i] = c; a.okN++; toLib(a, tg, i, [c]); }
      a.done++;
      if (a.done >= a.run.length) {
        clearInterval(tick); a.tok = null; payNow(a, tg, a.okN * tg.cost); a.stage = 'list';
        const nf = Object.keys(a.failed).length, n = Object.keys(a.rows).length + nf;
        x.notice({ kind: nf ? 'partial' : 'done', cat: 'gen', title: t('aig/title', { name: nameOf(a, tg) }), body: nf ? t('rec/partial', { d: n - nf, n, f: nf }) : t('aig/set-done', { n }) });
      }
      window.render();
    }, 700);
  }
  A.aigFill = () => {
    const a = cur(); if (!a || a.stage !== 'list') return false; const tg = tgOf(a), list = Object.keys(a.failed); if (!list.length) return false;
    const cost = list.length * tg.cost;
    charge(cost, () => { a.cands = [a.base]; a.pick = 0; runRest(a, list); }, { title: t('aig/confirm-title', { name: nameOf(a, tg) }), body: t('aig/confirm-body', { n: list.length, k: picsOf(a, tg, list), x: cost }) });
  };
  // 重做一个入口：这个入口的所有状态图（未选 / 选中）一起重新生成
  A.aigRedo = (i) => {
    const a = cur(); if (!a || a.stage !== 'list' || a.busy[i]) return false; const x = X(), tg = tgOf(a), m = impl(a, tg);
    if (!x.afford(tg.cost)) { window.lowBalance(tg.cost); return; }
    a.busy[i] = true;
    setTimeout(() => {
      if (X().E.aigS[a.key] !== a) return; delete a.busy[i];
      if (x.fail()) window.toast(t('aig/failed'), { info: true });
      else { a.round++; const c = m.gen(a, tg, i, 1, Object.assign({}, a.base, { redo: a.round }))[0]; a.rows[i] = c; delete a.failed[i]; payNow(a, tg, tg.cost); toLib(a, tg, i, [c]); }
      window.render();
    }, 900);
  };
  A.aigUseAll = () => {
    const a = cur(); if (!a || a.stage !== 'list') return false; const tg = tgOf(a), m = impl(a, tg), ks = Object.keys(a.rows); if (!ks.length) return false;
    X().commit(() => { ks.forEach((i) => m.apply(a, tg, i, a.rows[i])); });
    finish(a, nameOf(a, tg));
  };

  // ---------- 渲染 ----------
  function modelItems() {
    return ['gpt', 'gemini'].map((m) => `<button class="menu-item model-item ${model() === m ? 'is-on' : ''}" data-act="aigModel" data-arg="${m}">${(window.MODEL_LOGO || {})[m] || ''}<span><div class="nm">${m === 'gemini' ? 'Gemini（Nano Banana Pro）' : 'GPT Image'}</div><div class="ds">${t('model/' + m + '-desc')}</div></span></button>`).join('');
  }
  function modelPill(lock) {
    const mob = X().mobileEd(), m = model(), open1 = S().menu === 'aig-model';
    return `<div class="rel aig-model"><button class="c-opt ${open1 ? 'is-open' : ''}" data-act="${mob ? 'aigModelSheet' : 'menu:toggle'}" data-arg="aig-model" ${lock ? 'disabled' : ''}>${(window.MODEL_LOGO || {})[m] || ''}<span class="ellipsis">${mName(m)}</span>${ic('caret-down', 'chev')}</button>${!mob && open1 ? `<div class="menu c-menu aig-mmenu">${modelItems()}</div>` : ''}</div>`;
  }
  // 手机：模型选择用底部弹层（编辑器手机视图里渲染）
  const layers = () => (S().sheet === 'aigModel' && cur() ? window.sheet(`<div class="sheet-head"><h3>${t('sheet/model-title')}</h3></div>${modelItems()}`, 'aig-msheet') : '');
  const tile = (a, tg, i, c) => impl(a, tg).tile(a, tg, i, c);
  const ratioCss = (tg) => (tg.ratio ? `aspect-ratio:${tg.ratio}` : '');
  const btn = (cls, act, label, arg = '', dis = false) => `<button class="btn ${cls} btn-sm" data-act="${act}" ${arg !== '' ? `data-arg="${arg}"` : ''} ${dis ? 'disabled' : ''}>${label}</button>`;
  // 分段按钮（Figma AIG/Segment）：目标按内容宽度排一行；范围两个等宽
  const seg = (opts, curV, act, cls, lock) => `<div class="aig-seg ${cls}" role="group">${opts.map((o) => `<button class="aig-sg ${o.v === curV ? 'is-on' : ''}" data-act="${act}" data-arg="${esc(o.v)}" ${lock ? 'disabled' : ''} aria-pressed="${o.v === curV}"><span class="ellipsis">${esc(o.label)}</span></button>`).join('')}</div>`;
  const sec = (lab, body, cls = '') => `<div class="aig-sec ${cls}">${lab ? `<div class="aig-lab">${lab}</div>` : ''}${body}</div>`;
  function resHtml(a, tg) {
    const cols = tg.cols || (tg.kind === 'icon' ? 4 : 2), n = a.genN || tg.count, grid = (inner) => `<div class="aig-grid is-c${cols} ${tg.ratio && tg.ratio > 1.2 ? 'is-wide' : ''}">${inner}</div>`;
    const cost = tg.cost;
    const ents = entriesOf(a, tg);
    const acts = (inner) => `<div class="aig-acts">${inner}</div>`;
    if (a.stage === 'generating') {
      return `<div class="aig-res"><div class="aig-lab is-ing"><i class="aig-spin" aria-hidden="true"></i><span data-aig-pct>${t('aig/generating', { n, p: a.pct })}</span></div>${grid(Array.from({ length: n }, () => `<div class="aig-cand skeleton" style="${ratioCss(tg)}"><b data-aig-tp>${a.pct}%</b></div>`).join(''))}</div>
        ${acts(btn('btn-ghost', 'aigCancel', t('aig/cancel')))}`;
    }
    if (a.stage === 'failed') {
      return `<div class="aig-res"><div class="aig-lab is-err" role="alert">${ic('warning-circle-fill')}<span>${t('aig/failed')}</span></div>${grid(Array.from({ length: n }, () => `<div class="aig-cand is-fail" style="${ratioCss(tg)}">${ic('warning-circle-fill')}</div>`).join(''))}</div>
        ${acts(btn('btn-primary', 'aigRetry', `${ic('sparkle-fill', 'ic-16')}${t('aig/retry', { n: cost })}`) + btn('btn-ghost', 'aigCancel', t('aig/cancel')))}`;
    }
    if (a.stage === 'cands') {
      const si = sampleIdx(a, tg), rest = a.scope === 'set' ? picked(a, tg).filter((i) => i !== String(si)) : [];
      const lab = a.scope === 'set' ? t('aig/sample', { name: esc(entName(a, tg, si)) }) : t('aig/cands');
      const tiles = a.cands.map((c, k) => `<button class="aig-cand ${a.pick === k ? 'is-on' : ''}" style="${ratioCss(tg)}" data-act="aigPick" data-arg="${k}" aria-pressed="${a.pick === k}">${tile(a, tg, si, c)}${k === a.best ? `<span class="best">${t('aig/best')}</span>` : ''}</button>`).join('');
      const main = rest.length ? btn('btn-primary', 'aigRest', t('aig/rest', { m: rest.length, x: rest.length * cost }), '', a.pick == null) : btn('btn-primary', 'aigUse', t('aig/use'), '', a.pick == null);
      return `<div class="aig-res"><div class="aig-lab">${lab}</div>${grid(tiles)}</div>${acts(main + btn('btn-secondary aig-again', 'aigAgain', t('aig/again', { n: cost })) + btn('btn-ghost', 'aigCancel', t('aig/cancel')))}`;
    }
    if (a.stage === 'rest' || a.stage === 'list') {
      const inSet = (i) => i === String(a.sample) || a.rows[i] || a.failed[i] || (a.run || []).includes(i);
      const order = [String(a.sample)].concat(ents.map((e) => e.i).filter((i) => i !== String(a.sample) && inSet(i)));
      const rows = order.map((i) => {
        const e = ents.find((q) => q.i === i) || { name: '' };
        const c = a.rows[i], f = a.failed[i], bz = a.busy[i];
        const cell = c && !bz ? `<span class="aig-c">${tile(a, tg, i, c)}</span>` : f && !bz ? `<span class="aig-c is-fail">${ic('warning-circle-fill')}</span>` : '<span class="aig-c skeleton"></span>';
        const old = impl(a, tg).old ? impl(a, tg).old(a, tg, i) : '';
        return `<div class="aig-row ${f ? 'is-fail' : ''}"><span class="nm">${esc(e.name)}</span><span class="aig-c is-old">${old}</span>${ic('arrow-right', 'ic-16 aig-arr')}${cell}<span class="aig-rd">${a.stage === 'list' ? `<button class="aig-link" data-act="aigRedo" data-arg="${i}" ${bz ? 'disabled' : ''}>${t('aig/redo', { n: cost })}</button>` : ''}</span></div>`;
      }).join('');
      const tot = order.length, doneN = order.filter((i) => a.rows[i]).length;
      if (a.stage === 'rest') {
        return `<div class="aig-res"><div class="aig-lab is-ing"><i class="aig-spin" aria-hidden="true"></i><span>${t('aig/rest-ing', { d: Math.min(tot, a.done + 1), m: tot })}</span></div><div class="aig-bar"><i style="width:${((a.done + 1) / tot) * 100}%"></i></div><div class="aig-list">${rows}</div></div>${acts(btn('btn-ghost', 'aigCancel', t('aig/cancel')))}`;
      }
      const nf = Object.keys(a.failed).length;
      return `<div class="aig-res">${nf ? `<div class="aig-lab is-err" role="alert">${ic('warning-circle-fill')}<span>${t('rec/partial', { d: tot - nf, n: tot, f: nf })}</span></div>` : `<div class="aig-lab">${t('aig/rest-done', { d: doneN, m: tot })}<span class="aig-ok">${ic('check-circle-fill')}</span></div>`}<div class="aig-bar ${nf ? '' : 'is-ok'}"><i style="width:${(doneN / tot) * 100}%"></i></div><div class="aig-list">${rows}</div></div>
        ${acts((nf ? btn('btn-secondary', 'aigFill', t('aig/fill', { f: nf, x: nf * cost })) : '') + btn('btn-primary', 'aigUseAll', t('aig/use-all'), '', !Object.keys(a.rows).length) + btn('btn-ghost', 'aigCancel', t('aig/cancel')))}`;
    }
    return '';
  }
  function panel() {
    const a = cur(); if (!a) return '';
    const x = X(), tg = tgOf(a), m = impl(a, tg), tgs = tgsOf(a.mod), lock = busy(a), ents = entriesOf(a, tg);
    const name = nameOf(a, tg);
    const hd = `<h2 class="p-title aig-hd">${ic('sparkle-fill', 'aig-ic')}<span class="ellipsis">${esc(t('aig/title', { name }))}</span><button class="ibtn ibtn-sm aig-x" data-act="aigClose" title="${esc(t('aig/close'))}" aria-label="${esc(t('aig/close'))}">${ic('x')}</button></h2>`;
    const tgSw = tgs.length >= 2 ? sec(t('aig/target'), seg(tgs.map((q) => ({ v: q.id, label: q.label })), a.tg, 'aigTarget', 'is-hug', lock)) : '';
    let scope = '';
    if (scopeable(a, tg)) {
      const oneI = oneIdx(a, tg) != null ? oneIdx(a, tg) : a.sample != null ? a.sample : picked(a, tg)[0] || ents[0].i;
      scope = sec(t('aig/scope'), seg([{ v: 'one', label: t('aig/scope-one', { name: entName(a, tg, oneI) }) }, { v: 'set', label: t('aig/scope-set', { n: ents.length }) }], a.scope, 'aigScope', 'is-eq', lock));
      if (a.scope === 'set' && a.stage !== 'rest' && a.stage !== 'list') { // 列表阶段只留范围，入口清单收起（Figma G2-10）
        const allOn = ents.every((e) => a.picks[e.i]), noneOpt = ents.every((e) => e.req || !a.picks[e.i]);
        scope += `<div class="aig-sec aig-ents"><div class="aig-lab">${t('aig/ents', { n: picked(a, tg).length })}<span class="aig-bulk"><button class="aig-link" data-act="aigAll" data-arg="1" ${allOn || lock ? 'disabled' : ''}>${t('mp/ai-all')}</button><button class="aig-link" data-act="aigAll" data-arg="0" ${noneOpt || lock ? 'disabled' : ''}>${t('mp/ai-none')}</button></span></div>
          <div class="aig-elist">${ents.map((e) => `<button class="aig-ent ${e.req ? 'is-req' : ''} ${a.picks[e.i] ? 'is-on' : ''}" data-act="aigEntry" data-arg="${e.i}" ${lock ? 'disabled' : ''} aria-pressed="${!!a.picks[e.i]}"><span class="check ${a.picks[e.i] ? 'is-on' : ''}">${a.picks[e.i] ? ic('check', 'ic-16') : ''}</span><span class="thumb">${e.thumb || ''}</span><span class="nm ellipsis">${esc(e.name)}</span>${e.req ? `<span class="req">${t('mp/required')}</span>` : ''}</button>`).join('')}</div></div>`;
      }
    }
    const sts = m.styles(tg, a);
    const styles = a.stage === 'rest' || a.stage === 'list' ? '' : sec(t('aig/style'), `<div class="aig-styles">${sts.map((s) => `<button class="aig-st ${a.style === s.id ? 'is-on' : ''}" data-act="aigStyle" data-arg="${s.id}" ${lock || a.analyzing ? 'disabled' : ''} title="${esc(s.label)}" aria-pressed="${a.style === s.id}"><span class="pv">${s.html}</span><small>${esc(s.label)}</small></button>`).join('')}</div>`);
    const cost = sendCost(a, tg), sp = specOf(a, tg), now = Date.now(), hintOn = now < (a.hintUntil || 0), shake = now < (a.shakeUntil || 0);
    const empty = !a.prompt.trim();
    const send = lock ? `<button class="send is-busy" disabled aria-label="${esc(t('aig/generating', { n: tg.count, p: a.pct }))}">${ic('sparkle-fill')}${cost}<i class="aig-spin" aria-hidden="true"></i></button>`
      : `<button class="send ${empty || a.analyzing ? 'is-disabled' : ''}" data-act="aigSend" title="${esc(t('aig/send-tip', { n: cost }))}" aria-label="${esc(t('aig/send-tip', { n: cost }))}">${ic('sparkle-fill')}${cost}${ic('arrow-up')}</button>`;
    const specTxt = t('aig/count-spec', { n: tg.count, w: sp[0], h: sp[1] });
    const box = `<div class="aig-comp"><div class="c-box aig-box ${hintOn ? 'is-err' : ''} ${shake ? 'is-shake' : ''}"><div class="c-input">${window.refSlot(a.refSt, 'aigRef')}<div class="aig-main"><textarea rows="4" maxlength="300" data-input="aigPrompt" data-key="aigKey" placeholder="${esc(a.analyzing ? t('ed/tbai-analyzing') : t('aig/prompt-ph'))}" ${lock || a.analyzing ? 'disabled' : ''}>${esc(a.analyzing ? '' : a.prompt)}</textarea><span class="aig-spec" title="${esc(specTxt)}">${specTxt}</span></div></div>
      <div class="c-tools">${modelPill(lock)}<span class="sb-spacer"></span>${send}</div></div>${hintOn ? `<div class="c-hint" role="alert">${t('composer/empty-hint')}</div>` : ''}</div>`;
    const note = a.replaced ? `<div class="aig-note">${ic('arrow-counter-clockwise', 'ic-16')}<span>${t('aig/prompt-replaced')}</span><button class="aig-link" data-act="aigPromptUndo">${t('aig/prompt-undo')}</button></div>`
      : a.fromRef && !a.analyzing ? `<div class="aig-note">${ic('sparkle-fill', 'ic-16')}<span>${t('aig/prompt-ref')}</span></div>` : '';
    const low = x.afford(cost) || lock || a.stage === 'list' ? '' : `<button class="aig-low" data-act="edTopup">${ic('warning-circle-fill', 'ic-16')}${t('aig/low')}</button>`;
    return `<div class="aig" data-aig="${a.mod}">${hd}<div class="aig-body">${tgSw}${scope}${styles}${box}${low}${note}${resHtml(a, tg)}</div></div>`;
  }
  // 打开后：面板滚到顶部（手机上标题不被挡），电脑上输入框获得焦点
  window.AFTER_RENDER.push(() => {
    const a = cur(); if (!a || !a.jump) return; a.jump = false;
    setTimeout(() => {
      const p = document.querySelector('.aig'); if (!p) return;
      let c = p.parentElement; while (c && !(c.scrollHeight > c.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(c).overflowY))) c = c.parentElement;
      if (c) c.scrollTop = Math.max(0, c.scrollTop + p.getBoundingClientRect().top - c.getBoundingClientRect().top - 8);
      if (!X().mobileEd()) { const ta = p.querySelector('textarea:not([disabled])'); if (ta) ta.focus({ preventScroll: true }); }
    }, 30);
  });
  // 画布预览：选中的候选实时显示（Banner 对应轮播图、顶部栏 Logo）
  function previewCand(mod) { const a = cur(); if (!a || a.mod !== mod || a.stage !== 'cands' || a.pick == null) return null; return { tg: a.tg, c: a.cands[a.pick], n: a.pick }; }
  const tall = () => { const a = cur(); return !!a && (a.stage === 'rest' || a.stage === 'list'); };

  // 款式工具：把选中的款式排第一，其余按顺序补齐 n 个（模拟 4 张不同的候选）
  const rot = (list, st, n) => [st].concat(list.filter((v) => v !== st)).slice(0, n);
  const STYLES5 = ['glossy', 'flat', 'blackgold', 'festive', 'neon'], VSTYLES = ['line', 'fill', 'duotone', 'gradient'];
  window.AIG = {
    reg: (mod, d) => { ADP[mod] = d; },
    has: (mod) => !!ADP[mod] && ADP[mod].tool !== false && tgsOf(mod).length > 0, // 工具条 / 手机标题栏要不要放 ✦ AI
    can: (mod) => !!ADP[mod] && tgsOf(mod).length > 0,
    open, close, isOpen, panel, layers, modelPill, previewCand, tall, cur, rot, STYLES5, VSTYLES,
    styleName: (st) => t('aig/st-' + st),
  };
})();
