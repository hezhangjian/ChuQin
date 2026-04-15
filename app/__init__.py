from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
import tomllib


PACKAGE_NAME = "chuqin"


def get_version() -> str:
    try:
        return version(PACKAGE_NAME)
    except PackageNotFoundError:
        pyproject_path = Path(__file__).resolve().parent.parent / "pyproject.toml"
        with pyproject_path.open("rb") as pyproject_file:
            data = tomllib.load(pyproject_file)
        return data["project"]["version"]


__version__ = get_version()
