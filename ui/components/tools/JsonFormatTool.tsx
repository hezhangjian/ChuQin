import {TextTransformTool} from './TextTransformTool';

export function JsonFormatTool() {
  return (
    <TextTransformTool
      actions={[
        {
          label: '格式化',
          run: (input) => JSON.stringify(JSON.parse(input), null, 2),
        },
        {
          label: '压缩',
          run: (input) => JSON.stringify(JSON.parse(input)),
        },
      ]}
      placeholder='{"name":"ChuQin"}'
      title="JSON格式化"
    />
  );
}
