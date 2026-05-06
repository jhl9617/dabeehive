import { getPrismaClient } from "../../src/lib/db/prisma";

export const dynamic = "force-dynamic";

const projectSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  repoOwner: true,
  repoName: true,
  repoUrl: true,
  workspacePath: true,
  updatedAt: true,
  _count: {
    select: {
      issues: true,
      runs: true,
      documents: true
    }
  }
};

export default async function ProjectsPage() {
  const { projects, error } = await loadProjects();

  return (
    <main className="resource-shell">
      <header className="resource-header">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>Project list</h1>
          <p className="lead">
            Repository workspaces tracked by the orchestrator for issues, agent runs,
            approvals, and artifacts.
          </p>
        </div>
        <div className="resource-actions">
          <a className="button secondary" href="/">
            Dashboard
          </a>
          <a className="button" href="/api/projects">
            API
          </a>
        </div>
      </header>

      {error ? (
        <section className="resource-state" role="status">
          <span className="status-dot warning" aria-hidden="true" />
          <div>
            <h2>Project data unavailable</h2>
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      {!error && projects.length === 0 ? (
        <section className="resource-state" role="status">
          <span className="status-dot neutral" aria-hidden="true" />
          <div>
            <h2>No projects yet</h2>
            <p>Create a project through the Project API or VS Code control surface.</p>
          </div>
        </section>
      ) : null}

      {projects.length > 0 ? (
        <section className="resource-list" aria-label="Projects">
          {projects.map((project) => (
            <section className="resource-card" key={project.id}>
              <div className="resource-card-main">
                <div className="resource-title-row">
                  <h2>{project.name}</h2>
                  <span className="badge">{project.status}</span>
                </div>
                <p>{project.description || "No project description provided."}</p>
                <dl className="resource-meta">
                  <div>
                    <dt>Repository</dt>
                    <dd>{formatRepository(project)}</dd>
                  </div>
                  <div>
                    <dt>Workspace</dt>
                    <dd>{project.workspacePath || "Not linked"}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{formatDate(project.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
              <div className="resource-counts" aria-label={`${project.name} related records`}>
                <div>
                  <strong>{project._count.issues}</strong>
                  <span>Issues</span>
                </div>
                <div>
                  <strong>{project._count.runs}</strong>
                  <span>Runs</span>
                </div>
                <div>
                  <strong>{project._count.documents}</strong>
                  <span>Docs</span>
                </div>
              </div>
            </section>
          ))}
        </section>
      ) : null}
    </main>
  );
}

async function loadProjects() {
  try {
    const prisma = await getPrismaClient();
    const projects = await prisma.project.findMany({
      orderBy: {
        updatedAt: "desc"
      },
      select: projectSelect
    });

    return { projects, error: null };
  } catch {
    return {
      projects: [],
      error: "Check the local database connection and Prisma client generation."
    };
  }
}

function formatRepository(project) {
  if (project.repoOwner && project.repoName) {
    return `${project.repoOwner}/${project.repoName}`;
  }

  return project.repoUrl || "Not linked";
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
