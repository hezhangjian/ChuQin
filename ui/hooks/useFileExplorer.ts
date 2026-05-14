import {invoke} from '@tauri-apps/api/core';
import {useCallback, useEffect, useState} from 'react';
import type {FileNode} from '../types';

export type TreeNode = FileNode & {
  children?: TreeNode[];
};

export type DirectoryState = {
  expanded: boolean;
  loading: boolean;
  error?: string;
};

export type FileExplorerState = {
  chuqinRootPath: string;
  nodes: TreeNode[];
  directoryStates: Record<string, DirectoryState>;
  selectedPath?: string;
  isLoadingRoot: boolean;
  rootError?: string;
  getDirectoryState: (path: string) => DirectoryState;
  refreshRoot: () => Promise<void>;
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

export function useFileExplorer(): FileExplorerState {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [directoryStates, setDirectoryStates] = useState<Record<string, DirectoryState>>({});
  const [selectedPath, setSelectedPath] = useState<string>();
  const [isLoadingRoot, setIsLoadingRoot] = useState(true);
  const [rootError, setRootError] = useState<string>();
  const [chuqinRootPath, setChuqinRootPath] = useState('');

  const loadDirectory = useCallback(async (path?: string) => {
    const entries = await invoke<TreeNode[]>('files_list', {path});
    return entries;
  }, []);

  const refreshRoot = useCallback(async () => {
    setIsLoadingRoot(true);
    setRootError(undefined);

    try {
      const [rootPath, entries] = await Promise.all([invoke<string>('files_root'), loadDirectory()]);
      setChuqinRootPath(rootPath);
      setNodes(entries);
    } catch (error) {
      setRootError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoadingRoot(false);
    }
  }, [loadDirectory]);

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
    isLoadingRoot,
    rootError,
    getDirectoryState,
    refreshRoot,
    selectNode,
    toggleDirectory,
  };
}
