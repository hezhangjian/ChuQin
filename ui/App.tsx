import {openPath} from '@tauri-apps/plugin-opener';
import {MainArea} from './components/main-area/MainArea';
import {Sidebar} from './components/sidebar/Sidebar';
import {ToolPanel} from './components/tools/ToolPanel';
import {useAppLayout} from './hooks/useAppLayout';
import {useFileExplorer} from './hooks/useFileExplorer';
import {useMainAreaTabs} from './hooks/useMainAreaTabs';
import {getAbsoluteFilePath, getFileOpenMode} from './lib/fileHandlers';
import './App.css';

function App() {
  const appLayout = useAppLayout();
  const fileExplorer = useFileExplorer();
  const mainAreaTabs = useMainAreaTabs();

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
    <main className={`app-layout${appLayout.isResizingPanel ? ' resizing-panel' : ''}`} style={appLayout.rootStyle}>
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
          panelWidth={appLayout.rightPanelWidth}
        />
      )}
    </main>
  );
}

export default App;
