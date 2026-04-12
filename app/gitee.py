from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from urllib import error, parse, request

from app.config import AppConfig


GITEE_API_BASE_URL = "https://gitee.com/api/v5"


@dataclass(slots=True)
class GiteeRepo:
    full_name: str
    html_url: str
    private: bool


class GiteeRepoClient:
    def __init__(self, config: AppConfig) -> None:
        self._config = config

    def list_repositories(
        self,
        *,
        page: int = 1,
        per_page: int = 20,
        visibility: str = "all",
    ) -> list[GiteeRepo]:
        token = self._config.gitee.token.strip()
        if not token:
            raise ValueError("Gitee token is missing. Please configure [gitee].token in .chuqin/config.toml.")

        clean_page = max(1, page)
        clean_per_page = min(max(1, per_page), 100)
        clean_visibility = visibility.strip().lower() or "all"

        payload = self._request_json(
            "/user/repos",
            {
                "access_token": token,
                "page": str(clean_page),
                "per_page": str(clean_per_page),
                "sort": "full_name",
                "direction": "asc",
                "type": clean_visibility,
            },
        )
        if not isinstance(payload, list):
            raise RuntimeError(f"Unexpected Gitee response: {json.dumps(payload, ensure_ascii=False)}")

        repos: list[GiteeRepo] = []
        for item in payload:
            if not isinstance(item, dict):
                continue
            full_name = str(item.get("full_name", "")).strip()
            html_url = str(item.get("html_url", "")).strip()
            if not full_name or not html_url:
                continue
            repos.append(
                GiteeRepo(
                    full_name=full_name,
                    html_url=html_url,
                    private=bool(item.get("private", False)),
                )
            )
        return repos

    def _request_json(self, path: str, query: dict[str, str]) -> Any:
        url = f"{GITEE_API_BASE_URL}{path}?{parse.urlencode(query)}"
        req = request.Request(
            url,
            headers={
                "Accept": "application/json",
                "User-Agent": "chuqin-cli",
            },
            method="GET",
        )
        try:
            with request.urlopen(req, timeout=120) as response:
                return json.loads(response.read().decode("utf-8"))
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Gitee request failed: {exc.code} {detail}") from exc
        except error.URLError as exc:
            raise RuntimeError(f"Gitee request failed: {exc.reason}") from exc
