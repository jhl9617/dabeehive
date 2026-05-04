import type { ExtensionContext } from "vscode";

export function activate(context: ExtensionContext): void {
  context.subscriptions.push({
    dispose: () => undefined
  });
}

export function deactivate(): void {
  return undefined;
}
