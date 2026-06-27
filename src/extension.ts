import * as vscode from "vscode";
import { CodelensProvider } from "./CodelensProvider";
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as os from 'os';
import * as pathModule from 'path';
import { log } from "console";
// import { Terminal } from "./Terminal"; // Terminal.run(args);

function selectNearest(){
    let full = vscode.window.activeTextEditor?.document.getText();
    let runRegex = /\$> `(.*?)`/ig;
    
    let matchedLines = full!.split(/^/gm).map((v, i) => v.match(runRegex) ? i + 1 : 0).filter(a => a);
    
    // matches[0].match(/`(.*)`/)![1];
    if(matchedLines.length === 0){
        vscode.window.showErrorMessage("Commands not found!");
    }
    else{
        let cursorPos = vscode.window.activeTextEditor!.selection.active.line + 1;
        let closest: number;
        
        if (matchedLines.includes(cursorPos)){
            closest = cursorPos;
        }
        else if (matchedLines.includes(cursorPos + 1)){ // bellow priority (&& !matchedLines.includes(cursorPos))
            closest = cursorPos + 1;
        }
        else { // nearest (above priority)
            closest = matchedLines.reduce(function(prev, curr) {
                return (Math.abs(curr - cursorPos!) < Math.abs(prev - cursorPos!) ? curr : prev);
            });
        }
        
        let matchIndex = matchedLines.indexOf(closest);
        let cmdText = full?.match(runRegex)![matchIndex];
        let cmds = cmdText?.match(/`(.*)`/)![1];
        cmdLoop(cmds);
    }
}

function pathFix(path: any, type: number) {
    const fileUri = vscode.window.activeTextEditor?.document.uri;
    if (fileUri) {
        const baseDir = pathModule.dirname(fileUri.fsPath);
        path = pathModule.resolve(baseDir, path);
        path = pathModule.normalize(path);
    }
    
    if (type === 3) {
        const userProfile = vscodeVariables("${env:USERPROFILE}");
        const baseName = pathModule.basename(path); // <- only take last part
        path = `${userProfile}/.vscode-insiders/extensions/${baseName}`;
    }
    
    // With wildcard
    if (path.includes("*")){
        // if (path.split("*").length > 1) {
        path = path.replace(/\\/g, "/");
        let pwd = path?.split("/");
        let match = pwd?.pop();
        pwd = pwd?.join("/");
        
        // Find all files and folders in the directory
        let entries = fs.readdirSync(pwd + "/", { withFileTypes: true })
            .map(item => item.name);
        // Find the first entry (file or folder) that matches the prefix before '*', case-insensitive
        let searchPrefix = match.split("*")[0].toLowerCase();
        let partial = entries.find(element => element.toLowerCase().includes(searchPrefix)); // work beyound the prefix
        // console.log("CommandService#executeCommandDEV ❯", entries);
        // console.log("CommandService#executeCommandDEV ❯", partial);
        
        if(partial === undefined){ // If not found, check for folders
            let folders = fs.readdirSync(pwd + "/", {withFileTypes: true})
                .filter(item => item.isDirectory())
                .map(item => item.name);
            partial = folders.find(element => element.includes(match.split("*")[0]));
        }
        
        // Set path to the resolved match
        path = pwd + "/" + partial + "/";
    }
    
    if(type === 1){ // file
        vscode.commands.executeCommand("vscode.open", vscode.Uri.file(path));
    }
    
    if(type === 2 || type === 3){ // path
        // Check if path is a file or directory
        let stat: any;
        try {
            stat = fs.statSync(path);
        } catch (e) {
            // fallback if path does not exist
            vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(path));
            return;
        }
        
        if (stat.isFile()) {
            // If it's a file, reveal the file in OS
            vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(path));
        } else {
            // Cross-platform open folder directly
            const platform = os.platform();
            if (platform === 'win32') {
                path = path.replace(/\//g, "\\");
                child_process.exec(`explorer "${path}"`);
            } else if (platform === 'darwin') {
                child_process.exec(`open "${path}"`);
            } else if (platform === 'linux') {
                child_process.exec(`xdg-open "${path}"`);
            } else {
                // fallback to VSCode's revealFileInOS if OS is unknown
                vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(path));
            }
        }
    }
    // if(type === 3){ // vsce
    //     vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(path + "/package.json"));
    // }
}

function cmdLoop(cmds: any){
    var cmd = cmds.split("|");
    
    for(let i = 0; i < cmd.length; i++){
        // cmdLoop(arr[i]);
        // console.log("CommandService#executeCommand ❯", cmd[i]);
        
        // With env var (VS syntax)
        if(cmd[i].split("${").length > 1){
            cmd[i] = cmd[i].replace(/\${.*?}/g, function(matched: any){
                return(vscodeVariables(matched));
            });
        }
        // With env var (Windows syntax)
        if(cmd[i].split("%").length > 1){
            // /(?<=\%).*?(?=\%)/
            cmd[i] = cmd[i].replace(/\%(.*?)\%/g, function(_: any, group1: any){
                return(vscodeVariables("${env:" + group1 + "}"));
            });
        }
        // With eval - without quotes
        if(cmd[i].split("eval(")[0] === ""){
            var cmdEval = cmd[i].split("eval(")[1].split(")")[0];
            // cmdEval = cmdEval.replace(/vscode\./g, "vscode_1.");
            var out = eval(cmdEval);
            if(typeof out === "object"){
                console.log("CommandService#executeCommand ❯", out);
                vscode.window.showWarningMessage("Check console");
                // vscode.window.showInformationMessage(String(Object.keys(out)));
            }
            else if(typeof out === "string"){
                console.log("CommandService#executeCommand ❯", [out]);
                vscode.window.showInformationMessage(out);
            }
            else {
                console.log("CommandService#executeCommand ❯", out);
                vscode.window.showInformationMessage(String(out));
            }
        } // Full path file alias
        else if(cmd[i].split("opener(\"")[0] === ""){
            pathFix(cmd[i].split("opener(\"")[1].split("\")")[0], 1);
        } // Reveal path/file alias
        else if(cmd[i].split("revealer(\"")[0] === ""){
            pathFix(cmd[i].split("revealer(\"")[1].split("\")")[0], 2);
        } // Internal
        else if (cmd[i].split("vsce(\"")[0] === "") {
            pathFix(cmd[i].split("vsce(\"")[1].split("\")")[0], 3);
        } // Copy alias
        else if (cmd[i].split("copy(\"")[0] === "") {
            let cop = cmd[i].split("copy(\"")[1].split("\")")[0];
            vscode.env.clipboard.writeText(`${cop}`);
            vscode.window.showInformationMessage('Copied to clipboard 📎');
        } // With arguments and eval
        else if(cmd[i] !== cmd[i].split("]")[0]){
            let func = cmd[i].split("]")[0].split("[");
            // func[1] = func[1].replace(/vscode\./g, "vscode_1.");
            vscode.commands.executeCommand(func[0], eval(func[1]));
        } // With arguments
        else if(cmd[i] !== cmd[i].split("\")")[0]){
            let funcs = cmd[i].split("\")")[0].split("(\"");
            vscode.commands.executeCommand(funcs[0], funcs[1]);
        } // Common
        else{
            vscode.commands.executeCommand(cmd[i]);
        }
    }
}

function vscodeVariables(input: string, recursive = false): string {
    const editor = vscode.window.activeTextEditor;
    const document = editor?.document;
    
    const absoluteFilePath = document?.uri.fsPath ?? "";
    const parsed = absoluteFilePath ? pathModule.parse(absoluteFilePath) : undefined;
    
    const workspaces = vscode.workspace.workspaceFolders ?? [];
    
    // Real workspace or virtual workspace (parent folder of active file)
    const virtualWorkspace = absoluteFilePath ? {
        uri: {fsPath: pathModule.dirname(absoluteFilePath)},
        name: pathModule.basename(pathModule.dirname(absoluteFilePath)),
    } : undefined;
    
    let ws = workspaces[0] ?? virtualWorkspace;
    
    // Determine which workspace contains the file
    let activeWorkspace = ws;
    let relativeFile = absoluteFilePath;
    
    for (const ws of workspaces) {
        if (
            absoluteFilePath === ws.uri.fsPath ||
            absoluteFilePath.startsWith(ws.uri.fsPath + pathModule.sep)
        ) {
            activeWorkspace = ws;
            break;
        }
    }
    
    if (activeWorkspace && absoluteFilePath) {
        relativeFile = pathModule.relative(activeWorkspace.uri.fsPath, absoluteFilePath);
    }
    
    let output = input;
    
    output = output.replace(/\${workspaceFolder}/g, ws?.uri.fsPath ?? "");
    output = output.replace(/\${workspaceFolderBasename}/g, ws?.name ?? "");
    output = output.replace(/\${file}/g, absoluteFilePath);
    output = output.replace(/\${fileWorkspaceFolder}/g, activeWorkspace?.uri.fsPath ?? "");
    output = output.replace(/\${relativeFile}/g, relativeFile);
    output = output.replace(/\${relativeFileDirname}/g, pathModule.dirname(relativeFile));
    output = output.replace(/\${fileBasename}/g, parsed?.base ?? "");
    output = output.replace(/\${fileBasenameNoExtension}/g, parsed?.name ?? "");
    output = output.replace(/\${fileExtname}/g, parsed?.ext ?? "");
    output = output.replace(/\${fileDirname}/g, parsed ? pathModule.basename(parsed.dir) : "");
    output = output.replace(/\${cwd}/g, parsed?.dir ?? "");
    output = output.replace(/\${pathSeparator}/g, pathModule.sep);
    output = output.replace(/\${lineNumber}/g, String((editor?.selection.start.line ?? -1) + 1).replace(/^0$/, ""));
    output = output.replace(
        /\${selectedText}/g,
        editor
            ? document!.getText(new vscode.Range(editor.selection.start, editor.selection.end))
            : ""
    );
    
    output = output.replace(/\${env:(.*?)}/g, (_, name) => process.env[name] ?? "");
    
    output = output.replace(/\${config:(.*?)}/g, (_, name) =>
        String(vscode.workspace.getConfiguration().get(name, ""))
    );
    
    if(
        recursive &&
        /\${(workspaceFolder|workspaceFolderBasename|fileWorkspaceFolder|relativeFile|fileBasename|fileBasenameNoExtension|fileExtname|fileDirname|cwd|pathSeparator|lineNumber|selectedText|env:.*?|config:.*?)}/.test(output)
    ){
        return vscodeVariables(output, true);
    }
    
    return output;
}

export function activate() {
    const codelensProvider = new CodelensProvider();
    
    vscode.languages.registerCodeLensProvider("*", codelensProvider);
    
    vscode.commands.registerCommand("direct-cmd.enableCodeLens", () => {
        vscode.workspace.getConfiguration("direct-cmd").update("enableCodeLens", true, true);
    });
    
    vscode.commands.registerCommand("direct-cmd.disableCodeLens", () => {
        vscode.workspace.getConfiguration("direct-cmd").update("enableCodeLens", false, true);
    });
    
    vscode.commands.registerCommand("direct-cmd.run", () => {
        selectNearest();
    });
    
    vscode.commands.registerCommand("direct-cmd.codelensAction", (args: any) => {
        cmdLoop(args);
    });
}

// export function deactivate() {
//     if (disposables) {
//         disposables.forEach((item) => item.dispose());
//     }
//     disposables = [];
// }
