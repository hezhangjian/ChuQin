#!/usr/bin/env python3
"""
Unified build script for PyWebView application.
Supports building for Windows, macOS, and Linux platforms.
"""

import sys
import os
import subprocess
import shutil
import platform
from pathlib import Path


# Check if colors should be enabled
# Disable colors on Windows unless ANSI support is available
def _supports_color():
    """Check if terminal supports ANSI color codes"""
    if platform.system() == "Windows":
        # Windows 10+ supports ANSI colors, but older versions don't
        # Check if we're in a modern terminal (PowerShell, Windows Terminal, etc.)
        # Check for Windows Terminal or modern console
        if os.getenv("WT_SESSION") or os.getenv("TERM_PROGRAM") == "vscode":
            return True
        # For older Windows, disable colors to avoid display issues
        return False
    return True

_USE_COLOR = _supports_color()


class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m' if _USE_COLOR else ''
    OKBLUE = '\033[94m' if _USE_COLOR else ''
    OKCYAN = '\033[96m' if _USE_COLOR else ''
    OKGREEN = '\033[92m' if _USE_COLOR else ''
    WARNING = '\033[93m' if _USE_COLOR else ''
    FAIL = '\033[91m' if _USE_COLOR else ''
    ENDC = '\033[0m' if _USE_COLOR else ''
    BOLD = '\033[1m' if _USE_COLOR else ''


def print_info(msg):
    print(f"{Colors.OKBLUE}[INFO]{Colors.ENDC} {msg}")


def print_success(msg):
    print(f"{Colors.OKGREEN}[SUCCESS]{Colors.ENDC} {msg}")


def print_warning(msg):
    print(f"{Colors.WARNING}[WARNING]{Colors.ENDC} {msg}")


def print_error(msg):
    print(f"{Colors.FAIL}[ERROR]{Colors.ENDC} {msg}")


def get_project_root():
    """Get the project root directory"""
    return Path(__file__).parent.absolute()


def check_dependencies():
    """Check if required dependencies are installed"""
    print_info("Checking dependencies...")

    # Check Python version
    if sys.version_info < (3, 11):
        print_error("Python 3.11 or higher is required")
        return False

    # Check PyInstaller
    try:
        import PyInstaller
        print_success(f"PyInstaller {PyInstaller.__version__} found")
    except ImportError:
        print_error("PyInstaller not found. Install with: pip install pyinstaller")
        return False

    # Check Node.js and package manager
    portal_dir = get_project_root() / "portal"
    node_modules = portal_dir / "node_modules"

    if not node_modules.exists():
        print_warning("Frontend dependencies not installed")
        print_info("Installing frontend dependencies...")
        if not install_frontend_deps(portal_dir):
            return False

    return True


def install_frontend_deps(portal_dir):
    """Install frontend dependencies"""
    lock_file = portal_dir / "pnpm-lock.yaml"

    # Check for pnpm
    if lock_file.exists():
        if shutil.which("pnpm"):
            cmd = ["pnpm", "install"]
        else:
            print_error("pnpm not found. Please install pnpm: npm install -g pnpm")
            return False
    else:
        if shutil.which("npm"):
            cmd = ["npm", "install"]
        else:
            print_error("npm not found. Please install Node.js")
            return False

    try:
        # Use shell=True on Windows to find commands in PATH
        subprocess.run(cmd, cwd=str(portal_dir), check=True, shell=(platform.system() == "Windows"))
        print_success("Frontend dependencies installed")
        return True
    except subprocess.CalledProcessError:
        print_error("Failed to install frontend dependencies")
        return False


def build_frontend():
    """Build the frontend application"""
    print_info("Building frontend...")
    portal_dir = get_project_root() / "portal"
    dist_dir = portal_dir / "dist"

    # Remove old dist if exists
    if dist_dir.exists():
        shutil.rmtree(dist_dir)

    # Determine package manager and find command path
    lock_file = portal_dir / "pnpm-lock.yaml"
    if lock_file.exists():
        pnpm_path = shutil.which("pnpm")
        if pnpm_path:
            cmd = [pnpm_path, "build"]
        else:
            print_error("pnpm not found. Please install pnpm: npm install -g pnpm")
            return False
    else:
        npm_path = shutil.which("npm")
        if npm_path:
            cmd = [npm_path, "run", "build"]
        else:
            print_error("npm not found. Please install Node.js")
            return False

    try:
        # Use shell=True on Windows to find commands in PATH
        subprocess.run(cmd, cwd=str(portal_dir), check=True, shell=(platform.system() == "Windows"))

        # Verify build output
        index_html = dist_dir / "index.html"
        if not index_html.exists():
            print_error("Frontend build failed: index.html not found")
            return False

        print_success("Frontend built successfully")
        return True
    except subprocess.CalledProcessError:
        print_error("Frontend build failed")
        return False


def build_app():
    """Build the application using PyInstaller for the current platform"""
    project_root = get_project_root()

    # Get current platform (PyInstaller can only build for the current platform)
    current_platform = platform.system().lower()
    # Normalize platform names
    platform_map = {
        "windows": "windows",
        "win32": "windows",
        "darwin": "darwin",
        "macos": "darwin",
        "linux": "linux"
    }
    current_platform = platform_map.get(current_platform, current_platform)

    print_info(f"Building for platform: {current_platform}")

    # Build with PyInstaller
    spec_file = project_root / "project.spec"
    if not spec_file.exists():
        print_error(f"Spec file not found: {spec_file}")
        print_info("Please run 'python build.py --init' first to generate spec file")
        return False

    try:
        cmd = [
            sys.executable,
            "-m", "PyInstaller",
            str(spec_file),
            "--clean",
            "--noconfirm"
        ]

        # Note: When using a .spec file, windowed/console options are set in the spec file itself
        # (see console=False in project.spec). Do not add --windowed/--console flags here.

        # Run PyInstaller from project root to ensure correct path resolution
        subprocess.run(cmd, check=True, cwd=str(project_root))
        print_success("Application built successfully")

        # Show output location
        if current_platform == "windows":
            exe_path = project_root / "dist" / "pywebview-app-name.exe"
            if exe_path.exists():
                print_success(f"Executable: {exe_path}")
        elif current_platform == "darwin":
            app_path = project_root / "dist" / "pywebview-app-name.app"
            if app_path.exists():
                print_success(f"Application: {app_path}")
        else:
            exe_path = project_root / "dist" / "pywebview-app-name"
            if exe_path.exists():
                print_success(f"Executable: {exe_path}")

        return True
    except subprocess.CalledProcessError:
        print_error("Build failed")
        return False


def main():
    """Main build function"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Build pywebview-app-name PyWebView application",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python build.py                    # Build for current platform
  python build.py --skip-frontend    # Skip frontend build
  python build.py --skip-deps        # Skip dependency checks

Note: PyInstaller does not support cross-compilation. This script builds for
the platform it's running on. For multi-platform builds, use CI/CD services.
        """
    )

    parser.add_argument(
        "--skip-frontend",
        action="store_true",
        help="Skip frontend build (use existing dist)"
    )
    parser.add_argument(
        "--skip-deps",
        action="store_true",
        help="Skip dependency checks"
    )

    args = parser.parse_args()

    print(f"{Colors.HEADER}{Colors.BOLD}")
    print("=" * 60)
    print("pywebview-app-name PyWebView Build Script")
    print("=" * 60)
    print(f"{Colors.ENDC}")

    # Check dependencies
    if not args.skip_deps:
        if not check_dependencies():
            sys.exit(1)

    # Build frontend
    if not args.skip_frontend:
        if not build_frontend():
            sys.exit(1)

    # Build application
    if not build_app():
        sys.exit(1)

    print(f"\n{Colors.OKGREEN}{Colors.BOLD}Build completed successfully!{Colors.ENDC}")


if __name__ == "__main__":
    main()
