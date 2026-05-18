import {useEffect, useMemo, useState} from 'react';
import {calculateDigests, type DigestAlgorithm} from '../../lib/digests';

const digestAlgorithms: DigestAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

type DigestResult = {
  algorithm: DigestAlgorithm;
  value: string;
};

export function DigestTool() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<DigestResult[]>([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<Set<DigestAlgorithm>>(
    () => new Set(['MD5', 'SHA-1', 'SHA-256'])
  );
  const enabledAlgorithms = useMemo(
    () => digestAlgorithms.filter((algorithm) => selectedAlgorithms.has(algorithm)),
    [selectedAlgorithms]
  );

  useEffect(() => {
    let isDisposed = false;

    calculateDigests(input, enabledAlgorithms).then((nextResults) => {
      if (!isDisposed) {
        setResults(nextResults);
      }
    });

    return () => {
      isDisposed = true;
    };
  }, [enabledAlgorithms, input]);

  function toggleAlgorithm(algorithm: DigestAlgorithm) {
    setSelectedAlgorithms((currentAlgorithms) => {
      const nextAlgorithms = new Set(currentAlgorithms);

      if (nextAlgorithms.has(algorithm)) {
        nextAlgorithms.delete(algorithm);
      } else {
        nextAlgorithms.add(algorithm);
      }

      return nextAlgorithms;
    });
  }

  return (
    <div className="digest-tool">
      <header className="tool-workspace-header">
        <div>
          <h1>摘要计算</h1>
          <p>输入文本后自动计算 MD5 与 SHA 摘要。</p>
        </div>
      </header>

      <section className="digest-tool-layout">
        <div className="digest-input-panel">
          <label className="digest-input-label" htmlFor="digest-input">
            文本
          </label>
          <textarea
            autoFocus
            className="digest-input"
            id="digest-input"
            onChange={(event) => setInput(event.target.value)}
            placeholder="在这里输入要计算摘要的文本"
            spellCheck={false}
            value={input}
          />
        </div>

        <div className="digest-results-panel">
          <div className="digest-algorithms" aria-label="Digest algorithms">
            {digestAlgorithms.map((algorithm) => (
              <label className="digest-algorithm" key={algorithm}>
                <input
                  checked={selectedAlgorithms.has(algorithm)}
                  onChange={() => toggleAlgorithm(algorithm)}
                  type="checkbox"
                />
                <span>{algorithm}</span>
              </label>
            ))}
          </div>

          <div className="digest-results" aria-live="polite">
            {results.length > 0 ? (
              results.map((result) => (
                <div className="digest-result" key={result.algorithm}>
                  <div className="digest-result-header">
                    <strong>{result.algorithm}</strong>
                    <button
                      onClick={() => {
                        void navigator.clipboard.writeText(result.value);
                      }}
                      type="button"
                    >
                      复制
                    </button>
                  </div>
                  <code>{result.value}</code>
                </div>
              ))
            ) : (
              <p className="digest-empty">选择至少一种算法。</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
