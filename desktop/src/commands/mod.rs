//! Tauri command modules.
//!
//! Each module groups related commands by resource type.
//! Commands follow REST-style naming: `<resource>_<action>`.

pub mod config;
pub mod excel;
pub mod files;
pub mod ppt;
pub mod word;
