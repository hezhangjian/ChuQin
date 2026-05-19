use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct AppConfig {
    // LLM
    pub llm: Option<LlmConfig>,

    // Cloud
    pub aliyun: Option<AliyunConfig>,
    pub huawei_cloud: Option<HuaweiCloudConfig>,

    // Code hosting
    pub gitcode: Option<TokenConfig>,
    pub gitee: Option<TokenConfig>,
    pub github: Option<TokenConfig>,
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
pub struct AliyunConfig {
    pub access_key_id: Option<String>,
    pub access_key_secret: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct HuaweiCloudConfig {
    pub project_id: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

// Code hosting

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct TokenConfig {
    pub token: Option<String>,
}
