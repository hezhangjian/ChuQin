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
      SidebarSection.Apps,
      SidebarSection.Tools,
    ],
  },
  rightSidebar: {
    // prettier-ignore
    sections: [
      SidebarSection.Apps,
      SidebarSection.Tools,
    ],
    visible: false,
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
    AppId.Review,
  ],
  // prettier-ignore
  tools: [
    ToolId.Digest,
    ToolId.EmailBackup,
    ToolId.HexEncodeDecode,
    ToolId.JsonFormatter,
    ToolId.TimestampConverter,
    ToolId.UrlEncodeDecode,
  ],
};
