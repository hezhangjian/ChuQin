import {openPath} from '@tauri-apps/plugin-opener';
import {listen} from '@tauri-apps/api/event';
import {useEffect} from 'react';
import {MainArea} from './components/main-area/MainArea';
import {Sidebar} from './components/sidebar/Sidebar';
import {ToolPanel} from './components/tools/ToolPanel';
import {WindowControls} from './components/window-controls/WindowControls';
import {useAppLayout} from './hooks/useAppLayout';
import {useFileExplorer} from './hooks/useFileExplorer';
import {useMainAreaTabs} from './hooks/useMainAreaTabs';
import {getAbsoluteFilePath, getFileOpenMode} from './lib/fileHandlers';
import './App.css';

const closeActiveTabEvent = 'chuqin://close-active-tab';

function isWindowsPlatform() {
  return navigator.userAgent.includes('Windows');
}

function App() {
  const appLayout = useAppLayout();
  const fileExplorer = useFileExplorer();
  const mainAreaTabs = useMainAreaTabs();
  const isWindows = isWindowsPlatform();

  function closeActiveTab() {
    if (mainAreaTabs.activeTab) {
      mainAreaTabs.closeTab(mainAreaTabs.activeTab.id);
    }
  }

  useEffect(() => {
    let isDisposed = false;
    let unlisten: (() => void) | undefined;

    listen(closeActiveTabEvent, closeActiveTab).then((dispose) => {
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

  return (
    <main
      className={`app-layout${isWindows ? ' is-windows' : ''}${appLayout.isResizingPanel ? ' resizing-panel' : ''}`}
      style={appLayout.rootStyle}
    >
      <header className="app-titlebar" data-tauri-drag-region>
        <div className="titlebar-actions left" data-tauri-drag-region>
          <button
            aria-label={appLayout.isLeftCollapsed ? 'Show file explorer' : 'Hide file explorer'}
            className="titlebar-toggle"
            onClick={appLayout.toggleLeftCollapsed}
            type="button"
          >
            <span className="sidebar-toggle-icon left" aria-hidden="true" />
          </button>
        </div>

        <div className="titlebar-actions right" data-tauri-drag-region>
          <button
            aria-label={appLayout.isRightCollapsed ? 'Show tool panel' : 'Hide tool panel'}
            className="titlebar-toggle"
            onClick={appLayout.toggleRightCollapsed}
            type="button"
          >
            <span className="sidebar-toggle-icon right" aria-hidden="true" />
          </button>
          {isWindows ? <WindowControls /> : null}
        </div>
      </header>

      {appLayout.isLeftCollapsed ? null : (
        <Sidebar
          directoryStates={fileExplorer.directoryStates}
          isLoadingRoot={fileExplorer.isLoadingRoot}
          nodes={fileExplorer.nodes}
          onResizeKeyDown={(event) => appLayout.resizePanelWithKeyboard('left', event)}
          onResizePointerDown={(event) => appLayout.startPanelResize('left', event)}
          onSelect={selectNode}
          panelWidth={appLayout.leftPanelWidth}
          rootError={fileExplorer.rootError}
          selectedPath={fileExplorer.selectedPath}
        />
      )}
      <MainArea
        activeTab={mainAreaTabs.activeTab}
        activeTabId={mainAreaTabs.activeTabId}
        onCloseTab={mainAreaTabs.closeTab}
        onSelectTab={mainAreaTabs.selectTab}
        tabs={mainAreaTabs.tabs}
      />
      {appLayout.isRightCollapsed ? null : (
        <ToolPanel
          onResizeKeyDown={(event) => appLayout.resizePanelWithKeyboard('right', event)}
          onResizePointerDown={(event) => appLayout.startPanelResize('right', event)}
          activeToolId={mainAreaTabs.activeTab?.type === 'tool' ? mainAreaTabs.activeTab.toolId : undefined}
          onOpenTool={mainAreaTabs.openTool}
          panelWidth={appLayout.rightPanelWidth}
        />
      )}
    </main>
  );
}

export default App;
