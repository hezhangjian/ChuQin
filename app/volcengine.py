from __future__ import annotations

import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib import error, parse, request

from app.config import AppConfig


VOLCENGINE_VISUAL_VERSION = "2022-08-31"
VOLCENGINE_VISUAL_SERVICE = "cv"
DEFAULT_TIMEOUT_SECONDS = 1800
DEFAULT_POLL_INTERVAL_SECONDS = 5


@dataclass(slots=True)
class VideoGenerationResult:
    task_id: str
    status: str
    file_path: Path
    source_url: str
    submit_payload: dict[str, Any]
    result_payload: dict[str, Any]


class VolcEngineVideoClient:
    def __init__(self, config: AppConfig) -> None:
        self._config = config

    def generate_video(
        self,
        prompt: str,
        *,
        output_dir: Path | None = None,
        req_key: str | None = None,
        poll_interval: int = DEFAULT_POLL_INTERVAL_SECONDS,
        timeout_seconds: int = DEFAULT_TIMEOUT_SECONDS,
    ) -> VideoGenerationResult:
        clean_prompt = prompt.strip()
        if not clean_prompt:
            raise ValueError("Prompt is required")

        volcengine = self._config.volcengine
        if not volcengine.ak or not volcengine.sk:
            raise ValueError(
                "VolcEngine AK/SK is missing. Please configure [volcengine].ak and [volcengine].sk in .chuqin/config.toml."
            )

        submit_body = {
            "req_key": (req_key or volcengine.video_req_key or "").strip(),
            "prompt": clean_prompt,
        }
        if not submit_body["req_key"]:
            raise ValueError("VolcEngine video req_key is required")

        submit_payload = self._request_json(
            action="CVSync2AsyncSubmitTask",
            body=submit_body,
        )
        task_id = self._extract_task_id(submit_payload)
        if not task_id:
            raise RuntimeError(f"Unable to find task_id in submit response: {json.dumps(submit_payload, ensure_ascii=False)}")

        deadline = time.monotonic() + max(timeout_seconds, poll_interval)
        last_payload = submit_payload
        last_status = "submitted"
        while time.monotonic() < deadline:
            time.sleep(max(1, poll_interval))
            result_payload = self._request_json(
                action="CVSync2AsyncGetResult",
                body={"req_key": submit_body["req_key"], "task_id": task_id},
            )
            last_payload = result_payload
            last_status = self._extract_status(result_payload)
            if self._is_terminal_failure(last_status):
                detail = self._extract_error_message(result_payload) or json.dumps(result_payload, ensure_ascii=False)
                raise RuntimeError(f"Video generation failed for task {task_id}: {detail}")

            video_url = self._extract_video_url(result_payload)
            if video_url:
                target_dir = output_dir or self._default_output_dir()
                target_dir.mkdir(parents=True, exist_ok=True)
                target_path = target_dir / self._build_output_name(task_id, video_url)
                self._download_file(video_url, target_path)
                return VideoGenerationResult(
                    task_id=task_id,
                    status=last_status,
                    file_path=target_path,
                    source_url=video_url,
                    submit_payload=submit_payload,
                    result_payload=result_payload,
                )

        raise TimeoutError(
            f"Timed out waiting for task {task_id}. Last status: {last_status}. "
            f"Last response: {json.dumps(last_payload, ensure_ascii=False)}"
        )

    def _request_json(self, *, action: str, body: dict[str, Any]) -> dict[str, Any]:
        volcengine = self._config.volcengine
        payload = json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        now = datetime.now(UTC)
        amz_date = now.strftime("%Y%m%dT%H%M%SZ")
        short_date = now.strftime("%Y%m%d")
        host = volcengine.visual_host
        canonical_query = self._canonical_query(
            {
                "Action": action,
                "Version": VOLCENGINE_VISUAL_VERSION,
            }
        )
        payload_hash = hashlib.sha256(payload).hexdigest()
        signed_headers = "content-type;host;x-content-sha256;x-date"
        canonical_headers = (
            f"content-type:application/json\n"
            f"host:{host}\n"
            f"x-content-sha256:{payload_hash}\n"
            f"x-date:{amz_date}\n"
        )
        canonical_request = "\n".join(
            [
                "POST",
                "/",
                canonical_query,
                canonical_headers,
                signed_headers,
                payload_hash,
            ]
        )
        credential_scope = f"{short_date}/{volcengine.region}/{VOLCENGINE_VISUAL_SERVICE}/request"
        string_to_sign = "\n".join(
            [
                "HMAC-SHA256",
                amz_date,
                credential_scope,
                hashlib.sha256(canonical_request.encode("utf-8")).hexdigest(),
            ]
        )
        signing_key = self._build_signing_key(
            sk=volcengine.sk,
            short_date=short_date,
            region=volcengine.region,
            service=VOLCENGINE_VISUAL_SERVICE,
        )
        signature = hmac.new(signing_key, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()
        authorization = (
            "HMAC-SHA256 "
            f"Credential={volcengine.ak}/{credential_scope}, "
            f"SignedHeaders={signed_headers}, "
            f"Signature={signature}"
        )
        url = f"https://{host}/?{canonical_query}"
        req = request.Request(
            url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Host": host,
                "X-Date": amz_date,
                "X-Content-Sha256": payload_hash,
                "Authorization": authorization,
            },
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=120) as response:
                return json.loads(response.read().decode("utf-8"))
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"VolcEngine request failed: {exc.code} {detail}") from exc
        except error.URLError as exc:
            raise RuntimeError(f"VolcEngine request failed: {exc.reason}") from exc

    def _default_output_dir(self) -> Path:
        return self._config.root_path / ".chuqin" / "videos"

    def _build_output_name(self, task_id: str, video_url: str) -> str:
        suffix = Path(parse.urlparse(video_url).path).suffix or ".mp4"
        return f"{task_id}{suffix}"

    def _download_file(self, url: str, destination: Path) -> None:
        req = request.Request(url, method="GET")
        try:
            with request.urlopen(req, timeout=300) as response:
                destination.write_bytes(response.read())
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Failed to download generated video: {exc.code} {detail}") from exc
        except error.URLError as exc:
            raise RuntimeError(f"Failed to download generated video: {exc.reason}") from exc

    def _extract_task_id(self, payload: dict[str, Any]) -> str:
        for candidate in self._iter_possible_values(payload, "task_id"):
            if isinstance(candidate, str) and candidate.strip():
                return candidate.strip()
        return ""

    def _extract_status(self, payload: dict[str, Any]) -> str:
        for key in ("status", "task_status"):
            for candidate in self._iter_possible_values(payload, key):
                if isinstance(candidate, str) and candidate.strip():
                    return candidate.strip()
                if isinstance(candidate, int):
                    return str(candidate)
        return "processing"

    def _extract_video_url(self, payload: dict[str, Any]) -> str:
        for key in ("video_url", "image_url", "url"):
            for candidate in self._iter_possible_values(payload, key):
                if isinstance(candidate, str) and candidate.startswith(("http://", "https://")):
                    return candidate

        for key in ("video_urls", "videos", "data"):
            for candidate in self._iter_possible_values(payload, key):
                if isinstance(candidate, list):
                    for item in candidate:
                        if isinstance(item, str) and item.startswith(("http://", "https://")):
                            return item
                        if isinstance(item, dict):
                            nested = self._extract_video_url(item)
                            if nested:
                                return nested
        return ""

    def _extract_error_message(self, payload: dict[str, Any]) -> str:
        for key in ("message", "error", "error_message", "status_message"):
            for candidate in self._iter_possible_values(payload, key):
                if isinstance(candidate, str) and candidate.strip():
                    return candidate.strip()
        return ""

    def _is_terminal_failure(self, status: str) -> bool:
        normalized = status.strip().lower()
        return normalized in {"fail", "failed", "error", "timeout", "canceled", "cancelled", "-1"}

    def _iter_possible_values(self, payload: Any, key: str) -> list[Any]:
        found: list[Any] = []
        self._collect_values(payload, key, found)
        return found

    def _collect_values(self, payload: Any, key: str, found: list[Any]) -> None:
        if isinstance(payload, dict):
            for item_key, item_value in payload.items():
                if item_key == key:
                    found.append(item_value)
                self._collect_values(item_value, key, found)
        elif isinstance(payload, list):
            for item in payload:
                self._collect_values(item, key, found)

    def _canonical_query(self, params: dict[str, str]) -> str:
        items = sorted((k, v) for k, v in params.items())
        return "&".join(
            f"{parse.quote(k, safe='-_.~')}={parse.quote(v, safe='-_.~')}"
            for k, v in items
        )

    def _build_signing_key(self, *, sk: str, short_date: str, region: str, service: str) -> bytes:
        date_key = hmac.new(sk.encode("utf-8"), short_date.encode("utf-8"), hashlib.sha256).digest()
        region_key = hmac.new(date_key, region.encode("utf-8"), hashlib.sha256).digest()
        service_key = hmac.new(region_key, service.encode("utf-8"), hashlib.sha256).digest()
        return hmac.new(service_key, b"request", hashlib.sha256).digest()
