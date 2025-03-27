use anyhow::Result;
use serde::{Deserialize, Serialize};
use ssh2::Session;
use std::io::Read;
use std::net::TcpStream;

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub ip: String,
    pub password: String,
    pub database: String,
}

#[tauri::command]
pub async fn clean_flyway_records(config: DatabaseConfig) -> Result<String, String> {
    let tcp = TcpStream::connect(format!("{}:22", config.ip))
        .map_err(|e| format!("Failed to connect to server: {}", e))?;
    
    let mut sess = Session::new()
        .map_err(|e| format!("Failed to create SSH session: {}", e))?;
    
    sess.set_tcp_stream(tcp);
    sess.handshake()
        .map_err(|e| format!("Failed to perform SSH handshake: {}", e))?;
    
    sess.userauth_password("root", &config.password)
        .map_err(|e| format!("Failed to authenticate: {}", e))?;
    
    let mut channel = sess.channel_session()
        .map_err(|e| format!("Failed to create channel: {}", e))?;
    
    let command = format!(
        "mysql -u root -p'{}' {} -e 'TRUNCATE TABLE flyway_schema_history;'",
        config.password, config.database
    );
    
    channel.exec(&command)
        .map_err(|e| format!("Failed to execute command: {}", e))?;
    
    let mut output = String::new();
    channel.read_to_string(&mut output)
        .map_err(|e| format!("Failed to read output: {}", e))?;
    
    channel.wait_close()
        .map_err(|e| format!("Failed to close channel: {}", e))?;
    
    let exit_status = channel.exit_status()
        .map_err(|e| format!("Failed to get exit status: {}", e))?;
    
    if exit_status != 0 {
        return Err(format!("Command failed with exit status {}", exit_status));
    }
    
    Ok("Flyway records cleaned successfully".to_string())
} 