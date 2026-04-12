import sys
from pathlib import Path

import typer

if __package__ in {None, ""}:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import __version__
from app.cli_pdf import register_pdf_commands
from app.cli_gitee import register_gitee_commands
from app.cli_volcengine import register_volcengine_commands

app = typer.Typer(help="ChuQin command line interface.")
register_pdf_commands(app)
register_gitee_commands(app)
register_volcengine_commands(app)


@app.command()
def version() -> None:
    """Show the installed ChuQin version."""
    typer.echo(__version__)


def main() -> None:
    app()


if __name__ == "__main__":
    main()
