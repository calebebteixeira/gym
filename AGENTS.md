# Gym

Generates one self-contained HTML page per workout (`dist/<treino>.html`), opened on a phone. `dist/` is generated but committed: GitHub Pages publishes it (`https://calebebteixeira.github.io/gym/dist/<page>.html`), and a file can also be sent over WhatsApp. Never edit `dist/` by hand: run `pnpm gerar` and commit the result. Do not treat `node_modules/` or `dist/` as source.

## Boundaries

- `exercicios/` is the downloaded exercise database, kept verbatim. Do not edit or reformat it; replace it only with a new download.
- A workout is `treinos/<nome>.ts` (`defineTreino`), registered in `treinos/index.ts`. `exercicio` is an `id` from `exercicios/*/…_exercicios.json`; `pnpm gerar` fails on an unknown id.
- Pages are plain HTML with inline CSS and must work without JavaScript. The one script, by the owner's choice, is the set timer (`scripts/cronometro.ts`, inlined by `scripts/html.ts`): a start button on timed sets that beeps at the end. Add no other script. The only remote resources are the MuscleWiki videos (this repository's copy on GitHub Pages, then musclewiki.com).

## MuscleWiki

- `musclewiki/mapa.json` maps every catalog id to the slug of the same exercise on MuscleWiki, or `null`. Only exact matches: same movement, implement and leg/arm position, even when MuscleWiki names it differently (`high_pull` is `swing-to-upright-row`). Never map a variation; the one exception, by the owner's choice, is `flexao_kb` → `push-up` (hands on the floor instead of the kettlebell handles). Confirm a new entry against frames of the video, not only its name: MuscleWiki titles can mislead (`kettlebell-deadlift-single` is a Romanian deadlift). Edit by hand, then run `pnpm musclewiki`.
- `pnpm musclewiki` reads the public pages `musclewiki.com/pt-br/exercise/<slug>` (through curl: Cloudflare rejects Node's fetch) and writes `musclewiki/cache.json`. `pnpm gerar` reads only the cache.
- `pnpm musclewiki:videos` downloads every cached video into `musclewiki/videos/`. By the owner's choice the files are committed and this public repository serves them through GitHub Pages (`https://calebebteixeira.github.io/gym/musclewiki/videos/<file>`, branch `main`, root; `.nojekyll` keeps Pages from building the site). After adding a slug, run it and commit the new files.
- Each `<video>` lists two sources: that copy, then musclewiki.com. MuscleWiki alone is unreliable: its origin refuses video requests from other sites, and they play only while Cloudflare has the file cached (about 7 days).
- Never edit the videos: the MuscleWiki watermark must stay. MuscleWiki may revoke usage rights; removing the copies then means rewriting this repository's history.
- MuscleWiki terms allow sharing videos and instructions for non-profit use, with branding and a link to musclewiki.com. By the owner's choice, pages show no link under each video: only the video's own watermark and a link to musclewiki.com in the page footer. Keep that footer link, and never use MuscleWiki images or body maps.
- The official API (`api.musclewiki.com`) is paid and its video URLs expire after 15 minutes, so it cannot feed static pages.

## Code quality

- `pnpm check` is the gate: no suppression directives, `vp check` (Oxfmt + type-aware Oxlint with `denyWarnings`) and `tsc`. The pre-commit hook runs `vp check`.
- There is no warning tier and no suppression: `oxlint-disable`, `eslint-disable`, `@ts-ignore`, `@ts-nocheck` and `@ts-expect-error` are rejected. Fix the finding.
- Node runs the `.ts` scripts directly (type stripping): use only erasable TypeScript and `.ts` import extensions.
- Page CSS uses custom properties for colors and font sizes, CSS nesting, logical properties and class selectors.
- Dependency versions live in the `pnpm-workspace.yaml` catalog.

## Commands

```bash
pnpm gerar        # dist/<treino>.html (commit it: Pages publishes dist/)
pnpm musclewiki          # refresh musclewiki/cache.json
pnpm musclewiki:videos   # copies in musclewiki/videos/, served by GitHub Pages
pnpm check        # repository gate
pnpm check:fix    # format and lint fixes
```
