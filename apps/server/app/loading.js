export default function LoadingPage() {
  return (
    <main className="shell state-page">
      <section className="state-panel" aria-labelledby="loading-title" aria-live="polite">
        <p className="eyebrow">Loading</p>
        <h1 id="loading-title">Loading orchestrator</h1>
        <p className="lead">Preparing the current workspace view.</p>
        <div className="loading-meter" aria-hidden="true">
          <span />
        </div>
      </section>
    </main>
  );
}
