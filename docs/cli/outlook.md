# Outlook

The `outlook` module contains commands for Outlook-related integrations in ChuQin.

## ArchivePst Command

Scans the default email directory for the current platform, finds `*.pst` files recursively, and compresses them into a dated ZIP archive.


```bash
chuqin outlook archive-pst
```

The source directory is fixed by platform:

```text
macOS: ~/Email
Windows: D:/Email
```

The output archive is written to:

```text
$CHUQIN_DIR/Resources/Books/Email/email-YYYYMMDD.zip
```

For example, when the current log date is `20260508`, the generated archive path is:

```text
$CHUQIN_DIR/Resources/Books/Email/email-20260508.zip
```
