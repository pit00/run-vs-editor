import {
  ExtensionContext,
  languages,
  commands,
  Disposable,
  workspace,
  window,
} from "vscode";
import { CodelensProvider } from "./CodelensProvider";
// import { Terminal } from "./Terminal";
let disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
  const codelensProvider = new CodelensProvider();

  languages.registerCodeLensProvider("*", codelensProvider);

  commands.registerCommand("direct-cmd.enableCodeLens", () => {
    workspace
      .getConfiguration("direct-cmd")
      .update("enableCodeLens", true, true);
  });

  commands.registerCommand("direct-cmd.disableCodeLens", () => {
    workspace
      .getConfiguration("direct-cmd")
      .update("enableCodeLens", false, true);
  });

  commands.registerCommand("direct-cmd.codelensAction", (args: any) => {
    // Terminal.run(args);
    var i, arr = args.split(" ")
    for (i = 0; i < arr.length; i++) {
        commands.executeCommand(arr[i]);
    }
  });
}

export function deactivate() {
  if (disposables) {
    disposables.forEach((item) => item.dispose());
  }
  disposables = [];
}
