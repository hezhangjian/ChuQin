import typer


def register_volcengine_commands(root_app: typer.Typer) -> None:
    volcengine_app = typer.Typer(help="Volcengine related commands.")

    root_app.add_typer(volcengine_app, name="volcengine")
