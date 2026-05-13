# Case Study: Issue #10 - Stop Showing Integration Demos We Cannot Actually Show

- **Issue:** [#10](https://github.com/link-assistant/react-chat-ui/issues/10)
- **Pull request:** [#11](https://github.com/link-assistant/react-chat-ui/pull/11)
- **Date opened:** 2026-05-13
- **Status:** Addressed in PR #11 on branch `issue-10-5079f79e87d3`

## Executive Summary

Issue #10 correctly identified that several gallery entries still looked like
working demos even though their SDKs need hosted accounts, credentials, or
packages that are not installed in this repository. The old fallback rendered a
shared local transcript for those entries, which made Stream, Sendbird,
CometChat, TalkJS, LiveChat, assistant-ui, NLUX, and other profiles appear more
complete than they really were.

This PR changes the rule: a profile is interactive only when the gallery can
render a real local package surface. Otherwise the gallery shows the verified
source and disables the composer. Hosted SDKs remain in the comparison table,
but their scores are capped at the lowest tier because they cannot be used in
this gallery without external registration.

## Captured Evidence

| File                                        | Purpose                                                            |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `data/issue-10.json`                        | Fresh issue #10 metadata and full requirement text.                |
| `data/issue-10-comments.json`               | Issue comments; empty at capture time.                             |
| `data/pr-11.json`                           | PR #11 metadata, draft state, commits, and checks.                 |
| `data/pr-11-conversation-comments.json`     | PR conversation comments; empty at capture time.                   |
| `data/pr-11-review-comments.json`           | Inline review comments; empty at capture time.                     |
| `data/pr-11-reviews.json`                   | PR reviews; empty at capture time.                                 |
| `data/ci-runs-branch.json`                  | Recent CI runs for `issue-10-5079f79e87d3`.                        |
| `data/npm-*.json`                           | Fresh npm metadata for 20 React chat/component candidates.         |
| `data/github-*.json`                        | Fresh GitHub repository metadata for candidates with public repos. |
| `data/local-*.log`                          | Local unit, build, e2e, and repository check output.               |
| `../../screenshots/issue-10-chat-demos.png` | Browser screenshot showing a source-only integration state.        |

## Timeline

- **2026-05-08** Issue #1 asks for research-backed React chat demos, theme and
  language controls, Unicode fixture storage, browser tests, and case-study
  evidence.
- **2026-05-12** Issue #5 asks to separate the built-in chat from third-party
  libraries, expand the catalog to 10-20 profiles, and keep comparison data.
- **2026-05-13 07:50 UTC** Issue #8 reports fake-looking demos, binary scoring,
  collapsed sent messages, and an unreadable comparison view.
- **2026-05-13 13:21 UTC** Issue #10 narrows the remaining problem: external
  SDKs that require registration must not show fake local fallbacks, and reply
  visuals must appear only after an explicit reply selection.

## Requirements Matrix

| #   | Requirement                                                             | Implementation                                                                                                                                                        |
| --- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Do not show fake fallback demos for hosted or unavailable integrations. | `DemoSurface` now falls back to a source-only panel with `data-testid="integration-unavailable"` and no transcript.                                                   |
| 2   | Keep hosted SDKs in the comparison list, but rank them lowest.          | `profile-scoring.js` records renderer capabilities and caps credential-gated profiles at tier D / 28 points.                                                          |
| 3   | Compare 10-20 React chat packages using real source data.               | Catalog now covers 18 profiles; npm/GitHub snapshots for 20 candidates are saved under `data/`.                                                                       |
| 4   | Use examples close to each package's real usage.                        | Every source block contains the package import and minimal component usage; unavailable packages are not impersonated by local DOM.                                   |
| 5   | Use real measurements and scoring.                                      | React Profiler/DOM metrics remain live for local renderers; scoring separates live local packages, verified source, primitive/hook source, and credential-gated SDKs. |
| 6   | The built-in chat must not be first unless it deserves the score.       | `chatDemoCatalog` and `getComparisonMatrix()` sort by computed score; Deep Chat outranks the built-in profile.                                                        |
| 7   | Reply visuals must only render after selecting a reply target.          | Composed messages use `replyToId: null` by default; selecting a message through the reply action is required before a new reply block is emitted.                     |
| 8   | Download all related data and compile a case study.                     | Issue, PR, CI, npm, and GitHub data are committed under this folder.                                                                                                  |

## Root Causes

### Fake integration fallback

`docs/chat-demos/src/demo-surfaces.jsx` previously routed any unknown
`rendererId` to `OfflineAdapterPreview`. That preview rendered the repository's
own local message DOM for packages that were not installed and for SDKs that
need hosted credentials. E2E tests passed because they asserted against that
fallback surface, not against the real third-party integration.

**Fix:** remove the generic interactive fallback. Only installed local
renderers (`own-chat`, ChatScope, React Chat Elements, Deep Chat) can receive
composer messages. Everything else is source-only until the package is
installed or credentials are provided.

### Hosted SDKs scored too high

The previous score gave partial live credit to hosted source previews. Because
feature breadth, recency, and popularity were still high, Stream, Sendbird,
CometChat, TalkJS, and LiveChat could sit above usable local packages.

**Fix:** `getRendererCapability()` makes availability explicit. Credentialed
SDKs are non-interactive tier D and capped at 28 points. Public packages that
are verified but not installed are tier B and capped below live local packages.
Primitive/hook-only packages are tier C.

### Automatic reply visuals

`handleSend()` in both gallery and isolated profile pages set `replyToId` to
the last fixture message automatically. That created a reply block even when
the user never selected a reply target.

**Fix:** the composer now sends `replyToId: null` unless the user first clicks
a message's reply action. The selected target is shown in the composer and is
cleared after send.

## Fresh Package Research

Captured on 2026-05-13 from npm and GitHub APIs:

| Package                        | Version | GitHub stars | Gallery capability             |
| ------------------------------ | ------: | -----------: | ------------------------------ |
| `deep-chat-react`              |   2.4.2 |         3606 | Live local package             |
| `@chatscope/chat-ui-kit-react` |   2.1.1 |         1743 | Live local package             |
| `react-chat-elements`          | 12.0.18 |         1387 | Live local package             |
| `@assistant-ui/react`          |  0.14.0 |        10043 | Verified package source        |
| `@minchat/react-chat-ui`       |   1.5.2 |          n/a | Verified package source        |
| `react-simple-chatbot`         |   0.6.1 |         1757 | Verified package source        |
| `react-chatbotify`             |   2.5.0 |          438 | Verified package source        |
| `@nlux/react`                  |  2.17.1 |         1376 | Verified package source        |
| `react-chat-widget`            |   3.1.4 |         1572 | Verified package source        |
| `react-chatbot-kit`            |   2.2.2 |          376 | Verified package source        |
| `@rocket.chat/fuselage`        |  0.78.0 |          155 | UI primitives source           |
| `ai`                           | 6.0.180 |        24207 | Hook source                    |
| `stream-chat-react`            |  14.2.0 |          832 | Credential-gated hosted SDK    |
| `@sendbird/uikit-react`        | 3.17.12 |          235 | Credential-gated hosted UIKit  |
| `@cometchat/chat-uikit-react`  |   6.4.3 |          773 | Credential-gated hosted UIKit  |
| `@talkjs/react`                |  0.1.12 |           16 | Credential-gated hosted embed  |
| `@livechat/widget-react`       |   1.4.0 |           32 | Credential-gated hosted widget |

Additional candidates were captured but not added to the catalog because they
were less suitable for the requested React chat UI comparison:
`@livekit/components-react`, `react-chat-window`, and `react-bell-chat`.

## Reports Filed Upstream

No upstream defects were identified. The false availability, scoring, and reply
selection problems were internal to this repository.

## Verification

Local verification for this PR:

```sh
npm test
npm run demo:build
npm run test:e2e
npm run check
```

The E2E suite now verifies that source-only integrations render an unavailable
notice and disabled composer, while live local renderers still accept sent
messages.

The PR screenshot captures `@assistant-ui/react` as a verified source-only
entry with `data-testid="integration-unavailable"` and no local transcript or
sendable composer.
