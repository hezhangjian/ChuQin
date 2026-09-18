use chuqin_core::{AppContext, Error};
use clap::{Args, Subcommand};

#[derive(Args, Debug)]
pub struct GiteeCommand {
    #[command(subcommand)]
    pub command: GiteeSubcommand,
}

#[derive(Subcommand, Debug)]
pub enum GiteeSubcommand {
    Repo(RepoCommand),
}

#[derive(Args, Debug)]
pub struct RepoCommand {
    #[command(subcommand)]
    pub command: RepoSubcommand,
}

#[derive(Subcommand, Debug)]
pub enum RepoSubcommand {
    Delete(DeleteRepoArgs),
    List,
}

#[derive(Args, Debug)]
pub struct DeleteRepoArgs {
    pub owner: String,
    pub repo: String,
}

pub fn run(ctx: &AppContext, command: GiteeCommand) -> Result<(), Error> {
    match command.command {
        GiteeSubcommand::Repo(command) => run_repo(ctx, command)?,
    }

    Ok(())
}

fn run_repo(ctx: &AppContext, command: RepoCommand) -> Result<(), Error> {
    match command.command {
        RepoSubcommand::Delete(args) => {
            chuqin_core::gitee::delete_repo(
                ctx,
                &chuqin_core::gitee::DeleteRepoOptions {
                    owner: args.owner,
                    repo: args.repo,
                },
            )?;
            println!("Deleted Gitee repository");
        }
        RepoSubcommand::List => {
            let repos = chuqin_core::gitee::list_repos(ctx)?;

            for repo in repos {
                let visibility = if repo.private { "private" } else { "public" };
                println!("{}\t{}\t{}", repo.full_name, visibility, repo.html_url);
            }
        }
    }

    Ok(())
}
