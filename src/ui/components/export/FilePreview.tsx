import type { TokenFile } from '../../types/ui';

interface FilePreviewProps {
  files: TokenFile[];
  selectedIndex: number;
  onSelectFile: (index: number) => void;
  onDownloadFile: (file: TokenFile) => void;
  onDownloadAll: () => void;
  onCopy: (file: TokenFile) => void;
}

export default function FilePreview({
  files,
  selectedIndex,
  onSelectFile,
  onDownloadFile,
  onDownloadAll,
  onCopy,
}: FilePreviewProps) {
  const selectedFile = files[selectedIndex];

  return (
    <div className="export-results">
      <div className="results-header">
        <span className="results-title">Generated Files ({files.length})</span>
        <button className="btn btn-secondary" onClick={onDownloadAll}>
          Download ZIP
        </button>
      </div>

      <div className="file-tabs">
        {files.map((file, index) => (
          <button
            key={file.filename}
            className={`file-tab ${index === selectedIndex ? 'active' : ''}`}
            onClick={() => onSelectFile(index)}
          >
            {file.filename.replace('.json', '')}
          </button>
        ))}
      </div>

      {selectedFile && (
        <div className="preview-box scrollbar-dark">
          <div className="preview-box-header">
            <span className="preview-filename">{selectedFile.filename}</span>
            <div className="preview-actions">
              <button className="btn btn-ghost" onClick={() => onCopy(selectedFile)}>
                Copy
              </button>
              <button className="btn btn-ghost" onClick={() => onDownloadFile(selectedFile)}>
                Download
              </button>
            </div>
          </div>
          <pre className="preview-code">
            {JSON.stringify(selectedFile.content, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
