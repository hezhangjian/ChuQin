use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct CreateOptions {
    pub output: Option<PathBuf>,
    pub overwrite: bool,
    pub template: Option<String>,
}
