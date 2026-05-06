const navigationItems = [
  { href: "/projects", label: "프로젝트", meta: "작업 공간 범위" },
  { href: "/issues", label: "이슈", meta: "계획 대기열" },
  { href: "/runs", label: "실행", meta: "에이전트 실행" },
  { href: "/approvals", label: "승인", meta: "사람 검토 게이트" },
  { href: "/api/artifacts", label: "산출물", meta: "저장된 결과" }
];

const moduleLinks = [
  {
    href: "/api/health",
    label: "REST 상태",
    summary: "서버 준비 상태를 확인하는 HTTP health 응답입니다."
  },
  {
    href: "/api/mcp",
    label: "MCP 엔드포인트",
    summary: "이슈, 실행, 승인, 산출물, 컨텍스트 접근을 위한 도구 게이트웨이입니다."
  },
  {
    href: "/api/runs",
    label: "실행 API",
    summary: "오케스트레이션된 에이전트 작업의 실행 목록과 생성 엔드포인트입니다."
  },
  {
    href: "/api/approvals",
    label: "승인 API",
    summary: "검토 게이트의 승인 요청과 응답 기록을 다룹니다."
  }
];

const workflowRows = [
  ["계획 승인", "플래너 결과", "코딩 전 사람 검토"],
  ["코더 실행", "Agent SDK 어댑터", "코드 변경은 어댑터가 담당"],
  ["최종 승인", "diff와 테스트", "리뷰어가 완료 여부 확인"],
  ["산출물", "계획, diff, 테스트, 리뷰", "근거는 계속 조회 가능"]
];

export default function HomePage() {
  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar" aria-label="대시보드 탐색">
        <div>
          <p className="eyebrow">Dabeehive</p>
          <h1 className="dashboard-title">오케스트레이터</h1>
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
            <p className="eyebrow">PoC 제어 화면</p>
            <h2 id="dashboard-title">프로젝트, 이슈, 실행, 승인 현황</h2>
          </div>
          <a className="button" href="/api/health">
            상태 확인
          </a>
        </header>

        <section className="status-strip" aria-label="서비스 상태">
          <div>
            <span className="status-dot" aria-hidden="true" />
            <span>서버 준비 완료</span>
          </div>
          <div>
            <span className="status-dot warning" aria-hidden="true" />
            <span>임시 DB 스택으로 로컬 검증 가능</span>
          </div>
          <div>
            <span className="status-dot neutral" aria-hidden="true" />
            <span>Draft PR 생성은 선택 사항</span>
          </div>
        </section>

        <section className="link-grid" aria-label="주요 화면">
          {moduleLinks.map((item) => (
            <a className="surface-link" key={item.href} href={item.href}>
              <span>{item.label}</span>
              <small>{item.summary}</small>
            </a>
          ))}
        </section>

        <section className="workflow-panel" aria-labelledby="workflow-title">
          <div className="section-heading">
            <h2 id="workflow-title">워크플로 경로</h2>
            <span>PoC 순서</span>
          </div>
          <div className="workflow-table" role="table" aria-label="워크플로 경로">
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
