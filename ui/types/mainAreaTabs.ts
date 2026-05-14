export type FileTabMode = 'edit';

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
  toolId: string;
  type: 'tool';
};

export type MainAreaTab = FileMainAreaTab | ToolMainAreaTab;
