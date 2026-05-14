import {useMemo} from 'react';
import {dateToTimestamp, timestampToDate} from '../../lib/tools/toolTransforms';
import {TextTransformTool} from './TextTransformTool';

export function TimestampTool() {
  const initialInput = useMemo(() => Math.floor(Date.now() / 1000).toString(), []);

  return (
    <TextTransformTool
      actions={[
        {
          label: '时间戳转日期',
          run: timestampToDate,
        },
        {
          label: '日期转时间戳',
          run: dateToTimestamp,
        },
        {
          label: '当前时间',
          run: () => dateToTimestamp(new Date().toISOString()),
        },
      ]}
      initialInput={initialInput}
      placeholder="1715688000 或 2026-05-14 08:00:00"
      title="时间戳转换"
    />
  );
}
