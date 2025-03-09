use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Credentials {
    pub username: String,
    pub password: String,
    pub domain_name: String,
    pub project_name: String,
}

#[tauri::command]
pub async fn huaweicloud_get_token(credentials: Credentials) -> Result<String, String> {
    let client = reqwest::Client::new();

    let payload = serde_json::json!({
        "auth": {
            "identity": {
                "methods": ["password"],
                "password": {
                    "user": {
                        "name": credentials.username,
                        "password": credentials.password,
                        "domain": {
                            "name": credentials.domain_name
                        }
                    }
                }
            },
            "scope": {
                "project": {
                    "name": credentials.project_name
                }
            }
        }
    });

    let response = client
        .post("https://iam.cn-north-4.myhuaweicloud.com/v3/auth/tokens")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Request error: {}", e))?;

    let status = response.status();
    let headers = response.headers().clone();
    let body_text = response.text().await.unwrap_or_default();

    // Extract the token from the headers
    let token = match headers.get("X-Subject-Token") {
        Some(token_header) => token_header
            .to_str()
            .map_err(|e| e.to_string())?
            .to_string(),
        None => {
            return Err(format!(
                "No token in response. Status: {}, Body: {}",
                status, body_text
            ));
        }
    };

    // Check the status and return an error if the request was not successful
    if !status.is_success() {
        return Err(format!("HTTP error {}: {}", status, body_text));
    }

    Ok(token)
} 