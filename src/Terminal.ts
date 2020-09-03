import * as vscode from "vscode";

export class Terminal {
  static termName: string = "Command Runner";
  static term: vscode.Terminal | undefined;

  static _term() {
    if (!Terminal.term) {
      Terminal.term = vscode.window.createTerminal(Terminal.termName);
      Terminal.term.show(true);

      // if user closes the terminal, delete our reference:
      vscode.window.onDidCloseTerminal((event) => {
        if (Terminal._term() && event.name === Terminal.termName) {
          Terminal.term = undefined;
        }
      });
    }
    return Terminal.term;
  }

  static run(command: string) {
    Terminal._term().sendText(command, true);
  }

  static dispose() {
    if (Terminal._term()) {
      Terminal._term().dispose();
      Terminal.term = undefined;
    }
  }
}
