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
          <p className="eyebrow">프로젝트</p>
          <h1>프로젝트 목록</h1>
          <p className="lead">
            이슈, 에이전트 실행, 승인, 산출물을 관리하기 위해 오케스트레이터가
            추적하는 저장소 작업 공간입니다.
          </p>
        </div>
        <div className="resource-actions">
          <a className="button secondary" href="/">
            대시보드
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
            <h2>프로젝트 데이터를 불러올 수 없습니다</h2>
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      {!error && projects.length === 0 ? (
        <section className="resource-state" role="status">
          <span className="status-dot neutral" aria-hidden="true" />
          <div>
            <h2>아직 프로젝트가 없습니다</h2>
            <p>프로젝트 API 또는 VS Code 제어 화면에서 프로젝트를 생성하세요.</p>
          </div>
        </section>
      ) : null}

      {projects.length > 0 ? (
        <section className="resource-list" aria-label="프로젝트">
          {projects.map((project) => (
            <section className="resource-card" key={project.id}>
              <div className="resource-card-main">
                <div className="resource-title-row">
                  <h2>{project.name}</h2>
                  <span className="badge">{formatProjectStatus(project.status)}</span>
                </div>
                <p>{project.description || "프로젝트 설명이 없습니다."}</p>
                <dl className="resource-meta">
                  <div>
                    <dt>저장소</dt>
                    <dd>{formatRepository(project)}</dd>
                  </div>
                  <div>
                    <dt>작업 공간</dt>
                    <dd>{project.workspacePath || "연결되지 않음"}</dd>
                  </div>
                  <div>
                    <dt>업데이트</dt>
                    <dd>{formatDate(project.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
              <div className="resource-counts" aria-label={`${project.name} 관련 기록`}>
                <div>
                  <strong>{project._count.issues}</strong>
                  <span>이슈</span>
                </div>
                <div>
                  <strong>{project._count.runs}</strong>
                  <span>실행</span>
                </div>
                <div>
                  <strong>{project._count.documents}</strong>
                  <span>문서</span>
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
      error: "로컬 데이터베이스 연결과 Prisma Client 생성 상태를 확인하세요."
    };
  }
}

function formatRepository(project) {
  if (project.repoOwner && project.repoName) {
    return `${project.repoOwner}/${project.repoName}`;
  }

  return project.repoUrl || "연결되지 않음";
}

function formatProjectStatus(value) {
  const labels = {
    active: "활성",
    archived: "보관됨",
    at_risk: "위험",
    draft: "초안",
    released: "릴리스됨"
  };

  return labels[value] || value;
}

function formatDate(value) {
  if (!value) {
    return "업데이트 기록 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
