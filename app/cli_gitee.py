import typer

from app.cli_errors import run_with_cli_error
from app.config import load_config
from app.gitee import GiteeRepo
from app.gitee import GiteeRepoClient

def register_gitee_commands(root_app: typer.Typer) -> None:
    gitee_app = typer.Typer(help="Gitee related commands.")
    repo_app = typer.Typer(help="Gitee repository commands.")

    root_app.add_typer(gitee_app, name="gitee")
    gitee_app.add_typer(repo_app, name="repo")

    @gitee_app.callback()
    def gitee() -> None:
        """Gitee command group."""

    @repo_app.command("list")
    def list_gitee_repositories(
        page: int = typer.Option(
            1,
            "--page",
            min=1,
            help="Page number for the Gitee repositories API.",
        ),
        per_page: int = typer.Option(
            20,
            "--per-page",
            min=1,
            max=100,
            help="Maximum number of repositories returned per page.",
        ),
        visibility: str = typer.Option(
            "all",
            "--type",
            help="Repository filter. Common values: all, owner, public, private, member.",
        ),
    ) -> None:
        """List repositories from the configured Gitee account."""

        def _list_repositories() -> list[GiteeRepo]:
            config = load_config()
            client = GiteeRepoClient(config)
            return client.list_repositories(page=page, per_page=per_page, visibility=visibility)

        repos = run_with_cli_error(_list_repositories)
        if not repos:
            typer.echo("No repositories found.")
            return

        for repo in repos:
            visibility_label = "private" if repo.private else "public"
            typer.echo(f"{repo.full_name}\t{visibility_label}\t{repo.html_url}")
