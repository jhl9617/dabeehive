import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getPrismaClient } from "../../../src/lib/db/prisma";

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
  respondedAt: true,
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

export default async function ApprovalDetailPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const { approval, error, notFound } = await loadApproval(id);

  return (
    <main className="resource-shell">
      <header className="resource-header">
        <div>
          <p className="eyebrow">승인</p>
          <h1>승인 상세</h1>
          <p className="lead">
            검토 근거를 확인하고 대기 중인 게이트에 승인 또는 반려 결정을 기록합니다.
          </p>
        </div>
        <div className="resource-actions">
          <a className="button secondary" href="/approvals">
            승인 목록
          </a>
          <a className="button" href={`/api/approvals/${id}`}>
            승인 API
          </a>
        </div>
      </header>

      {query?.responded ? (
        <section className="resource-state" role="status">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <h2>승인이 업데이트되었습니다</h2>
            <p>{`현재 상태: ${formatApprovalStatus(query.responded)}`}</p>
          </div>
        </section>
      ) : null}

      {query?.actionError ? (
        <section className="resource-state" role="status">
          <span className="status-dot warning" aria-hidden="true" />
          <div>
            <h2>승인 작업에 실패했습니다</h2>
            <p>승인 응답을 저장하지 못했습니다.</p>
          </div>
        </section>
      ) : null}

      {error ? (
        <section className="resource-state" role="status">
          <span className="status-dot warning" aria-hidden="true" />
          <div>
            <h2>승인 데이터를 불러올 수 없습니다</h2>
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      {notFound ? (
        <section className="resource-state" role="status">
          <span className="status-dot neutral" aria-hidden="true" />
          <div>
            <h2>승인을 찾을 수 없습니다</h2>
            <p>요청한 식별자에 해당하는 승인이 없습니다.</p>
          </div>
        </section>
      ) : null}

      {approval ? (
        <>
          <section className="resource-card">
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
                  <dt>위험도</dt>
                  <dd>{formatRisk(approval.riskScore)}</dd>
                </div>
                <div>
                  <dt>필요한 조치</dt>
                  <dd>{summarizeText(approval.requiredAction, "검토 필요")}</dd>
                </div>
                <div>
                  <dt>생성일</dt>
                  <dd>{formatDate(approval.createdAt)}</dd>
                </div>
                <div>
                  <dt>응답일</dt>
                  <dd>{formatDate(approval.respondedAt)}</dd>
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

          <section className="detail-grid">
            <section className="detail-panel" aria-labelledby="approval-evidence-title">
              <div className="section-heading">
                <h2 id="approval-evidence-title">근거</h2>
                <span>검토 컨텍스트</span>
              </div>
              <div className="detail-list">
                <div className="detail-item">
                  <div className="detail-item-header">
                    <strong>diff 요약</strong>
                  </div>
                  <p>{summarizeText(approval.diffSummary, "diff 요약이 없습니다.")}</p>
                </div>
                <div className="detail-item">
                  <div className="detail-item-header">
                    <strong>변경 파일</strong>
                    <span>{approval.changedFiles.length}개 파일</span>
                  </div>
                  <pre className="metadata-preview">
                    {approval.changedFiles.length > 0
                      ? approval.changedFiles.join("\n")
                      : "기록된 변경 파일이 없습니다."}
                  </pre>
                </div>
              </div>
            </section>

            <section className="detail-panel" aria-labelledby="approval-action-title">
              <div className="section-heading">
                <h2 id="approval-action-title">결정</h2>
                <span>{formatApprovalStatus(approval.status)}</span>
              </div>
              {approval.status === "pending" ? (
                <form className="action-form" action={respondApproval}>
                  <input type="hidden" name="approvalId" value={approval.id} />
                  <label className="action-field">
                    <span>응답 메모</span>
                    <textarea
                      name="reason"
                      rows={5}
                      maxLength={100000}
                      placeholder="선택 사항: 리뷰어 메모"
                    />
                  </label>
                  <div className="action-row">
                    <button className="button" type="submit" name="action" value="approve">
                      승인
                    </button>
                    <button
                      className="button danger"
                      type="submit"
                      name="action"
                      value="reject"
                    >
                      반려
                    </button>
                  </div>
                </form>
              ) : (
                <p className="detail-empty">이미 응답한 승인입니다.</p>
              )}
            </section>
          </section>
        </>
      ) : null}
    </main>
  );
}

async function respondApproval(formData) {
  "use server";

  const approvalId = normalizeFormValue(formData.get("approvalId"));
  const action = normalizeFormValue(formData.get("action"));
  const reason = normalizeFormValue(formData.get("reason"));

  if (!approvalId || (action !== "approve" && action !== "reject")) {
    redirect(`/approvals/${approvalId || ""}?actionError=invalid`);
  }

  const status = action === "approve" ? "approved" : "rejected";

  try {
    const prisma = await getPrismaClient();
    await prisma.approval.update({
      where: {
        id: approvalId
      },
      data: {
        status,
        respondedById: null,
        respondedAt: new Date(),
        ...(reason
          ? {
              reason
            }
          : {})
      },
      select: {
        id: true
      }
    });
  } catch {
    redirect(`/approvals/${approvalId}?actionError=save`);
  }

  revalidatePath("/approvals");
  revalidatePath(`/approvals/${approvalId}`);
  redirect(`/approvals/${approvalId}?responded=${status}`);
}

async function loadApproval(id) {
  try {
    const prisma = await getPrismaClient();
    const approval = await prisma.approval.findUnique({
      where: {
        id
      },
      select: approvalSelect
    });

    if (!approval) {
      return { approval: null, error: null, notFound: true };
    }

    return { approval, error: null, notFound: false };
  } catch {
    return {
      approval: null,
      error: "로컬 데이터베이스 연결과 Prisma Client 생성 상태를 확인하세요.",
      notFound: false
    };
  }
}

function normalizeFormValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
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

  if (normalized.length <= 220) {
    return normalized;
  }

  return `${normalized.slice(0, 217)}...`;
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
