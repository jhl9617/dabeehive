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
          <p className="eyebrow">Approvals</p>
          <h1>Pending approvals</h1>
          <p className="lead">
            Human review gates waiting on plan, risk, or final diff decisions.
          </p>
        </div>
        <div className="resource-actions">
          <a className="button secondary" href="/">
            Dashboard
          </a>
          <a className="button" href="/api/approvals?status=pending">
            Approval API
          </a>
        </div>
      </header>

      {error ? (
        <section className="resource-state" role="status">
          <span className="status-dot warning" aria-hidden="true" />
          <div>
            <h2>Approval data unavailable</h2>
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      {!error && approvals.length === 0 ? (
        <section className="resource-state" role="status">
          <span className="status-dot neutral" aria-hidden="true" />
          <div>
            <h2>No pending approvals</h2>
            <p>Planner, risk, and final diff approval requests will appear here.</p>
          </div>
        </section>
      ) : null}

      {approvals.length > 0 ? (
        <section className="resource-list" aria-label="Pending approvals">
          {approvals.map((approval) => (
            <section className="resource-card" key={approval.id}>
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
                    <dt>Required Action</dt>
                    <dd>{summarizeText(approval.requiredAction, "Review required")}</dd>
                  </div>
                  <div>
                    <dt>Diff Summary</dt>
                    <dd>{summarizeText(approval.diffSummary, "Not provided")}</dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>{formatDate(approval.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Detail</dt>
                    <dd>
                      <a className="detail-link" href={`/api/approvals/${approval.id}`}>
                        API record
                      </a>
                    </dd>
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
      error: "Check the local database connection and Prisma client generation."
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

  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177)}...`;
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
