import type {CSSProperties, KeyboardEvent, PointerEvent} from 'react';
import {getDirectoryStateFromRecord} from '../../hooks/useFileExplorer';
import type {DirectoryState, TreeNode} from '../../hooks/useFileExplorer';

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
  selectedPath,
}: {
  depth: number;
  node: TreeNode;
  directoryState: DirectoryState;
  directoryStates: Record<string, DirectoryState>;
  isSelected: boolean;
  onSelect: (node: TreeNode) => void;
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
  selectedPath,
}: {
  depth: number;
  directoryStates?: Record<string, DirectoryState>;
  nodes: TreeNode[];
  onSelect: (node: TreeNode) => void;
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
  onResizeKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onResizePointerDown: (event: PointerEvent<HTMLElement>) => void;
  onSelect: (node: TreeNode) => void;
  panelWidth: number;
  rootError?: string;
  selectedPath?: string;
}) {
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
            selectedPath={selectedPath}
          />
        ) : null}
      </nav>
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
