# ChuQin Cli

ChuQin Cli provides command-line capabilities outside of the desktop application.

It is designed for direct terminal usage, shell scripting, automation workflows, and lightweight configuration checks without launching the desktop app.

The Cli shares the same configuration system as the desktop application. By default, it reads from `CHUQIN_DIR/.chuqin/config.toml`. If `CHUQIN_DIR` is not set, it falls back to the current user's home directory.

## Overview

The Cli is organized into command groups so each functional area can evolve independently. This keeps the root documentation concise while making it easier to maintain existing modules and add new ones over time.

For new Cli capabilities, the recommended pattern is:

1. Add a dedicated command group.
2. Create a dedicated document for that group when the command area has distinct options or workflows.
3. Link the new document from this page.

## Examples

- `chuqin version`: Show the installed ChuQin version.
- `chuqin pdf to-ppt ./demo.pdf`: Convert a PDF into a 16:9 PowerPoint deck.
- `chuqin ppt create "Engineering Planning"`: Create `./Engineering Planning.pptx` in the current directory.

## Command Modules

The Cli is split into top-level modules so related subcommands can be grouped under a shared namespace:

- **[gitcode](./gitcode.md)**: Commands for GitCode integrations.
- **[gitee](./gitee.md)**: Commands for Gitee integrations.
- **[outlook](./outlook.md)**: Commands for Outlook integrations.
- **[pdf](./pdf.md)**: Commands for PDF integrations.
- **[ppt](./ppt.md)**: Commands for PPT integrations.
- **[volcengine](./volcengine.md)**: Commands for VolcEngine integrations
- **[word](./word.md)**: Commands for Word integrations
