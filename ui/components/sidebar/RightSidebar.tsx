import type {KeyboardEvent, PointerEvent, ReactNode} from 'react';
import './RightSidebar.css';

export function RightSidebar({
  children,
  onResizeKeyDown,
  onResizePointerDown,
  panelWidth,
}: {
  children: ReactNode;
  onResizeKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onResizePointerDown: (event: PointerEvent<HTMLElement>) => void;
  panelWidth: number;
}) {
  return (
    <aside className="right-sidebar" aria-label="Right sidebar">
      <div className="right-sidebar-scroll">{children}</div>
      <div
        aria-label="Resize right sidebar"
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
