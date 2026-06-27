# Run VS Commands from Editor

Run VS code internal commands directly from editor by click or hotkey

## Requirements

- Visual Studio Code 1.48+

## How to Use

- Only tested on Windows

- By default the extention is enabled, you can toggle it using the command palette. Trigger the command palette (Ctrl / Cmd + Shift + P) -> Command Runner: Enable / Disable.

### Cmds

1. Once it is enabled, above every line that contains the symbols '$>' followed by a code snipped (between `single quotes`) appears a button to execute the command (or run the current line or nearest cursor line by `alt+j` key), like:

```
$> `cursorDown`
```

2. Also can run multiple commands, separated by "|":

```
$> `cursorUp|cursorUp|cursorUp`
```

3. With arguments `cmd("arg")`

4. With arguments and eval ("vscode" inside eval will be converted to "vscode_1" internaly, to fix scope issues)

```
cmd[eval("arg")]
$> `vscode.open[vscode_1.Uri.file("C:/Folder/File.txt")]`
$> `vscode.open[vscode.Uri.file("C:/Folder/File.txt")]`
```

5. Eval commands and see their values at toast notification and console log `eval(cmd)`

```
$> `eval(vscode.window.activeTextEditor.document.fileName)`
$> `eval(vscode_1.workspace.workspaceFolders)`
$> `eval(1 + 2)`
```

### Aliases

1. Open file alias. Works with relative path `opener("FILEPATH")`

```
$> `opener("C:/Folder/File.txt")`
```

2. Reveal at explorer alias `revealer("PATH")`

```
$> `revealer("C:/Folder/")`
$> `revealer("C:/Folder/File.txt")`
```

3. For both reveal or open: works with relative path and wildcard (* at the end will open the closest match in case of file or folder, other cases the last slash is optional)

```
$> `opener("./../../../Folder/File.txt")`
$> `revealer("C:/Users/p*")`
```

4. Environmental variables also works.
* VS Code: `${key:value}`
* Win: `%var%`

```
$> `eval("${config:workbench.colorTheme}")`
$> `opener("%ComSpec%")`
$> `revealer("%APPDATA%")`
$> `revealer("${env:USERPROFILE}")`
```

5. Copy to clipboard

```
$> `copy("TEXT")`
```

<!-- ⠐TODO⠂
* Add file line anchor (# or :)
* Test eval log for improve
* Wsl/unix fix
* mult %USERPROFILE% problem?
-->
