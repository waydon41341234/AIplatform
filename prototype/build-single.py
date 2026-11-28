"""把原型打包成一个单文件 HTML（CSS、JS、图片全部内嵌），双击或在任何预览里都能打开。

用法：python3 prototype/build-single.py  → 生成 prototype/dist/prototype-single.html
"""
import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
MIME = {'.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp'}


# 单文件体积上限 15.5 MB（发布 Artifact 的页面上限 16MB）。AI 一键设计的两套 21 套素材只在单文件里重压一份更小的（源文件不动，
# 多文件版照旧用原图）：画布上入口图标最大约 40 CSS px、Banner 约 355 CSS px 宽，缩到下面的尺寸肉眼看不出差别。
#   ai-tpl（Claude 免费模版）：入口图标 96×96 → 56×56（q72，透明 q50）；Banner 720×212 → 640×188 q52
#   ai-codex（「生成 3 套」结果）：入口图标 64×64 → 56×56（同上）；Banner 690×203 → 640×188 q55
# 没装 Pillow 时照原样内嵌，并提示体积可能超限。
SHRINK = [
    (re.compile(r'^ai-tpl/[^/]+/(acct|bn|gm)-[\w-]+\.webp$'), {'size': (56, 56), 'quality': 72, 'alpha_quality': 50}),
    (re.compile(r'^ai-tpl/[^/]+/banner-\d\.webp$'), {'width': 640, 'quality': 52}),
    (re.compile(r'^ai-codex/[^/]+/banner\.webp$'), {'width': 640, 'quality': 55}),
    (re.compile(r'^ai-codex/[^/]+/(acct|bn|gm|notice)-[\w-]+\.webp$'), {'size': (56, 56), 'quality': 72, 'alpha_quality': 50}),
]
try:
    import io
    from PIL import Image
except ImportError:  # pragma: no cover
    Image = None
    print('提示：没有 Pillow，AI 模版素材照原图内嵌，单文件可能超过 15.5 MB（pip install pillow）')


def shrink(name, raw):
    if Image is None or not name.endswith('.webp'):
        return raw
    for rx, o in SHRINK:
        if not rx.match(name):
            continue
        im = Image.open(io.BytesIO(raw))
        if 'size' in o:
            im = im.convert('RGBA')
            if im.size != o['size']:
                im = im.resize(o['size'], Image.LANCZOS)
        else:
            im = im.convert('RGB')
            if im.width > o['width']:
                im = im.resize((o['width'], round(im.height * o['width'] / im.width)), Image.LANCZOS)
        b = io.BytesIO()
        im.save(b, 'WEBP', method=6, **{k: v for k, v in o.items() if k in ('quality', 'alpha_quality')})
        return min(raw, b.getvalue(), key=len)
    return raw


def data_uri(name):
    p = ROOT / 'assets' / name
    return f"data:{MIME[p.suffix]};base64," + base64.b64encode(shrink(name, p.read_bytes())).decode()


# 递归收集 assets（含 thumbs/ 子目录），key 是相对 assets/ 的路径
# AI 风格模版 / Codex 21 套的 thumb.webp 只是 Figma 对照图，原型里卡片是实时渲染，不打进单文件（省 ~1.7MB）
# 自定义模版 12 张配色版本整页图（~5.5MB）不内嵌，发布 Artifact 时作为附带文件 assets/custom-tpl/result-X-风格.jpg
SKIP = re.compile(r'^(ai-(tpl|codex)/[^/]+/thumb\.webp|custom-tpl/(result|banner)-[A-D]-\w+\.jpg)$')
assets = {p.relative_to(ROOT / 'assets').as_posix(): data_uri(p.relative_to(ROOT / 'assets').as_posix())
          for p in sorted((ROOT / 'assets').rglob('*')) if p.suffix in MIME and not SKIP.match(p.relative_to(ROOT / 'assets').as_posix())}
html = (ROOT / 'index.html').read_text(encoding='utf-8')

# CSS：背景图换成内嵌
def css(m):
    s = (ROOT / m.group(1)).read_text(encoding='utf-8')
    s = re.sub(r"url\(\.\./assets/([\w.-]+)\)", lambda a: f"url({assets[a.group(1)]})", s)
    return f"<style>\n{s}\n</style>"

html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)

# JS 原样内嵌，不改源码（以前在 JS 里替换路径会弄坏单引号字符串）；
# 图片在运行时由下面的 MutationObserver 把 src="assets/…" 换成内嵌数据。
def js(m):
    s = (ROOT / m.group(1)).read_text(encoding='utf-8')
    return f"<script>\n{s.replace('</script>', '<\\/script>')}\n</script>"

html = re.sub(r'<script src="([^"]+)"></script>', js, html)
import json
a_map = ('<script>window.A_ = ' + json.dumps(assets) + ''';
(function () {
  // 先在 innerHTML / insertAdjacentHTML 写入前把 assets/ 路径换成内嵌数据，避免发出失败请求
  const sub = (h) => typeof h === 'string' && h.includes('assets/') ? h.replace(/(["'(])assets\\/([\\w./-]+)/g, (m, q, k) => window.A_[k] ? q + window.A_[k] : m) : h;
  const d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  Object.defineProperty(Element.prototype, 'innerHTML', { get: d.get, set(v) { d.set.call(this, sub(v)); }, configurable: true });
  const ia = Element.prototype.insertAdjacentHTML; Element.prototype.insertAdjacentHTML = function (pos, h) { return ia.call(this, pos, sub(h)); };
  const fix = (el) => { const v = el.getAttribute && el.getAttribute('src'); if (v && v.startsWith('assets/') && window.A_[v.slice(7)]) el.setAttribute('src', window.A_[v.slice(7)]); };
  const scan = (n) => { if (n.nodeType !== 1) return; if (n.tagName === 'IMG') fix(n); n.querySelectorAll && n.querySelectorAll('img[src^="assets/"]').forEach(fix); };
  new MutationObserver((ms) => ms.forEach((m) => { if (m.type === 'attributes') fix(m.target); else m.addedNodes.forEach(scan); }))
    .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
})();</script>\n''')
html = html.replace('<div id="app"></div>', '<div id="app"></div>\n' + a_map, 1)
html = html.replace('<link rel="icon" href="assets/logo-orb.webp">', '')

out = ROOT / 'dist' / 'prototype-single.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(out, len(html.encode('utf-8')), 'B', round(len(html.encode('utf-8')) / 1048576, 2), 'MiB')

# 展示版（给老板 / 外部看）：去掉原型快捷条（语言、日夜、演示失败开关），平台内的语言和日夜切换仍可用
boss = html.replace('</body>', "<script>window.PROTO_BAR = function () { return ''; }; window.render && window.render();</script>\n</body>", 1)
boss = re.sub(r'<title>.*?</title>', '<title>定制设计平台 · 原型展示</title>', boss, count=1, flags=re.S)
out2 = ROOT / 'dist' / 'prototype-showcase.html'
out2.write_text(boss, encoding='utf-8')
print(out2, len(boss.encode('utf-8')), 'B')
