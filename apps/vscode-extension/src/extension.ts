import * as vscode from "vscode";
import type { ExtensionContext, Thenable } from "vscode";

import { OrchestratorClient } from "./orchestratorClient";
import type {
  OrchestratorIssue,
  OrchestratorProject
} from "./orchestratorClient";

const VIEW_IDS = [
  "dabeehive.views.issues",
  "dabeehive.views.runs",
  "dabeehive.views.approvals"
] as const;
const API_TOKEN_SECRET_KEY = "dabeehive.apiToken";
const DEFAULT_SERVER_URL = "http://127.0.0.1:3000";
const REFRESH_COMMAND = "dabeehive.refresh";

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
  constructor(private readonly createClient: () => Promise<OrchestratorClient>) {}

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

export function activate(context: ExtensionContext): void {
  const statusBarItem = createConnectionStatusBarItem();
  setConnectionStatus(statusBarItem, "disconnected");
  context.subscriptions.push(statusBarItem);
  const projectsIssuesTreeProvider = new ProjectsIssuesTreeProvider(() =>
    createOrchestratorClient(context)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(REFRESH_COMMAND, () =>
      refreshOrchestrator(context, statusBarItem)
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

  VIEW_IDS.forEach((viewId) => {
    if (viewId === "dabeehive.views.issues") {
      context.subscriptions.push(
        vscode.window.registerTreeDataProvider(viewId, projectsIssuesTreeProvider)
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

async function refreshOrchestrator(
  context: ExtensionContext,
  statusBarItem: vscode.StatusBarItem
): Promise<void> {
  try {
    const client = await createOrchestratorClient(context);
    const health = await client.getHealth();
    setConnectionStatus(statusBarItem, "connected");
    await vscode.window.showInformationMessage(
      `Dabeehive orchestrator is ${health.status}.`
    );
  } catch {
    setConnectionStatus(statusBarItem, "disconnected");
    await vscode.window.showWarningMessage("Dabeehive orchestrator request failed.");
  }
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
