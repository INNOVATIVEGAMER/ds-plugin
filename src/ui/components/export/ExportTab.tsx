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

  return (
    <div className="export-tab">
      <div className="export-content">
        <CollectionSelector
          collections={collections}
          selectedCollections={selectedCollections}
          selectedModes={selectedModes}
          onToggleCollection={onToggleCollection}
          onToggleMode={onToggleMode}
          onSelectAll={onSelectAllCollections}
          onDeselectAll={onDeselectAllCollections}
        />

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

        <ExportOptions options={options} onChange={onOptionsChange} />

        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="export-button-container">
        <button
          className="btn btn-primary btn-lg"
          onClick={onExport}
          disabled={isLoading || !hasSelection}
          style={{ width: '100%' }}
        >
          {isLoading ? 'Generating...' : `Generate ${totalTokens} tokens`}
        </button>
      </div>

      {files.length > 0 && (
        <FilePreview
          files={files}
          selectedIndex={selectedFileIndex}
          onSelectFile={onSelectFile}
          onDownloadFile={downloadFile}
          onDownloadAll={downloadAllAsZip}
          onCopy={copyToClipboard}
        />
      )}
    </div>
  );
}
