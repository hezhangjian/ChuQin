mod commands;

use clap::{Parser, Subcommand};

use commands::{excel, outlook, pdf, ppt, word};

#[derive(Parser, Debug)]
#[command(
    name = "chuqin",
    bin_name = "chuqin",
    version,
    about = "ChuQin command-line interface"
)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand, Debug)]
enum Command {
    // Keep `version` first as the universal metadata command; sort feature commands alphabetically.
    Version,
    Excel(excel::ExcelCommand),
    Outlook(outlook::OutlookCommand),
    Pdf(pdf::PdfCommand),
    Ppt(ppt::PptCommand),
    Word(word::WordCommand),
}

fn main() {
    let cli = Cli::parse();

    if let Err(err) = commands::run(cli.command) {
        eprintln!("error: {err}");
        std::process::exit(1);
    }
}
