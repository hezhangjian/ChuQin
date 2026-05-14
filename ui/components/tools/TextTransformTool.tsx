import {useState} from 'react';

export type TextTransformToolAction = {
  label: string;
  run: (input: string) => string | Promise<string>;
};

type TextTransformToolProps = {
  actions: TextTransformToolAction[];
  inputLabel?: string;
  initialInput?: string;
  outputLabel?: string;
  placeholder: string;
  title: string;
};

export function TextTransformTool({
  actions,
  inputLabel = '输入',
  initialInput = '',
  outputLabel = '输出',
  placeholder,
  title,
}: TextTransformToolProps) {
  const [input, setInput] = useState(initialInput);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  async function runAction(action: TextTransformToolAction) {
    setIsRunning(true);
    setError('');

    try {
      setOutput(await action.run(input));
    } catch (error) {
      setOutput('');
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="tool-workspace compact">
      <header className="tool-workspace-header">
        <h1>{title}</h1>
        <div className="tool-actions">
          {actions.map((action) => (
            <button disabled={isRunning} key={action.label} onClick={() => void runAction(action)} type="button">
              {action.label}
            </button>
          ))}
        </div>
      </header>
      <div className="tool-io-grid">
        <label className="tool-field">
          <span>{inputLabel}</span>
          <textarea onChange={(event) => setInput(event.target.value)} placeholder={placeholder} value={input} />
        </label>
        <label className="tool-field">
          <span>{outputLabel}</span>
          <textarea readOnly value={error || output} />
        </label>
      </div>
    </div>
  );
}
