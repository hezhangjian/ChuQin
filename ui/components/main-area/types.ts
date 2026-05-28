import type {FileTabMode} from '../../lib/fileHandlers';
import type {AppId, ToolId} from '../../types';

export type FileMainAreaTab = {
  id: string;
  mode: FileTabMode;
  path: string;
  title: string;
  type: 'file';
};

export type ToolMainAreaTab = {
  id: string;
  title: string;
  toolId: ToolId;
  type: 'tool';
};

export type AppMainAreaTab = {
  appId: AppId;
  id: string;
  title: string;
  type: 'app';
};

export type MainAreaTab = AppMainAreaTab | FileMainAreaTab | ToolMainAreaTab;
