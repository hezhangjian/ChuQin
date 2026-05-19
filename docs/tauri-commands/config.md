# config

Configuration is stored at `.chuqin/config.toml` under the active ChuQin root. See
[Configuration](../config/README.md) for the config format.

## config_get

Read and parse `.chuqin/config.toml`.

Returns:

The parsed config, or `null` when the file is missing.

## config_read

Read `.chuqin/config.toml` from the active ChuQin root.

Returns:

Existing TOML content, or `null` when the file is missing.

## config_write

Validate and write `.chuqin/config.toml` under the active ChuQin root.

- `content: string` - TOML content matching the ChuQin config format

The command creates the `.chuqin` directory when needed, normalizes the TOML using the current format, and refreshes the
desktop backend context with the saved config.

Returns the saved TOML content.

## config_update

Apply a partial update to `.chuqin/config.toml`.

- `patch: object` - A section patch, such as `github`, `huawei_cloud`, or `llm`

Patch semantics:

- Fields included in a patch replace the existing value.
- Fields omitted from a patch keep their existing value.
- Empty strings are valid values.

Examples:

```json
{
  "github": {
    "token": "..."
  }
}
```

```json
{
  "huawei_cloud": {
    "project_id": "..."
  }
}
```

Returns:

Full parsed config after the patch.
