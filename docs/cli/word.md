# Word

The `word` module contains commands for Word-related integrations in ChuQin.

## `create` Command

Pass the document title directly after `create`:

```bash
chuqin word create "Project Weekly Report"
```

This creates `./Project Weekly Report.docx` in the current directory.

The provided title is used as:

- The default output filename stem

### Options

Choose an explicit output path:

```bash
chuqin word create "Project Weekly Report" -o ./output/weekly-report.docx
```

Overwrite an existing file:

```bash
chuqin word create "Project Weekly Report" --overwrite
```

Use a custom template name:

```bash
chuqin word create "Project Weekly Report" --template report
```

## Templates

### Template Lookup Order

1. If `--template report` is provided, ChuQin looks for:
   - `$CHUQIN_DIR/Resources/Templates/WORD/report.docx`
2. If the specified template is not found (or no `--template` is given), ChuQin looks for:
   - `$CHUQIN_DIR/Resources/Templates/WORD/default.docx`
3. If neither exists, ChuQin generates a built-in default DOCX.

If a `.docx` template file is found, it is copied directly to the output location.

### Template Shape

Templates are `.docx` files placed in `$CHUQIN_DIR/Resources/Templates/WORD/`:

```text
Resources/Templates/WORD/
├── report.docx
├── default.docx        # fallback template (used when --template is not specified or not found)
└── meeting-notes.docx
```
