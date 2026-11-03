import type {ComponentType} from 'react';
import {Code2, ScanSearch} from 'lucide-react';
import {AppId} from '../../types';
import {ReviewTool} from '../tools/review/ReviewTool';
import {CodeManagerApp} from './CodeManagerApp';

type AppDefinition = {
  id: AppId;
  icon: ComponentType<{className?: string}>;
  label: string;
  Surface: ComponentType;
};

const appDefinitions: Record<AppId, AppDefinition> = {
  [AppId.Review]: {id: AppId.Review, icon: ScanSearch, label: '检视助手', Surface: ReviewTool},
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
