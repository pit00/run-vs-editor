# Run VS Commands from Editor

Run VS code internal commands directly from editor by click or hotkey

## Requirements

- Visual Studio Code 1.48+

## How to Use

- Only tested on Windows

- By default the extention is enabled, you can toggle it using the command palette. Trigger the command palette (Ctrl / Cmd + Shift + P) -> Command Runner: Enable / Disable.

### Cmds

1. Once it is enabled, above every line that contains the symbols `$>` followed by a code snipped (between \``backticks`\`) appears a button to execute the command (or run the current line or nearest cursor line by `alt+j` key), like:

```
$> `cursorDown`
```

2. Also can run multiple commands, separated by "|":

```
$> `cursorUp|cursorUp|cursorUp`
```

<!-- 3. With arguments `cmd("arg")` -->

3. With arguments + eval `cmd[eval("arg")]`

```
$> `vscode.open[vscode.Uri.file("C:/Folder/File.txt")]`
```

4. Eval commands and see their values at toast notification and console log `eval(cmd)`

```
$> `eval(vscode.window.activeTextEditor.document.fileName)`
$> `eval(vscode.workspace.workspaceFolders)`
$> `eval(1 + 2)`
```

### Aliases

1. Open file (works with line #anchor) or folder (at VS Code) alias `opener("FILEPATH")`

```
$> `opener("File.txt#5")`
$> `opener("C:/")`
```

2. Reveal at explorer alias `revealer("PATH")`

```
$> `revealer("C:/Folder/")`
$> `revealer("C:/Folder/File.txt")`
```

3. For both reveal or open: path must exist, the last slash is optional, works with relative path or wildcard (* at the end will open the closest match in case of file or folder)

```
$> `opener("./../../../Folder/File.txt")`
$> `revealer("C:/Users/lic*")`
$> `opener("C:/Users/Des*")`
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
* Wsl/unix fix
* mult %USERPROFILE% problem?
* terminal alias
-->
