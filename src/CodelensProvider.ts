import * as vscode from "vscode";

export class CodelensProvider implements vscode.CodeLensProvider {
  private codeLenses: vscode.CodeLens[] = [];
  private regex: RegExp;
  private _onDidChangeCodeLenses: vscode.EventEmitter<
    void
  > = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this
    ._onDidChangeCodeLenses.event;

  constructor() {
    this.regex = /run `(.*?)`/g;

    vscode.workspace.onDidChangeConfiguration((_) => {
      this._onDidChangeCodeLenses.fire();
    });
  }

  public provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    if (
      vscode.workspace
        .getConfiguration("commaned-runner")
        .get("enableCodeLens", true)
    ) {
      this.codeLenses = [];
      const regex = new RegExp(this.regex);
      const text = document.getText();
      let matches;
      while ((matches = regex.exec(text)) !== null) {
        const line = document.lineAt(document.positionAt(matches.index).line);
        const indexOf = line.text.indexOf(matches[0]);
        const position = new vscode.Position(line.lineNumber, indexOf);
        const range = document.getWordRangeAtPosition(
          position,
          new RegExp(this.regex)
        );
        if (range) {
          const run: string = matches[0].match(/`(.*)`/)![1];
          const runText: string =
            run.length > 15 ? `${run.substring(0, 15)}...` : run;
          const command: vscode.Command = {
            title: `Run \`${runText}\` in the terminal`,
            tooltip: `Run \`${run}\``,
            command: "commaned-runner.codelensAction",
            arguments: [run, false],
          };
          this.codeLenses.push(new vscode.CodeLens(range, command));
        }
      }
      return this.codeLenses;
    }
    return [];
  }
}
