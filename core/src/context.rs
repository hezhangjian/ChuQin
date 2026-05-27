use crate::config::{AppConfig, read_config};
use crate::{Error, Result};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};

const USER_CONFIG_RELATIVE_PATH: &str = ".config/chuqin/config.toml";

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
    let home_dir = dirs::home_dir().ok_or(Error::MissingHomeDir)?;
    resolve_root_dir_with(env::var("CHUQIN_DIR").ok(), &home_dir)
}

fn resolve_root_dir_with(env_value: Option<String>, home_dir: &Path) -> Result<PathBuf> {
    if let Some(value) = env_value {
        let value = value.trim();
        if !value.is_empty() {
            return Ok(expand_home(value, home_dir));
        }
    }

    if let Some(workdir) = read_user_config_workdir(home_dir)? {
        return Ok(expand_home(&workdir, home_dir));
    }

    Ok(home_dir.to_path_buf())
}

fn read_user_config_workdir(home_dir: &Path) -> Result<Option<String>> {
    let path = home_dir.join(USER_CONFIG_RELATIVE_PATH);

    if !path.exists() {
        return Ok(None);
    }

    let content = fs::read_to_string(path)?;
    Ok(parse_user_config_workdir(&content))
}

fn parse_user_config_workdir(content: &str) -> Option<String> {
    #[derive(serde::Deserialize)]
    struct UserConfig {
        workdir: Option<String>,
    }

    if let Ok(config) = toml::from_str::<UserConfig>(content)
        && let Some(workdir) = normalize_workdir(config.workdir.as_deref())
    {
        return Some(workdir);
    }

    content.lines().find_map(|line| {
        let line = line.split_once('#').map_or(line, |(value, _)| value).trim();
        let (key, value) = line.split_once('=')?;
        if key.trim() != "workdir" {
            return None;
        }
        normalize_workdir(Some(value))
    })
}

fn normalize_workdir(value: Option<&str>) -> Option<String> {
    let value = value?.trim().trim_matches('"').trim_matches('\'').trim();
    (!value.is_empty()).then(|| value.to_string())
}

fn expand_home(value: &str, home_dir: &Path) -> PathBuf {
    if value == "~" {
        return home_dir.to_path_buf();
    }

    if let Some(rest) = value.strip_prefix("~/") {
        return home_dir.join(rest);
    }

    PathBuf::from(value)
}
