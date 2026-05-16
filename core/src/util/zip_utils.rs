use std::fs::File;
use std::path::{Path, PathBuf};

use zip::CompressionMethod;
use zip::ZipWriter;
use zip::write::SimpleFileOptions;

use crate::Result;

/// Creates a zip archive from files on disk.
///
/// # Arguments
/// - `archive_path`: Output path for the zip file
/// - `base_dir`: Base directory for calculating relative paths in the zip
/// - `files`: List of file paths to include in the archive
pub fn write_zip_archive(archive_path: &Path, base_dir: &Path, files: &[PathBuf]) -> Result<()> {
    let file = File::create(archive_path)?;
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(CompressionMethod::Deflated);

    for path in files {
        let relative_path = path.strip_prefix(base_dir).unwrap_or(path);
        zip.start_file(relative_path.to_string_lossy().replace('\\', "/"), options)?;

        let mut input = File::open(path)?;
        std::io::copy(&mut input, &mut zip)?;
    }

    zip.finish()?;
    Ok(())
}
