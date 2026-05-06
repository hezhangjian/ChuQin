use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::io;
use std::path::PathBuf;

const CONFIG_ENV_VAR: &str = "CHUQIN_DIR";
const CONFIG_DIR_NAME: &str = ".chuqin";
const CONFIG_FILE_NAME: &str = "config.toml";

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct OpenAIConfig {
    pub model: String,
    pub base_url: String,
    pub api_key: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct HuaweiCloudConfig {
    pub username: String,
    pub password: String,
    pub project_id: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct VolcEngineConfig {
    pub ak: String,
    pub sk: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct TokenConfig {
    pub token: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct AppConfig {
    pub openai: OpenAIConfig,
    pub huaweicloud: HuaweiCloudConfig,
    pub volcengine: VolcEngineConfig,
    pub github: TokenConfig,
    pub gitee: TokenConfig,
    pub gitcode: TokenConfig,
}

pub fn get_config_dir() -> PathBuf {
    resolve_root_dir().join(CONFIG_DIR_NAME)
}

pub fn get_config_path() -> PathBuf {
    get_config_dir().join(CONFIG_FILE_NAME)
}

pub fn load_config() -> Result<AppConfig, io::Error> {
    let config_path = get_config_path();
    if !config_path.exists() {
        return Ok(AppConfig::default());
    }

    let raw = fs::read_to_string(config_path)?;
    let parsed = toml::from_str::<AppConfig>(&raw).unwrap_or_default();
    Ok(parsed)
}

pub fn save_config(config: &AppConfig) -> Result<PathBuf, io::Error> {
    let config_dir = get_config_dir();
    fs::create_dir_all(&config_dir)?;

    let raw = toml::to_string(config)
        .map_err(|error| io::Error::new(io::ErrorKind::InvalidData, error))?;
    let config_path = get_config_path();
    fs::write(&config_path, raw)?;
    Ok(config_path)
}

fn resolve_root_dir() -> PathBuf {
    if let Ok(value) = env::var(CONFIG_ENV_VAR) {
        let trimmed = value.trim();
        if !trimmed.is_empty() {
            return PathBuf::from(trimmed);
        }
    }

    env::var("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("."))
}
