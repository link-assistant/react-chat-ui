# Case Study: Issue #1 - React Chat UI Research Demo Gallery

**Issue:** [#1](https://github.com/link-assistant/react-chat-ui/issues/1)  
**Pull request:** [#2](https://github.com/link-assistant/react-chat-ui/pull/2)  
**Date:** 2026-05-08  
**Status:** Implemented in this PR

## Executive Summary

Issue #1 asked for a practical way to evaluate React chat designs,
customization quality, fake data, Unicode storage, browser automation, and
screenshots in one pull request.

This PR turns the repository from the starter package template into
`@link-assistant/react-chat-ui`. It adds an eight-demo React chat gallery,
theme and language switchers, a Doublets-compatible Unicode data store,
browser-commander E2E coverage, a GitHub Pages verification workflow, and this
case study.

## Data Captured

| File                                        | Purpose                                                    |
| ------------------------------------------- | ---------------------------------------------------------- |
| `data/issue-1.json`                         | Full issue metadata                                        |
| `data/issue-1-comments.json`                | Latest issue comments                                      |
| `data/pr-2.json`                            | Pull request metadata and checks before implementation     |
| `data/pr-2-review-comments.json`            | Inline review comments                                     |
| `data/pr-2-conversation-comments.json`      | PR conversation comments                                   |
| `data/pr-2-reviews.json`                    | PR reviews                                                 |
| `data/npm-*.json`                           | npm package facts for candidate chat libraries and tooling |
| `data/github-doublets-*.json`               | GitHub metadata for Doublets repositories                  |
| `data/github-browser-commander.json`        | GitHub metadata for browser-commander                      |
| `data/github-action-*.json`                 | Current GitHub Pages and artifact action versions          |
| `data/npm-audit-*.json`                     | Dependency audit before and after transitive fixes         |
| `data/link-assistant-chat-code-search.json` | Related code search results under `link-assistant`         |

## Market Research

| Candidate              | Why it is represented                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Stream Chat React      | Hosted SDK with channel lists, messages, reactions, threads, uploads, indicators, and a v14 design refresh.         |
| Sendbird UIKit React   | Hosted UIKit with modules, providers, message search, read/delivery states, reactions, and customization resources. |
| CometChat React UI Kit | Prebuilt React components for chat, voice, video, theming, components, and localization.                            |
| TalkJS React           | Embedded React chat UI and conversation components for marketplace-style user messaging.                            |
| ChatScope Chat UI Kit  | Open-source React component kit for chat containers, lists, messages, inputs, and state integration.                |
| React Chat Elements    | Lightweight React chat UI package focused on reusable components.                                                   |
| Deep Chat React        | React wrapper for a configurable AI chat web component with files, speech, methods, and message customization.      |
| assistant-ui           | React primitives and state layers for AI assistant and copilot chat surfaces.                                       |

## Requirements Matrix

| Requirement                                             | Implementation                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Research React chat options and compare design quality  | `src/chat-demo-catalog.js` models eight researched chat profiles with features, configurable surfaces, and design recommendations.         |
| Render demo pages for each chat                         | `docs/chat-demos` is a Vite React app that renders every catalog profile from the same store.                                              |
| Show theme switcher by default                          | The toolbar exposes `light`, `dark`, and `contrast` themes for every selected demo.                                                        |
| Show language switcher by default                       | The toolbar exposes English, Spanish, and Japanese snapshots for every demo.                                                               |
| Use fake data store                                     | `createChatDemoStore()` hydrates all catalog messages from deterministic fake data.                                                        |
| Use Doublets in web via `doublets-web`                  | `createDoubletsWebUnicodeStore()` dynamically loads `doublets-web` and creates a `UnitedLinks` engine when the runtime supports it.        |
| Reproduce Unicode string storage experience             | `createDoubletsUnicodeStore()` encodes strings as Unicode code points and writes an ordered link chain, with multilingual and emoji tests. |
| Use browser-commander for demo coverage                 | `tests/e2e/chat-demos.e2e.js` launches Playwright through browser-commander and checks every demo.                                         |
| Execute tests locally and after GitHub Pages deploy     | `.github/workflows/chat-demos.yml` runs local E2E on PRs and repeats E2E against the deployed Pages URL on `main`.                         |
| Automatically generate screenshots                      | The E2E test writes `docs/screenshots/issue-1-chat-demos.png`; CI uploads the same file as an artifact.                                    |
| Store case study data under `docs/case-studies/issue-1` | This directory contains the captured data and implementation analysis.                                                                     |

## Solution Applied

1. Renamed the package metadata to `@link-assistant/react-chat-ui`.
2. Added React, Vite, `doublets-web`, browser-commander, and Playwright
   dependencies.
3. Replaced placeholder arithmetic exports with chat catalog, store, and
   Doublets Unicode storage APIs.
4. Added cross-runtime unit tests for catalog completeness, issue requirement
   coverage, Unicode encoding, ordered link storage, and `doublets-web`
   adapter construction.
5. Added the React demo gallery with theme and language controls, stable
   responsive layout, local bitmap preview media, and the fake data store.
6. Added browser-commander E2E tests that open every demo, switch controls,
   verify Unicode content, and generate a screenshot.
7. Added a GitHub Pages workflow that builds, tests, deploys, and verifies the
   deployed demo.
8. Added a minor changeset because the package API now has a real user-facing
   feature surface.

## Alternatives Considered

| Option                              | Tradeoff                                                                                                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Integrate every vendor SDK directly | Rejected for this PR. Hosted SDKs need app IDs, users, tokens, or service setup, which would make deterministic review difficult.                                 |
| Build only static screenshots       | Rejected. The issue asks for configurability and E2E checks, so interactive demos are more useful.                                                                |
| Make a plain HTML gallery           | Rejected. The repository is for React chat UI, and React/Vite keeps the demo close to the target framework.                                                       |
| Require `doublets-web` in all tests | Rejected. WebAssembly import behavior differs by runtime, so tests validate the same adapter through a compatible fake module and keep the package cross-runtime. |
| Use only Playwright                 | Rejected. The issue specifically requested browser-commander, so E2E uses browser-commander over Playwright.                                                      |

## Verification Plan

Local checks:

```sh
npm test
npm run demo:build
npm run test:e2e
npm run lint
npm run format:check
```

CI checks:

- Existing release workflow continues to run unit tests across Node, Bun, and
  Deno.
- `Chat demo pages` workflow runs the browser demo checks on PRs.
- On `main`, the workflow deploys `dist/chat-demos` to GitHub Pages and runs
  the same E2E test suite against the deployed URL.

## References

- [Stream Chat React docs](https://getstream.io/chat/docs/sdk/react/)
- [Sendbird UIKit for React docs](https://sendbird.com/docs/chat/uikit/v3/react/overview)
- [CometChat React UI Kit docs](https://www.cometchat.com/docs/ui-kit/react/overview)
- [TalkJS React docs](https://talkjs.com/docs/UI_Components/React/)
- [ChatScope docs](https://chatscope.io/docs/)
- [React Chat Elements docs](https://detaysoft.github.io/docs-react-chat-elements/)
- [Deep Chat installation docs](https://deepchat.dev/docs/installation/)
- [assistant-ui docs](https://www.assistant-ui.com/docs)
- [doublets-web npm package](https://www.npmjs.com/package/doublets-web)
- [browser-commander npm package](https://www.npmjs.com/package/browser-commander)
