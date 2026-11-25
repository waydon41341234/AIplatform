# HTML 交互原型（prototype/）

把 Figma 已有页面（首页、工作台、编辑器内页；电脑 + 手机；日 / 夜；四种语言）搭成可点击的 HTML，用来验证交互。
**这是原型，不是正式前端代码**：正式平台用 React + TS（见仓库根目录 `AGENTS.md`）。原型里的数据都是假的，生成、上传、导出都是模拟。

## 打开方式

纯静态文件，不用安装依赖。任选一种：

```bash
cd prototype && python3 -m http.server 8765
# 浏览器打开 http://localhost:8765/
```

不想开命令行：运行 `python3 prototype/build-single.py` 生成 `prototype/dist/prototype-single.html`（CSS、JS、图片全部内嵌的单文件），双击就能打开，也可以直接发给别人。注意别在压缩包里直接双击 `index.html`，要先解压，否则会是空白页。

地址参数：`?theme=dark|light&lang=zh-Hans|zh-Hant|en|vi`，例如 `index.html?theme=light&lang=vi#/editor`。
电脑宽度下右下角有一条半透明的「原型切换条」（日夜 + 四种语言），不属于平台界面。

## 页面（hash 路由）

| 路由 | 页面 |
| --- | --- |
| `#/home` | 首页（Hero + 创作框、定制等级、最近项目、模板） |
| `#/workbench` | 工作台（历史会话 + 生成记录 + 底部创作框） |
| `#/workbench/new` | 工作台新对话（空状态） |
| `#/editor` | 编辑器内页（先显示加载步骤，约 2 秒） |
| `#/todo/<页面>` | 尚未设计的页面（模板、我的项目、历史生成、我的）→ 统一空状态 |

断点与 `docs/responsive.md` 一致：<600 手机、600–839 平板竖、840–1199 平板横 / 小屏、≥1200 电脑。编辑器 <840 用手机布局。

## 可验证的交互

- **外壳**：侧栏收起 / 展开（工作台默认展开并显示历史会话）、语言菜单、日夜切换、顶栏搜索回车 →「功能开发中」提示。手机为顶栏 + 底部 Tab。
- **创作框**：图标类型页签、参考图上传 / 移除、模型 / 配色 / 规格下拉（手机为底部面板）、自定义配色、生成一个 / 一套；一套先弹确认（显示消耗与余额），确认后扣点并跳到工作台。
- **工作台**：会话搜索、新对话、会话「⋯」菜单（往上弹：重命名 / 置顶 / 下载全部 / 删除确认）、重命名回车保存 / Esc 取消、置顶图钉；生成中进度、样板确认 → 生成其余 → 完成；单个下载、ZIP 下载、用作参考、重新生成。手机：历史抽屉、会话菜单与删除为底部面板。
- **编辑器**：左栏模块拖拽排序、眼睛显隐、侧边栏左右；「添加模块」（电脑往下弹的两列菜单 / 手机底部面板，加到所选模块下方）；删除模块（浮动工具条或手机面板的「⋯」→ 删除，带撤销；顶部栏 / 底部导航 / 侧边栏是固定模块，只能隐藏）；彩金池、中部导航、游戏菜单、游戏卡片、页脚、侧边栏、底部导航都有「内容 / 布局 / 颜色」三个页签，改了画布立即变（菜单栏仍是待设计）；画布点选模块 → 浮动工具条（上移 / 下移 / 隐藏 /「⋯」复制 / 恢复默认 / 删除）；撤销 / 重做；整页配色、11 个基础色 + 取色器（色谱 / 色相 / HEX / 推荐色 / Key 菜单）；Banner 尺寸、轮播（3 秒自动、拖动、圆点）、换图上传进度、AI 生成（自动提示词 + 关键词 + 4 个候选）；顶部栏内容 / 布局 / 颜色；登录态切换；H5 / PC（PC 为待设计空状态）；交付检查、导出（检查未通过拦截 → 导出中 → 文件列表）；手机端页面 / 模块 / 配色 / 预览四个面板与全屏预览。
- Esc 关闭任何弹层。

## 文件

```
index.html          入口（加载顺序：icons → i18n → core → home → workbench → modpanels → editor）
css/tokens.css      Figma 变量值（颜色日夜、字号、圆角、间距、各断点布局）
css/app.css         通用控件 + 外壳 + 首页 + 工作台
css/editor.css      编辑器 + H5 预览（业主主题色用 --o-* 变量）
js/icons.js         Phosphor Icons 2.1.1（MIT）挑出的 SVG 路径，window.PH
js/i18n.js          四语文案 window.I18N = { key: [简, 繁, 英, 越] }
js/core.js          状态、路由、渲染、通用组件（菜单 / 面板 / 弹窗 / 提示）
js/home.js          外壳、创作框、首页
js/workbench.js     工作台
js/modpanels.js     编辑器里 7 个模块的面板与画布渲染（需在 editor.js 之前加载）
js/editor.js        编辑器
assets/             Hero 图、等级徽章、Logo（均从 Figma / public/brand 导出）
```

文案 key 与 Figma「06 文案 i18n」变量同名。带 `{n}` 之类占位符的是原型里拼参数用的写法（如 `ed/check-n`、`spec/set-n`），Figma 里是写死数字的版本，正式代码用 i18n 库的插值实现。

## 本轮在 Figma 补充的内容（2026-11-25）

- 02 切图：`slice/icon/pin.fill`、`slice/icon/wrench.fill`。
- 03 组件（「§ HTML 原型补充」区）：Toast、EmptyState、UploadProgress、SessionItem 新增 State=Editing / Pinned。
- 04 页面（「§ HTML 原型补充状态」区，日夜各一套）：工作台重命名 / 已置顶（电脑 + 手机抽屉）、编辑器其它模块待设计、PC 画布待设计、Banner 素材上传中（电脑 + 手机）。
- 06 文案：toast/*、menu/unpin、common/coming-soon、ed/todo-*、ed/pc-todo-*、page/todo-*、ed/undo-toast 等，以及 ed/check-passed、mod/midnav、mod/bottomnav。

### 第二轮（2026-11-25 下午）

- 03 组件「§ 添加 / 删除模块」：TreeAddButton、AddModuleItem（Default / InPage）、AddModuleMenu（Desktop 两列下拉 / Mobile 底部面板）。
- 04 页面「§ 添加 / 删除模块」(y47000 起，日夜)：添加模块菜单、删除模块后（可撤销）、手机模块面板添加入口、手机添加模块面板、手机删除后。
- 04 页面「§ 模块编辑面板（右栏 340）」(y49400，Dark / Light 两组)：7 个模块 × 内容 / 布局 / 颜色 共 21 张；颜色行第一个色块绑定 shared/catalog 里的默认 Key（ext/*）。
- 06 文案：ed/add-*、ed/desc-*、ed/added-toast、ed/deleted-toast、mp/*（Figma 变量名不能有点，元素颜色写成 mp/c-jackpot-bg 这种形式）。

### 第三轮（2026-11-25 晚）：模块编辑完整页面 + 原型连线

- 04 页面「§ 模块编辑 · 完整页面」(y54100 起)：彩金池 / 中部导航 / 游戏菜单 / 游戏卡片 / 页脚 / 侧边栏 / 底部导航 × 内容 / 布局 / 颜色，电脑 1440 完整编辑器画面（左栏选中、画布选中框 + 工具条、右栏面板），夜间 x0 起 21 张、日间 x4700 起 21 张；侧边栏画面带展开的抽屉。
- 原型连线（Flow 1 / Flow 3 起点的编辑器内可点）：左栏模块行、画布模块 → 该模块「内容」；面板页签切换内容 / 布局 / 颜色；「添加模块」→ 添加模块菜单；彩金池工具条「⋯」→ 删除后（可撤销）；左栏「首页」→ 回到整页设置。
