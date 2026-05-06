import * as vscode from "vscode";
import type { ExtensionContext, Thenable } from "vscode";

import { OrchestratorClient } from "./orchestratorClient";
import type {
  ApprovalResponseAction,
  ArtifactType,
  OrchestratorArtifact,
  OrchestratorApproval,
  OrchestratorIssue,
  OrchestratorProject,
  OrchestratorRun,
  OrchestratorRunDetail,
  OrchestratorRunEvent
} from "./orchestratorClient";

const VIEW_IDS = [
  "dabeehive.views.issues",
  "dabeehive.views.runs",
  "dabeehive.views.approvals"
] as const;
const API_TOKEN_SECRET_KEY = "dabeehive.apiToken";
const DEFAULT_SERVER_URL = "http://127.0.0.1:3000";
const REFRESH_COMMAND = "dabeehive.refresh";
const RECONNECT_COMMAND = "dabeehive.reconnect";
const CREATE_ISSUE_COMMAND = "dabeehive.createIssue";
const START_RUN_COMMAND = "dabeehive.startRun";
const OPEN_RUN_CONSOLE_COMMAND = "dabeehive.openRunConsole";
const OPEN_APPROVAL_PANEL_COMMAND = "dabeehive.openApprovalPanel";
const OPEN_ARTIFACT_VIEWER_COMMAND = "dabeehive.openArtifactViewer";
const DEFAULT_AGENT_ROLE = "planner";
const ARTIFACT_TYPES = [
  "plan",
  "diff",
  "test_report",
  "review",
  "pr_url",
  "log"
] as const;
const RUN_STATUS_ORDER = [
  "queued",
  "planning",
  "waiting_approval",
  "coding",
  "reviewing",
  "succeeded",
  "failed",
  "cancelled"
];
const RUN_TERMINAL_STATUSES = ["succeeded", "failed", "cancelled"] as const;

const emptyTreeProvider: vscode.TreeDataProvider<never> = {
  getChildren: () => [],
  getTreeItem: (element) => element
};

type ProjectsIssuesTreeNode =
  | {
      kind: "project";
      project: OrchestratorProject;
    }
  | {
      kind: "issue";
      issue: OrchestratorIssue;
    }
  | {
      kind: "message";
      label: string;
    };

class ProjectsIssuesTreeProvider
  implements vscode.TreeDataProvider<ProjectsIssuesTreeNode>
{
  private readonly treeDataChangeEmitter =
    new vscode.EventEmitter<ProjectsIssuesTreeNode | undefined>();

  readonly onDidChangeTreeData = this.treeDataChangeEmitter.event;

  constructor(private readonly createClient: () => Promise<OrchestratorClient>) {}

  refresh(): void {
    this.treeDataChangeEmitter.fire(undefined);
  }

  async getChildren(
    element?: ProjectsIssuesTreeNode
  ): Promise<ProjectsIssuesTreeNode[]> {
    try {
      const client = await this.createClient();

      if (!element) {
        const projects = await client.listProjects();

        if (projects.length === 0) {
          return [{ kind: "message", label: "No projects" }];
        }

        return projects.map((project) => ({
          kind: "project",
          project
        }));
      }

      if (element.kind !== "project") {
        return [];
      }

      const issues = await client.listIssues(element.project.id);

      if (issues.length === 0) {
        return [{ kind: "message", label: "No issues" }];
      }

      return issues.map((issue) => ({
        kind: "issue",
        issue
      }));
    } catch {
      return [{ kind: "message", label: "Unable to load projects or issues" }];
    }
  }

  getTreeItem(node: ProjectsIssuesTreeNode): vscode.TreeItem {
    if (node.kind === "project") {
      return {
        label: node.project.name,
        description: node.project.status,
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        contextValue: "dabeehive.project"
      };
    }

    if (node.kind === "issue") {
      return {
        label: node.issue.title,
        description: `${node.issue.status} / ${node.issue.priority}`,
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        contextValue: "dabeehive.issue"
      };
    }

    return {
      label: node.label,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      contextValue: "dabeehive.message"
    };
  }
}

type RunsTreeNode =
  | {
      kind: "status";
      status: string;
      runs: OrchestratorRun[];
    }
  | {
      kind: "run";
      run: OrchestratorRun;
    }
  | {
      kind: "message";
      label: string;
    };

class RunsTreeProvider implements vscode.TreeDataProvider<RunsTreeNode> {
  private readonly treeDataChangeEmitter =
    new vscode.EventEmitter<RunsTreeNode | undefined>();

  readonly onDidChangeTreeData = this.treeDataChangeEmitter.event;

  constructor(private readonly createClient: () => Promise<OrchestratorClient>) {}

  refresh(): void {
    this.treeDataChangeEmitter.fire(undefined);
  }

  async getChildren(element?: RunsTreeNode): Promise<RunsTreeNode[]> {
    try {
      if (element?.kind === "status") {
        return element.runs.map((run) => ({
          kind: "run",
          run
        }));
      }

      if (element) {
        return [];
      }

      const client = await this.createClient();
      const runs = await client.listRuns();

      if (runs.length === 0) {
        return [{ kind: "message", label: "No runs" }];
      }

      return groupRunsByStatus(runs).map(([status, groupedRuns]) => ({
        kind: "status",
        status,
        runs: groupedRuns
      }));
    } catch {
      return [{ kind: "message", label: "Unable to load runs" }];
    }
  }

  getTreeItem(node: RunsTreeNode): vscode.TreeItem {
    if (node.kind === "status") {
      return {
        label: node.status,
        description: `${node.runs.length} run${node.runs.length === 1 ? "" : "s"}`,
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        contextValue: "dabeehive.runStatus"
      };
    }

    if (node.kind === "run") {
      return {
        label: `Run ${formatShortId(node.run.id)}`,
        description: formatRunDescription(node.run),
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        contextValue: "dabeehive.run",
        command: {
          command: OPEN_RUN_CONSOLE_COMMAND,
          title: "Open Run Console",
          arguments: [node]
        }
      };
    }

    return {
      label: node.label,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      contextValue: "dabeehive.message"
    };
  }
}

type ApprovalsTreeNode =
  | {
      kind: "approval";
      approval: OrchestratorApproval;
    }
  | {
      kind: "message";
      label: string;
    };

type NotificationState = {
  pendingApprovalIds: Set<string>;
  terminalRunKeys: Set<string>;
};

class ApprovalsTreeProvider
  implements vscode.TreeDataProvider<ApprovalsTreeNode>
{
  private readonly treeDataChangeEmitter =
    new vscode.EventEmitter<ApprovalsTreeNode | undefined>();

  readonly onDidChangeTreeData = this.treeDataChangeEmitter.event;

  constructor(private readonly createClient: () => Promise<OrchestratorClient>) {}

  refresh(): void {
    this.treeDataChangeEmitter.fire(undefined);
  }

  async getChildren(element?: ApprovalsTreeNode): Promise<ApprovalsTreeNode[]> {
    if (element) {
      return [];
    }

    try {
      const client = await this.createClient();
      const approvals = await client.listPendingApprovals();

      if (approvals.length === 0) {
        return [{ kind: "message", label: "No pending approvals" }];
      }

      return approvals.map((approval) => ({
        kind: "approval",
        approval
      }));
    } catch {
      return [{ kind: "message", label: "Unable to load approvals" }];
    }
  }

  getTreeItem(node: ApprovalsTreeNode): vscode.TreeItem {
    if (node.kind === "approval") {
      return {
        label: formatApprovalLabel(node.approval),
        description: formatApprovalDescription(node.approval),
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        contextValue: "dabeehive.approval",
        command: {
          command: OPEN_APPROVAL_PANEL_COMMAND,
          title: "Open Approval Panel",
          arguments: [node]
        }
      };
    }

    return {
      label: node.label,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      contextValue: "dabeehive.message"
    };
  }
}

export function activate(context: ExtensionContext): void {
  const statusBarItem = createConnectionStatusBarItem();
  const notificationState = createNotificationState();
  setConnectionStatus(statusBarItem, "disconnected");
  context.subscriptions.push(statusBarItem);
  const projectsIssuesTreeProvider = new ProjectsIssuesTreeProvider(() =>
    createOrchestratorClient(context)
  );
  const runsTreeProvider = new RunsTreeProvider(() =>
    createOrchestratorClient(context)
  );
  const approvalsTreeProvider = new ApprovalsTreeProvider(() =>
    createOrchestratorClient(context)
  );
  const refreshViews = () => {
    projectsIssuesTreeProvider.refresh();
    runsTreeProvider.refresh();
    approvalsTreeProvider.refresh();
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(REFRESH_COMMAND, () =>
      refreshOrchestrator(
        context,
        statusBarItem,
        notificationState,
        refreshViews
      )
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(RECONNECT_COMMAND, () =>
      reconnectOrchestrator(
        context,
        statusBarItem,
        notificationState,
        refreshViews
      )
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("dabeehive.setApiToken", () =>
      setApiToken(context)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("dabeehive.clearApiToken", () =>
      clearApiToken(context)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(CREATE_ISSUE_COMMAND, () =>
      createIssue(context)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(START_RUN_COMMAND, (argument) =>
      startRun(context, argument)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(OPEN_RUN_CONSOLE_COMMAND, (argument) =>
      openRunConsole(context, argument)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(OPEN_APPROVAL_PANEL_COMMAND, (argument) =>
      openApprovalPanel(context, argument)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(OPEN_ARTIFACT_VIEWER_COMMAND, (argument) =>
      openArtifactViewer(context, argument)
    )
  );

  VIEW_IDS.forEach((viewId) => {
    if (viewId === "dabeehive.views.issues") {
      context.subscriptions.push(
        vscode.window.registerTreeDataProvider(viewId, projectsIssuesTreeProvider)
      );
      return;
    }

    if (viewId === "dabeehive.views.runs") {
      context.subscriptions.push(
        vscode.window.registerTreeDataProvider(viewId, runsTreeProvider)
      );
      return;
    }

    if (viewId === "dabeehive.views.approvals") {
      context.subscriptions.push(
        vscode.window.registerTreeDataProvider(viewId, approvalsTreeProvider)
      );
      return;
    }

    context.subscriptions.push(
      vscode.window.registerTreeDataProvider(viewId, emptyTreeProvider)
    );
  });
}

export function deactivate(): void {
  return undefined;
}

export function getApiToken(
  context: ExtensionContext
): Thenable<string | undefined> {
  return context.secrets.get(API_TOKEN_SECRET_KEY);
}

export async function createOrchestratorClient(
  context: ExtensionContext
): Promise<OrchestratorClient> {
  const token = await getApiToken(context);

  return new OrchestratorClient({
    serverUrl: getServerUrl(),
    token
  });
}

async function setApiToken(context: ExtensionContext): Promise<void> {
  const token = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    password: true,
    prompt: "Dabeehive API token"
  });

  if (token === undefined) {
    return;
  }

  const trimmedToken = token.trim();

  if (!trimmedToken) {
    await context.secrets.delete(API_TOKEN_SECRET_KEY);
    await vscode.window.showWarningMessage("Dabeehive API token was not saved.");
    return;
  }

  await context.secrets.store(API_TOKEN_SECRET_KEY, trimmedToken);
  await vscode.window.showInformationMessage("Dabeehive API token saved.");
}

async function clearApiToken(context: ExtensionContext): Promise<void> {
  await context.secrets.delete(API_TOKEN_SECRET_KEY);
  await vscode.window.showInformationMessage("Dabeehive API token cleared.");
}

async function createIssue(context: ExtensionContext): Promise<void> {
  const projectId = await promptRequiredInput("Dabeehive project ID");

  if (!projectId) {
    return;
  }

  const title = await promptRequiredInput("Issue title");

  if (!title) {
    return;
  }

  const bodyInput = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    prompt: "Issue body (optional)"
  });

  if (bodyInput === undefined) {
    return;
  }

  try {
    const client = await createOrchestratorClient(context);
    const issue = await client.createIssue({
      projectId,
      title,
      body: bodyInput.trim() || null
    });
    await vscode.window.showInformationMessage(
      `Dabeehive issue created: ${issue.title}.`
    );
  } catch {
    await vscode.window.showWarningMessage("Dabeehive issue creation failed.");
  }
}

async function startRun(
  context: ExtensionContext,
  argument: unknown
): Promise<void> {
  const selectedIssue = getIssueFromCommandArgument(argument);
  const projectId =
    selectedIssue?.projectId ?? (await promptRequiredInput("Dabeehive project ID"));

  if (!projectId) {
    return;
  }

  const issueId = selectedIssue?.id ?? (await promptRequiredInput("Issue ID"));

  if (!issueId) {
    return;
  }

  try {
    const client = await createOrchestratorClient(context);
    const run = await client.createRun({
      projectId,
      issueId,
      agentRole: DEFAULT_AGENT_ROLE
    });
    await vscode.window.showInformationMessage(
      `Dabeehive run started: ${formatShortId(run.id)}.`
    );
  } catch {
    await vscode.window.showWarningMessage("Dabeehive run start failed.");
  }
}

async function openRunConsole(
  context: ExtensionContext,
  argument: unknown
): Promise<void> {
  const selectedRun = getRunFromCommandArgument(argument);
  const runId = selectedRun?.id ?? (await promptRequiredInput("Run ID"));

  if (!runId) {
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    "dabeehive.runConsole",
    `Run ${formatShortId(runId)}`,
    vscode.ViewColumn.Active,
    {
      enableScripts: false
    }
  );
  panel.webview.html = renderRunConsoleLoadingHtml(runId);

  try {
    const client = await createOrchestratorClient(context);
    const run = await client.getRun(runId);
    panel.title = `Run ${formatShortId(run.id)}`;
    panel.webview.html = renderRunConsoleHtml(run);
  } catch {
    panel.webview.html = renderRunConsoleErrorHtml(runId);
    await vscode.window.showWarningMessage("Dabeehive run console failed to load.");
  }
}

async function openApprovalPanel(
  context: ExtensionContext,
  argument: unknown
): Promise<void> {
  const selectedApproval = getApprovalFromCommandArgument(argument);
  const approvalId =
    selectedApproval?.id ?? (await promptRequiredInput("Approval ID"));

  if (!approvalId) {
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    "dabeehive.approvalPanel",
    `Approval ${formatShortId(approvalId)}`,
    vscode.ViewColumn.Active,
    {
      enableScripts: true
    }
  );
  let approval: OrchestratorApproval | undefined;
  panel.webview.html = renderApprovalPanelLoadingHtml(approvalId, createNonce());

  let client: OrchestratorClient;

  try {
    client = await createOrchestratorClient(context);
  } catch {
    panel.webview.html = renderApprovalPanelErrorHtml(approvalId, createNonce());
    await vscode.window.showWarningMessage("Dabeehive approval panel failed to load.");
    return;
  }

  context.subscriptions.push(
    panel.webview.onDidReceiveMessage(async (message) => {
      const action = getApprovalActionFromMessage(message);

      if (!action) {
        return;
      }

      let reason: string | null | undefined;

      if (action !== "approve") {
        const reasonInput = await vscode.window.showInputBox({
          ignoreFocusOut: true,
          prompt: `${formatApprovalAction(action)} reason (optional)`
        });

        if (reasonInput === undefined) {
          return;
        }

        reason = reasonInput.trim() || null;
      }

      try {
        approval = await client.respondApproval(approvalId, {
          action,
          reason
        });
        panel.title = `Approval ${formatShortId(approval.id)}`;
        panel.webview.html = renderApprovalPanelHtml(
          approval,
          createNonce(),
          "Approval response saved."
        );
        await vscode.window.showInformationMessage(
          `Dabeehive approval ${formatApprovalAction(action).toLowerCase()} submitted.`
        );
      } catch {
        if (approval) {
          panel.webview.html = renderApprovalPanelHtml(
            approval,
            createNonce(),
            "Approval response failed.",
            "error"
          );
        }

        await vscode.window.showWarningMessage(
          "Dabeehive approval response failed."
        );
      }
    })
  );

  try {
    approval = await client.getApproval(approvalId);
    panel.title = `Approval ${formatShortId(approval.id)}`;
    panel.webview.html = renderApprovalPanelHtml(approval, createNonce());
  } catch {
    panel.webview.html = renderApprovalPanelErrorHtml(approvalId, createNonce());
    await vscode.window.showWarningMessage("Dabeehive approval panel failed to load.");
  }
}

async function openArtifactViewer(
  context: ExtensionContext,
  argument: unknown
): Promise<void> {
  const selectedRun = getRunFromCommandArgument(argument);
  const runId = selectedRun?.id ?? (await promptRequiredInput("Run ID"));

  if (!runId) {
    return;
  }

  const artifactType = await promptArtifactType();

  if (artifactType === undefined) {
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    "dabeehive.artifactViewer",
    `Artifacts ${formatShortId(runId)}`,
    vscode.ViewColumn.Active,
    {
      enableScripts: false
    }
  );
  panel.webview.html = renderArtifactViewerLoadingHtml(runId);

  try {
    const client = await createOrchestratorClient(context);
    const artifacts = await client.listArtifacts({
      runId,
      ...(artifactType ? { type: artifactType } : {})
    });
    panel.title = `Artifacts ${formatShortId(runId)}`;
    panel.webview.html = renderArtifactViewerHtml(runId, artifactType, artifacts);
  } catch {
    panel.webview.html = renderArtifactViewerErrorHtml(runId);
    await vscode.window.showWarningMessage(
      "Dabeehive artifact viewer failed to load."
    );
  }
}

async function promptRequiredInput(prompt: string): Promise<string | undefined> {
  const input = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    prompt
  });

  if (input === undefined) {
    return undefined;
  }

  const trimmedInput = input.trim();

  if (!trimmedInput) {
    await vscode.window.showWarningMessage(`${prompt} is required.`);
    return undefined;
  }

  return trimmedInput;
}

async function promptArtifactType(): Promise<ArtifactType | null | undefined> {
  const input = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    prompt: "Artifact type filter (optional: plan, diff, test_report, review, pr_url, log)"
  });

  if (input === undefined) {
    return undefined;
  }

  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return null;
  }

  if (isArtifactType(trimmedInput)) {
    return trimmedInput;
  }

  await vscode.window.showWarningMessage("Unsupported artifact type.");
  return undefined;
}

function getIssueFromCommandArgument(argument: unknown): OrchestratorIssue | undefined {
  if (typeof argument !== "object" || argument === null || !("issue" in argument)) {
    return undefined;
  }

  const issue = (argument as { issue?: unknown }).issue;

  if (typeof issue !== "object" || issue === null) {
    return undefined;
  }

  const candidate = issue as Partial<OrchestratorIssue>;

  if (typeof candidate.id !== "string" || typeof candidate.projectId !== "string") {
    return undefined;
  }

  return candidate as OrchestratorIssue;
}

function getRunFromCommandArgument(argument: unknown): OrchestratorRun | undefined {
  const run =
    typeof argument === "object" && argument !== null && "run" in argument
      ? (argument as { run?: unknown }).run
      : argument;

  if (typeof run !== "object" || run === null) {
    return undefined;
  }

  const candidate = run as Partial<OrchestratorRun>;

  if (typeof candidate.id !== "string") {
    return undefined;
  }

  return candidate as OrchestratorRun;
}

function getApprovalFromCommandArgument(
  argument: unknown
): OrchestratorApproval | undefined {
  const approval =
    typeof argument === "object" && argument !== null && "approval" in argument
      ? (argument as { approval?: unknown }).approval
      : argument;

  if (typeof approval !== "object" || approval === null) {
    return undefined;
  }

  const candidate = approval as Partial<OrchestratorApproval>;

  if (typeof candidate.id !== "string") {
    return undefined;
  }

  return candidate as OrchestratorApproval;
}

function getApprovalActionFromMessage(
  message: unknown
): ApprovalResponseAction | undefined {
  if (typeof message !== "object" || message === null) {
    return undefined;
  }

  const candidate = (message as { type?: unknown; action?: unknown });

  if (candidate.type !== "approvalResponse") {
    return undefined;
  }

  if (
    candidate.action === "approve" ||
    candidate.action === "reject" ||
    candidate.action === "request_changes"
  ) {
    return candidate.action;
  }

  return undefined;
}

function isArtifactType(value: string): value is ArtifactType {
  return (ARTIFACT_TYPES as readonly string[]).includes(value);
}

async function refreshOrchestrator(
  context: ExtensionContext,
  statusBarItem: vscode.StatusBarItem,
  notificationState: NotificationState,
  refreshViews: () => void
): Promise<void> {
  try {
    const client = await createOrchestratorClient(context);
    const health = await client.getHealth();
    setConnectionStatus(statusBarItem, "connected");
    refreshViews();

    try {
      await notifyObservedChanges(client, notificationState);
    } catch {
      await vscode.window.showWarningMessage(
        "Dabeehive notification check failed."
      );
    }

    await vscode.window.showInformationMessage(
      `Dabeehive orchestrator is ${health.status}.`
    );
  } catch {
    setConnectionStatus(statusBarItem, "disconnected");
    refreshViews();
    await vscode.window.showWarningMessage("Dabeehive orchestrator request failed.");
  }
}

async function reconnectOrchestrator(
  context: ExtensionContext,
  statusBarItem: vscode.StatusBarItem,
  notificationState: NotificationState,
  refreshViews: () => void
): Promise<void> {
  resetNotificationState(notificationState);
  setConnectionStatus(statusBarItem, "disconnected");
  refreshViews();
  await refreshOrchestrator(
    context,
    statusBarItem,
    notificationState,
    refreshViews
  );
}

function createNotificationState(): NotificationState {
  return {
    pendingApprovalIds: new Set<string>(),
    terminalRunKeys: new Set<string>()
  };
}

function resetNotificationState(state: NotificationState): void {
  state.pendingApprovalIds.clear();
  state.terminalRunKeys.clear();
}

async function notifyObservedChanges(
  client: OrchestratorClient,
  state: NotificationState
): Promise<void> {
  const [runs, approvals] = await Promise.all([
    client.listRuns(),
    client.listPendingApprovals()
  ]);

  for (const run of runs) {
    if (!isTerminalRunStatus(run.status)) {
      continue;
    }

    const runKey = `${run.id}:${run.status}`;

    if (state.terminalRunKeys.has(runKey)) {
      continue;
    }

    state.terminalRunKeys.add(runKey);
    await vscode.window.showInformationMessage(
      `Dabeehive run ${formatShortId(run.id)} ${formatStatus(run.status)}.`
    );
  }

  for (const approval of approvals) {
    if (state.pendingApprovalIds.has(approval.id)) {
      continue;
    }

    state.pendingApprovalIds.add(approval.id);
    await vscode.window.showInformationMessage(
      `Dabeehive approval requested: ${formatApprovalLabel(approval)}.`
    );
  }
}

function isTerminalRunStatus(status: string): boolean {
  return (RUN_TERMINAL_STATUSES as readonly string[]).includes(status);
}

function createConnectionStatusBarItem(): vscode.StatusBarItem {
  const statusBarItem = vscode.window.createStatusBarItem(
    "dabeehive.status",
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = REFRESH_COMMAND;

  return statusBarItem;
}

function setConnectionStatus(
  statusBarItem: vscode.StatusBarItem,
  status: "connected" | "disconnected"
): void {
  if (status === "connected") {
    statusBarItem.text = "Dabeehive: Connected";
    statusBarItem.tooltip = "Connected to Dabeehive Orchestrator";
  } else {
    statusBarItem.text = "Dabeehive: Disconnected";
    statusBarItem.tooltip = "Dabeehive Orchestrator is not connected";
  }

  statusBarItem.show();
}

function getServerUrl(): string {
  const configuredUrl = vscode.workspace
    .getConfiguration("dabeehive")
    .get("serverUrl", DEFAULT_SERVER_URL);
  const trimmedUrl = configuredUrl.trim();

  return trimmedUrl || DEFAULT_SERVER_URL;
}

function groupRunsByStatus(runs: OrchestratorRun[]): [string, OrchestratorRun[]][] {
  const groups = new Map<string, OrchestratorRun[]>();

  runs.forEach((run) => {
    const groupedRuns = groups.get(run.status) ?? [];
    groupedRuns.push(run);
    groups.set(run.status, groupedRuns);
  });

  return [...groups.entries()].sort(
    ([statusA], [statusB]) =>
      getRunStatusOrder(statusA) - getRunStatusOrder(statusB) ||
      statusA.localeCompare(statusB)
  );
}

function getRunStatusOrder(status: string): number {
  const index = RUN_STATUS_ORDER.indexOf(status);

  return index === -1 ? RUN_STATUS_ORDER.length : index;
}

function formatShortId(id: string): string {
  return id.slice(0, 8) || id;
}

function formatRunDescription(run: OrchestratorRun): string {
  const issueLabel = run.issueId ? ` / issue ${formatShortId(run.issueId)}` : "";
  const modelLabel = run.modelId ? ` / ${run.modelId}` : "";

  return `${run.agentRole}${issueLabel}${modelLabel}`;
}

function formatApprovalLabel(approval: OrchestratorApproval): string {
  return (
    approval.requiredAction?.trim() ||
    approval.reason?.trim() ||
    formatApprovalType(approval.type)
  );
}

function formatApprovalDescription(approval: OrchestratorApproval): string {
  const riskLabel =
    approval.riskScore === null ? "risk n/a" : `risk ${approval.riskScore}`;
  const runLabel = approval.runId ? ` / run ${formatShortId(approval.runId)}` : "";
  const issueLabel = approval.issueId
    ? ` / issue ${formatShortId(approval.issueId)}`
    : "";

  return `${formatApprovalType(approval.type)} / ${riskLabel}${runLabel}${issueLabel}`;
}

function formatApprovalType(type: string): string {
  return type.replace(/_/g, " ");
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ");
}

function formatApprovalAction(action: ApprovalResponseAction): string {
  if (action === "approve") {
    return "Approve";
  }

  if (action === "reject") {
    return "Reject";
  }

  return "Request changes";
}

function createNonce(): string {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
}

function renderRunConsoleLoadingHtml(runId: string): string {
  return renderRunConsoleShell(
    `Run ${escapeHtml(formatShortId(runId))}`,
    `<p class="muted">Loading run events...</p>`
  );
}

function renderRunConsoleErrorHtml(runId: string): string {
  return renderRunConsoleShell(
    `Run ${escapeHtml(formatShortId(runId))}`,
    `<p class="error">Unable to load run details.</p>`
  );
}

function renderRunConsoleHtml(run: OrchestratorRunDetail): string {
  const modelLabel = [run.modelProvider, run.modelId]
    .filter((value): value is string => Boolean(value))
    .join(" / ");
  const summaryRows = [
    ["Status", run.status],
    ["Agent", run.agentRole],
    ["Project", formatShortId(run.projectId)],
    ["Issue", run.issueId ? formatShortId(run.issueId) : "none"],
    ["Model", modelLabel || "none"],
    ["Started", formatDateTime(run.startedAt)],
    ["Completed", formatDateTime(run.completedAt)],
    ["Updated", formatDateTime(run.updatedAt)]
  ];
  const body = `
    <dl class="summary">
      ${summaryRows
        .map(
          ([label, value]) => `
            <div>
              <dt>${escapeHtml(label)}</dt>
              <dd>${escapeHtml(value)}</dd>
            </div>`
        )
        .join("")}
    </dl>
    ${renderRunMessage("Output summary", run.outputSummary)}
    ${renderRunMessage("Error", run.errorMessage, "error")}
    <section>
      <h2>Events</h2>
      ${renderRunEvents(run.events)}
    </section>`;

  return renderRunConsoleShell(`Run ${escapeHtml(formatShortId(run.id))}`, body);
}

function renderApprovalPanelLoadingHtml(approvalId: string, nonce: string): string {
  return renderApprovalPanelShell(
    `Approval ${escapeHtml(formatShortId(approvalId))}`,
    `<p class="muted">Loading approval...</p>`,
    nonce
  );
}

function renderApprovalPanelErrorHtml(approvalId: string, nonce: string): string {
  return renderApprovalPanelShell(
    `Approval ${escapeHtml(formatShortId(approvalId))}`,
    `<p class="error">Unable to load approval details.</p>`,
    nonce
  );
}

function renderApprovalPanelHtml(
  approval: OrchestratorApproval,
  nonce: string,
  notice?: string,
  noticeClass = "notice"
): string {
  const summaryRows = [
    ["Status", approval.status],
    ["Type", formatApprovalType(approval.type)],
    ["Risk", approval.riskScore === null ? "none" : String(approval.riskScore)],
    ["Run", approval.runId ? formatShortId(approval.runId) : "none"],
    ["Issue", approval.issueId ? formatShortId(approval.issueId) : "none"],
    ["Requested", formatDateTime(approval.createdAt)],
    ["Responded", formatDateTime(approval.respondedAt)],
    ["Updated", formatDateTime(approval.updatedAt)]
  ];
  const body = `
    ${notice ? `<p class="${escapeHtml(noticeClass)}">${escapeHtml(notice)}</p>` : ""}
    <dl class="summary">
      ${summaryRows
        .map(
          ([label, value]) => `
            <div>
              <dt>${escapeHtml(label)}</dt>
              <dd>${escapeHtml(value)}</dd>
            </div>`
        )
        .join("")}
    </dl>
    ${renderApprovalActions(approval)}
    ${renderRunMessage("Required action", approval.requiredAction)}
    ${renderRunMessage("Reason", approval.reason)}
    ${renderRunMessage("Diff summary", approval.diffSummary)}
    ${renderChangedFiles(approval.changedFiles)}
  `;

  return renderApprovalPanelShell(
    `Approval ${escapeHtml(formatShortId(approval.id))}`,
    body,
    nonce
  );
}

function renderArtifactViewerLoadingHtml(runId: string): string {
  return renderRunConsoleShell(
    `Artifacts ${escapeHtml(formatShortId(runId))}`,
    `<p class="muted">Loading artifacts...</p>`
  );
}

function renderArtifactViewerErrorHtml(runId: string): string {
  return renderRunConsoleShell(
    `Artifacts ${escapeHtml(formatShortId(runId))}`,
    `<p class="error">Unable to load artifacts.</p>`
  );
}

function renderArtifactViewerHtml(
  runId: string,
  artifactType: ArtifactType | null,
  artifacts: OrchestratorArtifact[]
): string {
  const summaryRows = [
    ["Run", formatShortId(runId)],
    ["Type", artifactType ?? "all"],
    ["Count", String(artifacts.length)]
  ];
  const body = `
    <dl class="summary">
      ${summaryRows
        .map(
          ([label, value]) => `
            <div>
              <dt>${escapeHtml(label)}</dt>
              <dd>${escapeHtml(value)}</dd>
            </div>`
        )
        .join("")}
    </dl>
    <section>
      <h2>Artifacts</h2>
      ${renderArtifacts(artifacts)}
    </section>`;

  return renderRunConsoleShell(
    `Artifacts ${escapeHtml(formatShortId(runId))}`,
    body
  );
}

function renderArtifacts(artifacts: OrchestratorArtifact[]): string {
  if (artifacts.length === 0) {
    return `<p class="muted">No artifacts found.</p>`;
  }

  return `
    <div class="events">
      ${artifacts
        .map(
          (artifact) => `
            <article class="event">
              <div class="event-header">
                <span class="event-type">${escapeHtml(formatArtifactTitle(artifact))}</span>
                <span class="event-time">${escapeHtml(formatDateTime(artifact.createdAt))}</span>
              </div>
              ${renderArtifactMetadata(artifact)}
              ${renderArtifactContent(artifact)}
              ${renderMetadata(artifact.metadata)}
            </article>`
        )
        .join("")}
    </div>`;
}

function renderArtifactMetadata(artifact: OrchestratorArtifact): string {
  const metadataRows = [
    ["ID", artifact.id],
    ["Type", artifact.type],
    ["Issue", artifact.issueId ? formatShortId(artifact.issueId) : "none"],
    ["Updated", formatDateTime(artifact.updatedAt)]
  ];

  return `
    <dl class="summary">
      ${metadataRows
        .map(
          ([label, value]) => `
            <div>
              <dt>${escapeHtml(label)}</dt>
              <dd>${escapeHtml(value)}</dd>
            </div>`
        )
        .join("")}
    </dl>
    ${artifact.uri ? `<p class="muted">${escapeHtml(artifact.uri)}</p>` : ""}`;
}

function renderArtifactContent(artifact: OrchestratorArtifact): string {
  if (!artifact.content?.trim()) {
    return artifact.uri ? "" : `<p class="muted">No inline content.</p>`;
  }

  return `<pre>${escapeHtml(artifact.content)}</pre>`;
}

function formatArtifactTitle(artifact: OrchestratorArtifact): string {
  return artifact.title?.trim() || formatApprovalType(artifact.type);
}

function renderApprovalPanelShell(
  title: string,
  body: string,
  nonce: string
): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      color-scheme: light dark;
      --border: color-mix(in srgb, currentColor 18%, transparent);
      --muted: color-mix(in srgb, currentColor 62%, transparent);
      --panel: color-mix(in srgb, currentColor 7%, transparent);
      --error: #d13438;
      --ok: #107c10;
    }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 1.45;
      margin: 0;
      padding: 20px;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
    }
    h1, h2, p, dl, dd, ul {
      margin: 0;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    h2 {
      font-size: 14px;
      font-weight: 600;
      margin: 20px 0 10px;
    }
    button {
      background: var(--vscode-button-background);
      border: 0;
      color: var(--vscode-button-foreground);
      cursor: pointer;
      font: inherit;
      margin: 0;
      padding: 6px 10px;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    button.secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    button.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1px;
      border: 1px solid var(--border);
      background: var(--border);
    }
    .summary div {
      background: var(--vscode-editor-background);
      padding: 10px;
    }
    dt {
      color: var(--muted);
      font-size: 11px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }
    dd, li {
      overflow-wrap: anywhere;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }
    .notice {
      color: var(--ok);
      margin-bottom: 12px;
    }
    .error {
      color: var(--error);
    }
    .muted {
      color: var(--muted);
    }
    ul {
      padding-left: 18px;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.querySelectorAll("[data-approval-action]").forEach((button) => {
      button.addEventListener("click", () => {
        vscode.postMessage({
          type: "approvalResponse",
          action: button.getAttribute("data-approval-action")
        });
      });
    });
  </script>
</body>
</html>`;
}

function renderApprovalActions(approval: OrchestratorApproval): string {
  if (approval.status !== "pending") {
    return `<p class="muted">Approval is ${escapeHtml(approval.status)}.</p>`;
  }

  return `
    <div class="actions">
      <button type="button" data-approval-action="approve">Approve</button>
      <button type="button" class="secondary" data-approval-action="request_changes">Request changes</button>
      <button type="button" class="secondary" data-approval-action="reject">Reject</button>
    </div>`;
}

function renderChangedFiles(changedFiles: string[]): string {
  if (changedFiles.length === 0) {
    return "";
  }

  return `
    <section>
      <h2>Changed files</h2>
      <ul>
        ${changedFiles.map((file) => `<li>${escapeHtml(file)}</li>`).join("")}
      </ul>
    </section>`;
}

function renderRunConsoleShell(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      color-scheme: light dark;
      --border: color-mix(in srgb, currentColor 18%, transparent);
      --muted: color-mix(in srgb, currentColor 62%, transparent);
      --panel: color-mix(in srgb, currentColor 7%, transparent);
      --error: #d13438;
    }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 1.45;
      margin: 0;
      padding: 20px;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
    }
    h1, h2, p, dl, dd {
      margin: 0;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    h2 {
      font-size: 14px;
      font-weight: 600;
      margin: 20px 0 10px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1px;
      border: 1px solid var(--border);
      background: var(--border);
    }
    .summary div, .event {
      background: var(--vscode-editor-background);
    }
    .summary div {
      padding: 10px;
    }
    dt {
      color: var(--muted);
      font-size: 11px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }
    dd {
      overflow-wrap: anywhere;
    }
    .events {
      display: grid;
      gap: 8px;
    }
    .event {
      border: 1px solid var(--border);
      padding: 10px;
    }
    .event-header {
      display: flex;
      gap: 8px;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .event-type {
      font-weight: 600;
    }
    .event-time, .muted {
      color: var(--muted);
    }
    pre {
      background: var(--panel);
      border: 1px solid var(--border);
      overflow: auto;
      padding: 8px;
      white-space: pre-wrap;
    }
    .error {
      color: var(--error);
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
</body>
</html>`;
}

function renderRunEvents(events: OrchestratorRunEvent[]): string {
  if (events.length === 0) {
    return `<p class="muted">No events recorded.</p>`;
  }

  return `
    <div class="events">
      ${events
        .map(
          (event) => `
            <article class="event">
              <div class="event-header">
                <span class="event-type">${escapeHtml(event.type)}</span>
                <span class="event-time">${escapeHtml(formatDateTime(event.createdAt))}</span>
              </div>
              ${renderRunMessageBody(event.message)}
              ${renderMetadata(event.metadata)}
            </article>`
        )
        .join("")}
    </div>`;
}

function renderRunMessage(
  label: string,
  message: string | null,
  className = ""
): string {
  if (!message?.trim()) {
    return "";
  }

  const classAttribute = className ? ` class="${escapeHtml(className)}"` : "";

  return `
    <section>
      <h2>${escapeHtml(label)}</h2>
      <p${classAttribute}>${escapeHtml(message)}</p>
    </section>`;
}

function renderRunMessageBody(message: string | null): string {
  if (!message?.trim()) {
    return "";
  }

  return `<p>${escapeHtml(message)}</p>`;
}

function renderMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata || Object.keys(metadata).length === 0) {
    return "";
  }

  return `<pre>${escapeHtml(JSON.stringify(metadata, null, 2))}</pre>`;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "none";
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Date(timestamp).toLocaleString();
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "\"":
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}
