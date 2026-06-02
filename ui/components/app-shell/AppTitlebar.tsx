import {getCurrentWindow} from '@tauri-apps/api/window';
import type {PointerEvent} from 'react';
import {WindowControls} from '../window-controls/WindowControls';
import {MainAreaTabs} from '../main-area/MainAreaTabs';
import type {MainAreaTab} from '../main-area/types';
import './AppTitlebar.css';

type AppTitlebarProps = {
  activeTabId: string;
  isLeftCollapsed: boolean;
  isRightCollapsed: boolean;
  isRightSidebarVisible: boolean;
  isWindows: boolean;
  onCloseTab: (tabId: string) => void;
  onSelectTab: (tabId: string) => void;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  tabs: MainAreaTab[];
};

export function AppTitlebar({
  activeTabId,
  isLeftCollapsed,
  isRightCollapsed,
  isRightSidebarVisible,
  isWindows,
  onCloseTab,
  onSelectTab,
  onToggleLeft,
  onToggleRight,
  tabs,
}: AppTitlebarProps) {
  function startWindowDrag(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [role="tab"]')) {
      return;
    }

    getCurrentWindow().startDragging().catch((error: unknown) => {
      console.error('Failed to start window drag', error);
    });
  }

  return (
    <header className="app-titlebar" data-tauri-drag-region onPointerDown={startWindowDrag}>
      <div className="titlebar-actions left" data-tauri-drag-region>
        <button
          aria-label={isLeftCollapsed ? 'Show file explorer' : 'Hide file explorer'}
          className="titlebar-toggle"
          data-collapsed={isLeftCollapsed}
          onClick={onToggleLeft}
          type="button"
        >
          <span className="sidebar-toggle-icon left" aria-hidden="true" />
        </button>
      </div>

      <MainAreaTabs activeTabId={activeTabId} onCloseTab={onCloseTab} onSelectTab={onSelectTab} tabs={tabs} />

      <div className="titlebar-actions right" data-tauri-drag-region>
        {isRightSidebarVisible ? (
          <button
            aria-label={isRightCollapsed ? 'Show tool panel' : 'Hide tool panel'}
            className="titlebar-toggle"
            data-collapsed={isRightCollapsed}
            onClick={onToggleRight}
            type="button"
          >
            <span className="sidebar-toggle-icon right" aria-hidden="true" />
          </button>
        ) : null}
        {isWindows ? <WindowControls /> : null}
      </div>
    </header>
  );
}
