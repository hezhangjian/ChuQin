import type {SidebarVariant} from './SidebarSections';

export function ChatSidebarSection({variant}: {variant: SidebarVariant}) {
  return (
    <section className={`chat-sidebar-section chat-sidebar-section-${variant}`} aria-label="Chats">
      <h2 className="sidebar-section-title">
        <span>Chats</span>
      </h2>
    </section>
  );
}
