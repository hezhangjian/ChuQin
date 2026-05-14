use std::io;
use std::path::PathBuf;
use thiserror::Error as ThisError;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, ThisError)]
pub enum Error {
    #[error("refusing to overwrite existing file: {0}")]
    AlreadyExists(PathBuf),
    #[error("IO error: {0}")]
    Io(#[from] io::Error),
    #[error("Invalid path: {0}")]
    InvalidPath(String),
    #[error(transparent)]
    ConfigToml(#[from] toml::de::Error),
    #[error("unable to determine the current user's home directory")]
    MissingHomeDir,
    #[error("{0}")]
    InvalidInput(String),
    #[error("Path not found: {0}")]
    PathNotFound(String),
    #[error("PPTX generation error: {0}")]
    Pptx(#[from] ppt_rs::PptxError),
    #[error("XLSX generation error: {0}")]
    Xlsx(#[from] rust_xlsxwriter::XlsxError),
    #[error("Zip error: {0}")]
    Zip(#[from] zip::result::ZipError),
}
