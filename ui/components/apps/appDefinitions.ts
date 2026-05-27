import type {ComponentType} from 'react';
import {Code2} from 'lucide-react';
import {AppId} from '../../types';
import {CodeManagerApp} from './CodeManagerApp';

type AppDefinition = {
  id: AppId;
  icon: ComponentType<{className?: string}>;
  label: string;
  Surface: ComponentType;
};

const appDefinitions: Record<AppId, AppDefinition> = {
  [AppId.CodeManager]: {
    id: AppId.CodeManager,
    icon: Code2,
    label: 'Code Manager',
    Surface: CodeManagerApp,
  },
};

export function getAppDefinition(appId: AppId) {
  return appDefinitions[appId];
}
