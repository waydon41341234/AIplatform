# 架构

## 总体

```
浏览器 (React)                          Node 后端 (Express，参考实现)
 ├─ pages / editor  ──调用──▶ shared/*   ├─ /api/projects  → data/projects/*.json
 ├─ state/editor.ts (撤销、自动保存)      ├─ /api/assets    → data/assets/*
 └─ lib/export.ts  (打包 zip)            └─ /api/ai/*      → AiProvider（默认演示网关）+ data/ledger.jsonl
```

`shared/` 是唯一的业务规则来源，前端和后端都 import 它，测试也只针对它。

## 一份数据驱动所有输出

`Project`（`shared/project/model.ts`）包含：等级、版式、主题（11 基础色 + 覆盖 + 跟设计值）、元素绑定、组件模式、首页九模块（可见性、布局、属性）、素材列表。

```
Project ──layoutHome()──▶ 模块位置
        ──renderHomeSvg()──▶ SVG 字符串 ──┬─ 画布预览（dangerouslySetInnerHTML + 命中区）
                                         ├─ SVG 导出（素材内嵌为 data URI）
                                         └─ PNG 导出（canvas 栅格化，1x / 2x）
        ──runChecks()──▶ 问题列表（编辑器状态点、检查弹窗、交付清单）
        ──buildThemeJson / buildManifest / buildChecklist──▶ 交付包数据文件
```

后续 Figma 导出应同样从 `Project` 生成原生节点，而不是从 PNG/SVG 反推。

## 颜色解析

```
元素 ID ──bindingOf()──▶ Key ──resolveKey()──▶ { hex, alpha, chain, source }
          业主绑定 > 版式默认绑定 > 组件目录默认
                                   业主覆盖 > 默认规则 > 版式“跟设计”值
```

`chain` 是引用链，用于“影响几处”的统计和高级信息展示。

## 编辑器状态

`useEditor.update(recipe)`：在项目副本上修改 → 推入撤销栈（滑块/取色 600ms 内合并为一步）→ 800ms 后 PUT 保存（带 `baseUpdatedAt`，冲突返回 409）。

## 存储（参考实现的局限）

- 文件存储、单进程；写入用临时文件 + rename。
- 无账号：所有项目对所有访问者可见。上线前必须加登录、按业主隔离项目与素材（方案第 9 节）。
- 账本为追加式 JSONL，余额由流水求和；多实例部署需改成数据库事务。
- 素材通过 `/api/assets/:file` 访问，SVG 素材带 CSP 头防脚本。
