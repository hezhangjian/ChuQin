# Chat commands

## `chat_run`

Arguments: `id` (local conversation ID), `config` (AgentConfig), `request` (RunRequest),
and `events` (Tauri Channel). Resolves when execution finishes. Duplicate active IDs are rejected.

AgentConfig contains `kind` (`open_code` or `custom`), `executable`, `arguments`, and `model`.
RunRequest contains `directory`, `model`, `prompt`, and nullable `session_id`.
The frontend currently exposes OpenCode; it uses the local installation's authentication and tool permissions.
No shell interpolation is used for executable paths, directories, models, or prompt input.

Channel events: `session`, `text`, `tool`, `notice`, `error`, and `finished`.
The terminal event includes `cancelled` and `success`. Text events include an ID and a delta flag.
Closing a workspace tab does not cancel a run; reopening the conversation restores its current state.

## `chat_stop`

Argument: `id`. Requests cancellation of the active Agent process group. The channel subsequently emits
its terminal status. Stopping an inactive conversation is a no-op.

## Origin and storage

The execution adapters and process supervisor were adapted from AgentDesk dev revision `f92d068`
(`src/agent`, Apache-2.0, Zhangjian He). ChuQin owns its Tauri bridge and React presentation.
Conversations and drafts are stored in the desktop WebView's local storage under `chuqin.chat.sessions.v1`.
No AgentDesk conversation files or settings are read or modified. Interrupted runs are marked on reload.
This initial storage format is not yet a filesystem-backed conversation archive.
