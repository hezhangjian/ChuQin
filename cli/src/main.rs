mod commands;

use clap::{Parser, Subcommand};

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
    Version,
}

fn main() {
    let cli = Cli::parse();

    if let Err(err) = commands::run(cli.command) {
        eprintln!("error: {err}");
        std::process::exit(1);
    }
}
