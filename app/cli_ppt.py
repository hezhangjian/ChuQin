from pathlib import Path

import typer

from app.cli_errors import run_with_cli_error
from app.ppt import PptCreateResult
from app.ppt import PptCreator


def register_ppt_commands(root_app: typer.Typer) -> None:
    ppt_app = typer.Typer(help="PowerPoint related commands.")

    root_app.add_typer(ppt_app, name="ppt")

    @ppt_app.command("create")
    def create_ppt(
        ppt_name: str = typer.Argument(..., help="Deck title and default output filename stem."),
        output_pptx: Path | None = typer.Option(
            None,
            "--output",
            "-o",
            dir_okay=False,
            help="Destination PPTX path. Defaults to `./<ppt_name>.pptx`.",
        ),
        template: Path | None = typer.Option(
            None,
            "--template",
            help="Template directory containing `template.toml`, or a `.pptx` file to copy.",
        ),
        overwrite: bool = typer.Option(
            False,
            "--overwrite",
            help="Overwrite the destination PPTX if it already exists.",
        ),
    ) -> None:
        """Create a starter PowerPoint deck from the default or selected template."""

        def _create() -> PptCreateResult:
            creator = PptCreator()
            return creator.create(
                ppt_name=ppt_name,
                output_pptx=output_pptx,
                template=template,
                overwrite=overwrite,
            )

        result = run_with_cli_error(_create)
        typer.secho("PPT created successfully.", fg=typer.colors.GREEN)
        typer.echo(f"saved_to: {result.output_path}")
        if result.template_path is not None:
            typer.echo(f"template: {result.template_path}")
        elif result.used_builtin_template:
            typer.echo("template: builtin default")
