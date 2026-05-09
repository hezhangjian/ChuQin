import sys
from pathlib import Path

import typer

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from python import __version__
from python.gitcode.cli import register_gitcode_commands
from python.gitee.cli import register_gitee_commands
from python.outlook.cli import register_outlook_commands
from python.pdf.cli import register_pdf_commands
from python.ppt.cli import register_ppt_commands
from python.volcengine.cli import register_volcengine_commands
from python.word.cli import register_word_commands

app = typer.Typer(help="ChuQin command line interface.")
register_gitcode_commands(app)
register_gitee_commands(app)
register_outlook_commands(app)
register_pdf_commands(app)
register_ppt_commands(app)
register_volcengine_commands(app)
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
