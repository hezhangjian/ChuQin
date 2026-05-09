#[tauri::command]
fn runtime_info() -> serde_json::Value {
    serde_json::to_value(chuqin_core::runtime_info()).expect("runtime info should serialize")
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![runtime_info])
        .run(tauri::generate_context!())
        .expect("failed to run ChuQin tauri application");
}
