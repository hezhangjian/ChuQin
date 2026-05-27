import type {ComponentType} from 'react';
import {ToolId} from '../../types';
import {DigestTool} from './DigestTool';

type ToolDefinition = {
  id: ToolId;
  icon: string;
  label: string;
  Surface: ComponentType;
};

const toolDefinitions: Record<ToolId, ToolDefinition> = {
  [ToolId.Digest]: {
    id: ToolId.Digest,
    icon: '#',
    label: '摘要计算',
    Surface: DigestTool,
  },
};

export function getToolDefinition(toolId: ToolId) {
  return toolDefinitions[toolId];
}
