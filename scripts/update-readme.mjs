/**
 * Injects / refreshes the Screenshots & Demo section in README.md
 * using files produced by capture-media.mjs (docs/media/manifest.json).
 *
 * Usage:
 *   npm run update-readme
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const README_PATH = path.join(ROOT, 'README.md');
const MANIFEST_PATH = path.join(ROOT, 'docs', 'media', 'manifest.json');

const START = '<!-- MEDIA:START -->';
const END = '<!-- MEDIA:END -->';

function buildSection(manifest) {
  const lines = [
    START,
    '## Screenshots & Demo',
    '',
    'Generated with `scripts/capture-media.mjs` (run while the app is up on port 8080).',
    '',
    '### Demo walkthrough',
    '',
    '![Sentiment Analyzer demo](docs/media/demo.gif)',
    '',
    'Covers: empty home → empty-input validation → positive / negative / neutral analysis → history.',
    '',
    '### Scenario screenshots',
    '',
  ];

  for (const shot of manifest.screenshots) {
    lines.push(`#### ${shot.title}`);
    lines.push('');
    lines.push(`![${shot.title}](docs/media/${shot.file})`);
    lines.push('');
    if (shot.text) {
      lines.push(`Example text: *${shot.text}*`);
      lines.push('');
    }
  }

  lines.push('<details>');
  lines.push('<summary>Regenerate media</summary>');
  lines.push('');
  lines.push('```bash');
  lines.push('# Terminal 1 — start the app');
  lines.push('mvn spring-boot:run');
  lines.push('');
  lines.push('# Terminal 2 — capture screenshots + GIF and refresh README');
  lines.push('cd scripts');
  lines.push('npm install');
  lines.push('npx playwright install chromium');
  lines.push('npm run media');
  lines.push('```');
  lines.push('');
  lines.push('</details>');
  lines.push('');
  lines.push(END);
  lines.push('');

  return lines.join('\n');
}

function upsertSection(readme, section) {
  const startIdx = readme.indexOf(START);
  const endIdx = readme.indexOf(END);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const after = readme.slice(endIdx + END.length).replace(/^\r?\n*/, '\n\n');
    return readme.slice(0, startIdx) + section + after;
  }

  // Insert after the first intro paragraph block (after Features heading if present)
  const featuresIdx = readme.indexOf('## Features');
  if (featuresIdx !== -1) {
    return (
      readme.slice(0, featuresIdx) +
      section +
      '\n' +
      readme.slice(featuresIdx)
    );
  }

  return `${readme.trimEnd()}\n\n${section}\n`;
}

function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(
      'Missing docs/media/manifest.json. Run: npm run capture'
    );
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const section = buildSection(manifest);
  const readme = fs.readFileSync(README_PATH, 'utf8');
  const next = upsertSection(readme, section);
  fs.writeFileSync(README_PATH, next);
  console.log('Updated README.md Screenshots & Demo section.');
}

main();
