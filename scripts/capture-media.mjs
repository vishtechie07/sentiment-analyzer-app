/**
 * Captures UI screenshots and a demo GIF for all sentiment scenarios.
 *
 * Prerequisites:
 *   1. App running at BASE_URL (default http://localhost:8080)
 *   2. From this folder: npm install && npx playwright install chromium
 *
 * Usage:
 *   npm run capture
 *   BASE_URL=http://127.0.0.1:8080 npm run capture
 */

import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import GIFEncoder from 'gif-encoder-2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs', 'media');
const FRAMES_DIR = path.join(OUT_DIR, 'gif-frames');
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

const SCENARIOS = [
  {
    id: '01-home-empty',
    title: 'Home (empty state)',
    text: null,
    action: 'idle',
  },
  {
    id: '02-validation-error',
    title: 'Validation error (empty submit)',
    text: '',
    action: 'error',
  },
  {
    id: '03-positive-result',
    title: 'Positive sentiment',
    text: 'This product is absolutely wonderful! I love how easy it is to use and the support team was fantastic.',
    action: 'analyze',
  },
  {
    id: '04-negative-result',
    title: 'Negative sentiment',
    text: 'This was a terrible experience. The service was awful and I am extremely disappointed.',
    action: 'analyze',
  },
  {
    id: '05-neutral-result',
    title: 'Neutral sentiment',
    text: 'The package arrived on Tuesday. It contains the items listed in the order confirmation.',
    action: 'analyze',
  },
  {
    id: '06-history-populated',
    title: 'History with mixed results',
    text: null,
    action: 'history',
  },
];

const DEMO_FLOW = [
  { label: 'Start', text: null, waitMs: 800 },
  {
    label: 'Positive',
    text: 'This is absolutely wonderful and I am so happy!',
    waitMs: 1600,
  },
  {
    label: 'Negative',
    text: 'This is awful and I hate how poorly it works.',
    waitMs: 1600,
  },
  {
    label: 'Neutral',
    text: 'The meeting is scheduled for 3pm in room B.',
    waitMs: 1600,
  },
  { label: 'History', text: null, waitMs: 1200 },
];

function ensureDirs() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.endsWith('.png') || f.endsWith('.gif') || f.endsWith('.json')) {
      fs.unlinkSync(path.join(OUT_DIR, f));
    }
  }
  for (const f of fs.readdirSync(FRAMES_DIR)) {
    fs.unlinkSync(path.join(FRAMES_DIR, f));
  }
}

async function waitForApp(page) {
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await page.request.get(`${BASE_URL}/api/health`);
      if (res.ok()) return;
    } catch {
      // retry
    }
    await page.waitForTimeout(1000);
  }
  throw new Error(
    `App not reachable at ${BASE_URL}. Start it with: mvn spring-boot:run`
  );
}

async function clearAppState(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#textInput');
}

async function analyze(page, text) {
  await page.fill('#textInput', text);
  await page.click('#analyzeBtn');
  await Promise.race([
    page.waitForSelector('#resultsSection:not(.hidden)', { timeout: 30000 }),
    page.waitForSelector('#errorSection:not(.hidden)', { timeout: 30000 }),
  ]);
  await page.waitForTimeout(400);
}

async function triggerEmptyError(page) {
  await page.fill('#textInput', '');
  await page.click('#analyzeBtn');
  await page.waitForSelector('#errorSection:not(.hidden)', { timeout: 10000 });
  await page.waitForTimeout(300);
}

async function screenshot(page, filename) {
  const filePath = path.join(OUT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function captureScenarios(page) {
  const manifest = [];

  await clearAppState(page);
  const homePath = await screenshot(page, '01-home-empty.png');
  manifest.push({ ...SCENARIOS[0], file: path.basename(homePath) });

  await triggerEmptyError(page);
  const errPath = await screenshot(page, '02-validation-error.png');
  manifest.push({ ...SCENARIOS[1], file: path.basename(errPath) });

  // Hide error before continuing
  await page.click('#retryBtn');
  await page.waitForSelector('#errorSection.hidden', { timeout: 5000 }).catch(() => {});

  await analyze(
    page,
    SCENARIOS[2].text
  );
  const posPath = await screenshot(page, '03-positive-result.png');
  manifest.push({ ...SCENARIOS[2], file: path.basename(posPath) });

  await analyze(page, SCENARIOS[3].text);
  const negPath = await screenshot(page, '04-negative-result.png');
  manifest.push({ ...SCENARIOS[3], file: path.basename(negPath) });

  await analyze(page, SCENARIOS[4].text);
  const neuPath = await screenshot(page, '05-neutral-result.png');
  manifest.push({ ...SCENARIOS[4], file: path.basename(neuPath) });

  await page.evaluate(() => {
    document.getElementById('historyContainer')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(300);
  const histPath = await screenshot(page, '06-history-populated.png');
  manifest.push({ ...SCENARIOS[5], file: path.basename(histPath) });

  return manifest;
}

async function captureGifFrames(page) {
  await clearAppState(page);
  const frames = [];
  let idx = 0;

  const pushFrame = async (suffix) => {
    const name = `frame-${String(idx).padStart(3, '0')}-${suffix}.png`;
    const filePath = path.join(FRAMES_DIR, name);
    await page.screenshot({ path: filePath, fullPage: false });
    frames.push(filePath);
    idx += 1;
  };

  for (const step of DEMO_FLOW) {
    if (step.text) {
      await page.fill('#textInput', step.text);
      await pushFrame(`typed-${step.label.toLowerCase()}`);
      await page.click('#analyzeBtn');
      await page.waitForSelector('#resultsSection:not(.hidden)', { timeout: 30000 });
      await page.waitForTimeout(step.waitMs);
      await pushFrame(`result-${step.label.toLowerCase()}`);
    } else if (step.label === 'History') {
      await page.evaluate(() => {
        document.getElementById('historyContainer')?.scrollIntoView({
          behavior: 'instant',
          block: 'center',
        });
      });
      await page.waitForTimeout(step.waitMs);
      await pushFrame('history');
    } else {
      await page.waitForTimeout(step.waitMs);
      await pushFrame('home');
    }
  }

  return frames;
}

function loadPng(filePath) {
  const buffer = fs.readFileSync(filePath);
  return PNG.sync.read(buffer);
}

function resizeTo(png, width, height) {
  if (png.width === width && png.height === height) return png;
  const out = new PNG({ width, height });
  // nearest-neighbor crop/pad to keep encoder simple
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sx = Math.min(x, png.width - 1);
      const sy = Math.min(y, png.height - 1);
      const si = (png.width * sy + sx) << 2;
      const di = (width * y + x) << 2;
      out.data[di] = png.data[si];
      out.data[di + 1] = png.data[si + 1];
      out.data[di + 2] = png.data[si + 2];
      out.data[di + 3] = png.data[si + 3];
    }
  }
  return out;
}

async function buildGif(framePaths) {
  if (!framePaths.length) throw new Error('No GIF frames captured');

  const first = loadPng(framePaths[0]);
  const width = first.width;
  const height = first.height;
  const encoder = new GIFEncoder(width, height, 'neuquant', true);
  encoder.setDelay(900);
  encoder.setRepeat(0);
  encoder.start();

  for (const framePath of framePaths) {
    const png = resizeTo(loadPng(framePath), width, height);
    encoder.addFrame(png.data);
  }

  encoder.finish();
  const outPath = path.join(OUT_DIR, 'demo.gif');
  fs.writeFileSync(outPath, encoder.out.getData());
  return outPath;
}

async function main() {
  console.log(`Capturing media from ${BASE_URL}`);
  ensureDirs();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    await waitForApp(page);
    const manifest = await captureScenarios(page);
    const frames = await captureGifFrames(page);
    const gifPath = await buildGif(frames);

    const meta = {
      generatedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      screenshots: manifest,
      gif: path.basename(gifPath),
      frameCount: frames.length,
    };
    fs.writeFileSync(
      path.join(OUT_DIR, 'manifest.json'),
      JSON.stringify(meta, null, 2)
    );

    console.log(`Wrote ${manifest.length} screenshots + ${path.basename(gifPath)} to docs/media/`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
