mod config;

use std::process::ExitCode;

fn main() -> ExitCode {
    let command = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "show".to_string());

    match command.as_str() {
        "path" => {
            println!("{}", config::get_config_path().display());
            ExitCode::SUCCESS
        }
        "show" => match config::load_config() {
            Ok(config) => {
                println!("{config:#?}");
                ExitCode::SUCCESS
            }
            Err(error) => {
                eprintln!("failed to load config: {error}");
                ExitCode::from(1)
            }
        },
        _ => {
            eprintln!("unsupported command: {command}");
            ExitCode::from(1)
        }
    }
}
