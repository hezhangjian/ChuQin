use std::fs;
use std::path::{Path, PathBuf};

use crate::{Error, Result};

use super::model::AppConfig;

pub const CONFIG_RELATIVE_PATH: &str = ".chuqin/config.toml";

pub fn config_path(root_dir: impl AsRef<Path>) -> PathBuf {
    root_dir.as_ref().join(CONFIG_RELATIVE_PATH)
}

pub fn read_config(root_dir: impl AsRef<Path>) -> Result<Option<AppConfig>> {
    let path = config_path(root_dir);

    if !path.exists() {
        return Ok(None);
    }

    let content = fs::read_to_string(path)?;
    Ok(Some(toml::from_str(&content)?))
}

pub fn write_config(root_dir: impl AsRef<Path>, config: &AppConfig) -> Result<String> {
    let path = config_path(root_dir);
    let parent = path
        .parent()
        .ok_or_else(|| Error::InvalidPath("unable to resolve config directory".to_string()))?;
    let content = toml::to_string_pretty(config)?;

    fs::create_dir_all(parent)?;
    fs::write(path, &content)?;

    Ok(content)
}
