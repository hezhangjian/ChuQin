# Configuration

ChuQin stores root configuration in `.chuqin/config.toml` under the active ChuQin root.

## TOML Format

Example sections:

```toml
[github]
token = ""

[huawei_cloud]
project_id = ""
username = ""
password = ""

[llm]
provider = ""
model = ""
base_url = ""
api_key = ""
```

## Partial Updates

Structured config updates should use the partial update API instead of writing the whole TOML document.

Partial update semantics:

- Fields included in a patch replace the existing value.
- Fields omitted from a patch keep their existing value.
- Empty strings are valid values.
