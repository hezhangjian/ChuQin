# Volcengine Module

The `volcengine` module contains commands for Volcengine-related integrations in ChuQin.


At the moment, this module includes video generation commands under the `video` command group.

## Available Commands

- `chuqin volcengine video gen "<prompt>"`: Generate a video through the VolcEngine Visual async API.

## Example

```bash
chuqin volcengine video gen "A ginger cat running along the beach at sunset, cinematic shot"
```

## What It Does

This command:

- Reads `ak` and `sk` from `CHUQIN_DIR/.chuqin/config.toml`.
- Submits an async generation task to `visual.volcengineapi.com`.
- Polls until the task completes or times out.
- Downloads the generated file to the configured output directory.

## Configuration

```toml
[volcengine]
ak = "your-access-key"
sk = "your-secret-key"
visual_host = "visual.volcengineapi.com"
region = "cn-north-1"
video_req_key = "jimeng_t2v_v30"
```

## Common Options

```bash
chuqin volcengine video gen "Cyberpunk street scene, slow camera push-in" \
  --output-dir ./outputs \
  --req-key jimeng_t2v_v30 \
  --poll-interval 5 \
  --timeout 1800
```

Key options and related config fields:

- `--output-dir`: Directory used to save downloaded video files.
- `--req-key`: Override the configured model key for this run.
- `--poll-interval`: Polling interval in seconds while waiting for task completion.
- `--timeout`: Maximum wait time in seconds before the command exits.
- `visual_host`: API host, default `visual.volcengineapi.com`.
- `region`: Signing region, default `cn-north-1`.
- `video_req_key`: Default model key used by `chuqin volcengine video gen`.
