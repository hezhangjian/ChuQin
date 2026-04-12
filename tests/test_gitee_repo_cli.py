import sys
from pathlib import Path

from typer.testing import CliRunner

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.cli import app
from app.config import AppConfig, GiteeConfig


def test_cli_gitee_repo_list_invokes_client(monkeypatch) -> None:
    runner = CliRunner()

    class FakeClient:
        def __init__(self, config: AppConfig) -> None:
            assert config.gitee.token == "token-123"

        def list_repositories(self, **kwargs: object):  # noqa: ANN003
            assert kwargs["page"] == 2
            assert kwargs["per_page"] == 5
            assert kwargs["visibility"] == "private"
            return [
                type(
                    "Repo",
                    (),
                    {
                        "full_name": "demo/team-repo",
                        "private": True,
                        "html_url": "https://gitee.com/demo/team-repo",
                    },
                )(),
            ]

    monkeypatch.setattr("app.cli_gitee.load_config", lambda: AppConfig(gitee=GiteeConfig(token="token-123")))
    monkeypatch.setattr("app.cli_gitee.GiteeRepoClient", FakeClient)

    result = runner.invoke(app, ["gitee", "repo", "list", "--page", "2", "--per-page", "5", "--type", "private"])

    assert result.exit_code == 0
    assert "demo/team-repo\tprivate\thttps://gitee.com/demo/team-repo" in result.stdout


def test_cli_gitee_repo_list_reports_errors(monkeypatch) -> None:
    runner = CliRunner()

    class FakeClient:
        def __init__(self, config: AppConfig) -> None:
            self.config = config

        def list_repositories(self, **kwargs: object):  # noqa: ANN003
            raise ValueError("Gitee token is missing.")

    monkeypatch.setattr("app.cli_gitee.load_config", lambda: AppConfig())
    monkeypatch.setattr("app.cli_gitee.GiteeRepoClient", FakeClient)

    result = runner.invoke(app, ["gitee", "repo", "list"])

    assert result.exit_code == 1
    assert "Gitee token is missing." in result.stderr
