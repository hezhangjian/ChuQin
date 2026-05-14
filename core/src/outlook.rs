use std::fs;
use std::path::{Path, PathBuf};

use chrono::Local;
use walkdir::WalkDir;

use crate::context::AppContext;
use crate::util::paths::ensure_writable_output;
use crate::util::zip_utils::write_zip_archive;
use crate::{Error, Result};

#[derive(Debug, Clone)]
pub struct ArchiveSummary {
    pub source_dir: PathBuf,
    pub archive_path: PathBuf,
    pub file_count: usize,
}

pub fn archive_outlook_pst(ctx: &AppContext) -> Result<ArchiveSummary> {
    let source_dir = default_email_dir()?;
    let archive_dir = ctx.root_dir.join("Resources").join("Email");
    fs::create_dir_all(&archive_dir)?;

    let date = Local::now().format("%Y%m%d");
    let archive_path = archive_dir.join(format!("email-{date}.zip"));
    ensure_writable_output(&archive_path, true)?;

    let pst_files = collect_pst_files(&source_dir)?;
    write_zip_archive(&archive_path, &source_dir, &pst_files)?;

    Ok(ArchiveSummary {
        source_dir,
        archive_path,
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
