# ChuQin UI Tools

This section documents capabilities that belong to the desktop application's tool area rather than the standalone CLI.

## Scope

- Tool-panel capabilities exposed through the UI.
- Tool-specific workflows, parameters, and expected outcomes.
- Shared conventions for how tools appear and behave inside the desktop experience.

## Tools

- **摘要计算**: Computes local text digests in the main area after being opened from the tool panel. The initial
  supported algorithms are MD5, SHA-1, SHA-256, SHA-384, and SHA-512.
- **Email 备份**: Starts the desktop `outlook_backup_pst_start` background task to package PST files from the default
  email directory into `$CHUQIN_DIR/Resources/Email/email-YYYYMMDD.zip`, listens for progress events, and cancels the
  task when the tool tab is closed.

## Review assistant

The left sidebar groups entry points under Projects, Chats, Apps, and Tools. Projects currently exposes the existing
ChuQin file tree; it does not yet maintain a separate project registry. Chats supports local Agent sessions.
Code Manager and the review assistant are available under Apps; utilities remain under Tools.

The review assistant prepares requests for code changes, configuration, and documents. Users supply the target,
version or comparison range, review rules, and source material. Generating a request captures those inputs in a
read-only snapshot that can be copied to a model. Editing the form does not change an existing snapshot until
it is regenerated. Switching workspace tabs preserves the form; closing the tool tab discards it.

This stage does not fetch MR links, resolve commit references, invoke a model, or persist execution records.
Version fields are user-supplied context rather than verified repository snapshots. The next execution integration
must resolve immutable inputs and record rules, status, evidence, and results before presenting a completed review.
