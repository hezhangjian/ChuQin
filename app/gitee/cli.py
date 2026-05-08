import typer


def register_gitee_commands(root_app: typer.Typer) -> None:
    gitee_app = typer.Typer(help="Gitee related commands.")

    root_app.add_typer(gitee_app, name="gitee")
