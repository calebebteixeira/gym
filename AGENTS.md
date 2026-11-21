# Gym

Generates one self-contained HTML page per workout (`dist/<treino>.html`), sent over WhatsApp and opened on a phone. Do not treat `node_modules/` or `dist/` as source.

## Boundaries

- `exercicios/` is the downloaded exercise database, kept verbatim. Do not edit or reformat it; replace it only with a new download.
- A workout is `treinos/<nome>.ts` (`defineTreino`), registered in `treinos/index.ts`. `exercicio` is an `id` from `exercicios/*/…_exercicios.json`; `pnpm gerar` fails on an unknown id.
- Pages are plain HTML with inline CSS and no JavaScript. The only remote resources are MuscleWiki videos.

## MuscleWiki

- `musclewiki/mapa.json` maps every catalog id to the slug of the same exercise on MuscleWiki, or `null`. Only exact matches: same movement, implement and leg/arm position, even when MuscleWiki names it differently (`high_pull` is `swing-to-upright-row`). Never map a variation. Confirm a new entry against frames of the video, not only its name: MuscleWiki titles can mislead (`kettlebell-deadlift-single` is a Romanian deadlift). Edit by hand, then run `pnpm musclewiki`.
- `pnpm musclewiki` reads the public pages `musclewiki.com/pt-br/exercise/<slug>` (through curl: Cloudflare rejects Node's fetch) and writes `musclewiki/cache.json`. `pnpm gerar` reads only the cache.
- MuscleWiki terms allow sharing videos and instructions for non-profit use, with branding and a link to musclewiki.com. Keep the link on every video; never download, embed or re-host videos, and never use MuscleWiki images or body maps.
- The official API (`api.musclewiki.com`) is paid and its video URLs expire after 15 minutes, so it cannot feed static pages.

## Code quality

- `pnpm check` is the gate: no suppression directives, `vp check` (Oxfmt + type-aware Oxlint with `denyWarnings`) and `tsc`. The pre-commit hook runs `vp check`.
- There is no warning tier and no suppression: `oxlint-disable`, `eslint-disable`, `@ts-ignore`, `@ts-nocheck` and `@ts-expect-error` are rejected. Fix the finding.
- Node runs the `.ts` scripts directly (type stripping): use only erasable TypeScript and `.ts` import extensions.
- Page CSS uses custom properties for colors and font sizes, CSS nesting, logical properties and class selectors.
- Dependency versions live in the `pnpm-workspace.yaml` catalog.

## Commands

```bash
pnpm gerar        # dist/<treino>.html
pnpm musclewiki   # refresh musclewiki/cache.json
pnpm check        # repository gate
pnpm check:fix    # format and lint fixes
```
