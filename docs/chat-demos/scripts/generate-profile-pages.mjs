#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chatDemoCatalog } from '../../../src/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const demoRoot = resolve(here, '..');
const profilesDir = resolve(demoRoot, 'profiles');

mkdirSync(profilesDir, { recursive: true });

const indexLinks = [];

for (const profile of chatDemoCatalog) {
  const entryName = `${profile.id}.jsx`;
  const htmlName = `${profile.id}.html`;
  const entryPath = resolve(profilesDir, entryName);
  const htmlPath = resolve(profilesDir, htmlName);

  writeFileSync(
    entryPath,
    `import { mountProfilePage } from '../src/profile-page.jsx';\nmountProfilePage(${JSON.stringify(profile.id)});\n`,
    'utf8'
  );

  writeFileSync(
    htmlPath,
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${profile.name} — React chat demo</title>
    <link rel="icon" type="image/png" href="../chat-demo-preview.png" />
    <meta name="description" content="${profile.marketPosition.replaceAll('"', '&quot;')}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./${entryName}"></script>
  </body>
</html>
`,
    'utf8'
  );

  indexLinks.push({
    id: profile.id,
    name: profile.name,
    href: `profiles/${htmlName}`,
    packageName: profile.packageName,
    integrationMode: profile.integration.mode,
  });
}

writeFileSync(
  resolve(profilesDir, 'index.json'),
  JSON.stringify(indexLinks, null, 2),
  'utf8'
);

console.log(`Generated ${chatDemoCatalog.length} profile pages.`);
