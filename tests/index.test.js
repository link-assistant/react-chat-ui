import { describe, it, expect } from 'test-anywhere';
import {
  chatDemoCatalog,
  createChatDemoStore,
  getRequirementCoverage,
  languageOptions,
  listChatDemoSummaries,
  themeOptions,
} from '../src/index.js';

describe('chat demo catalog', () => {
  it('lists researched React chat demos with default controls', () => {
    const summaries = listChatDemoSummaries();

    expect(summaries.length >= 6).toBe(true);
    expect(themeOptions.length >= 3).toBe(true);
    expect(languageOptions.length >= 3).toBe(true);
  });

  it('documents features, configuration, recommendations, and sources', () => {
    for (const demo of chatDemoCatalog) {
      expect(demo.packageName.length > 0).toBe(true);
      expect(demo.sourceUrls.length >= 2).toBe(true);
      expect(demo.maintenance.githubUrl.startsWith('https://github.com/')).toBe(
        true
      );
      expect(demo.maintenance.latestVersion.length > 0).toBe(true);
      expect(demo.maintenance.license.length > 0).toBe(true);
      expect(demo.maintenance.stars >= 0).toBe(true);
      expect(demo.integration.packageImport.includes(demo.packageName)).toBe(
        true
      );
      expect(demo.integration.sourceCode.includes('import')).toBe(true);
      expect(demo.integration.codeLineCount > 0).toBe(true);
      expect(demo.integration.codeSymbolCount > 0).toBe(true);
      expect(demo.featureHighlights.length >= 5).toBe(true);
      expect(demo.configurableSurfaces.length >= 4).toBe(true);
      expect(demo.designRecommendations.length >= 3).toBe(true);
      expect(demo.messages.length >= 3).toBe(true);
    }
  });

  it('maps issue requirements to implemented artifacts', () => {
    const coverage = getRequirementCoverage();
    const joined = coverage
      .map((item) => `${item.requirement} ${item.implementation}`)
      .join('\n');

    expect(joined.includes('theme')).toBe(true);
    expect(joined.includes('Unicode')).toBe(true);
    expect(joined.includes('browser')).toBe(true);
    expect(joined.includes('real imports')).toBe(true);
    expect(joined.includes('composer')).toBe(true);
  });
});

describe('chat demo store', () => {
  it('serves localized snapshots from the fixture data store', () => {
    const store = createChatDemoStore();
    const snapshot = store.getDemoSnapshot({
      demoId: 'assistant-copilot',
      languageId: 'ja',
      themeId: 'contrast',
    });

    expect(snapshot.id).toBe('assistant-copilot');
    expect(snapshot.maintenance.latestVersion).toBe('0.14.0');
    expect(snapshot.integration.codeLineCount > 0).toBe(true);
    expect(snapshot.language.id).toBe('ja');
    expect(snapshot.theme.id).toBe('contrast');
    expect(snapshot.messages.length).toBe(3);
    expect(snapshot.messages[0].text.includes('未読')).toBe(true);
  });

  it('preserves explicit reply targets but does not invent them', () => {
    const store = createChatDemoStore();
    const snapshot = store.getDemoSnapshot({
      demoId: 'link-assistant-own',
      languageId: 'en',
    });

    expect(snapshot.messages[0].replyToId).toBe(null);
    expect(snapshot.messages[1].replyToId).toBe('own-1');
    expect(snapshot.messages[2].replyToId).toBe(null);
  });

  it('stores every localized message in Doublets-compatible records', () => {
    const store = createChatDemoStore();
    const stats = store.getStorageStats();

    expect(stats.storedStrings).toBe(chatDemoCatalog.length * 3 * 3);
    expect(stats.storedCodePoints > stats.storedStrings).toBe(true);
    expect(stats.linkCount > stats.storedStrings).toBe(true);
  });
});
