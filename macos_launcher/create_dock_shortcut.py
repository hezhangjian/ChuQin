#!/usr/bin/env python3
"""
Create a small macOS app bundle that can be pinned to the Dock.

The generated launcher opens ChuQin by path, so it keeps working after the real
application bundle is deleted and recreated by a build.
"""

from __future__ import annotations

import argparse
import platform
import plistlib
import shutil
import stat
import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent.resolve()
LAUNCHER_NAME = "ChuQin Launcher.app"
LAUNCHER_PATH = SCRIPT_DIR / LAUNCHER_NAME
EXECUTABLE_NAME = "ChuQinLauncher"
ICON_SOURCE = PROJECT_ROOT / "desktop" / "icons" / "icon.icns"

DEFAULT_TARGETS = [
    PROJECT_ROOT / "target" / "release" / "bundle" / "macos" / "chuqin.app",
    PROJECT_ROOT / "target" / "debug" / "bundle" / "macos" / "chuqin.app",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create a Dock launcher for ChuQin on macOS.")
    parser.add_argument(
        "--target",
        action="append",
        type=Path,
        help="App bundle path to open. Can be provided more than once; first existing path wins.",
    )
    return parser.parse_args()


def ensure_macos() -> None:
    if platform.system() != "Darwin":
        print(f"Error: this launcher helper only works on macOS. Current platform: {platform.system()}")
        sys.exit(1)


def app_targets(explicit_targets: list[Path] | None) -> list[Path]:
    targets = explicit_targets or DEFAULT_TARGETS
    return [target.expanduser().resolve() for target in targets]


def create_info_plist(contents_dir: Path, has_icon: bool) -> None:
    info = {
        "CFBundleExecutable": EXECUTABLE_NAME,
        "CFBundleIdentifier": "com.hezhangjian.chuqin.launcher",
        "CFBundleName": "ChuQin Launcher",
        "CFBundleDisplayName": "ChuQin",
        "CFBundleVersion": "1.0",
        "CFBundleShortVersionString": "1.0",
        "CFBundlePackageType": "APPL",
        "LSMinimumSystemVersion": "10.13",
        "NSHighResolutionCapable": True,
    }
    if has_icon:
        info["CFBundleIconFile"] = "icon.icns"

    with (contents_dir / "Info.plist").open("wb") as plist_file:
        plistlib.dump(info, plist_file)


def shell_quote(value: str) -> str:
    return "'" + value.replace("'", "'\\''") + "'"


def create_executable(macos_dir: Path, targets: list[Path]) -> None:
    candidate_lines = "\n".join(f"  {shell_quote(str(target))}" for target in targets)
    target_list = "\n".join(f"- {target}" for target in targets)
    script = f"""#!/bin/bash
set -u

APP_PATH=""
CANDIDATES=(
{candidate_lines}
)

for candidate in "${{CANDIDATES[@]}}"; do
  if [ -d "$candidate" ]; then
    APP_PATH="$candidate"
    break
  fi
done

if [ -n "$APP_PATH" ]; then
  open "$APP_PATH"
  exit 0
fi

osascript <<'EOF'
display dialog "ChuQin.app was not found. Build it first with:

pnpm tauri build

The launcher checked:

{target_list}" buttons {{"OK"}} default button "OK" with icon caution
EOF
exit 1
"""

    executable_path = macos_dir / EXECUTABLE_NAME
    executable_path.write_text(script, encoding="utf-8")
    executable_path.chmod(executable_path.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)


def create_launcher(targets: list[Path]) -> None:
    if LAUNCHER_PATH.exists():
        if LAUNCHER_PATH.is_dir():
            shutil.rmtree(LAUNCHER_PATH)
        else:
            LAUNCHER_PATH.unlink()

    contents_dir = LAUNCHER_PATH / "Contents"
    macos_dir = contents_dir / "MacOS"
    resources_dir = contents_dir / "Resources"
    macos_dir.mkdir(parents=True)
    resources_dir.mkdir()

    has_icon = ICON_SOURCE.exists()
    if has_icon:
        shutil.copy2(ICON_SOURCE, resources_dir / "icon.icns")

    create_info_plist(contents_dir, has_icon)
    create_executable(macos_dir, targets)


def main() -> None:
    ensure_macos()
    args = parse_args()
    targets = app_targets(args.target)

    create_launcher(targets)

    print(f"Created launcher: {LAUNCHER_PATH}")
    print("Checked app targets:")
    for target in targets:
        marker = "found" if target.exists() else "missing"
        print(f"  [{marker}] {target}")
    print("\nDrag the launcher app to the Dock once; it will keep opening the rebuilt ChuQin app by path.")


if __name__ == "__main__":
    main()
