import type {CreatableFileKind} from '../../hooks/useFileExplorer';
import type {useFileActions} from './useFileActions';
import './FileActionDialogs.css';

type FileActions = ReturnType<typeof useFileActions>;

const creatableFileLabels: Record<CreatableFileKind, string> = {
  excel: 'Excel 表格',
  folder: '文件夹',
  markdown: 'Markdown',
  ppt: 'PPT',
  text: 'TXT',
  word: 'Word 文档',
};

export function FileActionDialogs({fileActions}: {fileActions: FileActions}) {
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
            <h2>新建{creatableFileLabels[fileActions.createTarget.kind]}</h2>
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
                取消
              </button>
              <button className="primary" disabled={!fileActions.createValue.trim()} type="submit">
                新建
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
            <h2>重命名</h2>
            <input
              autoFocus
              className="file-action-input"
              onChange={(event) => fileActions.setRenameValue(event.target.value)}
              value={fileActions.renameValue}
            />
            {fileActions.error ? <p className="file-action-error">{fileActions.error}</p> : null}
            <div className="file-action-buttons">
              <button onClick={fileActions.cancelRename} type="button">
                取消
              </button>
              <button className="primary" disabled={!fileActions.renameValue.trim()} type="submit">
                重命名
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {fileActions.deleteTarget ? (
        <div className="file-action-backdrop" role="presentation">
          <div aria-label="Delete item" className="file-action-dialog" role="dialog">
            <h2>删除</h2>
            <p>
              删除{fileActions.deleteTarget.is_dir ? '文件夹' : '文件'} <strong>{fileActions.deleteTarget.name}</strong>
              ?
            </p>
            {fileActions.error ? <p className="file-action-error">{fileActions.error}</p> : null}
            <div className="file-action-buttons">
              <button onClick={fileActions.cancelDelete} type="button">
                取消
              </button>
              <button className="danger" onClick={() => void fileActions.deleteNode()} type="button">
                删除
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
