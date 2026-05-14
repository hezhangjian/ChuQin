import {FileEditor} from './FileEditor';
import {MainAreaTabs} from './MainAreaTabs';
import {ToolWorkspace} from '../tools/ToolWorkspace';
import type {MainAreaTab} from '../../types';

type MainAreaProps = {
  activeTab: MainAreaTab | undefined;
  activeTabId: string;
  onCloseTab: (tabId: string) => void;
  onSelectTab: (tabId: string) => void;
  tabs: MainAreaTab[];
};

function renderTab(tab: MainAreaTab | undefined) {
  if (!tab) {
    return (
      <div className="main-area-state empty">
        <strong>Select a file</strong>
      </div>
    );
  }

  if (tab.type === 'file') {
    return <FileEditor key={tab.path} path={tab.path} />;
  }

  return <ToolWorkspace key={tab.toolId} toolId={tab.toolId} />;
}

export function MainArea({activeTab, activeTabId, onCloseTab, onSelectTab, tabs}: MainAreaProps) {
  return (
    <section aria-label="Tabbed main area" className="main-area">
      <MainAreaTabs activeTabId={activeTabId} onCloseTab={onCloseTab} onSelectTab={onSelectTab} tabs={tabs} />
      <div className="main-area-body">{renderTab(activeTab)}</div>
    </section>
  );
}
