import {getAppDefinition} from './appDefinitions';
import type {AppId} from '../../types';
import type {SidebarVariant} from '../sidebar/SidebarSections';
import './AppSidebarSection.css';

export function AppSidebarSection({
  activeAppId,
  apps,
  onOpenApp,
  variant,
}: {
  activeAppId: AppId | undefined;
  apps: AppId[];
  onOpenApp: (appId: AppId) => void;
  variant: SidebarVariant;
}) {
  if (apps.length === 0) {
    return null;
  }

  return (
    <section className={`app-sidebar-section app-sidebar-section-${variant}`} aria-label="APPs">
      <h2 className={`app-sidebar-section-title app-sidebar-section-title-${variant}`}>APPs</h2>
      {apps.map((appId) => {
        const app = getAppDefinition(appId);

        return (
          <button
            className={`app-sidebar-entry app-sidebar-entry-${variant}${activeAppId === app.id ? ' active' : ''}`}
            key={app.id}
            onClick={() => onOpenApp(app.id)}
            type="button"
          >
            <span className={`app-sidebar-entry-icon app-sidebar-entry-icon-${variant}`} aria-hidden="true">
              {app.icon}
            </span>
            <span>{app.label}</span>
          </button>
        );
      })}
    </section>
  );
}
