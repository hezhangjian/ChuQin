import {TextTransformTool} from './TextTransformTool';

export function UrlCodecTool() {
  return (
    <TextTransformTool
      actions={[
        {
          label: '编码',
          run: encodeURIComponent,
        },
        {
          label: '解码',
          run: decodeURIComponent,
        },
      ]}
      placeholder="https://example.com/search?q=ChuQin 工具"
      title="URL编解码"
    />
  );
}
