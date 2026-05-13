use std::fs;

use serde::{Deserialize, Serialize};

use crate::{AppContext, Result};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WordTemplateInfo {
    pub name: String,
}

pub fn list_word_templates(ctx: &AppContext) -> Result<Vec<WordTemplateInfo>> {
    let templates_path = ctx.templates_dir.join("word");

    if !templates_path.exists() {
        return Ok(Vec::new());
    }

    let mut templates = Vec::new();
    for entry in fs::read_dir(&templates_path)? {
        let entry = entry?;
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
            templates.push(WordTemplateInfo {
                name: name.to_string(),
            });
        }
    }

    Ok(templates)
}
