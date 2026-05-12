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
