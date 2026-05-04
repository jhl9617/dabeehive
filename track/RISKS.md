# Risks / Blockers

| Date | Risk | Severity | Mitigation | Status | Related Task |
|---|---|---:|---|---|---|
| 2026-05-04 | Agent SDK 실제 API/이벤트 포맷 변경 가능성 | Medium | Adapter interface로 격리하고 fake adapter 테스트 우선 작성 | open | SDK-004 |
| 2026-05-04 | 로컬 workspace에서 agent가 위험 명령을 실행할 수 있음 | High | dangerous command denylist와 approval rule 적용 | open | SEC-005 |
