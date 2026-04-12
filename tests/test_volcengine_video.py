import sys
from pathlib import Path

from typer.testing import CliRunner

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.cli import app
from app.config import AppConfig, VolcEngineConfig
from app.volcengine import VolcEngineVideoClient


def test_canonical_query_is_sorted_and_encoded() -> None:
    client = VolcEngineVideoClient(AppConfig())
    query = client._canonical_query({"Version": "2022-08-31", "Action": "CV Sync"})
    assert query == "Action=CV%20Sync&Version=2022-08-31"


def test_extract_video_url_from_nested_payload() -> None:
    client = VolcEngineVideoClient(AppConfig())
    payload = {
        "data": {
            "result": {
                "videos": [
                    {"video_url": "https://example.com/out.mp4"},
                ]
            }
        }
    }
    assert client._extract_video_url(payload) == "https://example.com/out.mp4"


def test_build_output_name_preserves_suffix() -> None:
    client = VolcEngineVideoClient(AppConfig())
    assert client._build_output_name("task123", "https://example.com/path/video.mov") == "task123.mov"


def test_cli_gen_invokes_client(monkeypatch, tmp_path: Path) -> None:
    runner = CliRunner()
    saved_path = tmp_path / "result.mp4"

    class FakeClient:
        def __init__(self, config: AppConfig) -> None:
            self.config = config

        def generate_video(self, prompt: str, **kwargs: object):  # noqa: ANN003
            assert prompt == "一只猫在海边奔跑"
            assert kwargs["output_dir"] == tmp_path
            return type(
                "Result",
                (),
                {
                    "task_id": "task-1",
                    "status": "done",
                    "file_path": saved_path,
                    "source_url": "https://example.com/task-1.mp4",
                },
            )()

    monkeypatch.setattr(
        "app.cli_volcengine.load_config",
        lambda: AppConfig(volcengine=VolcEngineConfig(ak="ak", sk="sk")),
    )
    monkeypatch.setattr("app.cli_volcengine.VolcEngineVideoClient", FakeClient)

    result = runner.invoke(app, ["volcengine", "video", "gen", "一只猫在海边奔跑", "-o", str(tmp_path)])

    assert result.exit_code == 0
    assert "Video generated successfully." in result.stdout
    assert "task_id: task-1" in result.stdout
    assert str(saved_path) in result.stdout
