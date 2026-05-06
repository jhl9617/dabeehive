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
          <p className="eyebrow">Artifacts</p>
          <h1>Artifact viewer</h1>
          <p className="lead">
            Read stored plan, diff, test report, review, PR URL, or log output.
          </p>
        </div>
        <div className="resource-actions">
          <a className="button secondary" href={artifact ? `/runs/${artifact.run.id}` : "/"}>
            Run Detail
          </a>
          <a className="button" href={`/api/artifacts?runId=${artifact?.run.id || ""}`}>
            Artifact API
          </a>
        </div>
      </header>

      {error ? (
        <section className="resource-state" role="status">
          <span className="status-dot warning" aria-hidden="true" />
          <div>
            <h2>Artifact data unavailable</h2>
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      {notFound ? (
        <section className="resource-state" role="status">
          <span className="status-dot neutral" aria-hidden="true" />
          <div>
            <h2>Artifact not found</h2>
            <p>No artifact exists for the requested identifier.</p>
          </div>
        </section>
      ) : null}

      {artifact ? (
        <>
          <section className="resource-card">
            <div className="resource-card-main">
              <div className="resource-title-row">
                <h2>{artifact.title || artifact.type}</h2>
                <span className="badge">{artifact.type}</span>
              </div>
              <p>{formatContext(artifact)}</p>
              <dl className="resource-meta">
                <div>
                  <dt>Run</dt>
                  <dd>{artifact.run.id}</dd>
                </div>
                <div>
                  <dt>Run Status</dt>
                  <dd>{artifact.run.status}</dd>
                </div>
                <div>
                  <dt>Agent</dt>
                  <dd>{artifact.run.agentRole}</dd>
                </div>
                <div>
                  <dt>Issue</dt>
                  <dd>{artifact.issue?.title || artifact.run.issue?.title || "No linked issue"}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{formatDate(artifact.createdAt)}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{formatDate(artifact.updatedAt)}</dd>
                </div>
              </dl>
            </div>
            <div className="resource-counts" aria-label={`${artifact.id} artifact state`}>
              <div>
                <strong>{artifact.content ? "Text" : "URI"}</strong>
                <span>Storage</span>
              </div>
              <div>
                <strong>{artifact.metadata ? "Yes" : "No"}</strong>
                <span>Metadata</span>
              </div>
              <div>
                <strong>{artifact.uri ? "Yes" : "No"}</strong>
                <span>URI</span>
              </div>
            </div>
          </section>

          <section className="detail-grid">
            <section className="detail-panel" aria-labelledby="artifact-content-title">
              <div className="section-heading">
                <h2 id="artifact-content-title">Content</h2>
                <span>{artifact.type}</span>
              </div>
              {artifact.content ? (
                <pre className="artifact-content">{artifact.content}</pre>
              ) : artifact.uri ? (
                <a className="detail-link" href={artifact.uri}>
                  {artifact.uri}
                </a>
              ) : (
                <p className="detail-empty">No artifact content or URI recorded.</p>
              )}
            </section>

            <section className="detail-panel" aria-labelledby="artifact-metadata-title">
              <div className="section-heading">
                <h2 id="artifact-metadata-title">Metadata</h2>
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
      error: "Check the local database connection and Prisma client generation.",
      notFound: false
    };
  }
}

function formatContext(artifact) {
  const projectName = artifact.issue?.project?.name || artifact.run.project?.name || "Unknown project";
  const issueTitle = artifact.issue?.title || artifact.run.issue?.title;

  if (issueTitle) {
    return `${projectName} / ${issueTitle}`;
  }

  return projectName;
}

function formatJson(value) {
  if (!value) {
    return "No metadata recorded.";
  }

  try {
    return JSON.stringify(value, null, 2);
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
