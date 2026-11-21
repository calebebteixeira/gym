// Repository gate: no suppression directives, then `vp check` (format + type-aware Oxlint), then
// the TypeScript type check.
//
//   pnpm check
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = join(import.meta.dirname, '..')

function run(label: string, command: string, args: string[]): void {
  console.log(`\n▶ ${label}`)
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' })
  if (result.status !== 0) {
    console.error(`✖ ${label} failed`)
    process.exit(result.status ?? 1)
  }
}

// A lint finding or a type error is fixed, never silenced.
const directive =
  /(?<!["'`])(?:\/\/|\/\*)\s*(?:(?:oxlint|eslint)-disable[\w-]*|@ts-ignore|@ts-nocheck|@ts-expect-error)\b/u

function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return sources(path)
    return /\.[cm]?[jt]s$/u.test(entry.name) ? [path] : []
  })
}

console.log('▶ suppression directives')
const findings = [...sources(join(root, 'scripts')), ...sources(join(root, 'treinos'))].flatMap(
  (path) =>
    readFileSync(path, 'utf8')
      .split('\n')
      .flatMap((line, index) =>
        directive.test(line) ? [`${relative(root, path)}:${index + 1} ${line.trim()}`] : [],
      ),
)
if (findings.length) {
  console.error('Suppression directives are not allowed; fix the finding instead:')
  for (const finding of findings) console.error(`  ${finding}`)
  process.exit(1)
}
console.log('pass: no suppression directives')

run('vp check (format + type-aware Oxlint)', 'vp', ['check'])
run('typecheck', 'pnpm', ['exec', 'tsc', '-p', '.'])

console.log('\n✔ All checks passed')
