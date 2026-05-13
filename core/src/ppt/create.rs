use std::path::PathBuf;

use super::generator::write_pptx;
use crate::context::AppContext;
use crate::util::paths::{ensure_writable_output, resolve_output_path};
use crate::Result;

#[derive(Debug, Clone)]
pub struct CreateOptions {
    pub output: Option<PathBuf>,
    pub overwrite: bool,
    pub template: Option<String>,
}

pub fn create_ppt(ctx: &AppContext, title: &str, options: &CreateOptions) -> Result<PathBuf> {
    let output_path = resolve_output_path(options.output.as_ref(), title, "pptx");
    ensure_writable_output(&output_path, options.overwrite)?;

    let template_name = options.template.as_deref().unwrap_or("default");
    let template_path = ctx.templates_dir.join("PPT").join(template_name);

    write_pptx(&output_path, title)?;

    Ok(output_path)
}
