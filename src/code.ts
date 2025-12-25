// ============================================
// Main Plugin Code
// Runs in Figma's sandbox with access to figma global API
// ============================================

import { extractAllCollections, extractTextStyles, extractEffectStyles } from './lib/extract';
import { convertToDTCG, buildVariableMap, convertTextStylesToDTCG, convertEffectStylesToDTCG } from './lib/convert';
import type { ExportConfig, TokenFile, TextStyleInfo, EffectStyleInfo } from './types/dtcg';

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

interface StylesData {
  textStyles: TextStyleInfo[];
  effectStyles: EffectStyleInfo[];
}

type MessageToUI =
  | { type: 'COLLECTIONS_DATA'; payload: CollectionInfo[] }
  | { type: 'STYLES_DATA'; payload: StylesData }
  | { type: 'EXPORT_RESULT'; payload: TokenFile[] }
  | { type: 'EXPORT_ERROR'; payload: string };

type MessageFromUI =
  | { type: 'GET_COLLECTIONS' }
  | { type: 'GET_STYLES' }
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

      case 'GET_STYLES': {
        const textStyles = await extractTextStyles();
        const effectStyles = await extractEffectStyles();
        const textStylesInfo: TextStyleInfo[] = textStyles.map(s => ({
          id: s.id,
          name: s.name,
          fontFamily: s.fontFamily.type === 'value' ? s.fontFamily.value : `{${s.fontFamily.variableName}}`,
          fontWeight: s.fontWeight.type === 'value' ? s.fontWeight.value : 400,
          fontSize: s.fontSize.type === 'value' ? s.fontSize.value : 16,
        }));

        const effectStylesInfo: EffectStyleInfo[] = effectStyles.map(s => ({
          id: s.id,
          name: s.name,
          effectCount: s.effects.length,
          effectTypes: [...new Set(s.effects.map(e => e.type))],
        }));

        figma.ui.postMessage({
          type: 'STYLES_DATA',
          payload: { textStyles: textStylesInfo, effectStyles: effectStylesInfo },
        } as MessageToUI);
        break;
      }

      case 'EXPORT': {
        const config = msg.payload;
        const result: TokenFile[] = [];

        // Export variables if any collections selected
        if (config.collections.length > 0) {
          const allCollections = await extractAllCollections();
          const selected = allCollections.filter((c) =>
            config.collections.includes(c.id)
          );

          if (selected.length > 0) {
            const variableMap = buildVariableMap(allCollections);
            const variableFiles = convertToDTCG(selected, config, variableMap);
            result.push(...variableFiles);
          }
        }

        // Text styles export
        if (config.exportTextStyles && config.selectedTextStyles.length > 0) {
          const allTextStyles = await extractTextStyles();
          const selectedTextStyles = allTextStyles.filter((s) =>
            config.selectedTextStyles.includes(s.id)
          );
          if (selectedTextStyles.length > 0) {
            const typographyTree = convertTextStylesToDTCG(selectedTextStyles, config);
            result.push({
              filename: 'typography.json',
              path: 'tokens/styles/typography.json',
              collectionName: 'Typography',
              modeName: 'Styles',
              content: typographyTree,
            });
          }
        }

        // Effect styles export
        if (config.exportEffectStyles && config.selectedEffectStyles.length > 0) {
          const allEffectStyles = await extractEffectStyles();
          const selectedEffectStyles = allEffectStyles.filter((s) =>
            config.selectedEffectStyles.includes(s.id)
          );
          if (selectedEffectStyles.length > 0) {
            const shadowTree = convertEffectStylesToDTCG(selectedEffectStyles, config);
            result.push({
              filename: 'shadows.json',
              path: 'tokens/styles/shadows.json',
              collectionName: 'Shadows',
              modeName: 'Styles',
              content: shadowTree,
            });
          }
        }

        if (result.length === 0) {
          figma.ui.postMessage({
            type: 'EXPORT_ERROR',
            payload: 'No collections or styles selected',
          } as MessageToUI);
          break;
        }

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
