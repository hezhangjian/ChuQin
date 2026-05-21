export type SidebarSection = 'apps' | 'chats' | 'files' | 'tools';
export type SidebarNavigationSection = Extract<SidebarSection, 'apps' | 'tools'>;

export type BuildConfig = {
  leftSidebar: {
    sections: SidebarSection[];
  };
  rightSidebar: {
    sections: SidebarNavigationSection[];
    visible: boolean;
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
};
