import { getPrismaClient } from "../../src/lib/db/prisma";

export const dynamic = "force-dynamic";

const issueSelect = {
  id: true,
  title: true,
  body: true,
  type: true,
  status: true,
  priority: true,
  assigneeRole: true,
  labels: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
      status: true
    }
  },
  _count: {
    select: {
      runs: true,
      approvals: true,
      artifacts: true
    }
  }
};

export default async function IssuesPage() {
  const { issues, error } = await loadIssues();

  return (
    <main className="resource-shell">
      <header className="resource-header">
        <div>
          <p className="eyebrow">이슈</p>
          <h1>이슈 목록</h1>
          <p className="lead">
            어댑터 기반 에이전트 실행에 배정하고 승인 흐름으로 추적할 수 있는
            계획 작업 항목입니다.
          </p>
        </div>
        <div className="resource-actions">
          <a className="button secondary" href="/">
            대시보드
          </a>
          <a className="button" href="/api/issues">
            이슈 생성
          </a>
        </div>
      </header>

      {error ? (
        <section className="resource-state" role="status">
          <span className="status-dot warning" aria-hidden="true" />
          <div>
            <h2>이슈 데이터를 불러올 수 없습니다</h2>
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      {!error && issues.length === 0 ? (
        <section className="resource-state" role="status">
          <span className="status-dot neutral" aria-hidden="true" />
          <div>
            <h2>아직 이슈가 없습니다</h2>
            <p>이슈 API 또는 VS Code 제어 화면에서 이슈를 생성하세요.</p>
          </div>
        </section>
      ) : null}

      {issues.length > 0 ? (
        <section className="resource-list" aria-label="이슈">
          {issues.map((issue) => (
            <section className="resource-card" key={issue.id}>
              <div className="resource-card-main">
                <div className="resource-title-row">
                  <h2>{issue.title}</h2>
                  <span className="badge">{formatIssueStatus(issue.status)}</span>
                </div>
                <p>{summarizeBody(issue.body)}</p>
                <dl className="resource-meta">
                  <div>
                    <dt>프로젝트</dt>
                    <dd>{issue.project?.name || "알 수 없는 프로젝트"}</dd>
                  </div>
                  <div>
                    <dt>유형 / 우선순위</dt>
                    <dd>{`${formatIssueType(issue.type)} / ${formatPriority(issue.priority)}`}</dd>
                  </div>
                  <div>
                    <dt>담당 역할</dt>
                    <dd>{formatAssignee(issue.assigneeRole)}</dd>
                  </div>
                  <div>
                    <dt>라벨</dt>
                    <dd>{formatLabels(issue.labels)}</dd>
                  </div>
                  <div>
                    <dt>프로젝트 상태</dt>
                    <dd>{formatProjectStatus(issue.project?.status) || "알 수 없음"}</dd>
                  </div>
                  <div>
                    <dt>업데이트</dt>
                    <dd>{formatDate(issue.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
              <div className="resource-counts" aria-label={`${issue.title} 관련 기록`}>
                <div>
                  <strong>{issue._count.runs}</strong>
                  <span>실행</span>
                </div>
                <div>
                  <strong>{issue._count.approvals}</strong>
                  <span>승인</span>
                </div>
                <div>
                  <strong>{issue._count.artifacts}</strong>
                  <span>산출물</span>
                </div>
              </div>
            </section>
          ))}
        </section>
      ) : null}
    </main>
  );
}

async function loadIssues() {
  try {
    const prisma = await getPrismaClient();
    const issues = await prisma.issue.findMany({
      orderBy: {
        updatedAt: "desc"
      },
      select: issueSelect
    });

    return { issues, error: null };
  } catch {
    return {
      issues: [],
      error: "로컬 데이터베이스 연결과 Prisma Client 생성 상태를 확인하세요."
    };
  }
}

function formatAssignee(value) {
  const labels = {
    architect: "아키텍트",
    backend: "백엔드",
    coder: "코더",
    frontend: "프론트엔드",
    planner: "플래너",
    qa: "QA",
    release: "릴리스"
  };

  return labels[value] || value || "미배정";
}

function formatProjectStatus(value) {
  const labels = {
    active: "활성",
    archived: "보관됨",
    at_risk: "위험",
    draft: "초안",
    released: "릴리스됨"
  };

  return labels[value] || value;
}

function formatIssueStatus(value) {
  const labels = {
    active: "활성",
    backlog: "백로그",
    done: "완료",
    in_progress: "진행 중",
    in_review: "리뷰 중",
    qa: "QA",
    ready: "준비됨"
  };

  return labels[value] || value;
}

function formatIssueType(value) {
  const labels = {
    bug: "버그",
    epic: "에픽",
    story: "스토리",
    task: "작업"
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

function summarizeBody(value) {
  if (!value) {
    return "이슈 본문이 없습니다.";
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= 240) {
    return normalized;
  }

  return `${normalized.slice(0, 237)}...`;
}

function formatLabels(labels) {
  if (!labels || labels.length === 0) {
    return "없음";
  }

  return labels.join(", ");
}

function formatDate(value) {
  if (!value) {
    return "업데이트 기록 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
