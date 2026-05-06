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
          <p className="eyebrow">Approvals</p>
          <h1>Approval detail</h1>
          <p className="lead">
            Review evidence and record an approve or reject decision for a pending gate.
          </p>
        </div>
        <div className="resource-actions">
          <a className="button secondary" href="/approvals">
            Approval List
          </a>
          <a className="button" href={`/api/approvals/${id}`}>
            Approval API
          </a>
        </div>
      </header>

      {query?.responded ? (
        <section className="resource-state" role="status">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <h2>Approval updated</h2>
            <p>{`Status is now ${query.responded}.`}</p>
          </div>
        </section>
      ) : null}

      {query?.actionError ? (
        <section className="resource-state" role="status">
          <span className="status-dot warning" aria-hidden="true" />
          <div>
            <h2>Approval action failed</h2>
            <p>The approval response could not be saved.</p>
          </div>
        </section>
      ) : null}

      {error ? (
        <section className="resource-state" role="status">
          <span className="status-dot warning" aria-hidden="true" />
          <div>
            <h2>Approval data unavailable</h2>
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      {notFound ? (
        <section className="resource-state" role="status">
          <span className="status-dot neutral" aria-hidden="true" />
          <div>
            <h2>Approval not found</h2>
            <p>No approval exists for the requested identifier.</p>
          </div>
        </section>
      ) : null}

      {approval ? (
        <>
          <section className="resource-card">
            <div className="resource-card-main">
              <div className="resource-title-row">
                <h2>{formatApprovalTitle(approval)}</h2>
                <span className="badge">{approval.status}</span>
              </div>
              <p>{summarizeText(approval.reason, "No approval reason provided.")}</p>
              <dl className="resource-meta">
                <div>
                  <dt>Type</dt>
                  <dd>{approval.type}</dd>
                </div>
                <div>
                  <dt>Context</dt>
                  <dd>{formatContext(approval)}</dd>
                </div>
                <div>
                  <dt>Risk</dt>
                  <dd>{formatRisk(approval.riskScore)}</dd>
                </div>
                <div>
                  <dt>Required Action</dt>
                  <dd>{summarizeText(approval.requiredAction, "Review required")}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{formatDate(approval.createdAt)}</dd>
                </div>
                <div>
                  <dt>Responded</dt>
                  <dd>{formatDate(approval.respondedAt)}</dd>
                </div>
              </dl>
            </div>
            <div className="resource-counts" aria-label={`${approval.id} approval evidence`}>
              <div>
                <strong>{formatRisk(approval.riskScore)}</strong>
                <span>Risk</span>
              </div>
              <div>
                <strong>{approval.changedFiles.length}</strong>
                <span>Files</span>
              </div>
              <div>
                <strong>{approval.run ? "Run" : "Issue"}</strong>
                <span>Scope</span>
              </div>
            </div>
          </section>

          <section className="detail-grid">
            <section className="detail-panel" aria-labelledby="approval-evidence-title">
              <div className="section-heading">
                <h2 id="approval-evidence-title">Evidence</h2>
                <span>Review context</span>
              </div>
              <div className="detail-list">
                <div className="detail-item">
                  <div className="detail-item-header">
                    <strong>Diff summary</strong>
                  </div>
                  <p>{summarizeText(approval.diffSummary, "No diff summary provided.")}</p>
                </div>
                <div className="detail-item">
                  <div className="detail-item-header">
                    <strong>Changed files</strong>
                    <span>{approval.changedFiles.length} files</span>
                  </div>
                  <pre className="metadata-preview">
                    {approval.changedFiles.length > 0
                      ? approval.changedFiles.join("\n")
                      : "No changed files recorded."}
                  </pre>
                </div>
              </div>
            </section>

            <section className="detail-panel" aria-labelledby="approval-action-title">
              <div className="section-heading">
                <h2 id="approval-action-title">Decision</h2>
                <span>{approval.status}</span>
              </div>
              {approval.status === "pending" ? (
                <form className="action-form" action={respondApproval}>
                  <input type="hidden" name="approvalId" value={approval.id} />
                  <label className="action-field">
                    <span>Response note</span>
                    <textarea
                      name="reason"
                      rows={5}
                      maxLength={100000}
                      placeholder="Optional reviewer note"
                    />
                  </label>
                  <div className="action-row">
                    <button className="button" type="submit" name="action" value="approve">
                      Approve
                    </button>
                    <button
                      className="button danger"
                      type="submit"
                      name="action"
                      value="reject"
                    >
                      Reject
                    </button>
                  </div>
                </form>
              ) : (
                <p className="detail-empty">This approval has already been responded to.</p>
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
      error: "Check the local database connection and Prisma client generation.",
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

  return approval.run ? `Run ${approval.run.id}` : approval.id;
}

function formatContext(approval) {
  if (approval.issue) {
    return `${approval.issue.project?.name || "Unknown project"} / ${approval.issue.status} / ${approval.issue.priority}`;
  }

  if (approval.run) {
    return `${approval.run.project?.name || "Unknown project"} / ${approval.run.status} / ${approval.run.agentRole}`;
  }

  return "Unlinked";
}

function formatRisk(value) {
  if (value === null || value === undefined) {
    return "n/a";
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
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
