import {
  ExtensionContext,
  languages,
  commands,
  Disposable,
  workspace,
  window,
} from "vscode";
import { CodelensProvider } from "./CodelensProvider";
import { Terminal } from "./Terminal";

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
    Terminal.run(args);
  });
}

export function deactivate() {
  if (disposables) {
    disposables.forEach((item) => item.dispose());
  }
  disposables = [];
}
