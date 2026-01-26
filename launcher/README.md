# Launcher

**Developer Tool (macOS only)** - Build a Dock launcher for easy testing and debugging.

> ⚠️ **macOS Only**: This tool is only available on macOS. It creates a Dock shortcut for macOS applications.

## Purpose

This launcher is designed for macOS developers who frequently build and rebuild the application. It creates a Dock shortcut that always works, even after deleting and rebuilding the app.

## How It Works

The launcher is a minimal macOS App bundle that dynamically finds `dist/ChuQin.app` by **path**. This means:

- ✅ Works even after deleting and rebuilding the app (new inode)
- ✅ Always points to the latest build
- ✅ Perfect for development and testing

## Usage

1. **Build the launcher:**
   ```bash
   python3 launcher/create_dock_shortcut.py
   ```

2. **Add to Dock:**
   - Find `ChuQin Launcher.app` in the `launcher/` folder
   - Drag it to your Dock
   - Done!

3. **Use it:**
   - Click the Dock icon anytime to launch ChuQin
   - Works perfectly even after rebuilding the app

## Files

- `create_dock_shortcut.py` - Script to build the launcher
- `ChuQin Launcher.app` - The generated launcher (created after running the script)
- `DOCK_SHORTCUT_ANALYSIS.md` - Technical analysis of different approaches

## Notes

- ⚠️ **macOS only** - This tool only works on macOS
- This is a **developer tool** for testing convenience
- The launcher is built in the `launcher/` folder
- You only need to build it once, then drag to Dock
- After rebuilding the main app, the launcher automatically finds the new build
