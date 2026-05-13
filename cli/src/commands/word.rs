use chuqin_core::{AppContext, Error};
use clap::Args;

#[derive(Args, Debug)]
pub struct WordCommand {}

pub fn run(ctx: &AppContext, command: WordCommand) -> Result<(), Error> {
    Ok(())
}
