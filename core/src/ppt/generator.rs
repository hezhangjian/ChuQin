use crate::Result;
use ppt_rs::generator::create_pptx_with_content;
use std::path::Path;

pub fn write_pptx(output_path: &Path, title: &str) -> Result<()> {
    let pptx = create_pptx_with_content(title, vec![])?;
    std::fs::write(output_path, pptx)?;
    Ok(())
}
