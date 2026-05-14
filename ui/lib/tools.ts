export type BuiltInToolId = 'excalidraw' | 'json-format' | 'md5' | 'url-codec' | 'hex-codec' | 'timestamp-codec';

export type BuiltInTool = {
  description: string;
  icon: string;
  id: BuiltInToolId;
  title: string;
};

export const builtInTools: BuiltInTool[] = [
  {
    description: '手绘风格绘图工具',
    icon: '✏️',
    id: 'excalidraw',
    title: 'Excalidraw',
  },
  {
    description: 'JSON美化与验证工具',
    icon: '📝',
    id: 'json-format',
    title: 'JSON格式化',
  },
  {
    description: 'MD5哈希计算工具',
    icon: '🔒',
    id: 'md5',
    title: 'MD5',
  },
  {
    description: 'URL编码/解码转换',
    icon: '🔗',
    id: 'url-codec',
    title: 'URL编解码',
  },
  {
    description: '进制转换工具',
    icon: '🔁',
    id: 'hex-codec',
    title: 'HEX转换',
  },
  {
    description: '时间戳与日期转换',
    icon: '⏰',
    id: 'timestamp-codec',
    title: '时间戳转换',
  },
];

export function getBuiltInTool(toolId: string) {
  return builtInTools.find((tool) => tool.id === toolId);
}
