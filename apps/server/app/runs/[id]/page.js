import { getPrismaClient } from "../../../src/lib/db/prisma";

export const dynamic = "force-dynamic";

const runSelect = {
  id: true,
  status: true,
  agentRole: true,
  modelProvider: true,
  modelId: true,
  outputSummary: true,
  errorMessage: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
      status: true
    }
  },
  issue: {
    select: {
      id: true,
      title: true,
      status: true,
      priority: true
    }
  },
  events: {
    orderBy: {
      createdAt: "desc"
    },
    take: 12,
    select: {
      id: true,
      type: true,
      message: true,
      metadata: true,
      createdAt: true
    }
  },
  artifacts: {
    orderBy: {
      createdAt: "desc"
    },
    take: 12,
    select: {
      id: true,
      type: true,
      title: true,
      content: true,
      uri: true,
      createdAt: true
    }
  },
  _count: {
    select: {
      events: true,
      artifacts: true,
      approvals: true
    }
  }
};

export default async function RunDetailPage({ params }) {
  const { id } = await params;
  const { run, error, notFound } = await loadRun(id);

  return (
    <main className="resource-shell">
      <header className="resource-header">
        <div>
          <p className="eyebrow">실행</p>
          <h1>실행 상세</h1>
          <p className="lead">
            어댑터 기반 에이전트 실행 하나의 상태, 이벤트, 산출물 근거입니다.
          </p>
        </div>
        <div className="resource-actions">
          <a className="button secondary" href="/">
            대시보드
          </a>
          <a className="button" href={`/api/runs/${id}`}>
            실행 API
          </a>
        </div>
      </header>

      {error ? (
        <section className="resource-state" role="status">
          <span className="status-dot warning" aria-hidden="true" />
          <div>
            <h2>실행 데이터를 불러올 수 없습니다</h2>
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      {notFound ? (
        <section className="resource-state" role="status">
          <span className="status-dot neutral" aria-hidden="true" />
          <div>
            <h2>실행을 찾을 수 없습니다</h2>
            <p>요청한 식별자에 해당하는 실행이 없습니다.</p>
          </div>
        </section>
      ) : null}

      {run ? (
        <>
          <section className="resource-card">
            <div className="resource-card-main">
              <div className="resource-title-row">
                <h2>{run.issue?.title || run.id}</h2>
                <span className="badge">{formatRunStatus(run.status)}</span>
              </div>
              <p>{run.outputSummary || run.errorMessage || "아직 실행 결과 요약이 없습니다."}</p>
              <dl className="resource-meta">
                <div>
                  <dt>프로젝트</dt>
                  <dd>{run.project?.name || "알 수 없는 프로젝트"}</dd>
                </div>
                <div>
                  <dt>이슈</dt>
                  <dd>{formatIssue(run.issue)}</dd>
                </div>
                <div>
                  <dt>에이전트</dt>
                  <dd>{formatAgentRole(run.agentRole)}</dd>
                </div>
                <div>
                  <dt>모델</dt>
                  <dd>{formatModel(run)}</dd>
                </div>
                <div>
                  <dt>시작</dt>
                  <dd>{formatDate(run.startedAt)}</dd>
                </div>
                <div>
                  <dt>완료</dt>
                  <dd>{formatDate(run.completedAt)}</dd>
                </div>
              </dl>
            </div>
            <div className="resource-counts" aria-label={`${run.id} 관련 기록`}>
              <div>
                <strong>{run._count.events}</strong>
                <span>이벤트</span>
              </div>
              <div>
                <strong>{run._count.artifacts}</strong>
                <span>산출물</span>
              </div>
              <div>
                <strong>{run._count.approvals}</strong>
                <span>승인</span>
              </div>
            </div>
          </section>

          <section className="detail-grid">
            <section className="detail-panel" aria-labelledby="run-events-title">
              <div className="section-heading">
                <h2 id="run-events-title">최근 이벤트</h2>
                <span>{run.events.length}개 표시</span>
              </div>
              {run.events.length > 0 ? (
                <div className="detail-list">
                  {run.events.map((event) => (
                    <div className="detail-item" key={event.id}>
                      <div className="detail-item-header">
                        <strong>{formatEventType(event.type)}</strong>
                        <span>{formatDate(event.createdAt)}</span>
                      </div>
                      <p>{event.message || "이벤트 메시지가 없습니다."}</p>
                      {event.metadata ? (
                        <pre className="metadata-preview">{formatJson(event.metadata)}</pre>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="detail-empty">이 실행에 기록된 이벤트가 없습니다.</p>
              )}
            </section>

            <section className="detail-panel" aria-labelledby="run-artifacts-title">
              <div className="section-heading">
                <h2 id="run-artifacts-title">산출물</h2>
                <span>{run.artifacts.length}개 표시</span>
              </div>
              {run.artifacts.length > 0 ? (
                <div className="detail-list">
                  {run.artifacts.map((artifact) => (
                    <div className="detail-item" key={artifact.id}>
                      <div className="detail-item-header">
                        <strong>
                          <a className="detail-link" href={`/artifacts/${artifact.id}`}>
                            {artifact.title || formatArtifactType(artifact.type)}
                          </a>
                        </strong>
                        <span>{formatDate(artifact.createdAt)}</span>
                      </div>
                      <p>{formatArtifactType(artifact.type)}</p>
                      {artifact.uri ? (
                        <a className="detail-link" href={artifact.uri}>
                          {artifact.uri}
                        </a>
                      ) : (
                        <pre className="metadata-preview">
                          {summarizeText(artifact.content, "인라인 산출물 내용이 없습니다.")}
                        </pre>
                      )}
                      <a className="detail-link" href={`/artifacts/${artifact.id}`}>
                        산출물 뷰어 열기
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="detail-empty">이 실행에 기록된 산출물이 없습니다.</p>
              )}
            </section>
          </section>
        </>
      ) : null}
    </main>
  );
}

async function loadRun(id) {
  try {
    const prisma = await getPrismaClient();
    const run = await prisma.agentRun.findUnique({
      where: {
        id
      },
      select: runSelect
    });

    if (!run) {
      return { run: null, error: null, notFound: true };
    }

    return { run, error: null, notFound: false };
  } catch {
    return {
      run: null,
      error: "로컬 데이터베이스 연결과 Prisma Client 생성 상태를 확인하세요.",
      notFound: false
    };
  }
}

function formatRunStatus(value) {
  const labels = {
    cancelled: "취소됨",
    coding: "코딩 중",
    failed: "실패",
    planning: "계획 중",
    queued: "대기 중",
    reviewing: "리뷰 중",
    running: "실행 중",
    succeeded: "성공",
    waiting: "대기 중",
    waiting_approval: "승인 대기"
  };

  return labels[value] || value;
}

function formatAgentRole(value) {
  const labels = {
    architect: "아키텍트",
    backend: "백엔드",
    coder: "코더",
    frontend: "프론트엔드",
    planner: "플래너",
    qa: "QA",
    release: "릴리스"
  };

  return labels[value] || value;
}

function formatEventType(value) {
  const labels = {
    command: "명령",
    done: "완료",
    error: "오류",
    file_change: "파일 변경",
    message: "메시지",
    test_result: "테스트 결과",
    tool_call: "도구 호출",
    tool_result: "도구 결과"
  };

  return labels[value] || value;
}

function formatArtifactType(value) {
  const labels = {
    diff: "diff",
    log: "로그",
    plan: "계획",
    pr_url: "PR URL",
    review: "리뷰",
    test_report: "테스트 보고서"
  };

  return labels[value] || value;
}

function formatIssue(issue) {
  if (!issue) {
    return "연결된 이슈 없음";
  }

  return `${issue.title} (${formatIssueStatus(issue.status)}, ${formatPriority(issue.priority)})`;
}

function formatIssueStatus(value) {
  const labels = {
    backlog: "백로그",
    done: "완료",
    in_progress: "진행 중",
    in_review: "리뷰 중",
    qa: "QA",
    ready: "준비됨"
  };

  return labels[value] || value;
}

function formatPriority(value) {
  const labels = {
    critical: "긴급",
    high: "높음",
    low: "낮음",
    medium: "보통"
  };

  return labels[value] || value;
}

function formatModel(run) {
  if (run.modelProvider && run.modelId) {
    return `${run.modelProvider}/${run.modelId}`;
  }

  return run.modelProvider || run.modelId || "지정되지 않음";
}

function summarizeText(value, fallback) {
  if (!value) {
    return fallback;
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= 320) {
    return normalized;
  }

  return `${normalized.slice(0, 317)}...`;
}

function formatJson(value) {
  try {
    return summarizeText(JSON.stringify(value, null, 2), "메타데이터가 없습니다.");
  } catch {
    return "메타데이터를 표시할 수 없습니다.";
  }
}

function formatDate(value) {
  if (!value) {
    return "기록 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
