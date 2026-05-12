import { describe, it, expect } from 'test-anywhere';
import {
  chatDemoCatalog,
  extendedChatProfiles,
  getComparisonMatrix,
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
  it('pins the own chat profile as the first entry', () => {
    expect(chatDemoCatalog[0].id).toBe(ownChatProfile.id);
  });

  it('sorts external chat profiles by computed score after the own entry', () => {
    const externalProfiles = chatDemoCatalog.slice(1);
    for (let i = 1; i < externalProfiles.length; i += 1) {
      expect(
        externalProfiles[i - 1].score.total >= externalProfiles[i].score.total
      ).toBe(true);
    }
  });

  it('extends to between 10 and 20 profiles', () => {
    expect(chatDemoCatalog.length >= 10).toBe(true);
    expect(chatDemoCatalog.length <= 20).toBe(true);
  });

  it('marks the own profile in listChatDemoSummaries', () => {
    const summaries = listChatDemoSummaries();
    expect(summaries[0].isOwn).toBe(true);
    const others = summaries.slice(1);
    expect(others.every((entry) => entry.isOwn === false)).toBe(true);
  });

  it('does not expose source-only demo statuses', () => {
    expect(
      chatDemoCatalog.every(
        (profile) => !profile.integration.status.includes('Source-only')
      )
    ).toBe(true);
  });
});

describe('comparison matrix', () => {
  it('exposes featureMatrix, limitations, and lockIns for every profile', () => {
    const matrix = getComparisonMatrix();
    expect(matrix.length).toBe(chatDemoCatalog.length);
    for (const row of matrix) {
      expect(typeof row.featureMatrix).toBe('object');
      expect(Array.isArray(row.limitations)).toBe(true);
      expect(Array.isArray(row.lockIns)).toBe(true);
      expect(typeof row.score.total).toBe('number');
    }
  });
});
