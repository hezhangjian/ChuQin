# AGENTS.md

## Project Overview

ChuQin is a local-first desktop app for managing a PARA-oriented filesystem root.

The primary product surface is the Tauri desktop app. The CLI is a selective companion surface for capabilities that are
naturally useful from a terminal, shell script, or automation workflow. It is not expected to expose every desktop
feature.

This repository is organized as:

- `core/`: shared Rust library for ChuQin-root context, file/document/PPT/PDF logic, OOXML helpers, and path handling.
- `cli/`: selective Rust CLI built with `clap`, depending on `chuqin-core`. Add CLI commands only when the capability
  makes sense outside the GUI.
- `desktop/`: Tauri v2 desktop backend, depending on `chuqin-core`.
- `ui/`: React + TypeScript frontend for the desktop app.
- `docs/`: product and command documentation.
  - `docs/commands/`: Tauri command documentation. Update when adding/modifying Tauri commands in `desktop/src/commands/`.
  - `docs/cli/`: CLI documentation. Update when adding/modifying CLI commands in `cli/src/`.
  - `docs/ui/`: UI component documentation.

## Code Style

- All code comments must be written in English.
- Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) specification:
  - Format: `<type>(<scope>): <description>`
  - Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`
  - Example: `feat(core): add zip utilities for archive operations`
