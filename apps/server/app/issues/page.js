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
          <p className="eyebrow">Issues</p>
          <h1>Issue list</h1>
          <p className="lead">
            Planning work items that can be assigned to adapter-driven agent runs
            and tracked through approvals.
          </p>
        </div>
        <div className="resource-actions">
          <a className="button secondary" href="/">
            Dashboard
          </a>
          <a className="button" href="/api/issues">
            Create Issue
          </a>
        </div>
      </header>

      {error ? (
        <section className="resource-state" role="status">
          <span className="status-dot warning" aria-hidden="true" />
          <div>
            <h2>Issue data unavailable</h2>
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      {!error && issues.length === 0 ? (
        <section className="resource-state" role="status">
          <span className="status-dot neutral" aria-hidden="true" />
          <div>
            <h2>No issues yet</h2>
            <p>Create an issue through the Issue API or VS Code control surface.</p>
          </div>
        </section>
      ) : null}

      {issues.length > 0 ? (
        <section className="resource-list" aria-label="Issues">
          {issues.map((issue) => (
            <section className="resource-card" key={issue.id}>
              <div className="resource-card-main">
                <div className="resource-title-row">
                  <h2>{issue.title}</h2>
                  <span className="badge">{issue.status}</span>
                </div>
                <p>{summarizeBody(issue.body)}</p>
                <dl className="resource-meta">
                  <div>
                    <dt>Project</dt>
                    <dd>{issue.project?.name || "Unknown project"}</dd>
                  </div>
                  <div>
                    <dt>Type / Priority</dt>
                    <dd>{`${issue.type} / ${issue.priority}`}</dd>
                  </div>
                  <div>
                    <dt>Assignee</dt>
                    <dd>{formatAssignee(issue.assigneeRole)}</dd>
                  </div>
                  <div>
                    <dt>Labels</dt>
                    <dd>{formatLabels(issue.labels)}</dd>
                  </div>
                  <div>
                    <dt>Project Status</dt>
                    <dd>{issue.project?.status || "Unknown"}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{formatDate(issue.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
              <div className="resource-counts" aria-label={`${issue.title} related records`}>
                <div>
                  <strong>{issue._count.runs}</strong>
                  <span>Runs</span>
                </div>
                <div>
                  <strong>{issue._count.approvals}</strong>
                  <span>Gates</span>
                </div>
                <div>
                  <strong>{issue._count.artifacts}</strong>
                  <span>Artifacts</span>
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
      error: "Check the local database connection and Prisma client generation."
    };
  }
}

function formatAssignee(value) {
  return value || "Unassigned";
}

function summarizeBody(value) {
  if (!value) {
    return "No issue body provided.";
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= 240) {
    return normalized;
  }

  return `${normalized.slice(0, 237)}...`;
}

function formatLabels(labels) {
  if (!labels || labels.length === 0) {
    return "None";
  }

  return labels.join(", ");
}

function formatDate(value) {
  if (!value) {
    return "Not updated";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
