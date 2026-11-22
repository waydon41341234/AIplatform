# 首版中的推测与待核定项

以下内容方案里没有给出确切数据，首版做了合理占位，代码中标 `guess: true` 或【推测】，界面上显示紫色“待核定 / 示例”徽标。拿到公司正式数据后替换对应文件即可。

| # | 内容 | 首版做法 | 替换位置 |
| --- | --- | --- | --- |
| 1 | 版式模板 | 两套示例：经典浅色、深色质感 | `shared/catalog/templates.ts` |
| 2 | 推荐配色 | 规范默认蓝 + 3 套示例 | 同上 `PALETTES` |
| 3 | 各区域布局 | 每区域 1–3 种示例（页脚仅 1 种，与方案“只核实一款”一致） | `shared/catalog/home.ts` `LAYOUTS` + 渲染器 |
| 4 | 元素默认颜色用途 | 规范写明的直接用（如 bs_topnav_bg、btmnav_def）；登录按钮、彩金池背景等为推测 | `MODULE_ELEMENTS` 中 `guess: true` 项 |
| 5 | 后台可配置入口清单 | 中部 7 个、底部 5 个示例入口 | `MIDNAV_ENTRIES` / `BOTTOMNAV_ENTRIES` |
| 6 | 游戏卡片 A1–A7 样式 | 只登记 5 个尺寸，未区分样式与角标规则 | `CARD_SPECS` |
| 7 | 指示器四款样式 | 按方案给的五点示例尺寸近似绘制 | `render/svg.ts` `renderIndicator` |
| 8 | 效果标签（玻璃、金属…） | 文字说明，无参考图 | `src/editor/AiComposer.tsx` `EFFECTS` |
| 9 | 初始页面高度 | 默认 1334；版式自带内容超过一屏时初始取内容高度，之后再溢出才提示 | `createProject()` |
| 10 | LOGO 在顶部栏的内边距 | 在 H/100 比例内再缩到 60% 栏高 | `render/svg.ts` 顶部栏 |
| 11 | 字号 | 首版各组件用固定字号，未开放字号档位 | 待做 |
| 12 | AI 单价 | 演示：Banner/背景 2 点、其他 1 点 | `server/ai/mockProvider.ts` |
| 13 | “菜单栏”类别 | 方案未说明对应首页哪个模块，暂标“即将开放” | `src/editor/PageTree.tsx` |

已知的规范自带问题（检查会提示但不自动改）：默认 `text_accent3`(#FFFFFF) 配 `accent_3`(#FFAA09) 对比度约 1.9，影响注册按钮和角标文字。
