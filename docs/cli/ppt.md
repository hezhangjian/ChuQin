# PPT

The `ppt` module contains commands for PPT-related integrations in ChuQin.

## `create` Command

Pass the PPT title directly after `create`:

```bash
chuqin ppt create "Engineering Planning"
```

This creates `./Engineering Planning.pptx` in the current directory.

The provided title is used as:

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

### Template Lookup Order

1. If `--template technology` is provided, ChuQin looks for:
   - `$CHUQIN_DIR/Resources/Templates/PPT/technology.pptx`
2. If the specified template is not found (or no `--template` is given), ChuQin looks for:
   - `$CHUQIN_DIR/Resources/Templates/PPT/default.pptx`
3. If neither exists, ChuQin generates a built-in default 16:9 PPTX.

If a `.pptx` template file is found, it is copied directly to the output location.

### Template Shape

Templates are `.pptx` files placed in `$CHUQIN_DIR/Resources/Templates/PPT/`:

```text
Resources/Templates/PPT/
├── technology.pptx
├── default.pptx        # fallback template (used when --template is not specified or not found)
└── minimal.pptx
```
