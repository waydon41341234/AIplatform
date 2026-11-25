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


assets = {p.name: data_uri(p.name) for p in (ROOT / 'assets').iterdir() if p.suffix in MIME}
html = (ROOT / 'index.html').read_text(encoding='utf-8')

# CSS：背景图换成内嵌
def css(m):
    s = (ROOT / m.group(1)).read_text(encoding='utf-8')
    s = re.sub(r"url\(\.\./assets/([\w.-]+)\)", lambda a: f"url({assets[a.group(1)]})", s)
    return f"<style>\n{s}\n</style>"

html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)

# JS：模板字符串里的 assets/xxx 换成 ${window.A_['xxx']}（图片只内嵌一次）
def js(m):
    s = (ROOT / m.group(1)).read_text(encoding='utf-8')
    s = s.replace('assets/badge-tier${tier}.png', "${window.A_['badge-tier' + tier + '.png']}")
    s = re.sub(r"assets/([\w-]+\.\w+)", lambda a: "${window.A_['" + a.group(1) + "']}", s)
    return f"<script>\n{s.replace('</script>', '<\\/script>')}\n</script>"

html = re.sub(r'<script src="([^"]+)"></script>', js, html)
a_map = '<script>window.A_ = ' + repr(assets).replace("'", '"') + ';</script>\n'
html = html.replace('<div id="app"></div>', '<div id="app"></div>\n' + a_map, 1)
html = html.replace('<link rel="icon" href="assets/logo-orb.webp">', '')

out = ROOT / 'dist' / 'prototype-single.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(out, len(html) // 1024, 'KB')
