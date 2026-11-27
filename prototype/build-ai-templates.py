"""把 21 套 AI 模版（assets/ai-tpl/<id>/manifest.json）烘成 js/ai-templates.js（单文件原型没有 fetch，只能内嵌）。

用法：python3 prototype/build-ai-templates.py  → 生成 prototype/js/ai-templates.js
- 数据：window.AI_TPL = [{ id, style, n, dark, th, ec, m, logo, a }]，a = 素材路径（manifest.assets；11-27 起 21 套都有，空 = 素材还没出，aidesign.js 兜底）
- 文案：模版名 ad/tpl-n-<id>、提示词 ad/tpl-p-<id> 四语。简体 = manifest.prompt_zh 原文；繁 / 英 / 越按同一句式拼（句式与
  Figma 06 文案 ad/tpl-p-blackgold-2 一致），只有「整体」一句和名称逐套翻译（下面 TR 表）。
规格：team/day-1127-spec.md §1 §3；Figma 04-AI 模版 11-27（430:619174）。
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
TPL_DIR = ROOT / 'assets' / 'ai-tpl'
OUT = ROOT / 'js' / 'ai-templates.js'
STYLES = ['platinum', 'blackgold', 'techblue', 'fresh', 'festive', 'neon', 'minimal']
KEYS = ['primary', 'lead', 'neutral_1', 'neutral_2', 'neutral_3', 'border', 'bg_1', 'bg_2', 'accent_1', 'accent_2', 'accent_3']

# 名称 [繁, 英, 越]、整体描述 [繁, 英, 越]（简体取 manifest）
TR = {
    'platinum-1': (['香檳晨光', 'Champagne Dawn', 'Bình Minh Sâm Panh'], ['香檳金絲帶、水晶獎盃與柔和晨光', 'champagne-gold ribbons, a crystal trophy and soft morning light', 'ruy băng vàng sâm panh, cúp pha lê và nắng sớm dịu nhẹ']),
    'platinum-2': (['玫瑰香檳', 'Rose Champagne', 'Sâm Panh Hồng'], ['玫瑰金花瓣、香檳氣泡、粉金柔光', 'rose-gold petals, champagne bubbles and soft blush-gold light', 'cánh hoa vàng hồng, bọt sâm panh và ánh vàng hồng dịu']),
    'platinum-3': (['鉑銀之境', 'Platinum Realm', 'Cõi Bạch Kim'], ['拉絲鉑金、銀色幾何切面、冷調高光', 'brushed platinum, silver geometric facets and cool highlights', 'bạch kim xước, mặt cắt hình học màu bạc và ánh sáng lạnh']),
    'blackgold-1': (['午夜鎏金', 'Midnight Gilt', 'Vàng Nửa Đêm'], ['黑絲絨上的鎏金皇冠與金幣雨', 'a gilded crown on black velvet with a shower of gold coins', 'vương miện mạ vàng trên nhung đen cùng mưa đồng vàng']),
    'blackgold-2': (['古銅尊享', 'Bronze Prestige', 'Đồng Cổ Thượng Hạng'], ['古銅浮雕、皮革紋理與琥珀暖光', 'bronze relief, leather texture and warm amber light', 'phù điêu đồng cổ, vân da và ánh hổ phách ấm']),
    'blackgold-3': (['香檳夜宴', 'Champagne Gala', 'Dạ Tiệc Sâm Panh'], ['香檳塔、金色光斑與夜宴舞台', 'a champagne tower, golden bokeh and a gala stage', 'tháp sâm panh, đốm sáng vàng và sân khấu dạ tiệc']),
    'techblue-1': (['深海科技', 'Deep Sea Tech', 'Công Nghệ Biển Sâu'], ['深海藍光、數據光軌與全息球場', 'deep-sea blue light, data light trails and a holographic stadium', 'ánh xanh biển sâu, vệt sáng dữ liệu và sân đấu ảnh ba chiều']),
    'techblue-2': (['極光青域', 'Aurora Cyan', 'Cực Quang Xanh'], ['極光青色光帶、冰晶與電路紋', 'cyan aurora bands, ice crystals and circuit patterns', 'dải cực quang xanh, tinh thể băng và hoa văn mạch điện']),
    'techblue-3': (['星際藍紫', 'Interstellar Indigo', 'Tím Xanh Liên Sao'], ['星雲、藍紫行星與光速粒子', 'nebulae, blue-violet planets and light-speed particles', 'tinh vân, hành tinh tím xanh và hạt tốc độ ánh sáng']),
    'fresh-1': (['薄荷清晨', 'Mint Morning', 'Sáng Bạc Hà'], ['薄荷綠葉、露珠與晨光草地', 'mint leaves, dewdrops and a sunlit morning meadow', 'lá bạc hà, giọt sương và đồng cỏ nắng sớm']),
    'fresh-2': (['青檸海岸', 'Lime Coast', 'Bờ Biển Chanh Xanh'], ['青檸切片、海浪與沙灘陽光', 'lime slices, ocean waves and beach sunshine', 'lát chanh xanh, sóng biển và nắng bãi cát']),
    'fresh-3': (['森系草綠', 'Forest Green', 'Rừng Xanh'], ['森林草地、蘑菇與螢火光點', 'forest grass, mushrooms and firefly sparkles', 'thảm cỏ rừng, nấm và đốm sáng đom đóm']),
    'festive-1': (['新春紅包', 'New Year Red Packets', 'Lì Xì Tết'], ['紅包雨、金元寶與燈籠', 'a shower of red packets, gold ingots and lanterns', 'mưa lì xì, thỏi vàng và đèn lồng']),
    'festive-2': (['錦鯉鴻運', 'Lucky Koi', 'Cá Chép May Mắn'], ['金紅錦鯉、祥雲與水波', 'red-gold koi, auspicious clouds and ripples', 'cá chép đỏ vàng, mây lành và gợn nước']),
    'festive-3': (['紅金夜宴', 'Red-Gold Gala', 'Dạ Tiệc Đỏ Vàng'], ['深紅夜色、煙花與金色舞獅', 'a deep-red night, fireworks and a golden lion dance', 'đêm đỏ thẫm, pháo hoa và múa lân vàng']),
    'neon-1': (['電競紫電', 'Violet Volt', 'Tia Chớp Tím'], ['紫色霓虹閃電、電競手把與賽場', 'purple neon lightning, an esports gamepad and an arena', 'tia chớp neon tím, tay cầm eSports và đấu trường']),
    'neon-2': (['賽博青光', 'Cyber Cyan', 'Cyber Xanh Ngọc'], ['賽博城市、青色霓虹招牌與雨夜', 'a cyber city, cyan neon signs and a rainy night', 'thành phố cyber, biển neon xanh ngọc và đêm mưa']),
    'neon-3': (['霓虹粉夜', 'Neon Pink Night', 'Đêm Neon Hồng'], ['粉色霓虹燈牌、迪廳燈球與雷射', 'pink neon signs, a disco ball and lasers', 'biển neon hồng, quả cầu disco và tia laser']),
    'minimal-1': (['墨白', 'Ink & White', 'Mực Trắng'], ['黑白幾何、留白與單一強調色', 'black-and-white geometry, white space and a single accent color', 'hình học trắng đen, khoảng trống và một màu nhấn duy nhất']),
    'minimal-2': (['霧藍灰', 'Misty Blue Gray', 'Xám Xanh Sương'], ['霧藍漸層、磨砂玻璃與柔和陰影', 'misty blue gradients, frosted glass and soft shadows', 'chuyển sắc xanh sương, kính mờ và bóng đổ dịu']),
    'minimal-3': (['石墨暖灰', 'Warm Graphite', 'Than Chì Ấm'], ['石墨、陶土與紙張肌理', 'graphite, terracotta and paper texture', 'than chì, đất nung và vân giấy']),
}
# 风格名 [繁, 英, 越]（同 i18n-ad.js ad/st-*）
ST = {'白金': ['白金', 'Platinum', 'Bạch kim'], '黑金': ['黑金', 'Black gold', 'Đen vàng'], '科技蓝': ['科技藍', 'Tech blue', 'Xanh công nghệ'],
      '清新明亮': ['清新明亮', 'Fresh', 'Tươi sáng'], '节日红金': ['節日紅金', 'Festive red', 'Lễ hội đỏ vàng'], '霓虹电竞': ['霓虹電競', 'Neon esports', 'Neon eSports'],
      '极简灰': ['極簡灰', 'Minimal gray', 'Xám tối giản']}
ICS = {'金属质感': ['金屬質感', 'Metallic icons', 'Biểu tượng chất kim loại'], '渐变': ['漸層', 'Gradient icons', 'Biểu tượng chuyển sắc'],
       '面性填充': ['面性填充', 'Filled icons', 'Biểu tượng tô đặc'], '线性描边': ['線性描邊', 'Outline icons', 'Biểu tượng nét viền'],
       '双色': ['雙色', 'Duotone icons', 'Biểu tượng hai màu']}
GM = {'图标宫格·方角': ['圖示宮格·方角', 'a square-cornered icon grid', 'dạng lưới biểu tượng góc vuông'],
      '图标宫格·胶囊': ['圖示宮格·膠囊', 'a pill-shaped icon grid', 'dạng lưới biểu tượng bo tròn'],
      '左侧栏·胶囊': ['左側欄·膠囊', 'a pill-shaped left sidebar', 'dạng thanh bên trái bo tròn'],
      '左侧栏·方角': ['左側欄·方角', 'a square-cornered left sidebar', 'dạng thanh bên trái góc vuông'],
      '顶部页签·胶囊': ['頂部頁籤·膠囊', 'pill-shaped top tabs', 'dạng tab trên cùng bo tròn'],
      '顶部页签·方角': ['頂部頁籤·方角', 'square-cornered top tabs', 'dạng tab trên cùng góc vuông']}
BN = {'平铺': ['平鋪', 'flat bottom nav', 'điều hướng dưới dạng phẳng'], '中间凸起': ['中間凸起', 'bottom nav with a raised center button', 'điều hướng dưới có nút giữa nổi']}
TB = {'白底': ['白底', 'white top bar', 'thanh trên cùng nền trắng'], '深色底': ['深色底', 'dark top bar', 'thanh trên cùng nền tối'],
      '主色底': ['主色底', 'primary-color top bar', 'thanh trên cùng màu chính']}

PAT = re.compile(r'^【(.+?) · (.+?)】(浅|深)色底 (#[0-9A-F]{6})，主色 (#[0-9A-F]{6})，点缀 (#[0-9A-F]{6})。整体：(.+?)。Banner 3 张（(.+?)，1020×300）：'
                 r'首存豪礼 / 赛事狂欢 / VIP 尊享，标题在左、主体物在右。图标 (.+?)，帐户栏 4 个、底部导航 6 个、游戏分类 9 个同一套光影。'
                 r'布局：游戏菜单(.+?)，游戏卡片 (\d) 列圆角 (\d+)，底部导航(.+?)，顶部栏(.+?)。$')


def prompts(tid, p_zh):
    m = PAT.match(p_zh)
    if not m:
        raise SystemExit(f'{tid}: prompt_zh 句式变了，更新 PAT：{p_zh}')
    st, _name, tone, bg, pri, acc, _motif, size, ics, gm, cols, gc_r, bn, tb = m.groups()
    names, motif = TR[tid]
    r = re.match(r'通用 · 圆角 (\d+)$', size)
    size_t = [f'通用 · 圓角 {r.group(1)}', f'standard · radius {r.group(1)}', f'chuẩn · bo góc {r.group(1)}'] if r else ['中 · 通欄直角', 'medium · full width, square corners', 'vừa · tràn ngang, góc vuông']
    out = [p_zh]
    out.append(f'【{ST[st][0]} · {names[0]}】{tone.replace("浅", "淺")}色底 {bg}，主色 {pri}，點綴 {acc}。整體：{motif[0]}。Banner 3 張（{size_t[0]}，1020×300）：'
               f'首存豪禮 / 賽事狂歡 / VIP 尊享，標題在左、主體物在右。圖示 {ICS[ics][0]}，帳戶欄 4 個、底部導航 6 個、遊戲分類 9 個同一套光影。'
               f'佈局：遊戲選單{GM[gm][0]}，遊戲卡片 {cols} 欄圓角 {gc_r}，底部導航{BN[bn][0]}，頂部欄{TB[tb][0]}。')
    dark = tone == '深'
    out.append(f'[{ST[st][1]} · {names[1]}] {"Dark" if dark else "Light"} background {bg}, primary {pri}, accent {acc}. Overall: {motif[1]}. 3 banners ({size_t[1]}, 1020×300): '
               f'first-deposit gift / match carnival / VIP privileges, title on the left, hero object on the right. {ICS[ics][1]}: 4 account-bar, 6 bottom-nav and 9 game-category icons share one lighting setup. '
               f'Layout: game menu as {GM[gm][1]}, game cards in {cols} columns with {gc_r} radius, {BN[bn][1]}, {TB[tb][1]}.')
    out.append(f'[{ST[st][2]} · {names[2]}] {"Nền tối" if dark else "Nền sáng"} {bg}, màu chính {pri}, điểm nhấn {acc}. Tổng thể: {motif[2]}. 3 Banner ({size_t[2]}, 1020×300): '
               f'quà nạp đầu / lễ hội thể thao / đặc quyền VIP, tiêu đề bên trái, vật thể chính bên phải. {ICS[ics][2]}: 4 ở thanh tài khoản, 6 ở điều hướng dưới, 9 danh mục trò chơi dùng chung một kiểu ánh sáng. '
               f'Bố cục: menu trò chơi {GM[gm][2]}, thẻ trò chơi {cols} cột bo góc {gc_r}, {BN[bn][2]}, {TB[tb][2]}.')
    return out


def main():
    tpls, i18n = [], {}
    for st in STYLES:
        for n in (1, 2, 3):
            tid = f'{st}-{n}'
            d = json.loads((TPL_DIR / tid / 'manifest.json').read_text(encoding='utf-8'))
            th = {k: d['theme'][k].lower() for k in KEYS}
            md = d['modules']
            m = {k: md[k] for k in ['banner_size', 'banner_corner', 'banner_ind', 'gm_style', 'gm_shape', 'jp_layout', 'jp_corner', 'jp_margin', 'jp_bg',
                                    'gc_cols', 'gc_corner', 'gc_gap', 'footer_align', 'bn_style', 'sd_style', 'tb_mode', 'icon_style']}
            assets = d.get('assets') or {}
            for k, v in assets.items():
                if not (ROOT / v).is_file():
                    raise SystemExit(f'{tid}: 缺素材 {v}')
            logo = d.get('logo') or ''
            tpls.append({'id': tid, 'style': st, 'n': n, 'dark': bool(d['dark']), 'th': th, 'ec': d.get('ec') or {}, 'm': m,
                         'logo': logo if (ROOT / logo).is_file() else None, 'a': {k: assets[k] for k in sorted(assets)} or None})
            names = TR[tid][0]
            i18n[f'ad/tpl-n-{tid}'] = [d['name']] + names
            i18n[f'ad/tpl-p-{tid}'] = prompts(tid, d['prompt_zh'])
    js = ['/* 自动生成，勿手改：python3 prototype/build-ai-templates.py（来源 assets/ai-tpl/<id>/manifest.json，规格 team/day-1127-spec.md）。',
          ' * 21 套 AI 页面风格模版：设计参数 + 真实 AI 素材路径（21 套都有；a 为空 = 素材还没出，aidesign.js 兜底用 11-26 黑金风格图标 + 滤镜 Banner）。 */',
          'window.AI_TPL = [']
    js += ['  ' + json.dumps(x, ensure_ascii=False, separators=(',', ':')) + ',' for x in tpls]
    js += ['];', '// 模版名 / 生成提示词：[简, 繁, 英, 越]', 'Object.assign(window.I18N, {']
    js += [f'  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},' for k, v in i18n.items()]
    js += ['});', '']
    OUT.write_text('\n'.join(js), encoding='utf-8')
    print(OUT, len(tpls), 'templates,', sum(1 for x in tpls if x['a']), 'with assets,', OUT.stat().st_size // 1024, 'KB')


main()
