import sys
from pathlib import Path

import typer

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from app import __version__
else:
    from app import __version__


app = typer.Typer(help="ChuQin command line interface.")


@app.callback()
def cli() -> None:
    """Root command group for the ChuQin Cli."""


@app.command()
def version() -> None:
    """Show the installed ChuQin version."""
    typer.echo(__version__)


def main() -> None:
    app()


if __name__ == "__main__":
    main()
