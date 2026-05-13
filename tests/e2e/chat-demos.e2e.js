import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { launchBrowser, makeBrowserCommander } from 'browser-commander';
import { chatDemoCatalog, getRendererCapability } from '../../src/index.js';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const demoRoot = path.join(rootDir, 'docs/chat-demos');
const defaultScreenshotPath = path.join(
  rootDir,
  'docs/screenshots/issue-10-chat-demos.png'
);
const sourceOnlyNoticePattern =
  /required|not installed|not a|drop-in|primitive|hook|credential/i;

async function captureGalleryScreenshot({ page, screenshotPath }) {
  mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await selectDemoTab({ page, demoId: 'assistant-copilot' });
  await page.selectOption('[data-testid="theme-switcher"]', 'light');
  await page.selectOption('[data-testid="language-switcher"]', 'en');
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.evaluate(() => {
    globalThis.scrollTo(0, 0);
    for (const element of globalThis.document.querySelectorAll(
      '.demo-nav, main'
    )) {
      element.scrollTop = 0;
    }
  });
  await page.screenshot({ path: screenshotPath, fullPage: false });
}

async function getRenderedSurfaceText(surface) {
  return surface.evaluate((element) => {
    function collectText(node) {
      const parts = [];

      if (node.nodeType === 3) {
        parts.push(node.textContent ?? '');
      }

      if (node.shadowRoot) {
        parts.push(collectText(node.shadowRoot));
      }

      for (const child of node.childNodes) {
        parts.push(collectText(child));
      }

      return parts.join(' ');
    }

    return collectText(element).replace(/\s+/g, ' ').trim();
  });
}

async function exerciseProfilePage({ commander, page, demo, baseUrl }) {
  const capability = getRendererCapability(demo.integration.rendererId);
  const url = new URL(`profiles/${demo.id}.html`, baseUrl).href;
  await page.goto(url, { waitUntil: 'networkidle' });
  await commander.waitForSelector({
    selector: '[data-testid="chat-demo-app"]',
  });

  const renderedDemoId = await page
    .locator('[data-testid="chat-demo-app"]')
    .getAttribute('data-demo-id');
  const surface = page.locator('[data-testid="demo-surface"]');
  const beforeCount = Number(await surface.getAttribute('data-message-count'));

  assert.equal(renderedDemoId, demo.id);

  if (!capability.interactive) {
    const unavailable = await commander.isVisible({
      selector: '[data-testid="composer-unavailable"]',
    });
    const notice = await commander.textContent({
      selector: '[data-testid="integration-unavailable"]',
    });

    assert.equal(beforeCount, 0);
    assert.equal(unavailable, true);
    assert.match(notice, sourceOnlyNoticePattern);
    return;
  }

  const composerExists = await commander.isVisible({
    selector: '[data-testid="chat-composer-input"]',
  });
  assert.equal(composerExists, true);

  await page
    .locator('[data-testid="chat-composer-input"]')
    .fill(`mf send for ${demo.id}`);
  await page.locator('[data-testid="chat-composer-submit"]').click();

  const afterCount = Number(await surface.getAttribute('data-message-count'));
  const transcript = await getRenderedSurfaceText(surface);
  assert.equal(afterCount, beforeCount + 1);
  assert.match(transcript, new RegExp(`mf send for ${demo.id}`));
}

async function selectDemoTab({ page, demoId }) {
  await page.locator(`button[data-demo-id="${demoId}"]`).click();
}

async function exerciseToggles({ commander, page }) {
  await selectDemoTab({ page, demoId: 'link-assistant-own' });

  const before = await commander.count({
    selector: '[data-testid="demo-surface"] .own-chat-avatar',
  });

  await page.locator('[data-testid="toggle-showAvatar"]').click();
  await page.locator('[data-testid="toggle-showSenderName"]').click();

  const afterAvatars = await commander.count({
    selector: '[data-testid="demo-surface"] .own-chat-avatar',
  });
  const senderNames = await commander.count({
    selector:
      '[data-testid="demo-surface"] [data-testid="demo-message-author"]',
  });
  const replySelector =
    '[data-testid="demo-surface"] [data-testid="demo-message-reply"]';
  const repliesBeforeToggle = await commander.count({
    selector: replySelector,
  });

  assert.equal(afterAvatars, 0);
  assert.equal(senderNames, 0);

  assert.ok(
    repliesBeforeToggle > 0,
    'Reply chrome should render for messages with explicit reply targets'
  );

  await page.locator('[data-testid="toggle-showReplies"]').click();
  const repliesHidden = await commander.count({ selector: replySelector });
  assert.equal(repliesHidden, 0);

  await page.locator('[data-testid="toggle-showReplies"]').click();
  const repliesRestored = await commander.count({ selector: replySelector });
  assert.equal(repliesRestored, repliesBeforeToggle);

  await page.locator('[data-testid="toggle-showAvatar"]').click();
  await page.locator('[data-testid="toggle-showSenderName"]').click();

  const restored = await commander.count({
    selector: '[data-testid="demo-surface"] .own-chat-avatar',
  });

  assert.equal(restored, before);
}

async function exerciseLocale({ page }) {
  await page.selectOption('[data-testid="theme-switcher"]', 'dark');
  await page.selectOption('[data-testid="language-switcher"]', 'ja');
  await selectDemoTab({ page, demoId: 'link-assistant-own' });
  const appTheme = await page.locator('.app-shell').getAttribute('data-theme');
  const content = await getRenderedSurfaceText(
    page.locator('[data-testid="demo-surface"]')
  );
  assert.equal(appTheme, 'dark');
  assert.match(content, /独自|返信|機能/);
}

async function verifyComposerKind({ page, kind, expectedTag }) {
  await page.selectOption('[data-testid="composer-kind"]', kind);
  const tag = await page
    .locator('[data-testid="chat-composer-input"]')
    .evaluate((node) => node.tagName);
  assert.equal(tag, expectedTag);
}

async function exerciseDemo({ commander, page, demo }) {
  const capability = getRendererCapability(demo.integration.rendererId);
  await selectDemoTab({ page, demoId: demo.id });
  const title = await commander.textContent({
    selector: '.conversation-header h1',
  });
  const surface = page.locator('[data-testid="demo-surface"]');
  const beforeMessages = Number(
    await surface.getAttribute('data-message-count')
  );
  const themeVisible = await commander.isVisible({
    selector: '[data-testid="theme-switcher"]',
  });
  const languageVisible = await commander.isVisible({
    selector: '[data-testid="language-switcher"]',
  });
  const sourceCode = await commander.textContent({
    selector: '[data-testid="source-code"]',
  });

  assert.equal(title.trim(), demo.name);
  assert.equal(themeVisible, true);
  assert.equal(languageVisible, true);
  assert.match(sourceCode, /import/);

  if (!capability.interactive) {
    const unavailable = await commander.isVisible({
      selector: '[data-testid="composer-unavailable"]',
    });
    const notice = await commander.textContent({
      selector: '[data-testid="integration-unavailable"]',
    });

    assert.equal(beforeMessages, 0);
    assert.equal(unavailable, true);
    assert.match(notice, sourceOnlyNoticePattern);
    return;
  }

  assert.equal(beforeMessages, demo.messages.length);

  const probe = `e2e ${demo.id} **markdown** check`;
  await page.locator('[data-testid="chat-composer-input"]').fill('');
  await page.locator('[data-testid="chat-composer-input"]').fill(probe);
  await page.locator('[data-testid="chat-composer-submit"]').click();

  const surfaceCount = Number(await surface.getAttribute('data-message-count'));
  const transcript = await getRenderedSurfaceText(surface);

  assert.equal(
    surfaceCount,
    beforeMessages + 1,
    `expected one new message for ${demo.id}`
  );
  assert.match(transcript, /markdown check/);
}

const e2eContext = {
  baseUrl: null,
  browser: null,
  commander: null,
  page: null,
  viteServer: null,
};

async function setupDemoGallery() {
  if (process.env.CHAT_DEMO_BASE_URL) {
    e2eContext.baseUrl = process.env.CHAT_DEMO_BASE_URL;
  } else {
    e2eContext.viteServer = await createServer({
      root: demoRoot,
      server: { host: '127.0.0.1', port: 0 },
    });
    await e2eContext.viteServer.listen();
    e2eContext.baseUrl = e2eContext.viteServer.resolvedUrls.local[0];
  }

  const launched = await launchBrowser({
    engine: 'playwright',
    headless: process.env.HEADLESS !== 'false',
    args: ['--no-sandbox'],
  });
  e2eContext.browser = launched.browser;
  e2eContext.page = launched.page;
  e2eContext.commander = makeBrowserCommander({
    page: e2eContext.page,
    enableNavigationManager: false,
    enableNetworkTracking: false,
  });

  await e2eContext.page.goto(e2eContext.baseUrl, { waitUntil: 'networkidle' });
  await e2eContext.commander.waitForSelector({
    selector: '[data-testid="chat-demo-app"]',
  });
}

async function teardownDemoGallery() {
  if (e2eContext.commander) {
    await e2eContext.commander.destroy();
  }
  if (e2eContext.browser) {
    await e2eContext.browser.close();
  }
  if (e2eContext.viteServer) {
    await e2eContext.viteServer.close();
  }
}

async function assertSelectableDemoCount() {
  const renderedDemos = await e2eContext.commander.count({
    selector: '[data-testid="demo-tab"]',
  });

  assert.equal(renderedDemos, chatDemoCatalog.length);
}

async function assertGalleryFollowsScoreRanking() {
  const firstTabId = await e2eContext.page
    .locator('button[data-testid="demo-tab"]')
    .first()
    .getAttribute('data-demo-id');
  const ownEntry = chatDemoCatalog.find(
    (demo) => demo.id === 'link-assistant-own'
  );

  assert.equal(firstTabId, chatDemoCatalog[0].id);
  assert.notEqual(firstTabId, ownEntry.id);
  assert.ok(chatDemoCatalog[0].score.total > ownEntry.score.total);
}

async function exerciseEveryDemo() {
  for (const demo of chatDemoCatalog) {
    await exerciseDemo({
      commander: e2eContext.commander,
      page: e2eContext.page,
      demo,
    });
  }
}

async function assertExternalSingleSurface() {
  await selectDemoTab({ page: e2eContext.page, demoId: 'assistant-copilot' });

  const surfaceCount = await e2eContext.commander.count({
    selector: '[data-testid="demo-surface"]',
  });
  const ownChatFrames = await e2eContext.commander.count({
    selector: '.own-chat-frame',
  });
  const rendererId = await e2eContext.page
    .locator('[data-testid="demo-surface"]')
    .getAttribute('data-renderer-id');

  assert.equal(surfaceCount, 1);
  assert.equal(ownChatFrames, 0);
  assert.equal(rendererId, 'assistant-ui');
}

async function assertMarkdownSend() {
  await e2eContext.page.selectOption('[data-testid="language-switcher"]', 'en');
  await selectDemoTab({ page: e2eContext.page, demoId: 'deep-chat-ai' });

  const surface = e2eContext.page.locator('[data-testid="demo-surface"]');
  const beforeCount = Number(await surface.getAttribute('data-message-count'));
  await e2eContext.page
    .locator('[data-testid="chat-composer-input"]')
    .fill('**Ship it** after the screenshot passes.');
  await e2eContext.page.locator('[data-testid="chat-composer-submit"]').click();

  const afterCount = Number(await surface.getAttribute('data-message-count'));
  const content = await getRenderedSurfaceText(surface);

  assert.equal(afterCount, beforeCount + 1);
  assert.match(content, /Ship it/);
}

async function assertExplicitReplySelection() {
  await e2eContext.page.selectOption('[data-testid="language-switcher"]', 'en');
  await selectDemoTab({ page: e2eContext.page, demoId: 'link-assistant-own' });

  const replySelector =
    '[data-testid="demo-surface"] [data-testid="demo-message-reply"]';
  const beforeReplies = await e2eContext.commander.count({
    selector: replySelector,
  });

  await e2eContext.page
    .locator('[data-testid="chat-composer-input"]')
    .fill('Plain message without a reply target.');
  await e2eContext.page.locator('[data-testid="chat-composer-submit"]').click();

  const afterPlainSend = await e2eContext.commander.count({
    selector: replySelector,
  });
  assert.equal(afterPlainSend, beforeReplies);

  await e2eContext.page
    .locator('[data-testid="message-reply-action"]')
    .first()
    .click();
  const selectedReplyVisible = await e2eContext.commander.isVisible({
    selector: '[data-testid="selected-reply-target"]',
  });
  assert.equal(selectedReplyVisible, true);

  await e2eContext.page
    .locator('[data-testid="chat-composer-input"]')
    .fill('Replying after selecting a target.');
  await e2eContext.page.locator('[data-testid="chat-composer-submit"]').click();

  const afterSelectedReply = await e2eContext.commander.count({
    selector: replySelector,
  });
  assert.equal(afterSelectedReply, beforeReplies + 1);
}

async function assertComposerKinds() {
  await selectDemoTab({ page: e2eContext.page, demoId: 'link-assistant-own' });
  await verifyComposerKind({
    page: e2eContext.page,
    kind: 'input',
    expectedTag: 'INPUT',
  });
  await verifyComposerKind({
    page: e2eContext.page,
    kind: 'contenteditable',
    expectedTag: 'DIV',
  });
  await verifyComposerKind({
    page: e2eContext.page,
    kind: 'textarea',
    expectedTag: 'TEXTAREA',
  });
}

async function assertComparisonView() {
  await e2eContext.page.locator('[data-testid="view-tab-compare"]').click();
  await e2eContext.commander.waitForSelector({
    selector: '[data-testid="compare-view"]',
  });

  const rowCount = await e2eContext.commander.count({
    selector: '[data-testid="compare-row"]',
  });
  const compareText = await e2eContext.commander.textContent({
    selector: '[data-testid="compare-view"]',
  });

  assert.equal(rowCount, chatDemoCatalog.length);
  assert.match(compareText, /Limitations|Lock-ins|License/);

  await e2eContext.page.locator('[data-testid="view-tab-demo"]').click();
  await e2eContext.commander.waitForSelector({
    selector: '[data-testid="demo-surface"]',
  });
}

async function assertProfilePages() {
  for (const demo of chatDemoCatalog) {
    await exerciseProfilePage({
      commander: e2eContext.commander,
      page: e2eContext.page,
      demo,
      baseUrl: e2eContext.baseUrl,
    });
  }

  await e2eContext.page.goto(e2eContext.baseUrl, { waitUntil: 'networkidle' });
  await e2eContext.commander.waitForSelector({
    selector: '[data-testid="chat-demo-app"]',
  });
}

async function assertScreenshotCapture() {
  const screenshotPath =
    process.env.CHAT_DEMO_SCREENSHOT_PATH ?? defaultScreenshotPath;

  await selectDemoTab({ page: e2eContext.page, demoId: 'assistant-copilot' });
  await e2eContext.commander.waitForSelector({
    selector: '[data-testid="integration-unavailable"]',
  });
  await captureGalleryScreenshot({ page: e2eContext.page, screenshotPath });
  assert.equal(typeof screenshotPath, 'string');
}

describe('chat demo gallery e2e', () => {
  before(setupDemoGallery);
  after(teardownDemoGallery);

  it(
    'renders one selectable demo for every researched chat profile',
    assertSelectableDemoCount
  );
  it(
    'orders gallery entries by computed score',
    assertGalleryFollowsScoreRanking
  );
  it(
    'opens every demo and only sends through verified local renderers',
    exerciseEveryDemo
  );
  it(
    'renders an external demo as one active surface without duplicated own chat',
    assertExternalSingleSurface
  );
  it('switches theme and language without losing Unicode messages', async () => {
    await exerciseLocale({ page: e2eContext.page });
  });
  it(
    'sends a composed markdown reply into the active demo',
    assertMarkdownSend
  );
  it(
    'does not render reply chrome unless a reply target was selected',
    assertExplicitReplySelection
  );
  it('toggles avatars, sender name, timestamps, and reply chrome', async () => {
    await exerciseToggles({
      commander: e2eContext.commander,
      page: e2eContext.page,
    });
  });
  it(
    'switches the composer kind between textarea, input, and contenteditable',
    assertComposerKinds
  );
  it(
    'opens the comparison view with one row per profile',
    assertComparisonView
  );
  it(
    'opens isolated micro-frontend pages for every profile',
    assertProfilePages
  );
  it('captures a screenshot for PR review', assertScreenshotCapture);
});
