import typer


def register_word_commands(root_app: typer.Typer) -> None:
    word_app = typer.Typer(help="WORD related commands.")

    root_app.add_typer(word_app, name="word")
