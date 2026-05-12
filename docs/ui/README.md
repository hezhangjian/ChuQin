# ChuQin UI

UI documentation covers the desktop application experience, including navigation patterns, tabbed views, and tool-area workflows.

## Scope

- Desktop information architecture and navigation.
- Workspace-oriented interaction flows.
- The central tabbed workspace model.
- Tool-area behavior and user-facing capabilities.

## Layout Model

ChuQin uses a three-area desktop layout:

- **Left file navigation**: a collapsible `CHUQIN_DIR` explorer backed by the local filesystem.
- **Central workspace**: the primary tabbed view area. It can show file or folder views, file previews, work surfaces, and tool views.
- **Right tools panel**: a collapsible list of tool entries.

The left and right panels are supporting context. The central workspace is the main interaction surface.

## Subsections

- **[Tools](./tools/README.md)**: Built-in tools, tool-area organization, and tool-specific references.
