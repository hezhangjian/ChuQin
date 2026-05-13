import {useMemo, useState} from 'react';
import type {CSSProperties} from 'react';

export type AppLayoutState = {
  rootStyle: CSSProperties;
  isLeftCollapsed: boolean;
  isRightCollapsed: boolean;
  toggleLeftCollapsed: () => void;
  toggleRightCollapsed: () => void;
};

export function useAppLayout(): AppLayoutState {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  const rootStyle = useMemo(
    () =>
      ({
        '--left-panel-width': isLeftCollapsed ? '0px' : '280px',
        '--right-panel-width': isRightCollapsed ? '0px' : '280px',
      }) as CSSProperties,
    [isLeftCollapsed, isRightCollapsed]
  );

  return {
    rootStyle,
    isLeftCollapsed,
    isRightCollapsed,
    toggleLeftCollapsed: () => setIsLeftCollapsed((value) => !value),
    toggleRightCollapsed: () => setIsRightCollapsed((value) => !value),
  };
}
