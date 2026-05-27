import {getToolDefinition} from './toolDefinitions';
import type {ToolId} from '../../types';
import type {SidebarVariant} from '../sidebar/SidebarSections';
import './ToolSidebarSection.css';

export function ToolSidebarSection({
  activeToolId,
  onOpenTool,
  tools,
  variant,
}: {
  activeToolId: ToolId | undefined;
  onOpenTool: (toolId: ToolId) => void;
  tools: ToolId[];
  variant: SidebarVariant;
}) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <section className={`tool-sidebar-section tool-sidebar-section-${variant}`} aria-label="Tools">
      <h2 className={`tool-sidebar-section-title tool-sidebar-section-title-${variant}`}>Tools</h2>
      {tools.map((toolId) => {
        const tool = getToolDefinition(toolId);

        return (
          <button
            className={`tool-sidebar-entry tool-sidebar-entry-${variant}${activeToolId === tool.id ? ' active' : ''}`}
            key={tool.id}
            onClick={() => onOpenTool(tool.id)}
            type="button"
          >
            <span className={`tool-sidebar-entry-icon tool-sidebar-entry-icon-${variant}`} aria-hidden="true">
              <tool.icon />
            </span>
            <span>{tool.label}</span>
          </button>
        );
      })}
    </section>
  );
}
