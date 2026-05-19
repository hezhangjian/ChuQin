use crate::config::{AppConfig, read_config};
use crate::{Error, Result};
use std::env;
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
    let config = read_config(&root_dir)?;

    let resources_dir = root_dir.join("Resources");
    let templates_dir = resources_dir.join("Templates");

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
