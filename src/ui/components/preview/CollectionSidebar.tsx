import { useState, useMemo } from 'react';
import type { CollectionInfo, FlattenedToken } from '../../types/ui';
import { buildTokenHierarchy, countTokensInNode, type TokenGroupNode } from '../../utils/tokenHelpers';

// Selection type for the preview tab
export type PreviewSelection =
  | { type: 'collection'; id: string; groupPath: string | null }
  | { type: 'textStyles' }
  | { type: 'effectStyles' };

interface CollectionSidebarProps {
  collections: CollectionInfo[];
  selectedCollectionId: string | null;
  selectedGroupPath: string | null;
  tokens: FlattenedToken[];
  textStyleCount: number;
  effectStyleCount: number;
  selection: PreviewSelection | null;
  onSelectCollection: (id: string) => void;
  onSelectGroup: (path: string | null) => void;
  onSelectStyles: (type: 'textStyles' | 'effectStyles') => void;
}

interface GroupNodeProps {
  node: TokenGroupNode;
  level: number;
  selectedPath: string | null;
  onSelect: (path: string | null) => void;
}

function GroupNode({ node, level, selectedPath, onSelect }: GroupNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = Object.keys(node.children).length > 0;
  const tokenCount = countTokensInNode(node);
  const isSelected = selectedPath === node.path;

  const handleClick = () => {
    onSelect(node.path);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="group-node">
      <div
        className={`group-item ${isSelected ? 'active' : ''}`}
        style={{ paddingLeft: `${12 + level * 12}px` }}
        onClick={handleClick}
      >
        {hasChildren && (
          <button
            className="group-toggle"
            onClick={handleToggle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>
              {'\u25B6'}
            </span>
          </button>
        )}
        <span className="group-name">{node.name}</span>
        <span className="group-count">{tokenCount}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="group-children">
          {Object.values(node.children).map((child) => (
            <GroupNode
              key={child.path}
              node={child}
              level={level + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CollectionSidebar({
  collections,
  selectedCollectionId,
  selectedGroupPath,
  tokens,
  textStyleCount,
  effectStyleCount,
  selection,
  onSelectCollection,
  onSelectGroup,
  onSelectStyles,
}: CollectionSidebarProps) {
  // Build token hierarchy for current collection
  const tokenHierarchy = useMemo(() => {
    return buildTokenHierarchy(tokens);
  }, [tokens]);

  const topLevelGroups = Object.values(tokenHierarchy.children);

  const isTextStylesSelected = selection?.type === 'textStyles';
  const isEffectStylesSelected = selection?.type === 'effectStyles';
  const hasStyles = textStyleCount > 0 || effectStyleCount > 0;

  return (
    <div className="collection-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Collections</span>
      </div>
      <div className="collection-list">
        {collections.length === 0 ? (
          <div className="empty-state" style={{ padding: '16px', fontSize: '12px' }}>
            No collections found
          </div>
        ) : (
          collections.map((c) => {
            const isActive = selectedCollectionId === c.id;
            return (
              <div key={c.id} className="collection-section">
                <div
                  className={`collection-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelectCollection(c.id);
                    onSelectGroup(null);
                  }}
                >
                  <span className="collection-item-name">{c.name}</span>
                  <span className="collection-item-count">{c.variableCount}</span>
                </div>

                {/* Show token groups when collection is selected */}
                {isActive && topLevelGroups.length > 0 && (
                  <div className="token-groups">
                    <div
                      className={`group-item all-tokens ${selectedGroupPath === null ? 'active' : ''}`}
                      onClick={() => onSelectGroup(null)}
                    >
                      <span className="group-name">All Tokens</span>
                      <span className="group-count">{tokens.length}</span>
                    </div>
                    {topLevelGroups.map((group) => (
                      <GroupNode
                        key={group.path}
                        node={group}
                        level={0}
                        selectedPath={selectedGroupPath}
                        onSelect={onSelectGroup}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Styles Section */}
      {hasStyles && (
        <>
          <div className="sidebar-header sidebar-header-divider">
            <span className="sidebar-title">Styles</span>
          </div>
          <div className="collection-list styles-list">
            {textStyleCount > 0 && (
              <div
                className={`collection-item ${isTextStylesSelected ? 'active' : ''}`}
                onClick={() => onSelectStyles('textStyles')}
              >
                <span className="collection-item-name">Text Styles</span>
                <span className="collection-item-count">{textStyleCount}</span>
              </div>
            )}
            {effectStyleCount > 0 && (
              <div
                className={`collection-item ${isEffectStylesSelected ? 'active' : ''}`}
                onClick={() => onSelectStyles('effectStyles')}
              >
                <span className="collection-item-name">Effect Styles</span>
                <span className="collection-item-count">{effectStyleCount}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
