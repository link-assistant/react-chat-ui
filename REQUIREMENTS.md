# Requirements

This file consolidates every requirement raised in issues
[#1](https://github.com/link-assistant/react-chat-ui/issues/1),
[#3](https://github.com/link-assistant/react-chat-ui/issues/3),
[#5](https://github.com/link-assistant/react-chat-ui/issues/5), and the
follow-ups
[#8](https://github.com/link-assistant/react-chat-ui/issues/8) and
[#10](https://github.com/link-assistant/react-chat-ui/issues/10). Every item
links the originating issue and the implementation surface in PR #11 so the
project can be measured against the user's intent end-to-end.

Legend:

- ✅ delivered in this branch (`issue-10-5079f79e87d3`)
- 🟡 partially delivered / planned for an incremental commit on this branch
- ❌ not yet attempted

## 1. Gallery / surfaces

| #    | Requirement                                                                                          | Source              | Status | Implementation reference                                                                                                                                                                                 |
| ---- | ---------------------------------------------------------------------------------------------------- | ------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1  | Demo each popular React chat UI library with real imports, not a shared fake widget.                 | #1, #3, #5, #8, #10 | ✅     | `docs/chat-demos/src/demo-surfaces.jsx` renders live local package previews only for installed packages; all other entries show verified source and disable the composer instead of faking a transcript. |
| 1.2  | Each demo must render with the library's recommended theme and language switcher.                    | #1                  | ✅     | Theme/locale state lives in `App` (`docs/chat-demos/src/main.jsx`) and is applied to every `DemoSurface`.                                                                                                |
| 1.3  | Inputs must be functional where the demo is actually local; unavailable demos must not fake sending. | #3, #8, #10         | ✅     | The composer dispatches only when `rendererCapability.interactive` is true; source-only and credential-gated integrations render a disabled composer with the recorded reason.                           |
| 1.4  | Support markdown in messages AND in the input field. Multiple composer variants must be selectable.  | #5                  | ✅     | Three composers (`textarea`, `input`, `contenteditable`) wired in `Composer` with markdown rendered via `react-markdown` in every local surface.                                                         |
| 1.5  | Toggle avatars / display names / inline replies, similar to Telegram.                                | #5, #10             | ✅     | Header toggles drive avatar/name/reply visibility, and newly sent messages get a reply block only after the user selects a reply target.                                                                 |
| 1.6  | Each demo must have its own micro-frontend page so dependencies do not collide.                      | #5                  | ✅     | `docs/chat-demos/src/profile-page.jsx` renders the per-profile page; Vite builds one entry per profile.                                                                                                  |
| 1.7  | Each demo must be reachable as a separate item in the sidebar (including our own chat UI).           | #5                  | ✅     | The sidebar in `App` lists every profile and the own-chat profile sits alongside library profiles.                                                                                                       |
| 1.8  | Include our own React chat UI (re-implemented from GPTutor).                                         | #5                  | ✅     | `chatscopeCommunity` is replaced by the bespoke own-chat surface that lives in the repo.                                                                                                                 |
| 1.9  | Investigate and integrate the T3 chat component if a public library exists.                          | #5                  | 🟡     | Research recorded in `docs/case-studies/issue-8/data/research-notes.md`. T3 chat is not published as a standalone library on npm, so it is excluded with a documented note.                              |
| 1.10 | Expand the catalog to 10–20 of the most popular React chat solutions.                                | #5, #10             | ✅     | Catalog covers 18 profiles across `src/chat-demo-catalog.js` and `src/extended-chat-catalog.js`, backed by fresh npm and GitHub metadata under `docs/case-studies/issue-10/data`.                        |

## 2. Comparison / benchmark / scoring

| #   | Requirement                                                                                                            | Source  | Status | Implementation reference                                                                                                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Show a serious comparison of features, limitations, lock-in across every library.                                      | #3, #5  | ✅     | `CompareView` in `docs/chat-demos/src/main.jsx` renders a per-profile feature matrix, limitations, and lock-in chips.                                                                                       |
| 2.2 | Use color/emoji to make the comparison readable at a glance.                                                           | #8      | ✅     | Feature cells render ✅ / ⚠️ / ❌; tiers render a colored chip (A 🟢, B 🟡, C 🟠, D 🔴).                                                                                                                    |
| 2.3 | Show measured rendering performance (time + DOM nodes).                                                                | #3      | ✅     | React Profiler captures `actualDuration` and DOM node counts and they appear in the benchmark column.                                                                                                       |
| 2.4 | Show approximate memory usage per demo.                                                                                | #3      | ✅     | `performance.memory.usedJSHeapSize` is sampled when available; missing on Firefox/Safari, flagged with `n/a`.                                                                                               |
| 2.5 | Show source-code cost per library (lines of code + character count) so we can compare developer cost.                  | #3      | ✅     | `chatDemoSources` reports `linesOfCode` and `characters` for each profile; the compare table surfaces both.                                                                                                 |
| 2.6 | Show GitHub stars, last release time, license.                                                                         | #3      | ✅     | `chatDemoCatalog` records `repository`, `licenseId`, `stars`, `lastReleaseAt` (refreshed from the GitHub API at build time when credentials are available; otherwise the last successful snapshot is used). |
| 2.7 | Rank libraries with a scoring algorithm that surfaces feature-rich, actively-maintained, configurable ones at the top. | #5, #10 | ✅     | `src/profile-scoring.js` blends feature breadth, surface support, recency, popularity, and renderer capability; credential-gated profiles are capped at the lowest tier.                                    |
| 2.8 | The benchmark must not collapse to a binary "real or fake" multiplier.                                                 | #8, #10 | ✅     | Renderer capability separates live local packages, verified package source, primitive/hook source, and credential-gated unavailable demos.                                                                  |

## 3. UI / UX

| #   | Requirement                                                                               | Source  | Status | Implementation reference                                                                                                                                                                         |
| --- | ----------------------------------------------------------------------------------------- | ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3.1 | Fix message markup collapse on send: new bubbles must render correctly.                   | #8      | ✅     | `direction: rtl` removed from `.adapter-message.is-local` in `docs/chat-demos/src/styles.css`; we now use `flex-direction: row-reverse` on a flex row so author + bubble keep their natural box. |
| 3.2 | Use the full screen width; do not show a narrow boxed gallery surrounded by whitespace.   | #8      | ✅     | `.workspace` no longer caps width or applies a card shadow; sidebar and content share the viewport via CSS grid.                                                                                 |
| 3.3 | Provide a theme switcher (light + dark) and a language switcher.                          | #1      | ✅     | Implemented in the header (`App`) with `data-theme`/`data-locale` attributes propagated to surfaces.                                                                                             |
| 3.4 | Quality bar: e2e tests must verify every profile without faking unavailable integrations. | #5, #10 | ✅     | `tests/e2e/chat-demos.e2e.js` walks every profile, sends only through live local renderers, and asserts source-only entries expose an unavailable notice and disabled composer.                  |
| 3.5 | Generate screenshots automatically (browser-commander).                                   | #1      | ✅     | The e2e suite stores the PR screenshot at `docs/screenshots/issue-10-chat-demos.png`.                                                                                                            |

## 4. Data store

| #   | Requirement                                                                     | Source | Status | Implementation reference                                                                                                     |
| --- | ------------------------------------------------------------------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | Persist messages with the Doublets database (`doublets-rs` via `doublets-web`). | #1     | ✅     | `src/doublets-store.js` exposes `createDoubletsUnicodeStore` and is plugged into the App's message reducer.                  |
| 4.2 | Store unicode strings safely (link-cli style).                                  | #1     | ✅     | Unicode store uses UTF-32 codepoint links per the link-cli pattern; covered by unit tests in `tests/doublets-store.test.js`. |

## 5. Engineering hygiene

| #   | Requirement                                                                                                                 | Source              | Status | Implementation reference                                                                                       |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| 5.1 | Compile a case study under `docs/case-studies/issue-{id}` with timeline, requirements, root causes, and proposed solutions. | #1, #3, #5, #8, #10 | ✅     | `docs/case-studies/issue-10/README.md`.                                                                        |
| 5.2 | Search online and record external facts in the case study.                                                                  | #3, #10             | ✅     | Fresh npm, GitHub, issue, PR, and CI metadata are stored under `docs/case-studies/issue-10/data`.              |
| 5.3 | Add verbose / debug logging that is off by default.                                                                         | #3                  | ✅     | `?debug=1` query param turns on `console.debug`-style logs from `src/debug.js`; off by default.                |
| 5.4 | File upstream issues against third-party projects when a bug or missing capability is found.                                | #3                  | 🟡     | None filed yet; reproduction repros are tracked under `docs/case-studies/issue-8/data/upstream-candidates.md`. |
| 5.5 | Plan and execute everything in a single PR (PR #11) on branch `issue-10-5079f79e87d3`.                                      | #10                 | ✅     | All commits land on `issue-10-5079f79e87d3` and PR #11 is updated, not replaced.                               |
| 5.6 | Maintain `REQUIREMENTS.md` capturing every user requirement.                                                                | #8                  | ✅     | This file.                                                                                                     |

## Traceability matrix (summary)

- Issue #1 → §1.2, §1.6, §1.7, §3.3, §3.5, §4.1, §4.2, §5.1
- Issue #3 → §1.1, §1.3, §2.1, §2.3, §2.4, §2.5, §2.6, §5.2, §5.3, §5.4
- Issue #5 → §1.1, §1.4, §1.5, §1.6, §1.7, §1.8, §1.9, §1.10, §2.1, §2.7, §3.4, §3.5
- Issue #8 → §1.1, §2.2, §2.8, §3.1, §3.2, §5.6
- Issue #10 → §1.1, §1.3, §1.5, §1.10, §2.7, §2.8, §5.1, §5.2, §5.5
