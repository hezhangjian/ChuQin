import {invoke} from '@tauri-apps/api/core';
import {listen} from '@tauri-apps/api/event';
import {openPath} from '@tauri-apps/plugin-opener';
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {appEvents} from '../../lib/events';
import './EmailBackupTool.css';

type OutlookBackupPstResult = {
  backup_path: string;
  file_count: number;
  source_dir: string;
};

type OutlookBackupPstStartResult = {
  task_id: string;
};

type OutlookBackupPstProgressEvent =
  | {
      source_dir: string;
      status: 'scanning';
      task_id: string;
    }
  | {
      backup_path: string;
      completed_files: number;
      current_file: string;
      current_file_bytes: number;
      current_file_total_bytes: number;
      source_dir: string;
      status: 'compressing';
      task_id: string;
      total_bytes: number;
      total_files: number;
      written_bytes: number;
    }
  | {
      backup_path: string;
      file_count: number;
      source_dir: string;
      status: 'finishing';
      task_id: string;
    }
  | {
      backup_path: string;
      file_count: number;
      source_dir: string;
      status: 'completed';
      task_id: string;
    }
  | {
      status: 'canceled';
      task_id: string;
    }
  | {
      error: string;
      status: 'failed';
      task_id: string;
    };

type BackupStatus = 'idle' | 'running' | 'success' | 'error';

type BackupProgressState = {
  backupPath?: string;
  completedFiles: number;
  currentFile?: string;
  currentFileBytes: number;
  currentFileTotalBytes: number;
  phase: string;
  sourceDir?: string;
  totalBytes: number;
  totalFiles: number;
  writtenBytes: number;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function createTaskId() {
  if (crypto.randomUUID) {
    return `outlook-backup-pst-${crypto.randomUUID()}`;
  }

  return `outlook-backup-pst-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function EmailBackupTool() {
  const {t} = useTranslation();
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<BackupProgressState | null>(null);
  const [result, setResult] = useState<OutlookBackupPstResult | null>(null);
  const [status, setStatus] = useState<BackupStatus>('idle');
  const taskIdRef = useRef<string | null>(null);

  const isRunning = status === 'running';
  const progressValue = progress && progress.totalBytes > 0 ? (progress.writtenBytes / progress.totalBytes) * 100 : 0;

  useEffect(() => {
    let isDisposed = false;
    let unlisten: (() => void) | undefined;

    listen<OutlookBackupPstProgressEvent>(appEvents.outlookBackupPstProgress, (event) => {
      if (event.payload.task_id !== taskIdRef.current) {
        return;
      }

      handleBackupEvent(event.payload);
    }).then((dispose) => {
      if (isDisposed) {
        dispose();
        return;
      }

      unlisten = dispose;
    });

    return () => {
      isDisposed = true;
      unlisten?.();

      if (taskIdRef.current) {
        void invoke('outlook_backup_pst_cancel', {taskId: taskIdRef.current});
        taskIdRef.current = null;
      }
    };
  }, []);

  function handleBackupEvent(event: OutlookBackupPstProgressEvent) {
    if (event.status === 'scanning') {
      setProgress({
        completedFiles: 0,
        currentFileBytes: 0,
        currentFileTotalBytes: 0,
        phase: t('tools.emailBackup.progress.scanning'),
        sourceDir: event.source_dir,
        totalBytes: 0,
        totalFiles: 0,
        writtenBytes: 0,
      });
      return;
    }

    if (event.status === 'compressing') {
      setProgress({
        backupPath: event.backup_path,
        completedFiles: event.completed_files,
        currentFile: event.current_file,
        currentFileBytes: event.current_file_bytes,
        currentFileTotalBytes: event.current_file_total_bytes,
        phase: t('tools.emailBackup.progress.compressing'),
        sourceDir: event.source_dir,
        totalBytes: event.total_bytes,
        totalFiles: event.total_files,
        writtenBytes: event.written_bytes,
      });
      return;
    }

    if (event.status === 'finishing') {
      setProgress((currentProgress) => ({
        backupPath: event.backup_path,
        completedFiles: event.file_count,
        currentFileBytes: currentProgress?.currentFileBytes ?? 0,
        currentFileTotalBytes: currentProgress?.currentFileTotalBytes ?? 0,
        phase: t('tools.emailBackup.progress.finishing'),
        sourceDir: event.source_dir,
        totalBytes: currentProgress?.totalBytes ?? 0,
        totalFiles: event.file_count,
        writtenBytes: currentProgress?.totalBytes ?? 0,
      }));
      return;
    }

    taskIdRef.current = null;

    if (event.status === 'completed') {
      setResult({
        backup_path: event.backup_path,
        file_count: event.file_count,
        source_dir: event.source_dir,
      });
      setStatus('success');
      return;
    }

    if (event.status === 'canceled') {
      setStatus('idle');
      setProgress(null);
      return;
    }

    setError(event.error);
    setStatus('error');
  }

  async function backupEmail() {
    setError('');
    setProgress(null);
    setResult(null);
    setStatus('running');

    try {
      const nextTaskId = createTaskId();
      taskIdRef.current = nextTaskId;
      const nextTask = await invoke<OutlookBackupPstStartResult>('outlook_backup_pst_start', {taskId: nextTaskId});
      taskIdRef.current = nextTask.task_id;
    } catch (nextError) {
      taskIdRef.current = null;
      setError(getErrorMessage(nextError));
      setStatus('error');
    }
  }

  async function cancelBackup() {
    const taskId = taskIdRef.current;

    if (!taskId) {
      return;
    }

    taskIdRef.current = null;
    await invoke('outlook_backup_pst_cancel', {taskId});
    setStatus('idle');
    setProgress(null);
  }

  async function copyBackupPath() {
    if (result) {
      await navigator.clipboard.writeText(result.backup_path);
    }
  }

  async function openBackupPath() {
    if (result) {
      await openPath(result.backup_path);
    }
  }

  return (
    <div className="email-backup-tool">
      <header className="tool-surface-header">
        <div>
          <h1>{t('tools.emailBackup.label')}</h1>
          <p>{t('tools.emailBackup.subtitle')}</p>
        </div>
        <span className={`email-backup-status ${status}`}>{t(`tools.emailBackup.status.${status}`)}</span>
      </header>

      <section className="email-backup-layout">
        <div className="email-backup-primary">
          <div className="email-backup-actions">
            <button
              className="email-backup-button"
              disabled={isRunning}
              onClick={() => void backupEmail()}
              type="button"
            >
              {isRunning ? t('tools.emailBackup.actions.backingUp') : t('tools.emailBackup.actions.start')}
            </button>
            {isRunning ? (
              <button className="email-backup-button secondary" onClick={() => void cancelBackup()} type="button">
                {t('tools.emailBackup.actions.stop')}
              </button>
            ) : null}
            <p className="email-backup-hint">{t('tools.emailBackup.hint')}</p>
          </div>

          {isRunning && progress ? (
            <div className="email-backup-progress" aria-live="polite">
              <div className="email-backup-progress-header">
                <strong>{progress.phase}</strong>
                <span className="email-backup-muted">
                  {progress.totalFiles > 0
                    ? `${progress.completedFiles}/${progress.totalFiles}`
                    : t('common.preparing')}
                </span>
              </div>
              <div
                className="email-backup-progress-bar"
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={progressValue}
                role="progressbar"
              >
                <span style={{width: `${Math.min(100, Math.max(0, progressValue))}%`}} />
              </div>
              {progress.currentFile ? <p className="email-backup-muted">{progress.currentFile}</p> : null}
            </div>
          ) : null}

          {status === 'error' ? (
            <p className="email-backup-error" role="alert">
              {error}
            </p>
          ) : null}

          {result ? (
            <div className="email-backup-result" aria-live="polite">
              <div className="email-backup-result-row">
                <span className="email-backup-result-label">{t('tools.emailBackup.fields.sourceDir')}</span>
                <code className="email-backup-result-value">{result.source_dir}</code>
              </div>
              <div className="email-backup-result-row">
                <span className="email-backup-result-label">{t('tools.emailBackup.fields.pstFiles')}</span>
                <span>{result.file_count}</span>
              </div>
              <div className="email-backup-result-row">
                <span className="email-backup-result-label">{t('tools.emailBackup.fields.backupFile')}</span>
                <code className="email-backup-result-value">{result.backup_path}</code>
              </div>
              <div className="email-backup-actions">
                <button className="email-backup-button secondary" onClick={() => void openBackupPath()} type="button">
                  {t('tools.emailBackup.actions.openBackup')}
                </button>
                <button className="email-backup-button secondary" onClick={() => void copyBackupPath()} type="button">
                  {t('common.copyPath')}
                </button>
              </div>
            </div>
          ) : (
            <div className="email-backup-empty">
              <p className="email-backup-muted">{t('tools.emailBackup.empty')}</p>
            </div>
          )}
        </div>

        <aside className="email-backup-summary" aria-label={t('tools.emailBackup.detailsAria')}>
          <p className="email-backup-muted">{t('tools.emailBackup.fields.defaultScanDirs')}</p>
          <code>macOS/Linux: ~/Email</code>
          <code>Windows: D:/Email</code>
          <p className="email-backup-muted">{t('tools.emailBackup.fields.outputLocation')}</p>
          <code>$CHUQIN_DIR/Resources/Email/email-YYYYMMDD.zip</code>
        </aside>
      </section>
    </div>
  );
}
