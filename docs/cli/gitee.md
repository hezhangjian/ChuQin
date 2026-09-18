# Gitee

The `gitee` module contains commands for Gitee-related integrations in ChuQin.

## `repo` Command

The `repo` command contains repository-related Gitee operations.

Configuration:

Set the Gitee token in `.chuqin/config.toml`:

```toml
[gitee]
token = "your-access-token"
```

### `delete` Command

`chuqin gitee repo delete` deletes a repository owned by the configured Gitee account or another repository the token is allowed to delete.

Usage:

```bash
chuqin gitee repo delete <OWNER> <REPO>
```

### `list` Command

`chuqin gitee repo list` lists repositories visible to the configured Gitee account.

Usage:

```bash
chuqin gitee repo list
```

The command fetches all repositories visible to the configured Gitee account.

Output:

Each line is printed as tab-separated columns:

```text
<full_name>    <public|private>    <html_url>
```
