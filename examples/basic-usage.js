/**
 * Basic usage example.
 *
 * Run with any runtime:
 * - Bun: bun examples/basic-usage.js
 * - Node.js: node examples/basic-usage.js
 * - Deno: deno run --allow-read examples/basic-usage.js
 */

import {
  createChatDemoStore,
  encodeUnicodeString,
  listChatDemoSummaries,
} from '../src/index.js';

const store = createChatDemoStore();
const firstDemo = listChatDemoSummaries()[0];
const snapshot = store.getDemoSnapshot({
  demoId: firstDemo.id,
  languageId: 'ja',
  themeId: 'dark',
});

console.log(`Loaded ${listChatDemoSummaries().length} chat demos.`);
console.log(`Selected: ${snapshot.name}`);
console.log(`Messages: ${snapshot.messages.length}`);
console.log(`Storage backend: ${snapshot.storage.backend}`);
console.log(`First message: ${snapshot.messages[0].text}`);
console.log(
  `Code points: ${encodeUnicodeString(snapshot.messages[0].text).length}`
);
