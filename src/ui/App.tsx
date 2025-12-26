import { useState, useEffect } from 'react';
import Tabs from './components/Tabs';
import PreviewTab from './components/preview/PreviewTab';
import ExportTab from './components/export/ExportTab';
import type {
  TabId,
  CollectionInfo,
  TextStyleInfo,
  EffectStyleInfo,
  TokenFile,
  ExportOptions,
} from './types/ui';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('preview');

  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [collectionsLoaded, setCollectionsLoaded] = useState(false);
  const [stylesLoaded, setStylesLoaded] = useState(false);

  // Collections state
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<Record<string, string[]>>({});

  // Styles state
  const [textStyles, setTextStyles] = useState<TextStyleInfo[]>([]);
  const [effectStyles, setEffectStyles] = useState<EffectStyleInfo[]>([]);
  const [selectedTextStyles, setSelectedTextStyles] = useState<string[]>([]);
  const [selectedEffectStyles, setSelectedEffectStyles] = useState<string[]>([]);

  // Export options
  const [options, setOptions] = useState<ExportOptions>({
    includeDescriptions: true,
    colorFormat: 'hex',
    resolveReferences: false,
  });

  // Export results
  const [files, setFiles] = useState<TokenFile[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if initial loading is complete
  useEffect(() => {
    if (collectionsLoaded && stylesLoaded) {
      setIsInitialLoading(false);
    }
  }, [collectionsLoaded, stylesLoaded]);

  useEffect(() => {
    parent.postMessage({ pluginMessage: { type: 'GET_COLLECTIONS' } }, '*');
    parent.postMessage({ pluginMessage: { type: 'GET_STYLES' } }, '*');

    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      switch (msg.type) {
        case 'COLLECTIONS_DATA':
          setCollections(msg.payload);
          setSelectedCollections(msg.payload.map((c: CollectionInfo) => c.id));
          const allModes: Record<string, string[]> = {};
          msg.payload.forEach((c: CollectionInfo) => {
            allModes[c.id] = c.modes.map((m) => m.modeId);
          });
          setSelectedModes(allModes);
          setCollectionsLoaded(true);
          break;

        case 'STYLES_DATA':
          setTextStyles(msg.payload.textStyles);
          setEffectStyles(msg.payload.effectStyles);
          setSelectedTextStyles(msg.payload.textStyles.map((s: TextStyleInfo) => s.id));
          setSelectedEffectStyles(msg.payload.effectStyles.map((s: EffectStyleInfo) => s.id));
          setStylesLoaded(true);
          break;

        case 'EXPORT_RESULT':
          setFiles(msg.payload);
          setSelectedFileIndex(0);
          setIsLoading(false);
          setError('');
          break;

        case 'EXPORT_ERROR':
          setError(msg.payload);
          setIsLoading(false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Collection handlers
  const toggleCollection = (id: string) => {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleMode = (collectionId: string, modeId: string) => {
    setSelectedModes((prev) => {
      const current = prev[collectionId] || [];
      const updated = current.includes(modeId)
        ? current.filter((m) => m !== modeId)
        : [...current, modeId];
      return { ...prev, [collectionId]: updated };
    });
  };

  const selectAllCollections = () => {
    setSelectedCollections(collections.map((c) => c.id));
    const allModes: Record<string, string[]> = {};
    collections.forEach((c) => {
      allModes[c.id] = c.modes.map((m) => m.modeId);
    });
    setSelectedModes(allModes);
  };

  const deselectAllCollections = () => {
    setSelectedCollections([]);
    setSelectedModes({});
  };

  // Style handlers
  const toggleTextStyle = (id: string) => {
    setSelectedTextStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleEffectStyle = (id: string) => {
    setSelectedEffectStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectAllTextStyles = () => setSelectedTextStyles(textStyles.map((s) => s.id));
  const deselectAllTextStyles = () => setSelectedTextStyles([]);
  const selectAllEffectStyles = () => setSelectedEffectStyles(effectStyles.map((s) => s.id));
  const deselectAllEffectStyles = () => setSelectedEffectStyles([]);

  // Export handler
  const handleExport = () => {
    setIsLoading(true);
    setError('');
    setFiles([]);

    parent.postMessage(
      {
        pluginMessage: {
          type: 'EXPORT',
          payload: {
            collections: selectedCollections,
            modes: selectedModes,
            includeDescriptions: options.includeDescriptions,
            colorFormat: options.colorFormat,
            resolveReferences: options.resolveReferences,
            exportTextStyles: selectedTextStyles.length > 0,
            exportEffectStyles: selectedEffectStyles.length > 0,
            selectedTextStyles,
            selectedEffectStyles,
          },
        },
      },
      '*'
    );
  };

  // Computed values
  const totalVariables = collections
    .filter((c) => selectedCollections.includes(c.id))
    .reduce((sum, c) => sum + c.variableCount, 0);

  const totalTokens = totalVariables + selectedTextStyles.length + selectedEffectStyles.length;
  const hasSelection =
    selectedCollections.length > 0 ||
    selectedTextStyles.length > 0 ||
    selectedEffectStyles.length > 0;

  // Check if file has any exportable content
  const hasNoContent = collections.length === 0 && textStyles.length === 0 && effectStyles.length === 0;

  // Show loading state while fetching initial data
  if (isInitialLoading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>DTCG Token Exporter</h1>
          <p className="app-subtitle">Export Figma Variables to W3C DTCG format</p>
        </header>
        <div className="app-loading">
          <div className="loading-spinner" />
          <p>Loading variables and styles...</p>
        </div>
      </div>
    );
  }

  // Show empty state when file has no variables or styles
  if (hasNoContent) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>DTCG Token Exporter</h1>
          <p className="app-subtitle">Export Figma Variables to W3C DTCG format</p>
        </header>
        <div className="app-empty">
          <div className="app-empty-icon">{ }</div>
          <h2>No Variables or Styles Found</h2>
          <p>This file doesn't contain any Figma Variables or Styles to export.</p>
          <div className="app-empty-hint">
            <strong>To get started:</strong>
            <ul>
              <li>Create Variables in the Variables panel (right sidebar)</li>
              <li>Create Text Styles or Effect Styles in the Design panel</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>DTCG Token Exporter</h1>
        <p className="app-subtitle">Export Figma Variables to W3C DTCG format</p>
      </header>

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="tab-content">
        {activeTab === 'preview' ? (
          <PreviewTab collections={collections} />
        ) : (
          <ExportTab
            collections={collections}
            selectedCollections={selectedCollections}
            selectedModes={selectedModes}
            onToggleCollection={toggleCollection}
            onToggleMode={toggleMode}
            onSelectAllCollections={selectAllCollections}
            onDeselectAllCollections={deselectAllCollections}
            textStyles={textStyles}
            effectStyles={effectStyles}
            selectedTextStyles={selectedTextStyles}
            selectedEffectStyles={selectedEffectStyles}
            onToggleTextStyle={toggleTextStyle}
            onToggleEffectStyle={toggleEffectStyle}
            onSelectAllTextStyles={selectAllTextStyles}
            onDeselectAllTextStyles={deselectAllTextStyles}
            onSelectAllEffectStyles={selectAllEffectStyles}
            onDeselectAllEffectStyles={deselectAllEffectStyles}
            options={options}
            onOptionsChange={setOptions}
            onExport={handleExport}
            isLoading={isLoading}
            error={error}
            totalTokens={totalTokens}
            hasSelection={hasSelection}
            files={files}
            selectedFileIndex={selectedFileIndex}
            onSelectFile={setSelectedFileIndex}
          />
        )}
      </div>
    </div>
  );
}
