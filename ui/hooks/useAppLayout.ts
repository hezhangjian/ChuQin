import {useCallback, useMemo, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent} from 'react';

const DEFAULT_PANEL_WIDTH = 280;
const MIN_PANEL_WIDTH = 180;
const MAX_PANEL_WIDTH = 520;
const MIN_MAIN_AREA_WIDTH = 420;

type PanelSide = 'left' | 'right';

export type AppLayoutState = {
  rootStyle: CSSProperties;
  isLeftCollapsed: boolean;
  isRightCollapsed: boolean;
  isResizingPanel: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
  startPanelResize: (side: PanelSide, event: ReactPointerEvent<HTMLElement>) => void;
  resizePanelWithKeyboard: (side: PanelSide, event: ReactKeyboardEvent<HTMLElement>) => void;
  toggleLeftCollapsed: () => void;
  toggleRightCollapsed: () => void;
};

function clampPanelWidth(width: number, otherPanelWidth: number): number {
  const availableWidth = window.innerWidth - otherPanelWidth - MIN_MAIN_AREA_WIDTH;
  const maxWidth = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, availableWidth));
  return Math.min(Math.max(width, MIN_PANEL_WIDTH), maxWidth);
}

export function useAppLayout(): AppLayoutState {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isResizingPanel, setIsResizingPanel] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [rightPanelWidth, setRightPanelWidth] = useState(DEFAULT_PANEL_WIDTH);

  const rootStyle = useMemo(
    () =>
      ({
        '--left-panel-width': isLeftCollapsed ? '0px' : `${leftPanelWidth}px`,
        '--right-panel-width': isRightCollapsed ? '0px' : `${rightPanelWidth}px`,
      }) as CSSProperties,
    [isLeftCollapsed, isRightCollapsed, leftPanelWidth, rightPanelWidth]
  );

  const setPanelWidth = useCallback(
    (side: PanelSide, width: number) => {
      if (side === 'left') {
        setLeftPanelWidth(clampPanelWidth(width, isRightCollapsed ? 0 : rightPanelWidth));
        return;
      }

      setRightPanelWidth(clampPanelWidth(width, isLeftCollapsed ? 0 : leftPanelWidth));
    },
    [isLeftCollapsed, isRightCollapsed, leftPanelWidth, rightPanelWidth]
  );

  const startPanelResize = useCallback(
    (side: PanelSide, event: ReactPointerEvent<HTMLElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsResizingPanel(true);

      const initialPointerX = event.clientX;
      const initialWidth = side === 'left' ? leftPanelWidth : rightPanelWidth;
      const otherPanelWidth =
        side === 'left' ? (isRightCollapsed ? 0 : rightPanelWidth) : isLeftCollapsed ? 0 : leftPanelWidth;

      function handlePointerMove(moveEvent: PointerEvent) {
        const deltaX = moveEvent.clientX - initialPointerX;
        const nextWidth = side === 'left' ? initialWidth + deltaX : initialWidth - deltaX;
        const clampedWidth = clampPanelWidth(nextWidth, otherPanelWidth);

        if (side === 'left') {
          setLeftPanelWidth(clampedWidth);
          return;
        }

        setRightPanelWidth(clampedWidth);
      }

      function handlePointerEnd() {
        setIsResizingPanel(false);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerEnd);
        window.removeEventListener('pointercancel', handlePointerEnd);
      }

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerEnd);
      window.addEventListener('pointercancel', handlePointerEnd);
    },
    [isLeftCollapsed, isRightCollapsed, leftPanelWidth, rightPanelWidth]
  );

  const resizePanelWithKeyboard = useCallback(
    (side: PanelSide, event: ReactKeyboardEvent<HTMLElement>) => {
      const step = event.shiftKey ? 40 : 10;
      const direction = side === 'left' ? 1 : -1;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setPanelWidth(side, (side === 'left' ? leftPanelWidth : rightPanelWidth) - step * direction);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setPanelWidth(side, (side === 'left' ? leftPanelWidth : rightPanelWidth) + step * direction);
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setPanelWidth(side, MIN_PANEL_WIDTH);
      }

      if (event.key === 'End') {
        event.preventDefault();
        setPanelWidth(side, MAX_PANEL_WIDTH);
      }
    },
    [leftPanelWidth, rightPanelWidth, setPanelWidth]
  );

  return {
    rootStyle,
    isLeftCollapsed,
    isRightCollapsed,
    isResizingPanel,
    leftPanelWidth,
    rightPanelWidth,
    startPanelResize,
    resizePanelWithKeyboard,
    toggleLeftCollapsed: () => setIsLeftCollapsed((value) => !value),
    toggleRightCollapsed: () => setIsRightCollapsed((value) => !value),
  };
}
