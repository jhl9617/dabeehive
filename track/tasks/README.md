# Task Files

각 작업은 구현 시작 전에 이 디렉토리에 상세 파일을 가져야 한다.

## File Name

```txt
<TASK-ID>-<short-slug>.md
```

예시:

```txt
SRV-001-next-app-router-init.md
MCP-005-run-start-status-tools.md
EXT-003-secret-storage-token.md
```

## Creation Flow

1. `track/MASTER.md`에서 다음 Task ID와 수용 기준을 확인한다.
2. `track/CURRENT.md`에 active task가 없는지 확인한다.
3. `track/templates/task-template.md`를 복사해 `track/tasks/<TASK-ID>-<short-slug>.md`를 만든다.
4. task 파일의 placeholder를 채우고 scope, expected files, validation commands를 명시한다.
5. `track/MASTER.md`의 해당 Task ID를 `in_progress`로 변경한다.
6. `track/CURRENT.md`에 현재 작업 정보를 기록한다.
7. 구현 또는 검증을 진행한다.
8. 완료 후 validation, evidence, changed files, follow-up tasks를 task 파일에 기록한다.
9. `track/MASTER.md` 상태를 `verified`, `implemented`, or `blocked` 중 하나로 변경한다.
10. `track/CURRENT.md`를 `No active task.`로 되돌린다.

## Required Sections

- Status: allowed status value, priority, area, timestamps.
- Objective: one-paragraph task goal.
- Acceptance Criteria: concrete checklist.
- Scope: in-scope and out-of-scope boundaries.
- Expected Files: files expected to change or be validated.
- Risk / Approval: approval requirement and reason.
- Validation: commands, results, and notes.
- Evidence: paths under `track/evidence/<TASK-ID>/`.

## Rules

- One task file covers one Task ID.
- Keep the task independently verifiable.
- Do not include generated output, dependency caches, or unrelated refactors.
- Record failed validation if it matters to the task result.
