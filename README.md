# dsh-hematology-expert · 血液病学专家

DeepSeek Harness（dsh）插件，把「血液内科主任医师」专家包搬成 dsh 技能。**桌面端与 DSH-GO 手机端通用**——两者跑同一个 dsh 引擎，技能注册机制一致。

## 装了之后有什么

技能 `hematology-expert`：遇到血液病报告判读、淋巴瘤/白血病/骨髓瘤/MDS 分型、危险分层与方案、出凝血急症、血液科进展时被调用。规则包括：

- 四层证据链：形态 → 表型 → 遗传分子 → 临床，缺层就明说，不互相补
- WHO 第5版 / ICC 2022 双体系并行，分歧处说清按哪套算
- 鉴别诊断必排序、每个带反证栏；数值写死；引用带指南全名+年份
- 急症红线（疑 APL 先上 ATRA、疑 TTP 先血浆置换等）先处理不等确诊
- 2026 CSCO 淋巴瘤指南 DLBCL 更新要点
- 六份判读底本随包（血常规/涂片、骨髓、流式、组化与分子、诊断阈值、指南索引）

边界：给临床医生当顾问，不替读片医生数细胞，不做最终诊断、不开处方。

## 安装

### 一行装（预构建包，推荐）

```sh
dsh plugin --profile web add "https://github.com/flying-ovaltine/dsh-hematology-expert/releases/latest/download/dsh-hematology-expert.tgz"
```

装了插件市场（dshmarket）的话，也可以在 **插件 → 插件市场 → 发现** 里搜「血液」。

### 桌面端（dsh Desktop / CLI），本地目录

在 dsh 终端运行（路径按本机实际改）：

```
dsh plugin add link:C:\Users\15988802270\Documents\deepseek-harness\default-workspace\hematology-expert
```

`github:` 方式安装后需手动在 `cordis.patch.yml` 补挂载行；本地 `link:` 方式会自动带上本包自带的 patch。装完开**新会话**生效。

### DSH-GO 手机端

两种路子任选：

1. **遥控电脑上的 dsh**（省事）：手机 DSH-GO 走 SSH / DSH Remote 连到装了本插件的电脑，直接用电脑那套技能，无需在手机重复安装。
2. **手机本机引擎**：把整个 `hematology-expert-plugin` 目录放进手机工作区，在 dsh-go 里用 `link:` 指向该目录安装。技能注册用的是 node 内置模块，无外部依赖，手机端可直接跑。

## 验证

新会话里问一句：

> 帮我读这份血常规和骨髓报告，判断像 MDS 还是再障

或看技能目录里是否出现 `hematology-expert`。

本地自检（不需要装 dsh）：

```
node --test test/smoke.mjs
```

## 结构

```
hematology-expert-plugin/
  lib/index.js                    Host 入口：apply(ctx) 注册技能
  src/index.ts                    TS 源码（类型声明见 src/dsh.d.ts）
  cordis.patch.yml                挂载配置
  resources/skills/hematology-expert/
    SKILL.md                      知识载荷（人格 + 判读 + 决策规则）
    references/                   六份判读底本
  test/smoke.mjs                  自检
```

## 版本

1.0.0 — 2026-11-24。知识基线：2026 CSCO 淋巴瘤指南、WHO5 / ICC 2022。
