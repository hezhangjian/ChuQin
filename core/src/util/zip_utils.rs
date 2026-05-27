use std::fs::File;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};

use zip::CompressionMethod;
use zip::ZipWriter;
use zip::write::SimpleFileOptions;

use crate::{Error, Result};

const PROGRESS_REPORT_BYTES: u64 = 8 * 1024 * 1024;

#[derive(Debug, Clone)]
pub struct ZipArchiveProgress {
    pub completed_files: usize,
    pub current_file: PathBuf,
    pub current_file_bytes: u64,
    pub current_file_total_bytes: u64,
    pub total_bytes: u64,
    pub total_files: usize,
    pub written_bytes: u64,
}

/// Creates a zip archive from files on disk.
///
/// # Arguments
/// - `archive_path`: Output path for the zip file
/// - `base_dir`: Base directory for calculating relative paths in the zip
/// - `files`: List of file paths to include in the archive
pub fn write_zip_archive(archive_path: &Path, base_dir: &Path, files: &[PathBuf]) -> Result<()> {
    write_zip_archive_with_progress(archive_path, base_dir, files, |_| {}, || false)
}

pub fn write_zip_archive_with_progress<F, C>(
    archive_path: &Path,
    base_dir: &Path,
    files: &[PathBuf],
    mut on_progress: F,
    should_cancel: C,
) -> Result<()>
where
    F: FnMut(ZipArchiveProgress),
    C: Fn() -> bool,
{
    let file = File::create(archive_path)?;
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(CompressionMethod::Deflated);
    let total_bytes = files
        .iter()
        .map(|path| path.metadata().map(|metadata| metadata.len()))
        .collect::<std::io::Result<Vec<_>>>()?
        .into_iter()
        .sum();
    let mut written_bytes = 0;

    for (index, path) in files.iter().enumerate() {
        if should_cancel() {
            return Err(Error::InvalidInput("backup canceled".to_string()));
        }

        let relative_path = path.strip_prefix(base_dir).unwrap_or(path);
        zip.start_file(relative_path.to_string_lossy().replace('\\', "/"), options)?;

        let mut input = File::open(path)?;
        let current_file_total_bytes = input.metadata()?.len();
        let mut current_file_bytes = 0;
        let mut buffer = [0; 1024 * 1024];

        on_progress(ZipArchiveProgress {
            completed_files: index,
            current_file: relative_path.to_path_buf(),
            current_file_bytes,
            current_file_total_bytes,
            total_bytes,
            total_files: files.len(),
            written_bytes,
        });
        let mut last_reported_written_bytes = written_bytes;

        loop {
            if should_cancel() {
                return Err(Error::InvalidInput("backup canceled".to_string()));
            }

            let bytes_read = input.read(&mut buffer)?;

            if bytes_read == 0 {
                break;
            }

            zip.write_all(&buffer[..bytes_read])?;
            current_file_bytes += bytes_read as u64;
            written_bytes += bytes_read as u64;

            if written_bytes.saturating_sub(last_reported_written_bytes) >= PROGRESS_REPORT_BYTES
                || current_file_bytes == current_file_total_bytes
            {
                on_progress(ZipArchiveProgress {
                    completed_files: index,
                    current_file: relative_path.to_path_buf(),
                    current_file_bytes,
                    current_file_total_bytes,
                    total_bytes,
                    total_files: files.len(),
                    written_bytes,
                });
                last_reported_written_bytes = written_bytes;
            }
        }

        on_progress(ZipArchiveProgress {
            completed_files: index + 1,
            current_file: relative_path.to_path_buf(),
            current_file_bytes,
            current_file_total_bytes,
            total_bytes,
            total_files: files.len(),
            written_bytes,
        });
    }

    zip.finish()?;
    Ok(())
}
