import {
    ExtensionContext,
    languages,
    commands,
    env,
    // Disposable,
    workspace,
    Uri,
    window
    // Selection
} from "vscode";
import { CodelensProvider } from "./CodelensProvider";
// let disposables: Disposable[] = [];
// import { Terminal } from "./Terminal"; // Terminal.run(args);
const vscodeVariables = require('vscode-variables');
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as os from 'os';
// import * as pathModule from 'path';


function selectNearest(){
    let full = window.activeTextEditor?.document.getText();
    let runRegex = /\$> `(.*?)`/ig;
    
    let matchedLines = full!.split(/^/gm).map((v, i) => v.match(runRegex) ? i + 1 : 0).filter(a => a);
    
    // matches[0].match(/`(.*)`/)![1];
    
    if(matchedLines.length === 0){
        window.showErrorMessage("Commands not found!");
    }
    else{
        let cursorPos = window.activeTextEditor!.selection.active.line + 1;
        let closest;
        
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

export function pathFix(path, type) {
    if (path.split("./")[0] === ""){
        let pathLen = path.split("./").length - 1;
        
        let local = window.activeTextEditor?.document.uri.path;
        let localAux = local?.split("/");
        
        for (let i = 0; i < pathLen; i++) {
            localAux?.pop();
        }
        
        path = localAux?.join("/") + "/" + path.split("./")[pathLen];
    }
    
    // With wildcard
    if (path.split("*").length > 1) {
        if(type === 3){
            path = vscodeVariables("${env:USERPROFILE}") + "/.vscode-insiders/extensions/" + path;
        }
        path = path.replace(/\\/g, "/");
        let pwd = path?.split("/");
        let match = pwd?.pop();
        pwd = pwd?.join("/");

        // Find all files and folders in the directory
        let entries = fs.readdirSync(pwd + "/", { withFileTypes: true })
            .map(item => item.name);
        // Find the first entry (file or folder) that matches the prefix before '*', case-insensitive
        let searchPrefix = match.split("*")[0].toLowerCase();
        let partial = entries.find(element => element.toLowerCase().includes(searchPrefix));

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
        commands.executeCommand("vscode.open", Uri.file(path));
    }
    if(type === 2 || type === 3){ // path
        // Check if path is a file or directory
        let stat;
        try {
            stat = fs.statSync(path);
        } catch (e) {
            // fallback if path does not exist
            commands.executeCommand("revealFileInOS", Uri.file(path));
            return;
        }

        if (stat.isFile()) {
            // If it's a file, reveal the file in OS
            commands.executeCommand("revealFileInOS", Uri.file(path));
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
                commands.executeCommand("revealFileInOS", Uri.file(path));
            }
        }
    }
    // if(type === 3){ // vsce
    //     commands.executeCommand("revealFileInOS", Uri.file(path + "/package.json"));
    // }
}

function cmdLoop(cmds){
    // console.log("CommandService#executeCommandDEV ❯", cmds);
    var cmd = cmds.split("|");
    
    for(let i = 0; i < cmd.length; i++){
        // cmdLoop(arr[i]);
        // console.log("CommandService#executeCommand ❯", cmd[i]);
        
        // With env var (VS syntax)
        if(cmd[i].split("${").length > 1){
            cmd[i] = cmd[i].replace(/\${.*?}/g, function(matched){return(vscodeVariables(matched));});
        }
        // With env var (Windows syntax)
        if(cmd[i].split("%").length > 1){
            // /(?<=\%).*?(?=\%)/
            cmd[i] = cmd[i].replace(/\%(.*?)\%/g, function(matched, group1){
                return(vscodeVariables("${env:" + group1 + "}"));
            });
        }
        
        // With eval - without quotes
        if(cmd[i].split("eval(")[0] === ""){
            var cmdEval = cmd[i].split("eval(")[1].split(")")[0];
            var out = eval(cmdEval);
            if(typeof out === "object"){
                console.log("CommandService#executeCommand ❯", Object.keys(out));
                window.showInformationMessage(String(Object.keys(out)));
            }
            else if(typeof out === "string"){
                console.log("CommandService#executeCommand ❯", [out]);
                window.showInformationMessage(String(out));
            }
            else {
                console.log("CommandService#executeCommand ❯", out);
                window.showInformationMessage(String(out));
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
            env.clipboard.writeText(`${cop}`);
            window.showInformationMessage('Copied to clipboard 📎');
        } // With arguments and eval
        else if(cmd[i] !== cmd[i].split("]")[0]){
            let func = cmd[i].split("]")[0].split("[");
            commands.executeCommand(func[0], eval(func[1]));
        } // With arguments
        else if(cmd[i] !== cmd[i].split("\")")[0]){
            let funcs = cmd[i].split("\")")[0].split("(\"");
            commands.executeCommand(funcs[0], funcs[1]);
        } // Common
        else{
            commands.executeCommand(cmd[i]);
        }
    }
}

export function activate(context: ExtensionContext) {
    const codelensProvider = new CodelensProvider();
    
    languages.registerCodeLensProvider("*", codelensProvider);
    
    commands.registerCommand("direct-cmd.enableCodeLens", () => {
        workspace.getConfiguration("direct-cmd").update("enableCodeLens", true, true);
    });
    
    commands.registerCommand("direct-cmd.disableCodeLens", () => {
        workspace.getConfiguration("direct-cmd").update("enableCodeLens", false, true);
    });
    
    commands.registerCommand("direct-cmd.run", () => {
        selectNearest();
    });
    
    commands.registerCommand("direct-cmd.codelensAction", (args: any) => {
        cmdLoop(args);
    });
}

// export function deactivate() {
//     if (disposables) {
//         disposables.forEach((item) => item.dispose());
//     }
//     disposables = [];
// }
