use crate::Result;
use std::io;
use std::path::Path;

pub fn write_default_docx(output_path: &Path, title: &str) -> Result<()> {
    use docx_rs::*;

    let docx = Docx::new()
        .add_paragraph(Paragraph::new().add_run(Run::new().add_text(title).size(48)))
        .build();
    let mut file = std::fs::File::create(output_path)?;
    docx.pack(&mut file).map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;
    Ok(())
}
