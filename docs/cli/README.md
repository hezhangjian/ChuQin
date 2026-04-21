# ChuQin Cli

ChuQin CLI provides command-line capabilities outside of the desktop application.

It is designed for direct terminal usage, shell scripting, automation workflows, and lightweight configuration checks without launching the desktop app.

The CLI shares the same configuration system as the desktop application. By default, it reads from `CHUQIN_DIR/.chuqin/config.toml`. If `CHUQIN_DIR` is not set, it falls back to the current user's home directory.

## Overview

The CLI is organized into command groups so each functional area can evolve independently. This keeps the root documentation concise while making it easier to maintain existing modules and add new ones over time.

For new CLI capabilities, the recommended pattern is:

1. Add a dedicated command group.
2. Create a dedicated document for that group.
3. Link the new document from this page.

## Examples

- `chuqin version`: Show the installed ChuQin version.

## Command Modules

The CLI is split into top-level modules so related subcommands can be grouped under a shared namespace:

- **[gitee](./gitee.md)**: Commands for Gitee integrations.
- **[volcengine](./volcengine.md)**: Commands for VolcEngine integrations
