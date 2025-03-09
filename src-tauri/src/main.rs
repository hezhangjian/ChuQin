// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod huaweicloud;

use config::{get_config, save_config};
use huaweicloud::huaweicloud_get_token;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_config,
            save_config,
            huaweicloud_get_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
