use chuqin_core::ppt::list_templates;
use tauri::State;

use crate::AppState;

#[tauri::command]
pub fn ppt_templates(state: State<AppState>) -> Result<Vec<chuqin_core::ppt::TemplateInfo>, String> {
    let ctx = state.context.lock().map_err(|e| e.to_string())?;
    list_templates(&ctx).map_err(|e| e.to_string())
}
