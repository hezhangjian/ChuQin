import {invoke} from '@tauri-apps/api/core';
import {useCallback, useEffect, useRef, useState} from 'react';
import {getAbsoluteFilePath} from '../lib/fileHandlers';
import type {FileNode} from '../types';

export type TreeNode = FileNode & {
  children?: TreeNode[];
};

export type DirectoryState = {
  expanded: boolean;
  loading: boolean;
  error?: string;
};

export type CreatableFileKind = 'folder' | 'excel' | 'markdown' | 'ppt' | 'text' | 'word';

export type FileExplorerState = {
  chuqinRootPath: string;
  nodes: TreeNode[];
  directoryStates: Record<string, DirectoryState>;
  selectedPath?: string;
  createFile: (folder: TreeNode, kind: CreatableFileKind, fileName: string) => Promise<string>;
  deleteNode: (node: TreeNode) => Promise<void>;
  isLoadingRoot: boolean;
  rootError?: string;
  getDirectoryState: (path: string) => DirectoryState;
  refreshRoot: () => Promise<void>;
  renameNode: (node: TreeNode, newName: string) => Promise<string>;
  selectNode: (node: TreeNode) => void;
  toggleDirectory: (node: TreeNode) => Promise<void>;
};

const emptyDirectoryState: DirectoryState = {
  expanded: false,
  loading: false,
};

export function getDirectoryStateFromRecord(states: Record<string, DirectoryState>, path: string) {
  return states[path] ?? emptyDirectoryState;
}

function insertChildren(nodes: TreeNode[], path: string, children: TreeNode[]): TreeNode[] {
  return nodes.map((node) => {
    if (node.path === path) {
      return {...node, children};
    }

    if (!node.children) {
      return node;
    }

    return {...node, children: insertChildren(node.children, path, children)};
  });
}

function getParentPath(path: string) {
  const separatorIndex = path.lastIndexOf('/');
  return separatorIndex === -1 ? undefined : path.slice(0, separatorIndex);
}

function getRenamedPath(path: string, newName: string) {
  const parentPath = getParentPath(path);
  return parentPath ? `${parentPath}/${newName}` : newName;
}

function isWithinPath(path: string, parentPath: string) {
  return path === parentPath || path.startsWith(`${parentPath}/`);
}

function replacePathPrefix(path: string, oldPath: string, newPath: string) {
  if (path === oldPath) {
    return newPath;
  }

  if (path.startsWith(`${oldPath}/`)) {
    return `${newPath}${path.slice(oldPath.length)}`;
  }

  return path;
}

function renameDirectoryStates(
  states: Record<string, DirectoryState>,
  oldPath: string,
  newPath: string
): Record<string, DirectoryState> {
  return Object.fromEntries(
    Object.entries(states).map(([path, state]) => [replacePathPrefix(path, oldPath, newPath), state])
  );
}

const creatableFileExtensions: Record<CreatableFileKind, string | undefined> = {
  folder: undefined,
  excel: 'xlsx',
  markdown: 'md',
  ppt: 'pptx',
  text: 'txt',
  word: 'docx',
};

const invalidFileNamePattern = /[<>:"/\\|?*]/;

function joinPath(parentPath: string, childName: string) {
  return parentPath ? `${parentPath}/${childName}` : childName;
}

function getFileTitle(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '');
}

function normalizeCreatableFileName(fileName: string, kind: CreatableFileKind) {
  const trimmedName = fileName.trim();
  const extension = creatableFileExtensions[kind];

  if (!trimmedName) {
    throw new Error(kind === 'folder' ? '请输入文件夹名。' : '请输入文件名。');
  }

  if (trimmedName === '.' || trimmedName === '..' || invalidFileNamePattern.test(trimmedName)) {
    throw new Error(`${kind === 'folder' ? '文件夹名' : '文件名'}不能包含路径分隔符或特殊字符。`);
  }

  if (kind === 'folder') {
    return trimmedName;
  }

  if (!trimmedName.includes('.')) {
    return `${trimmedName}.${extension}`;
  }

  if (trimmedName.toLowerCase().endsWith(`.${extension}`)) {
    return trimmedName;
  }

  throw new Error(`请选择 .${extension} 文件名。`);
}

export function useFileExplorer(): FileExplorerState {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [directoryStates, setDirectoryStates] = useState<Record<string, DirectoryState>>({});
  const [selectedPath, setSelectedPath] = useState<string>();
  const [isLoadingRoot, setIsLoadingRoot] = useState(true);
  const [rootError, setRootError] = useState<string>();
  const [chuqinRootPath, setChuqinRootPath] = useState('');
  const directoryStatesRef = useRef(directoryStates);

  useEffect(() => {
    directoryStatesRef.current = directoryStates;
  }, [directoryStates]);

  const loadDirectory = useCallback(async (path?: string) => {
    const entries = await invoke<TreeNode[]>('files_list', {path});
    return entries;
  }, []);

  const loadExpandedTree = useCallback(
    async (entries: TreeNode[], states: Record<string, DirectoryState>): Promise<TreeNode[]> => {
      return Promise.all(
        entries.map(async (node) => {
          if (!node.is_dir || !getDirectoryStateFromRecord(states, node.path).expanded) {
            return node;
          }

          try {
            const children = await loadDirectory(node.path);
            return {...node, children: await loadExpandedTree(children, states)};
          } catch {
            return node;
          }
        })
      );
    },
    [loadDirectory]
  );

  const refreshTree = useCallback(
    async (states: Record<string, DirectoryState>) => {
      const [rootPath, entries] = await Promise.all([invoke<string>('files_root'), loadDirectory()]);
      setChuqinRootPath(rootPath);
      setNodes(await loadExpandedTree(entries, states));
    },
    [loadDirectory, loadExpandedTree]
  );

  const refreshRoot = useCallback(async () => {
    setIsLoadingRoot(true);
    setRootError(undefined);

    try {
      await refreshTree(directoryStatesRef.current);
    } catch (error) {
      setRootError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoadingRoot(false);
    }
  }, [refreshTree]);

  useEffect(() => {
    let isActive = true;

    void refreshRoot().finally(() => {
      if (!isActive) {
        return;
      }
    });

    return () => {
      isActive = false;
    };
  }, [refreshRoot]);

  const getDirectoryState = useCallback(
    (path: string) => getDirectoryStateFromRecord(directoryStates, path),
    [directoryStates]
  );

  const selectNode = useCallback((node: TreeNode) => {
    setSelectedPath(node.path);
  }, []);

  const createFile = useCallback(
    async (folder: TreeNode, kind: CreatableFileKind, fileName: string) => {
      if (!folder.is_dir) {
        throw new Error('Can only create files inside a folder.');
      }

      const normalizedFileName = normalizeCreatableFileName(fileName, kind);
      const entries = await loadDirectory(folder.path);
      const existingNames = new Set(entries.map((entry) => entry.name.toLowerCase()));

      if (existingNames.has(normalizedFileName.toLowerCase())) {
        throw new Error(`文件已存在：${normalizedFileName}`);
      }

      const path = joinPath(folder.path, normalizedFileName);

      if (kind === 'folder') {
        await invoke<void>('files_create_directory', {path});
      } else if (kind === 'markdown' || kind === 'text') {
        await invoke<void>('files_write_text', {path, content: ''});
      } else {
        const command = kind === 'ppt' ? 'ppt_create' : kind === 'word' ? 'word_create' : 'excel_create';
        await invoke<string>(command, {
          title: getFileTitle(normalizedFileName),
          output: getAbsoluteFilePath(chuqinRootPath, path),
          overwrite: false,
          template: null,
        });
      }

      const nextDirectoryStates = {
        ...directoryStates,
        [folder.path]: {...getDirectoryStateFromRecord(directoryStates, folder.path), expanded: true},
      };

      setDirectoryStates(nextDirectoryStates);
      setSelectedPath(path);
      await refreshTree(nextDirectoryStates);

      return path;
    },
    [chuqinRootPath, directoryStates, loadDirectory, refreshTree]
  );

  const renameNode = useCallback(
    async (node: TreeNode, newName: string) => {
      const trimmedName = newName.trim();

      if (!trimmedName || trimmedName === node.name) {
        return node.path;
      }

      await invoke<void>('files_rename', {oldPath: node.path, newName: trimmedName});

      const newPath = getRenamedPath(node.path, trimmedName);
      const nextDirectoryStates = node.is_dir
        ? renameDirectoryStates(directoryStates, node.path, newPath)
        : directoryStates;

      setDirectoryStates(nextDirectoryStates);
      setSelectedPath((currentPath) =>
        currentPath ? replacePathPrefix(currentPath, node.path, newPath) : currentPath
      );
      await refreshTree(nextDirectoryStates);

      return newPath;
    },
    [directoryStates, refreshTree]
  );

  const deleteNode = useCallback(
    async (node: TreeNode) => {
      await invoke<void>('files_delete', {path: node.path});

      const nextDirectoryStates = Object.fromEntries(
        Object.entries(directoryStates).filter(([path]) => !isWithinPath(path, node.path))
      );

      setDirectoryStates(nextDirectoryStates);
      setSelectedPath((currentPath) => (currentPath && isWithinPath(currentPath, node.path) ? undefined : currentPath));
      await refreshTree(nextDirectoryStates);
    },
    [directoryStates, refreshTree]
  );

  const toggleDirectory = useCallback(
    async (node: TreeNode) => {
      if (!node.is_dir) {
        return;
      }

      const currentState = getDirectoryStateFromRecord(directoryStates, node.path);

      if (currentState.expanded) {
        setDirectoryStates((states) => ({
          ...states,
          [node.path]: {...getDirectoryStateFromRecord(states, node.path), expanded: false},
        }));
        return;
      }

      setDirectoryStates((states) => ({
        ...states,
        [node.path]: {
          ...getDirectoryStateFromRecord(states, node.path),
          expanded: true,
          loading: true,
          error: undefined,
        },
      }));

      try {
        const children = await loadDirectory(node.path);
        setNodes((currentNodes) => insertChildren(currentNodes, node.path, children));
        setDirectoryStates((states) => ({
          ...states,
          [node.path]: {...getDirectoryStateFromRecord(states, node.path), expanded: true, loading: false},
        }));
      } catch (error) {
        setDirectoryStates((states) => ({
          ...states,
          [node.path]: {
            ...getDirectoryStateFromRecord(states, node.path),
            expanded: true,
            loading: false,
            error: error instanceof Error ? error.message : String(error),
          },
        }));
      }
    },
    [directoryStates, loadDirectory]
  );

  return {
    chuqinRootPath,
    nodes,
    directoryStates,
    selectedPath,
    createFile,
    deleteNode,
    isLoadingRoot,
    rootError,
    getDirectoryState,
    refreshRoot,
    renameNode,
    selectNode,
    toggleDirectory,
  };
}
