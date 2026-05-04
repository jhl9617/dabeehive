# Risks / Blockers

| Date | Risk | Severity | Mitigation | Status | Related Task |
|---|---|---:|---|---|---|
| 2026-05-04 | Issue status/priority fields influence future workflow and API filtering behavior. | Medium | Keep values string-based for PoC flexibility and validate schema before migration tasks. | open | DB-004 |
| 2026-05-04 | Project repo/workspace fields influence later Git and SDK runner assumptions. | Medium | Keep fields explicit and minimal, validate schema, and defer Git behavior to GIT tasks. | open | DB-003 |
| 2026-05-04 | User/ApiToken schema choices affect future auth and MCP token validation. | Medium | Store token hashes only, keep auth behavior out of DB-002, and validate schema before migration tasks. | open | DB-002 |
| 2026-05-04 | Initial Prisma schema may drift from later model tasks if expanded too early. | Medium | Keep DB-001 schema to generator/datasource only; add models in DB-002 through DB-009. | open | DB-001 |
| 2026-05-04 | Agent SDK 실제 API/이벤트 포맷 변경 가능성 | Medium | Adapter interface로 격리하고 fake adapter 테스트 우선 작성 | open | SDK-004 |
| 2026-05-04 | 로컬 workspace에서 agent가 위험 명령을 실행할 수 있음 | High | dangerous command denylist와 approval rule 적용 | open | SEC-005 |
