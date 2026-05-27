import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import './UrlEncodeDecodeTool.css';

export function UrlEncodeDecodeTool() {
  const {t} = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  function processInput() {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
      setError(null);
    } catch (e) {
      setOutput('');
      setError(e instanceof Error ? e.message : 'Invalid input');
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

  function swapInputOutput() {
    setInput(output);
    setOutput(input);
    setError(null);
  }

  return (
    <div className="url-encode-decode-tool">
      <header className="tool-surface-header">
        <div>
          <h1>{t('tools.urlEncodeDecode.label')}</h1>
          <p>{t('tools.urlEncodeDecode.description')}</p>
        </div>
      </header>

      <div className="url-controls">
        <div className="url-controls-left">
          <div className="url-mode-toggle">
            <button className={mode === 'encode' ? 'active' : ''} onClick={() => setMode('encode')} type="button">
              {t('tools.urlEncodeDecode.encode')}
            </button>
            <button className={mode === 'decode' ? 'active' : ''} onClick={() => setMode('decode')} type="button">
              {t('tools.urlEncodeDecode.decode')}
            </button>
          </div>
        </div>
        <div className="url-controls-right">
          <button onClick={processInput} type="button">
            {mode === 'encode' ? t('tools.urlEncodeDecode.encode') : t('tools.urlEncodeDecode.decode')}
          </button>
          <button disabled={!output} onClick={swapInputOutput} type="button">
            {t('tools.urlEncodeDecode.swap')}
          </button>
          <button disabled={!output} onClick={copyOutput} type="button">
            {t('tools.urlEncodeDecode.copy')}
          </button>
          <button onClick={clearAll} type="button">
            {t('tools.urlEncodeDecode.clear')}
          </button>
        </div>
      </div>

      <section className="url-layout">
        <div className="url-input-panel">
          <label className="url-input-label" htmlFor="url-input">
            {t('tools.urlEncodeDecode.input')}
          </label>
          <textarea
            autoFocus
            className="url-input"
            id="url-input"
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              mode === 'encode' ? 'https://example.com/path?q=value' : 'https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dvalue'
            }
            spellCheck={false}
            value={input}
          />
        </div>

        <div className="url-output-panel">
          <label className="url-output-label" htmlFor="url-output">
            {t('tools.urlEncodeDecode.output')}
          </label>
          <textarea className="url-output" id="url-output" readOnly spellCheck={false} value={output} />
          {error && <div className="url-error">{error}</div>}
        </div>
      </section>
    </div>
  );
}
