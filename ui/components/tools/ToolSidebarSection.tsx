import {getToolDefinition} from './toolDefinitions';
import type {ToolId} from '../../types';
import './ToolSidebarSection.css';

export function ToolSidebarSection({
  activeToolId,
  onOpenTool,
  tools,
}: {
  activeToolId: ToolId | undefined;
  onOpenTool: (toolId: ToolId) => void;
  tools: ToolId[];
}) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <section className="tool-sidebar-section" aria-label="Tools">
      <h2 className="tool-sidebar-section-title">Tools</h2>
      {tools.map((toolId) => {
        const tool = getToolDefinition(toolId);

        return (
          <button
            className={`tool-sidebar-entry${activeToolId === tool.id ? ' active' : ''}`}
            key={tool.id}
            onClick={() => onOpenTool(tool.id)}
            type="button"
          >
            <span className="tool-sidebar-entry-icon" aria-hidden="true">
              <tool.icon />
            </span>
            <span>{tool.label}</span>
          </button>
        );
      })}
    </section>
  );
}
