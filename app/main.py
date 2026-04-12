import sys
from pathlib import Path

import webview

if __package__ in {None, ""}:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_portal_url, load_config
from app.services import ApiBridge


def main() -> None:
    config = load_config()
    url = get_portal_url()
    api = ApiBridge(config)

    window = webview.create_window(
        title="ChuQin",
        url=url,
        js_api=api,
        width=1440,
        height=900,
        min_size=(960, 640),
        resizable=True,
    )
    api.set_window(window)

    webview.start(debug=False)


if __name__ == "__main__":
    main()
