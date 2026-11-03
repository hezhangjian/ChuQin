import {createChat, openChat, useChats} from '../chat/chatStore';
import type {SidebarVariant} from './SidebarSections';
import '../chat/ChatSurface.css';

export function ChatSidebarSection({variant}: {variant: SidebarVariant}) {
  const chats = useChats();
  return (
    <section className={`chat-sidebar-section chat-sidebar-section-${variant}`} aria-label="Chats">
      <h2 className="sidebar-section-title">Chats</h2>
      <div className="chat-list">
        <button type="button" onClick={createChat}>
          ＋ 新建会话
        </button>
        {chats.map((session) => (
          <button key={session.id} type="button" onClick={() => openChat(session.id)}>
            {session.title}
            <small>{session.status}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
