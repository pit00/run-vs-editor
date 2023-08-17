# Run VS Commands from Editor

Run VS code internal commands directly from editor by click

## Requirements

- Visual Studio Code 1.48+

## How to Use

- By default the extention is enabled, you can toggle it using the command palette. Trigger the command palette (Ctrl / Cmd + Shift + P) -> Command Runnder: Enable / Disable.
- Once it is enabled, above every line that contains the symbols '$>' followed by a code snipped appears a button to execute the command, like:
```
$> `cursorDown`
```
- With arguments
```
cmd("arg")
```
<!-- $> `` -->
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
- Reveal at explorer alias (last slash is optional). Works with relative path
```
revealer("PATH")
$> `revealer("C:/Folder/")`
$> `revealer("C:/Folder/File.txt")`
```
<!--⠐TODO⠂
Add anchor (# or :)
relative path with more depth (../../...)
wsl/unix fix
-->
