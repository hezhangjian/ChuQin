import {openPath} from '@tauri-apps/plugin-opener';
import {listen} from '@tauri-apps/api/event';
import {useEffect, useState} from 'react';
import {AppTitlebar} from './components/app-shell/AppTitlebar';
import {AppSidebarSection} from './components/apps/AppSidebarSection';
import {FileActionDialogs} from './components/file-actions/FileActionDialogs';
import {useFileActions} from './components/file-actions/useFileActions';
import {MainArea} from './components/main-area/MainArea';
import {ChatSidebarSection} from './components/sidebar/ChatSidebarSection';
import {RightSidebar} from './components/sidebar/RightSidebar';
import {Sidebar} from './components/sidebar/Sidebar';
import {SidebarSections} from './components/sidebar/SidebarSections';
import {SettingsDialog} from './components/settings/SettingsDialog';
import {ToolSidebarSection} from './components/tools/ToolSidebarSection';
import {buildConfig} from './config/build';
import {useAppLayout} from './hooks/useAppLayout';
import {useFileExplorer} from './hooks/useFileExplorer';
import {useMainAreaTabs} from './hooks/useMainAreaTabs';
import {appEvents} from './lib/events';
import {getAbsoluteFilePath, getFileOpenMode} from './lib/fileHandlers';
import {SidebarSection} from './types';
import './App.css';

function isWindowsPlatform() {
  return navigator.userAgent.includes('Windows') && '__TAURI_INTERNALS__' in window;
}

function App() {
  const appLayout = useAppLayout();
  const fileExplorer = useFileExplorer();
  const mainAreaTabs = useMainAreaTabs();
  const fileActions = useFileActions(fileExplorer, mainAreaTabs);
  const isRightSidebarVisible = buildConfig.rightSidebar.visible;
  const rootStyle = isRightSidebarVisible
    ? appLayout.rootStyle
    : ({...appLayout.rootStyle, '--right-panel-width': '0px'} as typeof appLayout.rootStyle);
  const isWindows = isWindowsPlatform();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  function closeActiveTab() {
    if (mainAreaTabs.activeTab) {
      mainAreaTabs.closeTab(mainAreaTabs.activeTab.id);
    }
  }

  useEffect(() => {
    let isDisposed = false;
    let unlisten: (() => void) | undefined;

    listen(appEvents.closeActiveTab, closeActiveTab).then((dispose) => {
      if (isDisposed) {
        dispose();
        return;
      }

      unlisten = dispose;
    });

    return () => {
      isDisposed = true;
      unlisten?.();
    };
  }, [mainAreaTabs.activeTab?.id]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey && event.key.toLowerCase() === 'w') {
        event.preventDefault();
        closeActiveTab();
      }

      if ((event.metaKey || event.ctrlKey) && event.key === ',') {
        event.preventDefault();
        setIsSettingsOpen(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mainAreaTabs.activeTab?.id]);

  async function selectNode(node: Parameters<typeof fileExplorer.selectNode>[0]) {
    fileExplorer.selectNode(node);

    if (node.is_dir) {
      await fileExplorer.toggleDirectory(node);
      return;
    }

    if (getFileOpenMode(node) === 'external') {
      try {
        await openPath(getAbsoluteFilePath(fileExplorer.chuqinRootPath, node.path));
      } catch (error) {
        console.error(error);
      }
      return;
    }

    mainAreaTabs.openFile(node);
  }

  function renderRightSidebarSection(section: SidebarSection) {
    switch (section) {
      case SidebarSection.Apps:
        return (
          <AppSidebarSection
            activeAppId={mainAreaTabs.activeTab?.type === 'app' ? mainAreaTabs.activeTab.appId : undefined}
            apps={buildConfig.apps}
            onOpenApp={mainAreaTabs.openApp}
          />
        );
      case SidebarSection.Chats:
        return <ChatSidebarSection variant="right" />;
      case SidebarSection.Tools:
        return (
          <ToolSidebarSection
            activeToolId={mainAreaTabs.activeTab?.type === 'tool' ? mainAreaTabs.activeTab.toolId : undefined}
            onOpenTool={mainAreaTabs.openTool}
            tools={buildConfig.tools}
          />
        );
      case SidebarSection.Files:
        return null;
    }
  }

  return (
    <main
      className={`app-layout${isWindows ? ' is-windows' : ''}${appLayout.isResizingPanel ? ' resizing-panel' : ''}`}
      style={rootStyle}
    >
      <AppTitlebar
        isLeftCollapsed={appLayout.isLeftCollapsed}
        isRightCollapsed={appLayout.isRightCollapsed}
        isRightSidebarVisible={isRightSidebarVisible}
        isWindows={isWindows}
        onToggleLeft={appLayout.toggleLeftCollapsed}
        onToggleRight={appLayout.toggleRightCollapsed}
      />

      {appLayout.isLeftCollapsed ? null : (
        <Sidebar
          activeAppId={mainAreaTabs.activeTab?.type === 'app' ? mainAreaTabs.activeTab.appId : undefined}
          activeToolId={mainAreaTabs.activeTab?.type === 'tool' ? mainAreaTabs.activeTab.toolId : undefined}
          apps={buildConfig.apps}
          directoryStates={fileExplorer.directoryStates}
          isLoadingRoot={fileExplorer.isLoadingRoot}
          nodes={fileExplorer.nodes}
          onCreateFile={fileActions.requestCreateFile}
          onDelete={fileActions.requestDelete}
          onOpenApp={mainAreaTabs.openApp}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTool={mainAreaTabs.openTool}
          onRename={fileActions.requestRename}
          onResizeKeyDown={(event) => appLayout.resizePanelWithKeyboard('left', event)}
          onResizePointerDown={(event) => appLayout.startPanelResize('left', event)}
          onSelect={selectNode}
          panelWidth={appLayout.leftPanelWidth}
          rootError={fileExplorer.rootError}
          sections={buildConfig.leftSidebar.sections}
          selectedPath={fileExplorer.selectedPath}
          tools={buildConfig.tools}
        />
      )}
      <MainArea
        activeTab={mainAreaTabs.activeTab}
        activeTabId={mainAreaTabs.activeTabId}
        onCloseTab={mainAreaTabs.closeTab}
        onSelectTab={mainAreaTabs.selectTab}
        tabs={mainAreaTabs.tabs}
      />
      {isRightSidebarVisible && !appLayout.isRightCollapsed ? (
        <RightSidebar
          onResizeKeyDown={(event) => appLayout.resizePanelWithKeyboard('right', event)}
          onResizePointerDown={(event) => appLayout.startPanelResize('right', event)}
          panelWidth={appLayout.rightPanelWidth}
        >
          <SidebarSections
            renderSection={renderRightSidebarSection}
            sections={buildConfig.rightSidebar.sections}
            variant="right"
          />
        </RightSidebar>
      ) : null}
      <FileActionDialogs fileActions={fileActions} />
      {isSettingsOpen ? <SettingsDialog onClose={() => setIsSettingsOpen(false)} /> : null}
    </main>
  );
}

export default App;
