import type {KeyboardEvent, PointerEvent} from 'react';
import {NavigationSections} from '../navigation/NavigationSections';
import type {SidebarNavigationSection} from '../../config/build';
import type {AppId, ToolId} from '../../types';
import './ToolPanel.css';

export function ToolPanel({
  activeAppId,
  activeToolId,
  onOpenApp,
  onOpenTool,
  onResizeKeyDown,
  onResizePointerDown,
  panelWidth,
  sections,
}: {
  activeAppId: AppId | undefined;
  activeToolId: ToolId | undefined;
  onOpenApp: (appId: AppId) => void;
  onOpenTool: (toolId: ToolId) => void;
  onResizeKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onResizePointerDown: (event: PointerEvent<HTMLElement>) => void;
  panelWidth: number;
  sections: SidebarNavigationSection[];
}) {
  return (
    <aside className="tool-panel" aria-label="Tool panel">
      <div className="tool-list">
        <NavigationSections
          activeAppId={activeAppId}
          activeToolId={activeToolId}
          onOpenApp={onOpenApp}
          onOpenTool={onOpenTool}
          sections={sections}
          variant="panel"
        />
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
