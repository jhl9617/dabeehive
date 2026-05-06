import { getPrismaClient } from "../../../src/lib/db/prisma";

export const dynamic = "force-dynamic";

const artifactSelect = {
  id: true,
  type: true,
  title: true,
  content: true,
  uri: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  run: {
    select: {
      id: true,
      status: true,
      agentRole: true,
      project: {
        select: {
          name: true
        }
      },
      issue: {
        select: {
          title: true
        }
      }
    }
  },
  issue: {
    select: {
      id: true,
      title: true,
      status: true,
      project: {
        select: {
          name: true
        }
      }
    }
  }
};

export default async function ArtifactViewerPage({ params }) {
  const { id } = await params;
  const { artifact, error, notFound } = await loadArtifact(id);

  return (
    <main className="resource-shell">
      <header className="resource-header">
        <div>
          <p className="eyebrow">산출물</p>
          <h1>산출물 뷰어</h1>
          <p className="lead">
            저장된 계획, diff, 테스트 보고서, 리뷰, PR URL, 로그 결과를 확인합니다.
          </p>
        </div>
        <div className="resource-actions">
          <a className="button secondary" href={artifact ? `/runs/${artifact.run.id}` : "/"}>
            실행 상세
          </a>
          <a className="button" href={`/api/artifacts?runId=${artifact?.run.id || ""}`}>
            산출물 API
          </a>
        </div>
      </header>

      {error ? (
        <section className="resource-state" role="status">
          <span className="status-dot warning" aria-hidden="true" />
          <div>
            <h2>산출물 데이터를 불러올 수 없습니다</h2>
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      {notFound ? (
        <section className="resource-state" role="status">
          <span className="status-dot neutral" aria-hidden="true" />
          <div>
            <h2>산출물을 찾을 수 없습니다</h2>
            <p>요청한 식별자에 해당하는 산출물이 없습니다.</p>
          </div>
        </section>
      ) : null}

      {artifact ? (
        <>
          <section className="resource-card">
            <div className="resource-card-main">
              <div className="resource-title-row">
                <h2>{artifact.title || formatArtifactType(artifact.type)}</h2>
                <span className="badge">{formatArtifactType(artifact.type)}</span>
              </div>
              <p>{formatContext(artifact)}</p>
              <dl className="resource-meta">
                <div>
                  <dt>실행</dt>
                  <dd>{artifact.run.id}</dd>
                </div>
                <div>
                  <dt>실행 상태</dt>
                  <dd>{formatRunStatus(artifact.run.status)}</dd>
                </div>
                <div>
                  <dt>에이전트</dt>
                  <dd>{formatAgentRole(artifact.run.agentRole)}</dd>
                </div>
                <div>
                  <dt>이슈</dt>
                  <dd>{artifact.issue?.title || artifact.run.issue?.title || "연결된 이슈 없음"}</dd>
                </div>
                <div>
                  <dt>생성일</dt>
                  <dd>{formatDate(artifact.createdAt)}</dd>
                </div>
                <div>
                  <dt>업데이트</dt>
                  <dd>{formatDate(artifact.updatedAt)}</dd>
                </div>
              </dl>
            </div>
            <div className="resource-counts" aria-label={`${artifact.id} 산출물 상태`}>
              <div>
                <strong>{artifact.content ? "텍스트" : "URI"}</strong>
                <span>저장 방식</span>
              </div>
              <div>
                <strong>{artifact.metadata ? "있음" : "없음"}</strong>
                <span>메타데이터</span>
              </div>
              <div>
                <strong>{artifact.uri ? "있음" : "없음"}</strong>
                <span>URI</span>
              </div>
            </div>
          </section>

          <section className="detail-grid">
            <section className="detail-panel" aria-labelledby="artifact-content-title">
              <div className="section-heading">
                <h2 id="artifact-content-title">내용</h2>
                <span>{formatArtifactType(artifact.type)}</span>
              </div>
              {artifact.content ? (
                <pre className="artifact-content">{artifact.content}</pre>
              ) : artifact.uri ? (
                <a className="detail-link" href={artifact.uri}>
                  {artifact.uri}
                </a>
              ) : (
                <p className="detail-empty">산출물 내용이나 URI가 기록되지 않았습니다.</p>
              )}
            </section>

            <section className="detail-panel" aria-labelledby="artifact-metadata-title">
              <div className="section-heading">
                <h2 id="artifact-metadata-title">메타데이터</h2>
                <span>JSON</span>
              </div>
              <pre className="metadata-preview">{formatJson(artifact.metadata)}</pre>
            </section>
          </section>
        </>
      ) : null}
    </main>
  );
}

async function loadArtifact(id) {
  try {
    const prisma = await getPrismaClient();
    const artifact = await prisma.artifact.findUnique({
      where: {
        id
      },
      select: artifactSelect
    });

    if (!artifact) {
      return { artifact: null, error: null, notFound: true };
    }

    return { artifact, error: null, notFound: false };
  } catch {
    return {
      artifact: null,
      error: "로컬 데이터베이스 연결과 Prisma Client 생성 상태를 확인하세요.",
      notFound: false
    };
  }
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

function formatContext(artifact) {
  const projectName = artifact.issue?.project?.name || artifact.run.project?.name || "알 수 없는 프로젝트";
  const issueTitle = artifact.issue?.title || artifact.run.issue?.title;

  if (issueTitle) {
    return `${projectName} / ${issueTitle}`;
  }

  return projectName;
}

function formatJson(value) {
  if (!value) {
    return "기록된 메타데이터가 없습니다.";
  }

  try {
    return JSON.stringify(value, null, 2);
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
