pub mod outlook;
pub mod pdf;
pub mod ppt;
pub mod word;

use crate::Command;
use chuqin_core::{Error, load_context};

pub fn run(command: Command) -> Result<(), Error> {
    let ctx = load_context()?;

    match command {
        Command::Version => {
            println!("{}", env!("CARGO_PKG_VERSION"));
        }
        Command::Outlook(command) => outlook::run(&ctx, command)?,
        Command::Pdf(command) => pdf::run(&ctx, command)?,
        Command::Ppt(command) => ppt::run(&ctx, command)?,
        Command::Word(command) => word::run(&ctx, command)?,
    }

    Ok(())
}
