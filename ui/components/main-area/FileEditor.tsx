import {invoke} from '@tauri-apps/api/core';
import {useCallback, useEffect, useRef, useState} from 'react';

type FileEditorProps = {
  path: string;
};

type SaveStatus = 'saved' | 'pending' | 'saving' | 'error';

const autoSaveDelayMs = 1000;

export function FileEditor({path}: FileEditorProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [saveError, setSaveError] = useState<string>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const latestContentRef = useRef('');
  const queuedContentRef = useRef<string | null>(null);
  const savedContentRef = useRef('');
  const savingRef = useRef(false);

  useEffect(() => {
    let isActive = true;

    async function loadFile() {
      setIsLoading(true);
      setLoadError(undefined);
      setSaveError(undefined);

      try {
        const fileContent = await invoke<string>('files_read_text', {path});

        if (isActive) {
          setContent(fileContent);
          latestContentRef.current = fileContent;
          savedContentRef.current = fileContent;
          queuedContentRef.current = null;
          savingRef.current = false;
          setSaveStatus('saved');
        }
      } catch (loadError) {
        if (isActive) {
          setLoadError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadFile();

    return () => {
      isActive = false;
    };
  }, [path]);

  useEffect(() => {
    latestContentRef.current = content;
  }, [content]);

  const flushSave = useCallback(
    async (initialContent: string) => {
      if (savingRef.current) {
        queuedContentRef.current = initialContent;
        setSaveStatus('pending');
        return;
      }

      savingRef.current = true;
      let nextContent: string | null = initialContent;

      while (nextContent !== null) {
        queuedContentRef.current = null;
        setSaveError(undefined);
        setSaveStatus('saving');

        try {
          await invoke('files_write_text', {content: nextContent, path});
          savedContentRef.current = nextContent;
        } catch (saveError) {
          setSaveError(saveError instanceof Error ? saveError.message : String(saveError));
          setSaveStatus('error');
          savingRef.current = false;
          return;
        }

        nextContent = queuedContentRef.current;

        if (nextContent === savedContentRef.current) {
          nextContent = null;
        }
      }

      savingRef.current = false;
      setSaveStatus(latestContentRef.current === savedContentRef.current ? 'saved' : 'pending');
    },
    [path]
  );

  useEffect(() => {
    if (isLoading || loadError) {
      return undefined;
    }

    if (content === savedContentRef.current) {
      if (!savingRef.current) {
        setSaveStatus('saved');
      }
      return undefined;
    }

    setSaveStatus('pending');
    const timeoutId = window.setTimeout(() => {
      void flushSave(content);
    }, autoSaveDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [content, flushSave, isLoading, loadError]);

  function getSaveStatusLabel() {
    if (saveStatus === 'saving') {
      return 'Saving...';
    }

    if (saveStatus === 'pending') {
      return 'Pending save';
    }

    if (saveStatus === 'error') {
      return 'Save failed';
    }

    return 'Saved';
  }

  if (isLoading) {
    return <div className="main-area-state">Loading...</div>;
  }

  if (loadError) {
    return (
      <div className="main-area-state error">
        <strong>Unable to open file</strong>
        <span>{loadError}</span>
      </div>
    );
  }

  return (
    <div className="file-editor">
      <textarea
        aria-label={path}
        className="file-editor-content"
        onChange={(event) => {
          setContent(event.target.value);
        }}
        spellCheck={false}
        value={content}
      />
      <div className="file-editor-actions">
        {saveError ? <span className="file-editor-error">{saveError}</span> : null}
        <span>{getSaveStatusLabel()}</span>
      </div>
    </div>
  );
}
