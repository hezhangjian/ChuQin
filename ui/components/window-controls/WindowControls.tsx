import {getCurrentWindow} from '@tauri-apps/api/window';
import {useCallback, useEffect, useState} from 'react';
import './WindowControls.css';

const appWindow = getCurrentWindow();

export function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(false);

  const syncMaximizedState = useCallback(async () => {
    try {
      setIsMaximized(await appWindow.isMaximized());
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    void syncMaximizedState();

    let isDisposed = false;
    let unlistenResize: (() => void) | undefined;

    appWindow.onResized(syncMaximizedState).then((dispose) => {
      if (isDisposed) {
        dispose();
        return;
      }

      unlistenResize = dispose;
    });

    return () => {
      isDisposed = true;
      unlistenResize?.();
    };
  }, [syncMaximizedState]);

  async function minimizeWindow() {
    try {
      await appWindow.minimize();
    } catch (error) {
      console.error(error);
    }
  }

  async function toggleMaximizeWindow() {
    try {
      await appWindow.toggleMaximize();
      await syncMaximizedState();
    } catch (error) {
      console.error(error);
    }
  }

  async function closeWindow() {
    try {
      await appWindow.close();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="window-controls" role="group" aria-label="Window controls">
      <button aria-label="Minimize window" className="window-control" onClick={minimizeWindow} type="button">
        <span className="window-control-icon minimize" aria-hidden="true" />
      </button>
      <button
        aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
        className="window-control"
        onClick={toggleMaximizeWindow}
        type="button"
      >
        <span className={`window-control-icon ${isMaximized ? 'restore' : 'maximize'}`} aria-hidden="true" />
      </button>
      <button aria-label="Close window" className="window-control close" onClick={closeWindow} type="button">
        <span className="window-control-icon close" aria-hidden="true" />
      </button>
    </div>
  );
}
