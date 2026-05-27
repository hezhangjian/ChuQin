import {AppId, SettingsSection, SidebarSection, ToolId} from '../types';

export type BuildConfig = {
  leftSidebar: {
    sections: SidebarSection[];
  };
  rightSidebar: {
    sections: SidebarSection[];
    visible: boolean;
  };
  settings: {
    sections: SettingsSection[];
  };
  apps: AppId[];
  tools: ToolId[];
};

export const buildConfig: BuildConfig = {
  leftSidebar: {
    // prettier-ignore
    sections: [
      SidebarSection.Files,
      SidebarSection.Chats,
    ],
  },
  rightSidebar: {
    // prettier-ignore
    sections: [
      SidebarSection.Apps,
      SidebarSection.Tools,
    ],
    visible: true,
  },
  settings: {
    // prettier-ignore
    sections: [
      // LLM
      SettingsSection.Llm,

      // Cloud
      SettingsSection.HuaweiCloud,
      SettingsSection.Volcengine,

      // Code hosting
      SettingsSection.GitCode,
      SettingsSection.Gitee,
      SettingsSection.GitHub,
    ],
  },
  // prettier-ignore
  apps: [
    AppId.CodeManager,
  ],
  // prettier-ignore
  tools: [
    ToolId.Digest,
  ],
};
