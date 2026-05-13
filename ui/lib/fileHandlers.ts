import type {FileNode} from '../types';
import type {FileTabMode} from '../types/mainAreaTabs';

export type FileOpenMode = FileTabMode | 'external';

export type FileHandler = {
  extensions: string[];
  id: string;
  mode: FileOpenMode;
  name: string;
};

export const fileHandlers: FileHandler[] = [
  {
    extensions: [
      'bash',
      'conf',
      'config',
      'css',
      'csv',
      'dockerignore',
      'env',
      'gitignore',
      'go',
      'graphql',
      'h',
      'hpp',
      'html',
      'ini',
      'java',
      'js',
      'json',
      'jsx',
      'kt',
      'less',
      'log',
      'markdown',
      'md',
      'py',
      'rb',
      'rs',
      'sass',
      'scss',
      'sh',
      'sql',
      'svelte',
      'toml',
      'ts',
      'tsx',
      'txt',
      'vue',
      'xml',
      'yaml',
      'yml',
      'zsh',
    ],
    id: 'text-editor',
    mode: 'edit',
    name: 'Text editor',
  },
];

export function getFileExtension(node: FileNode) {
  if (node.is_dir) {
    return '';
  }

  const extension = node.name.split('.').pop()?.toLowerCase();
  return extension === node.name.toLowerCase() ? '' : (extension ?? '');
}

export function getFileHandler(node: FileNode) {
  const extension = getFileExtension(node);

  if (!extension) {
    return null;
  }

  return fileHandlers.find((handler) => handler.extensions.includes(extension)) ?? null;
}

export function getFileOpenMode(node: FileNode): FileOpenMode {
  return getFileHandler(node)?.mode ?? 'external';
}

export function getAbsoluteFilePath(rootPath: string, relativePath: string) {
  const separator = rootPath.endsWith('/') || rootPath.endsWith('\\') ? '' : rootPath.includes('\\') ? '\\' : '/';
  return `${rootPath}${separator}${relativePath}`;
}
