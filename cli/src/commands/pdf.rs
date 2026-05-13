use chuqin_core::{AppContext, Error};
use clap::Args;

#[derive(Args, Debug)]
pub struct PdfCommand {}

pub fn run(ctx: &AppContext, command: PdfCommand) -> Result<(), Error> {
    Ok(())
}
