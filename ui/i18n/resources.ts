type LocaleResource<T> = {
  [Key in keyof T]: T[Key] extends string ? string : LocaleResource<T[Key]>;
};

export const zhCN = {
  common: {
    cancel: '取消',
    close: '关闭',
    save: '保存',
    saving: '保存中...',
  },
  settings: {
    actions: {
      closeSettings: '关闭设置',
      hideValue: '隐藏内容',
      showValue: '显示内容',
    },
    fields: {
      accessKey: 'Access Key',
      apiKey: 'API Key',
      baseUrl: 'Base URL',
      model: '模型',
      password: '密码',
      projectId: 'Project ID',
      provider: '服务商',
      region: 'Region',
      secretKey: 'Secret Key',
      token: 'Token',
      username: '用户名',
      videoReqKey: 'Video Req Key',
      visualHost: 'Visual Host',
    },
    labels: {
      aria: '设置',
      title: '设置',
    },
    placeholders: {
      llmBaseUrl: 'https://api.openai.com/v1',
      llmModel: 'gpt-4.1',
      llmProvider: 'openai',
    },
    sections: {
      gitcode: 'GitCode',
      gitee: 'Gitee',
      github: 'GitHub',
      huaweiCloud: '华为云',
      llm: 'LLM',
      volcengine: '火山引擎',
    },
  },
};

export const enUS = {
  common: {
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    saving: 'Saving...',
  },
  settings: {
    actions: {
      closeSettings: 'Close settings',
      hideValue: 'Hide value',
      showValue: 'Show value',
    },
    fields: {
      accessKey: 'Access Key',
      apiKey: 'API Key',
      baseUrl: 'Base URL',
      model: 'Model',
      password: 'Password',
      projectId: 'Project ID',
      provider: 'Provider',
      region: 'Region',
      secretKey: 'Secret Key',
      token: 'Token',
      username: 'Username',
      videoReqKey: 'Video Req Key',
      visualHost: 'Visual Host',
    },
    labels: {
      aria: 'Settings',
      title: 'Settings',
    },
    placeholders: {
      llmBaseUrl: 'https://api.openai.com/v1',
      llmModel: 'gpt-4.1',
      llmProvider: 'openai',
    },
    sections: {
      gitcode: 'GitCode',
      gitee: 'Gitee',
      github: 'GitHub',
      huaweiCloud: 'Huawei Cloud',
      llm: 'LLM',
      volcengine: 'Volcengine',
    },
  },
} satisfies LocaleResource<typeof zhCN>;

export const resources = {
  'en-US': {
    translation: enUS,
  },
  'zh-CN': {
    translation: zhCN,
  },
} as const;
