export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Orchestrator Server</p>
          <h1 id="page-title">Dabeehive AI Agent Orchestrator</h1>
          <p className="lead">
            Next.js App Router server surface for project, issue, run, approval,
            and artifact workflows.
          </p>
        </div>
        <div className="status-panel" aria-label="Server status">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <p className="status-label">Server</p>
            <p className="status-value">Ready</p>
          </div>
        </div>
      </section>

      <section className="grid" aria-label="PoC modules">
        <article>
          <span>01</span>
          <h2>REST API</h2>
          <p>Shared response helpers and validated App Router handlers.</p>
        </article>
        <article>
          <span>02</span>
          <h2>MCP Gateway</h2>
          <p>Tools for issues, context, runs, approvals, and artifacts.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Agent Runs</h2>
          <p>SDK adapter events, command summaries, and test evidence.</p>
        </article>
      </section>
    </main>
  );
}
