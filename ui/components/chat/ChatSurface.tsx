import {useEffect, useRef, useState} from 'react';
import {editChat, getChatStorageError, sendChat, stopChat, useChats} from './chatStore';
import './ChatSurface.css';

export function ChatSurface({id}: {id: string}) {
  const chats = useChats();
  const session = chats.find((s) => s.id === id);
  const end = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    end.current?.scrollIntoView({block: 'nearest'});
  }, [session?.entries]);
  if (!session) return <p>会话不存在。</p>;
  const running = session.status === '执行中';
  return (
    <section className="chat-surface">
      <header>
        <div>
          <h1>{session.title}</h1>
          <span role="status">{session.status}</span>
        </div>
        <details>
          <summary>Agent 设置</summary>
          <label>
            工作目录
            <input
              disabled={running || !!session.remoteId}
              value={session.directory}
              onChange={(e) => editChat(id, {directory: e.target.value})}
              placeholder="本机目录的绝对路径"
            />
          </label>
          <label>
            OpenCode 可执行文件
            <input
              disabled={running || !!session.remoteId}
              value={session.executable}
              onChange={(e) => editChat(id, {executable: e.target.value})}
            />
          </label>
          <label>
            模型
            <input
              disabled={running || !!session.remoteId}
              value={session.model}
              onChange={(e) => editChat(id, {model: e.target.value})}
              placeholder="留空使用 OpenCode 默认模型"
            />
          </label>
          <p>
            使用本机 OpenCode 的登录与权限配置。Agent 可在工作目录中运行工具和修改文件。续聊沿用首次执行的目录与配置。
          </p>
        </details>
      </header>
      <div className="chat-messages" aria-label="会话消息">
        {!session.entries.length && (
          <div className="chat-welcome">
            <h2>开始一个会话</h2>
            <p>填写工作目录后发送消息，回复与工具执行记录会显示在这里。</p>
          </div>
        )}
        {session.entries.map((entry) => (
          <article className={`chat-message chat-message-${entry.kind}`} key={entry.id}>
            <strong>
              {entry.kind === 'user'
                ? '你'
                : entry.kind === 'text'
                  ? 'Agent'
                  : entry.kind === 'tool'
                    ? '工具'
                    : entry.kind === 'error'
                      ? '错误'
                      : '提示'}
            </strong>
            <div>{entry.text}</div>
            {entry.details && (
              <details>
                <summary>查看工具记录</summary>
                <pre>{entry.details}</pre>
              </details>
            )}
          </article>
        ))}
        <div ref={end} />
      </div>
      <form
        className="chat-composer"
        onSubmit={(e) => {
          e.preventDefault();
          void sendChat(id);
        }}
      >
        {(error || getChatStorageError()) && <p role="alert">{error || getChatStorageError()}</p>}
        <textarea
          aria-label="消息"
          value={session.draft}
          onChange={(e) => editChat(id, {draft: e.target.value})}
          placeholder="输入消息…"
          rows={3}
        />
        <div>
          <span>{session.directory || '请先在 Agent 设置中填写工作目录'}</span>
          {running ? (
            <button
              type="button"
              onClick={() => {
                void stopChat(id).catch((e) => setError(String(e)));
              }}
            >
              停止
            </button>
          ) : (
            <button
              disabled={!session.draft.trim() || !session.directory.trim() || !session.executable.trim()}
              type="submit"
            >
              发送
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
