---
'@link-assistant/react-chat-ui': minor
---

Real demo surfaces, tiered scoring, and a readable comparison view (issue
#8). Replaces the generic `OfflineAdapterPreview` fallback for hosted SDK
profiles with a `HostedSourcePreview` that shows the published source
alongside an offline transcript, fixes the message-collapse bug by
swapping the `direction: rtl` outgoing layout for a flexbox row-reverse,
removes the boxed 1480 px workspace shell, and adds emoji ✅/⚠️/❌ feature
badges plus 🟢🟡🟠🔴 tier chips to the comparison page. Live tier is now
computed from `renderId` (A: real local, B: offline echo, C: hosted source
preview, D: not yet wired) and added to `scoreProfile` so ranking
differentiates real React surfaces from source previews. Adds a `?debug=1`
verbose mode for the demo gallery and standalone profile pages.
