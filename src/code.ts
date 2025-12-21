// ============================================
// Main Plugin Code
// Runs in Figma's sandbox with access to figma global API
// ============================================

import { extractAllCollections } from './lib/extract';
import { convertToDTCG, buildVariableMap } from './lib/convert';
import type { ExportConfig, TokenFile } from './types/dtcg';

// Show the UI - sized for comfortable use on 13" MacBook screens
figma.showUI(__html__, { width: 560, height: 720 });

// ============================================
// Message Types
// ============================================

interface CollectionInfo {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variableCount: number;
}

type MessageToUI =
  | { type: 'COLLECTIONS_DATA'; payload: CollectionInfo[] }
  | { type: 'EXPORT_RESULT'; payload: TokenFile[] }
  | { type: 'EXPORT_ERROR'; payload: string };

type MessageFromUI =
  | { type: 'GET_COLLECTIONS' }
  | { type: 'EXPORT'; payload: ExportConfig }
  | { type: 'CLOSE' };

// ============================================
// Message Handler
// ============================================

figma.ui.onmessage = async (msg: MessageFromUI) => {
  try {
    switch (msg.type) {
      case 'GET_COLLECTIONS': {
        const collections = await extractAllCollections();
        const payload: CollectionInfo[] = collections.map((c) => ({
          id: c.id,
          name: c.name,
          modes: c.modes,
          variableCount: c.variables.length,
        }));
        figma.ui.postMessage({ type: 'COLLECTIONS_DATA', payload } as MessageToUI);
        break;
      }

      case 'EXPORT': {
        const config = msg.payload;
        const allCollections = await extractAllCollections();

        // Filter to selected collections
        const selected = allCollections.filter((c) =>
          config.collections.includes(c.id)
        );

        if (selected.length === 0) {
          figma.ui.postMessage({
            type: 'EXPORT_ERROR',
            payload: 'No collections selected',
          } as MessageToUI);
          break;
        }

        // Build variable map from ALL collections (for alias resolution across collections)
        const variableMap = buildVariableMap(allCollections);

        // Convert to DTCG format - returns array of TokenFile
        const result = convertToDTCG(selected, config, variableMap);

        figma.ui.postMessage({ type: 'EXPORT_RESULT', payload: result } as MessageToUI);
        break;
      }

      case 'CLOSE': {
        figma.closePlugin();
        break;
      }
    }
  } catch (error) {
    figma.ui.postMessage({
      type: 'EXPORT_ERROR',
      payload: error instanceof Error ? error.message : 'Unknown error',
    } as MessageToUI);
  }
};
