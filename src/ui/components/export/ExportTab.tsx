import JSZip from 'jszip';
import CollectionSelector from './CollectionSelector';
import StyleSelector from './StyleSelector';
import ExportOptions from './ExportOptions';
import FilePreview from './FilePreview';
import type {
  CollectionInfo,
  TextStyleInfo,
  EffectStyleInfo,
  TokenFile,
  ExportOptions as ExportOptionsType,
} from '../../types/ui';

interface ExportTabProps {
  // Collections
  collections: CollectionInfo[];
  selectedCollections: string[];
  selectedModes: Record<string, string[]>;
  onToggleCollection: (id: string) => void;
  onToggleMode: (collectionId: string, modeId: string) => void;
  onSelectAllCollections: () => void;
  onDeselectAllCollections: () => void;

  // Styles
  textStyles: TextStyleInfo[];
  effectStyles: EffectStyleInfo[];
  selectedTextStyles: string[];
  selectedEffectStyles: string[];
  onToggleTextStyle: (id: string) => void;
  onToggleEffectStyle: (id: string) => void;
  onSelectAllTextStyles: () => void;
  onDeselectAllTextStyles: () => void;
  onSelectAllEffectStyles: () => void;
  onDeselectAllEffectStyles: () => void;

  // Options
  options: ExportOptionsType;
  onOptionsChange: (options: ExportOptionsType) => void;

  // Export
  onExport: () => void;
  isLoading: boolean;
  error: string;
  totalTokens: number;
  hasSelection: boolean;

  // Results
  files: TokenFile[];
  selectedFileIndex: number;
  onSelectFile: (index: number) => void;
}

export default function ExportTab({
  collections,
  selectedCollections,
  selectedModes,
  onToggleCollection,
  onToggleMode,
  onSelectAllCollections,
  onDeselectAllCollections,
  textStyles,
  effectStyles,
  selectedTextStyles,
  selectedEffectStyles,
  onToggleTextStyle,
  onToggleEffectStyle,
  onSelectAllTextStyles,
  onDeselectAllTextStyles,
  onSelectAllEffectStyles,
  onDeselectAllEffectStyles,
  options,
  onOptionsChange,
  onExport,
  isLoading,
  error,
  totalTokens,
  hasSelection,
  files,
  selectedFileIndex,
  onSelectFile,
}: ExportTabProps) {
  const downloadFile = (file: TokenFile) => {
    const json = JSON.stringify(file.content, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    files.forEach((file) => {
      zip.file(file.path, JSON.stringify(file.content, null, 2));
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-tokens.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (file: TokenFile) => {
    await navigator.clipboard.writeText(JSON.stringify(file.content, null, 2));
  };

  const hasStyles = textStyles.length > 0 || effectStyles.length > 0;

  return (
    <div className="export-tab">
      {/* Sidebar with selections */}
      <div className="export-sidebar">
        <div className="export-sidebar-section">
          <CollectionSelector
            collections={collections}
            selectedCollections={selectedCollections}
            selectedModes={selectedModes}
            onToggleCollection={onToggleCollection}
            onToggleMode={onToggleMode}
            onSelectAll={onSelectAllCollections}
            onDeselectAll={onDeselectAllCollections}
          />
        </div>

        {hasStyles && (
          <div className="export-sidebar-section">
            <StyleSelector
              textStyles={textStyles}
              effectStyles={effectStyles}
              selectedTextStyles={selectedTextStyles}
              selectedEffectStyles={selectedEffectStyles}
              onToggleTextStyle={onToggleTextStyle}
              onToggleEffectStyle={onToggleEffectStyle}
              onSelectAllText={onSelectAllTextStyles}
              onDeselectAllText={onDeselectAllTextStyles}
              onSelectAllEffects={onSelectAllEffectStyles}
              onDeselectAllEffects={onDeselectAllEffectStyles}
            />
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="export-main">
        {/* Options toolbar + Generate button */}
        <div className="export-toolbar">
          <ExportOptions options={options} onChange={onOptionsChange} />
          <button
            className="btn btn-primary export-generate-btn"
            onClick={onExport}
            disabled={isLoading || !hasSelection}
          >
            {isLoading ? 'Generating...' : `Generate ${totalTokens} tokens`}
          </button>
        </div>

        {error && <div className="export-error">{error}</div>}

        {/* File preview area */}
        <div className="export-preview-area">
          {files.length > 0 ? (
            <FilePreview
              files={files}
              selectedIndex={selectedFileIndex}
              onSelectFile={onSelectFile}
              onDownloadFile={downloadFile}
              onDownloadAll={downloadAllAsZip}
              onCopy={copyToClipboard}
            />
          ) : (
            <div className="export-empty-preview">
              <div className="export-empty-icon">{ }</div>
              <div className="export-empty-text">
                {hasSelection
                  ? 'Click "Generate" to preview tokens'
                  : 'Select collections or styles to export'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
