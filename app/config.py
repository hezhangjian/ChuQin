import json
import os
import tomllib
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


CONFIG_ENV_VAR = "CHUQIN_DIR"
CONFIG_DIR_NAME = ".chuqin"
CONFIG_FILE_NAME = "config.toml"


def _resolve_root_dir() -> Path:
    env_root = os.getenv(CONFIG_ENV_VAR, "").strip()
    if env_root:
        return Path(env_root).expanduser().resolve()

    return Path.home().resolve()


def _get_str(data: dict[str, Any], key: str) -> str:
    value = data.get(key, "")
    return value if isinstance(value, str) else ""


def _get_section(data: dict[str, Any], key: str) -> dict[str, Any]:
    value = data.get(key, {})
    return value if isinstance(value, dict) else {}


def _toml_string(value: str) -> str:
    # JSON string escaping is compatible with TOML basic strings here.
    return json.dumps(value)


@dataclass(slots=True)
class OpenAIConfig:
    model: str = ""
    base_url: str = ""
    api_key: str = ""


@dataclass(slots=True)
class HuaweiCloudConfig:
    username: str = ""
    password: str = ""
    project_id: str = ""


@dataclass(slots=True)
class AppConfig:
    # Keep defaults non-None so desktop app can start and persist config
    # even when no config file exists yet.
    openai: OpenAIConfig = field(default_factory=OpenAIConfig)
    huaweicloud: HuaweiCloudConfig = field(default_factory=HuaweiCloudConfig)

    @property
    def root_path(self) -> Path:
        return _resolve_root_dir()

    @property
    def skills_dir(self) -> Path:
        return self.root_path / "skills"


def get_config_dir() -> Path:
    return _resolve_root_dir() / CONFIG_DIR_NAME


def get_config_path() -> Path:
    return get_config_dir() / CONFIG_FILE_NAME


def load_config() -> AppConfig:
    config_path = get_config_path()
    if not config_path.exists():
        return AppConfig()

    with config_path.open("rb") as config_file:
        data = tomllib.load(config_file)

    openai = _get_section(data, "openai")
    huaweicloud = _get_section(data, "huaweicloud")

    return AppConfig(
        openai=OpenAIConfig(
            model=_get_str(openai, "model"),
            base_url=_get_str(openai, "base_url"),
            api_key=_get_str(openai, "api_key"),
        ),
        huaweicloud=HuaweiCloudConfig(
            username=_get_str(huaweicloud, "username"),
            password=_get_str(huaweicloud, "password"),
            project_id=_get_str(huaweicloud, "project_id"),
        ),
    )


def save_config(config: AppConfig) -> Path:
    config_dir = get_config_dir()
    config_dir.mkdir(parents=True, exist_ok=True)

    config_path = get_config_path()
    lines = [
        "[openai]",
        f"model = {_toml_string(config.openai.model)}",
        f"base_url = {_toml_string(config.openai.base_url)}",
        f"api_key = {_toml_string(config.openai.api_key)}",
        "",
        "[huaweicloud]",
        f"username = {_toml_string(config.huaweicloud.username)}",
        f"password = {_toml_string(config.huaweicloud.password)}",
        f"project_id = {_toml_string(config.huaweicloud.project_id)}",
        "",
    ]
    config_path.write_text("\n".join(lines), encoding="utf-8")
    return config_path
