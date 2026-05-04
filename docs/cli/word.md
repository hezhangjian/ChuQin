# Word

The `word` module contains commands for Word-related integrations in ChuQin.

## Create Command

Pass the document title directly after `create`:

```bash
chuqin word create "Project Weekly Report"
```

This creates `./Project Weekly Report.docx` in the current directory.

The provided title is used as:

- The cover title or top-level document title
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
chuqin word create "Project Weekly Report" --template technology
```

## Templates

### Default Template Lookup

If `--template` is not provided, ChuQin looks for:

- `CHUQIN_DIR/.chuqin/word/templates/default`

If `--template technology` is provided, ChuQin looks for:

- `CHUQIN_DIR/.chuqin/word/templates/technology`

If that directory does not exist, ChuQin falls back to a small built-in style so `chuqin word create "<title>"` still works immediately.

### Template Shape

The current template recommendation is a directory, for example:

```text
.chuqin/word/templates/default/
└── template.toml
```
