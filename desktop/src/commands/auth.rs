//! Authentication commands for managing login windows and capturing tokens.

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
pub fn open_auth_window(app: tauri::AppHandle, label: String, url: String) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&label) {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
        #[cfg(debug_assertions)]
        window.open_devtools();
        return Ok(());
    }

    let parsed_url = url.parse().map_err(|e| format!("Invalid URL: {}", e))?;

    let window = WebviewWindowBuilder::new(&app, &label, WebviewUrl::External(parsed_url))
        .title("Login")
        .inner_size(800.0, 600.0)
        .resizable(true)
        .build()
        .map_err(|e| e.to_string())?;

    #[cfg(debug_assertions)]
    window.open_devtools();

    Ok(())
}

#[tauri::command]
pub fn capture_tokens(app: tauri::AppHandle, label: String) -> Result<(), String> {
    let window = app
        .get_webview_window(&label)
        .ok_or("Login window not found")?;

    // Inject JS to extract cookies and emit them back to the main window
    let script = r#"
        (function() {
            try {
                const data = {
                    url: window.location.href,
                    cookies: document.cookie,
                    timestamp: new Date().toISOString()
                };
                // Emit event to the main window (or globally)
                window.__TAURI__.event.emit('auth-captured', data);
            } catch (e) {
                console.error('Capture failed', e);
            }
        })()
    "#;

    window.eval(script).map_err(|e| e.to_string())?;
    Ok(())
}
