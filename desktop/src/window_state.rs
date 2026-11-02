use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::utils::config::WindowConfig;
use tauri::{
    App, LogicalSize, Manager, PhysicalPosition, PhysicalSize, Runtime, WebviewWindow, WebviewWindowBuilder, Window,
    WindowEvent,
};

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

pub fn create_main_window<R: Runtime>(app: &App<R>) -> tauri::Result<WebviewWindow<R>> {
    let config = app
        .config()
        .app
        .windows
        .iter()
        .find(|config| config.label == "main")
        .ok_or(tauri::Error::WindowNotFound)?
        .clone();
    let monitor = app.primary_monitor()?;
    let scale_factor = monitor.as_ref().map(|monitor| monitor.scale_factor()).unwrap_or(1.0);
    let config = restored_window_config(config, read_state(app), scale_factor);
    // Restore maximization after positioning so macOS's queued initial position
    // cannot move an already-maximized window away from the work area.
    let builder = WebviewWindowBuilder::from_config(app, &config)?.maximized(false);

    // Decorations affect the outer size used to center the window on Windows.
    #[cfg(target_os = "windows")]
    let builder = builder.decorations(false);

    let window = builder.build()?;
    if let Some(monitor) = monitor {
        // Account for native borders using the final outer size. macOS's center()
        // uses optical centering, so calculate the geometric center explicitly.
        let area = monitor.work_area();
        let inner = window.inner_size()?;
        let outer = window.outer_size()?;
        let border = PhysicalSize::new(
            outer.width.saturating_sub(inner.width),
            outer.height.saturating_sub(inner.height),
        );
        let requested = LogicalSize::new(config.width, config.height).to_physical::<u32>(scale_factor);
        let inner_size = PhysicalSize::new(
            requested.width.min(area.size.width.saturating_sub(border.width)),
            requested.height.min(area.size.height.saturating_sub(border.height)),
        );
        if inner != inner_size {
            window.set_size(inner_size)?;
        }
        // Use the requested size because native resizing can finish asynchronously.
        let size = PhysicalSize::new(inner_size.width + border.width, inner_size.height + border.height);
        window.set_position(PhysicalPosition::new(
            area.position.x + (area.size.width as i32 - size.width as i32) / 2,
            area.position.y + (area.size.height as i32 - size.height as i32) / 2,
        ))?;
    }

    if config.maximized {
        window.maximize()?;
    }

    Ok(window)
}

fn restored_window_config(mut config: WindowConfig, state: Option<MainWindowState>, scale_factor: f64) -> WindowConfig {
    if let Some(state) = state.filter(|state| has_valid_size(state.width, state.height)) {
        // Persisted sizes are physical pixels; the window builder expects logical units.
        let size = PhysicalSize::new(state.width, state.height).to_logical::<f64>(scale_factor);
        config.width = size.width;
        config.height = size.height;
        config.maximized = state.maximized;
    }

    config
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

#[cfg(test)]
mod tests {
    use super::*;

    fn main_window_config() -> WindowConfig {
        let config: tauri::utils::config::Config = serde_json::from_str(include_str!("../tauri.conf.json")).unwrap();
        config
            .app
            .windows
            .into_iter()
            .find(|config| config.label == "main")
            .unwrap()
    }

    #[test]
    fn startup_centers_the_restored_size_before_showing() {
        let config = main_window_config();
        assert!(!config.create);
        assert!(!config.visible);
        assert!(config.center);
        assert!(matches!(
            config.prevent_overflow,
            Some(tauri::utils::config::PreventOverflowConfig::Enable(true))
        ));
        assert!(config.x.is_none() && config.y.is_none());
    }

    #[test]
    fn first_launch_uses_default_logical_size() {
        let config = restored_window_config(main_window_config(), None, 2.0);
        assert_eq!((config.width, config.height), (1440.0, 960.0));
        assert!(!config.maximized);
    }

    #[test]
    fn restores_physical_size_at_each_display_scale() {
        for scale_factor in [1.0, 1.25, 1.5, 2.0] {
            let state = MainWindowState {
                width: 1600,
                height: 1000,
                maximized: false,
            };
            let config = restored_window_config(main_window_config(), Some(state), scale_factor);
            assert_eq!(config.width * scale_factor, 1600.0);
            assert_eq!(config.height * scale_factor, 1000.0);
            assert!(!config.maximized);
        }
    }

    #[test]
    fn restores_maximized_state_and_normal_size_together() {
        let state = MainWindowState {
            width: 1600,
            height: 1000,
            maximized: true,
        };
        let config = restored_window_config(main_window_config(), Some(state), 2.0);
        assert_eq!((config.width, config.height), (800.0, 500.0));
        assert!(config.maximized);
    }

    #[test]
    fn invalid_saved_size_keeps_defaults() {
        for (width, height) in [(0, 0), (639, 960), (1440, 479)] {
            let state = MainWindowState {
                width,
                height,
                maximized: true,
            };
            let config = restored_window_config(main_window_config(), Some(state), 2.0);
            assert_eq!((config.width, config.height), (1440.0, 960.0));
            assert!(!config.maximized);
        }
    }
}
