import {
  ExtensionContext,
  languages,
  commands,
  Disposable,
  workspace,
  window,
} from "vscode";
import { CodelensProvider } from "./CodelensProvider";

let disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
  const codelensProvider = new CodelensProvider();

  languages.registerCodeLensProvider("*", codelensProvider);

  commands.registerCommand("commaned-runner.enableCodeLens", () => {
    workspace
      .getConfiguration("commaned-runner")
      .update("enableCodeLens", true, true);
  });

  commands.registerCommand("commaned-runner.disableCodeLens", () => {
    workspace
      .getConfiguration("commaned-runner")
      .update("enableCodeLens", false, true);
  });

  commands.registerCommand("commaned-runner.codelensAction", (args: any) => {
    window.showInformationMessage(`CodeLens action clicked with args=${args}`);
  });
}

export function deactivate() {
  if (disposables) {
    disposables.forEach((item) => item.dispose());
  }
  disposables = [];
}
