use std::path::PathBuf;

use crate::Result;
use crate::context::AppContext;
use crate::util::paths::{ensure_writable_output, resolve_output_path};

#[derive(Debug, Clone)]
pub struct CreateOptions {
    pub output: Option<PathBuf>,
    pub overwrite: bool,
    pub template: Option<String>,
}

pub fn create_word(ctx: &AppContext, title: &str, options: &CreateOptions) -> Result<PathBuf> {
    let output_path = resolve_output_path(options.output.as_ref(), title, "docx");
    ensure_writable_output(&output_path, options.overwrite)?;

    Ok(output_path)
}
