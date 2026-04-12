# ChuQin Cli

ChuQin Cli provides command-line capabilities outside of the desktop application.

It is designed for direct terminal usage, shell scripting, automation workflows, and lightweight configuration checks without launching the desktop app.

The Cli shares the same configuration system as the desktop application. By default, it reads from `CHUQIN_DIR/.chuqin/config.toml`. If `CHUQIN_DIR` is not set, it falls back to the current user's home directory.

## Overview

The Cli is organized into command groups so each functional area can evolve independently. This keeps the root documentation concise while making it easier to maintain existing modules and add new ones over time.

For new Cli capabilities, the recommended pattern is:

1. Add a dedicated command group.
2. Document the command where it is easiest for users to find it.
3. Split details into a dedicated page only when the command area grows large enough to need it.

## Examples

- `chuqin version`: Show the installed ChuQin version.
- `chuqin ppt create "AI辅助研发规划"`: Create `./AI辅助研发规划.pptx` in the current directory.
- `chuqin pdf to-ppt ./demo.pdf`: Convert a PDF into a 16:9 PowerPoint deck.

## Command Modules

The Cli is split into top-level modules so related subcommands can be grouped under a shared namespace:

- **[gitcode](./gitcode.md)**: Commands for GitCode integrations.
- **[gitee](./gitee.md)**: Commands for Gitee integrations.
- **[pdf](./pdf.md)**: Commands for converting PDF files into PowerPoint decks.
- **[volcengine](./volcengine.md)**: Commands for VolcEngine integrations

## PPT

Use `chuqin ppt create` to quickly create a starter PowerPoint deck.

Example:

```bash
chuqin ppt create "AI辅助研发规划"
```

This creates `./AI辅助研发规划.pptx` in the current directory. The command uses the provided title as both the cover title and the default output filename stem.

Useful options:

- `-o, --output`: Write the deck to a custom `.pptx` path.
- `--overwrite`: Replace an existing destination file.
- `--template`: Use a custom template directory or an existing `.pptx` file.

Default template lookup:

- `CHUQIN_DIR/.chuqin/ppt/templates/default`

If the default template directory does not exist, ChuQin falls back to a small built-in style so `chuqin ppt create "<title>"` still works immediately.
