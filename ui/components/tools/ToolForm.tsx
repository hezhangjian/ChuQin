import type {ToolDefinition} from "../../types/tools";

type ToolFormProps = {
  ctaLabel: string;
  tool: ToolDefinition;
  onRun: () => void;
};

export function ToolForm({ctaLabel, tool, onRun}: ToolFormProps) {
  return (
    <>
      <div className="field-stack">
        {tool.fields.map((field) => (
          <label className="field" key={field.key}>
            <span>{field.label}</span>
            <input defaultValue={field.defaultValue} placeholder={field.placeholder}/>
          </label>
        ))}
      </div>

      <div className="toggle-stack">
        {tool.toggles.map((toggle) => (
          <label className="toggle" key={toggle.key}>
            <input defaultChecked={toggle.defaultChecked} type="checkbox"/>
            <span>{toggle.label}</span>
          </label>
        ))}
      </div>

      <pre className="command-preview">{tool.command}</pre>

      <button className="run-button" onClick={onRun} type="button">
        {ctaLabel}
      </button>
    </>
  );
}
