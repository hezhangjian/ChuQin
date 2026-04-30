import sys
from pathlib import Path

import typer

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import __version__
from app.cli_pdf import register_pdf_commands
from app.cli_ppt import register_ppt_commands
from app.cli_word import register_word_commands

app = typer.Typer(help="ChuQin command line interface.")
register_pdf_commands(app)
register_ppt_commands(app)
register_word_commands(app)


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
