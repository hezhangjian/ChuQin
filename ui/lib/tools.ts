import type {ToolId} from '../types';

export type ToolMetadata = {
  id: ToolId;
  icon: string;
  label: string;
};

const toolMetadata: Record<ToolId, ToolMetadata> = {
  digest: {
    id: 'digest',
    icon: '#',
    label: '摘要计算',
  },
};

export function getToolMetadata(toolId: ToolId) {
  return toolMetadata[toolId];
}
