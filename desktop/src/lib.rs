//! Desktop backend for ChuQin app.
//!
//! This module initializes the Tauri application and manages the global state.

mod commands;

use chuqin_core::AppContext;
use std::sync::Mutex;
use tauri::Emitter;
use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};

const CLOSE_ACTIVE_TAB_EVENT: &str = "chuqin://close-active-tab";
const CLOSE_TAB_MENU_ID: &str = "close_active_tab";

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
        .setup(|app| {
            let handle = app.handle();
            let close_tab = MenuItemBuilder::with_id(CLOSE_TAB_MENU_ID, "Close Tab")
                .accelerator("CmdOrCtrl+W")
                .build(handle)?;
            let app_menu = SubmenuBuilder::new(handle, "chuqin")
                .about(None)
                .separator()
                .services()
                .separator()
                .hide()
                .hide_others()
                .show_all()
                .separator()
                .quit()
                .build()?;
            let file_menu = SubmenuBuilder::new(handle, "File").item(&close_tab).build()?;
            let edit_menu = SubmenuBuilder::new(handle, "Edit")
                .undo()
                .redo()
                .separator()
                .cut()
                .copy()
                .paste()
                .select_all()
                .build()?;
            let window_menu = SubmenuBuilder::new(handle, "Window")
                .minimize()
                .maximize()
                .fullscreen()
                .separator()
                .bring_all_to_front()
                .build()?;
            let menu = MenuBuilder::new(handle)
                .item(&app_menu)
                .item(&file_menu)
                .item(&edit_menu)
                .item(&window_menu)
                .build()?;

            app.set_menu(menu)?;

            Ok(())
        })
        .on_menu_event(|app, event| {
            if event.id().as_ref() == CLOSE_TAB_MENU_ID {
                let _ = app.emit(CLOSE_ACTIVE_TAB_EVENT, ());
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::files::files_delete,
            commands::files::files_list,
            commands::files::files_read_text,
            commands::files::files_rename,
            commands::files::files_root,
            commands::files::files_write_text,
            commands::ppt::ppt_create,
            commands::ppt::ppt_templates,
            commands::word::word_create,
            commands::word::word_templates,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
