import sys
import zipfile
from pathlib import Path

import pytest
from typer.testing import CliRunner

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.cli import app
from app.pdf_to_ppt import PdfToPptConverter
from app.pdf_to_ppt import PdfToPptResult


def test_cli_pdf_to_ppt_invokes_converter(monkeypatch, tmp_path: Path) -> None:
    runner = CliRunner()
    input_pdf = tmp_path / "input.pdf"
    input_pdf.write_bytes(b"%PDF-1.4\n")
    output_pptx = tmp_path / "result.pptx"

    def fake_convert(self, **kwargs: object) -> PdfToPptResult:  # noqa: ANN001
        assert kwargs["input_pdf"] == input_pdf
        assert kwargs["output_pptx"] == output_pptx
        assert kwargs["overwrite"] is True
        assert kwargs["render_scale"] == 4.0
        return PdfToPptResult(output_path=output_pptx, page_count=3)

    monkeypatch.setattr("app.cli_pdf.PdfToPptConverter.convert", fake_convert)

    result = runner.invoke(
        app,
        ["pdf", "to-ppt", str(input_pdf), "-o", str(output_pptx), "--overwrite", "--render-scale", "4"],
    )

    assert result.exit_code == 0
    assert "PPT generated successfully." in result.stdout
    assert "pages: 3" in result.stdout
    assert str(output_pptx) in result.stdout


def test_resolve_output_path_defaults_to_pdf_stem(tmp_path: Path) -> None:
    converter = PdfToPptConverter()
    input_pdf = tmp_path / "deck.source.pdf"

    output_path = converter._resolve_output_path(input_pdf, None)

    assert output_path == tmp_path / "deck.source.pptx"


def test_convert_builds_pptx_with_one_slide_per_pdf_page(tmp_path: Path) -> None:
    converter = PdfToPptConverter()
    try:
        converter._load_fitz()
    except RuntimeError:
        pytest.skip("PyMuPDF is unavailable")

    input_pdf = tmp_path / "sample.pdf"
    output_pptx = tmp_path / "sample.pptx"

    from pypdf import PdfWriter

    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    writer.add_blank_page(width=612, height=792)
    with input_pdf.open("wb") as file_obj:
        writer.write(file_obj)

    result = converter.convert(input_pdf=input_pdf, output_pptx=output_pptx)

    assert result.page_count == 2
    assert output_pptx.exists()

    with zipfile.ZipFile(output_pptx) as archive:
        slide_names = [name for name in archive.namelist() if name.startswith("ppt/slides/slide") and name.endswith(".xml")]
        assert len(slide_names) == 2


def test_fit_image_centers_content_on_widescreen_slide(tmp_path: Path) -> None:
    image_path = tmp_path / "page.png"

    from PIL import Image

    Image.new("RGB", (1000, 2000), (255, 255, 255)).save(image_path)

    converter = PdfToPptConverter()
    left, top, width, height = converter._fit_image(image_path, 1000, 500)

    assert left == 375
    assert top == 0
    assert width == 250
    assert height == 500


def test_validate_source_rejects_non_positive_render_scale(tmp_path: Path) -> None:
    input_pdf = tmp_path / "sample.pdf"
    input_pdf.write_bytes(b"%PDF-1.4\n")

    converter = PdfToPptConverter()

    with pytest.raises(ValueError, match="render_scale"):
        converter._validate_source(input_pdf, 0)
