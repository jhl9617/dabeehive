export default function LoadingPage() {
  return (
    <main className="shell state-page">
      <section className="state-panel" aria-labelledby="loading-title" aria-live="polite">
        <p className="eyebrow">불러오는 중</p>
        <h1 id="loading-title">오케스트레이터 준비 중</h1>
        <p className="lead">현재 작업 공간 화면을 준비하고 있습니다.</p>
        <div className="loading-meter" aria-hidden="true">
          <span />
        </div>
      </section>
    </main>
  );
}
