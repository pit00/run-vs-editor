# Run VS Commands from Editor

Run VS code internal commands directly from editor by click or hotkey

## Requirements

- Visual Studio Code 1.48+

## How to Use

- Only tested on Windows

- By default the extention is enabled, you can toggle it using the command palette. Trigger the command palette (Ctrl / Cmd + Shift + P) -> Command Runner: Enable / Disable.

- Once it is enabled, above every line that contains the symbols '$>' followed by a code snipped appears a button to execute the command (or run the current line or nearest cursor line by `alt+j` key), like:
```
$> `cursorDown`
```

- With arguments
```
cmd("arg")
```

- With arguments and eval ("vscode_1" for not global "vscode" commands)
```
cmd[eval("arg")]
$> `vscode.open[vscode_1.Uri.file("C:/Folder/File.txt")]`
```

- Eval commands and see their values at toast notification and console log
```
eval(cmd)
$> `eval(vscode_1.window.activeTextEditor.document.fileName)`
```

- Also can run multiple commands, separated by "|":
```
$> `cursorUp|cursorUp|cursorUp`
```

- Open file alias. Works with relative path
```
opener("FILEPATH")
$> `opener("C:/Folder/File.txt")`
```

- Reveal at explorer alias
```
revealer("PATH")
$> `revealer("C:/Folder/")`
$> `revealer("C:/Folder/File.txt")`
```

- For both reveal or open: works with relative path and wildcard (* at the end will open the closest match in case of file or folder, other cases the last slash is optional)
```
$> `opener("./../../../Folder/File.txt")`
$> `revealer("C:/Users/P*")`
```

- Environmental variables also works (in all cases, will be substituted by the corresponding value)
```
$> `opener("${config:path}")`
$> `revealer("${env:USERPROFILE}")`
$> `revealer("%APPDATA%")`
```

<!-- ⠐TODO⠂
* Add file line anchor (# or :)
* Test eval log for improve
* Wsl/unix fix
* mult %USERPROFILE% problem?
-->
