use std::fs;
use std::path::{Path, PathBuf};

use crate::{Error, Result};

pub fn resolve_output_path(output: Option<&PathBuf>, title: &str, extension: &str) -> PathBuf {
    output.cloned().unwrap_or_else(|| {
        let filename = format!("{}.{}", sanitize_filename(title), extension);
        PathBuf::from(filename)
    })
}

pub fn ensure_writable_output(path: &Path, overwrite: bool) -> Result<()> {
    if path.exists() && !overwrite {
        return Err(Error::AlreadyExists(path.to_path_buf()));
    }

    if let Some(parent) = path.parent().filter(|path| !path.as_os_str().is_empty()) {
        fs::create_dir_all(parent)?;
    }

    Ok(())
}

pub fn sanitize_filename(input: &str) -> String {
    let cleaned: String = input
        .chars()
        .map(|ch| match ch {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            _ => ch,
        })
        .collect();

    let trimmed = cleaned.trim();
    if trimmed.is_empty() {
        "untitled".to_string()
    } else {
        trimmed.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::sanitize_filename;

    #[test]
    fn sanitize_replaces_invalid_characters() {
        assert_eq!(
            sanitize_filename("Engineering/Planning"),
            "Engineering_Planning"
        );
        assert_eq!(sanitize_filename("   "), "untitled");
    }
}
