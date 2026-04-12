# Gitee

The `gitee` module contains commands for Gitee-related integrations in ChuQin.

At the moment, this module includes repository operations under the `repo` command group.

## Available Commands

- `chuqin gitee repo list`: List repositories accessible to the configured Gitee account.

## Example

```bash
chuqin gitee repo list
```

## What It Does

This command:

- Reads the Gitee access token from `CHUQIN_DIR/.chuqin/config.toml`.
- Requests the repository list for the configured account.
- Prints each repository as `full_name`, visibility, and repository URL.

## Configuration

```toml
[gitee]
token = "your-gitee-access-token"
```

## Common Options

```bash
chuqin gitee repo list --page 2 --per-page 50 --type private
```

Common values for `--type` include:

- `all`
- `owner`
- `public`
- `private`
- `member`
