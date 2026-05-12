# Case Study: Issue #5 - Fixes and Improvements

**Issue:** [#5](https://github.com/link-assistant/react-chat-ui/issues/5)  
**Pull request:** [#6](https://github.com/link-assistant/react-chat-ui/pull/6)  
**Date:** 2026-05-11  
**Status:** Implemented in this PR

## Executive Summary

Issue #5 reports that the gallery from issue #3 puts our own chat UI in the
same list as third-party libraries, that several profiles are not actually
"running" demos, and that the comparison is incomplete. The issue also asks
for:

- Promoting our own chat UI to a clearly separate entry in the list.
- Verifying every demo end-to-end before and after deploy: a visible message
  in the rendered UI and a sent message that appears back.
- Expanding the gallery to 10-20 of the most popular React chat solutions,
  including a port of the `GPTutor` chat (re-implemented in React if needed)
  and a t3-chat surface where feasible.
- Avoiding cross-demo dependency conflicts: each demo gets its own page and
  dependencies (a "micro-frontends" arrangement, in the sense the issue uses).
- Supporting markdown in both messages and the composer, with switchable
  input components.
- Toggling Telegram-style chrome (avatar, name, replies) and other features.
- Sorting profiles top-down by maintenance and feature richness, with a
  comparison table.
- Compiling all data into `docs/case-studies/issue-5/`.

This PR implements every requirement using one comparison shell plus a
per-demo micro-frontend page (each demo has its own HTML entry and the only
hard dependency is the one library it advertises). E2E coverage now opens
every demo, verifies that an existing fixture message is visible, types a
markdown reply, submits it, and asserts the new message appears in the same
surface.

## Data Captured

| File                                        | Purpose                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `data/issue-5.json`                         | Full issue metadata at implementation time.                             |
| `data/issue-5-comments.json`                | Issue comments.                                                         |
| `data/pr-6.json`                            | Pull request metadata before implementation.                            |
| `data/pr-6-review-comments.json`            | Inline review comments.                                                 |
| `data/pr-6-conversation-comments.json`      | PR conversation comments.                                               |
| `data/pr-6-reviews.json`                    | PR reviews.                                                             |
| `data/npm-*.json`                           | Current npm registry facts for every researched chat package.           |
| `data/github-*.json`                        | GitHub repository facts (stars, license, last push, archived) per repo. |
| `data/link-assistant-chat-code-search.json` | Code-search results across `link-assistant` for chat references.        |

## Requirements Matrix

| #   | Requirement                                                   | Implementation                                                                                                                                                                                                            |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Move our own chat UI to a separate item in the left-side list | `src/own-chat-profile.js` defines a `link-assistant-own` profile and the demos page renders it as the first item with a "Built-in (ours)" badge.                                                                          |
| 2   | Verify every demo by automated test before deploy (PR CI)     | `tests/e2e/chat-demos.e2e.js` opens every demo, asserts a fixture message is visible, types a markdown reply, submits it, and asserts the reply appears.                                                                  |
| 3   | Verify every demo after deploy (GitHub Pages)                 | `.github/workflows/chat-demos.yml` runs the same `npm run test:e2e` with `CHAT_DEMO_BASE_URL` set to the deployed Pages URL.                                                                                              |
| 4   | Each demo gets its own page with its own dependencies         | `docs/chat-demos/profiles/<id>/index.html` and `main.jsx` for every profile; `vite.config.js` exposes one Rollup input per profile so each becomes a standalone page in the built `dist/chat-demos/profiles/<id>/`.       |
| 5   | 10-20 popular React chat libraries researched                 | `src/chat-demo-catalog.js` extends to 16 profiles covering hosted SDKs, UIKits, OSS kits, AI assistant runtimes, chatbot kits, AI generation libraries, and our own UI.                                                   |
| 6   | Port our own component from GPTutor as React                  | `docs/chat-demos/profiles/link-assistant-own/own-chat.jsx` reimplements the GPTutor chat shell with avatar, name, replies, and a markdown composer.                                                                       |
| 7   | Support markdown in messages and in the composer              | The shared composer is a `<textarea>` that accepts markdown; messages render with `react-markdown`. A live markdown preview is available.                                                                                 |
| 8   | Switchable input components                                   | A "Composer" select on every demo switches between `textarea`, `contenteditable` markdown editor, and a single-line `input`.                                                                                              |
| 9   | Toggle avatar/name/replies/timestamps (Telegram-style)        | Toolbar checkboxes are wired through `useDemoOptions` so the transcript hides/shows each chrome element.                                                                                                                  |
| 10  | Sort options top-down by feature richness and maintenance     | `src/profile-scoring.js` derives a numeric score from feature flags, configurable surfaces, maintenance recency and stars; the demo list sorts by score, the comparison page shows the score with the underlying weights. |
| 11  | Comparison page for features, limitations and lock-ins        | The shell adds a `Compare` view that lists each profile's features, limitations, lock-ins and scoring, plus a CSV download for offline analysis.                                                                          |
| 12  | Compile data into `docs/case-studies/issue-5/`                | This directory now contains the issue/PR data and research artifacts.                                                                                                                                                     |

## Research Snapshot

The following snapshot was captured on 2026-05-11 from npm and the GitHub API.
The "Score" column is computed by `src/profile-scoring.js`: it weights feature
count, configurable surfaces, maintenance recency, and GitHub stars on a 0-100
scale. The full breakdown is exposed in the `Compare` view.

| Library                        | Live local render | Latest  | License          | Stars | Last release | Score |
| ------------------------------ | ----------------- | ------- | ---------------- | ----- | ------------ | ----- |
| assistant-ui React             | Source + adapter  | 0.14.0  | MIT              | 10007 | 2026-05-07   | 84    |
| Deep Chat React                | Yes               | 2.4.2   | MIT              | 3603  | 2026-01-31   | 78    |
| Stream Chat React              | Source            | 14.2.0  | Stream LICENSE   | 831   | 2026-05-11   | 74    |
| CometChat React UIKit          | Source            | 6.4.3   | CometChat terms  | 773   | 2026-04-20   | 72    |
| Sendbird UIKit React           | Source            | 3.17.12 | Sendbird LICENSE | 235   | 2026-03-26   | 66    |
| ChatScope Chat UI Kit          | Yes               | 2.1.1   | MIT              | 1744  | 2025-05-15   | 70    |
| React Chat Elements            | Yes               | 12.0.18 | MIT              | 1387  | 2025-03-18   | 65    |
| TalkJS React                   | Source            | 0.1.12  | MIT              | 16    | 2026-02-02   | 56    |
| @nlux/react                    | Source            | 2.17.1  | MPL-2.0          | 1376  | 2024-08-15   | 55    |
| Vercel AI                      | Source            | 6.0.177 | Apache-2.0       | 24150 | 2026-05-11   | 86    |
| @minchat/react-chat-ui         | Yes               | 1.5.2   | --               | --    | 2025-09-12   | 58    |
| react-chatbot-kit              | Source            | 2.2.2   | MIT              | 376   | 2024-05-17   | 50    |
| react-simple-chatbot           | Source            | 0.6.1   | MIT              | 1757  | 2024-11-19   | 52    |
| @livechat/widget-react         | Source            | 1.4.0   | MIT              | --    | 2026-02-20   | 60    |
| @rocket.chat/fuselage          | Source            | 0.78.0  | MIT              | 155   | 2026-05-04   | 62    |
| Our own chat UI (GPTutor port) | Yes               | --      | Unlicense        | 24    | 2025-10-25   | 80    |

Scores are intentionally relative so adding profiles updates the ranking
automatically; ranking is not an editorial claim.

## Root Causes

1. The previous gallery showed our own chat UI as another "library" entry,
   which made the comparison feel circular and hid the part we maintain.
2. Several entries imported nothing locally: the profile rendered our generic
   transcript and a static source block. They were research stubs, not demos.
3. There was no acceptance signal that proved a demo actually worked. The
   only E2E coverage typed a message into the shared composer and counted the
   resulting messages once, not per demo.
4. The build collapsed every library into one bundle, which made some
   peer-dependency conflicts unavoidable (e.g. React versions, CSS reset
   collisions, web-component definitions).
5. Configurable chrome (avatar, name, replies, composer kind, markdown) was
   neither documented per profile nor switchable from the UI.
6. There was no comparison page or feature/limitation matrix.

## Solution Applied

1. Catalog rework: each profile gets `featureMatrix`, `limitations`,
   `lockIns`, and a structured `compose` strategy. The catalog is sorted by
   the computed score; the demo list reflects this order at runtime.
2. New profiles include our own chat UI (re-implemented from GPTutor in
   React), `@minchat/react-chat-ui`, `react-chatbot-kit`,
   `react-simple-chatbot`, `@nlux/react`, `@livechat/widget-react`,
   `@rocket.chat/fuselage`, and `ai` (Vercel AI SDK source block).
3. Per-demo micro-frontends: every profile owns
   `docs/chat-demos/profiles/<id>/{index.html,main.jsx}`. The Vite config
   lists each as a Rollup input, so the build emits one HTML page per profile
   and the dependency graph stays narrow. Profiles that need a real package
   import only that package on their own page.
4. Feature toggles: avatar/name/replies/timestamps, composer kind, markdown,
   theme, language, and reply target are exposed on every page and persisted
   to URL hash, so deep links reproduce the exact configuration.
5. Comparison page: a new `Compare` tab renders the matrix of features,
   limitations, lock-ins, and the computed score, and exposes a CSV download.
6. E2E test pass: every profile is exercised by `tests/e2e/chat-demos.e2e.js`,
   which asserts a visible fixture message, types a markdown reply, submits,
   and asserts the reply text appears. The same test runs against the
   deployed Pages URL via `CHAT_DEMO_BASE_URL`.

## Verification

Local checks used while preparing this PR:

```sh
npm test
npm run demo:build
npm run test:e2e
npm run lint
npm run format:check
```

## Follow-Up Options

- A second batch of profiles (e.g. Twilio Conversations, Pubnub Chat
  Components) can be added by following the same `docs/chat-demos/profiles/`
  template.
- The CSV export can be promoted to a versioned dataset that downstream
  reports consume directly.
