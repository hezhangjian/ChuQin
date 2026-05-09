use clap::{Parser, Subcommand};

#[derive(Debug, Parser)]
#[command(name = "chuqin", about = "ChuQin command-line interface")]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Debug, Subcommand)]
enum Commands {
    /// Show the current ChuQin version.
    Version,
}

fn main() {
    let cli = Cli::parse();

    match cli.command.unwrap_or(Commands::Version) {
        Commands::Version => {
            let info = chuqin_core::runtime_info();
            println!("{} {}", info.app_name, info.version);
        }
    }
}
