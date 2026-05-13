# Case Study: Issue #8 - Demos, comparison, and scoring still look fake

- **Issue:** [#8](https://github.com/link-assistant/react-chat-ui/issues/8)
- **Pull request:** [#9](https://github.com/link-assistant/react-chat-ui/pull/9)
- **Date opened:** 2026-05-13
- **Status:** Addressed in PR #9 on branch `issue-8-a2094a5fad53`

## Executive Summary

Issue #8 is a follow-up on issues #1, #3, and #5. The previous deliverables
shipped a gallery, profile pages, e2e suite, and a Doublets-backed unicode
store, but a hands-on review found four real defects:

1. **Sending a new reply collapses the message markup** in the active
   integration preview. The new "local" bubble renders as a 1-2 character
   wide vertical column instead of a balanced chat bubble.
2. **12 of 16 profiles render a generic `OfflineAdapterPreview`.** That
   shared adapter is essentially the same fake UI for hosted SDKs (Stream,
   Sendbird, CometChat, TalkJS, LiveChat) and runtime SDKs (assistant-ui,
   nlux, Vercel AI SDK, MinChat, react-simple-chatbot, react-chatbot-kit,
   Rocket.Chat Fuselage). The user's complaint is correct: there is no real
   library code in the gallery for those profiles.
3. **The "benchmark / scoring" is half synthetic.** Render time, DOM nodes,
   and heap are real React Profiler values, but the ranking weight relies on
   a binary `liveBonus` (12 points if the profile uses one of four hard-coded
   renderer IDs). For libraries that do not run locally, the benchmark numbers
   are effectively identical because they all hit the same fake adapter.
4. **The compare page is hard to read.** It shows `"Yes"` / `"No"` literals
   in 12 feature columns and unstyled limitation / lock-in lists. There is no
   color or emoji encoding.

In addition the user pointed out the gallery is presented as a 1480 px wide
"card" inside a sea of whitespace, which wastes screen real estate, and
"Ranked libraries" can render with a stale ordering when the own-chat profile
is filtered into a different section.

## Captured Evidence

| File                                         | Purpose                                                             |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `data/issue-8.json`                          | Fresh issue #8 metadata (title, body, labels, created/updated).     |
| `data/issue-1.json`                          | Original "research best React chats" issue.                         |
| `data/issue-3.json`                          | "Our UI examples look fake, input is not working" predecessor.      |
| `data/issue-5.json`                          | "Fixes and improvements" predecessor with the comparison list ask.  |
| `data/pr-9.json`                             | PR #9 metadata snapshot (draft, WIP body).                          |
| `images/issue-8-failing-state.png`           | Screenshot embedded in issue #8 showing the collapse defect.        |
| `images/issue-8-fixed-gallery.png`           | Fixed gallery: full-width workspace, tier chips, no boxed shell.    |
| `images/issue-8-fixed-own-message.png`       | New local reply renders as a full bubble (no collapse).             |
| `images/issue-8-fixed-compare.png`           | Comparison page with emoji ✅/⚠️/❌ matrix and 🟢🟡🟠🔴 tier chips. |
| `images/issue-8-fixed-stream-hosted.png`     | Stream profile via HostedSourcePreview (real source + transcript).  |
| `images/issue-8-fixed-stream-after-send.png` | Stream hosted preview after sending a reply (no collapse).          |
| `images/issue-8-fixed-profile-page.png`      | Standalone profile-page route renders the same fix.                 |
| `data/profile-rendering-audit.md`            | Table mapping every profile to its renderer (real vs offline fake). |
| `data/research-notes.md`                     | Online research on each library's React entry point and benchmarks. |

The screenshot was verified by checking the PNG magic bytes
(`89 50 4E 47 0D 0A 1A 0A`) before visual inspection.

## Timeline

- **2026-04-** Issue #1 asks for visual demos and screenshots of the best
  React chat UIs.
- **2026-04-** Issue #3 reports that the demos look fake and the composer
  input is broken. The case study under `docs/case-studies/issue-3` and the
  first version of the gallery (PR not in this branch) addressed that.
- **2026-05-12** Issue #5 lands and asks for the own chat to be a separate
  entry, e2e tests on every demo, sorted libraries, and the comparison view.
  PR #6/#7 (already merged) addressed that. Case study in
  `docs/case-studies/issue-5`.
- **2026-05-13 07:50 UTC** Issue #8 opens with a screenshot showing the
  collapse defect, the fake adapter problem, the unreadable comparison, and
  the boxed layout complaint. PR #9 is opened in WIP state on the same day.

## Root Cause Analysis

### Defect 1 - "Local" bubble collapses on send

`docs/chat-demos/src/styles.css:732-738` declares for outgoing bubbles:

```css
.adapter-message.is-local {
  justify-self: end;
  grid-template-columns: minmax(0, 1fr) 36px;
  direction: rtl;
}

.adapter-message.is-local > * {
  direction: ltr;
}
```

The `direction: rtl` reverses the grid track placement so the avatar lands on
the right. But the `justify-self: end` on the outer message plus the
`max-width: 760px` on `.adapter-message` collapses the grid item: the
`minmax(0, 1fr)` track receives 0 px from the parent because the parent is
already content-sized in the RTL flow, leaving only the avatar's 36 px to
fill. Result: the bubble shrinks to the width of its content (the longest
unbreakable token, like a single character) which renders as the vertical
slice in the screenshot.

The same pattern in `.own-chat-message.is-local` would produce the same
defect, but the own-chat surface has `display: block` content with explicit
`grid-template-columns: minmax(0, 1fr) auto` and no `justify-self: end`,
so it is less affected.

**Fix:** replace `direction: rtl` with a real flexbox approach
(`flex-direction: row-reverse` for the row and `align-self: flex-end` for the
parent) and let the bubble itself use `max-width` rather than collapsing.

### Defect 2 - The same fake adapter is used for 12 of 16 profiles

`docs/chat-demos/src/demo-surfaces.jsx:309-348` falls back to
`OfflineAdapterPreview` for every rendererId other than `chatscope`,
`react-chat-elements`, `deep-chat`, and `own-chat`. The fallback renders the
adapter's own DOM rather than the real library, so all hosted SDKs and most
runtime SDKs look identical.

**Fix:** add real local surfaces for every library whose React entry point can
mount without external services. Concretely:

- `@minchat/react-chat-ui` - mounts purely client-side.
- `@nlux/react` - accepts an `adapter` prop; we can provide an in-memory
  echo adapter.
- `react-simple-chatbot` - takes a static `steps` array.
- `react-chatbot-kit` - takes a static `config` + parser + provider.
- `@rocket.chat/fuselage` - primitives, no service.
- `ai` (Vercel AI SDK) - `useChat` can be initialized with a static initial
  message list, no API call required for the static preview.
- `@assistant-ui/react` - exposes the primitives and an `useLocalRuntime`
  hook that does not require an external runtime.

Hosted SDKs that legitimately cannot run without credentials (`stream-chat-react`,
`@sendbird/uikit-react`, `@cometchat/chat-uikit-react`, `@talkjs/react`,
`@livechat/widget-react`) keep a clearly labelled "Hosted SDK source" panel
with the actual `import` and a small live preview rendered through the same
component (where the React component is exported separately from the network
adapter), and the source block remains the source of truth.

### Defect 3 - Scoring uses a binary live bonus

`src/profile-scoring.js:8-13` keeps a hard-coded `LIVE_RENDERER_IDS` set, and
the bonus is 12 points if the renderer is one of them, 0 otherwise. There
is no granularity for "renders locally with no service" vs "renders with a
hosted backend". We also do not feed measured render-time or DOM-node counts
into the ranking - those are display-only.

**Fix:** keep the scoring deterministic (so tests are stable) but split the
live bonus into tiers:

- Tier A (12 pts): local renderer with real package + working composer.
- Tier B (8 pts): local renderer that uses an offline adapter (echo / local
  runtime).
- Tier C (4 pts): hosted SDK with a non-interactive but real React surface.
- Tier D (0 pts): source-only credential-gated.

And expose the actual measured render-time, heap, DOM nodes in the comparison
table, so the user can compare libraries on observable numbers, not opinions.

### Defect 4 - Compare page is unreadable

`docs/chat-demos/src/main.jsx:357-435` renders feature support as the
strings `"Yes"` and `"No"` in plain table cells, and limitations / lock-ins
as small `<ul>` lists with no color or icon. There is no visual hierarchy.

**Fix:** render `✅` for supported, `⚠️` for partial, `❌` for missing,
plus row striping, score tier badge with a colored chip
(green / yellow / orange / red), and the measured render numbers as a
`metric` cell.

### Defect 5 - Boxed shell wastes space

`docs/chat-demos/src/styles.css:56-67` constrains the workspace to
`max-width: 1480px` with rounded corners, a 1px border, and a heavy
`box-shadow`, so on a 1920px-wide screen the user sees a card floating in a
grey field. The app shell adds `padding: 18px` around it, making the gutter
even larger.

**Fix:** the workspace should fill the viewport. Remove the max-width, the
heavy shadow, and the outer padding; keep a minimal inner padding for
breathing room. Move the demo content to a true 100% width grid.

## Requirements Matrix

| #   | Requirement                                                                         | Source      | Implementation in PR #9                                                                     |
| --- | ----------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| 1   | Fix the message-markup collapse on send                                             | Issue #8    | `styles.css` row-reverse + `align-self: flex-end`, removes RTL grid; verified by e2e.       |
| 2   | Replace the shared offline-adapter fake with real library renderers where possible  | Issue #8/#3 | New live surfaces for MinChat, NLUX, Vercel AI SDK, react-simple-chatbot, Rocket.Chat...    |
| 3   | Hosted-only SDKs (Stream, Sendbird, CometChat, TalkJS, LiveChat) must label clearly | Issue #8/#5 | `integration.mode` updated to "Hosted SDK source" and surface badge calls out credentials.  |
| 4   | Make the scoring/benchmark real, not "fake"                                         | Issue #8/#3 | Tiered live bonus, real measured render time / DOM nodes / heap displayed in compare cells. |
| 5   | Comparison page must use emoji color coding                                         | Issue #8    | ✅ / ⚠️ / ❌ + colored tier chip + render-time metric cell + lock-in/limitation chips.      |
| 6   | Stop wasting space with a boxed surround                                            | Issue #8    | Workspace fills the viewport; outer padding reduced to 0 on the shell.                      |
| 7   | Keep our own chat as a separate entry pinned at the top                             | Issue #5    | `chatDemoCatalog` still prepends `ownChatProfile` and the nav renders it under "Own chat".  |
| 8   | Every profile must have an isolated micro-frontend page                             | Issue #5    | `profiles/<id>.html` (auto-generated) keeps the per-library page with a working composer.   |
| 9   | E2E tests must catch input/render regressions                                       | Issue #3/#5 | `tests/e2e/chat-demos.e2e.js` exercises send + rendered text + score chip + collapse guard. |
| 10  | Capture research data in `docs/case-studies/issue-{id}`                             | Issue #1/#3 | This case study + `data/` + screenshot.                                                     |
| 11  | Add debug / verbose mode for follow-up triage                                       | Issue #3/#8 | `?debug=1` (or `localStorage.setItem('chatDemoDebug','1')`) enables a console event log.    |
| 12  | Update REQUIREMENTS.md from #1 + #3 + #5 + #8                                       | Issue #8    | `REQUIREMENTS.md` consolidates and tags every requirement with the originating issue.       |

## Proposed Solution Plan

1. Fix the CSS collapse (Defect 1) - smallest surface, blocks visual review.
2. Wire real library renderers (Defect 2). One renderer per library, gated
   behind `integration.rendererId` so the existing dispatcher stays intact.
3. Refactor scoring (Defect 3) and surface the measured render numbers.
4. Re-skin the comparison table with emoji + tier chip + metrics column.
5. Drop the workspace card chrome.
6. Add a `?debug=1` overlay that prints state transitions and feature toggle
   events; default OFF.
7. Re-run unit + e2e, capture before/after screenshots, update PR #9.

## Online Research Notes (summarised in `data/research-notes.md`)

- **assistant-ui** ships `useLocalRuntime` which is a pure in-memory runtime
  intended for tests / examples - no remote LLM needed
  (`@assistant-ui/react` ^0.14).
- **Vercel AI SDK** `useChat` accepts an `initialMessages` array and a
  `fetch` override; for a static preview the `fetch` can return a streamed
  static body or simply not be called.
- **react-simple-chatbot** runs entirely client-side; the `steps` prop is
  static.
- **react-chatbot-kit** runs entirely client-side; user-supplied parser and
  provider classes are plain JS.
- **@nlux/react** `AiChat` accepts an `adapter` whose `streamText` /
  `fetchText` we can implement in-process.
- **@minchat/react-chat-ui** components are presentational; they take
  `messages` + `currentUserId`.
- **@rocket.chat/fuselage** is a design-system primitives package - no
  service.
- **Stream / Sendbird / CometChat / TalkJS / LiveChat** legitimately need
  hosted accounts. We keep them as "Hosted SDK source" with the real import
  shown, no fake interactive surface.

## Reports Filed Upstream

No upstream defects were identified during this case study. The collapse,
adapter fallback, scoring binary, comparison layout, and boxed shell defects
are all internal to this repository.
