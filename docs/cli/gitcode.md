# GitCode

The `gitcode` module contains commands for GitCode-related integrations in ChuQin.

## Commands

- `chuqin gitcode repo list`: List the authenticated user's GitCode code repositories.
- `chuqin gitcode repo delete <owner> <repo>`: Delete a GitCode repository by owner and repository path.

## Configuration

These commands require a GitCode personal access token in `.chuqin/config.toml`:

```toml
[gitcode]
token = "your-token"
username = "your-username"
```
