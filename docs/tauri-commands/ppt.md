# ppt

## ppt_create

Create a new PPT document.

### Parameters

- `title` (string): Document title, used as the default filename stem.
- `output` (string | null): Optional explicit output path. If null, created in the current directory.
- `overwrite` (boolean): Whether to overwrite an existing file at the output path.
- `template` (string | null): Optional template name (without extension). Looks for `$CHUQIN_DIR/Resources/Templates/PPT/{template}.pptx`.

### Returns

The absolute path to the created PPT file.

### Template Lookup Order

1. If `template` is provided, looks for `{template}.pptx` in the templates directory.
2. If not found or not provided, looks for `default.pptx`.
3. If neither exists, generates a built-in default 16:9 PPTX.

## ppt_templates

List available PPT templates.

Returns an array of template info with `name` field.
Templates are `.pptx` files in `$CHUQIN_DIR/Resources/Templates/PPT/`.
A `default.pptx` file, if present, is used as the fallback template.
