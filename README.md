# 业主定制设计平台（首版）

让非技术业主自己完成定制版页面设计：选等级和版式 → 确认品牌配色 → 点哪里改哪里 → 检查并导出。

- **Figma 设计稿（界面以此为准）：** [业主定制设计平台 · 设计稿](https://www.figma.com/design/KEDg6ZjNHLCa2RmMn1veKH/%E4%B8%9A%E4%B8%BB%E5%AE%9A%E5%88%B6%E8%AE%BE%E8%AE%A1%E5%B9%B3%E5%8F%B0-%C2%B7-%E8%AE%BE%E8%AE%A1%E7%A8%BF?node-id=15-2)
- **当前进度：** [PROGRESS.md](PROGRESS.md)

```bash
npm install
npm run dev      # 打开 http://localhost:5173
npm run check    # 类型检查 + 测试 + 打包
```

- 给开发/维护者（含 Codex）：先读 [AGENTS.md](AGENTS.md)
- 架构与数据流：[docs/architecture.md](docs/architecture.md)
- 后端接口：[docs/api.md](docs/api.md)
- AI 网关接入：[docs/ai-gateway.md](docs/ai-gateway.md)
- 68 个颜色 Key：[docs/theme-keys.md](docs/theme-keys.md)
- 首版里的推测与待核定项：[docs/assumptions.md](docs/assumptions.md)
- 后续阶段：[docs/roadmap.md](docs/roadmap.md)
- 多端适配与日夜间：[docs/responsive.md](docs/responsive.md)
- 多语言：[docs/i18n.md](docs/i18n.md)
- Figma 搭建计划与画面清单：[docs/figma-design-plan.md](docs/figma-design-plan.md)，截图：[docs/figma-shots/](docs/figma-shots/)
- 方案原文：[docs/source/](docs/source/)

## 首版已完成

| 能力 | 说明 |
| --- | --- |
| 项目 | 列表、新建向导（品牌名 + 定制等级 + 版式 + 推荐配色）、复制、自动保存、冲突检测 |
| 定制等级 | 普通 4 类 / 高级 9 类 / 全方位 11 类，PC 只覆盖前 4 类；切换不丢设计 |
| 配色 | 11 基础色 → 68 Key（引用、固定、透明度、条件、跟设计）；元素换用途、改用途颜色、锁定关联；68 Key 总表 |
| 首页编辑器 | 九模块点选、拖动排序、显示/隐藏、每区域布局选择（实时用业主配色预览）、已登录/未登录与侧边栏预览、撤销/重做 |
| 素材 | 上传（尺寸不符给裁切/留边预览）、AI 生成候选（演示网关）、本项目素材复用 |
| 规范 | Banner 三规格、导航图标 @2x、LOGO 330–600×100 与按栏高缩放、顶部栏 70–100、导航“后台可更换/入口固定”必交清单 |
| 检查 | 必交项、尺寸、跟设计 Key、颜色循环、对比度、页面溢出；点一下定位到模块 |
| 导出 | zip：整页 PNG 1x/2x、SVG（保留 Key 标识）、规范命名素材、theme.json、project.json、manifest.json、交付清单 |

## 首版未包含

Figma 原生源文件（需先做验证样板）、登录注册等其余 10 类页面的编辑、PC 端画布、账号与多业主隔离、真实 AI 网关与充值、公司集成库素材接入。见 [docs/roadmap.md](docs/roadmap.md)。

> Windows 下 `npm start` 的环境变量写法不同，可用 `set NODE_ENV=production && npx tsx server/index.ts`。
