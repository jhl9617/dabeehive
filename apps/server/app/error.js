"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="shell state-page">
      <section className="state-panel" aria-labelledby="error-title">
        <p className="eyebrow">Server Error</p>
        <h1 id="error-title">Something went wrong</h1>
        <p className="lead">
          The orchestrator surface could not finish this request. Retry the
          page, or return home and reopen the workflow.
        </p>
        {error?.digest ? (
          <p className="error-digest">Digest: {error.digest}</p>
        ) : null}
        <div className="state-actions">
          <button className="button" type="button" onClick={() => reset()}>
            Try again
          </button>
          <a className="button secondary" href="/">
            Home
          </a>
        </div>
      </section>
    </main>
  );
}
