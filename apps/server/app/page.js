const navigationItems = [
  { href: "/projects", label: "Projects", meta: "workspace scope" },
  { href: "/issues", label: "Issues", meta: "planning queue" },
  { href: "/runs", label: "Runs", meta: "agent execution" },
  { href: "/approvals", label: "Approvals", meta: "human gates" },
  { href: "/api/artifacts", label: "Artifacts", meta: "stored outputs" }
];

const moduleLinks = [
  {
    href: "/api/health",
    label: "REST Health",
    summary: "HTTP health response for server readiness checks."
  },
  {
    href: "/api/mcp",
    label: "MCP Endpoint",
    summary: "Tool gateway for issue, run, approval, artifact, and context access."
  },
  {
    href: "/api/runs",
    label: "Runs API",
    summary: "Run list and creation endpoint for orchestrated agent work."
  },
  {
    href: "/api/approvals",
    label: "Approvals API",
    summary: "Approval request and response records for review gates."
  }
];

const workflowRows = [
  ["Plan approval", "Planner output", "Human review before coding"],
  ["Coder run", "Agent SDK adapter", "Code changes remain adapter-driven"],
  ["Final approval", "Diff and tests", "Reviewer confirms completion"],
  ["Artifacts", "Plan, diff, test, review", "Evidence remains queryable"]
];

export default function HomePage() {
  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
        <div>
          <p className="eyebrow">Dabeehive</p>
          <h1 className="dashboard-title">Orchestrator</h1>
        </div>
        <nav className="dashboard-nav">
          {navigationItems.map((item) => (
            <a key={item.href} href={item.href}>
              <span>{item.label}</span>
              <small>{item.meta}</small>
            </a>
          ))}
        </nav>
      </aside>

      <section className="dashboard-main" aria-labelledby="dashboard-title">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">PoC control surface</p>
            <h2 id="dashboard-title">Project, issue, run, and approval overview</h2>
          </div>
          <a className="button" href="/api/health">
            Health
          </a>
        </header>

        <section className="status-strip" aria-label="Service status">
          <div>
            <span className="status-dot" aria-hidden="true" />
            <span>Server ready</span>
          </div>
          <div>
            <span className="status-dot warning" aria-hidden="true" />
            <span>DB-backed smoke depends on local PostgreSQL</span>
          </div>
          <div>
            <span className="status-dot neutral" aria-hidden="true" />
            <span>Draft PR remains optional</span>
          </div>
        </section>

        <section className="link-grid" aria-label="Primary surfaces">
          {moduleLinks.map((item) => (
            <a className="surface-link" key={item.href} href={item.href}>
              <span>{item.label}</span>
              <small>{item.summary}</small>
            </a>
          ))}
        </section>

        <section className="workflow-panel" aria-labelledby="workflow-title">
          <div className="section-heading">
            <h2 id="workflow-title">Workflow path</h2>
            <span>PoC sequence</span>
          </div>
          <div className="workflow-table" role="table" aria-label="Workflow path">
            {workflowRows.map(([stage, source, gate]) => (
              <div className="workflow-row" role="row" key={stage}>
                <span role="cell">{stage}</span>
                <span role="cell">{source}</span>
                <span role="cell">{gate}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
