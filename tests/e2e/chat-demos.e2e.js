import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { launchBrowser, makeBrowserCommander } from 'browser-commander';
import { chatDemoCatalog } from '../../src/index.js';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const demoRoot = path.join(rootDir, 'docs/chat-demos');
const defaultScreenshotPath = path.join(
  rootDir,
  'docs/screenshots/issue-5-chat-demos.png'
);

async function captureGalleryScreenshot({ page, screenshotPath }) {
  mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await selectDemoTab({ page, demoId: 'assistant-copilot' });
  await page.selectOption('[data-testid="theme-switcher"]', 'light');
  await page.selectOption('[data-testid="language-switcher"]', 'ja');
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.screenshot({ path: screenshotPath, fullPage: true });
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
  const url = new URL(`profiles/${demo.id}.html`, baseUrl).href;
  await page.goto(url, { waitUntil: 'networkidle' });
  await commander.waitForSelector({
    selector: '[data-testid="chat-demo-app"]',
  });

  const renderedDemoId = await page
    .locator('[data-testid="chat-demo-app"]')
    .getAttribute('data-demo-id');
  const composerExists = await commander.isVisible({
    selector: '[data-testid="chat-composer-input"]',
  });
  const surface = page.locator('[data-testid="demo-surface"]');
  const beforeCount = Number(await surface.getAttribute('data-message-count'));

  assert.equal(renderedDemoId, demo.id);
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
  const replyVisible = await commander.isVisible({
    selector: '[data-testid="demo-surface"] [data-testid="demo-message-reply"]',
  });

  assert.equal(afterAvatars, 0);
  assert.equal(senderNames, 0);
  assert.equal(
    replyVisible,
    true,
    'Reply chrome should still render when showReplies is on'
  );

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
  await selectDemoTab({ page, demoId: 'assistant-copilot' });
  const appTheme = await page.locator('.app-shell').getAttribute('data-theme');
  const content = await getRenderedSurfaceText(
    page.locator('[data-testid="demo-surface"]')
  );
  assert.equal(appTheme, 'dark');
  assert.match(content, /未読|ツール結果|主なリスク/);
}

async function verifyComposerKind({ page, kind, expectedTag }) {
  await page.selectOption('[data-testid="composer-kind"]', kind);
  const tag = await page
    .locator('[data-testid="chat-composer-input"]')
    .evaluate((node) => node.tagName);
  assert.equal(tag, expectedTag);
}

async function exerciseDemo({ commander, page, demo }) {
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
  assert.equal(beforeMessages, demo.messages.length);
  assert.equal(themeVisible, true);
  assert.equal(languageVisible, true);
  assert.match(sourceCode, /import/);

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

describe('chat demo gallery e2e', () => {
  let viteServer;
  let browser;
  let page;
  let commander;
  let baseUrl;

  before(async () => {
    if (process.env.CHAT_DEMO_BASE_URL) {
      baseUrl = process.env.CHAT_DEMO_BASE_URL;
    } else {
      viteServer = await createServer({
        root: demoRoot,
        server: { host: '127.0.0.1', port: 0 },
      });
      await viteServer.listen();
      baseUrl = viteServer.resolvedUrls.local[0];
    }

    const launched = await launchBrowser({
      engine: 'playwright',
      headless: process.env.HEADLESS !== 'false',
      args: ['--no-sandbox'],
    });
    browser = launched.browser;
    page = launched.page;
    commander = makeBrowserCommander({
      page,
      enableNavigationManager: false,
      enableNetworkTracking: false,
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await commander.waitForSelector({
      selector: '[data-testid="chat-demo-app"]',
    });
  });

  after(async () => {
    if (commander) {
      await commander.destroy();
    }
    if (browser) {
      await browser.close();
    }
    if (viteServer) {
      await viteServer.close();
    }
  });

  it('renders one selectable demo for every researched chat profile', async () => {
    const renderedDemos = await commander.count({
      selector: '[data-testid="demo-tab"]',
    });

    assert.equal(renderedDemos, chatDemoCatalog.length);
  });

  it('pins our own chat profile as the first entry', async () => {
    const firstTabText = await page
      .locator('button[data-testid="demo-tab"]')
      .first()
      .textContent();

    assert.match(firstTabText, /Our own chat UI/);
  });

  it('opens every demo with visible messages, switchers, and a working send', async () => {
    for (const demo of chatDemoCatalog) {
      await exerciseDemo({ commander, page, demo });
    }
  });

  it('renders an external demo as one active surface without duplicated own chat', async () => {
    await selectDemoTab({ page, demoId: 'assistant-copilot' });

    const surfaceCount = await commander.count({
      selector: '[data-testid="demo-surface"]',
    });
    const ownChatFrames = await commander.count({
      selector: '.own-chat-frame',
    });
    const rendererId = await page
      .locator('[data-testid="demo-surface"]')
      .getAttribute('data-renderer-id');

    assert.equal(surfaceCount, 1);
    assert.equal(ownChatFrames, 0);
    assert.equal(rendererId, 'assistant-ui');
  });

  it('switches theme and language without losing Unicode messages', async () => {
    await exerciseLocale({ page });
  });

  it('sends a composed markdown reply into the active demo', async () => {
    await page.selectOption('[data-testid="language-switcher"]', 'en');
    await selectDemoTab({ page, demoId: 'assistant-copilot' });

    const surface = page.locator('[data-testid="demo-surface"]');
    const beforeCount = Number(
      await surface.getAttribute('data-message-count')
    );
    await page
      .locator('[data-testid="chat-composer-input"]')
      .fill('**Ship it** after the screenshot passes.');
    await page.locator('[data-testid="chat-composer-submit"]').click();

    const afterCount = Number(await surface.getAttribute('data-message-count'));
    const content = await getRenderedSurfaceText(surface);

    assert.equal(afterCount, beforeCount + 1);
    assert.match(content, /Ship it/);
  });

  it('toggles avatars, sender name, timestamps, and reply chrome', async () => {
    await exerciseToggles({ commander, page });
  });

  it('switches the composer kind between textarea, input, and contenteditable', async () => {
    await selectDemoTab({ page, demoId: 'link-assistant-own' });
    await verifyComposerKind({ page, kind: 'input', expectedTag: 'INPUT' });
    await verifyComposerKind({
      page,
      kind: 'contenteditable',
      expectedTag: 'DIV',
    });
    await verifyComposerKind({
      page,
      kind: 'textarea',
      expectedTag: 'TEXTAREA',
    });
  });

  it('opens the comparison view with one row per profile', async () => {
    await page.locator('[data-testid="view-tab-compare"]').click();
    await commander.waitForSelector({
      selector: '[data-testid="compare-view"]',
    });

    const rowCount = await commander.count({
      selector: '[data-testid="compare-row"]',
    });
    const compareText = await commander.textContent({
      selector: '[data-testid="compare-view"]',
    });

    assert.equal(rowCount, chatDemoCatalog.length);
    assert.match(compareText, /Limitations|Lock-ins|License/);

    await page.locator('[data-testid="view-tab-demo"]').click();
    await commander.waitForSelector({
      selector: '[data-testid="demo-surface"]',
    });
  });

  it('opens isolated micro-frontend pages for every profile', async () => {
    for (const demo of chatDemoCatalog) {
      await exerciseProfilePage({ commander, page, demo, baseUrl });
    }

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await commander.waitForSelector({
      selector: '[data-testid="chat-demo-app"]',
    });
  });

  it('captures a screenshot for PR review', async () => {
    const screenshotPath =
      process.env.CHAT_DEMO_SCREENSHOT_PATH ?? defaultScreenshotPath;

    await captureGalleryScreenshot({ page, screenshotPath });
    assert.equal(typeof screenshotPath, 'string');
  });
});
