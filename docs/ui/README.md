# ChuQin UI

UI documentation covers the desktop application experience, including the app, workspace navigation, the main work surface, and tool-panel structure.

## Scope

- Desktop app structure and navigation.
- Workspace-oriented interaction flows.
- `Sidebar`, `MainArea`, and `ToolPanel` responsibilities.
- Tool-panel behavior and user-facing capabilities.

## Layout Model

ChuQin uses a three-component desktop layout:

- **`Sidebar`**: the collapsible left-side workspace navigation area. It is the place for the `CHUQIN_DIR` explorer and other filesystem-oriented context.
- **`MainArea`**: the central work surface. It owns the primary tabbed/view area for file and folder views, previews, work surfaces, and tool-opened views.
- **`ToolPanel`**: the collapsible right-side tool area. It presents built-in tool entries and tool-specific controls.

`Sidebar` and `ToolPanel` provide supporting context and actions. `MainArea` is the primary interaction surface.

## Subsections

- **[Tools](./tools/README.md)**: Built-in tools, tool-area organization, and tool-specific references.
