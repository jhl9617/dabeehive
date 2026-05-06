import { getPrismaClient } from "./prisma";

export type RepositoryData = Record<string, unknown>;
export type RepositoryWhere = Record<string, unknown>;
export type RepositorySelect = Record<string, unknown>;
export type RepositoryInclude = Record<string, unknown>;

export type RepositoryQueryOptions = {
  select?: RepositorySelect;
  include?: RepositoryInclude;
};

export type RepositoryListOptions = RepositoryQueryOptions & {
  where?: RepositoryWhere;
  orderBy?: unknown;
  skip?: number;
  take?: number;
};

type CrudDelegate = {
  findMany: (args?: RepositoryData) => Promise<unknown[]>;
  findUnique: (args: RepositoryData) => Promise<unknown | null>;
  create: (args: RepositoryData) => Promise<unknown>;
  update: (args: RepositoryData) => Promise<unknown>;
  delete: (args: RepositoryData) => Promise<unknown>;
};

type RunEventDelegate = {
  findMany: (args?: RepositoryData) => Promise<unknown[]>;
  create: (args: RepositoryData) => Promise<unknown>;
};

type RepositoryPrismaClient = {
  project: CrudDelegate;
  issue: CrudDelegate;
  document: CrudDelegate;
  agentRun: CrudDelegate;
  approval: CrudDelegate;
  artifact: CrudDelegate;
  runEvent: RunEventDelegate;
};

export async function listProjects(
  options: RepositoryListOptions = {}
): Promise<unknown[]> {
  const prisma = await getRepositoryClient();

  return prisma.project.findMany(withDefaultOrder(options));
}

export async function getProject(
  id: string,
  options: RepositoryQueryOptions = {}
): Promise<unknown | null> {
  const prisma = await getRepositoryClient();

  return prisma.project.findUnique(withOptions({ where: byId(id) }, options));
}

export async function createProject(
  data: RepositoryData,
  options: RepositoryQueryOptions = {}
): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.project.create(withOptions({ data }, options));
}

export async function updateProject(
  id: string,
  data: RepositoryData,
  options: RepositoryQueryOptions = {}
): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.project.update(withOptions({ where: byId(id), data }, options));
}

export async function deleteProject(id: string): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.project.delete({ where: byId(id) });
}

export async function listIssues(
  options: RepositoryListOptions = {}
): Promise<unknown[]> {
  const prisma = await getRepositoryClient();

  return prisma.issue.findMany(withDefaultOrder(options));
}

export async function getIssue(
  id: string,
  options: RepositoryQueryOptions = {}
): Promise<unknown | null> {
  const prisma = await getRepositoryClient();

  return prisma.issue.findUnique(withOptions({ where: byId(id) }, options));
}

export async function createIssue(
  data: RepositoryData,
  options: RepositoryQueryOptions = {}
): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.issue.create(withOptions({ data }, options));
}

export async function updateIssue(
  id: string,
  data: RepositoryData,
  options: RepositoryQueryOptions = {}
): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.issue.update(withOptions({ where: byId(id), data }, options));
}

export async function deleteIssue(id: string): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.issue.delete({ where: byId(id) });
}

export async function listDocuments(
  options: RepositoryListOptions = {}
): Promise<unknown[]> {
  const prisma = await getRepositoryClient();

  return prisma.document.findMany(withDefaultOrder(options));
}

export async function getDocument(
  id: string,
  options: RepositoryQueryOptions = {}
): Promise<unknown | null> {
  const prisma = await getRepositoryClient();

  return prisma.document.findUnique(withOptions({ where: byId(id) }, options));
}

export async function createDocument(
  data: RepositoryData,
  options: RepositoryQueryOptions = {}
): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.document.create(withOptions({ data }, options));
}

export async function updateDocument(
  id: string,
  data: RepositoryData,
  options: RepositoryQueryOptions = {}
): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.document.update(withOptions({ where: byId(id), data }, options));
}

export async function deleteDocument(id: string): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.document.delete({ where: byId(id) });
}

export async function listAgentRuns(
  options: RepositoryListOptions = {}
): Promise<unknown[]> {
  const prisma = await getRepositoryClient();

  return prisma.agentRun.findMany(withDefaultOrder(options));
}

export async function getAgentRun(
  id: string,
  options: RepositoryQueryOptions = {}
): Promise<unknown | null> {
  const prisma = await getRepositoryClient();

  return prisma.agentRun.findUnique(withOptions({ where: byId(id) }, options));
}

export async function createAgentRun(
  data: RepositoryData,
  options: RepositoryQueryOptions = {}
): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.agentRun.create(withOptions({ data }, options));
}

export async function updateAgentRun(
  id: string,
  data: RepositoryData,
  options: RepositoryQueryOptions = {}
): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.agentRun.update(withOptions({ where: byId(id), data }, options));
}

export async function listRunEvents(
  runId: string,
  options: RepositoryListOptions = {}
): Promise<unknown[]> {
  const prisma = await getRepositoryClient();

  return prisma.runEvent.findMany({
    ...options,
    where: {
      ...options.where,
      runId
    },
    orderBy: options.orderBy ?? { createdAt: "asc" }
  });
}

export async function appendRunEvent(
  runId: string,
  data: RepositoryData
): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.runEvent.create({
    data: {
      ...data,
      runId
    }
  });
}

export async function listApprovals(
  options: RepositoryListOptions = {}
): Promise<unknown[]> {
  const prisma = await getRepositoryClient();

  return prisma.approval.findMany(withDefaultOrder(options));
}

export async function getApproval(
  id: string,
  options: RepositoryQueryOptions = {}
): Promise<unknown | null> {
  const prisma = await getRepositoryClient();

  return prisma.approval.findUnique(withOptions({ where: byId(id) }, options));
}

export async function createApproval(
  data: RepositoryData,
  options: RepositoryQueryOptions = {}
): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.approval.create(withOptions({ data }, options));
}

export async function updateApproval(
  id: string,
  data: RepositoryData,
  options: RepositoryQueryOptions = {}
): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.approval.update(withOptions({ where: byId(id), data }, options));
}

export async function deleteApproval(id: string): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.approval.delete({ where: byId(id) });
}

export async function listArtifacts(
  options: RepositoryListOptions = {}
): Promise<unknown[]> {
  const prisma = await getRepositoryClient();

  return prisma.artifact.findMany(withDefaultOrder(options));
}

export async function getArtifact(
  id: string,
  options: RepositoryQueryOptions = {}
): Promise<unknown | null> {
  const prisma = await getRepositoryClient();

  return prisma.artifact.findUnique(withOptions({ where: byId(id) }, options));
}

export async function createArtifact(
  data: RepositoryData,
  options: RepositoryQueryOptions = {}
): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.artifact.create(withOptions({ data }, options));
}

export async function updateArtifact(
  id: string,
  data: RepositoryData,
  options: RepositoryQueryOptions = {}
): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.artifact.update(withOptions({ where: byId(id), data }, options));
}

export async function deleteArtifact(id: string): Promise<unknown> {
  const prisma = await getRepositoryClient();

  return prisma.artifact.delete({ where: byId(id) });
}

async function getRepositoryClient(): Promise<RepositoryPrismaClient> {
  return (await getPrismaClient()) as unknown as RepositoryPrismaClient;
}

function byId(id: string): { id: string } {
  return { id };
}

function withDefaultOrder(
  options: RepositoryListOptions
): RepositoryListOptions {
  return {
    ...options,
    orderBy: options.orderBy ?? { createdAt: "desc" }
  };
}

function withOptions(
  args: RepositoryData,
  options: RepositoryQueryOptions
): RepositoryData {
  return {
    ...args,
    ...options
  };
}
