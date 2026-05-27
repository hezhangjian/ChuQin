import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import './JsonFormatterTool.css';

export function JsonFormatterTool() {
  const {t} = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);

  function formatJson() {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError(null);
    } catch (e) {
      setOutput('');
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }

  function minifyJson() {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setOutput('');
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }

  function copyOutput() {
    void navigator.clipboard.writeText(output);
  }

  function clearAll() {
    setInput('');
    setOutput('');
    setError(null);
  }

  return (
    <div className="json-formatter-tool">
      <header className="tool-surface-header">
        <div>
          <h1>{t('tools.jsonFormatter.label')}</h1>
          <p>{t('tools.jsonFormatter.description')}</p>
        </div>
      </header>

      <div className="json-formatter-controls">
        <div className="json-formatter-controls-left">
          <label className="json-indent-label">
            <span>{t('tools.jsonFormatter.indent')}</span>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
              <option value={0}>Tab</option>
            </select>
          </label>
        </div>
        <div className="json-formatter-controls-right">
          <button onClick={formatJson} type="button">
            {t('tools.jsonFormatter.format')}
          </button>
          <button onClick={minifyJson} type="button">
            {t('tools.jsonFormatter.minify')}
          </button>
          <button disabled={!output} onClick={copyOutput} type="button">
            {t('tools.jsonFormatter.copy')}
          </button>
          <button onClick={clearAll} type="button">
            {t('tools.jsonFormatter.clear')}
          </button>
        </div>
      </div>

      <section className="json-formatter-layout">
        <div className="json-input-panel">
          <label className="json-input-label" htmlFor="json-input">
            {t('tools.jsonFormatter.input')}
          </label>
          <textarea
            autoFocus
            className="json-input"
            id="json-input"
            onChange={(event) => setInput(event.target.value)}
            placeholder='{"key": "value"}'
            spellCheck={false}
            value={input}
          />
        </div>

        <div className="json-output-panel">
          <label className="json-output-label" htmlFor="json-output">
            {t('tools.jsonFormatter.output')}
          </label>
          <textarea
            className="json-output"
            id="json-output"
            readOnly
            spellCheck={false}
            value={output}
          />
          {error && <div className="json-error">{error}</div>}
        </div>
      </section>
    </div>
  );
}
