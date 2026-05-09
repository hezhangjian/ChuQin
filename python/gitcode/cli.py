import typer


def register_gitcode_commands(root_app: typer.Typer) -> None:
    gitcode_app = typer.Typer(help="GitCode related commands.")

    root_app.add_typer(gitcode_app, name="gitcode")
