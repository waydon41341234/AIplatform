# AGENTS.md — 业主定制设计平台

给在本仓库工作的 AI 编程助手（Codex 等）和工程师的说明。先读本文件，再读 `docs/`。

## 项目是什么

非技术业主自助完成“定制版”H5 页面设计的平台：选定制等级 → 选版式 → 定 11 个基础色（自动映射 68 个颜色 Key）→ 点选页面区域修改 → 检查 → 导出 PNG / SVG / 数据包。
界面设计以 Figma 为准：[业主定制设计平台 · 设计稿](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/%E4%B8%9A%E4%B8%BB%E5%AE%9A%E5%88%B6%E8%AE%BE%E8%AE%A1%E5%B9%B3%E5%8F%B0-%C2%B7-%E8%AE%BE%E8%AE%A1%E7%A8%BF?node-id=15-2)。颜色、字号、布局、文案都是 Figma 变量，代码用同名 token/key，改动两边同步。当前进度见 `PROGRESS.md`。

产品依据：`docs/source/集成库-业主定制设计平台改造方案.md` 与 `docs/source/色值Key绑定规范.md`（原文，勿改）。

## 常用命令

```bash
npm install
npm run dev        # 前端 http://localhost:5173 + 后端 http://127.0.0.1:4400（热更新）
npm test           # vitest：规则与接口测试，必须全部通过
npm run typecheck  # tsc --noEmit
npm run build      # 类型检查 + 打包到 dist/
npm start          # 生产模式：后端同时托管 dist/
npm run check      # typecheck + test + build，提交前运行
```

Node ≥ 20。数据默认写在 `./data/`（可用 `DATA_DIR` 改），已在 `.gitignore`。

## 目录

```
shared/            前后端共用的业务规则（纯 TypeScript，无 DOM / Node 依赖）
  theme/keys.ts      68-Key 定义（11 基础 + 57 规则）——等同公司色值规范
  theme/resolve.ts   主题解析：引用、透明度、条件规则、循环检测、对比度
  catalog/           规范目录：等级范围、尺寸、首页九模块、元素→Key、布局、模板、推荐色板
  project/model.ts   项目文档结构（SCHEMA_VERSION + migrate）
  project/bindings.ts 元素颜色绑定与锁定
  project/checks.ts  交付检查（可定位到模块/元素）
  render/layout.ts   首页布局计算
  render/svg.ts      唯一渲染器：画布预览、SVG、PNG 都用它
  export/package.ts  theme.json / manifest.json / 交付清单
  ai/contract.ts     AI 网关接口契约
server/            Express 参考实现（文件存储、素材上传、演示 AI 网关、账本）
src/               React 前端
  pages/             项目列表、新建向导、编辑器、余额
  editor/            编辑器各面板（画布、模块树、内容、布局、颜色、素材槽、AI 创作框、检查、导出）
  state/editor.ts    zustand：项目、撤销/重做、自动保存
  lib/               api 客户端、路由、图片处理、导出打包
tests/             vitest
docs/              设计与交接文档（source/ 方案原文，figma-shots/ 设计稿截图）
PROGRESS.md        当前进度
public/brand/      平台 Logo
```

## 必须遵守的规则（改代码前读）

1. **业务规则只写在 `shared/`**，前端组件和服务端只调用它。改规则必须补测试。
2. **68 个 Key 名称不可改名、合并、删除**，即使两个 Key 当前颜色相同。规则存“引用”，不存复制出来的 HEX。
3. **锁定 = 保持颜色用途（Key）关联，不是冻结颜色**。换模板、批量配色不能改锁定的绑定；基础色变化仍要联动。
4. **“跟设计”的 7 个 Key 不能默认等于 primary**，值来自版式模板或业主设置。
5. **规范尺寸不可被业主改**：Banner 1080×490 / 1020×300 / 386×244；导航图标逻辑 70×70、80×70、100×76，PNG 交付 @2x；LOGO 宽 330–600 × 高 100；顶部栏高 70–100。数值只在 `shared/catalog/specs.ts`。
6. **不静默拉伸或裁切**：尺寸不符先给预览，业主采用后才上传；内容溢出只提示，不裁掉。
7. **不触发未确认的收费**：只有业主点击“生成”才调用 AI；先显示预计费用；用幂等键。前端不得持有任何模型名、密钥或供应商地址。
8. **渲染只有一个来源** `shared/render/svg.ts`。新增视觉元素：先在 `catalog/home.ts` 登记元素 ID 与默认 Key，再在渲染器里用 `fill(elementId)` 上色。
9. 界面文案面向非技术业主：说用途（“主色”“未选中文字”），不说 Key/HEX/参数；技术信息放“显示高级信息”。
10. 标【推测】/ `guess: true` 的数据是占位，替换成公司登记数据时改 `shared/catalog/*`，并同步 `docs/assumptions.md`。

## 常见任务怎么做

- **新增首页模块元素颜色**：`shared/catalog/home.ts` 的 `MODULE_ELEMENTS` 加一项 → 渲染器用 `fill('模块.元素')` → 如是文字/背景对，加到 `checks.ts` 的 `CONTRAST_PAIRS`。
- **新增区域布局**：`LAYOUTS` 加一项 → `render/layout.ts` 处理高度 → `render/svg.ts` 处理绘制 → 布局缩略图自动生成。
- **新增版式模板**：`shared/catalog/templates.ts`，必须给 7 个“跟设计”Key 赋值（测试会检查）。
- **接入真实 AI 网关**：见 `docs/ai-gateway.md`，实现 `server/ai/provider.ts` 的 `AiProvider`。
- **新增页面类别（登录注册页等）**：见 `docs/roadmap.md` 第 2 节。
- **界面多端适配 / 日夜间**：见 `docs/responsive.md`（断点、布局变量、CSS 自定义属性）。
- **界面文案与多语言**（简中、繁中、英、越）：见 `docs/i18n.md`，key 与 Figma「06 文案 i18n」变量同名；不要在组件里写死界面文字。
- **改项目数据结构**：`SCHEMA_VERSION` +1，在 `migrate()` 写迁移，并加测试。

## 不要做

- 不要把 PNG 改后缀当 SVG，或把 PNG/SVG/JSON 改名为 `.fig`。
- 不要在 `data/`、项目 JSON、交付包或仓库里写入任何密钥。
- 不要绕过 `checkRule()` 直接写 `theme.overrides`（会漏掉循环引用检查）。
- 不要删除 `docs/source/` 下的方案原文。
