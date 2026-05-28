import {getAppDefinition} from './appDefinitions';
import type {AppId} from '../../types';
import './AppSidebarSection.css';

export function AppSidebarSection({
  activeAppId,
  apps,
  onOpenApp,
}: {
  activeAppId: AppId | undefined;
  apps: AppId[];
  onOpenApp: (appId: AppId) => void;
}) {
  if (apps.length === 0) {
    return null;
  }

  return (
    <section className="app-sidebar-section" aria-label="Apps">
      <h2 className="app-sidebar-section-title">Apps</h2>
      {apps.map((appId) => {
        const app = getAppDefinition(appId);

        return (
          <button
            className={`app-sidebar-entry${activeAppId === app.id ? ' active' : ''}`}
            key={app.id}
            onClick={() => onOpenApp(app.id)}
            type="button"
          >
            <span className="app-sidebar-entry-icon" aria-hidden="true">
              <app.icon />
            </span>
            <span>{app.label}</span>
          </button>
        );
      })}
    </section>
  );
}
