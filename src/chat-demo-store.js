import {
  chatDemoCatalog,
  getChatDemoById,
  getLanguageOption,
  getLocalizedText,
  getThemeOption,
  listChatDemoSummaries,
} from './chat-demo-catalog.js';
import { createDoubletsUnicodeStore } from './doublets-unicode-store.js';
import { getRendererCapability } from './profile-scoring.js';

function createMessageKey(demoId, messageId, languageId) {
  return `${demoId}:${messageId}:${languageId}`;
}

function cloneList(values) {
  return values.map((value) =>
    typeof value === 'object' && value !== null ? { ...value } : value
  );
}

export function createChatDemoStore(options = {}) {
  const unicodeStore = options.unicodeStore ?? createDoubletsUnicodeStore();
  const textRecords = new Map();

  for (const demo of chatDemoCatalog) {
    for (const message of demo.messages) {
      for (const languageId of Object.keys(message.text)) {
        const value = getLocalizedText(message.text, languageId);
        const storageId = unicodeStore.storeString(value, {
          demoId: demo.id,
          messageId: message.id,
          languageId,
        });
        textRecords.set(
          createMessageKey(demo.id, message.id, languageId),
          storageId
        );
      }
    }
  }

  function getStoredMessage(demoId, message, languageId) {
    const fallbackLanguageId = message.text[languageId] ? languageId : 'en';
    const storageId = textRecords.get(
      createMessageKey(demoId, message.id, fallbackLanguageId)
    );
    const record = unicodeStore.getRecord(storageId);

    return {
      id: message.id,
      authorId: message.authorId,
      sentAt: message.sentAt,
      status: message.status,
      text: unicodeStore.readString(storageId),
      storageId,
      codePointCount: record.codePoints.length,
      replyToId: message.replyToId ?? null,
    };
  }

  function getDemoSnapshot(optionsForSnapshot = {}) {
    const demo = getChatDemoById(optionsForSnapshot.demoId);
    const language = getLanguageOption(optionsForSnapshot.languageId);
    const theme = getThemeOption(optionsForSnapshot.themeId);

    return {
      id: demo.id,
      name: demo.name,
      packageName: demo.packageName,
      marketPosition: demo.marketPosition,
      audience: demo.audience,
      maintenance: { ...demo.maintenance },
      integration: {
        ...demo.integration,
        capability: getRendererCapability(demo.integration?.rendererId),
      },
      accent: demo.accent,
      background: demo.background,
      avatar: demo.avatar,
      sourceUrls: cloneList(demo.sourceUrls),
      featureHighlights: cloneList(demo.featureHighlights),
      configurableSurfaces: cloneList(demo.configurableSurfaces),
      designRecommendations: cloneList(demo.designRecommendations),
      participants: demo.participants.map((participant) => ({
        ...participant,
      })),
      messages: demo.messages.map((message) =>
        getStoredMessage(demo.id, message, language.id)
      ),
      language,
      theme,
      storage: unicodeStore.getStats(),
    };
  }

  return {
    listDemos: listChatDemoSummaries,
    getDemoSnapshot,
    getStorageStats: unicodeStore.getStats,
    unicodeStore,
  };
}
