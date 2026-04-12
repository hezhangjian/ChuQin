from pathlib import Path

import typer

from app.cli_errors import run_with_cli_error
from app.pdf_to_ppt import PdfToPptConverter
from app.pdf_to_ppt import DEFAULT_RENDER_SCALE
from app.pdf_to_ppt import PdfToPptResult

def register_pdf_commands(root_app: typer.Typer) -> None:
    pdf_app = typer.Typer(help="PDF related commands.")

    root_app.add_typer(pdf_app, name="pdf")

    @pdf_app.command("to-ppt")
    def convert_pdf_to_ppt(
        input_pdf: Path = typer.Argument(..., exists=True, dir_okay=False, readable=True, help="Source PDF file."),
        output_pptx: Path | None = typer.Option(
            None,
            "--output",
            "-o",
            dir_okay=False,
            help="Destination PPTX path. Defaults to the same filename beside the PDF.",
        ),
        work_dir: Path | None = typer.Option(
            None,
            "--work-dir",
            file_okay=False,
            help="Optional directory used to keep intermediate single-page PDFs and PNGs.",
        ),
        keep_images: bool = typer.Option(
            False,
            "--keep-images",
            help="Keep intermediate page images when `--work-dir` is provided.",
        ),
        overwrite: bool = typer.Option(
            False,
            "--overwrite",
            help="Overwrite the destination PPTX if it already exists.",
        ),
        render_scale: float = typer.Option(
            DEFAULT_RENDER_SCALE,
            "--render-scale",
            min=0.1,
            help="PDF page render scale before inserting into PPT. Higher values are sharper but slower and larger.",
        ),
    ) -> None:
        """Convert each PDF page into a 16:9 slide with a centered page image."""

        def _convert() -> PdfToPptResult:
            converter = PdfToPptConverter()
            return converter.convert(
                input_pdf=input_pdf,
                output_pptx=output_pptx,
                work_dir=work_dir,
                keep_images=keep_images,
                overwrite=overwrite,
                render_scale=render_scale,
            )

        result = run_with_cli_error(_convert)
        typer.secho("PPT generated successfully.", fg=typer.colors.GREEN)
        typer.echo(f"pages: {result.page_count}")
        typer.echo(f"saved_to: {result.output_path}")
