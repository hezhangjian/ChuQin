use std::path::Path;

use crate::Result;
use rust_xlsxwriter::Workbook;

pub fn write_default_xlsx(output_path: &Path, title: &str) -> Result<()> {
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();
    worksheet.write(0, 0, title)?;
    workbook.save(output_path)?;
    Ok(())
}
