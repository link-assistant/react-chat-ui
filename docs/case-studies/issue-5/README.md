# Case Study: Issue #5 - Chat Demo Corrections

- **Issue:** [#5](https://github.com/link-assistant/react-chat-ui/issues/5)
- **Pull request:** [#7](https://github.com/link-assistant/react-chat-ui/pull/7)
- **Date:** 2026-05-12
- **Status:** Corrected in this PR

## Executive Summary

Issue #5 asked for the chat demo gallery to separate our own GPTutor-derived
chat UI from third-party demos, verify every demo with e2e tests, remove the
duplicated self-implemented transcript from every page, reduce the empty demo
space, sort libraries by a computed score, and keep the research data in this
case-study directory.

PR #6 built the initial gallery, but the follow-up issue comment on
2026-05-12 showed that the page still rendered our own chat transcript above
the active library preview. That made external demos look duplicated and hid
whether the selected integration really worked.

PR #7 fixes that by making each page render exactly one active
`DemoSurface`. The built-in chat remains pinned as its own left-nav entry, and
external profiles render either their real local package surface
(ChatScope, React Chat Elements, Deep Chat) or an interactive offline adapter
surface for libraries that require credentials/runtime services.

## Captured Evidence

| File                                    | Purpose                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| `data/issue-5.json`                     | Fresh GitHub issue metadata captured on 2026-05-12.                             |
| `data/issue-5-comments.json`            | Follow-up issue comment that reported duplicated rendering and missing sorting. |
| `data/pr-7.json`                        | Current PR metadata for this correction branch.                                 |
| `images/issue-5-initial.png`            | Original issue screenshot.                                                      |
| `images/issue-5-comment-1.png`          | Follow-up screenshot showing duplicated chat rendering.                         |
| `images/issue-5-comment-2.png`          | Second follow-up screenshot from the same report.                               |
| `data/npm-*.json`, `data/github-*.json` | Package and repository research retained from the original analysis.            |

The downloaded PNGs were verified by checking their PNG magic bytes before
visual inspection.

## Requirements Matrix

| Requirement                                          | Current implementation                                                                                                                                               |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep our own chat as a separate item                 | `link-assistant-own` stays pinned under "Own component"; it is not mixed into the ranked library section.                                                            |
| Remove duplicated own-chat rendering from every page | `docs/chat-demos/src/main.jsx` and `profile-page.jsx` now render only `<DemoSurface />`; the old shared transcript was removed.                                      |
| Make demos visibly work                              | `demo-surfaces.jsx` renders one surface per selected profile, including sendable offline adapter surfaces for credentialed/runtime profiles.                         |
| Verify all demos with e2e tests                      | `tests/e2e/chat-demos.e2e.js` opens every gallery profile and isolated profile page, sends a message, and asserts it appears in `[data-testid="demo-surface"]`.      |
| Reduce excessive white space                         | The demo grid now uses content-sized rows, 360px demo surfaces, and `align-content: start` for preview frames.                                                       |
| Sort external libraries by score                     | `profile-scoring.js` only grants live-render bonuses to real local renderers, and the nav renders external libraries in non-increasing score order with score chips. |
| Keep comparison data                                 | The comparison tab still exposes feature, limitation, lock-in, maintenance, and score rows for every profile.                                                        |
| Keep issue research in this repository               | Issue, comment, PR, npm, GitHub, and screenshot artifacts are stored under `docs/case-studies/issue-5/`.                                                             |

## Root Cause

The gallery had two separate message renderers in the main demo area: a custom
transcript for our own chat UI and a "Real integration preview" below it. The
composer appended messages to the shared transcript path, so e2e tests could
pass while the selected third-party surface was not the thing being verified.

Source-only and credentialed profiles also used labels that made them look
like static code blocks, even when the page could provide a local interactive
adapter surface. Finally, the scoring function gave a live-render bonus to
renderer IDs that were not actual local package renderers, which distorted the
ranked list.

## Fix Applied

- Added `docs/chat-demos/src/demo-surfaces.jsx` as the single rendering path
  for gallery and isolated profile pages.
- Removed the old duplicated transcript from `main.jsx` and `profile-page.jsx`.
- Added real local package renderers for ChatScope, React Chat Elements,
  Deep Chat, and the built-in own chat profile.
- Added an interactive offline adapter surface for Stream, Sendbird,
  CometChat, TalkJS, assistant-ui, Vercel AI SDK, Rocket.Chat Fuselage,
  LiveChat, NLUX, react-simple-chatbot, react-chatbot-kit, and similar
  profiles that cannot run against a hosted service without credentials.
- Updated catalog status text from "Source-only" to "Offline verified ..."
  where the page now verifies rendering and sending through the local adapter.
- Tightened scoring so only actual live local renderers get `liveBonus`.
- Updated e2e coverage to assert message counts and sent text on
  `[data-testid="demo-surface"]`, including shadow-DOM text collection for
  Deep Chat.
- Saved the review screenshot to
  `docs/screenshots/issue-5-chat-demos.png`.

## Current Ranking

The built-in component is pinned separately. The external section is sorted by
computed score:

| Rank | Profile                    | Score | Surface                         |
| ---- | -------------------------- | ----: | ------------------------------- |
| 1    | Deep Chat AI Widget        |    78 | Live local package              |
| 2    | Vercel AI SDK (useChat)    |    72 | Offline verified source demo    |
| 3    | assistant-ui Copilot       |    70 | Offline verified runtime demo   |
| 4    | ChatScope Community Room   |    68 | Live local package              |
| 5    | Stream Team Chat           |    67 | Offline verified SDK demo       |
| 6    | CometChat Support Desk     |    65 | Offline verified UIKit demo     |
| 7    | React Chat Elements        |    65 | Live local package              |
| 8    | Rocket.Chat Fuselage       |    64 | Offline verified primitive demo |
| 9    | Sendbird Marketplace Inbox |    63 | Offline verified UIKit demo     |
| 10   | LiveChat Widget            |    58 | Offline verified embed demo     |
| 11   | TalkJS Commerce Thread     |    57 | Offline verified embed demo     |
| 12   | MinChat React Chat UI      |    56 | Offline verified package demo   |
| 13   | react-simple-chatbot       |    50 | Offline verified source demo    |
| 14   | NLUX React                 |    46 | Offline verified adapter demo   |
| 15   | react-chatbot-kit          |    41 | Offline verified source demo    |

## Verification

Local checks for this correction:

```sh
npm test
npm run demo:build
npm run test:e2e
npm run check
```

The e2e suite now includes a regression test that selects an external demo and
asserts there is exactly one active demo surface and no `.own-chat-frame` on
that page.
