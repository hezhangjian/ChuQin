use crate::{AppContext, Error, Result};
use serde::Deserialize;

const GITEE_API_BASE_URL: &str = "https://gitee.com/api/v5";
const MAX_PER_PAGE: u32 = 100;

#[derive(Debug, Deserialize)]
pub struct RepoSummary {
    pub full_name: String,
    pub html_url: String,
    pub private: bool,
}

pub struct DeleteRepoOptions {
    pub owner: String,
    pub repo: String,
}

pub fn list_repos(ctx: &AppContext) -> Result<Vec<RepoSummary>> {
    let token = gitee_token(ctx)?;

    let client = reqwest::blocking::Client::new();
    let mut page = 1;
    let mut repos = Vec::new();

    loop {
        let response = client
            .get(format!("{GITEE_API_BASE_URL}/user/repos"))
            .query(&[
                ("access_token", token),
                ("page", &page.to_string()),
                ("per_page", &MAX_PER_PAGE.to_string()),
                ("sort", "updated"),
            ])
            .send()?
            .error_for_status()?;
        let mut page_repos: Vec<RepoSummary> = response.json()?;
        let fetched_count = page_repos.len() as u32;

        repos.append(&mut page_repos);

        if fetched_count < MAX_PER_PAGE {
            break;
        }

        page += 1;
    }

    Ok(repos)
}

pub fn delete_repo(ctx: &AppContext, options: &DeleteRepoOptions) -> Result<()> {
    let token = gitee_token(ctx)?;
    let owner = options.owner.trim();
    let repo = options.repo.trim();

    if owner.is_empty() {
        return Err(Error::InvalidInput("owner must not be empty".to_string()));
    }

    if repo.is_empty() {
        return Err(Error::InvalidInput("repo must not be empty".to_string()));
    }

    reqwest::blocking::Client::new()
        .delete(format!("{GITEE_API_BASE_URL}/repos/{owner}/{repo}"))
        .query(&[("access_token", token)])
        .send()?
        .error_for_status()?;

    Ok(())
}

fn gitee_token(ctx: &AppContext) -> Result<&str> {
    let config = ctx
        .config
        .as_ref()
        .and_then(|config| config.gitee.as_ref())
        .ok_or_else(|| Error::InvalidInput("missing [gitee] config".to_string()))?;

    config
        .token
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| Error::InvalidInput("missing gitee.token in config".to_string()))
}
