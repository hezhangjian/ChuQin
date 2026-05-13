use crate::Command;
use chuqin_core::{load_context, Error};

pub fn run(command: Command) -> Result<(), Error> {
    let ctx = load_context()?;

    match command {
        Command::Version => {
            println!("{}", env!("CARGO_PKG_VERSION"));
        }
    }

    Ok(())
}
