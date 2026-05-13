use crate::Result;
use ppt_rs::generator::create_pptx_with_content;
use std::io::{Cursor, Read, Write};
use std::path::Path;
use zip::ZipArchive;
use zip::ZipWriter;
use zip::write::FileOptions;

/// 16:9 widescreen dimensions in EMU
const SLIDE_WIDTH_16X9: u32 = 12192000; // 13.333 inches

pub fn write_default_pptx(output_path: &Path, title: &str) -> Result<()> {
    let pptx = create_pptx_with_content(title, vec![])?;
    let pptx = set_widescreen_16x9(&pptx)?;
    std::fs::write(output_path, pptx)?;
    Ok(())
}

/// Modify the presentation XML to use 16:9 widescreen format
fn set_widescreen_16x9(pptx: &[u8]) -> Result<Vec<u8>> {
    let reader = Cursor::new(pptx);
    let mut archive = ZipArchive::new(reader)?;

    let presentation_path = "ppt/presentation.xml";
    let idx = archive.index_for_path(presentation_path).ok_or_else(|| {
        std::io::Error::new(std::io::ErrorKind::NotFound, "ppt/presentation.xml not found")
    })?;

    let mut buffer = Vec::new();
    {
        let mut file = archive.by_index(idx)?;
        file.read_to_end(&mut buffer)?;
    }

    let xml = String::from_utf8(buffer).map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    let xml = xml
        .replace("cx=\"9144000\"", &format!("cx=\"{SLIDE_WIDTH_16X9}\""))
        .replace("type=\"screen4x3\"", "type=\"screen16x9\"");

    let mut output = Cursor::new(Vec::new());
    {
        let mut writer = ZipWriter::new(&mut output);
        let options: FileOptions<()> = FileOptions::default();

        for i in 0..archive.len() {
            let mut entry = archive.by_index(i)?;
            let name = entry.name().to_string();

            if name == presentation_path {
                writer.start_file(&name, options)?;
                writer.write_all(xml.as_bytes())?;
            } else {
                writer.start_file(&name, options)?;
                let mut content = Vec::new();
                entry.read_to_end(&mut content)?;
                writer.write_all(&content)?;
            }
        }
    }

    Ok(output.into_inner())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_widescreen_16x9_conversion() {
        let pptx = create_pptx_with_content("Test", vec![]).unwrap();
        let modified = set_widescreen_16x9(&pptx).unwrap();

        let mut archive = ZipArchive::new(Cursor::new(&modified)).unwrap();
        let mut file = archive.by_name("ppt/presentation.xml").unwrap();
        let mut content = String::new();
        file.read_to_string(&mut content).unwrap();

        assert!(content.contains("cx=\"12192000\""));
        assert!(content.contains("cy=\"6858000\""));
        assert!(content.contains("type=\"screen16x9\""));
        assert!(!content.contains("screen4x3"));
    }

    #[test]
    fn test_write_default_pptx() {
        let dir = std::env::temp_dir();
        let path = dir.join("test_default.pptx");
        write_default_pptx(&path, "Test Title").unwrap();
        assert!(path.exists());
        std::fs::remove_file(&path).unwrap();
    }
}
