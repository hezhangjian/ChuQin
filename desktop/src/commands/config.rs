//! Configuration commands for the ChuQin root.
//!
//! Configuration is stored at `.chuqin/config.toml` under the active root.

use std::fs;

use chuqin_core::AppConfig;
use chuqin_core::config::{ConfigPatch, config_path, read_config, update_config, write_config};
use tauri::State;

use crate::AppState;

/// Read the root configuration TOML.
#[tauri::command]
pub fn config_read(state: State<AppState>) -> Result<Option<String>, String> {
    let ctx = state.context.lock().map_err(|e| e.to_string())?;
    let config_path = config_path(&ctx.root_dir);

    if !config_path.exists() {
        return Ok(None);
    }

    fs::read_to_string(&config_path).map(Some).map_err(|e| e.to_string())
}

/// Read and parse the root configuration.
#[tauri::command]
pub fn config_get(state: State<AppState>) -> Result<Option<AppConfig>, String> {
    let ctx = state.context.lock().map_err(|e| e.to_string())?;
    read_config(&ctx.root_dir).map_err(|e| e.to_string())
}

/// Validate and write the root configuration TOML.
#[tauri::command]
pub fn config_write(state: State<AppState>, content: String) -> Result<String, String> {
    let parsed_config: AppConfig = toml::from_str(&content).map_err(|e| e.to_string())?;
    let mut ctx = state.context.lock().map_err(|e| e.to_string())?;
    let saved_content = write_config(&ctx.root_dir, &parsed_config).map_err(|e| e.to_string())?;

    ctx.config = Some(parsed_config);

    Ok(saved_content)
}

/// Apply a partial update to the root configuration.
#[tauri::command]
pub fn config_update(state: State<AppState>, patch: ConfigPatch) -> Result<AppConfig, String> {
    let mut ctx = state.context.lock().map_err(|e| e.to_string())?;
    let config = update_config(&ctx.root_dir, patch).map_err(|e| e.to_string())?;

    ctx.config = Some(config.clone());

    Ok(config)
}
