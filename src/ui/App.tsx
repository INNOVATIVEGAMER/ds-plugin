import { useState, useEffect } from 'react';
import JSZip from 'jszip';

interface CollectionInfo {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variableCount: number;
}

interface TextStyleInfo {
  id: string;
  name: string;
  fontFamily: string;
  fontWeight: string;  // Value or variable reference like "{weight/semibold}"
  fontSize: string;    // Value or variable reference like "{size/base}"
}

interface EffectStyleInfo {
  id: string;
  name: string;
  effectCount: number;
  effectTypes: string[];
}

interface TokenFile {
  filename: string;
  path: string;
  collectionName: string;
  modeName: string;
  content: Record<string, unknown>;
}

type ColorFormat = 'hex' | 'oklch';

export default function App() {
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<Record<string, string[]>>({});

  // Styles state
  const [textStyles, setTextStyles] = useState<TextStyleInfo[]>([]);
  const [effectStyles, setEffectStyles] = useState<EffectStyleInfo[]>([]);
  const [selectedTextStyles, setSelectedTextStyles] = useState<string[]>([]);
  const [selectedEffectStyles, setSelectedEffectStyles] = useState<string[]>([]);

  const [options, setOptions] = useState({
    includeDescriptions: true,
    colorFormat: 'hex' as ColorFormat,
    resolveReferences: false,
  });

  const [files, setFiles] = useState<TokenFile[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch both collections and styles on load
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
          break;

        case 'STYLES_DATA':
          setTextStyles(msg.payload.textStyles);
          setEffectStyles(msg.payload.effectStyles);
          // Select all styles by default
          setSelectedTextStyles(msg.payload.textStyles.map((s: TextStyleInfo) => s.id));
          setSelectedEffectStyles(msg.payload.effectStyles.map((s: EffectStyleInfo) => s.id));
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

  // Style toggle functions
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

  const selectAllTextStyles = () => {
    setSelectedTextStyles(textStyles.map((s) => s.id));
  };

  const deselectAllTextStyles = () => {
    setSelectedTextStyles([]);
  };

  const selectAllEffectStyles = () => {
    setSelectedEffectStyles(effectStyles.map((s) => s.id));
  };

  const deselectAllEffectStyles = () => {
    setSelectedEffectStyles([]);
  };

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
      // Use the full path for folder structure in ZIP
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

  const totalVariables = collections
    .filter((c) => selectedCollections.includes(c.id))
    .reduce((sum, c) => sum + c.variableCount, 0);

  const totalTokens = totalVariables + selectedTextStyles.length + selectedEffectStyles.length;
  const hasSelection = selectedCollections.length > 0 || selectedTextStyles.length > 0 || selectedEffectStyles.length > 0;

  return (
    <div className="app">
      <header className="header">
        <h1>DTCG Token Exporter</h1>
        <p className="subtitle">Export Figma Variables to W3C DTCG format</p>
      </header>

      <section className="section">
        <div className="section-header">
          <h2>Collections</h2>
          <div className="section-actions">
            <button className="link-btn" onClick={selectAllCollections}>
              Select all
            </button>
            <span className="divider">|</span>
            <button className="link-btn" onClick={deselectAllCollections}>
              Deselect all
            </button>
          </div>
        </div>

        {collections.length === 0 ? (
          <p className="empty">No variable collections found in this file.</p>
        ) : (
          <div className="collections-list">
            {collections.map((c) => (
              <div key={c.id} className="collection">
                <label className="collection-header">
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(c.id)}
                    onChange={() => toggleCollection(c.id)}
                  />
                  <span className="collection-name">{c.name}</span>
                  <span className="count">{c.variableCount} variables</span>
                </label>

                {selectedCollections.includes(c.id) && c.modes.length > 1 && (
                  <div className="modes">
                    {c.modes.map((mode) => (
                      <label key={mode.modeId} className="mode-label">
                        <input
                          type="checkbox"
                          checked={(selectedModes[c.id] || []).includes(mode.modeId)}
                          onChange={() => toggleMode(c.id, mode.modeId)}
                        />
                        {mode.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Text Styles Section */}
      <section className="section">
        <div className="section-header">
          <h2>Text Styles</h2>
          {textStyles.length > 0 && (
            <div className="section-actions">
              <button className="link-btn" onClick={selectAllTextStyles}>
                Select all
              </button>
              <span className="divider">|</span>
              <button className="link-btn" onClick={deselectAllTextStyles}>
                Deselect all
              </button>
            </div>
          )}
        </div>

        {textStyles.length === 0 ? (
          <p className="empty">No text styles found in this file.</p>
        ) : (
          <div className="styles-list">
            {textStyles.map((s) => (
              <label key={s.id} className="style-item">
                <input
                  type="checkbox"
                  checked={selectedTextStyles.includes(s.id)}
                  onChange={() => toggleTextStyle(s.id)}
                />
                <span className="style-name">{s.name}</span>
                <span className="style-meta">
                  {s.fontFamily} · {s.fontWeight} · {s.fontSize.startsWith('{') ? s.fontSize : `${s.fontSize}px`}
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Effect Styles Section */}
      <section className="section">
        <div className="section-header">
          <h2>Effect Styles</h2>
          {effectStyles.length > 0 && (
            <div className="section-actions">
              <button className="link-btn" onClick={selectAllEffectStyles}>
                Select all
              </button>
              <span className="divider">|</span>
              <button className="link-btn" onClick={deselectAllEffectStyles}>
                Deselect all
              </button>
            </div>
          )}
        </div>

        {effectStyles.length === 0 ? (
          <p className="empty">No effect styles found in this file.</p>
        ) : (
          <div className="styles-list">
            {effectStyles.map((s) => (
              <label key={s.id} className="style-item">
                <input
                  type="checkbox"
                  checked={selectedEffectStyles.includes(s.id)}
                  onChange={() => toggleEffectStyle(s.id)}
                />
                <span className="style-name">{s.name}</span>
                <span className="style-meta">
                  {s.effectCount} {s.effectCount === 1 ? 'effect' : 'effects'} · {s.effectTypes.join(', ')}
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Options</h2>
        <div className="options-grid">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.includeDescriptions}
              onChange={(e) => setOptions({ ...options, includeDescriptions: e.target.checked })}
            />
            Include descriptions
          </label>

          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.resolveReferences}
              onChange={(e) => setOptions({ ...options, resolveReferences: e.target.checked })}
            />
            Resolve references
          </label>

          <div className="option-row">
            <span>Color format:</span>
            <select
              value={options.colorFormat}
              onChange={(e) => setOptions({ ...options, colorFormat: e.target.value as ColorFormat })}
            >
              <option value="hex">Hex (#rrggbb)</option>
              <option value="oklch">OKLCH</option>
            </select>
          </div>
        </div>
      </section>

      <button
        className="primary-btn"
        onClick={handleExport}
        disabled={isLoading || !hasSelection}
      >
        {isLoading ? 'Generating...' : `Generate ${totalTokens} tokens`}
      </button>

      {error && <p className="error">{error}</p>}

      {files.length > 0 && (
        <section className="section results">
          <div className="section-header">
            <h2>Generated Files ({files.length})</h2>
            <button className="secondary-btn" onClick={downloadAllAsZip}>
              Download ZIP
            </button>
          </div>

          <div className="file-tabs">
            {files.map((file, index) => (
              <button
                key={file.filename}
                className={`file-tab ${index === selectedFileIndex ? 'active' : ''}`}
                onClick={() => setSelectedFileIndex(index)}
              >
                {file.filename.replace('.json', '')}
              </button>
            ))}
          </div>

          {files[selectedFileIndex] && (
            <div className="preview-container">
              <div className="preview-header">
                <span className="filename">{files[selectedFileIndex].filename}</span>
                <div className="preview-actions">
                  <button
                    className="icon-btn"
                    onClick={() => copyToClipboard(files[selectedFileIndex])}
                  >
                    Copy
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => downloadFile(files[selectedFileIndex])}
                  >
                    Download
                  </button>
                </div>
              </div>
              <pre className="preview">
                {JSON.stringify(files[selectedFileIndex].content, null, 2)}
              </pre>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
