import type {KeyboardEvent, PointerEvent} from 'react';
import type {ToolId} from '../../types/mainAreaTabs';

export function ToolPanel({
  activeToolId,
  onOpenTool,
  onResizeKeyDown,
  onResizePointerDown,
  panelWidth,
}: {
  activeToolId: ToolId | undefined;
  onOpenTool: (toolId: ToolId) => void;
  onResizeKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onResizePointerDown: (event: PointerEvent<HTMLElement>) => void;
  panelWidth: number;
}) {
  return (
    <aside className="tool-panel" aria-label="Tool panel">
      <div className="tool-list">
        <h2>Tools</h2>
        <button
          className={`tool-entry${activeToolId === 'digest' ? ' active' : ''}`}
          onClick={() => onOpenTool('digest')}
          type="button"
        >
          <span className="tool-entry-icon" aria-hidden="true">
            #
          </span>
          <span>摘要计算</span>
        </button>
      </div>
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
