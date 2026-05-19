import {useEffect, useState} from 'react';
import type {CSSProperties, KeyboardEvent, MouseEvent, PointerEvent} from 'react';
import {getDirectoryStateFromRecord} from '../../hooks/useFileExplorer';
import type {CreatableFileKind, DirectoryState, TreeNode} from '../../hooks/useFileExplorer';
import type {AppId} from '../../types';

type FileTreeContextMenu = {
  node: TreeNode;
  x: number;
  y: number;
};

const contextMenuHeight = 76;
const folderContextMenuHeight = 204;
const contextMenuWidth = 164;
const contextMenuViewportMargin = 8;

const primaryCreatableFileMenuItems: Array<{kind: CreatableFileKind; label: string}> = [
  {kind: 'markdown', label: '新建 Markdown'},
  {kind: 'text', label: '新建 TXT'},
  {kind: 'ppt', label: '新建 PPT'},
];

const secondaryCreatableFileMenuItems: Array<{kind: CreatableFileKind; label: string}> = [
  {kind: 'excel', label: 'Excel 表格'},
  {kind: 'word', label: 'Word 文档'},
];

function getFileNameParts(node: TreeNode) {
  if (node.is_dir) {
    return {extension: '', name: node.name};
  }

  const extensionStart = node.name.lastIndexOf('.');

  if (extensionStart <= 0 || extensionStart === node.name.length - 1) {
    return {extension: '', name: node.name};
  }

  return {
    extension: node.name.slice(extensionStart + 1).toUpperCase(),
    name: node.name.slice(0, extensionStart),
  };
}

function FileTreeRow({
  depth,
  node,
  directoryState,
  directoryStates,
  isSelected,
  onSelect,
  onShowContextMenu,
  selectedPath,
}: {
  depth: number;
  node: TreeNode;
  directoryState: DirectoryState;
  directoryStates: Record<string, DirectoryState>;
  isSelected: boolean;
  onSelect: (node: TreeNode) => void;
  onShowContextMenu: (event: MouseEvent, node: TreeNode) => void;
  selectedPath?: string;
}) {
  const isOpen = node.is_dir && directoryState.expanded;
  const nameParts = getFileNameParts(node);

  return (
    <li className="file-tree-item">
      <button
        aria-expanded={node.is_dir ? isOpen : undefined}
        className={`file-tree-row${isSelected ? ' selected' : ''}`}
        onClick={() => {
          onSelect(node);
        }}
        onContextMenu={(event) => onShowContextMenu(event, node)}
        style={{'--tree-depth': depth} as CSSProperties}
        title={node.name}
        type="button"
      >
        <span
          className={`file-tree-chevron${isOpen ? ' expanded' : ''}${node.is_dir ? '' : ' hidden'}`}
          aria-hidden="true"
        />
        <span className="file-tree-label">
          <span className="file-tree-name">{nameParts.name}</span>
          {nameParts.extension ? (
            <span className="file-tree-extension" aria-label={`File type ${nameParts.extension}`}>
              {nameParts.extension}
            </span>
          ) : null}
        </span>
      </button>

      {directoryState.error ? (
        <div className="file-tree-message" style={{'--tree-depth': depth + 1} as CSSProperties}>
          {directoryState.error}
        </div>
      ) : null}
      {directoryState.loading ? (
        <div className="file-tree-message" style={{'--tree-depth': depth + 1} as CSSProperties}>
          Loading...
        </div>
      ) : null}

      {isOpen && node.children && node.children.length > 0 ? (
        <FileTreeList
          depth={depth + 1}
          directoryStates={directoryStates}
          nodes={node.children}
          onSelect={onSelect}
          onShowContextMenu={onShowContextMenu}
          selectedPath={selectedPath}
        />
      ) : null}
    </li>
  );
}

function FileTreeList({
  depth,
  directoryStates,
  nodes,
  onSelect,
  onShowContextMenu,
  selectedPath,
}: {
  depth: number;
  directoryStates?: Record<string, DirectoryState>;
  nodes: TreeNode[];
  onSelect: (node: TreeNode) => void;
  onShowContextMenu: (event: MouseEvent, node: TreeNode) => void;
  selectedPath?: string;
}) {
  const states = directoryStates ?? {};

  return (
    <ul className="file-tree-list">
      {nodes.map((node) => (
        <FileTreeRow
          depth={depth}
          directoryState={getDirectoryStateFromRecord(states, node.path)}
          directoryStates={states}
          isSelected={selectedPath === node.path}
          key={node.path}
          node={node}
          onSelect={onSelect}
          onShowContextMenu={onShowContextMenu}
          selectedPath={selectedPath}
        />
      ))}
    </ul>
  );
}

export function Sidebar({
  activeAppId,
  directoryStates,
  isLoadingRoot,
  nodes,
  onCreateFile,
  onDelete,
  onOpenApp,
  onOpenSettings,
  onRename,
  onResizeKeyDown,
  onResizePointerDown,
  onSelect,
  panelWidth,
  rootError,
  selectedPath,
}: {
  activeAppId?: AppId;
  directoryStates: Record<string, DirectoryState>;
  isLoadingRoot: boolean;
  nodes: TreeNode[];
  onCreateFile: (folder: TreeNode, kind: CreatableFileKind) => void;
  onDelete: (node: TreeNode) => void;
  onOpenApp: (appId: AppId) => void;
  onOpenSettings: () => void;
  onRename: (node: TreeNode) => void;
  onResizeKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onResizePointerDown: (event: PointerEvent<HTMLElement>) => void;
  onSelect: (node: TreeNode) => void;
  panelWidth: number;
  rootError?: string;
  selectedPath?: string;
}) {
  const [contextMenu, setContextMenu] = useState<FileTreeContextMenu>();

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    function closeContextMenu() {
      setContextMenu(undefined);
    }

    function closeContextMenuOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        closeContextMenu();
      }
    }

    window.addEventListener('click', closeContextMenu);
    window.addEventListener('keydown', closeContextMenuOnEscape);
    window.addEventListener('resize', closeContextMenu);
    window.addEventListener('scroll', closeContextMenu, true);

    return () => {
      window.removeEventListener('click', closeContextMenu);
      window.removeEventListener('keydown', closeContextMenuOnEscape);
      window.removeEventListener('resize', closeContextMenu);
      window.removeEventListener('scroll', closeContextMenu, true);
    };
  }, [contextMenu]);

  function showContextMenu(event: MouseEvent, node: TreeNode) {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      node,
      x: Math.max(
        contextMenuViewportMargin,
        Math.min(event.clientX, window.innerWidth - contextMenuWidth - contextMenuViewportMargin)
      ),
      y: Math.max(
        contextMenuViewportMargin,
        Math.min(
          event.clientY,
          window.innerHeight - (node.is_dir ? folderContextMenuHeight : contextMenuHeight) - contextMenuViewportMargin
        )
      ),
    });
  }

  function createFile(folder: TreeNode, kind: CreatableFileKind) {
    onCreateFile(folder, kind);
    setContextMenu(undefined);
  }

  return (
    <aside className="sidebar" aria-label="Left sidebar">
      <div className="sidebar-scroll">
        <nav className="file-tree" aria-label="Files">
          <h2 className="sidebar-section-title">
            <span>Files</span>
          </h2>
          {rootError ? <p className="file-tree-root-message">{rootError}</p> : null}
          {isLoadingRoot ? <p className="file-tree-root-message">Loading...</p> : null}
          {!isLoadingRoot && !rootError ? (
            <FileTreeList
              depth={0}
              directoryStates={directoryStates}
              nodes={nodes}
              onSelect={onSelect}
              onShowContextMenu={showContextMenu}
              selectedPath={selectedPath}
            />
          ) : null}
        </nav>
        <nav className="sidebar-apps" aria-label="Apps">
          <h2 className="sidebar-section-title">
            <span>Apps</span>
          </h2>
          <button
            className={`sidebar-app-entry${activeAppId === 'code-manager' ? ' active' : ''}`}
            onClick={() => onOpenApp('code-manager')}
            type="button"
          >
            <svg className="sidebar-app-icon" aria-hidden="true" viewBox="0 0 24 24">
              <path d="m8 9-4 3 4 3" />
              <path d="m16 9 4 3-4 3" />
              <path d="m14 5-4 14" />
            </svg>
            <span>Code Manager</span>
          </button>
        </nav>
      </div>
      <div className="sidebar-settings">
        <button className="sidebar-settings-button" onClick={onOpenSettings} type="button">
          <svg className="sidebar-settings-icon" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 .9-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5.9h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
          </svg>
          <span>Settings</span>
        </button>
      </div>
      {contextMenu ? (
        <div
          className="file-tree-context-menu"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          role="menu"
          style={{left: contextMenu.x, top: contextMenu.y}}
        >
          {contextMenu.node.is_dir ? (
            <>
              {primaryCreatableFileMenuItems.map((item) => (
                <button
                  key={item.kind}
                  onClick={() => createFile(contextMenu.node, item.kind)}
                  role="menuitem"
                  type="button"
                >
                  {item.label}
                </button>
              ))}
              <div className="file-tree-context-submenu">
                <button aria-haspopup="menu" role="menuitem" type="button">
                  <span>新建更多</span>
                  <span aria-hidden="true" className="file-tree-context-submenu-arrow" />
                </button>
                <div className="file-tree-context-menu nested" role="menu">
                  {secondaryCreatableFileMenuItems.map((item) => (
                    <button
                      key={item.kind}
                      onClick={() => createFile(contextMenu.node, item.kind)}
                      role="menuitem"
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="file-tree-context-separator" role="separator" />
            </>
          ) : null}
          <button
            onClick={() => {
              onRename(contextMenu.node);
              setContextMenu(undefined);
            }}
            role="menuitem"
            type="button"
          >
            重命名
          </button>
          <button
            onClick={() => {
              onDelete(contextMenu.node);
              setContextMenu(undefined);
            }}
            role="menuitem"
            type="button"
          >
            删除
          </button>
        </div>
      ) : null}
      <div
        aria-label="Resize file explorer"
        aria-orientation="vertical"
        aria-valuemax={520}
        aria-valuemin={180}
        aria-valuenow={panelWidth}
        className="panel-resize-handle left"
        onKeyDown={onResizeKeyDown}
        onPointerDown={onResizePointerDown}
        role="separator"
        tabIndex={0}
      />
    </aside>
  );
}
