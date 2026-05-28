import {useTranslation} from 'react-i18next';
import type {useFileActions} from './useFileActions';
import './FileActionDialogs.css';

type FileActions = ReturnType<typeof useFileActions>;

export function FileActionDialogs({fileActions}: {fileActions: FileActions}) {
  const {t} = useTranslation();

  return (
    <>
      {fileActions.createTarget ? (
        <div className="file-action-backdrop" role="presentation">
          <form
            aria-label="Create file"
            className="file-action-dialog"
            onSubmit={(event) => {
              event.preventDefault();
              void fileActions.createFile();
            }}
            role="dialog"
          >
            <h2>{t('fileActions.createFile')}</h2>
            <input
              autoFocus
              className="file-action-input"
              onChange={(event) => fileActions.setCreateValue(event.target.value)}
              onFocus={(event) => event.target.select()}
              value={fileActions.createValue}
            />
            {fileActions.error ? <p className="file-action-error">{fileActions.error}</p> : null}
            <div className="file-action-buttons">
              <button onClick={fileActions.cancelCreateFile} type="button">
                {t('common.cancel')}
              </button>
              <button className="primary" disabled={!fileActions.createValue.trim()} type="submit">
                {t('fileActions.createFile')}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {fileActions.renameTarget ? (
        <div className="file-action-backdrop" role="presentation">
          <form
            aria-label="Rename item"
            className="file-action-dialog"
            onSubmit={(event) => {
              event.preventDefault();
              void fileActions.renameNode();
            }}
            role="dialog"
          >
            <h2>{t('fileActions.rename')}</h2>
            <input
              autoFocus
              className="file-action-input"
              onChange={(event) => fileActions.setRenameValue(event.target.value)}
              value={fileActions.renameValue}
            />
            {fileActions.error ? <p className="file-action-error">{fileActions.error}</p> : null}
            <div className="file-action-buttons">
              <button onClick={fileActions.cancelRename} type="button">
                {t('common.cancel')}
              </button>
              <button className="primary" disabled={!fileActions.renameValue.trim()} type="submit">
                {t('fileActions.rename')}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {fileActions.deleteTarget ? (
        <div className="file-action-backdrop" role="presentation">
          <div aria-label="Delete item" className="file-action-dialog" role="dialog">
            <h2>{t('fileActions.delete')}</h2>
            <p>
              {fileActions.deleteTarget.is_dir ? t('fileActions.deleteFolder') : t('fileActions.deleteFile')}{' '}
              <strong>{fileActions.deleteTarget.name}</strong>?
            </p>
            {fileActions.error ? <p className="file-action-error">{fileActions.error}</p> : null}
            <div className="file-action-buttons">
              <button onClick={fileActions.cancelDelete} type="button">
                {t('common.cancel')}
              </button>
              <button className="danger" onClick={() => void fileActions.deleteNode()} type="button">
                {t('fileActions.delete')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
