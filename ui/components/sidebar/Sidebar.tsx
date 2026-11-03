import {LayoutGrid, FolderOpen, MessageSquare, Settings, Wrench} from 'lucide-react';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {CSSProperties, KeyboardEvent, MouseEvent, PointerEvent} from 'react';
import {getDirectoryStateFromRecord} from '../../hooks/useFileExplorer';
import type {CreatableFileKind, DirectoryState, TreeNode} from '../../hooks/useFileExplorer';
import {SidebarSection} from '../../types';
import type {AppId, ToolId} from '../../types';
import {AppSidebarSection} from '../apps/AppSidebarSection';
import {ToolSidebarSection} from '../tools/ToolSidebarSection';
import {ChatSidebarSection} from './ChatSidebarSection';
import {SidebarSections} from './SidebarSections';
import './Sidebar.css';

type FileTreeContextMenu = {
  canModifyNode: boolean;
  node: TreeNode;
  x: number;
  y: number;
};

const contextMenuHeight = 76;
const folderContextMenuHeight = 236;
const rootContextMenuHeight = 172;
const contextMenuWidth = 164;
const contextMenuViewportMargin = 8;

const primaryCreatableFileMenuItems: Array<{kind: CreatableFileKind; labelKey: string}> = [
  {kind: 'folder', labelKey: 'fileActions.createFolder'},
  {kind: 'markdown', labelKey: 'fileActions.createMarkdown'},
  {kind: 'text', labelKey: 'fileActions.createText'},
  {kind: 'ppt', labelKey: 'fileActions.createPpt'},
];

const secondaryCreatableFileMenuItems: Array<{kind: CreatableFileKind; label: string}> = [
  {kind: 'excel', label: 'Excel'},
  {kind: 'word', label: 'Word'},
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
  activeToolId,
  apps,
  directoryStates,
  isLoadingRoot,
  nodes,
  onCreateFile,
  onDelete,
  onOpenApp,
  onOpenSettings,
  onOpenTool,
  onRename,
  onResizeKeyDown,
  onResizePointerDown,
  onSelect,
  panelWidth,
  rootError,
  sections,
  selectedPath,
  tools,
}: {
  activeAppId: AppId | undefined;
  activeToolId: ToolId | undefined;
  apps: AppId[];
  directoryStates: Record<string, DirectoryState>;
  isLoadingRoot: boolean;
  nodes: TreeNode[];
  onCreateFile: (folder: TreeNode, kind: CreatableFileKind) => void;
  onDelete: (node: TreeNode) => void;
  onOpenApp: (appId: AppId) => void;
  onOpenSettings: () => void;
  onOpenTool: (toolId: ToolId) => void;
  onRename: (node: TreeNode) => void;
  onResizeKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onResizePointerDown: (event: PointerEvent<HTMLElement>) => void;
  onSelect: (node: TreeNode) => void;
  panelWidth: number;
  rootError?: string;
  sections: SidebarSection[];
  selectedPath?: string;
  tools: ToolId[];
}) {
  const {t} = useTranslation();
  const [contextMenu, setContextMenu] = useState<FileTreeContextMenu>();
  const [activeSection, setActiveSection] = useState(SidebarSection.Files);
  const primarySections = [
    {id: SidebarSection.Files, label: 'Projects', Icon: FolderOpen},
    {id: SidebarSection.Chats, label: 'Chats', Icon: MessageSquare},
    {id: SidebarSection.Apps, label: 'Apps', Icon: LayoutGrid},
    {id: SidebarSection.Tools, label: 'Tools', Icon: Wrench},
  ].filter((section) => sections.includes(section.id));
  const contentSections = sections.filter((section) => section === activeSection && section !== SidebarSection.Files);

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

  function getContextMenuHeight(node: TreeNode, canModifyNode: boolean) {
    if (!node.is_dir) {
      return contextMenuHeight;
    }

    return canModifyNode ? folderContextMenuHeight : rootContextMenuHeight;
  }

  function showContextMenu(event: MouseEvent, node: TreeNode, canModifyNode = true) {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      canModifyNode,
      node,
      x: Math.max(
        contextMenuViewportMargin,
        Math.min(event.clientX, window.innerWidth - contextMenuWidth - contextMenuViewportMargin)
      ),
      y: Math.max(
        contextMenuViewportMargin,
        Math.min(
          event.clientY,
          window.innerHeight - getContextMenuHeight(node, canModifyNode) - contextMenuViewportMargin
        )
      ),
    });
  }

  function showRootContextMenu(event: MouseEvent) {
    if (event.target instanceof Element && event.target.closest('.file-tree-row')) {
      return;
    }

    showContextMenu(event, {children: nodes, is_dir: true, name: 'Files', path: ''}, false);
  }

  function createFile(folder: TreeNode, kind: CreatableFileKind) {
    onCreateFile(folder, kind);
    setContextMenu(undefined);
  }

  function renderSection(section: SidebarSection) {
    switch (section) {
      case SidebarSection.Apps:
        return <AppSidebarSection activeAppId={activeAppId} apps={apps} onOpenApp={onOpenApp} />;
      case SidebarSection.Chats:
        return <ChatSidebarSection variant="left" />;
      case SidebarSection.Tools:
        return <ToolSidebarSection activeToolId={activeToolId} onOpenTool={onOpenTool} tools={tools} />;
      case SidebarSection.Files:
        return null;
    }
  }

  return (
    <aside className="sidebar" aria-label="Left sidebar">
      <nav className="primary-navigation" aria-label="Workspace">
        <div className="primary-navigation-items">
          {primarySections.map(({id, label, Icon}) => (
            <button
              aria-current={activeSection === id ? 'page' : undefined}
              className={`primary-navigation-entry${activeSection === id ? ' active' : ''}`}
              key={id}
              onClick={() => setActiveSection(id)}
              type="button"
            >
              <Icon size={21} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <button className="primary-navigation-entry" onClick={onOpenSettings} type="button">
          <Settings size={21} aria-hidden="true" />
          <span>{t('settings.labels.title')}</span>
        </button>
      </nav>
      <div className="sidebar-scroll">
        {activeSection === SidebarSection.Files && sections.includes(SidebarSection.Files) ? (
          <nav className="file-tree" aria-label="Files" onContextMenu={showRootContextMenu}>
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
        ) : null}
        {contentSections.length > 0 ? (
          <div className="sidebar-sections">
            <SidebarSections renderSection={renderSection} sections={contentSections} variant="left" />
          </div>
        ) : null}
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
                  {t(item.labelKey)}
                </button>
              ))}
              <div className="file-tree-context-submenu">
                <button aria-haspopup="menu" role="menuitem" type="button">
                  <span>{t('fileActions.createMore')}</span>
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
          {contextMenu.canModifyNode ? (
            <>
              <button
                onClick={() => {
                  onRename(contextMenu.node);
                  setContextMenu(undefined);
                }}
                role="menuitem"
                type="button"
              >
                {t('fileActions.rename')}
              </button>
              <button
                onClick={() => {
                  onDelete(contextMenu.node);
                  setContextMenu(undefined);
                }}
                role="menuitem"
                type="button"
              >
                {t('fileActions.delete')}
              </button>
            </>
          ) : null}
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
