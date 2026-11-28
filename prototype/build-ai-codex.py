"""把 Codex 版 21 套 AI 首页模版（assets/ai-codex/manifest.json）烘成 js/ai-codex.js（单文件原型没有 fetch，只能内嵌）。

用法：python3 prototype/build-ai-codex.py  → 生成 prototype/js/ai-codex.js
- 来源：Figma 设计稿1127 FikSmkYSPbP30PrjagWyYl 页「04-AI 模版 11-27」430:619174 的 7 个风格分区（节点见 assets/ai-codex/README.md）。
- 数据：window.AI_CODEX = [{ id, style, n, name, dark, th, ec, layout, a }]（字段说明见 README.md）；
  window.AI_CODEX_FLAT(C) = 把 a 摊平成 aidesign.js tplAssets() 的格式（banner-1..3 / acct-* / bn-*[-off] / gm-N / notice-*）。
- 文案：ai-template/name-<id>、ai-template/style-<style> 四语，取自 Figma 06 文案变量（集合 14:2），与 Figma 同名。
规格：docs/merge-1127.md「AI 一键设计（11-28）」——「生成 ✦50」的 3 套结果用这 21 套里同风格的 3 套。
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'assets' / 'ai-codex' / 'manifest.json'
OUT = ROOT / 'js' / 'ai-codex.js'
STYLES = ['platinum', 'blackgold', 'techblue', 'fresh', 'festive', 'neon', 'minimal']
KEYS = ['primary', 'lead', 'neutral_1', 'neutral_2', 'neutral_3', 'border', 'bg_1', 'bg_2', 'accent_1', 'accent_2', 'accent_3']
# Codex 色彩集合里 11 个基础色以外的 Key → 原型 E.D.ec 的写法（'key:<68 Key 名>' 或元素颜色 id）
EXT_EC = {'home_bg': 'key:home_bg', 'home_db': 'key:home_db', 'btmnav_def': 'key:btmnav_def', 'btmnav_active': 'key:btmnav_active',
          'bs_topnav_bg': 'key:bs_topnav_bg', 'web_bs_yj_bg': 'key:web_bs_yj_bg', 'web_btmnav_db': 'key:web_btmnav_db',
          'category_active_text': 'gamemenu.activeText'}
# 底导 98 / 110 / 120 / 140 以外的高度原型用 h / 2 显示（editor.js BNAV_PX），面板分段只有 98 / 120 / 140
# 越南语套名：照本流程的 Figma 文案 ad/gen/applied-blackgold-1「Đã áp dụng “Đen vàng · Điện tử”」统一——黑金 = Đen vàng
# （同 ad/st-blackgold、ad/tpl/title-blackgold「Đen vàng · 3 mẫu」），电子 = Điện tử；manifest / ai-template/name-* 原来写的是「Vàng đen · Slots」（11-28 QA）
VI_FIX = [('Vàng đen', 'Đen vàng'), ('Slots', 'Điện tử')]


def vi_fix(name):
    name = list(name)
    for a, b in VI_FIX:
        name[3] = name[3].replace(a, b)
    return name


def ec_of(th, ext):
    """扩展色等于某个基础色 → 'key:<基础色>'（业主改基础色时跟着变）；否则写死色值。"""
    ec = {}
    for k, target in EXT_EC.items():
        v = ext[k].lower()
        ref = next((b for b in KEYS if th[b] == v), None)
        ec[target] = 'key:' + ref if ref else v
    return ec


def main():
    d = json.loads(SRC.read_text(encoding='utf-8'))
    com = d['common']
    rows, i18n = [], {}
    ids = [s['id'] for s in d['sets']]
    want = [f'{st}-{n}' for st in STYLES for n in (1, 2, 3)]
    if ids != want:
        raise SystemExit(f'manifest order / ids changed: {ids}')
    for s in d['sets']:
        th = {k: s['theme'][k].lower() for k in KEYS}
        # manifest 里是 assets/ai-codex/<id>/ 下的文件名，这里展开成相对 prototype/ 的路径（同 AI_TPL 的写法）
        p = lambda f: f'assets/ai-codex/{s["id"]}/{f}'  # noqa: E731
        m = s['assets']
        a = {'banner': p(m['banner']), 'thumb': p(m['thumb']), 'acct': {k: p(v) for k, v in m['acct'].items()},
             'bn': {k: {'on': p(v['on']), 'off': p(v['off'])} for k, v in m['bn'].items()},
             'gm': [p(v) for v in m['gm']], 'notice': {k: p(v) for k, v in m['notice'].items()}}
        paths = [a['banner'], a['thumb'], *a['acct'].values(), *[p for v in a['bn'].values() for p in v.values()], *a['gm'], *a['notice'].values()]
        miss = [p for p in paths if not (ROOT / p).is_file()]
        if miss or len(a['gm']) != 13:
            raise SystemExit(f'{s["id"]}: missing assets {miss[:3]}')
        lay = dict(banner_size=com['banner_size'], banner_corner=s['layout']['banner_corner'], gm_style=com['gm_style'],
                   gc_cols=s['layout']['gc_cols'], gc_gap=s['layout']['gc_gap'], gc_corner=s['layout']['gc_corner'],
                   bn_style=com['bn_style'], bn_h=s['layout']['bn_h'])
        name = vi_fix(s['name'])
        rows.append({'id': s['id'], 'style': s['style'], 'n': s['n'], 'name': name, 'dark': s['dark'], 'th': th,
                     'ec': ec_of(th, s['ext']), 'layout': lay, 'a': a})
        i18n[s['nameKey']] = name
    for st in STYLES:
        i18n[f'ai-template/style-{st}'] = d['styleNames'][st]
    js = ['/* 自动生成，勿手改：python3 prototype/build-ai-codex.py（来源 assets/ai-codex/manifest.json，说明 assets/ai-codex/README.md）。',
          ' * Codex 版 21 套 AI 首页模版（Figma 04-AI 模版 11-27 430:619174）：11 基础色 + 扩展色 ec + 布局参数 + 素材路径（Banner 1 张、帐户栏 4、',
          ' * 底部导航 6 × 选中 / 未选中、游戏分类 13、公告喇叭 / 信封、整页缩略图）。「AI 一键设计 · 生成 ✦50」的 3 套结果用同风格的这 3 套。 */',
          'window.AI_CODEX = [']
    js += ['  ' + json.dumps(x, ensure_ascii=False, separators=(',', ':')) + ',' for x in rows]
    js += ['];',
           '// 摊平成 aidesign.js tplAssets() 的格式，可直接给 putTplAssets(D, a) / tplSlides 用（Codex 每套只有 1 张 Banner：banner-1..3 同图）',
           'window.AI_CODEX_FLAT = (C) => {',
           '  const a = C.a, o = { \'banner-1\': a.banner, \'banner-2\': a.banner, \'banner-3\': a.banner, \'notice-speaker\': a.notice.speaker, \'notice-mail\': a.notice.mail };',
           '  Object.keys(a.acct).forEach((k) => { o[\'acct-\' + k] = a.acct[k]; });',
           '  Object.keys(a.bn).forEach((k) => { o[\'bn-\' + k] = a.bn[k].on; o[\'bn-\' + k + \'-off\'] = a.bn[k].off; });',
           '  a.gm.forEach((p, i) => { o[\'gm-\' + (i + 1)] = p; });',
           '  return o;',
           '};',
           '// 套名 / 风格名：[简, 繁, 英, 越]，Figma 06 文案变量同名',
           'if (window.I18N) Object.assign(window.I18N, {']
    js += [f'  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},' for k, v in i18n.items()]
    js += ['});', '']
    OUT.write_text('\n'.join(js), encoding='utf-8')
    total = sum(s['bytes'] for s in d['sets'])
    print(OUT, len(rows), 'sets,', OUT.stat().st_size // 1024, 'KB js,', total, 'bytes webp')


main()
