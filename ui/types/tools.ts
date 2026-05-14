export type ToolId =
  | "gitlab-batch"
  | "pdf-to-ppt"
  | "ppt-create"
  | "word-create"
  | "outlook-archive"
  | "excalidraw"
  | "git-config"
  | "json-format"
  | "md5"
  | "url-codec"
  | "hex-codec"
  | "timestamp"
  | "huawei-token";

export type ToolFieldDefinition = {
  key: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
};

export type ToolToggleDefinition = {
  key: string;
  label: string;
  defaultChecked: boolean;
};

export type ToolDefinition = {
  id: ToolId;
  icon: string;
  name: string;
  family: string;
  summary: string;
  command: string;
  fields: ToolFieldDefinition[];
  toggles: ToolToggleDefinition[];
};
