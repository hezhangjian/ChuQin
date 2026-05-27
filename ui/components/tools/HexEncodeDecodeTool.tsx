import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import './HexEncodeDecodeTool.css';

export function HexEncodeDecodeTool() {
  const {t} = useTranslation();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [separator, setSeparator] = useState<'space' | 'none' | 'colon' | 'dash'>('space');
  const [caseType, setCaseType] = useState<'upper' | 'lower'>('upper');

  function textToHex(text: string): string {
    const hexArray = Array.from(text).map((char) => {
      const hex = char.charCodeAt(0).toString(16);
      return hex.padStart(2, '0');
    });

    let sep = '';
    switch (separator) {
      case 'space':
        sep = ' ';
        break;
      case 'colon':
        sep = ':';
        break;
      case 'dash':
        sep = '-';
        break;
      default:
        sep = '';
    }

    const result = hexArray.join(sep);
    return caseType === 'upper' ? result.toUpperCase() : result;
  }

  function hexToText(hex: string): string {
    const cleanHex = hex.replace(/[\s:\-]/g, '');
    if (cleanHex.length % 2 !== 0) {
      throw new Error('Invalid hex string: must have even length');
    }
    if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
      throw new Error('Invalid hex string: contains non-hex characters');
    }

    let result = '';
    for (let i = 0; i < cleanHex.length; i += 2) {
      const hexByte = cleanHex.slice(i, i + 2);
      const charCode = parseInt(hexByte, 16);
      result += String.fromCharCode(charCode);
    }
    return result;
  }

  function processInput() {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      if (mode === 'encode') {
        setOutput(textToHex(input));
      } else {
        setOutput(hexToText(input));
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
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setError(null);
  }

  return (
    <div className="hex-encode-decode-tool">
      <header className="tool-surface-header">
        <div>
          <h1>{t('tools.hexEncodeDecode.label')}</h1>
          <p>{t('tools.hexEncodeDecode.description')}</p>
        </div>
      </header>

      <div className="hex-controls">
        <div className="hex-controls-left">
          <div className="hex-mode-toggle">
            <button
              className={mode === 'encode' ? 'active' : ''}
              onClick={() => setMode('encode')}
              type="button"
            >
              {t('tools.hexEncodeDecode.encode')}
            </button>
            <button
              className={mode === 'decode' ? 'active' : ''}
              onClick={() => setMode('decode')}
              type="button"
            >
              {t('tools.hexEncodeDecode.decode')}
            </button>
          </div>
          {mode === 'encode' && (
            <>
              <label className="hex-select-label">
                <span>{t('tools.hexEncodeDecode.separator')}</span>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value as typeof separator)}
                >
                  <option value="space">Space</option>
                  <option value="none">None</option>
                  <option value="colon">Colon (:)</option>
                  <option value="dash">Dash (-)</option>
                </select>
              </label>
              <label className="hex-select-label">
                <span>{t('tools.hexEncodeDecode.case')}</span>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value as typeof caseType)}
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                </select>
              </label>
            </>
          )}
        </div>
        <div className="hex-controls-right">
          <button onClick={processInput} type="button">
            {mode === 'encode' ? t('tools.hexEncodeDecode.encode') : t('tools.hexEncodeDecode.decode')}
          </button>
          <button disabled={!output} onClick={swapInputOutput} type="button">
            {t('tools.hexEncodeDecode.swap')}
          </button>
          <button disabled={!output} onClick={copyOutput} type="button">
            {t('tools.hexEncodeDecode.copy')}
          </button>
          <button onClick={clearAll} type="button">
            {t('tools.hexEncodeDecode.clear')}
          </button>
        </div>
      </div>

      <section className="hex-layout">
        <div className="hex-input-panel">
          <label className="hex-input-label" htmlFor="hex-input">
            {t('tools.hexEncodeDecode.input')}
          </label>
          <textarea
            autoFocus
            className="hex-input"
            id="hex-input"
            onChange={(event) => setInput(event.target.value)}
            placeholder={mode === 'encode' ? 'Hello World' : '48 65 6C 6C 6F 20 57 6F 72 6C 64'}
            spellCheck={false}
            value={input}
          />
        </div>

        <div className="hex-output-panel">
          <label className="hex-output-label" htmlFor="hex-output">
            {t('tools.hexEncodeDecode.output')}
          </label>
          <textarea
            className="hex-output"
            id="hex-output"
            readOnly
            spellCheck={false}
            value={output}
          />
          {error && <div className="hex-error">{error}</div>}
        </div>
      </section>
    </div>
  );
}
