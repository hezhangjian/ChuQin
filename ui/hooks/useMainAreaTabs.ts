import {useMemo, useState} from 'react';
import type {FileNode} from '../types';
import {getFileOpenMode} from '../lib/fileHandlers';
import type {MainAreaTab} from '../types/mainAreaTabs';

const maxOpenTabs = 10;

export type MainAreaTabsState = {
  activeTab: MainAreaTab | undefined;
  activeTabId: string;
  closeTab: (tabId: string) => void;
  openFile: (node: FileNode) => MainAreaTab | null;
  selectTab: (tabId: string) => void;
  tabs: MainAreaTab[];
};

function fileNodeToTab(node: FileNode): MainAreaTab | null {
  const mode = getFileOpenMode(node);

  if (node.is_dir || mode === 'external') {
    return null;
  }

  return {
    id: `file:${node.path}`,
    mode,
    path: node.path,
    title: node.name,
    type: 'file',
  };
}

export function useMainAreaTabs(): MainAreaTabsState {
  const [activeTabId, setActiveTabId] = useState('');
  const [tabs, setTabs] = useState<MainAreaTab[]>([]);

  const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0], [activeTabId, tabs]);

  function openTab(tab: MainAreaTab) {
    setTabs((currentTabs) => {
      if (currentTabs.some((currentTab) => currentTab.id === tab.id)) {
        return currentTabs;
      }

      return [...currentTabs, tab].slice(-maxOpenTabs);
    });
    setActiveTabId(tab.id);
  }

  function openFile(node: FileNode) {
    const tab = fileNodeToTab(node);

    if (tab) {
      openTab(tab);
    }

    return tab;
  }

  function selectTab(tabId: string) {
    setActiveTabId(tabId);
  }

  function closeTab(tabId: string) {
    setTabs((currentTabs) => {
      const nextTabs = currentTabs.filter((tab) => tab.id !== tabId);

      if (tabId === activeTabId) {
        const tabIndex = currentTabs.findIndex((tab) => tab.id === tabId);
        const nextActiveTab = nextTabs[Math.max(0, tabIndex - 1)] ?? nextTabs[0];
        setActiveTabId(nextActiveTab?.id ?? '');
      }

      return nextTabs;
    });
  }

  return {
    activeTab,
    activeTabId,
    closeTab,
    openFile,
    selectTab,
    tabs,
  };
}
