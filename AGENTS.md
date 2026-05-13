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
  - `docs/cli/`: CLI documentation. Update when adding/modifying CLI commands in `cli/src/`.
  - `docs/tauri-commands/`: Tauri command documentation. Update when adding/modifying Tauri commands in `desktop/src/commands/`.
  - `docs/ui/`: UI component documentation.

## Package Manager

- Use `pnpm` for all JavaScript/TypeScript package operations (install, add, remove, run scripts).
- Never use `npm` or `yarn` commands.

## Code Style

- All code comments must be written in English.
- Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) specification:
  - Format: `<type>(<scope>): <description>`
  - Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`
  - Example: `feat(core): add zip utilities for archive operations`
- All commits must be signed-off using the `-s` flag (`git commit -s`).
- When listing parallel items with no specific logical relationship, sort them alphabetically.

## Implementation Guidance

- Implement features elegantly and with extensibility in mind. Split code into focused files/modules when that keeps the
  design clearer, reduces coupling, or makes future feature types easier to add.
