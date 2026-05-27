# macOS Launcher

Developer helper for creating a Dock-friendly launcher for ChuQin on macOS.

## Why this exists

Dragging `target/release/bundle/macos/chuqin.app` directly to the Dock can break after rebuilds because the app bundle may
be deleted and recreated. This launcher is a tiny `.app` bundle that stays in place and opens the real ChuQin app by
path each time.

## Usage

Build the Tauri app first:

```bash
pnpm tauri build
```

Create the launcher:

```bash
python3 macos_launcher/create_dock_shortcut.py
```

Then drag `macos_launcher/ChuQin Launcher.app` to the Dock.

## Target app paths

The generated launcher tries these paths in order:

1. `target/release/bundle/macos/chuqin.app`
2. `target/debug/bundle/macos/chuqin.app`

You can also pass an explicit target:

```bash
python3 macos_launcher/create_dock_shortcut.py --target /Applications/chuqin.app
```
