import typer


def register_outlook_commands(root_app: typer.Typer) -> None:
    outlook_app = typer.Typer(help="Outlook related commands.")

    root_app.add_typer(outlook_app, name="outlook")
