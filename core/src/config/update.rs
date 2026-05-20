use std::path::Path;

use serde::Deserialize;

use crate::Result;

use super::model::{AliyunConfig, AppConfig, GitcodeConfig, GiteeConfig, GithubConfig, HuaweiCloudConfig, LlmConfig};
use super::store::{read_config, write_config};

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ConfigPatch {
    // LLM
    Llm(LlmConfigPatch),

    // Cloud
    Aliyun(AliyunConfigPatch),
    HuaweiCloud(HuaweiCloudConfigPatch),

    // Code hosting
    Gitcode(GitcodeConfigPatch),
    Gitee(GiteeConfigPatch),
    Github(GithubConfigPatch),
}

#[derive(Debug, Clone, Default, Deserialize)]
pub struct LlmConfigPatch {
    pub provider: Option<String>,
    pub model: Option<String>,
    pub base_url: Option<String>,
    pub api_key: Option<String>,
}

// Cloud

#[derive(Debug, Clone, Default, Deserialize)]
pub struct AliyunConfigPatch {
    pub access_key_id: Option<String>,
    pub access_key_secret: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize)]
pub struct HuaweiCloudConfigPatch {
    pub project_id: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

// Code hosting

#[derive(Debug, Clone, Default, Deserialize)]
pub struct GitcodeConfigPatch {
    pub username: Option<String>,
    pub token: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize)]
pub struct GiteeConfigPatch {
    pub username: Option<String>,
    pub token: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize)]
pub struct GithubConfigPatch {
    pub username: Option<String>,
    pub token: Option<String>,
}

pub fn update_config(root_dir: impl AsRef<Path>, patch: ConfigPatch) -> Result<AppConfig> {
    let mut config = read_config(root_dir.as_ref())?.unwrap_or_default();
    apply_patch(&mut config, patch);
    write_config(root_dir, &config)?;

    Ok(config)
}

fn apply_patch(config: &mut AppConfig, patch: ConfigPatch) {
    match patch {
        // LLM
        ConfigPatch::Llm(patch) => apply_llm_patch(config.llm.get_or_insert_with(Default::default), patch),

        // Cloud
        ConfigPatch::Aliyun(patch) => apply_aliyun_patch(config.aliyun.get_or_insert_with(Default::default), patch),
        ConfigPatch::HuaweiCloud(patch) => {
            apply_huawei_cloud_patch(config.huawei_cloud.get_or_insert_with(Default::default), patch)
        }

        // Code hosting
        ConfigPatch::Gitcode(patch) => apply_gitcode_patch(config.gitcode.get_or_insert_with(Default::default), patch),
        ConfigPatch::Gitee(patch) => apply_gitee_patch(config.gitee.get_or_insert_with(Default::default), patch),
        ConfigPatch::Github(patch) => apply_github_patch(config.github.get_or_insert_with(Default::default), patch),
    }
}

fn apply_llm_patch(config: &mut LlmConfig, patch: LlmConfigPatch) {
    if let Some(value) = patch.provider {
        config.provider = Some(value);
    }

    if let Some(value) = patch.model {
        config.model = Some(value);
    }

    if let Some(value) = patch.base_url {
        config.base_url = Some(value);
    }

    if let Some(value) = patch.api_key {
        config.api_key = Some(value);
    }
}

// Cloud

fn apply_aliyun_patch(config: &mut AliyunConfig, patch: AliyunConfigPatch) {
    if let Some(value) = patch.access_key_id {
        config.access_key_id = Some(value);
    }

    if let Some(value) = patch.access_key_secret {
        config.access_key_secret = Some(value);
    }
}

fn apply_huawei_cloud_patch(config: &mut HuaweiCloudConfig, patch: HuaweiCloudConfigPatch) {
    if let Some(value) = patch.project_id {
        config.project_id = Some(value);
    }

    if let Some(value) = patch.username {
        config.username = Some(value);
    }

    if let Some(value) = patch.password {
        config.password = Some(value);
    }
}

// Code hosting

fn apply_gitcode_patch(config: &mut GitcodeConfig, patch: GitcodeConfigPatch) {
    if let Some(value) = patch.username {
        config.username = Some(value);
    }

    if let Some(value) = patch.token {
        config.token = Some(value);
    }
}

fn apply_gitee_patch(config: &mut GiteeConfig, patch: GiteeConfigPatch) {
    if let Some(value) = patch.username {
        config.username = Some(value);
    }

    if let Some(value) = patch.token {
        config.token = Some(value);
    }
}

fn apply_github_patch(config: &mut GithubConfig, patch: GithubConfigPatch) {
    if let Some(value) = patch.username {
        config.username = Some(value);
    }

    if let Some(value) = patch.token {
        config.token = Some(value);
    }
}
