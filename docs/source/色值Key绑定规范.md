# 业主定制平台：色值 Key 映射与绑定方案

日期：2026-11-20  
状态：方案稿；依据用户提供的 68-Key 色值表，未开始实现。

## 1. 基础色与扩展 Key

业主先设置下列 11 个基础色。这里的“11 色”指基础输入，不限制整个项目最终只能出现 11 种颜色。固定色、透明度派生色和按设计确定的扩展色仍需保留。

| Key | 用途 | 用户提供的默认值 |
| --- | --- | --- |
| primary | 主色 | #1678FF |
| lead | 重要 | #333333 |
| neutral_1 | 次级 | #666666 |
| neutral_2 | 较弱 | #999999 |
| neutral_3 | 未输入 | #CCCCCC |
| border | 描边 | #E3E3E3 |
| bg_1 | 背景 | #F8F8F8 |
| bg_2 | 底板 | #FFFFFF |
| accent_1 | 辅助（绿） | #04BE02 |
| accent_2 | 辅助（红） | #EA4E3D |
| accent_3 | 辅助（橙） | #FFAA09 |

其余 57 个 Key 按下表处理。规则值表示引用关系，不是把当前基础色的 HEX 复制一份。业主调整 primary 时，引用它的 Key 自动更新；已改成独立配色的 Key 保留自己的值，并显示当前规则来源。

## 2. 扩展 Key 的完整默认规则

| Key | 默认规则 | 说明 / 适用范围 |
| --- | --- | --- |
| leftnav_def | 引用 neutral_2 | 左侧栏未选中文字 |
| leftnav_active | 引用 text_primary | 左侧栏选中文字 |
| text_primary | 固定 #FFFFFF | 主色通用按钮字体；作为独立 Key 保留 |
| text_accent3 | 固定 #FFFFFF | 辅助橙通用按钮字体 |
| home_bg | 跟设计 | H5/APP 首页背景 |
| home_db | 跟设计 | 首页背景上的底板 |
| search_icon | 引用 primary | 首页版式特殊颜色，内页不可使用此 Key |
| label_accent3 | 引用 accent_3 | 橙色角标 |
| labeltext_accent3 | 引用 text_accent3 | 橙色角标字体 |
| kb_bg | 引用 border | 数字键盘底色 |
| filter_bg | 引用 bg_1 | 筛选底板 |
| table_bg | 固定 #FFFFFF | 通用表格背景 |
| btmnav_def | 跟设计 | 底部导航未选中颜色；文字/图标使用范围按组件登记 |
| btmnav_active | 跟设计 | 底部导航选中颜色；文字/图标使用范围按组件登记 |
| icon_1 | 引用 primary | 蓝色小图标 |
| filter_active | 引用 primary | 筛选选中 |
| icon_tg_q | 引用 neutral_1 | 左侧栏图标渐变起点 |
| icon_tg_z | 引用 neutral_1 | 左侧栏图标渐变终点 |
| jackpot_text | 固定 #FFFFFF | 彩金池标题 |
| jdd_vip_bjc | 引用 primary | VIP 保级差进度条 |
| bs_zc_an1 | 引用 bg_1 | 版式侧边栏按钮 |
| bs_zc_bg | 固定 #FFFFFF | 版式侧边栏底 |
| ddt_bg | 引用 border | 兜底图底板背景 |
| ddt_icon | 引用 bg_2 | 兜底图图形 |
| bs_topnav_bg | 跟设计 | 版式顶部导航底 |
| alt_primary | 引用 primary | 欧美白底特殊主题色 |
| alt_neutral_1 | 引用 neutral_1 | 欧美白底特殊次级色 |
| alt_neutral_2 | 引用 neutral_2 | 欧美白底特殊较弱色 |
| alt_border | 引用 border | 欧美白底特殊描边 |
| profile_icon_1 | 有底引用 primary；无底引用 accent_3 | 个人中心中部图标，按图标是否有底的组件属性解析 |
| profile_icon_2 | 有底引用 primary；无底引用 accent_1 | 同上 |
| profile_icon_3 | 有底引用 primary；无底引用 primary | 两种模式暂同色，但保留模式规则 |
| profile_icon_4 | 有底引用 primary；无底引用 accent_2 | 同上 |
| profile_toptext | 固定 #FFFFFF | 个人中心顶部内容 |
| web_filter_gou | 引用 text_primary | 筛选选中勾 |
| web_topbg_1 | 固定 #3C8DFF | 底色渐变起点；保留原值，不擅自绑定 primary |
| web_topbg_3 | 固定 #1B7AFF | 底色渐变终点（高款）；保留原值 |
| web_left_bg_q | 固定 #FFFFFF | 侧边栏选中背景渐变起点 |
| web_left_bg_z | 固定 #FFFFFF | 侧边栏选中背景渐变终点 |
| web_load_zz | 引用 border，透明度 0.6 | border99；按 #RRGGBBAA 的 99 解释为 153/255 |
| web_plat_line | 引用 neutral_3 | 平台底板外描边 |
| web_left_bg_shadow | 固定 #0000001F | 未选中左侧按钮、平台底板等投影的颜色；阴影偏移/模糊另存 |
| web_bas_zc_an2 | 固定 #FFFFFF | 版式侧边栏按钮悬停 |
| web_bs_yj_bg | 跟设计 | 版式页脚底 |
| web_btmnav_db | 跟设计 | H5 底部导航底色；不能仅凭 web_ 前缀判断为 PC 专用 |
| alt_text_primary | 引用 text_primary | 顶部导航主按钮字体 |
| alt_lead | 引用 lead | 特殊主级色 |
| web_left_bg_shadow_active | 固定 #0000001F | 左侧按钮选中投影 |
| tg_accent_1 | 引用 accent_1，透明度 0.2 | 推广教程绿底板 |
| tg_accent_3 | 引用 accent_3，透明度 0.2 | 推广教程橙底板 |
| tg_primary | 引用 primary，透明度 0.2 | 推广教程主题底板 |
| cards_text | 欧美卡片固定 #FFFFFF；经典卡片引用 neutral_1 | 按卡片组件样式解析；其他样式在模板登记时确定 |
| btn_color_1 | 引用 primary | 特殊公共按钮渐变中间色 |
| btn_color_2 | 引用 primary | 特殊公共按钮渐变终点 |
| custom_1 | 固定 #FFFFFF | 首页特殊色 1 |
| custom_2 | 固定 #FFFFFF | 首页特殊色 2 |
| custom_3 | 固定 #FFFFFF | 首页特殊色 3 |

“20%”暂按颜色透明度 20% 解释，保留颜色引用与 alpha，不直接生成一个与白色混合的 HEX。若公司实际定义为白色混合或其他算法，需要在实现前更正此规则。

规则中“跟设计”的七个 Key 必须通过版式默认主题或业主显式配色获得值，不能默认全部映射为 primary。分别为 home_bg、home_db、btmnav_def、btmnav_active、bs_topnav_bg、web_bs_yj_bg、web_btmnav_db。

固定色是规范提供的默认规则，不意味着自动改造成基础色别名。若业主为具体设计修改它，记录为明确覆盖，保留默认规则以便恢复，并在交付清单体现。

## 3. 配色与 Key 锁定流程

1. 新建项目时显示 11 个基础色，业主选择或输入 HEX。系统建立其余 Key 的默认映射。
2. 选取参考版式后，载入该版式已登记的组件用色 Key 与“跟设计”默认配色。不通过颜色相同来反推元素语义。
3. 业主选择页面元素，右侧显示用途、当前 Key、当前颜色、默认规则、来源与影响范围。例如“底部导航 / 未选中文案 / btmnav_def”。
4. 业主可以把该 Key 设为一个基础/扩展 Key 的引用，或选取独立颜色。系统预览受影响元素；采用后写入项目主题。
5. 点击“锁定 Key 绑定”后，该元素保持指定 Key，智能匹配、换模板和批量配色不能擅自替换这个绑定。
6. 修改基础色或被引用 Key 时，解析后的颜色正常联动；锁定绑定不会阻止这类合法更新。需要改变绑定时显式解锁，或为新组件重新确认绑定。

**锁定绑定与冻结颜色不同。** 本方案把用户所说的锁定解释为保持语义 Key。需要某个元素永远保持当前 HEX 时，用独立覆盖实现，并显示“已脱离默认映射”，避免用户误以为仍跟随基础色。

示例：

- 业主将底部导航未选中文案设为 #999999，写入 btmnav_def，然后把对应文字层绑定并锁定到 btmnav_def。
- 如果希望随较弱色变化，则将 btmnav_def 设为引用 neutral_2。锁定后 neutral_2 更新，文字随之更新。
- 若 btmnav_def 保留独立 HEX，则 neutral_2 更新不会影响它；修改 btmnav_def 则所有绑定它的元素同步更新。
- 两个 Key 当前即使均为 #FFFFFF，也不合并。例如 text_primary、text_accent3、profile_toptext 有不同用途，需要独立保留。

对“修改当前元素”和“修改整个项目的 Key”使用不同操作。项目 Key 修改默认影响全部引用它的元素；个别元素需要例外时先建立明确覆盖，不能偷偷改变共享 Key。

## 4. 颜色匹配的边界

匹配分为两步：组件登记确定语义 Key；设计过程给 Key 确定合适的颜色。禁止仅凭 RGB 相似度将底部导航文字改绑为其他用途 Key。

自动建议可以参考业主的 11 色、版式背景、已采用素材主色、对比度与状态差异。建议先预览，再由业主采用；不能覆盖锁定绑定或已确认配色。素材主色只用于建议，不自动增加第十二个基础色。

关键检查包括：文字与实际背景的对比度、按钮文字可读性、选中/未选中可辨识性、图标在底板上的辨识度、未输入/禁用状态区别，以及首页专用 Key 是否进入内页。

例如默认 text_accent3=#FFFFFF 配 accent_3=#FFAA09 的可读性需要检查。检查结果提示业主调整或确认，不能在锁定后自动改掉规范配色。

## 5. 预览、位图与源文件

平台组件通过 Key 使用颜色；文字、图形、描边、渐变端点和阴影颜色均应登记绑定。图片中的像素不能直接绑定到 Key。AI 候选可接受解析后的主题色作为要求，但精确配色需通过可编辑矢量/文字/底板，或另行验证的确定性改色处理实现。

主题修改时，可编辑图层自动更新；含旧主题颜色的位图显示需检查，不自动重生成。上传 SVG 只有在结构可解析且完成语义绑定后才能参与 Key 联动，不能只按原 fill 值进行全图替换。

Figma 必须保留用户提供的 68 个原始 Key 名称及对应绑定。基础色、固定默认色和独立配色生成 Color Variables；直接引用规则使用变量别名。条件规则通过组件变体或明确的模式解析，不能把“有底/无底”“欧美/经典”混成同一个固定值。

透明度派生规则在 Figma 中按实际支持的变量与 Paint opacity 组合实现，并测试与平台结果一致；不能在导出后同时把 alpha 写进颜色和 opacity 导致透明度叠乘。需要展平的派生变量保留规则元数据，并验证后续同步。

theme.json 记录 11 个基础值、57 个规则/覆盖、版式模式和绑定锁定状态。PNG 为解析后的最终画面；SVG 保留可编辑元素及 Key 标识/样式，并在需要独立打开时携带解析颜色。Figma .fig 副本需实际重开验证变量、别名、组件状态、透明度与字体。

## 6. 技术验证与验收

- 默认主题包含全部 68 个 Key，11 个基础输入，不缺失、不擅自改名。
- 改 primary 时，直接和间接引用正确更新，独立覆盖不被改写；禁止循环引用和不存在的 Key。
- 七个“跟设计”Key 在交付前都有已确认值或引用规则。
- 锁定后的元素保持 Key；基础色修改仍能沿引用正常联动。
- profile_icon_1–4 和 cards_text 在各组件模式下输出正确，复制组件保持绑定。
- border99、20% 派生色和阴影颜色在平台、PNG、SVG、Figma 中一致。
- 导出 Figma 实际修改基础变量后，绑定的文字和图形响应更新；.fig 重开后关系保留。
- 预览对比度及状态问题可定位到元素和 Key；检查不擅自改写业主已确认的颜色。

参考版式：[1210-3 定制 / UI设计图](https://www.figma.com/design/BZ1scUyi6Lwc1RDzxL66mE/?node-id=13-8316)。本次只读核对页面结构，包含首页、登录注册、优惠、代理、我的、次级页及 APP 下载弹窗，以及基础规范和组件资源页。未修改参考文件，也未将其全部图层视为已完成 Key 绑定。
