#!/usr/bin/env python3
"""
Create a launcher App for pywebview-app-name that always works, even after rebuilds.
The launcher dynamically finds the app by path, not by inode.

macOS only - This script only works on macOS.
"""

import sys
import platform
import shutil
from pathlib import Path

# Check if running on macOS
if platform.system() != "Darwin":
    print("❌ Error: This script only works on macOS")
    print(f"   Current platform: {platform.system()}")
    sys.exit(1)

# Constants
SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent.resolve()  # Go up from launcher/ to project root
APP_NAME = "pywebview-app-name.app"
TARGET_APP_PATH = PROJECT_ROOT / "dist" / APP_NAME
LAUNCHER_NAME = "pywebview-app-name Launcher.app"
LAUNCHER_PATH = SCRIPT_DIR / LAUNCHER_NAME  # Output to launcher folder


def create_launcher_app():
    """Create a minimal App bundle that dynamically finds and launches the app."""

    # Remove existing launcher if exists
    if LAUNCHER_PATH.exists():
        if LAUNCHER_PATH.is_dir():
            shutil.rmtree(LAUNCHER_PATH)
        else:
            LAUNCHER_PATH.unlink()
        print("🗑️  Removed existing launcher")

    # Create App bundle structure
    LAUNCHER_PATH.mkdir(parents=True, exist_ok=True)
    contents_dir = LAUNCHER_PATH / "Contents"
    contents_dir.mkdir(exist_ok=True)

    macos_dir = contents_dir / "MacOS"
    macos_dir.mkdir(exist_ok=True)

    resources_dir = contents_dir / "Resources"
    resources_dir.mkdir(exist_ok=True)

    # Create Info.plist
    info_plist = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>pywebview-app-name</string>
    <key>CFBundleIdentifier</key>
    <string>com.pywebview-app-name.launcher</string>
    <key>CFBundleName</key>
    <string>pywebview-app-name Launcher</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
"""

    (contents_dir / "Info.plist").write_text(info_plist, encoding='utf-8')

    # Create launcher script that dynamically finds the app by path
    # This way it works even after deleting and rebuilding (new inode)
    script_content = f"""#!/bin/bash
# Launcher script that finds pywebview-app-name.app by path, not by inode
# This works even after deleting and rebuilding the app

APP_PATH="{TARGET_APP_PATH}"

if [ -d "$APP_PATH" ]; then
    open "$APP_PATH"
else
    # Show error dialog
    osascript <<EOF
display dialog "pywebview-app-name.app not found at:\\n\\n$APP_PATH\\n\\nPlease build the app first:\\n\\npython3 build.py" buttons {{"OK"}} default button "OK" with icon caution
EOF
    exit 1
fi
"""

    executable_path = macos_dir / "pywebview-app-name"
    executable_path.write_text(script_content, encoding='utf-8')
    executable_path.chmod(0o755)

    print(f"✅ Created launcher: {LAUNCHER_PATH}")
    print(f"   This launcher always finds: {TARGET_APP_PATH}")
    return True


def main():
    """Main function."""
    print("🚀 Creating launcher for pywebview-app-name...")
    print(f"   Target: {TARGET_APP_PATH}\n")

    if not create_launcher_app():
        print("❌ Failed to create launcher")
        sys.exit(1)

    print("\n✨ Done!")
    print("\n📌 Next step:")
    print(f"   1. Find '{LAUNCHER_NAME}' in the launcher folder")
    print("   2. Drag it to your Dock")
    print("   3. Done! Click it anytime to launch pywebview-app-name")
    print("\n💡 This launcher finds the app by PATH, not by inode")
    print("   Works perfectly even after deleting and rebuilding!")


if __name__ == "__main__":
    main()
