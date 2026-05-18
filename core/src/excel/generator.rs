use std::path::Path;

use crate::Result;
use rust_xlsxwriter::Workbook;

pub fn write_default_xlsx(output_path: &Path) -> Result<()> {
    let mut workbook = Workbook::new();
    workbook.save(output_path)?;
    Ok(())
}
