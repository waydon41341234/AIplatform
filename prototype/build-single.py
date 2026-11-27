"""把原型打包成一个单文件 HTML（CSS、JS、图片全部内嵌），双击或在任何预览里都能打开。

用法：python3 prototype/build-single.py  → 生成 prototype/dist/prototype-single.html
"""
import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
MIME = {'.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp'}


def data_uri(name):
    p = ROOT / 'assets' / name
    return f"data:{MIME[p.suffix]};base64," + base64.b64encode(p.read_bytes()).decode()


# 递归收集 assets（含 thumbs/ 子目录），key 是相对 assets/ 的路径
# AI 风格模版的 thumb.webp 只是 Figma 对照图，原型里卡片是实时渲染，不打进单文件（省 ~1.3MB）
SKIP = re.compile(r'^ai-tpl/[^/]+/thumb\.webp$')
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
print(out, len(html) // 1024, 'KB')

# 展示版（给老板 / 外部看）：去掉原型快捷条（语言、日夜、演示失败开关），平台内的语言和日夜切换仍可用
boss = html.replace('</body>', "<script>window.PROTO_BAR = function () { return ''; }; window.render && window.render();</script>\n</body>", 1)
boss = re.sub(r'<title>.*?</title>', '<title>定制设计平台 · 原型展示</title>', boss, count=1, flags=re.S)
out2 = ROOT / 'dist' / 'prototype-showcase.html'
out2.write_text(boss, encoding='utf-8')
print(out2, len(boss) // 1024, 'KB')
