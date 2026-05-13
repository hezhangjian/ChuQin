use std::path::PathBuf;

use crate::{Error, Result};

fn default_email_dir() -> Result<PathBuf> {
    #[cfg(target_os = "macos")]
    {
        let home = dirs::home_dir().ok_or(Error::MissingHomeDir)?;
        Ok(home.join("Email"))
    }

    #[cfg(target_os = "windows")]
    {
        Ok(PathBuf::from("D:/Email"))
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let home = dirs::home_dir().ok_or(Error::MissingHomeDir)?;
        Ok(home.join("Email"))
    }
}
