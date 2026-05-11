use std::env;
use std::path::PathBuf;

use crate::Result;

#[derive(Debug, Clone)]
pub struct AppContext {
    pub root_dir: PathBuf,
    pub resources_dir: PathBuf,
    pub templates_dir: PathBuf,
}

pub fn load_context() -> Result<AppContext> {
    let root_dir = resolve_root_dir();
    let resources_dir = root_dir.join("resources");
    let templates_dir = resources_dir.join("templates");

    Ok(AppContext {
        root_dir,
        resources_dir,
        templates_dir,
    })
}

fn resolve_root_dir() -> PathBuf {
    if let Ok(value) = env::var("CHUQIN_DIR") {
        return PathBuf::from(value);
    }

    dirs::home_dir()
        .or_else(|| env::current_dir().ok())
        .unwrap_or_else(|| PathBuf::from("."))
}
