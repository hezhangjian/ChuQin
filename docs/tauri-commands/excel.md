# excel

## excel_create

Create a new Excel workbook.

Parameters:

- `title` (string): Workbook title. Used as the default filename when `output` is null.
- `output` (string | null): Optional explicit output path. If null, created in the current directory.
- `overwrite` (boolean): Whether to overwrite an existing file.
- `template` (string | null): Optional template name (without extension). Looks for `$CHUQIN_DIR/Resources/Templates/EXCEL/{template}.xlsx`.

Returns:

The absolute path to the created Excel workbook.

Behavior:

1. If `template` is provided, looks for `{template}.xlsx` in the templates directory.
2. If not found or not provided, looks for `default.xlsx`.
3. If neither exists, generates a built-in default workbook.
