//! Desktop backend for ChuQin app.
//!
//! This module initializes the Tauri application and manages the global state.

mod commands;

use chuqin_core::AppContext;
use std::sync::Mutex;

/// Global application state shared across all Tauri commands.
pub struct AppState {
    context: Mutex<AppContext>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let context = chuqin_core::load_context().expect("Failed to load ChuQin context");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            context: Mutex::new(context),
        })
        .invoke_handler(tauri::generate_handler![
            commands::files::files_delete,
            commands::files::files_list,
            commands::files::files_rename,
            commands::ppt::ppt_templates,
            commands::word::word_templates,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
