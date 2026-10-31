use chuqin_core::{AppContext, Error};
use clap::{Args, Subcommand};

#[derive(Args, Debug)]
pub struct GitcodeCommand {
    #[command(subcommand)]
    pub command: GitcodeSubcommand,
}

#[derive(Subcommand, Debug)]
pub enum GitcodeSubcommand {
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

pub fn run(ctx: &AppContext, command: GitcodeCommand) -> Result<(), Error> {
    match command.command {
        GitcodeSubcommand::Repo(command) => run_repo(ctx, command)?,
    }

    Ok(())
}

fn run_repo(ctx: &AppContext, command: RepoCommand) -> Result<(), Error> {
    match command.command {
        RepoSubcommand::Delete(args) => {
            chuqin_core::gitcode::delete_repo(
                ctx,
                &chuqin_core::gitcode::DeleteRepoOptions {
                    owner: args.owner,
                    repo: args.repo,
                },
            )?;
            println!("Deleted GitCode repository");
        }
        RepoSubcommand::List => {
            let repos = chuqin_core::gitcode::list_repos(ctx)?;

            for repo in repos {
                let visibility = if repo.private { "private" } else { "public" };
                println!("{}\t{}\t{}", repo.full_name, visibility, repo.html_url);
            }
        }
    }

    Ok(())
}
