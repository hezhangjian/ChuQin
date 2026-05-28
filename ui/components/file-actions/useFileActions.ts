import {useState} from 'react';
import {i18next} from '../../i18n';
import type {CreatableFileKind, FileExplorerState, TreeNode} from '../../hooks/useFileExplorer';
import type {MainAreaTabsState} from '../../hooks/useMainAreaTabs';

export type CreateFileAction = {
  folder: TreeNode;
  kind: CreatableFileKind;
};

const creatableFileDefaultNames: Record<CreatableFileKind, () => string> = {
  excel: () => i18next.t('fileActions.defaultExcel'),
  folder: () => i18next.t('fileActions.defaultFolder'),
  markdown: () => i18next.t('fileActions.defaultMarkdown'),
  ppt: () => i18next.t('fileActions.defaultPpt'),
  text: () => i18next.t('fileActions.defaultText'),
  word: () => i18next.t('fileActions.defaultWord'),
};

export function useFileActions(fileExplorer: FileExplorerState, mainAreaTabs: MainAreaTabsState) {
  const [createTarget, setCreateTarget] = useState<CreateFileAction>();
  const [createValue, setCreateValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TreeNode>();
  const [error, setError] = useState<string>();
  const [renameTarget, setRenameTarget] = useState<TreeNode>();
  const [renameValue, setRenameValue] = useState('');

  function clearError() {
    setError(undefined);
  }

  function requestCreateFile(folder: TreeNode, kind: CreatableFileKind) {
    clearError();
    setCreateTarget({folder, kind});
    setCreateValue(creatableFileDefaultNames[kind]());
  }

  function cancelCreateFile() {
    setCreateTarget(undefined);
    setCreateValue('');
    clearError();
  }

  async function createFile() {
    if (!createTarget) {
      return;
    }

    try {
      const path = await fileExplorer.createFile(createTarget.folder, createTarget.kind, createValue);
      setCreateTarget(undefined);
      setCreateValue('');
      clearError();

      const createdName = path.split('/').pop() ?? createValue.trim();
      if (createTarget.kind === 'markdown' || createTarget.kind === 'text') {
        mainAreaTabs.openFile({
          is_dir: false,
          name: createdName,
          path,
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  }

  function requestRename(node: TreeNode) {
    clearError();
    setRenameTarget(node);
    setRenameValue(node.name);
  }

  function cancelRename() {
    setRenameTarget(undefined);
    clearError();
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
      clearError();
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  }

  function requestDelete(node: TreeNode) {
    clearError();
    setDeleteTarget(node);
  }

  function cancelDelete() {
    setDeleteTarget(undefined);
    clearError();
  }

  async function deleteNode() {
    if (!deleteTarget) {
      return;
    }

    try {
      await fileExplorer.deleteNode(deleteTarget);
      mainAreaTabs.closePath(deleteTarget.path);
      setDeleteTarget(undefined);
      clearError();
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  }

  return {
    cancelCreateFile,
    cancelDelete,
    cancelRename,
    createFile,
    createTarget,
    createValue,
    deleteNode,
    deleteTarget,
    error,
    renameNode,
    renameTarget,
    renameValue,
    requestCreateFile,
    requestDelete,
    requestRename,
    setCreateValue,
    setRenameValue,
  };
}
