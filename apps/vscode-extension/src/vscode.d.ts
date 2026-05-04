declare module "vscode" {
  export interface Disposable {
    dispose(): unknown;
  }

  export interface ExtensionContext {
    secrets: SecretStorage;
    subscriptions: Disposable[];
  }

  export interface SecretStorage {
    delete(key: string): Thenable<void>;
    get(key: string): Thenable<string | undefined>;
    store(key: string, value: string): Thenable<void>;
  }

  export interface InputBoxOptions {
    ignoreFocusOut?: boolean;
    password?: boolean;
    prompt?: string;
  }

  export interface TreeDataProvider<T> {
    getChildren(element?: T): T[] | Thenable<T[]>;
    getTreeItem(element: T): TreeItem | Thenable<TreeItem>;
  }

  export interface TreeItem {
    collapsibleState?: TreeItemCollapsibleState;
    contextValue?: string;
    description?: string;
    label: string;
  }

  export enum TreeItemCollapsibleState {
    None = 0,
    Collapsed = 1,
    Expanded = 2
  }

  export interface StatusBarItem extends Disposable {
    command?: string;
    text: string;
    tooltip?: string;
    hide(): void;
    show(): void;
  }

  export interface WorkspaceConfiguration {
    get<T>(section: string, defaultValue: T): T;
  }

  export enum StatusBarAlignment {
    Left = 1,
    Right = 2
  }

  export type Thenable<T> = PromiseLike<T>;

  export namespace commands {
    function registerCommand(
      command: string,
      callback: (...args: unknown[]) => unknown
    ): Disposable;
  }

  export namespace window {
    function createStatusBarItem(
      id: string,
      alignment?: StatusBarAlignment,
      priority?: number
    ): StatusBarItem;

    function registerTreeDataProvider<T>(
      viewId: string,
      treeDataProvider: TreeDataProvider<T>
    ): Disposable;

    function showInformationMessage(message: string): Thenable<string | undefined>;
    function showInputBox(
      options?: InputBoxOptions
    ): Thenable<string | undefined>;
    function showWarningMessage(message: string): Thenable<string | undefined>;
  }

  export namespace workspace {
    function getConfiguration(section?: string): WorkspaceConfiguration;
  }
}
