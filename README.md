# React Chat UI

React chat UI research demos with theme and language switching, fake chat data,
Unicode-safe Doublets storage, and browser-commander E2E verification.

## What Is Included

- Eight researched React chat profiles covering hosted SDKs, UIKit libraries,
  open-source component kits, and AI chat widgets.
- A Vite-powered demo gallery in `docs/chat-demos`.
- Theme and language controls rendered by default for every demo.
- A fake chat data store that encodes localized message strings as Unicode code
  points in a Doublets-compatible graph, with an async `doublets-web` loader.
- Browser-commander E2E tests that exercise every demo and generate a review
  screenshot.
- A case study for issue #1 in `docs/case-studies/issue-1`.

## Quick Start

```bash
npm install
npm test
npm run demo:dev
```

Open the Vite URL printed by `npm run demo:dev` to inspect the chat demos.

## Demo Commands

| Command              | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `npm run demo:dev`   | Start the React demo gallery locally           |
| `npm run demo:build` | Build static GitHub Pages assets into `dist/`  |
| `npm run test:e2e`   | Run browser-commander E2E tests and screenshot |
| `npm run test:all`   | Run unit tests and E2E tests                   |

The E2E screenshot is written to
`docs/screenshots/issue-1-chat-demos.png`.

## Package API

```js
import {
  createChatDemoStore,
  createDoubletsWebUnicodeStore,
  listChatDemoSummaries,
} from '@link-assistant/react-chat-ui';

const store = createChatDemoStore();
const demos = listChatDemoSummaries();
const snapshot = store.getDemoSnapshot({
  demoId: demos[0].id,
  languageId: 'ja',
  themeId: 'dark',
});

console.log(snapshot.messages[0].text);
```

`createDoubletsWebUnicodeStore()` dynamically imports `doublets-web` and uses
its `UnitedLinks` engine when available. In unsupported environments it can
fall back to the in-memory Doublets-compatible engine used by tests and demos.

## Verification

```bash
npm test
npm run demo:build
npm run test:e2e
npm run lint
npm run format:check
```

The `Chat demo pages` GitHub Actions workflow builds the demo, runs the
browser-commander checks locally, deploys the static build to GitHub Pages on
`main`, and runs the same E2E checks against the deployed URL.

## Research

The issue #1 case study includes captured issue/PR data, npm package metadata,
GitHub action version checks, requirements mapping, and solution plans:

- [Issue #1 case study](docs/case-studies/issue-1/README.md)
- [Chat demo gallery](docs/chat-demos/index.html)
