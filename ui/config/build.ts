import type {ToolId} from '../types';

export type SidebarSection = 'apps' | 'chats' | 'files' | 'tools';
export type SidebarNavigationSection = Extract<SidebarSection, 'apps' | 'tools'>;
export type SettingsSection = 'gitcode' | 'gitee' | 'github' | 'huaweiCloud' | 'llm' | 'volcengine';

export type BuildConfig = {
  leftSidebar: {
    sections: SidebarSection[];
  };
  rightSidebar: {
    sections: SidebarNavigationSection[];
    visible: boolean;
  };
  settings: {
    sections: SettingsSection[];
  };
  tools: ToolId[];
};

export const buildConfig: BuildConfig = {
  leftSidebar: {
    // prettier-ignore
    sections: [
      // Files
      'files',
      // Chats
      'chats',
    ],
  },
  rightSidebar: {
    // prettier-ignore
    sections: [
      // Apps
      'apps',
      // Tools
      'tools',
    ],
    visible: true,
  },
  settings: {
    // prettier-ignore
    sections: [
      // LLM
      'llm',

      // Cloud
      'huaweiCloud',
      'volcengine',

      // Code hosting
      'gitcode',
      'gitee',
      'github',
    ],
  },
  tools: [
    'digest',
  ],
};
