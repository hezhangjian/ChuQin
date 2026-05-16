use std::path::PathBuf;

use chuqin_core::{AppContext, Error, excel::CreateOptions};
use clap::{Args, Subcommand};

#[derive(Args, Debug)]
pub struct ExcelCommand {
    #[command(subcommand)]
    pub command: ExcelSubcommand,
}

#[derive(Subcommand, Debug)]
pub enum ExcelSubcommand {
    Create(CreateWorkbookArgs),
}

#[derive(Args, Debug)]
pub struct CreateWorkbookArgs {
    pub title: String,
    #[arg(short, long)]
    pub output: Option<PathBuf>,
    #[arg(long)]
    pub overwrite: bool,
    #[arg(long)]
    pub template: Option<String>,
}

pub fn run(ctx: &AppContext, command: ExcelCommand) -> Result<(), Error> {
    match command.command {
        ExcelSubcommand::Create(args) => {
            let output_path = chuqin_core::excel::create_excel(
                ctx,
                &args.title,
                &CreateOptions {
                    output: args.output,
                    overwrite: args.overwrite,
                    template: args.template,
                },
            )?;
            println!("Created Excel: {}", output_path.display());
        }
    }

    Ok(())
}
