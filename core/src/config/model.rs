use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct AppConfig {
    // LLM
    pub llm: Option<LlmConfig>,

    // Cloud
    pub aliyun: Option<AliyunConfig>,
    #[serde(rename = "huaweicloud")]
    pub huawei_cloud: Option<HuaweiCloudConfig>,
    pub volcengine: Option<VolcengineConfig>,

    // Code hosting
    pub gitcode: Option<GitcodeConfig>,
    pub gitee: Option<GiteeConfig>,
    pub github: Option<GithubConfig>,
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

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct VolcengineConfig {
    pub ak: Option<String>,
    pub sk: Option<String>,
    pub visual_host: Option<String>,
    pub region: Option<String>,
    pub video_req_key: Option<String>,
}

// Code hosting

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct GitcodeConfig {
    pub username: Option<String>,
    pub token: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct GiteeConfig {
    pub username: Option<String>,
    pub token: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct GithubConfig {
    pub username: Option<String>,
    pub token: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::AppConfig;

    #[test]
    fn reads_current_config_section_names() {
        let config = toml::from_str::<AppConfig>(
            r#"
[llm]
model = "test-model"
base_url = "https://example.test/v1"
api_key = "test-key"

[huaweicloud]
username = "test-user"
password = "test-password"
project_id = "test-project"

[gitcode]
username = "test-git-user"
token = "test-token"

[volcengine]
ak = "test-ak"
sk = "test-sk"
visual_host = "visual.example.test"
region = "cn-north-1"
video_req_key = "test-req-key"
"#,
        )
        .expect("config should parse");

        assert_eq!(config.llm.and_then(|llm| llm.model).as_deref(), Some("test-model"));
        assert_eq!(
            config
                .huawei_cloud
                .and_then(|huawei_cloud| huawei_cloud.project_id)
                .as_deref(),
            Some("test-project")
        );
        assert_eq!(
            config.gitcode.and_then(|gitcode| gitcode.username).as_deref(),
            Some("test-git-user")
        );
        assert_eq!(
            config
                .volcengine
                .and_then(|volcengine| volcengine.video_req_key)
                .as_deref(),
            Some("test-req-key")
        );
    }
}
