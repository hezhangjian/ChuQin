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
  nodes: TreeNode[];
  directoryStates: Record<string, DirectoryState>;
  selectedPath?: string;
  isLoadingRoot: boolean;
  rootError?: string;
  getDirectoryState: (path: string) => DirectoryState;
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

  const loadDirectory = useCallback(async (path?: string) => {
    const entries = await invoke<TreeNode[]>('files_list', {path});
    return entries;
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadRoot() {
      setIsLoadingRoot(true);
      setRootError(undefined);

      try {
        const entries = await loadDirectory();

        if (isActive) {
          setNodes(entries);
        }
      } catch (error) {
        if (isActive) {
          setRootError(error instanceof Error ? error.message : String(error));
        }
      } finally {
        if (isActive) {
          setIsLoadingRoot(false);
        }
      }
    }

    void loadRoot();

    return () => {
      isActive = false;
    };
  }, [loadDirectory]);

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
        [node.path]: {...getDirectoryStateFromRecord(states, node.path), expanded: true, error: undefined},
      }));

      if (node.children) {
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
    nodes,
    directoryStates,
    selectedPath,
    isLoadingRoot,
    rootError,
    getDirectoryState,
    selectNode,
    toggleDirectory,
  };
}
