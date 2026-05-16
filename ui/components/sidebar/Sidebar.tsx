import {useEffect, useState} from 'react';
import type {CSSProperties, KeyboardEvent, MouseEvent, PointerEvent} from 'react';
import {getDirectoryStateFromRecord} from '../../hooks/useFileExplorer';
import type {DirectoryState, TreeNode} from '../../hooks/useFileExplorer';

type FileTreeContextMenu = {
  node: TreeNode;
  x: number;
  y: number;
};

const contextMenuHeight = 76;
const contextMenuWidth = 168;
const contextMenuViewportMargin = 8;

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
  directoryStates,
  isLoadingRoot,
  nodes,
  onDelete,
  onRename,
  onResizeKeyDown,
  onResizePointerDown,
  onSelect,
  panelWidth,
  rootError,
  selectedPath,
}: {
  directoryStates: Record<string, DirectoryState>;
  isLoadingRoot: boolean;
  nodes: TreeNode[];
  onDelete: (node: TreeNode) => void;
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
        Math.min(event.clientY, window.innerHeight - contextMenuHeight - contextMenuViewportMargin)
      ),
    });
  }

  return (
    <aside className="sidebar" aria-label="Left sidebar">
      <nav className="file-tree" aria-label="Files">
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
      {contextMenu ? (
        <div
          className="file-tree-context-menu"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          role="menu"
          style={{left: contextMenu.x, top: contextMenu.y}}
        >
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
