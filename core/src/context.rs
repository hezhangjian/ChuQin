use crate::config::AppConfig;
use crate::{Error, Result};
use std::env;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct AppContext {
    pub root_dir: PathBuf,
    pub config: Option<AppConfig>,
    pub resources_dir: PathBuf,
    pub templates_dir: PathBuf,
}

pub fn load_context() -> Result<AppContext> {
    let root_dir = resolve_root_dir()?;
    let config_path = root_dir.join(".chuqin").join("config.toml");
    let config = if config_path.exists() {
        let content = fs::read_to_string(&config_path)?;
        Some(toml::from_str(&content)?)
    } else {
        None
    };

    let resources_dir = root_dir.join("resources");
    let templates_dir = resources_dir.join("templates");

    Ok(AppContext {
        root_dir,
        config,
        resources_dir,
        templates_dir,
    })
}

fn resolve_root_dir() -> Result<PathBuf> {
    if let Ok(value) = env::var("CHUQIN_DIR") {
        return Ok(PathBuf::from(value));
    }

    dirs::home_dir().ok_or(Error::MissingHomeDir)
}
