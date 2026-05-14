import {bytesToHex, hexToText} from '../../lib/tools/toolTransforms';
import {TextTransformTool} from './TextTransformTool';

export function HexCodecTool() {
  return (
    <TextTransformTool
      actions={[
        {
          label: '文本转HEX',
          run: bytesToHex,
        },
        {
          label: 'HEX转文本',
          run: hexToText,
        },
      ]}
      placeholder="ChuQin 或 43 68 75 51 69 6e"
      title="HEX转换"
    />
  );
}
