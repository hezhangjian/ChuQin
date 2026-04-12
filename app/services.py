import json
import os
import re
import base64
import inspect
import importlib.util
import threading
import uuid
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib import error, request
from datetime import datetime

import webview

from app.config import AppConfig


@dataclass
class SkillRecord:
    identifier: str
    name: str
    path: Path
    description: str
    content: str
    entry_script: Path | None = None
    example_files: list[Path] | None = None
    keywords: list[str] | None = None


class SkillRepository:
    def __init__(self, skills_root: Path | None) -> None:
        self._skills_root = skills_root

    @property
    def skills_root(self) -> Path | None:
        return self._skills_root

    def list_skills(self) -> list[SkillRecord]:
        if not self._skills_root:
            return []

        skills: list[SkillRecord] = []
        for entry in sorted(self._skills_root.iterdir(), key=lambda item: item.name.lower()):
            if entry.name.startswith("."):
                continue

            skill = self._load_skill(entry)
            if skill:
                skills.append(skill)

        return skills

    def get_selected_contents(self, identifiers: list[str]) -> list[SkillRecord]:
        selected = set(identifiers)
        return [skill for skill in self.list_skills() if skill.identifier in selected]

    def _load_skill(self, entry: Path) -> SkillRecord | None:
        if entry.is_dir():
            primary = entry / "SKILL.md"
            fallback = sorted(
                candidate
                for candidate in entry.rglob("*")
                if candidate.is_file() and candidate.suffix.lower() in {".md", ".txt"}
            )
            source = primary if primary.exists() else (fallback[0] if fallback else None)
        elif entry.suffix.lower() in {".md", ".txt"}:
            source = entry
        else:
            source = None

        if not source:
            return None

        try:
            content = source.read_text(encoding="utf-8").strip()
        except UnicodeDecodeError:
            content = source.read_text(encoding="utf-8", errors="ignore").strip()

        preview_lines = [line.strip("# ").strip() for line in content.splitlines() if line.strip()]
        description = preview_lines[1] if len(preview_lines) > 1 else (preview_lines[0] if preview_lines else "No description")
        identifier = entry.stem if entry.is_file() else entry.name

        return SkillRecord(
            identifier=identifier,
            name=entry.stem if entry.is_file() else entry.name,
            path=source,
            description=description[:140],
            content=content,
            entry_script=self._resolve_entry_script(entry if entry.is_dir() else source.parent),
            example_files=self._find_example_files(entry if entry.is_dir() else source.parent),
            keywords=self._extract_keywords(content, identifier, description),
        )

    def _resolve_entry_script(self, skill_dir: Path) -> Path | None:
        candidates = [skill_dir / "analyze.py", skill_dir / "main.py", skill_dir / "run.py"]
        for candidate in candidates:
            if candidate.exists():
                return candidate
        return None

    def _find_example_files(self, skill_dir: Path) -> list[Path]:
        example_dirs = [skill_dir / "examples", skill_dir / "resources"]
        allowed_suffixes = {
            ".csv", ".tsv", ".json", ".txt", ".md", ".xlsx", ".xls",
            ".png", ".jpg", ".jpeg", ".webp", ".pdf"
        }
        files: list[Path] = []
        for example_dir in example_dirs:
            if example_dir.exists():
                files.extend(
                    sorted(
                        item for item in example_dir.rglob("*")
                        if item.is_file() and item.suffix.lower() in allowed_suffixes
                    )
                )
        return files

    def _extract_keywords(self, content: str, identifier: str, description: str) -> list[str]:
        frontmatter = self._parse_frontmatter(content)
        keywords: set[str] = set()

        explicit_keywords = frontmatter.get("keywords")
        if isinstance(explicit_keywords, list):
            for item in explicit_keywords:
                if isinstance(item, str):
                    keywords.add(item.strip().lower())

        for raw in (identifier, description, frontmatter.get("name", "")):
            if isinstance(raw, str):
                for token in re.findall(r"[a-zA-Z0-9_\-\u4e00-\u9fff]+", raw.lower()):
                    if len(token) >= 2:
                        keywords.add(token)

        for token in re.findall(r"[a-zA-Z0-9_\-\u4e00-\u9fff]+", content[:800].lower()):
            if len(token) >= 3:
                keywords.add(token)

        return sorted(keywords)

    def _parse_frontmatter(self, content: str) -> dict[str, Any]:
        if not content.startswith("---\n"):
            return {}

        parts = content.split("\n---\n", 1)
        if len(parts) != 2:
            return {}

        header = parts[0].replace("---\n", "", 1)
        data: dict[str, Any] = {}
        current_list_key: str | None = None
        for line in header.splitlines():
            stripped = line.strip()
            if not stripped:
                continue
            if stripped.startswith("- ") and current_list_key:
                data.setdefault(current_list_key, [])
                data[current_list_key].append(stripped[2:].strip().strip('"').strip("'"))
                continue
            if ":" in line:
                key, value = line.split(":", 1)
                current_list_key = key.strip()
                clean_value = value.strip().strip('"').strip("'")
                if clean_value:
                    data[current_list_key] = clean_value
                else:
                    data[current_list_key] = []
        return data


@dataclass
class SkillRunJob:
    job_id: str
    skill_id: str
    status: str
    stage: str
    progress_text: str
    file_path: str
    run_dir: str | None = None
    summary: str | None = None
    images: list[dict[str, str]] | None = None
    error: str | None = None


class AgentService:
    def __init__(self, config: AppConfig) -> None:
        self._config = config
        self._skill_repository = SkillRepository(config.skills_root)
        self._jobs: dict[str, SkillRunJob] = {}
        self._jobs_lock = threading.Lock()

    def get_state(self) -> dict[str, Any]:
        skills = self._skill_repository.list_skills()
        return {
            "appName": "ChuQin",
            "rootDir": str(self._config.root_dir) if self._config.root_dir else None,
            "configPath": str(self._config.config_path) if self._config.config_path else None,
            "skillsRoot": str(self._skill_repository.skills_root) if self._skill_repository.skills_root else None,
            "provider": self._provider_summary(),
            "skills": [
                {
                    "id": skill.identifier,
                    "name": skill.name,
                    "path": str(skill.path),
                    "description": skill.description,
                    "entryScript": str(skill.entry_script) if skill.entry_script else None,
                    "exampleFiles": [str(item) for item in (skill.example_files or [])],
                    "keywords": skill.keywords or [],
                }
                for skill in skills
            ],
        }

    def chat(self, payload: dict[str, Any]) -> dict[str, Any]:
        messages = payload.get("messages", [])
        selected_skill_ids = payload.get("selectedSkillIds", [])
        user_message = payload.get("message", "").strip()

        if not user_message:
            raise ValueError("Message is required")

        selected_skills = self._skill_repository.get_selected_contents(selected_skill_ids)

        auto_run = self._maybe_auto_run_skill(
            user_message=user_message,
            selected_skills=selected_skills,
        )
        if auto_run:
            return {
                "message": {
                    "role": "assistant",
                    "content": auto_run["content"],
                    "images": auto_run["images"],
                    "runDir": auto_run["runDir"],
                    "skillId": auto_run["skillId"],
                }
            }

        assistant_text = self._generate_reply(messages=messages, user_message=user_message, selected_skills=selected_skills)

        return {
            "message": {
                "role": "assistant",
                "content": assistant_text,
            }
        }

    def analyze_csv(self, payload: dict[str, Any]) -> dict[str, Any]:
        skill_id = str(payload.get("skillId", "")).strip()
        file_path_raw = str(payload.get("filePath", "")).strip()
        if not file_path_raw:
            raise ValueError("Input file path is required")

        if not skill_id:
            raise ValueError("Skill id is required")

        selected_skills = self._skill_repository.get_selected_contents([skill_id])
        if not selected_skills:
            raise ValueError(f"Skill not found: {skill_id}")

        skill = selected_skills[0]
        if not skill.entry_script:
            raise ValueError(f"Skill is not executable: {skill_id}")

        file_path = Path(file_path_raw).expanduser()
        if not file_path.exists():
            raise ValueError(f"Input file does not exist: {file_path}")

        run_dir = self._prepare_run_dir(skill.identifier)
        analysis_text, image_paths = self._run_skill_entry(
            entry_script=skill.entry_script,
            file_path=file_path,
            run_dir=run_dir,
        )

        return {
            "summary": analysis_text,
            "runDir": str(run_dir),
            "images": [self._image_payload(path) for path in image_paths],
        }

    def start_skill_run(self, payload: dict[str, Any]) -> dict[str, Any]:
        skill_id = str(payload.get("skillId", "")).strip()
        file_path_raw = str(payload.get("filePath", "")).strip()
        if not skill_id:
            raise ValueError("Skill id is required")

        skill = self._get_skill(skill_id)
        if not skill.entry_script:
            raise ValueError(f"Skill is not executable: {skill_id}")

        if file_path_raw:
            file_path = Path(file_path_raw).expanduser()
        else:
            examples = skill.example_files or []
            if not examples:
                raise ValueError("No input file provided and no example file found")
            file_path = examples[0]

        if not file_path.exists():
            raise ValueError(f"Input file does not exist: {file_path}")

        job = SkillRunJob(
            job_id=uuid.uuid4().hex,
            skill_id=skill.identifier,
            status="queued",
            stage="queued",
            progress_text="任务已创建，等待执行",
            file_path=str(file_path),
        )
        with self._jobs_lock:
            self._jobs[job.job_id] = job

        worker = threading.Thread(
            target=self._run_skill_job,
            args=(job.job_id, skill, file_path),
            daemon=True,
        )
        worker.start()
        return {"jobId": job.job_id}

    def get_skill_run(self, job_id: str) -> dict[str, Any]:
        with self._jobs_lock:
            job = self._jobs.get(job_id)
        if not job:
            return {"error": f"Run job not found: {job_id}"}
        return self._job_payload(job)

    def _generate_reply(
        self,
        messages: list[dict[str, Any]],
        user_message: str,
        selected_skills: list[SkillRecord],
    ) -> str:
        if self._config.openai_api_key:
            return self._chat_via_openai_compatible(
                api_key=self._config.openai_api_key,
                model=self._config.openai_model,
                base_url=self._config.openai_base_url,
                messages=messages,
                user_message=user_message,
                selected_skills=selected_skills,
            )

        return self._chat_offline(user_message=user_message, selected_skills=selected_skills)

    def _maybe_auto_run_skill(
        self,
        user_message: str,
        selected_skills: list[SkillRecord],
    ) -> dict[str, Any] | None:
        executable_skills = [skill for skill in (selected_skills or self._skill_repository.list_skills()) if skill.entry_script]
        if not executable_skills:
            return None

        matched_skill = self._match_executable_skill(user_message, executable_skills)
        if not matched_skill:
            return None

        file_path = self._extract_local_file_path(user_message)
        if not file_path:
            examples = matched_skill.example_files or []
            file_path = examples[0] if examples else None

        if not file_path:
            return None

        run_dir = self._prepare_run_dir(matched_skill.identifier)
        analysis_text, image_paths = self._run_skill_entry(
            entry_script=matched_skill.entry_script,
            file_path=file_path,
            run_dir=run_dir,
        )
        images = [self._image_payload(path) for path in image_paths]

        intro = [
            f"已自动匹配并执行 skill: `{matched_skill.name}`",
            f"输入文件: `{file_path}`",
        ]
        if matched_skill.example_files and file_path == matched_skill.example_files[0]:
            intro.append("未在消息中发现可用的本地输入文件路径，因此自动使用了 skill 自带的 example 文件。")

        content = "\n".join(intro) + "\n\n" + analysis_text
        return {
            "content": content,
            "images": images,
            "runDir": str(run_dir),
            "skillId": matched_skill.identifier,
        }

    def _match_executable_skill(self, user_message: str, executable_skills: list[SkillRecord]) -> SkillRecord | None:
        text = user_message.lower()
        if not text.strip():
            return None

        scores: list[tuple[int, SkillRecord]] = []
        for skill in executable_skills:
            keywords = skill.keywords or []
            score = sum(1 for keyword in keywords if keyword and keyword in text)
            if skill.identifier.lower() in text:
                score += 4
            if skill.name.lower() in text:
                score += 4
            if score > 0:
                scores.append((score, skill))

        if scores:
            scores.sort(key=lambda item: item[0], reverse=True)
            return scores[0][1]

        if self._extract_local_file_path(user_message):
            return executable_skills[0]

        generic_trigger_words = ["分析", "处理", "生成", "运行", "执行", "转换", "总结", "可视化", "图表", "数据", "文件"]
        if any(word in text for word in generic_trigger_words):
            return executable_skills[0]

        return None

    def _extract_local_file_path(self, user_message: str) -> Path | None:
        matches = re.findall(r'([/~\w.\-]+(?:/[\w.\-]+)+\.[A-Za-z0-9]+)', user_message)
        for raw_match in matches:
            candidate = Path(raw_match).expanduser()
            if candidate.exists():
                return candidate
        return None

    def _chat_via_openai_compatible(
        self,
        api_key: str,
        model: str,
        base_url: str,
        messages: list[dict[str, Any]],
        user_message: str,
        selected_skills: list[SkillRecord],
    ) -> str:
        system_prompt = self._build_system_prompt(selected_skills)
        request_messages = [{"role": "system", "content": system_prompt}]

        for message in messages[-10:]:
            role = message.get("role")
            content = str(message.get("content", "")).strip()
            if role in {"user", "assistant"} and content:
                request_messages.append({"role": role, "content": content})

        request_messages.append({"role": "user", "content": user_message})

        data = json.dumps(
            {
                "model": model,
                "messages": request_messages,
                "temperature": 0.5,
            }
        ).encode("utf-8")

        endpoint = f"{base_url.rstrip('/')}/chat/completions"
        req = request.Request(
            endpoint,
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            method="POST",
        )

        try:
            with request.urlopen(req, timeout=90) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Model request failed: {exc.code} {detail}") from exc
        except error.URLError as exc:
            raise RuntimeError(f"Model request failed: {exc.reason}") from exc

        choices = payload.get("choices", [])
        if not choices:
            raise RuntimeError("Model response did not contain any choices")

        message = choices[0].get("message", {})
        content = message.get("content")
        if isinstance(content, str) and content.strip():
            return content.strip()

        raise RuntimeError("Model response did not contain assistant content")

    def _chat_offline(self, user_message: str, selected_skills: list[SkillRecord]) -> str:
        if selected_skills:
            skill_names = ", ".join(skill.name for skill in selected_skills)
            snippets = []
            for skill in selected_skills[:3]:
                line = next((item.strip() for item in skill.content.splitlines() if item.strip()), "")
                if line:
                    snippets.append(f"- {skill.name}: {line[:160]}")
            snippet_text = "\n".join(snippets) if snippets else "- Loaded skills are available but do not contain readable text previews."
            return (
                "当前没有检测到模型 API Key，所以我先以离线助手模式回应。\n\n"
                f"你当前启用了这些 skill: {skill_names}\n"
                "我会把它们当作上下文来源。基于你刚才的问题，我建议我们继续把真实模型接入，这样这些 skill 才能用于正式推理。\n\n"
                f"你的问题是：{user_message}\n\n"
                "已加载的 skill 预览：\n"
                f"{snippet_text}"
            )

        return (
            "当前没有检测到模型 API Key，所以我先以离线助手模式回应。\n\n"
            f"我收到了你的消息：{user_message}\n"
            "界面、skill 发现和前后端桥接已经可以工作。接下来只要在环境变量或 .chuqin/config.toml 中配置模型参数，ChuQin 就能切到真正的 Agent 对话模式。"
        )

    def _build_system_prompt(self, selected_skills: list[SkillRecord]) -> str:
        sections = [
            "You are ChuQin, a desktop agent assistant built with PyWebview and Vue.",
            "Answer in the user's language when possible, be concise, and ground your response in any loaded skills.",
        ]

        if selected_skills:
            skill_blocks = []
            for skill in selected_skills:
                skill_blocks.append(f"[Skill: {skill.name} | Source: {skill.path}]\n{skill.content[:6000]}")
            sections.append("Loaded skills:\n\n" + "\n\n".join(skill_blocks))

        return "\n\n".join(sections)

    def _provider_summary(self) -> dict[str, Any]:
        return {
            "mode": "online" if self._config.openai_api_key else "offline",
            "model": self._config.openai_model,
            "baseUrl": self._config.openai_base_url,
            "hasApiKey": bool(self._config.openai_api_key),
        }

    def _prepare_run_dir(self, skill_identifier: str) -> Path:
        candidates: list[Path] = []
        if self._config.root_dir:
            candidates.append(self._config.root_dir / ".chuqin" / "runs")
        candidates.append(Path.cwd() / ".chuqin" / "runs")
        candidates.append(Path("/tmp/chuqin-runs"))

        stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        for runs_root in candidates:
            try:
                run_dir = runs_root / f"{skill_identifier}-{stamp}"
                run_dir.mkdir(parents=True, exist_ok=True)
                return run_dir
            except OSError:
                continue

        raise RuntimeError("Unable to create a writable run directory for skill execution")

    def _run_skill_job(self, job_id: str, skill: SkillRecord, file_path: Path) -> None:
        try:
            self._update_job(job_id, status="running", stage="preparing", progress_text="正在准备运行目录")
            run_dir = self._prepare_run_dir(skill.identifier)
            self._update_job(job_id, run_dir=str(run_dir), stage="loading", progress_text="正在加载 skill 脚本")

            if not skill.entry_script:
                raise RuntimeError(f"Skill is not executable: {skill.identifier}")

            self._update_job(job_id, stage="executing", progress_text=f"正在执行 {skill.entry_script.name}")
            analysis_text, image_paths = self._run_skill_entry(
                entry_script=skill.entry_script,
                file_path=file_path,
                run_dir=run_dir,
            )

            self._update_job(job_id, stage="collecting", progress_text="正在收集文本结果和图片")
            images = [self._image_payload(path) for path in image_paths]

            self._update_job(
                job_id,
                status="completed",
                stage="completed",
                progress_text="执行完成",
                summary=analysis_text,
                images=images,
            )
        except Exception as exc:  # noqa: BLE001
            self._update_job(
                job_id,
                status="error",
                stage="error",
                progress_text="执行失败",
                error=str(exc),
            )

    def _run_skill_entry(self, entry_script: Path, file_path: Path, run_dir: Path) -> tuple[str, list[Path]]:
        cache_dir = run_dir / ".cache"
        cache_dir.mkdir(parents=True, exist_ok=True)
        os.environ.setdefault("MPLBACKEND", "Agg")
        os.environ.setdefault("MPLCONFIGDIR", str(run_dir / ".matplotlib"))
        os.environ.setdefault("XDG_CACHE_HOME", str(cache_dir))
        (run_dir / ".matplotlib").mkdir(parents=True, exist_ok=True)

        module = self._load_module(entry_script)
        runner = self._resolve_skill_runner(module, entry_script)

        with self._pushd(run_dir):
            result = runner(str(file_path), str(run_dir))

        analysis_text = self._normalize_skill_output(result, run_dir)

        image_paths = sorted(
            path
            for path in run_dir.iterdir()
            if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}
        )
        return analysis_text, image_paths

    def _resolve_skill_runner(self, module: Any, entry_script: Path) -> Any:
        for attr_name in ("run", "main", "summarize_csv"):
            candidate = getattr(module, attr_name, None)
            if callable(candidate):
                return self._wrap_skill_runner(candidate, attr_name)
        raise RuntimeError(
            "Skill entry script must export one of: run(file_path, run_dir), "
            "main(file_path, run_dir), or summarize_csv(file_path). "
            f"Source: {entry_script}"
        )

    def _wrap_skill_runner(self, runner: Any, attr_name: str) -> Any:
        def invoke(file_path: str, run_dir: str) -> Any:
            if attr_name == "summarize_csv":
                return runner(file_path)

            try:
                signature = inspect.signature(runner)
            except (TypeError, ValueError):
                signature = None

            if signature is None:
                return runner(file_path, run_dir)

            params = signature.parameters
            accepts_var_kw = any(param.kind == inspect.Parameter.VAR_KEYWORD for param in params.values())
            accepts_var_positional = any(param.kind == inspect.Parameter.VAR_POSITIONAL for param in params.values())

            if "file_path" in params and ("run_dir" in params or accepts_var_kw):
                return runner(file_path=file_path, run_dir=run_dir)

            positional_params = [
                param for param in params.values()
                if param.kind in (inspect.Parameter.POSITIONAL_ONLY, inspect.Parameter.POSITIONAL_OR_KEYWORD)
            ]
            if accepts_var_positional or len(positional_params) >= 2:
                return runner(file_path, run_dir)
            if "file_path" in params or accepts_var_kw:
                return runner(file_path=file_path)
            if positional_params:
                return runner(file_path)

            return runner()

        return invoke

    def _normalize_skill_output(self, result: Any, run_dir: Path) -> str:
        if result is None:
            summary_file = run_dir / "summary.md"
            if summary_file.exists():
                return summary_file.read_text(encoding="utf-8").strip()
            return "Skill executed successfully."

        if isinstance(result, str):
            return result.strip()

        if isinstance(result, Path):
            return result.read_text(encoding="utf-8").strip()

        if isinstance(result, dict):
            for key in ("summary", "content", "text", "message"):
                value = result.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()
            return json.dumps(result, ensure_ascii=False, indent=2)

        if isinstance(result, (list, tuple)):
            return "\n".join(str(item) for item in result if str(item).strip()).strip()

        return str(result).strip()

    def _load_module(self, script_path: Path) -> Any:
        spec = importlib.util.spec_from_file_location(f"chuqin_skill_{script_path.stem}", script_path)
        if not spec or not spec.loader:
            raise RuntimeError(f"Unable to load skill analyzer: {script_path}")

        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def _image_payload(self, image_path: Path) -> dict[str, str]:
        encoded = base64.b64encode(image_path.read_bytes()).decode("ascii")
        return {
            "name": image_path.name,
            "path": str(image_path),
            "mimeType": "image/png",
            "base64": encoded,
        }

    def _get_skill(self, skill_id: str) -> SkillRecord:
        selected = self._skill_repository.get_selected_contents([skill_id])
        if not selected:
            raise ValueError(f"Skill not found: {skill_id}")
        return selected[0]

    def _update_job(self, job_id: str, **updates: Any) -> None:
        with self._jobs_lock:
            job = self._jobs[job_id]
            for key, value in updates.items():
                setattr(job, key, value)

    def _job_payload(self, job: SkillRunJob) -> dict[str, Any]:
        return {
            "jobId": job.job_id,
            "skillId": job.skill_id,
            "status": job.status,
            "stage": job.stage,
            "progressText": job.progress_text,
            "filePath": job.file_path,
            "runDir": job.run_dir,
            "summary": job.summary,
            "images": job.images or [],
            "error": job.error,
        }

    @contextmanager
    def _pushd(self, target_dir: Path):
        previous = Path.cwd()
        os.chdir(target_dir)
        try:
            yield
        finally:
            os.chdir(previous)


class ApiBridge:
    def __init__(self, config: AppConfig) -> None:
        self._agent_service = AgentService(config)
        self._window: Any = None

    def set_window(self, window: Any) -> None:
        self._window = window

    def get_state(self) -> dict[str, Any]:
        return self._agent_service.get_state()

    def getState(self) -> dict[str, Any]:
        return self._agent_service.get_state()

    def chat(self, payload: dict[str, Any]) -> dict[str, Any]:
        try:
            return self._agent_service.chat(payload)
        except Exception as exc:  # noqa: BLE001
            return {"error": str(exc)}

    def chatMessage(self, payload: dict[str, Any]) -> dict[str, Any]:
        try:
            return self._agent_service.chat(payload)
        except Exception as exc:  # noqa: BLE001
            return {"error": str(exc)}

    def open_csv_dialog(self) -> dict[str, Any]:
        if self._window is None:
            return {"error": "Window is not ready"}

        result = self._window.create_file_dialog(
            webview.OPEN_DIALOG,  # type: ignore[name-defined]
            allow_multiple=False,
            file_types=("CSV Files (*.csv)", "All files (*.*)"),
        )
        if not result:
            return {"cancelled": True}

        return {"path": str(result[0])}

    def openCsvDialog(self) -> dict[str, Any]:
        return self.open_csv_dialog()

    def analyze_csv(self, payload: dict[str, Any]) -> dict[str, Any]:
        try:
            return self._agent_service.analyze_csv(payload)
        except Exception as exc:  # noqa: BLE001
            return {"error": str(exc)}

    def analyzeCsv(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.analyze_csv(payload)

    def start_skill_run(self, payload: dict[str, Any]) -> dict[str, Any]:
        try:
            return self._agent_service.start_skill_run(payload)
        except Exception as exc:  # noqa: BLE001
            return {"error": str(exc)}

    def startSkillRun(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.start_skill_run(payload)

    def get_skill_run(self, payload: dict[str, Any]) -> dict[str, Any]:
        job_id = str(payload.get("jobId", "")).strip()
        if not job_id:
            return {"error": "jobId is required"}
        return self._agent_service.get_skill_run(job_id)

    def getSkillRun(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.get_skill_run(payload)
