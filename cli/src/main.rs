use clap::Parser;

#[derive(Parser, Debug)]
#[command(name = "chuqin", version, about = "ChuQin command-line interface")]
struct Cli {
}

fn main() {
    let cli = Cli::parse();
}
