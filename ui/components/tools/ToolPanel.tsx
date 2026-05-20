import type {KeyboardEvent, PointerEvent} from 'react';
import type {AppId, ToolId} from '../../types';

export function ToolPanel({
  activeAppId,
  activeToolId,
  onOpenApp,
  onOpenTool,
  onResizeKeyDown,
  onResizePointerDown,
  panelWidth,
}: {
  activeAppId: AppId | undefined;
  activeToolId: ToolId | undefined;
  onOpenApp: (appId: AppId) => void;
  onOpenTool: (toolId: ToolId) => void;
  onResizeKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onResizePointerDown: (event: PointerEvent<HTMLElement>) => void;
  panelWidth: number;
}) {
  return (
    <aside className="tool-panel" aria-label="Tool panel">
      <div className="tool-list">
        <h2>APPs</h2>
        <button
          className={`tool-entry${activeAppId === 'code-manager' ? ' active' : ''}`}
          onClick={() => onOpenApp('code-manager')}
          type="button"
        >
          <span className="tool-entry-icon" aria-hidden="true">
            &lt;/&gt;
          </span>
          <span>Code Manager</span>
        </button>
        <div className="tool-list-separator" role="separator" />
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
        aria-valuemin={168}
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
