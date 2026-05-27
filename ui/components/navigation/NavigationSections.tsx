import type {SidebarNavigationSection} from '../../config/build';
import {getToolMetadata} from '../../lib/tools';
import type {AppId, ToolId} from '../../types';

export function NavigationSections({
  activeAppId,
  activeToolId,
  onOpenApp,
  onOpenTool,
  sections,
  tools,
  variant,
}: {
  activeAppId: AppId | undefined;
  activeToolId: ToolId | undefined;
  onOpenApp: (appId: AppId) => void;
  onOpenTool: (toolId: ToolId) => void;
  sections: SidebarNavigationSection[];
  tools: ToolId[];
  variant: 'panel' | 'sidebar';
}) {
  const hasAppsSection = sections.includes('apps');
  const hasToolsSection = sections.includes('tools') && tools.length > 0;

  return (
    <>
      {hasAppsSection ? (
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
      {hasAppsSection && hasToolsSection ? <div className={`${variant}-nav-separator`} role="separator" /> : null}
      {hasToolsSection ? (
        <section className={`${variant}-nav-section`} aria-label="Tools">
          <h2 className={`${variant}-nav-title`}>Tools</h2>
          {tools.map((toolId) => {
            const tool = getToolMetadata(toolId);

            return (
              <button
                className={`${variant}-nav-entry${activeToolId === tool.id ? ' active' : ''}`}
                key={tool.id}
                onClick={() => onOpenTool(tool.id)}
                type="button"
              >
                <span className={`${variant}-nav-entry-icon`} aria-hidden="true">
                  {tool.icon}
                </span>
                <span>{tool.label}</span>
              </button>
            );
          })}
        </section>
      ) : null}
    </>
  );
}
