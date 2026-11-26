# 统一 AI 生成：HTML 半成品（2026-11-26 18:00 暂停）

Waydon 要求先改 Figma 效果图再改 HTML，所以 HTML 实现做到一半就停了，这里只做保存，没有合进原型。

- 规格：../ai-unified.md
- 半成品补丁：ai-unified-html-wip.patch（基于提交 49c5a17，`git apply docs/wip/ai-unified-html-wip.patch` 可还原；其中包含新文件 prototype/js/aigen.js）
- aigen-wip.js：补丁里新增的共用 AI 面板脚本副本

Figma 效果图确认后，按效果图修改这份补丁再合进 prototype/。

**2026-11-26 更新**：已按 Figma 04-AI 统一生成（G1 Banner / G2 顶部栏）改好并合进 prototype/（`prototype/js/aigen.js`）。这份补丁只留作历史；其中 modpanels 里各模块图标的迁移部分没有合入，后续按 Figma G3 / G4 重新做。
