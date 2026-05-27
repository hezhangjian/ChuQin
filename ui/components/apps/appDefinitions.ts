import type {ComponentType} from 'react';
import {AppId} from '../../types';
import {CodeManagerApp} from './CodeManagerApp';

type AppDefinition = {
  id: AppId;
  icon: string;
  label: string;
  Surface: ComponentType;
};

const appDefinitions: Record<AppId, AppDefinition> = {
  [AppId.CodeManager]: {
    id: AppId.CodeManager,
    icon: '</>',
    label: 'Code Manager',
    Surface: CodeManagerApp,
  },
};

export function getAppDefinition(appId: AppId) {
  return appDefinitions[appId];
}
