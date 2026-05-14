use chuqin_core::{AppContext, Error};
use clap::{Args, Subcommand};

#[derive(Args, Debug)]
pub struct OutlookCommand {
    #[command(subcommand)]
    pub command: OutlookSubcommand,
}

#[derive(Subcommand, Debug)]
pub enum OutlookSubcommand {
    ArchivePst,
}

pub fn run(ctx: &AppContext, command: OutlookCommand) -> Result<(), Error> {
    match command.command {
        OutlookSubcommand::ArchivePst => {
            let summary = chuqin_core::archive_outlook_pst(ctx)?;
            println!("Source directory: {}", summary.source_dir.display());
            println!("Archived {} PST file(s)", summary.file_count);
            println!("Created ZIP: {}", summary.archive_path.display());
        }
    }

    Ok(())
}
