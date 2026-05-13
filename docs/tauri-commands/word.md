# word

## word_create

Create a new Word document.

### Parameters

- `title` (string): Document title, used as the default filename stem.
- `output` (string | null): Optional explicit output path. If null, created in the current directory.
- `overwrite` (boolean): Whether to overwrite an existing file at the output path.
- `template` (string | null): Optional template name (without extension). Looks for `$CHUQIN_DIR/Resources/Templates/WORD/{template}.docx`.

### Returns

The absolute path to the created Word document.

### Template Lookup Order

1. If `template` is provided, looks for `{template}.docx` in the templates directory.
2. If not found or not provided, looks for `default.docx`.
3. If neither exists, generates a built-in default DOCX.

## word_templates

List available Word templates.

Returns an array of template info with `name` field.
Templates are `.docx` files in `$CHUQIN_DIR/Resources/Templates/WORD/`.
A `default.docx` file, if present, is used as the fallback template.
