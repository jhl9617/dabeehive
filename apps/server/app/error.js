"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="shell state-page">
      <section className="state-panel" aria-labelledby="error-title">
        <p className="eyebrow">서버 오류</p>
        <h1 id="error-title">요청을 처리하지 못했습니다</h1>
        <p className="lead">
          오케스트레이터 화면이 이 요청을 완료하지 못했습니다. 다시 시도하거나
          홈으로 돌아가 워크플로를 다시 여세요.
        </p>
        {error?.digest ? (
          <p className="error-digest">오류 식별자: {error.digest}</p>
        ) : null}
        <div className="state-actions">
          <button className="button" type="button" onClick={() => reset()}>
            다시 시도
          </button>
          <a className="button secondary" href="/">
            홈
          </a>
        </div>
      </section>
    </main>
  );
}
