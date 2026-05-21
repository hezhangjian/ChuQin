import type {SidebarNavigationSection} from '../../config/build';
import type {AppId, ToolId} from '../../types';

export function NavigationSections({
  activeAppId,
  activeToolId,
  onOpenApp,
  onOpenTool,
  sections,
  variant,
}: {
  activeAppId: AppId | undefined;
  activeToolId: ToolId | undefined;
  onOpenApp: (appId: AppId) => void;
  onOpenTool: (toolId: ToolId) => void;
  sections: SidebarNavigationSection[];
  variant: 'panel' | 'sidebar';
}) {
  return (
    <>
      {sections.includes('apps') ? (
        <section className={`${variant}-nav-section`} aria-label="APPs">
          <h2 className={`${variant}-nav-title`}>APPs</h2>
          <button
            className={`${variant}-nav-entry${activeAppId === 'code-manager' ? ' active' : ''}`}
            onClick={() => onOpenApp('code-manager')}
            type="button"
          >
            <span className={`${variant}-nav-entry-icon`} aria-hidden="true">
              &lt;/&gt;
            </span>
            <span>Code Manager</span>
          </button>
        </section>
      ) : null}
      {sections.includes('apps') && sections.includes('tools') ? (
        <div className={`${variant}-nav-separator`} role="separator" />
      ) : null}
      {sections.includes('tools') ? (
        <section className={`${variant}-nav-section`} aria-label="Tools">
          <h2 className={`${variant}-nav-title`}>Tools</h2>
          <button
            className={`${variant}-nav-entry${activeToolId === 'digest' ? ' active' : ''}`}
            onClick={() => onOpenTool('digest')}
            type="button"
          >
            <span className={`${variant}-nav-entry-icon`} aria-hidden="true">
              #
            </span>
            <span>摘要计算</span>
          </button>
        </section>
      ) : null}
    </>
  );
}
