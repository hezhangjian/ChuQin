use std::fs;

use crate::{AppContext, Error, Result};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileNode>>,
}

pub fn list_directory(ctx: &AppContext, path: Option<&str>) -> Result<Vec<FileNode>> {
    let target_path = match path {
        Some(p) => {
            let full_path = ctx.root_dir.join(p);
            if !full_path.starts_with(&ctx.root_dir) {
                return Err(Error::InvalidPath(p.to_string()));
            }
            full_path
        }
        None => ctx.root_dir.clone(),
    };

    if !target_path.exists() {
        return Err(Error::PathNotFound(target_path.display().to_string()));
    }

    let mut nodes = Vec::new();

    let entries = fs::read_dir(&target_path)?;
    let mut entries: Vec<_> = entries.filter_map(|e| e.ok()).collect();
    entries.sort_by(|a, b| {
        let a_is_dir = a.path().is_dir();
        let b_is_dir = b.path().is_dir();
        match (a_is_dir, b_is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.file_name().cmp(&b.file_name()),
        }
    });

    for entry in entries {
        let entry_path = entry.path();
        let file_name = entry.file_name().to_string_lossy().to_string();

        if file_name.starts_with('.') {
            continue;
        }

        let relative_path = entry_path
            .strip_prefix(&ctx.root_dir)
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_default();

        let is_dir = entry_path.is_dir();

        nodes.push(FileNode {
            name: file_name,
            path: relative_path,
            is_dir,
            children: None,
        });
    }

    Ok(nodes)
}

pub fn delete_path(ctx: &AppContext, path: &str) -> Result<()> {
    let full_path = ctx.root_dir.join(path);

    if !full_path.starts_with(&ctx.root_dir) {
        return Err(Error::InvalidPath(path.to_string()));
    }

    if !full_path.exists() {
        return Err(Error::PathNotFound(path.to_string()));
    }

    if full_path.is_dir() {
        fs::remove_dir_all(&full_path)?;
    } else {
        fs::remove_file(&full_path)?;
    }

    Ok(())
}

pub fn rename_path(ctx: &AppContext, old_path: &str, new_name: &str) -> Result<()> {
    let full_old_path = ctx.root_dir.join(old_path);

    if !full_old_path.starts_with(&ctx.root_dir) {
        return Err(Error::InvalidPath(old_path.to_string()));
    }

    if !full_old_path.exists() {
        return Err(Error::PathNotFound(old_path.to_string()));
    }

    if new_name.contains('/') || new_name.contains(r"\") || new_name.contains("..") {
        return Err(Error::InvalidPath(new_name.to_string()));
    }

    let parent = full_old_path
        .parent()
        .ok_or_else(|| Error::InvalidPath(old_path.to_string()))?;

    let full_new_path = parent.join(new_name);

    if full_new_path.exists() {
        return Err(Error::InvalidPath(format!("{} already exists", new_name)));
    }

    fs::rename(&full_old_path, &full_new_path)?;

    Ok(())
}
