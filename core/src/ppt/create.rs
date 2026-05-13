use std::fs;
use std::path::PathBuf;

use super::generator::write_default_pptx;
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

    let template_dir = ctx.templates_dir.join("PPT");

    if let Some(ref template_name) = options.template {
        let template_path = template_dir.join(format!("{template_name}.pptx"));
        if template_path.is_file() {
            fs::copy(&template_path, &output_path)?;
            return Ok(output_path);
        }
    }

    let default_template = template_dir.join("default.pptx");
    if default_template.is_file() {
        fs::copy(&default_template, &output_path)?;
        return Ok(output_path);
    }

    write_default_pptx(&output_path, title)?;
    Ok(output_path)
}
