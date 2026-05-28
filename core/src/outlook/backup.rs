use std::fs;
use std::path::{Path, PathBuf};

use chrono::Local;
use walkdir::WalkDir;

use crate::context::AppContext;
use crate::util::paths::ensure_writable_output;
use crate::util::zip_utils::{write_zip_archive, write_zip_archive_with_progress};
use crate::{Error, Result};

#[derive(Debug, Clone)]
pub struct BackupSummary {
    pub source_dir: PathBuf,
    pub backup_path: PathBuf,
    pub file_count: usize,
}

#[derive(Debug, Clone)]
pub enum BackupPstProgress {
    Scanning {
        source_dir: PathBuf,
    },
    Compressing {
        backup_path: PathBuf,
        completed_files: usize,
        current_file: PathBuf,
        current_file_bytes: u64,
        current_file_total_bytes: u64,
        source_dir: PathBuf,
        total_bytes: u64,
        total_files: usize,
        written_bytes: u64,
    },
    Finishing {
        backup_path: PathBuf,
        file_count: usize,
        source_dir: PathBuf,
    },
}

pub fn backup_pst(ctx: &AppContext) -> Result<BackupSummary> {
    let source_dir = default_email_dir()?;
    let backup_dir = ctx.root_dir.join("Resources").join("Email");
    fs::create_dir_all(&backup_dir)?;

    let date = Local::now().format("%Y%m%d");
    let backup_path = backup_dir.join(format!("email-{date}.zip"));
    ensure_writable_output(&backup_path, true)?;

    let pst_files = collect_pst_files(&source_dir)?;
    write_zip_archive(&backup_path, &source_dir, &pst_files)?;

    Ok(BackupSummary {
        source_dir,
        backup_path,
        file_count: pst_files.len(),
    })
}

pub fn backup_pst_with_progress<F, C>(ctx: &AppContext, mut on_progress: F, should_cancel: C) -> Result<BackupSummary>
where
    F: FnMut(BackupPstProgress),
    C: Fn() -> bool,
{
    let source_dir = default_email_dir()?;
    on_progress(BackupPstProgress::Scanning {
        source_dir: source_dir.clone(),
    });

    let backup_dir = ctx.root_dir.join("Resources").join("Email");
    fs::create_dir_all(&backup_dir)?;

    let date = Local::now().format("%Y%m%d");
    let backup_path = backup_dir.join(format!("email-{date}.zip"));
    ensure_writable_output(&backup_path, true)?;

    let pst_files = collect_pst_files(&source_dir)?;
    let backup_result = write_zip_archive_with_progress(
        &backup_path,
        &source_dir,
        &pst_files,
        |progress| {
            on_progress(BackupPstProgress::Compressing {
                backup_path: backup_path.clone(),
                completed_files: progress.completed_files,
                current_file: progress.current_file,
                current_file_bytes: progress.current_file_bytes,
                current_file_total_bytes: progress.current_file_total_bytes,
                source_dir: source_dir.clone(),
                total_bytes: progress.total_bytes,
                total_files: progress.total_files,
                written_bytes: progress.written_bytes,
            });
        },
        should_cancel,
    );

    if backup_result.is_err() {
        let _ = fs::remove_file(&backup_path);
    }

    backup_result?;
    on_progress(BackupPstProgress::Finishing {
        backup_path: backup_path.clone(),
        file_count: pst_files.len(),
        source_dir: source_dir.clone(),
    });

    Ok(BackupSummary {
        source_dir,
        backup_path,
        file_count: pst_files.len(),
    })
}

fn default_email_dir() -> Result<PathBuf> {
    #[cfg(target_os = "macos")]
    {
        let home = dirs::home_dir().ok_or(Error::MissingHomeDir)?;
        Ok(home.join("Email"))
    }

    #[cfg(target_os = "windows")]
    {
        Ok(PathBuf::from("D:/Email"))
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let home = dirs::home_dir().ok_or(Error::MissingHomeDir)?;
        Ok(home.join("Email"))
    }
}

fn collect_pst_files(source_dir: &Path) -> Result<Vec<PathBuf>> {
    if !source_dir.exists() {
        return Ok(Vec::new());
    }

    let mut files = Vec::new();
    for entry in WalkDir::new(source_dir) {
        let entry = entry.map_err(|err| Error::InvalidInput(err.to_string()))?;
        if entry.file_type().is_file()
            && entry
                .path()
                .extension()
                .is_some_and(|ext| ext.eq_ignore_ascii_case("pst"))
        {
            files.push(entry.path().to_path_buf());
        }
    }

    Ok(files)
}
