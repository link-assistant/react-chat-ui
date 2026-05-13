const WEIGHTS = {
  feature: 4,
  surface: 3,
  recencyMax: 24,
  starsMax: 18,
  liveBonus: 12,
};

const LIVE_TIER_POINTS = {
  A: 12,
  B: 4,
  C: 1,
  D: 0,
};

const DEFAULT_RENDERER_CAPABILITY = {
  tier: 'D',
  interactive: false,
  label: 'No verified local demo',
  reason: 'No renderer capability is recorded for this integration.',
  scoreCap: 28,
};

const RENDERER_CAPABILITIES = {
  'own-chat': {
    tier: 'A',
    interactive: true,
    label: 'Live local component',
    reason: 'Rendered by the local React component in this repository.',
    scoreCap: Number.POSITIVE_INFINITY,
  },
  chatscope: {
    tier: 'A',
    interactive: true,
    label: 'Live local package',
    reason: 'Rendered by an installed npm package in the gallery.',
    scoreCap: Number.POSITIVE_INFINITY,
  },
  'react-chat-elements': {
    tier: 'A',
    interactive: true,
    label: 'Live local package',
    reason: 'Rendered by an installed npm package in the gallery.',
    scoreCap: Number.POSITIVE_INFINITY,
  },
  'deep-chat': {
    tier: 'A',
    interactive: true,
    label: 'Live local package',
    reason: 'Rendered by an installed npm package in the gallery.',
    scoreCap: Number.POSITIVE_INFINITY,
  },
  minchat: {
    tier: 'B',
    interactive: false,
    label: 'Verified package source',
    reason:
      'The npm package exports React chat components, but it is not installed in this gallery build.',
    scoreCap: 52,
  },
  'react-simple-chatbot': {
    tier: 'B',
    interactive: false,
    label: 'Verified package source',
    reason:
      'The npm package exports a chat component, but it is not installed in this gallery build.',
    scoreCap: 52,
  },
  'react-chatbot-kit': {
    tier: 'B',
    interactive: false,
    label: 'Verified package source',
    reason:
      'The npm package exports a chat component, but it is not installed in this gallery build.',
    scoreCap: 52,
  },
  nlux: {
    tier: 'B',
    interactive: false,
    label: 'Verified package source',
    reason:
      'The npm package exports React AI chat components, but it is not installed in this gallery build.',
    scoreCap: 52,
  },
  'assistant-ui': {
    tier: 'B',
    interactive: false,
    label: 'Verified package source',
    reason:
      'The npm package exports assistant chat primitives, but it is not installed in this gallery build.',
    scoreCap: 52,
  },
  'react-chatbotify': {
    tier: 'B',
    interactive: false,
    label: 'Verified package source',
    reason:
      'The npm package exports a React chatbot component, but it is not installed in this gallery build.',
    scoreCap: 52,
  },
  'react-chat-widget': {
    tier: 'B',
    interactive: false,
    label: 'Verified package source',
    reason:
      'The npm package exports a React chat widget, but it is not installed in this gallery build.',
    scoreCap: 52,
  },
  'rocket-chat-fuselage': {
    tier: 'C',
    interactive: false,
    label: 'UI primitives source',
    reason:
      'The package exports design-system primitives rather than a drop-in chat surface.',
    scoreCap: 42,
  },
  'vercel-ai': {
    tier: 'C',
    interactive: false,
    label: 'Hook source',
    reason:
      'The package exports chat hooks and transport primitives, not a prebuilt chat UI component.',
    scoreCap: 42,
  },
  'stream-source': {
    tier: 'D',
    interactive: false,
    label: 'Credential-gated hosted SDK',
    reason:
      'A Stream app, channel, and user token are required before the UI can render live data.',
    scoreCap: 28,
  },
  'sendbird-source': {
    tier: 'D',
    interactive: false,
    label: 'Credential-gated hosted SDK',
    reason:
      'A Sendbird app id, user id, and channel URL are required before the UI can render live data.',
    scoreCap: 28,
  },
  'cometchat-source': {
    tier: 'D',
    interactive: false,
    label: 'Credential-gated hosted SDK',
    reason:
      'CometChat app credentials are required before the UI kit can render live data.',
    scoreCap: 28,
  },
  'talkjs-source': {
    tier: 'D',
    interactive: false,
    label: 'Credential-gated hosted SDK',
    reason:
      'A TalkJS app id and conversation session are required before the chatbox can render live data.',
    scoreCap: 28,
  },
  'livechat-source': {
    tier: 'D',
    interactive: false,
    label: 'Credential-gated hosted widget',
    reason:
      'A LiveChat license is required before the hosted widget can render live data.',
    scoreCap: 28,
  },
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
  return getRendererCapability(rendererId).tier;
}

export function getRendererCapability(rendererId) {
  return {
    ...DEFAULT_RENDERER_CAPABILITY,
    ...(RENDERER_CAPABILITIES[rendererId] ?? {}),
    rendererId: rendererId ?? 'unknown',
  };
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
  const capability = getRendererCapability(rendererId);
  const liveTier = capability.tier;
  const livePoints = LIVE_TIER_POINTS[liveTier];
  const rawTotal =
    featurePoints + surfacePoints + recencyPoints + starsPoints + livePoints;
  const total =
    capability.scoreCap === undefined
      ? rawTotal
      : Math.min(rawTotal, capability.scoreCap);

  return {
    total,
    liveTier,
    capability,
    breakdown: {
      featurePoints,
      surfacePoints,
      recencyPoints,
      starsPoints,
      livePoints,
      rawTotal,
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
export const rendererCapabilities = RENDERER_CAPABILITIES;
