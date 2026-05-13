//! File system commands for ChuQin root directory.
//!
//! All operations are scoped to the ChuQin root directory and include
//! path traversal protection. These are the system boundary between
//! the frontend and the core file operations.

use chuqin_core::{delete_path, list_directory, rename_path, FileNode};
use tauri::State;

use crate::AppState;

/// Delete a file or directory within the ChuQin root.
///
/// # Arguments
/// * `path` - Relative path from the ChuQin root (e.g., "Projects/foo.md")
///
/// # Errors
/// Returns error if path is invalid, outside root, or doesn't exist.
#[tauri::command]
pub fn files_delete(state: State<AppState>, path: String) -> Result<(), String> {
    let ctx = state.context.lock().map_err(|e| e.to_string())?;
    delete_path(&ctx, &path).map_err(|e| e.to_string())
}

/// List files and directories within the ChuQin root.
///
/// # Arguments
/// * `path` - Optional relative path. If None, lists the root directory.
///
/// # Returns
/// Vector of FileNode with name, path, is_dir, and optional children.
///
/// # Errors
/// Returns error if path is invalid or outside root.
#[tauri::command]
pub fn files_list(state: State<AppState>, path: Option<String>) -> Result<Vec<FileNode>, String> {
    let ctx = state.context.lock().map_err(|e| e.to_string())?;
    list_directory(&ctx, path.as_deref()).map_err(|e| e.to_string())
}

/// Rename a file or directory within the ChuQin root.
///
/// # Arguments
/// * `old_path` - Current relative path from the ChuQin root
/// * `new_name` - New filename (not a path, just the name)
///
/// # Errors
/// Returns error if path is invalid, outside root, doesn't exist,
/// or if new_name contains path separators.
#[tauri::command]
pub fn files_rename(
    state: State<AppState>,
    old_path: String,
    new_name: String,
) -> Result<(), String> {
    let ctx = state.context.lock().map_err(|e| e.to_string())?;
    rename_path(&ctx, &old_path, &new_name).map_err(|e| e.to_string())
}