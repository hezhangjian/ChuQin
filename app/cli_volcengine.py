from pathlib import Path

import typer

from app.cli_errors import run_with_cli_error
from app.config import load_config
from app.volcengine import VideoGenerationResult
from app.volcengine import VolcEngineVideoClient

def register_volcengine_commands(root_app: typer.Typer) -> None:
    volcengine_app = typer.Typer(help="Volcengine related commands.")
    video_app = typer.Typer(help="Video generation commands.")

    root_app.add_typer(volcengine_app, name="volcengine")
    volcengine_app.add_typer(video_app, name="video")
    volcengine_app.add_typer(video_app, name="vedio", hidden=True)

    @video_app.command("gen")
    def generate_volcengine_video(
        prompt: str = typer.Argument(...),
        output_dir: Path | None = typer.Option(
            None,
            "--output-dir",
            "-o",
            help="Directory used to store downloaded video files.",
        ),
        req_key: str | None = typer.Option(
            None,
            "--req-key",
            help="Override the configured VolcEngine video req_key.",
        ),
        poll_interval: int = typer.Option(
            5,
            "--poll-interval",
            min=1,
            help="Polling interval in seconds while waiting for the async task.",
        ),
        timeout_seconds: int = typer.Option(
            1800,
            "--timeout",
            min=10,
            help="Maximum wait time in seconds before the command exits.",
        ),
    ) -> None:
        """Generate a video with the VolcEngine visual async API."""

        def _generate_video() -> VideoGenerationResult:
            config = load_config()
            client = VolcEngineVideoClient(config)
            return client.generate_video(
                prompt,
                output_dir=output_dir,
                req_key=req_key,
                poll_interval=poll_interval,
                timeout_seconds=timeout_seconds,
            )

        result = run_with_cli_error(_generate_video)
        typer.secho("Video generated successfully.", fg=typer.colors.GREEN)
        typer.echo(f"task_id: {result.task_id}")
        typer.echo(f"status: {result.status}")
        typer.echo(f"saved_to: {result.file_path}")
        typer.echo(f"source_url: {result.source_url}")
