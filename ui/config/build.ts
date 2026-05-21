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
};

export const buildConfig: BuildConfig = {
  leftSidebar: {
    sections: ['files', 'chats'],
  },
  rightSidebar: {
    sections: ['apps', 'tools'],
    visible: true,
  },
  settings: {
    sections: ['gitcode', 'gitee', 'github', 'huaweiCloud', 'llm', 'volcengine'],
  },
};
