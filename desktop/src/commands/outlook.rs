use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;

use chuqin_core::outlook::BackupPstProgress;
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, State};

use crate::AppState;
use crate::events;

#[derive(Debug, Serialize)]
pub struct OutlookBackupPstResult {
    pub backup_path: String,
    pub file_count: usize,
    pub source_dir: String,
}

#[derive(Debug, Serialize)]
pub struct OutlookBackupPstStartResult {
    pub task_id: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum OutlookBackupPstProgressEvent {
    Scanning {
        source_dir: String,
        task_id: String,
    },
    Compressing {
        backup_path: String,
        completed_files: usize,
        current_file: String,
        current_file_bytes: u64,
        current_file_total_bytes: u64,
        source_dir: String,
        task_id: String,
        total_bytes: u64,
        total_files: usize,
        written_bytes: u64,
    },
    Finishing {
        backup_path: String,
        file_count: usize,
        source_dir: String,
        task_id: String,
    },
    Completed {
        backup_path: String,
        file_count: usize,
        source_dir: String,
        task_id: String,
    },
    Canceled {
        task_id: String,
    },
    Failed {
        error: String,
        task_id: String,
    },
}

#[tauri::command]
pub fn outlook_backup_pst(state: State<AppState>) -> Result<OutlookBackupPstResult, String> {
    let ctx = state.context.lock().map_err(|e| e.to_string())?;
    let summary = chuqin_core::outlook::backup_pst(&ctx).map_err(|e| e.to_string())?;

    Ok(OutlookBackupPstResult {
        backup_path: summary.backup_path.to_string_lossy().to_string(),
        file_count: summary.file_count,
        source_dir: summary.source_dir.to_string_lossy().to_string(),
    })
}

#[tauri::command]
pub fn outlook_backup_pst_start(
    app: AppHandle,
    task_id: Option<String>,
    state: State<AppState>,
) -> Result<OutlookBackupPstStartResult, String> {
    let task_id = task_id.unwrap_or_else(|| {
        let task_number = state.outlook_backup_task_counter.fetch_add(1, Ordering::Relaxed);
        format!("outlook-backup-pst-{task_number}")
    });
    let cancel_token = Arc::new(AtomicBool::new(false));
    let ctx = state.context.lock().map_err(|e| e.to_string())?.clone();

    state
        .outlook_backup_tasks
        .lock()
        .map_err(|e| e.to_string())?
        .insert(task_id.clone(), Arc::clone(&cancel_token));

    let event_task_id = task_id.clone();
    thread::spawn(move || {
        let result = chuqin_core::outlook::backup_pst_with_progress(
            &ctx,
            |progress| {
                let payload = progress_to_event(&event_task_id, progress);
                let _ = app.emit(events::OUTLOOK_BACKUP_PST_PROGRESS, payload);
            },
            || cancel_token.load(Ordering::Relaxed),
        );

        let was_canceled = cancel_token.load(Ordering::Relaxed);
        let payload = match result {
            Ok(_summary) if was_canceled => OutlookBackupPstProgressEvent::Canceled {
                task_id: event_task_id.clone(),
            },
            Ok(summary) => OutlookBackupPstProgressEvent::Completed {
                backup_path: summary.backup_path.to_string_lossy().to_string(),
                file_count: summary.file_count,
                source_dir: summary.source_dir.to_string_lossy().to_string(),
                task_id: event_task_id.clone(),
            },
            Err(_error) if was_canceled => OutlookBackupPstProgressEvent::Canceled {
                task_id: event_task_id.clone(),
            },
            Err(error) => OutlookBackupPstProgressEvent::Failed {
                error: error.to_string(),
                task_id: event_task_id.clone(),
            },
        };

        let _ = app.emit(events::OUTLOOK_BACKUP_PST_PROGRESS, payload);
        let app_state = app.state::<AppState>();
        if let Ok(mut tasks) = app_state.outlook_backup_tasks.lock() {
            tasks.remove(&event_task_id);
        }
    });

    Ok(OutlookBackupPstStartResult { task_id })
}

#[tauri::command]
pub fn outlook_backup_pst_cancel(task_id: String, state: State<AppState>) -> Result<(), String> {
    if let Some(cancel_token) = state
        .outlook_backup_tasks
        .lock()
        .map_err(|e| e.to_string())?
        .get(&task_id)
    {
        cancel_token.store(true, Ordering::Relaxed);
    }

    Ok(())
}

fn progress_to_event(task_id: &str, progress: BackupPstProgress) -> OutlookBackupPstProgressEvent {
    match progress {
        BackupPstProgress::Scanning { source_dir } => OutlookBackupPstProgressEvent::Scanning {
            source_dir: source_dir.to_string_lossy().to_string(),
            task_id: task_id.to_string(),
        },
        BackupPstProgress::Compressing {
            backup_path,
            completed_files,
            current_file,
            current_file_bytes,
            current_file_total_bytes,
            source_dir,
            total_bytes,
            total_files,
            written_bytes,
        } => OutlookBackupPstProgressEvent::Compressing {
            backup_path: backup_path.to_string_lossy().to_string(),
            completed_files,
            current_file: current_file.to_string_lossy().to_string(),
            current_file_bytes,
            current_file_total_bytes,
            source_dir: source_dir.to_string_lossy().to_string(),
            task_id: task_id.to_string(),
            total_bytes,
            total_files,
            written_bytes,
        },
        BackupPstProgress::Finishing {
            backup_path,
            file_count,
            source_dir,
        } => OutlookBackupPstProgressEvent::Finishing {
            backup_path: backup_path.to_string_lossy().to_string(),
            file_count,
            source_dir: source_dir.to_string_lossy().to_string(),
            task_id: task_id.to_string(),
        },
    }
}
