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

  if (tab.type === 'app') {
    const AppSurface = getAppDefinition(tab.appId).Surface;
    return <AppSurface key={tab.id} />;
  }

  const ToolSurface = getToolDefinition(tab.toolId).Surface;
  return <ToolSurface key={tab.id} />;
}

export function MainArea({activeTab, activeTabId, onCloseTab, onSelectTab, tabs}: MainAreaProps) {
  return (
    <section aria-label="Tabbed main area" className="main-area">
      <MainAreaTabs activeTabId={activeTabId} onCloseTab={onCloseTab} onSelectTab={onSelectTab} tabs={tabs} />
      <div className="main-area-body">{renderTab(activeTab)}</div>
    </section>
  );
}
