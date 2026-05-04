# Codex Implementation Rules — AI Agent Orchestrator PoC

이 문서는 Codex에 넣어 구현을 진행할 때 사용할 운영 규칙이다. 실제 저장소에는 루트 `AGENTS.md`와 `/track` 디렉토리를 함께 배치한다.

## 핵심 운영 방식

1. Codex는 구현 전 `AGENTS.md`와 `/track/MASTER.md`를 읽는다.
2. 모든 구현 작업은 Task ID를 가진다.
3. Task ID 없이 코드를 수정하지 않는다.
4. 한 번의 실행에서는 하나의 Task ID만 처리한다.
5. 작업 시작 시 `/track/CURRENT.md`를 갱신한다.
6. 작업 종료 시 `/track/MASTER.md`, `/track/tasks/<TASK-ID>.md`, `/track/CHANGELOG.md`를 갱신한다.
7. 검증 명령과 결과를 반드시 기록한다.
8. PoC 범위 밖 기능은 구현하지 않는다.

## Codex에게 처음 줄 프롬프트 예시

```txt
Read AGENTS.md and track/MASTER.md first.
Follow the tracking rules strictly.
Do not implement Jira or Slack integrations.
Do not build a custom AI code editing engine inside the VS Code extension.
Use the Agent SDK adapter approach described in the rules.

Start with the first P0 task that is not_started.
Before writing code, create/update the matching track/tasks/<TASK-ID>-<slug>.md file and update track/CURRENT.md.
Implement only that task, run the available validation commands, then update all tracking files.
```

## 중간 작업 프롬프트 예시

```txt
Continue the PoC implementation by selecting the next P0 not_started task in track/MASTER.md.
Work on exactly one task.
Update track/CURRENT.md before coding.
After implementation, update MASTER, the task file, CHANGELOG, and evidence logs.
Return the final response using the format required in AGENTS.md.
```

## 특정 작업 지정 프롬프트 예시

```txt
Implement task MCP-005 from track/MASTER.md.
Read AGENTS.md, track/MASTER.md, and the task file first.
If the task file does not exist, create it from track/templates/task-template.md.
Do not touch unrelated tasks.
Run available validation and record the result in the task file.
```
