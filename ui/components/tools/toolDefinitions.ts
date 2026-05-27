import type {ComponentType} from 'react';
import {Binary, Braces, Clock, Hash, Link, Mail} from 'lucide-react';
import {i18next} from '../../i18n';
import {ToolId} from '../../types';
import {DigestTool} from './DigestTool';
import {EmailBackupTool} from './EmailBackupTool';
import {HexEncodeDecodeTool} from './HexEncodeDecodeTool';
import {JsonFormatterTool} from './JsonFormatterTool';
import {TimestampConverterTool} from './TimestampConverterTool';
import {UrlEncodeDecodeTool} from './UrlEncodeDecodeTool';

type ToolDefinition = {
  id: ToolId;
  icon: ComponentType<{className?: string}>;
  label: string;
  Surface: ComponentType;
};

const toolDefinitions: Record<ToolId, ToolDefinition> = {
  [ToolId.Digest]: {
    id: ToolId.Digest,
    icon: Hash,
    label: i18next.t('tools.digest.label'),
    Surface: DigestTool,
  },
  [ToolId.EmailBackup]: {
    id: ToolId.EmailBackup,
    icon: Mail,
    label: i18next.t('tools.emailBackup.label'),
    Surface: EmailBackupTool,
  },
  [ToolId.HexEncodeDecode]: {
    id: ToolId.HexEncodeDecode,
    icon: Binary,
    label: i18next.t('tools.hexEncodeDecode.label'),
    Surface: HexEncodeDecodeTool,
  },
  [ToolId.JsonFormatter]: {
    id: ToolId.JsonFormatter,
    icon: Braces,
    label: i18next.t('tools.jsonFormatter.label'),
    Surface: JsonFormatterTool,
  },
  [ToolId.TimestampConverter]: {
    id: ToolId.TimestampConverter,
    icon: Clock,
    label: i18next.t('tools.timestampConverter.label'),
    Surface: TimestampConverterTool,
  },
  [ToolId.UrlEncodeDecode]: {
    id: ToolId.UrlEncodeDecode,
    icon: Link,
    label: i18next.t('tools.urlEncodeDecode.label'),
    Surface: UrlEncodeDecodeTool,
  },
};

export function getToolDefinition(toolId: ToolId) {
  return toolDefinitions[toolId];
}
