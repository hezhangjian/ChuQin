import typer


def register_pdf_commands(root_app: typer.Typer) -> None:
    pdf_app = typer.Typer(help="PDF related commands.")

    root_app.add_typer(pdf_app, name="pdf")
