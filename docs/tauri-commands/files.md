# files

## files_list

List files and directories.

- `path?: string` - Optional relative path

## files_root

Return the absolute ChuQin root directory path.

## files_read_text

Read a UTF-8 text file under the ChuQin root.

- `path: string` - Relative path

## files_write_text

Write a UTF-8 text file under the ChuQin root.

- `path: string` - Relative path
- `content: string` - File content

## files_delete

Delete a file or directory.

- `path: string` - Relative path

## files_rename

Rename a file or directory.

- `old_path: string` - Current relative path
- `new_name: string` - New filename
