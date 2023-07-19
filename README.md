# Run VS Commands from Editor

Run VS code internal commands directly from editor by click

## Requirements

- Visual Studio Code 1.48+

## How to Use

- By default the extention is enabled, you can toggle it using the command palette. Trigger the command palette (Ctrl / Cmd + Shift + P) -> Command Runnder: Enable / Disable.
- Once it is enabled, above every line that contains the symbols '$>' followed by a code snipped (e.g. run `npm -V`) appears a button to execute the command, like:
```
$> `cursorDown`
```
- Also can run multiple commands, separated by space:
```
$> `cursorUp cursorUp cursorUp`
```
