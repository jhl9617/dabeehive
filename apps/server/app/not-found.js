export default function NotFoundPage() {
  return (
    <main className="shell state-page">
      <section className="state-panel" aria-labelledby="not-found-title">
        <p className="eyebrow">찾을 수 없음</p>
        <h1 id="not-found-title">페이지를 찾을 수 없습니다</h1>
        <p className="lead">
          요청한 오케스트레이터 페이지는 이 PoC 화면에서 사용할 수 없습니다.
          홈으로 돌아가 프로젝트, 이슈, 실행, 승인 워크플로 중 하나를 선택하세요.
        </p>
        <div className="state-actions">
          <a className="button" href="/">
            홈
          </a>
        </div>
      </section>
    </main>
  );
}
