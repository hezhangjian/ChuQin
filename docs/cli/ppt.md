# PPT

The `ppt` module contains commands for PPT-related integrations in ChuQin.

## `create` Command

Pass the PPT title directly after `create`:

```bash
chuqin ppt create "Engineering Planning"
```

This creates `./Engineering Planning.pptx` in the current directory.

The provided title is used as:

- The cover title in the generated deck
- The default output filename stem

### Options

Choose an explicit output path:

```bash
chuqin ppt create "Engineering Planning" -o ./output/plan-v1.pptx
```

Overwrite an existing file:

```bash
chuqin ppt create "Engineering Planning" --overwrite
```

Use a custom template name:

```bash
chuqin ppt create "Engineering Planning" --template technology
```

## Templates

### Default Template Lookup

If `--template` is not provided, ChuQin looks for:

- `$CHUQIN_DIR/Resources/Templates/PPT/default`

If `--template technology` is provided, ChuQin looks for:

- `$CHUQIN_DIR/Resources/Templates/PPT/technology`

If that directory does not exist, ChuQin falls back to a small built-in style so `chuqin ppt create "<title>"` still
works immediately.

### Template Shape

The template name should map to a directory, for example:

```text
Resources/Templates/PPT/default/
└── template.toml
```
