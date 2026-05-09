# Case Study: Issue #3 - Real React Chat UI Comparison

**Issue:** [#3](https://github.com/link-assistant/react-chat-ui/issues/3)
**Pull request:** [#4](https://github.com/link-assistant/react-chat-ui/pull/4)
**Date:** 2026-05-09
**Status:** Implemented in this PR

## Executive Summary

Issue #3 reported that the demo gallery looked fake and that the input did not
work. The issue also asked for a more serious comparison of popular React chat
UI libraries, including real import paths, source code cost, maintenance facts,
rendering performance, memory signals, and e2e coverage.

The root bug was concrete: the gallery rendered a read-only input and a button
that never submitted messages. The broader comparison gap was also real: the
catalog named libraries, but the app did not import any library package or show
the code needed to mount one.

This PR adds a working markdown composer, live local adapters for packages that
can render with fixture data, source blocks for hosted SDKs that require
credentials, library metadata, render/heap/DOM metrics, and e2e coverage that
types and sends a message before taking the review screenshot.

## Data Captured

| File                                   | Purpose                                          |
| -------------------------------------- | ------------------------------------------------ |
| `data/issue-3.json`                    | Full issue metadata                              |
| `data/issue-3-comments.json`           | Issue comments, empty at implementation time     |
| `data/pr-4.json`                       | Pull request metadata before implementation      |
| `data/pr-4-review-comments.json`       | Inline review comments, empty at implementation  |
| `data/pr-4-conversation-comments.json` | PR discussion comments, empty at implementation  |
| `data/pr-4-reviews.json`               | PR reviews, empty at implementation              |
| `data/npm-*.json`                      | Current npm package facts for compared libraries |
| `data/github-*.json`                   | Current GitHub repository stars and activity     |

## Requirements Matrix

| Requirement                                          | Implementation                                                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Input should work                                    | `docs/chat-demos/src/main.jsx` keeps per-demo composed messages and appends submitted text.                         |
| Support markdown where possible                      | The shared transcript renders message text with `react-markdown`; the e2e test sends `**Ship it**`.                 |
| Use real imports of real libraries                   | The gallery imports ChatScope, React Chat Elements, and Deep Chat packages for live local previews.                 |
| Avoid fake hosted SDK sessions                       | Stream, Sendbird, CometChat, TalkJS, and assistant-ui are marked as credential/runtime gated and show exact source. |
| Show exact source code used or needed                | Each catalog entry carries a source snippet plus line and symbol counts.                                            |
| Compare maintenance/community                        | Each entry includes latest version, license, GitHub URL, stars, and last npm release date.                          |
| Show rendering performance and memory                | The app records React Profiler duration, heap estimate, and DOM node count per selected demo.                       |
| Add e2e coverage for broken input                    | `tests/e2e/chat-demos.e2e.js` fills the composer, submits it, and asserts a new message appears.                    |
| Capture visual proof                                 | The e2e screenshot is written to `docs/screenshots/issue-3-chat-demos.png`.                                         |
| Compile issue data under `docs/case-studies/issue-3` | This directory now contains the issue/PR data and research artifacts for issue #3.                                  |

## Library Research Snapshot

The metadata below was captured on 2026-05-09 UTC from npm and GitHub.

| Library                | Live in gallery         | Version | License                   | GitHub stars | Last npm release |
| ---------------------- | ----------------------- | ------- | ------------------------- | ------------ | ---------------- |
| Stream Chat React      | Credential-gated source | 14.1.0  | SEE LICENSE IN LICENSE    | 831          | 2026-05-04       |
| Sendbird UIKit React   | Credential-gated source | 3.17.12 | SEE LICENSE IN LICENSE.md | 235          | 2026-03-26       |
| CometChat React UI Kit | Credential-gated source | 6.4.3   | CometChat legal terms     | 771          | 2026-04-20       |
| TalkJS React           | Credential-gated source | 0.1.12  | MIT                       | 16           | 2026-02-02       |
| ChatScope Chat UI Kit  | Yes                     | 2.1.1   | MIT                       | 1745         | 2025-05-15       |
| React Chat Elements    | Yes                     | 12.0.18 | MIT                       | 1387         | 2025-03-18       |
| Deep Chat React        | Yes                     | 2.4.2   | MIT                       | 3601         | 2026-01-31       |
| assistant-ui React     | Runtime-gated source    | 0.14.0  | MIT                       | 9968         | 2026-05-07       |

## Root Causes

1. The composer was intentionally non-interactive: it used `readOnly` and a
   `type="button"` action, so no submit handler could append messages.
2. The gallery represented every library through the same local markup, so it
   could not show code cost, package behavior, or integration constraints.
3. The case-study folder for issue #3 contained stale data from another
   repository, so the repository did not preserve research for the actual issue.

## Solution Applied

1. Added real package dependencies for local-render candidates:
   `@chatscope/chat-ui-kit-react`, `react-chat-elements`, `deep-chat-react`,
   and `react-markdown`.
2. Aligned React and React DOM to 18.2.0 so `react-chat-elements` peer
   dependencies resolve cleanly in local and CI installs.
3. Expanded the catalog with maintenance metadata, integration mode/status,
   source code snippets, and code cost metrics.
4. Reworked the Vite demo into a comparison lab with a shared markdown
   transcript, working composer, live package preview, source viewer, and
   render/heap/DOM metrics.
5. Added unit coverage for metadata/source completeness and e2e coverage for
   input submission and source-code visibility.
6. Updated the screenshot path and workflow artifact to issue #3.

## Verification

Local checks used for this PR:

```sh
npm test
npm run demo:build
npm run test:e2e
npm run lint
npm run format:check
```

The e2e suite reproduces the original input bug by requiring
`[data-testid="chat-composer-input"]`, sending a markdown reply, and checking
that the rendered message count increases by one.

## Follow-Up Options

Credential-gated SDKs should be exercised in separate opt-in examples once
test credentials are available. Those examples should not fake hosted network
state; they should document required environment variables, seed data, and
cleanup steps.
