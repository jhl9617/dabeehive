import * as vscode from "vscode";
import type { ExtensionContext } from "vscode";

const VIEW_IDS = [
  "dabeehive.views.issues",
  "dabeehive.views.runs",
  "dabeehive.views.approvals"
] as const;

const emptyTreeProvider: vscode.TreeDataProvider<never> = {
  getChildren: () => [],
  getTreeItem: (element) => element
};

export function activate(context: ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("dabeehive.refresh", () => undefined)
  );

  VIEW_IDS.forEach((viewId) => {
    context.subscriptions.push(
      vscode.window.registerTreeDataProvider(viewId, emptyTreeProvider)
    );
  });
}

export function deactivate(): void {
  return undefined;
}
