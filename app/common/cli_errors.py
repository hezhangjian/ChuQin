from collections.abc import Callable
from typing import TypeVar

import typer


T = TypeVar("T")


def run_with_cli_error(action: Callable[[], T]) -> T:
    try:
        return action()
    except Exception as exc:  # noqa: BLE001
        # CLI entrypoints intentionally normalize user-facing failures into a
        # readable message plus a non-zero exit code.
        typer.secho(str(exc), fg=typer.colors.RED, err=True)
        raise typer.Exit(code=1) from exc
