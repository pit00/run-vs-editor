import {
    ExtensionContext,
    languages,
    commands,
    Disposable,
    workspace,
    Uri,
    window,
} from "vscode";
import { CodelensProvider } from "./CodelensProvider";
// import { Terminal } from "./Terminal"; // Terminal.run(args);
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
        var i, arr = args.split("|");
        for (i = 0; i < arr.length; i++) {
            // With eval - without quotes
            if(arr[i].split("eval(")[0] === ""){
                var cmd = arr[i].split("eval(")[1].split(")")[0];
                var out = eval(cmd);
                if(typeof out === "object"){
                    console.log("CommandService#executeCommand [LOG] " + Object.keys(out));
                    window.showInformationMessage(String(Object.keys(out)));
                }
                else {
                    console.log("CommandService#executeCommand [LOG] " + out);
                    window.showInformationMessage(String(out));
                }
            }
            // Full path file alias
            else if (arr[i].split("opener(\"")[0] === "") {
                let path = arr[i].split("opener(\"")[1].split("\")")[0];
                
                if (path.split("./")[0] === ""){
                    let local = window.activeTextEditor?.document.uri.path;
                    var localAux = local?.split("/");
                    localAux?.pop();
                    path = localAux?.join("/") + "/" + path.split("./")[1];
                }
                
                commands.executeCommand("vscode.open", Uri.file(path));
            }
            // Reveal path/file alias
            else if (arr[i].split("revealer(\"")[0] === "") {
                let path = arr[i].split("revealer(\"")[1].split("\")")[0];
                
                if (path.split("./")[0] === ""){
                    let local = window.activeTextEditor?.document.uri.path;
                    var localAux = local?.split("/");
                    localAux?.pop();
                    path = localAux?.join("/") + "/" + path.split("./")[1];
                }
                
                commands.executeCommand("revealFileInOS", Uri.file(path));
            }
            // With arguments and eval
            else if(arr[i] !== arr[i].split("]")[0]){
                let func = arr[i].split("]")[0].split("[");
                commands.executeCommand(func[0], eval(func[1]));
            }
            // With arguments
            else if(arr[i] !== arr[i].split("\")")[0]){
                let funcs = arr[i].split("\")")[0].split("(\"");
                commands.executeCommand(funcs[0], funcs[1]);
            }
            // Common
            else {
                commands.executeCommand(arr[i]);
            }
        }
    });
}

export function deactivate() {
    if (disposables) {
        disposables.forEach((item) => item.dispose());
    }
    disposables = [];
}
