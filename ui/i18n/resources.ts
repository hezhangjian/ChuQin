type LocaleResource<T> = {
  [Key in keyof T]: T[Key] extends string ? string : LocaleResource<T[Key]>;
};

export const zhCN = {
  common: {
    cancel: '取消',
    close: '关闭',
    copyPath: '复制路径',
    preparing: '准备中',
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
  tools: {
    digest: {
      description: '从粘贴或选中的文本计算本地摘要。',
      label: '摘要计算',
    },
    emailBackup: {
      actions: {
        backingUp: '正在备份',
        openBackup: '打开备份',
        start: '开始备份',
        stop: '停止',
      },
      description: '将默认邮件目录中的 PST 文件打包到本地备份。',
      detailsAria: 'Email 备份详情',
      empty: '点击开始后会在后台启动备份任务，并实时显示进度。',
      fields: {
        backupFile: '备份文件',
        defaultScanDirs: '默认扫描目录',
        outputLocation: '输出位置',
        pstFiles: 'PST 文件',
        sourceDir: '源目录',
      },
      hint: '生成的 ZIP 会按当前日期命名。',
      label: 'Email 备份',
      progress: {
        compressing: '压缩 PST 文件',
        finishing: '写入 ZIP 目录',
        scanning: '扫描 PST 文件',
      },
      status: {
        error: '失败',
        idle: '待执行',
        running: '备份中',
        success: '已完成',
      },
      subtitle: '扫描默认邮件目录中的 PST 文件，并压缩到 ChuQin Resources/Email。',
    },
  },
};

export const enUS = {
  common: {
    cancel: 'Cancel',
    close: 'Close',
    copyPath: 'Copy path',
    preparing: 'Preparing',
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
  tools: {
    digest: {
      description: 'Compute local text digests from pasted or selected content.',
      label: 'Digest',
    },
    emailBackup: {
      actions: {
        backingUp: 'Backing up',
        openBackup: 'Open backup',
        start: 'Start backup',
        stop: 'Stop',
      },
      description: 'Package PST files from the default email directory into a local backup.',
      detailsAria: 'Email backup details',
      empty: 'Start a background backup task to show live progress.',
      fields: {
        backupFile: 'Backup file',
        defaultScanDirs: 'Default scan directories',
        outputLocation: 'Output location',
        pstFiles: 'PST files',
        sourceDir: 'Source directory',
      },
      hint: 'The generated ZIP is named with the current date.',
      label: 'Email Backup',
      progress: {
        compressing: 'Compressing PST files',
        finishing: 'Writing ZIP directory',
        scanning: 'Scanning PST files',
      },
      status: {
        error: 'Failed',
        idle: 'Ready',
        running: 'Backing up',
        success: 'Completed',
      },
      subtitle: 'Scan the default email directory for PST files and compress them to ChuQin Resources/Email.',
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
