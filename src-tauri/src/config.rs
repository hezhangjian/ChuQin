use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct HuaweiCloudConfig {
    pub username: String,
    pub password: String,
    pub project_id: String,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Config {
    #[serde(rename = "HuaweiCloud")]
    pub huawei_cloud: HuaweiCloudConfig,
}

impl Config {
    pub fn load() -> Result<Self> {
        let config_path = get_config_path()?;
        if !config_path.exists() {
            let config = Config::default();
            config.save()?;
            return Ok(config);
        }

        let content = fs::read_to_string(&config_path)
            .with_context(|| format!("Failed to read config file: {:?}", config_path))?;
        let config: Config = toml::from_str(&content)
            .with_context(|| format!("Failed to parse config file: {:?}", config_path))?;
        Ok(config)
    }

    pub fn save(&self) -> Result<()> {
        let config_path = get_config_path()?;
        if let Some(parent) = config_path.parent() {
            fs::create_dir_all(parent)
                .with_context(|| format!("Failed to create config directory: {:?}", parent))?;
        }

        let content = toml::to_string_pretty(self)
            .with_context(|| "Failed to serialize config")?;
        fs::write(&config_path, content)
            .with_context(|| format!("Failed to write config file: {:?}", config_path))?;
        Ok(())
    }
}

fn get_config_path() -> Result<PathBuf> {
    let home_dir = dirs::home_dir()
        .context("Failed to get home directory")?;
    Ok(home_dir.join(".chuqin").join("chuqin.toml"))
}

#[tauri::command]
pub async fn save_config(config: HuaweiCloudConfig) -> Result<(), String> {
    let mut full_config = Config::default();
    full_config.huawei_cloud = config;
    full_config.save().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_config() -> Result<HuaweiCloudConfig, String> {
    Config::load()
        .map(|config| config.huawei_cloud)
        .map_err(|e| e.to_string())
} 