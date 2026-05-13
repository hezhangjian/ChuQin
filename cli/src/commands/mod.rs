use crate::Command;
use chuqin_core::{Error, load_context};

pub fn run(command: Command) -> Result<(), Error> {
    let ctx = load_context()?;

    match command {
        Command::Version => {
            println!("{}", env!("CARGO_PKG_VERSION"));
        }
    }

    Ok(())
}
