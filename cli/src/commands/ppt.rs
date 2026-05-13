use std::path::PathBuf;

use chuqin_core::{AppContext, Error, ppt::CreateOptions};
use clap::{Args, Subcommand};

#[derive(Args, Debug)]
pub struct PptCommand {
    #[command(subcommand)]
    pub command: PptSubcommand,
}

#[derive(Subcommand, Debug)]
pub enum PptSubcommand {
    Create(CreateDeckArgs),
}

#[derive(Args, Debug)]
pub struct CreateDeckArgs {
    pub title: String,
    #[arg(short, long)]
    pub output: Option<PathBuf>,
    #[arg(long)]
    pub overwrite: bool,
    #[arg(long)]
    pub template: Option<String>,
}

pub fn run(ctx: &AppContext, command: PptCommand) -> Result<(), Error> {
    match command.command {
        PptSubcommand::Create(args) => {
            let output_path = chuqin_core::ppt::create_ppt(
                ctx,
                &args.title,
                &CreateOptions {
                    output: args.output,
                    overwrite: args.overwrite,
                    template: args.template,
                },
            )?;
            println!("Created PPT: {}", output_path.display());
        }
    }

    Ok(())
}
