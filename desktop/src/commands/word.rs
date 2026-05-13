use chuqin_core::word::list_templates;
use tauri::State;

use crate::AppState;

#[tauri::command]
pub fn word_templates(state: State<AppState>) -> Result<Vec<chuqin_core::word::TemplateInfo>, String> {
    let ctx = state.context.lock().map_err(|e| e.to_string())?;
    list_templates(&ctx).map_err(|e| e.to_string())
}
