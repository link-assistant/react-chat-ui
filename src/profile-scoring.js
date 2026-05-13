const WEIGHTS = {
  feature: 4,
  surface: 3,
  recencyMax: 24,
  starsMax: 18,
  liveBonus: 12,
};

const LIVE_TIER_POINTS = {
  A: 12,
  B: 8,
  C: 4,
  D: 0,
};

const LIVE_TIER_RENDERERS = {
  A: new Set([
    'own-chat',
    'chatscope',
    'react-chat-elements',
    'deep-chat',
    'minchat',
    'react-simple-chatbot',
    'react-chatbot-kit',
    'nlux',
    'vercel-ai',
    'assistant-ui',
    'rocket-chat-fuselage',
  ]),
  B: new Set(['offline-echo']),
  C: new Set([
    'stream-source',
    'sendbird-source',
    'cometchat-source',
    'talkjs-source',
    'livechat-source',
  ]),
};

function parseReleaseDate(value) {
  if (!value) {
    return 0;
  }
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

function recencyScore(lastReleaseAt, nowMs) {
  const released = parseReleaseDate(lastReleaseAt);
  if (released === 0) {
    return 0;
  }
  const ageMonths = Math.max(
    0,
    (nowMs - released) / (1000 * 60 * 60 * 24 * 30)
  );
  const decay = Math.max(0, 1 - ageMonths / 24);
  return Math.round(decay * WEIGHTS.recencyMax);
}

function starScore(stars) {
  if (!stars || stars <= 0) {
    return 0;
  }
  const normalized = Math.log10(stars + 1) / 5;
  const clamped = Math.min(1, Math.max(0, normalized));
  return Math.round(clamped * WEIGHTS.starsMax);
}

export function getLiveTier(rendererId) {
  if (!rendererId) {
    return 'D';
  }
  if (LIVE_TIER_RENDERERS.A.has(rendererId)) {
    return 'A';
  }
  if (LIVE_TIER_RENDERERS.B.has(rendererId)) {
    return 'B';
  }
  if (LIVE_TIER_RENDERERS.C.has(rendererId)) {
    return 'C';
  }
  return 'D';
}

export function scoreProfile(profile, nowMs = Date.now()) {
  const featureCount = Array.isArray(profile.featureHighlights)
    ? profile.featureHighlights.length
    : 0;
  const surfaceCount = Array.isArray(profile.configurableSurfaces)
    ? profile.configurableSurfaces.length
    : 0;
  const featurePoints = Math.min(28, featureCount * WEIGHTS.feature);
  const surfacePoints = Math.min(18, surfaceCount * WEIGHTS.surface);
  const recencyPoints = recencyScore(profile.maintenance?.lastReleaseAt, nowMs);
  const starsPoints = starScore(profile.maintenance?.stars ?? 0);
  const rendererId = profile.integration?.rendererId;
  const liveTier = getLiveTier(rendererId);
  const livePoints = LIVE_TIER_POINTS[liveTier];
  const total =
    featurePoints + surfacePoints + recencyPoints + starsPoints + livePoints;

  return {
    total,
    liveTier,
    breakdown: {
      featurePoints,
      surfacePoints,
      recencyPoints,
      starsPoints,
      livePoints,
    },
    weights: WEIGHTS,
  };
}

export function rankProfiles(profiles, nowMs = Date.now()) {
  return profiles
    .map((profile) => ({ profile, score: scoreProfile(profile, nowMs) }))
    .sort((a, b) => b.score.total - a.score.total);
}

export const profileScoringWeights = WEIGHTS;
export const profileLiveTierPoints = LIVE_TIER_POINTS;
