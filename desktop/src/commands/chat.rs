use crate::{AppState, agent::{self, AgentConfig, AgentEvent, RunRequest}};
use std::sync::atomic::Ordering;
use tauri::{ipc::Channel, State};

#[tauri::command]
pub async fn chat_run(id: String, config: AgentConfig, request: RunRequest, events: Channel<AgentEvent>, state: State<'_, AppState>) -> Result<(), String> {
    config.validate().map_err(|e| e.to_string())?;
    let run = {
        let mut runs = state.chat_runs.lock().map_err(|e| e.to_string())?;
        if runs.contains_key(&id) { return Err("会话正在执行".into()); }
        let run = agent::launch(config, request);
        runs.insert(id.clone(), run.cancelled.clone());
        run
    };
    let result = tauri::async_runtime::spawn_blocking(move || {
        while let Ok(event) = run.events.recv() {
            let finished = matches!(event, AgentEvent::Finished { .. });
            if events.send(event).is_err() { run.cancel(); break; }
            if finished { break; }
        }
    }).await;
    state.chat_runs.lock().map_err(|e| e.to_string())?.remove(&id);
    result.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn chat_stop(id: String, state: State<'_, AppState>) -> Result<(), String> {
    if let Some(cancelled) = state.chat_runs.lock().map_err(|e| e.to_string())?.get(&id) {
        cancelled.store(true, Ordering::Relaxed);
    }
    Ok(())
}
