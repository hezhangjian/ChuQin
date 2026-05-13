use std::fs;

use serde::{Deserialize, Serialize};

use crate::{AppContext, Result};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateInfo {
    pub name: String,
}

pub fn list_templates(ctx: &AppContext) -> Result<Vec<TemplateInfo>> {
    let templates_path = ctx.templates_dir.join("WORD");

    if !templates_path.exists() {
        return Ok(Vec::new());
    }

    let mut templates = Vec::new();
    for entry in fs::read_dir(&templates_path)? {
        let entry = entry?;
        let path = entry.path();

        if path.extension().is_some_and(|ext| ext == "docx") {
            if let Some(name) = path.file_stem().and_then(|n| n.to_str()) {
                templates.push(TemplateInfo { name: name.to_string() });
            }
        }
    }

    Ok(templates)
}
