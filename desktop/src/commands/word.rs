use chuqin_core::word::{CreateOptions, create_word, list_templates};
use tauri::State;

use crate::AppState;

#[tauri::command]
pub fn word_create(
    state: State<AppState>,
    title: String,
    output: Option<String>,
    overwrite: bool,
    template: Option<String>,
) -> Result<String, String> {
    let ctx = state.context.lock().map_err(|e| e.to_string())?;
    let output_path = output.map(|p| p.into());
    let options = CreateOptions {
        output: output_path,
        overwrite,
        template,
    };
    let path = create_word(&ctx, &title, &options).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn word_templates(state: State<AppState>) -> Result<Vec<chuqin_core::word::TemplateInfo>, String> {
    let ctx = state.context.lock().map_err(|e| e.to_string())?;
    list_templates(&ctx).map_err(|e| e.to_string())
}
