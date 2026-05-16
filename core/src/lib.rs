mod config;
mod context;
mod error;
pub mod excel;
mod fs;
mod outlook;
pub mod ppt;
mod util;
pub mod word;

pub use context::{AppContext, load_context};
pub use error::{Error, Result};
pub use fs::{FileNode, delete_path, list_directory, rename_path};
