import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
  'docs/screenshots/issue-1-chat-demos.png'
);

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

  it('opens every demo with messages and default switchers', async () => {
    for (const demo of chatDemoCatalog) {
      await commander.clickButton({
        selector: `button[data-testid="demo-tab"]:has-text("${demo.name}")`,
      });
      const title = await commander.textContent({
        selector: '.conversation-header h1',
      });
      const messages = await commander.count({
        selector: '[data-testid="chat-message"]',
      });
      const themeVisible = await commander.isVisible({
        selector: '[data-testid="theme-switcher"]',
      });
      const languageVisible = await commander.isVisible({
        selector: '[data-testid="language-switcher"]',
      });

      assert.equal(title.trim(), demo.name);
      assert.equal(messages, demo.messages.length);
      assert.equal(themeVisible, true);
      assert.equal(languageVisible, true);
    }
  });

  it('switches theme and language without losing Unicode messages', async () => {
    await page.selectOption('[data-testid="theme-switcher"]', 'dark');
    await page.selectOption('[data-testid="language-switcher"]', 'ja');
    await commander.clickButton({
      selector:
        'button[data-testid="demo-tab"]:has-text("assistant-ui Copilot")',
    });

    const appTheme = await page
      .locator('.app-shell')
      .getAttribute('data-theme');
    const content = await commander.textContent({
      selector: '[data-testid="message-list"]',
    });

    assert.equal(appTheme, 'dark');
    assert.match(content, /未読|ツール結果|主なリスク/);
  });

  it('captures a screenshot for PR review', async () => {
    const screenshotPath =
      process.env.CHAT_DEMO_SCREENSHOT_PATH ?? defaultScreenshotPath;

    mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await page.selectOption('[data-testid="theme-switcher"]', 'light');
    await page.selectOption('[data-testid="language-switcher"]', 'ja');
    await page.setViewportSize({ width: 1440, height: 950 });
    await page.screenshot({ path: screenshotPath, fullPage: true });

    assert.equal(typeof screenshotPath, 'string');
  });
});
