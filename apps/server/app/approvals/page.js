import { getPrismaClient } from "../../src/lib/db/prisma";

export const dynamic = "force-dynamic";

const approvalSelect = {
  id: true,
  type: true,
  status: true,
  reason: true,
  changedFiles: true,
  diffSummary: true,
  riskScore: true,
  requiredAction: true,
  createdAt: true,
  updatedAt: true,
  issue: {
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      project: {
        select: {
          name: true
        }
      }
    }
  },
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
  }
};

export default async function ApprovalsPage() {
  const { approvals, error } = await loadPendingApprovals();

  return (
    <main className="resource-shell">
      <header className="resource-header">
        <div>
          <p className="eyebrow">승인</p>
          <h1>대기 중인 승인</h1>
          <p className="lead">
            계획, 위험도, 최종 diff 판단을 기다리는 사람 검토 게이트입니다.
          </p>
        </div>
        <div className="resource-actions">
          <a className="button secondary" href="/">
            대시보드
          </a>
          <a className="button" href="/api/approvals?status=pending">
            승인 API
          </a>
        </div>
      </header>

      {error ? (
        <section className="resource-state" role="status">
          <span className="status-dot warning" aria-hidden="true" />
          <div>
            <h2>승인 데이터를 불러올 수 없습니다</h2>
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      {!error && approvals.length === 0 ? (
        <section className="resource-state" role="status">
          <span className="status-dot neutral" aria-hidden="true" />
          <div>
            <h2>대기 중인 승인이 없습니다</h2>
            <p>계획, 위험도, 최종 diff 승인 요청이 이곳에 표시됩니다.</p>
          </div>
        </section>
      ) : null}

      {approvals.length > 0 ? (
        <section className="resource-list" aria-label="대기 중인 승인">
          {approvals.map((approval) => (
            <section className="resource-card" key={approval.id}>
              <div className="resource-card-main">
                <div className="resource-title-row">
                  <h2>{formatApprovalTitle(approval)}</h2>
                  <span className="badge">{formatApprovalStatus(approval.status)}</span>
                </div>
                <p>{summarizeText(approval.reason, "승인 사유가 없습니다.")}</p>
                <dl className="resource-meta">
                  <div>
                    <dt>유형</dt>
                    <dd>{formatApprovalType(approval.type)}</dd>
                  </div>
                  <div>
                    <dt>컨텍스트</dt>
                    <dd>{formatContext(approval)}</dd>
                  </div>
                  <div>
                    <dt>필요한 조치</dt>
                    <dd>{summarizeText(approval.requiredAction, "검토 필요")}</dd>
                  </div>
                  <div>
                    <dt>diff 요약</dt>
                    <dd>{summarizeText(approval.diffSummary, "제공되지 않음")}</dd>
                  </div>
                  <div>
                    <dt>생성일</dt>
                    <dd>{formatDate(approval.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>상세</dt>
                    <dd>
                      <a className="detail-link" href={`/api/approvals/${approval.id}`}>
                        API 기록
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="resource-counts" aria-label={`${approval.id} 승인 근거`}>
                <div>
                  <strong>{formatRisk(approval.riskScore)}</strong>
                  <span>위험도</span>
                </div>
                <div>
                  <strong>{approval.changedFiles.length}</strong>
                  <span>파일</span>
                </div>
                <div>
                  <strong>{approval.run ? "실행" : "이슈"}</strong>
                  <span>범위</span>
                </div>
              </div>
            </section>
          ))}
        </section>
      ) : null}
    </main>
  );
}

async function loadPendingApprovals() {
  try {
    const prisma = await getPrismaClient();
    const approvals = await prisma.approval.findMany({
      where: {
        status: "pending"
      },
      orderBy: {
        createdAt: "desc"
      },
      select: approvalSelect
    });

    return { approvals, error: null };
  } catch {
    return {
      approvals: [],
      error: "로컬 데이터베이스 연결과 Prisma Client 생성 상태를 확인하세요."
    };
  }
}

function formatApprovalTitle(approval) {
  if (approval.issue?.title) {
    return approval.issue.title;
  }

  if (approval.run?.issue?.title) {
    return approval.run.issue.title;
  }

  return approval.run ? `실행 ${approval.run.id}` : approval.id;
}

function formatContext(approval) {
  if (approval.issue) {
    return `${approval.issue.project?.name || "알 수 없는 프로젝트"} / ${formatIssueStatus(approval.issue.status)} / ${formatPriority(approval.issue.priority)}`;
  }

  if (approval.run) {
    return `${approval.run.project?.name || "알 수 없는 프로젝트"} / ${formatRunStatus(approval.run.status)} / ${formatAgentRole(approval.run.agentRole)}`;
  }

  return "연결되지 않음";
}

function formatApprovalStatus(value) {
  const labels = {
    approved: "승인됨",
    changes_requested: "변경 요청됨",
    pending: "대기 중",
    rejected: "반려됨"
  };

  return labels[value] || value;
}

function formatApprovalType(value) {
  const labels = {
    auth_change: "인증 변경",
    billing_change: "결제 변경",
    final_approval: "최종 승인",
    general: "일반",
    prod_deploy: "운영 배포",
    risk_approval: "위험 승인",
    schema_change: "스키마 변경",
    spec_approval: "계획 승인"
  };

  return labels[value] || value;
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

function formatRisk(value) {
  if (value === null || value === undefined) {
    return "해당 없음";
  }

  return value;
}

function summarizeText(value, fallback) {
  if (!value) {
    return fallback;
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177)}...`;
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
