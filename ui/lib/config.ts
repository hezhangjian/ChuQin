export type AppConfig = {
  llm?: {
    provider?: string;
    model?: string;
    base_url?: string;
    api_key?: string;
  };
  aliyun?: {
    access_key_id?: string;
    access_key_secret?: string;
  };
  huaweicloud?: {
    project_id?: string;
    username?: string;
    password?: string;
  };
  volcengine?: {
    ak?: string;
    sk?: string;
    visual_host?: string;
    region?: string;
    video_req_key?: string;
  };
  gitcode?: {
    username?: string;
    token?: string;
  };
  gitee?: {
    username?: string;
    token?: string;
  };
  github?: {
    username?: string;
    token?: string;
  };
};

function escapeTomlString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

function stringifyTomlSection(name: string, values: Record<string, string | undefined>) {
  const lines = Object.entries(values)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key} = "${escapeTomlString(value ?? '')}"`);

  if (lines.length === 0) {
    return '';
  }

  return [`[${name}]`, ...lines].join('\n');
}

export function stringifyAppConfig(config: AppConfig) {
  return [
    stringifyTomlSection('llm', config.llm ?? {}),
    stringifyTomlSection('aliyun', config.aliyun ?? {}),
    stringifyTomlSection('huaweicloud', config.huaweicloud ?? {}),
    stringifyTomlSection('volcengine', config.volcengine ?? {}),
    stringifyTomlSection('gitcode', config.gitcode ?? {}),
    stringifyTomlSection('gitee', config.gitee ?? {}),
    stringifyTomlSection('github', config.github ?? {}),
  ]
    .filter(Boolean)
    .join('\n\n');
}
