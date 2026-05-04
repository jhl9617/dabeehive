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
    getTreeItem(element: T): T;
  }

  export type Thenable<T> = PromiseLike<T>;

  export namespace commands {
    function registerCommand(
      command: string,
      callback: (...args: unknown[]) => unknown
    ): Disposable;
  }

  export namespace window {
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
}
