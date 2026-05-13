use chuqin_core::list_ppt_templates;
use tauri::State;

use crate::AppState;

#[tauri::command]
pub fn ppt_templates(state: State<AppState>) -> Result<Vec<chuqin_core::PptTemplateInfo>, String> {
    let ctx = state.context.lock().map_err(|e| e.to_string())?;
    list_ppt_templates(&ctx).map_err(|e| e.to_string())
}
