import typer


def register_ppt_commands(root_app: typer.Typer) -> None:
    ppt_app = typer.Typer(help="PowerPoint related commands.")

    root_app.add_typer(ppt_app, name="ppt")
