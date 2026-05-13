use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct AppConfig {
    // LLM
    pub llm: Option<LlmConfig>,

    // Cloud
    pub huaweicloud: Option<HuaweiCloudConfig>,

    // Git
    pub github: Option<GitHubConfig>,
    pub gitee: Option<GiteeConfig>,
    pub gitcode: Option<GitCodeConfig>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct LlmConfig {
    pub provider: Option<String>,
    pub model: Option<String>,
    pub base_url: Option<String>,
    pub api_key: Option<String>,
}

// Cloud

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct HuaweiCloudConfig {
    pub username: Option<String>,
    pub password: Option<String>,
    pub project_id: Option<String>,
}

// Git

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct GitHubConfig {
    pub token: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct GiteeConfig {
    pub token: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct GitCodeConfig {
    pub token: Option<String>,
}
