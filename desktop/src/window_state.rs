use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{Manager, PhysicalSize, Runtime, WebviewWindow, Window, WindowEvent};

const STATE_FILE_NAME: &str = "window-state.json";
const DEFAULT_WINDOW_HEIGHT: u32 = 960;
const DEFAULT_WINDOW_WIDTH: u32 = 1440;
const MIN_WINDOW_HEIGHT: u32 = 480;
const MIN_WINDOW_WIDTH: u32 = 640;

#[derive(Debug, Clone, Deserialize, Serialize)]
struct MainWindowState {
    width: u32,
    height: u32,
    maximized: bool,
}

pub fn restore_main_window<R: Runtime>(window: &WebviewWindow<R>) {
    let Some(state) = read_state(window).filter(|state| has_valid_size(state.width, state.height)) else {
        return;
    };

    let _ = window.set_size(PhysicalSize::new(state.width, state.height));

    if state.maximized {
        let _ = window.maximize();
    }
}

pub fn save_main_window_on_event<R: Runtime>(window: &Window<R>, event: &WindowEvent) {
    match event {
        WindowEvent::Resized(_)
        | WindowEvent::ScaleFactorChanged { .. }
        | WindowEvent::CloseRequested { .. }
        | WindowEvent::Destroyed => save_main_window(window),
        _ => {}
    }
}

fn save_main_window<R: Runtime>(window: &Window<R>) {
    let maximized = window.is_maximized().unwrap_or(false);
    let previous_state = read_state(window);
    let normal_size = if maximized {
        previous_state
            .as_ref()
            .map(|state| PhysicalSize::new(state.width, state.height))
            .or(Some(PhysicalSize::new(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT)))
    } else {
        window.inner_size().ok()
    };

    let Some(size) = normal_size.filter(|size| has_valid_size(size.width, size.height)) else {
        return;
    };

    let state = MainWindowState {
        width: size.width,
        height: size.height,
        maximized,
    };

    if let Ok(content) = serde_json::to_string_pretty(&state)
        && let Some(path) = state_path(window)
    {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        let _ = fs::write(path, content);
    }
}

fn read_state<R: Runtime, M: Manager<R>>(manager: &M) -> Option<MainWindowState> {
    let path = state_path(manager)?;
    let content = fs::read_to_string(path).ok()?;
    serde_json::from_str(&content).ok()
}

fn state_path<R: Runtime, M: Manager<R>>(manager: &M) -> Option<PathBuf> {
    manager
        .path()
        .app_config_dir()
        .ok()
        .map(|dir| dir.join(STATE_FILE_NAME))
}

fn has_valid_size(width: u32, height: u32) -> bool {
    width >= MIN_WINDOW_WIDTH && height >= MIN_WINDOW_HEIGHT
}
