import type {MainAreaTab} from '../../types/mainAreaTabs';

type MainAreaTabsProps = {
  activeTabId: string;
  onCloseTab: (tabId: string) => void;
  onSelectTab: (tabId: string) => void;
  tabs: MainAreaTab[];
};

export function MainAreaTabs({activeTabId, onCloseTab, onSelectTab, tabs}: MainAreaTabsProps) {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div aria-label="Open tabs" className="main-tabs" role="tablist">
      {tabs.map((tab) => (
        <div
          aria-selected={tab.id === activeTabId}
          className={`main-tab${tab.id === activeTabId ? ' active' : ''}`}
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          role="tab"
          tabIndex={0}
          title={tab.title}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              onSelectTab(tab.id);
            }
          }}
        >
          <span className="main-tab-title">{tab.title}</span>
          <button
            aria-label={`Close ${tab.title}`}
            className="main-tab-close"
            onClick={(event) => {
              event.stopPropagation();
              onCloseTab(tab.id);
            }}
            type="button"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
