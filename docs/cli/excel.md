# Excel

The `excel` module contains commands for Excel-related integrations in ChuQin.

## `create` Command

Pass the workbook title directly after `create`:

```bash
chuqin excel create "Project Tracker"
```

This creates `./Project Tracker.xlsx` in the current directory.

The provided title is used as:

- The default output filename stem
- The initial value in cell `A1`

### Options

Choose an explicit output path:

```bash
chuqin excel create "Project Tracker" -o ./output/project-tracker.xlsx
```

Overwrite an existing file:

```bash
chuqin excel create "Project Tracker" --overwrite
```

Use a custom template name:

```bash
chuqin excel create "Project Tracker" --template tracker
```

## Templates

### Template Lookup Order

1. If `--template tracker` is provided, ChuQin looks for:
   - `$CHUQIN_DIR/Resources/Templates/EXCEL/tracker.xlsx`
2. If the specified template is not found (or no `--template` is given), ChuQin looks for:
   - `$CHUQIN_DIR/Resources/Templates/EXCEL/default.xlsx`
3. If neither exists, ChuQin generates a built-in default XLSX.

If a `.xlsx` template file is found, it is copied directly to the output location.

### Template Shape

Templates are `.xlsx` files placed in `$CHUQIN_DIR/Resources/Templates/EXCEL/`:

```text
Resources/Templates/EXCEL/
├── tracker.xlsx
├── default.xlsx        # fallback template (used when --template is not specified or not found)
└── budget.xlsx
```
