use chuqin_core::excel::{CreateOptions, create_excel};
use tauri::State;

use crate::AppState;

#[tauri::command]
pub fn excel_create(
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
    let path = create_excel(&ctx, &title, &options).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}
