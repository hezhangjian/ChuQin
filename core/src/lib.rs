mod config;
mod context;
mod error;
pub mod excel;
mod fs;
mod outlook;
pub mod ppt;
mod util;
pub mod word;

pub use config::{AppConfig, GitCodeConfig, GitHubConfig, GiteeConfig, HuaweiCloudConfig, LlmConfig};
pub use context::{AppContext, load_context};
pub use error::{Error, Result};
pub use fs::{FileNode, delete_path, list_directory, rename_path};
pub use outlook::{ArchiveSummary, archive_outlook_pst};
