import { describe, it, expect } from 'test-anywhere';
import {
  chatDemoCatalog,
  extendedChatProfiles,
  getComparisonMatrix,
  getRendererCapability,
  listChatDemoSummaries,
  ownChatProfile,
  profileScoringWeights,
  rankProfiles,
  scoreProfile,
} from '../src/index.js';

describe('profile scoring', () => {
  it('returns a numeric total and breakdown for any profile', () => {
    const result = scoreProfile(ownChatProfile, Date.parse('2026-05-11'));
    expect(result.total > 0).toBe(true);
    expect(typeof result.breakdown.featurePoints).toBe('number');
    expect(typeof result.breakdown.surfacePoints).toBe('number');
    expect(typeof result.breakdown.recencyPoints).toBe('number');
    expect(typeof result.breakdown.starsPoints).toBe('number');
    expect(typeof result.breakdown.livePoints).toBe('number');
    expect(profileScoringWeights.feature > 0).toBe(true);
  });

  it('ranks profiles in non-increasing order of score', () => {
    const ranked = rankProfiles(extendedChatProfiles);
    for (let i = 1; i < ranked.length; i += 1) {
      expect(ranked[i - 1].score.total >= ranked[i].score.total).toBe(true);
    }
  });
});

describe('chat demo catalog', () => {
  it('sorts every chat profile by computed score', () => {
    for (let i = 1; i < chatDemoCatalog.length; i += 1) {
      expect(
        chatDemoCatalog[i - 1].score.total >= chatDemoCatalog[i].score.total
      ).toBe(true);
    }
  });

  it('does not force the own chat profile to the first entry', () => {
    const ownEntry = chatDemoCatalog.find(
      (profile) => profile.id === ownChatProfile.id
    );

    expect(chatDemoCatalog[0].id).not.toBe(ownChatProfile.id);
    expect(chatDemoCatalog[0].score.total > ownEntry.score.total).toBe(true);
  });

  it('extends to between 10 and 20 profiles', () => {
    expect(chatDemoCatalog.length >= 10).toBe(true);
    expect(chatDemoCatalog.length <= 20).toBe(true);
  });

  it('marks the own profile in listChatDemoSummaries', () => {
    const summaries = listChatDemoSummaries();
    const ownSummaries = summaries.filter((entry) => entry.isOwn);

    expect(ownSummaries.length).toBe(1);
    expect(summaries[0].isOwn).toBe(false);
  });

  it('does not describe unavailable demos as offline echo demos', () => {
    expect(
      chatDemoCatalog.every(
        (profile) =>
          !profile.integration.mode.toLowerCase().includes('offline') &&
          !profile.integration.status.toLowerCase().includes('offline echo')
      )
    ).toBe(true);
  });

  it('marks credential-gated hosted SDKs as non-interactive lowest tier', () => {
    const hostedProfiles = chatDemoCatalog.filter((profile) =>
      profile.integration.mode.includes('Credential-gated')
    );

    expect(hostedProfiles.length >= 5).toBe(true);

    for (const profile of hostedProfiles) {
      const capability = getRendererCapability(profile.integration.rendererId);
      expect(capability.interactive).toBe(false);
      expect(profile.score.liveTier).toBe('D');
      expect(profile.score.total <= 28).toBe(true);
    }
  });
});

describe('comparison matrix', () => {
  it('exposes featureMatrix, limitations, and lockIns for every profile', () => {
    const matrix = getComparisonMatrix();
    expect(matrix.length).toBe(chatDemoCatalog.length);
    expect(matrix[0].score.total >= matrix[1].score.total).toBe(true);
    expect(matrix[0].id).not.toBe(ownChatProfile.id);
    for (const row of matrix) {
      expect(typeof row.featureMatrix).toBe('object');
      expect(Array.isArray(row.limitations)).toBe(true);
      expect(Array.isArray(row.lockIns)).toBe(true);
      expect(typeof row.score.total).toBe('number');
      expect(typeof row.canCompose).toBe('boolean');
    }
  });
});
