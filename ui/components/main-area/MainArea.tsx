import {getAppDefinition} from '../apps/appDefinitions';
import {getToolDefinition} from '../tools/toolDefinitions';
import {FileEditor} from './FileEditor';
import {MainAreaTabs} from './MainAreaTabs';
import type {MainAreaTab} from '../../types';
import './MainArea.css';

type MainAreaProps = {
  activeTab: MainAreaTab | undefined;
  activeTabId: string;
  onCloseTab: (tabId: string) => void;
  onSelectTab: (tabId: string) => void;
  tabs: MainAreaTab[];
};

function renderTab(tab: MainAreaTab) {
  if (tab.type === 'file') {
    return <FileEditor path={tab.path} />;
  }

  if (tab.type === 'app') {
    const AppSurface = getAppDefinition(tab.appId).Surface;
    return <AppSurface />;
  }

  const ToolSurface = getToolDefinition(tab.toolId).Surface;
  return <ToolSurface />;
}

export function MainArea({activeTab, activeTabId, onCloseTab, onSelectTab, tabs}: MainAreaProps) {
  return (
    <section aria-label="Tabbed main area" className="main-area">
      <MainAreaTabs activeTabId={activeTabId} onCloseTab={onCloseTab} onSelectTab={onSelectTab} tabs={tabs} />
      <div className="main-area-body">
        {activeTab ? (
          tabs.map((tab) => (
            <div className="main-area-tab-panel" hidden={tab.id !== activeTabId} key={tab.id} role="tabpanel">
              {renderTab(tab)}
            </div>
          ))
        ) : (
          <div className="main-area-state empty">
            <strong>Select a file</strong>
          </div>
        )}
      </div>
    </section>
  );
}
