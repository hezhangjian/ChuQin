# ChuQin UI

UI documentation covers the desktop application experience, including the app, workspace navigation, the main work surface, and tool-panel structure.

## Scope

- Desktop app structure and navigation.
- Workspace-oriented interaction flows.
- `Sidebar`, `MainArea`, and `ToolPanel` responsibilities.
- Tool-panel behavior and user-facing capabilities.

## Layout Model

ChuQin uses a three-component desktop layout:

- **`Sidebar`**: the collapsible left-side workspace navigation area. It is the place for the `CHUQIN_DIR` explorer, apps, and other filesystem-oriented context. App entries open as first-class tabs in `MainArea`.
- **`MainArea`**: the central work surface. It owns the primary tabbed/view area for file and folder views, previews, app surfaces, work surfaces, and tool-opened views.
- **`ToolPanel`**: the collapsible right-side tool area. It presents tool-panel entries and tool-specific controls.

`Sidebar` and `ToolPanel` provide supporting context and actions. `MainArea` is the primary interaction surface.

## App And Tool Boundary

An **app** is a persistent work surface for creating, editing, managing, or revisiting stateful assets. Apps usually own
a rich interaction model, may maintain files or sessions, and open as first-class `MainArea` tabs.

A **tool** is a focused command or transformation surface. Tools usually take small inputs, produce immediate outputs or
generated files, and can be represented as controls plus results.

Use an app when a capability creates or maintains a file-like asset, needs long-lived editing state, or behaves like a
workspace. Use a tool when a capability is command-oriented, conversion-oriented, calculation-oriented, or
archive/generation-oriented.

## Subsections

- **[Tools](./tools/README.md)**: Tool-panel capabilities, tool-area organization, and tool-specific references.
