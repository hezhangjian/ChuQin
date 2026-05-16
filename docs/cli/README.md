# ChuQin CLI

ChuQin CLI provides command-line capabilities outside of the desktop application.

It supports direct terminal usage, shell scripting, automation workflows, and lightweight configuration checks without launching the desktop app.

CLI shares the same root directory resolution as the desktop application. By default, paths are resolved from `$CHUQIN_DIR`. If `CHUQIN_DIR` is not set, ChuQin falls back to the current user's home directory.

## Overview

CLI is organized into command groups.

## Examples

- `chuqin excel create "Project Tracker"`: Create `./Project Tracker.xlsx` in the current directory.
- `chuqin version`: Show the installed ChuQin version.
- `chuqin pdf to-ppt ./demo.pdf`: Convert a PDF into a 16:9 PowerPoint deck.
- `chuqin ppt create "Engineering Planning"`: Create `./Engineering Planning.pptx` in the current directory.

## Command Modules

CLI currently includes the following modules:

- **[excel](./excel.md)**: Commands for Excel integrations.
- **[gitcode](./gitcode.md)**: Commands for GitCode integrations.
- **[gitee](./gitee.md)**: Commands for Gitee integrations.
- **[outlook](./outlook.md)**: Commands for Outlook integrations.
- **[pdf](./pdf.md)**: Commands for PDF integrations.
- **[ppt](./ppt.md)**: Commands for PPT integrations.
- **[volcengine](./volcengine.md)**: Commands for VolcEngine integrations
- **[word](./word.md)**: Commands for Word integrations
