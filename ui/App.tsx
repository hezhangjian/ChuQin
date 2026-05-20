import {openPath} from '@tauri-apps/plugin-opener';
import {listen} from '@tauri-apps/api/event';
import {useEffect, useState} from 'react';
import {MainArea} from './components/main-area/MainArea';
import {Sidebar} from './components/sidebar/Sidebar';
import {SettingsDialog} from './components/settings/SettingsDialog';
import {ToolPanel} from './components/tools/ToolPanel';
import {WindowControls} from './components/window-controls/WindowControls';
import {useAppLayout} from './hooks/useAppLayout';
import {useFileExplorer} from './hooks/useFileExplorer';
import type {CreatableFileKind, TreeNode} from './hooks/useFileExplorer';
import {useMainAreaTabs} from './hooks/useMainAreaTabs';
import {getAbsoluteFilePath, getFileOpenMode} from './lib/fileHandlers';
import './App.css';

const closeActiveTabEvent = 'chuqin://close-active-tab';

const creatableFileLabels: Record<CreatableFileKind, string> = {
  excel: 'Excel 表格',
  markdown: 'Markdown',
  ppt: 'PPT',
  text: 'TXT',
  word: 'Word 文档',
};

const creatableFileDefaultNames: Record<CreatableFileKind, string> = {
  excel: '未命名表格.xlsx',
  markdown: '未命名.md',
  ppt: '未命名演示文稿.pptx',
  text: '未命名.txt',
  word: '未命名文档.docx',
};

function isWindowsPlatform() {
  return navigator.userAgent.includes('Windows') && '__TAURI_INTERNALS__' in window;
}

function App() {
  const appLayout = useAppLayout();
  const fileExplorer = useFileExplorer();
  const mainAreaTabs = useMainAreaTabs();
  const isWindows = isWindowsPlatform();
  const [createTarget, setCreateTarget] = useState<{folder: TreeNode; kind: CreatableFileKind}>();
  const [createValue, setCreateValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TreeNode>();
  const [fileActionError, setFileActionError] = useState<string>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<TreeNode>();
  const [renameValue, setRenameValue] = useState('');

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

  function requestRename(node: TreeNode) {
    setFileActionError(undefined);
    setRenameTarget(node);
    setRenameValue(node.name);
  }

  function requestCreateFile(folder: TreeNode, kind: CreatableFileKind) {
    setFileActionError(undefined);
    setCreateTarget({folder, kind});
    setCreateValue(creatableFileDefaultNames[kind]);
  }

  async function createFile() {
    if (!createTarget) {
      return;
    }

    try {
      const path = await fileExplorer.createFile(createTarget.folder, createTarget.kind, createValue);
      setCreateTarget(undefined);
      setCreateValue('');
      setFileActionError(undefined);

      const createdName = path.split('/').pop() ?? createValue.trim();
      if (createTarget.kind === 'markdown' || createTarget.kind === 'text') {
        mainAreaTabs.openFile({
          name: createdName,
          path,
          is_dir: false,
        });
      }
    } catch (error) {
      setFileActionError(error instanceof Error ? error.message : String(error));
    }
  }

  async function renameNode() {
    if (!renameTarget) {
      return;
    }

    const newName = renameValue.trim();
    if (!newName || newName === renameTarget.name) {
      return;
    }

    try {
      const newPath = await fileExplorer.renameNode(renameTarget, newName);
      mainAreaTabs.renamePath(renameTarget.path, newPath, newName);
      setRenameTarget(undefined);
      setRenameValue('');
      setFileActionError(undefined);
    } catch (error) {
      setFileActionError(error instanceof Error ? error.message : String(error));
    }
  }

  function requestDelete(node: TreeNode) {
    setFileActionError(undefined);
    setDeleteTarget(node);
  }

  async function deleteNode() {
    if (!deleteTarget) {
      return;
    }

    try {
      await fileExplorer.deleteNode(deleteTarget);
      mainAreaTabs.closePath(deleteTarget.path);
      setDeleteTarget(undefined);
      setFileActionError(undefined);
    } catch (error) {
      setFileActionError(error instanceof Error ? error.message : String(error));
    }
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
          onCreateFile={requestCreateFile}
          onDelete={requestDelete}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRename={requestRename}
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
          activeAppId={mainAreaTabs.activeTab?.type === 'app' ? mainAreaTabs.activeTab.appId : undefined}
          activeToolId={mainAreaTabs.activeTab?.type === 'tool' ? mainAreaTabs.activeTab.toolId : undefined}
          onOpenApp={mainAreaTabs.openApp}
          onOpenTool={mainAreaTabs.openTool}
          onResizeKeyDown={(event) => appLayout.resizePanelWithKeyboard('right', event)}
          onResizePointerDown={(event) => appLayout.startPanelResize('right', event)}
          panelWidth={appLayout.rightPanelWidth}
        />
      )}
      {createTarget ? (
        <div className="file-action-backdrop" role="presentation">
          <form
            aria-label="Create file"
            className="file-action-dialog"
            onSubmit={(event) => {
              event.preventDefault();
              void createFile();
            }}
            role="dialog"
          >
            <h2>新建{creatableFileLabels[createTarget.kind]}</h2>
            <input
              autoFocus
              className="file-action-input"
              onChange={(event) => setCreateValue(event.target.value)}
              onFocus={(event) => event.target.select()}
              value={createValue}
            />
            {fileActionError ? <p className="file-action-error">{fileActionError}</p> : null}
            <div className="file-action-buttons">
              <button
                onClick={() => {
                  setCreateTarget(undefined);
                  setCreateValue('');
                  setFileActionError(undefined);
                }}
                type="button"
              >
                取消
              </button>
              <button className="primary" disabled={!createValue.trim()} type="submit">
                新建
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {renameTarget ? (
        <div className="file-action-backdrop" role="presentation">
          <form
            aria-label="Rename item"
            className="file-action-dialog"
            onSubmit={(event) => {
              event.preventDefault();
              void renameNode();
            }}
            role="dialog"
          >
            <h2>重命名</h2>
            <input
              autoFocus
              className="file-action-input"
              onChange={(event) => setRenameValue(event.target.value)}
              value={renameValue}
            />
            {fileActionError ? <p className="file-action-error">{fileActionError}</p> : null}
            <div className="file-action-buttons">
              <button
                onClick={() => {
                  setRenameTarget(undefined);
                  setFileActionError(undefined);
                }}
                type="button"
              >
                取消
              </button>
              <button className="primary" disabled={!renameValue.trim()} type="submit">
                重命名
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {deleteTarget ? (
        <div className="file-action-backdrop" role="presentation">
          <div aria-label="Delete item" className="file-action-dialog" role="dialog">
            <h2>删除</h2>
            <p>
              删除{deleteTarget.is_dir ? '文件夹' : '文件'} <strong>{deleteTarget.name}</strong>?
            </p>
            {fileActionError ? <p className="file-action-error">{fileActionError}</p> : null}
            <div className="file-action-buttons">
              <button
                onClick={() => {
                  setDeleteTarget(undefined);
                  setFileActionError(undefined);
                }}
                type="button"
              >
                取消
              </button>
              <button className="danger" onClick={() => void deleteNode()} type="button">
                删除
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isSettingsOpen ? <SettingsDialog onClose={() => setIsSettingsOpen(false)} /> : null}
    </main>
  );
}

export default App;
