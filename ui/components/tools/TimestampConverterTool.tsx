import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import './TimestampConverterTool.css';

type TimestampUnit = 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds';

export function TimestampConverterTool() {
  const {t} = useTranslation();
  const [inputTimestamp, setInputTimestamp] = useState('');
  const [inputUnit, setInputUnit] = useState<TimestampUnit>('seconds');
  const [currentTimestamp, setCurrentTimestamp] = useState('');
  const [parsedDate, setParsedDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inputTimestamp.trim()) {
      setParsedDate(null);
      setError(null);
      return;
    }

    try {
      const ts = Number(inputTimestamp);
      if (isNaN(ts)) {
        throw new Error(t('tools.timestampConverter.invalidTimestamp'));
      }

      let milliseconds: number;
      switch (inputUnit) {
        case 'seconds':
          milliseconds = ts * 1000;
          break;
        case 'milliseconds':
          milliseconds = ts;
          break;
        case 'microseconds':
          milliseconds = ts / 1000;
          break;
        case 'nanoseconds':
          milliseconds = ts / 1000000;
          break;
      }

      const date = new Date(milliseconds);
      if (isNaN(date.getTime())) {
        throw new Error(t('tools.timestampConverter.invalidDate'));
      }

      setParsedDate(formatDate(date));
      setError(null);
    } catch (e) {
      setParsedDate(null);
      setError(e instanceof Error ? e.message : 'Invalid timestamp');
    }
  }, [inputTimestamp, inputUnit, t]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTimestamp(formatCurrentTimestamp(now));
    }, 1000);

    setCurrentTimestamp(formatCurrentTimestamp(Date.now()));

    return () => clearInterval(interval);
  }, []);

  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} (${timezone})`;
  }

  function formatCurrentTimestamp(now: number): string {
    const seconds = Math.floor(now / 1000);
    return `${seconds}.${String(now % 1000).padStart(3, '0')}`;
  }

  function useCurrentTimestamp() {
    const now = Date.now();
    switch (inputUnit) {
      case 'seconds':
        setInputTimestamp(String(Math.floor(now / 1000)));
        break;
      case 'milliseconds':
        setInputTimestamp(String(now));
        break;
      case 'microseconds':
        setInputTimestamp(String(now * 1000));
        break;
      case 'nanoseconds':
        setInputTimestamp(String(now * 1000000));
        break;
    }
  }

  function copyTimestamp(value: string) {
    void navigator.clipboard.writeText(value);
  }

  return (
    <div className="timestamp-converter-tool">
      <header className="tool-surface-header">
        <div>
          <h1>{t('tools.timestampConverter.label')}</h1>
          <p>{t('tools.timestampConverter.description')}</p>
        </div>
      </header>

      <section className="timestamp-layout">
        <div className="timestamp-current-panel">
          <div className="timestamp-current-header">
            <h2>{t('tools.timestampConverter.current')}</h2>
            <button onClick={() => copyTimestamp(currentTimestamp.split('.')[0])} type="button">
              {t('tools.timestampConverter.copy')}
            </button>
          </div>
          <div className="timestamp-current-value">
            <code>{currentTimestamp}</code>
          </div>
          <div className="timestamp-current-date">{formatDate(new Date())}</div>
        </div>

        <div className="timestamp-input-panel">
          <div className="timestamp-input-header">
            <h2>{t('tools.timestampConverter.convert')}</h2>
            <button onClick={useCurrentTimestamp} type="button">
              {t('tools.timestampConverter.useNow')}
            </button>
          </div>

          <div className="timestamp-input-controls">
            <label className="timestamp-unit-label">
              <span>{t('tools.timestampConverter.unit')}</span>
              <select value={inputUnit} onChange={(e) => setInputUnit(e.target.value as TimestampUnit)}>
                <option value="seconds">{t('tools.timestampConverter.seconds')}</option>
                <option value="milliseconds">{t('tools.timestampConverter.milliseconds')}</option>
                <option value="microseconds">{t('tools.timestampConverter.microseconds')}</option>
                <option value="nanoseconds">{t('tools.timestampConverter.nanoseconds')}</option>
              </select>
            </label>
          </div>

          <input
            autoFocus
            className="timestamp-input"
            onChange={(event) => setInputTimestamp(event.target.value)}
            placeholder="1700000000"
            spellCheck={false}
            type="text"
            value={inputTimestamp}
          />

          {parsedDate && (
            <div className="timestamp-result">
              <div className="timestamp-result-label">{t('tools.timestampConverter.dateTime')}</div>
              <div className="timestamp-result-value">{parsedDate}</div>
            </div>
          )}

          {error && <div className="timestamp-error">{error}</div>}
        </div>
      </section>
    </div>
  );
}
