declare module "vscode" {
  export interface Disposable {
    dispose(): unknown;
  }

  export interface ExtensionContext {
    subscriptions: Disposable[];
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
  }
}
