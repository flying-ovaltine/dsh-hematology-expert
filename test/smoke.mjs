/**
 * 自检：`node --test test/smoke.mjs`（纯 JS，无需构建、不需要装 dsh）。
 *
 * 验证四件事：
 *   1. lib/index.js 能把 SKILL.md 注册成技能（frontmatter 解析、正文完整、resourceBase 正确）；
 *   2. 六份判读底本随包存在；
 *   3. 宿主没有 skills 服务时只告警、不抛错；
 *   4. 入口没有 @deepseek-ai/* 的运行时 import（这个 profile 解析不到）。
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const plugin = await import('../lib/index.js')

function fakeContext({ withSkills = true } = {}) {
  const skills = []
  const warnings = []
  const ctx = {
    get() { return undefined },
    logger: { warn(message) { warnings.push(message) } },
    on() {},
  }
  if (withSkills) ctx.skills = { register(skill) { skills.push(skill); return () => {} } }
  return { ctx, skills, warnings }
}

test('注册技能 hematology-expert', () => {
  const { ctx, skills, warnings } = fakeContext()
  plugin.apply(ctx)
  assert.equal(skills.length, 1, `实际注册 ${skills.length} 个：${warnings.join(' | ')}`)
  const skill = skills[0]
  assert.equal(skill.name, 'hematology-expert')
  assert.ok(skill.description.length > 60, 'description 太短')
  assert.ok(skill.content.startsWith('【血液病学专家'), '正文起始不对：' + skill.content.slice(0, 30))
  assert.ok(skill.content.length > 4000, '正文过短')
  assert.equal(skill.resourceBase.kind, 'directory')
  assert.ok(skill.resourceBase.path.endsWith(join('resources', 'skills', 'hematology-expert')))
  assert.equal(skill.source, 'runtime')
})

test('正文章节齐全：四层证据链、双体系、急症红线、边界', () => {
  const { ctx, skills } = fakeContext()
  plugin.apply(ctx)
  const body = skills[0].content
  for (const needle of ['形态', '表型', '遗传', '临床', 'WHO', 'ICC', '反证', 'APL', 'TTP']) {
    assert.ok(body.includes(needle), `缺少关键内容：${needle}`)
  }
})

test('六份判读底本随包存在', () => {
  const dir = join(root, 'resources', 'skills', 'hematology-expert', 'references')
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'))
  assert.equal(files.length, 6, `references 应为 6 份，实际 ${files.length}`)
  for (const f of files) {
    const text = readFileSync(join(dir, f), 'utf8')
    assert.ok(text.length > 2000, `${f} 过短（${text.length}）`)
  }
})

test('没有 skills 服务时只告警，不抛错', () => {
  const { ctx, warnings } = fakeContext({ withSkills: false })
  assert.doesNotThrow(() => plugin.apply(ctx))
  assert.equal(warnings.length, 1)
})

test('入口不带 @deepseek-ai/* 运行时 import', () => {
  const code = readFileSync(join(root, 'lib', 'index.js'), 'utf8')
  const imports = code.split('\n').filter((line) => line.trim().startsWith('import '))
  for (const line of imports) {
    assert.ok(!line.includes('@deepseek-ai'), '发现运行时 import：' + line.trim())
  }
})
