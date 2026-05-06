export default function NotFoundPage() {
  return (
    <main className="shell state-page">
      <section className="state-panel" aria-labelledby="not-found-title">
        <p className="eyebrow">Not Found</p>
        <h1 id="not-found-title">Page not found</h1>
        <p className="lead">
          The requested orchestrator page is not available in this PoC surface.
          Return home and choose an available project, issue, run, or approval
          workflow.
        </p>
        <div className="state-actions">
          <a className="button" href="/">
            Home
          </a>
        </div>
      </section>
    </main>
  );
}
