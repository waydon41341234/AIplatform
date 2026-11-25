# 进度说明

更新：2026-11-26

> 最新进展：HTML 交互原型在 `prototype/`（说明见 `prototype/README.md`，第六轮 = AI 首页设计、未登录 / 登录、模板开放范围、我的项目多选删除、余额框样式）。**还没做的和给 Codex 的待办统一看 `docs/remaining-work.md` 第 0 节。**

## 工作顺序

先在 Figma 完成页面与原型交互设计，再按定稿写代码。Figma 搭建顺序：配色与字号变量 → 切图母组件 → 组件 → 页面排版。

**Figma 设计稿：** [业主定制设计平台 · 设计稿](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/%E4%B8%9A%E4%B8%BB%E5%AE%9A%E5%88%B6%E8%AE%BE%E8%AE%A1%E5%B9%B3%E5%8F%B0-%C2%B7-%E8%AE%BE%E8%AE%A1%E7%A8%BF?node-id=15-2)

## Figma（进行中）

已完成：

- 设计规范与变量：平台界面色（日间 / 夜间）、业主主题 68 个颜色 Key、字号、布局断点变量（见 `docs/responsive.md`）
- 图标
- 多语言文案变量：简体中文、繁體中文、English、Tiếng Việt（见 `docs/i18n.md`）
- 首页：网页日间 / 夜间、手机 375、侧栏展开、各语言手机版
- 顶部栏（网页夜间、手机 375）、输入框（生成一个 / 一套、三类图标数量）、模型下拉（日 / 夜）
- 定制等级图标方案、星级徽章方案（日 / 夜，含磨砂玻璃放大稿）

截图见 `docs/figma-shots/`。尚未完成的画面按 `docs/figma-design-plan.md` 的清单继续。

## HTML 交互原型（2026-11-25）

`prototype/`：把 Figma 首页、工作台、编辑器内页（电脑 + 手机、日 / 夜、四种语言）搭成可点击的静态 HTML，用来验证交互，已用 Playwright 自测（4 档宽度、日夜、四语、随机点击无报错、无横向滚动）。打开方式与交互清单见 `prototype/README.md`。原型缺的状态已先补进 Figma（切图 → 组件 → 页面）。

## 代码（首版，待按 Figma 更新）

首版可运行：`npm install && npm run dev`，`npm run check` 通过（33 项测试）。功能清单见 README。
首版界面早于 Figma 定稿，视觉、文案多语言、日夜间与多端适配需按设计稿更新；业务规则（`shared/`）可继续沿用。

## 未开始

Figma 源文件交付验证样板、其余 10 类业主页面编辑、PC 画布、账号与业主隔离、真实 AI 网关与充值、公司集成库素材接入。见 `docs/roadmap.md`。
