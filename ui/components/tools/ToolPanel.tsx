import type {KeyboardEvent, PointerEvent} from 'react';

export function ToolPanel({
  onResizeKeyDown,
  onResizePointerDown,
  panelWidth,
}: {
  onResizeKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onResizePointerDown: (event: PointerEvent<HTMLElement>) => void;
  panelWidth: number;
}) {
  return (
    <aside className="tool-panel" aria-label="Tool panel">
      <div
        aria-label="Resize tool panel"
        aria-orientation="vertical"
        aria-valuemax={520}
        aria-valuemin={180}
        aria-valuenow={panelWidth}
        className="panel-resize-handle right"
        onKeyDown={onResizeKeyDown}
        onPointerDown={onResizePointerDown}
        role="separator"
        tabIndex={0}
      />
    </aside>
  );
}
