import sys
from pathlib import Path

import webview


def get_resource_path():
    """
    Get the base path for resources.
    In PyInstaller bundle, use sys._MEIPASS, otherwise use project root.
    """
    if getattr(sys, 'frozen', False):
        # Running as PyInstaller bundle
        return Path(sys._MEIPASS)
    else:
        # Development mode
        return Path(__file__).parent.parent


def get_portal_url():
    """
    Get the URL to load the frontend application.
    Returns the built dist folder if it exists, otherwise starts dev server.
    """
    # Get the base path (handles both bundled and development modes)
    base_path = get_resource_path()
    dist_dir = base_path / "portal" / "dist"
    index_html = dist_dir / "index.html"

    return str(index_html.absolute())


def main():
    url = get_portal_url()

    webview.create_window(
        title='ChuQin',
        url=url,
        width=1440,
        height=900,
        min_size=(900, 600),
        resizable=True,
    )

    webview.start(debug=False)


if __name__ == "__main__":
    main()
