import { useState, useEffect, useCallback, useMemo } from 'react';
import CollectionSidebar, { type PreviewSelection } from './CollectionSidebar';
import ModeSelector from './ModeSelector';
import TokenGrid from './TokenGrid';
import StylesGrid from './StylesGrid';
import type { CollectionInfo, PreviewData, StylesPreviewData } from '../../types/ui';
import { flattenTokenTree } from '../../utils/tokenHelpers';

interface PreviewTabProps {
  collections: CollectionInfo[];
}

export default function PreviewTab({ collections }: PreviewTabProps) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);
  const [selectedStylesModeId, setSelectedStylesModeId] = useState<string | null>(null);
  const [selectedGroupPath, setSelectedGroupPath] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [stylesData, setStylesData] = useState<StylesPreviewData | null>(null);
  const [selection, setSelection] = useState<PreviewSelection | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get current collection
  const currentCollection = collections.find((c) => c.id === selectedCollectionId);

  // Flatten all tokens from the preview data (pass collection name for type inference)
  const allTokens = useMemo(() => {
    if (!previewData?.tokenTree) return [];
    return flattenTokenTree(previewData.tokenTree, '', previewData.collectionName);
  }, [previewData]);

  // Filter tokens based on selected group
  const filteredTokens = useMemo(() => {
    if (!selectedGroupPath) return allTokens;
    return allTokens.filter((token) =>
      token.path.startsWith(selectedGroupPath + '.') || token.group === selectedGroupPath
    );
  }, [allTokens, selectedGroupPath]);

  // Fetch styles (on mount and when mode or view type changes)
  const fetchStyles = useCallback((modeId: string | null, viewType: 'text' | 'effect' | null) => {
    const payload: { modeId?: string; viewType?: 'text' | 'effect' } = {};
    if (modeId) payload.modeId = modeId;
    if (viewType) payload.viewType = viewType;

    parent.postMessage(
      {
        pluginMessage: {
          type: 'GET_STYLES_PREVIEW',
          payload: Object.keys(payload).length > 0 ? payload : undefined,
        },
      },
      '*'
    );
  }, []);

  // Determine the current styles view type
  const currentStylesViewType = selection?.type === 'textStyles'
    ? 'text'
    : selection?.type === 'effectStyles'
      ? 'effect'
      : null;

  useEffect(() => {
    fetchStyles(selectedStylesModeId, currentStylesViewType);
  }, [fetchStyles, selectedStylesModeId, currentStylesViewType]);

  // Set initial selection when collections load
  useEffect(() => {
    if (collections.length > 0 && !selectedCollectionId && !selection) {
      const firstCollection = collections[0];
      setSelectedCollectionId(firstCollection.id);
      setSelection({ type: 'collection', id: firstCollection.id, groupPath: null });
      if (firstCollection.modes.length > 0) {
        setSelectedModeId(firstCollection.modes[0].modeId);
      }
    }
  }, [collections, selectedCollectionId, selection]);

  // Handle collection selection
  const handleCollectionSelect = useCallback((id: string) => {
    setSelectedCollectionId(id);
    setSelectedGroupPath(null);
    setSelection({ type: 'collection', id, groupPath: null });
    const collection = collections.find((c) => c.id === id);
    if (collection && collection.modes.length > 0) {
      setSelectedModeId(collection.modes[0].modeId);
    }
    setPreviewData(null);
  }, [collections]);

  // Handle mode selection
  const handleModeSelect = useCallback((modeId: string) => {
    setSelectedModeId(modeId);
    setSelectedGroupPath(null);
    if (selectedCollectionId) {
      setSelection({ type: 'collection', id: selectedCollectionId, groupPath: null });
    }
    setPreviewData(null);
  }, [selectedCollectionId]);

  // Handle group selection
  const handleGroupSelect = useCallback((path: string | null) => {
    setSelectedGroupPath(path);
    if (selectedCollectionId) {
      setSelection({ type: 'collection', id: selectedCollectionId, groupPath: path });
    }
  }, [selectedCollectionId]);

  // Handle styles selection
  const handleStylesSelect = useCallback((type: 'textStyles' | 'effectStyles') => {
    setSelection({ type });
    setSelectedCollectionId(null);
    setSelectedGroupPath(null);
    setSelectedStylesModeId(null); // Reset mode when switching style types
  }, []);

  // Handle styles mode selection
  const handleStylesModeSelect = useCallback((modeId: string) => {
    setSelectedStylesModeId(modeId);
  }, []);

  // Fetch preview data when collection/mode changes
  useEffect(() => {
    if (!selectedCollectionId || !selectedModeId) return;
    if (selection?.type !== 'collection') return;

    setIsLoading(true);
    parent.postMessage(
      {
        pluginMessage: {
          type: 'GET_PREVIEW_DATA',
          payload: {
            collectionId: selectedCollectionId,
            modeId: selectedModeId,
          },
        },
      },
      '*'
    );
  }, [selectedCollectionId, selectedModeId, selection]);

  // Listen for preview data response
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      if (msg.type === 'PREVIEW_DATA') {
        setPreviewData(msg.payload);
        setIsLoading(false);
      }

      if (msg.type === 'STYLES_PREVIEW_DATA') {
        setStylesData(msg.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Get display title for grid header
  const getGridTitle = () => {
    if (selection?.type === 'textStyles') return 'Text Styles';
    if (selection?.type === 'effectStyles') return 'Effect Styles';
    if (selectedGroupPath) return selectedGroupPath.split('.').join(' / ');
    return currentCollection?.name || '';
  };

  const isStylesView = selection?.type === 'textStyles' || selection?.type === 'effectStyles';

  // Convert available modes to ModeSelector format
  const stylesModes = useMemo(() => {
    if (!stylesData?.availableModes) return [];
    return stylesData.availableModes.map((m) => ({
      modeId: m.modeId,
      name: `${m.collectionName} / ${m.name}`,
    }));
  }, [stylesData?.availableModes]);

  return (
    <div className="preview-tab">
      <CollectionSidebar
        collections={collections}
        selectedCollectionId={selectedCollectionId}
        selectedGroupPath={selectedGroupPath}
        tokens={allTokens}
        textStyleCount={stylesData?.textStyles.length ?? 0}
        effectStyleCount={stylesData?.effectStyles.length ?? 0}
        selection={selection}
        onSelectCollection={handleCollectionSelect}
        onSelectGroup={handleGroupSelect}
        onSelectStyles={handleStylesSelect}
      />

      <div className="token-grid-container">
        {isStylesView ? (
          <>
            <div className="token-grid-header">
              <span className="token-grid-title">{getGridTitle()}</span>
              {stylesModes.length > 0 && (
                <ModeSelector
                  modes={stylesModes}
                  selectedModeId={selectedStylesModeId}
                  onSelect={handleStylesModeSelect}
                />
              )}
            </div>
            <StylesGrid
              textStyles={selection?.type === 'textStyles' ? stylesData?.textStyles ?? [] : []}
              effectStyles={selection?.type === 'effectStyles' ? stylesData?.effectStyles ?? [] : []}
              viewType={selection?.type === 'textStyles' ? 'text' : 'effect'}
            />
          </>
        ) : currentCollection ? (
          <>
            <div className="token-grid-header">
              <span className="token-grid-title">{getGridTitle()}</span>
              <ModeSelector
                modes={currentCollection.modes}
                selectedModeId={selectedModeId}
                onSelect={handleModeSelect}
              />
            </div>
            <TokenGrid
              tokens={filteredTokens}
              isLoading={isLoading}
            />
          </>
        ) : (
          <div className="token-grid-scroll">
            <div className="token-grid-empty">
              <div className="token-grid-empty-text">
                Select a collection or style to preview
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
