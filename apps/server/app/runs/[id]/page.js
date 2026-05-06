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
          <p className="eyebrow">Runs</p>
          <h1>Run detail</h1>
          <p className="lead">
            Status, event, and artifact evidence for a single adapter-driven agent run.
          </p>
        </div>
        <div className="resource-actions">
          <a className="button secondary" href="/">
            Dashboard
          </a>
          <a className="button" href={`/api/runs/${id}`}>
            Run API
          </a>
        </div>
      </header>

      {error ? (
        <section className="resource-state" role="status">
          <span className="status-dot warning" aria-hidden="true" />
          <div>
            <h2>Run data unavailable</h2>
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      {notFound ? (
        <section className="resource-state" role="status">
          <span className="status-dot neutral" aria-hidden="true" />
          <div>
            <h2>Run not found</h2>
            <p>No run exists for the requested identifier.</p>
          </div>
        </section>
      ) : null}

      {run ? (
        <>
          <section className="resource-card">
            <div className="resource-card-main">
              <div className="resource-title-row">
                <h2>{run.issue?.title || run.id}</h2>
                <span className="badge">{run.status}</span>
              </div>
              <p>{run.outputSummary || run.errorMessage || "No run output summary yet."}</p>
              <dl className="resource-meta">
                <div>
                  <dt>Project</dt>
                  <dd>{run.project?.name || "Unknown project"}</dd>
                </div>
                <div>
                  <dt>Issue</dt>
                  <dd>{formatIssue(run.issue)}</dd>
                </div>
                <div>
                  <dt>Agent</dt>
                  <dd>{run.agentRole}</dd>
                </div>
                <div>
                  <dt>Model</dt>
                  <dd>{formatModel(run)}</dd>
                </div>
                <div>
                  <dt>Started</dt>
                  <dd>{formatDate(run.startedAt)}</dd>
                </div>
                <div>
                  <dt>Completed</dt>
                  <dd>{formatDate(run.completedAt)}</dd>
                </div>
              </dl>
            </div>
            <div className="resource-counts" aria-label={`${run.id} related records`}>
              <div>
                <strong>{run._count.events}</strong>
                <span>Events</span>
              </div>
              <div>
                <strong>{run._count.artifacts}</strong>
                <span>Artifacts</span>
              </div>
              <div>
                <strong>{run._count.approvals}</strong>
                <span>Gates</span>
              </div>
            </div>
          </section>

          <section className="detail-grid">
            <section className="detail-panel" aria-labelledby="run-events-title">
              <div className="section-heading">
                <h2 id="run-events-title">Recent events</h2>
                <span>{run.events.length} shown</span>
              </div>
              {run.events.length > 0 ? (
                <div className="detail-list">
                  {run.events.map((event) => (
                    <div className="detail-item" key={event.id}>
                      <div className="detail-item-header">
                        <strong>{event.type}</strong>
                        <span>{formatDate(event.createdAt)}</span>
                      </div>
                      <p>{event.message || "No event message."}</p>
                      {event.metadata ? (
                        <pre className="metadata-preview">{formatJson(event.metadata)}</pre>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="detail-empty">No events recorded for this run.</p>
              )}
            </section>

            <section className="detail-panel" aria-labelledby="run-artifacts-title">
              <div className="section-heading">
                <h2 id="run-artifacts-title">Artifacts</h2>
                <span>{run.artifacts.length} shown</span>
              </div>
              {run.artifacts.length > 0 ? (
                <div className="detail-list">
                  {run.artifacts.map((artifact) => (
                    <div className="detail-item" key={artifact.id}>
                      <div className="detail-item-header">
                        <strong>
                          <a className="detail-link" href={`/artifacts/${artifact.id}`}>
                            {artifact.title || artifact.type}
                          </a>
                        </strong>
                        <span>{formatDate(artifact.createdAt)}</span>
                      </div>
                      <p>{artifact.type}</p>
                      {artifact.uri ? (
                        <a className="detail-link" href={artifact.uri}>
                          {artifact.uri}
                        </a>
                      ) : (
                        <pre className="metadata-preview">
                          {summarizeText(artifact.content, "No inline artifact content.")}
                        </pre>
                      )}
                      <a className="detail-link" href={`/artifacts/${artifact.id}`}>
                        Open artifact viewer
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="detail-empty">No artifacts recorded for this run.</p>
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
      error: "Check the local database connection and Prisma client generation.",
      notFound: false
    };
  }
}

function formatIssue(issue) {
  if (!issue) {
    return "No linked issue";
  }

  return `${issue.title} (${issue.status}, ${issue.priority})`;
}

function formatModel(run) {
  if (run.modelProvider && run.modelId) {
    return `${run.modelProvider}/${run.modelId}`;
  }

  return run.modelProvider || run.modelId || "Not specified";
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
    return summarizeText(JSON.stringify(value, null, 2), "No metadata.");
  } catch {
    return "Metadata unavailable.";
  }
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
