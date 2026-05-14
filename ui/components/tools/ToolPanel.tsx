import type {KeyboardEvent, PointerEvent} from 'react';
import {builtInTools, type BuiltInToolId} from '../../lib/tools';

export function ToolPanel({
  activeToolId,
  onOpenTool,
  onResizeKeyDown,
  onResizePointerDown,
  panelWidth,
}: {
  activeToolId: string | undefined;
  onOpenTool: (toolId: BuiltInToolId) => void;
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
      <div className="tool-panel-content">
        <div className="tool-panel-header">
          <h2>Tools</h2>
        </div>
        <div className="tool-list" role="list">
          {builtInTools.map((tool) => (
            <button
              aria-current={tool.id === activeToolId ? 'page' : undefined}
              className={`tool-card${tool.id === activeToolId ? ' active' : ''}`}
              key={tool.id}
              onClick={() => onOpenTool(tool.id)}
              type="button"
            >
              <span className="tool-card-icon" aria-hidden="true">
                {tool.icon}
              </span>
              <span className="tool-card-copy">
                <strong>{tool.title}</strong>
                <span>{tool.description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
