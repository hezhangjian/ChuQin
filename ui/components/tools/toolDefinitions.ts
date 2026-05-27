import type {ComponentType} from 'react';
import {i18next} from '../../i18n';
import {ToolId} from '../../types';
import {DigestTool} from './DigestTool';
import {EmailBackupTool} from './EmailBackupTool';

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
    label: i18next.t('tools.digest.label'),
    Surface: DigestTool,
  },
  [ToolId.EmailBackup]: {
    id: ToolId.EmailBackup,
    icon: '@',
    label: i18next.t('tools.emailBackup.label'),
    Surface: EmailBackupTool,
  },
};

export function getToolDefinition(toolId: ToolId) {
  return toolDefinitions[toolId];
}
