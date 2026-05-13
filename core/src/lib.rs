mod config;
mod context;
mod error;
mod fs;
mod outlook;
mod ppt;
mod word;
mod zip_utils;

pub use context::{AppContext, load_context};
pub use error::{Error, Result};
pub use fs::{FileNode, delete_path, list_directory, rename_path};
pub use ppt::{PptTemplateInfo, list_ppt_templates};
pub use word::{WordTemplateInfo, list_word_templates};
