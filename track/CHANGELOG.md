# Implementation Changelog

구현 완료 이력을 최신순으로 기록한다.

| Date | Task ID | Status | Summary | Validation |
|---|---|---|---|---|
| 2026-05-04 | FND-004 | verified | Added dependency-free basic lint command and formatting policy. | `pnpm lint`; `pnpm run format:check`; package script and editorconfig checks passed. |
| 2026-05-04 | FND-003 | verified | Added shared TypeScript base config and workspace tsconfig files. | Config file existence, JSON parse, and key-field `rg` checks passed. |
| 2026-05-04 | FND-002 | verified | Created pnpm workspace structure for server, VS Code extension, and shared packages. | `pnpm install --lockfile-only --ignore-scripts`; `pnpm -r list --depth -1`; workspace path checks passed. |
| 2026-05-04 | FND-001 | verified | Selected pnpm as the repository package manager and generated the matching lockfile. | `pnpm --version`; `pnpm install --lockfile-only --ignore-scripts`; package/lockfile checks passed. |
| 2026-05-04 | TRK-005 | verified | Clarified Codex session log naming, metadata, action, validation, summary, and follow-up recording expectations. | Session log template `rg` checks passed. |
| 2026-05-04 | TRK-004 | verified | Clarified task file template fields, creation flow, validation, evidence, and approval recording rules. | Template and task README `rg` checks passed. |
| 2026-05-04 | TRK-003 | verified | `docs/prd.md` exists as the PoC PRD anchor and matches `track/context/prd.md`. | `test -f docs/prd.md`; PRD `rg`; `cmp -s`; `shasum -a 256` passed. |
| 2026-05-04 | TRK-002 | verified | Required `/track` baseline files, directories, and templates exist. | `test -f ...`; `test -d ...`; tracking `rg` checks passed. |
| 2026-05-04 | TRK-001 | verified | Root `AGENTS.md` exists and contains the PoC Codex implementation rules. | `test -f AGENTS.md`; `rg "AI Agent Orchestrator PoC\|절대 원칙\|PoC 구현 범위\|Codex 최종 응답 형식" AGENTS.md` passed. |
