# Decisions

구현 중 확정된 기술 결정을 기록한다.

| Date | Decision | Reason | Impact | Related Task |
|---|---|---|---|---|
| 2026-05-04 | PoC에서 Jira/Slack 제외 | 핵심 검증 범위를 VS Code + SDK Runner + MCP로 좁히기 위함 | 외부 webhook 구현 지연 제거 | TRK-001 |
| 2026-05-04 | VS Code Extension은 자체 코드 수정 로직을 구현하지 않음 | Agent SDK built-in tools를 활용해 PoC 구현 리스크 축소 | Extension은 control surface와 event bridge 역할에 집중 | SDK-001 |
