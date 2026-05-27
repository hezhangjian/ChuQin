# outlook

## outlook_backup_pst

Back up Outlook PST files from the default email directory.

### Parameters

None.

### Returns

An object with:

- `backup_path` (string): Path to the generated ZIP backup under `$CHUQIN_DIR/Resources/Email/`.
- `file_count` (number): Number of PST files included in the backup.
- `source_dir` (string): Default email directory that was scanned.

### Behavior

The command calls `chuqin_core::outlook::backup_pst`, which scans `~/Email` on macOS/Linux and `D:/Email` on Windows,
then writes `email-YYYYMMDD.zip`.

## outlook_backup_pst_start

Start Outlook PST backup as a background task.

### Parameters

- `task_id` (string, optional): Caller-provided task identifier. When omitted, the desktop backend generates one.

### Returns

An object with:

- `task_id` (string): Task identifier to match progress events and cancel the task.

### Events

The command emits `chuqin://outlook-backup-pst-progress` events with a `task_id` and one of these `status` values:

- `scanning`: The default email directory is being scanned.
- `compressing`: A PST file is being written to the ZIP. Includes file counts, current file path, and byte progress.
- `finishing`: ZIP finalization is in progress.
- `completed`: Backup finished successfully. Includes `backup_path`, `file_count`, and `source_dir`.
- `canceled`: The task was canceled.
- `failed`: The task failed. Includes `error`.

## outlook_backup_pst_cancel

Cancel a running Outlook PST backup task.

### Parameters

- `task_id` (string): Task identifier returned by `outlook_backup_pst_start`.

### Returns

Nothing on success.
