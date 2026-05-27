import {WindowControls} from '../window-controls/WindowControls';
import './AppTitlebar.css';

type AppTitlebarProps = {
  isLeftCollapsed: boolean;
  isRightCollapsed: boolean;
  isRightSidebarVisible: boolean;
  isWindows: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
};

export function AppTitlebar({
  isLeftCollapsed,
  isRightCollapsed,
  isRightSidebarVisible,
  isWindows,
  onToggleLeft,
  onToggleRight,
}: AppTitlebarProps) {
  return (
    <header className="app-titlebar" data-tauri-drag-region>
      <div className="titlebar-actions left" data-tauri-drag-region>
        <button
          aria-label={isLeftCollapsed ? 'Show file explorer' : 'Hide file explorer'}
          className="titlebar-toggle"
          onClick={onToggleLeft}
          type="button"
        >
          <span className="sidebar-toggle-icon left" aria-hidden="true" />
        </button>
      </div>

      <div className="titlebar-actions right" data-tauri-drag-region>
        {isRightSidebarVisible ? (
          <button
            aria-label={isRightCollapsed ? 'Show tool panel' : 'Hide tool panel'}
            className="titlebar-toggle"
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
