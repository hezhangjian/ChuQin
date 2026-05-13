use std::path::PathBuf;

use chuqin_core::{AppContext, Error, word::CreateOptions};
use clap::{Args, Subcommand};

#[derive(Args, Debug)]
pub struct WordCommand {
    #[command(subcommand)]
    pub command: WordSubcommand,
}

#[derive(Subcommand, Debug)]
pub enum WordSubcommand {
    Create(CreateDocArgs),
}

#[derive(Args, Debug)]
pub struct CreateDocArgs {
    pub title: String,
    #[arg(short, long)]
    pub output: Option<PathBuf>,
    #[arg(long)]
    pub overwrite: bool,
    #[arg(long)]
    pub template: Option<String>,
}

pub fn run(ctx: &AppContext, command: WordCommand) -> Result<(), Error> {
    match command.command {
        WordSubcommand::Create(args) => {
            let output_path = chuqin_core::word::create_word(
                ctx,
                &args.title,
                &CreateOptions {
                    output: args.output,
                    overwrite: args.overwrite,
                    template: args.template,
                },
            )?;
            println!("Created Word: {}", output_path.display());
        }
    }

    Ok(())
}
