import {useSyncExternalStore} from 'react';
import {Channel, invoke} from '@tauri-apps/api/core';

export type ChatEntry = {id: string; kind: string; text: string; details?: string};
export type ChatSession = {
  id: string;
  title: string;
  directory: string;
  executable: string;
  model: string;
  remoteId?: string;
  entries: ChatEntry[];
  status: string;
  draft: string;
};
const key = 'chuqin.chat.sessions.v1';
function restore(): ChatSession[] {
  try {
    const data = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(data)
      ? data
          .filter((s) => typeof s.id === 'string' && Array.isArray(s.entries))
          .map((s) => ({...s, status: s.status === '执行中' ? '已中断' : s.status}))
      : [];
  } catch {
    return [];
  }
}
let sessions = restore();
let storageError = '';
const listeners = new Set<() => void>();
function update(id: string, change: (session: ChatSession) => ChatSession) {
  sessions = sessions.map((s) => (s.id === id ? change(s) : s));
  publish();
}
function publish() {
  try {
    localStorage.setItem(key, JSON.stringify(sessions));
    storageError = '';
  } catch {
    storageError = '会话无法保存到本机，关闭窗口后可能丢失。';
  }
  listeners.forEach((listener) => listener());
}
export function useChats() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => sessions
  );
}
export function getChatStorageError() {
  return storageError;
}
export function editChat(id: string, values: Partial<ChatSession>) {
  update(id, (s) => ({...s, ...values}));
}
export function openChat(id: string) {
  window.dispatchEvent(
    new CustomEvent('chuqin:open-chat', {detail: {id, title: sessions.find((s) => s.id === id)?.title ?? '会话'}})
  );
}
export function createChat() {
  const session: ChatSession = {
    id: crypto.randomUUID(),
    title: '新会话',
    directory: '',
    executable: 'opencode',
    model: '',
    entries: [],
    status: '准备就绪',
    draft: '',
  };
  sessions = [session, ...sessions];
  publish();
  openChat(session.id);
}
type AgentEvent = {
  type: string;
  id?: string;
  text?: string;
  message?: string;
  name?: string;
  details?: string;
  delta?: boolean;
  cancelled?: boolean;
  success?: boolean;
};
export async function sendChat(id: string) {
  const session = sessions.find((s) => s.id === id);
  if (!session || session.status === '执行中' || !session.draft.trim()) return;
  const prompt = session.draft.trim();
  update(id, (s) => ({
    ...s,
    title: s.entries.length ? s.title : prompt.slice(0, 28),
    draft: '',
    status: '执行中',
    entries: [...s.entries, {id: crypto.randomUUID(), kind: 'user', text: prompt}],
  }));
  const events = new Channel<AgentEvent>();
  events.onmessage = (event) =>
    update(id, (s) => {
      if (event.type === 'session') return {...s, remoteId: event.id};
      if (event.type === 'finished')
        return {...s, status: event.cancelled ? '已停止' : event.success ? '已完成' : '执行失败'};
      const entryId = event.id ?? crypto.randomUUID();
      const old = s.entries.find((entry) => entry.id === entryId);
      const entry = {
        id: entryId,
        kind: event.type,
        text: event.type === 'tool' ? (event.name ?? '工具') : (event.text ?? event.message ?? ''),
        details: event.details,
      };
      if (event.delta && old) entry.text = old.text + entry.text;
      return {...s, entries: old ? s.entries.map((e) => (e.id === entryId ? entry : e)) : [...s.entries, entry]};
    });
  try {
    await invoke('chat_run', {
      id,
      config: {kind: 'open_code', executable: session.executable, arguments: [], model: session.model},
      request: {directory: session.directory, model: session.model, prompt, session_id: session.remoteId ?? null},
      events,
    });
    update(id, (s) =>
      s.status === '执行中'
        ? {
            ...s,
            status: '执行失败',
            entries: [...s.entries, {id: crypto.randomUUID(), kind: 'error', text: '执行连接已结束，未收到完成状态。'}],
          }
        : s
    );
  } catch (error) {
    update(id, (s) => ({
      ...s,
      status: '执行失败',
      draft: prompt,
      entries: [...s.entries, {id: crypto.randomUUID(), kind: 'error', text: String(error)}],
    }));
  }
}
export async function stopChat(id: string) {
  await invoke('chat_stop', {id});
}
