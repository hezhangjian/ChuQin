# Configuration

ChuQin stores root configuration in `.chuqin/config.toml` under the active ChuQin root.

## TOML Format

Example sections:

```toml
[github]
username = ""
token = ""

[gitee]
username = ""
token = ""

[gitcode]
username = ""
token = ""

[huaweicloud]
project_id = ""
username = ""
password = ""

[openai]
model = ""
base_url = ""
api_key = ""

[volcengine]
ak = ""
sk = ""
visual_host = ""
region = ""
video_req_key = ""
```

Legacy section names `[llm]` and `[huawei_cloud]` are still accepted when reading configuration.

## Partial Updates

Structured config updates should use the partial update API instead of writing the whole TOML document.

Partial update semantics:

- Fields included in a patch replace the existing value.
- Fields omitted from a patch keep their existing value.
- Empty strings are valid values.
