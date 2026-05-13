use chuqin_core::{AppContext, Error};
use clap::Args;

#[derive(Args, Debug)]
pub struct OutlookCommand {}

pub fn run(ctx: &AppContext, command: OutlookCommand) -> Result<(), Error> {
    Ok(())
}
