import {md5} from '../../lib/tools/toolTransforms';
import {TextTransformTool} from './TextTransformTool';

export function Md5Tool() {
  return (
    <TextTransformTool
      actions={[
        {
          label: '计算',
          run: md5,
        },
      ]}
      placeholder="输入需要计算 MD5 的内容"
      title="MD5"
    />
  );
}
