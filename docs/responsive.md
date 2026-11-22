# 多端适配与日夜间模式（设计规范 → 代码对照）

来源：Figma《业主定制设计平台 · 设计稿》→ 01 设计规范 / 变量集合「05 布局 Layout」「01 平台界面 Platform」。
修改断点或布局数值时，Figma 变量与本文件、`src/styles.css` 要同步改。

## 1. 断点（只按窗口宽度，不判断设备型号）

| 档位（Figma 模式） | 宽度 CSS px | 媒体查询 | 设计稿 | 覆盖的主流设备（CSS 视口宽） |
| --- | --- | --- | --- | --- |
| Compact 手机 | < 600 | `(max-width: 599px)` | 375×812 | iPhone SE 375、13 mini 375、15/16 393、16 Pro 402、Pro Max 430/440；安卓 360、412；折叠屏折叠态 344–412；最小适配 320 |
| Medium 折叠屏展开 / iPad 竖屏 | 600–839 | `(min-width: 600px) and (max-width: 839px)` | 744×1133 | 三星 Fold 展开约 673–720、华为 Mate X 展开约 740–800、iPad mini 744、iPad / Air 11 820、Pro 11 834 |
| Expanded iPad 横屏 | 840–1199 | `(min-width: 840px) and (max-width: 1199px)` | 1180×820 | Pixel Fold 展开 841、iPad Air 13 / Pro 13 竖屏 1024–1032、iPad mini 横屏 1133、iPad 横屏 1180、Pro 11 横屏 1194 |
| Desktop 网页 | ≥ 1200 | `(min-width: 1200px)` | 1440×900 | 笔记本 1280/1366/1440/1536、桌面 1920/2560、iPad Pro 13 横屏 1366–1376 |

折叠屏的展开宽度各机型不一，上表为约值；测试时用 Chrome DevTools 的设备预设逐一核对，布局只认宽度档位。

业主页面（H5）始终按 750 设计稿出图 = iPhone 375pt @2x，与平台界面断点无关。

## 2. 布局变量（Figma `05 布局 Layout` = CSS 自定义属性）

| 变量 | Compact | Medium | Expanded | Desktop |
| --- | --- | --- | --- | --- |
| grid/columns | 4 | 8 | 12 | 12 |
| grid/margin | 16 | 24 | 32 | 40 |
| grid/gutter | 12 | 16 | 20 | 24 |
| content/max-width | 600（流式） | 840（流式） | 1200（流式） | 1280 |
| nav/sidebar-width | 0 | 72 | 72 | 88 |
| nav/topbar-height | 56 | 56 | 60 | 64 |
| nav/tabbar-height | 49（+安全区） | 0 | 0 | 0 |
| card/columns | 2 | 3 | 4 | 5（≥1600 为 6） |

```css
:root { --grid-columns: 4; --grid-margin: 16px; --grid-gutter: 12px; --nav-sidebar-width: 0px; --nav-topbar-height: 56px; --nav-tabbar-height: 49px; --card-columns: 2; }
@media (min-width: 600px)  { :root { --grid-columns: 8;  --grid-margin: 24px; --grid-gutter: 16px; --nav-sidebar-width: 72px; --nav-tabbar-height: 0px; --card-columns: 3; } }
@media (min-width: 840px)  { :root { --grid-columns: 12; --grid-margin: 32px; --grid-gutter: 20px; --nav-topbar-height: 60px; --card-columns: 4; } }
@media (min-width: 1200px) { :root { --grid-margin: 40px; --grid-gutter: 24px; --nav-sidebar-width: 88px; --nav-topbar-height: 64px; --card-columns: 5; } }
@media (min-width: 1600px) { :root { --card-columns: 6; } }

body { min-height: 100dvh; padding: env(safe-area-inset-top) env(safe-area-inset-right) 0 env(safe-area-inset-left); }
.tabbar { height: calc(var(--nav-tabbar-height) + env(safe-area-inset-bottom)); }
/* 折叠屏双屏：内容避开折痕 */
@media (horizontal-viewport-segments: 2) { .split { column-gap: calc(env(viewport-segment-left 1 0) - env(viewport-segment-right 0 0)); } }
```

`index.html` 需要 `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`。

## 3. 日间 / 夜间

- 平台界面颜色 = 苹果 HIG 系统色（浅色 / 深色两套），品牌强调色保留 Logo 蓝紫（日间版加深保证白底对比）。
- Figma 变量集合「01 平台界面 Platform」有 `Light 日间` / `Dark 夜间` 两个模式；CSS 变量名见各变量的 WEB code syntax（如 `--bg`、`--text`、`--brand`）。
- 默认跟随 `prefers-color-scheme`，用户手动切换时写 `html[data-theme="light|dark"]` 并存本地。
- 业主主题 68 Key 不受平台日夜间影响（那是业主页面自己的配色）。

## 4. 图标

SF Symbols 风格自绘线性图标（SF Symbols 授权仅限苹果平台，网页不能直接使用）。24 网格、线宽 1.75、圆头圆角；选中态用 `.fill` 实心版。代码里用内联 SVG + `currentColor`，颜色取 `--icon` / `--icon-2` / `--brand`。
