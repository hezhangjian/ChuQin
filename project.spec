# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for PyWebView application.
This file can be customized for different platforms and build options.
"""

import os
import sys
from pathlib import Path

# Import BUNDLE class for macOS app bundle creation
if sys.platform == "darwin":
    from PyInstaller.building.osx import BUNDLE

# Get project root directory
# SPECPATH is set by PyInstaller to the absolute path of this spec file
spec_file_path = Path(SPECPATH).resolve()
project_root = spec_file_path
portal_dist = project_root / "portal" / "dist"

# Validate that frontend is built
if not portal_dist.exists() or not (portal_dist / "index.html").exists():
    raise FileNotFoundError(
        f"Frontend not built. Please run 'python build.py' first to build frontend.\n"
        f"Expected: {portal_dist / 'index.html'}"
    )

# Platform-specific hidden imports
# Only include the platform-specific webview module for the current platform
hidden_imports = [
    "webview",
    "webview.platforms",
]

# Add platform-specific imports based on the build platform
if sys.platform == "win32":
    hidden_imports.append("webview.platforms.winforms")
elif sys.platform == "darwin":
    hidden_imports.append("webview.platforms.cocoa")
elif sys.platform.startswith("linux"):
    # Try GTK first, fallback to Qt if needed
    hidden_imports.extend(["webview.platforms.gtk", "webview.platforms.qt"])

block_cipher = None

a = Analysis(
    [str((project_root / "app" / "main.py").resolve())],
    pathex=[str(project_root)],
    binaries=[],
    datas=[
        (str(portal_dist.resolve()), "portal/dist"),
    ],
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

# Platform-specific executable configuration
if sys.platform == "darwin":
    # macOS: Use COLLECT and BUNDLE to create .app bundle
    exe = EXE(
        pyz,
        a.scripts,
        [],
        exclude_binaries=True,
        name="pywebview-app-name",
        debug=False,
        bootloader_ignore_signals=False,
        strip=False,
        upx=True,
        upx_exclude=[],
        runtime_tmpdir=None,
        console=False,  # Set to True for debugging
        disable_windowed_traceback=False,
        argv_emulation=False,
        target_arch=None,
        codesign_identity=None,
        entitlements_file=None,
        icon=None,  # Add icon path here if you have one: "path/to/icon.icns"
    )

    coll = COLLECT(
        exe,
        a.binaries,
        a.zipfiles,
        a.datas,
        strip=False,
        upx=True,
        upx_exclude=[],
        name="pywebview-app-name",
    )

    app = BUNDLE(
        coll,
        name="pywebview-app-name.app",
        icon=None,  # Add icon path here if you have one: "path/to/icon.icns"
        bundle_identifier=None,
    )
else:
    # Windows and Linux: Use EXE to create executable
    exe = EXE(
        pyz,
        a.scripts,
        a.binaries,
        a.zipfiles,
        a.datas,
        [],
        name="pywebview-app-name",
        debug=False,
        bootloader_ignore_signals=False,
        strip=False,
        upx=True,
        upx_exclude=[],
        runtime_tmpdir=None,
        console=False,  # Set to True for debugging
        disable_windowed_traceback=False,
        argv_emulation=False,
        target_arch=None,
        codesign_identity=None,
        entitlements_file=None,
        icon=None,  # Add icon path here if you have one: "path/to/icon.ico" (Windows) or "path/to/icon.png" (Linux)
    )
